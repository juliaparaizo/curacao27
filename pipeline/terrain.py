"""Elevation, land/sea and land cover for one map, on a shared lat/lon grid.

Copernicus gives land heights, WorldCover the coastline and land cover, Terrarium the sea floor.
See DATA_SOURCES.md for why each one and what must be credited.
"""
from __future__ import annotations

import hashlib
import io
import json
import math
import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Iterator

import numpy as np
import rasterio
import requests
from PIL import Image
from rasterio.enums import Resampling
from rasterio.errors import WindowError
from rasterio.windows import Window, from_bounds
from scipy import ndimage

from .geocode import USER_AGENT

# avoids one LIST request per file opened over HTTP
os.environ.setdefault("GDAL_DISABLE_READDIR_ON_OPEN", "EMPTY_DIR")
os.environ.setdefault("CPL_VSIL_CURL_ALLOWED_EXTENSIONS", ".tif")

COPERNICUS = "https://copernicus-dem-30m.s3.amazonaws.com/{name}/{name}.tif"
WORLDCOVER = "https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/map/ESA_WorldCover_10m_2021_v200_{tile}_Map.tif"
TERRARIUM = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"

MAX_CELLS = 860          # longest side of the height grid, same as the O'ahu reference
CONTEXT_CELLS = 480      # the surroundings are seen from far away
FOREST_CLASS = 10
MIN_CELL_M = 25          # Copernicus is 30 m: finer cells add bytes, not detail
TEXTURE_SCALE = 4        # land cover and map texture pixels per height cell
WORLD_SIZE = 72.0        # longest map side in scene units; camera, fog and route sizes were tuned for this
BASE_EXAGGERATION = 4.0  # what worked for O'ahu
BASE_KM = 70.0
MAX_RELIEF_SHARE = 0.1   # tallest relief on screen, as a share of the map side
MIN_EXAGGERATION = 1.2
HEIGHT_STEP_M = 0.5      # stored as uint16 in steps of this size
SEA_LEVEL_TOLERANCE_M = 3
WATER_CLASSES = (0, 80)  # WorldCover: no data over open ocean, permanent water
MISSING_LAND_SHARE = 0.5
SPIKE_M = 60
TILE_PX = 256
TILE_WORKERS = 8
MERCATOR_M_PER_PX = 156543.03


class TerrainError(Exception):
    pass


def lon_steps(lon0: float, lon1: float, step: int) -> Iterator[tuple[int, float]]:
    """Yield (tile longitude, shift). Past 180 the tile wraps, and the read shifts with it."""
    start = math.floor(lon0 / step) * step
    for lon in range(start, math.ceil(lon1 / step) * step, step):
        shift = 360.0 if lon >= 180 else -360.0 if lon < -180 else 0.0
        yield lon - int(shift), shift


def copernicus_tiles(bbox: dict) -> list[tuple[str, float]]:
    tiles = []
    for lat in range(math.floor(bbox["lat0"]), math.ceil(bbox["lat1"])):
        for lon, shift in lon_steps(bbox["lon0"], bbox["lon1"], 1):
            ns, ew = ("N" if lat >= 0 else "S"), ("E" if lon >= 0 else "W")
            name = f"Copernicus_DSM_COG_10_{ns}{abs(lat):02d}_00_{ew}{abs(lon):03d}_00_DEM"
            tiles.append((COPERNICUS.format(name=name), shift))
    return tiles


def worldcover_tiles(bbox: dict) -> list[tuple[str, float]]:
    tiles = []
    for lat in range(math.floor(bbox["lat0"] / 3) * 3, math.ceil(bbox["lat1"] / 3) * 3, 3):
        for lon, shift in lon_steps(bbox["lon0"], bbox["lon1"], 3):
            ns, ew = ("N" if lat >= 0 else "S"), ("E" if lon >= 0 else "W")
            tile = f"{ns}{abs(lat):02d}{ew}{abs(lon):03d}"
            tiles.append((WORLDCOVER.format(tile=tile), shift))
    return tiles


def grid_size(km_x: float, km_y: float, max_cells: int = MAX_CELLS) -> tuple[int, int]:
    cells = min(max_cells, 1000 * max(km_x, km_y) / MIN_CELL_M)
    side = max(km_x, km_y)
    return int(round(cells * km_x / side)), int(round(cells * km_y / side))


def exaggeration(side_km: float, relief_km: float) -> float:
    """Bigger maps need more lift to read as relief, but tall ranges must not turn into spikes."""
    by_size = BASE_EXAGGERATION * math.sqrt(side_km / BASE_KM)
    by_relief = MAX_RELIEF_SHARE * side_km / max(relief_km, 0.01)
    return max(MIN_EXAGGERATION, min(by_size, by_relief))


def tile_exists(url: str) -> bool:
    """A missing file means open ocean or an unreleased tile. A network failure must stop the build."""
    status = requests.head(url, headers={"User-Agent": USER_AGENT}, timeout=30).status_code
    if status in (403, 404):
        return False
    if status != 200:
        raise TerrainError(f"{url} answered HTTP {status}")
    return True


def read_tile(url: str, shift: float, bbox: dict, width: int, height: int,
              resampling: Resampling, dtype: str) -> tuple[int, int, np.ndarray] | None:
    """Read the part of one tile inside the grid. Returns (row, col, pixels), or None if it does not exist."""
    if not tile_exists(url):
        return None
    with rasterio.open(url) as src:
        wanted = from_bounds(bbox["lon0"] - shift, bbox["lat0"], bbox["lon1"] - shift, bbox["lat1"], src.transform)
        try:
            part = wanted.intersection(Window(0, 0, src.width, src.height))
        except WindowError:
            return None
        # floor and ceil: neighboring tiles overlap by a pixel instead of leaving a gap between them
        col0 = math.floor((part.col_off - wanted.col_off) / wanted.width * width)
        row0 = math.floor((part.row_off - wanted.row_off) / wanted.height * height)
        cols = min(width, math.ceil((part.col_off + part.width - wanted.col_off) / wanted.width * width)) - col0
        rows = min(height, math.ceil((part.row_off + part.height - wanted.row_off) / wanted.height * height)) - row0
        # reading into a smaller shape makes GDAL use the file's overviews: 30x faster than warping
        return row0, col0, src.read(1, window=part, out_shape=(rows, cols), resampling=resampling, out_dtype=dtype)


def read_tiles(tiles: list[tuple[str, float]], bbox: dict, width: int, height: int,
               resampling: Resampling, dtype: str) -> np.ndarray:
    """Mosaic tiles onto the grid. Missing tiles stay 0."""
    with ThreadPoolExecutor(TILE_WORKERS) as pool:
        parts = list(pool.map(lambda t: read_tile(t[0], t[1], bbox, width, height, resampling, dtype), tiles))
    out = np.zeros((height, width), dtype=dtype)
    for part in filter(None, parts):
        row, col, pixels = part
        target = out[row:row + pixels.shape[0], col:col + pixels.shape[1]]
        target[pixels != 0] = pixels[pixels != 0]
    return out


def fetch_terrarium(z: int, x: int, y: int) -> np.ndarray:
    url = TERRARIUM.format(z=z, x=x % 2 ** z, y=y)
    response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=30)
    response.raise_for_status()
    rgb = np.asarray(Image.open(io.BytesIO(response.content)).convert("RGB"), dtype=float)
    return rgb[..., 0] * 256 + rgb[..., 1] + rgb[..., 2] / 256 - 32768


def mercator_x(lon: np.ndarray | float, z: int) -> np.ndarray | float:
    return (lon + 180) / 360 * 2 ** z


def mercator_y(lat: np.ndarray, z: int) -> np.ndarray:
    return (1 - np.arcsinh(np.tan(np.radians(lat))) / np.pi) / 2 * 2 ** z


def terrarium_zoom(bbox: dict, width: int) -> int:
    meters = bbox["km_x"] * 1000 / width
    zoom = math.log2(MERCATOR_M_PER_PX * math.cos(math.radians(bbox["lat0"])) / meters)
    return min(12, max(1, math.ceil(zoom)))


def read_terrarium(bbox: dict, width: int, height: int) -> np.ndarray:
    z = terrarium_zoom(bbox, width)
    lons = np.linspace(bbox["lon0"], bbox["lon1"], width)
    lats = np.linspace(bbox["lat1"], bbox["lat0"], height)
    x0, x1 = math.floor(mercator_x(lons[0], z)), math.floor(mercator_x(lons[-1], z))
    y0, y1 = int(mercator_y(lats[0], z)), int(mercator_y(lats[-1], z))
    mosaic = np.vstack([np.hstack([fetch_terrarium(z, x, y) for x in range(x0, x1 + 1)]) for y in range(y0, y1 + 1)])
    median = ndimage.median_filter(mosaic, size=3)
    clean = np.where(np.abs(mosaic - median) > SPIKE_M, median, mosaic)  # the tiles carry isolated bad pixels
    grid_y, grid_x = np.meshgrid((mercator_y(lats, z) - y0) * TILE_PX, (mercator_x(lons, z) - x0) * TILE_PX, indexing="ij")
    return ndimage.map_coordinates(clean, [grid_y, grid_x], order=1)


def surface(bbox: dict, kind: str, width: int, height: int) -> tuple[np.ndarray, np.ndarray, list[str]]:
    """Return (land cover at texture size, heights in meters, notes)."""
    tex_w, tex_h = width * TEXTURE_SCALE, height * TEXTURE_SCALE
    if kind == "overview":
        # a whole trip can span hundreds of 1 degree tiles: one low-zoom source is enough at this scale
        heights = read_terrarium(bbox, width, height).astype("float32")
        cover = np.where(heights > 0, FOREST_CLASS, 0).astype("uint8")
        return np.kron(cover, np.ones((TEXTURE_SCALE, TEXTURE_SCALE), dtype="uint8")), heights, []
    classes = read_tiles(worldcover_tiles(bbox), bbox, tex_w, tex_h, Resampling.nearest, "uint8")
    if kind == "context":
        return classes, read_terrarium(bbox, width, height).astype("float32"), []
    heights = read_tiles(copernicus_tiles(bbox), bbox, width, height, Resampling.bilinear, "float32")
    land = ~np.isin(classes[TEXTURE_SCALE // 2 :: TEXTURE_SCALE, TEXTURE_SCALE // 2 :: TEXTURE_SCALE], WATER_CLASSES)
    if land.any() and (land & (heights == 0)).sum() > MISSING_LAND_SHARE * land.sum():
        # some countries have no public Copernicus tiles
        return classes, read_terrarium(bbox, width, height).astype("float32"), [
            "Copernicus has no data here, using Terrain Tiles for land heights"]
    return classes, heights, []


def build_terrain(bbox: dict, kind: str = "map") -> tuple[dict, list[str]]:
    """Return (arrays and meta, notes). kind: map, context (surroundings) or overview (whole trip)."""
    width, height = grid_size(bbox["km_x"], bbox["km_y"], CONTEXT_CELLS if kind == "context" else MAX_CELLS)
    classes, heights, notes = surface(bbox, kind, width, height)
    water = np.isin(classes[TEXTURE_SCALE // 2 :: TEXTURE_SCALE, TEXTURE_SCALE // 2 :: TEXTURE_SCALE], WATER_CLASSES)
    sea = water & (heights < SEA_LEVEL_TOLERANCE_M)
    any_sea = bool(sea.any())
    depth = (np.minimum(heights, 0) if kind != "map" else np.minimum(read_terrarium(bbox, width, height), 0)) if any_sea \
        else np.zeros_like(heights)
    land_heights = np.where(sea, 0.0, np.maximum(heights, HEIGHT_STEP_M))  # polders sit below sea level, still land
    low, top = (np.percentile(land_heights[~sea], [1, 99.9]) if (~sea).any() else (0.0, 0.0))
    side_km = max(bbox["km_x"], bbox["km_y"])
    meta = {
        "NX": width, "NY": height, "lat0": bbox["lat0"], "lat1": bbox["lat1"], "lon0": bbox["lon0"], "lon1": bbox["lon1"],
        "km_x": bbox["km_x"], "km_y": bbox["km_y"], "scale": WORLD_SIZE / side_km,
        "exaggeration": round(exaggeration(side_km, float(top - low) / 1000), 2), "height_step_m": HEIGHT_STEP_M,
        "height_range": [float(low), float(top)], "max_m": float(land_heights.max()), "has_sea": any_sea,
        "sea_share": round(float(sea.mean()), 3),
        "open_border": bool((~sea[0]).any() or (~sea[-1]).any() or (~sea[:, 0]).any() or (~sea[:, -1]).any()),
    }
    return {"meta": meta, "heights": land_heights.astype("float32"), "sea": sea, "depth": depth.astype("float32"),
            "classes": classes}, notes


def cached_terrain(bbox: dict, cache_dir: Path, kind: str = "map") -> tuple[dict, list[str]]:
    key = hashlib.sha1(json.dumps([bbox, kind], sort_keys=True).encode()).hexdigest()[:16]
    path = cache_dir / f"terrain-{key}.npz"
    if path.exists():
        with np.load(path, allow_pickle=False) as data:
            arrays = {name: data[name] for name in ("heights", "sea", "depth", "classes")}
            return {**arrays, "meta": json.loads(str(data["meta"]))}, []
    terrain, notes = build_terrain(bbox, kind)
    cache_dir.mkdir(parents=True, exist_ok=True)
    arrays = {k: v for k, v in terrain.items() if k != "meta"}
    np.savez_compressed(path, meta=json.dumps(terrain["meta"]), **arrays)
    return terrain, notes


def write_terrain(terrain: dict, out_dir: Path, name: str = "") -> None:
    """Binary files for the site: heights in steps (0 = sea) and distance from the coast in cells."""
    out_dir.mkdir(parents=True, exist_ok=True)
    steps = np.clip(np.round(terrain["heights"] / HEIGHT_STEP_M), 0, 65535).astype("<u2")
    from_coast = np.clip(ndimage.distance_transform_edt(terrain["sea"]), 0, 255).astype("u1")
    (out_dir / f"{name}heights.bin").write_bytes(steps.tobytes())
    (out_dir / f"{name}coast.bin").write_bytes(from_coast.tobytes())
    (out_dir / f"{name}dem.json").write_text(json.dumps(terrain["meta"]), encoding="utf-8")

"""Place trees, palms and buildings from land cover, and list what the 3D scene needs."""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from scipy import ndimage

from .terrain import TEXTURE_SCALE, WATER_CLASSES
from .texture import BUILT, TREE

MAX_TREES = 7000
MAX_PALMS = 1100
MAX_FILLER_BUILDINGS = 2600
PALM_MAX_LATITUDE = 30
PALM_MAX_M = 12
PALM_COAST_PX = (4, 16)
CONIFER_START_LAT = 35
CONIFER_LAT_RANGE = 20
CONIFER_HEIGHT_M = 2500
RUNWAY_WIDTH_M = 60


def lat_lon(meta: dict, rows: np.ndarray, cols: np.ndarray, height: int, width: int) -> tuple[np.ndarray, np.ndarray]:
    lats = meta["lat1"] - (rows + 0.5) / height * (meta["lat1"] - meta["lat0"])
    lons = meta["lon0"] + (cols + 0.5) / width * (meta["lon1"] - meta["lon0"])
    return np.round(lats, 5), np.round(lons, 5)


def sample_pixels(mask: np.ndarray, limit: int, rng: np.random.Generator) -> tuple[np.ndarray, np.ndarray]:
    rows, cols = np.nonzero(mask)
    if len(rows) > limit:
        chosen = rng.choice(len(rows), limit, replace=False)
        rows, cols = rows[chosen], cols[chosen]
    return rows, cols


def conifer_share(lat: float, heights: np.ndarray) -> np.ndarray:
    return np.clip((abs(lat) - CONIFER_START_LAT) / CONIFER_LAT_RANGE + heights / CONIFER_HEIGHT_M, 0, 0.9)


def build_scene(terrain: dict, vectors: dict) -> dict:
    meta, classes = terrain["meta"], terrain["classes"]
    height, width = classes.shape
    rng = np.random.default_rng(7)
    heights = ndimage.zoom(terrain["heights"], TEXTURE_SCALE, order=1, grid_mode=True, mode="nearest")[:height, :width]
    water = np.isin(classes, WATER_CLASSES)
    land = ~water
    inland = ndimage.distance_transform_edt(land)
    mid_lat = (meta["lat0"] + meta["lat1"]) / 2

    rows, cols = sample_pixels((classes == TREE) & (inland > 8), MAX_TREES, rng)
    lats, lons = lat_lon(meta, rows, cols, height, width)
    conifers = rng.random(len(rows)) < conifer_share(mid_lat, heights[rows, cols])
    trees = [[float(a), float(b), int(c)] for a, b, c in zip(lats, lons, conifers)]

    palms: list[list[float]] = []
    if abs(mid_lat) <= PALM_MAX_LATITUDE and meta["has_sea"]:
        low, high = PALM_COAST_PX
        rows, cols = sample_pixels(land & (inland > low) & (inland < high) & (heights < PALM_MAX_M), MAX_PALMS, rng)
        palms = [[float(a), float(b)] for a, b in zip(*lat_lon(meta, rows, cols, height, width))]

    buildings = vectors["buildings"]
    if not buildings:
        # big maps have no footprints: small boxes hint at towns from far away
        rows, cols = sample_pixels((classes == BUILT) & (inland > 6), MAX_FILLER_BUILDINGS, rng)
        buildings = [[float(a), float(b), 0.0, 0.0, 0.0, 0.0] for a, b in zip(*lat_lon(meta, rows, cols, height, width))]
    return {
        "trees": trees,
        "palms": palms,
        "buildings": buildings,
        "runways": [[line[0][::-1], line[-1][::-1], RUNWAY_WIDTH_M] for line in vectors["runways"]],
        "towns": [[t["name"], t["lat"], t["lon"]] for t in vectors["towns"]],
    }


def write_scene(scene: dict, out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "scene.json").write_text(json.dumps(scene, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

"""Paint the map texture: land cover, relief shading, water, roads. Colors come from the theme."""
from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

from .terrain import SEA_LEVEL_TOLERANCE_M, TEXTURE_SCALE, WATER_CLASSES

TREE, SHRUB, GRASS, CROP, BUILT, BARE, SNOW, WETLAND, MANGROVE, MOSS = 10, 20, 30, 40, 50, 60, 70, 90, 95, 100
ROAD_WIDTH_M = {"motorway": 5, "trunk": 5, "primary": 4, "secondary": 3, "tertiary": 2}
MINOR_ROAD_WIDTH = 1
BASE_TEXTURE_PX = 3440      # road and beach widths below were tuned at this size
MINOR_ROAD_ALPHA = 0.55
RUNWAY_WIDTH_M = 60
BEACH_MAX_M = 8
BEACH_PX = 4
SHADE_BASE, SHADE_LIGHT, SHADE_CURVE = 0.74, 0.36, 0.12
CURVE_GAIN = 5
DEPTH_BLUR_PX = 8
SEA_FADE_PX = 240
CONTEXT_FADE_PX = 110
EDGE_PX = 12
JPEG_QUALITY = 86


def rgb(color: str) -> np.ndarray:
    value = color.lstrip("#")
    return np.array([int(value[i:i + 2], 16) for i in (0, 2, 4)], dtype="float32") / 255


def mix(a: np.ndarray, b: np.ndarray, share: float) -> np.ndarray:
    return a * (1 - share) + b * share


def blend(image: np.ndarray, color: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    weight = alpha[..., None]
    return image * (1 - weight) + color * weight


def ramp(values: np.ndarray, stops: list[tuple[float, np.ndarray]]) -> np.ndarray:
    xs = [s[0] for s in stops]
    return np.stack([np.interp(values, xs, [s[1][i] for s in stops]) for i in range(3)], axis=-1).astype("float32")


def unwrap(lon: float, bbox: dict) -> float:
    """Bring a longitude into a box that may pass 180 on maps across the antimeridian."""
    if lon + 360 <= bbox["lon1"]:
        return lon + 360
    return lon - 360 if lon - 360 >= bbox["lon0"] else lon


def to_pixels(line: list[list[float]], bbox: dict, width: int, height: int) -> list[tuple[float, float]]:
    return [((unwrap(lon, bbox) - bbox["lon0"]) / (bbox["lon1"] - bbox["lon0"]) * width,
             (bbox["lat1"] - lat) / (bbox["lat1"] - bbox["lat0"]) * height) for lon, lat in line]


def draw_lines(lines: list[tuple[list, int]], bbox: dict, width: int, height: int) -> np.ndarray:
    mask = Image.new("L", (width, height), 0)
    pen = ImageDraw.Draw(mask)
    for line, stroke in lines:
        pen.line(to_pixels(line, bbox, width, height), fill=255, width=stroke, joint="curve")
    return np.asarray(mask, dtype="float32") / 255


def land_colors(classes: np.ndarray, heights: np.ndarray, height_range: list[float], map_colors: dict) -> np.ndarray:
    """Soft mix of land-cover colors. Forest gets darker with height."""
    low, mid, high, dry, rock = (rgb(map_colors[k]) for k in ("land_low", "land_mid", "land_high", "dry", "rock"))
    bottom, top = height_range
    forest = ramp(np.clip((heights - bottom) / max(top - bottom, 1.0), 0, 1), [(0, mix(mid, low, 0.25)), (0.5, mid), (1, high)])
    palette = {SHRUB: mix(dry, low, 0.5), GRASS: low, CROP: mix(low, dry, 0.35), BARE: dry, SNOW: rgb(map_colors["snow"]),
               WETLAND: mix(mid, rgb(map_colors["sea_shallow"]), 0.35), MANGROVE: high, MOSS: mix(low, rock, 0.5)}
    weights = ndimage.gaussian_filter((classes == TREE).astype("float32"), 2)
    image = forest * weights[..., None]
    total = weights
    for cls, color in palette.items():
        if (classes == cls).any():
            weights = ndimage.gaussian_filter((classes == cls).astype("float32"), 2)
            image = image + color * weights[..., None]
            total = total + weights
    # built-up and water pixels have no color here: they borrow from their neighbors
    return np.where(total[..., None] > 1e-3, image / np.maximum(total[..., None], 1e-3), low)


def relief_shading(heights: np.ndarray, cell_m: float, exaggeration: float) -> tuple[np.ndarray, np.ndarray]:
    """Return (brightness multiplier, slope), lit from the same side as the 3D sun."""
    lift = 0.75 * exaggeration / cell_m
    smooth = ndimage.gaussian_filter(heights, 1.2) * lift
    grad_y, grad_x = np.gradient(smooth)
    azimuth, altitude = math.radians(225), math.radians(42)
    light = (math.sin(altitude) - math.cos(altitude) * (-grad_x * math.cos(azimuth) + grad_y * math.sin(azimuth))) \
        / np.sqrt(1 + grad_x ** 2 + grad_y ** 2)
    curvature = np.clip(-ndimage.laplace(ndimage.gaussian_filter(heights, 2) * lift) * CURVE_GAIN, -1, 1)
    return SHADE_BASE + SHADE_LIGHT * np.clip(light, 0, 1) + SHADE_CURVE * curvature, np.hypot(grad_x, grad_y)


def add_urban(image: np.ndarray, classes: np.ndarray, map_colors: dict, rng: np.random.Generator) -> np.ndarray:
    height, width = classes.shape
    share = ndimage.gaussian_filter((classes == BUILT).astype("float32"), 1.5)
    blocks = np.kron(rng.random((height // 4 + 1, width // 4 + 1), dtype="float32"), np.ones((4, 4)))[:height, :width]
    return blend(image, rgb(map_colors["urban"]) * (0.93 + blocks[..., None] * 0.1), share * 0.85)


def paint_sea(depth_m: np.ndarray, from_coast_px: np.ndarray, map_colors: dict, rng: np.random.Generator) -> np.ndarray:
    shallow, deep = rgb(map_colors["sea_shallow"]), rgb(map_colors["sea_deep"])
    white = np.ones(3, dtype="float32")
    sea = ramp(ndimage.gaussian_filter(depth_m, DEPTH_BLUR_PX),
               [(0, mix(shallow, white, 0.25)), (8, shallow), (25, mix(shallow, deep, 0.4)), (80, mix(shallow, deep, 0.65)),
                (400, mix(shallow, deep, 0.85)), (2000, deep)])
    height, width = depth_m.shape
    patches = ndimage.gaussian_filter(rng.random((height, width), dtype="float32"), 3)
    patches = np.clip((patches - patches.mean()) / patches.std() * 0.5 + 0.4, 0, 1) * np.clip(1 - from_coast_px / 40, 0, 1)
    sea = blend(sea, mix(shallow, deep, 0.45), patches * 0.25)
    foam = np.clip(1 - np.abs(from_coast_px - 2.5) / 1.5, 0, 1) * 0.6
    return blend(sea, white, foam)


def edge_color(sea_image: np.ndarray, sea: np.ndarray) -> np.ndarray:
    """The open-water color around the map: the 3D ocean uses it, so no frame shows at the edge."""
    border = np.ones_like(sea, dtype=bool)
    border[EDGE_PX:-EDGE_PX, EDGE_PX:-EDGE_PX] = False
    return np.median(sea_image[border & sea], axis=0) if (border & sea).any() else np.median(sea_image[sea], axis=0)


def fade_edges(sea_image: np.ndarray, color: np.ndarray, width_px: int = SEA_FADE_PX) -> np.ndarray:
    height, width = sea_image.shape[:2]
    rows, cols = np.ogrid[:height, :width]
    border = np.minimum(np.minimum(rows, height - 1 - rows), np.minimum(cols, width - 1 - cols))
    return blend(sea_image, color, 1 - np.clip(border / width_px, 0, 1))


def road_masks(roads: list[dict], bbox: dict, width: int, height: int) -> tuple[np.ndarray, np.ndarray]:
    size = max(width / BASE_TEXTURE_PX, 0.5)
    major = [(r["line"], max(1, round(ROAD_WIDTH_M[r["class"]] * size))) for r in roads if r["class"] in ROAD_WIDTH_M]
    minor = [(r["line"], MINOR_ROAD_WIDTH) for r in roads if r["class"] not in ROAD_WIDTH_M]
    return draw_lines(major, bbox, width, height), draw_lines(minor, bbox, width, height)


def paint(terrain: dict, vectors: dict, map_colors: dict, fade_sea: bool = True) -> tuple[np.ndarray, str]:
    """Return the texture as a uint8 RGB array, and the color of the open water around it."""
    meta, classes = terrain["meta"], terrain["classes"]
    height, width = classes.shape
    bbox = {k: meta[k] for k in ("lat0", "lat1", "lon0", "lon1")}
    rng = np.random.default_rng(7)
    cell_m = meta["km_x"] * 1000 / width
    heights = ndimage.zoom(terrain["heights"], TEXTURE_SCALE, order=1, grid_mode=True, mode="nearest")[:height, :width]
    water = np.isin(classes, WATER_CLASSES)
    sea = water & (heights < SEA_LEVEL_TOLERANCE_M)
    lakes, land = water & ~sea, ~water
    from_land = ndimage.distance_transform_edt(~land)
    inland = ndimage.distance_transform_edt(land)

    image = land_colors(classes, heights, meta["height_range"], map_colors)
    image = image * (1 + 0.04 * ndimage.gaussian_filter(rng.standard_normal((height, width), dtype="float32"), 40)[..., None] * 40)
    image = add_urban(image, classes, map_colors, rng)
    shade, slope = relief_shading(heights, cell_m, meta["exaggeration"])
    steep = np.clip((slope - 0.9) / 1.6, 0, 1) * land
    image = blend(image, mix(rgb(map_colors["land_high"]), rgb(map_colors["rock"]), 0.4), steep * 0.45)
    image = image * np.where(land | lakes, shade, 1)[..., None]

    if meta["has_sea"]:
        beach = ndimage.gaussian_filter((land & (inland < BEACH_PX) & (heights < BEACH_MAX_M) & (classes != BUILT))
                                        .astype("float32"), 1.2)
        image = blend(image, rgb(map_colors["sand"]), beach * 0.8)

    if meta["has_sea"]:
        depth = ndimage.zoom(terrain["depth"], TEXTURE_SCALE, order=1, grid_mode=True, mode="nearest")[:height, :width]
        ocean = paint_sea(np.maximum(-depth, 0), ndimage.distance_transform_edt(sea), map_colors, rng)
        ocean_color = edge_color(ocean, sea)
        image = np.where(sea[..., None], fade_edges(ocean, ocean_color) if fade_sea else ocean, image)
    else:
        ocean_color = rgb(map_colors["sea_deep"])

    river_color = rgb(map_colors["river"])
    image = blend(image, river_color, ndimage.gaussian_filter(lakes.astype("float32"), 0.8))
    rivers = draw_lines([(line, 1 if meta["km_x"] > 40 else 2) for line in vectors["rivers"]], bbox, width, height)
    image = blend(image, river_color, ndimage.gaussian_filter(rivers, 0.6) * 0.85 * land)

    major, minor = road_masks(vectors["roads"], bbox, width, height)
    road_color = rgb(map_colors["road"])
    image = blend(image, road_color, ndimage.gaussian_filter(minor, 0.5) * MINOR_ROAD_ALPHA)
    soft = ndimage.gaussian_filter(major, 0.7)  # stays over water: bridges
    edge = ndimage.gaussian_filter(np.clip(ndimage.grey_dilation(soft, size=3) - soft, 0, 1), 0.5)
    image = image * (1 - edge[..., None] * 0.35)
    image = blend(image, road_color, soft * 0.9)

    runway_px = max(1, round(RUNWAY_WIDTH_M / cell_m))
    runways = draw_lines([(line, runway_px) for line in vectors["runways"]], bbox, width, height)
    image = blend(image, rgb(map_colors["urban"]) * 0.9, ndimage.gaussian_filter(runways, 1) * 0.8)

    return (np.clip(image, 0, 1) * 255).astype("uint8"), "#%02X%02X%02X" % tuple(int(c * 255) for c in np.clip(ocean_color, 0, 1))


def fade_to(image: np.ndarray, color: str) -> np.ndarray:
    """Dissolve the outer band of a uint8 image into one color."""
    return (fade_edges(image.astype("float32") / 255, rgb(color), CONTEXT_FADE_PX) * 255).astype("uint8")


def write_texture(image: np.ndarray, out_dir: Path, name: str = "map.jpg") -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    Image.fromarray(image).save(out_dir / name, quality=JPEG_QUALITY, optimize=True, progressive=True)

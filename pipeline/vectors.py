"""Roads, rivers, runways, towns and buildings for one map, from Overture Maps."""
from __future__ import annotations

import hashlib
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
import shapely
from overturemaps import core

MAJOR_ROADS = ("motorway", "trunk", "primary", "secondary")
MEDIUM_ROADS = (*MAJOR_ROADS, "tertiary")
MINOR_ROADS = (*MEDIUM_ROADS, "residential", "unclassified", "living_street")
CITY_MAP_KM = 40         # below this, residential streets are visible
REGION_MAP_KM = 150      # above this, only the main roads read
BUILDINGS_MAX_KM = 120   # above this a building is smaller than a texture pixel
TALL_BUILDINGS = 800
OTHER_BUILDINGS = 2200
MAX_TOWNS = 20
TOWN_RANK = {"megacity": 0, "city": 1, "town": 2, "village": 3, "hamlet": 4}
DEFAULT_RANK = 5


def bbox_tuples(bbox: dict) -> list[tuple[float, float, float, float]]:
    """One query box, or two when the map crosses the antimeridian."""
    south, north, west, east = bbox["lat0"], bbox["lat1"], bbox["lon0"], bbox["lon1"]
    if west < -180:
        return [(west + 360, south, 180.0, north), (-180.0, south, east, north)]
    if east > 180:
        return [(west, south, 180.0, north), (-180.0, south, east - 360, north)]
    return [(west, south, east, north)]


def road_classes(side_km: float) -> tuple[str, ...]:
    if side_km <= CITY_MAP_KM:
        return MINOR_ROADS
    return MEDIUM_ROADS if side_km <= REGION_MAP_KM else MAJOR_ROADS


def river_classes(side_km: float) -> tuple[str, ...]:
    return ("river", "canal", "stream") if side_km <= REGION_MAP_KM else ("river", "canal")


def batches(kind: str, bbox: dict, columns: list[str]):
    # stac: open only the files that cover this box, 8x faster than scanning all of them
    for box in bbox_tuples(bbox):
        reader = core.record_batch_reader(kind, box, stac=True)
        if reader is None:
            raise OSError(f"Overture has no data for {kind}")
        for batch in reader:
            yield {name: batch.column(name).to_pylist() for name in columns}


def line_coords(wkb: bytes) -> list[list[list[float]]]:
    """Coordinates of every line in a geometry, rounded to about 1 m."""
    geometry = shapely.from_wkb(wkb)
    lines = shapely.get_parts(geometry) if geometry.geom_type.startswith("Multi") else [geometry]
    return [np.round(shapely.get_coordinates(line), 5).tolist() for line in lines]


def is_tunnel(flags: list[dict] | None) -> bool:
    return any("is_tunnel" in (rule.get("values") or []) for rule in flags or [])


def fetch_roads(bbox: dict, side_km: float) -> list[dict]:
    keep = road_classes(side_km)
    roads = []
    for rows in batches("segment", bbox, ["subtype", "class", "road_flags", "geometry"]):
        for subtype, cls, flags, wkb in zip(rows["subtype"], rows["class"], rows["road_flags"], rows["geometry"]):
            if subtype == "road" and cls in keep and not is_tunnel(flags):
                roads += [{"class": cls, "line": line} for line in line_coords(wkb)]
    return roads


def fetch_rivers(bbox: dict, side_km: float) -> list[list[list[float]]]:
    keep = river_classes(side_km)
    rivers = []
    for rows in batches("water", bbox, ["class", "is_intermittent", "geometry"]):
        for cls, dry, wkb in zip(rows["class"], rows["is_intermittent"], rows["geometry"]):
            if cls in keep and not dry and shapely.from_wkb(wkb).geom_type.endswith("LineString"):
                rivers += line_coords(wkb)
    return rivers


def fetch_runways(bbox: dict) -> list[list[list[float]]]:
    runways = []
    for rows in batches("infrastructure", bbox, ["class", "geometry"]):
        for cls, wkb in zip(rows["class"], rows["geometry"]):
            if cls == "runway" and shapely.from_wkb(wkb).geom_type.endswith("LineString"):
                runways += line_coords(wkb)
    return runways


def pick_towns(towns: list[dict], side_km: float) -> list[dict]:
    """Biggest first, skipping any town too close to one already chosen."""
    ranked = sorted(towns, key=lambda t: (TOWN_RANK.get(t["class"], DEFAULT_RANK), -(t["population"] or 0)))
    spacing_deg = side_km / MAX_TOWNS / 111
    chosen: list[dict] = []
    for town in ranked:
        if len(chosen) == MAX_TOWNS:
            break
        if all(max(abs(town["lat"] - c["lat"]), abs(town["lon"] - c["lon"])) >= spacing_deg for c in chosen):
            chosen.append(town)
    return chosen


def fetch_towns(bbox: dict, side_km: float) -> list[dict]:
    # a city map is one locality: its labels are the neighborhoods
    label_types = ("locality", "macrohood", "neighborhood") if side_km <= CITY_MAP_KM else ("locality",)
    towns = []
    for rows in batches("division", bbox, ["subtype", "class", "names", "population", "geometry"]):
        for subtype, cls, names, population, wkb in zip(rows["subtype"], rows["class"], rows["names"],
                                                        rows["population"], rows["geometry"]):
            if subtype in label_types and names and names.get("primary"):
                point = shapely.from_wkb(wkb)
                towns.append({"name": names["primary"], "class": cls, "population": population,
                              "lat": round(point.y, 5), "lon": round(point.x, 5)})
    return pick_towns(towns, side_km)


def footprint(wkb: bytes, height: float | None) -> list[float]:
    """[lat, lon, width m, depth m, height m (0 if unknown), rotation degrees]"""
    box = shapely.oriented_envelope(shapely.from_wkb(wkb))
    coords = shapely.get_coordinates(box)
    center = coords[:-1].mean(axis=0)
    meters = np.array([111_320 * np.cos(np.radians(center[1])), 110_600])
    edges = (coords[1:3] - coords[:2]) * meters
    rotation = float(np.degrees(np.arctan2(edges[0][1], edges[0][0])))
    return [round(float(center[1]), 5), round(float(center[0]), 5), round(float(np.hypot(*edges[0])), 1),
            round(float(np.hypot(*edges[1])), 1), round(float(height or 0), 1), round(rotation, 1)]


def fetch_buildings(bbox: dict, side_km: float) -> list[list[float]]:
    """A sample: the tallest buildings, plus a random spread of the rest."""
    if side_km > BUILDINGS_MAX_KM:
        return []
    heights: list[float] = []
    geometries: list[bytes] = []
    for rows in batches("building", bbox, ["height", "geometry"]):
        heights += [h or 0.0 for h in rows["height"]]
        geometries += rows["geometry"]
    if not geometries:
        return []
    order = np.argsort(heights)[::-1]
    tall, rest = order[:TALL_BUILDINGS], order[TALL_BUILDINGS:]
    rng = np.random.default_rng(7)
    sample = rng.choice(rest, min(OTHER_BUILDINGS, len(rest)), replace=False) if len(rest) else rest
    return [footprint(geometries[i], heights[i]) for i in [*tall, *sample]]


def fetch_vectors(bbox: dict) -> dict:
    side_km = max(bbox["km_x"], bbox["km_y"])
    with ThreadPoolExecutor(5) as pool:
        jobs = {"roads": pool.submit(fetch_roads, bbox, side_km), "rivers": pool.submit(fetch_rivers, bbox, side_km),
                "runways": pool.submit(fetch_runways, bbox), "towns": pool.submit(fetch_towns, bbox, side_km),
                "buildings": pool.submit(fetch_buildings, bbox, side_km)}
    return {name: job.result() for name, job in jobs.items()}


def cached_vectors(bbox: dict, cache_dir: Path) -> dict:
    key = hashlib.sha1(json.dumps(bbox, sort_keys=True).encode()).hexdigest()[:16]
    path = cache_dir / f"vectors-{key}.json"
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    vectors = fetch_vectors(bbox)
    cache_dir.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(vectors), encoding="utf-8")
    return vectors

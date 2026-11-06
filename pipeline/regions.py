"""Group places into maps and split each day into legs.

Regions adapt to the trip instead of using a fixed radius. Picture the places joined by the
shortest possible network of strings, then cut the longest string while a group is either too
big for one map, or mostly empty space. A road trip with stops every 150 km stays on one map;
two islands 300 km apart do not.
"""
from __future__ import annotations

import math
from collections import Counter

import numpy as np
from scipy.sparse.csgraph import minimum_spanning_tree

KM_PER_DEG_LAT = 110.6
KM_PER_DEG_LON = 111.32
GAP_MIN_KM = 100
GAP_SHARE = 0.6
MARGIN = 0.12
MAX_RATIO = 1.6
MIN_MAP_KM = 12
SAME_POINT_KM = 1e-3
OVERVIEW_MARGIN = 0.35
LAT_LIMIT = 80


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    p1, p2 = math.radians(lat1), math.radians(lat2)
    a = math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(math.radians(lon2 - lon1) / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(a))


def distance_matrix(points: list[tuple[float, float]]) -> np.ndarray:
    return np.array([[haversine_km(*a, *b) for b in points] for a in points])


def split_group(group: list[int], dist: np.ndarray, max_km: float) -> list[list[int]]:
    if len(group) < 2:
        return [group]
    sub = dist[np.ix_(group, group)]
    span = float(sub.max())
    # csgraph treats 0 as "no edge", so places at the same spot need a tiny distance
    tree = minimum_spanning_tree(np.maximum(sub, SAME_POINT_KM)).toarray()
    a, b = np.unravel_index(tree.argmax(), tree.shape)
    longest = float(tree[a, b])
    if span <= max_km and not (longest >= GAP_MIN_KM and longest >= GAP_SHARE * span):
        return [group]
    tree[a, b] = 0
    links = (tree + tree.T) > 0
    side, frontier = {int(a)}, [int(a)]
    while frontier:
        for neighbor in np.nonzero(links[frontier.pop()])[0]:
            if int(neighbor) not in side:
                side.add(int(neighbor))
                frontier.append(int(neighbor))
    left = [group[i] for i in sorted(side)]
    right = [group[i] for i in range(len(group)) if i not in side]
    return split_group(left, dist, max_km) + split_group(right, dist, max_km)


def cluster(points: list[tuple[float, float]], max_km: float) -> list[list[int]]:
    """Index groups, first-visited group first."""
    groups = split_group(list(range(len(points))), distance_matrix(points), max_km)
    return sorted(groups, key=min)


def bounding_box(points: list[tuple[float, float]], margin: float = MARGIN) -> dict:
    """Box with margin, at least MIN_MAP_KM wide, at most MAX_RATIO long.

    shortcut: longitudes may pass 180 on trips across the antimeridian; the data fetch must wrap them.
    """
    lats = [p[0] for p in points]
    ref = points[0][1]
    lons = [((p[1] - ref + 180) % 360) - 180 + ref for p in points]
    mid_lat, mid_lon = (min(lats) + max(lats)) / 2, (min(lons) + max(lons)) / 2
    km_lon = KM_PER_DEG_LON * math.cos(math.radians(mid_lat))
    width = max((max(lons) - min(lons)) * km_lon * (1 + 2 * margin), MIN_MAP_KM)
    height = max((max(lats) - min(lats)) * KM_PER_DEG_LAT * (1 + 2 * margin), MIN_MAP_KM)
    width, height = max(width, height / MAX_RATIO), max(height, width / MAX_RATIO)
    half_lon, half_lat = width / km_lon / 2, height / KM_PER_DEG_LAT / 2
    return {
        "lat0": mid_lat - half_lat, "lat1": mid_lat + half_lat,
        "lon0": mid_lon - half_lon, "lon1": mid_lon + half_lon,
        "km_x": width, "km_y": height,
    }


def grown_box(bbox: dict, factor: float) -> dict:
    """The same box, centered, wider by a factor. Used for the land around a map."""
    mid_lat, mid_lon = (bbox["lat0"] + bbox["lat1"]) / 2, (bbox["lon0"] + bbox["lon1"]) / 2
    half_lat, half_lon = (bbox["lat1"] - bbox["lat0"]) / 2 * factor, (bbox["lon1"] - bbox["lon0"]) / 2 * factor
    return {"lat0": max(mid_lat - half_lat, -LAT_LIMIT), "lat1": min(mid_lat + half_lat, LAT_LIMIT),
            "lon0": mid_lon - half_lon, "lon1": mid_lon + half_lon,
            "km_x": bbox["km_x"] * factor, "km_y": bbox["km_y"] * factor}


def overview_box(maps: list[dict]) -> dict:
    centers = [((m["bbox"]["lat0"] + m["bbox"]["lat1"]) / 2, (m["bbox"]["lon0"] + m["bbox"]["lon1"]) / 2) for m in maps]
    return grown_box(bounding_box(centers, OVERVIEW_MARGIN), 1.0)


def map_title(places: list[dict], index: int) -> str:
    for field in ("city", "state", "country"):
        names = Counter(p[field] for p in places if p.get(field))
        if names:
            return names.most_common(1)[0][0]
    return f"Map {index}"


def build_maps(places: list[dict], max_km: float, titles: dict[str, str] | None = None) -> list[dict]:
    points = [(p["lat"], p["lon"]) for p in places]
    maps = []
    for index, group in enumerate(cluster(points, max_km), 1):
        members = [places[i] for i in group]
        maps.append({
            "id": f"map-{index}",
            "title": (titles or {}).get(map_title(members, index), map_title(members, index)),
            "places": [p["id"] for p in members],
            "bbox": bounding_box([points[i] for i in group]),
        })
    return maps


def split_legs(day: dict, map_of: dict[str, str], fallback: str) -> dict:
    """A day crossing maps becomes legs: one per map visited, in visiting order.

    Road routes only exist inside a leg. The jump between legs is drawn on the overview.
    """
    stops = list(dict.fromkeys(item["place"] for item in day["items"] if item["place"]))
    legs: list[dict] = []
    for stop in stops:
        if legs and legs[-1]["map"] == map_of[stop]:
            legs[-1]["stops"].append(stop)
        else:
            legs.append({"map": map_of[stop], "stops": [stop]})
    counts = Counter(map_of[s] for s in stops)
    main = next((leg["map"] for leg in legs if counts[leg["map"]] == max(counts.values())), fallback)
    return {**day, "legs": legs, "map": main, "crosses_maps": len(legs) > 1}


def assign_days(days: list[dict], maps: list[dict]) -> list[dict]:
    map_of = {place: m["id"] for m in maps for place in m["places"]}
    result: list[dict] = []
    for day in days:
        # a day with no places stays where the previous day ended
        fallback = result[-1]["legs"][-1]["map"] if result and result[-1]["legs"] else maps[0]["id"]
        result.append(split_legs(day, map_of, fallback))
    return result

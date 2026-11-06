"""Turn place names into coordinates, once. Answers live in trip.lock.json.

Public services are shared and fragile, so a name is never looked up twice:
the lock file is committed next to trip.yaml.
"""
from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Callable

import requests

from .regions import haversine_km
from .schema import both, norm_key

DEFAULT_GEOCODER = "https://photon.komoot.io/api/"
TIMEZONE_URL = "https://api.open-meteo.com/v1/forecast"
USER_AGENT = "trip-map-3d/0.1 (+https://github.com/orodmorais/trip-map-3d)"
MIN_INTERVAL_S = 1.1
TIMEOUT_S = 25
RETRIES = 3
CANDIDATES = 5
NEARBY_KM = 300
LONELY_KM = 1500
OSM_TYPES = {
    "restaurant": "food", "cafe": "food", "fast_food": "food", "bar": "food", "pub": "food",
    "ice_cream": "food", "bakery": "food", "peak": "hike", "volcano": "hike", "aerodrome": "travel",
    "station": "travel", "ferry_terminal": "travel",
}

Search = Callable[[str], list[dict]]


def load_lock(path: Path) -> dict:
    lock = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
    return {"geocode": {}, "timezone": {}, "routes": {}, **lock}


def save_lock(path: Path, lock: dict) -> None:
    path.write_text(json.dumps(lock, ensure_ascii=False, indent=1, sort_keys=True) + "\n", encoding="utf-8")


def get_json(url: str, params: dict) -> dict:
    """GET with a real User-Agent, retrying only what a retry can fix."""
    for attempt in range(RETRIES):
        try:
            response = requests.get(url, params=params, headers={"User-Agent": USER_AGENT}, timeout=TIMEOUT_S)
        except requests.RequestException:
            if attempt == RETRIES - 1:
                raise
            time.sleep(2 ** (attempt + 1))
            continue
        if response.status_code not in (429, 500, 502, 503, 504) or attempt == RETRIES - 1:
            response.raise_for_status()
            return response.json()
        time.sleep(2 ** (attempt + 1))
    raise AssertionError("unreachable")


def photon_searcher(url: str = DEFAULT_GEOCODER) -> Search:
    last_call = [0.0]

    def search(query: str) -> list[dict]:
        time.sleep(max(0.0, MIN_INTERVAL_S - (time.monotonic() - last_call[0])))
        data = get_json(url, {"q": query, "limit": CANDIDATES})
        last_call[0] = time.monotonic()
        return [candidate_from(feature) for feature in data.get("features", [])]

    return search


def candidate_from(feature: dict) -> dict:
    props = feature.get("properties", {})
    lon, lat = feature["geometry"]["coordinates"][:2]
    parts = [props.get(k) for k in ("name", "city", "state", "country")]
    return {
        "lat": lat,
        "lon": lon,
        "label": ", ".join(dict.fromkeys(p for p in parts if p)),
        "city": props.get("city"),
        "state": props.get("state"),
        "country": props.get("country"),
        "osm": props.get("osm_value"),
    }


def nearest_km(point: dict, others: list[tuple[float, float]]) -> float:
    return min((haversine_km(point["lat"], point["lon"], la, lo) for la, lo in others), default=float("inf"))


def choose(candidates: dict[str, list[dict]], fixed: list[tuple[float, float]]) -> dict[str, int]:
    """Pick one candidate per place, using the other places as context.

    A search for "Trevi Fountain" can rank a place 11 000 km away first. The top result
    wins unless it sits far from everything else while another result sits close.
    """
    picks = {place_id: 0 for place_id in candidates}
    for _ in range(2):
        for place_id, options in candidates.items():
            others = fixed + [(candidates[o][i]["lat"], candidates[o][i]["lon"])
                              for o, i in picks.items() if o != place_id]
            if not others:
                continue
            distances = [nearest_km(option, others) for option in options]
            close = [i for i, d in enumerate(distances) if d <= NEARBY_KM]
            picks[place_id] = close[0] if close else distances.index(min(distances))
    return picks


def resolve_places(trip: dict, lock: dict, search: Search) -> tuple[list[dict], list[str]]:
    """Return (places with coordinates, report lines). lock["geocode"] gains the new answers."""
    pending = [p for p in trip["places"] if p["lat"] is None]
    missing, candidates, report = [], {}, []
    for place in pending:
        key = norm_key(place["query"])
        if key not in lock["geocode"]:
            lock["geocode"][key] = search(place["query"])
        if lock["geocode"][key]:
            candidates[place["id"]] = lock["geocode"][key]
        else:
            missing.append(place["query"])
    if missing:
        names = "; ".join(missing)
        raise LookupError(both(f"not found: {names}. Add a city to the name, or lat and lon in trip.yaml",
                               f"não encontrei: {names}. Acrescente a cidade ao nome, ou lat e lon no trip.yaml"))
    fixed = [(p["lat"], p["lon"]) for p in trip["places"] if p["lat"] is not None]
    picks = choose(candidates, fixed)
    resolved: list[dict] = []
    for place in trip["places"]:
        if place["lat"] is not None:
            resolved.append(place)
            continue
        hit = candidates[place["id"]][picks[place["id"]]]
        resolved.append({**place, "lat": hit["lat"], "lon": hit["lon"], "city": hit.get("city"),
                         "state": hit.get("state"), "country": hit.get("country"),
                         "type": place["type"] or OSM_TYPES.get(hit.get("osm")), "geocoded": hit["label"]})
    for place in resolved:
        if place.get("geocoded"):
            others = [(p["lat"], p["lon"]) for p in resolved if p["id"] != place["id"]]
            lonely = nearest_km(place, others)
            flag = "  <-- CHECK: far from every other place" if others and lonely > LONELY_KM else ""
            report.append(f'{place["name"]} -> {place["geocoded"]} ({place["lat"]:.4f}, {place["lon"]:.4f}){flag}')
    return [{**p, "type": p["type"] or "sight"} for p in resolved], report


def timezone_for(lat: float, lon: float, lock: dict) -> str:
    key = f"{lat:.1f},{lon:.1f}"
    if key not in lock["timezone"]:
        data = get_json(TIMEZONE_URL, {"latitude": lat, "longitude": lon, "timezone": "auto", "forecast_days": 1})
        lock["timezone"][key] = data["timezone"]
    return lock["timezone"][key]

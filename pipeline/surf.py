"""Join surf spots to the trip: a spot at a place of the trip shares its pin, the others get their own."""
from __future__ import annotations

from pathlib import Path

import yaml

from .schema import TripError, both, slug

REQUIRED = ("id", "name", "lat", "lon", "facing", "min", "max")


def load_spots(path: Path) -> list[dict]:
    try:
        spots = yaml.safe_load(path.read_text(encoding="utf-8")) or []
    except (OSError, yaml.YAMLError) as exc:
        raise TripError([both(f"cannot read surf spots: {exc}", f"não consegui ler os picos de surf: {exc}")]) from exc
    missing = [str(s.get("id", "?")) for s in spots if any(s.get(field) is None for field in REQUIRED)]
    if missing:
        raise TripError([both(f'surf spots missing fields ({", ".join(REQUIRED)}): {", ".join(missing)}',
                              f'picos sem campos obrigatórios ({", ".join(REQUIRED)}): {", ".join(missing)}')])
    return spots


def map_containing(lat: float, lon: float, maps: list[dict]) -> dict | None:
    for item in maps:
        box = item["bbox"]
        if box["lat0"] < lat < box["lat1"] and box["lon0"] < lon < box["lon1"]:
            return item
    return None


def attach_spots(trip: dict, spots: list[dict]) -> tuple[dict, list[str]]:
    """Return the trip with spots merged, and notes about those that fall outside every map."""
    by_id = {s["place"]: s for s in spots if s.get("place")}
    places = [{**p, "spot": by_id[p["id"]]} if p["id"] in by_id else p for p in trip["places"]]
    known = {p["id"] for p in places}
    extra_ids: dict[str, list[str]] = {}
    notes: list[str] = []
    for spot in spots:
        if spot.get("place") in known:
            continue
        home = map_containing(spot["lat"], spot["lon"], trip["maps"])
        if home is None:
            notes.append(f'surf spot outside every map, skipped: {spot["name"]}')
            continue
        place_id = slug(spot["id"])
        places.append({"id": place_id, "name": spot["name"], "lat": spot["lat"], "lon": spot["lon"], "type": "spot",
                       "query": spot.get("maps") or spot["name"], "desc": spot.get("desc"), "spot": spot})
        extra_ids.setdefault(home["id"], []).append(place_id)
    maps = [{**m, "places": m["places"] + extra_ids.get(m["id"], [])} for m in trip["maps"]]
    return {**trip, "places": places, "maps": maps}, notes

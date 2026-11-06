"""Tide tables written at build time, so they work offline. NOAA covers the United States only."""
from __future__ import annotations

import datetime as dt
import json
from pathlib import Path

from .geocode import get_json
from .regions import haversine_km

STATIONS_URL = "https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json"
PREDICTIONS_URL = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter"
APPLICATION = "trip-map-3d"
NEARBY_KM = 120
STATIONS_PER_MAP = 4
SPREAD_KM = 25   # neighbors closer than this tell the same tide
MARGIN_DAYS = 1


def pick_stations(stations: list[dict], lat: float, lon: float) -> list[dict]:
    """The closest stations around a point, skipping those almost on top of one already chosen."""
    near = sorted((haversine_km(lat, lon, s["lat"], s["lng"]), s["id"], s) for s in stations)
    chosen: list[dict] = []
    for distance, _, station in near:
        if distance > NEARBY_KM or len(chosen) == STATIONS_PER_MAP:
            break
        if all(haversine_km(station["lat"], station["lng"], c["lat"], c["lng"]) >= SPREAD_KM for c in chosen):
            chosen.append(station)
    return chosen


def tide_events(station_id: str, start: str, end: str, units: str) -> list[list]:
    """High and low tides. NOAA reports problems as an error inside a normal answer."""
    begin = (dt.date.fromisoformat(start) - dt.timedelta(days=MARGIN_DAYS)).strftime("%Y%m%d")
    finish = (dt.date.fromisoformat(end) + dt.timedelta(days=MARGIN_DAYS)).strftime("%Y%m%d")
    data = get_json(PREDICTIONS_URL, {"product": "predictions", "application": APPLICATION, "station": station_id, "begin_date": begin,
                                      "end_date": finish, "datum": "MLLW", "time_zone": "lst_ldt", "interval": "hilo",
                                      "units": "english" if units == "ft" else "metric", "format": "json"})
    return [[row["t"], float(row["v"]), row["type"]] for row in data.get("predictions", [])]


def build_tides(trip: dict) -> tuple[dict, list[str]]:
    """Return ({stations: [...]}, notes). An empty list makes the site use the rougher global model."""
    all_stations = get_json(STATIONS_URL, {"type": "tidepredictions"})["stations"]
    wanted = {str(s) for s in trip["tide_stations"]}
    found: dict[str, dict] = {s["id"]: s for s in all_stations if s["id"] in wanted}
    notes = [f"tide station not found: {station}" for station in sorted(wanted - set(found))]
    for item in trip["maps"]:
        box = item["bbox"]
        for station in pick_stations(all_stations, (box["lat0"] + box["lat1"]) / 2, (box["lon0"] + box["lon1"]) / 2):
            if not wanted:
                found[station["id"]] = station
    stations = []
    for station in found.values():
        events = tide_events(station["id"], trip["start"], trip["end"], trip["units"]["waves"])
        if events:
            stations.append({"id": station["id"], "name": station["name"], "lat": station["lat"], "lon": station["lng"], "events": events})
        else:
            notes.append(f'no tide predictions for {station["name"]}')
    if not stations:
        notes.append("no tide tables for this trip: the site will use the global model")
    return {"unit": trip["units"]["waves"], "stations": stations}, notes


def write_tides(tides: dict, out_dir: Path) -> None:
    (out_dir / "data").mkdir(parents=True, exist_ok=True)
    (out_dir / "data" / "tides.js").write_text("window.TIDES=" + json.dumps(tides, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")

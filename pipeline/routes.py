"""Draw each day's route along real roads. Answers live in trip.lock.json, like geocoding."""
from __future__ import annotations

import time
from typing import Callable

import requests

from .geocode import MIN_INTERVAL_S, get_json
from .regions import haversine_km

DEFAULT_ROUTER = "https://routing.openstreetmap.de/routed-car/route/v1/driving/"
MAX_LINE_POINTS = 300

Point = tuple[float, float]
Router = Callable[[list[Point]], "list[list[float]] | None"]


def osrm_router(url: str = DEFAULT_ROUTER) -> Router:
    last_call = [0.0]

    def route(points: list[Point]) -> list[list[float]] | None:
        time.sleep(max(0.0, MIN_INTERVAL_S - (time.monotonic() - last_call[0])))
        coords = ";".join(f"{lon:.5f},{lat:.5f}" for lat, lon in points)
        try:
            data = get_json(url.rstrip("/") + "/" + coords, {"overview": "simplified", "geometries": "geojson"})
        except requests.RequestException:
            return None
        finally:
            last_call[0] = time.monotonic()
        if data.get("code") != "Ok" or not data.get("routes"):
            return None
        return [[round(lat, 5), round(lon, 5)] for lon, lat in data["routes"][0]["geometry"]["coordinates"]]

    return route


def insert_via(points: list[Point], via: list[Point]) -> list[Point]:
    """Put each extra point between the two stops where it adds the shortest detour."""
    result = list(points)
    for point in via:
        detours = [haversine_km(*result[i], *point) + haversine_km(*point, *result[i + 1]) - haversine_km(*result[i], *result[i + 1])
                   for i in range(len(result) - 1)]
        at = detours.index(min(detours)) + 1 if detours else len(result)
        result.insert(at, point)
    return result


def thin(line: list[list[float]]) -> list[list[float]]:
    step = max(1, len(line) // MAX_LINE_POINTS)
    return line[::step] + ([line[-1]] if (len(line) - 1) % step else [])


def leg_stops(leg: dict, day: dict, places: dict[str, dict]) -> list[str]:
    """The place ids a leg passes, in order, with home at both ends when the day starts and ends there."""
    stops = list(leg["stops"])
    home = places.get("home")
    if home and home["map"] == leg["map"] and not day["crosses_maps"] and leg["stops"] != ["home"]:
        stops = ["home", *stops, "home"]
    return stops


def leg_points(leg: dict, day: dict, places: dict[str, dict]) -> list[Point]:
    points = [(places[s]["lat"], places[s]["lon"]) for s in leg_stops(leg, day, places)]
    return insert_via(points, [tuple(p) for p in day["route_via"]])


def hops(line: list[list[float]], stops: list[str], places: dict[str, dict]) -> list[dict]:
    """Distance in km between each pair of consecutive stops, measured along the drawn line."""
    if len(line) < 2 or len(stops) < 2:
        return []
    total = [0.0]
    for a, b in zip(line, line[1:]):
        total.append(total[-1] + haversine_km(*a, *b))
    at, marks = 0, []
    for stop in stops:
        spot = (places[stop]["lat"], places[stop]["lon"])
        best = min(range(at, len(line)), key=lambda i: haversine_km(*line[i], *spot))
        marks.append(best)
        at = best
    result = []
    for (a, ia), (b, ib) in zip(zip(stops, marks), zip(stops[1:], marks[1:])):
        km = total[ib] - total[ia]
        if km <= 0:
            km = haversine_km(places[a]["lat"], places[a]["lon"], places[b]["lat"], places[b]["lon"])
        result.append({"from": a, "to": b, "km": round(km, 1)})
    return result


def route_days(days: list[dict], places: dict[str, dict], lock: dict, router: Router) -> tuple[list[dict], list[str]]:
    """Return (days with a line on every leg, notes)."""
    notes: list[str] = []
    result: list[dict] = []
    for day in days:
        legs = []
        for leg in day["legs"]:
            points = leg_points(leg, day, places)
            line = [list(p) for p in points]
            if day["route"] == "road" and len(points) > 1:
                key = ";".join(f"{lat:.5f},{lon:.5f}" for lat, lon in points)
                if key not in lock["routes"]:
                    answer = router(points)
                    if answer is None:
                        notes.append(f'day {day["n"]}: no road route found, using straight lines')
                    else:
                        lock["routes"][key] = thin(answer)
                line = lock["routes"].get(key, line)
            legs.append({**leg, "line": line, "hops": hops(line, leg_stops(leg, day, places), places)})
        result.append({**day, "legs": legs})
    return result, notes

"""Command line: python -m pipeline check|build trip.yaml"""
from __future__ import annotations

import argparse
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from .geocode import DEFAULT_GEOCODER, load_lock, photon_searcher, resolve_places, save_lock, timezone_for
from .regions import assign_days, build_maps, grown_box, overview_box
from .routes import DEFAULT_ROUTER, osrm_router, route_days
from .scene import build_scene, write_scene
from .schema import TripError, load_trip
from .site import assemble
from .surf import attach_spots, load_spots
from .terrain import TerrainError, cached_terrain, write_terrain
from .texture import fade_to, paint, write_texture
from .theme import load_theme
from .tides import build_tides
from .vectors import cached_vectors

CACHE_DIR = Path(".cache")
MAP_WORKERS = 3
CONTEXT_FACTOR = 3
NO_VECTORS = {"roads": [], "rivers": [], "runways": []}
EMPTY_SCENE = {"trees": [], "palms": [], "buildings": [], "runways": [], "towns": []}


def prepare(path: Path) -> tuple[dict, list[str]]:
    """Validate, geocode, group and route a trip. Returns the trip and a report for the user to review."""
    trip = load_trip(path)
    lock_path = path.with_name("trip.lock.json")
    lock = load_lock(lock_path)
    geocoder = trip["services"].get("geocoder", DEFAULT_GEOCODER)
    try:
        places, report = resolve_places(trip, lock, photon_searcher(geocoder))
        maps = build_maps(places, trip["region_max_km"], trip["region_titles"])
        maps = [{**maps[0], "title": trip["title"]}] if len(maps) == 1 and maps[0]["title"].startswith("Map ") else maps
        timed = [{**m, "timezone": trip["timezone"] or timezone_for(*box_center(m["bbox"]), lock)} for m in maps]
        map_of = {place: m["id"] for m in timed for place in m["places"]}
        located = {p["id"]: {**p, "map": map_of[p["id"]]} for p in places}
        router = osrm_router(trip["services"].get("router", DEFAULT_ROUTER))
        days, route_notes = route_days(assign_days(trip["days"], timed), located, lock, router)
    finally:
        save_lock(lock_path, lock)
    report += [f'map "{m["title"]}": {len(m["places"])} places, {m["bbox"]["km_x"]:.0f} x {m["bbox"]["km_y"]:.0f} km, '
               f'{m["timezone"]}' for m in timed]
    report += [f'day {d["n"]} crosses maps: ' + " -> ".join(leg["map"] for leg in d["legs"])
               for d in days if d["crosses_maps"]]
    return {**trip, "places": places, "maps": timed, "days": days}, trip["warnings"] + report + route_notes


def box_center(box: dict) -> tuple[float, float]:
    return (box["lat0"] + box["lat1"]) / 2, ((box["lon0"] + box["lon1"]) / 2 + 180) % 360 - 180


def build_context(item: dict, parent: dict, colors: dict, ocean: str, folder: Path) -> dict:
    """Paint the land around a map, so an inland map has no cut edge. Returns its position for the scene."""
    box = grown_box(item["bbox"], CONTEXT_FACTOR)
    context, _ = cached_terrain(box, CACHE_DIR, "context")
    meta = {**context["meta"], "exaggeration": parent["exaggeration"], "height_range": parent["height_range"]}
    image, _ = paint({**context, "meta": meta}, NO_VECTORS, colors)
    write_terrain({**context, "meta": meta}, folder, "context-")
    write_texture(fade_to(image, ocean), folder, "context.jpg")
    return {k: meta[k] for k in ("NX", "NY", "lat0", "lat1", "lon0", "lon1")}


def build_map(item: dict, theme: dict, out_dir: Path) -> list[str]:
    overview = item.get("overview", False)
    terrain, notes = cached_terrain(item["bbox"], CACHE_DIR, "overview" if overview else "map")
    vectors = NO_VECTORS if overview else cached_vectors(item["bbox"], CACHE_DIR)
    chosen = theme["map"].get("exaggeration", "auto")
    meta = terrain["meta"] if chosen == "auto" else {**terrain["meta"], "exaggeration": float(chosen)}
    terrain = {**terrain, "meta": meta}
    surrounded = meta["open_border"] and not overview
    image, ocean = paint(terrain, vectors, theme["map"], fade_sea=not surrounded)
    ocean = ocean if meta["has_sea"] else theme["colors"]["bg"]
    folder = out_dir / "data" / item["id"]
    context = build_context(item, meta, theme["map"], ocean, folder) if surrounded else None
    write_terrain({**terrain, "meta": {**meta, "ocean": ocean, "context": context, "overview": overview}}, folder)
    write_texture(fade_to(image, ocean) if overview else image, folder)
    write_scene(EMPTY_SCENE if overview else build_scene(terrain, vectors), folder)
    title = f'map "{item["title"]}"'
    return [f"{title}: {note}" for note in notes] + [
        f'{title}: grid {meta["NX"]}x{meta["NY"]}, vertical exaggeration {meta["exaggeration"]}x']


def build(trip: dict, theme: dict, trip_path: Path, out_dir: Path) -> list[str]:
    jobs = trip["maps"] + ([{"id": "overview", "title": "overview", "overview": True, "bbox": overview_box(trip["maps"])}]
                           if len(trip["maps"]) > 1 else [])
    with ThreadPoolExecutor(MAP_WORKERS) as pool:
        results = pool.map(lambda item: build_map(item, theme, out_dir), jobs)
    notes = [line for lines in results for line in lines]
    if trip["modules"]["surf"] and trip["surf_spots"]:
        trip, spot_notes = attach_spots(trip, load_spots(trip_path.parent / trip["surf_spots"]))
        notes += spot_notes
    tides, tide_notes = build_tides(trip) if trip["modules"]["tides"] else (None, [])
    return notes + tide_notes + assemble(trip, theme, tides, trip_path.parent, out_dir, CACHE_DIR)


def main() -> int:
    parser = argparse.ArgumentParser(prog="pipeline", description="Build a 3D trip map website.")
    parser.add_argument("command", choices=["check", "build"])
    parser.add_argument("trip", type=Path)
    parser.add_argument("--out", type=Path, default=Path("dist"))
    args = parser.parse_args()
    try:
        trip, report = prepare(args.trip)
        if args.command == "build":
            report += build(trip, load_theme(args.trip.with_name("theme.yaml")), args.trip, args.out)
    except TripError as exc:
        print("\n".join(f"ERROR: {e}" for e in exc.errors), file=sys.stderr)
        return 1
    except (LookupError, TerrainError, OSError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    print("\n".join(report))
    return 0


if __name__ == "__main__":
    sys.exit(main())

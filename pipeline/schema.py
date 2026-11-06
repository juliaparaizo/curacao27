"""Load trip.yaml, validate it and return a normalized trip dict."""
from __future__ import annotations

import datetime as dt
import difflib
import re
import unicodedata
from pathlib import Path, PurePosixPath
from typing import Any

import yaml

LANGUAGES = ("pt-BR", "en", "es")
TEMP_UNITS = ("C", "F")
DISTANCE_UNITS = ("km", "mi")
WAVE_UNITS = ("ft", "m")
DEFAULT_MAX_REGION_KM = 400
TOP_LEVEL_KEYS = {
    "title", "subtitle", "dates", "timezone", "language", "units", "home", "regions",
    "places", "days", "stories", "modules", "services", "downloads", "surf_spots", "tide_stations", "landmarks",
}
PLACE_FIELDS = ("type", "desc", "tip", "photo", "photo_focus", "model", "camera", "maps")


class TripError(Exception):
    """Raised with every problem found, so the user fixes them all at once."""

    def __init__(self, errors: list[str]):
        super().__init__("\n".join(errors))
        self.errors = errors


def both(en: str, pt: str) -> str:
    return f"{en} | {pt}"


def strip_accents(text: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFKD", text) if not unicodedata.combining(c))


def norm_key(text: str) -> str:
    return re.sub(r"\s+", " ", strip_accents(text).casefold()).strip()


def slug(text: str) -> str:
    """ASCII id, safe for hash routes."""
    return re.sub(r"[^a-z0-9]+", "-", strip_accents(text).lower()).strip("-") or "place"


def unique_id(base: str, taken: set[str]) -> str:
    candidate, n = base, 2
    while candidate in taken:
        candidate, n = f"{base}-{n}", n + 1
    return candidate


def parse_date(value: Any) -> dt.date | None:
    if isinstance(value, dt.datetime):
        return value.date()
    if isinstance(value, dt.date):
        return value
    try:
        return dt.date.fromisoformat(str(value))
    except ValueError:
        return None


def parse_time(value: Any) -> str:
    """Return HH:MM when the value is a clock time; other labels ("morning") pass through."""
    if value is None:
        return ""
    # YAML 1.1 reads an unquoted 12:00 as sexagesimal 720
    if isinstance(value, int) and not isinstance(value, bool):
        return f"{value // 60:02d}:{value % 60:02d}"
    text = str(value).strip()
    match = re.fullmatch(r"(\d{1,2})(?::|h)(\d{2})?", text)
    if match and int(match[1]) < 24 and int(match[2] or 0) < 60:
        return f"{int(match[1]):02d}:{match[2] or '00'}"
    return text


def safe_relative(path: Any) -> bool:
    """Files named in trip.yaml get copied into the site: keep them inside the project."""
    pure = PurePosixPath(str(path))
    return not pure.is_absolute() and ".." not in pure.parts


def read_coords(entry: dict, where: str, errors: list[str]) -> tuple[float, float] | None:
    has_lat, has_lon = entry.get("lat") is not None, entry.get("lon") is not None
    if not has_lat and not has_lon:
        return None
    if has_lat != has_lon:
        errors.append(both(f"{where}: give both lat and lon", f"{where}: informe lat e lon juntos"))
        return None
    try:
        lat, lon = float(entry["lat"]), float(entry["lon"])
    except (TypeError, ValueError):
        errors.append(both(f"{where}: lat/lon must be numbers", f"{where}: lat/lon devem ser números"))
        return None
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        errors.append(both(f"{where}: lat/lon out of range", f"{where}: lat/lon fora do intervalo"))
        return None
    return lat, lon


def build_place(entry: dict, where: str, taken: set[str], errors: list[str]) -> dict:
    name = str(entry["name"])
    place_id = unique_id(slug(str(entry.get("id") or name)), taken)
    taken.add(place_id)
    coords = read_coords(entry, where, errors)
    if entry.get("photo") and not safe_relative(entry["photo"]):
        errors.append(both(f"{where}: photo must be a path inside the project",
                           f"{where}: a foto precisa ser um caminho dentro do projeto"))
    return {
        "id": place_id,
        "name": name,
        "lat": coords[0] if coords else None,
        "lon": coords[1] if coords else None,
        "query": str(entry.get("query") or entry.get("address") or name),
        **{field: entry.get(field) for field in PLACE_FIELDS},
    }


def declared_places(raw: dict, errors: list[str]) -> list[dict]:
    taken: set[str] = set()
    places: list[dict] = []
    if isinstance(raw.get("home"), dict):
        if raw["home"].get("name"):
            home = {**raw["home"], "id": "home", "type": "home"}
            places.append(build_place(home, "home", taken, errors))
        else:
            errors.append(both("home: name is required", "home: falta o nome"))
    entries = raw.get("places") or []
    if not isinstance(entries, list):
        errors.append(both("places must be a list", "places precisa ser uma lista"))
        return places
    for index, entry in enumerate(entries, 1):
        where = f"places[{index}]"
        if not isinstance(entry, dict) or not entry.get("name"):
            errors.append(both(f"{where}: name is required", f"{where}: falta o nome"))
            continue
        places.append(build_place(entry, where, taken, errors))
    return places


def build_days(raw: dict, start: dt.date, places: list[dict], errors: list[str]) -> tuple[list[dict], list[dict]]:
    """Return (days, places), adding a place for every name that only appears in a day item."""
    all_places = list(places)
    taken = {p["id"] for p in all_places}
    lookup = {key: p for p in all_places for key in (p["id"], norm_key(p["name"]), norm_key(p["query"]))}
    days: list[dict] = []
    for index, entry in enumerate(raw.get("days") or [], 1):
        where = f"days[{index}]"
        if not isinstance(entry, dict):
            errors.append(both(f"{where}: must be a mapping", f"{where}: formato inválido"))
            continue
        date = parse_date(entry["date"]) if entry.get("date") else start + dt.timedelta(days=index - 1)
        if date is None:
            errors.append(both(f"{where}: date must be YYYY-MM-DD", f"{where}: use a data como AAAA-MM-DD"))
            continue
        items: list[dict] = []
        for k, item in enumerate(entry.get("items") or [], 1):
            if not isinstance(item, dict) or not item.get("text"):
                errors.append(both(f"{where}.items[{k}]: text is required", f"{where}.items[{k}]: falta o texto"))
                continue
            place_id = None
            if item.get("place"):
                query = str(item["place"])
                found = lookup.get(query) or lookup.get(norm_key(query))
                if found is None:
                    # "Ray's, Haleiwa": the part before the comma is the label, the whole string the search
                    entry_new = {"name": query.split(",")[0].strip(), "query": query, "type": item.get("type")}
                    found = build_place(entry_new, f"{where}.items[{k}]", taken, errors)
                    all_places.append(found)
                    lookup[norm_key(query)] = found
                place_id = found["id"]
            items.append({"time": parse_time(item.get("time")), "type": item.get("type"),
                          "text": str(item["text"]), "place": place_id})
        if not items:
            errors.append(both(f"{where}: needs at least one item", f"{where}: precisa de pelo menos um item"))
            continue
        days.append({"n": len(days) + 1, "date": date.isoformat(), "title": str(entry.get("title") or ""),
                     "area": str(entry.get("area") or ""), "route": entry.get("route", "road"),
                     "items": items, "route_via": entry.get("route_via") or []})
    return days, all_places


def build_stories(raw: dict, errors: list[str]) -> list[dict]:
    stories: list[dict] = []
    for index, entry in enumerate(raw.get("stories") or [], 1):
        where = f"stories[{index}]"
        coords = read_coords(entry, where, errors) if isinstance(entry, dict) else None
        if coords is None or not entry.get("title") or not entry.get("story"):
            errors.append(both(f"{where}: title, lat, lon and story are required", f"{where}: faltam title, lat, lon ou story"))
            continue
        paragraphs = entry["story"] if isinstance(entry["story"], list) else [entry["story"]]
        stories.append({"id": slug(str(entry.get("id") or entry["title"])), "title": str(entry["title"]), "lat": coords[0], "lon": coords[1],
                        "story": [str(p) for p in paragraphs], "places": [str(p) for p in entry.get("places") or []]})
    return stories


def choice(raw: dict, key: str, allowed: tuple[str, ...], default: str, errors: list[str]) -> str:
    value = raw.get(key, default)
    if value not in allowed:
        errors.append(both(f"{key} must be one of {', '.join(allowed)}", f"{key} precisa ser um de {', '.join(allowed)}"))
    return value


def unknown_key_warnings(raw: dict) -> list[str]:
    warnings = []
    for key in raw:
        if key not in TOP_LEVEL_KEYS:
            close = difflib.get_close_matches(key, TOP_LEVEL_KEYS, n=1)
            hint = f" ({close[0]}?)" if close else ""
            warnings.append(both(f"unknown key ignored: {key}{hint}", f"chave desconhecida ignorada: {key}{hint}"))
    return warnings


def normalize(raw: Any) -> dict:
    if not isinstance(raw, dict):
        raise TripError([both("trip file is empty or malformed", "arquivo da viagem vazio ou inválido")])
    errors: list[str] = []
    if not raw.get("title"):
        errors.append(both("title is required", "falta o title"))
    dates = raw.get("dates") if isinstance(raw.get("dates"), dict) else {}
    start = parse_date(dates.get("start"))
    if start is None:
        errors.append(both("dates.start is required (YYYY-MM-DD)", "falta dates.start (AAAA-MM-DD)"))
    if not raw.get("days") or not isinstance(raw.get("days"), list):
        errors.append(both("days must list at least one day", "days precisa ter pelo menos um dia"))
    if errors:
        raise TripError(errors)

    places = declared_places(raw, errors)
    days, places = build_days(raw, start, places, errors)
    if not places and not errors:
        errors.append(both("the trip needs at least one place", "a viagem precisa de pelo menos um lugar"))
    stories = build_stories(raw, errors)
    end = parse_date(dates.get("end")) if dates.get("end") else None
    if dates.get("end") and (end is None or end < start):
        errors.append(both("dates.end must be on or after dates.start", "dates.end não pode ser antes de dates.start"))

    units = raw.get("units") or {}
    regions = raw.get("regions") or {}
    max_km = regions.get("max_km", DEFAULT_MAX_REGION_KM)
    if not isinstance(max_km, (int, float)) or max_km <= 0:
        errors.append(both("regions.max_km must be a positive number", "regions.max_km precisa ser um número positivo"))
    modules = raw.get("modules") or {}
    downloads = raw.get("downloads") or []
    for path in [*downloads, *[raw[k] for k in ("surf_spots", "landmarks") if raw.get(k)]]:
        if not safe_relative(path):
            errors.append(both(f"downloads: {path} must be inside the project",
                               f"downloads: {path} precisa estar dentro do projeto"))
    result = {
        "title": str(raw.get("title")),
        "subtitle": str(raw.get("subtitle") or ""),
        "start": start.isoformat(),
        "end": end.isoformat() if end else (days[-1]["date"] if days else start.isoformat()),
        "timezone": raw.get("timezone"),
        "language": choice(raw, "language", LANGUAGES, "en", errors),
        "units": {
            "temp": choice(units, "temp", TEMP_UNITS, "C", errors),
            "distance": choice(units, "distance", DISTANCE_UNITS, "km", errors),
            "waves": choice(units, "waves", WAVE_UNITS, "ft", errors),
        },
        "region_max_km": max_km,
        "region_titles": regions.get("titles") or {},
        "modules": {
            "weather": modules.get("weather", True),
            "surf": modules.get("surf", False),
            "tides": modules.get("tides", False),
            "landmarks": modules.get("landmarks", "auto"),
        },
        "services": raw.get("services") or {},
        "places": places,
        "days": days,
        "stories": stories,
        "downloads": downloads,
        "surf_spots": raw.get("surf_spots"),
        "tide_stations": raw.get("tide_stations") or [],
        "landmarks": raw.get("landmarks"),
        "warnings": unknown_key_warnings(raw),
    }
    if errors:
        raise TripError(errors)
    return result


def load_trip(path: str | Path) -> dict:
    try:
        raw = yaml.safe_load(Path(path).read_text(encoding="utf-8"))
    except OSError as exc:
        raise TripError([both(f"cannot read {path}: {exc}", f"não consegui ler {path}: {exc}")]) from exc
    except yaml.YAMLError as exc:
        raise TripError([both(f"invalid YAML: {exc}", f"YAML inválido: {exc}")]) from exc
    return normalize(raw)

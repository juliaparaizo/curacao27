"""Assemble dist/: the site template plus this trip's data, theme, fonts, photos and icons."""
from __future__ import annotations

import hashlib
import html
import io
import json
import math
import re
import shutil
import tarfile
from pathlib import Path
from urllib.parse import quote

import numpy as np
import requests
from PIL import Image, ImageDraw, ImageOps

from .geocode import USER_AGENT
from .regions import haversine_km
from .schema import slug
from .tides import write_tides

SITE_DIR = Path(__file__).resolve().parent.parent / "site"
PHOTO_MAX_PX = 1400
PHOTO_QUALITY = 84
WHITE_BORDER = 245
FONT_WEIGHTS = (400, 500, 600, 700)
DERIVED_COLORS = """:root {
  --ink2: color-mix(in srgb, var(--ink) 82%, var(--card));
  --muted: color-mix(in srgb, var(--ink) 68%, var(--card));
  --soft: color-mix(in srgb, var(--ink) 6%, var(--card));
  --soft-accent: color-mix(in srgb, var(--accent) 28%, var(--card));
  --accent-ink: color-mix(in srgb, #000 72%, var(--accent));
}
"""
DAY_COLORS = ("#E07A2E", "#2E8C89", "#C2316A", "#3F7A3A", "#6D4BA0", "#D9553B",
              "#1F7FA6", "#9A6B2E", "#55692A", "#B8452F", "#2B8FB0", "#7A4E8C")
TERRAIN_TILES_CREDIT = (
    "Terrain Tiles: ArcticDEM terrain data DEM(s) were created from DigitalGlobe, Inc., imagery and funded under National "
    "Science Foundation awards 1043681, 1559691, and 1542736; Australia terrain data © Commonwealth of Australia "
    "(Geoscience Australia) 2017; Austria terrain data © offene Daten Österreichs, Digitales Geländemodell (DGM) "
    "Österreich; Canada terrain data contains information licensed under the Open Government Licence, Canada; Europe "
    "terrain data produced using Copernicus data and information funded by the European Union, EU-DEM layers; Global "
    "ETOPO1 terrain data U.S. National Oceanic and Atmospheric Administration; Mexico terrain data source: INEGI, "
    "Continental relief, 2016; New Zealand terrain data Copyright 2011 Crown copyright (c) Land Information New Zealand "
    "and the New Zealand Government (All rights reserved); Norway terrain data © Kartverket; United Kingdom terrain data "
    "© Environment Agency copyright and/or database right 2015. All rights reserved; United States 3DEP (formerly NED) "
    "and global GMTED2010 and SRTM terrain data courtesy of the U.S. Geological Survey."
)
COPERNICUS_CREDIT = ("Produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH "
                     "2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved")
WORLDCOVER_CREDIT = ("© ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data (2021) processed by ESA "
                     "WorldCover consortium")


def credits(modules: dict, fonts: list[str]) -> list[dict]:
    items = [
        {"text": "© OpenStreetMap contributors, Overture Maps Foundation. Data available under the Open Database License.",
         "url": "https://www.openstreetmap.org/copyright"},
        {"text": COPERNICUS_CREDIT, "url": "https://dataspace.copernicus.eu/"},
        {"text": WORLDCOVER_CREDIT, "url": "https://esa-worldcover.org/"},
        {"text": TERRAIN_TILES_CREDIT, "url": "https://github.com/tilezen/joerd/blob/master/docs/attribution.md"},
        {"text": "Routes: FOSSGIS OSRM, data © OpenStreetMap contributors. Fix the map.",
         "url": "https://www.openstreetmap.org/fixthemap"},
        {"text": "Place search: Photon by komoot, data © OpenStreetMap contributors.", "url": "https://photon.komoot.io/"},
    ]
    if modules["weather"] or modules["surf"]:
        items.append({"text": "Weather data by Open-Meteo (CC BY 4.0).", "url": "https://open-meteo.com/"})
    if modules["tides"]:
        items.append({"text": "Tide predictions: NOAA CO-OPS.", "url": "https://tidesandcurrents.noaa.gov/"})
    items.append({"text": f'Fonts under the SIL Open Font License: {", ".join(fonts)}.', "url": "https://openfontlicense.org/"})
    return items


def trim_white(image: Image.Image) -> Image.Image:
    pixels = np.asarray(image.convert("L"))
    keep_rows, keep_cols = np.nonzero((pixels < WHITE_BORDER).any(axis=1))[0], np.nonzero((pixels < WHITE_BORDER).any(axis=0))[0]
    if not len(keep_rows) or not len(keep_cols):
        return image
    return image.crop((int(keep_cols[0]), int(keep_rows[0]), int(keep_cols[-1]) + 1, int(keep_rows[-1]) + 1))


def write_photo(source: Path, target: Path) -> None:
    with Image.open(source) as image:
        fixed = trim_white(ImageOps.exif_transpose(image).convert("RGB"))
    fixed.thumbnail((PHOTO_MAX_PX, PHOTO_MAX_PX))
    target.parent.mkdir(parents=True, exist_ok=True)
    fixed.save(target, quality=PHOTO_QUALITY, optimize=True, progressive=True)  # re-encoding also drops GPS from EXIF


def font_files(family: str, cache_dir: Path) -> dict[int, bytes]:
    """Fetch a font's latin files from its @fontsource package, without needing Node."""
    name = re.sub(r"\s+", "-", family.strip().lower())
    package = cache_dir / f"font-{name}.tgz"
    if not package.exists():
        info = requests.get(f"https://registry.npmjs.org/@fontsource/{name}/latest",
                            headers={"User-Agent": USER_AGENT}, timeout=30)
        if info.status_code == 404:
            raise OSError(f'font "{family}" not found on @fontsource')
        info.raise_for_status()
        tarball = requests.get(info.json()["dist"]["tarball"], headers={"User-Agent": USER_AGENT}, timeout=60)
        tarball.raise_for_status()
        package.parent.mkdir(parents=True, exist_ok=True)
        package.write_bytes(tarball.content)
    found: dict[int, bytes] = {}
    with tarfile.open(fileobj=io.BytesIO(package.read_bytes())) as archive:
        for weight in FONT_WEIGHTS:
            try:
                # shortcut: latin subset only, other scripts use the system font
                found[weight] = archive.extractfile(f"package/files/{name}-latin-{weight}-normal.woff2").read()
            except (KeyError, AttributeError):
                continue
    if not found:
        raise OSError(f'font "{family}" has no latin files')
    return found


def install_fonts(theme: dict, out_dir: Path, cache_dir: Path) -> tuple[str, list[str]]:
    faces, names = [], []
    (out_dir / "fonts").mkdir(parents=True, exist_ok=True)
    for family in dict.fromkeys(theme["fonts"][k] for k in ("display", "body", "mono")):
        names.append(family)
        for weight, data in font_files(family, cache_dir).items():
            file_name = f"{slug(family)}-{weight}.woff2"
            (out_dir / "fonts" / file_name).write_bytes(data)
            faces.append(f'@font-face{{font-family:"{family}";font-weight:{weight};font-display:swap;'
                         f'src:url("../fonts/{file_name}") format("woff2")}}')
    return "\n".join(faces), names


def theme_css(theme: dict, faces: str) -> str:
    colors = "".join(f"--{key}:{value};" for key, value in theme["colors"].items())
    fonts = theme["fonts"]
    return (f'{faces}\n:root{{{colors}--draw:"{fonts["display"]}",system-ui,sans-serif;'
            f'--sans:"{fonts["body"]}",system-ui,sans-serif;--mono:"{fonts["mono"]}",ui-monospace,monospace;'
            f'--thin:{fonts.get("display_thin", 0)}}}\n{DERIVED_COLORS}')


def write_icons(theme: dict, out_dir: Path) -> None:
    ink, accent = theme["colors"]["ink"], theme["colors"]["accent"]
    (out_dir / "icons").mkdir(parents=True, exist_ok=True)
    for name, size, pad in (("icon-180", 180, 0.12), ("icon-192", 192, 0.12), ("icon-512", 512, 0.12), ("maskable-512", 512, 0.24)):
        image = Image.new("RGB", (size, size), ink)
        edge, span = size * pad, size * (1 - 2 * pad)
        ImageDraw.Draw(image).polygon([(edge, edge + span * 0.78), (edge + span * 0.38, edge + span * 0.22),
                                       (edge + span * 0.6, edge + span * 0.52), (edge + span * 0.72, edge + span * 0.38),
                                       (edge + span, edge + span * 0.78)], fill=accent)
        image.save(out_dir / "icons" / f"{name}.png", optimize=True)


def site_places(trip: dict, photos: frozenset[str]) -> list[dict]:
    """Places as the site reads them, with the items that happen at each one."""
    items: dict[str, list[dict]] = {}
    for day in trip["days"]:
        for item in day["items"]:
            if item["place"]:
                items.setdefault(item["place"], []).append({"day": day["n"], "time": item["time"], "text": item["text"]})
    keep = ("id", "name", "lat", "lon", "type", "desc", "tip", "photo_focus", "model", "camera", "map", "spot")
    return [{**{k: p.get(k) for k in keep}, "photo": p["id"] in photos, "maps": p.get("maps") or p["query"],
             "items": items.get(p["id"], [])} for p in trip["places"]]


def mean_longitude(longitudes: list[float]) -> float:
    """A plain average of 179.9 and -179.9 would land on the other side of the planet."""
    x = sum(math.cos(math.radians(lon)) for lon in longitudes)
    y = sum(math.sin(math.radians(lon)) for lon in longitudes)
    return math.degrees(math.atan2(y, x))


def site_days(trip: dict, theme: dict) -> list[dict]:
    custom = theme.get("ui", {}).get("day_colors", "auto")
    palette = custom if isinstance(custom, list) and custom else DAY_COLORS
    places = {p["id"]: p for p in trip["places"]}
    titles = {m["id"]: m["title"] for m in trip["maps"]}
    zones = {m["id"]: m["timezone"] for m in trip["maps"]}
    days = []
    for day in trip["days"]:
        stops = [places[leg_stop] for leg in day["legs"] for leg_stop in leg["stops"]]
        center = [sum(p["lat"] for p in stops) / len(stops), mean_longitude([p["lon"] for p in stops])] if stops else None
        days.append({"n": day["n"], "date": day["date"], "title": day["title"], "color": palette[(day["n"] - 1) % len(palette)],
                     "area": day["area"] or " · ".join(dict.fromkeys(titles[leg["map"]] for leg in day["legs"])) or titles[day["map"]],
                     "items": [{**i, "type": i["type"] or (places[i["place"]]["type"] if i["place"] else "sight")} for i in day["items"]],
                     "legs": day["legs"], "map": day["map"], "crosses": day["crosses_maps"], "tz": zones[day["map"]], "center": center})
    return days


def story_map(story: dict, maps: list[dict]) -> str:
    """The map closest to where the story happens."""
    return min(maps, key=lambda m: haversine_km(story["lat"], story["lon"], *m["center"]))["id"]


def site_data(trip: dict, theme: dict, font_names: list[str], photos: frozenset[str] = frozenset()) -> dict:
    maps = []
    for item in trip["maps"]:
        box = item["bbox"]
        maps.append({"id": item["id"], "title": item["title"], "timezone": item["timezone"], "places": item["places"], "bbox": box,
                     "center": [(box["lat0"] + box["lat1"]) / 2, mean_longitude([box["lon0"], box["lon1"]])]})
    place_map = {place: m["id"] for m in trip["maps"] for place in m["places"]}
    placed = {**trip, "places": [{**p, "map": place_map[p["id"]]} for p in trip["places"]]}
    return {
        "title": trip["title"], "subtitle": trip["subtitle"], "start": trip["start"], "end": trip["end"],
        "language": trip["language"], "units": trip["units"], "modules": trip["modules"],
        "overview": len(maps) > 1, "maps": maps, "places": site_places(placed, photos), "days": site_days(trip, theme),
        "stories": [{**story, "map": story_map(story, maps)} for story in trip["stories"]], "downloads": [Path(p).name for p in trip["downloads"]],
        "apikey": trip["services"].get("open_meteo_key"), "custom_landmarks": bool(trip["landmarks"]),
        "pins": theme.get("pins", {}).get("types", {}), "brand": theme.get("brand", {}), "ui": theme.get("ui", {}),
        "palette": {"bg": theme["colors"]["bg"], "card": theme["colors"]["card"]},
        "credits": credits(trip["modules"], font_names),
    }


def fill_template(text: str, trip: dict, theme: dict) -> str:
    brand = theme.get("brand", {})
    values = {"TITLE": trip["title"], "LANG": trip["language"], "BRAND": brand.get("name") or trip["title"],
              "BADGE": str(brand.get("badge") or ""), "BADGE_STYLE": str(brand.get("badge_style") or "highlighter"), "SUBTITLE": trip["subtitle"], "THEME_COLOR": theme["colors"]["ink"]}
    return re.sub(r"\{\{(\w+)\}\}", lambda m: html.escape(values[m[1]], quote=True), text)


def write_service_worker(out_dir: Path, trip: dict) -> None:
    files = sorted(str(p.relative_to(out_dir)) for p in out_dir.rglob("*")
                   if p.is_file() and p.name != "sw.js" and not p.parts[len(out_dir.parts)].startswith("."))
    digest = hashlib.sha1()
    for name in files:
        digest.update((out_dir / name).read_bytes())
    name = slug(trip["title"])
    template = (SITE_DIR / "sw.js").read_text(encoding="utf-8")
    (out_dir / "sw.js").write_text(template.replace("'__CORE__'", json.dumps(["./", *(quote(name) for name in files)]))
                                   .replace("__VERSION__", f"{name}-{digest.hexdigest()[:10]}").replace("__NAME__", name), encoding="utf-8")


def copy_trip_files(trip: dict, trip_dir: Path, out_dir: Path) -> list[str]:
    notes: list[str] = []
    for place in trip["places"]:
        if place.get("photo"):
            source = trip_dir / place["photo"]
            if source.exists():
                write_photo(source, out_dir / "img" / f'{place["id"]}.jpg')
            else:
                notes.append(f'photo not found: {place["photo"]}')
    for path in trip["downloads"]:
        source = trip_dir / path
        if source.exists():
            (out_dir / "files").mkdir(exist_ok=True)
            shutil.copy2(source, out_dir / "files" / source.name)
        else:
            notes.append(f"download not found: {path}")
    if trip["landmarks"]:
        shutil.copy2(trip_dir / trip["landmarks"], out_dir / "data" / "landmarks.js")
    return notes


def assemble(trip: dict, theme: dict, tides: dict | None, trip_dir: Path, out_dir: Path, cache_dir: Path) -> list[str]:
    shutil.copytree(SITE_DIR, out_dir, dirs_exist_ok=True)
    (out_dir / "data").mkdir(parents=True, exist_ok=True)
    faces, font_names = install_fonts(theme, out_dir, cache_dir)
    (out_dir / "data" / "theme.css").write_text(theme_css(theme, faces), encoding="utf-8")
    photos = frozenset(p["id"] for p in trip["places"] if p.get("photo") and (trip_dir / p["photo"]).exists())
    data = site_data(trip, theme, font_names, photos)
    write_tides(tides, out_dir)
    (out_dir / "data" / "trip.js").write_text(
        "window.TRIP=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    for page in ("index.html", "roteiro.html"):
        (out_dir / page).write_text(fill_template((SITE_DIR / page).read_text(encoding="utf-8"), trip, theme), encoding="utf-8")
    manifest = {"name": trip["title"], "short_name": trip["title"][:12], "start_url": "./index.html", "display": "standalone",
                "background_color": theme["colors"]["bg"], "theme_color": theme["colors"]["ink"],
                "icons": [{"src": f"icons/icon-{s}.png", "sizes": f"{s}x{s}", "type": "image/png"} for s in (192, 512)]
                + [{"src": "icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]}
    (out_dir / "manifest.webmanifest").write_text(json.dumps(manifest), encoding="utf-8")
    write_icons(theme, out_dir)
    notes = copy_trip_files(trip, trip_dir, out_dir)
    write_service_worker(out_dir, trip)
    return notes

<div align="center">

# trip-map-3d

**Describe your trip in one file. Push. Get a website with a real 3D map, anywhere in the world.**

[![License: MIT](https://img.shields.io/badge/license-MIT-2ea44f.svg)](LICENSE)
[![Build and publish](https://github.com/orodmorais/trip-map-3d/actions/workflows/deploy.yml/badge.svg)](https://github.com/orodmorais/trip-map-3d/actions/workflows/deploy.yml)
![Python 3.12+](https://img.shields.io/badge/python-3.12%2B-3776AB.svg?logo=python&logoColor=white)
![three.js](https://img.shields.io/badge/three.js-no%20framework-000000.svg?logo=threedotjs&logoColor=white)
![Works offline](https://img.shields.io/badge/PWA-works%20offline-5A0FC8.svg)
![Built with Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-D97757.svg)

**English** · [Português](docs/i18n/README.pt-BR.md) · [Español](docs/i18n/README.es.md) · [Italiano](docs/i18n/README.it.md) · [Français](docs/i18n/README.fr.md) · [Deutsch](docs/i18n/README.de.md) · [简体中文](docs/i18n/README.zh-CN.md) · [日本語](docs/i18n/README.ja.md) · [한국어](docs/i18n/README.ko.md)

![Opening a day of the trip: the route draws itself along real roads](docs/demo.gif)

![The same template building Europe, Rio, O'ahu and Utah](docs/screenshots/m4-site.jpg)

</div>

I wanted to plan a trip with something I could actually see. On a flat map, a short drive and a steep trail look the same. In 3D you see the ridge before you commit to the hike, and you get a real sense of how much of the day (and of the gas tank) a route will take.

So I built it for my own trip to O'ahu, and then turned it into a template for any destination. You describe the trip in one file and get a static website: one real 3D map per region, an animated route for every day, pins and cards for every place, a day-by-day page for your phone, and the weather for each day.

> No servers to run, and no API keys for personal use (a GitHub account is all the no-code path needs). One YAML file in, one folder of static files out. GitHub Actions rebuilds it every time you edit the trip.

**Live demos:** [Europe](https://orodmorais.github.io/trip-map-3d/) · [O'ahu](https://orodmorais.github.io/trip-map-3d/oahu/) (in Portuguese) · **Five example trips:** [examples/](examples/) · **Test report:** [docs/TEST_REPORT.md](docs/TEST_REPORT.md)

---

## At a glance

| | What you get |
|---|---|
| 🗺️ **3D map** | Terrain, sea depth, rivers, roads, buildings and vegetation, all from open data, painted with your theme's palette |
| 🧭 **Day routes** | Each day's route follows real roads, draws itself, and is framed automatically to stay clear of the card |
| 🌍 **Long trips** | Places far apart become separate maps joined by an overview. Lisbon, Rome and the Alps are three maps, not one flat blur |
| 📍 **Pins and cards** | Every place gets a pin, a card, a photo, a tip, and an optional 3D landmark |
| 🔎 **Search and filters** | By name or type, ignoring accents |
| 📱 **Itinerary page** | The whole trip, day by day, made for reading on a phone |
| ⛅ **Weather** | A forecast for each day of the trip, plus sunrise and sunset |
| 📡 **Today mode and offline** | Opens on today, shows where you are with a blue dot, installs as an app and works without signal |
| 🌊 **Optional modules** | Surf spots scored 0 to 5, tides, your own 3D models |
| 🎨 **Fully themeable** | Fonts, colors, map palette, pin icons, badge style. Three presets included |
| 🗣️ **Site languages** | English, Portuguese and Spanish, with °C or °F and km or miles |

---

## Gallery

The same template, five different trips. Every screenshot is a real build from [examples/](examples/).

| Lisbon + Rome + Alps, 12 days | Rio de Janeiro, 5 days | Utah's parks, 7 days |
|---|---|---|
| ![Europe](docs/screenshots/europe/desktop-day.jpg) | ![Rio](docs/screenshots/rio/desktop-day.jpg) | ![Utah](docs/screenshots/utah/desktop-day.jpg) |
| **O'ahu, 6 days** | **Toledo, 1 day** | **On a phone** |
| ![O'ahu](docs/screenshots/oahu/desktop-day.jpg) | ![Toledo](docs/screenshots/day-trip/desktop-day.jpg) | ![Phone](docs/screenshots/europe/mobile-day.jpg) |

---

## Quick start

Pick the path that fits you. They all end in the same `trip.yaml`.

| You are | Use |
|---|---|
| Not a coder | **Use this template** on GitHub, edit `trip.yaml` in the browser |
| Using Claude in a chat | Paste [MASTER_PROMPT.md](MASTER_PROMPT.md), answer the questions, paste the file it writes |
| Using Claude Code | Point it at [SKILL.md](SKILL.md): it interviews you, builds, checks screenshots and publishes |
| A developer | Clone, `python -m pipeline build trip.yaml` |

### No code, on GitHub

1. Click **Use this template** and create your repository.
2. Go to **Settings → Pages** and set **Source** to **GitHub Actions**. This is the only manual step.
3. Open `trip.yaml`, click the pencil, describe your trip, and commit.
4. Wait a few minutes. Your site appears at `https://YOUR-USER.github.io/YOUR-REPOSITORY`.

> [!WARNING]
> On a free GitHub account, GitHub Pages only works with **public** repositories. Your `trip.yaml` and your site are visible to anyone with the link: itinerary, dates, everything. Write the neighborhood where you stay, never the street address. Leave out flight numbers, door codes and where keys are kept.

---

## The trip file

Only three fields are required. The build works out the rest (time zone, regions, coordinates, routes) and prints everything it inferred so you can review it.

```yaml
title: "Toledo in a day"
dates: {start: 2027-04-18}
language: en

days:
  - items:
      - {text: "Cathedral", place: "Catedral de Toledo"}
      - {text: "Alcazar", place: "Alcazar de Toledo"}
```

> [!TIP]
> Always add the city to a place name: `"Pantheon, Roma"`, not `"Pantheon"`. If the search still picks the wrong place, give it `lat` and `lon` under `places:` instead of retrying.

### Main fields

| Field | Required | What it does |
|---|:---:|---|
| `title` | ✅ | Name of the site |
| `dates.start` | ✅ | First day. Each day's date follows from its position |
| `days[].items` | ✅ | What you do, in order. A place can be just a name |
| `subtitle` | | One short line under the title |
| `language` | | `en`, `pt-BR` or `es` |
| `units` | | `temp: C/F`, `distance: km/mi`, `waves: ft/m` |
| `home` | | Where you sleep. Becomes the home pin |
| `places` | | Full detail for a place: coordinates, type, description, tip, photo, 3D model, camera |
| `regions.max_km` | | Largest side of one 3D map. Regions adapt to the trip below that |
| `modules` | | `weather`, `surf`, `tides`, `landmarks` |
| `services` | | Your own geocoder and router |
| `downloads` | | Extra files linked from the itinerary page |

Every field, with sample values: [examples/trip.example.yaml](examples/trip.example.yaml).

---

## Customize

| What | How |
|---|---|
| Colors, fonts, map palette | `theme.yaml` next to `trip.yaml`. See [the example](examples/theme.example.yaml) |
| Ready-made theme | `preset: oahu` (warm paper), `minimal` (grays and one blue) or `dark` |
| Hand-drawn titles | Any font on `@fontsource` with Latin files as `fonts.display`, thinned with `display_thin` |
| Pin color and icon by type | `pins.types: {surf: {color: "#1F7FA6", icon: wave}}` |
| 3D landmark for a place | `model: bridge`, `lighthouse`, `temple`, `tower`, `waterfall`, `pier`, `islet`, `airport`, `house` or `ridge_stairs` |
| Your own 3D models | `landmarks: landmarks.js` in `trip.yaml`. See [the O'ahu example](examples/oahu/landmarks.js) |
| Camera for a place | `camera: {zoom: 7, dir: [0.4, 0.6, 0.7]}` |
| Name of a map | `regions: {titles: {Lauterbrunnen: "Swiss Alps"}}` |
| Surf and tides | `modules: {surf: true, tides: true}` and `surf_spots: spots.yaml` |
| A day with no roads (boat, hike) | `route: line` on that day |
| Your own servers | `services: {geocoder: ..., router: ...}` |
| Clouds, animated sea, day colors | `ui:` in `theme.yaml` |

---

## Modules

| Module | Default | Source | Notes |
|---|:---:|---|---|
| Weather | on | Open-Meteo forecast | 16 days ahead. Further out, sunrise and sunset only |
| 3D landmarks | auto | Built-in kit, or your `landmarks.js` | Placed from `model:` on each place |
| Surf | off | Open-Meteo marine | Each spot scored 0 to 5 from swell size, period and wind |
| Tides | off | NOAA CO-OPS in the US, Open-Meteo marine elsewhere | US tables are saved at build time, so they work offline. Outside the US the estimate is rougher |

---

## Run it on your computer

Requires Python 3.12 or newer.

```bash
python -m pip install -r requirements.txt
python -m pipeline check trip.yaml        # finds every place and prints what it found
python -m pipeline build trip.yaml --out dist
python -m http.server --directory dist    # open http://localhost:8000
```

To check a build visually, the way the skill does:

```bash
python -m pip install -r requirements-dev.txt
python tools/check_site.py dist --shots shots --hashes "" dia-1
```

`check_site.py` opens the site in a headless browser, saves screenshots and reports any error. `tools/check_trip.py dist --name NAME --shots FOLDER` runs the full release checklist from the test report: pins fit, no route under a card, no empty background, search, weather, today mode, offline.

### Publishing

| Host | Setup |
|---|---|
| **GitHub Pages** (default) | Settings → Pages → Source: GitHub Actions |
| **Cloudflare Pages** | Add the `CLOUDFLARE_PROJECT` variable and the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets. The workflow switches by itself |
| **Anywhere else** | Upload `dist/`. It is plain static files |

---

## How it works

```
trip.yaml ──▶ 1. Trip ──▶ 2. Regions ──▶ 3. Map ──▶ 4. Site ──▶ dist/
               │            │              │           │
               │            │              │           └─ static three.js, no framework, offline
               │            │              └─ terrain + land cover + roads + rivers, painted
               │            └─ shortest network between places, longest links cut
               └─ validate, geocode once, cache in trip.lock.json
```

1. **Trip.** Validates the file, finds every place and stores the answers in `trip.lock.json`, so each name is looked up once, ever.
2. **Regions.** Joins all places with the shortest possible network, then cuts the longest links. A road trip stays on one map; two places a thousand kilometers apart become two maps.
3. **Map.** Combines elevation, sea depth, land cover, roads, buildings and rivers into a height field and a texture painted with the theme's palette.
4. **Site.** Writes a static three.js site, with a service worker so it keeps working offline.

### Measured

From [docs/TEST_REPORT.md](docs/TEST_REPORT.md): every day of every trip opened at 1440×900 and 390×844, in Chrome on a MacBook Air.

| Trip | First build | Site size | JS errors | fps (desktop / phone-size viewport) |
|---|---:|---:|---:|---|
| O'ahu, 6 days | 180 s | 3.8 MB | 0 | 30 / 58 |
| Rio de Janeiro, 5 days | 84 s | 4.8 MB | 0 | 60 / 60 |
| Utah's parks, 7 days | 53 s | 4.8 MB | 0 | 60 / 61 |
| Toledo, 1 day | 34 s | 3.6 MB | 0 | 60 / 60 |
| Lisbon + Rome + Alps, 12 days | 72 s | 13.8 MB | 0 | 60 / 60 |

First builds include every download. With a warm cache they take 6 to 24 s. The first-build times are from the run before the last fixes, as the [test report](docs/TEST_REPORT.md) says.

> [!NOTE]
> The phone column is a phone-sized viewport on a Mac GPU, not a real phone. Real-device frame rates have not been measured yet. Below 24 fps the site switches to a lighter picture by itself.

---

## What's inside

```
trip-map-3d/
├── trip.yaml                 # your trip: the only file you need to edit
├── trip.lock.json            # every place already looked up. Commit it, never delete it
├── pipeline/                 # Python build: trip → regions → map → site
│   ├── schema.py             #   validates trip.yaml and fills in defaults
│   ├── geocode.py            #   Photon lookups, cached in trip.lock.json
│   ├── routes.py             #   OSRM road routes, cached like places
│   ├── regions.py            #   splits the trip into maps
│   ├── terrain.py            #   Copernicus GLO-30 on land, Terrarium at sea, despiked
│   ├── vectors.py            #   Overture roads, rivers, runways, towns, buildings
│   ├── scene.py              #   trees, palms and buildings from land cover
│   ├── texture.py            #   paints the map with the theme's palette
│   ├── theme.py              #   presets + theme.yaml
│   ├── surf.py · tides.py    #   optional modules
│   ├── site.py               #   assembles dist/: template, data, theme, fonts, photos
│   └── __main__.py           #   `python -m pipeline check|build`
├── site/                     # static front end, no framework
│   ├── app.js                #   main screen: camera, pins, filters, URL routes
│   ├── world.js              #   terrain, sea, vegetation, buildings
│   ├── framing.js            #   fits the day's route in the free space beside the card
│   ├── routes3d.js           #   animated routes
│   ├── callouts.js           #   photo callouts beside the day's route
│   ├── landmarks.js          #   built-in 3D landmark kit
│   ├── cards.js · search.js  #   cards, search
│   ├── weather.js · surf.js · tides.js
│   ├── live.js               #   today mode, blue dot, offline banner
│   ├── roteiro.html          #   day-by-day itinerary page
│   ├── i18n.js               #   en, pt-BR, es. Add a language with one block here and its code in LANGUAGES in pipeline/schema.py
│   ├── sw.js                 #   service worker
│   └── vendor/               #   three.js, vendored
├── presets/                  # oahu · minimal · dark
├── examples/                 # five full trips + every field documented
├── tools/                    # check_site.py, check_trip.py: checks in a real browser
├── tests/                    # 51 pytest tests
├── .github/workflows/        # build on push, publish to Pages or Cloudflare
├── SKILL.md                  # for Claude Code
├── MASTER_PROMPT.md          # for Claude in a chat
├── DATA_SOURCES.md           # every source, measured, with limits and licenses
└── DECISOES.md               # design decisions and why (Portuguese)
```

---

## Data sources and licenses

Every source was checked with real requests before being chosen. Measurements, limits and rejected alternatives are in [DATA_SOURCES.md](DATA_SOURCES.md).

| Need | Source | License | When |
|---|---|---|---|
| Land elevation | Copernicus GLO-30 (AWS open data) | Free, notice required | Build |
| Sea depth | AWS Terrain Tiles (Terrarium) | Attribution list | Build |
| Land, sea, land cover | ESA WorldCover 2021 | CC BY 4.0 | Build |
| Roads, buildings, towns | Overture Maps | ODbL and others | Build |
| Place search | Photon (komoot) | ODbL data | Build, once per place |
| Road routes | FOSSGIS OSRM | ODbL data | Build, once per route |
| Weather, surf | Open-Meteo | CC BY 4.0, **non-commercial** | In the browser |
| US tides | NOAA CO-OPS | Public domain | Build |

> [!IMPORTANT]
> **Open-Meteo's free API is for non-commercial use.** A travel agency or any paid product needs a paid key, set in `services.open_meteo_key`.
>
> **Keep the credits.** Every generated site shows the attributions these licenses require. Do not remove them.
>
> **Photos must be yours or licensed.** The template never downloads photos for you.
>
> **No public Nominatim.** Its usage policy forbids being built into tools like this one as a generic geocoder. Point `services.geocoder` to your own instance if you want it.

---

## Why it looks like this

- **3D, because a trip is physical.** The relief tells you what a drive, a walk or a trail will really cost you.
- **One map per region, not one giant map.** Zoom out far enough and the relief goes flat. I preferred relief that looks right, even if that meant splitting the trip into several maps.
- **Real roads.** If you care about this like I do, seeing the roads as they really are makes the route feel real and interactive.
- **3D landmarks.** Seeing the places that marked the trip (or will) in 3D makes the map something you actually want to use, not just another map app.
- **The whole route on screen.** Seeing a day from start to finish is what makes it click.
- **Relief that moves with you.** A dynamic topographic view gives you a better sense of the whole.
- **An endless sea and horizon.** The map feels infinite, but the detail stays where you'll actually be.
- **The most accurate sources I could find,** measured before choosing (see [DATA_SOURCES.md](DATA_SOURCES.md)).
- **Public.** I figured more people would want to plan their trips with something they can see.

All twelve decisions, with the alternatives I turned down: [DECISOES.md](DECISOES.md) (in Portuguese).

---

## Origin

I built the first version for a trip to O'ahu with three friends, in November 2026: the whole island in 3D, every beach, hike and surf spot, each day's route, live surf and weather, and a mode that opens on today. People who saw it asked for the code. My cousin, who works in trip planning, asked for a zipped copy before this repo even existed. So I made it work for anywhere.

The O'ahu example here keeps only public places, because the original was a personal trip. Still, I'm always open to questions about our O'ahu itinerary.

I designed the product and made the decisions in [DECISOES.md](DECISOES.md). [Claude Code](https://claude.com/claude-code) wrote the code, measured every data source before I approved it, and ran the template on five very different trips.

**Rodrigo Morais** · [@orodmorais](https://github.com/orodmorais) · [LinkedIn](https://www.linkedin.com/in/rodrigomorais-/)

## Contributing

Issues and pull requests are welcome, especially new 3D landmarks, new presets, site translations and example trips from places the template has not seen yet. Run `pytest` before opening a pull request.

## License

The code is [MIT](LICENSE). The map data inside each generated site stays under each source's own license (see above).

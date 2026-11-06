---
name: trip-map-3d
description: Build an interactive 3D map website of a trip, for any destination, from a conversation. Use when someone wants to turn a trip or itinerary into a website with real terrain, day routes and weather.
---

# trip-map-3d

Turn a trip into a website: a real 3D map per region, one animated route per day, pins, cards, weather, and offline support. Everything comes from one file, `trip.yaml`.

## 1. Ask about the trip

Ask for what you do not have, a few questions at a time:

- Where, when, and how many days.
- For each day: what they plan to do, and in what order. Names are enough.
- Where they stay. Warn them first that the site is public on a free GitHub account, so a neighborhood is enough. Never write a street address unless they insist after that warning.
- Language (`en`, `pt-BR`, `es`) and units.
- Optional: surf spots, tides, photos, a theme.

Photos must be their own or licensed. Do not download photos from the internet for them.

## 2. Write trip.yaml

Follow `examples/trip.example.yaml`. Only `title`, `dates.start` and `days` are required. Always add the city to a place name: `"Pantheon, Roma"`, not `"Pantheon"`.

## 3. Build and review

```bash
python -m pip install -r requirements.txt
python -m pipeline check trip.yaml
```

Read the report line by line with the user. The geocoder can be confidently wrong, so show them every place it found. Any line marked `CHECK` needs a look. If a place is wrong or missing, add `lat` and `lon` in `places:` instead of retrying the search.

Then build:

```bash
python -m pipeline build trip.yaml --out dist
python -m pip install -r requirements-dev.txt
python tools/check_site.py dist --shots shots --hashes "" dia-1
```

Open the screenshots and look at them before saying it works. Check that every place fits, no route sits under a card, and no error was printed.

## 4. Publish, only after the user confirms

Confirm the repository name and that it will be public. Then:

1. Push to a repository made from this template.
2. In Settings, Pages, set Source to GitHub Actions. This step is manual.
3. The workflow builds and publishes on every push.

## Rules

- Public services are shared. Never loop over them. `trip.lock.json` keeps every answer: commit it, and never delete it to retry.
- This project does not use the public Nominatim API. Its policy forbids being built into tools like this one as a generic geocoder. If the user asks for Nominatim, point them to the [usage policy](https://operations.osmfoundation.org/policies/nominatim/) and to `services.geocoder` for their own instance.
- The free Open-Meteo API is for non-commercial use. A travel agency needs a paid key: set `services.open_meteo_key`.
- Keep the data credits in the site. They are legally required (see `DATA_SOURCES.md`).

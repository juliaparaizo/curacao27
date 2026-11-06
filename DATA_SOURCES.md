# Data sources

Every external source used by trip-map-3d, checked with real requests on **2026-11-05**. Re-check before depending on anything new.

Status of the choices below: **approved** by the owner on 2026-11-05.

## Summary

| Need | Source | Live? | Key required | License | Used |
|---|---|---|---|---|---|
| Land elevation | Copernicus GLO-30 (AWS) | Yes | No | Free, notice required | Build |
| Sea depth | AWS Terrain Tiles (Terrarium) | Yes | No | Attribution list | Build |
| Land, sea and land cover | ESA WorldCover 2021 v200 | Yes | No | CC BY 4.0 | Build |
| Roads, buildings, towns, runways | Overture Maps | Yes | No | ODbL + others | Build |
| Geocoding | Photon (komoot) | Yes | No | ODbL data | Build, once |
| Road routes | FOSSGIS OSRM | Yes | No | ODbL data | Build, once |
| Timezone | Open-Meteo `timezone=auto` | Yes | No | CC BY 4.0 | Build |
| Weather | Open-Meteo forecast | Yes | No | CC BY 4.0, non-commercial | Browser |
| Surf and sea level (module) | Open-Meteo marine | Yes | No | CC BY 4.0, non-commercial | Browser |
| US tides (module) | NOAA CO-OPS | Yes | No | Public domain | Build |

### Rejected or demoted

| Source | Why |
|---|---|
| Public Nominatim as a default | Its policy bars it from being built into no-code platforms as a generic geocoding service. See below. |
| Overpass API as a dependency | One 504 in 3 tries, 23 to 58 s for a tiny query. Two of the four public mirrors tried timed out. |
| OSM land polygons (`osmdata.openstreetmap.de`) | Host refused connections on every try that day (IPv4 and IPv6). WorldCover does the job better. |
| OpenTopography | Requires an API key (HTTP 401 without one). |

## Elevation

### Copernicus GLO-30 (land)
- Access: `https://copernicus-dem-30m.s3.amazonaws.com/Copernicus_DSM_COG_10_{N|S}{lat}_00_{E|W}{lon}_00_DEM/...tif`. Cloud-optimized GeoTIFF, so only the needed window is read.
- Limits: none published for the AWS open data bucket. Registry note: some tiles covering specific countries are not released, so the build must fail with a clear message or fall back to Terrarium there.
- It is a surface model: heights include buildings and vegetation.
- **Required notice** (data is resampled, so the "adapted" form applies):
  > produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved
- Sources: [registry entry](https://registry.opendata.aws/copernicus-dem/), [license and notice](https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM).

### AWS Terrain Tiles, Terrarium (sea depth, fallback for land)
- Endpoint: `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` (mirror in `eu-central-1`).
- Decode: `(R * 256 + G + B / 256) - 32768` meters. Web Mercator. Includes bathymetry.
- Speed measured: about 0.5 s per tile, one at a time.
- Artifacts seen: 4 impossible pixels in Utah (157 m, in a region whose 0.1 percentile is 1113 m) and 159 sharp spikes in Rio. Needs a despike pass.
- **Required attribution:** the list in [`attribution.md`](https://github.com/tilezen/joerd/blob/master/docs/attribution.md). "You are responsible for researching each project": the build must print the whole list in the credits.

### Measured comparison

Highest value within 1.5 km of each summit, in meters. "Real" values are the commonly published heights, not a survey made here.

| Peak | Real | Terrarium z14 | Copernicus GLO-30 |
|---|---:|---:|---:|
| Pu'u Konahuanui | 960 | 945 | 919 |
| Ka'ala | 1220 | 1233 | 1223 |
| Diamond Head | 232 | 225 | 211 |
| Pao de Acucar | 396 | 304 | 329 |
| Corcovado | 710 | 651 | 660 |
| Pedra da Gavea | 844 | 779 | 795 |
| Eiger | 3967 | 3916 | 3955 |
| Jungfrau | 4158 | 4045 | 4092 |

Copernicus is closer on 6 of 8. Neither captures sharp monoliths: Pao de Acucar stays about 67 m short (17%).

Against the hand-built O'ahu DEM on the same grid: median difference about 7 m for both, p95 about 24 m. The real data shows much more detail than the hand-built one.

## Land, sea and land cover: ESA WorldCover 2021 v200

- Access: `https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/map/ESA_WorldCover_10m_2021_v200_{tile}_Map.tif`. 3 by 3 degree tiles, 36000 px, cloud-optimized with overviews.
- Speed measured: full O'ahu or Rio window in 0.9 to 1.4 s.
- Classes: 10 tree, 20 shrub, 30 grass, 40 crop, 50 built-up, 60 bare, 70 snow, 80 water, 90 wetland, 95 mangrove, 100 moss. Ocean is 0 or 80.
- **Coastline quality**, agreement (IoU) with the O'ahu reference land mask:

| Mask | IoU |
|---|---|
| WorldCover | **0.985** |
| Copernicus > 0.5 m | 0.959 |
| Terrarium > 0 m | 0.921 |

- **Required attribution** for a published map: `© ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium`.
- License: CC BY 4.0. Sources: [data access](https://esa-worldcover.org/en/data-access), [registry entry](https://registry.opendata.aws/esa-worldcover-vito/).
- Requires `rasterio` (1.5.2 installed cleanly on Python 3.14).

## Roads, buildings, towns, runways: Overture Maps

- Access: `overturemaps` Python package (2.0.0), which reads GeoParquet from public cloud storage by bounding box. No account, no shared-server queue.
- Measured on Rio (about 26 by 18 km): roads 41 902 segments in 3 s, buildings 348 571 in 7 s (57 312 with height). Use `stac=True`: without it the Python reader took 28 s and 64 s instead of 3 s and 5 s.
- Overpass, for comparison: `out geom` of main roads on a smaller Rio box took 37.5 s.
- Also used: `water` (rivers, skipping intermittent ones), `infrastructure` (runways) and `division` (town and neighborhood labels), verified on five regions.
- Weight: `pyarrow` makes the whole environment about 380 MB, relevant for CI time.
- **Required attribution:** `© OpenStreetMap contributors, Overture Maps Foundation`. Roads and buildings themes are under ODbL. The buildings theme also carries Esri and Google data under CC BY 4.0.
- **ODbL consequence:** a site's `dist/` containing road or building coordinates holds a derivative database, which stays under ODbL. The credits must say the data is available under ODbL, linking to https://www.openstreetmap.org/copyright. The MIT license covers only the code.
- Sources: [attribution](https://docs.overturemaps.org/attribution/).

## Geocoding

### Photon (default)
- Endpoint: `https://photon.komoot.io/api/?q=...`. Supports location bias and bounding box.
- Policy: free "as long as the number of requests stay in a reasonable limit"; extensive usage is throttled or banned. No availability guarantee. ([README](https://github.com/komoot/photon))

### Public Nominatim (opt-in only)
[Policy](https://operations.osmfoundation.org/policies/nominatim/) rules that matter here:
- Maximum 1 request per second, a valid identifying User-Agent, visible attribution, results cached.
- No distributed scripts. Many template repos running on GitHub Actions look like that.
- Repeating the same query can get a client classified as faulty and blocked.
- **"The public Nominatim API must not be built into, offered through, suggested by, or automatically generated by no-code, low-code, or vibe-coding platforms as a generic geocoding, address lookup, place search, or map search service."** Public use is only allowed where the developer has made a deliberate, informed decision.

A push-to-deploy template for non-technical users, driven by a Claude skill, sits too close to this. So it stays off by default, and the geocoder endpoint is configurable.

### Measured hit rate
13 real names from the test trips, no location hint. "Good" means within 2 km of a known position (12 of the names had one).

| | Good | Missing | Wrong |
|---|---|---|---|
| Nominatim | 8 | 2 | 2 (one 1593 km off) |
| Photon | 9 | 1 | 2 (one 11 471 km off) |

The two complement each other, but small businesses not in OSM fail on both, and a confident wrong match is worse than a miss: it would create a fake region. So name-only input needs a location bias, an outlier check and a printed report, and resolved coordinates must be stored in a committed lock file so each name is looked up once.

## Road routes: FOSSGIS OSRM

- Endpoint: `https://routing.openstreetmap.de/routed-car/route/v1/driving/{lon,lat;lon,lat}`. Tested, returns geometry.
- [Policy](https://routing.openstreetmap.de/about.html): max 1 request per second, valid User-Agent, required attribution, a link to fix the map, no heavy use.
- Without it, day routes are curves that cross mountains and bays. The endpoint is configurable, and results go in the same lock file so each route is requested once.

## Weather and marine: Open-Meteo

- Forecast tested: 16 days maximum (17 returns HTTP 400).
- Marine tested: accepts 16 days, but swell values were non-null for only about 10 days at the tested point. The plan's "8 days" is out of date.
- Free tier: under 10 000 calls per day, 5 000 per hour, 600 per minute, 300 000 per month. Non-commercial use only.
- Non-commercial includes private or non-profit sites without subscriptions or advertising.
- Commercial use requires a paid plan, using `customer-api.open-meteo.com` and `&apikey=...`.
- Rate limits apply per calling IP, and calls come from each visitor's browser.
- **Required attribution:** CC BY 4.0, credit and link to https://open-meteo.com.
- `timezone=auto` returned `Pacific/Honolulu` for O'ahu, so timezone inference needs no extra dependency.
- Sources: [terms](https://open-meteo.com/en/terms), [licence](https://open-meteo.com/en/licence), [pricing](https://open-meteo.com/en/pricing).

## Tides: NOAA CO-OPS

- Endpoint: `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter`. Tested with Honolulu (1612340). US stations only.
- NOAA/NWS content is public domain, provided it is not presented as your own, does not imply endorsement, and modified content is not shown as official. ([disclaimer](https://www.weather.gov/disclaimer))

## Bundled software

| Package | Version checked | License |
|---|---|---|
| three.js | 0.187.0 | MIT |
| @fontsource/inter | 5.3.0 | OFL-1.1 |
| @fontsource/ibm-plex-mono | 5.3.0 | OFL-1.1 |
| @fontsource/darumadrop-one | 5.3.0 | OFL-1.1 |

## Credits every generated site must show

The O'ahu reference site credits only the forecasts, so this is new work in M4.

- Copernicus notice, Terrain Tiles attribution list, ESA WorldCover notice
- © OpenStreetMap contributors, Overture Maps Foundation, data available under ODbL
- Forecasts by Open-Meteo (CC BY 4.0), when weather is on
- NOAA as source, when tides are on
- Font licenses

## NOAA stations

The tide module lists stations with `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions` (3 502 stations, tested on 2026-11-05) and saves the high and low tide tables at build time, so they work offline. Outside the United States it uses `sea_level_height_msl` from Open-Meteo marine, with a warning that it is not precise near the coast.

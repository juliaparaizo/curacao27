<div align="center">

# trip-map-3d

**Beschreib deine Reise in einer einzigen Datei. Push. Fertig ist die Website mit echter 3D-Karte, egal wo auf der Welt.**

[![Lizenz: MIT](https://img.shields.io/badge/license-MIT-2ea44f.svg)](../../LICENSE)
[![Build und Veröffentlichung](https://github.com/orodmorais/trip-map-3d/actions/workflows/deploy.yml/badge.svg)](https://github.com/orodmorais/trip-map-3d/actions/workflows/deploy.yml)
![Python 3.12+](https://img.shields.io/badge/python-3.12%2B-3776AB.svg?logo=python&logoColor=white)
![three.js](https://img.shields.io/badge/three.js-no%20framework-000000.svg?logo=threedotjs&logoColor=white)
![Funktioniert offline](https://img.shields.io/badge/PWA-works%20offline-5A0FC8.svg)
![Mit Claude Code gebaut](https://img.shields.io/badge/built%20with-Claude%20Code-D97757.svg)

[English](../../README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Italiano](README.it.md) · [Français](README.fr.md) · **Deutsch** · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md)

> Dies ist eine Übersetzung. Wenn sie von der [englischen README](../../README.md) abweicht, gilt die englische Version. Die generierte Website selbst gibt es auf Englisch, Portugiesisch und Spanisch.

![Einen Reisetag öffnen: Die Route zeichnet sich entlang echter Straßen von selbst](../../docs/demo.gif)

![Dasselbe Template baut Europa, Rio, O'ahu und Utah](../../docs/screenshots/m4-site.jpg)

</div>

Ich wollte eine Reise mit etwas planen, das ich auch wirklich sehen kann. Auf einer flachen Karte sehen eine kurze Autofahrt und ein steiler Wanderweg gleich aus. In 3D siehst du den Bergrücken, bevor du dich auf die Wanderung einlässt, und du bekommst ein echtes Gefühl dafür, wie viel vom Tag (und vom Tank) eine Route kostet.

Also habe ich es für meine eigene Reise nach O'ahu gebaut und danach ein Template für jedes Reiseziel daraus gemacht. Du beschreibst die Reise in einer Datei und bekommst eine statische Website: eine echte 3D-Karte pro Region, eine animierte Route für jeden Tag, Pins und Infokarten für jeden Ort, eine Tagesübersicht fürs Handy und das Wetter für jeden Tag.

> Keine Server zu betreiben und keine API-Keys für den privaten Gebrauch (für den Weg ohne Code reicht ein GitHub-Account). Rein kommt eine YAML-Datei, raus kommt ein Ordner mit statischen Dateien. GitHub Actions baut alles neu, sobald du die Reise bearbeitest.

**Live-Demos:** [Europe](https://orodmorais.github.io/trip-map-3d/) · [O'ahu](https://orodmorais.github.io/trip-map-3d/oahu/) (auf Portugiesisch) · **Fünf Beispielreisen:** [examples/](../../examples/) · **Testbericht:** [docs/TEST_REPORT.md](../../docs/TEST_REPORT.md)

---

## Auf einen Blick

| | Was du bekommst |
|---|---|
| 🗺️ **3D-Karte** | Gelände, Meerestiefe, Flüsse, Straßen, Gebäude und Vegetation, alles aus offenen Daten und in der Farbpalette deines Themes eingefärbt |
| 🧭 **Tagesrouten** | Die Route jedes Tages folgt echten Straßen, zeichnet sich von selbst und wird automatisch so ins Bild gesetzt, dass sie neben der Infokarte frei bleibt |
| 🌍 **Lange Reisen** | Weit auseinanderliegende Orte werden zu eigenen Karten, verbunden durch eine Übersicht. Lissabon, Rom und die Alpen sind drei Karten, nicht ein flacher, verschwommener Brei |
| 📍 **Pins und Infokarten** | Jeder Ort bekommt einen Pin, eine Infokarte, ein Foto, einen Tipp und optional ein 3D-Wahrzeichen |
| 🔎 **Suche und Filter** | Nach Name oder Typ, Akzente werden ignoriert |
| 📱 **Reiseplan-Seite** | Die ganze Reise, Tag für Tag, gemacht zum Lesen auf dem Handy |
| ⛅ **Wetter** | Eine Vorhersage für jeden Reisetag, dazu Sonnenauf- und Sonnenuntergang |
| 📡 **Heute-Modus und offline** | Öffnet sich beim heutigen Tag, zeigt deinen Standort als blauen Punkt, lässt sich als App installieren und funktioniert ohne Empfang |
| 🌊 **Optionale Module** | Surfspots mit Bewertung von 0 bis 5, Gezeiten, deine eigenen 3D-Modelle |
| 🎨 **Komplett anpassbar** | Schriften, Farben, Kartenpalette, Pin-Icons, Badge-Stil. Drei Presets sind dabei |
| 🗣️ **Sprachen der Website** | Englisch, Portugiesisch und Spanisch, mit °C oder °F und km oder Meilen |

---

## Galerie

Dasselbe Template, fünf verschiedene Reisen. Jeder Screenshot ist ein echter Build aus [examples/](../../examples/).

| Lissabon + Rom + Alpen, 12 Tage | Rio de Janeiro, 5 Tage | Nationalparks in Utah, 7 Tage |
|---|---|---|
| ![Europa](../../docs/screenshots/europe/desktop-day.jpg) | ![Rio](../../docs/screenshots/rio/desktop-day.jpg) | ![Utah](../../docs/screenshots/utah/desktop-day.jpg) |
| **O'ahu, 6 Tage** | **Toledo, 1 Tag** | **Auf dem Handy** |
| ![O'ahu](../../docs/screenshots/oahu/desktop-day.jpg) | ![Toledo](../../docs/screenshots/day-trip/desktop-day.jpg) | ![Handy](../../docs/screenshots/europe/mobile-day.jpg) |

---

## Schnellstart

Such dir den Weg aus, der zu dir passt. Am Ende steht immer dieselbe `trip.yaml`.

| Für wen | So geht's |
|---|---|
| Ohne Programmierkenntnisse | **Use this template** (Vorlage verwenden) auf GitHub, dann `trip.yaml` im Browser bearbeiten |
| Mit Claude im Chat | Füge [MASTER_PROMPT.md](../../MASTER_PROMPT.md) ein, beantworte die Fragen und füge die Datei ein, die dabei herauskommt |
| Mit Claude Code | Verweise es auf [SKILL.md](../../SKILL.md): Es interviewt dich, baut die Website, prüft Screenshots und veröffentlicht |
| Für Entwickler | Klonen, `python -m pipeline build trip.yaml` |

### Ohne Code, direkt auf GitHub

1. Klick auf **Use this template** und leg dein Repository an.
2. Geh zu **Settings → Pages** und stell **Source** auf **GitHub Actions**. Das ist der einzige manuelle Schritt.
3. Öffne `trip.yaml`, klick auf den Stift, beschreib deine Reise und committe.
4. Warte ein paar Minuten. Deine Website erscheint unter `https://YOUR-USER.github.io/YOUR-REPOSITORY`.

> [!WARNING]
> Mit einem kostenlosen GitHub-Account funktioniert GitHub Pages nur mit **öffentlichen** Repositories. Deine `trip.yaml` und deine Website sind für alle sichtbar, die den Link haben: Reiseplan, Daten, einfach alles. Gib das Viertel an, in dem du übernachtest, niemals die genaue Adresse. Lass Flugnummern, Türcodes und das Versteck der Schlüssel weg.

---

## Die Reisedatei

Nur drei Felder sind Pflicht. Den Rest ermittelt der Build selbst (Zeitzone, Regionen, Koordinaten, Routen) und gibt alles aus, was er abgeleitet hat, damit du es prüfen kannst.

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
> Schreib zum Ortsnamen immer die Stadt dazu: `"Pantheon, Roma"`, nicht `"Pantheon"`. Wenn die Suche trotzdem den falschen Ort findet, gib unter `places:` direkt `lat` und `lon` an, statt es noch einmal zu versuchen.

### Wichtige Felder

| Feld | Pflicht | Was es macht |
|---|:---:|---|
| `title` | ✅ | Name der Website |
| `dates.start` | ✅ | Erster Tag. Das Datum jedes Tages ergibt sich aus seiner Position |
| `days[].items` | ✅ | Was du machst, in der richtigen Reihenfolge. Ein Ort kann einfach nur ein Name sein |
| `subtitle` | | Eine kurze Zeile unter dem Titel |
| `language` | | `en`, `pt-BR` oder `es` |
| `units` | | `temp: C/F`, `distance: km/mi`, `waves: ft/m` |
| `home` | | Wo du schläfst. Wird zum Unterkunfts-Pin |
| `places` | | Alle Details zu einem Ort: Koordinaten, Typ, Beschreibung, Tipp, Foto, 3D-Modell, Kamera |
| `regions.max_km` | | Längste Seite einer 3D-Karte. Unterhalb dieses Werts passen sich die Regionen an die Reise an |
| `modules` | | `weather`, `surf`, `tides`, `landmarks` |
| `services` | | Dein eigener Geocoder und Router |
| `downloads` | | Zusätzliche Dateien, die auf der Reiseplan-Seite verlinkt werden |

Alle Felder mit Beispielwerten: [examples/trip.example.yaml](../../examples/trip.example.yaml).

---

## Anpassen

| Was | Wie |
|---|---|
| Farben, Schriften, Kartenpalette | `theme.yaml` neben `trip.yaml`. Siehe [das Beispiel](../../examples/theme.example.yaml) |
| Fertiges Theme | `preset: oahu` (warmes Papier), `minimal` (Grautöne und ein Blau) oder `dark` |
| Handgezeichnete Titel | Eine beliebige Schrift von `@fontsource` mit lateinischen Dateien als `fonts.display`, ausgedünnt mit `display_thin` |
| Pin-Farbe und -Icon nach Typ | `pins.types: {surf: {color: "#1F7FA6", icon: wave}}` |
| 3D-Wahrzeichen für einen Ort | `model: bridge`, `lighthouse`, `temple`, `tower`, `waterfall`, `pier`, `islet`, `airport`, `house` oder `ridge_stairs` |
| Deine eigenen 3D-Modelle | `landmarks: landmarks.js` in `trip.yaml`. Siehe [das O'ahu-Beispiel](../../examples/oahu/landmarks.js) |
| Kamera für einen Ort | `camera: {zoom: 7, dir: [0.4, 0.6, 0.7]}` |
| Name einer Karte | `regions: {titles: {Lauterbrunnen: "Swiss Alps"}}` |
| Surfen und Gezeiten | `modules: {surf: true, tides: true}` und `surf_spots: spots.yaml` |
| Ein Tag ohne Straßen (Boot, Wanderung) | `route: line` an diesem Tag |
| Eigene Server | `services: {geocoder: ..., router: ...}` |
| Wolken, animiertes Meer, Tagesfarben | `ui:` in `theme.yaml` |

---

## Module

| Modul | Standard | Quelle | Hinweise |
|---|:---:|---|---|
| Wetter | an | Open-Meteo-Vorhersage | 16 Tage im Voraus. Darüber hinaus nur Sonnenauf- und Sonnenuntergang |
| 3D-Wahrzeichen | auto | Eingebautes Kit oder deine `landmarks.js` | Platziert anhand von `model:` bei jedem Ort |
| Surfen | aus | Open-Meteo Marine | Jeder Spot bekommt 0 bis 5 Punkte, berechnet aus Dünungshöhe, Periode und Wind |
| Gezeiten | aus | NOAA CO-OPS in den USA, sonst Open-Meteo Marine | US-Tabellen werden beim Build gespeichert und funktionieren deshalb offline. Außerhalb der USA ist die Schätzung gröber |

---

## Lokal auf deinem Rechner ausführen

Du brauchst Python 3.12 oder neuer.

```bash
python -m pip install -r requirements.txt
python -m pipeline check trip.yaml        # findet jeden Ort und zeigt an, was gefunden wurde
python -m pipeline build trip.yaml --out dist
python -m http.server --directory dist    # öffne http://localhost:8000
```

So prüfst du einen Build visuell, genau wie der Skill:

```bash
python -m pip install -r requirements-dev.txt
python tools/check_site.py dist --shots shots --hashes "" dia-1
```

`check_site.py` öffnet die Website in einem Headless-Browser, speichert Screenshots und meldet jeden Fehler. `tools/check_trip.py dist --name NAME --shots FOLDER` führt die komplette Release-Checkliste aus dem Testbericht aus: Alle Pins passen ins Bild, keine Route unter einer Infokarte, kein leerer Hintergrund, Suche, Wetter, Heute-Modus, offline.

### Veröffentlichen

| Host | Einrichtung |
|---|---|
| **GitHub Pages** (Standard) | Settings → Pages → Source: GitHub Actions |
| **Cloudflare Pages** | Leg die Variable `CLOUDFLARE_PROJECT` und die Secrets `CLOUDFLARE_API_TOKEN` und `CLOUDFLARE_ACCOUNT_ID` an. Der Workflow stellt sich von selbst um |
| **Überall sonst** | Lade `dist/` hoch. Das sind ganz normale statische Dateien |

---

## So funktioniert's

```
trip.yaml ──▶ 1. Reise ──▶ 2. Regionen ──▶ 3. Karte ──▶ 4. Website ──▶ dist/
               │             │               │             │
               │             │               │             └─ statisches three.js, kein Framework, offline
               │             │               └─ Gelände + Landbedeckung + Straßen + Flüsse, eingefärbt
               │             └─ kürzestes Netz zwischen den Orten, längste Verbindungen gekappt
               └─ validieren, einmal geocodieren, in trip.lock.json cachen
```

1. **Reise.** Validiert die Datei, findet jeden Ort und speichert die Ergebnisse in `trip.lock.json`, sodass jeder Name nur ein einziges Mal überhaupt nachgeschlagen wird.
2. **Regionen.** Verbindet alle Orte mit dem kürzestmöglichen Netz und kappt dann die längsten Verbindungen. Ein Roadtrip bleibt auf einer Karte; zwei Orte, die tausend Kilometer auseinanderliegen, werden zu zwei Karten.
3. **Karte.** Kombiniert Höhendaten, Meerestiefe, Landbedeckung, Straßen, Gebäude und Flüsse zu einem Höhenfeld und einer Textur, die in der Palette des Themes eingefärbt ist.
4. **Website.** Schreibt eine statische three.js-Website mit Service Worker, damit sie auch offline weiter funktioniert.

### Gemessen

Aus [docs/TEST_REPORT.md](../../docs/TEST_REPORT.md): Jeder Tag jeder Reise wurde bei 1440×900 und 390×844 in Chrome auf einem MacBook Air geöffnet.

| Reise | Erster Build | Größe der Website | JS-Fehler | fps (Desktop / Viewport in Handygröße) |
|---|---:|---:|---:|---|
| O'ahu, 6 Tage | 180 s | 3.8 MB | 0 | 30 / 58 |
| Rio de Janeiro, 5 Tage | 84 s | 4.8 MB | 0 | 60 / 60 |
| Nationalparks in Utah, 7 Tage | 53 s | 4.8 MB | 0 | 60 / 61 |
| Toledo, 1 Tag | 34 s | 3.6 MB | 0 | 60 / 60 |
| Lissabon + Rom + Alpen, 12 Tage | 72 s | 13.8 MB | 0 | 60 / 60 |

Erste Builds enthalten alle Downloads. Mit warmem Cache dauern sie 6 bis 24 s. Die Zeiten der ersten Builds stammen aus dem Lauf vor den letzten Korrekturen, wie im [Testbericht](../TEST_REPORT.md) vermerkt.

> [!NOTE]
> Die Handy-Spalte ist ein Viewport in Handygröße auf einer Mac-GPU, kein echtes Handy. Bildraten auf echten Geräten wurden noch nicht gemessen. Unter 24 fps schaltet die Website von selbst auf eine leichtere Darstellung um.

---

## Was drinsteckt

```
trip-map-3d/
├── trip.yaml                 # deine Reise: die einzige Datei, die du bearbeiten musst
├── trip.lock.json            # alle bereits nachgeschlagenen Orte. Committen, niemals löschen
├── pipeline/                 # Python-Build: Reise → Regionen → Karte → Website
│   ├── schema.py             #   validiert trip.yaml und ergänzt Standardwerte
│   ├── geocode.py            #   Photon-Abfragen, gecacht in trip.lock.json
│   ├── routes.py             #   OSRM-Straßenrouten, gecacht wie die Orte
│   ├── regions.py            #   teilt die Reise in Karten auf
│   ├── terrain.py            #   Copernicus GLO-30 an Land, Terrarium auf See, Ausreißer entfernt
│   ├── vectors.py            #   Overture: Straßen, Flüsse, Landebahnen, Orte, Gebäude
│   ├── scene.py              #   Bäume, Palmen und Gebäude aus der Landbedeckung
│   ├── texture.py            #   färbt die Karte in der Palette des Themes ein
│   ├── theme.py              #   Presets + theme.yaml
│   ├── surf.py · tides.py    #   optionale Module
│   ├── site.py               #   baut dist/ zusammen: Template, Daten, Theme, Schriften, Fotos
│   └── __main__.py           #   `python -m pipeline check|build`
├── site/                     # statisches Frontend, kein Framework
│   ├── app.js                #   Hauptansicht: Kamera, Pins, Filter, URL-Routen
│   ├── world.js              #   Gelände, Meer, Vegetation, Gebäude
│   ├── framing.js            #   setzt die Tagesroute in den freien Platz neben der Infokarte
│   ├── routes3d.js           #   animierte Routen
│   ├── callouts.js           #   Fotos neben der Tagesroute
│   ├── landmarks.js          #   eingebautes Kit mit 3D-Wahrzeichen
│   ├── cards.js · search.js  #   Infokarten, Suche
│   ├── weather.js · surf.js · tides.js
│   ├── live.js               #   Heute-Modus, blauer Punkt, Offline-Banner
│   ├── roteiro.html          #   Reiseplan-Seite, Tag für Tag
│   ├── i18n.js               #   en, pt-BR, es. Neue Sprache: ein Block hier und ihr Code in LANGUAGES in pipeline/schema.py
│   ├── sw.js                 #   Service Worker
│   └── vendor/               #   three.js, im Repo mitgeliefert
├── presets/                  # oahu · minimal · dark
├── examples/                 # fünf komplette Reisen + alle Felder dokumentiert
├── tools/                    # check_site.py, check_trip.py: Prüfungen in einem echten Browser
├── tests/                    # 51 pytest-Tests
├── .github/workflows/        # Build bei jedem Push, Veröffentlichung auf Pages oder Cloudflare
├── SKILL.md                  # für Claude Code
├── MASTER_PROMPT.md          # für Claude im Chat
├── DATA_SOURCES.md           # jede Quelle, gemessen, mit Grenzen und Lizenzen
└── DECISOES.md               # Designentscheidungen und ihre Gründe (auf Portugiesisch)
```

---

## Datenquellen und Lizenzen

Jede Quelle wurde vor der Auswahl mit echten Anfragen getestet. Messwerte, Grenzen und verworfene Alternativen findest du in [DATA_SOURCES.md](../../DATA_SOURCES.md).

| Wofür | Quelle | Lizenz | Wann |
|---|---|---|---|
| Höhe an Land | Copernicus GLO-30 (AWS open data) | Kostenlos, Hinweis erforderlich | Build |
| Meerestiefe | AWS Terrain Tiles (Terrarium) | Liste mit Quellenangaben | Build |
| Land, Meer, Landbedeckung | ESA WorldCover 2021 | CC BY 4.0 | Build |
| Straßen, Gebäude, Orte | Overture Maps | ODbL und weitere | Build |
| Ortssuche | Photon (komoot) | ODbL-Daten | Build, einmal pro Ort |
| Straßenrouten | FOSSGIS OSRM | ODbL-Daten | Build, einmal pro Route |
| Wetter, Surfen | Open-Meteo | CC BY 4.0, **nicht kommerziell** | Im Browser |
| Gezeiten in den USA | NOAA CO-OPS | Gemeinfrei | Build |

> [!IMPORTANT]
> **Die kostenlose API von Open-Meteo ist nur für nicht kommerzielle Nutzung gedacht.** Ein Reisebüro oder jedes kostenpflichtige Produkt braucht einen bezahlten Key, den du in `services.open_meteo_key` einträgst.
>
> **Lass die Quellenangaben drin.** Jede generierte Website zeigt die Quellenangaben, die diese Lizenzen verlangen. Entferne sie nicht.
>
> **Fotos müssen von dir stammen oder lizenziert sein.** Das Template lädt nie Fotos für dich herunter.
>
> **Kein öffentliches Nominatim.** Seine Nutzungsrichtlinie verbietet, es als generischen Geocoder in Tools wie dieses einzubauen. Richte `services.geocoder` auf deine eigene Instanz, wenn du es nutzen willst.

---

## Warum es so aussieht

- **3D, weil eine Reise etwas Körperliches ist.** Das Relief zeigt dir, was eine Autofahrt, ein Spaziergang oder ein Wanderweg dich wirklich kostet.
- **Eine Karte pro Region, keine riesige Gesamtkarte.** Wenn du weit genug herauszoomst, wird das Relief flach. Mir war ein Relief lieber, das richtig aussieht, auch wenn ich die Reise dafür auf mehrere Karten aufteilen musste.
- **Echte Straßen.** Wenn dir das so wichtig ist wie mir: Die Straßen so zu sehen, wie sie wirklich verlaufen, macht die Route echt und interaktiv.
- **3D-Wahrzeichen.** Die Orte, die die Reise geprägt haben (oder noch prägen werden), in 3D zu sehen, macht die Karte zu etwas, das du wirklich benutzen willst, und nicht bloß zu einer weiteren Karten-App.
- **Die ganze Route auf dem Bildschirm.** Erst wenn du einen Tag von Anfang bis Ende siehst, macht es Klick.
- **Ein Relief, das sich mit dir bewegt.** Eine dynamische topografische Ansicht gibt dir ein besseres Gefühl für das große Ganze.
- **Ein endloses Meer und ein Horizont.** Die Karte wirkt unendlich, aber die Details bleiben dort, wo du wirklich sein wirst.
- **Die genauesten Quellen, die ich finden konnte,** vor der Auswahl gemessen (siehe [DATA_SOURCES.md](../../DATA_SOURCES.md)).
- **Öffentlich.** Ich dachte mir, dass noch mehr Leute ihre Reisen mit etwas planen wollen, das sie sehen können.

Alle zwölf Entscheidungen, mit den Alternativen, die ich verworfen habe: [DECISOES.md](../../DECISOES.md) (auf Portugiesisch).

---

## Entstehung

Die erste Version habe ich im November 2026 für eine Reise nach O'ahu mit drei Freunden gebaut: die ganze Insel in 3D, jeder Strand, jede Wanderung und jeder Surfspot, die Route für jeden Tag, Live-Daten zu Surf und Wetter und ein Modus, der sich beim heutigen Tag öffnet. Leute, die sie gesehen haben, wollten den Code haben. Meine Cousine, die in der Reiseplanung arbeitet, wollte eine gezippte Kopie, bevor es dieses Repo überhaupt gab. Also habe ich es so umgebaut, dass es überall funktioniert.

Das O'ahu-Beispiel hier enthält nur öffentliche Orte, weil das Original eine private Reise war. Fragen zu unserem O'ahu-Reiseplan beantworte ich aber jederzeit gern.

Ich habe das Produkt entworfen und die Entscheidungen in [DECISOES.md](../../DECISOES.md) getroffen. [Claude Code](https://claude.com/claude-code) hat den Code geschrieben, jede Datenquelle gemessen, bevor ich sie freigegeben habe, und das Template an fünf sehr unterschiedlichen Reisen getestet.

**Rodrigo Morais** · [@orodmorais](https://github.com/orodmorais) · [LinkedIn](https://www.linkedin.com/in/rodrigomorais-/)

## Mitwirken

Issues und Pull Requests sind willkommen, vor allem neue 3D-Wahrzeichen, neue Presets, Übersetzungen der Website und Beispielreisen von Orten, die das Template noch nicht kennt. Führ `pytest` aus, bevor du einen Pull Request öffnest.

## Lizenz

Der Code steht unter der [MIT](../../LICENSE)-Lizenz. Die Kartendaten in jeder generierten Website bleiben unter der jeweiligen Lizenz ihrer Quelle (siehe oben).

<div align="center">

# trip-map-3d

**Descrivi il tuo viaggio in un solo file. Fai push. Ottieni un sito con una vera mappa 3D, ovunque nel mondo.**

[![Licenza: MIT](https://img.shields.io/badge/license-MIT-2ea44f.svg)](../../LICENSE)
[![Build e pubblicazione](https://github.com/orodmorais/trip-map-3d/actions/workflows/deploy.yml/badge.svg)](https://github.com/orodmorais/trip-map-3d/actions/workflows/deploy.yml)
![Python 3.12+](https://img.shields.io/badge/python-3.12%2B-3776AB.svg?logo=python&logoColor=white)
![three.js](https://img.shields.io/badge/three.js-no%20framework-000000.svg?logo=threedotjs&logoColor=white)
![Funziona offline](https://img.shields.io/badge/PWA-works%20offline-5A0FC8.svg)
![Creato con Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-D97757.svg)

[English](../../README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · **Italiano** · [Français](README.fr.md) · [Deutsch](README.de.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md)

> Questa è una traduzione. Se differisce dal [README in inglese](../../README.md), fa fede la versione inglese. Il sito generato è disponibile in inglese, portoghese e spagnolo.

![Apertura di un giorno del viaggio: il percorso si disegna da solo lungo strade reali](../../docs/demo.gif)

![Lo stesso template che costruisce Europa, Rio, O'ahu e Utah](../../docs/screenshots/m4-site.jpg)

</div>

Volevo pianificare un viaggio con qualcosa che potessi vedere davvero. Su una mappa piatta, un breve tragitto in auto e un sentiero ripido sembrano uguali. In 3D vedi la cresta prima di decidere di fare l'escursione, e capisci davvero quanta parte della giornata (e del serbatoio) ti porterà via un percorso.

Così l'ho costruito per il mio viaggio a O'ahu, e poi l'ho trasformato in un template per qualsiasi destinazione. Descrivi il viaggio in un solo file e ottieni un sito statico: una vera mappa 3D per ogni regione, un percorso animato per ogni giorno, pin e schede per ogni luogo, una pagina giorno per giorno per il telefono e il meteo di ogni giorno.

> Nessun server da gestire e nessuna chiave API per l'uso personale (per il percorso senza codice basta un account GitHub). Entra un file YAML, esce una cartella di file statici. GitHub Actions ricostruisce il sito ogni volta che modifichi il viaggio.

**Demo dal vivo:** [Europe](https://orodmorais.github.io/trip-map-3d/) · [O'ahu](https://orodmorais.github.io/trip-map-3d/oahu/) (in portoghese) · **Cinque viaggi di esempio:** [examples/](../../examples/) · **Report dei test:** [docs/TEST_REPORT.md](../../docs/TEST_REPORT.md)

---

## In breve

| | Cosa ottieni |
|---|---|
| 🗺️ **Mappa 3D** | Rilievo, profondità del mare, fiumi, strade, edifici e vegetazione, tutto da dati aperti, dipinto con la palette del tuo tema |
| 🧭 **Percorsi del giorno** | Il percorso di ogni giorno segue strade reali, si disegna da solo e viene inquadrato in automatico per restare libero dalla scheda |
| 🌍 **Viaggi lunghi** | I luoghi lontani tra loro diventano mappe separate, unite da una panoramica. Lisbona, Roma e le Alpi sono tre mappe, non un'unica macchia piatta |
| 📍 **Pin e schede** | Ogni luogo ha un pin, una scheda, una foto, un consiglio e un monumento 3D opzionale |
| 🔎 **Ricerca e filtri** | Per nome o per tipo, senza badare agli accenti |
| 📱 **Pagina itinerario** | Tutto il viaggio, giorno per giorno, pensato per la lettura sul telefono |
| ⛅ **Meteo** | Una previsione per ogni giorno del viaggio, più alba e tramonto |
| 📡 **Modalità oggi e offline** | Si apre sul giorno corrente, mostra dove sei con un punto blu, si installa come app e funziona senza campo |
| 🌊 **Moduli opzionali** | Spot di surf con punteggio da 0 a 5, maree, i tuoi modelli 3D |
| 🎨 **Tema personalizzabile** | Font, colori, palette della mappa, icone dei pin, stile dei badge. Tre preset inclusi |
| 🗣️ **Lingue del sito** | Inglese, portoghese e spagnolo, con °C o °F e km o miglia |

---

## Galleria

Lo stesso template, cinque viaggi diversi. Ogni screenshot è una build reale da [examples/](../../examples/).

| Lisbona + Roma + Alpi, 12 giorni | Rio de Janeiro, 5 giorni | I parchi dello Utah, 7 giorni |
|---|---|---|
| ![Europa](../../docs/screenshots/europe/desktop-day.jpg) | ![Rio](../../docs/screenshots/rio/desktop-day.jpg) | ![Utah](../../docs/screenshots/utah/desktop-day.jpg) |
| **O'ahu, 6 giorni** | **Toledo, 1 giorno** | **Su un telefono** |
| ![O'ahu](../../docs/screenshots/oahu/desktop-day.jpg) | ![Toledo](../../docs/screenshots/day-trip/desktop-day.jpg) | ![Telefono](../../docs/screenshots/europe/mobile-day.jpg) |

---

## Avvio rapido

Scegli la strada che fa per te. Tutte portano allo stesso `trip.yaml`.

| Chi sei | Cosa usare |
|---|---|
| Non sai programmare | **Use this template** su GitHub, modifica `trip.yaml` nel browser |
| Usi Claude in una chat | Incolla [MASTER_PROMPT.md](../../MASTER_PROMPT.md), rispondi alle domande, incolla il file che scrive |
| Usi Claude Code | Indicagli [SKILL.md](../../SKILL.md): ti fa qualche domanda, fa la build, controlla gli screenshot e pubblica |
| Sei uno sviluppatore | Clona, `python -m pipeline build trip.yaml` |

### Senza codice, su GitHub

1. Clicca **Use this template** (usa questo template) e crea il tuo repository.
2. Vai in **Settings → Pages** e imposta **Source** su **GitHub Actions**. È l'unico passaggio manuale.
3. Apri `trip.yaml`, clicca la matita, descrivi il tuo viaggio e fai commit.
4. Aspetta qualche minuto. Il sito compare su `https://YOUR-USER.github.io/YOUR-REPOSITORY`.

> [!WARNING]
> Con un account GitHub gratuito, GitHub Pages funziona solo con repository **pubblici**. Il tuo `trip.yaml` e il tuo sito sono visibili a chiunque abbia il link: itinerario, date, tutto. Scrivi il quartiere in cui alloggi, mai l'indirizzo. Non inserire numeri di volo, codici delle porte né il posto dove sono le chiavi.

---

## Il file del viaggio

Servono solo tre campi. La build ricava il resto (fuso orario, regioni, coordinate, percorsi) e stampa tutto ciò che ha dedotto, così puoi controllarlo.

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
> Aggiungi sempre la città al nome del luogo: `"Pantheon, Roma"`, non `"Pantheon"`. Se la ricerca sceglie ancora il posto sbagliato, indica `lat` e `lon` sotto `places:` invece di riprovare.

### Campi principali

| Campo | Obbligatorio | Cosa fa |
|---|:---:|---|
| `title` | ✅ | Nome del sito |
| `dates.start` | ✅ | Primo giorno. La data di ogni giorno deriva dalla sua posizione |
| `days[].items` | ✅ | Cosa fai, in ordine. Un luogo può essere solo un nome |
| `subtitle` | | Una breve riga sotto il titolo |
| `language` | | `en`, `pt-BR` o `es` |
| `units` | | `temp: C/F`, `distance: km/mi`, `waves: ft/m` |
| `home` | | Dove dormi. Diventa il pin di casa |
| `places` | | Tutti i dettagli di un luogo: coordinate, tipo, descrizione, consiglio, foto, modello 3D, inquadratura |
| `regions.max_km` | | Lato massimo di una mappa 3D. Sotto questo limite le regioni si adattano al viaggio |
| `modules` | | `weather`, `surf`, `tides`, `landmarks` |
| `services` | | Il tuo geocoder e il tuo router |
| `downloads` | | File extra collegati dalla pagina itinerario |

Ogni campo, con valori di esempio: [examples/trip.example.yaml](../../examples/trip.example.yaml).

---

## Personalizza

| Cosa | Come |
|---|---|
| Colori, font, palette della mappa | `theme.yaml` accanto a `trip.yaml`. Vedi [l'esempio](../../examples/theme.example.yaml) |
| Tema pronto | `preset: oahu` (carta calda), `minimal` (grigi e un solo blu) o `dark` |
| Titoli scritti a mano | Qualsiasi font su `@fontsource` con file latini come `fonts.display`, alleggerito con `display_thin` |
| Colore e icona del pin per tipo | `pins.types: {surf: {color: "#1F7FA6", icon: wave}}` |
| Monumento 3D per un luogo | `model: bridge`, `lighthouse`, `temple`, `tower`, `waterfall`, `pier`, `islet`, `airport`, `house` o `ridge_stairs` |
| I tuoi modelli 3D | `landmarks: landmarks.js` in `trip.yaml`. Vedi [l'esempio di O'ahu](../../examples/oahu/landmarks.js) |
| Inquadratura di un luogo | `camera: {zoom: 7, dir: [0.4, 0.6, 0.7]}` |
| Nome di una mappa | `regions: {titles: {Lauterbrunnen: "Swiss Alps"}}` |
| Surf e maree | `modules: {surf: true, tides: true}` e `surf_spots: spots.yaml` |
| Un giorno senza strade (barca, escursione) | `route: line` in quel giorno |
| I tuoi server | `services: {geocoder: ..., router: ...}` |
| Nuvole, mare animato, colori del giorno | `ui:` in `theme.yaml` |

---

## Moduli

| Modulo | Predefinito | Fonte | Note |
|---|:---:|---|---|
| Meteo | attivo | Previsioni Open-Meteo | 16 giorni in avanti. Oltre, solo alba e tramonto |
| Monumenti 3D | auto | Kit integrato, o il tuo `landmarks.js` | Posizionati in base a `model:` di ogni luogo |
| Surf | disattivo | Open-Meteo marine | Ogni spot riceve un punteggio da 0 a 5 in base ad altezza e periodo dello swell e al vento |
| Maree | disattivo | NOAA CO-OPS negli USA, Open-Meteo marine altrove | Le tabelle USA vengono salvate durante la build, quindi funzionano offline. Fuori dagli USA la stima è più approssimativa |

---

## Eseguilo sul tuo computer

Serve Python 3.12 o superiore.

```bash
python -m pip install -r requirements.txt
python -m pipeline check trip.yaml        # trova ogni luogo e stampa cosa ha trovato
python -m pipeline build trip.yaml --out dist
python -m http.server --directory dist    # apri http://localhost:8000
```

Per controllare una build a occhio, come fa la skill:

```bash
python -m pip install -r requirements-dev.txt
python tools/check_site.py dist --shots shots --hashes "" dia-1
```

`check_site.py` apre il sito in un browser headless, salva gli screenshot e segnala eventuali errori. `tools/check_trip.py dist --name NAME --shots FOLDER` esegue l'intera checklist di rilascio del report dei test: i pin stanno nell'inquadratura, nessun percorso sotto una scheda, nessuno sfondo vuoto, ricerca, meteo, modalità oggi, offline.

### Pubblicazione

| Host | Configurazione |
|---|---|
| **GitHub Pages** (predefinito) | Settings → Pages → Source: GitHub Actions |
| **Cloudflare Pages** | Aggiungi la variabile `CLOUDFLARE_PROJECT` e i secret `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`. Il workflow si adatta da solo |
| **Qualsiasi altro host** | Carica `dist/`. Sono semplici file statici |

---

## Come funziona

```
trip.yaml ──▶ 1. Viaggio ──▶ 2. Regioni ──▶ 3. Mappa ──▶ 4. Sito ──▶ dist/
               │              │              │            │
               │              │              │            └─ three.js statico, nessun framework, offline
               │              │              └─ rilievo + copertura del suolo + strade + fiumi, dipinti
               │              └─ rete più corta tra i luoghi, tagliati i collegamenti più lunghi
               └─ convalida, geocodifica una sola volta, cache in trip.lock.json
```

1. **Viaggio.** Convalida il file, trova ogni luogo e salva le risposte in `trip.lock.json`, così ogni nome viene cercato una sola volta, per sempre.
2. **Regioni.** Unisce tutti i luoghi con la rete più corta possibile, poi taglia i collegamenti più lunghi. Un viaggio in auto resta su una sola mappa; due luoghi a mille chilometri di distanza diventano due mappe.
3. **Mappa.** Combina altitudine, profondità del mare, copertura del suolo, strade, edifici e fiumi in un campo di altezze e in una texture dipinta con la palette del tema.
4. **Sito.** Scrive un sito three.js statico, con un service worker che lo fa funzionare anche offline.

### Misurazioni

Da [docs/TEST_REPORT.md](../../docs/TEST_REPORT.md): ogni giorno di ogni viaggio aperto a 1440×900 e 390×844, in Chrome su un MacBook Air.

| Viaggio | Prima build | Dimensione del sito | Errori JS | fps (desktop / viewport da telefono) |
|---|---:|---:|---:|---|
| O'ahu, 6 giorni | 180 s | 3.8 MB | 0 | 30 / 58 |
| Rio de Janeiro, 5 giorni | 84 s | 4.8 MB | 0 | 60 / 60 |
| I parchi dello Utah, 7 giorni | 53 s | 4.8 MB | 0 | 60 / 61 |
| Toledo, 1 giorno | 34 s | 3.6 MB | 0 | 60 / 60 |
| Lisbona + Roma + Alpi, 12 giorni | 72 s | 13.8 MB | 0 | 60 / 60 |

Le prime build includono tutti i download. Con la cache già pronta richiedono da 6 a 24 s. I tempi della prima build vengono dal giro precedente alle ultime correzioni, come indica il [report dei test](../TEST_REPORT.md).

> [!NOTE]
> La colonna del telefono è un viewport con le dimensioni di un telefono su una GPU Mac, non un telefono vero. Il frame rate sui dispositivi reali non è ancora stato misurato. Sotto i 24 fps il sito passa da solo a una grafica più leggera.

---

## Cosa c'è dentro

```
trip-map-3d/
├── trip.yaml                 # il tuo viaggio: l'unico file da modificare
├── trip.lock.json            # ogni luogo già cercato. Fanne il commit, non cancellarlo mai
├── pipeline/                 # build in Python: viaggio → regioni → mappa → sito
│   ├── schema.py             #   convalida trip.yaml e completa i valori predefiniti
│   ├── geocode.py            #   ricerche Photon, in cache in trip.lock.json
│   ├── routes.py             #   percorsi stradali OSRM, in cache come i luoghi
│   ├── regions.py            #   divide il viaggio in mappe
│   ├── terrain.py            #   Copernicus GLO-30 sulla terraferma, Terrarium in mare, senza picchi anomali
│   ├── vectors.py            #   strade, fiumi, piste, città ed edifici da Overture
│   ├── scene.py              #   alberi, palme ed edifici dalla copertura del suolo
│   ├── texture.py            #   dipinge la mappa con la palette del tema
│   ├── theme.py              #   preset + theme.yaml
│   ├── surf.py · tides.py    #   moduli opzionali
│   ├── site.py               #   assembla dist/: template, dati, tema, font, foto
│   └── __main__.py           #   `python -m pipeline check|build`
├── site/                     # front end statico, nessun framework
│   ├── app.js                #   schermata principale: camera, pin, filtri, rotte URL
│   ├── world.js              #   rilievo, mare, vegetazione, edifici
│   ├── framing.js            #   inquadra il percorso del giorno nello spazio libero accanto alla scheda
│   ├── routes3d.js           #   percorsi animati
│   ├── callouts.js           #   foto accanto al percorso del giorno
│   ├── landmarks.js          #   kit integrato di monumenti 3D
│   ├── cards.js · search.js  #   schede, ricerca
│   ├── weather.js · surf.js · tides.js
│   ├── live.js               #   modalità oggi, punto blu, avviso offline
│   ├── roteiro.html          #   pagina dell'itinerario giorno per giorno
│   ├── i18n.js               #   en, pt-BR, es. Per aggiungere una lingua: un blocco qui e il suo codice in LANGUAGES, in pipeline/schema.py
│   ├── sw.js                 #   service worker
│   └── vendor/               #   three.js, incluso nel repository
├── presets/                  # oahu · minimal · dark
├── examples/                 # cinque viaggi completi + tutti i campi documentati
├── tools/                    # check_site.py, check_trip.py: controlli in un browser vero
├── tests/                    # 51 test pytest
├── .github/workflows/        # build a ogni push, pubblicazione su Pages o Cloudflare
├── SKILL.md                  # per Claude Code
├── MASTER_PROMPT.md          # per Claude in una chat
├── DATA_SOURCES.md           # ogni fonte, misurata, con limiti e licenze
└── DECISOES.md               # decisioni di design e motivazioni (in portoghese)
```

---

## Fonti dei dati e licenze

Ogni fonte è stata verificata con richieste reali prima di essere scelta. Misurazioni, limiti e alternative scartate sono in [DATA_SOURCES.md](../../DATA_SOURCES.md).

| Esigenza | Fonte | Licenza | Quando |
|---|---|---|---|
| Altitudine del terreno | Copernicus GLO-30 (AWS open data) | Gratuita, con avviso obbligatorio | Build |
| Profondità del mare | AWS Terrain Tiles (Terrarium) | Elenco di attribuzioni | Build |
| Terra, mare, copertura del suolo | ESA WorldCover 2021 | CC BY 4.0 | Build |
| Strade, edifici, città | Overture Maps | ODbL e altre | Build |
| Ricerca dei luoghi | Photon (komoot) | Dati ODbL | Build, una volta per luogo |
| Percorsi stradali | FOSSGIS OSRM | Dati ODbL | Build, una volta per percorso |
| Meteo, surf | Open-Meteo | CC BY 4.0, **non commerciale** | Nel browser |
| Maree USA | NOAA CO-OPS | Pubblico dominio | Build |

> [!IMPORTANT]
> **L'API gratuita di Open-Meteo è per uso non commerciale.** Un'agenzia di viaggi o qualsiasi prodotto a pagamento ha bisogno di una chiave a pagamento, da impostare in `services.open_meteo_key`.
>
> **Mantieni i crediti.** Ogni sito generato mostra le attribuzioni richieste da queste licenze. Non rimuoverle.
>
> **Le foto devono essere tue o con licenza.** Il template non scarica mai foto al posto tuo.
>
> **Niente Nominatim pubblico.** La sua policy d'uso vieta di integrarlo come geocoder generico in strumenti come questo. Se vuoi usarlo, punta `services.geocoder` alla tua istanza.

---

## Perché è fatto così

- **3D, perché un viaggio è fisico.** Il rilievo ti dice quanto ti costerà davvero un tragitto in auto, una passeggiata o un sentiero.
- **Una mappa per regione, non una mappa gigante.** Se allontani troppo lo zoom, il rilievo diventa piatto. Ho preferito un rilievo che sembri giusto, anche se voleva dire dividere il viaggio in più mappe.
- **Strade vere.** Se ci tieni quanto me, vedere le strade come sono davvero rende il percorso reale e interattivo.
- **Monumenti 3D.** Vedere in 3D i posti che hanno segnato il viaggio (o che lo segneranno) rende la mappa qualcosa che hai davvero voglia di usare, non l'ennesima app di mappe.
- **Tutto il percorso sullo schermo.** Vedere una giornata dall'inizio alla fine è quello che fa scattare tutto.
- **Un rilievo che si muove con te.** Una vista topografica dinamica ti dà un'idea migliore dell'insieme.
- **Un mare e un orizzonte senza fine.** La mappa sembra infinita, ma il dettaglio resta dove sarai davvero.
- **Le fonti più precise che ho trovato,** misurate prima di sceglierle (vedi [DATA_SOURCES.md](../../DATA_SOURCES.md)).
- **Pubblico.** Ho pensato che altre persone avrebbero voluto pianificare i loro viaggi con qualcosa che possono vedere.

Tutte e dodici le decisioni, con le alternative che ho scartato: [DECISOES.md](../../DECISOES.md) (in portoghese).

---

## Origine

Ho creato la prima versione per un viaggio a O'ahu con tre amici, a novembre 2026: tutta l'isola in 3D, ogni spiaggia, escursione e spot di surf, il percorso di ogni giorno, surf e meteo in tempo reale e una modalità che si apre sul giorno corrente. Chi l'ha vista mi ha chiesto il codice. Mia cugina, che lavora nell'organizzazione di viaggi, mi ha chiesto una copia zippata prima ancora che questo repository esistesse. Così l'ho fatta funzionare per qualsiasi posto.

L'esempio di O'ahu qui contiene solo luoghi pubblici, perché l'originale era un viaggio personale. Detto questo, sono sempre disponibile a rispondere a domande sul nostro itinerario a O'ahu.

Ho progettato il prodotto e preso le decisioni descritte in [DECISOES.md](../../DECISOES.md). [Claude Code](https://claude.com/claude-code) ha scritto il codice, ha misurato ogni fonte di dati prima che la approvassi e ha provato il template su cinque viaggi molto diversi.

**Rodrigo Morais** · [@orodmorais](https://github.com/orodmorais) · [LinkedIn](https://www.linkedin.com/in/rodrigomorais-/)

## Contribuire

Issue e pull request sono benvenute, soprattutto nuovi monumenti 3D, nuovi preset, traduzioni del sito e viaggi di esempio da posti che il template non ha ancora visto. Esegui `pytest` prima di aprire una pull request.

## Licenza

Il codice è [MIT](../../LICENSE). I dati delle mappe dentro ogni sito generato restano sotto la licenza della rispettiva fonte (vedi sopra).

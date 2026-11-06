<div align="center">

# trip-map-3d

**Describe tu viaje en un archivo. Haz push. Obtén un sitio web con un mapa 3D real, en cualquier lugar del mundo.**

[![Licencia: MIT](https://img.shields.io/badge/license-MIT-2ea44f.svg)](../../LICENSE)
[![Build y publicación](https://github.com/orodmorais/trip-map-3d/actions/workflows/deploy.yml/badge.svg)](https://github.com/orodmorais/trip-map-3d/actions/workflows/deploy.yml)
![Python 3.12+](https://img.shields.io/badge/python-3.12%2B-3776AB.svg?logo=python&logoColor=white)
![three.js](https://img.shields.io/badge/three.js-no%20framework-000000.svg?logo=threedotjs&logoColor=white)
![Funciona sin conexión](https://img.shields.io/badge/PWA-works%20offline-5A0FC8.svg)
![Hecho con Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-D97757.svg)

[English](../../README.md) · [Português](README.pt-BR.md) · **Español** · [Italiano](README.it.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md)

> Esta es una traducción. Si difiere del [README en inglés](../../README.md), la versión en inglés es la correcta. El sitio generado está disponible en inglés, portugués y español.

![Abriendo un día del viaje: la ruta se dibuja sola sobre carreteras reales](../../docs/demo.gif)

![La misma plantilla generando Europa, Río, O'ahu y Utah](../../docs/screenshots/m4-site.jpg)

</div>

Quería planear un viaje con algo que pudiera ver de verdad. En un mapa plano, un trayecto corto en auto y un sendero empinado se ven iguales. En 3D ves la cresta antes de animarte a la caminata, y te haces una idea real de cuánto del día (y del tanque de gasolina) te va a llevar una ruta.

Así que lo hice para mi propio viaje a O'ahu y después lo convertí en una plantilla para cualquier destino. Describes el viaje en un archivo y obtienes un sitio web estático: un mapa 3D real por región, una ruta animada para cada día, pines y tarjetas para cada lugar, una página día por día para tu teléfono y el clima de cada día.

> Sin servidores que mantener y sin claves de API para uso personal (para el camino sin código basta una cuenta de GitHub). Entra un archivo YAML, sale una carpeta de archivos estáticos. GitHub Actions vuelve a generar el sitio cada vez que editas el viaje.

**Demos en vivo:** [Europe](https://orodmorais.github.io/trip-map-3d/) · [O'ahu](https://orodmorais.github.io/trip-map-3d/oahu/) (en portugués) · **Cinco viajes de ejemplo:** [examples/](../../examples/) · **Informe de pruebas:** [docs/TEST_REPORT.md](../../docs/TEST_REPORT.md)

---

## De un vistazo

| | Lo que obtienes |
|---|---|
| 🗺️ **Mapa 3D** | Relieve, profundidad del mar, ríos, carreteras, edificios y vegetación, todo a partir de datos abiertos y pintado con la paleta de tu tema |
| 🧭 **Rutas del día** | La ruta de cada día sigue carreteras reales, se dibuja sola y se encuadra automáticamente para quedar libre de la tarjeta |
| 🌍 **Viajes largos** | Los lugares muy distantes se convierten en mapas separados, unidos por una vista general. Lisboa, Roma y los Alpes son tres mapas, no un borrón plano |
| 📍 **Pines y tarjetas** | Cada lugar tiene un pin, una tarjeta, una foto, un consejo y un monumento 3D opcional |
| 🔎 **Búsqueda y filtros** | Por nombre o tipo, sin importar los acentos |
| 📱 **Página del itinerario** | Todo el viaje, día por día, pensado para leerse en el teléfono |
| ⛅ **Clima** | Un pronóstico para cada día del viaje, además de la salida y la puesta del sol |
| 📡 **Modo hoy y sin conexión** | Se abre en el día de hoy, muestra dónde estás con un punto azul, se instala como app y funciona sin señal |
| 🌊 **Módulos opcionales** | Spots de surf con puntuación de 0 a 5, mareas, tus propios modelos 3D |
| 🎨 **Totalmente personalizable** | Fuentes, colores, paleta del mapa, íconos de los pines, estilo de las insignias. Incluye tres presets |
| 🗣️ **Idiomas del sitio** | Inglés, portugués y español, con °C o °F y km o millas |

---

## Galería

La misma plantilla, cinco viajes distintos. Cada captura de pantalla es un build real de [examples/](../../examples/).

| Lisboa + Roma + Alpes, 12 días | Río de Janeiro, 5 días | Parques de Utah, 7 días |
|---|---|---|
| ![Europa](../../docs/screenshots/europe/desktop-day.jpg) | ![Río](../../docs/screenshots/rio/desktop-day.jpg) | ![Utah](../../docs/screenshots/utah/desktop-day.jpg) |
| **O'ahu, 6 días** | **Toledo, 1 día** | **En un teléfono** |
| ![O'ahu](../../docs/screenshots/oahu/desktop-day.jpg) | ![Toledo](../../docs/screenshots/day-trip/desktop-day.jpg) | ![Teléfono](../../docs/screenshots/europe/mobile-day.jpg) |

---

## Inicio rápido

Elige el camino que mejor te quede. Todos terminan en el mismo `trip.yaml`.

| Tú | Qué usar |
|---|---|
| No programas | **Use this template** en GitHub y edita `trip.yaml` en el navegador |
| Usas Claude en un chat | Pega [MASTER_PROMPT.md](../../MASTER_PROMPT.md), responde las preguntas y pega el archivo que genere |
| Usas Claude Code | Indícale [SKILL.md](../../SKILL.md): te entrevista, genera el sitio, revisa las capturas de pantalla y publica |
| Eres desarrollador | Clona y ejecuta `python -m pipeline build trip.yaml` |

### Sin código, en GitHub

1. Haz clic en **Use this template** (usar esta plantilla) y crea tu repositorio.
2. Ve a **Settings → Pages** y en **Source** elige **GitHub Actions**. Es el único paso manual.
3. Abre `trip.yaml`, haz clic en el lápiz, describe tu viaje y haz commit.
4. Espera unos minutos. Tu sitio aparecerá en `https://YOUR-USER.github.io/YOUR-REPOSITORY`.

> [!WARNING]
> En una cuenta gratuita de GitHub, GitHub Pages solo funciona con repositorios **públicos**. Tu `trip.yaml` y tu sitio quedan a la vista de cualquiera que tenga el enlace: itinerario, fechas, todo. Escribe el barrio donde te alojas, nunca la dirección exacta. No incluyas números de vuelo, códigos de puertas ni dónde se guardan las llaves.

---

## El archivo del viaje

Solo tres campos son obligatorios. El build deduce el resto (zona horaria, regiones, coordenadas, rutas) e imprime todo lo que dedujo para que lo revises.

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
> Agrega siempre la ciudad al nombre del lugar: `"Pantheon, Roma"`, no `"Pantheon"`. Si la búsqueda sigue eligiendo el lugar equivocado, indica `lat` y `lon` en `places:` en lugar de volver a intentarlo.

### Campos principales

| Campo | Obligatorio | Qué hace |
|---|:---:|---|
| `title` | ✅ | Nombre del sitio |
| `dates.start` | ✅ | Primer día. La fecha de cada día se deduce de su posición |
| `days[].items` | ✅ | Lo que haces, en orden. Un lugar puede ser solo un nombre |
| `subtitle` | | Una línea corta debajo del título |
| `language` | | `en`, `pt-BR` o `es` |
| `units` | | `temp: C/F`, `distance: km/mi`, `waves: ft/m` |
| `home` | | Dónde duermes. Se convierte en el pin de casa |
| `places` | | Detalle completo de un lugar: coordenadas, tipo, descripción, consejo, foto, modelo 3D, cámara |
| `regions.max_km` | | Lado más largo de un mapa 3D. Por debajo de ese tamaño, las regiones se adaptan al viaje |
| `modules` | | `weather`, `surf`, `tides`, `landmarks` |
| `services` | | Tu propio servicio de geocodificación y de rutas |
| `downloads` | | Archivos adicionales enlazados desde la página del itinerario |

Todos los campos, con valores de ejemplo: [examples/trip.example.yaml](../../examples/trip.example.yaml).

---

## Personalizar

| Qué | Cómo |
|---|---|
| Colores, fuentes, paleta del mapa | `theme.yaml` junto a `trip.yaml`. Consulta [el ejemplo](../../examples/theme.example.yaml) |
| Tema listo para usar | `preset: oahu` (papel en tono cálido), `minimal` (grises y un azul) o `dark` |
| Títulos con aspecto de dibujados a mano | Cualquier fuente de `@fontsource` con archivos latinos como `fonts.display`, más fina con `display_thin` |
| Color e ícono del pin por tipo | `pins.types: {surf: {color: "#1F7FA6", icon: wave}}` |
| Monumento 3D para un lugar | `model: bridge`, `lighthouse`, `temple`, `tower`, `waterfall`, `pier`, `islet`, `airport`, `house` o `ridge_stairs` |
| Tus propios modelos 3D | `landmarks: landmarks.js` en `trip.yaml`. Consulta [el ejemplo de O'ahu](../../examples/oahu/landmarks.js) |
| Cámara para un lugar | `camera: {zoom: 7, dir: [0.4, 0.6, 0.7]}` |
| Nombre de un mapa | `regions: {titles: {Lauterbrunnen: "Swiss Alps"}}` |
| Surf y mareas | `modules: {surf: true, tides: true}` y `surf_spots: spots.yaml` |
| Un día sin carreteras (barco, caminata) | `route: line` en ese día |
| Tus propios servidores | `services: {geocoder: ..., router: ...}` |
| Nubes, mar animado, colores del día | `ui:` en `theme.yaml` |

---

## Módulos

| Módulo | Por defecto | Fuente | Notas |
|---|:---:|---|---|
| Clima | activado | Open-Meteo (pronóstico) | 16 días hacia adelante. Más allá, solo la salida y la puesta del sol |
| Monumentos 3D | auto | Kit integrado o tu `landmarks.js` | Se colocan según el `model:` de cada lugar |
| Surf | desactivado | Open-Meteo (datos marinos) | Cada spot recibe una puntuación de 0 a 5 según el tamaño y el período del oleaje y el viento |
| Mareas | desactivado | NOAA CO-OPS en EE. UU., Open-Meteo (datos marinos) en otros lugares | Las tablas de EE. UU. se guardan durante el build, así que funcionan sin conexión. Fuera de EE. UU., la estimación es menos precisa |

---

## Ejecútalo en tu computadora

Requiere Python 3.12 o posterior.

```bash
python -m pip install -r requirements.txt
python -m pipeline check trip.yaml        # encuentra cada lugar e imprime lo que encontró
python -m pipeline build trip.yaml --out dist
python -m http.server --directory dist    # abre http://localhost:8000
```

Para revisar un build visualmente, como lo hace la skill:

```bash
python -m pip install -r requirements-dev.txt
python tools/check_site.py dist --shots shots --hashes "" dia-1
```

`check_site.py` abre el sitio en un navegador headless, guarda capturas de pantalla e informa cualquier error. `tools/check_trip.py dist --name NAME --shots FOLDER` ejecuta la lista de verificación completa para publicar que aparece en el informe de pruebas: los pines caben en pantalla, ninguna ruta queda debajo de una tarjeta, no hay fondos vacíos, búsqueda, clima, modo hoy, sin conexión.

### Publicación

| Hosting | Configuración |
|---|---|
| **GitHub Pages** (predeterminado) | Settings → Pages → Source: GitHub Actions |
| **Cloudflare Pages** | Agrega la variable `CLOUDFLARE_PROJECT` y los secrets `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`. El workflow cambia de destino solo |
| **En cualquier otro lugar** | Sube `dist/`. Son archivos estáticos, nada más |

---

## Cómo funciona

```
trip.yaml ──▶ 1. Viaje ──▶ 2. Regiones ──▶ 3. Mapa ──▶ 4. Sitio ──▶ dist/
               │            │               │           │
               │            │               │           └─ three.js estático, sin framework, sin conexión
               │            │               └─ relieve + cobertura del suelo + carreteras + ríos, pintados
               │            └─ red más corta entre los lugares, se cortan los enlaces más largos
               └─ valida, geocodifica una vez, guarda en caché en trip.lock.json
```

1. **Viaje.** Valida el archivo, encuentra cada lugar y guarda las respuestas en `trip.lock.json`, así cada nombre se busca una sola vez, para siempre.
2. **Regiones.** Une todos los lugares con la red más corta posible y luego corta los enlaces más largos. Un viaje por carretera queda en un solo mapa; dos lugares a mil kilómetros de distancia se convierten en dos mapas.
3. **Mapa.** Combina elevación, profundidad del mar, cobertura del suelo, carreteras, edificios y ríos en un campo de alturas y una textura pintada con la paleta del tema.
4. **Sitio.** Genera un sitio estático con three.js, con un service worker para que siga funcionando sin conexión.

### Mediciones

Según [docs/TEST_REPORT.md](../../docs/TEST_REPORT.md): cada día de cada viaje se abrió en 1440×900 y 390×844, en Chrome en una MacBook Air.

| Viaje | Primer build | Tamaño del sitio | Errores de JS | fps (escritorio / viewport de teléfono) |
|---|---:|---:|---:|---|
| O'ahu, 6 días | 180 s | 3.8 MB | 0 | 30 / 58 |
| Río de Janeiro, 5 días | 84 s | 4.8 MB | 0 | 60 / 60 |
| Parques de Utah, 7 días | 53 s | 4.8 MB | 0 | 60 / 61 |
| Toledo, 1 día | 34 s | 3.6 MB | 0 | 60 / 60 |
| Lisboa + Roma + Alpes, 12 días | 72 s | 13.8 MB | 0 | 60 / 60 |

Los primeros builds incluyen todas las descargas. Con la caché ya llena, tardan de 6 a 24 s. Los tiempos del primer build son de la ronda anterior a las últimas correcciones, como indica el [informe de pruebas](../TEST_REPORT.md).

> [!NOTE]
> La columna de teléfono es un viewport del tamaño de un teléfono en una GPU de Mac, no un teléfono real. Todavía no se han medido los fps en dispositivos reales. Por debajo de 24 fps, el sitio cambia solo a una imagen más ligera.

---

## Qué hay dentro

```
trip-map-3d/
├── trip.yaml                 # tu viaje: el único archivo que necesitas editar
├── trip.lock.json            # todos los lugares ya buscados. Haz commit, nunca lo borres
├── pipeline/                 # build en Python: viaje → regiones → mapa → sitio
│   ├── schema.py             #   valida trip.yaml y completa los valores por defecto
│   ├── geocode.py            #   búsquedas en Photon, en caché en trip.lock.json
│   ├── routes.py             #   rutas por carretera de OSRM, en caché igual que los lugares
│   ├── regions.py            #   divide el viaje en mapas
│   ├── terrain.py            #   Copernicus GLO-30 en tierra, Terrarium en el mar, sin picos falsos
│   ├── vectors.py            #   carreteras, ríos, pistas de aterrizaje, poblaciones y edificios de Overture
│   ├── scene.py              #   árboles, palmeras y edificios a partir de la cobertura del suelo
│   ├── texture.py            #   pinta el mapa con la paleta del tema
│   ├── theme.py              #   presets + theme.yaml
│   ├── surf.py · tides.py    #   módulos opcionales
│   ├── site.py               #   arma dist/: plantilla, datos, tema, fuentes, fotos
│   └── __main__.py           #   `python -m pipeline check|build`
├── site/                     # front end estático, sin framework
│   ├── app.js                #   pantalla principal: cámara, pines, filtros, rutas de URL
│   ├── world.js              #   relieve, mar, vegetación, edificios
│   ├── framing.js            #   ajusta la ruta del día al espacio libre junto a la tarjeta
│   ├── routes3d.js           #   rutas animadas
│   ├── callouts.js           #   fotos junto a la ruta del día
│   ├── landmarks.js          #   kit integrado de monumentos 3D
│   ├── cards.js · search.js  #   tarjetas, búsqueda
│   ├── weather.js · surf.js · tides.js
│   ├── live.js               #   modo hoy, punto azul, aviso sin conexión
│   ├── roteiro.html          #   página del itinerario día por día
│   ├── i18n.js               #   en, pt-BR, es. Para agregar un idioma: un bloque aquí y su código en LANGUAGES, en pipeline/schema.py
│   ├── sw.js                 #   service worker
│   └── vendor/               #   three.js, incluido en el repositorio
├── presets/                  # oahu · minimal · dark
├── examples/                 # cinco viajes completos + todos los campos documentados
├── tools/                    # check_site.py, check_trip.py: pruebas en un navegador real
├── tests/                    # 51 pruebas con pytest
├── .github/workflows/        # build en cada push, publicación en Pages o Cloudflare
├── SKILL.md                  # para Claude Code
├── MASTER_PROMPT.md          # para Claude en un chat
├── DATA_SOURCES.md           # cada fuente, medida, con límites y licencias
└── DECISOES.md               # decisiones de diseño y sus motivos (en portugués)
```

---

## Fuentes de datos y licencias

Cada fuente se probó con solicitudes reales antes de elegirla. Las mediciones, los límites y las alternativas descartadas están en [DATA_SOURCES.md](../../DATA_SOURCES.md).

| Necesidad | Fuente | Licencia | Cuándo |
|---|---|---|---|
| Elevación del terreno | Copernicus GLO-30 (datos abiertos de AWS) | Libre, con aviso obligatorio | Build |
| Profundidad del mar | AWS Terrain Tiles (Terrarium) | Lista de atribuciones | Build |
| Tierra, mar, cobertura del suelo | ESA WorldCover 2021 | CC BY 4.0 | Build |
| Carreteras, edificios, poblaciones | Overture Maps | ODbL y otras | Build |
| Búsqueda de lugares | Photon (komoot) | Datos ODbL | Build, una vez por lugar |
| Rutas por carretera | FOSSGIS OSRM | Datos ODbL | Build, una vez por ruta |
| Clima, surf | Open-Meteo | CC BY 4.0, **no comercial** | En el navegador |
| Mareas de EE. UU. | NOAA CO-OPS | Dominio público | Build |

> [!IMPORTANT]
> **La API gratuita de Open-Meteo es para uso no comercial.** Una agencia de viajes o cualquier producto de pago necesita una clave de pago, configurada en `services.open_meteo_key`.
>
> **Conserva los créditos.** Cada sitio generado muestra las atribuciones que exigen estas licencias. No las elimines.
>
> **Las fotos deben ser tuyas o tener licencia.** La plantilla nunca descarga fotos por ti.
>
> **Nada de Nominatim público.** Su política de uso prohíbe integrarlo como geocodificador genérico en herramientas como esta. Si quieres usarlo, apunta `services.geocoder` a tu propia instancia.

---

## Por qué se ve así

- **3D, porque un viaje es algo físico.** El relieve te dice lo que de verdad te va a costar un trayecto en auto, una caminata o un sendero.
- **Un mapa por región, no un mapa gigante.** Si te alejas demasiado, el relieve se aplana. Preferí un relieve que se vea bien, aunque eso implicara dividir el viaje en varios mapas.
- **Carreteras reales.** Si te importa esto tanto como a mí, ver las carreteras tal como son hace que la ruta se sienta real e interactiva.
- **Monumentos 3D.** Ver en 3D los lugares que marcaron el viaje (o que lo marcarán) convierte el mapa en algo que de verdad quieres usar, no en otra app de mapas más.
- **Toda la ruta en pantalla.** Ver un día de principio a fin es lo que hace que todo encaje.
- **Un relieve que te acompaña.** Una vista topográfica dinámica te da una mejor idea del conjunto.
- **Un mar y un horizonte sin fin.** El mapa parece infinito, pero el detalle se queda donde de verdad vas a estar.
- **Las fuentes más precisas que encontré,** medidas antes de elegirlas (ver [DATA_SOURCES.md](../../DATA_SOURCES.md)).
- **Público.** Pensé que más gente querría planear sus viajes con algo que pudiera ver.

Las doce decisiones, con las alternativas que descarté: [DECISOES.md](../../DECISOES.md) (en portugués).

---

## Origen

Hice la primera versión para un viaje a O'ahu con tres amigos, en noviembre de 2026: toda la isla en 3D, cada playa, sendero y spot de surf, la ruta de cada día, surf y clima en vivo, y un modo que se abre en el día de hoy. Quienes lo vieron me pidieron el código. Mi prima, que trabaja en planificación de viajes, me pidió una copia en un zip antes de que este repositorio existiera. Así que lo hice funcionar para cualquier lugar.

El ejemplo de O'ahu de este repositorio solo incluye lugares públicos, porque el original era un viaje personal. Aun así, siempre estoy abierto a preguntas sobre nuestro itinerario de O'ahu.

Diseñé el producto y tomé las decisiones que están en [DECISOES.md](../../DECISOES.md). [Claude Code](https://claude.com/claude-code) escribió el código, midió cada fuente de datos antes de que yo la aprobara y probó la plantilla en cinco viajes muy distintos.

**Rodrigo Morais** · [@orodmorais](https://github.com/orodmorais) · [LinkedIn](https://www.linkedin.com/in/rodrigomorais-/)

## Contribuir

Los issues y pull requests son bienvenidos, sobre todo nuevos monumentos 3D, nuevos presets, traducciones del sitio y viajes de ejemplo de lugares que la plantilla todavía no conoce. Ejecuta `pytest` antes de abrir un pull request.

## Licencia

El código está bajo licencia [MIT](../../LICENSE). Los datos de mapa dentro de cada sitio generado siguen bajo la licencia de su respectiva fuente (ver arriba).

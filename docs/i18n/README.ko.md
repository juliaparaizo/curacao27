<div align="center">

# trip-map-3d

**여행 내용을 파일 하나에 적고 push하세요. 전 세계 어디든, 실제 3D 지도가 담긴 웹사이트가 만들어집니다.**

[![라이선스: MIT](https://img.shields.io/badge/license-MIT-2ea44f.svg)](../../LICENSE)
[![빌드 및 배포](https://github.com/orodmorais/trip-map-3d/actions/workflows/deploy.yml/badge.svg)](https://github.com/orodmorais/trip-map-3d/actions/workflows/deploy.yml)
![Python 3.12+](https://img.shields.io/badge/python-3.12%2B-3776AB.svg?logo=python&logoColor=white)
![three.js, 프레임워크 없음](https://img.shields.io/badge/three.js-no%20framework-000000.svg?logo=threedotjs&logoColor=white)
![오프라인 지원](https://img.shields.io/badge/PWA-works%20offline-5A0FC8.svg)
![Claude Code로 제작](https://img.shields.io/badge/built%20with-Claude%20Code-D97757.svg)

[English](../../README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Italiano](README.it.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · **한국어**

> 이 문서는 번역본입니다. [영어 README](../../README.md)와 내용이 다를 경우 영어판이 기준입니다. 생성되는 사이트 자체는 영어, 포르투갈어, 스페인어로 제공됩니다.

![여행의 하루를 열면 실제 도로를 따라 경로가 저절로 그려지는 모습](../../docs/demo.gif)

![같은 템플릿으로 유럽, 리우, 오아후, 유타를 빌드한 모습](../../docs/screenshots/m4-site.jpg)

</div>

눈으로 직접 볼 수 있는 무언가로 여행을 계획하고 싶었습니다. 평면 지도에서는 짧은 드라이브와 가파른 등산로가 똑같아 보입니다. 3D로 보면 하이킹을 결정하기 전에 능선이 보이고, 그 경로가 하루 중 얼마만큼의 시간을(그리고 기름을 얼마나) 잡아먹을지 실감할 수 있습니다.

그래서 제 오아후 여행을 위해 직접 만들었고, 그다음 어떤 여행지에도 쓸 수 있는 템플릿으로 바꿨습니다. 여행 내용을 파일 하나에 적으면 정적 웹사이트가 만들어집니다. 지역마다 실제 3D 지도 한 장, 날마다 애니메이션으로 그려지는 경로, 모든 장소의 핀과 카드, 휴대폰용 일별 페이지, 그리고 날짜별 날씨까지 담깁니다.

> 운영할 서버가 필요 없고, 개인 용도라면 API 키도 필요 없습니다(코드 없는 방법에 필요한 것은 GitHub 계정뿐입니다). YAML 파일 하나를 넣으면 정적 파일 폴더 하나가 나옵니다. 여행 내용을 수정할 때마다 GitHub Actions가 사이트를 다시 빌드합니다.

**라이브 데모:** [Europe](https://orodmorais.github.io/trip-map-3d/) · [O'ahu](https://orodmorais.github.io/trip-map-3d/oahu/) (포르투갈어) · **예시 여행 5개:** [examples/](../../examples/) · **테스트 보고서:** [docs/TEST_REPORT.md](../../docs/TEST_REPORT.md)

---

## 한눈에 보기

| | 제공 기능 |
|---|---|
| 🗺️ **3D 지도** | 지형, 수심, 강, 도로, 건물, 식생을 모두 오픈 데이터로 만들고 테마 팔레트로 칠합니다 |
| 🧭 **일별 경로** | 각 날의 경로는 실제 도로를 따라 저절로 그려지며, 카드를 피해 자동으로 화면에 맞춰집니다 |
| 🌍 **장거리 여행** | 멀리 떨어진 장소는 별도의 지도로 나뉘고 개요 지도로 연결됩니다. 리스본, 로마, 알프스는 흐릿한 평면 하나가 아니라 지도 세 장이 됩니다 |
| 📍 **핀과 카드** | 모든 장소에 핀, 카드, 사진, 팁, 그리고 선택적으로 3D 랜드마크가 붙습니다 |
| 🔎 **검색과 필터** | 이름이나 유형으로 검색하며, 악센트 부호는 무시합니다 |
| 📱 **일정 페이지** | 여행 전체를 날짜별로 보여 주며, 휴대폰에서 읽기 좋게 만들었습니다 |
| ⛅ **날씨** | 여행 기간 매일의 예보와 일출, 일몰 시각 |
| 📡 **오늘 모드와 오프라인** | 오늘 날짜로 열리고, 현재 위치를 파란 점으로 표시하며, 앱으로 설치하면 신호가 없어도 작동합니다 |
| 🌊 **선택 모듈** | 0~5점으로 평가한 서핑 스폿, 조석, 직접 만든 3D 모델 |
| 🎨 **자유로운 테마 설정** | 글꼴, 색상, 지도 팔레트, 핀 아이콘, 배지 스타일. 프리셋 3종 포함 |
| 🗣️ **사이트 언어** | 영어, 포르투갈어, 스페인어. °C 또는 °F, km 또는 마일 선택 가능 |

---

## 갤러리

같은 템플릿, 서로 다른 다섯 가지 여행. 모든 스크린샷은 [examples/](../../examples/)를 실제로 빌드한 결과입니다.

| 리스본 + 로마 + 알프스, 12일 | 리우데자네이루, 5일 | 유타의 국립공원, 7일 |
|---|---|---|
| ![유럽](../../docs/screenshots/europe/desktop-day.jpg) | ![리우](../../docs/screenshots/rio/desktop-day.jpg) | ![유타](../../docs/screenshots/utah/desktop-day.jpg) |
| **오아후, 6일** | **톨레도, 1일** | **휴대폰에서** |
| ![오아후](../../docs/screenshots/oahu/desktop-day.jpg) | ![톨레도](../../docs/screenshots/day-trip/desktop-day.jpg) | ![휴대폰](../../docs/screenshots/europe/mobile-day.jpg) |

---

## 빠른 시작

자신에게 맞는 방법을 고르세요. 어느 방법이든 결국 같은 `trip.yaml`이 만들어집니다.

| 사용자 | 방법 |
|---|---|
| 코딩을 하지 않는 분 | GitHub에서 **Use this template**을 누르고 브라우저에서 `trip.yaml` 편집 |
| 채팅으로 Claude를 쓰는 분 | [MASTER_PROMPT.md](../../MASTER_PROMPT.md)를 붙여 넣고 질문에 답한 뒤, 작성된 파일을 붙여 넣기 |
| Claude Code를 쓰는 분 | [SKILL.md](../../SKILL.md)를 지정하면 인터뷰, 빌드, 스크린샷 확인, 배포까지 진행 |
| 개발자 | 클론한 뒤 `python -m pipeline build trip.yaml` |

### 코드 없이 GitHub에서

1. **Use this template**(이 템플릿 사용)을 클릭해 저장소를 만듭니다.
2. **Settings → Pages**에서 **Source**를 **GitHub Actions**로 설정합니다. 직접 해야 하는 단계는 이것뿐입니다.
3. `trip.yaml`을 열고 연필 아이콘을 클릭해 여행 내용을 적은 다음 커밋합니다.
4. 몇 분 기다립니다. 사이트가 `https://YOUR-USER.github.io/YOUR-REPOSITORY`에 나타납니다.

> [!WARNING]
> 무료 GitHub 계정에서는 GitHub Pages가 **공개** 저장소에서만 작동합니다. `trip.yaml`과 사이트는 링크가 있는 누구나 볼 수 있습니다. 일정, 날짜를 포함해 모든 것이 공개됩니다. 숙소는 동네 이름까지만 적고, 상세 주소는 절대 적지 마세요. 항공편 번호, 도어 비밀번호, 열쇠 보관 위치도 빼 두세요.

---

## 여행 파일

필수 필드는 세 개뿐입니다. 나머지(시간대, 지역, 좌표, 경로)는 빌드 과정에서 알아서 추론하며, 추론한 내용을 모두 출력하므로 검토할 수 있습니다.

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
> 장소 이름에는 항상 도시 이름을 함께 적으세요. `"Pantheon"`이 아니라 `"Pantheon, Roma"`처럼 씁니다. 그래도 검색이 엉뚱한 장소를 고른다면, 다시 시도하지 말고 `places:` 아래에 `lat`과 `lon`을 지정하세요.

### 주요 필드

| 필드 | 필수 | 설명 |
|---|:---:|---|
| `title` | ✅ | 사이트 이름 |
| `dates.start` | ✅ | 첫날. 각 날의 날짜는 순서에 따라 정해집니다 |
| `days[].items` | ✅ | 할 일을 순서대로 적습니다. 장소는 이름만 적어도 됩니다 |
| `subtitle` | | 제목 아래에 표시할 짧은 한 줄 |
| `language` | | `en`, `pt-BR` 또는 `es` |
| `units` | | `temp: C/F`, `distance: km/mi`, `waves: ft/m` |
| `home` | | 숙소. 홈 핀이 됩니다 |
| `places` | | 장소의 상세 정보: 좌표, 유형, 설명, 팁, 사진, 3D 모델, 카메라 |
| `regions.max_km` | | 3D 지도 한 장의 가장 긴 변. 이 범위 안에서 지역이 여행에 맞게 조정됩니다 |
| `modules` | | `weather`, `surf`, `tides`, `landmarks` |
| `services` | | 직접 운영하는 지오코더와 라우터 |
| `downloads` | | 일정 페이지에서 링크할 추가 파일 |

모든 필드와 예시 값: [examples/trip.example.yaml](../../examples/trip.example.yaml)

---

## 커스터마이즈

| 항목 | 방법 |
|---|---|
| 색상, 글꼴, 지도 팔레트 | `trip.yaml` 옆에 `theme.yaml`을 둡니다. [예시](../../examples/theme.example.yaml) 참고 |
| 기본 제공 테마 | `preset: oahu`(따뜻한 종이 느낌), `minimal`(회색과 파란색 하나) 또는 `dark` |
| 손글씨 느낌의 제목 | `@fontsource`에서 라틴 파일이 있는 글꼴을 `fonts.display`로 지정하고, `display_thin`으로 가늘게 조정 |
| 유형별 핀 색상과 아이콘 | `pins.types: {surf: {color: "#1F7FA6", icon: wave}}` |
| 장소의 3D 랜드마크 | `model: bridge`, `lighthouse`, `temple`, `tower`, `waterfall`, `pier`, `islet`, `airport`, `house` 또는 `ridge_stairs` |
| 직접 만든 3D 모델 | `trip.yaml`에 `landmarks: landmarks.js`. [오아후 예시](../../examples/oahu/landmarks.js) 참고 |
| 장소별 카메라 | `camera: {zoom: 7, dir: [0.4, 0.6, 0.7]}` |
| 지도 이름 | `regions: {titles: {Lauterbrunnen: "Swiss Alps"}}` |
| 서핑과 조석 | `modules: {surf: true, tides: true}`와 `surf_spots: spots.yaml` |
| 도로가 없는 날(배, 하이킹) | 해당 날에 `route: line` |
| 직접 운영하는 서버 | `services: {geocoder: ..., router: ...}` |
| 구름, 움직이는 바다, 날짜별 색상 | `theme.yaml`의 `ui:` |

---

## 모듈

| 모듈 | 기본값 | 데이터 출처 | 비고 |
|---|:---:|---|---|
| 날씨 | 켜짐 | Open-Meteo 예보 | 16일 후까지. 그 이후는 일출과 일몰만 |
| 3D 랜드마크 | 자동 | 내장 키트 또는 직접 만든 `landmarks.js` | 각 장소의 `model:`에 따라 배치 |
| 서핑 | 꺼짐 | Open-Meteo marine | 너울 크기, 주기, 바람으로 각 스폿을 0~5점으로 평가 |
| 조석 | 꺼짐 | 미국은 NOAA CO-OPS, 그 외 지역은 Open-Meteo marine | 미국 조석표는 빌드할 때 저장되므로 오프라인에서도 작동합니다. 미국 밖에서는 추정치가 덜 정확합니다 |

---

## 내 컴퓨터에서 실행하기

Python 3.12 이상이 필요합니다.

```bash
python -m pip install -r requirements.txt
python -m pipeline check trip.yaml        # 모든 장소를 찾고, 찾은 결과를 출력
python -m pipeline build trip.yaml --out dist
python -m http.server --directory dist    # http://localhost:8000 열기
```

스킬과 같은 방식으로 빌드를 눈으로 확인하려면:

```bash
python -m pip install -r requirements-dev.txt
python tools/check_site.py dist --shots shots --hashes "" dia-1
```

`check_site.py`는 헤드리스 브라우저로 사이트를 열고, 스크린샷을 저장하며, 오류가 있으면 보고합니다. `tools/check_trip.py dist --name NAME --shots FOLDER`는 테스트 보고서에 있는 릴리스 체크리스트 전체를 실행합니다: 핀이 화면에 들어오는지, 카드 아래에 가려진 경로가 없는지, 빈 배경이 없는지, 검색, 날씨, 오늘 모드, 오프라인.

### 배포

| 호스트 | 설정 |
|---|---|
| **GitHub Pages** (기본값) | Settings → Pages → Source: GitHub Actions |
| **Cloudflare Pages** | `CLOUDFLARE_PROJECT` 변수와 `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` 시크릿을 추가합니다. 워크플로가 알아서 전환됩니다 |
| **그 밖의 호스트** | `dist/`를 업로드하면 됩니다. 평범한 정적 파일입니다 |

---

## 작동 방식

```
trip.yaml ──▶ 1. Trip ──▶ 2. Regions ──▶ 3. Map ──▶ 4. Site ──▶ dist/
               │            │              │           │
               │            │              │           └─ 정적 three.js, 프레임워크 없음, 오프라인 지원
               │            │              └─ 지형 + 토지 피복 + 도로 + 강, 채색
               │            └─ 장소 사이의 최단 네트워크, 가장 긴 연결은 끊음
               └─ 검증, 지오코딩은 한 번만, trip.lock.json에 캐시
```

1. **Trip(여행).** 파일을 검증하고 모든 장소를 찾아 그 결과를 `trip.lock.json`에 저장합니다. 그래서 각 이름은 단 한 번만 조회됩니다.
2. **Regions(지역).** 모든 장소를 가능한 가장 짧은 네트워크로 연결한 다음, 가장 긴 연결을 끊습니다. 로드 트립은 지도 한 장에 담기고, 1,000 km 떨어진 두 장소는 지도 두 장이 됩니다.
3. **Map(지도).** 고도, 수심, 토지 피복, 도로, 건물, 강을 합쳐 높이 필드와 테마 팔레트로 칠한 텍스처를 만듭니다.
4. **Site(사이트).** 정적 three.js 사이트를 생성합니다. 서비스 워커가 포함되어 있어 오프라인에서도 계속 작동합니다.

### 측정 결과

[docs/TEST_REPORT.md](../../docs/TEST_REPORT.md) 기준: 모든 여행의 모든 날을 MacBook Air의 Chrome에서 1440×900과 390×844로 열어 측정했습니다.

| 여행 | 첫 빌드 | 사이트 크기 | JS 오류 | fps (데스크톱 / 휴대폰 크기 뷰포트) |
|---|---:|---:|---:|---|
| 오아후, 6일 | 180 s | 3.8 MB | 0 | 30 / 58 |
| 리우데자네이루, 5일 | 84 s | 4.8 MB | 0 | 60 / 60 |
| 유타의 국립공원, 7일 | 53 s | 4.8 MB | 0 | 60 / 61 |
| 톨레도, 1일 | 34 s | 3.6 MB | 0 | 60 / 60 |
| 리스본 + 로마 + 알프스, 12일 | 72 s | 13.8 MB | 0 | 60 / 60 |

첫 빌드에는 모든 다운로드가 포함됩니다. 캐시가 있는 상태에서는 6~24 s가 걸립니다. 첫 빌드 시간은 마지막 수정 이전 실행에서 측정한 값입니다([테스트 보고서](../TEST_REPORT.md) 참고).

> [!NOTE]
> 휴대폰 열은 Mac GPU에서 휴대폰 크기 뷰포트로 측정한 값이며, 실제 휴대폰이 아닙니다. 실제 기기의 프레임 레이트는 아직 측정하지 않았습니다. 24 fps 아래로 떨어지면 사이트가 알아서 더 가벼운 화면으로 전환합니다.

---

## 구성

```
trip-map-3d/
├── trip.yaml                 # 여러분의 여행: 수정해야 할 파일은 이것뿐
├── trip.lock.json            # 이미 조회한 모든 장소. 커밋하고, 절대 삭제하지 마세요
├── pipeline/                 # Python 빌드: trip → regions → map → site
│   ├── schema.py             #   trip.yaml을 검증하고 기본값을 채움
│   ├── geocode.py            #   Photon 조회, trip.lock.json에 캐시
│   ├── routes.py             #   OSRM 도로 경로, 장소처럼 캐시
│   ├── regions.py            #   여행을 여러 지도로 나눔
│   ├── terrain.py            #   육지는 Copernicus GLO-30, 바다는 Terrarium, 스파이크 제거
│   ├── vectors.py            #   Overture 도로, 강, 활주로, 마을, 건물
│   ├── scene.py              #   토지 피복을 바탕으로 나무, 야자수, 건물 배치
│   ├── texture.py            #   테마 팔레트로 지도를 칠함
│   ├── theme.py              #   프리셋 + theme.yaml
│   ├── surf.py · tides.py    #   선택 모듈
│   ├── site.py               #   dist/ 조립: 템플릿, 데이터, 테마, 글꼴, 사진
│   └── __main__.py           #   `python -m pipeline check|build`
├── site/                     # 정적 프런트엔드, 프레임워크 없음
│   ├── app.js                #   메인 화면: 카메라, 핀, 필터, URL 라우팅
│   ├── world.js              #   지형, 바다, 식생, 건물
│   ├── framing.js            #   그날의 경로를 카드 옆 빈 공간에 맞춤
│   ├── routes3d.js           #   애니메이션 경로
│   ├── callouts.js           #   경로 옆 사진
│   ├── landmarks.js          #   내장 3D 랜드마크 키트
│   ├── cards.js · search.js  #   카드, 검색
│   ├── weather.js · surf.js · tides.js
│   ├── live.js               #   오늘 모드, 파란 점, 오프라인 배너
│   ├── roteiro.html          #   일별 일정 페이지
│   ├── i18n.js               #   en, pt-BR, es. 언어 추가: 여기에 블록 하나, pipeline/schema.py의 LANGUAGES에 코드 추가
│   ├── sw.js                 #   서비스 워커
│   └── vendor/               #   three.js (저장소에 포함)
├── presets/                  # oahu · minimal · dark
├── examples/                 # 완전한 여행 예시 5개 + 모든 필드 설명
├── tools/                    # check_site.py, check_trip.py: 실제 브라우저에서 확인
├── tests/                    # pytest 테스트 51개
├── .github/workflows/        # push하면 빌드하고, Pages 또는 Cloudflare에 배포
├── SKILL.md                  # Claude Code용
├── MASTER_PROMPT.md          # 채팅으로 쓰는 Claude용
├── DATA_SOURCES.md           # 모든 데이터 출처의 측정 결과, 제한, 라이선스
└── DECISOES.md               # 설계 결정과 그 이유 (포르투갈어)
```

---

## 데이터 출처와 라이선스

모든 출처는 선택하기 전에 실제 요청을 보내 확인했습니다. 측정 결과, 제한, 채택하지 않은 대안은 [DATA_SOURCES.md](../../DATA_SOURCES.md)에 정리했습니다.

| 용도 | 출처 | 라이선스 | 사용 시점 |
|---|---|---|---|
| 육지 고도 | Copernicus GLO-30 (AWS open data) | 무료, 고지 필요 | 빌드 시 |
| 해저 수심 | AWS Terrain Tiles (Terrarium) | 저작자 표시 목록 | 빌드 시 |
| 육지와 바다, 토지 피복 | ESA WorldCover 2021 | CC BY 4.0 | 빌드 시 |
| 도로, 건물, 마을 | Overture Maps | ODbL 외 | 빌드 시 |
| 장소 검색 | Photon (komoot) | ODbL 데이터 | 빌드 시, 장소당 1회 |
| 도로 경로 | FOSSGIS OSRM | ODbL 데이터 | 빌드 시, 경로당 1회 |
| 날씨, 서핑 | Open-Meteo | CC BY 4.0, **비상업적 용도** | 브라우저에서 |
| 미국 조석 | NOAA CO-OPS | 퍼블릭 도메인 | 빌드 시 |

> [!IMPORTANT]
> **Open-Meteo의 무료 API는 비상업적 용도 전용입니다.** 여행사나 유료 제품에는 유료 키가 필요하며, `services.open_meteo_key`에 설정합니다.
>
> **출처 표기를 유지하세요.** 생성되는 모든 사이트에는 이 라이선스들이 요구하는 저작자 표시가 들어 있습니다. 삭제하지 마세요.
>
> **사진은 직접 소유했거나 라이선스를 받은 것이어야 합니다.** 템플릿은 사진을 대신 내려받지 않습니다.
>
> **공개 Nominatim은 사용하지 않습니다.** Nominatim의 이용 정책은 이런 도구에 범용 지오코더로 내장하는 것을 금지합니다. 사용하고 싶다면 `services.geocoder`를 직접 운영하는 인스턴스로 지정하세요.

---

## 왜 이런 모습일까

- **3D인 이유는 여행이 물리적인 것이기 때문입니다.** 지형의 기복을 보면 드라이브, 산책, 등산로가 실제로 얼마나 힘들지 알 수 있습니다.
- **거대한 지도 한 장이 아니라 지역마다 지도 한 장.** 너무 멀리 축소하면 기복이 평평해집니다. 여행을 여러 지도로 나누게 되더라도 기복이 제대로 보이는 쪽을 택했습니다.
- **실제 도로.** 저처럼 이런 걸 중요하게 여긴다면, 도로를 실제 모습 그대로 보는 것만으로 경로가 진짜처럼, 그리고 직접 만져 볼 수 있는 것처럼 느껴질 겁니다.
- **3D 랜드마크.** 여행의 추억이 된(또는 추억이 될) 장소들을 3D로 보면, 지도가 그저 또 하나의 지도 앱이 아니라 정말 쓰고 싶은 것이 됩니다.
- **경로 전체를 한 화면에.** 하루를 처음부터 끝까지 한눈에 봐야 그날이 비로소 머릿속에 그려집니다.
- **함께 움직이는 지형.** 동적인 지형 보기 덕분에 전체를 더 잘 파악할 수 있습니다.
- **끝없는 바다와 수평선.** 지도는 끝없이 이어지는 느낌이지만, 디테일은 실제로 가게 될 곳에 집중됩니다.
- **찾을 수 있는 가장 정확한 데이터 출처.** 선택하기 전에 측정했습니다([DATA_SOURCES.md](../../DATA_SOURCES.md) 참고).
- **공개.** 눈으로 볼 수 있는 무언가로 여행을 계획하고 싶은 사람이 더 있을 거라고 생각했습니다.

열두 가지 결정 전부와 제가 채택하지 않은 대안은 [DECISOES.md](../../DECISOES.md)(포르투갈어)에 있습니다.

---

## 시작하게 된 계기

첫 버전은 2026년 11월 친구 세 명과 함께하는 오아후 여행을 위해 만들었습니다. 섬 전체를 3D로 담고, 모든 해변, 하이킹 코스, 서핑 스폿, 날마다의 경로, 실시간 파도와 날씨, 오늘 날짜로 열리는 모드까지 넣었습니다. 이것을 본 사람들이 코드를 달라고 했습니다. 여행 플래닝 일을 하는 사촌은 이 저장소가 생기기도 전에 압축 파일로 보내 달라고 했습니다. 그래서 어디서든 쓸 수 있게 만들었습니다.

여기 있는 오아후 예시에는 공개된 장소만 남겨 두었습니다. 원래는 개인 여행이었기 때문입니다. 그래도 저희 오아후 일정에 대한 질문은 언제든 환영합니다.

제품을 설계하고 [DECISOES.md](../../DECISOES.md)에 담긴 결정을 내린 것은 저입니다. 코드는 [Claude Code](https://claude.com/claude-code)가 작성했고, 제가 승인하기 전에 모든 데이터 출처를 측정했으며, 서로 전혀 다른 다섯 가지 여행으로 템플릿을 실행해 보았습니다.

**Rodrigo Morais** · [@orodmorais](https://github.com/orodmorais) · [LinkedIn](https://www.linkedin.com/in/rodrigomorais-/)

## 기여하기

이슈와 풀 리퀘스트를 환영합니다. 특히 새로운 3D 랜드마크, 새 프리셋, 사이트 번역, 그리고 템플릿이 아직 다뤄 보지 않은 지역의 여행 예시라면 더욱 반갑습니다. 풀 리퀘스트를 열기 전에 `pytest`를 실행해 주세요.

## 라이선스

코드는 [MIT](../../LICENSE) 라이선스입니다. 생성된 각 사이트에 포함된 지도 데이터는 각 출처의 라이선스를 그대로 따릅니다(위 참고).

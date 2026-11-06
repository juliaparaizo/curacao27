<div align="center">

# trip-map-3d

**旅行の内容をファイル 1 つに書いて push するだけ。世界中どこでも、本物の 3D 地図付きのウェブサイトができあがります。**

[![ライセンス: MIT](https://img.shields.io/badge/license-MIT-2ea44f.svg)](../../LICENSE)
[![ビルドと公開](https://github.com/orodmorais/trip-map-3d/actions/workflows/deploy.yml/badge.svg)](https://github.com/orodmorais/trip-map-3d/actions/workflows/deploy.yml)
![Python 3.12+](https://img.shields.io/badge/python-3.12%2B-3776AB.svg?logo=python&logoColor=white)
![three.js（フレームワークなし）](https://img.shields.io/badge/three.js-no%20framework-000000.svg?logo=threedotjs&logoColor=white)
![オフライン対応](https://img.shields.io/badge/PWA-works%20offline-5A0FC8.svg)
![Claude Code で開発](https://img.shields.io/badge/built%20with-Claude%20Code-D97757.svg)

[English](../../README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Italiano](README.it.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [简体中文](README.zh-CN.md) · **日本語** · [한국어](README.ko.md)

> これは翻訳です。[英語版 README](../../README.md) と内容が異なる場合は、英語版が正しい内容です。生成されるサイト自体は英語、ポルトガル語、スペイン語に対応しています。

![旅行の 1 日を開くと、実際の道路に沿ってルートが自動で描かれていく様子](../../docs/demo.gif)

![同じテンプレートでヨーロッパ、リオ、オアフ、ユタをビルドした様子](../../docs/screenshots/m4-site.jpg)

</div>

旅行の計画を、目で見て確かめられるもので立てたかったんです。平面の地図では、短いドライブも急な登山道も同じに見えます。3D なら、ハイキングを決める前に尾根が見えますし、そのルートが 1 日のうちどれだけの時間を（そしてガソリンをどれだけ）使うのか、実感としてつかめます。

そこで、自分のオアフ島旅行のために作り、それをどんな目的地にも使えるテンプレートにしました。旅行の内容をファイル 1 つに書くと、静的ウェブサイトができあがります。地域ごとに 1 枚の本物の 3D 地図、日ごとのアニメーション付きルート、すべての場所のピンとカード、スマートフォン向けの日別ページ、そして各日の天気が入っています。

> 運用するサーバーは不要で、個人利用なら API キーも要りません（コードなしの方法に必要なのは GitHub アカウントだけです）。YAML ファイルを 1 つ入れると、静的ファイルのフォルダが 1 つ出てきます。旅程を編集するたびに、GitHub Actions がサイトを再ビルドします。

**ライブデモ：** [Europe](https://orodmorais.github.io/trip-map-3d/) · [O'ahu](https://orodmorais.github.io/trip-map-3d/oahu/)（ポルトガル語） · **5 つのサンプル旅行：** [examples/](../../examples/) · **テストレポート：** [docs/TEST_REPORT.md](../../docs/TEST_REPORT.md)

---

## 概要

| | 主な機能 |
|---|---|
| 🗺️ **3D 地図** | 地形、水深、川、道路、建物、植生。すべてオープンデータから作成し、テーマのパレットで彩色します |
| 🧭 **日ごとのルート** | 各日のルートは実際の道路に沿って自動で描かれ、カードを避けて自動的に画面内に収まります |
| 🌍 **長距離の旅行** | 離れた場所は別々の地図になり、全体図でつながります。リスボン、ローマ、アルプスはぼやけた 1 枚の平面ではなく、3 枚の地図になります |
| 📍 **ピンとカード** | すべての場所にピン、カード、写真、ヒント、さらにオプションで 3D ランドマークが付きます |
| 🔎 **検索とフィルター** | 名前または種類で検索できます。アクセント記号は区別しません |
| 📱 **旅程ページ** | 旅行全体を日ごとに表示。スマートフォンで読みやすい作りです |
| ⛅ **天気** | 旅行の各日の予報と、日の出・日の入りの時刻 |
| 📡 **今日モードとオフライン** | 今日の日付で開き、現在地を青い点で表示します。アプリとしてインストールでき、電波がなくても動作します |
| 🌊 **オプションモジュール** | 0〜5 で評価するサーフスポット、潮汐、独自の 3D モデル |
| 🎨 **自由なテーマ設定** | フォント、色、地図のパレット、ピンのアイコン、バッジのスタイル。プリセットを 3 種類同梱 |
| 🗣️ **サイトの言語** | 英語、ポルトガル語、スペイン語。°C または °F、km またはマイルを選べます |

---

## ギャラリー

同じテンプレートで、5 つの異なる旅行。スクリーンショットはすべて [examples/](../../examples/) から実際にビルドしたものです。

| リスボン + ローマ + アルプス、12 日間 | リオデジャネイロ、5 日間 | ユタの国立公園、7 日間 |
|---|---|---|
| ![ヨーロッパ](../../docs/screenshots/europe/desktop-day.jpg) | ![リオ](../../docs/screenshots/rio/desktop-day.jpg) | ![ユタ](../../docs/screenshots/utah/desktop-day.jpg) |
| **オアフ、6 日間** | **トレド、1 日間** | **スマートフォン** |
| ![オアフ](../../docs/screenshots/oahu/desktop-day.jpg) | ![トレド](../../docs/screenshots/day-trip/desktop-day.jpg) | ![スマートフォン](../../docs/screenshots/europe/mobile-day.jpg) |

---

## クイックスタート

自分に合った方法を選んでください。どの方法でも、最終的には同じ `trip.yaml` ができあがります。

| あなたの状況 | 方法 |
|---|---|
| コードは書かない | GitHub で **Use this template** を押し、ブラウザで `trip.yaml` を編集 |
| チャットで Claude を使う | [MASTER_PROMPT.md](../../MASTER_PROMPT.md) を貼り付けて質問に答え、生成されたファイルを貼り付ける |
| Claude Code を使う | [SKILL.md](../../SKILL.md) を指定するだけ。ヒアリング、ビルド、スクリーンショットの確認、公開まで行います |
| 開発者 | clone して `python -m pipeline build trip.yaml` |

### コード不要、GitHub だけで

1. **Use this template**（このテンプレートを使う）をクリックして、リポジトリを作成します。
2. **Settings → Pages** を開き、**Source** を **GitHub Actions** に設定します。手作業が必要なのはこの手順だけです。
3. `trip.yaml` を開いて鉛筆アイコンをクリックし、旅行の内容を書いてコミットします。
4. 数分待ちます。サイトが `https://YOUR-USER.github.io/YOUR-REPOSITORY` で公開されます。

> [!WARNING]
> 無料の GitHub アカウントでは、GitHub Pages は **公開** リポジトリでしか使えません。`trip.yaml` とサイトは、リンクを知っている人なら誰でも見られます。旅程も日付も、すべてです。宿泊先は地区名までにして、番地は絶対に書かないでください。便名、ドアの暗証番号、鍵の保管場所も書かないでください。

---

## 旅行ファイル

必須のフィールドは 3 つだけです。残り（タイムゾーン、地域、座標、ルート）はビルド時に自動で推定され、推定した内容がすべて出力されるので確認できます。

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
> 場所の名前には必ず都市名を添えてください。`"Pantheon"` ではなく `"Pantheon, Roma"` のように書きます。それでも検索で別の場所が選ばれる場合は、何度もやり直すのではなく、`places:` の下で `lat` と `lon` を指定してください。

### 主なフィールド

| フィールド | 必須 | 説明 |
|---|:---:|---|
| `title` | ✅ | サイトの名前 |
| `dates.start` | ✅ | 初日。各日の日付は並び順から決まります |
| `days[].items` | ✅ | その日にやることを順番に。場所は名前だけでも構いません |
| `subtitle` | | タイトルの下に表示する短い 1 行 |
| `language` | | `en`、`pt-BR`、`es` のいずれか |
| `units` | | `temp: C/F`、`distance: km/mi`、`waves: ft/m` |
| `home` | | 宿泊先。ホームのピンになります |
| `places` | | 場所の詳細情報：座標、種類、説明、ヒント、写真、3D モデル、カメラ |
| `regions.max_km` | | 3D 地図 1 枚あたりの最大辺の長さ。この範囲内で、地域が旅行に合わせて調整されます |
| `modules` | | `weather`、`surf`、`tides`、`landmarks` |
| `services` | | 独自のジオコーダーとルーター |
| `downloads` | | 旅程ページからリンクする追加ファイル |

すべてのフィールドとサンプル値：[examples/trip.example.yaml](../../examples/trip.example.yaml)

---

## カスタマイズ

| 項目 | 方法 |
|---|---|
| 色、フォント、地図のパレット | `trip.yaml` と同じ場所に `theme.yaml` を置きます。[サンプル](../../examples/theme.example.yaml)を参照 |
| 既製のテーマ | `preset: oahu`（温かみのある紙の質感）、`minimal`（グレーと 1 色の青）、`dark` |
| 手書き風のタイトル | `@fontsource` にあるラテン文字ファイル付きのフォントを `fonts.display` に指定し、`display_thin` で細くします |
| 種類ごとのピンの色とアイコン | `pins.types: {surf: {color: "#1F7FA6", icon: wave}}` |
| 場所ごとの 3D ランドマーク | `model: bridge`、`lighthouse`、`temple`、`tower`、`waterfall`、`pier`、`islet`、`airport`、`house` または `ridge_stairs` |
| 独自の 3D モデル | `trip.yaml` に `landmarks: landmarks.js`。[オアフのサンプル](../../examples/oahu/landmarks.js)を参照 |
| 場所ごとのカメラ | `camera: {zoom: 7, dir: [0.4, 0.6, 0.7]}` |
| 地図の名前 | `regions: {titles: {Lauterbrunnen: "Swiss Alps"}}` |
| サーフィンと潮汐 | `modules: {surf: true, tides: true}` と `surf_spots: spots.yaml` |
| 道路のない日（船、ハイキング） | その日に `route: line` |
| 独自のサーバー | `services: {geocoder: ..., router: ...}` |
| 雲、海のアニメーション、日ごとの色 | `theme.yaml` の `ui:` |

---

## モジュール

| モジュール | デフォルト | データソース | 備考 |
|---|:---:|---|---|
| 天気 | オン | Open-Meteo の予報 | 16 日先まで。それより先は日の出と日の入りのみ |
| 3D ランドマーク | 自動 | 内蔵キット、または独自の `landmarks.js` | 各場所の `model:` に従って配置 |
| サーフィン | オフ | Open-Meteo marine | うねりの大きさ、周期、風から、各スポットを 0〜5 で評価 |
| 潮汐 | オフ | 米国内は NOAA CO-OPS、それ以外は Open-Meteo marine | 米国の潮汐表はビルド時に保存されるため、オフラインでも使えます。米国外では推定の精度が下がります |

---

## ローカルで実行する

Python 3.12 以降が必要です。

```bash
python -m pip install -r requirements.txt
python -m pipeline check trip.yaml        # すべての場所を検索し、見つかった結果を表示
python -m pipeline build trip.yaml --out dist
python -m http.server --directory dist    # http://localhost:8000 を開く
```

スキルと同じ方法でビルドを目で確認するには：

```bash
python -m pip install -r requirements-dev.txt
python tools/check_site.py dist --shots shots --hashes "" dia-1
```

`check_site.py` はヘッドレスブラウザでサイトを開き、スクリーンショットを保存して、エラーがあれば報告します。`tools/check_trip.py dist --name NAME --shots FOLDER` は、テストレポートにあるリリース前のチェックリストをすべて実行します：ピンが画面に収まっているか、カードの下にルートが隠れていないか、空の背景がないか、検索、天気、今日モード、オフライン。

### 公開

| ホスト | 設定 |
|---|---|
| **GitHub Pages**（デフォルト） | Settings → Pages → Source: GitHub Actions |
| **Cloudflare Pages** | `CLOUDFLARE_PROJECT` 変数と、`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID` シークレットを追加します。ワークフローが自動で切り替わります |
| **その他のホスト** | `dist/` をアップロードするだけです。ただの静的ファイルです |

---

## 仕組み

```
trip.yaml ──▶ 1. Trip ──▶ 2. Regions ──▶ 3. Map ──▶ 4. Site ──▶ dist/
               │            │              │           │
               │            │              │           └─ 静的な three.js、フレームワークなし、オフライン対応
               │            │              └─ 地形 + 土地被覆 + 道路 + 河川、彩色済み
               │            └─ 場所間の最短ネットワーク、最も長いリンクを切断
               └─ 検証、ジオコーディングは 1 回だけ、trip.lock.json にキャッシュ
```

1. **Trip（旅行）。** ファイルを検証し、すべての場所を検索して結果を `trip.lock.json` に保存します。そのため、各名前の検索は一度きりです。
2. **Regions（地域）。** すべての場所をできるだけ短いネットワークで結び、最も長いリンクを切断します。ロードトリップは 1 枚の地図に収まり、1,000 km 離れた 2 つの場所は 2 枚の地図になります。
3. **Map（地図）。** 標高、水深、土地被覆、道路、建物、河川を組み合わせて、高さフィールドと、テーマのパレットで彩色したテクスチャを作ります。
4. **Site（サイト）。** 静的な three.js サイトを書き出します。サービスワーカー付きなので、オフラインでも動き続けます。

### 計測結果

[docs/TEST_REPORT.md](../../docs/TEST_REPORT.md) より：すべての旅行のすべての日を、MacBook Air 上の Chrome で 1440×900 と 390×844 のサイズで開いて計測しました。

| 旅行 | 初回ビルド | サイトのサイズ | JS エラー | fps（デスクトップ / スマートフォンサイズのビューポート） |
|---|---:|---:|---:|---|
| オアフ、6 日間 | 180 s | 3.8 MB | 0 | 30 / 58 |
| リオデジャネイロ、5 日間 | 84 s | 4.8 MB | 0 | 60 / 60 |
| ユタの国立公園、7 日間 | 53 s | 4.8 MB | 0 | 60 / 61 |
| トレド、1 日間 | 34 s | 3.6 MB | 0 | 60 / 60 |
| リスボン + ローマ + アルプス、12 日間 | 72 s | 13.8 MB | 0 | 60 / 60 |

初回ビルドにはすべてのダウンロードが含まれます。キャッシュがある状態では 6〜24 s で終わります。初回ビルドの時間は、最後の修正より前の実行で計測したものです（[テストレポート](../TEST_REPORT.md)に記載）。

> [!NOTE]
> スマートフォンの列は、Mac の GPU 上でスマートフォンサイズのビューポートを使って計測した値で、実機ではありません。実機でのフレームレートはまだ計測していません。24 fps を下回ると、サイトは自動的に軽量な描画に切り替わります。

---

## 構成

```
trip-map-3d/
├── trip.yaml                 # あなたの旅行：編集が必要なのはこのファイルだけ
├── trip.lock.json            # 検索済みのすべての場所。コミットし、絶対に削除しないこと
├── pipeline/                 # Python のビルド：trip → regions → map → site
│   ├── schema.py             #   trip.yaml を検証し、デフォルト値を補完
│   ├── geocode.py            #   Photon で検索し、trip.lock.json にキャッシュ
│   ├── routes.py             #   OSRM による道路ルート。場所と同様にキャッシュ
│   ├── regions.py            #   旅行を複数の地図に分割
│   ├── terrain.py            #   陸は Copernicus GLO-30、海は Terrarium。スパイクを除去
│   ├── vectors.py            #   Overture の道路、河川、滑走路、町、建物
│   ├── scene.py              #   土地被覆から木、ヤシ、建物を配置
│   ├── texture.py            #   テーマのパレットで地図を彩色
│   ├── theme.py              #   プリセット + theme.yaml
│   ├── surf.py · tides.py    #   オプションモジュール
│   ├── site.py               #   dist/ を組み立てる：テンプレート、データ、テーマ、フォント、写真
│   └── __main__.py           #   `python -m pipeline check|build`
├── site/                     # 静的なフロントエンド、フレームワークなし
│   ├── app.js                #   メイン画面：カメラ、ピン、フィルター、URL ルーティング
│   ├── world.js              #   地形、海、植生、建物
│   ├── framing.js            #   その日のルートを、カード横の空きスペースに収める
│   ├── routes3d.js           #   アニメーション付きルート
│   ├── callouts.js           #   ルート横の写真
│   ├── landmarks.js          #   内蔵の 3D ランドマークキット
│   ├── cards.js · search.js  #   カード、検索
│   ├── weather.js · surf.js · tides.js
│   ├── live.js               #   今日モード、青い点、オフラインバナー
│   ├── roteiro.html          #   日ごとの旅程ページ
│   ├── i18n.js               #   en、pt-BR、es。言語の追加：ここにブロックを 1 つ、pipeline/schema.py の LANGUAGES にコードを追加
│   ├── sw.js                 #   サービスワーカー
│   └── vendor/               #   three.js（リポジトリに同梱）
├── presets/                  # oahu · minimal · dark
├── examples/                 # 5 つの完全な旅行例 + 全フィールドの解説
├── tools/                    # check_site.py、check_trip.py：実際のブラウザでチェック
├── tests/                    # 51 個の pytest テスト
├── .github/workflows/        # push でビルドし、Pages または Cloudflare に公開
├── SKILL.md                  # Claude Code 用
├── MASTER_PROMPT.md          # チャットの Claude 用
├── DATA_SOURCES.md           # 全データソースの計測結果、制限、ライセンス
└── DECISOES.md               # 設計上の判断とその理由（ポルトガル語）
```

---

## データソースとライセンス

すべてのデータソースは、採用する前に実際のリクエストで検証しました。計測結果、制限、採用しなかった代替案は [DATA_SOURCES.md](../../DATA_SOURCES.md) にまとめています。

| 用途 | データソース | ライセンス | 使用タイミング |
|---|---|---|---|
| 陸の標高 | Copernicus GLO-30 (AWS open data) | 無料、表示義務あり | ビルド時 |
| 海の水深 | AWS Terrain Tiles (Terrarium) | 帰属表示リスト | ビルド時 |
| 陸と海、土地被覆 | ESA WorldCover 2021 | CC BY 4.0 | ビルド時 |
| 道路、建物、町 | Overture Maps | ODbL ほか | ビルド時 |
| 場所の検索 | Photon (komoot) | ODbL データ | ビルド時、場所ごとに 1 回 |
| 道路ルート | FOSSGIS OSRM | ODbL データ | ビルド時、ルートごとに 1 回 |
| 天気、サーフィン | Open-Meteo | CC BY 4.0、**非商用** | ブラウザ内 |
| 米国の潮汐 | NOAA CO-OPS | パブリックドメイン | ビルド時 |

> [!IMPORTANT]
> **Open-Meteo の無料 API は非商用利用向けです。** 旅行代理店や有料の製品で使う場合は有料キーが必要で、`services.open_meteo_key` に設定します。
>
> **クレジット表記は残してください。** 生成されるサイトにはすべて、これらのライセンスが求める帰属表示が入っています。削除しないでください。
>
> **写真は自分のもの、またはライセンスを得たものに限ります。** テンプレートが写真を自動でダウンロードすることはありません。
>
> **公開の Nominatim は使いません。** その利用ポリシーでは、このようなツールに汎用ジオコーダーとして組み込むことが禁止されています。使いたい場合は、`services.geocoder` で自分のインスタンスを指定してください。

---

## なぜこういう作りなのか

- **3D にしたのは、旅が物理的なものだから。** 起伏を見れば、ドライブや散歩、登山道が実際にどれだけ大変かがわかります。
- **巨大な 1 枚ではなく、地域ごとに 1 枚の地図。** 引きすぎると起伏は平らになってしまいます。旅行をいくつかの地図に分けることになっても、起伏が正しく見えるほうを選びました。
- **実際の道路。** 私と同じようにこだわる人なら、道路を実際のままの姿で見られると、ルートがリアルで、触って確かめられるものに感じられるはずです。
- **3D ランドマーク。** 旅の思い出になった場所（これから思い出になる場所）を 3D で見られると、地図がただの地図アプリではなく、本当に使いたくなるものになります。
- **ルート全体を画面に。** 1 日を最初から最後まで見渡せると、その日の流れがすっと頭に入ります。
- **一緒に動く起伏。** 動的な地形表示のおかげで、全体の感覚がよりつかみやすくなります。
- **果てしない海と水平線。** 地図は無限に続くように感じられますが、細部は実際に行く場所に集中させています。
- **見つけられる限り最も正確なデータソース。** 選ぶ前に計測しました（[DATA_SOURCES.md](../../DATA_SOURCES.md) を参照）。
- **公開。** 目で見て確かめられるもので旅行を計画したい人は、ほかにもきっといると思ったからです。

12 の判断すべてと、採用しなかった代替案は [DECISOES.md](../../DECISOES.md)（ポルトガル語）にまとめています。

---

## 誕生の経緯

最初のバージョンは、2026 年 11 月に友人 3 人と行くオアフ島旅行のために作りました。島全体を 3D で表示し、すべてのビーチ、ハイキングコース、サーフスポット、各日のルート、リアルタイムの波と天気、そして今日の日付で開くモードを入れました。見た人たちからは、コードがほしいと言われました。旅行プランニングの仕事をしているいとこは、このリポジトリができる前から zip でコピーを送ってほしいと頼んできました。そこで、どこでも使えるようにしました。

ここにあるオアフのサンプルには、公開されている場所だけを残しています。元は個人的な旅行だったからです。それでも、私たちのオアフの旅程についての質問はいつでも歓迎です。

プロダクトを設計し、[DECISOES.md](../../DECISOES.md) にある判断を下したのは私です。コードを書いたのは [Claude Code](https://claude.com/claude-code) です。私が承認する前にすべてのデータソースを計測し、まったく異なる 5 つの旅行でテンプレートを動かしてくれました。

**Rodrigo Morais** · [@orodmorais](https://github.com/orodmorais) · [LinkedIn](https://www.linkedin.com/in/rodrigomorais-/)

## コントリビュート

Issue とプルリクエストを歓迎します。特に、新しい 3D ランドマーク、新しいプリセット、サイトの翻訳、そしてテンプレートがまだ扱ったことのない場所の旅行例は大歓迎です。プルリクエストを送る前に `pytest` を実行してください。

## ライセンス

コードは [MIT](../../LICENSE) ライセンスです。生成される各サイトに含まれる地図データは、それぞれのデータソースのライセンスに従います（上記参照）。

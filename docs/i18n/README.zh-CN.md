<div align="center">

# trip-map-3d

**用一个文件描述你的旅行，推送上去，就能得到一个带真实 3D 地图的网站，世界上任何地方都可以。**

[![许可证：MIT](https://img.shields.io/badge/license-MIT-2ea44f.svg)](../../LICENSE)
[![构建并发布](https://github.com/orodmorais/trip-map-3d/actions/workflows/deploy.yml/badge.svg)](https://github.com/orodmorais/trip-map-3d/actions/workflows/deploy.yml)
![Python 3.12+](https://img.shields.io/badge/python-3.12%2B-3776AB.svg?logo=python&logoColor=white)
![three.js](https://img.shields.io/badge/three.js-no%20framework-000000.svg?logo=threedotjs&logoColor=white)
![支持离线使用](https://img.shields.io/badge/PWA-works%20offline-5A0FC8.svg)
![使用 Claude Code 构建](https://img.shields.io/badge/built%20with-Claude%20Code-D97757.svg)

[English](../../README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Italiano](README.it.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · **简体中文** · [日本語](README.ja.md) · [한국어](README.ko.md)

> 本文为译文。如与[英文 README](../../README.md) 有出入，以英文版为准。生成的网站本身提供英语、葡萄牙语和西班牙语版本。

![打开某一天的行程：路线沿着真实道路自动绘制出来](../../docs/demo.gif)

![同一个模板构建出的欧洲、里约、O'ahu 和犹他](../../docs/screenshots/m4-site.jpg)

</div>

我想用一种真正看得见的方式来规划旅行。在平面地图上，一段短短的车程和一条陡峭的山路看起来没什么两样。在 3D 里，你在决定走这条步道之前就能看到山脊，也能真切感受到一条路线会占掉一天里多少时间（还有油箱里多少油）。

所以我先为自己的 O'ahu（瓦胡岛）之旅做了它，然后把它变成了适用于任何目的地的模板。你在一个文件里描述行程，就能得到一个静态网站：每个区域一张真实的 3D 地图，每天一条动画路线，每个地点都有图钉和卡片，一个适合在手机上看的逐日行程页，以及每天的天气。

> 无需运行服务器，个人使用也不需要 API key（无代码方式只需要一个 GitHub 账号）。输入一个 YAML 文件，输出一个装满静态文件的文件夹。每次你修改行程，GitHub Actions 都会重新构建。

**在线演示：** [Europe](https://orodmorais.github.io/trip-map-3d/) · [O'ahu](https://orodmorais.github.io/trip-map-3d/oahu/)（葡萄牙语） · **五个示例行程：** [examples/](../../examples/) · **测试报告：** [docs/TEST_REPORT.md](../../docs/TEST_REPORT.md)

---

## 一览

| | 你能得到什么 |
|---|---|
| 🗺️ **3D 地图** | 地形、海洋深度、河流、道路、建筑和植被，全部来自开放数据，并用你的主题配色绘制 |
| 🧭 **每日路线** | 每天的路线沿真实道路行进，自动绘制，并自动调整视角，避开卡片 |
| 🌍 **长途旅行** | 相距很远的地点会拆成独立的地图，再由一张总览图串起来。里斯本、罗马和阿尔卑斯山是三张地图，而不是一张糊成一片的平面图 |
| 📍 **图钉和卡片** | 每个地点都有图钉、卡片、照片、小贴士，以及可选的 3D 地标 |
| 🔎 **搜索和筛选** | 按名称或类型查找，忽略重音符号 |
| 📱 **行程页** | 整个行程按天排列，专为在手机上阅读而设计 |
| ⛅ **天气** | 行程中每一天的天气预报，外加日出和日落时间 |
| 📡 **今日模式和离线** | 打开时直接定位到今天，用蓝点显示你的位置，可以像 App 一样安装，没有信号也能用 |
| 🌊 **可选模块** | 冲浪点 0 到 5 分评分、潮汐、你自己的 3D 模型 |
| 🎨 **主题完全可定制** | 字体、颜色、地图配色、图钉图标、徽章样式。内置三套预设 |
| 🗣️ **网站语言** | 英语、葡萄牙语和西班牙语，可选 °C 或 °F、km 或英里 |

---

## 效果展示

同一个模板，五次不同的旅行。每张截图都是 [examples/](../../examples/) 中的真实构建结果。

| 里斯本 + 罗马 + 阿尔卑斯山，12 天 | 里约热内卢，5 天 | 犹他州国家公园，7 天 |
|---|---|---|
| ![欧洲](../../docs/screenshots/europe/desktop-day.jpg) | ![里约](../../docs/screenshots/rio/desktop-day.jpg) | ![犹他](../../docs/screenshots/utah/desktop-day.jpg) |
| **O'ahu，6 天** | **托莱多，1 天** | **手机上的效果** |
| ![O'ahu](../../docs/screenshots/oahu/desktop-day.jpg) | ![托莱多](../../docs/screenshots/day-trip/desktop-day.jpg) | ![手机](../../docs/screenshots/europe/mobile-day.jpg) |

---

## 快速开始

选一条适合你的路径。无论哪条，最后都会得到同一个 `trip.yaml`。

| 你是 | 使用方式 |
|---|---|
| 不写代码的人 | 在 GitHub 上点 **Use this template**（使用此模板），在浏览器里编辑 `trip.yaml` |
| 在聊天中使用 Claude | 粘贴 [MASTER_PROMPT.md](../../MASTER_PROMPT.md)，回答问题，再把它生成的文件粘贴进去 |
| 使用 Claude Code | 让它读取 [SKILL.md](../../SKILL.md)：它会向你提问、构建、检查截图并发布 |
| 开发者 | 克隆仓库，运行 `python -m pipeline build trip.yaml` |

### 不写代码，直接在 GitHub 上完成

1. 点击 **Use this template**，创建你的仓库。
2. 进入 **Settings → Pages**，把 **Source** 设为 **GitHub Actions**。这是唯一需要手动完成的步骤。
3. 打开 `trip.yaml`，点击铅笔图标，描述你的行程，然后提交。
4. 等几分钟。你的网站会出现在 `https://YOUR-USER.github.io/YOUR-REPOSITORY`。

> [!WARNING]
> 使用免费 GitHub 账号时，GitHub Pages 只支持**公开**仓库。任何拿到链接的人都能看到你的 `trip.yaml` 和网站：行程、日期，所有内容。只写你住在哪个街区，千万不要写具体街道地址。不要写航班号、门禁密码，也不要写钥匙放在哪里。

---

## 行程文件

只有三个字段是必填的。其余内容（时区、区域、坐标、路线）由构建过程自动推断，并把推断出的所有结果打印出来，方便你检查。

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
> 地名后面一定要加上城市：写 `"Pantheon, Roma"`，而不是 `"Pantheon"`。如果搜索还是找错了地方，不要反复重试，直接在 `places:` 下面给它填上 `lat` 和 `lon`。

### 主要字段

| 字段 | 必填 | 作用 |
|---|:---:|---|
| `title` | ✅ | 网站名称 |
| `dates.start` | ✅ | 第一天。每天的日期由它所在的位置推算出来 |
| `days[].items` | ✅ | 你要做的事，按顺序排列。地点可以只写一个名字 |
| `subtitle` | | 标题下方的一行简短文字 |
| `language` | | `en`、`pt-BR` 或 `es` |
| `units` | | `temp: C/F`、`distance: km/mi`、`waves: ft/m` |
| `home` | | 你住的地方。会显示为住处图钉 |
| `places` | | 地点的完整信息：坐标、类型、描述、小贴士、照片、3D 模型、镜头 |
| `regions.max_km` | | 单张 3D 地图的最大边长。在这个范围内，区域会根据行程自动调整 |
| `modules` | | `weather`、`surf`、`tides`、`landmarks` |
| `services` | | 你自己的地理编码服务和路线规划服务 |
| `downloads` | | 在行程页上提供链接的额外文件 |

所有字段及示例值：[examples/trip.example.yaml](../../examples/trip.example.yaml)。

---

## 自定义

| 内容 | 方法 |
|---|---|
| 颜色、字体、地图配色 | 在 `trip.yaml` 旁边放一个 `theme.yaml`。参见[示例](../../examples/theme.example.yaml) |
| 现成主题 | `preset: oahu`（暖色纸张风格）、`minimal`（灰色加一种蓝色）或 `dark` |
| 手写风格标题 | `@fontsource` 上任意带拉丁字符文件的字体都可以用作 `fonts.display`，再用 `display_thin` 调细 |
| 按类型设置图钉颜色和图标 | `pins.types: {surf: {color: "#1F7FA6", icon: wave}}` |
| 为地点添加 3D 地标 | `model: bridge`、`lighthouse`、`temple`、`tower`、`waterfall`、`pier`、`islet`、`airport`、`house` 或 `ridge_stairs` |
| 你自己的 3D 模型 | 在 `trip.yaml` 中写 `landmarks: landmarks.js`。参见 [O'ahu 示例](../../examples/oahu/landmarks.js) |
| 地点的镜头 | `camera: {zoom: 7, dir: [0.4, 0.6, 0.7]}` |
| 地图名称 | `regions: {titles: {Lauterbrunnen: "Swiss Alps"}}` |
| 冲浪和潮汐 | `modules: {surf: true, tides: true}` 加上 `surf_spots: spots.yaml` |
| 没有道路的一天（坐船、徒步） | 在那一天设置 `route: line` |
| 你自己的服务器 | `services: {geocoder: ..., router: ...}` |
| 云、动态海面、每日配色 | `theme.yaml` 中的 `ui:` |

---

## 模块

| 模块 | 默认 | 数据来源 | 说明 |
|---|:---:|---|---|
| 天气 | 开启 | Open-Meteo 天气预报 | 可预报未来 16 天。更远的日期只显示日出和日落 |
| 3D 地标 | 自动 | 内置套件，或你的 `landmarks.js` | 根据每个地点的 `model:` 放置 |
| 冲浪 | 关闭 | Open-Meteo marine | 根据涌浪高度、周期和风力，给每个冲浪点打 0 到 5 分 |
| 潮汐 | 关闭 | 美国境内用 NOAA CO-OPS，其他地区用 Open-Meteo marine | 美国的潮汐表在构建时保存，所以离线也能用。美国以外的估算会粗略一些 |

---

## 在你的电脑上运行

需要 Python 3.12 或更高版本。

```bash
python -m pip install -r requirements.txt
python -m pipeline check trip.yaml        # 查找每个地点并打印找到的结果
python -m pipeline build trip.yaml --out dist
python -m http.server --directory dist    # 打开 http://localhost:8000
```

像 skill 那样以可视化方式检查构建结果：

```bash
python -m pip install -r requirements-dev.txt
python tools/check_site.py dist --shots shots --hashes "" dia-1
```

`check_site.py` 会在无头浏览器中打开网站，保存截图并报告所有错误。`tools/check_trip.py dist --name NAME --shots FOLDER` 会运行测试报告中的完整发布检查清单：图钉都在画面内、没有路线被卡片遮挡、没有空白背景、搜索、天气、今日模式、离线。

### 发布

| 托管平台 | 设置 |
|---|---|
| **GitHub Pages**（默认） | Settings → Pages → Source: GitHub Actions |
| **Cloudflare Pages** | 添加变量 `CLOUDFLARE_PROJECT`，以及 secrets `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID`。工作流会自动切换 |
| **其他任何地方** | 上传 `dist/`。里面全是普通的静态文件 |

---

## 工作原理

```
trip.yaml ──▶ 1. 行程 ──▶ 2. 区域 ──▶ 3. 地图 ──▶ 4. 网站 ──▶ dist/
               │            │           │            │
               │            │           │            └─ 静态 three.js，无框架，支持离线
               │            │           └─ 地形 + 土地覆盖 + 道路 + 河流，上色
               │            └─ 地点之间的最短网络，切断最长的连接
               └─ 校验，只做一次地理编码，缓存到 trip.lock.json
```

1. **行程**：校验文件，查找每个地点，并把结果存入 `trip.lock.json`，这样每个名字永远只需查询一次。
2. **区域**：用尽可能短的网络把所有地点连起来，然后切断最长的那些连接。一次公路旅行会留在同一张地图上；相距一千公里的两个地点会变成两张地图。
3. **地图**：把高程、海洋深度、土地覆盖、道路、建筑和河流合成为一个高度场，以及一张用主题配色绘制的纹理。
4. **网站**：生成一个静态 three.js 网站，并带有 service worker，让它离线也能继续使用。

### 实测数据

数据来自 [docs/TEST_REPORT.md](../../docs/TEST_REPORT.md)：每个行程的每一天都在 MacBook Air 的 Chrome 中，分别以 1440×900 和 390×844 打开。

| 行程 | 首次构建 | 网站大小 | JS 错误 | fps（桌面 / 手机尺寸视口） |
|---|---:|---:|---:|---|
| O'ahu，6 天 | 180 s | 3.8 MB | 0 | 30 / 58 |
| 里约热内卢，5 天 | 84 s | 4.8 MB | 0 | 60 / 60 |
| 犹他州国家公园，7 天 | 53 s | 4.8 MB | 0 | 60 / 61 |
| 托莱多，1 天 | 34 s | 3.6 MB | 0 | 60 / 60 |
| 里斯本 + 罗马 + 阿尔卑斯山，12 天 | 72 s | 13.8 MB | 0 | 60 / 60 |

首次构建包含所有下载。有缓存时需要 6 到 24 s。首次构建时间来自最后几处修复之前的那一轮测试，详见[测试报告](../TEST_REPORT.md)。

> [!NOTE]
> 手机一栏是在 Mac GPU 上模拟的手机尺寸视口，而不是真实手机。真机帧率尚未测量。帧率低于 24 fps 时，网站会自动切换到更轻量的画面。

---

## 里面有什么

```
trip-map-3d/
├── trip.yaml                 # 你的行程：唯一需要编辑的文件
├── trip.lock.json            # 所有已查询过的地点。请提交它，永远不要删除
├── pipeline/                 # Python 构建：行程 → 区域 → 地图 → 网站
│   ├── schema.py             #   校验 trip.yaml 并填充默认值
│   ├── geocode.py            #   Photon 查询，缓存在 trip.lock.json 中
│   ├── routes.py             #   OSRM 道路路线，和地点一样缓存
│   ├── regions.py            #   把行程拆分成多张地图
│   ├── terrain.py            #   陆地用 Copernicus GLO-30，海上用 Terrarium，已去除尖刺
│   ├── vectors.py            #   Overture 的道路、河流、跑道、城镇、建筑
│   ├── scene.py              #   根据土地覆盖生成树木、棕榈和建筑
│   ├── texture.py            #   用主题配色绘制地图
│   ├── theme.py              #   预设 + theme.yaml
│   ├── surf.py · tides.py    #   可选模块
│   ├── site.py               #   组装 dist/：模板、数据、主题、字体、照片
│   └── __main__.py           #   `python -m pipeline check|build`
├── site/                     # 静态前端，无框架
│   ├── app.js                #   主界面：相机、图钉、筛选、URL 路由
│   ├── world.js              #   地形、海洋、植被、建筑
│   ├── framing.js            #   把当天的路线放进卡片旁边的空白区域
│   ├── routes3d.js           #   动画路线
│   ├── callouts.js           #   路线旁的照片标注
│   ├── landmarks.js          #   内置 3D 地标套件
│   ├── cards.js · search.js  #   卡片、搜索
│   ├── weather.js · surf.js · tides.js
│   ├── live.js               #   今日模式、蓝点、离线提示条
│   ├── roteiro.html          #   逐日行程页
│   ├── i18n.js               #   en、pt-BR、es。新增语言：在这里加一个代码块，并在 pipeline/schema.py 的 LANGUAGES 中加入语言代码
│   ├── sw.js                 #   service worker
│   └── vendor/               #   three.js，随仓库附带
├── presets/                  # oahu · minimal · dark
├── examples/                 # 五个完整行程 + 所有字段的说明
├── tools/                    # check_site.py、check_trip.py：在真实浏览器中检查
├── tests/                    # 51 个 pytest 测试
├── .github/workflows/        # push 时构建，发布到 Pages 或 Cloudflare
├── SKILL.md                  # 供 Claude Code 使用
├── MASTER_PROMPT.md          # 供聊天中的 Claude 使用
├── DATA_SOURCES.md           # 每个数据源的实测结果、限制和许可证
└── DECISOES.md               # 设计决策及其原因（葡萄牙语）
```

---

## 数据来源与许可证

每个数据源在选定之前都用真实请求测试过。测量结果、限制以及被否决的备选方案见 [DATA_SOURCES.md](../../DATA_SOURCES.md)。

| 用途 | 来源 | 许可证 | 使用时机 |
|---|---|---|---|
| 陆地高程 | Copernicus GLO-30（AWS open data） | 免费，需附声明 | 构建时 |
| 海洋深度 | AWS Terrain Tiles (Terrarium) | 署名列表 | 构建时 |
| 陆地、海洋、土地覆盖 | ESA WorldCover 2021 | CC BY 4.0 | 构建时 |
| 道路、建筑、城镇 | Overture Maps | ODbL 等 | 构建时 |
| 地点搜索 | Photon (komoot) | ODbL 数据 | 构建时，每个地点一次 |
| 道路路线 | FOSSGIS OSRM | ODbL 数据 | 构建时，每条路线一次 |
| 天气、冲浪 | Open-Meteo | CC BY 4.0，**非商业** | 在浏览器中 |
| 美国潮汐 | NOAA CO-OPS | 公有领域 | 构建时 |

> [!IMPORTANT]
> **Open-Meteo 的免费 API 仅限非商业用途**。旅行社或任何付费产品都需要付费 key，在 `services.open_meteo_key` 中设置。
>
> **请保留署名**。每个生成的网站都会显示这些许可证要求的署名信息，不要删除它们。
>
> **照片必须是你自己的或已获授权的**。模板永远不会替你下载照片。
>
> **不要使用公共 Nominatim**。它的使用政策禁止像本项目这样的工具把它内置为通用地理编码服务。如果你想用它，请把 `services.geocoder` 指向你自己的实例。

---

## 为什么是这个样子

- **用 3D，因为旅行是实实在在的**。地形起伏会告诉你，一段车程、一次散步或一条步道到底要花多大力气。
- **每个区域一张地图，而不是一张巨大的地图**。缩得足够远，地形起伏就会变平。我宁愿让地形看起来是对的，哪怕这意味着要把行程拆成好几张地图。
- **真实的道路**。如果你和我一样在乎这一点，就会发现，看到道路真实的样子，路线才显得真实，也更有互动感。
- **3D 地标**。用 3D 看到那些让这趟旅行难忘（或即将难忘）的地方，地图才会成为你真正想用的东西，而不只是又一个地图 App。
- **整条路线都在屏幕上**。从头到尾看到一整天，一下子就明白了。
- **跟着你移动的地形**。动态的地形视图能让你更好地把握全局。
- **无边的大海和地平线**。地图看起来无边无际，但细节都集中在你真正会去的地方。
- **我能找到的最准确的数据源**，都在选定前实测过（见 [DATA_SOURCES.md](../../DATA_SOURCES.md)）。
- **公开**。我想，应该会有更多人想用看得见的方式来规划旅行。

全部十二项决策，以及我否决的备选方案：[DECISOES.md](../../DECISOES.md)（葡萄牙语）。

---

## 缘起

第一个版本是我在 2026 年 11 月和三个朋友去 O'ahu 旅行时做的：整座岛的 3D 地图，每一处海滩、徒步路线和冲浪点，每天的路线，实时冲浪和天气信息，还有一个打开就显示当天的模式。看过的人都来问我要代码。我有个我的表亲是做旅行规划的，这个仓库还没建好，她就先找我要了一份压缩包。于是我把它做成了在任何地方都能用的版本。

这里的 O'ahu 示例只保留了公开的地点，因为原版是一次私人旅行。不过，关于我们的 O'ahu 行程，随时欢迎来问我。

产品是我设计的，[DECISOES.md](../../DECISOES.md) 里的决策也是我做的。代码由 [Claude Code](https://claude.com/claude-code) 编写，它还在我批准之前实测了每个数据源，并在五个截然不同的行程上运行了这个模板。

**Rodrigo Morais** · [@orodmorais](https://github.com/orodmorais) · [LinkedIn](https://www.linkedin.com/in/rodrigomorais-/)

## 参与贡献

欢迎提交 issue 和 pull request，尤其是新的 3D 地标、新的预设、网站翻译，以及模板还没覆盖过的地方的示例行程。提交 pull request 之前请先运行 `pytest`。

## 许可证

代码采用 [MIT](../../LICENSE) 许可证。每个生成网站中的地图数据仍遵循各自来源的许可证（见上文）。

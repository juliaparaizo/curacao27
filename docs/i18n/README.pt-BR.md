<div align="center">

# trip-map-3d

**Descreva sua viagem em um arquivo. Faça push. Ganhe um site com um mapa 3D de verdade, em qualquer lugar do mundo.**

[![Licença: MIT](https://img.shields.io/badge/license-MIT-2ea44f.svg)](../../LICENSE)
[![Build e publicação](https://github.com/orodmorais/trip-map-3d/actions/workflows/deploy.yml/badge.svg)](https://github.com/orodmorais/trip-map-3d/actions/workflows/deploy.yml)
![Python 3.12+](https://img.shields.io/badge/python-3.12%2B-3776AB.svg?logo=python&logoColor=white)
![three.js](https://img.shields.io/badge/three.js-no%20framework-000000.svg?logo=threedotjs&logoColor=white)
![Funciona offline](https://img.shields.io/badge/PWA-works%20offline-5A0FC8.svg)
![Feito com Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-D97757.svg)

[English](../../README.md) · **Português** · [Español](README.es.md) · [Italiano](README.it.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md)

> Esta é uma tradução. Se houver diferença em relação ao [README em inglês](../../README.md), vale a versão em inglês. O site gerado está disponível em inglês, português e espanhol.

![Abrindo um dia da viagem: a rota se desenha sozinha por estradas reais](../../docs/demo.gif)

![O mesmo template gerando Europa, Rio, O'ahu e Utah](../../docs/screenshots/m4-site.jpg)

</div>

Eu queria planejar uma viagem com algo que eu conseguisse ver de verdade. Num mapa plano, uma estrada curta e uma trilha íngreme parecem a mesma coisa. Em 3D, você vê o morro antes de encarar a trilha e tem uma noção real de quanto do dia (e do tanque de gasolina) cada trajeto vai gastar.

Então montei isso para a minha viagem a O'ahu e depois transformei num template para qualquer destino. Você descreve a viagem em um arquivo e ganha um site estático: um mapa 3D de verdade por região, uma rota animada para cada dia, pins e cards para cada lugar, uma página dia a dia para o celular e a previsão do tempo de cada dia.

> Nenhum servidor para manter e nenhuma chave de API para uso pessoal (no caminho sem código, basta uma conta no GitHub). Entra um arquivo YAML, sai uma pasta de arquivos estáticos. O GitHub Actions refaz o build toda vez que você edita a viagem.

**Demos ao vivo:** [Europe](https://orodmorais.github.io/trip-map-3d/) · [O'ahu](https://orodmorais.github.io/trip-map-3d/oahu/) (em português) · **Cinco viagens de exemplo:** [examples/](../../examples/) · **Relatório de testes:** [docs/TEST_REPORT.md](../../docs/TEST_REPORT.md)

---

## Visão geral

| | O que você ganha |
|---|---|
| 🗺️ **Mapa 3D** | Relevo, profundidade do mar, rios, estradas, prédios e vegetação, tudo a partir de dados abertos e pintado com a paleta do seu tema |
| 🧭 **Rotas do dia** | A rota de cada dia segue estradas reais, se desenha sozinha e é enquadrada automaticamente para ficar livre do card |
| 🌍 **Viagens longas** | Lugares muito distantes viram mapas separados, ligados por uma visão geral. Lisboa, Roma e os Alpes são três mapas, não um borrão achatado |
| 📍 **Pins e cards** | Cada lugar ganha um pin, um card, uma foto, uma dica e um marco 3D opcional |
| 🔎 **Busca e filtros** | Por nome ou tipo, ignorando acentos |
| 📱 **Página do roteiro** | A viagem inteira, dia a dia, feita para ler no celular |
| ⛅ **Previsão do tempo** | Uma previsão para cada dia da viagem, além do nascer e do pôr do sol |
| 📡 **Modo hoje e offline** | Abre no dia de hoje, mostra onde você está com um ponto azul, instala como app e funciona sem sinal |
| 🌊 **Módulos opcionais** | Picos de surf com nota de 0 a 5, marés, seus próprios modelos 3D |
| 🎨 **Tema personalizável** | Fontes, cores, paleta do mapa, ícones dos pins, estilo dos selos. Três presets incluídos |
| 🗣️ **Idiomas do site** | Inglês, português e espanhol, com °C ou °F e km ou milhas |

---

## Galeria

O mesmo template, cinco viagens diferentes. Cada captura de tela é um build real de [examples/](../../examples/).

| Lisboa + Roma + Alpes, 12 dias | Rio de Janeiro, 5 dias | Parques de Utah, 7 dias |
|---|---|---|
| ![Europa](../../docs/screenshots/europe/desktop-day.jpg) | ![Rio](../../docs/screenshots/rio/desktop-day.jpg) | ![Utah](../../docs/screenshots/utah/desktop-day.jpg) |
| **O'ahu, 6 dias** | **Toledo, 1 dia** | **No celular** |
| ![O'ahu](../../docs/screenshots/oahu/desktop-day.jpg) | ![Toledo](../../docs/screenshots/day-trip/desktop-day.jpg) | ![Celular](../../docs/screenshots/europe/mobile-day.jpg) |

---

## Início rápido

Escolha o caminho que combina com você. Todos terminam no mesmo `trip.yaml`.

| Você | O que usar |
|---|---|
| Não programa | **Use this template** no GitHub e edite o `trip.yaml` no navegador |
| Usa o Claude em um chat | Cole o [MASTER_PROMPT.md](../../MASTER_PROMPT.md), responda às perguntas e cole o arquivo que ele gerar |
| Usa o Claude Code | Aponte para o [SKILL.md](../../SKILL.md): ele entrevista você, faz o build, confere as capturas de tela e publica |
| É desenvolvedor | Clone e rode `python -m pipeline build trip.yaml` |

### Sem código, no GitHub

1. Clique em **Use this template** (usar este template) e crie seu repositório.
2. Vá em **Settings → Pages** e defina **Source** como **GitHub Actions**. Esse é o único passo manual.
3. Abra o `trip.yaml`, clique no lápis, descreva sua viagem e faça o commit.
4. Espere alguns minutos. Seu site aparece em `https://YOUR-USER.github.io/YOUR-REPOSITORY`.

> [!WARNING]
> Em uma conta gratuita do GitHub, o GitHub Pages só funciona com repositórios **públicos**. Seu `trip.yaml` e seu site ficam visíveis para qualquer pessoa com o link: roteiro, datas, tudo. Escreva o bairro onde você vai ficar, nunca o endereço. Deixe de fora números de voo, senhas de porta e o lugar onde ficam as chaves.

---

## O arquivo da viagem

Só três campos são obrigatórios. O build descobre o resto (fuso horário, regiões, coordenadas, rotas) e mostra tudo o que deduziu para você revisar.

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
> Sempre inclua a cidade no nome do lugar: `"Pantheon, Roma"`, e não `"Pantheon"`. Se a busca continuar escolhendo o lugar errado, informe `lat` e `lon` em `places:` em vez de tentar de novo.

### Campos principais

| Campo | Obrigatório | O que faz |
|---|:---:|---|
| `title` | ✅ | Nome do site |
| `dates.start` | ✅ | Primeiro dia. A data de cada dia sai da posição dele |
| `days[].items` | ✅ | O que você faz, em ordem. Um lugar pode ser só um nome |
| `subtitle` | | Uma linha curta abaixo do título |
| `language` | | `en`, `pt-BR` ou `es` |
| `units` | | `temp: C/F`, `distance: km/mi`, `waves: ft/m` |
| `home` | | Onde você dorme. Vira o pin de casa |
| `places` | | Detalhes completos de um lugar: coordenadas, tipo, descrição, dica, foto, modelo 3D, câmera |
| `regions.max_km` | | Maior lado de um mapa 3D. Abaixo desse limite, as regiões se adaptam à viagem |
| `modules` | | `weather`, `surf`, `tides`, `landmarks` |
| `services` | | Seu próprio serviço de geocodificação e de rotas |
| `downloads` | | Arquivos extras com link na página do roteiro |

Todos os campos, com valores de exemplo: [examples/trip.example.yaml](../../examples/trip.example.yaml).

---

## Personalizar

| O quê | Como |
|---|---|
| Cores, fontes, paleta do mapa | `theme.yaml` ao lado do `trip.yaml`. Veja [o exemplo](../../examples/theme.example.yaml) |
| Tema pronto | `preset: oahu` (papel em tom quente), `minimal` (cinzas e um azul) ou `dark` |
| Títulos com cara de escritos à mão | Qualquer fonte do `@fontsource` com arquivos latinos como `fonts.display`, mais fina com `display_thin` |
| Cor e ícone do pin por tipo | `pins.types: {surf: {color: "#1F7FA6", icon: wave}}` |
| Marco 3D para um lugar | `model: bridge`, `lighthouse`, `temple`, `tower`, `waterfall`, `pier`, `islet`, `airport`, `house` ou `ridge_stairs` |
| Seus próprios modelos 3D | `landmarks: landmarks.js` no `trip.yaml`. Veja [o exemplo de O'ahu](../../examples/oahu/landmarks.js) |
| Câmera para um lugar | `camera: {zoom: 7, dir: [0.4, 0.6, 0.7]}` |
| Nome de um mapa | `regions: {titles: {Lauterbrunnen: "Swiss Alps"}}` |
| Surf e marés | `modules: {surf: true, tides: true}` e `surf_spots: spots.yaml` |
| Um dia sem estradas (barco, trilha) | `route: line` nesse dia |
| Seus próprios servidores | `services: {geocoder: ..., router: ...}` |
| Nuvens, mar animado, cores do dia | `ui:` no `theme.yaml` |

---

## Módulos

| Módulo | Padrão | Fonte | Observações |
|---|:---:|---|---|
| Previsão do tempo | ligado | Open-Meteo (previsão) | 16 dias à frente. Depois disso, só nascer e pôr do sol |
| Marcos 3D | auto | Kit embutido ou seu `landmarks.js` | Posicionados pelo `model:` de cada lugar |
| Surf | desligado | Open-Meteo (dados marinhos) | Cada pico recebe uma nota de 0 a 5 com base no tamanho e no período do swell e no vento |
| Marés | desligado | NOAA CO-OPS nos EUA, Open-Meteo (dados marinhos) no resto do mundo | As tábuas dos EUA são salvas no build, então funcionam offline. Fora dos EUA, a estimativa é menos precisa |

---

## Rodar no seu computador

Requer Python 3.12 ou mais recente.

```bash
python -m pip install -r requirements.txt
python -m pipeline check trip.yaml        # encontra cada lugar e mostra o que achou
python -m pipeline build trip.yaml --out dist
python -m http.server --directory dist    # abra http://localhost:8000
```

Para conferir um build visualmente, do jeito que a skill faz:

```bash
python -m pip install -r requirements-dev.txt
python tools/check_site.py dist --shots shots --hashes "" dia-1
```

O `check_site.py` abre o site em um navegador headless, salva capturas de tela e informa qualquer erro. O `tools/check_trip.py dist --name NAME --shots FOLDER` roda o checklist completo de lançamento do relatório de testes: pins cabendo na tela, nenhuma rota embaixo de um card, nenhum fundo vazio, busca, previsão do tempo, modo hoje, offline.

### Publicação

| Hospedagem | Configuração |
|---|---|
| **GitHub Pages** (padrão) | Settings → Pages → Source: GitHub Actions |
| **Cloudflare Pages** | Adicione a variável `CLOUDFLARE_PROJECT` e os secrets `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`. O workflow troca de destino sozinho |
| **Qualquer outro lugar** | Envie a pasta `dist/`. São só arquivos estáticos |

---

## Como funciona

```
trip.yaml ──▶ 1. Viagem ──▶ 2. Regiões ──▶ 3. Mapa ──▶ 4. Site ──▶ dist/
               │             │              │           │
               │             │              │           └─ three.js estático, sem framework, offline
               │             │              └─ relevo + cobertura do solo + estradas + rios, pintados
               │             └─ menor rede entre os lugares, ligações mais longas cortadas
               └─ valida, geocodifica uma vez, guarda em cache no trip.lock.json
```

1. **Viagem.** Valida o arquivo, encontra cada lugar e guarda as respostas no `trip.lock.json`, então cada nome é buscado uma única vez, para sempre.
2. **Regiões.** Liga todos os lugares com a menor rede possível e depois corta as ligações mais longas. Uma viagem de carro fica em um mapa só; dois lugares a mil quilômetros de distância viram dois mapas.
3. **Mapa.** Combina elevação, profundidade do mar, cobertura do solo, estradas, prédios e rios em um campo de alturas e uma textura pintada com a paleta do tema.
4. **Site.** Gera um site estático em three.js, com um service worker para continuar funcionando offline.

### Medições

Do [docs/TEST_REPORT.md](../../docs/TEST_REPORT.md): cada dia de cada viagem foi aberto em 1440×900 e 390×844, no Chrome em um MacBook Air.

| Viagem | Primeiro build | Tamanho do site | Erros de JS | fps (desktop / viewport de celular) |
|---|---:|---:|---:|---|
| O'ahu, 6 dias | 180 s | 3.8 MB | 0 | 30 / 58 |
| Rio de Janeiro, 5 dias | 84 s | 4.8 MB | 0 | 60 / 60 |
| Parques de Utah, 7 dias | 53 s | 4.8 MB | 0 | 60 / 61 |
| Toledo, 1 dia | 34 s | 3.6 MB | 0 | 60 / 60 |
| Lisboa + Roma + Alpes, 12 dias | 72 s | 13.8 MB | 0 | 60 / 60 |

Os primeiros builds incluem todos os downloads. Com o cache já preenchido, levam de 6 a 24 s. Os tempos de primeiro build são da rodada anterior às últimas correções, como diz o [relatório de testes](../TEST_REPORT.md).

> [!NOTE]
> A coluna de celular é uma viewport do tamanho de um celular rodando em uma GPU de Mac, não um celular de verdade. As taxas de quadros em aparelhos reais ainda não foram medidas. Abaixo de 24 fps, o site muda sozinho para uma imagem mais leve.

---

## O que tem dentro

```
trip-map-3d/
├── trip.yaml                 # sua viagem: o único arquivo que você precisa editar
├── trip.lock.json            # todos os lugares já buscados. Faça commit, nunca apague
├── pipeline/                 # build em Python: viagem → regiões → mapa → site
│   ├── schema.py             #   valida o trip.yaml e preenche os valores padrão
│   ├── geocode.py            #   buscas no Photon, em cache no trip.lock.json
│   ├── routes.py             #   rotas por estrada do OSRM, em cache como os lugares
│   ├── regions.py            #   divide a viagem em mapas
│   ├── terrain.py            #   Copernicus GLO-30 em terra, Terrarium no mar, sem picos falsos
│   ├── vectors.py            #   estradas, rios, pistas de pouso, cidades e prédios do Overture
│   ├── scene.py              #   árvores, palmeiras e prédios a partir da cobertura do solo
│   ├── texture.py            #   pinta o mapa com a paleta do tema
│   ├── theme.py              #   presets + theme.yaml
│   ├── surf.py · tides.py    #   módulos opcionais
│   ├── site.py               #   monta o dist/: template, dados, tema, fontes, fotos
│   └── __main__.py           #   `python -m pipeline check|build`
├── site/                     # front end estático, sem framework
│   ├── app.js                #   tela principal: câmera, pins, filtros, rotas de URL
│   ├── world.js              #   relevo, mar, vegetação, prédios
│   ├── framing.js            #   encaixa a rota do dia no espaço livre ao lado do card
│   ├── routes3d.js           #   rotas animadas
│   ├── callouts.js           #   fotos ao lado da rota do dia
│   ├── landmarks.js          #   kit embutido de marcos 3D
│   ├── cards.js · search.js  #   cards, busca
│   ├── weather.js · surf.js · tides.js
│   ├── live.js               #   modo hoje, ponto azul, aviso de offline
│   ├── roteiro.html          #   página do roteiro dia a dia
│   ├── i18n.js               #   en, pt-BR, es. Para adicionar um idioma: um bloco aqui e o código dele em LANGUAGES, em pipeline/schema.py
│   ├── sw.js                 #   service worker
│   └── vendor/               #   three.js, incluído no repositório
├── presets/                  # oahu · minimal · dark
├── examples/                 # cinco viagens completas + todos os campos documentados
├── tools/                    # check_site.py, check_trip.py: verificações em um navegador real
├── tests/                    # 51 testes com pytest
├── .github/workflows/        # build a cada push, publicação no Pages ou no Cloudflare
├── SKILL.md                  # para o Claude Code
├── MASTER_PROMPT.md          # para o Claude em um chat
├── DATA_SOURCES.md           # cada fonte, medida, com limites e licenças
└── DECISOES.md               # decisões de design e seus motivos
```

---

## Fontes de dados e licenças

Cada fonte foi testada com requisições reais antes de ser escolhida. Medições, limites e alternativas descartadas estão no [DATA_SOURCES.md](../../DATA_SOURCES.md).

| Necessidade | Fonte | Licença | Quando |
|---|---|---|---|
| Elevação do terreno | Copernicus GLO-30 (dados abertos da AWS) | Livre, com aviso obrigatório | Build |
| Profundidade do mar | AWS Terrain Tiles (Terrarium) | Lista de atribuições | Build |
| Terra, mar, cobertura do solo | ESA WorldCover 2021 | CC BY 4.0 | Build |
| Estradas, prédios, cidades | Overture Maps | ODbL e outras | Build |
| Busca de lugares | Photon (komoot) | Dados ODbL | Build, uma vez por lugar |
| Rotas por estrada | FOSSGIS OSRM | Dados ODbL | Build, uma vez por rota |
| Previsão do tempo, surf | Open-Meteo | CC BY 4.0, **não comercial** | No navegador |
| Marés dos EUA | NOAA CO-OPS | Domínio público | Build |

> [!IMPORTANT]
> **A API gratuita da Open-Meteo é para uso não comercial.** Uma agência de viagens ou qualquer produto pago precisa de uma chave paga, definida em `services.open_meteo_key`.
>
> **Mantenha os créditos.** Todo site gerado mostra as atribuições que essas licenças exigem. Não as remova.
>
> **As fotos precisam ser suas ou licenciadas.** O template nunca baixa fotos por você.
>
> **Nada de Nominatim público.** A política de uso dele proíbe que seja embutido como geocodificador genérico em ferramentas como esta. Se quiser usá-lo, aponte `services.geocoder` para a sua própria instância.

---

## Por que ele é assim

- **3D, porque viagem é coisa física.** O relevo mostra quanto uma estrada, uma caminhada ou uma trilha vai te custar de verdade.
- **Um mapa por região, não um mapa gigante.** Se você afasta demais, o relevo fica achatado. Preferi um relevo que parece certo, mesmo que isso significasse dividir a viagem em vários mapas.
- **Estradas de verdade.** Para quem se importa com isso como eu, ver as estradas como elas são deixa a rota mais real e interativa.
- **Marcos 3D.** Ver em 3D os lugares que foram ou serão marcantes faz do mapa algo que você realmente tem vontade de usar, em vez de um aplicativo de mapa comum.
- **A rota inteira na tela.** Ver o dia do começo ao fim é o que faz a ficha cair.
- **Relevo que acompanha você.** Uma visão topográfica dinâmica sempre ajuda, porque dá uma noção melhor do todo.
- **Mar e horizonte sem fim.** O mapa parece infinito, mas o detalhe fica onde você vai estar de verdade.
- **As fontes mais precisas que encontrei,** medidas antes de escolher (veja o [DATA_SOURCES.md](../../DATA_SOURCES.md)).
- **Público.** Imaginei que mais gente ia querer planejar a viagem com algo que dá para ver.

Todas as doze decisões, com as alternativas que descartei: [DECISOES.md](../../DECISOES.md).

---

## Origem

Fiz a primeira versão para uma viagem a O'ahu com três amigos, em novembro de 2026: a ilha inteira em 3D, cada praia, trilha e pico de surf, a rota de cada dia, surf e previsão do tempo ao vivo, e um modo que abre no dia de hoje. Quem viu pediu o código. Minha prima, que trabalha com planejamento de viagens, pediu uma cópia zipada antes mesmo de este repositório existir. Então fiz funcionar para qualquer lugar.

O exemplo de O'ahu aqui só tem lugares públicos, porque a viagem original era pessoal. Mesmo assim, estou sempre aberto a perguntas sobre o nosso roteiro de O'ahu.

Eu desenhei o produto e tomei as decisões que estão no [DECISOES.md](../../DECISOES.md). O [Claude Code](https://claude.com/claude-code) escreveu o código, mediu cada fonte de dados antes de eu aprovar e rodou o template em cinco viagens bem diferentes.

**Rodrigo Morais** · [@orodmorais](https://github.com/orodmorais) · [LinkedIn](https://www.linkedin.com/in/rodrigomorais-/)

## Como contribuir

Issues e pull requests são bem-vindos, principalmente novos marcos 3D, novos presets, traduções do site e viagens de exemplo de lugares por onde o template ainda não passou. Rode `pytest` antes de abrir um pull request.

## Licença

O código está sob a licença [MIT](../../LICENSE). Os dados de mapa dentro de cada site gerado continuam sob a licença da respectiva fonte (veja acima).

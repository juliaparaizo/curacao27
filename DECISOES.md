# Decisões do projeto

Registro das decisões grandes do trip-map-3d. O "o quê" e as alternativas são factuais. O **porquê** é sempre escrito pelo Rodrigo, com as palavras dele.

## D1 · Repositório público
- **Decisão:** `orodmorais/trip-map-3d`, público.
- **Alternativa:** privado.
- **Por quê:** Resolvi tornar o projeto público porque achei que mais pessoas se interessariam em planejar as viagens delas com algo visual.

## D2 · Um mapa 3D por região
- **Decisão:** lugares distantes viram mapas separados, ligados por uma visão geral.
- **Alternativa:** um único mapa contínuo com a viagem inteira.
- **Por quê:** Gostei muito da visualização em 3D: ela ajuda bastante quando você pensa no consumo de gasolina do carro, numa caminhada ou numa trilha. Quando o mapa fica grande demais, o relevo achata. Preferi um relevo com mais precisão visual, mesmo que para isso fosse preciso dividir a viagem em mapas diferentes.

## D3 · Material pessoal fora do repo
- **Decisão:** a pasta de referência e os documentos de planejamento ficam só no Mac do dono. O exemplo de O'ahu público sai sem dados pessoais e sem as fotos baixadas da internet.
- **Alternativa:** publicar a referência como estava.
- **Por quê:** Para não expor as minhas informações pessoais, já que o projeto nasceu de uma viagem pessoal. Mas estou sempre aberto a perguntas sobre o nosso roteiro em O'ahu!

## D4 · Fontes de dados
- **Decisão:** Copernicus GLO-30 no relevo, ESA WorldCover para terra e mar, Overture para estradas e prédios, Photon para geocodificação. Medições em [DATA_SOURCES.md](DATA_SOURCES.md).
- **Alternativas:** Terrarium no relevo, polígonos OSM, Overpass e Nominatim.
- **Por quê:** Quis usar as fontes que considerei mais precisas, para chegar a um resultado final melhor.

## D5 · Arquivo de marcos 3D por viagem
- **Decisão:** cada viagem pode trazer um arquivo próprio de modelos 3D, além do kit genérico.
- **Alternativa:** ficar só com o kit genérico.
- **Por quê:** Ver em 3D os lugares que foram ou serão marcantes faz do mapa algo que você realmente tem vontade de usar, em vez de um aplicativo de mapa comum.

## D6 · Rotas por estrada
- **Decisão:** as rotas do dia vêm do OSRM, com endereço configurável e cache no `trip.lock.json`.
- **Alternativa:** curvas entre as paradas, ou pontos manuais em `route_via`.
- **Por quê:** Para quem se importa com isso como eu, ver as estradas como elas são deixa a rota mais real e interativa.

## D7 · Regiões adaptáveis
- **Decisão:** em vez de um raio fixo, o build liga os lugares pela menor rede possível e corta o trecho mais longo enquanto o grupo passar de 400 km (`regions.max_km`) ou for quase todo vazio (trecho de 100 km ou mais, ocupando 60% ou mais do tamanho do grupo).
- **Alternativa:** raio fixo de 150 km, que partia o road trip de Utah ao meio.
- **Por quê:** Para o projeto se adaptar facilmente a diferentes tipos de viagem, relevo e espaço.

## D8 · Dia que cruza regiões
- **Decisão:** o dia vira trechos, um por mapa visitado, na ordem da visita. Ao abrir, mostra a visão geral com o arco entre as regiões e a lista de trechos; clicar num trecho entra no mapa dele. Rota por estrada só existe dentro de um trecho. O mapa principal do dia é o que tem mais paradas; no empate, o primeiro visitado.
- **Alternativa:** abrir direto no mapa principal e esconder o deslocamento.
- **Por quê:** Ver o trajeto como um todo deixa tudo muito mais interessante visualmente.

## D9 · Respostas salvas em arquivo
- **Decisão:** coordenadas, fusos e rotas ficam em `trip.lock.json`, versionado junto com a viagem, para cada nome ser buscado uma vez só.
- **Alternativa:** cache descartável, refazendo as buscas a cada build.
- **Por quê:** Para cada lugar e rota serem buscados uma vez só: as atualizações ficam mais rápidas, o resultado não muda de uma vez para outra e não sobrecarregamos os serviços gratuitos.

## D10 · Visão geral como um mapa comum
- **Decisão:** a visão geral de uma viagem com vários mapas é mais um mapa 3D, com o relevo do trajeto inteiro e arcos entre as regiões.
- **Alternativa:** um mapa-múndi ou mapa 2D simples, como o plano sugeria.
- **Por quê:** Uma visão topográfica dinâmica sempre ajuda, porque dá uma noção melhor do todo.

## D11 · Terreno em volta do mapa
- **Decisão:** mapas sem mar nas bordas ganham uma moldura de baixa resolução com o terreno real ao redor, três vezes maior que o mapa.
- **Alternativa:** cortar o mapa como uma maquete, ou esmaecer as bordas até a cor do fundo.
- **Por quê:** Dá uma sensação de infinito e mantém o foco na área que você realmente vai usar na viagem.

## D12 · Exemplo de O'ahu sem as atividades de risco
- **Decisão:** o exemplo público usa só pontos públicos. A Haiku Stairs aparece como marco na paisagem, sem atividade, e os pulos saíram.
- **Alternativa:** manter o roteiro real, só trocando os nomes.
- **Por quê:** Porque são atividades de risco. O exemplo público não deve incentivar isso, e elas não se aplicam à viagem de todo mundo.

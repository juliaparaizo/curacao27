// Optional tides module: NOAA tables saved at build time in the US, a rougher global model elsewhere.
const WIDTH = 300;
const HEIGHT = 56;
const STEP_MIN = 20;
const MODEL_DAYS = 8;

const minutesOf = time => +time.slice(11, 13) * 60 + +time.slice(14, 16);

// tide height between two table entries: a cosine between high and low water
function curve(events, ymd) {
  const moments = events.map(([time, value]) => ({ at: Date.parse(time.replace(' ', 'T') + ':00Z'), value }));
  const midnight = Date.parse(ymd + 'T00:00:00Z'),
    points = [];
  for (let m = 0; m <= 1440; m += STEP_MIN) {
    const at = midnight + m * 60e3,
      i = moments.findIndex((e, k) => k < moments.length - 1 && at >= e.at && at <= moments[k + 1].at);
    if (i < 0) continue;
    const a = moments[i],
      b = moments[i + 1],
      f = (at - a.at) / (b.at - a.at);
    points.push([m / 60, a.value + ((b.value - a.value) * (1 - Math.cos(Math.PI * f))) / 2]);
  }
  return points;
}
function chart(points) {
  if (!points.length) return '';
  const values = points.map(p => p[1]),
    low = Math.min(...values),
    high = Math.max(...values),
    range = Math.max(high - low, 0.1);
  const x = hour => 8 + (hour / 24) * (WIDTH - 16),
    y = value => HEIGHT - 8 - ((value - low) / range) * (HEIGHT - 16);
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`).join('');
  const grid = [6, 12, 18]
    .map(
      h =>
        `<line x1="${x(h)}" x2="${x(h)}" y1="4" y2="${HEIGHT}" stroke="#DCD7CB" stroke-dasharray="2 3"/><text x="${x(h) + 3}" y="12" font-size="9" fill="#56605A">${h}</text>`,
    )
    .join('');
  return `<svg class="tsvg" viewBox="0 0 ${WIDTH} ${HEIGHT}" aria-hidden="true"><path d="${path}L${x(points.at(-1)[0])},${HEIGHT}L${x(points[0][0])},${HEIGHT}Z" fill="#CFE6F0"/><path d="${path}" fill="none" stroke="#2F86B8" stroke-width="2"/>${grid}</svg>`;
}

export function initTides({ T, esc, onChange }) {
  const TABLE = window.TIDES || { stations: [] };
  const usesTables = TABLE.stations.length > 0;
  const S = { day: T.days[0].date, model: null, status: usesTables ? 'ok' : 'loading' };
  const unit = TABLE.unit || T.units.waves;

  async function loadModel() {
    const centers = T.days.filter(day => day.center);
    const params = new URLSearchParams({
      latitude: centers[0].center[0].toFixed(3),
      longitude: centers[0].center[1].toFixed(3),
      hourly: 'sea_level_height_msl',
      timezone: 'auto',
      forecast_days: MODEL_DAYS,
      cell_selection: 'sea',
    });
    try {
      if (T.apikey) params.set('apikey', T.apikey);
      const host = T.apikey ? 'customer-marine-api.open-meteo.com' : 'marine-api.open-meteo.com';
      const response = await fetch(`https://${host}/v1/marine?${params}`);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      S.model = (await response.json()).hourly;
      S.status = 'ok';
    } catch {
      S.status = 'error';
    }
    onChange();
  }
  function stationBlock(station) {
    const events = station.events.filter(event => event[0].startsWith(S.day));
    if (!events.length) return '';
    const list = events
      .map(
        ([time, value, kind]) =>
          `<span>${esc(t(kind === 'H' ? 'tideHigh' : 'tideLow'))} ${esc(fmtTime(time.slice(11)))} · ${value.toFixed(1)} ${esc(unit)}</span>`,
      )
      .join('');
    return `<div class="tide"><b>${esc(station.name)}</b>${chart(curve(station.events, S.day))}<div class="tev">${list}</div></div>`;
  }
  function modelBlock() {
    if (!S.model) return '';
    const points = S.model.time
      .map((time, i) => (time.startsWith(S.day) ? [minutesOf(time) / 60, S.model.sea_level_height_msl[i]] : null))
      .filter(p => p && p[1] != null);
    if (!points.length) return `<p class="cmsg">${esc(t('tideNone'))}</p>`;
    return `<div class="tide">${chart(points)}</div><p class="cmsg small">${esc(t('tideModel'))}</p>`;
  }
  function html() {
    if (S.status === 'loading') return `<p class="cmsg">${esc(t('wxLoading'))}</p>`;
    if (S.status === 'error') return `<div class="cmsg err"><b>${esc(t('wxError'))}</b></div>`;
    const days = T.days
      .map(
        day =>
          `<button type="button" class="chip-t${S.day === day.date ? ' on' : ''}" data-tide="${day.date}">${esc(t('day', { n: day.n }))}<small>${esc(fmtDate(day.date))}</small></button>`,
      )
      .join('');
    const body = usesTables
      ? `<div class="tides">${TABLE.stations.map(stationBlock).join('') || `<p class="cmsg">${esc(t('tideNone'))}</p>`}</div>`
      : modelBlock();
    return `<div class="tpick">${days}</div>${body}`;
  }
  function bindPanel(element, render) {
    element.querySelectorAll('[data-tide]').forEach(button => {
      button.onclick = () => {
        S.day = button.dataset.tide;
        render();
      };
    });
  }
  if (!usesTables) loadModel();
  return { id: 'tides', label: t('tidesTab'), html, bindPanel, reload: () => (usesTables ? null : loadModel()) };
}

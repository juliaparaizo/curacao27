// Weather for each day of the trip, from Open-Meteo, with the last forecast kept for offline use.
const WINDOW_DAYS = 15;
const REFRESH_MS = 60 * 60e3;
const DAILY =
  'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant,uv_index_max,sunrise,sunset';
const SKY = {
  sun: '<circle cx="12" cy="12" r="4.2" fill="#F2B632"/><g stroke="#F2B632" stroke-width="2" stroke-linecap="round"><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M5.3 18.7L7 17M17 7l1.7-1.7"/></g>',
  part: '<circle cx="9" cy="9" r="3.6" fill="#F2B632"/><path d="M8 19h9.5a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1.3A2.9 2.9 0 0 0 8 19z" fill="#C9D3DA" stroke="#7E8C96" stroke-width="1.2"/>',
  cloud:
    '<path d="M6.5 18.5h11a4 4 0 0 0 .4-8 5.6 5.6 0 0 0-10.8 1.6 3.3 3.3 0 0 0-.6 6.4z" fill="#C9D3DA" stroke="#7E8C96" stroke-width="1.2"/>',
  rain: '<path d="M6.5 15h11a4 4 0 0 0 .4-8 5.6 5.6 0 0 0-10.8 1.6A3.3 3.3 0 0 0 6.5 15z" fill="#B9C5CE" stroke="#6E7D88" stroke-width="1.2"/><g stroke="#2F86B8" stroke-width="2" stroke-linecap="round"><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/></g>',
  storm:
    '<path d="M6.5 14h11a4 4 0 0 0 .4-8 5.6 5.6 0 0 0-10.8 1.6A3.3 3.3 0 0 0 6.5 14z" fill="#9EABB5" stroke="#5E6B75" stroke-width="1.2"/><path d="M12 15l-2.5 4h2.5l-1.5 4 4-5.5h-2.6l1.6-2.5z" fill="#F2B632"/>',
};
const skyIcon = kind => `<svg class="wxi" viewBox="0 0 24 24" aria-hidden="true">${SKY[kind] || SKY.cloud}</svg>`;
function describe(code) {
  if (code === 0) return ['clear', 'sun'];
  if (code <= 2) return ['partly', 'part'];
  if (code === 3) return ['cloudy', 'cloud'];
  if (code <= 48) return ['fog', 'cloud'];
  if (code <= 57) return ['drizzle', 'rain'];
  if (code <= 67) return ['rain', 'rain'];
  if (code <= 77) return ['snow', 'cloud'];
  if (code <= 82) return ['showers', 'rain'];
  return ['storm', 'storm'];
}
const addDays = (ymd, k) => {
  const d = new Date(ymd + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + k);
  return d.toISOString().slice(0, 10);
};

// sunrise and sunset for dates still outside the forecast (NOAA solar equations)
export function sunTimes(ymd, lat, lon, timezone) {
  const date = new Date(ymd + 'T12:00:00Z'),
    n = Math.floor((date - Date.UTC(date.getUTCFullYear(), 0, 0)) / 864e5),
    g = ((2 * Math.PI) / 365) * (n - 1);
  const equation =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(g) -
      0.032077 * Math.sin(g) -
      0.014615 * Math.cos(2 * g) -
      0.040849 * Math.sin(2 * g));
  const declination =
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g);
  const r = Math.PI / 180,
    hourAngle =
      Math.acos(
        Math.cos(90.833 * r) / (Math.cos(lat * r) * Math.cos(declination)) - Math.tan(lat * r) * Math.tan(declination),
      ) / r;
  const clock = minutes => {
    const instant = new Date(Date.parse(ymd + 'T00:00:00Z') + minutes * 60e3);
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(instant);
  };
  return { rise: clock(720 - 4 * (lon + hourAngle) - equation), set: clock(720 - 4 * (lon - hourAngle) - equation) };
}

export function initWeather(ctx) {
  const { T, esc, $, bindGo, onOpen, isDayOpen } = ctx;
  const enabled = T.modules.weather;
  const extras = [];
  let tab = enabled ? 'weather' : null;
  const button = $('#condBtn'),
    panel = $('#cond'),
    body = $('#condBody');
  const key = `${T.title}-forecast-v1`,
    days = T.days.filter(day => day.center);
  const S = { status: 'loading', zones: null, at: null, stale: false };

  async function load(force) {
    if (!enabled || !days.length) return;
    if (!force) {
      try {
        const saved = JSON.parse(localStorage.getItem(key) || 'null');
        if (saved && Date.now() - saved.at < REFRESH_MS) {
          Object.assign(S, saved, { status: 'ok' });
          update();
          return;
        }
      } catch {
        localStorage.removeItem(key);
      }
    }
    S.status = 'loading';
    update();
    try {
      const params = new URLSearchParams({
        latitude: days.map(d => d.center[0].toFixed(3)).join(','),
        longitude: days.map(d => d.center[1].toFixed(3)).join(','),
        daily: DAILY,
        timezone: 'auto',
        forecast_days: 16,
      });
      if (T.apikey) params.set('apikey', T.apikey);
      const host = T.apikey ? 'customer-api.open-meteo.com' : 'api.open-meteo.com';
      const response = await fetch(`https://${host}/v1/forecast?${params}`);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      Object.assign(S, { zones: Array.isArray(data) ? data : [data], at: Date.now(), status: 'ok', stale: false });
      try {
        localStorage.setItem(key, JSON.stringify({ zones: S.zones, at: S.at }));
      } catch {
        /* storage full: the forecast still shows */
      }
    } catch {
      let saved = null;
      try {
        saved = JSON.parse(localStorage.getItem(key) || 'null');
      } catch {
        saved = null;
      }
      if (saved?.zones) Object.assign(S, saved, { status: 'ok', stale: true });
      else S.status = 'error';
    }
    update();
  }
  function forecast(day) {
    const zone = S.zones?.[days.indexOf(day)];
    if (!zone) return null;
    const i = zone.daily.time.indexOf(day.date);
    if (i < 0) return null;
    const D = zone.daily;
    return {
      code: D.weather_code[i],
      max: D.temperature_2m_max[i],
      min: D.temperature_2m_min[i],
      rain: D.precipitation_probability_max[i],
      wind: D.wind_speed_10m_max[i],
      from: D.wind_direction_10m_dominant[i],
      uv: D.uv_index_max[i],
      rise: D.sunrise[i]?.slice(11),
      set: D.sunset[i]?.slice(11),
    };
  }
  function dayHTML(n) {
    const day = T.days[n - 1];
    const more = extras.map(extra => extra.dayHTML?.(n) || '').join('');
    if (!enabled || !day.center) return more;
    const data = S.status === 'ok' ? forecast(day) : null;
    if (data) {
      const [label, sky] = describe(data.code);
      return `<div class="dwx">${skyIcon(sky)}<div><b>${esc(t(label))} · ${fmtTemp(data.max)}/${fmtTemp(data.min)}${fmtTempUnit().slice(1)}</b><small>${esc(day.area)} · ${esc(t('wxRow', { p: Math.round(data.rain ?? 0), w: `${fmtSpeed(data.wind)} ${fmtCompass(data.from)}`, u: Math.round(data.uv ?? 0), a: fmtTime(data.rise), b: fmtTime(data.set) }))}</small></div></div>${more}`;
    }
    const sun = sunTimes(day.date, day.center[0], day.center[1], day.tz);
    return `<div class="dwx">${skyIcon('part')}<div><b>${esc(t('wxFrom', { d: fmtDate(addDays(day.date, -WINDOW_DAYS)) }))}</b><small>${esc(day.area)} · ${esc(t('sunriseSunset', { a: fmtTime(sun.rise), b: fmtTime(sun.set) }))}</small></div></div>${more}`;
  }
  function list() {
    if (S.status === 'loading') return `<p class="cmsg">${esc(t('wxLoading'))}</p>`;
    if (S.status === 'error')
      return `<div class="cmsg err"><b>${esc(t('wxError'))}</b> <button type="button" class="btn" id="condRetry">${esc(t('retry'))}</button></div>`;
    const rows = days
      .map(day => {
        const data = forecast(day),
          go = `data-go="dia-${day.n}"`;
        if (!data) {
          const sun = sunTimes(day.date, day.center[0], day.center[1], day.tz);
          return `<li>${skyIcon('part')}<span class="nm"><button type="button" class="lnk" ${go}><b>${esc(t('day', { n: day.n }))} · ${esc(fmtDate(day.date))}</b></button><small>${esc(t('wxFrom', { d: fmtDate(addDays(day.date, -WINDOW_DAYS)) }))} · ${esc(t('sunriseSunset', { a: fmtTime(sun.rise), b: fmtTime(sun.set) }))}</small></span></li>`;
        }
        const [label, sky] = describe(data.code);
        return `<li>${skyIcon(sky)}<span class="nm"><button type="button" class="lnk" ${go}><b>${esc(t('day', { n: day.n }))} · ${esc(fmtDate(day.date))}</b></button><small>${esc(t(label))} · ${esc(day.area)}</small></span>
        <span class="tt"><b>${fmtTemp(data.max)}</b>/${fmtTemp(data.min)}${fmtTempUnit().slice(1)}</span>
        <span class="mt"><span>☂ ${Math.round(data.rain ?? 0)}%</span><span>${esc(fmtSpeed(data.wind))} ${fmtCompass(data.from)}</span><span>UV ${Math.round(data.uv ?? 0)}</span><span>☀ ${esc(fmtTime(data.rise))} · ${esc(fmtTime(data.set))}</span></span></li>`;
      })
      .join('');
    return `<p class="csub">${esc(t('wxByDay'))}</p><ul class="wlist">${rows}</ul>`;
  }
  function render() {
    if (panel.hidden) return;
    const tabs = [...(enabled ? [{ id: 'weather', label: t('weather') }] : []), ...extras];
    const active = extras.find(extra => extra.id === tab);
    const header =
      tabs.length > 1
        ? `<div class="ctabs" role="tablist">${tabs.map(item => `<button type="button" role="tab" data-tab="${item.id}" aria-selected="${item.id === tab}">${esc(item.label)}</button>`).join('')}</div>`
        : '';
    const time = S.at
      ? new Intl.DateTimeFormat(T.language, { dateStyle: 'short', timeStyle: 'short' }).format(S.at)
      : '';
    const note = S.at ? ` ${esc(t(S.stale ? 'saved' : 'updated', { t: time }))}` : '';
    body.innerHTML = `${header}<div class="cpane">${active ? active.html() : list()}</div><p class="cfoot"><a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a> (CC BY 4.0).${note}</p>`;
    bindGo(body);
    body.querySelectorAll('[data-tab]').forEach(button => {
      button.onclick = () => {
        tab = button.dataset.tab;
        render();
      };
    });
    active?.bindPanel?.(body, render);
    const retry = $('#condRetry');
    if (retry) retry.onclick = () => load(true);
  }
  function update() {
    render();
    const box = $('#cdy');
    if (box && isDayOpen()) {
      box.innerHTML = dayHTML(isDayOpen());
      bindGo(box);
    }
  }
  function open() {
    onOpen?.();
    panel.hidden = false;
    document.body.classList.add('cond-open');
    button.setAttribute('aria-expanded', 'true');
    render();
  }
  function close() {
    panel.hidden = true;
    document.body.classList.remove('cond-open');
    button.setAttribute('aria-expanded', 'false');
  }
  button.onclick = () => (panel.hidden ? open() : close());
  $('#condX').onclick = close;
  setTimeout(() => load(false), 0);
  setInterval(() => {
    if (document.visibilityState === 'visible') load(true);
  }, REFRESH_MS);
  const addExtra = extra => {
    extras.push(extra);
    tab = tab || extra.id;
    button.hidden = false;
  };
  button.hidden = !enabled;
  return {
    reload: () => {
      load(true);
      extras.forEach(extra => extra.reload?.());
    },
    addExtra,
    update,
    dayHTML,
    close,
    isOpen: () => !panel.hidden,
  };
}

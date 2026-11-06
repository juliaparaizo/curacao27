// Optional surf module: rates each spot from the swell and wind forecast. Sizes are estimates:
// the model gives swell in open water, not the wave on the reef.
import { nowIn } from './live.js';

const MARINE =
  'swell_wave_height,swell_wave_direction,swell_wave_period,secondary_swell_wave_height,secondary_swell_wave_direction,secondary_swell_wave_period,wind_wave_height,wind_wave_direction,wind_wave_period,sea_surface_temperature';
const WIND = 'wind_speed_10m,wind_direction_10m,wind_gusts_10m';
const MARINE_DAYS = 8;
const WIND_DAYS = 16;
const OFFSHORE_KM = 9;
const CACHE_MS = 60 * 60e3;
const CHECK_HOURS = [6, 9, 12, 15, 18];
const MORNING = 7;
const COLORS = ['#9AA3A0', '#9AA3A0', '#E0B13A', '#7FB24E', '#3E9A4A', '#1F7A3E'];

const angleBetween = (a, b) => Math.abs(((((a - b) % 360) + 540) % 360) - 180);
const addDays = (ymd, k) => new Date(Date.parse(ymd + 'T12:00:00Z') + k * 864e5).toISOString().slice(0, 10);
const dateOf = time => time.slice(0, 10);
const hourOf = time => +time.slice(11, 13);

// sp: spot; swells: [{h meters, d degrees it comes from, p seconds}]; wind: {s km/h, d degrees}
export function rateSpot(sp, swells, wind) {
  let energy = 0,
    best = null;
  for (const swell of swells) {
    if (swell.h == null || swell.d == null || swell.p == null) continue;
    const off = angleBetween(swell.d, sp.facing),
      window = sp.win || 50;
    const exposure = off <= window ? 1 : off >= window + 35 ? 0 : 1 - (off - window) / 35;
    const face = swell.h * 3.281 * Math.min(1.75, Math.max(0.75, 0.45 + 0.075 * swell.p)) * exposure * (sp.gain || 1);
    energy += face * face;
    if (!best || face > best.f) best = { ...swell, f: face, expo: exposure };
  }
  if (!best) return null;
  const face = Math.sqrt(energy),
    low = sp.min,
    high = sp.max,
    u = (face - low) / Math.max(1, high - low);
  // best score in the middle of the range where the spot works, falling at both ends
  let size,
    sizeLabel = '';
  if (face < Math.max(1.5, low * 0.6)) {
    size = 0;
    sizeLabel = 'flat';
  } else if (face < low) {
    size = 0.15 + (0.3 * (face - low * 0.6)) / (low * 0.4);
    sizeLabel = 'small';
  } else if (u < 0.25) size = 0.6 + (0.4 * u) / 0.25;
  else if (u <= 0.7) size = 1;
  else if (u <= 1) size = 1 - (0.35 * (u - 0.7)) / 0.3;
  else if (face <= high * 1.4) {
    size = 0.25;
    sizeLabel = 'tooBig';
  } else {
    size = 0.05;
    sizeLabel = 'dangerous';
  }
  // a light offshore wind is ideal; a strong onshore wind ruins the wave
  let windScore = 0.6,
    windLabel = '';
  if (wind?.s != null) {
    const speed = wind.s,
      relative = angleBetween(wind.d, (sp.facing + 180) % 360);
    if (speed < 6) {
      windScore = 1;
      windLabel = 'noWind';
    } else if (relative < 45) {
      windScore = speed < 25 ? 1 : speed < 40 ? 0.8 : 0.6;
      windLabel = 'offshore';
    } else if (relative < 85) {
      windScore = Math.max(0.45, 0.9 - Math.max(0, speed - 10) * 0.012);
      windLabel = 'sideOffshore';
    } else if (relative < 120) {
      windScore = speed < 12 ? 0.7 : Math.max(0.3, 0.7 - (speed - 12) * 0.02);
      windLabel = 'crossShore';
    } else {
      windScore = speed < 10 ? 0.6 : speed < 20 ? 0.4 : 0.2;
      windLabel = 'onshore';
    }
  }
  // long swell organizes the wave; short wind chop stays messy
  const period = best.p,
    periodScore = period >= 14 ? 1 : period >= 12 ? 0.9 : period >= 10 ? 0.78 : period >= 8 ? 0.62 : 0.45;
  const score = size * windScore * periodScore;
  const stars = score >= 0.85 ? 5 : score >= 0.68 ? 4 : score >= 0.5 ? 3 : score >= 0.32 ? 2 : score >= 0.15 ? 1 : 0;
  let label = sizeLabel || ['poor', 'poor', 'fair', 'good', 'veryGood', 'classic'][stars];
  if (!sizeLabel && stars <= 2) {
    if (windScore <= 0.45) label = 'windy';
    else if (periodScore <= 0.62) label = 'choppy';
  }
  const lo = Math.max(0, Math.round(face * 0.8));
  return { face, lo, hi: Math.max(lo + 1, Math.round(face * 1.2)), stars, label, score, best, windRel: windLabel };
}

function offshorePoint(sp) {
  const degrees = (sp.off || OFFSHORE_KM) / 111,
    angle = (sp.facing * Math.PI) / 180;
  return [
    sp.lat + degrees * Math.cos(angle),
    sp.lon + (degrees * Math.sin(angle)) / Math.cos((sp.lat * Math.PI) / 180),
  ];
}
const coords = list =>
  `latitude=${list.map(p => p[0].toFixed(4)).join(',')}&longitude=${list.map(p => p[1].toFixed(4)).join(',')}`;
const asList = data => (Array.isArray(data) ? data : [data]);
async function getJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('HTTP ' + response.status);
  return response.json();
}

export function initSurf({ T, go, esc, bindGo, onChange }) {
  const spots = T.places.filter(p => p.spot);
  const timezone = T.days[0].tz,
    cacheKey = `${T.title}-surf-v1`;
  const S = { time: 'now', status: 'loading', marine: null, wind: null, at: null };
  const nowHour = () => nowIn(timezone).slice(0, 13) + ':00';
  const selected = () => (S.time === 'now' ? nowHour() : S.time);
  const marineUntil = () => addDays(dateOf(nowHour()), MARINE_DAYS - 1);

  async function load(force) {
    if (!force) {
      try {
        const saved = JSON.parse(localStorage.getItem(cacheKey) || 'null');
        if (saved && Date.now() - saved.at < CACHE_MS) {
          Object.assign(S, saved, { status: 'ok' });
          onChange();
          return;
        }
      } catch {
        localStorage.removeItem(cacheKey);
      }
    }
    S.status = 'loading';
    onChange();
    try {
      const zone = encodeURIComponent(timezone);
      const marineHost = T.apikey ? 'customer-marine-api.open-meteo.com' : 'marine-api.open-meteo.com';
      const forecastHost = T.apikey ? 'customer-api.open-meteo.com' : 'api.open-meteo.com';
      const key = T.apikey ? `&apikey=${encodeURIComponent(T.apikey)}` : '';
      const [marine, wind] = await Promise.all([
        getJSON(
          `https://${marineHost}/v1/marine?${coords(spots.map(p => offshorePoint(p.spot)))}&hourly=${MARINE}&timezone=${zone}&forecast_days=${MARINE_DAYS}&cell_selection=sea${key}`,
        ),
        getJSON(
          `https://${forecastHost}/v1/forecast?${coords(spots.map(p => [p.spot.lat, p.spot.lon]))}&hourly=${WIND}&timezone=${zone}&forecast_days=${WIND_DAYS}${key}`,
        ),
      ]);
      Object.assign(S, { marine: asList(marine), wind: asList(wind), at: Date.now(), status: 'ok' });
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ marine: S.marine, wind: S.wind, at: S.at }));
      } catch {
        /* storage full */
      }
    } catch {
      let saved = null;
      try {
        saved = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      } catch {
        saved = null;
      }
      if (saved?.marine) Object.assign(S, saved, { status: 'ok' });
      else S.status = 'error';
    }
    onChange();
  }
  function ratingAt(place, time) {
    if (S.status !== 'ok' || !S.marine) return null;
    const k = spots.indexOf(place),
      M = S.marine[k],
      W = S.wind?.[k];
    if (!M) return null;
    const i = M.hourly.time.indexOf(time);
    if (i < 0) return null;
    const H = M.hourly;
    const swells = [
      { h: H.swell_wave_height[i], d: H.swell_wave_direction[i], p: H.swell_wave_period[i] },
      {
        h: H.secondary_swell_wave_height?.[i],
        d: H.secondary_swell_wave_direction?.[i],
        p: H.secondary_swell_wave_period?.[i],
      },
      { h: H.wind_wave_height?.[i], d: H.wind_wave_direction?.[i], p: H.wind_wave_period?.[i] },
    ];
    const j = W ? W.hourly.time.indexOf(time) : -1;
    const wind =
      j >= 0
        ? { s: W.hourly.wind_speed_10m[j], d: W.hourly.wind_direction_10m[j], g: W.hourly.wind_gusts_10m[j] }
        : null;
    const rating = rateSpot(place.spot, swells, wind);
    return rating && { ...rating, wind, water: H.sea_surface_temperature?.[i] };
  }
  const score = rating => `<span class="sc" style="background:${COLORS[rating.stars]}">${rating.stars}</span>`;
  const sizeText = rating => fmtWaves(rating.lo, rating.hi);

  function decoratePins(pinEls) {
    const time = selected();
    for (const place of spots) {
      const pin = pinEls[place.id];
      if (!pin) continue;
      const rating = ratingAt(place, time);
      let badge = pin.querySelector('.rate');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'rate';
        pin.appendChild(badge);
      }
      badge.hidden = !rating;
      pin.querySelector('.ic').style.boxShadow = rating ? `0 0 0 3px ${COLORS[rating.stars]}` : '';
      if (rating) {
        badge.textContent = sizeText(rating);
        badge.style.background = COLORS[rating.stars];
      }
    }
  }
  function chips() {
    const current = S.time === 'now' ? 'now' : dateOf(S.time),
      limit = marineUntil();
    const days = T.days
      .map(
        day =>
          `<button type="button" class="chip-t${current === day.date ? ' on' : ''}" data-day="${day.date}" ${day.date <= limit ? '' : 'disabled'}>${esc(t('day', { n: day.n }))}<small>${esc(fmtDate(day.date))}</small></button>`,
      )
      .join('');
    const hours = CHECK_HOURS.map(
      h =>
        `<button type="button" class="chip-h${S.time !== 'now' && hourOf(S.time) === h ? ' on' : ''}" data-h="${h}" ${S.time === 'now' ? 'disabled' : ''}>${esc(fmtTime(String(h).padStart(2, '0') + ':00'))}</button>`,
    ).join('');
    return `<div class="tpick"><button type="button" class="chip-t${S.time === 'now' ? ' on' : ''}" data-day="now">${esc(t('now'))}<small>${esc(fmtDate(dateOf(nowHour())))}</small></button>${days}</div><div class="hpick">${hours}</div>`;
  }
  function html() {
    if (S.status === 'loading') return `<p class="cmsg">${esc(t('wxLoading'))}</p>`;
    if (S.status === 'error') return `<div class="cmsg err"><b>${esc(t('wxError'))}</b></div>`;
    const time = selected();
    if (dateOf(time) > marineUntil())
      return `${chips()}<p class="cmsg">${esc(t('surfWindow', { d: fmtDate(addDays(dateOf(time), 1 - MARINE_DAYS)) }))}</p>`;
    const rows = spots
      .map(place => ({ place, rating: ratingAt(place, time) }))
      .filter(row => row.rating)
      .sort((a, b) => b.rating.score - a.rating.score || b.rating.face - a.rating.face);
    return `${chips()}<p class="csub">${esc(t('surfScale'))}</p><ol class="clist">${rows.map(({ place, rating }) => `<li><button type="button" data-go="lugar-${place.id}">${score(rating)}<span class="nm"><b>${esc(place.name)}</b><small>${esc(t('surf_' + rating.label))} · ${Math.round(rating.best.p)}s ${fmtCompass(rating.best.d)}${rating.wind ? ` · ${esc(fmtSpeed(rating.wind.s))}` : ''}</small></span><span class="sz">${esc(sizeText(rating))}</span></button></li>`).join('')}</ol><p class="cmsg small">${esc(t('surfNote'))}</p>`;
  }
  function bindPanel(element, render) {
    element.querySelectorAll('[data-day]').forEach(button => {
      button.onclick = () => {
        const day = button.dataset.day;
        S.time =
          day === 'now' ? 'now' : `${day}T${String(S.time === 'now' ? MORNING : hourOf(S.time)).padStart(2, '0')}:00`;
        onChange();
        render();
      };
    });
    element.querySelectorAll('[data-h]').forEach(button => {
      button.onclick = () => {
        if (S.time === 'now') return;
        S.time = `${dateOf(S.time)}T${String(button.dataset.h).padStart(2, '0')}:00`;
        onChange();
        render();
      };
    });
  }
  function placeHTML(place) {
    if (!place.spot) return '';
    const spot = place.spot;
    const row = (label, value) => (value ? `<li><span>${esc(t(label))}</span>${esc(value)}</li>` : '');
    const facts = `<ul class="sfacts">${row('surfWave', spot.wave_txt)}${row('surfSwell', spot.best_swell)}${row('surfGoodWind', spot.best_wind)}${row('surfTide', spot.best_tide)}${row('surfLevel', spot.level_txt)}${row('surfHazards', spot.hazards)}</ul>`;
    const rating = ratingAt(place, selected());
    const live = rating
      ? `<div class="live"><span class="sc big" style="background:${COLORS[rating.stars]}">${rating.stars}</span><div><b>${esc(sizeText(rating))} · ${esc(t('surf_' + rating.label))}</b><small>${Math.round(rating.best.p)}s ${fmtCompass(rating.best.d)}${rating.wind ? ` · ${esc(fmtSpeed(rating.wind.s))}` : ''}${rating.water ? ` · ${fmtTemp(rating.water)}` : ''}</small></div></div>`
      : '';
    return `<div class="spotbox">${live}${facts}</div>`;
  }
  function dayHTML(n) {
    const day = T.days[n - 1];
    if (S.status !== 'ok' || day.date > marineUntil()) return '';
    const time = `${day.date}T${String(MORNING).padStart(2, '0')}:00`;
    const best = spots
      .filter(p => p.map === day.map)
      .map(place => ({ place, rating: ratingAt(place, time) }))
      .filter(row => row.rating)
      .sort((a, b) => b.rating.score - a.rating.score)[0];
    if (!best) return '';
    return `<button type="button" class="dsurf" data-go="lugar-${best.place.id}">${score(best.rating)}${esc(t('surfBest', { t: fmtTime('07:00') }))} <b>${esc(best.place.name)}</b> · ${esc(sizeText(best.rating))}</button>`;
  }
  load(false);
  return {
    id: 'surf',
    label: t('surfTab'),
    html,
    bindPanel,
    placeHTML,
    dayHTML,
    decoratePins,
    reload: () => load(true),
    go,
    bindGo,
  };
}

// Live features: Today mode, the blue dot (location) and offline support.
const pad = n => String(n).padStart(2, '0');
const OVERRIDE = /^\d{4}-\d\d-\d\dT\d\d:\d\d/;
const EARTH_KM = 6371;

// current time in a timezone as 'YYYY-MM-DDTHH:MM'. To test: ?hoje=2026-11-21T10:30
export function nowIn(timezone) {
  const forced = new URLSearchParams(location.search).get('hoje');
  if (forced && OVERRIDE.test(forced)) return forced.slice(0, 16);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date())
      .map(part => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
const toMinutes = text => {
  const match = /^(\d{1,2})(?::|h)(\d{2})?$/.exec(text || '');
  return match ? +match[1] * 60 + +(match[2] || 0) : null;
};
const fmtMinutes = minutes => {
  const rounded = Math.max(0, Math.round(minutes)),
    hours = Math.floor(rounded / 60),
    rest = rounded % 60;
  return hours ? `${hours}h${rest ? pad(rest) : ''}` : `${rest} min`;
};
const daysBetween = (a, b) => Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 864e5);
function distanceKm(lat1, lon1, lat2, lon2) {
  const r = Math.PI / 180,
    a =
      Math.sin(((lat2 - lat1) * r) / 2) ** 2 +
      Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(a));
}

export function initLive(ctx) {
  const { T, placeById, go, esc, $, bindGo, flyTo, scr, state, overlay, activeMap, world, overview } = ctx;

  /* ---------- toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(message, ms = 5000) {
    toastEl.innerHTML = `<span>${esc(message)}</span><button type="button" aria-label="${esc(t('close'))}">✕</button>`;
    toastEl.hidden = false;
    toastEl.querySelector('button').onclick = () => {
      toastEl.hidden = true;
    };
    clearTimeout(toastTimer);
    if (ms)
      toastTimer = setTimeout(() => {
        toastEl.hidden = true;
      }, ms);
  }

  /* ---------- Today ---------- */
  function todayInfo() {
    // each day runs on its own map's timezone: a trip can cross several
    const match = T.days.find(day => nowIn(day.tz).slice(0, 10) === day.date);
    const ymd = nowIn(T.days[0].tz).slice(0, 10),
      first = daysBetween(ymd, T.days[0].date),
      last = daysBetween(T.days.at(-1).date, ymd);
    return { n: match?.n ?? null, before: !match && first > 0 ? first : 0, after: !match && last > 0, tz: match?.tz };
  }
  function dayStatus(n) {
    const today = todayInfo();
    if (today.n !== n) return null;
    const now = nowIn(today.tz),
      minutes = toMinutes(now.slice(11)),
      items = T.days[n - 1].items.map((item, i) => ({ ...item, i, m: toMinutes(item.time) }));
    return {
      now,
      minutes,
      items,
      next: items.find(i => i.m != null && i.m > minutes),
      current: [...items].reverse().find(i => i.m != null && i.m <= minutes),
    };
  }
  function dayHTML(n) {
    const status = dayStatus(n);
    if (!status) return '';
    const clock = fmtTime(status.now.slice(11)),
      header = esc(t('todayAt', { t: clock }));
    if (!status.next) {
      const after = T.days[n]
        ? `${esc(t('tomorrow'))} <button type="button" class="lnk" data-go="dia-${n + 1}">${esc(t('day', { n: n + 1 }))}</button>`
        : esc(t('lastDay'));
      return `<div class="today"><span class="live-dot"></span><div><b>${header}</b><small>${esc(t('dayDone'))} ${after}</small></div></div>`;
    }
    const place = status.next.place && placeById[status.next.place];
    const actions = place
      ? `<a class="btn primary sm" href="https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}&travelmode=driving" target="_blank" rel="noopener">${esc(t('goNow'))}</a><button type="button" class="btn sm" data-go="lugar-${place.id}">${esc(t('seeOnMap'))}</button>`
      : '';
    const current = status.current ? `${esc(t('now'))}: ${esc(status.current.text)}. ` : '';
    return `<div class="today"><span class="live-dot"></span><div><b>${header}</b><small>${current}${esc(t('nextIn', { t: fmtMinutes(status.next.m - status.minutes) }))}: <b>${esc(status.next.time)} · ${esc(status.next.text)}</b></small><div class="tact">${actions}</div></div></div>`;
  }
  function decorateDayList(n) {
    const status = dayStatus(n);
    if (!status) return;
    const rows = document.querySelectorAll('#card .list li');
    status.items.forEach((item, k) => {
      const row = rows[k];
      if (!row) return;
      if (status.next && item.i === status.next.i) row.classList.add('is-next');
      else if (item.m != null && item.m <= status.minutes && (!status.next || item.i < status.next.i))
        row.classList.add('is-done');
    });
    const next = document.querySelector('#card .list li.is-next'),
      body = document.querySelector('#card .body');
    if (next && body)
      requestAnimationFrame(() => {
        body.scrollTop = Math.max(0, next.offsetTop - body.offsetTop - 120);
      });
  }

  const daysNav = $('#days'),
    todayButton = document.createElement('button');
  todayButton.type = 'button';
  todayButton.className = 'hoje';
  todayButton.dataset.key = 'hoje';
  todayButton.innerHTML = `<span class="live-dot"></span>${esc(t('today'))}`;
  daysNav.insertBefore(todayButton, daysNav.firstChild);
  todayButton.onclick = () => {
    const today = todayInfo();
    if (today.n) go('dia-' + today.n);
    else if (today.before) {
      toast(t(today.before > 1 ? 'daysLeft' : 'dayLeft', { n: today.before, d: fmtDate(T.days[0].date) }));
      go('dia-1');
    } else {
      toast(t('tripOver'));
      go('');
    }
  };
  function autoToday() {
    const today = todayInfo();
    if (today.n && !location.hash) {
      go('dia-' + today.n);
      toast(t('todayMode', { n: today.n, all: t(T.overview ? 'all' : 'allMap') }), 4500);
    }
  }
  setInterval(() => {
    if (!state.day || state.sel || $('#card').hidden) return;
    const box = $('#chj');
    if (box) {
      box.innerHTML = dayHTML(state.day);
      bindGo(box);
    }
  }, 60e3);

  /* ---------- blue dot ---------- */
  const me = document.createElement('div');
  me.className = 'me';
  me.innerHTML = '<span class="acc"></span><span class="dot"></span>';
  me.hidden = true;
  overlay.appendChild(me);
  const button = $('#zme');
  let watch = null,
    position = null,
    first = true;
  const onMap = () => (activeMap() && activeMap() !== overview ? activeMap() : null);
  function inside(lat, lon) {
    const box = onMap()?.bbox;
    return !!box && lat > box.lat0 && lat < box.lat1 && lon > box.lon0 && lon < box.lon1;
  }
  function onPosition(reading) {
    const { latitude: lat, longitude: lon, accuracy } = reading.coords,
      W3 = world().W3;
    position = { lat, lon, v: W3(lat, lon, 0.05), edge: W3(lat, lon + accuracy / 1000 / 104, 0.05) };
    button.setAttribute('aria-pressed', 'true');
    if (!inside(lat, lon) && first) {
      const map = onMap() || T.maps[0];
      toast(t('farAway', { d: fmtDistance(distanceKm(lat, lon, map.center[0], map.center[1])) }), 7000);
    } else if (first) flyTo(position.v, 7, 1000, true);
    first = false;
  }
  function onError(error) {
    stop();
    toast(t(error?.code === 1 ? 'geoBlocked' : 'geoFail'), 7000);
  }
  function stop() {
    if (watch != null) navigator.geolocation.clearWatch(watch);
    watch = null;
    position = null;
    me.hidden = true;
    button.setAttribute('aria-pressed', 'false');
  }
  button.onclick = () => {
    if (!('geolocation' in navigator)) {
      toast(t('noGeo'));
      return;
    }
    if (watch != null) {
      if (position && inside(position.lat, position.lon)) flyTo(position.v, 7, 800, true);
      else stop();
      return;
    }
    first = true;
    toast(t('locating'), 3000);
    try {
      watch = navigator.geolocation.watchPosition(onPosition, onError, {
        enableHighAccuracy: true,
        maximumAge: 15000,
        timeout: 20000,
      });
    } catch (error) {
      onError(error);
    }
  };
  function layout() {
    if (!position || !inside(position.lat, position.lon)) {
      me.hidden = true;
      return;
    }
    const center = scr(position.v),
      edge = scr(position.edge);
    if (!center.ok) {
      me.hidden = true;
      return;
    }
    me.hidden = false;
    const radius = Math.max(10, Math.min(160, Math.hypot(edge.x - center.x, edge.y - center.y)));
    me.style.transform = `translate(${center.x}px,${center.y}px)`;
    me.firstChild.style.width = me.firstChild.style.height = 2 * radius + 'px';
  }

  /* ---------- offline ---------- */
  const embedded = /claude\.ai|claudeusercontent|anthropic/.test(location.hostname) || !window.isSecureContext;
  if ('serviceWorker' in navigator && !embedded) {
    navigator.serviceWorker
      .register('sw.js')
      .then(registration => {
        if (navigator.serviceWorker.controller) return;
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'activated') toast(t('ready'), 5000);
          });
        });
      })
      .catch(() => toast(t('geoFail'), 1));
  }
  const offlineBar = $('#offline');
  const updateNetwork = () => {
    offlineBar.hidden = navigator.onLine;
  };
  addEventListener('online', () => {
    updateNetwork();
    toast(t('online'), 3500);
    ctx.onOnline?.();
  });
  addEventListener('offline', updateNetwork);
  updateNetwork();

  return { dayHTML, decorateDayList, layout, autoToday, toast };
}

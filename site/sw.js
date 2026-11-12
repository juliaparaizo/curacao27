// Service worker: keeps the site on the device so it works without internet. The build fills in the placeholders.
const VERSION = '__VERSION__';
const CORE = '__CORE__';
const FORECAST = '__NAME__-forecast';

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        // other sites on the same domain have their own caches: leave them alone
        Promise.all(
          keys
            .filter(key => key.startsWith('__NAME__-') && key !== VERSION && key !== FORECAST)
            .map(key => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // forecast: network first, saved copy when offline
  if (/open-meteo\.com$/.test(url.hostname)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(FORECAST).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }
  if (url.origin !== location.origin) return;
  // pages and trip data (data/*.js changes on every edit): try the network, fall back to the saved version
  if (request.mode === 'navigate' || /\/data\/[^/]+\.(js|css)$/.test(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(VERSION).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request, { ignoreSearch: true }).then(hit => hit || caches.match('index.html'))),
    );
    return;
  }
  // site files: saved version right away, refreshed in the background
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(hit => {
      const network = fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(VERSION).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => hit);
      return hit || network;
    }),
  );
});

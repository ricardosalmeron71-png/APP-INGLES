/* Service worker: permite usar la app sin conexión */
const CACHE = 'englishup-v4';
const ASSETS = [
  './', './index.html', './manifest.webmanifest', './css/styles.css',
  './js/config.js', './js/data.js', './js/cloud.js', './js/analysis.js', './js/speech.js', './js/store.js', './js/lessons.js', './js/exercises.js', './js/app.js',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'
];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
// Red primero (para recibir actualizaciones) y caché como respaldo sin conexión
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('./index.html')))
  );
});

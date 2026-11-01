/* Service worker: permite usar la app sin conexión */
const CACHE = 'englishup-v12';
const ASSETS = [
  './', './index.html', './manifest.webmanifest', './css/styles.css',
  './js/config.js', './js/data.js', './js/cloud.js', './js/analysis.js', './js/speech.js', './js/store.js', './js/lessons.js', './js/verbs.js', './js/pronunciation.js', './js/engage.js', './js/notify.js', './js/exercises.js', './js/app.js',
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

/* ---------- Notificaciones push (recordatorios) ---------- */
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'EnglishUp', {
    body: d.body || '', icon: './icons/icon-192.png', badge: './icons/icon-192.png', tag: d.tag || 'englishup',
    data: { url: d.url || './#/learn' }, lang: 'es', vibrate: [80, 40, 80]
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) {
      if (c.url.startsWith(self.registration.scope)) {
        await c.focus();
        try { await c.navigate(target); } catch (_) { c.postMessage({ type: 'goto', url: target }); }
        return;
      }
    }
    await self.clients.openWindow(target);
  })());
});

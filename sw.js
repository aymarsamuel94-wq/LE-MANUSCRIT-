// Le Manuscrit — Service Worker
// Incrémente CACHE_VERSION à chaque mise à jour de l'app
const CACHE_VERSION = 'manuscrit-v1';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Cache-first : l'app reprend instantanément au retour en premier plan,
  // sans rechargement (donc sans perte de position de lecture).
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => {
        const clone = r.clone();
        caches.open(CACHE_VERSION).then(ch => ch.put(e.request, clone));
        return r;
      });
    })
  );
});

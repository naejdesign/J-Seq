const CACHE = 'jseq-v25';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './plate.wav',
  './room.wav',
  './hall1.wav',
  './hall2.wav',
  './atmos.wav',
  './impulse_rev.wav'
];

// Fichiers à ne PAS mettre en cache SW (gérés par IndexedDB côté app)
const BYPASS_CACHE = ['GeneralUser-GS.sf2'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Bypass SW pour les fichiers SF2 volumineux (gérés par IndexedDB)
  if (BYPASS_CACHE.some(f => url.endsWith(f))) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      caches.open(CACHE).then(c => c.put(e.request, res.clone()));
      return res;
    }))
  );
});

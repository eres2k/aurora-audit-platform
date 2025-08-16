const CACHE_NAME = 'aurora-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-audits') {
    event.waitUntil(syncData());
  }
});

function syncData() {
  // Implemented in src/services/sync.js
}

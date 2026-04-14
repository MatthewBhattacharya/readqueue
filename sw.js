const CACHE_NAME = 'rq-app-cache-v1';
const PDF_CACHE = 'rq-pdf-cache-v1';

// App shell files to cache for offline
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install — cache app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== PDF_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — serve app shell from cache, fall back to network.
// PDF caching is managed manually by the app (stored as 'pdf-{id}' keys),
// not intercepted here, so Drive API requests always go to the network.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).catch(() =>
        caches.match('/index.html')
      )
    )
  );
});

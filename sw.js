const CACHE_NAME = 'sales-dashboard-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Add paths to your main CSS and JS files if they are locally hosted and not entirely CDN.
  // For this setup, CDNs handle caching of tailwind, react, etc.
  // We primarily cache the entry points and manifest.
  '/manifest.json'
  // Add placeholder icon paths if you want them cached by service worker, e.g., '/icons/icon-192x192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // Serve from cache
        }
        return fetch(event.request).then(
          (networkResponse) => {
            // Optional: Cache new requests dynamically
            // if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            //   return networkResponse;
            // }
            // const responseToCache = networkResponse.clone();
            // caches.open(CACHE_NAME)
            //   .then(cache => {
            //     cache.put(event.request, responseToCache);
            //   });
            return networkResponse;
          }
        ).catch(() => {
          // Basic offline fallback for HTML pages if not in cache
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

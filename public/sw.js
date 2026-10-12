/* =========================================================
   Hasen Personal Homepage — Service Worker
   Caches static assets for offline access
   ========================================================= */

var CACHE_NAME = 'hasen-v2-20260817';
var ASSETS_TO_CACHE = [
    '/',
    '/home.html',
    '/blog.html',
    '/projects.html',
    '/about.html',
    '/ideas.html',
    '/article.html',
    '/404.html',
    '/css/styles.css',
    '/app.js',
    '/assets/avatar.png',
    '/assets/avatar.webp'
];

// Install: cache all assets
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames
                    .filter(function (name) { return name !== CACHE_NAME; })
                    .map(function (name) { return caches.delete(name); })
            );
        })
    );
    self.clients.claim();
});

// Fetch: serve from cache, fallback to network
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            if (response) {
                return response;
            }
            return fetch(event.request).then(function (fetchResponse) {
                // Cache new requests
                if (fetchResponse.ok) {
                    var clone = fetchResponse.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(event.request, clone);
                    });
                }
                return fetchResponse;
            }).catch(function () {
                // Fallback for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('/home.html');
                }
            });
        })
    );
});

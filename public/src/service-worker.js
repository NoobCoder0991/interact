// Install event: Caches files for offline use
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing Service Worker...');
    event.waitUntil(
        caches.open('v1').then((cache) => {
            return cache.addAll([
                '/', // Cache the root of your site
                '/index.html',
                '/styles.css',
                '/app.js',
                '/images/icon.png', // Add other assets you want to cache
            ]);
        })
    );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== 'v1') {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event: Serve cached content when offline
self.addEventListener('fetch', (event) => {
    console.log('[Service Worker] Fetching resource: ' + event.request.url);
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Push event: Handle push notifications
self.addEventListener('push', (event) => {
    const data = event.data.json();
    const options = {
        body: data.message,
        icon: '/images/icon.png',
        badge: '/images/badge.png',
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

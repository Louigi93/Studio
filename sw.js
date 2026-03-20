const CACHE = 'studio-booking-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    '/the-studio-icon-dark-no-text.png',
    '/the-studio-icon-light-no-text.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    // Network-first for Firebase requests so bookings are always live
    if (event.request.url.includes('firebase') || event.request.url.includes('firestore')) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first for local assets
    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request))
    );
});

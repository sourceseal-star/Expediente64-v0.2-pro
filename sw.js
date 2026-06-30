// EXPEDIENTE 64 — Service Worker v0.2
// Cachea los assets del juego para funcionamiento offline

const CACHE_NAME = 'expediente64-v0.2';
const ASSETS = [
  '/',
  '/index.html',
  '/game-data.js',
  '/game-engine.js',
  '/mechanics-stealth.js',
  '/mechanics-dialogue.js',
  '/mechanics-deduction.js',
  '/cinematics.js',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});

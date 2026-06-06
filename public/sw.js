// IMS HNTI Service Worker — v1
// Strategi:
// 1. App shell (HTML/JS/CSS/icons) → cache-first, update di background. User tetap dapat
//    buka app saat offline; saat online dapat versi terbaru di kunjungan berikutnya.
// 2. Supabase API requests → NETWORK ONLY (jangan pernah cache). Data harus selalu fresh
//    karena multi-device sync via Realtime adalah sumber kebenaran.
// 3. Static assets dari CDN (fonts) → cache-first untuk performa.
//
// Update strategy: saat ada SW baru di-deploy, browser fetch sw.js (cached max 24 jam
// secara default oleh server). Saat SW baru detected, kita skipWaiting dan claim clients
// supaya tab user otomatis pakai versi baru tanpa harus close-reopen.

const CACHE_VERSION = 'ims-hnti-v1-2026-06-06';
const APP_SHELL_CACHE = `app-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest'
];

// === Install: pre-cache app shell ===
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) =>
      cache.addAll(APP_SHELL_URLS).catch(() => {/* tolerate partial fail at install */})
    )
  );
});

// === Activate: bersihkan cache lama (versi sebelumnya) ===
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k => k !== APP_SHELL_CACHE && k !== RUNTIME_CACHE)
          .map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

// === Fetch handler ===
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // POST/PUT/DELETE → pass-through ke network

  const url = new URL(req.url);

  // 1. Supabase API & WebSocket → NEVER cache (data layer harus selalu fresh)
  if (url.hostname.endsWith('.supabase.co') || url.hostname.endsWith('.supabase.com')) {
    return; // biarkan browser handle native (no SW intervention)
  }

  // 2. Navigation requests (HTML pages) → network-first dengan cache fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Update cache untuk offline access nanti
          const resClone = res.clone();
          caches.open(APP_SHELL_CACHE).then(c => c.put(req, resClone)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('/')))
    );
    return;
  }

  // 3. Same-origin static assets (JS/CSS/img) → cache-first dengan background revalidation
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const networkFetch = fetch(req).then((res) => {
          // Hanya cache response sukses & same-origin
          if (res && res.status === 200 && res.type === 'basic') {
            const resClone = res.clone();
            caches.open(RUNTIME_CACHE).then(c => c.put(req, resClone)).catch(() => {});
          }
          return res;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // 4. Cross-origin (CDN fonts, dll) → cache-first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      if (res && (res.status === 200 || res.type === 'opaque')) {
        const resClone = res.clone();
        caches.open(RUNTIME_CACHE).then(c => c.put(req, resClone)).catch(() => {});
      }
      return res;
    }).catch(() => cached))
  );
});

// === Message handler: untuk komunikasi dari app (e.g., skipWaiting on user prompt) ===
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // Wajib ada event fetch kosong ini agar syarat instalasi browser terpenuhi
});

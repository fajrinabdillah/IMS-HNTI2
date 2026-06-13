import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// === Service Worker registration (entry point) ===
// Mendaftarkan /sw.js untuk OS-level push notification + offline app shell.
// Idempotent: aman walaupun index.html juga mendaftarkan SW yang sama.
// Fondasi agar ke depan siap dikoneksikan ke Firebase Cloud Messaging (FCM) / Web Push.
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[IMS] Service worker registration failed:', err)
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Extracted from App.jsx during modular refactor.
const _memStore = {};
const _hasArtifactStorage = typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function';
const _hasLocalStorage = (() => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const k = '__ims_ls_test__'; window.localStorage.setItem(k, '1'); window.localStorage.removeItem(k);
    return true;
  } catch { return false; }
})();
const _SUPA_URL = 'https://xuumodhksfwnkdbyjnmq.supabase.co';
const _SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1dW1vZGhrc2Z3bmtkYnlqbm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDgwMTQsImV4cCI6MjA5NTk4NDAxNH0.yiuPJEI-BXXc_mXNparq7wDX2u4QJ04mVbF55FZkbuo';
const _supaEnabled = () => _SUPA_KEY !== 'MASUKKAN_ANON_KEY_ANDA_DI_SINI' && _SUPA_URL.startsWith('https://');
const _supaFetch = (path, opts = {}, tok = null) => fetch(`${_SUPA_URL}/rest/v1/${path}`, {
  ...opts, headers: { apikey: _SUPA_KEY, Authorization: `Bearer ${tok || _SUPA_KEY}`, 'Content-Type': 'application/json', ...(opts.headers || {}) }
});
let _supaSession = null; // { access_token, refresh_token, expires_at }
const _SUPA_SESS_LS = 'ims_hnti:supa_sess_v1'; // kunci localStorage khusus sesi Auth
const _authFetch = (path, opts = {}) => fetch(`${_SUPA_URL}/auth/v1/${path}`, {
  ...opts, headers: { apikey: _SUPA_KEY, 'Content-Type': 'application/json', ...(opts.headers || {}) }
});
const _supaSignIn = async (email, password) => {
  const res = await _authFetch('token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error_description || e.msg || 'auth_failed'); }
  const d = await res.json();
  _supaSession = { access_token: d.access_token, refresh_token: d.refresh_token, expires_at: Date.now() + (d.expires_in || 3600) * 1000 };
  try { if (_hasLocalStorage) window.localStorage.setItem(_SUPA_SESS_LS, JSON.stringify(_supaSession)); } catch {}
  return d;
};
let _refreshInFlight = null;
const _supaRefreshTok = async () => {
  if (!_supaSession?.refresh_token) return false;
  if (_refreshInFlight) return _refreshInFlight; // dedupe: banyak request paralel berbagi 1 refresh
  _refreshInFlight = (async () => {
    try {
      const res = await _authFetch('token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: _supaSession.refresh_token }) });
      if (!res.ok) {
        // Hard failure (refresh_token mati): bersihkan sesi & beri tahu app untuk re-login.
        // Transient (5xx/network): jangan hapus sesi — bisa retry nanti.
        if (res.status >= 400 && res.status < 500) {
          _supaSession = null;
          try { if (_hasLocalStorage) window.localStorage.removeItem(_SUPA_SESS_LS); } catch {}
          try { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('ims:session:dead')); } catch {}
        }
        return false;
      }
      const d = await res.json();
      _supaSession = { access_token: d.access_token, refresh_token: d.refresh_token, expires_at: Date.now() + (d.expires_in || 3600) * 1000 };
      try { if (_hasLocalStorage) window.localStorage.setItem(_SUPA_SESS_LS, JSON.stringify(_supaSession)); } catch {}
      // Update token Realtime channel agar JWT tetap valid setelah refresh
      // SPEC: access_token event butuh ref DAN join_ref (sama dgn yang dipakai phx_join)
      if (_rtSocket && _rtSocket.readyState === 1 && _rtJoinRef) {
        try { _rtSocket.send(JSON.stringify({
          topic: 'realtime:ims_kv_changes',
          event: 'access_token',
          payload: { access_token: d.access_token },
          ref: 'tk_' + Date.now(),
          join_ref: _rtJoinRef
        })); } catch {}
      }
      return true;
    } catch { return false; }
  })();
  try { return await _refreshInFlight; } finally { _refreshInFlight = null; }
};
const _supaSignOut = async () => {
  if (_supaSession?.access_token) {
    try { await _authFetch('logout', { method: 'POST', headers: { Authorization: `Bearer ${_supaSession.access_token}` } }); } catch {}
  }
  _supaSession = null;
  try { if (_hasLocalStorage) window.localStorage.removeItem(_SUPA_SESS_LS); } catch {}
};
const _restoreSupaSession = async () => {
  if (!_supaEnabled()) return false;
  try {
    if (!_hasLocalStorage) return false;
    const stored = window.localStorage.getItem(_SUPA_SESS_LS);
    if (!stored) return false;
    _supaSession = JSON.parse(stored);
    if (!_supaSession?.refresh_token) { _supaSession = null; return false; }
    return await _supaRefreshTok(); // selalu refresh saat load untuk token segar
  } catch { _supaSession = null; return false; }
};
const _getSupaTok = async () => {
  if (!_supaSession) return null; // tidak ada sesi → pakai anon key (fallback)
  if (_supaSession.expires_at - Date.now() < 300000) await _supaRefreshTok(); // refresh jika < 5 menit
  return _supaSession?.access_token || null;
};
const _supaReq = async (path, opts = {}) => {
  let tok = await _getSupaTok();
  let res = await _supaFetch(path, opts, tok);
  if ((res.status === 401 || res.status === 403) && _supaSession?.refresh_token) {
    const ok = await _supaRefreshTok();
    if (ok) { tok = _supaSession?.access_token || null; res = await _supaFetch(path, opts, tok); }
  }
  return res;
};
// VAPID public key aman untuk dipublikasikan (bukan rahasia). Fallback hardcoded
// dipakai jika env VITE_VAPID_PUBLIC_KEY tidak diset di Vercel, agar push tetap jalan.
const _VAPID_PUBLIC_KEY_FALLBACK = 'BKP8dxr9JNspS7TgSKhI2AcXPMKRWj2K1zU34_TNyerXhS4VFxjNKYRGXUyY0jqB6e5YRbz_SG0vhiBYXrkh4Qc';
const _pushVapidPublicKey = () =>
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_VAPID_PUBLIC_KEY)
    ? import.meta.env.VITE_VAPID_PUBLIC_KEY
    : _VAPID_PUBLIC_KEY_FALLBACK;
const _urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
};
const pushSupported = () => typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.register('/sw.js').then(() => navigator.serviceWorker.ready);
};
const savePushSubscription = async (subscription, session) => {
  if (!_supaEnabled() || !subscription || !session?.username) return { ok: false, error: 'invalid_session' };
  try {
    const payload = {
      username: session.username,
      role: session.role,
      endpoint: subscription.endpoint,
      subscription,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      active: true,
      updated_at: new Date().toISOString(),
    };
    // Utama: Edge Function register-push (service_role, bypass RLS).
    try {
      const fnRes = await fetch(`${_SUPA_URL}/functions/v1/register-push`, {
        method: 'POST',
        headers: { apikey: _SUPA_KEY, Authorization: `Bearer ${_SUPA_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (fnRes.ok) {
        const d = await fnRes.json().catch(() => ({}));
        if (d.ok) return { ok: true };
      }
    } catch {}
    // Fallback: REST langsung via anon key.
    const res = await _supaFetch('push_subscriptions?on_conflict=endpoint', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(payload),
    }, null);
    if (!res.ok) {
      let detail = '';
      try { detail = await res.text(); console.warn('[IMS] push subscription save failed:', res.status, detail); } catch {}
      return { ok: false, error: detail.includes('row-level security') ? 'rls_policy_missing' : `http_${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message || 'network_error' };
  }
};
const enablePushNotifications = async (session) => {
  if (!pushSupported()) return { ok: false, reason: 'unsupported' };
  const vapidKey = _pushVapidPublicKey();
  if (!vapidKey) return { ok: false, reason: 'missing_vapid_key' };
  try {
    const permission = Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission();
    if (permission !== 'granted') return { ok: false, reason: 'permission_denied' };
    const registration = await registerServiceWorker();
    if (!registration?.pushManager) return { ok: false, reason: 'no_push_manager' };
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: _urlBase64ToUint8Array(vapidKey),
      });
    }
    const saved = await savePushSubscription(subscription.toJSON ? subscription.toJSON() : subscription, session);
    return saved.ok ? { ok: true } : { ok: false, reason: saved.error || 'save_failed' };
  } catch (err) {
    return { ok: false, reason: err?.message || 'failed' };
  }
};
const getPushPermissionStatus = () => {
  if (!pushSupported()) return 'unsupported';
  return Notification.permission || 'default';
};
const sendServerPushNotification = async (target, payload, fromUser) => {
  if (!_supaEnabled() || typeof fetch === 'undefined') return false;
  try {
    const tok = await _getSupaTok();
    const res = await fetch(`${_SUPA_URL}/functions/v1/send-push`, {
      method: 'POST',
      headers: {
        apikey: _SUPA_KEY,
        Authorization: `Bearer ${tok || _SUPA_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ target, payload, fromUser }),
    });
    return res.ok;
  } catch { return false; }
};
let _rtSocket = null, _rtHeartbeat = null, _rtRetryCount = 0, _rtRetryTimer = null;
let _rtStatus = 'offline'; // 'offline' | 'connecting' | 'live' | 'error'
const _setRtStatus = (s) => {
  if (s === _rtStatus) return; _rtStatus = s;
  try { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('ims:rt:status', { detail: { status: s } })); } catch {}
};
const _hashStr = (s) => { let h = 0; const x = String(s || ''); for (let i = 0; i < x.length; i++) h = ((h << 5) - h + x.charCodeAt(i)) | 0; return h; };
const _recentWrites = {}; // key → { h: hash, t: timestamp } untuk dedupe self-echo
const _markRecentWrite = (k, v) => { _recentWrites[k] = { h: _hashStr(typeof v === 'string' ? v : JSON.stringify(v)), t: Date.now() }; };
const _isRecentSelfEcho = (k, v) => {
  const r = _recentWrites[k]; if (!r) return false;
  if (Date.now() - r.t > 4000) { delete _recentWrites[k]; return false; }
  return _hashStr(typeof v === 'string' ? v : JSON.stringify(v)) === r.h;
};
let _rtJoinRef = null;
const _RT_TOPIC = 'realtime:ims_kv_changes';
const _startRealtime = () => {
  if (typeof window === 'undefined' || typeof WebSocket === 'undefined') return;
  if (!_supaEnabled() || !_supaSession?.access_token) { _setRtStatus('offline'); return; }
  if (_rtSocket && (_rtSocket.readyState === 0 || _rtSocket.readyState === 1)) return;
  if (_rtRetryTimer) { clearTimeout(_rtRetryTimer); _rtRetryTimer = null; }
  _setRtStatus('connecting');
  const tok = _supaSession.access_token;
  const url = _SUPA_URL.replace(/^https?:\/\//, 'wss://') + '/realtime/v1/websocket?apikey=' + encodeURIComponent(_SUPA_KEY) + '&vsn=1.0.0';
  let ws; try { ws = new WebSocket(url); } catch { _setRtStatus('error'); _scheduleRtRetry(); return; }
  _rtSocket = ws;
  let refCounter = 1, joinRef = null, joinReplied = false, postgresReady = false;
  ws.addEventListener('open', () => {
    joinRef = String(refCounter++); _rtJoinRef = joinRef;
    // phx_join sesuai spec Supabase Realtime v1.0.0:
    // - WAJIB sertakan `join_ref` (bug v39: tidak ada → server tolak join)
    // - WAJIB lengkap: broadcast.ack, presence.enabled, postgres_changes, private
    // - access_token di level payload (bukan config) untuk RLS authenticated_only
    const joinMsg = {
      topic: _RT_TOPIC,
      event: 'phx_join',
      payload: {
        config: {
          broadcast: { ack: false, self: false },
          presence: { enabled: false, key: '' },
          postgres_changes: [{ event: '*', schema: 'public', table: 'kv_store' }],
          private: false
        },
        access_token: tok
      },
      ref: joinRef,
      join_ref: joinRef
    };
    try { ws.send(JSON.stringify(joinMsg)); } catch {}
    if (_rtHeartbeat) clearInterval(_rtHeartbeat);
    _rtHeartbeat = setInterval(() => {
      try { ws.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: String(refCounter++) })); } catch {}
    }, 25000);
  });
  ws.addEventListener('message', (ev) => {
    let msg; try { msg = JSON.parse(ev.data); } catch { return; }
    // phx_reply: konfirmasi join channel — belum berarti postgres_changes aktif
    if (msg.event === 'phx_reply' && msg.ref === joinRef) {
      if (msg.payload?.status === 'ok') {
        joinReplied = true;
        _rtRetryCount = 0;
        // Belum 'live' — tunggu system event 'postgres_changes' status=ok
        if (_rtStatus !== 'live') _setRtStatus('connecting');
      } else {
        // Server reject join → keluar & retry
        const reason = msg.payload?.response?.reason || 'join_rejected';
        try { console.warn('[IMS realtime] join rejected:', reason); } catch {}
        _setRtStatus('error');
        try { ws.close(); } catch {}
      }
      return;
    }
    // system event: konfirmasi extension status (postgres_changes subscribed)
    if (msg.event === 'system') {
      const p = msg.payload || {};
      if (p.extension === 'postgres_changes') {
        if (p.status === 'ok') {
          postgresReady = true;
          _setRtStatus('live');
        } else if (p.status === 'error' || p.status === 'timeout') {
          try { console.warn('[IMS realtime] postgres_changes:', p.message || p.status); } catch {}
          // system error untuk postgres_changes bersifat informasional → channel tetap open
          // Tapi karena ini fitur kunci, set ke 'error' supaya UI jelas
          _setRtStatus('error');
        }
      }
      return;
    }
    // phx_error: error di channel — server akan tutup channel
    if (msg.event === 'phx_error') {
      try { console.warn('[IMS realtime] phx_error', msg.payload); } catch {}
      _setRtStatus('error');
      return;
    }
    // phx_close: channel ditutup server
    if (msg.event === 'phx_close') {
      _setRtStatus('error');
      try { ws.close(); } catch {}
      return;
    }
    // postgres_changes: payload data berisi record/old_record
    if (msg.event === 'postgres_changes') {
      const change = msg.payload?.data; if (!change) return;
      const row = change.record || change.old_record; if (!row?.key) return;
      const val = change.record?.value;
      if (val !== undefined && _isRecentSelfEcho(row.key, val)) return; // skip self-echo
      try {
        window.dispatchEvent(new CustomEvent('ims:cloud:change', {
          detail: { key: row.key, value: val, action: change.type, ts: Date.now() }
        }));
      } catch {}
    }
  });
  ws.addEventListener('error', () => { _setRtStatus('error'); });
  ws.addEventListener('close', () => {
    if (_rtHeartbeat) { clearInterval(_rtHeartbeat); _rtHeartbeat = null; }
    _rtSocket = null; _rtJoinRef = null;
    // Status saat close: jika sebelumnya sudah live/joinReplied → tampilkan connecting (akan retry)
    // jika belum sempat join → error (Retry pill)
    _setRtStatus(postgresReady || joinReplied ? 'connecting' : 'error');
    _scheduleRtRetry();
  });
};
const _scheduleRtRetry = () => {
  if (!_supaSession?.access_token) return;
  _rtRetryCount = Math.min(_rtRetryCount + 1, 6);
  const delay = Math.min(1500 * Math.pow(1.6, _rtRetryCount - 1), 30000);
  if (_rtRetryTimer) clearTimeout(_rtRetryTimer);
  _rtRetryTimer = setTimeout(() => { _rtRetryTimer = null; _startRealtime(); }, delay);
};
const _stopRealtime = () => {
  if (_rtRetryTimer) { clearTimeout(_rtRetryTimer); _rtRetryTimer = null; }
  if (_rtHeartbeat) { clearInterval(_rtHeartbeat); _rtHeartbeat = null; }
  if (_rtSocket) { try { _rtSocket.close(); } catch {} _rtSocket = null; }
  _rtRetryCount = 0; _setRtStatus('offline');
};
let _tokRefreshTimer = null;
const _startProactiveRefresh = () => {
  if (_tokRefreshTimer) clearInterval(_tokRefreshTimer);
  _tokRefreshTimer = setInterval(async () => {
    if (!_supaSession?.refresh_token) return;
    const remain = _supaSession.expires_at - Date.now();
    if (remain < 15 * 60 * 1000) await _supaRefreshTok();
  }, 8 * 60 * 1000);
};
const _stopProactiveRefresh = () => { if (_tokRefreshTimer) { clearInterval(_tokRefreshTimer); _tokRefreshTimer = null; } };
const storeGet = async (k) => {
  // [1] Claude artifact preview
  if (_hasArtifactStorage) { try { const r = await window.storage.get(k); return r?.value ?? null; } catch {} }
  // [2] Supabase (penyimpanan cloud utama) — gunakan session token jika ada
  if (_supaEnabled()) {
    try {
      const res = await _supaReq(`kv_store?key=eq.${encodeURIComponent(k)}&select=value`, {});
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const v = rows[0].value;
          if (v == null) return null;
          return typeof v === 'string' ? v : JSON.stringify(v);
        }
      }
    } catch {}
  }
  // [3] localStorage (fallback: data lama sebelum Supabase aktif / Supabase offline)
  try { if (_hasLocalStorage) return window.localStorage.getItem(k); } catch {}
  return _memStore[k] ?? null;
};
const storeSet = async (k, v) => {
  // [1] Claude artifact preview
  if (_hasArtifactStorage) { try { await window.storage.set(k, v); return; } catch {} }
  // [2] Supabase upsert — gunakan session token jika ada
  if (_supaEnabled()) {
    try {
      const jv = (() => { try { return JSON.parse(v); } catch { return v; } })();
      _markRecentWrite(k, jv); // tandai sebelum kirim → cegah self-echo dari Realtime
      await _supaReq('kv_store', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ key: k, value: jv, updated_at: new Date().toISOString() })
      });
    } catch {}
  }
  // [3] localStorage mirror (data tetap ada saat offline / transisi ke Supabase)
  try { if (_hasLocalStorage) { window.localStorage.setItem(k, v); return; } } catch {}
  _memStore[k] = v;
};
const storeDel = async (k) => {
  // [1] Claude artifact preview
  if (_hasArtifactStorage) { try { await window.storage.delete(k); return; } catch {} }
  // [2] Supabase delete — gunakan session token jika ada
  if (_supaEnabled()) {
    try {
      await _supaReq(`kv_store?key=eq.${encodeURIComponent(k)}`, { method: 'DELETE' });
    } catch {}
  }
  // [3] localStorage cleanup
  try { if (_hasLocalStorage) { window.localStorage.removeItem(k); return; } } catch {}
  delete _memStore[k];
};
const _persistPending = {};
let _persistTimer = null;
function debouncedStoreSet(k, v) {
  _persistPending[k] = v;
  if (_persistTimer) return;
  _persistTimer = setTimeout(() => {
    const batch = _persistPending; const keys = Object.keys(batch);
    _persistTimer = null;
    for (const key of keys) { const val = batch[key]; delete batch[key]; storeSet(key, val); }
  }, 500);
}
function flushPersist() {
  if (_persistTimer) { clearTimeout(_persistTimer); _persistTimer = null; }
  const keys = Object.keys(_persistPending);
  for (const key of keys) { const val = _persistPending[key]; delete _persistPending[key]; storeSet(key, val); }
}

export { _memStore, _hasArtifactStorage, _hasLocalStorage, _SUPA_URL, _SUPA_KEY, _supaEnabled, _supaFetch, _supaSession, _SUPA_SESS_LS, _authFetch, _supaSignIn, _refreshInFlight, _supaRefreshTok, _supaSignOut, _restoreSupaSession, _getSupaTok, _supaReq, _pushVapidPublicKey, _urlBase64ToUint8Array, pushSupported, registerServiceWorker, savePushSubscription, enablePushNotifications, getPushPermissionStatus, sendServerPushNotification, _rtSocket, _rtHeartbeat, _rtRetryCount, _rtRetryTimer, _rtStatus, _setRtStatus, _hashStr, _recentWrites, _markRecentWrite, _isRecentSelfEcho, _rtJoinRef, _RT_TOPIC, _startRealtime, _scheduleRtRetry, _stopRealtime, _tokRefreshTimer, _startProactiveRefresh, _stopProactiveRefresh, storeGet, storeSet, storeDel, _persistPending, _persistTimer, debouncedStoreSet, flushPersist };

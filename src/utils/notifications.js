// Extracted from App.jsx during modular refactor.
import { MAX_AUDIT_ENTRIES, MAX_NOTIFICATIONS, NOTIFICATION_DEDUPE_MS, NOTIFICATION_TTL_MS } from '../constants/storageKeys.js';
import { sendServerPushNotification } from './storage.js';
function appendAuditLog(setAuditLog, entry) {
  setAuditLog(prev => {
    const next = [{ ...entry, id: 'audit_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8), timestamp: new Date().toISOString() }, ...prev];
    return next.slice(0, MAX_AUDIT_ENTRIES);
  });
}
const pushDedupeMemory = new Map();
function notificationDedupeKey(target, payload) {
  const link = payload?.link ? `${payload.link.view || ''}:${payload.link.id || ''}` : '';
  return [
    target?.role || '',
    target?.username || '',
    payload?.type || 'system',
    link,
    String(payload?.message || '').trim().toLowerCase(),
  ].join('|');
}
function pruneNotifications(notifications) {
  const cutoff = Date.now() - NOTIFICATION_TTL_MS;
  return (Array.isArray(notifications) ? notifications : []).filter(n => !n.createdAt || new Date(n.createdAt).getTime() >= cutoff);
}
function hasRecentDuplicateNotification(notifications, target, payload) {
  const key = notificationDedupeKey(target, payload);
  const cutoff = Date.now() - NOTIFICATION_DEDUPE_MS;
  return pruneNotifications(notifications).some(n => notificationDedupeKey({ role: n.toRole, username: n.toUsername }, n) === key && new Date(n.createdAt).getTime() >= cutoff);
}
function pushNotificationToList(notifications, target, payload, fromUser) {
  const clean = pruneNotifications(notifications);
  const key = notificationDedupeKey(target, payload);
  const duplicate = clean.find(n => notificationDedupeKey({ role: n.toRole, username: n.toUsername }, n) === key);
  if (duplicate) {
    const refreshed = { ...duplicate, createdAt: new Date().toISOString(), readAt: duplicate.readAt || null };
    return [refreshed, ...clean.filter(n => n.id !== duplicate.id)].slice(0, MAX_NOTIFICATIONS);
  }
  const notif = {
    id: 'notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    toRole: target?.role || null,
    toUsername: target?.username || null,
    fromUsername: fromUser?.username || payload?.fromUser?.username || 'system',
    fromRole: fromUser?.role || payload?.fromUser?.role || 'system',
    type: payload?.type || 'system',
    message: payload?.message || '',
    link: payload?.link || null,
    createdAt: new Date().toISOString(),
    readAt: null,
  };
  return [notif, ...clean].slice(0, MAX_NOTIFICATIONS);
}
const LEADERSHIP_INBOX_ROLES = ['gm', 'manager_ops'];
const ADMIN_WORKFLOW_TYPES = new Set(['sph_request', 'spp_request', 'sph_ready', 'spp_ready']);

function notificationContentKeyFromNotif(n) {
  const link = n?.link ? `${n.link.view || ''}:${n.link.id || ''}` : '';
  return [n?.type || 'system', String(n?.message || '').trim().toLowerCase(), link].join('|');
}

function isNotificationForUser(notif, session) {
  if (!session || !notif) return false;
  // username-specific match
  if (notif.toUsername && notif.toUsername === session.username) return true;
  // role-broadcast match (no username constraint OR matching username)
  if (notif.toRole && notif.toRole === session.role) {
    if (!notif.toUsername || notif.toUsername === session.username) return true;
  }
  // GM & Manager Ops ikut inbox alert workflow Admin (request/ready SPH & SPP)
  if (notif.toRole === 'admin' && LEADERSHIP_INBOX_ROLES.includes(session.role) && ADMIN_WORKFLOW_TYPES.has(notif.type)) {
    return true;
  }
  // CEO oversight — satu entri per event (dedupe di visibleNotificationsForUser)
  if (session.role === 'super_admin') return true;
  return false;
}

function visibleNotificationsForUser(notifications, session) {
  const list = pruneNotifications(notifications).filter(n => isNotificationForUser(n, session));
  if (session?.role !== 'super_admin') return list;
  const seen = new Set();
  return list.filter(n => {
    const key = notificationContentKeyFromNotif(n);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function countUnreadNotifications(notifications, session) {
  if (!Array.isArray(notifications)) return 0;
  return visibleNotificationsForUser(notifications, session).filter(n => !n.readAt).length;
}
// Judul OS notification yang profesional, dipetakan dari tipe notifikasi internal.
const NOTIF_TITLE_MAP = {
  id: {
    sph_request: 'Permintaan SPH Baru', spp_request: 'Permintaan SPP Baru', sph_ready: 'SPH Siap Dikirim', spp_ready: 'SPP Siap Dikirim', sph_sent: 'SPH Terkirim',
    po_won: 'PO Dimenangkan', dp_paid: 'DP / Deposit Diterima', dp_followup: 'Follow-up DP',
    invoice_ready: 'Invoice Siap', billing_due: 'Tagihan Jatuh Tempo', pnbp_due: 'PNBP Jatuh Tempo',
    install_pending: 'Instalasi Menunggu', training_scheduled: 'Jadwal Training', shipping_arrived: 'Barang Tiba',
    factory_po_sent: 'PO ke Pabrik Terkirim', factory_dp_paid: 'DP Pabrik Dibayar', pib_paid: 'PIB Terbayar',
    system: 'Notifikasi IMS',
  },
  en: {
    sph_request: 'New SPH Request', spp_request: 'New SPP Request', sph_ready: 'SPH Ready to Send', spp_ready: 'SPP Ready to Send', sph_sent: 'SPH Sent',
    po_won: 'PO Won', dp_paid: 'DP / Deposit Received', dp_followup: 'DP Follow-up',
    invoice_ready: 'Invoice Ready', billing_due: 'Billing Due', pnbp_due: 'PNBP Due',
    install_pending: 'Installation Pending', training_scheduled: 'Training Scheduled', shipping_arrived: 'Goods Arrived',
    factory_po_sent: 'Factory PO Sent', factory_dp_paid: 'Factory DP Paid', pib_paid: 'PIB Paid',
    system: 'IMS Notification',
  },
};
function notificationTitle(type, lang = 'id') {
  const map = NOTIF_TITLE_MAP[lang] || NOTIF_TITLE_MAP.id;
  return map[type] || map.system;
}
// Minta izin notifikasi desktop dari browser (dipanggil sekali setelah login).
function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return Promise.resolve('unsupported');
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Promise.resolve(Notification.permission);
  }
  try {
    return Notification.requestPermission().catch(() => 'default');
  } catch {
    return Promise.resolve('default');
  }
}
// Tampilkan OS-level notification (di luar tab browser) + klik → fokus tab & buka modul terkait.
function triggerBrowserNotification(payload = {}, lang = 'id') {
  if (typeof window === 'undefined') return;
  try {
    if (navigator?.vibrate) navigator.vibrate([120, 40, 120]);
    if (!('Notification' in window)) return;
    const title = `IMS HNTI — ${notificationTitle(payload.type, lang)}`;
    const show = () => {
      try {
        const n = new Notification(title, {
          body: payload.message || (lang === 'en' ? 'New notification' : 'Notifikasi baru'),
          tag: payload.type || 'ims-hnti',
          icon: '/logoapps.png',
          badge: '/logoapps.png',
          renotify: false,
          data: { link: payload.link || null, type: payload.type || 'system' },
        });
        n.onclick = (event) => {
          try { event.preventDefault(); } catch {}
          try { window.focus(); } catch {}
          try {
            if (payload.link) window.dispatchEvent(new CustomEvent('ims:navigate', { detail: { link: payload.link } }));
          } catch {}
          try { n.close(); } catch {}
        };
      } catch {}
    };
    if (Notification.permission === 'granted') show();
    else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => { if (permission === 'granted') show(); });
    }
  } catch {}
}
function notify(target, payload, fromUser) {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent('ims:notify', { detail: { target, payload, fromUser } }));
  } catch {}
  const key = notificationDedupeKey(target, payload);
  const lastSent = pushDedupeMemory.get(key) || 0;
  if (Date.now() - lastSent > NOTIFICATION_DEDUPE_MS) {
    pushDedupeMemory.set(key, Date.now());
    sendServerPushNotification(target, payload, fromUser);
  }
}
function formatNotifTime(iso, lang = 'id') {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const now = Date.now();
  const diff = now - d.getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (lang === 'id') {
    if (m < 1) return 'baru saja';
    if (m < 60) return `${m}m lalu`;
    if (h < 24) return `${h}j lalu`;
    if (days === 1) return 'kemarin';
    if (days < 7) return `${days}h lalu`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  } else {
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }
}

export { appendAuditLog, pushDedupeMemory, notificationDedupeKey, notificationContentKeyFromNotif, pruneNotifications, hasRecentDuplicateNotification, pushNotificationToList, isNotificationForUser, visibleNotificationsForUser, countUnreadNotifications, notificationTitle, requestNotificationPermission, triggerBrowserNotification, notify, formatNotifTime };

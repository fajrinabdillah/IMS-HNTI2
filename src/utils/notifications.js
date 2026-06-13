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
function isNotificationForUser(notif, session) {
  if (!session || !notif) return false;
  // super_admin (CEO) sees all — oversight
  if (session.role === 'super_admin') return true;
  // username-specific match
  if (notif.toUsername && notif.toUsername === session.username) return true;
  // role-broadcast match (no username constraint OR matching username)
  if (notif.toRole && notif.toRole === session.role) {
    if (!notif.toUsername || notif.toUsername === session.username) return true;
  }
  return false;
}
function countUnreadNotifications(notifications, session) {
  if (!Array.isArray(notifications)) return 0;
  return notifications.filter(n => !n.readAt && isNotificationForUser(n, session)).length;
}
function triggerBrowserNotification(payload = {}) {
  if (typeof window === 'undefined') return;
  try {
    if (navigator?.vibrate) navigator.vibrate([120, 40, 120]);
    if (!('Notification' in window)) return;
    const show = () => new Notification('IMS HNTI', {
      body: payload.message || 'Notifikasi baru',
      tag: payload.type || 'ims-hnti',
      icon: '/favicon.ico',
    });
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

export { appendAuditLog, pushDedupeMemory, notificationDedupeKey, pruneNotifications, hasRecentDuplicateNotification, pushNotificationToList, isNotificationForUser, countUnreadNotifications, triggerBrowserNotification, notify, formatNotifTime };

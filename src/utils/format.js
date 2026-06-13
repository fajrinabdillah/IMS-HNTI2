// Extracted from App.jsx during modular refactor.
function initialOf(name) {
  if (!name) return '?';
  const parts = String(name).trim().replace(/\(.*?\)/g, '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
const formatCurrency = (n, lang, rate) => {
  const isNeg = n < 0;
  const abs = Math.abs(n);
  const sign = isNeg ? '-' : '';
  if (lang === 'en') {
    const usd = abs / rate;
    if (usd >= 1e6) return `${sign}$${(usd / 1e6).toFixed(2)}M`;
    if (usd >= 1e3) return `${sign}$${(usd / 1e3).toFixed(1)}K`;
    return `${sign}$${usd.toFixed(0)}`;
  }
  if (abs >= 1e12) return `${sign}Rp ${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}Rp ${(abs / 1e9).toFixed(2)}M`;
  if (abs >= 1e6) return `${sign}Rp ${(abs / 1e6).toFixed(1)}Jt`;
  return `${sign}Rp ${abs.toLocaleString('id-ID')}`;
};
const formatCurrencyFull = (n, lang, rate) => {
  const isNeg = n < 0;
  const abs = Math.abs(n);
  const sign = isNeg ? '-' : '';
  return lang === 'en'
    ? `${sign}$${(abs / rate).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    : `${sign}Rp ${abs.toLocaleString('id-ID')}`;
};
const formatDateTime = (dateStr, lang = 'id') => {
  if (!dateStr) return '-';
  const raw = String(dateStr);
  const d = new Date(raw.length === 10 ? `${raw}T09:00:00` : raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const parseSafeDateMs = (value) => {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw || raw === '-' || raw.toLowerCase() === 'invalid date') return null;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T09:00:00` : raw;
  const ms = new Date(normalized).getTime();
  return Number.isFinite(ms) ? ms : null;
};
const dateOnlyFromValue = (value) => {
  const ms = parseSafeDateMs(value);
  if (ms === null) return '';
  return new Date(ms).toISOString().slice(0, 10);
};
const addDateOnlyDays = (value, days) => {
  const baseMs = parseSafeDateMs(value) ?? Date.now();
  const d = new Date(baseMs);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
const normalizeExternalUrl = (url) => {
  const clean = String(url || '').trim();
  if (!clean) return '';
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
};
function formatDuration(ms, lang = 'id') {
  if (!ms || ms < 0) return lang === 'id' ? '<1m' : '<1m';
  const sec = Math.floor(ms / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  if (lang === 'id') {
    if (days > 0) return `${days}h ${hours}j`;
    if (hours > 0) return `${hours}j ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return '<1m';
  } else {
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return '<1m';
  }
}
function inferMimeFromName(fileName = '') {
  const name = String(fileName).toLowerCase();
  if (name.endsWith('.pdf')) return 'application/pdf';
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.html') || name.endsWith('.htm')) return 'text/html';
  if (name.endsWith('.doc')) return 'application/msword';
  if (name.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (name.endsWith('.xls')) return 'application/vnd.ms-excel';
  if (name.endsWith('.xlsx')) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  return 'application/octet-stream';
}
function formatFileSize(bytes = 0) {
  const n = Number(bytes) || 0;
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return `${n} B`;
}
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
function safeDocFilename(value, fallback = 'Dokumen') {
  return String(value || fallback).replace(/[\/\\:*?"<>|]/g, '-').slice(0, 120);
}
const _normHdr = (h) => String(h || '').trim().toLowerCase().replace(/[\s._\-/]+/g, '');
function _num(v) {
  if (v == null || v === '') return 0;
  let s = String(v).replace(/[^0-9.,\-]/g, '').trim();
  if (s === '' || s === '-') return 0;
  // If both . and , present, assume . thousand & , decimal (ID) → keep digits only as integer currency
  if (s.includes('.') && s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if ((s.match(/,/g) || []).length === 1 && (s.match(/\./g) || []).length === 0) s = s.replace(',', '.');
  else s = s.replace(/,/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}
/** Start of local calendar day — use for PM/expiry comparisons instead of hardcoded dates. */
function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function currentYear() {
  return new Date().getFullYear();
}
/** Return sorted copy — never mutate memoized/state arrays in render. */
function sortCopy(arr, compareFn) {
  return [...arr].sort(compareFn);
}

function _normDate(v) {
  const s = String(v || '').trim();
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/); // dd/mm/yyyy or dd-mm-yyyy
  if (m) {
    let [, d, mo, y] = m; if (y.length === 2) y = '20' + y;
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  return s;
}

export { initialOf, formatCurrency, formatCurrencyFull, formatDateTime, parseSafeDateMs, dateOnlyFromValue, addDateOnlyDays, normalizeExternalUrl, formatDuration, inferMimeFromName, formatFileSize, escapeHtml, safeDocFilename, _normHdr, _num, _normDate, todayStart, currentYear, sortCopy };

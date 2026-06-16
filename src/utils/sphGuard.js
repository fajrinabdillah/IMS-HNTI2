// Proteksi dataset SPH: cegah seed demo (60 baris) menimpa impor produksi.
import { STORAGE_KEY } from '../constants/storageKeys.js';

export const SPH_HIGH_WATER_KEY = 'ims_hnti:sph_high_water';
export const SPH_PRODUCTION_LOCK_KEY = 'ims_hnti:sph_production_locked';
const SEED_SPH_NO_RE = /^SPH\/2026\/\d{3}$/i;
const PRODUCTION_MIN_ROWS = 100;

function hasLocalStorage() {
  try { return typeof window !== 'undefined' && !!window.localStorage; } catch { return false; }
}

/** Dataset demo bawaan app — pola nomor SPH/2026/001 … SPH/2026/060. */
export function isLikelySeedSphDataset(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return false;
  if (rows.length > 80) return false;
  const withNo = rows.filter(r => r && r.sphNo);
  if (!withNo.length) return false;
  const seedLike = withNo.filter(r => SEED_SPH_NO_RE.test(String(r.sphNo).trim())).length;
  return seedLike >= Math.min(withNo.length, 50) * 0.85;
}

export function getSphHighWaterMark() {
  try {
    if (hasLocalStorage()) {
      const n = parseInt(window.localStorage.getItem(SPH_HIGH_WATER_KEY), 10);
      if (Number.isFinite(n) && n > 0) return n;
    }
  } catch {}
  return 0;
}

export function getProductionSphLockCount() {
  try {
    if (hasLocalStorage()) {
      const n = parseInt(window.localStorage.getItem(SPH_PRODUCTION_LOCK_KEY), 10);
      if (Number.isFinite(n) && n >= PRODUCTION_MIN_ROWS) return n;
    }
  } catch {}
  return 0;
}

export function isProductionSphLocked() {
  return getProductionSphLockCount() >= PRODUCTION_MIN_ROWS;
}

export function setSphHighWaterMark(count) {
  const n = Math.max(0, Number(count) || 0);
  if (n <= 0) return;
  try {
    if (hasLocalStorage()) {
      const prev = getSphHighWaterMark();
      if (n > prev) window.localStorage.setItem(SPH_HIGH_WATER_KEY, String(n));
    }
  } catch {}
}

/** Kunci permanen: production SPH pernah ≥100 baris — seed demo tidak boleh timpa lagi. */
export function lockProductionSph(count) {
  const n = Math.max(0, Number(count) || 0);
  if (n < PRODUCTION_MIN_ROWS) return;
  setSphHighWaterMark(n);
  try {
    if (hasLocalStorage()) {
      const prev = getProductionSphLockCount();
      if (n > prev) window.localStorage.setItem(SPH_PRODUCTION_LOCK_KEY, String(n));
    }
  } catch {}
}

/** Jangan persist seed demo / snapshot regresi ke cloud/localStorage. */
export function shouldPersistSphData(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return false;
  if (isLikelySeedSphDataset(rows)) return false;
  const lock = getProductionSphLockCount();
  const hw = Math.max(getSphHighWaterMark(), lock);
  if (hw >= PRODUCTION_MIN_ROWS && rows.length < hw * 0.85) return false;
  return true;
}

export function shouldRejectStaleSphCloud(incoming, localCount = 0, sessionGuard = 0) {
  const inc = Array.isArray(incoming) ? incoming.length : 0;
  const guardCount = Math.max(sessionGuard || 0, localCount || 0, getSphHighWaterMark(), getProductionSphLockCount());
  if (!guardCount) return false;
  if (isLikelySeedSphDataset(incoming)) return true;
  if (guardCount >= PRODUCTION_MIN_ROWS && inc < PRODUCTION_MIN_ROWS) return true;
  if (inc >= guardCount - 2) return false;
  if (inc < guardCount * 0.85) return true;
  return false;
}

/** Lapisan terakhir: blokir storeSet/debouncedStoreSet untuk key SPH. */
export function guardSphStoreWrite(key, rawValue) {
  if (key !== STORAGE_KEY) return { ok: true };
  let rows;
  try {
    rows = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
  } catch {
    return { ok: false, reason: 'parse_error' };
  }
  if (!Array.isArray(rows)) return { ok: false, reason: 'not_array' };
  if (isLikelySeedSphDataset(rows)) {
    try { console.warn('[IMS] BLOKIR tulis seed demo SPH ke storage — data produksi dilindungi'); } catch {}
    return { ok: false, reason: 'seed_blocked' };
  }
  const lock = getProductionSphLockCount();
  if (lock >= PRODUCTION_MIN_ROWS && rows.length < lock * 0.85) {
    try { console.warn(`[IMS] BLOKIR tulis SPH regresi (${rows.length} < lock ${lock})`); } catch {}
    return { ok: false, reason: 'regression_blocked' };
  }
  return { ok: true };
}

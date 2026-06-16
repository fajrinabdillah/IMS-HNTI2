// Proteksi dataset SPH: cegah seed demo (60 baris) menimpa impor produksi.

export const SPH_HIGH_WATER_KEY = 'ims_hnti:sph_high_water';
const SEED_SPH_NO_RE = /^SPH\/2026\/\d{3}$/i;

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

/** Jangan persist seed demo ke cloud/localStorage — mencegah overwrite data produksi. */
export function shouldPersistSphData(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return false;
  if (isLikelySeedSphDataset(rows)) return false;
  const hw = getSphHighWaterMark();
  if (hw > 100 && rows.length < hw * 0.85) return false;
  return true;
}

export function shouldRejectStaleSphCloud(incoming, localCount = 0, sessionGuard = 0) {
  const inc = Array.isArray(incoming) ? incoming.length : 0;
  const guardCount = Math.max(sessionGuard || 0, localCount || 0, getSphHighWaterMark());
  if (!guardCount) return false;
  if (guardCount > 100 && isLikelySeedSphDataset(incoming)) return true;
  if (inc >= guardCount - 2) return false;
  if (inc < guardCount * 0.85) return true;
  return false;
}

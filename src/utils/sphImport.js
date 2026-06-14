// SPH bulk import — merge CSV rows into existing deal records (line-item aware).
import { normalizeSphProjects } from './sphProject.js';

function normPart(v) {
  return String(v ?? '').trim().toLowerCase();
}

/** Unique key per baris produk dalam satu SPH (No + pelanggan + modality + sub-modality). */
export function sphImportLineKey(rec) {
  return [rec.sphNo, rec.customer, rec.modality, rec.subModality].map(normPart).join('\u0001');
}

function buildImportRecord(rec, today) {
  return {
    ...rec,
    id: 'imp_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
    probability: rec.status === 'won' ? 100 : rec.status === 'lost' ? 0 : 50,
    poStatus: rec.stage === 'po_issued' ? 'issued' : null,
    dpPaid: false,
    finalPaid: false,
    shippingStatus: null,
    customsStatus: null,
    nextAction: '-',
    lastUpdate: today,
  };
}

/**
 * Gabungkan baris impor CSV ke data SPH yang ada.
 * - Satu SPH No bisa punya banyak baris (multi-produk) → dicocokkan per line key.
 * - Baris baru ditambah; baris yang sudah ada diperbarui (harga, status, catatan, dll.).
 */
export function mergeSphImportRecords(existingData, importRecords) {
  const today = new Date().toISOString().split('T')[0];
  const existing = Array.isArray(existingData) ? existingData : [];
  const rows = Array.isArray(importRecords) ? importRecords : [];

  const byLineKey = new Map();
  existing.forEach(s => {
    const key = sphImportLineKey(s);
    if (!byLineKey.has(key)) byLineKey.set(key, s);
  });

  const updates = new Map();
  const newOnes = [];
  let added = 0;
  let updated = 0;

  rows.forEach(rec => {
    const key = sphImportLineKey(rec);
    const match = byLineKey.get(key);
    if (match) {
      updates.set(match.id, { ...match, ...rec, id: match.id, lastUpdate: today });
      updated++;
      return;
    }
    const full = buildImportRecord(rec, today);
    newOnes.push(full);
    byLineKey.set(key, full);
    added++;
  });

  const merged = existing.map(s => (updates.has(s.id) ? updates.get(s.id) : s));
  const data = normalizeSphProjects([...merged, ...newOnes]);
  return { data, added, updated, total: rows.length };
}

// SPH bulk import — merge CSV rows into existing deal records (line-item aware).
import { normalizeSphProjects } from './sphProject.js';
import { normalizeSphStageId, defaultSphStageForStatus, resolveSalesOwnerId } from './domain.js';
import { SPH_PRODUCT_NORMALIZATION } from '../constants/sales.js';

function normPart(v) {
  return String(v ?? '').trim().toLowerCase();
}

/** Unique key per baris produk dalam satu SPH (No + pelanggan + modality + sub-modality + lokasi RS). */
export function sphImportLineKey(rec) {
  return [rec.sphNo, rec.customer, rec.modality, rec.subModality, rec.installSiteName].map(normPart).join('\u0001');
}

const IMPORT_SCALAR_FIELDS = [
  'customer', 'customerType', 'projectType', 'modality', 'subModality',
  'qty', 'unitPrice', 'totalValue', 'stage', 'status', 'region',
  'issuedDate', 'notes', 'nextAction', 'importSalesLabel',
  'installSiteName', 'installSiteAddress', 'installSiteRegion',
];

function normalizeImportedProductFields(rec) {
  const key = `${rec.modality}::${rec.subModality}`;
  const norm = SPH_PRODUCT_NORMALIZATION[key];
  if (!norm) return rec;
  return { ...rec, modality: norm.modality, subModality: norm.subModality };
}

function applyImportScalars(target, source) {
  const next = { ...target };
  for (const field of IMPORT_SCALAR_FIELDS) {
    const v = source[field];
    if (v !== undefined && v !== null && String(v).trim() !== '') next[field] = v;
  }
  return next;
}

function finalizeImportRecord(rec, employees, today) {
  const stage = normalizeSphStageId(rec.stage) || defaultSphStageForStatus(rec.status);
  const salesRaw = rec.importSalesLabel || rec.salesOwner;
  return normalizeImportedProductFields({
    ...rec,
    stage,
    salesOwner: resolveSalesOwnerId(salesRaw, employees),
    importSalesLabel: rec.importSalesLabel || salesRaw || '',
    lastUpdate: today,
  });
}

function buildImportRecord(rec, employees, today) {
  return finalizeImportRecord({
    ...rec,
    id: 'imp_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
    probability: rec.status === 'won' ? 100 : rec.status === 'lost' ? 0 : 50,
    poStatus: (normalizeSphStageId(rec.stage) === 'po_issued' || rec.status === 'won') ? 'issued' : null,
    dpPaid: false,
    finalPaid: false,
    shippingStatus: null,
    customsStatus: null,
    nextAction: rec.nextAction || '-',
  }, employees, today);
}

/**
 * Gabungkan baris impor CSV ke data SPH yang ada.
 * - Satu SPH No bisa punya banyak baris (multi-produk) → dicocokkan per line key.
 * - Baris baru ditambah; baris yang sudah ada diperbarui (harga, status, catatan, dll.).
 */
export function mergeSphImportRecords(existingData, importRecords, employees = {}) {
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
      const merged = finalizeImportRecord(applyImportScalars(match, rec), employees, today);
      updates.set(match.id, { ...merged, id: match.id });
      updated++;
      return;
    }
    const full = buildImportRecord(rec, employees, today);
    newOnes.push(full);
    byLineKey.set(key, full);
    added++;
  });

  const merged = existing.map(s => (updates.has(s.id) ? updates.get(s.id) : s));
  const data = normalizeSphProjects([...merged, ...newOnes]);
  return { data, added, updated, total: rows.length };
}

/** One-time heal for persisted SPH rows after CSV import (restore sales names → salesId). */
export function healSphSalesFromImportLabels(sphArray, employees = {}) {
  if (!Array.isArray(sphArray)) return sphArray;
  const today = new Date().toISOString().split('T')[0];
  return sphArray.map(s => {
    if (!s || typeof s !== 'object') return s;
    const patch = {
      importSalesLabel: s.importSalesLabel || s._reassignedToOffice?.from || s._autoReassigned?.from || '',
    };
    const merged = finalizeImportRecord(applyImportScalars(s, patch), employees, s.lastUpdate || today);
    if (merged.salesOwner === s.salesOwner && merged.modality === s.modality && merged.subModality === s.subModality && merged.stage === s.stage && merged.notes === s.notes) return s;
    return merged;
  });
}

// Multi-item SPH — form ↔ beberapa baris DB (harga terpisah atau paket).
import { sphPackageGroupKey } from './sphPackage.js';
import { sphProjectKey } from './sphProject.js';
import { resolveSalesOwnerId, syncSphRecordToProductMaster } from './domain.js';

export function projectKeyFor(rec) {
  return rec?.sphProjectKey || sphProjectKey(rec) || sphPackageGroupKey(rec);
}

/** Semua baris anggota proyek (nomor surat + pelanggan + tanggal). */
export function getProjectSiblings(allData, record) {
  if (!record) return [];
  const key = projectKeyFor(record);
  return (allData || []).filter(r => projectKeyFor(r) === key);
}

const SHARED_FORM_FIELDS = [
  'sphNo', 'customer', 'customerType', 'customerAddress', 'projectType',
  'issuedDate', 'salesOwner', 'region', 'status', 'stage', 'probability',
  'notes', 'nextAction', 'tenderSubStage',
  'customerSector', 'dealModel', 'paymentScheme', 'dpPercent', 'installmentMonths',
  'ksoYears', 'ksoInvestorPct',
  'poStatus', 'dpPaid', 'finalPaid',
];

function emptyLineItem() {
  return {
    id: null,
    productId: '',
    modality: '',
    subModality: '',
    brand: '',
    qty: 1,
    unitPrice: 0,
    totalValue: 0,
    installSiteName: '',
    installSiteAddress: '',
    installSiteRegion: '',
  };
}

/** Baris proyek — dari siblings DB atau field items[] legacy (1 record, banyak alat). */
function resolveProjectLines(primary, siblings) {
  const members = (siblings?.length ? siblings : [primary]).filter(Boolean);
  if (members.length > 1) return members;
  const rec = members[0];
  if (rec && Array.isArray(rec.items) && rec.items.length > 1) {
    return rec.items.map((it, idx) => ({
      ...rec,
      id: idx === 0 ? rec.id : null,
      productId: it.productId || rec.productId || '',
      modality: it.modality || rec.modality || '-',
      subModality: it.subModality || rec.subModality || '-',
      productBrand: it.brand || it.productBrand || rec.productBrand || '',
      brand: it.brand || it.productBrand || rec.brand || '',
      qty: Number(it.qty) || 1,
      unitPrice: Number(it.unitPrice) || 0,
      totalValue: Number(it.totalValue) || (Number(it.qty) || 1) * (Number(it.unitPrice) || 0),
    }));
  }
  return members;
}

/** Muat state form edit dari satu baris + saudara proyek. */
export function projectToFormState(primary, siblings, employees = {}) {
  const lines = resolveProjectLines(primary, siblings);
  const head = primary || lines[0] || {};
  const isPackage = head.pricingMode === 'package_primary'
    || (lines.length > 1 && lines.some(l => l.pricingMode === 'package_item'));

  const lineItems = lines.map(l => ({
    id: l.id,
    productId: l.productId || '',
    modality: l.modality || '',
    subModality: l.subModality || '',
    brand: l.productBrand || l.brand || '',
    qty: Number(l.qty) || 1,
    unitPrice: Number(l.unitPrice) || 0,
    totalValue: Number(l.totalValue) || 0,
    installSiteName: l.installSiteName || '',
    installSiteAddress: l.installSiteAddress || '',
    installSiteRegion: l.installSiteRegion || '',
  }));

  const shared = {};
  SHARED_FORM_FIELDS.forEach(f => { if (head[f] !== undefined) shared[f] = head[f]; });

  const packageTotal = isPackage
    ? (Number(head.packageTotalValue ?? head.totalValue) || 0)
    : 0;

  const first = lineItems[0] || emptyLineItem();
  return {
    ...shared,
    id: head.id,
    salesOwner: resolveSalesOwnerId(head.importSalesLabel || head.salesOwner, employees) || head.salesOwner || '',
    pricingMode: isPackage ? 'package' : 'itemized',
    packageTotal,
    lineItems: lineItems.length ? lineItems : [emptyLineItem()],
    modality: first.modality,
    subModality: first.subModality,
    qty: first.qty,
    unitPrice: first.unitPrice,
    totalValue: isPackage ? packageTotal : lineItems.reduce((s, it) => s + (Number(it.totalValue) || 0), 0),
    _projectLineIds: lines.map(l => l.id),
  };
}

function pickSharedFields(form) {
  const shared = {};
  SHARED_FORM_FIELDS.forEach(f => {
    if (form[f] !== undefined) shared[f] = form[f];
  });
  return shared;
}

function newLineId(idx) {
  return `sph_${Date.now().toString(36)}_${idx}_${Math.random().toString(36).slice(2, 5)}`;
}

/**
 * Pecah record lama yang menyimpan banyak alat di field `items` / `lineItems`
 * menjadi baris DB terpisah (satu alat = satu baris).
 */
export function expandEmbeddedSphLineItems(data) {
  if (!Array.isArray(data)) return data;
  const byProject = new Map();
  data.forEach(r => {
    const pk = sphPackageGroupKey(r);
    if (!byProject.has(pk)) byProject.set(pk, []);
    byProject.get(pk).push(r);
  });

  const out = [];
  const processed = new Set();

  for (const rec of data) {
    if (processed.has(rec.id)) continue;
    const pk = sphPackageGroupKey(rec);
    const members = byProject.get(pk) || [rec];
    const embedded = Array.isArray(rec.items) && rec.items.length > 1 ? rec.items : null;

    if (embedded && members.length === 1) {
      embedded.forEach((it, idx) => {
        const qty = Number(it.qty) || 1;
        const unitPrice = Number(it.unitPrice) || 0;
        const totalValue = Number(it.totalValue) || qty * unitPrice;
        const id = idx === 0 ? rec.id : newLineId(idx);
        processed.add(id);
        const row = {
          ...rec,
          id,
          productId: it.productId || rec.productId || '',
          modality: it.modality || rec.modality || '-',
          subModality: it.subModality || rec.subModality || '-',
          productBrand: it.brand || it.productBrand || rec.productBrand || '',
          brand: it.brand || it.productBrand || rec.brand || '',
          qty,
          unitPrice,
          totalValue,
          installSiteName: it.installSiteName || rec.installSiteName || '',
          installSiteAddress: it.installSiteAddress || rec.installSiteAddress || '',
          installSiteRegion: it.installSiteRegion || rec.installSiteRegion || '',
        };
        delete row.items;
        delete row.lineItems;
        out.push(row);
      });
      continue;
    }
    processed.add(rec.id);
    out.push(rec);
  }
  return out;
}

/**
 * Ubah payload form (multi-item) → array baris SPH siap persist.
 * pricingMode: 'itemized' (harga per alat) | 'package' (satu harga, sisanya 0).
 */
export function buildRecordsFromForm(form, { existingData = [], editingRecord = null, products = [], employees = {} } = {}) {
  const pricingMode = form.pricingMode === 'package' ? 'package' : 'itemized';
  const items = (Array.isArray(form.lineItems) ? form.lineItems : [])
    .filter(it => it && (String(it.subModality || '').trim() || String(it.modality || '').trim()));
  if (!items.length) {
    items.push({
      id: form.id || null,
      modality: form.modality,
      subModality: form.subModality,
      qty: form.qty,
      unitPrice: form.unitPrice,
      totalValue: form.totalValue,
      productId: form.productId,
      brand: form.productBrand || form.brand,
    });
  }

  const shared = pickSharedFields(form);
  shared.salesOwner = resolveSalesOwnerId(form.importSalesLabel || form.salesOwner, employees) || form.salesOwner || shared.salesOwner;
  shared.lastUpdate = form.lastUpdate || new Date().toISOString().split('T')[0];

  const oldSiblings = editingRecord ? getProjectSiblings(existingData, editingRecord) : [];
  const oldById = new Map(oldSiblings.map(s => [s.id, s]));

  const packageTotal = Number(form.packageTotal ?? form.totalValue) || 0;

  const records = items.map((item, idx) => {
    const qty = Number(item.qty) || 1;
    let unitPrice = Number(item.unitPrice) || 0;
    let totalValue = Number(item.totalValue) || qty * unitPrice;

    if (pricingMode === 'package') {
      if (idx === 0) {
        totalValue = packageTotal;
        unitPrice = qty > 0 ? packageTotal / qty : packageTotal;
      } else {
        unitPrice = 0;
        totalValue = 0;
      }
    }

    const id = (item.id && oldById.has(item.id))
      ? item.id
      : (editingRecord && idx === 0 ? editingRecord.id : newLineId(idx));
    const preserved = oldById.get(id) || {};

    const row = syncSphRecordToProductMaster({
      ...preserved,
      ...shared,
      id,
      productId: item.productId || preserved.productId || '',
      productBrand: item.brand || item.productBrand || preserved.productBrand || '',
      brand: item.brand || preserved.brand || '',
      modality: item.modality || preserved.modality || '-',
      subModality: item.subModality || preserved.subModality || '-',
      qty,
      unitPrice,
      totalValue,
      installSiteName: item.installSiteName ?? preserved.installSiteName ?? '',
      installSiteAddress: item.installSiteAddress ?? preserved.installSiteAddress ?? '',
      installSiteRegion: item.installSiteRegion ?? preserved.installSiteRegion ?? '',
      shippingStatus: preserved.shippingStatus ?? null,
      customsStatus: preserved.customsStatus ?? null,
      installationStatus: preserved.installationStatus,
      stage: preserved.stage ?? shared.stage,
      status: preserved.status ?? shared.status,
      probability: preserved.probability ?? shared.probability,
    }, products);
    delete row.items;
    delete row.lineItems;
    return row;
  });

  return {
    records,
    removedIds: oldSiblings.map(s => s.id).filter(id => !records.some(r => r.id === id)),
  };
}

export function isMultiItemForm(form) {
  return (Array.isArray(form.lineItems) && form.lineItems.length > 1) || form.pricingMode === 'package';
}

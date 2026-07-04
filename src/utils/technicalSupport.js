/** Shared helpers for Technical Support (Instalasi + Maintenance). */
import { getInstallSiteName, getPayerCustomer, matchesSphUnit } from './sphSite.js';

function normUnitPart(v) {
  return String(v || '').trim().toLowerCase();
}

/** Kunci unik per unit terinstal — lokasi RS + produk + nomor SPH. */
function technicalUnitKey(r) {
  const site = getInstallSiteName(r);
  const parts = [site, r?.modality, r?.subModality];
  if (r?.sphNo) parts.push(r.sphNo);
  return parts.map(normUnitPart).join('|');
}

/** Kunci lookup per baris SPH — nama RS boleh beda (rekanan vs lokasi instalasi). */
function sphUnitCompositeKey(r) {
  if (!r?.sphNo || !r?.modality) return '';
  return ['sph', r.sphNo, r.modality, r.subModality || ''].map(normUnitPart).join('|');
}

/** Kunci pipeline instalasi — prioritaskan composite SPH bila ada. */
function installProjectLookupKey(r) {
  const composite = sphUnitCompositeKey(r);
  if (composite) return composite;
  return technicalUnitKey(r);
}

/** Kunci lookup: spesifik sphNo dulu, lalu legacy tanpa sphNo (data lama). */
function technicalUnitLookupKeys(r) {
  const site = getInstallSiteName(r);
  const legacy = [site, r?.modality, r?.subModality].map(normUnitPart).join('|');
  const keys = [];
  const composite = sphUnitCompositeKey(r);
  if (composite) keys.push(composite);
  if (r?.sphNo) keys.push(technicalUnitKey(r));
  if (r?.id) keys.push([site, r.modality, r.subModality, r.sphNo, r.id].map(normUnitPart).join('|'));
  if (legacy) keys.push(legacy);
  return [...new Set(keys)];
}

function buildTechnicalUnitMap(records) {
  const map = new Map();
  (records || []).forEach(r => {
    technicalUnitLookupKeys(r).forEach(k => {
      if (!map.has(k)) map.set(k, r);
    });
  });
  return map;
}

function getTechnicalUnitRecord(map, r) {
  if (!map || !r) return null;
  for (const k of technicalUnitLookupKeys(r)) {
    if (map.has(k)) return map.get(k);
  }
  return null;
}

function unitsMatch(a, b) {
  if (!a || !b) return false;
  const keysA = new Set(technicalUnitLookupKeys(a));
  return technicalUnitLookupKeys(b).some(k => keysA.has(k));
}

function formatTechnicalUnitLabel(u) {
  const mod = [u?.subModality, u?.modality].filter(Boolean).join(' · ') || '-';
  const site = getInstallSiteName(u);
  const base = `${site} — ${mod}`;
  return u?.sphNo ? `${base} · ${u.sphNo}` : base;
}

function findSphLineForUnit(data, unit) {
  const list = data || [];
  if (!unit) return null;
  const lineId = unit.sphLineId || unit.sphId || null;
  if (lineId) {
    const byId = list.find(s => s.id === lineId);
    if (byId) return byId;
  }
  if (unit.sphNo) {
    const exact = list.find(s => matchesSphUnit(s, unit));
    if (exact) return exact;
  }
  return list.find(s => matchesSphUnit(s, unit))
    || list.find(s => normUnitPart(s.customer) === normUnitPart(unit?.customer)
      && normUnitPart(s.subModality || '') === normUnitPart(unit?.subModality || '')
      && normUnitPart(s.modality || '') === normUnitPart(unit?.modality || ''))
    || null;
}

function findBapetenRecordForUnit(regRecords, unit) {
  const issued = (regRecords || []).filter(r => r.stage === 'issued' || !!r.issuedDate);
  const site = getInstallSiteName(unit);
  const matchFull = (r) => normUnitPart(r.customer) === normUnitPart(site)
    && normUnitPart(r.subModality || r.product || '') === normUnitPart(unit?.subModality || '')
    && normUnitPart(r.modality || '') === normUnitPart(unit?.modality || '');
  return issued.find(matchFull)
    || issued.find(r => normUnitPart(r.customer) === normUnitPart(site)
      && normUnitPart(r.modality || '') === normUnitPart(unit?.modality || '')
      && normUnitPart(r.subModality || r.product || '') === normUnitPart(unit?.subModality || ''))
    || null;
}

function enrichDeliveredUnitFromSph(sphLine) {
  if (!sphLine) return null;
  return {
    id: sphLine.id,
    customer: getInstallSiteName(sphLine),
    payerCustomer: getPayerCustomer(sphLine),
    installSiteName: sphLine.installSiteName || '',
    installSiteAddress: sphLine.installSiteAddress || '',
    sphLineId: sphLine.id,
    modality: sphLine.modality,
    subModality: sphLine.subModality || '',
    sphNo: sphLine.sphNo,
    sphProjectKey: sphLine.sphProjectKey || null,
    sphRef: sphLine.sphNo,
    label: formatTechnicalUnitLabel(sphLine),
  };
}

function groupRecordsBySphProject(records, resolveMeta) {
  const map = new Map();
  (records || []).forEach(r => {
    const meta = resolveMeta(r) || {};
    const key = meta.sphProjectKey || [meta.sphNo, meta.customer].filter(Boolean).join('\u0001') || r.id;
    if (!map.has(key)) {
      map.set(key, { key, customer: meta.customer || r.customer, sphNo: meta.sphNo || r.sphNo, items: [] });
    }
    map.get(key).items.push(r);
  });
  return [...map.values()].map(g => ({ ...g, isMultiItem: g.items.length > 1 }));
}

function addMonthsIso(isoDate, months) {
  const base = isoDate ? new Date(isoDate + 'T00:00:00') : new Date();
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

function isValidTechnicianName(name, employees = {}, liveTechnicians = []) {
  if (!name) return false;
  if (liveTechnicians.includes(name)) return true;
  return Object.values(employees).some(e => e?.role === 'technician' && e.active !== false && e.name === name);
}

/** Return name if valid technician, else first live tech or empty string. */
function healTechnicianName(name, liveTechnicians = [], employees = {}) {
  if (isValidTechnicianName(name, employees, liveTechnicians)) return name;
  return liveTechnicians[0] || '';
}

function getTechnicianOptions(employees = {}, liveTechnicians = []) {
  if (liveTechnicians.length) return liveTechnicians;
  return Object.values(employees)
    .filter(e => e?.role === 'technician' && e.active !== false)
    .map(e => e.name);
}

function defaultTechnician(liveTechnicians = []) {
  return liveTechnicians[0] || '';
}

/**
 * Merge base installed units with pmSchedule state so PM dates react to mark-done / delete.
 * Uses the latest `done` PM record per unit (by lastPmDate).
 * Idempotent: safe if baseUnits were already merged.
 */
function mergeUnitsWithPmSchedule(baseUnits = [], pmSchedule = []) {
  const latestDoneByUnit = new Map();
  for (const pm of pmSchedule) {
    if (!pm?.unitId || pm.status !== 'done') continue;
    const prev = latestDoneByUnit.get(pm.unitId);
    const prevTs = prev?.lastPmDate ? new Date(prev.lastPmDate + 'T00:00:00').getTime() : 0;
    const curTs = pm.lastPmDate ? new Date(pm.lastPmDate + 'T00:00:00').getTime() : 0;
    if (!prev || curTs >= prevTs) latestDoneByUnit.set(pm.unitId, pm);
  }

  return baseUnits.map(u => {
    const pm = latestDoneByUnit.get(u.id);
    if (!pm) {
      // Strip stale merge flags if PM record was deleted
      const { pmCompleted, ...rest } = u;
      return rest;
    }
    const lastPmDate = pm.lastPmDate || u.lastPmDate;
    const nextPmDate = pm.nextPmDate || addMonthsIso(lastPmDate, 6);
    return { ...u, lastPmDate, nextPmDate, pmCompleted: true, _pmRecordId: pm.id };
  });
}

/** PM notification cycles already marked done (unitId|dueDate). */
function pmDoneCycleKeys(pmSchedule = []) {
  return new Set(
    pmSchedule
      .filter(p => p.status === 'done' && p.unitId && p.dueDate)
      .map(p => `${p.unitId}|${p.dueDate}`)
  );
}

/** Migrate legacy installation/maintenance module IDs in CEO access overrides. */
function migrateModuleAccess(access = {}) {
  const next = {};
  for (const [user, mods] of Object.entries(access)) {
    if (!Array.isArray(mods)) {
      next[user] = mods;
      continue;
    }
    const set = new Set(mods);
    if (set.has('installation') || set.has('maintenance')) {
      set.delete('installation');
      set.delete('maintenance');
      set.add('technical_support');
    }
    next[user] = [...set];
  }
  return next;
}

/** Normalisasi record teknisi agar cocok dengan baris SPH & status pipeline konsisten. */
function healTechnicalSupportRecord(rec, sphData = [], bastRecords = [], trainingRecords = []) {
  if (!rec) return rec;
  const sph = findSphLineForUnit(sphData, rec);
  let next = { ...rec };
  if (sph) {
    const site = getInstallSiteName(sph);
    if (site && normUnitPart(next.customer) !== normUnitPart(site)) next = { ...next, customer: site };
    if (!next.sphLineId && sph.id) next = { ...next, sphLineId: sph.id };
    if (!next.sphNo && sph.sphNo) next = { ...next, sphNo: sph.sphNo };
    if (!next.modality && sph.modality) next = { ...next, modality: sph.modality };
    if (!next.subModality && sph.subModality) next = { ...next, subModality: sph.subModality };
  }
  const bastMap = buildTechnicalUnitMap(bastRecords);
  const trainMap = buildTechnicalUnitMap(trainingRecords);
  const bast = getTechnicalUnitRecord(bastMap, next);
  const train = getTechnicalUnitRecord(trainMap, next);
  const bastDone = !!(bast && (bast.status === 'signed' || bast.signedDate));
  const trainDone = !!(train && train.status === 'completed');
  const norm = `${next.modality || ''} ${next.subModality || ''}`.toLowerCase();
  const skipRadiation = ['flat panel detector', 'mri', 'eswl'].some(p => norm.includes(p));
  const radiationDone = skipRadiation || (!!next.exposureTest && !!next.complianceTest);
  if (next.status !== 'completed' && next.calibrationDone && bastDone && trainDone && radiationDone) {
    next = { ...next, status: 'completed' };
  }
  return next;
}

function healTechnicalSupportCollection(records, sphData, bastRecords, trainingRecords) {
  return (records || []).map(r => healTechnicalSupportRecord(r, sphData, bastRecords, trainingRecords));
}

export {
  normUnitPart,
  technicalUnitKey,
  sphUnitCompositeKey,
  installProjectLookupKey,
  technicalUnitLookupKeys,
  buildTechnicalUnitMap,
  getTechnicalUnitRecord,
  unitsMatch,
  formatTechnicalUnitLabel,
  findSphLineForUnit,
  findBapetenRecordForUnit,
  enrichDeliveredUnitFromSph,
  groupRecordsBySphProject,
  addMonthsIso,
  isValidTechnicianName,
  healTechnicianName,
  getTechnicianOptions,
  defaultTechnician,
  mergeUnitsWithPmSchedule,
  migrateModuleAccess,
  pmDoneCycleKeys,
  healTechnicalSupportRecord,
  healTechnicalSupportCollection,
};

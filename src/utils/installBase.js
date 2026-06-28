import { INSTALL_BASE_PROVINCE_SUMMARY, INSTALL_BASE_SEED_RECORDS } from '../data/installBaseSeed.js';

const PROVINCE_COORDS = {
  'Aceh': { lat: 4.6951, lng: 96.7494 },
  'Bali': { lat: -8.4095, lng: 115.1889 },
  'Bangka Belitung': { lat: -2.7411, lng: 106.4406 },
  'Banten': { lat: -6.4058, lng: 106.0640 },
  'DKI Jakarta': { lat: -6.2088, lng: 106.8456 },
  'Jambi': { lat: -1.6101, lng: 103.6131 },
  'Jawa Barat': { lat: -6.9175, lng: 107.6191 },
  'Jawa Tengah': { lat: -7.1500, lng: 110.1403 },
  'Jawa Timur': { lat: -7.5361, lng: 112.2384 },
  'Lampung': { lat: -4.5586, lng: 105.4068 },
  'Maluku Utara': { lat: 1.5709, lng: 127.8088 },
  'Nusa Tenggara Timur': { lat: -8.6574, lng: 121.0794 },
  'Riau': { lat: 0.2933, lng: 101.7068 },
  'Sumatera Selatan': { lat: -3.3194, lng: 103.9144 },
  'Sumatera Utara': { lat: 2.1154, lng: 99.5451 },
  'Sulawesi Utara': { lat: 0.6247, lng: 123.9750 },
  'Gorontalo': { lat: 0.6999, lng: 122.4467 },
};

const AUTHORITATIVE_PRODUCT_FAMILY_TOTALS = [
  { name: 'FPD', qty: 88 },
  { name: 'Portable X-Ray', qty: 58 },
  { name: 'Stationary X-Ray', qty: 26 },
  { name: 'Mobile X-Ray', qty: 16 },
  { name: 'CT Scan', qty: 7 },
  { name: 'C-Arm', qty: 5 },
  { name: 'ESWL', qty: 3 },
];

const KNOWN_SITE_COORDS = {
  'rsia andini': { lat: 0.5115, lng: 101.4246 },
  'rsi nashrul ummah': { lat: -7.1166, lng: 112.4162 },
  'rsi nashrul ummah lamongan': { lat: -7.1166, lng: 112.4162 },
  'rs nashrul ummah': { lat: -7.1166, lng: 112.4162 },
  'rs nashrul ummah lamongan': { lat: -7.1166, lng: 112.4162 },
  'rs nashrul': { lat: -7.1166, lng: 112.4162 },
  'rsud pratama adonara': { lat: -8.3242, lng: 123.1645 },
  'rs pratama kubu': { lat: -8.2530, lng: 115.5570 },
  'rs shanti graha': { lat: -8.1917, lng: 114.9499 },
  'dr yanti health center - bali': { lat: -8.7210, lng: 115.1766 },
  'rsu bangli': { lat: -8.4542, lng: 115.3549 },
  'rsu bunda jembrana': { lat: -8.3614, lng: 114.6256 },
  'rsud otanaha': { lat: 0.5460, lng: 123.0332 },
  'rsud dr. irwan bokings': { lat: 0.5815, lng: 122.5578 },
  'rsud dr irwan bokings': { lat: 0.5815, lng: 122.5578 },
};

const PROVINCE_ALIASES = {
  'jabar': 'Jawa Barat',
  'jawa barat': 'Jawa Barat',
  'jateng': 'Jawa Tengah',
  'jawa tengah': 'Jawa Tengah',
  'jatim': 'Jawa Timur',
  'jawa timur': 'Jawa Timur',
  'jakarta': 'DKI Jakarta',
  'dki jakarta': 'DKI Jakarta',
  'sumut': 'Sumatera Utara',
  'sumatera utara': 'Sumatera Utara',
  'sumsel': 'Sumatera Selatan',
  'sumatera selatan': 'Sumatera Selatan',
  'ntt': 'Nusa Tenggara Timur',
  'nusa tenggara timur': 'Nusa Tenggara Timur',
  'babel': 'Bangka Belitung',
  'bangka belitung': 'Bangka Belitung',
};

function norm(v) {
  return String(v || '').trim().toLowerCase();
}

function isCorporatePayerName(value = '') {
  const text = norm(value).replace(/\./g, '').replace(/\s+/g, ' ');
  return text === 'pt mitra inti medika';
}

function isCorporatePayerRecord(record = {}) {
  const siteName = String(record.hospitalName || record.installSiteName || '').trim();
  if (siteName) return isCorporatePayerName(siteName);
  return [record.customer, record.payerCustomer].some(isCorporatePayerName);
}

function canonicalHospitalName(value = '') {
  const raw = String(value || '').trim();
  const text = norm(raw);
  if (text.includes('nashrul')) return 'RSI Nashrul Ummah Lamongan';
  if (text.includes('pratama adonara')) return 'RSUD Pratama Adonara';
  return raw;
}

function mapLocationKey(record = {}) {
  return `${norm(canonicalHospitalName(record.hospitalName))}|${record.province || ''}`;
}

function hash01(input) {
  let h = 2166136261;
  for (const ch of String(input || '')) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

function normalizeProvince(value = '') {
  const raw = norm(value);
  if (!raw) return '';
  if (PROVINCE_ALIASES[raw]) return PROVINCE_ALIASES[raw];
  const found = Object.keys(PROVINCE_COORDS).find(p => norm(p) === raw || raw.includes(norm(p)));
  return found || value;
}

function inferProvince(record = {}) {
  const hospital = norm(record.hospitalName || record.installSiteName || record.customer);
  if (hospital.includes('nashrul')) return 'Jawa Timur';
  const fields = [record.province, record.installSiteRegion, record.region, record.address, record.customerAddress, record.installSiteAddress].filter(Boolean);
  for (const field of fields) {
    const text = norm(field);
    const direct = normalizeProvince(text);
    if (PROVINCE_COORDS[direct]) return direct;
    const hit = Object.keys(PROVINCE_COORDS).find(p => text.includes(norm(p)));
    if (hit) return hit;
    if (text.includes('lamongan')) return 'Jawa Timur';
  }
  return '';
}

function coordinatesFor(record = {}) {
  const canonical = canonicalHospitalName(record.hospitalName || record.installSiteName || record.customer);
  const known = KNOWN_SITE_COORDS[norm(canonical)];
  if (known) return { ...known, precision: 'known-site' };
  if (Number.isFinite(Number(record.lat)) && Number.isFinite(Number(record.lng))) {
    return { lat: Number(record.lat), lng: Number(record.lng), precision: 'exact' };
  }
  if (Number.isFinite(Number(record.latitude)) && Number.isFinite(Number(record.longitude))) {
    return { lat: Number(record.latitude), lng: Number(record.longitude), precision: 'exact' };
  }
  const province = inferProvince(record);
  const base = PROVINCE_COORDS[province] || { lat: -2.5, lng: 118 };
  const key = [record.hospitalName, record.customer, record.product, record.type, record.sphNo].filter(Boolean).join('|');
  const jitterScale = province === 'Gorontalo' ? 0.18 : 1;
  const latJitter = (hash01(key + 'lat') - 0.5) * 0.9 * jitterScale;
  const lngJitter = (hash01(key + 'lng') - 0.5) * 1.4 * jitterScale;
  return { lat: base.lat + latJitter, lng: base.lng + lngJitter, precision: province ? 'province-estimated' : 'estimated' };
}

function productFamily(product = '', type = '') {
  const text = `${product} ${type}`.toLowerCase();
  if (text.includes('eswl')) return 'ESWL';
  if (text.includes('ct') || text.includes('anatom') || text.includes('dominus')) return 'CT Scan';
  if (text.includes('c-arm') || text.includes('garion')) return 'C-Arm';
  if (text.includes('retro comfort')) return 'FPD';
  if (text.includes('fpd') || text.includes('venu')) return 'FPD';
  if (text.includes('mobile')) return 'Mobile X-Ray';
  if (text.includes('portable') || text.includes('remex')) return 'Portable X-Ray';
  if (text.includes('pxr')) return 'Generator PXR';
  if (text.includes('x-ray') || text.includes('jumong') || text.includes('109x')) return 'Stationary X-Ray';
  return product || 'Other';
}

function unitKey(record = {}) {
  return [record.hospitalName || record.customer, record.product, record.type, record.sphNo].map(norm).join('|');
}

function normalizeInstallBaseRecord(record, source = 'manual') {
  const hospitalName = canonicalHospitalName(record.hospitalName || record.installSiteName || record.customer || '-');
  const province = inferProvince({ ...record, hospitalName }) || normalizeProvince(record.province || '');
  const coords = coordinatesFor({ ...record, hospitalName, province });
  const product = record.product || record.modality || record.subModality || 'Unknown';
  const type = record.type || record.subModality || record.productBrand || record.brand || '';
  return {
    id: record.id || `ib_${source}_${Math.random().toString(36).slice(2, 9)}`,
    hospitalName,
    address: record.address || record.installSiteAddress || record.customerAddress || '',
    province,
    city: record.city || record.destinationCity || (hospitalName.includes('Nashrul') ? 'Lamongan' : ''),
    product,
    type,
    productFamily: productFamily(product, type),
    quantity: Number(record.quantity ?? record.qty) || 1,
    installationYear: Number(record.installationYear) || Number(String(record.installationDate || record.bastDate || record.clientReceivedAt || record.issuedDate || '').slice(0, 4)) || null,
    installationDate: record.installationDate || record.bastDate || record.clientReceivedAt || '',
    source,
    bastId: record.bastId || record.bastNo || '',
    sphNo: record.sphNo || record.sphRef || '',
    status: record.status || 'active',
    lat: coords.lat,
    lng: coords.lng,
    coordinatePrecision: coords.precision,
  };
}

function isArrivedAtHospital(row = {}) {
  return row.shippingStatus === 'client_received'
    || row.localDeliveryStatus === 'delivered_to_rs'
    || row.sphWorkflowStatus === 'goods_received_client'
    || !!row.clientReceivedAt;
}

function fromOperationalRows(data = []) {
  return (data || []).filter(row => {
    if (!isArrivedAtHospital(row)) return false;
    if (isCorporatePayerRecord(row)) return false;
    const site = String(row.installSiteName || '').trim();
    const customer = String(row.customer || '').trim();
    if (!site && /^pt\.?\s+/i.test(customer)) return false;
    if (/^pt\.?\s+/i.test(site)) return false;
    return true;
  }).map(row => normalizeInstallBaseRecord({
    id: `ib_ops_${row.id}`,
    hospitalName: row.installSiteName || row.customer,
    address: row.installSiteAddress || row.customerAddress,
    province: row.installSiteRegion || row.region,
    product: row.modality,
    type: row.subModality,
    quantity: row.qty || 1,
    installationDate: row.clientReceivedAt || row.bastDate || '',
    installationYear: row.clientReceivedAt ? String(row.clientReceivedAt).slice(0, 4) : row.issuedDate?.slice?.(0, 4),
    sphNo: row.sphNo,
    lat: row.lat,
    lng: row.lng,
  }, 'ops_arrived_rs'));
}

function fromBastRecords(bastRecords = []) {
  return (bastRecords || [])
    .filter(r => ['signed', 'completed', 'final'].includes(r.status) || r.signedAt || r.bastDate)
    .filter(r => !isCorporatePayerRecord(r))
    .filter(r => !/^pt\.?\s+/i.test(String(r.customer || r.installSiteName || '').trim()))
    .map(r => normalizeInstallBaseRecord({
      id: `ib_bast_${r.id}`,
      hospitalName: r.customer,
      address: r.location || r.address,
      province: r.province || r.region,
      product: r.modality,
      type: r.subModality || r.product,
      quantity: r.qty || 1,
      installationDate: r.bastDate || r.signedAt || r.date,
      sphNo: r.sphNo,
      bastId: r.bastNo || r.id,
      lat: r.lat,
      lng: r.lng,
    }, 'bast_sync'));
}

function dedupeInstallBase(records = []) {
  const map = new Map();
  records.forEach(record => {
    if (isCorporatePayerRecord(record)) return;
    const normalized = normalizeInstallBaseRecord(record, record.source || 'manual');
    if (isCorporatePayerRecord(normalized)) return;
    const key = unitKey(normalized);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, normalized);
      return;
    }
    map.set(key, {
      ...existing,
      ...normalized,
      quantity: Math.max(Number(existing.quantity) || 1, Number(normalized.quantity) || 1),
      source: existing.source === normalized.source ? existing.source : `${existing.source}+${normalized.source}`,
    });
  });
  return [...map.values()];
}

function buildInstallBase(data = [], bastRecords = [], installRecords = [], manualRecords = []) {
  const baseline = INSTALL_BASE_SEED_RECORDS.map(r => normalizeInstallBaseRecord(r, 'pdf_import'));
  const live = [...fromOperationalRows(data), ...fromBastRecords(bastRecords), ...fromBastRecords(installRecords)];
  const manual = (manualRecords || []).map(r => normalizeInstallBaseRecord(r, 'manual'));
  return dedupeInstallBase([...baseline, ...live, ...manual]);
}

function installBaseStats(records = []) {
  const baselineTotal = INSTALL_BASE_PROVINCE_SUMMARY.reduce((s, p) => s + p.qty, 0);
  const liveExtra = records.filter(r => r.source !== 'pdf_import').reduce((s, r) => s + (Number(r.quantity) || 1), 0);
  const totalUnits = baselineTotal;
  const byProvince = new Map(INSTALL_BASE_PROVINCE_SUMMARY.map(p => [p.province, { province: p.province, qty: p.qty, lat: PROVINCE_COORDS[p.province]?.lat, lng: PROVINCE_COORDS[p.province]?.lng }]));
  records.forEach(r => {
    if (!r.province) return;
    if (!byProvince.has(r.province)) byProvince.set(r.province, { province: r.province, qty: 0, lat: r.lat, lng: r.lng });
    const e = byProvince.get(r.province);
    if (r.source !== 'pdf_import') e.qty += Number(r.quantity) || 1;
  });
  const family = new Map(AUTHORITATIVE_PRODUCT_FAMILY_TOTALS.map(x => [x.name, x.qty]));
  return {
    baselineTotal,
    liveExtra,
    totalUnits,
    provinceCount: byProvince.size,
    hospitalCount: new Set(records.map(r => norm(r.hospitalName)).filter(Boolean)).size,
    byProvince: [...byProvince.values()].sort((a, b) => b.qty - a.qty),
    byProductFamily: [...family.entries()].map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty),
  };
}

export {
  INSTALL_BASE_PROVINCE_SUMMARY,
  AUTHORITATIVE_PRODUCT_FAMILY_TOTALS,
  PROVINCE_COORDS,
  canonicalHospitalName,
  mapLocationKey,
  normalizeInstallBaseRecord,
  buildInstallBase,
  installBaseStats,
  productFamily,
};

// Lokasi instalasi vs penanggung jawab pembayaran (rekanan multi-RS).
function normPart(v) {
  return String(v ?? '').trim().toLowerCase();
}

export function getPayerCustomer(rec) {
  return String(rec?.customer || '').trim();
}

/** RS / lokasi pemasangan — fallback ke pelanggan jika kosong. */
export function getInstallSiteName(rec) {
  const site = String(rec?.installSiteName || '').trim();
  return site || getPayerCustomer(rec);
}

export function getInstallSiteAddress(rec) {
  return String(rec?.installSiteAddress || '').trim();
}

export function getInstallSiteRegion(rec) {
  return String(rec?.installSiteRegion || rec?.region || '').trim();
}

export function isMultiSiteLine(rec) {
  const site = String(rec?.installSiteName || '').trim();
  const payer = getPayerCustomer(rec);
  return !!site && normPart(site) !== normPart(payer);
}

export function isMultiSiteProject(lines) {
  return (lines || []).some(isMultiSiteLine);
}

export function countDistinctInstallSites(lines) {
  const set = new Set((lines || []).map(l => normPart(getInstallSiteName(l))).filter(Boolean));
  return set.size;
}

/** Label operasional / instalasi / perizinan. */
export function formatOpsSiteLabel(rec, lang = 'id') {
  if (!rec) return '-';
  if (isMultiSiteLine(rec)) return getInstallSiteName(rec);
  return getPayerCustomer(rec) || '-';
}

/** Label lengkap: RS tujuan · via rekanan. */
export function formatSiteWithPayer(rec, lang = 'id') {
  if (!rec) return '-';
  const payer = getPayerCustomer(rec);
  const site = String(rec?.installSiteName || '').trim();
  if (isMultiSiteLine(rec)) {
    return lang === 'id' ? `${site} · via ${payer}` : `${site} · via ${payer}`;
  }
  return payer || site || '-';
}

/** Cocokkan baris SPH dengan unit instalasi / record regulatory. */
export function matchesSphUnit(sphLine, unit) {
  if (!sphLine || !unit) return false;
  const lineId = unit.sphLineId || unit.sphId || (unit.id && String(unit.id).startsWith('sph_') ? unit.id : null);
  if (lineId && sphLine.id === lineId) return true;

  const unitSite = String(unit.installSiteName || unit.customer || '').trim();
  const lineSite = getInstallSiteName(sphLine);
  const siteOk = normPart(lineSite) === normPart(unitSite);
  const modOk = normPart(sphLine.modality) === normPart(unit.modality);
  const subOk = normPart(sphLine.subModality || '') === normPart(unit.subModality || unit.product || '');
  const sphOk = !unit.sphNo || normPart(sphLine.sphNo) === normPart(unit.sphNo);
  const payerOk = !unit.payerCustomer
    || normPart(getPayerCustomer(sphLine)) === normPart(unit.payerCustomer);

  return siteOk && modOk && subOk && sphOk && payerOk;
}

export function findSphLineByUnit(data, unit) {
  const list = data || [];
  if (!unit) return null;
  const lineId = unit.sphLineId || unit.sphId || null;
  if (lineId) {
    const byId = list.find(s => s.id === lineId);
    if (byId) return byId;
  }
  return list.find(s => matchesSphUnit(s, unit)) || null;
}

/** Teks pencarian — pelanggan + lokasi RS. */
export function sphSiteSearchText(rec) {
  return [
    getPayerCustomer(rec),
    rec?.installSiteName,
    rec?.installSiteAddress,
    rec?.installSiteRegion,
    rec?.sphNo,
    rec?.modality,
    rec?.subModality,
  ].filter(Boolean).join(' ').toLowerCase();
}

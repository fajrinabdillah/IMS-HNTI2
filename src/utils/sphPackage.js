// Package pricing — satu nomor SPH, beberapa item alat, satu harga paket.

function normPart(v) {
  return String(v ?? '').trim().toLowerCase();
}

/** Group key: nomor surat + pelanggan + tanggal terbit. */
export function sphPackageGroupKey(rec) {
  return [rec.sphNo, rec.customer, rec.issuedDate].map(normPart).join('\u0001');
}

function clearPackageFields(rec) {
  const next = { ...rec, pricingMode: 'standalone', packageGroupKey: null, packageTotalValue: null, packagePrimaryId: null };
  delete next.packageComponentIds;
  return next;
}

function pricedValue(rec) {
  return Number(rec.totalValue) || Number(rec.unitPrice) || 0;
}

/**
 * Deteksi & tandai baris paket:
 * - package_primary: baris berharga utama (harga paket)
 * - package_item: item ikutan tanpa harga terpisah
 * - standalone: penawaran biasa / alternatif harga dalam grup yang sama
 */
export function applyPackagePricing(records) {
  if (!Array.isArray(records)) return records;
  const list = records.map(r => ({ ...r }));

  const groups = new Map();
  list.forEach((r, idx) => {
    const gk = sphPackageGroupKey(r);
    if (!groups.has(gk)) groups.set(gk, []);
    groups.get(gk).push(idx);
  });

  groups.forEach((indices) => {
    if (indices.length < 2) {
      indices.forEach(i => { list[i] = clearPackageFields(list[i]); });
      return;
    }

    const priced = indices.filter(i => pricedValue(list[i]) > 0);
    const unpriced = indices.filter(i => pricedValue(list[i]) <= 0);
    const groupKey = sphPackageGroupKey(list[indices[0]]);

    if (!priced.length || !unpriced.length) {
      indices.forEach(i => { list[i] = clearPackageFields(list[i]); });
      return;
    }

    // Primary = baris berharga tertinggi (tie → urutan file)
    const primaryIdx = priced.reduce((best, i) => (
      pricedValue(list[i]) > pricedValue(list[best]) ? i : best
    ), priced[0]);

    const primary = list[primaryIdx];
    const primaryId = primary.id;
    const packageTotal = pricedValue(primary);
    const componentIds = unpriced.map(i => list[i].id);

    list[primaryIdx] = {
      ...primary,
      pricingMode: 'package_primary',
      packageGroupKey: groupKey,
      packageTotalValue: packageTotal,
      packagePrimaryId: null,
      packageComponentIds: componentIds,
      notes: primary.notes || (componentIds.length
        ? `Paket ${1 + componentIds.length} item`
        : primary.notes),
    };

    unpriced.forEach(i => {
      list[i] = {
        ...list[i],
        pricingMode: 'package_item',
        packageGroupKey: groupKey,
        packageTotalValue: null,
        packagePrimaryId: primaryId,
        unitPrice: 0,
        totalValue: 0,
      };
    });

    priced.filter(i => i !== primaryIdx).forEach(i => {
      list[i] = clearPackageFields(list[i]);
    });
  });

  return list;
}

export function isBillableSphRow(rec) {
  return rec && rec.pricingMode !== 'package_item';
}

export function sphBillableValue(rec) {
  if (!rec || rec.pricingMode === 'package_item') return 0;
  if (rec.pricingMode === 'package_primary') return Number(rec.packageTotalValue ?? rec.totalValue) || 0;
  return Number(rec.totalValue) || 0;
}

export function filterBillableRows(rows) {
  return (rows || []).filter(isBillableSphRow);
}

export function getPackageComponents(allRows, primary) {
  if (!primary || primary.pricingMode !== 'package_primary') return [];
  const ids = new Set(primary.packageComponentIds || []);
  if (ids.size) return (allRows || []).filter(r => ids.has(r.id));
  return (allRows || []).filter(r =>
    r.pricingMode === 'package_item' &&
    r.packageGroupKey === primary.packageGroupKey &&
    r.packagePrimaryId === primary.id
  );
}

export function formatPackageModalityLabel(primary, components, lang = 'id') {
  if (primary?.pricingMode !== 'package_primary') return primary?.subModality || primary?.modality || '-';
  const n = 1 + (components?.length || 0);
  return lang === 'id' ? `Paket · ${n} item` : `Package · ${n} items`;
}

export function formatPackageItemsSummary(primary, components) {
  const parts = [
    [primary?.modality, primary?.subModality].filter(Boolean).join(' · '),
    ...(components || []).map(c => [c.modality, c.subModality].filter(Boolean).join(' · ')),
  ].filter(Boolean);
  return parts.join(' + ');
}

export function countUniqueSphNumbers(rows) {
  return new Set((rows || []).map(r => normPart(r.sphNo)).filter(Boolean)).size;
}

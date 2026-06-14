// Proyek SPH — satu nomor surat / pelanggan / tanggal = satu proyek lintas modul.
// Pengiriman & instalasi per alat; finance & PO level proyek.

import { applyPackagePricing, sphPackageGroupKey, sphBillableValue, isBillableSphRow } from './sphPackage.js';
import { projectHasDpReceived } from './domain.js';

export function sphProjectKey(rec) {
  return sphPackageGroupKey(rec);
}

export function pickProjectPrimary(lines) {
  if (!lines?.length) return null;
  const list = [...lines];
  return list.find(m => m.pricingMode === 'package_primary')
    || list.find(m => m.id === m.projectPrimaryId)
    || list.find(m => m.poStatus === 'issued' && sphBillableValue(m) > 0)
    || list.find(m => sphBillableValue(m) > 0)
    || list.reduce((best, m) => (sphBillableValue(m) > sphBillableValue(best) ? m : best), list[0]);
}

function modalityKey(rec) {
  return [rec?.modality, rec?.subModality].map(s => String(s || '').trim().toLowerCase()).join('|');
}

/** Nilai kontrak proyek — satu akun finance, tanpa double-count paket / duplikat modalitas. */
export function getProjectFinanceTotal(lines) {
  const primary = pickProjectPrimary(lines);
  if (primary?.pricingMode === 'package_primary') {
    return sphBillableValue(primary);
  }
  const billable = (lines || []).filter(isBillableSphRow);
  const byMod = new Map();
  billable.forEach(l => {
    const k = modalityKey(l);
    const v = sphBillableValue(l);
    const prev = byMod.get(k);
    if (prev === undefined || v > prev) byMod.set(k, v);
  });
  return [...byMod.values()].reduce((s, v) => s + v, 0);
}

const PROJECT_SYNC_FIELDS = [
  'poIssuedAt', 'poIssuedDate', 'poDate', 'poYear',
  'dpPaid', 'finalPaid', 'dpConfirmedAt', 'dpDecisionAt', 'dpFollowupAt',
  'financePoNotifiedAt', 'financeDocsStatus', 'manufacturePoCreatedAt',
  'factoryPoSentAt', 'factoryDpPaidAt', 'supplierDpPaidAt',
  'paymentScheme', 'dpPercent', 'installmentMonths', 'opsPercent',
];

/**
 * Normalisasi data SPH:
 * - deteksi paket harga (Opsi B)
 * - kunci proyek lintas modul
 * - sinkron field PO/DP/finance ke semua baris anggota proyek
 * - shippingStatus / installationStatus tetap per alat (tidak disinkron)
 */
export function normalizeSphProjects(data) {
  let list = applyPackagePricing(Array.isArray(data) ? [...data] : []);
  list = list.map(r => ({ ...r, sphProjectKey: sphProjectKey(r) }));

  const groups = new Map();
  list.forEach((r, i) => {
    const k = r.sphProjectKey;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(i);
  });

  groups.forEach((indices) => {
    const members = indices.map(i => list[i]);
    const primary = pickProjectPrimary(members);
    const poSource = members.find(m => m.poStatus === 'issued')
      || members.find(m => projectHasDpReceived(m))
      || primary;
    const paymentSource = members.find(m => (m.paymentHistory || []).length)
      || members.find(m => projectHasDpReceived(m))
      || poSource;

    indices.forEach(i => {
      const isPrimary = list[i].id === primary.id;
      list[i].projectPrimaryId = primary.id;
      list[i].financeAccountId = primary.id;

      // Tahap/status/probabilitas TIDAK disinkron antar baris — setiap item alat punya pipeline sendiri.
      if (!isPrimary) {
        PROJECT_SYNC_FIELDS.forEach(f => {
          const val = poSource[f] ?? paymentSource[f] ?? primary[f];
          if (val !== undefined && val !== null && val !== '') {
            list[i][f] = val;
          }
        });
        if (projectHasDpReceived(paymentSource)) {
          list[i].dpPaid = paymentSource.dpPaid;
          list[i].dpConfirmedAt = paymentSource.dpConfirmedAt;
          list[i].dpDecisionAt = paymentSource.dpDecisionAt;
        }
      }
    });

    // Konsolidasi riwayat pembayaran ke akun primary
    const mergedHistory = members.flatMap(m => (Array.isArray(m.paymentHistory) ? m.paymentHistory : []));
    if (mergedHistory.length) {
      const primaryIdx = indices.find(i => list[i].id === primary.id);
      if (primaryIdx !== undefined) {
        const seen = new Set();
        const deduped = mergedHistory.filter(h => {
          const k = h.id || `${h.date}|${h.amount}|${h.type}`;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
        list[primaryIdx] = {
          ...list[primaryIdx],
          paymentHistory: deduped,
        };
        indices.filter(i => i !== primaryIdx).forEach(i => {
          list[i] = { ...list[i], paymentHistory: [] };
        });
      }
    }
  });

  return list;
}

export function groupSphProjects(lines, { poIssuedOnly = false } = {}) {
  let rows = lines || [];
  if (poIssuedOnly) rows = rows.filter(s => s.poStatus === 'issued');

  const groups = new Map();
  rows.forEach(line => {
    const key = line.sphProjectKey || sphProjectKey(line);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        sphNo: line.sphNo,
        customer: line.customer,
        issuedDate: line.issuedDate,
        lines: [],
      });
    }
    groups.get(key).lines.push(line);
  });

  return [...groups.values()].map(g => {
    const primary = pickProjectPrimary(g.lines);
    return {
      ...g,
      primary,
      financeTotal: getProjectFinanceTotal(g.lines),
      lineCount: g.lines.length,
      isMultiItem: g.lines.length > 1,
    };
  }).sort((a, b) => String(b.primary?.issuedDate || '').localeCompare(String(a.primary?.issuedDate || '')));
}

/** Satu baris PO = satu akun finance (multi-alat digabung). */
export function toFinanceAccounts(data) {
  return groupSphProjects(data, { poIssuedOnly: true }).map(g => {
    const p = g.primary;
    const modalities = [...new Set(g.lines.map(l => l.subModality || l.modality).filter(Boolean))];
    return {
      ...p,
      id: p.financeAccountId || p.id,
      totalValue: g.financeTotal,
      projectLines: g.lines,
      projectLineCount: g.lineCount,
      isMultiItemProject: g.isMultiItem,
      projectModalityLabel: g.isMultiItem && modalities.length > 1
        ? modalities.join(' + ')
        : (p.subModality || p.modality || ''),
    };
  });
}

export function resolveFinanceAccountId(data, sphNo) {
  const norm = String(sphNo || '').trim().toLowerCase();
  const matches = (data || []).filter(s => String(s.sphNo || '').trim().toLowerCase() === norm);
  if (!matches.length) return null;
  const g = groupSphProjects(matches)[0];
  return g?.primary?.financeAccountId || g?.primary?.id || matches[0].id;
}

export function shippingStatusLabel(status, lang = 'id') {
  const map = {
    pending: lang === 'id' ? 'Menunggu' : 'Pending',
    plan_order: lang === 'id' ? 'Order Pabrik' : 'Factory order',
    factory_production: lang === 'id' ? 'Produksi' : 'Production',
    ready_to_ship: lang === 'id' ? 'Siap Kirim' : 'Ready',
    on_shipment: lang === 'id' ? 'Dalam Pengiriman' : 'In transit',
    arrived_clearance: lang === 'id' ? 'Clearance' : 'Clearance',
    sent_client: lang === 'id' ? 'Dikirim ke RS' : 'Sent to client',
    client_received: lang === 'id' ? 'Diterima RS' : 'Received',
  };
  return map[status] || status || '-';
}

export function formatProjectEquipmentSummary(lines, lang = 'id') {
  return (lines || []).map(l => {
    const label = [l.subModality, l.modality].filter(Boolean).join(' · ') || '-';
    const ship = shippingStatusLabel(l.shippingStatus, lang);
    return `${label} (${ship})`;
  }).join(' · ');
}

/** Baris billable untuk statistik pipeline — tanpa package_item. */
export function getBillableRows(data) {
  return (data || []).filter(isBillableSphRow);
}

/** Jumlah nilai pipeline/win per proyek (bukan per baris duplikat). */
export function sumGroupedProjectValue(rows) {
  return groupSphProjects(rows).reduce((s, g) => s + (Number(g.financeTotal) || 0), 0);
}

export function sumWeightedGroupedPipeline(rows) {
  return groupSphProjects(rows).reduce((s, g) => {
    const prob = Number(g.primary?.probability) || 0;
    return s + (Number(g.financeTotal) || 0) * prob / 100;
  }, 0);
}

export function countGroupedPoProjects(data) {
  return groupSphProjects(data, { poIssuedOnly: true }).length;
}

export function sumGroupedPoValue(data) {
  return toFinanceAccounts(data).reduce((s, a) => s + (Number(a.totalValue) || 0), 0);
}

/** Item baris untuk invoice / PO / SPH doc — dari projectLines atau anggota proyek. */
export function getDocumentLineItems(record, allData = []) {
  if (!record) return [];
  if (Array.isArray(record.projectLines) && record.projectLines.length) {
    return record.projectLines.map(l => ({
      modality: l.modality,
      subModality: l.subModality,
      brand: l.productBrand || l.brand || l.principal,
      qty: l.qty || 1,
      totalValue: l.pricingMode === 'package_item' ? 0 : (Number(l.totalValue) || Number(l.unitPrice) || 0),
      unitPrice: l.unitPrice,
    }));
  }
  const key = record.sphProjectKey || sphProjectKey(record);
  const siblings = (allData || []).filter(r => (r.sphProjectKey || sphProjectKey(r)) === key);
  if (siblings.length > 1) {
    const primary = pickProjectPrimary(siblings);
    if (primary?.pricingMode === 'package_primary') {
      const components = siblings.filter(r => r.pricingMode === 'package_item');
      return [
        { modality: primary.modality, subModality: primary.subModality, brand: primary.productBrand || primary.brand || primary.principal, qty: primary.qty || 1, totalValue: sphBillableValue(primary) },
        ...components.map(c => ({ modality: c.modality, subModality: c.subModality, brand: c.productBrand || c.brand || c.principal, qty: c.qty || 1, totalValue: 0 })),
      ];
    }
    const byMod = new Map();
    siblings.filter(isBillableSphRow).forEach(l => {
      const k = modalityKey(l);
      const v = sphBillableValue(l);
      if (!byMod.has(k) || v > byMod.get(k).totalValue) {
        byMod.set(k, { modality: l.modality, subModality: l.subModality, brand: l.productBrand || l.brand || l.principal, qty: l.qty || 1, totalValue: v, unitPrice: l.unitPrice });
      }
    });
    return [...byMod.values()];
  }
  return [{
    modality: record.modality,
    subModality: record.subModality,
    brand: record.productBrand || record.brand || record.principal,
    qty: record.qty || 1,
    totalValue: Number(record.totalValue) || Number(record.unitPrice) || 0,
    unitPrice: record.unitPrice,
  }];
}
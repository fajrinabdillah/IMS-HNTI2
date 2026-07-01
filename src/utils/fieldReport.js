/**
 * RS prospek = kunjungan lapangan di mana ditemukan kebutuhan produk spesifik
 * yang bisa ditindaklanjuti (SPH, presentasi, dll.).
 * Bukan setiap RS yang dikunjungi — kunjungan tanpa kebutuhan / tanpa produk ≠ prospek.
 */
export const FIELD_PROSPECT_PIPELINES = ['warm', 'hot', 'proposal'];

export function hasIdentifiedProductNeed(visit) {
  return !!String(visit?.product || '').trim();
}

export function isProspectVisit(visit) {
  if (!visit || !String(visit.name || '').trim()) return false;
  const pipeline = String(visit.pipeline || 'cold').toLowerCase();
  if (!FIELD_PROSPECT_PIPELINES.includes(pipeline)) return false;
  return hasIdentifiedProductNeed(visit);
}

export function countProspectVisits(visits = []) {
  return (visits || []).filter(isProspectVisit).length;
}

export function countNamedVisits(visits = []) {
  return (visits || []).filter(v => String(v.name || '').trim()).length;
}

export function prospectRate(prospects, totalVisits) {
  if (!totalVisits) return 0;
  return Math.round((prospects / totalVisits) * 100);
}

/** Normalisasi data legacy (closing/deal) → kunjungan lanjutan + hitung ulang prospek. */
export function healFieldReportRecord(report) {
  const visits = (report.visits || []).map(v => ({
    ...v,
    visit: v.visit === 'closed' ? 'nego' : v.visit,
    pipeline: v.pipeline === 'win' ? 'proposal' : v.pipeline,
  }));
  const pipeN = countProspectVisits(visits);
  return { ...report, visits, pipeN };
}

export function fieldPipelineLabel(pipeline, lang = 'id') {
  const id = {
    cold: 'Belum ada kebutuhan produk',
    warm: 'Ada kebutuhan · Hangat',
    hot: 'Ada kebutuhan · Panas',
    proposal: 'Proposal / SPH dikirim',
    win: 'Proposal / SPH dikirim',
  };
  const en = {
    cold: 'No product need identified',
    warm: 'Product need · Warm',
    hot: 'Product need · Hot',
    proposal: 'Proposal / SPH sent',
    win: 'Proposal / SPH sent',
  };
  const map = lang === 'id' ? id : en;
  return map[pipeline] || pipeline || '—';
}

export function prospectCriteriaHint(lang = 'id') {
  return lang === 'id'
    ? 'Prospek = RS dengan kebutuhan produk teridentifikasi (isi Produk + Hangat/Panas/Proposal). Kunjungan tanpa kebutuhan tidak dihitung.'
    : 'Prospect = RS with identified product need (fill Product + Warm/Hot/Proposal). Visits without need are excluded.';
}

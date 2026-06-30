/** RS dengan kebutuhan produk aktif — lanjut ke SPH/SPP, bukan closing/deal. */
export const FIELD_PROSPECT_PIPELINES = ['warm', 'hot', 'proposal'];

export function isProspectVisit(visit) {
  if (!visit || !String(visit.name || '').trim()) return false;
  return FIELD_PROSPECT_PIPELINES.includes(String(visit.pipeline || '').toLowerCase());
}

export function countProspectVisits(visits = []) {
  return (visits || []).filter(isProspectVisit).length;
}

export function prospectRate(prospects, totalVisits) {
  if (!totalVisits) return 0;
  return Math.round((prospects / totalVisits) * 100);
}

/** Normalisasi data legacy (closing/deal) → prospek & kunjungan lanjutan. */
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
    cold: 'Belum ada kebutuhan',
    warm: 'Ada kebutuhan · Hangat',
    hot: 'Ada kebutuhan · Panas',
    proposal: 'Proposal / SPH',
    win: 'Proposal / SPH',
  };
  const en = {
    cold: 'No need yet',
    warm: 'Has need · Warm',
    hot: 'Has need · Hot',
    proposal: 'Proposal / SPH',
    win: 'Proposal / SPH',
  };
  const map = lang === 'id' ? id : en;
  return map[pipeline] || pipeline || '—';
}

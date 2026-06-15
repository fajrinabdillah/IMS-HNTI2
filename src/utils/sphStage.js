// Extracted from App.jsx during modular refactor.
const SPH_WORKFLOW_LABELS = {
  requested: 'Request masuk',
  admin_drafting: 'Admin membuat SPH',
  ready_for_sales: 'SPH siap diunduh Sales',
  offer_sent: 'Penawaran disampaikan ke klien',
  sph_sent: 'SPH awal',
  presentation_scheduled: 'Jadwal presentasi',
  presentation_done: 'Presentasi selesai',
  negotiation: 'Negosiasi',
  tender: 'Proses tender',
  ecatalog: 'Menunggu klik e-catalog',
  po_issued: 'PO terbit',
  lost: 'Kalah',
  client_po_info: 'Informasi PO dari klien',
  po_input_ims: 'SPH/SPP input ke IMS',
  signed_by_sales: 'Ditandatangani Sales',
  sales_downloaded: 'SPH/SPP sudah diunduh PIC Sales',
  finance_po_notified: 'Finance menerima notifikasi PO',
  invoice_ready: 'Invoice + KP siap',
  dp_followup: 'Follow-up DP',
  dp_claimed_paid: 'Sales klaim DP terbayar',
  dp_confirmed: 'Finance konfirmasi DP',
  manufacture_po_created: 'PO ke pabrik dibuat',
  principal_po_sent: 'PO ke pabrik terkirim',
  factory_po_sent: 'PO ke pabrik terkirim',
  factory_dp_paid: 'DP ke pabrik dibayarkan',
  factory_production_done: 'Produksi/disiapkan pabrik selesai',
  factory_production: 'Barang diproduksi/disiapkan pabrik',
  import_clearance: 'Import / clearance berjalan',
  goods_sent_client: 'Barang dikirim ke klien',
  goods_received_client: 'Barang diterima klien',
  local_delivery: 'Local trucking / storing',
  install_schedule_updated: 'Jadwal instalasi diupdate',
  installed_bast: 'Instalasi / BAST',
  regulatory_processing: 'Proses izin pemanfaatan',
  utilization_permit_done: 'Izin pemanfaatan selesai',
};
const SPH_PROJECT_STAGE_STEPS = [
  { key: 'request', role: 'Sales', color: '#0f766e', title: 'Request SPH/SPP', desc: 'Sales mengajukan permintaan SPH/SPP ke Admin', dates: ['sphRequestedAt'] },
  { key: 'admin_doc', role: 'Admin', color: '#6d3aa6', title: 'Membuat Surat SPH/SPP', desc: 'Admin membuat dokumen SPH/SPP', dates: ['sphDocReadyAt', 'sphDraftStartedAt'] },
  { key: 'admin_input', role: 'Admin', color: '#6d3aa6', title: 'Input SPH & SPP ke IMS', desc: 'Admin input data SPH/SPP ke sistem', dates: ['poInputAt', 'financePoNotifiedAt'] },
  { key: 'offer_sent', role: 'Sales', color: '#0f766e', title: 'Menyampaikan Penawaran', desc: 'Sales menyampaikan penawaran ke klien', dates: ['offerSentAt', 'clientPoInfoAt', 'poIssuedAt'] },
  { key: 'presentation_scheduled', role: 'Sales / Product Support', color: '#0f766e', title: 'Jadwal Presentasi', desc: 'Presentasi produk dijadwalkan dengan RS/klien', dates: ['presentationScheduledAt', 'presentationDoneAt'] },
  { key: 'presentation_done', role: 'Sales / Product Support', color: '#0f766e', title: 'Presentasi Selesai', desc: 'Presentasi/demo produk selesai dan menunggu keputusan lanjutan', dates: ['presentationDoneAt'] },
  { key: 'commercial_followup', role: 'Sales', color: '#0f766e', title: 'Negosiasi / Tender / E-Catalog', desc: 'Lanjutan komersial sesuai jalur pembelian klien', dates: ['negotiationStartedAt', 'tenderStartedAt', 'ecatalogWaitingAt', 'clientPoInfoAt', 'poIssuedAt'] },
  { key: 'client_po', role: 'Sales', color: '#0f766e', title: 'Informasi PO dari Klien', desc: 'Sales menerima informasi PO dari klien', dates: ['clientPoInfoAt', 'poIssuedAt'] },
  { key: 'invoice_dp', role: 'Finance', color: '#b7791f', title: 'Membuat Invoice DP', desc: 'Finance membuat invoice penagihan DP ke klien', dates: ['financeDocsReadyAt', 'dpFollowupAt', 'dpClaimedAt', 'dpConfirmedAt'] },
  { key: 'dp_followup', role: 'Sales', color: '#0f766e', title: 'Konfirmasi Pembayaran DP', desc: 'Sales konfirmasi dan follow-up pembayaran DP', dates: ['dpClaimedAt', 'dpFollowupAt', 'dpConfirmedAt'] },
  { key: 'dp_confirmed', role: 'Finance', color: '#b7791f', title: 'DP Diterima -> PO ke Pabrik', desc: 'Finance konfirmasi DP diterima, buat PO ke pabrik', dates: ['dpConfirmedAt', 'manufacturePoCreatedAt', 'principalPoSentAt', 'factoryDpPaidAt'] },
  { key: 'factory_production', role: 'Operations', color: '#1d4f91', title: 'Barang Diproduksi/Disiapkan Pabrik', desc: 'Countdown produksi berjalan sejak PO dikirim ke pabrik', dates: ['factoryProductionStartedAt', 'factoryProductionDoneAt'] },
  { key: 'import_clearance', role: 'Operations', color: '#1d4f91', title: 'Import & Clearance', desc: 'Ops mengatur alur impor barang hingga proses clearance', dates: ['importClearanceAt', 'goodsSentClientAt'] },
  { key: 'goods_client', role: 'Operations', color: '#1d4f91', title: 'Barang Dikirim ke Klien', desc: 'Barang dikirim ke lokasi klien', dates: ['goodsSentClientAt'] },
  { key: 'goods_received_client', role: 'Operations', color: '#1d4f91', title: 'Barang Diterima Klien', desc: 'Klien mengonfirmasi barang sudah diterima di lokasi', dates: ['clientReceivedAt'] },
  { key: 'install_schedule', role: 'Technician', color: '#9a5b2f', title: 'Jadwal & Proses Instalasi', desc: 'Teknisi mengatur jadwal dan melakukan instalasi', dates: ['installScheduleUpdatedAt', 'bastDate'] },
  { key: 'bast_done', role: 'Technician', color: '#9a5b2f', title: 'BAST Selesai', desc: 'Teknisi update BAST setelah instalasi selesai', dates: ['bastDate'] },
  { key: 'reg_process', role: 'Regulatory', color: '#b4233a', title: 'Proses Perizinan', desc: 'Regulatory membantu proses perizinan pemanfaatan', dates: ['regulatoryProcessingAt', 'regulatoryNotifiedAt', 'utilizationPermitDoneAt'] },
  { key: 'project_done', role: 'Regulatory', color: '#b4233a', title: 'Proyek Selesai', desc: 'Seluruh proses selesai, izin pemanfaatan terbit', dates: ['utilizationPermitDoneAt'] },
];
function projectStageDate(sph, step) {
  if (!sph || !step) return null;
  for (const field of step.dates || []) {
    if (sph[field]) return sph[field];
  }
  if (step.key === 'client_po' && (sph.poStatus === 'issued' || sph.stage === 'po_issued')) return sph.poIssuedAt || sph.lastUpdate;
  if (step.key === 'dp_confirmed' && sph.dpPaid) return sph.dpConfirmedAt || sph.lastUpdate;
  if (step.key === 'bast_done' && sph.installationStatus === 'installed') return sph.bastDate || sph.lastUpdate;
  return null;
}
function getProjectStageRows(sph) {
  const rawRows = SPH_PROJECT_STAGE_STEPS.map((step, idx) => {
    const at = projectStageDate(sph, step);
    return { ...step, idx, at, done: !!at };
  });
  const rows = rawRows.map((row, idx) => {
    if (row.done) return row;
    const nextDone = rawRows.slice(idx + 1).find(r => r.done);
    return nextDone ? { ...row, at: nextDone.at, done: true, inferred: true } : row;
  });
  const firstPending = rows.findIndex(r => !r.done);
  return rows.map((row, idx) => ({
    ...row,
    state: row.done ? 'done' : (idx === firstPending ? 'active' : 'pending'),
  }));
}

/** Status workflow request SPH/SPP yang masuk antrian Admin (bukan seluruh SPH aktif). */
const ADMIN_QUEUE_STATUSES = new Set(['requested', 'admin_drafting', 'ready_for_sales']);

function isAdminQueueRequest(row) {
  if (!row || row.status === 'cancelled' || row.salesDownloadedAt) return false;
  return ADMIN_QUEUE_STATUSES.has(row.sphWorkflowStatus);
}

export { SPH_WORKFLOW_LABELS, SPH_PROJECT_STAGE_STEPS, projectStageDate, getProjectStageRows, ADMIN_QUEUE_STATUSES, isAdminQueueRequest };

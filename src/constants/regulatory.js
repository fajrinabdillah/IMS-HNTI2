// Extracted from App.jsx during modular refactor.
const AKL_STAGES = ['preregist', 'docs', 'submit', 'pnbp', 'eval', 'fix', 'issued'];
const IMPORT_STAGES = ['preregist', 'docs', 'submit', 'eval', 'issued'];
const PENGALIHAN_STAGES = ['submit', 'eval', 'issued'];
const REG_STAGES = ['docs', 'submit', 'eval', 'resubmit', 'pnbp', 'issued'];
const REG_STAGE_COLORS = {
  docs: '#94a3b8', submit: '#7d9cc5', eval: 'var(--ims-gold)',
  resubmit: '#c97b3f', pnbp: 'var(--ims-gold-dim)', issued: 'var(--ims-accent-2)',
};
const REG_STAGE_DATE_FIELD = {
  docs: 'docsDate', submit: 'submitDate', eval: 'evalDate',
  resubmit: 'resubmitDate', pnbp: 'pnbpDate', issued: 'issuedDate',
};
const REG_STAGES_DEFAULT = ['docs', 'submit', 'eval', 'resubmit', 'pnbp', 'issued'];
const REG_STAGES_AKL = ['docs', 'submit', 'pnbp', 'eval', 'resubmit', 'issued'];
const REG_AUTHORITY = {
  akl: 'Kemenkes', import: 'BAPETEN', pengalihan: 'BAPETEN',
  pi: 'BAPETEN', bapeten: 'BAPETEN',
};
const REG_PNBP_DEFAULT = {
  akl: 5000000, import: 12500000, pengalihan: 12500000,
  pi: 12500000, bapeten: 12500000,
};
const REG_PERMIT_PREFIX = {
  import: 'BAPETEN/IMP', pengalihan: 'BAPETEN/PGL',
  pi: 'BAPETEN/PI', bapeten: 'BAPETEN/PMF', akl: 'AKL',
};
const REG_TYPE_LABELS = {
  akl: { id: 'AKL Kemenkes', en: 'AKL Kemenkes' },
  import: { id: 'Izin Import', en: 'Import Permit' },
  pengalihan: { id: 'Izin Pengalihan', en: 'Transfer Permit' },
  pi: { id: 'Persetujuan Import (PI)', en: 'Import Approval (PI)' },
  bapeten: { id: 'Izin Pemanfaatan', en: 'Utilization Permit' },
};
const IMPORT_PIPELINE_STEPS = [
  { id: 'plan_order', labelId: 'Pesanan Dibuat', labelEn: 'Order Created', color: '#94a3b8' },
  { id: 'factory_production', labelId: 'Barang Diproduksi/Disiapkan Pabrik', labelEn: 'Factory Production/Preparation', color: '#a026a0' },
  { id: 'ready_to_ship', labelId: 'Siap Kirim', labelEn: 'Ready to Ship', color: '#7d9cc5' },
  { id: 'on_shipment', labelId: 'Pengiriman', labelEn: 'Shipment', color: 'var(--ims-accent)' },
  { id: 'arrived_clearance', labelId: 'Tiba/Clearance', labelEn: 'Arrived/Clearance', color: '#5b87b8' },
  { id: 'sent_client', labelId: 'Dikirim ke Klien', labelEn: 'Sent to Client', color: '#2f8f6f' },
  { id: 'client_received', labelId: 'Diterima Klien', labelEn: 'Client Received', color: 'var(--ims-accent-2)' },
];
const LEGACY_IMPORT_STATUS_MAP = {
  planning: 'plan_order',
  loading: 'ready_to_ship',
  in_transit: 'on_shipment',
  arrived: 'arrived_clearance',
  cleared: 'arrived_clearance',
  delivered: 'sent_client',
  delivery_to_site: 'client_received',
};

export { AKL_STAGES, IMPORT_STAGES, PENGALIHAN_STAGES, REG_STAGES, REG_STAGE_COLORS, REG_STAGE_DATE_FIELD, REG_STAGES_DEFAULT, REG_STAGES_AKL, REG_AUTHORITY, REG_PNBP_DEFAULT, REG_PERMIT_PREFIX, REG_TYPE_LABELS, IMPORT_PIPELINE_STEPS, LEGACY_IMPORT_STATUS_MAP };

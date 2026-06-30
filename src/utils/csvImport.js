// Extracted from App.jsx during modular refactor.
import { _normHdr, _num, _normDate } from './format.js';
import { normalizeSphStageId, defaultSphStageForStatus } from './domain.js';

const _CUSTOMER_TYPE_ALIASES = {
  hospital: 'hospital', rs: 'hospital', 'rumah sakit': 'hospital', rumah_sakit: 'hospital',
  clinic: 'clinic', klinik: 'clinic',
  subdistributor: 'subdistributor', 'sub distributor': 'subdistributor', sub_dealer: 'subdistributor',
  partner: 'partner', mitra: 'partner',
  personal: 'personal', perorangan: 'personal',
};
const _PROJECT_TYPE_ALIASES = {
  private: 'private', swasta: 'private', privat: 'private',
  government: 'government', pemerintah: 'government', pemda: 'government',
  tender: 'tender', lelang: 'tender',
  kso: 'kso', bumn: 'bumn',
};

function detectDelimiter(text) {
  const sample = String(text || '').replace(/^\ufeff/, '').split(/\r?\n/).slice(0, 10).filter(l => l.trim()).join('\n');
  let commas = 0; let semis = 0; let tabs = 0; let inQuotes = false;
  for (let i = 0; i < sample.length; i++) {
    const c = sample[i];
    if (c === '"') {
      if (sample[i + 1] === '"') { i++; continue; }
      inQuotes = !inQuotes;
    } else if (!inQuotes) {
      if (c === ',') commas++;
      else if (c === ';') semis++;
      else if (c === '\t') tabs++;
    }
  }
  if (semis > commas && semis >= tabs) return ';';
  if (tabs > commas && tabs > semis) return '\t';
  return ',';
}

function parseCSV(text, delimiter) {
  const delim = delimiter || detectDelimiter(text);
  const rows = []; let row = []; let field = ''; let inQuotes = false;
  text = String(text || '').replace(/^\ufeff/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; } }
      else { field += c; }
    } else {
      if (c === '"') { inQuotes = true; }
      else if (c === delim) { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c === '\r') { /* skip */ }
      else { field += c; }
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  // Drop fully-empty rows
  return rows.filter(r => r.some(c => String(c).trim() !== ''));
}

function findHeaderRowIndex(rows, aliasDict, requiredFields = []) {
  const limit = Math.min(rows.length, 20);
  for (let i = 0; i < limit; i++) {
    const cols = buildColMap(rows[i], aliasDict);
    if (requiredFields.every(f => cols[f] !== undefined)) return i;
  }
  return -1;
}
function buildColMap(headerRow, aliasDict) {
  const map = {};
  headerRow.forEach((cell, idx) => {
    const n = _normHdr(cell);
    for (const [field, aliases] of Object.entries(aliasDict)) {
      if (aliases.some(a => _normHdr(a) === n)) { if (map[field] === undefined) map[field] = idx; }
    }
  });
  return map;
}
const SPH_IMPORT_ALIASES = {
  sphNo: ['SPH No', 'No SPH', 'SPH', 'Nomor SPH', 'No Quotation', 'Quotation No'],
  customer: ['Customer', 'Pelanggan', 'Nama Pelanggan', 'Klien', 'Client'],
  customerType: ['Type', 'Tipe', 'Tipe Pelanggan', 'Customer Type', 'Jenis Pelanggan'],
  projectType: ['Project Type', 'Jenis Proyek', 'Tipe Proyek'],
  modality: ['Modality', 'Modalitas', 'Alat', 'Produk'],
  subModality: ['Sub-Modality', 'Sub Modality', 'SubModality', 'Sub Modalitas', 'Tipe Alat'],
  qty: ['Qty', 'Quantity', 'Jumlah', 'Unit'],
  unitPrice: ['Unit Price', 'Harga Satuan', 'Harga'],
  totalValue: ['Total Value', 'Total Nilai', 'Nilai Total', 'Total', 'Nilai'],
  stage: ['Stage', 'Tahap', 'Tahapan'],
  status: ['Status'],
  salesOwner: ['Sales', 'Sales Owner', 'Pemilik Sales', 'Penjual', 'PIC Sales'],
  issuedDate: ['Issue Date', 'Tanggal Terbit', 'Tanggal', 'Date', 'Tgl Terbit'],
  region: ['Region', 'Wilayah', 'Area', 'Daerah'],
  notes: ['Notes', 'Catatan', 'Keterangan', 'Note'],
  installSiteName: ['Lokasi RS', 'RS Instalasi', 'Nama RS', 'Install Site', 'Site Name', 'Lokasi Instalasi', 'End Customer'],
  installSiteAddress: ['Alamat RS', 'Alamat Lokasi', 'Install Address', 'Site Address', 'Alamat Instalasi'],
  installSiteRegion: ['Wilayah RS', 'Wilayah Lokasi', 'Site Region', 'Area RS'],
};
const _STATUS_ALIASES = { won: 'won', menang: 'won', lost: 'lost', kalah: 'lost', active: 'active', aktif: 'active', pending: 'active' };
const _STAGE_VALID = ['sph_sent', 'presentation_scheduled', 'presentation_done', 'ecatalog', 'negotiation', 'tender', 'po_issued', 'inactive', 'lost'];
function parseSPHImport(text) {
  const rows = parseCSV(text);
  if (rows.length < 2) return { records: [], errors: ['File kosong atau tidak ada baris data.'], total: 0 };
  const headerIdx = findHeaderRowIndex(rows, SPH_IMPORT_ALIASES, ['sphNo', 'customer']);
  if (headerIdx < 0)
    return { records: [], errors: ['Kolom wajib tidak ditemukan: butuh minimal "SPH No" dan "Customer/Pelanggan". Pastikan file memakai pemisah koma (,) atau titik koma (;) seperti template Excel Indonesia.'], total: rows.length - 1 };
  const cols = buildColMap(rows[headerIdx], SPH_IMPORT_ALIASES);
  const records = []; const errors = [];
  /** Konteks baris sebelumnya — untuk sel merge Excel (paket multi-alat). */
  let carry = { sphNo: '', customer: '', customerType: '', projectType: '', salesOwner: '', issuedDate: '', region: '', stage: '', status: '' };
  for (let r = headerIdx + 1; r < rows.length; r++) {
    const row = rows[r]; const get = (f) => cols[f] !== undefined ? String(row[cols[f]] ?? '').trim() : '';
    const sphNo = get('sphNo') || carry.sphNo;
    const customer = get('customer') || carry.customer;
    const modality = get('modality') || '-';
    const subModality = get('subModality') || '-';
    const hasProduct = modality !== '-' || subModality !== '-';
    if (!sphNo || !customer) {
      if (hasProduct && carry.sphNo && carry.customer) {
        // baris lanjutan paket tanpa nomor/pelanggan (merge) — lanjutkan
      } else {
        errors.push(`Baris ${r + 1}: dilewati (No SPH / Pelanggan kosong — baris merge paket perlu mengikuti baris utama).`);
        continue;
      }
    }
    const qty = _num(get('qty')) || 1;
    const unitPrice = _num(get('unitPrice'));
    let totalValue = _num(get('totalValue'));
    if (!totalValue) totalValue = qty * unitPrice;
    const statusRaw = _normHdr(get('status') || carry.status);
    const status = _STATUS_ALIASES[statusRaw] || carry.status || 'active';
    const stageRaw = get('stage') || carry.stage;
    let stage = normalizeSphStageId(stageRaw);
    if (!stage && stageRaw) stage = normalizeSphStageId(_normHdr(stageRaw).replace(/\s+/g, '_'));
    if (!stage) stage = defaultSphStageForStatus(status);
    if (!_STAGE_VALID.includes(stage)) stage = defaultSphStageForStatus(status);
    const customerTypeRaw = _normHdr(get('customerType') || carry.customerType);
    const projectTypeRaw = _normHdr(get('projectType') || carry.projectType);
    const salesRaw = get('salesOwner') || carry.salesOwner;
    const issuedDate = _normDate(get('issuedDate')) || carry.issuedDate || new Date().toISOString().split('T')[0];
    const rec = {
      sphNo, customer,
      customerType: _CUSTOMER_TYPE_ALIASES[customerTypeRaw] || get('customerType') || carry.customerType || 'hospital',
      projectType: _PROJECT_TYPE_ALIASES[projectTypeRaw] || get('projectType') || carry.projectType || 'private',
      modality,
      subModality,
      qty, unitPrice, totalValue,
      stage, status,
      salesOwner: salesRaw,
      importSalesLabel: salesRaw,
      region: get('region') || carry.region || '-',
      issuedDate,
      notes: get('notes') || '',
      installSiteName: get('installSiteName') || '',
      installSiteAddress: get('installSiteAddress') || '',
      installSiteRegion: get('installSiteRegion') || get('region') || carry.region || '',
    };
    records.push(rec);
    carry = {
      sphNo: rec.sphNo,
      customer: rec.customer,
      customerType: rec.customerType,
      projectType: rec.projectType,
      salesOwner: salesRaw,
      issuedDate: rec.issuedDate,
      region: rec.region,
      stage: rec.stage,
      status: rec.status,
    };
  }
  return { records, errors, total: rows.length - headerIdx - 1 };
}
const PAY_IMPORT_ALIASES = {
  sphNo: ['SPH No', 'No SPH', 'SPH', 'Nomor SPH'],
  type: ['Type', 'Jenis', 'Jenis Pembayaran', 'Payment Type', 'Tipe'],
  amount: ['Amount', 'Jumlah', 'Nominal', 'Nilai', 'Pembayaran'],
  date: ['Date', 'Tanggal', 'Tgl', 'Tanggal Bayar'],
  note: ['Note', 'Catatan', 'Keterangan', 'Notes'],
};
const _PAYTYPE_ALIASES = { dp: 'dp', deposit: 'dp', uangmuka: 'dp', installment: 'installment', cicilan: 'installment', angsuran: 'installment', final: 'final', pelunasan: 'final', lunas: 'final' };
const FIELD_REPORT_IMPORT_ALIASES = {
  reportId: ['Report ID', 'ID Laporan', 'ReportId'],
  salesId: ['Sales ID', 'ID Sales', 'SalesId'],
  salesName: ['Sales Name', 'Nama Sales', 'Sales'],
  date: ['Date', 'Tanggal', 'Tgl Laporan'],
  week: ['Week', 'Minggu'],
  days: ['Field Days', 'Hari Lapangan', 'Days'],
  nights: ['Nights', 'Malam Menginap'],
  area: ['Focus Area', 'Area Fokus', 'Area'],
  pipeN: ['Pipeline RS Count', 'Jumlah RS Pipeline', 'Pipe Count', 'PipeN'],
  closest: ['Closest RS', 'RS Paling Dekat Closing', 'Closest'],
  win: ['Win', 'Win / Pencapaian', 'Pencapaian'],
  block: ['Blocker', 'Hambatan Terbesar', 'Hambatan'],
  next: ['Next Priority', 'Prioritas Minggu Depan', 'Next'],
  fatigue: ['Fatigue', 'Tingkat Kelelahan'],
  hospital: ['Hospital', 'Nama RS', 'RS'],
  city: ['City', 'Kab/Kota', 'Kota'],
  visitType: ['Visit Type', 'Kunjungan', 'Tipe Kunjungan'],
  product: ['Product', 'Produk'],
  pipeline: ['Pipeline Temp', 'Pipeline', 'Suhu Pipeline'],
  contact: ['Contact', 'Kontak'],
  visitNote: ['Visit Note', 'Catatan Kunjungan', 'Note', 'Catatan'],
};
function sanitizeFieldReport(report) {
  const visits = (report.visits || []).map(v => {
    const clean = { ...v };
    delete clean.estimatedValue;
    return clean;
  });
  return { ...report, pipeVal: 0, visits: visits.length ? visits : [{ name: '', city: '', visit: 'first', product: '', pipeline: 'cold', contact: '', note: '' }] };
}
const _VISIT_TYPE_ALIASES = {
  first: 'first', pertam: 'first', followup: 'followup', demo: 'demo',
  nego: 'nego', negosiasi: 'nego', negotiation: 'nego',
  closed: 'closed', closing: 'closed', close: 'closed',
};
function resolveSalesIdFromImport(salesId, salesName, salesTeam = []) {
  const sid = String(salesId || '').trim().toLowerCase();
  if (sid) {
    const hit = salesTeam.find(s => s.id === sid || s.username === sid);
    if (hit) return hit.id;
    return sid;
  }
  const name = String(salesName || '').trim().toLowerCase();
  if (!name) return '';
  const hit = salesTeam.find(s => String(s.name || '').toLowerCase().includes(name) || name.includes(String(s.name || '').toLowerCase()));
  return hit?.id || '';
}
function parseFieldReportImport(text, salesTeam = []) {
  const rows = parseCSV(text);
  if (rows.length < 2) return { records: [], errors: ['File kosong atau tidak ada baris data.'], total: 0 };
  const headerIdx = findHeaderRowIndex(rows, FIELD_REPORT_IMPORT_ALIASES, ['date']);
  if (headerIdx < 0)
    return { records: [], errors: ['Kolom wajib tidak ditemukan: butuh minimal "Date/Tanggal". Gunakan template CSV laporan lapangan.'], total: rows.length - 1 };
  const cols = buildColMap(rows[headerIdx], FIELD_REPORT_IMPORT_ALIASES);
  const grouped = new Map();
  const errors = [];
  for (let r = headerIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    const get = (f) => cols[f] !== undefined ? String(row[cols[f]] ?? '').trim() : '';
    const date = _normDate(get('date'));
    const salesId = resolveSalesIdFromImport(get('salesId'), get('salesName'), salesTeam);
    if (!date) { errors.push(`Baris ${r + 1}: dilewati (tanggal kosong).`); continue; }
    if (!salesId) { errors.push(`Baris ${r + 1}: dilewati (Sales ID / Nama Sales tidak dikenali).`); continue; }
    const reportIdRaw = get('reportId');
    const groupKey = reportIdRaw || `${salesId}|${date}`;
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        id: reportIdRaw || `rpt_imp_${salesId}_${date.replace(/-/g, '')}_${Date.now()}_${grouped.size}`,
        salesId,
        date,
        week: get('week') || 'Minggu 1',
        days: _num(get('days')) || 0,
        nights: _num(get('nights')) || 0,
        area: get('area') || '',
        pipeN: _num(get('pipeN')) || 0,
        pipeVal: 0,
        closest: get('closest') || '',
        win: get('win') || '',
        block: get('block') || '',
        next: get('next') || '',
        fatigue: _num(get('fatigue')) || 0,
        visits: [],
        createdAt: new Date().toISOString(),
      });
    }
    const rec = grouped.get(groupKey);
    const hospital = get('hospital');
    const visitTypeRaw = _normHdr(get('visitType'));
    const visitType = _VISIT_TYPE_ALIASES[visitTypeRaw] || (['first', 'followup', 'demo', 'nego', 'closed'].includes(visitTypeRaw) ? visitTypeRaw : 'first');
    if (hospital) {
      rec.visits.push({
        name: hospital,
        city: get('city') || '',
        visit: visitType,
        product: get('product') || '',
        pipeline: get('pipeline') || 'cold',
        contact: get('contact') || '',
        note: get('visitNote') || '',
      });
    }
    if (get('week')) rec.week = get('week');
    if (get('area')) rec.area = get('area');
    if (get('win')) rec.win = get('win');
    if (get('block')) rec.block = get('block');
    if (get('next')) rec.next = get('next');
    if (get('closest')) rec.closest = get('closest');
    const d = _num(get('days')); if (d) rec.days = d;
    const n = _num(get('nights')); if (n) rec.nights = n;
    const pn = _num(get('pipeN')); if (pn) rec.pipeN = pn;
    const ft = _num(get('fatigue')); if (ft) rec.fatigue = ft;
  }
  const records = [...grouped.values()].map(r => {
    const hotWarm = r.visits.filter(v => ['hot', 'warm', 'proposal', 'win'].includes(v.pipeline)).length;
    return sanitizeFieldReport({
      ...r,
      pipeN: r.pipeN || hotWarm,
    });
  });
  return { records, errors, total: rows.length - headerIdx - 1 };
}
function parsePaymentImport(text) {
  const rows = parseCSV(text);
  if (rows.length < 2) return { records: [], errors: ['File kosong atau tidak ada baris data.'], total: 0 };
  const headerIdx = findHeaderRowIndex(rows, PAY_IMPORT_ALIASES, ['sphNo', 'amount']);
  if (headerIdx < 0)
    return { records: [], errors: ['Kolom wajib tidak ditemukan: butuh minimal "SPH No" dan "Amount/Jumlah".'], total: rows.length - 1 };
  const cols = buildColMap(rows[headerIdx], PAY_IMPORT_ALIASES);
  const records = []; const errors = [];
  for (let r = headerIdx + 1; r < rows.length; r++) {
    const row = rows[r]; const get = (f) => cols[f] !== undefined ? String(row[cols[f]] ?? '').trim() : '';
    const sphNo = get('sphNo'); const amount = _num(get('amount'));
    if (!sphNo || !amount) { errors.push(`Baris ${r + 1}: dilewati (No SPH / Jumlah kosong).`); continue; }
    const typeRaw = _normHdr(get('type'));
    records.push({ sphNo, type: _PAYTYPE_ALIASES[typeRaw] || 'installment', amount, date: _normDate(get('date')) || new Date().toISOString().split('T')[0], note: get('note') || '' });
  }
  return { records, errors, total: rows.length - headerIdx - 1 };
}

export { parseCSV, detectDelimiter, findHeaderRowIndex, buildColMap, SPH_IMPORT_ALIASES, _STATUS_ALIASES, _STAGE_VALID, parseSPHImport, PAY_IMPORT_ALIASES, _PAYTYPE_ALIASES, parsePaymentImport, FIELD_REPORT_IMPORT_ALIASES, parseFieldReportImport, sanitizeFieldReport };

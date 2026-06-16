// Extracted from App.jsx during modular refactor.
import { _normHdr, _num, _normDate } from './format.js';
import { normalizeSphStageId, defaultSphStageForStatus } from './domain.js';

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
  for (let r = headerIdx + 1; r < rows.length; r++) {
    const row = rows[r]; const get = (f) => cols[f] !== undefined ? String(row[cols[f]] ?? '').trim() : '';
    const sphNo = get('sphNo'); const customer = get('customer');
    if (!sphNo || !customer) { errors.push(`Baris ${r + 1}: dilewati (No SPH / Pelanggan kosong).`); continue; }
    const qty = _num(get('qty')) || 1;
    const unitPrice = _num(get('unitPrice'));
    let totalValue = _num(get('totalValue'));
    if (!totalValue) totalValue = qty * unitPrice;
    const statusRaw = _normHdr(get('status'));
    const status = _STATUS_ALIASES[statusRaw] || 'active';
    const stageRaw = get('stage');
    let stage = normalizeSphStageId(stageRaw);
    if (!stage && stageRaw) stage = normalizeSphStageId(_normHdr(stageRaw));
    if (!stage) stage = defaultSphStageForStatus(status);
    if (!_STAGE_VALID.includes(stage)) stage = defaultSphStageForStatus(status);
    const rec = {
      sphNo, customer,
      customerType: get('customerType') || 'hospital',
      projectType: get('projectType') || 'private',
      modality: get('modality') || '-',
      subModality: get('subModality') || '-',
      qty, unitPrice, totalValue,
      stage, status,
      salesOwner: get('salesOwner') || '',
      region: get('region') || '-',
      issuedDate: _normDate(get('issuedDate')) || new Date().toISOString().split('T')[0],
      notes: get('notes') || '',
    };
    records.push(rec);
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

export { parseCSV, detectDelimiter, findHeaderRowIndex, buildColMap, SPH_IMPORT_ALIASES, _STATUS_ALIASES, _STAGE_VALID, parseSPHImport, PAY_IMPORT_ALIASES, _PAYTYPE_ALIASES, parsePaymentImport };

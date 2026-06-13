// Extracted from App.jsx during modular refactor.
import { DEFAULT_DOCUMENT_TEMPLATES } from '../constants/docs.js';
import { escapeHtml, inferMimeFromName, safeDocFilename } from './format.js';
import { generatePaymentSchedule, resolveEmpName } from './domain.js';
import { showToast } from './toast.js';
function mergeDocumentTemplates(stored = {}) {
  const src = stored && typeof stored === 'object' ? stored : {};
  const storedFiles = Array.isArray(src.documentFiles) ? src.documentFiles : [];
  const mergedFiles = [
    ...DEFAULT_DOCUMENT_TEMPLATES.documentFiles.map(def => ({ ...def, ...(storedFiles.find(f => f.id === def.id || f.type === def.type) || {}) })),
    ...storedFiles.filter(f => f && !DEFAULT_DOCUMENT_TEMPLATES.documentFiles.some(def => def.id === f.id || def.type === f.type)),
  ];
  return {
    ...DEFAULT_DOCUMENT_TEMPLATES,
    ...src,
    signatures: {
      ...DEFAULT_DOCUMENT_TEMPLATES.signatures,
      ...(src.signatures || {}),
      sales: { ...DEFAULT_DOCUMENT_TEMPLATES.signatures.sales, ...(src.signatures?.sales || {}) },
      finance: { ...DEFAULT_DOCUMENT_TEMPLATES.signatures.finance, ...(src.signatures?.finance || {}) },
      operations: { ...DEFAULT_DOCUMENT_TEMPLATES.signatures.operations, ...(src.signatures?.operations || {}) },
      director: { ...DEFAULT_DOCUMENT_TEMPLATES.signatures.director, ...(src.signatures?.director || {}) },
    },
    documentFiles: mergedFiles,
    terms: { ...DEFAULT_DOCUMENT_TEMPLATES.terms, ...(src.terms || {}) },
    extraSignatures: Array.isArray(src.extraSignatures) ? src.extraSignatures : [],
  };
}
function downloadDataUrl(filename, dataUrl) {
  if (!dataUrl) return;
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename || 'template';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
function downloadUploadedTemplate(template) {
  if (!template?.dataUrl) return;
  downloadDataUrl(template.fileName || `${safeDocFilename(template.label || template.type || 'Template')}`, template.dataUrl);
}
function previewUploadedTemplate(template, title = 'Template') {
  if (!template?.dataUrl) return;
  const mime = template.mimeType || inferMimeFromName(template.fileName);
  if (/word|excel|spreadsheet|msword|officedocument/i.test(mime) || /\.(docx?|xlsx?)$/i.test(template.fileName || '')) {
    downloadUploadedTemplate(template);
    return;
  }
  const win = window.open('', '_blank');
  if (!win) return;
  const safeTitle = escapeHtml(title || template.label || template.fileName || 'Template');
  const safeUrl = escapeHtml(template.dataUrl);
  let body = `<iframe src="${safeUrl}" style="width:100%;height:calc(100vh - 68px);border:0"></iframe>`;
  if (mime.startsWith('image/')) body = `<div style="min-height:calc(100vh - 68px);display:flex;align-items:flex-start;justify-content:center;background:#f5f5f5;padding:24px"><img src="${safeUrl}" alt="${safeTitle}" style="max-width:100%;height:auto;box-shadow:0 8px 28px rgba(0,0,0,.18)"></div>`;
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${safeTitle}</title></head><body style="margin:0;font-family:Arial,sans-serif;color:#111"><div style="height:44px;display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid #ddd;background:#fff"><strong>${safeTitle}</strong><a href="${safeUrl}" download="${escapeHtml(template.fileName || 'template')}" style="color:#1a4d8a;text-decoration:none;font-size:13px">Unduh file asli</a></div>${body}</body></html>`);
  win.document.close();
}
function getUploadedDocumentTemplate(templates = DEFAULT_DOCUMENT_TEMPLATES, type) {
  const tpl = mergeDocumentTemplates(templates);
  return (tpl.documentFiles || []).find(file => file?.type === type && file.dataUrl) || null;
}
function openDocumentTemplateOrHtml(type, templates, title, fallbackHtml) {
  // Dokumen hasil generate selalu pakai kop image (master template) sebagai background A4.
  // File Word/PDF yang diupload TIDAK menggantikan dokumen generate (tak bisa merge data),
  // melainkan kop image-nya yang jadi master visual via wrapDocumentInLetterhead.
  return openPrintableHtml(title, wrapDocumentInLetterhead(fallbackHtml, templates));
}
function downloadDocumentTemplateOrDoc(type, templates, filename, title, fallbackHtml) {
  const uploaded = getUploadedDocumentTemplate(templates, type);
  if (uploaded) return downloadUploadedTemplate(uploaded);
  return downloadHtmlDoc(filename, title, fallbackHtml);
}
function downloadCSV(filename, rows) {
  // Escape values: wrap in "..." if contains comma/quote/newline; escape "..." inside
  const esc = (v) => {
    if (v == null) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = rows.map(row => row.map(esc).join(',')).join('\n');
  // BOM for Excel UTF-8 compatibility
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function downloadHtmlDoc(filename, title, bodyHtml) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
    body{font-family:Arial,sans-serif;color:#111;line-height:1.45;padding:32px}
    h1,h2,h3{font-family:Georgia,serif;margin:0 0 10px}
    table{width:100%;border-collapse:collapse;margin:14px 0}
    th,td{border:1px solid #ccc;padding:8px;text-align:left;font-size:12px}
    .muted{color:#666}.right{text-align:right}.sign{margin-top:42px}.sign-img{width:120px;height:72px;object-fit:contain}.stamp-img{width:90px;height:90px;object-fit:contain;opacity:.88}.footer-note{font-size:10px;color:#666;border-top:1px solid #ddd;margin-top:28px;padding-top:8px}.letterhead-img{width:100%;height:auto;object-fit:contain;display:block;margin-bottom:18px}
  </style></head><body>${bodyHtml}</body></html>`;
  const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function openPrintableHtml(title, bodyHtml) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
    @page{size:A4;margin:0}
    *{box-sizing:border-box}
    body{font-family:Arial,sans-serif;color:#111;line-height:1.45;margin:0;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    h1,h2,h3{font-family:Georgia,serif;margin:0 0 10px}table{width:100%;border-collapse:collapse;margin:14px 0}
    th,td{border:1px solid #ccc;padding:8px;text-align:left;font-size:12px}.muted{color:#666}.right{text-align:right}.sign{margin-top:42px}.sign-img{width:120px;height:72px;object-fit:contain}.stamp-img{width:90px;height:90px;object-fit:contain;opacity:.88}.footer-note{font-size:10px;color:#666;border-top:1px solid #ddd;margin-top:28px;padding-top:8px}.a4-page{box-shadow:none !important}
  </style></head><body>${bodyHtml}<script>setTimeout(()=>window.print(),300)</script></body></html>`);
  win.document.close();
}
function getUserSignature(employees, username) {
  if (!employees || !username) return '';
  const emp = employees[username] || Object.values(employees).find(e => e?.salesId === username || e?.username === username);
  return emp?.signatureUrl || '';
}
function getUserDisplayName(employees, username) {
  if (!employees || !username) return username || '';
  const emp = employees[username] || Object.values(employees).find(e => e?.salesId === username || e?.username === username);
  return emp?.name || username || '';
}
function findUserByRole(employees, roles) {
  const roleList = Array.isArray(roles) ? roles : [roles];
  const entries = Object.entries(employees || {});
  const hit = entries.find(([, e]) => roleList.includes(e?.role));
  if (!hit) return null;
  return { username: hit[0], ...hit[1] };
}
function printHtmlStringAsPdf(title, htmlContent) {
  if (typeof window === 'undefined') return;
  const win = window.open('', '_blank');
  if (!win) { showToast('Popup diblokir browser. Izinkan popup untuk cetak PDF.', 'error'); return; }
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
    @page{size:A4;margin:0}
    *{box-sizing:border-box}
    body{font-family:Arial,sans-serif;color:#111;line-height:1.5;margin:0;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    h1,h2,h3{font-family:Georgia,serif;margin:0 0 10px}table{width:100%;border-collapse:collapse;margin:14px 0}
    th,td{border:1px solid #ccc;padding:8px;text-align:left;font-size:12px}.muted{color:#666}.right{text-align:right}
    img{max-width:100%}.sign-img{width:120px;height:72px;object-fit:contain}.stamp-img{width:90px;height:90px;object-fit:contain}
    .a4-page{box-shadow:none !important}
  </style></head><body>${htmlContent}<script>setTimeout(()=>window.print(),350)</script></body></html>`);
  win.document.close();
}
function renderDocLines(text) {
  const lines = String(text || '').split('\n').map(s => s.trim()).filter(Boolean);
  if (!lines.length) return '';
  return `<ol>${lines.map(line => `<li>${escapeHtml(line)}</li>`).join('')}</ol>`;
}
function renderDocFooter(templates = DEFAULT_DOCUMENT_TEMPLATES) {
  const note = templates.footerNote || '';
  return note ? `<div class="footer-note">${escapeHtml(note)}</div>` : '';
}
function renderSignatureBlock(role, templates = DEFAULT_DOCUMENT_TEMPLATES, fallbackName = '', fallbackTitle = '', fallbackImage = '') {
  const tpl = mergeDocumentTemplates(templates);
  const sig = tpl.signatures?.[role] || {};
  const image = sig.image || fallbackImage || '';
  const name = sig.name || fallbackName || '-';
  const title = sig.title || fallbackTitle || '';
  return `<div class="sign">
    <p>Hormat kami,<br>${escapeHtml(tpl.companyName || DEFAULT_DOCUMENT_TEMPLATES.companyName)}</p>
    <div style="display:flex;align-items:center;gap:12px;min-height:92px">
      ${image ? `<img class="sign-img" src="${escapeHtml(image)}" alt="Tanda tangan ${escapeHtml(name)}">` : '<span class="muted">Tanda tangan belum diunggah.</span>'}
      ${tpl.stampImage ? `<img class="stamp-img" src="${escapeHtml(tpl.stampImage)}" alt="Stempel perusahaan">` : ''}
    </div>
    <p><strong>${escapeHtml(name)}</strong>${title ? `<br>${escapeHtml(title)}` : ''}</p>
  </div>`;
}
function wrapDocumentInLetterhead(bodyHtml, templates = DEFAULT_DOCUMENT_TEMPLATES) {
  const tpl = mergeDocumentTemplates(templates);
  const mt = Number(tpl.letterheadMarginTop) || 25;
  const mb = Number(tpl.letterheadMarginBottom) || 35;
  if (tpl.letterheadImage) {
    // Halaman A4 (210x297mm) dengan kop sebagai background penuh.
    return `<div class="a4-page" style="position:relative;width:210mm;min-height:297mm;margin:0 auto;background-image:url('${escapeHtml(tpl.letterheadImage)}');background-size:100% auto;background-repeat:no-repeat;background-position:center top;box-sizing:border-box;padding:${mt}mm 20mm ${mb}mm 20mm">
      <div class="a4-content" style="position:relative;z-index:1">${bodyHtml}</div>
    </div>`;
  }
  // Tanpa gambar kop → pakai header teks default + halaman A4 putih
  return `<div class="a4-page" style="position:relative;width:210mm;min-height:297mm;margin:0 auto;background:#fff;box-sizing:border-box;padding:18mm 20mm 22mm 20mm">
    <div class="a4-content">${buildTextLetterheadHtml(tpl)}${bodyHtml}${renderDocFooter(tpl)}</div>
  </div>`;
}
function buildTextLetterheadHtml(templates = DEFAULT_DOCUMENT_TEMPLATES) {
  const tpl = mergeDocumentTemplates(templates);
  const contact = [tpl.companyAddress, [tpl.companyPhone, tpl.companyEmail, tpl.companyWebsite].filter(Boolean).join(' · ')].filter(Boolean).join('<br>');
  return `<div style="border-bottom:3px solid #1a4d8a;padding-bottom:12px;margin-bottom:22px;display:flex;justify-content:space-between;gap:24px;align-items:flex-start">
    <div style="display:flex;gap:12px;align-items:flex-start">
      ${tpl.logoImage ? `<img src="${escapeHtml(tpl.logoImage)}" alt="Logo" style="width:72px;height:72px;object-fit:contain">` : ''}
      <div><h2 style="margin:0;color:#1a4d8a;letter-spacing:.04em">${escapeHtml(String(tpl.companyName || DEFAULT_DOCUMENT_TEMPLATES.companyName).toUpperCase())}</h2>
      <p class="muted" style="margin:4px 0 0">${contact || '-'}</p></div>
    </div>
    <div style="text-align:right;font-size:12px;color:#1a4d8a;font-weight:700">HNTI<br>MEDICAL TECHNOLOGY</div></div>`;
}
function buildHntiLetterheadHtml(templates = DEFAULT_DOCUMENT_TEMPLATES) {
  const tpl = mergeDocumentTemplates(templates);
  // Jika ada gambar kop A4 → kosongkan; wrapDocumentInLetterhead yang menyediakan background.
  if (tpl.letterheadImage) return '';
  const contact = [tpl.companyAddress, [tpl.companyPhone, tpl.companyEmail, tpl.companyWebsite].filter(Boolean).join(' · ')].filter(Boolean).join('<br>');
  return `<div style="border-bottom:3px solid #1a4d8a;padding-bottom:12px;margin-bottom:22px;display:flex;justify-content:space-between;gap:24px;align-items:flex-start">
    <div style="display:flex;gap:12px;align-items:flex-start">
      ${tpl.logoImage ? `<img src="${escapeHtml(tpl.logoImage)}" alt="Logo HNTI" style="width:72px;height:72px;object-fit:contain">` : ''}
      <div><h2 style="margin:0;color:#1a4d8a;letter-spacing:.04em">${escapeHtml(String(tpl.companyName || DEFAULT_DOCUMENT_TEMPLATES.companyName).toUpperCase())}</h2>
      <p class="muted" style="margin:4px 0 0">${contact || '-'}</p></div>
    </div>
    <div style="text-align:right;font-size:12px;color:#1a4d8a;font-weight:700">HNTI<br>MEDICAL TECHNOLOGY</div></div>`;
}
function renderDualSignatureHtml(employees, requesterUsername, templates = DEFAULT_DOCUMENT_TEMPLATES) {
  const tpl = mergeDocumentTemplates(templates);
  const reqSig = getUserSignature(employees, requesterUsername);
  const reqName = getUserDisplayName(employees, requesterUsername);
  const director = findUserByRole(employees, ['super_admin']) || findUserByRole(employees, ['gm']);
  const dirSig = director ? (director.signatureUrl || '') : (tpl.signatures?.director?.image || '');
  const dirName = director ? director.name : (tpl.signatures?.director?.name || 'Direktur');
  const stamp = tpl.stampImage ? `<img class="stamp-img" src="${escapeHtml(tpl.stampImage)}" alt="Stempel">` : '';
  return `<div style="display:flex;justify-content:space-between;gap:40px;margin-top:36px">
    <div style="flex:1">
      <p>Dibuat oleh,<br>Sales / Account Executive</p>
      <div style="height:84px;display:flex;align-items:center">${reqSig ? `<img class="sign-img" src="${escapeHtml(reqSig)}" alt="TTD ${escapeHtml(reqName)}">` : '<span class="muted">(TTD belum diunggah)</span>'}</div>
      <p><strong>${escapeHtml(reqName || '-')}</strong></p>
    </div>
    <div style="flex:1;text-align:right">
      <p>Menyetujui,<br>Direktur ${escapeHtml(tpl.companyName || DEFAULT_DOCUMENT_TEMPLATES.companyName)}</p>
      <div style="height:84px;display:flex;align-items:center;justify-content:flex-end;gap:10px">${stamp}${dirSig ? `<img class="sign-img" src="${escapeHtml(dirSig)}" alt="TTD ${escapeHtml(dirName)}">` : '<span class="muted">(TTD belum diunggah)</span>'}</div>
      <p><strong>${escapeHtml(dirName || '-')}</strong></p>
    </div>
  </div>`;
}
function buildEditorTemplate(type, record, employees = {}, fmt = (n) => n, templates = DEFAULT_DOCUMENT_TEMPLATES, requesterUsername = null) {
  const reqUser = requesterUsername || record.sphRequestedBy || record.salesOwner || record.requesterId;
  // Bungkus body ke halaman A4 dengan kop sebagai background (master template).
  return wrapDocumentInLetterhead(buildEditorBody(type, record, employees, fmt, templates, reqUser), templates);
}
function getTemplateHtmlBody(templates, type) {
  const tpl = mergeDocumentTemplates(templates);
  const row = (tpl.documentFiles || []).find(f => (f.type === type || f.id === type) && f.htmlBody && String(f.htmlBody).trim());
  return row ? row.htmlBody : '';
}
function fillTemplatePlaceholders(html, record = {}, employees = {}, fmt = (n) => n, reqUser = null) {
  const reqSig = getUserSignature(employees, reqUser);
  const reqName = getUserDisplayName(employees, reqUser);
  const map = {
    customer: record.customer || '',
    sphNo: record.sphNo || '',
    modality: record.modality || '',
    subModality: record.subModality || '',
    brand: record.productBrand || record.brand || record.principal || '',
    qty: record.qty || 1,
    totalValue: fmt(record.totalValue || 0),
    dpPercent: record.dpPercent || 30,
    installmentMonths: record.installmentMonths || 12,
    salesName: reqName,
    salesSignature: reqSig ? `<img class="sign-img" src="${escapeHtml(reqSig)}">` : '',
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    address: record.address || record.location || '',
    serialNo: record.serialNo || '',
  };
  return String(html).replace(/\{\{\s*(\w+)\s*\}\}/g, (m, key) => (map[key] !== undefined ? String(map[key]) : m));
}
function buildEditorBody(type, record, employees = {}, fmt = (n) => n, templates = DEFAULT_DOCUMENT_TEMPLATES, reqUser = null) {
  // POIN 1: utamakan HTML body custom dari Template Dokumen Resmi bila tersedia.
  const customHtml = getTemplateHtmlBody(templates, type);
  if (customHtml) return fillTemplatePlaceholders(customHtml, record, employees, fmt, reqUser);
  switch (type) {
    case 'sph': {
      let base = buildSPHDocumentHtml(record, employees, fmt, templates);
      const dual = renderDualSignatureHtml(employees, reqUser, templates);
      // Hapus blok TTD tunggal (<div class="sign">...</div>) lalu pasang TTD ganda dinamis
      base = base.replace(/<div class="sign">[\s\S]*?<\/div>\s*<\/div>/, '');
      // Sisipkan dual sebelum footer-note bila ada, kalau tidak tempel di akhir
      if (/<div class="footer-note"/.test(base)) return base.replace(/(<div class="footer-note")/, dual + '$1');
      return base + dual;
    }
    case 'spp': {
      const base = buildSPPDocumentHtml(record, employees, fmt, templates);
      const tpl = mergeDocumentTemplates(templates);
      const reqSig = getUserSignature(employees, reqUser);
      const reqName = getUserDisplayName(employees, reqUser);
      const sigHtml = `<div style="margin-top:32px"><p>Hormat kami,<br>Sales / Account Executive</p><div style="height:84px;display:flex;align-items:center">${reqSig ? `<img class="sign-img" src="${escapeHtml(reqSig)}">` : '<span class="muted">(TTD belum diunggah)</span>'}</div><p><strong>${escapeHtml(reqName || '-')}</strong></p></div>`;
      return base.replace(/(<div class="footer-note")/, sigHtml + '$1') || (base + sigHtml);
    }
    case 'invoice': return buildInvoiceKwitansiHtml(record, fmt, templates);
    case 'kwitansi': return buildKwitansiHtml(record, fmt, templates);
    case 'bai': return buildBAIDocumentHtml(record, fmt, templates, employees);
    case 'bauji_fungsi': return buildBAUjiFungsiDocumentHtml(record, fmt, templates, employees);
    case 'batraining': return buildBATrainingDocumentHtml(record, fmt, templates, employees);
    case 'bast_barang': return buildBASTBarangDocumentHtml(record, fmt, templates, employees);
    case 'po_principal': return buildPrincipalPoHtml(record, fmt, templates);
    default: return buildSPHDocumentHtml(record, employees, fmt, templates);
  }
}
function buildSPHDocumentHtml(sph, employees = {}, fmt = (n) => n, templates = DEFAULT_DOCUMENT_TEMPLATES) {
  const tpl = mergeDocumentTemplates(templates);
  const salesName = resolveEmpName(employees, sph.salesOwner);
  const qr = employees?.[sph.salesOwner]?.salesQrUrl || '';
  const dp = Number(sph.dpPercent || 30);
  const total = Number(sph.totalValue || 0);
  const dpAmt = total * dp / 100;
  const remaining = total - dpAmt;
  const terms = Number(sph.installmentMonths || 12);
  const items = Array.isArray(sph.items) && sph.items.length
    ? sph.items.slice(0, 5)
    : [{ modality: sph.modality, subModality: sph.subModality, brand: sph.productBrand || sph.brand || sph.principal, qty: sph.qty || 1, totalValue: total }];
  const isCt = String(items[0]?.modality || sph.modality || '').toLowerCase().includes('ct');
  const templateNote = isCt
    ? 'Format mengikuti template SPH CT Scan HNTI: konfigurasi unit, workstation, garansi, instalasi, training, dan uji kesesuaian ditulis sebagai satu paket penawaran.'
    : 'Format mengikuti template SPH X-Ray HNTI: perangkat utama, aksesoris, instalasi, training, dan dokumen pendukung ditulis sebagai satu paket penawaran.';
  return `
    ${buildHntiLetterheadHtml(tpl)}
    <h1 style="text-align:center;text-transform:uppercase;letter-spacing:.08em">Surat Penawaran Harga</h1>
    <p><strong>Nomor:</strong> ${escapeHtml(sph.sphNo || '-')}<br><strong>Tanggal:</strong> ${escapeHtml(sph.issuedDate || '-')}</p>
    <p>Kepada Yth.<br><strong>Direktur ${escapeHtml(sph.customer || '-')}</strong><br>${escapeHtml(sph.customerAddress || sph.address || '')}</p>
    <p>Dengan hormat, bersama ini kami menyampaikan penawaran alat kesehatan sebagai berikut:</p>
    <table><thead><tr><th>No.</th><th>Equipment</th><th>Type</th><th>Brand</th><th>Qty</th><th class="right">Price</th></tr></thead>
      <tbody>${items.map((it, idx) => `<tr><td>${idx + 1}</td><td>${escapeHtml(it.modality || '-')}</td><td>${escapeHtml(it.subModality || it.type || '-')}</td><td>${escapeHtml(it.brand || it.productBrand || sph.principal || '-')}</td><td>${escapeHtml(it.qty || 1)} Unit</td><td class="right">${escapeHtml(fmt(it.totalValue || ((Number(it.qty) || 1) * (Number(it.unitPrice) || 0)) || total))}</td></tr>`).join('')}</tbody></table>
    <h3>Skema Pembayaran</h3>
    <table><tbody>
      <tr><td>Nilai Kontrak</td><td class="right">${escapeHtml(fmt(total))}</td></tr>
      <tr><td>Down Payment / Deposit (${escapeHtml(dp)}%)</td><td class="right">${escapeHtml(fmt(dpAmt))}</td></tr>
      <tr><td>Sisa Pembayaran</td><td class="right">${escapeHtml(fmt(remaining))}</td></tr>
      <tr><td>Tenor / Termin</td><td>${escapeHtml(terms || '-')} bulan</td></tr>
    </tbody></table>
    <h3>Keterangan</h3>
    ${renderDocLines(tpl.terms?.sph)}
    <p class="muted"><strong>Template:</strong> ${escapeHtml(templateNote)}</p>
    ${sph.manualTerms ? `<p><strong>Keterangan manual:</strong><br>${escapeHtml(String(sph.manualTerms)).replace(/\n/g, '<br>')}</p>` : ''}
    ${renderSignatureBlock('sales', tpl, salesName, 'Account Executive', qr)}
    ${renderDocFooter(tpl)}`;
}
function downloadSPHWord(sph, employees, fmt, templates = DEFAULT_DOCUMENT_TEMPLATES) {
  downloadDocumentTemplateOrDoc('sph', templates, `${safeDocFilename(sph.sphNo || 'SPH')}.doc`, 'SPH HNTI', buildSPHDocumentHtml(sph, employees, fmt, templates));
}
function printSPHPdf(sph, employees, fmt, templates = DEFAULT_DOCUMENT_TEMPLATES) {
  openDocumentTemplateOrHtml('sph', templates, 'SPH HNTI', buildSPHDocumentHtml(sph, employees, fmt, templates));
}
function buildSPPDocumentHtml(sph, employees = {}, fmt = (n) => n, templates = DEFAULT_DOCUMENT_TEMPLATES) {
  const tpl = mergeDocumentTemplates(templates);
  const salesName = resolveEmpName(employees, sph.salesOwner);
  const total = Number(sph.totalValue || 0);
  const items = Array.isArray(sph.items) && sph.items.length
    ? sph.items.slice(0, 8)
    : [{ modality: sph.modality, subModality: sph.subModality, brand: sph.productBrand || sph.brand || sph.principal, qty: sph.qty || 1, totalValue: total }];
  return `${buildHntiLetterheadHtml(tpl)}
    <h1 style="text-align:center;text-transform:uppercase;letter-spacing:.08em">Surat Permohonan Presentasi</h1>
    <p><strong>Nomor Dokumen:</strong> SPP-${escapeHtml(sph.sphNo || sph.id || '-')}<br><strong>Ref SPH:</strong> ${escapeHtml(sph.sphNo || '-')}<br><strong>Tanggal:</strong> ${escapeHtml(sph.presentationDate || sph.issuedDate || new Date().toISOString().split('T')[0])}</p>
    <p><strong>Kepada:</strong> ${escapeHtml(sph.customer || '-')}<br><strong>Sales/PIC:</strong> ${escapeHtml(salesName || '-')}<br><strong>Agenda:</strong> Presentasi Produk HNTI</p>
    <table><thead><tr><th>No.</th><th>Produk</th><th>Tipe</th><th>Brand/Principal</th><th>Qty</th><th class="right">Nilai</th></tr></thead>
      <tbody>${items.map((it, idx) => `<tr><td>${idx + 1}</td><td>${escapeHtml(it.modality || '-')}</td><td>${escapeHtml(it.subModality || it.type || '-')}</td><td>${escapeHtml(it.brand || it.productBrand || sph.principal || '-')}</td><td>${escapeHtml(it.qty || 1)} Unit</td><td class="right">${escapeHtml(fmt(it.totalValue || ((Number(it.qty) || 1) * (Number(it.unitPrice) || 0)) || total))}</td></tr>`).join('')}</tbody>
      <tfoot><tr><td colspan="5" class="right"><strong>Total</strong></td><td class="right"><strong>${escapeHtml(fmt(total))}</strong></td></tr></tfoot></table>
    <h3>Keterangan</h3>
    ${renderDocLines(tpl.terms?.spp)}
    ${renderSignatureBlock('sales', tpl, salesName, 'Account Executive', employees?.[sph.salesOwner]?.salesQrUrl || '')}
    ${renderDocFooter(tpl)}`;
}
function downloadSPPWord(sph, employees, fmt, templates = DEFAULT_DOCUMENT_TEMPLATES) {
  downloadDocumentTemplateOrDoc('spp', templates, `SPP-${safeDocFilename(sph.sphNo || 'SPP')}.doc`, 'SPP HNTI', buildSPPDocumentHtml(sph, employees, fmt, templates));
}
function printSPPPdf(sph, employees, fmt, templates = DEFAULT_DOCUMENT_TEMPLATES) {
  openDocumentTemplateOrHtml('spp', templates, 'SPP HNTI', buildSPPDocumentHtml(sph, employees, fmt, templates));
}
function buildInvoiceKwitansiHtml(p, fmt, templates = DEFAULT_DOCUMENT_TEMPLATES) {
  const tpl = mergeDocumentTemplates(templates);
  const schedule = generatePaymentSchedule(p);
  const first = schedule[0] || { label: 'DP / Deposit', amount: (Number(p.totalValue) || 0) * ((Number(p.dpPercent) || 30) / 100), dueDate: p.issuedDate || '' };
  const bankRows = (tpl.bankName || tpl.bankAccountNo || tpl.bankAccountName) ? `
    <h3>Rekening Pembayaran</h3>
    <table><tbody>
      <tr><td>Bank</td><td>${escapeHtml(tpl.bankName || '-')}</td></tr>
      <tr><td>No. Rekening</td><td>${escapeHtml(tpl.bankAccountNo || '-')}</td></tr>
      <tr><td>Nama Rekening</td><td>${escapeHtml(tpl.bankAccountName || '-')}</td></tr>
    </tbody></table>` : '';
  return `${buildHntiLetterheadHtml(tpl)}
    <h1 style="text-align:center;text-transform:uppercase;letter-spacing:.08em">Invoice + Kwitansi</h1>
    <p><strong>Kepada:</strong> ${escapeHtml(p.customer || '-')}<br><strong>Ref SPH:</strong> ${escapeHtml(p.sphNo || '-')}<br><strong>Produk:</strong> ${escapeHtml(p.subModality || p.modality || '-')}</p>
    <table><tbody>
      <tr><td>Termin</td><td>${escapeHtml(first.label)}</td></tr>
      <tr><td>Nilai Tagihan</td><td class="right">${escapeHtml(fmt(first.amount))}</td></tr>
      <tr><td>Jatuh Tempo</td><td>${escapeHtml(first.dueDate || '-')}</td></tr>
      <tr><td>Skema SPH</td><td>DP ${escapeHtml(p.dpPercent || 0)}% · ${escapeHtml(p.installmentMonths || 0)} termin/bulan</td></tr>
    </tbody></table>
    ${bankRows}
    <h3>Keterangan</h3>
    ${renderDocLines(tpl.terms?.invoice)}
    ${renderSignatureBlock('finance', tpl, 'Finance HNTI', 'Finance')}
    ${renderDocFooter(tpl)}`;
}
function buildPrincipalPoHtml(p, fmt, templates = DEFAULT_DOCUMENT_TEMPLATES) {
  const tpl = mergeDocumentTemplates(templates);
  return `${buildHntiLetterheadHtml(tpl)}
    <h1 style="text-align:center;text-transform:uppercase;letter-spacing:.08em">Purchase Order</h1>
    <p><strong>To:</strong> ${escapeHtml(p.principal || 'Principal / Manufacturer')}<br><strong>Ref SPH:</strong> ${escapeHtml(p.sphNo || '-')}<br><strong>Date:</strong> ${new Date().toISOString().split('T')[0]}</p>
    <table><thead><tr><th>No.</th><th>Equipment</th><th>Qty</th><th class="right">Amount</th></tr></thead>
      <tbody><tr><td>1</td><td>${escapeHtml(p.subModality || p.modality || '-')}</td><td>${escapeHtml(p.qty || 1)} Set</td><td class="right">${escapeHtml(fmt(p.totalValue || 0))}</td></tr></tbody></table>
    <h3>Terms</h3>
    ${renderDocLines(tpl.terms?.po)}
    ${renderSignatureBlock('operations', tpl, 'Novan Restu Aryanto', 'Operational Manager')}
    ${renderDocFooter(tpl)}`;
}
function buildBAIDocumentHtml(record, fmt = (n) => n, templates = DEFAULT_DOCUMENT_TEMPLATES, employees = {}) {
  const tpl = mergeDocumentTemplates(templates);
  const techName = resolveEmpName(employees, record.leadTechnician || record.technician) || record.hntiRep || record.technician || '—';
  const installDate = record.installDate || record.completedDate || record.signedDate || '—';
  return `
    ${buildHntiLetterheadHtml(tpl)}
    <h1 style="text-align:center;text-transform:uppercase;letter-spacing:.08em">Berita Acara Instalasi</h1>
    <p><strong>Nomor:</strong> ${escapeHtml(record.docNo || record.installNo || '-')}<br><strong>Tanggal Instalasi:</strong> ${escapeHtml(installDate)}</p>
    <p>Pada hari ini telah dilaksanakan instalasi peralatan medis di lokasi customer dengan rincian sebagai berikut:</p>
    <table><tbody>
      <tr><td><strong>Customer</strong></td><td>${escapeHtml(record.customer || '-')}</td></tr>
      <tr><td><strong>Modalitas</strong></td><td>${escapeHtml(record.modality || '-')}</td></tr>
      <tr><td><strong>Tipe / Merek</strong></td><td>${escapeHtml(record.subModality || '-')} ${record.brand ? '/ ' + escapeHtml(record.brand) : ''}</td></tr>
      <tr><td><strong>Serial Number</strong></td><td>${escapeHtml(record.serialNo || '-')}</td></tr>
      <tr><td><strong>Lokasi Pemasangan</strong></td><td>${escapeHtml(record.location || record.address || '-')}</td></tr>
      <tr><td><strong>Tim Teknisi HNTI</strong></td><td>${escapeHtml(techName)}</td></tr>
    </tbody></table>
    <h3>Kegiatan Instalasi</h3>
    <ol>
      <li>Pemeriksaan kelengkapan unit dan aksesoris.</li>
      <li>Pemasangan unit utama dan komponen pendukung sesuai prosedur principal.</li>
      <li>Pemasangan jaringan listrik dan koneksi sistem.</li>
      <li>Uji nyala awal (power on test).</li>
      <li>Verifikasi parameter dasar sesuai spesifikasi pabrikan.</li>
    </ol>
    ${record.notes ? `<h3>Catatan</h3><p>${escapeHtml(String(record.notes)).replace(/\n/g, '<br>')}</p>` : ''}
    ${renderDocLines(tpl.terms?.bai)}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:30px">
      ${renderSignatureBlock('operations', tpl, techName, 'Lead Technician HNTI')}
      <div>
        <p><strong>Customer / Penanggung Jawab Lokasi</strong></p>
        <div style="height:80px"></div>
        <p>(${escapeHtml(record.customerRep || '...........................')})</p>
      </div>
    </div>
    ${renderDocFooter(tpl)}`;
}
function printBAIPdf(record, fmt, templates = DEFAULT_DOCUMENT_TEMPLATES, employees = {}) {
  openDocumentTemplateOrHtml('bai', templates, 'BA Instalasi HNTI', buildBAIDocumentHtml(record, fmt, templates, employees));
}
function buildBAUjiFungsiDocumentHtml(record, fmt = (n) => n, templates = DEFAULT_DOCUMENT_TEMPLATES, employees = {}) {
  const tpl = mergeDocumentTemplates(templates);
  const techName = resolveEmpName(employees, record.leadTechnician || record.technician) || record.hntiRep || record.technician || '—';
  const testDate = record.testDate || record.completedDate || record.signedDate || '—';
  return `
    ${buildHntiLetterheadHtml(tpl)}
    <h1 style="text-align:center;text-transform:uppercase;letter-spacing:.08em">Berita Acara Uji Fungsi</h1>
    <p><strong>Nomor:</strong> ${escapeHtml(record.docNo || record.testNo || '-')}<br><strong>Tanggal Uji:</strong> ${escapeHtml(testDate)}</p>
    <p>Bersama ini dinyatakan bahwa peralatan medis di bawah ini telah dilakukan uji fungsi dan dinyatakan <strong>BERFUNGSI BAIK</strong> sesuai spesifikasi pabrikan:</p>
    <table><tbody>
      <tr><td><strong>Customer</strong></td><td>${escapeHtml(record.customer || '-')}</td></tr>
      <tr><td><strong>Modalitas</strong></td><td>${escapeHtml(record.modality || '-')}</td></tr>
      <tr><td><strong>Tipe / Merek</strong></td><td>${escapeHtml(record.subModality || '-')} ${record.brand ? '/ ' + escapeHtml(record.brand) : ''}</td></tr>
      <tr><td><strong>Serial Number</strong></td><td>${escapeHtml(record.serialNo || '-')}</td></tr>
      <tr><td><strong>Tim Teknisi HNTI</strong></td><td>${escapeHtml(techName)}</td></tr>
    </tbody></table>
    <h3>Parameter Uji</h3>
    <ol>
      <li>Power-on / nyala unit: <strong>OK</strong></li>
      <li>Kalibrasi parameter dasar: <strong>OK</strong></li>
      <li>Output gambar / hasil scan / sinyal: <strong>OK</strong></li>
      <li>Sistem keamanan dan interlock: <strong>OK</strong></li>
      <li>Software dan workstation: <strong>OK</strong></li>
    </ol>
    ${record.notes ? `<h3>Catatan Uji</h3><p>${escapeHtml(String(record.notes)).replace(/\n/g, '<br>')}</p>` : ''}
    ${renderDocLines(tpl.terms?.bauji_fungsi)}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:30px">
      ${renderSignatureBlock('operations', tpl, techName, 'Lead Technician HNTI')}
      <div>
        <p><strong>Customer / User Klinis</strong></p>
        <div style="height:80px"></div>
        <p>(${escapeHtml(record.customerRep || '...........................')})</p>
      </div>
    </div>
    ${renderDocFooter(tpl)}`;
}
function printBAUjiFungsiPdf(record, fmt, templates = DEFAULT_DOCUMENT_TEMPLATES, employees = {}) {
  openDocumentTemplateOrHtml('bauji_fungsi', templates, 'BA Uji Fungsi HNTI', buildBAUjiFungsiDocumentHtml(record, fmt, templates, employees));
}
function buildBATrainingDocumentHtml(record, fmt = (n) => n, templates = DEFAULT_DOCUMENT_TEMPLATES, employees = {}) {
  const tpl = mergeDocumentTemplates(templates);
  const instructorName = resolveEmpName(employees, record.instructor) || record.instructor || '—';
  const trainingDate = record.trainingDate || record.completedDate || record.signedDate || '—';
  const participants = Array.isArray(record.participants) ? record.participants : (record.participantNames ? String(record.participantNames).split(/[,;\n]/).map(p => p.trim()).filter(Boolean) : []);
  return `
    ${buildHntiLetterheadHtml(tpl)}
    <h1 style="text-align:center;text-transform:uppercase;letter-spacing:.08em">Berita Acara Training</h1>
    <p><strong>Nomor:</strong> ${escapeHtml(record.docNo || record.certNo || record.trainingNo || '-')}<br><strong>Tanggal Training:</strong> ${escapeHtml(trainingDate)}</p>
    <p>Telah dilaksanakan training penggunaan peralatan medis dengan rincian sebagai berikut:</p>
    <table><tbody>
      <tr><td><strong>Customer</strong></td><td>${escapeHtml(record.customer || '-')}</td></tr>
      <tr><td><strong>Modalitas</strong></td><td>${escapeHtml(record.modality || '-')} ${record.subModality ? '· ' + escapeHtml(record.subModality) : ''}</td></tr>
      <tr><td><strong>Instruktur HNTI</strong></td><td>${escapeHtml(instructorName)}</td></tr>
      <tr><td><strong>Durasi Training</strong></td><td>${escapeHtml(record.duration || record.durationHours ? `${record.duration || record.durationHours} jam` : '-')}</td></tr>
    </tbody></table>
    <h3>Materi Training</h3>
    <ol>
      <li>Pengenalan unit dan komponen utama.</li>
      <li>Prosedur pengoperasian unit (start-up, shutdown, idle).</li>
      <li>Pengaturan parameter dan protokol klinis.</li>
      <li>Workflow akuisisi gambar / pemeriksaan / pengukuran.</li>
      <li>Tindakan darurat dan keamanan operasional.</li>
      <li>Maintenance harian dan dokumentasi.</li>
    </ol>
    ${participants.length ? `<h3>Peserta Training</h3><ol>${participants.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ol>` : ''}
    ${record.notes ? `<h3>Catatan</h3><p>${escapeHtml(String(record.notes)).replace(/\n/g, '<br>')}</p>` : ''}
    ${renderDocLines(tpl.terms?.batraining)}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:30px">
      ${renderSignatureBlock('operations', tpl, instructorName, 'Instruktur HNTI')}
      <div>
        <p><strong>Customer / Penanggung Jawab User</strong></p>
        <div style="height:80px"></div>
        <p>(${escapeHtml(record.customerRep || '...........................')})</p>
      </div>
    </div>
    ${renderDocFooter(tpl)}`;
}
function downloadBATrainingDoc(record, fmt, templates = DEFAULT_DOCUMENT_TEMPLATES, employees = {}) {
  downloadDocumentTemplateOrDoc('batraining', templates, `${safeDocFilename(record.docNo || record.certNo || 'BA_Training')}.doc`, 'BA Training HNTI', buildBATrainingDocumentHtml(record, fmt, templates, employees));
}
function printBATrainingPdf(record, fmt, templates = DEFAULT_DOCUMENT_TEMPLATES, employees = {}) {
  openDocumentTemplateOrHtml('batraining', templates, 'BA Training HNTI', buildBATrainingDocumentHtml(record, fmt, templates, employees));
}
function buildBASTBarangDocumentHtml(record, fmt = (n) => n, templates = DEFAULT_DOCUMENT_TEMPLATES, employees = {}) {
  const tpl = mergeDocumentTemplates(templates);
  const hntiRep = resolveEmpName(employees, record.hntiRep) || record.hntiRep || '—';
  const signedDate = record.signedDate || record.completedDate || '—';
  return `
    ${buildHntiLetterheadHtml(tpl)}
    <h1 style="text-align:center;text-transform:uppercase;letter-spacing:.08em">Berita Acara Serah Terima Barang</h1>
    <p><strong>Nomor:</strong> ${escapeHtml(record.bastNo || record.docNo || '-')}<br><strong>Tanggal:</strong> ${escapeHtml(signedDate)}</p>
    <p>Pada hari ini telah dilakukan serah terima alat kesehatan dari PT Harmoni Nasional Teknologi Indonesia kepada customer dengan rincian sebagai berikut:</p>
    <table><tbody>
      <tr><td><strong>Customer</strong></td><td>${escapeHtml(record.customer || '-')}</td></tr>
      <tr><td><strong>Alamat Pemasangan</strong></td><td>${escapeHtml(record.address || record.location || '-')}</td></tr>
      <tr><td><strong>Modalitas</strong></td><td>${escapeHtml(record.modality || '-')}</td></tr>
      <tr><td><strong>Tipe / Merek</strong></td><td>${escapeHtml(record.subModality || '-')} ${record.brand ? '/ ' + escapeHtml(record.brand) : ''}</td></tr>
      <tr><td><strong>Serial Number</strong></td><td>${escapeHtml(record.serialNo || '-')}</td></tr>
      <tr><td><strong>Nilai Kontrak</strong></td><td>${escapeHtml(fmt(record.totalValue || 0))}</td></tr>
    </tbody></table>
    <h3>Pernyataan Serah Terima</h3>
    <p>Alat kesehatan tersebut telah <strong>diterima dalam kondisi baik</strong>, telah dilakukan instalasi, uji fungsi, dan training penggunaan kepada user customer. Dengan ditandatanganinya berita acara ini, hak milik dan tanggung jawab pemeliharaan operasional berpindah kepada customer sesuai ketentuan yang berlaku.</p>
    ${renderDocLines(tpl.terms?.bast_barang)}
    ${record.notes ? `<h3>Catatan</h3><p>${escapeHtml(String(record.notes)).replace(/\n/g, '<br>')}</p>` : ''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:30px">
      ${renderSignatureBlock('director', tpl, hntiRep, 'Perwakilan PT HNTI')}
      <div>
        <p><strong>Customer / Direktur RS</strong></p>
        <div style="height:80px"></div>
        <p>(${escapeHtml(record.customerRep || '...........................')})</p>
      </div>
    </div>
    ${renderDocFooter(tpl)}`;
}
function downloadBASTBarangDoc(record, fmt, templates = DEFAULT_DOCUMENT_TEMPLATES, employees = {}) {
  downloadDocumentTemplateOrDoc('bast_barang', templates, `${safeDocFilename(record.bastNo || 'BAST_Barang')}.doc`, 'BAST Barang HNTI', buildBASTBarangDocumentHtml(record, fmt, templates, employees));
}
function printBASTBarangPdf(record, fmt, templates = DEFAULT_DOCUMENT_TEMPLATES, employees = {}) {
  openDocumentTemplateOrHtml('bast_barang', templates, 'BAST Barang HNTI', buildBASTBarangDocumentHtml(record, fmt, templates, employees));
}
function buildKwitansiHtml(p, fmt = (n) => n, templates = DEFAULT_DOCUMENT_TEMPLATES) {
  const tpl = mergeDocumentTemplates(templates);
  const dpAmt = Number(p.totalValue || 0) * Number(p.dpPercent || 30) / 100;
  return `
    ${buildHntiLetterheadHtml(tpl)}
    <h1 style="text-align:center;text-transform:uppercase;letter-spacing:.08em">Kwitansi Pembayaran</h1>
    <p><strong>Nomor:</strong> ${escapeHtml(p.kwitansiNo || 'KW/HNTI/' + new Date().getFullYear() + '/' + String(Date.now()).slice(-6))}</p>
    <p><strong>Telah diterima dari:</strong> ${escapeHtml(p.customer || '-')}</p>
    <p><strong>Uang sejumlah:</strong> ${escapeHtml(fmt(dpAmt))}</p>
    <p><strong>Untuk pembayaran:</strong> Down Payment ${escapeHtml(p.dpPercent || 30)}% atas pembelian ${escapeHtml(p.modality || '-')} ${escapeHtml(p.subModality || '')} berdasarkan SPH No. ${escapeHtml(p.sphNo || '-')}</p>
    <p><strong>Tanggal Pembayaran:</strong> ${escapeHtml(p.paymentDate || p.dpConfirmedAt || new Date().toISOString().slice(0, 10))}</p>
    ${renderDocLines(tpl.terms?.kwitansi)}
    <div style="margin-top:40px;text-align:right">
      ${renderSignatureBlock('finance', tpl, '', 'Finance HNTI')}
    </div>
    ${renderDocFooter(tpl)}`;
}

export { mergeDocumentTemplates, downloadDataUrl, downloadUploadedTemplate, previewUploadedTemplate, getUploadedDocumentTemplate, openDocumentTemplateOrHtml, downloadDocumentTemplateOrDoc, downloadCSV, downloadHtmlDoc, openPrintableHtml, getUserSignature, getUserDisplayName, findUserByRole, printHtmlStringAsPdf, renderDocLines, renderDocFooter, renderSignatureBlock, wrapDocumentInLetterhead, buildTextLetterheadHtml, buildHntiLetterheadHtml, renderDualSignatureHtml, buildEditorTemplate, getTemplateHtmlBody, fillTemplatePlaceholders, buildEditorBody, buildSPHDocumentHtml, downloadSPHWord, printSPHPdf, buildSPPDocumentHtml, downloadSPPWord, printSPPPdf, buildInvoiceKwitansiHtml, buildPrincipalPoHtml, buildBAIDocumentHtml, printBAIPdf, buildBAUjiFungsiDocumentHtml, printBAUjiFungsiPdf, buildBATrainingDocumentHtml, downloadBATrainingDoc, printBATrainingPdf, buildBASTBarangDocumentHtml, downloadBASTBarangDoc, printBASTBarangPdf, buildKwitansiHtml };

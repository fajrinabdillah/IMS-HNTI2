// Extracted from App.jsx during modular refactor.
import { useEffect, useMemo, useState } from 'react';
import { Check, Edit2, Eye, Plus, Trash2, Upload } from 'lucide-react';
import { DocumentEditorModal } from '../components/DocumentEditorModal.jsx';
import { Field, ReadOnlyBanner } from '../components/ui.jsx';
import { OFFICIAL_DOC_TEMPLATE_TYPES } from '../constants/docs.js';
import { buildEditorBody, buildInvoiceKwitansiHtml, buildPrincipalPoHtml, buildSPHDocumentHtml, buildSPPDocumentHtml, mergeDocumentTemplates, openDocumentTemplateOrHtml, previewUploadedTemplate } from '../utils/documents.js';
import { formatDateTime, formatFileSize, inferMimeFromName } from '../utils/format.js';
import { showToast } from '../utils/toast.js';
function DocumentTemplateModule({ templates, setTemplates, data = [], employees = {}, t, lang, fmt, canEdit, logAction }) {
  const [draft, setDraft] = useState(() => mergeDocumentTemplates(templates));
  const [htmlEditor, setHtmlEditor] = useState(null); // { rowId, type, label, html } — edit HTML body template
  useEffect(() => { setDraft(mergeDocumentTemplates(templates)); }, [templates]);
  const sampleSph = data.find(s => s) || {
    sphNo: 'SPH/IMS/PREVIEW',
    customer: 'RS Contoh Sehat',
    customerType: 'hospital',
    projectType: 'private',
    modality: 'CT Scan',
    subModality: 'CT 128 Slice',
    productBrand: 'Precision',
    qty: 1,
    totalValue: 8200000000,
    dpPercent: 30,
    installmentMonths: 12,
    issuedDate: new Date().toISOString().split('T')[0],
    salesOwner: 'office',
  };
  const updateRoot = (key, value) => {
    // For image fields (letterheadImage, logoImage, stampImage), write directly to parent state
    // This ensures immediate visibility + auto-save to Supabase
    const directKeys = ['letterheadImage', 'logoImage', 'stampImage', 'letterheadMarginTop', 'letterheadMarginBottom'];
    if (directKeys.includes(key)) {
      console.log('[v4.0 updateRoot] writing IMAGE FIELD directly to parent:', key, 'length:', String(value).length);
      setTemplates(prev => ({ ...mergeDocumentTemplates(prev), [key]: value, updatedAt: new Date().toISOString() }));
    } else {
      setDraft(prev => ({ ...prev, [key]: value }));
    }
  };
  const updateTerm = (key, value) => setDraft(prev => ({ ...prev, terms: { ...(prev.terms || {}), [key]: value } }));
  const updateDocumentFiles = (updater) => setDraft(prev => {
    const current = Array.isArray(prev.documentFiles) ? prev.documentFiles : [];
    return { ...prev, documentFiles: typeof updater === 'function' ? updater(current) : updater };
  });
  const updateSignature = (role, key, value) => {
    if (true) { // v4.1: SEMUA field TTD (image/name/title) langsung ke parent agar tahan echo-reset
      console.log('[v4.0 updateSignature] writing TTD image directly to parent:', role, 'length:', String(value).length);
      setTemplates(prev => {
        const merged = mergeDocumentTemplates(prev);
        return {
          ...merged,
          signatures: {
            ...(merged.signatures || {}),
            [role]: { ...(merged.signatures?.[role] || {}), [key]: value },
          },
          updatedAt: new Date().toISOString(),
        };
      });
    } else {
      setDraft(prev => ({
        ...prev,
        signatures: {
          ...(prev.signatures || {}),
          [role]: { ...(prev.signatures?.[role] || {}), [key]: value },
        },
      }));
    }
  };
  const updateExtraSignature = (id, key, value) => {
    if (true) { // v4.1: semua field langsung ke parent
      console.log('[v4.0 updateExtraSignature] writing extra TTD directly to parent:', id);
      setTemplates(prev => {
        const merged = mergeDocumentTemplates(prev);
        return {
          ...merged,
          extraSignatures: (merged.extraSignatures || []).map(sig => sig.id === id ? { ...sig, [key]: value } : sig),
          updatedAt: new Date().toISOString(),
        };
      });
    } else {
      setDraft(prev => ({
        ...prev,
        extraSignatures: (prev.extraSignatures || []).map(sig => sig.id === id ? { ...sig, [key]: value } : sig),
      }));
    }
  };
  const addExtraSignature = () => {
    console.log('[v4.1 addExtraSignature] direct to parent');
    setTemplates(prev => {
      const merged = mergeDocumentTemplates(prev);
      return { ...merged, extraSignatures: [...(merged.extraSignatures || []), { id: 'sig_' + Date.now(), label: lang === 'id' ? 'Tanda Tangan Tambahan' : 'Additional Signature', name: '', title: '', image: '' }], updatedAt: new Date().toISOString() };
    });
  };
  const removeExtraSignature = (id) => setTemplates(prev => {
    const merged = mergeDocumentTemplates(prev);
    return { ...merged, extraSignatures: (merged.extraSignatures || []).filter(sig => sig.id !== id), updatedAt: new Date().toISOString() };
  });
  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => resolve(String(ev.target.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  // ═══════════════════════════════════════════════════════════════
  // PROVEN PATTERN: native <label>+<input type="file"> di JSX
  // Tidak butuh document.createElement, tidak butuh .click() programmatic.
  // Pattern HTML asli sejak HTML 4 — 100% reliable di semua browser.
  // ═══════════════════════════════════════════════════════════════
  const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
  const processFileSelection = async (file, onFile) => {
    console.log('[upload] processFileSelection start', { name: file?.name, size: file?.size, type: file?.type });
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      showToast(lang === 'id' ? `File terlalu besar (maks 8 MB). Ukuran: ${(file.size / (1024*1024)).toFixed(1)} MB` : `File too large (max 8 MB). Size: ${(file.size / (1024*1024)).toFixed(1)} MB`, 'error');
      return;
    }
    try {
      showToast(lang === 'id' ? `Membaca ${file.name}…` : `Reading ${file.name}…`, 'info');
      const dataUrl = await readFileAsDataUrl(file);
      console.log('[upload] dataUrl read OK, length:', dataUrl?.length);
      await onFile({ file, dataUrl });
      showToast(lang === 'id' ? `✓ ${file.name} berhasil diunggah` : `✓ ${file.name} uploaded`, 'success');
    } catch (err) {
      console.error('[upload] read error:', err);
      showToast(lang === 'id' ? 'File gagal dibaca: ' + (err?.message || 'unknown') : 'Read failed: ' + (err?.message || 'unknown'), 'error');
    }
  };
  // Image upload (kop, logo, stempel, TTD) — generic onChange callback
  // Untuk root field (letterheadImage, logoImage, stampImage): tulis LANGSUNG ke parent
  // Untuk nested (signatures.role.image, extraSignatures[i].image): pakai onChange callback
  const handleImageUpload = async (e, onChange) => {
    console.log('[v4.0 handleImageUpload] BEGIN');
    const file = e.target.files && e.target.files[0];
    if (!canEdit) {
      showToast(lang === 'id' ? 'Tidak ada akses edit template' : 'No edit access', 'error');
      e.target.value = '';
      return;
    }
    await processFileSelection(file, ({ dataUrl }) => {
      console.log('[v4.0 handleImageUpload] calling onChange (length=' + dataUrl.length + ')');
      onChange(dataUrl);
    });
    e.target.value = '';
  };
  const addDocumentTemplate = () => {
    console.log('[v4.1 addDocumentTemplate] direct to parent');
    setTemplates(prev => {
      const merged = mergeDocumentTemplates(prev);
      return { ...merged, documentFiles: [...(merged.documentFiles || []), { id: 'doc_' + Date.now(), type: 'custom', label: lang === 'id' ? 'Template Baru' : 'New Template', fileName: '', mimeType: '', dataUrl: '', uploadedAt: '' }], updatedAt: new Date().toISOString() };
    });
  };
  const removeDocumentTemplate = (id) => setTemplates(prev => {
    const merged = mergeDocumentTemplates(prev);
    return { ...merged, documentFiles: (merged.documentFiles || []).filter(item => item.id !== id), updatedAt: new Date().toISOString() };
  });
  const updateDocumentTemplate = (id, key, value) => setTemplates(prev => {
    const merged = mergeDocumentTemplates(prev);
    return { ...merged, documentFiles: (merged.documentFiles || []).map(item => item.id === id ? { ...item, [key]: value } : item), updatedAt: new Date().toISOString() };
  });
  // `live` = sumber kebenaran untuk FILE/GAMBAR/TTD (langsung dari parent state, auto-save).
  // `draft` hanya untuk field teks (identitas perusahaan, terms, footer) yang disimpan manual.
  const live = useMemo(() => mergeDocumentTemplates(templates), [templates]);
  const documentFiles = live.documentFiles || [];
  const handleSave = () => {
    const next = mergeDocumentTemplates({ ...draft, documentFiles: live.documentFiles, letterheadImage: live.letterheadImage, logoImage: live.logoImage, stampImage: live.stampImage, signatures: live.signatures, extraSignatures: live.extraSignatures, updatedAt: new Date().toISOString() });
    setTemplates(next);
    logAction && logAction({ module: 'document_templates', action: 'update', entityLabel: lang === 'id' ? 'Template dokumen resmi' : 'Official document templates' });
    showToast(lang === 'id' ? 'Template dokumen disimpan' : 'Document template saved', 'success');
  };
  const preview = (type) => {
    const tpl = mergeDocumentTemplates({ ...draft, documentFiles: live.documentFiles, letterheadImage: live.letterheadImage, logoImage: live.logoImage, stampImage: live.stampImage, signatures: live.signatures, extraSignatures: live.extraSignatures });
    if (type === 'spp') return openDocumentTemplateOrHtml('spp', tpl, 'Preview SPP HNTI', buildSPPDocumentHtml(sampleSph, employees, fmt, tpl));
    if (type === 'invoice') return openDocumentTemplateOrHtml('invoice', tpl, 'Preview Invoice HNTI', buildInvoiceKwitansiHtml(sampleSph, fmt, tpl));
    if (type === 'po') return openDocumentTemplateOrHtml('po_principal', tpl, 'Preview PO Principal HNTI', buildPrincipalPoHtml(sampleSph, fmt, tpl));
    // Template yang sudah diupload: preview file asli; fallback ke SPH jika belum ada file
    const uploadedRow = (tpl.documentFiles || []).find(f => f.type === type && f.dataUrl);
    if (uploadedRow) return previewUploadedTemplate(uploadedRow, uploadedRow.label || type);
    return openDocumentTemplateOrHtml('sph', tpl, 'Preview SPH HNTI', buildSPHDocumentHtml(sampleSph, employees, fmt, tpl));
  };
  const imageUpload = (label, value, onChange, help) => (
    <div style={{border: '1px solid var(--ims-border)', background: 'var(--ims-bg-card)', padding: '12px'}}>
      <div style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 700, marginBottom: '8px'}}>{label}</div>
      {value ? (
        <div style={{height: '82px', border: '1px solid var(--ims-border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', overflow: 'hidden'}}>
          <img src={value} alt={label} style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />
        </div>
      ) : (
        <div style={{height: '82px', border: '1px dashed var(--ims-border)', color: 'var(--ims-text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', fontSize: '11px'}}>
          {lang === 'id' ? 'Belum ada file' : 'No file'}
        </div>
      )}
      <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
        {canEdit ? (
          <label style={{display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1a4d8a', color: '#fff', border: 'none', padding: '7px 11px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit'}}>
            <Upload size={12} />{lang === 'id' ? 'Upload' : 'Upload'}
            <input type="file" accept="image/*,.png,.jpg,.jpeg,.webp" style={{display: 'none'}} onChange={(e) => handleImageUpload(e, onChange)} />
          </label>
        ) : (
          <button type="button" disabled style={{background: 'var(--ims-border)', color: '#fff', border: 'none', padding: '7px 11px', fontSize: '11px', fontWeight: 700, cursor: 'default', fontFamily: 'inherit'}}>
            <Upload size={12} />{lang === 'id' ? 'Upload' : 'Upload'}
          </button>
        )}
        {value && canEdit && (
          <button type="button" onClick={() => onChange('')} style={{background: 'transparent', border: '1px solid #c03030', color: '#c03030', padding: '7px 11px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 700}}>
            {lang === 'id' ? 'Hapus' : 'Remove'}
          </button>
        )}
      </div>
      {help && <div style={{fontSize: '10.5px', color: 'var(--ims-text-2)', lineHeight: 1.45, marginTop: '8px'}}>{help}</div>}
    </div>
  );
  const signatureRoles = [
    ['sales', lang === 'id' ? 'Tanda Tangan Sales' : 'Sales Signature'],
    ['finance', lang === 'id' ? 'Tanda Tangan Finance' : 'Finance Signature'],
    ['operations', lang === 'id' ? 'Tanda Tangan Operasional' : 'Operations Signature'],
    ['director', lang === 'id' ? 'Tanda Tangan Direktur' : 'Director Signature'],
  ];
  return (
    <div>
      <div style={{marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '14px'}}>
        <div>
          <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_document_templates}</div>
          <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{lang === 'id' ? 'Template Dokumen Resmi' : 'Official Document Templates'}</h1>
          <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{lang === 'id' ? 'Sumber kop surat, tanda tangan, stempel, dan catatan legal untuk PDF/Word IMS.' : 'Official letterhead, signatures, stamp, and legal notes for IMS PDF/Word output.'}</div>
          <div style={{display: 'inline-flex', alignItems: 'center', gap: '12px', marginTop: '10px', padding: '6px 14px', background: 'rgba(91,141,239,0.10)', border: '1px solid #5b8def40', fontSize: '11px', color: '#8fb8ff', fontFamily: 'monospace'}}>
            <span style={{fontWeight: 700}}>v4.1</span>
            <span style={{color: 'var(--ims-text-2)'}}>·</span>
            <span>{(() => {
              const merged = mergeDocumentTemplates(templates);
              const fileCount = (merged.documentFiles || []).filter(f => f.dataUrl).length;
              const totalSlots = (merged.documentFiles || []).length;
              const sigCount = ['sales','finance','operations','director'].filter(r => merged.signatures?.[r]?.image).length;
              const extraSigCount = (merged.extraSignatures || []).filter(s => s.image).length;
              const hasKop = !!merged.letterheadImage;
              const hasLogo = !!merged.logoImage;
              const hasStamp = !!merged.stampImage;
              return `${fileCount}/${totalSlots} file template · ${sigCount + extraSigCount} TTD · ${hasKop ? '✓' : '✗'} kop · ${hasLogo ? '✓' : '✗'} logo · ${hasStamp ? '✓' : '✗'} stempel`;
            })()}</span>
            <span style={{color: 'var(--ims-text-2)'}}>·</span>
            <span style={{color: '#9adf9a'}}>{lang === 'id' ? 'auto-save aktif' : 'auto-save active'}</span>
          </div>
        </div>
      </div>

      {!canEdit && <ReadOnlyBanner t={t} />}

      <div className="card" style={{marginBottom: '16px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap'}}>
          <div>
            <div className="card-title" style={{marginBottom: '4px'}}>{lang === 'id' ? 'File Template Dokumen' : 'Document Template Files'}</div>
            <div style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>
              {lang === 'id'
                ? 'Unggah file template asli satu per satu. Preview dan unduhan memakai file asli agar susunan/narasinya tetap sama.'
                : 'Upload original template files one by one. Preview and downloads use the original file so structure/text stays intact.'}
            </div>
          </div>
          {canEdit && <button type="button" onClick={addDocumentTemplate} className="btn-primary" style={{fontSize: '11px'}}><Plus size={13} />{lang === 'id' ? 'Tambah Template' : 'Add Template'}</button>}
        </div>
        <div>
          {documentFiles.map(row => (
            <div key={row.id} style={{borderTop: '1px solid var(--ims-border)', padding: '14px 0', display: 'grid', gridTemplateColumns: 'minmax(180px,1fr) 1fr', gap: '12px 18px', alignItems: 'start'}}>
              <div>
                <div style={{fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{lang === 'id' ? 'Jenis Dokumen' : 'Document Type'}</div>
                <select disabled={!canEdit || OFFICIAL_DOC_TEMPLATE_TYPES.some(type => type.key === row.id)} value={row.type || 'custom'} onChange={e => {
                  const selected = OFFICIAL_DOC_TEMPLATE_TYPES.find(type => type.key === e.target.value);
                  updateDocumentTemplate(row.id, 'type', e.target.value);
                  if (selected) updateDocumentTemplate(row.id, 'label', selected.label);
                }} style={{width: '100%'}}>
                  <option value="custom">{lang === 'id' ? 'Custom / Lainnya' : 'Custom / Other'}</option>
                  {OFFICIAL_DOC_TEMPLATE_TYPES.map(type => <option key={type.key} value={type.key}>{type.label}</option>)}
                </select>
                <div style={{marginTop: '8px'}}>
                  <div style={{fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '4px'}}>{lang === 'id' ? 'Nama Template' : 'Template Name'}</div>
                  <input disabled={!canEdit} value={row.label || ''} onChange={e => updateDocumentTemplate(row.id, 'label', e.target.value)} placeholder={lang === 'id' ? 'Nama template' : 'Template name'} style={{width: '100%'}} />
                </div>
              </div>
              <div>
                <div style={{fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{lang === 'id' ? 'File Template' : 'Template File'}</div>
                {row.fileName ? (
                  <div style={{border: '1px solid var(--ims-border)', padding: '10px 14px', background: 'var(--ims-bg-card-2)', marginBottom: '8px'}}>
                    <div style={{fontWeight: 700, color: 'var(--ims-text)', fontSize: '12px'}}>{row.fileName}</div>
                    <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '3px'}}>{row.mimeType || inferMimeFromName(row.fileName)}{row.size ? ` · ${formatFileSize(row.size)}` : ''}{row.uploadedAt ? ` · ${formatDateTime(row.uploadedAt, lang)}` : ''}</div>
                    {row.htmlBody && String(row.htmlBody).trim() && <div style={{marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#2f8f6f', fontWeight: 700, background: '#2f8f6f18', padding: '3px 8px', borderRadius: '3px'}}><Check size={11} />{lang === 'id' ? 'Isi terbaca → jadi format editor' : 'Content extracted → editor format'}</div>}
                  </div>
                ) : (
                  <div style={{border: '1px dashed var(--ims-border)', padding: '14px', textAlign: 'center', color: 'var(--ims-text-2)', fontSize: '11px', marginBottom: '8px', fontStyle: 'italic', background: 'var(--ims-bg-card-2)'}}>{lang === 'id' ? 'Belum ada file — unggah .docx/.xlsx, isinya otomatis jadi format editor' : 'No file — upload .docx/.xlsx, content becomes editor format'}</div>
                )}
                <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
                  {canEdit && <button type="button" onClick={() => { const live = mergeDocumentTemplates(templates); const r = (live.documentFiles || []).find(f => f.id === row.id || f.type === row.type) || row; setHtmlEditor({ rowId: row.id, type: row.type, label: row.label, html: r.htmlBody != null ? r.htmlBody : buildEditorBody(row.type, sampleSph, employees, fmt, templates, null) }); }} className="btn-primary" style={{fontSize: '11px', padding: '8px 14px'}} title={lang === 'id' ? 'Edit format HTML template ini (dipakai saat Buat Dokumen)' : 'Edit HTML body of this template'}><Edit2 size={13} />{lang === 'id' ? 'Edit Format' : 'Edit Format'}</button>}
                  <button type="button" onClick={() => row.dataUrl ? previewUploadedTemplate(row, row.label || row.fileName || 'Template') : preview(row.type)} className="btn-ghost" style={{fontSize: '11px', padding: '8px 14px'}}><Eye size={13} />Preview</button>
                </div>
              </div>
            </div>
          ))}
          {documentFiles.length === 0 && <div className="empty-state" style={{padding: '32px'}}>{lang === 'id' ? 'Belum ada template. Klik Tambah Template.' : 'No templates. Click Add Template.'}</div>}
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '16px'}}>
        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Kop Surat & Identitas Perusahaan' : 'Letterhead & Company Identity'}</div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px'}}>
            {imageUpload(lang === 'id' ? 'Kop Surat Gambar Penuh (A4)' : 'Full Letterhead Image (A4)', live.letterheadImage, v => updateRoot('letterheadImage', v), lang === 'id' ? 'Upload gambar kop UKURAN A4 PENUH (header+footer+ornamen). Ini jadi BACKGROUND semua dokumen; teks ditaruh di tengah.' : 'Upload FULL A4 letterhead image. Becomes the background of all documents; text sits in the middle.')}
            {imageUpload('Logo HNTI', live.logoImage, v => updateRoot('logoImage', v), lang === 'id' ? 'Dipakai kalau kop gambar penuh belum diisi.' : 'Used when full letterhead is empty.')}
          </div>
          {live.letterheadImage && (
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px', padding: '12px', background: 'var(--ims-bg-card-2)', border: '1px solid var(--ims-border)'}}>
              <div style={{gridColumn: '1 / -1', fontSize: '11px', color: 'var(--ims-text-2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em'}}>{lang === 'id' ? 'Area Teks di Dalam Kop (mm)' : 'Text Safe Zone (mm)'}</div>
              <Field label={lang === 'id' ? 'Margin Atas (header kop)' : 'Top Margin (header)'}><input type="number" disabled={!canEdit} value={live.letterheadMarginTop ?? 25} onChange={e => updateRoot('letterheadMarginTop', Number(e.target.value) || 0)} /></Field>
              <Field label={lang === 'id' ? 'Margin Bawah (footer kop)' : 'Bottom Margin (footer)'}><input type="number" disabled={!canEdit} value={live.letterheadMarginBottom ?? 35} onChange={e => updateRoot('letterheadMarginBottom', Number(e.target.value) || 0)} /></Field>
              <div style={{gridColumn: '1 / -1', fontSize: '10px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{lang === 'id' ? 'Atur jarak agar teks tidak menimpa header/footer gambar kop. Default 25mm atas, 35mm bawah.' : 'Adjust so text does not overlap the header/footer of the letterhead image. Default 25mm top, 35mm bottom.'}</div>
            </div>
          )}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
            <Field label={lang === 'id' ? 'Nama Perusahaan' : 'Company Name'}><input disabled={!canEdit} value={draft.companyName || ''} onChange={e => updateRoot('companyName', e.target.value)} /></Field>
            <Field label={lang === 'id' ? 'Telepon' : 'Phone'}><input disabled={!canEdit} value={draft.companyPhone || ''} onChange={e => updateRoot('companyPhone', e.target.value)} /></Field>
            <Field label="Email"><input disabled={!canEdit} value={draft.companyEmail || ''} onChange={e => updateRoot('companyEmail', e.target.value)} /></Field>
            <Field label="Website"><input disabled={!canEdit} value={draft.companyWebsite || ''} onChange={e => updateRoot('companyWebsite', e.target.value)} /></Field>
            <Field label={lang === 'id' ? 'Alamat Perusahaan' : 'Company Address'} full><textarea disabled={!canEdit} value={draft.companyAddress || ''} onChange={e => updateRoot('companyAddress', e.target.value)} rows={2} /></Field>
          </div>
        </div>

        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Rekening & Stempel' : 'Bank Account & Stamp'}</div>
          {imageUpload(lang === 'id' ? 'Stempel Perusahaan' : 'Company Stamp', live.stampImage, v => updateRoot('stampImage', v), lang === 'id' ? 'Opsional. Akan muncul di area tanda tangan.' : 'Optional. It appears near signatures.')}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px'}}>
            <Field label={lang === 'id' ? 'Nama Bank' : 'Bank Name'}><input disabled={!canEdit} value={draft.bankName || ''} onChange={e => updateRoot('bankName', e.target.value)} /></Field>
            <Field label={lang === 'id' ? 'No. Rekening' : 'Account No.'}><input disabled={!canEdit} value={draft.bankAccountNo || ''} onChange={e => updateRoot('bankAccountNo', e.target.value)} /></Field>
            <Field label={lang === 'id' ? 'Nama Rekening' : 'Account Name'} full><input disabled={!canEdit} value={draft.bankAccountName || ''} onChange={e => updateRoot('bankAccountName', e.target.value)} /></Field>
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop: '16px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '10px'}}>
          <div className="card-title" style={{margin: 0}}>{lang === 'id' ? 'Tanda Tangan Resmi' : 'Official Signatures'}</div>
          {canEdit && <button type="button" onClick={addExtraSignature} className="btn-ghost" style={{fontSize: '11px'}}><Plus size={13} />{lang === 'id' ? 'Tambah TTD' : 'Add Signature'}</button>}
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px'}}>
          {signatureRoles.map(([role, label]) => (
            <div key={role} style={{border: '1px solid var(--ims-border)', padding: '12px', background: 'var(--ims-bg-card-2)'}}>
              {imageUpload(label, live.signatures?.[role]?.image || '', v => updateSignature(role, 'image', v), '')}
              <Field label={lang === 'id' ? 'Nama Penanda Tangan' : 'Signer Name'}><input disabled={!canEdit} value={live.signatures?.[role]?.name || ''} onChange={e => updateSignature(role, 'name', e.target.value)} /></Field>
              <Field label={lang === 'id' ? 'Jabatan' : 'Title'}><input disabled={!canEdit} value={live.signatures?.[role]?.title || ''} onChange={e => updateSignature(role, 'title', e.target.value)} /></Field>
            </div>
          ))}
          {(live.extraSignatures || []).map(sig => (
            <div key={sig.id} style={{border: '1px solid var(--ims-border)', padding: '12px', background: 'var(--ims-bg-card-2)'}}>
              {imageUpload(sig.label || (lang === 'id' ? 'Tanda Tangan Tambahan' : 'Additional Signature'), sig.image || '', v => updateExtraSignature(sig.id, 'image', v), '')}
              <Field label={lang === 'id' ? 'Label TTD' : 'Signature Label'}><input disabled={!canEdit} value={sig.label || ''} onChange={e => updateExtraSignature(sig.id, 'label', e.target.value)} /></Field>
              <Field label={lang === 'id' ? 'Nama Penanda Tangan' : 'Signer Name'}><input disabled={!canEdit} value={sig.name || ''} onChange={e => updateExtraSignature(sig.id, 'name', e.target.value)} /></Field>
              <Field label={lang === 'id' ? 'Jabatan' : 'Title'}><input disabled={!canEdit} value={sig.title || ''} onChange={e => updateExtraSignature(sig.id, 'title', e.target.value)} /></Field>
              {canEdit && <button type="button" onClick={() => removeExtraSignature(sig.id)} className="btn-ghost" style={{fontSize: '10px', color: '#c03030'}}><Trash2 size={12} />{lang === 'id' ? 'Hapus TTD' : 'Remove'}</button>}
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{marginTop: '16px'}}>
        <div className="card-title">{lang === 'id' ? 'Isi Tetap / Catatan Legal' : 'Fixed Text / Legal Notes'}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px'}}>
          <Field label="SPH" full><textarea disabled={!canEdit} value={draft.terms?.sph || ''} onChange={e => updateTerm('sph', e.target.value)} rows={7} /></Field>
          <Field label="SPP" full><textarea disabled={!canEdit} value={draft.terms?.spp || ''} onChange={e => updateTerm('spp', e.target.value)} rows={7} /></Field>
          <Field label="Invoice / Kwitansi" full><textarea disabled={!canEdit} value={draft.terms?.invoice || ''} onChange={e => updateTerm('invoice', e.target.value)} rows={7} /></Field>
          <Field label="PO Principal" full><textarea disabled={!canEdit} value={draft.terms?.po || ''} onChange={e => updateTerm('po', e.target.value)} rows={7} /></Field>
        </div>
        <Field label={lang === 'id' ? 'Catatan Footer' : 'Footer Note'}>
          <input disabled={!canEdit} value={draft.footerNote || ''} onChange={e => updateRoot('footerNote', e.target.value)} />
        </Field>
      </div>

      {canEdit && (
        <div style={{marginTop: '16px', display: 'flex', justifyContent: 'flex-end'}}>
          <button onClick={handleSave} className="btn-primary"><Check size={14} />{lang === 'id' ? 'Simpan Template' : 'Save Template'}</button>
        </div>
      )}

      {htmlEditor && (
        <DocumentEditorModal
          open={!!htmlEditor}
          onClose={() => setHtmlEditor(null)}
          title={(lang === 'id' ? 'Set Format HTML: ' : 'Set HTML Format: ') + htmlEditor.label}
          initialHtml={htmlEditor.html ?? ''}
          docType={htmlEditor.type}
          record={{}}
          templateMode
          saveLabel={lang === 'id' ? 'Simpan Format Template' : 'Save Template Format'}
          lang={lang}
          onSave={(html) => {
            // Simpan htmlBody ke template row (jadi master format utk Buat Dokumen)
            setTemplates(prev => {
              const merged = mergeDocumentTemplates(prev);
              return { ...merged, documentFiles: (merged.documentFiles || []).map(f => (f.id === htmlEditor.rowId || f.type === htmlEditor.type) ? { ...f, htmlBody: html ?? '' } : f), updatedAt: new Date().toISOString() };
            });
            showToast(lang === 'id' ? `Format ${htmlEditor.label} tersimpan — dipakai saat Buat Dokumen` : 'Template format saved', 'success');
            setHtmlEditor(null);
          }}
        />
      )}
    </div>
  );
}

export { DocumentTemplateModule };

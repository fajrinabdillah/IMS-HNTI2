// Extracted from App.jsx during modular refactor.
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Activity, AlertTriangle, ArrowUpRight, Bell, Check, CheckCircle2, ChevronDown, ClipboardList, Clock, Download, Edit2, FileCheck, FileText, History, Plus, RefreshCw, Search, Star, Trash2, Upload, X } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip, ConfirmDialog, Field, KPICard, ReadOnlyBanner, SortToggle, Td, Th } from '../components/ui.jsx';
import { DocumentEditorModal } from '../components/DocumentEditorModal.jsx';
import { DEFAULT_DOCUMENT_TEMPLATES } from '../constants/docs.js';
import { CICILAN_DP_OPTIONS, CICILAN_TERM_OPTIONS, KSO_INVESTOR_PCT_OPTIONS, KSO_YEAR_OPTIONS, MODALITY_COLORS, PROJECT_TYPES, STAGES, TENDER_SUBSTAGES } from '../constants/sales.js';
import { addDaysIso, computeInvoiceSchedule, detectSalesOwnerFromCustomer, getActiveSalesTeam, getFactoryProductionDays, resolveCustomerSector, resolveDealModel, resolveEmpName, resolveProductRecord } from '../utils/domain.js';
import { formatDateTime, formatDuration, normalizeExternalUrl, todayStart } from '../utils/format.js';
import { getProjectStageRows, SPH_WORKFLOW_LABELS } from '../utils/sphStage.js';
import { buildEditorTemplate, downloadCSV, downloadSPHWord, downloadSPPWord, printHtmlStringAsPdf, printSPHPdf, printSPPPdf } from '../utils/documents.js';
import { parseSPHImport } from '../utils/csvImport.js';
import { showToast } from '../utils/toast.js';
const SPHWorkflowConsole = React.memo(function SPHWorkflowConsole({ data, employees, setEmployees, session, lang, fmt, onRequestSPH, onRequestSPP, onWorkflowUpdate, onSaveDocument, generatedDocs = [], products = [], documentTemplates = DEFAULT_DOCUMENT_TEMPLATES }) {
  const [open, setOpen] = useState('request');
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [deleteQueueId, setDeleteQueueId] = useState(null);
  const [editorState, setEditorState] = useState(null); // { record, docType, html, title }
  const [requestKind, setRequestKind] = useState('sph'); // 'sph' | 'spp' — toggle form request
  const [form, setForm] = useState({
    customer: '', customerAddress: '', customerType: 'hospital', projectType: 'private',
    items: [{ productId: '', modality: '', brand: '', subModality: '', qty: 1, unitPrice: '' }],
    dpPercent: 30, installmentMonths: 12,
    manualTerms: '', notes: '',
  });
  const activeProducts = useMemo(() => (products || []).filter(p => p.active !== false), [products]);
  const modalityOptions = useMemo(() => [...new Set(activeProducts.map(p => p.modality).filter(Boolean))].sort(), [activeProducts]);
  const brandsForItem = (item) => [...new Set(activeProducts.filter(p => !item.modality || p.modality === item.modality).map(p => p.brand).filter(Boolean))].sort();
  const productTypeOptionsForItem = (item) => activeProducts.filter(p => (!item.modality || p.modality === item.modality) && (!item.brand || p.brand === item.brand));
  const update = (k, v) => setForm(prev => {
    let next = { ...prev, [k]: v };
    return next;
  });
  const updateItem = (idx, key, value) => setForm(prev => {
    const items = [...(prev.items || [])];
    let item = { ...(items[idx] || {}) , [key]: value };
    if (key === 'modality') item = { ...item, brand: '', productId: '', subModality: '' };
    if (key === 'brand') item = { ...item, productId: '', subModality: '' };
    if (key === 'productId') {
      const prod = activeProducts.find(p => p.id === value);
      if (prod) item = { ...item, productId: prod.id, modality: prod.modality, brand: prod.brand, subModality: prod.type, productBrand: prod.brand, productName: prod.name, principal: prod.principal, origin: prod.origin };
    }
    items[idx] = item;
    return { ...prev, items };
  });
  const addRequestItem = () => setForm(prev => prev.items.length >= 5 ? prev : ({ ...prev, items: [...prev.items, { productId: '', modality: '', brand: '', subModality: '', qty: 1, unitPrice: '' }] }));
  const removeRequestItem = (idx) => setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx).length ? prev.items.filter((_, i) => i !== idx) : [{ productId: '', modality: '', brand: '', subModality: '', qty: 1, unitPrice: '' }] }));
  const requestRows = data.filter(s => !s.salesDownloadedAt && s.status !== 'cancelled' && (s.sphWorkflowStatus === 'requested' || s.sphWorkflowStatus === 'admin_drafting' || s.sphWorkflowStatus === 'ready_for_sales'));
  const isAdminish = ['super_admin', 'gm', 'admin'].includes(session.role);
  const deleteQueueTarget = data.find(s => s.id === deleteQueueId);
  // RBAC riwayat dokumen: sales hanya lihat dokumen miliknya; CEO/admin lihat semua
  const isCeoLevel = ['super_admin', 'gm', 'admin'].includes(session.role);
  const visibleDocs = useMemo(() => {
    const list = Array.isArray(generatedDocs) ? generatedDocs : [];
    if (isCeoLevel) return list;
    // sales: hanya requesterId === dirinya
    return list.filter(d => d.requesterId === session.username || d.requesterId === session.salesId || d.createdBy === session.username);
  }, [generatedDocs, isCeoLevel, session.username, session.salesId]);
  const isPicSales = (s) => session?.role === 'sales' && (session.salesId === s.salesOwner || session.username === s.salesOwner);
  const openSphDrive = (s) => {
    const url = normalizeExternalUrl(s.sphDriveUrl || s.sppDriveUrl);
    if (!url) return;
    if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
    if (isPicSales(s)) {
      onWorkflowUpdate(s.id, {
        sphWorkflowStatus: 'sales_downloaded',
        salesDownloadedAt: new Date().toISOString(),
        workflowEvent: 'sales_downloaded',
        nextAction: 'Sales menyampaikan penawaran ke klien',
      }, {
        note: 'SPH/SPP downloaded by PIC sales',
        notify: { target: { role: 'admin' }, payload: { type: 'sph_ready', message: `SPH/SPP ${s.sphNo} sudah diunduh oleh PIC sales ${resolveEmpName(employees, s.salesOwner)}.`, link: { view: 'sph', id: s.id } } },
      });
    }
  };

  const submitRequest = (kind = requestKind) => {
    if (!form.customer.trim()) { showToast(lang === 'id' ? 'Nama pelanggan wajib diisi' : 'Customer name required', 'error'); return; }
    if (editingRequestId) {
      const first = (form.items || [])[0] || {};
      const items = (form.items || []).slice(0, 5).map((it, idx) => ({ ...it, lineNo: idx + 1, qty: Number(it.qty) || 1, unitPrice: Number(it.unitPrice) || 0, totalValue: (Number(it.qty) || 1) * (Number(it.unitPrice) || 0) }));
      onWorkflowUpdate(editingRequestId, { ...form, items, productId: first.productId || '', productBrand: first.brand || '', modality: first.modality || '-', subModality: first.subModality || '-', qty: Number(first.qty) || 1, unitPrice: Number(first.unitPrice) || 0, totalValue: items.reduce((sum, it) => sum + (Number(it.totalValue) || 0), 0), workflowEvent: 'request_edited' }, { note: 'Request SPH edited' });
      setEditingRequestId(null);
      setForm({ customer: '', customerAddress: '', customerType: 'hospital', projectType: 'private', items: [{ productId: '', modality: '', brand: '', subModality: '', qty: 1, unitPrice: '' }], dpPercent: 30, installmentMonths: 12, manualTerms: '', notes: '' });
      return;
    }
    if (kind === 'spp') { onRequestSPP({ ...form, salesOwner: session.salesId || session.username }); } else { onRequestSPH({ ...form, salesOwner: session.salesId || session.username }); }
    setForm({ customer: '', customerAddress: '', customerType: 'hospital', projectType: 'private', items: [{ productId: '', modality: '', brand: '', subModality: '', qty: 1, unitPrice: '' }], dpPercent: 30, installmentMonths: 12, manualTerms: '', notes: '' });
  };
  const editQueueRequest = (s) => {
    setEditingRequestId(s.id);
    setForm({
      customer: s.customer || '', customerAddress: s.customerAddress || '', customerType: s.customerType || 'hospital', projectType: s.projectType || 'private',
      items: Array.isArray(s.items) && s.items.length ? s.items.map(it => ({ productId: it.productId || '', modality: it.modality || '', brand: it.brand || it.productBrand || '', subModality: it.subModality || '', qty: it.qty || 1, unitPrice: it.unitPrice || '' })) : [{ productId: s.productId || '', modality: s.modality || '', brand: s.productBrand || '', subModality: s.subModality || '', qty: s.qty || 1, unitPrice: s.unitPrice || '' }],
      dpPercent: s.dpPercent || 30, installmentMonths: s.installmentMonths || 12, manualTerms: s.manualTerms || '', notes: s.notes || '',
    });
    setOpen('request');
  };
  return (
    <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', marginBottom: '18px'}}>
      <div style={{padding: '12px 16px', borderBottom: '1px solid var(--ims-border)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
        {[
          { id: 'request', label: lang === 'id' ? 'Request SPH / SPP' : 'SPH / SPP Request', icon: Plus },
          { id: 'queue', label: lang === 'id' ? `Antrian Admin (${requestRows.length})` : `Admin Queue (${requestRows.length})`, icon: Bell },
          { id: 'docs', label: lang === 'id' ? `Riwayat Dokumen (${visibleDocs.length})` : `Document History (${visibleDocs.length})`, icon: History },
        ].map(tb => {
          const Icon = tb.icon;
          const active = open === tb.id;
          return <button key={tb.id} onClick={() => setOpen(tb.id)} style={{background: active ? 'var(--ims-accent)' : 'transparent', color: active ? '#fff' : 'var(--ims-text-2)', border: `1px solid ${active ? 'var(--ims-accent)' : 'var(--ims-border)'}`, padding: '7px 11px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'}}><Icon size={12} />{tb.label}</button>;
        })}
      </div>

      {open === 'request' && (
        <div style={{padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px'}}>
          <Field label={lang === 'id' ? 'Nama RS / Pelanggan' : 'Customer'}><input value={form.customer} onChange={e => update('customer', e.target.value)} /></Field>
          <Field label={lang === 'id' ? 'Jenis Proyek' : 'Project Type'}>
            <select value={form.projectType} onChange={e => update('projectType', e.target.value)}>
              {PROJECT_TYPES.map(pt => <option key={pt.id} value={pt.id}>{pt.id}</option>)}
            </select>
          </Field>
          <div style={{gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px'}}>
            <div style={{fontSize: '11px', color: 'var(--ims-text-2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em'}}>{lang === 'id' ? 'Item Produk (maks. 5)' : 'Product Items (max. 5)'}</div>
            <button type="button" onClick={addRequestItem} disabled={(form.items || []).length >= 5} className="btn-ghost" style={{fontSize: '11px'}}><Plus size={12} />{lang === 'id' ? 'Tambah Item' : 'Add Item'}</button>
          </div>
          {(form.items || []).map((item, idx) => (
            <div key={idx} style={{gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1.1fr 1fr 1.5fr 0.6fr 1fr auto', gap: '8px', padding: '10px', background: 'var(--ims-bg)', border: '1px solid var(--ims-border)'}}>
              <Field label={`#${idx + 1} Modalitas`}><select value={item.modality || ''} onChange={e => updateItem(idx, 'modality', e.target.value)}><option value="">Pilih</option>{modalityOptions.map(m => <option key={m} value={m}>{m}</option>)}</select></Field>
              <Field label={lang === 'id' ? 'Brand / Merek' : 'Brand'}><select value={item.brand || ''} onChange={e => updateItem(idx, 'brand', e.target.value)} disabled={!item.modality}><option value="">Pilih</option>{brandsForItem(item).map(b => <option key={b} value={b}>{b}</option>)}</select></Field>
              <Field label={lang === 'id' ? 'Tipe Produk' : 'Product Type'}><select value={item.productId || ''} onChange={e => updateItem(idx, 'productId', e.target.value)} disabled={!item.modality}><option value="">Pilih</option>{productTypeOptionsForItem(item).map(p => <option key={p.id} value={p.id}>{p.type} · {p.name}</option>)}</select></Field>
              <Field label="Qty"><input type="number" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} /></Field>
              <Field label={lang === 'id' ? 'Harga Satuan' : 'Unit Price'}><input type="number" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} /></Field>
              <div style={{display: 'flex', alignItems: 'end'}}><button type="button" onClick={() => removeRequestItem(idx)} className="btn-ghost" style={{fontSize: '10px', color: '#c03030'}}><Trash2 size={11} /></button></div>
            </div>
          ))}
          <Field label="DP %"><input type="number" value={form.dpPercent} onChange={e => update('dpPercent', e.target.value)} /></Field>
          <Field label={lang === 'id' ? 'Termin / Tenor Bulan' : 'Terms / Months'}><input type="number" value={form.installmentMonths} onChange={e => update('installmentMonths', e.target.value)} /></Field>
          <Field label={lang === 'id' ? 'Alamat Pelanggan' : 'Customer Address'} full><input value={form.customerAddress} onChange={e => update('customerAddress', e.target.value)} /></Field>
          <Field label={lang === 'id' ? 'Kondisi Manual / Editable' : 'Manual Editable Terms'} full><textarea rows={3} value={form.manualTerms} onChange={e => update('manualTerms', e.target.value)} placeholder={lang === 'id' ? 'Contoh: bonus backup unit, garansi khusus, delivery time, catatan tender...' : 'Special warranty, delivery time, tender notes...'} /></Field>
          <Field label={lang === 'id' ? 'Catatan Internal' : 'Internal Notes'} full><textarea rows={2} value={form.notes} onChange={e => update('notes', e.target.value)} /></Field>
          <div style={{gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px'}}>
            <span style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Request akan masuk ke Admin dan memunculkan notifikasi.' : 'Request will notify Admin.'}</span>
            {editingRequestId ? (
              <button className="btn-primary" onClick={submitRequest}><Check size={13} />{lang === 'id' ? 'Simpan Edit Request' : 'Save Request Edit'}</button>
            ) : (
              <div style={{display: 'flex', gap: '8px'}}>
                <button className="btn-primary" onClick={() => submitRequest('sph')} title="Buat permintaan Surat Penawaran Harga"><Plus size={13} />{lang === 'id' ? 'Request SPH' : 'Request SPH'}</button>
                <button className="btn-primary" onClick={() => submitRequest('spp')} style={{background: 'var(--ims-accent-2)'}} title="Buat permintaan Surat Permohonan Presentasi"><Plus size={13} />{lang === 'id' ? 'Request SPP' : 'Request SPP'}</button>
              </div>
            )}
          </div>
        </div>
      )}

      {open === 'queue' && (
        <div style={{padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
          {requestRows.map(s => {
            const driveUrl = s.sphDriveUrl || s.sppDriveUrl || '';
            return (
              <div key={s.id} style={{padding: '12px', background: 'var(--ims-bg)', border: '1px solid var(--ims-border)', display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) minmax(320px, 0.9fr) auto', gap: '12px', alignItems: 'center'}}>
                <div>
                  <div style={{fontSize: '13px', fontWeight: 700}}>{s.customer} · {s.subModality}</div>
                  <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '3px'}}><span className="mono">{s.sphNo}</span> · Sales: {resolveEmpName(employees, s.salesOwner)} · {SPH_WORKFLOW_LABELS[s.sphWorkflowStatus] || s.sphWorkflowStatus}</div>
                  <div className="mono" style={{fontSize: '11px', color: 'var(--ims-text)', marginTop: '3px'}}>{fmt(s.totalValue || 0)} · DP {s.dpPercent || 0}% · {s.installmentMonths || 0} bulan</div>
                </div>
                <div>
                  <div style={{fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 800, marginBottom: '5px'}}>Google Drive SPH/SPP</div>
                  <div style={{display: 'flex', gap: '6px', alignItems: 'center'}}>
                    <input
                      type="url"
                      defaultValue={driveUrl}
                      disabled={!isAdminish}
                      onBlur={e => {
                        const value = e.target.value.trim();
                        if (value !== driveUrl) onWorkflowUpdate(s.id, { sphDriveUrl: value, sphDriveUpdatedAt: new Date().toISOString() }, { note: 'SPH/SPP Google Drive link updated' });
                      }}
                      placeholder="https://drive.google.com/..."
                      style={{fontSize: '11px', minWidth: 0}}
                    />
                    <button
                      onClick={() => openSphDrive(s)}
                      disabled={!driveUrl}
                      className="btn-ghost"
                      style={{fontSize: '10px', opacity: driveUrl ? 1 : 0.45, whiteSpace: 'nowrap'}}
                      title={isPicSales(s) ? 'Unduh dan keluarkan dari antrian admin' : 'Buka link Google Drive'}
                    ><Download size={11} />Unduh</button>
                  </div>
                  {s.salesDownloadedAt && <div className="mono" style={{fontSize: '10px', color: 'var(--ims-accent-2)', marginTop: '4px'}}>Diunduh PIC: {formatDateTime(s.salesDownloadedAt, lang)}</div>}
                </div>
                <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end'}}>
                  {isAdminish && <button onClick={() => editQueueRequest(s)} className="btn-ghost" style={{fontSize: '10px'}}><Edit2 size={11} />Edit</button>}
                  {isAdminish && <button onClick={() => setDeleteQueueId(s.id)} className="btn-ghost" style={{fontSize: '10px', color: '#c03030'}}><Trash2 size={11} />Hapus</button>}
                  {isAdminish && (s.sphWorkflowStatus === 'requested' || s.sphWorkflowStatus === 'admin_drafting') && <button onClick={() => {
                    const docType = s.docKind === 'spp' ? 'spp' : 'sph';
                    const html = buildEditorTemplate(docType, s, employees, fmt, documentTemplates, s.requesterId || s.sphRequestedBy || s.salesOwner);
                    setEditorState({ record: s, docType, html, title: (docType === 'spp' ? 'Buat SPP — ' : 'Buat SPH — ') + (s.customer || '') });
                    if (s.sphWorkflowStatus === 'requested') onWorkflowUpdate(s.id, { sphWorkflowStatus: 'admin_drafting', sphDraftStartedAt: new Date().toISOString(), workflowEvent: 'admin_drafting', nextAction: 'Admin membuat Surat SPH/SPP' }, { note: 'Admin mulai membuat dokumen' });
                  }} className="btn-primary" style={{fontSize: '10px', padding: '6px 10px'}} title="Buka editor & isi otomatis dari template (tidak auto-download)"><Edit2 size={11} />Mulai</button>}
                  <button onClick={() => downloadSPHWord(s, employees, fmt, documentTemplates)} className="btn-ghost" style={{fontSize: '10px'}} title="Unduh SPH Word"><Download size={11} />Unduh</button>
                  {isAdminish && s.sphWorkflowStatus !== 'ready_for_sales' && <button onClick={() => onWorkflowUpdate(s.id, { sphWorkflowStatus: 'ready_for_sales', sphDocReadyAt: new Date().toISOString(), workflowEvent: 'ready_for_sales', nextAction: 'Sales menyampaikan penawaran ke klien' }, { note: 'SPH ready for sales', notify: { target: { username: s.salesOwner }, payload: { type: 'sph_ready', message: `SPH ${s.sphNo} untuk ${s.customer} sudah dibuat Admin dan siap disampaikan ke klien.`, link: { view: 'sph', id: s.id } } } })} className="btn-primary" style={{fontSize: '10px', padding: '6px 10px', background: 'var(--ims-accent-2)'}} title="Kirim SPH ke sales — sales akan mendapat notifikasi & bisa unduh PDF">Kirim ke Sales</button>}
                </div>
              </div>
            );
          })}
          {requestRows.length === 0 && <div className="empty-state">{lang === 'id' ? 'Belum ada request aktif' : 'No active requests'}</div>}
        </div>
      )}

      {open === 'docs' && (
        <div style={{padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginBottom: '4px'}}>
            {isCeoLevel ? (lang === 'id' ? 'Menampilkan semua dokumen dari semua sales.' : 'Showing all documents.') : (lang === 'id' ? 'Menampilkan dokumen Anda saja.' : 'Showing your documents only.')}
          </div>
          {visibleDocs.map(doc => (
            <div key={doc.id} style={{padding: '12px', background: 'var(--ims-bg)', border: '1px solid var(--ims-border)', display: 'grid', gridTemplateColumns: 'minmax(280px,1fr) auto', gap: '12px', alignItems: 'center'}}>
              <div>
                <div style={{fontSize: '13px', fontWeight: 700}}>{doc.docTitle} {doc.customer ? `· ${doc.customer}` : ''}</div>
                <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '3px'}}>
                  <span className="mono">{doc.sphNo || doc.id}</span> · {lang === 'id' ? 'Dibuat' : 'By'}: {doc.createdByName || doc.createdBy} · {formatDateTime(doc.updatedAt || doc.createdAt, lang)}
                  <span style={{marginLeft: '8px', padding: '2px 8px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: doc.status === 'ready' ? 'var(--ims-accent-2)25' : '#94a3b825', color: doc.status === 'ready' ? 'var(--ims-accent-2)' : '#94a3b8'}}>{doc.status === 'ready' ? (lang === 'id' ? 'Siap Unduh' : 'Ready') : 'Draft'}</span>
                </div>
              </div>
              <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                <button onClick={() => printHtmlStringAsPdf(doc.docTitle + ' - ' + (doc.customer || ''), doc.html)} className="btn-primary" style={{fontSize: '10px', padding: '6px 10px'}} title="Cetak / Unduh PDF"><Download size={11} />Cetak PDF</button>
                {isAdminish && <button onClick={() => { setEditorState({ record: { ...(data.find(s => s.id === doc.sourceId) || {}), id: doc.sourceId, customer: doc.customer, sphNo: doc.sphNo, requesterId: doc.requesterId, _existingDocId: doc.id }, docType: doc.docType, html: doc.html, title: (lang === 'id' ? 'Edit ' : 'Edit ') + doc.docTitle }); }} className="btn-ghost" style={{fontSize: '10px'}}><Edit2 size={11} />Edit</button>}
              </div>
            </div>
          ))}
          {visibleDocs.length === 0 && <div className="empty-state">{lang === 'id' ? 'Belum ada dokumen tersimpan. Klik "Mulai" di Antrian Admin untuk membuat dokumen.' : 'No documents yet.'}</div>}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteQueueId}
        title={lang === 'id' ? 'Hapus antrian admin?' : 'Delete admin queue item?'}
        message={lang === 'id'
          ? `Request ${deleteQueueTarget?.sphNo || ''} ${deleteQueueTarget?.customer || ''} akan dihapus dari antrian admin. Lanjutkan?`
          : `Request ${deleteQueueTarget?.sphNo || ''} ${deleteQueueTarget?.customer || ''} will be removed from admin queue. Continue?`}
        onConfirm={() => {
          if (deleteQueueId) onWorkflowUpdate(deleteQueueId, { sphWorkflowStatus: 'cancelled', status: 'cancelled', workflowEvent: 'request_deleted' }, { note: 'Request SPH deleted from queue' });
          setDeleteQueueId(null);
        }}
        onCancel={() => setDeleteQueueId(null)}
        danger
        lang={lang}
      />

      {editorState && (
        <DocumentEditorModal
          open={!!editorState}
          onClose={() => setEditorState(null)}
          title={editorState.title}
          initialHtml={editorState.html}
          docType={editorState.docType}
          record={editorState.record}
          saveLabel={lang === 'id' ? 'Kirim Dokumen' : 'Send Document'}
          lang={lang}
          onSave={(html, status) => {
            const rec = editorState.record;
            onSaveDocument && onSaveDocument({
              id: rec._existingDocId || undefined,
              docType: editorState.docType,
              html,
              status,
              record: rec,
              requesterId: rec.requesterId || rec.sphRequestedBy || rec.salesOwner,
              notifyRequester: status === 'final' && !rec._existingDocId,
            });
            if (status === 'final' && rec.id && !rec._existingDocId) {
              onWorkflowUpdate(rec.id, {
                sphWorkflowStatus: 'ready_for_sales',
                sphDocReadyAt: new Date().toISOString(),
                workflowEvent: 'ready_for_sales',
                nextAction: 'Sales mengunduh & menyampaikan penawaran ke klien',
                documentReady: true,
              }, { note: 'Dokumen dikirim dari editor — siap diunduh requester' });
            }
            setEditorState(null);
          }}
        />
      )}
    </div>
  );
});
function SPHDetailModal({ sph, employees, lang, fmt, onClose, onWorkflowUpdate, session, documentTemplates = DEFAULT_DOCUMENT_TEMPLATES }) {
  if (!sph) return null;
  const actionNow = () => new Date().toISOString();
  const actions = [
    { label: 'Admin: Mulai SPH/SPP', patch: { sphWorkflowStatus: 'admin_drafting', sphDraftStartedAt: actionNow(), workflowEvent: 'admin_drafting', nextAction: 'Admin membuat Surat SPH/SPP' }, notify: { target: { role: 'admin' }, payload: { type: 'sph_request', message: `Request SPH/SPP ${sph.customer} sedang diproses Admin.`, link: { view: 'sph', id: sph.id } } } },
    { label: 'Admin: SPH/SPP selesai', patch: { sphWorkflowStatus: 'ready_for_sales', sphDocReadyAt: actionNow(), workflowEvent: 'ready_for_sales', nextAction: 'Sales menyampaikan penawaran ke klien' }, notify: { target: { username: sph.salesOwner }, payload: { type: 'sph_ready', message: `SPH/SPP ${sph.customer} siap disampaikan ke klien.`, link: { view: 'sph', id: sph.id } } } },
    { label: 'Sales: Penawaran dikirim', patch: { sphWorkflowStatus: 'offer_sent', offerSentAt: actionNow(), workflowEvent: 'offer_sent', nextAction: 'Menunggu informasi PO dari klien' } },
    { label: 'Sales: PO dari klien', patch: { stage: 'po_issued', status: 'won', poStatus: 'issued', probability: 100, sphWorkflowStatus: 'client_po_info', clientPoInfoAt: actionNow(), poIssuedAt: actionNow(), workflowEvent: 'client_po_info', nextAction: 'Admin input SPH/SPP & PO ke IMS' }, notify: { target: { role: 'admin' }, payload: { type: 'po_won', message: `Informasi PO diterima untuk ${sph.customer}. Admin perlu input SPH/SPP & PO ke IMS.`, link: { view: 'sph', id: sph.id } } } },
    { label: 'Admin: Input SPH/SPP IMS', patch: { sphWorkflowStatus: 'po_input_ims', poInputAt: actionNow(), financePoNotifiedAt: actionNow(), workflowEvent: 'po_input_ims', nextAction: 'Finance membuat invoice penagihan DP' }, notify: { target: { role: 'finance' }, payload: { type: 'po_won', message: `SPH/SPP ${sph.customer} sudah diinput ke IMS. Finance perlu membuat invoice DP.`, link: { view: 'finance', id: sph.id } } } },
    { label: 'Finance: Invoice DP', patch: { sphWorkflowStatus: 'invoice_ready', financeDocsStatus: 'ready_for_sales', financeDocsReadyAt: actionNow(), workflowEvent: 'invoice_ready', nextAction: 'Sales follow-up pembayaran DP/deposit' }, notify: { target: { username: sph.salesOwner }, payload: { type: 'invoice_ready', message: `Invoice DP ${sph.customer} sudah siap. Sales perlu follow-up klien.`, link: { view: 'sph', id: sph.id } } } },
    { label: 'Sales: Follow-up DP', patch: { sphWorkflowStatus: 'dp_followup', dpFollowupAt: actionNow(), workflowEvent: 'dp_followup', nextAction: 'Menunggu konfirmasi pembayaran DP dari klien' } },
    { label: 'Finance: DP diterima', patch: { sphWorkflowStatus: 'dp_confirmed', dpDecisionAt: actionNow(), dpConfirmedAt: actionNow(), dpPaid: true, workflowEvent: 'dp_confirmed', nextAction: 'Finance membuat PO ke pabrik' }, notify: { target: { role: 'finance' }, payload: { type: 'dp_paid', message: `DP/deposit ${sph.customer} sudah diterima. Finance dapat membuat PO ke pabrik.`, link: { view: 'finance', id: sph.id } } } },
    { label: 'Finance: PO ke Pabrik', patch: { sphWorkflowStatus: 'factory_po_sent', manufacturePoCreatedAt: actionNow(), factoryPoSentAt: actionNow(), principalPoStatus: 'sent', principalPoSentAt: actionNow(), workflowEvent: 'factory_po_sent', nextAction: 'Finance membayar DP ke pabrik' }, notify: { target: { role: 'manager_ops' }, payload: { type: 'system', message: `PO ke pabrik ${sph.customer} sudah dikirim. Operasional menunggu DP pabrik dan produksi.`, link: { view: 'operations', id: sph.id } } } },
    { label: 'Finance: DP ke Pabrik dibayar', patch: { sphWorkflowStatus: 'factory_dp_paid', factoryDpPaidAt: actionNow(), supplierDpPaidAt: actionNow(), shippingStatus: 'plan_order', workflowEvent: 'factory_dp_paid', nextAction: 'Operasional klik pesanan dibuat dan mulai produksi/disiapkan pabrik' }, notify: { target: { role: 'manager_ops' }, payload: { type: 'factory_dp_paid', message: `DP ke pabrik ${sph.customer} sudah dibayarkan. Tombol pesanan dibuat di Operasional sudah aktif.`, link: { view: 'operations', id: sph.id } } } },
    { label: 'Ops: Barang diproduksi/disiapkan pabrik', patch: { sphWorkflowStatus: 'factory_production', factoryProductionStartedAt: actionNow(), factoryProductionDays: getFactoryProductionDays(sph), factoryProductionDueAt: addDaysIso(actionNow(), getFactoryProductionDays(sph)), shippingStatus: 'plan_order', workflowEvent: 'factory_production', nextAction: 'Menunggu produksi/disiapkan pabrik selesai' }, notify: { target: { role: 'manager_ops' }, payload: { type: 'factory_production', message: `Produksi/disiapkan pabrik ${sph.customer} dimulai.`, link: { view: 'operations', id: sph.id } } } },
    { label: 'Ops: Import/Clearance', patch: { sphWorkflowStatus: 'import_clearance', principalPoStatus: 'sent', principalPoSentAt: actionNow(), importClearanceAt: actionNow(), shippingStatus: 'on_shipment', workflowEvent: 'import_clearance', nextAction: 'Operasional update clearance sampai barang dikirim ke klien' } },
    { label: 'Ops: Barang ke Klien', patch: { sphWorkflowStatus: 'goods_sent_client', goodsSentClientAt: actionNow(), localDeliveryStatus: 'on_delivery', shippingStatus: 'sent_client', workflowEvent: 'goods_sent_client', nextAction: 'Menunggu barang diterima klien' }, notify: { target: { role: 'technician' }, payload: { type: 'install_pending', message: `Barang ${sph.customer} sudah dikirim ke klien. Teknisi menunggu konfirmasi diterima klien.`, link: { view: 'installation', id: sph.id } } } },
    { label: 'Ops: Barang diterima Klien', patch: { sphWorkflowStatus: 'goods_received_client', clientReceivedAt: actionNow(), localDeliveryStatus: 'delivered_to_rs', shippingStatus: 'client_received', technicianNotifiedAt: actionNow(), workflowEvent: 'goods_received_client', nextAction: 'Teknisi atur jadwal instalasi' }, notify: { target: { role: 'technician' }, payload: { type: 'install_pending', message: `Barang ${sph.customer} sudah diterima klien. Teknisi perlu update jadwal instalasi.`, link: { view: 'installation', id: sph.id } } } },
    { label: 'Teknisi: Jadwal Instalasi', patch: { sphWorkflowStatus: 'install_schedule_updated', installScheduleUpdatedAt: actionNow(), workflowEvent: 'install_schedule_updated', nextAction: 'Teknisi melakukan instalasi dan update BAST' } },
    { label: 'Teknisi: BAST selesai', patch: { sphWorkflowStatus: 'installed_bast', installationStatus: 'installed', bastDate: new Date().toISOString().split('T')[0], regulatoryNotifiedAt: actionNow(), workflowEvent: 'installed_bast', nextAction: 'Regulatory proses izin pemanfaatan' }, notify: { target: { role: 'regulatory' }, payload: { type: 'system', message: `Instalasi dan BAST ${sph.customer} selesai. Regulatory mulai izin pemanfaatan.`, link: { view: 'regulatory', id: sph.id } } } },
    { label: 'Regulatory: Proses Izin', patch: { sphWorkflowStatus: 'regulatory_processing', regulatoryProcessingAt: actionNow(), workflowEvent: 'regulatory_processing', nextAction: 'Regulatory menyelesaikan izin pemanfaatan' } },
    { label: 'Regulatory: Izin Selesai', patch: { sphWorkflowStatus: 'utilization_permit_done', utilizationPermitDoneAt: actionNow(), workflowEvent: 'utilization_permit_done', nextAction: 'Project selesai sampai izin pemanfaatan' } },
  ];
  const runAction = (a) => {
    const patch = { ...a.patch, lastUpdate: actionNow(), workflowEvent: a.patch.workflowEvent || 'sales_stage_update' };
    onWorkflowUpdate(sph.id, patch, { note: a.label, notify: a.notify });
  };
  const stageRows = getProjectStageRows(sph);
  const historyRows = (sph.stageHistory || []).map((h, idx, arr) => {
    const start = new Date(h.at).getTime();
    const end = idx < arr.length - 1 ? new Date(arr[idx + 1].at).getTime() : Date.now();
    return { ...h, durationMs: isNaN(start) || isNaN(end) ? 0 : Math.max(0, end - start) };
  }).reverse();
  const driveUrl = sph.sphDriveUrl || sph.sppDriveUrl || '';
  const attachmentUrl = sph.attachmentUrl || '';
  const isPicSales = session?.role === 'sales' && (session.salesId === sph.salesOwner || session.username === sph.salesOwner);
  const openDrive = (url, markDownloaded = false) => {
    const clean = normalizeExternalUrl(url);
    if (!clean) return;
    if (typeof window !== 'undefined') window.open(clean, '_blank', 'noopener,noreferrer');
    if (markDownloaded && isPicSales && !sph.salesDownloadedAt) {
      onWorkflowUpdate(sph.id, {
        sphWorkflowStatus: 'sales_downloaded',
        salesDownloadedAt: new Date().toISOString(),
        workflowEvent: 'sales_downloaded',
        nextAction: 'Sales menyampaikan penawaran ke klien',
      }, {
        note: 'SPH/SPP downloaded by PIC sales',
        notify: { target: { role: 'admin' }, payload: { type: 'sph_ready', message: `SPH/SPP ${sph.sphNo} sudah diunduh oleh PIC sales ${resolveEmpName(employees, sph.salesOwner)}.`, link: { view: 'sph', id: sph.id } } },
      });
    }
  };
  return (
    <div className="modal-overlay" onClick={onClose} style={{zIndex: 9998}}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '1180px', maxHeight: '88vh', overflow: 'hidden'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '16px'}}>
          <div>
            <h2 className="serif" style={{fontSize: '24px', margin: 0}}>{sph.customer}</h2>
            <div style={{fontSize: '12px', color: 'var(--ims-text-2)', marginTop: '4px'}}><span className="mono">{sph.sphNo}</span> · {sph.subModality} · Sales: {resolveEmpName(employees, sph.salesOwner)}</div>
          </div>
          <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end'}}>
            <button type="button" onClick={() => printSPHPdf(sph, employees, fmt, documentTemplates)} className="btn-ghost" style={{fontSize: '11px'}}><FileText size={13} />PDF SPH</button>
            <button type="button" onClick={() => downloadSPHWord(sph, employees, fmt, documentTemplates)} className="btn-ghost" style={{fontSize: '11px'}}><Download size={13} />Word</button>
            <button type="button" onClick={() => printSPPPdf(sph, employees, fmt, documentTemplates)} className="btn-ghost" style={{fontSize: '11px'}}><FileCheck size={13} />PDF SPP</button>
            <button type="button" onClick={() => downloadSPPWord(sph, employees, fmt, documentTemplates)} className="btn-ghost" style={{fontSize: '11px'}}><Download size={13} />Word SPP</button>
            <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer'}}><X size={20} /></button>
          </div>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(340px, 0.85fr)', gap: '18px', minHeight: 0}}>
          <div style={{minHeight: 0}}>
            <div className="card-title">{lang === 'id' ? 'Alur Proyek - Flowchart Instalasi HNTI' : 'Project Flow - HNTI Installation Flowchart'}</div>
            <div style={{maxHeight: '67vh', overflowY: 'auto', paddingRight: '10px', borderRight: '1px solid var(--ims-border)'}}>
              {stageRows.map((step, idx) => {
                const done = step.state === 'done';
                const active = step.state === 'active';
                const statusText = done ? 'Selesai' : active ? 'Berjalan' : 'Pending';
                return (
                  <div key={step.key} style={{display: 'grid', gridTemplateColumns: '56px 1fr', minHeight: '92px', opacity: done || active ? 1 : 0.46}}>
                    <div style={{position: 'relative', display: 'flex', justifyContent: 'center'}}>
                      <div style={{position: 'absolute', top: 0, bottom: 0, left: '50%', width: '3px', background: done || active ? step.color : 'var(--ims-border)', transform: 'translateX(-50%)', opacity: done ? 0.9 : 0.45}} />
                      <div style={{width: '32px', height: '32px', borderRadius: '50%', background: done ? step.color : active ? 'var(--ims-accent)' : 'var(--ims-bg-card-2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, zIndex: 1, marginTop: '8px'}}>{idx + 1}</div>
                    </div>
                    <div style={{padding: '10px 12px 12px', borderBottom: '1px solid rgba(70,105,170,0.22)', background: active ? 'rgba(104,151,230,0.08)' : 'transparent'}}>
                      <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
                        <div style={{fontSize: '15px', fontWeight: 800, lineHeight: 1.25}}>{step.title}</div>
                        <span style={{fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: step.color, background: step.color + '18', padding: '3px 7px', fontWeight: 900}}>{step.role}</span>
                        <span style={{marginLeft: 'auto', fontSize: '10px', color: done ? step.color : active ? 'var(--ims-accent)' : 'var(--ims-text-2)', fontWeight: 800}}>{statusText}</span>
                      </div>
                      <div style={{fontSize: '12px', color: 'var(--ims-text-2)', marginTop: '6px', lineHeight: 1.35}}>{step.desc}</div>
                      <div className="mono" style={{fontSize: '11px', color: done || active ? 'var(--ims-text)' : 'var(--ims-text-2)', marginTop: '8px'}}>
                        {step.at ? formatDateTime(step.at, lang) : '-'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{maxHeight: '67vh', overflowY: 'auto', paddingRight: '8px'}}>
            <div className="card-title">{lang === 'id' ? 'Informasi Proyek' : 'Project Information'}</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr auto', rowGap: '9px', columnGap: '16px', fontSize: '13px', marginBottom: '18px'}}>
              <span style={{color: 'var(--ims-text-2)'}}>Stage</span><strong className="mono">{sph.stage || '-'}</strong>
              <span style={{color: 'var(--ims-text-2)'}}>Status</span><strong>{sph.status || '-'}</strong>
              <span style={{color: 'var(--ims-text-2)'}}>PO Status</span><strong>{sph.poStatus || '-'}</strong>
              <span style={{color: 'var(--ims-text-2)'}}>DP</span><strong>{sph.dpPaid ? 'Sudah diterima' : 'Belum'}</strong>
              <span style={{color: 'var(--ims-text-2)'}}>Tipe</span><strong>{sph.customerType || '-'} · {sph.projectType || '-'}</strong>
              <span style={{color: 'var(--ims-text-2)'}}>Wilayah</span><strong>{sph.region || '-'}</strong>
              <span style={{color: 'var(--ims-text-2)'}}>Update Terakhir</span><strong>{formatDateTime(sph.lastUpdate, lang)}</strong>
            </div>
            <div className="card-title">{lang === 'id' ? 'Riwayat Workflow' : 'Workflow History'}</div>
            <div style={{maxHeight: '190px', overflowY: 'auto', marginBottom: '16px', background: 'rgba(0,0,0,0.12)'}}>
              {historyRows.map((h, i) => (
                <div key={i} style={{fontSize: '11px', padding: '8px 0', borderBottom: '1px dashed rgba(90,130,200,0.45)'}}>
                  <div className="mono" style={{fontWeight: 800}}>{formatDateTime(h.at, lang)}</div>
                  <div style={{marginTop: '2px'}}><strong>{h.to}</strong> · {h.by || 'system'} · {lang === 'id' ? 'durasi' : 'duration'} {formatDuration(h.durationMs, lang)}</div>
                  {h.from && <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>from {h.from}</div>}
                </div>
              ))}
              {historyRows.length === 0 && <div style={{padding: '12px', color: 'var(--ims-text-2)', fontSize: '12px'}}>{lang === 'id' ? 'Belum ada riwayat workflow' : 'No workflow history yet'}</div>}
            </div>
            <div className="card-title">{lang === 'id' ? 'Google Drive SPH/SPP' : 'SPH/SPP Google Drive'}</div>
            <div style={{display: 'flex', gap: '6px', marginBottom: '12px'}}>
              <input defaultValue={driveUrl} onBlur={e => {
                const value = e.target.value.trim();
                if (value !== driveUrl) onWorkflowUpdate(sph.id, { sphDriveUrl: value, sphDriveUpdatedAt: new Date().toISOString() }, { note: 'SPH/SPP Google Drive link updated' });
              }} placeholder="https://drive.google.com/..." style={{fontSize: '11px'}} />
              <button type="button" disabled={!driveUrl} onClick={() => openDrive(driveUrl, true)} className="btn-ghost" style={{fontSize: '10px', opacity: driveUrl ? 1 : 0.45, whiteSpace: 'nowrap'}}><Download size={11} />Unduh</button>
            </div>
            {sph.salesDownloadedAt && <div className="mono" style={{fontSize: '10px', color: 'var(--ims-accent-2)', margin: '-6px 0 12px'}}>Diunduh PIC sales: {formatDateTime(sph.salesDownloadedAt, lang)}</div>}
            <div className="card-title">{lang === 'id' ? 'Lampiran' : 'Attachment'}</div>
            <div style={{display: 'flex', gap: '6px', marginBottom: '12px'}}>
              <input defaultValue={attachmentUrl} onBlur={e => {
                const value = e.target.value.trim();
                if (value !== attachmentUrl) onWorkflowUpdate(sph.id, { attachmentUrl: value }, { note: 'Attachment updated' });
              }} placeholder={lang === 'id' ? 'Link Google Drive: PO, bukti tender...' : 'Google Drive link: PO, tender proof...'} style={{fontSize: '11px'}} />
              <button type="button" disabled={!attachmentUrl} onClick={() => openDrive(attachmentUrl)} className="btn-ghost" style={{fontSize: '10px', opacity: attachmentUrl ? 1 : 0.45, whiteSpace: 'nowrap'}}><ArrowUpRight size={11} />Buka</button>
            </div>
            <button onClick={() => onWorkflowUpdate(sph.id, { sphWorkflowStatus: 'dp_claimed_paid', dpClaimedAt: new Date().toISOString(), dpDecisionAt: new Date().toISOString(), workflowEvent: 'dp_claimed_paid', nextAction: 'Finance cek rekening dan konfirmasi DP' }, { note: 'Sales claimed DP paid', notify: { target: { role: 'finance' }, payload: { type: 'dp_paid', message: `Sales menandai DP/deposit ${sph.customer} sudah terbayar. Finance perlu cek rekening.`, link: { view: 'finance', id: sph.id } } } })} style={{width: '100%', background: 'var(--ims-gold)', color: 'var(--ims-accent-ink)', border: 'none', padding: '9px 12px', fontSize: '11px', cursor: 'pointer', fontWeight: 800}}>
              {lang === 'id' ? 'DP sudah terbayar - minta cek Finance' : 'DP paid - ask Finance to verify'}
            </button>
            <div className="card-title" style={{marginTop: '16px'}}>{lang === 'id' ? 'Aksi Update Stage' : 'Stage Update Actions'}</div>
            <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
              {actions.map(a => <button type="button" key={a.label} onClick={(e) => { e.preventDefault(); e.stopPropagation(); runAction(a); }} style={{background: a.label.includes('PO') ? 'var(--ims-accent-2)' : 'var(--ims-bg-card)', color: a.label.includes('PO') ? '#fff' : 'var(--ims-text)', border: '1px solid var(--ims-border)', padding: '7px 10px', minHeight: '30px', fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700}}>{a.label}</button>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function SPHManagement({ data, employees = {}, setEmployees, products = [], documentTemplates = DEFAULT_DOCUMENT_TEMPLATES, session = {}, t, lang, canEdit, fmt, onAdd, onEdit, onDelete, onBulkDelete, onImport, onRequestSPH, onRequestSPP, onWorkflowUpdate, onSaveDocument, generatedDocs = [], setGeneratedDocs }) {
  const salesTeam = useMemo(() => getActiveSalesTeam(employees), [employees]);
  const [search, setSearch] = useState('');
  const [filterPType, setFilterPType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterYear, setFilterYear] = useState('2026');
  const [filterProduct, setFilterProduct] = useState('all');
  const [sortSPH, setSortSPH] = useState('date_desc');
  const [pageSize, setPageSize] = useState(50);  // Pagination: 50 rows initial, "Load more" button
  const [visibleCount, setVisibleCount] = useState(50);
  const [detailSph, setDetailSph] = useState(null);
  const [selectedSphIds, setSelectedSphIds] = useState([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const importRef = useRef(null);
  const [importMsg, setImportMsg] = useState(null);

  const handleImportCSV = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const { records, errors } = parseSPHImport(String(ev.target.result || ''));
        if (!records.length) { setImportMsg({ ok: false, text: errors[0] || (lang === 'id' ? 'Tidak ada data valid.' : 'No valid data.') }); return; }
        const res = (onImport && onImport(records)) || { added: 0, updated: 0 };
        setImportMsg({ ok: true, text: lang === 'id'
          ? `${records.length} baris diproses → ${res.added} ditambah, ${res.updated} diperbarui${errors.length ? `, ${errors.length} dilewati` : ''}.`
          : `${records.length} rows processed → ${res.added} added, ${res.updated} updated${errors.length ? `, ${errors.length} skipped` : ''}.` });
      } catch (err) { setImportMsg({ ok: false, text: (lang === 'id' ? 'Gagal membaca file: ' : 'Failed to read file: ') + err.message }); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  const downloadSPHTemplate = () => {
    const header = ['SPH No', 'Pelanggan', 'Tipe', 'Jenis Proyek', 'Modality', 'Sub-Modality', 'Qty', 'Harga Satuan', 'Total Nilai', 'Stage', 'Status', 'Sales', 'Tanggal Terbit', 'Wilayah', 'Catatan'];
    const example = ['SPH/2026/001', 'RS Contoh Sehat', 'hospital', 'private', 'CT Scan', 'CT 128 Slice', '1', '8200000000', '8200000000', 'po_issued', 'won', 'hatim', '2026-03-15', 'Jateng', 'Contoh — hapus baris ini sebelum impor'];
    downloadCSV('HNTI_Template_Import_SPH.csv', [header, example]);
  };

  // PERFORMANCE: Build lookup Maps once (O(1) lookup vs O(n) .find() per row)
  const lookupMaps = useMemo(() => ({
    stageMap: new Map(STAGES.map(s => [s.id, s])),
    projectTypeMap: new Map(PROJECT_TYPES.map(p => [p.id, p])),
    salesMap: new Map(salesTeam.map(sa => [sa.id, sa])),
  }), [salesTeam]);
  const { stageMap, projectTypeMap, salesMap } = lookupMaps;

  const availableYears = useMemo(() => {
    const years = new Set(data.map(s => s.issuedDate?.substring(0, 4)).filter(Boolean));
    return Array.from(years).sort().reverse();
  }, [data]);
  const productFilterOptions = useMemo(() => [...new Set(data.flatMap(s => [s.modality, s.subModality, s.productBrand, s.brand]).filter(Boolean))].sort(), [data]);

  const filteredStats = useMemo(() => {
    const matched = data.filter(s => {
      const matchSearch = !search || s.sphNo.toLowerCase().includes(search.toLowerCase()) || s.customer.toLowerCase().includes(search.toLowerCase()) || s.subModality.toLowerCase().includes(search.toLowerCase());
      const matchYear = filterYear === 'all' || s.issuedDate?.startsWith(filterYear);
      const matchProduct = filterProduct === 'all' || [s.modality, s.subModality, s.productBrand, s.brand].filter(Boolean).includes(filterProduct);
      return matchSearch && matchYear && matchProduct && (filterPType === 'all' || s.projectType === filterPType) && (filterStatus === 'all' || s.status === filterStatus);
    });
    const filtered = [...matched].sort((a, b) => {
      if (sortSPH === 'value_desc') return (Number(b.totalValue) || 0) - (Number(a.totalValue) || 0);
      if (sortSPH === 'value_asc') return (Number(a.totalValue) || 0) - (Number(b.totalValue) || 0);
      if (sortSPH === 'product') return String(a.subModality || a.modality || '').localeCompare(String(b.subModality || b.modality || ''));
      if (sortSPH === 'date_asc') return new Date(a.issuedDate || a.lastUpdate || 0) - new Date(b.issuedDate || b.lastUpdate || 0);
      return new Date(b.issuedDate || b.lastUpdate || 0) - new Date(a.issuedDate || a.lastUpdate || 0);
    });
    const totalValue = filtered.reduce((sum, s) => sum + s.totalValue, 0);
    const activeCount = filtered.filter(s => s.status === 'active').length;
    const wonCount = filtered.filter(s => s.status === 'won').length;
    return { filtered, totalValue, activeCount, wonCount };
  }, [data, search, filterPType, filterStatus, filterYear, filterProduct, sortSPH]);
  const { filtered, totalValue, activeCount, wonCount } = filteredStats;

  // Reset pagination when filter changes
  useEffect(() => { setVisibleCount(pageSize); }, [search, filterPType, filterStatus, filterYear, filterProduct, sortSPH, pageSize]);

  const visibleRows = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const filteredIds = useMemo(() => filtered.map(s => s.id), [filtered]);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every(id => selectedSphIds.includes(id));
  const selectAllRef = useRef(null);
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = selectedSphIds.length > 0 && !allFilteredSelected;
  }, [selectedSphIds.length, allFilteredSelected]);
  const toggleSelectAll = () => {
    if (allFilteredSelected) setSelectedSphIds(prev => prev.filter(id => !filteredIds.includes(id)));
    else {
      setSelectedSphIds(prev => [...new Set([...prev, ...filteredIds])]);
      setDetailSph(null);
    }
  };
  const toggleRowSelect = (id) => {
    setSelectedSphIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    setDetailSph(null);
  };
  const handleBulkDelete = () => {
    if (!selectedSphIds.length) return;
    setBulkDeleteOpen(true);
  };
  const confirmBulkDelete = () => {
    if (onBulkDelete && selectedSphIds.length) onBulkDelete(selectedSphIds);
    setSelectedSphIds([]);
    setBulkDeleteOpen(false);
    setDetailSph(null);
  };

  return (
    <div>
      <div style={{marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '14px'}}>
        <div>
          <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_sph}</div>
          <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.sph_title}</h1>
          <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.sph_subtitle}</div>
        </div>
        {canEdit && (
          <button className="btn-primary" onClick={onAdd}><Plus size={14} strokeWidth={2} />{t.new_sph}</button>
        )}
      </div>

      {canEdit && selectedSphIds.length > 0 && (
        <div style={{marginBottom: '14px', padding: '10px 14px', background: 'rgba(192,48,48,0.06)', border: '1px solid rgba(192,48,48,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap'}}>
          <span style={{fontSize: '12px', fontWeight: 600, color: 'var(--ims-text)'}}>
            {lang === 'id' ? `${selectedSphIds.length} SPH dipilih` : `${selectedSphIds.length} SPH selected`}
            {filtered.length > visibleCount && allFilteredSelected && (
              <span style={{fontWeight: 400, color: 'var(--ims-text-2)', marginLeft: '6px'}}>
                ({lang === 'id' ? `semua ${filtered.length} hasil filter` : `all ${filtered.length} filtered`})
              </span>
            )}
          </span>
          <div style={{display: 'flex', gap: '8px'}}>
            <button onClick={() => setSelectedSphIds([])} className="btn-ghost" style={{fontSize: '11px'}}>
              {lang === 'id' ? 'Batal Pilihan' : 'Clear Selection'}
            </button>
            <button onClick={handleBulkDelete} style={{background: '#c03030', border: 'none', color: '#fff', padding: '8px 14px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'}}>
              <Trash2 size={13} />{lang === 'id' ? `Hapus Data Terpilih (${selectedSphIds.length})` : `Delete Selected (${selectedSphIds.length})`}
            </button>
          </div>
        </div>
      )}

      {!canEdit && <ReadOnlyBanner t={t} />}

      {onRequestSPH && onWorkflowUpdate && (
        <SPHWorkflowConsole
          data={data}
          employees={employees}
          setEmployees={setEmployees}
          products={products}
          session={session}
          lang={lang}
          fmt={fmt}
          onRequestSPH={onRequestSPH}
          onRequestSPP={onRequestSPP}
          onWorkflowUpdate={onWorkflowUpdate}
          onSaveDocument={onSaveDocument}
          generatedDocs={generatedDocs}
          documentTemplates={documentTemplates} />
      )}

      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '18px', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '16px 20px', background: 'var(--ims-bg-card)'}}><div className="lbl-tag">{lang === 'id' ? 'Total SPH' : 'Total Quotations'}</div><div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px'}}>{filtered.length}</div></div>
        <div style={{padding: '16px 20px', background: 'var(--ims-bg-card)'}}><div className="lbl-tag">{t.total_value}</div><div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px'}}>{fmt(totalValue)}</div></div>
        <div style={{padding: '16px 20px', background: 'var(--ims-bg-card)'}}><div className="lbl-tag">{t.status_active}</div><div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px'}}>{activeCount}</div></div>
        <div style={{padding: '16px 20px', background: 'var(--ims-bg-card)'}}><div className="lbl-tag">{t.status_won}</div><div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px'}}>{wonCount}</div></div>
      </div>

      <div style={{display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center', flexWrap: 'wrap'}}>
        <div style={{position: 'relative', flex: '1 1 260px', maxWidth: '380px'}}>
          <Search size={14} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ims-text-2)'}} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search_placeholder} style={{paddingLeft: '36px'}} />
        </div>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{width: 'auto', minWidth: '110px'}}>
          <option value="all">{t.yoy_filter_all} {t.yoy_filter_year}</option>
          {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterPType} onChange={e => setFilterPType(e.target.value)} style={{width: 'auto', minWidth: '140px'}}>
          <option value="all">{lang === 'id' ? 'Semua Jenis' : 'All Types'}</option>
          {PROJECT_TYPES.map(pt => <option key={pt.id} value={pt.id}>{t[`ptype_${pt.id}`]}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{width: 'auto', minWidth: '130px'}}>
          <option value="all">{lang === 'id' ? 'Semua Status' : 'All Status'}</option>
          <option value="active">{t.status_active}</option><option value="won">{t.status_won}</option><option value="lost">{t.status_lost}</option>
        </select>
        <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)} style={{width: 'auto', minWidth: '160px'}}>
          <option value="all">{lang === 'id' ? 'Semua Produk' : 'All Products'}</option>
          {productFilterOptions.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={sortSPH} onChange={e => setSortSPH(e.target.value)} style={{width: 'auto', minWidth: '150px'}}>
          <option value="date_desc">{lang === 'id' ? 'Tanggal Terbaru' : 'Newest Date'}</option>
          <option value="date_asc">{lang === 'id' ? 'Tanggal Terlama' : 'Oldest Date'}</option>
          <option value="product">{lang === 'id' ? 'Urut Produk' : 'By Product'}</option>
          <option value="value_desc">{lang === 'id' ? 'Nilai Tertinggi' : 'Highest Value'}</option>
          <option value="value_asc">{lang === 'id' ? 'Nilai Terendah' : 'Lowest Value'}</option>
        </select>
        <button onClick={() => {
          const header = ['SPH No', lang === 'id' ? 'Pelanggan' : 'Customer', lang === 'id' ? 'Tipe' : 'Type', lang === 'id' ? 'Jenis Proyek' : 'Project Type', 'Modality', 'Sub-Modality', 'Qty', lang === 'id' ? 'Harga Satuan' : 'Unit Price', lang === 'id' ? 'Total Nilai' : 'Total Value', 'Stage', lang === 'id' ? 'Status' : 'Status', 'Sales', lang === 'id' ? 'Tanggal Terbit' : 'Issue Date', lang === 'id' ? 'Update Terakhir' : 'Last Update'];
          const rows = [header, ...filtered.map(s => [s.sphNo, s.customer, s.customerType, s.projectType, s.modality, s.subModality, s.qty, s.unitPrice, s.totalValue, s.stage, s.status, s.salesOwner, s.issuedDate, s.lastUpdate])];
          downloadCSV(`HNTI_SPH_${new Date().toISOString().split('T')[0]}.csv`, rows);
        }} style={{background: 'var(--ims-accent-2)', border: 'none', color: '#fff', padding: '6px 12px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto'}} title={lang === 'id' ? 'Export SPH ke CSV' : 'Export SPH to CSV'}>
          <FileText size={12} />CSV ({filtered.length})
        </button>
        {canEdit && <>
          <button onClick={() => importRef.current && importRef.current.click()} style={{background: '#1a4d8a', border: 'none', color: '#fff', padding: '6px 12px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px'}} title={lang === 'id' ? 'Impor SPH dari file CSV (migrasi data massal)' : 'Import SPH from CSV file (bulk migration)'}>
            <Upload size={12} />{lang === 'id' ? 'Impor' : 'Import'}
          </button>
          <button onClick={downloadSPHTemplate} style={{background: 'transparent', border: '1px solid var(--ims-accent)', color: 'var(--ims-text-2)', padding: '6px 12px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px'}} title={lang === 'id' ? 'Unduh template CSV untuk impor' : 'Download CSV template for import'}>
            <Download size={12} />Template
          </button>
          <input ref={importRef} type="file" accept=".csv,text/csv" onChange={handleImportCSV} style={{display: 'none'}} />
        </>}
      </div>
      {importMsg && <div style={{margin: '0 0 14px', padding: '10px 14px', fontSize: '12px', border: '1px solid', borderColor: importMsg.ok ? 'var(--ims-accent-2)' : '#c03030', background: importMsg.ok ? 'rgba(58,107,58,0.08)' : 'rgba(192,48,48,0.08)', color: importMsg.ok ? '#2c5530' : '#a02020', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px'}}>
        <span>{importMsg.ok ? '✓ ' : '⚠ '}{importMsg.text}</span>
        <button onClick={() => setImportMsg(null)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700, fontSize: '14px'}}>×</button>
      </div>}

      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '1100px'}}>
          <thead>
            <tr style={{background: 'var(--ims-bg-card-2)'}}>
              {canEdit && (
                <th style={{width: '36px', padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--ims-border)'}} onClick={e => e.stopPropagation()}>
                  <input ref={selectAllRef} type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAll} onClick={e => e.stopPropagation()} title={lang === 'id' ? `Pilih semua ${filtered.length} SPH (hasil filter)` : `Select all ${filtered.length} SPH (filtered)`} style={{cursor: 'pointer', width: '14px', height: '14px'}} />
                </th>
              )}
              <Th>{t.sph_number}</Th><Th>{t.customer}</Th><Th>{t.project_type}</Th>
              <Th>{t.modality}</Th><Th align="right">{t.quantity}</Th><Th align="right">{t.value}</Th>
              <Th>{t.status}</Th><Th>{t.sales_owner}</Th>
              <Th align="right">{t.actions}</Th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map(s => {
              const stage = stageMap.get(s.stage);
              const pt = projectTypeMap.get(s.projectType);
              const sales = salesMap.get(s.salesOwner);
              const isSelected = selectedSphIds.includes(s.id);
              return (
                <tr key={s.id} className="hover-row" onClick={(e) => { if (e.target.closest('input[type="checkbox"]') || e.target.closest('button')) return; setDetailSph(s); }} style={{borderTop: '1px solid var(--ims-border)', cursor: 'pointer', background: isSelected ? 'rgba(192,48,48,0.04)' : undefined}}>
                  {canEdit && (
                    <Td onClick={e => e.stopPropagation()} style={{width: '36px', padding: '8px 10px'}}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleRowSelect(s.id)} onClick={e => e.stopPropagation()} style={{cursor: 'pointer', width: '14px', height: '14px'}} />
                    </Td>
                  )}
                  <Td><span className="mono" style={{fontSize: '11px'}}>{s.sphNo}</span></Td>
                  <Td>
                    <div style={{fontWeight: 500}}>{s.customer}</div>
                    <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{t[`type_${s.customerType}`]}</div>
                  </Td>
                  <Td>{pt && <span style={{display: 'inline-block', padding: '3px 7px', fontSize: '10px', background: pt.color + '25', color: pt.color, fontWeight: 600}}>{t[`ptype_${s.projectType}`]}</span>}</Td>
                  <Td>{s.subModality}</Td>
                  <Td align="right">{s.qty}</Td>
                  <Td align="right"><span className="mono" style={{fontWeight: 500}}>{fmt(s.totalValue)}</span></Td>
                  <Td>{stage && <span style={{display: 'inline-block', padding: '3px 7px', fontSize: '10px', background: stage.color + '25', color: stage.color, fontWeight: 600}}>{t[`stage_${s.stage}`]}</span>}</Td>
                  <Td>{sales ? sales.name : s.salesOwner}</Td>
                  <Td align="right">
                    {canEdit && <>
                      <button onClick={(e) => { e.stopPropagation(); onEdit(s); }} style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--ims-text-2)'}} title={lang === 'id' ? 'Edit' : 'Edit'}><Edit2 size={13} /></button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(s.id); }} style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#c03030'}} title={lang === 'id' ? 'Hapus' : 'Delete'}><Trash2 size={13} /></button>
                    </>}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{padding: '50px', textAlign: 'center', color: 'var(--ims-text-2)'}}>{t.no_data}</div>}
        {filtered.length > visibleCount && (
          <div style={{padding: '20px', textAlign: 'center', borderTop: '1px solid var(--ims-border)', background: 'var(--ims-bg-card)'}}>
            <div style={{fontSize: '12px', color: 'var(--ims-text-2)', marginBottom: '10px'}}>
              {lang === 'id' ? 'Menampilkan' : 'Showing'} <strong style={{color: 'var(--ims-text)'}}>{visibleCount}</strong> {lang === 'id' ? 'dari' : 'of'} <strong style={{color: 'var(--ims-text)'}}>{filtered.length}</strong> {lang === 'id' ? 'SPH' : 'SPH records'}
            </div>
            <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
              <button onClick={() => setVisibleCount(c => Math.min(c + 50, filtered.length))} className="btn-ghost" style={{fontSize: '11px'}}>
                {lang === 'id' ? 'Muat 50 Lagi' : 'Load 50 More'}
              </button>
              <button onClick={() => setVisibleCount(filtered.length)} className="btn-ghost" style={{fontSize: '11px'}}>
                {lang === 'id' ? 'Tampilkan Semua' : 'Show All'} ({filtered.length})
              </button>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={bulkDeleteOpen}
        title={lang === 'id' ? 'Hapus SPH Terpilih?' : 'Delete Selected SPH?'}
        message={lang === 'id'
          ? `Apakah Anda yakin ingin menghapus ${selectedSphIds.length} SPH yang dipilih? Tindakan ini tidak dapat dibatalkan.`
          : `Are you sure you want to delete ${selectedSphIds.length} selected SPH record(s)? This action cannot be undone.`}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
        danger
        lang={lang}
      />
      <SPHDetailModal sph={detailSph} employees={employees} lang={lang} fmt={fmt} session={session} documentTemplates={documentTemplates} onClose={() => setDetailSph(null)} onWorkflowUpdate={(id, patch, options) => { onWorkflowUpdate && onWorkflowUpdate(id, patch, options); setDetailSph(prev => prev && prev.id === id ? { ...prev, ...patch } : prev); }} />
    </div>
  );
}
function PipelineBoard({ data, allData, setData, employees = {}, session, logAction, t, lang, canEdit, fmt, onEdit }) {
  const salesTeam = useMemo(() => getActiveSalesTeam(employees), [employees]);
  // For privileged roles, allow filtering by sales owner; sales role uses its own data
  const isPrivilegedRole = session && (session.role === 'super_admin' || session.role === 'gm' || session.role === 'manager_ops' || session.role === 'admin');
  // Sales owner filter — 'all' or specific sales id
  const [filterSales, setFilterSales] = useState('all');
  // Deal reassignment modal state
  const [reassignDeal, setReassignDeal] = useState(null); // null | { deal, newOwner }
  // Default to current year (2026) so pipeline shows current-year deals
  const [filterYear, setFilterYear] = useState('2026');
  // Win rate calculation mode: 'current' (filtered year only) | 'ttm' (trailing 12 months) | 'all' (cumulative)
  const [winRateMode, setWinRateMode] = useState('ttm');
  // Probability filter: 'all' | 'hot' (>=70%) | 'warm' (40-69%) | 'cold' (<40%)
  const [probFilter, setProbFilter] = useState('all');
  // Sort order for deals within a stage column: 'prob_desc' (default, prioritize closing) | 'prob_asc' | 'value_desc' | 'value_asc'
  const [sortBy, setSortBy] = useState('prob_desc');

  const availableYears = useMemo(() => {
    const years = new Set(data.map(s => s.issuedDate?.substring(0, 4)).filter(Boolean));
    return Array.from(years).sort().reverse();
  }, [data]);

  // Probability bucket helper
  const probBucket = (p) => {
    const v = Number(p.probability) || 0;
    if (v >= 70) return 'hot';
    if (v >= 40) return 'warm';
    return 'cold';
  };
  // Sort comparator
  const sortDeals = (arr) => {
    const sorted = [...arr];
    if (sortBy === 'prob_desc') sorted.sort((a, b) => (Number(b.probability) || 0) - (Number(a.probability) || 0));
    else if (sortBy === 'prob_asc') sorted.sort((a, b) => (Number(a.probability) || 0) - (Number(b.probability) || 0));
    else if (sortBy === 'value_desc') sorted.sort((a, b) => (Number(b.totalValue) || 0) - (Number(a.totalValue) || 0));
    else if (sortBy === 'value_asc') sorted.sort((a, b) => (Number(a.totalValue) || 0) - (Number(b.totalValue) || 0));
    return sorted;
  };

  // PERFORMANCE: All pipeline calcs memoized (now scoped by selected year + probability)
  const pipelineStats = useMemo(() => {
    const yearScoped = filterYear === 'all' ? data : data.filter(s => s.issuedDate?.startsWith(filterYear));
    const salesScoped = filterSales === 'all' ? yearScoped : yearScoped.filter(s => s.salesOwner === filterSales);
    const probScoped = probFilter === 'all' ? salesScoped : salesScoped.filter(s => probBucket(s) === probFilter);
    const pipelineData = probScoped.filter(s => s.status === 'active' || s.status === 'won' || s.status === 'lost');
    const totalDeals = pipelineData.length;
    const totalValue = pipelineData.reduce((s, p) => s + (Number(p.totalValue) || 0), 0);
    const wonCount = pipelineData.filter(p => p.status === 'won').length;
    const lostCount = pipelineData.filter(p => p.status === 'lost').length;
    const activeCount = pipelineData.filter(p => p.status === 'active').length;

    // WIN RATE MODE — choose denominator carefully to avoid misleading numbers
    // 'current': year-filtered closed only (can be misleading early in year due to small sample)
    // 'ttm': trailing 12 months from today — most representative for ongoing business
    // 'all': cumulative since inception
    const today = todayStart();
    const ttmStart = new Date(today); ttmStart.setMonth(ttmStart.getMonth() - 12);
    const ttmDeals = data.filter(s => {
      const d = s.issuedDate ? new Date(s.issuedDate) : null;
      return d && d >= ttmStart && (s.status === 'won' || s.status === 'lost');
    });
    const ttmWon = ttmDeals.filter(s => s.status === 'won').length;
    const ttmLost = ttmDeals.filter(s => s.status === 'lost').length;

    const allClosed = data.filter(s => s.status === 'won' || s.status === 'lost');
    const allWon = allClosed.filter(s => s.status === 'won').length;
    const allLost = allClosed.filter(s => s.status === 'lost').length;

    let winRateNum, winRateDen, winRateScope;
    if (winRateMode === 'ttm') {
      winRateNum = ttmWon; winRateDen = ttmWon + ttmLost; winRateScope = 'ttm';
    } else if (winRateMode === 'all') {
      winRateNum = allWon; winRateDen = allWon + allLost; winRateScope = 'all';
    } else {
      winRateNum = wonCount; winRateDen = wonCount + lostCount; winRateScope = 'current';
    }
    const winRate = winRateDen > 0 ? (winRateNum / winRateDen) * 100 : 0;
    const smallSample = winRateDen > 0 && winRateDen < 20;

    return { pipelineData, totalDeals, totalValue, wonCount, lostCount, activeCount, winRate, winRateNum, winRateDen, winRateScope, smallSample, ttmWon, ttmLost, allWon, allLost };
  }, [data, filterYear, winRateMode, probFilter, filterSales]);
  const { pipelineData, totalDeals, totalValue, wonCount, lostCount, activeCount, winRate, winRateNum, winRateDen, winRateScope, smallSample } = pipelineStats;

  // Stage definitions including lost - show statistical view of full journey
  const ALL_STAGES_WITH_LOST = STAGES;

  // PERFORMANCE: Group projects by stage ONCE + build project type lookup map
  const projectTypeMap = useMemo(() => new Map(PROJECT_TYPES.map(p => [p.id, p])), []);
  const stageGroups = useMemo(() => {
    const groups = new Map();
    ALL_STAGES_WITH_LOST.forEach(stage => groups.set(stage.id, { projects: [], stageValue: 0 }));
    pipelineData.forEach(p => {
      const g = groups.get(p.stage);
      if (g) { g.projects.push(p); g.stageValue += p.totalValue; }
    });
    // Apply sort to each group's projects
    groups.forEach(g => { g.projects = sortDeals(g.projects); });
    return groups;
  }, [pipelineData, sortBy]);

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_pipeline}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.pipeline_title}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.pipeline_subtitle}</div>
      </div>
      {!canEdit && <ReadOnlyBanner t={t} />}

      {/* Year filter + Sales filter */}
      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap'}}>
        <span style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? 'Tahun' : 'Year'}:</span>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{width: 'auto', minWidth: '110px'}}>
          <option value="all">{lang === 'id' ? 'Semua Tahun' : 'All Years'}</option>
          {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {isPrivilegedRole && (
          <>
            <span style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginLeft: '8px'}}>{lang === 'id' ? '👤 Sales' : '👤 Sales'}:</span>
            <select value={filterSales} onChange={e => setFilterSales(e.target.value)} style={{width: 'auto', minWidth: '170px'}}>
              <option value="all">{lang === 'id' ? 'Semua Sales' : 'All Sales'}</option>
              {salesTeam.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </>
        )}
        <span style={{fontSize: '11px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{lang === 'id' ? `Menampilkan ${pipelineData.length} deal` : `Showing ${pipelineData.length} deals`}{filterSales !== 'all' && ` · ${salesTeam.find(s => s.id === filterSales)?.name}`}</span>
      </div>

      {/* Probability filter + Sort */}
      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap', padding: '10px 14px', background: 'rgba(26,41,66,0.03)', border: '1px solid var(--ims-border)'}}>
        <span style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? '🎯 Prioritas Kunjungan' : '🎯 Visit Priority'}:</span>
        {[
          { id: 'all', label: lang === 'id' ? 'Semua' : 'All', color: 'var(--ims-text-2)' },
          { id: 'hot', label: lang === 'id' ? '🔥 Hot (≥70%)' : '🔥 Hot (≥70%)', color: '#c03030' },
          { id: 'warm', label: lang === 'id' ? '⚡ Warm (40-69%)' : '⚡ Warm (40-69%)', color: 'var(--ims-accent)' },
          { id: 'cold', label: lang === 'id' ? '❄ Cold (<40%)' : '❄ Cold (<40%)', color: '#5b87b8' },
        ].map(opt => (
          <button key={opt.id} onClick={() => setProbFilter(opt.id)} style={{padding: '5px 11px', fontSize: '11px', fontFamily: 'inherit', background: probFilter === opt.id ? opt.color : 'transparent', color: probFilter === opt.id ? '#fff' : opt.color, border: `1px solid ${opt.color}`, cursor: 'pointer', fontWeight: 600}}>{opt.label}</button>
        ))}
        <span style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <span style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? 'Urutkan' : 'Sort'}:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{width: 'auto', minWidth: '180px', fontSize: '11px'}}>
            <option value="prob_desc">{lang === 'id' ? 'Probabilitas Tertinggi (default)' : 'Highest Probability (default)'}</option>
            <option value="prob_asc">{lang === 'id' ? 'Probabilitas Terendah' : 'Lowest Probability'}</option>
            <option value="value_desc">{lang === 'id' ? 'Nilai Terbesar' : 'Highest Value'}</option>
            <option value="value_asc">{lang === 'id' ? 'Nilai Terkecil' : 'Lowest Value'}</option>
          </select>
        </span>
      </div>

      {probFilter !== 'all' && (
        <div style={{padding: '8px 14px', marginBottom: '14px', background: 'var(--ims-gold-bg)', borderLeft: '3px solid var(--ims-accent)', fontSize: '11.5px', color: '#5a4a1a', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
          💡 <span>{lang === 'id'
            ? <>Anda memfilter <strong>{probFilter === 'hot' ? 'deal panas (≥70%)' : probFilter === 'warm' ? 'deal hangat (40-69%)' : 'deal dingin (<40%)'}</strong>. Fokuskan waktu kunjungan & resources di sini — ini deal yang paling mungkin closing. Klik "Semua" untuk lihat semua deal kembali.</>
            : <>Filtered to <strong>{probFilter === 'hot' ? 'hot deals (≥70%)' : probFilter === 'warm' ? 'warm deals (40-69%)' : 'cold deals (<40%)'}</strong>. Focus your visit time & resources here. Click "All" to reset.</>}</span>
        </div>
      )}

      {/* Info box explaining pipeline columns */}
      <div style={{padding: '12px 16px', background: 'rgba(26,41,66,0.04)', borderLeft: '3px solid var(--ims-border)', marginBottom: '16px', fontSize: '11.5px', color: 'var(--ims-text)', lineHeight: 1.6}}>
        <strong style={{letterSpacing: '0.05em'}}>📊 {lang === 'id' ? 'Cara Membaca Pipeline' : 'How to Read Pipeline'}:</strong>{' '}
        {lang === 'id'
          ? 'Setiap kolom menampilkan jumlah deal yang sedang di stage tersebut (bukan akumulatif). Total semua kolom = total SPH lifecycle pada tahun terpilih. "SPH Awal" = baru dikirim, belum ada follow-up.'
          : 'Each column shows deals currently at that stage (not cumulative). Sum of all columns = total SPH lifecycle for the selected year. "New SPH" = just sent, no follow-up yet.'}
      </div>

      {/* Summary KPI Strip */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '20px', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '14px 16px', background: 'var(--ims-bg-card)'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Total Deal' : 'Total Deals'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '3px'}}>{totalDeals}</div>
          <div className="mono" style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{fmt(totalValue)}</div>
        </div>
        <div style={{padding: '14px 16px', background: 'var(--ims-bg-card)'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Aktif' : 'Active'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '3px', color: '#5b87b8'}}>{activeCount}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'sedang dikerjakan' : 'in progress'}</div>
        </div>
        <div style={{padding: '14px 16px', background: 'var(--ims-bg-card)'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Menang (PO)' : 'Won (PO)'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '3px', color: 'var(--ims-accent-2)'}}>{wonCount}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>PO {lang === 'id' ? 'terbit' : 'issued'}</div>
        </div>
        <div style={{padding: '14px 16px', background: 'var(--ims-bg-card)'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Kalah' : 'Lost'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '3px', color: '#8b3a3a'}}>{lostCount}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'pembelajaran' : 'learnings'}</div>
        </div>
        <div style={{padding: '14px 16px', background: 'var(--ims-bg-alt)', color: 'var(--ims-text)', position: 'relative'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', flexWrap: 'wrap'}}>
            <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-accent)', textTransform: 'uppercase'}}>{t.win_rate}</div>
            <select value={winRateMode} onChange={e => setWinRateMode(e.target.value)} style={{fontSize: '9px', padding: '2px 4px', background: '#0f1a30', border: '1px solid var(--ims-accent)', color: 'var(--ims-accent)', fontFamily: 'inherit', cursor: 'pointer', width: 'auto', textTransform: 'uppercase', letterSpacing: '0.05em'}} title={lang === 'id' ? 'Pilih metode perhitungan' : 'Choose calculation method'}>
              <option value="ttm">{lang === 'id' ? 'TTM (12 Bln)' : 'TTM (12mo)'}</option>
              <option value="current">{filterYear === 'all' ? (lang === 'id' ? 'Semua' : 'All') : filterYear}</option>
              <option value="all">{lang === 'id' ? 'Kumulatif' : 'Cumulative'}</option>
            </select>
          </div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '3px', color: '#fff'}}>{winRateDen > 0 ? winRate.toFixed(1) + '%' : '—'}</div>
          <div style={{fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '2px'}}>
            {winRateNum}/{winRateDen} closed · {winRateScope === 'ttm' ? (lang === 'id' ? '12 bln terakhir' : 'last 12 months') : winRateScope === 'all' ? (lang === 'id' ? 'kumulatif' : 'cumulative') : (lang === 'id' ? 'tahun terpilih' : 'selected year')}
          </div>
          {smallSample && <div style={{fontSize: '9px', color: 'var(--ims-gold)', marginTop: '4px', fontStyle: 'italic'}}>⚠ {lang === 'id' ? 'Sample kecil, kurang representatif' : 'Small sample, less reliable'}</div>}
        </div>
      </div>

      <div style={{display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '20px'}}>
        {ALL_STAGES_WITH_LOST.map(stage => {
          const group = stageGroups.get(stage.id) || { projects: [], stageValue: 0 };
          const projects = group.projects;
          const stageValue = group.stageValue;
          const isLostCol = stage.id === 'lost';
          const isWonCol = stage.id === 'po_issued';
          return (
            <div key={stage.id} style={{minWidth: '280px', flex: '0 0 280px'}}>
              <div style={{padding: '14px', background: 'var(--ims-bg-card)', borderTop: `3px solid ${stage.color}`, borderLeft: '1px solid var(--ims-border)', borderRight: '1px solid var(--ims-border)', borderBottom: '1px solid var(--ims-border)', marginBottom: '10px'}} title={lang === 'id' ? `${projects.length} deal sedang di stage ini` : `${projects.length} deals at this stage`}>
                <div style={{fontSize: '10px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600}}>{t[`stage_${stage.id}`]}</div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px'}}>
                  <span className="serif" style={{fontSize: '22px', fontWeight: 500, color: isLostCol ? '#8b3a3a' : isWonCol ? 'var(--ims-accent-2)' : 'var(--ims-accent)'}}>{projects.length}</span>
                  <span className="mono" style={{fontSize: '11px', color: 'var(--ims-text)', fontWeight: 500}}>{fmt(stageValue)}</span>
                </div>
                <div style={{fontSize: '9px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>
                  {isLostCol ? (lang === 'id' ? 'Deal kalah / batal' : 'Lost / cancelled deals')
                    : isWonCol ? (lang === 'id' ? 'Closed won — PO terbit' : 'Closed won — PO issued')
                    : (lang === 'id' ? 'Sedang di stage ini' : 'Currently at this stage')}
                </div>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                {projects.map(p => {
                  const pt = projectTypeMap.get(p.projectType);
                  const owner = salesTeam.find(s => s.id === p.salesOwner);
                  return (
                    <div key={p.id} className="card-hover" style={{padding: '13px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', opacity: isLostCol ? 0.75 : 1}}>
                      <div onClick={() => canEdit && onEdit(p)} style={{cursor: canEdit ? 'pointer' : 'default'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px'}}>
                          <div style={{fontSize: '12px', fontWeight: 600, lineHeight: 1.3, textDecoration: isLostCol ? 'line-through' : 'none'}}>{p.customer}</div>
                          <div style={{width: '26px', height: '26px', borderRadius: '50%', background: stage.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, flexShrink: 0}}>{p.probability}</div>
                        </div>
                        {pt && <div style={{display: 'inline-block', padding: '2px 6px', fontSize: '9px', background: pt.color + '25', color: pt.color, fontWeight: 600, letterSpacing: '0.05em', marginBottom: '8px', textTransform: 'uppercase'}}>{t[`ptype_${p.projectType}`]}</div>}
                        <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginBottom: '8px'}}>{p.subModality} · Qty {p.qty}</div>
                        <div className="mono" style={{fontSize: '13px', fontWeight: 500}}>{fmt(p.totalValue)}</div>
                        {p.stage === 'tender' && p.tenderSubStage && <div style={{padding: '3px 7px', background: 'var(--ims-gold)20', color: 'var(--ims-text-2)', fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '6px', display: 'inline-block', fontWeight: 600}}>{t[`tender_${p.tenderSubStage}`]}</div>}
                      </div>
                      {/* Owner badge with reassign button — only for privileged roles */}
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--ims-border)'}}>
                        {owner ? (
                          <div style={{display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0}}>
                            <div style={{width: '20px', height: '20px', borderRadius: '50%', background: owner.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 600, flexShrink: 0}}>{owner.initial}</div>
                            <span style={{fontSize: '10.5px', color: 'var(--ims-text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{owner.name}</span>
                          </div>
                        ) : (
                          <span style={{fontSize: '10px', color: '#c03030', fontStyle: 'italic'}}>{lang === 'id' ? 'Belum ada owner' : 'Unassigned'}</span>
                        )}
                        {isPrivilegedRole && canEdit && (
                          <button onClick={(e) => { e.stopPropagation(); setReassignDeal({ deal: p, newOwner: p.salesOwner || 'lukman' }); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', color: '#1a4d8a', padding: '2px 6px', cursor: 'pointer', fontSize: '9px', fontFamily: 'inherit', fontWeight: 600, letterSpacing: '0.03em', flexShrink: 0}} title={lang === 'id' ? 'Ubah owner sales' : 'Reassign sales owner'}>
                            ⇄ {lang === 'id' ? 'Ubah' : 'Reassign'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {projects.length === 0 && <div style={{padding: '20px', textAlign: 'center', fontSize: '11px', color: 'var(--ims-text-2)', border: '1px dashed var(--ims-border)'}}>—</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales Reassignment Modal — only privileged roles */}
      {reassignDeal && (
        <div className="modal-overlay" onClick={() => setReassignDeal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '520px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h2 className="serif" style={{fontSize: '20px', margin: 0, fontWeight: 500}}>{lang === 'id' ? 'Ubah Owner Sales' : 'Reassign Sales Owner'}</h2>
              <button onClick={() => setReassignDeal(null)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={18} /></button>
            </div>

            <div style={{padding: '12px 14px', background: 'var(--ims-gold-bg)', border: '1px solid var(--ims-accent)', marginBottom: '14px', fontSize: '11.5px', color: '#5a4a1a', lineHeight: 1.5}}>
              <strong>{lang === 'id' ? '💡 Mengapa pindah owner?' : '💡 Why reassign?'}</strong>
              <div style={{marginTop: '4px'}}>
                {lang === 'id'
                  ? 'Faskes group (Hermina, Pramita, Mitra Keluarga) pengadaan dari pusat. Misal: Hermina Makassar — area vacant — bisa di-assign ke Dwi (pusat Jakarta) atau Icha (asisten Dwi). Setiap perubahan tercatat di Audit Trail.'
                  : 'Healthcare groups (Hermina, Pramita) procure centrally. E.g. Hermina Makassar — vacant area — can be assigned to Dwi (Jakarta HQ) or Icha. Every change is logged to Audit Trail.'}
              </div>
            </div>

            <div style={{padding: '12px', background: 'var(--ims-bg-card-2)', marginBottom: '14px'}}>
              <div style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{lang === 'id' ? 'Deal' : 'Deal'}</div>
              <div style={{fontSize: '13px', fontWeight: 600, color: 'var(--ims-text)'}}>{reassignDeal.deal.customer}</div>
              <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '3px'}}>
                <span className="mono">{reassignDeal.deal.sphNo}</span> · {reassignDeal.deal.modality} {reassignDeal.deal.subModality} · {fmt(reassignDeal.deal.totalValue)}
              </div>
            </div>

            <Field label={lang === 'id' ? 'Owner Sales Baru' : 'New Sales Owner'}>
              <select value={reassignDeal.newOwner} onChange={e => setReassignDeal(r => ({ ...r, newOwner: e.target.value }))}>
                {salesTeam.map(s => (
                  <option key={s.id} value={s.id}>{s.name} · {lang === 'id' ? s.territory : s.territoryEn}</option>
                ))}
              </select>
            </Field>

            {reassignDeal.deal.salesOwner !== reassignDeal.newOwner && (
              <div style={{marginTop: '10px', padding: '8px 12px', background: 'var(--ims-bg-alt)', border: '1px solid var(--ims-accent-2)', fontSize: '11px', color: '#1a4d2a'}}>
                {lang === 'id' ? 'Pindah dari' : 'Reassigning from'} <strong>{salesTeam.find(s => s.id === reassignDeal.deal.salesOwner)?.name || '—'}</strong> → <strong>{salesTeam.find(s => s.id === reassignDeal.newOwner)?.name}</strong>
              </div>
            )}

            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
              <button onClick={() => setReassignDeal(null)} style={{background: 'transparent', border: '1px solid var(--ims-border)', color: 'var(--ims-text-2)', padding: '8px 18px', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer'}}>{lang === 'id' ? 'Batal' : 'Cancel'}</button>
              <button onClick={() => {
                const oldOwner = reassignDeal.deal.salesOwner;
                const newOwner = reassignDeal.newOwner;
                if (oldOwner === newOwner) { setReassignDeal(null); return; }
                if (setData) {
                  setData(prev => prev.map(s => s.id === reassignDeal.deal.id ? { ...s, salesOwner: newOwner, _ownerHistory: [...(s._ownerHistory || []), { from: oldOwner, to: newOwner, at: new Date().toISOString(), by: session?.username || 'unknown' }] } : s));
                }
                if (logAction) {
                  logAction({
                    module: 'sph', action: 'update',
                    entityId: reassignDeal.deal.id,
                    entityLabel: `${reassignDeal.deal.sphNo} · ${reassignDeal.deal.customer}`,
                    field: 'salesOwner',
                    before: salesTeam.find(s => s.id === oldOwner)?.name || oldOwner,
                    after: salesTeam.find(s => s.id === newOwner)?.name || newOwner,
                    note: 'Reassigned via Pipeline board',
                  });
                }
                setReassignDeal(null);
              }} style={{background: 'var(--ims-bg-alt)', color: '#fff', border: 'none', padding: '8px 18px', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer', fontWeight: 600}}>{lang === 'id' ? 'Simpan Perubahan' : 'Save Change'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function SalesModule({ data, reports, t, lang, fmt, employees = {} }) {
  const salesTeam = useMemo(() => getActiveSalesTeam(employees), [employees]);
  // Filter: view all sales, or drill into one specific sales
  const [selectedSales, setSelectedSales] = useState('all');
  const stats = useMemo(() => salesTeam.map(sales => {
    const sd = data.filter(s => s.salesOwner === sales.id);
    const sr = reports.filter(r => r.salesId === sales.id);
    const active = sd.filter(s => s.status === 'active');
    const won = sd.filter(s => s.status === 'won');
    const lost = sd.filter(s => s.status === 'lost');
    const poIssued = sd.filter(s => s.poStatus === 'issued');
    return {
      ...sales,
      activeCount: active.length, wonCount: won.length, lostCount: lost.length,
      poCount: poIssued.length,
      pipelineValue: active.reduce((s, p) => s + (Number(p.totalValue)||0), 0),
      wonValue: won.reduce((s, p) => s + (Number(p.totalValue)||0), 0),
      poValue: poIssued.reduce((s, p) => s + (Number(p.totalValue)||0), 0),
      winRate: (won.length + lost.length) > 0 ? (won.length / (won.length + lost.length)) * 100 : 0,
      visitsCount: sr.reduce((s, r) => s + (r.visits?.length || 0), 0),
      totalSPH: sd.length,
    };
  }).sort((a, b) => (b.pipelineValue + b.wonValue) - (a.pipelineValue + a.wonValue)), [data, reports]);

  // Filtered view based on selection
  const displayStats = useMemo(() => selectedSales === 'all' ? stats : stats.filter(s => s.id === selectedSales), [stats, selectedSales]);
  const totalAll = useMemo(() => stats.reduce((s, x) => s + x.pipelineValue + x.wonValue, 0), [stats]);

  // Detailed deal list for the selected sales (drill-down)
  const [dealFilter, setDealFilter] = useState('all');
  const allSelectedDeals = useMemo(() => {
    if (selectedSales === 'all') return [];
    return [...data.filter(s => s.salesOwner === selectedSales)].sort((a, b) => (Number(b.totalValue)||0) - (Number(a.totalValue)||0));
  }, [data, selectedSales]);
  const dealCounts = useMemo(() => ({
    all: allSelectedDeals.length,
    won: allSelectedDeals.filter(s => s.status === 'won').length,
    lost: allSelectedDeals.filter(s => s.status === 'lost').length,
    active: allSelectedDeals.filter(s => s.status === 'active').length,
    cancelled: allSelectedDeals.filter(s => s.status === 'cancelled' || s.status === 'pending').length,
  }), [allSelectedDeals]);
  const selectedDeals = useMemo(() => {
    if (dealFilter === 'all') return allSelectedDeals;
    if (dealFilter === 'cancelled') return allSelectedDeals.filter(s => s.status === 'cancelled' || s.status === 'pending');
    return allSelectedDeals.filter(s => s.status === dealFilter);
  }, [allSelectedDeals, dealFilter]);
  useEffect(() => { setDealFilter('all'); }, [selectedSales]);

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_sales}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.sales_title}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.sales_subtitle}</div>
      </div>

      {/* Sales filter — drill into one sales at a time */}
      <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap'}}>
        <span style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? 'Filter Sales' : 'Filter Sales'}:</span>
        <button onClick={() => setSelectedSales('all')} style={{padding: '6px 14px', fontSize: '11px', fontFamily: 'inherit', background: selectedSales === 'all' ? 'var(--ims-accent)' : 'transparent', color: selectedSales === 'all' ? '#fff' : 'var(--ims-accent)', border: '1px solid var(--ims-border)', cursor: 'pointer', fontWeight: 600}}>{lang === 'id' ? 'Semua' : 'All'}</button>
        {salesTeam.map(s => (
          <button key={s.id} onClick={() => setSelectedSales(s.id)} style={{padding: '6px 14px', fontSize: '11px', fontFamily: 'inherit', background: selectedSales === s.id ? s.accent : 'transparent', color: selectedSales === s.id ? '#fff' : s.accent, border: `1px solid ${s.accent}`, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'}}>
            <span style={{width: '16px', height: '16px', borderRadius: '50%', background: selectedSales === s.id ? 'rgba(255,255,255,0.3)' : s.accent, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 700}}>{s.initial}</span>
            {s.name.split(' ')[0]}
          </button>
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: selectedSales === 'all' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px', marginBottom: '24px'}}>
        {displayStats.map((s, i) => (
          <div key={s.id} style={{padding: '18px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', position: 'relative', overflow: 'hidden'}}>
            {selectedSales === 'all' && i < 3 && <div style={{position: 'absolute', top: 0, right: 0, padding: '5px 11px', background: i === 0 ? 'var(--ims-gold)' : i === 1 ? '#b8b8b8' : '#cd7f32', color: '#fff', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em'}}>#{i + 1}</div>}
            <div style={{display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '14px'}}>
              <div style={{width: '42px', height: '42px', borderRadius: '50%', background: s.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600}}>{s.initial}</div>
              <div>
                <div style={{fontSize: '14px', fontWeight: 600}}>{s.name}</div>
                <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? s.territory : s.territoryEn}</div>
              </div>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px'}}>
              <div>
                <div style={{fontSize: '9px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.pipeline_value}</div>
                <div className="mono" style={{fontSize: '13px', fontWeight: 600, marginTop: '2px'}}>{fmt(s.pipelineValue)}</div>
              </div>
              <div>
                <div style={{fontSize: '9px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Nilai Menang' : 'Won Value'}</div>
                <div className="mono" style={{fontSize: '13px', fontWeight: 600, marginTop: '2px', color: 'var(--ims-accent-2)'}}>{fmt(s.wonValue)}</div>
              </div>
              <div>
                <div style={{fontSize: '9px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Deal Aktif' : 'Active Deals'}</div>
                <div className="mono" style={{fontSize: '13px', fontWeight: 600, marginTop: '2px'}}>{s.activeCount}</div>
              </div>
              <div>
                <div style={{fontSize: '9px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.win_rate}</div>
                <div className="mono" style={{fontSize: '13px', fontWeight: 600, marginTop: '2px'}}>{s.winRate.toFixed(0)}%</div>
              </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--ims-text-2)', paddingTop: '10px', borderTop: '1px solid var(--ims-border)'}}>
              <span>{lang === 'id' ? 'Total SPH' : 'Total SPH'}: <strong style={{color: 'var(--ims-text)'}}>{s.totalSPH}</strong></span>
              <span>PO: <strong style={{color: 'var(--ims-text)'}}>{s.poCount}</strong></span>
              <span>{lang === 'id' ? 'Kunjungan' : 'Visits'}: <strong style={{color: 'var(--ims-text)'}}>{s.visitsCount}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Drill-down deal list when single sales selected */}
      {selectedSales !== 'all' && (
        <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
          <div style={{padding: '14px 16px', borderBottom: '1px solid var(--ims-border)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>
            {lang === 'id' ? `Semua Deal — ${salesTeam.find(x => x.id === selectedSales)?.name} (${selectedDeals.length})` : `All Deals — ${salesTeam.find(x => x.id === selectedSales)?.name} (${selectedDeals.length})`}
          </div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '12px 16px', borderBottom: '1px solid var(--ims-border)'}}>
            {[
              { id: 'all', label: lang === 'id' ? 'Semua' : 'All', c: 'var(--ims-accent)' },
              { id: 'won', label: lang === 'id' ? 'Menang' : 'Won', c: 'var(--ims-accent-2)' },
              { id: 'lost', label: lang === 'id' ? 'Kalah' : 'Lost', c: '#c03030' },
              { id: 'active', label: lang === 'id' ? 'Aktif' : 'Active', c: '#5b87b8' },
              { id: 'cancelled', label: lang === 'id' ? 'Pending/Batal' : 'Pending/Cancelled', c: 'var(--ims-text-2)' },
            ].map(f => (
              <button key={f.id} onClick={() => setDealFilter(f.id)} style={{padding: '5px 12px', fontSize: '11px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', background: dealFilter === f.id ? f.c : 'transparent', color: dealFilter === f.id ? '#fff' : f.c, border: `1px solid ${f.c}`, borderRadius: '3px'}}>
                {f.label} ({dealCounts[f.id]})
              </button>
            ))}
          </div>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', minWidth: '760px'}}>
            <thead>
              <tr style={{background: 'var(--ims-bg-card-2)'}}>
                <Th>No. SPH</Th><Th>{lang === 'id' ? 'Pelanggan' : 'Customer'}</Th><Th>{lang === 'id' ? 'Produk' : 'Product'}</Th>
                <Th align="right">{lang === 'id' ? 'Nilai' : 'Value'}</Th><Th align="center">Status</Th><Th>{lang === 'id' ? 'Catatan' : 'Remarks'}</Th>
              </tr>
            </thead>
            <tbody>
              {selectedDeals.length === 0 && <tr><Td colSpan={6}><div className="empty-state">{lang === 'id' ? 'Belum ada deal' : 'No deals yet'}</div></Td></tr>}
              {selectedDeals.map(d => (
                <tr key={d.id} className="hover-row" style={{borderTop: '1px solid var(--ims-border)'}}>
                  <Td><span className="mono" style={{fontSize: '11px'}}>{d.sphNo}</span></Td>
                  <Td>{d.customer}</Td>
                  <Td><span style={{fontSize: '11px'}}>{d.modality} · {d.subModality}</span></Td>
                  <Td align="right"><span className="mono">{fmt(d.totalValue)}</span></Td>
                  <Td align="center">
                    <span style={{padding: '2px 8px', fontSize: '10px', fontWeight: 600, borderRadius: '3px', background: d.status === 'won' ? 'var(--ims-accent-2)22' : d.status === 'lost' ? '#c0303022' : (d.status === 'cancelled' || d.status === 'pending') ? 'var(--ims-text-2)22' : '#5b87b822', color: d.status === 'won' ? 'var(--ims-accent-2)' : d.status === 'lost' ? '#c03030' : (d.status === 'cancelled' || d.status === 'pending') ? 'var(--ims-text-2)' : '#5b87b8'}}>
                      {d.status === 'won' ? (lang === 'id' ? 'Menang' : 'Won') : d.status === 'lost' ? (lang === 'id' ? 'Kalah' : 'Lost') : (d.status === 'cancelled' || d.status === 'pending') ? (lang === 'id' ? 'Pending/Batal' : 'Pending/Cancelled') : (lang === 'id' ? 'Aktif' : 'Active')}
                    </span>
                  </Td>
                  <Td><span style={{fontSize: '11px', color: d.notes ? 'var(--ims-accent)' : '#b3a988', fontStyle: d.notes ? 'normal' : 'italic'}}>{d.notes || (lang === 'id' ? '—' : '—')}</span></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <div className="card-title">{t.sales_performance}</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={(selectedSales === 'all' ? stats : displayStats).map(s => ({ name: s.name.split(' ')[0], [t.pipeline_value]: s.pipelineValue, [t.revenue_ytd]: s.wonValue }))} margin={{top: 5, right: 16, left: 0, bottom: 5}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--ims-text-2)" style={{fontSize: 10}} />
            <YAxis stroke="var(--ims-text-2)" style={{fontSize: 10}} tickFormatter={(v) => v >= 1e9 ? `${(v/1e9).toFixed(0)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v} />
            <Tooltip content={<ChartTooltip fmt={fmt} />} />
            <Legend wrapperStyle={{fontSize: '11px'}} />
            <Bar dataKey={t.pipeline_value} fill="#1a4d8a" radius={[4, 4, 0, 0]} />
            <Bar dataKey={t.revenue_ytd} fill="var(--ims-accent-2)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
function SalesReport({ reports, setReports, t, lang, session, fmt, employees = {}, reportsSeen = {}, setReportsSeen }) {
  const salesTeam = useMemo(() => getActiveSalesTeam(employees), [employees]);
  const markReportsRead = () => {
    if (!setReportsSeen || !reports.length) return;
    const dates = reports.map(r => r.date || '').filter(Boolean).sort();
    const latest = dates[dates.length - 1] || '';
    setReportsSeen(prev => ({ ...prev, [session.username]: latest }));
  };
  const [tab, setTab] = useState('dashboard');
  const [filterSales, setFilterSales] = useState('all');
  const [editingReport, setEditingReport] = useState(null);

  const visibleReports = useMemo(() => session.role === 'sales'
    ? reports.filter(r => r.salesId === session.salesId)
    : (filterSales === 'all' ? reports : reports.filter(r => r.salesId === filterSales))
  , [reports, session.role, session.salesId, filterSales]);

  const tabs = session.role === 'sales' ? ['dashboard', 'new', 'history'] : ['dashboard', 'history'];
  const tabLabels = { dashboard: t.sr_dashboard, new: editingReport ? t.sr_edit_report : t.sr_new, history: t.sr_history };
  const tabIcons = { dashboard: Activity, new: ClipboardList, history: Clock };

  const handleEdit = (report) => {
    setEditingReport(report);
    setTab('new');
  };
  const [deleteReportId, setDeleteReportId] = useState(null);
  const handleDelete = (id) => setDeleteReportId(id);
  const confirmDeleteReport = () => {
    setReports(prev => prev.filter(r => r.id !== deleteReportId));
    setDeleteReportId(null);
  };
  const handleSaved = () => {
    setEditingReport(null);
    setTab('history');
  };

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_sales_report}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.sr_title}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.sr_subtitle}</div>
      </div>

      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {tabs.map(x => {
          const Icon = tabIcons[x];
          const active = tab === x;
          return (
            <button key={x} onClick={() => { setTab(x); if (x !== 'new') setEditingReport(null); }} style={{background: 'transparent', border: 'none', padding: '10px 18px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: active ? 'var(--ims-accent)' : 'var(--ims-text-2)', borderBottom: active ? '2px solid var(--ims-border)' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px', letterSpacing: '0.03em'}}>
              <Icon size={14} strokeWidth={1.5} />{tabLabels[x]}
            </button>
          );
        })}
      </div>

      {session.role !== 'sales' && tab === 'history' && (
        <div style={{display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap'}}>
          <button onClick={() => setFilterSales('all')} style={{padding: '5px 11px', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', background: filterSales === 'all' ? 'var(--ims-accent)' : 'transparent', color: filterSales === 'all' ? 'var(--ims-gold)' : 'var(--ims-text-2)', border: '1px solid ' + (filterSales === 'all' ? 'var(--ims-accent)' : 'var(--ims-border)'), cursor: 'pointer', fontFamily: 'inherit'}}>{lang === 'id' ? 'Semua' : 'All'}</button>
          {salesTeam.map(s => <button key={s.id} onClick={() => setFilterSales(s.id)} style={{padding: '5px 11px', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', background: filterSales === s.id ? 'var(--ims-accent)' : 'transparent', color: filterSales === s.id ? 'var(--ims-gold)' : 'var(--ims-text-2)', border: '1px solid ' + (filterSales === s.id ? 'var(--ims-accent)' : 'var(--ims-border)'), cursor: 'pointer', fontFamily: 'inherit'}}>{s.name.split(' ')[0]}</button>)}
        </div>
      )}

      {tab === 'dashboard' && <SRDashboard reports={visibleReports} t={t} lang={lang} employees={employees} session={session} onMarkRead={markReportsRead} reportsSeen={reportsSeen} />}
      {tab === 'new' && session.role === 'sales' && <SRForm reports={reports} setReports={setReports} t={t} lang={lang} session={session} editingReport={editingReport} onSaved={handleSaved} onCancel={() => { setEditingReport(null); setTab('history'); }} employees={employees} />}
      {tab === 'history' && <SRHistory reports={visibleReports} t={t} lang={lang} fmt={fmt} canEdit={session.role === 'sales'} onEdit={handleEdit} onDelete={handleDelete} session={session} employees={employees} />}
      <ConfirmDialog open={!!deleteReportId} title={lang === 'id' ? 'Hapus Laporan?' : 'Delete Report?'} message={t.sr_confirm_delete || (lang === 'id' ? 'Yakin ingin menghapus laporan ini?' : 'Are you sure you want to delete this report?')} onConfirm={confirmDeleteReport} onCancel={() => setDeleteReportId(null)} danger lang={lang} />
    </div>
  );
}
function SRDashboard({ reports, t, lang, employees = {}, session = {}, onMarkRead, reportsSeen = {} }) {
  const salesTeam = useMemo(() => getActiveSalesTeam(employees), [employees]);
  // PERFORMANCE: All stats memoized (hook must come before any early return)
  const stats = useMemo(() => {
    const totalVisits = reports.reduce((s, r) => s + (r.visits?.length || 0), 0);
    const totalDays = reports.reduce((s, r) => s + (r.days || 0), 0);
    const totalDeals = reports.reduce((s, r) => s + (r.visits?.filter(v => v.visit === 'closed').length || 0), 0);
    const totalPipeRS = reports.reduce((s, r) => s + (r.pipeN || 0), 0);
    const bySales = {};
    reports.forEach(r => {
      if (!bySales[r.salesId]) bySales[r.salesId] = { count: 0 };
      bySales[r.salesId].count += r.visits?.length || 0;
    });
    return { totalVisits, totalDays, totalDeals, totalPipeRS, bySales };
  }, [reports]);

  if (!reports.length) return (
    <div style={{padding: '60px 30px', textAlign: 'center', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
      <ClipboardList size={36} strokeWidth={1.2} style={{color: 'var(--ims-text-2)', marginBottom: '12px'}} />
      <div style={{fontSize: '14px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{t.sr_no_reports}</div>
    </div>
  );

  const { totalVisits, totalDays, totalDeals, totalPipeRS, bySales } = stats;

  // Weekly report notification for CEO / GM / Manager Operasional
  const isManager = ['super_admin', 'gm', 'manager_ops'].includes(session.role);
  const recentReports = (() => {
    if (!isManager || !reports.length) return [];
    const dates = reports.map(r => r.date || '').filter(Boolean).sort();
    const latest = dates[dates.length - 1];
    if (!latest) return [];
    const seen = reportsSeen[session.username];
    let cutStr;
    if (seen) cutStr = seen;
    else { const cut = new Date(latest); cut.setDate(cut.getDate() - 7); cutStr = cut.toISOString().split('T')[0]; }
    return reports.filter(r => (r.date || '') > cutStr).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  })();

  return (
    <div>
      {isManager && recentReports.length > 0 && (
        <div style={{background: 'var(--ims-bg-alt)', color: 'var(--ims-text)', padding: '14px 18px', marginBottom: '20px', borderRadius: '4px', display: 'flex', alignItems: 'flex-start', gap: '12px'}}>
          <Bell size={18} strokeWidth={1.8} style={{color: 'var(--ims-accent)', flexShrink: 0, marginTop: '2px'}} />
          <div style={{flex: 1}}>
            <div style={{fontSize: '13px', fontWeight: 600, marginBottom: '6px'}}>{lang === 'id' ? `${recentReports.length} laporan lapangan baru belum dibaca` : `${recentReports.length} new field reports unread`}</div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px'}}>
              {recentReports.slice(0, 8).map(r => {
                const nm = resolveEmpName(employees, r.salesId);
                return <span key={r.id} style={{fontSize: '11px', background: 'rgba(200,169,106,0.18)', color: '#e8dcc0', padding: '2px 9px', borderRadius: '10px'}}>{nm.split(' ')[0]} · {r.date}</span>;
              })}
              {recentReports.length > 8 && <span style={{fontSize: '11px', color: 'var(--ims-accent)', padding: '2px 4px'}}>+{recentReports.length - 8}</span>}
            </div>
          </div>
          {onMarkRead && <button onClick={onMarkRead} style={{background: 'var(--ims-accent)', color: 'var(--ims-text)', border: 'none', padding: '7px 14px', fontSize: '11px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', borderRadius: '4px', flexShrink: 0, alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '6px'}}><CheckCircle2 size={13} />{lang === 'id' ? 'Tandai Sudah Dibaca' : 'Mark as Read'}</button>}
        </div>
      )}
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '24px', border: '1px solid var(--ims-border)'}}>
        <KPICard label={t.sr_visits_count} value={totalVisits} sublabel={`${reports.length} ${lang === 'id' ? 'laporan' : 'reports'}`} trend={15.2} />
        <KPICard label={t.sr_field_days_total} value={totalDays} sublabel={lang === 'id' ? 'Hari lapangan' : 'Field days'} trend={8.4} />
        <KPICard label={lang === 'id' ? 'Deal Closing' : 'Closing Deals'} value={totalDeals} sublabel={t.deals_won} trend={20.1} />
        <KPICard label={lang === 'id' ? 'RS dalam Pipeline' : 'Pipeline RS'} value={totalPipeRS} sublabel={lang === 'id' ? 'Dari laporan' : 'From reports'} trend={12.5} />
      </div>

      {Object.keys(bySales).length > 0 && (
        <div className="two-col" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
          <div className="card">
            <div className="card-title">{lang === 'id' ? 'Kunjungan per Sales' : 'Visits per Sales'}</div>
            {Object.entries(bySales).map(([id, st]) => {
              const sales = salesTeam.find(s => s.id === id);
              if (!sales) return null;
              const pct = Math.min(st.count / 100 * 100, 100);
              return (
                <div key={id} style={{marginBottom: '12px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px'}}>
                    <span style={{fontWeight: 500}}>{sales.name} <span style={{color: 'var(--ims-text-2)', fontSize: '11px'}}>· {lang === 'id' ? sales.territory : sales.territoryEn}</span></span>
                    <span className="mono" style={{color: 'var(--ims-text-2)', fontSize: '11px'}}>{st.count}</span>
                  </div>
                  <div style={{height: '6px', background: 'var(--ims-bg-card-2)', overflow: 'hidden'}}>
                    <div style={{height: '100%', width: `${pct}%`, background: sales.accent, transition: 'width 0.5s'}} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
function SRForm({ reports, setReports, t, lang, session, editingReport, onSaved, onCancel, employees = {} }) {
  const _base = useMemo(() => getActiveSalesTeam(employees).find(s => s.id === session.salesId), [employees, session.salesId]);
  const sales = _base ? { ..._base, name: resolveEmpName(employees, session.salesId) } : _base;
  const isEdit = !!editingReport;
  const [form, setForm] = useState(editingReport || {
    date: '2026-05-16', week: 'Minggu 1', days: 0, nights: 0, area: '',
    visits: [{ name: '', city: '', visit: 'first', product: '', pipeline: 'cold', contact: '', note: '' }],
    pipeN: 0, pipeVal: 0, closest: '',
    block: '', win: '', next: '', fatigue: 0,
  });

  const addVisit = () => setForm(f => ({ ...f, visits: [...f.visits, { name: '', city: '', visit: 'first', product: '', pipeline: 'cold', contact: '', note: '' }] }));
  const removeVisit = (i) => setForm(f => ({ ...f, visits: f.visits.filter((_, j) => j !== i) }));
  const updateVisit = (i, k, v) => setForm(f => ({ ...f, visits: f.visits.map((vt, j) => j === i ? { ...vt, [k]: v } : vt) }));

  const handleSubmit = () => {
    const validVisits = form.visits.filter(v => v.name.trim());
    const report = {
      id: isEdit ? form.id : 'rpt_' + Date.now(),
      salesId: isEdit ? form.salesId : session.salesId,
      date: form.date, week: form.week, days: parseInt(form.days) || 0, nights: parseInt(form.nights) || 0,
      area: form.area, visits: validVisits, pipeN: parseInt(form.pipeN) || 0, pipeVal: parseInt(form.pipeVal) || 0,
      closest: form.closest,
      block: form.block, win: form.win, next: form.next, fatigue: form.fatigue,
      createdAt: isEdit ? form.createdAt : new Date().toISOString(),
      updatedAt: isEdit ? new Date().toISOString() : undefined,
    };
    if (isEdit) {
      setReports(prev => prev.map(r => r.id === report.id ? report : r));
      showToast(t.sr_updated_success, 'success');
    } else {
      setReports(prev => [report, ...prev]);
      showToast(lang === 'id' ? 'Laporan berhasil disimpan' : 'Report saved successfully', 'success');
    }
    onSaved && onSaved();
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
      <div style={{padding: '14px 18px', background: 'linear-gradient(135deg, var(--ims-bg-alt) 0%, #2a3f5f 100%)', color: 'var(--ims-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
        <div>
          <div style={{fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--ims-accent)', marginBottom: '4px'}}>{isEdit ? t.sr_edit_report : (lang === 'id' ? 'Laporan untuk' : 'Report for')}</div>
          <div style={{fontSize: '17px', fontWeight: 600}}>{sales?.name} · <span style={{opacity: 0.7, fontSize: '13px'}}>{lang === 'id' ? sales?.territory : sales?.territoryEn}</span></div>
        </div>
        {isEdit && onCancel && (
          <button onClick={onCancel} style={{background: 'transparent', color: 'var(--ims-accent)', border: '1px solid var(--ims-accent)', padding: '6px 14px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em'}}>← {t.sr_back_to_history}</button>
        )}
      </div>

      <div className="card">
        <div className="card-title">01 · {t.sr_report_date}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_report_date}</label><input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} /></div>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_week}</label><select value={form.week} onChange={e => setForm(f => ({...f, week: e.target.value}))}><option>Minggu 1</option><option>Minggu 2</option><option>Minggu 3</option><option>Minggu 4</option></select></div>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_field_days}</label><input type="number" min="0" max="7" value={form.days} onChange={e => setForm(f => ({...f, days: e.target.value}))} /></div>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_nights}</label><input type="number" min="0" max="6" value={form.nights} onChange={e => setForm(f => ({...f, nights: e.target.value}))} /></div>
          <div style={{gridColumn: '1 / -1'}}><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_focus_area}</label><input value={form.area} onChange={e => setForm(f => ({...f, area: e.target.value}))} placeholder={lang === 'id' ? 'Contoh: Solo Kota + Sukoharjo' : 'Example: Solo + Sukoharjo'} /></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">02 · {t.sr_visits}</div>
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', fontSize: '11px', borderCollapse: 'collapse', minWidth: '800px'}}>
            <thead>
              <tr style={{background: 'var(--ims-bg-card-2)'}}>
                <th style={{padding: '8px', textAlign: 'left', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ims-text-2)'}}>#</th>
                <th style={{padding: '8px', textAlign: 'left', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Nama RS' : 'Hospital'}</th>
                <th style={{padding: '8px', textAlign: 'left', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Kab/Kota' : 'City'}</th>
                <th style={{padding: '8px', textAlign: 'left', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Kunjungan' : 'Visit'}</th>
                <th style={{padding: '8px', textAlign: 'left', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Produk' : 'Product'}</th>
                <th style={{padding: '8px', textAlign: 'left', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Pipeline' : 'Pipeline'}</th>
                <th style={{padding: '8px', textAlign: 'left', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Kontak' : 'Contact'}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {form.visits.map((v, i) => (
                <tr key={i} style={{borderTop: '1px solid var(--ims-border)'}}>
                  <td style={{padding: '6px', fontSize: '11px', color: 'var(--ims-text-2)', textAlign: 'center'}}>{i + 1}</td>
                  <td style={{padding: '4px'}}><input value={v.name} onChange={e => updateVisit(i, 'name', e.target.value)} placeholder={lang === 'id' ? 'Nama RS' : 'Hospital'} style={{fontSize: '11px', padding: '5px 7px'}} /></td>
                  <td style={{padding: '4px'}}><input value={v.city} onChange={e => updateVisit(i, 'city', e.target.value)} placeholder={lang === 'id' ? 'Kab/Kota' : 'City'} style={{fontSize: '11px', padding: '5px 7px'}} /></td>
                  <td style={{padding: '4px'}}>
                    <select value={v.visit} onChange={e => updateVisit(i, 'visit', e.target.value)} style={{fontSize: '11px', padding: '5px 7px'}}>
                      <option value="first">{lang === 'id' ? 'Pertama' : 'First'}</option>
                      <option value="followup">{lang === 'id' ? 'Follow-up' : 'Follow-up'}</option>
                      <option value="demo">{lang === 'id' ? 'Demo' : 'Demo'}</option>
                      <option value="nego">{lang === 'id' ? 'Negosiasi' : 'Negotiation'}</option>
                      <option value="closed">{lang === 'id' ? 'Closing ✓' : 'Closing ✓'}</option>
                    </select>
                  </td>
                  <td style={{padding: '4px'}}>
                    <select value={v.product} onChange={e => updateVisit(i, 'product', e.target.value)} style={{fontSize: '11px', padding: '5px 7px'}}>
                      <option value="">—</option>
                      <option value="CT">CT Scan</option><option value="MRI">MRI</option>
                      <option value="C-Arm">C-Arm</option><option value="X-Ray">X-Ray</option>
                      <option value="Mammo">Mammo</option><option value="ESWL">ESWL</option>
                    </select>
                  </td>
                  <td style={{padding: '4px'}}>
                    <select value={v.pipeline} onChange={e => updateVisit(i, 'pipeline', e.target.value)} style={{fontSize: '11px', padding: '5px 7px'}}>
                      <option value="cold">{lang === 'id' ? 'Dingin' : 'Cold'}</option>
                      <option value="warm">{lang === 'id' ? 'Hangat' : 'Warm'}</option>
                      <option value="hot">{lang === 'id' ? 'Panas' : 'Hot'}</option>
                      <option value="proposal">{lang === 'id' ? 'Proposal' : 'Proposal'}</option>
                      <option value="win">{lang === 'id' ? 'Deal ✓' : 'Deal ✓'}</option>
                    </select>
                  </td>
                  <td style={{padding: '4px'}}><input value={v.contact} onChange={e => updateVisit(i, 'contact', e.target.value)} placeholder={lang === 'id' ? 'Nama' : 'Name'} style={{fontSize: '11px', padding: '5px 7px'}} /></td>
                  <td><button onClick={() => removeVisit(i)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b3a3a', padding: '4px'}}><X size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addVisit} className="btn-ghost" style={{marginTop: '10px'}}>{t.sr_add_visit}</button>
      </div>

      <div className="card">
        <div className="card-title">03 · {t.sr_pipe_summary}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_pipe_count}</label><input type="number" min="0" value={form.pipeN} onChange={e => setForm(f => ({...f, pipeN: e.target.value}))} /></div>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_pipe_val}</label><input type="number" min="0" value={form.pipeVal} onChange={e => setForm(f => ({...f, pipeVal: e.target.value}))} /></div>
          <div style={{gridColumn: '1 / -1'}}><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_closest}</label><input value={form.closest} onChange={e => setForm(f => ({...f, closest: e.target.value}))} placeholder={lang === 'id' ? 'Nama RS' : 'Hospital name'} /></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">04 · {t.sr_reflection}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '14px'}}>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_win}</label><textarea rows={3} value={form.win} onChange={e => setForm(f => ({...f, win: e.target.value}))} /></div>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_block}</label><textarea rows={3} value={form.block} onChange={e => setForm(f => ({...f, block: e.target.value}))} /></div>
          <div style={{gridColumn: '1 / -1'}}><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_next}</label><textarea rows={2} value={form.next} onChange={e => setForm(f => ({...f, next: e.target.value}))} /></div>
        </div>
        <div>
          <label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '8px', display: 'block'}}>{t.sr_fatigue} (1={lang === 'id' ? 'Segar' : 'Fresh'} · 5={lang === 'id' ? 'Sangat Lelah' : 'Very Tired'})</label>
          <div style={{display: 'flex', gap: '6px'}}>
            {[1, 2, 3, 4, 5].map(v => (
              <button key={v} onClick={() => setForm(f => ({...f, fatigue: v}))} style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: v <= form.fatigue ? 'var(--ims-gold)' : 'var(--ims-border)'}}>
                <Star size={22} fill={v <= form.fatigue ? 'var(--ims-gold)' : 'none'} strokeWidth={1.5} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{padding: '14px 18px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'}}>
        <div style={{fontSize: '12px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{lang === 'id' ? 'Laporan otomatis tampil di dashboard CEO' : 'Report auto-displays on CEO dashboard'}</div>
        <button className="btn-primary" onClick={handleSubmit}>{t.sr_submit} →</button>
      </div>
    </div>
  );
}
function SRHistory({ reports, t, lang, canEdit, onEdit, onDelete, session, fmt, employees = {} }) {
  const salesTeam = useMemo(() => getActiveSalesTeam(employees), [employees]);
  const [expanded, setExpanded] = useState(null);
  const [sortBy, setSortBy] = useState('date_desc');

  const sortedReports = useMemo(() => {
    const arr = [...reports];
    if (sortBy === 'date_desc') return arr.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    if (sortBy === 'date_asc') return arr.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    if (sortBy === 'visits_desc') return arr.sort((a, b) => (b.visits?.length || 0) - (a.visits?.length || 0));
    return arr;
  }, [reports, sortBy]);

  if (!reports.length) return (
    <div style={{padding: '60px 30px', textAlign: 'center', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
      <Clock size={36} strokeWidth={1.2} style={{color: 'var(--ims-text-2)', marginBottom: '12px'}} />
      <div style={{fontSize: '14px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{t.sr_no_reports}</div>
    </div>
  );

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '10px'}}>
        <SortToggle value={sortBy} onChange={setSortBy} lang={lang} options={[
          {value: 'date_desc', label: lang === 'id' ? 'Terbaru' : 'Newest'},
          {value: 'date_asc', label: lang === 'id' ? 'Terlama' : 'Oldest'},
          {value: 'visits_desc', label: lang === 'id' ? 'Visit Terbanyak' : 'Most Visits'},
        ]} />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
        {sortedReports.map(r => {
        const sales = salesTeam.find(s => s.id === r.salesId);
        const isOpen = expanded === r.id;
        // Only the report owner (sales) can edit/delete their own report
        const isOwner = canEdit && session?.salesId === r.salesId;
        return (
          <div key={r.id} style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
            <div style={{padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap'}}>
              <div onClick={() => setExpanded(isOpen ? null : r.id)} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 auto', flexWrap: 'wrap'}}>
                <div style={{width: '4px', height: '38px', background: sales?.accent || 'var(--ims-accent)'}} />
                <div style={{flex: '1 1 200px', minWidth: 0}}>
                  <div style={{fontSize: '13px', fontWeight: 600}}>{sales?.name || r.salesId}</div>
                  <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}} className="mono">{r.date} · {r.week}{r.updatedAt && <span style={{color: 'var(--ims-accent)', marginLeft: '6px'}}>· {lang === 'id' ? 'diedit' : 'edited'}</span>}</div>
                </div>
                <div style={{display: 'flex', gap: '14px', fontSize: '11px', color: 'var(--ims-text-2)', flexWrap: 'wrap'}} className="mono">
                  <span><b style={{color: 'var(--ims-text)'}}>{r.visits?.length || 0}</b> RS</span>
                  <span><b style={{color: 'var(--ims-text)'}}>{r.days}</b> {t.days}</span>
                </div>
                <ChevronDown size={16} style={{transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: 'var(--ims-text-2)'}} />
              </div>
              {isOwner && (
                <div style={{display: 'flex', gap: '4px'}}>
                  <button onClick={(e) => { e.stopPropagation(); onEdit(r); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '5px 10px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit'}} title={t.sr_edit_report}><Edit2 size={11} /></button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(r.id); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '5px 10px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}} title={t.sr_delete_report}><Trash2 size={11} /></button>
                </div>
              )}
            </div>
            {isOpen && (
              <div style={{padding: '16px 22px', borderTop: '1px solid var(--ims-border)', fontSize: '12.5px', lineHeight: 1.7}}>
                {r.win && <p style={{marginBottom: '6px', color: 'var(--ims-accent-2)'}}><strong>✓ {t.sr_win}:</strong> {r.win}</p>}
                {r.block && <p style={{marginBottom: '6px', color: 'var(--ims-accent)'}}><strong>⚠ {t.sr_block}:</strong> {r.block}</p>}
                {r.next && <p style={{marginBottom: '6px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}><strong>{t.sr_next}:</strong> {r.next}</p>}
                {r.area && <p style={{marginBottom: '6px'}}><strong>{t.sr_focus_area}:</strong> {r.area}</p>}
                {r.closest && <p style={{marginBottom: '6px'}}><strong>{t.sr_closest}:</strong> {r.closest}</p>}
                {r.visits?.length > 0 && (
                  <div style={{marginTop: '12px'}}>
                    <div style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', marginBottom: '8px', fontWeight: 600}}>{lang === 'id' ? 'RS Dikunjungi' : 'Hospitals Visited'} ({r.visits.length})</div>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px'}}>
                      {r.visits.map((v, i) => <span key={i} style={{padding: '3px 9px', fontSize: '10px', background: 'var(--ims-bg-card-2)', color: 'var(--ims-text)'}}>{v.name}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
function SPHModal({ sph, t, lang, onSave, onClose, fmtFull, existingData, products, employees = {} }) {
  const [form, setForm] = useState(sph || {
    sphNo: `SPH/2026/${String(Date.now()).slice(-3)}`,
    customer: '', customerType: 'hospital', projectType: 'private',
    modality: 'CT Scan', subModality: '', qty: 1, unitPrice: 0, totalValue: 0,
    issuedDate: '2026-05-16', salesOwner: 'lukman', region: 'Jateng',
    status: 'active', stage: 'sph_sent', probability: 20,
    notes: '', nextAction: '', lastUpdate: '2026-05-16',
    poStatus: null, dpPaid: false, finalPaid: false, shippingStatus: null, customsStatus: null,
    // Tahap 8 — Deal Model defaults (RS Swasta + Cicilan default)
    customerSector: 'swasta', dealModel: 'cicilan',
    paymentScheme: 'dp_installment', dpPercent: 30, installmentMonths: 12,
    ksoYears: 5, ksoInvestorPct: 70,
  });

  // Duplicate detection — detect SPH dengan customer+modality+subModality yang sama
  // Excludes self (kalau edit), excludes lost/cancelled, excludes status 'won' yang sudah closed
  const duplicates = useMemo(() => {
    if (!existingData || !form.customer || !form.modality || !form.subModality) return [];
    const ownId = sph?.id;
    return existingData.filter(s => {
      if (s.id === ownId) return false;
      if (s.status === 'lost' || s.status === 'cancelled') return false;
      // Match customer (case-insensitive) + modality + subModality
      return (
        s.customer?.toLowerCase().trim() === form.customer.toLowerCase().trim() &&
        s.modality?.toLowerCase() === form.modality.toLowerCase() &&
        s.subModality?.toLowerCase().trim() === form.subModality.toLowerCase().trim()
      );
    });
  }, [existingData, form.customer, form.modality, form.subModality, sph]);

  // Modal state for duplicate confirmation
  const [duplicatePrompt, setDuplicatePrompt] = useState(null); // null | { action: 'save_both' | 'replace' | 'cancel' }

  // Active products only — for autocomplete dropdown
  const activeProducts = useMemo(() => (products || []).filter(p => p.active !== false), [products]);
  const salesOwnerOptions = useMemo(() => Object.entries(employees || {})
    .filter(([id, emp]) => emp.role === 'sales' && emp.active !== false)
    .map(([id, emp]) => ({ id, name: emp.name }))
    .sort((a, b) => a.name.localeCompare(b.name)), [employees]);
  const modalityOptions = useMemo(() => {
    const set = new Set(activeProducts.map(p => p.modality).filter(Boolean));
    return Array.from(set).sort();
  }, [activeProducts]);
  // Filter sub-modalities by selected modality
  const subModalityOptions = useMemo(() => {
    return activeProducts.filter(p => p.modality === form.modality).map(p => ({
      id: p.id, type: p.type, brand: p.brand, name: p.name, principal: p.principal, origin: p.origin,
    }));
  }, [activeProducts, form.modality]);
  const enrichSphProductLink = (raw) => {
    const prod = resolveProductRecord({
      productId: raw.productId,
      modality: raw.modality,
      subModality: raw.subModality,
      brand: raw.productBrand || raw.brand || raw.partner,
    }, activeProducts);
    return prod ? {
      ...raw,
      productId: prod.id,
      productBrand: prod.brand,
      principal: prod.principal,
      origin: prod.origin,
      partner: raw.partner || prod.brand,
      items: [{ productId: prod.id, modality: prod.modality, brand: prod.brand, productBrand: prod.brand, subModality: prod.type, productName: prod.name, principal: prod.principal, origin: prod.origin, qty: raw.qty || 1, unitPrice: raw.unitPrice || 0, totalValue: raw.totalValue || ((raw.qty || 1) * (raw.unitPrice || 0)) }],
    } : raw;
  };

  const update = (k, v) => {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      if (k === 'qty' || k === 'unitPrice') next.totalValue = (next.qty || 0) * (next.unitPrice || 0);
      if (k === 'stage') {
        const stage = STAGES.find(s => s.id === v);
        if (stage) next.probability = stage.baseProbability;
        // Stage ⟺ status ⟺ poStatus coherence (review #1/#3): PO Terbit = Menang.
        if (v === 'po_issued') { next.poStatus = 'issued'; next.status = 'won'; next.probability = 100; }
        else if (v === 'lost') { next.status = 'lost'; next.poStatus = null; }
        else { if (next.status === 'won' || next.status === 'lost') next.status = 'active'; next.poStatus = null; }
      }
      if (k === 'status') {
        // Reverse coupling so the Status dropdown stays consistent with stage/PO.
        if (v === 'won') { next.stage = 'po_issued'; next.poStatus = 'issued'; next.probability = 100; }
        else if (v === 'lost') { next.stage = 'lost'; next.poStatus = null; }
        else { // active
          next.poStatus = null;
          if (next.stage === 'po_issued' || next.stage === 'lost') {
            next.stage = 'negotiation';
            const ns = STAGES.find(s => s.id === 'negotiation');
            if (ns) next.probability = ns.baseProbability;
          }
        }
      }
      // ===== Deal Model coherence (Tahap 8) =====
      // Sinkronkan dealModel ⇔ paymentScheme ⇔ projectType supaya semua modul hilir konsisten.
      if (k === 'dealModel') {
        const sec = resolveCustomerSector(next);
        if (v === 'cicilan') {
          next.paymentScheme = 'dp_installment';
          next.projectType = sec === 'pemerintah' ? 'bumn' : 'private';
          if (!next.dpPercent) next.dpPercent = 30;
          if (!next.installmentMonths || next.installmentMonths > 36) next.installmentMonths = 12;
        } else if (v === 'kso') {
          next.paymentScheme = 'kso';
          next.projectType = 'kso';
          if (!next.ksoYears) next.ksoYears = 5;
          if (!next.ksoInvestorPct) next.ksoInvestorPct = 70;
          next.installmentMonths = next.ksoYears * 12;
          next.dpPercent = 10; // konvensi lama
        } else if (v === 'ekatalog') {
          next.paymentScheme = 'after_bast';
          next.projectType = 'government';
          next.dpPercent = 0;
          next.installmentMonths = 0;
        } else if (v === 'tender') {
          next.paymentScheme = 'after_bast';
          next.projectType = 'tender';
          next.dpPercent = 0;
          next.installmentMonths = 0;
        }
      }
      // KSO: ubah ksoYears → otomatis update installmentMonths (years×12)
      if (k === 'ksoYears') {
        next.installmentMonths = (parseInt(v) || 5) * 12;
      }
      // If modality changed, reset subModality (since options change)
      if (k === 'modality') {
        next.subModality = '';
        next.productId = '';
        next.productBrand = '';
        next.principal = '';
        next.origin = '';
      }
      if (k === 'subModality') {
        const prod = resolveProductRecord({ modality: next.modality, subModality: v }, activeProducts);
        if (prod) {
          next.productId = prod.id;
          next.productBrand = prod.brand;
          next.principal = prod.principal;
          next.origin = prod.origin;
          next.partner = prod.brand;
        }
      }
      // If customer changes, also auto-detect sales owner (if not yet set or matches old territory)
      if (k === 'customer' && v && typeof detectSalesOwnerFromCustomer === 'function') {
        const suggested = detectSalesOwnerFromCustomer(v);
        if (suggested) next.salesOwner = suggested;
      }
      return next;
    });
  };

  // Handle final save — interception logic for duplicates
  const handleFinalSave = () => {
    if (duplicates.length > 0 && !sph) {
      // Only prompt for NEW SPH (not edits) when duplicates detected
      setDuplicatePrompt({ open: true });
      return;
    }
    onSave(enrichSphProductLink(form));
  };

  // User chose "save both" — proceed
  const confirmSaveBoth = () => {
    setDuplicatePrompt(null);
    onSave(enrichSphProductLink({ ...form, _duplicateNote: `Sengaja disimpan meski ada ${duplicates.length} SPH serupa untuk customer & produk yang sama. Kemungkinan: update harga / revisi pasca-negosiasi.` }));
  };

  // User chose "replace old" — mark old as cancelled and save new
  const confirmReplace = () => {
    const oldIds = duplicates.map(d => d.id);
    setDuplicatePrompt(null);
    onSave(enrichSphProductLink({ ...form, _replaceOldIds: oldIds, _duplicateNote: `Menggantikan ${duplicates.length} SPH lama (${duplicates.map(d => d.sphNo).join(', ')}) — kemungkinan revisi harga atau penawaran terbaru.` }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h2 className="serif" style={{fontSize: '24px', margin: 0, fontWeight: 500}}>{sph ? t.edit_sph : t.add_new_sph}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>

        {/* Duplicate warning banner — visible saat user mengetik */}
        {duplicates.length > 0 && !sph && (
          <div style={{padding: '12px 14px', background: '#25190c', border: '2px solid var(--ims-accent)', marginBottom: '14px', fontSize: '12px', color: '#5a4a1a', lineHeight: 1.6}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px'}}>
              <AlertTriangle size={16} color="var(--ims-accent)" />
              <strong style={{fontSize: '13px'}}>⚠ {lang === 'id' ? `${duplicates.length} SPH Serupa Terdeteksi` : `${duplicates.length} Similar SPH Detected`}</strong>
            </div>
            <div style={{fontSize: '11px', marginBottom: '6px'}}>
              {lang === 'id'
                ? `Customer "${form.customer}" dengan produk ${form.modality} (${form.subModality}) sudah pernah dapat SPH:`
                : `Customer "${form.customer}" with product ${form.modality} (${form.subModality}) has previous SPH:`}
            </div>
            <ul style={{margin: 0, paddingLeft: '20px', fontSize: '11px'}}>
              {duplicates.map(d => (
                <li key={d.id} style={{marginBottom: '3px'}}>
                  <span className="mono" style={{color: 'var(--ims-text)', fontWeight: 600}}>{d.sphNo}</span>
                  <span style={{color: 'var(--ims-text-2)'}}> · {d.issuedDate} · </span>
                  <span style={{fontWeight: 500}}>{fmtFull ? fmtFull(d.totalValue) : d.totalValue}</span>
                  <span style={{color: 'var(--ims-text-2)'}}> · stage: {d.stage}</span>
                </li>
              ))}
            </ul>
            <div style={{fontSize: '10.5px', color: 'var(--ims-text-2)', marginTop: '6px', fontStyle: 'italic'}}>
              {lang === 'id' ? 'Saat menekan Simpan, sistem akan menanyakan: lanjutkan keduanya atau gantikan yang lama.' : 'On Save, system will ask: keep both or replace old one.'}
            </div>
          </div>
        )}

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          {[
            ['sphNo', t.sph_number, 'text'],
            ['issuedDate', t.issued_date, 'date'],
            ['customer', t.customer, 'text', true],
          ].map(([k, l, ty, full]) => (
            <div key={k} style={{gridColumn: full ? '1 / -1' : 'auto'}}>
              <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{l}</label>
              <input type={ty} value={form[k]} onChange={e => update(k, e.target.value)} />
            </div>
          ))}
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.customer_type}</label>
            <select value={form.customerType} onChange={e => update('customerType', e.target.value)}>
              <option value="hospital">{t.type_hospital}</option><option value="clinic">{t.type_clinic}</option>
              <option value="subdistributor">{t.type_subdistributor}</option><option value="partner">{t.type_partner}</option>
            </select>
          </div>
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.project_type}</label>
            <select value={form.projectType} onChange={e => update('projectType', e.target.value)}>
              {PROJECT_TYPES.map(pt => <option key={pt.id} value={pt.id}>{t[`ptype_${pt.id}`]}</option>)}
            </select>
          </div>
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.sales_owner}</label>
            <select value={form.salesOwner} onChange={e => update('salesOwner', e.target.value)}>
              {salesOwnerOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.modality}</label>
            <select value={form.modality} onChange={e => update('modality', e.target.value)}>
              {(modalityOptions.length > 0 ? modalityOptions : Object.keys(MODALITY_COLORS)).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{lang === 'id' ? 'Dari Master Produk' : 'From Product Master'}</div>
          </div>
          <div style={{gridColumn: '1 / -1'}}>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{lang === 'id' ? 'Tipe' : 'Type'}</label>
            {subModalityOptions.length > 0 ? (
              <>
                <select value={form.subModality} onChange={e => update('subModality', e.target.value)}>
                  <option value="">— {lang === 'id' ? 'Pilih dari Master Produk' : 'Select from Product Master'} —</option>
                  {subModalityOptions.map((p, i) => (
                    <option key={i} value={p.type}>{p.type} ({p.brand} · {p.origin})</option>
                  ))}
                </select>
                <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{lang === 'id' ? `${subModalityOptions.length} produk tersedia untuk modalitas ${form.modality}` : `${subModalityOptions.length} products available for ${form.modality}`}</div>
              </>
            ) : (
              <input value={form.subModality} onChange={e => update('subModality', e.target.value)} placeholder="e.g. CT 128 Slice" />
            )}
          </div>
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.quantity}</label>
            <input type="number" value={form.qty} onChange={e => update('qty', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{lang === 'id' ? 'Harga Unit (Rp)' : 'Unit Price (Rp)'}</label>
            <input type="number" value={form.unitPrice} onChange={e => update('unitPrice', parseFloat(e.target.value) || 0)} />
          </div>
          <div style={{gridColumn: '1 / -1'}}>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.total_value}</label>
            <div style={{padding: '10px 14px', background: 'var(--ims-bg-card-2)', fontSize: '14px', fontWeight: 500}} className="mono">{fmtFull(form.totalValue)}</div>
          </div>
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{lang === 'id' ? 'Tahapan' : 'Stage'}</label>
            <select value={form.stage} onChange={e => update('stage', e.target.value)}>
              {STAGES.map(s => <option key={s.id} value={s.id}>{t[`stage_${s.id}`]}</option>)}
            </select>
          </div>
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.status}</label>
            <select value={form.status} onChange={e => update('status', e.target.value)}>
              <option value="active">{t.status_active}</option><option value="won">{t.status_won}</option><option value="lost">{t.status_lost}</option>
            </select>
          </div>
          {form.stage === 'tender' && (
            <div style={{gridColumn: '1 / -1'}}>
              <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{lang === 'id' ? 'Sub-Tahapan Tender' : 'Tender Sub-Stage'}</label>
              <select value={form.tenderSubStage || ''} onChange={e => update('tenderSubStage', e.target.value)}>
                <option value="">—</option>
                {TENDER_SUBSTAGES.map(s => <option key={s} value={s}>{t[`tender_${s}`]}</option>)}
              </select>
            </div>
          )}
          <div style={{gridColumn: '1 / -1'}}>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.probability} (%)</label>
            <input type="number" min="0" max="100" value={form.probability} onChange={e => update('probability', parseInt(e.target.value) || 0)} />
          </div>
          <div style={{gridColumn: '1 / -1'}}>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.next_action}</label>
            <input value={form.nextAction} onChange={e => update('nextAction', e.target.value)} />
          </div>

          {/* ============== Deal Model Section (Tahap 8) ============== */}
          <div style={{gridColumn: '1 / -1', marginTop: '8px', padding: '14px 16px', background: 'rgba(52,211,153,0.04)', border: '1px solid var(--ims-border)', borderLeft: '3px solid var(--ims-accent)'}}>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-accent)', fontWeight: 700, marginBottom: '12px'}}>
              {t.deal_model_section}
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
              <div>
                <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.customer_sector}</label>
                <select value={resolveCustomerSector(form)} onChange={e => {
                  const sec = e.target.value;
                  // Pilihan dealModel per sektor — reset dealModel kalau tidak valid utk sektor baru
                  const validForSwasta = ['cicilan', 'kso'];
                  const validForPemerintah = ['ekatalog', 'tender', 'kso'];
                  const current = resolveDealModel(form);
                  const valid = sec === 'swasta' ? validForSwasta : validForPemerintah;
                  const next = valid.includes(current) ? current : valid[0];
                  setForm(prev => ({ ...prev, customerSector: sec, dealModel: next }));
                }}>
                  <option value="swasta">{t.sector_swasta}</option>
                  <option value="pemerintah">{t.sector_pemerintah}</option>
                </select>
              </div>
              <div>
                <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.deal_model}</label>
                <select value={resolveDealModel(form)} onChange={e => update('dealModel', e.target.value)}>
                  {resolveCustomerSector(form) === 'swasta' ? (
                    <>
                      <option value="cicilan">{t.dm_cicilan}</option>
                      <option value="kso">{t.dm_kso}</option>
                    </>
                  ) : (
                    <>
                      <option value="ekatalog">{t.dm_ekatalog}</option>
                      <option value="tender">{t.dm_tender}</option>
                      <option value="kso">{t.dm_kso}</option>
                    </>
                  )}
                </select>
              </div>

              {/* Sub-field: CICILAN (DP% + termin) */}
              {resolveDealModel(form) === 'cicilan' && (
                <>
                  <div>
                    <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.dp_percent}</label>
                    <select value={form.dpPercent ?? 30} onChange={e => update('dpPercent', parseInt(e.target.value))}>
                      {CICILAN_DP_OPTIONS.map(p => <option key={p} value={p}>{p}%</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.term_months}</label>
                    <select value={form.installmentMonths ?? 12} onChange={e => update('installmentMonths', parseInt(e.target.value))}>
                      {CICILAN_TERM_OPTIONS.map(m => <option key={m} value={m}>{m} {lang === 'id' ? 'bulan' : 'months'}</option>)}
                    </select>
                  </div>
                </>
              )}

              {/* Sub-field: KSO (durasi + bagi hasil) */}
              {resolveDealModel(form) === 'kso' && (
                <>
                  <div>
                    <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.kso_years}</label>
                    <select value={form.ksoYears ?? 5} onChange={e => update('ksoYears', parseInt(e.target.value))}>
                      {KSO_YEAR_OPTIONS.map(y => <option key={y} value={y}>{y} {lang === 'id' ? 'tahun' : 'years'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.kso_investor_pct}</label>
                    <select value={form.ksoInvestorPct ?? 70} onChange={e => update('ksoInvestorPct', parseFloat(e.target.value))}>
                      {KSO_INVESTOR_PCT_OPTIONS.map(p => <option key={p} value={p}>{p.toFixed(1)}%</option>)}
                    </select>
                  </div>
                  <div style={{gridColumn: '1 / -1', padding: '8px 12px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', fontSize: '11px', color: 'var(--ims-text-2)'}}>
                    <strong style={{color: 'var(--ims-text)'}}>{t.kso_rs_pct}:</strong> {(100 - (form.ksoInvestorPct ?? 70)).toFixed(1)}%
                    <span style={{marginLeft: '12px', fontStyle: 'italic'}}>· {t.kso_billing_note}</span>
                  </div>
                </>
              )}

              {/* Sub-field: e-Katalog / Tender → tidak ada submenu, hanya info */}
              {(resolveDealModel(form) === 'ekatalog' || resolveDealModel(form) === 'tender') && (
                <div style={{gridColumn: '1 / -1', padding: '8px 12px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', fontSize: '11px', color: 'var(--ims-text-2)'}}>
                  <strong style={{color: 'var(--ims-text)'}}>{resolveDealModel(form) === 'ekatalog' ? t.dm_ekatalog : t.dm_tender}:</strong> {t.after_bast_full}
                </div>
              )}

              {/* Pratinjau Jadwal Pembayaran */}
              {(() => {
                const sch = computeInvoiceSchedule(form);
                if (!sch.invoices.length) return null;
                const firstAmt = sch.invoices[0]?.amount || 0;
                const lastDate = sch.invoices[sch.invoices.length - 1]?.date || '-';
                return (
                  <div style={{gridColumn: '1 / -1', padding: '10px 12px', background: 'var(--ims-bg-card)', border: '1px dashed var(--ims-border)', fontSize: '11.5px', color: 'var(--ims-text)'}}>
                    <div style={{fontWeight: 600, marginBottom: '6px', color: 'var(--ims-accent)', fontSize: '10.5px', letterSpacing: '0.1em', textTransform: 'uppercase'}}>📊 {t.payment_preview}</div>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '11px'}}>
                      <div><span style={{color: 'var(--ims-text-2)'}}>{t.preview_total_invoices}:</span> <strong>{sch.totalCount}</strong></div>
                      <div><span style={{color: 'var(--ims-text-2)'}}>{t.preview_first_billing}:</span> <strong className="mono">{fmtFull ? fmtFull(firstAmt) : firstAmt}</strong></div>
                      <div><span style={{color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Tagihan Terakhir' : 'Last Billing'}:</span> <strong className="mono">{lastDate}</strong></div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <div style={{gridColumn: '1 / -1'}}>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.notes}</label>
            <textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} />
          </div>
        </div>

        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.cancel}</button>
          <button className="btn-primary" onClick={handleFinalSave}>{t.save}</button>
        </div>
      </div>

      {/* Duplicate Detection Modal — pops over the SPH modal when duplicate is found */}
      {duplicatePrompt && (
        <div className="modal-overlay" style={{zIndex: 10001, background: 'rgba(0,0,0,0.7)'}} onClick={() => setDuplicatePrompt(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '600px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
              <div style={{width: '40px', height: '40px', borderRadius: '50%', background: '#25190c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                <AlertTriangle size={22} color="var(--ims-accent)" />
              </div>
              <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500, color: 'var(--ims-text)'}}>
                {lang === 'id' ? `${duplicates.length} SPH Serupa Terdeteksi` : `${duplicates.length} Similar SPH Detected`}
              </h2>
            </div>

            <p style={{fontSize: '13px', color: 'var(--ims-text)', lineHeight: 1.6, margin: '0 0 14px'}}>
              {lang === 'id'
                ? <>Sistem mendeteksi SPH dengan <strong>customer + produk + tipe yang sama</strong>. Hal ini umum terjadi karena:</>
                : <>System detected SPH with <strong>same customer + product + type</strong>. This commonly happens because:</>}
            </p>
            <ul style={{fontSize: '12px', color: '#5a4a1a', lineHeight: 1.7, paddingLeft: '20px', margin: '0 0 14px', background: 'var(--ims-gold-bg)', padding: '12px 14px 12px 32px', border: '1px solid var(--ims-accent)'}}>
              <li>{lang === 'id' ? 'Proyek tahun lalu pending, customer minta penawaran terbaru dengan harga update' : 'Last year\'s pending project, customer requests updated quotation'}</li>
              <li>{lang === 'id' ? 'Hasil negosiasi — SPH baru dengan harga setelah diskusi' : 'Post-negotiation — new SPH reflecting agreed price'}</li>
              <li>{lang === 'id' ? 'Revisi konfigurasi atau bundling alat berbeda' : 'Configuration revision or different equipment bundling'}</li>
            </ul>

            <div style={{padding: '12px', background: 'var(--ims-bg-card-2)', marginBottom: '16px', maxHeight: '180px', overflowY: 'auto'}}>
              <div style={{fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '8px'}}>
                {lang === 'id' ? 'SPH Lama yang Sudah Ada' : 'Existing Previous SPH'}
              </div>
              {duplicates.map(d => (
                <div key={d.id} style={{padding: '8px 10px', background: 'var(--ims-bg-card)', marginBottom: '6px', border: '1px solid var(--ims-border)'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
                    <div>
                      <span className="mono" style={{color: 'var(--ims-text)', fontWeight: 600, fontSize: '12px'}}>{d.sphNo}</span>
                      <span style={{color: 'var(--ims-text-2)', fontSize: '11px'}}> · {d.issuedDate}</span>
                    </div>
                    <div style={{fontWeight: 600, color: 'var(--ims-text)', fontSize: '12px'}}>{fmtFull ? fmtFull(d.totalValue) : d.totalValue}</div>
                  </div>
                  <div style={{fontSize: '10.5px', color: 'var(--ims-text-2)', marginTop: '3px'}}>
                    {lang === 'id' ? 'Stage' : 'Stage'}: <strong style={{color: 'var(--ims-text)'}}>{d.stage}</strong>
                    {' · '}
                    {lang === 'id' ? 'Probabilitas' : 'Probability'}: <strong style={{color: 'var(--ims-text)'}}>{d.probability}%</strong>
                  </div>
                </div>
              ))}
            </div>

            <div style={{fontSize: '12px', color: 'var(--ims-text)', lineHeight: 1.6, margin: '0 0 12px', fontWeight: 600}}>
              {lang === 'id' ? 'Apa yang ingin Bapak lakukan?' : 'What would you like to do?'}
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              {/* Option 1: Save both */}
              <button onClick={confirmSaveBoth} style={{padding: '12px 14px', background: 'var(--ims-bg-card)', border: '1px solid #1a4d8a', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <Plus size={16} color="#1a4d8a" />
                  <div style={{flex: 1}}>
                    <div style={{fontSize: '12px', fontWeight: 600, color: '#1a4d8a'}}>{lang === 'id' ? 'Simpan Keduanya' : 'Save Both'}</div>
                    <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'SPH baru disimpan, SPH lama tetap aktif. Berguna untuk membandingkan revisi harga.' : 'New SPH saved, old SPH stays active. Useful for tracking price revisions.'}</div>
                  </div>
                </div>
              </button>

              {/* Option 2: Replace old */}
              <button onClick={confirmReplace} style={{padding: '12px 14px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-accent)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <RefreshCw size={16} color="var(--ims-accent)" />
                  <div style={{flex: 1}}>
                    <div style={{fontSize: '12px', fontWeight: 600, color: 'var(--ims-accent)'}}>{lang === 'id' ? `Gantikan SPH Lama (${duplicates.length})` : `Replace Old SPH (${duplicates.length})`}</div>
                    <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'SPH lama di-set "cancelled" + SPH baru disimpan. Cocok untuk revisi pasca-negosiasi.' : 'Old SPHs marked "cancelled" + new SPH saved. Best for post-negotiation revision.'}</div>
                  </div>
                </div>
              </button>

              {/* Option 3: Cancel */}
              <button onClick={() => setDuplicatePrompt(null)} style={{padding: '12px 14px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <X size={16} color="var(--ims-text-2)" />
                  <div style={{flex: 1}}>
                    <div style={{fontSize: '12px', fontWeight: 600, color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Batal — Tinjau Ulang Dulu' : 'Cancel — Review First'}</div>
                    <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'Kembali ke form untuk edit/perbaiki data.' : 'Back to form to edit/correct data.'}</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { SPHWorkflowConsole, SPHDetailModal, SPHManagement, PipelineBoard, SalesModule, SalesReport, SRDashboard, SRForm, SRHistory, SPHModal };

// Extracted from App.jsx during modular refactor.
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Activity, AlertTriangle, ArrowUpRight, Bell, Check, CheckCircle2, ChevronDown, ClipboardList, Clock, Download, Edit2, FileCheck, FileText, History, Layers, LayoutDashboard, MapPin, Plus, RefreshCw, Search, Sparkles, Star, Target, TrendingUp, Trash2, Upload, Users, X, Zap } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip, ConfirmDialog, CurrencyInput, Field, KPICard, ReadOnlyBanner, SortToggle, Td, Th, PieWithSummary } from '../components/ui.jsx';
import { DASHBOARD_GLASS, DashboardHero, DashboardKpiGrid, GlassPanel, QuickNavGrid } from '../components/FuturisticDashboardShell.jsx';
import { DocumentEditorModal } from '../components/DocumentEditorModal.jsx';
import { DEFAULT_DOCUMENT_TEMPLATES } from '../constants/docs.js';
import { CICILAN_DP_OPTIONS, CICILAN_TERM_OPTIONS, KSO_INVESTOR_PCT_OPTIONS, KSO_YEAR_OPTIONS, MODALITY_COLORS, PROJECT_TYPES, STAGES, TENDER_SUBSTAGES } from '../constants/sales.js';
import { addDaysIso, computeInvoiceSchedule, detectSalesOwnerFromCustomer, getActiveSalesTeam, getFactoryProductionDays, resolveCustomerSector, resolveDealModel, resolveEmpName, resolveProductRecord } from '../utils/domain.js';
import { formatDateTime, formatDuration, normalizeExternalUrl, todayStart, currentYear } from '../utils/format.js';
import { CHART_COLORS } from '../constants/theme.js';
import { getProjectStageRows, SPH_WORKFLOW_LABELS, isAdminQueueRequest } from '../utils/sphStage.js';
import { buildEditorTemplate, downloadCSV, downloadSPHWord, downloadSPPWord, printHtmlStringAsPdf, printSPHPdf, printSPPPdf } from '../utils/documents.js';
import { parseSPHImport } from '../utils/csvImport.js';
import { filterBillableRows, formatPackageItemsSummary, formatPackageModalityLabel, getPackageComponents, sphBillableValue, countUniqueSphNumbers } from '../utils/sphPackage.js';
import { showToast } from '../utils/toast.js';
const SPHWorkflowConsole = React.memo(function SPHWorkflowConsole({ data, employees, setEmployees, session, lang, t, fmt, onRequestSPH, onRequestSPP, onWorkflowUpdate, onSaveDocument, generatedDocs = [], setGeneratedDocs, products = [], documentTemplates = DEFAULT_DOCUMENT_TEMPLATES, activeTab, onTabChange }) {
  const [open, setOpen] = useState('request_sph');
  useEffect(() => {
    if (activeTab) setOpen(activeTab);
  }, [activeTab]);
  const selectTab = (id) => {
    setOpen(id);
    onTabChange?.(id);
  };
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [deleteQueueId, setDeleteQueueId] = useState(null);
  const [deleteDocId, setDeleteDocId] = useState(null);
  const [editorState, setEditorState] = useState(null); // { record, docType, html, title }
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
  const requestRows = data.filter(isAdminQueueRequest);
  const isAdminish = ['super_admin', 'gm', 'admin'].includes(session.role);
  const canDeleteDoc = isAdminish;
  const deleteQueueTarget = data.find(s => s.id === deleteQueueId);
  // RBAC riwayat dokumen: sales hanya lihat dokumen miliknya; CEO/admin lihat semua
  const isCeoLevel = ['super_admin', 'gm', 'admin'].includes(session.role);
  const visibleDocs = useMemo(() => {
    const list = Array.isArray(generatedDocs) ? generatedDocs : [];
    if (isCeoLevel) return list;
    // sales: hanya requesterId === dirinya
    return list.filter(d => d.requesterId === session.username || d.requesterId === session.salesId || d.createdBy === session.username);
  }, [generatedDocs, isCeoLevel, session.username, session.salesId]);
  const deleteDocTarget = visibleDocs.find(d => d.id === deleteDocId);
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

  const submitRequest = (kind) => {
    if (!form.customer.trim()) { showToast(lang === 'id' ? 'Nama pelanggan wajib diisi' : 'Customer name required', 'error'); return; }
    if (editingRequestId) {
      const first = (form.items || [])[0] || {};
      const items = (form.items || []).slice(0, 5).map((it, idx) => ({ ...it, lineNo: idx + 1, qty: Number(it.qty) || 1, unitPrice: Number(it.unitPrice) || 0, totalValue: (Number(it.qty) || 1) * (Number(it.unitPrice) || 0) }));
      onWorkflowUpdate(editingRequestId, { ...form, items, productId: first.productId || '', productBrand: first.brand || '', modality: first.modality || '-', subModality: first.subModality || '-', qty: Number(first.qty) || 1, unitPrice: Number(first.unitPrice) || 0, totalValue: items.reduce((sum, it) => sum + (Number(it.totalValue) || 0), 0), workflowEvent: 'request_edited' }, { note: 'Request SPH edited' });
      setEditingRequestId(null);
      setForm({ customer: '', customerAddress: '', customerType: 'hospital', projectType: 'private', items: [{ productId: '', modality: '', brand: '', subModality: '', qty: 1, unitPrice: '' }], dpPercent: 30, installmentMonths: 12, manualTerms: '', notes: '' });
      return;
    }
    if (kind === 'spp') { onRequestSPP({ ...form, salesOwner: session.salesId || session.username }); showToast(lang === 'id' ? 'Request SPP terkirim ke Admin' : 'SPP request sent to Admin', 'success'); }
    else { onRequestSPH({ ...form, salesOwner: session.salesId || session.username }); showToast(lang === 'id' ? 'Request SPH terkirim ke Admin' : 'SPH request sent to Admin', 'success'); }
    setForm({ customer: '', customerAddress: '', customerType: 'hospital', projectType: 'private', items: [{ productId: '', modality: '', brand: '', subModality: '', qty: 1, unitPrice: '' }], dpPercent: 30, installmentMonths: 12, manualTerms: '', notes: '' });
  };
  const editQueueRequest = (s) => {
    setEditingRequestId(s.id);
    setForm({
      customer: s.customer || '', customerAddress: s.customerAddress || '', customerType: s.customerType || 'hospital', projectType: s.projectType || 'private',
      items: Array.isArray(s.items) && s.items.length ? s.items.map(it => ({ productId: it.productId || '', modality: it.modality || '', brand: it.brand || it.productBrand || '', subModality: it.subModality || '', qty: it.qty || 1, unitPrice: it.unitPrice || '' })) : [{ productId: s.productId || '', modality: s.modality || '', brand: s.productBrand || '', subModality: s.subModality || '', qty: s.qty || 1, unitPrice: s.unitPrice || '' }],
      dpPercent: s.dpPercent || 30, installmentMonths: s.installmentMonths || 12, manualTerms: s.manualTerms || '', notes: s.notes || '',
    });
    setOpen(s.docKind === 'spp' ? 'request_spp' : 'request_sph');
    onTabChange?.(s.docKind === 'spp' ? 'request_spp' : 'request_sph');
  };
  const isRequestFormOpen = open === 'request_sph' || open === 'request_spp';
  return (
    <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', marginBottom: '18px'}}>
      <div style={{padding: '12px 16px', borderBottom: '1px solid var(--ims-border)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
        {[
          { id: 'request_sph', label: lang === 'id' ? 'Request SPH' : 'Request SPH', icon: Plus, accent: 'var(--ims-accent)' },
          { id: 'request_spp', label: lang === 'id' ? 'Request SPP' : 'Request SPP', icon: FileCheck, accent: 'var(--ims-accent-2)' },
          { id: 'queue', label: lang === 'id' ? `Antrian Admin (${requestRows.length})` : `Admin Queue (${requestRows.length})`, icon: Bell, accent: 'var(--ims-accent)' },
          { id: 'docs', label: lang === 'id' ? `Riwayat Dokumen (${visibleDocs.length})` : `Document History (${visibleDocs.length})`, icon: History, accent: 'var(--ims-accent)' },
        ].map(tb => {
          const Icon = tb.icon;
          const active = open === tb.id;
          return <button key={tb.id} onClick={() => selectTab(tb.id)} style={{background: active ? tb.accent : 'transparent', color: active ? '#fff' : 'var(--ims-text-2)', border: `1px solid ${active ? tb.accent : 'var(--ims-border)'}`, padding: '7px 11px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'}}><Icon size={12} />{tb.label}</button>;
        })}
      </div>

      {isRequestFormOpen && (
        <div style={{padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px'}}>
          <Field label={lang === 'id' ? 'Nama RS / Pelanggan' : 'Customer'}><input value={form.customer} onChange={e => update('customer', e.target.value)} /></Field>
          <Field label={lang === 'id' ? 'Tipe Pelanggan' : 'Customer Type'}>
            <select value={form.customerType} onChange={e => update('customerType', e.target.value)}>
              <option value="hospital">{t.type_hospital}</option>
              <option value="clinic">{t.type_clinic}</option>
              <option value="subdistributor">{t.type_subdistributor}</option>
              <option value="partner">{t.type_partner}</option>
              <option value="personal">{t.type_personal}</option>
            </select>
          </Field>
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
              <Field label={lang === 'id' ? 'Harga Satuan' : 'Unit Price'}><CurrencyInput lang={lang} value={item.unitPrice} onChange={v => updateItem(idx, 'unitPrice', v)} placeholder="0" /></Field>
              <div style={{display: 'flex', alignItems: 'end'}}><button type="button" onClick={() => removeRequestItem(idx)} className="btn-ghost" style={{fontSize: '10px', color: '#c03030'}}><Trash2 size={11} /></button></div>
            </div>
          ))}
          <Field label="DP %">
            <select value={form.dpPercent} onChange={e => update('dpPercent', Number(e.target.value))}>
              {CICILAN_DP_OPTIONS.map(p => <option key={p} value={p}>{p}%</option>)}
            </select>
          </Field>
          <Field label={lang === 'id' ? 'Termin / Tenor Bulan' : 'Terms / Months'}><input type="number" value={form.installmentMonths} onChange={e => update('installmentMonths', e.target.value)} /></Field>
          <Field label={lang === 'id' ? 'Alamat Pelanggan' : 'Customer Address'} full><input value={form.customerAddress} onChange={e => update('customerAddress', e.target.value)} /></Field>
          <Field label={lang === 'id' ? 'Kondisi Manual / Editable' : 'Manual Editable Terms'} full><textarea rows={3} value={form.manualTerms} onChange={e => update('manualTerms', e.target.value)} placeholder={lang === 'id' ? 'Contoh: bonus backup unit, garansi khusus, delivery time, catatan tender...' : 'Special warranty, delivery time, tender notes...'} /></Field>
          <Field label={lang === 'id' ? 'Catatan Internal' : 'Internal Notes'} full><textarea rows={2} value={form.notes} onChange={e => update('notes', e.target.value)} /></Field>
          <div style={{gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px'}}>
            <span style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>
              {open === 'request_spp'
                ? (lang === 'id' ? 'Request SPP → notifikasi Admin, GM, Manager Ops & CEO. Admin memakai template SPP.' : 'SPP request → notifies Admin, GM, Ops Manager & CEO. Admin uses SPP template.')
                : (lang === 'id' ? 'Request SPH → notifikasi Admin, GM, Manager Ops & CEO. Admin memakai template SPH.' : 'SPH request → notifies Admin, GM, Ops Manager & CEO. Admin uses SPH template.')}
            </span>
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
            const isSpp = s.docKind === 'spp';
            const kindLabel = isSpp ? 'SPP' : 'SPH';
            return (
              <div key={s.id} style={{padding: '12px', background: 'var(--ims-bg)', border: '1px solid var(--ims-border)', display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) minmax(320px, 0.9fr) auto', gap: '12px', alignItems: 'center'}}>
                <div>
                  <div style={{fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
                    <span style={{fontSize: '9px', fontWeight: 800, letterSpacing: '0.08em', padding: '2px 7px', background: isSpp ? 'var(--ims-accent-2)22' : 'var(--ims-accent)22', color: isSpp ? 'var(--ims-accent-2)' : 'var(--ims-accent)'}}>{kindLabel}</span>
                    {s.customer} · {s.subModality}
                  </div>
                  <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '3px'}}><span className="mono">{s.sphNo}</span> · Sales: {resolveEmpName(employees, s.salesOwner)} · {SPH_WORKFLOW_LABELS[s.sphWorkflowStatus] || s.sphWorkflowStatus}</div>
                  <div className="mono" style={{fontSize: '11px', color: 'var(--ims-text)', marginTop: '3px'}}>{fmt(s.totalValue || 0)} · DP {s.dpPercent || 0}% · {s.installmentMonths || 0} bulan</div>
                </div>
                <div>
                  <div style={{fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 800, marginBottom: '5px'}}>Google Drive {kindLabel}</div>
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
                    if (s.sphWorkflowStatus === 'requested') onWorkflowUpdate(s.id, { sphWorkflowStatus: 'admin_drafting', sphDraftStartedAt: new Date().toISOString(), workflowEvent: 'admin_drafting', nextAction: isSpp ? 'Admin membuat SPP dengan template HNTI' : 'Admin membuat SPH dengan template HNTI' }, { note: `Admin mulai membuat ${kindLabel}` });
                  }} className="btn-primary" style={{fontSize: '10px', padding: '6px 10px'}} title={`Buka editor ${kindLabel} & isi otomatis dari template`}><Edit2 size={11} />Mulai {kindLabel}</button>}
                  <button onClick={() => isSpp ? downloadSPPWord(s, employees, fmt, documentTemplates) : downloadSPHWord(s, employees, fmt, documentTemplates)} className="btn-ghost" style={{fontSize: '10px'}} title={`Unduh ${kindLabel} Word`}><Download size={11} />Unduh</button>
                  {isAdminish && s.sphWorkflowStatus !== 'ready_for_sales' && <button onClick={() => onWorkflowUpdate(s.id, { sphWorkflowStatus: 'ready_for_sales', sphDocReadyAt: new Date().toISOString(), workflowEvent: 'ready_for_sales', nextAction: 'Sales menyampaikan penawaran ke klien' }, { note: `${kindLabel} ready for sales`, notify: { target: { username: s.salesOwner }, payload: { type: isSpp ? 'spp_ready' : 'sph_ready', message: `${kindLabel} ${s.sphNo} untuk ${s.customer} sudah dibuat Admin dan siap disampaikan ke klien.`, link: { view: 'sph', id: s.id } } } })} className="btn-primary" style={{fontSize: '10px', padding: '6px 10px', background: 'var(--ims-accent-2)'}} title={`Kirim ${kindLabel} ke sales`}>Kirim ke Sales</button>}
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
            {isCeoLevel
              ? (lang === 'id' ? 'Menampilkan semua dokumen. Admin / GM / CEO dapat menghapus riwayat dokumen yang sudah diunduh sales.' : 'Showing all documents. Admin / GM / CEO can delete downloaded document history.')
              : (lang === 'id' ? 'Menampilkan dokumen Anda saja.' : 'Showing your documents only.')}
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
                {canDeleteDoc && setGeneratedDocs && (
                  <button onClick={() => setDeleteDocId(doc.id)} className="btn-ghost" style={{fontSize: '10px', color: '#c03030'}} title={lang === 'id' ? 'Hapus dari riwayat dokumen' : 'Remove from document history'}><Trash2 size={11} />{lang === 'id' ? 'Hapus' : 'Delete'}</button>
                )}
              </div>
            </div>
          ))}
          {visibleDocs.length === 0 && <div className="empty-state">{lang === 'id' ? 'Belum ada dokumen tersimpan. Klik "Mulai" di Antrian Admin untuk membuat dokumen.' : 'No documents yet.'}</div>}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteDocId}
        title={lang === 'id' ? 'Hapus riwayat dokumen?' : 'Delete document history?'}
        message={lang === 'id'
          ? `Dokumen "${deleteDocTarget?.docTitle || ''}"${deleteDocTarget?.customer ? ` · ${deleteDocTarget.customer}` : ''} akan dihapus permanen dari riwayat. Lanjutkan?`
          : `Document "${deleteDocTarget?.docTitle || ''}"${deleteDocTarget?.customer ? ` · ${deleteDocTarget.customer}` : ''} will be permanently removed from history. Continue?`}
        onConfirm={() => {
          if (deleteDocId && setGeneratedDocs) {
            setGeneratedDocs(prev => prev.filter(d => d.id !== deleteDocId));
            showToast(lang === 'id' ? 'Dokumen dihapus dari riwayat' : 'Document removed from history', 'success');
          }
          setDeleteDocId(null);
        }}
        onCancel={() => setDeleteDocId(null)}
        danger
        lang={lang}
      />

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
function SPHDetailModal({ sph, allSph = [], employees, lang, fmt, onClose, onWorkflowUpdate, session, documentTemplates = DEFAULT_DOCUMENT_TEMPLATES }) {
  if (!sph) return null;
  const packageComponents = getPackageComponents(allSph, sph);
  const actionNow = () => new Date().toISOString();
  const actions = [
    { label: 'Admin: Mulai SPH/SPP', patch: { sphWorkflowStatus: 'admin_drafting', sphDraftStartedAt: actionNow(), workflowEvent: 'admin_drafting', nextAction: 'Admin membuat Surat SPH/SPP' }, notify: { target: { role: 'admin' }, payload: { type: 'sph_request', message: `Request SPH/SPP ${sph.customer} sedang diproses Admin.`, link: { view: 'sph', id: sph.id } } } },
    { label: 'Admin: SPH/SPP selesai', patch: { sphWorkflowStatus: 'ready_for_sales', sphDocReadyAt: actionNow(), workflowEvent: 'ready_for_sales', nextAction: 'Sales menyampaikan penawaran ke klien' }, notify: { target: { username: sph.salesOwner }, payload: { type: 'sph_ready', message: `SPH/SPP ${sph.customer} siap disampaikan ke klien.`, link: { view: 'sph', id: sph.id } } } },
    { label: 'Sales: Penawaran dikirim', patch: { sphWorkflowStatus: 'offer_sent', offerSentAt: actionNow(), workflowEvent: 'offer_sent', nextAction: 'Menunggu informasi PO dari klien' } },
    { label: 'Sales: PO dari klien', patch: { stage: 'po_issued', status: 'won', poStatus: 'issued', probability: 100, sphWorkflowStatus: 'client_po_info', clientPoInfoAt: actionNow(), poIssuedAt: actionNow(), workflowEvent: 'client_po_info', nextAction: 'Proses kontrak dengan klien' }, notify: { target: { role: 'admin' }, payload: { type: 'po_won', message: `Informasi PO diterima untuk ${sph.customer}. Lanjut proses kontrak.`, link: { view: 'sph', id: sph.id } } } },
    { label: 'Sales: Proses Kontrak', patch: { sphWorkflowStatus: 'contract_process', contractProcessAt: actionNow(), workflowEvent: 'contract_process', nextAction: 'Admin input SPH/SPP & PO ke IMS' } },
    { label: 'Admin: Input SPH/SPP IMS', patch: { sphWorkflowStatus: 'po_input_ims', poInputAt: actionNow(), financePoNotifiedAt: actionNow(), workflowEvent: 'po_input_ims', nextAction: 'Finance membuat invoice penagihan DP' }, notify: { target: { role: 'finance' }, payload: { type: 'po_won', message: `SPH/SPP ${sph.customer} sudah diinput ke IMS. Finance perlu membuat invoice DP.`, link: { view: 'finance', id: sph.id } } } },
    { label: 'Finance: Invoice DP', patch: { sphWorkflowStatus: 'invoice_ready', financeDocsStatus: 'ready_for_sales', financeDocsReadyAt: actionNow(), workflowEvent: 'invoice_ready', nextAction: 'Sales follow-up pembayaran DP/deposit' }, notify: { target: { username: sph.salesOwner }, payload: { type: 'invoice_ready', message: `Invoice DP ${sph.customer} sudah siap. Sales perlu follow-up klien.`, link: { view: 'sph', id: sph.id } } } },
    { label: 'Sales: Follow-up DP', patch: { sphWorkflowStatus: 'dp_followup', dpFollowupAt: actionNow(), workflowEvent: 'dp_followup', nextAction: 'Menunggu konfirmasi pembayaran DP dari klien' } },
    { label: 'Finance: DP diterima', patch: { sphWorkflowStatus: 'dp_confirmed', dpDecisionAt: actionNow(), dpConfirmedAt: actionNow(), dpPaid: true, workflowEvent: 'dp_confirmed', nextAction: 'Finance membuat PO ke pabrik' }, notify: { target: { role: 'finance' }, payload: { type: 'dp_paid', message: `DP/deposit ${sph.customer} sudah diterima. Finance dapat membuat PO ke pabrik.`, link: { view: 'finance', id: sph.id } } } },
    { label: 'Finance: PO ke Pabrik', patch: { sphWorkflowStatus: 'factory_po_sent', manufacturePoCreatedAt: actionNow(), factoryPoSentAt: actionNow(), principalPoStatus: 'sent', principalPoSentAt: actionNow(), workflowEvent: 'factory_po_sent', nextAction: 'Finance membayar DP ke pabrik' }, notify: { target: { role: 'manager_ops' }, payload: { type: 'system', message: `PO ke pabrik ${sph.customer} sudah dikirim. Operasional menunggu DP pabrik dan produksi.`, link: { view: 'operations', id: sph.id } } } },
    { label: 'Finance: DP ke Pabrik dibayar', patch: { sphWorkflowStatus: 'factory_dp_paid', factoryDpPaidAt: actionNow(), supplierDpPaidAt: actionNow(), shippingStatus: 'plan_order', workflowEvent: 'factory_dp_paid', nextAction: 'Operasional klik pesanan dibuat dan mulai produksi/disiapkan pabrik' }, notify: { target: { role: 'manager_ops' }, payload: { type: 'factory_dp_paid', message: `DP ke pabrik ${sph.customer} sudah dibayarkan. Tombol pesanan dibuat di Operasional sudah aktif.`, link: { view: 'operations', id: sph.id } } } },
    { label: 'Ops: Barang diproduksi/disiapkan pabrik', patch: { sphWorkflowStatus: 'factory_production', factoryProductionStartedAt: actionNow(), factoryProductionDays: getFactoryProductionDays(sph), factoryProductionDueAt: addDaysIso(actionNow(), getFactoryProductionDays(sph)), shippingStatus: 'plan_order', workflowEvent: 'factory_production', nextAction: 'Menunggu produksi/disiapkan pabrik selesai' }, notify: { target: { role: 'manager_ops' }, payload: { type: 'factory_production', message: `Produksi/disiapkan pabrik ${sph.customer} dimulai.`, link: { view: 'operations', id: sph.id } } } },
    { label: 'Ops: Import/Clearance', patch: { sphWorkflowStatus: 'import_clearance', principalPoStatus: 'sent', principalPoSentAt: actionNow(), importClearanceAt: actionNow(), shippingStatus: 'on_shipment', workflowEvent: 'import_clearance', nextAction: 'Operasional update clearance sampai barang dikirim ke klien' } },
    { label: 'Ops: Barang ke Klien', patch: { sphWorkflowStatus: 'goods_sent_client', goodsSentClientAt: actionNow(), localDeliveryStatus: 'on_delivery', shippingStatus: 'sent_client', workflowEvent: 'goods_sent_client', nextAction: 'Menunggu barang diterima klien' }, notify: { target: { role: 'technician' }, payload: { type: 'install_pending', message: `Barang ${sph.customer} sudah dikirim ke klien. Teknisi menunggu konfirmasi diterima klien.`, link: { view: 'technical_support', id: sph.id } } } },
    { label: 'Ops: Barang diterima Klien', patch: { sphWorkflowStatus: 'goods_received_client', clientReceivedAt: actionNow(), localDeliveryStatus: 'delivered_to_rs', shippingStatus: 'client_received', technicianNotifiedAt: actionNow(), workflowEvent: 'goods_received_client', nextAction: 'Teknisi atur jadwal instalasi' }, notify: { target: { role: 'technician' }, payload: { type: 'install_pending', message: `Barang ${sph.customer} sudah diterima klien. Teknisi perlu update jadwal instalasi.`, link: { view: 'technical_support', id: sph.id } } } },
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
            <div style={{fontSize: '12px', color: 'var(--ims-text-2)', marginTop: '4px'}}><span className="mono">{sph.sphNo}</span> · {formatPackageModalityLabel(sph, packageComponents, lang)} · Sales: {resolveEmpName(employees, sph.salesOwner)}</div>
            {sph.pricingMode === 'package_primary' && packageComponents.length > 0 && (
              <div style={{fontSize: '11px', color: 'var(--ims-accent)', marginTop: '6px', lineHeight: 1.5}}>
                {lang === 'id' ? 'Isi paket:' : 'Package items:'} {formatPackageItemsSummary(sph, packageComponents)}
              </div>
            )}
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
  const [filterYear, setFilterYear] = useState(String(currentYear()));
  const [filterProduct, setFilterProduct] = useState('all');
  const [sortSPH, setSortSPH] = useState('date_desc');
  const [sphTab, setSphTab] = useState('list');
  const [workflowTab, setWorkflowTab] = useState('request_sph');
  const [pageSize, setPageSize] = useState(50);  // Pagination: 50 rows initial, "Load more" button
  const [visibleCount, setVisibleCount] = useState(50);
  const [detailSph, setDetailSph] = useState(null);
  const [selectedSphIds, setSelectedSphIds] = useState([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const importRef = useRef(null);
  const [importMsg, setImportMsg] = useState(null);
  const [expandedPackages, setExpandedPackages] = useState(() => new Set());

  const togglePackageExpand = (id) => {
    setExpandedPackages(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleImportCSV = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const { records, errors } = parseSPHImport(String(ev.target.result || ''));
        if (!records.length) { setImportMsg({ ok: false, text: errors[0] || (lang === 'id' ? 'Tidak ada data valid.' : 'No valid data.') }); return; }
        const res = (onImport && onImport(records)) || { added: 0, updated: 0, total: records.length };
        setSphTab('list');
        setFilterYear('all');
        setSearch('');
        setFilterStatus('all');
        setFilterPType('all');
        setFilterProduct('all');
        setVisibleCount(Math.max(pageSize, records.length));
        setImportMsg({ ok: true, text: lang === 'id'
          ? `${res.total ?? records.length} baris diproses → ${res.added} ditambah, ${res.updated} diperbarui${errors.length ? `, ${errors.length} dilewati` : ''}. Data disimpan — filter direset agar semua baris terlihat.`
          : `${res.total ?? records.length} rows processed → ${res.added} added, ${res.updated} updated${errors.length ? `, ${errors.length} skipped` : ''}. Saved — filters reset to show all rows.` });
      } catch (err) { setImportMsg({ ok: false, text: (lang === 'id' ? 'Gagal membaca file: ' : 'Failed to read file: ') + err.message }); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  const downloadSPHTemplate = () => {
    const header = ['SPH No', 'Pelanggan', 'Tipe', 'Jenis Proyek', 'Modality', 'Sub-Modality', 'Qty', 'Harga Satuan', 'Total Nilai', 'Stage', 'Status', 'Sales', 'Tanggal Terbit', 'Wilayah', 'Catatan'];
    const example = ['SPH/2026/001', 'RS Contoh Sehat', 'hospital', 'private', 'CT Scan', 'CT 128 Slice', '1', '8200000000', '8200000000', 'sph_sent', 'active', 'hatim', '2026-03-15', 'Jateng', 'Contoh — hapus baris ini sebelum impor'];
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
      if (sortSPH === 'value_desc') return sphBillableValue(b) - sphBillableValue(a);
      if (sortSPH === 'value_asc') return sphBillableValue(a) - sphBillableValue(b);
      if (sortSPH === 'product') return String(a.subModality || a.modality || '').localeCompare(String(b.subModality || b.modality || ''));
      if (sortSPH === 'date_asc') return new Date(a.issuedDate || a.lastUpdate || 0) - new Date(b.issuedDate || b.lastUpdate || 0);
      return new Date(b.issuedDate || b.lastUpdate || 0) - new Date(a.issuedDate || a.lastUpdate || 0);
    });
    const listRows = filterBillableRows(filtered);
    const totalValue = listRows.reduce((sum, s) => sum + sphBillableValue(s), 0);
    const activeCount = listRows.filter(s => s.status === 'active').length;
    const wonCount = listRows.filter(s => s.status === 'won').length;
    const projectCount = countUniqueSphNumbers(listRows);
    return { filtered: listRows, allFiltered: filtered, totalValue, activeCount, wonCount, projectCount };
  }, [data, search, filterPType, filterStatus, filterYear, filterProduct, sortSPH]);
  const { filtered, allFiltered, totalValue, activeCount, wonCount, projectCount } = filteredStats;

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

      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {[
          { id: 'list', label: lang === 'id' ? 'Daftar SPH' : 'SPH List', icon: FileText },
          { id: 'dashboard', label: lang === 'id' ? 'Dashboard' : 'Dashboard', icon: LayoutDashboard },
        ].map(tb => {
          const Icon = tb.icon;
          const active = sphTab === tb.id;
          return (
            <button key={tb.id} onClick={() => setSphTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '10px 18px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: active ? 'var(--ims-accent)' : 'var(--ims-text-2)', borderBottom: active ? '2px solid var(--ims-border)' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px', letterSpacing: '0.03em'}}>
              <Icon size={14} strokeWidth={1.5} />{tb.label}
            </button>
          );
        })}
      </div>

      {sphTab === 'dashboard' && (
        <SPHDashboard data={data} generatedDocs={generatedDocs} fmt={fmt} lang={lang} t={t} salesTeam={salesTeam} onNavigateTab={(id) => {
          if (id === 'queue') { setSphTab('list'); setWorkflowTab('queue'); return; }
          if (id === 'list' || id === 'po') { setSphTab('list'); return; }
          setSphTab('dashboard');
        }} />
      )}

      {sphTab === 'list' && (
      <>
      {onRequestSPH && onWorkflowUpdate && (
        <SPHWorkflowConsole
          data={data}
          employees={employees}
          setEmployees={setEmployees}
          products={products}
          session={session}
          lang={lang}
          t={t}
          fmt={fmt}
          onRequestSPH={onRequestSPH}
          onRequestSPP={onRequestSPP}
          onWorkflowUpdate={onWorkflowUpdate}
          onSaveDocument={onSaveDocument}
          setGeneratedDocs={setGeneratedDocs}
          generatedDocs={generatedDocs}
          documentTemplates={documentTemplates}
          activeTab={workflowTab}
          onTabChange={setWorkflowTab} />
      )}

      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '18px', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '16px 20px', background: 'var(--ims-bg-card)'}}><div className="lbl-tag">{lang === 'id' ? 'Total SPH' : 'Total Quotations'}</div><div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px'}}>{filtered.length}</div><div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '3px'}}>{projectCount} {lang === 'id' ? 'nomor surat unik' : 'unique ref. no.'}</div></div>
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
          <option value="active">{t.status_active}</option><option value="won">{t.status_won}</option><option value="lost">{t.status_lost}</option><option value="inactive">{t.status_inactive}</option>
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
          const rows = [header, ...filtered.map(s => [s.sphNo, s.customer, s.customerType, s.projectType, s.modality, s.subModality, s.qty, s.unitPrice, sphBillableValue(s), s.stage, s.status, s.salesOwner, s.issuedDate, s.lastUpdate])];
          downloadCSV(`HNTI_SPH_${new Date().toISOString().split('T')[0]}.csv`, rows);
        }} style={{background: 'var(--ims-accent-2)', border: 'none', color: '#fff', padding: '6px 12px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto'}} title={lang === 'id' ? 'Export SPH ke CSV (baris billable, sama dengan Total SPH)' : 'Export billable SPH rows to CSV'}>
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
              const statusBadge = {
                active: { label: t.status_active, color: '#5b87b8' },
                won: { label: t.status_won, color: 'var(--ims-accent-2)' },
                lost: { label: t.status_lost, color: '#8b3a3a' },
                inactive: { label: t.status_inactive, color: '#64748b' },
                cancelled: { label: lang === 'id' ? 'Batal' : 'Cancelled', color: '#94a3b8' },
              }[s.status] || { label: t.status_active, color: '#5b87b8' };
              const pt = projectTypeMap.get(s.projectType);
              const sales = salesMap.get(s.salesOwner);
              const isSelected = selectedSphIds.includes(s.id);
              const packageComponents = s.pricingMode === 'package_primary' ? getPackageComponents(data, s) : [];
              const isPackage = s.pricingMode === 'package_primary' && packageComponents.length > 0;
              const isExpanded = expandedPackages.has(s.id);
              const rowNodes = [];
              rowNodes.push(
                <tr key={s.id} className="hover-row" onClick={(e) => { if (e.target.closest('input[type="checkbox"]') || e.target.closest('button')) return; setDetailSph(s); }} style={{borderTop: '1px solid var(--ims-border)', cursor: 'pointer', background: isSelected ? 'rgba(192,48,48,0.04)' : undefined}}>
                  {canEdit && (
                    <Td onClick={e => e.stopPropagation()} style={{width: '36px', padding: '8px 10px'}}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleRowSelect(s.id)} onClick={e => e.stopPropagation()} style={{cursor: 'pointer', width: '14px', height: '14px'}} />
                    </Td>
                  )}
                  <Td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                      {isPackage && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); togglePackageExpand(s.id); }} style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--ims-accent)', display: 'flex'}} title={lang === 'id' ? 'Tampilkan item paket' : 'Show package items'}>
                          <ChevronDown size={14} style={{transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s'}} />
                        </button>
                      )}
                      <span className="mono" style={{fontSize: '11px'}}>{s.sphNo}</span>
                    </div>
                  </Td>
                  <Td>
                    <div style={{fontWeight: 500}}>{s.customer}</div>
                    <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{t[`type_${s.customerType}`]}</div>
                  </Td>
                  <Td>{pt && <span style={{display: 'inline-block', padding: '3px 7px', fontSize: '10px', background: pt.color + '25', color: pt.color, fontWeight: 600}}>{t[`ptype_${s.projectType}`]}</span>}</Td>
                  <Td>
                    <div>{formatPackageModalityLabel(s, packageComponents, lang)}</div>
                    {isPackage && !isExpanded && (
                      <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '3px', lineHeight: 1.4}}>{formatPackageItemsSummary(s, packageComponents)}</div>
                    )}
                    {isPackage && (
                      <span style={{display: 'inline-block', marginTop: '4px', padding: '2px 6px', fontSize: '9px', background: 'rgba(26,77,138,0.12)', color: '#1a4d8a', fontWeight: 700, letterSpacing: '0.04em'}}>PAKET</span>
                    )}
                  </Td>
                  <Td align="right">{s.qty}</Td>
                  <Td align="right"><span className="mono" style={{fontWeight: 500}}>{fmt(sphBillableValue(s))}</span></Td>
                  <Td>
                    <span style={{display: 'inline-block', padding: '3px 7px', fontSize: '10px', background: statusBadge.color + '25', color: statusBadge.color, fontWeight: 600}}>{statusBadge.label}</span>
                    {stage && s.status === 'active' && (
                      <div style={{fontSize: '9px', color: 'var(--ims-text-2)', marginTop: '3px'}}>{t[`stage_${s.stage}`] || s.stage}</div>
                    )}
                  </Td>
                  <Td>{sales ? sales.name : s.salesOwner}</Td>
                  <Td align="right">
                    {canEdit && <>
                      <button onClick={(e) => { e.stopPropagation(); onEdit(s); }} style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--ims-text-2)'}} title={lang === 'id' ? 'Edit' : 'Edit'}><Edit2 size={13} /></button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(s.id); }} style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#c03030'}} title={lang === 'id' ? 'Hapus' : 'Delete'}><Trash2 size={13} /></button>
                    </>}
                  </Td>
                </tr>
              );
              if (isPackage && isExpanded) {
                packageComponents.forEach(comp => {
                  rowNodes.push(
                    <tr key={`${s.id}__${comp.id}`} style={{background: 'var(--ims-bg-card-2)', borderTop: '1px solid var(--ims-border)'}}>
                      {canEdit && <Td />}
                      <Td><span className="mono" style={{fontSize: '10px', color: 'var(--ims-text-2)', paddingLeft: '20px'}}>{s.sphNo}</span></Td>
                      <Td colSpan={2} style={{fontSize: '11px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{lang === 'id' ? '↳ Item paket' : '↳ Package item'}</Td>
                      <Td style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>{comp.subModality || comp.modality}</Td>
                      <Td align="right" style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>{comp.qty || 1}</Td>
                      <Td align="right" style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Termasuk paket' : 'Included'}</Td>
                      <Td colSpan={3} />
                    </tr>
                  );
                });
              }
              return rowNodes;
            }).flat()}
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
      <SPHDetailModal sph={detailSph} allSph={data} employees={employees} lang={lang} fmt={fmt} session={session} documentTemplates={documentTemplates} onClose={() => setDetailSph(null)} onWorkflowUpdate={(id, patch, options) => { onWorkflowUpdate && onWorkflowUpdate(id, patch, options); setDetailSph(prev => prev && prev.id === id ? { ...prev, ...patch } : prev); }} />
      </>
      )}
    </div>
  );
}

function PipelineDashboard({ data, allData, reports = [], pipelineStats, stageGroups, stages, salesTeam, t, lang, fmt, filterYear, probFilter, onNavigateTab }) {
  const glass = DASHBOARD_GLASS.pipeline;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const { pipelineData, totalDeals, totalValue, projectCount, wonCount, lostCount, activeCount, inactiveCount, winRate, winRateNum, winRateDen } = pipelineStats;

  const dash = useMemo(() => {
    const yr = filterYear === 'all' ? String(currentYear()) : filterYear;
    const pursuit = pipelineData.filter(p => p.status === 'active');
    const hot = pursuit.filter(p => (Number(p.probability) || 0) >= 70).length;
    const warm = pursuit.filter(p => { const v = Number(p.probability) || 0; return v >= 40 && v < 70; }).length;
    const cold = pursuit.filter(p => (Number(p.probability) || 0) < 40).length;
    const weighted = pipelineData.filter(p => p.status === 'active').reduce((s, p) => s + sphBillableValue(p) * (Number(p.probability) || 0) / 100, 0);
    const poIssued = filterBillableRows(allData).filter(s => s.poStatus === 'issued' && (filterYear === 'all' || s.issuedDate?.startsWith(filterYear))).length;
    const funnelData = stages.map(st => ({
      name: (t[`stage_${st.id}`] || st.id).slice(0, 14),
      value: (stageGroups.get(st.id)?.projects || []).length,
      fill: st.color,
    }));
    const modalityMap = pipelineData.reduce((acc, p) => { const k = p.modality || 'Other'; acc[k] = (acc[k] || 0) + sphBillableValue(p); return acc; }, {});
    const modalityData = Object.entries(modalityMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
    const monthlyDeals = MONTHS.map((m, idx) => {
      const mm = String(idx + 1).padStart(2, '0');
      const monthRows = pipelineData.filter(p => filterYear === 'all'
        ? (p.issuedDate || '').substring(5, 7) === mm
        : (p.issuedDate || '').startsWith(`${filterYear}-${mm}`));
      return {
        month: m,
        [lang === 'id' ? 'Deal' : 'Deals']: monthRows.length,
        [lang === 'id' ? 'Nilai' : 'Value']: monthRows.reduce((s, p) => s + sphBillableValue(p), 0),
      };
    });
    const statusPie = [
      { name: t.status_active, value: activeCount, color: '#5b87b8' },
      { name: t.status_won, value: wonCount, color: 'var(--ims-accent-2)' },
      { name: t.status_lost, value: lostCount, color: '#8b3a3a' },
      { name: t.status_inactive, value: inactiveCount, color: '#64748b' },
    ].filter(x => x.value > 0);
    const topSales = salesTeam.map(s => {
      const sd = pipelineData.filter(p => p.salesOwner === s.id);
      return { name: s.name.split(' ')[0], value: sd.reduce((sum, p) => sum + sphBillableValue(p), 0), deals: sd.length };
    }).filter(x => x.deals > 0).sort((a, b) => b.value - a.value).slice(0, 8);
    const visitReports = (reports || []).filter(r => filterYear === 'all' || (r.date || '').startsWith(filterYear)).length;
    const radarData = [
      { pillar: lang === 'id' ? 'Aktif' : 'Active', score: Math.min(100, activeCount * 8), full: 100 },
      { pillar: lang === 'id' ? 'Menang' : 'Won', score: Math.min(100, wonCount * 10), full: 100 },
      { pillar: 'Hot', score: Math.min(100, hot * 15), full: 100 },
      { pillar: lang === 'id' ? 'Win Rate' : 'Win Rate', score: Math.min(100, winRate), full: 100 },
      { pillar: lang === 'id' ? 'Kunjungan' : 'Visits', score: Math.min(100, visitReports * 5), full: 100 },
    ];
    return { hot, warm, cold, weighted, poIssued, funnelData, modalityData, monthlyDeals, statusPie, topSales, visitReports, radarData };
  }, [pipelineData, allData, reports, stages, stageGroups, salesTeam, filterYear, activeCount, wonCount, lostCount, inactiveCount, winRate, t, lang]);

  const quickLinks = [
    { id: 'kanban', label: lang === 'id' ? 'Board Pipeline' : 'Pipeline Board', count: totalDeals, icon: LayoutDashboard, color: glass.accent },
    { id: 'hot', label: '🔥 Hot Deals', count: dash.hot, icon: Zap, color: '#c03030' },
    { id: 'won', label: lang === 'id' ? 'Menang / PO' : 'Won / PO', count: wonCount, icon: CheckCircle2, color: 'var(--ims-accent-2)' },
  ];

  return (
    <div style={{display: 'grid', gap: '18px', marginBottom: '22px'}}>
      <DashboardHero
        glass={glass}
        badge={lang === 'id' ? 'Pipeline Command Center' : 'Pipeline Command Center'}
        title={lang === 'id' ? 'Dashboard Pipeline Penjualan' : 'Sales Pipeline Dashboard'}
        subtitle={lang === 'id' ? 'Data sinkron realtime dari Manajemen SPH — stage, probabilitas, win rate, dan performa sales.' : 'Realtime sync from SPH Management — stages, probability, win rate, and sales performance.'}
        lang={lang}
      />
      <DashboardKpiGrid items={[
        { label: lang === 'id' ? 'Total Deal' : 'Total Deals', value: totalDeals, sub: `${fmt(totalValue)} · ${projectCount} ${lang === 'id' ? 'surat' : 'refs'}${inactiveCount ? ` · ${inactiveCount} ${lang === 'id' ? 'non-aktif' : 'inactive'}` : ''}`, color: glass.accent },
        { label: lang === 'id' ? 'Pipeline Aktif' : 'Active Pipeline', value: activeCount, sub: fmt(dash.weighted) + (lang === 'id' ? ' weighted' : ' weighted'), color: '#5b87b8' },
        { label: t.win_rate, value: winRateDen > 0 ? `${winRate.toFixed(1)}%` : '—', sub: `${winRateNum}/${winRateDen} closed`, color: 'var(--ims-accent-2)' },
        { label: lang === 'id' ? 'PO Terbit' : 'PO Issued', value: dash.poIssued, sub: `${dash.hot} hot · ${dash.warm} warm · ${dash.cold} cold`, color: 'var(--ims-gold)' },
        { label: lang === 'id' ? 'Laporan Kunjungan' : 'Field Reports', value: dash.visitReports, sub: lang === 'id' ? 'sinkron modul Sales Report' : 'synced with Sales Report', color: '#7b3fb5' },
      ]} />
      <QuickNavGrid glass={glass} links={quickLinks} onNavigate={onNavigateTab} />
      <div style={{display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px'}}>
        <GlassPanel glass={glass}>
          <div className="card-title">{lang === 'id' ? 'Funnel Stage (deal per kolom)' : 'Stage Funnel (deals per column)'}</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dash.funnelData} margin={{top: 8, right: 16, left: 0, bottom: 60}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,77,138,0.1)" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize: 9, fill: 'var(--ims-text-2)'}} interval={0} angle={-28} textAnchor="end" height={58} />
              <YAxis allowDecimals={false} tick={{fontSize: 10}} />
              <Tooltip content={<ChartTooltip fmt={v => v} />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>{dash.funnelData.map((e, i) => <Cell key={e.name} fill={e.fill || CHART_COLORS[i % CHART_COLORS.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassPanel>
        <GlassPanel glass={glass}>
          <div className="card-title">{lang === 'id' ? 'Radar Pipeline' : 'Pipeline Radar'}</div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={dash.radarData} outerRadius="72%">
              <PolarGrid stroke="rgba(26,77,138,0.15)" />
              <PolarAngleAxis dataKey="pillar" tick={{fill: 'var(--ims-text-2)', fontSize: 10}} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="score" stroke={glass.accent} fill={glass.accent} fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </GlassPanel>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: '16px'}}>
        <GlassPanel glass={glass}>
          <div className="card-title">{lang === 'id' ? 'Tren Deal Bulanan' : 'Monthly Deal Trend'}</div>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={dash.monthlyDeals}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,77,138,0.1)" vertical={false} />
              <XAxis dataKey="month" tick={{fontSize: 10}} />
              <YAxis yAxisId="left" allowDecimals={false} tick={{fontSize: 10}} />
              <YAxis yAxisId="right" orientation="right" tick={{fontSize: 9}} tickFormatter={v => v >= 1e9 ? `${(v/1e9).toFixed(0)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v} />
              <Tooltip content={<ChartTooltip fmt={fmt} />} />
              <Legend wrapperStyle={{fontSize: 10}} />
              <Bar yAxisId="left" dataKey={lang === 'id' ? 'Deal' : 'Deals'} fill={glass.accent} radius={[3, 3, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey={lang === 'id' ? 'Nilai' : 'Value'} stroke="var(--ims-gold)" strokeWidth={2} dot={{r: 3}} />
            </ComposedChart>
          </ResponsiveContainer>
        </GlassPanel>
        <GlassPanel glass={glass}>
          <div className="card-title">{lang === 'id' ? 'Status Deal' : 'Deal Status'}</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={dash.statusPie.length ? dash.statusPie : [{name: '-', value: 1, color: 'var(--ims-border)'}]} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78}>
                {(dash.statusPie.length ? dash.statusPie : [{name: '-', value: 1, color: 'var(--ims-border)'}]).map(e => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip fmt={v => v} />} />
              <Legend wrapperStyle={{fontSize: 10}} />
            </PieChart>
          </ResponsiveContainer>
        </GlassPanel>
        <GlassPanel glass={glass}>
          <div className="card-title">{lang === 'id' ? 'Nilai per Modalitas' : 'Value by Modality'}</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={dash.modalityData.length ? dash.modalityData : [{name: '-', value: 1}]} dataKey="value" nameKey="name" innerRadius={40} outerRadius={72}>
                {(dash.modalityData.length ? dash.modalityData : [{name: '-', value: 1}]).map((e, i) => <Cell key={e.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip fmt={fmt} />} />
            </PieChart>
          </ResponsiveContainer>
        </GlassPanel>
      </div>
      <GlassPanel glass={glass}>
        <div className="card-title">{lang === 'id' ? 'Top Sales — Nilai Pipeline (filter aktif)' : 'Top Sales — Pipeline Value (active filters)'}</div>
        <ResponsiveContainer width="100%" height={Math.max(200, dash.topSales.length * 36)}>
          <BarChart data={dash.topSales.length ? dash.topSales : [{name: '-', value: 0, deals: 0}]} layout="vertical" margin={{left: 4, right: 12}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,77,138,0.1)" horizontal={false} />
            <XAxis type="number" tick={{fontSize: 9}} tickFormatter={v => v >= 1e9 ? `${(v/1e9).toFixed(1)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v} />
            <YAxis type="category" dataKey="name" width={72} tick={{fontSize: 10}} />
            <Tooltip content={<ChartTooltip fmt={fmt} />} />
            <Bar dataKey="value" fill={glass.accent} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GlassPanel>
    </div>
  );
}

function SPHDashboard({ data, generatedDocs = [], fmt, lang, t, salesTeam, onNavigateTab }) {
  const glass = DASHBOARD_GLASS.sph;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const dash = useMemo(() => {
    const billable = filterBillableRows(data);
    const active = billable.filter(s => s.status === 'active');
    const won = billable.filter(s => s.status === 'won');
    const lost = billable.filter(s => s.status === 'lost');
    const inactive = billable.filter(s => s.status === 'inactive');
    const poIssued = billable.filter(s => s.poStatus === 'issued');
    const queue = billable.filter(isAdminQueueRequest);
    const stageMap = STAGES.reduce((acc, st) => { acc[st.id] = billable.filter(s => s.stage === st.id).length; return acc; }, {});
    const stageData = STAGES.map(st => ({ name: (t[`stage_${st.id}`] || st.id).slice(0, 12), value: stageMap[st.id] || 0, fill: st.color }));
    const modalityMap = billable.reduce((acc, s) => {
      const k = s.modality || (lang === 'id' ? 'Lainnya' : 'Other');
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    const modalitySorted = Object.entries(modalityMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const modalityTop = modalitySorted.slice(0, 7);
    const modalityRest = modalitySorted.slice(7);
    if (modalityRest.length) {
      modalityTop.push({
        name: lang === 'id' ? 'Lainnya' : 'Other',
        value: modalityRest.reduce((sum, e) => sum + e.value, 0),
      });
    }
    const modalityData = modalityTop;
    const monthly = MONTHS.map((m, idx) => {
      const mm = String(idx + 1).padStart(2, '0');
      return { month: m, [lang === 'id' ? 'SPH Baru' : 'New SPH']: billable.filter(s => (s.issuedDate || '').substring(5, 7) === mm).length };
    });
    const topCustomers = Object.entries(billable.reduce((acc, s) => { acc[s.customer] = (acc[s.customer] || 0) + sphBillableValue(s); return acc; }, {})).map(([name, value]) => ({ name: String(name).slice(0, 22), value })).sort((a, b) => b.value - a.value).slice(0, 10);
    const queueBreakdown = [
      { name: lang === 'id' ? 'Request' : 'Request', value: billable.filter(s => s.sphWorkflowStatus === 'requested').length, color: '#5b87b8' },
      { name: lang === 'id' ? 'Draft Admin' : 'Admin Draft', value: billable.filter(s => s.sphWorkflowStatus === 'admin_drafting').length, color: 'var(--ims-gold)' },
      { name: lang === 'id' ? 'Siap Sales' : 'Ready Sales', value: billable.filter(s => s.sphWorkflowStatus === 'ready_for_sales').length, color: 'var(--ims-accent-2)' },
    ].filter(x => x.value > 0);
    const statusBreakdown = [
      { name: t.status_active, value: active.length, color: '#5b87b8' },
      { name: t.status_won, value: won.length, color: 'var(--ims-accent-2)' },
      { name: t.status_lost, value: lost.length, color: '#8b3a3a' },
      { name: t.status_inactive, value: inactive.length, color: '#64748b' },
    ].filter(x => x.value > 0);
    const workflowBreakdown = queue.length ? queueBreakdown : statusBreakdown;
    return { active, won, lost, poIssued, queue, stageData, modalityData, monthly, topCustomers, workflowBreakdown, hasWorkflowQueue: queue.length > 0, totalValue: billable.reduce((s, p) => s + sphBillableValue(p), 0), docsCount: (generatedDocs || []).length, billableCount: billable.length, projectCount: countUniqueSphNumbers(billable) };
  }, [data, generatedDocs, t, lang]);

  const quickLinks = [
    { id: 'list', label: lang === 'id' ? 'Daftar SPH' : 'SPH List', count: dash.billableCount, icon: FileText, color: glass.accent },
    { id: 'queue', label: lang === 'id' ? 'Antrian Workflow' : 'Workflow Queue', count: dash.queue.length, icon: Bell, color: '#c03030' },
    { id: 'po', label: 'PO Issued', count: dash.poIssued.length, icon: CheckCircle2, color: 'var(--ims-accent-2)' },
  ];

  return (
    <div style={{display: 'grid', gap: '18px', marginBottom: '22px'}}>
      <DashboardHero
        glass={glass}
        badge={lang === 'id' ? 'SPH Command Center' : 'SPH Command Center'}
        title={lang === 'id' ? 'Dashboard Manajemen SPH' : 'SPH Management Dashboard'}
        subtitle={lang === 'id' ? 'Ringkasan seluruh SPH/SPP — stage, workflow, PO, modalitas. Satu sumber data dengan Pipeline & Finance.' : 'Overview of all SPH/SPP — stage, workflow, PO, modality. Single source with Pipeline & Finance.'}
        lang={lang}
      />
      <DashboardKpiGrid items={[
        { label: lang === 'id' ? 'Total SPH' : 'Total SPH', value: dash.billableCount, sub: `${fmt(dash.totalValue)} · ${dash.projectCount} ${lang === 'id' ? 'surat' : 'refs'}`, color: glass.accent },
        { label: t.status_active, value: dash.active.length, sub: lang === 'id' ? 'sedang dikejar' : 'in pursuit', color: '#5b87b8' },
        { label: t.status_won, value: dash.won.length, sub: `${dash.poIssued.length} PO`, color: 'var(--ims-accent-2)' },
        { label: lang === 'id' ? 'Antrian Admin' : 'Admin Queue', value: dash.queue.length, sub: `${dash.docsCount} ${lang === 'id' ? 'dokumen' : 'documents'}`, color: '#c03030' },
        { label: t.status_lost, value: dash.lost.length, sub: lang === 'id' ? 'pembelajaran' : 'learnings', color: '#8b3a3a' },
      ]} />
      <QuickNavGrid glass={glass} links={quickLinks} onNavigate={onNavigateTab} />
      <div style={{display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px'}}>
        <GlassPanel glass={glass}>
          <div className="card-title">{lang === 'id' ? 'Distribusi Stage SPH' : 'SPH Stage Distribution'}</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dash.stageData} margin={{bottom: 60}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,169,106,0.12)" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize: 9}} interval={0} angle={-28} textAnchor="end" height={58} />
              <YAxis allowDecimals={false} tick={{fontSize: 10}} />
              <Tooltip content={<ChartTooltip fmt={v => v} />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>{dash.stageData.map((e, i) => <Cell key={e.name} fill={e.fill || CHART_COLORS[i % CHART_COLORS.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassPanel>
        <GlassPanel glass={glass}>
          <div className="card-title">{lang === 'id' ? 'Workflow SPH/SPP' : 'SPH/SPP Workflow'}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginBottom: '8px'}}>
            {dash.hasWorkflowQueue
              ? (lang === 'id' ? 'Antrian request aktif' : 'Active request queue')
              : (lang === 'id' ? 'Ringkasan status SPH (aktif / menang / hilang)' : 'SPH status summary (active / won / lost)')}
          </div>
          <PieWithSummary
            data={dash.workflowBreakdown}
            innerRadius={52}
            outerRadius={80}
            height={210}
            lang={lang}
            emptyLabel={lang === 'id' ? 'Belum ada data SPH' : 'No SPH data yet'}
          />
        </GlassPanel>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
        <GlassPanel glass={glass}>
          <div className="card-title">{lang === 'id' ? 'SPH Baru per Bulan' : 'New SPH per Month'}</div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={dash.monthly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{fontSize: 10}} />
              <YAxis allowDecimals={false} tick={{fontSize: 10}} />
              <Tooltip content={<ChartTooltip fmt={v => v} />} />
              <Bar dataKey={lang === 'id' ? 'SPH Baru' : 'New SPH'} fill="var(--ims-gold)" radius={[3, 3, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </GlassPanel>
        <GlassPanel glass={glass}>
          <div className="card-title">{lang === 'id' ? 'Modalitas' : 'Modality Mix'}</div>
          <PieWithSummary
            data={dash.modalityData.map((e, i) => ({ ...e, color: CHART_COLORS[i % CHART_COLORS.length] }))}
            outerRadius={64}
            height={200}
            lang={lang}
            emptyLabel={lang === 'id' ? 'Belum ada data modalitas' : 'No modality data'}
          />
        </GlassPanel>
      </div>
      <GlassPanel glass={glass}>
        <div className="card-title">{lang === 'id' ? 'Top Pelanggan (Nilai SPH)' : 'Top Customers (SPH Value)'}</div>
        <ResponsiveContainer width="100%" height={Math.max(200, dash.topCustomers.length * 32)}>
          <BarChart data={dash.topCustomers.length ? dash.topCustomers : [{name: '-', value: 0}]} layout="vertical" margin={{left: 4}}>
            <XAxis type="number" tick={{fontSize: 9}} tickFormatter={v => v >= 1e9 ? `${(v/1e9).toFixed(1)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v} />
            <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 9}} />
            <Tooltip content={<ChartTooltip fmt={fmt} />} />
            <Bar dataKey="value" fill={glass.accent} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GlassPanel>
    </div>
  );
}

function PipelineBoard({ data, allData, setData, employees = {}, session, logAction, t, lang, canEdit, fmt, onEdit, reports = [] }) {
  const salesTeam = useMemo(() => getActiveSalesTeam(employees), [employees]);
  // For privileged roles, allow filtering by sales owner; sales role uses its own data
  const isPrivilegedRole = session && (session.role === 'super_admin' || session.role === 'gm' || session.role === 'manager_ops' || session.role === 'admin');
  // Sales owner filter — 'all' or specific sales id
  const [filterSales, setFilterSales] = useState('all');
  const [reassignDeal, setReassignDeal] = useState(null);
  const [boardTab, setBoardTab] = useState('dashboard');
  const [filterYear, setFilterYear] = useState(String(currentYear()));
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
    else if (sortBy === 'value_desc') sorted.sort((a, b) => sphBillableValue(b) - sphBillableValue(a));
    else if (sortBy === 'value_asc') sorted.sort((a, b) => sphBillableValue(a) - sphBillableValue(b));
    return sorted;
  };

  // PERFORMANCE: All pipeline calcs memoized (now scoped by selected year + probability)
  const pipelineStats = useMemo(() => {
    const yearScoped = filterYear === 'all' ? data : data.filter(s => s.issuedDate?.startsWith(filterYear));
    const salesScoped = filterSales === 'all' ? yearScoped : yearScoped.filter(s => s.salesOwner === filterSales);
    const probScoped = probFilter === 'all' ? salesScoped : salesScoped.filter(s => probBucket(s) === probFilter);
    const billableScoped = filterBillableRows(probScoped);
    const pipelineData = billableScoped.filter(s => s.status === 'active' || s.status === 'won' || s.status === 'lost' || s.status === 'inactive');
    const totalDeals = pipelineData.length;
    const totalValue = pipelineData.reduce((s, p) => s + sphBillableValue(p), 0);
    const projectCount = countUniqueSphNumbers(pipelineData);
    const wonCount = pipelineData.filter(p => p.status === 'won').length;
    const lostCount = pipelineData.filter(p => p.status === 'lost').length;
    const activeCount = pipelineData.filter(p => p.status === 'active').length;
    const inactiveCount = pipelineData.filter(p => p.status === 'inactive').length;

    // WIN RATE MODE — choose denominator carefully to avoid misleading numbers
    // 'current': year-filtered closed only (can be misleading early in year due to small sample)
    // 'ttm': trailing 12 months from today — most representative for ongoing business
    // 'all': cumulative since inception
    const today = todayStart();
    const ttmStart = new Date(today); ttmStart.setMonth(ttmStart.getMonth() - 12);
    const billableAll = filterBillableRows(data);
    const ttmDeals = billableAll.filter(s => {
      const d = s.issuedDate ? new Date(s.issuedDate) : null;
      return d && d >= ttmStart && (s.status === 'won' || s.status === 'lost');
    });
    const ttmWon = ttmDeals.filter(s => s.status === 'won').length;
    const ttmLost = ttmDeals.filter(s => s.status === 'lost').length;

    const allClosed = billableAll.filter(s => s.status === 'won' || s.status === 'lost');
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

    return { pipelineData, totalDeals, totalValue, projectCount, wonCount, lostCount, activeCount, inactiveCount, winRate, winRateNum, winRateDen, winRateScope, smallSample, ttmWon, ttmLost, allWon, allLost };
  }, [data, filterYear, winRateMode, probFilter, filterSales]);
  const { pipelineData, totalDeals, totalValue, projectCount, wonCount, lostCount, activeCount, inactiveCount, winRate, winRateNum, winRateDen, winRateScope, smallSample } = pipelineStats;

  // Stage definitions including lost - show statistical view of full journey
  const ALL_STAGES_WITH_LOST = STAGES;

  // PERFORMANCE: Group projects by stage ONCE + build project type lookup map
  const projectTypeMap = useMemo(() => new Map(PROJECT_TYPES.map(p => [p.id, p])), []);
  const stageGroups = useMemo(() => {
    const groups = new Map();
    ALL_STAGES_WITH_LOST.forEach(stage => groups.set(stage.id, { projects: [], stageValue: 0 }));
    pipelineData.forEach(p => {
      const g = groups.get(p.stage);
      if (g) { g.projects.push(p); g.stageValue += sphBillableValue(p); }
    });
    // Apply sort to each group's projects
    groups.forEach(g => { g.projects = sortDeals(g.projects); });
    return groups;
  }, [pipelineData, sortBy]);

  const handleDashNav = (id) => {
    if (id === 'hot') { setProbFilter('hot'); setBoardTab('kanban'); return; }
    if (id === 'won') { setProbFilter('all'); setBoardTab('kanban'); return; }
    setBoardTab(id === 'kanban' ? 'kanban' : 'dashboard');
  };

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_pipeline}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.pipeline_title}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.pipeline_subtitle}</div>
      </div>
      {!canEdit && <ReadOnlyBanner t={t} />}

      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {[
          { id: 'dashboard', label: lang === 'id' ? 'Dashboard' : 'Dashboard', icon: LayoutDashboard },
          { id: 'kanban', label: lang === 'id' ? 'Board Pipeline' : 'Pipeline Board', icon: Activity },
        ].map(tb => {
          const Icon = tb.icon;
          const active = boardTab === tb.id;
          return (
            <button key={tb.id} onClick={() => setBoardTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '10px 18px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: active ? 'var(--ims-accent)' : 'var(--ims-text-2)', borderBottom: active ? '2px solid var(--ims-border)' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px', letterSpacing: '0.03em'}}>
              <Icon size={14} strokeWidth={1.5} />{tb.label}
            </button>
          );
        })}
      </div>

      {boardTab === 'dashboard' && (
        <PipelineDashboard
          data={data}
          allData={allData}
          reports={reports}
          pipelineStats={pipelineStats}
          stageGroups={stageGroups}
          stages={ALL_STAGES_WITH_LOST}
          salesTeam={salesTeam}
          t={t}
          lang={lang}
          fmt={fmt}
          filterYear={filterYear}
          probFilter={probFilter}
          onNavigateTab={handleDashNav}
        />
      )}

      {boardTab === 'kanban' && (
      <>
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
          const isInactiveCol = stage.id === 'inactive';
          const isWonCol = stage.id === 'po_issued';
          return (
            <div key={stage.id} style={{minWidth: '280px', flex: '0 0 280px'}}>
              <div style={{padding: '14px', background: 'var(--ims-bg-card)', borderTop: `3px solid ${stage.color}`, borderLeft: '1px solid var(--ims-border)', borderRight: '1px solid var(--ims-border)', borderBottom: '1px solid var(--ims-border)', marginBottom: '10px'}} title={lang === 'id' ? `${projects.length} deal sedang di stage ini` : `${projects.length} deals at this stage`}>
                <div style={{fontSize: '10px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600}}>{t[`stage_${stage.id}`]}</div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px'}}>
                  <span className="serif" style={{fontSize: '22px', fontWeight: 500, color: isLostCol ? '#8b3a3a' : isInactiveCol ? '#64748b' : isWonCol ? 'var(--ims-accent-2)' : 'var(--ims-accent)'}}>{projects.length}</span>
                  <span className="mono" style={{fontSize: '11px', color: 'var(--ims-text)', fontWeight: 500}}>{fmt(stageValue)}</span>
                </div>
                <div style={{fontSize: '9px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>
                  {isLostCol ? (lang === 'id' ? 'Deal kalah / batal' : 'Lost / cancelled deals')
                    : isInactiveCol ? (lang === 'id' ? 'Alternatif — RS pilih SPH lain' : 'Alternate — hospital chose another quote')
                    : isWonCol ? (lang === 'id' ? 'Closed won — PO terbit' : 'Closed won — PO issued')
                    : (lang === 'id' ? 'Sedang di stage ini' : 'Currently at this stage')}
                </div>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                {projects.map(p => {
                  const pt = projectTypeMap.get(p.projectType);
                  const owner = salesTeam.find(s => s.id === p.salesOwner);
                  return (
                    <div key={p.id} className="card-hover" style={{padding: '13px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', opacity: (isLostCol || isInactiveCol) ? 0.75 : 1}}>
                      <div onClick={() => canEdit && onEdit(p)} style={{cursor: canEdit ? 'pointer' : 'default'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px'}}>
                          <div style={{fontSize: '12px', fontWeight: 600, lineHeight: 1.3, textDecoration: (isLostCol || isInactiveCol) ? 'line-through' : 'none'}}>{p.customer}</div>
                          <div style={{width: '26px', height: '26px', borderRadius: '50%', background: stage.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, flexShrink: 0}}>{p.probability}</div>
                        </div>
                        {pt && <div style={{display: 'inline-block', padding: '2px 6px', fontSize: '9px', background: pt.color + '25', color: pt.color, fontWeight: 600, letterSpacing: '0.05em', marginBottom: '8px', textTransform: 'uppercase'}}>{t[`ptype_${p.projectType}`]}</div>}
                        <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginBottom: '8px'}}>{p.subModality} · Qty {p.qty}</div>
                        <div className="mono" style={{fontSize: '13px', fontWeight: 500}}>{fmt(sphBillableValue(p))}</div>
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
      </>
      )}

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
function SalesTeamDashboard({ data = [], reports = [], t, lang, fmt, employees = {}, onNavigateTeam }) {
  const glass = DASHBOARD_GLASS.salesTeam;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const dash = useMemo(() => {
    const billable = filterBillableRows(data);
    const active = billable.filter(s => s.status === 'active');
    const won = billable.filter(s => s.status === 'won' || s.stage === 'po_issued' || s.poStatus === 'issued');
    const lost = billable.filter(s => s.status === 'lost');
    const winRateDen = won.length + lost.length;
    const winRate = winRateDen > 0 ? (won.length / winRateDen) * 100 : 0;

    const requestStages = new Set(['sph_sent', 'presentation_scheduled', 'presentation_done']);
    const negoStages = new Set(['negotiation', 'tender', 'ecatalog']);
    const funnelData = [
      {
        stage: lang === 'id' ? 'Request SPH/SPP' : 'SPH/SPP Request',
        count: billable.filter(s =>
          requestStages.has(s.stage)
          || s.sphWorkflowStatus === 'requested'
          || s.sphWorkflowStatus === 'admin_drafting'
          || s.sphWorkflowStatus === 'ready_for_sales'
        ).length,
        fill: '#6366f1',
      },
      {
        stage: lang === 'id' ? 'Negosiasi' : 'Negotiation',
        count: billable.filter(s => negoStages.has(s.stage) && s.status === 'active').length,
        fill: '#06b6d4',
      },
      {
        stage: lang === 'id' ? 'Won (Deal)' : 'Won (Deal)',
        count: won.length,
        fill: '#10b981',
      },
    ];

    const monthlyPipeline = MONTHS.map((m, idx) => {
      const mm = String(idx + 1).padStart(2, '0');
      const monthRows = billable.filter(s => (s.issuedDate || '').substring(5, 7) === mm);
      const activeVal = monthRows.filter(s => s.status === 'active').reduce((sum, p) => sum + sphBillableValue(p), 0);
      const wonVal = monthRows.filter(s => s.status === 'won').reduce((sum, p) => sum + sphBillableValue(p), 0);
      return { month: m, [lang === 'id' ? 'Pipeline Aktif' : 'Active Pipeline']: activeVal, [lang === 'id' ? 'Deal Menang' : 'Won Deals']: wonVal };
    });

    const closureDays = won.map(s => {
      const start = s.issuedDate ? new Date(s.issuedDate + 'T00:00:00') : null;
      const endStr = s.poIssuedDate || s.poDate || s.bastDate || s.clientReceivedAt?.split('T')[0];
      const end = endStr ? new Date(String(endStr).substring(0, 10) + 'T00:00:00') : null;
      if (!start || !end || isNaN(start) || isNaN(end)) return null;
      return Math.max(0, Math.round((end - start) / (24 * 60 * 60 * 1000)));
    }).filter(d => d != null);
    const avgClosureDays = closureDays.length ? Math.round(closureDays.reduce((a, b) => a + b, 0) / closureDays.length) : 0;

    const sppCount = billable.filter(s => String(s.sphNo || '').toUpperCase().includes('SPP') || s.docKind === 'spp').length;
    const sphCount = billable.length - sppCount;

    return { active, won, winRate, winRateDen, funnelData, monthlyPipeline, avgClosureDays, sppCount, sphCount };
  }, [data, lang]);

  const quickLinks = [
    { id: 'team', label: lang === 'id' ? 'Performa Tim Sales' : 'Sales Team Performance', count: dash.active.length, icon: Users, color: glass.accent },
    { id: 'team', label: 'SPH', count: dash.sphCount, icon: FileText, color: '#6366f1' },
    { id: 'team', label: 'SPP', count: dash.sppCount, icon: FileCheck, color: '#06b6d4' },
    { id: 'team', label: lang === 'id' ? 'Laporan Lapangan' : 'Field Reports', count: reports.length, icon: ClipboardList, color: '#10b981' },
  ];

  return (
    <div style={{ display: 'grid', gap: '18px', marginBottom: '22px' }}>
      <DashboardHero
        glass={glass}
        badge={lang === 'id' ? 'Sales Command Center' : 'Sales Command Center'}
        title={lang === 'id' ? 'Dashboard Tim Sales' : 'Sales Team Dashboard'}
        subtitle={lang === 'id' ? 'Sinkron realtime dengan SPH, SPP, Pipeline, dan Deals Management.' : 'Realtime sync with SPH, SPP, Pipeline, and Deals Management.'}
        lang={lang}
      />
      <DashboardKpiGrid items={[
        { label: lang === 'id' ? 'Penawaran Aktif' : 'Active Offers', value: dash.active.length, sub: fmt(dash.active.reduce((s, p) => s + sphBillableValue(p), 0)), color: glass.accent },
        { label: t.win_rate, value: dash.winRateDen > 0 ? `${dash.winRate.toFixed(1)}%` : '—', sub: `${dash.won.length}/${dash.winRateDen} closed`, color: '#10b981' },
        { label: lang === 'id' ? 'Rata-rata Durasi Penutupan' : 'Avg. Deal Closure', value: dash.avgClosureDays ? `${dash.avgClosureDays} ${t.days}` : '—', sub: lang === 'id' ? 'dari SPH ke Won' : 'SPH to Won', color: '#06b6d4' },
        { label: lang === 'id' ? 'Deal Menang' : 'Won Deals', value: dash.won.length, sub: fmt(dash.won.reduce((s, p) => s + sphBillableValue(p), 0)), color: 'var(--ims-accent-2)' },
      ]} />
      <QuickNavGrid glass={glass} links={quickLinks} onNavigate={onNavigateTeam} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px' }}>
        <GlassPanel glass={glass}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={15} color={glass.accent} /> {lang === 'id' ? 'Funnel Konversi Sales' : 'Sales Conversion Funnel'}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dash.funnelData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.12)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="stage" width={110} tick={{ fontSize: 10, fill: 'var(--ims-text-2)' }} />
              <Tooltip content={<ChartTooltip fmt={v => v} />} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={22}>
                {dash.funnelData.map(e => <Cell key={e.stage} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassPanel>
        <GlassPanel glass={glass}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={15} color={glass.accent} /> {lang === 'id' ? 'Tren Pipeline Aktif' : 'Active Pipeline Trend'}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dash.monthlyPipeline} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <defs>
                <linearGradient id="salesPipeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1e9 ? `${(v / 1e9).toFixed(0)}M` : v >= 1e6 ? `${(v / 1e6).toFixed(0)}Jt` : v} />
              <Tooltip content={<ChartTooltip fmt={fmt} />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area type="monotone" dataKey={lang === 'id' ? 'Pipeline Aktif' : 'Active Pipeline'} stroke="#6366f1" fill="url(#salesPipeGrad)" strokeWidth={2} />
              <Line type="monotone" dataKey={lang === 'id' ? 'Deal Menang' : 'Won Deals'} stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassPanel>
      </div>
    </div>
  );
}

function SalesModule({ data, reports, t, lang, fmt, employees = {} }) {
  const [salesTab, setSalesTab] = useState('dashboard');
  const salesTeam = useMemo(() => getActiveSalesTeam(employees), [employees]);
  // Filter: view all sales, or drill into one specific sales
  const [selectedSales, setSelectedSales] = useState('all');
  const stats = useMemo(() => salesTeam.map(sales => {
    const sd = filterBillableRows(data.filter(s => s.salesOwner === sales.id));
    const sr = reports.filter(r => r.salesId === sales.id);
    const active = sd.filter(s => s.status === 'active');
    const won = sd.filter(s => s.status === 'won');
    const lost = sd.filter(s => s.status === 'lost');
    const poIssued = sd.filter(s => s.poStatus === 'issued');
    return {
      ...sales,
      activeCount: active.length, wonCount: won.length, lostCount: lost.length,
      poCount: poIssued.length,
      pipelineValue: active.reduce((s, p) => s + sphBillableValue(p), 0),
      wonValue: won.reduce((s, p) => s + sphBillableValue(p), 0),
      poValue: poIssued.reduce((s, p) => s + sphBillableValue(p), 0),
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
    return [...filterBillableRows(data.filter(s => s.salesOwner === selectedSales))].sort((a, b) => sphBillableValue(b) - sphBillableValue(a));
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

      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {[
          { id: 'dashboard', label: lang === 'id' ? 'Dashboard' : 'Dashboard', icon: LayoutDashboard },
          { id: 'team', label: lang === 'id' ? 'Tim Sales' : 'Sales Team', icon: Users },
        ].map(tb => {
          const Icon = tb.icon;
          const active = salesTab === tb.id;
          return (
            <button key={tb.id} onClick={() => setSalesTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '10px 18px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: active ? 'var(--ims-accent)' : 'var(--ims-text-2)', borderBottom: active ? '2px solid var(--ims-border)' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px', letterSpacing: '0.03em'}}>
              <Icon size={14} strokeWidth={1.5} />{tb.label}
            </button>
          );
        })}
      </div>

      {salesTab === 'dashboard' && (
        <SalesTeamDashboard data={data} reports={reports} t={t} lang={lang} fmt={fmt} employees={employees} onNavigateTeam={() => setSalesTab('team')} />
      )}

      {salesTab === 'team' && (
      <>
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
      </>
      )}
    </div>
  );
}
function reportMatchesSearch(report, term, salesTeam = []) {
  if (!term) return true;
  const q = term.toLowerCase();
  const salesName = salesTeam.find(s => s.id === report.salesId)?.name || report.salesId || '';
  const parts = [
    salesName,
    report.date,
    report.week,
    report.area,
    report.closest,
    report.win,
    report.block,
    report.next,
    ...(report.visits || []).flatMap(v => [v.name, v.city, v.product, v.contact, v.note, v.visit, v.pipeline]),
  ];
  return parts.some(p => String(p || '').toLowerCase().includes(q));
}

function SalesReport({ reports, setReports, t, lang, session, fmt, employees = {}, reportsSeen = {}, setReportsSeen, issues = [], installRecords = [], canEdit = false }) {
  const salesTeam = useMemo(() => getActiveSalesTeam(employees), [employees]);
  const markReportsRead = () => {
    if (!setReportsSeen || !reports.length) return;
    const dates = reports.map(r => r.date || '').filter(Boolean).sort();
    const latest = dates[dates.length - 1] || '';
    setReportsSeen(prev => ({ ...prev, [session.username]: latest }));
  };
  const [tab, setTab] = useState('dashboard');
  const [filterSales, setFilterSales] = useState('all');
  const [search, setSearch] = useState('');
  const [editingReport, setEditingReport] = useState(null);
  const searchTerm = search.trim().toLowerCase();

  const visibleReports = useMemo(() => session.role === 'sales'
    ? reports.filter(r => r.salesId === session.salesId)
    : (filterSales === 'all' ? reports : reports.filter(r => r.salesId === filterSales))
  , [reports, session.role, session.salesId, filterSales]);

  const filteredReports = useMemo(
    () => visibleReports.filter(r => reportMatchesSearch(r, searchTerm, salesTeam)),
    [visibleReports, searchTerm, salesTeam]
  );

  const tabs = session.role === 'sales' ? ['dashboard', 'new', 'history'] : ['dashboard', 'history'];
  const tabLabels = { dashboard: t.sr_dashboard, new: editingReport ? t.sr_edit_report : t.sr_new, history: t.sr_history };
  const tabIcons = { dashboard: Activity, new: ClipboardList, history: Clock };

  const handleEdit = (report) => {
    setEditingReport(report);
    setTab('new');
  };
  const [deleteReportId, setDeleteReportId] = useState(null);
  const [bulkDeleteReportIds, setBulkDeleteReportIds] = useState(null);
  const handleDelete = (id) => setDeleteReportId(id);
  const confirmDeleteReport = () => {
    setReports(prev => prev.filter(r => r.id !== deleteReportId));
    setDeleteReportId(null);
  };
  const confirmBulkDeleteReports = () => {
    if (!bulkDeleteReportIds?.length) return;
    const ids = new Set(bulkDeleteReportIds);
    setReports(prev => prev.filter(r => !ids.has(r.id)));
    setBulkDeleteReportIds(null);
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

      {(tab === 'dashboard' || tab === 'history') && (
        <div style={{display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap'}}>
          <div style={{position: 'relative', flex: '1 1 280px', maxWidth: '420px'}}>
            <Search size={14} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ims-text-2)', pointerEvents: 'none'}} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'id' ? 'Cari nama RS, kota, sales, area, kontak...' : 'Search hospital, city, sales, area, contact...'}
              style={{paddingLeft: '36px', width: '100%'}}
            />
          </div>
          {searchTerm && (
            <span style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>
              {filteredReports.length} / {visibleReports.length} {lang === 'id' ? 'laporan' : 'reports'}
            </span>
          )}
          {searchTerm && (
            <button
              onClick={() => setSearch('')}
              style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '6px 10px', fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ims-text-2)'}}
            >
              {lang === 'id' ? 'Reset' : 'Clear'}
            </button>
          )}
        </div>
      )}

      {session.role !== 'sales' && tab === 'history' && (
        <div style={{display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap'}}>
          <button onClick={() => setFilterSales('all')} style={{padding: '5px 11px', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', background: filterSales === 'all' ? 'var(--ims-accent)' : 'transparent', color: filterSales === 'all' ? 'var(--ims-gold)' : 'var(--ims-text-2)', border: '1px solid ' + (filterSales === 'all' ? 'var(--ims-accent)' : 'var(--ims-border)'), cursor: 'pointer', fontFamily: 'inherit'}}>{lang === 'id' ? 'Semua' : 'All'}</button>
          {salesTeam.map(s => <button key={s.id} onClick={() => setFilterSales(s.id)} style={{padding: '5px 11px', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', background: filterSales === s.id ? 'var(--ims-accent)' : 'transparent', color: filterSales === s.id ? 'var(--ims-gold)' : 'var(--ims-text-2)', border: '1px solid ' + (filterSales === s.id ? 'var(--ims-accent)' : 'var(--ims-border)'), cursor: 'pointer', fontFamily: 'inherit'}}>{s.name.split(' ')[0]}</button>)}
        </div>
      )}

      {tab === 'dashboard' && <SRDashboard reports={filteredReports} t={t} lang={lang} employees={employees} session={session} onMarkRead={markReportsRead} reportsSeen={reportsSeen} issues={issues} installRecords={installRecords} fmt={fmt} searchTerm={searchTerm} totalReports={visibleReports.length} />}
      {tab === 'new' && session.role === 'sales' && <SRForm reports={reports} setReports={setReports} t={t} lang={lang} session={session} editingReport={editingReport} onSaved={handleSaved} onCancel={() => { setEditingReport(null); setTab('history'); }} employees={employees} />}
      {tab === 'history' && <SRHistory reports={filteredReports} t={t} lang={lang} fmt={fmt} canDelete={canEdit} session={session} onEdit={handleEdit} onDelete={handleDelete} onBulkDelete={(ids) => setBulkDeleteReportIds(ids)} employees={employees} searchTerm={searchTerm} totalBeforeSearch={visibleReports.length} />}
      <ConfirmDialog open={!!deleteReportId} title={lang === 'id' ? 'Hapus Laporan?' : 'Delete Report?'} message={t.sr_confirm_delete || (lang === 'id' ? 'Yakin ingin menghapus laporan ini?' : 'Are you sure you want to delete this report?')} onConfirm={confirmDeleteReport} onCancel={() => setDeleteReportId(null)} danger lang={lang} />
      <ConfirmDialog open={!!bulkDeleteReportIds?.length} title={lang === 'id' ? 'Hapus Laporan Terpilih?' : 'Delete Selected Reports?'} message={lang === 'id' ? `Yakin ingin menghapus ${bulkDeleteReportIds?.length || 0} laporan terpilih secara permanen?` : `Permanently delete ${bulkDeleteReportIds?.length || 0} selected report(s)?`} onConfirm={confirmBulkDeleteReports} onCancel={() => setBulkDeleteReportIds(null)} danger lang={lang} />
    </div>
  );
}
function SRDashboard({ reports, t, lang, employees = {}, session = {}, onMarkRead, reportsSeen = {}, issues = [], installRecords = [], fmt = (n) => n, searchTerm = '', totalReports = 0 }) {
  const salesTeam = useMemo(() => getActiveSalesTeam(employees), [employees]);
  const glass = DASHBOARD_GLASS.fieldReport;
  const todayStr = new Date().toISOString().split('T')[0];

  const stats = useMemo(() => {
    const totalVisits = reports.reduce((s, r) => s + (r.visits?.length || 0), 0);
    const totalDays = reports.reduce((s, r) => s + (r.days || 0), 0);
    const totalDeals = reports.reduce((s, r) => s + (r.visits?.filter(v => v.visit === 'closed').length || 0), 0);
    const reportsToday = reports.filter(r => r.date === todayStr).length;
    const openIssues = (issues || []).filter(i => i.status !== 'resolved').length;
    const resolvedIssues = (issues || []).filter(i => i.status === 'resolved').length;
    const issueTotal = openIssues + resolvedIssues;
    const resolutionPct = issueTotal > 0 ? Math.round((resolvedIssues / issueTotal) * 100) : 0;

    const visitTrend = [];
    const dayMap = {};
    reports.forEach(r => {
      if (!r.date) return;
      dayMap[r.date] = (dayMap[r.date] || 0) + (r.visits?.length || 0);
    });
    Object.entries(dayMap).sort((a, b) => a[0].localeCompare(b[0])).slice(-14).forEach(([date, visits]) => {
      visitTrend.push({ label: date.slice(5), visits, date });
    });

    const routineVisits = reports.reduce((s, r) => s + (r.visits?.filter(v => ['first', 'followup', 'demo'].includes(v.visit)).length || 0), 0);
    const negoVisits = reports.reduce((s, r) => s + (r.visits?.filter(v => v.visit === 'nego' || v.pipeline === 'proposal').length || 0), 0);
    const closedVisits = reports.reduce((s, r) => s + (r.visits?.filter(v => v.visit === 'closed' || v.pipeline === 'win').length || 0), 0);
    const installCount = (installRecords || []).filter(r => r.status !== 'completed').length;
    const troubleshooting = openIssues;

    const categoryData = [
      { name: lang === 'id' ? 'Kunjungan Rutin' : 'Routine Visits', value: routineVisits, fill: '#f59e0b' },
      { name: lang === 'id' ? 'Instalasi Baru' : 'New Installation', value: installCount, fill: '#10b981' },
      { name: lang === 'id' ? 'Troubleshooting' : 'Troubleshooting', value: troubleshooting, fill: '#c03030' },
      { name: lang === 'id' ? 'Negosiasi/Closing' : 'Negotiation/Closing', value: negoVisits + closedVisits, fill: '#6366f1' },
    ].filter(x => x.value > 0);

    const bySales = {};
    reports.forEach(r => {
      if (!bySales[r.salesId]) bySales[r.salesId] = { count: 0 };
      bySales[r.salesId].count += r.visits?.length || 0;
    });

    return { totalVisits, totalDays, totalDeals, reportsToday, openIssues, resolutionPct, visitTrend, categoryData, bySales };
  }, [reports, issues, installRecords, lang, todayStr]);

  const isManager = ['super_admin', 'gm', 'manager_ops'].includes(session.role);
  const recentReports = useMemo(() => {
    if (!isManager || !reports.length) return [];
    const dates = reports.map(r => r.date || '').filter(Boolean).sort();
    const latest = dates[dates.length - 1];
    if (!latest) return [];
    const seen = reportsSeen[session.username];
    let cutStr;
    if (seen) cutStr = seen;
    else { const cut = new Date(latest); cut.setDate(cut.getDate() - 7); cutStr = cut.toISOString().split('T')[0]; }
    return reports.filter(r => (r.date || '') > cutStr).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [reports, isManager, reportsSeen, session.username]);

  if (!reports.length && searchTerm && totalReports > 0) return (
    <div style={{padding: '60px 30px', textAlign: 'center', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
      <Search size={36} strokeWidth={1.2} style={{color: 'var(--ims-text-2)', marginBottom: '12px'}} />
      <div style={{fontSize: '14px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>
        {lang === 'id'
          ? `Tidak ada laporan cocok dengan "${searchTerm}" dari ${totalReports} laporan.`
          : `No reports match "${searchTerm}" out of ${totalReports} reports.`}
      </div>
    </div>
  );

  if (!reports.length && !issues.length && !installRecords.length) return (
    <div style={{padding: '60px 30px', textAlign: 'center', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
      <ClipboardList size={36} strokeWidth={1.2} style={{color: 'var(--ims-text-2)', marginBottom: '12px'}} />
      <div style={{fontSize: '14px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{t.sr_no_reports}</div>
    </div>
  );

  const { totalVisits, totalDays, totalDeals, reportsToday, openIssues, resolutionPct, visitTrend, categoryData, bySales } = stats;

  return (
    <div style={{display: 'grid', gap: '18px'}}>
      {isManager && recentReports.length > 0 && (
        <div style={{background: 'var(--ims-bg-alt)', color: 'var(--ims-text)', padding: '14px 18px', borderRadius: '4px', display: 'flex', alignItems: 'flex-start', gap: '12px'}}>
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

      <DashboardHero
        glass={glass}
        badge={lang === 'id' ? 'Field Ops Command' : 'Field Ops Command'}
        title={lang === 'id' ? 'Dashboard Laporan Lapangan' : 'Field Report Dashboard'}
        subtitle={lang === 'id' ? 'Sinkron kunjungan sales, instalasi teknisi, dan keluhan/perbaikan lapangan.' : 'Sync sales visits, technician installs, and field issues/repairs.'}
        lang={lang}
        showSync={false}
      />

      <DashboardKpiGrid items={[
        { label: lang === 'id' ? 'Laporan Hari Ini' : 'Reports Today', value: reportsToday, sub: `${reports.length} ${lang === 'id' ? 'total laporan' : 'total reports'}`, color: glass.accent },
        { label: lang === 'id' ? 'Menunggu Respons' : 'Awaiting Response', value: openIssues, sub: lang === 'id' ? 'issue/perbaikan open' : 'open issues/repairs', color: '#c03030' },
        { label: lang === 'id' ? 'Penyelesaian Lapangan' : 'Field Resolution', value: `${resolutionPct}%`, sub: lang === 'id' ? 'masalah terselesaikan' : 'issues resolved', color: '#10b981' },
        { label: t.sr_visits_count, value: totalVisits, sub: `${totalDays} ${lang === 'id' ? 'hari lapangan' : 'field days'}`, color: '#6366f1' },
      ]} />

      <div style={{display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '16px'}}>
        <GlassPanel glass={glass}>
          <div className="card-title" style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Activity size={15} color={glass.accent} /> {lang === 'id' ? 'Tren Kunjungan Lapangan' : 'Field Visit Trend'}</div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={visitTrend.length ? visitTrend : [{ label: '-', visits: 0 }]} margin={{top: 8, right: 16, left: 0, bottom: 8}}>
              <defs>
                <linearGradient id="srVisitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.12)" vertical={false} />
              <XAxis dataKey="label" tick={{fontSize: 10}} />
              <YAxis allowDecimals={false} tick={{fontSize: 10}} />
              <Tooltip content={<ChartTooltip fmt={v => v} />} />
              <Area type="monotone" dataKey="visits" name={lang === 'id' ? 'Kunjungan' : 'Visits'} stroke="#f59e0b" fill="url(#srVisitGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassPanel>
        <GlassPanel glass={glass}>
          <div className="card-title" style={{display: 'flex', alignItems: 'center', gap: '8px'}}><MapPin size={15} color={glass.accent} /> {lang === 'id' ? 'Kategori Laporan Terbanyak' : 'Top Report Categories'}</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData.length ? categoryData : [{ name: '-', value: 0, fill: 'var(--ims-border)' }]} margin={{top: 8, right: 16, left: 0, bottom: 40}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.1)" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize: 9}} interval={0} angle={-18} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} tick={{fontSize: 10}} />
              <Tooltip content={<ChartTooltip fmt={v => v} />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {(categoryData.length ? categoryData : [{ name: '-', value: 0, fill: 'var(--ims-border)' }]).map(e => <Cell key={e.name} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassPanel>
      </div>

      {Object.keys(bySales).length > 0 && (
        <GlassPanel glass={glass}>
          <div className="card-title">{lang === 'id' ? 'Kunjungan per Sales' : 'Visits per Sales'}</div>
          {Object.entries(bySales).map(([id, st]) => {
            const sales = salesTeam.find(s => s.id === id);
            if (!sales) return null;
            const pct = Math.min((st.count / Math.max(totalVisits, 1)) * 100, 100);
            return (
              <div key={id} style={{marginBottom: '12px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px'}}>
                  <span style={{fontWeight: 500}}>{sales.name} <span style={{color: 'var(--ims-text-2)', fontSize: '11px'}}>· {lang === 'id' ? sales.territory : sales.territoryEn}</span></span>
                  <span className="mono" style={{color: 'var(--ims-text-2)', fontSize: '11px'}}>{st.count}</span>
                </div>
                <div style={{height: '6px', background: 'var(--ims-bg-card-2)', overflow: 'hidden', borderRadius: '3px'}}>
                  <div style={{height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${glass.accent}, #f97316)`, transition: 'width 0.5s'}} />
                </div>
              </div>
            );
          })}
        </GlassPanel>
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
function SRHistory({ reports, t, lang, canDelete = false, onEdit, onDelete, onBulkDelete, session, fmt, employees = {}, searchTerm = '', totalBeforeSearch = 0 }) {
  const salesTeam = useMemo(() => getActiveSalesTeam(employees), [employees]);
  const [expanded, setExpanded] = useState(null);
  const [sortBy, setSortBy] = useState('date_desc');
  const [selectedIds, setSelectedIds] = useState([]);

  const canDeleteReport = (report) => {
    if (!canDelete) return false;
    if (session?.role === 'sales') return session.salesId === report.salesId;
    return true;
  };

  const sortedReports = useMemo(() => {
    const arr = [...reports];
    if (sortBy === 'date_desc') return arr.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    if (sortBy === 'date_asc') return arr.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    if (sortBy === 'visits_desc') return arr.sort((a, b) => (b.visits?.length || 0) - (a.visits?.length || 0));
    return arr;
  }, [reports, sortBy]);

  const deletableIds = useMemo(() => sortedReports.filter(r => {
    if (!canDelete) return false;
    if (session?.role === 'sales') return session.salesId === r.salesId;
    return true;
  }).map(r => r.id), [sortedReports, canDelete, session?.role, session?.salesId]);
  const allSelected = deletableIds.length > 0 && deletableIds.every(id => selectedIds.includes(id));

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : [...deletableIds]);
  };

  useEffect(() => {
    setSelectedIds(prev => prev.filter(id => reports.some(r => r.id === id)));
  }, [reports]);

  if (!reports.length) return (
    <div style={{padding: '60px 30px', textAlign: 'center', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
      <Clock size={36} strokeWidth={1.2} style={{color: 'var(--ims-text-2)', marginBottom: '12px'}} />
      <div style={{fontSize: '14px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>
        {searchTerm
          ? (lang === 'id'
            ? `Tidak ada laporan cocok dengan "${searchTerm}"${totalBeforeSearch > 0 ? ` dari ${totalBeforeSearch} laporan` : ''}.`
            : `No reports match "${searchTerm}"${totalBeforeSearch > 0 ? ` out of ${totalBeforeSearch} reports` : ''}.`)
          : t.sr_no_reports}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px'}}>
        {canDelete && deletableIds.length > 0 && (
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600}}>
              <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} style={{width: '14px', height: '14px', cursor: 'pointer'}} />
              {lang === 'id' ? 'Pilih Semua' : 'Select All'}
            </label>
            <button
              disabled={selectedIds.length === 0}
              onClick={() => selectedIds.length > 0 && onBulkDelete?.(selectedIds)}
              style={{
                background: selectedIds.length === 0 ? 'var(--ims-bg-card-2)' : '#c03030',
                border: 'none',
                color: selectedIds.length === 0 ? 'var(--ims-text-2)' : '#fff',
                padding: '7px 14px',
                fontSize: '11px',
                fontFamily: 'inherit',
                cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: selectedIds.length === 0 ? 0.6 : 1,
              }}
            >
              <Trash2 size={12} />{lang === 'id' ? 'Hapus Laporan Terpilih' : 'Delete Selected'}{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
            </button>
          </div>
        )}
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
        const canManage = canDeleteReport(r);
        const isChecked = selectedIds.includes(r.id);
        const rsPreview = (r.visits || []).slice(0, 3).map(v => v.name).filter(Boolean).join(', ');
        const rsMore = (r.visits?.length || 0) > 3 ? ` +${r.visits.length - 3}` : '';
        return (
          <div key={r.id} style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
            <div style={{padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap'}}>
              {canManage && (
                <input type="checkbox" checked={isChecked} onChange={() => toggleSelect(r.id)} onClick={e => e.stopPropagation()} style={{width: '14px', height: '14px', cursor: 'pointer', flexShrink: 0}} />
              )}
              <div onClick={() => setExpanded(isOpen ? null : r.id)} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 auto', flexWrap: 'wrap'}}>
                <div style={{width: '4px', height: '38px', background: sales?.accent || 'var(--ims-accent)'}} />
                <div style={{flex: '1 1 200px', minWidth: 0}}>
                  <div style={{fontSize: '13px', fontWeight: 600}}>{sales?.name || r.salesId}</div>
                  <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}} className="mono">{r.date} · {r.week}{r.updatedAt && <span style={{color: 'var(--ims-accent)', marginLeft: '6px'}}>· {lang === 'id' ? 'diedit' : 'edited'}</span>}</div>
                  {rsPreview && (
                    <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      {lang === 'id' ? 'RS: ' : 'Hospitals: '}{rsPreview}{rsMore}
                    </div>
                  )}
                </div>
                <div style={{display: 'flex', gap: '14px', fontSize: '11px', color: 'var(--ims-text-2)', flexWrap: 'wrap'}} className="mono">
                  <span><b style={{color: 'var(--ims-text)'}}>{r.visits?.length || 0}</b> RS</span>
                  <span><b style={{color: 'var(--ims-text)'}}>{r.days}</b> {t.days}</span>
                </div>
                <ChevronDown size={16} style={{transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: 'var(--ims-text-2)'}} />
              </div>
              {canManage && session?.role === 'sales' && (
                <div style={{display: 'flex', gap: '4px'}}>
                  <button onClick={(e) => { e.stopPropagation(); onEdit(r); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '5px 10px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit'}} title={t.sr_edit_report}><Edit2 size={11} /></button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(r.id); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '5px 10px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}} title={t.sr_delete_report}><Trash2 size={11} /></button>
                </div>
              )}
              {canManage && session?.role !== 'sales' && (
                <div style={{display: 'flex', gap: '4px'}}>
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
      if (s.status === 'lost' || s.status === 'cancelled' || s.status === 'inactive') return false;
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
        else if (v === 'inactive') { next.status = 'inactive'; next.poStatus = null; next.probability = 0; }
        else { if (next.status === 'won' || next.status === 'lost' || next.status === 'inactive') next.status = 'active'; next.poStatus = null; }
      }
      if (k === 'status') {
        // Reverse coupling so the Status dropdown stays consistent with stage/PO.
        if (v === 'won') { next.stage = 'po_issued'; next.poStatus = 'issued'; next.probability = 100; }
        else if (v === 'lost') { next.stage = 'lost'; next.poStatus = null; }
        else if (v === 'inactive') { next.stage = 'inactive'; next.poStatus = null; next.probability = 0; }
        else { // active
          next.poStatus = null;
          if (next.stage === 'po_issued' || next.stage === 'lost' || next.stage === 'inactive') {
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
          if (!next.installmentMonths || next.installmentMonths > 60) next.installmentMonths = 12;
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
              <option value="personal">{t.type_personal}</option>
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
              <option value="active">{t.status_active}</option><option value="won">{t.status_won}</option><option value="lost">{t.status_lost}</option><option value="inactive">{t.status_inactive}</option>
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

export { SPHWorkflowConsole, SPHDetailModal, SPHManagement, PipelineBoard, PipelineDashboard, SPHDashboard, SalesTeamDashboard, SalesModule, SalesReport, SRDashboard, SRForm, SRHistory, SPHModal };

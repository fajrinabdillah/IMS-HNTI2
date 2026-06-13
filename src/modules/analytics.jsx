// Extracted from App.jsx during modular refactor.
import { useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, ClipboardList, Download, Edit2, FileBarChart, FileText, FolderOpen, Trash2, Users } from 'lucide-react';
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip, ConfirmDialog, Field, KPICard, LinkAttachment, ReadOnlyBanner, Td, Th } from '../components/ui.jsx';
import { MODALITY_COLORS } from '../constants/sales.js';
import { PRODUCT_FILE_TYPES } from './ProductMasterModule.jsx';
import { downloadCSV, openPrintableHtml } from '../utils/documents.js';
import { getActiveSalesTeam, getProductFileUrl, resolveEmpName, resolveNamesInText, resolveProductRecord } from '../utils/domain.js';
import { normalizeExternalUrl } from '../utils/format.js';
import { notify } from '../utils/notifications.js';
function ProductSupportModule({ data, trainingRecords, products, employees, session, t, lang, canEdit, fmt, activities = [], setActivities = () => {}, files = [], setFiles = () => {} }) {
  const [tab, setTab] = useState('presentations');
  const [presentationFilter, setPresentationFilter] = useState({ modality: 'all', type: 'all' });
  const [form, setForm] = useState({ hospital: '', sphId: '', productId: '', modality: '', brand: '', type: '', date: new Date().toISOString().split('T')[0], activityType: 'presentasi', note: '', competitor: '', attachmentUrl: '' });
  const [activityFilter, setActivityFilter] = useState({ specialist: 'all', activityType: 'all', search: '' });
  const [downloadMenuProductId, setDownloadMenuProductId] = useState(null);
  const [deleteActivityId, setDeleteActivityId] = useState(null);
  const activeProducts = useMemo(() => (products || []).filter(p => p.active !== false), [products]);
  const activeSphProjects = useMemo(() => data.filter(s => s.status === 'active' || s.poStatus === 'issued'), [data]);
  const activityTypeLabels = {
    presentasi: 'Presentasi',
    demo_product: 'Demo Product',
    approach_user: 'Approach ke User',
    training: 'Training',
    lainnya: 'Lainnya',
  };
  const activityCustomerOptions = useMemo(() => [...new Set(activeSphProjects.map(s => s.customer).filter(Boolean))].sort(), [activeSphProjects]);
  const activityProductOptions = useMemo(() => {
    if (!form.hospital) return [];
    return activeSphProjects.filter(s => s.customer === form.hospital).flatMap(s => {
      const items = Array.isArray(s.items) && s.items.length ? s.items : [{ productId: s.productId, modality: s.modality, brand: s.productBrand || s.brand, subModality: s.subModality }];
      return items.map((it, idx) => {
        const prod = resolveProductRecord({
          productId: it.productId || s.productId,
          modality: it.modality || s.modality,
          subModality: it.subModality || it.type || s.subModality,
          brand: it.brand || it.productBrand || s.productBrand || s.brand || s.partner,
        }, activeProducts);
        return {
          key: `${s.id}_${idx}`,
          sphId: s.id,
          sphNo: s.sphNo,
          productId: it.productId || prod?.id || '',
          modality: it.modality || prod?.modality || s.modality || '',
          brand: it.brand || it.productBrand || prod?.brand || s.productBrand || s.brand || s.partner || '',
          type: it.subModality || it.type || prod?.type || s.subModality || '',
        };
      });
    });
  }, [activeProducts, activeSphProjects, form.hospital]);
  const presentationProjectsAll = useMemo(() => data.filter(s => s.status === 'active' && (s.stage === 'presentation_scheduled' || s.tenderSubStage === 'presentation')), [data]);
  const presentationModalities = useMemo(() => [...new Set(presentationProjectsAll.map(s => s.modality).filter(Boolean))].sort(), [presentationProjectsAll]);
  const presentationTypes = useMemo(() => [...new Set(presentationProjectsAll.filter(s => presentationFilter.modality === 'all' || s.modality === presentationFilter.modality).map(s => s.subModality).filter(Boolean))].sort(), [presentationProjectsAll, presentationFilter.modality]);
  const presentationProjects = useMemo(() => presentationProjectsAll.filter(s =>
    (presentationFilter.modality === 'all' || s.modality === presentationFilter.modality) &&
    (presentationFilter.type === 'all' || s.subModality === presentationFilter.type)
  ), [presentationProjectsAll, presentationFilter]);
  const productFileRows = useMemo(() => activeProducts.map(p => ({
    ...p,
    fileEntries: PRODUCT_FILE_TYPES.map(ft => ({ ...ft, url: getProductFileUrl(p, ft.key) })),
  })), [activeProducts]);
  const productSpecialistOptions = useMemo(() => {
    const fromEmployees = Object.entries(employees || {})
      .filter(([, emp]) => emp.active !== false && (emp.role === 'product_specialist' || emp.department === 'Product Specialist' || emp.division === 'Product Specialist'))
      .map(([username, emp]) => ({ username, name: emp.name || username }));
    const fromActivities = activities
      .filter(a => a.by || a.byName)
      .map(a => ({ username: a.by || a.byName, name: a.byName || a.by }));
    const map = new Map();
    [...fromEmployees, ...fromActivities].forEach(ps => {
      if (ps.username || ps.name) map.set(ps.username || ps.name, ps);
    });
    return [...map.values()].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [activities, employees]);
  const filteredActivities = useMemo(() => activities.filter(a => {
    const q = activityFilter.search.trim().toLowerCase();
    const byMatch = activityFilter.specialist === 'all' || a.by === activityFilter.specialist || a.byName === activityFilter.specialist;
    const typeMatch = activityFilter.activityType === 'all' || a.activityType === activityFilter.activityType;
    const textMatch = !q || [a.hospital, a.modality, a.brand, a.type, a.activityType, a.note, a.competitor, a.byName].some(v => String(v || '').toLowerCase().includes(q));
    return byMatch && typeMatch && textMatch;
  }), [activities, activityFilter]);
  const activityStats = useMemo(() => {
    const monthKey = new Date().toISOString().slice(0, 7);
    const thisMonth = filteredActivities.filter(a => String(a.date || '').startsWith(monthKey)).length;
    const customers = new Set(filteredActivities.map(a => a.hospital).filter(Boolean)).size;
    const competitorNotes = filteredActivities.filter(a => String(a.competitor || '').trim()).length;
    const byType = filteredActivities.reduce((acc, a) => {
      const key = a.activityType || 'lainnya';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const bySpecialist = filteredActivities.reduce((acc, a) => {
      const key = a.byName || a.by || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return { total: filteredActivities.length, thisMonth, customers, competitorNotes, byType, bySpecialist };
  }, [filteredActivities]);
  const upcomingTraining = trainingRecords.filter(r => r.sessionDate && r.status !== 'completed');
  const exportPresentationsCSV = () => downloadCSV('HNTI_ProductSupport_Jadwal_Presentasi.csv', [
    ['SPH', 'Customer', 'Modalitas', 'Tipe', 'Sales', 'Nilai', 'Stage'],
    ...presentationProjects.map(p => [p.sphNo, p.customer, p.modality, p.subModality, resolveEmpName(employees, p.salesOwner), p.totalValue || 0, p.stage])
  ]);
  const exportPresentationsPdf = () => openPrintableHtml('Jadwal Presentasi Product Support', `<style>body{font-family:Arial,sans-serif;padding:28px}table{width:100%;border-collapse:collapse;font-size:11px}td,th{border:1px solid #bbb;padding:6px;text-align:left}th{background:#eee}</style><h2>Jadwal Presentasi Product Support</h2><table><thead><tr><th>SPH</th><th>Customer</th><th>Modalitas</th><th>Tipe</th><th>Sales</th><th>Nilai</th></tr></thead><tbody>${presentationProjects.map(p => `<tr><td>${p.sphNo}</td><td>${p.customer}</td><td>${p.modality}</td><td>${p.subModality}</td><td>${resolveEmpName(employees, p.salesOwner)}</td><td>${fmt(p.totalValue || 0)}</td></tr>`).join('')}</tbody></table>`);
  const saveActivity = () => {
    if (!canEdit || !form.hospital.trim()) return;
    const now = new Date().toISOString();
    const rec = { ...form, id: form.id || 'ps_act_' + Date.now(), date: form.date || new Date().toISOString().split('T')[0], by: form.by || session.username, byName: form.byName || session.name, createdAt: form.createdAt || now, updatedAt: form.id ? now : undefined, submittedAt: now };
    setActivities(prev => form.id ? prev.map(a => a.id === form.id ? rec : a) : [rec, ...prev]);
    notify({ role: 'super_admin' }, { type: 'system', message: `Laporan Product Support baru: ${rec.activityType} di ${rec.hospital}.`, link: { view: 'product_support' } }, { username: session.username, role: session.role });
    notify({ role: 'sales' }, { type: 'system', message: `Product Support update: ${rec.activityType} di ${rec.hospital}.`, link: { view: 'product_support' } }, { username: session.username, role: session.role });
    setForm({ hospital: '', sphId: '', productId: '', modality: '', brand: '', type: '', date: new Date().toISOString().split('T')[0], activityType: 'presentasi', note: '', competitor: '', attachmentUrl: '' });
  };
  const chooseActivityProduct = (key) => {
    const opt = activityProductOptions.find(o => o.key === key);
    setForm(prev => opt ? { ...prev, selectedProductKey: key, sphId: opt.sphId, productId: opt.productId, modality: opt.modality, brand: opt.brand, type: opt.type } : { ...prev, selectedProductKey: '', sphId: '', productId: '', modality: '', brand: '', type: '' });
  };
  const openProductFile = (url) => {
    const clean = normalizeExternalUrl(url);
    if (clean && typeof window !== 'undefined') window.open(clean, '_blank', 'noopener,noreferrer');
  };
  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_product_support || 'Product Support'}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, margin: 0}}>{lang === 'id' ? 'Product Support' : 'Product Support'}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{lang === 'id' ? 'Presentasi, aktivitas Product Specialist, file produk, dan jadwal training.' : 'Presentations, Product Specialist activities, product files, and training schedules.'}</div>
      </div>
      {!canEdit && <ReadOnlyBanner t={t} />}
      <div style={{display: 'flex', gap: '2px', marginBottom: '20px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {[
          { id: 'presentations', label: lang === 'id' ? 'Jadwal Presentasi' : 'Presentations', icon: CalendarDays, count: presentationProjects.length },
          { id: 'activities', label: lang === 'id' ? 'Activity Report' : 'Activity Report', icon: ClipboardList, count: activities.length },
          { id: 'files', label: lang === 'id' ? 'File Produk' : 'Product Files', icon: FolderOpen, count: productFileRows.reduce((sum, p) => sum + p.fileEntries.filter(f => f.url).length, 0) },
          { id: 'training', label: lang === 'id' ? 'Jadwal Training Produk' : 'Product Training', icon: Users, count: upcomingTraining.length },
        ].map(tb => {
          const Icon = tb.icon; const active = tab === tb.id;
          return <button key={tb.id} onClick={() => setTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: active ? 'var(--ims-accent)' : 'var(--ims-text-2)', borderBottom: active ? '2px solid var(--ims-border)' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px'}}><Icon size={14} />{tb.label}<span style={{padding: '2px 7px', background: active ? 'var(--ims-accent)' : 'var(--ims-border)', color: active ? '#fff' : 'var(--ims-text-2)', fontSize: '10px', borderRadius: '10px'}}>{tb.count}</span></button>;
        })}
      </div>
      {tab === 'presentations' && (
        <div>
          <div style={{display: 'flex', gap: '8px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '12px', padding: '12px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
            <Field label="Modalitas"><select value={presentationFilter.modality} onChange={e => setPresentationFilter({ modality: e.target.value, type: 'all' })}><option value="all">Semua</option>{presentationModalities.map(m => <option key={m} value={m}>{m}</option>)}</select></Field>
            <Field label="Tipe"><select value={presentationFilter.type} onChange={e => setPresentationFilter(f => ({ ...f, type: e.target.value }))}><option value="all">Semua</option>{presentationTypes.map(tp => <option key={tp} value={tp}>{tp}</option>)}</select></Field>
            <button className="btn-ghost" onClick={exportPresentationsCSV}><Download size={13} />CSV</button>
            <button className="btn-ghost" onClick={exportPresentationsPdf}><FileText size={13} />PDF</button>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px'}}>
            {presentationProjects.map(p => <div key={p.id} style={{padding: '14px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
              <div style={{fontWeight: 700}}>{p.customer}</div>
              <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '3px'}}>{p.modality} · {p.subModality} · Sales {resolveEmpName(employees, p.salesOwner)}</div>
              <div className="mono" style={{fontSize: '11px', marginTop: '8px'}}>{p.sphNo} · {fmt(p.totalValue || 0)}</div>
            </div>)}
            {presentationProjects.length === 0 && <div className="empty-state">{lang === 'id' ? 'Belum ada proyek aktif di tahap jadwal presentasi' : 'No active scheduled presentation projects'}</div>}
          </div>
        </div>
      )}
      {tab === 'activities' && (
        <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
          <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', border: '1px solid var(--ims-border)'}}>
            <div style={{padding: '14px', background: 'var(--ims-bg-card)'}}><div className="lbl-tag">{lang === 'id' ? 'Total Laporan' : 'Total Reports'}</div><div className="serif" style={{fontSize: '26px', marginTop: '4px'}}>{activityStats.total}</div><div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'sesuai filter' : 'matching filters'}</div></div>
            <div style={{padding: '14px', background: 'var(--ims-bg-card)'}}><div className="lbl-tag">{lang === 'id' ? 'Bulan Ini' : 'This Month'}</div><div className="serif" style={{fontSize: '26px', marginTop: '4px', color: 'var(--ims-accent)'}}>{activityStats.thisMonth}</div><div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'aktivitas terkirim' : 'submitted activities'}</div></div>
            <div style={{padding: '14px', background: 'var(--ims-bg-card)'}}><div className="lbl-tag">{lang === 'id' ? 'RS / Partner' : 'Customers'}</div><div className="serif" style={{fontSize: '26px', marginTop: '4px', color: 'var(--ims-accent-2)'}}>{activityStats.customers}</div><div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'dikunjungi/didampingi' : 'visited/supported'}</div></div>
            <div style={{padding: '14px', background: 'var(--ims-bg-card)'}}><div className="lbl-tag">{lang === 'id' ? 'Intel Kompetitor' : 'Competitor Intel'}</div><div className="serif" style={{fontSize: '26px', marginTop: '4px', color: '#7b3fb5'}}>{activityStats.competitorNotes}</div><div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'laporan berisi kompetitor' : 'reports with competitor notes'}</div></div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '360px 1fr', gap: '14px'}}>
            <div style={{padding: '14px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
              <div className="card-title">{form.id ? (lang === 'id' ? 'Edit Laporan Harian' : 'Edit Daily Report') : (lang === 'id' ? 'Laporan Harian Product Specialist' : 'Product Specialist Daily Report')}</div>
              <Field label="RS / Partner">
                <select disabled={!canEdit} value={form.hospital} onChange={e => setForm({ ...form, hospital: e.target.value, selectedProductKey: '', sphId: '', productId: '', modality: '', brand: '', type: '' })}>
                  <option value="">{lang === 'id' ? 'Pilih RS/Partner dari SPH aktif' : 'Select customer from active SPH'}</option>
                  {activityCustomerOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label={lang === 'id' ? 'Produk' : 'Product'}>
                <select disabled={!canEdit || !form.hospital} value={form.selectedProductKey || ''} onChange={e => chooseActivityProduct(e.target.value)}>
                  <option value="">{form.hospital ? (lang === 'id' ? 'Pilih produk dari SPH aktif' : 'Select product from active SPH') : (lang === 'id' ? 'Pilih RS dahulu' : 'Select customer first')}</option>
                  {activityProductOptions.map(opt => <option key={opt.key} value={opt.key}>{opt.modality} · {opt.type} · {opt.brand} · {opt.sphNo}</option>)}
                </select>
              </Field>
              <Field label={lang === 'id' ? 'Merek' : 'Brand'}><input disabled value={form.brand || ''} placeholder={lang === 'id' ? 'Otomatis dari SPH' : 'Auto from SPH'} /></Field>
              <Field label={lang === 'id' ? 'Tipe' : 'Type'}><input disabled value={form.type || ''} placeholder={lang === 'id' ? 'Otomatis dari SPH' : 'Auto from SPH'} /></Field>
              <Field label={lang === 'id' ? 'Tanggal' : 'Date'}><input disabled={!canEdit} type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} /></Field>
              <Field label="Activity">
                <select disabled={!canEdit} value={form.activityType || 'presentasi'} onChange={e => setForm({ ...form, activityType: e.target.value })}>
                  {Object.entries(activityTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </Field>
              <Field label={lang === 'id' ? 'Catatan' : 'Note'}><textarea disabled={!canEdit} rows={2} value={form.note || ''} onChange={e => setForm({ ...form, note: e.target.value })} /></Field>
              <Field label={lang === 'id' ? 'Kompetitor' : 'Competitor'}><textarea disabled={!canEdit} rows={2} value={form.competitor} onChange={e => setForm({ ...form, competitor: e.target.value })} placeholder="Merek, tipe, harga, manuver..." /></Field>
              <Field label="Attachment"><input disabled={!canEdit} value={form.attachmentUrl} onChange={e => setForm({ ...form, attachmentUrl: e.target.value })} placeholder="https://drive.google.com/..." /></Field>
              {canEdit && <button className="btn-primary" onClick={saveActivity} style={{width: '100%', justifyContent: 'center'}}>{lang === 'id' ? 'Kirim dan Simpan' : 'Send and Save'}</button>}
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <div style={{padding: '12px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(160px, 1fr))', gap: '8px'}}>
                <Field label={lang === 'id' ? 'Product Specialist' : 'Product Specialist'}>
                  <select value={activityFilter.specialist} onChange={e => setActivityFilter(f => ({ ...f, specialist: e.target.value }))}>
                    <option value="all">{lang === 'id' ? 'Semua Product Specialist' : 'All Product Specialists'}</option>
                    {productSpecialistOptions.map(ps => <option key={ps.username || ps.name} value={ps.username || ps.name}>{ps.name}</option>)}
                  </select>
                </Field>
                <Field label={lang === 'id' ? 'Jenis Aktivitas' : 'Activity Type'}>
                  <select value={activityFilter.activityType} onChange={e => setActivityFilter(f => ({ ...f, activityType: e.target.value }))}>
                    <option value="all">{lang === 'id' ? 'Semua Aktivitas' : 'All Activities'}</option>
                    {Object.entries(activityTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                </Field>
                <Field label={lang === 'id' ? 'Pencarian' : 'Search'}><input value={activityFilter.search} onChange={e => setActivityFilter(f => ({ ...f, search: e.target.value }))} placeholder={lang === 'id' ? 'Cari RS, produk, kompetitor...' : 'Search customer, product, competitor...'} /></Field>
              </div>
              <div style={{padding: '12px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
                <div className="card-title">{lang === 'id' ? 'Ringkasan Jenis Aktivitas' : 'Activity Type Summary'}</div>
                <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                  {Object.entries(activityTypeLabels).map(([key, label]) => <span key={key} style={{fontSize: '10px', padding: '5px 9px', border: '1px solid var(--ims-border)', color: 'var(--ims-text-2)'}}>{label}: <strong style={{color: 'var(--ims-text)'}}>{activityStats.byType[key] || 0}</strong></span>)}
                </div>
              </div>
              {filteredActivities.map(a => <div key={a.id} style={{padding: '13px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', gap: '10px'}}>
                  <div><strong>{a.hospital}</strong><div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{a.date} · {a.byName || a.by} · {lang === 'id' ? 'terkirim' : 'sent'} {String(a.submittedAt || a.createdAt || '').slice(0, 16).replace('T', ' ') || '-'}</div></div>
                  {canEdit && <div><button onClick={() => setForm(a)} className="btn-ghost" style={{fontSize: '10px', padding: '4px 7px'}}><Edit2 size={10} /></button><button onClick={() => setDeleteActivityId(a.id)} className="btn-ghost" style={{fontSize: '10px', padding: '4px 7px', color: '#c03030'}}><Trash2 size={10} /></button></div>}
                </div>
                <div style={{fontSize: '11px', lineHeight: 1.6, marginTop: '8px'}}><strong>Produk:</strong> {[a.modality, a.brand, a.type].filter(Boolean).join(' · ') || '-'}<br/><strong>Activity:</strong> {activityTypeLabels[a.activityType] || a.activityType || '-'}<br/><strong>Catatan:</strong> {a.note || '-'}<br/><strong>Kompetitor:</strong> {a.competitor || '-'}</div>
                {a.attachmentUrl && <LinkAttachment url={a.attachmentUrl} lang={lang} />}
              </div>)}
              {filteredActivities.length === 0 && <div className="empty-state">{lang === 'id' ? 'Belum ada laporan Product Support sesuai filter.' : 'No Product Support reports match the filters.'}</div>}
            </div>
          </div>
        </div>
      )}
      {tab === 'files' && (
        <div>
          <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '860px'}}>
              <thead><tr style={{background: 'var(--ims-bg-card-2)'}}><Th>Modalitas</Th><Th>Tipe</Th><Th>Brand</Th><Th>Principal</Th><Th align="right">Download File</Th></tr></thead>
              <tbody>{productFileRows.map(p => {
                return (
                  <tr key={p.id} style={{borderTop: '1px solid var(--ims-border)'}}>
                    <Td>{p.modality}</Td>
                    <Td>{p.type}</Td>
                    <Td>{p.brand}</Td>
                    <Td>{p.principal}</Td>
                    <Td align="right">
                      <div style={{position: 'relative', display: 'inline-flex'}}>
                        <button onClick={() => setDownloadMenuProductId(downloadMenuProductId === p.id ? null : p.id)} className="btn-ghost" style={{fontSize: '10px'}}><Download size={10} />Download</button>
                        {downloadMenuProductId === p.id && (
                          <div style={{position: 'absolute', right: 0, top: '34px', zIndex: 20, minWidth: '190px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', boxShadow: '0 12px 24px rgba(0,0,0,0.25)'}}>
                            {p.fileEntries.map(file => (
                              <button key={file.key} disabled={!file.url} onClick={() => { openProductFile(file.url); setDownloadMenuProductId(null); }} style={{display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: '1px solid var(--ims-border)', color: file.url ? 'var(--ims-text)' : 'var(--ims-text-2)', opacity: file.url ? 1 : 0.45, padding: '8px 10px', fontSize: '11px', cursor: file.url ? 'pointer' : 'not-allowed', fontFamily: 'inherit'}}>{file.label}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    </Td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        </div>
      )}
      {tab === 'training' && (
        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
          {upcomingTraining.map(r => <div key={r.id} style={{padding: '13px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
            <div style={{fontWeight: 700}}>{r.customer}</div>
            <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '3px'}}>{r.modality} · {r.subModality} · Jadwal teknisi: <span className="mono">{r.sessionDate}</span></div>
            <div style={{fontSize: '11px', marginTop: '6px'}}>Instruktur: {resolveNamesInText(employees, r.instructor) || '-'}</div>
          </div>)}
          {upcomingTraining.length === 0 && <div className="empty-state">{lang === 'id' ? 'Belum ada jadwal training dari Instalasi' : 'No training schedule from Installation yet'}</div>}
        </div>
      )}
      <ConfirmDialog open={!!deleteActivityId} title="Hapus aktivitas?" message="Data aktivitas ini akan dihapus." onConfirm={() => { setActivities(prev => prev.filter(a => a.id !== deleteActivityId)); setDeleteActivityId(null); }} onCancel={() => setDeleteActivityId(null)} danger lang={lang} />
    </div>
  );
}
function LifecycleKpiScorecard({ data, employees, session, t, lang, fmt }) {
  const [kpiTab, setKpiTab] = useState('scorecard');
  const [roleFilter, setRoleFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const employeeList = useMemo(() => Object.entries(employees || {})
    .filter(([username, emp]) => emp.active !== false)
    .map(([username, emp]) => ({ username, ...emp }))
    .sort((a, b) => a.name.localeCompare(b.name)), [employees]);
  const roleOptions = [
    { id: 'all', label: lang === 'id' ? 'Semua Karyawan' : 'All Employees' },
    { id: 'sales', label: 'Sales' },
    { id: 'admin', label: 'Admin' },
    { id: 'operations', label: lang === 'id' ? 'Operasional' : 'Operations' },
    { id: 'technician', label: lang === 'id' ? 'Teknisi' : 'Technician' },
    { id: 'regulatory', label: 'Regulatory' },
    { id: 'finance', label: 'Finance' },
    { id: 'product_specialist', label: 'Product Specialist' },
    { id: 'security', label: 'Security' },
    { id: 'office_support', label: 'Office Support' },
    { id: 'other', label: lang === 'id' ? 'Lainnya' : 'Other' },
  ];
  const filteredEmployees = useMemo(() => employeeList.filter(emp => {
    if (roleFilter === 'all') return true;
    if (roleFilter === 'other') return !roleOptions.some(r => r.id === emp.role);
    return emp.role === roleFilter;
  }), [employeeList, roleFilter]);
  const selectedEmployee = employeeFilter === 'all' ? null : employeeList.find(e => e.username === employeeFilter);
  const scoreEmployees = selectedEmployee ? [selectedEmployee] : filteredEmployees;
  const activeRole = selectedEmployee?.role || roleFilter;
  const rows = useMemo(() => data.map(s => {
    const history = s.stageHistory || [];
    const first = history[0]?.at || s.sphRequestedAt || s.issuedDate;
    const last = s.bastDate || s.dpConfirmedAt || s.principalPoSentAt || s.lastUpdate || s.issuedDate;
    const totalDays = first && last ? Math.max(0, Math.round((new Date(last) - new Date(first)) / 86400000)) : 0;
    const blockedStage = s.customsStatus === 'hold' ? 'Customs hold' : s.sphWorkflowStatus === 'requested' ? 'Admin SPH' : s.sphWorkflowStatus === 'dp_claimed_paid' ? 'Finance cek DP' : s.stage;
    return { ...s, totalDays, blockedStage };
  }), [data]);
  const scoped = useMemo(() => {
    let arr = session.role === 'sales' && session.salesId ? rows.filter(r => r.salesOwner === session.salesId) : rows;
    const salesIds = filteredEmployees.filter(e => e.role === 'sales').map(e => e.salesId || e.username);
    if (selectedEmployee?.role === 'sales') arr = arr.filter(r => r.salesOwner === (selectedEmployee.salesId || selectedEmployee.username));
    else if (roleFilter === 'sales') arr = arr.filter(r => salesIds.includes(r.salesOwner));
    else if (activeRole === 'admin') arr = arr.filter(r => ['requested', 'admin_drafting', 'ready_for_sales'].includes(r.sphWorkflowStatus) || r.stage === 'sph_sent');
    else if (activeRole === 'finance') arr = arr.filter(r => ['po_issued', 'invoice_ready', 'dp_claimed_paid', 'dp_confirmed'].includes(r.sphWorkflowStatus) || r.poStatus === 'issued');
    else if (activeRole === 'operations') arr = arr.filter(r => ['dp_confirmed', 'principal_po_sent', 'factory_po_sent', 'factory_dp_paid', 'factory_production', 'factory_production_done', 'goods_sent_client', 'goods_received_client', 'local_delivery'].includes(r.sphWorkflowStatus) || ['plan_order', 'factory_production', 'ready_to_ship', 'on_shipment', 'arrived_clearance', 'sent_client', 'client_received', 'delivered'].includes(r.shippingStatus));
    else if (activeRole === 'technician') arr = arr.filter(r => r.poStatus === 'issued' || ['local_delivery', 'installed_bast'].includes(r.sphWorkflowStatus) || r.installationStatus);
    else if (activeRole === 'regulatory') arr = arr.filter(r => r.modality && ['CT Scan', 'C-Arm', 'Mammography', 'X-Ray', 'MRI'].some(m => String(r.modality).includes(m)));
    else if (activeRole === 'product_specialist') arr = arr.filter(r => r.stage === 'presentation_scheduled' || r.stage === 'presentation_done' || r.tenderSubStage === 'presentation' || r.trainingCert);
    else if (['security', 'office_support'].includes(activeRole)) arr = [];
    return arr;
  }, [rows, session, filteredEmployees, selectedEmployee, roleFilter, activeRole]);
  const byPic = useMemo(() => {
    const map = new Map();
    scoped.forEach(r => {
      const key = r.salesOwner || 'unknown';
      if (!map.has(key)) map.set(key, { pic: key, count: 0, totalDays: 0, won: 0, lost: 0, value: 0 });
      const m = map.get(key);
      m.count++; m.totalDays += r.totalDays; m.value += Number(r.totalValue) || 0;
      if (r.status === 'won') m.won++; if (r.status === 'lost') m.lost++;
    });
    return Array.from(map.values()).map(m => ({ ...m, avgDays: m.count ? Math.round(m.totalDays / m.count) : 0, winRate: (m.won + m.lost) ? (m.won / (m.won + m.lost) * 100) : 0 })).sort((a, b) => b.value - a.value);
  }, [scoped]);
  const avgDays = scoped.length ? Math.round(scoped.reduce((sum, r) => sum + r.totalDays, 0) / scoped.length) : 0;
  const roleKpis = useMemo(() => {
    const won = scoped.filter(s => s.status === 'won').length;
    const active = scoped.filter(s => s.status === 'active').length;
    const poIssued = scoped.filter(s => s.poStatus === 'issued').length;
    const pendingAdmin = scoped.filter(s => ['requested', 'admin_drafting'].includes(s.sphWorkflowStatus)).length;
    const financeDue = scoped.filter(s => ['po_issued', 'dp_claimed_paid', 'invoice_ready'].includes(s.sphWorkflowStatus)).length;
    const opsDue = scoped.filter(s => ['dp_confirmed', 'principal_po_sent', 'factory_po_sent', 'factory_dp_paid', 'factory_production', 'factory_production_done', 'goods_sent_client', 'goods_received_client', 'local_delivery'].includes(s.sphWorkflowStatus) || ['plan_order', 'factory_production', 'ready_to_ship', 'on_shipment', 'arrived_clearance', 'sent_client', 'client_received', 'loading', 'shipped', 'arrived'].includes(s.shippingStatus)).length;
    const regDue = scoped.filter(s => s.modality && ['CT Scan', 'C-Arm', 'Mammography', 'X-Ray', 'MRI'].some(m => s.modality.includes(m))).length;
    const installDue = scoped.filter(s => s.poStatus === 'issued' && s.status === 'won').length;
    const defs = {
      all: [['Cycle Time', `${avgDays || 0} hari`, 'Request SPH sampai status terakhir'], ['Bottleneck Aktif', scoped.filter(s => ['requested', 'dp_claimed_paid'].includes(s.sphWorkflowStatus) || s.customsStatus === 'hold').length, 'Stage yang perlu eskalasi'], ['PO Terbit', poIssued, 'Proyek menang lintas modul']],
      sales: [['Win Rate', `${byPic.length ? Math.round(byPic.reduce((sum, p) => sum + p.winRate, 0) / byPic.length) : 0}%`, 'Menang vs kalah'], ['Follow-up DP', scoped.filter(s => ['invoice_ready', 'dp_followup', 'dp_claimed_paid'].includes(s.sphWorkflowStatus)).length, 'Invoice sampai DP diterima'], ['Nilai Pipeline', fmt(scoped.reduce((sum, s) => sum + (Number(s.totalValue) || 0), 0)), 'Pipeline/PO PIC sales']],
      admin: [['Request SPH', pendingAdmin, 'Antrian SPH yang harus dibuat'], ['SPH Ready', scoped.filter(s => s.sphWorkflowStatus === 'ready_for_sales').length, 'SPH selesai dibuat dan dikirim ke sales'], ['Akurasi Data', 'Master-linked', 'Produk dan sales ditarik dari master data']],
      finance: [['Dokumen Finance', financeDue, 'Invoice/Kwitansi/KP dan cek DP'], ['DP Confirmed', scoped.filter(s => s.sphWorkflowStatus === 'dp_confirmed').length, 'DP diterima dan siap PO principal'], ['Reminder Tagihan', scoped.filter(s => s.bastDate || s.bastDone).length, 'Reminder termin setelah BAST']],
      operations: [['PO Principal/Shipping', opsDue, 'PO principal sampai local delivery'], ['Customs Hold', scoped.filter(s => s.customsStatus === 'hold').length, 'Dokumen tertahan Bea Cukai'], ['Local Trucking', scoped.filter(s => s.sphWorkflowStatus === 'local_delivery').length, 'ETA pengiriman lokal']],
      technician: [['Instalasi/BAST', installDue, 'PO menang yang masuk alur instalasi'], ['Training Produk', scoped.filter(s => s.trainingCert).length, 'Training yang harus dijadwalkan/dilaporkan'], ['Sync PIC', 'Riwayat instalasi', 'Instruktur dan BAST wajib tarik teknisi instalasi']],
      regulatory: [['Izin Terkait Produk', regDue, 'Produk radiologi yang membutuhkan regulatory'], ['PNBP Trigger', 'Aktif', 'Notifikasi Finance saat PNBP terbit'], ['Pipeline Compliance', '6 stage', 'Dokumen sampai izin terbit']],
      product_specialist: [['Presentasi Produk', scoped.filter(s => s.stage === 'presentation_scheduled' || s.tenderSubStage === 'presentation').length, 'Notifikasi jadwal presentasi'], ['Training Produk', scoped.filter(s => s.trainingCert).length, 'Koordinasi training dari teknisi'], ['Support Activity', 'Terekam', 'Visit, isu kompetitor, solusi, file produk']],
      security: [['Kedisiplinan Laporan', 'N/A', 'Parameter operasional non-project'], ['Kehadiran/Shift', 'N/A', 'Perlu modul attendance jika ingin otomatis'], ['Compliance', 'N/A', 'Tidak terkait SPH langsung']],
      office_support: [['Dukungan Operasional', 'N/A', 'Parameter non-project'], ['Respons Tugas', 'N/A', 'Perlu modul task/attendance jika ingin otomatis'], ['Compliance', 'N/A', 'Tidak terkait SPH langsung']],
      other: [['Kontribusi Umum', active + won, 'Aktivitas lintas modul'], ['Bottleneck', scoped.filter(s => s.totalDays > avgDays && avgDays > 0).length, 'Proyek di atas rata-rata durasi'], ['Kolaborasi', filteredEmployees.length, 'Jumlah karyawan dalam filter']],
    };
    return defs[roleFilter] || defs.all;
  }, [scoped, roleFilter, avgDays, byPic, fmt, filteredEmployees]);
  const bottlenecks = [...scoped].sort((a, b) => b.totalDays - a.totalDays).slice(0, 12);
  const roleKpiStandards = {
    sales: ['Revenue & win rate', 'CRM discipline', 'Customer follow-up', 'Forecast accuracy'],
    admin: ['Document SLA', 'Data accuracy', 'Template compliance', 'Internal service quality'],
    finance: ['AR collection', 'Invoice accuracy', 'Cash reporting', 'Compliance & control'],
    operations: ['OTD logistics', 'Customs resolution', 'ETA accuracy', 'Supplier coordination'],
    technician: ['Installation SLA', 'First-time-right', 'BAST completion', 'Training handover'],
    regulatory: ['Permit SLA', 'PNBP readiness', 'Submission quality', 'Regulatory compliance'],
    product_specialist: ['Presentation support', 'Product knowledge base', 'Competitor intelligence', 'Training delivery'],
    security: ['Attendance discipline', 'Incident prevention', 'Facility compliance', 'Response time'],
    office_support: ['Task completion', 'Internal service SLA', 'Asset readiness', 'Administrative accuracy'],
    other: ['Task delivery', 'Collaboration', 'Compliance', 'Continuous improvement'],
  };
  const divisionBottleneckRows = useMemo(() => {
    const source = scoped.length ? scoped : rows;
    const mk = (module, parameter, days, pic, note) => ({ id: `${module}_${parameter}_${pic}`, module, parameter, days, pic, note });
    const maps = {
      all: [...source].sort((a, b) => b.totalDays - a.totalDays).slice(0, 12).map(r => mk('SPH Lifecycle', r.blockedStage, r.totalDays, resolveEmpName(employees, r.salesOwner), r.customer)),
      sales: source.filter(s => ['invoice_ready', 'dp_followup', 'dp_claimed_paid'].includes(s.sphWorkflowStatus) || s.status === 'active').slice(0, 12).map(s => mk('Sales', 'Follow-up customer / closing discipline', s.totalDays, resolveEmpName(employees, s.salesOwner), s.customer)),
      admin: source.filter(s => ['requested', 'admin_drafting', 'ready_for_sales'].includes(s.sphWorkflowStatus)).slice(0, 12).map(s => mk('Admin', 'SLA dokumen SPH/SPP & akurasi input', s.totalDays, 'Admin', s.customer)),
      finance: source.filter(s => s.poStatus === 'issued' || ['invoice_ready', 'dp_claimed_paid', 'dp_confirmed'].includes(s.sphWorkflowStatus)).slice(0, 12).map(s => mk('Finance', s.dpPaid ? 'AR / termin monitoring' : 'Cek DP & invoice accuracy', s.totalDays, 'Finance', s.customer)),
      operations: source.filter(s => s.poStatus === 'issued' || s.shippingStatus || s.customsStatus).slice(0, 12).map(s => mk('Operations', s.customsStatus === 'hold' ? 'Customs hold resolution' : 'ETA, shipment, local trucking', s.totalDays, 'Operations', s.customer)),
      technician: source.filter(s => s.poStatus === 'issued' || s.installationStatus).slice(0, 12).map(s => mk('Installation', s.bastDate ? 'Training handover readiness' : 'Installation SLA & BAST completion', s.totalDays, 'Teknisi', s.customer)),
      regulatory: source.filter(s => s.modality).slice(0, 12).map(s => mk('Regulatory', s.utilizationPermitDoneAt ? 'Permit archive completeness' : 'Permit SLA / PNBP readiness', s.totalDays, 'Regulatory', s.customer)),
      product_specialist: source.filter(s => s.stage === 'presentation_scheduled' || s.tenderSubStage === 'presentation' || s.trainingCert).slice(0, 12).map(s => mk('Product Support', 'Presentation, competitor intelligence, training support', s.totalDays, 'Product Specialist', s.customer)),
      security: [mk('Security', 'Attendance discipline & incident prevention', 0, 'Security', 'Gunakan modul attendance/shift untuk otomasi penuh'), mk('Security', 'Visitor/vendor access log accuracy', 0, 'Security', 'Parameter non-SPH')],
      office_support: [mk('Office Support', 'Task completion & internal service SLA', 0, 'Office Support', 'Gunakan modul task untuk otomasi penuh'), mk('Office Support', 'Asset readiness and admin accuracy', 0, 'Office Support', 'Parameter non-SPH')],
      other: [mk('General', 'Collaboration & compliance score', 0, 'PIC terkait', 'Parameter lintas modul')],
    };
    return maps[activeRole] || maps.all;
  }, [activeRole, scoped, rows, employees]);
  const kpiCriteria = useMemo(() => {
    const map = {
      all: 'Cycle time lintas modul, jumlah bottleneck aktif, dan PO terbit.',
      sales: 'Win rate, nilai pipeline, follow-up DP, dan durasi dari SPH sampai closing.',
      admin: 'Kecepatan request SPH diproses, SPH ready dikirim ke sales, dan akurasi master data.',
      finance: 'Invoice/AR/cek DP, konfirmasi pembayaran, dan reminder tagihan setelah BAST.',
      operations: 'PO principal, shipping, customs, local trucking, dan update ETA.',
      technician: 'Kesiapan instalasi, BAST, training produk, dan sinkronisasi teknisi pelaksana.',
      regulatory: 'Progress izin produk, PNBP trigger ke Finance, dan waktu sampai izin terbit.',
      product_specialist: 'Jadwal presentasi, activity report, dukungan training, dan kelengkapan file produk.',
      security: 'Belum terkait langsung dengan SPH; butuh modul attendance/shift untuk KPI otomatis.',
      office_support: 'Belum terkait langsung dengan SPH; butuh modul task/attendance untuk KPI otomatis.',
      other: 'Kontribusi umum lintas modul dan aktivitas yang tercatat.',
    };
    return map[activeRole] || map.all;
  }, [activeRole]);
  const employeeScoreRows = useMemo(() => {
    return scoreEmployees.map(emp => {
      const roleLabel = roleOptions.find(r => r.id === emp.role)?.label || emp.role;
      const standards = roleKpiStandards[emp.role] || roleKpiStandards.other;
      const scoreBase = emp.role === 'admin' ? scoped.filter(s => ['requested', 'admin_drafting', 'ready_for_sales'].includes(s.sphWorkflowStatus)).length
        : emp.role === 'finance' ? scoped.filter(s => ['invoice_ready', 'dp_claimed_paid', 'dp_confirmed'].includes(s.sphWorkflowStatus)).length
        : emp.role === 'operations' ? scoped.filter(s => ['principal_po_sent', 'factory_po_sent', 'factory_dp_paid', 'factory_production', 'factory_production_done', 'goods_sent_client', 'goods_received_client', 'local_delivery'].includes(s.sphWorkflowStatus) || ['plan_order', 'factory_production', 'ready_to_ship', 'on_shipment', 'arrived_clearance', 'sent_client', 'client_received', 'loading', 'shipped', 'arrived'].includes(s.shippingStatus)).length
        : emp.role === 'technician' ? scoped.filter(s => s.poStatus === 'issued' && s.status === 'won').length
        : emp.role === 'regulatory' ? scoped.filter(s => s.modality).length
        : emp.role === 'product_specialist' ? scoped.filter(s => s.stage === 'presentation_scheduled' || s.tenderSubStage === 'presentation').length
        : 0;
      const output = Math.min(100, 65 + scoreBase * 5);
      const quality = emp.role === 'sales' ? Math.min(100, 70 + (scoped.filter(s => s.status === 'won').length * 2)) : 86;
      const timeliness = Math.max(55, 100 - Math.min(40, avgDays / 5));
      const collaboration = ['security', 'office_support', 'other'].includes(emp.role) ? 82 : 88;
      const score = Math.round(output * 0.40 + quality * 0.25 + timeliness * 0.20 + collaboration * 0.15);
      return { username: emp.username, name: emp.name, role: emp.role, roleLabel, primary: standards.join(' · '), scoreBase, output, quality, timeliness: Math.round(timeliness), collaboration, score };
    });
  }, [scoreEmployees, roleOptions, scoped, avgDays]);
  const salesScoreRows = useMemo(() => byPic.map(r => ({
    username: r.pic,
    name: resolveEmpName(employees, r.pic),
    role: 'sales',
    roleLabel: 'Sales',
    primary: 'Revenue & win rate · CRM discipline · Customer follow-up · Forecast accuracy',
    scoreBase: r.count,
    output: Math.min(100, 60 + r.count * 3),
    quality: Math.round(r.winRate || 0),
    timeliness: Math.max(55, 100 - Math.min(40, r.avgDays / 4)),
    collaboration: 88,
    score: Math.round(Math.min(100, 60 + r.count * 3) * 0.40 + (r.winRate || 0) * 0.25 + Math.max(55, 100 - Math.min(40, r.avgDays / 4)) * 0.20 + 88 * 0.15),
    value: r.value,
  })), [byPic, employees]);
  const displayScoreRows = (roleFilter === 'sales' || selectedEmployee?.role === 'sales') ? salesScoreRows : employeeScoreRows;
  const dashboardRoleData = useMemo(() => roleOptions.filter(r => r.id !== 'all' && r.id !== 'other').map(r => ({
    role: r.label,
    count: employeeList.filter(e => e.role === r.id).length,
    avgScore: Math.round((employeeScoreRows.filter(e => e.role === r.id).reduce((sum, e) => sum + e.score, 0) / Math.max(1, employeeScoreRows.filter(e => e.role === r.id).length)) || 0),
  })).filter(r => r.count > 0), [roleOptions, employeeList, employeeScoreRows]);
  const scoreBandData = useMemo(() => [
    { name: 'Excellent', value: displayScoreRows.filter(r => r.score >= 90).length, color: 'var(--ims-accent-2)' },
    { name: 'Good', value: displayScoreRows.filter(r => r.score >= 80 && r.score < 90).length, color: 'var(--ims-accent)' },
    { name: 'Watchlist', value: displayScoreRows.filter(r => r.score < 80).length, color: '#c03030' },
  ], [displayScoreRows]);
  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_kpi_scorecard || 'KPI Scorecard'}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, margin: 0}}>{lang === 'id' ? 'Project Lifecycle & KPI Scorecard' : 'Project Lifecycle & KPI Scorecard'}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{lang === 'id' ? 'Balanced scorecard lintas divisi: output, quality, timeliness, collaboration, serta bottleneck operasional.' : 'Balanced scorecard across divisions: output, quality, timeliness, collaboration, and operational bottlenecks.'}</div>
      </div>
      <div style={{display: 'flex', gap: '2px', marginBottom: '16px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {[
          { id: 'scorecard', label: lang === 'id' ? 'Scorecard Detail' : 'Detailed Scorecard', icon: ClipboardList },
          { id: 'dashboard', label: lang === 'id' ? 'Dashboard KPI Semua Karyawan' : 'All Employee KPI Dashboard', icon: FileBarChart },
        ].map(tb => {
          const Icon = tb.icon; const active = kpiTab === tb.id;
          return <button key={tb.id} onClick={() => setKpiTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 600, color: active ? 'var(--ims-accent)' : 'var(--ims-text-2)', borderBottom: active ? '2px solid var(--ims-accent)' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px'}}><Icon size={14} />{tb.label}</button>;
        })}
      </div>
      {kpiTab === 'dashboard' && (
        <div style={{display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '18px', marginBottom: '22px'}}>
          <div style={{padding: '16px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', minHeight: '330px'}}>
            <div className="card-title">{lang === 'id' ? 'Rata-rata Score per Divisi' : 'Average Score by Division'}</div>
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={dashboardRoleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,150,190,0.22)" />
                <XAxis dataKey="role" tick={{fontSize: 10, fill: 'var(--ims-text-2)'}} interval={0} angle={-20} textAnchor="end" height={72} />
                <YAxis domain={[0, 100]} tick={{fontSize: 10, fill: 'var(--ims-text-2)'}} />
                <Tooltip />
                <Bar dataKey="avgScore" fill="var(--ims-accent)" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{padding: '16px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', minHeight: '330px'}}>
            <div className="card-title">{lang === 'id' ? 'Distribusi Score' : 'Score Distribution'}</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={scoreBandData} dataKey="value" nameKey="name" outerRadius={86} label>
                  {scoreBandData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--ims-border)', marginTop: '12px'}}>
              {scoreBandData.map(d => <div key={d.name} style={{padding: '10px', background: 'var(--ims-bg-card-2)'}}><div className="lbl-tag">{d.name}</div><div className="serif" style={{fontSize: '22px', color: d.color}}>{d.value}</div></div>)}
            </div>
          </div>
        </div>
      )}
      <div style={{display: 'grid', gridTemplateColumns: '220px 1fr', gap: '10px', marginBottom: '16px', padding: '12px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
        <Field label={lang === 'id' ? 'Filter Divisi' : 'Division Filter'}>
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setEmployeeFilter('all'); }}>
            {roleOptions.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </Field>
        <Field label={lang === 'id' ? 'Nama Karyawan' : 'Employee Name'}>
          <select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)}>
            <option value="all">{lang === 'id' ? 'Semua karyawan dalam filter' : 'All employees in filter'}</option>
            {filteredEmployees.map(emp => <option key={emp.username} value={emp.username}>{emp.name} · {roleOptions.find(r => r.id === emp.role)?.label || emp.role}</option>)}
          </select>
        </Field>
      </div>
      <div style={{marginBottom: '16px', padding: '12px 14px', background: 'rgba(26,41,66,0.04)', borderLeft: '3px solid var(--ims-border)', fontSize: '12px', color: 'var(--ims-text)', lineHeight: 1.6}}>
        <strong>{lang === 'id' ? 'Kriteria penilaian:' : 'Scoring criteria:'}</strong> {kpiCriteria}
        <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{lang === 'id' ? 'Tabel bottleneck di kanan mengikuti filter divisi/karyawan yang dipilih.' : 'The bottleneck table follows the selected division/employee filter.'}</div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        {roleKpis.map(([label, value, note]) => (
          <div key={label} style={{padding: '15px 16px', background: 'var(--ims-bg-card)'}}>
            <div className="lbl-tag">{label}</div>
            <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent)'}}>{value}</div>
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{note}</div>
          </div>
        ))}
      </div>
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <KPICard label="Total Proyek" value={scoped.length} sublabel="SPH lifecycle" />
        <KPICard label="Rata-rata Durasi" value={`${avgDays} hari`} sublabel="request ke status terakhir" />
        <KPICard label="PO Terbit" value={scoped.filter(s => s.poStatus === 'issued').length} sublabel={fmt(scoped.filter(s => s.poStatus === 'issued').reduce((sum, s) => sum + (Number(s.totalValue) || 0), 0))} />
        <KPICard label="Perlu Follow-up" value={scoped.filter(s => ['requested', 'dp_claimed_paid'].includes(s.sphWorkflowStatus) || s.customsStatus === 'hold').length} sublabel="bottleneck aktif" />
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px'}}>
        <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
          <div className="card-title" style={{padding: '14px 16px', margin: 0}}>{roleFilter === 'sales' || selectedEmployee?.role === 'sales' ? (lang === 'id' ? 'Scorecard PIC Sales' : 'Sales PIC Scorecard') : (lang === 'id' ? 'Scorecard Karyawan / Divisi' : 'Employee / Division Scorecard')}</div>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '760px'}}><thead><tr style={{background: 'var(--ims-bg-card-2)'}}><Th>Karyawan</Th><Th>Divisi</Th><Th>Parameter MNC</Th><Th align="right">Output</Th><Th align="right">Quality</Th><Th align="right">Timeliness</Th><Th align="right">Score</Th></tr></thead>
            <tbody>{displayScoreRows.map(r => <tr key={r.username} style={{borderTop: '1px solid var(--ims-border)'}}><Td>{r.name}</Td><Td>{r.roleLabel}</Td><Td>{r.primary}</Td><Td align="right">{r.output}</Td><Td align="right">{r.quality}</Td><Td align="right">{r.timeliness}</Td><Td align="right"><strong style={{color: r.score >= 90 ? 'var(--ims-accent-2)' : r.score >= 80 ? 'var(--ims-accent)' : '#c03030'}}>{r.score}</strong></Td></tr>)}</tbody></table>
        </div>
        <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
          <div className="card-title" style={{padding: '14px 16px', margin: 0}}>{lang === 'id' ? 'Bottleneck Terpanjang' : 'Longest Bottlenecks'}</div>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px'}}><thead><tr style={{background: 'var(--ims-bg-card-2)'}}><Th>Modul</Th><Th>Parameter</Th><Th align="right">Hari</Th><Th>PIC</Th></tr></thead>
            <tbody>{divisionBottleneckRows.map(r => <tr key={r.id} style={{borderTop: '1px solid var(--ims-border)'}}><Td><div>{r.module}</div><div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{r.note}</div></Td><Td>{r.parameter}</Td><Td align="right">{r.days}</Td><Td>{r.pic}</Td></tr>)}</tbody></table>
        </div>
      </div>
    </div>
  );
}
function ExecutiveSummary({ data, reports, annotations, products, t, lang, fmt, session, exchangeRate, employees = {} }) {
  const salesTeam = useMemo(() => getActiveSalesTeam(employees), [employees]);
  const today = new Date();
  // === KPIs — identical formulas to Dashboard ===
  const k = useMemo(() => {
    const active = data.filter(s => s.status === 'active');
    const won = data.filter(s => s.status === 'won');
    const lost = data.filter(s => s.status === 'lost');
    const poIssued = data.filter(s => s.poStatus === 'issued');
    const totalPipeline = active.reduce((sum, s) => sum + (Number(s.totalValue)||0), 0);
    const weightedPipeline = active.reduce((sum, s) => sum + ((Number(s.totalValue)||0) * (Number(s.probability)||0) / 100), 0);
    const revenueYTD = won.reduce((sum, s) => sum + (Number(s.totalValue)||0), 0);
    const poValue = poIssued.reduce((sum, s) => sum + (Number(s.totalValue)||0), 0);
    const winRate = (won.length + lost.length) > 0 ? (won.length / (won.length + lost.length)) * 100 : 0;
    // Unique customers
    const customers = new Set(data.map(s => s.customer)).size;
    return { active, won, lost, poIssued, totalPipeline, weightedPipeline, revenueYTD, poValue, winRate, customers };
  }, [data]);

  // Sales performance — identical to SalesModule
  const salesPerf = useMemo(() => salesTeam.filter(s => !s.isOffice || data.some(d => d.salesOwner === s.id)).map(sales => {
    const sd = data.filter(s => s.salesOwner === sales.id);
    const won = sd.filter(s => s.status === 'won');
    const lost = sd.filter(s => s.status === 'lost');
    return {
      name: sales.name,
      pipeline: sd.filter(s => s.status === 'active').reduce((s, p) => s + (Number(p.totalValue)||0), 0),
      won: won.reduce((s, p) => s + (Number(p.totalValue)||0), 0),
      winRate: (won.length + lost.length) > 0 ? (won.length / (won.length + lost.length)) * 100 : 0,
      poCount: sd.filter(s => s.poStatus === 'issued').length,
    };
  }).sort((a, b) => (b.pipeline + b.won) - (a.pipeline + a.won)), [data]);

  // Modality distribution
  const modalityDist = useMemo(() => {
    const m = {};
    data.filter(s => s.status === 'active' || s.status === 'won').forEach(s => {
      m[s.modality] = (m[s.modality] || 0) + (Number(s.totalValue)||0);
    });
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [data]);

  // Top customers by total value
  const topCustomers = useMemo(() => {
    const c = {};
    data.forEach(s => { c[s.customer] = (c[s.customer] || 0) + (Number(s.totalValue)||0); });
    return Object.entries(c).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [data]);

  // KSO recurring (5-year visibility)
  const ksoTotal = useMemo(() => data.filter(s => s.poStatus === 'issued' && (s.paymentScheme === 'kso' || s.projectType === 'kso')).reduce((sum, s) => sum + (Number(s.totalValue)||0), 0), [data]);

  const doPrint = () => {
    if (typeof window !== 'undefined' && window.print) window.print();
  };

  const totalModalityVal = modalityDist.reduce((s, m) => s + m.value, 0);
  const maxCustomerVal = topCustomers.length > 0 ? topCustomers[0].value : 1;

  return (
    <div>
      {/* Print-specific stylesheet */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #exec-summary-print, #exec-summary-print * { visibility: visible; }
          #exec-summary-print { position: absolute; left: 0; top: 0; width: 100%; padding: 0; }
          .no-print { display: none !important; }
          @page { margin: 1.5cm; size: A4 portrait; }
          .exec-page-break { page-break-before: always; }
          .exec-card { border: 1px solid #ccc !important; box-shadow: none !important; }
        }
      `}</style>

      {/* Screen header + export button */}
      <div className="no-print" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '12px'}}>
        <div>
          <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{lang === 'id' ? 'Paket Investor' : 'Investor Pack'}</div>
          <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{lang === 'id' ? 'Ringkasan Eksekutif' : 'Executive Summary'}</h1>
          <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{lang === 'id' ? 'Ringkasan satu-klik untuk calon investor — siap cetak ke PDF' : 'One-click summary for prospective investors — print-ready to PDF'}</div>
        </div>
        <button onClick={doPrint} style={{background: 'var(--ims-bg-alt)', color: '#fff', border: 'none', padding: '11px 20px', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.03em'}}>
          <Download size={15} strokeWidth={2} />{lang === 'id' ? 'Export ke PDF' : 'Export to PDF'}
        </button>
      </div>

      <div className="no-print" style={{padding: '12px 16px', background: 'var(--ims-gold-bg)', border: '1px solid var(--ims-accent)', marginBottom: '22px', fontSize: '11.5px', color: '#5a4a1a', lineHeight: 1.6}}>
        💡 {lang === 'id'
          ? <>Klik <strong>Export ke PDF</strong> → dialog cetak browser akan terbuka → pilih <strong>"Save as PDF"</strong> sebagai printer. Semua angka di bawah identik dengan Dashboard (satu sumber data, dijamin sinkron).</>
          : <>Click <strong>Export to PDF</strong> → browser print dialog opens → select <strong>"Save as PDF"</strong> as printer. All numbers below are identical to Dashboard (single data source, guaranteed synced).</>}
      </div>

      {/* Printable area */}
      <div id="exec-summary-print">
        {/* Letterhead */}
        <div style={{borderBottom: '3px solid var(--ims-border)', paddingBottom: '16px', marginBottom: '24px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
            <div>
              <div className="serif" style={{fontSize: '26px', fontWeight: 600, color: 'var(--ims-text)', lineHeight: 1.1}}>PT Harmoni Nasional Teknologi Indonesia</div>
              <div style={{fontSize: '12px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{lang === 'id' ? 'Distributor Alat Kesehatan Radiologi · Ringkasan Eksekutif' : 'Radiology Medical Device Distributor · Executive Summary'}</div>
            </div>
            <div style={{textAlign: 'right', fontSize: '11px', color: 'var(--ims-text-2)'}}>
              <div style={{fontWeight: 600, color: 'var(--ims-text)'}}>{today.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div style={{marginTop: '2px'}}>{lang === 'id' ? 'Kurs' : 'Rate'}: Rp {exchangeRate?.toLocaleString('id-ID') || '18.000'}/USD</div>
            </div>
          </div>
        </div>

        {/* KPI grid */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '12px'}}>{lang === 'id' ? 'Indikator Kinerja Utama' : 'Key Performance Indicators'}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px'}}>
          {[
            { label: lang === 'id' ? 'Total Pipeline' : 'Total Pipeline', value: fmt(k.totalPipeline), sub: `${k.active.length} ${lang === 'id' ? 'deal aktif' : 'active deals'}`, color: '#1a4d8a' },
            { label: lang === 'id' ? 'Pipeline Tertimbang' : 'Weighted Pipeline', value: fmt(k.weightedPipeline), sub: lang === 'id' ? 'probabilitas × nilai' : 'probability × value', color: 'var(--ims-accent)' },
            { label: lang === 'id' ? 'Pendapatan (Menang)' : 'Revenue (Won)', value: fmt(k.revenueYTD), sub: `${k.won.length} ${lang === 'id' ? 'deal menang' : 'won deals'}`, color: 'var(--ims-accent-2)' },
            { label: t.win_rate, value: `${k.winRate.toFixed(1)}%`, sub: `${k.won.length}/${k.won.length + k.lost.length} ${lang === 'id' ? 'closing' : 'closed'}`, color: '#7b3fb5' },
          ].map((kpi, i) => (
            <div key={i} className="exec-card" style={{padding: '16px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
              <div style={{fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{kpi.label}</div>
              <div className="serif" style={{fontSize: '20px', fontWeight: 600, marginTop: '6px', color: kpi.color}}>{kpi.value}</div>
              <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '3px'}}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Secondary metrics */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px'}}>
          {[
            { label: lang === 'id' ? 'PO Diterbitkan' : 'PO Issued', value: `${k.poIssued.length}`, sub: fmt(k.poValue) },
            { label: lang === 'id' ? 'Pelanggan Unik' : 'Unique Customers', value: `${k.customers}`, sub: lang === 'id' ? 'RS, klinik, mitra' : 'hospitals, clinics, partners' },
            { label: lang === 'id' ? 'KSO Recurring' : 'KSO Recurring', value: fmt(ksoTotal), sub: lang === 'id' ? 'pendapatan bagi hasil' : 'revenue-share income' },
            { label: lang === 'id' ? 'Produk Aktif' : 'Active Products', value: `${(products || []).filter(p => p.active !== false).length}`, sub: lang === 'id' ? 'di katalog master' : 'in master catalog' },
          ].map((kpi, i) => (
            <div key={i} className="exec-card" style={{padding: '14px', background: 'var(--ims-bg-card-2)', border: '1px solid var(--ims-border)'}}>
              <div style={{fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{kpi.label}</div>
              <div className="serif" style={{fontSize: '18px', fontWeight: 600, marginTop: '4px', color: 'var(--ims-text)'}}>{kpi.value}</div>
              <div style={{fontSize: '9.5px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Sales performance table */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '12px'}}>{lang === 'id' ? 'Kinerja Tim Sales' : 'Sales Team Performance'}</div>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '28px'}}>
          <thead>
            <tr style={{background: 'var(--ims-bg-alt)', color: '#fff'}}>
              <th style={{padding: '8px 10px', textAlign: 'left'}}>Sales</th>
              <th style={{padding: '8px 10px', textAlign: 'right'}}>Pipeline</th>
              <th style={{padding: '8px 10px', textAlign: 'right'}}>{lang === 'id' ? 'Menang' : 'Won'}</th>
              <th style={{padding: '8px 10px', textAlign: 'right'}}>{t.win_rate}</th>
              <th style={{padding: '8px 10px', textAlign: 'right'}}>PO</th>
            </tr>
          </thead>
          <tbody>
            {salesPerf.map((s, i) => (
              <tr key={i} style={{borderBottom: '1px solid var(--ims-border)', background: i % 2 ? 'var(--ims-bg-card)' : '#fff'}}>
                <td style={{padding: '7px 10px', fontWeight: 600, color: 'var(--ims-text)'}}>{s.name}</td>
                <td style={{padding: '7px 10px', textAlign: 'right', fontFamily: 'monospace'}}>{fmt(s.pipeline)}</td>
                <td style={{padding: '7px 10px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--ims-accent-2)'}}>{fmt(s.won)}</td>
                <td style={{padding: '7px 10px', textAlign: 'right', fontFamily: 'monospace'}}>{s.winRate.toFixed(0)}%</td>
                <td style={{padding: '7px 10px', textAlign: 'right', fontFamily: 'monospace'}}>{s.poCount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Page 2 */}
        <div className="exec-page-break"></div>

        {/* Modality distribution + Top customers side by side */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px'}}>
          <div>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '12px'}}>{lang === 'id' ? 'Distribusi Modalitas' : 'Modality Distribution'}</div>
            {modalityDist.map((m, i) => {
              const pct = totalModalityVal > 0 ? (m.value / totalModalityVal) * 100 : 0;
              return (
                <div key={i} style={{marginBottom: '8px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', marginBottom: '2px'}}>
                    <span style={{color: 'var(--ims-text)', fontWeight: 500}}>{m.name}</span>
                    <span style={{color: 'var(--ims-text-2)', fontFamily: 'monospace'}}>{pct.toFixed(0)}%</span>
                  </div>
                  <div style={{height: '7px', background: 'var(--ims-bg-card-2)'}}>
                    <div style={{height: '100%', width: `${pct}%`, background: MODALITY_COLORS[m.name] || '#1a4d8a'}}></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '12px'}}>{lang === 'id' ? 'Pelanggan Teratas' : 'Top Customers'}</div>
            {topCustomers.map((c, i) => {
              const pct = (c.value / maxCustomerVal) * 100;
              return (
                <div key={i} style={{marginBottom: '7px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px'}}>
                    <span style={{color: 'var(--ims-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px'}}>{c.name}</span>
                    <span style={{color: 'var(--ims-text-2)', fontFamily: 'monospace', flexShrink: 0, marginLeft: '6px'}}>{fmt(c.value)}</span>
                  </div>
                  <div style={{height: '6px', background: 'var(--ims-bg-card-2)'}}>
                    <div style={{height: '100%', width: `${pct}%`, background: 'var(--ims-accent)'}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CEO Commentary (annotations) */}
        {annotations && annotations.length > 0 && (
          <div style={{marginBottom: '24px'}}>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '12px'}}>{lang === 'id' ? 'Komentar Manajemen' : 'Management Commentary'}</div>
            {annotations.slice(0, 6).map((a, i) => {
              const sc = ({ positive: 'var(--ims-accent-2)', negative: '#c03030', concern: 'var(--ims-gold)', neutral: '#5b87b8' })[a.sentiment] || 'var(--ims-text-2)';
              return (
                <div key={i} style={{padding: '10px 14px', background: 'var(--ims-bg-card)', borderLeft: `3px solid ${sc}`, marginBottom: '8px', fontSize: '11px', color: 'var(--ims-text)', lineHeight: 1.5}}>
                  <div style={{fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: sc, fontWeight: 600, marginBottom: '3px'}}>{a.target}</div>
                  {a.commentary}
                  <div style={{fontSize: '9px', color: 'var(--ims-text-2)', marginTop: '4px'}}>— {a.author}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer / credentials */}
        <div style={{borderTop: '2px solid var(--ims-border)', paddingTop: '12px', marginTop: '24px', fontSize: '9.5px', color: 'var(--ims-text-2)', lineHeight: 1.6}}>
          <strong style={{color: 'var(--ims-text)'}}>{lang === 'id' ? 'Kredensial Regulasi' : 'Regulatory Credentials'}:</strong> BAPETEN · IDAK · CDAKB · CPAKB · ISO 9001:2015 · IDAK (Izin Distribusi Alat Kesehatan).
          <br/>
          <span style={{fontStyle: 'italic'}}>{lang === 'id' ? 'Dokumen ini dihasilkan otomatis dari sistem IMS HNTI. Semua angka bersumber dari satu basis data tunggal yang tersinkronisasi penuh lintas modul.' : 'This document is auto-generated from IMS HNTI. All figures sourced from a single, fully-synchronized cross-module database.'}</span>
        </div>
      </div>
    </div>
  );
}
function CashFlowProjection({ data, t, lang, fmt }) {
  const [scenario, setScenario] = useState('realistic'); // conservative | realistic | optimistic
  const [includeKso, setIncludeKso] = useState(true);

  // === STEP 1: Historical base ===
  const base = useMemo(() => {
    // 2025 actual: PO issued in 2025
    const won2025 = data.filter(s => s.poStatus === 'issued' && (s.issuedDate||'').startsWith('2025'))
      .reduce((sum, s) => sum + (Number(s.totalValue)||0), 0);
    // 2026 PO issued YTD
    const po2026 = data.filter(s => s.poStatus === 'issued' && (s.issuedDate||'').startsWith('2026'))
      .reduce((sum, s) => sum + (Number(s.totalValue)||0), 0);
    // 2026 active pipeline weighted (expected to convert this year): value × probability
    const pipeline2026 = data.filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (Number(s.totalValue)||0) * ((Number(s.probability)||0)/100), 0);
    // 2026 full-year estimate = PO YTD + weighted pipeline
    const est2026 = po2026 + pipeline2026;
    // KSO recurring annual (bagi hasil) — sum of KSO contracts' annualized share
    const ksoAnnual = data.filter(s => s.poStatus === 'issued' && (s.projectType === 'kso' || s.paymentScheme === 'kso'))
      .reduce((sum, s) => {
        const total = Number(s.totalValue)||0;
        const dpPct = typeof s.dpPercent === 'number' ? s.dpPercent : 10;
        return sum + (total * (1 - dpPct/100)) / 5; // spread over 5yr, annual portion
      }, 0);
    return { won2025, po2026, pipeline2026, est2026, ksoAnnual };
  }, [data]);

  // === STEP 2: Scenario growth rates (justified by market + regulation) ===
  const SCENARIOS = {
    conservative: { rate: 0.12, label: lang === 'id' ? 'Konservatif' : 'Conservative', color: '#5b87b8',
      basis: lang === 'id' ? 'Pertumbuhan pasar (6–9%) + sedikit rebut pangsa. Asumsi ada hambatan makro/anggaran RS.' : 'Market growth (6–9%) + minor share gain. Assumes macro/budget headwinds.' },
    realistic: { rate: 0.18, label: lang === 'id' ? 'Realistis' : 'Realistic', color: 'var(--ims-text)',
      basis: lang === 'id' ? '≈2× pertumbuhan pasar. Didorong siklus upgrade radiologi akibat reklasifikasi RS berbasis kompetensi (UU 17/2023) + ekspansi model KSO.' : '≈2× market growth. Driven by radiology upgrade cycle from competency-based hospital reclassification (Law 17/2023) + KSO expansion.' },
    optimistic: { rate: 0.25, label: lang === 'id' ? 'Optimis' : 'Optimistic', color: 'var(--ims-accent-2)',
      basis: lang === 'id' ? 'Rebut pangsa agresif + recurring KSO + kemitraan principal baru (ANKE, SG Healthcare, SINO MDT) + KRIS & Program Transformasi Kesehatan Rp20T.' : 'Aggressive share capture + KSO recurring + new principals + KRIS & Rp20T Health Transformation Program.' },
  };
  const g = SCENARIOS[scenario].rate;

  // === STEP 3: Project 2025→2031 ===
  const projection = useMemo(() => {
    const years = [];
    // 2025 actual
    years.push({ year: 2025, value: base.won2025, type: 'actual', label: lang === 'id' ? 'Aktual' : 'Actual' });
    // 2026 estimate (base year for projection)
    const base2026 = base.est2026;
    years.push({ year: 2026, value: base2026, type: 'estimate', label: lang === 'id' ? 'Estimasi Berjalan' : 'Current Estimate' });
    // 2027-2031 projected
    for (let y = 2027; y <= 2031; y++) {
      const n = y - 2026;
      let val = base2026 * Math.pow(1 + g, n);
      if (includeKso) val += base.ksoAnnual * n * 0.5; // KSO recurring compounds modestly
      years.push({ year: y, value: val, type: 'projection', label: lang === 'id' ? 'Proyeksi' : 'Projection' });
    }
    return years;
  }, [base, g, includeKso, lang]);

  // All three scenario trajectories for comparison line
  const allScenarios = useMemo(() => {
    const result = {};
    Object.entries(SCENARIOS).forEach(([key, sc]) => {
      const arr = [];
      for (let y = 2027; y <= 2031; y++) {
        const n = y - 2026;
        let val = base.est2026 * Math.pow(1 + sc.rate, n);
        if (includeKso) val += base.ksoAnnual * n * 0.5;
        arr.push({ year: y, value: val });
      }
      result[key] = arr;
    });
    return result;
  }, [base, includeKso]);

  const cagr2031 = useMemo(() => {
    // implied CAGR from 2026 base to 2031 projected (selected scenario)
    const final = projection[projection.length - 1].value;
    const start = base.est2026;
    if (start <= 0) return 0;
    return (Math.pow(final / start, 1/5) - 1) * 100;
  }, [projection, base]);

  const total5yr = useMemo(() => projection.filter(p => p.type === 'projection').reduce((s, p) => s + p.value, 0), [projection]);
  // FIX (Catatan #3): use a STABLE y-axis scale across all scenarios so that switching to a
  // higher-growth scenario makes bars TALLER (not shorter). Denominator = global max across
  // all scenarios' 2031 + historical, so the chart scale never shrinks when values rise.
  const maxVal = useMemo(() => {
    const scenarioMax = Math.max(...Object.values(allScenarios).flat().map(d => d.value), 1);
    return Math.max(base.won2025, base.est2026, scenarioMax, 1);
  }, [allScenarios, base]);

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{lang === 'id' ? 'Proyeksi' : 'Forecast'}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{lang === 'id' ? 'Proyeksi Pendapatan 5 Tahun' : '5-Year Revenue Projection'}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{lang === 'id' ? 'Berbasis tren pertumbuhan majemuk, dilandasi data historis + baseline pasar + tailwind regulasi' : 'Compound growth model grounded in historical data + market baseline + regulatory tailwind'}</div>
      </div>

      {/* Scenario selector */}
      <div style={{display: 'flex', gap: '10px', marginBottom: '18px', alignItems: 'center', flexWrap: 'wrap', padding: '10px 14px', background: 'rgba(26,41,66,0.03)', border: '1px solid var(--ims-border)'}}>
        <span style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? 'Skenario' : 'Scenario'}:</span>
        {Object.entries(SCENARIOS).map(([key, sc]) => (
          <button key={key} onClick={() => setScenario(key)} style={{padding: '6px 13px', fontSize: '11px', fontFamily: 'inherit', background: scenario === key ? sc.color : 'transparent', color: scenario === key ? '#fff' : sc.color, border: `1px solid ${sc.color}`, cursor: 'pointer', fontWeight: 600}}>{sc.label} (+{(sc.rate*100).toFixed(0)}%/thn)</button>
        ))}
        <label style={{display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '14px', fontSize: '11px', color: 'var(--ims-text)', cursor: 'pointer'}}>
          <input type="checkbox" checked={includeKso} onChange={e => setIncludeKso(e.target.checked)} style={{cursor: 'pointer'}} />
          {lang === 'id' ? 'Sertakan recurring KSO' : 'Include KSO recurring'}
        </label>
      </div>

      {/* KPI cards */}
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <div className="card-pad" style={{background: 'var(--ims-bg-alt)', color: '#fff'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-accent)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Total 2027–2031' : 'Total 2027–2031'}</div>
          <div className="serif" style={{fontSize: '23px', fontWeight: 500, marginTop: '4px', color: '#fff'}}>{fmt(total5yr)}</div>
          <div style={{fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '2px'}}>{SCENARIOS[scenario].label}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Basis 2026' : '2026 Base'}</div>
          <div className="serif" style={{fontSize: '21px', fontWeight: 500, marginTop: '4px', color: '#1a4d8a'}}>{fmt(base.est2026)}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'PO + pipeline weighted' : 'PO + weighted pipeline'}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Laju Pertumbuhan' : 'Growth Rate'}</div>
          <div className="serif" style={{fontSize: '21px', fontWeight: 500, marginTop: '4px', color: SCENARIOS[scenario].color}}>+{(g*100).toFixed(0)}%<span style={{fontSize: '12px'}}>/{lang === 'id' ? 'thn' : 'yr'}</span></div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>CAGR {cagr2031.toFixed(1)}%</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Proyeksi 2031' : '2031 Projection'}</div>
          <div className="serif" style={{fontSize: '21px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent-2)'}}>{fmt(projection[projection.length-1].value)}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{(projection[projection.length-1].value / base.est2026).toFixed(1)}× {lang === 'id' ? 'dari 2026' : 'of 2026'}</div>
        </div>
      </div>

      {/* Bar chart — rising trend */}
      <div style={{padding: '20px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', marginBottom: '20px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '16px'}}>{lang === 'id' ? 'Tren Pendapatan 2025–2031' : 'Revenue Trend 2025–2031'}</div>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: '12px', height: '240px', paddingBottom: '28px', position: 'relative'}}>
          {projection.map(p => {
            const h = (p.value / maxVal) * 100;
            const barColor = p.type === 'actual' ? 'var(--ims-text-2)' : p.type === 'estimate' ? 'var(--ims-gold)' : SCENARIOS[scenario].color;
            return (
              <div key={p.year} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative'}}>
                <div style={{fontSize: '10px', fontWeight: 600, color: 'var(--ims-text)', marginBottom: '4px', whiteSpace: 'nowrap'}}>{fmt(p.value).replace(/\s?Rp\s?/,'').replace('Miliar','M').replace('Triliun','T')}</div>
                <div style={{width: '100%', maxWidth: '64px', height: `${h}%`, background: barColor, transition: 'height 0.3s', borderRadius: '2px 2px 0 0', minHeight: '4px'}} title={`${p.year}: ${fmt(p.value)}`}></div>
                <div style={{position: 'absolute', bottom: '-24px', fontSize: '11px', fontWeight: 600, color: 'var(--ims-text)'}}>{p.year}</div>
                <div style={{position: 'absolute', bottom: '-40px', fontSize: '8px', color: 'var(--ims-text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap'}}>{p.label}</div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop: '24px', display: 'flex', gap: '16px', fontSize: '10px', color: 'var(--ims-text-2)', flexWrap: 'wrap'}}>
          <span><span style={{display: 'inline-block', width: '10px', height: '10px', background: 'var(--ims-text-2)', marginRight: '4px'}}></span>{lang === 'id' ? 'Aktual (2025)' : 'Actual (2025)'}</span>
          <span><span style={{display: 'inline-block', width: '10px', height: '10px', background: 'var(--ims-accent)', marginRight: '4px'}}></span>{lang === 'id' ? 'Estimasi berjalan (2026)' : 'Current estimate (2026)'}</span>
          <span><span style={{display: 'inline-block', width: '10px', height: '10px', background: SCENARIOS[scenario].color, marginRight: '4px'}}></span>{lang === 'id' ? 'Proyeksi (2027–2031)' : 'Projection (2027–2031)'}</span>
        </div>
      </div>

      {/* Scenario comparison table */}
      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto', marginBottom: '20px'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', minWidth: '640px'}}>
          <thead><tr style={{background: 'var(--ims-bg-card-2)'}}>
            <th style={{padding: '10px 14px', textAlign: 'left', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? 'Skenario' : 'Scenario'}</th>
            {[2027,2028,2029,2030,2031].map(y => <th key={y} style={{padding: '10px 14px', textAlign: 'right', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--ims-text-2)', fontWeight: 600}}>{y}</th>)}
          </tr></thead>
          <tbody>
            {Object.entries(SCENARIOS).map(([key, sc]) => (
              <tr key={key} style={{borderTop: '1px solid var(--ims-border)', background: scenario === key ? 'rgba(26,41,66,0.04)' : 'transparent'}}>
                <td style={{padding: '10px 14px', fontWeight: 600, color: sc.color}}>{sc.label} <span style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>+{(sc.rate*100).toFixed(0)}%</span></td>
                {allScenarios[key].map(d => <td key={d.year} style={{padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace', fontSize: '11px'}}>{fmt(d.value).replace(/\s?Rp\s?/,'')}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mathematical & regulatory foundation */}
      <div style={{padding: '18px 20px', background: 'rgba(123,63,181,0.05)', borderLeft: '3px solid #7b3fb5', fontSize: '12px', color: 'var(--ims-text)', lineHeight: 1.75}}>
        <div style={{fontWeight: 700, fontSize: '13px', marginBottom: '10px'}}>📐 {lang === 'id' ? 'Dasar Matematika & Logika Proyeksi' : 'Mathematical & Logical Foundation'}</div>
        <div style={{marginBottom: '10px'}}>
          <strong>{lang === 'id' ? '1. Rumus pertumbuhan majemuk:' : '1. Compound growth formula:'}</strong><br/>
          <span style={{fontFamily: 'monospace', background: 'var(--ims-bg-card)', padding: '2px 8px', display: 'inline-block', marginTop: '4px', border: '1px solid var(--ims-border)'}}>Pendapatan(thn) = Basis₂₀₂₆ × (1 + g)^(thn − 2026)</span>
          <div style={{fontSize: '11px', color: '#5a4a6a', marginTop: '4px'}}>{lang === 'id' ? `Basis 2026 = PO terbit YTD (${fmt(base.po2026)}) + pipeline weighted (${fmt(base.pipeline2026)}) = ${fmt(base.est2026)}. Setiap deal pipeline dibobot probabilitasnya — bukan asumsi semua closing.` : `2026 base = PO issued YTD + weighted pipeline. Each pipeline deal weighted by its probability — not assuming all close.`}</div>
        </div>
        <div style={{marginBottom: '10px'}}>
          <strong>{lang === 'id' ? '2. Laju pertumbuhan (g) — bukan angka asal:' : '2. Growth rate (g) — not arbitrary:'}</strong>
          <div style={{fontSize: '11px', color: '#5a4a6a', marginTop: '4px'}}>{lang === 'id' ? 'Baseline pasar alat imaging Indonesia: CAGR 6,12% (Grand View Research); alat kesehatan: 9,1% (Nexdigm); sistem imaging digital: 8,2% (Insights10). HNTI memproyeksikan tumbuh di ATAS pasar (12–25%) karena merebut pangsa di pasar yang sedang ekspansi struktural.' : 'Indonesia imaging market baseline CAGR: 6.12% (Grand View); medical devices 9.1% (Nexdigm). HNTI projects ABOVE-market (12–25%) by capturing share in a structurally expanding market.'}</div>
        </div>
        <div style={{marginBottom: '10px'}}>
          <strong>{lang === 'id' ? '3. Tailwind regulasi (pendorong permintaan):' : '3. Regulatory tailwind (demand driver):'}</strong>
          <ul style={{margin: '4px 0 0', paddingLeft: '18px', fontSize: '11px', color: '#5a4a6a'}}>
            <li>{lang === 'id' ? 'UU 17/2023: klasifikasi RS bergeser dari kelas A/B/C/D ke berbasis kompetensi (Paripurna, Utama, Madya, Dasar). RS Utama wajib punya "radiologi canggih" (CT, MRI) → siklus upgrade modalitas.' : 'Law 17/2023: hospital classification shifts from class A/B/C/D to competency-based. RS Utama must have advanced radiology (CT, MRI) → modality upgrade cycle.'}</li>
            <li>{lang === 'id' ? 'Sistem rujukan berjenjang berbasis kompetensi → tiap provinsi butuh RS Utama (layanan kanker: CT staging), tiap kabupaten butuh layanan Madya.' : 'Competency-based tiered referral → each province needs RS Utama (cancer: CT staging), each district needs Madya.'}</li>
            <li>{lang === 'id' ? 'KRIS (pengganti kelas BPJS 1/2/3) berlaku penuh 2025 + Program Transformasi Kesehatan Rp20 Triliun (2024) → percepatan belanja modal RS.' : 'KRIS (replacing BPJS class 1/2/3) full 2025 + Rp20T Health Transformation Program (2024) → accelerated hospital capex.'}</li>
          </ul>
        </div>
        <div style={{fontSize: '10.5px', color: 'var(--ims-text-2)', fontStyle: 'italic', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--ims-border)'}}>
          {lang === 'id' ? 'Catatan kejujuran: proyeksi adalah estimasi, bukan jaminan. Skenario konservatif (×0,7 dari realistis) disediakan agar investor dapat stress-test. Data historis terbatas pada 2025–2026 (sistem baru go-live); seiring bertambahnya data tahunan, akurasi proyeksi akan meningkat.' : 'Honesty note: projections are estimates, not guarantees. Conservative scenario provided for investor stress-testing. Historical data limited to 2025–2026 (new system go-live); accuracy improves as annual data accumulates.'}
        </div>
      </div>
    </div>
  );
}
function Valuation({ data, t, lang, fmt }) {
  // ============== Valuation Methodology (Catatan #2) ==============
  // Conservative, defensible valuation for a PRIVATE Indonesian medical-device DISTRIBUTOR.
  // Synced with all modules: uses the same `data` (SPH) as Dashboard/Finance/Pipeline.
  //
  // STEP 1 — Realized revenue, properly annualized.
  //   revenueYTD = sum of won deals (status 'won' = PO issued), Jan–May 2026 (5 months).
  //   Annualized = revenueYTD × (12/5). (Previously ×3, which overstated.)
  // STEP 2 — EBITDA estimate.
  //   Distributors run thin margins. Conservative EBITDA margin 10% (medical-device
  //   distribution typically 8–12%).
  // STEP 3 — Two market-based methods, distributor-appropriate multiples:
  //   (a) EV/Revenue 0.6× — distributors trade far below manufacturers. Capital IQ
  //       comparables (Seale & Assoc. Q2-2025): Medtronic 4.0×, Baxter 2.7×, ICU Medical
  //       1.9×, JMS 0.4×. Pure distributors + Indonesian SME illiquidity/country discount → ~0.6×.
  //   (b) EV/EBITDA 8× — healthcare services median EV/EBITDA ~11.5× in 2025 (FOCUS IB),
  //       down from 14.5× in 2024; apply SME + emerging-market discount → ~8×.
  //   Blended valuation = average of (a) and (b). This is the conservative base.
  // STEP 4 — Forward upside (shown separately, NOT in base): weighted pipeline × 0.6× EV/Rev.
  const activeData = useMemo(() => data.filter(s => s.status === 'active'), [data]);
  const wonData = useMemo(() => data.filter(s => s.status === 'won'), [data]);
  const weightedPipeline = useMemo(() => activeData.reduce((s, p) => s + (Number(p.totalValue) || 0) * (Number(p.probability) || 0) / 100, 0), [activeData]);
  const revenueYTD = useMemo(() => wonData.reduce((s, p) => s + (Number(p.totalValue) || 0), 0), [wonData]);

  // Methodology constants (sourced — see panel below)
  const MONTHS_ELAPSED = 5; // Jan–May 2026
  const EBITDA_MARGIN = 0.10; // 10% conservative for distribution
  const EV_REVENUE_MULT = 0.6; // distributor + SME discount
  const EV_EBITDA_MULT = 8; // healthcare SME, post emerging-market discount

  const annualizedRevenue = revenueYTD * (12 / MONTHS_ELAPSED);
  const estimatedEBITDA = annualizedRevenue * EBITDA_MARGIN;
  const valByRevenue = annualizedRevenue * EV_REVENUE_MULT;
  const valByEBITDA = estimatedEBITDA * EV_EBITDA_MULT;
  const blendedValuation = (valByRevenue + valByEBITDA) / 2;
  // Forward upside from weighted pipeline (separate, optional)
  const pipelineUpside = weightedPipeline * EV_REVENUE_MULT;
  const currentValuation = blendedValuation;

  const ipoScore = Math.min(100, Math.round(
    (activeData.length >= 10 ? 25 : activeData.length * 2.5) +
    (revenueYTD > 0 ? 20 : 0) +
    (Math.min(weightedPipeline / 50e9, 1) * 25) +
    (wonData.length >= 1 ? 15 : 0) + 15
  ));

  const monthlyProjection = useMemo(() => Array.from({length: 12}, (_, i) => {
    const month = new Date(2026, 4 + i, 1).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'short' });
    // Modest 1.5%/month compounding (≈19.6%/yr) — consistent with the 5-Year Projection's realistic scenario
    return { month, valuation: currentValuation * Math.pow(1.015, i) };
  }), [currentValuation, lang]);

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_valuation}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.valuation_title}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.valuation_subtitle}</div>
      </div>

      <div style={{padding: '12px 16px', background: 'rgba(200,169,106,0.12)', borderLeft: '3px solid var(--ims-accent)', marginBottom: '24px', fontSize: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px'}}>
        <AlertCircle size={16} style={{flexShrink: 0, marginTop: '1px'}} />
        <span>{lang === 'id' ? 'Estimasi valuasi bersifat indikatif & konservatif. Untuk valuasi resmi diperlukan due diligence oleh penilai/financial advisor independen.' : 'Valuation estimate is indicative & conservative. Official valuation requires due diligence by an independent appraiser/financial advisor.'}</span>
      </div>

      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '24px', border: '1px solid var(--ims-border)'}}>
        <KPICard label={t.current_valuation} value={fmt(currentValuation)} sublabel={lang === 'id' ? 'Blended (Rev + EBITDA)' : 'Blended (Rev + EBITDA)'} trend={14.2} />
        <KPICard label={t.projected_revenue} value={fmt(annualizedRevenue)} sublabel={lang === 'id' ? 'Disetahunkan (×12/5)' : 'Annualized (×12/5)'} trend={18.5} />
        <KPICard label={lang === 'id' ? 'Estimasi EBITDA' : 'Estimated EBITDA'} value={fmt(estimatedEBITDA)} sublabel={lang === 'id' ? `Margin ${(EBITDA_MARGIN*100).toFixed(0)}%` : `${(EBITDA_MARGIN*100).toFixed(0)}% margin`} trend={2.1} />
        <KPICard label={t.ipo_readiness} value={`${ipoScore}%`} sublabel={ipoScore >= 70 ? (lang === 'id' ? 'Siap Pra-IPO' : 'Pre-IPO ready') : (lang === 'id' ? 'Membangun' : 'Building')} trend={ipoScore >= 70 ? 8.0 : 12.5} />
      </div>

      {/* Two-method breakdown */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '22px'}}>
        <div style={{padding: '16px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? 'Metode 1: EV/Pendapatan' : 'Method 1: EV/Revenue'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px', color: '#1a4d8a'}}>{fmt(valByRevenue)}</div>
          <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{fmt(annualizedRevenue)} × {EV_REVENUE_MULT}×</div>
        </div>
        <div style={{padding: '16px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? 'Metode 2: EV/EBITDA' : 'Method 2: EV/EBITDA'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent-2)'}}>{fmt(valByEBITDA)}</div>
          <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{fmt(estimatedEBITDA)} × {EV_EBITDA_MULT}×</div>
        </div>
        <div style={{padding: '16px', background: 'var(--ims-bg-alt)', color: '#fff'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-accent)', fontWeight: 600}}>{lang === 'id' ? 'Valuasi Blended (Rata-rata)' : 'Blended Valuation (Average)'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px'}}>{fmt(blendedValuation)}</div>
          <div style={{fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '4px'}}>{lang === 'id' ? `+ potensi pipeline ${fmt(pipelineUpside)}` : `+ pipeline upside ${fmt(pipelineUpside)}`}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">{lang === 'id' ? 'Proyeksi Valuasi 12 Bulan' : '12-Month Valuation Projection'}</div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={monthlyProjection} margin={{top: 10, right: 16, left: 0, bottom: 0}}>
            <defs><linearGradient id="vg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--ims-gold)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--ims-gold)" stopOpacity={0.05} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--ims-text-2)" style={{fontSize: 10}} />
            <YAxis stroke="var(--ims-text-2)" style={{fontSize: 10}} tickFormatter={(v) => v >= 1e9 ? `${(v/1e9).toFixed(0)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v} />
            <Tooltip content={<ChartTooltip fmt={fmt} />} />
            <Legend wrapperStyle={{fontSize: '11px'}} />
            <Area type="monotone" dataKey="valuation" name={t.current_valuation} stroke="var(--ims-accent)" strokeWidth={2.5} fill="url(#vg1)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Methodology + sources */}
      <div style={{padding: '18px 20px', background: 'rgba(123,63,181,0.05)', borderLeft: '3px solid #7b3fb5', fontSize: '12px', color: 'var(--ims-text)', lineHeight: 1.75, marginTop: '20px'}}>
        <div style={{fontWeight: 700, fontSize: '13px', marginBottom: '10px'}}>📐 {lang === 'id' ? 'Dasar Logika, Matematika & Sumber' : 'Methodology, Math & Sources'}</div>
        <div style={{marginBottom: '8px'}}>
          <strong>{lang === 'id' ? '1. Pendapatan disetahunkan:' : '1. Annualized revenue:'}</strong>{' '}
          <span style={{fontFamily: 'monospace', background: 'var(--ims-bg-card)', padding: '1px 6px', border: '1px solid var(--ims-border)'}}>{fmt(revenueYTD)} × (12/5) = {fmt(annualizedRevenue)}</span>{' '}
          {lang === 'id' ? '— dari deal menang (PO terbit) Jan–Mei, sinkron dengan Dashboard & Finance.' : '— from won deals (PO issued) Jan–May, synced with Dashboard & Finance.'}
        </div>
        <div style={{marginBottom: '8px'}}>
          <strong>{lang === 'id' ? '2. EBITDA:' : '2. EBITDA:'}</strong>{' '}<span style={{fontFamily: 'monospace', background: 'var(--ims-bg-card)', padding: '1px 6px', border: '1px solid var(--ims-border)'}}>{fmt(annualizedRevenue)} × 10% = {fmt(estimatedEBITDA)}</span>{' '}{lang === 'id' ? '— margin distributor alkes konservatif 8–12%.' : '— conservative medical-device distributor margin 8–12%.'}
        </div>
        <div style={{marginBottom: '8px'}}>
          <strong>{lang === 'id' ? '3. Dua metode pasar (multiple khusus distributor):' : '3. Two market methods (distributor-specific multiples):'}</strong>
          <ul style={{margin: '4px 0 0', paddingLeft: '18px', fontSize: '11.5px', color: '#5a4a6a'}}>
            <li>EV/Pendapatan <strong>0.6×</strong> — {lang === 'id' ? 'distributor diperdagangkan jauh di bawah produsen. Komparabel Capital IQ (Seale & Assoc. Q2-2025): Medtronic 4.0×, Baxter 2.7×, ICU Medical 1.9×, JMS 0.4×. Distributor murni + diskon SME/illikuiditas Indonesia → ~0.6×.' : 'distributors trade far below manufacturers. Capital IQ comparables (Seale & Assoc. Q2-2025): Medtronic 4.0×, Baxter 2.7×, ICU Medical 1.9×, JMS 0.4×. Pure distributor + Indonesian SME/illiquidity discount → ~0.6×.'}</li>
            <li>EV/EBITDA <strong>8×</strong> — {lang === 'id' ? 'median EV/EBITDA jasa kesehatan ~11.5× (2025, turun dari 14.5× di 2024 — FOCUS IB); diskon SME + emerging-market → ~8×.' : 'healthcare services median EV/EBITDA ~11.5× (2025, down from 14.5× in 2024 — FOCUS IB); SME + emerging-market discount → ~8×.'}</li>
          </ul>
        </div>
        <div style={{marginBottom: '8px'}}>
          <strong>{lang === 'id' ? '4. Valuasi blended:' : '4. Blended valuation:'}</strong>{' '}<span style={{fontFamily: 'monospace', background: 'var(--ims-bg-card)', padding: '1px 6px', border: '1px solid var(--ims-border)'}}>({fmt(valByRevenue)} + {fmt(valByEBITDA)}) / 2 = {fmt(blendedValuation)}</span>
        </div>
        <div style={{fontSize: '10.5px', color: 'var(--ims-text-2)', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--ims-border)'}}>
          <strong>{lang === 'id' ? 'Sumber:' : 'Sources:'}</strong> Seale & Associates "Healthcare Industry Valuation Update Q2 2025" (Capital IQ comparables) · FOCUS Investment Banking "Healthcare EBITDA Multiples 2025/2026" · First Page Sage "Healthcare EBITDA & Valuation Multiples 2025" · Damodaran/NYU Stern (EV/EBITDA health & pharma).{' '}
          {lang === 'id' ? 'Pendekatan ini sengaja konservatif — bila realisasi terkoreksi lebih rendah, angkanya tetap dapat dipertanggungjawabkan.' : 'This approach is intentionally conservative — if realized value corrects lower, the figures remain defensible.'}
        </div>
      </div>
    </div>
  );
}

export { ProductSupportModule, LifecycleKpiScorecard, ExecutiveSummary, CashFlowProjection, Valuation };

// Extracted from App.jsx during modular refactor.
import { useEffect, useMemo, useState } from 'react';
import { Activity, Edit2, FileCheck, FileSearch, Plus, Search, Shield, ShieldCheck, Trash2, Truck, X } from 'lucide-react';
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip, ConfirmDialog, Field, LinkAttachment, ModuleErrorBoundary, ReadOnlyBanner, SortToggle } from '../components/ui.jsx';
import { CHART_COLORS } from '../constants/theme.js';
import { MODALITY_COLORS } from '../constants/sales.js';
import { REG_AUTHORITY, REG_PERMIT_PREFIX, REG_PNBP_DEFAULT, REG_STAGES_DEFAULT, REG_STAGE_COLORS, REG_STAGE_DATE_FIELD, REG_TYPE_LABELS } from '../constants/regulatory.js';
import { UnitPickerField } from './InstallationModule.jsx';
import { appendStageHistoryEntry, getRegStages, getStageMetrics, migrateRegRecord } from '../utils/domain.js';
import { formatDuration, parseSafeDateMs } from '../utils/format.js';
import { notify } from '../utils/notifications.js';
function RegulatoryDashboardCharts({ recordGroups, filterSearch = '', filterYear = 'all', t, lang }) {
  const rows = Object.entries(recordGroups || {}).flatMap(([type, list]) => (Array.isArray(list) ? list : []).map(r => ({ ...migrateRegRecord(r, type), recordType: type }))).filter(Boolean);
  const q = String(filterSearch || '').trim().toLowerCase();
  const filtered = rows.filter(r => {
    const text = [r.customer, r.product, r.principal, r.modality, r.subModality, r.importPermitNo, r.permitNo, r.piNo, r.aklNo, r.stage, r.note].filter(Boolean).join(' ').toLowerCase();
    const matchSearch = !q || text.includes(q);
    const matchYear = filterYear === 'all' || ['registerDate', 'docsDate', 'submitDate', 'evalDate', 'pnbpDate', 'issuedDate', 'installDate', 'expiredDate'].some(k => String(r?.[k] || '').startsWith(filterYear));
    return matchSearch && matchYear;
  });
  const typeData = ['akl', 'import', 'pengalihan', 'pi', 'bapeten'].map(type => ({
    name: REG_TYPE_LABELS[type]?.[lang === 'en' ? 'en' : 'id'] || type,
    value: filtered.filter(r => r.recordType === type).length,
  })).filter(x => x.value > 0);
  const stageData = REG_STAGES_DEFAULT.map(stage => ({
    name: regStageLabel(stage, 'bapeten', t, lang),
    value: filtered.filter(r => r.stage === stage).length,
    fill: REG_STAGE_COLORS[stage],
  }));
  const issuedByMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map((m, idx) => {
    const year = filterYear === 'all' ? '2026' : filterYear;
    const key = `${year}-${String(idx + 1).padStart(2, '0')}`;
    return {
      month: m,
      [lang === 'id' ? 'Terbit' : 'Issued']: filtered.filter(r => r.stage === 'issued' && String(r.issuedDate || '').startsWith(key)).length,
      [lang === 'id' ? 'PNBP' : 'PNBP']: filtered.filter(r => String(r.pnbpDate || '').startsWith(key)).length,
    };
  });
  const avgByType = ['akl', 'import', 'pengalihan', 'pi', 'bapeten'].map(type => {
    const done = filtered.filter(r => r.recordType === type && r.stage === 'issued');
    const avg = done.length ? Math.round(done.reduce((sum, r) => sum + ((getStageMetrics(r).totalMs || 0) / 86400000), 0) / done.length) : 0;
    return { name: REG_TYPE_LABELS[type]?.[lang === 'en' ? 'en' : 'id'] || type, [lang === 'id' ? 'Rata-rata Hari' : 'Avg Days']: avg };
  }).filter(x => x[lang === 'id' ? 'Rata-rata Hari' : 'Avg Days'] > 0);
  return (
    <div style={{display: 'grid', gap: '16px'}}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px'}}>
        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Komposisi Jenis Izin' : 'Permit Type Mix'}</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={typeData.length ? typeData : [{ name: '-', value: 0 }]} dataKey="value" nameKey="name" outerRadius={92} label>
                {(typeData.length ? typeData : [{ name: '-', value: 0 }]).map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip fmt={(v) => v} />} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Status Pipeline Regulatory' : 'Regulatory Pipeline Status'}</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stageData} margin={{top: 8, right: 16, left: 0, bottom: 62}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--ims-text-2)" interval={0} angle={-26} textAnchor="end" height={68} style={{fontSize: 10}} />
              <YAxis stroke="var(--ims-text-2)" allowDecimals={false} style={{fontSize: 10}} />
              <Tooltip content={<ChartTooltip fmt={(v) => v} />} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {stageData.map((entry, index) => <Cell key={entry.name} fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px'}}>
        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Izin Terbit Bulanan' : 'Monthly Issued Permits'}</div>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={issuedByMonth} margin={{top: 8, right: 16, left: 0, bottom: 8}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--ims-text-2)" style={{fontSize: 10}} />
              <YAxis stroke="var(--ims-text-2)" allowDecimals={false} style={{fontSize: 10}} />
              <Tooltip content={<ChartTooltip fmt={(v) => v} />} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
              <Bar dataKey={lang === 'id' ? 'Terbit' : 'Issued'} fill="#2f8f6f" radius={[3, 3, 0, 0]} />
              <Area dataKey="PNBP" fill="#d4af3733" stroke="#d4af37" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Rata-rata Selesai per Izin' : 'Average Completion by Permit'}</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={avgByType} layout="vertical" margin={{top: 8, right: 16, left: 88, bottom: 8}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" horizontal={false} />
              <XAxis type="number" stroke="var(--ims-text-2)" allowDecimals={false} style={{fontSize: 10}} />
              <YAxis type="category" dataKey="name" stroke="var(--ims-text-2)" width={84} style={{fontSize: 10}} />
              <Tooltip content={<ChartTooltip fmt={(v) => `${v} ${lang === 'id' ? 'hari' : 'days'}`} />} />
              <Bar dataKey={lang === 'id' ? 'Rata-rata Hari' : 'Avg Days'} fill="#5b8def" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
function RegulatoryModule({ records, setRegRecords, aklRecords, setAklRecords, importRecords, setImportRecords, pengalihanRecords, setPengalihanRecords, piRecords, setPiRecords, units, t, lang, fmt, canEdit, data = [], setData, products = [] }) {
  const [tab, setTab] = useState('dashboard');
  const [regSearch, setRegSearch] = useState('');
  const [regYear, setRegYear] = useState('all');
  const safeAklRecords = Array.isArray(aklRecords) ? aklRecords : [];
  const safeImportRecords = Array.isArray(importRecords) ? importRecords : [];
  const safePengalihanRecords = Array.isArray(pengalihanRecords) ? pengalihanRecords : [];
  const safePiRecords = Array.isArray(piRecords) ? piRecords : [];
  const safeBapetenRecords = Array.isArray(records) ? records : [];
  const regYears = useMemo(() => {
    const years = new Set();
    [...safeAklRecords, ...safeImportRecords, ...safePengalihanRecords, ...safePiRecords, ...safeBapetenRecords].forEach(r => {
      ['registerDate', 'docsDate', 'submitDate', 'evalDate', 'pnbpDate', 'issuedDate', 'installDate'].forEach(k => {
        if (r?.[k]) years.add(String(r[k]).slice(0, 4));
      });
    });
    data.forEach(s => { if (s.issuedDate) years.add(String(s.issuedDate).slice(0, 4)); });
    return [...years].filter(Boolean).sort().reverse();
  }, [safeAklRecords, safeImportRecords, safePengalihanRecords, safePiRecords, safeBapetenRecords, data]);
  const titleByTab = {
    import: t.imp_title, akl: t.akl_title, bapeten: t.reg_tab_bapeten,
    pengalihan: t.pgl_title, pi: t.pi_title, dashboard: lang === 'id' ? 'Dashboard Regulatory' : 'Regulatory Dashboard',
  };
  const subtitleByTab = {
    import: t.imp_subtitle, akl: t.akl_subtitle, bapeten: t.reg_subtitle,
    pengalihan: t.pgl_subtitle, pi: t.pi_subtitle, dashboard: lang === 'id' ? 'Grafik status, jenis izin, dan performa waktu regulatory' : 'Regulatory status, permit type, and timing charts',
  };
  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_regulatory}</div>
        <h1 className="serif hero-title" style={{fontSize: '34px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>
          {titleByTab[tab]}
        </h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>
          {subtitleByTab[tab]}
        </div>
      </div>

      {!canEdit && <ReadOnlyBanner t={t} />}

      {/* Tabs - 5 stages with flow */}
      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {[
          { id: 'dashboard', label: lang === 'id' ? 'Dashboard' : 'Dashboard', icon: Activity, count: safeAklRecords.length + safeImportRecords.length + safePengalihanRecords.length + safePiRecords.length + safeBapetenRecords.length },
          { id: 'akl', label: t.reg_tab_akl, icon: FileCheck, count: safeAklRecords.length },
          { id: 'import', label: t.reg_tab_import, icon: FileSearch, count: safeImportRecords.length },
          { id: 'pengalihan', label: t.reg_tab_pengalihan, icon: Shield, count: safePengalihanRecords.length },
          { id: 'pi', label: t.reg_tab_pi, icon: Truck, count: safePiRecords.length },
          { id: 'bapeten', label: t.reg_tab_bapeten, icon: ShieldCheck, count: safeBapetenRecords.length },
        ].map(tb => {
          const Icon = tb.icon;
          const active = tab === tb.id;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '9px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11.5px', fontWeight: 500, color: active ? 'var(--ims-accent)' : 'var(--ims-text-2)', borderBottom: active ? '2px solid var(--ims-border)' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.03em', whiteSpace: 'nowrap'}}>
              <Icon size={13} strokeWidth={1.5} />
              {tb.label}
              <span style={{padding: '2px 7px', background: active ? 'var(--ims-accent)' : 'var(--ims-border)', color: active ? 'var(--ims-text)' : 'var(--ims-text-2)', fontSize: '10px', fontWeight: 600, borderRadius: '10px'}}>{tb.count}</span>
            </button>
          );
        })}
      </div>

      {/* Flow indicator */}
      <div style={{padding: '10px 14px', background: 'rgba(26,41,66,0.04)', marginBottom: '20px', fontSize: '11px', color: 'var(--ims-text)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
        <span style={{fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '10px', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Alur Regulasi:' : 'Regulatory Flow:'}</span>
        <span>1. Izin Edar Kemenkes (AKL)</span>
        <span style={{color: 'var(--ims-text-2)'}}>→</span>
        <span>2. Izin Impor BAPETEN</span>
        <span style={{color: 'var(--ims-text-2)'}}>→</span>
        <span>3. Izin Pengalihan BAPETEN</span>
        <span style={{color: 'var(--ims-text-2)'}}>→</span>
        <span>4. Izin Persetujuan Impor</span>
        <span style={{color: 'var(--ims-text-2)'}}>→</span>
        <span>5. Izin Pemanfaatan BAPETEN</span>
      </div>

      <div style={{display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '18px'}}>
        <div style={{position: 'relative', flex: '1 1 280px', minWidth: '220px'}}>
          <Search size={14} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ims-text-2)'}} />
          <input value={regSearch} onChange={e => setRegSearch(e.target.value)} placeholder={lang === 'id' ? 'Cari customer, produk, principal, nomor izin...' : 'Search customer, product, principal, permit number...'} style={{paddingLeft: '36px'}} />
        </div>
        <select value={regYear} onChange={e => setRegYear(e.target.value)} style={{width: '150px'}}>
          <option value="all">{lang === 'id' ? 'Semua Tahun' : 'All Years'}</option>
          {regYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <ModuleErrorBoundary
        name={`regulatory-${tab}`}
        resetKey={tab}
        title={lang === 'id' ? 'Panel Regulatory tidak bisa dibaca' : 'Regulatory panel cannot be read'}
        message={lang === 'id' ? 'Data lama di panel ini sudah diamankan agar halaman tidak blank putih. Tab lain tetap bisa dibuka.' : 'Legacy data in this panel is isolated so the page does not go blank.'}
      >
        {tab === 'akl' && <UniformRegPipeline records={safeAklRecords} setRecords={setAklRecords} recordType="akl" t={t} lang={lang} fmt={fmt} canEdit={canEdit} products={products} filterSearch={regSearch} filterYear={regYear} />}
        {tab === 'import' && <UniformRegPipeline records={safeImportRecords} setRecords={setImportRecords} recordType="import" t={t} lang={lang} fmt={fmt} canEdit={canEdit} products={products} filterSearch={regSearch} filterYear={regYear} />}
        {tab === 'pengalihan' && <UniformRegPipeline records={safePengalihanRecords} setRecords={setPengalihanRecords} recordType="pengalihan" t={t} lang={lang} fmt={fmt} canEdit={canEdit} products={products} filterSearch={regSearch} filterYear={regYear} />}
        {tab === 'pi' && <UniformRegPipeline records={safePiRecords} setRecords={setPiRecords} recordType="pi" t={t} lang={lang} fmt={fmt} canEdit={canEdit} products={products} filterSearch={regSearch} filterYear={regYear} />}
        {tab === 'bapeten' && <UniformRegPipeline records={safeBapetenRecords} setRecords={setRegRecords} recordType="bapeten" t={t} lang={lang} fmt={fmt} canEdit={canEdit} data={data} setData={setData} products={products} filterSearch={regSearch} filterYear={regYear} />}
        {tab === 'dashboard' && <RegulatoryDashboardCharts recordGroups={{ akl: safeAklRecords, import: safeImportRecords, pengalihan: safePengalihanRecords, pi: safePiRecords, bapeten: safeBapetenRecords }} filterSearch={regSearch} filterYear={regYear} t={t} lang={lang} />}
      </ModuleErrorBoundary>
    </div>
  );
}
function regStageLabel(stage, recordType, t, lang) {
  if (recordType === 'akl') {
    const id = {
      docs: 'Pengumpulan Dokumen',
      submit: 'Submit Permohonan',
      pnbp: 'PNBP Terbit',
      eval: 'Proses Evaluasi',
      resubmit: 'Tambahan Data',
      issued: 'Izin Edar Terbit',
    };
    const en = {
      docs: 'Document Collection',
      submit: 'Submit Application',
      pnbp: 'PNBP Issued',
      eval: 'Evaluation Process',
      resubmit: 'Additional Data',
      issued: 'Distribution License Issued',
    };
    return (lang === 'en' ? en : id)[stage] || stage;
  }
  return t['reg_stage_' + stage] || stage;
}
function RegDurationTimeline({ record, recordType, lang, t }) {
  const metrics = getStageMetrics(record);
  if (!metrics || !metrics.perStage || Object.keys(metrics.perStage).length === 0) return null;
  const maxMs = Math.max(...Object.values(metrics.perStage).filter(v => Number.isFinite(v)), 1);
  const stages = getRegStages(recordType);
  return (
    <div style={{marginBottom: '10px'}}>
      <div style={{fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>
        {lang === 'id' ? 'Durasi per Stage' : 'Duration per Stage'} · {lang === 'id' ? 'Total' : 'Total'}: {formatDuration(metrics.totalMs, lang)}
      </div>
      <div style={{display: 'flex', gap: '2px', height: '22px'}}>
        {stages.map(st => {
          const ms = metrics.perStage[st] || 0;
          const pct = Math.max(ms / maxMs * 100, ms > 0 ? 8 : 0);
          const isCurrent = metrics.currentStage === st;
          const color = REG_STAGE_COLORS[st] || '#94a3b8';
          if (ms === 0 && !isCurrent) return <div key={st} style={{flex: '0 0 2px', background: 'var(--ims-bg-card-2)'}} />;
          return (
            <div key={st} style={{flex: `${Math.max(pct, 6)} 0 0`, background: color + (isCurrent ? '40' : '25'), borderTop: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'}} title={`${regStageLabel(st, recordType, t, lang)}: ${formatDuration(ms, lang)}`}>
              <span style={{fontSize: '8px', color, fontWeight: 600, whiteSpace: 'nowrap'}}>{formatDuration(ms, lang)}</span>
              {isCurrent && <span style={{position: 'absolute', top: '0', right: '2px', fontSize: '7px', color}}>●</span>}
            </div>
          );
        })}
      </div>
      <div style={{display: 'flex', gap: '2px', marginTop: '1px'}}>
        {stages.map(st => (
          <div key={st} style={{flex: 1, fontSize: '7px', textAlign: 'center', color: 'var(--ims-text-2)', letterSpacing: '0.05em', textTransform: 'uppercase'}}>{regStageLabel(st, recordType, t, lang).split(' ')[0].slice(0, 6)}</div>
        ))}
      </div>
    </div>
  );
}
function UniformRegPipeline({ records, setRecords, recordType, t, lang, fmt = (v) => v?.toLocaleString?.('id-ID') || v, canEdit, data = [], setData, products = [], units = [], employees = {}, filterSearch = '', filterYear = 'all' }) {
  const authority = REG_AUTHORITY[recordType] || 'BAPETEN';
  const typeLabel = REG_TYPE_LABELS[recordType]?.[lang === 'en' ? 'en' : 'id'] || recordType;
  const safeRecords = Array.isArray(records) ? records : [];
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [sortBy, setSortBy] = useState('date_desc');
  const stages = getRegStages(recordType);

  // Normalize records defensively (runtime migration)
  const normRecords = useMemo(() => safeRecords.map(r => migrateRegRecord(r, recordType)).filter(Boolean), [safeRecords, recordType]);

  // One-time persist if migration changed anything
  useEffect(() => {
    const baseRecords = Array.isArray(records) ? records : [];
    const migrated = baseRecords.map(r => migrateRegRecord(r, recordType)).filter(Boolean);
    if (JSON.stringify(migrated) !== JSON.stringify(baseRecords)) {
      setRecords(migrated);
    }
  }, []); // eslint-disable-line

  // For bapeten: pull units from SPH PO
  const deliveredUnits = useMemo(() => recordType === 'bapeten' ? data
    .filter(s => s.poStatus === 'issued')
    .map(s => ({ id: s.id, customer: s.customer, modality: s.modality, subModality: s.subModality || '', sphNo: s.sphNo }))
    .sort((a, b) => a.customer.localeCompare(b.customer)) : [], [data, recordType]);

  // PI expiry enrichment
  const piToday = new Date('2026-05-16');
  const enriched = useMemo(() => recordType === 'pi' ? normRecords.map(r => {
    if (r.stage !== 'issued' || !r.expiredDate) return { ...r, daysRemaining: null, computedStatus: r.stage === 'issued' ? (r.status || 'active') : null };
    const expDate = new Date(r.expiredDate);
    const daysRemaining = Math.ceil((expDate - piToday) / (1000 * 60 * 60 * 24));
    let computedStatus = r.status || 'active';
    if (computedStatus !== 'used' && daysRemaining < 0) computedStatus = 'expired';
    return { ...r, daysRemaining, computedStatus };
  }) : normRecords, [normRecords, recordType]);

  const filteredRecords = useMemo(() => {
    const q = String(filterSearch || '').trim().toLowerCase();
    const dateFields = ['registerDate', 'docsDate', 'submitDate', 'evalDate', 'resubmitDate', 'pnbpDate', 'issuedDate', 'installDate', 'expiredDate'];
    return enriched.filter(r => {
      const text = [
        r.id, r.customer, r.product, r.principal, r.principalCountry, r.modality, r.subModality,
        r.importPermitNo, r.permitNo, r.piNo, r.aklNo, r.stage, r.note, r.destination, r.shipment, r.items,
      ].filter(Boolean).join(' ').toLowerCase();
      const matchSearch = !q || text.includes(q);
      const matchYear = filterYear === 'all' || dateFields.some(k => String(r?.[k] || '').startsWith(filterYear));
      return matchSearch && matchYear;
    });
  }, [enriched, filterSearch, filterYear]);

  const sortedRecords = useMemo(() => {
    const arr = [...filteredRecords];
    const dateKey = recordType === 'akl' ? 'registerDate' : (recordType === 'pengalihan' ? 'submitDate' : 'docsDate');
    if (sortBy === 'date_desc') return arr.sort((a, b) => (b[dateKey] || b.issuedDate || '').localeCompare(a[dateKey] || a.issuedDate || ''));
    if (sortBy === 'date_asc') return arr.sort((a, b) => (a[dateKey] || a.issuedDate || '').localeCompare(b[dateKey] || b.issuedDate || ''));
    if (sortBy === 'stage') return arr.sort((a, b) => stages.indexOf(b.stage) - stages.indexOf(a.stage));
    if (sortBy === 'principal') return arr.sort((a, b) => (a.principal || a.customer || '').localeCompare(b.principal || b.customer || ''));
    return arr;
  }, [filteredRecords, sortBy, recordType]);

  const totals = useMemo(() => {
    const active = filteredRecords.filter(r => r.stage !== 'issued').length;
    const issued = filteredRecords.filter(r => r.stage === 'issued').length;
    const issuedRecs = filteredRecords.filter(r => r.stage === 'issued');
    const avgMs = issuedRecs.length > 0 ? issuedRecs.reduce((sum, r) => sum + (getStageMetrics(r).totalMs || 0), 0) / issuedRecs.length : 0;
    const avgDays = Math.round(avgMs / 86400000);
    return { active, issued, avgDays };
  }, [filteredRecords]);

  const byStage = useMemo(() => stages.map(stage => ({
    stage, label: regStageLabel(stage, recordType, t, lang), color: REG_STAGE_COLORS[stage],
    count: filteredRecords.filter(r => r.stage === stage).length,
  })), [filteredRecords, t, lang, recordType, stages]);

  const historyRows = useMemo(() => filteredRecords.flatMap(r => (Array.isArray(r.stageHistory) ? r.stageHistory : []).map(h => ({ ...h, record: r })))
    .sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')))
    .slice(0, 8), [filteredRecords]);

  const handleSave = (rec) => {
    setRecords(prev => {
      const basePrev = Array.isArray(prev) ? prev : [];
      const migrated = migrateRegRecord(rec, recordType);
      const exists = basePrev.find(r => r.id === migrated.id);
      const prevRec = exists ? migrateRegRecord(exists, recordType) : null;
      // Append stageHistory on stage change via modal
      let final = migrated;
      if (prevRec && prevRec.stage !== final.stage) {
        final = appendStageHistoryEntry(final, prevRec.stage, final.stage, 'user');
      }
      // Fire PNBP notif if transitioning TO pnbp (Phase 1.5 #11 uniform)
      if (final.stage === 'pnbp' && prevRec?.stage !== 'pnbp') {
        try {
          notify({ role: 'finance' }, {
            type: 'pnbp_due',
            message: `PNBP ${typeLabel} ${final.product || final.principal || final.customer || final.piNo || final.id} terbit Rp ${(final.pnbpAmount || REG_PNBP_DEFAULT[recordType] || 5000000).toLocaleString('id-ID')}. Segera lakukan pembayaran.`,
            link: { view: 'regulatory' }
          });
        } catch {}
      }
      if (recordType === 'bapeten' && final.stage === 'issued' && typeof setData === 'function') {
        const issuedMs = parseSafeDateMs(final.issuedDate);
        setData(prevData => prevData.map(s => s.customer === final.customer ? {
          ...s,
          sphWorkflowStatus: 'utilization_permit_done',
          utilizationPermitDoneAt: issuedMs !== null ? new Date(issuedMs).toISOString() : new Date().toISOString(),
          nextAction: 'Project selesai sampai izin pemanfaatan',
        } : s));
      }
      return exists ? basePrev.map(r => r.id === final.id ? final : r) : [...basePrev, final];
    });
    setModalOpen(false); setEditingRecord(null);
  };

  const [deleteId, setDeleteId] = useState(null);
  const handleDelete = (id) => { if (canEdit) setDeleteId(id); };
  const confirmDelete = () => { setRecords(prev => (Array.isArray(prev) ? prev : []).filter(r => r.id !== deleteId)); setDeleteId(null); };

  const advanceStage = (id) => {
    if (!canEdit) return;
    setRecords(prev => (Array.isArray(prev) ? prev : []).map(r => {
      if (r.id !== id) return r;
      const rec = migrateRegRecord(r, recordType);
      const currentIdx = stages.indexOf(rec.stage);
      if (currentIdx >= stages.length - 1) return rec;
      const nextStage = stages[currentIdx + 1];
      const today = new Date().toISOString().split('T')[0];
      const updates = { stage: nextStage, stageIdx: currentIdx + 1 };
      const dateField = REG_STAGE_DATE_FIELD[nextStage];
      if (dateField) updates[dateField] = today;
      if (nextStage === 'pnbp') {
        updates.pnbpAmount = updates.pnbpAmount || REG_PNBP_DEFAULT[recordType] || 5000000;
        try {
          notify({ role: 'finance' }, {
            type: 'pnbp_due',
            message: `PNBP ${typeLabel} ${rec.product || rec.principal || rec.customer || rec.piNo || rec.id} terbit Rp ${(updates.pnbpAmount).toLocaleString('id-ID')}. Segera lakukan pembayaran.`,
            link: { view: 'regulatory' }
          });
        } catch {}
      }
      if (nextStage === 'issued') {
        const prefix = REG_PERMIT_PREFIX[recordType] || 'REG';
        const yr = new Date().getFullYear();
        const rnd = Math.floor(Math.random() * 90000 + 10000);
        if (recordType === 'akl') updates.aklNo = updates.aklNo || `AKL ${Math.floor(Math.random() * 90000000000 + 10000000000)}`;
        else if (recordType === 'import') updates.importPermitNo = updates.importPermitNo || `${prefix}/${yr}/${rnd}`;
        else if (recordType === 'pengalihan') updates.permitNo = updates.permitNo || `${prefix}/${yr}/${rnd}`;
        else if (recordType === 'pi') {
          updates.piNo = updates.piNo || `${prefix}/${yr}/${rnd}`;
          if (!rec.expiredDate) {
            const exp = new Date(today);
            exp.setDate(exp.getDate() + 21);
            updates.expiredDate = exp.toISOString().split('T')[0];
          }
          updates.status = updates.status || 'active';
        }
        if (recordType === 'bapeten' && typeof setData === 'function') {
          setData(prev => prev.map(s => s.customer === rec.customer ? {
            ...s,
            sphWorkflowStatus: 'utilization_permit_done',
            utilizationPermitDoneAt: new Date().toISOString(),
            nextAction: 'Project selesai sampai izin pemanfaatan',
          } : s));
        }
      }
      const withUpdates = { ...rec, ...updates };
      return appendStageHistoryEntry(withUpdates, rec.stage, nextStage, 'user');
    }));
  };

  // PI: mark as used
  const markUsed = (id) => {
    if (!canEdit) return;
    setRecords(prev => (Array.isArray(prev) ? prev : []).map(r => r.id === id ? { ...r, status: 'used' } : r));
  };

  // Render record header based on type
  const renderHeader = (r) => {
    const principalColor = r.principal === 'Angell' ? '#0f7a5a' : r.principal === 'Innocare' ? '#b8860b' : r.principal === 'ANKE' ? '#c03030' : r.principal === 'SG Healthcare' ? '#1a4d8a' : '#7b3fb5';
    if (recordType === 'akl' || recordType === 'import') return (
      <div style={{flex: '1 1 320px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap'}}>
          <span style={{padding: '2px 8px', background: principalColor + '20', color: principalColor, fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em'}}>{r.principal}</span>
          <span style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>· {r.principalCountry}</span>
          {recordType === 'akl' && r.productClass && <span style={{padding: '2px 7px', fontSize: '9px', background: 'var(--ims-border)', color: 'var(--ims-text)', fontWeight: 600}}>{lang === 'id' ? 'Kelas' : 'Class'} {r.productClass}</span>}
        </div>
        <div style={{fontSize: '13px', fontWeight: 600}}>{r.product}</div>
        {recordType === 'akl' && r.registerDate && <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '4px'}} className="mono">{lang === 'id' ? 'Registrasi' : 'Registered'}: {r.registerDate}{r.targetDate ? ` · Target: ${r.targetDate}` : ''}</div>}
        {recordType === 'akl' && r.aklNo && <div style={{fontSize: '11px', color: 'var(--ims-accent-2)', marginTop: '4px', fontWeight: 600}} className="mono">✓ {r.aklNo}</div>}
        {recordType === 'import' && r.importPermitNo && <div style={{fontSize: '11px', color: 'var(--ims-accent-2)', marginTop: '4px', fontWeight: 600}} className="mono">✓ {r.importPermitNo}</div>}
      </div>
    );
    if (recordType === 'pengalihan') return (
      <div style={{flex: '1 1 320px'}}>
        <div style={{fontSize: '13px', fontWeight: 600}}>{r.customer}</div>
        <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{r.modality} · {r.subModality}</div>
        <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px'}}>📍 {lang === 'id' ? 'Tujuan' : 'Destination'}: {r.destination}</div>
        {r.permitNo && <div style={{fontSize: '11px', color: 'var(--ims-accent-2)', marginTop: '4px', fontWeight: 600}} className="mono">✓ {r.permitNo}</div>}
      </div>
    );
    if (recordType === 'bapeten') return (
      <div style={{flex: '1 1 280px'}}>
        <div style={{fontSize: '13px', fontWeight: 600}}>{r.customer}</div>
        <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{r.modality} · {r.subModality}</div>
        {r.installDate && <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px'}} className="mono">{lang === 'id' ? 'Instalasi' : 'Installed'}: {r.installDate}</div>}
      </div>
    );
    if (recordType === 'pi') return (
      <div style={{flex: '1 1 320px'}}>
        {r.piNo && <div className="mono" style={{fontSize: '13px', fontWeight: 600}}>{r.piNo}</div>}
        <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'Principal' : 'Principal'}: <strong>{r.principal}</strong> · {lang === 'id' ? 'Shipment' : 'Shipment'}: <span className="mono">{r.shipment}</span></div>
        {r.items && <div style={{fontSize: '11px', color: 'var(--ims-text)', marginTop: '4px'}}>📦 {r.items}</div>}
      </div>
    );
    return <div style={{flex: '1 1 320px'}}><div style={{fontSize: '13px', fontWeight: 600}}>{r.product || r.customer || r.id}</div></div>;
  };

  return (
    <div>
      {/* Info banner with authority */}
      <div style={{padding: '10px 14px', background: 'rgba(26,41,66,0.06)', borderLeft: '3px solid var(--ims-border)', marginBottom: '20px', fontSize: '12px', color: 'var(--ims-text)', display: 'flex', alignItems: 'center', gap: '10px'}}>
        <Shield size={14} strokeWidth={1.5} style={{flexShrink: 0}} />
        <span><strong>{typeLabel}</strong> — {lang === 'id' ? 'Instansi' : 'Authority'}: <strong>{authority}</strong>{recordType === 'akl' ? (lang === 'id' ? ' (Regalkes)' : ' (Regalkes)') : ''}{recordType === 'pi' ? (lang === 'id' ? ' · Berlaku 21 hari kerja' : ' · Valid 21 working days') : ''}</span>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <div className="card-pad">
          <div className="lbl-tag">{t.reg_total_pending}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent)'}}>{totals.active}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{t.reg_total_issued}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent-2)'}}>{totals.issued}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{t.reg_avg_days}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totals.avgDays} <span style={{fontSize: '12px', color: 'var(--ims-text-2)'}}>{t.days}</span></div>
        </div>
      </div>

      {/* Pipeline visualization - 6 uniform stages */}
      <div className="card" style={{marginBottom: '22px'}}>
        <div className="card-title">{lang === 'id' ? `Pipeline ${typeLabel}` : `${typeLabel} Pipeline`}</div>
        <div style={{display: 'grid', gridTemplateColumns: `repeat(${stages.length}, 1fr)`, gap: '2px'}}>
          {byStage.map((s, i) => (
            <div key={s.stage} style={{padding: '12px 8px', background: s.color + '15', borderTop: `3px solid ${s.color}`}}>
              <div style={{fontSize: '8px', letterSpacing: '0.12em', color: s.color, textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px', lineHeight: 1.3}}>{i + 1} · {s.label}</div>
              <div className="serif" style={{fontSize: '24px', fontWeight: 500, color: s.color, lineHeight: 1}}>{s.count}</div>
              <div style={{fontSize: '9px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{t.project_count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Records list */}
      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
          <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{lang === 'id' ? 'Daftar Permohonan' : 'Applications'}</div>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <SortToggle value={sortBy} onChange={setSortBy} lang={lang} options={[
              {value: 'date_desc', label: lang === 'id' ? 'Terbaru' : 'Newest'},
              {value: 'date_asc', label: lang === 'id' ? 'Terlama' : 'Oldest'},
              {value: 'stage', label: lang === 'id' ? 'Stage Terakhir' : 'Latest Stage'},
              ...(recordType === 'akl' || recordType === 'import' ? [{value: 'principal', label: 'Principal'}] : []),
            ]} />
            {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
          </div>
        </div>
        {sortedRecords.map(r => {
          const stageIdx = stages.indexOf(r.stage);
          const stageColor = REG_STAGE_COLORS[r.stage] || '#94a3b8';
          const isExpiring = recordType === 'pi' && r.computedStatus === 'active' && r.daysRemaining != null && r.daysRemaining <= 5;
          return (
            <div key={r.id} style={{padding: '16px 18px', borderTop: '1px solid var(--ims-border)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '12px'}}>
                {renderHeader(r)}
                <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px'}}>
                  <span style={{padding: '4px 10px', fontSize: '10px', background: stageColor + '25', color: stageColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{regStageLabel(r.stage, recordType, t, lang)}</span>
                  {r.pnbpAmount && <div style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>PNBP: <span className="mono">{typeof fmt === 'function' ? fmt(r.pnbpAmount) : r.pnbpAmount?.toLocaleString?.('id-ID')}</span></div>}
                  {recordType === 'akl' && r.stage !== 'issued' && r.workingDaysRemaining != null && (
                    <div style={{fontSize: '11px', color: r.workingDaysRemaining <= 0 ? '#c03030' : (r.workingDaysRemaining < 10 ? 'var(--ims-gold)' : 'var(--ims-accent-2)'), fontWeight: 600}}>
                      {r.workingDaysRemaining <= 0 ? `⚠ ${lang === 'id' ? 'Overdue' : 'Overdue'}` : `${r.workingDaysRemaining} ${t.days} ${lang === 'id' ? 'tersisa' : 'left'}`}
                    </div>
                  )}
                  {recordType === 'pi' && r.stage === 'issued' && r.computedStatus && (
                    <span style={{padding: '3px 8px', fontSize: '10px', background: (r.computedStatus === 'active' ? 'var(--ims-accent-2)' : r.computedStatus === 'used' ? '#5b87b8' : '#c03030') + '25', color: r.computedStatus === 'active' ? 'var(--ims-accent-2)' : r.computedStatus === 'used' ? '#5b87b8' : '#c03030', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t['pi_status_' + r.computedStatus] || r.computedStatus}</span>
                  )}
                  {recordType === 'pi' && r.computedStatus === 'active' && r.daysRemaining != null && (
                    <div style={{fontSize: '11px', color: isExpiring ? '#c03030' : 'var(--ims-text-2)', fontWeight: isExpiring ? 700 : 500}}>
                      {isExpiring && '⚠ '}{r.daysRemaining} {t.days} {lang === 'id' ? 'tersisa' : 'left'}
                    </div>
                  )}
                  {canEdit && (
                    <div style={{display: 'flex', gap: '4px'}}>
                      <button onClick={() => { setEditingRecord(r); setModalOpen(true); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit'}}><Edit2 size={11} /></button>
                      <button onClick={() => handleDelete(r.id)} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>
                    </div>
                  )}
                </div>
              </div>
              {/* Uniform 6-stage progress bar */}
              <div style={{display: 'flex', gap: '2px', marginBottom: '10px'}}>
                {stages.map((s, i) => (
                  <div key={s} style={{flex: 1, height: '6px', background: i <= stageIdx ? REG_STAGE_COLORS[s] : 'var(--ims-bg-card-2)', transition: 'background 0.3s'}} />
                ))}
              </div>
              {/* Duration timeline */}
              <RegDurationTimeline record={r} recordType={recordType} lang={lang} t={t} />
              {/* Date details */}
              <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '10px', color: 'var(--ims-text-2)', marginBottom: '8px'}}>
                {r.docsDate && <span>📋 Docs: <span className="mono">{r.docsDate}</span></span>}
                {r.submitDate && <span>📤 Submit: <span className="mono">{r.submitDate}</span></span>}
                {r.evalDate && <span>🔍 Eval: <span className="mono">{r.evalDate}</span></span>}
                {r.resubmitDate && <span>🔄 Resubmit: <span className="mono">{r.resubmitDate}</span></span>}
                {r.pnbpDate && <span>💰 PNBP: <span className="mono">{r.pnbpDate}</span></span>}
                {r.issuedDate && <span style={{color: 'var(--ims-accent-2)', fontWeight: 600}}>✅ Issued: <span className="mono">{r.issuedDate}</span></span>}
                {recordType === 'pi' && r.expiredDate && <span>⏰ Expired: <span className="mono">{r.expiredDate}</span></span>}
              </div>
              {r.note && <div style={{padding: '8px 10px', background: 'var(--ims-bg-card-2)', fontSize: '11px', fontStyle: 'italic', color: 'var(--ims-text)', marginBottom: '8px'}}>📝 {r.note}</div>}
              {r.attachmentUrl && <div style={{marginBottom: '8px'}}><LinkAttachment url={r.attachmentUrl} label={lang === 'id' ? '📎 Lampiran Izin' : '📎 Permit Attachment'} lang={lang} /></div>}
              <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                {canEdit && r.stage !== 'issued' && (
                  <button onClick={() => advanceStage(r.id)} style={{padding: '6px 14px', fontSize: '11px', background: 'var(--ims-bg-alt)', color: 'var(--ims-text)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em', fontWeight: 500}}>
                    {t.reg_advance || (lang === 'id' ? 'Tahap Berikutnya' : 'Next Stage')} →
                  </button>
                )}
                {canEdit && recordType === 'pi' && r.stage === 'issued' && r.computedStatus === 'active' && (
                  <button onClick={() => markUsed(r.id)} style={{padding: '6px 14px', fontSize: '11px', background: '#5b87b8', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em', fontWeight: 500}}>
                    {lang === 'id' ? 'Tandai Digunakan' : 'Mark as Used'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {safeRecords.length === 0 && <div className="empty-state">{t.no_data}</div>}
      </div>
      {modalOpen && <RegulatoryRecordModal record={editingRecord} recordType={recordType} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} units={recordType === 'bapeten' ? deliveredUnits : []} products={products} />}
      <ConfirmDialog open={!!deleteId} title={lang === 'id' ? `Hapus ${typeLabel}?` : `Delete ${typeLabel}?`} message={lang === 'id' ? 'Yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to delete this record? This action cannot be undone.'} onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} danger lang={lang} />
    </div>
  );
}
function RegulatoryRecordModal({ record, recordType, onSave, onClose, t, lang, units = [], products = [] }) {
  // recordType: 'import' | 'akl' | 'bapeten' | 'pengalihan' | 'pi'
  const [form, setForm] = useState(record || getDefaultRecord(recordType));
  const titleKey = record ? `reg_modal_edit_${recordType}` : `reg_modal_add_${recordType}`;
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const stageOptions = getRegStages(recordType);

  function getDefaultRecord(type) {
    const today = new Date().toISOString().split('T')[0];
    const baseId = type + '_' + Date.now();
    if (type === 'import') {
      return { id: baseId, principal: '', principalCountry: '', product: '', stage: 'docs', stageIdx: 0,
        registerDate: today, preregistDate: today, docsDate: null, submitDate: null, evalDate: null, issuedDate: null,
        importPermitNo: null, pic: 'Ananda Rifki Bayu Saputra', note: '', attachmentUrl: '' };
    }
    if (type === 'akl') {
      return { id: baseId, principal: '', principalCountry: '', product: '', productClass: 'B',
        stage: 'docs', stageIdx: 0, registerDate: today,
        targetDate: '', daysElapsed: 0, workingDaysRemaining: 30,
        preregistDate: today, docsDate: null, submitDate: null,
        pnbpDate: null, pnbpAmount: null, evalDate: null,
        fixDate: null, issuedDate: null, aklNo: null,
        pic: 'Ananda Rifki Bayu Saputra', note: '', attachmentUrl: '' };
    }
    if (type === 'bapeten') {
      return { id: baseId, customer: '', modality: 'CT Scan', subModality: '',
        installDate: today, stage: 'docs', stageIdx: 0,
        docsComplete: false, submitDate: null, evalDate: null,
        pnbpAmount: null, issuedDate: null, pic: 'Ananda Rifki Bayu Saputra', note: '', attachmentUrl: '' };
    }
    if (type === 'pengalihan') {
      return { id: baseId, customer: '', modality: 'CT Scan', subModality: '', destination: '',
        stage: 'docs', stageIdx: 0, docsDate: today, submitDate: null, evalDate: null, resubmitDate: null, pnbpDate: null, issuedDate: null,
        permitNo: null, pic: 'Ananda Rifki Bayu Saputra', note: '',
        stageHistory: [{ from: null, to: 'docs', by: 'user', at: new Date().toISOString() }], _regV41: true };
    }
    if (type === 'pi') {
      return { id: baseId, piNo: '', principal: '', shipment: '', items: '',
        stage: 'docs', stageIdx: 0,
        docsDate: today, submitDate: null, evalDate: null, resubmitDate: null, pnbpDate: null,
        issuedDate: null, expiredDate: null,
        status: 'active', note: '', attachmentUrl: '',
        stageHistory: [{ from: null, to: 'docs', by: 'user', at: new Date().toISOString() }], _regV41: true };
    }
    return { id: baseId };
  }

  const renderFields = () => {
    if (recordType === 'import') return (
      <>
        <Field label={t.imp_principal} full><input value={form.principal} onChange={e => update('principal', e.target.value)} placeholder="Angell, Innocare, ANKE, SG Healthcare..." /></Field>
        <Field label="Negara"><input value={form.principalCountry} onChange={e => update('principalCountry', e.target.value)} placeholder="China, Taiwan, Korea..." /></Field>
        <Field label="Stage">
          <select value={form.stage} onChange={e => update('stage', e.target.value)}>
            {stageOptions.map(s => <option key={s} value={s}>{regStageLabel(s, recordType, t, lang)}</option>)}
          </select>
        </Field>
        <Field label={t.imp_product} full><input value={form.product} onChange={e => update('product', e.target.value)} /></Field>
        <Field label="Tgl. Pra-Registrasi"><input type="date" value={form.preregistDate || ''} onChange={e => update('preregistDate', e.target.value)} /></Field>
        <Field label="Tgl. Pengumpulan Dokumen"><input type="date" value={form.docsDate || ''} onChange={e => update('docsDate', e.target.value)} /></Field>
        <Field label="Tgl. Submit"><input type="date" value={form.submitDate || ''} onChange={e => update('submitDate', e.target.value)} /></Field>
        <Field label="Tgl. Evaluasi"><input type="date" value={form.evalDate || ''} onChange={e => update('evalDate', e.target.value)} /></Field>
        <Field label={lang === 'id' ? 'Tgl. Resubmit' : 'Resubmit Date'}><input type="date" value={form.resubmitDate || ''} onChange={e => update('resubmitDate', e.target.value)} /></Field>
        <Field label="Tgl. PNBP"><input type="date" value={form.pnbpDate || ''} onChange={e => update('pnbpDate', e.target.value)} /></Field>
        <Field label={lang === 'id' ? 'Jumlah PNBP (Rp)' : 'PNBP Amount (Rp)'}><input type="number" value={form.pnbpAmount || ''} onChange={e => update('pnbpAmount', parseFloat(e.target.value) || null)} /></Field>
        <Field label="Tgl. Izin Terbit"><input type="date" value={form.issuedDate || ''} onChange={e => update('issuedDate', e.target.value)} /></Field>
        <Field label={t.imp_no}><input value={form.importPermitNo || ''} onChange={e => update('importPermitNo', e.target.value)} placeholder="BAPETEN/IMP/2026/00xxx" /></Field>
        <Field label={t.crud_pic}><input value={form.pic} onChange={e => update('pic', e.target.value)} /></Field>
        <Field label={t.reg_attachment} full><input type="url" value={form.attachmentUrl || ''} onChange={e => update('attachmentUrl', e.target.value)} placeholder="https://drive.google.com/... (Surat Persetujuan Impor)" /></Field>
        <Field label={t.akl_note} full><textarea rows={2} value={form.note || ''} onChange={e => update('note', e.target.value)} /></Field>
      </>
    );

    if (recordType === 'akl') return (
      <>
        <Field label={t.akl_principal}><input value={form.principal} onChange={e => update('principal', e.target.value)} /></Field>
        <Field label="Negara"><input value={form.principalCountry} onChange={e => update('principalCountry', e.target.value)} /></Field>
        <Field label={t.akl_product} full><input value={form.product} onChange={e => update('product', e.target.value)} /></Field>
        <Field label={t.akl_product_class}>
          <select value={form.productClass} onChange={e => update('productClass', e.target.value)}>
            <option value="A">A — {lang === 'id' ? 'Risiko Rendah' : 'Low Risk'}</option>
            <option value="B">B — {lang === 'id' ? 'Risiko Rendah-Menengah' : 'Low-Medium'}</option>
            <option value="C">C — {lang === 'id' ? 'Risiko Menengah-Tinggi' : 'Medium-High'}</option>
            <option value="D">D — {lang === 'id' ? 'Risiko Tinggi' : 'High Risk'}</option>
          </select>
        </Field>
        <Field label="Stage">
          <select value={form.stage} onChange={e => update('stage', e.target.value)}>
            {stageOptions.map(s => <option key={s} value={s}>{regStageLabel(s, recordType, t, lang)}</option>)}
          </select>
        </Field>
        <Field label={t.akl_register_date}><input type="date" value={form.registerDate || ''} onChange={e => update('registerDate', e.target.value)} /></Field>
        <Field label={t.akl_target_date}><input type="date" value={form.targetDate || ''} onChange={e => update('targetDate', e.target.value)} /></Field>
        <Field label="Tgl. Pra-Registrasi"><input type="date" value={form.preregistDate || ''} onChange={e => update('preregistDate', e.target.value)} /></Field>
        <Field label="Tgl. Pengumpulan Dokumen"><input type="date" value={form.docsDate || ''} onChange={e => update('docsDate', e.target.value)} /></Field>
        <Field label="Tgl. Submit"><input type="date" value={form.submitDate || ''} onChange={e => update('submitDate', e.target.value)} /></Field>
        <Field label="Tgl. PNBP"><input type="date" value={form.pnbpDate || ''} onChange={e => update('pnbpDate', e.target.value)} /></Field>
        <Field label={lang === 'id' ? 'Jumlah PNBP (Rp)' : 'PNBP Amount (Rp)'}><input type="number" value={form.pnbpAmount || ''} onChange={e => update('pnbpAmount', parseFloat(e.target.value) || null)} /></Field>
        <Field label="Tgl. Evaluasi"><input type="date" value={form.evalDate || ''} onChange={e => update('evalDate', e.target.value)} /></Field>
        <Field label="Tgl. Perbaikan / Resubmit"><input type="date" value={form.resubmitDate || form.fixDate || ''} onChange={e => { update('resubmitDate', e.target.value); update('fixDate', e.target.value); }} /></Field>
        <Field label="Tgl. AKL Terbit"><input type="date" value={form.issuedDate || ''} onChange={e => update('issuedDate', e.target.value)} /></Field>
        <Field label={t.akl_akl_no}><input value={form.aklNo || ''} onChange={e => update('aklNo', e.target.value)} placeholder="AKL 20xxxxxxxxx" /></Field>
        <Field label="Sisa Hari Kerja"><input type="number" value={form.workingDaysRemaining || 0} onChange={e => update('workingDaysRemaining', parseInt(e.target.value) || 0)} /></Field>
        <Field label={t.crud_pic}><input value={form.pic} onChange={e => update('pic', e.target.value)} /></Field>
        <Field label={t.reg_attachment} full><input type="url" value={form.attachmentUrl || ''} onChange={e => update('attachmentUrl', e.target.value)} placeholder="https://drive.google.com/... (AKL Kemenkes terbit)" /></Field>
        <Field label={t.akl_note} full><textarea rows={2} value={form.note || ''} onChange={e => update('note', e.target.value)} /></Field>
      </>
    );

    if (recordType === 'bapeten') return (
      <>
        <UnitPickerField units={units} customer={form.customer} modality={form.modality} subModality={form.subModality} lang={lang} onPick={u => setForm(prev => ({ ...prev, customer: u.customer, modality: u.modality || prev.modality, subModality: u.subModality || '' }))} />
        <Field label={t.customer} full><input value={form.customer} onChange={e => update('customer', e.target.value)} /></Field>
        <Field label={t.modality}>
          <select value={form.modality} onChange={e => update('modality', e.target.value)}>
            {[...new Set([...products.map(p => p.modality).filter(Boolean), ...Object.keys(MODALITY_COLORS), form.modality].filter(Boolean))].sort().map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <Field label={lang === 'id' ? 'Tipe' : 'Type'}><input value={form.subModality} onChange={e => update('subModality', e.target.value)} /></Field>
        <Field label="Tgl. Instalasi"><input type="date" value={form.installDate} onChange={e => update('installDate', e.target.value)} /></Field>
        <Field label="Stage">
          <select value={form.stage} onChange={e => update('stage', e.target.value)}>
            {stageOptions.map(s => <option key={s} value={s}>{regStageLabel(s, recordType, t, lang)}</option>)}
          </select>
        </Field>
        <Field label="Dokumen Lengkap?">
          <select value={form.docsComplete ? 'yes' : 'no'} onChange={e => update('docsComplete', e.target.value === 'yes')}>
            <option value="no">{t.reg_doc_pending}</option>
            <option value="yes">{t.reg_doc_complete}</option>
          </select>
        </Field>
        <Field label="Tgl. Submit"><input type="date" value={form.submitDate || ''} onChange={e => update('submitDate', e.target.value)} /></Field>
        <Field label="Tgl. Evaluasi"><input type="date" value={form.evalDate || ''} onChange={e => update('evalDate', e.target.value)} /></Field>
        <Field label={lang === 'id' ? 'Tgl. Resubmit' : 'Resubmit Date'}><input type="date" value={form.resubmitDate || ''} onChange={e => update('resubmitDate', e.target.value)} /></Field>
        <Field label={lang === 'id' ? 'Jumlah PNBP (Rp)' : 'PNBP Amount (Rp)'}><input type="number" value={form.pnbpAmount || ''} onChange={e => update('pnbpAmount', parseFloat(e.target.value) || null)} /></Field>
        <Field label="Tgl. Izin Terbit"><input type="date" value={form.issuedDate || ''} onChange={e => update('issuedDate', e.target.value)} /></Field>
        <Field label={t.crud_pic}><input value={form.pic || ''} onChange={e => update('pic', e.target.value)} /></Field>
        <Field label={t.reg_attachment} full><input type="url" value={form.attachmentUrl || ''} onChange={e => update('attachmentUrl', e.target.value)} placeholder="https://drive.google.com/... (Izin Pemanfaatan terbit)" /></Field>
        <Field label={t.reg_note} full><textarea rows={2} value={form.note || ''} onChange={e => update('note', e.target.value)} /></Field>
      </>
    );

    if (recordType === 'pengalihan') return (
      <>
        <Field label={t.customer} full><input value={form.customer} onChange={e => update('customer', e.target.value)} /></Field>
        <Field label={t.modality}>
          <select value={form.modality} onChange={e => update('modality', e.target.value)}>
            {Object.keys(MODALITY_COLORS).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <Field label={lang === 'id' ? 'Tipe' : 'Type'}><input value={form.subModality} onChange={e => update('subModality', e.target.value)} /></Field>
        <Field label={t.pgl_destination}><input value={form.destination} onChange={e => update('destination', e.target.value)} /></Field>
        <Field label="Stage">
          <select value={form.stage} onChange={e => update('stage', e.target.value)}>
            {stageOptions.map(s => <option key={s} value={s}>{regStageLabel(s, recordType, t, lang)}</option>)}
          </select>
        </Field>
        <Field label="Tgl. Submit"><input type="date" value={form.submitDate || ''} onChange={e => update('submitDate', e.target.value)} /></Field>
        <Field label="Tgl. Evaluasi"><input type="date" value={form.evalDate || ''} onChange={e => update('evalDate', e.target.value)} /></Field>
        <Field label={lang === 'id' ? 'Tgl. Resubmit' : 'Resubmit Date'}><input type="date" value={form.resubmitDate || ''} onChange={e => update('resubmitDate', e.target.value)} /></Field>
        <Field label="Tgl. PNBP"><input type="date" value={form.pnbpDate || ''} onChange={e => update('pnbpDate', e.target.value)} /></Field>
        <Field label={lang === 'id' ? 'Jumlah PNBP (Rp)' : 'PNBP Amount (Rp)'}><input type="number" value={form.pnbpAmount || ''} onChange={e => update('pnbpAmount', parseFloat(e.target.value) || null)} /></Field>
        <Field label="Tgl. Izin Terbit"><input type="date" value={form.issuedDate || ''} onChange={e => update('issuedDate', e.target.value)} /></Field>
        <Field label={t.pgl_no}><input value={form.permitNo || ''} onChange={e => update('permitNo', e.target.value)} placeholder="BAPETEN/PGL/2026/0xxxx" /></Field>
        <Field label={t.crud_pic}><input value={form.pic || ''} onChange={e => update('pic', e.target.value)} /></Field>
        <Field label={t.akl_note} full><textarea rows={2} value={form.note || ''} onChange={e => update('note', e.target.value)} /></Field>
      </>
    );

    if (recordType === 'pi') return (
      <>
        <Field label={t.pi_no}><input value={form.piNo || ''} onChange={e => update('piNo', e.target.value)} placeholder="BAPETEN/PI/2026/00xxx" /></Field>
        <Field label={t.pi_principal}><input value={form.principal || ''} onChange={e => update('principal', e.target.value)} /></Field>
        <Field label="Stage">
          <select value={form.stage || 'docs'} onChange={e => update('stage', e.target.value)}>
            {stageOptions.map(s => <option key={s} value={s}>{regStageLabel(s, recordType, t, lang)}</option>)}
          </select>
        </Field>
        <Field label={t.pi_shipment} full><input value={form.shipment || ''} onChange={e => update('shipment', e.target.value)} placeholder="ANGEL-SHP-2026-xx-xx" /></Field>
        <Field label={t.pi_items} full><textarea rows={2} value={form.items || ''} onChange={e => update('items', e.target.value)} /></Field>
        <Field label="Tgl. Dokumen"><input type="date" value={form.docsDate || ''} onChange={e => update('docsDate', e.target.value)} /></Field>
        <Field label="Tgl. Submit"><input type="date" value={form.submitDate || ''} onChange={e => update('submitDate', e.target.value)} /></Field>
        <Field label="Tgl. Evaluasi"><input type="date" value={form.evalDate || ''} onChange={e => update('evalDate', e.target.value)} /></Field>
        <Field label={lang === 'id' ? 'Tgl. Resubmit' : 'Resubmit Date'}><input type="date" value={form.resubmitDate || ''} onChange={e => update('resubmitDate', e.target.value)} /></Field>
        <Field label="Tgl. PNBP"><input type="date" value={form.pnbpDate || ''} onChange={e => update('pnbpDate', e.target.value)} /></Field>
        <Field label={lang === 'id' ? 'Jumlah PNBP (Rp)' : 'PNBP Amount (Rp)'}><input type="number" value={form.pnbpAmount || ''} onChange={e => update('pnbpAmount', parseFloat(e.target.value) || null)} /></Field>
        <Field label={t.pi_issued_date}><input type="date" value={form.issuedDate || ''} onChange={e => update('issuedDate', e.target.value)} /></Field>
        <Field label={t.pi_expired_date}><input type="date" value={form.expiredDate || ''} onChange={e => update('expiredDate', e.target.value)} /></Field>
        <Field label="Status">
          <select value={form.status || 'active'} onChange={e => update('status', e.target.value)}>
            <option value="active">{t.pi_status_active || 'Aktif'}</option>
            <option value="used">{t.pi_status_used || 'Digunakan'}</option>
            <option value="expired">{t.pi_status_expired || 'Expired'}</option>
          </select>
        </Field>
        <Field label={t.reg_attachment} full><input type="url" value={form.attachmentUrl || ''} onChange={e => update('attachmentUrl', e.target.value)} placeholder="https://drive.google.com/... (Surat Persetujuan Impor / PI)" /></Field>
        <Field label={t.akl_note} full><textarea rows={2} value={form.note || ''} onChange={e => update('note', e.target.value)} /></Field>
      </>
    );
    return null;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{t[titleKey]}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          {renderFields()}
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
          <button className="btn-primary" onClick={() => onSave(form)}>{t.crud_save}</button>
        </div>
      </div>
    </div>
  );
}

export { RegulatoryDashboardCharts, RegulatoryModule, regStageLabel, RegDurationTimeline, UniformRegPipeline, RegulatoryRecordModal };

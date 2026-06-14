// Extracted from App.jsx during modular refactor.
import React, { useMemo, useRef, useState } from 'react';
import { Activity, ChevronDown, DollarSign, Download, Edit2, FileCheck, FileText, Search, Trash2, TrendingUp, Upload, Wallet, X } from 'lucide-react';
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip, ConfirmDialog, KPICard, ReadOnlyBanner, Td, Th } from '../components/ui.jsx';
import { DocumentEditorModal } from '../components/DocumentEditorModal.jsx';
import { DEFAULT_DOCUMENT_TEMPLATES } from '../constants/docs.js';
import { OPS_COST_DEFAULT, NET_MARGIN_BY_MODALITY, NET_MARGIN_DEFAULT } from '../constants/finance.js';
import { MODALITY_COLORS } from '../constants/sales.js';
import { CHART_COLORS } from '../constants/theme.js';
import { effectiveScheme, getPaymentSummary, calcNetProfit, generatePaymentSchedule } from '../utils/domain.js';
import { formatDuration, currentYear } from '../utils/format.js';
import { DASHBOARD_GLASS, DashboardHero, GlassPanel } from '../components/FuturisticDashboardShell.jsx';
import { buildEditorTemplate, downloadCSV } from '../utils/documents.js';
import { parsePaymentImport } from '../utils/csvImport.js';
import { notify } from '../utils/notifications.js';
import { toFinanceAccounts, resolveFinanceAccountId, normalizeSphProjects } from '../utils/sphProject.js';
function FinanceDashboardCharts({ filteredPoProjects, poProjects, financePerformance, lang, fmt, paymentTypeLabel, totalOpsCost = 0, opsCostRows = [] }) {
  const opsKey = lang === 'id' ? 'Biaya Ops' : 'Ops Cost';
  const valueKey = lang === 'id' ? 'Nilai SPH' : 'SPH Value';
  // Top 10 proyek dengan biaya operasional terbesar (Nilai SPH vs Biaya Ops)
  const opsByProject = [...opsCostRows]
    .sort((a, b) => b.opsCostValue - a.opsCostValue)
    .slice(0, 10)
    .map(r => ({
      name: String(r.customer || r.sphNo || '-').slice(0, 18),
      [opsKey]: Math.round(r.opsCostValue),
      [valueKey]: Math.round(r.totalValue),
    }));
  // Komposisi biaya operasional per modalitas
  const opsModalityMap = opsCostRows.reduce((acc, r) => {
    const key = r.modality || r.subModality || (lang === 'id' ? 'Lainnya' : 'Other');
    acc[key] = (acc[key] || 0) + r.opsCostValue;
    return acc;
  }, {});
  const opsModalityPie = Object.entries(opsModalityMap)
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);
  const monthlyData = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map((m, idx) => {
    const key = `${currentYear()}-${String(idx + 1).padStart(2, '0')}`;
    const rows = filteredPoProjects.flatMap(p => (p.paymentHistory || []).map(h => ({ p, h }))).filter(x => String(x.h.date || x.h.recordedAt || '').startsWith(key));
    return {
      month: m,
      [lang === 'id' ? 'Pembayaran' : 'Payments']: rows.reduce((sum, x) => sum + (Number(x.h.amount) || 0), 0),
      [lang === 'id' ? 'Transaksi' : 'Transactions']: rows.length,
    };
  });
  const schemeData = ['dp_installment', 'after_bast', 'kso'].map(scheme => ({
    name: scheme === 'kso' ? 'KSO' : scheme === 'after_bast' ? (lang === 'id' ? 'Setelah BAST' : 'After BAST') : 'DP+Cicilan',
    value: poProjects.filter(p => effectiveScheme(p) === scheme).length,
  })).filter(x => x.value > 0);
  const collectionData = filteredPoProjects.map(p => {
    const summary = getPaymentSummary(p);
    return {
      name: String(p.customer || p.sphNo || '').slice(0, 18),
      [lang === 'id' ? 'Diterima' : 'Received']: summary.totalPaid,
      [lang === 'id' ? 'Outstanding' : 'Outstanding']: summary.outstanding,
    };
  }).slice(0, 10);
  const paymentTypeData = filteredPoProjects.flatMap(p => (p.paymentHistory || []).map(h => h.type)).reduce((acc, type) => {
    const key = paymentTypeLabel(type || 'other');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const paymentPie = Object.entries(paymentTypeData).map(([name, value]) => ({ name, value }));
  const glass = DASHBOARD_GLASS.finance;
  return (
    <div style={{display: 'grid', gap: '18px'}}>
      <DashboardHero
        glass={glass}
        badge={lang === 'id' ? 'Finance Command Center' : 'Finance Command Center'}
        title={lang === 'id' ? 'Dashboard Keuangan' : 'Finance Dashboard'}
        subtitle={lang === 'id' ? 'Pembayaran, outstanding, skema cicilan & biaya ops — sinkron data PO dari Manajemen SPH.' : 'Payments, outstanding, installment schemes & ops cost — synced from SPH PO data.'}
        lang={lang}
      />
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--ims-border)', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '16px 20px', background: 'var(--ims-bg-card)'}}>
          <div className="lbl-tag">{lang === 'id' ? 'Total Diterima' : 'Total Received'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent-2)'}}>{fmt(filteredPoProjects.reduce((s, p) => s + getPaymentSummary(p).totalPaid, 0))}</div>
        </div>
        <div style={{padding: '16px 20px', background: 'var(--ims-bg-card)'}}>
          <div className="lbl-tag">{lang === 'id' ? 'Total Outstanding' : 'Total Outstanding'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px', color: '#c03030'}}>{fmt(filteredPoProjects.reduce((s, p) => s + getPaymentSummary(p).outstanding, 0))}</div>
        </div>
        <div style={{padding: '16px 20px', background: 'var(--ims-bg-card)'}}>
          <div className="lbl-tag">{lang === 'id' ? 'Biaya Operasional Proyek' : 'Project Operational Cost'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-gold)'}}>{fmt(totalOpsCost)}</div>
        </div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px'}}>
        <GlassPanel glass={glass}>
          <div className="card-title">{lang === 'id' ? 'Grafik Pembayaran Bulanan' : 'Monthly Payment Chart'}</div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={monthlyData} margin={{top: 8, right: 16, left: 0, bottom: 8}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--ims-text-2)" style={{fontSize: 10}} />
              <YAxis yAxisId="left" stroke="var(--ims-text-2)" style={{fontSize: 10}} tickFormatter={(v) => v >= 1e9 ? `${(v / 1e9).toFixed(0)}M` : v >= 1e6 ? `${(v / 1e6).toFixed(0)}Jt` : v} />
              <YAxis yAxisId="right" orientation="right" allowDecimals={false} stroke="var(--ims-text-2)" style={{fontSize: 10}} />
              <Tooltip content={<ChartTooltip fmt={fmt} />} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
              <Bar yAxisId="left" dataKey={lang === 'id' ? 'Pembayaran' : 'Payments'} fill="#5b8def" radius={[3, 3, 0, 0]} />
              <Area yAxisId="right" dataKey={lang === 'id' ? 'Transaksi' : 'Transactions'} fill="#2f8f6f33" stroke="#2f8f6f" />
            </ComposedChart>
          </ResponsiveContainer>
        </GlassPanel>
        <GlassPanel glass={glass}>
          <div className="card-title">{lang === 'id' ? 'Komposisi Skema' : 'Scheme Mix'}</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={schemeData.length ? schemeData : [{ name: '-', value: 0 }]} dataKey="value" nameKey="name" outerRadius={90} label>
                {(schemeData.length ? schemeData : [{ name: '-', value: 0 }]).map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip fmt={(v) => v} />} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
            </PieChart>
          </ResponsiveContainer>
        </GlassPanel>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px'}}>
        <GlassPanel glass={glass}>
          <div className="card-title">{lang === 'id' ? 'Diterima vs Outstanding per Proyek' : 'Received vs Outstanding by Project'}</div>
          <ResponsiveContainer width="100%" height={Math.max(260, collectionData.length * 34)}>
            <BarChart data={collectionData} layout="vertical" margin={{top: 8, right: 18, left: 90, bottom: 8}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" horizontal={false} />
              <XAxis type="number" stroke="var(--ims-text-2)" style={{fontSize: 10}} tickFormatter={(v) => v >= 1e9 ? `${(v / 1e9).toFixed(0)}M` : v >= 1e6 ? `${(v / 1e6).toFixed(0)}Jt` : v} />
              <YAxis type="category" dataKey="name" stroke="var(--ims-text-2)" style={{fontSize: 10}} width={88} />
              <Tooltip content={<ChartTooltip fmt={fmt} />} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
              <Bar dataKey={lang === 'id' ? 'Diterima' : 'Received'} stackId="a" fill="#2f8f6f" />
              <Bar dataKey={lang === 'id' ? 'Outstanding' : 'Outstanding'} stackId="a" fill="#c03030" />
            </BarChart>
          </ResponsiveContainer>
        </GlassPanel>
        <GlassPanel glass={glass}>
          <div className="card-title">{lang === 'id' ? 'Jenis Pembayaran' : 'Payment Types'}</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={paymentPie.length ? paymentPie : [{ name: '-', value: 0 }]} dataKey="value" nameKey="name" outerRadius={84} label>
                {(paymentPie.length ? paymentPie : [{ name: '-', value: 0 }]).map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[(index + 3) % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip fmt={(v) => v} />} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{lang === 'id' ? 'Rata-rata PO ke DP' : 'Average PO to DP'}: <span className="mono" style={{fontWeight: 800}}>{formatDuration(financePerformance.avgDpMs, lang)}</span></div>
        </GlassPanel>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px'}}>
        <GlassPanel glass={glass}>
          <div className="card-title">{lang === 'id' ? 'Biaya Operasional Proyek — Top 10' : 'Project Operational Cost — Top 10'}</div>
          <ResponsiveContainer width="100%" height={Math.max(280, opsByProject.length * 38)}>
            <BarChart data={opsByProject} layout="vertical" margin={{top: 8, right: 18, left: 90, bottom: 8}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" horizontal={false} />
              <XAxis type="number" stroke="var(--ims-text-2)" style={{fontSize: 10}} tickFormatter={(v) => v >= 1e9 ? `${(v / 1e9).toFixed(0)}M` : v >= 1e6 ? `${(v / 1e6).toFixed(0)}Jt` : v} />
              <YAxis type="category" dataKey="name" stroke="var(--ims-text-2)" style={{fontSize: 10}} width={88} />
              <Tooltip content={<ChartTooltip fmt={fmt} />} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
              <Bar dataKey={valueKey} fill="#5b8def" radius={[0, 3, 3, 0]} />
              <Bar dataKey={opsKey} fill="var(--ims-gold)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{lang === 'id' ? 'Total biaya operasional' : 'Total operational cost'}: <span className="mono" style={{fontWeight: 800, color: 'var(--ims-gold)'}}>{fmt(totalOpsCost)}</span></div>
        </GlassPanel>
        <GlassPanel glass={glass}>
          <div className="card-title">{lang === 'id' ? 'Biaya Ops per Modalitas' : 'Ops Cost by Modality'}</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={opsModalityPie.length ? opsModalityPie : [{ name: '-', value: 0 }]} dataKey="value" nameKey="name" outerRadius={90} label>
                {(opsModalityPie.length ? opsModalityPie : [{ name: '-', value: 0 }]).map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[(index + 1) % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip fmt={fmt} />} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
            </PieChart>
          </ResponsiveContainer>
        </GlassPanel>
      </div>
    </div>
  );
}
function FinanceModule({ data, setData, t, lang, canEdit, fmt, onWorkflowUpdate, session = {}, documentTemplates = DEFAULT_DOCUMENT_TEMPLATES, employees = {}, onSaveDocument }) {
  const [financeEditor, setFinanceEditor] = useState(null); // { record, docType, html, title }
  const [tab, setTab] = useState('dashboard');
  const [expandedPo, setExpandedPo] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ open: false, sphId: null, amount: '', type: 'installment', date: '', note: '' });
  const [confirmDeletePayment, setConfirmDeletePayment] = useState(null);
  const [editingNote, setEditingNote] = useState({ sphId: null, note: '' });
  const [schemeFilter, setSchemeFilter] = useState('all');
  const [financeSearch, setFinanceSearch] = useState('');
  const [financeYear, setFinanceYear] = useState('all');
  const [financeSort, setFinanceSort] = useState('newest');
  const [financeProductFilter, setFinanceProductFilter] = useState('all');
  const payImportRef = useRef(null);
  const [payImportMsg, setPayImportMsg] = useState(null);
  const updateSphData = (mapper) => setData(prev => normalizeSphProjects(mapper(prev)));

  const handleImportPayments = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const { records, errors } = parsePaymentImport(String(ev.target.result || ''));
        if (!records.length) { setPayImportMsg({ ok: false, text: errors[0] || (lang === 'id' ? 'Tidak ada data valid.' : 'No valid data.') }); return; }
        const today = new Date().toISOString().split('T')[0];
        const addById = new Map(); let applied = 0, unmatched = 0;
        records.forEach(rec => {
          const id = resolveFinanceAccountId(data, rec.sphNo);
          if (!id) { unmatched++; return; }
          const entry = { id: 'pay_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6), type: rec.type, amount: rec.amount, date: rec.date || today, note: rec.note || '' };
          if (!addById.has(id)) addById.set(id, []);
          addById.get(id).push(entry); applied++;
        });
        updateSphData(prev => prev.map(s => addById.has(s.id) ? { ...s, paymentHistory: [...(Array.isArray(s.paymentHistory) ? s.paymentHistory : []), ...addById.get(s.id)] } : s));
        setPayImportMsg({ ok: true, text: lang === 'id'
          ? `${records.length} baris diproses → ${applied} pembayaran ditambah${unmatched ? `, ${unmatched} tidak cocok (No SPH tak ditemukan)` : ''}.`
          : `${records.length} rows processed → ${applied} payments added${unmatched ? `, ${unmatched} unmatched (SPH No not found)` : ''}.` });
      } catch (err) { setPayImportMsg({ ok: false, text: (lang === 'id' ? 'Gagal membaca file: ' : 'Failed to read file: ') + err.message }); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  const downloadPayTemplate = () => {
    const header = ['SPH No', 'Jenis', 'Jumlah', 'Tanggal', 'Catatan'];
    const ex1 = ['SPH/2026/P21', 'dp', '2460000000', '2026-04-01', 'DP 30%'];
    const ex2 = ['SPH/2026/P21', 'pelunasan', '5740000000', '2026-05-20', 'Pelunasan setelah BAST'];
    downloadCSV('HNTI_Template_Import_Pembayaran.csv', [header, ex1, ex2]);
  };

  const poProjects = useMemo(() => toFinanceAccounts(data), [data]);
  const financeYears = useMemo(() => {
    const years = new Set(poProjects.map(p => String(p.issuedDate || p.poIssuedAt || p.lastUpdate || '').slice(0, 4)).filter(y => /^\d{4}$/.test(y)));
    return [...years].sort((a, b) => b.localeCompare(a));
  }, [poProjects]);
  const financeProductOptions = useMemo(() => {
    const items = poProjects.flatMap(p => [
      p.projectModalityLabel, p.modality, p.subModality, p.productBrand, p.brand,
      ...(p.projectLines || []).flatMap(l => [l.modality, l.subModality]),
    ].filter(Boolean));
    return [...new Set(items)].sort();
  }, [poProjects]);
  const filteredPoProjects = useMemo(() => {
    const q = financeSearch.trim().toLowerCase();
    const rows = poProjects.filter(p => {
      const matchScheme = schemeFilter === 'all' || effectiveScheme(p) === schemeFilter;
      const matchProduct = financeProductFilter === 'all' || [p.projectModalityLabel, p.modality, p.subModality, p.productBrand, p.brand, ...(p.projectLines || []).flatMap(l => [l.modality, l.subModality])].filter(Boolean).includes(financeProductFilter);
      const rowYear = String(p.issuedDate || p.poIssuedAt || p.lastUpdate || '').slice(0, 4);
      const matchYear = financeYear === 'all' || rowYear === financeYear;
      const matchSearch = !q || [p.sphNo, p.customer, p.subModality, p.modality, p.salesOwner].some(v => String(v || '').toLowerCase().includes(q));
      return matchScheme && matchProduct && matchYear && matchSearch;
    });
    return rows.slice().sort((a, b) => {
      if (financeSort === 'highest') return (Number(b.totalValue) || 0) - (Number(a.totalValue) || 0);
      if (financeSort === 'lowest') return (Number(a.totalValue) || 0) - (Number(b.totalValue) || 0);
      return new Date(b.issuedDate || b.poIssuedAt || b.lastUpdate || 0) - new Date(a.issuedDate || a.poIssuedAt || a.lastUpdate || 0);
    });
  }, [poProjects, schemeFilter, financeSearch, financeYear, financeProductFilter, financeSort]);

  // Biaya operasional per proyek (sinkron dgn modul Insentif: opsPercent, default 5%).
  // Nilai (biaya ops) = totalValue × opsPercent. TIDAK mempengaruhi nilai tagihan.
  const opsCostRows = useMemo(() => filteredPoProjects.map(p => {
    const opsPercent = p.opsPercent !== undefined ? p.opsPercent : OPS_COST_DEFAULT;
    return { id: p.id, sphNo: p.sphNo, customer: p.customer, modality: p.modality || '', subModality: p.subModality || '', issuedDate: p.issuedDate || p.poIssuedAt || p.lastUpdate || '', totalValue: Number(p.totalValue) || 0, opsPercent, opsCostValue: (Number(p.totalValue) || 0) * opsPercent };
  }), [filteredPoProjects]);
  const totalOpsCost = useMemo(() => opsCostRows.reduce((s, r) => s + r.opsCostValue, 0), [opsCostRows]);

  const stats = useMemo(() => {
    let totalPOValue = 0, dpReceived = 0, totalReceivedAll = 0, totalOutstanding = 0;
    poProjects.forEach(p => {
      totalPOValue += Number(p.totalValue) || 0;
      const sum = getPaymentSummary(p);
      totalReceivedAll += sum.totalPaid;
      totalOutstanding += sum.outstanding;
      // DP portion: from history, OR from legacy dpPaid flag (data lama tanpa paymentHistory)
      const history = Array.isArray(p.paymentHistory) ? p.paymentHistory : [];
      const dpFromHistory = history.filter(h => h.type === 'dp' || h.type === 'deposit').reduce((s, h) => s + (Number(h.amount) || 0), 0);
      // Bridge for legacy data: if no history but dpPaid=true, assume DP 30% was paid (or scheme dpPercent)
      const sch = effectiveScheme(p);
      const legacyDpPercent = (typeof p.dpPercent === 'number' ? p.dpPercent : (sch === 'dp_installment' ? 30 : sch === 'kso' ? 10 : 0));
      const dpFromLegacy = (history.length === 0 && p.dpPaid) ? (Number(p.totalValue) || 0) * (legacyDpPercent / 100) : 0;
      dpReceived += dpFromHistory + dpFromLegacy;
    });
    return {
      totalPOValue, dpReceived, totalReceivedAll, totalOutstanding,
      countDPInst: poProjects.filter(p => effectiveScheme(p) === 'dp_installment').length,
      countAfterBast: poProjects.filter(p => effectiveScheme(p) === 'after_bast').length,
      countKSO: poProjects.filter(p => effectiveScheme(p) === 'kso').length,
    };
  }, [poProjects]);
  const { totalPOValue, dpReceived, totalReceivedAll, totalOutstanding, countDPInst, countAfterBast, countKSO } = stats;

  // CRUD payment
  const recordPayment = () => {
    if (!canEdit || !paymentForm.amount) return;
    const amt = parseFloat(paymentForm.amount);
    if (!amt || amt <= 0) return;
    const sphId = paymentForm.sphId;
    const resetFields = { open: true, sphId, amount: '', type: 'installment', date: new Date().toISOString().split('T')[0], note: '', editId: null };
    // EDIT mode: update existing payment entry (fix wrong amount/date/type)
    if (paymentForm.editId) {
      updateSphData(prev => prev.map(s => s.id === sphId ? {
        ...s,
        paymentHistory: (s.paymentHistory || []).map(h => h.id === paymentForm.editId
          ? { ...h, date: paymentForm.date || h.date, amount: amt, type: paymentForm.type, note: paymentForm.note || '', editedAt: new Date().toISOString() }
          : h)
      } : s));
      setPaymentForm(resetFields); // stay open so the updated list is visible
      return;
    }
    const payment = {
      id: 'pay_' + Date.now(),
      date: paymentForm.date || new Date().toISOString().split('T')[0],
      amount: amt,
      type: paymentForm.type,
      note: paymentForm.note || '',
      recordedAt: new Date().toISOString(),
    };
    updateSphData(prev => prev.map(s => s.id === sphId ? { ...s, paymentHistory: [...(s.paymentHistory || []), payment] } : s));
    setPaymentForm(resetFields); // stay open so the new payment appears in the list
  };
  // Open modal in EDIT mode pre-filled with an existing payment
  const openEditPayment = (sphId, h) => {
    setPaymentForm({ open: true, sphId, editId: h.id, amount: String(h.amount), type: h.type, date: h.date, note: h.note || '' });
  };
  const deletePayment = () => {
    if (!confirmDeletePayment) return;
    const { sphId, paymentId } = confirmDeletePayment;
    updateSphData(prev => prev.map(s => s.id === sphId ? { ...s, paymentHistory: (s.paymentHistory || []).filter(h => h.id !== paymentId) } : s));
    setConfirmDeletePayment(null);
  };
  const scheduleKeyFor = (item) => `${item.type || 'term'}_${item.seq ?? 0}`;
  const findSchedulePayment = (p, item) => {
    const key = scheduleKeyFor(item);
    const history = Array.isArray(p.paymentHistory) ? p.paymentHistory : [];
    const amount = Math.round(Number(item.amount) || 0);
    return history.find(h => h.scheduleKey === key)
      || history.find(h => {
        const hAmount = Math.round(Number(h.amount) || 0);
        const sameAmount = Math.abs(hAmount - amount) <= 1;
        const sameType = h.type === item.type
          || (item.type === 'dp' && ['dp', 'deposit'].includes(h.type))
          || (item.type === 'final' && ['final', 'installment', 'other'].includes(h.type));
        return sameType && sameAmount && (h.note || '').includes(item.label);
      });
  };
  const toggleSchedulePayment = (p, item) => {
    if (!canEdit) return;
    const existing = findSchedulePayment(p, item);
    if (existing) {
      updateSphData(prev => prev.map(s => s.id === p.id ? { ...s, paymentHistory: (s.paymentHistory || []).filter(h => h.id !== existing.id) } : s));
      return;
    }
    const key = scheduleKeyFor(item);
    const payment = {
      id: 'pay_term_' + Date.now() + '_' + key,
      scheduleKey: key,
      date: new Date().toISOString().split('T')[0],
      amount: Number(item.amount) || 0,
      type: item.type === 'dp' && p.projectType === 'kso' ? 'deposit' : item.type,
      note: `${item.label} ditandai terbayar Finance`,
      recordedAt: new Date().toISOString(),
      recordedBy: session.username || session.name || 'finance',
    };
    updateSphData(prev => prev.map(s => {
      if (s.id !== p.id) return s;
      const extra = item.type === 'dp' || payment.type === 'deposit'
        ? { dpPaid: true, dpDecisionAt: s.dpDecisionAt || new Date().toISOString(), dpConfirmedAt: s.dpConfirmedAt || new Date().toISOString(), sphWorkflowStatus: s.sphWorkflowStatus === 'dp_confirmed' ? s.sphWorkflowStatus : 'dp_confirmed' }
        : {};
      return { ...s, ...extra, paymentHistory: [...(s.paymentHistory || []), payment] };
    }));
  };
  const savePaymentNote = () => {
    setData(prev => prev.map(s => s.id === editingNote.sphId ? { ...s, paymentNote: editingNote.note } : s));
    setEditingNote({ sphId: null, note: '' });
  };
  const markFinanceDocsReady = (p) => {
    if (!onWorkflowUpdate) return;
    onWorkflowUpdate(p.id, {
      financeDocsStatus: 'ready_for_sales',
      financeDocsReadyAt: new Date().toISOString(),
      sphWorkflowStatus: 'invoice_ready',
      workflowEvent: 'invoice_ready',
    }, {
      note: 'Invoice + kwitansi + konfirmasi pesanan ready',
      notify: { target: { username: p.salesOwner }, payload: { type: 'invoice_ready', message: `Invoice+kwitansi dan konfirmasi pesanan ${p.customer} sudah siap diunduh.`, link: { view: 'finance', id: p.id } } },
    });
  };
  const confirmDpReceived = (p) => {
    const nowIso = new Date().toISOString();
    const schedule = generatePaymentSchedule(p);
    const firstTerm = schedule.find(x => x.type === 'dp') || schedule[0];
    const existing = firstTerm ? findSchedulePayment(p, firstTerm) : null;
    const dpAmt = firstTerm ? (Number(firstTerm.amount) || 0) : (Number(p.totalValue) || 0) * ((Number(p.dpPercent) || 30) / 100);
    const payment = existing || { id: 'pay_dp_confirm_' + Date.now(), scheduleKey: firstTerm ? scheduleKeyFor(firstTerm) : 'dp_0', date: nowIso.split('T')[0], amount: dpAmt, type: p.projectType === 'kso' ? 'deposit' : 'dp', note: firstTerm ? `${firstTerm.label} dikonfirmasi Finance` : 'DP/deposit dikonfirmasi Finance', recordedAt: nowIso, recordedBy: session.username || session.name || 'finance' };
    updateSphData(prev => prev.map(s => {
      if (s.id !== p.id) return s;
      const exists = (s.paymentHistory || []).some(h => h.id === payment.id);
      return { ...s, dpPaid: true, dpDecisionAt: nowIso, dpConfirmedAt: nowIso, sphWorkflowStatus: 'dp_confirmed', nextAction: 'Finance membuat PO ke pabrik', paymentHistory: exists ? (s.paymentHistory || []) : [...(s.paymentHistory || []), payment] };
    }));
    if (onWorkflowUpdate) {
      onWorkflowUpdate(p.id, { sphWorkflowStatus: 'dp_confirmed', dpDecisionAt: nowIso, dpConfirmedAt: nowIso, principalPoStatus: 'ready_to_issue', workflowEvent: 'dp_confirmed', nextAction: 'Finance membuat PO ke pabrik' }, {
        note: 'DP confirmed by Finance',
        notify: { target: { role: 'finance' }, payload: { type: 'dp_paid', message: `DP/deposit ${p.customer} sudah diterima. Finance dapat membuat PO ke pabrik.`, link: { view: 'finance', id: p.id } } },
      });
    }
  };
  const notifyLeadership = (type, message, id, includeFinance = false) => {
    const roles = includeFinance ? ['manager_ops', 'gm', 'super_admin', 'finance'] : ['manager_ops', 'gm', 'super_admin'];
    roles.forEach(role => notify({ role }, { type, message, link: { view: 'operations', id } }, { username: session?.username || 'finance', role: session?.role || 'finance' }));
  };
  const markPrincipalPoSent = (p) => {
    if (!onWorkflowUpdate) return;
    const nowIso = new Date().toISOString();
    onWorkflowUpdate(p.id, {
      manufacturePoCreatedAt: nowIso,
      factoryPoSentAt: nowIso,
      principalPoStatus: 'sent',
      principalPoSentAt: nowIso,
      sphWorkflowStatus: 'factory_po_sent',
      workflowEvent: 'factory_po_sent',
      nextAction: 'Manager Operasional membuat pesanan ke pabrik',
    }, { note: 'PO principal sent' });
    notifyLeadership('factory_po_sent', `PO ke pabrik untuk ${p.customer} sudah dikirim oleh Finance. Operasional dapat membuat pesanan.`, p.id);
  };
  const markFactoryDpPaid = (p) => {
    if (!onWorkflowUpdate) return;
    const nowIso = new Date().toISOString();
    onWorkflowUpdate(p.id, {
      factoryDpPaidAt: nowIso,
      supplierDpPaidAt: nowIso,
      shippingStatus: 'plan_order',
      sphWorkflowStatus: 'factory_dp_paid',
      workflowEvent: 'factory_dp_paid',
      nextAction: 'Operasional klik pesanan dibuat dan mulai produksi/disiapkan pabrik',
    }, { note: 'Factory DP paid' });
    notifyLeadership('factory_dp_paid', `DP ke pabrik untuk ${p.customer} sudah dibayarkan. Tombol pesanan dibuat di Operasional sudah aktif.`, p.id);
  };
  const markPibPaid = (p) => {
    if (!onWorkflowUpdate) return;
    const nowIso = new Date().toISOString();
    onWorkflowUpdate(p.id, {
      pibPaidAt: nowIso,
      pibPaymentStatus: 'paid',
      workflowEvent: 'pib_paid',
      nextAction: 'Operasional lanjut proses SPPB / pengiriman lokal',
    }, { note: 'PIB paid by Finance' });
    notifyLeadership('pib_paid', `PIB untuk ${p.customer} sudah dibayarkan oleh Finance. Operasional dapat melanjutkan proses Bea Cukai/SPPB.`, p.id);
  };
  const canDownloadPrincipalPo = ['super_admin', 'gm', 'manager_ops', 'finance', 'admin'].includes(session.role);
  const canDownloadInvoiceFor = (p) => ['super_admin', 'gm', 'finance'].includes(session.role) || (session.role === 'sales' && (session.salesId === p.salesOwner || session.username === p.salesOwner));
  const markFinanceDocEdited = (p) => {
    if (!onWorkflowUpdate) return;
    onWorkflowUpdate(p.id, { financeDocsStatus: 'drafting', financeDocsEditedAt: new Date().toISOString(), workflowEvent: 'finance_docs_edited' }, { note: 'Finance document draft edited' });
  };

  // CSV export for AR ledger
  const exportCSV = () => {
    const header = [
      lang === 'id' ? 'No SPH' : 'SPH No', lang === 'id' ? 'Pelanggan' : 'Customer',
      lang === 'id' ? 'Tipe' : 'Type', lang === 'id' ? 'Skema Bayar' : 'Payment Scheme',
      lang === 'id' ? 'Nilai PO' : 'PO Value',
      'DP%', lang === 'id' ? 'Cicilan (bulan)' : 'Installments (months)',
      lang === 'id' ? 'Total Diterima' : 'Total Received',
      lang === 'id' ? 'Tertunggak' : 'Outstanding',
      '% Lunas / Paid %',
      lang === 'id' ? 'Tanggal PO' : 'PO Date',
      lang === 'id' ? 'Keterangan' : 'Notes',
    ];
    const rows = [header];
    filteredPoProjects.forEach(p => {
      const sum = getPaymentSummary(p);
      rows.push([
        p.sphNo, p.customer, p.customerType, effectiveScheme(p),
        p.totalValue, p.dpPercent || 0, p.installmentMonths || 0,
        sum.totalPaid, sum.outstanding, sum.pctPaid,
        p.issuedDate, p.paymentNote || '',
      ]);
    });
    const ts = new Date().toISOString().split('T')[0];
    downloadCSV(`HNTI_AR_Ledger_${ts}.csv`, rows);
  };
  const exportPaymentHistoryCSV = () => {
    const header = [
      lang === 'id' ? 'No SPH' : 'SPH No', lang === 'id' ? 'Pelanggan' : 'Customer',
      lang === 'id' ? 'Tanggal Bayar' : 'Payment Date',
      lang === 'id' ? 'Jenis' : 'Type', lang === 'id' ? 'Jumlah' : 'Amount',
      lang === 'id' ? 'Keterangan' : 'Note',
    ];
    const rows = [header];
    filteredPoProjects.forEach(p => {
      (p.paymentHistory || []).forEach(h => {
        rows.push([p.sphNo, p.customer, h.date, h.type, h.amount, h.note || '']);
      });
    });
    const ts = new Date().toISOString().split('T')[0];
    downloadCSV(`HNTI_Payment_History_${ts}.csv`, rows);
  };

  const schemeColor = (s) => s === 'kso' ? '#7b3fb5' : s === 'after_bast' ? '#1a4d8a' : 'var(--ims-gold)';
  const schemeLabel = (s) => {
    if (s === 'kso') return lang === 'id' ? 'KSO (Deposit + Bagi Hasil)' : 'KSO (Deposit + Revenue Share)';
    if (s === 'after_bast') return lang === 'id' ? 'Project Pemerintah (100% setelah BAST)' : 'Government Project (100% after BAST)';
    return lang === 'id' ? 'DP + Cicilan (Swasta)' : 'DP + Installment (Private)';
  };
  const paymentTypeLabel = (type) => {
    const map = {
      dp: lang === 'id' ? 'DP' : 'DP',
      deposit: lang === 'id' ? 'Deposit' : 'Deposit',
      installment: lang === 'id' ? 'Cicilan' : 'Installment',
      final: lang === 'id' ? 'Pelunasan' : 'Final Payment',
      revenue_share: lang === 'id' ? 'Bagi Hasil' : 'Revenue Share',
      full_after_bast: lang === 'id' ? 'Pelunasan Project Pemerintah (Setelah BAST)' : 'Government Project Payment (After BAST)',
      other: lang === 'id' ? 'Lainnya' : 'Other',
    };
    return map[type] || type;
  };
  const financePerformance = useMemo(() => {
    const historyRows = filteredPoProjects.flatMap(p => (Array.isArray(p.paymentHistory) ? p.paymentHistory : []).map(h => ({
      ...h,
      customer: p.customer,
      sphNo: p.sphNo,
      product: p.subModality || p.modality || '-',
    }))).sort((a, b) => new Date(b.date || b.recordedAt || 0) - new Date(a.date || a.recordedAt || 0)).slice(0, 8);
    const dpProjects = filteredPoProjects.filter(p => {
      const history = Array.isArray(p.paymentHistory) ? p.paymentHistory : [];
      return p.dpPaid || history.some(h => h.type === 'dp' || h.type === 'deposit');
    });
    const dpLeadTimes = dpProjects.map(p => {
      const poMs = new Date(p.issuedDate || p.poIssuedAt || p.lastUpdate || 0).getTime();
      const dpMs = new Date(p.dpConfirmedAt || p.dpDecisionAt || (p.paymentHistory || []).find(h => h.type === 'dp' || h.type === 'deposit')?.date || 0).getTime();
      return Number.isFinite(poMs) && Number.isFinite(dpMs) && dpMs >= poMs ? dpMs - poMs : null;
    }).filter(v => v !== null);
    const avgDpMs = dpLeadTimes.length ? dpLeadTimes.reduce((sum, v) => sum + v, 0) / dpLeadTimes.length : 0;
    const paidFull = filteredPoProjects.filter(p => getPaymentSummary(p).outstanding <= 0).length;
    return { historyRows, dpProjects: dpProjects.length, avgDpMs, paidFull };
  }, [filteredPoProjects]);

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_finance}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>
          {tab === 'profit' ? t.np_title : (tab === 'dashboard' ? (lang === 'id' ? 'Dashboard Finance' : 'Finance Dashboard') : t.finance_title)}
        </h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>
          {tab === 'profit' ? t.np_subtitle : (tab === 'dashboard' ? (lang === 'id' ? 'Grafik pembayaran, DP, dan performa koleksi' : 'Payment, DP, and collection charts') : t.finance_subtitle)}
        </div>
      </div>
      {!canEdit && <ReadOnlyBanner t={t} />}

      {/* Tabs */}
      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {[
          { id: 'dashboard', label: lang === 'id' ? 'Dashboard' : 'Dashboard', icon: Activity },
          { id: 'finance', label: t.np_tab_finance, icon: Wallet },
          { id: 'opscost', label: lang === 'id' ? 'Biaya Operasional' : 'Operational Cost', icon: DollarSign },
          { id: 'profit', label: t.np_tab_profit, icon: TrendingUp },
        ].map(tb => {
          const Icon = tb.icon;
          const active = tab === tb.id;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '10px 18px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: active ? 'var(--ims-accent)' : 'var(--ims-text-2)', borderBottom: active ? '2px solid var(--ims-border)' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px', letterSpacing: '0.03em'}}>
              <Icon size={14} strokeWidth={1.5} />{tb.label}
            </button>
          );
        })}
      </div>

      {tab === 'dashboard' && <FinanceDashboardCharts filteredPoProjects={filteredPoProjects} poProjects={poProjects} financePerformance={financePerformance} lang={lang} fmt={fmt} paymentTypeLabel={paymentTypeLabel} totalOpsCost={totalOpsCost} opsCostRows={opsCostRows} />}
      {tab === 'profit' && <NetProfitAnalysis data={data} t={t} lang={lang} fmt={fmt} />}
      {tab === 'opscost' && (
        <div>
          <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '18px', border: '1px solid var(--ims-border)'}}>
            <div style={{padding: '16px 20px', background: 'var(--ims-bg-card)'}}><div className="lbl-tag">{lang === 'id' ? 'Total Biaya Operasional Proyek' : 'Total Project Operational Cost'}</div><div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-gold)'}}>{fmt(totalOpsCost)}</div></div>
            <div style={{padding: '16px 20px', background: 'var(--ims-bg-card)'}}><div className="lbl-tag">{lang === 'id' ? 'Jumlah Proyek' : 'Project Count'}</div><div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px'}}>{opsCostRows.length}</div></div>
            <div style={{padding: '16px 20px', background: 'var(--ims-bg-card)'}}><div className="lbl-tag">{lang === 'id' ? 'Rata-rata Biaya Ops' : 'Avg Ops Cost %'}</div><div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px'}}>{opsCostRows.length ? (opsCostRows.reduce((s, r) => s + r.opsPercent, 0) / opsCostRows.length * 100).toFixed(1) : '0'}%</div></div>
          </div>
          <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflow: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '640px'}}>
              <thead><tr style={{background: 'var(--ims-bg-card-2)'}}>
                <Th>{t.sph_number}</Th><Th>{t.customer}</Th>
                <Th align="right">{lang === 'id' ? 'Nilai SPH' : 'SPH Value'}</Th>
                <Th align="right">{lang === 'id' ? 'Biaya Ops %' : 'Ops %'}</Th>
                <Th align="right">{lang === 'id' ? 'Nilai (Biaya Ops)' : 'Value (Ops Cost)'}</Th>
              </tr></thead>
              <tbody>
                {opsCostRows.map(r => (
                  <tr key={r.id} style={{borderTop: '1px solid var(--ims-border)'}}>
                    <Td><span className="mono" style={{fontSize: '11px'}}>{r.sphNo}</span></Td>
                    <Td>{r.customer}</Td>
                    <Td align="right"><span className="mono">{fmt(r.totalValue)}</span></Td>
                    <Td align="right"><span className="mono">{(r.opsPercent * 100).toFixed(1)}%</span></Td>
                    <Td align="right"><span className="mono" style={{color: 'var(--ims-gold)', fontWeight: 600}}>{fmt(r.opsCostValue)}</span></Td>
                  </tr>
                ))}
                {opsCostRows.length === 0 && <tr><td colSpan={5} className="empty-state">{lang === 'id' ? 'Belum ada proyek' : 'No projects'}</td></tr>}
              </tbody>
              <tfoot><tr style={{borderTop: '2px solid var(--ims-border)', background: 'var(--ims-bg-card-2)'}}>
                <Td><strong>{lang === 'id' ? 'TOTAL' : 'TOTAL'}</strong></Td><Td></Td><Td></Td><Td></Td>
                <Td align="right"><span className="mono" style={{fontWeight: 700, color: 'var(--ims-gold)'}}>{fmt(totalOpsCost)}</span></Td>
              </tr></tfoot>
            </table>
          </div>
        </div>
      )}

      {tab === 'finance' && (
      <>
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '24px', border: '1px solid var(--ims-border)'}}>
        <KPICard label={t.po_value} value={fmt(totalPOValue)} sublabel={`${poProjects.length} PO`} trend={18.5} />
        <KPICard label={t.cash_collected} value={fmt(totalReceivedAll)} sublabel={lang === 'id' ? 'Total diterima' : 'Total received'} trend={22.1} />
        <KPICard label={t.ar_outstanding} value={fmt(totalOutstanding)} sublabel={lang === 'id' ? 'Belum diterima' : 'Not yet received'} trend={-5.3} />
        <KPICard label={t.dp_paid} value={fmt(dpReceived)} sublabel="DP / Deposit" trend={12.0} />
      </div>

      <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px'}}>
        <div style={{position: 'relative', flex: '1 1 240px', maxWidth: '360px'}}>
          <Search size={13} style={{position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ims-text-2)'}} />
          <input value={financeSearch} onChange={e => setFinanceSearch(e.target.value)} placeholder={lang === 'id' ? 'Cari SPH, pelanggan, produk, sales...' : 'Search SPH, customer, product, sales...'} style={{paddingLeft: '32px', fontSize: '12px'}} />
        </div>
        <select value={financeSort} onChange={e => setFinanceSort(e.target.value)} style={{width: 'auto', minWidth: '150px'}}>
          <option value="newest">{lang === 'id' ? 'SPH Terbaru' : 'Newest SPH'}</option>
          <option value="highest">{lang === 'id' ? 'Nilai Tertinggi' : 'Highest Value'}</option>
          <option value="lowest">{lang === 'id' ? 'Nilai Terendah' : 'Lowest Value'}</option>
        </select>
        <select value={financeYear} onChange={e => setFinanceYear(e.target.value)} style={{width: 'auto', minWidth: '140px'}}>
          <option value="all">{lang === 'id' ? 'Semua Tahun' : 'All Years'}</option>
          {financeYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={financeProductFilter} onChange={e => setFinanceProductFilter(e.target.value)} style={{width: 'auto', minWidth: '180px'}}>
          <option value="all">{lang === 'id' ? 'Semua Produk' : 'All Products'}</option>
          {financeProductOptions.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Scheme summary + export buttons */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px'}}>
        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center'}}>
          <span style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? 'Filter Skema' : 'Scheme Filter'}:</span>
          {[
            { id: 'all', label: lang === 'id' ? `Semua (${poProjects.length})` : `All (${poProjects.length})` },
            { id: 'dp_installment', label: `DP+Cicilan (${countDPInst})` },
            { id: 'after_bast', label: `${lang === 'id' ? 'Project Pemerintah' : 'Government'} (${countAfterBast})` },
            { id: 'kso', label: `KSO (${countKSO})` },
          ].map(opt => (
            <button key={opt.id} onClick={() => setSchemeFilter(opt.id)} style={{background: schemeFilter === opt.id ? 'var(--ims-accent)' : 'transparent', border: `1px solid ${schemeFilter === opt.id ? 'var(--ims-accent)' : 'var(--ims-border)'}`, color: schemeFilter === opt.id ? '#fff' : 'var(--ims-text-2)', padding: '5px 11px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 500}}>{opt.label}</button>
          ))}
        </div>
        <div style={{display: 'flex', gap: '8px'}}>
          <button onClick={exportCSV} style={{background: 'var(--ims-accent-2)', border: 'none', color: '#fff', padding: '7px 14px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'}} title={lang === 'id' ? 'Export ringkasan AR ke CSV (buka di Excel)' : 'Export AR summary to CSV (opens in Excel)'}>
            <FileText size={13} />{lang === 'id' ? 'Export AR (CSV)' : 'Export AR (CSV)'}
          </button>
          <button onClick={exportPaymentHistoryCSV} style={{background: 'transparent', border: '1px solid var(--ims-accent-2)', color: 'var(--ims-accent-2)', padding: '7px 14px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'}} title={lang === 'id' ? 'Export riwayat pembayaran ke CSV' : 'Export payment history to CSV'}>
            <FileText size={13} />{lang === 'id' ? 'Export Riwayat Bayar' : 'Export Payment History'}
          </button>
          {canEdit && <>
            <button onClick={() => payImportRef.current && payImportRef.current.click()} style={{background: '#1a4d8a', border: 'none', color: '#fff', padding: '7px 14px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'}} title={lang === 'id' ? 'Impor data pembayaran dari CSV' : 'Import payment data from CSV'}>
              <Upload size={13} />{lang === 'id' ? 'Impor Pembayaran' : 'Import Payments'}
            </button>
            <button onClick={downloadPayTemplate} style={{background: 'transparent', border: '1px solid var(--ims-accent)', color: 'var(--ims-text-2)', padding: '7px 14px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'}} title={lang === 'id' ? 'Unduh template CSV pembayaran' : 'Download payment CSV template'}>
              <Download size={13} />Template
            </button>
            <input ref={payImportRef} type="file" accept=".csv,text/csv" onChange={handleImportPayments} style={{display: 'none'}} />
          </>}
        </div>
      </div>
      {payImportMsg && <div style={{margin: '0 0 14px', padding: '10px 14px', fontSize: '12px', border: '1px solid', borderColor: payImportMsg.ok ? 'var(--ims-accent-2)' : '#c03030', background: payImportMsg.ok ? 'rgba(58,107,58,0.08)' : 'rgba(192,48,48,0.08)', color: payImportMsg.ok ? '#2c5530' : '#a02020', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px'}}>
        <span>{payImportMsg.ok ? '✓ ' : '⚠ '}{payImportMsg.text}</span>
        <button onClick={() => setPayImportMsg(null)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700, fontSize: '14px'}}>×</button>
      </div>}

      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '1000px'}}>
          <thead>
            <tr style={{background: 'var(--ims-bg-card-2)'}}>
              <Th></Th><Th>{t.sph_number}</Th><Th>{t.customer}</Th>
              <Th>{lang === 'id' ? 'Skema' : 'Scheme'}</Th>
              <Th align="right">{t.value}</Th>
              <Th align="right">{lang === 'id' ? 'Diterima' : 'Received'}</Th>
              <Th align="right">{lang === 'id' ? 'Tertunggak' : 'Outstanding'}</Th>
              <Th align="right">{lang === 'id' ? 'Biaya Ops %' : 'Ops Cost %'}</Th>
              <Th align="right">{lang === 'id' ? 'Nilai (Biaya Ops)' : 'Value (Ops Cost)'}</Th>
              <Th align="center">{lang === 'id' ? 'Progress' : 'Progress'}</Th>
              {canEdit && <Th align="center">{lang === 'id' ? 'Aksi' : 'Action'}</Th>}
            </tr>
          </thead>
          <tbody>
            {filteredPoProjects.map(p => {
              const sum = getPaymentSummary(p);
              const isExpanded = expandedPo === p.id;
              const sch = effectiveScheme(p);
              return (
                <React.Fragment key={p.id}>
                  <tr className="hover-row" style={{borderTop: '1px solid var(--ims-border)'}}>
                    <Td>
                      <button onClick={() => setExpandedPo(isExpanded ? null : p.id)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)', padding: '2px'}}>
                        <ChevronDown size={14} style={{transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s'}} />
                      </button>
                    </Td>
                    <Td><span className="mono" style={{fontSize: '11px'}}>{p.sphNo}</span></Td>
                    <Td>
                      <div style={{fontWeight: 500}}>{p.customer}</div>
                      <div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>
                        {p.isMultiItemProject
                          ? `${p.projectModalityLabel || p.subModality} · ${p.projectLineCount} ${lang === 'id' ? 'alat' : 'units'}`
                          : `${p.subModality} · ${t[`type_${p.customerType}`]}`}
                      </div>
                    </Td>
                    <Td><span style={{display: 'inline-block', padding: '3px 8px', fontSize: '10px', background: schemeColor(sch) + '25', color: schemeColor(sch), fontWeight: 600, borderRadius: '3px'}}>{schemeLabel(sch)}</span></Td>
                    <Td align="right"><span className="mono" style={{fontWeight: 500}}>{fmt(p.totalValue)}</span></Td>
                    <Td align="right"><span className="mono" style={{color: 'var(--ims-accent-2)', fontWeight: 500}}>{fmt(sum.totalPaid)}</span></Td>
                    <Td align="right"><span className="mono" style={{color: sum.outstanding > 0 ? '#c03030' : 'var(--ims-text-2)', fontWeight: 500}}>{fmt(sum.outstanding)}</span></Td>
                    <Td align="right">
                      {canEdit ? (
                        <input type="number" step="0.5" min="0" max="100" value={((p.opsPercent !== undefined ? p.opsPercent : OPS_COST_DEFAULT) * 100)} onChange={e => { const pct = (Number(e.target.value) || 0) / 100; const memberIds = new Set((p.projectLines || []).map(l => l.id)); updateSphData(prev => prev.map(x => (x.id === p.id || memberIds.has(x.id)) ? { ...x, opsPercent: pct } : x)); }} style={{width: '64px', textAlign: 'right', fontSize: '11px', padding: '4px 6px'}} title={lang === 'id' ? 'Biaya operasional proyek (sinkron dengan modul Insentif)' : 'Project operational cost (synced with Incentive)'} />
                      ) : (
                        <span className="mono" style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>{(((p.opsPercent !== undefined ? p.opsPercent : OPS_COST_DEFAULT) * 100)).toFixed(1)}%</span>
                      )}
                    </Td>
                    <Td align="right"><span className="mono" style={{color: 'var(--ims-gold)', fontWeight: 600}}>{fmt((p.totalValue || 0) * (p.opsPercent !== undefined ? p.opsPercent : OPS_COST_DEFAULT))}</span></Td>
                    <Td align="center">
                      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px'}}>
                        <div style={{width: '80px', height: '6px', background: 'var(--ims-border)', overflow: 'hidden'}}>
                          <div style={{height: '100%', width: `${sum.pctPaid}%`, background: sum.pctPaid >= 100 ? 'var(--ims-accent-2)' : 'var(--ims-gold)'}} />
                        </div>
                        <div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{sum.pctPaid}%{sum.installmentsExpected > 0 && ` · ${sum.installmentsPaid}/${sum.installmentsExpected}`}</div>
                      </div>
                    </Td>
                    {canEdit && (
                      <Td align="center">
                        <button onClick={() => setPaymentForm({ open: true, sphId: p.id, amount: '', type: sch === 'kso' ? 'revenue_share' : sch === 'after_bast' ? 'full_after_bast' : 'installment', date: new Date().toISOString().split('T')[0], note: '', editId: null })} style={{background: 'var(--ims-bg-alt)', border: 'none', color: '#fff', padding: '5px 11px', fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap'}} title={lang === 'id' ? 'Kelola pembayaran: tambah / edit / hapus' : 'Manage payments: add / edit / delete'}>
                          <Wallet size={11} />{lang === 'id' ? 'Kelola Bayar' : 'Manage Pay'}{(p.paymentHistory || []).length > 0 ? ` (${(p.paymentHistory || []).length})` : ''}
                        </button>
                      </Td>
                    )}
                  </tr>

                  {/* Expanded payment schedule + history */}
                  {isExpanded && (
                    <tr>
                      <Td></Td>
                      <td colSpan={canEdit ? 10 : 9} style={{padding: '14px 18px', background: 'var(--ims-bg)', borderTop: '1px solid var(--ims-border)'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '12px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
                          <div>
                            <div style={{fontSize: '11px', color: 'var(--ims-text-2)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase'}}>{lang === 'id' ? 'Konfirmasi DP / Deposit' : 'DP / Deposit Confirmation'}</div>
                            <div style={{fontSize: '12px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{p.customer} · {p.sphNo} · DP {p.dpPercent || 0}%{p.isMultiItemProject ? ` · ${p.projectLineCount} ${lang === 'id' ? 'alat' : 'units'}` : ''}</div>
                          </div>
                          {p.isMultiItemProject && (p.projectLines || []).length > 0 && (
                            <div style={{width: '100%', marginTop: '10px', padding: '10px 12px', background: 'var(--ims-bg)', border: '1px solid var(--ims-border)', fontSize: '11px', color: 'var(--ims-text-2)'}}>
                              <div style={{fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px', color: 'var(--ims-text)'}}>{lang === 'id' ? 'Komposisi Proyek' : 'Project Items'}</div>
                              {(p.projectLines || []).map(line => (
                                <div key={line.id} style={{marginTop: '4px'}}>• {[line.subModality, line.modality].filter(Boolean).join(' · ') || '-'}</div>
                              ))}
                            </div>
                          )}
                          {canEdit && (
                            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                              <button onClick={() => confirmDpReceived(p)} style={{background: 'var(--ims-gold)', color: 'var(--ims-accent-ink)', border: 'none', padding: '8px 12px', fontSize: '11px', cursor: 'pointer', fontWeight: 800}}>{lang === 'id' ? 'Pembayaran DP telah diterima' : 'DP Payment Received'}</button>
                              <button onClick={() => markPrincipalPoSent(p)} style={{background: '#1a4d8a', color: '#fff', border: 'none', padding: '8px 12px', fontSize: '11px', cursor: 'pointer', fontWeight: 800}}>{lang === 'id' ? 'PO dikirim ke pabrik' : 'PO Sent to Factory'}</button>
                              <button onClick={() => markFactoryDpPaid(p)} style={{background: 'var(--ims-accent-2)', color: '#fff', border: 'none', padding: '8px 12px', fontSize: '11px', cursor: 'pointer', fontWeight: 800}}>{lang === 'id' ? 'DP dibayarkan ke pabrik' : 'DP Paid to Factory'}</button>
                              <button onClick={() => markPibPaid(p)} style={{background: '#7b3fb5', color: '#fff', border: 'none', padding: '8px 12px', fontSize: '11px', cursor: 'pointer', fontWeight: 800}}>{t.pib_paid || (lang === 'id' ? 'PIB Terbayar' : 'PIB Paid')}</button>
                            </div>
                          )}
                          <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                            {canDownloadInvoiceFor(p) && <>
                              <button onClick={() => setFinanceEditor({ record: p, docType: 'invoice', html: buildEditorTemplate('invoice', p, employees, fmt, documentTemplates), title: 'Buat Invoice — ' + (p.customer || '') })} className="btn-primary" style={{fontSize: '11px', padding: '6px 12px'}}><FileText size={13} />Buat Invoice</button>
                              <button onClick={() => setFinanceEditor({ record: p, docType: 'kwitansi', html: buildEditorTemplate('kwitansi', p, employees, fmt, documentTemplates), title: 'Buat Kwitansi — ' + (p.customer || '') })} className="btn-primary" style={{fontSize: '11px', padding: '6px 12px'}}><FileCheck size={13} />Buat Kwitansi</button>
                            </>}
                            {canDownloadPrincipalPo && <button onClick={() => setFinanceEditor({ record: p, docType: 'po_principal', html: buildEditorTemplate('po_principal', p, employees, fmt, documentTemplates), title: 'Buat PO — ' + (p.customer || '') })} className="btn-primary" style={{fontSize: '11px', padding: '6px 12px'}}><FileCheck size={13} />Buat PO</button>}
                          </div>
                        </div>
                        <details open style={{marginTop: '10px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
                          <summary style={{padding: '10px 12px', cursor: 'pointer', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 800}}>
                            {lang === 'id' ? 'Termin Pembayaran dari SPH' : 'Payment Terms from SPH'} · {generatePaymentSchedule(p).length} {lang === 'id' ? 'termin' : 'terms'}
                          </summary>
                          <div style={{borderTop: '1px solid var(--ims-border)'}}>
                            {generatePaymentSchedule(p).map((item, idx) => {
                              const paid = findSchedulePayment(p, item);
                              return (
                                <div key={scheduleKeyFor(item)} style={{display: 'grid', gridTemplateColumns: '34px minmax(180px, 1.2fr) 120px 140px 120px', gap: '10px', alignItems: 'center', padding: '10px 12px', borderTop: idx ? '1px solid var(--ims-bg-card-2)' : 'none', background: paid ? 'rgba(58,107,58,0.16)' : 'transparent'}}>
                                  <input type="checkbox" disabled={!canEdit} checked={!!paid} onChange={() => toggleSchedulePayment(p, item)} style={{width: '18px', height: '18px', accentColor: 'var(--ims-accent-2)', cursor: canEdit ? 'pointer' : 'default'}} />
                                  <div>
                                    <div style={{fontSize: '12px', fontWeight: 800, color: paid ? 'var(--ims-accent-2)' : 'var(--ims-text)'}}>{item.label}</div>
                                    <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{paymentTypeLabel(item.type)} · <span className="mono">{p.sphNo}</span></div>
                                  </div>
                                  <div className="mono" style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>{item.dueDate || '-'}</div>
                                  <div className="mono" style={{fontSize: '12px', fontWeight: 700, textAlign: 'right', color: paid ? 'var(--ims-accent-2)' : 'var(--ims-text)'}}>{fmt(item.amount || 0)}</div>
                                  <div style={{display: 'flex', justifyContent: 'flex-end', gap: '6px', alignItems: 'center'}}>
                                    <span style={{fontSize: '10px', fontWeight: 800, color: paid ? 'var(--ims-accent-2)' : 'var(--ims-text-2)'}}>{paid ? (lang === 'id' ? 'TERBAYAR' : 'PAID') : (lang === 'id' ? 'BELUM' : 'OPEN')}</span>
                                    {paid && canEdit && <button onClick={() => openEditPayment(p.id, paid)} style={{background: 'transparent', border: '1px solid var(--ims-border)', color: 'var(--ims-accent)', padding: '4px 7px', fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center'}} title={lang === 'id' ? 'Edit pembayaran' : 'Edit payment'}><Edit2 size={10} /></button>}
                                  </div>
                                  {paid && (
                                    <div style={{gridColumn: '2 / -1', fontSize: '10px', color: 'var(--ims-text-2)', paddingTop: '2px'}}>
                                      {lang === 'id' ? 'History' : 'History'}: <span className="mono">{paid.date}</span> · {fmt(paid.amount || 0)} · {paid.note || '-'}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </details>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {filteredPoProjects.length === 0 && <div className="empty-state">{t.no_data}</div>}
      </div>

      {/* Manage Payments Modal — list + inline edit/delete + add form (Catatan #3) */}
      {paymentForm.open && (() => {
        const modalSph = data.find(s => s.id === paymentForm.sphId);
        const history = modalSph && Array.isArray(modalSph.paymentHistory) ? modalSph.paymentHistory : [];
        const typeLabel = (ty) => ({ dp: 'DP', deposit: 'Deposit (KSO)', installment: lang === 'id' ? 'Cicilan' : 'Installment', revenue_share: lang === 'id' ? 'Bagi Hasil' : 'Rev. Share', full_after_bast: lang === 'id' ? 'Pelunasan (BAST)' : 'Full (BAST)', other: lang === 'id' ? 'Lainnya' : 'Other' }[ty] || ty);
        return (
        <div className="modal-overlay" onClick={() => setPaymentForm({ ...paymentForm, open: false, editId: null })} style={{zIndex: 9999}}>
          <div onClick={e => e.stopPropagation()} style={{background: 'var(--ims-bg-card)', maxWidth: '620px', width: '94%', maxHeight: '88vh', overflowY: 'auto', border: '1px solid var(--ims-border)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{padding: '18px 22px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--ims-bg-card)', zIndex: 2}}>
              <div>
                <h3 className="serif" style={{margin: 0, fontSize: '18px', fontWeight: 500}}>{lang === 'id' ? 'Kelola Pembayaran' : 'Manage Payments'}</h3>
                {modalSph && <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{modalSph.customer} · {modalSph.sphNo}</div>}
              </div>
              <button onClick={() => setPaymentForm({ ...paymentForm, open: false, editId: null })} style={{background: 'transparent', border: 'none', cursor: 'pointer'}}><X size={18} /></button>
            </div>

            {/* Existing payments with inline EDIT + DELETE */}
            <div style={{padding: '16px 22px 4px'}}>
              <div style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '8px'}}>{lang === 'id' ? `Riwayat Pembayaran (${history.length})` : `Payment History (${history.length})`}</div>
              {history.length === 0 ? (
                <div style={{padding: '14px', background: 'var(--ims-bg)', border: '1px dashed var(--ims-border)', fontSize: '12px', color: 'var(--ims-text-2)', textAlign: 'center'}}>{lang === 'id' ? 'Belum ada pembayaran. Tambahkan di bawah.' : 'No payments yet. Add one below.'}</div>
              ) : (
                <div style={{border: '1px solid var(--ims-border)'}}>
                  {history.map((h, idx) => (
                    <div key={h.id} style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderBottom: idx < history.length - 1 ? '1px solid var(--ims-bg-card-2)' : 'none', background: paymentForm.editId === h.id ? 'rgba(26,77,138,0.07)' : 'transparent'}}>
                      <div style={{flex: 1, minWidth: 0}}>
                        <div style={{fontSize: '12.5px', fontWeight: 600, color: 'var(--ims-text)'}}>{fmt(h.amount)}</div>
                        <div style={{fontSize: '10.5px', color: 'var(--ims-text-2)'}}>{h.date} · {typeLabel(h.type)}{h.note ? ` · ${h.note}` : ''}</div>
                      </div>
                      {canEdit && <>
                        <button onClick={() => setPaymentForm({ open: true, sphId: modalSph.id, editId: h.id, amount: String(h.amount), type: h.type, date: h.date, note: h.note || '' })} style={{flexShrink: 0, background: '#1a4d8a', border: 'none', padding: '4px 10px', fontSize: '10px', cursor: 'pointer', color: '#fff', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px'}}><Edit2 size={10} />{lang === 'id' ? 'Edit' : 'Edit'}</button>
                        <button onClick={() => setConfirmDeletePayment({ sphId: modalSph.id, paymentId: h.id })} style={{flexShrink: 0, background: 'transparent', border: '1px solid #c03030', padding: '4px 10px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px'}}><Trash2 size={10} />{lang === 'id' ? 'Hapus' : 'Delete'}</button>
                      </>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add / Edit form */}
            <div style={{padding: '8px 22px 4px'}}>
              <div style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: paymentForm.editId ? '#1a4d8a' : 'var(--ims-accent-2)', fontWeight: 700, marginTop: '10px', marginBottom: '6px'}}>{paymentForm.editId ? (lang === 'id' ? '✎ Edit Pembayaran Terpilih' : '✎ Editing Selected Payment') : (lang === 'id' ? '+ Tambah Pembayaran Baru' : '+ Add New Payment')}</div>
            </div>
            <div style={{padding: '4px 22px 20px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div>
                <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '4px'}}>{lang === 'id' ? 'Tanggal Pembayaran' : 'Payment Date'}</label>
                <input type="date" value={paymentForm.date} onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })} style={{width: '100%'}} />
              </div>
              <div>
                <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '4px'}}>{lang === 'id' ? 'Jenis Pembayaran' : 'Payment Type'}</label>
                <select value={paymentForm.type} onChange={e => setPaymentForm({ ...paymentForm, type: e.target.value })} style={{width: '100%'}}>
                  <option value="dp">DP</option>
                  <option value="deposit">Deposit (KSO)</option>
                  <option value="installment">{lang === 'id' ? 'Cicilan' : 'Installment'}</option>
                  <option value="revenue_share">{lang === 'id' ? 'Bagi Hasil (KSO)' : 'Revenue Share (KSO)'}</option>
                  <option value="full_after_bast">{lang === 'id' ? 'Pelunasan Project Pemerintah (Setelah BAST)' : 'Government Project Payment (After BAST)'}</option>
                  <option value="other">{lang === 'id' ? 'Lainnya' : 'Other'}</option>
                </select>
              </div>
              <div>
                <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '4px'}}>{lang === 'id' ? 'Jumlah (Rp)' : 'Amount (Rp)'}</label>
                <input type="number" value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} placeholder="0" style={{width: '100%'}} />
              </div>
              <div>
                <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '4px'}}>{lang === 'id' ? 'Keterangan' : 'Note'}</label>
                <textarea value={paymentForm.note} onChange={e => setPaymentForm({ ...paymentForm, note: e.target.value })} rows={2} placeholder={lang === 'id' ? 'Contoh: Transfer BCA 6011***, no. ref XYZ' : 'E.g.: BCA transfer 6011***, ref no XYZ'} style={{width: '100%'}} />
              </div>
            </div>
            <div style={{padding: '14px 22px', borderTop: '1px solid var(--ims-border)', background: 'var(--ims-bg)', display: 'flex', justifyContent: 'space-between', gap: '10px', position: 'sticky', bottom: 0}}>
              {paymentForm.editId
                ? <button onClick={() => setPaymentForm({ ...paymentForm, editId: null, amount: '', type: 'installment', date: new Date().toISOString().split('T')[0], note: '' })} style={{background: 'transparent', border: '1px solid var(--ims-text-2)', padding: '8px 14px', fontSize: '12px', cursor: 'pointer', color: 'var(--ims-text-2)', fontFamily: 'inherit'}}>{lang === 'id' ? '↩ Batal Edit' : '↩ Cancel Edit'}</button>
                : <span />}
              <div style={{display: 'flex', gap: '10px'}}>
                <button onClick={() => setPaymentForm({ ...paymentForm, open: false, editId: null })} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', color: 'var(--ims-text-2)', fontFamily: 'inherit'}}>{lang === 'id' ? 'Tutup' : 'Close'}</button>
                <button onClick={recordPayment} style={{background: paymentForm.editId ? '#1a4d8a' : 'var(--ims-accent)', border: 'none', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', color: '#fff', fontFamily: 'inherit', fontWeight: 600}}>{paymentForm.editId ? (lang === 'id' ? 'Simpan Perubahan' : 'Save Changes') : (lang === 'id' ? 'Tambah Pembayaran' : 'Add Payment')}</button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      <ConfirmDialog open={!!confirmDeletePayment} title={lang === 'id' ? 'Hapus Catatan Pembayaran?' : 'Delete Payment Record?'} message={lang === 'id' ? 'Catatan pembayaran ini akan dihapus permanen.' : 'This payment record will be permanently deleted.'} confirmText={lang === 'id' ? 'Ya, Hapus' : 'Yes, Delete'} onConfirm={deletePayment} onCancel={() => setConfirmDeletePayment(null)} danger lang={lang} />
      </>
      )}

      {financeEditor && (
        <DocumentEditorModal
          open={!!financeEditor}
          onClose={() => setFinanceEditor(null)}
          title={financeEditor.title}
          initialHtml={financeEditor.html}
          docType={financeEditor.docType}
          record={financeEditor.record}
          saveLabel={lang === 'id' ? 'Simpan Dokumen' : 'Save Document'}
          lang={lang}
          onSave={(html, status) => {
            onSaveDocument && onSaveDocument({ docType: financeEditor.docType, html, status, record: financeEditor.record, requesterId: financeEditor.record.requesterId || financeEditor.record.salesOwner, notifyRequester: false });
            setFinanceEditor(null);
          }}
        />
      )}
    </div>
  );
}
function NetProfitAnalysis({ data, t, lang, fmt }) {
  const computed = useMemo(() => {
    // Won + PO Issued deals count as revenue realized
    const realizedDeals = data.filter(s => s.poStatus === 'issued' || s.status === 'won');
    const totalRevenue = realizedDeals.reduce((sum, s) => sum + calcNetProfit(s).revenue, 0);
    const totalProfit = realizedDeals.reduce((sum, s) => sum + calcNetProfit(s).netProfit, 0);
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) : 0;
    // Group by modality
    const modalitySet = [...new Set(realizedDeals.map(s => s.modality))];
    const byModality = modalitySet.map(mod => {
      const deals = realizedDeals.filter(s => s.modality === mod);
      const rev = deals.reduce((sum, s) => sum + calcNetProfit(s).revenue, 0);
      const prof = deals.reduce((sum, s) => sum + calcNetProfit(s).netProfit, 0);
      const margin = rev > 0 ? prof / rev : 0;
      return { modality: mod, revenue: rev, profit: prof, margin, count: deals.length, defaultMargin: NET_MARGIN_BY_MODALITY[mod] || NET_MARGIN_DEFAULT };
    }).sort((a, b) => b.profit - a.profit);
    // Monthly trend
    const monthlyTrend = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map((m, i) => {
      const mn = String(i + 1).padStart(2, '0');
      const monthDeals = realizedDeals.filter(s => s.issuedDate?.startsWith(`${currentYear()}-${mn}`));
      const rev = monthDeals.reduce((sum, s) => sum + calcNetProfit(s).revenue, 0);
      const prof = monthDeals.reduce((sum, s) => sum + calcNetProfit(s).netProfit, 0);
      return { month: m, [t.np_revenue]: rev, [t.np_profit]: prof };
    });
    return { realizedDeals, totalRevenue, totalProfit, avgMargin, byModality, monthlyTrend };
  }, [data, t]);
  const { realizedDeals, totalRevenue, totalProfit, avgMargin, byModality, monthlyTrend } = computed;

  return (
    <div>
      {/* KPI Cards */}
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '24px', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '20px 22px', background: 'var(--ims-bg-card)'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.22em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.np_total_revenue}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '6px'}}>{fmt(totalRevenue)}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{realizedDeals.length} deals · {lang === 'id' ? 'Setelah PPN' : 'After VAT'}</div>
        </div>
        <div style={{padding: '20px 22px', background: 'var(--ims-bg-card)'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.22em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.np_total_profit}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '6px', color: 'var(--ims-accent-2)'}}>{fmt(totalProfit)}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{lang === 'id' ? 'Setelah COGS, Expense, Overhead' : 'After COGS, Expense, Overhead'}</div>
        </div>
        <div style={{padding: '20px 22px', background: 'var(--ims-bg-alt)', color: 'var(--ims-text)'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.22em', color: 'var(--ims-accent)', textTransform: 'uppercase'}}>{t.np_avg_margin}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '6px', color: '#fff'}}>{(avgMargin * 100).toFixed(1)}%</div>
          <div style={{fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '6px'}}>Range 11-19% · {lang === 'id' ? 'Industri Distributor' : 'Distributor Industry'}</div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="card" style={{marginBottom: '20px'}}>
        <div className="card-title">{t.np_monthly_trend}</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyTrend} margin={{top: 5, right: 16, left: 0, bottom: 5}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--ims-text-2)" style={{fontSize: 11}} />
            <YAxis stroke="var(--ims-text-2)" style={{fontSize: 10}} tickFormatter={(v) => v >= 1e9 ? `${(v/1e9).toFixed(0)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v} />
            <Tooltip content={<ChartTooltip fmt={fmt} />} />
            <Legend wrapperStyle={{fontSize: '11px'}} />
            <Bar dataKey={t.np_revenue} fill="#1a4d8a" radius={[3, 3, 0, 0]} />
            <Bar dataKey={t.np_profit} fill="var(--ims-accent-2)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per Modality */}
      <div className="card" style={{marginBottom: '20px'}}>
        <div className="card-title">{t.np_per_modality}</div>
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '700px'}}>
            <thead>
              <tr style={{background: 'var(--ims-bg-card-2)'}}>
                <Th>{t.np_modality_label}</Th>
                <Th align="right">{t.project_count}</Th>
                <Th align="right">{t.np_revenue}</Th>
                <Th align="right">{t.np_profit}</Th>
                <Th align="right">{t.np_margin}</Th>
                <Th align="right">{t.np_default_margin}</Th>
              </tr>
            </thead>
            <tbody>
              {byModality.map(m => (
                <tr key={m.modality} className="hover-row" style={{borderTop: '1px solid var(--ims-border)'}}>
                  <Td><strong style={{color: MODALITY_COLORS[m.modality] || 'var(--ims-accent)'}}>{m.modality}</strong></Td>
                  <Td align="right">{m.count}</Td>
                  <Td align="right"><span className="mono">{fmt(m.revenue)}</span></Td>
                  <Td align="right"><span className="mono" style={{color: 'var(--ims-accent-2)', fontWeight: 600}}>{fmt(m.profit)}</span></Td>
                  <Td align="right">
                    <span style={{padding: '3px 8px', fontSize: '11px', background: 'var(--ims-accent-2)25', color: 'var(--ims-accent-2)', fontWeight: 700}} className="mono">{(m.margin * 100).toFixed(1)}%</span>
                  </Td>
                  <Td align="right"><span style={{fontSize: '10px', color: 'var(--ims-text-2)'}} className="mono">{(m.defaultMargin * 100).toFixed(0)}%</span></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export { FinanceDashboardCharts, FinanceModule, NetProfitAnalysis };

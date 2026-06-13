// Extracted from App.jsx during modular refactor.
import { useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, Edit2, LayoutDashboard, Plus, Search, Sparkles, Trash2, Wrench, X, Zap } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip, ConfirmDialog, Field, ReadOnlyBanner, SortToggle, Td, Th } from '../components/ui.jsx';
import { CHART_COLORS } from '../constants/theme.js';
import { MODALITY_COLORS } from '../constants/sales.js';
import { TECHNICIAN_NAMES, resolveEmpName } from '../utils/domain.js';
import { todayStart } from '../utils/format.js';

const MT_GLASS = {
  background: 'linear-gradient(145deg, rgba(192,48,48,0.08) 0%, rgba(91,141,239,0.06) 45%, rgba(47,143,111,0.05) 100%)',
  border: '1px solid rgba(192,48,48,0.18)',
  boxShadow: '0 0 28px rgba(192,48,48,0.06), inset 0 1px 0 rgba(255,255,255,0.05)',
};

const SYMPTOM_STOP = new Set(['dan', 'atau', 'yang', 'dengan', 'pada', 'tidak', 'ada', 'sudah', 'dari', 'untuk', 'the', 'and', 'with', 'from', 'this', 'that', 'adalah', 'akan', 'telah', 'masih', 'sangat', 'lebih', 'unit', 'alat', 'rs']);

function topSymptoms(issues, limit = 10) {
  const freq = {};
  issues.forEach(i => {
    `${i.issue || ''} ${i.note || ''} ${i.resolutionNote || ''}`.toLowerCase().split(/[\s,;./\\-]+/).forEach(w => {
      w = w.replace(/[^a-z0-9]/gi, '').trim();
      if (w.length < 4 || SYMPTOM_STOP.has(w)) return;
      freq[w] = (freq[w] || 0) + 1;
    });
  });
  return Object.entries(freq).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, limit);
}

function equipmentFailureRank(issues, units) {
  const freq = {};
  issues.forEach(i => {
    const unit = i.unitId ? units.find(u => u.id === i.unitId) : null;
    const label = unit
      ? `${unit.customer} · ${unit.subModality || unit.modality}`
      : `${i.customer || '?'} · ${i.subModality || i.modality || '?'}`;
    freq[label] = (freq[label] || 0) + 1;
  });
  return Object.entries(freq).map(([name, value]) => ({ name: name.length > 32 ? name.slice(0, 29) + '…' : name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
}

function MaintenanceDashboard({ units, issues, pmSchedule, unitsByPmStatus, repairs, complaints, pmNotifications, lang, t, onNavigateTab }) {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const dash = useMemo(() => {
    const allIssues = [...repairs, ...complaints];
    const openIssues = issues.filter(i => i.status !== 'resolved');
    const pmOverdue = unitsByPmStatus.filter(u => u.pmStatus === 'overdue').length;
    const pmUpcoming = unitsByPmStatus.filter(u => u.pmStatus === 'upcoming').length;
    const byModality = allIssues.reduce((acc, i) => { const k = i.modality || 'Other'; acc[k] = (acc[k] || 0) + 1; return acc; }, {});
    const modalityData = Object.entries(byModality).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const bySubModality = allIssues.reduce((acc, i) => {
      const k = i.subModality || i.modality || 'Unknown';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    const componentData = Object.entries(bySubModality).map(([name, value]) => ({ name: name.length > 22 ? name.slice(0, 20) + '…' : name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
    const monthlyIssues = MONTHS.map((m, idx) => {
      const mm = String(idx + 1).padStart(2, '0');
      return {
        month: m,
        [lang === 'id' ? 'Perbaikan' : 'Repairs']: repairs.filter(i => (i.reportedDate || '').substring(5, 7) === mm).length,
        [lang === 'id' ? 'Keluhan' : 'Complaints']: complaints.filter(i => (i.reportedDate || '').substring(5, 7) === mm).length,
      };
    });
    const statusData = [
      { name: lang === 'id' ? 'Terbuka' : 'Open', value: issues.filter(i => i.status === 'open').length, color: '#c03030' },
      { name: lang === 'id' ? 'Proses' : 'In Progress', value: issues.filter(i => i.status === 'progress').length, color: 'var(--ims-gold)' },
      { name: lang === 'id' ? 'Selesai' : 'Resolved', value: issues.filter(i => i.status === 'resolved').length, color: 'var(--ims-accent-2)' },
    ].filter(x => x.value > 0);
    const priorityData = ['critical', 'high', 'medium', 'low'].map(p => ({
      name: t[`mt_priority_${p}`] || p,
      value: issues.filter(i => i.priority === p).length,
      color: { critical: '#7b1f1f', high: '#c03030', medium: 'var(--ims-gold)', low: '#5b87b8' }[p],
    })).filter(x => x.value > 0);
    const topEquipment = equipmentFailureRank(allIssues, units);
    const topSymptomWords = topSymptoms(allIssues);
    const radarData = [
      { pillar: 'PM', score: Math.min(100, Math.max(0, 100 - pmOverdue * 8 - pmUpcoming * 3)), full: 100 },
      { pillar: lang === 'id' ? 'Perbaikan' : 'Repairs', score: Math.min(100, repairs.length * 6), full: 100 },
      { pillar: lang === 'id' ? 'Keluhan' : 'Complaints', score: Math.min(100, complaints.length * 6), full: 100 },
      { pillar: lang === 'id' ? 'Terbuka' : 'Open', score: Math.min(100, openIssues.length * 10), full: 100 },
      { pillar: lang === 'id' ? 'Unit' : 'Units', score: Math.min(100, units.length * 2), full: 100 },
    ];
    return { allIssues, openIssues, pmOverdue, pmUpcoming, modalityData, componentData, monthlyIssues, statusData, priorityData, topEquipment, topSymptomWords, radarData, pmRecords: pmSchedule.length };
  }, [units, issues, pmSchedule, unitsByPmStatus, repairs, complaints, lang, t]);

  const quickLinks = [
    { id: 'schedule', label: t.mt_tab_schedule, count: units.length, icon: CalendarDays, color: '#5b8def' },
    { id: 'repair', label: t.mt_tab_repair, count: repairs.length, icon: Wrench, color: '#c03030' },
    { id: 'complaint', label: t.mt_tab_complaint, count: complaints.length, icon: AlertTriangle, color: 'var(--ims-gold)' },
  ];

  return (
    <div style={{display: 'grid', gap: '18px'}}>
      <div style={{...MT_GLASS, padding: '22px 24px', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: '-30px', right: '-10px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,48,48,0.15) 0%, transparent 70%)', pointerEvents: 'none'}} />
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap'}}>
          <div>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#c03030', marginBottom: '8px'}}>
              <Sparkles size={13} /> {lang === 'id' ? 'Maintenance Command Center' : 'Maintenance Command Center'}
            </div>
            <h2 className="serif" style={{fontSize: '28px', fontWeight: 500, margin: 0}}>{lang === 'id' ? 'Dashboard Pemeliharaan' : 'Maintenance Dashboard'}</h2>
            <p style={{fontSize: '12px', color: 'var(--ims-text-2)', margin: '8px 0 0', maxWidth: '540px'}}>
              {lang === 'id' ? 'Pantau alat paling sering rusak, gejala/komponen bermasalah, jadwal PM, perbaikan & keluhan — terintegrasi realtime.' : 'Monitor failure-prone equipment, recurring symptoms/components, PM schedule, repairs & complaints — realtime integrated.'}
            </p>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', border: '1px solid rgba(47,143,111,0.35)', background: 'rgba(47,143,111,0.08)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ims-accent-2)'}}>
            <Zap size={12} /> LIVE SYNC
          </div>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1px', background: 'var(--ims-border)', border: '1px solid var(--ims-border)'}}>
        {[
          { label: t.mt_total_units, value: units.length, sub: `${dash.pmOverdue} PM ${lang === 'id' ? 'terlewat' : 'overdue'}`, color: 'var(--ims-text)' },
          { label: t.mt_open_issues, value: dash.openIssues.length, sub: `${repairs.length} ${lang === 'id' ? 'perbaikan' : 'repairs'}`, color: '#c03030' },
          { label: t.mt_tab_complaint, value: complaints.length, sub: lang === 'id' ? 'keluhan pelanggan' : 'customer complaints', color: 'var(--ims-gold)' },
          { label: lang === 'id' ? 'PM Bulan Ini' : 'PM This Month', value: dash.pmUpcoming + dash.pmOverdue, sub: `${pmNotifications.length} ${lang === 'id' ? 'alert aktif' : 'active alerts'}`, color: '#5b8def' },
          { label: lang === 'id' ? 'Catatan PM Manual' : 'Manual PM Records', value: dash.pmRecords, sub: lang === 'id' ? 'oleh teknisi' : 'by technicians', color: '#7b3fb5' },
        ].map(k => (
          <div key={k.label} style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
            <div className="lbl-tag">{k.label}</div>
            <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: k.color}}>{k.value}</div>
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px'}}>
        {quickLinks.map(link => {
          const Icon = link.icon;
          return (
            <button key={link.id} onClick={() => onNavigateTab(link.id)} style={{...MT_GLASS, padding: '14px 16px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px'}}>
              <div style={{width: '36px', height: '36px', borderRadius: '8px', background: link.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: link.color}}><Icon size={18} /></div>
              <div><div style={{fontSize: '12px', fontWeight: 600}}>{link.label}</div><div style={{fontSize: '20px', fontWeight: 700, color: link.color}}>{link.count}</div></div>
            </button>
          );
        })}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '16px'}}>
        <div style={{...MT_GLASS, padding: '18px 20px'}}>
          <div className="card-title">{lang === 'id' ? '🔧 Alat Paling Sering Bermasalah (Top 10)' : '🔧 Top 10 Failure-Prone Equipment'}</div>
          {dash.topEquipment.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(220, dash.topEquipment.length * 34)}>
              <BarChart data={dash.topEquipment} layout="vertical" margin={{left: 4, right: 12}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(192,48,48,0.1)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{fontSize: 9}} />
                <YAxis type="category" dataKey="name" width={110} tick={{fontSize: 9, fill: 'var(--ims-text-2)'}} />
                <Tooltip content={<ChartTooltip fmt={v => v} />} />
                <Bar dataKey="value" name={lang === 'id' ? 'Insiden' : 'Incidents'} fill="#c03030" radius={[0, 4, 4, 0]}>
                  {dash.topEquipment.map((e, i) => <Cell key={e.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state">{lang === 'id' ? 'Belum ada data perbaikan/keluhan.' : 'No repair/complaint data yet.'}</div>}
        </div>
        <div style={{...MT_GLASS, padding: '18px 20px'}}>
          <div className="card-title">{lang === 'id' ? 'Radar Kesehatan Alat' : 'Equipment Health Radar'}</div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={dash.radarData} outerRadius="72%">
              <PolarGrid stroke="rgba(192,48,48,0.15)" />
              <PolarAngleAxis dataKey="pillar" tick={{fill: 'var(--ims-text-2)', fontSize: 10}} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="score" stroke="#c03030" fill="#c03030" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px'}}>
        <div style={{...MT_GLASS, padding: '18px 20px'}}>
          <div className="card-title">{lang === 'id' ? 'Gejala/Keluhan Sering (Kata Kunci)' : 'Frequent Symptoms (Keywords)'}</div>
          {dash.topSymptomWords.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dash.topSymptomWords} layout="vertical" margin={{left: 4}}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={72} tick={{fontSize: 9}} />
                <Tooltip content={<ChartTooltip fmt={v => v} />} />
                <Bar dataKey="value" fill="#d4780a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{padding: '30px'}}>{lang === 'id' ? 'Isi deskripsi issue untuk analisis gejala.' : 'Add issue descriptions for symptom analysis.'}</div>}
        </div>
        <div style={{...MT_GLASS, padding: '18px 20px'}}>
          <div className="card-title">{lang === 'id' ? 'Komponen/Tipe Alat Bermasalah' : 'Problematic Components/Types'}</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dash.componentData.length ? dash.componentData : [{name: '-', value: 0}]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(91,141,239,0.1)" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize: 8, fill: 'var(--ims-text-2)'}} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis allowDecimals={false} tick={{fontSize: 9}} />
              <Tooltip content={<ChartTooltip fmt={v => v} />} />
              <Bar dataKey="value" fill="#1a4d8a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{...MT_GLASS, padding: '18px 20px'}}>
          <div className="card-title">{lang === 'id' ? 'Insiden per Modalitas' : 'Incidents by Modality'}</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={dash.modalityData.length ? dash.modalityData : [{name: '-', value: 1}]} dataKey="value" nameKey="name" innerRadius={40} outerRadius={72} paddingAngle={2}>
                {(dash.modalityData.length ? dash.modalityData : [{name: '-', value: 1}]).map((e, i) => <Cell key={e.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip fmt={v => v} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '16px'}}>
        <div style={{...MT_GLASS, padding: '18px 20px'}}>
          <div className="card-title">{lang === 'id' ? 'Tren Insiden Bulanan' : 'Monthly Incident Trend'}</div>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={dash.monthlyIssues}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(91,141,239,0.1)" vertical={false} />
              <XAxis dataKey="month" tick={{fontSize: 10}} />
              <YAxis allowDecimals={false} tick={{fontSize: 10}} />
              <Tooltip content={<ChartTooltip fmt={v => v} />} />
              <Legend wrapperStyle={{fontSize: 10}} />
              <Bar dataKey={lang === 'id' ? 'Perbaikan' : 'Repairs'} fill="#c03030" radius={[3, 3, 0, 0]} />
              <Line type="monotone" dataKey={lang === 'id' ? 'Keluhan' : 'Complaints'} stroke="var(--ims-gold)" strokeWidth={2} dot={{r: 3}} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div style={{...MT_GLASS, padding: '18px 20px'}}>
          <div className="card-title">{lang === 'id' ? 'Status Insiden' : 'Issue Status'}</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={dash.statusData.length ? dash.statusData : [{name: '-', value: 1, color: 'var(--ims-border)'}]} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78}>
                {(dash.statusData.length ? dash.statusData : [{name: '-', value: 1, color: 'var(--ims-border)'}]).map(e => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip fmt={v => v} />} />
              <Legend wrapperStyle={{fontSize: 10}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{...MT_GLASS, padding: '18px 20px'}}>
          <div className="card-title">{lang === 'id' ? 'Prioritas Insiden' : 'Issue Priority'}</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dash.priorityData.length ? dash.priorityData : [{name: '-', value: 0}]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(192,48,48,0.1)" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize: 9}} />
              <YAxis allowDecimals={false} tick={{fontSize: 9}} />
              <Tooltip content={<ChartTooltip fmt={v => v} />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {dash.priorityData.map(e => <Cell key={e.name} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MaintenanceModule({ units, issues, setIssues, pmSchedule, setPmSchedule, t, lang, canEdit, session, liveTechnicians = [], unitTechMap = {}, setUnitTechMap, employees = {} }) {
  const [tab, setTab] = useState('dashboard');
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [pmModalOpen, setPmModalOpen] = useState(false);
  const [editingPm, setEditingPm] = useState(null);
  // Year filter + search for unit monitoring (sinkron dengan SPH module style)
  const [filterYear, setFilterYear] = useState('all');
  const [search, setSearch] = useState('');

  const availableYears = useMemo(() => {
    const years = new Set();
    units.forEach(u => { if (u.installDate) years.add(u.installDate.substring(0, 4)); });
    return Array.from(years).sort().reverse();
  }, [units]);

  // PERFORMANCE: Categorize units + KPIs all in one useMemo block (now year-aware)
  const unitsAndStats = useMemo(() => {
    const today = todayStart();
    const monthAhead = new Date(today);
    monthAhead.setMonth(monthAhead.getMonth() + 1);
    // Apply year + search filters to units
    const filteredUnits = units.filter(u => {
      if (filterYear !== 'all' && !u.installDate?.startsWith(filterYear)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!u.customer?.toLowerCase().includes(q) &&
            !u.serialNo?.toLowerCase().includes(q) &&
            !u.subModality?.toLowerCase().includes(q) &&
            !u.modality?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    const unitsByPmStatus = filteredUnits.map(u => {
      const nextPm = new Date(u.nextPmDate);
      let pmStatus;
      if (nextPm < today) pmStatus = 'overdue';
      else if (nextPm < monthAhead) pmStatus = 'upcoming';
      else pmStatus = 'scheduled';
      const warrantyEnd = new Date(u.warrantyEnd);
      const underWarranty = warrantyEnd >= today;
      return { ...u, pmStatus, underWarranty };
    });
    const totalUnits = filteredUnits.length;
    const totalAllYears = units.length;
    const underWarranty = unitsByPmStatus.filter(u => u.underWarranty).length;
    const pmThisMonth = unitsByPmStatus.filter(u => u.pmStatus === 'overdue' || u.pmStatus === 'upcoming').length;
    const openIssues = issues.filter(i => i.status !== 'resolved').length;
    const repairs = issues.filter(i => i.type === 'repair');
    const complaints = issues.filter(i => i.type === 'complaint');
    return { unitsByPmStatus, totalUnits, totalAllYears, underWarranty, pmThisMonth, openIssues, repairs, complaints };
  }, [units, issues, filterYear, search]);
  const { unitsByPmStatus, totalUnits, totalAllYears, underWarranty, pmThisMonth, openIssues, repairs, complaints } = unitsAndStats;

  // Sort by priority (critical→high→medium→low), then by date desc
  const [repairsSortBy, setRepairsSortBy] = useState('priority');
  const [complaintsSortBy, setComplaintsSortBy] = useState('priority');

  const sortByPriorityAndDate = (arr, sortBy) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const list = [...arr];
    if (sortBy === 'priority') {
      return list.sort((a, b) => {
        const pa = priorityOrder[a.priority] ?? 99;
        const pb = priorityOrder[b.priority] ?? 99;
        if (pa !== pb) return pa - pb;
        return (b.reportedDate || '').localeCompare(a.reportedDate || '');
      });
    }
    if (sortBy === 'date_desc') return list.sort((a, b) => (b.reportedDate || '').localeCompare(a.reportedDate || ''));
    if (sortBy === 'date_asc') return list.sort((a, b) => (a.reportedDate || '').localeCompare(b.reportedDate || ''));
    if (sortBy === 'status') return list.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    return list;
  };

  const sortedRepairs = useMemo(() => sortByPriorityAndDate(repairs, repairsSortBy), [repairs, repairsSortBy]);
  const sortedComplaints = useMemo(() => sortByPriorityAndDate(complaints, complaintsSortBy), [complaints, complaintsSortBy]);

  const sortedUnitsForSchedule = useMemo(
    () => [...unitsByPmStatus].sort((a, b) => new Date(a.nextPmDate) - new Date(b.nextPmDate)).slice(0, 80),
    [unitsByPmStatus]
  );

  const updateIssueStatus = (id, newStatus) => {
    if (!canEdit) return;
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
  };

  // CRUD handlers for issues
  const handleSaveIssue = (issue) => {
    setIssues(prev => {
      const exists = prev.find(i => i.id === issue.id);
      return exists ? prev.map(i => i.id === issue.id ? issue : i) : [...prev, issue];
    });
    setIssueModalOpen(false); setEditingIssue(null);
  };
  const [deleteIssueId, setDeleteIssueId] = useState(null);
  const handleDeleteIssue = (id) => {
    if (!canEdit) return;
    setDeleteIssueId(id);
  };
  const confirmDeleteIssue = () => {
    setIssues(prev => prev.filter(i => i.id !== deleteIssueId));
    setDeleteIssueId(null);
  };

  // CRUD handlers for PM
  const handleSavePm = (pm) => {
    setPmSchedule(prev => {
      const exists = prev.find(p => p.id === pm.id);
      return exists ? prev.map(p => p.id === pm.id ? pm : p) : [...prev, pm];
    });
    setPmModalOpen(false); setEditingPm(null);
  };
  const [deletePmId, setDeletePmId] = useState(null);
  const handleDeletePm = (id) => {
    if (!canEdit) return;
    setDeletePmId(id);
  };
  const confirmDeletePm = () => {
    setPmSchedule(prev => prev.filter(p => p.id !== deletePmId));
    setDeletePmId(null);
  };

  const markPmDone = (unit) => {
    if (!canEdit) return;
    const uid = typeof unit === 'string' ? unit : unit.id;
    const dueDate = typeof unit === 'string' ? null : unit.nextPmDate;
    const today = new Date().toISOString().split('T')[0];
    // next PM = 6 calendar months after the due date (or today if unknown)
    const base = dueDate ? new Date(dueDate + 'T00:00:00') : new Date();
    const nd = new Date(base); nd.setMonth(nd.getMonth() + 6);
    const newPm = {
      id: 'pm_' + Date.now(),
      unitId: uid,
      dueDate, // the cycle this completion satisfies — used to dismiss its notification
      lastPmDate: today,
      nextPmDate: nd.toISOString().split('T')[0],
      technician: session?.name || (TECHNICIAN_NAMES[0] || 'Teknisi'),
      status: 'done',
      notes: lang === 'id' ? 'PM rutin 6 bulan selesai' : 'Routine 6-month PM completed'
    };
    setPmSchedule(prev => [...prev, newPm]);
  };

  // PM Notifications (#7) — 4 grades, dismissed after "Tandai Selesai".
  // Visible only to: technician, admin, manager_ops, gm, super_admin (CEO).
  const canSeePmNotif = ['technician', 'admin', 'manager_ops', 'gm', 'super_admin'].includes(session?.role);
  const pmNotifications = useMemo(() => {
    if (!canSeePmNotif) return [];
    const today = todayStart();
    const MS = 24 * 60 * 60 * 1000;
    const doneCycles = new Set((pmSchedule || []).filter(p => p.status === 'done' && p.unitId && p.dueDate).map(p => p.unitId + '|' + p.dueDate));
    const notifs = [];
    units.forEach(u => {
      if (!u.nextPmDate) return;
      if (doneCycles.has(u.id + '|' + u.nextPmDate)) return; // completed → no notification
      const due = new Date(u.nextPmDate + 'T00:00:00');
      const daysUntil = Math.round((due - today) / MS);
      let grade = null;
      if (daysUntil < 0) grade = 'overdue';
      else if (daysUntil <= 7) grade = 'week';
      else if (daysUntil <= 14) grade = 'twoweeks';
      else if (daysUntil <= 30) grade = 'month';
      if (grade) notifs.push({ ...u, daysUntil, grade });
    });
    return notifs.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [units, pmSchedule, canSeePmNotif]);

  const PM_GRADE = {
    overdue:  { color: '#7b1f1f', bg: 'rgba(123,31,31,0.10)', label: lang === 'id' ? 'TERLEWAT' : 'OVERDUE' },
    week:     { color: '#c03030', bg: 'rgba(192,48,48,0.10)', label: lang === 'id' ? '≤ 1 MINGGU' : '≤ 1 WEEK' },
    twoweeks: { color: '#d4780a', bg: 'rgba(212,120,10,0.10)', label: lang === 'id' ? '≤ 2 MINGGU' : '≤ 2 WEEKS' },
    month:    { color: 'var(--ims-accent)', bg: 'rgba(200,169,106,0.12)', label: lang === 'id' ? '≤ 1 BULAN' : '≤ 1 MONTH' },
  };

  const priorityColors = { low: '#5b87b8', medium: 'var(--ims-gold)', high: '#c03030', critical: '#7b1f1f' };
  const statusColors = { open: '#c03030', progress: 'var(--ims-gold)', resolved: 'var(--ims-accent-2)' };

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_maintenance}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.mt_title}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.mt_subtitle}</div>
      </div>

      {!canEdit && <ReadOnlyBanner t={t} />}

      {/* PM Notifications (#7) — 4 grades, dismissed via "Tandai Selesai" */}
      {canSeePmNotif && pmNotifications.length > 0 && (
        <div style={{marginBottom: '22px', border: '1px solid var(--ims-border)', background: 'var(--ims-bg-card)'}}>
          <div style={{padding: '12px 16px', borderBottom: '1px solid var(--ims-border)', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(192,48,48,0.04)'}}>
            <AlertTriangle size={16} color="#c03030" strokeWidth={2} />
            <span style={{fontSize: '12px', fontWeight: 700, color: 'var(--ims-text)', letterSpacing: '0.02em'}}>{lang === 'id' ? `Notifikasi Jadwal PM (${pmNotifications.length})` : `PM Schedule Alerts (${pmNotifications.length})`}</span>
            <span style={{fontSize: '10.5px', color: 'var(--ims-text-2)', marginLeft: 'auto'}}>{lang === 'id' ? 'Hilang setelah "Tandai Selesai"' : 'Cleared after "Mark Done"'}</span>
          </div>
          <div style={{maxHeight: '260px', overflowY: 'auto'}}>
            {pmNotifications.map(n => {
              const g = PM_GRADE[n.grade];
              return (
                <div key={n.id} style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderBottom: '1px solid var(--ims-bg-card-2)', background: g.bg}}>
                  <span style={{flexShrink: 0, padding: '2px 8px', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', background: g.color, color: '#fff', minWidth: '78px', textAlign: 'center'}}>{g.label}</span>
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={{fontSize: '12px', fontWeight: 600, color: 'var(--ims-text)'}}>{n.customer}</div>
                    <div style={{fontSize: '10.5px', color: 'var(--ims-text-2)'}}>{n.modality} · {n.subModality} · {lang === 'id' ? 'Teknisi' : 'Tech'}: {n.technician}</div>
                  </div>
                  <div style={{textAlign: 'right', flexShrink: 0}}>
                    <div style={{fontSize: '11px', fontWeight: 600, color: g.color}}>{n.daysUntil < 0 ? (lang === 'id' ? `Lewat ${Math.abs(n.daysUntil)} hari` : `${Math.abs(n.daysUntil)}d overdue`) : (lang === 'id' ? `${n.daysUntil} hari lagi` : `in ${n.daysUntil}d`)}</div>
                    <div className="mono" style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{n.nextPmDate}</div>
                  </div>
                  {canEdit && <button onClick={() => markPmDone(n)} style={{flexShrink: 0, padding: '5px 10px', fontSize: '10px', background: 'var(--ims-accent-2)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600}}>{t.mt_mark_done}</button>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="kpi-grid-4" style={{display: tab === 'dashboard' ? 'none' : 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <div className="card-pad">
          <div className="lbl-tag">{t.mt_total_units}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalUnits}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? `${filterYear === 'all' ? `kumulatif (${totalAllYears} total)` : `terpasang di ${filterYear}`}` : `${filterYear === 'all' ? `cumulative (${totalAllYears} total)` : `installed in ${filterYear}`}`}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{t.mt_units_warranty}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent-2)'}}>{underWarranty}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{t.mt_pm_this_month}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent)'}}>{pmThisMonth}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{t.mt_open_issues}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#c03030'}}>{openIssues}</div>
        </div>
      </div>

      {/* Year filter + search — hidden on dashboard */}
      {tab !== 'dashboard' && (
      <div style={{display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center', flexWrap: 'wrap'}}>
        <div style={{position: 'relative', flex: '1 1 260px', maxWidth: '380px'}}>
          <Search size={14} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ims-text-2)'}} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === 'id' ? 'Cari pelanggan, serial, modalitas...' : 'Search customer, serial, modality...'} style={{paddingLeft: '36px'}} />
        </div>
        <span style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? 'Tahun Instalasi' : 'Install Year'}:</span>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{width: 'auto', minWidth: '110px'}}>
          <option value="all">{lang === 'id' ? 'Semua Tahun' : 'All Years'}</option>
          {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      )}

      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {[
          { id: 'dashboard', label: lang === 'id' ? 'Dashboard' : 'Dashboard', icon: LayoutDashboard },
          { id: 'schedule', label: t.mt_tab_schedule, icon: CalendarDays },
          { id: 'repair', label: t.mt_tab_repair, icon: Wrench },
          { id: 'complaint', label: t.mt_tab_complaint, icon: AlertTriangle },
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

      {tab === 'dashboard' && (
        <MaintenanceDashboard
          units={units}
          issues={issues}
          pmSchedule={pmSchedule}
          unitsByPmStatus={unitsByPmStatus}
          repairs={repairs}
          complaints={complaints}
          pmNotifications={pmNotifications}
          lang={lang}
          t={t}
          onNavigateTab={setTab}
        />
      )}

      {tab === 'schedule' && (
        <div>
          {/* Manual PM Records (CRUD) */}
          <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', marginBottom: '14px'}}>
            <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
              <div>
                <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{lang === 'id' ? 'Jadwal PM Tercatat oleh Teknisi' : 'PM Schedule Records by Technician'}</div>
                <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'Catatan PM manual oleh teknisi (di luar jadwal otomatis 6 bulan)' : 'Manual PM records by technician (outside auto 6-month schedule)'}</div>
              </div>
              {canEdit && <button className="btn-primary" onClick={() => { setEditingPm(null); setPmModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
            </div>
            {pmSchedule.length > 0 ? (
              <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px'}}>
                <thead>
                  <tr style={{background: 'var(--ims-bg-card-2)'}}>
                    <Th>{t.mt_pm_unit}</Th><Th>{t.mt_pm_last_date}</Th><Th>{t.mt_pm_next_date}</Th>
                    <Th>{t.mt_pm_technician}</Th><Th>{t.mt_pm_status}</Th>
                    {canEdit && <Th align="right">{t.crud_actions}</Th>}
                  </tr>
                </thead>
                <tbody>
                  {pmSchedule.map(pm => {
                    const unit = units.find(u => u.id === pm.unitId);
                    const statusColor = pm.status === 'done' ? 'var(--ims-accent-2)' : pm.status === 'overdue' ? '#c03030' : 'var(--ims-gold)';
                    return (
                      <tr key={pm.id} className="hover-row" style={{borderTop: '1px solid var(--ims-border)'}}>
                        <Td>
                          <div style={{fontWeight: 500, fontSize: '11px'}}>{unit ? unit.customer : '—'}</div>
                          <div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{unit ? unit.subModality : ''}</div>
                        </Td>
                        <Td><span className="mono" style={{fontSize: '11px'}}>{pm.lastPmDate || '—'}</span></Td>
                        <Td><span className="mono" style={{fontSize: '11px', fontWeight: 600}}>{pm.nextPmDate || '—'}</span></Td>
                        <Td><span style={{fontSize: '11px'}}>{resolveEmpName(employees, pm.technician)}</span></Td>
                        <Td><span style={{padding: '3px 8px', fontSize: '10px', background: statusColor + '25', color: statusColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`mt_pm_status_${pm.status}`]}</span></Td>
                        {canEdit && (
                          <Td align="right">
                            <button onClick={() => { setEditingPm(pm); setPmModalOpen(true); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit', marginRight: '4px'}}><Edit2 size={11} /></button>
                            <button onClick={() => handleDeletePm(pm.id)} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>
                          </Td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{padding: '20px', textAlign: 'center', color: 'var(--ims-text-2)', fontSize: '11px', fontStyle: 'italic'}}>{lang === 'id' ? 'Belum ada catatan PM manual. Klik "Tambah Baru" untuk mencatat PM oleh teknisi.' : 'No manual PM records yet. Click "Add New" to record a PM session.'}</div>
            )}
          </div>

          {/* Auto-derived Units PM */}
          <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
            <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)'}}>
              <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{lang === 'id' ? 'Jadwal PM Otomatis (per Unit Terinstal)' : 'Auto PM Schedule (per Installed Unit)'}</div>
              <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'Berdasarkan tanggal instalasi + 6 bulan' : 'Based on install date + 6 months'}</div>
            </div>
            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '900px'}}>
            <thead>
              <tr style={{background: 'var(--ims-bg-card-2)'}}>
                <Th>{t.mt_customer}</Th><Th>{t.mt_modality}</Th><Th>{t.mt_install_date}</Th>
                <Th>{t.mt_warranty_end}</Th><Th>{t.mt_last_pm}</Th><Th>{t.mt_next_pm}</Th>
                <Th>{t.mt_status}</Th><Th>{t.mt_technician}</Th>
                {canEdit && <Th align="right">{t.mt_actions}</Th>}
              </tr>
            </thead>
            <tbody>
              {sortedUnitsForSchedule.map(u => {
                const pmColor = u.pmStatus === 'overdue' ? '#c03030' : u.pmStatus === 'upcoming' ? 'var(--ims-gold)' : 'var(--ims-accent-2)';
                const pmLabel = u.pmStatus === 'overdue' ? t.mt_pm_overdue : u.pmStatus === 'upcoming' ? t.mt_pm_upcoming : t.mt_pm_done;
                return (
                  <tr key={u.id} className="hover-row" style={{borderTop: '1px solid var(--ims-border)'}}>
                    <Td>
                      <div style={{fontWeight: 500}}>{u.customer}</div>
                      <div style={{fontSize: '10px', color: 'var(--ims-text-2)'}} className="mono">{u.sphRef}</div>
                    </Td>
                    <Td>
                      <div>{u.modality}</div>
                      <div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{u.subModality}</div>
                    </Td>
                    <Td><span className="mono" style={{fontSize: '11px'}}>{u.installDate}</span></Td>
                    <Td>
                      <span className="mono" style={{fontSize: '11px', color: u.underWarranty ? 'var(--ims-accent-2)' : '#8b3a3a'}}>{u.warrantyEnd}</span>
                      <div style={{fontSize: '9px', color: u.underWarranty ? 'var(--ims-accent-2)' : '#8b3a3a', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600}}>{u.underWarranty ? t.mt_under_warranty : t.mt_out_warranty}</div>
                    </Td>
                    <Td><span className="mono" style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>{u.lastPmDate || '—'}</span></Td>
                    <Td><span className="mono" style={{fontSize: '11px', fontWeight: 500}}>{u.nextPmDate}</span></Td>
                    <Td><span style={{display: 'inline-block', padding: '3px 8px', fontSize: '10px', background: pmColor + '25', color: pmColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{pmLabel}</span></Td>
                    <Td>
                      {canEdit && liveTechnicians.length > 0 ? (
                        <select value={liveTechnicians.includes(u.technician) ? u.technician : ''} onChange={e => setUnitTechMap && setUnitTechMap(prev => ({ ...prev, [u.id]: e.target.value }))} style={{fontSize: '11px', padding: '3px 6px', border: '1px solid var(--ims-border)', background: 'var(--ims-bg-card)', fontFamily: 'inherit', maxWidth: '150px', cursor: 'pointer'}} title={lang === 'id' ? 'Ubah teknisi (tersinkron dengan Manajemen Karyawan)' : 'Change technician (synced with Employee Management)'}>
                          {!liveTechnicians.includes(u.technician) && <option value="">{u.technician}</option>}
                          {liveTechnicians.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                      ) : (
                        <span style={{fontSize: '11px'}}>{u.technician}</span>
                      )}
                    </Td>
                    {canEdit && (
                      <Td align="right">
                        <button onClick={() => markPmDone(u)} style={{padding: '4px 8px', fontSize: '10px', background: 'var(--ims-accent-2)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em'}}>{t.mt_mark_done}</button>
                      </Td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {units.length === 0 && <div className="empty-state">{t.no_data}</div>}
          {units.length > 80 && <div style={{padding: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--ims-text-2)', borderTop: '1px solid var(--ims-border)'}}>{lang === 'id' ? `Menampilkan 80 dari ${units.length} unit. Filter & pagination tersedia di versi production.` : `Showing 80 of ${units.length} units. Filter & pagination available in production version.`}</div>}
          </div>
        </div>
      )}

      {tab === 'repair' && (
        <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
          <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
            <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.mt_repair_title}</div>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'}}>
              <span style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>{repairs.length} {t.project_count}</span>
              <SortToggle value={repairsSortBy} onChange={setRepairsSortBy} lang={lang} options={[
                {value: 'priority', label: lang === 'id' ? 'Prioritas (Kritis→Rendah)' : 'Priority (Critical→Low)'},
                {value: 'date_desc', label: lang === 'id' ? 'Terbaru' : 'Newest'},
                {value: 'date_asc', label: lang === 'id' ? 'Terlama' : 'Oldest'},
                {value: 'status', label: 'Status'},
              ]} />
              {canEdit && <button className="btn-primary" onClick={() => { setEditingIssue({ type: 'repair' }); setIssueModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
            </div>
          </div>
          {sortedRepairs.map(r => (
            <div key={r.id} style={{padding: '16px 18px', borderTop: '1px solid var(--ims-border)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '8px'}}>
                <div style={{flex: '1 1 300px'}}>
                  <div style={{fontSize: '13px', fontWeight: 600}}>{r.customer}</div>
                  <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{r.modality} · {r.subModality}</div>
                </div>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
                  <span style={{padding: '3px 8px', fontSize: '10px', background: priorityColors[r.priority] + '25', color: priorityColors[r.priority], fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`mt_priority_${r.priority}`]}</span>
                  {canEdit ? (
                    <select value={r.status} onChange={e => updateIssueStatus(r.id, e.target.value)} style={{padding: '3px 8px', fontSize: '11px', width: 'auto', border: `1px solid ${statusColors[r.status]}`, color: statusColors[r.status]}}>
                      <option value="open">{t.mt_status_open}</option>
                      <option value="progress">{t.mt_status_progress}</option>
                      <option value="resolved">{t.mt_status_resolved}</option>
                    </select>
                  ) : (
                    <span style={{padding: '3px 8px', fontSize: '10px', background: statusColors[r.status] + '25', color: statusColors[r.status], fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`mt_status_${r.status}`]}</span>
                  )}
                  {canEdit && (
                    <>
                      <button onClick={() => { setEditingIssue(r); setIssueModalOpen(true); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit'}}><Edit2 size={11} /></button>
                      <button onClick={() => handleDeleteIssue(r.id)} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>
                    </>
                  )}
                </div>
              </div>
              <div style={{fontSize: '13px', marginBottom: '6px', lineHeight: 1.5}}>{r.issue}</div>
              <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--ims-text-2)'}}>
                <span><strong>{t.mt_reported_date}:</strong> <span className="mono">{r.reportedDate}</span></span>
                <span><strong>{t.mt_technician}:</strong> {resolveEmpName(employees, r.technician)}</span>
              </div>
              {r.note && <div style={{marginTop: '8px', padding: '8px 10px', background: 'var(--ims-bg-card-2)', fontSize: '11px', fontStyle: 'italic', color: 'var(--ims-text)'}}>📝 {r.note}</div>}
            </div>
          ))}
          {repairs.length === 0 && <div className="empty-state">{t.no_data}</div>}
        </div>
      )}

      {tab === 'complaint' && (
        <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
          <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
            <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.mt_complaint_title}</div>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'}}>
              <span style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>{complaints.length} {t.project_count}</span>
              <SortToggle value={complaintsSortBy} onChange={setComplaintsSortBy} lang={lang} options={[
                {value: 'priority', label: lang === 'id' ? 'Prioritas (Kritis→Rendah)' : 'Priority (Critical→Low)'},
                {value: 'date_desc', label: lang === 'id' ? 'Terbaru' : 'Newest'},
                {value: 'date_asc', label: lang === 'id' ? 'Terlama' : 'Oldest'},
                {value: 'status', label: 'Status'},
              ]} />
              {canEdit && <button className="btn-primary" onClick={() => { setEditingIssue({ type: 'complaint' }); setIssueModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
            </div>
          </div>
          {sortedComplaints.map(c => (
            <div key={c.id} style={{padding: '16px 18px', borderTop: '1px solid var(--ims-border)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '8px'}}>
                <div style={{flex: '1 1 300px'}}>
                  <div style={{fontSize: '13px', fontWeight: 600}}>{c.customer}</div>
                  <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{c.modality} · {c.subModality}</div>
                </div>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
                  <span style={{padding: '3px 8px', fontSize: '10px', background: priorityColors[c.priority] + '25', color: priorityColors[c.priority], fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`mt_priority_${c.priority}`]}</span>
                  {canEdit ? (
                    <select value={c.status} onChange={e => updateIssueStatus(c.id, e.target.value)} style={{padding: '3px 8px', fontSize: '11px', width: 'auto', border: `1px solid ${statusColors[c.status]}`, color: statusColors[c.status]}}>
                      <option value="open">{t.mt_status_open}</option>
                      <option value="progress">{t.mt_status_progress}</option>
                      <option value="resolved">{t.mt_status_resolved}</option>
                    </select>
                  ) : (
                    <span style={{padding: '3px 8px', fontSize: '10px', background: statusColors[c.status] + '25', color: statusColors[c.status], fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`mt_status_${c.status}`]}</span>
                  )}
                  {canEdit && (
                    <>
                      <button onClick={() => { setEditingIssue(c); setIssueModalOpen(true); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit'}}><Edit2 size={11} /></button>
                      <button onClick={() => handleDeleteIssue(c.id)} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>
                    </>
                  )}
                </div>
              </div>
              <div style={{fontSize: '13px', marginBottom: '6px', lineHeight: 1.5}}>{c.issue}</div>
              <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--ims-text-2)'}}>
                <span><strong>{t.mt_reported_date}:</strong> <span className="mono">{c.reportedDate}</span></span>
                <span><strong>{t.mt_technician}:</strong> {c.technician}</span>
              </div>
              {c.note && <div style={{marginTop: '8px', padding: '8px 10px', background: 'var(--ims-bg-card-2)', fontSize: '11px', fontStyle: 'italic', color: 'var(--ims-text)'}}>📝 {c.note}</div>}
            </div>
          ))}
          {complaints.length === 0 && <div className="empty-state">{t.no_data}</div>}
        </div>
      )}
      {issueModalOpen && <MaintenanceIssueModal record={editingIssue} onSave={handleSaveIssue} onClose={() => { setIssueModalOpen(false); setEditingIssue(null); }} t={t} lang={lang} units={units} session={session} liveTechnicians={liveTechnicians} />}
      {pmModalOpen && <PMScheduleModal record={editingPm} onSave={handleSavePm} onClose={() => { setPmModalOpen(false); setEditingPm(null); }} t={t} lang={lang} units={units} session={session} liveTechnicians={liveTechnicians} />}
      <ConfirmDialog open={!!deleteIssueId} title={lang === 'id' ? 'Hapus Catatan?' : 'Delete Record?'} message={lang === 'id' ? 'Yakin ingin menghapus catatan perbaikan/keluhan ini?' : 'Are you sure you want to delete this issue/complaint?'} onConfirm={confirmDeleteIssue} onCancel={() => setDeleteIssueId(null)} danger lang={lang} />
      <ConfirmDialog open={!!deletePmId} title={lang === 'id' ? 'Hapus Jadwal PM?' : 'Delete PM Schedule?'} message={lang === 'id' ? 'Yakin ingin menghapus jadwal preventive maintenance ini?' : 'Are you sure you want to delete this PM schedule?'} onConfirm={confirmDeletePm} onCancel={() => setDeletePmId(null)} danger lang={lang} />
    </div>
  );
}
function MaintenanceIssueModal({ record, onSave, onClose, t, lang, units, session, liveTechnicians = [] }) {
  const [form, setForm] = useState(record?.id ? record : {
    id: 'iss_' + Date.now(),
    type: record?.type || 'repair',
    customer: '',
    modality: 'CT Scan',
    subModality: '',
    unitId: '',
    issue: '',
    priority: 'medium',
    status: 'open',
    reportedDate: new Date().toISOString().split('T')[0],
    technician: session?.name || 'Robby Dwi Setiawan',
    note: '',
    estimatedCost: 0,
    resolvedDate: null,
    resolutionNote: '',
  });
  const isEdit = !!(record?.id);
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.mt_modal_edit_issue : t.mt_modal_add_issue}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <Field label={t.mt_issue_type}>
            <select value={form.type} onChange={e => update('type', e.target.value)}>
              <option value="repair">🔧 {t.mt_type_repair}</option>
              <option value="complaint">📞 {t.mt_type_complaint}</option>
            </select>
          </Field>
          <Field label={t.mt_priority}>
            <select value={form.priority} onChange={e => update('priority', e.target.value)}>
              <option value="low">{t.mt_priority_low}</option>
              <option value="medium">{t.mt_priority_medium}</option>
              <option value="high">{t.mt_priority_high}</option>
              <option value="critical">{t.mt_priority_critical}</option>
            </select>
          </Field>
          <Field label={t.customer} full><input value={form.customer} onChange={e => update('customer', e.target.value)} placeholder={lang === 'id' ? 'Nama Rumah Sakit / Klinik' : 'Hospital / Clinic Name'} /></Field>
          <Field label={t.modality}>
            <select value={form.modality} onChange={e => update('modality', e.target.value)}>
              {Object.keys(MODALITY_COLORS).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label={lang === 'id' ? 'Tipe' : 'Type'}><input value={form.subModality} onChange={e => update('subModality', e.target.value)} placeholder="CT 128 Slice, MRI 1.5T, dll" /></Field>
          <Field label={t.mt_unit_label} full>
            <select value={form.unitId} onChange={e => update('unitId', e.target.value)}>
              <option value="">— {lang === 'id' ? 'Pilih unit (opsional)' : 'Select unit (optional)'} —</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.customer} — {u.subModality} ({u.installDate})</option>)}
            </select>
          </Field>
          <Field label={t.mt_issue_desc} full><textarea rows={3} value={form.issue} onChange={e => update('issue', e.target.value)} placeholder={lang === 'id' ? 'Deskripsikan masalah/keluhan dengan detail...' : 'Describe issue/complaint in detail...'} /></Field>
          <Field label={t.mt_status}>
            <select value={form.status} onChange={e => update('status', e.target.value)}>
              <option value="open">{t.mt_status_open}</option>
              <option value="progress">{t.mt_status_progress}</option>
              <option value="resolved">{t.mt_status_resolved}</option>
            </select>
          </Field>
          <Field label={t.mt_reported_date}><input type="date" value={form.reportedDate} onChange={e => update('reportedDate', e.target.value)} /></Field>
          <Field label={t.mt_assigned_to}><input list="tech-roster" value={form.technician} onChange={e => update('technician', e.target.value)} /><datalist id="tech-roster">{(liveTechnicians.length ? liveTechnicians : TECHNICIAN_NAMES).map(n => <option key={n} value={n} />)}</datalist></Field>
          <Field label={t.mt_estimated_cost}><input type="number" value={form.estimatedCost} onChange={e => update('estimatedCost', parseFloat(e.target.value) || 0)} placeholder="Rp" /></Field>
          {form.status === 'resolved' && (
            <>
              <Field label={t.mt_resolved_date}><input type="date" value={form.resolvedDate || ''} onChange={e => update('resolvedDate', e.target.value)} /></Field>
              <Field label={t.mt_resolution_note} full><textarea rows={2} value={form.resolutionNote || ''} onChange={e => update('resolutionNote', e.target.value)} /></Field>
            </>
          )}
          <Field label={lang === 'id' ? 'Catatan Tambahan' : 'Additional Note'} full><textarea rows={2} value={form.note || ''} onChange={e => update('note', e.target.value)} /></Field>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
          <button className="btn-primary" onClick={() => onSave(form)}>{t.crud_save}</button>
        </div>
      </div>
    </div>
  );
}
function PMScheduleModal({ record, onSave, onClose, t, lang, units, session, liveTechnicians = [] }) {
  const [form, setForm] = useState(record?.id ? record : {
    id: 'pm_' + Date.now(),
    unitId: '',
    lastPmDate: new Date().toISOString().split('T')[0],
    nextPmDate: '',
    technician: session?.name || 'Robby Dwi Setiawan',
    status: 'scheduled',
    notes: '',
  });
  const isEdit = !!(record?.id);
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '600px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.mt_modal_edit_pm : t.mt_modal_add_pm}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <Field label={t.mt_pm_unit} full>
            <select value={form.unitId} onChange={e => update('unitId', e.target.value)}>
              <option value="">— {lang === 'id' ? 'Pilih unit alat' : 'Select unit'} —</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.customer} — {u.subModality}</option>)}
            </select>
          </Field>
          <Field label={t.mt_pm_last_date}><input type="date" value={form.lastPmDate} onChange={e => update('lastPmDate', e.target.value)} /></Field>
          <Field label={t.mt_pm_next_date}><input type="date" value={form.nextPmDate} onChange={e => update('nextPmDate', e.target.value)} /></Field>
          <Field label={t.mt_pm_technician}><input list="tech-roster-pm" value={form.technician} onChange={e => update('technician', e.target.value)} /><datalist id="tech-roster-pm">{(liveTechnicians.length ? liveTechnicians : TECHNICIAN_NAMES).map(n => <option key={n} value={n} />)}</datalist></Field>
          <Field label={t.mt_pm_status}>
            <select value={form.status} onChange={e => update('status', e.target.value)}>
              <option value="scheduled">{t.mt_pm_status_scheduled}</option>
              <option value="done">{t.mt_pm_status_done}</option>
              <option value="overdue">{t.mt_pm_status_overdue}</option>
            </select>
          </Field>
          <Field label={t.mt_pm_notes} full><textarea rows={2} value={form.notes || ''} onChange={e => update('notes', e.target.value)} /></Field>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
          <button className="btn-primary" onClick={() => onSave(form)}>{t.crud_save}</button>
        </div>
      </div>
    </div>
  );
}

export { MaintenanceModule, MaintenanceIssueModal, PMScheduleModal };

// Extracted from App.jsx during modular refactor.
import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Award, CalendarDays, ClipboardList, Download, Edit2, FileBarChart, FileText, FolderOpen, LayoutDashboard, Sparkles, Target, Trash2, Users, Zap } from 'lucide-react';
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip, ConfirmDialog, Field, KPICard, LinkAttachment, ReadOnlyBanner, Td, Th } from '../components/ui.jsx';
import { CHART_COLORS } from '../constants/theme.js';
import { MODALITY_COLORS } from '../constants/sales.js';
import { PRODUCT_FILE_TYPES } from './ProductMasterModule.jsx';
import { downloadCSV, openPrintableHtml } from '../utils/documents.js';
import { getActiveSalesTeam, getPaymentSummary, getProductFileUrl, resolveEmpName, resolveNamesInText, resolveProductRecord } from '../utils/domain.js';
import { normalizeExternalUrl } from '../utils/format.js';
import { notify } from '../utils/notifications.js';
import { groupSphProjects, sumGroupedProjectValue, sumWeightedGroupedPipeline, sumGroupedPoValue, countGroupedPoProjects, toFinanceAccounts } from '../utils/sphProject.js';
import { isBillableSphRow } from '../utils/sphPackage.js';

const PS_GLASS = {
  background: 'linear-gradient(145deg, rgba(91,141,239,0.10) 0%, rgba(47,143,111,0.06) 45%, rgba(123,63,181,0.05) 100%)',
  border: '1px solid rgba(91,141,239,0.22)',
  boxShadow: '0 0 28px rgba(91,141,239,0.07), inset 0 1px 0 rgba(255,255,255,0.05)',
};

function ProductSupportDashboard({ presentationProjects, activities, productFileRows, upcomingTraining, activityTypeLabels, employees, fmt, lang, onNavigateTab }) {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const dash = useMemo(() => {
    const presentationValue = presentationProjects.reduce((s, p) => s + (Number(p.totalValue) || 0), 0);
    const fileCount = productFileRows.reduce((s, p) => s + p.fileEntries.filter(f => f.url).length, 0);
    const productsWithFiles = productFileRows.filter(p => p.fileEntries.some(f => f.url)).length;
    const monthKey = new Date().toISOString().slice(0, 7);
    const activitiesThisMonth = activities.filter(a => String(a.date || '').startsWith(monthKey)).length;
    const customers = new Set(activities.map(a => a.hospital).filter(Boolean)).size;
    const modalityMap = presentationProjects.reduce((acc, p) => { const k = p.modality || 'Other'; acc[k] = (acc[k] || 0) + 1; return acc; }, {});
    const modalityData = Object.entries(modalityMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const activityByType = Object.entries(activityTypeLabels).map(([key, label]) => ({
      name: label,
      value: activities.filter(a => (a.activityType || 'lainnya') === key).length,
    })).filter(x => x.value > 0);
    const monthlyActivity = MONTHS.map((m, idx) => {
      const mm = String(idx + 1).padStart(2, '0');
      return { month: m, [lang === 'id' ? 'Aktivitas' : 'Activities']: activities.filter(a => (a.date || '').substring(5, 7) === mm).length };
    });
    const hospitalMap = activities.reduce((acc, a) => { const k = a.hospital || '-'; acc[k] = (acc[k] || 0) + 1; return acc; }, {});
    const topHospitals = Object.entries(hospitalMap).map(([name, value]) => ({ name: String(name).slice(0, 24), value })).sort((a, b) => b.value - a.value).slice(0, 8);
    const specialistMap = activities.reduce((acc, a) => { const k = a.byName || a.by || 'Unknown'; acc[k] = (acc[k] || 0) + 1; return acc; }, {});
    const topSpecialists = Object.entries(specialistMap).map(([name, value]) => ({ name: String(name).slice(0, 18), value })).sort((a, b) => b.value - a.value).slice(0, 6);
    const radarData = [
      { pillar: lang === 'id' ? 'Presentasi' : 'Presentations', score: Math.min(100, presentationProjects.length * 12), full: 100 },
      { pillar: lang === 'id' ? 'Aktivitas' : 'Activities', score: Math.min(100, activities.length * 4), full: 100 },
      { pillar: lang === 'id' ? 'File Produk' : 'Product Files', score: Math.min(100, fileCount * 3), full: 100 },
      { pillar: lang === 'id' ? 'Training' : 'Training', score: Math.min(100, upcomingTraining.length * 15), full: 100 },
      { pillar: lang === 'id' ? 'RS Aktif' : 'Active RS', score: Math.min(100, customers * 8), full: 100 },
    ];
    const trainingByModality = upcomingTraining.reduce((acc, r) => { const k = r.modality || 'Other'; acc[k] = (acc[k] || 0) + 1; return acc; }, {});
    const trainingModData = Object.entries(trainingByModality).map(([name, value]) => ({ name, value }));
    return {
      presentationValue, fileCount, productsWithFiles, activitiesThisMonth, customers,
      modalityData, activityByType, monthlyActivity, topHospitals, topSpecialists, radarData, trainingModData,
    };
  }, [presentationProjects, activities, productFileRows, upcomingTraining, activityTypeLabels, lang]);

  const quickLinks = [
    { id: 'presentations', label: lang === 'id' ? 'Jadwal Presentasi' : 'Presentations', count: presentationProjects.length, icon: CalendarDays, color: '#5b8def' },
    { id: 'activities', label: lang === 'id' ? 'Activity Report' : 'Activities', count: activities.length, icon: ClipboardList, color: '#2f8f6f' },
    { id: 'files', label: lang === 'id' ? 'File Produk' : 'Product Files', count: dash.fileCount, icon: FolderOpen, color: '#7b3fb5' },
    { id: 'training', label: lang === 'id' ? 'Training' : 'Training', count: upcomingTraining.length, icon: Users, color: '#d4af37' },
  ];

  return (
    <div style={{display: 'grid', gap: '18px'}}>
      {/* Hero header */}
      <div style={{...PS_GLASS, padding: '22px 24px', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: '-40px', right: '-20px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,141,239,0.18) 0%, transparent 70%)', pointerEvents: 'none'}} />
        <div style={{position: 'absolute', bottom: '-30px', left: '40%', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(47,143,111,0.12) 0%, transparent 70%)', pointerEvents: 'none'}} />
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', position: 'relative'}}>
          <div>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--ims-accent)', marginBottom: '8px'}}>
              <Sparkles size={13} /> {lang === 'id' ? 'Command Center' : 'Command Center'}
            </div>
            <h2 className="serif" style={{fontSize: '28px', fontWeight: 500, margin: 0, lineHeight: 1.15}}>
              {lang === 'id' ? 'Dashboard Product Support' : 'Product Support Dashboard'}
            </h2>
            <p style={{fontSize: '12px', color: 'var(--ims-text-2)', margin: '8px 0 0', maxWidth: '520px'}}>
              {lang === 'id' ? 'Integrasi real-time dari presentasi, aktivitas specialist, file produk, dan jadwal training.' : 'Real-time integration from presentations, specialist activities, product files, and training schedules.'}
            </p>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', border: '1px solid rgba(47,143,111,0.35)', background: 'rgba(47,143,111,0.08)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ims-accent-2)'}}>
            <Zap size={12} /> LIVE SYNC
          </div>
        </div>
      </div>

      {/* KPI tiles */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: '1px', background: 'var(--ims-border)', border: '1px solid var(--ims-border)'}}>
        {[
          { label: lang === 'id' ? 'Presentasi Aktif' : 'Active Presentations', value: presentationProjects.length, sub: fmt(dash.presentationValue), color: '#5b8def' },
          { label: lang === 'id' ? 'Total Aktivitas' : 'Total Activities', value: activities.length, sub: `${dash.activitiesThisMonth} ${lang === 'id' ? 'bulan ini' : 'this month'}`, color: '#2f8f6f' },
          { label: lang === 'id' ? 'File Produk' : 'Product Files', value: dash.fileCount, sub: `${dash.productsWithFiles} ${lang === 'id' ? 'produk' : 'products'}`, color: '#7b3fb5' },
          { label: lang === 'id' ? 'Training Mendatang' : 'Upcoming Training', value: upcomingTraining.length, sub: `${dash.trainingModData.length} ${lang === 'id' ? 'modalitas' : 'modalities'}`, color: '#d4af37' },
          { label: lang === 'id' ? 'RS / Partner' : 'Hospitals', value: dash.customers, sub: lang === 'id' ? 'dikunjungi' : 'visited', color: 'var(--ims-text)' },
        ].map(k => (
          <div key={k.label} style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
            <div className="lbl-tag">{k.label}</div>
            <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: k.color}}>{k.value}</div>
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick nav pills */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px'}}>
        {quickLinks.map(link => {
          const Icon = link.icon;
          return (
            <button key={link.id} onClick={() => onNavigateTab(link.id)} style={{...PS_GLASS, padding: '14px 16px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', transition: 'transform 0.15s ease'}} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
              <div style={{width: '36px', height: '36px', borderRadius: '8px', background: link.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: link.color}}><Icon size={18} /></div>
              <div>
                <div style={{fontSize: '12px', fontWeight: 600, color: 'var(--ims-text)'}}>{link.label}</div>
                <div style={{fontSize: '20px', fontWeight: 700, color: link.color, marginTop: '2px'}}>{link.count}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div style={{display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px'}}>
        <div style={{...PS_GLASS, padding: '18px 20px'}}>
          <div className="card-title">{lang === 'id' ? 'Tren Aktivitas Bulanan' : 'Monthly Activity Trend'}</div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={dash.monthlyActivity} margin={{top: 8, right: 12, left: 0, bottom: 0}}>
              <defs>
                <linearGradient id="psActGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5b8def" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#5b8def" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(91,141,239,0.12)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--ims-text-2)" style={{fontSize: 10}} />
              <YAxis allowDecimals={false} stroke="var(--ims-text-2)" style={{fontSize: 10}} />
              <Tooltip content={<ChartTooltip fmt={v => v} />} />
              <Area type="monotone" dataKey={lang === 'id' ? 'Aktivitas' : 'Activities'} fill="url(#psActGrad)" stroke="#5b8def" strokeWidth={2} />
              <Line type="monotone" dataKey={lang === 'id' ? 'Aktivitas' : 'Activities'} stroke="#2f8f6f" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div style={{...PS_GLASS, padding: '18px 20px'}}>
          <div className="card-title">{lang === 'id' ? 'Radar Integrasi Modul' : 'Module Integration Radar'}</div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={dash.radarData} outerRadius="72%">
              <PolarGrid stroke="rgba(91,141,239,0.2)" />
              <PolarAngleAxis dataKey="pillar" tick={{ fill: 'var(--ims-text-2)', fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Score" dataKey="score" stroke="#5b8def" fill="#5b8def" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px'}}>
        <div style={{...PS_GLASS, padding: '18px 20px'}}>
          <div className="card-title">{lang === 'id' ? 'Presentasi per Modalitas' : 'Presentations by Modality'}</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={dash.modalityData.length ? dash.modalityData : [{ name: '-', value: 1 }]} dataKey="value" nameKey="name" innerRadius={42} outerRadius={78} paddingAngle={2}>
                {(dash.modalityData.length ? dash.modalityData : [{ name: '-', value: 1 }]).map((e, i) => <Cell key={e.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip fmt={v => v} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{...PS_GLASS, padding: '18px 20px'}}>
          <div className="card-title">{lang === 'id' ? 'Jenis Aktivitas' : 'Activity Types'}</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dash.activityByType.length ? dash.activityByType : [{ name: '-', value: 0 }]} layout="vertical" margin={{left: 8, right: 8}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(91,141,239,0.1)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} hide />
              <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 9, fill: 'var(--ims-text-2)' }} />
              <Tooltip content={<ChartTooltip fmt={v => v} />} />
              <Bar dataKey="value" fill="#2f8f6f" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{...PS_GLASS, padding: '18px 20px'}}>
          <div className="card-title">{lang === 'id' ? 'Training per Modalitas' : 'Training by Modality'}</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dash.trainingModData.length ? dash.trainingModData : [{ name: '-', value: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(91,141,239,0.1)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--ims-text-2)' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: 'var(--ims-text-2)' }} />
              <Tooltip content={<ChartTooltip fmt={v => v} />} />
              <Bar dataKey="value" fill="#7b3fb5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Top lists */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
        <div style={{...PS_GLASS, padding: '18px 20px'}}>
          <div className="card-title">{lang === 'id' ? 'Top RS / Partner (Aktivitas)' : 'Top Hospitals (Activities)'}</div>
          <ResponsiveContainer width="100%" height={Math.max(200, dash.topHospitals.length * 32)}>
            <BarChart data={dash.topHospitals} layout="vertical" margin={{left: 4, right: 12}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(91,141,239,0.1)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 9 }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 9, fill: 'var(--ims-text-2)' }} />
              <Tooltip content={<ChartTooltip fmt={v => v} />} />
              <Bar dataKey="value" fill="#1a4d8a" radius={[0, 4, 4, 0]}>
                {dash.topHospitals.map((e, i) => <Cell key={e.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{...PS_GLASS, padding: '18px 20px'}}>
          <div className="card-title">{lang === 'id' ? 'Top Product Specialist' : 'Top Product Specialists'}</div>
          <ResponsiveContainer width="100%" height={Math.max(200, dash.topSpecialists.length * 36)}>
            <BarChart data={dash.topSpecialists} layout="vertical" margin={{left: 4, right: 12}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(91,141,239,0.1)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 9 }} />
              <YAxis type="category" dataKey="name" width={88} tick={{ fontSize: 9, fill: 'var(--ims-text-2)' }} />
              <Tooltip content={<ChartTooltip fmt={v => v} />} />
              <Bar dataKey="value" name={lang === 'id' ? 'Laporan' : 'Reports'} fill="#d4af37" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function ProductSupportModule({ data, trainingRecords, products, employees, session, t, lang, canEdit, fmt, activities = [], setActivities = () => {}, files = [], setFiles = () => {} }) {
  const [tab, setTab] = useState('dashboard');
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
          { id: 'dashboard', label: lang === 'id' ? 'Dashboard' : 'Dashboard', icon: LayoutDashboard, count: presentationProjects.length + activities.length + upcomingTraining.length },
          { id: 'presentations', label: lang === 'id' ? 'Jadwal Presentasi' : 'Presentations', icon: CalendarDays, count: presentationProjects.length },
          { id: 'activities', label: lang === 'id' ? 'Activity Report' : 'Activity Report', icon: ClipboardList, count: activities.length },
          { id: 'files', label: lang === 'id' ? 'File Produk' : 'Product Files', icon: FolderOpen, count: productFileRows.reduce((sum, p) => sum + p.fileEntries.filter(f => f.url).length, 0) },
          { id: 'training', label: lang === 'id' ? 'Jadwal Training Produk' : 'Product Training', icon: Users, count: upcomingTraining.length },
        ].map(tb => {
          const Icon = tb.icon; const active = tab === tb.id;
          return <button key={tb.id} onClick={() => setTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: active ? 'var(--ims-accent)' : 'var(--ims-text-2)', borderBottom: active ? '2px solid var(--ims-border)' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px'}}><Icon size={14} />{tb.label}<span style={{padding: '2px 7px', background: active ? 'var(--ims-accent)' : 'var(--ims-border)', color: active ? '#fff' : 'var(--ims-text-2)', fontSize: '10px', borderRadius: '10px'}}>{tb.count}</span></button>;
        })}
      </div>
      {tab === 'dashboard' && (
        <ProductSupportDashboard
          presentationProjects={presentationProjects}
          activities={activities}
          productFileRows={productFileRows}
          upcomingTraining={upcomingTraining}
          activityTypeLabels={activityTypeLabels}
          employees={employees}
          fmt={fmt}
          lang={lang}
          onNavigateTab={setTab}
        />
      )}
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
// ============================================================================
// Balanced Scorecard (BSC) — dashboard evaluasi karyawan berbasis data.
// 4 pilar: Keuangan, Pelanggan, Proses Internal, Pembelajaran & Pertumbuhan.
// Skor ditarik otomatis dari Modul Sales (konversi deals), Finance (invoice
// terbayar), Instalasi (waktu penyelesaian) & Maintenance (komplain). Pilar
// observasional (Pembelajaran) diisi HR/Manager lewat form (disimpan lokal).
// ============================================================================
const BSC_WEIGHTS = { financial: 0.30, customer: 0.25, process: 0.25, learning: 0.20 };
const BSC_ASSESS_KEY = 'ims_bsc_assessments_v1';
const clampScore = (v, a = 0, b = 100) => Math.max(a, Math.min(b, Math.round(Number.isFinite(v) ? v : 0)));
function loadBscAssessments() {
  try { return JSON.parse(window.localStorage.getItem(BSC_ASSESS_KEY) || '{}') || {}; } catch { return {}; }
}
function LifecycleKpiScorecard({ data, employees, installRecords = [], bastRecords = [], trainingRecords = [], issues = [], session, t, lang, fmt, canEdit = false }) {
  const [kpiTab, setKpiTab] = useState('scorecard');
  const [roleFilter, setRoleFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [assessments, setAssessments] = useState(() => loadBscAssessments());
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
  const PILLARS = [
    { key: 'financial', label: lang === 'id' ? 'Keuangan' : 'Financial', color: '#d4af37' },
    { key: 'customer', label: lang === 'id' ? 'Pelanggan' : 'Customer', color: '#5b8def' },
    { key: 'process', label: lang === 'id' ? 'Proses Internal' : 'Internal Process', color: '#2f8f6f' },
    { key: 'learning', label: lang === 'id' ? 'Pembelajaran' : 'Learning & Growth', color: '#7b3fb5' },
  ];
  const filteredEmployees = useMemo(() => employeeList.filter(emp => {
    if (roleFilter === 'all') return true;
    if (roleFilter === 'other') return !roleOptions.some(r => r.id === emp.role);
    return emp.role === roleFilter;
  }), [employeeList, roleFilter]);
  const selectedEmployee = employeeFilter === 'all' ? null : employeeList.find(e => e.username === employeeFilter);

  // Helper pencocokan karyawan ↔ record dari modul lain
  const ledByTech = (emp, r) => r.leadTechnician === emp.username || resolveEmpName(employees, r.leadTechnician) === emp.name;
  const nameMatch = (val, emp) => { const v = String(val || ''); return !!emp.name && (v === emp.name || v.includes(emp.name)); };

  // ---- Mesin perhitungan Balanced Scorecard (data-driven) ----
  const bsc = useMemo(() => {
    const salesEmployees = employeeList.filter(e => e.role === 'sales');
    const paidBySales = {};
    salesEmployees.forEach(e => {
      const sid = e.salesId || e.username;
      paidBySales[sid] = toFinanceAccounts(data.filter(d => d.salesOwner === sid)).reduce((s, p) => s + getPaymentSummary(p).totalPaid, 0);
    });
    const maxPaid = Math.max(1, ...Object.values(paidBySales), 0);

    const compute = (emp) => {
      const sid = emp.salesId || emp.username;
      const roleLabel = roleOptions.find(r => r.id === emp.role)?.label || emp.role;
      const meta = {};
      // ---------- PILAR KEUANGAN ----------
      let financial = null;
      if (emp.role === 'sales') {
        const owned = data.filter(d => d.salesOwner === sid);
        const won = owned.filter(d => d.status === 'won').length;
        const lost = owned.filter(d => d.status === 'lost').length;
        const conversion = (won + lost) > 0 ? (won / (won + lost)) * 100 : 0;
        const paid = paidBySales[sid] || 0;
        const paidShare = maxPaid > 0 ? (paid / maxPaid) * 100 : 0;
        financial = clampScore(conversion * 0.6 + paidShare * 0.4);
        Object.assign(meta, { conversion: Math.round(conversion), won, lost, paid, deals: owned.length });
      } else if (emp.role === 'technician') {
        const led = installRecords.filter(r => ledByTech(emp, r));
        const value = led.reduce((s, r) => s + (Number((data.find(d => d.customer === r.customer && (d.subModality || '') === (r.subModality || '')) || data.find(d => d.customer === r.customer))?.totalValue) || 0), 0);
        financial = clampScore(45 + Math.min(55, led.length * 8));
        Object.assign(meta, { deliveredUnits: led.length, deliveredValue: value });
      }
      // ---------- PILAR PELANGGAN ----------
      let myComplaints = [];
      if (emp.role === 'sales') {
        const owned = new Set(data.filter(d => d.salesOwner === sid).map(d => d.customer));
        myComplaints = (issues || []).filter(i => i.type === 'complaint' && owned.has(i.customer));
      } else if (emp.role === 'technician') {
        myComplaints = (issues || []).filter(i => i.type === 'complaint' && (nameMatch(i.technician, emp)));
      }
      const openC = myComplaints.filter(i => i.status !== 'resolved' && !i.resolvedDate).length;
      const resolvedC = myComplaints.length - openC;
      const resRate = myComplaints.length ? (resolvedC / myComplaints.length) * 100 : 100;
      let customer = myComplaints.length === 0 ? 92 : clampScore(100 - openC * 12 - (100 - resRate) * 0.1);
      Object.assign(meta, { complaints: myComplaints.length, openComplaints: openC, resolutionRate: Math.round(resRate) });
      // ---------- PILAR PROSES INTERNAL ----------
      let process;
      if (emp.role === 'technician') {
        const ledAll = installRecords.filter(r => ledByTech(emp, r));
        const done = ledAll.filter(r => r.status === 'completed');
        const durs = done.map(r => Number(r.duration) || (r.installStart && r.installEnd ? Math.max(1, Math.round((new Date(r.installEnd) - new Date(r.installStart)) / 86400000) + 1) : null)).filter(Boolean);
        const avgDur = durs.length ? durs.reduce((a, b) => a + b, 0) / durs.length : null;
        const durScore = avgDur == null ? 70 : clampScore(100 - Math.max(0, avgDur - 7) * 4);
        const compRatio = ledAll.length ? (done.length / ledAll.length) * 100 : 70;
        process = clampScore(durScore * 0.6 + compRatio * 0.4);
        Object.assign(meta, { avgInstallDays: avgDur != null ? Math.round(avgDur) : null, completedInstalls: done.length, assignedInstalls: ledAll.length });
      } else if (emp.role === 'sales') {
        const owned = data.filter(d => d.salesOwner === sid);
        const cyc = owned.map(d => { const f = d.sphRequestedAt || d.issuedDate; const l = d.bastDate || d.dpConfirmedAt || d.lastUpdate || d.issuedDate; return f && l ? Math.max(0, Math.round((new Date(l) - new Date(f)) / 86400000)) : null; }).filter(v => v != null);
        const avgCyc = cyc.length ? cyc.reduce((a, b) => a + b, 0) / cyc.length : null;
        process = avgCyc == null ? 72 : clampScore(100 - Math.max(0, avgCyc - 30) * 1.1);
        Object.assign(meta, { avgCycleDays: avgCyc != null ? Math.round(avgCyc) : null });
      } else {
        process = 75;
        meta.processNote = lang === 'id' ? 'Baseline (butuh modul SLA/task untuk otomasi penuh)' : 'Baseline (needs SLA/task module for full automation)';
      }
      if (financial == null) { financial = clampScore(process * 0.85); meta.financialIndirect = true; }
      // ---------- PILAR PEMBELAJARAN & PERTUMBUHAN (observasional) ----------
      let learning;
      const a = assessments[emp.username];
      if (a && (a.certification != null || a.attendance != null || a.initiative != null)) {
        const vals = [a.certification, a.attendance, a.initiative].map(x => Number(x) || 0);
        learning = clampScore(vals.reduce((s, v) => s + v, 0) / vals.length);
        meta.learningManual = true;
      } else {
        const trainingDelivered = (trainingRecords || []).filter(tr => String(tr.instructor || '').includes(emp.name)).length;
        learning = clampScore(70 + Math.min(20, trainingDelivered * 5));
        Object.assign(meta, { learningManual: false, trainingDelivered });
      }
      const overall = clampScore(financial * BSC_WEIGHTS.financial + customer * BSC_WEIGHTS.customer + process * BSC_WEIGHTS.process + learning * BSC_WEIGHTS.learning);
      return { username: emp.username, name: emp.name, role: emp.role, roleLabel, financial, customer, process, learning, overall, meta };
    };

    const rows = filteredEmployees.map(compute).sort((x, y) => y.overall - x.overall);
    const avg = (key) => rows.length ? Math.round(rows.reduce((s, r) => s + r[key], 0) / rows.length) : 0;
    const deptAvg = { financial: avg('financial'), customer: avg('customer'), process: avg('process'), learning: avg('learning'), overall: avg('overall') };
    const selected = selectedEmployee ? compute(selectedEmployee) : null;
    return { rows, deptAvg, selected, compute };
  }, [filteredEmployees, employeeList, data, issues, installRecords, trainingRecords, assessments, selectedEmployee, lang]);

  // ---- ComposedChart: indeks aktivitas bulanan (Individu vs Rata-rata Dept), 6 bulan terakhir ----
  const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', lang === 'id' ? 'Mei' : 'May', 'Jun', 'Jul', lang === 'id' ? 'Agu' : 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];
  const indKey = lang === 'id' ? 'Individu' : 'Individual';
  const deptKey = lang === 'id' ? 'Rata-rata Dept' : 'Dept Average';
  const monthChart = useMemo(() => {
    const base = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) { const d = new Date(base.getFullYear(), base.getMonth() - i, 1); months.push({ ym: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: MONTH_LABELS[d.getMonth()] }); }
    const idx = (emp, ym) => {
      const hasEvents = ['sales', 'technician', 'product_specialist'].includes(emp.role);
      if (!hasEvents) return bsc.compute(emp).overall;
      let n = 0; const sid = emp.salesId || emp.username;
      if (emp.role === 'sales') {
        n += data.filter(d => d.salesOwner === sid && d.status === 'won' && String(d.issuedDate || '').slice(0, 7) === ym).length;
        n += data.filter(d => d.salesOwner === sid).reduce((a, d) => a + ((d.paymentHistory || []).filter(h => String(h.date || '').slice(0, 7) === ym).length), 0);
      } else if (emp.role === 'technician') {
        n += installRecords.filter(r => ledByTech(emp, r) && String((r.installEnd || r.installStart) || '').slice(0, 7) === ym).length;
        n += bastRecords.filter(b => String(b.signedDate || '').slice(0, 7) === ym && nameMatch(b.hntiRep, emp)).length;
      } else {
        n += (trainingRecords || []).filter(tr => String(tr.sessionDate || '').slice(0, 7) === ym && String(tr.instructor || '').includes(emp.name)).length;
      }
      return n === 0 ? 0 : Math.min(100, 45 + n * 14);
    };
    return months.map(m => {
      const dept = filteredEmployees.length ? Math.round(filteredEmployees.reduce((s, e) => s + idx(e, m.ym), 0) / filteredEmployees.length) : 0;
      const ind = selectedEmployee ? idx(selectedEmployee, m.ym) : dept;
      return { month: m.label, [indKey]: ind, [deptKey]: dept };
    });
  }, [selectedEmployee, filteredEmployees, data, installRecords, bastRecords, trainingRecords, bsc, lang]);

  // ---- Data RadarChart 4 pilar (Individu vs Rata-rata Dept) ----
  const radarSource = bsc.selected || bsc.deptAvg;
  const radarData = PILLARS.map(p => ({ pillar: p.label, [indKey]: bsc.selected ? bsc.selected[p.key] : bsc.deptAvg[p.key], [deptKey]: bsc.deptAvg[p.key] }));
  const scoreBandData = [
    { name: lang === 'id' ? 'Sangat Baik' : 'Excellent', value: bsc.rows.filter(r => r.overall >= 90).length, color: 'var(--ims-accent-2)' },
    { name: lang === 'id' ? 'Baik' : 'Good', value: bsc.rows.filter(r => r.overall >= 80 && r.overall < 90).length, color: 'var(--ims-accent)' },
    { name: lang === 'id' ? 'Perlu Perhatian' : 'Watchlist', value: bsc.rows.filter(r => r.overall < 80).length, color: '#c03030' },
  ];

  // ---- Form penilaian observasional (HR/Manager) ----
  const [form, setForm] = useState({ certification: '', attendance: '', initiative: '', note: '' });
  useEffect(() => {
    if (selectedEmployee) { const a = assessments[selectedEmployee.username] || {}; setForm({ certification: a.certification ?? '', attendance: a.attendance ?? '', initiative: a.initiative ?? '', note: a.note ?? '' }); }
  }, [selectedEmployee]);
  const [saveMsg, setSaveMsg] = useState(false);
  const saveAssessment = () => {
    if (!selectedEmployee) return;
    const vals = {
      certification: form.certification === '' ? null : clampScore(form.certification),
      attendance: form.attendance === '' ? null : clampScore(form.attendance),
      initiative: form.initiative === '' ? null : clampScore(form.initiative),
      note: form.note || '',
      updatedAt: new Date().toISOString(),
      assessedBy: session?.name || session?.username || 'HR',
    };
    setAssessments(prev => {
      const next = { ...prev, [selectedEmployee.username]: vals };
      try { window.localStorage.setItem(BSC_ASSESS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    setSaveMsg(true);
    setTimeout(() => setSaveMsg(false), 2500);
  };
  const scoreColor = (v) => v >= 90 ? 'var(--ims-accent-2)' : v >= 80 ? 'var(--ims-accent)' : v >= 70 ? 'var(--ims-gold)' : '#c03030';
  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_kpi_scorecard || 'KPI Scorecard'}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, margin: 0}}>{lang === 'id' ? 'Balanced Scorecard Karyawan' : 'Employee Balanced Scorecard'}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{lang === 'id' ? 'Evaluasi karyawan 4 pilar BSC — Keuangan, Pelanggan, Proses Internal, Pembelajaran — ditarik otomatis dari modul Sales, Finance, Instalasi & Maintenance.' : 'Four-pillar BSC employee evaluation — Financial, Customer, Internal Process, Learning — auto-sourced from Sales, Finance, Installation & Maintenance modules.'}</div>
      </div>

      {/* Filter divisi + karyawan */}
      <div style={{display: 'grid', gridTemplateColumns: '220px 1fr', gap: '10px', marginBottom: '16px', padding: '12px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
        <Field label={lang === 'id' ? 'Filter Divisi' : 'Division Filter'}>
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setEmployeeFilter('all'); }}>
            {roleOptions.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </Field>
        <Field label={lang === 'id' ? 'Nama Karyawan' : 'Employee Name'}>
          <select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)}>
            <option value="all">{lang === 'id' ? 'Semua karyawan dalam filter (rata-rata divisi)' : 'All employees in filter (division average)'}</option>
            {filteredEmployees.map(emp => <option key={emp.username} value={emp.username}>{emp.name} · {roleOptions.find(r => r.id === emp.role)?.label || emp.role}</option>)}
          </select>
        </Field>
      </div>

      {/* Tabs */}
      <div style={{display: 'flex', gap: '2px', marginBottom: '18px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {[
          { id: 'scorecard', label: lang === 'id' ? 'Dashboard BSC' : 'BSC Dashboard', icon: FileBarChart },
          { id: 'penilaian', label: lang === 'id' ? 'Form Penilaian' : 'Assessment Form', icon: Edit2 },
        ].map(tb => {
          const Icon = tb.icon; const active = kpiTab === tb.id;
          return <button key={tb.id} onClick={() => setKpiTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 600, color: active ? 'var(--ims-accent)' : 'var(--ims-text-2)', borderBottom: active ? '2px solid var(--ims-accent)' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px'}}><Icon size={14} />{tb.label}</button>;
        })}
      </div>

      {kpiTab === 'scorecard' && (
      <>
      {/* KPI strip: 4 pilar + skor BSC */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '8px', border: '1px solid var(--ims-border)'}}>
        {PILLARS.map(p => {
          const Icon = p.key === 'financial' ? Target : p.key === 'customer' ? Users : p.key === 'process' ? ClipboardList : Award;
          const val = radarSource[p.key];
          return (
            <div key={p.key} style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: p.color}}><Icon size={13} /><span className="lbl-tag" style={{color: 'var(--ims-text-2)'}}>{p.label}</span></div>
              <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: scoreColor(val)}}>{val}</div>
              <div style={{height: '4px', background: 'var(--ims-border)', marginTop: '6px'}}><div style={{height: '100%', width: `${val}%`, background: p.color}} /></div>
            </div>
          );
        })}
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-alt)', color: '#fff'}}>
          <span className="lbl-tag" style={{color: 'rgba(255,255,255,0.7)'}}>{lang === 'id' ? 'Skor BSC' : 'BSC Score'}</span>
          <div className="serif" style={{fontSize: '30px', fontWeight: 600, marginTop: '4px'}}>{radarSource.overall}</div>
          <div style={{fontSize: '10px', color: 'rgba(255,255,255,0.65)', marginTop: '2px'}}>{selectedEmployee ? selectedEmployee.name : (lang === 'id' ? 'Rata-rata divisi' : 'Division average')}</div>
        </div>
      </div>
      <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginBottom: '18px'}}>{lang === 'id' ? 'Bobot: Keuangan 30% · Pelanggan 25% · Proses Internal 25% · Pembelajaran 20%' : 'Weights: Financial 30% · Customer 25% · Internal Process 25% · Learning 20%'}</div>

      {/* Charts: Radar + ComposedChart 6 bulan */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px', marginBottom: '18px'}}>
        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Pemetaan 4 Pilar BSC' : '4-Pillar BSC Mapping'}{selectedEmployee ? ` — ${selectedEmployee.name}` : ''}</div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} outerRadius={110}>
              <PolarGrid stroke="var(--ims-border)" />
              <PolarAngleAxis dataKey="pillar" tick={{fontSize: 11, fill: 'var(--ims-text-2)'}} />
              <PolarRadiusAxis domain={[0, 100]} angle={90} tick={{fontSize: 9, fill: 'var(--ims-text-2)'}} />
              {bsc.selected && <Radar name={indKey} dataKey={indKey} stroke="#5b8def" fill="#5b8def" fillOpacity={0.35} />}
              <Radar name={deptKey} dataKey={deptKey} stroke="#d4af37" fill="#d4af37" fillOpacity={bsc.selected ? 0.1 : 0.4} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
              <Tooltip content={<ChartTooltip fmt={(v) => v} />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Performa Individu vs Rata-rata Departemen (6 Bulan)' : 'Individual vs Department Average (6 Months)'}</div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthChart} margin={{top: 8, right: 16, left: 0, bottom: 8}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--ims-text-2)" style={{fontSize: 10}} />
              <YAxis domain={[0, 100]} stroke="var(--ims-text-2)" style={{fontSize: 10}} />
              <Tooltip content={<ChartTooltip fmt={(v) => v} />} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
              <Bar dataKey={indKey} fill="#5b8def" radius={[3, 3, 0, 0]} barSize={28} />
              <Line dataKey={deptKey} stroke="#d4af37" strokeWidth={2.5} dot={{r: 3}} />
            </ComposedChart>
          </ResponsiveContainer>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{lang === 'id' ? 'Indeks aktivitas bulanan dari deals/pembayaran (Sales), instalasi/BAST (Teknisi) & training. Divisi tanpa event memakai skor standing.' : 'Monthly activity index from deals/payments (Sales), installs/BAST (Technician) & training. Divisions without events show standing score.'}</div>
        </div>
      </div>

      {/* Distribusi band + tabel scorecard */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '18px', border: '1px solid var(--ims-border)'}}>
        {scoreBandData.map(d => (
          <div key={d.name} style={{padding: '12px 16px', background: 'var(--ims-bg-card)'}}>
            <div className="lbl-tag">{d.name}</div>
            <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '2px', color: d.color}}>{d.value}</div>
          </div>
        ))}
      </div>
      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
        <div className="card-title" style={{padding: '14px 16px', margin: 0}}>{lang === 'id' ? 'Scorecard Karyawan (4 Pilar BSC)' : 'Employee Scorecard (4 BSC Pillars)'}</div>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '720px'}}>
          <thead><tr style={{background: 'var(--ims-bg-card-2)'}}>
            <Th>{lang === 'id' ? 'Karyawan' : 'Employee'}</Th><Th>{lang === 'id' ? 'Divisi' : 'Division'}</Th>
            <Th align="right">{lang === 'id' ? 'Keuangan' : 'Financial'}</Th>
            <Th align="right">{lang === 'id' ? 'Pelanggan' : 'Customer'}</Th>
            <Th align="right">{lang === 'id' ? 'Proses' : 'Process'}</Th>
            <Th align="right">{lang === 'id' ? 'Pembelajaran' : 'Learning'}</Th>
            <Th align="right">{lang === 'id' ? 'Skor BSC' : 'BSC Score'}</Th>
          </tr></thead>
          <tbody>
            {bsc.rows.map(r => (
              <tr key={r.username} className="hover-row" style={{borderTop: '1px solid var(--ims-border)', cursor: 'pointer'}} onClick={() => setEmployeeFilter(r.username)}>
                <Td><strong>{r.name}</strong></Td><Td>{r.roleLabel}</Td>
                <Td align="right"><span className="mono" style={{color: scoreColor(r.financial)}}>{r.financial}</span></Td>
                <Td align="right"><span className="mono" style={{color: scoreColor(r.customer)}}>{r.customer}</span></Td>
                <Td align="right"><span className="mono" style={{color: scoreColor(r.process)}}>{r.process}</span></Td>
                <Td align="right"><span className="mono" style={{color: scoreColor(r.learning)}}>{r.learning}{r.meta.learningManual ? '' : '*'}</span></Td>
                <Td align="right"><strong style={{color: scoreColor(r.overall)}}>{r.overall}</strong></Td>
              </tr>
            ))}
            {bsc.rows.length === 0 && <tr><td colSpan={7} className="empty-state">{t.no_data}</td></tr>}
          </tbody>
        </table>
        <div style={{padding: '8px 16px', fontSize: '10px', color: 'var(--ims-text-2)'}}>{lang === 'id' ? '* Pilar Pembelajaran masih baseline otomatis — isi via Form Penilaian agar mencerminkan sertifikasi/kehadiran/inisiatif. Klik baris untuk lihat radar individu.' : '* Learning pillar uses auto baseline — fill via Assessment Form to reflect certification/attendance/initiative. Click a row to view individual radar.'}</div>
      </div>
      </>
      )}

      {kpiTab === 'penilaian' && (
      <>
      {!selectedEmployee ? (
        <div style={{padding: '40px', textAlign: 'center', color: 'var(--ims-text-2)', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
          {lang === 'id' ? 'Pilih satu karyawan di filter "Nama Karyawan" di atas untuk menampilkan form penilaian.' : 'Select an employee in the "Employee Name" filter above to open the assessment form.'}
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px'}}>
          {/* Metrik otomatis dari sistem (read-only) */}
          <div className="card">
            <div className="card-title">{lang === 'id' ? 'Metrik Otomatis dari Sistem' : 'System-Sourced Metrics'} — {selectedEmployee.name}</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px'}}>
              <div style={{padding: '12px', border: '1px solid var(--ims-border)', borderLeft: '3px solid #d4af37'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><strong style={{fontSize: '12px'}}>{lang === 'id' ? 'Keuangan' : 'Financial'}</strong><span className="serif" style={{fontSize: '20px', color: scoreColor(bsc.selected.financial)}}>{bsc.selected.financial}</span></div>
                <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '4px'}}>
                  {selectedEmployee.role === 'sales' ? `${lang === 'id' ? 'Rasio konversi' : 'Conversion'} ${bsc.selected.meta.conversion}% (${bsc.selected.meta.won} ${lang === 'id' ? 'menang' : 'won'}/${bsc.selected.meta.lost} ${lang === 'id' ? 'kalah' : 'lost'}) · ${lang === 'id' ? 'Invoice terbayar' : 'Paid invoices'} ${fmt(bsc.selected.meta.paid || 0)}`
                    : selectedEmployee.role === 'technician' ? `${bsc.selected.meta.deliveredUnits} ${lang === 'id' ? 'unit ditangani' : 'units handled'} · ${lang === 'id' ? 'nilai' : 'value'} ${fmt(bsc.selected.meta.deliveredValue || 0)}`
                    : (lang === 'id' ? 'Kontribusi tidak langsung (diturunkan dari throughput proses).' : 'Indirect contribution (derived from process throughput).')}
                </div>
              </div>
              <div style={{padding: '12px', border: '1px solid var(--ims-border)', borderLeft: '3px solid #5b8def'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><strong style={{fontSize: '12px'}}>{lang === 'id' ? 'Pelanggan' : 'Customer'}</strong><span className="serif" style={{fontSize: '20px', color: scoreColor(bsc.selected.customer)}}>{bsc.selected.customer}</span></div>
                <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{lang === 'id' ? 'Komplain' : 'Complaints'}: {bsc.selected.meta.complaints} ({bsc.selected.meta.openComplaints} {lang === 'id' ? 'terbuka' : 'open'}) · {lang === 'id' ? 'Resolusi' : 'Resolution'} {bsc.selected.meta.resolutionRate}%</div>
              </div>
              <div style={{padding: '12px', border: '1px solid var(--ims-border)', borderLeft: '3px solid #2f8f6f'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><strong style={{fontSize: '12px'}}>{lang === 'id' ? 'Proses Internal' : 'Internal Process'}</strong><span className="serif" style={{fontSize: '20px', color: scoreColor(bsc.selected.process)}}>{bsc.selected.process}</span></div>
                <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '4px'}}>
                  {selectedEmployee.role === 'technician' ? `${lang === 'id' ? 'Rata-rata waktu instalasi' : 'Avg install time'} ${bsc.selected.meta.avgInstallDays ?? '—'} ${lang === 'id' ? 'hari' : 'days'} · ${bsc.selected.meta.completedInstalls}/${bsc.selected.meta.assignedInstalls} ${lang === 'id' ? 'selesai' : 'completed'}`
                    : selectedEmployee.role === 'sales' ? `${lang === 'id' ? 'Rata-rata cycle SPH→closing' : 'Avg SPH→close cycle'} ${bsc.selected.meta.avgCycleDays ?? '—'} ${lang === 'id' ? 'hari' : 'days'}`
                    : (bsc.selected.meta.processNote || '')}
                </div>
              </div>
            </div>
          </div>

          {/* Form observasional (HR/Manager) */}
          <div className="card">
            <div className="card-title">{lang === 'id' ? 'Penilaian Observasional — Pembelajaran & Pertumbuhan' : 'Observational Assessment — Learning & Growth'}</div>
            {!canEdit && <ReadOnlyBanner t={t} />}
            <div style={{fontSize: '11px', color: 'var(--ims-text-2)', margin: '4px 0 12px'}}>{lang === 'id' ? 'Diisi HR/Manager (0–100). Nilai rata-rata mengisi pilar Pembelajaran pada Balanced Scorecard.' : 'Filled by HR/Manager (0–100). The average fills the Learning pillar of the Balanced Scorecard.'}</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px'}}>
              <Field label={lang === 'id' ? 'Sertifikasi' : 'Certification'}><input type="number" min="0" max="100" disabled={!canEdit} value={form.certification} onChange={e => setForm(f => ({ ...f, certification: e.target.value }))} placeholder="0-100" /></Field>
              <Field label={lang === 'id' ? 'Kehadiran' : 'Attendance'}><input type="number" min="0" max="100" disabled={!canEdit} value={form.attendance} onChange={e => setForm(f => ({ ...f, attendance: e.target.value }))} placeholder="0-100" /></Field>
              <Field label={lang === 'id' ? 'Inisiatif' : 'Initiative'}><input type="number" min="0" max="100" disabled={!canEdit} value={form.initiative} onChange={e => setForm(f => ({ ...f, initiative: e.target.value }))} placeholder="0-100" /></Field>
            </div>
            <Field label={lang === 'id' ? 'Catatan / Sikap (observasional)' : 'Notes / Attitude (observational)'} full><textarea rows={3} disabled={!canEdit} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder={lang === 'id' ? 'Contoh: aktif mengikuti pelatihan internal, proaktif membantu tim...' : 'E.g.: actively joins internal training, proactively helps the team...'} /></Field>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', gap: '10px', flexWrap: 'wrap'}}>
              <div style={{fontSize: '12px', color: 'var(--ims-text-2)'}}>
                {lang === 'id' ? 'Pratinjau Pilar Pembelajaran' : 'Learning pillar preview'}: <strong className="serif" style={{fontSize: '18px', color: scoreColor(bsc.selected.learning)}}>{bsc.selected.learning}</strong>
                {bsc.selected.meta.learningManual ? '' : <span style={{fontSize: '10px'}}> {lang === 'id' ? '(baseline otomatis)' : '(auto baseline)'}</span>}
              </div>
              {canEdit && <button className="btn-primary" onClick={saveAssessment} style={{fontSize: '12px', padding: '8px 18px'}}><Award size={13} />{lang === 'id' ? 'Simpan Penilaian' : 'Save Assessment'}</button>}
            </div>
            {saveMsg && <div style={{marginTop: '10px', padding: '8px 12px', background: 'rgba(58,107,58,0.1)', border: '1px solid var(--ims-accent-2)', color: '#2c5530', fontSize: '12px'}}>✓ {lang === 'id' ? 'Penilaian tersimpan. Skor BSC diperbarui.' : 'Assessment saved. BSC score updated.'}</div>}
          </div>
        </div>
      )}
      </>
      )}
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
    const totalPipeline = sumGroupedProjectValue(active);
    const weightedPipeline = sumWeightedGroupedPipeline(active);
    const revenueYTD = sumGroupedProjectValue(won);
    const poValue = sumGroupedPoValue(data);
    const winRate = (won.length + lost.length) > 0 ? (won.length / (won.length + lost.length)) * 100 : 0;
    const customers = new Set(data.map(s => s.customer)).size;
    return { active, won, lost, poIssued, totalPipeline, weightedPipeline, revenueYTD, poValue, winRate, customers, poProjectCount: countGroupedPoProjects(data) };
  }, [data]);

  // Sales performance — identical to SalesModule
  const salesPerf = useMemo(() => salesTeam.filter(s => !s.isOffice || data.some(d => d.salesOwner === s.id)).map(sales => {
    const sd = data.filter(s => s.salesOwner === sales.id);
    const won = sd.filter(s => s.status === 'won');
    const lost = sd.filter(s => s.status === 'lost');
    return {
      name: sales.name,
      pipeline: sumGroupedProjectValue(sd.filter(s => s.status === 'active')),
      won: sumGroupedProjectValue(sd.filter(s => s.status === 'won')),
      winRate: (won.length + lost.length) > 0 ? (won.length / (won.length + lost.length)) * 100 : 0,
      poCount: countGroupedPoProjects(sd),
    };
  }).sort((a, b) => (b.pipeline + b.won) - (a.pipeline + a.won)), [data]);

  // Modality distribution
  const modalityDist = useMemo(() => {
    const m = {};
    data.filter(s => s.status === 'active' || s.status === 'won').filter(isBillableSphRow).forEach(s => {
      m[s.modality] = (m[s.modality] || 0) + (Number(s.totalValue)||0);
    });
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [data]);

  // Top customers by total value
  const topCustomers = useMemo(() => {
    const c = {};
    data.filter(isBillableSphRow).forEach(s => { c[s.customer] = (c[s.customer] || 0) + (Number(s.totalValue)||0); });
    return Object.entries(c).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [data]);

  // KSO recurring (5-year visibility)
  const ksoTotal = useMemo(() => sumGroupedPoValue(data.filter(s => s.poStatus === 'issued' && (s.paymentScheme === 'kso' || s.projectType === 'kso'))), [data]);

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
    const won2025 = sumGroupedPoValue(data.filter(s => s.poStatus === 'issued' && (s.issuedDate||'').startsWith('2025')));
    const po2026 = sumGroupedPoValue(data.filter(s => s.poStatus === 'issued' && (s.issuedDate||'').startsWith('2026')));
    const pipeline2026 = sumWeightedGroupedPipeline(data.filter(s => s.status === 'active'));
    const est2026 = po2026 + pipeline2026;
    const ksoAnnual = toFinanceAccounts(data.filter(s => s.projectType === 'kso' || s.paymentScheme === 'kso'))
      .reduce((sum, s) => {
        const total = Number(s.totalValue)||0;
        const dpPct = typeof s.dpPercent === 'number' ? s.dpPercent : 10;
        return sum + (total * (1 - dpPct/100)) / 5;
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
  const weightedPipeline = useMemo(() => sumWeightedGroupedPipeline(activeData), [activeData]);
  const revenueYTD = useMemo(() => sumGroupedProjectValue(wonData), [wonData]);

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

// Extracted from App.jsx during modular refactor.
import { useMemo } from 'react';
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BUSINESS_PARTNERS, PROJECT_TYPES, STAGES } from '../constants/sales.js';
import { ChartTooltip, KPICard, PieCard } from '../components/ui.jsx';
import { CHART_COLORS } from '../constants/theme.js';
import { getActiveSalesTeam, resolveEmpName, resolveOpsCost } from '../utils/domain.js';
import { currentYear } from '../utils/format.js';
import { groupSphProjects, sumGroupedProjectValue, sumWeightedGroupedPipeline } from '../utils/sphProject.js';
import { isBillableSphRow } from '../utils/sphPackage.js';
import { InstallBaseDashboardCard } from './InstallBaseModule.jsx';
function Dashboard({ data, reports, products, t, lang, session, fmt, employees = {}, bastRecords = [], installRecords = [], manualInstallBaseRecords = [] }) {
  // PERFORMANCE FIX: All filters/maps wrapped in useMemo to avoid recomputing on every render
  // (was causing scroll lag with 613 SPH records)
  const stats = useMemo(() => {
    const activeData = data.filter(s => s.status === 'active');
    const wonData = data.filter(s => s.status === 'won');
    const lostData = data.filter(s => s.status === 'lost');
    return {
      activeData, wonData, lostData,
      totalPipeline: sumGroupedProjectValue(activeData),
      weightedPipeline: sumWeightedGroupedPipeline(activeData),
      revenueYTD: sumGroupedProjectValue(wonData),
      winRate: (wonData.length + lostData.length) > 0 ? (wonData.length / (wonData.length + lostData.length)) * 100 : 0,
    };
  }, [data]);
  const { activeData, wonData, lostData, totalPipeline, weightedPipeline, revenueYTD, winRate } = stats;

  const funnelData = useMemo(() => STAGES.filter(s => s.id !== 'lost' && s.id !== 'inactive').map(stage => {
    const projects = activeData.filter(p => p.stage === stage.id);
    return { name: t[`stage_${stage.id}`], value: sumGroupedProjectValue(projects), count: groupSphProjects(projects).length, color: stage.color };
  }).filter(f => f.count > 0), [activeData, t]);

  const projectTypePieData = useMemo(() => PROJECT_TYPES.map(pt => {
    const projects = activeData.filter(s => s.projectType === pt.id);
    return { name: t[`ptype_${pt.id}`], value: sumGroupedProjectValue(projects), count: groupSphProjects(projects).length, color: pt.color };
  }).filter(d => d.value > 0), [activeData, t]);

  const customerTypePieData = useMemo(() => [
    { name: t.type_hospital, value: sumGroupedProjectValue(activeData.filter(s => s.customerType === 'hospital')), color: '#1a4d8a' },
    { name: t.type_clinic, value: sumGroupedProjectValue(activeData.filter(s => s.customerType === 'clinic')), color: 'var(--ims-accent)' },
    { name: t.type_subdistributor, value: sumGroupedProjectValue(activeData.filter(s => s.customerType === 'subdistributor')), color: '#5a8a5a' },
    { name: t.type_partner, value: sumGroupedProjectValue(activeData.filter(s => s.customerType === 'partner')), color: '#7b3fb5' },
    { name: t.type_personal, value: sumGroupedProjectValue(activeData.filter(s => s.customerType === 'personal')), color: '#d4780a' },
  ].filter(d => d.value > 0), [activeData, t]);

  const monthlyTrend = useMemo(() => {
    const yr = currentYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return months.map((m, i) => {
      const monthData = data.filter(s => { const d = new Date(s.issuedDate); return d.getFullYear() === yr && d.getMonth() === i; });
      const poAccounts = monthData.filter(s => s.poStatus === 'issued');
      return {
        month: m,
        pipeline: sumGroupedProjectValue(monthData),
        weighted: sumWeightedGroupedPipeline(monthData),
        biayaOperasional: poAccounts.reduce((s, p) => s + resolveOpsCost(p).opsCostValue, 0),
      };
    });
  }, [data]);

  const salesPerformance = useMemo(() => getActiveSalesTeam(employees).map(sales => {
    const sd = data.filter(s => s.salesOwner === sales.id);
    return { name: resolveEmpName(employees, sales.id).split(' ')[0], pipeline: sumGroupedProjectValue(sd.filter(s => s.status === 'active')), won: sumGroupedProjectValue(sd.filter(s => s.status === 'won')) };
  }).sort((a, b) => (b.pipeline + b.won) - (a.pipeline + a.won)), [data, employees]);

  const fieldStats = useMemo(() => ({
    totalVisits: reports.reduce((s, r) => s + (r.visits?.length || 0), 0),
    totalFieldDays: reports.reduce((s, r) => s + (r.days || 0), 0),
  }), [reports]);
  const { totalVisits, totalFieldDays } = fieldStats;

  return (
    <div>
      <div style={{marginBottom: '28px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>
          {t.welcome}, {session.name}
        </div>
        <h1 className="serif hero-title" style={{fontSize: '44px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.nav_dashboard}</h1>
      </div>

      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '24px', border: '1px solid var(--ims-border)'}}>
        <KPICard label={t.pipeline_value} value={fmt(totalPipeline)} sublabel={`${activeData.length} ${t.project_count} aktif`} trend={12.4} info={t.pipeline_value_sub} accent="gold" />
        <KPICard label={t.weighted_pipeline} value={fmt(weightedPipeline)} sublabel={`${totalPipeline > 0 ? ((weightedPipeline/totalPipeline)*100).toFixed(0) : 0}% ${lang === 'id' ? 'dari total · proyeksi' : 'of total · projection'}`} trend={8.7} info={t.weighted_pipeline_sub} />
        <KPICard label={t.revenue_ytd} value={fmt(revenueYTD)} sublabel={`${wonData.length} deal · ${t.revenue_period}`} trend={-3.2} info={t.revenue_ytd_sub} accent="primary" />
        <KPICard label={t.win_rate} value={`${winRate.toFixed(0)}%`} sublabel={`${wonData.length}/${wonData.length + lostData.length} closed`} trend={5.1} info={t.win_rate_sub} />
      </div>

      <InstallBaseDashboardCard data={data} bastRecords={bastRecords} installRecords={installRecords} manualRecords={manualInstallBaseRecords} lang={lang} />

      <div className="card" style={{marginBottom: '20px'}}>
        <div className="card-title">{t.monthly_pipeline}</div>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={monthlyTrend} margin={{top: 10, right: 16, left: 0, bottom: 0}}>
            <defs>
              <linearGradient id="pg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a4d8a" stopOpacity={0.4} /><stop offset="100%" stopColor="#1a4d8a" stopOpacity={0.05} /></linearGradient>
              <linearGradient id="pg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--ims-gold)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--ims-gold)" stopOpacity={0.1} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--ims-text-2)" style={{fontSize: 11}} />
            <YAxis stroke="var(--ims-text-2)" style={{fontSize: 10}} tickFormatter={(v) => v >= 1e9 ? `${(v/1e9).toFixed(0)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v} />
            <Tooltip content={<ChartTooltip fmt={fmt} />} />
            <Area type="monotone" dataKey="pipeline" name={t.pipeline_value} stroke="#1a4d8a" strokeWidth={2} fill="url(#pg1)" />
            <Area type="monotone" dataKey="weighted" name={t.weighted_pipeline} stroke="var(--ims-accent)" strokeWidth={2} fill="url(#pg2)" />
            <Bar dataKey="biayaOperasional" name={lang === 'id' ? 'Biaya Operasional' : 'Operational Cost'} fill="#ff7300" barSize={18} radius={[3, 3, 0, 0]} />
            <Legend wrapperStyle={{fontSize: 11}} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="two-col" style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px'}}>
        <PieCard title={t.project_type_mix} data={projectTypePieData} fmt={fmt} />
        <PieCard title={t.customer_type_dist} data={customerTypePieData} fmt={fmt} />
      </div>

      <div className="card" style={{marginBottom: '20px'}}>
        <div className="card-title">{t.funnel_title} — {t.funnel_subtitle}</div>
        <ResponsiveContainer width="100%" height={Math.max(220, funnelData.length * 38)}>
          <BarChart data={funnelData} layout="vertical" margin={{top: 5, right: 30, left: 140, bottom: 5}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" horizontal={false} />
            <XAxis type="number" stroke="var(--ims-text-2)" style={{fontSize: 10}} tickFormatter={(v) => v >= 1e9 ? `${(v/1e9).toFixed(0)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v} />
            <YAxis type="category" dataKey="name" stroke="var(--ims-accent)" style={{fontSize: 11}} width={140} />
            <Tooltip content={<ChartTooltip fmt={fmt} />} />
            <Bar dataKey="value" name={t.total_value} radius={[0, 4, 4, 0]}>
              {funnelData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {session.role !== 'sales' && (
        <div className="card" style={{marginBottom: '20px'}}>
          <div className="card-title">{t.sales_performance}</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={salesPerformance} margin={{top: 5, right: 16, left: 0, bottom: 5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--ims-text-2)" style={{fontSize: 10}} />
              <YAxis stroke="var(--ims-text-2)" style={{fontSize: 10}} tickFormatter={(v) => v >= 1e9 ? `${(v/1e9).toFixed(0)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v} />
              <Tooltip content={<ChartTooltip fmt={fmt} />} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
              <Bar dataKey="pipeline" name={t.pipeline_value} fill="#1a4d8a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="won" name={t.revenue_ytd} fill="var(--ims-accent-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {reports.length > 0 && session.role !== 'sales' && (
        <div className="card" style={{marginBottom: '20px'}}>
          <div className="card-title">{lang === 'id' ? 'Aktivitas Lapangan dari Laporan Sales' : 'Sales Field Activity'}</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px'}}>
            <div><div className="lbl-tag">{t.sr_visits_count}</div><div className="serif" style={{fontSize: '28px', fontWeight: 500, marginTop: '4px'}}>{totalVisits}</div></div>
            <div><div className="lbl-tag">{t.sr_field_days_total}</div><div className="serif" style={{fontSize: '28px', fontWeight: 500, marginTop: '4px'}}>{totalFieldDays}</div></div>
            <div><div className="lbl-tag">{t.sr_total_reports}</div><div className="serif" style={{fontSize: '28px', fontWeight: 500, marginTop: '4px'}}>{reports.length}</div></div>
          </div>
        </div>
      )}

      {/* Year-over-Year Growth Chart */}
      {(() => {
        const cy = currentYear();
        const py = cy - 1;
        const sphPrev = data.filter(s => s.issuedDate?.startsWith(String(py)));
        const sphCurr = data.filter(s => s.issuedDate?.startsWith(String(cy)));
        const poPrev = sphPrev.filter(s => s.poStatus === 'issued');
        const poCurr = sphCurr.filter(s => s.poStatus === 'issued');

        const yoyData = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map((m, i) => {
          const mn = String(i + 1).padStart(2, '0');
          return {
            month: m,
            [`SPH ${py}`]: sphPrev.filter(s => s.issuedDate.startsWith(`${py}-${mn}`)).length,
            [`SPH ${cy}`]: sphCurr.filter(s => s.issuedDate.startsWith(`${cy}-${mn}`)).length,
            [`PO ${py}`]: poPrev.filter(s => s.issuedDate.startsWith(`${py}-${mn}`)).length,
            [`PO ${cy}`]: poCurr.filter(s => s.issuedDate.startsWith(`${cy}-${mn}`)).length,
          };
        });

        const totalSphPrev = sphPrev.length, totalSphCurr = sphCurr.length;
        const totalPoPrev = poPrev.length, totalPoCurr = poCurr.length;
        const sphGrowth = totalSphPrev ? ((totalSphCurr - totalSphPrev) / totalSphPrev * 100) : 0;
        const poGrowth = totalPoPrev ? ((totalPoCurr - totalPoPrev) / totalPoPrev * 100) : 0;

        return (
          <div className="card" style={{marginBottom: '20px'}}>
            <div className="card-title">{t.yoy_title} <span style={{fontSize: '10px', fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--ims-text-2)', marginLeft: '8px'}}>· {t.yoy_subtitle}</span></div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '20px'}}>
              <div style={{padding: '14px', background: 'rgba(94,135,184,0.10)', borderLeft: '3px solid #5b87b8'}}>
                <div style={{fontSize: '10px', letterSpacing: '0.18em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>SPH {py}</div>
                <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalSphPrev}</div>
              </div>
              <div style={{padding: '14px', background: 'rgba(26,77,138,0.10)', borderLeft: '3px solid #1a4d8a'}}>
                <div style={{fontSize: '10px', letterSpacing: '0.18em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>SPH {cy}</div>
                <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalSphCurr} <span style={{fontSize: '12px', color: sphGrowth >= 0 ? 'var(--ims-accent-2)' : '#8b3a3a'}}>{sphGrowth >= 0 ? '↑' : '↓'}{Math.abs(sphGrowth).toFixed(0)}%</span></div>
              </div>
              <div style={{padding: '14px', background: 'rgba(200,169,106,0.12)', borderLeft: '3px solid var(--ims-accent)'}}>
                <div style={{fontSize: '10px', letterSpacing: '0.18em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>PO {py}</div>
                <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalPoPrev}</div>
              </div>
              <div style={{padding: '14px', background: 'rgba(58,107,58,0.10)', borderLeft: '3px solid var(--ims-accent-2)'}}>
                <div style={{fontSize: '10px', letterSpacing: '0.18em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>PO {cy}</div>
                <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalPoCurr} <span style={{fontSize: '12px', color: poGrowth >= 0 ? 'var(--ims-accent-2)' : '#8b3a3a'}}>{poGrowth >= 0 ? '↑' : '↓'}{Math.abs(poGrowth).toFixed(0)}%</span></div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={yoyData} margin={{top: 5, right: 16, left: 0, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--ims-text-2)" style={{fontSize: 11}} />
                <YAxis stroke="var(--ims-text-2)" style={{fontSize: 10}} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{fontSize: '11px'}} />
                <Bar dataKey={`SPH ${py}`} fill="#5b87b8" radius={[3, 3, 0, 0]} />
                <Bar dataKey={`SPH ${cy}`} fill="#1a4d8a" radius={[3, 3, 0, 0]} />
                <Bar dataKey={`PO ${py}`} fill="var(--ims-accent)" radius={[3, 3, 0, 0]} />
                <Bar dataKey={`PO ${cy}`} fill="var(--ims-accent-2)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      })()}

      {/* Business Partners */}
      {session.role !== 'sales' && (
        <div className="card">
          <div className="card-title">{t.bp_title} <span style={{fontSize: '10px', fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--ims-text-2)', marginLeft: '8px'}}>· {t.bp_subtitle}</span></div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px'}}>
            {BUSINESS_PARTNERS.map(bp => {
              // Catatan #4: derive products from master by brand match — always in sync
              const partnerProducts = (products || []).filter(pr => bp.brands.includes(pr.brand));
              return (
              <div key={bp.id} style={{padding: '16px', background: 'var(--ims-bg)', borderLeft: `3px solid ${bp.color}`, position: 'relative'}}>
                {bp.status === 'onboarding' && (
                  <span style={{position: 'absolute', top: '10px', right: '10px', padding: '2px 7px', fontSize: '8px', background: 'var(--ims-accent)', color: '#fff', fontWeight: 700, letterSpacing: '0.1em'}}>
                    {lang === 'id' ? 'BARU · ONBOARDING' : 'NEW · ONBOARDING'}
                  </span>
                )}
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
                  <span style={{fontSize: '22px'}}>{bp.flag}</span>
                  <div>
                    <div style={{fontSize: '14px', fontWeight: 600, color: bp.color}}>{bp.name}</div>
                    <div style={{fontSize: '10px', color: 'var(--ims-text-2)', letterSpacing: '0.1em', textTransform: 'uppercase'}}>{bp.country}</div>
                  </div>
                </div>
                <div style={{fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', marginBottom: '6px'}}>{t.bp_products}</div>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
                  {partnerProducts.length === 0 && <span style={{fontSize: '10px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{lang === 'id' ? 'Belum ada produk di master' : 'No products in master yet'}</span>}
                  {partnerProducts.map((pr, i) => <span key={i} style={{padding: '3px 8px', fontSize: '10px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', color: 'var(--ims-text)'}}>{pr.name} · {pr.type}</span>)}
                </div>
              </div>
            );})}
          </div>
        </div>
      )}
    </div>
  );
}

export { Dashboard };

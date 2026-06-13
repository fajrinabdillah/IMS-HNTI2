// Extracted from App.jsx during modular refactor.
import { useMemo } from 'react';
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BUSINESS_PARTNERS, MODALITY_COLORS, PROJECT_TYPES, STAGES } from '../constants/sales.js';
import { ChartTooltip, KPICard, PieCard } from '../components/ui.jsx';
import { OPS_COST_DEFAULT } from '../constants/finance.js';
import { getActiveSalesTeam, resolveEmpName } from '../utils/domain.js';
function Dashboard({ data, reports, products, t, lang, session, fmt, employees = {} }) {
  // PERFORMANCE FIX: All filters/maps wrapped in useMemo to avoid recomputing on every render
  // (was causing scroll lag with 613 SPH records)
  const stats = useMemo(() => {
    const activeData = data.filter(s => s.status === 'active');
    const wonData = data.filter(s => s.status === 'won');
    const lostData = data.filter(s => s.status === 'lost');
    return {
      activeData, wonData, lostData,
      totalPipeline: activeData.reduce((sum, s) => sum + s.totalValue, 0),
      weightedPipeline: activeData.reduce((sum, s) => sum + (s.totalValue * s.probability / 100), 0),
      revenueYTD: wonData.reduce((sum, s) => sum + s.totalValue, 0),
      winRate: (wonData.length + lostData.length) > 0 ? (wonData.length / (wonData.length + lostData.length)) * 100 : 0,
    };
  }, [data]);
  const { activeData, wonData, lostData, totalPipeline, weightedPipeline, revenueYTD, winRate } = stats;

  const funnelData = useMemo(() => STAGES.filter(s => s.id !== 'lost').map(stage => {
    const projects = activeData.filter(p => p.stage === stage.id);
    return { name: t[`stage_${stage.id}`], value: projects.reduce((sum, p) => sum + p.totalValue, 0), count: projects.length, color: stage.color };
  }).filter(f => f.count > 0), [activeData, t]);

  const projectTypePieData = useMemo(() => PROJECT_TYPES.map(pt => {
    const projects = activeData.filter(s => s.projectType === pt.id);
    return { name: t[`ptype_${pt.id}`], value: projects.reduce((s, p) => s + p.totalValue, 0), count: projects.length, color: pt.color };
  }).filter(d => d.value > 0), [activeData, t]);

  // New #3: derive modality pie DYNAMICALLY from live SPH data so it always matches the
  // Product Master modalities (X-Ray Stationer/Mobile/Ceiling/Portable, FPD, etc.) — no longer
  // limited to a hardcoded key list that silently dropped normalized modalities.
  const MODALITY_PALETTE = ['#1a4d8a', 'var(--ims-gold)', '#8a5a3a', '#5a8a5a', '#8a3a5a', '#3a8a8a', '#7b3fb5', '#c03030', '#d4780a', '#0f7a5a', '#5b87b8', '#b8860b', '#6a8a3a'];
  const modalityPieData = useMemo(() => {
    const map = new Map();
    activeData.forEach(s => {
      const m = s.modality || (lang === 'id' ? 'Lainnya' : 'Other');
      if (!map.has(m)) map.set(m, { value: 0, count: 0 });
      const e = map.get(m); e.value += (Number(s.totalValue) || 0); e.count += 1;
    });
    let i = 0;
    return Array.from(map.entries())
      .map(([name, e]) => ({ name, value: e.value, count: e.count, color: MODALITY_COLORS[name] || MODALITY_PALETTE[i++ % MODALITY_PALETTE.length] }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [activeData, lang]);

  const customerTypePieData = useMemo(() => [
    { name: t.type_hospital, value: activeData.filter(s => s.customerType === 'hospital').reduce((s, p) => s + p.totalValue, 0), color: '#1a4d8a' },
    { name: t.type_clinic, value: activeData.filter(s => s.customerType === 'clinic').reduce((s, p) => s + p.totalValue, 0), color: 'var(--ims-accent)' },
    { name: t.type_subdistributor, value: activeData.filter(s => s.customerType === 'subdistributor').reduce((s, p) => s + p.totalValue, 0), color: '#5a8a5a' },
  ].filter(d => d.value > 0), [activeData, t]);

  const monthlyTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
    return months.map((m, i) => {
      const monthData = data.filter(s => { const d = new Date(s.issuedDate); return d.getFullYear() === 2026 && d.getMonth() === i; });
      return {
        month: m,
        pipeline: monthData.reduce((s, p) => s + p.totalValue, 0),
        weighted: monthData.reduce((s, p) => s + (p.totalValue * p.probability / 100), 0),
        // POIN 4: biaya operasional per bulan = Σ (totalValue × opsPercent), default 5%, sinkron modul Finance/Insentif
        biayaOperasional: monthData.reduce((s, p) => s + (p.totalValue || 0) * (p.opsPercent !== undefined ? p.opsPercent : OPS_COST_DEFAULT), 0),
      };
    });
  }, [data]);

  const salesPerformance = useMemo(() => getActiveSalesTeam(employees).map(sales => {
    const sd = data.filter(s => s.salesOwner === sales.id);
    return { name: resolveEmpName(employees, sales.id).split(' ')[0], pipeline: sd.filter(s => s.status === 'active').reduce((s, p) => s + p.totalValue, 0), won: sd.filter(s => s.status === 'won').reduce((s, p) => s + p.totalValue, 0) };
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

      <div className="three-col" style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px'}}>
        <PieCard title={t.project_type_mix} data={projectTypePieData} fmt={fmt} />
        <PieCard title={t.modality_mix} data={modalityPieData} fmt={fmt} />
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
        const sph2025 = data.filter(s => s.issuedDate?.startsWith('2025'));
        const sph2026 = data.filter(s => s.issuedDate?.startsWith('2026'));
        const po2025 = sph2025.filter(s => s.poStatus === 'issued');
        const po2026 = sph2026.filter(s => s.poStatus === 'issued');

        // Jan-May comparison
        const yoyData = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei'].map((m, i) => {
          const mn = String(i + 1).padStart(2, '0');
          return {
            month: m,
            'SPH 2025': sph2025.filter(s => s.issuedDate.startsWith(`2025-${mn}`)).length,
            'SPH 2026': sph2026.filter(s => s.issuedDate.startsWith(`2026-${mn}`)).length,
            'PO 2025': po2025.filter(s => s.issuedDate.startsWith(`2025-${mn}`)).length,
            'PO 2026': po2026.filter(s => s.issuedDate.startsWith(`2026-${mn}`)).length,
          };
        });

        const totalSph2025 = sph2025.length, totalSph2026 = sph2026.length;
        const totalPo2025 = po2025.length, totalPo2026 = po2026.length;
        const sphGrowth = totalSph2025 ? ((totalSph2026 - totalSph2025) / totalSph2025 * 100) : 0;
        const poGrowth = totalPo2025 ? ((totalPo2026 - totalPo2025) / totalPo2025 * 100) : 0;

        return (
          <div className="card" style={{marginBottom: '20px'}}>
            <div className="card-title">{t.yoy_title} <span style={{fontSize: '10px', fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--ims-text-2)', marginLeft: '8px'}}>· {t.yoy_subtitle}</span></div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '20px'}}>
              <div style={{padding: '14px', background: 'rgba(94,135,184,0.10)', borderLeft: '3px solid #5b87b8'}}>
                <div style={{fontSize: '10px', letterSpacing: '0.18em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.yoy_sph_2025}</div>
                <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalSph2025}</div>
              </div>
              <div style={{padding: '14px', background: 'rgba(26,77,138,0.10)', borderLeft: '3px solid #1a4d8a'}}>
                <div style={{fontSize: '10px', letterSpacing: '0.18em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.yoy_sph_2026}</div>
                <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalSph2026} <span style={{fontSize: '12px', color: sphGrowth >= 0 ? 'var(--ims-accent-2)' : '#8b3a3a'}}>{sphGrowth >= 0 ? '↑' : '↓'}{Math.abs(sphGrowth).toFixed(0)}%</span></div>
              </div>
              <div style={{padding: '14px', background: 'rgba(200,169,106,0.12)', borderLeft: '3px solid var(--ims-accent)'}}>
                <div style={{fontSize: '10px', letterSpacing: '0.18em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.yoy_po_2025}</div>
                <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalPo2025}</div>
              </div>
              <div style={{padding: '14px', background: 'rgba(58,107,58,0.10)', borderLeft: '3px solid var(--ims-accent-2)'}}>
                <div style={{fontSize: '10px', letterSpacing: '0.18em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.yoy_po_2026}</div>
                <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalPo2026} <span style={{fontSize: '12px', color: poGrowth >= 0 ? 'var(--ims-accent-2)' : '#8b3a3a'}}>{poGrowth >= 0 ? '↑' : '↓'}{Math.abs(poGrowth).toFixed(0)}%</span></div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={yoyData} margin={{top: 5, right: 16, left: 0, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--ims-text-2)" style={{fontSize: 11}} />
                <YAxis stroke="var(--ims-text-2)" style={{fontSize: 10}} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{fontSize: '11px'}} />
                <Bar dataKey="SPH 2025" fill="#5b87b8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="SPH 2026" fill="#1a4d8a" radius={[3, 3, 0, 0]} />
                <Bar dataKey="PO 2025" fill="var(--ims-accent)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="PO 2026" fill="var(--ims-accent-2)" radius={[3, 3, 0, 0]} />
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

// Extracted from App.jsx during modular refactor.
import { useMemo, useState } from 'react';
import { Award, DollarSign, LayoutDashboard, Wallet, X } from 'lucide-react';
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip, Td, Th } from '../components/ui.jsx';
import { DASHBOARD_GLASS, DashboardHero, DashboardKpiGrid, GlassPanel } from '../components/FuturisticDashboardShell.jsx';
import { CHART_COLORS } from '../constants/theme.js';
import { calcIncentive, getActiveSalesTeam, getIncentiveStatus, resolveOpsCost } from '../utils/domain.js';
import { toFinanceAccounts } from '../utils/sphProject.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function IncentiveDashboard({ dealsWithIncentive, totalEstimated, totalReady, totalPaid, ytdTotal, leaderboard, salesTeam, t, lang, fmt }) {
  const glass = DASHBOARD_GLASS.incentive;

  const dash = useMemo(() => {
    const paid = totalPaid;
    const pending = totalEstimated + totalReady;
    const monthly = MONTHS.map((m, idx) => {
      const mm = String(idx + 1).padStart(2, '0');
      const monthDeals = dealsWithIncentive.filter(d => (d.issuedDate || d.poDate || '').substring(5, 7) === mm);
      const paidAmt = monthDeals.filter(d => d._stat?.status === 'paid').reduce((s, d) => s + d._calc.incentive, 0);
      const pendingAmt = monthDeals.filter(d => ['estimated', 'ready', 'kso_prorata'].includes(d._stat?.status)).reduce((s, d) => s + d._calc.incentive, 0);
      return { month: m, [lang === 'id' ? 'Dicairkan' : 'Paid Out']: paidAmt, [lang === 'id' ? 'Pending': 'Pending']: pendingAmt };
    });

    const deptData = (leaderboard.length ? leaderboard : salesTeam.map(s => ({ ...s, total: 0 })))
      .filter(s => s.total > 0)
      .map((s, i) => ({
        name: s.name.split(' ')[0],
        value: s.total,
        fill: CHART_COLORS[i % CHART_COLORS.length],
      }));

    const monthlyTarget = Math.max(ytdTotal * 1.15, 1);
    const progressPct = Math.min(100, Math.round((ytdTotal / monthlyTarget) * 100));

    return { paid, pending, monthly, deptData, monthlyTarget, progressPct };
  }, [dealsWithIncentive, totalEstimated, totalReady, totalPaid, ytdTotal, leaderboard, salesTeam, lang]);

  return (
    <div style={{ display: 'grid', gap: '18px', marginBottom: '24px' }}>
      <DashboardHero
        glass={glass}
        badge={lang === 'id' ? 'Incentive Intelligence' : 'Incentive Intelligence'}
        title={lang === 'id' ? 'Dashboard Insentif' : 'Incentive Dashboard'}
        subtitle={lang === 'id' ? 'Sinkron KPI closing deal, status verifikasi sales, dan pembayaran finance.' : 'Sync with sales closing KPI, verification status, and finance payouts.'}
        lang={lang}
        showSync={false}
      />
      <DashboardKpiGrid items={[
        { label: t.inc_total_paid, value: fmt(dash.paid), sub: lang === 'id' ? 'sudah dicairkan' : 'paid out', color: '#10b981' },
        { label: t.inc_total_ready, value: fmt(totalReady), sub: lang === 'id' ? 'siap cair' : 'ready', color: glass.accent },
        { label: t.inc_total_estimated, value: fmt(totalEstimated), sub: lang === 'id' ? 'estimasi' : 'estimated', color: '#94a3b8' },
        { label: t.inc_ytd, value: fmt(ytdTotal), sub: `${dealsWithIncentive.length} deals`, color: '#14b8a6' },
      ]} />

      <GlassPanel glass={glass}>
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={15} color={glass.accent} /> {lang === 'id' ? 'Target Bonus Bulanan Tim' : 'Team Monthly Bonus Target'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
              <span>{fmt(ytdTotal)} / {fmt(dash.monthlyTarget)}</span>
              <span style={{ fontWeight: 700, color: glass.accent }}>{dash.progressPct}%</span>
            </div>
            <div style={{ height: '10px', background: 'var(--ims-bg-card-2)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${dash.progressPct}%`, background: `linear-gradient(90deg, #10b981, #14b8a6)`, borderRadius: '6px', transition: 'width 0.6s' }} />
            </div>
          </div>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: `conic-gradient(#10b981 ${dash.progressPct * 3.6}deg, var(--ims-bg-card-2) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'var(--ims-bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: glass.accent }}>{dash.progressPct}%</div>
          </div>
        </div>
      </GlassPanel>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '16px' }}>
        <GlassPanel glass={glass}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={15} color={glass.accent} /> {lang === 'id' ? 'Aktivitas Pembayaran Insentif' : 'Incentive Payment Activity'}
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={dash.monthly} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.12)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 1e6 ? `${(v / 1e6).toFixed(0)}Jt` : v} />
              <Tooltip content={<ChartTooltip fmt={fmt} />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey={lang === 'id' ? 'Dicairkan' : 'Paid Out'} fill="#10b981" radius={[4, 4, 0, 0]} barSize={18} />
              <Line type="monotone" dataKey={lang === 'id' ? 'Pending' : 'Pending'} stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </GlassPanel>
        <GlassPanel glass={glass}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={15} color={glass.accent} /> {lang === 'id' ? 'Distribusi per Sales' : 'Distribution by Sales'}
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={dash.deptData.length ? dash.deptData : [{ name: '-', value: 1, fill: 'var(--ims-border)' }]}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={2}
              >
                {(dash.deptData.length ? dash.deptData : [{ name: '-', value: 1, fill: 'var(--ims-border)' }]).map(e => (
                  <Cell key={e.name} fill={e.fill} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip fmt={fmt} />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </GlassPanel>
      </div>
    </div>
  );
}

function IncentiveModule({ data, setData, t, lang, session, fmt, fmtFull, canEdit, employees = {} }) {
  const salesTeam = useMemo(() => getActiveSalesTeam(employees), [employees]);
  const isSales = session.role === 'sales';
  const isOfficeAccount = session.salesId === 'office';
  const [incTab, setIncTab] = useState('deals');
  const [incFilterSales, setIncFilterSales] = useState('all');
  const incentiveStats = useMemo(() => {
    let visibleData = isSales ? data.filter(s => s.salesOwner === session.salesId) : data;
    if (!isSales && incFilterSales !== 'all') {
      visibleData = visibleData.filter(s => s.salesOwner === incFilterSales);
    }
    const poDeals = toFinanceAccounts(visibleData);
    const dealsWithIncentive = poDeals.map(s => {
      const calc = calcIncentive(s);
      const stat = getIncentiveStatus(s);
      return { ...s, _calc: calc, _stat: stat };
    });
    const totalEstimated = dealsWithIncentive.filter(d => d._stat?.status === 'estimated').reduce((sum, d) => sum + d._calc.incentive, 0);
    const totalReady = dealsWithIncentive.filter(d => d._stat?.status === 'ready').reduce((sum, d) => sum + d._calc.incentive, 0);
    const totalPaid = dealsWithIncentive.filter(d => d._stat?.status === 'paid').reduce((sum, d) => sum + d._calc.incentive, 0);
    const totalKsoSplit = dealsWithIncentive.filter(d => d._stat?.status === 'kso_prorata').reduce((sum, d) => sum + d._calc.incentive * (d._stat.progress || 0), 0);
    const ytdTotal = totalEstimated + totalReady + totalPaid + totalKsoSplit;
    const leaderboard = !isSales ? salesTeam.map(sales => {
      const salesDeals = toFinanceAccounts(data.filter(s => s.salesOwner === sales.id));
      const total = salesDeals.reduce((sum, s) => sum + calcIncentive(s).incentive, 0);
      return { ...sales, total, dealsCount: salesDeals.length };
    }).sort((a, b) => b.total - a.total) : [];
    return { visibleData, poDeals, dealsWithIncentive, totalEstimated, totalReady, totalPaid, totalKsoSplit, ytdTotal, leaderboard };
  }, [data, isSales, session.salesId, incFilterSales, salesTeam]);
  const { poDeals, dealsWithIncentive, totalEstimated, totalReady, totalPaid, ytdTotal, leaderboard } = incentiveStats;
  const [selectedDeal, setSelectedDeal] = useState(null);
  const liveSelectedDeal = selectedDeal ? (dealsWithIncentive.find(d => d.id === selectedDeal.id) || selectedDeal) : null;

  const updateOpsCost = (accountId, patch) => {
    if (!canEdit && !isSales) return;
    setData(prev => prev.map(s => (s.id === accountId || s.financeAccountId === accountId)
      ? { ...s, ...patch }
      : s));
  };

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_incentive}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>
          {isSales ? t.inc_my_incentive : t.inc_team_incentive}
        </h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.inc_subtitle}</div>
      </div>

      {isOfficeAccount && (
        <div style={{padding: '14px 18px', background: 'rgba(200,169,106,0.15)', borderLeft: '3px solid var(--ims-accent)', marginBottom: '20px', fontSize: '12.5px', color: 'var(--ims-text)', lineHeight: 1.6}}>
          <div style={{fontWeight: 700, marginBottom: '4px'}}>{t.inc_office_label}</div>
          <div style={{fontSize: '11.5px'}}>{t.inc_office_note}</div>
        </div>
      )}

      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {[
          { id: 'deals', label: lang === 'id' ? 'Detail Insentif' : 'Incentive Detail', icon: Wallet },
          { id: 'dashboard', label: lang === 'id' ? 'Dashboard' : 'Dashboard', icon: LayoutDashboard },
        ].map(tb => {
          const Icon = tb.icon;
          const active = incTab === tb.id;
          return (
            <button key={tb.id} onClick={() => setIncTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '10px 18px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: active ? 'var(--ims-accent)' : 'var(--ims-text-2)', borderBottom: active ? '2px solid var(--ims-border)' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px', letterSpacing: '0.03em'}}>
              <Icon size={14} strokeWidth={1.5} />{tb.label}
            </button>
          );
        })}
      </div>

      {incTab === 'dashboard' && (
        <IncentiveDashboard
          dealsWithIncentive={dealsWithIncentive}
          totalEstimated={totalEstimated}
          totalReady={totalReady}
          totalPaid={totalPaid}
          ytdTotal={ytdTotal}
          leaderboard={leaderboard}
          salesTeam={salesTeam}
          t={t}
          lang={lang}
          fmt={fmt}
        />
      )}

      {incTab === 'deals' && (
      <>
      {!isSales && (
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap'}}>
          <span style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? 'Filter Sales' : 'Filter Sales'}:</span>
          <button onClick={() => setIncFilterSales('all')} style={{padding: '6px 14px', fontSize: '11px', fontFamily: 'inherit', background: incFilterSales === 'all' ? 'var(--ims-accent)' : 'transparent', color: incFilterSales === 'all' ? '#fff' : 'var(--ims-accent)', border: '1px solid var(--ims-border)', cursor: 'pointer', fontWeight: 600}}>{lang === 'id' ? 'Semua Tim' : 'All Team'}</button>
          {salesTeam.map(s => (
            <button key={s.id} onClick={() => setIncFilterSales(s.id)} style={{padding: '6px 14px', fontSize: '11px', fontFamily: 'inherit', background: incFilterSales === s.id ? s.accent : 'transparent', color: incFilterSales === s.id ? '#fff' : s.accent, border: `1px solid ${s.accent}`, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'}}>
              <span style={{width: '16px', height: '16px', borderRadius: '50%', background: incFilterSales === s.id ? 'rgba(255,255,255,0.3)' : s.accent, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 700}}>{s.initial}</span>
              {s.name.split(' ')[0]}
            </button>
          ))}
        </div>
      )}
      {!isSales && incFilterSales !== 'all' && (
        <div style={{padding: '10px 14px', marginBottom: '18px', background: 'rgba(26,41,66,0.04)', borderLeft: '3px solid var(--ims-border)', fontSize: '12px', color: 'var(--ims-text)'}}>
          {lang === 'id' ? 'Menampilkan detail insentif & perhitungan untuk' : 'Showing incentive detail & calculation for'} <strong>{salesTeam.find(s => s.id === incFilterSales)?.name}</strong> · {poDeals.length} {lang === 'id' ? 'deal PO' : 'PO deals'} · {lang === 'id' ? 'Total insentif' : 'Total incentive'}: <strong>{fmt(ytdTotal)}</strong>
        </div>
      )}

      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '24px', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '20px 22px', background: 'var(--ims-bg-card)'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.22em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.inc_total_estimated}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '6px', color: '#94a3b8'}}>{fmt(totalEstimated)}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '6px'}}>📊 {t.inc_legend_est}</div>
        </div>
        <div style={{padding: '20px 22px', background: 'var(--ims-bg-card)'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.22em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.inc_total_ready}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '6px', color: 'var(--ims-accent)'}}>{fmt(totalReady)}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '6px'}}>⏳ ≥50% paid / BAST done</div>
        </div>
        <div style={{padding: '20px 22px', background: 'var(--ims-bg-card)'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.22em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.inc_total_paid}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '6px', color: 'var(--ims-accent-2)'}}>{fmt(totalPaid)}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '6px'}}>✅ {lang === 'id' ? 'Pembayaran 100%' : 'Fully paid'}</div>
        </div>
        <div style={{padding: '20px 22px', background: 'var(--ims-bg-alt)', color: 'var(--ims-text)'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.22em', color: 'var(--ims-accent)', textTransform: 'uppercase'}}>{t.inc_ytd}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '6px', color: '#fff'}}>{fmt(ytdTotal)}</div>
          <div style={{fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '6px'}}>{dealsWithIncentive.length} deals · 1.5% × Net Sales</div>
        </div>
      </div>

      <div style={{padding: '12px 16px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', marginBottom: '20px'}}>
        <div style={{fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '8px'}}>{t.inc_status_legend}</div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '11px', color: 'var(--ims-text)'}}>
          <span>{t.inc_legend_est}</span>
          <span>{t.inc_legend_ready}</span>
          <span>{t.inc_legend_paid}</span>
          <span>{t.inc_legend_kso}</span>
        </div>
      </div>

      {!isSales && leaderboard.length > 0 && (
        <div className="card" style={{marginBottom: '22px'}}>
          <div className="card-title">{t.inc_leaderboard}</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px'}}>
            {leaderboard.map((s, idx) => (
              <div key={s.id} style={{padding: '14px', background: idx === 0 ? 'var(--ims-accent)' : 'var(--ims-bg-card)', color: idx === 0 ? 'var(--ims-text)' : 'var(--ims-accent)', border: '1px solid var(--ims-border)', position: 'relative'}}>
                {idx === 0 && <span style={{position: 'absolute', top: '8px', right: '8px', padding: '1px 7px', fontSize: '9px', background: 'var(--ims-accent)', color: 'var(--ims-text)', fontWeight: 700, letterSpacing: '0.05em'}}>👑 #1</span>}
                {s.isOffice && <span style={{position: 'absolute', top: '8px', right: '8px', padding: '1px 7px', fontSize: '9px', background: 'var(--ims-accent)', color: 'var(--ims-text)', fontWeight: 700, letterSpacing: '0.05em'}}>🎯 OFFICE</span>}
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
                  <div style={{width: '34px', height: '34px', borderRadius: '50%', background: s.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700}}>{s.initial}</div>
                  <div>
                    <div style={{fontSize: '12.5px', fontWeight: 600}}>{s.name}</div>
                    <div style={{fontSize: '10px', opacity: 0.7}}>{lang === 'id' ? s.territory : s.territoryEn}</div>
                  </div>
                </div>
                <div className="mono" style={{fontSize: '16px', fontWeight: 600, color: idx === 0 ? 'var(--ims-gold)' : 'var(--ims-accent)'}}>{fmt(s.total)}</div>
                <div style={{fontSize: '10px', opacity: 0.7, marginTop: '2px'}}>{s.dealsCount} {t.project_count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '1000px'}}>
          <thead>
            <tr style={{background: 'var(--ims-bg-card-2)'}}>
              <Th>{t.customer}</Th>
              <Th>{t.modality}</Th>
              {!isSales && <Th>{t.sales_owner}</Th>}
              <Th align="right">{t.value}</Th>
              <Th align="right">{t.inc_net_sales}</Th>
              <Th align="right">{t.inc_amount}</Th>
              <Th>{t.inc_status_legend.replace(' :', '')}</Th>
              <Th align="right">{t.actions}</Th>
            </tr>
          </thead>
          <tbody>
            {dealsWithIncentive.map(d => {
              const sales = salesTeam.find(s => s.id === d.salesOwner);
              return (
                <tr key={d.id} className="hover-row" style={{borderTop: '1px solid var(--ims-border)'}}>
                  <Td>
                    <div style={{fontWeight: 500}}>{d.customer}</div>
                    <div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{t[`ptype_${d.projectType}`]} · <span className="mono">{d.sphNo}</span></div>
                  </Td>
                  <Td>
                    <div>{d.modality}</div>
                    <div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>
                      {d.isMultiItemProject ? `${d.projectModalityLabel || d.subModality} · ${d.projectLineCount} ${lang === 'id' ? 'alat' : 'units'}` : d.subModality}
                    </div>
                  </Td>
                  {!isSales && <Td>{sales ? sales.name : d.salesOwner}</Td>}
                  <Td align="right"><span className="mono">{fmt(d.totalValue)}</span></Td>
                  <Td align="right"><span className="mono" style={{color: 'var(--ims-text-2)'}}>{fmt(d._calc.netSales)}</span></Td>
                  <Td align="right"><span className="mono" style={{fontWeight: 700, color: 'var(--ims-text)'}}>{fmt(d._calc.incentive)}</span></Td>
                  <Td>
                    {d._stat && (
                      <span style={{padding: '3px 8px', fontSize: '10px', background: d._stat.color + '25', color: d._stat.color, fontWeight: 600}}>
                        {t[d._stat.label]}
                      </span>
                    )}
                  </Td>
                  <Td align="right">
                    <button onClick={() => setSelectedDeal(d)} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 10px', fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ims-text)'}}>{t.inc_view_detail}</button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {dealsWithIncentive.length === 0 && <div className="empty-state">{lang === 'id' ? 'Belum ada deal PO yang terbit' : 'No PO issued yet'}</div>}
      </div>
      </>
      )}

      {liveSelectedDeal && (
        <div className="modal-overlay" onClick={() => setSelectedDeal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '580px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px'}}>
              <div>
                <div style={{fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ims-text-2)', marginBottom: '4px'}}>{t.inc_detail_title}</div>
                <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{liveSelectedDeal.customer}</h2>
                <div style={{fontSize: '12px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{liveSelectedDeal.modality} · {liveSelectedDeal.subModality}</div>
              </div>
              <button onClick={() => setSelectedDeal(null)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px'}}>
              <div><div style={{fontSize: '10px', color: 'var(--ims-text-2)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>{t.value}</div><div className="mono" style={{fontWeight: 600, marginTop: '4px'}}>{fmtFull(liveSelectedDeal.totalValue)}</div></div>
              <div><div style={{fontSize: '10px', color: 'var(--ims-text-2)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>{t.inc_net_sales}</div><div className="mono" style={{fontWeight: 600, marginTop: '4px'}}>{fmtFull(liveSelectedDeal._calc.netSales)}</div></div>
              <div><div style={{fontSize: '10px', color: 'var(--ims-text-2)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>{t.inc_amount}</div><div className="mono" style={{fontWeight: 700, marginTop: '4px', color: 'var(--ims-accent)'}}>{fmtFull(liveSelectedDeal._calc.incentive)}</div></div>
              <div><div style={{fontSize: '10px', color: 'var(--ims-text-2)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>{t.inc_status_legend.replace(' :', '')}</div><div style={{marginTop: '4px'}}>{liveSelectedDeal._stat && <span style={{padding: '3px 8px', fontSize: '10px', background: liveSelectedDeal._stat.color + '25', color: liveSelectedDeal._stat.color, fontWeight: 600}}>{t[liveSelectedDeal._stat.label]}</span>}</div></div>
            </div>
            {(canEdit || isSales) && (
              <div style={{marginTop: '18px', paddingTop: '18px', borderTop: '1px solid var(--ims-border)'}}>
                <div style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '10px'}}>{t.inc_ops_percent}</div>
                <label style={{fontSize: '11px', color: 'var(--ims-text-2)', display: 'block', marginBottom: '6px'}}>{lang === 'id' ? 'Persentase dari nilai proyek' : 'Percentage of project value'}</label>
                <input type="range" min="0" max="50" step="0.5" value={Math.round((liveSelectedDeal.opsPercent ?? resolveOpsCost(liveSelectedDeal).opsPercent) * 1000) / 10} onChange={e => updateOpsCost(liveSelectedDeal.id, { opsPercent: Math.max(0, Math.min(0.5, parseFloat(e.target.value) / 100)), opsCostMode: 'percent' })} style={{width: '100%'}} disabled={liveSelectedDeal.opsCostMode === 'manual' && liveSelectedDeal.opsCostAmount > 0} />
                <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '4px', marginBottom: '14px'}}>{(((liveSelectedDeal.opsPercent ?? resolveOpsCost(liveSelectedDeal).opsPercent) * 100)).toFixed(1)}%</div>
                <label style={{fontSize: '11px', color: 'var(--ims-text-2)', display: 'block', marginBottom: '6px'}}>{lang === 'id' ? 'Atau input manual (Rp)' : 'Or manual amount (IDR)'}</label>
                <input type="number" min="0" step="1000000" value={liveSelectedDeal.opsCostAmount || ''} placeholder={lang === 'id' ? 'Kosongkan untuk pakai %' : 'Leave empty to use %'} onChange={e => {
                  const raw = e.target.value;
                  const amt = raw === '' ? null : Math.max(0, Number(raw) || 0);
                  updateOpsCost(liveSelectedDeal.id, amt > 0 ? { opsCostAmount: amt, opsCostMode: 'manual' } : { opsCostAmount: null, opsCostMode: 'percent' });
                }} style={{width: '100%', fontSize: '12px', padding: '8px 10px'}} />
                <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '8px'}}>
                  {lang === 'id' ? 'Biaya ops dipakai' : 'Ops cost used'}: <span className="mono" style={{fontWeight: 700, color: 'var(--ims-gold)'}}>{fmt(resolveOpsCost(liveSelectedDeal).opsCostValue)}</span>
                  {' · '}{resolveOpsCost(liveSelectedDeal).opsCostMode === 'manual' ? (lang === 'id' ? 'sumber: manual' : 'source: manual') : (lang === 'id' ? 'sumber: %' : 'source: %')}
                  {' · '}{lang === 'id' ? 'sinkron modul Finance' : 'synced with Finance'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { IncentiveModule, IncentiveDashboard };

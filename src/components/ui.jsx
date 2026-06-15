// Extracted from App.jsx during modular refactor.
import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Eye, RefreshCw } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_COLORS, IMS_THEMES } from '../constants/theme.js';
import logoKecil from '../../logo3.png';
const IMSLogo = React.memo(function IMSLogo({ size = 'md' }) {
  // Mengatur ukuran lebar logo secara proporsional sesuai kebutuhan komponen
  const logoWidth = size === 'xl' ? '180px' : size === 'lg' ? '140px' : size === 'sm' ? '80px' : '100px';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      <img 
        src={logoKecil} 
        alt="Logo IMS HNTI" 
        style={{ width: logoWidth, height: 'auto', objectFit: 'contain' }} 
      />
    </div>
  );
});
const GlobalStyles = ({ theme = 've' }) => {
  const T = IMS_THEMES[theme] || IMS_THEMES.ve;
  // CSS variables di-inject di :root. Semua referensi var(--ims-*) di kode pakai ini.
  // Saat theme prop berubah, React re-render <style> → variables update → seluruh app re-paint instant.
  return (
    <style>{`
    :root {
      --ims-bg: ${T.bg};
      --ims-bg-card: ${T.bgCard};
      --ims-bg-card-2: ${T.bgCard2};
      --ims-bg-alt: ${T.bgAlt};
      --ims-border: ${T.border};
      --ims-border-soft: ${T.borderSoft};
      --ims-text: ${T.text};
      --ims-text-2: ${T.text2};
      --ims-text-3: ${T.text3};
      --ims-accent: ${T.accent};
      --ims-accent-2: ${T.accent2};
      --ims-accent-ink: ${T.accentInk};
      --ims-accent-glow: ${T.accentGlow};
      --ims-accent-bg: ${T.accentBg};
      --ims-accent-bg-strong: ${T.accentBgStrong};
      --ims-gold: ${T.gold};
      --ims-gold-bright: ${T.goldBright};
      --ims-gold-dim: ${T.goldDim};
      --ims-gold-bg: ${T.goldBg};
      --ims-gold-glow: ${T.goldGlow};
      --ims-logo-1: ${T.logo1};
      --ims-logo-2: ${T.logo2};
      --ims-logo-3: ${T.logo3};
    }
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; }
    html { width: 100%; min-height: 100%; overflow-x: hidden; -webkit-text-size-adjust: 100%; }
    body { margin: 0; background: var(--ims-bg); color: var(--ims-text); transition: background-color 0.3s ease, color 0.3s ease; overflow-x: hidden; }
    #root { width: 100%; min-height: 100vh; overflow-x: hidden; }
    body::before { content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0; background: ${T.ambient}; transition: background 0.3s ease; }
    .serif { font-family: 'Cormorant Garamond', Georgia, serif; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .lbl-tag { font-size: 10px; letter-spacing: 0.2em; color: var(--ims-text-2); text-transform: uppercase; }
    .lbl-tag-sm { font-size: 9px; letter-spacing: 0.15em; color: var(--ims-text-2); text-transform: uppercase; font-weight: 600; }
    .lbl-tag-md { font-size: 11px; letter-spacing: 0.15em; color: var(--ims-text-2); text-transform: uppercase; font-weight: 600; }
    .card-pad { padding: 18px 20px; background: var(--ims-bg-card); }
    .empty-state { padding: 40px; text-align: center; color: var(--ims-text-2); }
    .hover-row:hover { background: var(--ims-accent-bg) !important; }
    .card-hover { transition: all 0.2s ease; }
    .card-hover:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.25); }
    .btn-primary { background: var(--ims-accent); color: var(--ims-accent-ink); border: none; padding: 10px 20px; font-family: inherit; font-size: 12.5px; font-weight: 500; letter-spacing: 0.04em; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 7px; }
    .btn-primary:hover { background: var(--ims-accent-2); }
    .btn-ghost { background: transparent; color: var(--ims-accent); border: 1px solid var(--ims-border); padding: 9px 18px; font-family: inherit; font-size: 12px; font-weight: 500; letter-spacing: 0.04em; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
    .btn-ghost:hover { border-color: var(--ims-accent); background: var(--ims-accent-bg); }
    input, select, textarea { font-family: inherit; font-size: 13px; padding: 9px 12px; border: 1px solid var(--ims-border); background: var(--ims-bg-card); color: var(--ims-text); outline: none; transition: border-color 0.2s; width: 100%; border-radius: 2px; }
    input:focus, select:focus, textarea:focus { border-color: var(--ims-accent); }
    button, input, select, textarea { max-width: 100%; }
    button { touch-action: manipulation; }
    img, svg, canvas { max-width: 100%; }
    .mobile-menu-btn { display: none; align-items: center; justify-content: center; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); padding: 20px; }
    .modal-content { background: var(--ims-bg-card); border: 1px solid var(--ims-border); max-width: 760px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: ${T.sbTrack}; }
    ::-webkit-scrollbar-thumb { background: ${T.sbThumb}; border-radius: 4px; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.55; transform: scale(0.85); } }
    @keyframes ims-shimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    .fade-in { animation: fadeIn 0.35s ease; }
    .card { background: var(--ims-bg-card); border: 1px solid var(--ims-border); padding: 22px; }
    .card-title { font-size: 10px; letter-spacing: 0.2em; color: var(--ims-text-2); text-transform: uppercase; font-weight: 600; margin-bottom: 18px; }
    /* Logo shimmer — efek metallic light-catching untuk wordmark IMS */
    .ims-logo-shimmer { background: linear-gradient(120deg, var(--ims-logo-1) 0%, var(--ims-logo-2) 25%, var(--ims-logo-1) 50%, var(--ims-logo-2) 75%, var(--ims-logo-3) 100%); background-size: 250% 100%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; filter: drop-shadow(0 0 10px var(--ims-gold-glow)); animation: ims-shimmer 5s ease-in-out infinite; }
    /* Gold KPI shimmer — untuk angka penting (Nilai Pipeline, Valuasi) */
    .ims-kpi-gold { background: linear-gradient(135deg, var(--ims-gold-bright) 0%, var(--ims-gold) 50%, var(--ims-gold-bright) 100%); background-size: 200% 100%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; filter: drop-shadow(0 0 6px var(--ims-gold-glow)); animation: ims-shimmer 6s ease-in-out infinite; }
    /* Accent KPI glow — untuk angka accent (Pendapatan, dll) */
    .ims-kpi-accent-glow { color: var(--ims-accent); text-shadow: 0 0 8px var(--ims-accent-glow), 0 0 16px var(--ims-accent-glow); }
    @media (max-width: 900px) {
      html, body, #root { width: 100% !important; max-width: 100% !important; overflow-x: hidden !important; }
      .main-content { padding: 16px !important; }
      .header-content { padding: 12px 16px !important; }
      .desktop-nav { display: none !important; }
      .mobile-menu-btn { display: flex !important; }
      .kpi-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
      .two-col, .three-col { grid-template-columns: 1fr !important; }
      .hero-title { font-size: 26px !important; }
      .hide-mobile { display: none !important; }
      .modal-content { width: 100vw !important; max-width: 100vw !important; padding: 20px !important; margin: 0 !important; max-height: 95dvh !important; border-radius: 0 !important; overflow: auto !important; }
      .modal-overlay { padding: 0 !important; align-items: flex-end !important; justify-content: stretch !important; }
      .mobile-nav-panel { max-height: calc(100dvh - 64px); overflow-y: auto; -webkit-overflow-scrolling: touch; }
      [style*="grid-template-columns: 360px 1fr"],
      [style*="grid-template-columns: 220px 1fr"],
      [style*="grid-template-columns: 1.2fr 0.8fr"],
      [style*="grid-template-columns: 1fr 1fr"],
      [style*="grid-template-columns: minmax(0, 1.35fr)"],
      [style*="grid-template-columns: minmax(260px, 1fr) minmax(320px, 0.9fr) auto"],
      [style*="grid-template-columns: 1.1fr 1fr 1.5fr 0.6fr 1fr auto"] {
        grid-template-columns: 1fr !important;
      }
      [style*="grid-template-columns: repeat(5, 1fr)"],
      [style*="grid-template-columns: repeat(4, 1fr)"],
      [style*="grid-template-columns: repeat(3, 1fr)"],
      [style*="grid-template-columns: repeat("][style*=", 1fr)"] {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
      [style*="overflow-x: auto"] { max-width: 100% !important; -webkit-overflow-scrolling: touch !important; overscroll-behavior-inline: contain; }
      [style*="min-width: 1100px"], [style*="min-width: 1000px"], [style*="min-width: 900px"], [style*="min-width: 860px"], [style*="min-width: 800px"], [style*="min-width: 760px"], [style*="min-width: 700px"] {
        min-width: 680px !important;
      }
      [style*="display: flex"] { min-width: 0; }
      [style*="flex-wrap: wrap"] > * { min-width: min(100%, 140px); }
      table { font-size: 11px !important; }
    }
    @media (max-width: 600px) {
      body { font-size: 13px !important; }
      .kpi-grid-4 { grid-template-columns: 1fr !important; }
      .header-content { padding: 10px 14px !important; }
      .main-content { padding: 12px !important; }
      .hero-title { font-size: 22px !important; }
      .card { padding: 14px !important; }
      .card-pad { padding: 14px !important; }
      .serif.kpi-num { font-size: 20px !important; }
      .login-right { padding: 28px 18px !important; }
      .btn-primary, .btn-ghost { padding: 11px 14px !important; font-size: 12px !important; }
      input, select, textarea { font-size: 16px !important; }
      .modal-content { padding: 16px !important; max-height: 100dvh !important; min-height: 0 !important; }
      [style*="grid-template-columns: repeat(5, 1fr)"],
      [style*="grid-template-columns: repeat(4, 1fr)"],
      [style*="grid-template-columns: repeat(3, 1fr)"],
      [style*="grid-template-columns: repeat(2, 1fr)"],
      [style*="grid-template-columns: repeat("][style*=", 1fr)"],
      [style*="grid-template-columns: 1fr auto"],
      [style*="grid-template-columns: 56px 1fr"] {
        grid-template-columns: 1fr !important;
      }
      [style*="grid-template-columns: repeat(auto-fit, minmax(380px, 1fr))"],
      [style*="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))"],
      [style*="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))"],
      [style*="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))"],
      [style*="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))"],
      [style*="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))"],
      [style*="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))"] {
        grid-template-columns: 1fr !important;
      }
      [style*="grid-template-columns: repeat(auto-fill, minmax(340px, 1fr))"],
      [style*="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))"],
      [style*="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))"],
      [style*="grid-template-columns: repeat(auto-fill, minmax(155px, 1fr))"] {
        grid-template-columns: 1fr !important;
      }
      [style*="min-width: 1100px"], [style*="min-width: 1000px"], [style*="min-width: 900px"], [style*="min-width: 860px"], [style*="min-width: 800px"], [style*="min-width: 760px"], [style*="min-width: 700px"], [style*="min-width: 680px"] { min-width: 620px !important; }
      .header-content [style*="gap: 14px"] { gap: 8px !important; }
      .modal-content > div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
      .modal-content [style*="grid-column: 1 / -1"] { grid-column: auto !important; }
      .btn-primary, .btn-ghost, button[class*="btn-"] { justify-content: center; }
      select, input, textarea { min-height: 44px; }
      textarea { min-height: 92px; }
      th, td { padding: 8px 10px !important; }
      h1, h2, h3 { overflow-wrap: anywhere; }
    }
    .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; max-width: 100%; }
    @media (hover: none) and (pointer: coarse) {
      button { min-height: 40px; }
      .nav-btn { min-height: 44px !important; padding: 12px 18px !important; }
    }
    @media (prefers-reduced-motion: reduce) {
      .fade-in { animation: none !important; }
      .ims-logo-shimmer, .ims-kpi-gold { animation: none !important; }
      * { transition-duration: 0.01ms !important; }
    }
  `}</style>
  );
};
const WIBClock = React.memo(function WIBClock({ lang, compact = false }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  // Force WIB regardless of user's local timezone
  const wib = useMemo(() => {
    const parts = new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).formatToParts(now);
    const get = (t) => parts.find(p => p.type === t)?.value || '';
    return {
      weekday: get('weekday'), day: get('day'), month: get('month'), year: get('year'),
      hour: get('hour'), minute: get('minute'), second: get('second'),
    };
  }, [now, lang]);
  if (compact) {
    return (
      <span className="mono" style={{fontSize: '11px', color: 'var(--ims-text)', fontWeight: 500}} title={`${wib.weekday}, ${wib.day} ${wib.month} ${wib.year} WIB`}>
        {wib.hour}:{wib.minute}:{wib.second} WIB
      </span>
    );
  }
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontFamily: 'inherit', lineHeight: 1.2}}>
      <span className="mono" style={{fontSize: '13px', color: 'var(--ims-text)', fontWeight: 600, letterSpacing: '0.02em'}}>{wib.hour}:{wib.minute}:{wib.second} <span style={{fontSize: '9px', color: 'var(--ims-text-2)', letterSpacing: '0.15em'}}>WIB</span></span>
      <span style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{wib.weekday}, {wib.day} {wib.month} {wib.year}</span>
    </div>
  );
});
const ChartTooltip = ({ active, payload, label, fmt }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{background: 'var(--ims-bg-alt)', color: 'var(--ims-text)', padding: '9px 13px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}}>
      {label && <div style={{fontWeight: 600, marginBottom: '4px', fontSize: '12px'}}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center'}}>
          <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><span style={{width: '8px', height: '8px', background: p.color, display: 'inline-block'}} />{p.name}</span>
          <span style={{fontFamily: 'JetBrains Mono, monospace', fontWeight: 500}}>{typeof p.value === 'number' && fmt ? fmt(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
};
function PieWithSummary({ data = [], innerRadius = 0, outerRadius = 72, height = 200, fmt, lang = 'id', emptyLabel }) {
  const items = (Array.isArray(data) ? data : []).filter(d => Number(d.value) > 0);
  const total = items.reduce((s, d) => s + (Number(d.value) || 0), 0);
  const safeOuter = Math.min(outerRadius, Math.max(48, Math.floor(height * 0.36)));
  const safeInner = Math.min(innerRadius, Math.max(0, safeOuter - 28));
  if (!items.length || total <= 0) {
    return (
      <div style={{height, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--ims-text-2)'}}>
        {emptyLabel || (lang === 'id' ? 'Belum ada data' : 'No data yet')}
      </div>
    );
  }
  const renderSegmentLabel = ({ cx, cy, midAngle, innerRadius: ir, outerRadius: or, value, percent }) => {
    if (!value || percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = ir + (or - ir) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700}>
        {value}
      </text>
    );
  };
  return (
    <>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart margin={{ top: 20, right: 12, bottom: 12, left: 12 }}>
          <Pie data={items} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={safeInner} outerRadius={safeOuter} label={renderSegmentLabel} labelLine={false}>
            {items.map((e, i) => <Cell key={e.name} fill={e.color || CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip content={<ChartTooltip fmt={fmt || (v => v)} />} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{marginTop: '10px', display: 'grid', gap: '2px'}}>
        <div style={{fontSize: '10px', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '4px'}}>
          {lang === 'id' ? `Total: ${total}` : `Total: ${total}`}
        </div>
        {items.map((d, i) => (
          <div key={d.name} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', padding: '4px 0', borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none'}}>
            <span style={{display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0}}>
              <span style={{width: 8, height: 8, borderRadius: '50%', background: d.color || CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0}} />
              <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{d.name}</span>
            </span>
            <span style={{color: 'var(--ims-text-2)', whiteSpace: 'nowrap', marginLeft: '8px'}}>
              {d.value} ({((d.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function PieCard({ title, data, fmt }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={42} outerRadius={72} paddingAngle={2} stroke="none">
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip content={<ChartTooltip fmt={fmt} />} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{marginTop: '8px'}}>
        {data.map((d, i) => (
          <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '11px', borderBottom: i === data.length - 1 ? 'none' : '1px solid var(--ims-bg-card-2)'}}>
            <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><span style={{width: '7px', height: '7px', background: d.color, display: 'inline-block', borderRadius: '50%'}} /><span>{d.name}</span></span>
            <span style={{color: 'var(--ims-text-2)'}}>{((d.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
const KPICard = React.memo(function KPICard({ label, value, sublabel, trend, info, accent }) {
  const positive = trend >= 0;
  const [showInfo, setShowInfo] = useState(false);
  // accent="gold" → metallic gold shimmer animation (untuk hero metrics)
  // accent="primary" → theme accent glow (emerald/sapphire)
  // default → plain text (warna --ims-text)
  const valueClass = accent === 'gold' ? 'serif ims-kpi-gold' : accent === 'primary' ? 'serif ims-kpi-accent-glow' : 'serif';
  return (
    <div style={{padding: '22px 24px', background: 'var(--ims-bg-card)', minHeight: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative'}}>
      <div>
        <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.22em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 500}}>{label}</div>
          {info && (
            <span onMouseEnter={() => setShowInfo(true)} onMouseLeave={() => setShowInfo(false)} onClick={() => setShowInfo(!showInfo)} style={{cursor: 'help', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '14px', height: '14px', borderRadius: '50%', background: 'var(--ims-border)', color: 'var(--ims-text-2)', fontSize: '10px', fontWeight: 600, lineHeight: 1, position: 'relative'}}>
              ?
              {showInfo && (
                <span style={{position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', background: 'var(--ims-bg-alt)', color: 'var(--ims-text)', padding: '8px 12px', fontSize: '11px', whiteSpace: 'normal', width: '180px', textAlign: 'left', zIndex: 100, letterSpacing: 0, textTransform: 'none', fontWeight: 400, lineHeight: 1.4, boxShadow: '0 4px 12px rgba(0,0,0,0.18)'}}>{info}</span>
              )}
            </span>
          )}
        </div>
        <div className={valueClass} style={{fontSize: '30px', fontWeight: 500, marginTop: '8px', letterSpacing: '-0.02em', lineHeight: 1}}>{value}</div>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '6px'}}>
        <span style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{sublabel}</span>
        <span style={{fontSize: '10px', color: positive ? 'var(--ims-accent-2)' : '#8b3a3a', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 500}}>{positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{Math.abs(trend)}%</span>
      </div>
    </div>
  );
});
function ReadOnlyBanner({ t }) {
  return <div style={{padding: '10px 14px', background: 'rgba(200,169,106,0.12)', borderLeft: '3px solid var(--ims-accent)', marginBottom: '16px', fontSize: '12px', color: 'var(--ims-text)', display: 'flex', alignItems: 'center', gap: '8px'}}><Eye size={14} />{t.view_only_notice}</div>;
}
const Field = React.memo(function Field({ label, full, children }) {
  return (
    <div style={{gridColumn: full ? '1 / -1' : 'auto'}}>
      <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{label}</label>
      {children}
    </div>
  );
});
function ConfirmDialog({ open, title, message, confirmText, cancelText, onConfirm, onCancel, danger, lang }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel} style={{zIndex: 9999}}>
      <div onClick={e => e.stopPropagation()} style={{background: 'var(--ims-bg-card)', maxWidth: '420px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '20px 24px', borderBottom: '1px solid var(--ims-border)', display: 'flex', alignItems: 'center', gap: '12px'}}>
          {danger && <div style={{width: '36px', height: '36px', borderRadius: '50%', background: '#c0303020', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><AlertTriangle size={20} color="#c03030" /></div>}
          <h3 className="serif" style={{fontSize: '18px', fontWeight: 500, margin: 0, color: 'var(--ims-text)'}}>{title || (lang === 'id' ? 'Konfirmasi' : 'Confirm')}</h3>
        </div>
        <div style={{padding: '20px 24px', fontSize: '13px', lineHeight: 1.6, color: 'var(--ims-text)'}}>{message}</div>
        <div style={{padding: '14px 24px', borderTop: '1px solid var(--ims-border)', background: 'var(--ims-bg)', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
          <button onClick={onCancel} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', color: 'var(--ims-text-2)', fontFamily: 'inherit', letterSpacing: '0.05em'}}>{cancelText || (lang === 'id' ? 'Batal' : 'Cancel')}</button>
          <button onClick={onConfirm} style={{background: danger ? '#c03030' : 'var(--ims-accent)', border: 'none', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', color: '#fff', fontFamily: 'inherit', letterSpacing: '0.05em', fontWeight: 600}}>{confirmText || (lang === 'id' ? 'Ya, Hapus' : 'Yes, Delete')}</button>
        </div>
      </div>
    </div>
  );
}
const LinkAttachment = React.memo(function LinkAttachment({ url, label, lang }) {
  if (!url || !url.trim()) return null;
  // Truncate long URLs, extract filename or domain
  let displayName = label || (() => {
    try {
      const u = new URL(url);
      const path = u.pathname.split('/').filter(Boolean).pop() || u.hostname;
      return path.length > 28 ? path.substring(0, 25) + '...' : path;
    } catch { return url.length > 28 ? url.substring(0, 25) + '...' : url; }
  })();
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: 'var(--ims-accent)15', color: '#1a4d8a', fontSize: '11px', fontWeight: 500, textDecoration: 'none', border: '1px solid var(--ims-border)30', borderRadius: '3px', cursor: 'pointer'}} title={url} onClick={e => e.stopPropagation()}>
      <span style={{fontSize: '12px'}}>📎</span>
      <span style={{maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{displayName}</span>
    </a>
  );
});
const SortToggle = React.memo(function SortToggle({ value, onChange, options, lang }) {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
      <span style={{fontSize: '10px', letterSpacing: '0.1em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Urutkan' : 'Sort'}:</span>
      <select value={value} onChange={e => onChange(e.target.value)} style={{padding: '4px 8px', fontSize: '11px', fontFamily: 'inherit', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', color: 'var(--ims-text)', cursor: 'pointer'}}>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
});
const Th = React.memo(function Th({ children, align = 'left', style, ...rest }) {
  return <th {...rest} style={{padding: '12px 14px', textAlign: align, fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, borderBottom: '1px solid var(--ims-border)', whiteSpace: 'nowrap', ...style}}>{children}</th>;
});
const Td = React.memo(function Td({ children, align = 'left', style, ...rest }) {
  return <td {...rest} style={{padding: '12px 14px', textAlign: align, verticalAlign: 'middle', ...style}}>{children}</td>;
});
const SyncIndicator = React.memo(function SyncIndicator({ lastSync, onRefresh, t, lang }) {
  const [tick, setTick] = useState(0);
  // Re-render every 30s to update relative time
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 15000);
    return () => clearInterval(id);
  }, []);
  // Compute relative time
  const relative = useMemo(() => {
    if (!lastSync) return lang === 'id' ? 'Belum tersinkron' : 'Not synced yet';
    const diffMs = Date.now() - lastSync;
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return lang === 'id' ? 'Baru saja' : 'Just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return lang === 'id' ? `${min} menit lalu` : `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return lang === 'id' ? `${hr} jam lalu` : `${hr}h ago`;
    const days = Math.floor(hr / 24);
    return lang === 'id' ? `${days} hari lalu` : `${days}d ago`;
  }, [lastSync, tick, lang]);
  const dotColor = !lastSync || (Date.now() - lastSync) > 5 * 60 * 1000 ? 'var(--ims-gold)' : 'var(--ims-accent-2)';
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10.5px', color: 'var(--ims-text-2)'}}>
      <span style={{display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: dotColor, boxShadow: dotColor === 'var(--ims-accent-2)' ? `0 0 6px ${dotColor}` : 'none'}} title={lang === 'id' ? (dotColor === 'var(--ims-accent-2)' ? 'Tersinkron baru-baru ini' : 'Perlu refresh') : (dotColor === 'var(--ims-accent-2)' ? 'Recently synced' : 'Needs refresh')} />
      <span style={{fontFamily: 'inherit'}}>{lang === 'id' ? 'Tersinkron' : 'Synced'}: <span className="mono" style={{color: 'var(--ims-text)', fontWeight: 500}}>{relative}</span></span>
      <button onClick={onRefresh} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '3px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px'}} title={lang === 'id' ? 'Refresh data manual' : 'Manual refresh'}>
        <RefreshCw size={10} strokeWidth={1.5} />{lang === 'id' ? 'Refresh' : 'Refresh'}
      </button>
    </div>
  );
});
class ModuleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    try { console.error('[IMS module error]', this.props.name || 'module', error, info); } catch {}
  }
  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{padding: '18px', background: 'var(--ims-bg-card)', border: '1px solid #c03030', color: 'var(--ims-text)', marginBottom: '16px'}}>
        <div style={{fontSize: '12px', fontWeight: 800, color: '#c03030', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px'}}>{this.props.title || 'Modul bermasalah'}</div>
        <div style={{fontSize: '12px', color: 'var(--ims-text-2)'}}>{this.props.message || 'Data lama tidak bisa dibaca sempurna. Silakan refresh atau buka tab lain.'}</div>
        <div className="mono" style={{fontSize: '10px', color: '#c03030', marginTop: '8px', wordBreak: 'break-word'}}>{String(this.state.error?.message || this.state.error || '')}</div>
      </div>
    );
  }
}

export { IMSLogo, GlobalStyles, WIBClock, ChartTooltip, PieCard, PieWithSummary, KPICard, ReadOnlyBanner, Field, ConfirmDialog, LinkAttachment, SortToggle, Th, Td, SyncIndicator, ModuleErrorBoundary };

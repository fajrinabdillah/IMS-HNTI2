// Shared futuristic dashboard chrome — glass panels, hero header, KPI tiles.
import { Sparkles, Zap } from 'lucide-react';

export const DASHBOARD_GLASS = {
  pipeline: {
    background: 'linear-gradient(145deg, rgba(26,77,138,0.12) 0%, rgba(200,169,106,0.08) 45%, rgba(47,143,111,0.06) 100%)',
    border: '1px solid rgba(26,77,138,0.22)',
    boxShadow: '0 0 28px rgba(26,77,138,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
    accent: '#1a4d8a',
    glow: 'rgba(26,77,138,0.18)',
  },
  sph: {
    background: 'linear-gradient(145deg, rgba(200,169,106,0.12) 0%, rgba(26,77,138,0.08) 45%, rgba(91,141,239,0.06) 100%)',
    border: '1px solid rgba(200,169,106,0.28)',
    boxShadow: '0 0 28px rgba(200,169,106,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
    accent: 'var(--ims-gold)',
    glow: 'rgba(200,169,106,0.2)',
  },
  finance: {
    background: 'linear-gradient(145deg, rgba(47,143,111,0.10) 0%, rgba(200,169,106,0.08) 45%, rgba(26,77,138,0.06) 100%)',
    border: '1px solid rgba(47,143,111,0.22)',
    boxShadow: '0 0 28px rgba(47,143,111,0.07), inset 0 1px 0 rgba(255,255,255,0.05)',
    accent: '#2f8f6f',
    glow: 'rgba(47,143,111,0.15)',
  },
  operations: {
    background: 'linear-gradient(145deg, rgba(91,141,239,0.10) 0%, rgba(212,120,10,0.07) 45%, rgba(47,143,111,0.05) 100%)',
    border: '1px solid rgba(91,141,239,0.22)',
    boxShadow: '0 0 28px rgba(91,141,239,0.07), inset 0 1px 0 rgba(255,255,255,0.05)',
    accent: '#5b8def',
    glow: 'rgba(91,141,239,0.15)',
  },
  regulatory: {
    background: 'linear-gradient(145deg, rgba(47,143,111,0.10) 0%, rgba(26,77,138,0.08) 45%, rgba(123,63,181,0.05) 100%)',
    border: '1px solid rgba(47,143,111,0.22)',
    boxShadow: '0 0 28px rgba(47,143,111,0.07), inset 0 1px 0 rgba(255,255,255,0.05)',
    accent: '#2f8f6f',
    glow: 'rgba(47,143,111,0.15)',
  },
  installation: {
    background: 'linear-gradient(145deg, rgba(26,77,138,0.10) 0%, rgba(47,143,111,0.08) 45%, rgba(200,169,106,0.05) 100%)',
    border: '1px solid rgba(26,77,138,0.20)',
    boxShadow: '0 0 28px rgba(26,77,138,0.06), inset 0 1px 0 rgba(255,255,255,0.05)',
    accent: '#1a4d8a',
    glow: 'rgba(26,77,138,0.15)',
  },
  incentive: {
    background: 'linear-gradient(145deg, rgba(16,185,129,0.12) 0%, rgba(20,184,166,0.10) 45%, rgba(47,143,111,0.06) 100%)',
    border: '1px solid rgba(16,185,129,0.28)',
    boxShadow: '0 0 28px rgba(16,185,129,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
    accent: '#10b981',
    glow: 'rgba(16,185,129,0.18)',
  },
  salesTeam: {
    background: 'linear-gradient(145deg, rgba(79,70,229,0.14) 0%, rgba(99,102,241,0.10) 45%, rgba(6,182,212,0.08) 100%)',
    border: '1px solid rgba(99,102,241,0.28)',
    boxShadow: '0 0 28px rgba(79,70,229,0.10), inset 0 1px 0 rgba(255,255,255,0.05)',
    accent: '#6366f1',
    glow: 'rgba(99,102,241,0.20)',
  },
  fieldReport: {
    background: 'linear-gradient(145deg, rgba(245,158,11,0.14) 0%, rgba(249,115,22,0.10) 45%, rgba(234,88,12,0.06) 100%)',
    border: '1px solid rgba(245,158,11,0.30)',
    boxShadow: '0 0 28px rgba(245,158,11,0.10), inset 0 1px 0 rgba(255,255,255,0.05)',
    accent: '#f59e0b',
    glow: 'rgba(245,158,11,0.20)',
  },
  businessTrip: {
    background: 'linear-gradient(145deg, rgba(91,141,239,0.10) 0%, rgba(200,169,106,0.08) 45%, rgba(47,143,111,0.06) 100%)',
    border: '1px solid rgba(91,141,239,0.22)',
    boxShadow: '0 0 28px rgba(91,141,239,0.07), inset 0 1px 0 rgba(255,255,255,0.05)',
    accent: '#5b8def',
    glow: 'rgba(91,141,239,0.15)',
  },
};

export function LiveSyncBadge({ lang = 'id' }) {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', border: '1px solid rgba(47,143,111,0.35)', background: 'rgba(47,143,111,0.08)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ims-accent-2)'}}>
      <Zap size={12} /> {lang === 'id' ? 'SINKRON SPH REALTIME' : 'SPH LIVE SYNC'}
    </div>
  );
}

export function DashboardHero({ glass, badge, title, subtitle, lang = 'id', showSync = true }) {
  const g = glass || DASHBOARD_GLASS.pipeline;
  return (
    <div style={{...g, background: g.background, border: g.border, boxShadow: g.boxShadow, padding: '22px 24px', position: 'relative', overflow: 'hidden'}}>
      <div style={{position: 'absolute', top: '-30px', right: '-10px', width: '160px', height: '160px', borderRadius: '50%', background: `radial-gradient(circle, ${g.glow} 0%, transparent 70%)`, pointerEvents: 'none'}} />
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', position: 'relative'}}>
        <div>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: g.accent, marginBottom: '8px'}}>
            <Sparkles size={13} /> {badge || 'Command Center'}
          </div>
          <h2 className="serif" style={{fontSize: '28px', fontWeight: 500, margin: 0, lineHeight: 1.15}}>{title}</h2>
          {subtitle && <p style={{fontSize: '12px', color: 'var(--ims-text-2)', margin: '8px 0 0', maxWidth: '560px'}}>{subtitle}</p>}
        </div>
        {showSync && <LiveSyncBadge lang={lang} />}
      </div>
    </div>
  );
}

export function GlassPanel({ glass, children, style = {} }) {
  const g = glass || DASHBOARD_GLASS.pipeline;
  return (
    <div style={{...g, background: g.background, border: g.border, boxShadow: g.boxShadow, padding: '18px 20px', ...style}}>
      {children}
    </div>
  );
}

export function DashboardKpiGrid({ items }) {
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1px', background: 'var(--ims-border)', border: '1px solid var(--ims-border)'}}>
      {items.map(k => (
        <div key={k.label} style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div className="lbl-tag">{k.label}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: k.color || 'var(--ims-text)'}}>{k.value}</div>
          {k.sub && <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{k.sub}</div>}
        </div>
      ))}
    </div>
  );
}

export function QuickNavGrid({ links, onNavigate, glass }) {
  const g = glass || DASHBOARD_GLASS.pipeline;
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px'}}>
      {links.map(link => {
        const Icon = link.icon;
        return (
          <button key={link.id} type="button" onClick={() => onNavigate?.(link.id)} style={{...g, background: g.background, border: g.border, boxShadow: g.boxShadow, padding: '14px 16px', cursor: onNavigate ? 'pointer' : 'default', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{width: '36px', height: '36px', borderRadius: '8px', background: (link.color || g.accent) + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: link.color || g.accent}}><Icon size={18} /></div>
            <div><div style={{fontSize: '12px', fontWeight: 600}}>{link.label}</div><div style={{fontSize: '20px', fontWeight: 700, color: link.color || g.accent}}>{link.count ?? '—'}</div></div>
          </button>
        );
      })}
    </div>
  );
}

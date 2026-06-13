// Extracted from App.jsx during modular refactor.
const IMS_THEMES = {
  ve: {
    name: 'Venta Emerald',
    // Surfaces
    bg: '#05130c', bgCard: '#082015', bgCard2: '#0c2820', bgAlt: '#0a2418',
    border: '#235a45', borderSoft: '#1a3a2c',
    // Text
    text: '#f0fbf3', text2: '#a8d2bd', text3: '#6e9b82',
    // Accents (primary brand color)
    accent: '#4ef0a8', accent2: '#3eb88a', accentInk: '#04130b',
    accentGlow: 'rgba(78,240,168,0.55)',
    accentBg: 'rgba(78,240,168,0.08)', accentBgStrong: 'rgba(78,240,168,0.16)',
    // Gold
    gold: '#fcd116', goldBright: '#ffec47', goldDim: '#b8935a',
    goldBg: '#241f0c', goldGlow: 'rgba(255,236,71,0.7)',
    // Logo gradient stops
    logo1: '#ffec47', logo2: '#fcd116', logo3: '#4ef0a8',
    // Scrollbar
    sbTrack: '#0a1a13', sbThumb: '#235a45',
    // Page ambient
    ambient: 'radial-gradient(60% 50% at 18% 0%, rgba(16,185,129,0.10) 0%, transparent 55%), radial-gradient(50% 45% at 90% 8%, rgba(45,212,191,0.07) 0%, transparent 55%)',
  },
  sn: {
    name: 'Sapphire Noir',
    bg: '#02050f', bgCard: '#08102a', bgCard2: '#0e1838', bgAlt: '#0d1a3a',
    border: '#1f3868', borderSoft: '#15264a',
    text: '#ecf2ff', text2: '#9badd0', text3: '#5e7099',
    accent: '#5e9bff', accent2: '#4280e0', accentInk: '#061226',
    accentGlow: 'rgba(94,155,255,0.6)',
    accentBg: 'rgba(94,155,255,0.08)', accentBgStrong: 'rgba(94,155,255,0.16)',
    gold: '#ffd54a', goldBright: '#ffe07a', goldDim: '#a88a40',
    goldBg: '#1a1408', goldGlow: 'rgba(255,213,74,0.65)',
    logo1: '#7aaeff', logo2: '#5e9bff', logo3: '#ffd54a',
    sbTrack: '#070d1c', sbThumb: '#1f3868',
    ambient: 'radial-gradient(60% 50% at 18% 0%, rgba(94,155,255,0.10) 0%, transparent 55%), radial-gradient(50% 45% at 90% 8%, rgba(122,174,255,0.06) 0%, transparent 55%)',
  },
};
const CHART_COLORS = ['#5b8def', '#a026a0', '#2f8f6f', '#d4af37', '#5b87b8', '#c03030', '#7b3fb5', '#94a3b8'];

export { IMS_THEMES, CHART_COLORS };

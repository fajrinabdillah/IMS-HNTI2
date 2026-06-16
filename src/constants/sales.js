// Extracted from App.jsx during modular refactor.
const KSO_INVESTOR_PCT_OPTIONS = (() => {
  const arr = []; for (let p = 60.0; p <= 80.0 + 1e-9; p += 0.5) arr.push(Math.round(p * 10) / 10); return arr;
})();
const KSO_YEAR_OPTIONS = [5, 6, 7, 8, 9, 10];
const CICILAN_DP_OPTIONS = (() => {
  const arr = []; for (let p = 0; p <= 100; p++) arr.push(p); return arr;
})();
const CICILAN_TERM_OPTIONS = (() => {
  const arr = []; for (let m = 1; m <= 60; m++) arr.push(m); return arr;
})();
const PRODUCT_MASTER_SEED = [
  // === MRI (ANKE / Shenzhen Anke High-Tech, China) ===
  { id: 'prod_mri_15t_hfm', name: 'MRI 1.5 Tesla', modality: 'MRI', brand: 'ANKE', type: 'Supermark 1.5T HFM', origin: 'China', principal: 'Shenzhen Anke High-Tech', tkdn: 0, akl: 'KEMENKES RI AKL 10303320XXX', active: true, notes: 'Non-Helium 1.5Tesla MRI System' },
  { id: 'prod_mri_15t_art', name: 'MRI 1.5 Tesla', modality: 'MRI', brand: 'ANKE', type: 'Supermark 1.5T ART', origin: 'China', principal: 'Shenzhen Anke High-Tech', tkdn: 0, akl: 'KEMENKES RI AKL 10303320XXX', active: true, notes: 'Less-Helium 1.5Tesla MRI System (700 Liter)' },
  { id: 'prod_mri_30t', name: 'MRI 3.0T Supermark', modality: 'MRI', brand: 'ANKE', type: 'Supermark S900', origin: 'China', principal: 'Shenzhen Anke High-Tech', tkdn: 0, akl: 'KEMENKES RI AKL 10303320XXX', active: true, notes: 'Premium 3.0T research-grade' },
  // === CT Scan (ANKE, China) ===
  { id: 'prod_ct64_cardiac', name: 'CT 64 Slice Cardiac', modality: 'CT Scan', brand: 'ANKE', type: 'Anatom Clarity', origin: 'China', principal: 'Shenzhen Anke High-Tech', tkdn: 0, akl: 'KEMENKES RI AKL 10303220XXX', active: true, notes: 'CT 64-slice cardiac' },
  { id: 'prod_ct128_premium', name: 'CT 128 Slice Premium', modality: 'CT Scan', brand: 'ANKE', type: 'Anatom Precision', origin: 'China', principal: 'Shenzhen Anke High-Tech', tkdn: 0, akl: 'KEMENKES RI AKL 10303220XXX', active: true, notes: 'High-end diagnostic CT' },
  { id: 'prod_ct32', name: 'CT 32 Slice', modality: 'CT Scan', brand: 'Supermark', type: 'Anatom C201', origin: 'China', principal: 'Shenzhen Anke High-Tech', tkdn: 0, akl: 'KEMENKES RI AKL 10303220XXX', active: true, notes: 'Budget-friendly entry CT' },
  { id: 'prod_ct64_noncardiac', name: 'CT 64 Slice Non-Cardiac', modality: 'CT Scan', brand: 'ANKE', type: 'Anatom C206', origin: 'China', principal: 'Shenzhen Anke High-Tech', tkdn: 0, akl: 'KEMENKES RI AKL 10303440XXX', active: true, notes: 'CT 64-slice non-cardiac' },
  { id: 'prod_ct128_basic', name: 'CT 128 Slice Basic', modality: 'CT Scan', brand: 'ANKE', type: 'Anatom C409', origin: 'China', principal: 'Shenzhen Anke High-Tech', tkdn: 0, akl: 'KEMENKES RI AKL 10303110XXX', active: true, notes: 'CT 128-slice budget-friendly' },
  // === C-Arm (SG Healthcare, Korea) ===
  { id: 'prod_carm_5kw', name: 'Mobile C-Arm', modality: 'C-Arm', brand: 'SG Healthcare', type: 'Garion 5kW', origin: 'Korea', principal: 'SG Healthcare', tkdn: 0, akl: 'KEMENKES RI AKL 10303440XXX', active: true, notes: 'Standard surgical C-Arm' },
  { id: 'prod_carm_15kw', name: 'Mobile C-Arm', modality: 'C-Arm', brand: 'SG Healthcare', type: 'Garion 15kW', origin: 'Korea', principal: 'SG Healthcare', tkdn: 0, akl: 'KEMENKES RI AKL 10303440XXX', active: true, notes: 'Advance surgical C-Arm' },
  // === X-Ray (SG Healthcare Korea + Precision China) ===
  { id: 'prod_xray_stat500', name: 'X-Ray Stationary 500mA', modality: 'X-Ray Stationer', brand: 'SG Healthcare', type: 'Jumong General', origin: 'Korea', principal: 'SG Healthcare', tkdn: 0, akl: 'KEMENKES RI AKL 10303110XXX', active: true, notes: 'General X-Ray floor mounted 500mA' },
  { id: 'prod_xray_ceiling500', name: 'X-Ray Ceiling 500mA', modality: 'X-Ray Ceiling', brand: 'SG Healthcare', type: 'Jumong General', origin: 'Korea', principal: 'SG Healthcare', tkdn: 0, akl: 'KEMENKES RI AKL 10303110XXX', active: true, notes: 'General X-Ray ceiling mounted 500mA' },
  { id: 'prod_xray_mobile100', name: 'X-ray Mobile 100mA', modality: 'X-Ray Mobile', brand: 'SG Healthcare', type: 'Jumong Mobile 5kW', origin: 'Korea', principal: 'SG Healthcare', tkdn: 0, akl: 'KEMENKES RI AKL 10303110XXX', active: true, notes: 'Entry Level X-Ray machine' },
  { id: 'prod_xray_portable', name: 'X-Ray Portable', modality: 'X-Ray Portable', brand: 'Precision', type: 'DJP05DR', origin: 'China', principal: 'Daoji Medical Equipment', tkdn: 0, akl: 'KEMENKES RI AKL 10303110XXX', active: true, notes: 'Portable X-Ray for ICU/ER/TB screening use' },
  // === Mammography (SINO MDT, China) ===
  { id: 'prod_mammo_3d', name: 'Mammography 3D Tomosynthesis', modality: 'Mammography', brand: 'SINO MDT', type: 'Navigator 1000A', origin: 'China', principal: 'SINO MDT', tkdn: 0, akl: 'KEMENKES RI AKL 10303550XXX', active: true, notes: '3D digital mammography with tomosynthesis' },
  { id: 'prod_mammo_2d', name: 'Mammography 2D Digital', modality: 'Mammography', brand: 'SINO MDT', type: 'Navigator DRCare', origin: 'China', principal: 'SINO MDT', tkdn: 0, akl: 'KEMENKES RI AKL 10303550XXX', active: true, notes: '2D digital mammography' },
  // === Flat Panel Detector (Innocare HAMSKI XR, Taiwan) ===
  { id: 'prod_fpd_17', name: 'Flat Panel Detector 17x17 inch', modality: 'Flat Panel Detector', brand: 'Innocare (HAMSKI XR)', type: 'V17C', origin: 'Taiwan', principal: 'Innocare Optoelectronics', tkdn: 0, akl: 'KEMENKES RI AKL 10303660XXX', active: true, notes: 'Wireless flat panel detector 17 inch' },
  { id: 'prod_fpd_14', name: 'Flat Panel Detector 14x17 inch', modality: 'Flat Panel Detector', brand: 'Innocare (HAMSKI XR)', type: 'V14C', origin: 'Taiwan', principal: 'Innocare Optoelectronics', tkdn: 0, akl: 'KEMENKES RI AKL 10303660XXX', active: true, notes: 'Wireless flat panel detector 14 inch' },
  // === ESWL (Hyde Medical HAMSKI XR, China) ===
  { id: 'prod_eswl_advance', name: 'ESWL', modality: 'ESWL', brand: 'Hyde Medical (HAMSKI XR)', type: '168A', origin: 'China', principal: 'Shenzhen Hyde Medical', tkdn: 0, akl: 'KEMENKES RI AKL 10303770XXX', active: true, notes: 'Extracorporeal Shock Wave Lithotripter Advance model' },
  { id: 'prod_eswl_basic', name: 'ESWL', modality: 'ESWL', brand: 'Hyde Medical (HAMSKI XR)', type: '168B', origin: 'China', principal: 'Shenzhen Hyde Medical', tkdn: 0, akl: 'KEMENKES RI AKL 10303770XXX', active: true, notes: 'Extracorporeal Shock Wave Lithotripter Basic model' },
  // === Angell (China) — premium digital X-Ray, principal baru (onboarding) ===
  { id: 'prod_angell_ceiling', name: 'X-Ray Ceiling Digital Premium', modality: 'X-Ray Ceiling', brand: 'Angell', type: 'Ceiling Digital Premium', origin: 'China', principal: 'Angell Medical', tkdn: 0, akl: 'KEMENKES RI AKL 10303110XXX', active: true, notes: 'Premium ceiling-mounted digital X-Ray' },
  { id: 'prod_angell_mobile', name: 'X-Ray Mobile Digital Premium', modality: 'X-Ray Mobile', brand: 'Angell', type: 'Mobile Digital Premium', origin: 'China', principal: 'Angell Medical', tkdn: 0, akl: 'KEMENKES RI AKL 10303110XXX', active: true, notes: 'Premium mobile digital X-Ray' },
  { id: 'prod_angell_fluoro', name: 'Digital Fluoroscopy Premium', modality: 'Fluoroscopy', brand: 'Angell', type: 'Digital Fluoroscopy Premium', origin: 'China', principal: 'Angell Medical', tkdn: 0, akl: 'KEMENKES RI AKL 10303110XXX', active: true, notes: 'Premium digital fluoroscopy system' },
];
const BUSINESS_PARTNERS = [
  { id: 'sg', name: 'SG Healthcare', country: 'Korea', flag: '🇰🇷', color: '#1a4d8a', status: 'active', brands: ['SG Healthcare'] },
  { id: 'anke', name: 'ANKE', country: 'China', flag: '🇨🇳', color: '#c03030', status: 'active', brands: ['ANKE', 'Supermark'] },
  { id: 'sino', name: 'SINO MDT', country: 'China', flag: '🇨🇳', color: '#d4780a', status: 'active', brands: ['SINO MDT'] },
  { id: 'hyde', name: 'Hyde Medical', country: 'China', flag: '🇨🇳', color: '#7b3fb5', status: 'active', brands: ['Hyde Medical (HAMSKI XR)'] },
  { id: 'precision', name: 'Precision', country: 'China', flag: '🇨🇳', color: '#0f7a5a', status: 'active', brands: ['Precision'] },
  { id: 'angell', name: 'Angell', country: 'China', flag: '🇨🇳', color: '#0f7a5a', status: 'onboarding', brands: ['Angell'] },
  { id: 'innocare', name: 'Innocare', country: 'Taiwan', flag: '🇹🇼', color: '#b8860b', status: 'onboarding', brands: ['Innocare (HAMSKI XR)'] },
];
const SPH_PRODUCT_NORMALIZATION = {
  'MRI::MRI 1.5T Supermark': { modality: 'MRI', subModality: 'Supermark 1.5T HFM' },
  'MRI::MRI 1.5T': { modality: 'MRI', subModality: 'Supermark 1.5T HFM' },
  'MRI::MRI 0.5T Opemark 5000': { modality: 'MRI', subModality: 'Supermark 1.5T ART' },
  'MRI::MRI 3.0T': { modality: 'MRI', subModality: 'Supermark S900' },
  'CT Scan::CT 64 Slice Anatom Clarity': { modality: 'CT Scan', subModality: 'Anatom Clarity' },
  'CT Scan::CT 128 Slice Anatom Precision': { modality: 'CT Scan', subModality: 'Anatom Precision' },
  'CT Scan::CT 32 Slice C201': { modality: 'CT Scan', subModality: 'Anatom C201' },
  'CT Scan::CT 32 Slice': { modality: 'CT Scan', subModality: 'Anatom C201' },
  'CT Scan::CT 128 Slice': { modality: 'CT Scan', subModality: 'Anatom C409' },
  'CT Scan::CT 64 Slice': { modality: 'CT Scan', subModality: 'Anatom C206' },
  'C-Arm::C-Arm Garion': { modality: 'C-Arm', subModality: 'Garion 5kW' },
  'C-Arm::C-Arm Surgical': { modality: 'C-Arm', subModality: 'Garion 5kW' },
  'C-Arm::C-Arm Garion 15kW': { modality: 'C-Arm', subModality: 'Garion 15kW' },
  'X-Ray::X-Ray Mobile 100mA': { modality: 'X-Ray Mobile', subModality: 'Jumong Mobile 5kW' },
  'X-Ray::X-Ray Mobile': { modality: 'X-Ray Mobile', subModality: 'Jumong Mobile 5kW' },
  'X-Ray::X-Ray Stationary 500mA': { modality: 'X-Ray Stationer', subModality: 'Jumong General' },
  'X-Ray::X-Ray Stationary Jumong General': { modality: 'X-Ray Stationer', subModality: 'Jumong General' },
  'X-Ray::X-Ray Digital DR': { modality: 'X-Ray Stationer', subModality: 'Jumong General' },
  'X-Ray::X-Ray Ceiling 500mA': { modality: 'X-Ray Ceiling', subModality: 'Jumong General' },
  'X-Ray::Flat Panel Detector': { modality: 'Flat Panel Detector', subModality: 'V17C' },
  'X-Ray::X-Ray Portable': { modality: 'X-Ray Portable', subModality: 'DJP05DR' },
  'Mammography::Mammo 3D': { modality: 'Mammography', subModality: 'Navigator 1000A' },
  'Mammography::Mammo Tomosynthesis': { modality: 'Mammography', subModality: 'Navigator 1000A' },
  'Mammography::Mammo 2D Navigator': { modality: 'Mammography', subModality: 'Navigator DRCare' },
  'Mammography::Mammo Digital': { modality: 'Mammography', subModality: 'Navigator DRCare' },
  'ESWL::ESWL Hyde Medical Tipe 109X': { modality: 'ESWL', subModality: '168A' },
  'ESWL::ESWL Hyde Medical Tipe 109': { modality: 'ESWL', subModality: '168B' },
  'ESWL::ESWL Compact': { modality: 'ESWL', subModality: '168B' },
  'ESWL::ESWL Tipe 109X': { modality: 'ESWL', subModality: '168A' },
  'CT Scan::CT 16 Slice': { modality: 'CT Scan', subModality: 'Anatom C201' },
  'Mammography::Mammography Navigator DRCare': { modality: 'Mammography', subModality: 'Navigator DRCare' },
  'X-Ray::X-Ray Konvensional': { modality: 'X-Ray Stationer', subModality: 'Jumong General' },
};
const STAGES = [
  { id: 'sph_sent', baseProbability: 20, color: '#94a3b8' },
  { id: 'presentation_scheduled', baseProbability: 35, color: '#7d9cc5' },
  { id: 'presentation_done', baseProbability: 50, color: '#5b87b8' },
  { id: 'ecatalog', baseProbability: 40, color: '#a37fc0' },
  { id: 'negotiation', baseProbability: 70, color: 'var(--ims-accent)' },
  { id: 'tender', baseProbability: 55, color: 'var(--ims-gold-dim)' },
  { id: 'po_issued', baseProbability: 100, color: 'var(--ims-accent-2)' },
  { id: 'inactive', baseProbability: 0, color: '#64748b' },
  { id: 'lost', baseProbability: 0, color: '#8b3a3a' },
];
const PROJECT_TYPES = [
  { id: 'private', color: '#3a5a8a' },
  { id: 'government', color: '#8a5a3a' },
  { id: 'tender', color: '#5a3a8a' },
  { id: 'kso', color: 'var(--ims-accent)' },
];
const MODALITY_COLORS = {
  'CT Scan': '#1a4d8a', 'MRI': 'var(--ims-gold)', 'C-Arm': '#8a5a3a',
  'X-Ray': '#5a8a5a', 'Mammography': '#8a3a5a', 'ESWL': '#3a8a8a',
  'Flat Panel Detector': '#6a5acd',
  'X-Ray Stationer': '#5a8a5a', 'X-Ray Ceiling': '#4a7a4a',
  'X-Ray Mobile': '#6a9a6a', 'X-Ray Portable': '#3a6a3a',
};
const TENDER_SUBSTAGES = ['aanwijzing', 'presentation', 'bid_opening', 'announcement', 'objection', 'award'];

export { KSO_INVESTOR_PCT_OPTIONS, KSO_YEAR_OPTIONS, CICILAN_DP_OPTIONS, CICILAN_TERM_OPTIONS, PRODUCT_MASTER_SEED, BUSINESS_PARTNERS, SPH_PRODUCT_NORMALIZATION, STAGES, PROJECT_TYPES, MODALITY_COLORS, TENDER_SUBSTAGES };

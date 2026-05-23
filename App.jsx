import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, FileText, Briefcase, Plus, Search, Edit2, Trash2, X, ArrowUpRight, ArrowDownRight, Activity, DollarSign, Users, Clock, Globe, LogOut, Shield, Wrench, Truck, Wallet, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, FileCheck, Menu, ChevronDown, ClipboardList, Star, Settings, ShieldCheck, CalendarDays, AlertTriangle, FileSearch } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart, ComposedChart } from 'recharts';

const DEFAULT_USD_IDR = 17500;

const translations = {
  id: {
    system_name: 'IMS HNTI',
    system_full: 'Integrated Monitoring System',
    company: 'PT Harmoni Nasional Teknologi Indonesia',
    motto: 'Transparent · Accountable · Real-time',
    login_title: 'Masuk ke Sistem',
    login_subtitle: 'Akses terbatas untuk personel berwenang',
    username: 'Nama Pengguna',
    password: 'Kata Sandi',
    login_btn: 'Masuk',
    demo_credentials: 'Kredensial Demo',
    login_error: 'Nama pengguna atau kata sandi salah',
    logout: 'Keluar',
    welcome: 'Selamat datang',
    role_super_admin: 'Super Admin (CEO)',
    nav_dashboard: 'Dasbor',
    nav_sph: 'Manajemen SPH',
    nav_pipeline: 'Pipeline Board',
    nav_finance: 'Finance Module',
    nav_incentive: 'Insentif Sales',
    nav_valuation: 'Valuasi Perusahaan',
    pipeline_value: 'Nilai Pipeline',
    weighted_pipeline: 'Pipeline Tertimbang',
    revenue_ytd: 'Pendapatan YTD',
    win_rate: 'Win Rate',
    total_value: 'Total Nilai',
    status_active: 'Aktif',
    status_won: 'Menang',
    status_lost: 'Kalah',
    no_data: 'Belum ada data SPH',
    sph_title: 'Surat Penawaran Harga (SPH)',
    sph_subtitle: 'Daftar administrasi penawaran harga alat kesehatan radiologi',
    sph_number: 'No. SPH',
    customer: 'Nama Pelanggan',
    modality: 'Modalitas',
    quantity: 'Qty',
    value: 'Nilai SPH',
    status: 'Status Proyek',
    sales_owner: 'Sales PIC',
    actions: 'Aksi',
    pipeline_title: 'Pipeline Proyek & Tender',
    pipeline_subtitle: 'Siklus pelacakan probabilitas closing deal',
    stage_sph_sent: 'SPH Terkirim',
    stage_presentation_scheduled: 'Jadwal Presentasi',
    stage_presentation_done: 'Presentasi Selesai',
    stage_ecatalog: 'Tunggu E-Catalog',
    stage_negotiation: 'Tahap Negosiasi',
    stage_tender: 'Proses Tender',
    stage_po_issued: 'PO Terbit (Won)',
    stage_lost: 'Lost (Kalah/Batal)',
    finance_title: 'Finance & Account Receivable',
    finance_subtitle: 'Monitoring pelunasan piutang (AR) dari Rumah Sakit & Klinik',
    po_value: 'Total Nilai PO',
    cash_collected: 'Cash Collected YTD',
    ar_outstanding: 'AR Outstanding',
    ap_outstanding: 'AP ke Supplier',
    dp_paid: 'Uang Muka (DP)',
    final_paid: 'Pelunasan 100%',
    inc_title: 'Kalkulator Insentif Penjualan',
    inc_subtitle: 'Reward performa tim sales sebesar 1.5% dari Net Sales setelah PPN & Ops Cost',
    inc_total_estimated: 'Total Estimasi',
    inc_total_ready: 'Siap Dibayarkan',
    inc_total_paid: 'Sudah Dicairkan',
    inc_ytd: 'Insentif YTD',
    inc_net_sales: 'Net Sales',
    inc_amount: 'Nilai Insentif',
    inc_ops_cost: 'Potongan Operasional Proyek',
    inc_ops_editable: '(Default 5%, nilai persentase dapat Anda ubah)',
    inc_status_estimated: 'Estimasi (Menunggu Pembayaran)',
    inc_status_ready: 'Siap Dibayar (Pelunasan ≥50%)',
    inc_status_paid: 'Cair (Pelunasan 100%)',
    inc_view_detail: 'Lihat Rincian Perhitungan',
    inc_close: 'Tutup Detail',
    inc_status_legend: 'Keterangan Status',
    valuation_title: 'Valuation Tracker & Corporate Metrics',
    valuation_subtitle: 'Simulasi nilai valuasi perusahaan untuk bahan presentasi kepada investor luar negeri',
    current_valuation: 'Estimasi Valuasi Korporat',
    projected_revenue: 'Proyeksi Pendapatan Tahunan',
    pipeline_multiplier: 'Multiplier Sektor Kesehatan',
    ipo_readiness: 'Kesiapan IPO Readiness'
  },
  en: {
    system_name: 'IMS HNTI',
    system_full: 'Integrated Monitoring System',
    company: 'PT Harmoni Nasional Teknologi Indonesia',
    motto: 'Transparent · Accountable · Real-time',
    login_title: 'Sign In to System',
    login_subtitle: 'Restricted access for authorized personnel only',
    username: 'Username',
    password: 'Password',
    login_btn: 'Sign In',
    demo_credentials: 'Demo Credentials',
    login_error: 'Invalid username or password',
    logout: 'Sign Out',
    welcome: 'Welcome',
    role_super_admin: 'Super Admin (CEO)',
    nav_dashboard: 'Dashboard',
    nav_sph: 'Quotation Mgmt',
    nav_pipeline: 'Pipeline Board',
    nav_finance: 'Finance Module',
    nav_incentive: 'Incentive Module',
    nav_valuation: 'Corporate Valuation',
    pipeline_value: 'Pipeline Value',
    weighted_pipeline: 'Weighted Pipeline',
    revenue_ytd: 'Revenue YTD',
    win_rate: 'Win Rate',
    total_value: 'Total Value',
    status_active: 'Active',
    status_won: 'Won',
    status_lost: 'Lost',
    no_data: 'No data available',
    sph_title: 'Price Quotation Management (SPH)',
    sph_subtitle: 'Quotation registry for radiology medical devices',
    sph_number: 'Quotation No.',
    customer: 'Account Name',
    modality: 'Modality',
    quantity: 'Qty',
    value: 'Quotation Value',
    status: 'Project Status',
    sales_owner: 'Sales PIC',
    actions: 'Actions',
    pipeline_title: 'Project & Tender Pipeline',
    pipeline_subtitle: 'Tracking conversion metrics and closing probabilities',
    stage_sph_sent: 'Quotation Sent',
    stage_presentation_scheduled: 'Presentation Scheduled',
    stage_presentation_done: 'Presentation Completed',
    stage_ecatalog: 'Awaiting E-Catalog',
    stage_negotiation: 'In Negotiation',
    stage_tender: 'Tender Process',
    stage_po_issued: 'PO Issued (Won)',
    stage_lost: 'Lost / Cancelled',
    finance_title: 'Finance & Account Receivable',
    finance_subtitle: 'Tracking hospital invoices and outstanding Account Receivables (AR)',
    po_value: 'Total PO Value',
    cash_collected: 'Cash Collected YTD',
    ar_outstanding: 'AR Outstanding',
    ap_outstanding: 'AP Supplier',
    dp_paid: 'Down Payment (DP)',
    final_paid: 'Final Payment (100%)',
    inc_title: 'Sales Incentive Dashboard',
    inc_subtitle: 'Tracking sales commissions calculated at 1.5% of Net Sales (Excl. VAT & Ops Cost)',
    inc_total_estimated: 'Estimated Total',
    inc_total_ready: 'Ready to Pay',
    inc_total_paid: 'Paid Out',
    inc_ytd: 'Incentive YTD',
    inc_net_sales: 'Net Sales Amount',
    inc_amount: 'Incentive Reward',
    inc_ops_cost: 'Project Operational Deduction',
    inc_ops_editable: '(Default 5%, percentage value is editable)',
    inc_status_estimated: 'Estimated (Awaiting Payment)',
    inc_status_ready: 'Ready to Pay (Payment ≥50%)',
    inc_status_paid: 'Paid Out (Fully Settled)',
    inc_view_detail: 'View Calculation Breakdown',
    inc_close: 'Close Details',
    inc_status_legend: 'Status Legend',
    valuation_title: 'Valuation Tracker & Corporate Metrics',
    valuation_subtitle: 'Corporate valuation simulation modeling designed for foreign investor pitches',
    current_valuation: 'Estimated Corporate Valuation',
    projected_revenue: 'Projected Annualized Revenue',
    pipeline_multiplier: 'Healthcare Sector Multiplier',
    ipo_readiness: 'IPO Readiness Score'
  }
};

const SALES_TEAM = [
  { id: 'lukman', name: 'Lukman', initial: 'LK', territory: 'Jateng + DIY B', territoryEn: 'Central Java + DIY B', accent: '#1a6bb0' },
  { id: 'hatim', name: 'Hatim', initial: 'HT', territory: 'Jateng A', territoryEn: 'Central Java A', accent: '#d4780a' },
  { id: 'dwi', name: 'Dwi Wahyudianto', initial: 'DW', territory: 'Jabodetabek + Jabar', territoryEn: 'Jabodetabek + West Java', accent: '#c03030' },
  { id: 'tri', name: 'Tri Sutjahjono', initial: 'TS', territory: 'Jatim 1', territoryEn: 'East Java 1', accent: '#12855a' },
  { id: 'bagus', name: 'Bagus Iswahyudi', initial: 'BI', territory: 'Jatim 2', territoryEn: 'East Java 2', accent: '#7b3fb5' },
  { id: 'office', name: 'HNT Indonesia (Office)', initial: 'HO', territory: 'Nasional', territoryEn: 'Nationwide', accent: '#1a2942', isOffice: true },
];

const USERS = {
  'ceo': { password: 'hnti2026', role: 'super_admin', name: 'Fajrin Abdillah', initial: 'F' },
  'admin': { password: 'hnti2026', role: 'admin', name: 'Siti Rahayu', initial: 'SR' },
};

const PERMISSIONS = {
  super_admin: { dashboard: 'full', sph: 'full', pipeline: 'full', finance: 'full', incentive: 'full', valuation: 'full' },
  admin:       { dashboard: 'read', sph: 'full', pipeline: 'write', finance: 'read', incentive: 'none', valuation: 'none' },
};

const NAV_BY_ROLE = {
  super_admin: ['dashboard', 'sph', 'pipeline', 'finance', 'incentive', 'valuation'],
  admin:       ['dashboard', 'sph', 'pipeline', 'finance'],
};

const PRODUCT_CATALOG = [
  { mod: 'X-Ray', sub: 'X-Ray Stationary 500mA', price: 1450000000, partner: 'sg' },
  { mod: 'C-Arm', sub: 'C-Arm Garion', price: 2400000000, partner: 'sg' },
  { mod: 'CT Scan', sub: 'CT 128 Slice Anatom Precision', price: 8500000000, partner: 'anke' },
  { mod: 'MRI', sub: 'MRI 1.5T Supermark', price: 14200000000, partner: 'anke' },
  { mod: 'Mammography', sub: 'Mammo 2D Navigator', price: 3700000000, partner: 'sino' },
  { mod: 'ESWL', sub: 'ESWL Hyde Medical Tipe 109', price: 4500000000, partner: 'hyde' },
];

function seedRand(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
}

function generateBulkSPH() {
  const rand = seedRand(2026);
  const sphList = [];
  const customers = [
    'RS Premier Bintaro', 'RS Telogorejo Semarang', 'RS Hermina Yogyakarta', 
    'RS Siloam Surabaya', 'RS Mitra Keluarga Bekasi', 'RSUD Banyumas', 
    'RSUD Dr. Soetomo', 'RS Pelni Jakarta', 'Klinik Imaging Solo', 'PT Mitra Radiologi'
  ];

  for (let i = 0; i < 72; i++) {
    const cust = customers[i % customers.length] + ' (Lot ' + (Math.floor(i / customers.length) + 1) + ')';
    const r = rand();
    const ptype = r < 0.45 ? 'private' : r < 0.75 ? 'government' : r < 0.90 ? 'tender' : 'kso';
    const prod = PRODUCT_CATALOG[Math.floor(rand() * PRODUCT_CATALOG.length)];
    const qty = rand() < 0.88 ? 1 : 2;
    const isPO = i < 22; 
    const stage = isPO ? 'po_issued' : (r < 0.25 ? 'sph_sent' : r < 0.55 ? 'presentation_done' : 'negotiation');
    
    sphList.push({
      id: `sph_id_${i}`,
      sphNo: `SPH/2026/P${String(i + 100).padStart(3, '0')}`,
      customer: cust,
      customerType: 'hospital',
      projectType: ptype,
      modality: prod.mod,
      subModality: prod.sub,
      qty,
      unitPrice: prod.price,
      totalValue: qty * prod.price,
      issuedDate: `2026-03-${String((i % 25) + 1).padStart(2, '0')}`,
      salesOwner: SALES_TEAM[i % 5].id,
      status: isPO ? 'won' : 'active',
      stage,
      probability: isPO ? 100 : (stage === 'negotiation' ? 70 : 35),
      poStatus: isPO ? 'issued' : null,
      dpPaid: isPO,
      finalPaid: isPO && i % 2 === 0,
      shippingStatus: isPO ? 'delivered' : null,
      customsStatus: isPO ? 'released' : null,
      installationStatus: isPO ? 'installed' : null,
      opsPercent: 0.05
    });
  }
  return sphList;
}

const ALL_SPH = generateBulkSPH();

const storeGet = async (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const storeSet = async (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const storeDel = async (k) => { try { localStorage.removeItem(k); } catch {} };

const formatCurrency = (n, lang) => {
  if (!n) return lang === 'en' ? '$0' : 'Rp 0';
  if (lang === 'en') {
    const usd = n / DEFAULT_USD_IDR;
    if (usd >= 1e6) return `$${(usd / 1e6).toFixed(2)}M`;
    if (usd >= 1e3) return `$${(usd / 1e3).toFixed(1)}K`;
    return `$${usd.toFixed(0)}`;
  }
  if (n >= 1e12) return `Rp ${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(2)}M`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(1)}Jt`;
  return `Rp ${n.toLocaleString('id-ID')}`;
};

const formatCurrencyExact = (n, lang) => {
  if (!n) return lang === 'en' ? '$0' : 'Rp 0';
  if (lang === 'en') return `$${Math.round(n / DEFAULT_USD_IDR).toLocaleString('en-US')}`;
  return `Rp ${n.toLocaleString('id-ID')}`;
};

function calcIncentive(sph) {
  const grossPrice = sph.totalValue || 0;
  const dpp = grossPrice / 1.11;
  const opsPercent = sph.opsPercent !== undefined ? sph.opsPercent : 0.05;
  const netSales = dpp - (dpp * 0.025) - (grossPrice * opsPercent);
  return { grossPrice, dpp, netSales, incentive: netSales * 0.015, opsPercent };
}

function getIncentiveStatus(sph) {
  if (sph.poStatus !== 'issued') return null;
  if (sph.finalPaid) return { status: 'paid', label: 'inc_status_paid', color: '#3a6b3a' };
  if (sph.dpPaid) return { status: 'ready', label: 'inc_status_ready', color: '#c8a96a' };
  return { status: 'estimated', label: 'inc_status_estimated', color: '#94a3b8' };
}

function IMSLogo({ size = 'md', inverted = false }) {
  const txtColor = inverted ? '#f8f5ef' : '#1a2942';
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: '8px'}}>
      <span style={{fontSize: size === 'xl' ? '32px' : '20px', fontWeight: 900, color: txtColor, fontFamily: 'Inter'}}>iMS HNTI</span>
    </div>
  );
}

const GlobalStyles = () => (
  <style>{`
    * { box-sizing: border-box; }
    body { margin: 0; background: #f8f5ef; color: #1a2942; font-family: 'Inter', sans-serif; }
    .serif { font-family: Georgia, serif; }
    .mono { font-family: monospace; }
    .card { background: #fefcf7; border: 1px solid #e8e1cc; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
    .btn-primary { background: #1a2942; color: #f8f5ef; border: none; padding: 10px 20px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; }
    .btn-ghost { background: transparent; color: #1a2942; border: 1px solid #d4cdb8; padding: 8px 16px; cursor: pointer; display: inline-flex; align-items: center; }
    input, select, textarea { padding: 9px 12px; border: 1px solid #d4cdb8; background: #fefcf7; color: #1a2942; outline: none; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(26, 41, 66, 0.5); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(2px); }
    .modal-content { background: #f8f5ef; max-width: 600px; width: 100%; padding: 30px; border: 1px solid #d4cdb8; }
    .hover-row:hover { background: #f5f1e8 !important; }
  `}</style>
);

export default function App() {
  const [lang, setLang] = useState('id');
  const [session, setSession] = useState(null);
  const [data, setData] = useState(ALL_SPH);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sData = await storeGet('ims_data_v16'); if (sData) try { setData(JSON.parse(sData)); } catch {}
      const sSess = await storeGet('ims_session_v16'); if (sSess) try { setSession(JSON.parse(sSess)); } catch {}
      setLoading(false);
    })();
  }, []);

  useEffect(() => { if (!loading) storeSet('ims_data_v16', JSON.stringify(data)); }, [data, loading]);
  useEffect(() => { if (!loading) { session ? storeSet('ims_session_v16', JSON.stringify(session)) : storeDel('ims_session_v16'); } }, [session, loading]);

  const t = translations[lang];
  const fmt = (n) => formatCurrency(n, lang);
  const fmtExact = (n) => formatCurrencyExact(n, lang);

  if (loading) return <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><GlobalStyles /><h3>Initializing IMS HNTI Core Engine...</h3></div>;
  if (!session) return <LoginScreen t={t} lang={lang} onLogin={setSession} />;
  return <AuthApp session={session} setSession={setSession} lang={lang} setLang={setLang} t={t} data={data} setData={setData} fmt={fmt} fmtExact={fmtExact} />;
}

function LoginScreen({ t, lang, onLogin }) {
  const [username, setUsername] = useState('ceo');
  const [password, setPassword] = useState('hnti2026');
  return (
    <div style={{minHeight: '100vh', display: 'flex', background: '#f8f5ef'}}>
      <GlobalStyles />
      <div style={{flex: 1, background: '#1a2942', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#f8f5ef'}}>
        <IMSLogo size="xl" inverted />
        <div>
          <h1 className="serif" style={{fontSize: '38px', margin: 0}}>{translations[lang]?.company}</h1>
          <p style={{color: '#c8a96a', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '12px'}}>{translations[lang]?.motto}</p>
        </div>
      </div>
      <div style={{flex: '0 0 460px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#fefcf7', borderLeft: '1px solid #d4cdb8'}}>
        <h2>{t.login_title}</h2>
        <p style={{fontSize: '12px', color: '#8a7d5c', margin: '0 0 24px'}}>{t.login_subtitle}</p>
        <div>
          <label style={{fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#8a7d5c'}}>{t.username}</label>
          <input value={username} onChange={e => setUsername(e.target.value)} style={{marginTop: '6px', marginBottom: '16px'}} />
          <label style={{fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#8a7d5c'}}>{t.password}</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{marginTop: '6px', marginBottom: '24px'}} />
          <button className="btn-primary" style={{width: '100%', padding: '12px', justifyContent: 'center', fontSize: '13px'}} onClick={() => {
            const u = username.toLowerCase().trim();
            if (USERS[u] && USERS[u].password === password) onLogin({ ...USERS[u], username: u });
          }}>{t.login_btn}</button>
        </div>
      </div>
    </div>
  );
}

function AuthApp({ session, setSession, lang, setLang, t, data, setData, fmt, fmtExact }) {
  const [view, setView] = useState('dashboard');
  const allowedNav = NAV_BY_ROLE[session.role];
  const filteredData = useMemo(() => data, [data]);

  return (
    <div>
      <Header setSession={setSession} view={view} setView={setView} allowedNav={allowedNav} t={t} lang={lang} setLang={setLang} />
      <main style={{padding: '40px', maxWidth: '1440px', margin: '0 auto'}}>
        {view === 'dashboard' && <Dashboard data={filteredData} t={t} fmt={fmt} />}
        {view === 'sph' && <SPHManagement data={filteredData} t={t} fmt={fmt} />}
        {view === 'pipeline' && <PipelineBoard data={filteredData} t={t} fmt={fmt} />}
        {view === 'finance' && <FinanceModule data={data} setData={setData} t={t} fmt={fmt} />}
        {view === 'incentive' && <IncentiveModule data={data} setData={setData} t={t} lang={lang} fmt={fmt} fmtExact={fmtExact} />}
        {view === 'valuation' && <Valuation data={data} t={t} lang={lang} fmt={fmt} />}
      </main>
    </div>
  );
}

function Header({ setSession, view, setView, allowedNav, t, lang, setLang }) {
  return (
    <div style={{background: '#1a2942', color: '#fff', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <IMSLogo size="md" inverted />
      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        {allowedNav.map(n => (
          <button key={n} onClick={() => setView(n)} style={{background: view === n ? '#c8a96a' : 'transparent', color: view === n ? '#1a2942' : '#fff', border: 'none', padding: '8px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: 600}}>{t[`nav_${n}`]}</button>
        ))}
        <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} style={{background: 'transparent', border: '1px solid #c8a96a', color: '#c8a96a', padding: '6px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, marginLeft: '10px'}}>{lang.toUpperCase()}</button>
        <button onClick={() => setSession(null)} style={{background: '#c03030', color: '#fff', border: 'none', padding: '8px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, marginLeft: '5px'}}>Logout</button>
      </div>
    </div>
  );
}

const ChartTooltip = ({ active, payload, label, fmt }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{background: '#1a2942', color: '#f8f5ef', padding: '9px 13px', fontSize: '11px'}}>
      <div style={{fontWeight: 600, marginBottom: '4px'}}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{display: 'flex', justifyContent: 'space-between', gap: '12px'}}>{p.name}: {fmt ? fmt(p.value) : p.value}</div>
      ))}
    </div>
  );
};

function Dashboard({ data, t, fmt }) {
  const activeData = data.filter(s => s.status === 'active');
  const wonData = data.filter(s => s.status === 'won');
  const lostData = data.filter(s => s.status === 'lost');

  const totalPipeline = activeData.reduce((sum, s) => sum + s.totalValue, 0);
  const weightedPipeline = activeData.reduce((sum, s) => sum + (s.totalValue * s.probability / 100), 0);
  const revenueYTD = wonData.reduce((sum, s) => sum + s.totalValue, 0);
  const winRate = (wonData.length + lostData.length) > 0 ? (wonData.length / (wonData.length + lostData.length)) * 100 : 0;

  const monthlyTrend = ['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((m, i) => {
    const mData = data.filter(s => new Date(s.issuedDate).getMonth() === i);
    return { month: m, pipeline: mData.reduce((s, p) => s + p.totalValue, 0), weighted: mData.reduce((s, p) => s + (p.totalValue * p.probability / 100), 0) };
  });

  return (
    <div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px'}}>
        <div className="card"><div style={{fontSize: '11px', color: '#8a7d5c', textTransform: 'uppercase', fontWeight: 600}}>{t.pipeline_value}</div><h2 className="serif" style={{margin: '10px 0 0', fontSize: '26px'}}>{fmt(totalPipeline)}</h2></div>
        <div className="card"><div style={{fontSize: '11px', color: '#8a7d5c', textTransform: 'uppercase', fontWeight: 600}}>{t.weighted_pipeline}</div><h2 className="serif" style={{margin: '10px 0 0', fontSize: '26px'}}>{fmt(weightedPipeline)}</h2></div>
        <div className="card"><div style={{fontSize: '11px', color: '#8a7d5c', textTransform: 'uppercase', fontWeight: 600}}>{t.revenue_ytd}</div><h2 className="serif" style={{margin: '10px 0 0', color: '#3a6b3a', fontSize: '26px'}}>{fmt(revenueYTD)}</h2></div>
        <div className="card"><div style={{fontSize: '11px', color: '#8a7d5c', textTransform: 'uppercase', fontWeight: 600}}>{t.win_rate}</div><h2 className="serif" style={{margin: '10px 0 0', fontSize: '26px'}}>{winRate.toFixed(0)}%</h2></div>
      </div>
      <div className="card">
        <h3 className="serif" style={{marginTop: 0, marginBottom: '20px'}}>{t.monthly_pipeline}</h3>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={monthlyTrend}>
            <defs>
              <linearGradient id="pColor" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1a4d8a" stopOpacity={0.25}/><stop offset="95%" stopColor="#1a4d8a" stopOpacity={0.0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e1cc" vertical={false} />
            <XAxis dataKey="month" stroke="#8a7d5c" style={{fontSize: '11px'}} />
            <YAxis stroke="#8a7d5c" style={{fontSize: '11px'}} />
            <Tooltip content={<ChartTooltip fmt={fmt} />} />
            <Area type="monotone" dataKey="pipeline" fill="url(#pColor)" stroke="#1a4d8a" strokeWidth={2} name={t.pipeline_value} />
            <Area type="monotone" dataKey="weighted" fill="none" stroke="#c8a96a" strokeWidth={2} name={t.weighted_pipeline} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SPHManagement({ data, t, fmt }) {
  return (
    <div className="card">
      <h3 className="serif" style={{marginBottom: '20px', marginTop: 0}}>{t.sph_title}</h3>
      <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '13px'}}>
        <thead>
          <tr style={{background: '#f0ebe0', textAlign: 'left', borderBottom: '2px solid #d4cdb8'}}>
            <th style={{padding: '12px'}}>{t.sph_number}</th>
            <th style={{padding: '12px'}}>{t.customer}</th>
            <th style={{padding: '12px'}}>{t.modality}</th>
            <th style={{padding: '12px', textAlign: 'right'}}>{t.value}</th>
            <th style={{padding: '12px', paddingLeft: '24px'}}>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map(s => (
            <tr key={s.id} className="hover-row" style={{borderBottom: '1px solid #e8e1cc'}}>
              <td style={{padding: '12px'}} className="mono">{s.sphNo}</td>
              <td style={{padding: '12px', fontWeight: 600}}>{s.customer}</td>
              <td style={{padding: '12px'}}>{s.subModality}</td>
              <td style={{padding: '12px', textAlign: 'right'}} className="mono">{fmt(s.totalValue)}</td>
              <td style={{padding: '12px', paddingLeft: '24px'}}><span style={{color: s.status === 'won' ? '#3a6b3a' : '#1a2942', fontWeight: 600}}>{t[`status_${s.status}`]}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PipelineBoard({ data, t, fmt }) {
  return (
    <div>
      <h3 className="serif" style={{marginBottom: '20px', marginTop: 0}}>{t.pipeline_title}</h3>
      <div style={{display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '15px'}}>
        {STAGES.map(st => {
          const list = data.filter(d => d.stage === st.id);
          return (
            <div key={st.id} style={{flex: '0 0 280px', background: '#fefcf7', border: '1px solid #e8e1cc', padding: '15px'}}>
              <h4 style={{borderBottom: `3px solid ${st.color}`, paddingBottom: '8px', marginTop: 0, fontSize: '13px'}}>{t[`stage_${st.id}`]} ({list.length})</h4>
              <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px'}}>
                {list.slice(0, 8).map(p => (
                  <div key={p.id} style={{padding: '12px', background: '#fff', border: '1px solid #d4cdb8', borderRadius: '2px'}}>
                    <div style={{fontWeight: 600, fontSize: '12px', marginBottom: '4px', color: '#1a2942'}}>{p.customer}</div>
                    <div style={{fontSize: '11px', color: '#8a7d5c', marginBottom: '6px'}}>{p.subModality}</div>
                    <div className="mono" style={{fontSize: '12px', fontWeight: 600}}>{fmt(p.totalValue)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FinanceModule({ data, setData, t, fmt }) {
  const poProjects = data.filter(s => s.poStatus === 'issued');
  return (
    <div className="card">
      <h3 className="serif" style={{marginBottom: '20px', marginTop: 0}}>{t.finance_title}</h3>
      <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '13px'}}>
        <thead>
          <tr style={{background: '#f0ebe0', textAlign: 'left', borderBottom: '2px solid #d4cdb8'}}>
            <th style={{padding: '12px'}}>{t.customer}</th>
            <th style={{padding: '12px', textAlign: 'right'}}>{t.value}</th>
            <th style={{padding: '12px', textAlign: 'center'}}>{t.dp_paid} (30%)</th>
            <th style={{padding: '12px', textAlign: 'center'}}>{t.final_paid} (70%)</th>
          </tr>
        </thead>
        <tbody>
          {poProjects.map(p => (
            <tr key={p.id} className="hover-row" style={{borderBottom: '1px solid #e8e1cc'}}>
              <td style={{padding: '12px'}}>{p.customer} <br/><span style={{fontSize: '11px', color: '#8a7d5c'}}>{p.subModality}</span></td>
              <td style={{padding: '12px', textAlign: 'right'}} className="mono">{fmt(p.totalValue)}</td>
              <td style={{padding: '12px', textAlign: 'center'}}>
                <input type="checkbox" checked={p.dpPaid} onChange={() => setData(prev => prev.map(s => s.id === p.id ? {...s, dpPaid: !s.dpPaid} : s))} style={{width: 'auto'}} />
              </td>
              <td style={{padding: '12px', textAlign: 'center'}}>
                <input type="checkbox" checked={p.finalPaid} onChange={() => setData(prev => prev.map(s => s.id === p.id ? {...s, finalPaid: !s.finalPaid} : s))} style={{width: 'auto'}} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IncentiveModule({ data, setData, t, lang, fmt, fmtExact }) {
  const poDeals = data.filter(s => s.poStatus === 'issued');
  const [selectedDeal, setSelectedDeal] = useState(null);

  const dealsWithIncentive = useMemo(() => {
    return poDeals.map(s => ({ ...s, _calc: calcIncentive(s), _stat: getIncentiveStatus(s) }));
  }, [poDeals]);

  const ytdTotal = useMemo(() => {
    return dealsWithIncentive.reduce((sum, d) => sum + d._calc.incentive, 0);
  }, [dealsWithIncentive]);

  const updateOpsPercent = (id, opsPercent) => {
    setData(prev => prev.map(s => s.id === id ? { ...s, opsPercent: Math.max(0, Math.min(0.5, opsPercent)) } : s));
  };

  return (
    <div className="card">
      <h3 className="serif" style={{marginTop: 0, marginBottom: '20px'}}>{t.inc_title} <span style={{color: '#3a6b3a', marginLeft: '10px'}}>YTD: {fmt(ytdTotal)}</span></h3>
      <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '13px'}}>
        <thead>
          <tr style={{background: '#f0ebe0', textAlign: 'left', borderBottom: '2px solid #d4cdb8'}}>
            <th style={{padding: '12px'}}>{t.customer}</th>
            <th style={{padding: '12px', textAlign: 'right'}}>{t.inc_net_sales}</th>
            <th style={{padding: '12px', textAlign: 'right'}}>{t.inc_amount}</th>
            <th style={{padding: '12px'}}>{t.inc_status_legend}</th>
            <th style={{padding: '12px', textAlign: 'center'}}>{t.actions}</th>
          </tr>
        </thead>
        <tbody>
          {dealsWithIncentive.map(d => (
            <tr key={d.id} className="hover-row" style={{borderBottom: '1px solid #e8e1cc'}}>
              <td style={{padding: '12px', fontWeight: 500}}>{d.customer}</td>
              <td style={{padding: '12px', textAlign: 'right'}} className="mono">{fmt(d._calc.netSales)}</td>
              <td style={{padding: '12px', textAlign: 'right', color: '#3a6b3a', fontWeight: 'bold'}} className="mono">{fmt(d._calc.incentive)}</td>
              <td style={{padding: '12px'}}><span style={{color: d._stat.color, fontWeight: 600}}>{t[d._stat.label]}</span></td>
              <td style={{padding: '12px', textAlign: 'center'}}><button className="btn-ghost" style={{padding: '4px 10px', fontSize: '11px'}} onClick={() => setSelectedDeal(d)}>{t.inc_view_detail}</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedDeal && (
        <div className="modal-overlay" onClick={() => setSelectedDeal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="serif" style={{marginTop: 0}}>{selectedDeal.customer}</h3>
            <p style={{fontSize: '13px', color: '#8a7d5c', marginBottom: '15px'}}>{selectedDeal.subModality}</p>
            <div style={{margin: '20px 0', borderTop: '1px solid #d4cdb8', paddingTop: '15px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center'}}>
                <label style={{fontSize: '12px', fontWeight: 600, color: '#8a7d5c'}}>{t.inc_ops_cost} (%)</label>
                <input 
                  type="number" 
                  step="0.5" 
                  min="0" 
                  max="50" 
                  value={typeof selectedDeal.opsPercent === 'number' ? (selectedDeal.opsPercent * 100) : 5} 
                  onChange={(e) => {
                    const val = (parseFloat(e.target.value) || 0) / 100;
                    updateOpsPercent(selectedDeal.id, val);
                    setSelectedDeal(prev => ({ ...prev, opsPercent: val }));
                  }} 
                  style={{width: '90px', padding: '6px', fontWeight: 600}} 
                />
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px'}}>
                <span>{t.inc_net_sales}:</span>
                <span className="mono">{fmtExact(calcIncentive(selectedDeal).netSales, lang)}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', background: '#1a2942', color: '#c8a96a', padding: '14px', marginTop: '15px'}}>
                <span style={{fontWeight: 600}}>{t.inc_amount}:</span>
                <span className="mono" style={{fontWeight: 700, fontSize: '15px'}}>{fmtExact(calcIncentive(selectedDeal).incentive, lang)}</span>
              </div>
            </div>
            <button className="btn-primary" style={{width: '100%', padding: '12px', justifyContent: 'center'}} onClick={() => setSelectedDeal(null)}>{t.inc_close}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Valuation({ data, t, lang, fmt }) {
  const wonData = data.filter(s => s.status === 'won');
  const revenueYTD = wonData.reduce((sum, s) => sum + s.totalValue, 0);
  const currentValuation = revenueYTD * 1.8;

  const valuationTrend = useMemo(() => {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((m, i) => ({
      month: m,
      valuation: currentValuation * (1 + i * 0.04)
    }));
  }, [currentValuation]);

  return (
    <div className="card">
      <h3 className="serif" style={{marginBottom: '20px', marginTop: 0}}>{t.valuation_title}</h3>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', margin: '20px 0'}}>
        <div style={{background: '#fefcf7', border: '1px solid #e8e1cc', padding: '15px'}}>
          <div style={{fontSize: '11px', color: '#8a7d5c', textTransform: 'uppercase', fontWeight: 600}}>{t.current_valuation}</div>
          <h2 className="serif" style={{color: '#c8a96a', margin: '5px 0 0', fontSize: '24px'}}>{fmt(currentValuation)}</h2>
        </div>
        <div style={{background: '#fefcf7', border: '1px solid #e8e1cc', padding: '15px'}}>
          <div style={{fontSize: '11px', color: '#8a7d5c', textTransform: 'uppercase', fontWeight: 600}}>{t.projected_revenue}</div>
          <h2 className="serif" style={{margin: '5px 0 0', fontSize: '24px'}}>{fmt(revenueYTD)}</h2>
        </div>
        <div style={{background: '#fefcf7', border: '1px solid #e8e1cc', padding: '15px'}}>
          <div style={{fontSize: '11px', color: '#8a7d5c', textTransform: 'uppercase', fontWeight: 600}}>{t.ipo_readiness}</div>
          <h2 className="serif" style={{color: '#3a6b3a', margin: '5px 0 0', fontSize: '24px'}}>86%</h2>
        </div>
      </div>
      <div style={{marginTop: '30px'}}>
        <h4 className="serif" style={{marginBottom: '15px', color: '#1a2942'}}>{lang === 'id' ? 'Proyeksi Grafik Valuasi Korporat' : 'Corporate Valuation Trend'}</h4>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={valuationTrend}>
            <defs>
              <linearGradient id="vColor" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#c8a96a" stopOpacity={0.25}/><stop offset="95%" stopColor="#c8a96a" stopOpacity={0.0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e1cc" vertical={false} />
            <XAxis dataKey="month" stroke="#8a7d5c" style={{fontSize: '11px'}} />
            <YAxis stroke="#8a7d5c" style={{fontSize: '11px'}} />
            <Tooltip content={<ChartTooltip fmt={fmt} />} />
            <Area type="monotone" dataKey="valuation" fill="url(#vColor)" stroke="#c8a96a" strokeWidth={2} name={t.current_valuation} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

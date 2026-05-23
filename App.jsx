import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, FileText, Briefcase, Plus, Search, Edit2, Trash2, X, ArrowUpRight, ArrowDownRight, Activity, DollarSign, Users, Clock, Globe, LogOut, Shield, Wrench, Truck, Wallet, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, FileCheck, Menu, ChevronDown, ClipboardList, Star, Settings, ShieldCheck, CalendarDays, AlertTriangle, FileSearch } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, ComposedChart } from 'recharts';

const DEFAULT_USD_IDR = 17500;

const translations = {
  id: {
    system_name: 'IMS HNTI', system_full: 'Integrated Monitoring System',
    company: 'PT Harmoni Nasional Teknologi Indonesia', motto: 'Transparent · Accountable · Real-time',
    login_title: 'Masuk ke Sistem', login_subtitle: 'Akses terbatas untuk personel berwenang',
    username: 'Nama Pengguna', password: 'Kata Sandi', login_btn: 'Masuk',
    demo_credentials: 'Kredensial Demo', login_error: 'Nama pengguna atau kata sandi salah',
    logout: 'Keluar', welcome: 'Selamat datang', role_super_admin: 'Super Admin (CEO)',
    nav_dashboard: 'Dasbor', nav_sph: 'Manajemen SPH', nav_pipeline: 'Pipeline', nav_sales: 'Tim Sales', nav_sales_report: 'Laporan Lapangan', nav_finance: 'Finance', nav_operations: 'Operasional', nav_installation: 'Instalasi', nav_maintenance: 'Maintenance', nav_regulatory: 'Regulatory', nav_valuation: 'Valuasi', nav_incentive: 'Insentif',
    pipeline_value: 'Nilai Pipeline', weighted_pipeline: 'Pipeline Tertimbang', revenue_ytd: 'Pendapatan YTD', win_rate: 'Win Rate', active_projects: 'Proyek Aktif', total_value: 'Total', status_active: 'Aktif', status_won: 'Menang', status_lost: 'Kalah', no_data: 'Belum ada data SPH',
    sph_title: 'Surat Penawaran Harga', sph_subtitle: 'Daftar administrasi penawaran harga diterbitkan', new_sph: 'SPH Baru', search_placeholder: 'Cari SPH, pelanggan, atau modalitas...', sph_number: 'No. SPH', customer: 'Pelanggan', project_type: 'Jenis Proyek', modality: 'Modalitas', quantity: 'Qty', value: 'Nilai', status: 'Status', sales_owner: 'Sales', actions: 'Aksi',
    pipeline_title: 'Pipeline Proyek & Tender', pipeline_subtitle: 'Siklus tindak lanjut dan probabilitas closing', stage_sph_sent: 'SPH Awal', stage_presentation_scheduled: 'Jadwal Presentasi', stage_presentation_done: 'Presentasi Selesai', stage_negotiation: 'Negosiasi', stage_tender: 'Proses Tender', stage_po_issued: 'PO Terbit', stage_lost: 'Hilang', stage_ecatalog: 'Tunggu E-Catalog', next_action: 'Tindak Lanjut', Next: 'Prioritas', notes: 'Catatan', probability: 'Probabilitas',
    finance_title: 'Finance & Account Receivable', finance_subtitle: 'Monitoring invoice dan pelunasan piutang (AR)', po_value: 'Nilai PO', cash_collected: 'Cash Collected YTD', ar_outstanding: 'AR Outstanding', ap_outstanding: 'AP Supplier', dp_paid: 'DP Dibayar', final_paid: 'Pelunasan', awaiting_payment: 'Menunggu',
    operations_title: 'Operasional & Logistik Internasional', operations_subtitle: 'Tracking pabrikasi, manifest perkapalan, dan pengeluaran bea cukai', ops_total_manifests: 'Total Manifest', ops_in_transit: 'Dalam Transit', ops_arrived_count: 'Sudah Sampai', ops_pending_docs: 'Dokumen Pending', plan_order_to_factory: 'Plan Order', ready_to_ship: 'Siap Kirim', on_shipment: 'Pengiriman', delivery_to_site: 'Diterima', customs_status: 'Status Customs', customs_released: 'Released', customs_ongoing: 'Proses', customs_hold: 'On Hold',
    installation_title: 'Instalasi, Training & Perizinan', installation_subtitle: 'Uji fungsi alat terpasang dan kelayakan izin radiasi BAPETEN', inst_total_records: 'Total Instalasi', inst_in_progress: 'Sedang Berlangsung', inst_completed_count: 'Selesai', inst_bast_signed: 'BAST Tertanda', inst_training_done: 'Training Selesai', installation_done: 'Instalasi Selesai', function_test: 'Uji Fungsi', exposure_test: 'Uji Paparan', training_cert: 'Sertifikat Training', bapeten_permit: 'Izin BAPETEN',
    mt_title: 'Preventive Maintenance System', mt_subtitle: 'Jadwal servis berkala alat rumah sakit dan keluhan teknis', mt_total_units: 'Alat Terpasang', mt_units_warranty: 'Dalam Garansi', mt_pm_this_month: 'PM Bulan Ini', mt_open_issues: 'Keluhan Open', mt_mark_done: 'Tandai Selesai', mt_pm_status_scheduled: 'Terjadwal', mt_pm_status_done: 'Selesai', mt_pm_status_overdue: 'Terlambat',
    reg_title: 'Regulatory & Izin Edar', reg_subtitle: 'Proses administrasi izin impor alat kesehatan radiologi', imp_total_active: 'Izin Aktif', imp_total_issued: 'Izin Terbit', akl_total_active: 'AKL Aktif', akl_total_issued: 'AKL Terbit', akl_avg_duration: 'Rata-rata Hari',
    inc_title: 'Kalkulator Insentif Penjualan', inc_subtitle: 'Reward performa tim sales 1.5% dari nilai penjualan bersih', inc_total_estimated: 'Estimasi', inc_total_ready: 'Siap Bayar', inc_total_paid: 'Cair', inc_ytd: 'Total Insentif', inc_net_sales: 'Net Sales', inc_amount: 'Insentif Sales', inc_ops_cost: 'Biaya Operasional Proyek', inc_ops_editable: 'Bisa diedit', inc_status_estimated: 'Estimasi', inc_status_ready: 'Siap Bayar', inc_status_paid: 'Cair', inc_view_detail: 'Detail', inc_close: 'Tutup', inc_status_legend: 'Status',
    valuation_title: 'Valuation Tracker & Corporate Metrics', valuation_subtitle: 'Simulasi valuasi perusahaan untuk kebutuhan pendanaan investor asing', current_valuation: 'Estimasi Valuasi', projected_revenue: 'Proyeksi Pendapatan', pipeline_multiplier: 'Multiplier Sektor', ipo_readiness: 'IPO Readiness',
    yoy_title: 'Performa YoY', yoy_subtitle: 'Perbandingan pertumbuhan', project_count: 'Deal', welcome: 'Selamat Datang', view_only_notice: 'Mode Baca Saja', add_new_sph: 'Tambah SPH Baru', edit_sph: 'Edit SPH', cancel: 'Batal', save: 'Simpan', confirm_delete: 'Hapus SPH ini?', of_total: 'dari total', revenue_period: 'Periode Berjalan', monthly_pipeline: 'Tren Bulanan', project_type_mix: 'Komposisi Jenis Proyek', modality_mix: 'Modalitas Radiologi', customer_type_dist: 'Tipe Pelanggan', funnel_title: 'Funnel Proyek', funnel_subtitle: 'Tahapan SPH', sales_performance: 'Performa Tim Sales', contribution: 'Kontribusi', bp_title: 'Daftar Principal Alat', bp_subtitle: 'Mitra Manufaktur Global HNTI', bp_products: 'Alat Kesehatan', type_hospital: 'Rumah Sakit', type_clinic: 'Klinik', type_subdistributor: 'Sub-Distributor', type_partner: 'Rekanan', ptype_private: 'Swasta', ptype_government: 'Pemerintah', ptype_tender: 'Tender BUMN', ptype_kso: 'KSO Skema Kerja Sama',
    sr_dashboard: 'Dasbor Lapangan', sr_new: 'Buat Laporan', sr_history: 'Riwayat', sr_visits_count: 'Kunjungan RS', sr_field_days_total: 'Hari Lapangan', sr_total_reports: 'Total Laporan', sr_total_cost: 'Biaya Mingguan', sr_no_reports: 'Belum ada laporan lapangan', sr_report_date: 'Tanggal', sr_week: 'Minggu Ke', sr_field_days: 'Hari', sr_nights: 'Menginap', sr_focus_area: 'Wilayah Fokus', sr_visits: 'Daftar RS Dikunjungi', sr_pipe_summary: 'Ringkaran Pipeline', sr_pipe_count: 'Jumlah RS', sr_pipe_val: 'Estimasi Nilai', sr_closest: 'RS Terdekat Closing', sr_cost: 'Biaya Operasional (Rp)', sr_reflection: 'Catatan Refleksi', sr_win: 'Pencapaian', sr_block: 'Hambatan Lapangan', sr_next: 'Rencana Minggu Depan', sr_fatigue: 'Tingkat Kelelahan', sr_submit: 'Kirim Laporan', sr_add_visit: 'Tambah RS', sr_confirm_delete: 'Hapus laporan?', sr_updated_success: 'Laporan berhasil diperbarui'
  },
  en: {
    system_name: 'IMS HNTI', system_full: 'Integrated Monitoring System',
    company: 'PT Harmoni Nasional Teknologi Indonesia', motto: 'Transparent · Accountable · Real-time',
    login_title: 'Sign In to System', login_subtitle: 'Restricted access for authorized personnel only',
    username: 'Username', password: 'Password', login_btn: 'Sign In',
    demo_credentials: 'Demo Credentials', login_error: 'Invalid credentials',
    logout: 'Sign Out', welcome: 'Welcome', role_super_admin: 'Super Admin (CEO)',
    nav_dashboard: 'Dashboard', nav_sph: 'Quotation Mgmt', nav_pipeline: 'Pipeline', nav_sales: 'Sales Team', nav_sales_report: 'Field Reports', nav_finance: 'Finance', nav_operations: 'Operations', nav_installation: 'Installation', nav_maintenance: 'Maintenance', nav_regulatory: 'Regulatory', nav_valuation: 'Valuation', nav_incentive: 'Incentive',
    pipeline_value: 'Pipeline Value', weighted_pipeline: 'Weighted Pipeline', revenue_ytd: 'Revenue YTD', win_rate: 'Win Rate', active_projects: 'Active Projects', total_value: 'Total', status_active: 'Active', status_won: 'Won', status_lost: 'Lost', no_data: 'No data found',
    sph_title: 'Quotation Management (SPH)', sph_subtitle: 'Management of issued price quotations', new_sph: 'New Quote', search_placeholder: 'Search customer, quote or modality...', sph_number: 'Quote No.', customer: 'Customer', project_type: 'Project Type', modality: 'Modality', quantity: 'Qty', value: 'Value', status: 'Status', sales_owner: 'Sales', actions: 'Actions',
    pipeline_title: 'Project & Tender Pipeline', pipeline_subtitle: 'Follow-up status and conversion probabilities', stage_sph_sent: 'SPH Sent', stage_presentation_scheduled: 'Presentation Scheduled', stage_presentation_done: 'Presentation Done', stage_negotiation: 'Negotiation', stage_tender: 'Tender Process', stage_po_issued: 'PO Issued', stage_lost: 'Lost', stage_ecatalog: 'E-Catalog Waiting', next_action: 'Next Action', Next: 'Priorities', notes: 'Notes', probability: 'Probability',
    finance_title: 'Finance & Account Receivable', finance_subtitle: 'Invoice monitoring and outstanding collections', po_value: 'PO Value', cash_collected: 'Cash Collected YTD', ar_outstanding: 'AR Outstanding', ap_outstanding: 'AP Supplier', dp_paid: 'DP Paid', final_paid: 'Final Paid', awaiting_payment: 'Awaiting',
    operations_title: 'Logistics & Operations', operations_subtitle: 'Manufacturing tracking, shipping manifests, and customs clearance', ops_total_manifests: 'Total Manifests', ops_in_transit: 'In Transit', ops_arrived_count: 'Arrived', ops_pending_docs: 'Pending Docs', plan_order_to_factory: 'Plan Order', ready_to_ship: 'Ready to Ship', on_shipment: 'On Shipment', delivery_to_site: 'Delivered', customs_status: 'Customs Status', customs_released: 'Released', customs_ongoing: 'Processing', customs_hold: 'On Hold',
    installation_title: 'Installation & Training Management', installation_subtitle: 'Site readiness, equipment function tests, and BAPETEN safety licensing', inst_total_records: 'Total Installations', inst_in_progress: 'In Progress', inst_completed_count: 'Completed', inst_bast_signed: 'BAST Signed', inst_training_done: 'Training Completed', installation_done: 'Installation Done', function_test: 'Function Test', exposure_test: 'Radiation Test', training_cert: 'Training Cert', bapeten_permit: 'BAPETEN License',
    mt_title: 'Preventive Maintenance System', mt_subtitle: 'Servicing schedules and hospital customer complaints tracking', mt_total_units: 'Installed Units', mt_units_warranty: 'Under Warranty', mt_pm_this_month: 'PM This Month', mt_open_issues: 'Open Complaints', mt_mark_done: 'Mark Completed', mt_pm_status_scheduled: 'Scheduled', mt_pm_status_done: 'Completed', mt_pm_status_overdue: 'Overdue',
    reg_title: 'Regulatory Affairs & Licensing', reg_subtitle: 'Kemenkes distribution licenses (AKL) and import approvals', imp_total_active: 'Active Permits', imp_total_issued: 'Permits Issued', akl_total_active: 'Active AKL', akl_total_issued: 'AKL Issued', akl_avg_duration: 'Avg Days',
    inc_title: 'Sales Incentive Dashboard', inc_subtitle: 'Sales performance commission tracking set at 1.5% of Net Sales', inc_total_estimated: 'Estimated', inc_total_ready: 'Ready to Pay', inc_total_paid: 'Paid Out', inc_ytd: 'Total Incentive', inc_net_sales: 'Net Sales', inc_amount: 'Incentive', inc_ops_cost: 'Project Ops Cost', inc_ops_editable: 'Editable', inc_status_estimated: 'Estimated', inc_status_ready: 'Ready', inc_status_paid: 'Paid', inc_view_detail: 'Details', inc_close: 'Close', inc_status_legend: 'Status',
    valuation_title: 'Valuation Tracker & Corporate Metrics', valuation_subtitle: 'Corporate valuation modeling for venture funding and foreign investors', current_valuation: 'Estimated Valuation', projected_revenue: 'Projected Revenue', pipeline_multiplier: 'Sector Multiplier', ipo_readiness: 'IPO Readiness',
    yoy_title: 'YoY Growth', yoy_subtitle: 'Annualized growth performance', project_count: 'Deals', welcome: 'Welcome', view_only_notice: 'Read-only Mode', add_new_sph: 'Add New SPH', edit_sph: 'Edit SPH', cancel: 'Cancel', save: 'Save', confirm_delete: 'Delete SPH?', of_total: 'of total', revenue_period: 'Current Period', monthly_pipeline: 'Monthly Trend', project_type_mix: 'Project Type Mix', modality_mix: 'Modality Mix', customer_type_dist: 'Customer Segments', funnel_title: 'Funnel Status', funnel_subtitle: 'SPH Funnel', sales_performance: 'Sales Performance', contribution: 'Contribution', bp_title: 'Global Principal Partners', bp_subtitle: 'HNTI Manufacturing Partners', bp_products: 'Medical Devices', type_hospital: 'Hospital', type_clinic: 'Clinic', type_subdistributor: 'Sub-Distributor', type_partner: 'Partner', ptype_private: 'Private', ptype_government: 'Government', ptype_tender: 'SOE Tender', ptype_kso: 'KSO Joint Scheme',
    sr_dashboard: 'Field Dashboard', sr_new: 'New Report', sr_history: 'History Logs', sr_visits_count: 'Hospital Visits', sr_field_days_total: 'Field Days', sr_total_reports: 'Total Reports', sr_total_cost: 'Weekly Costs', sr_no_reports: 'No reports filed', sr_report_date: 'Date', sr_week: 'Week', sr_field_days: 'Days', sr_nights: 'Stays', sr_focus_area: 'Focus Territory', sr_visits: 'Visited Accounts', sr_pipe_summary: 'Pipeline Summary', sr_pipe_count: 'Account Count', sr_pipe_val: 'Est. Value', sr_closest: 'Closest to Closing', sr_cost: 'Cost Amount (IDR)', sr_reflection: 'Weekly Reflection', sr_win: 'Achievements', sr_block: 'Blockers/Issues', sr_next: 'Next Week Plans', sr_fatigue: 'Fatigue Scale', sr_submit: 'Submit Log', sr_add_visit: 'Add Account', sr_confirm_delete: 'Delete report entry?', sr_updated_success: 'Report updated'
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
  'ceo': { password: 'hnti2026', role: 'super_admin', name: 'Fajrin', initial: 'F' },
  'admin': { password: 'hnti2026', role: 'admin', name: 'Siti Rahayu', initial: 'SR' },
  'teknisi': { password: 'hnti2026', role: 'technician', name: 'Budi Hartono', initial: 'BH' },
  'ops': { password: 'hnti2026', role: 'operations', name: 'Andi Pratama', initial: 'AP' },
  'finance': { password: 'hnti2026', role: 'finance', name: 'Maya Sari', initial: 'MS' },
  'regulatory': { password: 'hnti2026', role: 'regulatory', name: 'Rini Wahyuni', initial: 'RW' },
};

const PERMISSIONS = {
  super_admin: { dashboard: 'full', sph: 'full', pipeline: 'full', sales: 'full', sales_report: 'full', finance: 'full', operations: 'full', installation: 'full', maintenance: 'full', regulatory: 'full', valuation: 'full', incentive: 'full' },
  admin:       { dashboard: 'read', sph: 'full', pipeline: 'write', sales: 'read', sales_report: 'read', finance: 'read', operations: 'read', installation: 'write', maintenance: 'read', regulatory: 'read', valuation: 'none', incentive: 'none' },
};

const NAV_BY_ROLE = {
  super_admin: ['dashboard', 'sph', 'pipeline', 'sales', 'incentive', 'finance', 'operations', 'installation', 'maintenance', 'regulatory', 'valuation'],
  admin:       ['dashboard', 'sph', 'pipeline', 'sales', 'installation', 'maintenance', 'regulatory'],
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
  const customers = ['RS Premier Bintaro', 'RS Telogorejo', 'RS Hermina Yogyakarta', 'RS Siloam Surabaya', 'RS Mitra Keluarga', 'RSUD Banyumas', 'RSUD Dr. Soetomo', 'RS Pelni'];

  for (let i = 0; i < 80; i++) {
    const cust = customers[i % customers.length] + ' ' + (Math.floor(i / customers.length) + 1);
    const r = rand();
    const ptype = r < 0.50 ? 'private' : r < 0.80 ? 'government' : r < 0.90 ? 'tender' : 'kso';
    const prod = PRODUCT_CATALOG[Math.floor(rand() * PRODUCT_CATALOG.length)];
    const qty = rand() < 0.85 ? 1 : 2;
    const isPO = i < 22;
    const stage = isPO ? 'po_issued' : (r < 0.3 ? 'sph_sent' : r < 0.6 ? 'presentation_done' : 'negotiation');
    
    sphList.push({
      id: `sph_${i}`, sphNo: `SPH/2026/P${String(i+1).padStart(2, '0')}`,
      customer: cust, customerType: 'hospital', projectType: ptype, modality: prod.mod, subModality: prod.sub, qty, unitPrice: prod.price, totalValue: qty * prod.price,
      issuedDate: `2026-03-${String((i%25)+1).padStart(2, '0')}`, salesOwner: SALES_TEAM[i % 5].id, status: isPO ? 'won' : 'active', stage, probability: isPO ? 100 : 50, poStatus: isPO ? 'issued' : null, dpPaid: isPO && i % 2 === 0, finalPaid: isPO && i % 3 === 0, shippingStatus: isPO ? 'delivered' : null, customsStatus: isPO ? 'released' : null, installationStatus: isPO ? 'installed' : null
    });
  }
  return sphList;
}

const ALL_SPH = generateBulkSPH();

const storeGet = async (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const storeSet = async (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const storeDel = async (k) => { try { localStorage.removeItem(k); } catch {} };

const formatCurrency = (n, lang) => {
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(2)}M`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(1)}Jt`;
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
    .btn-primary { background: #1a2942; color: #f8f5ef; border: none; padding: 10px 20px; font-weight: 500; cursor: pointer; }
    .btn-ghost { background: transparent; color: #1a2942; border: 1px solid #d4cdb8; padding: 8px 16px; cursor: pointer; }
    input, select, textarea { padding: 9px 12px; border: 1px solid #d4cdb8; background: #fefcf7; color: #1a2942; outline: none; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(26, 41, 66, 0.5); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(2px); }
    .modal-content { background: #f8f5ef; max-width: 600px; width: 100%; padding: 30px; border: 1px solid #d4cdb8; }
  `}</style>
);

export default function App() {
  const [lang, setLang] = useState('id');
  const [session, setSession] = useState(null);
  const [data, setData] = useState(ALL_SPH);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sData = await storeGet('ims_data'); if (sData) try { setData(JSON.parse(sData)); } catch {}
      const sSess = await storeGet('ims_session'); if (sSess) try { setSession(JSON.parse(sSess)); } catch {}
      setLoading(false);
    })();
  }, []);

  useEffect(() => { if (!loading) storeSet('ims_data', JSON.stringify(data)); }, [data, loading]);
  useEffect(() => { if (!loading) { session ? storeSet('ims_session', JSON.stringify(session)) : storeDel('ims_session'); } }, [session, loading]);

  const t = translations[lang];
  const fmt = (n) => formatCurrency(n, lang);

  if (loading) return <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><GlobalStyles /><h3>Loading System...</h3></div>;
  if (!session) return <LoginScreen t={t} onLogin={setSession} />;
  return <AuthApp session={session} setSession={setSession} lang={lang} setLang={setLang} t={t} data={data} setData={setData} fmt={fmt} />;
}

function LoginScreen({ t, onLogin }) {
  const [username, setUsername] = useState('ceo');
  const [password, setPassword] = useState('hnti2026');
  return (
    <div style={{minHeight: '100vh', display: 'flex', background: '#f8f5ef'}}>
      <GlobalStyles />
      <div style={{flex: 1, background: '#1a2942', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#f8f5ef'}}>
        <IMSLogo size="xl" inverted />
        <div>
          <h1 className="serif" style={{fontSize: '40px', margin: 0}}>{translations.id.company}</h1>
          <p style={{color: '#c8a96a', letterSpacing: '2px'}}>{translations.id.motto}</p>
        </div>
      </div>
      <div style={{flex: '0 0 450px', padding: '5px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#fefcf7', borderLeft: '1px solid #d4cdb8'}}>
        <h2>{t.login_title}</h2>
        <p style={{fontSize: '12px', color: '#8a7d5c'}}>{t.login_subtitle}</p>
        <div style={{marginTop: '20px'}}>
          <label style={{fontSize: '11px', fontWeight: 600}}>{t.username}</label>
          <input value={username} onChange={e => setUsername(e.target.value)} style={{marginTop: '5px', marginBottom: '15px'}} />
          <label style={{fontSize: '11px', fontWeight: 600}}>{t.password}</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{marginTop: '5px', marginBottom: '25px'}} />
          <button className="btn-primary" style={{width: '100%', padding: '12px'}} onClick={() => {
            const u = username.toLowerCase().trim();
            if (USERS[u] && USERS[u].password === password) onLogin({ ...USERS[u], username: u });
          }}>{t.login_btn}</button>
        </div>
      </div>
    </div>
  );
}

function AuthApp({ session, setSession, t, data, setData, fmt }) {
  const [view, setView] = useState('dashboard');
  const allowedNav = NAV_BY_ROLE[session.role];
  const filteredData = useMemo(() => data, [data]);

  return (
    <div>
      <Header session={session} setSession={setSession} view={view} setView={setView} allowedNav={allowedNav} t={t} />
      <main style={{padding: '40px', maxWidth: '1440px', margin: '0 auto'}}>
        {view === 'dashboard' && <Dashboard data={filteredData} t={t} fmt={fmt} />}
        {view === 'sph' && <SPHManagement data={filteredData} t={t} fmt={fmt} />}
        {view === 'pipeline' && <PipelineBoard data={filteredData} t={t} fmt={fmt} />}
        {view === 'finance' && <FinanceModule data={data} setData={setData} t={t} fmt={fmt} />}
        {view === 'incentive' && <IncentiveModule data={data} setData={setData} t={t} fmt={fmt} />}
        {view === 'valuation' && <Valuation data={data} t={t} fmt={fmt} />}
      </main>
    </div>
  );
}

function Header({ setSession, view, setView, allowedNav, t }) {
  return (
    <div style={{background: '#1a2942', color: '#fff', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <IMSLogo size="md" inverted />
      <div style={{display: 'flex', gap: '8px'}}>
        {allowedNav.map(n => (
          <button key={n} onClick={() => setView(n)} style={{background: view === n ? '#c8a96a' : 'transparent', color: view === n ? '#1a2942' : '#fff', border: 'none', padding: '8px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: 600}}>{t[`nav_${n}`]}</button>
        ))}
        <button onClick={() => setSession(null)} style={{background: '#c03030', color: '#fff', border: 'none', padding: '8px 14px', cursor: 'pointer', fontSize: '12px'}}>Logout</button>
      </div>
    </div>
  );
}

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
        <div className="card"><div style={{fontSize: '11px', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.pipeline_value}</div><h2 className="serif" style={{margin: '10px 0 0'}}>{fmt(totalPipeline)}</h2></div>
        <div className="card"><div style={{fontSize: '11px', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.weighted_pipeline}</div><h2 className="serif" style={{margin: '10px 0 0'}}>{fmt(weightedPipeline)}</h2></div>
        <div className="card"><div style={{fontSize: '11px', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.revenue_ytd}</div><h2 className="serif" style={{margin: '10px 0 0', color: '#3a6b3a'}}>{fmt(revenueYTD)}</h2></div>
        <div className="card"><div style={{fontSize: '11px', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.win_rate}</div><h2 className="serif" style={{margin: '10px 0 0'}}>{winRate.toFixed(0)}%</h2></div>
      </div>
      <div className="card">
        <h3 className="serif">{t.monthly_pipeline}</h3>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={monthlyTrend}>
            <defs>
              <linearGradient id="pColor" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1a4d8a" stopOpacity={0.3}/><stop offset="95%" stopColor="#1a4d8a" stopOpacity={0.0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e1cc" />
            <XAxis dataKey="month" stroke="#8a7d5c" />
            <YAxis stroke="#8a7d5c" />
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
      <h3 className="serif" style={{marginBottom: '20px'}}>{t.sph_title}</h3>
      <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '13px'}}>
        <thead>
          <tr style={{background: '#f0ebe0', textAlign: 'left', borderBottom: '2px solid #d4cdb8'}}>
            <th style={{padding: '12px'}}>{t.sph_number}</th><th style={{padding: '12px'}}>{t.customer}</th><th style={{padding: '12px'}}>{t.modality}</th><th style={{padding: '12px', textAlign: 'right'}}>{t.value}</th><th style={{padding: '12px'}}>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map(s => (
            <tr key={s.id} className="hover-row" style={{borderBottom: '1px solid #e8e1cc'}}>
              <td style={{padding: '12px'}} className="mono">{s.sphNo}</td><td style={{padding: '12px', fontWeight: 600}}>{s.customer}</td><td style={{padding: '12px'}}>{s.subModality}</td><td style={{padding: '12px', textAlign: 'right'}} className="mono">{fmt(s.totalValue)}</td><td style={{padding: '12px'}}><span style={{color: s.status === 'won' ? '#3a6b3a' : '#1a2942', fontWeight: 600}}>{t[`status_${s.status}`]}</span></td>
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
      <h3 className="serif" style={{marginBottom: '20px'}}>{t.pipeline_title}</h3>
      <div style={{display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '15px'}}>
        {STAGES.map(st => {
          const list = data.filter(d => d.stage === st.id);
          return (
            <div key={st.id} style={{flex: '0 0 280px', background: '#fefcf7', border: '1px solid #e8e1cc', padding: '15px'}}>
              <h4 style={{borderBottom: `3px solid ${st.color}`, paddingBottom: '8px', marginTop: 0}}>{t[`stage_${st.id}`]} ({list.length})</h4>
              <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px'}}>
                {list.slice(0, 6).map(p => (
                  <div key={p.id} style={{padding: '12px', background: '#fff', border: '1px solid #d4cdb8'}}>
                    <div style={{fontWeight: 600, fontSize: '12.5px', marginBottom: '4px'}}>{p.customer}</div>
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
      <h3 className="serif" style={{marginBottom: '20px'}}>{t.finance_title}</h3>
      <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '13px'}}>
        <thead>
          <tr style={{background: '#f0ebe0', textAlign: 'left', borderBottom: '2px solid #d4cdb8'}}>
            <th style={{padding: '12px'}}>{t.customer}</th><th style={{padding: '12px', textAlign: 'right'}}>{t.value}</th><th style={{padding: '12px', textAlign: 'center'}}>{t.dp_paid} (30%)</th><th style={{padding: '12px', textAlign: 'center'}}>{t.final_paid} (70%)</th>
          </tr>
        </thead>
        <tbody>
          {poProjects.map(p => (
            <tr key={p.id} className="hover-row" style={{borderBottom: '1px solid #e8e1cc'}}>
              <td style={{padding: '12px'}}>{p.customer} <br/><span style={{fontSize: '11px', color: '#8a7d5c'}}>{p.subModality}</span></td>
              <td style={{padding: '12px', textAlign: 'right'}} className="mono">{fmt(p.totalValue)}</td>
              <td style={{padding: '12px', textAlign: 'center'}}>
                <input type="checkbox" checked={p.dpPaid} onChange={() => setData(prev => prev.map(s => s.id === p.id ? {...s, dpPaid: !s.dpPaid} : s))} />
              </td>
              <td style={{padding: '12px', textAlign: 'center'}}>
                <input type="checkbox" checked={p.finalPaid} onChange={() => setData(prev => prev.map(s => s.id === p.id ? {...s, finalPaid: !s.finalPaid} : s))} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IncentiveModule({ data, setData, t, fmt, fmtFull }) {
  const poDeals = data.filter(s => s.poStatus === 'issued');
  const [selectedDeal, setSelectedDeal] = useState(null);

  const dealsWithIncentive = poDeals.map(s => ({ ...s, _calc: calcIncentive(s), _stat: getIncentiveStatus(s) }));
  const ytdTotal = dealsWithIncentive.reduce((sum, d) => sum + d._calc.incentive, 0);

  return (
    <div className="card">
      <h3 className="serif">{t.inc_title} <span style={{color: '#3a6b3a', marginLeft: '10px'}}>YTD: {fmt(ytdTotal)}</span></h3>
      <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '13px'}}>
        <thead>
          <tr style={{background: '#f0ebe0', textAlign: 'left'}}>
            <th style={{padding: '12px'}}>{t.customer}</th><th style={{padding: '12px', textAlign: 'right'}}>{t.inc_net_sales}</th><th style={{padding: '12px', textAlign: 'right'}}>{t.inc_amount}</th><th style={{padding: '12px'}}>{t.inc_status_legend}</th><th style={{padding: '12px', textAlign: 'center'}}>{t.actions}</th>
          </tr>
        </thead>
        <tbody>
          {dealsWithIncentive.slice(0, 15).map(d => (
            <tr key={d.id} className="hover-row" style={{borderBottom: '1px solid #e8e1cc'}}>
              <td style={{padding: '12px', fontWeight: 500}}>{d.customer}</td>
              <td style={{padding: '12px', textAlign: 'right'}} className="mono">{fmt(d._calc.netSales)}</td>
              <td style={{padding: '12px', textAlign: 'right', color: '#3a6b3a', fontWeight: 'bold'}} className="mono">{fmt(d._calc.incentive)}</td>
              <td style={{padding: '12px'}}><span style={{color: d._stat.color, fontWeight: 600}}>{t[d._stat.label]}</span></td>
              <td style={{padding: '12px', textAlign: 'center'}}><button className="btn-ghost" style={{padding: '4px 10px', fontSize: '12px'}} onClick={() => setSelectedDeal(d)}>{t.inc_view_detail}</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedDeal && (
        <div className="modal-overlay" onClick={() => setSelectedDeal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="serif" style={{marginTop: 0}}>{selectedDeal.customer}</h3>
            <p style={{fontSize: '13px', color: '#8a7d5c'}}>{selectedDeal.subModality}</p>
            <div style={{margin: '20px 0', borderTop: '1px solid #d4cdb8', paddingTop: '15px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}><label>{t.inc_ops_cost} (%)</label>
                <input type="number" step="0.5" min="0" max="50" value={(selectedDeal.opsPercent !== undefined ? selectedDeal.opsPercent : 0.05) * 100} onChange={(e) => setData(prev => prev.map(s => s.id === selectedDeal.id ? { ...s, opsPercent: (parseFloat(e.target.value) || 0) / 100 } : s))} style={{width: '90px', padding: '5px', fontWeight: 600}} />
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}><span>{t.inc_net_sales}:</span><span className="mono">{fmtFull(calcIncentive(selectedDeal).netSales)}</span></div>
              <div style={{display: 'flex', justifyContent: 'space-between', background: '#1a2942', color: '#c8a96a', padding: '12px', marginTop: '15px'}}><span style={{fontWeight: 600}}>{t.inc_amount}:</span><span className="mono" style={{fontWeight: 700}}>{fmtFull(calcIncentive(selectedDeal).incentive)}</span></div>
            </div>
            <button className="btn-primary" style={{width: '100%'}} onClick={() => setSelectedDeal(null)}>{t.inc_close}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Valuation({ data, t, fmt }) {
  const wonData = data.filter(s => s.status === 'won');
  const revenueYTD = wonData.reduce((sum, s) => sum + s.totalValue, 0);
  const currentValuation = revenueYTD * 1.8;

  const valuationTrend = Array.from({length: 5}, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei'][i],
    valuation: currentValuation * (1 + i * 0.05)
  }));

  return (
    <div className="card">
      <h3 className="serif">{t.valuation_title}</h3>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', margin: '20px 0'}}>
        <div style={{background: '#fefcf7', border: '1px solid #e8e1cc', padding: '15px'}}><div>{t.current_valuation}</div><h2 className="serif" style={{color: '#c8a96a', margin: '5px 0 0'}}>{fmt(currentValuation)}</h2></div>
        <div style={{background: '#fefcf7', border: '1px solid #e8e1cc', padding: '15px'}}><div>{t.projected_revenue}</div><h2 className="serif" style={{margin: '5px 0 0'}}>{fmt(revenueYTD)}</h2></div>
        <div style={{background: '#fefcf7', border: '1px solid #e8e1cc', padding: '15px'}}><div>{t.ipo_readiness}</div><h2 className="serif" style={{color: '#3a6b3a', margin: '5px 0 0'}}>82%</h2></div>
      </div>
      <div style={{marginTop: '25px'}}>
        <h4 className="serif">{lang === 'id' ? 'Proyeksi Grafik Valuasi Korporat' : 'Corporate Valuation Trend'}</h4>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={valuationTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<ChartTooltip fmt={fmt} />} />
            <Area type="monotone" dataKey="valuation" fill="#c8a96a" stroke="#c8a96a" stopOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

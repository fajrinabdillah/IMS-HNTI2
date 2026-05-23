import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, FileText, Briefcase, Plus, Search, Edit2, Trash2, X, ArrowUpRight, ArrowDownRight, Activity, DollarSign, Users, Clock, Globe, LogOut, Shield, Wrench, Truck, Wallet, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, FileCheck, Menu, ChevronDown, ClipboardList, Star, Settings, ShieldCheck, CalendarDays, AlertTriangle, FileSearch } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, ComposedChart } from 'recharts';

const DEFAULT_USD_IDR = 17500;

const translations = {
  id: {
    system_name: 'IMS HNTI', system_full: 'Integrated Monitoring System',
    company: 'PT Harmoni Nasional Teknologi Indonesia',
    motto: 'Transparent · Accountable · Real-time',
    login_title: 'Masuk ke Sistem', login_subtitle: 'Akses terbatas untuk personel berwenang',
    username: 'Nama Pengguna', password: 'Kata Sandi', login_btn: 'Masuk',
    demo_credentials: 'Kredensial Demo', login_error: 'Nama pengguna atau kata sandi salah',
    logout: 'Keluar', welcome: 'Selamat datang',
    role_super_admin: 'Super Admin (CEO)', role_admin: 'Admin', role_technician: 'Teknisi',
    role_operations: 'Operasional', role_finance: 'Finance', role_sales: 'Sales', role_regulatory: 'Regulatory',
    nav_dashboard: 'Dasbor', nav_sph: 'Manajemen SPH', nav_pipeline: 'Pipeline',
    nav_sales: 'Tim Sales', nav_sales_report: 'Laporan Lapangan', nav_finance: 'Finance',
    nav_operations: 'Operasional', nav_installation: 'Instalasi', nav_valuation: 'Valuasi',
    pipeline_value: 'Nilai Pipeline', weighted_pipeline: 'Pipeline Tertimbang',
    revenue_ytd: 'Pendapatan YTD', win_rate: 'Win Rate',
    active_projects: 'Proyek Aktif', avg_deal_size: 'Rata-rata Deal',
    days: 'hari',
    funnel_title: 'Funnel Pipeline', funnel_subtitle: 'Distribusi proyek per tahapan',
    modality_mix: 'Modalitas Radiologi', project_type_mix: 'Komposisi Jenis Proyek',
    monthly_pipeline: 'Tren Pipeline Bulanan', customer_type_dist: 'Tipe Pelanggan',
    sales_performance: 'Performa Tim Sales',
    sph_title: 'Manajemen Surat Penawaran Harga', sph_subtitle: 'Daftar SPH yang diterbitkan',
    new_sph: 'SPH Baru', search_placeholder: 'Cari SPH, pelanggan, atau modalitas...',
    sph_number: 'No. SPH', customer: 'Pelanggan', customer_type: 'Tipe',
    project_type: 'Jenis Proyek', modality: 'Modalitas', quantity: 'Qty', value: 'Nilai',
    issued_date: 'Tgl. Terbit', status: 'Status', sales_owner: 'Sales',
    actions: 'Aksi',
    pipeline_title: 'Pipeline Proyek & Tender',
    pipeline_subtitle: 'Tindak lanjut SPH',
    stage_sph_sent: 'SPH Awal', stage_presentation_scheduled: 'Jadwal Presentasi',
    stage_presentation_done: 'Presentasi Selesai', stage_negotiation: 'Negosiasi',
    stage_tender: 'Proses Tender', stage_po_issued: 'PO Terbit', stage_lost: 'Hilang',
    stage_ecatalog: 'Tunggu E-Catalog',
    tender_aanwijzing: 'Aanwijzing', tender_presentation: 'Presentasi Tender',
    tender_bid_opening: 'Pembukaan Penawaran', tender_announcement: 'Pengumuman',
    tender_objection: 'Masa Sanggah', tender_award: 'Penetapan Pemenang',
    probability: 'Probabilitas', next_action: 'Tindak Lanjut',
    add_new_sph: 'Tambah SPH Baru', edit_sph: 'Edit SPH', cancel: 'Batal', save: 'Simpan',
    delete: 'Hapus', confirm_delete: 'Yakin ingin menghapus?',
    type_hospital: 'Rumah Sakit', type_clinic: 'Klinik', type_subdistributor: 'Sub-Distributor', type_partner: 'Rekanan',
    ptype_private: 'Swasta', ptype_government: 'Pemerintah', ptype_tender: 'BUMN/Tender', ptype_kso: 'KSO',
    status_active: 'Aktif', status_won: 'Menang', status_lost: 'Kalah',
    notes: 'Catatan', no_data: 'Belum ada data', project_count: 'proyek', total_value: 'Total',
    finance_title: 'Finance & Account Receivable',
    finance_subtitle: 'Invoice, AR aging, pembayaran',
    operations_title: 'Operasional & Logistik',
    operations_subtitle: 'Plan order, shipping, customs',
    installation_title: 'Instalasi & BAPETEN',
    installation_subtitle: 'Jadwal instalasi, uji fungsi, dokumentasi',
    po_value: 'Nilai PO', ar_outstanding: 'AR Outstanding',
    ap_outstanding: 'AP Supplier', cash_collected: 'Cash Collected YTD',
    invoice_status: 'Status Invoice',
    dp_paid: 'DP Dibayar', final_paid: 'Pelunasan', awaiting_payment: 'Menunggu',
    customs_status: 'Customs',
    plan_order_to_factory: 'Plan Order', ready_to_ship: 'Siap Kirim',
    on_shipment: 'Pengiriman', customs_released: 'Released', customs_ongoing: 'Proses', customs_hold: 'On Hold',
    delivery_to_site: 'Diterima', installation_done: 'Instalasi Selesai',
    function_test: 'Uji Fungsi', exposure_test: 'Uji Paparan', training_cert: 'Sertifikat Training',
    bapeten_permit: 'Izin BAPETEN',
    view_only_notice: 'Mode baca-saja: Anda tidak dapat mengubah data ini',
    sales_title: 'Performa Tim Sales',
    sales_subtitle: 'KPI dan ranking 5 sales',
    territory: 'Wilayah', deals_won: 'Menang', deals_active: 'Aktif',
    contribution: 'Kontribusi',
    valuation_title: 'Valuation Tracker',
    valuation_subtitle: 'Estimasi valuasi & IPO readiness',
    current_valuation: 'Estimasi Valuasi',
    projected_revenue: 'Proyeksi Revenue',
    pipeline_multiplier: 'Pipeline Multiplier',
    ipo_readiness: 'IPO Readiness',
    exchange_rate: 'Kurs Tukar', update_rate: 'Perbarui',
    sr_title: 'Laporan Lapangan Mingguan',
    sr_subtitle: 'Diisi setiap Jumat sore',
    sr_new: 'Buat Laporan Baru', sr_history: 'Riwayat',
    sr_dashboard: 'Aktivitas Lapangan',
    sr_report_date: 'Tanggal', sr_week: 'Minggu',
    sr_field_days: 'Hari Lapangan', sr_nights: 'Malam Menginap',
    sr_focus_area: 'Area Fokus',
    sr_visits: 'Log Kunjungan RS',
    sr_pipe_summary: 'Update Pipeline',
    sr_pipe_count: 'Jumlah RS Pipeline',
    sr_pipe_val: 'Estimasi Nilai (Rp juta)',
    sr_closest: 'RS Paling Dekat Closing',
    sr_cost: 'Total Biaya Minggu Ini (Rp)',
    sr_reflection: 'Refleksi',
    sr_win: 'Win / Pencapaian',
    sr_block: 'Hambatan Terbesar',
    sr_next: 'Prioritas Minggu Depan',
    sr_fatigue: 'Tingkat Kelelahan',
    sr_submit: 'Kirim Laporan',
    sr_add_visit: '+ Tambah RS',
    sr_no_reports: 'Belum ada laporan',
    sr_visits_count: 'Kunjungan RS',
    sr_field_days_total: 'Hari Lapangan',
    sr_total_reports: 'Total Laporan',
    sr_total_cost: 'Total Biaya',
    nav_maintenance: 'Maintenance',
    mt_title: 'Preventive Maintenance System',
    mt_subtitle: 'Jadwal maintenance, perbaikan, dan keluhan pelanggan',
    mt_tab_schedule: 'Jadwal PM', mt_tab_repair: 'Perbaikan', mt_tab_complaint: 'Keluhan Pelanggan',
    mt_unit: 'Unit Alat', mt_customer: 'Pelanggan', mt_modality: 'Modalitas',
    mt_install_date: 'Tgl. Instalasi', mt_warranty_end: 'Akhir Garansi',
    mt_last_pm: 'PM Terakhir', mt_next_pm: 'PM Berikutnya',
    mt_status: 'Status', mt_pm_due: 'Jatuh Tempo', mt_pm_done: 'Selesai',
    mt_pm_upcoming: 'Akan Datang', mt_pm_overdue: 'Terlambat',
    mt_under_warranty: 'Dalam Garansi', mt_out_warranty: 'Garansi Habis',
    mt_technician: 'Teknisi', mt_actions: 'Aksi',
    mt_mark_done: 'Tandai Selesai',
    mt_repair_title: 'Daftar Perbaikan',
    mt_complaint_title: 'Keluhan Pelanggan',
    mt_issue: 'Masalah', mt_priority: 'Prioritas',
    mt_priority_low: 'Rendah', mt_priority_medium: 'Sedang', mt_priority_high: 'Tinggi', mt_priority_critical: 'Kritis',
    mt_status_open: 'Open', mt_status_progress: 'Dalam Proses', mt_status_resolved: 'Selesai',
    mt_reported_date: 'Tgl. Lapor', mt_total_units: 'Total Alat Terpasang',
    mt_units_warranty: 'Dalam Garansi', mt_pm_this_month: 'PM Bulan Ini',
    mt_open_issues: 'Issue Open',
    nav_regulatory: 'Regulatory',
    reg_title: 'Regulatory & Perizinan BAPETEN',
    reg_subtitle: 'Tracking perizinan dari pengumpulan dokumen hingga izin terbit',
    reg_stage_docs: 'Pengumpulan Dokumen',
    reg_stage_submit: 'Submit ke BAPETEN',
    reg_stage_eval: 'Evaluasi BAPETEN',
    reg_stage_pnbp: 'Penerbitan PNBP',
    reg_stage_issued: 'Izin Terbit',
    reg_progress: 'Progress', reg_eta: 'Estimasi Selesai',
    reg_doc_complete: 'Dokumen Lengkap',
    reg_doc_pending: 'Dokumen Kurang',
    reg_note: 'Keterangan',
    reg_total_pending: 'Izin Diproses', reg_total_issued: 'Izin Terbit', reg_avg_days: 'Rata-rata Hari',
    reg_doc_inventory: 'Inventarisasi Dokumen', reg_advance: 'Lanjutkan ke Tahap Berikutnya',
    reg_tab_bapeten: 'Izin Pemanfaatan BAPETEN',
    reg_tab_akl: 'Izin Edar Kemenkes (AKL)',
    reg_tab_bapeten_short: 'BAPETEN',
    reg_tab_akl_short: 'AKL Kemenkes',
    akl_title: 'Izin Edar Kemenkes (AKL)',
    akl_subtitle: 'Pendaftaran izin edar produk baru dan principal baru · max 30 hari kerja',
    akl_stage_preregist: 'Pra-Registrasi',
    akl_stage_docs: 'Pengumpulan Dokumen',
    akl_stage_submit: 'Submit ke Regalkes',
    akl_stage_pnbp: 'Penerbitan PNBP',
    akl_stage_eval: 'Evaluasi Tim Penilai',
    akl_stage_fix: 'Perbaikan / Tambahan Data',
    akl_stage_issued: 'Sertifikat AKL Terbit',
    akl_principal: 'Principal / Manufacturer',
    akl_product: 'Produk',
    akl_product_class: 'Kelas Risiko',
    akl_akl_no: 'No. AKL',
    akl_validity: 'Masa Berlaku',
    akl_validity_period: '5 Tahun',
    akl_days_elapsed: 'Hari Berjalan',
    akl_days_remaining: 'Sisa Hari Kerja',
    akl_max_duration: 'Durasi Max',
    akl_30_workdays: '30 Hari Kerja',
    akl_total_active: 'Pendaftaran Aktif',
    akl_total_issued: 'AKL Terbit',
    akl_avg_duration: 'Rata-rata Durasi',
    akl_register_date: 'Tgl. Pendaftaran',
    akl_target_date: 'Target Terbit',
    akl_pipeline_title: 'Pipeline Pendaftaran AKL',
    akl_records_title: 'Daftar Pendaftaran AKL',
    akl_class_a: 'Kelas A (Risiko Rendah)',
    akl_class_b: 'Kelas B (Risiko Rendah-Menengah)',
    akl_class_c: 'Kelas C (Risiko Menengah-Tinggi)',
    akl_class_d: 'Kelas D (Risiko Tinggi)',
    akl_advance: 'Lanjutkan ke Tahap Berikutnya',
    akl_note: 'Catatan',
    akl_within_target: 'Sesuai Target',
    akl_overdue: 'Melebihi Target',
    revenue_ytd_sub: 'Sudah terealisasi (deal menang)',
    weighted_pipeline_sub: 'Proyeksi: deal aktif × probabilitas',
    pipeline_value_sub: 'Total nilai semua deal aktif',
    win_rate_sub: 'Menang dari total deal closed',
    revenue_period: 'Jan–Mei 2026',
    yoy_title: 'Pertumbuhan Tahun ke Tahun', yoy_subtitle: 'Perbandingan SPH dan PO antar tahun',
    yoy_filter_year: 'Tahun', yoy_filter_all: 'Semua',
    yoy_growth: 'Growth',
    bp_title: 'Mitra Bisnis HNTI', bp_subtitle: 'Distributor & manufacturer partner',
    bp_country: 'Negara', bp_products: 'Produk',
    nav_incentive: 'Insentif Sales',
    inc_title: 'Insentif Penjualan',
    inc_subtitle: 'Reward 1.5% dari Net Sales · monitoring estimasi & realisasi',
    inc_my_incentive: 'Insentif Saya',
    inc_team_incentive: 'Insentif Tim',
    inc_total_estimated: 'Total Estimasi',
    inc_total_ready: 'Siap Dibayarkan',
    inc_total_paid: 'Sudah Cair',
    inc_ytd: 'Insentif YTD',
    inc_status_estimated: 'Estimasi',
    inc_status_ready: 'Siap Dibayar',
    inc_status_paid: 'Cair',
    inc_status_kso_special: 'KSO Skema Khusus',
    inc_status_kso_first: 'KSO Tahap 1 (50%)',
    inc_status_kso_prorata: 'KSO Tahap 2 Prorata',
    inc_deal: 'Deal',
    inc_breakdown: 'Rincian Perhitungan',
    inc_gross_price: 'Harga Jual (Include PPN)',
    inc_ppn: 'PPN 11%',
    inc_dpp: 'DPP (Dasar Pengenaan Pajak)',
    inc_pph23: 'PPh 23 (2.5% × DPP)',
    inc_ops_cost: 'Operasional Proyek',
    inc_ops_editable: '(default 5%, dapat diedit)',
    inc_net_sales: 'Net Sales',
    inc_rate: 'Tarif Insentif',
    inc_amount: 'Insentif',
    inc_payment_progress: 'Progress Pembayaran',
    inc_payment_term: 'Termin Pembayaran',
    inc_no_dp: 'Tanpa DP (Post-BAST)',
    inc_bast_pending: 'Menunggu BAST',
    inc_bast_done: 'BAST Selesai',
    inc_save_override: 'Simpan',
    inc_view_detail: 'Detail',
    inc_close: 'Tutup',
    inc_status_legend: 'Keterangan Status',
    inc_legend_est: '📊 Estimasi · PO terbit, menunggu pembayaran',
    inc_legend_ready: '⏳ Siap Dibayar · Pelunasan ≥50% (Swasta) atau BAST selesai (RSUD)',
    inc_legend_paid: '✅ Cair · Pelunasan 100% atau pembayaran RSUD diterima',
    inc_legend_kso: '🔄 KSO · 50% saat first revenue, 50% prorata 12 bulan',
    inc_first_revenue: 'First Revenue',
    inc_months_paid: 'Bulan Sudah Bayar',
    inc_total_months: 'Total Bulan',
    inc_leaderboard: 'Peringkat Insentif Sales',
    inc_office_label: '🎯 Tabungan Ekspansi HNTI',
    inc_office_note: 'Insentif dari akun Office disisihkan untuk dana ekspansi perusahaan (R&D manufaktur, investasi)',
    date: 'Date',
    priority: 'Priority',
    technician: 'Technician',
  },
  en: {
    system_name: 'IMS HNTI', system_full: 'Integrated Monitoring System',
    company: 'PT Harmoni Nasional Teknologi Indonesia',
    motto: 'Transparent · Accountable · Real-time',
    login_title: 'Sign In to System', login_subtitle: 'Restricted access for authorized personnel only',
    username: 'Username', password: 'Password', login_btn: 'Sign In',
    demo_credentials: 'Demo Credentials', login_error: 'Invalid username or password',
    logout: 'Sign Out', welcome: 'Welcome',
    role_super_admin: 'Super Admin (CEO)', role_admin: 'Admin', role_technician: 'Technician',
    role_operations: 'Operations', role_finance: 'Finance', role_sales: 'Sales', role_regulatory: 'Regulatory',
    nav_dashboard: 'Dashboard', nav_sph: 'Quotation Mgmt', nav_pipeline: 'Pipeline',
    nav_sales: 'Sales Team', nav_sales_report: 'Field Reports', nav_finance: 'Finance',
    nav_operations: 'Operations', nav_installation: 'Installation', nav_valuation: 'Valuation',
    pipeline_value: 'Pipeline Value', weighted_pipeline: 'Weighted Pipeline',
    revenue_ytd: 'Revenue YTD', win_rate: 'Win Rate',
    active_projects: 'Active Projects', avg_deal_size: 'Avg Deal Size',
    days: 'days',
    funnel_title: 'Pipeline Funnel', funnel_subtitle: 'Project distribution per stage',
    modality_mix: 'Radiology Modalities', project_type_mix: 'Project Type Composition',
    monthly_pipeline: 'Monthly Pipeline Trend', customer_type_dist: 'Customer Types',
    sales_performance: 'Sales Team Performance',
    sph_title: 'Quotation Management', sph_subtitle: 'Issued price quotations',
    new_sph: 'New Quotation', search_placeholder: 'Search quotation, customer, or modality...',
    sph_number: 'Quote No.', customer: 'Customer', customer_type: 'Type',
    project_type: 'Project Type', modality: 'Modality', quantity: 'Qty', value: 'Value',
    issued_date: 'Issue Date', status: 'Status', sales_owner: 'Sales',
    actions: 'Actions',
    pipeline_title: 'Project & Tender Pipeline', pipeline_subtitle: 'Follow-up from quotations',
    stage_sph_sent: 'New SPH', stage_presentation_scheduled: 'Presentation Scheduled',
    stage_presentation_done: 'Presentation Done', stage_negotiation: 'Negotiation',
    stage_tender: 'Tender Process', stage_po_issued: 'PO Issued', stage_lost: 'Lost',
    stage_ecatalog: 'Awaiting E-Catalog',
    tender_aanwijzing: 'Aanwijzing', tender_presentation: 'Tender Presentation',
    tender_bid_opening: 'Bid Opening', tender_announcement: 'Announcement',
    tender_objection: 'Objection Period', tender_award: 'Winner Determination',
    probability: 'Probability', next_action: 'Next Action',
    add_new_sph: 'Add New Quotation', edit_sph: 'Edit Quotation', cancel: 'Cancel', save: 'Save',
    delete: 'Delete', confirm_delete: 'Are you sure to delete?',
    type_hospital: 'Hospital', type_clinic: 'Clinic', type_subdistributor: 'Sub-Distributor', type_partner: 'Partner',
    ptype_private: 'Private', ptype_government: 'Government', ptype_tender: 'SOE/Tender', ptype_kso: 'KSO',
    status_active: 'Active', status_won: 'Won', status_lost: 'Lost',
    notes: 'Notes', no_data: 'No data yet', project_count: 'projects', total_value: 'Total',
    finance_title: 'Finance & Account Receivable',
    finance_subtitle: 'Invoice, AR aging, payments',
    operations_title: 'Operations & Logistics',
    operations_subtitle: 'Plan order, shipping, customs',
    installation_title: 'Installation & BAPETEN',
    installation_subtitle: 'Installation schedule, function tests, documentation',
    po_value: 'PO Value', ar_outstanding: 'AR Outstanding',
    ap_outstanding: 'AP to Suppliers', cash_collected: 'Cash Collected YTD',
    invoice_status: 'Invoice Status',
    dp_paid: 'DP Paid', final_paid: 'Final Payment', awaiting_payment: 'Awaiting',
    customs_status: 'Customs',
    plan_order_to_factory: 'Plan Order', ready_to_ship: 'Ready to Ship',
    on_shipment: 'On Shipment', customs_released: 'Released', customs_ongoing: 'Processing', customs_hold: 'On Hold',
    delivery_to_site: 'Delivered', installation_done: 'Installation Done',
    function_test: 'Function Test', exposure_test: 'Exposure Test', training_cert: 'Training Cert',
    bapeten_permit: 'BAPETEN Permit',
    view_only_notice: 'Read-only mode: you cannot modify this data',
    sales_title: 'Sales Team Performance',
    sales_subtitle: 'KPI and ranking of 5 sales',
    territory: 'Territory', deals_won: 'Won', deals_active: 'Active',
    contribution: 'Contribution',
    valuation_title: 'Valuation Tracker',
    valuation_subtitle: 'Valuation estimate & IPO readiness',
    current_valuation: 'Current Valuation',
    projected_revenue: 'Projected Revenue',
    pipeline_multiplier: 'Pipeline Multiplier',
    ipo_readiness: 'IPO Readiness',
    exchange_rate: 'Exchange Rate', update_rate: 'Update',
    sr_title: 'Weekly Field Report',
    sr_subtitle: 'Filled every Friday afternoon',
    sr_new: 'New Report', sr_history: 'History',
    sr_dashboard: 'Field Activity',
    sr_report_date: 'Date', sr_week: 'Week',
    sr_field_days: 'Field Days', sr_nights: 'Overnight Stays',
    sr_focus_area: 'Focus Area',
    sr_visits: 'Hospital Visit Log',
    sr_pipe_summary: 'Pipeline Update',
    sr_pipe_count: 'Active Pipeline RS',
    sr_pipe_val: 'Est. Value (M IDR)',
    sr_closest: 'Closest to Closing',
    sr_cost: 'Total Cost This Week (Rp)',
    sr_reflection: 'Reflection',
    sr_win: 'Win / Achievement',
    sr_block: 'Biggest Blocker',
    sr_next: 'Next Week Priorities',
    sr_fatigue: 'Fatigue Level',
    sr_submit: 'Submit Report',
    sr_add_visit: '+ Add Hospital',
    sr_no_reports: 'No reports yet',
    sr_visits_count: 'Hospital Visits',
    sr_field_days_total: 'Field Days',
    sr_total_reports: 'Total Reports',
    sr_total_cost: 'Total Cost',
    date: 'Date',
    priority: 'Priority',
    technician: 'Technician',
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
  'lukman': { password: 'hnti2026', role: 'sales', name: 'Lukman', initial: 'LK', salesId: 'lukman' },
  'hatim': { password: 'hnti2026', role: 'sales', name: 'Hatim', initial: 'HT', salesId: 'hatim' },
  'dwi': { password: 'hnti2026', role: 'sales', name: 'Dwi Wahyudianto', initial: 'DW', salesId: 'dwi' },
  'tri': { password: 'hnti2026', role: 'sales', name: 'Tri Sutjahjono', initial: 'TS', salesId: 'tri' },
  'bagus': { password: 'hnti2026', role: 'sales', name: 'Bagus Iswahyudi', initial: 'BI', salesId: 'bagus' },
  'office': { password: 'hnti2026', role: 'sales', name: 'HNT Indonesia (Office)', initial: 'HO', salesId: 'office', isOffice: true },
};

const PERMISSIONS = {
  super_admin: { dashboard: 'full', sph: 'full', pipeline: 'full', sales: 'full', sales_report: 'full', finance: 'full', operations: 'full', installation: 'full', maintenance: 'full', regulatory: 'full', valuation: 'full', incentive: 'full' },
  admin:       { dashboard: 'read', sph: 'full', pipeline: 'write', sales: 'read', sales_report: 'read', finance: 'read', operations: 'read', installation: 'write', maintenance: 'read', regulatory: 'read', valuation: 'none', incentive: 'none' },
  technician:  { dashboard: 'read', sph: 'read', pipeline: 'read', sales: 'none', sales_report: 'none', finance: 'none', operations: 'read', installation: 'full', maintenance: 'full', regulatory: 'read', valuation: 'none', incentive: 'none' },
  operations:  { dashboard: 'read', sph: 'read', pipeline: 'read', sales: 'none', sales_report: 'none', finance: 'read', operations: 'full', installation: 'read', maintenance: 'read', regulatory: 'none', valuation: 'none', incentive: 'none' },
  finance:     { dashboard: 'read', sph: 'read', pipeline: 'read', sales: 'read', sales_report: 'read', finance: 'full', operations: 'read', installation: 'read', maintenance: 'none', regulatory: 'none', valuation: 'none', incentive: 'full' },
  regulatory:  { dashboard: 'read', sph: 'read', pipeline: 'read', sales: 'none', sales_report: 'none', finance: 'none', operations: 'read', installation: 'read', maintenance: 'read', regulatory: 'full', valuation: 'none', incentive: 'none' },
  sales:       { dashboard: 'read', sph: 'write', pipeline: 'write', sales: 'read', sales_report: 'full', finance: 'none', operations: 'none', installation: 'none', maintenance: 'none', regulatory: 'none', valuation: 'none', incentive: 'self' },
};

const NAV_BY_ROLE = {
  super_admin: ['dashboard', 'sph', 'pipeline', 'sales', 'incentive', 'sales_report', 'finance', 'operations', 'installation', 'maintenance', 'regulatory', 'valuation'],
  admin:       ['dashboard', 'sph', 'pipeline', 'sales', 'sales_report', 'installation', 'maintenance', 'regulatory'],
  technician:  ['dashboard', 'pipeline', 'installation', 'maintenance'],
  operations:  ['dashboard', 'pipeline', 'operations', 'maintenance'],
  finance:     ['dashboard', 'pipeline', 'sales_report', 'incentive', 'finance'],
  regulatory:  ['dashboard', 'pipeline', 'installation', 'regulatory'],
  sales:       ['sales_report', 'sph', 'pipeline', 'incentive', 'dashboard'],
};

const mk = (id, no, customer, ct, pt, mod, sub, qty, price, owner, region, stage, opts = {}) => {
  const baseProbs = { sph_sent: 20, presentation_scheduled: 35, presentation_done: 50, ecatalog: 40, negotiation: 70, tender: 55, po_issued: 100, lost: 0 };
  return {
    id, sphNo: no, customer, customerType: ct, projectType: pt, modality: mod, subModality: sub,
    qty, unitPrice: price, totalValue: qty * price,
    issuedDate: opts.date || '2026-03-15',
    salesOwner: owner, region, status: opts.status || 'active', stage,
    tenderSubStage: opts.tenderSubStage || null,
    probability: opts.probability !== undefined ? opts.probability : baseProbs[stage],
    notes: opts.notes || '', nextAction: opts.nextAction || '-',
    lastUpdate: '2026-05-12',
    poStatus: stage === 'po_issued' ? 'issued' : null,
    dpPaid: !!opts.dpPaid, finalPaid: !!opts.finalPaid,
    shippingStatus: opts.shippingStatus || null,
    customsStatus: opts.customsStatus || null,
  };
};

const SEED_SPH = [
  mk('p1','SPH/2026/P01','RS Premier Bintaro','hospital','private','MRI','MRI 3.0T',1,22000000000,'dwi','Jabodetabek','presentation_done',{notes:'Premium customer'}),
  mk('p2','SPH/2026/P02','RS Telogorejo Semarang','hospital','private','C-Arm','C-Arm Surgical',1,2300000000,'hatim','Jateng A','negotiation'),
  mk('p3','SPH/2026/P03','RS Hermina Yogyakarta','hospital','private','CT Scan','CT 128 Slice',1,8400000000,'lukman','DIY','sph_sent'),
  mk('p4','SPH/2026/P04','RS Siloam Surabaya','hospital','private','MRI','MRI 1.5T',1,14200000000,'bagus','Jatim 2','negotiation',{probability:75}),
  mk('p5','SPH/2026/P05','RS Mitra Keluarga Bekasi','hospital','private','CT Scan','CT 64 Slice',1,6200000000,'dwi','Jabodetabek','sph_sent'),
  mk('p6','SPH/2026/P06','RS Pondok Indah','hospital','private','Mammography','Mammo Tomosynthesis',1,5400000000,'dwi','Jabodetabek','presentation_scheduled'),
  mk('p7','SPH/2026/P07','RS Haji Surabaya','hospital','private','C-Arm','C-Arm Surgical',1,2400000000,'bagus','Jatim 2','sph_sent'),
  mk('p8','SPH/2026/P08','RS Brawijaya Saharjo','hospital','private','X-Ray','X-Ray Digital DR',1,1850000000,'dwi','Jabodetabek','presentation_done'),
  mk('p9','SPH/2026/P09','RS Adi Husada Malang','hospital','private','CT Scan','CT 32 Slice',1,4800000000,'tri','Jatim 1','presentation_scheduled'),
  mk('p10','SPH/2026/P10','RS Bunda Jakarta','hospital','private','MRI','MRI 1.5T',1,13800000000,'dwi','Jabodetabek','sph_sent'),
  mk('p11','SPH/2026/P11','RS Awal Bros Pekanbaru','hospital','private','CT Scan','CT 128 Slice',1,8500000000,'dwi','Jabodetabek','sph_sent'),
  mk('p12','SPH/2026/P12','RS Panti Rapih Yogyakarta','hospital','private','C-Arm','C-Arm Surgical',1,2350000000,'lukman','DIY','presentation_done'),
  mk('p13','SPH/2026/P13','RS Royal Surabaya','hospital','private','Mammography','Mammo Digital',1,3800000000,'bagus','Jatim 2','sph_sent'),
  mk('p14','SPH/2026/P14','RS Borromeus Bandung','hospital','private','CT Scan','CT 64 Slice',1,6100000000,'dwi','Jabar','sph_sent'),
  mk('p15','SPH/2026/P15','RS PKU Muhammadiyah Solo','hospital','private','X-Ray','X-Ray Mobile',1,1900000000,'lukman','Solo','sph_sent'),
  mk('p16','SPH/2026/P16','RS Premier Jatinegara','hospital','private','CT Scan','CT 128 Slice',1,8400000000,'dwi','Jabodetabek','presentation_scheduled'),
  mk('p17','SPH/2026/P17','RS Karyadi Jember','hospital','private','C-Arm','C-Arm Surgical',1,2300000000,'tri','Jatim 1','sph_sent'),
  mk('p18','SPH/2026/P18','RS Mardi Rahayu Kudus','hospital','private','X-Ray','X-Ray Digital DR',1,1800000000,'hatim','Jateng A','sph_sent'),
  mk('p19','SPH/2026/P19','RS Husada Utama Surabaya','hospital','private','MRI','MRI 1.5T',1,14500000000,'bagus','Jatim 2','presentation_done'),
  mk('p20','SPH/2026/P20','RS Hermina Tangerang','hospital','private','CT Scan','CT 64 Slice',1,6200000000,'dwi','Jabodetabek','sph_sent'),
  mk('p21','SPH/2026/P21','RS Bhakti Wira Tamtama','hospital','private','CT Scan','CT 128 Slice',1,8200000000,'hatim','Jateng A','po_issued',{status:'won',dpPaid:true,shippingStatus:'delivered',customsStatus:'released'}),
  mk('p22','SPH/2026/P22','RS Permata Hati Yogyakarta','hospital','private','MRI','MRI 1.5T',1,13800000000,'lukman','DIY','lost',{status:'lost',probability:0}),
  mk('p23','SPH/2026/P23','RS Pertamedika Sentul','hospital','private','X-Ray','X-Ray Digital DR',1,1850000000,'dwi','Jabodetabek','sph_sent'),
  mk('p24','SPH/2026/P24','RS Sari Asih Tangerang','hospital','private','C-Arm','C-Arm Surgical',1,2300000000,'dwi','Jabodetabek','sph_sent'),
  mk('p25','SPH/2026/P25','RS Lavalette Malang','hospital','private','CT Scan','CT 64 Slice',1,6000000000,'tri','Jatim 1','presentation_scheduled'),
  mk('p26','SPH/2026/P26','RS Permata Bunda Medan','hospital','private','Mammography','Mammo Digital',1,3700000000,'dwi','Jabodetabek','sph_sent'),
  mk('p27','SPH/2026/P27','RS Charlie Madiun','hospital','private','X-Ray','X-Ray Digital DR',1,1850000000,'bagus','Jatim 2','sph_sent'),
  mk('c1','SPH/2026/C01','Klinik Radiologi Prima Semarang','clinic','private','Mammography','Mammo Digital',1,3800000000,'hatim','Jateng A','presentation_scheduled'),
  mk('c2','SPH/2026/C02','Klinik Imaging Solo','clinic','private','X-Ray','X-Ray Konvensional',1,1200000000,'lukman','Solo','presentation_done'),
  mk('c3','SPH/2026/C03','Klinik Radiologi Hermina Bekasi','clinic','private','X-Ray','X-Ray Digital DR',1,1700000000,'dwi','Jabodetabek','sph_sent'),
  mk('c4','SPH/2026/C04','Klinik Imaging Bandung','clinic','private','CT Scan','CT 16 Slice',1,3500000000,'dwi','Jabar','sph_sent'),
  mk('c5','SPH/2026/C05','Klinik Diagnostika Surabaya','clinic','private','Mammography','Mammo Digital',1,3700000000,'bagus','Jatim 2','sph_sent'),
  mk('c6','SPH/2026/C06','Klinik Pratama Yogya','clinic','private','X-Ray','X-Ray Mobile',1,1500000000,'lukman','DIY','sph_sent'),
  mk('c7','SPH/2026/C07','Klinik Radiologi Cikarang','clinic','private','CT Scan','CT 16 Slice',1,3400000000,'dwi','Jabodetabek','sph_sent'),
  mk('c8','SPH/2026/C08','Klinik Imaging Malang','clinic','private','X-Ray','X-Ray Digital DR',1,1750000000,'tri','Jatim 1','sph_sent'),
  mk('sd1','SPH/2026/SD1','PT Mitra Radiologi Nusantara','subdistributor','private','X-Ray','X-Ray Mobile',3,1850000000,'dwi','Jabodetabek','negotiation',{probability:70}),
  mk('sd2','SPH/2026/SD2','PT Sentra Medika Surabaya','subdistributor','private','C-Arm','C-Arm Surgical',2,2250000000,'bagus','Jatim 2','sph_sent'),
  mk('sd3','SPH/2026/SD3','PT Radindo Medika Bandung','subdistributor','private','X-Ray','X-Ray Digital DR',2,1750000000,'dwi','Jabar','sph_sent'),
  mk('t1','SPH/2026/T01','RS Pertamina Jaya','hospital','tender','CT Scan','CT 128 Slice',1,8500000000,'dwi','Jabodetabek','tender',{tenderSubStage:'bid_opening',probability:55}),
  mk('t2','SPH/2026/T02','RS Pelni','hospital','tender','MRI','MRI 1.5T',1,14000000000,'dwi','Jabodetabek','tender',{tenderSubStage:'aanwijzing',probability:45}),
  mk('t3','SPH/2026/T03','RS Pupuk Kaltim','hospital','tender','C-Arm','C-Arm Surgical',1,2400000000,'dwi','Jabodetabek','tender',{tenderSubStage:'presentation',probability:50}),
  mk('t4','SPH/2026/T04','RS Krakatau Medika','hospital','tender','X-Ray','X-Ray Digital DR',1,1850000000,'dwi','Jabodetabek','sph_sent'),
  mk('t5','SPH/2026/T05','RS PT Antam','hospital','tender','CT Scan','CT 64 Slice',1,6200000000,'bagus','Jatim 2','presentation_scheduled'),
  mk('t6','SPH/2026/T06','RS Semen Padang','hospital','tender','Mammography','Mammo Digital',1,3800000000,'dwi','Jabar','sph_sent'),
  mk('t7','SPH/2026/T07','RS Pertamina Cilacap','hospital','tender','X-Ray','X-Ray Mobile',1,1850000000,'lukman','Jateng','sph_sent'),
  mk('g1','SPH/2026/G01','RSUD Dr. Soetomo Surabaya','hospital','government','CT Scan','CT 128 Slice',1,8500000000,'bagus','Jatim 2','presentation_done',{probability:55}),
  mk('g2','SPH/2026/G02','RSUD Dr. Sardjito Yogyakarta','hospital','government','MRI','MRI 1.5T',1,14000000000,'lukman','DIY','presentation_done'),
  mk('g3','SPH/2026/G03','RSUD Banyumas','hospital','government','Mammography','Mammo Tomosynthesis',1,5200000000,'lukman','Jateng','presentation_done'),
  mk('g4','SPH/2026/G04','RSUD Dr. Iskak Tulungagung','hospital','government','C-Arm','C-Arm Surgical',1,2400000000,'tri','Jatim 1','presentation_done'),
  mk('g5','SPH/2026/G05','RSUD Dr. Saiful Anwar Malang','hospital','government','CT Scan','CT 64 Slice',1,6200000000,'tri','Jatim 1','presentation_done'),
  mk('g6','SPH/2026/G06','RSUD Ibnu Sina Gresik','hospital','government','C-Arm','C-Arm Surgical',2,2400000000,'bagus','Jatim 2','presentation_scheduled'),
  mk('g7','SPH/2026/G07','RSUD Wonosobo','hospital','government','X-Ray','X-Ray Digital DR',1,1850000000,'lukman','Jateng','presentation_scheduled'),
  mk('g8','SPH/2026/G08','RSUD Banyuwangi','hospital','government','CT Scan','CT 64 Slice',1,6100000000,'tri','Jatim 1','presentation_scheduled'),
  mk('g9','SPH/2026/G09','RSUD Kab. Bekasi','hospital','government','Mammography','Mammo Digital',1,3800000000,'dwi','Jabodetabek','presentation_scheduled'),
  mk('g10','SPH/2026/G10','RSUD Sleman','hospital','government','X-Ray','X-Ray Mobile',1,1850000000,'lukman','DIY','presentation_scheduled'),
  mk('g11','SPH/2026/G11','RSUD Cibinong','hospital','government','CT Scan','CT 32 Slice',1,4800000000,'dwi','Jabodetabek','presentation_scheduled'),
  mk('g12','SPH/2026/G12','RSUD Pati','hospital','government','C-Arm','C-Arm Surgical',1,2400000000,'hatim','Jateng A','presentation_scheduled'),
  mk('g13','SPH/2026/G13','RSUD Pasuruan','hospital','government','X-Ray','X-Ray Digital DR',1,1800000000,'tri','Jatim 1','presentation_scheduled'),
  mk('g14','SPH/2026/G14','RSUD Karawang','hospital','government','CT Scan','CT 64 Slice',1,6100000000,'dwi','Jabar','presentation_scheduled'),
  mk('g15','SPH/2026/G15','RSUD Tegal','hospital','government','Mammography','Mammo Digital',1,3750000000,'hatim','Jateng A','presentation_scheduled'),
  mk('g16','SPH/2026/G16','RSUD Cirebon','hospital','government','X-Ray','X-Ray Digital DR',1,1850000000,'dwi','Jabar','ecatalog',{notes:'Menunggu klik E-Catalog'}),
  mk('k1','SPH/2026/K01','RS Aminah Blitar','hospital','kso','CT Scan','CT 128 Slice',1,8500000000,'tri','Jatim 1','negotiation',{probability:70,notes:'KSO feasibility ongoing'}),
  mk('k2','SPH/2026/K02','RS Puri Raharja Bali','hospital','kso','CT Scan','CT 128 Slice',1,8400000000,'tri','Jatim 1','presentation_done'),
  mk('k3','SPH/2026/K03','RS Mitra Sehat Klaten','hospital','kso','CT Scan','CT 128 Slice',1,8500000000,'lukman','Jateng','presentation_scheduled'),
  mk('k4','SPH/2026/K04','RS Annisa Tangerang','hospital','kso','CT Scan','CT 128 Slice',1,8500000000,'dwi','Jabodetabek','sph_sent'),
  mk('k5','SPH/2026/K05','RS Permata Hati Tuban','hospital','kso','CT Scan','CT 128 Slice',1,8400000000,'bagus','Jatim 2','sph_sent'),
  mk('k6','SPH/2026/K06','RS Husada Utama Surabaya','hospital','kso','MRI','MRI 1.5T',1,14500000000,'bagus','Jatim 2','negotiation',{probability:75,notes:'KSO dengan Orion Medical'}),
  mk('k7','SPH/2026/K07','RS Margono Purwokerto','hospital','kso','MRI','MRI 1.5T',1,14200000000,'lukman','Jateng','presentation_done'),
  mk('k8','SPH/2026/K08','RS Urologi Surabaya','hospital','kso','ESWL','ESWL Compact',1,4500000000,'bagus','Jatim 2','negotiation',{probability:65}),
  mk('k9','SPH/2026/K09','RS Sumber Waras Cirebon','hospital','kso','ESWL','ESWL Compact',1,4500000000,'dwi','Jabar','presentation_scheduled'),
  mk('k10','SPH/2026/K10','RS PMI Bogor','hospital','kso','ESWL','ESWL Compact',1,4400000000,'dwi','Jabodetabek','sph_sent'),
  mk('k11','SPH/2026/K11','RS Krakatau Medika Cilegon','hospital','kso','ESWL','ESWL Compact',1,4400000000,'dwi','Jabodetabek','sph_sent'),
];

const BUSINESS_PARTNERS = [
  { id: 'sg', name: 'SG Healthcare', country: 'Korea', flag: '🇰🇷', color: '#1a4d8a', status: 'active', products: ['X-Ray Stationary Jumong General', 'X-Ray Mobile Jumong Mobile', 'Flat Panel Detector Jumong Retro', 'C-Arm Garion', 'X-Ray Ceiling Jumong M'] },
  { id: 'anke', name: 'ANKE', country: 'China', flag: '🇨🇳', color: '#c03030', status: 'active', products: ['CT 128 Slice Anatom Precision', 'CT 64 Slice Anatom Clarity', 'CT 32 Slice C201', 'MRI 1.5T Supermark 1.5T', 'MRI 0.5T Opemark 5000', 'MRI 0.3T OpenMark III'] },
  { id: 'sino', name: 'SINO MDT', country: 'China', flag: '🇨🇳', color: '#d4780a', status: 'active', products: ['Mammography 2D Navigator DRCare', 'Mammography 3D'] },
  { id: 'hyde', name: 'Hyde Medical', country: 'China', flag: '🇨🇳', color: '#7b3fb5', status: 'active', products: ['ESWL Tipe 109', 'ESWL Tipe 109X'] },
  { id: 'angell', name: 'Angell', country: 'China', flag: '🇨🇳', color: '#0f7a5a', status: 'onboarding', products: ['X-Ray Ceiling Digital (Premium)', 'X-Ray Mobile Digital (Premium)', 'Digital Fluoroscopy (Premium)'] },
  { id: 'innocare', name: 'Innocare', country: 'Taiwan', flag: '🇹🇼', color: '#b8860b', status: 'onboarding', products: ['Flat Panel Detector Premium (OEM dengan HAMSKI XR — merek HNTI)'] },
];

const PRODUCT_CATALOG = [
  { mod: 'X-Ray', sub: 'X-Ray Stationary 500mA', price: 1450000000, partner: 'sg' },
  { mod: 'X-Ray', sub: 'X-Ray Mobile 100mA', price: 1200000000, partner: 'sg' },
  { mod: 'X-Ray', sub: 'X-Ray Portable', price: 850000000, partner: 'sg' },
  { mod: 'X-Ray', sub: 'Flat Panel Detector', price: 950000000, partner: 'sg' },
  { mod: 'C-Arm', sub: 'C-Arm Garion', price: 2400000000, partner: 'sg' },
  { mod: 'CT Scan', sub: 'CT 64 Slice Anatom Clarity', price: 6200000000, partner: 'anke' },
  { mod: 'CT Scan', sub: 'CT 128 Slice Anatom Precision', price: 8500000000, partner: 'anke' },
  { mod: 'CT Scan', sub: 'CT 32 Slice C201', price: 4500000000, partner: 'anke' },
  { mod: 'MRI', sub: 'MRI 1.5T Supermark', price: 14200000000, partner: 'anke' },
  { mod: 'MRI', sub: 'MRI 0.5T Opemark 5000', price: 8500000000, partner: 'anke' },
  { mod: 'Mammography', sub: 'Mammo 2D Navigator', price: 3700000000, partner: 'sino' },
  { mod: 'Mammography', sub: 'Mammo 3D', price: 5400000000, partner: 'sino' },
  { mod: 'ESWL', sub: 'ESWL Hyde Medical Tipe 109', price: 4500000000, partner: 'hyde' },
  { mod: 'ESWL', sub: 'ESWL Hyde Medical Tipe 109X', price: 5200000000, partner: 'hyde' },
];

const SALES_IDS = ['lukman', 'hatim', 'dwi', 'tri', 'bagus'];

function seedRand(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
}

function generateBulkSPH() {
  const rand = seedRand(2026);
  const sphList = [];
  const customers2025 = ['RS Husada Utama Surabaya', 'RSUD Soewandhie Surabaya', 'RS Mitra Keluarga Tegal', 'RSUD Tarakan Jakarta', 'RSUD Banyumas', 'RS Premier Bintaro', 'RS Hermina Galaxy', 'RS Awal Bros Tangerang', 'RSUD Dr Soeselo Slawi', 'RS Panti Wilasa Citarum'];

  for (let i = 0; i < 245; i++) {
    const cust = customers2025[i % customers2025.length] + (i > customers2025.length ? ' II' : '');
    const r = rand();
    const ptype = r < 0.70 ? 'private' : r < 0.82 ? 'government' : r < 0.90 ? 'tender' : 'kso';
    const ct = ptype === 'kso' || cust.startsWith('RS') ? 'hospital' : (r > 0.85 ? 'clinic' : 'hospital');
    const prod = PRODUCT_CATALOG[Math.floor(rand() * PRODUCT_CATALOG.length)];
    const qty = rand() < 0.85 ? 1 : 2;
    const outcome = i < 58 ? 'won' : i < 83 ? 'lost' : (rand() < 0.5 ? 'won' : 'lost');
    const stage = outcome === 'won' ? 'po_issued' : 'lost';
    const month = Math.floor(rand() * 12) + 1;
    const day = Math.floor(rand() * 28) + 1;
    sphList.push({
      id: `sph2025_${i}`, sphNo: `SPH/2025/${String(i + 1).padStart(3, '0')}`,
      customer: cust, customerType: ct, projectType: ptype, modality: prod.mod, subModality: prod.sub, partner: prod.partner, qty, unitPrice: prod.price, totalValue: qty * prod.price,
      issuedDate: `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      salesOwner: SALES_IDS[Math.floor(rand() * SALES_IDS.length)], region: '', status: outcome, stage, probability: outcome === 'won' ? 100 : 0, notes: '', nextAction: '-', lastUpdate: '2025-12-31', poStatus: outcome === 'won' ? 'issued' : null, dpPaid: outcome === 'won', finalPaid: outcome === 'won' && rand() < 0.85, shippingStatus: outcome === 'won' ? 'delivered' : null, customsStatus: outcome === 'won' ? 'released' : null, installationStatus: outcome === 'won' ? 'installed' : null,
    });
  }

  const customers2026 = [...customers2025, 'RSUD Wonosari', 'RSUD Bantul', 'RSUD Sleman', 'RS JIH Yogyakarta', 'RS Permata Hati Tuban'];
  let poCount = 0;
  for (let i = 0; i < 276; i++) {
    const cust = customers2026[i % customers2026.length] + (i > customers2026.length ? ' (Cab. ' + Math.floor(i/customers2026.length) + ')' : '');
    const r = rand();
    const ptype = r < 0.65 ? 'private' : r < 0.82 ? 'government' : r < 0.92 ? 'tender' : 'kso';
    const ct = (r > 0.80 && ptype === 'private') ? 'clinic' : (r > 0.93 ? 'subdistributor' : 'hospital');
    const prod = PRODUCT_CATALOG[Math.floor(rand() * PRODUCT_CATALOG.length)];
    const qty = rand() < 0.88 ? 1 : 2;

    let stage, status = 'active', probability;
    if (poCount < 22) {
      stage = 'po_issued'; status = 'won'; probability = 100; poCount++;
    } else {
      const sr = rand();
      if (sr < 0.45) { stage = 'sph_sent'; probability = 20; }
      else if (sr < 0.65) { stage = 'presentation_scheduled'; probability = 35; }
      else if (sr < 0.80) { stage = 'presentation_done'; probability = 50; }
      else if (sr < 0.87) { stage = 'negotiation'; probability = 70; }
      else if (sr < 0.93) { stage = 'tender'; probability = 55; }
      else if (sr < 0.97) { stage = 'ecatalog'; probability = 40; }
      else { stage = 'lost'; status = 'lost'; probability = 0; }
    }

    const month = Math.floor(rand() * 5) + 1;
    const day = Math.floor(rand() * 28) + 1;
    const isPO = stage === 'po_issued';
    const dpPaid = isPO && rand() < 0.90;
    const installed = isPO && rand() < 0.60;
    sphList.push({
      id: `sph2026_${i}`, sphNo: `SPH/2026/${String(i + 100).padStart(3, '0')}`,
      customer: cust, customerType: ct, projectType: ptype, modality: prod.mod, subModality: prod.sub, partner: prod.partner, qty, unitPrice: prod.price, totalValue: qty * prod.price,
      issuedDate: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      salesOwner: SALES_IDS[Math.floor(rand() * SALES_IDS.length)], region: '', status, stage, probability, notes: '', nextAction: '-', lastUpdate: '2026-05-12', poStatus: isPO ? 'issued' : null, dpPaid, finalPaid: false, shippingStatus: isPO ? (installed ? 'delivered' : 'plan_order') : null, customsStatus: isPO ? (installed ? 'released' : null) : null, installationStatus: installed ? 'installed' : null,
    });
  }
  return sphList;
}

const BULK_SPH = generateBulkSPH();

const HNTI_OFFICE_SPH = [
  { id: 'office_2025_001', sphNo: 'SPH/2025/HO-01', customer: 'RS Mayapada Tangerang', customerType: 'hospital', projectType: 'private', modality: 'MRI', subModality: 'MRI 1.5T Supermark', partner: 'ANKE', qty: 1, unitPrice: 22500000000, totalValue: 22500000000, issuedDate: '2025-03-18', salesOwner: 'office', region: 'Jabodetabek', status: 'won', stage: 'po_issued', probability: 100, notes: 'Special account CEO.', nextAction: '-', lastUpdate: '2025-04-25', poStatus: 'issued', dpPaid: true, finalPaid: true, shippingStatus: 'delivered', customsStatus: 'released', installationStatus: 'installed', paymentTerm: 'dp_3', paymentReceivedPct: 100 },
  { id: 'office_2026_001', sphNo: 'SPH/2026/HO-01', customer: 'RS Pondok Indah Bintaro', customerType: 'hospital', projectType: 'private', modality: 'MRI', subModality: 'MRI 1.5T Supermark', partner: 'ANKE', qty: 1, unitPrice: 23500000000, totalValue: 23500000000, issuedDate: '2026-01-25', salesOwner: 'office', region: 'Jabodetabek', status: 'won', stage: 'po_issued', probability: 100, notes: 'Direct deal CEO.', nextAction: 'Installation Maret 2026', lastUpdate: '2026-02-28', poStatus: 'issued', dpPaid: true, finalPaid: true, shippingStatus: 'delivered', customsStatus: 'released', installationStatus: 'installed', paymentTerm: 'dp_6', paymentReceivedPct: 100 },
  { id: 'office_2026_002', sphNo: 'SPH/2026/HO-02', customer: 'RS Premier Jatinegara', customerType: 'hospital', projectType: 'private', modality: 'CT Scan', subModality: 'CT 128 Slice Anatom Precision', partner: 'ANKE', qty: 1, unitPrice: 15800000000, totalValue: 15800000000, issuedDate: '2026-03-12', salesOwner: 'office', region: 'Jabodetabek', status: 'won', stage: 'po_issued', probability: 100, notes: 'Closing pribadi CEO.', nextAction: 'Shipping Mei 2026', lastUpdate: '2026-04-20', poStatus: 'issued', dpPaid: true, finalPaid: false, shippingStatus: 'on_shipment', customsStatus: 'ongoing', installationStatus: null, paymentTerm: 'dp_12', paymentReceivedPct: 60 }
];

const ALL_SPH = [...SEED_SPH, ...BULK_SPH, ...HNTI_OFFICE_SPH];

const SEED_FIELD_REPORTS = [
  { id: 'rpt_lk_w1', salesId: 'lukman', date: '2026-01-10', week: 'Minggu 2', days: 5, nights: 4, area: 'Solo Kota', visits: [{ name: 'RS PKU Muhammadiyah Solo', city: 'Solo', visit: 'first', product: 'CT Scan', pipeline: 'warm', contact: 'dr. Hendra, Sp.Rad', note: 'Tertarik upgrade CT 128' }], pipeN: 3, pipeVal: 18500000000, closest: 'RS Indriati', totalCost: 2350000, block: '-', win: 'Anggaran ACC', next: 'Follow up', fatigue: 2, createdAt: '2026-01-11T08:30:00.000Z' }
];

function generateInstalledUnits() {
  const wonProjects = ALL_SPH.filter(s => s.status === 'won' && s.installationStatus === 'installed');
  return wonProjects.map((s, i) => {
    const installDate = s.issuedDate < '2026-01-01' ? `2025-06-15` : `2026-02-20`;
    return { id: `unit_${s.id}`, sphRef: s.sphNo, customer: s.customer, modality: s.modality, subModality: s.subModality, partner: s.partner, installDate, warrantyEnd: '2028-02-20', lastPmDate: '2025-12-15', nextPmDate: '2026-06-15', technician: 'Budi Hartono', qty: s.qty };
  });
}

const SEED_ISSUES = [
  { id: 'iss1', type: 'repair', unitId: null, customer: 'RS Husada Utama Surabaya', modality: 'CT Scan', subModality: 'CT 64 Slice', issue: 'Image artifact, kalibrasi diperlukan', priority: 'high', status: 'progress', reportedDate: '2026-05-08', technician: 'Budi Hartono', note: 'Spare part dipesan' }
];

const SEED_AKL_RECORDS = [
  { id: 'akl_001', principal: 'Angell', principalCountry: 'China', product: 'X-Ray Ceiling Digital Premium', productClass: 'C', stage: 'eval', stageIdx: 4, registerDate: '2026-04-18', targetDate: '2026-05-30', daysElapsed: 21, workingDaysRemaining: 9, preregistDate: '2026-04-18', docsDate: '2026-04-25', submitDate: '2026-04-30', pnbpDate: '2026-05-05', pnbpAmount: 5000000, evalDate: '2026-05-08', fixDate: null, issuedDate: null, aklNo: null, pic: 'Rini Wahyuni', note: 'Klarifikasi spesifikasi tabung' }
];

const SEED_IMPORT_RECORDS = [
  { id: 'imp_001', principal: 'Angell', principalCountry: 'China', product: 'X-Ray Ceiling Digital Premium', stage: 'issued', stageIdx: 4, registerDate: '2026-02-15', preregistDate: '2026-02-15', docsDate: '2026-02-22', submitDate: '2026-03-01', evalDate: '2026-03-10', issuedDate: '2026-04-05', importPermitNo: 'BAPETEN/IMP/2026/00451', pic: 'Rini Wahyuni', note: 'Izin Import terbit' }
];

const SEED_PENGALIHAN_RECORDS = [
  { id: 'pgl_001', customer: 'RS Bhakti Wira Tamtama', modality: 'CT Scan', subModality: 'CT 128 Slice', destination: 'Semarang', stage: 'issued', stageIdx: 2, submitDate: '2025-08-12', evalDate: '2025-08-22', issuedDate: '2025-09-05', permitNo: 'BAPETEN/PGL/2025/01823', pic: 'Rini Wahyuni', note: 'Disetujui' }
];

const SEED_PI_RECORDS = [
  { id: 'pi_001', piNo: 'BAPETEN/PI/2026/00891', principal: 'SG Healthcare', shipment: 'SG-SHP-2026-04-12', items: '2x X-Ray Stationary', issuedDate: '2026-05-05', expiredDate: '2026-05-26', status: 'active', note: 'Shipment dalam perjalanan' }
];

const SEED_MANIFESTS = [
  { id: 'mfst_001', manifestNo: 'MFST-2026-05-12', principal: 'SG Healthcare', principalOrigin: 'Busan, Korea', vessel: 'MV Wan Hai 503', containerNo: 'WHLU-7234567', etd: '2026-05-05', eta: '2026-05-22', portOfLoading: 'Busan Port', portOfDischarge: 'Tanjung Priok', itemsCount: 3, totalValue: 5500000000, freightCost: 85000000, insurance: 12000000, status: 'in_transit', piRef: 'BAPETEN/PI/2026/00891', notes: 'Container 40HC' }
];

const SEED_CUSTOMS_DOCS = [
  { id: 'doc_001', docNo: 'INV-SG-2026-0512', docType: 'invoice', manifestRef: 'MFST-2026-05-12', principal: 'SG Healthcare', docDate: '2026-05-05', status: 'received', fileUrl: '', notes: 'Commercial Invoice' }
];

const SEED_INSTALL_RECORDS = [
  { id: 'inst_001', recordNo: 'BA-INST-2026-001', customer: 'RS Bhakti Wira Tamtama', modality: 'CT Scan', subModality: 'CT 128 Slice', installStart: '2026-04-15', installEnd: '2026-04-20', duration: 5, leadTechnician: 'Budi Hartono', teamSize: 3, roomReady: true, electricalReady: true, calibrationDone: true, status: 'completed', notes: 'Lancar' }
];

const SEED_BAST_RECORDS = [
  { id: 'bast_001', bastNo: 'BAST-HNTI-2026-001', customer: 'RS Bhakti Wira Tamtama', modality: 'CT Scan', subModality: 'CT 128 Slice', signedDate: '2026-04-22', hntiRep: 'Fajrin (CEO)', customerRep: 'dr. Setiawan', witness: '', status: 'signed', docUrl: '', notes: 'Selesai' }
];

const SEED_TRAINING_RECORDS = [
  { id: 'train_001', certNo: 'CERT-HNTI-2026-001', customer: 'RS Bhakti Wira Tamtama', modality: 'CT Scan', subModality: 'CT 128 Slice', sessionDate: '2026-04-21', participants: 4, instructor: 'Budi Hartono', duration: 16, topics: 'Operasional dasar', status: 'completed', certUrl: '', notes: 'Selesai' }
];

const STAGES = [
  { id: 'sph_sent', baseProbability: 20, color: '#94a3b8' },
  { id: 'presentation_scheduled', baseProbability: 35, color: '#7d9cc5' },
  { id: 'presentation_done', baseProbability: 50, color: '#5b87b8' },
  { id: 'ecatalog', baseProbability: 40, color: '#a37fc0' },
  { id: 'negotiation', baseProbability: 70, color: '#c8a96a' },
  { id: 'tender', baseProbability: 55, color: '#b8935a' },
  { id: 'po_issued', baseProbability: 100, color: '#3a6b3a' },
  { id: 'lost', baseProbability: 0, color: '#8b3a3a' },
];

const PROJECT_TYPES = [
  { id: 'private', color: '#3a5a8a' },
  { id: 'government', color: '#8a5a3a' },
  { id: 'tender', color: '#5a3a8a' },
  { id: 'kso', color: '#c8a96a' },
];

const MODALITY_COLORS = {
  'CT Scan': '#1a4d8a', 'MRI': '#c8a96a', 'C-Arm': '#8a5a3a', 'X-Ray': '#5a8a5a', 'Mammography': '#8a3a5a', 'ESWL': '#3a8a8a',
};

const storeGet = async (k) => { try { const r = localStorage.getItem(k); return r; } catch { return null; } };
const storeSet = async (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const storeDel = async (k) => { try { localStorage.removeItem(k); } catch {} };

const formatCurrency = (n, lang, rate) => {
  if (lang === 'en') {
    const usd = n / rate;
    if (usd >= 1e6) return `$${(usd / 1e6).toFixed(2)}M`;
    if (usd >= 1e3) return `$${(usd / 1e3).toFixed(1)}K`;
    return `$${usd.toFixed(0)}`;
  }
  if (n >= 1e12) return `Rp ${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(2)}M`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(1)}Jt`;
  return `Rp ${n.toLocaleString('id-ID')}`;
};
const formatCurrencyFull = (n, lang, rate) => lang === 'en' ? `$${(n / rate).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : `Rp ${n.toLocaleString('id-ID')}`;

const PPN_RATE = 0.11;
const PPH23_RATE = 0.025;
const OPS_COST_DEFAULT = 0.05;
const INCENTIVE_RATE = 0.015;

function calcIncentive(sph) {
  const grossPrice = sph.totalValue || 0;
  const dpp = grossPrice / (1 + PPN_RATE);
  const ppn = grossPrice - dpp;
  const pph23 = dpp * PPH23_RATE;
  const opsPercent = sph.opsPercent !== undefined ? sph.opsPercent : OPS_COST_DEFAULT;
  const opsCost = grossPrice * opsPercent;
  const netSales = dpp - pph23 - opsCost;
  const incentive = netSales * INCENTIVE_RATE;
  return { grossPrice, dpp, ppn, pph23, opsCost, opsPercent, netSales, incentive };
}

function getIncentiveStatus(sph) {
  if (sph.poStatus !== 'issued') return null;
  const isGovOrTender = sph.projectType === 'government' || sph.projectType === 'tender';
  const isKSO = sph.projectType === 'kso';
  const isKsoSelfInvest = isKSO && sph.ksoMode === 'hnti_self_invest';

  if (isKsoSelfInvest) {
    const monthsPaid = sph.ksoMonthsPaid || 0;
    if (monthsPaid >= 12) return { status: 'paid', label: 'inc_status_paid', color: '#3a6b3a' };
    if (monthsPaid > 0) return { status: 'kso_prorata', label: 'inc_status_kso_prorata', color: '#c8a96a', progress: monthsPaid / 12 };
    return { status: 'estimated', label: 'inc_status_estimated', color: '#94a3b8' };
  }

  if (isGovOrTender) {
    if (sph.finalPaid) return { status: 'paid', label: 'inc_status_paid', color: '#3a6b3a' };
    if (sph.dpPaid || sph.installationStatus === 'installed') return { status: 'ready', label: 'inc_status_ready', color: '#c8a96a' };
    return { status: 'estimated', label: 'inc_status_estimated', color: '#94a3b8' };
  }

  const pct = sph.paymentReceivedPct || (sph.finalPaid ? 100 : sph.dpPaid ? 50 : 0);
  if (pct >= 100) return { status: 'paid', label: 'inc_status_paid', color: '#3a6b3a' };
  if (pct >= 50) return { status: 'ready', label: 'inc_status_ready', color: '#c8a96a' };
  return { status: 'estimated', label: 'inc_status_estimated', color: '#94a3b8' };
}

const NET_MARGIN_BY_MODALITY = { 'MRI': 0.12, 'CT Scan': 0.14, 'C-Arm': 0.16, 'Mammography': 0.15, 'ESWL': 0.14, 'X-Ray': 0.18 };
const NET_MARGIN_DEFAULT = 0.15;

function IMSLogo({ size = 'md', inverted = false }) {
  const sizes = { sm: { layer: 22, txt: 24 }, md: { layer: 32, txt: 34 }, lg: { layer: 56, txt: 64 }, xl: { layer: 84, txt: 96 } };
  const s = sizes[size] || sizes.md;
  const txtColor = inverted ? '#f8f5ef' : '#1a2942';
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: '8px', lineHeight: 1}}>
      <svg width={s.layer * 1.45} height={s.layer * 1.1} viewBox="0 0 87 66">
        <polygon points="43.5,2 82,20 43.5,38 5,20" fill="#3a4754" />
        <polygon points="43.5,2 82,20 43.5,20 5,20" fill="#5a6878" />
        <polygon points="43.5,22 82,38 43.5,52 5,38" fill="#4a9540" />
        <polygon points="43.5,22 82,38 43.5,38 5,38" fill="#6ab058" />
        <polygon points="43.5,32 82,46 43.5,62 5,46" fill="#2a7ec0" />
        <polygon points="43.5,32 82,46 43.5,46 5,46" fill="#4a98d8" />
      </svg>
      <span style={{fontSize: `${s.txt}px`, fontWeight: 900, color: txtColor, fontFamily: 'Inter, sans-serif'}}>IMS</span>
    </div>
  );
}

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; background: #f8f5ef; color: #1a2942; font-family: 'Inter', sans-serif; }
    .serif { font-family: 'Cormorant Garamond', Georgia, serif; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .hover-row:hover { background: #f5f1e8 !important; }
    .btn-primary { background: #1a2942; color: #f8f5ef; border: none; padding: 10px 20px; font-size: 12.5px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; }
    .btn-ghost { background: transparent; color: #1a2942; border: 1px solid #d4cdb8; padding: 9px 18px; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
    input, select, textarea { padding: 9px 12px; border: 1px solid #d4cdb8; background: #fefcf7; color: #1a2942; outline: none; width: 100%; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(26, 41, 66, 0.55); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); padding: 20px; }
    .modal-content { background: #f8f5ef; max-width: 760px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    .card { background: #fefcf7; border: 1px solid #e8e1cc; padding: 22px; margin-bottom: 20px; }
  `}</style>
);

export default function App() {
  const [lang, setLang] = useState('id');
  const [session, setSession] = useState(null);
  const [data, setData] = useState(ALL_SPH);
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_USD_IDR);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sData = await storeGet('ims_data');
      if (sData) try { setData(JSON.parse(sData)); } catch {}
      const sSess = await storeGet('ims_session');
      if (sSess) try { setSession(JSON.parse(sSess)); } catch {}
      setLoading(false);
    })();
  }, []);

  useEffect(() => { if (!loading) storeSet('ims_data', JSON.stringify(data)); }, [data, loading]);
  useEffect(() => { if (!loading) { session ? storeSet('ims_session', JSON.stringify(session)) : storeDel('ims_session'); } }, [session, loading]);

  const t = translations[lang];
  const fmt = (n) => formatCurrency(n, lang, exchangeRate);
  const fmtFull = (n) => formatCurrencyFull(n, lang, exchangeRate);

  if (loading) return <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifycenter: 'center'}}><GlobalStyles /><IMSLogo size="lg" /></div>;
  if (!session) return <LoginScreen t={t} onLogin={setSession} />;
  return <AuthApp session={session} setSession={setSession} lang={lang} setLang={setLang} t={t} data={data} setData={setData} fmt={fmt} fmtFull={fmtFull} />;
}

function LoginScreen({ t, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div style={{minHeight: '100vh', display: 'flex', background: '#f8f5ef'}}>
      <GlobalStyles />
      <div style={{flex: 1, background: '#1a2942', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#f8f5ef'}}>
        <IMSLogo size="xl" />
        <h1 className="serif" style={{fontSize: '36px'}}>{t.company}</h1>
      </div>
      <div style={{flex: '0 0 400px', padding: '40px', display: 'flex', flexDirection: 'column', justifycenter: 'center'}}>
        <h2>{t.login_title}</h2>
        <label>{t.username}</label>
        <input value={username} onChange={e => setUsername(e.target.value)} style={{marginBottom: '10px'}} />
        <label>{t.password}</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{marginBottom: '20px'}} />
        <button className="btn-primary" onClick={() => {
          const u = username.toLowerCase().trim();
          if (USERS[u] && USERS[u].password === password) onLogin({ ...USERS[u], username: u });
        }}>{t.login_btn}</button>
      </div>
    </div>
  );
}

function AuthApp({ session, setSession, lang, setLang, t, data, setData, fmt, fmtFull }) {
  const [view, setView] = useState('dashboard');
  const allowedNav = NAV_BY_ROLE[session.role];
  const filteredData = session.role === 'sales' ? data.filter(s => s.salesOwner === session.salesId) : data;

  return (
    <div>
      <Header session={session} setSession={setSession} lang={lang} setLang={setLang} view={view} setView={setView} allowedNav={allowedNav} t={t} />
      <main style={{padding: '30px', maxWidth: '1400px', margin: '0 auto'}}>
        {view === 'dashboard' && <Dashboard data={filteredData} t={t} fmt={fmt} />}
        {view === 'sph' && <SPHManagement data={filteredData} t={t} fmt={fmt} />}
        {view === 'pipeline' && <PipelineBoard data={filteredData} t={t} fmt={fmt} />}
        {view === 'finance' && <FinanceModule data={data} setData={setData} t={t} fmt={fmt} />}
        {view === 'incentive' && <IncentiveModule data={data} setData={setData} t={t} session={session} fmt={fmt} fmtFull={fmtFull} />}
      </main>
    </div>
  );
}

function Header({ session, setSession, view, setView, allowedNav, t }) {
  return (
    <div style={{background: '#1a2942', color: '#fff', padding: '15px 30px', display: 'flex', justifycontent: 'space-between', alignItems: 'center'}}>
      <IMSLogo size="sm" inverted />
      <div style={{display: 'flex', gap: '10px'}}>
        {allowedNav.map(n => (
          <button key={n} onClick={() => setView(n)} style={{background: view === n ? '#c8a96a' : 'transparent', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer', fontWeight: 600}}>{t[`nav_${n}`]}</button>
        ))}
        <button onClick={() => setSession(null)} style={{background: '#c03030', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer'}}>Exit</button>
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
        <div key={i} style={{display: 'flex', justifycontent: 'space-between', gap: '12px'}}>{p.name}: {fmt ? fmt(p.value) : p.value}</div>
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
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px'}}>
        <div className="card"><h4>{t.pipeline_value}</h4><h2>{fmt(totalPipeline)}</h2></div>
        <div className="card"><h4>{t.weighted_pipeline}</h4><h2>{fmt(weightedPipeline)}</h2></div>
        <div className="card"><h4>{t.revenue_ytd}</h4><h2>{fmt(revenueYTD)}</h2></div>
        <div className="card"><h4>{t.win_rate}</h4><h2>{winRate.toFixed(0)}%</h2></div>
      </div>
      <div className="card">
        <h3>{t.monthly_pipeline}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<ChartTooltip fmt={fmt} />} />
            <Area type="monotone" dataKey="pipeline" fill="#1a4d8a" stroke="#1a4d8a" />
            <Area type="monotone" dataKey="weighted" fill="#c8a96a" stroke="#c8a96a" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SPHManagement({ data, t, fmt }) {
  return (
    <div className="card">
      <h3>{t.sph_title}</h3>
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr style={{background: '#f0ebe0', textAlign: 'left'}}>
            <th style={{padding: '10px'}}>No SPH</th><th style={{padding: '10px'}}>Pelanggan</th><th style={{padding: '10px'}}>Modalitas</th><th style={{padding: '10px', textAlign: 'right'}}>Nilai</th>
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 15).map(s => (
            <tr key={s.id} style={{borderBottom: '1px solid #e8e1cc'}}>
              <td style={{padding: '10px'}}>{s.sphNo}</td><td style={{padding: '10px'}}>{s.customer}</td><td style={{padding: '10px'}}>{s.subModality}</td><td style={{padding: '10px', textAlign: 'right'}}>{fmt(s.totalValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PipelineBoard({ data, t, fmt }) {
  return (
    <div style={{display: 'flex', gap: '15px', overflowX: 'auto'}}>
      {STAGES.map(st => {
        const list = data.filter(d => d.stage === st.id);
        return (
          <div key={st.id} style={{flex: '0 0 250px', background: '#fefcf7', border: '1px solid #e8e1cc', padding: '10px'}}>
            <h4 style={{borderBottom: `3px solid ${st.color}`, paddingBottom: '5px'}}>{t[`stage_${st.id}`]} ({list.length})</h4>
            {list.slice(0, 5).map(p => (
              <div key={p.id} style={{padding: '10px', background: '#fff', border: '1px solid #d4cdb8', marginBottom: '8px'}}>
                <div style={{fontWeight: 600, fontSize: '12px'}}>{p.customer}</div>
                <div style={{fontSize: '11px', color: '#8a7d5c'}}>{fmt(p.totalValue)}</div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function FinanceModule({ data, setData, t, fmt }) {
  const poProjects = data.filter(s => s.poStatus === 'issued');
  return (
    <div className="card">
      <h3>{t.finance_title}</h3>
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr style={{background: '#f0ebe0', textAlign: 'left'}}>
            <th style={{padding: '10px'}}>Pelanggan</th><th style={{padding: '10px'}}>Nilai</th><th style={{padding: '10px'}}>DP paid</th><th style={{padding: '10px'}}>Pelunasan</th>
          </tr>
        </thead>
        <tbody>
          {poProjects.slice(0, 10).map(p => (
            <tr key={p.id} style={{borderBottom: '1px solid #e8e1cc'}}>
              <td style={{padding: '10px'}}>{p.customer}</td>
              <td style={{padding: '10px'}}>{fmt(p.totalValue)}</td>
              <td style={{padding: '10px'}}>
                <input type="checkbox" checked={p.dpPaid} onChange={() => setData(prev => prev.map(s => s.id === p.id ? {...s, dpPaid: !s.dpPaid} : s))} />
              </td>
              <td style={{padding: '10px'}}>
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

  const updateOpsPercent = (id, opsPercent) => {
    setData(prev => prev.map(s => s.id === id ? { ...s, opsPercent: Math.max(0, Math.min(0.5, opsPercent)) } : s));
  };

  return (
    <div className="card">
      <h3>{t.nav_incentive} (Total YTD: {fmt(ytdTotal)})</h3>
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr style={{background: '#f0ebe0', textAlign: 'left'}}>
            <th style={{padding: '10px'}}>Pelanggan</th><th style={{padding: '10px'}}>Net Sales</th><th style={{padding: '10px'}}>Insentif</th><th style={{padding: '10px'}}>Status</th><th style={{padding: '10px'}}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {dealsWithIncentive.slice(0, 10).map(d => (
            <tr key={d.id} style={{borderBottom: '1px solid #e8e1cc'}}>
              <td style={{padding: '10px'}}>{d.customer}</td>
              <td style={{padding: '10px'}}>{fmt(d._calc.netSales)}</td>
              <td style={{padding: '10px', color: '#3a6b3a', fontWeight: 'bold'}}>{fmt(d._calc.incentive)}</td>
              <td style={{padding: '10px'}}><span style={{color: d._stat.color}}>{t[d._stat.label]}</span></td>
              <td style={{padding: '10px'}}><button className="btn-ghost" onClick={() => setSelectedDeal(d)}>Detail</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedDeal && (
        <div className="modal-overlay" onClick={() => setSelectedDeal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h4>{selectedDeal.customer}</h4>
            <label>{t.inc_ops_cost}</label>
            <input 
              type="number" 
              step="0.5" 
              min="0" 
              max="50" 
              value={((selectedDeal.opsPercent !== undefined ? selectedDeal.opsPercent : 0.05) * 100)} 
              onChange={(e) => updateOpsPercent(selectedDeal.id, (parseFloat(e.target.value) || 0) / 100)} 
              style={{width: '100px', fontWeight: 600, display: 'block', marginTop: '10px'}} 
            />
            <button className="btn-primary" style={{marginTop: '20px'}} onClick={() => setSelectedDeal(null)}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}

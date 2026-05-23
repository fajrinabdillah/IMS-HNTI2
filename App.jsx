import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, FileText, Briefcase, Plus, Search, Edit2, Trash2, X, ArrowUpRight, ArrowDownRight, Activity, DollarSign, Users, Clock, Globe, LogOut, Shield, Wrench, Truck, Wallet, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, FileCheck, Menu, ChevronDown, ClipboardList, Star, Settings, ShieldCheck, CalendarDays, AlertTriangle, FileSearch } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, ComposedChart } from 'recharts';

const DEFAULT_USD_IDR = 17500;

// ============== i18n ==============
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
    // Maintenance
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
    // Regulatory
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
    // Regulatory Tabs
    reg_tab_bapeten: 'Izin Pemanfaatan BAPETEN',
    reg_tab_akl: 'Izin Edar Kemenkes (AKL)',
    reg_tab_bapeten_short: 'BAPETEN',
    reg_tab_akl_short: 'AKL Kemenkes',
    // AKL Kemenkes
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
    // Improved KPI labels & sub-labels for clarity
    revenue_ytd_sub: 'Sudah terealisasi (deal menang)',
    weighted_pipeline_sub: 'Proyeksi: deal aktif × probabilitas',
    pipeline_value_sub: 'Total nilai semua deal aktif',
    win_rate_sub: 'Menang dari total deal closed',
    revenue_period: 'Jan–Mei 2026',
    // YoY
    yoy_title: 'Pertumbuhan Tahun ke Tahun', yoy_subtitle: 'Perbandingan SPH dan PO antar tahun',
    yoy_filter_year: 'Tahun', yoy_filter_all: 'Semua',
    yoy_sph_2025: 'SPH 2025', yoy_sph_2026: 'SPH 2026',
    yoy_po_2025: 'PO 2025', yoy_po_2026: 'PO 2026',
    yoy_growth: 'Pertumbuhan',
    // Business partners
    bp_title: 'Mitra Bisnis HNTI', bp_subtitle: 'Distributor & manufacturer partner',
    bp_country: 'Negara', bp_products: 'Produk',
    // Incentive Module
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
    // Payment Terms
    pt_label: 'Termin Pembayaran',
    pt_cash: 'Cash (Pelunasan)',
    pt_dp_1: 'DP + 1x Cicilan',
    pt_dp_3: 'DP + 3x Cicilan',
    pt_dp_6: 'DP + 6x Cicilan',
    pt_dp_12: 'DP + 12x Cicilan',
    pt_dp_18: 'DP + 18x Cicilan',
    pt_dp_24: 'DP + 24x Cicilan',
    pt_dp_36: 'DP + 36x Cicilan',
    pt_post_bast: 'Post-BAST (100% Setelah BAST)',
    pt_kso_monthly: 'KSO Revenue Sharing Bulanan',
    pt_installments: 'Cicilan',
    pt_installment_count: 'Cicilan Ke',
    pt_payment_received_pct: '% Pembayaran Diterima',
    pt_bast_date: 'Tanggal BAST',
    pt_mark_bast: 'Tandai BAST Selesai',
    // Net Profit Module
    np_title: 'Analisis Net Profit',
    np_subtitle: 'Margin keuntungan bersih per modalitas',
    np_total_revenue: 'Revenue YTD',
    np_total_profit: 'Net Profit YTD',
    np_avg_margin: 'Rata-rata Net Margin',
    np_revenue: 'Revenue',
    np_margin: 'Net Margin',
    np_profit: 'Net Profit',
    np_per_modality: 'Net Profit per Modalitas',
    np_monthly_trend: 'Trend Net Profit Bulanan',
    np_per_deal: 'Detail per Deal',
    np_tab_profit: 'Net Profit',
    np_tab_finance: 'AR & Cashflow',
    np_modality_label: 'Modalitas',
    np_margin_range: 'Range',
    np_default_margin: 'Default %',
    // New Regulatory Tabs
    reg_tab_import: 'Izin Import BAPETEN',
    reg_tab_pengalihan: 'Izin Pengalihan',
    reg_tab_pi: 'Izin Persetujuan Import',
    // Izin Import BAPETEN (prerequisite untuk AKL)
    imp_title: 'Izin Import BAPETEN',
    imp_subtitle: 'Izin awal untuk principal baru · prerequisite AKL Kemenkes',
    imp_principal: 'Principal',
    imp_product: 'Produk',
    imp_stage_pre: 'Pra-Registrasi',
    imp_stage_docs: 'Pengumpulan Dokumen',
    imp_stage_submit: 'Submit BAPETEN',
    imp_stage_eval: 'Evaluasi BAPETEN',
    imp_stage_issued: 'Izin Import Terbit',
    imp_total_active: 'Pendaftaran Aktif',
    imp_total_issued: 'Izin Terbit',
    imp_pipeline_title: 'Pipeline Izin Import BAPETEN',
    imp_no: 'No. Izin Import',
    imp_records_title: 'Daftar Pengajuan Izin Import',
    imp_advance: 'Lanjutkan ke Tahap Berikutnya',
    imp_warning_akl: 'AKL Kemenkes tidak bisa diajukan sebelum Izin Import BAPETEN terbit',
    // Izin Pengalihan BAPETEN
    pgl_title: 'Izin Pengalihan BAPETEN',
    pgl_subtitle: 'Izin distribusi setelah AKL terbit · monitoring BAPETEN per unit',
    pgl_unit: 'Unit Alat',
    pgl_destination: 'Tujuan',
    pgl_stage_submit: 'Submit',
    pgl_stage_eval: 'Evaluasi',
    pgl_stage_issued: 'Izin Terbit',
    pgl_total_active: 'Pengalihan Aktif',
    pgl_total_issued: 'Izin Terbit',
    pgl_records_title: 'Daftar Izin Pengalihan',
    pgl_pipeline_title: 'Pipeline Izin Pengalihan',
    pgl_no: 'No. Izin Pengalihan',
    pgl_advance: 'Lanjutkan ke Tahap Berikutnya',
    // Izin Persetujuan Import (per shipment, 21 hari)
    pi_title: 'Izin Persetujuan Import (PI)',
    pi_subtitle: 'Per shipment untuk clearance Bea Cukai · berlaku 21 hari kerja',
    pi_no: 'No. PI',
    pi_shipment: 'Shipment',
    pi_issued_date: 'Tgl. PI Terbit',
    pi_expired_date: 'Tgl. Expired',
    pi_days_remaining: 'Sisa Hari',
    pi_total_active: 'PI Aktif',
    pi_total_used: 'PI Digunakan',
    pi_total_expired: 'PI Expired',
    pi_records_title: 'Daftar Izin Persetujuan Import',
    pi_status_active: 'Aktif',
    pi_status_used: 'Digunakan',
    pi_status_expired: 'Expired',
    pi_warning_expiring: 'PI mendekati expired (≤5 hari)',
    pi_principal: 'Principal',
    pi_items: 'Items',
    // CRUD common
    crud_add: 'Tambah Baru',
    crud_edit: 'Edit',
    crud_delete: 'Hapus',
    crud_save: 'Simpan',
    crud_cancel: 'Batal',
    crud_confirm_delete: 'Yakin ingin menghapus record ini?',
    crud_required: 'Wajib diisi',
    crud_saved: 'Tersimpan',
    crud_deleted: 'Berhasil dihapus',
    crud_pic: 'Penanggung Jawab',
    crud_actions: 'Aksi',
    reg_modal_add_import: 'Tambah Izin Import BAPETEN',
    reg_modal_edit_import: 'Edit Izin Import BAPETEN',
    reg_modal_add_akl: 'Tambah AKL Kemenkes',
    reg_modal_edit_akl: 'Edit AKL Kemenkes',
    reg_modal_add_bapeten: 'Tambah Izin Pemanfaatan BAPETEN',
    reg_modal_edit_bapeten: 'Edit Izin Pemanfaatan BAPETEN',
    reg_modal_add_pengalihan: 'Tambah Izin Pengalihan',
    reg_modal_edit_pengalihan: 'Edit Izin Pengalihan',
    reg_modal_add_pi: 'Tambah Izin Persetujuan Import',
    reg_modal_edit_pi: 'Edit Izin Persetujuan Import',
    // Maintenance CRUD
    mt_modal_add_issue: 'Tambah Laporan Perbaikan/Keluhan',
    mt_modal_edit_issue: 'Edit Laporan',
    mt_issue_type: 'Jenis Laporan',
    mt_type_repair: 'Perbaikan Alat',
    mt_type_complaint: 'Keluhan Pelanggan',
    mt_unit_label: 'Unit Alat',
    mt_reported_by: 'Dilaporkan oleh',
    mt_assigned_to: 'Teknisi Penanggung Jawab',
    mt_issue_desc: 'Deskripsi Masalah',
    mt_resolution_note: 'Catatan Penyelesaian',
    mt_resolved_date: 'Tgl. Selesai',
    mt_estimated_cost: 'Estimasi Biaya',
    mt_modal_add_pm: 'Tambah Jadwal PM',
    mt_modal_edit_pm: 'Edit Jadwal PM',
    mt_pm_unit: 'Unit Alat',
    mt_pm_last_date: 'Tgl. PM Terakhir',
    mt_pm_next_date: 'Tgl. PM Berikutnya',
    mt_pm_technician: 'Teknisi PM',
    mt_pm_status: 'Status PM',
    mt_pm_status_scheduled: 'Terjadwal',
    mt_pm_status_done: 'Selesai',
    mt_pm_status_overdue: 'Terlambat',
    mt_pm_notes: 'Catatan PM',
    // Operations CRUD
    ops_tab_shipment: 'Status Pengiriman PO',
    ops_tab_manifest: 'Manifest Shipment',
    ops_tab_customs: 'Dokumen Customs',
    ops_modal_add_manifest: 'Tambah Manifest',
    ops_modal_edit_manifest: 'Edit Manifest',
    ops_modal_add_customs: 'Tambah Dokumen Customs',
    ops_modal_edit_customs: 'Edit Dokumen Customs',
    ops_manifest_no: 'No. Manifest',
    ops_principal_origin: 'Principal / Asal',
    ops_vessel: 'Nama Kapal / Penerbangan',
    ops_container_no: 'No. Container / AWB',
    ops_etd: 'ETD',
    ops_eta: 'ETA',
    ops_port_of_loading: 'Port of Loading',
    ops_port_of_discharge: 'Port of Discharge',
    ops_items_count: 'Jumlah Items',
    ops_total_value: 'Nilai Total',
    ops_freight_cost: 'Biaya Freight',
    ops_insurance: 'Asuransi',
    ops_manifest_status: 'Status Manifest',
    ops_status_planning: 'Planning',
    ops_status_loading: 'Loading',
    ops_status_in_transit: 'In Transit',
    ops_status_arrived: 'Arrived',
    ops_status_cleared: 'Cleared',
    ops_doc_no: 'No. Dokumen',
    ops_doc_type: 'Jenis Dokumen',
    ops_doc_invoice: 'Commercial Invoice',
    ops_doc_packing: 'Packing List',
    ops_doc_bl: 'Bill of Lading',
    ops_doc_coo: 'Certificate of Origin',
    ops_doc_inspection: 'Inspection Certificate',
    ops_doc_pi_bapeten: 'PI BAPETEN',
    ops_doc_pib: 'PIB',
    ops_doc_other: 'Lainnya',
    ops_doc_received: 'Diterima',
    ops_doc_submitted: 'Disubmit',
    ops_doc_approved: 'Disetujui',
    ops_doc_rejected: 'Ditolak',
    ops_doc_date: 'Tanggal',
    ops_doc_file_url: 'Link File',
    ops_doc_status: 'Status',
    ops_shipping_notes: 'Catatan',
    ops_total_manifests: 'Total Manifest',
    ops_in_transit: 'Dalam Transit',
    ops_arrived_count: 'Sudah Sampai',
    ops_pending_docs: 'Dokumen Pending',
    // Installation CRUD
    inst_tab_progress: 'Progress Instalasi PO',
    inst_tab_records: 'Riwayat Instalasi',
    inst_tab_bast: 'BAST',
    inst_tab_training: 'Sertifikat Training',
    inst_modal_add_record: 'Tambah Riwayat Instalasi',
    inst_modal_edit_record: 'Edit Riwayat Instalasi',
    inst_modal_add_bast: 'Tambah BAST',
    inst_modal_edit_bast: 'Edit BAST',
    inst_modal_add_training: 'Tambah Sertifikat Training',
    inst_modal_edit_training: 'Edit Sertifikat Training',
    inst_record_no: 'No. Berita Acara',
    inst_install_start: 'Mulai Instalasi',
    inst_install_end: 'Selesai Instalasi',
    inst_duration: 'Durasi (hari)',
    inst_lead_technician: 'Teknisi Utama',
    inst_team_size: 'Jumlah Teknisi',
    inst_room_ready: 'Ruangan Siap',
    inst_electrical_ready: 'Listrik Siap',
    inst_calibration_done: 'Kalibrasi Selesai',
    inst_status_planning: 'Persiapan',
    inst_status_progress: 'Sedang Berlangsung',
    inst_status_completed: 'Selesai',
    inst_status_delayed: 'Tertunda',
    inst_record_status: 'Status Instalasi',
    bast_no: 'No. BAST',
    bast_signed_date: 'Tgl. Penandatanganan',
    bast_hnti_rep: 'Perwakilan HNTI',
    bast_customer_rep: 'Perwakilan Customer',
    bast_witness: 'Saksi',
    bast_doc_url: 'Link Dokumen BAST',
    bast_status_draft: 'Draft',
    bast_status_signed: 'Telah Ditandatangani',
    bast_status_pending: 'Menunggu Tanda Tangan',
    bast_notes: 'Catatan',
    train_cert_no: 'No. Sertifikat',
    train_session_date: 'Tgl. Training',
    train_participants: 'Jumlah Peserta',
    train_instructor: 'Instruktur',
    train_duration: 'Durasi (jam)',
    train_topics: 'Topik Training',
    train_completed: 'Selesai',
    train_pending: 'Belum',
    train_cert_url: 'Link Sertifikat (PDF)',
    inst_total_records: 'Total Instalasi',
    inst_in_progress: 'Sedang Berlangsung',
    inst_completed_count: 'Selesai',
    inst_bast_signed: 'BAST Tertanda',
    inst_training_done: 'Training Selesai',
    // Sales Reporting CRUD
    sr_edit_report: 'Edit Laporan',
    sr_delete_report: 'Hapus Laporan',
    sr_confirm_delete: 'Yakin ingin menghapus laporan ini?',
    sr_updated_success: '✓ Laporan berhasil diupdate',
    sr_back_to_history: 'Kembali ke Riwayat',
    // Common labels needed by modals (only ones not already defined)
    date: 'Tanggal',
    priority: 'Prioritas',
    technician: 'Teknisi',
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
    nav_maintenance: 'Maintenance',
    mt_title: 'Preventive Maintenance System',
    mt_subtitle: 'Maintenance schedules, repairs, and customer complaints',
    mt_tab_schedule: 'PM Schedule', mt_tab_repair: 'Repairs', mt_tab_complaint: 'Customer Complaints',
    mt_unit: 'Unit', mt_customer: 'Customer', mt_modality: 'Modality',
    mt_install_date: 'Install Date', mt_warranty_end: 'Warranty End',
    mt_last_pm: 'Last PM', mt_next_pm: 'Next PM',
    mt_status: 'Status', mt_pm_due: 'Due', mt_pm_done: 'Done',
    mt_pm_upcoming: 'Upcoming', mt_pm_overdue: 'Overdue',
    mt_under_warranty: 'Under Warranty', mt_out_warranty: 'Out of Warranty',
    mt_technician: 'Technician', mt_actions: 'Actions',
    mt_mark_done: 'Mark Done',
    mt_repair_title: 'Repair List',
    mt_complaint_title: 'Customer Complaints',
    mt_issue: 'Issue', mt_priority: 'Priority',
    mt_priority_low: 'Low', mt_priority_medium: 'Medium', mt_priority_high: 'High', mt_priority_critical: 'Critical',
    mt_status_open: 'Open', mt_status_progress: 'In Progress', mt_status_resolved: 'Resolved',
    mt_reported_date: 'Reported', mt_total_units: 'Total Installed Units',
    mt_units_warranty: 'Under Warranty', mt_pm_this_month: 'PM This Month',
    mt_open_issues: 'Open Issues',
    nav_regulatory: 'Regulatory',
    reg_title: 'Regulatory & BAPETEN Permits',
    reg_subtitle: 'License tracking from document collection to permit issuance',
    reg_stage_docs: 'Document Collection',
    reg_stage_submit: 'Submit to BAPETEN',
    reg_stage_eval: 'BAPETEN Evaluation',
    reg_stage_pnbp: 'PNBP Issuance',
    reg_stage_issued: 'Permit Issued',
    reg_progress: 'Progress', reg_eta: 'ETA',
    reg_doc_complete: 'Documents Complete',
    reg_doc_pending: 'Documents Pending',
    reg_note: 'Notes',
    reg_total_pending: 'Permits Processing', reg_total_issued: 'Permits Issued', reg_avg_days: 'Avg Days',
    reg_doc_inventory: 'Document Inventory', reg_advance: 'Advance to Next Stage',
    // Regulatory Tabs
    reg_tab_bapeten: 'BAPETEN Utilization Permit',
    reg_tab_akl: 'Kemenkes Distribution License (AKL)',
    reg_tab_bapeten_short: 'BAPETEN',
    reg_tab_akl_short: 'AKL Kemenkes',
    // AKL Kemenkes
    akl_title: 'Kemenkes Distribution License (AKL)',
    akl_subtitle: 'New product & new principal registration · max 30 working days',
    akl_stage_preregist: 'Pre-Registration',
    akl_stage_docs: 'Document Collection',
    akl_stage_submit: 'Submit to Regalkes',
    akl_stage_pnbp: 'PNBP Issuance',
    akl_stage_eval: 'Evaluation by Assessor Team',
    akl_stage_fix: 'Corrections / Additional Data',
    akl_stage_issued: 'AKL Certificate Issued',
    akl_principal: 'Principal / Manufacturer',
    akl_product: 'Product',
    akl_product_class: 'Risk Class',
    akl_akl_no: 'AKL No.',
    akl_validity: 'Validity Period',
    akl_validity_period: '5 Years',
    akl_days_elapsed: 'Days Elapsed',
    akl_days_remaining: 'Working Days Remaining',
    akl_max_duration: 'Max Duration',
    akl_30_workdays: '30 Working Days',
    akl_total_active: 'Active Registrations',
    akl_total_issued: 'AKL Issued',
    akl_avg_duration: 'Avg Duration',
    akl_register_date: 'Registration Date',
    akl_target_date: 'Target Issue Date',
    akl_pipeline_title: 'AKL Registration Pipeline',
    akl_records_title: 'AKL Registration List',
    akl_class_a: 'Class A (Low Risk)',
    akl_class_b: 'Class B (Low-Medium Risk)',
    akl_class_c: 'Class C (Medium-High Risk)',
    akl_class_d: 'Class D (High Risk)',
    akl_advance: 'Advance to Next Stage',
    akl_note: 'Notes',
    akl_within_target: 'On Target',
    akl_overdue: 'Over Target',
    // Improved KPI labels & sub-labels for clarity
    revenue_ytd_sub: 'Realized (won deals)',
    weighted_pipeline_sub: 'Projection: active deals × probability',
    pipeline_value_sub: 'Total value of all active deals',
    win_rate_sub: 'Won from total closed deals',
    revenue_period: 'Jan–May 2026',
    yoy_title: 'Year-over-Year Growth', yoy_subtitle: 'SPH and PO comparison between years',
    yoy_filter_year: 'Year', yoy_filter_all: 'All',
    yoy_sph_2025: 'SPH 2025', yoy_sph_2026: 'SPH 2026',
    yoy_po_2025: 'PO 2025', yoy_po_2026: 'PO 2026',
    yoy_growth: 'Growth',
    bp_title: 'HNTI Business Partners', bp_subtitle: 'Distributor & manufacturer partners',
    bp_country: 'Country', bp_products: 'Products',
    // Incentive Module
    nav_incentive: 'Sales Incentive',
    inc_title: 'Sales Incentive',
    inc_subtitle: 'Reward 1.5% of Net Sales · estimate & realization monitoring',
    inc_my_incentive: 'My Incentive',
    inc_team_incentive: 'Team Incentive',
    inc_total_estimated: 'Total Estimated',
    inc_total_ready: 'Ready to Pay',
    inc_total_paid: 'Paid Out',
    inc_ytd: 'Incentive YTD',
    inc_status_estimated: 'Estimated',
    inc_status_ready: 'Ready to Pay',
    inc_status_paid: 'Paid',
    inc_status_kso_special: 'KSO Special',
    inc_status_kso_first: 'KSO Phase 1 (50%)',
    inc_status_kso_prorata: 'KSO Phase 2 Prorated',
    inc_deal: 'Deal',
    inc_breakdown: 'Calculation Breakdown',
    inc_gross_price: 'Gross Price (Incl. VAT)',
    inc_ppn: 'VAT 11%',
    inc_dpp: 'Taxable Base (DPP)',
    inc_pph23: 'Withholding Tax 23 (2.5% × DPP)',
    inc_ops_cost: 'Project Operational Cost',
    inc_ops_editable: '(default 5%, editable)',
    inc_net_sales: 'Net Sales',
    inc_rate: 'Incentive Rate',
    inc_amount: 'Incentive',
    inc_payment_progress: 'Payment Progress',
    inc_payment_term: 'Payment Term',
    inc_no_dp: 'No DP (Post-BAST)',
    inc_bast_pending: 'Awaiting BAST',
    inc_bast_done: 'BAST Completed',
    inc_save_override: 'Save',
    inc_view_detail: 'Details',
    inc_close: 'Close',
    inc_status_legend: 'Status Legend',
    inc_legend_est: '📊 Estimated · PO issued, awaiting payment',
    inc_legend_ready: '⏳ Ready to Pay · Payment ≥50% (Private) or BAST done (Gov)',
    inc_legend_paid: '✅ Paid · Payment 100% or Gov payment received',
    inc_legend_kso: '🔄 KSO · 50% on first revenue, 50% prorated over 12 months',
    inc_first_revenue: 'First Revenue',
    inc_months_paid: 'Months Paid',
    inc_total_months: 'Total Months',
    inc_leaderboard: 'Sales Incentive Leaderboard',
    inc_office_label: '🎯 HNTI Expansion Fund',
    inc_office_note: 'Incentive from Office account reserved for company expansion fund (R&D manufacturing, investments)',
    // Payment Terms
    pt_label: 'Payment Term',
    pt_cash: 'Cash (Full Payment)',
    pt_dp_1: 'DP + 1x Installment',
    pt_dp_3: 'DP + 3x Installments',
    pt_dp_6: 'DP + 6x Installments',
    pt_dp_12: 'DP + 12x Installments',
    pt_dp_18: 'DP + 18x Installments',
    pt_dp_24: 'DP + 24x Installments',
    pt_dp_36: 'DP + 36x Installments',
    pt_post_bast: 'Post-BAST (100% After Handover)',
    pt_kso_monthly: 'KSO Monthly Revenue Sharing',
    pt_installments: 'Installments',
    pt_installment_count: 'Installment #',
    pt_payment_received_pct: '% Payment Received',
    pt_bast_date: 'BAST Date',
    pt_mark_bast: 'Mark BAST Done',
    // Net Profit Module
    np_title: 'Net Profit Analysis',
    np_subtitle: 'Net profit margin by modality',
    np_total_revenue: 'Revenue YTD',
    np_total_profit: 'Net Profit YTD',
    np_avg_margin: 'Avg Net Margin',
    np_revenue: 'Revenue',
    np_margin: 'Net Margin',
    np_profit: 'Net Profit',
    np_per_modality: 'Net Profit by Modality',
    np_monthly_trend: 'Monthly Net Profit Trend',
    np_per_deal: 'Per Deal Details',
    np_tab_profit: 'Net Profit',
    np_tab_finance: 'AR & Cashflow',
    np_modality_label: 'Modality',
    np_margin_range: 'Range',
    np_default_margin: 'Default %',
    // New Regulatory Tabs
    reg_tab_import: 'Import Permit (BAPETEN)',
    reg_tab_pengalihan: 'Transfer Permit',
    reg_tab_pi: 'Import Approval (PI)',
    // Izin Import BAPETEN
    imp_title: 'BAPETEN Import Permit',
    imp_subtitle: 'Initial permit for new principal · prerequisite for AKL',
    imp_principal: 'Principal',
    imp_product: 'Product',
    imp_stage_pre: 'Pre-Registration',
    imp_stage_docs: 'Document Collection',
    imp_stage_submit: 'Submit to BAPETEN',
    imp_stage_eval: 'BAPETEN Evaluation',
    imp_stage_issued: 'Import Permit Issued',
    imp_total_active: 'Active Registrations',
    imp_total_issued: 'Permits Issued',
    imp_pipeline_title: 'BAPETEN Import Permit Pipeline',
    imp_no: 'Import Permit No.',
    imp_records_title: 'Import Permit Applications',
    imp_advance: 'Advance to Next Stage',
    imp_warning_akl: 'AKL Kemenkes cannot be applied before BAPETEN Import Permit is issued',
    // Izin Pengalihan
    pgl_title: 'BAPETEN Transfer Permit',
    pgl_subtitle: 'Distribution permit after AKL issuance · BAPETEN monitoring per unit',
    pgl_unit: 'Unit',
    pgl_destination: 'Destination',
    pgl_stage_submit: 'Submit',
    pgl_stage_eval: 'Evaluation',
    pgl_stage_issued: 'Permit Issued',
    pgl_total_active: 'Active Transfers',
    pgl_total_issued: 'Permits Issued',
    pgl_records_title: 'Transfer Permit List',
    pgl_pipeline_title: 'Transfer Permit Pipeline',
    pgl_no: 'Transfer Permit No.',
    pgl_advance: 'Advance to Next Stage',
    // Izin Persetujuan Import (PI)
    pi_title: 'Import Approval Permit (PI)',
    pi_subtitle: 'Per shipment for customs clearance · valid 21 working days',
    pi_no: 'PI No.',
    pi_shipment: 'Shipment',
    pi_issued_date: 'PI Issued Date',
    pi_expired_date: 'Expiry Date',
    pi_days_remaining: 'Days Left',
    pi_total_active: 'Active PI',
    pi_total_used: 'Used PI',
    pi_total_expired: 'Expired PI',
    pi_records_title: 'Import Approval List',
    pi_status_active: 'Active',
    pi_status_used: 'Used',
    pi_status_expired: 'Expired',
    pi_warning_expiring: 'PI nearing expiry (≤5 days)',
    pi_principal: 'Principal',
    pi_items: 'Items',
    // CRUD common
    crud_add: 'Add New',
    crud_edit: 'Edit',
    crud_delete: 'Delete',
    crud_save: 'Save',
    crud_cancel: 'Cancel',
    crud_confirm_delete: 'Are you sure to delete this record?',
    crud_required: 'Required',
    crud_saved: 'Saved',
    crud_deleted: 'Deleted successfully',
    crud_pic: 'Person In Charge',
    crud_actions: 'Actions',
    reg_modal_add_import: 'Add Import Permit',
    reg_modal_edit_import: 'Edit Import Permit',
    reg_modal_add_akl: 'Add AKL Kemenkes',
    reg_modal_edit_akl: 'Edit AKL Kemenkes',
    reg_modal_add_bapeten: 'Add BAPETEN Utilization Permit',
    reg_modal_edit_bapeten: 'Edit BAPETEN Utilization Permit',
    reg_modal_add_pengalihan: 'Add Transfer Permit',
    reg_modal_edit_pengalihan: 'Edit Transfer Permit',
    reg_modal_add_pi: 'Add Import Approval (PI)',
    reg_modal_edit_pi: 'Edit Import Approval (PI)',
    // Maintenance CRUD
    mt_modal_add_issue: 'Add Repair/Complaint Report',
    mt_modal_edit_issue: 'Edit Report',
    mt_issue_type: 'Report Type',
    mt_type_repair: 'Equipment Repair',
    mt_type_complaint: 'Customer Complaint',
    mt_unit_label: 'Equipment Unit',
    mt_reported_by: 'Reported By',
    mt_assigned_to: 'Assigned Technician',
    mt_issue_desc: 'Issue Description',
    mt_resolution_note: 'Resolution Notes',
    mt_resolved_date: 'Resolved Date',
    mt_estimated_cost: 'Estimated Cost',
    mt_modal_add_pm: 'Add PM Schedule',
    mt_modal_edit_pm: 'Edit PM Schedule',
    mt_pm_unit: 'Equipment Unit',
    mt_pm_last_date: 'Last PM Date',
    mt_pm_next_date: 'Next PM Date',
    mt_pm_technician: 'PM Technician',
    mt_pm_status: 'PM Status',
    mt_pm_status_scheduled: 'Scheduled',
    mt_pm_status_done: 'Completed',
    mt_pm_status_overdue: 'Overdue',
    mt_pm_notes: 'PM Notes',
    // Operations CRUD
    ops_tab_shipment: 'PO Shipment Status',
    ops_tab_manifest: 'Shipment Manifest',
    ops_tab_customs: 'Customs Documents',
    ops_modal_add_manifest: 'Add Manifest',
    ops_modal_edit_manifest: 'Edit Manifest',
    ops_modal_add_customs: 'Add Customs Document',
    ops_modal_edit_customs: 'Edit Customs Document',
    ops_manifest_no: 'Manifest No.',
    ops_principal_origin: 'Principal / Origin',
    ops_vessel: 'Vessel / Flight',
    ops_container_no: 'Container / AWB No.',
    ops_etd: 'ETD',
    ops_eta: 'ETA',
    ops_port_of_loading: 'Port of Loading',
    ops_port_of_discharge: 'Port of Discharge',
    ops_items_count: 'Items Count',
    ops_total_value: 'Total Value',
    ops_freight_cost: 'Freight Cost',
    ops_insurance: 'Insurance',
    ops_manifest_status: 'Manifest Status',
    ops_status_planning: 'Planning',
    ops_status_loading: 'Loading',
    ops_status_in_transit: 'In Transit',
    ops_status_arrived: 'Arrived',
    ops_status_cleared: 'Cleared',
    ops_doc_no: 'Document No.',
    ops_doc_type: 'Document Type',
    ops_doc_invoice: 'Commercial Invoice',
    ops_doc_packing: 'Packing List',
    ops_doc_bl: 'Bill of Lading',
    ops_doc_coo: 'Certificate of Origin',
    ops_doc_inspection: 'Inspection Certificate',
    ops_doc_pi_bapeten: 'BAPETEN PI',
    ops_doc_pib: 'PIB',
    ops_doc_other: 'Other',
    ops_doc_received: 'Received',
    ops_doc_submitted: 'Submitted',
    ops_doc_approved: 'Approved',
    ops_doc_rejected: 'Rejected',
    ops_doc_date: 'Date',
    ops_doc_file_url: 'File Link',
    ops_doc_status: 'Status',
    ops_shipping_notes: 'Notes',
    ops_total_manifests: 'Total Manifests',
    ops_in_transit: 'In Transit',
    ops_arrived_count: 'Arrived',
    ops_pending_docs: 'Pending Docs',
    // Installation CRUD
    inst_tab_progress: 'PO Installation Progress',
    inst_tab_records: 'Installation Records',
    inst_tab_bast: 'BAST',
    inst_tab_training: 'Training Certificates',
    inst_modal_add_record: 'Add Installation Record',
    inst_modal_edit_record: 'Edit Installation Record',
    inst_modal_add_bast: 'Add BAST',
    inst_modal_edit_bast: 'Edit BAST',
    inst_modal_add_training: 'Add Training Certificate',
    inst_modal_edit_training: 'Edit Training Certificate',
    inst_record_no: 'Record No.',
    inst_install_start: 'Install Start',
    inst_install_end: 'Install End',
    inst_duration: 'Duration (days)',
    inst_lead_technician: 'Lead Technician',
    inst_team_size: 'Team Size',
    inst_room_ready: 'Room Ready',
    inst_electrical_ready: 'Electrical Ready',
    inst_calibration_done: 'Calibration Done',
    inst_status_planning: 'Preparation',
    inst_status_progress: 'In Progress',
    inst_status_completed: 'Completed',
    inst_status_delayed: 'Delayed',
    inst_record_status: 'Installation Status',
    bast_no: 'BAST No.',
    bast_signed_date: 'Signed Date',
    bast_hnti_rep: 'HNTI Representative',
    bast_customer_rep: 'Customer Representative',
    bast_witness: 'Witness',
    bast_doc_url: 'BAST Document Link',
    bast_status_draft: 'Draft',
    bast_status_signed: 'Signed',
    bast_status_pending: 'Pending Signature',
    bast_notes: 'Notes',
    train_cert_no: 'Certificate No.',
    train_session_date: 'Training Date',
    train_participants: 'Participants Count',
    train_instructor: 'Instructor',
    train_duration: 'Duration (hours)',
    train_topics: 'Training Topics',
    train_completed: 'Completed',
    train_pending: 'Pending',
    train_cert_url: 'Certificate Link (PDF)',
    inst_total_records: 'Total Installations',
    inst_in_progress: 'In Progress',
    inst_completed_count: 'Completed',
    inst_bast_signed: 'BAST Signed',
    inst_training_done: 'Training Done',
    // Sales Reporting CRUD
    sr_edit_report: 'Edit Report',
    sr_delete_report: 'Delete Report',
    sr_confirm_delete: 'Are you sure you want to delete this report?',
    sr_updated_success: '✓ Report updated successfully',
    sr_back_to_history: 'Back to History',
    // Common labels needed by modals (only ones not already defined)
    date: 'Date',
    priority: 'Priority',
    technician: 'Technician',
  }
};

// ============== 5 Sales Team — synced with user spec ==============
const SALES_TEAM = [
  { id: 'lukman', name: 'Lukman', initial: 'LK', territory: 'Jateng + DIY B', territoryEn: 'Central Java + DIY B', accent: '#1a6bb0' },
  { id: 'hatim', name: 'Hatim', initial: 'HT', territory: 'Jateng A', territoryEn: 'Central Java A', accent: '#d4780a' },
  { id: 'dwi', name: 'Dwi Wahyudianto', initial: 'DW', territory: 'Jabodetabek + Jabar', territoryEn: 'Jabodetabek + West Java', accent: '#c03030' },
  { id: 'tri', name: 'Tri Sutjahjono', initial: 'TS', territory: 'Jatim 1', territoryEn: 'East Java 1', accent: '#12855a' },
  { id: 'bagus', name: 'Bagus Iswahyudi', initial: 'BI', territory: 'Jatim 2', territoryEn: 'East Java 2', accent: '#7b3fb5' },
  { id: 'office', name: 'HNT Indonesia (Office)', initial: 'HO', territory: 'Nasional', territoryEn: 'Nationwide', accent: '#1a2942', isOffice: true },
];

// Sales IDs to include in bulk generator (include office)
const SALES_IDS_WITH_OFFICE = ['lukman', 'hatim', 'dwi', 'tri', 'bagus', 'office'];

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

// Translation key for new regulatory role
const ROLE_LABEL_REGULATORY_ID = 'Regulatory';

// ============== CORRECTED Seed Data — 72 SPH matching Pak Fajrin's spec ==============
// PRIVATE: 38 (27 RS + 8 klinik + 3 sub-dealer)
// BUMN/TENDER: 7 (3 in tender process)
// GOVERNMENT: 16 (30% presentation_done = 5, 60% presentation_scheduled = 10, 10% ecatalog = 1, +0 = 16)
// KSO: 11 (5 CT 128, 2 MRI 1.5T, 4 ESWL)

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
  // ===== PRIVATE 38 SPH (27 hospital + 8 clinic + 3 sub-dealer) =====
  // 27 hospitals
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
  // 8 clinics
  mk('c1','SPH/2026/C01','Klinik Radiologi Prima Semarang','clinic','private','Mammography','Mammo Digital',1,3800000000,'hatim','Jateng A','presentation_scheduled'),
  mk('c2','SPH/2026/C02','Klinik Imaging Solo','clinic','private','X-Ray','X-Ray Konvensional',1,1200000000,'lukman','Solo','presentation_done'),
  mk('c3','SPH/2026/C03','Klinik Radiologi Hermina Bekasi','clinic','private','X-Ray','X-Ray Digital DR',1,1700000000,'dwi','Jabodetabek','sph_sent'),
  mk('c4','SPH/2026/C04','Klinik Imaging Bandung','clinic','private','CT Scan','CT 16 Slice',1,3500000000,'dwi','Jabar','sph_sent'),
  mk('c5','SPH/2026/C05','Klinik Diagnostika Surabaya','clinic','private','Mammography','Mammo Digital',1,3700000000,'bagus','Jatim 2','sph_sent'),
  mk('c6','SPH/2026/C06','Klinik Pratama Yogya','clinic','private','X-Ray','X-Ray Mobile',1,1500000000,'lukman','DIY','sph_sent'),
  mk('c7','SPH/2026/C07','Klinik Radiologi Cikarang','clinic','private','CT Scan','CT 16 Slice',1,3400000000,'dwi','Jabodetabek','sph_sent'),
  mk('c8','SPH/2026/C08','Klinik Imaging Malang','clinic','private','X-Ray','X-Ray Digital DR',1,1750000000,'tri','Jatim 1','sph_sent'),
  // 3 sub-dealers
  mk('sd1','SPH/2026/SD1','PT Mitra Radiologi Nusantara','subdistributor','private','X-Ray','X-Ray Mobile',3,1850000000,'dwi','Jabodetabek','negotiation',{probability:70}),
  mk('sd2','SPH/2026/SD2','PT Sentra Medika Surabaya','subdistributor','private','C-Arm','C-Arm Surgical',2,2250000000,'bagus','Jatim 2','sph_sent'),
  mk('sd3','SPH/2026/SD3','PT Radindo Medika Bandung','subdistributor','private','X-Ray','X-Ray Digital DR',2,1750000000,'dwi','Jabar','sph_sent'),

  // ===== BUMN/TENDER 7 SPH (3 in tender, 4 earlier stage) =====
  mk('t1','SPH/2026/T01','RS Pertamina Jaya','hospital','tender','CT Scan','CT 128 Slice',1,8500000000,'dwi','Jabodetabek','tender',{tenderSubStage:'bid_opening',probability:55}),
  mk('t2','SPH/2026/T02','RS Pelni','hospital','tender','MRI','MRI 1.5T',1,14000000000,'dwi','Jabodetabek','tender',{tenderSubStage:'aanwijzing',probability:45}),
  mk('t3','SPH/2026/T03','RS Pupuk Kaltim','hospital','tender','C-Arm','C-Arm Surgical',1,2400000000,'dwi','Jabodetabek','tender',{tenderSubStage:'presentation',probability:50}),
  mk('t4','SPH/2026/T04','RS Krakatau Medika','hospital','tender','X-Ray','X-Ray Digital DR',1,1850000000,'dwi','Jabodetabek','sph_sent'),
  mk('t5','SPH/2026/T05','RS PT Antam','hospital','tender','CT Scan','CT 64 Slice',1,6200000000,'bagus','Jatim 2','presentation_scheduled'),
  mk('t6','SPH/2026/T06','RS Semen Padang','hospital','tender','Mammography','Mammo Digital',1,3800000000,'dwi','Jabar','sph_sent'),
  mk('t7','SPH/2026/T07','RS Pertamina Cilacap','hospital','tender','X-Ray','X-Ray Mobile',1,1850000000,'lukman','Jateng','sph_sent'),

  // ===== GOVERNMENT 16 SPH (5 presentation_done + 10 presentation_scheduled + 1 ecatalog) =====
  // 5 presentation_done (30%)
  mk('g1','SPH/2026/G01','RSUD Dr. Soetomo Surabaya','hospital','government','CT Scan','CT 128 Slice',1,8500000000,'bagus','Jatim 2','presentation_done',{probability:55}),
  mk('g2','SPH/2026/G02','RSUD Dr. Sardjito Yogyakarta','hospital','government','MRI','MRI 1.5T',1,14000000000,'lukman','DIY','presentation_done'),
  mk('g3','SPH/2026/G03','RSUD Banyumas','hospital','government','Mammography','Mammo Tomosynthesis',1,5200000000,'lukman','Jateng','presentation_done'),
  mk('g4','SPH/2026/G04','RSUD Dr. Iskak Tulungagung','hospital','government','C-Arm','C-Arm Surgical',1,2400000000,'tri','Jatim 1','presentation_done'),
  mk('g5','SPH/2026/G05','RSUD Dr. Saiful Anwar Malang','hospital','government','CT Scan','CT 64 Slice',1,6200000000,'tri','Jatim 1','presentation_done'),
  // 10 presentation_scheduled (60%)
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
  // 1 ecatalog (10%)
  mk('g16','SPH/2026/G16','RSUD Cirebon','hospital','government','X-Ray','X-Ray Digital DR',1,1850000000,'dwi','Jabar','ecatalog',{notes:'Menunggu klik E-Catalog'}),

  // ===== KSO 11 SPH (5 CT 128 + 2 MRI 1.5T + 4 ESWL) =====
  // 5 CT 128 Slice
  mk('k1','SPH/2026/K01','RS Aminah Blitar','hospital','kso','CT Scan','CT 128 Slice',1,8500000000,'tri','Jatim 1','negotiation',{probability:70,notes:'KSO feasibility ongoing'}),
  mk('k2','SPH/2026/K02','RS Puri Raharja Bali','hospital','kso','CT Scan','CT 128 Slice',1,8400000000,'tri','Jatim 1','presentation_done'),
  mk('k3','SPH/2026/K03','RS Mitra Sehat Klaten','hospital','kso','CT Scan','CT 128 Slice',1,8500000000,'lukman','Jateng','presentation_scheduled'),
  mk('k4','SPH/2026/K04','RS Annisa Tangerang','hospital','kso','CT Scan','CT 128 Slice',1,8500000000,'dwi','Jabodetabek','sph_sent'),
  mk('k5','SPH/2026/K05','RS Permata Hati Tuban','hospital','kso','CT Scan','CT 128 Slice',1,8400000000,'bagus','Jatim 2','sph_sent'),
  // 2 MRI 1.5T
  mk('k6','SPH/2026/K06','RS Husada Utama Surabaya','hospital','kso','MRI','MRI 1.5T',1,14500000000,'bagus','Jatim 2','negotiation',{probability:75,notes:'KSO dengan Orion Medical'}),
  mk('k7','SPH/2026/K07','RS Margono Purwokerto','hospital','kso','MRI','MRI 1.5T',1,14200000000,'lukman','Jateng','presentation_done'),
  // 4 ESWL
  mk('k8','SPH/2026/K08','RS Urologi Surabaya','hospital','kso','ESWL','ESWL Compact',1,4500000000,'bagus','Jatim 2','negotiation',{probability:65}),
  mk('k9','SPH/2026/K09','RS Sumber Waras Cirebon','hospital','kso','ESWL','ESWL Compact',1,4500000000,'dwi','Jabar','presentation_scheduled'),
  mk('k10','SPH/2026/K10','RS PMI Bogor','hospital','kso','ESWL','ESWL Compact',1,4400000000,'dwi','Jabodetabek','sph_sent'),
  mk('k11','SPH/2026/K11','RS Krakatau Medika Cilegon','hospital','kso','ESWL','ESWL Compact',1,4400000000,'dwi','Jabodetabek','sph_sent'),
];

// ============== Business Partners ==============
const BUSINESS_PARTNERS = [
  { id: 'sg', name: 'SG Healthcare', country: 'Korea', flag: '🇰🇷', color: '#1a4d8a', status: 'active',
    products: ['X-Ray Stationary Jumong General', 'X-Ray Mobile Jumong Mobile', 'Flat Panel Detector Jumong Retro', 'C-Arm Garion', 'X-Ray Ceiling Jumong M'] },
  { id: 'anke', name: 'ANKE', country: 'China', flag: '🇨🇳', color: '#c03030', status: 'active',
    products: ['CT 128 Slice Anatom Precision', 'CT 64 Slice Anatom Clarity', 'CT 32 Slice C201', 'MRI 1.5T Supermark 1.5T', 'MRI 0.5T Opemark 5000', 'MRI 0.3T OpenMark III'] },
  { id: 'sino', name: 'SINO MDT', country: 'China', flag: '🇨🇳', color: '#d4780a', status: 'active',
    products: ['Mammography 2D Navigator DRCare', 'Mammography 3D'] },
  { id: 'hyde', name: 'Hyde Medical', country: 'China', flag: '🇨🇳', color: '#7b3fb5', status: 'active',
    products: ['ESWL Tipe 109', 'ESWL Tipe 109X'] },
  { id: 'angell', name: 'Angell', country: 'China', flag: '🇨🇳', color: '#0f7a5a', status: 'onboarding',
    products: ['X-Ray Ceiling Digital (Premium)', 'X-Ray Mobile Digital (Premium)', 'Digital Fluoroscopy (Premium)'] },
  { id: 'innocare', name: 'Innocare', country: 'Taiwan', flag: '🇹🇼', color: '#b8860b', status: 'onboarding',
    products: ['Flat Panel Detector Premium (OEM dengan HAMSKI XR — merek HNTI)'] },
];

// ============== Bulk SPH Generator — 276 SPH 2026 (Jan-May) + 245 SPH 2025 ==============
// Realistic distribution: customer mix, modality mix, stages following funnel logic
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
const REGIONS_BY_SALES = { lukman: 'Jateng+DIY B', hatim: 'Jateng A', dwi: 'Jabodetabek+Jabar', tri: 'Jatim 1', bagus: 'Jatim 2' };

// Deterministic pseudo-random based on seed (so data is consistent on reloads)
function seedRand(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
}

function generateBulkSPH() {
  const rand = seedRand(2026);
  const sphList = [];

  // ========== 2025 Historical SPH (Jan-Dec 2025): ~245 SPH ==========
  // Distribution: 70% private, 12% gov, 8% tender, 10% kso
  // ~58 won (matches 58 installed units), ~25 lost, rest closed out
  const customers2025 = [
    'RS Husada Utama Surabaya', 'RSUD Soewandhie Surabaya', 'RS Mitra Keluarga Tegal',
    'RSUD Tarakan Jakarta', 'RSUD Banyumas', 'RS Premier Bintaro', 'RS Hermina Galaxy',
    'RS Awal Bros Tangerang', 'RSUD Dr Soeselo Slawi', 'RS Panti Wilasa Citarum',
    'RS Sumber Waras Cirebon', 'RS Mitra Plumbon', 'RSUD Salatiga', 'RS Bethesda Yogyakarta',
    'RS Roemani Semarang', 'RSUD Tugurejo Semarang', 'RS Telogorejo Semarang',
    'Klinik Imaging Bandung', 'Klinik Radiologi Cikarang', 'RS Yarsi Bukittinggi',
    'RSUD Klungkung Bali', 'RS BaliMed Denpasar', 'RSUD Banyuwangi',
    'RS Lavalette Malang', 'RSUD Kanjuruhan Malang', 'RS Aminah Blitar',
    'RS Saiful Anwar Malang', 'RSUD Iskak Tulungagung', 'RS Premier Surabaya',
    'RSUD Sidoarjo', 'RS Adi Husada Malang', 'RS William Booth Surabaya',
    'RSUD Tuban', 'RSUD Lamongan', 'RSUD Bojonegoro',
    'RSUD Madiun', 'RSUD Ngawi', 'RS PHC Surabaya', 'RS Bhayangkara Surabaya',
    'RS Brawijaya Tangerang', 'RS Mayapada Jakarta', 'RS Pondok Indah Jakarta',
    'RSUD Pasar Minggu', 'RSUD Koja', 'RS Jantung Harapan Kita',
    'RSUD Cibinong', 'RS Pertamedika Jakarta', 'RS Mitra Keluarga Kelapa Gading',
    'RSUD Karawang', 'RS Hermina Bekasi', 'RSUD Depok',
    'RS Hermina Solo', 'RS Indriati Solo', 'RSUD Karanganyar',
    'RSUD Sragen', 'RS PKU Muhammadiyah Yogyakarta', 'RS Panti Rapih Yogyakarta',
    'RSUD Kebumen', 'RSUD Purworejo', 'RSUD Magelang', 'RSUD Temanggung',
    'RSUD Wonosobo', 'RSUD Cilacap', 'RSUD Banjarnegara', 'RSUD Purbalingga',
  ];

  for (let i = 0; i < 245; i++) {
    const cust = customers2025[i % customers2025.length] + (i > customers2025.length ? ' II' : '');
    const r = rand();
    const ptype = r < 0.70 ? 'private' : r < 0.82 ? 'government' : r < 0.90 ? 'tender' : 'kso';
    const ct = ptype === 'kso' || cust.startsWith('RS') ? 'hospital' : (r > 0.85 ? 'clinic' : 'hospital');
    const prod = PRODUCT_CATALOG[Math.floor(rand() * PRODUCT_CATALOG.length)];
    const qty = rand() < 0.85 ? 1 : 2;
    // 2025 outcomes: 58 won, ~25 lost, rest active/closed
    const outcome = i < 58 ? 'won' : i < 83 ? 'lost' : (rand() < 0.5 ? 'won' : 'lost');
    const stage = outcome === 'won' ? 'po_issued' : 'lost';
    const month = Math.floor(rand() * 12) + 1;
    const day = Math.floor(rand() * 28) + 1;
    sphList.push({
      id: `sph2025_${i}`, sphNo: `SPH/2025/${String(i + 1).padStart(3, '0')}`,
      customer: cust, customerType: ct, projectType: ptype,
      modality: prod.mod, subModality: prod.sub, partner: prod.partner,
      qty, unitPrice: prod.price, totalValue: qty * prod.price,
      issuedDate: `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      salesOwner: SALES_IDS[Math.floor(rand() * SALES_IDS.length)],
      region: '', status: outcome, stage,
      probability: outcome === 'won' ? 100 : 0,
      notes: '', nextAction: '-', lastUpdate: '2025-12-31',
      poStatus: outcome === 'won' ? 'issued' : null,
      dpPaid: outcome === 'won', finalPaid: outcome === 'won' && rand() < 0.85,
      shippingStatus: outcome === 'won' ? 'delivered' : null,
      customsStatus: outcome === 'won' ? 'released' : null,
      installationStatus: outcome === 'won' ? 'installed' : null,
    });
  }

  // ========== 2026 Jan-May: 276 SPH ==========
  // 22 PO issued, all invoiced, 90% DP paid
  // 60% of PO units installed, rest in production at factory
  const customers2026 = [
    ...customers2025,
    'RSUD Wonosari', 'RSUD Bantul', 'RSUD Sleman', 'RS JIH Yogyakarta',
    'RS Permata Hati Tuban', 'RS Mitra Sehat Klaten', 'RS Charlie Madiun',
    'RS Annisa Tangerang', 'RS Pertamina Cilacap', 'RS Pelni Jakarta',
    'RS Krakatau Medika Cilegon', 'RS PMI Bogor', 'RS Sumber Waras Cirebon',
    'RS Urologi Surabaya', 'RS Margono Purwokerto', 'RS Mardi Rahayu Kudus',
    'RS Pondok Indah Bintaro', 'Klinik Imaging Solo', 'Klinik Radiologi Prima',
    'RSUD Cirebon', 'RSUD Tegal', 'RSUD Pati', 'RSUD Pasuruan',
    'RSUD Kabupaten Bekasi', 'RS Husada Utama Surabaya', 'RS Telogorejo Semarang',
  ];

  let poCount = 0;
  for (let i = 0; i < 276; i++) {
    const cust = customers2026[i % customers2026.length] + (i > customers2026.length ? ' (Cab. ' + Math.floor(i/customers2026.length) + ')' : '');
    const r = rand();
    const ptype = r < 0.65 ? 'private' : r < 0.82 ? 'government' : r < 0.92 ? 'tender' : 'kso';
    const ct = (r > 0.80 && ptype === 'private') ? 'clinic' : (r > 0.93 ? 'subdistributor' : 'hospital');
    const prod = PRODUCT_CATALOG[Math.floor(rand() * PRODUCT_CATALOG.length)];
    const qty = rand() < 0.88 ? 1 : 2;

    // Stage distribution following funnel logic
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

    const month = Math.floor(rand() * 5) + 1; // Jan-May
    const day = Math.floor(rand() * 28) + 1;
    const isPO = stage === 'po_issued';
    const dpPaid = isPO && rand() < 0.90; // 90% of PO have DP paid
    const installed = isPO && rand() < 0.60; // 60% installed
    sphList.push({
      id: `sph2026_${i}`, sphNo: `SPH/2026/${String(i + 100).padStart(3, '0')}`,
      customer: cust, customerType: ct, projectType: ptype,
      modality: prod.mod, subModality: prod.sub, partner: prod.partner,
      qty, unitPrice: prod.price, totalValue: qty * prod.price,
      issuedDate: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      salesOwner: SALES_IDS[Math.floor(rand() * SALES_IDS.length)],
      region: '', status, stage,
      probability,
      notes: '', nextAction: '-', lastUpdate: '2026-05-12',
      poStatus: isPO ? 'issued' : null,
      dpPaid, finalPaid: false,
      shippingStatus: isPO ? (installed ? 'delivered' : 'plan_order') : null,
      customsStatus: isPO ? (installed ? 'released' : null) : null,
      installationStatus: installed ? 'installed' : null,
    });
  }

  return sphList;
}

// Combine: original 72 detailed + bulk generated
const BULK_SPH = generateBulkSPH();

// ============== HNTI Office Deals (CEO Personal Closings) ==============
// Special accounts handled directly by Fajrin (CEO). Mostly group hospitals at Tier-1 cities.
// Total contribution: 8 deals, ~Rp 130 miliar (slightly below Tri Sutjahjono at Rp 142B / 9 deals)
const HNTI_OFFICE_SPH = [
  // 2025: 4 deals won (closed by CEO)
  { id: 'office_2025_001', sphNo: 'SPH/2025/HO-01',
    customer: 'RS Mayapada Tangerang', customerType: 'hospital', projectType: 'private',
    modality: 'MRI', subModality: 'MRI 1.5T Supermark', partner: 'ANKE',
    qty: 1, unitPrice: 22500000000, totalValue: 22500000000,
    issuedDate: '2025-03-18', salesOwner: 'office', region: 'Jabodetabek',
    status: 'won', stage: 'po_issued', probability: 100,
    notes: 'Special account · MRI 1.5T untuk Mayapada Group. Closing oleh CEO.',
    nextAction: '-', lastUpdate: '2025-04-25',
    poStatus: 'issued', dpPaid: true, finalPaid: true,
    shippingStatus: 'delivered', customsStatus: 'released',
    installationStatus: 'installed', installation_done: true, functionTest: true,
    exposureTest: true, trainingCert: true, bapetenPermit: true,
    paymentTerm: 'dp_3', paymentReceivedPct: 100 },
  { id: 'office_2025_002', sphNo: 'SPH/2025/HO-02',
    customer: 'RS Hermina Kemayoran', customerType: 'hospital', projectType: 'private',
    modality: 'CT Scan', subModality: 'CT 128 Slice Anatom Precision', partner: 'ANKE',
    qty: 1, unitPrice: 14500000000, totalValue: 14500000000,
    issuedDate: '2025-05-22', salesOwner: 'office', region: 'Jabodetabek',
    status: 'won', stage: 'po_issued', probability: 100,
    notes: 'Hermina Group expansion · CT 128 Slice. Personal closing CEO.',
    nextAction: '-', lastUpdate: '2025-06-30',
    poStatus: 'issued', dpPaid: true, finalPaid: true,
    shippingStatus: 'delivered', customsStatus: 'released',
    installationStatus: 'installed', installation_done: true, functionTest: true,
    exposureTest: true, trainingCert: true, bapetenPermit: true,
    paymentTerm: 'dp_6', paymentReceivedPct: 100 },
  { id: 'office_2025_003', sphNo: 'SPH/2025/HO-03',
    customer: 'RS Siloam Lippo Village', customerType: 'hospital', projectType: 'private',
    modality: 'CT Scan', subModality: 'CT 64 Slice Anatom Clarity', partner: 'ANKE',
    qty: 2, unitPrice: 9800000000, totalValue: 19600000000,
    issuedDate: '2025-08-14', salesOwner: 'office', region: 'Jabodetabek',
    status: 'won', stage: 'po_issued', probability: 100,
    notes: 'Siloam Hospitals Group · 2 unit CT 64 untuk Lippo Village & Karawaci.',
    nextAction: '-', lastUpdate: '2025-09-20',
    poStatus: 'issued', dpPaid: true, finalPaid: true,
    shippingStatus: 'delivered', customsStatus: 'released',
    installationStatus: 'installed', installation_done: true, functionTest: true,
    exposureTest: true, trainingCert: true, bapetenPermit: true,
    paymentTerm: 'dp_12', paymentReceivedPct: 100 },
  { id: 'office_2025_004', sphNo: 'SPH/2025/HO-04',
    customer: 'RS Mitra Keluarga Kemayoran', customerType: 'hospital', projectType: 'private',
    modality: 'C-Arm', subModality: 'C-Arm Garion', partner: 'ANKE',
    qty: 2, unitPrice: 4500000000, totalValue: 9000000000,
    issuedDate: '2025-10-08', salesOwner: 'office', region: 'Jabodetabek',
    status: 'won', stage: 'po_issued', probability: 100,
    notes: 'Mitra Keluarga Group · 2 unit C-Arm untuk OK Center upgrade.',
    nextAction: '-', lastUpdate: '2025-11-15',
    poStatus: 'issued', dpPaid: true, finalPaid: true,
    shippingStatus: 'delivered', customsStatus: 'released',
    installationStatus: 'installed', installation_done: true, functionTest: true,
    exposureTest: true, trainingCert: true, bapetenPermit: true,
    paymentTerm: 'dp_3', paymentReceivedPct: 100 },

  // 2026: 4 deals (mix of won, PO issued, active)
  { id: 'office_2026_001', sphNo: 'SPH/2026/HO-01',
    customer: 'RS Pondok Indah Bintaro', customerType: 'hospital', projectType: 'private',
    modality: 'MRI', subModality: 'MRI 1.5T Supermark', partner: 'ANKE',
    qty: 1, unitPrice: 23500000000, totalValue: 23500000000,
    issuedDate: '2026-01-25', salesOwner: 'office', region: 'Jabodetabek',
    status: 'won', stage: 'po_issued', probability: 100,
    notes: 'Pondok Indah Group · MRI 1.5T upgrade. Direct deal CEO ke Direktur RS.',
    nextAction: 'Installation Maret 2026', lastUpdate: '2026-02-28',
    poStatus: 'issued', dpPaid: true, finalPaid: true,
    shippingStatus: 'delivered', customsStatus: 'released',
    installationStatus: 'installed', installation_done: true, functionTest: true,
    exposureTest: true, trainingCert: true, bapetenPermit: true,
    paymentTerm: 'dp_6', paymentReceivedPct: 100 },
  { id: 'office_2026_002', sphNo: 'SPH/2026/HO-02',
    customer: 'RS Premier Jatinegara', customerType: 'hospital', projectType: 'private',
    modality: 'CT Scan', subModality: 'CT 128 Slice Anatom Precision', partner: 'ANKE',
    qty: 1, unitPrice: 15800000000, totalValue: 15800000000,
    issuedDate: '2026-03-12', salesOwner: 'office', region: 'Jabodetabek',
    status: 'won', stage: 'po_issued', probability: 100,
    notes: 'Premier Group expansion · CT 128 Slice. Closing pribadi CEO.',
    nextAction: 'Shipping Mei 2026', lastUpdate: '2026-04-20',
    poStatus: 'issued', dpPaid: true, finalPaid: false,
    shippingStatus: 'on_shipment', customsStatus: 'ongoing',
    installationStatus: null,
    paymentTerm: 'dp_12', paymentReceivedPct: 60 },
  { id: 'office_2026_003', sphNo: 'SPH/2026/HO-03',
    customer: 'RS Eka Hospital BSD', customerType: 'hospital', projectType: 'private',
    modality: 'Mammography', subModality: 'Mammography Navigator DRCare', partner: 'SINO MDT',
    qty: 1, unitPrice: 6200000000, totalValue: 6200000000,
    issuedDate: '2026-04-08', salesOwner: 'office', region: 'Jabodetabek',
    status: 'won', stage: 'po_issued', probability: 100,
    notes: 'Eka Hospital · Mammography untuk Women Health Center. Direct CEO closing.',
    nextAction: 'Shipping Juni 2026', lastUpdate: '2026-05-10',
    poStatus: 'issued', dpPaid: true, finalPaid: false,
    shippingStatus: 'ready_to_ship', customsStatus: null,
    installationStatus: null,
    paymentTerm: 'dp_3', paymentReceivedPct: 35 },
  { id: 'office_2026_004', sphNo: 'SPH/2026/HO-04',
    customer: 'RS Mayapada Kuningan', customerType: 'hospital', projectType: 'private',
    modality: 'CT Scan', subModality: 'CT 64 Slice Anatom Clarity', partner: 'ANKE',
    qty: 1, unitPrice: 10500000000, totalValue: 10500000000,
    issuedDate: '2026-05-05', salesOwner: 'office', region: 'Jabodetabek',
    status: 'active', stage: 'sph_sent', probability: 75,
    notes: 'Mayapada Group · second deal 2026. Sedang final negotiation.',
    nextAction: 'Follow up 20 Mei 2026', lastUpdate: '2026-05-14',
    poStatus: null, dpPaid: false, finalPaid: false,
    shippingStatus: null, customsStatus: null,
    installationStatus: null,
    paymentTerm: 'dp_6', paymentReceivedPct: 0 },
  // Additional ACTIVE deals for HNTI Office (CEO personal pipeline) — Target ratio 2.5× Revenue
  { id: 'office_2026_005', sphNo: 'SPH/2026/HO-05',
    customer: 'RS Siloam Karawaci', customerType: 'hospital', projectType: 'private',
    modality: 'MRI', subModality: 'MRI 1.5T Supermark', partner: 'ANKE',
    qty: 1, unitPrice: 24500000000, totalValue: 24500000000,
    issuedDate: '2026-04-22', salesOwner: 'office', region: 'Jabodetabek',
    status: 'active', stage: 'negotiation', probability: 70,
    notes: 'Siloam Group · MRI 1.5T expansion untuk Siloam Karawaci. Final nego CEO ke board.',
    nextAction: 'Final price lock 25 Mei 2026', lastUpdate: '2026-05-12',
    poStatus: null, dpPaid: false, finalPaid: false,
    shippingStatus: null, customsStatus: null,
    installationStatus: null,
    paymentTerm: 'dp_12', paymentReceivedPct: 0 },
  { id: 'office_2026_006', sphNo: 'SPH/2026/HO-06',
    customer: 'RS Hermina Bekasi Timur', customerType: 'hospital', projectType: 'private',
    modality: 'CT Scan', subModality: 'CT 128 Slice Anatom Precision', partner: 'ANKE',
    qty: 1, unitPrice: 15200000000, totalValue: 15200000000,
    issuedDate: '2026-03-28', salesOwner: 'office', region: 'Jabodetabek',
    status: 'active', stage: 'presentation_done', probability: 55,
    notes: 'Hermina Group expansion · CT 128 untuk Hermina Bekasi Timur. Presentasi sudah dilakukan.',
    nextAction: 'Follow up direksi Hermina Group 22 Mei', lastUpdate: '2026-05-08',
    poStatus: null, dpPaid: false, finalPaid: false,
    shippingStatus: null, customsStatus: null,
    installationStatus: null,
    paymentTerm: 'dp_6', paymentReceivedPct: 0 },
  { id: 'office_2026_007', sphNo: 'SPH/2026/HO-07',
    customer: 'RS Pondok Indah Puri Indah', customerType: 'hospital', projectType: 'private',
    modality: 'CT Scan', subModality: 'CT 64 Slice Anatom Clarity', partner: 'ANKE',
    qty: 1, unitPrice: 10800000000, totalValue: 10800000000,
    issuedDate: '2026-04-15', salesOwner: 'office', region: 'Jabodetabek',
    status: 'active', stage: 'presentation_scheduled', probability: 35,
    notes: 'Pondok Indah Group · CT 64 untuk cabang Puri Indah. Presentasi dijadwalkan akhir Mei.',
    nextAction: 'Presentasi 28 Mei 2026', lastUpdate: '2026-05-15',
    poStatus: null, dpPaid: false, finalPaid: false,
    shippingStatus: null, customsStatus: null,
    installationStatus: null,
    paymentTerm: 'dp_12', paymentReceivedPct: 0 },
  { id: 'office_2026_008', sphNo: 'SPH/2026/HO-08',
    customer: 'RS Mayapada Lebak Bulus', customerType: 'hospital', projectType: 'private',
    modality: 'Mammography', subModality: 'Mammography Navigator DRCare', partner: 'SINO MDT',
    qty: 1, unitPrice: 6500000000, totalValue: 6500000000,
    issuedDate: '2026-05-02', salesOwner: 'office', region: 'Jabodetabek',
    status: 'active', stage: 'sph_sent', probability: 25,
    notes: 'Mayapada Group · second branch (Lebak Bulus). SPH baru dikirim, menunggu respons.',
    nextAction: 'Follow up 25 Mei 2026', lastUpdate: '2026-05-12',
    poStatus: null, dpPaid: false, finalPaid: false,
    shippingStatus: null, customsStatus: null,
    installationStatus: null,
    paymentTerm: 'dp_6', paymentReceivedPct: 0 },
  { id: 'office_2026_009', sphNo: 'SPH/2026/HO-09',
    customer: 'RS Mitra Keluarga Bintaro', customerType: 'hospital', projectType: 'private',
    modality: 'C-Arm', subModality: 'C-Arm Garion', partner: 'ANKE',
    qty: 1, unitPrice: 4700000000, totalValue: 4700000000,
    issuedDate: '2026-05-10', salesOwner: 'office', region: 'Jabodetabek',
    status: 'active', stage: 'sph_sent', probability: 25,
    notes: 'Mitra Keluarga Group · C-Arm untuk Bintaro branch upgrade OK.',
    nextAction: 'Follow up 26 Mei 2026', lastUpdate: '2026-05-14',
    poStatus: null, dpPaid: false, finalPaid: false,
    shippingStatus: null, customsStatus: null,
    installationStatus: null,
    paymentTerm: 'dp_3', paymentReceivedPct: 0 },
  // Additional high-value active deals to reach Pipeline ~2.5× Revenue
  { id: 'office_2026_010', sphNo: 'SPH/2026/HO-10',
    customer: 'RS Premier Surabaya Citra Garden', customerType: 'hospital', projectType: 'private',
    modality: 'MRI', subModality: 'MRI 1.5T Supermark', partner: 'ANKE',
    qty: 1, unitPrice: 23800000000, totalValue: 23800000000,
    issuedDate: '2026-03-15', salesOwner: 'office', region: 'Surabaya',
    status: 'active', stage: 'negotiation', probability: 75,
    notes: 'Premier Group · ekspansi cabang Surabaya. CEO direct deal dengan COO Premier Group.',
    nextAction: 'Final approval board Premier 30 Mei', lastUpdate: '2026-05-16',
    poStatus: null, dpPaid: false, finalPaid: false,
    shippingStatus: null, customsStatus: null,
    installationStatus: null,
    paymentTerm: 'dp_12', paymentReceivedPct: 0 },
  { id: 'office_2026_011', sphNo: 'SPH/2026/HO-11',
    customer: 'RS Hermina Solo', customerType: 'hospital', projectType: 'private',
    modality: 'MRI', subModality: 'MRI 1.5T Supermark', partner: 'ANKE',
    qty: 1, unitPrice: 22500000000, totalValue: 22500000000,
    issuedDate: '2026-02-20', salesOwner: 'office', region: 'Solo',
    status: 'active', stage: 'presentation_done', probability: 55,
    notes: 'Hermina Group · cabang Solo expansion. CEO closing langsung dengan board Hermina.',
    nextAction: 'Demo MRI on-site Hermina HQ 5 Juni', lastUpdate: '2026-05-13',
    poStatus: null, dpPaid: false, finalPaid: false,
    shippingStatus: null, customsStatus: null,
    installationStatus: null,
    paymentTerm: 'dp_6', paymentReceivedPct: 0 },
  { id: 'office_2026_012', sphNo: 'SPH/2026/HO-12',
    customer: 'RS Mayapada Bandung', customerType: 'hospital', projectType: 'private',
    modality: 'CT Scan', subModality: 'CT 128 Slice Anatom Precision', partner: 'ANKE',
    qty: 1, unitPrice: 16500000000, totalValue: 16500000000,
    issuedDate: '2026-04-08', salesOwner: 'office', region: 'Bandung',
    status: 'active', stage: 'negotiation', probability: 70,
    notes: 'Mayapada Group · Bandung branch CT 128. Negotiation tahap final dengan direksi.',
    nextAction: 'Lock-in price meeting 23 Mei', lastUpdate: '2026-05-15',
    poStatus: null, dpPaid: false, finalPaid: false,
    shippingStatus: null, customsStatus: null,
    installationStatus: null,
    paymentTerm: 'dp_12', paymentReceivedPct: 0 },
  { id: 'office_2026_013', sphNo: 'SPH/2026/HO-13',
    customer: 'RS Siloam Manado', customerType: 'hospital', projectType: 'private',
    modality: 'CT Scan', subModality: 'CT 64 Slice Anatom Clarity', partner: 'ANKE',
    qty: 1, unitPrice: 11200000000, totalValue: 11200000000,
    issuedDate: '2026-04-25', salesOwner: 'office', region: 'Manado',
    status: 'active', stage: 'presentation_scheduled', probability: 35,
    notes: 'Siloam Group · ekspansi cabang Manado. Presentasi dijadwalkan awal Juni.',
    nextAction: 'Presentasi tim Siloam HQ 3 Juni', lastUpdate: '2026-05-14',
    poStatus: null, dpPaid: false, finalPaid: false,
    shippingStatus: null, customsStatus: null,
    installationStatus: null,
    paymentTerm: 'dp_6', paymentReceivedPct: 0 },
  { id: 'office_2026_014', sphNo: 'SPH/2026/HO-14',
    customer: 'RS Eka Hospital Pekanbaru', customerType: 'hospital', projectType: 'private',
    modality: 'C-Arm', subModality: 'C-Arm Garion', partner: 'ANKE',
    qty: 1, unitPrice: 4800000000, totalValue: 4800000000,
    issuedDate: '2026-05-12', salesOwner: 'office', region: 'Pekanbaru',
    status: 'active', stage: 'sph_sent', probability: 20,
    notes: 'Eka Hospital · cabang Pekanbaru OK Center upgrade.',
    nextAction: 'Follow up 30 Mei 2026', lastUpdate: '2026-05-17',
    poStatus: null, dpPaid: false, finalPaid: false,
    shippingStatus: null, customsStatus: null,
    installationStatus: null,
    paymentTerm: 'dp_3', paymentReceivedPct: 0 },
  { id: 'office_2026_015', sphNo: 'SPH/2026/HO-15',
    customer: 'RS Pondok Indah Bintaro Jaya', customerType: 'hospital', projectType: 'private',
    modality: 'MRI', subModality: 'MRI 1.5T Supermark', partner: 'ANKE',
    qty: 1, unitPrice: 25500000000, totalValue: 25500000000,
    issuedDate: '2026-03-05', salesOwner: 'office', region: 'Tangerang Selatan',
    status: 'active', stage: 'negotiation', probability: 75,
    notes: 'Pondok Indah Group · MRI premium 1.5T high-spec untuk cabang Bintaro Jaya. CEO direct deal.',
    nextAction: 'Sign LOI dengan direksi Pondok Indah 2 Juni', lastUpdate: '2026-05-17',
    poStatus: null, dpPaid: false, finalPaid: false,
    shippingStatus: null, customsStatus: null,
    installationStatus: null,
    paymentTerm: 'dp_12', paymentReceivedPct: 0 },
  { id: 'office_2026_016', sphNo: 'SPH/2026/HO-16',
    customer: 'RS Mitra Keluarga Surabaya', customerType: 'hospital', projectType: 'private',
    modality: 'CT Scan', subModality: 'CT 128 Slice Anatom Precision', partner: 'ANKE',
    qty: 1, unitPrice: 15800000000, totalValue: 15800000000,
    issuedDate: '2026-04-18', salesOwner: 'office', region: 'Surabaya',
    status: 'active', stage: 'presentation_done', probability: 55,
    notes: 'Mitra Keluarga Group · CT 128 untuk cabang Surabaya. Sudah presentasi, follow up board.',
    nextAction: 'Board meeting Mitra Keluarga 6 Juni', lastUpdate: '2026-05-16',
    poStatus: null, dpPaid: false, finalPaid: false,
    shippingStatus: null, customsStatus: null,
    installationStatus: null,
    paymentTerm: 'dp_6', paymentReceivedPct: 0 },
];

const ALL_SPH = [...SEED_SPH, ...BULK_SPH, ...HNTI_OFFICE_SPH];

// ============== Seed Field Reports (Laporan Lapangan untuk semua Sales) ==============
// Detail naratif yang realistis untuk demo go-live, periode Jan-Mei 2026 (~20 minggu)
const SEED_FIELD_REPORTS = [
  // ============= LUKMAN (Jateng + DIY B) ==============
  { id: 'rpt_lk_w1', salesId: 'lukman', date: '2026-01-10', week: 'Minggu 2',
    days: 5, nights: 4, area: 'Solo Kota + Sukoharjo + Karanganyar',
    visits: [
      { name: 'RS PKU Muhammadiyah Solo', city: 'Solo', visit: 'first', product: 'CT Scan', pipeline: 'warm', contact: 'dr. Hendra, Sp.Rad', note: 'Tertarik upgrade CT 64 ke CT 128' },
      { name: 'RS Kasih Ibu Solo', city: 'Solo', visit: 'followup', product: 'X-Ray', pipeline: 'warm', contact: 'Bu Anita (Logistik)', note: 'Minta presentasi detail spek Jumong' },
      { name: 'RSUD Karanganyar', city: 'Karanganyar', visit: 'first', product: 'C-Arm', pipeline: 'cold', contact: 'Bpk. Yusuf', note: 'Survey kebutuhan OK Center' },
      { name: 'RS Indriati Solo Baru', city: 'Sukoharjo', visit: 'followup', product: 'Mammography', pipeline: 'hot', contact: 'dr. Wulandari, Sp.Rad(K)', note: 'Sudah present, masuk anggaran 2026' },
    ],
    pipeN: 3, pipeVal: 18500000000, closest: 'RS Indriati Solo Baru',
    totalCost: 2350000, block: 'Snowing di Tawangmangu, kunjungan RSUD Karanganyar mundur 1 hari',
    win: 'RS Indriati Solo Baru sudah masuk anggaran 2026 untuk Mammography, target closing Q1',
    next: 'Follow up RS PKU Muhammadiyah Solo, kirim proposal CT 128 detail spek',
    fatigue: 2, createdAt: '2026-01-11T08:30:00.000Z' },

  { id: 'rpt_lk_w2', salesId: 'lukman', date: '2026-01-17', week: 'Minggu 3',
    days: 4, nights: 3, area: 'Yogyakarta Selatan + Bantul',
    visits: [
      { name: 'RS Bethesda Yogyakarta', city: 'Yogyakarta', visit: 'followup', product: 'MRI', pipeline: 'hot', contact: 'dr. Sigit, Sp.Rad', note: 'Diskusi spek MRI 1.5T vs 3T' },
      { name: 'RS Panti Rapih', city: 'Yogyakarta', visit: 'first', product: 'CT Scan', pipeline: 'warm', contact: 'Bu Ratna (Direksi)', note: 'Pertemuan awal, akan ada follow-up dengan tim radiologi' },
      { name: 'RSUD Wonosari', city: 'Gunungkidul', visit: 'first', product: 'X-Ray', pipeline: 'cold', contact: 'Bpk. Sutarto', note: 'RSUD baru, sedang setup ruang radiologi' },
    ],
    pipeN: 2, pipeVal: 25000000000, closest: 'RS Bethesda Yogyakarta',
    totalCost: 1980000, block: 'Hujan deras di Bantul, akses jalan licin',
    win: 'RS Bethesda confirm interest MRI 1.5T, scheduling demo Februari',
    next: 'Coordinate demo MRI dengan tim ANKE, prepare loan calculator',
    fatigue: 3, createdAt: '2026-01-18T19:00:00.000Z' },

  { id: 'rpt_lk_w3', salesId: 'lukman', date: '2026-01-24', week: 'Minggu 4',
    days: 5, nights: 4, area: 'Klaten + Boyolali + Salatiga',
    visits: [
      { name: 'RS Cakra Husada Klaten', city: 'Klaten', visit: 'first', product: 'C-Arm', pipeline: 'warm', contact: 'dr. Imam, Sp.B', note: 'Tertarik C-Arm Garion untuk OK ortho' },
      { name: 'RSUD Boyolali', city: 'Boyolali', visit: 'followup', product: 'X-Ray', pipeline: 'warm', contact: 'Pak Hardi', note: 'Sudah masuk RKA-D 2026, target tender Q2' },
      { name: 'RSUD Salatiga', city: 'Salatiga', visit: 'closed', product: 'X-Ray', pipeline: 'hot', contact: 'dr. Endang', note: 'PO RKAS sudah terbit untuk 2 unit X-Ray DR' },
      { name: 'RS Permata Boyolali', city: 'Boyolali', visit: 'first', product: 'Mammography', pipeline: 'cold', contact: 'Bu Siska', note: 'Diskusi awal kebutuhan women health' },
    ],
    pipeN: 3, pipeVal: 8500000000, closest: 'RSUD Salatiga',
    totalCost: 2150000, block: '-',
    win: 'PO RSUD Salatiga sudah terbit untuk 2 unit X-Ray Jumong (closing 8.5M)',
    next: 'Process PO RSUD Salatiga ke admin, koordinasi delivery dengan ops',
    fatigue: 1, createdAt: '2026-01-25T20:00:00.000Z' },

  { id: 'rpt_lk_w4', salesId: 'lukman', date: '2026-02-07', week: 'Minggu 1',
    days: 4, nights: 3, area: 'Magelang + Temanggung',
    visits: [
      { name: 'RSUD Tidar Magelang', city: 'Magelang', visit: 'followup', product: 'CT Scan', pipeline: 'hot', contact: 'dr. Bagas, Sp.Rad', note: 'Sudah keluar HPS untuk CT 64, follow tender' },
      { name: 'RS Aisyiyah Muntilan', city: 'Magelang', visit: 'first', product: 'X-Ray', pipeline: 'cold', contact: 'Pak Ridwan', note: 'Pertemuan awal direktur' },
      { name: 'RSUD Temanggung', city: 'Temanggung', visit: 'followup', product: 'C-Arm', pipeline: 'warm', contact: 'Bu Naning', note: 'Menunggu approval Pemkab' },
    ],
    pipeN: 2, pipeVal: 14000000000, closest: 'RSUD Tidar Magelang',
    totalCost: 1850000, block: 'Tender RSUD Tidar mundur 2 minggu karena revisi DPA',
    win: 'RSUD Tidar sudah keluar HPS Rp 9.2M untuk CT 64',
    next: 'Pasang strategi tender RSUD Tidar, koordinasi dengan partner ANKE',
    fatigue: 2, createdAt: '2026-02-08T18:30:00.000Z' },

  { id: 'rpt_lk_w5', salesId: 'lukman', date: '2026-02-21', week: 'Minggu 3',
    days: 5, nights: 4, area: 'Cilacap + Banyumas + Purbalingga',
    visits: [
      { name: 'RSUD Cilacap', city: 'Cilacap', visit: 'followup', product: 'MRI', pipeline: 'warm', contact: 'dr. Wirawan, Sp.Rad', note: 'Direksi confirm 2026 anggaran MRI' },
      { name: 'RSUD Banyumas', city: 'Banyumas', visit: 'closed', product: 'X-Ray', pipeline: 'hot', contact: 'Bu Endang (Logistik)', note: 'PO X-Ray sudah terbit, koordinasi instalasi' },
      { name: 'RS Hermina Purwokerto', city: 'Banyumas', visit: 'first', product: 'CT Scan', pipeline: 'cold', contact: 'dr. Yoga', note: 'Hermina Group, perlu approval pusat' },
      { name: 'RSUD Purbalingga', city: 'Purbalingga', visit: 'followup', product: 'C-Arm', pipeline: 'warm', contact: 'Pak Hardiyanto', note: 'Tender Maret 2026' },
    ],
    pipeN: 3, pipeVal: 21500000000, closest: 'RSUD Banyumas',
    totalCost: 2480000, block: 'Akses jalan Wangon-Cilacap macet karena perbaikan',
    win: 'PO RSUD Banyumas X-Ray Stationary terbit',
    next: 'Koordinasi instalasi RSUD Banyumas dengan tim teknisi',
    fatigue: 3, createdAt: '2026-02-22T19:00:00.000Z' },

  { id: 'rpt_lk_w6', salesId: 'lukman', date: '2026-03-07', week: 'Minggu 1',
    days: 5, nights: 4, area: 'Pekalongan + Tegal + Brebes',
    visits: [
      { name: 'RS Hermina Pekalongan', city: 'Pekalongan', visit: 'followup', product: 'MRI', pipeline: 'hot', contact: 'dr. Ratih, Sp.Rad', note: 'Presentation full team, demo MRI 1.5T' },
      { name: 'RSUD Bendan Pekalongan', city: 'Pekalongan', visit: 'first', product: 'CT Scan', pipeline: 'cold', contact: 'Pak Joko', note: 'RSUD baru renovasi, kebutuhan CT belum diputuskan' },
      { name: 'RS Mitra Keluarga Tegal', city: 'Tegal', visit: 'followup', product: 'C-Arm', pipeline: 'warm', contact: 'Bu Sri', note: 'Menunggu approval Mitra Group Pusat' },
      { name: 'RSUD Brebes', city: 'Brebes', visit: 'followup', product: 'X-Ray', pipeline: 'hot', contact: 'dr. Ahmad', note: 'Tender April 2026' },
    ],
    pipeN: 4, pipeVal: 32500000000, closest: 'RS Hermina Pekalongan',
    totalCost: 2680000, block: '-',
    win: 'RS Hermina Pekalongan request lock-in price untuk MRI 1.5T, target PO Maret',
    next: 'Prepare lock-in price proposal RS Hermina Pekalongan',
    fatigue: 2, createdAt: '2026-03-08T20:30:00.000Z' },

  { id: 'rpt_lk_w7', salesId: 'lukman', date: '2026-04-04', week: 'Minggu 1',
    days: 4, nights: 3, area: 'Yogyakarta Tengah + Sleman',
    visits: [
      { name: 'RS Bethesda Yogyakarta', city: 'Yogyakarta', visit: 'closed', product: 'MRI', pipeline: 'hot', contact: 'dr. Sigit, Sp.Rad', note: 'PO MRI 1.5T terbit, Rp 23M' },
      { name: 'RS PKU Muhammadiyah Bantul', city: 'Bantul', visit: 'first', product: 'X-Ray', pipeline: 'cold', contact: 'Bu Lestari', note: 'Survey kebutuhan radiologi' },
      { name: 'RS Sardjito (RSUP)', city: 'Sleman', visit: 'followup', product: 'CT Scan', pipeline: 'warm', contact: 'Prof. Bambang', note: 'High-end CT 256 slice, butuh approval Direktur Utama' },
    ],
    pipeN: 2, pipeVal: 38000000000, closest: 'RS Bethesda Yogyakarta',
    totalCost: 2100000, block: '-',
    win: '🎉 BIG WIN: PO MRI 1.5T RS Bethesda Yogyakarta terbit Rp 23M',
    next: 'Coordinate shipping & instalasi MRI Bethesda dengan tim ops',
    fatigue: 1, createdAt: '2026-04-05T21:00:00.000Z' },

  { id: 'rpt_lk_w8', salesId: 'lukman', date: '2026-04-18', week: 'Minggu 3',
    days: 5, nights: 4, area: 'Wonosobo + Banjarnegara + Kebumen',
    visits: [
      { name: 'RSUD Wonosobo', city: 'Wonosobo', visit: 'followup', product: 'CT Scan', pipeline: 'warm', contact: 'dr. Setiawan', note: 'Tender Mei 2026, masuk anggaran APBD' },
      { name: 'RSUD Banjarnegara', city: 'Banjarnegara', visit: 'first', product: 'X-Ray', pipeline: 'cold', contact: 'Pak Tri', note: 'Survey awal radiologi RSUD' },
      { name: 'RS PKU Muhammadiyah Gombong', city: 'Kebumen', visit: 'followup', product: 'C-Arm', pipeline: 'warm', contact: 'dr. Hasan', note: 'Tertarik C-Arm Garion 2.4kW' },
    ],
    pipeN: 3, pipeVal: 16500000000, closest: 'RSUD Wonosobo',
    totalCost: 2380000, block: 'Akses ke Wonosobo terhambat longsor di Dieng',
    win: 'RSUD Wonosobo confirm tender CT 64, schedule pengumuman Mei 2026',
    next: 'Koordinasi tender RSUD Wonosobo, prepare HPS strategy',
    fatigue: 3, createdAt: '2026-04-19T20:00:00.000Z' },

  { id: 'rpt_lk_w9', salesId: 'lukman', date: '2026-05-02', week: 'Minggu 1',
    days: 4, nights: 3, area: 'Klaten + Sragen',
    visits: [
      { name: 'RSUD Bagas Waras Klaten', city: 'Klaten', visit: 'first', product: 'X-Ray', pipeline: 'cold', contact: 'Pak Heri', note: 'RSUD baru, butuh full equipment radiologi' },
      { name: 'RSUD Sragen', city: 'Sragen', visit: 'followup', product: 'CT Scan', pipeline: 'warm', contact: 'Bu Tina', note: 'Anggaran 2026 sudah ACC, tender Juni' },
      { name: 'RS Cakra Husada Klaten', city: 'Klaten', visit: 'closed', product: 'C-Arm', pipeline: 'hot', contact: 'dr. Imam, Sp.B', note: 'PO C-Arm Garion terbit Rp 4.5M' },
    ],
    pipeN: 2, pipeVal: 12500000000, closest: 'RS Cakra Husada Klaten',
    totalCost: 1750000, block: '-',
    win: 'PO C-Arm Garion RS Cakra Husada Klaten terbit',
    next: 'Process PO Cakra Husada ke admin, target shipping Mei',
    fatigue: 1, createdAt: '2026-05-03T19:00:00.000Z' },

  { id: 'rpt_lk_w10', salesId: 'lukman', date: '2026-05-09', week: 'Minggu 2',
    days: 3, nights: 2, area: 'Solo + Karanganyar (revisit)',
    visits: [
      { name: 'RS PKU Muhammadiyah Solo', city: 'Solo', visit: 'followup', product: 'CT Scan', pipeline: 'hot', contact: 'dr. Hendra, Sp.Rad', note: 'Final negotiation CT 128, target PO Juni' },
      { name: 'RS Indriati Solo Baru', city: 'Sukoharjo', visit: 'closed', product: 'Mammography', pipeline: 'hot', contact: 'dr. Wulandari, Sp.Rad(K)', note: 'PO Mammography Navigator DRCare terbit Rp 6.2M' },
    ],
    pipeN: 1, pipeVal: 14500000000, closest: 'RS Indriati Solo Baru',
    totalCost: 1450000, block: '-',
    win: 'PO RS Indriati Solo Baru Mammography terbit + closing CT 128 PKU Muh Solo dekat',
    next: 'Final push RS PKU Muh Solo untuk CT 128, target PO sebelum 25 Mei',
    fatigue: 1, createdAt: '2026-05-10T18:30:00.000Z' },

  // ============= HATIM (Jateng A) ==============
  { id: 'rpt_ht_w1', salesId: 'hatim', date: '2026-01-13', week: 'Minggu 2',
    days: 4, nights: 3, area: 'Semarang Kota + Demak',
    visits: [
      { name: 'RSUD Tugurejo Semarang', city: 'Semarang', visit: 'followup', product: 'CT Scan', pipeline: 'hot', contact: 'dr. Bayu, Sp.Rad', note: 'Anggaran ACC, tender Februari' },
      { name: 'RS Roemani Semarang', city: 'Semarang', visit: 'first', product: 'X-Ray', pipeline: 'warm', contact: 'Bu Mardiyah', note: 'Diskusi spek X-Ray Digital' },
      { name: 'RSUD Sunan Kalijaga Demak', city: 'Demak', visit: 'followup', product: 'C-Arm', pipeline: 'warm', contact: 'Pak Eko', note: 'Anggaran 2026 untuk OK' },
      { name: 'RS Telogorejo Semarang', city: 'Semarang', visit: 'first', product: 'MRI', pipeline: 'cold', contact: 'dr. Andi, Sp.Rad', note: 'Survey awal untuk MRI baru' },
    ],
    pipeN: 3, pipeVal: 28500000000, closest: 'RSUD Tugurejo Semarang',
    totalCost: 1850000, block: 'Banjir rob di Semarang Utara, akses RS terhambat',
    win: 'RSUD Tugurejo confirm tender CT 128 di Februari 2026',
    next: 'Prepare tender strategy RSUD Tugurejo, lock-in spec dengan ANKE',
    fatigue: 2, createdAt: '2026-01-14T19:30:00.000Z' },

  { id: 'rpt_ht_w2', salesId: 'hatim', date: '2026-01-27', week: 'Minggu 4',
    days: 5, nights: 4, area: 'Kudus + Pati + Rembang',
    visits: [
      { name: 'RSUD Kudus', city: 'Kudus', visit: 'first', product: 'CT Scan', pipeline: 'cold', contact: 'Pak Wahyu', note: 'Survey awal, RSUD baru renovasi' },
      { name: 'RS Mardi Rahayu Kudus', city: 'Kudus', visit: 'followup', product: 'X-Ray', pipeline: 'warm', contact: 'Bu Linda', note: 'Tertarik upgrade X-Ray ke DR' },
      { name: 'RSUD Pati', city: 'Pati', visit: 'followup', product: 'C-Arm', pipeline: 'hot', contact: 'dr. Susilo', note: 'Tender Februari sudah disiapkan' },
      { name: 'RSUD Rembang', city: 'Rembang', visit: 'first', product: 'Mammography', pipeline: 'cold', contact: 'Bu Astuti', note: 'Diskusi awal women health' },
    ],
    pipeN: 3, pipeVal: 11500000000, closest: 'RSUD Pati',
    totalCost: 2280000, block: '-',
    win: 'RSUD Pati siap tender C-Arm Garion Februari, HPS sudah keluar',
    next: 'Prepare bidding document RSUD Pati, koordinasi tim Tender',
    fatigue: 2, createdAt: '2026-01-28T19:00:00.000Z' },

  { id: 'rpt_ht_w3', salesId: 'hatim', date: '2026-02-14', week: 'Minggu 2',
    days: 4, nights: 3, area: 'Semarang Selatan + Ungaran',
    visits: [
      { name: 'RSUD Tugurejo Semarang', city: 'Semarang', visit: 'closed', product: 'CT Scan', pipeline: 'hot', contact: 'dr. Bayu, Sp.Rad', note: 'Menang tender CT 128! PO Rp 14.5M' },
      { name: 'RS Hermina Pandanaran', city: 'Semarang', visit: 'first', product: 'MRI', pipeline: 'cold', contact: 'dr. Yanto', note: 'Hermina Group, perlu approval pusat' },
      { name: 'RSUD Ungaran', city: 'Semarang', visit: 'followup', product: 'X-Ray', pipeline: 'warm', contact: 'Pak Joko', note: 'Anggaran 2026, target Q2' },
    ],
    pipeN: 2, pipeVal: 19500000000, closest: 'RSUD Tugurejo Semarang',
    totalCost: 1680000, block: '-',
    win: '🎉 MENANG TENDER CT 128 RSUD Tugurejo Semarang Rp 14.5M',
    next: 'Process kontrak RSUD Tugurejo, koordinasi LOI dengan admin',
    fatigue: 1, createdAt: '2026-02-15T20:00:00.000Z' },

  { id: 'rpt_ht_w4', salesId: 'hatim', date: '2026-02-28', week: 'Minggu 4',
    days: 5, nights: 4, area: 'Kendal + Batang + Pekalongan (overlap)',
    visits: [
      { name: 'RSUD Kendal', city: 'Kendal', visit: 'first', product: 'CT Scan', pipeline: 'cold', contact: 'dr. Riyanto', note: 'Survey awal kebutuhan CT' },
      { name: 'RSUD Batang', city: 'Batang', visit: 'followup', product: 'X-Ray', pipeline: 'warm', contact: 'Bu Sumarni', note: 'Tender Maret 2026' },
      { name: 'RS Bhayangkara Semarang', city: 'Semarang', visit: 'first', product: 'C-Arm', pipeline: 'cold', contact: 'AKBP dr. Hendra', note: 'Pertemuan awal' },
    ],
    pipeN: 2, pipeVal: 10500000000, closest: 'RSUD Batang',
    totalCost: 2150000, block: 'Mobil mogok di Kendal-Batang, lost 4 jam',
    win: '-', next: 'Follow up RSUD Batang minggu depan, prepare tender doc',
    fatigue: 3, createdAt: '2026-03-01T19:00:00.000Z' },

  { id: 'rpt_ht_w5', salesId: 'hatim', date: '2026-03-21', week: 'Minggu 3',
    days: 4, nights: 3, area: 'Semarang Pusat (revisit) + Salatiga',
    visits: [
      { name: 'RS Telogorejo Semarang', city: 'Semarang', visit: 'followup', product: 'MRI', pipeline: 'hot', contact: 'dr. Andi, Sp.Rad', note: 'Final negotiation MRI 1.5T' },
      { name: 'RS Banyumanik Semarang', city: 'Semarang', visit: 'first', product: 'X-Ray', pipeline: 'cold', contact: 'Bu Risma', note: 'Pertemuan awal Direktur' },
      { name: 'RS Pantiwilasa Dr. Cipto', city: 'Semarang', visit: 'followup', product: 'CT Scan', pipeline: 'warm', contact: 'dr. Wibisono', note: 'Tertarik CT 64 Slice' },
    ],
    pipeN: 2, pipeVal: 24500000000, closest: 'RS Telogorejo Semarang',
    totalCost: 1620000, block: '-',
    win: 'RS Telogorejo final negotiation MRI, expected PO April',
    next: 'Close deal MRI Telogorejo, prepare BAST schedule',
    fatigue: 2, createdAt: '2026-03-22T18:00:00.000Z' },

  { id: 'rpt_ht_w6', salesId: 'hatim', date: '2026-04-11', week: 'Minggu 2',
    days: 5, nights: 4, area: 'Jepara + Kudus (revisit)',
    visits: [
      { name: 'RSUD Kelet Jepara', city: 'Jepara', visit: 'first', product: 'X-Ray', pipeline: 'cold', contact: 'Pak Yudi', note: 'Survey kebutuhan radiologi' },
      { name: 'RS Mardi Rahayu Kudus', city: 'Kudus', visit: 'closed', product: 'X-Ray', pipeline: 'hot', contact: 'Bu Linda', note: 'PO X-Ray DR terbit Rp 2.8M' },
      { name: 'RSUD RA Kartini Jepara', city: 'Jepara', visit: 'followup', product: 'C-Arm', pipeline: 'warm', contact: 'dr. Suparno', note: 'Tender Mei 2026' },
    ],
    pipeN: 2, pipeVal: 8500000000, closest: 'RS Mardi Rahayu Kudus',
    totalCost: 2380000, block: '-',
    win: 'PO X-Ray RS Mardi Rahayu Kudus terbit',
    next: 'Process kontrak Mardi Rahayu, follow up RSUD Jepara',
    fatigue: 2, createdAt: '2026-04-12T19:30:00.000Z' },

  { id: 'rpt_ht_w7', salesId: 'hatim', date: '2026-05-09', week: 'Minggu 2',
    days: 4, nights: 3, area: 'Semarang Utara + Tegal',
    visits: [
      { name: 'RS Bhakti Wira Tamtama', city: 'Semarang', visit: 'followup', product: 'CT Scan', pipeline: 'hot', contact: 'Letkol dr. Yusuf', note: 'BAST CT 128 sudah selesai bulan lalu' },
      { name: 'RS St. Elizabeth Semarang', city: 'Semarang', visit: 'first', product: 'MRI', pipeline: 'cold', contact: 'dr. Catarina', note: 'Pertemuan awal kebutuhan' },
      { name: 'RS Mitra Keluarga Tegal', city: 'Tegal', visit: 'closed', product: 'C-Arm', pipeline: 'hot', contact: 'Bu Sri', note: 'PO C-Arm Garion terbit Rp 4.2M' },
    ],
    pipeN: 1, pipeVal: 22000000000, closest: 'RS Mitra Keluarga Tegal',
    totalCost: 1880000, block: '-',
    win: 'PO C-Arm RS Mitra Keluarga Tegal terbit + RS Bhakti Wira Tamtama BAST OK',
    next: 'Follow up RS St. Elizabeth Semarang untuk MRI proposal',
    fatigue: 1, createdAt: '2026-05-10T20:00:00.000Z' },

  // ============= DWI (Jabodetabek + Jabar) ==============
  { id: 'rpt_dw_w1', salesId: 'dwi', date: '2026-01-15', week: 'Minggu 3',
    days: 5, nights: 0, area: 'Jakarta Selatan + Tangerang',
    visits: [
      { name: 'RS Pondok Indah Jakarta', city: 'Jakarta Selatan', visit: 'followup', product: 'MRI', pipeline: 'hot', contact: 'dr. Reza, Sp.Rad', note: 'Final negotiation MRI 1.5T' },
      { name: 'RS Awal Bros Tangerang', city: 'Tangerang', visit: 'followup', product: 'CT Scan', pipeline: 'warm', contact: 'Bu Andini', note: 'Tertarik CT 128 baru' },
      { name: 'RS Brawijaya Saharjo', city: 'Jakarta Selatan', visit: 'first', product: 'X-Ray', pipeline: 'cold', contact: 'Pak Burhan', note: 'Pertemuan awal' },
      { name: 'RS Premier Jatinegara', city: 'Jakarta Timur', visit: 'followup', product: 'CT Scan', pipeline: 'hot', contact: 'dr. Mariana', note: 'Bidding tender private' },
    ],
    pipeN: 3, pipeVal: 42500000000, closest: 'RS Pondok Indah Jakarta',
    totalCost: 1250000, block: 'Macet parah Jakarta-Tangerang, kunjungan mundur 1.5 jam',
    win: 'RS Pondok Indah Jakarta confirm budget MRI 2026',
    next: 'Final closing RS Pondok Indah MRI 1.5T, prepare contract draft',
    fatigue: 2, createdAt: '2026-01-16T20:00:00.000Z' },

  { id: 'rpt_dw_w2', salesId: 'dwi', date: '2026-01-30', week: 'Minggu 4',
    days: 5, nights: 0, area: 'Bekasi + Karawang',
    visits: [
      { name: 'RS Hermina Galaxy Bekasi', city: 'Bekasi', visit: 'closed', product: 'CT Scan', pipeline: 'hot', contact: 'dr. Fitri, Sp.Rad', note: 'PO CT 64 Slice Anatom Clarity terbit Rp 9.8M' },
      { name: 'RSUD Karawang', city: 'Karawang', visit: 'first', product: 'X-Ray', pipeline: 'cold', contact: 'Pak Surya', note: 'Survey awal kebutuhan radiologi' },
      { name: 'RS Mitra Keluarga Bekasi', city: 'Bekasi', visit: 'followup', product: 'C-Arm', pipeline: 'warm', contact: 'Bu Maya', note: 'Tertarik C-Arm Garion' },
      { name: 'RSUD Cikampek', city: 'Karawang', visit: 'first', product: 'Mammography', pipeline: 'cold', contact: 'dr. Helmi', note: 'Diskusi women health center' },
    ],
    pipeN: 3, pipeVal: 12500000000, closest: 'RS Hermina Galaxy Bekasi',
    totalCost: 1380000, block: '-',
    win: 'PO CT 64 RS Hermina Galaxy Bekasi terbit Rp 9.8M',
    next: 'Process kontrak Hermina Galaxy, koordinasi instalasi',
    fatigue: 2, createdAt: '2026-01-31T19:00:00.000Z' },

  { id: 'rpt_dw_w3', salesId: 'dwi', date: '2026-02-13', week: 'Minggu 2',
    days: 5, nights: 0, area: 'Jakarta Pusat + Jakarta Utara',
    visits: [
      { name: 'RSCM (Cipto Mangunkusumo)', city: 'Jakarta Pusat', visit: 'first', product: 'CT Scan', pipeline: 'cold', contact: 'Prof. dr. Anggraini', note: 'Pertemuan awal, RSCM butuh CT 256 high-end' },
      { name: 'RS Pelni', city: 'Jakarta Barat', visit: 'followup', product: 'MRI', pipeline: 'warm', contact: 'dr. Susanto', note: 'Tertarik MRI 1.5T' },
      { name: 'RS Atma Jaya Jakarta', city: 'Jakarta Utara', visit: 'first', product: 'X-Ray', pipeline: 'cold', contact: 'Bu Rina', note: 'Survey kebutuhan' },
      { name: 'RSUD Tarakan Jakarta', city: 'Jakarta Pusat', visit: 'followup', product: 'C-Arm', pipeline: 'hot', contact: 'dr. Wibowo', note: 'Tender Maret 2026, anggaran ACC' },
    ],
    pipeN: 3, pipeVal: 38500000000, closest: 'RSUD Tarakan Jakarta',
    totalCost: 1180000, block: 'Demo MRI di RS Pelni delay karena dokter Sp.Rad meeting RUPS',
    win: 'RSUD Tarakan confirm tender C-Arm Maret 2026',
    next: 'Prepare bidding doc RSUD Tarakan Jakarta',
    fatigue: 1, createdAt: '2026-02-14T19:30:00.000Z' },

  { id: 'rpt_dw_w4', salesId: 'dwi', date: '2026-03-06', week: 'Minggu 1',
    days: 5, nights: 1, area: 'Bandung + Cimahi',
    visits: [
      { name: 'RS Borromeus Bandung', city: 'Bandung', visit: 'followup', product: 'MRI', pipeline: 'hot', contact: 'dr. Susanto, Sp.Rad', note: 'Final demo MRI Mei' },
      { name: 'RS Hasan Sadikin (RSHS)', city: 'Bandung', visit: 'first', product: 'CT Scan', pipeline: 'cold', contact: 'Prof. dr. Hendra', note: 'RSHS high-end, butuh CT 256' },
      { name: 'RSUD Cibabat Cimahi', city: 'Cimahi', visit: 'followup', product: 'X-Ray', pipeline: 'warm', contact: 'Pak Yusup', note: 'Anggaran 2026, target tender Q2' },
      { name: 'RS Santo Yusup Bandung', city: 'Bandung', visit: 'first', product: 'C-Arm', pipeline: 'cold', contact: 'Bu Theresia', note: 'Pertemuan awal' },
    ],
    pipeN: 3, pipeVal: 32500000000, closest: 'RS Borromeus Bandung',
    totalCost: 2350000, block: 'Akses tol Cipularang macet, akses Bandung 4 jam',
    win: 'RS Borromeus confirm demo MRI Mei + RSHS interest CT 256',
    next: 'Schedule demo MRI RS Borromeus, prepare proposal CT 256 RSHS',
    fatigue: 2, createdAt: '2026-03-07T20:30:00.000Z' },

  { id: 'rpt_dw_w5', salesId: 'dwi', date: '2026-03-27', week: 'Minggu 4',
    days: 4, nights: 0, area: 'Depok + Bogor',
    visits: [
      { name: 'RSUD Cibinong', city: 'Bogor', visit: 'closed', product: 'CT Scan', pipeline: 'hot', contact: 'Bu Endah (Logistik)', note: 'BAST CT 32 sudah, payment SPM diterima' },
      { name: 'RS Hermina Depok', city: 'Depok', visit: 'followup', product: 'MRI', pipeline: 'warm', contact: 'dr. Wulan', note: 'Tertarik MRI 1.5T' },
      { name: 'RSUD Kota Bogor', city: 'Bogor', visit: 'first', product: 'X-Ray', pipeline: 'cold', contact: 'Pak Hendra', note: 'Survey awal' },
    ],
    pipeN: 2, pipeVal: 25500000000, closest: 'RSUD Cibinong',
    totalCost: 1450000, block: '-',
    win: 'Payment SPM RSUD Cibinong CT 32 sudah diterima',
    next: 'Follow up RS Hermina Depok untuk demo MRI',
    fatigue: 1, createdAt: '2026-03-28T19:00:00.000Z' },

  { id: 'rpt_dw_w6', salesId: 'dwi', date: '2026-04-17', week: 'Minggu 3',
    days: 5, nights: 0, area: 'Tangerang Selatan + Serang',
    visits: [
      { name: 'RS Premier Bintaro', city: 'Tangerang Selatan', visit: 'followup', product: 'MRI', pipeline: 'hot', contact: 'dr. Ratna, Sp.Rad', note: 'BAST MRI sudah, payment lancar' },
      { name: 'RSUD Tangerang Selatan', city: 'Tangerang Selatan', visit: 'first', product: 'CT Scan', pipeline: 'cold', contact: 'Pak Wahyu', note: 'Pertemuan awal' },
      { name: 'RSUD Serang', city: 'Serang', visit: 'followup', product: 'C-Arm', pipeline: 'warm', contact: 'dr. Iwan', note: 'Tender Mei 2026' },
      { name: 'RS Eka Hospital BSD', city: 'Tangerang Selatan', visit: 'first', product: 'X-Ray', pipeline: 'cold', contact: 'Bu Damayanti', note: 'Eka Hospital expansion plan' },
    ],
    pipeN: 3, pipeVal: 18500000000, closest: 'RS Premier Bintaro',
    totalCost: 1850000, block: '-',
    win: 'RS Premier Bintaro MRI BAST OK, payment received Rp 22M',
    next: 'Follow up RSUD Serang tender C-Arm, prepare bidding doc',
    fatigue: 1, createdAt: '2026-04-18T19:30:00.000Z' },

  { id: 'rpt_dw_w7', salesId: 'dwi', date: '2026-05-08', week: 'Minggu 2',
    days: 5, nights: 1, area: 'Sukabumi + Cianjur + Garut',
    visits: [
      { name: 'RSUD Sukabumi', city: 'Sukabumi', visit: 'first', product: 'CT Scan', pipeline: 'cold', contact: 'Pak Asep', note: 'Survey awal' },
      { name: 'RSUD Cianjur', city: 'Cianjur', visit: 'followup', product: 'X-Ray', pipeline: 'warm', contact: 'Bu Yati', note: 'Anggaran 2026 ACC' },
      { name: 'RS Hermina Sukabumi', city: 'Sukabumi', visit: 'first', product: 'C-Arm', pipeline: 'cold', contact: 'dr. Endang', note: 'Hermina Group, perlu approval' },
      { name: 'RSUD Slamet Garut', city: 'Garut', visit: 'first', product: 'Mammography', pipeline: 'cold', contact: 'dr. Hadi', note: 'Diskusi women health' },
    ],
    pipeN: 2, pipeVal: 14500000000, closest: 'RSUD Cianjur',
    totalCost: 2680000, block: 'Akses Cianjur-Garut macet karena perbaikan jalan',
    win: '-', next: 'Follow up RSUD Cianjur X-Ray tender',
    fatigue: 3, createdAt: '2026-05-09T20:00:00.000Z' },

  // ============= TRI (Jatim 1) ==============
  { id: 'rpt_ts_w1', salesId: 'tri', date: '2026-01-09', week: 'Minggu 2',
    days: 5, nights: 4, area: 'Surabaya + Sidoarjo',
    visits: [
      { name: 'RS Husada Utama Surabaya', city: 'Surabaya', visit: 'followup', product: 'C-Arm', pipeline: 'hot', contact: 'dr. Anton, Sp.B', note: 'Tertarik C-Arm Garion 2.4kW' },
      { name: 'RSUD Soewandhie Surabaya', city: 'Surabaya', visit: 'followup', product: 'CT Scan', pipeline: 'warm', contact: 'Bu Tina', note: 'Tender Februari 2026' },
      { name: 'RS Premier Surabaya', city: 'Surabaya', visit: 'first', product: 'MRI', pipeline: 'cold', contact: 'dr. Lestari', note: 'Pertemuan awal Direktur' },
      { name: 'RSUD Sidoarjo', city: 'Sidoarjo', visit: 'followup', product: 'X-Ray', pipeline: 'warm', contact: 'Pak Heru', note: 'Anggaran 2026 ACC' },
    ],
    pipeN: 3, pipeVal: 22500000000, closest: 'RS Husada Utama Surabaya',
    totalCost: 1950000, block: 'Hujan deras Surabaya, akses Sidoarjo banjir',
    win: 'RS Husada Utama Surabaya confirm budget C-Arm 2026',
    next: 'Close deal C-Arm RS Husada Utama, prepare contract',
    fatigue: 2, createdAt: '2026-01-10T19:00:00.000Z' },

  { id: 'rpt_ts_w2', salesId: 'tri', date: '2026-01-23', week: 'Minggu 4',
    days: 5, nights: 4, area: 'Malang + Pasuruan',
    visits: [
      { name: 'RSUD Saiful Anwar Malang', city: 'Malang', visit: 'first', product: 'MRI', pipeline: 'cold', contact: 'Prof. dr. Budi', note: 'RSUD provinsi, butuh MRI high-end' },
      { name: 'RS Lavalette Malang', city: 'Malang', visit: 'followup', product: 'CT Scan', pipeline: 'hot', contact: 'dr. Yanti, Sp.Rad', note: 'Final negotiation CT 64' },
      { name: 'RSUD Bangil Pasuruan', city: 'Pasuruan', visit: 'first', product: 'X-Ray', pipeline: 'cold', contact: 'Pak Suparno', note: 'Survey awal' },
      { name: 'RS Aisyiyah Malang', city: 'Malang', visit: 'first', product: 'C-Arm', pipeline: 'cold', contact: 'Bu Wahyuni', note: 'Pertemuan awal' },
    ],
    pipeN: 3, pipeVal: 32500000000, closest: 'RS Lavalette Malang',
    totalCost: 2350000, block: '-',
    win: 'RS Lavalette Malang final neg CT 64, PO target Februari',
    next: 'Close RS Lavalette CT 64, follow up RSUD Saiful Anwar',
    fatigue: 2, createdAt: '2026-01-24T20:00:00.000Z' },

  { id: 'rpt_ts_w3', salesId: 'tri', date: '2026-02-13', week: 'Minggu 2',
    days: 5, nights: 4, area: 'Surabaya Selatan + Gresik',
    visits: [
      { name: 'RS Husada Utama Surabaya', city: 'Surabaya', visit: 'closed', product: 'C-Arm', pipeline: 'hot', contact: 'dr. Anton, Sp.B', note: 'PO C-Arm Garion 2.4kW terbit Rp 4.5M' },
      { name: 'RSUD Ibnu Sina Gresik', city: 'Gresik', visit: 'first', product: 'CT Scan', pipeline: 'cold', contact: 'dr. Hasanah', note: 'KSO opportunity, butuh detailed proposal' },
      { name: 'RS Petrokimia Gresik', city: 'Gresik', visit: 'first', product: 'X-Ray', pipeline: 'cold', contact: 'Pak Joko', note: 'RS BUMN, butuh proses tender' },
      { name: 'RS Lavalette Malang', city: 'Malang', visit: 'closed', product: 'CT Scan', pipeline: 'hot', contact: 'dr. Yanti, Sp.Rad', note: 'PO CT 64 terbit Rp 9.8M' },
    ],
    pipeN: 2, pipeVal: 35000000000, closest: 'RS Husada Utama Surabaya',
    totalCost: 2280000, block: '-',
    win: '🎉 DOUBLE WIN: PO RS Husada Utama (C-Arm) + RS Lavalette Malang (CT 64) = Rp 14.3M',
    next: 'Process 2 PO + prepare proposal KSO RSUD Ibnu Sina Gresik',
    fatigue: 1, createdAt: '2026-02-14T20:30:00.000Z' },

  { id: 'rpt_ts_w4', salesId: 'tri', date: '2026-03-04', week: 'Minggu 1',
    days: 4, nights: 3, area: 'Mojokerto + Jombang',
    visits: [
      { name: 'RSUD Mojokerto', city: 'Mojokerto', visit: 'followup', product: 'CT Scan', pipeline: 'warm', contact: 'dr. Sugiyanto', note: 'Anggaran 2026 ACC, target tender April' },
      { name: 'RS Hermina Mojokerto', city: 'Mojokerto', visit: 'first', product: 'MRI', pipeline: 'cold', contact: 'dr. Lina', note: 'Hermina Group expansion' },
      { name: 'RSUD Jombang', city: 'Jombang', visit: 'followup', product: 'C-Arm', pipeline: 'warm', contact: 'Pak Hendra', note: 'Tender Mei 2026' },
    ],
    pipeN: 2, pipeVal: 19500000000, closest: 'RSUD Mojokerto',
    totalCost: 1850000, block: '-',
    win: 'RSUD Mojokerto confirm tender CT 64 April 2026',
    next: 'Prepare tender RSUD Mojokerto, koordinasi spec dengan ANKE',
    fatigue: 1, createdAt: '2026-03-05T19:00:00.000Z' },

  { id: 'rpt_ts_w5', salesId: 'tri', date: '2026-03-20', week: 'Minggu 3',
    days: 5, nights: 4, area: 'Surabaya (revisit) + Lamongan',
    visits: [
      { name: 'RSUD Soewandhie Surabaya', city: 'Surabaya', visit: 'closed', product: 'CT Scan', pipeline: 'hot', contact: 'Bu Tina', note: 'Menang tender! PO CT 128 Rp 14.8M' },
      { name: 'RSUD Lamongan', city: 'Lamongan', visit: 'first', product: 'X-Ray', pipeline: 'cold', contact: 'Pak Ridwan', note: 'Survey awal' },
      { name: 'RS Surabaya Medical Service', city: 'Surabaya', visit: 'first', product: 'Mammography', pipeline: 'cold', contact: 'dr. Tuti', note: 'Diskusi women health center' },
    ],
    pipeN: 2, pipeVal: 11500000000, closest: 'RSUD Soewandhie Surabaya',
    totalCost: 2150000, block: '-',
    win: '🎉 MENANG TENDER CT 128 RSUD Soewandhie Surabaya Rp 14.8M',
    next: 'Process kontrak RSUD Soewandhie, koordinasi tim implementasi',
    fatigue: 1, createdAt: '2026-03-21T20:00:00.000Z' },

  { id: 'rpt_ts_w6', salesId: 'tri', date: '2026-04-10', week: 'Minggu 2',
    days: 5, nights: 4, area: 'Surabaya Utara + Madura',
    visits: [
      { name: 'RS Premier Surabaya', city: 'Surabaya', visit: 'followup', product: 'MRI', pipeline: 'hot', contact: 'dr. Lestari', note: 'Final negotiation MRI 1.5T' },
      { name: 'RSUD Bangkalan Madura', city: 'Bangkalan', visit: 'first', product: 'CT Scan', pipeline: 'cold', contact: 'Pak Suprapto', note: 'RSUD provinsi Madura' },
      { name: 'RSUD Sumenep', city: 'Sumenep', visit: 'first', product: 'X-Ray', pipeline: 'cold', contact: 'dr. Mahmud', note: 'Survey awal' },
      { name: 'RS Mata Undaan Surabaya', city: 'Surabaya', visit: 'first', product: 'C-Arm', pipeline: 'cold', contact: 'dr. Aji', note: 'RS Mata specialist, butuh C-Arm khusus' },
    ],
    pipeN: 3, pipeVal: 28500000000, closest: 'RS Premier Surabaya',
    totalCost: 2680000, block: 'Penyeberangan Jembatan Suramadu padat',
    win: 'RS Premier Surabaya confirm MRI 1.5T close in Mei',
    next: 'Final closing RS Premier Surabaya MRI',
    fatigue: 2, createdAt: '2026-04-11T20:30:00.000Z' },

  { id: 'rpt_ts_w7', salesId: 'tri', date: '2026-04-24', week: 'Minggu 4',
    days: 4, nights: 3, area: 'Probolinggo + Lumajang',
    visits: [
      { name: 'RSUD dr. Mohamad Saleh Probolinggo', city: 'Probolinggo', visit: 'first', product: 'CT Scan', pipeline: 'cold', contact: 'Pak Bambang', note: 'Survey kebutuhan CT' },
      { name: 'RSUD Lumajang', city: 'Lumajang', visit: 'followup', product: 'X-Ray', pipeline: 'warm', contact: 'Bu Nani', note: 'Anggaran 2026 ACC' },
      { name: 'RS Wijaya Kusuma Lumajang', city: 'Lumajang', visit: 'first', product: 'C-Arm', pipeline: 'cold', contact: 'dr. Wahyu', note: 'Pertemuan awal' },
    ],
    pipeN: 2, pipeVal: 8500000000, closest: 'RSUD Lumajang',
    totalCost: 1880000, block: '-',
    win: 'RSUD Lumajang confirm tender X-Ray Mei 2026',
    next: 'Prepare bidding doc RSUD Lumajang',
    fatigue: 2, createdAt: '2026-04-25T19:00:00.000Z' },

  { id: 'rpt_ts_w8', salesId: 'tri', date: '2026-05-08', week: 'Minggu 2',
    days: 5, nights: 4, area: 'Surabaya Pusat + Gresik (revisit)',
    visits: [
      { name: 'RS Premier Surabaya', city: 'Surabaya', visit: 'closed', product: 'MRI', pipeline: 'hot', contact: 'dr. Lestari', note: 'PO MRI 1.5T terbit Rp 22.5M' },
      { name: 'RSUD Ibnu Sina Gresik', city: 'Gresik', visit: 'followup', product: 'CT Scan', pipeline: 'hot', contact: 'dr. Hasanah', note: 'KSO sudah signing, schedule instalasi' },
      { name: 'RSUD Soewandhie Surabaya', city: 'Surabaya', visit: 'followup', product: 'CT Scan', pipeline: 'hot', contact: 'Bu Tina', note: 'BAST CT 128 schedule Juni 2026' },
    ],
    pipeN: 1, pipeVal: 25500000000, closest: 'RS Premier Surabaya',
    totalCost: 2280000, block: '-',
    win: '🎉 BIG WIN: PO MRI 1.5T RS Premier Surabaya Rp 22.5M + KSO Ibnu Sina signing',
    next: 'Process MRI Premier Surabaya, koordinasi KSO Ibnu Sina',
    fatigue: 1, createdAt: '2026-05-09T20:00:00.000Z' },

  // ============= BAGUS (Jatim 2) ==============
  { id: 'rpt_bi_w1', salesId: 'bagus', date: '2026-01-16', week: 'Minggu 3',
    days: 5, nights: 4, area: 'Banyuwangi + Jember',
    visits: [
      { name: 'RSUD Banyuwangi', city: 'Banyuwangi', visit: 'followup', product: 'CT Scan', pipeline: 'hot', contact: 'dr. Wahyu, Sp.Rad', note: 'Tender Februari 2026, HPS sudah keluar' },
      { name: 'RSUD Soebandi Jember', city: 'Jember', visit: 'followup', product: 'MRI', pipeline: 'warm', contact: 'Prof. dr. Edi', note: 'Anggaran 2026 ACC' },
      { name: 'RS Bina Sehat Jember', city: 'Jember', visit: 'first', product: 'X-Ray', pipeline: 'cold', contact: 'Bu Lestari', note: 'Survey kebutuhan' },
      { name: 'RS Al-Huda Genteng', city: 'Banyuwangi', visit: 'first', product: 'C-Arm', pipeline: 'cold', contact: 'dr. Hidayat', note: 'Pertemuan awal' },
    ],
    pipeN: 3, pipeVal: 32500000000, closest: 'RSUD Banyuwangi',
    totalCost: 2480000, block: '-',
    win: 'RSUD Banyuwangi siap tender CT 64, HPS Rp 9.5M',
    next: 'Prepare bidding doc RSUD Banyuwangi tender Februari',
    fatigue: 2, createdAt: '2026-01-17T19:30:00.000Z' },

  { id: 'rpt_bi_w2', salesId: 'bagus', date: '2026-02-06', week: 'Minggu 1',
    days: 5, nights: 4, area: 'Bondowoso + Situbondo',
    visits: [
      { name: 'RSUD Koesnadi Bondowoso', city: 'Bondowoso', visit: 'first', product: 'X-Ray', pipeline: 'cold', contact: 'Pak Hartono', note: 'Survey awal' },
      { name: 'RSUD Abdoer Rahem Situbondo', city: 'Situbondo', visit: 'followup', product: 'CT Scan', pipeline: 'warm', contact: 'dr. Susanto', note: 'Tender Maret 2026' },
      { name: 'RS Mitra Sehat Bondowoso', city: 'Bondowoso', visit: 'first', product: 'C-Arm', pipeline: 'cold', contact: 'Bu Maharani', note: 'Pertemuan awal' },
    ],
    pipeN: 2, pipeVal: 11500000000, closest: 'RSUD Abdoer Rahem Situbondo',
    totalCost: 2150000, block: 'Akses Bondowoso-Situbondo terhambat truk batu',
    win: '-', next: 'Follow up tender RSUD Abdoer Rahem Situbondo',
    fatigue: 3, createdAt: '2026-02-07T19:00:00.000Z' },

  { id: 'rpt_bi_w3', salesId: 'bagus', date: '2026-02-20', week: 'Minggu 3',
    days: 5, nights: 4, area: 'Banyuwangi (revisit) + Jember (revisit)',
    visits: [
      { name: 'RSUD Banyuwangi', city: 'Banyuwangi', visit: 'closed', product: 'CT Scan', pipeline: 'hot', contact: 'dr. Wahyu, Sp.Rad', note: 'MENANG TENDER! PO CT 64 Rp 9.8M' },
      { name: 'RSUD Soebandi Jember', city: 'Jember', visit: 'followup', product: 'MRI', pipeline: 'hot', contact: 'Prof. dr. Edi', note: 'Demo MRI sukses, final negotiation' },
      { name: 'RS Citra Husada Jember', city: 'Jember', visit: 'first', product: 'X-Ray', pipeline: 'cold', contact: 'Pak Yudi', note: 'Pertemuan awal' },
    ],
    pipeN: 2, pipeVal: 28500000000, closest: 'RSUD Banyuwangi',
    totalCost: 2280000, block: '-',
    win: '🎉 MENANG TENDER CT 64 RSUD Banyuwangi Rp 9.8M',
    next: 'Process kontrak RSUD Banyuwangi, close RSUD Soebandi MRI',
    fatigue: 1, createdAt: '2026-02-21T20:00:00.000Z' },

  { id: 'rpt_bi_w4', salesId: 'bagus', date: '2026-03-13', week: 'Minggu 2',
    days: 4, nights: 3, area: 'Banyuwangi + Jember (revisit)',
    visits: [
      { name: 'RSUD Soebandi Jember', city: 'Jember', visit: 'closed', product: 'MRI', pipeline: 'hot', contact: 'Prof. dr. Edi', note: 'PO MRI 1.5T terbit Rp 22.5M' },
      { name: 'RS Bhayangkara Banyuwangi', city: 'Banyuwangi', visit: 'first', product: 'C-Arm', pipeline: 'cold', contact: 'AKBP dr. Yusran', note: 'Pertemuan awal' },
    ],
    pipeN: 1, pipeVal: 6500000000, closest: 'RSUD Soebandi Jember',
    totalCost: 1850000, block: '-',
    win: '🎉 BIG WIN: PO MRI 1.5T RSUD Soebandi Jember Rp 22.5M',
    next: 'Process kontrak RSUD Soebandi, koordinasi schedule instalasi',
    fatigue: 1, createdAt: '2026-03-14T18:30:00.000Z' },

  { id: 'rpt_bi_w5', salesId: 'bagus', date: '2026-04-03', week: 'Minggu 1',
    days: 5, nights: 4, area: 'Bali + Lombok',
    visits: [
      { name: 'RSUD Klungkung Bali', city: 'Klungkung', visit: 'followup', product: 'CT Scan', pipeline: 'warm', contact: 'dr. Ngurah', note: 'Anggaran 2026 ACC' },
      { name: 'RSUD Wangaya Denpasar', city: 'Denpasar', visit: 'first', product: 'X-Ray', pipeline: 'cold', contact: 'Bu Made', note: 'Survey awal' },
      { name: 'RS BaliMed Denpasar', city: 'Denpasar', visit: 'followup', product: 'C-Arm', pipeline: 'warm', contact: 'dr. Ari', note: 'Tertarik C-Arm Garion' },
      { name: 'RSUD Mataram', city: 'Mataram', visit: 'first', product: 'MRI', pipeline: 'cold', contact: 'Pak Hidayat', note: 'RSUD Provinsi NTB' },
    ],
    pipeN: 3, pipeVal: 24500000000, closest: 'RSUD Klungkung Bali',
    totalCost: 4850000, block: 'Flight cancelled Denpasar-Lombok karena cuaca',
    win: 'RS BaliMed Denpasar request quote C-Arm Garion',
    next: 'Prepare quote RS BaliMed, follow up tender RSUD Klungkung',
    fatigue: 3, createdAt: '2026-04-04T20:30:00.000Z' },

  { id: 'rpt_bi_w6', salesId: 'bagus', date: '2026-04-24', week: 'Minggu 4',
    days: 4, nights: 3, area: 'Tulungagung + Trenggalek',
    visits: [
      { name: 'RSUD Iskak Tulungagung', city: 'Tulungagung', visit: 'followup', product: 'CT Scan', pipeline: 'hot', contact: 'dr. Bagus', note: 'Final negotiation CT 64' },
      { name: 'RSUD Trenggalek', city: 'Trenggalek', visit: 'first', product: 'X-Ray', pipeline: 'cold', contact: 'Pak Hartoyo', note: 'Survey awal' },
      { name: 'RS Aminah Blitar', city: 'Blitar', visit: 'followup', product: 'C-Arm', pipeline: 'warm', contact: 'Bu Aminah', note: 'KSO opportunity, butuh proposal detail' },
    ],
    pipeN: 2, pipeVal: 16500000000, closest: 'RSUD Iskak Tulungagung',
    totalCost: 1850000, block: '-',
    win: 'RSUD Iskak final neg CT 64, target PO Mei',
    next: 'Close RSUD Iskak + prepare proposal KSO RS Aminah',
    fatigue: 1, createdAt: '2026-04-25T19:00:00.000Z' },

  { id: 'rpt_bi_w7', salesId: 'bagus', date: '2026-05-15', week: 'Minggu 3',
    days: 5, nights: 4, area: 'Bali (revisit) + Banyuwangi',
    visits: [
      { name: 'RS BaliMed Denpasar', city: 'Denpasar', visit: 'closed', product: 'C-Arm', pipeline: 'hot', contact: 'dr. Ari', note: 'PO C-Arm Garion terbit Rp 4.5M' },
      { name: 'RSUD Klungkung Bali', city: 'Klungkung', visit: 'followup', product: 'CT Scan', pipeline: 'hot', contact: 'dr. Ngurah', note: 'Tender Mei sudah, evaluasi penawaran' },
      { name: 'RS Puri Raharja Denpasar', city: 'Denpasar', visit: 'first', product: 'MRI', pipeline: 'cold', contact: 'dr. Putra', note: 'KSO opportunity' },
      { name: 'RSUD Banyuwangi', city: 'Banyuwangi', visit: 'followup', product: 'CT Scan', pipeline: 'hot', contact: 'dr. Wahyu, Sp.Rad', note: 'BAST CT 64 sudah, payment SPM diproses' },
    ],
    pipeN: 2, pipeVal: 32500000000, closest: 'RS BaliMed Denpasar',
    totalCost: 4250000, block: '-',
    win: 'PO C-Arm RS BaliMed Denpasar terbit + RSUD Banyuwangi BAST OK',
    next: 'Follow up tender RSUD Klungkung, prepare proposal KSO RS Puri Raharja',
    fatigue: 2, createdAt: '2026-05-16T20:30:00.000Z' },

  // ============= HNT INDONESIA (OFFICE - CEO Personal Closing) ==============
  { id: 'rpt_office_w1', salesId: 'office', date: '2026-02-05', week: 'Minggu 1',
    days: 2, nights: 0, area: 'Jakarta Selatan (Special Account)',
    visits: [
      { name: 'RS Pondok Indah Bintaro', city: 'Tangerang Selatan', visit: 'closed', product: 'MRI', pipeline: 'hot', contact: 'Direktur Utama RS Pondok Indah Group', note: 'Personal closing CEO untuk MRI 1.5T upgrade Pondok Indah' },
    ],
    pipeN: 1, pipeVal: 23500000000, closest: 'RS Pondok Indah Bintaro',
    totalCost: 850000, block: '-',
    win: '🎯 SPECIAL ACCOUNT: PO MRI 1.5T RS Pondok Indah Bintaro Rp 23.5M (CEO direct deal)',
    next: 'Koordinasi delivery & instalasi RS Pondok Indah dengan tim ops',
    fatigue: 1, createdAt: '2026-02-06T18:00:00.000Z' },

  { id: 'rpt_office_w2', salesId: 'office', date: '2026-03-15', week: 'Minggu 2',
    days: 3, nights: 0, area: 'Jakarta Timur + Tangerang (Group Hospitals)',
    visits: [
      { name: 'RS Premier Jatinegara', city: 'Jakarta Timur', visit: 'closed', product: 'CT Scan', pipeline: 'hot', contact: 'Direktur Pengembangan Premier Group', note: 'CEO direct deal CT 128 untuk Premier Group expansion' },
      { name: 'RS Mayapada Kuningan', city: 'Jakarta Selatan', visit: 'first', product: 'CT Scan', pipeline: 'warm', contact: 'Direktur RS Mayapada Group', note: 'Diskusi CT 64 untuk Mayapada Kuningan' },
    ],
    pipeN: 1, pipeVal: 26000000000, closest: 'RS Premier Jatinegara',
    totalCost: 1250000, block: '-',
    win: '🎯 SPECIAL ACCOUNT: PO CT 128 RS Premier Jatinegara Rp 15.8M (CEO direct deal)',
    next: 'Follow up RS Mayapada Kuningan untuk CT 64, target closing April',
    fatigue: 1, createdAt: '2026-03-16T19:00:00.000Z' },

  { id: 'rpt_office_w3', salesId: 'office', date: '2026-04-10', week: 'Minggu 2',
    days: 2, nights: 0, area: 'Jakarta + Tangerang Selatan (Group Hospitals)',
    visits: [
      { name: 'RS Eka Hospital BSD', city: 'Tangerang Selatan', visit: 'closed', product: 'Mammography', pipeline: 'hot', contact: 'CEO Eka Hospital Group', note: 'Personal closing Mammography untuk Women Health Center Eka Hospital' },
      { name: 'RS Mayapada Kuningan', city: 'Jakarta Selatan', visit: 'followup', product: 'CT Scan', pipeline: 'hot', contact: 'Direktur RS Mayapada Group', note: 'Lanjutan negotiation CT 64' },
    ],
    pipeN: 1, pipeVal: 10500000000, closest: 'RS Eka Hospital BSD',
    totalCost: 950000, block: '-',
    win: '🎯 SPECIAL ACCOUNT: PO Mammography RS Eka Hospital BSD Rp 6.2M (CEO direct deal)',
    next: 'Final closing RS Mayapada Kuningan CT 64, target PO Mei',
    fatigue: 1, createdAt: '2026-04-11T18:30:00.000Z' },

  { id: 'rpt_office_w4', salesId: 'office', date: '2026-05-06', week: 'Minggu 1',
    days: 1, nights: 0, area: 'Jakarta Selatan (Mayapada Group)',
    visits: [
      { name: 'RS Mayapada Kuningan', city: 'Jakarta Selatan', visit: 'followup', product: 'CT Scan', pipeline: 'hot', contact: 'Direktur RS Mayapada Group', note: 'Final negotiation CT 64, target PO sebelum Mei berakhir' },
    ],
    pipeN: 1, pipeVal: 10500000000, closest: 'RS Mayapada Kuningan',
    totalCost: 450000, block: '-',
    win: 'RS Mayapada Kuningan confirm budget, lock-in price approved',
    next: 'Close PO RS Mayapada Kuningan CT 64 sebelum 20 Mei',
    fatigue: 1, createdAt: '2026-05-07T17:30:00.000Z' },
];

// ============== Installed Units 2025 (for Maintenance & Regulatory) ==============
// 58 units installed in 2025 from won SPHs + new installations from 2026
function generateInstalledUnits() {
  const wonProjects = ALL_SPH.filter(s => s.status === 'won' && s.installationStatus === 'installed');
  return wonProjects.map((s, i) => {
    const installDate = s.issuedDate < '2026-01-01' ? `2025-${String(Math.floor(i / 5) % 12 + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}` : `2026-${String(Math.floor(i / 5) % 5 + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`;
    const installYear = parseInt(installDate.substring(0, 4));
    const installMonth = parseInt(installDate.substring(5, 7));
    // Warranty 2 years
    const warrantyEnd = `${installYear + 2}-${String(installMonth).padStart(2, '0')}-${installDate.substring(8)}`;
    // PM every 6 months, calculate last PM
    const today = new Date('2026-05-16');
    const installD = new Date(installDate);
    const monthsSince = Math.floor((today - installD) / (1000 * 60 * 60 * 24 * 30));
    const pmsDone = Math.floor(monthsSince / 6);
    const lastPmMonths = pmsDone * 6;
    const lastPmDate = new Date(installD.getTime() + lastPmMonths * 30 * 24 * 60 * 60 * 1000);
    const nextPmDate = new Date(installD.getTime() + (lastPmMonths + 6) * 30 * 24 * 60 * 60 * 1000);
    return {
      id: `unit_${s.id}`, sphRef: s.sphNo, customer: s.customer,
      modality: s.modality, subModality: s.subModality, partner: s.partner,
      installDate, warrantyEnd,
      lastPmDate: pmsDone > 0 ? lastPmDate.toISOString().split('T')[0] : null,
      nextPmDate: nextPmDate.toISOString().split('T')[0],
      technician: ['Budi Hartono', 'Rudi Susanto', 'Eko Prasetyo'][i % 3],
      qty: s.qty,
    };
  });
}

// ============== Maintenance Issues (Repairs & Complaints) ==============
const SEED_ISSUES = [
  { id: 'iss1', type: 'repair', unitId: null, customer: 'RS Husada Utama Surabaya', modality: 'CT Scan', subModality: 'CT 64 Slice Anatom Clarity', issue: 'Image artifact pada slice tipis, kalibrasi diperlukan', priority: 'high', status: 'progress', reportedDate: '2026-05-08', technician: 'Budi Hartono', note: 'Spare part dipesan dari ANKE, ETA 5 hari' },
  { id: 'iss2', type: 'repair', unitId: null, customer: 'RSUD Banyumas', modality: 'X-Ray', subModality: 'X-Ray Stationary 500mA', issue: 'Tube X-Ray tidak emit, suspect tube failure', priority: 'critical', status: 'open', reportedDate: '2026-05-12', technician: 'Rudi Susanto', note: 'Klaim garansi SG Healthcare diajukan' },
  { id: 'iss3', type: 'complaint', unitId: null, customer: 'RS Premier Bintaro', modality: 'MRI', subModality: 'MRI 1.5T Supermark', issue: 'Antrian pasien lama, request training operator lanjutan', priority: 'medium', status: 'progress', reportedDate: '2026-05-05', technician: 'Eko Prasetyo', note: 'Training scheduled minggu depan' },
  { id: 'iss4', type: 'complaint', unitId: null, customer: 'RSUD Tarakan Jakarta', modality: 'C-Arm', subModality: 'C-Arm Garion', issue: 'Software update request untuk workflow OK', priority: 'low', status: 'resolved', reportedDate: '2026-04-20', technician: 'Budi Hartono', note: 'Update v2.3 terinstall, training done' },
  { id: 'iss5', type: 'repair', unitId: null, customer: 'RS Hermina Galaxy', modality: 'CT Scan', subModality: 'CT 128 Slice Anatom Precision', issue: 'Console PC hang berkala', priority: 'medium', status: 'resolved', reportedDate: '2026-04-15', technician: 'Rudi Susanto', note: 'Re-image OS dan firmware update' },
  { id: 'iss6', type: 'complaint', unitId: null, customer: 'RSUD Banyuwangi', modality: 'Mammography', subModality: 'Mammo 2D Navigator', issue: 'Kualitas film print kurang tajam', priority: 'medium', status: 'open', reportedDate: '2026-05-14', technician: 'Eko Prasetyo', note: 'Check printer cartridge dan kalibrasi' },
];

// ============== AKL Kemenkes Records (Distribution License) ==============
// 7-stage pipeline: pra-registrasi → pengumpulan dokumen → submit Regalkes → PNBP → evaluasi tim penilai → perbaikan → AKL terbit
// Max duration: 30 working days
const AKL_STAGES = ['preregist', 'docs', 'submit', 'pnbp', 'eval', 'fix', 'issued'];

const SEED_AKL_RECORDS = [
  // Angell - China (premium X-Ray) - principal baru, sedang onboarding
  {
    id: 'akl_001', principal: 'Angell', principalCountry: 'China',
    product: 'X-Ray Ceiling Digital Premium', productClass: 'C',
    stage: 'eval', stageIdx: 4,
    registerDate: '2026-04-18', targetDate: '2026-05-30',
    daysElapsed: 21, workingDaysRemaining: 9,
    preregistDate: '2026-04-18', docsDate: '2026-04-25', submitDate: '2026-04-30',
    pnbpDate: '2026-05-05', pnbpAmount: 5000000, evalDate: '2026-05-08',
    fixDate: null, issuedDate: null, aklNo: null,
    pic: 'Rini Wahyuni',
    note: 'Tim penilai meminta klarifikasi spesifikasi tabung X-Ray',
  },
  {
    id: 'akl_002', principal: 'Angell', principalCountry: 'China',
    product: 'X-Ray Mobile Digital Premium', productClass: 'C',
    stage: 'submit', stageIdx: 2,
    registerDate: '2026-04-25', targetDate: '2026-06-06',
    daysElapsed: 14, workingDaysRemaining: 16,
    preregistDate: '2026-04-25', docsDate: '2026-05-02', submitDate: '2026-05-09',
    pnbpDate: null, pnbpAmount: null, evalDate: null,
    fixDate: null, issuedDate: null, aklNo: null,
    pic: 'Rini Wahyuni',
    note: 'Menunggu penerbitan PNBP dari Regalkes',
  },
  {
    id: 'akl_003', principal: 'Angell', principalCountry: 'China',
    product: 'Digital Fluoroscopy Premium', productClass: 'D',
    stage: 'docs', stageIdx: 1,
    registerDate: '2026-05-02', targetDate: '2026-06-13',
    daysElapsed: 7, workingDaysRemaining: 23,
    preregistDate: '2026-05-02', docsDate: null, submitDate: null,
    pnbpDate: null, pnbpAmount: null, evalDate: null,
    fixDate: null, issuedDate: null, aklNo: null,
    pic: 'Rini Wahyuni',
    note: 'Sedang melengkapi dokumen teknis & uji klinis dari Angell',
  },
  // Innocare - Taiwan (OEM HAMSKI XR untuk merek HNTI sendiri)
  {
    id: 'akl_004', principal: 'Innocare', principalCountry: 'Taiwan',
    product: 'Flat Panel Detector HAMSKI XR (Merek HNTI)', productClass: 'B',
    stage: 'fix', stageIdx: 5,
    registerDate: '2026-04-08', targetDate: '2026-05-20',
    daysElapsed: 39, workingDaysRemaining: 0,
    preregistDate: '2026-04-08', docsDate: '2026-04-15', submitDate: '2026-04-20',
    pnbpDate: '2026-04-24', pnbpAmount: 3500000, evalDate: '2026-04-28',
    fixDate: '2026-05-08', issuedDate: null, aklNo: null,
    pic: 'Rini Wahyuni',
    note: 'Perbaikan label OEM (merek HNTI) sedang difinalisasi. ETA selesai 18 Mei.',
  },
  // ANKE - existing partner, AKL untuk produk baru
  {
    id: 'akl_005', principal: 'ANKE', principalCountry: 'China',
    product: 'CT 32 Slice C201 (Refresh Tipe)', productClass: 'C',
    stage: 'issued', stageIdx: 6,
    registerDate: '2026-03-10', targetDate: '2026-04-21',
    daysElapsed: 32, workingDaysRemaining: 0,
    preregistDate: '2026-03-10', docsDate: '2026-03-17', submitDate: '2026-03-22',
    pnbpDate: '2026-03-26', pnbpAmount: 5000000, evalDate: '2026-04-02',
    fixDate: null, issuedDate: '2026-04-18', aklNo: 'AKL 20603022826',
    pic: 'Rini Wahyuni',
    note: 'AKL terbit tepat waktu (28 hari kerja). Berlaku hingga April 2031.',
  },
  // SG Healthcare - existing partner, AKL update
  {
    id: 'akl_006', principal: 'SG Healthcare', principalCountry: 'Korea',
    product: 'X-Ray Ceiling Jumong M (Update Sertifikat)', productClass: 'C',
    stage: 'preregist', stageIdx: 0,
    registerDate: '2026-05-12', targetDate: '2026-06-23',
    daysElapsed: 4, workingDaysRemaining: 26,
    preregistDate: '2026-05-12', docsDate: null, submitDate: null,
    pnbpDate: null, pnbpAmount: null, evalDate: null,
    fixDate: null, issuedDate: null, aklNo: null,
    pic: 'Rini Wahyuni',
    note: 'Persiapan pra-registrasi untuk perpanjangan masa berlaku',
  },
];

// ============== Izin Import BAPETEN (prerequisite untuk AKL) ==============
const IMPORT_STAGES = ['preregist', 'docs', 'submit', 'eval', 'issued'];
const SEED_IMPORT_RECORDS = [
  // Angell - 3 produk (principal baru, sedang onboarding)
  { id: 'imp_001', principal: 'Angell', principalCountry: 'China',
    product: 'X-Ray Ceiling Digital Premium', stage: 'issued', stageIdx: 4,
    registerDate: '2026-02-15', preregistDate: '2026-02-15', docsDate: '2026-02-22',
    submitDate: '2026-03-01', evalDate: '2026-03-10', issuedDate: '2026-04-05',
    importPermitNo: 'BAPETEN/IMP/2026/00451', pic: 'Rini Wahyuni',
    note: 'Izin Import terbit, lanjut pengajuan AKL Kemenkes' },
  { id: 'imp_002', principal: 'Angell', principalCountry: 'China',
    product: 'X-Ray Mobile Digital Premium', stage: 'issued', stageIdx: 4,
    registerDate: '2026-02-15', preregistDate: '2026-02-15', docsDate: '2026-02-22',
    submitDate: '2026-03-01', evalDate: '2026-03-10', issuedDate: '2026-04-12',
    importPermitNo: 'BAPETEN/IMP/2026/00452', pic: 'Rini Wahyuni',
    note: 'Izin Import terbit, lanjut pengajuan AKL Kemenkes' },
  { id: 'imp_003', principal: 'Angell', principalCountry: 'China',
    product: 'Digital Fluoroscopy Premium', stage: 'eval', stageIdx: 3,
    registerDate: '2026-02-15', preregistDate: '2026-02-15', docsDate: '2026-02-22',
    submitDate: '2026-03-05', evalDate: '2026-03-15', issuedDate: null,
    importPermitNo: null, pic: 'Rini Wahyuni',
    note: 'Sedang evaluasi BAPETEN - klarifikasi spesifikasi proteksi radiasi' },
  // Innocare - 1 produk (OEM HAMSKI XR)
  { id: 'imp_004', principal: 'Innocare', principalCountry: 'Taiwan',
    product: 'Flat Panel Detector HAMSKI XR', stage: 'issued', stageIdx: 4,
    registerDate: '2026-01-20', preregistDate: '2026-01-20', docsDate: '2026-01-28',
    submitDate: '2026-02-05', evalDate: '2026-02-15', issuedDate: '2026-03-25',
    importPermitNo: 'BAPETEN/IMP/2026/00280', pic: 'Rini Wahyuni',
    note: 'Izin Import terbit, AKL Kemenkes dalam proses fix' },
];

// ============== Izin Pengalihan BAPETEN ==============
const PENGALIHAN_STAGES = ['submit', 'eval', 'issued'];
const SEED_PENGALIHAN_RECORDS = [
  { id: 'pgl_001', customer: 'RS Bhakti Wira Tamtama', modality: 'CT Scan',
    subModality: 'CT 128 Slice Anatom Precision', destination: 'Semarang',
    stage: 'issued', stageIdx: 2, submitDate: '2025-08-12', evalDate: '2025-08-22',
    issuedDate: '2025-09-05', permitNo: 'BAPETEN/PGL/2025/01823',
    pic: 'Rini Wahyuni', note: 'Pengalihan ke RS Bhakti Wira Tamtama disetujui' },
  { id: 'pgl_002', customer: 'RS Premier Bintaro', modality: 'MRI',
    subModality: 'MRI 1.5T Supermark', destination: 'Tangerang Selatan',
    stage: 'issued', stageIdx: 2, submitDate: '2025-09-15', evalDate: '2025-09-25',
    issuedDate: '2025-10-10', permitNo: 'BAPETEN/PGL/2025/02145',
    pic: 'Rini Wahyuni', note: 'Pengalihan ke RS Premier Bintaro disetujui' },
  { id: 'pgl_003', customer: 'RSUD Banyumas', modality: 'X-Ray',
    subModality: 'X-Ray Stationary 500mA', destination: 'Banyumas, Jateng',
    stage: 'eval', stageIdx: 1, submitDate: '2026-04-20', evalDate: '2026-05-02',
    issuedDate: null, permitNo: null,
    pic: 'Rini Wahyuni', note: 'Sedang evaluasi - dokumen tambahan diminta' },
  { id: 'pgl_004', customer: 'RS Hermina Galaxy', modality: 'CT Scan',
    subModality: 'CT 128 Slice', destination: 'Bekasi',
    stage: 'submit', stageIdx: 0, submitDate: '2026-05-08', evalDate: null,
    issuedDate: null, permitNo: null,
    pic: 'Rini Wahyuni', note: 'Baru submit, menunggu nomor agenda' },
  { id: 'pgl_005', customer: 'RSUD Soewandhie Surabaya', modality: 'C-Arm',
    subModality: 'C-Arm Garion', destination: 'Surabaya',
    stage: 'eval', stageIdx: 1, submitDate: '2026-04-28', evalDate: '2026-05-10',
    issuedDate: null, permitNo: null,
    pic: 'Rini Wahyuni', note: 'Evaluasi BAPETEN, ETA 2 minggu' },
];

// ============== Izin Persetujuan Import (PI) - berlaku 21 hari kerja ==============
const SEED_PI_RECORDS = [
  { id: 'pi_001', piNo: 'BAPETEN/PI/2026/00891', principal: 'SG Healthcare',
    shipment: 'SG-SHP-2026-04-12', items: '2x X-Ray Stationary Jumong General + 1x C-Arm Garion',
    issuedDate: '2026-05-05', expiredDate: '2026-05-26', status: 'active',
    note: 'Aktif - shipment dalam perjalanan, ETA arrival Tg. Priok 18 Mei' },
  { id: 'pi_002', piNo: 'BAPETEN/PI/2026/00892', principal: 'ANKE',
    shipment: 'ANKE-SHP-2026-04-15', items: '1x CT 128 Slice Anatom Precision',
    issuedDate: '2026-05-08', expiredDate: '2026-05-29', status: 'active',
    note: 'Aktif - cargo arrival Tg. Priok 20 Mei, akan clearance' },
  { id: 'pi_003', piNo: 'BAPETEN/PI/2026/00893', principal: 'Hyde Medical',
    shipment: 'HYDE-SHP-2026-04-20', items: '1x ESWL Tipe 109X',
    issuedDate: '2026-05-12', expiredDate: '2026-06-02', status: 'active',
    note: 'Aktif - shipment menuju pelabuhan, ETA 25 Mei' },
  { id: 'pi_004', piNo: 'BAPETEN/PI/2026/00845', principal: 'SINO MDT',
    shipment: 'SINO-SHP-2026-03-22', items: '1x Mammography Navigator DRCare',
    issuedDate: '2026-04-10', expiredDate: '2026-05-01', status: 'used',
    note: 'Sudah digunakan - clearance Bea Cukai selesai 28 April' },
  { id: 'pi_005', piNo: 'BAPETEN/PI/2026/00810', principal: 'ANKE',
    shipment: 'ANKE-SHP-2026-02-15', items: '1x MRI 1.5T Supermark',
    issuedDate: '2026-03-20', expiredDate: '2026-04-10', status: 'used',
    note: 'Sudah digunakan - clearance selesai 8 April' },
];

// ============== Operations: Manifests & Customs Docs ==============
const SEED_MANIFESTS = [
  { id: 'mfst_001', manifestNo: 'MFST-2026-05-12', principal: 'SG Healthcare', principalOrigin: 'Busan, Korea',
    vessel: 'MV Wan Hai 503', containerNo: 'WHLU-7234567', etd: '2026-05-05', eta: '2026-05-22',
    portOfLoading: 'Busan Port', portOfDischarge: 'Tanjung Priok',
    itemsCount: 3, totalValue: 5500000000, freightCost: 85000000, insurance: 12000000,
    status: 'in_transit', piRef: 'BAPETEN/PI/2026/00891',
    notes: '2x X-Ray Jumong + 1x C-Arm Garion, container 40HC' },
  { id: 'mfst_002', manifestNo: 'MFST-2026-05-08', principal: 'ANKE', principalOrigin: 'Shanghai, China',
    vessel: 'CMA CGM Star', containerNo: 'CMAU-8456123', etd: '2026-04-30', eta: '2026-05-20',
    portOfLoading: 'Shanghai Port', portOfDischarge: 'Tanjung Priok',
    itemsCount: 1, totalValue: 8500000000, freightCost: 95000000, insurance: 18000000,
    status: 'in_transit', piRef: 'BAPETEN/PI/2026/00892',
    notes: '1x CT 128 Slice Anatom Precision, container 20FR' },
  { id: 'mfst_003', manifestNo: 'MFST-2026-04-25', principal: 'Hyde Medical', principalOrigin: 'Guangzhou, China',
    vessel: 'Evergreen Triton', containerNo: 'EGHU-3344556', etd: '2026-04-18', eta: '2026-05-08',
    portOfLoading: 'Guangzhou Port', portOfDischarge: 'Tanjung Priok',
    itemsCount: 1, totalValue: 5200000000, freightCost: 70000000, insurance: 11000000,
    status: 'arrived', piRef: 'BAPETEN/PI/2026/00893',
    notes: '1x ESWL Tipe 109X, menunggu clearance Bea Cukai' },
  { id: 'mfst_004', manifestNo: 'MFST-2026-03-15', principal: 'SINO MDT', principalOrigin: 'Shenzhen, China',
    vessel: 'MV Orient Tribute', containerNo: 'OOLU-1122334', etd: '2026-03-08', eta: '2026-03-28',
    portOfLoading: 'Shenzhen Port', portOfDischarge: 'Tanjung Priok',
    itemsCount: 1, totalValue: 3800000000, freightCost: 65000000, insurance: 8500000,
    status: 'cleared', piRef: 'BAPETEN/PI/2026/00845',
    notes: '1x Mammography Navigator DRCare, sudah delivered' },
  { id: 'mfst_005', manifestNo: 'MFST-2026-05-15', principal: 'Angell', principalOrigin: 'Shanghai, China',
    vessel: 'TBD', containerNo: 'TBD', etd: '2026-06-01', eta: '2026-06-20',
    portOfLoading: 'Shanghai Port', portOfDischarge: 'Tanjung Priok',
    itemsCount: 2, totalValue: 9500000000, freightCost: 110000000, insurance: 20000000,
    status: 'planning', piRef: '',
    notes: 'Persiapan shipment X-Ray Ceiling & Mobile Premium' },
];

const SEED_CUSTOMS_DOCS = [
  { id: 'doc_001', docNo: 'INV-SG-2026-0512', docType: 'invoice', manifestRef: 'MFST-2026-05-12',
    principal: 'SG Healthcare', docDate: '2026-05-05', status: 'received', fileUrl: '',
    notes: 'Commercial Invoice X-Ray + C-Arm' },
  { id: 'doc_002', docNo: 'PL-SG-2026-0512', docType: 'packing', manifestRef: 'MFST-2026-05-12',
    principal: 'SG Healthcare', docDate: '2026-05-05', status: 'received', fileUrl: '',
    notes: 'Packing List 3 unit' },
  { id: 'doc_003', docNo: 'BL-WHLU-7234567', docType: 'bl', manifestRef: 'MFST-2026-05-12',
    principal: 'SG Healthcare', docDate: '2026-05-08', status: 'received', fileUrl: '',
    notes: 'Bill of Lading original' },
  { id: 'doc_004', docNo: 'COO-KR-2026-512', docType: 'coo', manifestRef: 'MFST-2026-05-12',
    principal: 'SG Healthcare', docDate: '2026-05-06', status: 'received', fileUrl: '',
    notes: 'Form AK Korea-Indonesia, 0% bea masuk' },
  { id: 'doc_005', docNo: 'PIB-2026-05-001', docType: 'pib', manifestRef: 'MFST-2026-04-25',
    principal: 'Hyde Medical', docDate: '2026-05-10', status: 'submitted', fileUrl: '',
    notes: 'PIB submit Bea Cukai, menunggu SPPB' },
  { id: 'doc_006', docNo: 'INV-HYDE-2026-0420', docType: 'invoice', manifestRef: 'MFST-2026-04-25',
    principal: 'Hyde Medical', docDate: '2026-04-18', status: 'received', fileUrl: '',
    notes: 'Commercial Invoice ESWL Tipe 109X' },
  { id: 'doc_007', docNo: 'PIB-2026-03-045', docType: 'pib', manifestRef: 'MFST-2026-03-15',
    principal: 'SINO MDT', docDate: '2026-03-30', status: 'approved', fileUrl: '',
    notes: 'SPPB terbit 1 April 2026' },
  { id: 'doc_008', docNo: 'BL-CMAU-8456123', docType: 'bl', manifestRef: 'MFST-2026-05-08',
    principal: 'ANKE', docDate: '2026-05-02', status: 'received', fileUrl: '',
    notes: 'BL ANKE shipment CT 128' },
];

// ============== Installation Records (CRUD) ==============
const SEED_INSTALL_RECORDS = [
  { id: 'inst_001', recordNo: 'BA-INST-2026-001', customer: 'RS Bhakti Wira Tamtama',
    modality: 'CT Scan', subModality: 'CT 128 Slice Anatom Precision',
    installStart: '2026-04-15', installEnd: '2026-04-20', duration: 5,
    leadTechnician: 'Budi Hartono', teamSize: 3,
    roomReady: true, electricalReady: true, calibrationDone: true,
    status: 'completed', notes: 'Instalasi lancar, kalibrasi sesuai spesifikasi pabrik' },
  { id: 'inst_002', recordNo: 'BA-INST-2026-002', customer: 'RS Premier Bintaro',
    modality: 'MRI', subModality: 'MRI 1.5T Supermark',
    installStart: '2026-03-10', installEnd: '2026-03-25', duration: 15,
    leadTechnician: 'Budi Hartono', teamSize: 4,
    roomReady: true, electricalReady: true, calibrationDone: true,
    status: 'completed', notes: 'MRI 1.5T butuh shielding khusus, sudah handle dengan baik' },
  { id: 'inst_003', recordNo: 'BA-INST-2026-003', customer: 'RSUD Banyumas',
    modality: 'X-Ray', subModality: 'X-Ray Stationary Jumong General',
    installStart: '2026-04-25', installEnd: null, duration: null,
    leadTechnician: 'Andi Pratama', teamSize: 2,
    roomReady: true, electricalReady: true, calibrationDone: false,
    status: 'progress', notes: 'Sedang dalam tahap testing & calibration' },
  { id: 'inst_004', recordNo: 'BA-INST-2026-004', customer: 'RS Hermina Galaxy Bekasi',
    modality: 'CT Scan', subModality: 'CT 64 Slice Anatom Clarity',
    installStart: '2026-05-08', installEnd: null, duration: null,
    leadTechnician: 'Budi Hartono', teamSize: 3,
    roomReady: true, electricalReady: false, calibrationDone: false,
    status: 'delayed', notes: 'Tertunda karena instalasi panel listrik dari pihak RS belum selesai' },
  { id: 'inst_005', recordNo: 'BA-INST-2026-005', customer: 'RS Husada Utama Surabaya',
    modality: 'C-Arm', subModality: 'C-Arm Garion',
    installStart: '2026-05-20', installEnd: null, duration: null,
    leadTechnician: 'Bagus Iswahyudi', teamSize: 2,
    roomReady: false, electricalReady: false, calibrationDone: false,
    status: 'planning', notes: 'Survey lokasi sudah dilakukan, menunggu RS finalisasi ruangan' },
];

// ============== BAST Records (CRUD) ==============
const SEED_BAST_RECORDS = [
  { id: 'bast_001', bastNo: 'BAST-HNTI-2026-001', customer: 'RS Bhakti Wira Tamtama',
    modality: 'CT Scan', subModality: 'CT 128 Slice Anatom Precision',
    signedDate: '2026-04-22', hntiRep: 'Fajrin (CEO HNTI)',
    customerRep: 'dr. Setiawan, Sp.Rad (Direktur)', witness: 'Notaris H. Sutrisno, S.H.',
    status: 'signed', docUrl: '', notes: 'BAST ditandatangani 2 hari setelah selesai instalasi & uji fungsi' },
  { id: 'bast_002', bastNo: 'BAST-HNTI-2026-002', customer: 'RS Premier Bintaro',
    modality: 'MRI', subModality: 'MRI 1.5T Supermark',
    signedDate: '2026-03-28', hntiRep: 'Fajrin (CEO HNTI)',
    customerRep: 'dr. Ratna, Sp.Rad (Kepala Instalasi Radiologi)', witness: 'Bpk. Hartono (Notaris)',
    status: 'signed', docUrl: '', notes: 'BAST 3 hari setelah selesai instalasi + uji paparan' },
  { id: 'bast_003', bastNo: 'BAST-HNTI-2026-003', customer: 'RSUD Banyumas',
    modality: 'X-Ray', subModality: 'X-Ray Stationary Jumong General',
    signedDate: '', hntiRep: 'Lukman (Sales)',
    customerRep: 'Belum ditunjuk', witness: '',
    status: 'pending', docUrl: '', notes: 'BAST akan dibuat setelah instalasi & uji fungsi selesai' },
  { id: 'bast_004', bastNo: 'BAST-HNTI-2026-004', customer: 'RSUD Cibinong',
    modality: 'CT Scan', subModality: 'CT 32 Slice C201',
    signedDate: '2026-02-15', hntiRep: 'Fajrin (CEO HNTI)',
    customerRep: 'dr. Ahmad, Sp.Rad', witness: 'Bpk. Sugiyono (Saksi RS)',
    status: 'signed', docUrl: '', notes: 'BAST selesai, proses administrasi pembayaran SP2D dimulai' },
];

// ============== Training Certificate Records (CRUD) ==============
const SEED_TRAINING_RECORDS = [
  { id: 'train_001', certNo: 'CERT-HNTI-2026-001', customer: 'RS Bhakti Wira Tamtama',
    modality: 'CT Scan', subModality: 'CT 128 Slice Anatom Precision',
    sessionDate: '2026-04-21', participants: 4, instructor: 'Budi Hartono + Engineer ANKE',
    duration: 16, topics: 'Operasional dasar, scan protocol, dose management, troubleshooting basic',
    status: 'completed', certUrl: '', notes: 'Training 2 hari, 4 radiografer + 1 dokter spesialis' },
  { id: 'train_002', certNo: 'CERT-HNTI-2026-002', customer: 'RS Premier Bintaro',
    modality: 'MRI', subModality: 'MRI 1.5T Supermark',
    sessionDate: '2026-03-26', participants: 6, instructor: 'Engineer ANKE + Aplikator Specialist',
    duration: 24, topics: 'MRI safety, sequence protocols, image quality, patient positioning, emergency procedure',
    status: 'completed', certUrl: '', notes: 'Training intensif 3 hari, sertifikat dari ANKE Headquarters' },
  { id: 'train_003', certNo: 'CERT-HNTI-2026-003', customer: 'RSUD Cibinong',
    modality: 'CT Scan', subModality: 'CT 32 Slice C201',
    sessionDate: '2026-02-12', participants: 3, instructor: 'Budi Hartono',
    duration: 12, topics: 'Operasional, scan protocol dasar, perawatan harian',
    status: 'completed', certUrl: '', notes: 'Training 1.5 hari' },
  { id: 'train_004', certNo: '', customer: 'RSUD Banyumas',
    modality: 'X-Ray', subModality: 'X-Ray Stationary Jumong General',
    sessionDate: '', participants: 0, instructor: '',
    duration: 0, topics: '',
    status: 'pending', certUrl: '', notes: 'Training akan dijadwalkan setelah instalasi selesai' },
];

// ============== Regulatory Records (BAPETEN permits) ==============
// For installed units, generate regulatory tracking
function generateRegulatoryRecords(units) {
  return units.filter((_, i) => i < 25).map((u, i) => { // First 25 units to keep it manageable
    const stages = ['docs', 'submit', 'eval', 'pnbp', 'issued'];
    // Distribute: 30% issued, 20% pnbp, 25% eval, 15% submit, 10% docs
    let stage;
    const r = (i * 7) % 100;
    if (r < 30) stage = 'issued';
    else if (r < 50) stage = 'pnbp';
    else if (r < 75) stage = 'eval';
    else if (r < 90) stage = 'submit';
    else stage = 'docs';

    const stageIdx = stages.indexOf(stage);
    return {
      id: `reg_${u.id}`, unitId: u.id, customer: u.customer,
      modality: u.modality, subModality: u.subModality,
      installDate: u.installDate, stage, stageIdx,
      docsComplete: stageIdx >= 1, submitDate: stageIdx >= 1 ? u.installDate : null,
      evalDate: stageIdx >= 2 ? u.installDate : null,
      pnbpAmount: stageIdx >= 3 ? 12500000 : null,
      issuedDate: stageIdx >= 4 ? u.installDate : null,
      pic: 'Rini Wahyuni', note: stage === 'eval' ? 'Menunggu hasil evaluasi BAPETEN' : stage === 'pnbp' ? 'PNBP sudah terbit, menunggu pembayaran' : stage === 'docs' ? 'Sedang mengumpulkan SOP & dokumen teknis' : '',
    };
  });
}

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
  'CT Scan': '#1a4d8a', 'MRI': '#c8a96a', 'C-Arm': '#8a5a3a',
  'X-Ray': '#5a8a5a', 'Mammography': '#8a3a5a', 'ESWL': '#3a8a8a',
};

const TENDER_SUBSTAGES = ['aanwijzing', 'presentation', 'bid_opening', 'announcement', 'objection', 'award'];

// Helpers
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
const formatDate = (dateStr, lang) => new Date(dateStr).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' });

// Storage
const STORAGE_KEY = 'ims_hnti:data_v15';
const REPORTS_KEY = 'ims_hnti:reports_v15';
const LANG_KEY = 'ims_hnti:lang_v15';
const SESSION_KEY = 'ims_hnti:session_v15';
const RATE_KEY = 'ims_hnti:rate_v15';
const storeGet = async (k) => { try { const r = await window.storage.get(k); return r?.value; } catch { return null; } };
const storeSet = async (k, v) => { try { await window.storage.set(k, v); } catch {} };
const storeDel = async (k) => { try { await window.storage.delete(k); } catch {} };

// ============== Incentive Configuration ==============
const PPN_RATE = 0.11;        // PPN 11%
const PPH23_RATE = 0.025;     // PPh 23 2.5%
const OPS_COST_DEFAULT = 0.05; // Default operasional proyek 5%
const INCENTIVE_RATE = 0.015;  // 1.5% dari Net Sales

// Calculate incentive breakdown for a given SPH/PO
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

// Determine incentive status based on project type & payment progress
function getIncentiveStatus(sph) {
  if (sph.poStatus !== 'issued') return null;
  const isGovOrTender = sph.projectType === 'government';
  const isKSO = sph.projectType === 'kso';
  const isKsoSelfInvest = isKSO && sph.ksoMode === 'hnti_self_invest';
  const isKsoThirdParty = isKSO && (sph.ksoMode === 'third_party_investor' || !sph.ksoMode);

  // KSO with HNTI self-invest: split incentive scheme
  if (isKsoSelfInvest) {
    const monthsPaid = sph.ksoMonthsPaid || 0;
    if (monthsPaid >= 12) return { status: 'paid', label: 'inc_status_paid', color: '#3a6b3a' };
    if (monthsPaid > 0) return { status: 'kso_prorata', label: 'inc_status_kso_prorata', color: '#c8a96a', progress: monthsPaid / 12 };
    return { status: 'estimated', label: 'inc_status_estimated', color: '#94a3b8' };
  }

  // RSUD/Government: no DP, 100% post-BAST
  if (isGovOrTender) {
    if (sph.paymentReceivedPct >= 100) return { status: 'paid', label: 'inc_status_paid', color: '#3a6b3a' };
    if (sph.bastDate) return { status: 'ready', label: 'inc_status_ready', color: '#c8a96a' };
    return { status: 'estimated', label: 'inc_status_estimated', color: '#94a3b8' };
  }

  // Swasta, Tender BUMN, KSO third-party: standard DP+installment
  const pct = sph.paymentReceivedPct || (sph.finalPaid ? 100 : sph.dpPaid ? 30 : 0);
  if (pct >= 100) return { status: 'paid', label: 'inc_status_paid', color: '#3a6b3a' };
  if (pct >= 50) return { status: 'ready', label: 'inc_status_ready', color: '#c8a96a' };
  return { status: 'estimated', label: 'inc_status_estimated', color: '#94a3b8' };
}

// ============== Net Profit Configuration ==============
const NET_MARGIN_BY_MODALITY = {
  'MRI': 0.12,
  'CT Scan': 0.14,
  'C-Arm': 0.16,
  'Mammography': 0.15,
  'ESWL': 0.14,
  'X-Ray': 0.18,
  'Flat Panel Detector': 0.19,
  'Digital Fluoroscopy': 0.13,
};
const NET_MARGIN_DEFAULT = 0.15;

function getNetMargin(sph) {
  if (sph.netMarginOverride !== undefined && sph.netMarginOverride !== null) return sph.netMarginOverride;
  return NET_MARGIN_BY_MODALITY[sph.modality] || NET_MARGIN_DEFAULT;
}

function calcNetProfit(sph) {
  const grossPrice = sph.totalValue || 0;
  const dpp = grossPrice / (1 + PPN_RATE);
  const margin = getNetMargin(sph);
  const netProfit = dpp * margin;
  return { revenue: dpp, margin, netProfit };
}

// Payment term mapping
const PAYMENT_TERMS = {
  'cash': { label: 'pt_cash', installments: 0, dpRequired: false },
  'dp_1': { label: 'pt_dp_1', installments: 1, dpRequired: true },
  'dp_3': { label: 'pt_dp_3', installments: 3, dpRequired: true },
  'dp_6': { label: 'pt_dp_6', installments: 6, dpRequired: true },
  'dp_12': { label: 'pt_dp_12', installments: 12, dpRequired: true },
  'dp_18': { label: 'pt_dp_18', installments: 18, dpRequired: true },
  'dp_24': { label: 'pt_dp_24', installments: 24, dpRequired: true },
  'dp_36': { label: 'pt_dp_36', installments: 36, dpRequired: true },
  'post_bast': { label: 'pt_post_bast', installments: 0, dpRequired: false },
  'kso_monthly': { label: 'pt_kso_monthly', installments: 60, dpRequired: false },
};

// ============== Refined Logo (3-layer diamond) ==============
function IMSLogo({ size = 'md', inverted = false, showTagline = false }) {
  const sizes = {
    sm: { layer: 22, txt: 24, tag: 8, gap: 4 },
    md: { layer: 32, txt: 34, tag: 10, gap: 5 },
    lg: { layer: 56, txt: 64, tag: 16, gap: 8 },
    xl: { layer: 84, txt: 96, tag: 22, gap: 12 },
  };
  const s = sizes[size] || sizes.md;
  const txtColor = inverted ? '#f8f5ef' : '#1a2942';
  const borderColor = inverted ? 'rgba(248,245,239,0.3)' : 'rgba(26,41,66,0.25)';

  return (
    <div style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1}}>
      <div style={{display: 'flex', alignItems: 'center', gap: `${s.gap + 2}px`}}>
        <svg width={s.layer * 1.45} height={s.layer * 1.1} viewBox="0 0 87 66" style={{flexShrink: 0}}>
          {/* Top diamond - dark grey/blue */}
          <polygon points="43.5,2 82,20 43.5,38 5,20" fill="#3a4754" stroke="#2a3744" strokeWidth="0.5" />
          <polygon points="43.5,2 82,20 43.5,20 5,20" fill="#5a6878" />
          {/* Middle diamond - green */}
          <polygon points="43.5,22 82,38 43.5,52 5,38" fill="#4a9540" stroke="#3a7530" strokeWidth="0.5" />
          <polygon points="43.5,22 82,38 43.5,38 5,38" fill="#6ab058" />
          {/* Bottom diamond - blue */}
          <polygon points="43.5,32 82,46 43.5,62 5,46" fill="#2a7ec0" stroke="#1a6ea8" strokeWidth="0.5" />
          <polygon points="43.5,32 82,46 43.5,46 5,46" fill="#4a98d8" />
        </svg>
        <div style={{display: 'flex', alignItems: 'baseline', fontFamily: 'Inter, sans-serif'}}>
          <span style={{fontSize: `${s.txt}px`, fontWeight: 700, color: txtColor, letterSpacing: '-0.05em', fontStyle: 'italic', lineHeight: 0.85}}>i</span>
          <span style={{fontSize: `${s.txt}px`, fontWeight: 900, color: txtColor, letterSpacing: '-0.04em', lineHeight: 0.85}}>MS</span>
        </div>
      </div>
      {showTagline && (
        <div style={{marginTop: `${s.gap * 1.5}px`, paddingTop: `${s.gap}px`, borderTop: `1px solid ${borderColor}`, width: '100%'}}>
          <div style={{fontFamily: 'Inter, sans-serif', fontSize: `${s.tag}px`, fontWeight: 500, color: txtColor, letterSpacing: '0.08em', opacity: 0.85}}>
            Integrated Monitoring System
          </div>
        </div>
      )}
    </div>
  );
}

// Global styles
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; }
    .serif { font-family: 'Cormorant Garamond', Georgia, serif; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .hover-row:hover { background: #f5f1e8 !important; }
    .card-hover { transition: all 0.2s ease; }
    .card-hover:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(26,41,66,0.07); }
    .btn-primary { background: #1a2942; color: #f8f5ef; border: none; padding: 10px 20px; font-family: inherit; font-size: 12.5px; font-weight: 500; letter-spacing: 0.04em; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 7px; }
    .btn-primary:hover { background: #2a3f5f; }
    .btn-ghost { background: transparent; color: #1a2942; border: 1px solid #d4cdb8; padding: 9px 18px; font-family: inherit; font-size: 12px; font-weight: 500; letter-spacing: 0.04em; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
    .btn-ghost:hover { border-color: #1a2942; background: #f5f1e8; }
    input, select, textarea { font-family: inherit; font-size: 13px; padding: 9px 12px; border: 1px solid #d4cdb8; background: #fefcf7; color: #1a2942; outline: none; transition: border-color 0.2s; width: 100%; border-radius: 2px; }
    input:focus, select:focus, textarea:focus { border-color: #1a2942; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(26, 41, 66, 0.55); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); padding: 20px; }
    .modal-content { background: #f8f5ef; max-width: 760px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #f8f5ef; }
    ::-webkit-scrollbar-thumb { background: #d4cdb8; border-radius: 4px; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    .fade-in { animation: fadeIn 0.35s ease; }
    .card { background: #fefcf7; border: 1px solid #e8e1cc; padding: 22px; }
    .card-title { font-size: 10px; letter-spacing: 0.2em; color: #8a7d5c; text-transform: uppercase; font-weight: 600; margin-bottom: 18px; }
    @media (max-width: 900px) {
      .main-content { padding: 20px !important; }
      .header-content { padding: 14px 20px !important; }
      .desktop-nav { display: none !important; }
      .mobile-menu-btn { display: flex !important; }
      .kpi-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
      .two-col, .three-col { grid-template-columns: 1fr !important; }
      .hero-title { font-size: 28px !important; }
    }
    .mobile-menu-btn { display: none; }
  `}</style>
);

// Main App
export default function App() {
  const [lang, setLang] = useState('id');
  const [session, setSession] = useState(null);
  const [data, setData] = useState(ALL_SPH);
  const [reports, setReports] = useState(SEED_FIELD_REPORTS);
  const [issues, setIssues] = useState(SEED_ISSUES);
  const [pmSchedule, setPmSchedule] = useState([]);
  const [manifests, setManifests] = useState(SEED_MANIFESTS);
  const [customsDocs, setCustomsDocs] = useState(SEED_CUSTOMS_DOCS);
  const [installRecords, setInstallRecords] = useState(SEED_INSTALL_RECORDS);
  const [bastRecords, setBastRecords] = useState(SEED_BAST_RECORDS);
  const [trainingRecords, setTrainingRecords] = useState(SEED_TRAINING_RECORDS);
  const [regRecords, setRegRecords] = useState([]);
  const [aklRecords, setAklRecords] = useState(SEED_AKL_RECORDS);
  const [importRecords, setImportRecords] = useState(SEED_IMPORT_RECORDS);
  const [pengalihanRecords, setPengalihanRecords] = useState(SEED_PENGALIHAN_RECORDS);
  const [piRecords, setPiRecords] = useState(SEED_PI_RECORDS);
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_USD_IDR);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [d, l, s, r, rep, iss, reg, akl, imp, pgl, pi, pm, mfst, cdoc, inst, bast, train] = await Promise.all([
        storeGet(STORAGE_KEY), storeGet(LANG_KEY), storeGet(SESSION_KEY),
        storeGet(RATE_KEY), storeGet(REPORTS_KEY),
        storeGet('ims_hnti:issues_v15'), storeGet('ims_hnti:reg_v15'),
        storeGet('ims_hnti:akl_v15'),
        storeGet('ims_hnti:imp_v15'), storeGet('ims_hnti:pgl_v15'), storeGet('ims_hnti:pi_v15'),
        storeGet('ims_hnti:pm_v15'),
        storeGet('ims_hnti:mfst_v15'), storeGet('ims_hnti:cdoc_v15'),
        storeGet('ims_hnti:inst_v15'), storeGet('ims_hnti:bast_v15'), storeGet('ims_hnti:train_v15')
      ]);
      if (d) try { setData(JSON.parse(d)); } catch {}
      if (l) setLang(l);
      if (s) try { setSession(JSON.parse(s)); } catch {}
      if (r) setExchangeRate(parseFloat(r) || DEFAULT_USD_IDR);
      if (rep) try { setReports(JSON.parse(rep)); } catch {}
      if (iss) try { setIssues(JSON.parse(iss)); } catch {}
      if (akl) try { setAklRecords(JSON.parse(akl)); } catch {}
      if (imp) try { setImportRecords(JSON.parse(imp)); } catch {}
      if (pgl) try { setPengalihanRecords(JSON.parse(pgl)); } catch {}
      if (pi) try { setPiRecords(JSON.parse(pi)); } catch {}
      if (pm) try { setPmSchedule(JSON.parse(pm)); } catch {}
      if (mfst) try { setManifests(JSON.parse(mfst)); } catch {}
      if (cdoc) try { setCustomsDocs(JSON.parse(cdoc)); } catch {}
      if (inst) try { setInstallRecords(JSON.parse(inst)); } catch {}
      if (bast) try { setBastRecords(JSON.parse(bast)); } catch {}
      if (train) try { setTrainingRecords(JSON.parse(train)); } catch {}
      // Generate reg records on first load from current data
      if (reg) {
        try { setRegRecords(JSON.parse(reg)); } catch {}
      } else {
        const units = generateInstalledUnits();
        setRegRecords(generateRegulatoryRecords(units));
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => { if (!loading) storeSet(STORAGE_KEY, JSON.stringify(data)); }, [data, loading]);
  useEffect(() => { if (!loading) storeSet(REPORTS_KEY, JSON.stringify(reports)); }, [reports, loading]);
  useEffect(() => { if (!loading) storeSet('ims_hnti:issues_v15', JSON.stringify(issues)); }, [issues, loading]);
  useEffect(() => { if (!loading) storeSet('ims_hnti:reg_v15', JSON.stringify(regRecords)); }, [regRecords, loading]);
  useEffect(() => { if (!loading) storeSet('ims_hnti:akl_v15', JSON.stringify(aklRecords)); }, [aklRecords, loading]);
  useEffect(() => { if (!loading) storeSet('ims_hnti:imp_v15', JSON.stringify(importRecords)); }, [importRecords, loading]);
  useEffect(() => { if (!loading) storeSet('ims_hnti:pgl_v15', JSON.stringify(pengalihanRecords)); }, [pengalihanRecords, loading]);
  useEffect(() => { if (!loading) storeSet('ims_hnti:pi_v15', JSON.stringify(piRecords)); }, [piRecords, loading]);
  useEffect(() => { if (!loading) storeSet('ims_hnti:pm_v15', JSON.stringify(pmSchedule)); }, [pmSchedule, loading]);
  useEffect(() => { if (!loading) storeSet('ims_hnti:mfst_v15', JSON.stringify(manifests)); }, [manifests, loading]);
  useEffect(() => { if (!loading) storeSet('ims_hnti:cdoc_v15', JSON.stringify(customsDocs)); }, [customsDocs, loading]);
  useEffect(() => { if (!loading) storeSet('ims_hnti:inst_v15', JSON.stringify(installRecords)); }, [installRecords, loading]);
  useEffect(() => { if (!loading) storeSet('ims_hnti:bast_v15', JSON.stringify(bastRecords)); }, [bastRecords, loading]);
  useEffect(() => { if (!loading) storeSet('ims_hnti:train_v15', JSON.stringify(trainingRecords)); }, [trainingRecords, loading]);
  useEffect(() => { if (!loading) storeSet(LANG_KEY, lang); }, [lang, loading]);
  useEffect(() => { if (!loading) { session ? storeSet(SESSION_KEY, JSON.stringify(session)) : storeDel(SESSION_KEY); } }, [session, loading]);
  useEffect(() => { if (!loading) storeSet(RATE_KEY, String(exchangeRate)); }, [exchangeRate, loading]);

  // Derive installed units from current data (always fresh)
  const installedUnits = useMemo(() => generateInstalledUnits(), [data]);

  const t = translations[lang];
  const fmt = (n) => formatCurrency(n, lang, exchangeRate);
  const fmtFull = (n) => formatCurrencyFull(n, lang, exchangeRate);

  if (loading) return <div style={{minHeight: '100vh', background: '#f8f5ef', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><GlobalStyles /><IMSLogo size="lg" showTagline /></div>;
  if (!session) return <LoginScreen t={t} lang={lang} setLang={setLang} onLogin={setSession} />;
  return <AuthApp session={session} setSession={setSession} lang={lang} setLang={setLang} t={t} data={data} setData={setData} reports={reports} setReports={setReports} issues={issues} setIssues={setIssues} pmSchedule={pmSchedule} setPmSchedule={setPmSchedule} manifests={manifests} setManifests={setManifests} customsDocs={customsDocs} setCustomsDocs={setCustomsDocs} installRecords={installRecords} setInstallRecords={setInstallRecords} bastRecords={bastRecords} setBastRecords={setBastRecords} trainingRecords={trainingRecords} setTrainingRecords={setTrainingRecords} regRecords={regRecords} setRegRecords={setRegRecords} aklRecords={aklRecords} setAklRecords={setAklRecords} importRecords={importRecords} setImportRecords={setImportRecords} pengalihanRecords={pengalihanRecords} setPengalihanRecords={setPengalihanRecords} piRecords={piRecords} setPiRecords={setPiRecords} installedUnits={installedUnits} fmt={fmt} fmtFull={fmtFull} exchangeRate={exchangeRate} setExchangeRate={setExchangeRate} />;
}

function LoginScreen({ t, lang, setLang, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    const u = username.toLowerCase().trim();
    const user = USERS[u];
    if (user && user.password === password) {
      onLogin({ username: u, role: user.role, name: user.name, initial: user.initial, salesId: user.salesId });
      setError('');
    } else setError(t.login_error);
  };

  return (
    <div style={{minHeight: '100vh', background: '#f8f5ef', fontFamily: 'Inter, sans-serif', color: '#1a2942', display: 'flex'}}>
      <GlobalStyles />
      <div className="login-left" style={{flex: 1, background: 'linear-gradient(135deg, #1a2942 0%, #2a3f5f 100%)', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#f8f5ef', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(200,169,106,0.13) 0%, transparent 70%)'}} />
        <div style={{position: 'absolute', bottom: '-150px', left: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(74,149,64,0.08) 0%, transparent 70%)'}} />
        <div style={{position: 'relative', zIndex: 1}}><IMSLogo size="xl" inverted showTagline /></div>
        <div style={{position: 'relative', zIndex: 1}}>
          <div style={{fontSize: '10px', letterSpacing: '0.4em', color: '#c8a96a', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 500}}>{t.motto}</div>
          <h1 className="serif" style={{fontSize: '42px', fontWeight: 400, lineHeight: 1.15, margin: 0, letterSpacing: '-0.02em'}}>
            {lang === 'id' ? 'Sistem terpadu untuk monitoring operasional perusahaan' : 'Integrated platform for enterprise operations monitoring'}
          </h1>
        </div>
        <div style={{position: 'relative', zIndex: 1, fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(248,245,239,0.5)', textTransform: 'uppercase'}}>© 2026 {t.company} · Confidential</div>
      </div>

      <div className="login-right" style={{flex: '0 0 460px', padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto'}}>
        <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '32px'}}>
          <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '7px 13px', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.1em', color: '#1a2942', fontWeight: 500}}>
            <Globe size={13} strokeWidth={1.5} />{lang === 'id' ? 'EN' : 'ID'}
          </button>
        </div>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: '#8a7d5c', textTransform: 'uppercase', marginBottom: '12px'}}>{t.login_subtitle}</div>
        <h2 className="serif" style={{fontSize: '34px', fontWeight: 500, margin: '0 0 28px', letterSpacing: '-0.01em'}}>{t.login_title}</h2>

        <div style={{marginBottom: '16px'}}>
          <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '7px'}}>{t.username}</label>
          <input value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} autoFocus />
        </div>
        <div style={{marginBottom: '8px'}}>
          <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '7px'}}>{t.password}</label>
          <div style={{position: 'relative'}}>
            <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{paddingRight: '40px'}} />
            <button onClick={() => setShowPwd(!showPwd)} style={{position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#8a7d5c'}}>{showPwd ? <EyeOff size={15} /> : <Eye size={15} />}</button>
          </div>
        </div>
        {error && <div style={{color: '#8b3a3a', fontSize: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px'}}><AlertCircle size={13} />{error}</div>}
        <button className="btn-primary" onClick={handleLogin} style={{width: '100%', padding: '13px', justifyContent: 'center', marginTop: '14px'}}>
          <Lock size={14} />{t.login_btn}
        </button>

        <div style={{marginTop: '24px', padding: '14px', background: '#fefcf7', border: '1px solid #e8e1cc'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px'}}>{t.demo_credentials}</div>
          <div style={{maxHeight: '210px', overflowY: 'auto'}}>
            {Object.entries(USERS).map(([u, info]) => (
              <div key={u} onClick={() => { setUsername(u); setPassword(info.password); }} style={{display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '11px', cursor: 'pointer', borderBottom: '1px dashed #e8e1cc'}}>
                <span><span className="mono" style={{color: '#1a2942', fontWeight: 500}}>{u}</span> <span style={{color: '#8a7d5c'}}>/ {info.password}</span></span>
                <span style={{color: '#8a7d5c', fontSize: '10px'}}>{t[`role_${info.role}`]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .login-left { display: none; } .login-right { flex: 1 !important; padding: 40px 24px !important; } }`}</style>
    </div>
  );
}

function AuthApp({ session, setSession, lang, setLang, t, data, setData, reports, setReports, issues, setIssues, pmSchedule, setPmSchedule, manifests, setManifests, customsDocs, setCustomsDocs, installRecords, setInstallRecords, bastRecords, setBastRecords, trainingRecords, setTrainingRecords, regRecords, setRegRecords, aklRecords, setAklRecords, importRecords, setImportRecords, pengalihanRecords, setPengalihanRecords, piRecords, setPiRecords, installedUnits, fmt, fmtFull, exchangeRate, setExchangeRate }) {
  const [view, setView] = useState(session.role === 'sales' ? 'sales_report' : session.role === 'regulatory' ? 'regulatory' : 'dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSph, setEditingSph] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const perms = PERMISSIONS[session.role];
  const allowedNav = NAV_BY_ROLE[session.role];

  useEffect(() => { if (!allowedNav.includes(view)) setView(allowedNav[0]); }, [session.role]);

  const canEdit = (mod) => perms[mod] === 'full' || perms[mod] === 'write';
  const canRead = (mod) => perms[mod] !== 'none';

  const filteredData = session.role === 'sales' && session.salesId ? data.filter(s => s.salesOwner === session.salesId) : data;

  const handleSave = (sph) => {
    if (editingSph) setData(prev => prev.map(s => s.id === sph.id ? sph : s));
    else setData(prev => [...prev, { ...sph, id: 'sph_' + Date.now() }]);
    setModalOpen(false); setEditingSph(null);
  };
  const handleDelete = (id) => { if (confirm(t.confirm_delete)) setData(prev => prev.filter(s => s.id !== id)); };

  return (
    <div style={{minHeight: '100vh', background: '#f8f5ef', fontFamily: 'Inter, sans-serif', color: '#1a2942'}}>
      <GlobalStyles />
      <Header session={session} setSession={setSession} lang={lang} setLang={setLang} view={view} setView={setView} allowedNav={allowedNav} t={t} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} exchangeRate={exchangeRate} setExchangeRate={setExchangeRate} />

      <main className="main-content fade-in" style={{maxWidth: '1440px', margin: '0 auto', padding: '32px 48px 60px'}}>
        {view === 'dashboard' && <Dashboard data={filteredData} reports={reports} t={t} lang={lang} session={session} fmt={fmt} />}
        {view === 'sph' && canRead('sph') && <SPHManagement data={filteredData} t={t} lang={lang} canEdit={canEdit('sph')} fmt={fmt} onAdd={() => { setEditingSph(null); setModalOpen(true); }} onEdit={(s) => { setEditingSph(s); setModalOpen(true); }} onDelete={handleDelete} />}
        {view === 'pipeline' && canRead('pipeline') && <PipelineBoard data={filteredData} t={t} lang={lang} canEdit={canEdit('pipeline')} fmt={fmt} onEdit={(s) => { setEditingSph(s); setModalOpen(true); }} />}
        {view === 'sales' && canRead('sales') && <SalesModule data={data} reports={reports} t={t} lang={lang} fmt={fmt} />}
        {view === 'sales_report' && canRead('sales_report') && <SalesReport reports={reports} setReports={setReports} t={t} lang={lang} session={session} />}
        {view === 'finance' && canRead('finance') && <FinanceModule data={data} setData={setData} t={t} lang={lang} canEdit={canEdit('finance')} fmt={fmt} />}
        {view === 'operations' && canRead('operations') && <OperationsModule data={data} setData={setData} manifests={manifests} setManifests={setManifests} customsDocs={customsDocs} setCustomsDocs={setCustomsDocs} t={t} lang={lang} canEdit={canEdit('operations')} fmt={fmt} />}
        {view === 'installation' && canRead('installation') && <InstallationModule data={data} setData={setData} installRecords={installRecords} setInstallRecords={setInstallRecords} bastRecords={bastRecords} setBastRecords={setBastRecords} trainingRecords={trainingRecords} setTrainingRecords={setTrainingRecords} t={t} lang={lang} canEdit={canEdit('installation')} fmt={fmt} />}
        {view === 'maintenance' && canRead('maintenance') && <MaintenanceModule units={installedUnits} issues={issues} setIssues={setIssues} pmSchedule={pmSchedule} setPmSchedule={setPmSchedule} t={t} lang={lang} canEdit={canEdit('maintenance')} session={session} />}
        {view === 'regulatory' && canRead('regulatory') && <RegulatoryModule records={regRecords} setRegRecords={setRegRecords} aklRecords={aklRecords} setAklRecords={setAklRecords} importRecords={importRecords} setImportRecords={setImportRecords} pengalihanRecords={pengalihanRecords} setPengalihanRecords={setPengalihanRecords} piRecords={piRecords} setPiRecords={setPiRecords} units={installedUnits} t={t} lang={lang} canEdit={canEdit('regulatory')} />}
        {view === 'incentive' && canRead('incentive') && <IncentiveModule data={data} setData={setData} t={t} lang={lang} session={session} fmt={fmt} fmtFull={fmtFull} canEdit={canEdit('incentive')} />}
        {view === 'valuation' && canRead('valuation') && <Valuation data={data} t={t} lang={lang} fmt={fmt} />}
      </main>

      {modalOpen && <SPHModal sph={editingSph} t={t} lang={lang} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingSph(null); }} fmtFull={fmtFull} />}
      <Footer t={t} />
    </div>
  );
}

function Header({ session, setSession, lang, setLang, view, setView, allowedNav, t, mobileMenuOpen, setMobileMenuOpen, exchangeRate, setExchangeRate }) {
  const navIcons = { dashboard: Activity, sph: FileText, pipeline: Briefcase, sales: Users, sales_report: ClipboardList, incentive: DollarSign, finance: Wallet, operations: Truck, installation: Wrench, maintenance: Settings, regulatory: ShieldCheck, valuation: TrendingUp };
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [rateMenuOpen, setRateMenuOpen] = useState(false);
  const [tempRate, setTempRate] = useState(exchangeRate);

  return (
    <header style={{borderBottom: '1px solid #d4cdb8', background: '#f8f5ef', position: 'sticky', top: 0, zIndex: 50}}>
      <div className="header-content" style={{maxWidth: '1440px', margin: '0 auto', padding: '14px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px'}}><Menu size={22} strokeWidth={1.5} /></button>
          <IMSLogo size="md" />
        </div>

        <nav className="desktop-nav" style={{display: 'flex', gap: '1px', flex: 1, justifyContent: 'center', flexWrap: 'wrap'}}>
          {allowedNav.map(item => {
            const Icon = navIcons[item];
            const active = view === item;
            return (
              <button key={item} onClick={() => setView(item)} style={{background: active ? '#1a2942' : 'transparent', color: active ? '#f8f5ef' : '#1a2942', border: 'none', padding: '8px 12px', fontFamily: 'inherit', fontSize: '11.5px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', letterSpacing: '0.02em', whiteSpace: 'nowrap'}}>
                <Icon size={13} strokeWidth={1.5} />{t[`nav_${item}`]}
              </button>
            );
          })}
        </nav>

        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          {lang === 'en' && (
            <div style={{position: 'relative'}}>
              <button onClick={() => setRateMenuOpen(!rateMenuOpen)} className="mono" style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '6px 10px', fontSize: '10px', cursor: 'pointer', color: '#1a2942', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px'}}>
                <DollarSign size={11} />1=Rp{exchangeRate.toLocaleString('id-ID')}
              </button>
              {rateMenuOpen && (
                <>
                  <div onClick={() => setRateMenuOpen(false)} style={{position: 'fixed', inset: 0, zIndex: 60}} />
                  <div style={{position: 'absolute', right: 0, top: '100%', marginTop: '6px', background: '#fefcf7', border: '1px solid #d4cdb8', padding: '14px', zIndex: 70, minWidth: '220px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)'}}>
                    <div style={{fontSize: '10px', letterSpacing: '0.18em', color: '#8a7d5c', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{t.exchange_rate}</div>
                    <input type="number" value={tempRate} onChange={e => setTempRate(parseFloat(e.target.value) || 0)} style={{marginBottom: '8px'}} />
                    <button className="btn-primary" onClick={() => { setExchangeRate(tempRate); setRateMenuOpen(false); }} style={{width: '100%', padding: '8px', justifyContent: 'center', fontSize: '11px'}}>{t.update_rate}</button>
                  </div>
                </>
              )}
            </div>
          )}
          <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '6px 10px', fontFamily: 'inherit', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', letterSpacing: '0.1em', color: '#1a2942', fontWeight: 500}}>
            <Globe size={12} strokeWidth={1.5} />{lang === 'id' ? 'EN' : 'ID'}
          </button>
          <div style={{position: 'relative'}}>
            <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '4px'}}>
              <div style={{width: '32px', height: '32px', borderRadius: '50%', background: '#1a2942', color: '#f8f5ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600}}>{session.initial}</div>
              <ChevronDown size={13} strokeWidth={1.5} />
            </button>
            {userMenuOpen && (
              <>
                <div onClick={() => setUserMenuOpen(false)} style={{position: 'fixed', inset: 0, zIndex: 60}} />
                <div style={{position: 'absolute', right: 0, top: '100%', marginTop: '8px', background: '#fefcf7', border: '1px solid #d4cdb8', minWidth: '220px', zIndex: 70, boxShadow: '0 8px 24px rgba(0,0,0,0.08)'}}>
                  <div style={{padding: '14px', borderBottom: '1px solid #e8e1cc'}}>
                    <div style={{fontSize: '13px', fontWeight: 600}}>{session.name}</div>
                    <div style={{fontSize: '11px', color: '#8a7d5c', marginTop: '2px'}}>{t[`role_${session.role}`]}</div>
                  </div>
                  <button onClick={() => { setSession(null); setUserMenuOpen(false); }} style={{width: '100%', padding: '12px 14px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#1a2942', fontFamily: 'inherit', fontSize: '13px'}}>
                    <LogOut size={14} strokeWidth={1.5} />{t.logout}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div style={{borderTop: '1px solid #d4cdb8', background: '#fefcf7', padding: '12px 20px'}}>
          {allowedNav.map(item => {
            const Icon = navIcons[item];
            const active = view === item;
            return (
              <button key={item} onClick={() => { setView(item); setMobileMenuOpen(false); }} style={{width: '100%', background: active ? '#1a2942' : 'transparent', color: active ? '#f8f5ef' : '#1a2942', border: 'none', padding: '12px 16px', fontFamily: 'inherit', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', textAlign: 'left'}}>
                <Icon size={15} strokeWidth={1.5} />{t[`nav_${item}`]}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}

const ChartTooltip = ({ active, payload, label, fmt }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{background: '#1a2942', color: '#f8f5ef', padding: '9px 13px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}}>
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

function Dashboard({ data, reports, t, lang, session, fmt }) {
  const activeData = data.filter(s => s.status === 'active');
  const wonData = data.filter(s => s.status === 'won');
  const lostData = data.filter(s => s.status === 'lost');

  const totalPipeline = activeData.reduce((sum, s) => sum + s.totalValue, 0);
  const weightedPipeline = activeData.reduce((sum, s) => sum + (s.totalValue * s.probability / 100), 0);
  const revenueYTD = wonData.reduce((sum, s) => sum + s.totalValue, 0);
  const winRate = (wonData.length + lostData.length) > 0 ? (wonData.length / (wonData.length + lostData.length)) * 100 : 0;

  const funnelData = STAGES.filter(s => s.id !== 'lost').map(stage => {
    const projects = activeData.filter(p => p.stage === stage.id);
    return { name: t[`stage_${stage.id}`], value: projects.reduce((sum, p) => sum + p.totalValue, 0), count: projects.length, color: stage.color };
  }).filter(f => f.count > 0);

  const projectTypePieData = PROJECT_TYPES.map(pt => {
    const projects = activeData.filter(s => s.projectType === pt.id);
    return { name: t[`ptype_${pt.id}`], value: projects.reduce((s, p) => s + p.totalValue, 0), count: projects.length, color: pt.color };
  }).filter(d => d.value > 0);

  const modalityPieData = Object.keys(MODALITY_COLORS).map(mod => {
    const projects = activeData.filter(s => s.modality === mod);
    return { name: mod, value: projects.reduce((s, p) => s + p.totalValue, 0), count: projects.length, color: MODALITY_COLORS[mod] };
  }).filter(d => d.value > 0);

  const customerTypePieData = [
    { name: t.type_hospital, value: activeData.filter(s => s.customerType === 'hospital').reduce((s, p) => s + p.totalValue, 0), color: '#1a4d8a' },
    { name: t.type_clinic, value: activeData.filter(s => s.customerType === 'clinic').reduce((s, p) => s + p.totalValue, 0), color: '#c8a96a' },
    { name: t.type_subdistributor, value: activeData.filter(s => s.customerType === 'subdistributor').reduce((s, p) => s + p.totalValue, 0), color: '#5a8a5a' },
  ].filter(d => d.value > 0);

  const monthlyTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
    return months.map((m, i) => {
      const monthData = data.filter(s => { const d = new Date(s.issuedDate); return d.getFullYear() === 2026 && d.getMonth() === i; });
      return { month: m, pipeline: monthData.reduce((s, p) => s + p.totalValue, 0), weighted: monthData.reduce((s, p) => s + (p.totalValue * p.probability / 100), 0) };
    });
  }, [data]);

  const salesPerformance = SALES_TEAM.map(sales => {
    const sd = data.filter(s => s.salesOwner === sales.id);
    return { name: sales.name.split(' ')[0], pipeline: sd.filter(s => s.status === 'active').reduce((s, p) => s + p.totalValue, 0), won: sd.filter(s => s.status === 'won').reduce((s, p) => s + p.totalValue, 0) };
  }).sort((a, b) => (b.pipeline + b.won) - (a.pipeline + a.won));

  const totalVisits = reports.reduce((s, r) => s + (r.visits?.length || 0), 0);
  const totalFieldDays = reports.reduce((s, r) => s + (r.days || 0), 0);

  return (
    <div>
      <div style={{marginBottom: '28px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: '#8a7d5c', textTransform: 'uppercase', marginBottom: '6px'}}>
          {t.welcome}, {session.name} · {formatDate('2026-05-16', lang)}
        </div>
        <h1 className="serif hero-title" style={{fontSize: '44px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.nav_dashboard}</h1>
      </div>

      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#d4cdb8', marginBottom: '24px', border: '1px solid #d4cdb8'}}>
        <KPICard label={t.pipeline_value} value={fmt(totalPipeline)} sublabel={`${activeData.length} ${t.project_count} aktif`} trend={12.4} info={t.pipeline_value_sub} />
        <KPICard label={t.weighted_pipeline} value={fmt(weightedPipeline)} sublabel={`${totalPipeline > 0 ? ((weightedPipeline/totalPipeline)*100).toFixed(0) : 0}% ${t.of_total} · proyeksi`} trend={8.7} info={t.weighted_pipeline_sub} />
        <KPICard label={t.revenue_ytd} value={fmt(revenueYTD)} sublabel={`${wonData.length} deal · ${t.revenue_period}`} trend={-3.2} info={t.revenue_ytd_sub} />
        <KPICard label={t.win_rate} value={`${winRate.toFixed(0)}%`} sublabel={`${wonData.length}/${wonData.length + lostData.length} closed`} trend={5.1} info={t.win_rate_sub} />
      </div>

      <div className="card" style={{marginBottom: '20px'}}>
        <div className="card-title">{t.monthly_pipeline}</div>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={monthlyTrend} margin={{top: 10, right: 16, left: 0, bottom: 0}}>
            <defs>
              <linearGradient id="pg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a4d8a" stopOpacity={0.4} /><stop offset="100%" stopColor="#1a4d8a" stopOpacity={0.05} /></linearGradient>
              <linearGradient id="pg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c8a96a" stopOpacity={0.5} /><stop offset="100%" stopColor="#c8a96a" stopOpacity={0.1} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e1cc" vertical={false} />
            <XAxis dataKey="month" stroke="#8a7d5c" style={{fontSize: 11}} />
            <YAxis stroke="#8a7d5c" style={{fontSize: 10}} tickFormatter={(v) => v >= 1e9 ? `${(v/1e9).toFixed(0)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v} />
            <Tooltip content={<ChartTooltip fmt={fmt} />} />
            <Area type="monotone" dataKey="pipeline" name={t.pipeline_value} stroke="#1a4d8a" strokeWidth={2} fill="url(#pg1)" />
            <Area type="monotone" dataKey="weighted" name={t.weighted_pipeline} stroke="#c8a96a" strokeWidth={2} fill="url(#pg2)" />
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e1cc" horizontal={false} />
            <XAxis type="number" stroke="#8a7d5c" style={{fontSize: 10}} tickFormatter={(v) => v >= 1e9 ? `${(v/1e9).toFixed(0)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v} />
            <YAxis type="category" dataKey="name" stroke="#1a2942" style={{fontSize: 11}} width={140} />
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
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e1cc" vertical={false} />
              <XAxis dataKey="name" stroke="#8a7d5c" style={{fontSize: 10}} />
              <YAxis stroke="#8a7d5c" style={{fontSize: 10}} tickFormatter={(v) => v >= 1e9 ? `${(v/1e9).toFixed(0)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v} />
              <Tooltip content={<ChartTooltip fmt={fmt} />} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
              <Bar dataKey="pipeline" name={t.pipeline_value} fill="#1a4d8a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="won" name={t.revenue_ytd} fill="#3a6b3a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {reports.length > 0 && session.role !== 'sales' && (
        <div className="card" style={{marginBottom: '20px'}}>
          <div className="card-title">{lang === 'id' ? 'Aktivitas Lapangan dari Laporan Sales' : 'Sales Field Activity'}</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px'}}>
            <div><div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.sr_visits_count}</div><div className="serif" style={{fontSize: '28px', fontWeight: 500, marginTop: '4px'}}>{totalVisits}</div></div>
            <div><div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.sr_field_days_total}</div><div className="serif" style={{fontSize: '28px', fontWeight: 500, marginTop: '4px'}}>{totalFieldDays}</div></div>
            <div><div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.sr_total_reports}</div><div className="serif" style={{fontSize: '28px', fontWeight: 500, marginTop: '4px'}}>{reports.length}</div></div>
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
            <div className="card-title">{t.yoy_title} <span style={{fontSize: '10px', fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#8a7d5c', marginLeft: '8px'}}>· {t.yoy_subtitle}</span></div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '20px'}}>
              <div style={{padding: '14px', background: 'rgba(94,135,184,0.10)', borderLeft: '3px solid #5b87b8'}}>
                <div style={{fontSize: '10px', letterSpacing: '0.18em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.yoy_sph_2025}</div>
                <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalSph2025}</div>
              </div>
              <div style={{padding: '14px', background: 'rgba(26,77,138,0.10)', borderLeft: '3px solid #1a4d8a'}}>
                <div style={{fontSize: '10px', letterSpacing: '0.18em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.yoy_sph_2026}</div>
                <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalSph2026} <span style={{fontSize: '12px', color: sphGrowth >= 0 ? '#3a6b3a' : '#8b3a3a'}}>{sphGrowth >= 0 ? '↑' : '↓'}{Math.abs(sphGrowth).toFixed(0)}%</span></div>
              </div>
              <div style={{padding: '14px', background: 'rgba(200,169,106,0.12)', borderLeft: '3px solid #c8a96a'}}>
                <div style={{fontSize: '10px', letterSpacing: '0.18em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.yoy_po_2025}</div>
                <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalPo2025}</div>
              </div>
              <div style={{padding: '14px', background: 'rgba(58,107,58,0.10)', borderLeft: '3px solid #3a6b3a'}}>
                <div style={{fontSize: '10px', letterSpacing: '0.18em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.yoy_po_2026}</div>
                <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalPo2026} <span style={{fontSize: '12px', color: poGrowth >= 0 ? '#3a6b3a' : '#8b3a3a'}}>{poGrowth >= 0 ? '↑' : '↓'}{Math.abs(poGrowth).toFixed(0)}%</span></div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={yoyData} margin={{top: 5, right: 16, left: 0, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e1cc" vertical={false} />
                <XAxis dataKey="month" stroke="#8a7d5c" style={{fontSize: 11}} />
                <YAxis stroke="#8a7d5c" style={{fontSize: 10}} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{fontSize: '11px'}} />
                <Bar dataKey="SPH 2025" fill="#5b87b8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="SPH 2026" fill="#1a4d8a" radius={[3, 3, 0, 0]} />
                <Bar dataKey="PO 2025" fill="#c8a96a" radius={[3, 3, 0, 0]} />
                <Bar dataKey="PO 2026" fill="#3a6b3a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      })()}

      {/* Business Partners */}
      {session.role !== 'sales' && (
        <div className="card">
          <div className="card-title">{t.bp_title} <span style={{fontSize: '10px', fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#8a7d5c', marginLeft: '8px'}}>· {t.bp_subtitle}</span></div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px'}}>
            {BUSINESS_PARTNERS.map(bp => (
              <div key={bp.id} style={{padding: '16px', background: '#f8f5ef', borderLeft: `3px solid ${bp.color}`, position: 'relative'}}>
                {bp.status === 'onboarding' && (
                  <span style={{position: 'absolute', top: '10px', right: '10px', padding: '2px 7px', fontSize: '8px', background: '#c8a96a', color: '#fff', fontWeight: 700, letterSpacing: '0.1em'}}>
                    {lang === 'id' ? 'BARU · ONBOARDING' : 'NEW · ONBOARDING'}
                  </span>
                )}
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
                  <span style={{fontSize: '22px'}}>{bp.flag}</span>
                  <div>
                    <div style={{fontSize: '14px', fontWeight: 600, color: bp.color}}>{bp.name}</div>
                    <div style={{fontSize: '10px', color: '#8a7d5c', letterSpacing: '0.1em', textTransform: 'uppercase'}}>{bp.country}</div>
                  </div>
                </div>
                <div style={{fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', marginBottom: '6px'}}>{t.bp_products}</div>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
                  {bp.products.map((p, i) => <span key={i} style={{padding: '3px 8px', fontSize: '10px', background: '#fefcf7', border: '1px solid #e8e1cc', color: '#1a2942'}}>{p}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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
          <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '11px', borderBottom: i === data.length - 1 ? 'none' : '1px solid #f0ebe0'}}>
            <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><span style={{width: '7px', height: '7px', background: d.color, display: 'inline-block', borderRadius: '50%'}} /><span>{d.name}</span></span>
            <span style={{color: '#8a7d5c'}}>{((d.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KPICard({ label, value, sublabel, trend, info }) {
  const positive = trend >= 0;
  const [showInfo, setShowInfo] = useState(false);
  return (
    <div style={{padding: '22px 24px', background: '#fefcf7', minHeight: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative'}}>
      <div>
        <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.22em', color: '#8a7d5c', textTransform: 'uppercase', fontWeight: 500}}>{label}</div>
          {info && (
            <span onMouseEnter={() => setShowInfo(true)} onMouseLeave={() => setShowInfo(false)} onClick={() => setShowInfo(!showInfo)} style={{cursor: 'help', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '14px', height: '14px', borderRadius: '50%', background: '#e8e1cc', color: '#8a7d5c', fontSize: '10px', fontWeight: 600, lineHeight: 1, position: 'relative'}}>
              ?
              {showInfo && (
                <span style={{position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#1a2942', color: '#f8f5ef', padding: '8px 12px', fontSize: '11px', whiteSpace: 'normal', width: '180px', textAlign: 'left', zIndex: 100, letterSpacing: 0, textTransform: 'none', fontWeight: 400, lineHeight: 1.4, boxShadow: '0 4px 12px rgba(0,0,0,0.18)'}}>{info}</span>
              )}
            </span>
          )}
        </div>
        <div className="serif" style={{fontSize: '30px', fontWeight: 500, marginTop: '8px', letterSpacing: '-0.02em', lineHeight: 1}}>{value}</div>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '6px'}}>
        <span style={{fontSize: '10px', color: '#8a7d5c'}}>{sublabel}</span>
        <span style={{fontSize: '10px', color: positive ? '#3a6b3a' : '#8b3a3a', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 500}}>{positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{Math.abs(trend)}%</span>
      </div>
    </div>
  );
}

function ReadOnlyBanner({ t }) {
  return <div style={{padding: '10px 14px', background: 'rgba(200,169,106,0.12)', borderLeft: '3px solid #c8a96a', marginBottom: '16px', fontSize: '12px', color: '#1a2942', display: 'flex', alignItems: 'center', gap: '8px'}}><Eye size={14} />{t.view_only_notice}</div>;
}

function Field({ label, full, children }) {
  return (
    <div style={{gridColumn: full ? '1 / -1' : 'auto'}}>
      <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px'}}>{label}</label>
      {children}
    </div>
  );
}

function Th({ children, align = 'left' }) { return <th style={{padding: '12px 14px', textAlign: align, fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, borderBottom: '1px solid #d4cdb8', whiteSpace: 'nowrap'}}>{children}</th>; }
function Td({ children, align = 'left' }) { return <td style={{padding: '12px 14px', textAlign: align, verticalAlign: 'middle'}}>{children}</td>; }

function SPHManagement({ data, t, lang, canEdit, fmt, onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState('');
  const [filterPType, setFilterPType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterYear, setFilterYear] = useState('all');

  const availableYears = useMemo(() => {
    const years = new Set(data.map(s => s.issuedDate?.substring(0, 4)).filter(Boolean));
    return Array.from(years).sort().reverse();
  }, [data]);

  const filtered = data.filter(s => {
    const matchSearch = !search || s.sphNo.toLowerCase().includes(search.toLowerCase()) || s.customer.toLowerCase().includes(search.toLowerCase()) || s.subModality.toLowerCase().includes(search.toLowerCase());
    const matchYear = filterYear === 'all' || s.issuedDate?.startsWith(filterYear);
    return matchSearch && matchYear && (filterPType === 'all' || s.projectType === filterPType) && (filterStatus === 'all' || s.status === filterStatus);
  });
  const totalValue = filtered.reduce((sum, s) => sum + s.totalValue, 0);

  return (
    <div>
      <div style={{marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '14px'}}>
        <div>
          <div style={{fontSize: '11px', letterSpacing: '0.3em', color: '#8a7d5c', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_sph}</div>
          <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.sph_title}</h1>
          <div style={{fontSize: '13px', color: '#8a7d5c', marginTop: '6px'}}>{t.sph_subtitle}</div>
        </div>
        {canEdit && <button className="btn-primary" onClick={onAdd}><Plus size={14} strokeWidth={2} />{t.new_sph}</button>}
      </div>

      {!canEdit && <ReadOnlyBanner t={t} />}

      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#d4cdb8', marginBottom: '18px', border: '1px solid #d4cdb8'}}>
        <div style={{padding: '16px 20px', background: '#fefcf7'}}><div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{lang === 'id' ? 'Total SPH' : 'Total Quotations'}</div><div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px'}}>{filtered.length}</div></div>
        <div style={{padding: '16px 20px', background: '#fefcf7'}}><div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.total_value}</div><div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px'}}>{fmt(totalValue)}</div></div>
        <div style={{padding: '16px 20px', background: '#fefcf7'}}><div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.status_active}</div><div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px'}}>{filtered.filter(s => s.status === 'active').length}</div></div>
        <div style={{padding: '16px 20px', background: '#fefcf7'}}><div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.status_won}</div><div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px'}}>{filtered.filter(s => s.status === 'won').length}</div></div>
      </div>

      <div style={{display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center', flexWrap: 'wrap'}}>
        <div style={{position: 'relative', flex: '1 1 260px', maxWidth: '380px'}}>
          <Search size={14} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8a7d5c'}} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search_placeholder} style={{paddingLeft: '36px'}} />
        </div>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{width: 'auto', minWidth: '110px'}}>
          <option value="all">{t.yoy_filter_all} {t.yoy_filter_year}</option>
          {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterPType} onChange={e => setFilterPType(e.target.value)} style={{width: 'auto', minWidth: '140px'}}>
          <option value="all">{lang === 'id' ? 'Semua Jenis' : 'All Types'}</option>
          {PROJECT_TYPES.map(pt => <option key={pt.id} value={pt.id}>{t[`ptype_${pt.id}`]}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{width: 'auto', minWidth: '130px'}}>
          <option value="all">{lang === 'id' ? 'Semua Status' : 'All Status'}</option>
          <option value="active">{t.status_active}</option><option value="won">{t.status_won}</option><option value="lost">{t.status_lost}</option>
        </select>
      </div>

      <div style={{background: '#fefcf7', border: '1px solid #e8e1cc', overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '1100px'}}>
          <thead>
            <tr style={{background: '#f0ebe0'}}>
              <Th>{t.sph_number}</Th><Th>{t.customer}</Th><Th>{t.project_type}</Th>
              <Th>{t.modality}</Th><Th align="right">{t.quantity}</Th><Th align="right">{t.value}</Th>
              <Th>{t.status}</Th><Th>{t.sales_owner}</Th>
              {canEdit && <Th align="right">{t.actions}</Th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const stage = STAGES.find(st => st.id === s.stage);
              const pt = PROJECT_TYPES.find(p => p.id === s.projectType);
              const sales = SALES_TEAM.find(sa => sa.id === s.salesOwner);
              return (
                <tr key={s.id} className="hover-row" style={{borderTop: '1px solid #e8e1cc'}}>
                  <Td><span className="mono" style={{fontSize: '11px'}}>{s.sphNo}</span></Td>
                  <Td>
                    <div style={{fontWeight: 500}}>{s.customer}</div>
                    <div style={{fontSize: '10px', color: '#8a7d5c', marginTop: '2px'}}>{t[`type_${s.customerType}`]}</div>
                  </Td>
                  <Td>{pt && <span style={{display: 'inline-block', padding: '3px 7px', fontSize: '10px', background: pt.color + '25', color: pt.color, fontWeight: 600}}>{t[`ptype_${s.projectType}`]}</span>}</Td>
                  <Td>{s.subModality}</Td>
                  <Td align="right">{s.qty}</Td>
                  <Td align="right"><span className="mono" style={{fontWeight: 500}}>{fmt(s.totalValue)}</span></Td>
                  <Td><span style={{display: 'inline-block', padding: '3px 7px', fontSize: '10px', background: stage.color + '25', color: stage.color, fontWeight: 600}}>{t[`stage_${s.stage}`]}</span></Td>
                  <Td>{sales ? sales.name : s.salesOwner}</Td>
                  {canEdit && (
                    <Td align="right">
                      <button onClick={() => onEdit(s)} style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#8a7d5c'}}><Edit2 size={13} /></button>
                      <button onClick={() => onDelete(s.id)} style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#8a7d5c'}}><Trash2 size={13} /></button>
                    </Td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{padding: '50px', textAlign: 'center', color: '#8a7d5c'}}>{t.no_data}</div>}
      </div>
    </div>
  );
}

function PipelineBoard({ data, t, lang, canEdit, fmt, onEdit }) {
  // Include ALL stages: active + won (PO Issued) + lost - full journey statistics
  const pipelineData = data.filter(s => s.status === 'active' || s.status === 'won' || s.status === 'lost');

  // Stage definitions including lost - show statistical view of full journey
  const ALL_STAGES_WITH_LOST = [...STAGES];

  const totalDeals = pipelineData.length;
  const totalValue = pipelineData.reduce((s, p) => s + p.totalValue, 0);
  const wonCount = pipelineData.filter(p => p.status === 'won').length;
  const lostCount = pipelineData.filter(p => p.status === 'lost').length;
  const activeCount = pipelineData.filter(p => p.status === 'active').length;
  const winRate = (wonCount + lostCount) > 0 ? (wonCount / (wonCount + lostCount)) * 100 : 0;

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: '#8a7d5c', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_pipeline}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.pipeline_title}</h1>
        <div style={{fontSize: '13px', color: '#8a7d5c', marginTop: '6px'}}>{t.pipeline_subtitle}</div>
      </div>
      {!canEdit && <ReadOnlyBanner t={t} />}

      {/* Info box explaining pipeline columns */}
      <div style={{padding: '12px 16px', background: 'rgba(26,41,66,0.04)', borderLeft: '3px solid #1a2942', marginBottom: '16px', fontSize: '11.5px', color: '#1a2942', lineHeight: 1.6}}>
        <strong style={{letterSpacing: '0.05em'}}>📊 {lang === 'id' ? 'Cara Membaca Pipeline' : 'How to Read Pipeline'}:</strong>{' '}
        {lang === 'id'
          ? 'Setiap kolom menampilkan jumlah deal yang sedang di stage tersebut (bukan akumulatif). Total semua kolom = total SPH lifecycle. "SPH Awal" = baru dikirim, belum ada follow-up.'
          : 'Each column shows deals currently at that stage (not cumulative). Sum of all columns = total SPH lifecycle. "New SPH" = just sent, no follow-up yet.'}
      </div>

      {/* Summary KPI Strip */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1px', background: '#d4cdb8', marginBottom: '20px', border: '1px solid #d4cdb8'}}>
        <div style={{padding: '14px 16px', background: '#fefcf7'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{lang === 'id' ? 'Total Deal' : 'Total Deals'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '3px'}}>{totalDeals}</div>
          <div className="mono" style={{fontSize: '10px', color: '#8a7d5c', marginTop: '2px'}}>{fmt(totalValue)}</div>
        </div>
        <div style={{padding: '14px 16px', background: '#fefcf7'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{lang === 'id' ? 'Aktif' : 'Active'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '3px', color: '#5b87b8'}}>{activeCount}</div>
          <div style={{fontSize: '10px', color: '#8a7d5c', marginTop: '2px'}}>{lang === 'id' ? 'sedang dikerjakan' : 'in progress'}</div>
        </div>
        <div style={{padding: '14px 16px', background: '#fefcf7'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{lang === 'id' ? 'Menang (PO)' : 'Won (PO)'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '3px', color: '#3a6b3a'}}>{wonCount}</div>
          <div style={{fontSize: '10px', color: '#8a7d5c', marginTop: '2px'}}>PO {lang === 'id' ? 'terbit' : 'issued'}</div>
        </div>
        <div style={{padding: '14px 16px', background: '#fefcf7'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{lang === 'id' ? 'Kalah' : 'Lost'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '3px', color: '#8b3a3a'}}>{lostCount}</div>
          <div style={{fontSize: '10px', color: '#8a7d5c', marginTop: '2px'}}>{lang === 'id' ? 'pembelajaran' : 'learnings'}</div>
        </div>
        <div style={{padding: '14px 16px', background: '#1a2942', color: '#f8f5ef'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: '#c8a96a', textTransform: 'uppercase'}}>Win Rate</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '3px', color: '#fff'}}>{winRate.toFixed(1)}%</div>
          <div style={{fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '2px'}}>{wonCount}/{wonCount + lostCount} closed</div>
        </div>
      </div>

      <div style={{display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '20px'}}>
        {ALL_STAGES_WITH_LOST.map(stage => {
          const projects = pipelineData.filter(p => p.stage === stage.id);
          const stageValue = projects.reduce((sum, p) => sum + p.totalValue, 0);
          const isLostCol = stage.id === 'lost';
          const isWonCol = stage.id === 'po_issued';
          return (
            <div key={stage.id} style={{minWidth: '280px', flex: '0 0 280px'}}>
              <div style={{padding: '14px', background: '#fefcf7', borderTop: `3px solid ${stage.color}`, borderLeft: '1px solid #e8e1cc', borderRight: '1px solid #e8e1cc', borderBottom: '1px solid #e8e1cc', marginBottom: '10px'}} title={lang === 'id' ? `${projects.length} deal sedang di stage ini` : `${projects.length} deals at this stage`}>
                <div style={{fontSize: '10px', letterSpacing: '0.15em', color: '#8a7d5c', textTransform: 'uppercase', fontWeight: 600}}>{t[`stage_${stage.id}`]}</div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px'}}>
                  <span className="serif" style={{fontSize: '22px', fontWeight: 500, color: isLostCol ? '#8b3a3a' : isWonCol ? '#3a6b3a' : '#1a2942'}}>{projects.length}</span>
                  <span className="mono" style={{fontSize: '11px', color: '#1a2942', fontWeight: 500}}>{fmt(stageValue)}</span>
                </div>
                <div style={{fontSize: '9px', color: '#8a7d5c', marginTop: '4px', fontStyle: 'italic'}}>
                  {isLostCol ? (lang === 'id' ? 'Deal kalah / batal' : 'Lost / cancelled deals')
                    : isWonCol ? (lang === 'id' ? 'Closed won — PO terbit' : 'Closed won — PO issued')
                    : (lang === 'id' ? 'Sedang di stage ini' : 'Currently at this stage')}
                </div>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                {projects.map(p => {
                  const pt = PROJECT_TYPES.find(x => x.id === p.projectType);
                  return (
                    <div key={p.id} className="card-hover" onClick={() => canEdit && onEdit(p)} style={{padding: '13px', background: '#fefcf7', border: '1px solid #e8e1cc', cursor: canEdit ? 'pointer' : 'default', opacity: isLostCol ? 0.75 : 1}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px'}}>
                        <div style={{fontSize: '12px', fontWeight: 600, lineHeight: 1.3, textDecoration: isLostCol ? 'line-through' : 'none'}}>{p.customer}</div>
                        <div style={{width: '26px', height: '26px', borderRadius: '50%', background: stage.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, flexShrink: 0}}>{p.probability}</div>
                      </div>
                      {pt && <div style={{display: 'inline-block', padding: '2px 6px', fontSize: '9px', background: pt.color + '25', color: pt.color, fontWeight: 600, letterSpacing: '0.05em', marginBottom: '8px', textTransform: 'uppercase'}}>{t[`ptype_${p.projectType}`]}</div>}
                      <div style={{fontSize: '10px', color: '#8a7d5c', marginBottom: '8px'}}>{p.subModality} · Qty {p.qty}</div>
                      <div className="mono" style={{fontSize: '13px', fontWeight: 500}}>{fmt(p.totalValue)}</div>
                      {p.stage === 'tender' && p.tenderSubStage && <div style={{padding: '3px 7px', background: '#c8a96a20', color: '#8a7d5c', fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '6px', display: 'inline-block', fontWeight: 600}}>{t[`tender_${p.tenderSubStage}`]}</div>}
                    </div>
                  );
                })}
                {projects.length === 0 && <div style={{padding: '20px', textAlign: 'center', fontSize: '11px', color: '#8a7d5c', border: '1px dashed #d4cdb8'}}>—</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SalesModule({ data, reports, t, lang, fmt }) {
  const stats = SALES_TEAM.map(sales => {
    const sd = data.filter(s => s.salesOwner === sales.id);
    const sr = reports.filter(r => r.salesId === sales.id);
    const active = sd.filter(s => s.status === 'active');
    const won = sd.filter(s => s.status === 'won');
    const lost = sd.filter(s => s.status === 'lost');
    return {
      ...sales,
      activeCount: active.length, wonCount: won.length,
      pipelineValue: active.reduce((s, p) => s + p.totalValue, 0),
      wonValue: won.reduce((s, p) => s + p.totalValue, 0),
      winRate: (won.length + lost.length) > 0 ? (won.length / (won.length + lost.length)) * 100 : 0,
      visitsCount: sr.reduce((s, r) => s + (r.visits?.length || 0), 0),
    };
  }).sort((a, b) => (b.pipelineValue + b.wonValue) - (a.pipelineValue + a.wonValue));

  const totalAll = stats.reduce((s, x) => s + x.pipelineValue + x.wonValue, 0);

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: '#8a7d5c', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_sales}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.sales_title}</h1>
        <div style={{fontSize: '13px', color: '#8a7d5c', marginTop: '6px'}}>{t.sales_subtitle}</div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginBottom: '24px'}}>
        {stats.map((s, i) => (
          <div key={s.id} style={{padding: '18px', background: '#fefcf7', border: '1px solid #e8e1cc', position: 'relative', overflow: 'hidden'}}>
            {i < 3 && <div style={{position: 'absolute', top: 0, right: 0, padding: '5px 11px', background: i === 0 ? '#c8a96a' : i === 1 ? '#b8b8b8' : '#cd7f32', color: '#fff', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em'}}>#{i + 1}</div>}
            <div style={{display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '14px'}}>
              <div style={{width: '42px', height: '42px', borderRadius: '50%', background: s.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600}}>{s.initial}</div>
              <div>
                <div style={{fontSize: '14px', fontWeight: 600}}>{s.name}</div>
                <div style={{fontSize: '11px', color: '#8a7d5c', marginTop: '2px'}}>{lang === 'id' ? s.territory : s.territoryEn}</div>
              </div>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px'}}>
              <div>
                <div style={{fontSize: '9px', letterSpacing: '0.15em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.pipeline_value}</div>
                <div className="mono" style={{fontSize: '13px', fontWeight: 600, marginTop: '2px'}}>{fmt(s.pipelineValue)}</div>
              </div>
              <div>
                <div style={{fontSize: '9px', letterSpacing: '0.15em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.revenue_ytd}</div>
                <div className="mono" style={{fontSize: '13px', fontWeight: 600, marginTop: '2px', color: '#3a6b3a'}}>{fmt(s.wonValue)}</div>
              </div>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px', paddingTop: '11px', borderTop: '1px solid #e8e1cc'}}>
              <div style={{textAlign: 'center'}}><div style={{fontSize: '8px', letterSpacing: '0.1em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.deals_active}</div><div className="serif" style={{fontSize: '16px', fontWeight: 600, marginTop: '2px'}}>{s.activeCount}</div></div>
              <div style={{textAlign: 'center'}}><div style={{fontSize: '8px', letterSpacing: '0.1em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.deals_won}</div><div className="serif" style={{fontSize: '16px', fontWeight: 600, color: '#3a6b3a', marginTop: '2px'}}>{s.wonCount}</div></div>
              <div style={{textAlign: 'center'}}><div style={{fontSize: '8px', letterSpacing: '0.1em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.win_rate}</div><div className="serif" style={{fontSize: '16px', fontWeight: 600, marginTop: '2px'}}>{s.winRate.toFixed(0)}%</div></div>
              <div style={{textAlign: 'center'}}><div style={{fontSize: '8px', letterSpacing: '0.1em', color: '#8a7d5c', textTransform: 'uppercase'}}>{lang === 'id' ? 'Visit' : 'Visits'}</div><div className="serif" style={{fontSize: '16px', fontWeight: 600, marginTop: '2px'}}>{s.visitsCount}</div></div>
            </div>
            <div style={{marginTop: '10px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#8a7d5c', marginBottom: '4px', letterSpacing: '0.1em', textTransform: 'uppercase'}}>
                <span>{t.contribution}</span><span>{totalAll > 0 ? (((s.pipelineValue + s.wonValue) / totalAll) * 100).toFixed(0) : 0}%</span>
              </div>
              <div style={{height: '4px', background: '#f0ebe0', overflow: 'hidden'}}>
                <div style={{height: '100%', width: `${totalAll > 0 ? ((s.pipelineValue + s.wonValue) / totalAll) * 100 : 0}%`, background: s.accent}} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">{t.sales_performance}</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stats.map(s => ({ name: s.name.split(' ')[0], [t.pipeline_value]: s.pipelineValue, [t.revenue_ytd]: s.wonValue }))} margin={{top: 5, right: 16, left: 0, bottom: 5}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e1cc" vertical={false} />
            <XAxis dataKey="name" stroke="#8a7d5c" style={{fontSize: 10}} />
            <YAxis stroke="#8a7d5c" style={{fontSize: 10}} tickFormatter={(v) => v >= 1e9 ? `${(v/1e9).toFixed(0)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v} />
            <Tooltip content={<ChartTooltip fmt={fmt} />} />
            <Legend wrapperStyle={{fontSize: '11px'}} />
            <Bar dataKey={t.pipeline_value} fill="#1a4d8a" radius={[4, 4, 0, 0]} />
            <Bar dataKey={t.revenue_ytd} fill="#3a6b3a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// =================== SALES REPORTING MODULE ===================
function SalesReport({ reports, setReports, t, lang, session }) {
  const [tab, setTab] = useState('dashboard');
  const [filterSales, setFilterSales] = useState('all');
  const [editingReport, setEditingReport] = useState(null);

  const visibleReports = session.role === 'sales'
    ? reports.filter(r => r.salesId === session.salesId)
    : (filterSales === 'all' ? reports : reports.filter(r => r.salesId === filterSales));

  const tabs = session.role === 'sales' ? ['dashboard', 'new', 'history'] : ['dashboard', 'history'];
  const tabLabels = { dashboard: t.sr_dashboard, new: editingReport ? t.sr_edit_report : t.sr_new, history: t.sr_history };
  const tabIcons = { dashboard: Activity, new: ClipboardList, history: Clock };

  const handleEdit = (report) => {
    setEditingReport(report);
    setTab('new');
  };
  const handleDelete = (id) => {
    if (confirm(t.sr_confirm_delete)) {
      setReports(prev => prev.filter(r => r.id !== id));
    }
  };
  const handleSaved = () => {
    setEditingReport(null);
    setTab('history');
  };

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: '#8a7d5c', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_sales_report}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.sr_title}</h1>
        <div style={{fontSize: '13px', color: '#8a7d5c', marginTop: '6px'}}>{t.sr_subtitle}</div>
      </div>

      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid #d4cdb8', flexWrap: 'wrap'}}>
        {tabs.map(x => {
          const Icon = tabIcons[x];
          const active = tab === x;
          return (
            <button key={x} onClick={() => { setTab(x); if (x !== 'new') setEditingReport(null); }} style={{background: 'transparent', border: 'none', padding: '10px 18px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: active ? '#1a2942' : '#8a7d5c', borderBottom: active ? '2px solid #1a2942' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px', letterSpacing: '0.03em'}}>
              <Icon size={14} strokeWidth={1.5} />{tabLabels[x]}
            </button>
          );
        })}
      </div>

      {session.role !== 'sales' && tab === 'history' && (
        <div style={{display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap'}}>
          <button onClick={() => setFilterSales('all')} style={{padding: '5px 11px', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', background: filterSales === 'all' ? '#1a2942' : 'transparent', color: filterSales === 'all' ? '#c8a96a' : '#8a7d5c', border: '1px solid ' + (filterSales === 'all' ? '#1a2942' : '#d4cdb8'), cursor: 'pointer', fontFamily: 'inherit'}}>{lang === 'id' ? 'Semua' : 'All'}</button>
          {SALES_TEAM.map(s => <button key={s.id} onClick={() => setFilterSales(s.id)} style={{padding: '5px 11px', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', background: filterSales === s.id ? '#1a2942' : 'transparent', color: filterSales === s.id ? '#c8a96a' : '#8a7d5c', border: '1px solid ' + (filterSales === s.id ? '#1a2942' : '#d4cdb8'), cursor: 'pointer', fontFamily: 'inherit'}}>{s.name.split(' ')[0]}</button>)}
        </div>
      )}

      {tab === 'dashboard' && <SRDashboard reports={visibleReports} t={t} lang={lang} />}
      {tab === 'new' && session.role === 'sales' && <SRForm reports={reports} setReports={setReports} t={t} lang={lang} session={session} editingReport={editingReport} onSaved={handleSaved} onCancel={() => { setEditingReport(null); setTab('history'); }} />}
      {tab === 'history' && <SRHistory reports={visibleReports} t={t} lang={lang} canEdit={session.role === 'sales'} onEdit={handleEdit} onDelete={handleDelete} session={session} />}
    </div>
  );
}

function SRDashboard({ reports, t, lang }) {
  if (!reports.length) return (
    <div style={{padding: '60px 30px', textAlign: 'center', background: '#fefcf7', border: '1px solid #e8e1cc'}}>
      <ClipboardList size={36} strokeWidth={1.2} style={{color: '#8a7d5c', marginBottom: '12px'}} />
      <div style={{fontSize: '14px', color: '#8a7d5c', fontStyle: 'italic'}}>{t.sr_no_reports}</div>
    </div>
  );

  const totalVisits = reports.reduce((s, r) => s + (r.visits?.length || 0), 0);
  const totalDays = reports.reduce((s, r) => s + (r.days || 0), 0);
  const totalDeals = reports.reduce((s, r) => s + (r.visits?.filter(v => v.visit === 'closed').length || 0), 0);
  const totalPipeRS = reports.reduce((s, r) => s + (r.pipeN || 0), 0);
  const totalCost = reports.reduce((s, r) => s + (r.totalCost || 0), 0);

  const bySales = {};
  reports.forEach(r => {
    if (!bySales[r.salesId]) bySales[r.salesId] = { count: 0, cost: 0 };
    bySales[r.salesId].count += r.visits?.length || 0;
    bySales[r.salesId].cost += r.totalCost || 0;
  });

  return (
    <div>
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#d4cdb8', marginBottom: '24px', border: '1px solid #d4cdb8'}}>
        <KPICard label={t.sr_visits_count} value={totalVisits} sublabel={`${reports.length} ${lang === 'id' ? 'laporan' : 'reports'}`} trend={15.2} />
        <KPICard label={t.sr_field_days_total} value={totalDays} sublabel={lang === 'id' ? 'Hari lapangan' : 'Field days'} trend={8.4} />
        <KPICard label={lang === 'id' ? 'Deal Closing' : 'Closing Deals'} value={totalDeals} sublabel={t.deals_won} trend={20.1} />
        <KPICard label={lang === 'id' ? 'RS dalam Pipeline' : 'Pipeline RS'} value={totalPipeRS} sublabel={lang === 'id' ? 'Dari laporan' : 'From reports'} trend={12.5} />
      </div>

      {Object.keys(bySales).length > 0 && (
        <div className="two-col" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
          <div className="card">
            <div className="card-title">{lang === 'id' ? 'Kunjungan per Sales' : 'Visits per Sales'}</div>
            {Object.entries(bySales).map(([id, st]) => {
              const sales = SALES_TEAM.find(s => s.id === id);
              if (!sales) return null;
              const pct = Math.min(st.count / 100 * 100, 100);
              return (
                <div key={id} style={{marginBottom: '12px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px'}}>
                    <span style={{fontWeight: 500}}>{sales.name.split(' ')[0]} <span style={{color: '#8a7d5c', fontSize: '11px'}}>· {lang === 'id' ? sales.territory : sales.territoryEn}</span></span>
                    <span className="mono" style={{color: '#8a7d5c', fontSize: '11px'}}>{st.count}</span>
                  </div>
                  <div style={{height: '6px', background: '#f0ebe0', overflow: 'hidden'}}>
                    <div style={{height: '100%', width: `${pct}%`, background: sales.accent, transition: 'width 0.5s'}} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card">
            <div className="card-title">{lang === 'id' ? 'Biaya per Sales' : 'Cost per Sales'}</div>
            {Object.entries(bySales).map(([id, st]) => {
              const sales = SALES_TEAM.find(s => s.id === id);
              if (!sales) return null;
              const pct = Math.min(st.cost / 5000000 * 100, 100);
              return (
                <div key={id} style={{marginBottom: '12px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px'}}>
                    <span style={{fontWeight: 500}}>{sales.name.split(' ')[0]}</span>
                    <span className="mono" style={{color: '#8a7d5c', fontSize: '11px'}}>Rp {(st.cost / 1000).toFixed(0)}rb</span>
                  </div>
                  <div style={{height: '6px', background: '#f0ebe0', overflow: 'hidden'}}>
                    <div style={{height: '100%', width: `${pct}%`, background: sales.accent}} />
                  </div>
                </div>
              );
            })}
            <div style={{marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #e8e1cc', display: 'flex', justifyContent: 'space-between', fontSize: '11px'}}>
              <span style={{letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a7d5c'}}>{lang === 'id' ? 'Total' : 'Total'}</span>
              <span className="mono" style={{color: '#1a2942', fontWeight: 600}}>Rp {totalCost.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SRForm({ reports, setReports, t, lang, session, editingReport, onSaved, onCancel }) {
  const sales = SALES_TEAM.find(s => s.id === session.salesId);
  const isEdit = !!editingReport;
  const [form, setForm] = useState(editingReport || {
    date: '2026-05-16', week: 'Minggu 1', days: 0, nights: 0, area: '',
    visits: [{ name: '', city: '', visit: 'first', product: '', pipeline: 'cold', contact: '', note: '' }],
    pipeN: 0, pipeVal: 0, closest: '', totalCost: 0,
    block: '', win: '', next: '', fatigue: 0,
  });

  const addVisit = () => setForm(f => ({ ...f, visits: [...f.visits, { name: '', city: '', visit: 'first', product: '', pipeline: 'cold', contact: '', note: '' }] }));
  const removeVisit = (i) => setForm(f => ({ ...f, visits: f.visits.filter((_, j) => j !== i) }));
  const updateVisit = (i, k, v) => setForm(f => ({ ...f, visits: f.visits.map((vt, j) => j === i ? { ...vt, [k]: v } : vt) }));

  const handleSubmit = () => {
    const validVisits = form.visits.filter(v => v.name.trim());
    const report = {
      id: isEdit ? form.id : 'rpt_' + Date.now(),
      salesId: isEdit ? form.salesId : session.salesId,
      date: form.date, week: form.week, days: parseInt(form.days) || 0, nights: parseInt(form.nights) || 0,
      area: form.area, visits: validVisits, pipeN: parseInt(form.pipeN) || 0, pipeVal: parseInt(form.pipeVal) || 0,
      closest: form.closest, totalCost: parseInt(form.totalCost) || 0,
      block: form.block, win: form.win, next: form.next, fatigue: form.fatigue,
      createdAt: isEdit ? form.createdAt : new Date().toISOString(),
      updatedAt: isEdit ? new Date().toISOString() : undefined,
    };
    if (isEdit) {
      setReports(prev => prev.map(r => r.id === report.id ? report : r));
      alert(t.sr_updated_success);
    } else {
      setReports(prev => [report, ...prev]);
      alert(lang === 'id' ? '✓ Laporan berhasil disimpan' : '✓ Report saved successfully');
    }
    onSaved && onSaved();
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
      <div style={{padding: '14px 18px', background: 'linear-gradient(135deg, #1a2942 0%, #2a3f5f 100%)', color: '#f8f5ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
        <div>
          <div style={{fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#c8a96a', marginBottom: '4px'}}>{isEdit ? t.sr_edit_report : (lang === 'id' ? 'Laporan untuk' : 'Report for')}</div>
          <div style={{fontSize: '17px', fontWeight: 600}}>{sales?.name} · <span style={{opacity: 0.7, fontSize: '13px'}}>{lang === 'id' ? sales?.territory : sales?.territoryEn}</span></div>
        </div>
        {isEdit && onCancel && (
          <button onClick={onCancel} style={{background: 'transparent', color: '#c8a96a', border: '1px solid #c8a96a', padding: '6px 14px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em'}}>← {t.sr_back_to_history}</button>
        )}
      </div>

      <div className="card">
        <div className="card-title">01 · {t.sr_report_date}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_report_date}</label><input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} /></div>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_week}</label><select value={form.week} onChange={e => setForm(f => ({...f, week: e.target.value}))}><option>Minggu 1</option><option>Minggu 2</option><option>Minggu 3</option><option>Minggu 4</option></select></div>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_field_days}</label><input type="number" min="0" max="7" value={form.days} onChange={e => setForm(f => ({...f, days: e.target.value}))} /></div>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_nights}</label><input type="number" min="0" max="6" value={form.nights} onChange={e => setForm(f => ({...f, nights: e.target.value}))} /></div>
          <div style={{gridColumn: '1 / -1'}}><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_focus_area}</label><input value={form.area} onChange={e => setForm(f => ({...f, area: e.target.value}))} placeholder={lang === 'id' ? 'Contoh: Solo Kota + Sukoharjo' : 'Example: Solo + Sukoharjo'} /></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">02 · {t.sr_visits}</div>
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', fontSize: '11px', borderCollapse: 'collapse', minWidth: '800px'}}>
            <thead>
              <tr style={{background: '#f0ebe0'}}>
                <th style={{padding: '8px', textAlign: 'left', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a7d5c'}}>#</th>
                <th style={{padding: '8px', textAlign: 'left', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a7d5c'}}>{lang === 'id' ? 'Nama RS' : 'Hospital'}</th>
                <th style={{padding: '8px', textAlign: 'left', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a7d5c'}}>{lang === 'id' ? 'Kab/Kota' : 'City'}</th>
                <th style={{padding: '8px', textAlign: 'left', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a7d5c'}}>{lang === 'id' ? 'Kunjungan' : 'Visit'}</th>
                <th style={{padding: '8px', textAlign: 'left', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a7d5c'}}>{lang === 'id' ? 'Produk' : 'Product'}</th>
                <th style={{padding: '8px', textAlign: 'left', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a7d5c'}}>{lang === 'id' ? 'Pipeline' : 'Pipeline'}</th>
                <th style={{padding: '8px', textAlign: 'left', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a7d5c'}}>{lang === 'id' ? 'Kontak' : 'Contact'}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {form.visits.map((v, i) => (
                <tr key={i} style={{borderTop: '1px solid #e8e1cc'}}>
                  <td style={{padding: '6px', fontSize: '11px', color: '#8a7d5c', textAlign: 'center'}}>{i + 1}</td>
                  <td style={{padding: '4px'}}><input value={v.name} onChange={e => updateVisit(i, 'name', e.target.value)} placeholder={lang === 'id' ? 'Nama RS' : 'Hospital'} style={{fontSize: '11px', padding: '5px 7px'}} /></td>
                  <td style={{padding: '4px'}}><input value={v.city} onChange={e => updateVisit(i, 'city', e.target.value)} placeholder={lang === 'id' ? 'Kab/Kota' : 'City'} style={{fontSize: '11px', padding: '5px 7px'}} /></td>
                  <td style={{padding: '4px'}}>
                    <select value={v.visit} onChange={e => updateVisit(i, 'visit', e.target.value)} style={{fontSize: '11px', padding: '5px 7px'}}>
                      <option value="first">{lang === 'id' ? 'Pertama' : 'First'}</option>
                      <option value="followup">{lang === 'id' ? 'Follow-up' : 'Follow-up'}</option>
                      <option value="demo">{lang === 'id' ? 'Demo' : 'Demo'}</option>
                      <option value="nego">{lang === 'id' ? 'Negosiasi' : 'Negotiation'}</option>
                      <option value="closed">{lang === 'id' ? 'Closing ✓' : 'Closing ✓'}</option>
                    </select>
                  </td>
                  <td style={{padding: '4px'}}>
                    <select value={v.product} onChange={e => updateVisit(i, 'product', e.target.value)} style={{fontSize: '11px', padding: '5px 7px'}}>
                      <option value="">—</option>
                      <option value="CT">CT Scan</option><option value="MRI">MRI</option>
                      <option value="C-Arm">C-Arm</option><option value="X-Ray">X-Ray</option>
                      <option value="Mammo">Mammo</option><option value="ESWL">ESWL</option>
                    </select>
                  </td>
                  <td style={{padding: '4px'}}>
                    <select value={v.pipeline} onChange={e => updateVisit(i, 'pipeline', e.target.value)} style={{fontSize: '11px', padding: '5px 7px'}}>
                      <option value="cold">{lang === 'id' ? 'Dingin' : 'Cold'}</option>
                      <option value="warm">{lang === 'id' ? 'Hangat' : 'Warm'}</option>
                      <option value="hot">{lang === 'id' ? 'Panas' : 'Hot'}</option>
                      <option value="proposal">{lang === 'id' ? 'Proposal' : 'Proposal'}</option>
                      <option value="win">{lang === 'id' ? 'Deal ✓' : 'Deal ✓'}</option>
                    </select>
                  </td>
                  <td style={{padding: '4px'}}><input value={v.contact} onChange={e => updateVisit(i, 'contact', e.target.value)} placeholder={lang === 'id' ? 'Nama' : 'Name'} style={{fontSize: '11px', padding: '5px 7px'}} /></td>
                  <td><button onClick={() => removeVisit(i)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b3a3a', padding: '4px'}}><X size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addVisit} className="btn-ghost" style={{marginTop: '10px'}}>{t.sr_add_visit}</button>
      </div>

      <div className="card">
        <div className="card-title">03 · {t.sr_pipe_summary}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_pipe_count}</label><input type="number" min="0" value={form.pipeN} onChange={e => setForm(f => ({...f, pipeN: e.target.value}))} /></div>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_pipe_val}</label><input type="number" min="0" value={form.pipeVal} onChange={e => setForm(f => ({...f, pipeVal: e.target.value}))} /></div>
          <div style={{gridColumn: '1 / -1'}}><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_closest}</label><input value={form.closest} onChange={e => setForm(f => ({...f, closest: e.target.value}))} placeholder={lang === 'id' ? 'Nama RS' : 'Hospital name'} /></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">04 · {t.sr_cost}</div>
        <input type="number" min="0" value={form.totalCost} onChange={e => setForm(f => ({...f, totalCost: e.target.value}))} placeholder="0" />
      </div>

      <div className="card">
        <div className="card-title">05 · {t.sr_reflection}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '14px'}}>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_win}</label><textarea rows={3} value={form.win} onChange={e => setForm(f => ({...f, win: e.target.value}))} /></div>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_block}</label><textarea rows={3} value={form.block} onChange={e => setForm(f => ({...f, block: e.target.value}))} /></div>
          <div style={{gridColumn: '1 / -1'}}><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_next}</label><textarea rows={2} value={form.next} onChange={e => setForm(f => ({...f, next: e.target.value}))} /></div>
        </div>
        <div>
          <label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '8px', display: 'block'}}>{t.sr_fatigue} (1={lang === 'id' ? 'Segar' : 'Fresh'} · 5={lang === 'id' ? 'Sangat Lelah' : 'Very Tired'})</label>
          <div style={{display: 'flex', gap: '6px'}}>
            {[1, 2, 3, 4, 5].map(v => (
              <button key={v} onClick={() => setForm(f => ({...f, fatigue: v}))} style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: v <= form.fatigue ? '#c8a96a' : '#d4cdb8'}}>
                <Star size={22} fill={v <= form.fatigue ? '#c8a96a' : 'none'} strokeWidth={1.5} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{padding: '14px 18px', background: '#fefcf7', border: '1px solid #e8e1cc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'}}>
        <div style={{fontSize: '12px', color: '#8a7d5c', fontStyle: 'italic'}}>{lang === 'id' ? 'Laporan otomatis tampil di dashboard CEO' : 'Report auto-displays on CEO dashboard'}</div>
        <button className="btn-primary" onClick={handleSubmit}>{t.sr_submit} →</button>
      </div>
    </div>
  );
}

function SRHistory({ reports, t, lang, canEdit, onEdit, onDelete, session }) {
  const [expanded, setExpanded] = useState(null);

  if (!reports.length) return (
    <div style={{padding: '60px 30px', textAlign: 'center', background: '#fefcf7', border: '1px solid #e8e1cc'}}>
      <Clock size={36} strokeWidth={1.2} style={{color: '#8a7d5c', marginBottom: '12px'}} />
      <div style={{fontSize: '14px', color: '#8a7d5c', fontStyle: 'italic'}}>{t.sr_no_reports}</div>
    </div>
  );

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
      {reports.map(r => {
        const sales = SALES_TEAM.find(s => s.id === r.salesId);
        const isOpen = expanded === r.id;
        // Only the report owner (sales) can edit/delete their own report
        const isOwner = canEdit && session?.salesId === r.salesId;
        return (
          <div key={r.id} style={{background: '#fefcf7', border: '1px solid #e8e1cc'}}>
            <div style={{padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap'}}>
              <div onClick={() => setExpanded(isOpen ? null : r.id)} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 auto', flexWrap: 'wrap'}}>
                <div style={{width: '4px', height: '38px', background: sales?.accent || '#1a2942'}} />
                <div style={{flex: '1 1 200px', minWidth: 0}}>
                  <div style={{fontSize: '13px', fontWeight: 600}}>{sales?.name || r.salesId}</div>
                  <div style={{fontSize: '10px', color: '#8a7d5c', marginTop: '2px'}} className="mono">{r.date} · {r.week}{r.updatedAt && <span style={{color: '#c8a96a', marginLeft: '6px'}}>· {lang === 'id' ? 'diedit' : 'edited'}</span>}</div>
                </div>
                <div style={{display: 'flex', gap: '14px', fontSize: '11px', color: '#8a7d5c', flexWrap: 'wrap'}} className="mono">
                  <span><b style={{color: '#1a2942'}}>{r.visits?.length || 0}</b> RS</span>
                  <span><b style={{color: '#1a2942'}}>{r.days}</b> {t.days}</span>
                  <span>Rp <b style={{color: '#1a2942'}}>{((r.totalCost || 0) / 1000).toFixed(0)}rb</b></span>
                </div>
                <ChevronDown size={16} style={{transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#8a7d5c'}} />
              </div>
              {isOwner && (
                <div style={{display: 'flex', gap: '4px'}}>
                  <button onClick={(e) => { e.stopPropagation(); onEdit(r); }} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '5px 10px', fontSize: '10px', cursor: 'pointer', color: '#1a2942', fontFamily: 'inherit'}} title={t.sr_edit_report}><Edit2 size={11} /></button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(r.id); }} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '5px 10px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}} title={t.sr_delete_report}><Trash2 size={11} /></button>
                </div>
              )}
            </div>
            {isOpen && (
              <div style={{padding: '16px 22px', borderTop: '1px solid #e8e1cc', fontSize: '12.5px', lineHeight: 1.7}}>
                {r.win && <p style={{marginBottom: '6px', color: '#3a6b3a'}}><strong>✓ {t.sr_win}:</strong> {r.win}</p>}
                {r.block && <p style={{marginBottom: '6px', color: '#c8a96a'}}><strong>⚠ {t.sr_block}:</strong> {r.block}</p>}
                {r.next && <p style={{marginBottom: '6px', color: '#8a7d5c', fontStyle: 'italic'}}><strong>{t.sr_next}:</strong> {r.next}</p>}
                {r.area && <p style={{marginBottom: '6px'}}><strong>{t.sr_focus_area}:</strong> {r.area}</p>}
                {r.closest && <p style={{marginBottom: '6px'}}><strong>{t.sr_closest}:</strong> {r.closest}</p>}
                {r.visits?.length > 0 && (
                  <div style={{marginTop: '12px'}}>
                    <div style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', marginBottom: '8px', fontWeight: 600}}>{lang === 'id' ? 'RS Dikunjungi' : 'Hospitals Visited'} ({r.visits.length})</div>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px'}}>
                      {r.visits.map((v, i) => <span key={i} style={{padding: '3px 9px', fontSize: '10px', background: '#f0ebe0', color: '#1a2942'}}>{v.name}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============== Finance, Operations, Installation (compact) ==============
function FinanceModule({ data, setData, t, lang, canEdit, fmt }) {
  const [tab, setTab] = useState('finance');
  const poProjects = data.filter(s => s.poStatus === 'issued');
  const totalPOValue = poProjects.reduce((s, p) => s + p.totalValue, 0);
  const dpReceived = poProjects.filter(p => p.dpPaid).reduce((s, p) => s + (p.totalValue * 0.3), 0);
  const arOutstanding = poProjects.reduce((s, p) => s + p.totalValue - (p.dpPaid ? p.totalValue * 0.3 : 0) - (p.finalPaid ? p.totalValue * 0.7 : 0), 0);
  const apOutstanding = poProjects.filter(p => p.dpPaid).reduce((s, p) => s + (p.totalValue * 0.6), 0);

  const togglePayment = (id, field) => {
    if (!canEdit) return;
    setData(prev => prev.map(s => s.id === id ? { ...s, [field]: !s[field] } : s));
  };

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: '#8a7d5c', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_finance}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>
          {tab === 'finance' ? t.finance_title : t.np_title}
        </h1>
        <div style={{fontSize: '13px', color: '#8a7d5c', marginTop: '6px'}}>
          {tab === 'finance' ? t.finance_subtitle : t.np_subtitle}
        </div>
      </div>
      {!canEdit && <ReadOnlyBanner t={t} />}

      {/* Tabs */}
      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid #d4cdb8', flexWrap: 'wrap'}}>
        {[
          { id: 'finance', label: t.np_tab_finance, icon: Wallet },
          { id: 'profit', label: t.np_tab_profit, icon: TrendingUp },
        ].map(tb => {
          const Icon = tb.icon;
          const active = tab === tb.id;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '10px 18px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: active ? '#1a2942' : '#8a7d5c', borderBottom: active ? '2px solid #1a2942' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px', letterSpacing: '0.03em'}}>
              <Icon size={14} strokeWidth={1.5} />
              {tb.label}
            </button>
          );
        })}
      </div>

      {tab === 'profit' && <NetProfitAnalysis data={data} t={t} lang={lang} fmt={fmt} />}

      {tab === 'finance' && (
      <>
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#d4cdb8', marginBottom: '24px', border: '1px solid #d4cdb8'}}>
        <KPICard label={t.po_value} value={fmt(totalPOValue)} sublabel={`${poProjects.length} PO`} trend={18.5} />
        <KPICard label={t.cash_collected} value={fmt(dpReceived)} sublabel={t.dp_paid} trend={22.1} />
        <KPICard label={t.ar_outstanding} value={fmt(arOutstanding)} sublabel={t.awaiting_payment} trend={-5.3} />
        <KPICard label={t.ap_outstanding} value={fmt(apOutstanding)} sublabel="China & Korea" trend={12.0} />
      </div>

      <div style={{background: '#fefcf7', border: '1px solid #e8e1cc', overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '800px'}}>
          <thead>
            <tr style={{background: '#f0ebe0'}}>
              <Th>{t.sph_number}</Th><Th>{t.customer}</Th><Th align="right">{t.value}</Th>
              <Th align="center">{t.dp_paid}</Th><Th align="center">{t.final_paid}</Th>
            </tr>
          </thead>
          <tbody>
            {poProjects.map(p => (
              <tr key={p.id} className="hover-row" style={{borderTop: '1px solid #e8e1cc'}}>
                <Td><span className="mono" style={{fontSize: '11px'}}>{p.sphNo}</span></Td>
                <Td>
                  <div style={{fontWeight: 500}}>{p.customer}</div>
                  <div style={{fontSize: '10px', color: '#8a7d5c'}}>{p.subModality}</div>
                </Td>
                <Td align="right"><span className="mono" style={{fontWeight: 500}}>{fmt(p.totalValue)}</span></Td>
                <Td align="center">
                  <button onClick={() => togglePayment(p.id, 'dpPaid')} disabled={!canEdit} style={{background: p.dpPaid ? '#3a6b3a' : 'transparent', border: `1px solid ${p.dpPaid ? '#3a6b3a' : '#d4cdb8'}`, color: p.dpPaid ? '#fff' : '#8a7d5c', padding: '4px 10px', fontSize: '11px', cursor: canEdit ? 'pointer' : 'default', fontWeight: 500}}>
                    {p.dpPaid ? '✓ ' + fmt(p.totalValue * 0.3) : '—'}
                  </button>
                </Td>
                <Td align="center">
                  <button onClick={() => togglePayment(p.id, 'finalPaid')} disabled={!canEdit} style={{background: p.finalPaid ? '#3a6b3a' : 'transparent', border: `1px solid ${p.finalPaid ? '#3a6b3a' : '#d4cdb8'}`, color: p.finalPaid ? '#fff' : '#8a7d5c', padding: '4px 10px', fontSize: '11px', cursor: canEdit ? 'pointer' : 'default', fontWeight: 500}}>
                    {p.finalPaid ? '✓ ' + fmt(p.totalValue * 0.7) : '—'}
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        {poProjects.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#8a7d5c'}}>{t.no_data}</div>}
      </div>
      </>
      )}
    </div>
  );
}

// ============== Net Profit Analysis Sub-Component ==============
function NetProfitAnalysis({ data, t, lang, fmt }) {
  // Won + PO Issued deals count as revenue realized
  const realizedDeals = data.filter(s => s.poStatus === 'issued' || s.status === 'won');

  const totalRevenue = realizedDeals.reduce((sum, s) => sum + calcNetProfit(s).revenue, 0);
  const totalProfit = realizedDeals.reduce((sum, s) => sum + calcNetProfit(s).netProfit, 0);
  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) : 0;

  // Group by modality
  const modalitySet = [...new Set(realizedDeals.map(s => s.modality))];
  const byModality = modalitySet.map(mod => {
    const deals = realizedDeals.filter(s => s.modality === mod);
    const rev = deals.reduce((sum, s) => sum + calcNetProfit(s).revenue, 0);
    const prof = deals.reduce((sum, s) => sum + calcNetProfit(s).netProfit, 0);
    const margin = rev > 0 ? prof / rev : 0;
    return { modality: mod, revenue: rev, profit: prof, margin, count: deals.length, defaultMargin: NET_MARGIN_BY_MODALITY[mod] || NET_MARGIN_DEFAULT };
  }).sort((a, b) => b.profit - a.profit);

  // Monthly trend
  const monthlyTrend = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei'].map((m, i) => {
    const mn = String(i + 1).padStart(2, '0');
    const monthDeals = realizedDeals.filter(s => s.issuedDate?.startsWith(`2026-${mn}`));
    const rev = monthDeals.reduce((sum, s) => sum + calcNetProfit(s).revenue, 0);
    const prof = monthDeals.reduce((sum, s) => sum + calcNetProfit(s).netProfit, 0);
    return { month: m, [t.np_revenue]: rev, [t.np_profit]: prof };
  });

  return (
    <div>
      {/* KPI Cards */}
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#d4cdb8', marginBottom: '24px', border: '1px solid #d4cdb8'}}>
        <div style={{padding: '20px 22px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.22em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.np_total_revenue}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '6px'}}>{fmt(totalRevenue)}</div>
          <div style={{fontSize: '10px', color: '#8a7d5c', marginTop: '6px'}}>{realizedDeals.length} deals · {lang === 'id' ? 'Setelah PPN' : 'After VAT'}</div>
        </div>
        <div style={{padding: '20px 22px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.22em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.np_total_profit}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '6px', color: '#3a6b3a'}}>{fmt(totalProfit)}</div>
          <div style={{fontSize: '10px', color: '#8a7d5c', marginTop: '6px'}}>{lang === 'id' ? 'Setelah COGS, Expense, Overhead' : 'After COGS, Expense, Overhead'}</div>
        </div>
        <div style={{padding: '20px 22px', background: '#1a2942', color: '#f8f5ef'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.22em', color: '#c8a96a', textTransform: 'uppercase'}}>{t.np_avg_margin}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '6px', color: '#fff'}}>{(avgMargin * 100).toFixed(1)}%</div>
          <div style={{fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '6px'}}>Range 11-19% · {lang === 'id' ? 'Industri Distributor' : 'Distributor Industry'}</div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="card" style={{marginBottom: '20px'}}>
        <div className="card-title">{t.np_monthly_trend}</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyTrend} margin={{top: 5, right: 16, left: 0, bottom: 5}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e1cc" vertical={false} />
            <XAxis dataKey="month" stroke="#8a7d5c" style={{fontSize: 11}} />
            <YAxis stroke="#8a7d5c" style={{fontSize: 10}} tickFormatter={(v) => v >= 1e9 ? `${(v/1e9).toFixed(0)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v} />
            <Tooltip content={<ChartTooltip fmt={fmt} />} />
            <Legend wrapperStyle={{fontSize: '11px'}} />
            <Bar dataKey={t.np_revenue} fill="#1a4d8a" radius={[3, 3, 0, 0]} />
            <Bar dataKey={t.np_profit} fill="#3a6b3a" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per Modality */}
      <div className="card" style={{marginBottom: '20px'}}>
        <div className="card-title">{t.np_per_modality}</div>
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '700px'}}>
            <thead>
              <tr style={{background: '#f0ebe0'}}>
                <Th>{t.np_modality_label}</Th>
                <Th align="right">{t.project_count}</Th>
                <Th align="right">{t.np_revenue}</Th>
                <Th align="right">{t.np_profit}</Th>
                <Th align="right">{t.np_margin}</Th>
                <Th align="right">{t.np_default_margin}</Th>
              </tr>
            </thead>
            <tbody>
              {byModality.map(m => (
                <tr key={m.modality} className="hover-row" style={{borderTop: '1px solid #e8e1cc'}}>
                  <Td><strong style={{color: MODALITY_COLORS[m.modality] || '#1a2942'}}>{m.modality}</strong></Td>
                  <Td align="right">{m.count}</Td>
                  <Td align="right"><span className="mono">{fmt(m.revenue)}</span></Td>
                  <Td align="right"><span className="mono" style={{color: '#3a6b3a', fontWeight: 600}}>{fmt(m.profit)}</span></Td>
                  <Td align="right">
                    <span style={{padding: '3px 8px', fontSize: '11px', background: '#3a6b3a25', color: '#3a6b3a', fontWeight: 700}} className="mono">{(m.margin * 100).toFixed(1)}%</span>
                  </Td>
                  <Td align="right"><span style={{fontSize: '10px', color: '#8a7d5c'}} className="mono">{(m.defaultMargin * 100).toFixed(0)}%</span></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OperationsModule({ data, setData, manifests, setManifests, customsDocs, setCustomsDocs, t, lang, canEdit, fmt }) {
  const [tab, setTab] = useState('shipment');
  const poProjects = data.filter(s => s.poStatus === 'issued');
  const updateShipping = (id, status) => { if (!canEdit) return; setData(prev => prev.map(s => s.id === id ? { ...s, shippingStatus: status } : s)); };
  const updateCustoms = (id, status) => { if (!canEdit) return; setData(prev => prev.map(s => s.id === id ? { ...s, customsStatus: status } : s)); };

  const shippingSteps = [
    { id: 'plan_order', label: t.plan_order_to_factory, color: '#94a3b8' },
    { id: 'ready_to_ship', label: t.ready_to_ship, color: '#7d9cc5' },
    { id: 'on_shipment', label: t.on_shipment, color: '#c8a96a' },
    { id: 'delivered', label: t.delivery_to_site, color: '#3a6b3a' },
  ];

  const totalManifests = manifests.length;
  const inTransit = manifests.filter(m => m.status === 'in_transit').length;
  const arrivedCount = manifests.filter(m => m.status === 'arrived').length;
  const pendingDocs = customsDocs.filter(d => d.status === 'submitted' || d.status === 'received').length;

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: '#8a7d5c', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_operations}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.operations_title}</h1>
        <div style={{fontSize: '13px', color: '#8a7d5c', marginTop: '6px'}}>{t.operations_subtitle}</div>
      </div>
      {!canEdit && <ReadOnlyBanner t={t} />}

      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#d4cdb8', marginBottom: '22px', border: '1px solid #d4cdb8'}}>
        <div style={{padding: '18px 20px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.ops_total_manifests}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalManifests}</div>
        </div>
        <div style={{padding: '18px 20px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.ops_in_transit}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#c8a96a'}}>{inTransit}</div>
        </div>
        <div style={{padding: '18px 20px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.ops_arrived_count}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#5b87b8'}}>{arrivedCount}</div>
        </div>
        <div style={{padding: '18px 20px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.ops_pending_docs}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#c03030'}}>{pendingDocs}</div>
        </div>
      </div>

      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid #d4cdb8', flexWrap: 'wrap'}}>
        {[
          { id: 'shipment', label: t.ops_tab_shipment, icon: Truck, count: poProjects.length },
          { id: 'manifest', label: t.ops_tab_manifest, icon: Briefcase, count: manifests.length },
          { id: 'customs', label: t.ops_tab_customs, icon: FileText, count: customsDocs.length },
        ].map(tb => {
          const Icon = tb.icon;
          const active = tab === tb.id;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: active ? '#1a2942' : '#8a7d5c', borderBottom: active ? '2px solid #1a2942' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px', letterSpacing: '0.03em'}}>
              <Icon size={14} strokeWidth={1.5} />{tb.label}
              <span style={{padding: '2px 7px', background: active ? '#1a2942' : '#e8e1cc', color: active ? '#f8f5ef' : '#8a7d5c', fontSize: '10px', fontWeight: 600, borderRadius: '10px'}}>{tb.count}</span>
            </button>
          );
        })}
      </div>

      {tab === 'shipment' && (
        <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
          {poProjects.map(p => (
            <div key={p.id} style={{padding: '18px', background: '#fefcf7', border: '1px solid #e8e1cc'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '10px'}}>
                <div>
                  <div style={{fontSize: '14px', fontWeight: 600}}>{p.customer}</div>
                  <div style={{fontSize: '11px', color: '#8a7d5c', marginTop: '2px'}}>{p.subModality} · Qty {p.qty} · <span className="mono">{p.sphNo}</span></div>
                </div>
                <div className="mono" style={{fontSize: '14px', fontWeight: 500}}>{fmt(p.totalValue)}</div>
              </div>
              <div style={{display: 'flex', gap: '0', marginBottom: '14px'}}>
                {shippingSteps.map((step, i) => {
                  const isActive = p.shippingStatus === step.id;
                  const stepIdx = shippingSteps.findIndex(s => s.id === p.shippingStatus);
                  const isPast = stepIdx > i;
                  return (
                    <button key={step.id} onClick={() => updateShipping(p.id, step.id)} disabled={!canEdit} style={{flex: 1, padding: '9px 6px', fontSize: '9px', fontWeight: 600, letterSpacing: '0.05em', background: isActive ? step.color : isPast ? step.color + '40' : 'transparent', color: isActive ? '#fff' : isPast ? step.color : '#8a7d5c', border: `1px solid ${isActive || isPast ? step.color : '#d4cdb8'}`, cursor: canEdit ? 'pointer' : 'default', fontFamily: 'inherit', textTransform: 'uppercase'}}>{step.label}</button>
                  );
                })}
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'}}>
                <span style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600}}>{t.customs_status}:</span>
                {['released', 'ongoing', 'hold'].map(status => (
                  <button key={status} onClick={() => updateCustoms(p.id, status)} disabled={!canEdit} style={{padding: '5px 11px', fontSize: '11px', fontFamily: 'inherit', background: p.customsStatus === status ? (status === 'released' ? '#3a6b3a' : status === 'ongoing' ? '#c8a96a' : '#8b3a3a') : 'transparent', color: p.customsStatus === status ? '#fff' : '#8a7d5c', border: `1px solid ${p.customsStatus === status ? 'transparent' : '#d4cdb8'}`, cursor: canEdit ? 'pointer' : 'default', fontWeight: 500}}>{t[`customs_${status}`]}</button>
                ))}
              </div>
            </div>
          ))}
          {poProjects.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#8a7d5c', background: '#fefcf7', border: '1px solid #e8e1cc'}}>{t.no_data}</div>}
        </div>
      )}

      {tab === 'manifest' && <ManifestList manifests={manifests} setManifests={setManifests} t={t} lang={lang} canEdit={canEdit} fmt={fmt} />}
      {tab === 'customs' && <CustomsDocsList customsDocs={customsDocs} setCustomsDocs={setCustomsDocs} manifests={manifests} t={t} lang={lang} canEdit={canEdit} />}
    </div>
  );
}

// ============== Manifest List ==============
function ManifestList({ manifests, setManifests, t, lang, canEdit, fmt }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const statusColors = { planning: '#94a3b8', loading: '#7d9cc5', in_transit: '#c8a96a', arrived: '#5b87b8', cleared: '#3a6b3a' };

  const handleSave = (rec) => {
    setManifests(prev => {
      const exists = prev.find(r => r.id === rec.id);
      return exists ? prev.map(r => r.id === rec.id ? rec : r) : [...prev, rec];
    });
    setModalOpen(false); setEditingRecord(null);
  };
  const handleDelete = (id) => {
    if (!canEdit) return;
    if (confirm(t.crud_confirm_delete)) setManifests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div style={{background: '#fefcf7', border: '1px solid #e8e1cc'}}>
      <div style={{padding: '14px 18px', borderBottom: '1px solid #e8e1cc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
        <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.ops_tab_manifest}</div>
        {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
      </div>
      {manifests.map(m => {
        const statusColor = statusColors[m.status];
        const principalColor = m.principal === 'SG Healthcare' ? '#1a4d8a' : m.principal === 'ANKE' ? '#c03030' : m.principal === 'Hyde Medical' ? '#7b3fb5' : m.principal === 'SINO MDT' ? '#d4780a' : m.principal === 'Angell' ? '#0f7a5a' : '#b8860b';
        return (
          <div key={m.id} style={{padding: '16px 18px', borderTop: '1px solid #e8e1cc'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '10px'}}>
              <div style={{flex: '1 1 320px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap'}}>
                  <span className="mono" style={{fontSize: '13px', fontWeight: 700, color: '#1a2942'}}>{m.manifestNo}</span>
                  <span style={{padding: '2px 8px', background: principalColor + '20', color: principalColor, fontSize: '10px', fontWeight: 700}}>{m.principal}</span>
                  <span style={{fontSize: '10px', color: '#8a7d5c'}}>· {m.principalOrigin}</span>
                </div>
                <div style={{fontSize: '11px', color: '#1a2942', marginTop: '4px'}}>🚢 {m.vessel} · <span className="mono">{m.containerNo}</span></div>
                <div style={{fontSize: '10px', color: '#8a7d5c', marginTop: '2px'}}>{m.portOfLoading} → {m.portOfDischarge}</div>
              </div>
              <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px'}}>
                <span style={{padding: '4px 10px', fontSize: '10px', background: statusColor + '25', color: statusColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`ops_status_${m.status}`]}</span>
                <div className="mono" style={{fontSize: '12px', fontWeight: 600}}>{fmt(m.totalValue)}</div>
                {canEdit && (
                  <div style={{display: 'flex', gap: '4px'}}>
                    <button onClick={() => { setEditingRecord(m); setModalOpen(true); }} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#1a2942', fontFamily: 'inherit'}}><Edit2 size={11} /></button>
                    <button onClick={() => handleDelete(m.id)} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>
                  </div>
                )}
              </div>
            </div>
            <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '10px', color: '#8a7d5c', marginBottom: '8px'}}>
              <span><strong>ETD:</strong> <span className="mono">{m.etd}</span></span>
              <span><strong>ETA:</strong> <span className="mono">{m.eta}</span></span>
              <span><strong>Items:</strong> {m.itemsCount}</span>
              <span><strong>Freight:</strong> <span className="mono">{fmt(m.freightCost)}</span></span>
              <span><strong>Insurance:</strong> <span className="mono">{fmt(m.insurance)}</span></span>
              {m.piRef && <span><strong>PI:</strong> <span className="mono">{m.piRef}</span></span>}
            </div>
            {m.notes && <div style={{padding: '8px 10px', background: '#f0ebe0', fontSize: '11px', fontStyle: 'italic', color: '#1a2942'}}>📝 {m.notes}</div>}
          </div>
        );
      })}
      {manifests.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#8a7d5c'}}>{t.no_data}</div>}
      {modalOpen && <ManifestModal record={editingRecord} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} />}
    </div>
  );
}

// ============== Customs Docs List ==============
function CustomsDocsList({ customsDocs, setCustomsDocs, manifests, t, lang, canEdit }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const statusColors = { received: '#94a3b8', submitted: '#c8a96a', approved: '#3a6b3a', rejected: '#c03030' };

  const handleSave = (rec) => {
    setCustomsDocs(prev => {
      const exists = prev.find(r => r.id === rec.id);
      return exists ? prev.map(r => r.id === rec.id ? rec : r) : [...prev, rec];
    });
    setModalOpen(false); setEditingRecord(null);
  };
  const handleDelete = (id) => {
    if (!canEdit) return;
    if (confirm(t.crud_confirm_delete)) setCustomsDocs(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div style={{background: '#fefcf7', border: '1px solid #e8e1cc', overflowX: 'auto'}}>
      <div style={{padding: '14px 18px', borderBottom: '1px solid #e8e1cc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
        <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.ops_tab_customs}</div>
        {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
      </div>
      <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '800px'}}>
        <thead>
          <tr style={{background: '#f0ebe0'}}>
            <Th>{t.ops_doc_no}</Th><Th>{t.ops_doc_type}</Th>
            <Th>{t.imp_principal}</Th><Th>Manifest</Th>
            <Th>{t.ops_doc_date}</Th><Th>{t.ops_doc_status}</Th>
            {canEdit && <Th align="right">{t.crud_actions}</Th>}
          </tr>
        </thead>
        <tbody>
          {customsDocs.map(d => {
            const statusColor = statusColors[d.status];
            return (
              <tr key={d.id} className="hover-row" style={{borderTop: '1px solid #e8e1cc'}}>
                <Td>
                  <span className="mono" style={{fontSize: '11px', fontWeight: 600}}>{d.docNo}</span>
                  {d.fileUrl && <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" style={{display: 'block', fontSize: '10px', color: '#5b87b8', marginTop: '2px'}}>📎 {lang === 'id' ? 'Lihat File' : 'View File'}</a>}
                  {d.notes && <div style={{fontSize: '10px', color: '#8a7d5c', marginTop: '2px', fontStyle: 'italic'}}>{d.notes}</div>}
                </Td>
                <Td><span style={{padding: '2px 7px', fontSize: '10px', background: '#e8e1cc', color: '#1a2942', fontWeight: 600}}>{t[`ops_doc_${d.docType}`]}</span></Td>
                <Td><span style={{fontSize: '11px'}}>{d.principal}</span></Td>
                <Td><span className="mono" style={{fontSize: '10px'}}>{d.manifestRef || '—'}</span></Td>
                <Td><span className="mono" style={{fontSize: '11px'}}>{d.docDate}</span></Td>
                <Td><span style={{padding: '3px 8px', fontSize: '10px', background: statusColor + '25', color: statusColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`ops_doc_${d.status}`]}</span></Td>
                {canEdit && (
                  <Td align="right">
                    <button onClick={() => { setEditingRecord(d); setModalOpen(true); }} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#1a2942', fontFamily: 'inherit', marginRight: '4px'}}><Edit2 size={11} /></button>
                    <button onClick={() => handleDelete(d.id)} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>
                  </Td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {customsDocs.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#8a7d5c'}}>{t.no_data}</div>}
      {modalOpen && <CustomsDocModal record={editingRecord} manifests={manifests} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} />}
    </div>
  );
}

// ============== Manifest Modal ==============
function ManifestModal({ record, onSave, onClose, t, lang }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState(record || {
    id: 'mfst_' + Date.now(),
    manifestNo: 'MFST-' + new Date().toISOString().substring(0, 7) + '-' + String(Date.now()).slice(-3),
    principal: '', principalOrigin: '', vessel: '', containerNo: '',
    etd: today, eta: '', portOfLoading: '', portOfDischarge: 'Tanjung Priok, Jakarta',
    itemsCount: 1, totalValue: 0, freightCost: 0, insurance: 0,
    status: 'planning', piRef: '', notes: '',
  });
  const isEdit = !!record;
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.ops_modal_edit_manifest : t.ops_modal_add_manifest}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#8a7d5c'}}><X size={20} /></button>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <Field label={t.ops_manifest_no}><input value={form.manifestNo} onChange={e => update('manifestNo', e.target.value)} /></Field>
          <Field label={t.ops_manifest_status}>
            <select value={form.status} onChange={e => update('status', e.target.value)}>
              <option value="planning">{t.ops_status_planning}</option>
              <option value="loading">{t.ops_status_loading}</option>
              <option value="in_transit">{t.ops_status_in_transit}</option>
              <option value="arrived">{t.ops_status_arrived}</option>
              <option value="cleared">{t.ops_status_cleared}</option>
            </select>
          </Field>
          <Field label={t.imp_principal}>
            <select value={form.principal} onChange={e => update('principal', e.target.value)}>
              <option value="">—</option>
              <option value="SG Healthcare">SG Healthcare (Korea)</option>
              <option value="ANKE">ANKE (China)</option>
              <option value="SINO MDT">SINO MDT (China)</option>
              <option value="Hyde Medical">Hyde Medical (China)</option>
              <option value="Angell">Angell (China)</option>
              <option value="Innocare">Innocare (Taiwan)</option>
            </select>
          </Field>
          <Field label={lang === 'id' ? 'Asal Kota/Negara' : 'Origin'}><input value={form.principalOrigin} onChange={e => update('principalOrigin', e.target.value)} placeholder="Shanghai, China" /></Field>
          <Field label={t.ops_vessel}><input value={form.vessel} onChange={e => update('vessel', e.target.value)} placeholder="MV Wan Hai 503" /></Field>
          <Field label={t.ops_container_no}><input value={form.containerNo} onChange={e => update('containerNo', e.target.value)} placeholder="WHLU-7234567" /></Field>
          <Field label={t.ops_etd}><input type="date" value={form.etd} onChange={e => update('etd', e.target.value)} /></Field>
          <Field label={t.ops_eta}><input type="date" value={form.eta} onChange={e => update('eta', e.target.value)} /></Field>
          <Field label={t.ops_port_of_loading}><input value={form.portOfLoading} onChange={e => update('portOfLoading', e.target.value)} /></Field>
          <Field label={t.ops_port_of_discharge}><input value={form.portOfDischarge} onChange={e => update('portOfDischarge', e.target.value)} /></Field>
          <Field label={t.ops_items_count}><input type="number" min="1" value={form.itemsCount} onChange={e => update('itemsCount', parseInt(e.target.value) || 1)} /></Field>
          <Field label={t.ops_total_value + ' (Rp)'}><input type="number" value={form.totalValue} onChange={e => update('totalValue', parseFloat(e.target.value) || 0)} /></Field>
          <Field label={t.ops_freight_cost + ' (Rp)'}><input type="number" value={form.freightCost} onChange={e => update('freightCost', parseFloat(e.target.value) || 0)} /></Field>
          <Field label={t.ops_insurance + ' (Rp)'}><input type="number" value={form.insurance} onChange={e => update('insurance', parseFloat(e.target.value) || 0)} /></Field>
          <Field label="Ref PI BAPETEN" full><input value={form.piRef} onChange={e => update('piRef', e.target.value)} placeholder="BAPETEN/PI/2026/00xxx" /></Field>
          <Field label={t.ops_shipping_notes} full><textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} /></Field>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
          <button className="btn-primary" onClick={() => onSave(form)}>{t.crud_save}</button>
        </div>
      </div>
    </div>
  );
}

// ============== Customs Doc Modal ==============
function CustomsDocModal({ record, manifests, onSave, onClose, t, lang }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState(record || {
    id: 'doc_' + Date.now(),
    docNo: '', docType: 'invoice', manifestRef: '',
    principal: '', docDate: today, status: 'received',
    fileUrl: '', notes: '',
  });
  const isEdit = !!record;
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '640px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.ops_modal_edit_customs : t.ops_modal_add_customs}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#8a7d5c'}}><X size={20} /></button>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <Field label={t.ops_doc_no}><input value={form.docNo} onChange={e => update('docNo', e.target.value)} placeholder="INV-2026-001" /></Field>
          <Field label={t.ops_doc_type}>
            <select value={form.docType} onChange={e => update('docType', e.target.value)}>
              <option value="invoice">{t.ops_doc_invoice}</option>
              <option value="packing">{t.ops_doc_packing}</option>
              <option value="bl">{t.ops_doc_bl}</option>
              <option value="coo">{t.ops_doc_coo}</option>
              <option value="inspection">{t.ops_doc_inspection}</option>
              <option value="pi_bapeten">{t.ops_doc_pi_bapeten}</option>
              <option value="pib">{t.ops_doc_pib}</option>
              <option value="other">{t.ops_doc_other}</option>
            </select>
          </Field>
          <Field label={t.imp_principal}>
            <select value={form.principal} onChange={e => update('principal', e.target.value)}>
              <option value="">—</option>
              <option value="SG Healthcare">SG Healthcare</option>
              <option value="ANKE">ANKE</option>
              <option value="SINO MDT">SINO MDT</option>
              <option value="Hyde Medical">Hyde Medical</option>
              <option value="Angell">Angell</option>
              <option value="Innocare">Innocare</option>
            </select>
          </Field>
          <Field label={lang === 'id' ? 'Ref Manifest' : 'Manifest Ref'}>
            <select value={form.manifestRef} onChange={e => update('manifestRef', e.target.value)}>
              <option value="">—</option>
              {manifests.map(m => <option key={m.id} value={m.manifestNo}>{m.manifestNo} — {m.principal}</option>)}
            </select>
          </Field>
          <Field label={t.ops_doc_date}><input type="date" value={form.docDate} onChange={e => update('docDate', e.target.value)} /></Field>
          <Field label={t.ops_doc_status}>
            <select value={form.status} onChange={e => update('status', e.target.value)}>
              <option value="received">{t.ops_doc_received}</option>
              <option value="submitted">{t.ops_doc_submitted}</option>
              <option value="approved">{t.ops_doc_approved}</option>
              <option value="rejected">{t.ops_doc_rejected}</option>
            </select>
          </Field>
          <Field label={t.ops_doc_file_url} full><input type="url" value={form.fileUrl} onChange={e => update('fileUrl', e.target.value)} placeholder="https://drive.google.com/..." /></Field>
          <Field label={t.notes} full><textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} /></Field>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
          <button className="btn-primary" onClick={() => onSave(form)}>{t.crud_save}</button>
        </div>
      </div>
    </div>
  );
}

function InstallationModule({ data, setData, installRecords, setInstallRecords, bastRecords, setBastRecords, trainingRecords, setTrainingRecords, t, lang, canEdit, fmt }) {
  const [tab, setTab] = useState('progress');
  const installProjects = data.filter(s => s.poStatus === 'issued' && (s.shippingStatus === 'delivered' || s.installationStatus));
  const toggleStep = (id, field) => { if (!canEdit) return; setData(prev => prev.map(s => s.id === id ? { ...s, [field]: !s[field] } : s)); };

  const installSteps = [
    { id: 'installation_done', label: t.installation_done, icon: Wrench },
    { id: 'functionTest', label: t.function_test, icon: CheckCircle2 },
    { id: 'exposureTest', label: t.exposure_test, icon: CheckCircle2 },
    { id: 'trainingCert', label: t.training_cert, icon: FileCheck },
    { id: 'bapetenPermit', label: t.bapeten_permit, icon: Shield },
  ];

  // KPI calculations
  const totalRecords = installRecords.length;
  const inProgressCount = installRecords.filter(r => r.status === 'progress').length;
  const completedCount = installRecords.filter(r => r.status === 'completed').length;
  const bastSignedCount = bastRecords.filter(b => b.status === 'signed').length;
  const trainingDoneCount = trainingRecords.filter(t => t.status === 'completed').length;

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: '#8a7d5c', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_installation}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.installation_title}</h1>
        <div style={{fontSize: '13px', color: '#8a7d5c', marginTop: '6px'}}>{t.installation_subtitle}</div>
      </div>
      {!canEdit && <ReadOnlyBanner t={t} />}

      {/* KPI Cards */}
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1px', background: '#d4cdb8', marginBottom: '22px', border: '1px solid #d4cdb8'}}>
        <div style={{padding: '16px 18px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.inst_total_records}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '4px'}}>{totalRecords}</div>
        </div>
        <div style={{padding: '16px 18px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.inst_in_progress}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '4px', color: '#c8a96a'}}>{inProgressCount}</div>
        </div>
        <div style={{padding: '16px 18px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.inst_completed_count}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '4px', color: '#3a6b3a'}}>{completedCount}</div>
        </div>
        <div style={{padding: '16px 18px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.inst_bast_signed}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '4px', color: '#1a4d8a'}}>{bastSignedCount}</div>
        </div>
        <div style={{padding: '16px 18px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.inst_training_done}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '4px', color: '#7b3fb5'}}>{trainingDoneCount}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid #d4cdb8', flexWrap: 'wrap'}}>
        {[
          { id: 'progress', label: t.inst_tab_progress, icon: Wrench, count: installProjects.length },
          { id: 'records', label: t.inst_tab_records, icon: ClipboardList, count: installRecords.length },
          { id: 'bast', label: t.inst_tab_bast, icon: FileCheck, count: bastRecords.length },
          { id: 'training', label: t.inst_tab_training, icon: Users, count: trainingRecords.length },
        ].map(tb => {
          const Icon = tb.icon;
          const active = tab === tb.id;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: active ? '#1a2942' : '#8a7d5c', borderBottom: active ? '2px solid #1a2942' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px', letterSpacing: '0.03em'}}>
              <Icon size={14} strokeWidth={1.5} />{tb.label}
              <span style={{padding: '2px 7px', background: active ? '#1a2942' : '#e8e1cc', color: active ? '#f8f5ef' : '#8a7d5c', fontSize: '10px', fontWeight: 600, borderRadius: '10px'}}>{tb.count}</span>
            </button>
          );
        })}
      </div>

      {tab === 'progress' && (
        <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
          {installProjects.map(p => (
            <div key={p.id} style={{padding: '18px', background: '#fefcf7', border: '1px solid #e8e1cc'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '10px'}}>
                <div>
                  <div style={{fontSize: '14px', fontWeight: 600}}>{p.customer}</div>
                  <div style={{fontSize: '11px', color: '#8a7d5c', marginTop: '2px'}}>{p.subModality} · <span className="mono">{p.sphNo}</span></div>
                </div>
                <div className="mono" style={{fontSize: '13px', fontWeight: 500}}>{fmt(p.totalValue)}</div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px'}}>
                {installSteps.map(step => {
                  const Icon = step.icon;
                  const done = p[step.id];
                  return (
                    <button key={step.id} onClick={() => toggleStep(p.id, step.id)} disabled={!canEdit} style={{padding: '11px', fontSize: '11px', fontFamily: 'inherit', background: done ? '#3a6b3a' : 'transparent', color: done ? '#fff' : '#8a7d5c', border: `1px solid ${done ? '#3a6b3a' : '#d4cdb8'}`, cursor: canEdit ? 'pointer' : 'default', fontWeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', textAlign: 'center'}}>
                      <Icon size={17} strokeWidth={1.5} />{step.label}
                      {done && <span style={{fontSize: '9px', letterSpacing: '0.1em'}}>✓ DONE</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {installProjects.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#8a7d5c', background: '#fefcf7', border: '1px solid #e8e1cc'}}>{t.no_data}</div>}
        </div>
      )}

      {tab === 'records' && <InstallRecordsList records={installRecords} setRecords={setInstallRecords} t={t} lang={lang} canEdit={canEdit} />}
      {tab === 'bast' && <BASTList records={bastRecords} setRecords={setBastRecords} t={t} lang={lang} canEdit={canEdit} />}
      {tab === 'training' && <TrainingCertList records={trainingRecords} setRecords={setTrainingRecords} t={t} lang={lang} canEdit={canEdit} />}
    </div>
  );
}

// ============== Install Records List ==============
function InstallRecordsList({ records, setRecords, t, lang, canEdit }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const statusColors = { planning: '#94a3b8', progress: '#c8a96a', completed: '#3a6b3a', delayed: '#c03030' };

  const handleSave = (rec) => {
    setRecords(prev => {
      const exists = prev.find(r => r.id === rec.id);
      return exists ? prev.map(r => r.id === rec.id ? rec : r) : [...prev, rec];
    });
    setModalOpen(false); setEditingRecord(null);
  };
  const handleDelete = (id) => {
    if (!canEdit) return;
    if (confirm(t.crud_confirm_delete)) setRecords(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div style={{background: '#fefcf7', border: '1px solid #e8e1cc'}}>
      <div style={{padding: '14px 18px', borderBottom: '1px solid #e8e1cc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
        <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.inst_tab_records}</div>
        {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
      </div>
      {records.map(r => {
        const statusColor = statusColors[r.status];
        return (
          <div key={r.id} style={{padding: '16px 18px', borderTop: '1px solid #e8e1cc'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '10px'}}>
              <div style={{flex: '1 1 320px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap'}}>
                  <span className="mono" style={{fontSize: '12px', fontWeight: 700, color: '#1a2942'}}>{r.recordNo}</span>
                  <span style={{fontSize: '11px', color: '#8a7d5c'}}>· {r.customer}</span>
                </div>
                <div style={{fontSize: '12px', fontWeight: 500, marginTop: '4px'}}>{r.modality} · {r.subModality}</div>
                <div style={{fontSize: '10px', color: '#8a7d5c', marginTop: '4px'}}>👷 {r.leadTechnician} (Team: {r.teamSize})</div>
              </div>
              <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px'}}>
                <span style={{padding: '4px 10px', fontSize: '10px', background: statusColor + '25', color: statusColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`inst_status_${r.status}`]}</span>
                {canEdit && (
                  <div style={{display: 'flex', gap: '4px'}}>
                    <button onClick={() => { setEditingRecord(r); setModalOpen(true); }} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#1a2942', fontFamily: 'inherit'}}><Edit2 size={11} /></button>
                    <button onClick={() => handleDelete(r.id)} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>
                  </div>
                )}
              </div>
            </div>
            <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '10px', color: '#8a7d5c', marginBottom: '8px'}}>
              <span><strong>Mulai:</strong> <span className="mono">{r.installStart || '—'}</span></span>
              <span><strong>Selesai:</strong> <span className="mono">{r.installEnd || '—'}</span></span>
              {r.duration && <span><strong>Durasi:</strong> {r.duration} hari</span>}
            </div>
            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '10px', marginBottom: '8px'}}>
              <span style={{padding: '2px 7px', background: r.roomReady ? '#3a6b3a25' : '#c0303025', color: r.roomReady ? '#3a6b3a' : '#c03030', fontWeight: 600}}>{r.roomReady ? '✓' : '✗'} Ruangan</span>
              <span style={{padding: '2px 7px', background: r.electricalReady ? '#3a6b3a25' : '#c0303025', color: r.electricalReady ? '#3a6b3a' : '#c03030', fontWeight: 600}}>{r.electricalReady ? '✓' : '✗'} Listrik</span>
              <span style={{padding: '2px 7px', background: r.calibrationDone ? '#3a6b3a25' : '#c0303025', color: r.calibrationDone ? '#3a6b3a' : '#c03030', fontWeight: 600}}>{r.calibrationDone ? '✓' : '✗'} Kalibrasi</span>
            </div>
            {r.notes && <div style={{padding: '8px 10px', background: '#f0ebe0', fontSize: '11px', fontStyle: 'italic', color: '#1a2942'}}>📝 {r.notes}</div>}
          </div>
        );
      })}
      {records.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#8a7d5c'}}>{t.no_data}</div>}
      {modalOpen && <InstallRecordModal record={editingRecord} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} />}
    </div>
  );
}

// ============== BAST List ==============
function BASTList({ records, setRecords, t, lang, canEdit }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const statusColors = { draft: '#94a3b8', pending: '#c8a96a', signed: '#3a6b3a' };

  const handleSave = (rec) => {
    setRecords(prev => {
      const exists = prev.find(r => r.id === rec.id);
      return exists ? prev.map(r => r.id === rec.id ? rec : r) : [...prev, rec];
    });
    setModalOpen(false); setEditingRecord(null);
  };
  const handleDelete = (id) => {
    if (!canEdit) return;
    if (confirm(t.crud_confirm_delete)) setRecords(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div style={{background: '#fefcf7', border: '1px solid #e8e1cc'}}>
      <div style={{padding: '14px 18px', borderBottom: '1px solid #e8e1cc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
        <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.inst_tab_bast}</div>
        {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
      </div>
      {records.map(r => {
        const statusColor = statusColors[r.status];
        return (
          <div key={r.id} style={{padding: '16px 18px', borderTop: '1px solid #e8e1cc'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '10px'}}>
              <div style={{flex: '1 1 320px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap'}}>
                  <span className="mono" style={{fontSize: '12px', fontWeight: 700, color: '#1a2942'}}>{r.bastNo}</span>
                </div>
                <div style={{fontSize: '12px', fontWeight: 600, marginTop: '4px'}}>{r.customer}</div>
                <div style={{fontSize: '11px', color: '#8a7d5c', marginTop: '2px'}}>{r.modality} · {r.subModality}</div>
                {r.signedDate && <div style={{fontSize: '10px', color: '#3a6b3a', marginTop: '4px', fontWeight: 600}} className="mono">✓ Tertanda: {r.signedDate}</div>}
              </div>
              <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px'}}>
                <span style={{padding: '4px 10px', fontSize: '10px', background: statusColor + '25', color: statusColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`bast_status_${r.status}`]}</span>
                {r.docUrl && <a href={r.docUrl} target="_blank" rel="noopener noreferrer" style={{fontSize: '10px', color: '#5b87b8'}}>📎 {lang === 'id' ? 'Lihat Dokumen' : 'View Document'}</a>}
                {canEdit && (
                  <div style={{display: 'flex', gap: '4px'}}>
                    <button onClick={() => { setEditingRecord(r); setModalOpen(true); }} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#1a2942', fontFamily: 'inherit'}}><Edit2 size={11} /></button>
                    <button onClick={() => handleDelete(r.id)} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>
                  </div>
                )}
              </div>
            </div>
            <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '10px', color: '#8a7d5c', marginBottom: '8px'}}>
              <span><strong>HNTI:</strong> {r.hntiRep || '—'}</span>
              <span><strong>Customer:</strong> {r.customerRep || '—'}</span>
              {r.witness && <span><strong>Saksi:</strong> {r.witness}</span>}
            </div>
            {r.notes && <div style={{padding: '8px 10px', background: '#f0ebe0', fontSize: '11px', fontStyle: 'italic', color: '#1a2942'}}>📝 {r.notes}</div>}
          </div>
        );
      })}
      {records.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#8a7d5c'}}>{t.no_data}</div>}
      {modalOpen && <BASTModal record={editingRecord} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} />}
    </div>
  );
}

// ============== Training Cert List ==============
function TrainingCertList({ records, setRecords, t, lang, canEdit }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const statusColors = { pending: '#c8a96a', completed: '#3a6b3a' };

  const handleSave = (rec) => {
    setRecords(prev => {
      const exists = prev.find(r => r.id === rec.id);
      return exists ? prev.map(r => r.id === rec.id ? rec : r) : [...prev, rec];
    });
    setModalOpen(false); setEditingRecord(null);
  };
  const handleDelete = (id) => {
    if (!canEdit) return;
    if (confirm(t.crud_confirm_delete)) setRecords(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div style={{background: '#fefcf7', border: '1px solid #e8e1cc'}}>
      <div style={{padding: '14px 18px', borderBottom: '1px solid #e8e1cc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
        <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.inst_tab_training}</div>
        {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
      </div>
      {records.map(r => {
        const statusColor = statusColors[r.status];
        return (
          <div key={r.id} style={{padding: '16px 18px', borderTop: '1px solid #e8e1cc'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '10px'}}>
              <div style={{flex: '1 1 320px'}}>
                {r.certNo && <div className="mono" style={{fontSize: '12px', fontWeight: 700, color: '#1a2942', marginBottom: '4px'}}>{r.certNo}</div>}
                <div style={{fontSize: '12px', fontWeight: 600}}>{r.customer}</div>
                <div style={{fontSize: '11px', color: '#8a7d5c', marginTop: '2px'}}>{r.modality} · {r.subModality}</div>
                {r.instructor && <div style={{fontSize: '10px', color: '#8a7d5c', marginTop: '4px'}}>🎓 {r.instructor}</div>}
              </div>
              <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px'}}>
                <span style={{padding: '4px 10px', fontSize: '10px', background: statusColor + '25', color: statusColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{r.status === 'completed' ? t.train_completed : t.train_pending}</span>
                {r.certUrl && <a href={r.certUrl} target="_blank" rel="noopener noreferrer" style={{fontSize: '10px', color: '#5b87b8'}}>📎 {lang === 'id' ? 'Sertifikat' : 'Certificate'}</a>}
                {canEdit && (
                  <div style={{display: 'flex', gap: '4px'}}>
                    <button onClick={() => { setEditingRecord(r); setModalOpen(true); }} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#1a2942', fontFamily: 'inherit'}}><Edit2 size={11} /></button>
                    <button onClick={() => handleDelete(r.id)} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>
                  </div>
                )}
              </div>
            </div>
            <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '10px', color: '#8a7d5c', marginBottom: '8px'}}>
              {r.sessionDate && <span><strong>Tgl:</strong> <span className="mono">{r.sessionDate}</span></span>}
              {r.participants > 0 && <span><strong>Peserta:</strong> {r.participants}</span>}
              {r.duration > 0 && <span><strong>Durasi:</strong> {r.duration} jam</span>}
            </div>
            {r.topics && <div style={{padding: '8px 10px', background: '#f0ebe0', fontSize: '11px', color: '#1a2942', marginBottom: '8px'}}><strong>Topik:</strong> {r.topics}</div>}
            {r.notes && <div style={{padding: '8px 10px', background: '#f0ebe0', fontSize: '11px', fontStyle: 'italic', color: '#1a2942'}}>📝 {r.notes}</div>}
          </div>
        );
      })}
      {records.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#8a7d5c'}}>{t.no_data}</div>}
      {modalOpen && <TrainingCertModal record={editingRecord} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} />}
    </div>
  );
}

// ============== Install Record Modal ==============
function InstallRecordModal({ record, onSave, onClose, t, lang }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState(record || {
    id: 'inst_' + Date.now(),
    recordNo: 'BA-INST-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-3),
    customer: '', modality: 'CT Scan', subModality: '',
    installStart: today, installEnd: '', duration: null,
    leadTechnician: 'Budi Hartono', teamSize: 2,
    roomReady: false, electricalReady: false, calibrationDone: false,
    status: 'planning', notes: '',
  });
  const isEdit = !!record;
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.inst_modal_edit_record : t.inst_modal_add_record}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#8a7d5c'}}><X size={20} /></button>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <Field label={t.inst_record_no}><input value={form.recordNo} onChange={e => update('recordNo', e.target.value)} /></Field>
          <Field label={t.inst_record_status}>
            <select value={form.status} onChange={e => update('status', e.target.value)}>
              <option value="planning">{t.inst_status_planning}</option>
              <option value="progress">{t.inst_status_progress}</option>
              <option value="completed">{t.inst_status_completed}</option>
              <option value="delayed">{t.inst_status_delayed}</option>
            </select>
          </Field>
          <Field label={t.customer} full><input value={form.customer} onChange={e => update('customer', e.target.value)} placeholder="RS / Klinik" /></Field>
          <Field label={t.modality}>
            <select value={form.modality} onChange={e => update('modality', e.target.value)}>
              {Object.keys(MODALITY_COLORS).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Sub-Modalitas"><input value={form.subModality} onChange={e => update('subModality', e.target.value)} /></Field>
          <Field label={t.inst_install_start}><input type="date" value={form.installStart} onChange={e => update('installStart', e.target.value)} /></Field>
          <Field label={t.inst_install_end}><input type="date" value={form.installEnd || ''} onChange={e => update('installEnd', e.target.value)} /></Field>
          <Field label={t.inst_duration}><input type="number" value={form.duration || ''} onChange={e => update('duration', parseInt(e.target.value) || null)} /></Field>
          <Field label={t.inst_lead_technician}><input value={form.leadTechnician} onChange={e => update('leadTechnician', e.target.value)} /></Field>
          <Field label={t.inst_team_size}><input type="number" min="1" value={form.teamSize} onChange={e => update('teamSize', parseInt(e.target.value) || 1)} /></Field>
          <Field label={t.inst_room_ready}>
            <select value={form.roomReady ? 'yes' : 'no'} onChange={e => update('roomReady', e.target.value === 'yes')}>
              <option value="no">{lang === 'id' ? 'Belum Siap' : 'Not Ready'}</option>
              <option value="yes">{lang === 'id' ? 'Siap' : 'Ready'}</option>
            </select>
          </Field>
          <Field label={t.inst_electrical_ready}>
            <select value={form.electricalReady ? 'yes' : 'no'} onChange={e => update('electricalReady', e.target.value === 'yes')}>
              <option value="no">{lang === 'id' ? 'Belum Siap' : 'Not Ready'}</option>
              <option value="yes">{lang === 'id' ? 'Siap' : 'Ready'}</option>
            </select>
          </Field>
          <Field label={t.inst_calibration_done}>
            <select value={form.calibrationDone ? 'yes' : 'no'} onChange={e => update('calibrationDone', e.target.value === 'yes')}>
              <option value="no">{lang === 'id' ? 'Belum' : 'Not Done'}</option>
              <option value="yes">{lang === 'id' ? 'Selesai' : 'Done'}</option>
            </select>
          </Field>
          <Field label={t.notes} full><textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} /></Field>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
          <button className="btn-primary" onClick={() => onSave(form)}>{t.crud_save}</button>
        </div>
      </div>
    </div>
  );
}

// ============== BAST Modal ==============
function BASTModal({ record, onSave, onClose, t, lang }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState(record || {
    id: 'bast_' + Date.now(),
    bastNo: 'BAST-HNTI-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-3),
    customer: '', modality: 'CT Scan', subModality: '',
    signedDate: '', hntiRep: 'Fajrin (CEO HNTI)',
    customerRep: '', witness: '',
    status: 'draft', docUrl: '', notes: '',
  });
  const isEdit = !!record;
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.inst_modal_edit_bast : t.inst_modal_add_bast}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#8a7d5c'}}><X size={20} /></button>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <Field label={t.bast_no}><input value={form.bastNo} onChange={e => update('bastNo', e.target.value)} /></Field>
          <Field label="Status">
            <select value={form.status} onChange={e => update('status', e.target.value)}>
              <option value="draft">{t.bast_status_draft}</option>
              <option value="pending">{t.bast_status_pending}</option>
              <option value="signed">{t.bast_status_signed}</option>
            </select>
          </Field>
          <Field label={t.customer} full><input value={form.customer} onChange={e => update('customer', e.target.value)} /></Field>
          <Field label={t.modality}>
            <select value={form.modality} onChange={e => update('modality', e.target.value)}>
              {Object.keys(MODALITY_COLORS).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Sub-Modalitas"><input value={form.subModality} onChange={e => update('subModality', e.target.value)} /></Field>
          <Field label={t.bast_signed_date}><input type="date" value={form.signedDate || ''} onChange={e => update('signedDate', e.target.value)} /></Field>
          <Field label={t.bast_hnti_rep}><input value={form.hntiRep} onChange={e => update('hntiRep', e.target.value)} placeholder="Fajrin (CEO HNTI)" /></Field>
          <Field label={t.bast_customer_rep}><input value={form.customerRep} onChange={e => update('customerRep', e.target.value)} placeholder="dr. Nama, Sp.Rad" /></Field>
          <Field label={t.bast_witness} full><input value={form.witness} onChange={e => update('witness', e.target.value)} placeholder="Notaris / Saksi" /></Field>
          <Field label={t.bast_doc_url} full><input type="url" value={form.docUrl} onChange={e => update('docUrl', e.target.value)} placeholder="https://drive.google.com/..." /></Field>
          <Field label={t.bast_notes} full><textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} /></Field>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
          <button className="btn-primary" onClick={() => onSave(form)}>{t.crud_save}</button>
        </div>
      </div>
    </div>
  );
}

// ============== Training Cert Modal ==============
function TrainingCertModal({ record, onSave, onClose, t, lang }) {
  const [form, setForm] = useState(record || {
    id: 'train_' + Date.now(),
    certNo: 'CERT-HNTI-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-3),
    customer: '', modality: 'CT Scan', subModality: '',
    sessionDate: '', participants: 0, instructor: '',
    duration: 0, topics: '', status: 'pending', certUrl: '', notes: '',
  });
  const isEdit = !!record;
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.inst_modal_edit_training : t.inst_modal_add_training}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#8a7d5c'}}><X size={20} /></button>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <Field label={t.train_cert_no}><input value={form.certNo} onChange={e => update('certNo', e.target.value)} /></Field>
          <Field label="Status">
            <select value={form.status} onChange={e => update('status', e.target.value)}>
              <option value="pending">{t.train_pending}</option>
              <option value="completed">{t.train_completed}</option>
            </select>
          </Field>
          <Field label={t.customer} full><input value={form.customer} onChange={e => update('customer', e.target.value)} /></Field>
          <Field label={t.modality}>
            <select value={form.modality} onChange={e => update('modality', e.target.value)}>
              {Object.keys(MODALITY_COLORS).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Sub-Modalitas"><input value={form.subModality} onChange={e => update('subModality', e.target.value)} /></Field>
          <Field label={t.train_session_date}><input type="date" value={form.sessionDate || ''} onChange={e => update('sessionDate', e.target.value)} /></Field>
          <Field label={t.train_participants}><input type="number" min="0" value={form.participants} onChange={e => update('participants', parseInt(e.target.value) || 0)} /></Field>
          <Field label={t.train_duration}><input type="number" min="0" value={form.duration} onChange={e => update('duration', parseInt(e.target.value) || 0)} /></Field>
          <Field label={t.train_instructor} full><input value={form.instructor} onChange={e => update('instructor', e.target.value)} placeholder="Nama instruktur / engineer principal" /></Field>
          <Field label={t.train_topics} full><textarea rows={2} value={form.topics} onChange={e => update('topics', e.target.value)} placeholder="Operasional, safety, troubleshooting..." /></Field>
          <Field label={t.train_cert_url} full><input type="url" value={form.certUrl} onChange={e => update('certUrl', e.target.value)} placeholder="https://drive.google.com/..." /></Field>
          <Field label={t.notes} full><textarea rows={2} value={form.notes} onChange={e => update('notes', e.target.value)} /></Field>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
          <button className="btn-primary" onClick={() => onSave(form)}>{t.crud_save}</button>
        </div>
      </div>
    </div>
  );
}

function Valuation({ data, t, lang, fmt }) {
  const activeData = data.filter(s => s.status === 'active');
  const wonData = data.filter(s => s.status === 'won');
  const weightedPipeline = activeData.reduce((s, p) => s + (p.totalValue * p.probability / 100), 0);
  const revenueYTD = wonData.reduce((s, p) => s + p.totalValue, 0);
  const projectedAnnualRevenue = revenueYTD * 3 + weightedPipeline * 0.6;
  const revenueMultiplier = 1.8;
  const currentValuation = projectedAnnualRevenue * revenueMultiplier;

  const ipoScore = Math.min(100, Math.round(
    (activeData.length >= 10 ? 25 : activeData.length * 2.5) +
    (revenueYTD > 0 ? 20 : 0) +
    (Math.min(weightedPipeline / 50e9, 1) * 25) +
    (wonData.length >= 1 ? 15 : 0) + 15
  ));

  const monthlyProjection = Array.from({length: 12}, (_, i) => {
    const month = new Date(2026, 4 + i, 1).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'short' });
    return { month, valuation: currentValuation * (1 + i * 0.08), revenue: projectedAnnualRevenue * (1 + i * 0.05) / 12 };
  });

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: '#8a7d5c', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_valuation}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.valuation_title}</h1>
        <div style={{fontSize: '13px', color: '#8a7d5c', marginTop: '6px'}}>{t.valuation_subtitle}</div>
      </div>

      <div style={{padding: '12px 16px', background: 'rgba(200,169,106,0.12)', borderLeft: '3px solid #c8a96a', marginBottom: '24px', fontSize: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px'}}>
        <AlertCircle size={16} style={{flexShrink: 0, marginTop: '1px'}} />
        <span>{lang === 'id' ? 'Estimasi valuasi bersifat indikatif. Untuk valuasi resmi diperlukan due diligence oleh financial advisor.' : 'Valuation estimate is indicative. Official valuation requires due diligence by a financial advisor.'}</span>
      </div>

      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#d4cdb8', marginBottom: '24px', border: '1px solid #d4cdb8'}}>
        <KPICard label={t.current_valuation} value={fmt(currentValuation)} sublabel={`@ ${revenueMultiplier}x revenue`} trend={14.2} />
        <KPICard label={t.projected_revenue} value={fmt(projectedAnnualRevenue)} sublabel={lang === 'id' ? 'Tahunan' : 'Annualized'} trend={18.5} />
        <KPICard label={t.pipeline_multiplier} value={`${revenueMultiplier}x`} sublabel="Medical device" trend={2.1} />
        <KPICard label={t.ipo_readiness} value={`${ipoScore}%`} sublabel={ipoScore >= 70 ? 'Pre-IPO ready' : 'Building'} trend={ipoScore >= 70 ? 8.0 : 12.5} />
      </div>

      <div className="card">
        <div className="card-title">{lang === 'id' ? 'Proyeksi Valuasi 12 Bulan' : '12-Month Valuation Projection'}</div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={monthlyProjection} margin={{top: 10, right: 16, left: 0, bottom: 0}}>
            <defs><linearGradient id="vg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c8a96a" stopOpacity={0.5} /><stop offset="100%" stopColor="#c8a96a" stopOpacity={0.05} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e1cc" vertical={false} />
            <XAxis dataKey="month" stroke="#8a7d5c" style={{fontSize: 10}} />
            <YAxis stroke="#8a7d5c" style={{fontSize: 10}} tickFormatter={(v) => v >= 1e9 ? `${(v/1e9).toFixed(0)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v} />
            <Tooltip content={<ChartTooltip fmt={fmt} />} />
            <Legend wrapperStyle={{fontSize: '11px'}} />
            <Area type="monotone" dataKey="valuation" name={t.current_valuation} stroke="#c8a96a" strokeWidth={2.5} fill="url(#vg1)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SPHModal({ sph, t, lang, onSave, onClose, fmtFull }) {
  const [form, setForm] = useState(sph || {
    sphNo: `SPH/2026/${String(Date.now()).slice(-3)}`,
    customer: '', customerType: 'hospital', projectType: 'private',
    modality: 'CT Scan', subModality: '', qty: 1, unitPrice: 0, totalValue: 0,
    issuedDate: '2026-05-16', salesOwner: 'lukman', region: 'Jateng',
    status: 'active', stage: 'sph_sent', probability: 20,
    notes: '', nextAction: '', lastUpdate: '2026-05-16',
    poStatus: null, dpPaid: false, finalPaid: false, shippingStatus: null, customsStatus: null,
  });

  const update = (k, v) => {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      if (k === 'qty' || k === 'unitPrice') next.totalValue = (next.qty || 0) * (next.unitPrice || 0);
      if (k === 'stage') {
        const stage = STAGES.find(s => s.id === v);
        if (stage) next.probability = stage.baseProbability;
        if (v === 'po_issued') next.poStatus = 'issued';
      }
      return next;
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h2 className="serif" style={{fontSize: '24px', margin: 0, fontWeight: 500}}>{sph ? t.edit_sph : t.add_new_sph}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#8a7d5c'}}><X size={20} /></button>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          {[
            ['sphNo', t.sph_number, 'text'],
            ['issuedDate', t.issued_date, 'date'],
            ['customer', t.customer, 'text', true],
          ].map(([k, l, ty, full]) => (
            <div key={k} style={{gridColumn: full ? '1 / -1' : 'auto'}}>
              <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px'}}>{l}</label>
              <input type={ty} value={form[k]} onChange={e => update(k, e.target.value)} />
            </div>
          ))}
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px'}}>{t.customer_type}</label>
            <select value={form.customerType} onChange={e => update('customerType', e.target.value)}>
              <option value="hospital">{t.type_hospital}</option><option value="clinic">{t.type_clinic}</option>
              <option value="subdistributor">{t.type_subdistributor}</option><option value="partner">{t.type_partner}</option>
            </select>
          </div>
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px'}}>{t.project_type}</label>
            <select value={form.projectType} onChange={e => update('projectType', e.target.value)}>
              {PROJECT_TYPES.map(pt => <option key={pt.id} value={pt.id}>{t[`ptype_${pt.id}`]}</option>)}
            </select>
          </div>
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px'}}>{t.sales_owner}</label>
            <select value={form.salesOwner} onChange={e => update('salesOwner', e.target.value)}>
              {SALES_TEAM.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px'}}>{t.modality}</label>
            <select value={form.modality} onChange={e => update('modality', e.target.value)}>
              {Object.keys(MODALITY_COLORS).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div style={{gridColumn: '1 / -1'}}>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px'}}>{lang === 'id' ? 'Sub-Modalitas' : 'Sub-Modality'}</label>
            <input value={form.subModality} onChange={e => update('subModality', e.target.value)} placeholder="e.g. CT 128 Slice" />
          </div>
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px'}}>{t.quantity}</label>
            <input type="number" value={form.qty} onChange={e => update('qty', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px'}}>{lang === 'id' ? 'Harga Unit (Rp)' : 'Unit Price (Rp)'}</label>
            <input type="number" value={form.unitPrice} onChange={e => update('unitPrice', parseFloat(e.target.value) || 0)} />
          </div>
          <div style={{gridColumn: '1 / -1'}}>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px'}}>{t.total_value}</label>
            <div style={{padding: '10px 14px', background: '#f0ebe0', fontSize: '14px', fontWeight: 500}} className="mono">{fmtFull(form.totalValue)}</div>
          </div>
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px'}}>{lang === 'id' ? 'Tahapan' : 'Stage'}</label>
            <select value={form.stage} onChange={e => update('stage', e.target.value)}>
              {STAGES.map(s => <option key={s.id} value={s.id}>{t[`stage_${s.id}`]}</option>)}
            </select>
          </div>
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px'}}>{t.status}</label>
            <select value={form.status} onChange={e => update('status', e.target.value)}>
              <option value="active">{t.status_active}</option><option value="won">{t.status_won}</option><option value="lost">{t.status_lost}</option>
            </select>
          </div>
          {form.stage === 'tender' && (
            <div style={{gridColumn: '1 / -1'}}>
              <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px'}}>{lang === 'id' ? 'Sub-Tahapan Tender' : 'Tender Sub-Stage'}</label>
              <select value={form.tenderSubStage || ''} onChange={e => update('tenderSubStage', e.target.value)}>
                <option value="">—</option>
                {TENDER_SUBSTAGES.map(s => <option key={s} value={s}>{t[`tender_${s}`]}</option>)}
              </select>
            </div>
          )}
          <div style={{gridColumn: '1 / -1'}}>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px'}}>{t.probability} (%)</label>
            <input type="number" min="0" max="100" value={form.probability} onChange={e => update('probability', parseInt(e.target.value) || 0)} />
          </div>
          <div style={{gridColumn: '1 / -1'}}>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px'}}>{t.next_action}</label>
            <input value={form.nextAction} onChange={e => update('nextAction', e.target.value)} />
          </div>
          <div style={{gridColumn: '1 / -1'}}>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '6px'}}>{t.notes}</label>
            <textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} />
          </div>
        </div>

        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.cancel}</button>
          <button className="btn-primary" onClick={() => onSave(form)}>{t.save}</button>
        </div>
      </div>
    </div>
  );
}

function Footer({ t }) {
  return (
    <footer style={{borderTop: '1px solid #d4cdb8', padding: '24px 48px', marginTop: '40px'}}>
      <div style={{maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
          <IMSLogo size="sm" />
          <span style={{fontSize: '11px', color: '#8a7d5c'}}>· {t.company}</span>
        </div>
        <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>Phase 16 · © 2026</div>
      </div>
    </footer>
  );
}

// ============== Maintenance Module ==============
function MaintenanceModule({ units, issues, setIssues, pmSchedule, setPmSchedule, t, lang, canEdit, session }) {
  const [tab, setTab] = useState('schedule');
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [pmModalOpen, setPmModalOpen] = useState(false);
  const [editingPm, setEditingPm] = useState(null);

  const today = new Date('2026-05-16');
  const monthAhead = new Date('2026-06-16');

  // Categorize units by PM status
  const unitsByPmStatus = units.map(u => {
    const nextPm = new Date(u.nextPmDate);
    let pmStatus;
    if (nextPm < today) pmStatus = 'overdue';
    else if (nextPm < monthAhead) pmStatus = 'upcoming';
    else pmStatus = 'scheduled';
    const warrantyEnd = new Date(u.warrantyEnd);
    const underWarranty = warrantyEnd >= today;
    return { ...u, pmStatus, underWarranty };
  });

  const totalUnits = units.length;
  const underWarranty = unitsByPmStatus.filter(u => u.underWarranty).length;
  const pmThisMonth = unitsByPmStatus.filter(u => u.pmStatus === 'overdue' || u.pmStatus === 'upcoming').length;
  const openIssues = issues.filter(i => i.status !== 'resolved').length;

  const repairs = issues.filter(i => i.type === 'repair');
  const complaints = issues.filter(i => i.type === 'complaint');

  const updateIssueStatus = (id, newStatus) => {
    if (!canEdit) return;
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
  };

  // CRUD handlers for issues
  const handleSaveIssue = (issue) => {
    setIssues(prev => {
      const exists = prev.find(i => i.id === issue.id);
      return exists ? prev.map(i => i.id === issue.id ? issue : i) : [...prev, issue];
    });
    setIssueModalOpen(false); setEditingIssue(null);
  };
  const handleDeleteIssue = (id) => {
    if (!canEdit) return;
    if (confirm(t.crud_confirm_delete)) setIssues(prev => prev.filter(i => i.id !== id));
  };

  // CRUD handlers for PM
  const handleSavePm = (pm) => {
    setPmSchedule(prev => {
      const exists = prev.find(p => p.id === pm.id);
      return exists ? prev.map(p => p.id === pm.id ? pm : p) : [...prev, pm];
    });
    setPmModalOpen(false); setEditingPm(null);
  };
  const handleDeletePm = (id) => {
    if (!canEdit) return;
    if (confirm(t.crud_confirm_delete)) setPmSchedule(prev => prev.filter(p => p.id !== id));
  };

  const markPmDone = (unitId) => {
    if (!canEdit) return;
    // Add to PM schedule as a "done" record
    const today = new Date().toISOString().split('T')[0];
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 6);
    const newPm = {
      id: 'pm_' + Date.now(),
      unitId,
      lastPmDate: today,
      nextPmDate: nextDate.toISOString().split('T')[0],
      technician: session?.name || 'Budi Hartono',
      status: 'done',
      notes: 'PM rutin selesai 6 bulan'
    };
    setPmSchedule(prev => [...prev, newPm]);
  };

  const priorityColors = { low: '#5b87b8', medium: '#c8a96a', high: '#c03030', critical: '#7b1f1f' };
  const statusColors = { open: '#c03030', progress: '#c8a96a', resolved: '#3a6b3a' };

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: '#8a7d5c', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_maintenance}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.mt_title}</h1>
        <div style={{fontSize: '13px', color: '#8a7d5c', marginTop: '6px'}}>{t.mt_subtitle}</div>
      </div>

      {!canEdit && <ReadOnlyBanner t={t} />}

      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#d4cdb8', marginBottom: '22px', border: '1px solid #d4cdb8'}}>
        <div style={{padding: '18px 20px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.mt_total_units}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalUnits}</div>
        </div>
        <div style={{padding: '18px 20px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.mt_units_warranty}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#3a6b3a'}}>{underWarranty}</div>
        </div>
        <div style={{padding: '18px 20px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.mt_pm_this_month}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#c8a96a'}}>{pmThisMonth}</div>
        </div>
        <div style={{padding: '18px 20px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.mt_open_issues}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#c03030'}}>{openIssues}</div>
        </div>
      </div>

      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid #d4cdb8', flexWrap: 'wrap'}}>
        {[
          { id: 'schedule', label: t.mt_tab_schedule, icon: CalendarDays },
          { id: 'repair', label: t.mt_tab_repair, icon: Wrench },
          { id: 'complaint', label: t.mt_tab_complaint, icon: AlertTriangle },
        ].map(tb => {
          const Icon = tb.icon;
          const active = tab === tb.id;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '10px 18px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: active ? '#1a2942' : '#8a7d5c', borderBottom: active ? '2px solid #1a2942' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px', letterSpacing: '0.03em'}}>
              <Icon size={14} strokeWidth={1.5} />{tb.label}
            </button>
          );
        })}
      </div>

      {tab === 'schedule' && (
        <div>
          {/* Manual PM Records (CRUD) */}
          <div style={{background: '#fefcf7', border: '1px solid #e8e1cc', marginBottom: '14px'}}>
            <div style={{padding: '14px 18px', borderBottom: '1px solid #e8e1cc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
              <div>
                <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{lang === 'id' ? 'Jadwal PM Tercatat oleh Teknisi' : 'PM Schedule Records by Technician'}</div>
                <div style={{fontSize: '11px', color: '#8a7d5c', marginTop: '2px'}}>{lang === 'id' ? 'Catatan PM manual oleh teknisi (di luar jadwal otomatis 6 bulan)' : 'Manual PM records by technician (outside auto 6-month schedule)'}</div>
              </div>
              {canEdit && <button className="btn-primary" onClick={() => { setEditingPm(null); setPmModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
            </div>
            {pmSchedule.length > 0 ? (
              <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px'}}>
                <thead>
                  <tr style={{background: '#f0ebe0'}}>
                    <Th>{t.mt_pm_unit}</Th><Th>{t.mt_pm_last_date}</Th><Th>{t.mt_pm_next_date}</Th>
                    <Th>{t.mt_pm_technician}</Th><Th>{t.mt_pm_status}</Th>
                    {canEdit && <Th align="right">{t.crud_actions}</Th>}
                  </tr>
                </thead>
                <tbody>
                  {pmSchedule.map(pm => {
                    const unit = units.find(u => u.id === pm.unitId);
                    const statusColor = pm.status === 'done' ? '#3a6b3a' : pm.status === 'overdue' ? '#c03030' : '#c8a96a';
                    return (
                      <tr key={pm.id} className="hover-row" style={{borderTop: '1px solid #e8e1cc'}}>
                        <Td>
                          <div style={{fontWeight: 500, fontSize: '11px'}}>{unit ? unit.customer : '—'}</div>
                          <div style={{fontSize: '10px', color: '#8a7d5c'}}>{unit ? unit.subModality : ''}</div>
                        </Td>
                        <Td><span className="mono" style={{fontSize: '11px'}}>{pm.lastPmDate || '—'}</span></Td>
                        <Td><span className="mono" style={{fontSize: '11px', fontWeight: 600}}>{pm.nextPmDate || '—'}</span></Td>
                        <Td><span style={{fontSize: '11px'}}>{pm.technician}</span></Td>
                        <Td><span style={{padding: '3px 8px', fontSize: '10px', background: statusColor + '25', color: statusColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`mt_pm_status_${pm.status}`]}</span></Td>
                        {canEdit && (
                          <Td align="right">
                            <button onClick={() => { setEditingPm(pm); setPmModalOpen(true); }} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#1a2942', fontFamily: 'inherit', marginRight: '4px'}}><Edit2 size={11} /></button>
                            <button onClick={() => handleDeletePm(pm.id)} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>
                          </Td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{padding: '20px', textAlign: 'center', color: '#8a7d5c', fontSize: '11px', fontStyle: 'italic'}}>{lang === 'id' ? 'Belum ada catatan PM manual. Klik "Tambah Baru" untuk mencatat PM oleh teknisi.' : 'No manual PM records yet. Click "Add New" to record a PM session.'}</div>
            )}
          </div>

          {/* Auto-derived Units PM */}
          <div style={{background: '#fefcf7', border: '1px solid #e8e1cc', overflowX: 'auto'}}>
            <div style={{padding: '14px 18px', borderBottom: '1px solid #e8e1cc'}}>
              <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{lang === 'id' ? 'Jadwal PM Otomatis (per Unit Terinstal)' : 'Auto PM Schedule (per Installed Unit)'}</div>
              <div style={{fontSize: '11px', color: '#8a7d5c', marginTop: '2px'}}>{lang === 'id' ? 'Berdasarkan tanggal instalasi + 6 bulan' : 'Based on install date + 6 months'}</div>
            </div>
            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '900px'}}>
            <thead>
              <tr style={{background: '#f0ebe0'}}>
                <Th>{t.mt_customer}</Th><Th>{t.mt_modality}</Th><Th>{t.mt_install_date}</Th>
                <Th>{t.mt_warranty_end}</Th><Th>{t.mt_last_pm}</Th><Th>{t.mt_next_pm}</Th>
                <Th>{t.mt_status}</Th><Th>{t.mt_technician}</Th>
                {canEdit && <Th align="right">{t.mt_actions}</Th>}
              </tr>
            </thead>
            <tbody>
              {unitsByPmStatus.sort((a, b) => new Date(a.nextPmDate) - new Date(b.nextPmDate)).slice(0, 80).map(u => {
                const pmColor = u.pmStatus === 'overdue' ? '#c03030' : u.pmStatus === 'upcoming' ? '#c8a96a' : '#3a6b3a';
                const pmLabel = u.pmStatus === 'overdue' ? t.mt_pm_overdue : u.pmStatus === 'upcoming' ? t.mt_pm_upcoming : t.mt_pm_done;
                return (
                  <tr key={u.id} className="hover-row" style={{borderTop: '1px solid #e8e1cc'}}>
                    <Td>
                      <div style={{fontWeight: 500}}>{u.customer}</div>
                      <div style={{fontSize: '10px', color: '#8a7d5c'}} className="mono">{u.sphRef}</div>
                    </Td>
                    <Td>
                      <div>{u.modality}</div>
                      <div style={{fontSize: '10px', color: '#8a7d5c'}}>{u.subModality}</div>
                    </Td>
                    <Td><span className="mono" style={{fontSize: '11px'}}>{u.installDate}</span></Td>
                    <Td>
                      <span className="mono" style={{fontSize: '11px', color: u.underWarranty ? '#3a6b3a' : '#8b3a3a'}}>{u.warrantyEnd}</span>
                      <div style={{fontSize: '9px', color: u.underWarranty ? '#3a6b3a' : '#8b3a3a', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600}}>{u.underWarranty ? t.mt_under_warranty : t.mt_out_warranty}</div>
                    </Td>
                    <Td><span className="mono" style={{fontSize: '11px', color: '#8a7d5c'}}>{u.lastPmDate || '—'}</span></Td>
                    <Td><span className="mono" style={{fontSize: '11px', fontWeight: 500}}>{u.nextPmDate}</span></Td>
                    <Td><span style={{display: 'inline-block', padding: '3px 8px', fontSize: '10px', background: pmColor + '25', color: pmColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{pmLabel}</span></Td>
                    <Td><span style={{fontSize: '11px'}}>{u.technician}</span></Td>
                    {canEdit && (
                      <Td align="right">
                        <button onClick={() => markPmDone(u.id)} style={{padding: '4px 8px', fontSize: '10px', background: '#3a6b3a', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em'}}>{t.mt_mark_done}</button>
                      </Td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {units.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#8a7d5c'}}>{t.no_data}</div>}
          {units.length > 80 && <div style={{padding: '12px', textAlign: 'center', fontSize: '11px', color: '#8a7d5c', borderTop: '1px solid #e8e1cc'}}>{lang === 'id' ? `Menampilkan 80 dari ${units.length} unit. Filter & pagination tersedia di versi production.` : `Showing 80 of ${units.length} units. Filter & pagination available in production version.`}</div>}
          </div>
        </div>
      )}

      {tab === 'repair' && (
        <div style={{background: '#fefcf7', border: '1px solid #e8e1cc'}}>
          <div style={{padding: '14px 18px', borderBottom: '1px solid #e8e1cc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
            <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.mt_repair_title}</div>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <span style={{fontSize: '11px', color: '#8a7d5c'}}>{repairs.length} {t.project_count}</span>
              {canEdit && <button className="btn-primary" onClick={() => { setEditingIssue({ type: 'repair' }); setIssueModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
            </div>
          </div>
          {repairs.map(r => (
            <div key={r.id} style={{padding: '16px 18px', borderTop: '1px solid #e8e1cc'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '8px'}}>
                <div style={{flex: '1 1 300px'}}>
                  <div style={{fontSize: '13px', fontWeight: 600}}>{r.customer}</div>
                  <div style={{fontSize: '11px', color: '#8a7d5c', marginTop: '2px'}}>{r.modality} · {r.subModality}</div>
                </div>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
                  <span style={{padding: '3px 8px', fontSize: '10px', background: priorityColors[r.priority] + '25', color: priorityColors[r.priority], fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`mt_priority_${r.priority}`]}</span>
                  {canEdit ? (
                    <select value={r.status} onChange={e => updateIssueStatus(r.id, e.target.value)} style={{padding: '3px 8px', fontSize: '11px', width: 'auto', border: `1px solid ${statusColors[r.status]}`, color: statusColors[r.status]}}>
                      <option value="open">{t.mt_status_open}</option>
                      <option value="progress">{t.mt_status_progress}</option>
                      <option value="resolved">{t.mt_status_resolved}</option>
                    </select>
                  ) : (
                    <span style={{padding: '3px 8px', fontSize: '10px', background: statusColors[r.status] + '25', color: statusColors[r.status], fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`mt_status_${r.status}`]}</span>
                  )}
                  {canEdit && (
                    <>
                      <button onClick={() => { setEditingIssue(r); setIssueModalOpen(true); }} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#1a2942', fontFamily: 'inherit'}}><Edit2 size={11} /></button>
                      <button onClick={() => handleDeleteIssue(r.id)} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>
                    </>
                  )}
                </div>
              </div>
              <div style={{fontSize: '13px', marginBottom: '6px', lineHeight: 1.5}}>{r.issue}</div>
              <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '11px', color: '#8a7d5c'}}>
                <span><strong>{t.mt_reported_date}:</strong> <span className="mono">{r.reportedDate}</span></span>
                <span><strong>{t.mt_technician}:</strong> {r.technician}</span>
              </div>
              {r.note && <div style={{marginTop: '8px', padding: '8px 10px', background: '#f0ebe0', fontSize: '11px', fontStyle: 'italic', color: '#1a2942'}}>📝 {r.note}</div>}
            </div>
          ))}
          {repairs.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#8a7d5c'}}>{t.no_data}</div>}
        </div>
      )}

      {tab === 'complaint' && (
        <div style={{background: '#fefcf7', border: '1px solid #e8e1cc'}}>
          <div style={{padding: '14px 18px', borderBottom: '1px solid #e8e1cc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
            <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.mt_complaint_title}</div>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <span style={{fontSize: '11px', color: '#8a7d5c'}}>{complaints.length} {t.project_count}</span>
              {canEdit && <button className="btn-primary" onClick={() => { setEditingIssue({ type: 'complaint' }); setIssueModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
            </div>
          </div>
          {complaints.map(c => (
            <div key={c.id} style={{padding: '16px 18px', borderTop: '1px solid #e8e1cc'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '8px'}}>
                <div style={{flex: '1 1 300px'}}>
                  <div style={{fontSize: '13px', fontWeight: 600}}>{c.customer}</div>
                  <div style={{fontSize: '11px', color: '#8a7d5c', marginTop: '2px'}}>{c.modality} · {c.subModality}</div>
                </div>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
                  <span style={{padding: '3px 8px', fontSize: '10px', background: priorityColors[c.priority] + '25', color: priorityColors[c.priority], fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`mt_priority_${c.priority}`]}</span>
                  {canEdit ? (
                    <select value={c.status} onChange={e => updateIssueStatus(c.id, e.target.value)} style={{padding: '3px 8px', fontSize: '11px', width: 'auto', border: `1px solid ${statusColors[c.status]}`, color: statusColors[c.status]}}>
                      <option value="open">{t.mt_status_open}</option>
                      <option value="progress">{t.mt_status_progress}</option>
                      <option value="resolved">{t.mt_status_resolved}</option>
                    </select>
                  ) : (
                    <span style={{padding: '3px 8px', fontSize: '10px', background: statusColors[c.status] + '25', color: statusColors[c.status], fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`mt_status_${c.status}`]}</span>
                  )}
                  {canEdit && (
                    <>
                      <button onClick={() => { setEditingIssue(c); setIssueModalOpen(true); }} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#1a2942', fontFamily: 'inherit'}}><Edit2 size={11} /></button>
                      <button onClick={() => handleDeleteIssue(c.id)} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>
                    </>
                  )}
                </div>
              </div>
              <div style={{fontSize: '13px', marginBottom: '6px', lineHeight: 1.5}}>{c.issue}</div>
              <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '11px', color: '#8a7d5c'}}>
                <span><strong>{t.mt_reported_date}:</strong> <span className="mono">{c.reportedDate}</span></span>
                <span><strong>{t.mt_technician}:</strong> {c.technician}</span>
              </div>
              {c.note && <div style={{marginTop: '8px', padding: '8px 10px', background: '#f0ebe0', fontSize: '11px', fontStyle: 'italic', color: '#1a2942'}}>📝 {c.note}</div>}
            </div>
          ))}
          {complaints.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#8a7d5c'}}>{t.no_data}</div>}
        </div>
      )}
      {issueModalOpen && <MaintenanceIssueModal record={editingIssue} onSave={handleSaveIssue} onClose={() => { setIssueModalOpen(false); setEditingIssue(null); }} t={t} lang={lang} units={units} session={session} />}
      {pmModalOpen && <PMScheduleModal record={editingPm} onSave={handleSavePm} onClose={() => { setPmModalOpen(false); setEditingPm(null); }} t={t} lang={lang} units={units} session={session} />}
    </div>
  );
}

// ============== Maintenance Issue Modal (Repair/Complaint CRUD) ==============
function MaintenanceIssueModal({ record, onSave, onClose, t, lang, units, session }) {
  const [form, setForm] = useState(record?.id ? record : {
    id: 'iss_' + Date.now(),
    type: record?.type || 'repair',
    customer: '',
    modality: 'CT Scan',
    subModality: '',
    unitId: '',
    issue: '',
    priority: 'medium',
    status: 'open',
    reportedDate: new Date().toISOString().split('T')[0],
    technician: session?.name || 'Budi Hartono',
    note: '',
    estimatedCost: 0,
    resolvedDate: null,
    resolutionNote: '',
  });
  const isEdit = !!(record?.id);
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.mt_modal_edit_issue : t.mt_modal_add_issue}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#8a7d5c'}}><X size={20} /></button>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <Field label={t.mt_issue_type}>
            <select value={form.type} onChange={e => update('type', e.target.value)}>
              <option value="repair">🔧 {t.mt_type_repair}</option>
              <option value="complaint">📞 {t.mt_type_complaint}</option>
            </select>
          </Field>
          <Field label={t.mt_priority}>
            <select value={form.priority} onChange={e => update('priority', e.target.value)}>
              <option value="low">{t.mt_priority_low}</option>
              <option value="medium">{t.mt_priority_medium}</option>
              <option value="high">{t.mt_priority_high}</option>
              <option value="critical">{t.mt_priority_critical}</option>
            </select>
          </Field>
          <Field label={t.customer} full><input value={form.customer} onChange={e => update('customer', e.target.value)} placeholder={lang === 'id' ? 'Nama Rumah Sakit / Klinik' : 'Hospital / Clinic Name'} /></Field>
          <Field label={t.modality}>
            <select value={form.modality} onChange={e => update('modality', e.target.value)}>
              {Object.keys(MODALITY_COLORS).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Sub-Modalitas"><input value={form.subModality} onChange={e => update('subModality', e.target.value)} placeholder="CT 128 Slice, MRI 1.5T, dll" /></Field>
          <Field label={t.mt_unit_label} full>
            <select value={form.unitId} onChange={e => update('unitId', e.target.value)}>
              <option value="">— {lang === 'id' ? 'Pilih unit (opsional)' : 'Select unit (optional)'} —</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.customer} — {u.subModality} ({u.installDate})</option>)}
            </select>
          </Field>
          <Field label={t.mt_issue_desc} full><textarea rows={3} value={form.issue} onChange={e => update('issue', e.target.value)} placeholder={lang === 'id' ? 'Deskripsikan masalah/keluhan dengan detail...' : 'Describe issue/complaint in detail...'} /></Field>
          <Field label={t.mt_status}>
            <select value={form.status} onChange={e => update('status', e.target.value)}>
              <option value="open">{t.mt_status_open}</option>
              <option value="progress">{t.mt_status_progress}</option>
              <option value="resolved">{t.mt_status_resolved}</option>
            </select>
          </Field>
          <Field label={t.mt_reported_date}><input type="date" value={form.reportedDate} onChange={e => update('reportedDate', e.target.value)} /></Field>
          <Field label={t.mt_assigned_to}><input value={form.technician} onChange={e => update('technician', e.target.value)} /></Field>
          <Field label={t.mt_estimated_cost}><input type="number" value={form.estimatedCost} onChange={e => update('estimatedCost', parseFloat(e.target.value) || 0)} placeholder="Rp" /></Field>
          {form.status === 'resolved' && (
            <>
              <Field label={t.mt_resolved_date}><input type="date" value={form.resolvedDate || ''} onChange={e => update('resolvedDate', e.target.value)} /></Field>
              <Field label={t.mt_resolution_note} full><textarea rows={2} value={form.resolutionNote || ''} onChange={e => update('resolutionNote', e.target.value)} /></Field>
            </>
          )}
          <Field label={lang === 'id' ? 'Catatan Tambahan' : 'Additional Note'} full><textarea rows={2} value={form.note || ''} onChange={e => update('note', e.target.value)} /></Field>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
          <button className="btn-primary" onClick={() => onSave(form)}>{t.crud_save}</button>
        </div>
      </div>
    </div>
  );
}

// ============== PM Schedule Modal ==============
function PMScheduleModal({ record, onSave, onClose, t, lang, units, session }) {
  const [form, setForm] = useState(record?.id ? record : {
    id: 'pm_' + Date.now(),
    unitId: '',
    lastPmDate: new Date().toISOString().split('T')[0],
    nextPmDate: '',
    technician: session?.name || 'Budi Hartono',
    status: 'scheduled',
    notes: '',
  });
  const isEdit = !!(record?.id);
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '600px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.mt_modal_edit_pm : t.mt_modal_add_pm}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#8a7d5c'}}><X size={20} /></button>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <Field label={t.mt_pm_unit} full>
            <select value={form.unitId} onChange={e => update('unitId', e.target.value)}>
              <option value="">— {lang === 'id' ? 'Pilih unit alat' : 'Select unit'} —</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.customer} — {u.subModality}</option>)}
            </select>
          </Field>
          <Field label={t.mt_pm_last_date}><input type="date" value={form.lastPmDate} onChange={e => update('lastPmDate', e.target.value)} /></Field>
          <Field label={t.mt_pm_next_date}><input type="date" value={form.nextPmDate} onChange={e => update('nextPmDate', e.target.value)} /></Field>
          <Field label={t.mt_pm_technician}><input value={form.technician} onChange={e => update('technician', e.target.value)} /></Field>
          <Field label={t.mt_pm_status}>
            <select value={form.status} onChange={e => update('status', e.target.value)}>
              <option value="scheduled">{t.mt_pm_status_scheduled}</option>
              <option value="done">{t.mt_pm_status_done}</option>
              <option value="overdue">{t.mt_pm_status_overdue}</option>
            </select>
          </Field>
          <Field label={t.mt_pm_notes} full><textarea rows={2} value={form.notes || ''} onChange={e => update('notes', e.target.value)} /></Field>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
          <button className="btn-primary" onClick={() => onSave(form)}>{t.crud_save}</button>
        </div>
      </div>
    </div>
  );
}

// ============== Regulatory Module ==============
function RegulatoryModule({ records, setRegRecords, aklRecords, setAklRecords, importRecords, setImportRecords, pengalihanRecords, setPengalihanRecords, piRecords, setPiRecords, units, t, lang, canEdit }) {
  const [tab, setTab] = useState('import');
  const titleByTab = {
    import: t.imp_title, akl: t.akl_title, bapeten: t.reg_tab_bapeten,
    pengalihan: t.pgl_title, pi: t.pi_title,
  };
  const subtitleByTab = {
    import: t.imp_subtitle, akl: t.akl_subtitle, bapeten: t.reg_subtitle,
    pengalihan: t.pgl_subtitle, pi: t.pi_subtitle,
  };
  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: '#8a7d5c', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_regulatory}</div>
        <h1 className="serif hero-title" style={{fontSize: '34px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>
          {titleByTab[tab]}
        </h1>
        <div style={{fontSize: '13px', color: '#8a7d5c', marginTop: '6px'}}>
          {subtitleByTab[tab]}
        </div>
      </div>

      {!canEdit && <ReadOnlyBanner t={t} />}

      {/* Tabs - 5 stages with flow */}
      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid #d4cdb8', flexWrap: 'wrap'}}>
        {[
          { id: 'import', label: t.reg_tab_import, icon: FileSearch, count: importRecords.length },
          { id: 'akl', label: t.reg_tab_akl, icon: FileCheck, count: aklRecords.length },
          { id: 'bapeten', label: t.reg_tab_bapeten, icon: ShieldCheck, count: records.length },
          { id: 'pengalihan', label: t.reg_tab_pengalihan, icon: Shield, count: pengalihanRecords.length },
          { id: 'pi', label: t.reg_tab_pi, icon: Truck, count: piRecords.length },
        ].map(tb => {
          const Icon = tb.icon;
          const active = tab === tb.id;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '9px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11.5px', fontWeight: 500, color: active ? '#1a2942' : '#8a7d5c', borderBottom: active ? '2px solid #1a2942' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.03em', whiteSpace: 'nowrap'}}>
              <Icon size={13} strokeWidth={1.5} />
              {tb.label}
              <span style={{padding: '2px 7px', background: active ? '#1a2942' : '#e8e1cc', color: active ? '#f8f5ef' : '#8a7d5c', fontSize: '10px', fontWeight: 600, borderRadius: '10px'}}>{tb.count}</span>
            </button>
          );
        })}
      </div>

      {/* Flow indicator */}
      <div style={{padding: '10px 14px', background: 'rgba(26,41,66,0.04)', marginBottom: '20px', fontSize: '11px', color: '#1a2942', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
        <span style={{fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '10px', color: '#8a7d5c'}}>{lang === 'id' ? 'Alur Regulasi:' : 'Regulatory Flow:'}</span>
        <span>1. Izin Import BAPETEN</span>
        <span style={{color: '#8a7d5c'}}>→</span>
        <span>2. AKL Kemenkes</span>
        <span style={{color: '#8a7d5c'}}>→</span>
        <span>3. Izin Pengalihan</span>
        <span style={{color: '#8a7d5c'}}>→</span>
        <span>4. PI per Shipment</span>
        <span style={{color: '#8a7d5c'}}>→</span>
        <span>5. Izin Pemanfaatan BAPETEN</span>
      </div>

      {tab === 'import' && <ImportPipeline records={importRecords} setImportRecords={setImportRecords} t={t} lang={lang} canEdit={canEdit} />}
      {tab === 'akl' && <AKLPipeline aklRecords={aklRecords} setAklRecords={setAklRecords} t={t} lang={lang} canEdit={canEdit} />}
      {tab === 'bapeten' && <BAPETENPipeline records={records} setRegRecords={setRegRecords} t={t} lang={lang} canEdit={canEdit} />}
      {tab === 'pengalihan' && <PengalihanPipeline records={pengalihanRecords} setRecords={setPengalihanRecords} t={t} lang={lang} canEdit={canEdit} />}
      {tab === 'pi' && <PIPipeline records={piRecords} setRecords={setPiRecords} t={t} lang={lang} canEdit={canEdit} />}
    </div>
  );
}

// ============== Import Pipeline Sub-Component ==============
function ImportPipeline({ records, setImportRecords, t, lang, canEdit }) {
  const stages = IMPORT_STAGES;
  const stageColors = { preregist: '#94a3b8', docs: '#7d9cc5', submit: '#5b87b8', eval: '#c8a96a', issued: '#3a6b3a' };
  const totalActive = records.filter(r => r.stage !== 'issued').length;
  const totalIssued = records.filter(r => r.stage === 'issued').length;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const handleSave = (rec) => {
    setImportRecords(prev => {
      const exists = prev.find(r => r.id === rec.id);
      return exists ? prev.map(r => r.id === rec.id ? rec : r) : [...prev, rec];
    });
    setModalOpen(false); setEditingRecord(null);
  };
  const handleDelete = (id) => {
    if (!canEdit) return;
    if (confirm(t.crud_confirm_delete)) setImportRecords(prev => prev.filter(r => r.id !== id));
  };

  const advanceStage = (id) => {
    if (!canEdit) return;
    setImportRecords(prev => prev.map(r => {
      if (r.id !== id) return r;
      const currentIdx = stages.indexOf(r.stage);
      if (currentIdx >= stages.length - 1) return r;
      const nextStage = stages[currentIdx + 1];
      const today = new Date().toISOString().split('T')[0];
      const updates = { stage: nextStage, stageIdx: currentIdx + 1 };
      if (nextStage === 'docs') updates.docsDate = today;
      if (nextStage === 'submit') updates.submitDate = today;
      if (nextStage === 'eval') updates.evalDate = today;
      if (nextStage === 'issued') {
        updates.issuedDate = today;
        updates.importPermitNo = 'BAPETEN/IMP/2026/' + Math.floor(Math.random() * 90000 + 10000);
      }
      return { ...r, ...updates };
    }));
  };

  const byStage = stages.map(stage => ({
    stage, label: t[`imp_stage_${stage === 'preregist' ? 'pre' : stage}`], color: stageColors[stage],
    count: records.filter(r => r.stage === stage).length,
  }));

  return (
    <div>
      <div style={{padding: '12px 16px', background: 'rgba(184,134,11,0.10)', borderLeft: '3px solid #b8860b', marginBottom: '20px', fontSize: '12px', color: '#1a2942', display: 'flex', alignItems: 'center', gap: '10px'}}>
        <AlertTriangle size={16} strokeWidth={1.5} style={{flexShrink: 0}} />
        <span>{t.imp_warning_akl}</span>
      </div>

      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: '#d4cdb8', marginBottom: '22px', border: '1px solid #d4cdb8'}}>
        <div style={{padding: '18px 20px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.imp_total_active}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#c8a96a'}}>{totalActive}</div>
        </div>
        <div style={{padding: '18px 20px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.imp_total_issued}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#3a6b3a'}}>{totalIssued}</div>
        </div>
      </div>

      <div className="card" style={{marginBottom: '22px'}}>
        <div className="card-title">{t.imp_pipeline_title}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2px'}}>
          {byStage.map((s, i) => (
            <div key={s.stage} style={{padding: '14px 12px', background: s.color + '15', borderTop: `3px solid ${s.color}`}}>
              <div style={{fontSize: '9px', letterSpacing: '0.12em', color: s.color, textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px'}}>{i + 1} · {s.label}</div>
              <div className="serif" style={{fontSize: '26px', fontWeight: 500, color: s.color, lineHeight: 1}}>{s.count}</div>
              <div style={{fontSize: '10px', color: '#8a7d5c', marginTop: '2px'}}>{t.project_count}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{background: '#fefcf7', border: '1px solid #e8e1cc'}}>
        <div style={{padding: '14px 18px', borderBottom: '1px solid #e8e1cc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
          <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.imp_records_title}</div>
          {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
        </div>
        {records.map(r => {
          const stageIdx = stages.indexOf(r.stage);
          const stageColor = stageColors[r.stage];
          const principalColor = r.principal === 'Angell' ? '#0f7a5a' : r.principal === 'Innocare' ? '#b8860b' : '#c03030';
          return (
            <div key={r.id} style={{padding: '16px 18px', borderTop: '1px solid #e8e1cc'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '12px'}}>
                <div style={{flex: '1 1 320px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap'}}>
                    <span style={{padding: '2px 8px', background: principalColor + '20', color: principalColor, fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em'}}>{r.principal}</span>
                    <span style={{fontSize: '10px', color: '#8a7d5c'}}>· {r.principalCountry}</span>
                  </div>
                  <div style={{fontSize: '13px', fontWeight: 600}}>{r.product}</div>
                  {r.importPermitNo && <div style={{fontSize: '11px', color: '#3a6b3a', marginTop: '4px', fontWeight: 600}} className="mono">✓ {t.imp_no}: {r.importPermitNo}</div>}
                </div>
                <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px'}}>
                  <span style={{padding: '4px 10px', fontSize: '10px', background: stageColor + '25', color: stageColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`imp_stage_${r.stage === 'preregist' ? 'pre' : r.stage}`]}</span>
                  {canEdit && (
                    <div style={{display: 'flex', gap: '4px'}}>
                      <button onClick={() => { setEditingRecord(r); setModalOpen(true); }} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#1a2942', fontFamily: 'inherit'}}><Edit2 size={11} /></button>
                      <button onClick={() => handleDelete(r.id)} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>
                    </div>
                  )}
                </div>
              </div>
              <div style={{display: 'flex', gap: '2px', marginBottom: '10px'}}>
                {stages.map((s, i) => (
                  <div key={s} style={{flex: 1, height: '6px', background: i <= stageIdx ? stageColors[s] : '#f0ebe0', transition: 'background 0.3s'}} />
                ))}
              </div>
              <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '10px', color: '#8a7d5c', marginBottom: '8px'}}>
                {r.preregistDate && <span>1️⃣ Pre-Regist: <span className="mono">{r.preregistDate}</span></span>}
                {r.docsDate && <span>2️⃣ Docs: <span className="mono">{r.docsDate}</span></span>}
                {r.submitDate && <span>3️⃣ Submit: <span className="mono">{r.submitDate}</span></span>}
                {r.evalDate && <span>4️⃣ Eval: <span className="mono">{r.evalDate}</span></span>}
                {r.issuedDate && <span style={{color: '#3a6b3a', fontWeight: 600}}>5️⃣ Issued: <span className="mono">{r.issuedDate}</span></span>}
              </div>
              {r.note && <div style={{padding: '8px 10px', background: '#f0ebe0', fontSize: '11px', fontStyle: 'italic', color: '#1a2942', marginBottom: '8px'}}>📝 {r.note}</div>}
              {canEdit && r.stage !== 'issued' && (
                <button onClick={() => advanceStage(r.id)} style={{padding: '6px 14px', fontSize: '11px', background: '#1a2942', color: '#f8f5ef', border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em', fontWeight: 500}}>
                  {t.imp_advance} →
                </button>
              )}
            </div>
          );
        })}
        {records.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#8a7d5c'}}>{t.no_data}</div>}
      </div>
      {modalOpen && <RegulatoryRecordModal record={editingRecord} recordType="import" onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} />}
    </div>
  );
}

// ============== Pengalihan Pipeline Sub-Component ==============
function PengalihanPipeline({ records, setRecords, t, lang, canEdit }) {
  const stages = PENGALIHAN_STAGES;
  const stageColors = { submit: '#7d9cc5', eval: '#c8a96a', issued: '#3a6b3a' };
  const totalActive = records.filter(r => r.stage !== 'issued').length;
  const totalIssued = records.filter(r => r.stage === 'issued').length;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const handleSave = (rec) => {
    setRecords(prev => {
      const exists = prev.find(r => r.id === rec.id);
      return exists ? prev.map(r => r.id === rec.id ? rec : r) : [...prev, rec];
    });
    setModalOpen(false); setEditingRecord(null);
  };
  const handleDelete = (id) => {
    if (!canEdit) return;
    if (confirm(t.crud_confirm_delete)) setRecords(prev => prev.filter(r => r.id !== id));
  };

  const advanceStage = (id) => {
    if (!canEdit) return;
    setRecords(prev => prev.map(r => {
      if (r.id !== id) return r;
      const currentIdx = stages.indexOf(r.stage);
      if (currentIdx >= stages.length - 1) return r;
      const nextStage = stages[currentIdx + 1];
      const today = new Date().toISOString().split('T')[0];
      const updates = { stage: nextStage, stageIdx: currentIdx + 1 };
      if (nextStage === 'eval') updates.evalDate = today;
      if (nextStage === 'issued') {
        updates.issuedDate = today;
        updates.permitNo = 'BAPETEN/PGL/2026/' + Math.floor(Math.random() * 90000 + 10000);
      }
      return { ...r, ...updates };
    }));
  };

  const byStage = stages.map(stage => ({
    stage, label: t[`pgl_stage_${stage}`], color: stageColors[stage],
    count: records.filter(r => r.stage === stage).length,
  }));

  return (
    <div>
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: '#d4cdb8', marginBottom: '22px', border: '1px solid #d4cdb8'}}>
        <div style={{padding: '18px 20px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.pgl_total_active}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#c8a96a'}}>{totalActive}</div>
        </div>
        <div style={{padding: '18px 20px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.pgl_total_issued}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#3a6b3a'}}>{totalIssued}</div>
        </div>
      </div>

      <div className="card" style={{marginBottom: '22px'}}>
        <div className="card-title">{t.pgl_pipeline_title}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px'}}>
          {byStage.map((s, i) => (
            <div key={s.stage} style={{padding: '14px 12px', background: s.color + '15', borderTop: `3px solid ${s.color}`}}>
              <div style={{fontSize: '9px', letterSpacing: '0.12em', color: s.color, textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px'}}>{i + 1} · {s.label}</div>
              <div className="serif" style={{fontSize: '26px', fontWeight: 500, color: s.color, lineHeight: 1}}>{s.count}</div>
              <div style={{fontSize: '10px', color: '#8a7d5c', marginTop: '2px'}}>{t.project_count}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{background: '#fefcf7', border: '1px solid #e8e1cc'}}>
        <div style={{padding: '14px 18px', borderBottom: '1px solid #e8e1cc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
          <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.pgl_records_title}</div>
          {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
        </div>
        {records.map(r => {
          const stageIdx = stages.indexOf(r.stage);
          const stageColor = stageColors[r.stage];
          return (
            <div key={r.id} style={{padding: '16px 18px', borderTop: '1px solid #e8e1cc'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '12px'}}>
                <div style={{flex: '1 1 320px'}}>
                  <div style={{fontSize: '13px', fontWeight: 600}}>{r.customer}</div>
                  <div style={{fontSize: '11px', color: '#8a7d5c', marginTop: '2px'}}>{r.modality} · {r.subModality}</div>
                  <div style={{fontSize: '10px', color: '#8a7d5c', marginTop: '4px'}}>📍 {t.pgl_destination}: {r.destination}</div>
                  {r.permitNo && <div style={{fontSize: '11px', color: '#3a6b3a', marginTop: '4px', fontWeight: 600}} className="mono">✓ {t.pgl_no}: {r.permitNo}</div>}
                </div>
                <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px'}}>
                  <span style={{padding: '4px 10px', fontSize: '10px', background: stageColor + '25', color: stageColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`pgl_stage_${r.stage}`]}</span>
                  {canEdit && (
                    <div style={{display: 'flex', gap: '4px'}}>
                      <button onClick={() => { setEditingRecord(r); setModalOpen(true); }} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#1a2942', fontFamily: 'inherit'}}><Edit2 size={11} /></button>
                      <button onClick={() => handleDelete(r.id)} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>
                    </div>
                  )}
                </div>
              </div>
              <div style={{display: 'flex', gap: '2px', marginBottom: '10px'}}>
                {stages.map((s, i) => (
                  <div key={s} style={{flex: 1, height: '6px', background: i <= stageIdx ? stageColors[s] : '#f0ebe0', transition: 'background 0.3s'}} />
                ))}
              </div>
              <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '10px', color: '#8a7d5c', marginBottom: '8px'}}>
                {r.submitDate && <span>📤 Submit: <span className="mono">{r.submitDate}</span></span>}
                {r.evalDate && <span>🔍 Eval: <span className="mono">{r.evalDate}</span></span>}
                {r.issuedDate && <span style={{color: '#3a6b3a', fontWeight: 600}}>✅ Issued: <span className="mono">{r.issuedDate}</span></span>}
              </div>
              {r.note && <div style={{padding: '8px 10px', background: '#f0ebe0', fontSize: '11px', fontStyle: 'italic', color: '#1a2942', marginBottom: '8px'}}>📝 {r.note}</div>}
              {canEdit && r.stage !== 'issued' && (
                <button onClick={() => advanceStage(r.id)} style={{padding: '6px 14px', fontSize: '11px', background: '#1a2942', color: '#f8f5ef', border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em', fontWeight: 500}}>
                  {t.pgl_advance} →
                </button>
              )}
            </div>
          );
        })}
        {records.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#8a7d5c'}}>{t.no_data}</div>}
      </div>
      {modalOpen && <RegulatoryRecordModal record={editingRecord} recordType="pengalihan" onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} />}
    </div>
  );
}

// ============== PI Pipeline Sub-Component ==============
function PIPipeline({ records, setRecords, t, lang, canEdit }) {
  const today = new Date('2026-05-16');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const enriched = records.map(r => {
    const expDate = new Date(r.expiredDate);
    const daysRemaining = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    let status = r.status;
    if (status !== 'used' && daysRemaining < 0) status = 'expired';
    return { ...r, daysRemaining, computedStatus: status };
  });
  const totalActive = enriched.filter(r => r.computedStatus === 'active').length;
  const totalUsed = enriched.filter(r => r.computedStatus === 'used').length;
  const totalExpired = enriched.filter(r => r.computedStatus === 'expired').length;
  const statusColors = { active: '#3a6b3a', used: '#5b87b8', expired: '#c03030' };

  const handleSave = (rec) => {
    setRecords(prev => {
      const exists = prev.find(r => r.id === rec.id);
      return exists ? prev.map(r => r.id === rec.id ? rec : r) : [...prev, rec];
    });
    setModalOpen(false); setEditingRecord(null);
  };
  const handleDelete = (id) => {
    if (!canEdit) return;
    if (confirm(t.crud_confirm_delete)) setRecords(prev => prev.filter(r => r.id !== id));
  };
  const markUsed = (id) => {
    if (!canEdit) return;
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'used' } : r));
  };

  return (
    <div>
      <div style={{padding: '12px 16px', background: 'rgba(192,48,48,0.08)', borderLeft: '3px solid #c03030', marginBottom: '20px', fontSize: '12px', color: '#1a2942', display: 'flex', alignItems: 'center', gap: '10px'}}>
        <Clock size={16} strokeWidth={1.5} style={{flexShrink: 0}} />
        <span><strong>{lang === 'id' ? 'Penting:' : 'Important:'}</strong> {t.pi_subtitle}</span>
      </div>

      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#d4cdb8', marginBottom: '22px', border: '1px solid #d4cdb8'}}>
        <div style={{padding: '18px 20px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.pi_total_active}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#3a6b3a'}}>{totalActive}</div>
        </div>
        <div style={{padding: '18px 20px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.pi_total_used}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#5b87b8'}}>{totalUsed}</div>
        </div>
        <div style={{padding: '18px 20px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.pi_total_expired}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#c03030'}}>{totalExpired}</div>
        </div>
      </div>

      <div style={{background: '#fefcf7', border: '1px solid #e8e1cc'}}>
        <div style={{padding: '14px 18px', borderBottom: '1px solid #e8e1cc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
          <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.pi_records_title}</div>
          {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
        </div>
        {enriched.map(r => {
          const statusColor = statusColors[r.computedStatus];
          const isExpiring = r.computedStatus === 'active' && r.daysRemaining <= 5;
          return (
            <div key={r.id} style={{padding: '16px 18px', borderTop: '1px solid #e8e1cc'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '12px'}}>
                <div style={{flex: '1 1 320px'}}>
                  <div className="mono" style={{fontSize: '13px', fontWeight: 600}}>{r.piNo}</div>
                  <div style={{fontSize: '11px', color: '#8a7d5c', marginTop: '2px'}}>{t.pi_principal}: <strong>{r.principal}</strong> · {t.pi_shipment}: <span className="mono">{r.shipment}</span></div>
                  <div style={{fontSize: '11px', color: '#1a2942', marginTop: '4px'}}>📦 {r.items}</div>
                </div>
                <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px'}}>
                  <span style={{padding: '4px 10px', fontSize: '10px', background: statusColor + '25', color: statusColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`pi_status_${r.computedStatus}`]}</span>
                  {r.computedStatus === 'active' && (
                    <div style={{fontSize: '11px', color: isExpiring ? '#c03030' : '#8a7d5c', fontWeight: isExpiring ? 700 : 500}}>
                      {isExpiring && '⚠ '}{r.daysRemaining} {t.days} {lang === 'id' ? 'tersisa' : 'left'}
                    </div>
                  )}
                  {canEdit && (
                    <div style={{display: 'flex', gap: '4px'}}>
                      <button onClick={() => { setEditingRecord(r); setModalOpen(true); }} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#1a2942', fontFamily: 'inherit'}}><Edit2 size={11} /></button>
                      <button onClick={() => handleDelete(r.id)} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>
                    </div>
                  )}
                </div>
              </div>
              <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '10px', color: '#8a7d5c', marginBottom: '8px'}}>
                <span>📅 {t.pi_issued_date}: <span className="mono">{r.issuedDate}</span></span>
                <span>⏰ {t.pi_expired_date}: <span className="mono">{r.expiredDate}</span></span>
              </div>
              {isExpiring && <div style={{padding: '8px 10px', background: 'rgba(192,48,48,0.10)', fontSize: '11px', color: '#c03030', fontWeight: 600, marginBottom: '8px'}}>⚠ {t.pi_warning_expiring}</div>}
              {r.note && <div style={{padding: '8px 10px', background: '#f0ebe0', fontSize: '11px', fontStyle: 'italic', color: '#1a2942', marginBottom: '8px'}}>📝 {r.note}</div>}
              {canEdit && r.computedStatus === 'active' && (
                <button onClick={() => markUsed(r.id)} style={{padding: '6px 14px', fontSize: '11px', background: '#5b87b8', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em', fontWeight: 500}}>
                  {lang === 'id' ? 'Tandai Digunakan' : 'Mark as Used'}
                </button>
              )}
            </div>
          );
        })}
        {records.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#8a7d5c'}}>{t.no_data}</div>}
      </div>
      {modalOpen && <RegulatoryRecordModal record={editingRecord} recordType="pi" onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} />}
    </div>
  );
}

// ============== BAPETEN Pipeline Sub-Component ==============
function BAPETENPipeline({ records, setRegRecords, t, lang, canEdit }) {
  const stages = ['docs', 'submit', 'eval', 'pnbp', 'issued'];
  const stageColors = { docs: '#94a3b8', submit: '#7d9cc5', eval: '#c8a96a', pnbp: '#b8935a', issued: '#3a6b3a' };
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const totalPending = records.filter(r => r.stage !== 'issued').length;
  const totalIssued = records.filter(r => r.stage === 'issued').length;
  const avgDays = 45;

  const handleSave = (rec) => {
    setRegRecords(prev => {
      const exists = prev.find(r => r.id === rec.id);
      return exists ? prev.map(r => r.id === rec.id ? rec : r) : [...prev, rec];
    });
    setModalOpen(false); setEditingRecord(null);
  };
  const handleDelete = (id) => {
    if (!canEdit) return;
    if (confirm(t.crud_confirm_delete)) setRegRecords(prev => prev.filter(r => r.id !== id));
  };

  const advanceStage = (id) => {
    if (!canEdit) return;
    setRegRecords(prev => prev.map(r => {
      if (r.id !== id) return r;
      const currentIdx = stages.indexOf(r.stage);
      if (currentIdx >= stages.length - 1) return r;
      const nextStage = stages[currentIdx + 1];
      const today = new Date().toISOString().split('T')[0];
      const updates = { stage: nextStage, stageIdx: currentIdx + 1 };
      if (nextStage === 'submit') { updates.submitDate = today; updates.docsComplete = true; }
      if (nextStage === 'eval') updates.evalDate = today;
      if (nextStage === 'pnbp') updates.pnbpAmount = 12500000;
      if (nextStage === 'issued') updates.issuedDate = today;
      return { ...r, ...updates };
    }));
  };

  const byStage = stages.map(stage => ({
    stage, label: t[`reg_stage_${stage}`], color: stageColors[stage],
    count: records.filter(r => r.stage === stage).length,
  }));

  return (
    <div>
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#d4cdb8', marginBottom: '22px', border: '1px solid #d4cdb8'}}>
        <div style={{padding: '18px 20px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.reg_total_pending}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#c8a96a'}}>{totalPending}</div>
        </div>
        <div style={{padding: '18px 20px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.reg_total_issued}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#3a6b3a'}}>{totalIssued}</div>
        </div>
        <div style={{padding: '18px 20px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.reg_avg_days}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{avgDays} <span style={{fontSize: '12px', color: '#8a7d5c'}}>{t.days}</span></div>
        </div>
      </div>

      <div className="card" style={{marginBottom: '22px'}}>
        <div className="card-title">{lang === 'id' ? 'Pipeline Perizinan BAPETEN' : 'BAPETEN Permit Pipeline'}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2px'}}>
          {byStage.map((s, i) => (
            <div key={s.stage} style={{padding: '14px 12px', background: s.color + '15', borderTop: `3px solid ${s.color}`, position: 'relative'}}>
              <div style={{fontSize: '9px', letterSpacing: '0.15em', color: s.color, textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px'}}>{i + 1} · {s.label}</div>
              <div className="serif" style={{fontSize: '28px', fontWeight: 500, color: s.color, lineHeight: 1}}>{s.count}</div>
              <div style={{fontSize: '10px', color: '#8a7d5c', marginTop: '2px'}}>{t.project_count}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{background: '#fefcf7', border: '1px solid #e8e1cc'}}>
        <div style={{padding: '14px 18px', borderBottom: '1px solid #e8e1cc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
          <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{lang === 'id' ? 'Daftar Permohonan Izin' : 'Permit Applications'}</div>
          {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
        </div>
        {records.map(r => {
          const stageIdx = stages.indexOf(r.stage);
          const stageColor = stageColors[r.stage];
          return (
            <div key={r.id} style={{padding: '16px 18px', borderTop: '1px solid #e8e1cc'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '12px'}}>
                <div style={{flex: '1 1 280px'}}>
                  <div style={{fontSize: '13px', fontWeight: 600}}>{r.customer}</div>
                  <div style={{fontSize: '11px', color: '#8a7d5c', marginTop: '2px'}}>{r.modality} · {r.subModality}</div>
                  <div style={{fontSize: '10px', color: '#8a7d5c', marginTop: '4px'}} className="mono">{lang === 'id' ? 'Instalasi' : 'Installed'}: {r.installDate}</div>
                </div>
                <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px'}}>
                  <span style={{padding: '4px 10px', fontSize: '10px', background: stageColor + '25', color: stageColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`reg_stage_${r.stage}`]}</span>
                  {r.pnbpAmount && <div style={{fontSize: '11px', color: '#8a7d5c'}}>PNBP: <span className="mono">Rp {(r.pnbpAmount / 1000000).toFixed(1)}jt</span></div>}
                  {canEdit && (
                    <div style={{display: 'flex', gap: '4px'}}>
                      <button onClick={() => { setEditingRecord(r); setModalOpen(true); }} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#1a2942', fontFamily: 'inherit'}}><Edit2 size={11} /></button>
                      <button onClick={() => handleDelete(r.id)} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>
                    </div>
                  )}
                </div>
              </div>
              <div style={{display: 'flex', gap: '2px', marginBottom: '10px'}}>
                {stages.map((s, i) => (
                  <div key={s} style={{flex: 1, height: '6px', background: i <= stageIdx ? stageColors[s] : '#f0ebe0', transition: 'background 0.3s'}} />
                ))}
              </div>
              <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '11px', color: '#8a7d5c', marginBottom: '8px'}}>
                <span>📋 {r.docsComplete ? <span style={{color: '#3a6b3a', fontWeight: 600}}>{t.reg_doc_complete}</span> : <span style={{color: '#c03030', fontWeight: 600}}>{t.reg_doc_pending}</span>}</span>
                {r.submitDate && <span>📤 Submit: <span className="mono">{r.submitDate}</span></span>}
                {r.evalDate && <span>🔍 Eval: <span className="mono">{r.evalDate}</span></span>}
                {r.issuedDate && <span>✅ {t.reg_stage_issued}: <span className="mono">{r.issuedDate}</span></span>}
              </div>
              {r.note && <div style={{padding: '8px 10px', background: '#f0ebe0', fontSize: '11px', fontStyle: 'italic', color: '#1a2942', marginBottom: '8px'}}>📝 {r.note}</div>}
              {canEdit && r.stage !== 'issued' && (
                <button onClick={() => advanceStage(r.id)} style={{padding: '6px 14px', fontSize: '11px', background: '#1a2942', color: '#f8f5ef', border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em', fontWeight: 500}}>
                  {t.reg_advance} →
                </button>
              )}
            </div>
          );
        })}
        {records.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#8a7d5c'}}>{t.no_data}</div>}
      </div>
      {modalOpen && <RegulatoryRecordModal record={editingRecord} recordType="bapeten" onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} />}
    </div>
  );
}

// ============== AKL Kemenkes Pipeline Sub-Component ==============
function AKLPipeline({ aklRecords, setAklRecords, t, lang, canEdit }) {
  const stages = AKL_STAGES;
  const stageColors = {
    preregist: '#94a3b8', docs: '#7d9cc5', submit: '#5b87b8',
    pnbp: '#c8a96a', eval: '#b8935a', fix: '#c03030', issued: '#3a6b3a'
  };
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const totalActive = aklRecords.filter(r => r.stage !== 'issued').length;
  const totalIssued = aklRecords.filter(r => r.stage === 'issued').length;
  const issuedRecords = aklRecords.filter(r => r.stage === 'issued');
  const avgDuration = issuedRecords.length > 0
    ? Math.round(issuedRecords.reduce((sum, r) => sum + (r.daysElapsed || 0), 0) / issuedRecords.length)
    : 0;

  const handleSave = (rec) => {
    setAklRecords(prev => {
      const exists = prev.find(r => r.id === rec.id);
      return exists ? prev.map(r => r.id === rec.id ? rec : r) : [...prev, rec];
    });
    setModalOpen(false); setEditingRecord(null);
  };
  const handleDelete = (id) => {
    if (!canEdit) return;
    if (confirm(t.crud_confirm_delete)) setAklRecords(prev => prev.filter(r => r.id !== id));
  };

  const advanceStage = (id) => {
    if (!canEdit) return;
    setAklRecords(prev => prev.map(r => {
      if (r.id !== id) return r;
      const currentIdx = stages.indexOf(r.stage);
      if (currentIdx >= stages.length - 1) return r;
      const nextStage = stages[currentIdx + 1];
      const today = new Date().toISOString().split('T')[0];
      const updates = { stage: nextStage, stageIdx: currentIdx + 1 };
      if (nextStage === 'docs') updates.docsDate = today;
      if (nextStage === 'submit') updates.submitDate = today;
      if (nextStage === 'pnbp') { updates.pnbpDate = today; updates.pnbpAmount = 5000000; }
      if (nextStage === 'eval') updates.evalDate = today;
      if (nextStage === 'fix') updates.fixDate = today;
      if (nextStage === 'issued') {
        updates.issuedDate = today;
        updates.aklNo = 'AKL ' + Math.floor(Math.random() * 90000000000 + 10000000000);
      }
      return { ...r, ...updates };
    }));
  };

  const byStage = stages.map(stage => ({
    stage, label: t[`akl_stage_${stage}`], color: stageColors[stage],
    count: aklRecords.filter(r => r.stage === stage).length,
  }));

  return (
    <div>
      {/* Max duration banner */}
      <div style={{padding: '12px 16px', background: 'rgba(184,134,11,0.10)', borderLeft: '3px solid #b8860b', marginBottom: '20px', fontSize: '12px', color: '#1a2942', display: 'flex', alignItems: 'center', gap: '10px'}}>
        <Clock size={16} strokeWidth={1.5} style={{flexShrink: 0}} />
        <span><strong>{t.akl_max_duration}:</strong> {t.akl_30_workdays} (target SLA Regalkes Kemenkes) · {t.akl_validity}: {t.akl_validity_period}</span>
      </div>

      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#d4cdb8', marginBottom: '22px', border: '1px solid #d4cdb8'}}>
        <div style={{padding: '18px 20px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.akl_total_active}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#c8a96a'}}>{totalActive}</div>
        </div>
        <div style={{padding: '18px 20px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.akl_total_issued}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#3a6b3a'}}>{totalIssued}</div>
        </div>
        <div style={{padding: '18px 20px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.akl_avg_duration}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{avgDuration} <span style={{fontSize: '12px', color: '#8a7d5c'}}>{t.days}</span></div>
        </div>
      </div>

      {/* Pipeline visualization - 7 stages */}
      <div className="card" style={{marginBottom: '22px'}}>
        <div className="card-title">{t.akl_pipeline_title}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px'}}>
          {byStage.map((s, i) => (
            <div key={s.stage} style={{padding: '12px 8px', background: s.color + '15', borderTop: `3px solid ${s.color}`, position: 'relative'}}>
              <div style={{fontSize: '8px', letterSpacing: '0.12em', color: s.color, textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px', lineHeight: 1.3}}>{i + 1} · {s.label}</div>
              <div className="serif" style={{fontSize: '24px', fontWeight: 500, color: s.color, lineHeight: 1}}>{s.count}</div>
              <div style={{fontSize: '9px', color: '#8a7d5c', marginTop: '2px'}}>{t.project_count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AKL Records list */}
      <div style={{background: '#fefcf7', border: '1px solid #e8e1cc'}}>
        <div style={{padding: '14px 18px', borderBottom: '1px solid #e8e1cc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
          <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.akl_records_title}</div>
          {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
        </div>
        {aklRecords.map(r => {
          const stageIdx = stages.indexOf(r.stage);
          const stageColor = stageColors[r.stage];
          const isOverdue = r.workingDaysRemaining <= 0 && r.stage !== 'issued';
          const principalColor = r.principal === 'Angell' ? '#0f7a5a' : r.principal === 'Innocare' ? '#b8860b' : r.principal === 'ANKE' ? '#c03030' : r.principal === 'SG Healthcare' ? '#1a4d8a' : '#7b3fb5';
          return (
            <div key={r.id} style={{padding: '16px 18px', borderTop: '1px solid #e8e1cc'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '12px'}}>
                <div style={{flex: '1 1 320px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap'}}>
                    <span style={{padding: '2px 8px', background: principalColor + '20', color: principalColor, fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em'}}>{r.principal}</span>
                    <span style={{fontSize: '10px', color: '#8a7d5c'}}>· {r.principalCountry}</span>
                    <span style={{padding: '2px 7px', fontSize: '9px', background: '#e8e1cc', color: '#1a2942', fontWeight: 600}}>{t[`akl_class_${r.productClass.toLowerCase()}`]}</span>
                  </div>
                  <div style={{fontSize: '13px', fontWeight: 600}}>{r.product}</div>
                  <div style={{fontSize: '11px', color: '#8a7d5c', marginTop: '4px'}} className="mono">{t.akl_register_date}: {r.registerDate} · {t.akl_target_date}: {r.targetDate}</div>
                  {r.aklNo && <div style={{fontSize: '11px', color: '#3a6b3a', marginTop: '4px', fontWeight: 600}} className="mono">✓ {t.akl_akl_no}: {r.aklNo}</div>}
                </div>
                <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px'}}>
                  <span style={{padding: '4px 10px', fontSize: '10px', background: stageColor + '25', color: stageColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`akl_stage_${r.stage}`]}</span>
                  {r.stage !== 'issued' && (
                    <div style={{fontSize: '11px', color: isOverdue ? '#c03030' : (r.workingDaysRemaining < 10 ? '#c8a96a' : '#3a6b3a'), fontWeight: 600}}>
                      {isOverdue ? `⚠ ${t.akl_overdue}` : `${r.workingDaysRemaining} ${t.days} ${lang === 'id' ? 'tersisa' : 'left'}`}
                    </div>
                  )}
                  {r.pnbpAmount && <div style={{fontSize: '11px', color: '#8a7d5c'}}>PNBP: <span className="mono">Rp {(r.pnbpAmount / 1000000).toFixed(1)}jt</span></div>}
                  {canEdit && (
                    <div style={{display: 'flex', gap: '4px'}}>
                      <button onClick={() => { setEditingRecord(r); setModalOpen(true); }} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#1a2942', fontFamily: 'inherit'}}><Edit2 size={11} /></button>
                      <button onClick={() => handleDelete(r.id)} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar 7 stages */}
              <div style={{display: 'flex', gap: '2px', marginBottom: '10px'}}>
                {stages.map((s, i) => (
                  <div key={s} style={{flex: 1, height: '6px', background: i <= stageIdx ? stageColors[s] : '#f0ebe0', transition: 'background 0.3s'}} />
                ))}
              </div>

              {/* Date timeline */}
              <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '10px', color: '#8a7d5c', marginBottom: '8px'}}>
                {r.preregistDate && <span>1️⃣ {t.akl_stage_preregist}: <span className="mono">{r.preregistDate}</span></span>}
                {r.docsDate && <span>2️⃣ Docs: <span className="mono">{r.docsDate}</span></span>}
                {r.submitDate && <span>3️⃣ Submit: <span className="mono">{r.submitDate}</span></span>}
                {r.pnbpDate && <span>4️⃣ PNBP: <span className="mono">{r.pnbpDate}</span></span>}
                {r.evalDate && <span>5️⃣ Eval: <span className="mono">{r.evalDate}</span></span>}
                {r.fixDate && <span>6️⃣ Fix: <span className="mono">{r.fixDate}</span></span>}
                {r.issuedDate && <span style={{color: '#3a6b3a', fontWeight: 600}}>7️⃣ Issued: <span className="mono">{r.issuedDate}</span></span>}
              </div>

              {r.note && <div style={{padding: '8px 10px', background: '#f0ebe0', fontSize: '11px', fontStyle: 'italic', color: '#1a2942', marginBottom: '8px'}}>📝 {r.note}</div>}

              {canEdit && r.stage !== 'issued' && (
                <button onClick={() => advanceStage(r.id)} style={{padding: '6px 14px', fontSize: '11px', background: '#1a2942', color: '#f8f5ef', border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em', fontWeight: 500}}>
                  {t.akl_advance} →
                </button>
              )}
            </div>
          );
        })}
        {aklRecords.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#8a7d5c'}}>{t.no_data}</div>}
      </div>
      {modalOpen && <RegulatoryRecordModal record={editingRecord} recordType="akl" onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} />}
    </div>
  );
}

// ============== Reusable Regulatory CRUD Modal ==============
function RegulatoryRecordModal({ record, recordType, onSave, onClose, t, lang }) {
  // recordType: 'import' | 'akl' | 'bapeten' | 'pengalihan' | 'pi'
  const [form, setForm] = useState(record || getDefaultRecord(recordType));
  const titleKey = record ? `reg_modal_edit_${recordType}` : `reg_modal_add_${recordType}`;
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  function getDefaultRecord(type) {
    const today = new Date().toISOString().split('T')[0];
    const baseId = type + '_' + Date.now();
    if (type === 'import') {
      return { id: baseId, principal: '', principalCountry: '', product: '', stage: 'preregist', stageIdx: 0,
        registerDate: today, preregistDate: today, docsDate: null, submitDate: null, evalDate: null, issuedDate: null,
        importPermitNo: null, pic: 'Rini Wahyuni', note: '' };
    }
    if (type === 'akl') {
      return { id: baseId, principal: '', principalCountry: '', product: '', productClass: 'B',
        stage: 'preregist', stageIdx: 0, registerDate: today,
        targetDate: '', daysElapsed: 0, workingDaysRemaining: 30,
        preregistDate: today, docsDate: null, submitDate: null,
        pnbpDate: null, pnbpAmount: null, evalDate: null,
        fixDate: null, issuedDate: null, aklNo: null,
        pic: 'Rini Wahyuni', note: '' };
    }
    if (type === 'bapeten') {
      return { id: baseId, customer: '', modality: 'CT Scan', subModality: '',
        installDate: today, stage: 'docs', stageIdx: 0,
        docsComplete: false, submitDate: null, evalDate: null,
        pnbpAmount: null, issuedDate: null, pic: 'Rini Wahyuni', note: '' };
    }
    if (type === 'pengalihan') {
      return { id: baseId, customer: '', modality: 'CT Scan', subModality: '', destination: '',
        stage: 'submit', stageIdx: 0, submitDate: today, evalDate: null, issuedDate: null,
        permitNo: null, pic: 'Rini Wahyuni', note: '' };
    }
    if (type === 'pi') {
      const exp = new Date(today);
      exp.setDate(exp.getDate() + 21);
      return { id: baseId, piNo: '', principal: '', shipment: '', items: '',
        issuedDate: today, expiredDate: exp.toISOString().split('T')[0],
        status: 'active', note: '' };
    }
    return { id: baseId };
  }

  const renderFields = () => {
    if (recordType === 'import') return (
      <>
        <Field label={t.imp_principal} full><input value={form.principal} onChange={e => update('principal', e.target.value)} placeholder="Angell, Innocare, ANKE, SG Healthcare..." /></Field>
        <Field label="Negara"><input value={form.principalCountry} onChange={e => update('principalCountry', e.target.value)} placeholder="China, Taiwan, Korea..." /></Field>
        <Field label="Stage">
          <select value={form.stage} onChange={e => update('stage', e.target.value)}>
            {IMPORT_STAGES.map(s => <option key={s} value={s}>{t[`imp_stage_${s === 'preregist' ? 'pre' : s}`]}</option>)}
          </select>
        </Field>
        <Field label={t.imp_product} full><input value={form.product} onChange={e => update('product', e.target.value)} /></Field>
        <Field label="Tgl. Pra-Registrasi"><input type="date" value={form.preregistDate || ''} onChange={e => update('preregistDate', e.target.value)} /></Field>
        <Field label="Tgl. Pengumpulan Dokumen"><input type="date" value={form.docsDate || ''} onChange={e => update('docsDate', e.target.value)} /></Field>
        <Field label="Tgl. Submit"><input type="date" value={form.submitDate || ''} onChange={e => update('submitDate', e.target.value)} /></Field>
        <Field label="Tgl. Evaluasi"><input type="date" value={form.evalDate || ''} onChange={e => update('evalDate', e.target.value)} /></Field>
        <Field label="Tgl. Izin Terbit"><input type="date" value={form.issuedDate || ''} onChange={e => update('issuedDate', e.target.value)} /></Field>
        <Field label={t.imp_no}><input value={form.importPermitNo || ''} onChange={e => update('importPermitNo', e.target.value)} placeholder="BAPETEN/IMP/2026/00xxx" /></Field>
        <Field label={t.crud_pic}><input value={form.pic} onChange={e => update('pic', e.target.value)} /></Field>
        <Field label={t.akl_note} full><textarea rows={2} value={form.note || ''} onChange={e => update('note', e.target.value)} /></Field>
      </>
    );

    if (recordType === 'akl') return (
      <>
        <Field label={t.akl_principal}><input value={form.principal} onChange={e => update('principal', e.target.value)} /></Field>
        <Field label="Negara"><input value={form.principalCountry} onChange={e => update('principalCountry', e.target.value)} /></Field>
        <Field label={t.akl_product} full><input value={form.product} onChange={e => update('product', e.target.value)} /></Field>
        <Field label={t.akl_product_class}>
          <select value={form.productClass} onChange={e => update('productClass', e.target.value)}>
            <option value="A">A — {lang === 'id' ? 'Risiko Rendah' : 'Low Risk'}</option>
            <option value="B">B — {lang === 'id' ? 'Risiko Rendah-Menengah' : 'Low-Medium'}</option>
            <option value="C">C — {lang === 'id' ? 'Risiko Menengah-Tinggi' : 'Medium-High'}</option>
            <option value="D">D — {lang === 'id' ? 'Risiko Tinggi' : 'High Risk'}</option>
          </select>
        </Field>
        <Field label="Stage">
          <select value={form.stage} onChange={e => update('stage', e.target.value)}>
            {AKL_STAGES.map(s => <option key={s} value={s}>{t[`akl_stage_${s}`]}</option>)}
          </select>
        </Field>
        <Field label={t.akl_register_date}><input type="date" value={form.registerDate || ''} onChange={e => update('registerDate', e.target.value)} /></Field>
        <Field label={t.akl_target_date}><input type="date" value={form.targetDate || ''} onChange={e => update('targetDate', e.target.value)} /></Field>
        <Field label="Tgl. Pra-Registrasi"><input type="date" value={form.preregistDate || ''} onChange={e => update('preregistDate', e.target.value)} /></Field>
        <Field label="Tgl. Pengumpulan Dokumen"><input type="date" value={form.docsDate || ''} onChange={e => update('docsDate', e.target.value)} /></Field>
        <Field label="Tgl. Submit"><input type="date" value={form.submitDate || ''} onChange={e => update('submitDate', e.target.value)} /></Field>
        <Field label="Tgl. PNBP"><input type="date" value={form.pnbpDate || ''} onChange={e => update('pnbpDate', e.target.value)} /></Field>
        <Field label="Jumlah PNBP (Rp)"><input type="number" value={form.pnbpAmount || ''} onChange={e => update('pnbpAmount', parseFloat(e.target.value) || null)} /></Field>
        <Field label="Tgl. Evaluasi"><input type="date" value={form.evalDate || ''} onChange={e => update('evalDate', e.target.value)} /></Field>
        <Field label="Tgl. Perbaikan"><input type="date" value={form.fixDate || ''} onChange={e => update('fixDate', e.target.value)} /></Field>
        <Field label="Tgl. AKL Terbit"><input type="date" value={form.issuedDate || ''} onChange={e => update('issuedDate', e.target.value)} /></Field>
        <Field label={t.akl_akl_no}><input value={form.aklNo || ''} onChange={e => update('aklNo', e.target.value)} placeholder="AKL 20xxxxxxxxx" /></Field>
        <Field label="Sisa Hari Kerja"><input type="number" value={form.workingDaysRemaining || 0} onChange={e => update('workingDaysRemaining', parseInt(e.target.value) || 0)} /></Field>
        <Field label={t.crud_pic}><input value={form.pic} onChange={e => update('pic', e.target.value)} /></Field>
        <Field label={t.akl_note} full><textarea rows={2} value={form.note || ''} onChange={e => update('note', e.target.value)} /></Field>
      </>
    );

    if (recordType === 'bapeten') return (
      <>
        <Field label={t.customer} full><input value={form.customer} onChange={e => update('customer', e.target.value)} /></Field>
        <Field label={t.modality}>
          <select value={form.modality} onChange={e => update('modality', e.target.value)}>
            {Object.keys(MODALITY_COLORS).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="Sub-Modalitas"><input value={form.subModality} onChange={e => update('subModality', e.target.value)} /></Field>
        <Field label="Tgl. Instalasi"><input type="date" value={form.installDate} onChange={e => update('installDate', e.target.value)} /></Field>
        <Field label="Stage">
          <select value={form.stage} onChange={e => update('stage', e.target.value)}>
            <option value="docs">{t.reg_stage_docs}</option>
            <option value="submit">{t.reg_stage_submit}</option>
            <option value="eval">{t.reg_stage_eval}</option>
            <option value="pnbp">{t.reg_stage_pnbp}</option>
            <option value="issued">{t.reg_stage_issued}</option>
          </select>
        </Field>
        <Field label="Dokumen Lengkap?">
          <select value={form.docsComplete ? 'yes' : 'no'} onChange={e => update('docsComplete', e.target.value === 'yes')}>
            <option value="no">{t.reg_doc_pending}</option>
            <option value="yes">{t.reg_doc_complete}</option>
          </select>
        </Field>
        <Field label="Tgl. Submit"><input type="date" value={form.submitDate || ''} onChange={e => update('submitDate', e.target.value)} /></Field>
        <Field label="Tgl. Evaluasi"><input type="date" value={form.evalDate || ''} onChange={e => update('evalDate', e.target.value)} /></Field>
        <Field label="Jumlah PNBP (Rp)"><input type="number" value={form.pnbpAmount || ''} onChange={e => update('pnbpAmount', parseFloat(e.target.value) || null)} /></Field>
        <Field label="Tgl. Izin Terbit"><input type="date" value={form.issuedDate || ''} onChange={e => update('issuedDate', e.target.value)} /></Field>
        <Field label={t.crud_pic}><input value={form.pic || ''} onChange={e => update('pic', e.target.value)} /></Field>
        <Field label={t.reg_note} full><textarea rows={2} value={form.note || ''} onChange={e => update('note', e.target.value)} /></Field>
      </>
    );

    if (recordType === 'pengalihan') return (
      <>
        <Field label={t.customer} full><input value={form.customer} onChange={e => update('customer', e.target.value)} /></Field>
        <Field label={t.modality}>
          <select value={form.modality} onChange={e => update('modality', e.target.value)}>
            {Object.keys(MODALITY_COLORS).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="Sub-Modalitas"><input value={form.subModality} onChange={e => update('subModality', e.target.value)} /></Field>
        <Field label={t.pgl_destination}><input value={form.destination} onChange={e => update('destination', e.target.value)} /></Field>
        <Field label="Stage">
          <select value={form.stage} onChange={e => update('stage', e.target.value)}>
            {PENGALIHAN_STAGES.map(s => <option key={s} value={s}>{t[`pgl_stage_${s}`]}</option>)}
          </select>
        </Field>
        <Field label="Tgl. Submit"><input type="date" value={form.submitDate || ''} onChange={e => update('submitDate', e.target.value)} /></Field>
        <Field label="Tgl. Evaluasi"><input type="date" value={form.evalDate || ''} onChange={e => update('evalDate', e.target.value)} /></Field>
        <Field label="Tgl. Izin Terbit"><input type="date" value={form.issuedDate || ''} onChange={e => update('issuedDate', e.target.value)} /></Field>
        <Field label={t.pgl_no}><input value={form.permitNo || ''} onChange={e => update('permitNo', e.target.value)} placeholder="BAPETEN/PGL/2026/0xxxx" /></Field>
        <Field label={t.crud_pic}><input value={form.pic || ''} onChange={e => update('pic', e.target.value)} /></Field>
        <Field label={t.akl_note} full><textarea rows={2} value={form.note || ''} onChange={e => update('note', e.target.value)} /></Field>
      </>
    );

    if (recordType === 'pi') return (
      <>
        <Field label={t.pi_no}><input value={form.piNo} onChange={e => update('piNo', e.target.value)} placeholder="BAPETEN/PI/2026/00xxx" /></Field>
        <Field label={t.pi_principal}><input value={form.principal} onChange={e => update('principal', e.target.value)} /></Field>
        <Field label={t.pi_shipment} full><input value={form.shipment} onChange={e => update('shipment', e.target.value)} placeholder="ANGEL-SHP-2026-xx-xx" /></Field>
        <Field label={t.pi_items} full><textarea rows={2} value={form.items} onChange={e => update('items', e.target.value)} /></Field>
        <Field label={t.pi_issued_date}><input type="date" value={form.issuedDate} onChange={e => update('issuedDate', e.target.value)} /></Field>
        <Field label={t.pi_expired_date}><input type="date" value={form.expiredDate} onChange={e => update('expiredDate', e.target.value)} /></Field>
        <Field label="Status">
          <select value={form.status} onChange={e => update('status', e.target.value)}>
            <option value="active">{t.pi_status_active}</option>
            <option value="used">{t.pi_status_used}</option>
            <option value="expired">{t.pi_status_expired}</option>
          </select>
        </Field>
        <Field label={t.akl_note} full><textarea rows={2} value={form.note || ''} onChange={e => update('note', e.target.value)} /></Field>
      </>
    );
    return null;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{t[titleKey]}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#8a7d5c'}}><X size={20} /></button>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          {renderFields()}
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
          <button className="btn-primary" onClick={() => onSave(form)}>{t.crud_save}</button>
        </div>
      </div>
    </div>
  );
}

// ============== Incentive Module ==============
function IncentiveModule({ data, setData, t, lang, session, fmt, fmtFull, canEdit }) {
  const isSales = session.role === 'sales';
  const isOfficeAccount = session.salesId === 'office';
  // For sales role, filter to only own deals; for finance/CEO, show all
  const visibleData = isSales ? data.filter(s => s.salesOwner === session.salesId) : data;
  // Only PO Issued deals trigger incentive
  const poDeals = visibleData.filter(s => s.poStatus === 'issued');

  // Compute per-deal incentive
  const dealsWithIncentive = poDeals.map(s => {
    const calc = calcIncentive(s);
    const stat = getIncentiveStatus(s);
    return { ...s, _calc: calc, _stat: stat };
  });

  // Aggregate by status
  const totalEstimated = dealsWithIncentive.filter(d => d._stat?.status === 'estimated').reduce((sum, d) => sum + d._calc.incentive, 0);
  const totalReady = dealsWithIncentive.filter(d => d._stat?.status === 'ready').reduce((sum, d) => sum + d._calc.incentive, 0);
  const totalPaid = dealsWithIncentive.filter(d => d._stat?.status === 'paid').reduce((sum, d) => sum + d._calc.incentive, 0);
  const totalKsoSplit = dealsWithIncentive.filter(d => d._stat?.status === 'kso_prorata').reduce((sum, d) => sum + d._calc.incentive * (d._stat.progress || 0), 0);
  const ytdTotal = totalEstimated + totalReady + totalPaid + totalKsoSplit;

  // Leaderboard (for CEO/Finance only)
  const leaderboard = !isSales ? SALES_TEAM.map(sales => {
    const salesDeals = data.filter(s => s.salesOwner === sales.id && s.poStatus === 'issued');
    const total = salesDeals.reduce((sum, s) => sum + calcIncentive(s).incentive, 0);
    return { ...sales, total, dealsCount: salesDeals.length };
  }).sort((a, b) => b.total - a.total) : [];

  const [selectedDeal, setSelectedDeal] = useState(null);

  // Update operasional % per deal
  const updateOpsPercent = (id, opsPercent) => {
    if (!canEdit && !isSales) return;
    setData(prev => prev.map(s => s.id === id ? { ...s, opsPercent: Math.max(0, Math.min(0.5, opsPercent)) } : s));
  };

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: '#8a7d5c', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_incentive}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>
          {isSales ? t.inc_my_incentive : t.inc_team_incentive}
        </h1>
        <div style={{fontSize: '13px', color: '#8a7d5c', marginTop: '6px'}}>{t.inc_subtitle}</div>
      </div>

      {isOfficeAccount && (
        <div style={{padding: '14px 18px', background: 'rgba(200,169,106,0.15)', borderLeft: '3px solid #c8a96a', marginBottom: '20px', fontSize: '12.5px', color: '#1a2942', lineHeight: 1.6}}>
          <div style={{fontWeight: 700, marginBottom: '4px'}}>{t.inc_office_label}</div>
          <div style={{fontSize: '11.5px'}}>{t.inc_office_note}</div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#d4cdb8', marginBottom: '24px', border: '1px solid #d4cdb8'}}>
        <div style={{padding: '20px 22px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.22em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.inc_total_estimated}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '6px', color: '#94a3b8'}}>{fmt(totalEstimated)}</div>
          <div style={{fontSize: '10px', color: '#8a7d5c', marginTop: '6px'}}>📊 {t.inc_legend_est}</div>
        </div>
        <div style={{padding: '20px 22px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.22em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.inc_total_ready}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '6px', color: '#c8a96a'}}>{fmt(totalReady)}</div>
          <div style={{fontSize: '10px', color: '#8a7d5c', marginTop: '6px'}}>⏳ ≥50% paid / BAST done</div>
        </div>
        <div style={{padding: '20px 22px', background: '#fefcf7'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.22em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.inc_total_paid}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '6px', color: '#3a6b3a'}}>{fmt(totalPaid)}</div>
          <div style={{fontSize: '10px', color: '#8a7d5c', marginTop: '6px'}}>✅ {lang === 'id' ? 'Pembayaran 100%' : 'Fully paid'}</div>
        </div>
        <div style={{padding: '20px 22px', background: '#1a2942', color: '#f8f5ef'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.22em', color: '#c8a96a', textTransform: 'uppercase'}}>{t.inc_ytd}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '6px', color: '#fff'}}>{fmt(ytdTotal)}</div>
          <div style={{fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '6px'}}>{dealsWithIncentive.length} deals · 1.5% × Net Sales</div>
        </div>
      </div>

      {/* Status Legend */}
      <div style={{padding: '12px 16px', background: '#fefcf7', border: '1px solid #e8e1cc', marginBottom: '20px'}}>
        <div style={{fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8a7d5c', fontWeight: 600, marginBottom: '8px'}}>{t.inc_status_legend}</div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '11px', color: '#1a2942'}}>
          <span>{t.inc_legend_est}</span>
          <span>{t.inc_legend_ready}</span>
          <span>{t.inc_legend_paid}</span>
          <span>{t.inc_legend_kso}</span>
        </div>
      </div>

      {/* Leaderboard for CEO/Finance */}
      {!isSales && leaderboard.length > 0 && (
        <div className="card" style={{marginBottom: '22px'}}>
          <div className="card-title">{t.inc_leaderboard}</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px'}}>
            {leaderboard.map((s, idx) => (
              <div key={s.id} style={{padding: '14px', background: idx === 0 ? '#1a2942' : '#fefcf7', color: idx === 0 ? '#f8f5ef' : '#1a2942', border: '1px solid #e8e1cc', position: 'relative'}}>
                {idx === 0 && <span style={{position: 'absolute', top: '8px', right: '8px', padding: '1px 7px', fontSize: '9px', background: '#c8a96a', color: '#1a2942', fontWeight: 700, letterSpacing: '0.05em'}}>👑 #1</span>}
                {s.isOffice && <span style={{position: 'absolute', top: '8px', right: '8px', padding: '1px 7px', fontSize: '9px', background: '#c8a96a', color: '#1a2942', fontWeight: 700, letterSpacing: '0.05em'}}>🎯 OFFICE</span>}
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
                  <div style={{width: '34px', height: '34px', borderRadius: '50%', background: s.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700}}>{s.initial}</div>
                  <div>
                    <div style={{fontSize: '12.5px', fontWeight: 600}}>{s.name}</div>
                    <div style={{fontSize: '10px', opacity: 0.7}}>{lang === 'id' ? s.territory : s.territoryEn}</div>
                  </div>
                </div>
                <div className="mono" style={{fontSize: '16px', fontWeight: 600, color: idx === 0 ? '#c8a96a' : '#1a2942'}}>{fmt(s.total)}</div>
                <div style={{fontSize: '10px', opacity: 0.7, marginTop: '2px'}}>{s.dealsCount} {t.project_count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deal table */}
      <div style={{background: '#fefcf7', border: '1px solid #e8e1cc', overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '1000px'}}>
          <thead>
            <tr style={{background: '#f0ebe0'}}>
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
              const sales = SALES_TEAM.find(s => s.id === d.salesOwner);
              return (
                <tr key={d.id} className="hover-row" style={{borderTop: '1px solid #e8e1cc'}}>
                  <Td>
                    <div style={{fontWeight: 500}}>{d.customer}</div>
                    <div style={{fontSize: '10px', color: '#8a7d5c'}}>{t[`ptype_${d.projectType}`]} · <span className="mono">{d.sphNo}</span></div>
                  </Td>
                  <Td>
                    <div>{d.modality}</div>
                    <div style={{fontSize: '10px', color: '#8a7d5c'}}>{d.subModality}</div>
                  </Td>
                  {!isSales && <Td>{sales ? sales.name.split(' ')[0] : d.salesOwner}</Td>}
                  <Td align="right"><span className="mono">{fmt(d.totalValue)}</span></Td>
                  <Td align="right"><span className="mono" style={{color: '#8a7d5c'}}>{fmt(d._calc.netSales)}</span></Td>
                  <Td align="right"><span className="mono" style={{fontWeight: 700, color: '#1a2942'}}>{fmt(d._calc.incentive)}</span></Td>
                  <Td>
                    {d._stat && (
                      <span style={{padding: '3px 8px', fontSize: '10px', background: d._stat.color + '25', color: d._stat.color, fontWeight: 600}}>
                        {t[d._stat.label]}
                      </span>
                    )}
                  </Td>
                  <Td align="right">
                    <button onClick={() => setSelectedDeal(d)} style={{background: 'transparent', border: '1px solid #d4cdb8', padding: '4px 10px', fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit', color: '#1a2942'}}>{t.inc_view_detail}</button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {dealsWithIncentive.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#8a7d5c'}}>{lang === 'id' ? 'Belum ada deal PO yang terbit' : 'No PO issued yet'}</div>}
      </div>

      {/* Detail Modal */}
      {selectedDeal && (
        <div className="modal-overlay" onClick={() => setSelectedDeal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '580px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px'}}>
              <div>
                <div style={{fontSize: '10px', letterSpacing: '0.2em', color: '#8a7d5c', textTransform: 'uppercase'}}>{t.inc_breakdown}</div>
                <h2 className="serif" style={{fontSize: '22px', margin: '4px 0 0', fontWeight: 500}}>{selectedDeal.customer}</h2>
                <div style={{fontSize: '11px', color: '#8a7d5c', marginTop: '2px'}}>{selectedDeal.subModality}</div>
              </div>
              <button onClick={() => setSelectedDeal(null)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#8a7d5c'}}><X size={20} /></button>
            </div>

            <div style={{fontSize: '13px', lineHeight: 1.7}}>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '6px 0'}}>
                <span>{t.inc_gross_price}</span><span className="mono" style={{fontWeight: 500}}>{fmtFull(selectedDeal._calc.grossPrice)}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#8a7d5c'}}>
                <span>{t.inc_ppn}</span><span className="mono">− {fmtFull(selectedDeal._calc.ppn)}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #e8e1cc', borderBottom: '1px solid #e8e1cc'}}>
                <span style={{fontWeight: 600}}>{t.inc_dpp}</span><span className="mono" style={{fontWeight: 600}}>{fmtFull(selectedDeal._calc.dpp)}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#8a7d5c'}}>
                <span>{t.inc_pph23}</span><span className="mono">− {fmtFull(selectedDeal._calc.pph23)}</span>
              </div>
              <div style={{padding: '10px 12px', background: 'rgba(200,169,106,0.10)', border: '1px dashed #c8a96a', marginTop: '4px', marginBottom: '4px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#8a7d5c', alignItems: 'center'}}>
                  <span style={{fontWeight: 600, fontSize: '12px'}}>✏️ {t.inc_ops_cost} <span style={{fontSize: '10px', fontWeight: 400}}>{t.inc_ops_editable}</span></span>
                  <span className="mono" style={{fontSize: '13px', fontWeight: 600, color: '#1a2942'}}>− {fmtFull(selectedDeal._calc.opsCost)}</span>
                </div>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
                  <span style={{fontSize: '10px', color: '#8a7d5c', letterSpacing: '0.1em', textTransform: 'uppercase'}}>{lang === 'id' ? 'Edit %:' : 'Edit %:'}</span>
                  <input type="number" step="0.5" min="0" max="50" defaultValue={(selectedDeal._calc.opsPercent * 100).toFixed(1)} onChange={(e) => updateOpsPercent(selectedDeal.id, (parseFloat(e.target.value) || 0) / 100)} style={{width: '90px', padding: '6px 10px', fontSize: '13px', border: '1px solid #c8a96a', fontWeight: 600}} />
                  <span style={{fontSize: '13px', color: '#1a2942', fontWeight: 600}}>%</span>
                  <span style={{fontSize: '10px', color: '#3a6b3a', marginLeft: 'auto', fontStyle: 'italic'}}>✓ {lang === 'id' ? 'Otomatis tersimpan saat diubah' : 'Auto-saves on change'}</span>
                </div>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #1a2942', marginTop: '8px'}}>
                <span style={{fontWeight: 700, fontSize: '14px'}}>{t.inc_net_sales}</span>
                <span className="mono" style={{fontWeight: 700, fontSize: '14px'}}>{fmtFull(selectedDeal._calc.netSales)}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#8a7d5c'}}>
                <span>{t.inc_rate}</span><span className="mono">× 1.5%</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '14px 16px', marginTop: '8px', background: 'linear-gradient(90deg, #1a2942, #2a3f5f)', color: '#c8a96a'}}>
                <span style={{fontWeight: 700, fontSize: '15px'}}>{t.inc_amount}</span>
                <span className="mono" style={{fontWeight: 700, fontSize: '17px'}}>{fmtFull(selectedDeal._calc.incentive)}</span>
              </div>

              {selectedDeal._stat && (
                <div style={{marginTop: '14px', padding: '10px 14px', background: selectedDeal._stat.color + '15', borderLeft: `3px solid ${selectedDeal._stat.color}`}}>
                  <div style={{fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: selectedDeal._stat.color, fontWeight: 700, marginBottom: '3px'}}>Status</div>
                  <div style={{fontSize: '13px', fontWeight: 600, color: selectedDeal._stat.color}}>{t[selectedDeal._stat.label]}</div>
                  {selectedDeal._stat.progress !== undefined && (
                    <div style={{marginTop: '6px', height: '4px', background: '#f0ebe0'}}>
                      <div style={{height: '100%', width: `${(selectedDeal._stat.progress * 100).toFixed(0)}%`, background: selectedDeal._stat.color}} />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '20px'}}>
              <button className="btn-primary" onClick={() => setSelectedDeal(null)}>{t.inc_close}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

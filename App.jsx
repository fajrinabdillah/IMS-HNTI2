import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { TrendingUp, FileText, Briefcase, Plus, Search, Edit2, Trash2, X, ArrowUpRight, ArrowDownRight, Activity, DollarSign, Users, Clock, Globe, LogOut, Shield, Wrench, Truck, Wallet, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, FileCheck, Menu, ChevronDown, ChevronRight, ChevronLeft, ClipboardList, Star, Settings, ShieldCheck, CalendarDays, AlertTriangle, FileSearch, UserPlus, UserCheck, UserX, Plane, Receipt, Hotel, RefreshCw, History, FolderOpen, Upload, Download, Target, Layers, FileBarChart, Bell, Palette, Check } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, ComposedChart } from 'recharts';
import logoFull from './logo.png';
import logoKecil from './logo3.png';
import logoSidebar from './logo2.png';
import { translations } from './src/constants/i18n.js';
import { DEFAULT_USD_IDR, SALES_TEAM, TERRITORY_MAP, SALES_IDS_WITH_OFFICE, POSITION_ALLOWANCE, USERS, SEED_NAME_TO_USERNAME, OFFICE_SALES_ID, PERMISSIONS, NAV_BY_ROLE } from './src/constants/org.js';
import { KSO_INVESTOR_PCT_OPTIONS, KSO_YEAR_OPTIONS, CICILAN_DP_OPTIONS, CICILAN_TERM_OPTIONS, PRODUCT_MASTER_SEED, BUSINESS_PARTNERS, SPH_PRODUCT_NORMALIZATION, STAGES, PROJECT_TYPES, MODALITY_COLORS, TENDER_SUBSTAGES } from './src/constants/sales.js';
import { AKL_STAGES, IMPORT_STAGES, PENGALIHAN_STAGES, REG_STAGES, REG_STAGE_COLORS, REG_STAGE_DATE_FIELD, REG_STAGES_DEFAULT, REG_STAGES_AKL, REG_AUTHORITY, REG_PNBP_DEFAULT, REG_PERMIT_PREFIX, REG_TYPE_LABELS, IMPORT_PIPELINE_STEPS, LEGACY_IMPORT_STATUS_MAP } from './src/constants/regulatory.js';
import { PPN_RATE, PPH23_RATE, OPS_COST_DEFAULT, INCENTIVE_RATE, NET_MARGIN_BY_MODALITY, NET_MARGIN_DEFAULT, PAYMENT_TERMS } from './src/constants/finance.js';
import { STORAGE_KEY, REPORTS_KEY, PRODUCT_KEY, PRODUCT_SUPPORT_ACTIVITIES_KEY, PRODUCT_SUPPORT_FILES_KEY, DOCUMENT_TEMPLATE_KEY, GENERATED_DOCS_KEY, LANG_KEY, SESSION_KEY, RATE_KEY, _THEME_KEY, ANNOTATIONS_KEY, MAX_AUDIT_ENTRIES, AUDIT_LOG_KEY, NOTIF_KEY, MAX_NOTIFICATIONS, NOTIFICATION_TTL_MS, NOTIFICATION_DEDUPE_MS } from './src/constants/storageKeys.js';
import { DOC_TYPE_LABELS, OFFICIAL_DOC_TEMPLATE_TYPES, DEFAULT_DOCUMENT_TEMPLATES } from './src/constants/docs.js';
import { IMS_THEMES, CHART_COLORS } from './src/constants/theme.js';
import { SEED_FIELD_REPORTS, SEED_ISSUES, SEED_AKL_RECORDS, SEED_IMPORT_RECORDS, SEED_PENGALIHAN_RECORDS, SEED_PI_RECORDS, SEED_INSTALL_RECORDS, SEED_BAST_RECORDS, SEED_TRAINING_RECORDS, SEED_BUSINESS_TRIPS, SEED_BT_REALIZATIONS } from './src/constants/seedData.js';
import { initialOf, formatCurrency, formatCurrencyFull, formatDateTime, parseSafeDateMs, dateOnlyFromValue, addDateOnlyDays, normalizeExternalUrl, formatDuration, inferMimeFromName, formatFileSize, escapeHtml, safeDocFilename, _normHdr, _num, _normDate } from './src/utils/format.js';
import { detectSalesOwnerFromCustomer, TECHNICIAN_NAMES, STATIC_TECH_ORDER, resolveEmpName, resolveNamesInText, SALES_META_BY_ID, employeeSalesId, getActiveSalesTeam, activeSalesIdSet, normalizeSalesOwnedRows, isLiveEmployeeUsername, normalizeEmployeeOwnedRows, detectPaymentScheme, resolveCustomerSector, resolveDealModel, _addMonthsISO, computeInvoiceSchedule, resolveProductId, normalizeProduct, getRegStages, sanitizeRegStageHistory, migrateRegRecord, normalizeImportPipelineStatus, importPipelineLabel, projectHasDpReceived, manifestMatchesProject, appendStageHistoryEntry, getStageMetrics, applySphStageStatusCoherence, normalizeSphStageRecords, normalizePoWon, calcIncentive, getIncentiveStatus, getNetMargin, calcNetProfit, getProductFileUrl, normalizeProductLookupText, getFactoryProductionDays, addDaysIso, getFactoryProductionInfo, resolveProductRecord, syncSphRecordToProductMaster, syncSphDataToProductMaster, effectiveScheme, generatePaymentSchedule, getPaymentSummary } from './src/utils/domain.js';
import { _memStore, _hasArtifactStorage, _hasLocalStorage, _SUPA_URL, _SUPA_KEY, _supaEnabled, _supaFetch, _supaSession, _SUPA_SESS_LS, _authFetch, _supaSignIn, _refreshInFlight, _supaRefreshTok, _supaSignOut, _restoreSupaSession, _getSupaTok, _supaReq, _pushVapidPublicKey, _urlBase64ToUint8Array, pushSupported, registerServiceWorker, savePushSubscription, enablePushNotifications, refreshPushSubscription, getPushPermissionStatus, sendServerPushNotification, _rtSocket, _rtHeartbeat, _rtRetryCount, _rtRetryTimer, _rtStatus, _setRtStatus, _hashStr, _recentWrites, _markRecentWrite, _isRecentSelfEcho, blockCloudApply, isCloudApplyBlocked, markSphLocalWrite, shouldRejectStaleSphCloud, _rtJoinRef, _RT_TOPIC, _startRealtime, _scheduleRtRetry, _stopRealtime, _tokRefreshTimer, _startProactiveRefresh, _stopProactiveRefresh, storeGet, storeSet, storeDel, _persistPending, _persistTimer, debouncedStoreSet, flushPersist } from './src/utils/storage.js';
import { stripRemovedEmployees, healCollection } from './src/utils/purgeLegacyEmployees.js';
import { normalizeSphProjects } from './src/utils/sphProject.js';
import { expandEmbeddedSphLineItems, buildRecordsFromForm, getProjectSiblings } from './src/utils/sphMultiItem.js';

/** Pastikan setiap mutasi/load SPH melewati paket harga + kunci proyek multi-alat. */
function normalizeSphDataset(rows, productList = []) {
  const list = Array.isArray(rows) ? rows : [];
  const expanded = expandEmbeddedSphLineItems(list);
  const synced = syncSphDataToProductMaster(expanded, productList);
  const staged = normalizeSphStageRecords(synced);
  const grouped = normalizeSphProjects(staged);
  return normalizePoWon(grouped);
}

function sphDataEqual(a, b) {
  try { return JSON.stringify(a) === JSON.stringify(b); } catch { return false; }
}
import { generateHntiSph2026Seed, _RAW_ALL_SPH, ALL_SPH, buildSeedNotificationsFromSph, generateInstalledUnits, generateSeedManifestsFromSph, generateSeedCustomsDocsFromSph, SEED_MANIFESTS, SEED_CUSTOMS_DOCS, generateInstallDocs, INSTALL_DOCS, ALL_BUSINESS_TRIPS, generateRegulatoryRecords } from './src/data/seed.js';
import { TOAST_EVENT, showToast } from './src/utils/toast.js';
import { mergeDocumentTemplates, downloadDataUrl, downloadUploadedTemplate, previewUploadedTemplate, getUploadedDocumentTemplate, openDocumentTemplateOrHtml, downloadDocumentTemplateOrDoc, downloadCSV, downloadHtmlDoc, openPrintableHtml, getUserSignature, getUserDisplayName, findUserByRole, printHtmlStringAsPdf, renderDocLines, renderDocFooter, renderSignatureBlock, wrapDocumentInLetterhead, buildTextLetterheadHtml, buildHntiLetterheadHtml, renderDualSignatureHtml, buildEditorTemplate, getTemplateHtmlBody, fillTemplatePlaceholders, buildEditorBody, buildSPHDocumentHtml, downloadSPHWord, printSPHPdf, buildSPPDocumentHtml, downloadSPPWord, printSPPPdf, buildInvoiceKwitansiHtml, buildPrincipalPoHtml, buildBAIDocumentHtml, printBAIPdf, buildBAUjiFungsiDocumentHtml, printBAUjiFungsiPdf, buildBATrainingDocumentHtml, downloadBATrainingDoc, printBATrainingPdf, buildBASTBarangDocumentHtml, downloadBASTBarangDoc, printBASTBarangPdf, buildKwitansiHtml } from './src/utils/documents.js';
import { parseCSV, buildColMap, SPH_IMPORT_ALIASES, _STATUS_ALIASES, _STAGE_VALID, parseSPHImport, PAY_IMPORT_ALIASES, _PAYTYPE_ALIASES, parsePaymentImport } from './src/utils/csvImport.js';
import { appendAuditLog, pushDedupeMemory, notificationDedupeKey, pruneNotifications, hasRecentDuplicateNotification, pushNotificationToList, isNotificationForUser, countUnreadNotifications, triggerBrowserNotification, notify, formatNotifTime } from './src/utils/notifications.js';
import { getStoredTheme, setStoredTheme } from './src/utils/theme.js';
import { IMSLogo, GlobalStyles, WIBClock, ChartTooltip, PieCard, KPICard, ReadOnlyBanner, Field, ConfirmDialog, LinkAttachment, SortToggle, Th, Td, SyncIndicator, ModuleErrorBoundary } from './src/components/ui.jsx';
import { DocumentEditorModal } from './src/components/DocumentEditorModal.jsx';
import { ToastContainer } from './src/components/ToastContainer.jsx';
import { ChangePasswordModal } from './src/components/ChangePasswordModal.jsx';
import { NotificationBell } from './src/components/NotificationBell.jsx';
import { Header, HoverSidebar, Footer } from './src/components/layout.jsx';
import { FinanceDashboardCharts, FinanceModule, NetProfitAnalysis } from './src/modules/FinanceModule.jsx';
import { SPH_WORKFLOW_LABELS, SPH_PROJECT_STAGE_STEPS, projectStageDate, getProjectStageRows } from './src/utils/sphStage.js';
import { SPHWorkflowConsole, SPHDetailModal, SPHManagement, PipelineBoard, SalesModule, SalesReport, SRDashboard, SRForm, SRHistory, SPHModal } from './src/modules/SalesModule.jsx';
import { ProductSupportModule, LifecycleKpiScorecard, ExecutiveSummary, CashFlowProjection, Valuation } from './src/modules/analytics.jsx';
import { PRODUCT_FILE_TYPES, ProductMasterModule, ProductModal } from './src/modules/ProductMasterModule.jsx';
import { DocumentTemplateModule } from './src/modules/DocumentTemplateModule.jsx';
import { AuditLogModule } from './src/modules/AuditLogModule.jsx';
import { ModuleAccessPanel, EmployeesModule, EmployeeModal } from './src/modules/EmployeesModule.jsx';
import { BusinessTripModule, BusinessTripCard, BusinessTripForm, BusinessTripDetail, BusinessTripRealizationCard, BusinessTripRealizationForm, BusinessTripRealizationDetail, BusinessTripDashboard } from './src/modules/BusinessTripModule.jsx';
import { CustomsNoteEditor, localDeliveryStatusLabel, getLocalDeliveryDefaults, EditableLocalDeliveryField, OperationsDashboardCharts, OperationsModule, ManifestList, CustomsDocsList, ManifestModal, CustomsDocModal } from './src/modules/OperationsModule.jsx';
import { MaintenanceModule, MaintenanceIssueModal, PMScheduleModal } from './src/modules/MaintenanceModule.jsx';
import { TechnicalSupportModule } from './src/modules/TechnicalSupportModule.jsx';
import { IncentiveModule } from './src/modules/IncentiveModule.jsx';
import { InstallationModule, InstallRecordsList, BASTList, TrainingCertList, UnitPickerField, findInstallRecordForUnit, installLeadTechnicianName, activeEmployeeNamesByRole, InstallRecordModal, BASTModal, TrainingCertModal } from './src/modules/InstallationModule.jsx';
import { healTechnicianName, mergeUnitsWithPmSchedule, migrateModuleAccess } from './src/utils/technicalSupport.js';
import { mergeSphImportRecords, healSphSalesFromImportLabels } from './src/utils/sphImport.js';
import { isLikelySeedSphDataset, shouldPersistSphData, lockProductionSph, isProductionSphLocked } from './src/utils/sphGuard.js';
import sphRestore2026 from './src/data/sphRestore2026.json';
import { Dashboard } from './src/modules/Dashboard.jsx';
import { RegulatoryDashboardCharts, RegulatoryModule, regStageLabel, RegDurationTimeline, UniformRegPipeline, RegulatoryRecordModal } from './src/modules/RegulatoryModule.jsx';

// ============== i18n ==============

// ============== 5 Sales Team — synced with user spec ==============

// ============== Territory-Based Sales Owner Mapping ==============
// Mapping kota → sales owner berdasarkan area yang Bapak Fajrin tetapkan
// Catatan: Faskes Group (Hermina pusat, Pramita pusat, dll) di-handle dari kantor pusat
// → SPH masuk ke sales yang area-nya = kantor pusat group tersebut

// Helper: tebak sales owner dari nama customer
// Aturan: extract kota dari nama RS → cek di TERRITORY_MAP
// Khusus untuk Faskes Group (RS Hermina, Klinik Pramita, RS Mitra Keluarga, RS Siloam, RS Hermina, RS Premier):
//   - Hermina/Mitra Keluarga/Siloam/Premier dengan pusat di Jakarta → Dwi
//   - Pramita dengan pusat di Surabaya → Bagus
//   - Tapi tetap respect kota tujuan kalau ada (kecuali Hermina pusat di Jakarta = Dwi)


// Sales IDs to include in bulk generator (include office and icha)

// ============== Allowance per Position (Business Trip) ==============


// Technician roster derived from the employee DB (USERS) — keeps maintenance in sync (#5/#6)

// ===== Universal employee-name sync layer =====
// Maps an original seed display-name → username, built from the static USERS seed.
Object.entries(USERS).forEach(([un, info]) => { if (info.name) SEED_NAME_TO_USERNAME[info.name] = un; });
// Static technician order (from USERS seed) — used for positional fallback when a technician
// username has been renamed in the live DB (e.g. 'teknisi' → 'teknisi1').
// Derive a 1-2 letter avatar initial from a name (always computed from the live name so it
// stays correct after renames — never relies on a stored, possibly-stale, initial field).
// Resolve ANY stored value (live username, original seed name/username, or custom text) to the
// current live employee name. Resilient to renamed usernames via technician positional fallback.

// Resolve any seed technician name embedded inside a free-text string (e.g. training instructor
// "teknisi + Aplikator") to the current live employee name, so renamed staff never leak.




// ============== Seed Data Reset — 60 SPH tahun 2026 dari SPH sebagai sumber utama ==============
// Dataset aktif aplikasi dibangun oleh generateHntiSph2026Seed() dan diturunkan ke modul
// Finance, Operasional, Instalasi, Regulatory, Maintenance, Product Support, dan notifikasi.

// Helper: detect payment scheme from project type + customer type
// - KSO: deposit + 60× bagi hasil bulanan (5 tahun)
// - Government/RSUD (project type government or tender to RSUD): 100% after BAST (no DP)
// - Private RS/Klinik: DP 30% + cicilan (default 12×, bisa sampai 36×)

// ============== SPH Enhancement (Tahap 8) — Deal Model & Invoice Schedule ==============
// Skema bisnis konkret yang Pak Fajrin minta:
//  RS SWASTA → (a) Cicilan: DP 10–100% + termin 1–36 bulan
//              (b) KSO: durasi 5–10 tahun + bagi hasil HNTI 60.0–80.0% (step 0.5%)
//  RS PEMERINTAH → (a) e-Katalog: 100% setelah BAST
//                  (b) Tender:    100% setelah BAST
//                  (c) KSO:       (sama dgn KSO swasta)
//
// Field baru di record SPH (semua opsional & backward-compatible):
//   customerSector: 'swasta' | 'pemerintah'        — diturunkan dari projectType bila kosong
//   dealModel:      'cicilan' | 'kso' | 'ekatalog' | 'tender'
//                                                  — diturunkan dari paymentScheme + projectType bila kosong
//   dpPercent:      0–100 (sudah ada, dipakai utk cicilan)
//   installmentMonths: 1–60 untuk cicilan, 60–120 untuk kso (dihitung dari ksoYears)
//   ksoYears:       5–10 (baru)
//   ksoInvestorPct: 60.0–80.0 step 0.5 (baru) — porsi HNTI; porsi RS = 100 − ksoInvestorPct
//
// Helper resolveDealModel: 1 sumber kebenaran untuk seluruh modul hilir
// Daftar opsi KSO investor% — 60.0, 60.5, …, 80.0 (41 opsi)
// Opsi DP cicilan — 0, 1, 2, …, 100 (step 1%)

// Tambah N bulan ke string tanggal 'YYYY-MM-DD'. Pakai UTC ops agar konsisten.

// Hitung jadwal invoice/tagihan berdasarkan dealModel. Untuk Finance & Proyeksi 5-Tahun.
// Mengembalikan { invoices: [{seq, date, type, label, amount}], totalCount, scheme }
// `baseDate` = tanggal PO untuk cicilan/e-kat/tender, tanggal install+ujifungsi untuk KSO.

// ============== Product Master Database ==============
// Single source of truth untuk semua produk yang dijual HNTI
// Field: id, name (display), modality (kategori), brand, type (model), origin, principal (manufacturer), tkdn, akl, active, notes
// Storage: ims_hnti:prod_v22 — editable via Master Produk module

// ============== Stable Product Linkage (Catatan #2) ==============
// SPH dihubungkan ke master produk via productId yang STABIL.
// Ini memastikan: saat nama/tipe/principal produk diedit, jumlah SPH TIDAK hilang.
// Karena link by ID, bukan by string modality::type.
// resolveProductId: cari product yang cocok untuk sebuah SPH (by existing productId, lalu fallback by modality+type)


// ============== Business Partners ==============
// Catatan #4: product chips are DERIVED from the Product Master (by brand match) so they always
// stay in sync. Each partner lists the master brand(s) it represents; products auto-populate.



// ============== SPH Product Normalization ==============
// Selaraskan modality/subModality SPH lama → Master Produk 2026-05-30 (dari spreadsheet Fajrin)
// Supaya badge "dipakai di X SPH" di Master Produk akurat + dashboard modality chart sinkron
// key: "oldModality::oldSubModality" → { modality, subModality } sesuai master

// Territory auto-correction: apply detectSalesOwnerFromCustomer to seed
// → Semarang/Solo RS → Hatim, Surabaya RS → Bagus, Hermina/Mitra Keluarga/Pramita → pusat
// Sub-dealer and Office tetap (tidak dimapping ke kota tertentu)


// ============== Seed Field Reports (Laporan Lapangan untuk semua Sales) ==============
// Detail naratif yang realistis untuk demo go-live, periode Jan-Mei 2026 (~20 minggu)

// ============== Installed Units 2025 (for Maintenance & Regulatory) ==============
// 58 units installed in 2025 from won SPHs + new installations from 2026

// ============== Maintenance Issues (Repairs & Complaints) ==============

// ============== AKL Kemenkes Records (Distribution License) ==============
// 7-stage pipeline: pra-registrasi → pengumpulan dokumen → submit Regalkes → PNBP → evaluasi tim penilai → perbaikan → AKL terbit
// Max duration: 30 working days


// ============== Izin Import BAPETEN (prerequisite untuk AKL) ==============

// ============== Izin Pengalihan BAPETEN ==============

// ============== Izin Persetujuan Import (PI) - berlaku 21 hari kerja ==============


// ============== Uniform 6-Stage Regulatory Pipeline (Phase 2a) ==============









// ============== Operations: Manifests & Customs Docs ==============



// ============== Installation Records (CRUD) ==============

// ============== BAST Records (CRUD) ==============

// ============== Training Certificate Records (CRUD) ==============

// ============== Auto-generate complete installation documentation for ALL installed units ==============
// Setiap unit TERPASANG (installationStatus='installed') mendapat BA-INST, BAST, dan Sertifikat Training
// yang konsisten, sehingga seluruh angka modul Instalasi selaras dengan data SPH historis.
// Record showcase 2026 yang sudah ditulis tangan tetap dipertahankan (kualitas narasinya).

// ============== Business Trip Seed Data ==============
// Initial seed (representative samples — full 2025+2026 historical data akan ditambahkan di Prompt 4)
// Status workflow: draft → pending_finance → pending_mops → pending_gm → approved → paid → in_progress → completed
// Reject di level mana saja: status = 'rejected'
// Klarifikasi: status = 'clarification' (kembali ke employee untuk revise)

// ============== Business Trip Realizations Seed ==============
// Hanya trip dengan status in_progress / completed yang sudah paid yang dapat dilaporkan realisasinya
// Workflow: draft → pending_finance → pending_mops → pending_gm → approved
// Hanya tombol Setujui + Klarifikasi (TIDAK ada Tolak, sesuai instruksi Bapak Fajrin)

// ============== Historical Business Trip Seed Generator ==============
// Generates realistic 2025 (12 months) + 2026 (Jan-May) trips for all employees
// Pattern based on role: Sales travels most, Teknisi for installs/PM, CEO for closing visits


// Combine seed + historical

// ============== Regulatory Records (BAPETEN permits) ==============
// For installed units, generate regulatory tracking





// Helpers

// Storage
// ── Logo assets (pastikan kedua file ada di folder /public/ di repo GitHub) ──────────────
// logo.png  → berlatar putih, untuk halaman login
// logo3.png → berlatar gelap, untuk header & sidebar
const LOGO_MAIN_SRC = logoFull;
const LOGO_ICON_SRC = logoKecil;



// ============== Universal Storage Adapter ==============
// CRITICAL FIX: works across environments —
//   • Vercel / normal browser → localStorage (persistent across logout/login/reload)
//   • Claude artifact preview → window.storage
//   • SSR / no-storage fallback → in-memory
// Previously relied solely on window.storage (Claude API) which does NOT exist on Vercel,
// causing every edit (employees, products, finance, etc.) to revert on reload.
// ── Supabase cloud storage (Tahap 4 migration) ───────────────────────────────
// Anon key AMAN di browser selama RLS aktif (sudah kita aktifkan di Tahap 2-3).
// ▼▼▼ GANTI baris _SUPA_KEY di bawah dengan anon key Anda dari Supabase Settings → API Keys ▼▼▼
// ▲▲▲ setelah diganti, commit & deploy → data akan tersimpan di Supabase ▲▲▲
// _supaFetch: tok=null → pakai anon key; tok=access_token → pakai session token (authenticated)
if (typeof window !== 'undefined' && !_supaEnabled()) {
  console.warn('[IMS] Supabase belum dikonfigurasi — memakai localStorage sementara. Ganti _SUPA_KEY di kode.');
}

// ── Supabase Auth (Tahap 6b) — login, refresh token, restore session ─────────
// Token sesi HANYA disimpan di localStorage browser (tidak di kv_store Supabase).
// Request ber-otorisasi ke Supabase: jika ditolak auth (401/403) → refresh token & coba ulang sekali.
// Penting setelah RLS dikunci ke 'authenticated': mencegah desync diam-diam akibat token basi.


// ── Realtime sync (Tahap 7) — push live antar-device via Supabase Realtime ────
// WebSocket Phoenix Channel ke tabel kv_store. Saat device lain INSERT/UPDATE/DELETE,
// device ini terima event langsung & update state via custom DOM event 'ims:cloud:change'.
// _rtJoinRef disimpan di module scope agar access_token refresh bisa kirim join_ref yang benar
// Proactive token refresh — cek tiap 8 menit, refresh bila <15 menit ke kedaluwarsa

// ── Debounced persistence (speed booster) ──────────────────────────────────
// Coalesces rapid state changes (typing, toggling) into a single localStorage write
// after a short idle, so large JSON isn't serialized+written on every keystroke.
// A guaranteed flush on page-hide/unload ensures ZERO data loss.
if (typeof window !== 'undefined' && !window.__hntiFlushBound) {
  window.__hntiFlushBound = true;
  window.addEventListener('pagehide', flushPersist);
  window.addEventListener('beforeunload', flushPersist);
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (document.hidden) flushPersist(); });
}

// ============== Stage Duration Tracking (Tahap 11 — Phase 1) ==============
// Foundation untuk KPI Scorecard di Phase 7. Setiap perubahan stage SPH dicatat di
// sph.stageHistory[] sebagai entry { from, to, by, at }. Helper getStageMetrics()
// menghitung durasi total per stage dari history. Idempotent — aman dipanggil ulang.
// Hitung durasi (ms) per stage. Algoritma: stage X mulai saat entry.to === X,
// berakhir saat entry berikutnya (from === X). Stage current terbuka — hitung dari
// entry terakhir ke now. Returns: { perStage: {stage: ms}, totalMs, currentStage, currentStageMs }
// Format milliseconds → readable ("3h 24j", "2j 15m", "45m", "<1m")

// Keep the won/PO invariant coherent (review #1/#3): a deal whose PO is issued (stage 'po_issued'
// or poStatus 'issued') IS a won deal. Idempotent — safe to run on every data load. Never touches
// deals explicitly marked lost or cancelled.

// ============== Incentive Configuration ==============

// Calculate incentive breakdown for a given SPH/PO

// Determine incentive status based on project type & payment progress

// ============== Net Profit Configuration ==============



// Payment term mapping

// ============== Refined Logo (3-layer diamond) ==============
// React.memo wrapped - logo is pure presentational, no state, no parent re-render needed
// ====== KODE LOGO KECIL DASBOR ======
// ====================================
// Global styles
// ============== Theme System (Tahap 9) ==============
// Dua tema: Venta Emerald (default, brightened) + Sapphire Noir (investor-pitch).
// Preferensi disimpan per-device di localStorage, JANGAN di-sync Realtime
// (Pak Fajrin bisa pakai laptop pitch di Sapphire, workstation harian di Emerald).


// Main App
export default function App() {
  const [lang, setLang] = useState('id');
  const [theme, setTheme] = useState(getStoredTheme);
  useEffect(() => {
    setStoredTheme(theme);
    try { if (typeof document !== 'undefined' && document.body) document.body.setAttribute('data-ims-theme', theme); } catch {}
  }, [theme]);
  const [session, setSession] = useState(null);
  const [data, setData] = useState([]);
  const sphHydratedRef = useRef(false);
  const [reports, setReports] = useState(SEED_FIELD_REPORTS);
  const [issues, setIssues] = useState(SEED_ISSUES);
  const [pmSchedule, setPmSchedule] = useState([]);
  const [manifests, setManifests] = useState(SEED_MANIFESTS);
  const [customsDocs, setCustomsDocs] = useState(SEED_CUSTOMS_DOCS);
  const [installRecords, setInstallRecords] = useState(INSTALL_DOCS.install);
  const [bastRecords, setBastRecords] = useState(INSTALL_DOCS.bast);
  const [trainingRecords, setTrainingRecords] = useState(INSTALL_DOCS.training);
  const [regRecords, setRegRecords] = useState([]);
  const [aklRecords, setAklRecords] = useState(SEED_AKL_RECORDS);
  const [importRecords, setImportRecords] = useState(SEED_IMPORT_RECORDS);
  const [pengalihanRecords, setPengalihanRecords] = useState(SEED_PENGALIHAN_RECORDS);
  const [piRecords, setPiRecords] = useState(SEED_PI_RECORDS);
  const [employees, setEmployees] = useState(() => stripRemovedEmployees(USERS));
  const [businessTrips, setBusinessTrips] = useState(ALL_BUSINESS_TRIPS);
  const [realizations, setRealizations] = useState([]);
  const [products, setProducts] = useState(PRODUCT_MASTER_SEED);
  const setSphData = useCallback((updater) => {
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const normalized = normalizeSphDataset(next, products);
      return sphDataEqual(normalized, prev) ? prev : normalized;
    });
  }, [products]);

  const [productSupportActivities, setProductSupportActivities] = useState([]);
  const [productSupportFiles, setProductSupportFiles] = useState([]);
  const [documentTemplates, setDocumentTemplates] = useState(DEFAULT_DOCUMENT_TEMPLATES);
  const [generatedDocs, setGeneratedDocs] = useState([]); // riwayat dokumen hasil editor
  const [annotations, setAnnotations] = useState([]);
  const [unitTechMap, setUnitTechMap] = useState({}); // per-unit manual technician override (maintenance #1)
  const [reportsSeen, setReportsSeen] = useState({}); // per-user last-read date for weekly field reports (notif dismissal)
  const [moduleAccess, setModuleAccess] = useState({}); // CEO-managed per-user module access override { username: [moduleIds] }
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_USD_IDR);
  const [auditLog, setAuditLog] = useState([]);
  const [notifications, setNotifications] = useState(() => buildSeedNotificationsFromSph());
  // Listener: modul mana pun dapat dispatch 'ims:notify' untuk push notifikasi
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onNotify = (e) => {
      const { target, payload, fromUser } = e.detail || {};
      if (!target || !payload?.message) return;
      const previewNotif = { toRole: target.role || null, toUsername: target.username || null };
      const uiKey = 'ui:' + notificationDedupeKey(target, payload);
      const uiRecentlyShown = Date.now() - (pushDedupeMemory.get(uiKey) || 0) <= NOTIFICATION_DEDUPE_MS;
      if (isNotificationForUser(previewNotif, session) && !uiRecentlyShown && !hasRecentDuplicateNotification(notifications, target, payload)) {
        pushDedupeMemory.set(uiKey, Date.now());
        triggerBrowserNotification(payload, lang);
      }
      setNotifications(prev => pushNotificationToList(prev, target, payload, fromUser));
    };
    window.addEventListener('ims:notify', onNotify);
    return () => window.removeEventListener('ims:notify', onNotify);
  }, [session, notifications, lang]);
  // Web Push: daftarkan ulang subscription saat login & saat app dibuka kembali (penting untuk HP).
  useEffect(() => {
    if (!session?.username) return;
    let cancelled = false;
    (async () => {
      const result = await enablePushNotifications(session);
      if (!cancelled && !result.ok && result.reason !== 'permission_denied') {
        console.warn('[IMS] push registration:', result.reason);
      }
    })();
    return () => { cancelled = true; };
  }, [session?.username, session?.role]);

  useEffect(() => {
    if (!session?.username || typeof document === 'undefined') return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshPushSubscription(session);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [session?.username, session?.role]);
  const [loading, setLoading] = useState(true);

  // Re-normalize SPH when product master changes (sync modality/brand + paket proyek).
  useEffect(() => {
    if (loading) return;
    setSphData(prev => prev);
  }, [products, loading, setSphData]);
  // Last sync timestamp - updated on every storage write (data changed) or manual refresh
  const [lastSync, setLastSync] = useState(Date.now());
  const handleRefresh = () => {
    setLastSync(Date.now());
    // Trigger a state update to force re-renders downstream (in real app this would re-fetch from server)
    setData(prev => [...prev]);
  };
  // Logger function passed down to modules — records every meaningful action
  const logAction = (action) => {
    if (!session) return;
    appendAuditLog(setAuditLog, {
      user: session.username, userName: session.name, role: session.role,
      module: action.module || 'unknown',
      action: action.action || 'update', // create | update | delete | login | export | etc
      entityId: action.entityId || null,
      entityLabel: action.entityLabel || '',
      field: action.field || null,
      before: action.before ?? null,
      after: action.after ?? null,
      note: action.note || '',
    });
  };

  useEffect(() => {
    (async () => {
      // Pulihkan sesi Supabase Auth (jika pernah login sebelumnya) sebelum load data
      if (_supaEnabled()) {
        const restored = await _restoreSupaSession();
        if (restored) { _startRealtime(); _startProactiveRefresh(); }
      }
      // ONE-TIME MIGRATION: clear obsolete storage keys from older versions
      // This forces a fresh seed load when user upgrades to v22 schema (with payment scheme fields)
      const MIGRATION_MARKER = 'ims_hnti:schema_v22_migrated';
      const migrated = await storeGet(MIGRATION_MARKER);
      if (!migrated) {
        const obsoleteKeys = [
          'ims_hnti:data_v15', 'ims_hnti:reports_v15', 'ims_hnti:lang_v15', 'ims_hnti:session_v15', 'ims_hnti:rate_v15',
          'ims_hnti:issues_v15', 'ims_hnti:reg_v15', 'ims_hnti:akl_v15', 'ims_hnti:imp_v15', 'ims_hnti:pgl_v15',
          'ims_hnti:pi_v15', 'ims_hnti:pm_v15', 'ims_hnti:mfst_v15', 'ims_hnti:cdoc_v15', 'ims_hnti:inst_v15',
          'ims_hnti:bast_v15', 'ims_hnti:train_v15', 'ims_hnti:emp_v18', 'ims_hnti:bt_v19', 'ims_hnti:btr_v20',
          // also previous attempts
          'ims_hnti:data_v14', 'ims_hnti:data_v13', 'ims_hnti:data_v12',
        ];
        for (const k of obsoleteKeys) {
          await storeDel(k);
        }
        await storeSet(MIGRATION_MARKER, 'true');
      }

      // V23 migration: refresh exchange rate (Rp 17,500 → Rp 18,000)
      const RATE_MIGRATION_MARKER = 'ims_hnti:rate_v23_migrated';
      const rateMigrated = await storeGet(RATE_MIGRATION_MARKER);
      if (!rateMigrated) {
        await storeDel('ims_hnti:rate_v22');
        await storeSet(RATE_MIGRATION_MARKER, 'true');
      }

      // V34 migration: auto-fix SPH sales ownership based on customer location (territory map)
      // + seed product master
      const V34_MIGRATION_MARKER = 'ims_hnti:v34_territory_migrated';
      const v34Migrated = await storeGet(V34_MIGRATION_MARKER);
      if (!v34Migrated) {
        // Re-assign sales owners based on customer city
        const existingSPH = await storeGet(STORAGE_KEY);
        if (existingSPH) {
          try {
            const parsed = JSON.parse(existingSPH);
            const fixed = parsed.map(s => {
              // Only auto-correct if we can confidently detect; otherwise keep existing
              const correct = detectSalesOwnerFromCustomer(s.customer);
              if (correct && correct !== s.salesOwner) {
                return { ...s, salesOwner: correct, _autoReassigned: { from: s.salesOwner, to: correct, reason: 'territory_match', at: new Date().toISOString() } };
              }
              return s;
            });
            await storeSet(STORAGE_KEY, JSON.stringify(fixed));
          } catch {}
        }
        // Clear old product key to force reload of fresh seed (with Precision + Innocare)
        await storeDel('ims_hnti:prod_v22');
        await storeDel('ims_hnti:prod_v23');
        await storeSet(V34_MIGRATION_MARKER, 'true');
      }

      // V35 migration: FORCE full re-sync of sales ownership across ALL existing data
      // This guarantees Pipeline/Sales Team/Incentive all read identical owner assignments.
      // Runs once; recomputes every SPH owner from territory map (overriding any stale assignment).
      const V35_RESYNC_MARKER = 'ims_hnti:v35_resync_migrated';
      const v35Resynced = await storeGet(V35_RESYNC_MARKER);
      if (!v35Resynced) {
        const existingSPH = await storeGet(STORAGE_KEY);
        if (existingSPH) {
          try {
            const parsed = JSON.parse(existingSPH);
            const resynced = parsed.map(s => {
              // Normalize product modality/subModality to new master
              const key = `${s.modality}::${s.subModality}`;
              const norm = SPH_PRODUCT_NORMALIZATION[key];
              let next = norm ? { ...s, modality: norm.modality, subModality: norm.subModality } : s;
              // Skip sub-dealer/partner (own logic) for territory
              if (next.customerType === 'subdistributor' || next.customerType === 'partner') return next;
              const correct = detectSalesOwnerFromCustomer(next.customer);
              if (correct && correct !== next.salesOwner) {
                return { ...next, salesOwner: correct };
              }
              return next;
            });
            await storeSet(STORAGE_KEY, JSON.stringify(resynced));
          } catch {}
        }
        // Refresh product master to new spreadsheet data
        await storeDel('ims_hnti:prod_v22');
        await storeDel('ims_hnti:prod_v23');
        await storeSet(V35_RESYNC_MARKER, 'true');
      }

      // V40 migration: heal orphan technician names in persisted records
      // Bug ditemukan Pak Fajrin 6 Juni 2026: install records di Supabase masih punya nama
      // teknisi fiktif ("Eko Prasetyo", "Budi Hartono", "Rudi Susanto") dari deploy lama.
      // Code sudah update USERS (sekarang Robby/Yusuf/Ichsan) tapi data persistent tidak ter-overwrite.
      // Solusi: scan inst/bast/train records, replace nama orphan dengan nama dari USERS aktif.
      const V40_MIGRATION_MARKER = 'ims_hnti:v40_techname_migrated';
      const v40Migrated = await storeGet(V40_MIGRATION_MARKER);
      if (!v40Migrated) {
        // Mapping nama orphan (bukan karyawan) → username teknisi di master karyawan
        const ORPHAN_TECH_MAP = {
          'Eko Prasetyo': 'teknisi3',
          'Budi Hartono': 'teknisi',
          'Rudi Susanto': 'teknisi2',
          'Eko': 'teknisi3',
          'Budi': 'teknisi',
          'Rudi': 'teknisi2',
        };
        const healName = (val) => {
          if (typeof val !== 'string' || !val) return val;
          // Direct map first
          if (ORPHAN_TECH_MAP[val]) return ORPHAN_TECH_MAP[val];
          // Substring check (for multi-tech strings like "Eko Prasetyo & Budi Hartono")
          let out = val;
          for (const [old, neu] of Object.entries(ORPHAN_TECH_MAP)) {
            // Word boundary replace to avoid partial matches
            out = out.replace(new RegExp('\\b' + old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g'), neu);
          }
          return out;
        };
        const healArrayField = (arr) => Array.isArray(arr) ? arr.map(healName) : arr;
        const healRecord = (rec) => {
          if (!rec || typeof rec !== 'object') return rec;
          const next = { ...rec };
          // Common technician fields across modules
          ['technician', 'technicianName', 'pic', 'assignedTo', 'leadTech', 'leadTechnician', 'instructor', 'pelaksana'].forEach(k => {
            if (next[k] !== undefined) next[k] = healName(next[k]);
          });
          ['technicians', 'team', 'crew'].forEach(k => {
            if (next[k] !== undefined) next[k] = healArrayField(next[k]);
          });
          // Notes/remarks string fields (heal substring matches)
          ['notes', 'remarks', 'note', 'description'].forEach(k => {
            if (typeof next[k] === 'string') next[k] = healName(next[k]);
          });
          return next;
        };
        const healCollection = async (key) => {
          const stored = await storeGet(key);
          if (!stored) return;
          try {
            const parsed = JSON.parse(stored);
            if (!Array.isArray(parsed)) return;
            const healed = parsed.map(healRecord);
            // Only write back if anything changed
            if (JSON.stringify(healed) !== stored) {
              await storeSet(key, JSON.stringify(healed));
            }
          } catch {}
        };
        await healCollection('ims_hnti:inst_v30');
        await healCollection('ims_hnti:bast_v30');
        await healCollection('ims_hnti:train_v30');
        await healCollection('ims_hnti:pm_v22');
        await storeSet(V40_MIGRATION_MARKER, 'true');
      }


      // V41 migration: normalize regulatory records to uniform 6-stage pipeline
      const V41_MIGRATION_MARKER = 'ims_hnti:v41_reg_uniform_migrated';
      const v41Migrated = await storeGet(V41_MIGRATION_MARKER);
      if (!v41Migrated) {
        const healRegCollection = async (key, type) => {
          const stored = await storeGet(key);
          if (!stored) return;
          try {
            const parsed = JSON.parse(stored);
            if (!Array.isArray(parsed)) return;
            const healed = parsed.map(r => migrateRegRecord(r, type));
            if (JSON.stringify(healed) !== stored) {
              await storeSet(key, JSON.stringify(healed));
            }
          } catch {}
        };
        await healRegCollection('ims_hnti:akl_v22', 'akl');
        await healRegCollection('ims_hnti:imp_v22', 'import');
        await healRegCollection('ims_hnti:pgl_v22', 'pengalihan');
        await healRegCollection('ims_hnti:pi_v22', 'pi');
        await healRegCollection('ims_hnti:reg_v30', 'bapeten');
        await storeSet(V41_MIGRATION_MARKER, 'true');
      }

      // V42 migration: hapus Lukman dari data persisten & master karyawan bootstrap
      const V42_MIGRATION_MARKER = 'ims_hnti:v42_purge_lukman_migrated';
      const v42Migrated = await storeGet(V42_MIGRATION_MARKER);
      if (!v42Migrated) {
        const healStoredArray = async (key) => {
          const stored = await storeGet(key);
          if (!stored) return;
          try {
            const parsed = JSON.parse(stored);
            if (!Array.isArray(parsed)) return;
            const healed = healCollection(parsed);
            if (JSON.stringify(healed) !== stored) await storeSet(key, JSON.stringify(healed));
          } catch {}
        };
        const empStored = await storeGet('ims_hnti:emp_v22');
        if (empStored) {
          try {
            const parsed = stripRemovedEmployees(JSON.parse(empStored));
            if (JSON.stringify(parsed) !== empStored) await storeSet('ims_hnti:emp_v22', JSON.stringify(parsed));
          } catch {}
        }
        const sphStored = await storeGet(STORAGE_KEY);
        if (sphStored) {
          try {
            const parsed = JSON.parse(sphStored);
            if (Array.isArray(parsed)) {
              const healed = healCollection(parsed);
              if (JSON.stringify(healed) !== sphStored) await storeSet(STORAGE_KEY, JSON.stringify(healed));
            }
          } catch {}
        }
        await healStoredArray(REPORTS_KEY);
        await healStoredArray('ims_hnti:bt_v22');
        await healStoredArray('ims_hnti:inst_v30');
        await healStoredArray('ims_hnti:bast_v30');
        await healStoredArray('ims_hnti:train_v30');
        await healStoredArray('ims_hnti:pm_v22');
        await storeSet(V42_MIGRATION_MARKER, 'true');
      }

      // V43 migration: pulihkan salesOwner dari label CSV / reassignment metadata → salesId
      const V43_MIGRATION_MARKER = 'ims_hnti:v43_sph_sales_import_healed';
      const v43Migrated = await storeGet(V43_MIGRATION_MARKER);
      if (!v43Migrated) {
        const sphStored = await storeGet(STORAGE_KEY);
        if (sphStored) {
          try {
            let empData = USERS;
            const empStored = await storeGet('ims_hnti:emp_v22');
            if (empStored) empData = stripRemovedEmployees(JSON.parse(empStored));
            const parsed = JSON.parse(sphStored);
            if (Array.isArray(parsed)) {
              const healed = healSphSalesFromImportLabels(parsed, empData);
              if (JSON.stringify(healed) !== sphStored) await storeSet(STORAGE_KEY, JSON.stringify(healed));
            }
          } catch {}
        }
        await storeSet(V43_MIGRATION_MARKER, 'true');
      }

      // V44 migration: pulihkan data SPH produksi HANYA jika tertimpa seed demo eksplisit.
      // Tidak pernah timpa data produksi ≥100 baris (lock / high-water).
      const V44_RESTORE_MARKER = 'ims_hnti:v44_sph_production_restore';
      const v44Restored = await storeGet(V44_RESTORE_MARKER);
      if (!v44Restored) {
        const sphStored = await storeGet(STORAGE_KEY);
        let parsed = null;
        try { parsed = sphStored ? JSON.parse(sphStored) : null; } catch {}
        const count = Array.isArray(parsed) ? parsed.length : 0;
        const needsRestore = isLikelySeedSphDataset(parsed) && !isProductionSphLocked() && count < 100;
        if (needsRestore && Array.isArray(sphRestore2026) && sphRestore2026.length > 100) {
          let empData = USERS;
          const empStored = await storeGet('ims_hnti:emp_v22');
          if (empStored) empData = stripRemovedEmployees(JSON.parse(empStored));
          const productStored = await storeGet(PRODUCT_KEY);
          let productList = PRODUCT_MASTER_SEED;
          if (productStored) try { productList = JSON.parse(productStored); } catch {}
          const restored = healSphSalesFromImportLabels(normalizeSphDataset(sphRestore2026, productList), empData);
          await storeSet(STORAGE_KEY, JSON.stringify(restored));
          lockProductionSph(restored.length);
          markSphLocalWrite(restored.length);
        }
        await storeSet(V44_RESTORE_MARKER, 'true');
      }

      // V45: kunci production lock dari data tersimpan (cegah regresi ke seed setelah perbaikan manual).
      const V45_LOCK_MARKER = 'ims_hnti:v45_sph_production_lock';
      const v45Locked = await storeGet(V45_LOCK_MARKER);
      if (!v45Locked) {
        const sphStored = await storeGet(STORAGE_KEY);
        if (sphStored) {
          try {
            const parsed = JSON.parse(sphStored);
            if (Array.isArray(parsed) && parsed.length >= 100 && !isLikelySeedSphDataset(parsed)) {
              lockProductionSph(parsed.length);
            }
          } catch {}
        }
        await storeSet(V45_LOCK_MARKER, 'true');
      }

      // V46: pecah record SPH legacy (items[] embedded) → baris per alat + sinkron proyek.
      const V46_SPLIT_MARKER = 'ims_hnti:v46_sph_split_embedded_items';
      const v46Split = await storeGet(V46_SPLIT_MARKER);
      if (!v46Split) {
        const sphStored = await storeGet(STORAGE_KEY);
        if (sphStored) {
          try {
            const parsed = JSON.parse(sphStored);
            if (Array.isArray(parsed)) {
              const productStoredEarly = await storeGet(PRODUCT_KEY);
              const productListEarly = productStoredEarly ? JSON.parse(productStoredEarly) : PRODUCT_MASTER_SEED;
              const normalized = normalizeSphDataset(parsed, productListEarly);
              const nextJson = JSON.stringify(normalized);
              if (nextJson !== sphStored) {
                blockCloudApply(STORAGE_KEY, 180000);
                await storeSet(STORAGE_KEY, nextJson);
                markSphLocalWrite(normalized.length);
                if (normalized.length >= 100) lockProductionSph(normalized.length);
              }
            }
          } catch {}
        }
        await storeSet(V46_SPLIT_MARKER, 'true');
      }

      // V47: sesuai permintaan CEO, kosongkan seluruh history realisasi perjalanan dinas lama.
      // Pengajuan cash advance tetap dipertahankan, hanya link realizationId yang dibersihkan.
      const V47_CLEAR_BT_REALIZATIONS_MARKER = 'ims_hnti:v47_clear_bt_realizations';
      const v47ClearBtRealizations = await storeGet(V47_CLEAR_BT_REALIZATIONS_MARKER);
      if (!v47ClearBtRealizations) {
        const btStoredForClear = await storeGet('ims_hnti:bt_v22');
        if (btStoredForClear) {
          try {
            const parsedBt = JSON.parse(btStoredForClear);
            if (Array.isArray(parsedBt)) {
              const cleanedBt = parsedBt.map(trip => trip?.realizationId ? { ...trip, realizationId: null } : trip);
              await storeSet('ims_hnti:bt_v22', JSON.stringify(cleanedBt));
            }
          } catch {}
        }
        await storeSet('ims_hnti:btr_v22', JSON.stringify([]));
        await storeSet(V47_CLEAR_BT_REALIZATIONS_MARKER, 'true');
      }

      const [d, l, s, r, rep, iss, reg, akl, imp, pgl, pi, pm, mfst, cdoc, inst, bast, train, emp, bt] = await Promise.all([
        storeGet(STORAGE_KEY), storeGet(LANG_KEY), storeGet(SESSION_KEY),
        storeGet(RATE_KEY), storeGet(REPORTS_KEY),
        storeGet('ims_hnti:issues_v30'), storeGet('ims_hnti:reg_v30'),
        storeGet('ims_hnti:akl_v22'),
        storeGet('ims_hnti:imp_v22'), storeGet('ims_hnti:pgl_v22'), storeGet('ims_hnti:pi_v22'),
        storeGet('ims_hnti:pm_v22'),
        storeGet('ims_hnti:mfst_v30'), storeGet('ims_hnti:cdoc_v30'),
        storeGet('ims_hnti:inst_v30'), storeGet('ims_hnti:bast_v30'), storeGet('ims_hnti:train_v30'),
        storeGet('ims_hnti:emp_v22'),
        storeGet('ims_hnti:bt_v22')
      ]);
      if (d && !isCloudApplyBlocked(STORAGE_KEY)) try {
        const parsed = JSON.parse(d);
        setSphData(parsed);
        if (Array.isArray(parsed) && parsed.length >= 100 && !isLikelySeedSphDataset(parsed)) {
          lockProductionSph(parsed.length);
          markSphLocalWrite(parsed.length);
        }
      } catch {}
      sphHydratedRef.current = true;
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
      if (emp) try { setEmployees(stripRemovedEmployees(JSON.parse(emp))); } catch {}
      if (bt) try { setBusinessTrips(JSON.parse(bt)); } catch {}
      const btrStored = await storeGet('ims_hnti:btr_v22');
      if (btrStored) try { setRealizations(JSON.parse(btrStored)); } catch {}
      const auditStored = await storeGet(AUDIT_LOG_KEY);
      if (auditStored) try { setAuditLog(JSON.parse(auditStored)); } catch {}
      const notifStored = await storeGet(NOTIF_KEY);
      if (notifStored) try { setNotifications(pruneNotifications(JSON.parse(notifStored))); } catch {}
      const productStored = await storeGet(PRODUCT_KEY);
      if (productStored) try { setProducts(JSON.parse(productStored)); } catch {}
      const annStored = await storeGet(ANNOTATIONS_KEY);
      if (annStored) try { setAnnotations(JSON.parse(annStored)); } catch {}
      const utStored = await storeGet('ims_hnti:unittech_v1');
      if (utStored) try { setUnitTechMap(JSON.parse(utStored)); } catch {}
      const rsStored = await storeGet('ims_hnti:reports_seen_v1');
      if (rsStored) try { setReportsSeen(JSON.parse(rsStored)); } catch {}
      const maStored = await storeGet('ims_hnti:access_v1');
      if (maStored) try { setModuleAccess(migrateModuleAccess(JSON.parse(maStored))); } catch {}
      const psActivitiesStored = await storeGet(PRODUCT_SUPPORT_ACTIVITIES_KEY);
      if (psActivitiesStored) try { setProductSupportActivities(JSON.parse(psActivitiesStored)); } catch {}
      const psFilesStored = await storeGet(PRODUCT_SUPPORT_FILES_KEY);
      if (psFilesStored) try { setProductSupportFiles(JSON.parse(psFilesStored)); } catch {}
      const docTplStored = await storeGet(DOCUMENT_TEMPLATE_KEY);
      if (docTplStored) try { setDocumentTemplates(mergeDocumentTemplates(JSON.parse(docTplStored))); } catch {}
      const genDocsStored = await storeGet(GENERATED_DOCS_KEY);
      if (genDocsStored) try { const a = JSON.parse(genDocsStored); if (Array.isArray(a)) setGeneratedDocs(a); } catch {}
      // Generate reg records on first load from current data
      if (reg) {
        try { setRegRecords(JSON.parse(reg)); } catch {}
      } else {
        const sphData = d ? normalizePoWon(JSON.parse(d)) : [];
        let bastData = INSTALL_DOCS.bast;
        if (bast) try { bastData = JSON.parse(bast); } catch {}
        const units = generateInstalledUnits(sphData, bastData);
        setRegRecords(generateRegulatoryRecords(units));
      }
      setLoading(false);
    })();
  }, []);

  // ── Realtime: terima perubahan dari device lain & update state seketika ───────
  const [syncStatus, setSyncStatus] = useState('offline');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const h = (e) => setSyncStatus(e.detail?.status || 'offline');
    const dead = () => { _stopRealtime(); _stopProactiveRefresh(); setSession(null); };
    window.addEventListener('ims:rt:status', h);
    window.addEventListener('ims:session:dead', dead);
    return () => { window.removeEventListener('ims:rt:status', h); window.removeEventListener('ims:session:dead', dead); };
  }, []);

  // ── Resync-on-reconnect (Tahap 10) ────────────────────────────────────────────
  // BUG FIX: saat WebSocket disconnect (umum di iOS standalone webview / background tab),
  // event postgres_changes dari device lain hilang permanen. Kode lama hanya open
  // WebSocket baru tanpa re-fetch → data jadi stale di device yang sempat offline.
  // Solusi: setiap kali status transisi ke 'live', tarik ulang semua key dari Supabase.
  const prevSyncRef = useRef('offline');
  const isInitialLiveRef = useRef(true);
  const resyncDebounceRef = useRef(null);
  const sphCountRef = useRef(0);
  useEffect(() => { sphCountRef.current = Array.isArray(data) ? data.length : 0; }, [data]);
  const applyCloudSphData = useCallback((incoming, source = 'cloud') => {
    if (!Array.isArray(incoming)) return false;
    if (isCloudApplyBlocked(STORAGE_KEY)) return false;
    if (shouldRejectStaleSphCloud(incoming, sphCountRef.current)) {
      try { console.warn(`[IMS resync] tolak snapshot SPH stale dari ${source}: cloud=${incoming.length}, lokal=${sphCountRef.current}`); } catch {}
      return false;
    }
    setSphData(incoming);
    return true;
  }, [setSphData]);
  const resyncFromCloud = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      const [d, rep, iss, reg, akl, imp, pgl, pi, pm, mfst, cdoc, inst, bast, train, emp, bt, btr, audit, prod, ann, ut, rs, ma, r, notif, psAct, psFiles, docTpl, genDocs] = await Promise.all([
        storeGet(STORAGE_KEY), storeGet(REPORTS_KEY),
        storeGet('ims_hnti:issues_v30'), storeGet('ims_hnti:reg_v30'), storeGet('ims_hnti:akl_v22'),
        storeGet('ims_hnti:imp_v22'), storeGet('ims_hnti:pgl_v22'), storeGet('ims_hnti:pi_v22'),
        storeGet('ims_hnti:pm_v22'), storeGet('ims_hnti:mfst_v30'), storeGet('ims_hnti:cdoc_v30'),
        storeGet('ims_hnti:inst_v30'), storeGet('ims_hnti:bast_v30'), storeGet('ims_hnti:train_v30'),
        storeGet('ims_hnti:emp_v22'), storeGet('ims_hnti:bt_v22'), storeGet('ims_hnti:btr_v22'),
        storeGet(AUDIT_LOG_KEY), storeGet(PRODUCT_KEY), storeGet(ANNOTATIONS_KEY),
        storeGet('ims_hnti:unittech_v1'), storeGet('ims_hnti:reports_seen_v1'),
        storeGet('ims_hnti:access_v1'), storeGet(RATE_KEY),
        storeGet(NOTIF_KEY), storeGet(PRODUCT_SUPPORT_ACTIVITIES_KEY), storeGet(PRODUCT_SUPPORT_FILES_KEY), storeGet(DOCUMENT_TEMPLATE_KEY), storeGet(GENERATED_DOCS_KEY)
      ]);
      const safe = (v, setter) => { if (v) try { setter(JSON.parse(v)); } catch {} };
      if (d && !isCloudApplyBlocked(STORAGE_KEY)) {
        try {
          const parsed = JSON.parse(d);
          applyCloudSphData(parsed, 'resync');
        } catch {}
      }
      safe(rep, setReports); safe(iss, setIssues); safe(reg, setRegRecords);
      safe(akl, setAklRecords); safe(imp, setImportRecords); safe(pgl, setPengalihanRecords);
      safe(pi, setPiRecords); safe(pm, setPmSchedule); safe(mfst, setManifests);
      safe(cdoc, setCustomsDocs); safe(inst, setInstallRecords); safe(bast, setBastRecords);
      safe(train, setTrainingRecords); safe(emp, setEmployees); safe(bt, setBusinessTrips);
      safe(btr, setRealizations); safe(audit, setAuditLog); safe(prod, setProducts);
      safe(ann, setAnnotations); safe(ut, setUnitTechMap); safe(rs, setReportsSeen);
      if (ma) try { setModuleAccess(migrateModuleAccess(JSON.parse(ma))); } catch {}
      if (notif) try { setNotifications(pruneNotifications(JSON.parse(notif))); } catch {}
      safe(psAct, setProductSupportActivities); safe(psFiles, setProductSupportFiles);
      if (docTpl) try {
        const parsed = JSON.parse(docTpl);
        if (parsed && typeof parsed === 'object') setDocumentTemplates(prev => {
          const incoming = mergeDocumentTemplates(parsed);
          const cur = mergeDocumentTemplates(prev);
          if ((incoming.updatedAt || '') < (cur.updatedAt || '')) return prev; // lokal lebih baru
          return incoming;
        });
      } catch {}
      if (genDocs) try { const a = JSON.parse(genDocs); if (Array.isArray(a)) setGeneratedDocs(a); } catch {}
      if (r) setExchangeRate(parseFloat(r) || DEFAULT_USD_IDR);
    } catch (e) {
      try { console.warn('[IMS resync] failed', e); } catch {}
    }
  }, [products, applyCloudSphData]);
  useEffect(() => {
    const prev = prevSyncRef.current;
    prevSyncRef.current = syncStatus;
    // Transisi *→live = reconnect. Initial mount juga melewati ini, tapi data sudah dimuat
    // oleh useEffect mount sebelumnya, jadi skip re-fetch pertama.
    if (syncStatus === 'live' && prev !== 'live') {
      if (isInitialLiveRef.current) { isInitialLiveRef.current = false; return; }
      resyncFromCloud();
    }
  }, [syncStatus, resyncFromCloud]);

  // ── Foreground recovery (Tahap 10) ────────────────────────────────────────────
  // iOS standalone webview & background browser tab sering di-suspend. WebSocket bisa
  // ter-orphan (marked open tapi dead). Saat user balik foreground, paksa resync +
  // re-kick Realtime kalau status bukan live.
  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    const scheduleResync = () => {
      if (resyncDebounceRef.current) clearTimeout(resyncDebounceRef.current);
      resyncDebounceRef.current = setTimeout(() => {
        resyncDebounceRef.current = null;
        if (isCloudApplyBlocked(STORAGE_KEY)) return;
        resyncFromCloud();
      }, 2000);
    };
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (!session) return;
      try { _startRealtime(); } catch {}
      scheduleResync();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
      if (resyncDebounceRef.current) clearTimeout(resyncDebounceRef.current);
    };
  }, [session, resyncFromCloud]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const parse = (v) => { try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return v; } };
    const handler = (e) => {
      if (loading) return; // jangan ganggu seed awal
      const { key, value } = e.detail || {};
      if (!key || value === undefined || value === null) return; // null = payload Realtime terpotong (file besar) — JANGAN apply
      const v = parse(value);
      if (v === undefined || v === null) return; // parse gagal / payload rusak — jangan reset state
      switch (key) {
        case STORAGE_KEY:
          applyCloudSphData(Array.isArray(v) ? v : null, 'realtime');
          break;
        case LANG_KEY: if (typeof v === 'string') setLang(v); break;
        case SESSION_KEY: /* sengaja diabaikan: sesi login per-device, jangan ditimpa device lain */ return;
        case RATE_KEY: { const n = parseFloat(v); if (!isNaN(n)) setExchangeRate(n); break; }
        case REPORTS_KEY: setReports(v); break;
        case 'ims_hnti:issues_v30': setIssues(v); break;
        case 'ims_hnti:reg_v30': setRegRecords(v); break;
        case 'ims_hnti:akl_v22': setAklRecords(v); break;
        case 'ims_hnti:imp_v22': setImportRecords(v); break;
        case 'ims_hnti:pgl_v22': setPengalihanRecords(v); break;
        case 'ims_hnti:pi_v22': setPiRecords(v); break;
        case 'ims_hnti:pm_v22': setPmSchedule(v); break;
        case 'ims_hnti:mfst_v30': setManifests(v); break;
        case 'ims_hnti:cdoc_v30': setCustomsDocs(v); break;
        case 'ims_hnti:inst_v30': setInstallRecords(v); break;
        case 'ims_hnti:bast_v30': setBastRecords(v); break;
        case 'ims_hnti:train_v30': setTrainingRecords(v); break;
        case 'ims_hnti:emp_v22': setEmployees(v); break;
        case 'ims_hnti:bt_v22': setBusinessTrips(v); break;
        case 'ims_hnti:btr_v22': setRealizations(v); break;
        case AUDIT_LOG_KEY: setAuditLog(v); break;
        case NOTIF_KEY: setNotifications(pruneNotifications(Array.isArray(v) ? v : [])); break;
        case PRODUCT_KEY: setProducts(v); break;
        case PRODUCT_SUPPORT_ACTIVITIES_KEY: setProductSupportActivities(Array.isArray(v) ? v : []); break;
        case PRODUCT_SUPPORT_FILES_KEY: setProductSupportFiles(Array.isArray(v) ? v : []); break;
        case GENERATED_DOCS_KEY: { if (Array.isArray(v)) setGeneratedDocs(v); break; }
        case DOCUMENT_TEMPLATE_KEY: {
          if (typeof v !== 'object') return; // string terpotong → abaikan
          setDocumentTemplates(prev => {
            const incoming = mergeDocumentTemplates(v);
            const cur = mergeDocumentTemplates(prev);
            const incAt = incoming.updatedAt || '';
            const curAt = cur.updatedAt || '';
            // Last-write-wins: data masuk lebih lama dari lokal → tolak
            if (incAt && curAt && incAt < curAt) { console.warn('[docTpl sync] stale echo ditolak', { incAt, curAt }); return prev; }
            // Sanity: echo kehilangan file yang baru kita upload (payload terpotong) → tolak
            const incFiles = (incoming.documentFiles || []).filter(f => f.dataUrl).length;
            const curFiles = (cur.documentFiles || []).filter(f => f.dataUrl).length;
            if (incFiles < curFiles && incAt <= curAt) { console.warn('[docTpl sync] echo kehilangan file — ditolak', { incFiles, curFiles }); return prev; }
            return incoming;
          });
          break;
        }
        case ANNOTATIONS_KEY: setAnnotations(v); break;
        case 'ims_hnti:unittech_v1': setUnitTechMap(v); break;
        case 'ims_hnti:reports_seen_v1': setReportsSeen(v); break;
        case 'ims_hnti:access_v1': setModuleAccess(migrateModuleAccess(v)); break;
        default: return;
      }
      setLastSync(Date.now());
    };
    window.addEventListener('ims:cloud:change', handler);
    return () => window.removeEventListener('ims:cloud:change', handler);
  }, [loading, setSphData]);

  // Master employee sync: sales/employee references in operational modules must never point
  // to inactive or deleted employees. Orphaned sales ownership is reassigned to Office.
  useEffect(() => {
    if (loading) return;
    setSphData(prev => {
      const next = normalizeSalesOwnedRows(prev, employees, 'salesOwner');
      return sphDataEqual(next, prev) ? prev : next;
    });
    setReports(prev => {
      const next = normalizeSalesOwnedRows(prev, employees, 'salesId');
      return JSON.stringify(next) === JSON.stringify(prev) ? prev : next;
    });
    setBusinessTrips(prev => {
      const next = normalizeEmployeeOwnedRows(prev, employees, 'travelerUsername', 'travelerName');
      return JSON.stringify(next) === JSON.stringify(prev) ? prev : next;
    });
    setRealizations(prev => {
      const next = normalizeEmployeeOwnedRows(prev, employees, 'travelerUsername', 'travelerName');
      return JSON.stringify(next) === JSON.stringify(prev) ? prev : next;
    });
    setModuleAccess(prev => {
      const liveUsers = new Set(Object.keys(employees || {}));
      const next = Object.fromEntries(Object.entries(prev || {}).filter(([username]) => liveUsers.has(username)));
      return JSON.stringify(next) === JSON.stringify(prev || {}) ? prev : next;
    });
  }, [employees, loading]);

  useEffect(() => {
    if (loading || !sphHydratedRef.current) return;
    if (!shouldPersistSphData(data)) return;
    markSphLocalWrite(data.length);
    if (data.length >= 100) lockProductionSph(data.length);
    debouncedStoreSet(STORAGE_KEY, JSON.stringify(data));
    setLastSync(Date.now());
  }, [data, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet(REPORTS_KEY, JSON.stringify(reports)); }, [reports, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet('ims_hnti:issues_v30', JSON.stringify(issues)); }, [issues, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet('ims_hnti:reg_v30', JSON.stringify(regRecords)); }, [regRecords, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet('ims_hnti:akl_v22', JSON.stringify(aklRecords)); }, [aklRecords, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet('ims_hnti:imp_v22', JSON.stringify(importRecords)); }, [importRecords, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet('ims_hnti:pgl_v22', JSON.stringify(pengalihanRecords)); }, [pengalihanRecords, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet('ims_hnti:pi_v22', JSON.stringify(piRecords)); }, [piRecords, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet('ims_hnti:pm_v22', JSON.stringify(pmSchedule)); }, [pmSchedule, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet('ims_hnti:mfst_v30', JSON.stringify(manifests)); }, [manifests, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet('ims_hnti:cdoc_v30', JSON.stringify(customsDocs)); }, [customsDocs, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet('ims_hnti:inst_v30', JSON.stringify(installRecords)); }, [installRecords, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet('ims_hnti:bast_v30', JSON.stringify(bastRecords)); }, [bastRecords, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet('ims_hnti:train_v30', JSON.stringify(trainingRecords)); }, [trainingRecords, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet('ims_hnti:emp_v22', JSON.stringify(employees)); }, [employees, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet('ims_hnti:bt_v22', JSON.stringify(businessTrips)); }, [businessTrips, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet('ims_hnti:btr_v22', JSON.stringify(realizations)); }, [realizations, loading]);
  useEffect(() => { if (!loading) storeSet(LANG_KEY, lang); }, [lang, loading]);
  useEffect(() => { if (!loading) { session ? storeSet(SESSION_KEY, JSON.stringify(session)) : storeDel(SESSION_KEY); } }, [session, loading]);
  useEffect(() => { if (!loading) storeSet(RATE_KEY, String(exchangeRate)); }, [exchangeRate, loading]);

  // New #2: keep the logged-in user's display name/initial in sync with employee-DB edits.
  // Previously editing your own name in Employee Management didn't update the header/greeting.
  useEffect(() => {
    if (loading || !session) return;
    const emp = employees[session.username];
    if (emp && (emp.name !== session.name || initialOf(emp.name) !== (session.initial || ''))) {
      setSession(s => ({ ...s, name: emp.name, initial: initialOf(emp.name) }));
    }
  }, [employees, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet(AUDIT_LOG_KEY, JSON.stringify(auditLog)); }, [auditLog, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet(NOTIF_KEY, JSON.stringify(pruneNotifications(notifications))); }, [notifications, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet(PRODUCT_KEY, JSON.stringify(products)); }, [products, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet(PRODUCT_SUPPORT_ACTIVITIES_KEY, JSON.stringify(productSupportActivities)); }, [productSupportActivities, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet(PRODUCT_SUPPORT_FILES_KEY, JSON.stringify(productSupportFiles)); }, [productSupportFiles, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet(DOCUMENT_TEMPLATE_KEY, JSON.stringify(documentTemplates)); }, [documentTemplates, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet(GENERATED_DOCS_KEY, JSON.stringify(generatedDocs)); }, [generatedDocs, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet(ANNOTATIONS_KEY, JSON.stringify(annotations)); }, [annotations, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet('ims_hnti:unittech_v1', JSON.stringify(unitTechMap)); }, [unitTechMap, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet('ims_hnti:reports_seen_v1', JSON.stringify(reportsSeen)); }, [reportsSeen, loading]);
  useEffect(() => { if (!loading) debouncedStoreSet('ims_hnti:access_v1', JSON.stringify(moduleAccess)); }, [moduleAccess, loading]);

  // Live technician roster from the employee DB (re-derives when employees are edited)
  const liveTechnicians = useMemo(() => Object.values(employees).filter(e => e.role === 'technician' && e.active).map(e => e.name), [employees]);

  // Base installed units (without PM schedule overlay — PM merge happens in MaintenanceModule + for Regulatory display)
  const baseInstalledUnits = useMemo(() => {
    const base = generateInstalledUnits(data, bastRecords);
    const techs = liveTechnicians.length ? liveTechnicians : TECHNICIAN_NAMES;
    return base.map((u, i) => ({
      ...u,
      technician: healTechnicianName(unitTechMap[u.id] || techs[i % techs.length], liveTechnicians, employees),
    }));
  }, [data, bastRecords, liveTechnicians, unitTechMap, employees]);

  // Regulatory & cross-module views: include PM overlay
  const installedUnits = useMemo(
    () => mergeUnitsWithPmSchedule(baseInstalledUnits, pmSchedule),
    [baseInstalledUnits, pmSchedule]
  );

  // Hapus catatan PM manual untuk unit yang sudah tidak terinstal (sinkron dengan state data)
  useEffect(() => {
    if (loading) return;
    const validUnitIds = new Set(baseInstalledUnits.map(u => u.id));
    setPmSchedule(prev => {
      const next = prev.filter(p => !p.unitId || validUnitIds.has(p.unitId));
      return next.length === prev.length ? prev : next;
    });
  }, [baseInstalledUnits, loading]);

  const t = translations[lang];
  const fmt = (n) => formatCurrency(n, lang, exchangeRate);
  const fmtFull = (n) => formatCurrencyFull(n, lang, exchangeRate);

  if (loading) return <div style={{minHeight: '100vh', background: 'var(--ims-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><GlobalStyles theme={theme} /><IMSLogo size="lg" showTagline /></div>;
  const handleLogin = (sessionData) => {
    setSession(sessionData);
    appendAuditLog(setAuditLog, {
      user: sessionData.username, userName: sessionData.name, role: sessionData.role,
      module: 'auth', action: 'login', timestamp: new Date().toISOString(), entityLabel: 'User session',
    });
  };
  if (!session) return <><LoginScreen t={t} lang={lang} setLang={setLang} theme={theme} onLogin={handleLogin} employees={employees} /><ToastContainer /></>;
  return <><AuthApp session={session} setSession={setSession} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} t={t} data={data} setData={setSphData} reports={reports} setReports={setReports} issues={issues} setIssues={setIssues} pmSchedule={pmSchedule} setPmSchedule={setPmSchedule} manifests={manifests} setManifests={setManifests} customsDocs={customsDocs} setCustomsDocs={setCustomsDocs} installRecords={installRecords} setInstallRecords={setInstallRecords} bastRecords={bastRecords} setBastRecords={setBastRecords} trainingRecords={trainingRecords} setTrainingRecords={setTrainingRecords} regRecords={regRecords} setRegRecords={setRegRecords} aklRecords={aklRecords} setAklRecords={setAklRecords} importRecords={importRecords} setImportRecords={setImportRecords} pengalihanRecords={pengalihanRecords} setPengalihanRecords={setPengalihanRecords} piRecords={piRecords} setPiRecords={setPiRecords} employees={employees} setEmployees={setEmployees} businessTrips={businessTrips} setBusinessTrips={setBusinessTrips} realizations={realizations} setRealizations={setRealizations} installedUnits={installedUnits} baseInstalledUnits={baseInstalledUnits} fmt={fmt} fmtFull={fmtFull} exchangeRate={exchangeRate} setExchangeRate={setExchangeRate} lastSync={lastSync} onRefresh={handleRefresh} auditLog={auditLog} setAuditLog={setAuditLog} logAction={logAction} products={products} setProducts={setProducts} productSupportActivities={productSupportActivities} setProductSupportActivities={setProductSupportActivities} productSupportFiles={productSupportFiles} setProductSupportFiles={setProductSupportFiles} documentTemplates={documentTemplates} setDocumentTemplates={setDocumentTemplates} generatedDocs={generatedDocs} setGeneratedDocs={setGeneratedDocs} annotations={annotations} setAnnotations={setAnnotations} liveTechnicians={liveTechnicians} unitTechMap={unitTechMap} setUnitTechMap={setUnitTechMap} reportsSeen={reportsSeen} setReportsSeen={setReportsSeen} moduleAccess={moduleAccess} setModuleAccess={setModuleAccess} syncStatus={syncStatus} notifications={notifications} setNotifications={setNotifications} /><ToastContainer /></>;
}

function LoginScreen({ t, lang, setLang, theme = 've', onLogin, employees }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async () => {
    const u = username.toLowerCase().trim();
    const userDb = employees || USERS;
    const user = userDb[u];
    if (!user) { setError(t.login_error); return; }
    if (user.active === false) {
      setError(lang === 'id' ? 'Akun Anda telah dinon-aktifkan. Hubungi admin.' : 'Your account has been deactivated. Contact admin.');
      return;
    }
    if (_supaEnabled()) {
      // Tahap 6c: validasi 100% via Supabase Auth (email = username@imshnti.id). Tanpa fallback.
      setLoggingIn(true);
      try {
        await _supaSignIn(`${u}@imshnti.id`, password);
        _startRealtime(); _startProactiveRefresh();
        // Supabase OK → lanjut ke app
      } catch {
        setError(lang === 'id'
          ? 'Username atau password salah, atau akun Anda belum terdaftar. Hubungi admin.'
          : 'Incorrect username or password, or your account is not registered. Contact admin.');
        setLoggingIn(false);
        return;
      }
      setLoggingIn(false);
    } else {
      if (user.password !== password) { setError(t.login_error); return; }
    }
    onLogin({ username: u, role: user.role, name: user.name, initial: user.initial, salesId: user.salesId, position: user.position, allowancePerDay: user.allowancePerDay });
    setError('');
  };

  return (
    <div style={{minHeight: '100vh', background: 'var(--ims-bg)', fontFamily: 'Inter, sans-serif', color: 'var(--ims-text)', display: 'flex'}}>
      <GlobalStyles theme={theme} />
      <div className="login-left" style={{
        flex: 1,
        backgroundImage: `url(${logoFull})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'var(--ims-bg-alt)'
      }}>
      </div>

      <div className="login-right" style={{flex: '0 0 460px', padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto'}}>
        <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '32px'}}>
          <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '7px 13px', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.1em', color: 'var(--ims-text)', fontWeight: 500}}>
            <Globe size={13} strokeWidth={1.5} />{lang === 'id' ? 'EN' : 'ID'}
          </button>
        </div>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '12px'}}>{t.login_subtitle}</div>
        <h2 className="serif" style={{fontSize: '34px', fontWeight: 500, margin: '0 0 28px', letterSpacing: '-0.01em'}}>{t.login_title}</h2>

        <div style={{marginBottom: '16px'}}>
          <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '7px'}}>{t.username}</label>
          <input value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} autoFocus />
        </div>
        <div style={{marginBottom: '8px'}}>
          <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '7px'}}>{t.password}</label>
          <div style={{position: 'relative'}}>
            <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{paddingRight: '40px'}} />
            <button onClick={() => setShowPwd(!showPwd)} style={{position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}>{showPwd ? <EyeOff size={15} /> : <Eye size={15} />}</button>
          </div>
        </div>
        {error && <div style={{color: '#8b3a3a', fontSize: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px'}}><AlertCircle size={13} />{error}</div>}
        <button className="btn-primary" onClick={handleLogin} disabled={loggingIn} style={{width: '100%', padding: '13px', justifyContent: 'center', marginTop: '14px', opacity: loggingIn ? 0.75 : 1}}>
          <Lock size={14} />{loggingIn ? (lang === 'id' ? 'Memverifikasi...' : 'Verifying...') : t.login_btn}
        </button>

        <div style={{marginTop: '24px', padding: '14px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{lang === 'id' ? 'Lupa Kata Sandi?' : 'Forgot Password?'}</div>
          <div style={{fontSize: '11.5px', color: 'var(--ims-text-2)', lineHeight: 1.6}}>
            {lang === 'id'
              ? <>Hubungi <strong>Administrator IT / GM</strong> untuk reset kata sandi melalui modul <strong>Manajemen Karyawan</strong>. Admin dapat menetapkan kata sandi sementara, dan Anda akan diminta menggantinya saat login berikutnya.</>
              : <>Contact your <strong>IT Administrator / GM</strong> to reset your password via the <strong>Employee Management</strong> module. The admin can set a temporary password, and you'll be prompted to change it on next login.</>}
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .login-left { display: none; } .login-right { flex: 1 !important; padding: 40px 24px !important; } }`}</style>
    </div>
  );
}

function AuthApp({ session, setSession, lang, setLang, theme = 've', setTheme, t, data, setData, reports, setReports, issues, setIssues, pmSchedule, setPmSchedule, manifests, setManifests, customsDocs, setCustomsDocs, installRecords, setInstallRecords, bastRecords, setBastRecords, trainingRecords, setTrainingRecords, regRecords, setRegRecords, aklRecords, setAklRecords, importRecords, setImportRecords, pengalihanRecords, setPengalihanRecords, piRecords, setPiRecords, employees, setEmployees, businessTrips, setBusinessTrips, realizations, setRealizations, installedUnits, baseInstalledUnits, fmt, fmtFull, exchangeRate, setExchangeRate, lastSync, onRefresh, auditLog, setAuditLog, logAction, products, setProducts, productSupportActivities = [], setProductSupportActivities, productSupportFiles = [], setProductSupportFiles, documentTemplates = DEFAULT_DOCUMENT_TEMPLATES, setDocumentTemplates, generatedDocs = [], setGeneratedDocs, annotations, setAnnotations, liveTechnicians, unitTechMap, setUnitTechMap, reportsSeen = {}, setReportsSeen, moduleAccess = {}, setModuleAccess, syncStatus = 'offline', notifications = [], setNotifications }) {
  const [view, setView] = useState(session.role === 'sales' ? 'sales_report' : session.role === 'regulatory' ? 'regulatory' : 'dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSph, setEditingSph] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [changePwOpen, setChangePwOpen] = useState(false);

  // Navigasi dari klik OS-level push notification: fokus tab + buka modul terkait.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onNavigate = (e) => {
      const link = e.detail?.link;
      if (link?.view) { try { setView(link.view); } catch {} }
    };
    window.addEventListener('ims:navigate', onNavigate);
    return () => window.removeEventListener('ims:navigate', onNavigate);
  }, []);

  // Self-service password change for the logged-in user
  const handleChangePassword = (newPassword) => {
    setEmployees(prev => ({ ...prev, [session.username]: { ...prev[session.username], password: newPassword, mustChangePassword: false } }));
    logAction({ module: 'auth', action: 'update', entityLabel: `Password changed (self)`, field: 'password', note: 'Self-service password change' });
    setChangePwOpen(false);
  };

  const perms = PERMISSIONS[session.role];
  // CEO-managed module access: per-user override of which modules are open. Default = role's nav.
  // super_admin (CEO) always retains full access so the authorization panel can never lock itself out.
  const allowedNav = useMemo(() => {
    const FULL = NAV_BY_ROLE.super_admin;
    const migrateNav = (mods) => {
      const set = new Set(mods);
      if (set.has('installation') || set.has('maintenance')) {
        set.delete('installation');
        set.delete('maintenance');
        set.add('technical_support');
      }
      return FULL.filter(id => set.has(id));
    };
    if (session.role === 'super_admin') return FULL;
    const ov = moduleAccess[session.username];
    if (ov && Array.isArray(ov)) {
      const ordered = migrateNav(ov);
      return ordered.length ? ordered : ['dashboard'];
    }
    return NAV_BY_ROLE[session.role] || ['dashboard'];
  }, [session.role, session.username, moduleAccess]);

  useEffect(() => {
    if (view === 'installation' || view === 'maintenance') setView('technical_support');
  }, [view]);

  // Business-trip notification count (shared by HoverSidebar + Header)
  const navBtNotifCount = useMemo(() => {
    if (!businessTrips || !realizations) return 0;
    let count = 0;
    if (session.role === 'finance') {
      count = businessTrips.filter(t => t.status === 'pending_finance').length +
              realizations.filter(r => r.status === 'pending_finance').length +
              businessTrips.filter(t => t.status === 'approved' && t.paymentStatus !== 'paid').length +
              realizations.filter(r => r.status === 'approved' && r.settlementStatus === 'pending' && r.difference !== 0).length;
    } else if (session.role === 'manager_ops') {
      count = businessTrips.filter(t => t.status === 'pending_mops').length + realizations.filter(r => r.status === 'pending_mops').length;
    } else if (session.role === 'gm') {
      count = businessTrips.filter(t => t.status === 'pending_gm').length + realizations.filter(r => r.status === 'pending_gm').length;
    } else if (['sales', 'technician', 'operations', 'admin', 'regulatory'].includes(session.role)) {
      count = businessTrips.filter(t => t.travelerUsername === session.username && ['clarification', 'rejected'].includes(t.status)).length +
              realizations.filter(r => r.travelerUsername === session.username && r.status === 'clarification').length;
    }
    return count;
  }, [businessTrips, realizations, session.role, session.username]);

  // Weekly field-report notifications for CEO / GM / Manager Operasional (#new) —
  // count of reports newer than what the user has marked read (or recent 7 days if never read).
  const navSrNotifCount = useMemo(() => {
    if (!['super_admin', 'gm', 'manager_ops'].includes(session.role)) return 0;
    if (!reports || !reports.length) return 0;
    const dates = reports.map(r => r.date || '').filter(Boolean).sort();
    const latest = dates[dates.length - 1];
    if (!latest) return 0;
    const seen = reportsSeen[session.username];
    let cutStr;
    if (seen) cutStr = seen;
    else { const cut = new Date(latest); cut.setDate(cut.getDate() - 7); cutStr = cut.toISOString().split('T')[0]; }
    return reports.filter(r => (r.date || '') > cutStr).length;
  }, [reports, session.role, session.username, reportsSeen]);

  useEffect(() => { if (!allowedNav.includes(view)) setView(allowedNav[0]); }, [session.role, session.username, allowedNav]);

  const permFor = (mod) => perms?.[mod] || 'none';
  const canEdit = (mod) => permFor(mod) === 'full' || permFor(mod) === 'write';
  const canRead = (mod) => ['full', 'write', 'read', 'self'].includes(permFor(mod)) || allowedNav.includes(mod);

  const filteredData = session.role === 'sales' && session.salesId ? data.filter(s => s.salesOwner === session.salesId) : data;

  const handleSave = (sph) => {
    const isEdit = !!editingSph;
    const replaceOldIds = sph._replaceOldIds || [];
    const duplicateNote = sph._duplicateNote || null;
    const clean = { ...sph };
    delete clean._replaceOldIds;
    delete clean._duplicateNote;
    delete clean._projectLineIds;
    clean.lastUpdate = new Date().toISOString().split('T')[0];

    const byUser = session?.username || 'unknown';
    const hasMultiLines = Array.isArray(clean.lineItems) && clean.lineItems.length > 0;

    if (hasMultiLines) {
      const { records, removedIds } = buildRecordsFromForm(clean, {
        existingData: data,
        editingRecord: isEdit ? editingSph : null,
        products,
        employees,
      });
      if (!records.length) {
        showToast(lang === 'id' ? 'Gagal menyimpan: tidak ada item produk valid' : 'Save failed: no valid product items', 'error');
        return;
      }
      const staged = records.map(rec => {
        const coherent = applySphStageStatusCoherence(syncSphRecordToProductMaster({ ...rec }, products));
        if (isEdit) {
          const oldSph = data.find(s => s.id === coherent.id);
          const oldStage = oldSph?.stage;
          const newStage = coherent.stage;
          if (oldStage && newStage && oldStage !== newStage) {
            const withHistory = appendStageHistoryEntry({ ...coherent, stageHistory: oldSph?.stageHistory }, oldStage, newStage, byUser);
            coherent.stageHistory = withHistory.stageHistory;
          } else if (oldSph?.stageHistory && !coherent.stageHistory) {
            coherent.stageHistory = oldSph.stageHistory;
          }
        } else if (!coherent.stageHistory) {
          coherent.stageHistory = [{ from: null, to: coherent.stage || 'sph_sent', by: byUser, at: new Date().toISOString() }];
        }
        return coherent;
      });

      let nextRows = data.filter(s => !removedIds.includes(s.id));
      if (replaceOldIds.length) {
        nextRows = nextRows.map(s => replaceOldIds.includes(s.id)
          ? { ...s, status: 'cancelled', stage: 'lost', _replacedBy: staged[0]?.id, _replacedAt: new Date().toISOString(), notes: (s.notes || '') + ` [Digantikan oleh ${clean.sphNo} pada ${new Date().toLocaleDateString('id-ID')}]` }
          : s);
      }
      const ids = new Set(staged.map(r => r.id));
      nextRows = [...nextRows.filter(s => !ids.has(s.id)), ...staged];
      const normalized = normalizeSphDataset(nextRows, products);
      setData(normalized);
      if (shouldPersistSphData(normalized)) {
        blockCloudApply(STORAGE_KEY, 180000);
        markSphLocalWrite(normalized.length);
        if (normalized.length >= 100) lockProductionSph(normalized.length);
        storeSet(STORAGE_KEY, JSON.stringify(normalized));
      } else {
        showToast(lang === 'id' ? 'Penyimpanan diblokir proteksi data — hubungi admin' : 'Save blocked by data protection — contact admin', 'error');
        return;
      }

      if (isEdit) {
        logAction({ module: 'sph', action: 'update', entityId: staged[0]?.id, entityLabel: `${clean.sphNo} · ${clean.customer}`, note: `${staged.length} item alat · Total: ${staged.reduce((s, r) => s + (Number(r.totalValue) || 0), 0)}` });
      } else {
        if (replaceOldIds.length) {
          replaceOldIds.forEach(oldId => {
            const oldSph = data.find(s => s.id === oldId);
            if (oldSph) logAction({ module: 'sph', action: 'update', entityId: oldId, entityLabel: `${oldSph.sphNo} · ${oldSph.customer}`, field: 'status', before: oldSph.status, after: 'cancelled', note: `Digantikan oleh SPH baru ${clean.sphNo}` });
          });
        }
        logAction({ module: 'sph', action: 'create', entityId: staged[0]?.id, entityLabel: `${clean.sphNo} · ${clean.customer}`, note: duplicateNote ? `${duplicateNote} · ${staged.length} item` : `${staged.length} item alat` });
      }
      blockCloudApply(STORAGE_KEY, 180000);
      flushPersist();
      showToast(lang === 'id' ? `SPH disimpan (${staged.length} item alat)` : `SPH saved (${staged.length} equipment items)`, 'success');
      setModalOpen(false); setEditingSph(null);
      return;
    }

    // Satu baris — alur lama
    const single = applySphStageStatusCoherence(syncSphRecordToProductMaster(clean, products));
    if (isEdit) {
      const oldSph = data.find(s => s.id === single.id);
      const oldStage = oldSph?.stage;
      const newStage = single.stage;
      if (oldStage && newStage && oldStage !== newStage) {
        const withHistory = appendStageHistoryEntry({ ...single, stageHistory: oldSph?.stageHistory }, oldStage, newStage, byUser);
        single.stageHistory = withHistory.stageHistory;
      } else if (oldSph?.stageHistory && !single.stageHistory) {
        single.stageHistory = oldSph.stageHistory;
      }
      setData(prev => prev.map(s => s.id === single.id ? single : s));
      logAction({ module: 'sph', action: 'update', entityId: single.id, entityLabel: `${single.sphNo} · ${single.customer}`, note: `Total: ${single.totalValue}` });
    } else {
      const newId = 'sph_' + Date.now();
      const newSph = {
        ...single,
        id: newId,
        stageHistory: [{ from: null, to: single.stage || 'sph_sent', by: byUser, at: new Date().toISOString() }],
      };
      if (replaceOldIds.length > 0) {
        setData(prev => {
          const updated = prev.map(s => replaceOldIds.includes(s.id)
            ? { ...s, status: 'cancelled', stage: 'lost', _replacedBy: newId, _replacedAt: new Date().toISOString(), notes: (s.notes || '') + ` [Digantikan oleh ${single.sphNo} pada ${new Date().toLocaleDateString('id-ID')}]` }
            : s);
          return [...updated, newSph];
        });
        replaceOldIds.forEach(oldId => {
          const oldSph = data.find(s => s.id === oldId);
          if (oldSph) {
            logAction({ module: 'sph', action: 'update', entityId: oldId, entityLabel: `${oldSph.sphNo} · ${oldSph.customer}`, field: 'status', before: oldSph.status, after: 'cancelled', note: `Digantikan oleh SPH baru ${single.sphNo}` });
          }
        });
        logAction({ module: 'sph', action: 'create', entityId: newId, entityLabel: `${newSph.sphNo} · ${newSph.customer}`, note: `${duplicateNote || ''} · Menggantikan: ${replaceOldIds.join(', ')}` });
      } else {
        setData(prev => [...prev, newSph]);
        logAction({ module: 'sph', action: 'create', entityId: newId, entityLabel: `${newSph.sphNo} · ${newSph.customer}`, note: duplicateNote ? `${duplicateNote} · Total: ${newSph.totalValue}` : `Total: ${newSph.totalValue}` });
      }
    }
    setModalOpen(false); setEditingSph(null);
  };

  const handleWorkflowUpdate = (id, patch, options = {}) => {
    const before = data.find(s => s.id === id);
    const byUser = session?.username || 'unknown';
    const nowIso = new Date().toISOString();
    setData(prev => prev.map(s => {
      if (s.id !== id) return s;
      const next = { ...s, ...patch, lastUpdate: nowIso };
      if (patch.stage && patch.stage !== s.stage) {
        return appendStageHistoryEntry(next, s.stage, patch.stage, byUser);
      }
      return {
        ...next,
        stageHistory: patch.workflowEvent
          ? [...(s.stageHistory || []), { from: s.stage, to: patch.workflowEvent, by: byUser, at: nowIso }]
          : (next.stageHistory || s.stageHistory),
      };
    }));
    if (options.notify) {
      notify(options.notify.target, options.notify.payload, { username: session.username, role: session.role });
    }
    logAction({ module: 'sph', action: 'update', entityId: id, entityLabel: `${before?.sphNo || id} · ${before?.customer || ''}`, note: options.note || 'Workflow update' });
  };

  const handleRequestSPH = (req) => {
    const today = new Date().toISOString().split('T')[0];
    const newId = 'req_sph_' + Date.now();
    const isSpp = req.docKind === 'spp';
    const items = (Array.isArray(req.items) && req.items.length ? req.items : [req]).slice(0, 5).map((it, idx) => {
      const qty = Number(it.qty) || 1;
      const unitPrice = Number(it.unitPrice) || 0;
      return { ...it, lineNo: idx + 1, qty, unitPrice, totalValue: qty * unitPrice };
    });
    const firstItem = items[0] || {};
    const qty = Number(firstItem.qty) || 1;
    const unitPrice = Number(firstItem.unitPrice) || 0;
    const totalValue = items.reduce((sum, it) => sum + (Number(it.totalValue) || 0), 0);
    const rec = syncSphRecordToProductMaster({
      id: newId,
      sphNo: `${isSpp ? 'REQ-SPP' : 'REQ-SPH'}/${today.substring(0, 4)}/${String(Date.now()).slice(-4)}`,
      customer: req.customer,
      customerAddress: req.customerAddress || '',
      customerType: req.customerType || 'hospital',
      projectType: req.projectType || 'private',
      productId: firstItem.productId || req.productId || '',
      productBrand: firstItem.brand || firstItem.productBrand || req.productBrand || '',
      modality: firstItem.modality || req.modality || '-',
      subModality: firstItem.subModality || req.subModality || '-',
      items,
      qty,
      unitPrice,
      totalValue,
      issuedDate: today,
      salesOwner: req.salesOwner || session.salesId || session.username,
      region: req.region || '-',
      status: 'active',
      stage: 'sph_sent',
      probability: 20,
      notes: req.notes || '',
      manualTerms: req.manualTerms || '',
      dpPercent: Number(req.dpPercent) || 30,
      installmentMonths: Number(req.installmentMonths) || 12,
      paymentScheme: req.projectType === 'kso' ? 'kso' : 'dp_installment',
      sphWorkflowStatus: 'requested',
      docKind: isSpp ? 'spp' : 'sph',
      requesterId: session.username, // untuk RBAC download & TTD requester
      sphWorkflowStatus2: 'requested',
      sphRequestedAt: new Date().toISOString(),
      sphRequestedBy: session.username,
      nextAction: isSpp ? 'Admin membuat SPP dengan template HNTI' : 'Admin membuat SPH dengan template HNTI',
      lastUpdate: today,
      poStatus: null,
      paymentHistory: [],
      stageHistory: [{ from: null, to: isSpp ? 'request_spp' : 'request_sph', by: session.username, at: new Date().toISOString() }],
    }, products);
    setData(prev => [...prev, rec]);
    const kindLabel = isSpp ? 'SPP' : 'SPH';
    const notifType = isSpp ? 'spp_request' : 'sph_request';
    const notifPayload = {
      type: notifType,
      message: `Request ${kindLabel} baru dari ${session.name}: ${rec.customer} · ${rec.subModality}.`,
      link: { view: 'sph', id: newId },
    };
    const fromUser = { username: session.username, role: session.role };
    notify({ role: 'admin' }, notifPayload, fromUser);
    logAction({ module: 'sph', action: 'create', entityId: newId, entityLabel: `${rec.sphNo} · ${rec.customer}`, note: `Request ${kindLabel} submitted by sales` });
  };
  // Request SPP = sama dengan SPH tapi docKind='spp'
  const handleRequestSPP = (req) => handleRequestSPH({ ...req, docKind: 'spp' });
  // Simpan dokumen hasil editor ke riwayat (generatedDocs)
  const handleSaveDocument = ({ id, docType, html, status, record = {}, requesterId, notifyRequester }) => {
    const now = new Date().toISOString();
    const docId = id || ('gdoc_' + Date.now());
    const entry = {
      id: docId,
      docType,
      docTitle: DOC_TYPE_LABELS[docType] || docType,
      customer: record.customer || '',
      sphNo: record.sphNo || '',
      sourceId: record.id || '',
      requesterId: requesterId || record.requesterId || record.sphRequestedBy || record.salesOwner || session.username,
      createdBy: session.username,
      createdByName: session.name,
      html,
      status: status === 'final' ? 'ready' : 'draft', // 'draft' | 'ready' (Ready for Download)
      createdAt: now,
      updatedAt: now,
    };
    setGeneratedDocs(prev => {
      const existing = prev.findIndex(d => d.id === docId);
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = { ...copy[existing], html, status: entry.status, updatedAt: now };
        return copy;
      }
      return [entry, ...prev];
    });
    logAction({ module: 'document', action: status === 'final' ? 'send' : 'save_draft', entityId: docId, entityLabel: `${entry.docTitle} · ${entry.customer}` });
    if (status === 'final' && notifyRequester && entry.requesterId) {
      notify({ username: entry.requesterId }, {
        type: 'document_ready',
        message: `${entry.docTitle} ${entry.customer ? '(' + entry.customer + ')' : ''} Anda telah selesai dan siap diunduh.`,
        link: { view: 'sph', id: entry.sourceId || docId },
      }, { username: session.username, role: session.role });
    }
    showToast(status === 'final' ? (lang === 'id' ? 'Dokumen terkirim & siap diunduh' : 'Document sent & ready') : (lang === 'id' ? 'Draft tersimpan' : 'Draft saved'), 'success');
    return docId;
  };
  // Bulk CSV import: match per line item (SPH No + pelanggan + produk) → update atau tambah baru.
  const handleImportSPH = (records) => {
    blockCloudApply(STORAGE_KEY, 180000);
    const merged = mergeSphImportRecords(data, records, employees);
    markSphLocalWrite(merged.data.length);
    lockProductionSph(merged.data.length);
    setData(merged.data);
    storeSet(STORAGE_KEY, JSON.stringify(merged.data));
    logAction({ module: 'sph', action: 'import', entityLabel: lang === 'id' ? `Impor CSV (${records.length} baris)` : `CSV import (${records.length} rows)`, note: `${merged.added} added, ${merged.updated} updated` });
    return { added: merged.added, updated: merged.updated, total: merged.total };
  };
  const [deleteSphId, setDeleteSphId] = useState(null);
  const handleDelete = (id) => setDeleteSphId(id);
  const confirmDeleteSph = () => {
    const sph = data.find(s => s.id === deleteSphId);
    const siblingIds = sph ? getProjectSiblings(data, sph).map(s => s.id) : [deleteSphId];
    setData(prev => prev.filter(s => !siblingIds.includes(s.id)));
    if (sph) logAction({ module: 'sph', action: 'delete', entityId: deleteSphId, entityLabel: `${sph.sphNo} · ${sph.customer}`, note: siblingIds.length > 1 ? `Hapus proyek ${siblingIds.length} item` : 'Permanently deleted' });
    setDeleteSphId(null);
  };
  const handleBulkDeleteSph = (ids) => {
    const idSet = new Set(Array.isArray(ids) ? ids : []);
    const removed = data.filter(s => idSet.has(s.id));
    const allRemoveIds = new Set();
    removed.forEach(s => getProjectSiblings(data, s).forEach(x => allRemoveIds.add(x.id)));
    setData(prev => prev.filter(s => !allRemoveIds.has(s.id)));
    if (removed.length) {
      logAction({
        module: 'sph', action: 'delete', entityLabel: lang === 'id' ? `Hapus massal ${removed.length} SPH` : `Bulk delete ${removed.length} SPH`,
        note: removed.map(s => s.sphNo).slice(0, 8).join(', ') + (removed.length > 8 ? '…' : ''),
      });
      flushPersist();
      showToast(lang === 'id' ? `${removed.length} SPH berhasil dihapus` : `${removed.length} SPH deleted`, 'success');
    }
  };

  return (
    <div style={{minHeight: '100vh', background: 'var(--ims-bg)', fontFamily: 'Inter, sans-serif', color: 'var(--ims-text)'}}>
      <GlobalStyles theme={theme} />
      <HoverSidebar allowedNav={allowedNav} view={view} setView={setView} t={t} lang={lang} btNotifCount={navBtNotifCount} srNotifCount={navSrNotifCount} />
      <Header session={session} setSession={setSession} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} view={view} setView={setView} allowedNav={allowedNav} t={t} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} exchangeRate={exchangeRate} setExchangeRate={setExchangeRate} businessTrips={businessTrips} realizations={realizations} reports={reports} reportsSeen={reportsSeen} onChangePassword={() => setChangePwOpen(true)} syncStatus={syncStatus} notifications={notifications} setNotifications={setNotifications} />

      <main className="main-content fade-in" style={{maxWidth: '1440px', margin: '0 auto', padding: '32px 48px 60px'}}>
        {view === 'dashboard' && <Dashboard data={filteredData} reports={reports} products={products} t={t} lang={lang} session={session} fmt={fmt} employees={employees} />}
        {view === 'sph' && canRead('sph') && <SPHManagement data={filteredData} employees={employees} setEmployees={setEmployees} products={products} documentTemplates={documentTemplates} session={session} t={t} lang={lang} canEdit={canEdit('sph')} fmt={fmt} onAdd={() => { setEditingSph(null); setModalOpen(true); }} onEdit={(s) => { setEditingSph(s); setModalOpen(true); }} onDelete={handleDelete} onBulkDelete={handleBulkDeleteSph} onImport={handleImportSPH} onRequestSPH={handleRequestSPH} onRequestSPP={handleRequestSPP} onWorkflowUpdate={handleWorkflowUpdate} onSaveDocument={handleSaveDocument} generatedDocs={generatedDocs} setGeneratedDocs={setGeneratedDocs} />}
        {view === 'pipeline' && canRead('pipeline') && <PipelineBoard data={filteredData} allData={data} setData={setData} employees={employees} session={session} logAction={logAction} t={t} lang={lang} canEdit={canEdit('pipeline')} fmt={fmt} onEdit={(s) => { setEditingSph(s); setModalOpen(true); }} reports={reports} />}
        {view === 'sales' && canRead('sales') && <SalesModule data={data} reports={reports} t={t} lang={lang} fmt={fmt} employees={employees} />}
        {view === 'sales_report' && canRead('sales_report') && <SalesReport reports={reports} setReports={setReports} t={t} lang={lang} session={session} fmt={fmt} employees={employees} reportsSeen={reportsSeen} setReportsSeen={setReportsSeen} issues={issues} installRecords={installRecords} canEdit={canEdit('sales_report')} />}
        {view === 'finance' && canRead('finance') && <FinanceModule data={data} setData={setData} t={t} lang={lang} canEdit={canEdit('finance')} fmt={fmt} onWorkflowUpdate={handleWorkflowUpdate} session={session} documentTemplates={documentTemplates} employees={employees} onSaveDocument={handleSaveDocument} />}
        {view === 'operations' && canRead('operations') && <OperationsModule data={data} setData={setData} manifests={manifests} setManifests={setManifests} customsDocs={customsDocs} setCustomsDocs={setCustomsDocs} products={products} t={t} lang={lang} canEdit={canEdit('operations')} fmt={fmt} session={session} />}
        {view === 'technical_support' && canRead('technical_support') && <TechnicalSupportModule data={data} setData={setData} installRecords={installRecords} setInstallRecords={setInstallRecords} bastRecords={bastRecords} setBastRecords={setBastRecords} trainingRecords={trainingRecords} setTrainingRecords={setTrainingRecords} units={baseInstalledUnits} issues={issues} setIssues={setIssues} pmSchedule={pmSchedule} setPmSchedule={setPmSchedule} t={t} lang={lang} canEdit={canEdit('technical_support')} fmt={fmt} employees={employees} liveTechnicians={liveTechnicians} regRecords={regRecords} products={products} documentTemplates={documentTemplates} onSaveDocument={handleSaveDocument} session={session} unitTechMap={unitTechMap} setUnitTechMap={setUnitTechMap} />}
        {view === 'regulatory' && canRead('regulatory') && <RegulatoryModule records={regRecords} setRegRecords={setRegRecords} aklRecords={aklRecords} setAklRecords={setAklRecords} importRecords={importRecords} setImportRecords={setImportRecords} pengalihanRecords={pengalihanRecords} setPengalihanRecords={setPengalihanRecords} piRecords={piRecords} setPiRecords={setPiRecords} units={installedUnits} t={t} lang={lang} fmt={fmt} canEdit={canEdit('regulatory')} data={data} setData={setData} products={products} />}
        {view === 'incentive' && canRead('incentive') && <IncentiveModule data={data} setData={setData} t={t} lang={lang} session={session} fmt={fmt} fmtFull={fmtFull} canEdit={canEdit('incentive')} employees={employees} />}
        {view === 'valuation' && canRead('valuation') && <Valuation data={data} t={t} lang={lang} fmt={fmt} />}
        {view === 'employees' && canRead('employees') && <EmployeesModule employees={employees} setEmployees={setEmployees} setData={setData} setReports={setReports} setBusinessTrips={setBusinessTrips} setRealizations={setRealizations} t={t} lang={lang} session={session} fmt={fmt} moduleAccess={moduleAccess} setModuleAccess={setModuleAccess} logAction={logAction} />}
        {view === 'business_trip' && canRead('business_trip') && <BusinessTripModule businessTrips={businessTrips} setBusinessTrips={setBusinessTrips} realizations={realizations} setRealizations={setRealizations} employees={employees} t={t} lang={lang} session={session} fmt={fmt} />}
        {view === 'audit_log' && (session.role === 'super_admin' || session.role === 'gm' || allowedNav.includes('audit_log')) && <AuditLogModule auditLog={auditLog} setAuditLog={setAuditLog} employees={employees} t={t} lang={lang} />}
        {view === 'products' && <ProductMasterModule products={products} setProducts={setProducts} t={t} lang={lang} canEdit={session.role === 'super_admin' || session.role === 'gm' || session.role === 'manager_ops' || session.role === 'admin'} logAction={logAction} data={data} />}
        {view === 'document_templates' && canRead('document_templates') && <DocumentTemplateModule templates={documentTemplates} setTemplates={setDocumentTemplates} data={data} employees={employees} t={t} lang={lang} fmt={fmt} canEdit={canEdit('document_templates')} logAction={logAction} />}
        {view === 'product_support' && canRead('product_support') && <ProductSupportModule data={data} trainingRecords={trainingRecords} products={products} employees={employees} session={session} t={t} lang={lang} canEdit={canEdit('product_support')} fmt={fmt} activities={productSupportActivities} setActivities={setProductSupportActivities} files={productSupportFiles} setFiles={setProductSupportFiles} />}
        {view === 'kpi_scorecard' && canRead('kpi_scorecard') && <LifecycleKpiScorecard data={data} employees={employees} installRecords={installRecords} bastRecords={bastRecords} trainingRecords={trainingRecords} issues={issues} session={session} t={t} lang={lang} fmt={fmt} canEdit={canEdit('kpi_scorecard')} />}

        {view === 'cashflow' && <CashFlowProjection data={data} t={t} lang={lang} fmt={fmt} />}
        {view === 'exec_summary' && <ExecutiveSummary data={data} reports={reports} annotations={annotations} products={products} t={t} lang={lang} fmt={fmt} session={session} exchangeRate={exchangeRate} employees={employees} />}
      </main>

      {modalOpen && <SPHModal sph={editingSph} t={t} lang={lang} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingSph(null); }} fmtFull={fmtFull} existingData={data} products={products} employees={employees} />}
      <ConfirmDialog open={!!deleteSphId} title={lang === 'id' ? 'Hapus SPH?' : 'Delete SPH?'} message={t.confirm_delete || (lang === 'id' ? 'Yakin ingin menghapus SPH ini? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to delete this SPH? This action cannot be undone.')} onConfirm={confirmDeleteSph} onCancel={() => setDeleteSphId(null)} danger lang={lang} />
      {changePwOpen && <ChangePasswordModal session={session} employees={employees} onSave={handleChangePassword} onClose={() => setChangePwOpen(false)} t={t} lang={lang} />}
      <Footer t={t} lastSync={lastSync} onRefresh={onRefresh} lang={lang} />
    </div>
  );
}

// ============== Change Password Modal (self-service) ==============

// ============== Real-time WIB Clock ==============
// Displays current date/time in Western Indonesia Time (WIB, GMT+7) — updates every second

// ============== NotificationBell (Tahap 11 — Phase 1) ==============
// Bell icon di topbar dengan badge unread count. Click → dropdown panel.
// Filter notifikasi per user (via isNotificationForUser) — role/username targeting.
// Mark-as-read: per item (klik notif) atau bulk ("Tandai semua dibaca").
// Navigate ke modul kalau notif punya link.view (best-effort, modul boleh ignore extra params).


// ============== Hover Sidebar Navigation ==============
// Navigasi modul di sisi kiri layar, muncul saat kursor digeser ke tepi kiri (atau diklik di mobile).
// Membuat tampilan IMS lebih bersih — header tidak penuh tombol modul.




// React.memo - KPICard renders many times in dashboards, props rarely change per render


// ============== Toast System (replaces native alert() which is blocked in artifact iframe) ==============
// Global toast state — implemented via custom event for cross-component access


// React.memo - Field is used 100+ times in forms

// ============== Confirm Dialog (replaces native confirm() which is blocked in artifact iframe) ==============
// ══════════════════════════════════════════════════════════════════════════════
// DocumentEditorModal — Rich Text Editor reusable (0 dependency, contentEditable)
// Dipakai di: SPH/SPP (Antrian Admin), Finance (Invoice/Kwitansi), Instalasi (BA)
// Props:
//   open, onClose
//   title           — judul modal
//   initialHtml     — HTML awal yang dimuat ke editor (sudah berisi kop + TTD)
//   docType         — 'sph'|'spp'|'invoice'|'kwitansi'|'bai'|... (untuk metadata)
//   record          — record sumber (untuk simpan metadata: customer, sphNo, requesterId)
//   onSave(html, status) — dipanggil saat klik Simpan/Kirim. status: 'draft'|'final'
//   saveLabel       — teks tombol simpan (default "Simpan Dokumen")
//   lang
// ══════════════════════════════════════════════════════════════════════════════


// ============== LinkAttachment (clickable hyperlink with icon + truncated filename) ==============

// ============== Sort Toggle Component ==============

// React.memo - Th and Td are used 500+ times in tables across modules










// =================== SALES REPORTING MODULE ===================




// ============== Employees Module (Master Data Karyawan) ==============
// Akses: hanya CEO (super_admin), General Manager (gm), dan Manager Operasional (manager_ops)




// ============== Risk Concentration Dashboard ==============
// Investor-grade risk dashboard: customer/principal/region concentration, payment overdue heatmap
// ============== Product Master Module ==============
// CRUD database for product catalog — single source of truth for all SPH/SPK/Quotation generation
// Editable: anyone with super_admin or manager_ops role can add/edit/delete
// Auto-syncs to SPH module via autocomplete dropdown
// ============== Cohort Revenue Analysis ==============
// Standar valuasi SaaS — track customer cohort by acquisition year, measure repeat purchase pattern
// Cohort = grouping customer berdasarkan tahun pertama mereka jadi customer HNTI
// Retention metric: berapa persen customer cohort tahun X yang masih beli di tahun X+1, X+2, etc
// ============== Executive Summary / Investor Pack (PDF Export) ==============
// One-click investor-ready summary. Reuses IDENTICAL KPI logic as Dashboard (no desync).
// Uses window.print() with a dedicated print stylesheet → high-quality PDF via browser print dialog.

// ============== 5-Year Revenue Projection (Catatan #7) ==============
// Metodologi: proyeksi berbasis tren pertumbuhan (compound growth) yang dilandasi:
//   1) Data historis: 2025 aktual (PO terbit) + 2026 estimasi berjalan (PO + pipeline weighted)
//   2) Baseline pasar: CAGR alat imaging Indonesia 6.12% (Grand View Research),
//      alat kesehatan 9.1% (Nexdigm) — HNTI tumbuh di atas pasar karena merebut pangsa
//   3) Tailwind regulasi: UU 17/2023 reklasifikasi RS berbasis kompetensi (Paripurna/Utama/
//      Madya/Dasar) mewajibkan RS Utama punya radiologi canggih → siklus upgrade CT/MRI;
//      KRIS 2025 + Health Transformation Program Rp20T mempercepat belanja modal RS
// Rumus: Revenue(tahun n) = BaseTahun2026 × (1 + g)^(n − 2026), g = laju pertumbuhan skenario


// CEO annotations — dipakai Executive Summary (baca dari storage)


// ============== Product Modal (Add/Edit) ==============

// ============== Audit Trail / Change Log Module ==============
// SOX-grade audit log: every meaningful action is captured with who/what/when

// ============== Module Access Authorization Panel (CEO/super_admin only) ==============
// Lets the CEO grant/revoke which modules each employee can open. Default = role's nav set.


// ============== Employee Add/Edit Modal ==============

// ============== Business Trip Module ==============
// Workflow approval 3-level: Karyawan → Finance → Manager Ops → GM → Paid → In Progress → Completed

// ============== Business Trip Card (List item) ==============
// React.memo wrapped for performance — re-renders only when trip props change

// ============== Business Trip Form (Add/Edit) ==============

// ============== Business Trip Detail (Review Modal) ==============

// ============== Business Trip Realization Card ==============
// React.memo wrapped for performance — re-renders only when realization props change

// ============== Business Trip Realization Form ==============

// ============== Business Trip Realization Detail (Review Modal) ==============

// ============== Business Trip Dashboard Analytics ==============

// ============== Finance, Operations, Installation (compact) ==============
// ============== Payment Schedule Helpers ==============
// Generate expected payment schedule for a PO based on its scheme
// Defensive scheme detection - works even on legacy data without paymentScheme field


// Compute payment status summary for a PO (defensive against missing/legacy fields)










// CSV export helpers




// ── TTD per-user (Fitur TTD Dinamis) ──────────────────────────────────────────
// Cari signatureUrl milik user berdasarkan username/salesId.
// Cari user pertama dengan role tertentu (mis. director) → untuk TTD Pihak 2.

// ── Cetak HTML string langsung jadi PDF (html2pdf-style via window.print) ──────
// Dipakai oleh tombol "Cetak PDF" di Riwayat Dokumen. Konten sudah berisi TTD statis.





// ── A4 wrapper: kop surat jadi BACKGROUND ukuran A4, isi dokumen di tengah ──────
// Jika letterheadImage diisi → seluruh halaman pakai gambar itu sebagai background,
// teks ditaruh di zona aman (margin atas/bawah dikosongkan utk header/footer gambar).

// Header teks (dipakai hanya kalau TIDAK ada gambar kop)


// ── Blok TTD ganda dinamis (Pihak 1 = requester/sales, Pihak 2 = director) ────
// Dipakai untuk dokumen yang butuh 2 TTD (SPH). Kop tetap dari global settings.

// ── Template default untuk editor (dipanggil saat tombol Mulai diklik) ────────
// Mengembalikan HTML lengkap (kop + isi + TTD dinamis requester) siap diedit.
// Ambil HTML body custom dari modul Template Dokumen Resmi (jika admin sudah set).
// Isi placeholder {{field}} pada htmlBody custom dengan data record.









// ============== BERITA ACARA BUILDERS ==============












// ============== CSV IMPORT UTILITIES ==============
// Robust CSV parser: handles quoted fields, embedded commas/newlines, escaped quotes, BOM, CRLF.

// Normalise a header cell for fuzzy matching (lowercase, strip spaces/punctuation).

// Build a {fieldName: columnIndex} map from a header row using alias dictionaries.

// Parse a number that may contain Rp, dots, commas, spaces. Returns Number or 0.

// Normalise a date string to YYYY-MM-DD when possible; otherwise return as-is.

// Header aliases (ID + EN) → SPH field names.


// Parse SPH CSV text → array of partial SPH records (validated). Returns {records, errors, total}.

// Header aliases for Finance payment import.

// Parse Finance payment CSV → array of {sphNo, type, amount, date, note}.



// ============== Net Profit Analysis Sub-Component ==============

// Customs status reason editor — local draft + explicit Save button (review #3) so the typed
// reason is committed deliberately, with a clear "saved" confirmation.







// ============== Manifest List ==============

// ============== Customs Docs List ==============

// ============== Manifest Modal ==============

// ============== Customs Doc Modal ==============


// ============== Install Records List ==============

// ============== BAST List ==============

// ============== Training Cert List ==============

// ============== Install Record Modal ==============
// ── Shared: pick a delivered/installed unit (RS) from SPH & auto-fill product fields ──
// Used by Installation Record / BAST / Training Certificate / BAPETEN Utilization Permit forms
// so the customer (RS) name + installed product (modality/sub-modality) are PULLED from SPH
// data rather than re-typed — eliminating RS↔product mismatch (review notes #1 & #2).




// ============== Installation Record Modal ==============

// ============== BAST Modal ==============

// ============== Training Cert Modal ==============



// ============== Audit Trail Infrastructure ==============
// Lightweight in-memory audit log (last 500 entries) — captures who/what/when for data mutations
// In production this would write to a backend audit database, but for IMS this gives SOX-compliance demo

// ============== Notification Infrastructure (Tahap 11 — Phase 1) ==============
// Cross-module inbox: setiap modul dapat dispatch event 'ims:notify' untuk push
// notifikasi ke role/user tertentu. App listen + persist + sync via Realtime.
//
// Targeting:
//  { role: 'finance' }              → semua user dengan role tsb
//  { username: 'lukman' }           → user spesifik
//  { role: 'finance', username: 'maya' } → keduanya match (user spesifik DAN role match)
//  Super admin SELALU lihat semua notifikasi (oversight).
//
// Usage anywhere (modul lain, helper, atau setelah aksi user):
//   window.dispatchEvent(new CustomEvent('ims:notify', { detail: {
//     target: { role: 'finance' },
//     payload: {
//       type: 'po_won' | 'sph_request' | 'sph_ready' | 'invoice_ready' | 'dp_paid'
//             | 'shipping_arrived' | 'install_pending' | 'training_scheduled'
//             | 'pnbp_due' | 'billing_due' | 'system',
//       message: 'string',
//       link: { view: 'sph', id: 'sp_x' } | null,
//       fromUser: { username, role } | null
//     }
//   }}));
// Convenience: dispatch dari konteks manapun (modul yang tidak punya akses ke setNotifications)
// Format relatif ringkas untuk display ("baru saja", "5m lalu", "2j lalu", "kemarin", "12 Mei")

// ============== Real-Time Sync Indicator ==============
// Shows "Last synced X minutes ago" + manual refresh button


// ============== Maintenance Module ==============

// ============== Maintenance Issue Modal (Repair/Complaint CRUD) ==============

// ============== PM Schedule Modal ==============



// ============== Regulatory Module ==============

// ============== Uniform Regulatory Pipeline (Phase 2a — replaces 5 separate components) ==============
// Duration timeline per record (dashboard durasi per stage)



// ============== Reusable Regulatory CRUD Modal ==============

// ============== Incentive Module ==============

// ============== Test exports (untuk audit harness; tidak dipakai oleh bundle browser) ==============
export { migrateRegRecord, resolveDealModel, resolveCustomerSector, computeInvoiceSchedule, generatePaymentSchedule, detectPaymentScheme, pushNotificationToList, isNotificationForUser, countUnreadNotifications, appendStageHistoryEntry, getStageMetrics, formatDuration };

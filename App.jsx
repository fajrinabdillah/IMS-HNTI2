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
import { detectSalesOwnerFromCustomer, TECHNICIAN_NAMES, STATIC_TECH_ORDER, resolveEmpName, resolveNamesInText, SALES_META_BY_ID, employeeSalesId, getActiveSalesTeam, activeSalesIdSet, normalizeSalesOwnedRows, isLiveEmployeeUsername, normalizeEmployeeOwnedRows, detectPaymentScheme, resolveCustomerSector, resolveDealModel, _addMonthsISO, computeInvoiceSchedule, resolveProductId, normalizeProduct, getRegStages, sanitizeRegStageHistory, migrateRegRecord, normalizeImportPipelineStatus, importPipelineLabel, projectHasDpReceived, manifestMatchesProject, appendStageHistoryEntry, getStageMetrics, normalizePoWon, calcIncentive, getIncentiveStatus, getNetMargin, calcNetProfit, getProductFileUrl, normalizeProductLookupText, getFactoryProductionDays, addDaysIso, getFactoryProductionInfo, resolveProductRecord, effectiveScheme, generatePaymentSchedule, getPaymentSummary } from './src/utils/domain.js';
import { _memStore, _hasArtifactStorage, _hasLocalStorage, _SUPA_URL, _SUPA_KEY, _supaEnabled, _supaFetch, _supaSession, _SUPA_SESS_LS, _authFetch, _supaSignIn, _refreshInFlight, _supaRefreshTok, _supaSignOut, _restoreSupaSession, _getSupaTok, _supaReq, _pushVapidPublicKey, _urlBase64ToUint8Array, pushSupported, registerServiceWorker, savePushSubscription, enablePushNotifications, getPushPermissionStatus, sendServerPushNotification, _rtSocket, _rtHeartbeat, _rtRetryCount, _rtRetryTimer, _rtStatus, _setRtStatus, _hashStr, _recentWrites, _markRecentWrite, _isRecentSelfEcho, _rtJoinRef, _RT_TOPIC, _startRealtime, _scheduleRtRetry, _stopRealtime, _tokRefreshTimer, _startProactiveRefresh, _stopProactiveRefresh, storeGet, storeSet, storeDel, _persistPending, _persistTimer, debouncedStoreSet, flushPersist } from './src/utils/storage.js';
import { generateHntiSph2026Seed, _RAW_ALL_SPH, ALL_SPH, buildSeedNotificationsFromSph, generateInstalledUnits, generateSeedManifestsFromSph, generateSeedCustomsDocsFromSph, SEED_MANIFESTS, SEED_CUSTOMS_DOCS, generateInstallDocs, INSTALL_DOCS, generateHistoricalBusinessTrips, _historical, HISTORICAL_BT, HISTORICAL_BTR, ALL_BUSINESS_TRIPS, ALL_BT_REALIZATIONS, generateRegulatoryRecords } from './src/data/seed.js';
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
// Tahap 11 Phase 1.5 fix: legacy tech names dari deploy lama yang masih persist di production data.
// Map ke username teknisi aktif supaya resolveEmpName otomatis heal saat render.
SEED_NAME_TO_USERNAME['Eko Prasetyo'] = 'teknisi3';   // → Muh. Nur Ichsan
SEED_NAME_TO_USERNAME['Budi Hartono'] = 'teknisi';     // → Robby Dwi Setiawan
SEED_NAME_TO_USERNAME['Rudi Susanto'] = 'teknisi2';    // → Muhammad Yusuf
// Static technician order (from USERS seed) — used for positional fallback when a technician
// username has been renamed in the live DB (e.g. 'teknisi' → 'teknisi1').
// Derive a 1-2 letter avatar initial from a name (always computed from the live name so it
// stays correct after renames — never relies on a stored, possibly-stale, initial field).
// Resolve ANY stored value (live username, original seed name/username, or custom text) to the
// current live employee name. Resilient to renamed usernames via technician positional fallback.

// Resolve any seed technician name embedded inside a free-text string (e.g. training instructor
// "Robby Dwi Setiawan + Aplikator") to the current live employee name, so renamed staff never leak.




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
//   installmentMonths: 1–36 untuk cicilan, 60–120 untuk kso (dihitung dari ksoYears)
//   ksoYears:       5–10 (baru)
//   ksoInvestorPct: 60.0–80.0 step 0.5 (baru) — porsi HNTI; porsi RS = 100 − ksoInvestorPct
//
// Helper resolveDealModel: 1 sumber kebenaran untuk seluruh modul hilir
// Daftar opsi KSO investor% — 60.0, 60.5, …, 80.0 (41 opsi)
// Opsi DP cicilan — 10, 15, 20, …, 100 (step 5%)

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
// → Semarang RS → Hatim, Solo RS → Lukman, Surabaya RS → Bagus, Hermina/Mitra Keluarga/Pramita → pusat
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
  const [data, setData] = useState(ALL_SPH);
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
  const [employees, setEmployees] = useState(USERS);
  const [businessTrips, setBusinessTrips] = useState(ALL_BUSINESS_TRIPS);
  const [realizations, setRealizations] = useState(ALL_BT_REALIZATIONS);
  const [products, setProducts] = useState(PRODUCT_MASTER_SEED);
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
        triggerBrowserNotification(payload);
      }
      setNotifications(prev => pushNotificationToList(prev, target, payload, fromUser));
    };
    window.addEventListener('ims:notify', onNotify);
    return () => window.removeEventListener('ims:notify', onNotify);
  }, [session, notifications]);
  const [loading, setLoading] = useState(true);
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
        // Mapping nama lama → nama baru (urutan stable supaya konsisten)
        const ORPHAN_TECH_MAP = {
          'Eko Prasetyo': 'Muh. Nur Ichsan',
          'Budi Hartono': 'Robby Dwi Setiawan',
          'Rudi Susanto': 'Muhammad Yusuf',
          // Tambahan defensive: nama fiktif lain yang mungkin pernah ada
          'Eko': 'Muh. Nur Ichsan',
          'Budi': 'Robby Dwi Setiawan',
          'Rudi': 'Muhammad Yusuf',
        };
        const ACTIVE_TECHS = Object.values(USERS).filter(u => u.role === 'technician' && u.active).map(u => u.name);
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
          ['technician', 'technicianName', 'pic', 'assignedTo', 'leadTech', 'pelaksana'].forEach(k => {
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
      if (d) try { setData(normalizePoWon(JSON.parse(d))); } catch {}
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
      if (emp) try { setEmployees(JSON.parse(emp)); } catch {}
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
      if (maStored) try { setModuleAccess(JSON.parse(maStored)); } catch {}
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
        const units = generateInstalledUnits();
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
      if (d) try { setData(normalizePoWon(JSON.parse(d))); } catch {}
      safe(rep, setReports); safe(iss, setIssues); safe(reg, setRegRecords);
      safe(akl, setAklRecords); safe(imp, setImportRecords); safe(pgl, setPengalihanRecords);
      safe(pi, setPiRecords); safe(pm, setPmSchedule); safe(mfst, setManifests);
      safe(cdoc, setCustomsDocs); safe(inst, setInstallRecords); safe(bast, setBastRecords);
      safe(train, setTrainingRecords); safe(emp, setEmployees); safe(bt, setBusinessTrips);
      safe(btr, setRealizations); safe(audit, setAuditLog); safe(prod, setProducts);
      safe(ann, setAnnotations); safe(ut, setUnitTechMap); safe(rs, setReportsSeen);
      safe(ma, setModuleAccess); if (notif) try { setNotifications(pruneNotifications(JSON.parse(notif))); } catch {}
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
  }, []);
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
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (!session) return; // hanya saat user logged-in
      // Paksa kick Realtime kalau perlu — _startRealtime sudah idempotent (skip kalau sudah open)
      try { _startRealtime(); } catch {}
      // Resync data dari cloud — tangkap perubahan dari device lain yang ter-miss saat suspend
      resyncFromCloud();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
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
        case STORAGE_KEY: setData(normalizePoWon(v)); break;
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
        case 'ims_hnti:access_v1': setModuleAccess(v); break;
        default: return;
      }
      setLastSync(Date.now());
    };
    window.addEventListener('ims:cloud:change', handler);
    return () => window.removeEventListener('ims:cloud:change', handler);
  }, [loading]);

  // Master employee sync: sales/employee references in operational modules must never point
  // to inactive or deleted employees. Orphaned sales ownership is reassigned to Office.
  useEffect(() => {
    if (loading) return;
    setData(prev => {
      const next = normalizeSalesOwnedRows(prev, employees, 'salesOwner');
      return JSON.stringify(next) === JSON.stringify(prev) ? prev : normalizePoWon(next);
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

  useEffect(() => { if (!loading) { debouncedStoreSet(STORAGE_KEY, JSON.stringify(data)); setLastSync(Date.now()); } }, [data, loading]);
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

  // Derive installed units; technician resolved from LIVE employee DB (or manual per-unit override)
  const installedUnits = useMemo(() => {
    const base = generateInstalledUnits();
    const techs = liveTechnicians.length ? liveTechnicians : TECHNICIAN_NAMES;
    return base.map((u, i) => ({ ...u, technician: unitTechMap[u.id] || techs[i % techs.length] }));
  }, [data, liveTechnicians, unitTechMap]);

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
  return <><AuthApp session={session} setSession={setSession} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} t={t} data={data} setData={setData} reports={reports} setReports={setReports} issues={issues} setIssues={setIssues} pmSchedule={pmSchedule} setPmSchedule={setPmSchedule} manifests={manifests} setManifests={setManifests} customsDocs={customsDocs} setCustomsDocs={setCustomsDocs} installRecords={installRecords} setInstallRecords={setInstallRecords} bastRecords={bastRecords} setBastRecords={setBastRecords} trainingRecords={trainingRecords} setTrainingRecords={setTrainingRecords} regRecords={regRecords} setRegRecords={setRegRecords} aklRecords={aklRecords} setAklRecords={setAklRecords} importRecords={importRecords} setImportRecords={setImportRecords} pengalihanRecords={pengalihanRecords} setPengalihanRecords={setPengalihanRecords} piRecords={piRecords} setPiRecords={setPiRecords} employees={employees} setEmployees={setEmployees} businessTrips={businessTrips} setBusinessTrips={setBusinessTrips} realizations={realizations} setRealizations={setRealizations} installedUnits={installedUnits} fmt={fmt} fmtFull={fmtFull} exchangeRate={exchangeRate} setExchangeRate={setExchangeRate} lastSync={lastSync} onRefresh={handleRefresh} auditLog={auditLog} setAuditLog={setAuditLog} logAction={logAction} products={products} setProducts={setProducts} productSupportActivities={productSupportActivities} setProductSupportActivities={setProductSupportActivities} productSupportFiles={productSupportFiles} setProductSupportFiles={setProductSupportFiles} documentTemplates={documentTemplates} setDocumentTemplates={setDocumentTemplates} generatedDocs={generatedDocs} setGeneratedDocs={setGeneratedDocs} annotations={annotations} setAnnotations={setAnnotations} liveTechnicians={liveTechnicians} unitTechMap={unitTechMap} setUnitTechMap={setUnitTechMap} reportsSeen={reportsSeen} setReportsSeen={setReportsSeen} moduleAccess={moduleAccess} setModuleAccess={setModuleAccess} syncStatus={syncStatus} notifications={notifications} setNotifications={setNotifications} /><ToastContainer /></>;
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

function AuthApp({ session, setSession, lang, setLang, theme = 've', setTheme, t, data, setData, reports, setReports, issues, setIssues, pmSchedule, setPmSchedule, manifests, setManifests, customsDocs, setCustomsDocs, installRecords, setInstallRecords, bastRecords, setBastRecords, trainingRecords, setTrainingRecords, regRecords, setRegRecords, aklRecords, setAklRecords, importRecords, setImportRecords, pengalihanRecords, setPengalihanRecords, piRecords, setPiRecords, employees, setEmployees, businessTrips, setBusinessTrips, realizations, setRealizations, installedUnits, fmt, fmtFull, exchangeRate, setExchangeRate, lastSync, onRefresh, auditLog, setAuditLog, logAction, products, setProducts, productSupportActivities = [], setProductSupportActivities, productSupportFiles = [], setProductSupportFiles, documentTemplates = DEFAULT_DOCUMENT_TEMPLATES, setDocumentTemplates, generatedDocs = [], setGeneratedDocs, annotations, setAnnotations, liveTechnicians, unitTechMap, setUnitTechMap, reportsSeen = {}, setReportsSeen, moduleAccess = {}, setModuleAccess, syncStatus = 'offline', notifications = [], setNotifications }) {
  const [view, setView] = useState(session.role === 'sales' ? 'sales_report' : session.role === 'regulatory' ? 'regulatory' : 'dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSph, setEditingSph] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [changePwOpen, setChangePwOpen] = useState(false);

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
    if (session.role === 'super_admin') return FULL;
    const ov = moduleAccess[session.username];
    if (ov && Array.isArray(ov)) {
      const set = new Set(ov);
      const ordered = FULL.filter(id => set.has(id));
      return ordered.length ? ordered : ['dashboard'];
    }
    return NAV_BY_ROLE[session.role] || ['dashboard'];
  }, [session.role, session.username, moduleAccess]);

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
    // Strip internal markers before saving
    const replaceOldIds = sph._replaceOldIds || [];
    const duplicateNote = sph._duplicateNote || null;
    const clean = { ...sph };
    delete clean._replaceOldIds;
    delete clean._duplicateNote;

    // Tahap 11 — Phase 1: stage history tracking foundation untuk KPI scorecard
    const byUser = session?.username || 'unknown';
    if (isEdit) {
      const oldSph = data.find(s => s.id === clean.id);
      const oldStage = oldSph?.stage;
      const newStage = clean.stage;
      if (oldStage && newStage && oldStage !== newStage) {
        const withHistory = appendStageHistoryEntry({ ...clean, stageHistory: oldSph?.stageHistory }, oldStage, newStage, byUser);
        clean.stageHistory = withHistory.stageHistory;
      } else if (oldSph?.stageHistory && !clean.stageHistory) {
        // preserve existing history if not changed
        clean.stageHistory = oldSph.stageHistory;
      }
      setData(prev => prev.map(s => s.id === clean.id ? clean : s));
      logAction({ module: 'sph', action: 'update', entityId: clean.id, entityLabel: `${clean.sphNo} · ${clean.customer}`, note: `Total: ${clean.totalValue}` });
    } else {
      const newId = 'sph_' + Date.now();
      const newSph = {
        ...clean,
        id: newId,
        // init stage history dengan entry pertama (stage initial)
        stageHistory: [{ from: null, to: clean.stage || 'sph_sent', by: byUser, at: new Date().toISOString() }],
      };
      // If replacing old SPHs, mark them as cancelled with link to new SPH
      if (replaceOldIds.length > 0) {
        setData(prev => {
          const updated = prev.map(s => replaceOldIds.includes(s.id)
            ? { ...s, status: 'cancelled', stage: 'lost', _replacedBy: newId, _replacedAt: new Date().toISOString(), notes: (s.notes || '') + ` [Digantikan oleh ${clean.sphNo} pada ${new Date().toLocaleDateString('id-ID')}]` }
            : s);
          return [...updated, newSph];
        });
        // Log each replacement
        replaceOldIds.forEach(oldId => {
          const oldSph = data.find(s => s.id === oldId);
          if (oldSph) {
            logAction({ module: 'sph', action: 'update', entityId: oldId, entityLabel: `${oldSph.sphNo} · ${oldSph.customer}`, field: 'status', before: oldSph.status, after: 'cancelled', note: `Digantikan oleh SPH baru ${clean.sphNo}` });
          }
        });
        logAction({ module: 'sph', action: 'create', entityId: newId, entityLabel: `${clean.sphNo} · ${clean.customer}`, note: `${duplicateNote || ''} · Menggantikan: ${replaceOldIds.join(', ')}` });
      } else {
        setData(prev => [...prev, newSph]);
        logAction({ module: 'sph', action: 'create', entityId: newId, entityLabel: `${clean.sphNo} · ${clean.customer}`, note: duplicateNote ? `${duplicateNote} · Total: ${clean.totalValue}` : `Total: ${clean.totalValue}` });
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
    const items = (Array.isArray(req.items) && req.items.length ? req.items : [req]).slice(0, 5).map((it, idx) => {
      const qty = Number(it.qty) || 1;
      const unitPrice = Number(it.unitPrice) || 0;
      return { ...it, lineNo: idx + 1, qty, unitPrice, totalValue: qty * unitPrice };
    });
    const firstItem = items[0] || {};
    const qty = Number(firstItem.qty) || 1;
    const unitPrice = Number(firstItem.unitPrice) || 0;
    const totalValue = items.reduce((sum, it) => sum + (Number(it.totalValue) || 0), 0);
    const rec = {
      id: newId,
      sphNo: `REQ-SPH/${today.substring(0, 4)}/${String(Date.now()).slice(-4)}`,
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
      docKind: req.docKind || 'sph', // 'sph' | 'spp'
      requesterId: session.username, // untuk RBAC download & TTD requester
      sphWorkflowStatus2: 'requested',
      sphRequestedAt: new Date().toISOString(),
      sphRequestedBy: session.username,
      nextAction: req.docKind === 'spp' ? 'Admin membuat SPP dengan template HNTI' : 'Admin membuat SPH dengan template HNTI',
      lastUpdate: today,
      poStatus: null,
      paymentHistory: [],
      stageHistory: [{ from: null, to: 'request_sph', by: session.username, at: new Date().toISOString() }],
    };
    setData(prev => [...prev, rec]);
    const kindLabel = (req.docKind === 'spp') ? 'SPP' : 'SPH';
    notify({ role: 'admin' }, {
      type: 'sph_request',
      message: `Request ${kindLabel} baru dari ${session.name}: ${rec.customer} · ${rec.subModality}.`,
      link: { view: 'sph', id: newId },
    }, { username: session.username, role: session.role });
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
  // Bulk CSV import: match by SPH No → update existing, else add new. Returns {added, updated}.
  const handleImportSPH = (records) => {
    const today = new Date().toISOString().split('T')[0];
    const byNo = new Map(data.map(s => [String(s.sphNo).trim().toLowerCase(), s]));
    const updates = new Map(); const newOnes = []; let added = 0, updated = 0;
    records.forEach(rec => {
      const key = String(rec.sphNo).trim().toLowerCase();
      const existing = byNo.get(key);
      if (existing && !String(existing.id).startsWith('imp_pending')) {
        updates.set(existing.id, { ...existing, ...rec, id: existing.id, lastUpdate: today });
        updated++;
      } else {
        const id = 'imp_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
        const full = { ...rec, id,
          probability: rec.status === 'won' ? 100 : rec.status === 'lost' ? 0 : 50,
          poStatus: rec.stage === 'po_issued' ? 'issued' : null,
          dpPaid: false, finalPaid: false, shippingStatus: null, customsStatus: null,
          nextAction: '-', lastUpdate: today };
        newOnes.push(full); byNo.set(key, { ...full, id: 'imp_pending' }); added++;
      }
    });
    setData(prev => {
      const merged = prev.map(s => updates.has(s.id) ? updates.get(s.id) : s);
      return normalizePoWon([...merged, ...newOnes]);
    });
    logAction({ module: 'sph', action: 'import', entityLabel: lang === 'id' ? `Impor CSV (${records.length} baris)` : `CSV import (${records.length} rows)`, note: `${added} added, ${updated} updated` });
    return { added, updated };
  };
  const [deleteSphId, setDeleteSphId] = useState(null);
  const handleDelete = (id) => setDeleteSphId(id);
  const confirmDeleteSph = () => {
    const sph = data.find(s => s.id === deleteSphId);
    setData(prev => prev.filter(s => s.id !== deleteSphId));
    if (sph) logAction({ module: 'sph', action: 'delete', entityId: deleteSphId, entityLabel: `${sph.sphNo} · ${sph.customer}`, note: `Permanently deleted` });
    setDeleteSphId(null);
  };

  return (
    <div style={{minHeight: '100vh', background: 'var(--ims-bg)', fontFamily: 'Inter, sans-serif', color: 'var(--ims-text)'}}>
      <GlobalStyles theme={theme} />
      <HoverSidebar allowedNav={allowedNav} view={view} setView={setView} t={t} lang={lang} btNotifCount={navBtNotifCount} srNotifCount={navSrNotifCount} />
      <Header session={session} setSession={setSession} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} view={view} setView={setView} allowedNav={allowedNav} t={t} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} exchangeRate={exchangeRate} setExchangeRate={setExchangeRate} businessTrips={businessTrips} realizations={realizations} reports={reports} reportsSeen={reportsSeen} onChangePassword={() => setChangePwOpen(true)} syncStatus={syncStatus} notifications={notifications} setNotifications={setNotifications} />

      <main className="main-content fade-in" style={{maxWidth: '1440px', margin: '0 auto', padding: '32px 48px 60px'}}>
        {view === 'dashboard' && <Dashboard data={filteredData} reports={reports} products={products} t={t} lang={lang} session={session} fmt={fmt} employees={employees} />}
        {view === 'sph' && canRead('sph') && <SPHManagement data={filteredData} employees={employees} setEmployees={setEmployees} products={products} documentTemplates={documentTemplates} session={session} t={t} lang={lang} canEdit={canEdit('sph')} fmt={fmt} onAdd={() => { setEditingSph(null); setModalOpen(true); }} onEdit={(s) => { setEditingSph(s); setModalOpen(true); }} onDelete={handleDelete} onImport={handleImportSPH} onRequestSPH={handleRequestSPH} onRequestSPP={handleRequestSPP} onWorkflowUpdate={handleWorkflowUpdate} onSaveDocument={handleSaveDocument} generatedDocs={generatedDocs} setGeneratedDocs={setGeneratedDocs} />}
        {view === 'pipeline' && canRead('pipeline') && <PipelineBoard data={filteredData} allData={data} setData={setData} employees={employees} session={session} logAction={logAction} t={t} lang={lang} canEdit={canEdit('pipeline')} fmt={fmt} onEdit={(s) => { setEditingSph(s); setModalOpen(true); }} />}
        {view === 'sales' && canRead('sales') && <SalesModule data={data} reports={reports} t={t} lang={lang} fmt={fmt} employees={employees} />}
        {view === 'sales_report' && canRead('sales_report') && <SalesReport reports={reports} setReports={setReports} t={t} lang={lang} session={session} fmt={fmt} employees={employees} reportsSeen={reportsSeen} setReportsSeen={setReportsSeen} />}
        {view === 'finance' && canRead('finance') && <FinanceModule data={data} setData={setData} t={t} lang={lang} canEdit={canEdit('finance')} fmt={fmt} onWorkflowUpdate={handleWorkflowUpdate} session={session} documentTemplates={documentTemplates} employees={employees} onSaveDocument={handleSaveDocument} />}
        {view === 'operations' && canRead('operations') && <OperationsModule data={data} setData={setData} manifests={manifests} setManifests={setManifests} customsDocs={customsDocs} setCustomsDocs={setCustomsDocs} t={t} lang={lang} canEdit={canEdit('operations')} fmt={fmt} session={session} />}
        {view === 'installation' && canRead('installation') && <InstallationModule data={data} setData={setData} installRecords={installRecords} setInstallRecords={setInstallRecords} bastRecords={bastRecords} setBastRecords={setBastRecords} trainingRecords={trainingRecords} setTrainingRecords={setTrainingRecords} t={t} lang={lang} canEdit={canEdit('installation')} fmt={fmt} employees={employees} liveTechnicians={liveTechnicians} regRecords={regRecords} products={products} documentTemplates={documentTemplates} onSaveDocument={handleSaveDocument} session={session} />}
        {view === 'maintenance' && canRead('maintenance') && <MaintenanceModule units={installedUnits} issues={issues} setIssues={setIssues} pmSchedule={pmSchedule} setPmSchedule={setPmSchedule} t={t} lang={lang} canEdit={canEdit('maintenance')} session={session} liveTechnicians={liveTechnicians} unitTechMap={unitTechMap} setUnitTechMap={setUnitTechMap} employees={employees} />}
        {view === 'regulatory' && canRead('regulatory') && <RegulatoryModule records={regRecords} setRegRecords={setRegRecords} aklRecords={aklRecords} setAklRecords={setAklRecords} importRecords={importRecords} setImportRecords={setImportRecords} pengalihanRecords={pengalihanRecords} setPengalihanRecords={setPengalihanRecords} piRecords={piRecords} setPiRecords={setPiRecords} units={installedUnits} t={t} lang={lang} fmt={fmt} canEdit={canEdit('regulatory')} data={data} setData={setData} products={products} />}
        {view === 'incentive' && canRead('incentive') && <IncentiveModule data={data} setData={setData} t={t} lang={lang} session={session} fmt={fmt} fmtFull={fmtFull} canEdit={canEdit('incentive')} employees={employees} />}
        {view === 'valuation' && canRead('valuation') && <Valuation data={data} t={t} lang={lang} fmt={fmt} />}
        {view === 'employees' && canRead('employees') && <EmployeesModule employees={employees} setEmployees={setEmployees} setData={setData} setReports={setReports} setBusinessTrips={setBusinessTrips} setRealizations={setRealizations} t={t} lang={lang} session={session} fmt={fmt} moduleAccess={moduleAccess} setModuleAccess={setModuleAccess} logAction={logAction} />}
        {view === 'business_trip' && canRead('business_trip') && <BusinessTripModule businessTrips={businessTrips} setBusinessTrips={setBusinessTrips} realizations={realizations} setRealizations={setRealizations} employees={employees} t={t} lang={lang} session={session} fmt={fmt} />}
        {view === 'audit_log' && (session.role === 'super_admin' || session.role === 'gm' || allowedNav.includes('audit_log')) && <AuditLogModule auditLog={auditLog} setAuditLog={setAuditLog} employees={employees} t={t} lang={lang} />}
        {view === 'products' && <ProductMasterModule products={products} setProducts={setProducts} t={t} lang={lang} canEdit={session.role === 'super_admin' || session.role === 'gm' || session.role === 'manager_ops' || session.role === 'admin'} logAction={logAction} data={data} />}
        {view === 'document_templates' && canRead('document_templates') && <DocumentTemplateModule templates={documentTemplates} setTemplates={setDocumentTemplates} data={data} employees={employees} t={t} lang={lang} fmt={fmt} canEdit={canEdit('document_templates')} logAction={logAction} />}
        {view === 'product_support' && canRead('product_support') && <ProductSupportModule data={data} trainingRecords={trainingRecords} products={products} employees={employees} session={session} t={t} lang={lang} canEdit={canEdit('product_support')} fmt={fmt} activities={productSupportActivities} setActivities={setProductSupportActivities} files={productSupportFiles} setFiles={setProductSupportFiles} />}
        {view === 'kpi_scorecard' && canRead('kpi_scorecard') && <LifecycleKpiScorecard data={data} employees={employees} session={session} t={t} lang={lang} fmt={fmt} />}

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


function Dashboard({ data, reports, products, t, lang, session, fmt, employees = {} }) {
  // PERFORMANCE FIX: All filters/maps wrapped in useMemo to avoid recomputing on every render
  // (was causing scroll lag with 613 SPH records)
  const stats = useMemo(() => {
    const activeData = data.filter(s => s.status === 'active');
    const wonData = data.filter(s => s.status === 'won');
    const lostData = data.filter(s => s.status === 'lost');
    return {
      activeData, wonData, lostData,
      totalPipeline: activeData.reduce((sum, s) => sum + s.totalValue, 0),
      weightedPipeline: activeData.reduce((sum, s) => sum + (s.totalValue * s.probability / 100), 0),
      revenueYTD: wonData.reduce((sum, s) => sum + s.totalValue, 0),
      winRate: (wonData.length + lostData.length) > 0 ? (wonData.length / (wonData.length + lostData.length)) * 100 : 0,
    };
  }, [data]);
  const { activeData, wonData, lostData, totalPipeline, weightedPipeline, revenueYTD, winRate } = stats;

  const funnelData = useMemo(() => STAGES.filter(s => s.id !== 'lost').map(stage => {
    const projects = activeData.filter(p => p.stage === stage.id);
    return { name: t[`stage_${stage.id}`], value: projects.reduce((sum, p) => sum + p.totalValue, 0), count: projects.length, color: stage.color };
  }).filter(f => f.count > 0), [activeData, t]);

  const projectTypePieData = useMemo(() => PROJECT_TYPES.map(pt => {
    const projects = activeData.filter(s => s.projectType === pt.id);
    return { name: t[`ptype_${pt.id}`], value: projects.reduce((s, p) => s + p.totalValue, 0), count: projects.length, color: pt.color };
  }).filter(d => d.value > 0), [activeData, t]);

  // New #3: derive modality pie DYNAMICALLY from live SPH data so it always matches the
  // Product Master modalities (X-Ray Stationer/Mobile/Ceiling/Portable, FPD, etc.) — no longer
  // limited to a hardcoded key list that silently dropped normalized modalities.
  const MODALITY_PALETTE = ['#1a4d8a', 'var(--ims-gold)', '#8a5a3a', '#5a8a5a', '#8a3a5a', '#3a8a8a', '#7b3fb5', '#c03030', '#d4780a', '#0f7a5a', '#5b87b8', '#b8860b', '#6a8a3a'];
  const modalityPieData = useMemo(() => {
    const map = new Map();
    activeData.forEach(s => {
      const m = s.modality || (lang === 'id' ? 'Lainnya' : 'Other');
      if (!map.has(m)) map.set(m, { value: 0, count: 0 });
      const e = map.get(m); e.value += (Number(s.totalValue) || 0); e.count += 1;
    });
    let i = 0;
    return Array.from(map.entries())
      .map(([name, e]) => ({ name, value: e.value, count: e.count, color: MODALITY_COLORS[name] || MODALITY_PALETTE[i++ % MODALITY_PALETTE.length] }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [activeData, lang]);

  const customerTypePieData = useMemo(() => [
    { name: t.type_hospital, value: activeData.filter(s => s.customerType === 'hospital').reduce((s, p) => s + p.totalValue, 0), color: '#1a4d8a' },
    { name: t.type_clinic, value: activeData.filter(s => s.customerType === 'clinic').reduce((s, p) => s + p.totalValue, 0), color: 'var(--ims-accent)' },
    { name: t.type_subdistributor, value: activeData.filter(s => s.customerType === 'subdistributor').reduce((s, p) => s + p.totalValue, 0), color: '#5a8a5a' },
  ].filter(d => d.value > 0), [activeData, t]);

  const monthlyTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
    return months.map((m, i) => {
      const monthData = data.filter(s => { const d = new Date(s.issuedDate); return d.getFullYear() === 2026 && d.getMonth() === i; });
      return {
        month: m,
        pipeline: monthData.reduce((s, p) => s + p.totalValue, 0),
        weighted: monthData.reduce((s, p) => s + (p.totalValue * p.probability / 100), 0),
        // POIN 4: biaya operasional per bulan = Σ (totalValue × opsPercent), default 5%, sinkron modul Finance/Insentif
        biayaOperasional: monthData.reduce((s, p) => s + (p.totalValue || 0) * (p.opsPercent !== undefined ? p.opsPercent : OPS_COST_DEFAULT), 0),
      };
    });
  }, [data]);

  const salesPerformance = useMemo(() => getActiveSalesTeam(employees).map(sales => {
    const sd = data.filter(s => s.salesOwner === sales.id);
    return { name: resolveEmpName(employees, sales.id).split(' ')[0], pipeline: sd.filter(s => s.status === 'active').reduce((s, p) => s + p.totalValue, 0), won: sd.filter(s => s.status === 'won').reduce((s, p) => s + p.totalValue, 0) };
  }).sort((a, b) => (b.pipeline + b.won) - (a.pipeline + a.won)), [data, employees]);

  const fieldStats = useMemo(() => ({
    totalVisits: reports.reduce((s, r) => s + (r.visits?.length || 0), 0),
    totalFieldDays: reports.reduce((s, r) => s + (r.days || 0), 0),
  }), [reports]);
  const { totalVisits, totalFieldDays } = fieldStats;

  return (
    <div>
      <div style={{marginBottom: '28px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>
          {t.welcome}, {session.name}
        </div>
        <h1 className="serif hero-title" style={{fontSize: '44px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.nav_dashboard}</h1>
      </div>

      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '24px', border: '1px solid var(--ims-border)'}}>
        <KPICard label={t.pipeline_value} value={fmt(totalPipeline)} sublabel={`${activeData.length} ${t.project_count} aktif`} trend={12.4} info={t.pipeline_value_sub} accent="gold" />
        <KPICard label={t.weighted_pipeline} value={fmt(weightedPipeline)} sublabel={`${totalPipeline > 0 ? ((weightedPipeline/totalPipeline)*100).toFixed(0) : 0}% ${lang === 'id' ? 'dari total · proyeksi' : 'of total · projection'}`} trend={8.7} info={t.weighted_pipeline_sub} />
        <KPICard label={t.revenue_ytd} value={fmt(revenueYTD)} sublabel={`${wonData.length} deal · ${t.revenue_period}`} trend={-3.2} info={t.revenue_ytd_sub} accent="primary" />
        <KPICard label={t.win_rate} value={`${winRate.toFixed(0)}%`} sublabel={`${wonData.length}/${wonData.length + lostData.length} closed`} trend={5.1} info={t.win_rate_sub} />
      </div>

      <div className="card" style={{marginBottom: '20px'}}>
        <div className="card-title">{t.monthly_pipeline}</div>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={monthlyTrend} margin={{top: 10, right: 16, left: 0, bottom: 0}}>
            <defs>
              <linearGradient id="pg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a4d8a" stopOpacity={0.4} /><stop offset="100%" stopColor="#1a4d8a" stopOpacity={0.05} /></linearGradient>
              <linearGradient id="pg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--ims-gold)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--ims-gold)" stopOpacity={0.1} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--ims-text-2)" style={{fontSize: 11}} />
            <YAxis stroke="var(--ims-text-2)" style={{fontSize: 10}} tickFormatter={(v) => v >= 1e9 ? `${(v/1e9).toFixed(0)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v} />
            <Tooltip content={<ChartTooltip fmt={fmt} />} />
            <Area type="monotone" dataKey="pipeline" name={t.pipeline_value} stroke="#1a4d8a" strokeWidth={2} fill="url(#pg1)" />
            <Area type="monotone" dataKey="weighted" name={t.weighted_pipeline} stroke="var(--ims-accent)" strokeWidth={2} fill="url(#pg2)" />
            <Bar dataKey="biayaOperasional" name={lang === 'id' ? 'Biaya Operasional' : 'Operational Cost'} fill="#ff7300" barSize={18} radius={[3, 3, 0, 0]} />
            <Legend wrapperStyle={{fontSize: 11}} />
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
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" horizontal={false} />
            <XAxis type="number" stroke="var(--ims-text-2)" style={{fontSize: 10}} tickFormatter={(v) => v >= 1e9 ? `${(v/1e9).toFixed(0)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v} />
            <YAxis type="category" dataKey="name" stroke="var(--ims-accent)" style={{fontSize: 11}} width={140} />
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
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--ims-text-2)" style={{fontSize: 10}} />
              <YAxis stroke="var(--ims-text-2)" style={{fontSize: 10}} tickFormatter={(v) => v >= 1e9 ? `${(v/1e9).toFixed(0)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v} />
              <Tooltip content={<ChartTooltip fmt={fmt} />} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
              <Bar dataKey="pipeline" name={t.pipeline_value} fill="#1a4d8a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="won" name={t.revenue_ytd} fill="var(--ims-accent-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {reports.length > 0 && session.role !== 'sales' && (
        <div className="card" style={{marginBottom: '20px'}}>
          <div className="card-title">{lang === 'id' ? 'Aktivitas Lapangan dari Laporan Sales' : 'Sales Field Activity'}</div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px'}}>
            <div><div className="lbl-tag">{t.sr_visits_count}</div><div className="serif" style={{fontSize: '28px', fontWeight: 500, marginTop: '4px'}}>{totalVisits}</div></div>
            <div><div className="lbl-tag">{t.sr_field_days_total}</div><div className="serif" style={{fontSize: '28px', fontWeight: 500, marginTop: '4px'}}>{totalFieldDays}</div></div>
            <div><div className="lbl-tag">{t.sr_total_reports}</div><div className="serif" style={{fontSize: '28px', fontWeight: 500, marginTop: '4px'}}>{reports.length}</div></div>
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
            <div className="card-title">{t.yoy_title} <span style={{fontSize: '10px', fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--ims-text-2)', marginLeft: '8px'}}>· {t.yoy_subtitle}</span></div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '20px'}}>
              <div style={{padding: '14px', background: 'rgba(94,135,184,0.10)', borderLeft: '3px solid #5b87b8'}}>
                <div style={{fontSize: '10px', letterSpacing: '0.18em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.yoy_sph_2025}</div>
                <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalSph2025}</div>
              </div>
              <div style={{padding: '14px', background: 'rgba(26,77,138,0.10)', borderLeft: '3px solid #1a4d8a'}}>
                <div style={{fontSize: '10px', letterSpacing: '0.18em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.yoy_sph_2026}</div>
                <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalSph2026} <span style={{fontSize: '12px', color: sphGrowth >= 0 ? 'var(--ims-accent-2)' : '#8b3a3a'}}>{sphGrowth >= 0 ? '↑' : '↓'}{Math.abs(sphGrowth).toFixed(0)}%</span></div>
              </div>
              <div style={{padding: '14px', background: 'rgba(200,169,106,0.12)', borderLeft: '3px solid var(--ims-accent)'}}>
                <div style={{fontSize: '10px', letterSpacing: '0.18em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.yoy_po_2025}</div>
                <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalPo2025}</div>
              </div>
              <div style={{padding: '14px', background: 'rgba(58,107,58,0.10)', borderLeft: '3px solid var(--ims-accent-2)'}}>
                <div style={{fontSize: '10px', letterSpacing: '0.18em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.yoy_po_2026}</div>
                <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalPo2026} <span style={{fontSize: '12px', color: poGrowth >= 0 ? 'var(--ims-accent-2)' : '#8b3a3a'}}>{poGrowth >= 0 ? '↑' : '↓'}{Math.abs(poGrowth).toFixed(0)}%</span></div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={yoyData} margin={{top: 5, right: 16, left: 0, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--ims-text-2)" style={{fontSize: 11}} />
                <YAxis stroke="var(--ims-text-2)" style={{fontSize: 10}} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{fontSize: '11px'}} />
                <Bar dataKey="SPH 2025" fill="#5b87b8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="SPH 2026" fill="#1a4d8a" radius={[3, 3, 0, 0]} />
                <Bar dataKey="PO 2025" fill="var(--ims-accent)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="PO 2026" fill="var(--ims-accent-2)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      })()}

      {/* Business Partners */}
      {session.role !== 'sales' && (
        <div className="card">
          <div className="card-title">{t.bp_title} <span style={{fontSize: '10px', fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--ims-text-2)', marginLeft: '8px'}}>· {t.bp_subtitle}</span></div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px'}}>
            {BUSINESS_PARTNERS.map(bp => {
              // Catatan #4: derive products from master by brand match — always in sync
              const partnerProducts = (products || []).filter(pr => bp.brands.includes(pr.brand));
              return (
              <div key={bp.id} style={{padding: '16px', background: 'var(--ims-bg)', borderLeft: `3px solid ${bp.color}`, position: 'relative'}}>
                {bp.status === 'onboarding' && (
                  <span style={{position: 'absolute', top: '10px', right: '10px', padding: '2px 7px', fontSize: '8px', background: 'var(--ims-accent)', color: '#fff', fontWeight: 700, letterSpacing: '0.1em'}}>
                    {lang === 'id' ? 'BARU · ONBOARDING' : 'NEW · ONBOARDING'}
                  </span>
                )}
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
                  <span style={{fontSize: '22px'}}>{bp.flag}</span>
                  <div>
                    <div style={{fontSize: '14px', fontWeight: 600, color: bp.color}}>{bp.name}</div>
                    <div style={{fontSize: '10px', color: 'var(--ims-text-2)', letterSpacing: '0.1em', textTransform: 'uppercase'}}>{bp.country}</div>
                  </div>
                </div>
                <div style={{fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', marginBottom: '6px'}}>{t.bp_products}</div>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
                  {partnerProducts.length === 0 && <span style={{fontSize: '10px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{lang === 'id' ? 'Belum ada produk di master' : 'No products in master yet'}</span>}
                  {partnerProducts.map((pr, i) => <span key={i} style={{padding: '3px 8px', fontSize: '10px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', color: 'var(--ims-text)'}}>{pr.name} · {pr.type}</span>)}
                </div>
              </div>
            );})}
          </div>
        </div>
      )}
    </div>
  );
}


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

const SPH_WORKFLOW_LABELS = {
  requested: 'Request masuk',
  admin_drafting: 'Admin membuat SPH',
  ready_for_sales: 'SPH siap diunduh Sales',
  offer_sent: 'Penawaran disampaikan ke klien',
  sph_sent: 'SPH awal',
  presentation_scheduled: 'Jadwal presentasi',
  presentation_done: 'Presentasi selesai',
  negotiation: 'Negosiasi',
  tender: 'Proses tender',
  ecatalog: 'Menunggu klik e-catalog',
  po_issued: 'PO terbit',
  lost: 'Kalah',
  client_po_info: 'Informasi PO dari klien',
  po_input_ims: 'SPH/SPP input ke IMS',
  signed_by_sales: 'Ditandatangani Sales',
  sales_downloaded: 'SPH/SPP sudah diunduh PIC Sales',
  finance_po_notified: 'Finance menerima notifikasi PO',
  invoice_ready: 'Invoice + KP siap',
  dp_followup: 'Follow-up DP',
  dp_claimed_paid: 'Sales klaim DP terbayar',
  dp_confirmed: 'Finance konfirmasi DP',
  manufacture_po_created: 'PO ke pabrik dibuat',
  principal_po_sent: 'PO ke pabrik terkirim',
  factory_po_sent: 'PO ke pabrik terkirim',
  factory_dp_paid: 'DP ke pabrik dibayarkan',
  factory_production_done: 'Produksi/disiapkan pabrik selesai',
  factory_production: 'Barang diproduksi/disiapkan pabrik',
  import_clearance: 'Import / clearance berjalan',
  goods_sent_client: 'Barang dikirim ke klien',
  goods_received_client: 'Barang diterima klien',
  local_delivery: 'Local trucking / storing',
  install_schedule_updated: 'Jadwal instalasi diupdate',
  installed_bast: 'Instalasi / BAST',
  regulatory_processing: 'Proses izin pemanfaatan',
  utilization_permit_done: 'Izin pemanfaatan selesai',
};

const SPH_PROJECT_STAGE_STEPS = [
  { key: 'request', role: 'Sales', color: '#0f766e', title: 'Request SPH/SPP', desc: 'Sales mengajukan permintaan SPH/SPP ke Admin', dates: ['sphRequestedAt'] },
  { key: 'admin_doc', role: 'Admin', color: '#6d3aa6', title: 'Membuat Surat SPH/SPP', desc: 'Admin membuat dokumen SPH/SPP', dates: ['sphDocReadyAt', 'sphDraftStartedAt'] },
  { key: 'admin_input', role: 'Admin', color: '#6d3aa6', title: 'Input SPH & SPP ke IMS', desc: 'Admin input data SPH/SPP ke sistem', dates: ['poInputAt', 'financePoNotifiedAt'] },
  { key: 'offer_sent', role: 'Sales', color: '#0f766e', title: 'Menyampaikan Penawaran', desc: 'Sales menyampaikan penawaran ke klien', dates: ['offerSentAt', 'clientPoInfoAt', 'poIssuedAt'] },
  { key: 'presentation_scheduled', role: 'Sales / Product Support', color: '#0f766e', title: 'Jadwal Presentasi', desc: 'Presentasi produk dijadwalkan dengan RS/klien', dates: ['presentationScheduledAt', 'presentationDoneAt'] },
  { key: 'presentation_done', role: 'Sales / Product Support', color: '#0f766e', title: 'Presentasi Selesai', desc: 'Presentasi/demo produk selesai dan menunggu keputusan lanjutan', dates: ['presentationDoneAt'] },
  { key: 'commercial_followup', role: 'Sales', color: '#0f766e', title: 'Negosiasi / Tender / E-Catalog', desc: 'Lanjutan komersial sesuai jalur pembelian klien', dates: ['negotiationStartedAt', 'tenderStartedAt', 'ecatalogWaitingAt', 'clientPoInfoAt', 'poIssuedAt'] },
  { key: 'client_po', role: 'Sales', color: '#0f766e', title: 'Informasi PO dari Klien', desc: 'Sales menerima informasi PO dari klien', dates: ['clientPoInfoAt', 'poIssuedAt'] },
  { key: 'invoice_dp', role: 'Finance', color: '#b7791f', title: 'Membuat Invoice DP', desc: 'Finance membuat invoice penagihan DP ke klien', dates: ['financeDocsReadyAt', 'dpFollowupAt', 'dpClaimedAt', 'dpConfirmedAt'] },
  { key: 'dp_followup', role: 'Sales', color: '#0f766e', title: 'Konfirmasi Pembayaran DP', desc: 'Sales konfirmasi dan follow-up pembayaran DP', dates: ['dpClaimedAt', 'dpFollowupAt', 'dpConfirmedAt'] },
  { key: 'dp_confirmed', role: 'Finance', color: '#b7791f', title: 'DP Diterima -> PO ke Pabrik', desc: 'Finance konfirmasi DP diterima, buat PO ke pabrik', dates: ['dpConfirmedAt', 'manufacturePoCreatedAt', 'principalPoSentAt', 'factoryDpPaidAt'] },
  { key: 'factory_production', role: 'Operations', color: '#1d4f91', title: 'Barang Diproduksi/Disiapkan Pabrik', desc: 'Countdown produksi berjalan sejak PO dikirim ke pabrik', dates: ['factoryProductionStartedAt', 'factoryProductionDoneAt'] },
  { key: 'import_clearance', role: 'Operations', color: '#1d4f91', title: 'Import & Clearance', desc: 'Ops mengatur alur impor barang hingga proses clearance', dates: ['importClearanceAt', 'goodsSentClientAt'] },
  { key: 'goods_client', role: 'Operations', color: '#1d4f91', title: 'Barang Dikirim ke Klien', desc: 'Barang dikirim ke lokasi klien', dates: ['goodsSentClientAt'] },
  { key: 'goods_received_client', role: 'Operations', color: '#1d4f91', title: 'Barang Diterima Klien', desc: 'Klien mengonfirmasi barang sudah diterima di lokasi', dates: ['clientReceivedAt'] },
  { key: 'install_schedule', role: 'Technician', color: '#9a5b2f', title: 'Jadwal & Proses Instalasi', desc: 'Teknisi mengatur jadwal dan melakukan instalasi', dates: ['installScheduleUpdatedAt', 'bastDate'] },
  { key: 'bast_done', role: 'Technician', color: '#9a5b2f', title: 'BAST Selesai', desc: 'Teknisi update BAST setelah instalasi selesai', dates: ['bastDate'] },
  { key: 'reg_process', role: 'Regulatory', color: '#b4233a', title: 'Proses Perizinan', desc: 'Regulatory membantu proses perizinan pemanfaatan', dates: ['regulatoryProcessingAt', 'regulatoryNotifiedAt', 'utilizationPermitDoneAt'] },
  { key: 'project_done', role: 'Regulatory', color: '#b4233a', title: 'Proyek Selesai', desc: 'Seluruh proses selesai, izin pemanfaatan terbit', dates: ['utilizationPermitDoneAt'] },
];

function projectStageDate(sph, step) {
  if (!sph || !step) return null;
  for (const field of step.dates || []) {
    if (sph[field]) return sph[field];
  }
  if (step.key === 'client_po' && (sph.poStatus === 'issued' || sph.stage === 'po_issued')) return sph.poIssuedAt || sph.lastUpdate;
  if (step.key === 'dp_confirmed' && sph.dpPaid) return sph.dpConfirmedAt || sph.lastUpdate;
  if (step.key === 'bast_done' && sph.installationStatus === 'installed') return sph.bastDate || sph.lastUpdate;
  return null;
}

function getProjectStageRows(sph) {
  const rawRows = SPH_PROJECT_STAGE_STEPS.map((step, idx) => {
    const at = projectStageDate(sph, step);
    return { ...step, idx, at, done: !!at };
  });
  const rows = rawRows.map((row, idx) => {
    if (row.done) return row;
    const nextDone = rawRows.slice(idx + 1).find(r => r.done);
    return nextDone ? { ...row, at: nextDone.at, done: true, inferred: true } : row;
  });
  const firstPending = rows.findIndex(r => !r.done);
  return rows.map((row, idx) => ({
    ...row,
    state: row.done ? 'done' : (idx === firstPending ? 'active' : 'pending'),
  }));
}

function SPHWorkflowConsole({ data, employees, setEmployees, session, lang, fmt, onRequestSPH, onRequestSPP, onWorkflowUpdate, onSaveDocument, generatedDocs = [], products = [], documentTemplates = DEFAULT_DOCUMENT_TEMPLATES }) {
  const [open, setOpen] = useState('request');
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [deleteQueueId, setDeleteQueueId] = useState(null);
  const [editorState, setEditorState] = useState(null); // { record, docType, html, title }
  const [requestKind, setRequestKind] = useState('sph'); // 'sph' | 'spp' — toggle form request
  const [form, setForm] = useState({
    customer: '', customerAddress: '', customerType: 'hospital', projectType: 'private',
    items: [{ productId: '', modality: '', brand: '', subModality: '', qty: 1, unitPrice: '' }],
    dpPercent: 30, installmentMonths: 12,
    manualTerms: '', notes: '',
  });
  const activeProducts = useMemo(() => (products || []).filter(p => p.active !== false), [products]);
  const modalityOptions = useMemo(() => [...new Set(activeProducts.map(p => p.modality).filter(Boolean))].sort(), [activeProducts]);
  const brandsForItem = (item) => [...new Set(activeProducts.filter(p => !item.modality || p.modality === item.modality).map(p => p.brand).filter(Boolean))].sort();
  const productTypeOptionsForItem = (item) => activeProducts.filter(p => (!item.modality || p.modality === item.modality) && (!item.brand || p.brand === item.brand));
  const update = (k, v) => setForm(prev => {
    let next = { ...prev, [k]: v };
    return next;
  });
  const updateItem = (idx, key, value) => setForm(prev => {
    const items = [...(prev.items || [])];
    let item = { ...(items[idx] || {}) , [key]: value };
    if (key === 'modality') item = { ...item, brand: '', productId: '', subModality: '' };
    if (key === 'brand') item = { ...item, productId: '', subModality: '' };
    if (key === 'productId') {
      const prod = activeProducts.find(p => p.id === value);
      if (prod) item = { ...item, productId: prod.id, modality: prod.modality, brand: prod.brand, subModality: prod.type, productBrand: prod.brand, productName: prod.name, principal: prod.principal, origin: prod.origin };
    }
    items[idx] = item;
    return { ...prev, items };
  });
  const addRequestItem = () => setForm(prev => prev.items.length >= 5 ? prev : ({ ...prev, items: [...prev.items, { productId: '', modality: '', brand: '', subModality: '', qty: 1, unitPrice: '' }] }));
  const removeRequestItem = (idx) => setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx).length ? prev.items.filter((_, i) => i !== idx) : [{ productId: '', modality: '', brand: '', subModality: '', qty: 1, unitPrice: '' }] }));
  const requestRows = data.filter(s => !s.salesDownloadedAt && s.status !== 'cancelled' && (s.sphWorkflowStatus === 'requested' || s.sphWorkflowStatus === 'admin_drafting' || s.sphWorkflowStatus === 'ready_for_sales'));
  const isAdminish = ['super_admin', 'gm', 'admin'].includes(session.role);
  const deleteQueueTarget = data.find(s => s.id === deleteQueueId);
  // RBAC riwayat dokumen: sales hanya lihat dokumen miliknya; CEO/admin lihat semua
  const isCeoLevel = ['super_admin', 'gm', 'admin'].includes(session.role);
  const visibleDocs = useMemo(() => {
    const list = Array.isArray(generatedDocs) ? generatedDocs : [];
    if (isCeoLevel) return list;
    // sales: hanya requesterId === dirinya
    return list.filter(d => d.requesterId === session.username || d.requesterId === session.salesId || d.createdBy === session.username);
  }, [generatedDocs, isCeoLevel, session.username, session.salesId]);
  const isPicSales = (s) => session?.role === 'sales' && (session.salesId === s.salesOwner || session.username === s.salesOwner);
  const openSphDrive = (s) => {
    const url = normalizeExternalUrl(s.sphDriveUrl || s.sppDriveUrl);
    if (!url) return;
    if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
    if (isPicSales(s)) {
      onWorkflowUpdate(s.id, {
        sphWorkflowStatus: 'sales_downloaded',
        salesDownloadedAt: new Date().toISOString(),
        workflowEvent: 'sales_downloaded',
        nextAction: 'Sales menyampaikan penawaran ke klien',
      }, {
        note: 'SPH/SPP downloaded by PIC sales',
        notify: { target: { role: 'admin' }, payload: { type: 'sph_ready', message: `SPH/SPP ${s.sphNo} sudah diunduh oleh PIC sales ${resolveEmpName(employees, s.salesOwner)}.`, link: { view: 'sph', id: s.id } } },
      });
    }
  };

  const submitRequest = (kind = requestKind) => {
    if (!form.customer.trim()) { showToast(lang === 'id' ? 'Nama pelanggan wajib diisi' : 'Customer name required', 'error'); return; }
    if (editingRequestId) {
      const first = (form.items || [])[0] || {};
      const items = (form.items || []).slice(0, 5).map((it, idx) => ({ ...it, lineNo: idx + 1, qty: Number(it.qty) || 1, unitPrice: Number(it.unitPrice) || 0, totalValue: (Number(it.qty) || 1) * (Number(it.unitPrice) || 0) }));
      onWorkflowUpdate(editingRequestId, { ...form, items, productId: first.productId || '', productBrand: first.brand || '', modality: first.modality || '-', subModality: first.subModality || '-', qty: Number(first.qty) || 1, unitPrice: Number(first.unitPrice) || 0, totalValue: items.reduce((sum, it) => sum + (Number(it.totalValue) || 0), 0), workflowEvent: 'request_edited' }, { note: 'Request SPH edited' });
      setEditingRequestId(null);
      setForm({ customer: '', customerAddress: '', customerType: 'hospital', projectType: 'private', items: [{ productId: '', modality: '', brand: '', subModality: '', qty: 1, unitPrice: '' }], dpPercent: 30, installmentMonths: 12, manualTerms: '', notes: '' });
      return;
    }
    if (kind === 'spp') { onRequestSPP({ ...form, salesOwner: session.salesId || session.username }); } else { onRequestSPH({ ...form, salesOwner: session.salesId || session.username }); }
    setForm({ customer: '', customerAddress: '', customerType: 'hospital', projectType: 'private', items: [{ productId: '', modality: '', brand: '', subModality: '', qty: 1, unitPrice: '' }], dpPercent: 30, installmentMonths: 12, manualTerms: '', notes: '' });
  };
  const editQueueRequest = (s) => {
    setEditingRequestId(s.id);
    setForm({
      customer: s.customer || '', customerAddress: s.customerAddress || '', customerType: s.customerType || 'hospital', projectType: s.projectType || 'private',
      items: Array.isArray(s.items) && s.items.length ? s.items.map(it => ({ productId: it.productId || '', modality: it.modality || '', brand: it.brand || it.productBrand || '', subModality: it.subModality || '', qty: it.qty || 1, unitPrice: it.unitPrice || '' })) : [{ productId: s.productId || '', modality: s.modality || '', brand: s.productBrand || '', subModality: s.subModality || '', qty: s.qty || 1, unitPrice: s.unitPrice || '' }],
      dpPercent: s.dpPercent || 30, installmentMonths: s.installmentMonths || 12, manualTerms: s.manualTerms || '', notes: s.notes || '',
    });
    setOpen('request');
  };
  return (
    <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', marginBottom: '18px'}}>
      <div style={{padding: '12px 16px', borderBottom: '1px solid var(--ims-border)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
        {[
          { id: 'request', label: lang === 'id' ? 'Request SPH / SPP' : 'SPH / SPP Request', icon: Plus },
          { id: 'queue', label: lang === 'id' ? `Antrian Admin (${requestRows.length})` : `Admin Queue (${requestRows.length})`, icon: Bell },
          { id: 'docs', label: lang === 'id' ? `Riwayat Dokumen (${visibleDocs.length})` : `Document History (${visibleDocs.length})`, icon: History },
        ].map(tb => {
          const Icon = tb.icon;
          const active = open === tb.id;
          return <button key={tb.id} onClick={() => setOpen(tb.id)} style={{background: active ? 'var(--ims-accent)' : 'transparent', color: active ? '#fff' : 'var(--ims-text-2)', border: `1px solid ${active ? 'var(--ims-accent)' : 'var(--ims-border)'}`, padding: '7px 11px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'}}><Icon size={12} />{tb.label}</button>;
        })}
      </div>

      {open === 'request' && (
        <div style={{padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px'}}>
          <Field label={lang === 'id' ? 'Nama RS / Pelanggan' : 'Customer'}><input value={form.customer} onChange={e => update('customer', e.target.value)} /></Field>
          <Field label={lang === 'id' ? 'Jenis Proyek' : 'Project Type'}>
            <select value={form.projectType} onChange={e => update('projectType', e.target.value)}>
              {PROJECT_TYPES.map(pt => <option key={pt.id} value={pt.id}>{pt.id}</option>)}
            </select>
          </Field>
          <div style={{gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px'}}>
            <div style={{fontSize: '11px', color: 'var(--ims-text-2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em'}}>{lang === 'id' ? 'Item Produk (maks. 5)' : 'Product Items (max. 5)'}</div>
            <button type="button" onClick={addRequestItem} disabled={(form.items || []).length >= 5} className="btn-ghost" style={{fontSize: '11px'}}><Plus size={12} />{lang === 'id' ? 'Tambah Item' : 'Add Item'}</button>
          </div>
          {(form.items || []).map((item, idx) => (
            <div key={idx} style={{gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1.1fr 1fr 1.5fr 0.6fr 1fr auto', gap: '8px', padding: '10px', background: 'var(--ims-bg)', border: '1px solid var(--ims-border)'}}>
              <Field label={`#${idx + 1} Modalitas`}><select value={item.modality || ''} onChange={e => updateItem(idx, 'modality', e.target.value)}><option value="">Pilih</option>{modalityOptions.map(m => <option key={m} value={m}>{m}</option>)}</select></Field>
              <Field label={lang === 'id' ? 'Brand / Merek' : 'Brand'}><select value={item.brand || ''} onChange={e => updateItem(idx, 'brand', e.target.value)} disabled={!item.modality}><option value="">Pilih</option>{brandsForItem(item).map(b => <option key={b} value={b}>{b}</option>)}</select></Field>
              <Field label={lang === 'id' ? 'Tipe Produk' : 'Product Type'}><select value={item.productId || ''} onChange={e => updateItem(idx, 'productId', e.target.value)} disabled={!item.modality}><option value="">Pilih</option>{productTypeOptionsForItem(item).map(p => <option key={p.id} value={p.id}>{p.type} · {p.name}</option>)}</select></Field>
              <Field label="Qty"><input type="number" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} /></Field>
              <Field label={lang === 'id' ? 'Harga Satuan' : 'Unit Price'}><input type="number" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} /></Field>
              <div style={{display: 'flex', alignItems: 'end'}}><button type="button" onClick={() => removeRequestItem(idx)} className="btn-ghost" style={{fontSize: '10px', color: '#c03030'}}><Trash2 size={11} /></button></div>
            </div>
          ))}
          <Field label="DP %"><input type="number" value={form.dpPercent} onChange={e => update('dpPercent', e.target.value)} /></Field>
          <Field label={lang === 'id' ? 'Termin / Tenor Bulan' : 'Terms / Months'}><input type="number" value={form.installmentMonths} onChange={e => update('installmentMonths', e.target.value)} /></Field>
          <Field label={lang === 'id' ? 'Alamat Pelanggan' : 'Customer Address'} full><input value={form.customerAddress} onChange={e => update('customerAddress', e.target.value)} /></Field>
          <Field label={lang === 'id' ? 'Kondisi Manual / Editable' : 'Manual Editable Terms'} full><textarea rows={3} value={form.manualTerms} onChange={e => update('manualTerms', e.target.value)} placeholder={lang === 'id' ? 'Contoh: bonus backup unit, garansi khusus, delivery time, catatan tender...' : 'Special warranty, delivery time, tender notes...'} /></Field>
          <Field label={lang === 'id' ? 'Catatan Internal' : 'Internal Notes'} full><textarea rows={2} value={form.notes} onChange={e => update('notes', e.target.value)} /></Field>
          <div style={{gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px'}}>
            <span style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Request akan masuk ke Admin dan memunculkan notifikasi.' : 'Request will notify Admin.'}</span>
            {editingRequestId ? (
              <button className="btn-primary" onClick={submitRequest}><Check size={13} />{lang === 'id' ? 'Simpan Edit Request' : 'Save Request Edit'}</button>
            ) : (
              <div style={{display: 'flex', gap: '8px'}}>
                <button className="btn-primary" onClick={() => submitRequest('sph')} title="Buat permintaan Surat Penawaran Harga"><Plus size={13} />{lang === 'id' ? 'Request SPH' : 'Request SPH'}</button>
                <button className="btn-primary" onClick={() => submitRequest('spp')} style={{background: 'var(--ims-accent-2)'}} title="Buat permintaan Surat Permohonan Presentasi"><Plus size={13} />{lang === 'id' ? 'Request SPP' : 'Request SPP'}</button>
              </div>
            )}
          </div>
        </div>
      )}

      {open === 'queue' && (
        <div style={{padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
          {requestRows.map(s => {
            const driveUrl = s.sphDriveUrl || s.sppDriveUrl || '';
            return (
              <div key={s.id} style={{padding: '12px', background: 'var(--ims-bg)', border: '1px solid var(--ims-border)', display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) minmax(320px, 0.9fr) auto', gap: '12px', alignItems: 'center'}}>
                <div>
                  <div style={{fontSize: '13px', fontWeight: 700}}>{s.customer} · {s.subModality}</div>
                  <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '3px'}}><span className="mono">{s.sphNo}</span> · Sales: {resolveEmpName(employees, s.salesOwner)} · {SPH_WORKFLOW_LABELS[s.sphWorkflowStatus] || s.sphWorkflowStatus}</div>
                  <div className="mono" style={{fontSize: '11px', color: 'var(--ims-text)', marginTop: '3px'}}>{fmt(s.totalValue || 0)} · DP {s.dpPercent || 0}% · {s.installmentMonths || 0} bulan</div>
                </div>
                <div>
                  <div style={{fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 800, marginBottom: '5px'}}>Google Drive SPH/SPP</div>
                  <div style={{display: 'flex', gap: '6px', alignItems: 'center'}}>
                    <input
                      type="url"
                      defaultValue={driveUrl}
                      disabled={!isAdminish}
                      onBlur={e => {
                        const value = e.target.value.trim();
                        if (value !== driveUrl) onWorkflowUpdate(s.id, { sphDriveUrl: value, sphDriveUpdatedAt: new Date().toISOString() }, { note: 'SPH/SPP Google Drive link updated' });
                      }}
                      placeholder="https://drive.google.com/..."
                      style={{fontSize: '11px', minWidth: 0}}
                    />
                    <button
                      onClick={() => openSphDrive(s)}
                      disabled={!driveUrl}
                      className="btn-ghost"
                      style={{fontSize: '10px', opacity: driveUrl ? 1 : 0.45, whiteSpace: 'nowrap'}}
                      title={isPicSales(s) ? 'Unduh dan keluarkan dari antrian admin' : 'Buka link Google Drive'}
                    ><Download size={11} />Unduh</button>
                  </div>
                  {s.salesDownloadedAt && <div className="mono" style={{fontSize: '10px', color: 'var(--ims-accent-2)', marginTop: '4px'}}>Diunduh PIC: {formatDateTime(s.salesDownloadedAt, lang)}</div>}
                </div>
                <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end'}}>
                  {isAdminish && <button onClick={() => editQueueRequest(s)} className="btn-ghost" style={{fontSize: '10px'}}><Edit2 size={11} />Edit</button>}
                  {isAdminish && <button onClick={() => setDeleteQueueId(s.id)} className="btn-ghost" style={{fontSize: '10px', color: '#c03030'}}><Trash2 size={11} />Hapus</button>}
                  {isAdminish && (s.sphWorkflowStatus === 'requested' || s.sphWorkflowStatus === 'admin_drafting') && <button onClick={() => {
                    const docType = s.docKind === 'spp' ? 'spp' : 'sph';
                    const html = buildEditorTemplate(docType, s, employees, fmt, documentTemplates, s.requesterId || s.sphRequestedBy || s.salesOwner);
                    setEditorState({ record: s, docType, html, title: (docType === 'spp' ? 'Buat SPP — ' : 'Buat SPH — ') + (s.customer || '') });
                    if (s.sphWorkflowStatus === 'requested') onWorkflowUpdate(s.id, { sphWorkflowStatus: 'admin_drafting', sphDraftStartedAt: new Date().toISOString(), workflowEvent: 'admin_drafting', nextAction: 'Admin membuat Surat SPH/SPP' }, { note: 'Admin mulai membuat dokumen' });
                  }} className="btn-primary" style={{fontSize: '10px', padding: '6px 10px'}} title="Buka editor & isi otomatis dari template (tidak auto-download)"><Edit2 size={11} />Mulai</button>}
                  <button onClick={() => downloadSPHWord(s, employees, fmt, documentTemplates)} className="btn-ghost" style={{fontSize: '10px'}} title="Unduh SPH Word"><Download size={11} />Unduh</button>
                  {isAdminish && s.sphWorkflowStatus !== 'ready_for_sales' && <button onClick={() => onWorkflowUpdate(s.id, { sphWorkflowStatus: 'ready_for_sales', sphDocReadyAt: new Date().toISOString(), workflowEvent: 'ready_for_sales', nextAction: 'Sales menyampaikan penawaran ke klien' }, { note: 'SPH ready for sales', notify: { target: { username: s.salesOwner }, payload: { type: 'sph_ready', message: `SPH ${s.sphNo} untuk ${s.customer} sudah dibuat Admin dan siap disampaikan ke klien.`, link: { view: 'sph', id: s.id } } } })} className="btn-primary" style={{fontSize: '10px', padding: '6px 10px', background: 'var(--ims-accent-2)'}} title="Kirim SPH ke sales — sales akan mendapat notifikasi & bisa unduh PDF">Kirim ke Sales</button>}
                </div>
              </div>
            );
          })}
          {requestRows.length === 0 && <div className="empty-state">{lang === 'id' ? 'Belum ada request aktif' : 'No active requests'}</div>}
        </div>
      )}

      {open === 'docs' && (
        <div style={{padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginBottom: '4px'}}>
            {isCeoLevel ? (lang === 'id' ? 'Menampilkan semua dokumen dari semua sales.' : 'Showing all documents.') : (lang === 'id' ? 'Menampilkan dokumen Anda saja.' : 'Showing your documents only.')}
          </div>
          {visibleDocs.map(doc => (
            <div key={doc.id} style={{padding: '12px', background: 'var(--ims-bg)', border: '1px solid var(--ims-border)', display: 'grid', gridTemplateColumns: 'minmax(280px,1fr) auto', gap: '12px', alignItems: 'center'}}>
              <div>
                <div style={{fontSize: '13px', fontWeight: 700}}>{doc.docTitle} {doc.customer ? `· ${doc.customer}` : ''}</div>
                <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '3px'}}>
                  <span className="mono">{doc.sphNo || doc.id}</span> · {lang === 'id' ? 'Dibuat' : 'By'}: {doc.createdByName || doc.createdBy} · {formatDateTime(doc.updatedAt || doc.createdAt, lang)}
                  <span style={{marginLeft: '8px', padding: '2px 8px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: doc.status === 'ready' ? 'var(--ims-accent-2)25' : '#94a3b825', color: doc.status === 'ready' ? 'var(--ims-accent-2)' : '#94a3b8'}}>{doc.status === 'ready' ? (lang === 'id' ? 'Siap Unduh' : 'Ready') : 'Draft'}</span>
                </div>
              </div>
              <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                <button onClick={() => printHtmlStringAsPdf(doc.docTitle + ' - ' + (doc.customer || ''), doc.html)} className="btn-primary" style={{fontSize: '10px', padding: '6px 10px'}} title="Cetak / Unduh PDF"><Download size={11} />Cetak PDF</button>
                {isAdminish && <button onClick={() => { setEditorState({ record: { ...(data.find(s => s.id === doc.sourceId) || {}), id: doc.sourceId, customer: doc.customer, sphNo: doc.sphNo, requesterId: doc.requesterId, _existingDocId: doc.id }, docType: doc.docType, html: doc.html, title: (lang === 'id' ? 'Edit ' : 'Edit ') + doc.docTitle }); }} className="btn-ghost" style={{fontSize: '10px'}}><Edit2 size={11} />Edit</button>}
              </div>
            </div>
          ))}
          {visibleDocs.length === 0 && <div className="empty-state">{lang === 'id' ? 'Belum ada dokumen tersimpan. Klik "Mulai" di Antrian Admin untuk membuat dokumen.' : 'No documents yet.'}</div>}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteQueueId}
        title={lang === 'id' ? 'Hapus antrian admin?' : 'Delete admin queue item?'}
        message={lang === 'id'
          ? `Request ${deleteQueueTarget?.sphNo || ''} ${deleteQueueTarget?.customer || ''} akan dihapus dari antrian admin. Lanjutkan?`
          : `Request ${deleteQueueTarget?.sphNo || ''} ${deleteQueueTarget?.customer || ''} will be removed from admin queue. Continue?`}
        onConfirm={() => {
          if (deleteQueueId) onWorkflowUpdate(deleteQueueId, { sphWorkflowStatus: 'cancelled', status: 'cancelled', workflowEvent: 'request_deleted' }, { note: 'Request SPH deleted from queue' });
          setDeleteQueueId(null);
        }}
        onCancel={() => setDeleteQueueId(null)}
        danger
        lang={lang}
      />

      {editorState && (
        <DocumentEditorModal
          open={!!editorState}
          onClose={() => setEditorState(null)}
          title={editorState.title}
          initialHtml={editorState.html}
          docType={editorState.docType}
          record={editorState.record}
          saveLabel={lang === 'id' ? 'Kirim Dokumen' : 'Send Document'}
          lang={lang}
          onSave={(html, status) => {
            const rec = editorState.record;
            onSaveDocument && onSaveDocument({
              id: rec._existingDocId || undefined,
              docType: editorState.docType,
              html,
              status,
              record: rec,
              requesterId: rec.requesterId || rec.sphRequestedBy || rec.salesOwner,
              notifyRequester: status === 'final' && !rec._existingDocId,
            });
            if (status === 'final' && rec.id && !rec._existingDocId) {
              onWorkflowUpdate(rec.id, {
                sphWorkflowStatus: 'ready_for_sales',
                sphDocReadyAt: new Date().toISOString(),
                workflowEvent: 'ready_for_sales',
                nextAction: 'Sales mengunduh & menyampaikan penawaran ke klien',
                documentReady: true,
              }, { note: 'Dokumen dikirim dari editor — siap diunduh requester' });
            }
            setEditorState(null);
          }}
        />
      )}
    </div>
  );
}

function SPHDetailModal({ sph, employees, lang, fmt, onClose, onWorkflowUpdate, session, documentTemplates = DEFAULT_DOCUMENT_TEMPLATES }) {
  if (!sph) return null;
  const actionNow = () => new Date().toISOString();
  const actions = [
    { label: 'Admin: Mulai SPH/SPP', patch: { sphWorkflowStatus: 'admin_drafting', sphDraftStartedAt: actionNow(), workflowEvent: 'admin_drafting', nextAction: 'Admin membuat Surat SPH/SPP' }, notify: { target: { role: 'admin' }, payload: { type: 'sph_request', message: `Request SPH/SPP ${sph.customer} sedang diproses Admin.`, link: { view: 'sph', id: sph.id } } } },
    { label: 'Admin: SPH/SPP selesai', patch: { sphWorkflowStatus: 'ready_for_sales', sphDocReadyAt: actionNow(), workflowEvent: 'ready_for_sales', nextAction: 'Sales menyampaikan penawaran ke klien' }, notify: { target: { username: sph.salesOwner }, payload: { type: 'sph_ready', message: `SPH/SPP ${sph.customer} siap disampaikan ke klien.`, link: { view: 'sph', id: sph.id } } } },
    { label: 'Sales: Penawaran dikirim', patch: { sphWorkflowStatus: 'offer_sent', offerSentAt: actionNow(), workflowEvent: 'offer_sent', nextAction: 'Menunggu informasi PO dari klien' } },
    { label: 'Sales: PO dari klien', patch: { stage: 'po_issued', status: 'won', poStatus: 'issued', probability: 100, sphWorkflowStatus: 'client_po_info', clientPoInfoAt: actionNow(), poIssuedAt: actionNow(), workflowEvent: 'client_po_info', nextAction: 'Admin input SPH/SPP & PO ke IMS' }, notify: { target: { role: 'admin' }, payload: { type: 'po_won', message: `Informasi PO diterima untuk ${sph.customer}. Admin perlu input SPH/SPP & PO ke IMS.`, link: { view: 'sph', id: sph.id } } } },
    { label: 'Admin: Input SPH/SPP IMS', patch: { sphWorkflowStatus: 'po_input_ims', poInputAt: actionNow(), financePoNotifiedAt: actionNow(), workflowEvent: 'po_input_ims', nextAction: 'Finance membuat invoice penagihan DP' }, notify: { target: { role: 'finance' }, payload: { type: 'po_won', message: `SPH/SPP ${sph.customer} sudah diinput ke IMS. Finance perlu membuat invoice DP.`, link: { view: 'finance', id: sph.id } } } },
    { label: 'Finance: Invoice DP', patch: { sphWorkflowStatus: 'invoice_ready', financeDocsStatus: 'ready_for_sales', financeDocsReadyAt: actionNow(), workflowEvent: 'invoice_ready', nextAction: 'Sales follow-up pembayaran DP/deposit' }, notify: { target: { username: sph.salesOwner }, payload: { type: 'invoice_ready', message: `Invoice DP ${sph.customer} sudah siap. Sales perlu follow-up klien.`, link: { view: 'sph', id: sph.id } } } },
    { label: 'Sales: Follow-up DP', patch: { sphWorkflowStatus: 'dp_followup', dpFollowupAt: actionNow(), workflowEvent: 'dp_followup', nextAction: 'Menunggu konfirmasi pembayaran DP dari klien' } },
    { label: 'Finance: DP diterima', patch: { sphWorkflowStatus: 'dp_confirmed', dpDecisionAt: actionNow(), dpConfirmedAt: actionNow(), dpPaid: true, workflowEvent: 'dp_confirmed', nextAction: 'Finance membuat PO ke pabrik' }, notify: { target: { role: 'finance' }, payload: { type: 'dp_paid', message: `DP/deposit ${sph.customer} sudah diterima. Finance dapat membuat PO ke pabrik.`, link: { view: 'finance', id: sph.id } } } },
    { label: 'Finance: PO ke Pabrik', patch: { sphWorkflowStatus: 'factory_po_sent', manufacturePoCreatedAt: actionNow(), factoryPoSentAt: actionNow(), principalPoStatus: 'sent', principalPoSentAt: actionNow(), workflowEvent: 'factory_po_sent', nextAction: 'Finance membayar DP ke pabrik' }, notify: { target: { role: 'manager_ops' }, payload: { type: 'system', message: `PO ke pabrik ${sph.customer} sudah dikirim. Operasional menunggu DP pabrik dan produksi.`, link: { view: 'operations', id: sph.id } } } },
    { label: 'Finance: DP ke Pabrik dibayar', patch: { sphWorkflowStatus: 'factory_dp_paid', factoryDpPaidAt: actionNow(), supplierDpPaidAt: actionNow(), shippingStatus: 'plan_order', workflowEvent: 'factory_dp_paid', nextAction: 'Operasional klik pesanan dibuat dan mulai produksi/disiapkan pabrik' }, notify: { target: { role: 'manager_ops' }, payload: { type: 'factory_dp_paid', message: `DP ke pabrik ${sph.customer} sudah dibayarkan. Tombol pesanan dibuat di Operasional sudah aktif.`, link: { view: 'operations', id: sph.id } } } },
    { label: 'Ops: Barang diproduksi/disiapkan pabrik', patch: { sphWorkflowStatus: 'factory_production', factoryProductionStartedAt: actionNow(), factoryProductionDays: getFactoryProductionDays(sph), factoryProductionDueAt: addDaysIso(actionNow(), getFactoryProductionDays(sph)), shippingStatus: 'plan_order', workflowEvent: 'factory_production', nextAction: 'Menunggu produksi/disiapkan pabrik selesai' }, notify: { target: { role: 'manager_ops' }, payload: { type: 'factory_production', message: `Produksi/disiapkan pabrik ${sph.customer} dimulai.`, link: { view: 'operations', id: sph.id } } } },
    { label: 'Ops: Import/Clearance', patch: { sphWorkflowStatus: 'import_clearance', principalPoStatus: 'sent', principalPoSentAt: actionNow(), importClearanceAt: actionNow(), shippingStatus: 'on_shipment', workflowEvent: 'import_clearance', nextAction: 'Operasional update clearance sampai barang dikirim ke klien' } },
    { label: 'Ops: Barang ke Klien', patch: { sphWorkflowStatus: 'goods_sent_client', goodsSentClientAt: actionNow(), localDeliveryStatus: 'on_delivery', shippingStatus: 'sent_client', workflowEvent: 'goods_sent_client', nextAction: 'Menunggu barang diterima klien' }, notify: { target: { role: 'technician' }, payload: { type: 'install_pending', message: `Barang ${sph.customer} sudah dikirim ke klien. Teknisi menunggu konfirmasi diterima klien.`, link: { view: 'installation', id: sph.id } } } },
    { label: 'Ops: Barang diterima Klien', patch: { sphWorkflowStatus: 'goods_received_client', clientReceivedAt: actionNow(), localDeliveryStatus: 'delivered_to_rs', shippingStatus: 'client_received', technicianNotifiedAt: actionNow(), workflowEvent: 'goods_received_client', nextAction: 'Teknisi atur jadwal instalasi' }, notify: { target: { role: 'technician' }, payload: { type: 'install_pending', message: `Barang ${sph.customer} sudah diterima klien. Teknisi perlu update jadwal instalasi.`, link: { view: 'installation', id: sph.id } } } },
    { label: 'Teknisi: Jadwal Instalasi', patch: { sphWorkflowStatus: 'install_schedule_updated', installScheduleUpdatedAt: actionNow(), workflowEvent: 'install_schedule_updated', nextAction: 'Teknisi melakukan instalasi dan update BAST' } },
    { label: 'Teknisi: BAST selesai', patch: { sphWorkflowStatus: 'installed_bast', installationStatus: 'installed', bastDate: new Date().toISOString().split('T')[0], regulatoryNotifiedAt: actionNow(), workflowEvent: 'installed_bast', nextAction: 'Regulatory proses izin pemanfaatan' }, notify: { target: { role: 'regulatory' }, payload: { type: 'system', message: `Instalasi dan BAST ${sph.customer} selesai. Regulatory mulai izin pemanfaatan.`, link: { view: 'regulatory', id: sph.id } } } },
    { label: 'Regulatory: Proses Izin', patch: { sphWorkflowStatus: 'regulatory_processing', regulatoryProcessingAt: actionNow(), workflowEvent: 'regulatory_processing', nextAction: 'Regulatory menyelesaikan izin pemanfaatan' } },
    { label: 'Regulatory: Izin Selesai', patch: { sphWorkflowStatus: 'utilization_permit_done', utilizationPermitDoneAt: actionNow(), workflowEvent: 'utilization_permit_done', nextAction: 'Project selesai sampai izin pemanfaatan' } },
  ];
  const runAction = (a) => {
    const patch = { ...a.patch, lastUpdate: actionNow(), workflowEvent: a.patch.workflowEvent || 'sales_stage_update' };
    onWorkflowUpdate(sph.id, patch, { note: a.label, notify: a.notify });
  };
  const stageRows = getProjectStageRows(sph);
  const historyRows = (sph.stageHistory || []).map((h, idx, arr) => {
    const start = new Date(h.at).getTime();
    const end = idx < arr.length - 1 ? new Date(arr[idx + 1].at).getTime() : Date.now();
    return { ...h, durationMs: isNaN(start) || isNaN(end) ? 0 : Math.max(0, end - start) };
  }).reverse();
  const driveUrl = sph.sphDriveUrl || sph.sppDriveUrl || '';
  const attachmentUrl = sph.attachmentUrl || '';
  const isPicSales = session?.role === 'sales' && (session.salesId === sph.salesOwner || session.username === sph.salesOwner);
  const openDrive = (url, markDownloaded = false) => {
    const clean = normalizeExternalUrl(url);
    if (!clean) return;
    if (typeof window !== 'undefined') window.open(clean, '_blank', 'noopener,noreferrer');
    if (markDownloaded && isPicSales && !sph.salesDownloadedAt) {
      onWorkflowUpdate(sph.id, {
        sphWorkflowStatus: 'sales_downloaded',
        salesDownloadedAt: new Date().toISOString(),
        workflowEvent: 'sales_downloaded',
        nextAction: 'Sales menyampaikan penawaran ke klien',
      }, {
        note: 'SPH/SPP downloaded by PIC sales',
        notify: { target: { role: 'admin' }, payload: { type: 'sph_ready', message: `SPH/SPP ${sph.sphNo} sudah diunduh oleh PIC sales ${resolveEmpName(employees, sph.salesOwner)}.`, link: { view: 'sph', id: sph.id } } },
      });
    }
  };
  return (
    <div className="modal-overlay" onClick={onClose} style={{zIndex: 9998}}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '1180px', maxHeight: '88vh', overflow: 'hidden'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '16px'}}>
          <div>
            <h2 className="serif" style={{fontSize: '24px', margin: 0}}>{sph.customer}</h2>
            <div style={{fontSize: '12px', color: 'var(--ims-text-2)', marginTop: '4px'}}><span className="mono">{sph.sphNo}</span> · {sph.subModality} · Sales: {resolveEmpName(employees, sph.salesOwner)}</div>
          </div>
          <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end'}}>
            <button type="button" onClick={() => printSPHPdf(sph, employees, fmt, documentTemplates)} className="btn-ghost" style={{fontSize: '11px'}}><FileText size={13} />PDF SPH</button>
            <button type="button" onClick={() => downloadSPHWord(sph, employees, fmt, documentTemplates)} className="btn-ghost" style={{fontSize: '11px'}}><Download size={13} />Word</button>
            <button type="button" onClick={() => printSPPPdf(sph, employees, fmt, documentTemplates)} className="btn-ghost" style={{fontSize: '11px'}}><FileCheck size={13} />PDF SPP</button>
            <button type="button" onClick={() => downloadSPPWord(sph, employees, fmt, documentTemplates)} className="btn-ghost" style={{fontSize: '11px'}}><Download size={13} />Word SPP</button>
            <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer'}}><X size={20} /></button>
          </div>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(340px, 0.85fr)', gap: '18px', minHeight: 0}}>
          <div style={{minHeight: 0}}>
            <div className="card-title">{lang === 'id' ? 'Alur Proyek - Flowchart Instalasi HNTI' : 'Project Flow - HNTI Installation Flowchart'}</div>
            <div style={{maxHeight: '67vh', overflowY: 'auto', paddingRight: '10px', borderRight: '1px solid var(--ims-border)'}}>
              {stageRows.map((step, idx) => {
                const done = step.state === 'done';
                const active = step.state === 'active';
                const statusText = done ? 'Selesai' : active ? 'Berjalan' : 'Pending';
                return (
                  <div key={step.key} style={{display: 'grid', gridTemplateColumns: '56px 1fr', minHeight: '92px', opacity: done || active ? 1 : 0.46}}>
                    <div style={{position: 'relative', display: 'flex', justifyContent: 'center'}}>
                      <div style={{position: 'absolute', top: 0, bottom: 0, left: '50%', width: '3px', background: done || active ? step.color : 'var(--ims-border)', transform: 'translateX(-50%)', opacity: done ? 0.9 : 0.45}} />
                      <div style={{width: '32px', height: '32px', borderRadius: '50%', background: done ? step.color : active ? 'var(--ims-accent)' : 'var(--ims-bg-card-2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, zIndex: 1, marginTop: '8px'}}>{idx + 1}</div>
                    </div>
                    <div style={{padding: '10px 12px 12px', borderBottom: '1px solid rgba(70,105,170,0.22)', background: active ? 'rgba(104,151,230,0.08)' : 'transparent'}}>
                      <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
                        <div style={{fontSize: '15px', fontWeight: 800, lineHeight: 1.25}}>{step.title}</div>
                        <span style={{fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: step.color, background: step.color + '18', padding: '3px 7px', fontWeight: 900}}>{step.role}</span>
                        <span style={{marginLeft: 'auto', fontSize: '10px', color: done ? step.color : active ? 'var(--ims-accent)' : 'var(--ims-text-2)', fontWeight: 800}}>{statusText}</span>
                      </div>
                      <div style={{fontSize: '12px', color: 'var(--ims-text-2)', marginTop: '6px', lineHeight: 1.35}}>{step.desc}</div>
                      <div className="mono" style={{fontSize: '11px', color: done || active ? 'var(--ims-text)' : 'var(--ims-text-2)', marginTop: '8px'}}>
                        {step.at ? formatDateTime(step.at, lang) : '-'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{maxHeight: '67vh', overflowY: 'auto', paddingRight: '8px'}}>
            <div className="card-title">{lang === 'id' ? 'Informasi Proyek' : 'Project Information'}</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr auto', rowGap: '9px', columnGap: '16px', fontSize: '13px', marginBottom: '18px'}}>
              <span style={{color: 'var(--ims-text-2)'}}>Stage</span><strong className="mono">{sph.stage || '-'}</strong>
              <span style={{color: 'var(--ims-text-2)'}}>Status</span><strong>{sph.status || '-'}</strong>
              <span style={{color: 'var(--ims-text-2)'}}>PO Status</span><strong>{sph.poStatus || '-'}</strong>
              <span style={{color: 'var(--ims-text-2)'}}>DP</span><strong>{sph.dpPaid ? 'Sudah diterima' : 'Belum'}</strong>
              <span style={{color: 'var(--ims-text-2)'}}>Tipe</span><strong>{sph.customerType || '-'} · {sph.projectType || '-'}</strong>
              <span style={{color: 'var(--ims-text-2)'}}>Wilayah</span><strong>{sph.region || '-'}</strong>
              <span style={{color: 'var(--ims-text-2)'}}>Update Terakhir</span><strong>{formatDateTime(sph.lastUpdate, lang)}</strong>
            </div>
            <div className="card-title">{lang === 'id' ? 'Riwayat Workflow' : 'Workflow History'}</div>
            <div style={{maxHeight: '190px', overflowY: 'auto', marginBottom: '16px', background: 'rgba(0,0,0,0.12)'}}>
              {historyRows.map((h, i) => (
                <div key={i} style={{fontSize: '11px', padding: '8px 0', borderBottom: '1px dashed rgba(90,130,200,0.45)'}}>
                  <div className="mono" style={{fontWeight: 800}}>{formatDateTime(h.at, lang)}</div>
                  <div style={{marginTop: '2px'}}><strong>{h.to}</strong> · {h.by || 'system'} · {lang === 'id' ? 'durasi' : 'duration'} {formatDuration(h.durationMs, lang)}</div>
                  {h.from && <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>from {h.from}</div>}
                </div>
              ))}
              {historyRows.length === 0 && <div style={{padding: '12px', color: 'var(--ims-text-2)', fontSize: '12px'}}>{lang === 'id' ? 'Belum ada riwayat workflow' : 'No workflow history yet'}</div>}
            </div>
            <div className="card-title">{lang === 'id' ? 'Google Drive SPH/SPP' : 'SPH/SPP Google Drive'}</div>
            <div style={{display: 'flex', gap: '6px', marginBottom: '12px'}}>
              <input defaultValue={driveUrl} onBlur={e => {
                const value = e.target.value.trim();
                if (value !== driveUrl) onWorkflowUpdate(sph.id, { sphDriveUrl: value, sphDriveUpdatedAt: new Date().toISOString() }, { note: 'SPH/SPP Google Drive link updated' });
              }} placeholder="https://drive.google.com/..." style={{fontSize: '11px'}} />
              <button type="button" disabled={!driveUrl} onClick={() => openDrive(driveUrl, true)} className="btn-ghost" style={{fontSize: '10px', opacity: driveUrl ? 1 : 0.45, whiteSpace: 'nowrap'}}><Download size={11} />Unduh</button>
            </div>
            {sph.salesDownloadedAt && <div className="mono" style={{fontSize: '10px', color: 'var(--ims-accent-2)', margin: '-6px 0 12px'}}>Diunduh PIC sales: {formatDateTime(sph.salesDownloadedAt, lang)}</div>}
            <div className="card-title">{lang === 'id' ? 'Lampiran' : 'Attachment'}</div>
            <div style={{display: 'flex', gap: '6px', marginBottom: '12px'}}>
              <input defaultValue={attachmentUrl} onBlur={e => {
                const value = e.target.value.trim();
                if (value !== attachmentUrl) onWorkflowUpdate(sph.id, { attachmentUrl: value }, { note: 'Attachment updated' });
              }} placeholder={lang === 'id' ? 'Link Google Drive: PO, bukti tender...' : 'Google Drive link: PO, tender proof...'} style={{fontSize: '11px'}} />
              <button type="button" disabled={!attachmentUrl} onClick={() => openDrive(attachmentUrl)} className="btn-ghost" style={{fontSize: '10px', opacity: attachmentUrl ? 1 : 0.45, whiteSpace: 'nowrap'}}><ArrowUpRight size={11} />Buka</button>
            </div>
            <button onClick={() => onWorkflowUpdate(sph.id, { sphWorkflowStatus: 'dp_claimed_paid', dpClaimedAt: new Date().toISOString(), dpDecisionAt: new Date().toISOString(), workflowEvent: 'dp_claimed_paid', nextAction: 'Finance cek rekening dan konfirmasi DP' }, { note: 'Sales claimed DP paid', notify: { target: { role: 'finance' }, payload: { type: 'dp_paid', message: `Sales menandai DP/deposit ${sph.customer} sudah terbayar. Finance perlu cek rekening.`, link: { view: 'finance', id: sph.id } } } })} style={{width: '100%', background: 'var(--ims-gold)', color: 'var(--ims-accent-ink)', border: 'none', padding: '9px 12px', fontSize: '11px', cursor: 'pointer', fontWeight: 800}}>
              {lang === 'id' ? 'DP sudah terbayar - minta cek Finance' : 'DP paid - ask Finance to verify'}
            </button>
            <div className="card-title" style={{marginTop: '16px'}}>{lang === 'id' ? 'Aksi Update Stage' : 'Stage Update Actions'}</div>
            <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
              {actions.map(a => <button type="button" key={a.label} onClick={(e) => { e.preventDefault(); e.stopPropagation(); runAction(a); }} style={{background: a.label.includes('PO') ? 'var(--ims-accent-2)' : 'var(--ims-bg-card)', color: a.label.includes('PO') ? '#fff' : 'var(--ims-text)', border: '1px solid var(--ims-border)', padding: '7px 10px', minHeight: '30px', fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700}}>{a.label}</button>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SPHManagement({ data, employees = {}, setEmployees, products = [], documentTemplates = DEFAULT_DOCUMENT_TEMPLATES, session = {}, t, lang, canEdit, fmt, onAdd, onEdit, onDelete, onImport, onRequestSPH, onRequestSPP, onWorkflowUpdate, onSaveDocument, generatedDocs = [], setGeneratedDocs }) {
  const salesTeam = useMemo(() => getActiveSalesTeam(employees), [employees]);
  const [search, setSearch] = useState('');
  const [filterPType, setFilterPType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterYear, setFilterYear] = useState('2026');
  const [filterProduct, setFilterProduct] = useState('all');
  const [sortSPH, setSortSPH] = useState('date_desc');
  const [pageSize, setPageSize] = useState(50);  // Pagination: 50 rows initial, "Load more" button
  const [visibleCount, setVisibleCount] = useState(50);
  const [detailSph, setDetailSph] = useState(null);
  const importRef = useRef(null);
  const [importMsg, setImportMsg] = useState(null);

  const handleImportCSV = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const { records, errors } = parseSPHImport(String(ev.target.result || ''));
        if (!records.length) { setImportMsg({ ok: false, text: errors[0] || (lang === 'id' ? 'Tidak ada data valid.' : 'No valid data.') }); return; }
        const res = (onImport && onImport(records)) || { added: 0, updated: 0 };
        setImportMsg({ ok: true, text: lang === 'id'
          ? `${records.length} baris diproses → ${res.added} ditambah, ${res.updated} diperbarui${errors.length ? `, ${errors.length} dilewati` : ''}.`
          : `${records.length} rows processed → ${res.added} added, ${res.updated} updated${errors.length ? `, ${errors.length} skipped` : ''}.` });
      } catch (err) { setImportMsg({ ok: false, text: (lang === 'id' ? 'Gagal membaca file: ' : 'Failed to read file: ') + err.message }); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };
  const downloadSPHTemplate = () => {
    const header = ['SPH No', 'Pelanggan', 'Tipe', 'Jenis Proyek', 'Modality', 'Sub-Modality', 'Qty', 'Harga Satuan', 'Total Nilai', 'Stage', 'Status', 'Sales', 'Tanggal Terbit', 'Wilayah', 'Catatan'];
    const example = ['SPH/2026/001', 'RS Contoh Sehat', 'hospital', 'private', 'CT Scan', 'CT 128 Slice', '1', '8200000000', '8200000000', 'po_issued', 'won', 'hatim', '2026-03-15', 'Jateng', 'Contoh — hapus baris ini sebelum impor'];
    downloadCSV('HNTI_Template_Import_SPH.csv', [header, example]);
  };

  // PERFORMANCE: Build lookup Maps once (O(1) lookup vs O(n) .find() per row)
  const lookupMaps = useMemo(() => ({
    stageMap: new Map(STAGES.map(s => [s.id, s])),
    projectTypeMap: new Map(PROJECT_TYPES.map(p => [p.id, p])),
    salesMap: new Map(salesTeam.map(sa => [sa.id, sa])),
  }), [salesTeam]);
  const { stageMap, projectTypeMap, salesMap } = lookupMaps;

  const availableYears = useMemo(() => {
    const years = new Set(data.map(s => s.issuedDate?.substring(0, 4)).filter(Boolean));
    return Array.from(years).sort().reverse();
  }, [data]);
  const productFilterOptions = useMemo(() => [...new Set(data.flatMap(s => [s.modality, s.subModality, s.productBrand, s.brand]).filter(Boolean))].sort(), [data]);

  const filteredStats = useMemo(() => {
    const filtered = data.filter(s => {
      const matchSearch = !search || s.sphNo.toLowerCase().includes(search.toLowerCase()) || s.customer.toLowerCase().includes(search.toLowerCase()) || s.subModality.toLowerCase().includes(search.toLowerCase());
      const matchYear = filterYear === 'all' || s.issuedDate?.startsWith(filterYear);
      const matchProduct = filterProduct === 'all' || [s.modality, s.subModality, s.productBrand, s.brand].filter(Boolean).includes(filterProduct);
      return matchSearch && matchYear && matchProduct && (filterPType === 'all' || s.projectType === filterPType) && (filterStatus === 'all' || s.status === filterStatus);
    }).sort((a, b) => {
      if (sortSPH === 'value_desc') return (Number(b.totalValue) || 0) - (Number(a.totalValue) || 0);
      if (sortSPH === 'value_asc') return (Number(a.totalValue) || 0) - (Number(b.totalValue) || 0);
      if (sortSPH === 'product') return String(a.subModality || a.modality || '').localeCompare(String(b.subModality || b.modality || ''));
      if (sortSPH === 'date_asc') return new Date(a.issuedDate || a.lastUpdate || 0) - new Date(b.issuedDate || b.lastUpdate || 0);
      return new Date(b.issuedDate || b.lastUpdate || 0) - new Date(a.issuedDate || a.lastUpdate || 0);
    });
    const totalValue = filtered.reduce((sum, s) => sum + s.totalValue, 0);
    const activeCount = filtered.filter(s => s.status === 'active').length;
    const wonCount = filtered.filter(s => s.status === 'won').length;
    return { filtered, totalValue, activeCount, wonCount };
  }, [data, search, filterPType, filterStatus, filterYear, filterProduct, sortSPH]);
  const { filtered, totalValue, activeCount, wonCount } = filteredStats;

  // Reset pagination when filter changes
  useEffect(() => { setVisibleCount(pageSize); }, [search, filterPType, filterStatus, filterYear, filterProduct, sortSPH, pageSize]);

  const visibleRows = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  return (
    <div>
      <div style={{marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '14px'}}>
        <div>
          <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_sph}</div>
          <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.sph_title}</h1>
          <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.sph_subtitle}</div>
        </div>
        {canEdit && <button className="btn-primary" onClick={onAdd}><Plus size={14} strokeWidth={2} />{t.new_sph}</button>}
      </div>

      {!canEdit && <ReadOnlyBanner t={t} />}

      {onRequestSPH && onWorkflowUpdate && (
        <SPHWorkflowConsole
          data={data}
          employees={employees}
          setEmployees={setEmployees}
          products={products}
          session={session}
          lang={lang}
          fmt={fmt}
          onRequestSPH={onRequestSPH}
          onRequestSPP={onRequestSPP}
          onWorkflowUpdate={onWorkflowUpdate}
          onSaveDocument={onSaveDocument}
          generatedDocs={generatedDocs}
          documentTemplates={documentTemplates} />
      )}

      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '18px', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '16px 20px', background: 'var(--ims-bg-card)'}}><div className="lbl-tag">{lang === 'id' ? 'Total SPH' : 'Total Quotations'}</div><div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px'}}>{filtered.length}</div></div>
        <div style={{padding: '16px 20px', background: 'var(--ims-bg-card)'}}><div className="lbl-tag">{t.total_value}</div><div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px'}}>{fmt(totalValue)}</div></div>
        <div style={{padding: '16px 20px', background: 'var(--ims-bg-card)'}}><div className="lbl-tag">{t.status_active}</div><div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px'}}>{activeCount}</div></div>
        <div style={{padding: '16px 20px', background: 'var(--ims-bg-card)'}}><div className="lbl-tag">{t.status_won}</div><div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px'}}>{wonCount}</div></div>
      </div>

      <div style={{display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center', flexWrap: 'wrap'}}>
        <div style={{position: 'relative', flex: '1 1 260px', maxWidth: '380px'}}>
          <Search size={14} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ims-text-2)'}} />
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
        <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)} style={{width: 'auto', minWidth: '160px'}}>
          <option value="all">{lang === 'id' ? 'Semua Produk' : 'All Products'}</option>
          {productFilterOptions.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={sortSPH} onChange={e => setSortSPH(e.target.value)} style={{width: 'auto', minWidth: '150px'}}>
          <option value="date_desc">{lang === 'id' ? 'Tanggal Terbaru' : 'Newest Date'}</option>
          <option value="date_asc">{lang === 'id' ? 'Tanggal Terlama' : 'Oldest Date'}</option>
          <option value="product">{lang === 'id' ? 'Urut Produk' : 'By Product'}</option>
          <option value="value_desc">{lang === 'id' ? 'Nilai Tertinggi' : 'Highest Value'}</option>
          <option value="value_asc">{lang === 'id' ? 'Nilai Terendah' : 'Lowest Value'}</option>
        </select>
        <button onClick={() => {
          const header = ['SPH No', lang === 'id' ? 'Pelanggan' : 'Customer', lang === 'id' ? 'Tipe' : 'Type', lang === 'id' ? 'Jenis Proyek' : 'Project Type', 'Modality', 'Sub-Modality', 'Qty', lang === 'id' ? 'Harga Satuan' : 'Unit Price', lang === 'id' ? 'Total Nilai' : 'Total Value', 'Stage', lang === 'id' ? 'Status' : 'Status', 'Sales', lang === 'id' ? 'Tanggal Terbit' : 'Issue Date', lang === 'id' ? 'Update Terakhir' : 'Last Update'];
          const rows = [header, ...filtered.map(s => [s.sphNo, s.customer, s.customerType, s.projectType, s.modality, s.subModality, s.qty, s.unitPrice, s.totalValue, s.stage, s.status, s.salesOwner, s.issuedDate, s.lastUpdate])];
          downloadCSV(`HNTI_SPH_${new Date().toISOString().split('T')[0]}.csv`, rows);
        }} style={{background: 'var(--ims-accent-2)', border: 'none', color: '#fff', padding: '6px 12px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto'}} title={lang === 'id' ? 'Export SPH ke CSV' : 'Export SPH to CSV'}>
          <FileText size={12} />CSV ({filtered.length})
        </button>
        {canEdit && <>
          <button onClick={() => importRef.current && importRef.current.click()} style={{background: '#1a4d8a', border: 'none', color: '#fff', padding: '6px 12px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px'}} title={lang === 'id' ? 'Impor SPH dari file CSV (migrasi data massal)' : 'Import SPH from CSV file (bulk migration)'}>
            <Upload size={12} />{lang === 'id' ? 'Impor' : 'Import'}
          </button>
          <button onClick={downloadSPHTemplate} style={{background: 'transparent', border: '1px solid var(--ims-accent)', color: 'var(--ims-text-2)', padding: '6px 12px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px'}} title={lang === 'id' ? 'Unduh template CSV untuk impor' : 'Download CSV template for import'}>
            <Download size={12} />Template
          </button>
          <input ref={importRef} type="file" accept=".csv,text/csv" onChange={handleImportCSV} style={{display: 'none'}} />
        </>}
      </div>
      {importMsg && <div style={{margin: '0 0 14px', padding: '10px 14px', fontSize: '12px', border: '1px solid', borderColor: importMsg.ok ? 'var(--ims-accent-2)' : '#c03030', background: importMsg.ok ? 'rgba(58,107,58,0.08)' : 'rgba(192,48,48,0.08)', color: importMsg.ok ? '#2c5530' : '#a02020', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px'}}>
        <span>{importMsg.ok ? '✓ ' : '⚠ '}{importMsg.text}</span>
        <button onClick={() => setImportMsg(null)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700, fontSize: '14px'}}>×</button>
      </div>}

      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '1100px'}}>
          <thead>
            <tr style={{background: 'var(--ims-bg-card-2)'}}>
              <Th>{t.sph_number}</Th><Th>{t.customer}</Th><Th>{t.project_type}</Th>
              <Th>{t.modality}</Th><Th align="right">{t.quantity}</Th><Th align="right">{t.value}</Th>
              <Th>{t.status}</Th><Th>{t.sales_owner}</Th>
              <Th align="right">{t.actions}</Th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map(s => {
              const stage = stageMap.get(s.stage);
              const pt = projectTypeMap.get(s.projectType);
              const sales = salesMap.get(s.salesOwner);
              return (
                <tr key={s.id} className="hover-row" onClick={() => setDetailSph(s)} style={{borderTop: '1px solid var(--ims-border)', cursor: 'pointer'}}>
                  <Td><span className="mono" style={{fontSize: '11px'}}>{s.sphNo}</span></Td>
                  <Td>
                    <div style={{fontWeight: 500}}>{s.customer}</div>
                    <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{t[`type_${s.customerType}`]}</div>
                  </Td>
                  <Td>{pt && <span style={{display: 'inline-block', padding: '3px 7px', fontSize: '10px', background: pt.color + '25', color: pt.color, fontWeight: 600}}>{t[`ptype_${s.projectType}`]}</span>}</Td>
                  <Td>{s.subModality}</Td>
                  <Td align="right">{s.qty}</Td>
                  <Td align="right"><span className="mono" style={{fontWeight: 500}}>{fmt(s.totalValue)}</span></Td>
                  <Td>{stage && <span style={{display: 'inline-block', padding: '3px 7px', fontSize: '10px', background: stage.color + '25', color: stage.color, fontWeight: 600}}>{t[`stage_${s.stage}`]}</span>}</Td>
                  <Td>{sales ? sales.name : s.salesOwner}</Td>
                  <Td align="right">
                    <button onClick={(e) => { e.stopPropagation(); printSPHPdf(s, employees, fmt, documentTemplates); }} title="PDF SPH" style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--ims-text-2)'}}><FileText size={13} /></button>
                    <button onClick={(e) => { e.stopPropagation(); downloadSPHWord(s, employees, fmt, documentTemplates); }} title="Word SPH" style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--ims-text-2)'}}><Download size={13} /></button>
                    <button onClick={(e) => { e.stopPropagation(); printSPPPdf(s, employees, fmt, documentTemplates); }} title="PDF SPP" style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--ims-text-2)'}}><FileCheck size={13} /></button>
                    <button onClick={(e) => { e.stopPropagation(); downloadSPPWord(s, employees, fmt, documentTemplates); }} title="Word SPP" style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--ims-text-2)'}}><Download size={13} /></button>
                    {canEdit && <>
                      <button onClick={(e) => { e.stopPropagation(); onEdit(s); }} style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--ims-text-2)'}}><Edit2 size={13} /></button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(s.id); }} style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--ims-text-2)'}}><Trash2 size={13} /></button>
                    </>}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{padding: '50px', textAlign: 'center', color: 'var(--ims-text-2)'}}>{t.no_data}</div>}
        {filtered.length > visibleCount && (
          <div style={{padding: '20px', textAlign: 'center', borderTop: '1px solid var(--ims-border)', background: 'var(--ims-bg-card)'}}>
            <div style={{fontSize: '12px', color: 'var(--ims-text-2)', marginBottom: '10px'}}>
              {lang === 'id' ? 'Menampilkan' : 'Showing'} <strong style={{color: 'var(--ims-text)'}}>{visibleCount}</strong> {lang === 'id' ? 'dari' : 'of'} <strong style={{color: 'var(--ims-text)'}}>{filtered.length}</strong> {lang === 'id' ? 'SPH' : 'SPH records'}
            </div>
            <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
              <button onClick={() => setVisibleCount(c => Math.min(c + 50, filtered.length))} className="btn-ghost" style={{fontSize: '11px'}}>
                {lang === 'id' ? 'Muat 50 Lagi' : 'Load 50 More'}
              </button>
              <button onClick={() => setVisibleCount(filtered.length)} className="btn-ghost" style={{fontSize: '11px'}}>
                {lang === 'id' ? 'Tampilkan Semua' : 'Show All'} ({filtered.length})
              </button>
            </div>
          </div>
        )}
      </div>
      <SPHDetailModal sph={detailSph} employees={employees} lang={lang} fmt={fmt} session={session} documentTemplates={documentTemplates} onClose={() => setDetailSph(null)} onWorkflowUpdate={(id, patch, options) => { onWorkflowUpdate && onWorkflowUpdate(id, patch, options); setDetailSph(prev => prev && prev.id === id ? { ...prev, ...patch } : prev); }} />
    </div>
  );
}

function PipelineBoard({ data, allData, setData, employees = {}, session, logAction, t, lang, canEdit, fmt, onEdit }) {
  const salesTeam = useMemo(() => getActiveSalesTeam(employees), [employees]);
  // For privileged roles, allow filtering by sales owner; sales role uses its own data
  const isPrivilegedRole = session && (session.role === 'super_admin' || session.role === 'gm' || session.role === 'manager_ops' || session.role === 'admin');
  // Sales owner filter — 'all' or specific sales id
  const [filterSales, setFilterSales] = useState('all');
  // Deal reassignment modal state
  const [reassignDeal, setReassignDeal] = useState(null); // null | { deal, newOwner }
  // Default to current year (2026) so pipeline shows current-year deals
  const [filterYear, setFilterYear] = useState('2026');
  // Win rate calculation mode: 'current' (filtered year only) | 'ttm' (trailing 12 months) | 'all' (cumulative)
  const [winRateMode, setWinRateMode] = useState('ttm');
  // Probability filter: 'all' | 'hot' (>=70%) | 'warm' (40-69%) | 'cold' (<40%)
  const [probFilter, setProbFilter] = useState('all');
  // Sort order for deals within a stage column: 'prob_desc' (default, prioritize closing) | 'prob_asc' | 'value_desc' | 'value_asc'
  const [sortBy, setSortBy] = useState('prob_desc');

  const availableYears = useMemo(() => {
    const years = new Set(data.map(s => s.issuedDate?.substring(0, 4)).filter(Boolean));
    return Array.from(years).sort().reverse();
  }, [data]);

  // Probability bucket helper
  const probBucket = (p) => {
    const v = Number(p.probability) || 0;
    if (v >= 70) return 'hot';
    if (v >= 40) return 'warm';
    return 'cold';
  };
  // Sort comparator
  const sortDeals = (arr) => {
    const sorted = [...arr];
    if (sortBy === 'prob_desc') sorted.sort((a, b) => (Number(b.probability) || 0) - (Number(a.probability) || 0));
    else if (sortBy === 'prob_asc') sorted.sort((a, b) => (Number(a.probability) || 0) - (Number(b.probability) || 0));
    else if (sortBy === 'value_desc') sorted.sort((a, b) => (Number(b.totalValue) || 0) - (Number(a.totalValue) || 0));
    else if (sortBy === 'value_asc') sorted.sort((a, b) => (Number(a.totalValue) || 0) - (Number(b.totalValue) || 0));
    return sorted;
  };

  // PERFORMANCE: All pipeline calcs memoized (now scoped by selected year + probability)
  const pipelineStats = useMemo(() => {
    const yearScoped = filterYear === 'all' ? data : data.filter(s => s.issuedDate?.startsWith(filterYear));
    const salesScoped = filterSales === 'all' ? yearScoped : yearScoped.filter(s => s.salesOwner === filterSales);
    const probScoped = probFilter === 'all' ? salesScoped : salesScoped.filter(s => probBucket(s) === probFilter);
    const pipelineData = probScoped.filter(s => s.status === 'active' || s.status === 'won' || s.status === 'lost');
    const totalDeals = pipelineData.length;
    const totalValue = pipelineData.reduce((s, p) => s + (Number(p.totalValue) || 0), 0);
    const wonCount = pipelineData.filter(p => p.status === 'won').length;
    const lostCount = pipelineData.filter(p => p.status === 'lost').length;
    const activeCount = pipelineData.filter(p => p.status === 'active').length;

    // WIN RATE MODE — choose denominator carefully to avoid misleading numbers
    // 'current': year-filtered closed only (can be misleading early in year due to small sample)
    // 'ttm': trailing 12 months from today (May 2026) — most representative for ongoing business
    // 'all': cumulative since inception
    const today = new Date('2026-05-31');
    const ttmStart = new Date(today); ttmStart.setMonth(ttmStart.getMonth() - 12);
    const ttmDeals = data.filter(s => {
      const d = s.issuedDate ? new Date(s.issuedDate) : null;
      return d && d >= ttmStart && (s.status === 'won' || s.status === 'lost');
    });
    const ttmWon = ttmDeals.filter(s => s.status === 'won').length;
    const ttmLost = ttmDeals.filter(s => s.status === 'lost').length;

    const allClosed = data.filter(s => s.status === 'won' || s.status === 'lost');
    const allWon = allClosed.filter(s => s.status === 'won').length;
    const allLost = allClosed.filter(s => s.status === 'lost').length;

    let winRateNum, winRateDen, winRateScope;
    if (winRateMode === 'ttm') {
      winRateNum = ttmWon; winRateDen = ttmWon + ttmLost; winRateScope = 'ttm';
    } else if (winRateMode === 'all') {
      winRateNum = allWon; winRateDen = allWon + allLost; winRateScope = 'all';
    } else {
      winRateNum = wonCount; winRateDen = wonCount + lostCount; winRateScope = 'current';
    }
    const winRate = winRateDen > 0 ? (winRateNum / winRateDen) * 100 : 0;
    const smallSample = winRateDen > 0 && winRateDen < 20;

    return { pipelineData, totalDeals, totalValue, wonCount, lostCount, activeCount, winRate, winRateNum, winRateDen, winRateScope, smallSample, ttmWon, ttmLost, allWon, allLost };
  }, [data, filterYear, winRateMode, probFilter, filterSales]);
  const { pipelineData, totalDeals, totalValue, wonCount, lostCount, activeCount, winRate, winRateNum, winRateDen, winRateScope, smallSample } = pipelineStats;

  // Stage definitions including lost - show statistical view of full journey
  const ALL_STAGES_WITH_LOST = STAGES;

  // PERFORMANCE: Group projects by stage ONCE + build project type lookup map
  const projectTypeMap = useMemo(() => new Map(PROJECT_TYPES.map(p => [p.id, p])), []);
  const stageGroups = useMemo(() => {
    const groups = new Map();
    ALL_STAGES_WITH_LOST.forEach(stage => groups.set(stage.id, { projects: [], stageValue: 0 }));
    pipelineData.forEach(p => {
      const g = groups.get(p.stage);
      if (g) { g.projects.push(p); g.stageValue += p.totalValue; }
    });
    // Apply sort to each group's projects
    groups.forEach(g => { g.projects = sortDeals(g.projects); });
    return groups;
  }, [pipelineData, sortBy]);

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_pipeline}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.pipeline_title}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.pipeline_subtitle}</div>
      </div>
      {!canEdit && <ReadOnlyBanner t={t} />}

      {/* Year filter + Sales filter */}
      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap'}}>
        <span style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? 'Tahun' : 'Year'}:</span>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{width: 'auto', minWidth: '110px'}}>
          <option value="all">{lang === 'id' ? 'Semua Tahun' : 'All Years'}</option>
          {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {isPrivilegedRole && (
          <>
            <span style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginLeft: '8px'}}>{lang === 'id' ? '👤 Sales' : '👤 Sales'}:</span>
            <select value={filterSales} onChange={e => setFilterSales(e.target.value)} style={{width: 'auto', minWidth: '170px'}}>
              <option value="all">{lang === 'id' ? 'Semua Sales' : 'All Sales'}</option>
              {salesTeam.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </>
        )}
        <span style={{fontSize: '11px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{lang === 'id' ? `Menampilkan ${pipelineData.length} deal` : `Showing ${pipelineData.length} deals`}{filterSales !== 'all' && ` · ${salesTeam.find(s => s.id === filterSales)?.name}`}</span>
      </div>

      {/* Probability filter + Sort */}
      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap', padding: '10px 14px', background: 'rgba(26,41,66,0.03)', border: '1px solid var(--ims-border)'}}>
        <span style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? '🎯 Prioritas Kunjungan' : '🎯 Visit Priority'}:</span>
        {[
          { id: 'all', label: lang === 'id' ? 'Semua' : 'All', color: 'var(--ims-text-2)' },
          { id: 'hot', label: lang === 'id' ? '🔥 Hot (≥70%)' : '🔥 Hot (≥70%)', color: '#c03030' },
          { id: 'warm', label: lang === 'id' ? '⚡ Warm (40-69%)' : '⚡ Warm (40-69%)', color: 'var(--ims-accent)' },
          { id: 'cold', label: lang === 'id' ? '❄ Cold (<40%)' : '❄ Cold (<40%)', color: '#5b87b8' },
        ].map(opt => (
          <button key={opt.id} onClick={() => setProbFilter(opt.id)} style={{padding: '5px 11px', fontSize: '11px', fontFamily: 'inherit', background: probFilter === opt.id ? opt.color : 'transparent', color: probFilter === opt.id ? '#fff' : opt.color, border: `1px solid ${opt.color}`, cursor: 'pointer', fontWeight: 600}}>{opt.label}</button>
        ))}
        <span style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <span style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? 'Urutkan' : 'Sort'}:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{width: 'auto', minWidth: '180px', fontSize: '11px'}}>
            <option value="prob_desc">{lang === 'id' ? 'Probabilitas Tertinggi (default)' : 'Highest Probability (default)'}</option>
            <option value="prob_asc">{lang === 'id' ? 'Probabilitas Terendah' : 'Lowest Probability'}</option>
            <option value="value_desc">{lang === 'id' ? 'Nilai Terbesar' : 'Highest Value'}</option>
            <option value="value_asc">{lang === 'id' ? 'Nilai Terkecil' : 'Lowest Value'}</option>
          </select>
        </span>
      </div>

      {probFilter !== 'all' && (
        <div style={{padding: '8px 14px', marginBottom: '14px', background: 'var(--ims-gold-bg)', borderLeft: '3px solid var(--ims-accent)', fontSize: '11.5px', color: '#5a4a1a', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
          💡 <span>{lang === 'id'
            ? <>Anda memfilter <strong>{probFilter === 'hot' ? 'deal panas (≥70%)' : probFilter === 'warm' ? 'deal hangat (40-69%)' : 'deal dingin (<40%)'}</strong>. Fokuskan waktu kunjungan & resources di sini — ini deal yang paling mungkin closing. Klik "Semua" untuk lihat semua deal kembali.</>
            : <>Filtered to <strong>{probFilter === 'hot' ? 'hot deals (≥70%)' : probFilter === 'warm' ? 'warm deals (40-69%)' : 'cold deals (<40%)'}</strong>. Focus your visit time & resources here. Click "All" to reset.</>}</span>
        </div>
      )}

      {/* Info box explaining pipeline columns */}
      <div style={{padding: '12px 16px', background: 'rgba(26,41,66,0.04)', borderLeft: '3px solid var(--ims-border)', marginBottom: '16px', fontSize: '11.5px', color: 'var(--ims-text)', lineHeight: 1.6}}>
        <strong style={{letterSpacing: '0.05em'}}>📊 {lang === 'id' ? 'Cara Membaca Pipeline' : 'How to Read Pipeline'}:</strong>{' '}
        {lang === 'id'
          ? 'Setiap kolom menampilkan jumlah deal yang sedang di stage tersebut (bukan akumulatif). Total semua kolom = total SPH lifecycle pada tahun terpilih. "SPH Awal" = baru dikirim, belum ada follow-up.'
          : 'Each column shows deals currently at that stage (not cumulative). Sum of all columns = total SPH lifecycle for the selected year. "New SPH" = just sent, no follow-up yet.'}
      </div>

      {/* Summary KPI Strip */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '20px', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '14px 16px', background: 'var(--ims-bg-card)'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Total Deal' : 'Total Deals'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '3px'}}>{totalDeals}</div>
          <div className="mono" style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{fmt(totalValue)}</div>
        </div>
        <div style={{padding: '14px 16px', background: 'var(--ims-bg-card)'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Aktif' : 'Active'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '3px', color: '#5b87b8'}}>{activeCount}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'sedang dikerjakan' : 'in progress'}</div>
        </div>
        <div style={{padding: '14px 16px', background: 'var(--ims-bg-card)'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Menang (PO)' : 'Won (PO)'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '3px', color: 'var(--ims-accent-2)'}}>{wonCount}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>PO {lang === 'id' ? 'terbit' : 'issued'}</div>
        </div>
        <div style={{padding: '14px 16px', background: 'var(--ims-bg-card)'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Kalah' : 'Lost'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '3px', color: '#8b3a3a'}}>{lostCount}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'pembelajaran' : 'learnings'}</div>
        </div>
        <div style={{padding: '14px 16px', background: 'var(--ims-bg-alt)', color: 'var(--ims-text)', position: 'relative'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', flexWrap: 'wrap'}}>
            <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-accent)', textTransform: 'uppercase'}}>{t.win_rate}</div>
            <select value={winRateMode} onChange={e => setWinRateMode(e.target.value)} style={{fontSize: '9px', padding: '2px 4px', background: '#0f1a30', border: '1px solid var(--ims-accent)', color: 'var(--ims-accent)', fontFamily: 'inherit', cursor: 'pointer', width: 'auto', textTransform: 'uppercase', letterSpacing: '0.05em'}} title={lang === 'id' ? 'Pilih metode perhitungan' : 'Choose calculation method'}>
              <option value="ttm">{lang === 'id' ? 'TTM (12 Bln)' : 'TTM (12mo)'}</option>
              <option value="current">{filterYear === 'all' ? (lang === 'id' ? 'Semua' : 'All') : filterYear}</option>
              <option value="all">{lang === 'id' ? 'Kumulatif' : 'Cumulative'}</option>
            </select>
          </div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '3px', color: '#fff'}}>{winRateDen > 0 ? winRate.toFixed(1) + '%' : '—'}</div>
          <div style={{fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '2px'}}>
            {winRateNum}/{winRateDen} closed · {winRateScope === 'ttm' ? (lang === 'id' ? '12 bln terakhir' : 'last 12 months') : winRateScope === 'all' ? (lang === 'id' ? 'kumulatif' : 'cumulative') : (lang === 'id' ? 'tahun terpilih' : 'selected year')}
          </div>
          {smallSample && <div style={{fontSize: '9px', color: 'var(--ims-gold)', marginTop: '4px', fontStyle: 'italic'}}>⚠ {lang === 'id' ? 'Sample kecil, kurang representatif' : 'Small sample, less reliable'}</div>}
        </div>
      </div>

      <div style={{display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '20px'}}>
        {ALL_STAGES_WITH_LOST.map(stage => {
          const group = stageGroups.get(stage.id) || { projects: [], stageValue: 0 };
          const projects = group.projects;
          const stageValue = group.stageValue;
          const isLostCol = stage.id === 'lost';
          const isWonCol = stage.id === 'po_issued';
          return (
            <div key={stage.id} style={{minWidth: '280px', flex: '0 0 280px'}}>
              <div style={{padding: '14px', background: 'var(--ims-bg-card)', borderTop: `3px solid ${stage.color}`, borderLeft: '1px solid var(--ims-border)', borderRight: '1px solid var(--ims-border)', borderBottom: '1px solid var(--ims-border)', marginBottom: '10px'}} title={lang === 'id' ? `${projects.length} deal sedang di stage ini` : `${projects.length} deals at this stage`}>
                <div style={{fontSize: '10px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600}}>{t[`stage_${stage.id}`]}</div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px'}}>
                  <span className="serif" style={{fontSize: '22px', fontWeight: 500, color: isLostCol ? '#8b3a3a' : isWonCol ? 'var(--ims-accent-2)' : 'var(--ims-accent)'}}>{projects.length}</span>
                  <span className="mono" style={{fontSize: '11px', color: 'var(--ims-text)', fontWeight: 500}}>{fmt(stageValue)}</span>
                </div>
                <div style={{fontSize: '9px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>
                  {isLostCol ? (lang === 'id' ? 'Deal kalah / batal' : 'Lost / cancelled deals')
                    : isWonCol ? (lang === 'id' ? 'Closed won — PO terbit' : 'Closed won — PO issued')
                    : (lang === 'id' ? 'Sedang di stage ini' : 'Currently at this stage')}
                </div>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                {projects.map(p => {
                  const pt = projectTypeMap.get(p.projectType);
                  const owner = salesTeam.find(s => s.id === p.salesOwner);
                  return (
                    <div key={p.id} className="card-hover" style={{padding: '13px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', opacity: isLostCol ? 0.75 : 1}}>
                      <div onClick={() => canEdit && onEdit(p)} style={{cursor: canEdit ? 'pointer' : 'default'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px'}}>
                          <div style={{fontSize: '12px', fontWeight: 600, lineHeight: 1.3, textDecoration: isLostCol ? 'line-through' : 'none'}}>{p.customer}</div>
                          <div style={{width: '26px', height: '26px', borderRadius: '50%', background: stage.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, flexShrink: 0}}>{p.probability}</div>
                        </div>
                        {pt && <div style={{display: 'inline-block', padding: '2px 6px', fontSize: '9px', background: pt.color + '25', color: pt.color, fontWeight: 600, letterSpacing: '0.05em', marginBottom: '8px', textTransform: 'uppercase'}}>{t[`ptype_${p.projectType}`]}</div>}
                        <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginBottom: '8px'}}>{p.subModality} · Qty {p.qty}</div>
                        <div className="mono" style={{fontSize: '13px', fontWeight: 500}}>{fmt(p.totalValue)}</div>
                        {p.stage === 'tender' && p.tenderSubStage && <div style={{padding: '3px 7px', background: 'var(--ims-gold)20', color: 'var(--ims-text-2)', fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '6px', display: 'inline-block', fontWeight: 600}}>{t[`tender_${p.tenderSubStage}`]}</div>}
                      </div>
                      {/* Owner badge with reassign button — only for privileged roles */}
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--ims-border)'}}>
                        {owner ? (
                          <div style={{display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0}}>
                            <div style={{width: '20px', height: '20px', borderRadius: '50%', background: owner.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 600, flexShrink: 0}}>{owner.initial}</div>
                            <span style={{fontSize: '10.5px', color: 'var(--ims-text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{owner.name}</span>
                          </div>
                        ) : (
                          <span style={{fontSize: '10px', color: '#c03030', fontStyle: 'italic'}}>{lang === 'id' ? 'Belum ada owner' : 'Unassigned'}</span>
                        )}
                        {isPrivilegedRole && canEdit && (
                          <button onClick={(e) => { e.stopPropagation(); setReassignDeal({ deal: p, newOwner: p.salesOwner || 'lukman' }); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', color: '#1a4d8a', padding: '2px 6px', cursor: 'pointer', fontSize: '9px', fontFamily: 'inherit', fontWeight: 600, letterSpacing: '0.03em', flexShrink: 0}} title={lang === 'id' ? 'Ubah owner sales' : 'Reassign sales owner'}>
                            ⇄ {lang === 'id' ? 'Ubah' : 'Reassign'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {projects.length === 0 && <div style={{padding: '20px', textAlign: 'center', fontSize: '11px', color: 'var(--ims-text-2)', border: '1px dashed var(--ims-border)'}}>—</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales Reassignment Modal — only privileged roles */}
      {reassignDeal && (
        <div className="modal-overlay" onClick={() => setReassignDeal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '520px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h2 className="serif" style={{fontSize: '20px', margin: 0, fontWeight: 500}}>{lang === 'id' ? 'Ubah Owner Sales' : 'Reassign Sales Owner'}</h2>
              <button onClick={() => setReassignDeal(null)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={18} /></button>
            </div>

            <div style={{padding: '12px 14px', background: 'var(--ims-gold-bg)', border: '1px solid var(--ims-accent)', marginBottom: '14px', fontSize: '11.5px', color: '#5a4a1a', lineHeight: 1.5}}>
              <strong>{lang === 'id' ? '💡 Mengapa pindah owner?' : '💡 Why reassign?'}</strong>
              <div style={{marginTop: '4px'}}>
                {lang === 'id'
                  ? 'Faskes group (Hermina, Pramita, Mitra Keluarga) pengadaan dari pusat. Misal: Hermina Makassar — area vacant — bisa di-assign ke Dwi (pusat Jakarta) atau Icha (asisten Dwi). Setiap perubahan tercatat di Audit Trail.'
                  : 'Healthcare groups (Hermina, Pramita) procure centrally. E.g. Hermina Makassar — vacant area — can be assigned to Dwi (Jakarta HQ) or Icha. Every change is logged to Audit Trail.'}
              </div>
            </div>

            <div style={{padding: '12px', background: 'var(--ims-bg-card-2)', marginBottom: '14px'}}>
              <div style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{lang === 'id' ? 'Deal' : 'Deal'}</div>
              <div style={{fontSize: '13px', fontWeight: 600, color: 'var(--ims-text)'}}>{reassignDeal.deal.customer}</div>
              <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '3px'}}>
                <span className="mono">{reassignDeal.deal.sphNo}</span> · {reassignDeal.deal.modality} {reassignDeal.deal.subModality} · {fmt(reassignDeal.deal.totalValue)}
              </div>
            </div>

            <Field label={lang === 'id' ? 'Owner Sales Baru' : 'New Sales Owner'}>
              <select value={reassignDeal.newOwner} onChange={e => setReassignDeal(r => ({ ...r, newOwner: e.target.value }))}>
                {salesTeam.map(s => (
                  <option key={s.id} value={s.id}>{s.name} · {lang === 'id' ? s.territory : s.territoryEn}</option>
                ))}
              </select>
            </Field>

            {reassignDeal.deal.salesOwner !== reassignDeal.newOwner && (
              <div style={{marginTop: '10px', padding: '8px 12px', background: 'var(--ims-bg-alt)', border: '1px solid var(--ims-accent-2)', fontSize: '11px', color: '#1a4d2a'}}>
                {lang === 'id' ? 'Pindah dari' : 'Reassigning from'} <strong>{salesTeam.find(s => s.id === reassignDeal.deal.salesOwner)?.name || '—'}</strong> → <strong>{salesTeam.find(s => s.id === reassignDeal.newOwner)?.name}</strong>
              </div>
            )}

            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
              <button onClick={() => setReassignDeal(null)} style={{background: 'transparent', border: '1px solid var(--ims-border)', color: 'var(--ims-text-2)', padding: '8px 18px', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer'}}>{lang === 'id' ? 'Batal' : 'Cancel'}</button>
              <button onClick={() => {
                const oldOwner = reassignDeal.deal.salesOwner;
                const newOwner = reassignDeal.newOwner;
                if (oldOwner === newOwner) { setReassignDeal(null); return; }
                if (setData) {
                  setData(prev => prev.map(s => s.id === reassignDeal.deal.id ? { ...s, salesOwner: newOwner, _ownerHistory: [...(s._ownerHistory || []), { from: oldOwner, to: newOwner, at: new Date().toISOString(), by: session?.username || 'unknown' }] } : s));
                }
                if (logAction) {
                  logAction({
                    module: 'sph', action: 'update',
                    entityId: reassignDeal.deal.id,
                    entityLabel: `${reassignDeal.deal.sphNo} · ${reassignDeal.deal.customer}`,
                    field: 'salesOwner',
                    before: salesTeam.find(s => s.id === oldOwner)?.name || oldOwner,
                    after: salesTeam.find(s => s.id === newOwner)?.name || newOwner,
                    note: 'Reassigned via Pipeline board',
                  });
                }
                setReassignDeal(null);
              }} style={{background: 'var(--ims-bg-alt)', color: '#fff', border: 'none', padding: '8px 18px', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer', fontWeight: 600}}>{lang === 'id' ? 'Simpan Perubahan' : 'Save Change'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SalesModule({ data, reports, t, lang, fmt, employees = {} }) {
  const salesTeam = useMemo(() => getActiveSalesTeam(employees), [employees]);
  // Filter: view all sales, or drill into one specific sales
  const [selectedSales, setSelectedSales] = useState('all');
  const stats = useMemo(() => salesTeam.map(sales => {
    const sd = data.filter(s => s.salesOwner === sales.id);
    const sr = reports.filter(r => r.salesId === sales.id);
    const active = sd.filter(s => s.status === 'active');
    const won = sd.filter(s => s.status === 'won');
    const lost = sd.filter(s => s.status === 'lost');
    const poIssued = sd.filter(s => s.poStatus === 'issued');
    return {
      ...sales,
      activeCount: active.length, wonCount: won.length, lostCount: lost.length,
      poCount: poIssued.length,
      pipelineValue: active.reduce((s, p) => s + (Number(p.totalValue)||0), 0),
      wonValue: won.reduce((s, p) => s + (Number(p.totalValue)||0), 0),
      poValue: poIssued.reduce((s, p) => s + (Number(p.totalValue)||0), 0),
      winRate: (won.length + lost.length) > 0 ? (won.length / (won.length + lost.length)) * 100 : 0,
      visitsCount: sr.reduce((s, r) => s + (r.visits?.length || 0), 0),
      totalSPH: sd.length,
    };
  }).sort((a, b) => (b.pipelineValue + b.wonValue) - (a.pipelineValue + a.wonValue)), [data, reports]);

  // Filtered view based on selection
  const displayStats = useMemo(() => selectedSales === 'all' ? stats : stats.filter(s => s.id === selectedSales), [stats, selectedSales]);
  const totalAll = useMemo(() => stats.reduce((s, x) => s + x.pipelineValue + x.wonValue, 0), [stats]);

  // Detailed deal list for the selected sales (drill-down)
  const [dealFilter, setDealFilter] = useState('all');
  const allSelectedDeals = useMemo(() => {
    if (selectedSales === 'all') return [];
    return data.filter(s => s.salesOwner === selectedSales).sort((a, b) => (Number(b.totalValue)||0) - (Number(a.totalValue)||0));
  }, [data, selectedSales]);
  const dealCounts = useMemo(() => ({
    all: allSelectedDeals.length,
    won: allSelectedDeals.filter(s => s.status === 'won').length,
    lost: allSelectedDeals.filter(s => s.status === 'lost').length,
    active: allSelectedDeals.filter(s => s.status === 'active').length,
    cancelled: allSelectedDeals.filter(s => s.status === 'cancelled' || s.status === 'pending').length,
  }), [allSelectedDeals]);
  const selectedDeals = useMemo(() => {
    if (dealFilter === 'all') return allSelectedDeals;
    if (dealFilter === 'cancelled') return allSelectedDeals.filter(s => s.status === 'cancelled' || s.status === 'pending');
    return allSelectedDeals.filter(s => s.status === dealFilter);
  }, [allSelectedDeals, dealFilter]);
  useEffect(() => { setDealFilter('all'); }, [selectedSales]);

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_sales}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.sales_title}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.sales_subtitle}</div>
      </div>

      {/* Sales filter — drill into one sales at a time */}
      <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap'}}>
        <span style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? 'Filter Sales' : 'Filter Sales'}:</span>
        <button onClick={() => setSelectedSales('all')} style={{padding: '6px 14px', fontSize: '11px', fontFamily: 'inherit', background: selectedSales === 'all' ? 'var(--ims-accent)' : 'transparent', color: selectedSales === 'all' ? '#fff' : 'var(--ims-accent)', border: '1px solid var(--ims-border)', cursor: 'pointer', fontWeight: 600}}>{lang === 'id' ? 'Semua' : 'All'}</button>
        {salesTeam.map(s => (
          <button key={s.id} onClick={() => setSelectedSales(s.id)} style={{padding: '6px 14px', fontSize: '11px', fontFamily: 'inherit', background: selectedSales === s.id ? s.accent : 'transparent', color: selectedSales === s.id ? '#fff' : s.accent, border: `1px solid ${s.accent}`, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'}}>
            <span style={{width: '16px', height: '16px', borderRadius: '50%', background: selectedSales === s.id ? 'rgba(255,255,255,0.3)' : s.accent, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 700}}>{s.initial}</span>
            {s.name.split(' ')[0]}
          </button>
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: selectedSales === 'all' ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px', marginBottom: '24px'}}>
        {displayStats.map((s, i) => (
          <div key={s.id} style={{padding: '18px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', position: 'relative', overflow: 'hidden'}}>
            {selectedSales === 'all' && i < 3 && <div style={{position: 'absolute', top: 0, right: 0, padding: '5px 11px', background: i === 0 ? 'var(--ims-gold)' : i === 1 ? '#b8b8b8' : '#cd7f32', color: '#fff', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em'}}>#{i + 1}</div>}
            <div style={{display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '14px'}}>
              <div style={{width: '42px', height: '42px', borderRadius: '50%', background: s.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600}}>{s.initial}</div>
              <div>
                <div style={{fontSize: '14px', fontWeight: 600}}>{s.name}</div>
                <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? s.territory : s.territoryEn}</div>
              </div>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px'}}>
              <div>
                <div style={{fontSize: '9px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.pipeline_value}</div>
                <div className="mono" style={{fontSize: '13px', fontWeight: 600, marginTop: '2px'}}>{fmt(s.pipelineValue)}</div>
              </div>
              <div>
                <div style={{fontSize: '9px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Nilai Menang' : 'Won Value'}</div>
                <div className="mono" style={{fontSize: '13px', fontWeight: 600, marginTop: '2px', color: 'var(--ims-accent-2)'}}>{fmt(s.wonValue)}</div>
              </div>
              <div>
                <div style={{fontSize: '9px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Deal Aktif' : 'Active Deals'}</div>
                <div className="mono" style={{fontSize: '13px', fontWeight: 600, marginTop: '2px'}}>{s.activeCount}</div>
              </div>
              <div>
                <div style={{fontSize: '9px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.win_rate}</div>
                <div className="mono" style={{fontSize: '13px', fontWeight: 600, marginTop: '2px'}}>{s.winRate.toFixed(0)}%</div>
              </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--ims-text-2)', paddingTop: '10px', borderTop: '1px solid var(--ims-border)'}}>
              <span>{lang === 'id' ? 'Total SPH' : 'Total SPH'}: <strong style={{color: 'var(--ims-text)'}}>{s.totalSPH}</strong></span>
              <span>PO: <strong style={{color: 'var(--ims-text)'}}>{s.poCount}</strong></span>
              <span>{lang === 'id' ? 'Kunjungan' : 'Visits'}: <strong style={{color: 'var(--ims-text)'}}>{s.visitsCount}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Drill-down deal list when single sales selected */}
      {selectedSales !== 'all' && (
        <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
          <div style={{padding: '14px 16px', borderBottom: '1px solid var(--ims-border)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>
            {lang === 'id' ? `Semua Deal — ${salesTeam.find(x => x.id === selectedSales)?.name} (${selectedDeals.length})` : `All Deals — ${salesTeam.find(x => x.id === selectedSales)?.name} (${selectedDeals.length})`}
          </div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '12px 16px', borderBottom: '1px solid var(--ims-border)'}}>
            {[
              { id: 'all', label: lang === 'id' ? 'Semua' : 'All', c: 'var(--ims-accent)' },
              { id: 'won', label: lang === 'id' ? 'Menang' : 'Won', c: 'var(--ims-accent-2)' },
              { id: 'lost', label: lang === 'id' ? 'Kalah' : 'Lost', c: '#c03030' },
              { id: 'active', label: lang === 'id' ? 'Aktif' : 'Active', c: '#5b87b8' },
              { id: 'cancelled', label: lang === 'id' ? 'Pending/Batal' : 'Pending/Cancelled', c: 'var(--ims-text-2)' },
            ].map(f => (
              <button key={f.id} onClick={() => setDealFilter(f.id)} style={{padding: '5px 12px', fontSize: '11px', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', background: dealFilter === f.id ? f.c : 'transparent', color: dealFilter === f.id ? '#fff' : f.c, border: `1px solid ${f.c}`, borderRadius: '3px'}}>
                {f.label} ({dealCounts[f.id]})
              </button>
            ))}
          </div>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', minWidth: '760px'}}>
            <thead>
              <tr style={{background: 'var(--ims-bg-card-2)'}}>
                <Th>No. SPH</Th><Th>{lang === 'id' ? 'Pelanggan' : 'Customer'}</Th><Th>{lang === 'id' ? 'Produk' : 'Product'}</Th>
                <Th align="right">{lang === 'id' ? 'Nilai' : 'Value'}</Th><Th align="center">Status</Th><Th>{lang === 'id' ? 'Catatan' : 'Remarks'}</Th>
              </tr>
            </thead>
            <tbody>
              {selectedDeals.length === 0 && <tr><Td colSpan={6}><div className="empty-state">{lang === 'id' ? 'Belum ada deal' : 'No deals yet'}</div></Td></tr>}
              {selectedDeals.map(d => (
                <tr key={d.id} className="hover-row" style={{borderTop: '1px solid var(--ims-border)'}}>
                  <Td><span className="mono" style={{fontSize: '11px'}}>{d.sphNo}</span></Td>
                  <Td>{d.customer}</Td>
                  <Td><span style={{fontSize: '11px'}}>{d.modality} · {d.subModality}</span></Td>
                  <Td align="right"><span className="mono">{fmt(d.totalValue)}</span></Td>
                  <Td align="center">
                    <span style={{padding: '2px 8px', fontSize: '10px', fontWeight: 600, borderRadius: '3px', background: d.status === 'won' ? 'var(--ims-accent-2)22' : d.status === 'lost' ? '#c0303022' : (d.status === 'cancelled' || d.status === 'pending') ? 'var(--ims-text-2)22' : '#5b87b822', color: d.status === 'won' ? 'var(--ims-accent-2)' : d.status === 'lost' ? '#c03030' : (d.status === 'cancelled' || d.status === 'pending') ? 'var(--ims-text-2)' : '#5b87b8'}}>
                      {d.status === 'won' ? (lang === 'id' ? 'Menang' : 'Won') : d.status === 'lost' ? (lang === 'id' ? 'Kalah' : 'Lost') : (d.status === 'cancelled' || d.status === 'pending') ? (lang === 'id' ? 'Pending/Batal' : 'Pending/Cancelled') : (lang === 'id' ? 'Aktif' : 'Active')}
                    </span>
                  </Td>
                  <Td><span style={{fontSize: '11px', color: d.notes ? 'var(--ims-accent)' : '#b3a988', fontStyle: d.notes ? 'normal' : 'italic'}}>{d.notes || (lang === 'id' ? '—' : '—')}</span></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <div className="card-title">{t.sales_performance}</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={(selectedSales === 'all' ? stats : displayStats).map(s => ({ name: s.name.split(' ')[0], [t.pipeline_value]: s.pipelineValue, [t.revenue_ytd]: s.wonValue }))} margin={{top: 5, right: 16, left: 0, bottom: 5}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--ims-text-2)" style={{fontSize: 10}} />
            <YAxis stroke="var(--ims-text-2)" style={{fontSize: 10}} tickFormatter={(v) => v >= 1e9 ? `${(v/1e9).toFixed(0)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v} />
            <Tooltip content={<ChartTooltip fmt={fmt} />} />
            <Legend wrapperStyle={{fontSize: '11px'}} />
            <Bar dataKey={t.pipeline_value} fill="#1a4d8a" radius={[4, 4, 0, 0]} />
            <Bar dataKey={t.revenue_ytd} fill="var(--ims-accent-2)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// =================== SALES REPORTING MODULE ===================
function SalesReport({ reports, setReports, t, lang, session, fmt, employees = {}, reportsSeen = {}, setReportsSeen }) {
  const salesTeam = useMemo(() => getActiveSalesTeam(employees), [employees]);
  const markReportsRead = () => {
    if (!setReportsSeen || !reports.length) return;
    const dates = reports.map(r => r.date || '').filter(Boolean).sort();
    const latest = dates[dates.length - 1] || '';
    setReportsSeen(prev => ({ ...prev, [session.username]: latest }));
  };
  const [tab, setTab] = useState('dashboard');
  const [filterSales, setFilterSales] = useState('all');
  const [editingReport, setEditingReport] = useState(null);

  const visibleReports = useMemo(() => session.role === 'sales'
    ? reports.filter(r => r.salesId === session.salesId)
    : (filterSales === 'all' ? reports : reports.filter(r => r.salesId === filterSales))
  , [reports, session.role, session.salesId, filterSales]);

  const tabs = session.role === 'sales' ? ['dashboard', 'new', 'history'] : ['dashboard', 'history'];
  const tabLabels = { dashboard: t.sr_dashboard, new: editingReport ? t.sr_edit_report : t.sr_new, history: t.sr_history };
  const tabIcons = { dashboard: Activity, new: ClipboardList, history: Clock };

  const handleEdit = (report) => {
    setEditingReport(report);
    setTab('new');
  };
  const [deleteReportId, setDeleteReportId] = useState(null);
  const handleDelete = (id) => setDeleteReportId(id);
  const confirmDeleteReport = () => {
    setReports(prev => prev.filter(r => r.id !== deleteReportId));
    setDeleteReportId(null);
  };
  const handleSaved = () => {
    setEditingReport(null);
    setTab('history');
  };

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_sales_report}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.sr_title}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.sr_subtitle}</div>
      </div>

      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {tabs.map(x => {
          const Icon = tabIcons[x];
          const active = tab === x;
          return (
            <button key={x} onClick={() => { setTab(x); if (x !== 'new') setEditingReport(null); }} style={{background: 'transparent', border: 'none', padding: '10px 18px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: active ? 'var(--ims-accent)' : 'var(--ims-text-2)', borderBottom: active ? '2px solid var(--ims-border)' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px', letterSpacing: '0.03em'}}>
              <Icon size={14} strokeWidth={1.5} />{tabLabels[x]}
            </button>
          );
        })}
      </div>

      {session.role !== 'sales' && tab === 'history' && (
        <div style={{display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap'}}>
          <button onClick={() => setFilterSales('all')} style={{padding: '5px 11px', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', background: filterSales === 'all' ? 'var(--ims-accent)' : 'transparent', color: filterSales === 'all' ? 'var(--ims-gold)' : 'var(--ims-text-2)', border: '1px solid ' + (filterSales === 'all' ? 'var(--ims-accent)' : 'var(--ims-border)'), cursor: 'pointer', fontFamily: 'inherit'}}>{lang === 'id' ? 'Semua' : 'All'}</button>
          {salesTeam.map(s => <button key={s.id} onClick={() => setFilterSales(s.id)} style={{padding: '5px 11px', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', background: filterSales === s.id ? 'var(--ims-accent)' : 'transparent', color: filterSales === s.id ? 'var(--ims-gold)' : 'var(--ims-text-2)', border: '1px solid ' + (filterSales === s.id ? 'var(--ims-accent)' : 'var(--ims-border)'), cursor: 'pointer', fontFamily: 'inherit'}}>{s.name.split(' ')[0]}</button>)}
        </div>
      )}

      {tab === 'dashboard' && <SRDashboard reports={visibleReports} t={t} lang={lang} employees={employees} session={session} onMarkRead={markReportsRead} reportsSeen={reportsSeen} />}
      {tab === 'new' && session.role === 'sales' && <SRForm reports={reports} setReports={setReports} t={t} lang={lang} session={session} editingReport={editingReport} onSaved={handleSaved} onCancel={() => { setEditingReport(null); setTab('history'); }} employees={employees} />}
      {tab === 'history' && <SRHistory reports={visibleReports} t={t} lang={lang} fmt={fmt} canEdit={session.role === 'sales'} onEdit={handleEdit} onDelete={handleDelete} session={session} employees={employees} />}
      <ConfirmDialog open={!!deleteReportId} title={lang === 'id' ? 'Hapus Laporan?' : 'Delete Report?'} message={t.sr_confirm_delete || (lang === 'id' ? 'Yakin ingin menghapus laporan ini?' : 'Are you sure you want to delete this report?')} onConfirm={confirmDeleteReport} onCancel={() => setDeleteReportId(null)} danger lang={lang} />
    </div>
  );
}

function SRDashboard({ reports, t, lang, employees = {}, session = {}, onMarkRead, reportsSeen = {} }) {
  const salesTeam = useMemo(() => getActiveSalesTeam(employees), [employees]);
  // PERFORMANCE: All stats memoized (hook must come before any early return)
  const stats = useMemo(() => {
    const totalVisits = reports.reduce((s, r) => s + (r.visits?.length || 0), 0);
    const totalDays = reports.reduce((s, r) => s + (r.days || 0), 0);
    const totalDeals = reports.reduce((s, r) => s + (r.visits?.filter(v => v.visit === 'closed').length || 0), 0);
    const totalPipeRS = reports.reduce((s, r) => s + (r.pipeN || 0), 0);
    const bySales = {};
    reports.forEach(r => {
      if (!bySales[r.salesId]) bySales[r.salesId] = { count: 0 };
      bySales[r.salesId].count += r.visits?.length || 0;
    });
    return { totalVisits, totalDays, totalDeals, totalPipeRS, bySales };
  }, [reports]);

  if (!reports.length) return (
    <div style={{padding: '60px 30px', textAlign: 'center', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
      <ClipboardList size={36} strokeWidth={1.2} style={{color: 'var(--ims-text-2)', marginBottom: '12px'}} />
      <div style={{fontSize: '14px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{t.sr_no_reports}</div>
    </div>
  );

  const { totalVisits, totalDays, totalDeals, totalPipeRS, bySales } = stats;

  // Weekly report notification for CEO / GM / Manager Operasional
  const isManager = ['super_admin', 'gm', 'manager_ops'].includes(session.role);
  const recentReports = (() => {
    if (!isManager || !reports.length) return [];
    const dates = reports.map(r => r.date || '').filter(Boolean).sort();
    const latest = dates[dates.length - 1];
    if (!latest) return [];
    const seen = reportsSeen[session.username];
    let cutStr;
    if (seen) cutStr = seen;
    else { const cut = new Date(latest); cut.setDate(cut.getDate() - 7); cutStr = cut.toISOString().split('T')[0]; }
    return reports.filter(r => (r.date || '') > cutStr).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  })();

  return (
    <div>
      {isManager && recentReports.length > 0 && (
        <div style={{background: 'var(--ims-bg-alt)', color: 'var(--ims-text)', padding: '14px 18px', marginBottom: '20px', borderRadius: '4px', display: 'flex', alignItems: 'flex-start', gap: '12px'}}>
          <Bell size={18} strokeWidth={1.8} style={{color: 'var(--ims-accent)', flexShrink: 0, marginTop: '2px'}} />
          <div style={{flex: 1}}>
            <div style={{fontSize: '13px', fontWeight: 600, marginBottom: '6px'}}>{lang === 'id' ? `${recentReports.length} laporan lapangan baru belum dibaca` : `${recentReports.length} new field reports unread`}</div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px'}}>
              {recentReports.slice(0, 8).map(r => {
                const nm = resolveEmpName(employees, r.salesId);
                return <span key={r.id} style={{fontSize: '11px', background: 'rgba(200,169,106,0.18)', color: '#e8dcc0', padding: '2px 9px', borderRadius: '10px'}}>{nm.split(' ')[0]} · {r.date}</span>;
              })}
              {recentReports.length > 8 && <span style={{fontSize: '11px', color: 'var(--ims-accent)', padding: '2px 4px'}}>+{recentReports.length - 8}</span>}
            </div>
          </div>
          {onMarkRead && <button onClick={onMarkRead} style={{background: 'var(--ims-accent)', color: 'var(--ims-text)', border: 'none', padding: '7px 14px', fontSize: '11px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', borderRadius: '4px', flexShrink: 0, alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '6px'}}><CheckCircle2 size={13} />{lang === 'id' ? 'Tandai Sudah Dibaca' : 'Mark as Read'}</button>}
        </div>
      )}
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '24px', border: '1px solid var(--ims-border)'}}>
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
              const sales = salesTeam.find(s => s.id === id);
              if (!sales) return null;
              const pct = Math.min(st.count / 100 * 100, 100);
              return (
                <div key={id} style={{marginBottom: '12px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px'}}>
                    <span style={{fontWeight: 500}}>{sales.name} <span style={{color: 'var(--ims-text-2)', fontSize: '11px'}}>· {lang === 'id' ? sales.territory : sales.territoryEn}</span></span>
                    <span className="mono" style={{color: 'var(--ims-text-2)', fontSize: '11px'}}>{st.count}</span>
                  </div>
                  <div style={{height: '6px', background: 'var(--ims-bg-card-2)', overflow: 'hidden'}}>
                    <div style={{height: '100%', width: `${pct}%`, background: sales.accent, transition: 'width 0.5s'}} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SRForm({ reports, setReports, t, lang, session, editingReport, onSaved, onCancel, employees = {} }) {
  const _base = useMemo(() => getActiveSalesTeam(employees).find(s => s.id === session.salesId), [employees, session.salesId]);
  const sales = _base ? { ..._base, name: resolveEmpName(employees, session.salesId) } : _base;
  const isEdit = !!editingReport;
  const [form, setForm] = useState(editingReport || {
    date: '2026-05-16', week: 'Minggu 1', days: 0, nights: 0, area: '',
    visits: [{ name: '', city: '', visit: 'first', product: '', pipeline: 'cold', contact: '', note: '' }],
    pipeN: 0, pipeVal: 0, closest: '',
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
      closest: form.closest,
      block: form.block, win: form.win, next: form.next, fatigue: form.fatigue,
      createdAt: isEdit ? form.createdAt : new Date().toISOString(),
      updatedAt: isEdit ? new Date().toISOString() : undefined,
    };
    if (isEdit) {
      setReports(prev => prev.map(r => r.id === report.id ? report : r));
      showToast(t.sr_updated_success, 'success');
    } else {
      setReports(prev => [report, ...prev]);
      showToast(lang === 'id' ? 'Laporan berhasil disimpan' : 'Report saved successfully', 'success');
    }
    onSaved && onSaved();
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
      <div style={{padding: '14px 18px', background: 'linear-gradient(135deg, var(--ims-bg-alt) 0%, #2a3f5f 100%)', color: 'var(--ims-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
        <div>
          <div style={{fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--ims-accent)', marginBottom: '4px'}}>{isEdit ? t.sr_edit_report : (lang === 'id' ? 'Laporan untuk' : 'Report for')}</div>
          <div style={{fontSize: '17px', fontWeight: 600}}>{sales?.name} · <span style={{opacity: 0.7, fontSize: '13px'}}>{lang === 'id' ? sales?.territory : sales?.territoryEn}</span></div>
        </div>
        {isEdit && onCancel && (
          <button onClick={onCancel} style={{background: 'transparent', color: 'var(--ims-accent)', border: '1px solid var(--ims-accent)', padding: '6px 14px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em'}}>← {t.sr_back_to_history}</button>
        )}
      </div>

      <div className="card">
        <div className="card-title">01 · {t.sr_report_date}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_report_date}</label><input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} /></div>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_week}</label><select value={form.week} onChange={e => setForm(f => ({...f, week: e.target.value}))}><option>Minggu 1</option><option>Minggu 2</option><option>Minggu 3</option><option>Minggu 4</option></select></div>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_field_days}</label><input type="number" min="0" max="7" value={form.days} onChange={e => setForm(f => ({...f, days: e.target.value}))} /></div>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_nights}</label><input type="number" min="0" max="6" value={form.nights} onChange={e => setForm(f => ({...f, nights: e.target.value}))} /></div>
          <div style={{gridColumn: '1 / -1'}}><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_focus_area}</label><input value={form.area} onChange={e => setForm(f => ({...f, area: e.target.value}))} placeholder={lang === 'id' ? 'Contoh: Solo Kota + Sukoharjo' : 'Example: Solo + Sukoharjo'} /></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">02 · {t.sr_visits}</div>
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', fontSize: '11px', borderCollapse: 'collapse', minWidth: '800px'}}>
            <thead>
              <tr style={{background: 'var(--ims-bg-card-2)'}}>
                <th style={{padding: '8px', textAlign: 'left', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ims-text-2)'}}>#</th>
                <th style={{padding: '8px', textAlign: 'left', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Nama RS' : 'Hospital'}</th>
                <th style={{padding: '8px', textAlign: 'left', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Kab/Kota' : 'City'}</th>
                <th style={{padding: '8px', textAlign: 'left', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Kunjungan' : 'Visit'}</th>
                <th style={{padding: '8px', textAlign: 'left', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Produk' : 'Product'}</th>
                <th style={{padding: '8px', textAlign: 'left', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Pipeline' : 'Pipeline'}</th>
                <th style={{padding: '8px', textAlign: 'left', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Kontak' : 'Contact'}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {form.visits.map((v, i) => (
                <tr key={i} style={{borderTop: '1px solid var(--ims-border)'}}>
                  <td style={{padding: '6px', fontSize: '11px', color: 'var(--ims-text-2)', textAlign: 'center'}}>{i + 1}</td>
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
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_pipe_count}</label><input type="number" min="0" value={form.pipeN} onChange={e => setForm(f => ({...f, pipeN: e.target.value}))} /></div>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_pipe_val}</label><input type="number" min="0" value={form.pipeVal} onChange={e => setForm(f => ({...f, pipeVal: e.target.value}))} /></div>
          <div style={{gridColumn: '1 / -1'}}><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_closest}</label><input value={form.closest} onChange={e => setForm(f => ({...f, closest: e.target.value}))} placeholder={lang === 'id' ? 'Nama RS' : 'Hospital name'} /></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">04 · {t.sr_reflection}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '14px'}}>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_win}</label><textarea rows={3} value={form.win} onChange={e => setForm(f => ({...f, win: e.target.value}))} /></div>
          <div><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_block}</label><textarea rows={3} value={form.block} onChange={e => setForm(f => ({...f, block: e.target.value}))} /></div>
          <div style={{gridColumn: '1 / -1'}}><label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px', display: 'block'}}>{t.sr_next}</label><textarea rows={2} value={form.next} onChange={e => setForm(f => ({...f, next: e.target.value}))} /></div>
        </div>
        <div>
          <label style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '8px', display: 'block'}}>{t.sr_fatigue} (1={lang === 'id' ? 'Segar' : 'Fresh'} · 5={lang === 'id' ? 'Sangat Lelah' : 'Very Tired'})</label>
          <div style={{display: 'flex', gap: '6px'}}>
            {[1, 2, 3, 4, 5].map(v => (
              <button key={v} onClick={() => setForm(f => ({...f, fatigue: v}))} style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', color: v <= form.fatigue ? 'var(--ims-gold)' : 'var(--ims-border)'}}>
                <Star size={22} fill={v <= form.fatigue ? 'var(--ims-gold)' : 'none'} strokeWidth={1.5} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{padding: '14px 18px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'}}>
        <div style={{fontSize: '12px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{lang === 'id' ? 'Laporan otomatis tampil di dashboard CEO' : 'Report auto-displays on CEO dashboard'}</div>
        <button className="btn-primary" onClick={handleSubmit}>{t.sr_submit} →</button>
      </div>
    </div>
  );
}

function SRHistory({ reports, t, lang, canEdit, onEdit, onDelete, session, fmt, employees = {} }) {
  const salesTeam = useMemo(() => getActiveSalesTeam(employees), [employees]);
  const [expanded, setExpanded] = useState(null);
  const [sortBy, setSortBy] = useState('date_desc');

  const sortedReports = useMemo(() => {
    const arr = [...reports];
    if (sortBy === 'date_desc') return arr.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    if (sortBy === 'date_asc') return arr.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    if (sortBy === 'visits_desc') return arr.sort((a, b) => (b.visits?.length || 0) - (a.visits?.length || 0));
    return arr;
  }, [reports, sortBy]);

  if (!reports.length) return (
    <div style={{padding: '60px 30px', textAlign: 'center', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
      <Clock size={36} strokeWidth={1.2} style={{color: 'var(--ims-text-2)', marginBottom: '12px'}} />
      <div style={{fontSize: '14px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{t.sr_no_reports}</div>
    </div>
  );

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '10px'}}>
        <SortToggle value={sortBy} onChange={setSortBy} lang={lang} options={[
          {value: 'date_desc', label: lang === 'id' ? 'Terbaru' : 'Newest'},
          {value: 'date_asc', label: lang === 'id' ? 'Terlama' : 'Oldest'},
          {value: 'visits_desc', label: lang === 'id' ? 'Visit Terbanyak' : 'Most Visits'},
        ]} />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
        {sortedReports.map(r => {
        const sales = salesTeam.find(s => s.id === r.salesId);
        const isOpen = expanded === r.id;
        // Only the report owner (sales) can edit/delete their own report
        const isOwner = canEdit && session?.salesId === r.salesId;
        return (
          <div key={r.id} style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
            <div style={{padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap'}}>
              <div onClick={() => setExpanded(isOpen ? null : r.id)} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 auto', flexWrap: 'wrap'}}>
                <div style={{width: '4px', height: '38px', background: sales?.accent || 'var(--ims-accent)'}} />
                <div style={{flex: '1 1 200px', minWidth: 0}}>
                  <div style={{fontSize: '13px', fontWeight: 600}}>{sales?.name || r.salesId}</div>
                  <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}} className="mono">{r.date} · {r.week}{r.updatedAt && <span style={{color: 'var(--ims-accent)', marginLeft: '6px'}}>· {lang === 'id' ? 'diedit' : 'edited'}</span>}</div>
                </div>
                <div style={{display: 'flex', gap: '14px', fontSize: '11px', color: 'var(--ims-text-2)', flexWrap: 'wrap'}} className="mono">
                  <span><b style={{color: 'var(--ims-text)'}}>{r.visits?.length || 0}</b> RS</span>
                  <span><b style={{color: 'var(--ims-text)'}}>{r.days}</b> {t.days}</span>
                </div>
                <ChevronDown size={16} style={{transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: 'var(--ims-text-2)'}} />
              </div>
              {isOwner && (
                <div style={{display: 'flex', gap: '4px'}}>
                  <button onClick={(e) => { e.stopPropagation(); onEdit(r); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '5px 10px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit'}} title={t.sr_edit_report}><Edit2 size={11} /></button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(r.id); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '5px 10px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}} title={t.sr_delete_report}><Trash2 size={11} /></button>
                </div>
              )}
            </div>
            {isOpen && (
              <div style={{padding: '16px 22px', borderTop: '1px solid var(--ims-border)', fontSize: '12.5px', lineHeight: 1.7}}>
                {r.win && <p style={{marginBottom: '6px', color: 'var(--ims-accent-2)'}}><strong>✓ {t.sr_win}:</strong> {r.win}</p>}
                {r.block && <p style={{marginBottom: '6px', color: 'var(--ims-accent)'}}><strong>⚠ {t.sr_block}:</strong> {r.block}</p>}
                {r.next && <p style={{marginBottom: '6px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}><strong>{t.sr_next}:</strong> {r.next}</p>}
                {r.area && <p style={{marginBottom: '6px'}}><strong>{t.sr_focus_area}:</strong> {r.area}</p>}
                {r.closest && <p style={{marginBottom: '6px'}}><strong>{t.sr_closest}:</strong> {r.closest}</p>}
                {r.visits?.length > 0 && (
                  <div style={{marginTop: '12px'}}>
                    <div style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', marginBottom: '8px', fontWeight: 600}}>{lang === 'id' ? 'RS Dikunjungi' : 'Hospitals Visited'} ({r.visits.length})</div>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px'}}>
                      {r.visits.map((v, i) => <span key={i} style={{padding: '3px 9px', fontSize: '10px', background: 'var(--ims-bg-card-2)', color: 'var(--ims-text)'}}>{v.name}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}

// ============== Employees Module (Master Data Karyawan) ==============
// Akses: hanya CEO (super_admin), General Manager (gm), dan Manager Operasional (manager_ops)

const PRODUCT_FILE_TYPES = [
  { key: 'brosur', label: 'Brosur' },
  { key: 'spesifikasi', label: 'Spesifikasi' },
  { key: 'konfigurasi', label: 'Konfigurasi' },
  { key: 'dataKomparasi', label: 'Data Komparasi' },
  { key: 'filePresentasi', label: 'File Presentasi' },
];

function ProductSupportModule({ data, trainingRecords, products, employees, session, t, lang, canEdit, fmt, activities = [], setActivities = () => {}, files = [], setFiles = () => {} }) {
  const [tab, setTab] = useState('presentations');
  const [presentationFilter, setPresentationFilter] = useState({ modality: 'all', type: 'all' });
  const [form, setForm] = useState({ hospital: '', sphId: '', productId: '', modality: '', brand: '', type: '', date: new Date().toISOString().split('T')[0], activityType: 'presentasi', note: '', competitor: '', attachmentUrl: '' });
  const [activityFilter, setActivityFilter] = useState({ specialist: 'all', activityType: 'all', search: '' });
  const [downloadMenuProductId, setDownloadMenuProductId] = useState(null);
  const [deleteActivityId, setDeleteActivityId] = useState(null);
  const activeProducts = useMemo(() => (products || []).filter(p => p.active !== false), [products]);
  const activeSphProjects = useMemo(() => data.filter(s => s.status === 'active' || s.poStatus === 'issued'), [data]);
  const activityTypeLabels = {
    presentasi: 'Presentasi',
    demo_product: 'Demo Product',
    approach_user: 'Approach ke User',
    training: 'Training',
    lainnya: 'Lainnya',
  };
  const activityCustomerOptions = useMemo(() => [...new Set(activeSphProjects.map(s => s.customer).filter(Boolean))].sort(), [activeSphProjects]);
  const activityProductOptions = useMemo(() => {
    if (!form.hospital) return [];
    return activeSphProjects.filter(s => s.customer === form.hospital).flatMap(s => {
      const items = Array.isArray(s.items) && s.items.length ? s.items : [{ productId: s.productId, modality: s.modality, brand: s.productBrand || s.brand, subModality: s.subModality }];
      return items.map((it, idx) => {
        const prod = resolveProductRecord({
          productId: it.productId || s.productId,
          modality: it.modality || s.modality,
          subModality: it.subModality || it.type || s.subModality,
          brand: it.brand || it.productBrand || s.productBrand || s.brand || s.partner,
        }, activeProducts);
        return {
          key: `${s.id}_${idx}`,
          sphId: s.id,
          sphNo: s.sphNo,
          productId: it.productId || prod?.id || '',
          modality: it.modality || prod?.modality || s.modality || '',
          brand: it.brand || it.productBrand || prod?.brand || s.productBrand || s.brand || s.partner || '',
          type: it.subModality || it.type || prod?.type || s.subModality || '',
        };
      });
    });
  }, [activeProducts, activeSphProjects, form.hospital]);
  const presentationProjectsAll = useMemo(() => data.filter(s => s.status === 'active' && (s.stage === 'presentation_scheduled' || s.tenderSubStage === 'presentation')), [data]);
  const presentationModalities = useMemo(() => [...new Set(presentationProjectsAll.map(s => s.modality).filter(Boolean))].sort(), [presentationProjectsAll]);
  const presentationTypes = useMemo(() => [...new Set(presentationProjectsAll.filter(s => presentationFilter.modality === 'all' || s.modality === presentationFilter.modality).map(s => s.subModality).filter(Boolean))].sort(), [presentationProjectsAll, presentationFilter.modality]);
  const presentationProjects = useMemo(() => presentationProjectsAll.filter(s =>
    (presentationFilter.modality === 'all' || s.modality === presentationFilter.modality) &&
    (presentationFilter.type === 'all' || s.subModality === presentationFilter.type)
  ), [presentationProjectsAll, presentationFilter]);
  const productFileRows = useMemo(() => activeProducts.map(p => ({
    ...p,
    fileEntries: PRODUCT_FILE_TYPES.map(ft => ({ ...ft, url: getProductFileUrl(p, ft.key) })),
  })), [activeProducts]);
  const productSpecialistOptions = useMemo(() => {
    const fromEmployees = Object.entries(employees || {})
      .filter(([, emp]) => emp.active !== false && (emp.role === 'product_specialist' || emp.department === 'Product Specialist' || emp.division === 'Product Specialist'))
      .map(([username, emp]) => ({ username, name: emp.name || username }));
    const fromActivities = activities
      .filter(a => a.by || a.byName)
      .map(a => ({ username: a.by || a.byName, name: a.byName || a.by }));
    const map = new Map();
    [...fromEmployees, ...fromActivities].forEach(ps => {
      if (ps.username || ps.name) map.set(ps.username || ps.name, ps);
    });
    return [...map.values()].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [activities, employees]);
  const filteredActivities = useMemo(() => activities.filter(a => {
    const q = activityFilter.search.trim().toLowerCase();
    const byMatch = activityFilter.specialist === 'all' || a.by === activityFilter.specialist || a.byName === activityFilter.specialist;
    const typeMatch = activityFilter.activityType === 'all' || a.activityType === activityFilter.activityType;
    const textMatch = !q || [a.hospital, a.modality, a.brand, a.type, a.activityType, a.note, a.competitor, a.byName].some(v => String(v || '').toLowerCase().includes(q));
    return byMatch && typeMatch && textMatch;
  }), [activities, activityFilter]);
  const activityStats = useMemo(() => {
    const monthKey = new Date().toISOString().slice(0, 7);
    const thisMonth = filteredActivities.filter(a => String(a.date || '').startsWith(monthKey)).length;
    const customers = new Set(filteredActivities.map(a => a.hospital).filter(Boolean)).size;
    const competitorNotes = filteredActivities.filter(a => String(a.competitor || '').trim()).length;
    const byType = filteredActivities.reduce((acc, a) => {
      const key = a.activityType || 'lainnya';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const bySpecialist = filteredActivities.reduce((acc, a) => {
      const key = a.byName || a.by || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return { total: filteredActivities.length, thisMonth, customers, competitorNotes, byType, bySpecialist };
  }, [filteredActivities]);
  const upcomingTraining = trainingRecords.filter(r => r.sessionDate && r.status !== 'completed');
  const exportPresentationsCSV = () => downloadCSV('HNTI_ProductSupport_Jadwal_Presentasi.csv', [
    ['SPH', 'Customer', 'Modalitas', 'Tipe', 'Sales', 'Nilai', 'Stage'],
    ...presentationProjects.map(p => [p.sphNo, p.customer, p.modality, p.subModality, resolveEmpName(employees, p.salesOwner), p.totalValue || 0, p.stage])
  ]);
  const exportPresentationsPdf = () => openPrintableHtml('Jadwal Presentasi Product Support', `<style>body{font-family:Arial,sans-serif;padding:28px}table{width:100%;border-collapse:collapse;font-size:11px}td,th{border:1px solid #bbb;padding:6px;text-align:left}th{background:#eee}</style><h2>Jadwal Presentasi Product Support</h2><table><thead><tr><th>SPH</th><th>Customer</th><th>Modalitas</th><th>Tipe</th><th>Sales</th><th>Nilai</th></tr></thead><tbody>${presentationProjects.map(p => `<tr><td>${p.sphNo}</td><td>${p.customer}</td><td>${p.modality}</td><td>${p.subModality}</td><td>${resolveEmpName(employees, p.salesOwner)}</td><td>${fmt(p.totalValue || 0)}</td></tr>`).join('')}</tbody></table>`);
  const saveActivity = () => {
    if (!canEdit || !form.hospital.trim()) return;
    const now = new Date().toISOString();
    const rec = { ...form, id: form.id || 'ps_act_' + Date.now(), date: form.date || new Date().toISOString().split('T')[0], by: form.by || session.username, byName: form.byName || session.name, createdAt: form.createdAt || now, updatedAt: form.id ? now : undefined, submittedAt: now };
    setActivities(prev => form.id ? prev.map(a => a.id === form.id ? rec : a) : [rec, ...prev]);
    notify({ role: 'super_admin' }, { type: 'system', message: `Laporan Product Support baru: ${rec.activityType} di ${rec.hospital}.`, link: { view: 'product_support' } }, { username: session.username, role: session.role });
    notify({ role: 'sales' }, { type: 'system', message: `Product Support update: ${rec.activityType} di ${rec.hospital}.`, link: { view: 'product_support' } }, { username: session.username, role: session.role });
    setForm({ hospital: '', sphId: '', productId: '', modality: '', brand: '', type: '', date: new Date().toISOString().split('T')[0], activityType: 'presentasi', note: '', competitor: '', attachmentUrl: '' });
  };
  const chooseActivityProduct = (key) => {
    const opt = activityProductOptions.find(o => o.key === key);
    setForm(prev => opt ? { ...prev, selectedProductKey: key, sphId: opt.sphId, productId: opt.productId, modality: opt.modality, brand: opt.brand, type: opt.type } : { ...prev, selectedProductKey: '', sphId: '', productId: '', modality: '', brand: '', type: '' });
  };
  const openProductFile = (url) => {
    const clean = normalizeExternalUrl(url);
    if (clean && typeof window !== 'undefined') window.open(clean, '_blank', 'noopener,noreferrer');
  };
  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_product_support || 'Product Support'}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, margin: 0}}>{lang === 'id' ? 'Product Support' : 'Product Support'}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{lang === 'id' ? 'Presentasi, aktivitas Product Specialist, file produk, dan jadwal training.' : 'Presentations, Product Specialist activities, product files, and training schedules.'}</div>
      </div>
      {!canEdit && <ReadOnlyBanner t={t} />}
      <div style={{display: 'flex', gap: '2px', marginBottom: '20px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {[
          { id: 'presentations', label: lang === 'id' ? 'Jadwal Presentasi' : 'Presentations', icon: CalendarDays, count: presentationProjects.length },
          { id: 'activities', label: lang === 'id' ? 'Activity Report' : 'Activity Report', icon: ClipboardList, count: activities.length },
          { id: 'files', label: lang === 'id' ? 'File Produk' : 'Product Files', icon: FolderOpen, count: productFileRows.reduce((sum, p) => sum + p.fileEntries.filter(f => f.url).length, 0) },
          { id: 'training', label: lang === 'id' ? 'Jadwal Training Produk' : 'Product Training', icon: Users, count: upcomingTraining.length },
        ].map(tb => {
          const Icon = tb.icon; const active = tab === tb.id;
          return <button key={tb.id} onClick={() => setTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: active ? 'var(--ims-accent)' : 'var(--ims-text-2)', borderBottom: active ? '2px solid var(--ims-border)' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px'}}><Icon size={14} />{tb.label}<span style={{padding: '2px 7px', background: active ? 'var(--ims-accent)' : 'var(--ims-border)', color: active ? '#fff' : 'var(--ims-text-2)', fontSize: '10px', borderRadius: '10px'}}>{tb.count}</span></button>;
        })}
      </div>
      {tab === 'presentations' && (
        <div>
          <div style={{display: 'flex', gap: '8px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '12px', padding: '12px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
            <Field label="Modalitas"><select value={presentationFilter.modality} onChange={e => setPresentationFilter({ modality: e.target.value, type: 'all' })}><option value="all">Semua</option>{presentationModalities.map(m => <option key={m} value={m}>{m}</option>)}</select></Field>
            <Field label="Tipe"><select value={presentationFilter.type} onChange={e => setPresentationFilter(f => ({ ...f, type: e.target.value }))}><option value="all">Semua</option>{presentationTypes.map(tp => <option key={tp} value={tp}>{tp}</option>)}</select></Field>
            <button className="btn-ghost" onClick={exportPresentationsCSV}><Download size={13} />CSV</button>
            <button className="btn-ghost" onClick={exportPresentationsPdf}><FileText size={13} />PDF</button>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px'}}>
            {presentationProjects.map(p => <div key={p.id} style={{padding: '14px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
              <div style={{fontWeight: 700}}>{p.customer}</div>
              <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '3px'}}>{p.modality} · {p.subModality} · Sales {resolveEmpName(employees, p.salesOwner)}</div>
              <div className="mono" style={{fontSize: '11px', marginTop: '8px'}}>{p.sphNo} · {fmt(p.totalValue || 0)}</div>
            </div>)}
            {presentationProjects.length === 0 && <div className="empty-state">{lang === 'id' ? 'Belum ada proyek aktif di tahap jadwal presentasi' : 'No active scheduled presentation projects'}</div>}
          </div>
        </div>
      )}
      {tab === 'activities' && (
        <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
          <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', border: '1px solid var(--ims-border)'}}>
            <div style={{padding: '14px', background: 'var(--ims-bg-card)'}}><div className="lbl-tag">{lang === 'id' ? 'Total Laporan' : 'Total Reports'}</div><div className="serif" style={{fontSize: '26px', marginTop: '4px'}}>{activityStats.total}</div><div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'sesuai filter' : 'matching filters'}</div></div>
            <div style={{padding: '14px', background: 'var(--ims-bg-card)'}}><div className="lbl-tag">{lang === 'id' ? 'Bulan Ini' : 'This Month'}</div><div className="serif" style={{fontSize: '26px', marginTop: '4px', color: 'var(--ims-accent)'}}>{activityStats.thisMonth}</div><div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'aktivitas terkirim' : 'submitted activities'}</div></div>
            <div style={{padding: '14px', background: 'var(--ims-bg-card)'}}><div className="lbl-tag">{lang === 'id' ? 'RS / Partner' : 'Customers'}</div><div className="serif" style={{fontSize: '26px', marginTop: '4px', color: 'var(--ims-accent-2)'}}>{activityStats.customers}</div><div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'dikunjungi/didampingi' : 'visited/supported'}</div></div>
            <div style={{padding: '14px', background: 'var(--ims-bg-card)'}}><div className="lbl-tag">{lang === 'id' ? 'Intel Kompetitor' : 'Competitor Intel'}</div><div className="serif" style={{fontSize: '26px', marginTop: '4px', color: '#7b3fb5'}}>{activityStats.competitorNotes}</div><div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'laporan berisi kompetitor' : 'reports with competitor notes'}</div></div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '360px 1fr', gap: '14px'}}>
            <div style={{padding: '14px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
              <div className="card-title">{form.id ? (lang === 'id' ? 'Edit Laporan Harian' : 'Edit Daily Report') : (lang === 'id' ? 'Laporan Harian Product Specialist' : 'Product Specialist Daily Report')}</div>
              <Field label="RS / Partner">
                <select disabled={!canEdit} value={form.hospital} onChange={e => setForm({ ...form, hospital: e.target.value, selectedProductKey: '', sphId: '', productId: '', modality: '', brand: '', type: '' })}>
                  <option value="">{lang === 'id' ? 'Pilih RS/Partner dari SPH aktif' : 'Select customer from active SPH'}</option>
                  {activityCustomerOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label={lang === 'id' ? 'Produk' : 'Product'}>
                <select disabled={!canEdit || !form.hospital} value={form.selectedProductKey || ''} onChange={e => chooseActivityProduct(e.target.value)}>
                  <option value="">{form.hospital ? (lang === 'id' ? 'Pilih produk dari SPH aktif' : 'Select product from active SPH') : (lang === 'id' ? 'Pilih RS dahulu' : 'Select customer first')}</option>
                  {activityProductOptions.map(opt => <option key={opt.key} value={opt.key}>{opt.modality} · {opt.type} · {opt.brand} · {opt.sphNo}</option>)}
                </select>
              </Field>
              <Field label={lang === 'id' ? 'Merek' : 'Brand'}><input disabled value={form.brand || ''} placeholder={lang === 'id' ? 'Otomatis dari SPH' : 'Auto from SPH'} /></Field>
              <Field label={lang === 'id' ? 'Tipe' : 'Type'}><input disabled value={form.type || ''} placeholder={lang === 'id' ? 'Otomatis dari SPH' : 'Auto from SPH'} /></Field>
              <Field label={lang === 'id' ? 'Tanggal' : 'Date'}><input disabled={!canEdit} type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} /></Field>
              <Field label="Activity">
                <select disabled={!canEdit} value={form.activityType || 'presentasi'} onChange={e => setForm({ ...form, activityType: e.target.value })}>
                  {Object.entries(activityTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </Field>
              <Field label={lang === 'id' ? 'Catatan' : 'Note'}><textarea disabled={!canEdit} rows={2} value={form.note || ''} onChange={e => setForm({ ...form, note: e.target.value })} /></Field>
              <Field label={lang === 'id' ? 'Kompetitor' : 'Competitor'}><textarea disabled={!canEdit} rows={2} value={form.competitor} onChange={e => setForm({ ...form, competitor: e.target.value })} placeholder="Merek, tipe, harga, manuver..." /></Field>
              <Field label="Attachment"><input disabled={!canEdit} value={form.attachmentUrl} onChange={e => setForm({ ...form, attachmentUrl: e.target.value })} placeholder="https://drive.google.com/..." /></Field>
              {canEdit && <button className="btn-primary" onClick={saveActivity} style={{width: '100%', justifyContent: 'center'}}>{lang === 'id' ? 'Kirim dan Simpan' : 'Send and Save'}</button>}
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <div style={{padding: '12px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(160px, 1fr))', gap: '8px'}}>
                <Field label={lang === 'id' ? 'Product Specialist' : 'Product Specialist'}>
                  <select value={activityFilter.specialist} onChange={e => setActivityFilter(f => ({ ...f, specialist: e.target.value }))}>
                    <option value="all">{lang === 'id' ? 'Semua Product Specialist' : 'All Product Specialists'}</option>
                    {productSpecialistOptions.map(ps => <option key={ps.username || ps.name} value={ps.username || ps.name}>{ps.name}</option>)}
                  </select>
                </Field>
                <Field label={lang === 'id' ? 'Jenis Aktivitas' : 'Activity Type'}>
                  <select value={activityFilter.activityType} onChange={e => setActivityFilter(f => ({ ...f, activityType: e.target.value }))}>
                    <option value="all">{lang === 'id' ? 'Semua Aktivitas' : 'All Activities'}</option>
                    {Object.entries(activityTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                </Field>
                <Field label={lang === 'id' ? 'Pencarian' : 'Search'}><input value={activityFilter.search} onChange={e => setActivityFilter(f => ({ ...f, search: e.target.value }))} placeholder={lang === 'id' ? 'Cari RS, produk, kompetitor...' : 'Search customer, product, competitor...'} /></Field>
              </div>
              <div style={{padding: '12px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
                <div className="card-title">{lang === 'id' ? 'Ringkasan Jenis Aktivitas' : 'Activity Type Summary'}</div>
                <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                  {Object.entries(activityTypeLabels).map(([key, label]) => <span key={key} style={{fontSize: '10px', padding: '5px 9px', border: '1px solid var(--ims-border)', color: 'var(--ims-text-2)'}}>{label}: <strong style={{color: 'var(--ims-text)'}}>{activityStats.byType[key] || 0}</strong></span>)}
                </div>
              </div>
              {filteredActivities.map(a => <div key={a.id} style={{padding: '13px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', gap: '10px'}}>
                  <div><strong>{a.hospital}</strong><div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{a.date} · {a.byName || a.by} · {lang === 'id' ? 'terkirim' : 'sent'} {String(a.submittedAt || a.createdAt || '').slice(0, 16).replace('T', ' ') || '-'}</div></div>
                  {canEdit && <div><button onClick={() => setForm(a)} className="btn-ghost" style={{fontSize: '10px', padding: '4px 7px'}}><Edit2 size={10} /></button><button onClick={() => setDeleteActivityId(a.id)} className="btn-ghost" style={{fontSize: '10px', padding: '4px 7px', color: '#c03030'}}><Trash2 size={10} /></button></div>}
                </div>
                <div style={{fontSize: '11px', lineHeight: 1.6, marginTop: '8px'}}><strong>Produk:</strong> {[a.modality, a.brand, a.type].filter(Boolean).join(' · ') || '-'}<br/><strong>Activity:</strong> {activityTypeLabels[a.activityType] || a.activityType || '-'}<br/><strong>Catatan:</strong> {a.note || '-'}<br/><strong>Kompetitor:</strong> {a.competitor || '-'}</div>
                {a.attachmentUrl && <LinkAttachment url={a.attachmentUrl} lang={lang} />}
              </div>)}
              {filteredActivities.length === 0 && <div className="empty-state">{lang === 'id' ? 'Belum ada laporan Product Support sesuai filter.' : 'No Product Support reports match the filters.'}</div>}
            </div>
          </div>
        </div>
      )}
      {tab === 'files' && (
        <div>
          <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '860px'}}>
              <thead><tr style={{background: 'var(--ims-bg-card-2)'}}><Th>Modalitas</Th><Th>Tipe</Th><Th>Brand</Th><Th>Principal</Th><Th align="right">Download File</Th></tr></thead>
              <tbody>{productFileRows.map(p => {
                return (
                  <tr key={p.id} style={{borderTop: '1px solid var(--ims-border)'}}>
                    <Td>{p.modality}</Td>
                    <Td>{p.type}</Td>
                    <Td>{p.brand}</Td>
                    <Td>{p.principal}</Td>
                    <Td align="right">
                      <div style={{position: 'relative', display: 'inline-flex'}}>
                        <button onClick={() => setDownloadMenuProductId(downloadMenuProductId === p.id ? null : p.id)} className="btn-ghost" style={{fontSize: '10px'}}><Download size={10} />Download</button>
                        {downloadMenuProductId === p.id && (
                          <div style={{position: 'absolute', right: 0, top: '34px', zIndex: 20, minWidth: '190px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', boxShadow: '0 12px 24px rgba(0,0,0,0.25)'}}>
                            {p.fileEntries.map(file => (
                              <button key={file.key} disabled={!file.url} onClick={() => { openProductFile(file.url); setDownloadMenuProductId(null); }} style={{display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: '1px solid var(--ims-border)', color: file.url ? 'var(--ims-text)' : 'var(--ims-text-2)', opacity: file.url ? 1 : 0.45, padding: '8px 10px', fontSize: '11px', cursor: file.url ? 'pointer' : 'not-allowed', fontFamily: 'inherit'}}>{file.label}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    </Td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        </div>
      )}
      {tab === 'training' && (
        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
          {upcomingTraining.map(r => <div key={r.id} style={{padding: '13px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
            <div style={{fontWeight: 700}}>{r.customer}</div>
            <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '3px'}}>{r.modality} · {r.subModality} · Jadwal teknisi: <span className="mono">{r.sessionDate}</span></div>
            <div style={{fontSize: '11px', marginTop: '6px'}}>Instruktur: {resolveNamesInText(employees, r.instructor) || '-'}</div>
          </div>)}
          {upcomingTraining.length === 0 && <div className="empty-state">{lang === 'id' ? 'Belum ada jadwal training dari Instalasi' : 'No training schedule from Installation yet'}</div>}
        </div>
      )}
      <ConfirmDialog open={!!deleteActivityId} title="Hapus aktivitas?" message="Data aktivitas ini akan dihapus." onConfirm={() => { setActivities(prev => prev.filter(a => a.id !== deleteActivityId)); setDeleteActivityId(null); }} onCancel={() => setDeleteActivityId(null)} danger lang={lang} />
    </div>
  );
}

function LifecycleKpiScorecard({ data, employees, session, t, lang, fmt }) {
  const [kpiTab, setKpiTab] = useState('scorecard');
  const [roleFilter, setRoleFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const employeeList = useMemo(() => Object.entries(employees || {})
    .filter(([username, emp]) => emp.active !== false)
    .map(([username, emp]) => ({ username, ...emp }))
    .sort((a, b) => a.name.localeCompare(b.name)), [employees]);
  const roleOptions = [
    { id: 'all', label: lang === 'id' ? 'Semua Karyawan' : 'All Employees' },
    { id: 'sales', label: 'Sales' },
    { id: 'admin', label: 'Admin' },
    { id: 'operations', label: lang === 'id' ? 'Operasional' : 'Operations' },
    { id: 'technician', label: lang === 'id' ? 'Teknisi' : 'Technician' },
    { id: 'regulatory', label: 'Regulatory' },
    { id: 'finance', label: 'Finance' },
    { id: 'product_specialist', label: 'Product Specialist' },
    { id: 'security', label: 'Security' },
    { id: 'office_support', label: 'Office Support' },
    { id: 'other', label: lang === 'id' ? 'Lainnya' : 'Other' },
  ];
  const filteredEmployees = useMemo(() => employeeList.filter(emp => {
    if (roleFilter === 'all') return true;
    if (roleFilter === 'other') return !roleOptions.some(r => r.id === emp.role);
    return emp.role === roleFilter;
  }), [employeeList, roleFilter]);
  const selectedEmployee = employeeFilter === 'all' ? null : employeeList.find(e => e.username === employeeFilter);
  const scoreEmployees = selectedEmployee ? [selectedEmployee] : filteredEmployees;
  const activeRole = selectedEmployee?.role || roleFilter;
  const rows = useMemo(() => data.map(s => {
    const history = s.stageHistory || [];
    const first = history[0]?.at || s.sphRequestedAt || s.issuedDate;
    const last = s.bastDate || s.dpConfirmedAt || s.principalPoSentAt || s.lastUpdate || s.issuedDate;
    const totalDays = first && last ? Math.max(0, Math.round((new Date(last) - new Date(first)) / 86400000)) : 0;
    const blockedStage = s.customsStatus === 'hold' ? 'Customs hold' : s.sphWorkflowStatus === 'requested' ? 'Admin SPH' : s.sphWorkflowStatus === 'dp_claimed_paid' ? 'Finance cek DP' : s.stage;
    return { ...s, totalDays, blockedStage };
  }), [data]);
  const scoped = useMemo(() => {
    let arr = session.role === 'sales' && session.salesId ? rows.filter(r => r.salesOwner === session.salesId) : rows;
    const salesIds = filteredEmployees.filter(e => e.role === 'sales').map(e => e.salesId || e.username);
    if (selectedEmployee?.role === 'sales') arr = arr.filter(r => r.salesOwner === (selectedEmployee.salesId || selectedEmployee.username));
    else if (roleFilter === 'sales') arr = arr.filter(r => salesIds.includes(r.salesOwner));
    else if (activeRole === 'admin') arr = arr.filter(r => ['requested', 'admin_drafting', 'ready_for_sales'].includes(r.sphWorkflowStatus) || r.stage === 'sph_sent');
    else if (activeRole === 'finance') arr = arr.filter(r => ['po_issued', 'invoice_ready', 'dp_claimed_paid', 'dp_confirmed'].includes(r.sphWorkflowStatus) || r.poStatus === 'issued');
    else if (activeRole === 'operations') arr = arr.filter(r => ['dp_confirmed', 'principal_po_sent', 'factory_po_sent', 'factory_dp_paid', 'factory_production', 'factory_production_done', 'goods_sent_client', 'goods_received_client', 'local_delivery'].includes(r.sphWorkflowStatus) || ['plan_order', 'factory_production', 'ready_to_ship', 'on_shipment', 'arrived_clearance', 'sent_client', 'client_received', 'delivered'].includes(r.shippingStatus));
    else if (activeRole === 'technician') arr = arr.filter(r => r.poStatus === 'issued' || ['local_delivery', 'installed_bast'].includes(r.sphWorkflowStatus) || r.installationStatus);
    else if (activeRole === 'regulatory') arr = arr.filter(r => r.modality && ['CT Scan', 'C-Arm', 'Mammography', 'X-Ray', 'MRI'].some(m => String(r.modality).includes(m)));
    else if (activeRole === 'product_specialist') arr = arr.filter(r => r.stage === 'presentation_scheduled' || r.stage === 'presentation_done' || r.tenderSubStage === 'presentation' || r.trainingCert);
    else if (['security', 'office_support'].includes(activeRole)) arr = [];
    return arr;
  }, [rows, session, filteredEmployees, selectedEmployee, roleFilter, activeRole]);
  const byPic = useMemo(() => {
    const map = new Map();
    scoped.forEach(r => {
      const key = r.salesOwner || 'unknown';
      if (!map.has(key)) map.set(key, { pic: key, count: 0, totalDays: 0, won: 0, lost: 0, value: 0 });
      const m = map.get(key);
      m.count++; m.totalDays += r.totalDays; m.value += Number(r.totalValue) || 0;
      if (r.status === 'won') m.won++; if (r.status === 'lost') m.lost++;
    });
    return Array.from(map.values()).map(m => ({ ...m, avgDays: m.count ? Math.round(m.totalDays / m.count) : 0, winRate: (m.won + m.lost) ? (m.won / (m.won + m.lost) * 100) : 0 })).sort((a, b) => b.value - a.value);
  }, [scoped]);
  const avgDays = scoped.length ? Math.round(scoped.reduce((sum, r) => sum + r.totalDays, 0) / scoped.length) : 0;
  const roleKpis = useMemo(() => {
    const won = scoped.filter(s => s.status === 'won').length;
    const active = scoped.filter(s => s.status === 'active').length;
    const poIssued = scoped.filter(s => s.poStatus === 'issued').length;
    const pendingAdmin = scoped.filter(s => ['requested', 'admin_drafting'].includes(s.sphWorkflowStatus)).length;
    const financeDue = scoped.filter(s => ['po_issued', 'dp_claimed_paid', 'invoice_ready'].includes(s.sphWorkflowStatus)).length;
    const opsDue = scoped.filter(s => ['dp_confirmed', 'principal_po_sent', 'factory_po_sent', 'factory_dp_paid', 'factory_production', 'factory_production_done', 'goods_sent_client', 'goods_received_client', 'local_delivery'].includes(s.sphWorkflowStatus) || ['plan_order', 'factory_production', 'ready_to_ship', 'on_shipment', 'arrived_clearance', 'sent_client', 'client_received', 'loading', 'shipped', 'arrived'].includes(s.shippingStatus)).length;
    const regDue = scoped.filter(s => s.modality && ['CT Scan', 'C-Arm', 'Mammography', 'X-Ray', 'MRI'].some(m => s.modality.includes(m))).length;
    const installDue = scoped.filter(s => s.poStatus === 'issued' && s.status === 'won').length;
    const defs = {
      all: [['Cycle Time', `${avgDays || 0} hari`, 'Request SPH sampai status terakhir'], ['Bottleneck Aktif', scoped.filter(s => ['requested', 'dp_claimed_paid'].includes(s.sphWorkflowStatus) || s.customsStatus === 'hold').length, 'Stage yang perlu eskalasi'], ['PO Terbit', poIssued, 'Proyek menang lintas modul']],
      sales: [['Win Rate', `${byPic.length ? Math.round(byPic.reduce((sum, p) => sum + p.winRate, 0) / byPic.length) : 0}%`, 'Menang vs kalah'], ['Follow-up DP', scoped.filter(s => ['invoice_ready', 'dp_followup', 'dp_claimed_paid'].includes(s.sphWorkflowStatus)).length, 'Invoice sampai DP diterima'], ['Nilai Pipeline', fmt(scoped.reduce((sum, s) => sum + (Number(s.totalValue) || 0), 0)), 'Pipeline/PO PIC sales']],
      admin: [['Request SPH', pendingAdmin, 'Antrian SPH yang harus dibuat'], ['SPH Ready', scoped.filter(s => s.sphWorkflowStatus === 'ready_for_sales').length, 'SPH selesai dibuat dan dikirim ke sales'], ['Akurasi Data', 'Master-linked', 'Produk dan sales ditarik dari master data']],
      finance: [['Dokumen Finance', financeDue, 'Invoice/Kwitansi/KP dan cek DP'], ['DP Confirmed', scoped.filter(s => s.sphWorkflowStatus === 'dp_confirmed').length, 'DP diterima dan siap PO principal'], ['Reminder Tagihan', scoped.filter(s => s.bastDate || s.bastDone).length, 'Reminder termin setelah BAST']],
      operations: [['PO Principal/Shipping', opsDue, 'PO principal sampai local delivery'], ['Customs Hold', scoped.filter(s => s.customsStatus === 'hold').length, 'Dokumen tertahan Bea Cukai'], ['Local Trucking', scoped.filter(s => s.sphWorkflowStatus === 'local_delivery').length, 'ETA pengiriman lokal']],
      technician: [['Instalasi/BAST', installDue, 'PO menang yang masuk alur instalasi'], ['Training Produk', scoped.filter(s => s.trainingCert).length, 'Training yang harus dijadwalkan/dilaporkan'], ['Sync PIC', 'Riwayat instalasi', 'Instruktur dan BAST wajib tarik teknisi instalasi']],
      regulatory: [['Izin Terkait Produk', regDue, 'Produk radiologi yang membutuhkan regulatory'], ['PNBP Trigger', 'Aktif', 'Notifikasi Finance saat PNBP terbit'], ['Pipeline Compliance', '6 stage', 'Dokumen sampai izin terbit']],
      product_specialist: [['Presentasi Produk', scoped.filter(s => s.stage === 'presentation_scheduled' || s.tenderSubStage === 'presentation').length, 'Notifikasi jadwal presentasi'], ['Training Produk', scoped.filter(s => s.trainingCert).length, 'Koordinasi training dari teknisi'], ['Support Activity', 'Terekam', 'Visit, isu kompetitor, solusi, file produk']],
      security: [['Kedisiplinan Laporan', 'N/A', 'Parameter operasional non-project'], ['Kehadiran/Shift', 'N/A', 'Perlu modul attendance jika ingin otomatis'], ['Compliance', 'N/A', 'Tidak terkait SPH langsung']],
      office_support: [['Dukungan Operasional', 'N/A', 'Parameter non-project'], ['Respons Tugas', 'N/A', 'Perlu modul task/attendance jika ingin otomatis'], ['Compliance', 'N/A', 'Tidak terkait SPH langsung']],
      other: [['Kontribusi Umum', active + won, 'Aktivitas lintas modul'], ['Bottleneck', scoped.filter(s => s.totalDays > avgDays && avgDays > 0).length, 'Proyek di atas rata-rata durasi'], ['Kolaborasi', filteredEmployees.length, 'Jumlah karyawan dalam filter']],
    };
    return defs[roleFilter] || defs.all;
  }, [scoped, roleFilter, avgDays, byPic, fmt, filteredEmployees]);
  const bottlenecks = [...scoped].sort((a, b) => b.totalDays - a.totalDays).slice(0, 12);
  const roleKpiStandards = {
    sales: ['Revenue & win rate', 'CRM discipline', 'Customer follow-up', 'Forecast accuracy'],
    admin: ['Document SLA', 'Data accuracy', 'Template compliance', 'Internal service quality'],
    finance: ['AR collection', 'Invoice accuracy', 'Cash reporting', 'Compliance & control'],
    operations: ['OTD logistics', 'Customs resolution', 'ETA accuracy', 'Supplier coordination'],
    technician: ['Installation SLA', 'First-time-right', 'BAST completion', 'Training handover'],
    regulatory: ['Permit SLA', 'PNBP readiness', 'Submission quality', 'Regulatory compliance'],
    product_specialist: ['Presentation support', 'Product knowledge base', 'Competitor intelligence', 'Training delivery'],
    security: ['Attendance discipline', 'Incident prevention', 'Facility compliance', 'Response time'],
    office_support: ['Task completion', 'Internal service SLA', 'Asset readiness', 'Administrative accuracy'],
    other: ['Task delivery', 'Collaboration', 'Compliance', 'Continuous improvement'],
  };
  const divisionBottleneckRows = useMemo(() => {
    const source = scoped.length ? scoped : rows;
    const mk = (module, parameter, days, pic, note) => ({ id: `${module}_${parameter}_${pic}`, module, parameter, days, pic, note });
    const maps = {
      all: [...source].sort((a, b) => b.totalDays - a.totalDays).slice(0, 12).map(r => mk('SPH Lifecycle', r.blockedStage, r.totalDays, resolveEmpName(employees, r.salesOwner), r.customer)),
      sales: source.filter(s => ['invoice_ready', 'dp_followup', 'dp_claimed_paid'].includes(s.sphWorkflowStatus) || s.status === 'active').slice(0, 12).map(s => mk('Sales', 'Follow-up customer / closing discipline', s.totalDays, resolveEmpName(employees, s.salesOwner), s.customer)),
      admin: source.filter(s => ['requested', 'admin_drafting', 'ready_for_sales'].includes(s.sphWorkflowStatus)).slice(0, 12).map(s => mk('Admin', 'SLA dokumen SPH/SPP & akurasi input', s.totalDays, 'Admin', s.customer)),
      finance: source.filter(s => s.poStatus === 'issued' || ['invoice_ready', 'dp_claimed_paid', 'dp_confirmed'].includes(s.sphWorkflowStatus)).slice(0, 12).map(s => mk('Finance', s.dpPaid ? 'AR / termin monitoring' : 'Cek DP & invoice accuracy', s.totalDays, 'Finance', s.customer)),
      operations: source.filter(s => s.poStatus === 'issued' || s.shippingStatus || s.customsStatus).slice(0, 12).map(s => mk('Operations', s.customsStatus === 'hold' ? 'Customs hold resolution' : 'ETA, shipment, local trucking', s.totalDays, 'Operations', s.customer)),
      technician: source.filter(s => s.poStatus === 'issued' || s.installationStatus).slice(0, 12).map(s => mk('Installation', s.bastDate ? 'Training handover readiness' : 'Installation SLA & BAST completion', s.totalDays, 'Teknisi', s.customer)),
      regulatory: source.filter(s => s.modality).slice(0, 12).map(s => mk('Regulatory', s.utilizationPermitDoneAt ? 'Permit archive completeness' : 'Permit SLA / PNBP readiness', s.totalDays, 'Regulatory', s.customer)),
      product_specialist: source.filter(s => s.stage === 'presentation_scheduled' || s.tenderSubStage === 'presentation' || s.trainingCert).slice(0, 12).map(s => mk('Product Support', 'Presentation, competitor intelligence, training support', s.totalDays, 'Product Specialist', s.customer)),
      security: [mk('Security', 'Attendance discipline & incident prevention', 0, 'Security', 'Gunakan modul attendance/shift untuk otomasi penuh'), mk('Security', 'Visitor/vendor access log accuracy', 0, 'Security', 'Parameter non-SPH')],
      office_support: [mk('Office Support', 'Task completion & internal service SLA', 0, 'Office Support', 'Gunakan modul task untuk otomasi penuh'), mk('Office Support', 'Asset readiness and admin accuracy', 0, 'Office Support', 'Parameter non-SPH')],
      other: [mk('General', 'Collaboration & compliance score', 0, 'PIC terkait', 'Parameter lintas modul')],
    };
    return maps[activeRole] || maps.all;
  }, [activeRole, scoped, rows, employees]);
  const kpiCriteria = useMemo(() => {
    const map = {
      all: 'Cycle time lintas modul, jumlah bottleneck aktif, dan PO terbit.',
      sales: 'Win rate, nilai pipeline, follow-up DP, dan durasi dari SPH sampai closing.',
      admin: 'Kecepatan request SPH diproses, SPH ready dikirim ke sales, dan akurasi master data.',
      finance: 'Invoice/AR/cek DP, konfirmasi pembayaran, dan reminder tagihan setelah BAST.',
      operations: 'PO principal, shipping, customs, local trucking, dan update ETA.',
      technician: 'Kesiapan instalasi, BAST, training produk, dan sinkronisasi teknisi pelaksana.',
      regulatory: 'Progress izin produk, PNBP trigger ke Finance, dan waktu sampai izin terbit.',
      product_specialist: 'Jadwal presentasi, activity report, dukungan training, dan kelengkapan file produk.',
      security: 'Belum terkait langsung dengan SPH; butuh modul attendance/shift untuk KPI otomatis.',
      office_support: 'Belum terkait langsung dengan SPH; butuh modul task/attendance untuk KPI otomatis.',
      other: 'Kontribusi umum lintas modul dan aktivitas yang tercatat.',
    };
    return map[activeRole] || map.all;
  }, [activeRole]);
  const employeeScoreRows = useMemo(() => {
    return scoreEmployees.map(emp => {
      const roleLabel = roleOptions.find(r => r.id === emp.role)?.label || emp.role;
      const standards = roleKpiStandards[emp.role] || roleKpiStandards.other;
      const scoreBase = emp.role === 'admin' ? scoped.filter(s => ['requested', 'admin_drafting', 'ready_for_sales'].includes(s.sphWorkflowStatus)).length
        : emp.role === 'finance' ? scoped.filter(s => ['invoice_ready', 'dp_claimed_paid', 'dp_confirmed'].includes(s.sphWorkflowStatus)).length
        : emp.role === 'operations' ? scoped.filter(s => ['principal_po_sent', 'factory_po_sent', 'factory_dp_paid', 'factory_production', 'factory_production_done', 'goods_sent_client', 'goods_received_client', 'local_delivery'].includes(s.sphWorkflowStatus) || ['plan_order', 'factory_production', 'ready_to_ship', 'on_shipment', 'arrived_clearance', 'sent_client', 'client_received', 'loading', 'shipped', 'arrived'].includes(s.shippingStatus)).length
        : emp.role === 'technician' ? scoped.filter(s => s.poStatus === 'issued' && s.status === 'won').length
        : emp.role === 'regulatory' ? scoped.filter(s => s.modality).length
        : emp.role === 'product_specialist' ? scoped.filter(s => s.stage === 'presentation_scheduled' || s.tenderSubStage === 'presentation').length
        : 0;
      const output = Math.min(100, 65 + scoreBase * 5);
      const quality = emp.role === 'sales' ? Math.min(100, 70 + (scoped.filter(s => s.status === 'won').length * 2)) : 86;
      const timeliness = Math.max(55, 100 - Math.min(40, avgDays / 5));
      const collaboration = ['security', 'office_support', 'other'].includes(emp.role) ? 82 : 88;
      const score = Math.round(output * 0.40 + quality * 0.25 + timeliness * 0.20 + collaboration * 0.15);
      return { username: emp.username, name: emp.name, role: emp.role, roleLabel, primary: standards.join(' · '), scoreBase, output, quality, timeliness: Math.round(timeliness), collaboration, score };
    });
  }, [scoreEmployees, roleOptions, scoped, avgDays]);
  const salesScoreRows = useMemo(() => byPic.map(r => ({
    username: r.pic,
    name: resolveEmpName(employees, r.pic),
    role: 'sales',
    roleLabel: 'Sales',
    primary: 'Revenue & win rate · CRM discipline · Customer follow-up · Forecast accuracy',
    scoreBase: r.count,
    output: Math.min(100, 60 + r.count * 3),
    quality: Math.round(r.winRate || 0),
    timeliness: Math.max(55, 100 - Math.min(40, r.avgDays / 4)),
    collaboration: 88,
    score: Math.round(Math.min(100, 60 + r.count * 3) * 0.40 + (r.winRate || 0) * 0.25 + Math.max(55, 100 - Math.min(40, r.avgDays / 4)) * 0.20 + 88 * 0.15),
    value: r.value,
  })), [byPic, employees]);
  const displayScoreRows = (roleFilter === 'sales' || selectedEmployee?.role === 'sales') ? salesScoreRows : employeeScoreRows;
  const dashboardRoleData = useMemo(() => roleOptions.filter(r => r.id !== 'all' && r.id !== 'other').map(r => ({
    role: r.label,
    count: employeeList.filter(e => e.role === r.id).length,
    avgScore: Math.round((employeeScoreRows.filter(e => e.role === r.id).reduce((sum, e) => sum + e.score, 0) / Math.max(1, employeeScoreRows.filter(e => e.role === r.id).length)) || 0),
  })).filter(r => r.count > 0), [roleOptions, employeeList, employeeScoreRows]);
  const scoreBandData = useMemo(() => [
    { name: 'Excellent', value: displayScoreRows.filter(r => r.score >= 90).length, color: 'var(--ims-accent-2)' },
    { name: 'Good', value: displayScoreRows.filter(r => r.score >= 80 && r.score < 90).length, color: 'var(--ims-accent)' },
    { name: 'Watchlist', value: displayScoreRows.filter(r => r.score < 80).length, color: '#c03030' },
  ], [displayScoreRows]);
  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_kpi_scorecard || 'KPI Scorecard'}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, margin: 0}}>{lang === 'id' ? 'Project Lifecycle & KPI Scorecard' : 'Project Lifecycle & KPI Scorecard'}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{lang === 'id' ? 'Balanced scorecard lintas divisi: output, quality, timeliness, collaboration, serta bottleneck operasional.' : 'Balanced scorecard across divisions: output, quality, timeliness, collaboration, and operational bottlenecks.'}</div>
      </div>
      <div style={{display: 'flex', gap: '2px', marginBottom: '16px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {[
          { id: 'scorecard', label: lang === 'id' ? 'Scorecard Detail' : 'Detailed Scorecard', icon: ClipboardList },
          { id: 'dashboard', label: lang === 'id' ? 'Dashboard KPI Semua Karyawan' : 'All Employee KPI Dashboard', icon: FileBarChart },
        ].map(tb => {
          const Icon = tb.icon; const active = kpiTab === tb.id;
          return <button key={tb.id} onClick={() => setKpiTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 600, color: active ? 'var(--ims-accent)' : 'var(--ims-text-2)', borderBottom: active ? '2px solid var(--ims-accent)' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px'}}><Icon size={14} />{tb.label}</button>;
        })}
      </div>
      {kpiTab === 'dashboard' && (
        <div style={{display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '18px', marginBottom: '22px'}}>
          <div style={{padding: '16px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', minHeight: '330px'}}>
            <div className="card-title">{lang === 'id' ? 'Rata-rata Score per Divisi' : 'Average Score by Division'}</div>
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={dashboardRoleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,150,190,0.22)" />
                <XAxis dataKey="role" tick={{fontSize: 10, fill: 'var(--ims-text-2)'}} interval={0} angle={-20} textAnchor="end" height={72} />
                <YAxis domain={[0, 100]} tick={{fontSize: 10, fill: 'var(--ims-text-2)'}} />
                <Tooltip />
                <Bar dataKey="avgScore" fill="var(--ims-accent)" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{padding: '16px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', minHeight: '330px'}}>
            <div className="card-title">{lang === 'id' ? 'Distribusi Score' : 'Score Distribution'}</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={scoreBandData} dataKey="value" nameKey="name" outerRadius={86} label>
                  {scoreBandData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--ims-border)', marginTop: '12px'}}>
              {scoreBandData.map(d => <div key={d.name} style={{padding: '10px', background: 'var(--ims-bg-card-2)'}}><div className="lbl-tag">{d.name}</div><div className="serif" style={{fontSize: '22px', color: d.color}}>{d.value}</div></div>)}
            </div>
          </div>
        </div>
      )}
      <div style={{display: 'grid', gridTemplateColumns: '220px 1fr', gap: '10px', marginBottom: '16px', padding: '12px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
        <Field label={lang === 'id' ? 'Filter Divisi' : 'Division Filter'}>
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setEmployeeFilter('all'); }}>
            {roleOptions.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </Field>
        <Field label={lang === 'id' ? 'Nama Karyawan' : 'Employee Name'}>
          <select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)}>
            <option value="all">{lang === 'id' ? 'Semua karyawan dalam filter' : 'All employees in filter'}</option>
            {filteredEmployees.map(emp => <option key={emp.username} value={emp.username}>{emp.name} · {roleOptions.find(r => r.id === emp.role)?.label || emp.role}</option>)}
          </select>
        </Field>
      </div>
      <div style={{marginBottom: '16px', padding: '12px 14px', background: 'rgba(26,41,66,0.04)', borderLeft: '3px solid var(--ims-border)', fontSize: '12px', color: 'var(--ims-text)', lineHeight: 1.6}}>
        <strong>{lang === 'id' ? 'Kriteria penilaian:' : 'Scoring criteria:'}</strong> {kpiCriteria}
        <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{lang === 'id' ? 'Tabel bottleneck di kanan mengikuti filter divisi/karyawan yang dipilih.' : 'The bottleneck table follows the selected division/employee filter.'}</div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        {roleKpis.map(([label, value, note]) => (
          <div key={label} style={{padding: '15px 16px', background: 'var(--ims-bg-card)'}}>
            <div className="lbl-tag">{label}</div>
            <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent)'}}>{value}</div>
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{note}</div>
          </div>
        ))}
      </div>
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <KPICard label="Total Proyek" value={scoped.length} sublabel="SPH lifecycle" />
        <KPICard label="Rata-rata Durasi" value={`${avgDays} hari`} sublabel="request ke status terakhir" />
        <KPICard label="PO Terbit" value={scoped.filter(s => s.poStatus === 'issued').length} sublabel={fmt(scoped.filter(s => s.poStatus === 'issued').reduce((sum, s) => sum + (Number(s.totalValue) || 0), 0))} />
        <KPICard label="Perlu Follow-up" value={scoped.filter(s => ['requested', 'dp_claimed_paid'].includes(s.sphWorkflowStatus) || s.customsStatus === 'hold').length} sublabel="bottleneck aktif" />
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px'}}>
        <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
          <div className="card-title" style={{padding: '14px 16px', margin: 0}}>{roleFilter === 'sales' || selectedEmployee?.role === 'sales' ? (lang === 'id' ? 'Scorecard PIC Sales' : 'Sales PIC Scorecard') : (lang === 'id' ? 'Scorecard Karyawan / Divisi' : 'Employee / Division Scorecard')}</div>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '760px'}}><thead><tr style={{background: 'var(--ims-bg-card-2)'}}><Th>Karyawan</Th><Th>Divisi</Th><Th>Parameter MNC</Th><Th align="right">Output</Th><Th align="right">Quality</Th><Th align="right">Timeliness</Th><Th align="right">Score</Th></tr></thead>
            <tbody>{displayScoreRows.map(r => <tr key={r.username} style={{borderTop: '1px solid var(--ims-border)'}}><Td>{r.name}</Td><Td>{r.roleLabel}</Td><Td>{r.primary}</Td><Td align="right">{r.output}</Td><Td align="right">{r.quality}</Td><Td align="right">{r.timeliness}</Td><Td align="right"><strong style={{color: r.score >= 90 ? 'var(--ims-accent-2)' : r.score >= 80 ? 'var(--ims-accent)' : '#c03030'}}>{r.score}</strong></Td></tr>)}</tbody></table>
        </div>
        <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
          <div className="card-title" style={{padding: '14px 16px', margin: 0}}>{lang === 'id' ? 'Bottleneck Terpanjang' : 'Longest Bottlenecks'}</div>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px'}}><thead><tr style={{background: 'var(--ims-bg-card-2)'}}><Th>Modul</Th><Th>Parameter</Th><Th align="right">Hari</Th><Th>PIC</Th></tr></thead>
            <tbody>{divisionBottleneckRows.map(r => <tr key={r.id} style={{borderTop: '1px solid var(--ims-border)'}}><Td><div>{r.module}</div><div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{r.note}</div></Td><Td>{r.parameter}</Td><Td align="right">{r.days}</Td><Td>{r.pic}</Td></tr>)}</tbody></table>
        </div>
      </div>
    </div>
  );
}

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
function ExecutiveSummary({ data, reports, annotations, products, t, lang, fmt, session, exchangeRate, employees = {} }) {
  const salesTeam = useMemo(() => getActiveSalesTeam(employees), [employees]);
  const today = new Date();
  // === KPIs — identical formulas to Dashboard ===
  const k = useMemo(() => {
    const active = data.filter(s => s.status === 'active');
    const won = data.filter(s => s.status === 'won');
    const lost = data.filter(s => s.status === 'lost');
    const poIssued = data.filter(s => s.poStatus === 'issued');
    const totalPipeline = active.reduce((sum, s) => sum + (Number(s.totalValue)||0), 0);
    const weightedPipeline = active.reduce((sum, s) => sum + ((Number(s.totalValue)||0) * (Number(s.probability)||0) / 100), 0);
    const revenueYTD = won.reduce((sum, s) => sum + (Number(s.totalValue)||0), 0);
    const poValue = poIssued.reduce((sum, s) => sum + (Number(s.totalValue)||0), 0);
    const winRate = (won.length + lost.length) > 0 ? (won.length / (won.length + lost.length)) * 100 : 0;
    // Unique customers
    const customers = new Set(data.map(s => s.customer)).size;
    return { active, won, lost, poIssued, totalPipeline, weightedPipeline, revenueYTD, poValue, winRate, customers };
  }, [data]);

  // Sales performance — identical to SalesModule
  const salesPerf = useMemo(() => salesTeam.filter(s => !s.isOffice || data.some(d => d.salesOwner === s.id)).map(sales => {
    const sd = data.filter(s => s.salesOwner === sales.id);
    const won = sd.filter(s => s.status === 'won');
    const lost = sd.filter(s => s.status === 'lost');
    return {
      name: sales.name,
      pipeline: sd.filter(s => s.status === 'active').reduce((s, p) => s + (Number(p.totalValue)||0), 0),
      won: won.reduce((s, p) => s + (Number(p.totalValue)||0), 0),
      winRate: (won.length + lost.length) > 0 ? (won.length / (won.length + lost.length)) * 100 : 0,
      poCount: sd.filter(s => s.poStatus === 'issued').length,
    };
  }).sort((a, b) => (b.pipeline + b.won) - (a.pipeline + a.won)), [data]);

  // Modality distribution
  const modalityDist = useMemo(() => {
    const m = {};
    data.filter(s => s.status === 'active' || s.status === 'won').forEach(s => {
      m[s.modality] = (m[s.modality] || 0) + (Number(s.totalValue)||0);
    });
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [data]);

  // Top customers by total value
  const topCustomers = useMemo(() => {
    const c = {};
    data.forEach(s => { c[s.customer] = (c[s.customer] || 0) + (Number(s.totalValue)||0); });
    return Object.entries(c).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [data]);

  // KSO recurring (5-year visibility)
  const ksoTotal = useMemo(() => data.filter(s => s.poStatus === 'issued' && (s.paymentScheme === 'kso' || s.projectType === 'kso')).reduce((sum, s) => sum + (Number(s.totalValue)||0), 0), [data]);

  const doPrint = () => {
    if (typeof window !== 'undefined' && window.print) window.print();
  };

  const totalModalityVal = modalityDist.reduce((s, m) => s + m.value, 0);
  const maxCustomerVal = topCustomers.length > 0 ? topCustomers[0].value : 1;

  return (
    <div>
      {/* Print-specific stylesheet */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #exec-summary-print, #exec-summary-print * { visibility: visible; }
          #exec-summary-print { position: absolute; left: 0; top: 0; width: 100%; padding: 0; }
          .no-print { display: none !important; }
          @page { margin: 1.5cm; size: A4 portrait; }
          .exec-page-break { page-break-before: always; }
          .exec-card { border: 1px solid #ccc !important; box-shadow: none !important; }
        }
      `}</style>

      {/* Screen header + export button */}
      <div className="no-print" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '12px'}}>
        <div>
          <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{lang === 'id' ? 'Paket Investor' : 'Investor Pack'}</div>
          <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{lang === 'id' ? 'Ringkasan Eksekutif' : 'Executive Summary'}</h1>
          <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{lang === 'id' ? 'Ringkasan satu-klik untuk calon investor — siap cetak ke PDF' : 'One-click summary for prospective investors — print-ready to PDF'}</div>
        </div>
        <button onClick={doPrint} style={{background: 'var(--ims-bg-alt)', color: '#fff', border: 'none', padding: '11px 20px', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.03em'}}>
          <Download size={15} strokeWidth={2} />{lang === 'id' ? 'Export ke PDF' : 'Export to PDF'}
        </button>
      </div>

      <div className="no-print" style={{padding: '12px 16px', background: 'var(--ims-gold-bg)', border: '1px solid var(--ims-accent)', marginBottom: '22px', fontSize: '11.5px', color: '#5a4a1a', lineHeight: 1.6}}>
        💡 {lang === 'id'
          ? <>Klik <strong>Export ke PDF</strong> → dialog cetak browser akan terbuka → pilih <strong>"Save as PDF"</strong> sebagai printer. Semua angka di bawah identik dengan Dashboard (satu sumber data, dijamin sinkron).</>
          : <>Click <strong>Export to PDF</strong> → browser print dialog opens → select <strong>"Save as PDF"</strong> as printer. All numbers below are identical to Dashboard (single data source, guaranteed synced).</>}
      </div>

      {/* Printable area */}
      <div id="exec-summary-print">
        {/* Letterhead */}
        <div style={{borderBottom: '3px solid var(--ims-border)', paddingBottom: '16px', marginBottom: '24px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
            <div>
              <div className="serif" style={{fontSize: '26px', fontWeight: 600, color: 'var(--ims-text)', lineHeight: 1.1}}>PT Harmoni Nasional Teknologi Indonesia</div>
              <div style={{fontSize: '12px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{lang === 'id' ? 'Distributor Alat Kesehatan Radiologi · Ringkasan Eksekutif' : 'Radiology Medical Device Distributor · Executive Summary'}</div>
            </div>
            <div style={{textAlign: 'right', fontSize: '11px', color: 'var(--ims-text-2)'}}>
              <div style={{fontWeight: 600, color: 'var(--ims-text)'}}>{today.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div style={{marginTop: '2px'}}>{lang === 'id' ? 'Kurs' : 'Rate'}: Rp {exchangeRate?.toLocaleString('id-ID') || '18.000'}/USD</div>
            </div>
          </div>
        </div>

        {/* KPI grid */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '12px'}}>{lang === 'id' ? 'Indikator Kinerja Utama' : 'Key Performance Indicators'}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px'}}>
          {[
            { label: lang === 'id' ? 'Total Pipeline' : 'Total Pipeline', value: fmt(k.totalPipeline), sub: `${k.active.length} ${lang === 'id' ? 'deal aktif' : 'active deals'}`, color: '#1a4d8a' },
            { label: lang === 'id' ? 'Pipeline Tertimbang' : 'Weighted Pipeline', value: fmt(k.weightedPipeline), sub: lang === 'id' ? 'probabilitas × nilai' : 'probability × value', color: 'var(--ims-accent)' },
            { label: lang === 'id' ? 'Pendapatan (Menang)' : 'Revenue (Won)', value: fmt(k.revenueYTD), sub: `${k.won.length} ${lang === 'id' ? 'deal menang' : 'won deals'}`, color: 'var(--ims-accent-2)' },
            { label: t.win_rate, value: `${k.winRate.toFixed(1)}%`, sub: `${k.won.length}/${k.won.length + k.lost.length} ${lang === 'id' ? 'closing' : 'closed'}`, color: '#7b3fb5' },
          ].map((kpi, i) => (
            <div key={i} className="exec-card" style={{padding: '16px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
              <div style={{fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{kpi.label}</div>
              <div className="serif" style={{fontSize: '20px', fontWeight: 600, marginTop: '6px', color: kpi.color}}>{kpi.value}</div>
              <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '3px'}}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Secondary metrics */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px'}}>
          {[
            { label: lang === 'id' ? 'PO Diterbitkan' : 'PO Issued', value: `${k.poIssued.length}`, sub: fmt(k.poValue) },
            { label: lang === 'id' ? 'Pelanggan Unik' : 'Unique Customers', value: `${k.customers}`, sub: lang === 'id' ? 'RS, klinik, mitra' : 'hospitals, clinics, partners' },
            { label: lang === 'id' ? 'KSO Recurring' : 'KSO Recurring', value: fmt(ksoTotal), sub: lang === 'id' ? 'pendapatan bagi hasil' : 'revenue-share income' },
            { label: lang === 'id' ? 'Produk Aktif' : 'Active Products', value: `${(products || []).filter(p => p.active !== false).length}`, sub: lang === 'id' ? 'di katalog master' : 'in master catalog' },
          ].map((kpi, i) => (
            <div key={i} className="exec-card" style={{padding: '14px', background: 'var(--ims-bg-card-2)', border: '1px solid var(--ims-border)'}}>
              <div style={{fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{kpi.label}</div>
              <div className="serif" style={{fontSize: '18px', fontWeight: 600, marginTop: '4px', color: 'var(--ims-text)'}}>{kpi.value}</div>
              <div style={{fontSize: '9.5px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Sales performance table */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '12px'}}>{lang === 'id' ? 'Kinerja Tim Sales' : 'Sales Team Performance'}</div>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '28px'}}>
          <thead>
            <tr style={{background: 'var(--ims-bg-alt)', color: '#fff'}}>
              <th style={{padding: '8px 10px', textAlign: 'left'}}>Sales</th>
              <th style={{padding: '8px 10px', textAlign: 'right'}}>Pipeline</th>
              <th style={{padding: '8px 10px', textAlign: 'right'}}>{lang === 'id' ? 'Menang' : 'Won'}</th>
              <th style={{padding: '8px 10px', textAlign: 'right'}}>{t.win_rate}</th>
              <th style={{padding: '8px 10px', textAlign: 'right'}}>PO</th>
            </tr>
          </thead>
          <tbody>
            {salesPerf.map((s, i) => (
              <tr key={i} style={{borderBottom: '1px solid var(--ims-border)', background: i % 2 ? 'var(--ims-bg-card)' : '#fff'}}>
                <td style={{padding: '7px 10px', fontWeight: 600, color: 'var(--ims-text)'}}>{s.name}</td>
                <td style={{padding: '7px 10px', textAlign: 'right', fontFamily: 'monospace'}}>{fmt(s.pipeline)}</td>
                <td style={{padding: '7px 10px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--ims-accent-2)'}}>{fmt(s.won)}</td>
                <td style={{padding: '7px 10px', textAlign: 'right', fontFamily: 'monospace'}}>{s.winRate.toFixed(0)}%</td>
                <td style={{padding: '7px 10px', textAlign: 'right', fontFamily: 'monospace'}}>{s.poCount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Page 2 */}
        <div className="exec-page-break"></div>

        {/* Modality distribution + Top customers side by side */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px'}}>
          <div>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '12px'}}>{lang === 'id' ? 'Distribusi Modalitas' : 'Modality Distribution'}</div>
            {modalityDist.map((m, i) => {
              const pct = totalModalityVal > 0 ? (m.value / totalModalityVal) * 100 : 0;
              return (
                <div key={i} style={{marginBottom: '8px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', marginBottom: '2px'}}>
                    <span style={{color: 'var(--ims-text)', fontWeight: 500}}>{m.name}</span>
                    <span style={{color: 'var(--ims-text-2)', fontFamily: 'monospace'}}>{pct.toFixed(0)}%</span>
                  </div>
                  <div style={{height: '7px', background: 'var(--ims-bg-card-2)'}}>
                    <div style={{height: '100%', width: `${pct}%`, background: MODALITY_COLORS[m.name] || '#1a4d8a'}}></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '12px'}}>{lang === 'id' ? 'Pelanggan Teratas' : 'Top Customers'}</div>
            {topCustomers.map((c, i) => {
              const pct = (c.value / maxCustomerVal) * 100;
              return (
                <div key={i} style={{marginBottom: '7px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px'}}>
                    <span style={{color: 'var(--ims-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px'}}>{c.name}</span>
                    <span style={{color: 'var(--ims-text-2)', fontFamily: 'monospace', flexShrink: 0, marginLeft: '6px'}}>{fmt(c.value)}</span>
                  </div>
                  <div style={{height: '6px', background: 'var(--ims-bg-card-2)'}}>
                    <div style={{height: '100%', width: `${pct}%`, background: 'var(--ims-accent)'}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CEO Commentary (annotations) */}
        {annotations && annotations.length > 0 && (
          <div style={{marginBottom: '24px'}}>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '12px'}}>{lang === 'id' ? 'Komentar Manajemen' : 'Management Commentary'}</div>
            {annotations.slice(0, 6).map((a, i) => {
              const sc = ({ positive: 'var(--ims-accent-2)', negative: '#c03030', concern: 'var(--ims-gold)', neutral: '#5b87b8' })[a.sentiment] || 'var(--ims-text-2)';
              return (
                <div key={i} style={{padding: '10px 14px', background: 'var(--ims-bg-card)', borderLeft: `3px solid ${sc}`, marginBottom: '8px', fontSize: '11px', color: 'var(--ims-text)', lineHeight: 1.5}}>
                  <div style={{fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: sc, fontWeight: 600, marginBottom: '3px'}}>{a.target}</div>
                  {a.commentary}
                  <div style={{fontSize: '9px', color: 'var(--ims-text-2)', marginTop: '4px'}}>— {a.author}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer / credentials */}
        <div style={{borderTop: '2px solid var(--ims-border)', paddingTop: '12px', marginTop: '24px', fontSize: '9.5px', color: 'var(--ims-text-2)', lineHeight: 1.6}}>
          <strong style={{color: 'var(--ims-text)'}}>{lang === 'id' ? 'Kredensial Regulasi' : 'Regulatory Credentials'}:</strong> BAPETEN · IDAK · CDAKB · CPAKB · ISO 9001:2015 · IDAK (Izin Distribusi Alat Kesehatan).
          <br/>
          <span style={{fontStyle: 'italic'}}>{lang === 'id' ? 'Dokumen ini dihasilkan otomatis dari sistem IMS HNTI. Semua angka bersumber dari satu basis data tunggal yang tersinkronisasi penuh lintas modul.' : 'This document is auto-generated from IMS HNTI. All figures sourced from a single, fully-synchronized cross-module database.'}</span>
        </div>
      </div>
    </div>
  );
}

// ============== 5-Year Revenue Projection (Catatan #7) ==============
// Metodologi: proyeksi berbasis tren pertumbuhan (compound growth) yang dilandasi:
//   1) Data historis: 2025 aktual (PO terbit) + 2026 estimasi berjalan (PO + pipeline weighted)
//   2) Baseline pasar: CAGR alat imaging Indonesia 6.12% (Grand View Research),
//      alat kesehatan 9.1% (Nexdigm) — HNTI tumbuh di atas pasar karena merebut pangsa
//   3) Tailwind regulasi: UU 17/2023 reklasifikasi RS berbasis kompetensi (Paripurna/Utama/
//      Madya/Dasar) mewajibkan RS Utama punya radiologi canggih → siklus upgrade CT/MRI;
//      KRIS 2025 + Health Transformation Program Rp20T mempercepat belanja modal RS
// Rumus: Revenue(tahun n) = BaseTahun2026 × (1 + g)^(n − 2026), g = laju pertumbuhan skenario
function CashFlowProjection({ data, t, lang, fmt }) {
  const [scenario, setScenario] = useState('realistic'); // conservative | realistic | optimistic
  const [includeKso, setIncludeKso] = useState(true);

  // === STEP 1: Historical base ===
  const base = useMemo(() => {
    // 2025 actual: PO issued in 2025
    const won2025 = data.filter(s => s.poStatus === 'issued' && (s.issuedDate||'').startsWith('2025'))
      .reduce((sum, s) => sum + (Number(s.totalValue)||0), 0);
    // 2026 PO issued YTD
    const po2026 = data.filter(s => s.poStatus === 'issued' && (s.issuedDate||'').startsWith('2026'))
      .reduce((sum, s) => sum + (Number(s.totalValue)||0), 0);
    // 2026 active pipeline weighted (expected to convert this year): value × probability
    const pipeline2026 = data.filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (Number(s.totalValue)||0) * ((Number(s.probability)||0)/100), 0);
    // 2026 full-year estimate = PO YTD + weighted pipeline
    const est2026 = po2026 + pipeline2026;
    // KSO recurring annual (bagi hasil) — sum of KSO contracts' annualized share
    const ksoAnnual = data.filter(s => s.poStatus === 'issued' && (s.projectType === 'kso' || s.paymentScheme === 'kso'))
      .reduce((sum, s) => {
        const total = Number(s.totalValue)||0;
        const dpPct = typeof s.dpPercent === 'number' ? s.dpPercent : 10;
        return sum + (total * (1 - dpPct/100)) / 5; // spread over 5yr, annual portion
      }, 0);
    return { won2025, po2026, pipeline2026, est2026, ksoAnnual };
  }, [data]);

  // === STEP 2: Scenario growth rates (justified by market + regulation) ===
  const SCENARIOS = {
    conservative: { rate: 0.12, label: lang === 'id' ? 'Konservatif' : 'Conservative', color: '#5b87b8',
      basis: lang === 'id' ? 'Pertumbuhan pasar (6–9%) + sedikit rebut pangsa. Asumsi ada hambatan makro/anggaran RS.' : 'Market growth (6–9%) + minor share gain. Assumes macro/budget headwinds.' },
    realistic: { rate: 0.18, label: lang === 'id' ? 'Realistis' : 'Realistic', color: 'var(--ims-text)',
      basis: lang === 'id' ? '≈2× pertumbuhan pasar. Didorong siklus upgrade radiologi akibat reklasifikasi RS berbasis kompetensi (UU 17/2023) + ekspansi model KSO.' : '≈2× market growth. Driven by radiology upgrade cycle from competency-based hospital reclassification (Law 17/2023) + KSO expansion.' },
    optimistic: { rate: 0.25, label: lang === 'id' ? 'Optimis' : 'Optimistic', color: 'var(--ims-accent-2)',
      basis: lang === 'id' ? 'Rebut pangsa agresif + recurring KSO + kemitraan principal baru (ANKE, SG Healthcare, SINO MDT) + KRIS & Program Transformasi Kesehatan Rp20T.' : 'Aggressive share capture + KSO recurring + new principals + KRIS & Rp20T Health Transformation Program.' },
  };
  const g = SCENARIOS[scenario].rate;

  // === STEP 3: Project 2025→2031 ===
  const projection = useMemo(() => {
    const years = [];
    // 2025 actual
    years.push({ year: 2025, value: base.won2025, type: 'actual', label: lang === 'id' ? 'Aktual' : 'Actual' });
    // 2026 estimate (base year for projection)
    const base2026 = base.est2026;
    years.push({ year: 2026, value: base2026, type: 'estimate', label: lang === 'id' ? 'Estimasi Berjalan' : 'Current Estimate' });
    // 2027-2031 projected
    for (let y = 2027; y <= 2031; y++) {
      const n = y - 2026;
      let val = base2026 * Math.pow(1 + g, n);
      if (includeKso) val += base.ksoAnnual * n * 0.5; // KSO recurring compounds modestly
      years.push({ year: y, value: val, type: 'projection', label: lang === 'id' ? 'Proyeksi' : 'Projection' });
    }
    return years;
  }, [base, g, includeKso, lang]);

  // All three scenario trajectories for comparison line
  const allScenarios = useMemo(() => {
    const result = {};
    Object.entries(SCENARIOS).forEach(([key, sc]) => {
      const arr = [];
      for (let y = 2027; y <= 2031; y++) {
        const n = y - 2026;
        let val = base.est2026 * Math.pow(1 + sc.rate, n);
        if (includeKso) val += base.ksoAnnual * n * 0.5;
        arr.push({ year: y, value: val });
      }
      result[key] = arr;
    });
    return result;
  }, [base, includeKso]);

  const cagr2031 = useMemo(() => {
    // implied CAGR from 2026 base to 2031 projected (selected scenario)
    const final = projection[projection.length - 1].value;
    const start = base.est2026;
    if (start <= 0) return 0;
    return (Math.pow(final / start, 1/5) - 1) * 100;
  }, [projection, base]);

  const total5yr = useMemo(() => projection.filter(p => p.type === 'projection').reduce((s, p) => s + p.value, 0), [projection]);
  // FIX (Catatan #3): use a STABLE y-axis scale across all scenarios so that switching to a
  // higher-growth scenario makes bars TALLER (not shorter). Denominator = global max across
  // all scenarios' 2031 + historical, so the chart scale never shrinks when values rise.
  const maxVal = useMemo(() => {
    const scenarioMax = Math.max(...Object.values(allScenarios).flat().map(d => d.value), 1);
    return Math.max(base.won2025, base.est2026, scenarioMax, 1);
  }, [allScenarios, base]);

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{lang === 'id' ? 'Proyeksi' : 'Forecast'}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{lang === 'id' ? 'Proyeksi Pendapatan 5 Tahun' : '5-Year Revenue Projection'}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{lang === 'id' ? 'Berbasis tren pertumbuhan majemuk, dilandasi data historis + baseline pasar + tailwind regulasi' : 'Compound growth model grounded in historical data + market baseline + regulatory tailwind'}</div>
      </div>

      {/* Scenario selector */}
      <div style={{display: 'flex', gap: '10px', marginBottom: '18px', alignItems: 'center', flexWrap: 'wrap', padding: '10px 14px', background: 'rgba(26,41,66,0.03)', border: '1px solid var(--ims-border)'}}>
        <span style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? 'Skenario' : 'Scenario'}:</span>
        {Object.entries(SCENARIOS).map(([key, sc]) => (
          <button key={key} onClick={() => setScenario(key)} style={{padding: '6px 13px', fontSize: '11px', fontFamily: 'inherit', background: scenario === key ? sc.color : 'transparent', color: scenario === key ? '#fff' : sc.color, border: `1px solid ${sc.color}`, cursor: 'pointer', fontWeight: 600}}>{sc.label} (+{(sc.rate*100).toFixed(0)}%/thn)</button>
        ))}
        <label style={{display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '14px', fontSize: '11px', color: 'var(--ims-text)', cursor: 'pointer'}}>
          <input type="checkbox" checked={includeKso} onChange={e => setIncludeKso(e.target.checked)} style={{cursor: 'pointer'}} />
          {lang === 'id' ? 'Sertakan recurring KSO' : 'Include KSO recurring'}
        </label>
      </div>

      {/* KPI cards */}
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <div className="card-pad" style={{background: 'var(--ims-bg-alt)', color: '#fff'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-accent)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Total 2027–2031' : 'Total 2027–2031'}</div>
          <div className="serif" style={{fontSize: '23px', fontWeight: 500, marginTop: '4px', color: '#fff'}}>{fmt(total5yr)}</div>
          <div style={{fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '2px'}}>{SCENARIOS[scenario].label}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Basis 2026' : '2026 Base'}</div>
          <div className="serif" style={{fontSize: '21px', fontWeight: 500, marginTop: '4px', color: '#1a4d8a'}}>{fmt(base.est2026)}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'PO + pipeline weighted' : 'PO + weighted pipeline'}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Laju Pertumbuhan' : 'Growth Rate'}</div>
          <div className="serif" style={{fontSize: '21px', fontWeight: 500, marginTop: '4px', color: SCENARIOS[scenario].color}}>+{(g*100).toFixed(0)}%<span style={{fontSize: '12px'}}>/{lang === 'id' ? 'thn' : 'yr'}</span></div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>CAGR {cagr2031.toFixed(1)}%</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Proyeksi 2031' : '2031 Projection'}</div>
          <div className="serif" style={{fontSize: '21px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent-2)'}}>{fmt(projection[projection.length-1].value)}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{(projection[projection.length-1].value / base.est2026).toFixed(1)}× {lang === 'id' ? 'dari 2026' : 'of 2026'}</div>
        </div>
      </div>

      {/* Bar chart — rising trend */}
      <div style={{padding: '20px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', marginBottom: '20px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '16px'}}>{lang === 'id' ? 'Tren Pendapatan 2025–2031' : 'Revenue Trend 2025–2031'}</div>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: '12px', height: '240px', paddingBottom: '28px', position: 'relative'}}>
          {projection.map(p => {
            const h = (p.value / maxVal) * 100;
            const barColor = p.type === 'actual' ? 'var(--ims-text-2)' : p.type === 'estimate' ? 'var(--ims-gold)' : SCENARIOS[scenario].color;
            return (
              <div key={p.year} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative'}}>
                <div style={{fontSize: '10px', fontWeight: 600, color: 'var(--ims-text)', marginBottom: '4px', whiteSpace: 'nowrap'}}>{fmt(p.value).replace(/\s?Rp\s?/,'').replace('Miliar','M').replace('Triliun','T')}</div>
                <div style={{width: '100%', maxWidth: '64px', height: `${h}%`, background: barColor, transition: 'height 0.3s', borderRadius: '2px 2px 0 0', minHeight: '4px'}} title={`${p.year}: ${fmt(p.value)}`}></div>
                <div style={{position: 'absolute', bottom: '-24px', fontSize: '11px', fontWeight: 600, color: 'var(--ims-text)'}}>{p.year}</div>
                <div style={{position: 'absolute', bottom: '-40px', fontSize: '8px', color: 'var(--ims-text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap'}}>{p.label}</div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop: '24px', display: 'flex', gap: '16px', fontSize: '10px', color: 'var(--ims-text-2)', flexWrap: 'wrap'}}>
          <span><span style={{display: 'inline-block', width: '10px', height: '10px', background: 'var(--ims-text-2)', marginRight: '4px'}}></span>{lang === 'id' ? 'Aktual (2025)' : 'Actual (2025)'}</span>
          <span><span style={{display: 'inline-block', width: '10px', height: '10px', background: 'var(--ims-accent)', marginRight: '4px'}}></span>{lang === 'id' ? 'Estimasi berjalan (2026)' : 'Current estimate (2026)'}</span>
          <span><span style={{display: 'inline-block', width: '10px', height: '10px', background: SCENARIOS[scenario].color, marginRight: '4px'}}></span>{lang === 'id' ? 'Proyeksi (2027–2031)' : 'Projection (2027–2031)'}</span>
        </div>
      </div>

      {/* Scenario comparison table */}
      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto', marginBottom: '20px'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', minWidth: '640px'}}>
          <thead><tr style={{background: 'var(--ims-bg-card-2)'}}>
            <th style={{padding: '10px 14px', textAlign: 'left', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? 'Skenario' : 'Scenario'}</th>
            {[2027,2028,2029,2030,2031].map(y => <th key={y} style={{padding: '10px 14px', textAlign: 'right', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--ims-text-2)', fontWeight: 600}}>{y}</th>)}
          </tr></thead>
          <tbody>
            {Object.entries(SCENARIOS).map(([key, sc]) => (
              <tr key={key} style={{borderTop: '1px solid var(--ims-border)', background: scenario === key ? 'rgba(26,41,66,0.04)' : 'transparent'}}>
                <td style={{padding: '10px 14px', fontWeight: 600, color: sc.color}}>{sc.label} <span style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>+{(sc.rate*100).toFixed(0)}%</span></td>
                {allScenarios[key].map(d => <td key={d.year} style={{padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace', fontSize: '11px'}}>{fmt(d.value).replace(/\s?Rp\s?/,'')}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mathematical & regulatory foundation */}
      <div style={{padding: '18px 20px', background: 'rgba(123,63,181,0.05)', borderLeft: '3px solid #7b3fb5', fontSize: '12px', color: 'var(--ims-text)', lineHeight: 1.75}}>
        <div style={{fontWeight: 700, fontSize: '13px', marginBottom: '10px'}}>📐 {lang === 'id' ? 'Dasar Matematika & Logika Proyeksi' : 'Mathematical & Logical Foundation'}</div>
        <div style={{marginBottom: '10px'}}>
          <strong>{lang === 'id' ? '1. Rumus pertumbuhan majemuk:' : '1. Compound growth formula:'}</strong><br/>
          <span style={{fontFamily: 'monospace', background: 'var(--ims-bg-card)', padding: '2px 8px', display: 'inline-block', marginTop: '4px', border: '1px solid var(--ims-border)'}}>Pendapatan(thn) = Basis₂₀₂₆ × (1 + g)^(thn − 2026)</span>
          <div style={{fontSize: '11px', color: '#5a4a6a', marginTop: '4px'}}>{lang === 'id' ? `Basis 2026 = PO terbit YTD (${fmt(base.po2026)}) + pipeline weighted (${fmt(base.pipeline2026)}) = ${fmt(base.est2026)}. Setiap deal pipeline dibobot probabilitasnya — bukan asumsi semua closing.` : `2026 base = PO issued YTD + weighted pipeline. Each pipeline deal weighted by its probability — not assuming all close.`}</div>
        </div>
        <div style={{marginBottom: '10px'}}>
          <strong>{lang === 'id' ? '2. Laju pertumbuhan (g) — bukan angka asal:' : '2. Growth rate (g) — not arbitrary:'}</strong>
          <div style={{fontSize: '11px', color: '#5a4a6a', marginTop: '4px'}}>{lang === 'id' ? 'Baseline pasar alat imaging Indonesia: CAGR 6,12% (Grand View Research); alat kesehatan: 9,1% (Nexdigm); sistem imaging digital: 8,2% (Insights10). HNTI memproyeksikan tumbuh di ATAS pasar (12–25%) karena merebut pangsa di pasar yang sedang ekspansi struktural.' : 'Indonesia imaging market baseline CAGR: 6.12% (Grand View); medical devices 9.1% (Nexdigm). HNTI projects ABOVE-market (12–25%) by capturing share in a structurally expanding market.'}</div>
        </div>
        <div style={{marginBottom: '10px'}}>
          <strong>{lang === 'id' ? '3. Tailwind regulasi (pendorong permintaan):' : '3. Regulatory tailwind (demand driver):'}</strong>
          <ul style={{margin: '4px 0 0', paddingLeft: '18px', fontSize: '11px', color: '#5a4a6a'}}>
            <li>{lang === 'id' ? 'UU 17/2023: klasifikasi RS bergeser dari kelas A/B/C/D ke berbasis kompetensi (Paripurna, Utama, Madya, Dasar). RS Utama wajib punya "radiologi canggih" (CT, MRI) → siklus upgrade modalitas.' : 'Law 17/2023: hospital classification shifts from class A/B/C/D to competency-based. RS Utama must have advanced radiology (CT, MRI) → modality upgrade cycle.'}</li>
            <li>{lang === 'id' ? 'Sistem rujukan berjenjang berbasis kompetensi → tiap provinsi butuh RS Utama (layanan kanker: CT staging), tiap kabupaten butuh layanan Madya.' : 'Competency-based tiered referral → each province needs RS Utama (cancer: CT staging), each district needs Madya.'}</li>
            <li>{lang === 'id' ? 'KRIS (pengganti kelas BPJS 1/2/3) berlaku penuh 2025 + Program Transformasi Kesehatan Rp20 Triliun (2024) → percepatan belanja modal RS.' : 'KRIS (replacing BPJS class 1/2/3) full 2025 + Rp20T Health Transformation Program (2024) → accelerated hospital capex.'}</li>
          </ul>
        </div>
        <div style={{fontSize: '10.5px', color: 'var(--ims-text-2)', fontStyle: 'italic', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--ims-border)'}}>
          {lang === 'id' ? 'Catatan kejujuran: proyeksi adalah estimasi, bukan jaminan. Skenario konservatif (×0,7 dari realistis) disediakan agar investor dapat stress-test. Data historis terbatas pada 2025–2026 (sistem baru go-live); seiring bertambahnya data tahunan, akurasi proyeksi akan meningkat.' : 'Honesty note: projections are estimates, not guarantees. Conservative scenario provided for investor stress-testing. Historical data limited to 2025–2026 (new system go-live); accuracy improves as annual data accumulates.'}
        </div>
      </div>
    </div>
  );
}


// CEO annotations — dipakai Executive Summary (baca dari storage)
function ProductMasterModule({ products, setProducts, t, lang, canEdit, logAction, data }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [filterModality, setFilterModality] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterOrigin, setFilterOrigin] = useState('all');
  const [filterActive, setFilterActive] = useState('all');
  const [deleteId, setDeleteId] = useState(null);

  // Derive filter options from data
  const modalities = useMemo(() => [...new Set(products.map(p => p.modality).filter(Boolean))].sort(), [products]);
  const brands = useMemo(() => [...new Set(products.map(p => p.brand).filter(Boolean))].sort(), [products]);
  const origins = useMemo(() => [...new Set(products.map(p => p.origin).filter(Boolean))].sort(), [products]);

  // Apply all filters
  const filtered = useMemo(() => products.filter(p => {
    if (filterModality !== 'all' && p.modality !== filterModality) return false;
    if (filterBrand !== 'all' && p.brand !== filterBrand) return false;
    if (filterOrigin !== 'all' && p.origin !== filterOrigin) return false;
    if (filterActive === 'active' && !p.active) return false;
    if (filterActive === 'inactive' && p.active) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.name?.toLowerCase().includes(q) &&
          !p.brand?.toLowerCase().includes(q) &&
          !p.type?.toLowerCase().includes(q) &&
          !p.principal?.toLowerCase().includes(q) &&
          !p.modality?.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [products, search, filterModality, filterBrand, filterOrigin, filterActive]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const activeProducts = products.filter(p => p.active).length;
    const byOrigin = {};
    products.forEach(p => { if (p.active) byOrigin[p.origin] = (byOrigin[p.origin] || 0) + 1; });
    // Catatan #2: Usage count by STABLE productId (fallback to modality::type for legacy SPH).
    // This keeps SPH counts intact even after product name/type/principal is edited.
    const usage = new Map();
    (data || []).forEach(s => {
      let pid = s.productId;
      if (!pid) {
        const m = products.find(p => p.modality === s.modality && p.type === s.subModality);
        pid = m ? m.id : null;
      }
      if (pid) usage.set(pid, (usage.get(pid) || 0) + 1);
    });
    return { total: products.length, active: activeProducts, inactive: products.length - activeProducts, byOrigin, usage };
  }, [products, data]);

  const handleSave = (prod) => {
    const isEdit = !!editingProduct;
    if (isEdit) {
      const before = editingProduct;
      setProducts(prev => prev.map(p => p.id === prod.id ? prod : p));
      if (logAction) logAction({ module: 'products', action: 'update', entityId: prod.id, entityLabel: prod.name, field: 'product', before: `${before.brand} ${before.type}`, after: `${prod.brand} ${prod.type}` });
    } else {
      const newProd = { ...prod, id: 'prod_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6) };
      setProducts(prev => [...prev, newProd]);
      if (logAction) logAction({ module: 'products', action: 'create', entityId: newProd.id, entityLabel: newProd.name, note: `Brand: ${newProd.brand}, Type: ${newProd.type}, Origin: ${newProd.origin}` });
    }
    setModalOpen(false); setEditingProduct(null);
  };

  const confirmDelete = () => {
    const prod = products.find(p => p.id === deleteId);
    setProducts(prev => prev.filter(p => p.id !== deleteId));
    if (prod && logAction) logAction({ module: 'products', action: 'delete', entityId: deleteId, entityLabel: prod.name, note: 'Permanently removed from master' });
    setDeleteId(null);
  };

  const toggleActive = (id) => {
    if (!canEdit) return;
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    if (logAction) logAction({ module: 'products', action: 'update', entityId: id, entityLabel: prod.name, field: 'active', before: prod.active, after: !prod.active });
  };

  const exportCSV = () => {
    const header = [lang === 'id' ? 'Nama Produk' : 'Product Name', lang === 'id' ? 'Modalitas' : 'Modality', lang === 'id' ? 'Merek' : 'Brand', lang === 'id' ? 'Tipe' : 'Type', lang === 'id' ? 'Asal' : 'Origin', 'Principal', 'TKDN %', 'AKL', ...PRODUCT_FILE_TYPES.map(f => f.label), lang === 'id' ? 'Status' : 'Status', lang === 'id' ? 'Catatan' : 'Notes'];
    const rows = [header, ...filtered.map(p => [p.name, p.modality, p.brand, p.type, p.origin, p.principal, p.tkdn, p.akl, ...PRODUCT_FILE_TYPES.map(f => getProductFileUrl(p, f.key)), p.active ? 'Aktif' : 'Nonaktif', p.notes || ''])];
    downloadCSV(`HNTI_Product_Master_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  const originFlag = (o) => ({ 'China': '🇨🇳', 'Korea': '🇰🇷', 'Taiwan': '🇹🇼', 'Japan': '🇯🇵', 'Germany': '🇩🇪', 'USA': '🇺🇸' })[o] || '🌐';

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '12px'}}>
        <div>
          <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{lang === 'id' ? 'Master Data' : 'Master Data'}</div>
          <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{lang === 'id' ? 'Master Produk' : 'Product Master'}</h1>
          <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{lang === 'id' ? 'Database produk terpusat — tersinkron ke semua modul' : 'Centralized product database — synced to all modules'}</div>
        </div>
        {canEdit && (
          <button onClick={() => { setEditingProduct(null); setModalOpen(true); }} style={{background: 'var(--ims-bg-alt)', color: '#fff', border: 'none', padding: '10px 18px', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '7px', letterSpacing: '0.03em'}}>
            <Plus size={14} strokeWidth={2} />{lang === 'id' ? 'Tambah Produk' : 'Add Product'}
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Total Produk' : 'Total Products'}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{kpis.total}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{kpis.active} {lang === 'id' ? 'aktif' : 'active'} · {kpis.inactive} {lang === 'id' ? 'nonaktif' : 'inactive'}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Modalitas' : 'Modalities'}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#1a4d8a'}}>{modalities.length}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Merek' : 'Brands'}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#7b3fb5'}}>{brands.length}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Negara Asal' : 'Countries'}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent-2)'}}>{origins.length}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{origins.map(o => originFlag(o)).join(' ')}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center', flexWrap: 'wrap'}}>
        <div style={{position: 'relative', flex: '1 1 240px', maxWidth: '340px'}}>
          <Search size={14} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ims-text-2)'}} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === 'id' ? 'Cari nama, merek, tipe...' : 'Search name, brand, type...'} style={{paddingLeft: '36px'}} />
        </div>
        <select value={filterModality} onChange={e => setFilterModality(e.target.value)} style={{width: 'auto', minWidth: '120px'}}>
          <option value="all">{lang === 'id' ? 'Semua Modalitas' : 'All Modalities'}</option>
          {modalities.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} style={{width: 'auto', minWidth: '110px'}}>
          <option value="all">{lang === 'id' ? 'Semua Merek' : 'All Brands'}</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={filterOrigin} onChange={e => setFilterOrigin(e.target.value)} style={{width: 'auto', minWidth: '110px'}}>
          <option value="all">{lang === 'id' ? 'Semua Asal' : 'All Origins'}</option>
          {origins.map(o => <option key={o} value={o}>{originFlag(o)} {o}</option>)}
        </select>
        <select value={filterActive} onChange={e => setFilterActive(e.target.value)} style={{width: 'auto', minWidth: '110px'}}>
          <option value="all">{lang === 'id' ? 'Semua Status' : 'All Status'}</option>
          <option value="active">{lang === 'id' ? 'Aktif' : 'Active'}</option>
          <option value="inactive">{lang === 'id' ? 'Nonaktif' : 'Inactive'}</option>
        </select>
        <button onClick={exportCSV} style={{background: 'var(--ims-accent-2)', border: 'none', color: '#fff', padding: '6px 12px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto'}}>
          <Download size={12} />CSV ({filtered.length})
        </button>
      </div>

      {/* Product table */}
      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', minWidth: '1000px'}}>
          <thead>
            <tr style={{background: 'var(--ims-bg-card-2)'}}>
              <Th>{lang === 'id' ? 'Nama Produk' : 'Product Name'}</Th>
              <Th>{lang === 'id' ? 'Modalitas' : 'Modality'}</Th>
              <Th>{lang === 'id' ? 'Merek' : 'Brand'}</Th>
              <Th>{lang === 'id' ? 'Tipe' : 'Type'}</Th>
              <Th>{lang === 'id' ? 'Asal' : 'Origin'}</Th>
              <Th>Principal</Th>
              <Th align="right">TKDN</Th>
              <Th align="center">{lang === 'id' ? 'File' : 'Files'}</Th>
              <Th align="center">{lang === 'id' ? 'Dipakai' : 'Used'}</Th>
              <Th align="center">{lang === 'id' ? 'Status' : 'Status'}</Th>
              {canEdit && <Th align="center">{lang === 'id' ? 'Aksi' : 'Actions'}</Th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><Td colSpan={canEdit ? 11 : 10}><div className="empty-state">{lang === 'id' ? 'Tidak ada produk yang sesuai filter' : 'No products match filter'}</div></Td></tr>
            )}
            {filtered.map(p => {
              const used = kpis.usage.get(p.id) || 0;
              return (
                <tr key={p.id} className="hover-row" style={{borderTop: '1px solid var(--ims-border)', opacity: p.active ? 1 : 0.55}}>
                  <Td>
                    <div style={{fontWeight: 600, color: 'var(--ims-text)'}}>{p.name}</div>
                    {p.notes && <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px', fontStyle: 'italic', maxWidth: '280px'}}>{p.notes}</div>}
                  </Td>
                  <Td>{p.modality}</Td>
                  <Td><span style={{fontWeight: 500}}>{p.brand}</span></Td>
                  <Td>{p.type}</Td>
                  <Td><span style={{fontSize: '13px'}}>{originFlag(p.origin)}</span> {p.origin}</Td>
                  <Td><span style={{fontSize: '11px'}}>{p.principal}</span></Td>
                  <Td align="right"><span className="mono" style={{fontSize: '11px', color: (p.tkdn || 0) >= 20 ? 'var(--ims-accent-2)' : 'var(--ims-text-2)'}}>{p.tkdn || 0}%</span></Td>
                  <Td align="center">
                    <span style={{padding: '2px 8px', fontSize: '10px', background: 'rgba(91,135,184,0.16)', color: 'var(--ims-text-2)', fontWeight: 700, borderRadius: '3px'}}>
                      {PRODUCT_FILE_TYPES.filter(f => getProductFileUrl(p, f.key)).length}/5
                    </span>
                  </Td>
                  <Td align="center">
                    {used > 0 ? (
                      <span style={{padding: '2px 8px', fontSize: '10px', background: '#1a4d8a22', color: '#1a4d8a', fontWeight: 600, borderRadius: '3px'}}>{used}× SPH</span>
                    ) : (
                      <span style={{fontSize: '10px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>—</span>
                    )}
                  </Td>
                  <Td align="center">
                    <button onClick={() => toggleActive(p.id)} disabled={!canEdit} style={{padding: '3px 9px', fontSize: '10px', background: p.active ? 'var(--ims-accent-2)' : 'var(--ims-text-2)', color: '#fff', border: 'none', cursor: canEdit ? 'pointer' : 'default', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderRadius: '3px'}}>{p.active ? (lang === 'id' ? 'Aktif' : 'Active') : (lang === 'id' ? 'Nonaktif' : 'Inactive')}</button>
                  </Td>
                  {canEdit && (
                    <Td align="center">
                      <div style={{display: 'flex', gap: '4px', justifyContent: 'center'}}>
                        <button onClick={() => { setEditingProduct(p); setModalOpen(true); }} style={{background: 'transparent', border: '1px solid #1a4d8a', color: '#1a4d8a', padding: '4px 6px', cursor: 'pointer'}} title={lang === 'id' ? 'Edit' : 'Edit'}>
                          <Edit2 size={11} />
                        </button>
                        <button onClick={() => setDeleteId(p.id)} disabled={used > 0} style={{background: 'transparent', border: '1px solid ' + (used > 0 ? 'var(--ims-border)' : '#c03030'), color: used > 0 ? 'var(--ims-border)' : '#c03030', padding: '4px 6px', cursor: used > 0 ? 'not-allowed' : 'pointer'}} title={used > 0 ? (lang === 'id' ? `Tidak bisa dihapus, masih dipakai di ${used} SPH` : `Cannot delete, used in ${used} SPH`) : (lang === 'id' ? 'Hapus' : 'Delete')}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </Td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      {modalOpen && (
        <ProductModal product={editingProduct} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditingProduct(null); }} t={t} lang={lang} existing={products} />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title={lang === 'id' ? 'Hapus Produk?' : 'Delete Product?'}
        message={lang === 'id' ? `Hapus produk "${products.find(p => p.id === deleteId)?.name || ''}" dari master? Aksi ini tidak bisa dibatalkan.` : `Delete product "${products.find(p => p.id === deleteId)?.name || ''}" from master? This cannot be undone.`}
        onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} danger lang={lang}
      />
    </div>
  );
}

function DocumentTemplateModule({ templates, setTemplates, data = [], employees = {}, t, lang, fmt, canEdit, logAction }) {
  const [draft, setDraft] = useState(() => mergeDocumentTemplates(templates));
  const [htmlEditor, setHtmlEditor] = useState(null); // { rowId, type, label, html } — edit HTML body template
  useEffect(() => { setDraft(mergeDocumentTemplates(templates)); }, [templates]);
  const sampleSph = data.find(s => s) || {
    sphNo: 'SPH/IMS/PREVIEW',
    customer: 'RS Contoh Sehat',
    customerType: 'hospital',
    projectType: 'private',
    modality: 'CT Scan',
    subModality: 'CT 128 Slice',
    productBrand: 'Precision',
    qty: 1,
    totalValue: 8200000000,
    dpPercent: 30,
    installmentMonths: 12,
    issuedDate: new Date().toISOString().split('T')[0],
    salesOwner: 'office',
  };
  const updateRoot = (key, value) => {
    // For image fields (letterheadImage, logoImage, stampImage), write directly to parent state
    // This ensures immediate visibility + auto-save to Supabase
    const directKeys = ['letterheadImage', 'logoImage', 'stampImage', 'letterheadMarginTop', 'letterheadMarginBottom'];
    if (directKeys.includes(key)) {
      console.log('[v4.0 updateRoot] writing IMAGE FIELD directly to parent:', key, 'length:', String(value).length);
      setTemplates(prev => ({ ...mergeDocumentTemplates(prev), [key]: value, updatedAt: new Date().toISOString() }));
    } else {
      setDraft(prev => ({ ...prev, [key]: value }));
    }
  };
  const updateTerm = (key, value) => setDraft(prev => ({ ...prev, terms: { ...(prev.terms || {}), [key]: value } }));
  const updateDocumentFiles = (updater) => setDraft(prev => {
    const current = Array.isArray(prev.documentFiles) ? prev.documentFiles : [];
    return { ...prev, documentFiles: typeof updater === 'function' ? updater(current) : updater };
  });
  const updateSignature = (role, key, value) => {
    if (true) { // v4.1: SEMUA field TTD (image/name/title) langsung ke parent agar tahan echo-reset
      console.log('[v4.0 updateSignature] writing TTD image directly to parent:', role, 'length:', String(value).length);
      setTemplates(prev => {
        const merged = mergeDocumentTemplates(prev);
        return {
          ...merged,
          signatures: {
            ...(merged.signatures || {}),
            [role]: { ...(merged.signatures?.[role] || {}), [key]: value },
          },
          updatedAt: new Date().toISOString(),
        };
      });
    } else {
      setDraft(prev => ({
        ...prev,
        signatures: {
          ...(prev.signatures || {}),
          [role]: { ...(prev.signatures?.[role] || {}), [key]: value },
        },
      }));
    }
  };
  const updateExtraSignature = (id, key, value) => {
    if (true) { // v4.1: semua field langsung ke parent
      console.log('[v4.0 updateExtraSignature] writing extra TTD directly to parent:', id);
      setTemplates(prev => {
        const merged = mergeDocumentTemplates(prev);
        return {
          ...merged,
          extraSignatures: (merged.extraSignatures || []).map(sig => sig.id === id ? { ...sig, [key]: value } : sig),
          updatedAt: new Date().toISOString(),
        };
      });
    } else {
      setDraft(prev => ({
        ...prev,
        extraSignatures: (prev.extraSignatures || []).map(sig => sig.id === id ? { ...sig, [key]: value } : sig),
      }));
    }
  };
  const addExtraSignature = () => {
    console.log('[v4.1 addExtraSignature] direct to parent');
    setTemplates(prev => {
      const merged = mergeDocumentTemplates(prev);
      return { ...merged, extraSignatures: [...(merged.extraSignatures || []), { id: 'sig_' + Date.now(), label: lang === 'id' ? 'Tanda Tangan Tambahan' : 'Additional Signature', name: '', title: '', image: '' }], updatedAt: new Date().toISOString() };
    });
  };
  const removeExtraSignature = (id) => setTemplates(prev => {
    const merged = mergeDocumentTemplates(prev);
    return { ...merged, extraSignatures: (merged.extraSignatures || []).filter(sig => sig.id !== id), updatedAt: new Date().toISOString() };
  });
  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => resolve(String(ev.target.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  // ═══════════════════════════════════════════════════════════════
  // PROVEN PATTERN: native <label>+<input type="file"> di JSX
  // Tidak butuh document.createElement, tidak butuh .click() programmatic.
  // Pattern HTML asli sejak HTML 4 — 100% reliable di semua browser.
  // ═══════════════════════════════════════════════════════════════
  const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
  const processFileSelection = async (file, onFile) => {
    console.log('[upload] processFileSelection start', { name: file?.name, size: file?.size, type: file?.type });
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      showToast(lang === 'id' ? `File terlalu besar (maks 8 MB). Ukuran: ${(file.size / (1024*1024)).toFixed(1)} MB` : `File too large (max 8 MB). Size: ${(file.size / (1024*1024)).toFixed(1)} MB`, 'error');
      return;
    }
    try {
      showToast(lang === 'id' ? `Membaca ${file.name}…` : `Reading ${file.name}…`, 'info');
      const dataUrl = await readFileAsDataUrl(file);
      console.log('[upload] dataUrl read OK, length:', dataUrl?.length);
      await onFile({ file, dataUrl });
      showToast(lang === 'id' ? `✓ ${file.name} berhasil diunggah` : `✓ ${file.name} uploaded`, 'success');
    } catch (err) {
      console.error('[upload] read error:', err);
      showToast(lang === 'id' ? 'File gagal dibaca: ' + (err?.message || 'unknown') : 'Read failed: ' + (err?.message || 'unknown'), 'error');
    }
  };
  // Image upload (kop, logo, stempel, TTD) — generic onChange callback
  // Untuk root field (letterheadImage, logoImage, stampImage): tulis LANGSUNG ke parent
  // Untuk nested (signatures.role.image, extraSignatures[i].image): pakai onChange callback
  const handleImageUpload = async (e, onChange) => {
    console.log('[v4.0 handleImageUpload] BEGIN');
    const file = e.target.files && e.target.files[0];
    if (!canEdit) {
      showToast(lang === 'id' ? 'Tidak ada akses edit template' : 'No edit access', 'error');
      e.target.value = '';
      return;
    }
    await processFileSelection(file, ({ dataUrl }) => {
      console.log('[v4.0 handleImageUpload] calling onChange (length=' + dataUrl.length + ')');
      onChange(dataUrl);
    });
    e.target.value = '';
  };
  const addDocumentTemplate = () => {
    console.log('[v4.1 addDocumentTemplate] direct to parent');
    setTemplates(prev => {
      const merged = mergeDocumentTemplates(prev);
      return { ...merged, documentFiles: [...(merged.documentFiles || []), { id: 'doc_' + Date.now(), type: 'custom', label: lang === 'id' ? 'Template Baru' : 'New Template', fileName: '', mimeType: '', dataUrl: '', uploadedAt: '' }], updatedAt: new Date().toISOString() };
    });
  };
  const removeDocumentTemplate = (id) => setTemplates(prev => {
    const merged = mergeDocumentTemplates(prev);
    return { ...merged, documentFiles: (merged.documentFiles || []).filter(item => item.id !== id), updatedAt: new Date().toISOString() };
  });
  const updateDocumentTemplate = (id, key, value) => setTemplates(prev => {
    const merged = mergeDocumentTemplates(prev);
    return { ...merged, documentFiles: (merged.documentFiles || []).map(item => item.id === id ? { ...item, [key]: value } : item), updatedAt: new Date().toISOString() };
  });
  // `live` = sumber kebenaran untuk FILE/GAMBAR/TTD (langsung dari parent state, auto-save).
  // `draft` hanya untuk field teks (identitas perusahaan, terms, footer) yang disimpan manual.
  const live = useMemo(() => mergeDocumentTemplates(templates), [templates]);
  const documentFiles = live.documentFiles || [];
  const handleSave = () => {
    const next = mergeDocumentTemplates({ ...draft, documentFiles: live.documentFiles, letterheadImage: live.letterheadImage, logoImage: live.logoImage, stampImage: live.stampImage, signatures: live.signatures, extraSignatures: live.extraSignatures, updatedAt: new Date().toISOString() });
    setTemplates(next);
    logAction && logAction({ module: 'document_templates', action: 'update', entityLabel: lang === 'id' ? 'Template dokumen resmi' : 'Official document templates' });
    showToast(lang === 'id' ? 'Template dokumen disimpan' : 'Document template saved', 'success');
  };
  const preview = (type) => {
    const tpl = mergeDocumentTemplates({ ...draft, documentFiles: live.documentFiles, letterheadImage: live.letterheadImage, logoImage: live.logoImage, stampImage: live.stampImage, signatures: live.signatures, extraSignatures: live.extraSignatures });
    if (type === 'spp') return openDocumentTemplateOrHtml('spp', tpl, 'Preview SPP HNTI', buildSPPDocumentHtml(sampleSph, employees, fmt, tpl));
    if (type === 'invoice') return openDocumentTemplateOrHtml('invoice', tpl, 'Preview Invoice HNTI', buildInvoiceKwitansiHtml(sampleSph, fmt, tpl));
    if (type === 'po') return openDocumentTemplateOrHtml('po_principal', tpl, 'Preview PO Principal HNTI', buildPrincipalPoHtml(sampleSph, fmt, tpl));
    // Template yang sudah diupload: preview file asli; fallback ke SPH jika belum ada file
    const uploadedRow = (tpl.documentFiles || []).find(f => f.type === type && f.dataUrl);
    if (uploadedRow) return previewUploadedTemplate(uploadedRow, uploadedRow.label || type);
    return openDocumentTemplateOrHtml('sph', tpl, 'Preview SPH HNTI', buildSPHDocumentHtml(sampleSph, employees, fmt, tpl));
  };
  const imageUpload = (label, value, onChange, help) => (
    <div style={{border: '1px solid var(--ims-border)', background: 'var(--ims-bg-card)', padding: '12px'}}>
      <div style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 700, marginBottom: '8px'}}>{label}</div>
      {value ? (
        <div style={{height: '82px', border: '1px solid var(--ims-border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', overflow: 'hidden'}}>
          <img src={value} alt={label} style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />
        </div>
      ) : (
        <div style={{height: '82px', border: '1px dashed var(--ims-border)', color: 'var(--ims-text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', fontSize: '11px'}}>
          {lang === 'id' ? 'Belum ada file' : 'No file'}
        </div>
      )}
      <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
        {canEdit ? (
          <label style={{display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1a4d8a', color: '#fff', border: 'none', padding: '7px 11px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit'}}>
            <Upload size={12} />{lang === 'id' ? 'Upload' : 'Upload'}
            <input type="file" accept="image/*,.png,.jpg,.jpeg,.webp" style={{display: 'none'}} onChange={(e) => handleImageUpload(e, onChange)} />
          </label>
        ) : (
          <button type="button" disabled style={{background: 'var(--ims-border)', color: '#fff', border: 'none', padding: '7px 11px', fontSize: '11px', fontWeight: 700, cursor: 'default', fontFamily: 'inherit'}}>
            <Upload size={12} />{lang === 'id' ? 'Upload' : 'Upload'}
          </button>
        )}
        {value && canEdit && (
          <button type="button" onClick={() => onChange('')} style={{background: 'transparent', border: '1px solid #c03030', color: '#c03030', padding: '7px 11px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 700}}>
            {lang === 'id' ? 'Hapus' : 'Remove'}
          </button>
        )}
      </div>
      {help && <div style={{fontSize: '10.5px', color: 'var(--ims-text-2)', lineHeight: 1.45, marginTop: '8px'}}>{help}</div>}
    </div>
  );
  const signatureRoles = [
    ['sales', lang === 'id' ? 'Tanda Tangan Sales' : 'Sales Signature'],
    ['finance', lang === 'id' ? 'Tanda Tangan Finance' : 'Finance Signature'],
    ['operations', lang === 'id' ? 'Tanda Tangan Operasional' : 'Operations Signature'],
    ['director', lang === 'id' ? 'Tanda Tangan Direktur' : 'Director Signature'],
  ];
  return (
    <div>
      <div style={{marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '14px'}}>
        <div>
          <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_document_templates}</div>
          <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{lang === 'id' ? 'Template Dokumen Resmi' : 'Official Document Templates'}</h1>
          <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{lang === 'id' ? 'Sumber kop surat, tanda tangan, stempel, dan catatan legal untuk PDF/Word IMS.' : 'Official letterhead, signatures, stamp, and legal notes for IMS PDF/Word output.'}</div>
          <div style={{display: 'inline-flex', alignItems: 'center', gap: '12px', marginTop: '10px', padding: '6px 14px', background: 'rgba(91,141,239,0.10)', border: '1px solid #5b8def40', fontSize: '11px', color: '#8fb8ff', fontFamily: 'monospace'}}>
            <span style={{fontWeight: 700}}>v4.1</span>
            <span style={{color: 'var(--ims-text-2)'}}>·</span>
            <span>{(() => {
              const merged = mergeDocumentTemplates(templates);
              const fileCount = (merged.documentFiles || []).filter(f => f.dataUrl).length;
              const totalSlots = (merged.documentFiles || []).length;
              const sigCount = ['sales','finance','operations','director'].filter(r => merged.signatures?.[r]?.image).length;
              const extraSigCount = (merged.extraSignatures || []).filter(s => s.image).length;
              const hasKop = !!merged.letterheadImage;
              const hasLogo = !!merged.logoImage;
              const hasStamp = !!merged.stampImage;
              return `${fileCount}/${totalSlots} file template · ${sigCount + extraSigCount} TTD · ${hasKop ? '✓' : '✗'} kop · ${hasLogo ? '✓' : '✗'} logo · ${hasStamp ? '✓' : '✗'} stempel`;
            })()}</span>
            <span style={{color: 'var(--ims-text-2)'}}>·</span>
            <span style={{color: '#9adf9a'}}>{lang === 'id' ? 'auto-save aktif' : 'auto-save active'}</span>
          </div>
        </div>
      </div>

      {!canEdit && <ReadOnlyBanner t={t} />}

      <div className="card" style={{marginBottom: '16px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap'}}>
          <div>
            <div className="card-title" style={{marginBottom: '4px'}}>{lang === 'id' ? 'File Template Dokumen' : 'Document Template Files'}</div>
            <div style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>
              {lang === 'id'
                ? 'Unggah file template asli satu per satu. Preview dan unduhan memakai file asli agar susunan/narasinya tetap sama.'
                : 'Upload original template files one by one. Preview and downloads use the original file so structure/text stays intact.'}
            </div>
          </div>
          {canEdit && <button type="button" onClick={addDocumentTemplate} className="btn-primary" style={{fontSize: '11px'}}><Plus size={13} />{lang === 'id' ? 'Tambah Template' : 'Add Template'}</button>}
        </div>
        <div>
          {documentFiles.map(row => (
            <div key={row.id} style={{borderTop: '1px solid var(--ims-border)', padding: '14px 0', display: 'grid', gridTemplateColumns: 'minmax(180px,1fr) 1fr', gap: '12px 18px', alignItems: 'start'}}>
              <div>
                <div style={{fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{lang === 'id' ? 'Jenis Dokumen' : 'Document Type'}</div>
                <select disabled={!canEdit || OFFICIAL_DOC_TEMPLATE_TYPES.some(type => type.key === row.id)} value={row.type || 'custom'} onChange={e => {
                  const selected = OFFICIAL_DOC_TEMPLATE_TYPES.find(type => type.key === e.target.value);
                  updateDocumentTemplate(row.id, 'type', e.target.value);
                  if (selected) updateDocumentTemplate(row.id, 'label', selected.label);
                }} style={{width: '100%'}}>
                  <option value="custom">{lang === 'id' ? 'Custom / Lainnya' : 'Custom / Other'}</option>
                  {OFFICIAL_DOC_TEMPLATE_TYPES.map(type => <option key={type.key} value={type.key}>{type.label}</option>)}
                </select>
                <div style={{marginTop: '8px'}}>
                  <div style={{fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '4px'}}>{lang === 'id' ? 'Nama Template' : 'Template Name'}</div>
                  <input disabled={!canEdit} value={row.label || ''} onChange={e => updateDocumentTemplate(row.id, 'label', e.target.value)} placeholder={lang === 'id' ? 'Nama template' : 'Template name'} style={{width: '100%'}} />
                </div>
              </div>
              <div>
                <div style={{fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{lang === 'id' ? 'File Template' : 'Template File'}</div>
                {row.fileName ? (
                  <div style={{border: '1px solid var(--ims-border)', padding: '10px 14px', background: 'var(--ims-bg-card-2)', marginBottom: '8px'}}>
                    <div style={{fontWeight: 700, color: 'var(--ims-text)', fontSize: '12px'}}>{row.fileName}</div>
                    <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '3px'}}>{row.mimeType || inferMimeFromName(row.fileName)}{row.size ? ` · ${formatFileSize(row.size)}` : ''}{row.uploadedAt ? ` · ${formatDateTime(row.uploadedAt, lang)}` : ''}</div>
                    {row.htmlBody && String(row.htmlBody).trim() && <div style={{marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#2f8f6f', fontWeight: 700, background: '#2f8f6f18', padding: '3px 8px', borderRadius: '3px'}}><Check size={11} />{lang === 'id' ? 'Isi terbaca → jadi format editor' : 'Content extracted → editor format'}</div>}
                  </div>
                ) : (
                  <div style={{border: '1px dashed var(--ims-border)', padding: '14px', textAlign: 'center', color: 'var(--ims-text-2)', fontSize: '11px', marginBottom: '8px', fontStyle: 'italic', background: 'var(--ims-bg-card-2)'}}>{lang === 'id' ? 'Belum ada file — unggah .docx/.xlsx, isinya otomatis jadi format editor' : 'No file — upload .docx/.xlsx, content becomes editor format'}</div>
                )}
                <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
                  {canEdit && <button type="button" onClick={() => { const live = mergeDocumentTemplates(templates); const r = (live.documentFiles || []).find(f => f.id === row.id || f.type === row.type) || row; setHtmlEditor({ rowId: row.id, type: row.type, label: row.label, html: r.htmlBody != null ? r.htmlBody : buildEditorBody(row.type, sampleSph, employees, fmt, templates, null) }); }} className="btn-primary" style={{fontSize: '11px', padding: '8px 14px'}} title={lang === 'id' ? 'Edit format HTML template ini (dipakai saat Buat Dokumen)' : 'Edit HTML body of this template'}><Edit2 size={13} />{lang === 'id' ? 'Edit Format' : 'Edit Format'}</button>}
                  <button type="button" onClick={() => row.dataUrl ? previewUploadedTemplate(row, row.label || row.fileName || 'Template') : preview(row.type)} className="btn-ghost" style={{fontSize: '11px', padding: '8px 14px'}}><Eye size={13} />Preview</button>
                </div>
              </div>
            </div>
          ))}
          {documentFiles.length === 0 && <div className="empty-state" style={{padding: '32px'}}>{lang === 'id' ? 'Belum ada template. Klik Tambah Template.' : 'No templates. Click Add Template.'}</div>}
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '16px'}}>
        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Kop Surat & Identitas Perusahaan' : 'Letterhead & Company Identity'}</div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px'}}>
            {imageUpload(lang === 'id' ? 'Kop Surat Gambar Penuh (A4)' : 'Full Letterhead Image (A4)', live.letterheadImage, v => updateRoot('letterheadImage', v), lang === 'id' ? 'Upload gambar kop UKURAN A4 PENUH (header+footer+ornamen). Ini jadi BACKGROUND semua dokumen; teks ditaruh di tengah.' : 'Upload FULL A4 letterhead image. Becomes the background of all documents; text sits in the middle.')}
            {imageUpload('Logo HNTI', live.logoImage, v => updateRoot('logoImage', v), lang === 'id' ? 'Dipakai kalau kop gambar penuh belum diisi.' : 'Used when full letterhead is empty.')}
          </div>
          {live.letterheadImage && (
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px', padding: '12px', background: 'var(--ims-bg-card-2)', border: '1px solid var(--ims-border)'}}>
              <div style={{gridColumn: '1 / -1', fontSize: '11px', color: 'var(--ims-text-2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em'}}>{lang === 'id' ? 'Area Teks di Dalam Kop (mm)' : 'Text Safe Zone (mm)'}</div>
              <Field label={lang === 'id' ? 'Margin Atas (header kop)' : 'Top Margin (header)'}><input type="number" disabled={!canEdit} value={live.letterheadMarginTop ?? 25} onChange={e => updateRoot('letterheadMarginTop', Number(e.target.value) || 0)} /></Field>
              <Field label={lang === 'id' ? 'Margin Bawah (footer kop)' : 'Bottom Margin (footer)'}><input type="number" disabled={!canEdit} value={live.letterheadMarginBottom ?? 35} onChange={e => updateRoot('letterheadMarginBottom', Number(e.target.value) || 0)} /></Field>
              <div style={{gridColumn: '1 / -1', fontSize: '10px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{lang === 'id' ? 'Atur jarak agar teks tidak menimpa header/footer gambar kop. Default 25mm atas, 35mm bawah.' : 'Adjust so text does not overlap the header/footer of the letterhead image. Default 25mm top, 35mm bottom.'}</div>
            </div>
          )}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
            <Field label={lang === 'id' ? 'Nama Perusahaan' : 'Company Name'}><input disabled={!canEdit} value={draft.companyName || ''} onChange={e => updateRoot('companyName', e.target.value)} /></Field>
            <Field label={lang === 'id' ? 'Telepon' : 'Phone'}><input disabled={!canEdit} value={draft.companyPhone || ''} onChange={e => updateRoot('companyPhone', e.target.value)} /></Field>
            <Field label="Email"><input disabled={!canEdit} value={draft.companyEmail || ''} onChange={e => updateRoot('companyEmail', e.target.value)} /></Field>
            <Field label="Website"><input disabled={!canEdit} value={draft.companyWebsite || ''} onChange={e => updateRoot('companyWebsite', e.target.value)} /></Field>
            <Field label={lang === 'id' ? 'Alamat Perusahaan' : 'Company Address'} full><textarea disabled={!canEdit} value={draft.companyAddress || ''} onChange={e => updateRoot('companyAddress', e.target.value)} rows={2} /></Field>
          </div>
        </div>

        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Rekening & Stempel' : 'Bank Account & Stamp'}</div>
          {imageUpload(lang === 'id' ? 'Stempel Perusahaan' : 'Company Stamp', live.stampImage, v => updateRoot('stampImage', v), lang === 'id' ? 'Opsional. Akan muncul di area tanda tangan.' : 'Optional. It appears near signatures.')}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px'}}>
            <Field label={lang === 'id' ? 'Nama Bank' : 'Bank Name'}><input disabled={!canEdit} value={draft.bankName || ''} onChange={e => updateRoot('bankName', e.target.value)} /></Field>
            <Field label={lang === 'id' ? 'No. Rekening' : 'Account No.'}><input disabled={!canEdit} value={draft.bankAccountNo || ''} onChange={e => updateRoot('bankAccountNo', e.target.value)} /></Field>
            <Field label={lang === 'id' ? 'Nama Rekening' : 'Account Name'} full><input disabled={!canEdit} value={draft.bankAccountName || ''} onChange={e => updateRoot('bankAccountName', e.target.value)} /></Field>
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop: '16px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '10px'}}>
          <div className="card-title" style={{margin: 0}}>{lang === 'id' ? 'Tanda Tangan Resmi' : 'Official Signatures'}</div>
          {canEdit && <button type="button" onClick={addExtraSignature} className="btn-ghost" style={{fontSize: '11px'}}><Plus size={13} />{lang === 'id' ? 'Tambah TTD' : 'Add Signature'}</button>}
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px'}}>
          {signatureRoles.map(([role, label]) => (
            <div key={role} style={{border: '1px solid var(--ims-border)', padding: '12px', background: 'var(--ims-bg-card-2)'}}>
              {imageUpload(label, live.signatures?.[role]?.image || '', v => updateSignature(role, 'image', v), '')}
              <Field label={lang === 'id' ? 'Nama Penanda Tangan' : 'Signer Name'}><input disabled={!canEdit} value={live.signatures?.[role]?.name || ''} onChange={e => updateSignature(role, 'name', e.target.value)} /></Field>
              <Field label={lang === 'id' ? 'Jabatan' : 'Title'}><input disabled={!canEdit} value={live.signatures?.[role]?.title || ''} onChange={e => updateSignature(role, 'title', e.target.value)} /></Field>
            </div>
          ))}
          {(live.extraSignatures || []).map(sig => (
            <div key={sig.id} style={{border: '1px solid var(--ims-border)', padding: '12px', background: 'var(--ims-bg-card-2)'}}>
              {imageUpload(sig.label || (lang === 'id' ? 'Tanda Tangan Tambahan' : 'Additional Signature'), sig.image || '', v => updateExtraSignature(sig.id, 'image', v), '')}
              <Field label={lang === 'id' ? 'Label TTD' : 'Signature Label'}><input disabled={!canEdit} value={sig.label || ''} onChange={e => updateExtraSignature(sig.id, 'label', e.target.value)} /></Field>
              <Field label={lang === 'id' ? 'Nama Penanda Tangan' : 'Signer Name'}><input disabled={!canEdit} value={sig.name || ''} onChange={e => updateExtraSignature(sig.id, 'name', e.target.value)} /></Field>
              <Field label={lang === 'id' ? 'Jabatan' : 'Title'}><input disabled={!canEdit} value={sig.title || ''} onChange={e => updateExtraSignature(sig.id, 'title', e.target.value)} /></Field>
              {canEdit && <button type="button" onClick={() => removeExtraSignature(sig.id)} className="btn-ghost" style={{fontSize: '10px', color: '#c03030'}}><Trash2 size={12} />{lang === 'id' ? 'Hapus TTD' : 'Remove'}</button>}
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{marginTop: '16px'}}>
        <div className="card-title">{lang === 'id' ? 'Isi Tetap / Catatan Legal' : 'Fixed Text / Legal Notes'}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px'}}>
          <Field label="SPH" full><textarea disabled={!canEdit} value={draft.terms?.sph || ''} onChange={e => updateTerm('sph', e.target.value)} rows={7} /></Field>
          <Field label="SPP" full><textarea disabled={!canEdit} value={draft.terms?.spp || ''} onChange={e => updateTerm('spp', e.target.value)} rows={7} /></Field>
          <Field label="Invoice / Kwitansi" full><textarea disabled={!canEdit} value={draft.terms?.invoice || ''} onChange={e => updateTerm('invoice', e.target.value)} rows={7} /></Field>
          <Field label="PO Principal" full><textarea disabled={!canEdit} value={draft.terms?.po || ''} onChange={e => updateTerm('po', e.target.value)} rows={7} /></Field>
        </div>
        <Field label={lang === 'id' ? 'Catatan Footer' : 'Footer Note'}>
          <input disabled={!canEdit} value={draft.footerNote || ''} onChange={e => updateRoot('footerNote', e.target.value)} />
        </Field>
      </div>

      {canEdit && (
        <div style={{marginTop: '16px', display: 'flex', justifyContent: 'flex-end'}}>
          <button onClick={handleSave} className="btn-primary"><Check size={14} />{lang === 'id' ? 'Simpan Template' : 'Save Template'}</button>
        </div>
      )}

      {htmlEditor && (
        <DocumentEditorModal
          open={!!htmlEditor}
          onClose={() => setHtmlEditor(null)}
          title={(lang === 'id' ? 'Set Format HTML: ' : 'Set HTML Format: ') + htmlEditor.label}
          initialHtml={htmlEditor.html ?? ''}
          docType={htmlEditor.type}
          record={{}}
          templateMode
          saveLabel={lang === 'id' ? 'Simpan Format Template' : 'Save Template Format'}
          lang={lang}
          onSave={(html) => {
            // Simpan htmlBody ke template row (jadi master format utk Buat Dokumen)
            setTemplates(prev => {
              const merged = mergeDocumentTemplates(prev);
              return { ...merged, documentFiles: (merged.documentFiles || []).map(f => (f.id === htmlEditor.rowId || f.type === htmlEditor.type) ? { ...f, htmlBody: html ?? '' } : f), updatedAt: new Date().toISOString() };
            });
            showToast(lang === 'id' ? `Format ${htmlEditor.label} tersimpan — dipakai saat Buat Dokumen` : 'Template format saved', 'success');
            setHtmlEditor(null);
          }}
        />
      )}
    </div>
  );
}

// ============== Product Modal (Add/Edit) ==============
function ProductModal({ product, onSave, onCancel, t, lang, existing }) {
  const isEdit = !!product;
  const normalizedProduct = product ? {
    ...product,
    productFiles: PRODUCT_FILE_TYPES.reduce((acc, f) => ({ ...acc, [f.key]: getProductFileUrl(product, f.key) }), {}),
  } : null;
  const [form, setForm] = useState(normalizedProduct || {
    name: '', modality: '', brand: '', type: '', origin: '', principal: '', tkdn: 0, akl: '', active: true, notes: '', productFiles: {},
  });
  const [error, setError] = useState('');

  // Catatan #5: modality list is dynamic — derived from modalities actually used by products.
  // Adding = type a new name; deleting/renaming = handled by editing the products that use it.
  const modalityOptions = useMemo(() => {
    const set = new Set((existing || []).map(p => p.modality).filter(Boolean));
    return Array.from(set).sort();
  }, [existing]);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const updateProductFile = (key, value) => setForm(f => ({ ...f, productFiles: { ...(f.productFiles || {}), [key]: value } }));

  const handleSubmit = () => {
    if (!form.name?.trim() || !form.brand?.trim() || !form.modality?.trim() || !form.type?.trim()) {
      setError(lang === 'id' ? 'Nama, Modalitas, Merek, dan Tipe wajib diisi.' : 'Name, Modality, Brand, and Type are required.');
      return;
    }
    // Check duplicate (same brand+type, exclude own)
    const dup = existing.find(p => p.id !== form.id && p.brand?.toLowerCase() === form.brand.toLowerCase().trim() && p.type?.toLowerCase() === form.type.toLowerCase().trim());
    if (dup) {
      setError(lang === 'id' ? `Produk dengan merek "${form.brand}" dan tipe "${form.type}" sudah ada.` : `Product with brand "${form.brand}" and type "${form.type}" already exists.`);
      return;
    }
    onSave({ ...form, name: form.name.trim(), brand: form.brand.trim(), type: form.type.trim(), productFiles: PRODUCT_FILE_TYPES.reduce((acc, f) => ({ ...acc, [f.key]: String(form.productFiles?.[f.key] || '').trim() }), {}) });
  };

  return (
    <div className="modal-overlay" onClick={onCancel} style={{zIndex: 9999}}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '640px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--ims-border)'}}>
          <h2 className="serif" style={{margin: 0, fontSize: '22px', fontWeight: 500}}>{isEdit ? (lang === 'id' ? 'Edit Produk' : 'Edit Product') : (lang === 'id' ? 'Tambah Produk Baru' : 'Add New Product')}</h2>
          <button onClick={onCancel} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>
        <div style={{padding: '20px 24px', maxHeight: '70vh', overflowY: 'auto'}}>
          {error && <div style={{padding: '10px 14px', background: '#2a1414', border: '1px solid #c03030', color: '#c03030', fontSize: '12px', marginBottom: '14px'}}>{error}</div>}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px'}}>
            <Field label={lang === 'id' ? 'Nama Produk (Display)' : 'Product Name (Display)'}>
              <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="contoh: MRI 1.5T Supermark" />
              <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{lang === 'id' ? 'Format: [Tipe] [Merek] — tampil di SPH' : 'Format: [Type] [Brand] — shown on SPH'}</div>
            </Field>
            <Field label={lang === 'id' ? 'Modalitas' : 'Modality'}>
              <input list="modality-options" value={form.modality} onChange={e => update('modality', e.target.value)} placeholder={lang === 'id' ? 'Pilih atau ketik sendiri...' : 'Select or type your own...'} />
              <datalist id="modality-options">
                {modalityOptions.map(m => <option key={m} value={m} />)}
              </datalist>
              <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{lang === 'id' ? 'Daftar diambil dari produk yang ada. Ketik nama baru untuk menambah modalitas; modalitas yang tak lagi dipakai produk akan hilang otomatis.' : 'List derived from existing products. Type a new name to add; unused modalities disappear automatically.'}</div>
            </Field>
            <Field label={lang === 'id' ? 'Merek' : 'Brand'}>
              <input value={form.brand} onChange={e => update('brand', e.target.value)} placeholder="contoh: Precision, Innocare, Supermark" />
            </Field>
            <Field label={lang === 'id' ? 'Tipe / Model' : 'Type / Model'}>
              <input value={form.type} onChange={e => update('type', e.target.value)} placeholder="contoh: MRI 1.5T, X-Ray Portable" />
            </Field>
            <Field label={lang === 'id' ? 'Negara Asal' : 'Country of Origin'}>
              <input list="origin-options" value={form.origin} onChange={e => update('origin', e.target.value)} placeholder={lang === 'id' ? 'Pilih atau ketik...' : 'Select or type...'} />
              <datalist id="origin-options">
                <option value="China" />
                <option value="Korea" />
                <option value="Taiwan" />
                <option value="Japan" />
                <option value="Germany" />
                <option value="USA" />
                <option value="Netherlands" />
                <option value="Italy" />
              </datalist>
            </Field>
            <Field label={lang === 'id' ? 'Principal (Pabrikan)' : 'Principal (Manufacturer)'}>
              <input value={form.principal} onChange={e => update('principal', e.target.value)} placeholder="contoh: Anke Medical" />
            </Field>
            <Field label="TKDN %">
              <input type="number" min="0" max="100" value={form.tkdn} onChange={e => update('tkdn', Number(e.target.value) || 0)} placeholder="0-100" />
              <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{lang === 'id' ? '≥20% lolos lelang LKPP P3DN' : '≥20% qualifies for LKPP tender'}</div>
            </Field>
            <Field label="AKL (Izin Edar Kemenkes)">
              <input value={form.akl} onChange={e => update('akl', e.target.value)} placeholder="KEMENKES RI AKL ..." />
            </Field>
          </div>
          <Field label={lang === 'id' ? 'Catatan' : 'Notes'}>
            <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={2} placeholder={lang === 'id' ? 'Spesifikasi singkat, fitur unggulan, dll' : 'Brief spec, key features, etc'} />
          </Field>
          <div style={{marginTop: '14px', padding: '12px', background: 'var(--ims-bg-card-2)', border: '1px solid var(--ims-border)'}}>
            <div className="card-title" style={{marginBottom: '10px'}}>{lang === 'id' ? 'File Produk - Google Drive' : 'Product Files - Google Drive'}</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
              {PRODUCT_FILE_TYPES.map(ft => (
                <Field key={ft.key} label={ft.label}>
                  <input type="url" value={form.productFiles?.[ft.key] || ''} onChange={e => updateProductFile(ft.key, e.target.value)} placeholder="https://drive.google.com/..." />
                </Field>
              ))}
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', padding: '12px', background: 'var(--ims-gold-bg)', border: '1px solid var(--ims-accent)'}}>
            <input type="checkbox" id="prod-active" checked={!!form.active} onChange={e => update('active', e.target.checked)} style={{width: '16px', height: '16px', cursor: 'pointer'}} />
            <label htmlFor="prod-active" style={{fontSize: '12px', cursor: 'pointer', color: '#5a4a1a'}}>
              <strong>{lang === 'id' ? 'Produk Aktif' : 'Active Product'}</strong> · {lang === 'id' ? 'Tampil di dropdown SPH' : 'Shown in SPH dropdown'}
            </label>
          </div>
        </div>
        <div style={{padding: '16px 24px', borderTop: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
          <button onClick={onCancel} style={{background: 'transparent', border: '1px solid var(--ims-border)', color: 'var(--ims-text-2)', padding: '8px 18px', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer'}}>{lang === 'id' ? 'Batal' : 'Cancel'}</button>
          <button onClick={handleSubmit} style={{background: 'var(--ims-bg-alt)', color: '#fff', border: 'none', padding: '8px 18px', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer', fontWeight: 600}}>{lang === 'id' ? 'Simpan' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

// ============== Audit Trail / Change Log Module ==============
// SOX-grade audit log: every meaningful action is captured with who/what/when
function AuditLogModule({ auditLog, setAuditLog, employees, t, lang }) {
  const [filterUser, setFilterUser] = useState('all');
  const [filterModule, setFilterModule] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [search, setSearch] = useState('');
  // Cleanup state (Tahap 11 — Phase 1)
  const [cleanupDays, setCleanupDays] = useState('90');
  const [cleanupConfirm, setCleanupConfirm] = useState(false);
  const handleCleanup = () => {
    if (typeof setAuditLog !== 'function') return;
    if (cleanupDays === 'all') {
      setAuditLog([]);
    } else {
      const cutoffMs = Date.now() - parseInt(cleanupDays) * 86400 * 1000;
      setAuditLog(prev => prev.filter(e => {
        const t = new Date(e.timestamp).getTime();
        return !isFinite(t) || t >= cutoffMs;
      }));
    }
    setCleanupConfirm(false);
  };
  // Hitung size estimate dari JSON.stringify
  const sizeKB = useMemo(() => Math.round(JSON.stringify(auditLog).length / 1024), [auditLog]);

  const filteredLog = useMemo(() => {
    return auditLog.filter(entry => {
      if (filterUser !== 'all' && entry.user !== filterUser) return false;
      if (filterModule !== 'all' && entry.module !== filterModule) return false;
      if (filterAction !== 'all' && entry.action !== filterAction) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!entry.entityLabel?.toLowerCase().includes(q) &&
            !entry.userName?.toLowerCase().includes(q) &&
            !entry.field?.toLowerCase().includes(q) &&
            !entry.note?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [auditLog, filterUser, filterModule, filterAction, search]);

  const uniqueUsers = useMemo(() => [...new Set(auditLog.map(e => e.user).filter(Boolean))], [auditLog]);
  const uniqueModules = useMemo(() => [...new Set(auditLog.map(e => e.module).filter(Boolean))], [auditLog]);
  const uniqueActions = useMemo(() => [...new Set(auditLog.map(e => e.action).filter(Boolean))], [auditLog]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: auditLog.length,
      todayCount: auditLog.filter(e => e.timestamp?.startsWith(today)).length,
      uniqueUsers: uniqueUsers.length,
      creates: auditLog.filter(e => e.action === 'create').length,
      updates: auditLog.filter(e => e.action === 'update').length,
      deletes: auditLog.filter(e => e.action === 'delete').length,
    };
  }, [auditLog, uniqueUsers]);

  const exportCSV = () => {
    const header = ['Timestamp', lang === 'id' ? 'Pengguna' : 'User', 'Role', lang === 'id' ? 'Modul' : 'Module', lang === 'id' ? 'Aksi' : 'Action', lang === 'id' ? 'Entitas' : 'Entity', lang === 'id' ? 'Field' : 'Field', lang === 'id' ? 'Sebelum' : 'Before', lang === 'id' ? 'Sesudah' : 'After', lang === 'id' ? 'Catatan' : 'Note'];
    const rows = [header, ...filteredLog.map(e => [e.timestamp, e.userName || e.user, e.role || '', e.module, e.action, e.entityLabel || '', e.field || '', e.before == null ? '' : String(e.before), e.after == null ? '' : String(e.after), e.note || ''])];
    downloadCSV(`HNTI_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  const actionColor = (a) => ({
    create: 'var(--ims-accent-2)', update: '#1a4d8a', delete: '#c03030', login: '#7b3fb5', logout: 'var(--ims-text-2)', export: 'var(--ims-gold)', import: '#0f7a5a', refresh: '#5b87b8',
  })[a] || 'var(--ims-text-2)';
  const moduleLabel = (m) => ({
    sph: 'SPH', pipeline: 'Pipeline', finance: 'Finance', operations: lang === 'id' ? 'Operasional' : 'Operations',
    installation: lang === 'id' ? 'Instalasi' : 'Installation', maintenance: 'Maintenance', regulatory: 'Regulatory',
    business_trip: lang === 'id' ? 'Perjalanan Dinas' : 'Business Trip', employees: lang === 'id' ? 'Karyawan' : 'Employees',
    auth: lang === 'id' ? 'Autentikasi' : 'Authentication', sales_report: lang === 'id' ? 'Laporan Lapangan' : 'Field Report',
  })[m] || m;

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{lang === 'id' ? 'Jejak Audit' : 'Audit Trail'}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{lang === 'id' ? 'Log Perubahan Sistem' : 'System Change Log'}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{lang === 'id' ? 'Setiap aksi di sistem terekam — SOX compliance ready' : 'Every action is logged — SOX compliance ready'}</div>
      </div>

      {/* KPI cards */}
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Total Entri' : 'Total Entries'}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{stats.total}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'Sejak login pertama' : 'Since first login'}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Hari Ini' : 'Today'}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent)'}}>{stats.todayCount}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'Aksi tercatat' : 'Actions logged'}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Pengguna Aktif' : 'Active Users'}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#1a4d8a'}}>{stats.uniqueUsers}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Edit / Hapus' : 'Edits / Deletes'}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>
            <span style={{color: '#1a4d8a'}}>{stats.updates}</span>
            <span style={{color: 'var(--ims-text-2)', fontSize: '16px'}}> · </span>
            <span style={{color: '#c03030'}}>{stats.deletes}</span>
          </div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>+{stats.creates} {lang === 'id' ? 'buat' : 'creates'}</div>
        </div>
      </div>

      {/* Filters + Export */}
      <div style={{display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center', flexWrap: 'wrap'}}>
        <div style={{position: 'relative', flex: '1 1 220px', maxWidth: '320px'}}>
          <Search size={14} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ims-text-2)'}} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === 'id' ? 'Cari user, entitas, catatan...' : 'Search user, entity, note...'} style={{paddingLeft: '36px'}} />
        </div>
        <select value={filterUser} onChange={e => setFilterUser(e.target.value)} style={{width: 'auto', minWidth: '120px'}}>
          <option value="all">{lang === 'id' ? 'Semua Pengguna' : 'All Users'}</option>
          {uniqueUsers.map(u => <option key={u} value={u}>{resolveEmpName(employees, u)}</option>)}
        </select>
        <select value={filterModule} onChange={e => setFilterModule(e.target.value)} style={{width: 'auto', minWidth: '120px'}}>
          <option value="all">{lang === 'id' ? 'Semua Modul' : 'All Modules'}</option>
          {uniqueModules.map(m => <option key={m} value={m}>{moduleLabel(m)}</option>)}
        </select>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)} style={{width: 'auto', minWidth: '110px'}}>
          <option value="all">{lang === 'id' ? 'Semua Aksi' : 'All Actions'}</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <button onClick={exportCSV} style={{background: 'var(--ims-accent-2)', border: 'none', color: '#fff', padding: '6px 12px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto'}} title={lang === 'id' ? 'Export ke CSV' : 'Export to CSV'}>
          <Download size={12} />CSV ({filteredLog.length})
        </button>
      </div>

      {/* Storage Management — Cleanup UI (Tahap 11 — Phase 1) */}
      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', padding: '14px 18px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Trash2 size={14} strokeWidth={1.5} style={{color: 'var(--ims-text-2)'}} />
          <span style={{fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>
            {lang === 'id' ? 'Manajemen Penyimpanan' : 'Storage Management'}
          </span>
        </div>
        <div style={{fontSize: '11.5px', color: 'var(--ims-text-2)'}}>
          {lang === 'id' ? 'Total' : 'Total'}: <strong style={{color: 'var(--ims-text)'}}>{auditLog.length}</strong> {lang === 'id' ? 'entri' : 'entries'} ({sizeKB} KB)
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto'}}>
          <span style={{fontSize: '11.5px', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Hapus log lebih lama dari:' : 'Delete logs older than:'}</span>
          <select value={cleanupDays} onChange={e => setCleanupDays(e.target.value)} style={{width: 'auto', minWidth: '110px'}}>
            <option value="7">7 {lang === 'id' ? 'hari' : 'days'}</option>
            <option value="30">30 {lang === 'id' ? 'hari' : 'days'}</option>
            <option value="90">90 {lang === 'id' ? 'hari' : 'days'}</option>
            <option value="180">180 {lang === 'id' ? 'hari' : 'days'}</option>
            <option value="365">365 {lang === 'id' ? 'hari' : 'days'}</option>
            <option value="all">{lang === 'id' ? 'Semua (hapus total)' : 'All (delete all)'}</option>
          </select>
          <button onClick={() => setCleanupConfirm(true)} style={{background: 'transparent', border: '1px solid #c03030', color: '#c03030', padding: '6px 12px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600}}>
            {lang === 'id' ? 'Hapus' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Cleanup confirmation modal */}
      {cleanupConfirm && (
        <div className="modal-overlay" onClick={() => setCleanupConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '440px'}}>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c03030', fontWeight: 700, marginBottom: '12px'}}>
              {lang === 'id' ? 'Konfirmasi Penghapusan' : 'Confirm Deletion'}
            </div>
            <div style={{fontSize: '14px', color: 'var(--ims-text)', marginBottom: '8px', lineHeight: 1.5}}>
              {cleanupDays === 'all'
                ? (lang === 'id' ? `Hapus SEMUA ${auditLog.length} entri log? Tindakan ini tidak dapat dibatalkan.` : `Delete ALL ${auditLog.length} log entries? This cannot be undone.`)
                : (lang === 'id' ? `Hapus entri log yang lebih lama dari ${cleanupDays} hari? Tindakan ini tidak dapat dibatalkan.` : `Delete log entries older than ${cleanupDays} days? This cannot be undone.`)}
            </div>
            <div style={{fontSize: '12px', color: 'var(--ims-text-2)', marginBottom: '20px', lineHeight: 1.5}}>
              {lang === 'id' ? 'Data terhapus akan sync ke semua device dalam beberapa detik.' : 'Deleted data will sync across all devices within seconds.'}
            </div>
            <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
              <button onClick={() => setCleanupConfirm(false)} className="btn-ghost">
                {lang === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button onClick={handleCleanup} style={{background: '#c03030', border: 'none', color: '#fff', padding: '9px 18px', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600}}>
                {lang === 'id' ? 'Hapus Sekarang' : 'Delete Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log table */}
      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', minWidth: '900px'}}>
          <thead>
            <tr style={{background: 'var(--ims-bg-card-2)'}}>
              <Th>{lang === 'id' ? 'Waktu' : 'Timestamp'}</Th>
              <Th>{lang === 'id' ? 'Pengguna' : 'User'}</Th>
              <Th>{lang === 'id' ? 'Modul' : 'Module'}</Th>
              <Th>{lang === 'id' ? 'Aksi' : 'Action'}</Th>
              <Th>{lang === 'id' ? 'Entitas' : 'Entity'}</Th>
              <Th>{lang === 'id' ? 'Perubahan' : 'Change'}</Th>
            </tr>
          </thead>
          <tbody>
            {filteredLog.length === 0 && (
              <tr><Td colSpan={6}><div className="empty-state">{lang === 'id' ? 'Belum ada aktivitas tercatat' : 'No activity logged yet'}</div></Td></tr>
            )}
            {filteredLog.map(entry => {
              const dt = entry.timestamp ? new Date(entry.timestamp) : null;
              return (
                <tr key={entry.id} className="hover-row" style={{borderTop: '1px solid var(--ims-border)'}}>
                  <Td>
                    <span className="mono" style={{fontSize: '10.5px', color: 'var(--ims-text)'}}>{dt ? dt.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', { dateStyle: 'short', timeStyle: 'medium' }) : '—'}</span>
                  </Td>
                  <Td>
                    <div style={{fontWeight: 500}}>{entry.userName || entry.user}</div>
                    <div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{entry.role || '—'}</div>
                  </Td>
                  <Td>{moduleLabel(entry.module)}</Td>
                  <Td><span style={{padding: '2px 8px', fontSize: '10px', background: actionColor(entry.action) + '22', color: actionColor(entry.action), fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderRadius: '3px'}}>{entry.action}</span></Td>
                  <Td><span style={{fontSize: '11px'}}>{entry.entityLabel || '—'}</span></Td>
                  <Td>
                    {entry.field ? (
                      <div style={{fontSize: '11px'}}>
                        <span style={{color: 'var(--ims-text-2)'}}>{entry.field}: </span>
                        {entry.before != null && <span style={{color: '#c03030', textDecoration: 'line-through'}}>{String(entry.before).substring(0, 30)}</span>}
                        {entry.before != null && entry.after != null && <span style={{color: 'var(--ims-text-2)'}}> → </span>}
                        {entry.after != null && <span style={{color: 'var(--ims-accent-2)', fontWeight: 500}}>{String(entry.after).substring(0, 30)}</span>}
                      </div>
                    ) : (
                      <span style={{fontSize: '11px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{entry.note || '—'}</span>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {auditLog.length >= MAX_AUDIT_ENTRIES && (
        <div style={{marginTop: '10px', padding: '8px 12px', background: 'var(--ims-gold-bg)', border: '1px solid var(--ims-accent)', fontSize: '11px', color: '#5a4a1a'}}>
          ⚠ {lang === 'id' ? `Log mencapai batas maksimum ${MAX_AUDIT_ENTRIES} entri. Entri terlama akan otomatis dihapus saat aksi baru ditambahkan.` : `Log reached maximum of ${MAX_AUDIT_ENTRIES} entries. Oldest entries will be auto-removed on new activity.`}
        </div>
      )}
    </div>
  );
}

// ============== Module Access Authorization Panel (CEO/super_admin only) ==============
// Lets the CEO grant/revoke which modules each employee can open. Default = role's nav set.
function ModuleAccessPanel({ employees, moduleAccess, setModuleAccess, t, lang, empView, setEmpView, logAction }) {
  const ALL_MODULES = NAV_BY_ROLE.super_admin; // canonical ordered list of 21 modules
  const emps = useMemo(() => Object.entries(employees)
    .filter(([u, e]) => e && e.role !== 'super_admin') // CEO always retains full access — not editable here
    .map(([username, e]) => ({ username, ...e }))
    .sort((a, b) => ((a.active === false) - (b.active === false)) || (a.name || '').localeCompare(b.name || '')), [employees]);
  const effSet = (username, role) => {
    const ov = moduleAccess[username];
    return new Set(Array.isArray(ov) ? ov : (NAV_BY_ROLE[role] || ['dashboard']));
  };
  const toggle = (username, role, mod) => {
    if (mod === 'dashboard') return; // dashboard always on (prevents empty nav / lockout)
    setModuleAccess(prev => {
      const cur = new Set(Array.isArray(prev[username]) ? prev[username] : (NAV_BY_ROLE[role] || ['dashboard']));
      if (cur.has(mod)) cur.delete(mod); else cur.add(mod);
      cur.add('dashboard');
      const ordered = ALL_MODULES.filter(id => cur.has(id));
      if (logAction) logAction({ module: 'employees', action: 'update', entityId: username, entityLabel: `${lang === 'id' ? 'Akses modul' : 'Module access'}: ${username}`, field: mod, note: cur.has(mod) ? 'grant' : 'revoke' });
      return { ...prev, [username]: ordered };
    });
  };
  const resetDefault = (username) => {
    setModuleAccess(prev => { const c = { ...prev }; delete c[username]; return c; });
    if (logAction) logAction({ module: 'employees', action: 'update', entityId: username, entityLabel: `${lang === 'id' ? 'Akses modul' : 'Module access'}: ${username}`, note: 'reset to role default' });
  };
  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_employees}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.emp_title}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{lang === 'id' ? 'Atur modul yang dapat diakses tiap karyawan. Default mengikuti perannya — Anda bisa menambah atau mengurangi. Dasbor selalu aktif.' : 'Configure which modules each employee can open. Defaults follow their role — you may add or remove. Dashboard is always on.'}</div>
      </div>
      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid var(--ims-border)'}}>
        <button onClick={() => setEmpView('list')} style={{background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: 'var(--ims-text-2)', borderBottom: '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px'}}><Users size={14} strokeWidth={1.5} />{lang === 'id' ? 'Daftar Karyawan' : 'Employee List'}</button>
        <button onClick={() => setEmpView('access')} style={{background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: 'var(--ims-text)', borderBottom: '2px solid var(--ims-border)', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px'}}><Lock size={14} strokeWidth={1.5} />{lang === 'id' ? 'Otorisasi Akses Modul' : 'Module Authorization'}</button>
      </div>
      <div style={{padding: '10px 14px', background: '#102018', borderLeft: '3px solid var(--ims-accent-2)', fontSize: '11px', color: '#1a4d2a', marginBottom: '16px'}}>
        🔒 {lang === 'id' ? 'Panel ini hanya dapat diakses oleh Anda (CEO). Perubahan langsung tersimpan dan berlaku saat karyawan login berikutnya.' : 'This panel is accessible only by you (CEO). Changes save instantly and apply on the employee next login.'}
      </div>
      {emps.map(emp => {
        const set = effSet(emp.username, emp.role);
        const hasOverride = Array.isArray(moduleAccess[emp.username]);
        const inactive = emp.active === false;
        return (
          <div key={emp.username} style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', padding: '16px 18px', marginBottom: '14px', opacity: inactive ? 0.6 : 1}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px'}}>
              <div>
                <div style={{fontSize: '14px', fontWeight: 600}}>{emp.name}{inactive && <span style={{fontSize: '10px', color: 'var(--ims-accent)', marginLeft: '8px'}}>({lang === 'id' ? 'nonaktif' : 'inactive'})</span>}</div>
                <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{emp.position || emp.role} · <span className="mono">@{emp.username}</span> · {set.size} {lang === 'id' ? 'modul' : 'modules'} · {hasOverride ? (lang === 'id' ? 'kustom' : 'custom') : (lang === 'id' ? 'default peran' : 'role default')}</div>
              </div>
              <button onClick={() => resetDefault(emp.username)} disabled={!hasOverride} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '6px 12px', fontSize: '11px', fontFamily: 'inherit', cursor: hasOverride ? 'pointer' : 'default', color: hasOverride ? 'var(--ims-accent)' : '#c4bca8', borderRadius: '4px'}}>{lang === 'id' ? 'Reset ke Default' : 'Reset to Default'}</button>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '6px'}}>
              {ALL_MODULES.map(mod => {
                const on = set.has(mod);
                const locked = mod === 'dashboard';
                return (
                  <button key={mod} onClick={() => toggle(emp.username, emp.role, mod)} disabled={locked} title={locked ? (lang === 'id' ? 'Dasbor selalu aktif' : 'Dashboard always on') : ''} style={{padding: '8px 10px', fontSize: '11px', fontFamily: 'inherit', textAlign: 'left', cursor: locked ? 'default' : 'pointer', background: on ? '#1a4d2a' : '#fff', color: on ? '#fff' : 'var(--ims-text-2)', border: `1px solid ${on ? '#1a4d2a' : 'var(--ims-border)'}`, display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '4px'}}>
                    <span style={{fontSize: '12px', fontWeight: 700}}>{on ? '✓' : '○'}</span>{t[`nav_${mod}`] || mod}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {emps.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: 'var(--ims-text-2)', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>{t.no_data}</div>}
    </div>
  );
}

function EmployeesModule({ employees, setEmployees, setData, setReports, setBusinessTrips, setRealizations, t, lang, session, fmt, moduleAccess = {}, setModuleAccess, logAction }) {
  const canManage = ['super_admin', 'gm', 'manager_ops'].includes(session.role);
  const isCEO = session.role === 'super_admin';
  const [empView, setEmpView] = useState('list');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [confirmDeactivateUser, setConfirmDeactivateUser] = useState(null);
  const [confirmActivateUser, setConfirmActivateUser] = useState(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const [resetPwUser, setResetPwUser] = useState(null);
  const [filter, setFilter] = useState('all');

  // PERFORMANCE: Memoize transformation + filter
  const employeeArr = useMemo(() => Object.entries(employees).map(([username, data]) => ({ username, ...data })), [employees]);

  const filtered = useMemo(() => filter === 'active' ? employeeArr.filter(e => e.active !== false)
    : filter === 'inactive' ? employeeArr.filter(e => e.active === false)
    : employeeArr, [employeeArr, filter]);

  const sortedEmps = useMemo(() => {
    // Sort: active first, then by position rank
    const posOrder = { 'Direksi': 0, 'General Manager': 1, 'Manager Operasional': 2, 'Manager': 3, 'Supervisor': 4, 'Product Specialist': 5, 'Staff': 6, 'Security': 7, 'Office Boy/Girl': 8, '-': 99 };
    return [...filtered].sort((a, b) => {
      if ((a.active !== false) !== (b.active !== false)) return (a.active !== false) ? -1 : 1;
      return (posOrder[a.position] ?? 99) - (posOrder[b.position] ?? 99);
    });
  }, [filtered]);

  const reassignSalesReferences = (fromIds, toId = OFFICE_SALES_ID) => {
    const ids = new Set((fromIds || []).filter(Boolean));
    if (!ids.size) return;
    const stamp = new Date().toISOString();
    setData(prev => prev.map(row => ids.has(row.salesOwner) ? {
      ...row,
      salesOwner: toId,
      _reassignedToOffice: toId === OFFICE_SALES_ID ? { from: row.salesOwner, at: stamp, reason: 'employee_management_action' } : row._reassignedToOffice,
    } : row));
    setReports(prev => prev.map(row => ids.has(row.salesId) ? {
      ...row,
      salesId: toId,
      _reassignedToOffice: toId === OFFICE_SALES_ID ? { from: row.salesId, at: stamp, reason: 'employee_management_action' } : row._reassignedToOffice,
    } : row));
  };

  const reassignEmployeeUsername = (fromUsername, toUsername, toName) => {
    if (!fromUsername || !toUsername || fromUsername === toUsername) return;
    const patch = (row) => row.travelerUsername === fromUsername ? { ...row, travelerUsername: toUsername, travelerName: toName || resolveEmpName(employees, toUsername) } : row;
    setBusinessTrips(prev => prev.map(patch));
    setRealizations(prev => prev.map(patch));
  };

  const transferEmployeeReferencesToOffice = (username) => {
    const emp = employees[username];
    if (!emp) return;
    const officeName = resolveEmpName(employees, OFFICE_SALES_ID);
    if (emp.role === 'sales') reassignSalesReferences([employeeSalesId(username, emp), username], OFFICE_SALES_ID);
    const stamp = new Date().toISOString();
    const patch = (row) => row.travelerUsername === username ? {
      ...row,
      travelerUsername: OFFICE_SALES_ID,
      travelerName: officeName,
      position: row.position === undefined ? row.position : '-',
      allowancePerDay: row.allowancePerDay === undefined ? row.allowancePerDay : 0,
      _reassignedToOffice: { from: username, at: stamp, reason: 'employee_management_action' },
    } : row;
    setBusinessTrips(prev => prev.map(patch));
    setRealizations(prev => prev.map(patch));
  };

  const handleSave = (emp) => {
    const originalUsername = emp._renameFrom || emp.username;
    const previous = employees[originalUsername];
    const previousSalesId = previous?.role === 'sales' ? employeeSalesId(originalUsername, previous) : null;
    const nextSalesId = emp.role === 'sales' ? employeeSalesId(emp.username, emp) : null;
    // If username was renamed, remove old key and add new
    if (emp._renameFrom && emp._renameFrom !== emp.username) {
      const renameFrom = emp._renameFrom;
      const cleanEmp = { ...emp };
      delete cleanEmp._renameFrom;
      setEmployees(prev => {
        const next = { ...prev };
        const prevAliases = (prev[renameFrom] && prev[renameFrom]._prevUsernames) || [];
        cleanEmp._prevUsernames = [...prevAliases, renameFrom]; // remember old key so references stay synced
        delete next[renameFrom];
        next[emp.username] = cleanEmp;
        return next;
      });
    } else {
      const cleanEmp = { ...emp };
      delete cleanEmp._renameFrom;
      setEmployees(prev => ({ ...prev, [emp.username]: cleanEmp }));
    }
    if (previousSalesId && previousSalesId !== nextSalesId) {
      reassignSalesReferences([previousSalesId, originalUsername], nextSalesId || OFFICE_SALES_ID);
    }
    if (emp._renameFrom && emp._renameFrom !== emp.username) {
      reassignEmployeeUsername(emp._renameFrom, emp.username, emp.name);
    }
    setModalOpen(false); setEditingEmp(null);
  };

  const handleDeactivate = (username) => {
    if (username === OFFICE_SALES_ID) {
      showToast(lang === 'id' ? 'Akun kantor tidak boleh dinonaktifkan.' : 'Office account cannot be deactivated.', 'warning');
      setConfirmDeactivateUser(null);
      return;
    }
    transferEmployeeReferencesToOffice(username);
    setEmployees(prev => ({ ...prev, [username]: { ...prev[username], active: false } }));
    setConfirmDeactivateUser(null);
    logAction && logAction({ module: 'employees', action: 'deactivate', entityId: username, entityLabel: employees[username]?.name || username, note: 'Employee deactivated; owned sales/travel records reassigned to office where applicable.' });
  };
  const handleActivate = (username) => {
    setEmployees(prev => ({ ...prev, [username]: { ...prev[username], active: true } }));
    setConfirmActivateUser(null);
  };
  const handleDelete = (username) => {
    if (username === OFFICE_SALES_ID) {
      showToast(lang === 'id' ? 'Akun kantor tidak boleh dihapus.' : 'Office account cannot be deleted.', 'warning');
      setConfirmDeleteUser(null);
      return;
    }
    transferEmployeeReferencesToOffice(username);
    setEmployees(prev => {
      const next = { ...prev };
      delete next[username];
      return next;
    });
    setModuleAccess(prev => {
      const next = { ...(prev || {}) };
      delete next[username];
      return next;
    });
    setConfirmDeleteUser(null);
    logAction && logAction({ module: 'employees', action: 'delete', entityId: username, entityLabel: employees[username]?.name || username, note: 'Employee deleted; owned sales/travel records reassigned to office where applicable.' });
  };
  const handleResetPassword = (username) => {
    setEmployees(prev => ({ ...prev, [username]: { ...prev[username], password: 'hnti2026', mustChangePassword: true } }));
    setResetPwUser(null);
  };

  // KPI stats
  const totalEmps = employeeArr.length;
  const activeEmps = employeeArr.filter(e => e.active !== false).length;
  const inactiveEmps = employeeArr.filter(e => e.active === false).length;
  const byPosition = {};
  employeeArr.forEach(e => {
    if (e.active === false) return;
    byPosition[e.position] = (byPosition[e.position] || 0) + 1;
  });

  if (!canManage) {
    return (
      <div>
        <div style={{marginBottom: '22px'}}>
          <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_employees}</div>
          <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.emp_title}</h1>
        </div>
        <div style={{padding: '24px', background: 'var(--ims-gold-bg)', border: '1px solid var(--ims-accent)', borderLeft: '3px solid var(--ims-accent)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <Lock size={20} color="#8a6a2a" />
            <div style={{fontSize: '13px', color: '#5a4a1a'}}>{t.emp_restricted}</div>
          </div>
        </div>
      </div>
    );
  }

  if (isCEO && empView === 'access') {
    return <ModuleAccessPanel employees={employees} moduleAccess={moduleAccess} setModuleAccess={setModuleAccess} t={t} lang={lang} empView={empView} setEmpView={setEmpView} logAction={logAction} />;
  }

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_employees}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.emp_title}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.emp_subtitle}</div>
      </div>

      {isCEO && (
        <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid var(--ims-border)'}}>
          <button onClick={() => setEmpView('list')} style={{background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: 'var(--ims-text)', borderBottom: '2px solid var(--ims-border)', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px'}}><Users size={14} strokeWidth={1.5} />{lang === 'id' ? 'Daftar Karyawan' : 'Employee List'}</button>
          <button onClick={() => setEmpView('access')} style={{background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: 'var(--ims-text-2)', borderBottom: '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px'}}><Lock size={14} strokeWidth={1.5} />{lang === 'id' ? 'Otorisasi Akses Modul' : 'Module Authorization'}</button>
        </div>
      )}

      {/* KPI Strip */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div className="lbl-tag">{t.emp_total}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '4px'}}>{totalEmps}</div>
        </div>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div className="lbl-tag">{t.emp_active}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent-2)'}}>{activeEmps}</div>
        </div>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div className="lbl-tag">{t.emp_inactive}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-text-2)'}}>{inactiveEmps}</div>
        </div>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-alt)', color: 'var(--ims-text)'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: 'var(--ims-accent)', textTransform: 'uppercase'}}>{t.emp_by_position}</div>
          <div style={{fontSize: '11px', marginTop: '4px', lineHeight: 1.6}}>
            {Object.entries(byPosition).map(([pos, n]) => <div key={pos}><span style={{opacity: 0.7}}>{pos}:</span> <strong>{n}</strong></div>)}
          </div>
        </div>
      </div>

      {/* List + Add */}
      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{lang === 'id' ? 'Daftar Karyawan' : 'Employee List'}</div>
            <div style={{display: 'flex', gap: '4px'}}>
              {[
                { id: 'all', label: lang === 'id' ? 'Semua' : 'All' },
                { id: 'active', label: t.emp_active },
                { id: 'inactive', label: t.emp_inactive },
              ].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)} style={{padding: '4px 10px', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', background: filter === f.id ? 'var(--ims-accent)' : 'transparent', color: filter === f.id ? 'var(--ims-gold)' : 'var(--ims-text-2)', border: '1px solid ' + (filter === f.id ? 'var(--ims-accent)' : 'var(--ims-border)'), cursor: 'pointer', fontFamily: 'inherit'}}>{f.label}</button>
              ))}
            </div>
          </div>
          <button className="btn-primary" onClick={() => { setEditingEmp(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><UserPlus size={12} />{t.emp_add_btn}</button>
        </div>

        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px'}}>
          <thead>
            <tr style={{background: 'var(--ims-bg)'}}>
              <Th>{t.emp_username}</Th>
              <Th>{t.emp_name}</Th>
              <Th>{t.emp_position}</Th>
              <Th>{t.emp_role}</Th>
              <Th align="right">{t.emp_allowance}</Th>
              <Th align="center">Status</Th>
              <Th align="center">{t.actions}</Th>
            </tr>
          </thead>
          <tbody>
            {sortedEmps.map(emp => {
              const isInactive = emp.active === false;
              const isOfficeAccount = emp.username === OFFICE_SALES_ID || emp.isOffice;
              const posColors = { 'Direksi': '#7b3fb5', 'General Manager': '#1a4d8a', 'Manager Operasional': '#0f7a5a', 'Manager': 'var(--ims-gold)', 'Supervisor': '#5b87b8', 'Product Specialist': '#9b5a8a', 'Staff': '#94a3b8', 'Security': '#6b7280', 'Office Boy/Girl': '#a78971' };
              const posColor = posColors[emp.position] || 'var(--ims-text-2)';
              return (
                <tr key={emp.username} style={{borderTop: '1px solid var(--ims-border)', opacity: isInactive ? 0.55 : 1}}>
                  <Td><span className="mono" style={{fontWeight: 600, color: 'var(--ims-text)'}}>{emp.username}</span></Td>
                  <Td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <div style={{width: '26px', height: '26px', borderRadius: '50%', background: posColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, flexShrink: 0}}>{initialOf(emp.name)}</div>
                      <div>
                        <div style={{fontWeight: 500}}>{emp.name}</div>
                        {emp.salesId && <div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>Sales ID: {emp.salesId}</div>}
                      </div>
                    </div>
                  </Td>
                  <Td><span style={{padding: '2px 8px', fontSize: '10px', background: posColor + '25', color: posColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{emp.position}</span></Td>
                  <Td><span style={{fontSize: '11px', color: 'var(--ims-text)'}}>{t[`role_${emp.role}`] || emp.role}</span></Td>
                  <Td align="right"><span className="mono" style={{fontSize: '11px', color: 'var(--ims-text)', fontWeight: 500}}>{emp.allowancePerDay > 0 ? fmt(emp.allowancePerDay) : '-'}</span></Td>
                  <Td align="center">
                    {isInactive
                      ? <span style={{padding: '2px 8px', fontSize: '10px', background: 'var(--ims-text-2)25', color: 'var(--ims-text-2)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t.emp_status_inactive}</span>
                      : <span style={{padding: '2px 8px', fontSize: '10px', background: 'var(--ims-accent-2)25', color: 'var(--ims-accent-2)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t.emp_status_active}</span>}
                  </Td>
                  <Td align="center">
                    <div style={{display: 'flex', gap: '4px', justifyContent: 'center'}}>
                      <button onClick={() => { setEditingEmp(emp); setModalOpen(true); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit'}} title={t.crud_edit}><Edit2 size={11} /></button>
                      <button onClick={() => setResetPwUser(emp.username)} style={{background: 'transparent', border: '1px solid #1a4d8a', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#1a4d8a', fontFamily: 'inherit'}} title={t.emp_reset_pw}><Lock size={11} /></button>
                      {isInactive
                        ? <>
                            <button onClick={() => setConfirmActivateUser(emp.username)} style={{background: 'transparent', border: '1px solid var(--ims-accent-2)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-accent-2)', fontFamily: 'inherit'}} title={t.emp_activate}><UserCheck size={11} /></button>
                            {!isOfficeAccount && <button onClick={() => setConfirmDeleteUser(emp.username)} style={{background: 'transparent', border: '1px solid #c03030', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}} title={t.emp_delete}><Trash2 size={11} /></button>}
                          </>
                        : (emp.username !== session.username && !isOfficeAccount && <button onClick={() => setConfirmDeactivateUser(emp.username)} style={{background: 'transparent', border: '1px solid var(--ims-accent)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-accent)', fontFamily: 'inherit'}} title={t.emp_deactivate}><UserX size={11} /></button>)}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sortedEmps.length === 0 && <div className="empty-state">{t.no_data}</div>}
      </div>

      {modalOpen && <EmployeeModal emp={editingEmp} employees={employees} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingEmp(null); }} t={t} lang={lang} />}
      <ConfirmDialog open={!!confirmDeactivateUser} title={lang === 'id' ? 'Non-aktifkan Karyawan?' : 'Deactivate Employee?'} message={t.emp_confirm_deactivate} confirmText={lang === 'id' ? 'Ya, Non-aktifkan' : 'Yes, Deactivate'} onConfirm={() => handleDeactivate(confirmDeactivateUser)} onCancel={() => setConfirmDeactivateUser(null)} danger lang={lang} />
      <ConfirmDialog open={!!confirmActivateUser} title={lang === 'id' ? 'Aktifkan Karyawan?' : 'Activate Employee?'} message={t.emp_confirm_activate} confirmText={lang === 'id' ? 'Ya, Aktifkan' : 'Yes, Activate'} onConfirm={() => handleActivate(confirmActivateUser)} onCancel={() => setConfirmActivateUser(null)} lang={lang} />
      <ConfirmDialog open={!!confirmDeleteUser} title={lang === 'id' ? 'Hapus Akun Permanen?' : 'Delete Account Permanently?'} message={lang === 'id' ? `Akun "${confirmDeleteUser}" akan dihapus permanen dan tidak bisa dikembalikan. Semua histori login akun ini akan hilang. Lanjutkan?` : `Account "${confirmDeleteUser}" will be permanently deleted and cannot be recovered. Continue?`} confirmText={lang === 'id' ? 'Ya, Hapus Permanen' : 'Yes, Delete Permanently'} onConfirm={() => handleDelete(confirmDeleteUser)} onCancel={() => setConfirmDeleteUser(null)} danger lang={lang} />
      <ConfirmDialog open={!!resetPwUser} title={lang === 'id' ? 'Atur Ulang Kata Sandi?' : 'Reset Password?'} message={lang === 'id' ? `Password akun "${resetPwUser}" akan direset ke default (hnti2026). Karyawan wajib menggantinya saat login berikutnya. Lanjutkan?` : `Password for "${resetPwUser}" will be reset to default (hnti2026). The employee must change it on next login. Continue?`} confirmText={lang === 'id' ? 'Ya, Reset' : 'Yes, Reset'} onConfirm={() => handleResetPassword(resetPwUser)} onCancel={() => setResetPwUser(null)} lang={lang} />
    </div>
  );
}

// ============== Employee Add/Edit Modal ==============
function EmployeeModal({ emp, employees, onSave, onClose, t, lang }) {
  const isEdit = !!emp;
  const [form, setForm] = useState(emp || {
    username: '', name: '', initial: '',
    position: 'Staff', role: 'sales', allowancePerDay: 130000,
    password: 'hnti2026', active: true, salesId: '',
  });
  const [error, setError] = useState('');
  const update = (k, v) => { setError(''); setForm(prev => ({ ...prev, [k]: v })); };

  const updatePosition = (pos) => {
    setForm(prev => ({ ...prev, position: pos, allowancePerDay: POSITION_ALLOWANCE[pos] ?? prev.allowancePerDay }));
  };

  // Derive initial from name automatically
  const autoInitial = (name) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleSubmit = () => {
    if (!form.username || !form.name) {
      setError(lang === 'id' ? 'Username dan Nama wajib diisi.' : 'Username and Name are required.');
      return;
    }
    // Allow rename, but check duplicate (except if same as original)
    const originalUsername = isEdit ? emp.username : null;
    if (form.username !== originalUsername && employees[form.username]) {
      setError(t.emp_duplicate_username);
      return;
    }
    const finalForm = { ...form, initial: autoInitial(form.name) };
    // Pass original username for rename handling
    if (isEdit && originalUsername && originalUsername !== form.username) {
      finalForm._renameFrom = originalUsername;
    }
    onSave(finalForm);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.emp_modal_edit : t.emp_modal_add}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>
        {error && <div style={{padding: '10px 14px', background: '#c0303015', borderLeft: '3px solid #c03030', color: '#c03030', fontSize: '12px', marginBottom: '14px'}}>{error}</div>}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <Field label={t.emp_username}>
            <input value={form.username} onChange={e => update('username', e.target.value.toLowerCase().replace(/\s+/g, ''))} placeholder="contoh: budi" />
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>
              {isEdit
                ? (lang === 'id' ? '⚠ Mengubah username akan mempengaruhi login dan audit log. Pastikan tidak duplikat.' : '⚠ Changing username affects login and audit logs. Ensure uniqueness.')
                : t.emp_field_username_help}
            </div>
          </Field>
          <Field label={t.emp_name}>
            <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="contoh: Robby Dwi Setiawan" />
          </Field>
          <Field label={t.emp_position}>
            <select value={form.position} onChange={e => updatePosition(e.target.value)}>
              <option value="Staff">Staff (Rp 130.000)</option>
              <option value="Product Specialist">Product Specialist (Rp 150.000)</option>
              <option value="Supervisor">Supervisor (Rp 150.000)</option>
              <option value="Manager">Manager (Rp 175.000)</option>
              <option value="Manager Operasional">Manager Operasional (Rp 175.000)</option>
              <option value="General Manager">General Manager (Rp 175.000)</option>
              <option value="Direksi">Direksi (Rp 500.000)</option>
              <option value="Security">Security (Rp 100.000)</option>
              <option value="Office Boy/Girl">Office Boy/Girl (Rp 100.000)</option>
            </select>
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{t.emp_field_position_help}</div>
          </Field>
          <Field label={t.emp_role}>
            <select value={form.role} onChange={e => update('role', e.target.value)}>
              <option value="super_admin">Super Admin (CEO)</option>
              <option value="gm">General Manager</option>
              <option value="manager_ops">Manager Operasional</option>
              <option value="admin">Admin</option>
              <option value="finance">Finance</option>
              <option value="operations">Operations</option>
              <option value="technician">Technician</option>
              <option value="regulatory">Regulatory</option>
              <option value="sales">Sales</option>
              <option value="product_specialist">Product Specialist</option>
              <option value="security">Security</option>
              <option value="office_support">Office Support (OB)</option>
            </select>
          </Field>
          <Field label={t.emp_allowance}>
            <input type="number" value={form.allowancePerDay} onChange={e => update('allowancePerDay', parseInt(e.target.value) || 0)} />
          </Field>
          {form.role === 'sales' && (
            <Field label="Sales ID (untuk performance tracking)">
              <input value={form.salesId || ''} onChange={e => update('salesId', e.target.value.toLowerCase())} placeholder="otomatis = username" />
            </Field>
          )}
          <Field label={lang === 'id' ? 'Tanda Tangan (PNG, untuk dokumen)' : 'Signature (PNG, for documents)'} full>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap'}}>
              {form.signatureUrl ? (
                <div style={{width: '120px', height: '64px', border: '1px solid var(--ims-border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
                  <img src={form.signatureUrl} alt="TTD" style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />
                </div>
              ) : (
                <div style={{width: '120px', height: '64px', border: '1px dashed var(--ims-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Belum ada TTD' : 'No signature'}</div>
              )}
              <label className="btn-ghost" style={{fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px'}}>
                <Upload size={12} />{lang === 'id' ? 'Unggah TTD' : 'Upload Signature'}
                <input type="file" accept="image/png,image/*,.png,.jpg,.jpeg,.webp" style={{display: 'none'}} onChange={async (e) => {
                  const file = e.target.files && e.target.files[0];
                  if (!file) return;
                  if (file.size > 4 * 1024 * 1024) { showToast(lang === 'id' ? 'Maks 4 MB' : 'Max 4 MB', 'error'); e.target.value = ''; return; }
                  try { const reader = new FileReader(); reader.onload = () => update('signatureUrl', reader.result); reader.readAsDataURL(file); } catch { showToast('Gagal baca file', 'error'); }
                  e.target.value = '';
                }} />
              </label>
              {form.signatureUrl && <button type="button" onClick={() => update('signatureUrl', '')} className="btn-ghost" style={{fontSize: '11px', color: '#c03030'}}><X size={12} />{lang === 'id' ? 'Hapus' : 'Remove'}</button>}
            </div>
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '6px', fontStyle: 'italic'}}>{lang === 'id' ? 'TTD ini otomatis tersisip di SPH/SPP yang dibuat untuk akun ini.' : 'Auto-inserted into documents created for this account.'}</div>
          </Field>
        </div>
        <div style={{marginTop: '14px', padding: '10px 14px', background: 'var(--ims-gold-bg)', borderLeft: '3px solid var(--ims-accent)', fontSize: '11px', color: '#5a4a1a'}}>{t.emp_password_note}</div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
          <button className="btn-primary" onClick={handleSubmit}>{t.crud_save}</button>
        </div>
      </div>
    </div>
  );
}

// ============== Business Trip Module ==============
// Workflow approval 3-level: Karyawan → Finance → Manager Ops → GM → Paid → In Progress → Completed
function BusinessTripModule({ businessTrips, setBusinessTrips, realizations, setRealizations, employees, t, lang, session, fmt }) {
  const [tab, setTab] = useState('cash_advance');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [detailTrip, setDetailTrip] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // {action, trip, note}
  const [deleteTripId, setDeleteTripId] = useState(null);
  const [filterView, setFilterView] = useState('all'); // all | my | pending
  const [btSearch, setBtSearch] = useState('');
  const [btYear, setBtYear] = useState('all');

  // Realization state
  const [realizationFormOpen, setRealizationFormOpen] = useState(false);
  const [editingRealization, setEditingRealization] = useState(null);
  const [selectedTripForRealization, setSelectedTripForRealization] = useState(null);
  const [detailRealization, setDetailRealization] = useState(null);
  const [confirmRealizationAction, setConfirmRealizationAction] = useState(null); // {action, realization, note}
  const [deleteRealizationId, setDeleteRealizationId] = useState(null);
  const [confirmSettleId, setConfirmSettleId] = useState(null);

  // ═══════════ Export / Import handlers ═══════════
  const handleExportTrips = () => {
    const rows = [
      ['No Pengajuan', 'Nama Pegawai', 'Username', 'Posisi', 'Tujuan', 'Kota', 'Tanggal Mulai', 'Tanggal Selesai', 'Durasi (Hari)', 'Tujuan Perjalanan', 'Uang Muka Total', 'Status', 'Status Pembayaran', 'Tanggal Dibuat', 'Tanggal Update'],
      ...businessTrips.map(t => [
        t.requestNo || '',
        t.travelerName || '',
        t.travelerUsername || '',
        t.position || '',
        t.destination || '',
        t.destinationCity || '',
        t.dateStart || '',
        t.dateEnd || '',
        t.duration || '',
        t.purpose || '',
        t.totalAdvance || 0,
        t.status || '',
        t.paymentStatus || '',
        t.submittedAt || '',
        t.updatedAt || '',
      ])
    ];
    downloadCSV(`perjalanan_dinas_${new Date().toISOString().slice(0,10)}.csv`, rows);
    showToast(lang === 'id' ? `${businessTrips.length} pengajuan diekspor` : `${businessTrips.length} trips exported`, 'success');
  };
  const handleImportTrips = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = String(ev.target.result || '');
        // Strip BOM if present
        const cleaned = text.replace(/^\uFEFF/, '');
        const lines = cleaned.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) {
          showToast(lang === 'id' ? 'CSV kosong atau tidak valid' : 'CSV empty or invalid', 'error');
          return;
        }
        // Parse CSV line — simple split (assumes no commas in fields)
        const parseCSVLine = (line) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
              if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
              else inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
              result.push(current); current = '';
            } else {
              current += ch;
            }
          }
          result.push(current);
          return result;
        };
        const dataRows = lines.slice(1).map(parseCSVLine);
        const imported = dataRows.map((cols, idx) => ({
          id: 'bt_imp_' + Date.now() + '_' + idx,
          requestNo: cols[0] || ('IMP/' + Date.now() + '/' + idx),
          travelerName: cols[1] || '',
          travelerUsername: cols[2] || '',
          position: cols[3] || '',
          destination: cols[4] || '',
          destinationCity: cols[5] || '',
          dateStart: cols[6] || '',
          dateEnd: cols[7] || '',
          duration: parseInt(cols[8]) || 0,
          purpose: cols[9] || '',
          totalAdvance: parseFloat(cols[10]) || 0,
          status: cols[11] || 'draft',
          paymentStatus: cols[12] || '',
          submittedAt: cols[13] || new Date().toISOString(),
          updatedAt: cols[14] || new Date().toISOString(),
          itemsDp: [],
          history: [{ action: 'imported', timestamp: new Date().toISOString(), by: session.username, note: 'Imported from CSV' }],
        }));
        setBusinessTrips(prev => [...imported, ...prev]);
        showToast(lang === 'id' ? `${imported.length} pengajuan berhasil di-import` : `${imported.length} trips imported`, 'success');
      } catch (err) {
        console.error('[importTrips] error:', err);
        showToast(lang === 'id' ? 'Gagal parse CSV: ' + err.message : 'CSV parse failed: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportRealizations = () => {
    const rows = [
      ['No Realisasi', 'Nama Pegawai', 'Username', 'Tujuan', 'Tanggal Selesai', 'Total Realisasi', 'Status', 'Settlement Status', 'Tanggal Submit'],
      ...realizations.map(r => [
        r.realizationNo || '',
        r.travelerName || '',
        r.travelerUsername || '',
        r.destination || '',
        r.actualEndDate || r.dateEnd || '',
        r.totalRealized || 0,
        r.status || '',
        r.settlementStatus || '',
        r.submittedAt || '',
      ])
    ];
    downloadCSV(`realisasi_${new Date().toISOString().slice(0,10)}.csv`, rows);
    showToast(lang === 'id' ? `${realizations.length} realisasi diekspor` : `${realizations.length} realizations exported`, 'success');
  };
  const handleImportRealizations = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const cleaned = String(ev.target.result || '').replace(/^\uFEFF/, '');
        const lines = cleaned.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) {
          showToast(lang === 'id' ? 'CSV kosong' : 'CSV empty', 'error');
          return;
        }
        const parseCSVLine = (line) => {
          const result = []; let current = ''; let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') { if (inQuotes && line[i+1] === '"') { current += '"'; i++; } else inQuotes = !inQuotes; }
            else if (ch === ',' && !inQuotes) { result.push(current); current = ''; }
            else current += ch;
          }
          result.push(current); return result;
        };
        const imported = lines.slice(1).map(parseCSVLine).map((cols, idx) => ({
          id: 'real_imp_' + Date.now() + '_' + idx,
          realizationNo: cols[0] || ('IMP/REAL/' + Date.now() + '/' + idx),
          travelerName: cols[1] || '',
          travelerUsername: cols[2] || '',
          destination: cols[3] || '',
          actualEndDate: cols[4] || '',
          totalRealized: parseFloat(cols[5]) || 0,
          status: cols[6] || 'draft',
          settlementStatus: cols[7] || '',
          submittedAt: cols[8] || new Date().toISOString(),
          history: [{ action: 'imported', timestamp: new Date().toISOString(), by: session.username, note: 'Imported from CSV' }],
        }));
        setRealizations(prev => [...imported, ...prev]);
        showToast(lang === 'id' ? `${imported.length} realisasi di-import` : `${imported.length} realizations imported`, 'success');
      } catch (err) {
        console.error('[importRealizations] error:', err);
        showToast(lang === 'id' ? 'Gagal parse CSV: ' + err.message : 'Parse failed: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Determine what user can see
  const canManageAll = ['super_admin', 'gm', 'manager_ops', 'finance'].includes(session.role);
  const isReviewer = ['finance', 'manager_ops', 'gm', 'super_admin'].includes(session.role);
  const btSearchTerm = btSearch.trim().toLowerCase();
  const btYears = useMemo(() => {
    const years = new Set();
    [...businessTrips, ...realizations].forEach(r => {
      ['dateStart', 'dateEnd', 'submittedAt', 'updatedAt', 'paidDate', 'settlementDate'].forEach(k => {
        if (r?.[k]) years.add(String(r[k]).slice(0, 4));
      });
    });
    return [...years].filter(Boolean).sort().reverse();
  }, [businessTrips, realizations]);
  const matchesBtFilters = (row) => {
    const text = [row.requestNo, row.realizationNo, row.travelerName, row.travelerUsername, row.destination, row.destinationCity, row.purpose, row.status, row.tripStatus, row.paymentStatus].filter(Boolean).join(' ').toLowerCase();
    const matchSearch = !btSearchTerm || text.includes(btSearchTerm);
    const matchYear = btYear === 'all' || ['dateStart', 'dateEnd', 'submittedAt', 'updatedAt', 'paidDate', 'settlementDate'].some(k => String(row?.[k] || '').startsWith(btYear));
    return matchSearch && matchYear;
  };

  // Filter trips based on user
  const visibleTrips = useMemo(() => {
    let arr = businessTrips.map(t => ({
      ...t,
      travelerName: resolveEmpName(employees, t.travelerUsername || t.travelerName),
      approvalHistory: Array.isArray(t.approvalHistory) ? t.approvalHistory.map(h => ({ ...h, byName: resolveEmpName(employees, h.by || h.byName) })) : t.approvalHistory,
    }));
    if (!canManageAll) {
      // Regular employees only see their own
      arr = arr.filter(t => t.travelerUsername === session.username);
    } else if (filterView === 'my') {
      arr = arr.filter(t => t.travelerUsername === session.username);
    } else if (filterView === 'pending') {
      // Pending review by current user's role
      if (session.role === 'finance') arr = arr.filter(t => t.status === 'pending_finance');
      else if (session.role === 'manager_ops') arr = arr.filter(t => t.status === 'pending_mops');
      else if (session.role === 'gm') arr = arr.filter(t => t.status === 'pending_gm');
      else arr = arr.filter(t => ['pending_finance', 'pending_mops', 'pending_gm'].includes(t.status));
    }
    arr = arr.filter(matchesBtFilters);
    // Sort: newest first
    return arr.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
  }, [businessTrips, session, filterView, canManageAll, employees, btSearchTerm, btYear]);

  // Stats
  const totalTrips = businessTrips.length;
  const myTrips = businessTrips.filter(t => t.travelerUsername === session.username).length;
  let pendingForMe = 0;
  if (session.role === 'finance') pendingForMe = businessTrips.filter(t => t.status === 'pending_finance').length;
  else if (session.role === 'manager_ops') pendingForMe = businessTrips.filter(t => t.status === 'pending_mops').length;
  else if (session.role === 'gm') pendingForMe = businessTrips.filter(t => t.status === 'pending_gm').length;

  const totalAdvance = businessTrips
    .filter(t => ['approved', 'paid', 'in_progress', 'completed'].includes(t.status))
    .reduce((sum, t) => sum + (t.totalAdvance || 0), 0);

  // ============== Handlers ==============
  const handleSubmit = (trip) => {
    // From draft → pending_finance
    const updated = {
      ...trip,
      status: 'pending_finance',
      submittedAt: trip.submittedAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      approvalHistory: [...(trip.approvalHistory || []), {
        level: 'submit', by: session.username, byName: session.name,
        date: new Date().toISOString().split('T')[0], action: 'submitted', note: ''
      }]
    };
    setBusinessTrips(prev => {
      const exists = prev.find(x => x.id === trip.id);
      return exists ? prev.map(x => x.id === trip.id ? updated : x) : [...prev, updated];
    });
    setModalOpen(false); setEditingTrip(null);
  };

  const handleSaveDraft = (trip) => {
    // Save as draft (no status change to pending)
    const updated = { ...trip, updatedAt: new Date().toISOString().split('T')[0] };
    setBusinessTrips(prev => {
      const exists = prev.find(x => x.id === trip.id);
      return exists ? prev.map(x => x.id === trip.id ? updated : x) : [...prev, updated];
    });
    setModalOpen(false); setEditingTrip(null);
  };

  const handleApprove = (trip, note) => {
    // Determine next status based on current
    let nextStatus = trip.status;
    let level = '';
    if (trip.status === 'pending_finance') { nextStatus = 'pending_mops'; level = 'finance'; }
    else if (trip.status === 'pending_mops') { nextStatus = 'pending_gm'; level = 'manager_ops'; }
    else if (trip.status === 'pending_gm') { nextStatus = 'approved'; level = 'gm'; }

    const updated = {
      ...trip, status: nextStatus,
      updatedAt: new Date().toISOString().split('T')[0],
      approvalHistory: [...(trip.approvalHistory || []), {
        level, by: session.username, byName: session.name,
        date: new Date().toISOString().split('T')[0], action: 'approved', note: note || ''
      }]
    };
    setBusinessTrips(prev => prev.map(x => x.id === trip.id ? updated : x));
    setConfirmAction(null); setDetailTrip(updated);
  };

  const handleReject = (trip, note) => {
    let level = '';
    if (trip.status === 'pending_finance') level = 'finance';
    else if (trip.status === 'pending_mops') level = 'manager_ops';
    else if (trip.status === 'pending_gm') level = 'gm';

    const updated = {
      ...trip, status: 'rejected', tripStatus: 'cancelled',
      updatedAt: new Date().toISOString().split('T')[0],
      approvalHistory: [...(trip.approvalHistory || []), {
        level, by: session.username, byName: session.name,
        date: new Date().toISOString().split('T')[0], action: 'rejected', note: note || ''
      }]
    };
    setBusinessTrips(prev => prev.map(x => x.id === trip.id ? updated : x));
    setConfirmAction(null); setDetailTrip(updated);
  };

  const handleClarify = (trip, note) => {
    let level = '';
    if (trip.status === 'pending_finance') level = 'finance';
    else if (trip.status === 'pending_mops') level = 'manager_ops';
    else if (trip.status === 'pending_gm') level = 'gm';

    const updated = {
      ...trip, status: 'clarification',
      updatedAt: new Date().toISOString().split('T')[0],
      approvalHistory: [...(trip.approvalHistory || []), {
        level, by: session.username, byName: session.name,
        date: new Date().toISOString().split('T')[0], action: 'clarification', note: note || ''
      }]
    };
    setBusinessTrips(prev => prev.map(x => x.id === trip.id ? updated : x));
    setConfirmAction(null); setDetailTrip(updated);
  };

  const handleMarkPaid = (trip, note) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = {
      ...trip, status: 'in_progress', tripStatus: 'planned', paymentStatus: 'paid',
      paidDate: today, paidAmount: trip.totalAdvance,
      updatedAt: today,
      approvalHistory: [...(trip.approvalHistory || []), {
        level: 'finance', by: session.username, byName: session.name,
        date: today, action: 'paid', note: note || `Transfer Rp ${trip.totalAdvance.toLocaleString('id-ID')}`
      }]
    };
    setBusinessTrips(prev => prev.map(x => x.id === trip.id ? updated : x));
    setConfirmAction(null); setDetailTrip(updated);
  };

  const handleDelete = () => {
    setBusinessTrips(prev => prev.filter(x => x.id !== deleteTripId));
    setDeleteTripId(null);
  };

  // ============== REALIZATION HANDLERS ==============
  // Trip yang eligible untuk dilaporkan: status in_progress atau completed yang sudah paid, dan belum punya realisasi
  const eligibleTripsForRealization = useMemo(() => {
    return businessTrips.filter(t =>
      ['in_progress', 'completed'].includes(t.status) &&
      t.paymentStatus === 'paid' &&
      t.travelerUsername === session.username
    );
  }, [businessTrips, session.username]);

  // Visible realizations based on user role
  const visibleRealizations = useMemo(() => {
    let arr = realizations.map(r => ({
      ...r,
      travelerName: resolveEmpName(employees, r.travelerUsername || r.travelerName),
      approvalHistory: Array.isArray(r.approvalHistory) ? r.approvalHistory.map(h => ({ ...h, byName: resolveEmpName(employees, h.by || h.byName) })) : r.approvalHistory,
    }));
    if (!canManageAll) {
      arr = arr.filter(r => r.travelerUsername === session.username);
    } else if (filterView === 'my') {
      arr = arr.filter(r => r.travelerUsername === session.username);
    } else if (filterView === 'pending') {
      if (session.role === 'finance') arr = arr.filter(r => r.status === 'pending_finance');
      else if (session.role === 'manager_ops') arr = arr.filter(r => r.status === 'pending_mops');
      else if (session.role === 'gm') arr = arr.filter(r => r.status === 'pending_gm');
      else arr = arr.filter(r => ['pending_finance', 'pending_mops', 'pending_gm'].includes(r.status));
    }
    arr = arr.filter(matchesBtFilters);
    return arr.sort((a, b) => (b.submittedAt || b.updatedAt || '').localeCompare(a.submittedAt || a.updatedAt || ''));
  }, [realizations, session, filterView, canManageAll, employees, btSearchTerm, btYear]);

  // Stats for realization tab
  const pendingRealizationsForMe = useMemo(() => {
    if (session.role === 'finance') return realizations.filter(r => r.status === 'pending_finance').length;
    if (session.role === 'manager_ops') return realizations.filter(r => r.status === 'pending_mops').length;
    if (session.role === 'gm') return realizations.filter(r => r.status === 'pending_gm').length;
    return 0;
  }, [realizations, session.role]);

  const handleSubmitRealization = (realization) => {
    // From draft → pending_finance
    const updated = {
      ...realization,
      status: 'pending_finance',
      submittedAt: realization.submittedAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      approvalHistory: [...(realization.approvalHistory || []), {
        level: 'submit', by: session.username, byName: session.name,
        date: new Date().toISOString().split('T')[0], action: 'submitted', note: ''
      }]
    };
    setRealizations(prev => {
      const exists = prev.find(x => x.id === realization.id);
      return exists ? prev.map(x => x.id === realization.id ? updated : x) : [...prev, updated];
    });
    // Link realization to trip
    setBusinessTrips(prev => prev.map(t =>
      t.id === realization.businessTripId ? { ...t, realizationId: realization.id } : t
    ));
    setRealizationFormOpen(false);
    setEditingRealization(null);
    setSelectedTripForRealization(null);
  };

  const handleSaveRealizationDraft = (realization) => {
    const updated = { ...realization, updatedAt: new Date().toISOString().split('T')[0] };
    setRealizations(prev => {
      const exists = prev.find(x => x.id === realization.id);
      return exists ? prev.map(x => x.id === realization.id ? updated : x) : [...prev, updated];
    });
    setBusinessTrips(prev => prev.map(t =>
      t.id === realization.businessTripId ? { ...t, realizationId: realization.id } : t
    ));
    setRealizationFormOpen(false);
    setEditingRealization(null);
    setSelectedTripForRealization(null);
  };

  const handleApproveRealization = (realization, note) => {
    // Realization workflow sama dengan Cash Advance: pending_finance → pending_mops → pending_gm → approved
    let nextStatus = realization.status;
    let level = '';
    if (realization.status === 'pending_finance') { nextStatus = 'pending_mops'; level = 'finance'; }
    else if (realization.status === 'pending_mops') { nextStatus = 'pending_gm'; level = 'manager_ops'; }
    else if (realization.status === 'pending_gm') { nextStatus = 'approved'; level = 'gm'; }

    const updated = {
      ...realization, status: nextStatus,
      updatedAt: new Date().toISOString().split('T')[0],
      approvalHistory: [...(realization.approvalHistory || []), {
        level, by: session.username, byName: session.name,
        date: new Date().toISOString().split('T')[0], action: 'approved', note: note || ''
      }]
    };
    setRealizations(prev => prev.map(x => x.id === realization.id ? updated : x));
    setConfirmRealizationAction(null);
    setDetailRealization(updated);
  };

  const handleClarifyRealization = (realization, note) => {
    let level = '';
    if (realization.status === 'pending_finance') level = 'finance';
    else if (realization.status === 'pending_mops') level = 'manager_ops';
    else if (realization.status === 'pending_gm') level = 'gm';

    const updated = {
      ...realization, status: 'clarification',
      updatedAt: new Date().toISOString().split('T')[0],
      approvalHistory: [...(realization.approvalHistory || []), {
        level, by: session.username, byName: session.name,
        date: new Date().toISOString().split('T')[0], action: 'clarification', note: note || ''
      }]
    };
    setRealizations(prev => prev.map(x => x.id === realization.id ? updated : x));
    setConfirmRealizationAction(null);
    setDetailRealization(updated);
  };

  const handleSettle = (realizationId) => {
    const today = new Date().toISOString().split('T')[0];
    setRealizations(prev => prev.map(r => {
      if (r.id !== realizationId) return r;
      return {
        ...r,
        settlementStatus: 'settled',
        settlementDate: today,
        settlementAmount: Math.abs(r.difference),
        settlementNote: r.difference > 0
          ? `Karyawan kembalikan kelebihan Rp ${Math.abs(r.difference).toLocaleString('id-ID')}`
          : (r.difference < 0 ? `Kantor reimburse kekurangan Rp ${Math.abs(r.difference).toLocaleString('id-ID')}` : 'Tidak ada selisih'),
      };
    }));
    setConfirmSettleId(null);
  };

  const handleDeleteRealization = () => {
    setRealizations(prev => prev.filter(x => x.id !== deleteRealizationId));
    setDeleteRealizationId(null);
  };

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_business_trip}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.bt_title}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.bt_subtitle}</div>
      </div>

      {/* KPI Strip */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '14px 16px', background: 'var(--ims-bg-card)'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{canManageAll ? t.bt_all_trips : t.bt_my_trips}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '3px'}}>{canManageAll ? totalTrips : myTrips}</div>
        </div>
        {isReviewer && (
          <div style={{padding: '14px 16px', background: pendingForMe > 0 ? 'var(--ims-gold-bg)' : 'var(--ims-bg-card)', borderLeft: pendingForMe > 0 ? '3px solid var(--ims-accent)' : 'none'}}>
            <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.bt_pending_review}</div>
            <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '3px', color: pendingForMe > 0 ? 'var(--ims-gold)' : 'var(--ims-accent)'}}>{pendingForMe}</div>
            <div style={{fontSize: '9px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'butuh review Anda' : 'awaiting your review'}</div>
          </div>
        )}
        {canManageAll && (
          <div style={{padding: '14px 16px', background: 'var(--ims-bg-alt)', color: 'var(--ims-text)'}}>
            <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-accent)', textTransform: 'uppercase'}}>{t.bt_total_advance_label}</div>
            <div className="serif mono" style={{fontSize: '18px', fontWeight: 500, marginTop: '3px', color: '#fff'}}>{fmt(totalAdvance)}</div>
            <div style={{fontSize: '9px', color: 'rgba(255,255,255,0.6)', marginTop: '2px'}}>{lang === 'id' ? 'disetujui & dibayar' : 'approved & paid'}</div>
          </div>
        )}
      </div>

      <div style={{display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '18px'}}>
        <div style={{position: 'relative', flex: '1 1 280px', minWidth: '220px'}}>
          <Search size={14} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ims-text-2)'}} />
          <input value={btSearch} onChange={e => setBtSearch(e.target.value)} placeholder={lang === 'id' ? 'Cari traveler, tujuan, nomor perjalanan, status...' : 'Search traveler, destination, trip number, status...'} style={{paddingLeft: '36px'}} />
        </div>
        <select value={btYear} onChange={e => setBtYear(e.target.value)} style={{width: '150px'}}>
          <option value="all">{lang === 'id' ? 'Semua Tahun' : 'All Years'}</option>
          {btYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div style={{display: 'flex', gap: '2px', marginBottom: '20px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {[
          { id: 'cash_advance', label: t.bt_tab_cash_advance, icon: Receipt },
          { id: 'realization', label: t.bt_tab_realization, icon: FileCheck },
          { id: 'dashboard', label: t.bt_tab_dashboard, icon: Activity },
        ].map(tb => {
          const Icon = tb.icon;
          const active = tab === tb.id;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: active ? 'var(--ims-accent)' : 'var(--ims-text-2)', borderBottom: active ? '2px solid var(--ims-border)' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px', letterSpacing: '0.03em'}}>
              <Icon size={14} strokeWidth={1.5} />{tb.label}
            </button>
          );
        })}
      </div>

      {/* CASH ADVANCE TAB */}
      {tab === 'cash_advance' && (
        <div>
          {/* Filter + Add buttons */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px'}}>
            {canManageAll && (
              <div style={{display: 'flex', gap: '4px'}}>
                {[
                  { id: 'all', label: t.bt_all_trips },
                  { id: 'my', label: t.bt_my_trips },
                  { id: 'pending', label: t.bt_pending_review },
                ].map(f => (
                  <button key={f.id} onClick={() => setFilterView(f.id)} style={{padding: '5px 11px', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', background: filterView === f.id ? 'var(--ims-accent)' : 'transparent', color: filterView === f.id ? 'var(--ims-gold)' : 'var(--ims-text-2)', border: '1px solid ' + (filterView === f.id ? 'var(--ims-accent)' : 'var(--ims-border)'), cursor: 'pointer', fontFamily: 'inherit'}}>{f.label}</button>
                ))}
              </div>
            )}
            <div style={{flex: canManageAll ? 'none' : 1}}></div>
            <button onClick={handleExportTrips} className="btn-ghost" style={{fontSize: '11px', padding: '6px 12px'}} title={lang === 'id' ? 'Export pengajuan ke CSV' : 'Export trips to CSV'}><Download size={12} />{lang === 'id' ? 'Export' : 'Export'}</button>
            {canManageAll && <label className="btn-ghost" style={{fontSize: '11px', padding: '6px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px'}} title={lang === 'id' ? 'Import pengajuan dari CSV' : 'Import trips from CSV'}><Upload size={12} />{lang === 'id' ? 'Import' : 'Import'}<input type="file" accept=".csv,text/csv" style={{display: 'none'}} onChange={handleImportTrips} /></label>}
            <button className="btn-primary" onClick={() => { setEditingTrip(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.bt_add_btn}</button>
          </div>

          {/* Trips list */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {visibleTrips.map(trip => <BusinessTripCard key={trip.id} trip={trip} t={t} lang={lang} session={session} fmt={fmt} onDetail={() => setDetailTrip(trip)} onEdit={() => { setEditingTrip(trip); setModalOpen(true); }} onDelete={() => setDeleteTripId(trip.id)} />)}
            {visibleTrips.length === 0 && <div style={{padding: '40px', textAlign: 'center', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', color: 'var(--ims-text-2)'}}>{t.bt_no_data}</div>}
          </div>
        </div>
      )}

      {/* REALIZATION TAB */}
      {tab === 'realization' && (
        <div>
          {/* Filter + Add */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px'}}>
            {canManageAll && (
              <div style={{display: 'flex', gap: '4px'}}>
                {[
                  { id: 'all', label: t.bt_all_trips },
                  { id: 'my', label: t.bt_my_trips },
                  { id: 'pending', label: t.bt_pending_review + (pendingRealizationsForMe > 0 ? ` (${pendingRealizationsForMe})` : '') },
                ].map(f => (
                  <button key={f.id} onClick={() => setFilterView(f.id)} style={{padding: '5px 11px', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', background: filterView === f.id ? 'var(--ims-accent)' : 'transparent', color: filterView === f.id ? 'var(--ims-gold)' : 'var(--ims-text-2)', border: '1px solid ' + (filterView === f.id ? 'var(--ims-accent)' : 'var(--ims-border)'), cursor: 'pointer', fontFamily: 'inherit'}}>{f.label}</button>
                ))}
              </div>
            )}
            <div style={{flex: canManageAll ? 'none' : 1}}></div>
            <button onClick={handleExportRealizations} className="btn-ghost" style={{fontSize: '11px', padding: '6px 12px'}} title="Export realisasi"><Download size={12} />Export</button>
            {canManageAll && <label className="btn-ghost" style={{fontSize: '11px', padding: '6px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px'}} title="Import realisasi dari CSV"><Upload size={12} />Import<input type="file" accept=".csv,text/csv" style={{display: 'none'}} onChange={handleImportRealizations} /></label>}
            {eligibleTripsForRealization.length > 0 && (
              <button className="btn-primary" onClick={() => { setEditingRealization(null); setSelectedTripForRealization(null); setRealizationFormOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.btr_add_btn}</button>
            )}
          </div>

          {/* Eligible trips banner (for current user only) */}
          {!canManageAll && eligibleTripsForRealization.length > 0 && (
            <div style={{padding: '12px 16px', background: 'var(--ims-gold-bg)', borderLeft: '3px solid var(--ims-accent)', marginBottom: '14px', fontSize: '12px'}}>
              <strong>{t.btr_eligible_trips}:</strong> {eligibleTripsForRealization.length} {lang === 'id' ? 'trip yang siap dilaporkan realisasinya' : 'trip(s) ready for realization'}.
            </div>
          )}
          {!canManageAll && eligibleTripsForRealization.length === 0 && visibleRealizations.length === 0 && (
            <div style={{padding: '40px', textAlign: 'center', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', color: 'var(--ims-text-2)', fontSize: '13px'}}>
              <FileCheck size={36} strokeWidth={1.2} style={{color: 'var(--ims-text-2)', marginBottom: '12px'}} />
              <div style={{fontStyle: 'italic'}}>{t.btr_no_eligible_trips}</div>
            </div>
          )}

          {/* Realizations list */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {visibleRealizations.map(r => <BusinessTripRealizationCard key={r.id} realization={r} t={t} lang={lang} session={session} fmt={fmt} onDetail={() => setDetailRealization(r)} onEdit={() => { setEditingRealization(r); setSelectedTripForRealization(businessTrips.find(bt => bt.id === r.businessTripId)); setRealizationFormOpen(true); }} onDelete={() => setDeleteRealizationId(r.id)} />)}
            {visibleRealizations.length === 0 && canManageAll && <div style={{padding: '40px', textAlign: 'center', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', color: 'var(--ims-text-2)'}}>{t.btr_no_realization}</div>}
          </div>
        </div>
      )}

      {/* DASHBOARD TAB - Analytics */}
      {tab === 'dashboard' && <BusinessTripDashboard businessTrips={visibleTrips} realizations={visibleRealizations} employees={employees} t={t} lang={lang} session={session} canManageAll={canManageAll} fmt={fmt} />}

      {/* Modals */}
      {modalOpen && <BusinessTripForm trip={editingTrip} employees={employees} session={session} fmt={fmt} onSubmit={handleSubmit} onSaveDraft={handleSaveDraft} onClose={() => { setModalOpen(false); setEditingTrip(null); }} t={t} lang={lang} />}
      {detailTrip && <BusinessTripDetail trip={detailTrip} session={session} t={t} lang={lang} fmt={fmt} onClose={() => setDetailTrip(null)} onAction={(action, note) => setConfirmAction({ action, trip: detailTrip, note })} />}

      {/* Confirm dialogs */}
      <ConfirmDialog open={!!confirmAction && confirmAction.action === 'approve'} title={lang === 'id' ? 'Setujui Pengajuan?' : 'Approve Request?'} message={t.bt_confirm_approve + (confirmAction?.note ? '\n\nCatatan: ' + confirmAction.note : '')} confirmText={t.bt_action_approve} onConfirm={() => handleApprove(confirmAction.trip, confirmAction.note)} onCancel={() => setConfirmAction(null)} lang={lang} />
      <ConfirmDialog open={!!confirmAction && confirmAction.action === 'reject'} title={lang === 'id' ? 'Tolak Pengajuan?' : 'Reject Request?'} message={t.bt_confirm_reject + (confirmAction?.note ? '\n\nAlasan: ' + confirmAction.note : '')} confirmText={t.bt_action_reject} onConfirm={() => handleReject(confirmAction.trip, confirmAction.note)} onCancel={() => setConfirmAction(null)} danger lang={lang} />
      <ConfirmDialog open={!!confirmAction && confirmAction.action === 'clarify'} title={lang === 'id' ? 'Minta Klarifikasi?' : 'Request Clarification?'} message={t.bt_confirm_clarify + (confirmAction?.note ? '\n\nCatatan: ' + confirmAction.note : '')} confirmText={t.bt_action_clarify} onConfirm={() => handleClarify(confirmAction.trip, confirmAction.note)} onCancel={() => setConfirmAction(null)} lang={lang} />
      <ConfirmDialog open={!!confirmAction && confirmAction.action === 'mark_paid'} title={lang === 'id' ? 'Konfirmasi Pencairan?' : 'Confirm Disbursement?'} message={t.bt_confirm_mark_paid} confirmText={t.bt_action_mark_paid} onConfirm={() => handleMarkPaid(confirmAction.trip, confirmAction.note)} onCancel={() => setConfirmAction(null)} lang={lang} />
      <ConfirmDialog open={!!deleteTripId} title={lang === 'id' ? 'Hapus Pengajuan?' : 'Delete Request?'} message={lang === 'id' ? 'Yakin ingin menghapus pengajuan ini? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to delete this request? This action cannot be undone.'} onConfirm={handleDelete} onCancel={() => setDeleteTripId(null)} danger lang={lang} />

      {/* Realization Modals */}
      {realizationFormOpen && <BusinessTripRealizationForm fmt={fmt} realization={editingRealization} preSelectedTrip={selectedTripForRealization} eligibleTrips={eligibleTripsForRealization} existingRealizations={realizations} session={session} onSubmit={handleSubmitRealization} onSaveDraft={handleSaveRealizationDraft} onClose={() => { setRealizationFormOpen(false); setEditingRealization(null); setSelectedTripForRealization(null); }} t={t} lang={lang} />}
      {detailRealization && <BusinessTripRealizationDetail fmt={fmt} realization={detailRealization} businessTrip={businessTrips.find(t => t.id === detailRealization.businessTripId)} session={session} t={t} lang={lang} onClose={() => setDetailRealization(null)} onAction={(action, note) => setConfirmRealizationAction({ action, realization: detailRealization, note })} onSettle={() => setConfirmSettleId(detailRealization.id)} />}

      <ConfirmDialog open={!!confirmRealizationAction && confirmRealizationAction.action === 'approve'} title={lang === 'id' ? 'Setujui Realisasi?' : 'Approve Realization?'} message={t.btr_confirm_approve_realization || (lang === 'id' ? 'Yakin ingin menyetujui laporan realisasi ini? Akan diteruskan ke reviewer berikutnya.' : 'Approve this realization? It will be forwarded to next reviewer.')} confirmText={t.bt_action_approve} onConfirm={() => handleApproveRealization(confirmRealizationAction.realization, confirmRealizationAction.note)} onCancel={() => setConfirmRealizationAction(null)} lang={lang} />
      <ConfirmDialog open={!!confirmRealizationAction && confirmRealizationAction.action === 'clarify'} title={lang === 'id' ? 'Minta Klarifikasi?' : 'Request Clarification?'} message={t.btr_confirm_clarify_realization || (lang === 'id' ? 'Yakin ingin meminta klarifikasi? Realisasi dikembalikan ke karyawan untuk direvisi.' : 'Request clarification? Will be returned to employee.')} confirmText={t.bt_action_clarify} onConfirm={() => handleClarifyRealization(confirmRealizationAction.realization, confirmRealizationAction.note)} onCancel={() => setConfirmRealizationAction(null)} lang={lang} />
      <ConfirmDialog open={!!confirmSettleId} title={lang === 'id' ? 'Konfirmasi Settlement?' : 'Confirm Settlement?'} message={t.btr_confirm_settle} confirmText={t.btr_settle_now} onConfirm={() => handleSettle(confirmSettleId)} onCancel={() => setConfirmSettleId(null)} lang={lang} />
      <ConfirmDialog open={!!deleteRealizationId} title={lang === 'id' ? 'Hapus Realisasi?' : 'Delete Realization?'} message={lang === 'id' ? 'Yakin ingin menghapus laporan realisasi ini?' : 'Delete this realization report?'} onConfirm={handleDeleteRealization} onCancel={() => setDeleteRealizationId(null)} danger lang={lang} />
    </div>
  );
}

// ============== Business Trip Card (List item) ==============
// React.memo wrapped for performance — re-renders only when trip props change
const BusinessTripCard = React.memo(function BusinessTripCard({ trip, t, lang, session, fmt, onDetail, onEdit, onDelete }) {
  const statusColors = {
    draft: '#94a3b8', pending_finance: 'var(--ims-gold)', pending_mops: 'var(--ims-gold)', pending_gm: 'var(--ims-gold)',
    approved: '#5b87b8', paid: 'var(--ims-accent-2)', in_progress: '#5b87b8', completed: 'var(--ims-accent-2)',
    rejected: '#8b3a3a', clarification: 'var(--ims-gold-dim)', postponed: '#94a3b8', cancelled: '#8b3a3a'
  };
  const statusColor = statusColors[trip.status] || 'var(--ims-text-2)';
  const isOwner = trip.travelerUsername === session.username;
  const canManageAll = ['super_admin', 'gm', 'manager_ops', 'finance'].includes(session.role);
  const canEdit = (isOwner && ['draft', 'clarification', 'rejected'].includes(trip.status)) || canManageAll;
  const canDelete = (isOwner && trip.status === 'draft') || canManageAll;  // Force-delete untuk admin

  return (
    <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', borderLeft: `3px solid ${statusColor}`, padding: '14px 18px', cursor: 'pointer'}} onClick={onDetail}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '10px'}}>
        <div style={{flex: '1 1 320px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap'}}>
            <span className="mono" style={{fontSize: '12px', fontWeight: 700, color: 'var(--ims-text)'}}>{trip.requestNo}</span>
            <span style={{padding: '2px 8px', fontSize: '9px', background: statusColor + '25', color: statusColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t['bt_status_' + trip.status]}</span>
            {trip.paymentStatus === 'paid' && <span style={{padding: '2px 8px', fontSize: '9px', background: 'var(--ims-accent-2)25', color: 'var(--ims-accent-2)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>✓ {t.bt_payment_paid}</span>}
          </div>
          <div style={{fontSize: '13px', fontWeight: 600, marginTop: '2px'}}>{trip.travelerName} <span style={{fontSize: '10px', color: 'var(--ims-text-2)', fontWeight: 400}}>· {trip.position}</span></div>
          <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '4px'}}>🎯 <strong>{trip.destination}</strong> · <span className="mono">{trip.dateStart} → {trip.dateEnd}</span> ({trip.duration} {t.days})</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{trip.purpose}</div>
        </div>
        <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px'}}>
          <div className="mono" style={{fontSize: '15px', fontWeight: 600, color: 'var(--ims-text)'}}>{fmt(trip.totalAdvance)}</div>
          <div style={{fontSize: '9px', color: 'var(--ims-text-2)', letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t.bt_total_advance}</div>
          <div style={{display: 'flex', gap: '4px', marginTop: '4px'}}>
            {canEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit'}} title={t.crud_edit}><Edit2 size={11} /></button>}
            {canDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}} title={t.crud_delete}><Trash2 size={11} /></button>}
          </div>
        </div>
      </div>
    </div>
  );
});

// ============== Business Trip Form (Add/Edit) ==============
function BusinessTripForm({ trip, employees, session, onSubmit, onSaveDraft, onClose, t, lang, fmt }) {
  const isEdit = !!trip;
  const todayStr = new Date().toISOString().split('T')[0];

  // Use current user as traveler (unless admin/manager editing for someone else - for now, self only)
  const traveler = employees[session.username] || { name: session.name, position: session.position, allowancePerDay: session.allowancePerDay };

  const [form, setForm] = useState(trip || {
    id: 'bt_' + Date.now(),
    requestNo: 'BT-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-5),
    travelerUsername: session.username, travelerName: session.name,
    position: traveler.position || 'Staff',
    allowancePerDay: traveler.allowancePerDay || POSITION_ALLOWANCE['Staff'],
    destination: '', destinationCity: '', purpose: '',
    dateStart: todayStr, dateEnd: todayStr, duration: 1,
    costs: { taxiHome: 0, taxiArrival: 0, taxiRs: 0, localTransport: 0, meals: 0, other: 0, otherNotes: '', allowanceTotal: traveler.allowancePerDay || 130000 },
    officeBooked: { ticketPP: 0, hotelTotal: 0, ticketNote: '', hotelNote: '' },
    bankAccount: { bankName: '', accountNo: '', holderName: traveler.name || session.name },
    status: 'draft', tripStatus: 'planned', paymentStatus: 'pending',
    paidDate: null, paidAmount: 0, paidProof: '',
    approvalHistory: [], submittedAt: '', updatedAt: '', realizationId: null,
  });

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const updateCost = (k, v) => setForm(prev => ({ ...prev, costs: { ...prev.costs, [k]: v } }));
  const updateOffice = (k, v) => setForm(prev => ({ ...prev, officeBooked: { ...prev.officeBooked, [k]: v } }));
  const updateBank = (k, v) => setForm(prev => ({ ...prev, bankAccount: { ...prev.bankAccount, [k]: v } }));

  // Auto-calc duration
  useEffect(() => {
    if (form.dateStart && form.dateEnd) {
      const d1 = new Date(form.dateStart);
      const d2 = new Date(form.dateEnd);
      const diff = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
      setForm(prev => {
        const allowanceTotal = diff * (prev.allowancePerDay || 130000);
        return { ...prev, duration: diff, costs: { ...prev.costs, allowanceTotal } };
      });
    }
  }, [form.dateStart, form.dateEnd, form.allowancePerDay]);

  // Calc total cash advance
  const totalCash = (form.costs.taxiHome || 0) + (form.costs.taxiArrival || 0) + (form.costs.taxiRs || 0) +
    (form.costs.localTransport || 0) + (form.costs.meals || 0) + (form.costs.other || 0) +
    (form.costs.allowanceTotal || 0);

  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const handleSubmitClick = () => {
    if (!form.destination || !form.purpose || !form.bankAccount.accountNo) {
      showToast(lang === 'id' ? 'Mohon lengkapi Tujuan, Keperluan, dan No. Rekening Bank.' : 'Please complete Destination, Purpose, and Bank Account Number.', 'warning');
      return;
    }
    setConfirmSubmit(true);
  };

  const handleConfirmSubmit = () => {
    const finalForm = { ...form, totalAdvance: totalCash };
    onSubmit(finalForm);
  };

  const handleDraftClick = () => {
    const finalForm = { ...form, totalAdvance: totalCash };
    onSaveDraft(finalForm);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '900px', maxHeight: '90vh', overflow: 'auto'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', position: 'sticky', top: 0, background: 'var(--ims-bg-card)', paddingBottom: '12px', borderBottom: '1px solid var(--ims-border)', zIndex: 1}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.bt_modal_edit : t.bt_modal_add}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>

        {/* Traveler info (read-only) */}
        <div style={{padding: '10px 14px', background: 'var(--ims-bg)', border: '1px solid var(--ims-border)', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '12px'}}>
          <div><strong>{t.bt_traveler}:</strong> {form.travelerName}</div>
          <div><strong>{t.bt_position}:</strong> {form.position}</div>
          <div><strong>{t.bt_allowance_daily}:</strong> <span className="mono">{fmt((form.allowancePerDay || 0))}</span></div>
        </div>

        {/* Section 1: Trip Detail */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>1. {lang === 'id' ? 'Detail Perjalanan' : 'Trip Detail'}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px'}}>
          <Field label={t.bt_destination}><input value={form.destination} onChange={e => update('destination', e.target.value)} placeholder="RS / Kota tujuan" /></Field>
          <Field label={t.bt_destination_city}><input value={form.destinationCity} onChange={e => update('destinationCity', e.target.value)} placeholder="Solo, Surabaya, dst" /></Field>
          <Field label={t.bt_purpose} full><textarea rows={2} value={form.purpose} onChange={e => update('purpose', e.target.value)} placeholder="Tujuan perjalanan secara detail" /></Field>
          <Field label={t.bt_date_start}><input type="date" value={form.dateStart} onChange={e => update('dateStart', e.target.value)} /></Field>
          <Field label={t.bt_date_end}><input type="date" value={form.dateEnd} onChange={e => update('dateEnd', e.target.value)} /></Field>
          <Field label={t.bt_duration}>
            <input type="number" value={form.duration} readOnly style={{background: 'var(--ims-bg-card-2)'}} />
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{lang === 'id' ? 'Otomatis dari tanggal mulai/akhir' : 'Auto from start/end date'}</div>
          </Field>
          <Field label={t.bt_allowance_total}>
            <input type="number" value={form.costs.allowanceTotal} readOnly style={{background: 'var(--ims-bg-card-2)'}} />
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{form.duration} × {fmt((form.allowancePerDay || 0))}</div>
          </Field>
        </div>

        {/* Section 2: Cost Components */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>2. {lang === 'id' ? 'Komponen Biaya (Cash Advance)' : 'Cost Components (Cash Advance)'}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px'}}>
          <Field label={t.bt_cost_taxi_home}><input type="number" value={form.costs.taxiHome} onChange={e => updateCost('taxiHome', parseInt(e.target.value) || 0)} /></Field>
          <Field label={t.bt_cost_taxi_arrival}><input type="number" value={form.costs.taxiArrival} onChange={e => updateCost('taxiArrival', parseInt(e.target.value) || 0)} /></Field>
          <Field label={t.bt_cost_taxi_rs}><input type="number" value={form.costs.taxiRs} onChange={e => updateCost('taxiRs', parseInt(e.target.value) || 0)} /></Field>
          <Field label={t.bt_cost_local_transport}><input type="number" value={form.costs.localTransport} onChange={e => updateCost('localTransport', parseInt(e.target.value) || 0)} /></Field>
          <Field label={t.bt_cost_meals}><input type="number" value={form.costs.meals} onChange={e => updateCost('meals', parseInt(e.target.value) || 0)} /></Field>
          <Field label={t.bt_cost_other}><input type="number" value={form.costs.other} onChange={e => updateCost('other', parseInt(e.target.value) || 0)} /></Field>
          <Field label={t.bt_cost_other_notes} full><input value={form.costs.otherNotes} onChange={e => updateCost('otherNotes', e.target.value)} placeholder="Detail item Lain-lain (parkir, retribusi, dll)" /></Field>
        </div>
        <div style={{padding: '12px 16px', background: 'var(--ims-bg-alt)', color: '#fff', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'}}>
          <div style={{fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ims-accent)'}}>{t.bt_total_advance}</div>
          <div className="mono" style={{fontSize: '22px', fontWeight: 600}}>{fmt(totalCash)}</div>
        </div>

        {/* Section 3: Office-booked (info only) */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>3. {t.bt_office_booked}</div>
        <div style={{padding: '10px 14px', background: 'var(--ims-gold-bg)', borderLeft: '3px solid var(--ims-accent)', fontSize: '11px', color: '#5a4a1a', marginBottom: '12px'}}>{lang === 'id' ? 'Tiket pesawat & hotel umumnya dipesankan oleh kantor. Nilai di bawah hanya untuk informasi, TIDAK ditransfer ke karyawan.' : 'Flight tickets & hotels are usually booked by office. Values below are FOR INFO ONLY, not transferred to employee.'}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px'}}>
          <Field label={t.bt_office_ticket + ' (Rp)'}><input type="number" value={form.officeBooked.ticketPP} onChange={e => updateOffice('ticketPP', parseInt(e.target.value) || 0)} /></Field>
          <Field label={t.bt_office_hotel + ' (Rp)'}><input type="number" value={form.officeBooked.hotelTotal} onChange={e => updateOffice('hotelTotal', parseInt(e.target.value) || 0)} /></Field>
          <Field label={lang === 'id' ? 'Detail Tiket' : 'Ticket Detail'}><input value={form.officeBooked.ticketNote} onChange={e => updateOffice('ticketNote', e.target.value)} placeholder="PNR / maskapai / rute" /></Field>
          <Field label={lang === 'id' ? 'Detail Hotel' : 'Hotel Detail'}><input value={form.officeBooked.hotelNote} onChange={e => updateOffice('hotelNote', e.target.value)} placeholder="Nama hotel / jumlah malam" /></Field>
        </div>

        {/* Section 4: Bank Account */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>4. {t.bt_bank_account}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px'}}>
          <Field label={t.bt_bank_name}><input value={form.bankAccount.bankName} onChange={e => updateBank('bankName', e.target.value)} placeholder="BCA / Mandiri / BNI / BRI" /></Field>
          <Field label={t.bt_bank_no}><input value={form.bankAccount.accountNo} onChange={e => updateBank('accountNo', e.target.value)} placeholder="No. rekening" /></Field>
          <Field label={t.bt_bank_holder}><input value={form.bankAccount.holderName} onChange={e => updateBank('holderName', e.target.value)} /></Field>
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid var(--ims-border)', paddingTop: '14px'}}>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{lang === 'id' ? '"Simpan Draft" untuk simpan tanpa kirim ke Finance. "Kirim ke Finance" untuk mulai workflow approval.' : '"Save Draft" stores without submitting. "Submit to Finance" starts approval workflow.'}</div>
          <div style={{display: 'flex', gap: '10px'}}>
            <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
            <button className="btn-ghost" onClick={handleDraftClick}>{lang === 'id' ? 'Simpan Draft' : 'Save Draft'}</button>
            <button className="btn-primary" onClick={handleSubmitClick}>{lang === 'id' ? 'Kirim ke Finance →' : 'Submit to Finance →'}</button>
          </div>
        </div>
      </div>
      <ConfirmDialog open={confirmSubmit} title={lang === 'id' ? 'Kirim ke Finance?' : 'Submit to Finance?'} message={t.bt_confirm_submit} confirmText={lang === 'id' ? 'Ya, Kirim' : 'Yes, Submit'} onConfirm={() => { setConfirmSubmit(false); handleConfirmSubmit(); }} onCancel={() => setConfirmSubmit(false)} lang={lang} />
    </div>
  );
}

// ============== Business Trip Detail (Review Modal) ==============
function BusinessTripDetail({ trip, session, t, lang, fmt, onClose, onAction }) {
  const [reviewNote, setReviewNote] = useState('');

  // Determine what actions current user can take
  const canReviewFinance = session.role === 'finance' && trip.status === 'pending_finance';
  const canReviewMops = ['manager_ops', 'super_admin'].includes(session.role) && trip.status === 'pending_mops';
  const canReviewGm = ['gm', 'super_admin'].includes(session.role) && trip.status === 'pending_gm';
  const canMarkPaid = session.role === 'finance' && trip.status === 'approved';

  const canReview = canReviewFinance || canReviewMops || canReviewGm;

  const statusColors = {
    draft: '#94a3b8', pending_finance: 'var(--ims-gold)', pending_mops: 'var(--ims-gold)', pending_gm: 'var(--ims-gold)',
    approved: '#5b87b8', paid: 'var(--ims-accent-2)', in_progress: '#5b87b8', completed: 'var(--ims-accent-2)',
    rejected: '#8b3a3a', clarification: 'var(--ims-gold-dim)',
  };
  const statusColor = statusColors[trip.status] || 'var(--ims-text-2)';

  // PERFORMANCE: Memoize workflow data (only recompute when lang or history changes)
  const { workflowSteps, completedSteps } = useMemo(() => {
    const steps = [
      { id: 'submit', label: lang === 'id' ? 'Diajukan' : 'Submitted' },
      { id: 'finance', label: 'Finance' },
      { id: 'manager_ops', label: 'Manager Ops' },
      { id: 'gm', label: 'GM' },
      { id: 'paid', label: lang === 'id' ? 'Cair' : 'Disbursed' },
    ];
    const done = new Set();
    (trip.approvalHistory || []).forEach(h => {
      if (h.action === 'submitted') done.add('submit');
      else if (h.action === 'approved') done.add(h.level);
      else if (h.action === 'paid') done.add('paid');
    });
    return { workflowSteps: steps, completedSteps: done };
  }, [lang, trip.approvalHistory]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '900px', maxHeight: '90vh', overflow: 'auto'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', position: 'sticky', top: 0, background: 'var(--ims-bg-card)', paddingBottom: '12px', borderBottom: '1px solid var(--ims-border)', zIndex: 1}}>
          <div>
            <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{t.bt_modal_detail}</h2>
            <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '4px'}} className="mono">{trip.requestNo}</div>
          </div>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>

        {/* Status banner */}
        <div style={{padding: '14px 18px', background: statusColor + '15', borderLeft: '3px solid ' + statusColor, marginBottom: '16px'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '4px'}}>Status</div>
          <div style={{fontSize: '15px', fontWeight: 600, color: statusColor}}>{t['bt_status_' + trip.status]}</div>
        </div>

        {/* Workflow steps visualization */}
        <div style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '20px', overflowX: 'auto', padding: '8px 0'}}>
          {workflowSteps.map((step, i) => {
            const done = completedSteps.has(step.id);
            const isRejected = trip.status === 'rejected';
            return (
              <React.Fragment key={step.id}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: '0 0 auto'}}>
                  <div style={{width: '32px', height: '32px', borderRadius: '50%', background: done && !isRejected ? 'var(--ims-accent-2)' : (isRejected ? '#c03030' : 'var(--ims-border)'), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600}}>{done ? '✓' : (i + 1)}</div>
                  <div style={{fontSize: '9px', letterSpacing: '0.05em', textTransform: 'uppercase', color: done ? 'var(--ims-accent)' : 'var(--ims-text-2)', fontWeight: done ? 600 : 400, whiteSpace: 'nowrap'}}>{step.label}</div>
                </div>
                {i < workflowSteps.length - 1 && <div style={{height: '2px', flex: 1, background: done ? 'var(--ims-accent-2)' : 'var(--ims-border)', minWidth: '20px'}} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Traveler info */}
        <div style={{padding: '12px 16px', background: 'var(--ims-bg)', border: '1px solid var(--ims-border)', marginBottom: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '12px'}}>
          <div><strong>{t.bt_traveler}:</strong> {trip.travelerName}</div>
          <div><strong>{t.bt_position}:</strong> {trip.position}</div>
          <div><strong>{t.bt_allowance_daily}:</strong> <span className="mono">{fmt(trip.allowancePerDay)}</span></div>
        </div>

        {/* Trip details */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{lang === 'id' ? 'Detail Perjalanan' : 'Trip Detail'}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px', fontSize: '12px', padding: '14px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
          <div><strong>{t.bt_destination}:</strong> {trip.destination}</div>
          <div><strong>{t.bt_destination_city}:</strong> {trip.destinationCity}</div>
          <div><strong>{t.bt_date_start}:</strong> <span className="mono">{trip.dateStart}</span></div>
          <div><strong>{t.bt_date_end}:</strong> <span className="mono">{trip.dateEnd}</span></div>
          <div><strong>{t.bt_duration}:</strong> {trip.duration} {t.days}</div>
          <div></div>
          <div style={{gridColumn: '1 / -1'}}><strong>{t.bt_purpose}:</strong> {trip.purpose}</div>
        </div>

        {/* Cost breakdown */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{lang === 'id' ? 'Breakdown Biaya' : 'Cost Breakdown'}</div>
        <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '12px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
          <tbody>
            <tr style={{borderBottom: '1px solid var(--ims-border)'}}><td style={{padding: '8px 14px'}}>{t.bt_cost_taxi_home}</td><td style={{padding: '8px 14px', textAlign: 'right'}} className="mono">{fmt(trip.costs.taxiHome)}</td></tr>
            <tr style={{borderBottom: '1px solid var(--ims-border)'}}><td style={{padding: '8px 14px'}}>{t.bt_cost_taxi_arrival}</td><td style={{padding: '8px 14px', textAlign: 'right'}} className="mono">{fmt(trip.costs.taxiArrival)}</td></tr>
            <tr style={{borderBottom: '1px solid var(--ims-border)'}}><td style={{padding: '8px 14px'}}>{t.bt_cost_taxi_rs}</td><td style={{padding: '8px 14px', textAlign: 'right'}} className="mono">{fmt(trip.costs.taxiRs)}</td></tr>
            <tr style={{borderBottom: '1px solid var(--ims-border)'}}><td style={{padding: '8px 14px'}}>{t.bt_cost_local_transport}</td><td style={{padding: '8px 14px', textAlign: 'right'}} className="mono">{fmt(trip.costs.localTransport)}</td></tr>
            <tr style={{borderBottom: '1px solid var(--ims-border)'}}><td style={{padding: '8px 14px'}}>{t.bt_cost_meals}</td><td style={{padding: '8px 14px', textAlign: 'right'}} className="mono">{fmt(trip.costs.meals)}</td></tr>
            <tr style={{borderBottom: '1px solid var(--ims-border)'}}><td style={{padding: '8px 14px'}}>{t.bt_cost_other} {trip.costs.otherNotes && <span style={{fontSize: '10px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>({trip.costs.otherNotes})</span>}</td><td style={{padding: '8px 14px', textAlign: 'right'}} className="mono">{fmt(trip.costs.other)}</td></tr>
            <tr style={{borderBottom: '1px solid var(--ims-border)', background: 'var(--ims-bg)'}}><td style={{padding: '8px 14px', fontWeight: 600}}>{t.bt_allowance_total} ({trip.duration} hari × {fmt(trip.allowancePerDay)})</td><td style={{padding: '8px 14px', textAlign: 'right', fontWeight: 600}} className="mono">{fmt(trip.costs.allowanceTotal)}</td></tr>
            <tr style={{background: 'var(--ims-bg-alt)', color: '#fff'}}><td style={{padding: '10px 14px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '11px'}}>{t.bt_total_advance}</td><td style={{padding: '10px 14px', textAlign: 'right', fontWeight: 700, fontSize: '14px'}} className="mono">{fmt(trip.totalAdvance)}</td></tr>
          </tbody>
        </table>

        {/* Office-booked */}
        {(trip.officeBooked.ticketPP > 0 || trip.officeBooked.hotelTotal > 0) && (
          <>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{t.bt_office_booked}</div>
            <div style={{padding: '10px 14px', background: 'var(--ims-gold-bg)', borderLeft: '3px solid var(--ims-accent)', marginBottom: '16px', fontSize: '12px'}}>
              {trip.officeBooked.ticketPP > 0 && <div><strong>✈ {t.bt_office_ticket}:</strong> <span className="mono">{fmt(trip.officeBooked.ticketPP)}</span> {trip.officeBooked.ticketNote && <span style={{color: 'var(--ims-text-2)', fontStyle: 'italic'}}>({trip.officeBooked.ticketNote})</span>}</div>}
              {trip.officeBooked.hotelTotal > 0 && <div style={{marginTop: '4px'}}><strong>🏨 {t.bt_office_hotel}:</strong> <span className="mono">{fmt(trip.officeBooked.hotelTotal)}</span> {trip.officeBooked.hotelNote && <span style={{color: 'var(--ims-text-2)', fontStyle: 'italic'}}>({trip.officeBooked.hotelNote})</span>}</div>}
            </div>
          </>
        )}

        {/* Bank account */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{t.bt_bank_account}</div>
        <div style={{padding: '12px 14px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', marginBottom: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px'}}>
          <div><strong>{t.bt_bank_name}:</strong> {trip.bankAccount.bankName || '-'}</div>
          <div><strong>{t.bt_bank_no}:</strong> <span className="mono">{trip.bankAccount.accountNo || '-'}</span></div>
          <div><strong>{t.bt_bank_holder}:</strong> {trip.bankAccount.holderName || '-'}</div>
        </div>

        {/* Payment info */}
        {trip.paymentStatus === 'paid' && (
          <>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{t.bt_payment_status}</div>
            <div style={{padding: '12px 14px', background: 'var(--ims-accent-2)15', borderLeft: '3px solid var(--ims-accent-2)', marginBottom: '16px', fontSize: '12px'}}>
              <div><strong>✓ {t.bt_payment_paid}</strong></div>
              <div style={{marginTop: '4px'}}><strong>{t.bt_paid_date}:</strong> <span className="mono">{trip.paidDate}</span> · <strong>{t.bt_paid_amount}:</strong> <span className="mono">{fmt(trip.paidAmount)}</span></div>
              {trip.paidProof && <div style={{marginTop: '6px'}}><LinkAttachment url={trip.paidProof} lang={lang} /></div>}
            </div>
          </>
        )}

        {/* Approval history */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{t.bt_approval_history}</div>
        <div style={{padding: '12px 14px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', marginBottom: '20px'}}>
          {(trip.approvalHistory || []).map((h, i) => {
            const actionColors = { submitted: '#5b87b8', approved: 'var(--ims-accent-2)', rejected: '#c03030', clarification: 'var(--ims-gold-dim)', paid: 'var(--ims-accent-2)' };
            const actionLabels = { 
              submitted: lang === 'id' ? 'Diajukan' : 'Submitted',
              approved: lang === 'id' ? 'Disetujui' : 'Approved',
              rejected: lang === 'id' ? 'Ditolak' : 'Rejected',
              clarification: lang === 'id' ? 'Minta Klarifikasi' : 'Requested Clarification',
              paid: lang === 'id' ? 'Dana Dicairkan' : 'Funds Disbursed',
            };
            const levelLabels = {
              submit: lang === 'id' ? 'Pengajuan' : 'Submission',
              finance: 'Finance',
              manager_ops: 'Manager Operasional',
              gm: 'General Manager',
            };
            return (
              <div key={i} style={{padding: '8px 0', borderBottom: i < trip.approvalHistory.length - 1 ? '1px dashed var(--ims-border)' : 'none', display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
                <div style={{width: '6px', height: '6px', borderRadius: '50%', background: actionColors[h.action] || 'var(--ims-text-2)', marginTop: '6px', flexShrink: 0}} />
                <div style={{flex: 1, fontSize: '12px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px'}}>
                    <span><strong style={{color: actionColors[h.action]}}>{actionLabels[h.action]}</strong> · {levelLabels[h.level]} oleh <strong>{h.byName}</strong></span>
                    <span className="mono" style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{h.date}</span>
                  </div>
                  {h.note && <div style={{fontSize: '11px', color: 'var(--ims-text)', marginTop: '4px', fontStyle: 'italic', padding: '6px 10px', background: 'var(--ims-bg-card-2)'}}>"{h.note}"</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Review actions */}
        {canReview && (
          <div style={{padding: '14px', background: 'var(--ims-gold-bg)', border: '1px solid var(--ims-accent)', borderLeft: '3px solid var(--ims-accent)', marginBottom: '12px'}}>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', color: '#5a4a1a', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{canReviewFinance ? t.bt_review_finance : canReviewMops ? t.bt_review_mops : t.bt_review_gm}</div>
            <Field label={t.bt_review_notes} full><textarea rows={2} value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder={lang === 'id' ? 'Catatan review (opsional untuk approve, wajib untuk reject/klarifikasi)' : 'Review notes (optional for approve, required for reject/clarification)'} /></Field>
            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px'}}>
              <button onClick={() => onAction('approve', reviewNote)} style={{background: 'var(--ims-accent-2)', color: '#fff', border: 'none', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, letterSpacing: '0.05em'}}>✓ {t.bt_action_approve}</button>
              <button onClick={() => { if (!reviewNote.trim()) { showToast(lang === 'id' ? 'Mohon isi catatan klarifikasi.' : 'Please provide clarification note.', 'warning'); return; } onAction('clarify', reviewNote); }} style={{background: 'var(--ims-gold-dim)', color: '#fff', border: 'none', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, letterSpacing: '0.05em'}}>⚠ {t.bt_action_clarify}</button>
              <button onClick={() => { if (!reviewNote.trim()) { showToast(lang === 'id' ? 'Mohon isi alasan penolakan.' : 'Please provide rejection reason.', 'warning'); return; } onAction('reject', reviewNote); }} style={{background: '#c03030', color: '#fff', border: 'none', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, letterSpacing: '0.05em'}}>✗ {t.bt_action_reject}</button>
            </div>
          </div>
        )}

        {/* Mark as paid action (Finance only, after approved) */}
        {canMarkPaid && (
          <div style={{padding: '14px', background: 'var(--ims-accent-2)15', border: '1px solid var(--ims-accent-2)', borderLeft: '3px solid var(--ims-accent-2)', marginBottom: '12px'}}>
            <div style={{fontSize: '12px', color: '#1a4d2a', marginBottom: '8px'}}>{lang === 'id' ? 'Pengajuan telah disetujui. Setelah dana ditransfer ke rekening karyawan, klik tombol di bawah.' : 'Request approved. After transferring funds to employee account, click button below.'}</div>
            <button onClick={() => onAction('mark_paid', '')} style={{background: 'var(--ims-accent-2)', color: '#fff', border: 'none', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, letterSpacing: '0.05em'}}>💸 {t.bt_action_mark_paid}</button>
          </div>
        )}

        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px', borderTop: '1px solid var(--ims-border)', paddingTop: '14px'}}>
          <button className="btn-ghost" onClick={onClose}>{lang === 'id' ? 'Tutup' : 'Close'}</button>
        </div>
      </div>
    </div>
  );
}

// ============== Business Trip Realization Card ==============
// React.memo wrapped for performance — re-renders only when realization props change
const BusinessTripRealizationCard = React.memo(function BusinessTripRealizationCard({ realization, t, lang, session, fmt, onDetail, onEdit, onDelete }) {
  const statusColors = {
    draft: '#94a3b8', pending_finance: 'var(--ims-gold)', pending_mops: 'var(--ims-gold)', pending_gm: 'var(--ims-gold)',
    approved: 'var(--ims-accent-2)', clarification: 'var(--ims-gold-dim)',
  };
  const statusColor = statusColors[realization.status] || 'var(--ims-text-2)';
  const isOwner = realization.travelerUsername === session.username;
  const canManageAll = ['super_admin', 'gm', 'manager_ops', 'finance'].includes(session.role);
  const canEdit = (isOwner && ['draft', 'clarification'].includes(realization.status)) || canManageAll;
  const canDelete = isOwner && realization.status === 'draft';

  // Difference color
  const diffColor = realization.difference > 0 ? 'var(--ims-gold-dim)' : (realization.difference < 0 ? '#5b87b8' : 'var(--ims-accent-2)');
  const diffLabel = realization.difference > 0 ? t.btr_difference_return : (realization.difference < 0 ? t.btr_difference_reimburse : t.btr_difference_zero);

  return (
    <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', borderLeft: `3px solid ${statusColor}`, padding: '14px 18px', cursor: 'pointer'}} onClick={onDetail}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '10px'}}>
        <div style={{flex: '1 1 320px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap'}}>
            <span className="mono" style={{fontSize: '12px', fontWeight: 700, color: 'var(--ims-text)'}}>{realization.realizationNo}</span>
            <span style={{padding: '2px 8px', fontSize: '9px', background: statusColor + '25', color: statusColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t['btr_status_' + realization.status] || realization.status}</span>
            {realization.status === 'approved' && realization.settlementStatus === 'pending' && realization.difference !== 0 && <span style={{padding: '2px 8px', fontSize: '9px', background: 'var(--ims-gold-dim)25', color: 'var(--ims-gold-dim)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>⏳ {t.btr_settlement_pending}</span>}
            {realization.settlementStatus === 'settled' && <span style={{padding: '2px 8px', fontSize: '9px', background: 'var(--ims-accent-2)25', color: 'var(--ims-accent-2)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>✓ {t.btr_settlement_done}</span>}
          </div>
          <div style={{fontSize: '13px', fontWeight: 600, marginTop: '2px'}}>{realization.travelerName} <span style={{fontSize: '10px', color: 'var(--ims-text-2)', fontWeight: 400}}>· {realization.position}</span></div>
          <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '4px'}}>🎯 <strong>{realization.destination}</strong> · <span className="mono">{realization.dateStart} → {realization.dateEnd}</span> · {realization.actualDays} {t.days} aktual</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{lang === 'id' ? 'Link ke' : 'Linked to'}: <span className="mono">{realization.businessTripNo}</span></div>
        </div>
        <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px'}}>
          <div style={{fontSize: '9px', color: 'var(--ims-text-2)', letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t.btr_total_actual}</div>
          <div className="mono" style={{fontSize: '14px', fontWeight: 600, color: 'var(--ims-text)'}}>{fmt(realization.totalActual)}</div>
          <div style={{fontSize: '9px', color: 'var(--ims-text-2)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '4px'}}>{t.btr_difference}</div>
          <div className="mono" style={{fontSize: '13px', fontWeight: 600, color: diffColor}}>{realization.difference > 0 ? '+' : ''}{fmt(realization.difference)}</div>
          <div style={{fontSize: '9px', color: diffColor, fontStyle: 'italic'}}>{diffLabel}</div>
          <div style={{display: 'flex', gap: '4px', marginTop: '6px'}}>
            {canEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit'}} title={t.crud_edit}><Edit2 size={11} /></button>}
            {canEdit && <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}} title={t.crud_delete || 'Hapus'}><Trash2 size={11} /></button>}
            {canDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}} title={t.crud_delete}><Trash2 size={11} /></button>}
          </div>
        </div>
      </div>
    </div>
  );
});

// ============== Business Trip Realization Form ==============
function BusinessTripRealizationForm({ realization, preSelectedTrip, eligibleTrips, existingRealizations, session, onSubmit, onSaveDraft, onClose, t, lang, fmt }) {
  const isEdit = !!realization;
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  // Trip selection: edit mode uses pre-selected, new mode requires picking from eligible
  // Filter out trips that already have a non-draft realization linked
  const availableTrips = useMemo(() => {
    if (isEdit) return eligibleTrips;
    const usedTripIds = new Set(existingRealizations.filter(r => r.status !== 'draft').map(r => r.businessTripId));
    return eligibleTrips.filter(t => !usedTripIds.has(t.id));
  }, [eligibleTrips, existingRealizations, isEdit]);

  const [selectedTripId, setSelectedTripId] = useState(realization?.businessTripId || preSelectedTrip?.id || (availableTrips[0]?.id || ''));
  const selectedTrip = useMemo(() => {
    if (realization) return eligibleTrips.find(t => t.id === realization.businessTripId) || preSelectedTrip;
    return availableTrips.find(t => t.id === selectedTripId) || availableTrips[0];
  }, [selectedTripId, availableTrips, realization, preSelectedTrip, eligibleTrips]);

  // Initialize form
  const initialForm = useMemo(() => {
    if (realization) return realization;
    if (!selectedTrip) return null;
    return {
      id: 'btr_' + Date.now(),
      realizationNo: 'BTR-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-5),
      businessTripId: selectedTrip.id,
      businessTripNo: selectedTrip.requestNo,
      travelerUsername: selectedTrip.travelerUsername,
      travelerName: selectedTrip.travelerName,
      position: selectedTrip.position,
      allowancePerDay: selectedTrip.allowancePerDay,
      destination: selectedTrip.destination,
      destinationCity: selectedTrip.destinationCity,
      dateStart: selectedTrip.dateStart,
      dateEnd: selectedTrip.dateEnd,
      plannedDays: selectedTrip.duration,
      actualDays: selectedTrip.duration,
      totalAdvanceReceived: selectedTrip.totalAdvance,
      // Pre-fill actual with planned amounts (user akan edit)
      actualCosts: {
        taxiHome: selectedTrip.costs.taxiHome,
        taxiArrival: selectedTrip.costs.taxiArrival,
        taxiRs: selectedTrip.costs.taxiRs,
        localTransport: selectedTrip.costs.localTransport,
        meals: selectedTrip.costs.meals,
        other: selectedTrip.costs.other,
        otherNotes: selectedTrip.costs.otherNotes,
      },
      actualAllowance: selectedTrip.duration * selectedTrip.allowancePerDay,
      totalActual: selectedTrip.totalAdvance,
      difference: 0,
      proofs: { taxiHome: '', taxiArrival: '', taxiRs: '', localTransport: '', meals: '', other: '' },
      notes: '',
      status: 'draft',
      approvalHistory: [],
      submittedAt: '', updatedAt: '',
      settlementStatus: 'pending', settlementDate: null, settlementAmount: 0, settlementNote: '',
    };
  }, [realization, selectedTrip]);

  const [form, setForm] = useState(initialForm);

  // Re-init when trip changes (for new realization)
  useEffect(() => {
    if (!isEdit && initialForm) setForm(initialForm);
  }, [selectedTripId]);

  if (!selectedTrip || !form) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <h3 className="serif" style={{margin: 0, marginBottom: '14px'}}>{t.btr_modal_add}</h3>
          <div style={{padding: '20px', background: 'var(--ims-gold-bg)', borderLeft: '3px solid var(--ims-accent)', color: '#5a4a1a', fontSize: '13px'}}>{t.btr_no_eligible_trips}</div>
          <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '14px'}}><button className="btn-ghost" onClick={onClose}>{lang === 'id' ? 'Tutup' : 'Close'}</button></div>
        </div>
      </div>
    );
  }

  const updateCost = (k, v) => setForm(prev => ({ ...prev, actualCosts: { ...prev.actualCosts, [k]: v } }));
  const updateProof = (k, v) => setForm(prev => ({ ...prev, proofs: { ...prev.proofs, [k]: v } }));

  // PERFORMANCE: Compute totals via useMemo instead of useEffect→setForm (no extra render cycle)
  const computedTotals = useMemo(() => {
    const actualAllowance = (form.actualDays || 0) * (form.allowancePerDay || 0);
    const ac = form.actualCosts || {};
    const totalActual = (ac.taxiHome || 0) + (ac.taxiArrival || 0) + (ac.taxiRs || 0) +
      (ac.localTransport || 0) + (ac.meals || 0) + (ac.other || 0) + actualAllowance;
    const difference = (form.totalAdvanceReceived || 0) - totalActual;
    return { actualAllowance, totalActual, difference };
  }, [form.actualDays, form.allowancePerDay, form.actualCosts, form.totalAdvanceReceived]);

  // Keep form in sync for submit (only writes when computed differs - prevents loop)
  useEffect(() => {
    if (form.actualAllowance !== computedTotals.actualAllowance ||
        form.totalActual !== computedTotals.totalActual ||
        form.difference !== computedTotals.difference) {
      setForm(prev => ({ ...prev, ...computedTotals }));
    }
  }, [computedTotals, form.actualAllowance, form.totalActual, form.difference]);

  // Use computed for immediate display (so UI feels instant)
  const displayAllowance = computedTotals.actualAllowance;
  const displayTotalActual = computedTotals.totalActual;
  const displayDifference = computedTotals.difference;

  const diffColor = displayDifference > 0 ? 'var(--ims-gold-dim)' : (displayDifference < 0 ? '#5b87b8' : 'var(--ims-accent-2)');
  const diffLabel = displayDifference > 0 ? t.btr_difference_return : (displayDifference < 0 ? t.btr_difference_reimburse : t.btr_difference_zero);

  const handleSubmitClick = () => { setConfirmSubmit(true); };
  const handleConfirmSubmit = () => onSubmit(form);
  const handleDraftClick = () => onSaveDraft(form);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '950px', maxHeight: '90vh', overflow: 'auto'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', position: 'sticky', top: 0, background: 'var(--ims-bg-card)', paddingBottom: '12px', borderBottom: '1px solid var(--ims-border)', zIndex: 1}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.btr_modal_edit : t.btr_modal_add}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>

        {/* Trip selector (new mode only) */}
        {!isEdit && (
          <div style={{marginBottom: '14px'}}>
            <Field label={t.btr_select_trip}>
              <select value={selectedTripId} onChange={e => setSelectedTripId(e.target.value)}>
                {availableTrips.map(trip => <option key={trip.id} value={trip.id}>{trip.requestNo} — {trip.destination} ({trip.dateStart} → {trip.dateEnd}) · {fmt(trip.totalAdvance)}</option>)}
              </select>
            </Field>
          </div>
        )}

        {/* Trip info banner */}
        <div style={{padding: '12px 16px', background: 'var(--ims-bg)', border: '1px solid var(--ims-border)', marginBottom: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px', fontSize: '12px'}}>
          <div><strong>{t.bt_traveler}:</strong> {form.travelerName}</div>
          <div><strong>{t.bt_position}:</strong> {form.position}</div>
          <div><strong>{t.bt_allowance_daily}:</strong> <span className="mono">{fmt(form.allowancePerDay)}</span></div>
          <div><strong>{t.bt_destination}:</strong> {form.destination}</div>
          <div><strong>{lang === 'id' ? 'Rencana' : 'Planned'}:</strong> {form.plannedDays} {t.days}</div>
          <div><strong>{t.btr_cash_advance_received}:</strong> <span className="mono">{fmt(form.totalAdvanceReceived)}</span></div>
        </div>

        {/* Section: Actual Days */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>1. {t.btr_actual_days}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px'}}>
          <Field label={t.btr_actual_days}>
            <input type="number" min="1" max={form.plannedDays * 2} value={form.actualDays} onChange={e => setForm(prev => ({ ...prev, actualDays: parseInt(e.target.value) || 1 }))} />
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{t.btr_actual_days_help}</div>
          </Field>
          <Field label={t.btr_actual_allowance}>
            <input type="number" value={displayAllowance} readOnly style={{background: 'var(--ims-bg-card-2)'}} />
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{form.actualDays} × {fmt(form.allowancePerDay)} · {t.btr_no_proof_allowance}</div>
          </Field>
        </div>

        {/* Section: Actual Costs + Proofs */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>2. {t.btr_actual_cost}</div>
        <div style={{padding: '10px 14px', background: 'var(--ims-gold-bg)', borderLeft: '3px solid var(--ims-accent)', fontSize: '11px', color: '#5a4a1a', marginBottom: '12px'}}>{lang === 'id' ? 'Upload bukti struk/bill ke Google Drive, lalu paste URL share-nya untuk setiap item NON-allowance.' : 'Upload receipts to Google Drive then paste share URL for each NON-allowance item.'}</div>
        {[
          { key: 'taxiHome', label: t.btr_actual_taxi_home, planned: selectedTrip.costs.taxiHome },
          { key: 'taxiArrival', label: t.btr_actual_taxi_arrival, planned: selectedTrip.costs.taxiArrival },
          { key: 'taxiRs', label: t.btr_actual_taxi_rs, planned: selectedTrip.costs.taxiRs },
          { key: 'localTransport', label: t.btr_actual_local_transport, planned: selectedTrip.costs.localTransport },
          { key: 'meals', label: t.btr_actual_meals, planned: selectedTrip.costs.meals },
          { key: 'other', label: t.btr_actual_other, planned: selectedTrip.costs.other },
        ].map(item => (
          <div key={item.key} style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px', padding: '10px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
            <Field label={item.label}>
              <input type="number" value={form.actualCosts[item.key] || 0} onChange={e => updateCost(item.key, parseInt(e.target.value) || 0)} />
              <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{t.btr_column_planned}: <span className="mono">{fmt(item.planned)}</span></div>
            </Field>
            <Field label={t.btr_proof}>
              <input value={form.proofs[item.key] || ''} onChange={e => updateProof(item.key, e.target.value)} placeholder="https://drive.google.com/..." />
              <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{t.btr_proof_help}</div>
            </Field>
          </div>
        ))}

        {/* Total + Difference */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '20px', border: '1px solid var(--ims-border)'}}>
          <div style={{padding: '14px 16px', background: 'var(--ims-bg-card)'}}>
            <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.btr_cash_advance_received}</div>
            <div className="mono serif" style={{fontSize: '18px', fontWeight: 500, marginTop: '4px'}}>{fmt(form.totalAdvanceReceived)}</div>
          </div>
          <div style={{padding: '14px 16px', background: 'var(--ims-bg-card)'}}>
            <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.btr_total_actual}</div>
            <div className="mono serif" style={{fontSize: '18px', fontWeight: 500, marginTop: '4px'}}>{fmt(displayTotalActual)}</div>
          </div>
          <div style={{padding: '14px 16px', background: diffColor + '15', borderLeft: '3px solid ' + diffColor}}>
            <div style={{fontSize: '9px', letterSpacing: '0.2em', color: diffColor, textTransform: 'uppercase', fontWeight: 600}}>{t.btr_difference}</div>
            <div className="mono serif" style={{fontSize: '18px', fontWeight: 500, marginTop: '4px', color: diffColor}}>{displayDifference > 0 ? '+' : ''}{fmt(displayDifference)}</div>
            <div style={{fontSize: '10px', color: diffColor, fontStyle: 'italic', marginTop: '2px'}}>{diffLabel}</div>
          </div>
        </div>

        {/* Notes */}
        <Field label={t.btr_realization_notes} full><textarea rows={3} value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} placeholder={lang === 'id' ? 'Catatan tambahan tentang perjalanan & realisasi biaya' : 'Additional notes about the trip & cost realization'} /></Field>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid var(--ims-border)', paddingTop: '14px', marginTop: '14px'}}>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{lang === 'id' ? '"Simpan Draft" untuk lanjut input. "Kirim" untuk diverifikasi Finance → Manager Ops → GM.' : '"Save Draft" to continue. "Submit" for Finance → Manager Ops → GM verification.'}</div>
          <div style={{display: 'flex', gap: '10px'}}>
            <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
            <button className="btn-ghost" onClick={handleDraftClick}>{lang === 'id' ? 'Simpan Draft' : 'Save Draft'}</button>
            <button className="btn-primary" onClick={handleSubmitClick}>{t.btr_action_submit} →</button>
          </div>
        </div>
      </div>
      <ConfirmDialog open={confirmSubmit} title={lang === 'id' ? 'Kirim Realisasi?' : 'Submit Realization?'} message={t.btr_confirm_submit} confirmText={lang === 'id' ? 'Ya, Kirim' : 'Yes, Submit'} onConfirm={() => { setConfirmSubmit(false); handleConfirmSubmit(); }} onCancel={() => setConfirmSubmit(false)} lang={lang} />
    </div>
  );
}

// ============== Business Trip Realization Detail (Review Modal) ==============
function BusinessTripRealizationDetail({ realization, businessTrip, session, t, lang, fmt, onClose, onAction, onSettle }) {
  const [reviewNote, setReviewNote] = useState('');

  const canReviewFinance = session.role === 'finance' && realization.status === 'pending_finance';
  const canReviewMops = ['manager_ops', 'super_admin'].includes(session.role) && realization.status === 'pending_mops';
  const canReviewGm = ['gm', 'super_admin'].includes(session.role) && realization.status === 'pending_gm';
  const canSettle = session.role === 'finance' && realization.status === 'approved' && realization.settlementStatus === 'pending' && realization.difference !== 0;
  const canReview = canReviewFinance || canReviewMops || canReviewGm;

  const statusColors = {
    draft: '#94a3b8', pending_finance: 'var(--ims-gold)', pending_mops: 'var(--ims-gold)', pending_gm: 'var(--ims-gold)',
    approved: 'var(--ims-accent-2)', clarification: 'var(--ims-gold-dim)',
  };
  const statusColor = statusColors[realization.status] || 'var(--ims-text-2)';
  const diffColor = realization.difference > 0 ? 'var(--ims-gold-dim)' : (realization.difference < 0 ? '#5b87b8' : 'var(--ims-accent-2)');

  // Comparison rows
  // PERFORMANCE: Memoize comparison row config
  const compRows = useMemo(() => [
    { key: 'taxiHome', label: t.bt_cost_taxi_home, plannedKey: 'taxiHome' },
    { key: 'taxiArrival', label: t.bt_cost_taxi_arrival, plannedKey: 'taxiArrival' },
    { key: 'taxiRs', label: t.bt_cost_taxi_rs, plannedKey: 'taxiRs' },
    { key: 'localTransport', label: t.bt_cost_local_transport, plannedKey: 'localTransport' },
    { key: 'meals', label: t.bt_cost_meals, plannedKey: 'meals' },
    { key: 'other', label: t.bt_cost_other, plannedKey: 'other' },
  ], [t]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '950px', maxHeight: '90vh', overflow: 'auto'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', position: 'sticky', top: 0, background: 'var(--ims-bg-card)', paddingBottom: '12px', borderBottom: '1px solid var(--ims-border)', zIndex: 1}}>
          <div>
            <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{t.btr_modal_detail}</h2>
            <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '4px'}} className="mono">{realization.realizationNo} · {lang === 'id' ? 'Link' : 'Linked to'} {realization.businessTripNo}</div>
          </div>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>

        {/* Status banner */}
        <div style={{padding: '14px 18px', background: statusColor + '15', borderLeft: '3px solid ' + statusColor, marginBottom: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px'}}>
          <div>
            <div style={{fontSize: '10px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '4px'}}>Status</div>
            <div style={{fontSize: '15px', fontWeight: 600, color: statusColor}}>{t['btr_status_' + realization.status] || realization.status}</div>
          </div>
          {realization.settlementStatus === 'settled' && (
            <div style={{textAlign: 'right'}}>
              <div style={{fontSize: '10px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '4px'}}>{t.btr_settlement_status}</div>
              <div style={{fontSize: '13px', fontWeight: 600, color: 'var(--ims-accent-2)'}}>✓ {t.btr_settlement_done}</div>
              {realization.settlementDate && <div className="mono" style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{realization.settlementDate}</div>}
            </div>
          )}
        </div>

        {/* Trip info */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{t.btr_trip_info}</div>
        <div style={{padding: '12px 16px', background: 'var(--ims-bg)', border: '1px solid var(--ims-border)', marginBottom: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px', fontSize: '12px'}}>
          <div><strong>{t.bt_traveler}:</strong> {realization.travelerName}</div>
          <div><strong>{t.bt_position}:</strong> {realization.position}</div>
          <div><strong>{t.bt_destination}:</strong> {realization.destination}</div>
          <div><strong>{lang === 'id' ? 'Rencana' : 'Planned'}:</strong> {realization.plannedDays} {t.days}</div>
          <div><strong>{t.btr_actual_days}:</strong> <span style={{color: realization.actualDays < realization.plannedDays ? '#5b87b8' : 'var(--ims-accent)', fontWeight: 600}}>{realization.actualDays} {t.days}</span></div>
          <div><strong>{t.bt_allowance_daily}:</strong> <span className="mono">{fmt(realization.allowancePerDay)}</span></div>
        </div>

        {/* Comparison table */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{t.btr_comparison}</div>
        <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '12px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
          <thead>
            <tr style={{background: 'var(--ims-bg)'}}>
              <Th>{lang === 'id' ? 'Komponen' : 'Component'}</Th>
              <Th align="right">{t.btr_column_planned}</Th>
              <Th align="right">{t.btr_column_actual}</Th>
              <Th align="right">{t.btr_column_diff}</Th>
              <Th align="center">{t.btr_proof}</Th>
            </tr>
          </thead>
          <tbody>
            {compRows.map(row => {
              const planned = businessTrip ? businessTrip.costs[row.plannedKey] : 0;
              const actual = realization.actualCosts[row.key] || 0;
              const diff = planned - actual;
              const dColor = diff > 0 ? 'var(--ims-gold-dim)' : (diff < 0 ? '#5b87b8' : 'var(--ims-text-2)');
              return (
                <tr key={row.key} style={{borderTop: '1px solid var(--ims-border)'}}>
                  <Td>{row.label}{realization.actualCosts.otherNotes && row.key === 'other' ? <span style={{fontSize: '10px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}> ({realization.actualCosts.otherNotes})</span> : ''}</Td>
                  <Td align="right"><span className="mono">{fmt(planned)}</span></Td>
                  <Td align="right"><span className="mono" style={{fontWeight: actual !== planned ? 600 : 400}}>{fmt(actual)}</span></Td>
                  <Td align="right"><span className="mono" style={{color: dColor, fontWeight: diff !== 0 ? 600 : 400}}>{diff > 0 ? '+' : ''}{fmt(diff)}</span></Td>
                  <Td align="center">{realization.proofs[row.key] ? <LinkAttachment url={realization.proofs[row.key]} lang={lang} /> : <span style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>-</span>}</Td>
                </tr>
              );
            })}
            <tr style={{borderTop: '1px solid var(--ims-border)', background: 'var(--ims-bg-card-2)'}}>
              <Td><strong>{t.btr_actual_allowance}</strong> <span style={{fontSize: '10px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>({realization.actualDays} × {fmt(realization.allowancePerDay)})</span></Td>
              <Td align="right"><span className="mono">{fmt((businessTrip ? businessTrip.costs.allowanceTotal : 0))}</span></Td>
              <Td align="right"><span className="mono" style={{fontWeight: 600}}>{fmt(realization.actualAllowance)}</span></Td>
              <Td align="right"><span className="mono" style={{fontWeight: 600}}>{fmt((businessTrip ? businessTrip.costs.allowanceTotal : 0) - realization.actualAllowance)}</span></Td>
              <Td align="center"><span style={{fontSize: '10px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{lang === 'id' ? 'hak karyawan' : 'employee right'}</span></Td>
            </tr>
            <tr style={{background: 'var(--ims-bg-alt)', color: '#fff'}}>
              <td style={{padding: '10px 14px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '11px'}}>TOTAL</td>
              <td style={{padding: '10px 14px', textAlign: 'right', fontWeight: 600}} className="mono">{fmt(realization.totalAdvanceReceived)}</td>
              <td style={{padding: '10px 14px', textAlign: 'right', fontWeight: 700}} className="mono">{fmt(realization.totalActual)}</td>
              <td style={{padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--ims-accent)'}} className="mono">{realization.difference > 0 ? '+' : ''}{fmt(realization.difference)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* Difference summary */}
        <div style={{padding: '14px 18px', background: diffColor + '15', borderLeft: '3px solid ' + diffColor, marginBottom: '16px'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.15em', color: diffColor, textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px'}}>{t.btr_difference}</div>
          <div className="mono" style={{fontSize: '20px', fontWeight: 600, color: diffColor}}>{realization.difference > 0 ? '+' : ''}{fmt(realization.difference)}</div>
          <div style={{fontSize: '12px', color: diffColor, marginTop: '4px', fontStyle: 'italic'}}>
            {realization.difference > 0 ? `${t.btr_difference_return} — ${lang === 'id' ? 'karyawan kembalikan kelebihan' : 'employee returns'} ${fmt(Math.abs(realization.difference))}` :
             realization.difference < 0 ? `${t.btr_difference_reimburse} — ${lang === 'id' ? 'kantor reimburse kekurangan' : 'office reimburses'} ${fmt(Math.abs(realization.difference))}` :
             t.btr_difference_zero}
          </div>
        </div>

        {/* Settlement info if settled */}
        {realization.settlementStatus === 'settled' && realization.settlementNote && (
          <div style={{padding: '12px 14px', background: 'var(--ims-accent-2)15', borderLeft: '3px solid var(--ims-accent-2)', marginBottom: '16px', fontSize: '12px'}}>
            <strong>✓ Settlement Selesai:</strong> {realization.settlementNote}
            {realization.settlementDate && <span className="mono" style={{marginLeft: '8px', color: 'var(--ims-text-2)'}}>· {realization.settlementDate}</span>}
          </div>
        )}

        {/* Notes */}
        {realization.notes && (
          <>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{t.btr_realization_notes}</div>
            <div style={{padding: '12px 14px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', marginBottom: '16px', fontSize: '12px', fontStyle: 'italic'}}>{realization.notes}</div>
          </>
        )}

        {/* Approval history */}
        {realization.approvalHistory && realization.approvalHistory.length > 0 && (
          <>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{t.bt_approval_history}</div>
            <div style={{padding: '12px 14px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', marginBottom: '20px'}}>
              {realization.approvalHistory.map((h, i) => {
                const actionColors = { submitted: '#5b87b8', approved: 'var(--ims-accent-2)', clarification: 'var(--ims-gold-dim)' };
                const actionLabels = {
                  submitted: lang === 'id' ? 'Diajukan' : 'Submitted',
                  approved: lang === 'id' ? 'Disetujui' : 'Approved',
                  clarification: lang === 'id' ? 'Minta Klarifikasi' : 'Requested Clarification',
                };
                const levelLabels = { submit: lang === 'id' ? 'Pengajuan' : 'Submission', finance: 'Finance', manager_ops: 'Manager Operasional', gm: 'General Manager' };
                return (
                  <div key={i} style={{padding: '8px 0', borderBottom: i < realization.approvalHistory.length - 1 ? '1px dashed var(--ims-border)' : 'none', display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
                    <div style={{width: '6px', height: '6px', borderRadius: '50%', background: actionColors[h.action] || 'var(--ims-text-2)', marginTop: '6px', flexShrink: 0}} />
                    <div style={{flex: 1, fontSize: '12px'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px'}}>
                        <span><strong style={{color: actionColors[h.action]}}>{actionLabels[h.action]}</strong> · {levelLabels[h.level]} oleh <strong>{h.byName}</strong></span>
                        <span className="mono" style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{h.date}</span>
                      </div>
                      {h.note && <div style={{fontSize: '11px', color: 'var(--ims-text)', marginTop: '4px', fontStyle: 'italic', padding: '6px 10px', background: 'var(--ims-bg-card-2)'}}>"{h.note}"</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Review actions (only Setujui & Klarifikasi - NO Tolak per Bapak instructions) */}
        {canReview && (
          <div style={{padding: '14px', background: 'var(--ims-gold-bg)', border: '1px solid var(--ims-accent)', borderLeft: '3px solid var(--ims-accent)', marginBottom: '12px'}}>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', color: '#5a4a1a', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{canReviewFinance ? t.bt_review_finance : canReviewMops ? t.bt_review_mops : t.bt_review_gm}</div>
            <Field label={t.bt_review_notes} full><textarea rows={2} value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder={lang === 'id' ? 'Catatan review (opsional untuk approve, wajib untuk klarifikasi)' : 'Review notes (optional for approve, required for clarification)'} /></Field>
            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px'}}>
              <button onClick={() => onAction('approve', reviewNote)} style={{background: 'var(--ims-accent-2)', color: '#fff', border: 'none', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, letterSpacing: '0.05em'}}>✓ {t.bt_action_approve}</button>
              <button onClick={() => { if (!reviewNote.trim()) { showToast(lang === 'id' ? 'Mohon isi catatan klarifikasi.' : 'Please provide clarification note.', 'warning'); return; } onAction('clarify', reviewNote); }} style={{background: 'var(--ims-gold-dim)', color: '#fff', border: 'none', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, letterSpacing: '0.05em'}}>⚠ {t.bt_action_clarify}</button>
            </div>
          </div>
        )}

        {/* Settle action (Finance only, when approved & has difference) */}
        {canSettle && (
          <div style={{padding: '14px', background: 'var(--ims-accent-2)15', border: '1px solid var(--ims-accent-2)', borderLeft: '3px solid var(--ims-accent-2)', marginBottom: '12px'}}>
            <div style={{fontSize: '12px', color: '#1a4d2a', marginBottom: '8px'}}>{realization.difference > 0
              ? (lang === 'id' ? `Realisasi disetujui. Karyawan harus kembalikan kelebihan ${fmt(Math.abs(realization.difference))}.` : `Realization approved. Employee must return excess of ${fmt(Math.abs(realization.difference))}.`)
              : (lang === 'id' ? `Realisasi disetujui. Kantor reimburse kekurangan ${fmt(Math.abs(realization.difference))}.` : `Realization approved. Office to reimburse ${fmt(Math.abs(realization.difference))}.`)}</div>
            <button onClick={onSettle} style={{background: 'var(--ims-accent-2)', color: '#fff', border: 'none', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, letterSpacing: '0.05em'}}>💸 {t.btr_settle_now}</button>
          </div>
        )}

        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px', borderTop: '1px solid var(--ims-border)', paddingTop: '14px'}}>
          <button className="btn-ghost" onClick={onClose}>{lang === 'id' ? 'Tutup' : 'Close'}</button>
        </div>
      </div>
    </div>
  );
}

// ============== Business Trip Dashboard Analytics ==============
function BusinessTripDashboard({ businessTrips, realizations, employees, t, lang, session, canManageAll, fmt }) {
  const [yearFilter, setYearFilter] = useState('2026');
  const [travelerFilter, setTravelerFilter] = useState('all');

  // Filter trips by user permission
  const visibleTrips = useMemo(() => {
    let arr = businessTrips;
    if (!canManageAll) arr = arr.filter(t => t.travelerUsername === session.username);
    return arr;
  }, [businessTrips, canManageAll, session.username]);

  // Years available
  const years = useMemo(() => {
    const yrs = new Set();
    visibleTrips.forEach(t => { if (t.dateStart) yrs.add(t.dateStart.substring(0, 4)); });
    return ['all', ...Array.from(yrs).sort()];
  }, [visibleTrips]);

  // Travelers list
  const travelers = useMemo(() => {
    const arr = [...new Set(visibleTrips.map(t => t.travelerUsername))];
    return arr.map(un => ({ un, name: resolveEmpName(employees, un) }));
  }, [visibleTrips, employees]);

  // Apply filters
  const filtered = useMemo(() => {
    return visibleTrips.filter(t => {
      if (yearFilter !== 'all' && !t.dateStart.startsWith(yearFilter)) return false;
      if (travelerFilter !== 'all' && t.travelerUsername !== travelerFilter) return false;
      // Only count approved/paid/completed (no rejected, no draft)
      return ['approved', 'in_progress', 'completed', 'paid'].includes(t.status) ||
        (t.paymentStatus === 'paid');
    });
  }, [visibleTrips, yearFilter, travelerFilter]);

  // ============== KPIs ==============
  const stats = useMemo(() => {
    const total = filtered.reduce((s, t) => s + (t.totalAdvance || 0), 0);
    const totalOffice = filtered.reduce((s, t) => s + (t.officeBooked?.ticketPP || 0) + (t.officeBooked?.hotelTotal || 0), 0);
    const grandTotal = total + totalOffice;
    const tripCount = filtered.length;
    const avgPerTrip = tripCount > 0 ? grandTotal / tripCount : 0;
    return { total, totalOffice, grandTotal, tripCount, avgPerTrip };
  }, [filtered]);

  // ============== Monthly Trend (line chart) ==============
  const monthlyTrend = useMemo(() => {
    const monthMap = {};
    filtered.forEach(t => {
      const ym = t.dateStart.substring(0, 7);
      if (!monthMap[ym]) monthMap[ym] = { month: ym, cashAdvance: 0, officeBooked: 0, total: 0, count: 0 };
      const office = (t.officeBooked?.ticketPP || 0) + (t.officeBooked?.hotelTotal || 0);
      monthMap[ym].cashAdvance += t.totalAdvance || 0;
      monthMap[ym].officeBooked += office;
      monthMap[ym].total += (t.totalAdvance || 0) + office;
      monthMap[ym].count++;
    });
    return Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month)).map(m => ({
      ...m,
      label: m.month.substring(5) + '/' + m.month.substring(2, 4),
    }));
  }, [filtered]);

  // ============== YoY Comparison (2025 vs 2026) ==============
  const yoyData = useMemo(() => {
    if (yearFilter !== 'all') return null;
    const yearMap = {};
    filtered.forEach(t => {
      const y = t.dateStart.substring(0, 4);
      const m = parseInt(t.dateStart.substring(5, 7));
      if (!yearMap[y]) yearMap[y] = Array(12).fill(0);
      yearMap[y][m - 1] += (t.totalAdvance || 0) + (t.officeBooked?.ticketPP || 0) + (t.officeBooked?.hotelTotal || 0);
    });
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m, i) => ({
      month: m,
      '2025': yearMap['2025']?.[i] || 0,
      '2026': yearMap['2026']?.[i] || 0,
    }));
  }, [filtered, yearFilter]);

  // ============== By Traveler (bar chart) ==============
  const byTraveler = useMemo(() => {
    const map = {};
    filtered.forEach(t => {
      if (!map[t.travelerUsername]) {
        const liveName = resolveEmpName(employees, t.travelerUsername || t.travelerName);
        map[t.travelerUsername] = { name: liveName.split(' ')[0], full: liveName, position: t.position, count: 0, total: 0 };
      }
      map[t.travelerUsername].count++;
      map[t.travelerUsername].total += (t.totalAdvance || 0) + (t.officeBooked?.ticketPP || 0) + (t.officeBooked?.hotelTotal || 0);
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filtered]);

  // ============== By Cost Component (pie chart) ==============
  const byComponent = useMemo(() => {
    const totals = {
      taxiHome: 0, taxiArrival: 0, taxiRs: 0, localTransport: 0,
      meals: 0, other: 0, allowance: 0, ticket: 0, hotel: 0,
    };
    filtered.forEach(t => {
      totals.taxiHome += t.costs?.taxiHome || 0;
      totals.taxiArrival += t.costs?.taxiArrival || 0;
      totals.taxiRs += t.costs?.taxiRs || 0;
      totals.localTransport += t.costs?.localTransport || 0;
      totals.meals += t.costs?.meals || 0;
      totals.other += t.costs?.other || 0;
      totals.allowance += t.costs?.allowanceTotal || 0;
      totals.ticket += t.officeBooked?.ticketPP || 0;
      totals.hotel += t.officeBooked?.hotelTotal || 0;
    });
    const data = [
      { name: lang === 'id' ? 'Tunjangan' : 'Allowance', value: totals.allowance, color: '#1a4d8a' },
      { name: lang === 'id' ? 'Tiket Pesawat' : 'Flight Tickets', value: totals.ticket, color: '#5b87b8' },
      { name: lang === 'id' ? 'Hotel' : 'Hotel', value: totals.hotel, color: 'var(--ims-accent)' },
      { name: lang === 'id' ? 'Makan' : 'Meals', value: totals.meals, color: 'var(--ims-gold-dim)' },
      { name: lang === 'id' ? 'Transport Lokal' : 'Local Transport', value: totals.localTransport, color: '#5a8a5a' },
      { name: 'Taksi (RS/Hotel)', value: totals.taxiRs + totals.taxiArrival + totals.taxiHome, color: '#7d9cc5' },
      { name: lang === 'id' ? 'Lain-lain' : 'Other', value: totals.other, color: '#94a3b8' },
    ].filter(d => d.value > 0).sort((a, b) => b.value - a.value);
    return data;
  }, [filtered, lang]);

  // ============== By Destination (top 10) ==============
  const byDestination = useMemo(() => {
    const map = {};
    filtered.forEach(t => {
      const city = t.destinationCity || t.destination || 'Unknown';
      if (!map[city]) map[city] = { city, count: 0, total: 0 };
      map[city].count++;
      map[city].total += (t.totalAdvance || 0) + (t.officeBooked?.ticketPP || 0) + (t.officeBooked?.hotelTotal || 0);
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [filtered]);

  // ============== Settlement summary ==============
  const settlementStats = useMemo(() => {
    const visibleReals = canManageAll ? realizations : realizations.filter(r => r.travelerUsername === session.username);
    const filtered = visibleReals.filter(r => {
      if (yearFilter !== 'all' && !r.dateStart.startsWith(yearFilter)) return false;
      if (travelerFilter !== 'all' && r.travelerUsername !== travelerFilter) return false;
      return r.status === 'approved';
    });
    const overadvance = filtered.filter(r => r.difference > 0);
    const underadvance = filtered.filter(r => r.difference < 0);
    return {
      totalRealizations: filtered.length,
      totalOveradvance: overadvance.reduce((s, r) => s + Math.abs(r.difference), 0),
      totalUnderadvance: underadvance.reduce((s, r) => s + Math.abs(r.difference), 0),
      overadvanceCount: overadvance.length,
      underadvanceCount: underadvance.length,
    };
  }, [realizations, canManageAll, session.username, yearFilter, travelerFilter]);

  // PERFORMANCE & LANG: Use parent fmt() prop which auto-converts to USD when lang='en'
  const fmtRp = fmt;
  const fmtRpShort = fmt;

  return (
    <div>
      {/* Filters */}
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', padding: '14px 16px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <span style={{fontSize: '10px', letterSpacing: '0.1em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Tahun' : 'Year'}:</span>
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} style={{padding: '5px 8px', fontSize: '12px', fontFamily: 'inherit', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', color: 'var(--ims-text)', cursor: 'pointer'}}>
            {years.map(y => <option key={y} value={y}>{y === 'all' ? (lang === 'id' ? 'Semua Tahun' : 'All Years') : y}</option>)}
          </select>
        </div>
        {canManageAll && (
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{fontSize: '10px', letterSpacing: '0.1em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Karyawan' : 'Employee'}:</span>
            <select value={travelerFilter} onChange={e => setTravelerFilter(e.target.value)} style={{padding: '5px 8px', fontSize: '12px', fontFamily: 'inherit', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', color: 'var(--ims-text)', cursor: 'pointer'}}>
              <option value="all">{lang === 'id' ? 'Semua' : 'All'}</option>
              {travelers.map(tr => <option key={tr.un} value={tr.un}>{tr.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* KPI Strip */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-alt)', color: '#fff'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-accent)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Total Operasional' : 'Total Operational'}</div>
          <div className="serif mono" style={{fontSize: '20px', fontWeight: 500, marginTop: '4px', color: '#fff'}}>{fmtRpShort(stats.grandTotal)}</div>
          <div style={{fontSize: '9px', color: 'rgba(255,255,255,0.6)', marginTop: '2px'}}>{lang === 'id' ? 'Cash + Office' : 'Cash + Office'}</div>
        </div>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Uang Muka' : 'Cash Advance'}</div>
          <div className="serif mono" style={{fontSize: '20px', fontWeight: 500, marginTop: '4px'}}>{fmtRpShort(stats.total)}</div>
          <div style={{fontSize: '9px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'transfer ke karyawan' : 'transferred to employees'}</div>
        </div>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Tiket + Hotel' : 'Tickets + Hotels'}</div>
          <div className="serif mono" style={{fontSize: '20px', fontWeight: 500, marginTop: '4px'}}>{fmtRpShort(stats.totalOffice)}</div>
          <div style={{fontSize: '9px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'pemesanan kantor' : 'office-booked'}</div>
        </div>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Jumlah Trip' : 'Trip Count'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px'}}>{stats.tripCount}</div>
          <div style={{fontSize: '9px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'rata-rata' : 'avg'}: {fmtRpShort(stats.avgPerTrip)}</div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', padding: '18px 20px', marginBottom: '22px'}}>
        <div className="serif" style={{fontSize: '17px', fontWeight: 500, marginBottom: '4px'}}>{lang === 'id' ? 'Tren Bulanan Biaya Perjalanan Dinas' : 'Monthly Business Trip Cost Trend'}</div>
        <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginBottom: '14px'}}>{lang === 'id' ? 'Cash Advance + Tiket + Hotel per bulan' : 'Cash Advance + Tickets + Hotel per month'}</div>
        {monthlyTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" />
              <XAxis dataKey="label" stroke="var(--ims-text-2)" style={{fontSize: 10}} />
              <YAxis stroke="var(--ims-text-2)" style={{fontSize: 10}} tickFormatter={v => v >= 1e9 ? `${(v/1e9).toFixed(1)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v >= 1e3 ? `${(v/1e3).toFixed(0)}rb` : v} />
              <Tooltip formatter={(v, name) => [fmtRp(v), name]} labelStyle={{color: 'var(--ims-text)', fontSize: 11}} contentStyle={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', fontSize: 11}} />
              <Legend wrapperStyle={{fontSize: 11}} />
              <Bar dataKey="cashAdvance" name={lang === 'id' ? 'Uang Muka' : 'Cash Advance'} fill="#1a4d8a" stackId="a" />
              <Bar dataKey="officeBooked" name={lang === 'id' ? 'Tiket + Hotel' : 'Office-Booked'} fill="var(--ims-accent)" stackId="a" />
              <Area type="monotone" dataKey="total" name={lang === 'id' ? 'Total' : 'Total'} fill="transparent" stroke="#c03030" strokeWidth={2} dot={{ r: 3, fill: '#c03030' }} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div style={{padding: '40px', textAlign: 'center', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{lang === 'id' ? 'Tidak ada data untuk filter ini.' : 'No data for this filter.'}</div>
        )}
      </div>

      {/* YoY Comparison (only when "all years" selected) */}
      {yearFilter === 'all' && yoyData && (
        <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', padding: '18px 20px', marginBottom: '22px'}}>
          <div className="serif" style={{fontSize: '17px', fontWeight: 500, marginBottom: '4px'}}>{lang === 'id' ? 'Perbandingan Tahun-ke-Tahun (YoY)' : 'Year-over-Year Comparison'}</div>
          <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginBottom: '14px'}}>{lang === 'id' ? 'Total biaya per bulan: 2025 vs 2026' : 'Monthly total: 2025 vs 2026'}</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={yoyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" />
              <XAxis dataKey="month" stroke="var(--ims-text-2)" style={{fontSize: 10}} />
              <YAxis stroke="var(--ims-text-2)" style={{fontSize: 10}} tickFormatter={v => v >= 1e9 ? `${(v/1e9).toFixed(1)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v >= 1e3 ? `${(v/1e3).toFixed(0)}rb` : v} />
              <Tooltip formatter={(v, name) => [fmtRp(v), name]} labelStyle={{color: 'var(--ims-text)', fontSize: 11}} contentStyle={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', fontSize: 11}} />
              <Legend wrapperStyle={{fontSize: 11}} />
              <Bar dataKey="2025" fill="var(--ims-text-2)" />
              <Bar dataKey="2026" fill="#1a4d8a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px', marginBottom: '22px'}}>
        {/* By Cost Component */}
        <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', padding: '18px 20px'}}>
          <div className="serif" style={{fontSize: '17px', fontWeight: 500, marginBottom: '4px'}}>{lang === 'id' ? 'Breakdown per Komponen Biaya' : 'Cost Component Breakdown'}</div>
          <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginBottom: '14px'}}>{lang === 'id' ? 'Distribusi total biaya per kategori' : 'Total cost distribution by category'}</div>
          {byComponent.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={byComponent} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false} style={{fontSize: 10}}>
                  {byComponent.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, name) => [fmtRp(v), name]} contentStyle={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', fontSize: 11}} />
                <Legend wrapperStyle={{fontSize: 10}} layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{padding: '40px', textAlign: 'center', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{lang === 'id' ? 'Tidak ada data.' : 'No data.'}</div>}
        </div>

        {/* By Traveler */}
        {canManageAll && (
          <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', padding: '18px 20px'}}>
            <div className="serif" style={{fontSize: '17px', fontWeight: 500, marginBottom: '4px'}}>{lang === 'id' ? 'Top Karyawan (per Total Biaya)' : 'Top Travelers (by Total Cost)'}</div>
            <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginBottom: '14px'}}>{lang === 'id' ? 'Karyawan dengan biaya operasional perjalanan tertinggi' : 'Highest business trip cost employees'}</div>
            <ResponsiveContainer width="100%" height={Math.max(200, byTraveler.length * 32)}>
              <BarChart data={byTraveler} layout="vertical" margin={{left: 60}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" />
                <XAxis type="number" stroke="var(--ims-text-2)" style={{fontSize: 10}} tickFormatter={v => v >= 1e9 ? `${(v/1e9).toFixed(1)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v >= 1e3 ? `${(v/1e3).toFixed(0)}rb` : v} />
                <YAxis type="category" dataKey="name" stroke="var(--ims-text-2)" style={{fontSize: 10}} width={60} />
                <Tooltip formatter={(v, name, item) => [fmtRp(v) + ` (${item.payload.count} trips)`, item.payload.full]} contentStyle={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', fontSize: 11}} />
                <Bar dataKey="total" fill="#1a4d8a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* By Destination */}
      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', padding: '18px 20px', marginBottom: '22px'}}>
        <div className="serif" style={{fontSize: '17px', fontWeight: 500, marginBottom: '4px'}}>{lang === 'id' ? 'Top 10 Tujuan Perjalanan' : 'Top 10 Travel Destinations'}</div>
        <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginBottom: '14px'}}>{lang === 'id' ? 'Kota tujuan dengan total biaya tertinggi' : 'Destination cities by total cost'}</div>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px'}}>
          <thead>
            <tr style={{background: 'var(--ims-bg)'}}>
              <Th>#</Th>
              <Th>{lang === 'id' ? 'Kota' : 'City'}</Th>
              <Th align="right">{lang === 'id' ? 'Jumlah Trip' : 'Trip Count'}</Th>
              <Th align="right">{lang === 'id' ? 'Total Biaya' : 'Total Cost'}</Th>
              <Th align="right">{lang === 'id' ? 'Rata-rata' : 'Average'}</Th>
            </tr>
          </thead>
          <tbody>
            {byDestination.map((d, i) => (
              <tr key={d.city} style={{borderTop: '1px solid var(--ims-border)'}}>
                <Td><span style={{fontSize: '10px', color: 'var(--ims-text-2)', fontWeight: 600}}>{i + 1}</span></Td>
                <Td><strong>{d.city}</strong></Td>
                <Td align="right">{d.count}</Td>
                <Td align="right"><span className="mono">{fmtRp(d.total)}</span></Td>
                <Td align="right"><span className="mono" style={{color: 'var(--ims-text-2)'}}>{fmtRp(Math.round(d.total / d.count))}</span></Td>
              </tr>
            ))}
            {byDestination.length === 0 && <tr><td colSpan="5" style={{padding: '20px', textAlign: 'center', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Tidak ada data.' : 'No data.'}</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Settlement Summary */}
      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', padding: '18px 20px', marginBottom: '22px'}}>
        <div className="serif" style={{fontSize: '17px', fontWeight: 500, marginBottom: '4px'}}>{lang === 'id' ? 'Rekap Selisih Realisasi' : 'Realization Settlement Summary'}</div>
        <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginBottom: '14px'}}>{lang === 'id' ? 'Dari realisasi yang sudah disetujui' : 'From approved realizations'}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px'}}>
          <div style={{padding: '14px', border: '1px solid var(--ims-border)', borderLeft: '3px solid #5b87b8'}}>
            <div style={{fontSize: '10px', letterSpacing: '0.15em', color: '#5b87b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px'}}>{lang === 'id' ? 'Total Realisasi Disetujui' : 'Approved Realizations'}</div>
            <div className="serif" style={{fontSize: '20px', fontWeight: 500}}>{settlementStats.totalRealizations}</div>
          </div>
          <div style={{padding: '14px', border: '1px solid var(--ims-border)', borderLeft: '3px solid var(--ims-gold-dim)'}}>
            <div style={{fontSize: '10px', letterSpacing: '0.15em', color: 'var(--ims-gold-dim)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px'}}>{lang === 'id' ? 'Kelebihan (dikembalikan karyawan)' : 'Excess (returned by employee)'}</div>
            <div className="serif mono" style={{fontSize: '18px', fontWeight: 500, color: 'var(--ims-gold-dim)'}}>{fmtRpShort(settlementStats.totalOveradvance)}</div>
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{settlementStats.overadvanceCount} {lang === 'id' ? 'realisasi' : 'realizations'}</div>
          </div>
          <div style={{padding: '14px', border: '1px solid var(--ims-border)', borderLeft: '3px solid #c03030'}}>
            <div style={{fontSize: '10px', letterSpacing: '0.15em', color: '#c03030', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px'}}>{lang === 'id' ? 'Kekurangan (kantor reimburse)' : 'Shortfall (office reimburse)'}</div>
            <div className="serif mono" style={{fontSize: '18px', fontWeight: 500, color: '#c03030'}}>{fmtRpShort(settlementStats.totalUnderadvance)}</div>
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{settlementStats.underadvanceCount} {lang === 'id' ? 'realisasi' : 'realizations'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
function CustomsNoteEditor({ value, isHold, onSave, t, lang }) {
  const [draft, setDraft] = useState(value || '');
  const [justSaved, setJustSaved] = useState(false);
  useEffect(() => { setDraft(value || ''); setJustSaved(false); }, [value]);
  const dirty = draft !== (value || '');
  return (
    <>
      <textarea
        value={draft}
        onChange={e => { setDraft(e.target.value); setJustSaved(false); }}
        placeholder={t.status_note_placeholder}
        rows={2}
        style={{width: '100%', fontSize: '12px', padding: '6px 8px', border: `1px solid ${isHold && !draft.trim() ? '#c03030' : 'var(--ims-border)'}`, background: 'var(--ims-bg-card)', fontFamily: 'inherit', resize: 'vertical'}}
      />
      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px'}}>
        <button onClick={() => { onSave(draft.trim()); setJustSaved(true); }} disabled={!dirty} style={{padding: '6px 14px', fontSize: '11px', fontFamily: 'inherit', fontWeight: 600, letterSpacing: '0.03em', background: dirty ? 'var(--ims-accent)' : 'var(--ims-border)', color: '#fff', border: 'none', cursor: dirty ? 'pointer' : 'default'}}>{t.status_note_save}</button>
        {justSaved && !dirty && <span style={{fontSize: '11px', color: 'var(--ims-accent-2)', fontWeight: 600}}>✓ {t.status_note_saved}</span>}
      </div>
    </>
  );
}

const localDeliveryStatusLabel = (status, lang = 'id') => {
  if (status === 'delivered_to_rs') return lang === 'id' ? 'Tiba di RS' : 'Arrived at Hospital';
  if (status === 'storing') return lang === 'id' ? 'Storing di Gudang' : 'Warehouse Storage';
  return lang === 'id' ? 'Dalam Pengiriman ke RS' : 'Delivering to Hospital';
};

const getLocalDeliveryDefaults = (project = {}) => {
  const status = project.localDeliveryStatus || (project.shippingStatus === 'client_received' ? 'delivered_to_rs' : 'on_delivery');
  const baseDate = dateOnlyFromValue(project.customsSppbAt || project.goodsSentClientAt || project.localDeliveryStartedAt || project.lastUpdate || new Date().toISOString());
  const dispatchDate = project.localDeliveryDate || addDateOnlyDays(baseDate, project.customsSppbAt ? 1 : 0);
  const eta = project.localEta || addDateOnlyDays(dispatchDate, status === 'delivered_to_rs' ? 1 : 2);
  const vendor = project.localVendor || (status === 'delivered_to_rs' ? 'HNTI Logistics' : '');
  return { localDeliveryStatus: status, localDeliveryDate: dispatchDate, localEta: eta, localVendor: vendor };
};

function EditableLocalDeliveryField({ label, value, onSave, canEdit, placeholder = '' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  useEffect(() => { setDraft(value || ''); }, [value]);
  return (
    <Field label={label}>
      <div style={{display: 'grid', gridTemplateColumns: editing ? '1fr auto auto' : '1fr auto', gap: '6px'}}>
        <input disabled={!canEdit || !editing} value={editing ? draft : (value || '')} onChange={e => setDraft(e.target.value)} placeholder={placeholder} />
        {canEdit && !editing && <button type="button" onClick={() => setEditing(true)} style={{padding: '6px 9px', border: '1px solid var(--ims-border)', background: 'transparent', color: 'var(--ims-accent)', fontSize: '10px', fontWeight: 800, cursor: 'pointer'}}>Edit</button>}
        {canEdit && editing && (
          <>
            <button type="button" onClick={() => { onSave(draft); setEditing(false); }} style={{padding: '6px 9px', border: 'none', background: 'var(--ims-accent-2)', color: '#fff', fontSize: '10px', fontWeight: 800, cursor: 'pointer'}}>Simpan</button>
            <button type="button" onClick={() => { setDraft(value || ''); setEditing(false); }} style={{padding: '6px 8px', border: '1px solid var(--ims-border)', background: 'transparent', color: 'var(--ims-text-2)', fontSize: '10px', fontWeight: 700, cursor: 'pointer'}}>Batal</button>
          </>
        )}
      </div>
    </Field>
  );
}


function OperationsDashboardCharts({ poProjects, visibleManifests, visibleCustomsDocs, localProjects, getEffectiveShipping, avgProductionDays, lang, fmt }) {
  const pipelineData = IMPORT_PIPELINE_STEPS.map(step => ({
    name: lang === 'id' ? step.labelId : step.labelEn,
    value: poProjects.filter(p => getEffectiveShipping(p) === step.id).length,
    fill: step.color,
  }));
  const customsData = ['submitted', 'pib_payment', 'sppb', 'redline', 'rejected'].map(status => ({
    name: status === 'pib_payment' ? 'PIB' : status.toUpperCase(),
    value: visibleCustomsDocs.filter(d => d.status === status).length,
  })).filter(x => x.value > 0);
  const localData = [
    { name: lang === 'id' ? 'Dalam Pengiriman' : 'Delivering', value: localProjects.filter(p => (p.localDeliveryStatus || 'on_delivery') !== 'delivered_to_rs').length },
    { name: lang === 'id' ? 'Tiba di RS' : 'Arrived', value: localProjects.filter(p => p.localDeliveryStatus === 'delivered_to_rs' || p.shippingStatus === 'client_received').length },
  ];
  const monthlyManifest = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map((m, idx) => {
    const key = `2026-${String(idx + 1).padStart(2, '0')}`;
    return {
      month: m,
      Manifest: visibleManifests.filter(x => String(x.etd || x.eta || '').startsWith(key)).length,
      SPPB: visibleCustomsDocs.filter(x => x.status === 'sppb' && String(x.statusUpdatedAt || x.docDate || '').startsWith(key)).length,
    };
  });
  return (
    <div style={{display: 'grid', gap: '16px'}}>
      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px'}}>
        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Grafik Pipeline Impor' : 'Import Pipeline Chart'}</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pipelineData} margin={{top: 8, right: 16, left: 0, bottom: 70}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--ims-text-2)" interval={0} angle={-28} textAnchor="end" height={76} style={{fontSize: 10}} />
              <YAxis stroke="var(--ims-text-2)" allowDecimals={false} style={{fontSize: 10}} />
              <Tooltip content={<ChartTooltip fmt={(v) => v} />} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {pipelineData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Status Pengiriman Lokal' : 'Local Delivery Status'}</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={localData} dataKey="value" nameKey="name" outerRadius={92} label>
                {localData.map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[index]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip fmt={(v) => v} />} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Manifest & SPPB Bulanan' : 'Monthly Manifest & SPPB'}</div>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={monthlyManifest} margin={{top: 8, right: 16, left: 0, bottom: 8}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--ims-text-2)" style={{fontSize: 10}} />
              <YAxis stroke="var(--ims-text-2)" allowDecimals={false} style={{fontSize: 10}} />
              <Tooltip content={<ChartTooltip fmt={(v) => v} />} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
              <Bar dataKey="Manifest" fill="#5b8def" radius={[3, 3, 0, 0]} />
              <Area dataKey="SPPB" fill="#2f8f6f33" stroke="#2f8f6f" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Customs Clearance' : 'Customs Clearance'}</div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={customsData.length ? customsData : [{ name: '-', value: 0 }]} dataKey="value" nameKey="name" outerRadius={86} label>
                {(customsData.length ? customsData : [{ name: '-', value: 0 }]).map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[(index + 2) % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip fmt={(v) => v} />} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{lang === 'id' ? 'Rata-rata produksi' : 'Average production'}: <span className="mono" style={{fontWeight: 800}}>{avgProductionDays}</span> {lang === 'id' ? 'hari' : 'days'} · {fmt ? fmt(poProjects.reduce((sum, p) => sum + (Number(p.totalValue) || 0), 0)) : ''}</div>
        </div>
      </div>
    </div>
  );
}

function OperationsModule({ data, setData, manifests, setManifests, customsDocs, setCustomsDocs, t, lang, canEdit, fmt, session }) {
  const [tab, setTab] = useState('manifest');
  const [productionConfirmId, setProductionConfirmId] = useState(null);
  const [editingProductionId, setEditingProductionId] = useState(null);
  const [productionEditDraft, setProductionEditDraft] = useState({ startAt: '', days: 30 });
  const [opsSearch, setOpsSearch] = useState('');
  const [opsYear, setOpsYear] = useState('all');
  const opsSearchTerm = opsSearch.trim().toLowerCase();
  const opsYears = useMemo(() => {
    const years = new Set();
    data.forEach(s => {
      ['issuedDate', 'dpConfirmedAt', 'factoryProductionStartedAt', 'goodsSentClientAt', 'clientReceivedAt'].forEach(k => {
        if (s?.[k]) years.add(String(s[k]).slice(0, 4));
      });
    });
    manifests.forEach(m => ['etd', 'eta'].forEach(k => { if (m?.[k]) years.add(String(m[k]).slice(0, 4)); }));
    return [...years].filter(Boolean).sort().reverse();
  }, [data, manifests]);
  const matchesOpsProject = (s) => {
    const text = [s.sphNo, s.customer, s.modality, s.subModality, s.productBrand, s.brand, s.principal, s.shippingStatus, s.sphWorkflowStatus].filter(Boolean).join(' ').toLowerCase();
    const matchSearch = !opsSearchTerm || text.includes(opsSearchTerm);
    const matchYear = opsYear === 'all' || ['issuedDate', 'dpConfirmedAt', 'factoryProductionStartedAt', 'goodsSentClientAt', 'clientReceivedAt'].some(k => String(s?.[k] || '').startsWith(opsYear));
    return matchSearch && matchYear;
  };
  const filteredData = useMemo(() => data.filter(matchesOpsProject), [data, opsSearchTerm, opsYear]);
  const visibleManifests = useMemo(() => manifests.filter(m => {
    const linked = data.find(s => manifestMatchesProject(m, s));
    const text = [m.manifestNo, m.customerName, m.sphNo, m.modality, m.typeBrand, m.principal, linked?.customer, linked?.sphNo].filter(Boolean).join(' ').toLowerCase();
    const matchSearch = !opsSearchTerm || text.includes(opsSearchTerm);
    const matchYear = opsYear === 'all' || ['etd', 'eta'].some(k => String(m?.[k] || '').startsWith(opsYear)) || (linked && matchesOpsProject(linked));
    return matchSearch && matchYear;
  }), [manifests, data, opsSearchTerm, opsYear]);
  const visibleCustomsDocs = useMemo(() => customsDocs.filter(d => {
    const linkedManifest = manifests.find(m => m.manifestNo === d.manifestRef || m.id === d.manifestRef || m.manifestNo === d.manifestNo);
    const linked = linkedManifest ? data.find(s => manifestMatchesProject(linkedManifest, s)) : null;
    const text = [d.docNo, d.manifestNo, d.manifestRef, d.customerName, d.sphNo, d.modality, d.typeBrand, d.principal, linked?.customer, linked?.sphNo].filter(Boolean).join(' ').toLowerCase();
    const matchSearch = !opsSearchTerm || text.includes(opsSearchTerm);
    const matchYear = opsYear === 'all' || ['docDate', 'eta', 'statusUpdatedAt'].some(k => String(d?.[k] || '').startsWith(opsYear)) || (linked && matchesOpsProject(linked));
    return matchSearch && matchYear;
  }), [customsDocs, manifests, data, opsSearchTerm, opsYear]);
  // Operations reads every PO whose DP/deposit is received, including completed logistics history.
  const poProjects = useMemo(() => filteredData.filter(s =>
    s.poStatus === 'issued' &&
    projectHasDpReceived(s)
  ), [filteredData]);
  const findManifestForProject = (project) => manifests.find(m => manifestMatchesProject(m, project));
  const localProjects = useMemo(() => filteredData.filter(s =>
    s.poStatus === 'issued' &&
    (s.customsStatus === 'released' || s.customsDocStatus === 'sppb' || s.customsSppbAt || ['sent_client', 'client_received'].includes(s.shippingStatus) || s.localDeliveryStatus ||
      customsDocs.some(d => d.status === 'sppb' && manifestMatchesProject(manifests.find(m => m.manifestNo === d.manifestRef || m.id === d.manifestRef) || { principal: d.principal, manifestNo: d.manifestRef }, s)))
  ), [filteredData, customsDocs, manifests]);
  const totalPoIssued = useMemo(() => filteredData.filter(s => s.poStatus === 'issued').length, [filteredData]);

  // Manifest status → Shipment status mapping (cross-tab link)
  // Build manifest lookup by id for linked SPH
  const manifestById = useMemo(() => new Map(manifests.flatMap(m => [[m.id, m], [m.manifestNo, m]])), [manifests]);

  // For a PO project, determine effective shipping status (synced from manifest if linked)
  const getEffectiveShipping = (p) => {
    const mfst = (p.manifestId && manifestById.get(p.manifestId)) || findManifestForProject(p);
    if (p.localDeliveryStatus === 'delivered_to_rs' || p.clientReceivedAt) return 'client_received';
    if (p.customsDocStatus === 'sppb' || p.customsSppbAt || p.localDeliveryStatus || p.goodsSentClientAt) return 'sent_client';
    const projectStatus = normalizeImportPipelineStatus(p.shippingStatus);
    if (p.shippingStatus && projectStatus !== 'plan_order') return projectStatus;
    if (p.factoryProductionStartedAt && !['ready_to_ship', 'on_shipment', 'arrived_clearance', 'sent_client', 'client_received'].includes(p.shippingStatus)) return 'factory_production';
    if (mfst) return normalizeImportPipelineStatus(mfst.status);
    return projectStatus;
  };
  const getImportStepTimestamp = (p, manifest, stepId) => {
    if (!p) return null;
    const dateOnlyAsIso = (d) => d ? `${d}T09:00:00.000Z` : null;
    if (stepId === 'plan_order') return p.factoryDpPaidAt || p.supplierDpPaidAt || p.manufacturePoCreatedAt || p.dpConfirmedAt || p.dpDecisionAt || manifest?.createdAt || null;
    if (stepId === 'factory_production') return p.factoryProductionStartedAt || null;
    if (stepId === 'ready_to_ship') return p.factoryProductionDoneAt || p.readyToShipAt || null;
    if (stepId === 'on_shipment') return p.shipmentStartedAt || p.importClearanceAt || dateOnlyAsIso(manifest?.etd);
    if (stepId === 'arrived_clearance') return p.arrivedClearanceAt || p.importClearanceAt || dateOnlyAsIso(manifest?.eta);
    if (stepId === 'sent_client') return p.goodsSentClientAt || p.customsSppbAt || p.localDeliveryStartedAt || null;
    if (stepId === 'client_received') return p.clientReceivedAt || null;
    return null;
  };
  const productionProjects = useMemo(() => visibleManifests.map(m => {
    const project = data.find(s => manifestMatchesProject(m, s));
    return { manifest: m, project };
  }), [visibleManifests, data]);

  useEffect(() => {
    const dueProjects = data.filter(s => {
      const info = getFactoryProductionInfo(s);
      return s.factoryProductionStartedAt && info.done && !s.factoryProductionNotifiedAt;
    });
    if (!dueProjects.length) return;
    const nowIso = new Date().toISOString();
    setData(prev => prev.map(s => {
      if (!dueProjects.some(p => p.id === s.id)) return s;
      return {
        ...s,
        factoryProductionDoneAt: s.factoryProductionDoneAt || nowIso,
        factoryProductionNotifiedAt: nowIso,
        sphWorkflowStatus: 'factory_production_done',
        nextAction: 'Operasional lanjut import & clearance',
        stageHistory: [...(s.stageHistory || []), { from: s.sphWorkflowStatus || s.stage, to: 'factory_production_done', by: 'system', at: nowIso }],
      };
    }));
    dueProjects.forEach(p => {
      ['manager_ops', 'gm', 'super_admin', 'finance'].forEach(role => notify({ role }, {
        type: 'factory_production_done',
        message: `Produksi/disiapkan pabrik untuk ${p.customer} sudah mencapai target durasi ${getFactoryProductionInfo(p).days} hari.`,
        link: { view: 'operations', id: p.id },
      }, { username: 'system', role: 'system' }));
    });
  }, [data, setData]);

  useEffect(() => {
    const needsBackfill = data.some(s => {
      const eligible = s.localDeliveryStatus || s.customsSppbAt || s.customsDocStatus === 'sppb' || ['sent_client', 'client_received'].includes(s.shippingStatus);
      if (!eligible) return false;
      const defaults = getLocalDeliveryDefaults(s);
      return !s.localDeliveryDate || !s.localEta || ((s.localDeliveryStatus === 'delivered_to_rs' || s.shippingStatus === 'client_received') && !s.localVendor);
    });
    if (!needsBackfill) return;
    setData(prev => prev.map(s => {
      const eligible = s.localDeliveryStatus || s.customsSppbAt || s.customsDocStatus === 'sppb' || ['sent_client', 'client_received'].includes(s.shippingStatus);
      if (!eligible) return s;
      const defaults = getLocalDeliveryDefaults(s);
      return {
        ...s,
        localDeliveryDate: s.localDeliveryDate || defaults.localDeliveryDate,
        localEta: s.localEta || defaults.localEta,
        localVendor: s.localVendor || defaults.localVendor,
      };
    }));
  }, [data, setData]);

  const startFactoryProduction = (id) => {
    if (!canEdit) return;
    const nowIso = new Date().toISOString();
    let targetProject = null;
    setData(prev => prev.map(s => {
      if (s.id !== id) return s;
      const days = getFactoryProductionDays(s);
      const dueAt = addDaysIso(nowIso, days);
      targetProject = { ...s, factoryProductionDays: days, factoryProductionDueAt: dueAt };
      return {
        ...s,
        shippingStatus: 'factory_production',
        factoryProductionStartedAt: nowIso,
        factoryProductionDays: days,
        factoryProductionDueAt: dueAt,
        sphWorkflowStatus: 'factory_production',
        nextAction: 'Menunggu produksi/disiapkan pabrik selesai',
        stageHistory: [...(s.stageHistory || []), { from: s.sphWorkflowStatus || s.stage, to: 'factory_production', by: session?.username || 'manager_ops', at: nowIso }],
      };
    }));
    if (targetProject) {
      setManifests(prev => prev.map(m => manifestMatchesProject(m, targetProject)
        ? { ...m, status: 'factory_production', productionStartedAt: nowIso, updatedAt: nowIso }
        : m));
    }
    if (targetProject) {
      ['gm', 'super_admin', 'finance'].forEach(role => notify({ role }, {
        type: 'factory_production',
        message: `Produksi/disiapkan pabrik untuk ${targetProject.customer} dimulai. Estimasi ${targetProject.factoryProductionDays} hari.`,
        link: { view: 'operations', id },
      }, { username: session?.username || 'manager_ops', role: session?.role || 'manager_ops' }));
    }
  };
  const openProductionEdit = (p) => {
    const info = getFactoryProductionInfo(p);
    setEditingProductionId(p.id);
    setProductionEditDraft({
      startAt: (info.startAt || new Date().toISOString()).slice(0, 16),
      days: info.days || getFactoryProductionDays(p),
    });
  };
  const saveProductionEdit = (id) => {
    if (!canEdit) return;
    const startAt = productionEditDraft.startAt ? new Date(productionEditDraft.startAt).toISOString() : new Date().toISOString();
    const days = Math.max(1, Number(productionEditDraft.days) || 30);
    const dueAt = addDaysIso(startAt, days);
    let targetProject = null;
    setData(prev => prev.map(s => s.id === id ? {
      ...s,
      shippingStatus: 'factory_production',
      factoryProductionStartedAt: startAt,
      factoryProductionDays: days,
      factoryProductionDueAt: dueAt,
      factoryProductionDoneAt: '',
      factoryProductionNotifiedAt: '',
      sphWorkflowStatus: 'factory_production',
      workflowEvent: 'factory_production_edited',
      nextAction: 'Menunggu produksi/disiapkan pabrik selesai',
      stageHistory: [...(s.stageHistory || []), { from: s.sphWorkflowStatus || s.stage, to: 'factory_production_edited', by: session?.username || 'manager_ops', at: new Date().toISOString() }],
    } : s).map(s => {
      if (s.id === id) targetProject = s;
      return s;
    }));
    if (targetProject) {
      setManifests(prev => prev.map(m => manifestMatchesProject(m, targetProject)
        ? { ...m, status: 'factory_production', productionStartedAt: startAt, updatedAt: new Date().toISOString() }
        : m));
    }
    setEditingProductionId(null);
    showToast(lang === 'id' ? 'Estimasi produksi diperbarui' : 'Production estimate updated', 'success');
  };
  const cancelProduction = (id) => {
    if (!canEdit) return;
    let targetProject = null;
    setData(prev => prev.map(s => s.id === id ? {
      ...s,
      shippingStatus: 'plan_order',
      factoryProductionStartedAt: '',
      factoryProductionDays: getFactoryProductionDays(s),
      factoryProductionDueAt: '',
      factoryProductionDoneAt: '',
      factoryProductionNotifiedAt: '',
      sphWorkflowStatus: 'factory_dp_paid',
      workflowEvent: 'factory_production_cancelled',
      nextAction: 'Operasional klik pesanan dibuat dan mulai produksi/disiapkan pabrik',
      stageHistory: [...(s.stageHistory || []), { from: s.sphWorkflowStatus || s.stage, to: 'factory_production_cancelled', by: session?.username || 'manager_ops', at: new Date().toISOString() }],
    } : s).map(s => {
      if (s.id === id) targetProject = s;
      return s;
    }));
    if (targetProject) {
      setManifests(prev => prev.map(m => manifestMatchesProject(m, targetProject)
        ? { ...m, status: 'plan_order', productionStartedAt: '', updatedAt: new Date().toISOString() }
        : m));
    }
    showToast(lang === 'id' ? 'Proses produksi dibatalkan' : 'Production process cancelled', 'warning');
  };

  const updateShipping = (id, status) => {
    if (!canEdit) return;
    if (status === 'factory_production') {
      setProductionConfirmId(id);
      return;
    }
    const localDefaults = getLocalDeliveryDefaults({ ...data.find(s => s.id === id), localDeliveryStatus: status === 'client_received' ? 'delivered_to_rs' : 'on_delivery', goodsSentClientAt: new Date().toISOString() });
    const extra = status === 'on_shipment' ? { sphWorkflowStatus: 'import_clearance', importClearanceAt: new Date().toISOString(), nextAction: 'Operasional mengatur import/clearance' }
      : status === 'sent_client' ? { sphWorkflowStatus: 'goods_sent_client', goodsSentClientAt: new Date().toISOString(), technicianNotifiedAt: new Date().toISOString(), localDeliveryStatus: 'on_delivery', localDeliveryDate: localDefaults.localDeliveryDate, localEta: localDefaults.localEta, nextAction: 'Teknisi menunggu barang diterima klien' }
      : status === 'client_received' ? { sphWorkflowStatus: 'goods_received_client', clientReceivedAt: new Date().toISOString(), localDeliveryStatus: 'delivered_to_rs', localDeliveryDate: localDefaults.localDeliveryDate, localEta: localDefaults.localEta, localVendor: localDefaults.localVendor || 'HNTI Logistics', nextAction: 'Teknisi atur jadwal instalasi' }
      : {};
    setData(prev => prev.map(s => s.id === id ? { ...s, shippingStatus: status, ...extra } : s));
    if (status === 'sent_client' || status === 'client_received') {
      notify({ role: 'technician' }, { type: 'install_pending', message: 'Barang sudah dikirim ke klien. Teknisi perlu mengatur jadwal instalasi.', link: { view: 'installation', id } });
    }
  };
  const updateCustoms = (id, status) => {
    if (!canEdit) return;
    // If switching to hold, keep existing note; UI will prompt for note
    const extra = status === 'ongoing' ? { sphWorkflowStatus: 'import_clearance', importClearanceAt: new Date().toISOString() }
      : status === 'released' ? { importClearanceAt: new Date().toISOString(), nextAction: 'Operasional kirim barang ke klien' }
      : {};
    setData(prev => prev.map(s => s.id === id ? { ...s, customsStatus: status, ...extra } : s));
  };
  const updateStatusNote = (id, note) => {
    if (!canEdit) return;
    setData(prev => prev.map(s => s.id === id ? { ...s, customsStatusNote: note } : s));
  };
  const saveStatusNote = (id, note) => {
    if (!canEdit) return;
    setData(prev => prev.map(s => s.id === id ? { ...s, customsStatusNote: note } : s));
    flushPersist();
    showToast(lang === 'id' ? 'Alasan status bea cukai tersimpan' : 'Customs status reason saved', 'success');
  };
  const linkManifest = (id, manifestId) => {
    if (!canEdit) return;
    setData(prev => prev.map(s => s.id === id ? { ...s, manifestId: manifestId || null } : s));
  };
  const updateLocalDelivery = (id, patch) => {
    if (!canEdit) return;
    const nowIso = new Date().toISOString();
    const current = data.find(s => s.id === id) || {};
    const defaults = getLocalDeliveryDefaults({ ...current, ...patch });
    const received = patch.localDeliveryStatus === 'delivered_to_rs';
    const extra = patch.localDeliveryStatus || patch.localEta ? {
      sphWorkflowStatus: received ? 'goods_received_client' : 'goods_sent_client',
      goodsSentClientAt: current.goodsSentClientAt || nowIso,
      ...(received ? { clientReceivedAt: nowIso, shippingStatus: 'client_received' } : { shippingStatus: 'sent_client' }),
      ...(patch.localDeliveryStatus ? { localDeliveryStartedAt: current.localDeliveryStartedAt || nowIso, localDeliveryDate: patch.localDeliveryDate || current.localDeliveryDate || defaults.localDeliveryDate, localEta: patch.localEta || current.localEta || defaults.localEta, localVendor: patch.localVendor || current.localVendor || defaults.localVendor } : {}),
      technicianNotifiedAt: nowIso,
      nextAction: received ? 'Teknisi atur jadwal instalasi' : 'Menunggu barang diterima klien',
    } : {};
    setData(prev => prev.map(s => s.id === id ? { ...s, ...patch, ...extra } : s));
    if (patch.localEta) {
      const eta = new Date(patch.localEta);
      const days = Math.ceil((eta - new Date()) / 86400000);
      if (!isNaN(days) && days <= 2) {
        notify({ role: 'technician' }, {
          type: 'install_pending',
          message: `Barang proyek akan tiba di RS sekitar ${patch.localEta}. Tim teknisi perlu persiapan instalasi.`,
          link: { view: 'installation', id },
        });
      }
    }
  };

  const shippingSteps = useMemo(() => [
    ...IMPORT_PIPELINE_STEPS.map(s => ({ id: s.id, label: lang === 'id' ? s.labelId : s.labelEn, color: s.color })),
  ], [t, lang]);

  const opsStats = useMemo(() => {
    const productionActive = poProjects.filter(p => getEffectiveShipping(p) === 'factory_production').length;
    const factoryOrdered = poProjects.filter(p => getEffectiveShipping(p) === 'plan_order').length;
    const inTransitCount = visibleManifests.filter(m => normalizeImportPipelineStatus(m.status) === 'on_shipment').length;
    const arrivedJakarta = visibleManifests.filter(m => {
      const linkedDocs = customsDocs.filter(d => d.manifestRef === m.manifestNo || d.manifestRef === m.id);
      return normalizeImportPipelineStatus(m.status) === 'arrived_clearance' || linkedDocs.some(d => ['pib_payment', 'redline', 'rejected'].includes(d.status));
    }).length;
    const clientDelivery = localProjects.filter(p => getEffectiveShipping(p) === 'sent_client').length;
    const clientReceived = poProjects.filter(p => getEffectiveShipping(p) === 'client_received').length;
    return {
      factoryOrdered,
      productionActive,
      totalManifests: visibleManifests.length,
      inTransit: inTransitCount,
      arrivedJakarta,
      clientDelivery,
      clientReceived,
    };
  }, [poProjects, visibleManifests, customsDocs, localProjects]);
  const { factoryOrdered, productionActive, totalManifests, inTransit, arrivedJakarta, clientDelivery, clientReceived } = opsStats;
  const opsHistoryRows = useMemo(() => poProjects.flatMap(p => (Array.isArray(p.stageHistory) ? p.stageHistory : []).map(h => ({ ...h, project: p })))
    .sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')))
    .slice(0, 8), [poProjects]);
  const avgProductionDays = useMemo(() => {
    const rows = poProjects.filter(p => p.factoryProductionStartedAt);
    if (!rows.length) return 0;
    return Math.round(rows.reduce((sum, p) => sum + (Number(p.factoryProductionDays) || getFactoryProductionDays(p)), 0) / rows.length);
  }, [poProjects]);

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_operations}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.operations_title}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.operations_subtitle}</div>
      </div>
      {!canEdit && <ReadOnlyBanner t={t} />}

      <div style={{display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '18px'}}>
        <div style={{position: 'relative', flex: '1 1 280px', minWidth: '220px'}}>
          <Search size={14} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ims-text-2)'}} />
          <input value={opsSearch} onChange={e => setOpsSearch(e.target.value)} placeholder={lang === 'id' ? 'Cari RS, SPH, modalitas, manifest...' : 'Search customer, SPH, modality, manifest...'} style={{paddingLeft: '36px'}} />
        </div>
        <select value={opsYear} onChange={e => setOpsYear(e.target.value)} style={{width: '150px'}}>
          <option value="all">{lang === 'id' ? 'Semua Tahun' : 'All Years'}</option>
          {opsYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <div className="card-pad">
          <div className="lbl-tag">{t.ops_po_in_shipping}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{factoryOrdered}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? `dari ${totalPoIssued} PO terbit` : `of ${totalPoIssued} issued PO`}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{t.ops_production_process}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#a026a0'}}>{productionActive}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'sedang diproduksi/disiapkan pabrik' : 'in factory production/preparation'}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{t.ops_total_manifests}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalManifests}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'manifest pengapalan aktif' : 'active shipment manifests'}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{t.ops_in_transit}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent)'}}>{inTransit}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{t.ops_arrived_jakarta}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#5b87b8'}}>{arrivedJakarta}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'tiba di Jakarta / proses Bea Cukai' : 'arrived Jakarta / customs process'}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{t.ops_client_delivery}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent-2)'}}>{clientDelivery}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>SPPB / {lang === 'id' ? 'pengiriman lokal' : 'local delivery'}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Diterima Klien' : 'Client Received'}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent)'}}>{clientReceived}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'barang sudah diterima RS/klien' : 'items received by client'}</div>
        </div>
      </div>

      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {[
          { id: 'dashboard', label: lang === 'id' ? 'Dashboard' : 'Dashboard', icon: Activity },
          { id: 'manifest', label: t.ops_tab_manifest, icon: Briefcase },
          { id: 'production', label: t.ops_tab_production, icon: Wrench },
          { id: 'customs', label: t.ops_tab_customs, icon: FileText },
          { id: 'local', label: t.ops_tab_local, icon: Truck },
          { id: 'shipment', label: t.ops_tab_shipment, icon: Truck },
        ].map(tb => {
          const Icon = tb.icon;
          const active = tab === tb.id;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: active ? 'var(--ims-accent)' : 'var(--ims-text-2)', borderBottom: active ? '2px solid var(--ims-border)' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px', letterSpacing: '0.03em'}}>
              <Icon size={14} strokeWidth={1.5} />{tb.label}
            </button>
          );
        })}
      </div>

      {tab === 'dashboard' && (
        <OperationsDashboardCharts
          poProjects={poProjects}
          visibleManifests={visibleManifests}
          visibleCustomsDocs={visibleCustomsDocs}
          localProjects={localProjects}
          getEffectiveShipping={getEffectiveShipping}
          avgProductionDays={avgProductionDays}
          lang={lang}
          fmt={fmt}
        />
      )}

      {tab === 'production' && (
        <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
          <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)'}}>
            <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.ops_tab_production}</div>
          </div>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '980px'}}>
            <thead>
              <tr style={{background: 'var(--ims-bg-card-2)'}}>
                <Th>{t.ops_manifest_no}</Th>
                <Th>{t.ops_customer_name}</Th>
                <Th>{t.ops_sph_no}</Th>
                <Th>{t.ops_modality}</Th>
                <Th>{t.ops_type_brand}</Th>
                <Th>Principal</Th>
                <Th>{t.ops_vessel}</Th>
                <Th>{lang === 'id' ? 'Estimasi Produksi' : 'Production Estimate'}</Th>
                {canEdit && <Th align="right">{t.crud_actions}</Th>}
              </tr>
            </thead>
            <tbody>
              {productionProjects.map(({ manifest, project }) => {
                const p = project;
                const info = p ? getFactoryProductionInfo(p) : {};
                const editing = p && editingProductionId === p.id;
                return (
                  <tr key={manifest.id} style={{borderTop: '1px solid var(--ims-border)'}}>
                    <Td><span className="mono" style={{fontWeight: 800}}>{manifest.manifestNo}</span></Td>
                    <Td>{manifest.customerName || p?.customer || '-'}</Td>
                    <Td><span className="mono">{manifest.sphNo || p?.sphNo || '-'}</span></Td>
                    <Td>{manifest.modality || p?.modality || p?.productModality || '-'}</Td>
                    <Td>{manifest.typeBrand || [p?.subModality || p?.productType || p?.type, p?.productBrand || p?.brand].filter(Boolean).join(' / ') || '-'}</Td>
                    <Td>{manifest.principal || p?.principal || p?.productBrand || p?.brand || '-'}</Td>
                    <Td>{manifest.shippingMode === 'air' ? 'Udara' : manifest.shippingMode === 'sea' ? 'Laut' : '-'}</Td>
                    <Td>
                      {!p ? (
                        <span style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Belum terhubung ke SPH DP diterima' : 'Not linked to a DP-received SPH'}</span>
                      ) : editing ? (
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 84px', gap: '6px', minWidth: '260px'}}>
                          <input type="datetime-local" value={productionEditDraft.startAt} onChange={e => setProductionEditDraft(prev => ({ ...prev, startAt: e.target.value }))} />
                          <input type="number" min="1" value={productionEditDraft.days} onChange={e => setProductionEditDraft(prev => ({ ...prev, days: e.target.value }))} />
                          <button onClick={() => saveProductionEdit(p.id)} style={{background: 'var(--ims-accent-2)', color: '#fff', border: 'none', padding: '5px 8px', fontSize: '10px', cursor: 'pointer', fontWeight: 800}}>{t.crud_save}</button>
                          <button onClick={() => setEditingProductionId(null)} style={{background: 'transparent', color: 'var(--ims-text-2)', border: '1px solid var(--ims-border)', padding: '5px 8px', fontSize: '10px', cursor: 'pointer', fontWeight: 700}}>{t.crud_cancel}</button>
                        </div>
                      ) : (
                        <>
                          <div className="mono" style={{fontWeight: 800}}>{info.days} {lang === 'id' ? 'hari' : 'days'}</div>
                          <div style={{fontSize: '10px', color: info.done ? 'var(--ims-accent-2)' : '#a026a0', marginTop: '2px'}}>
                            {info.dueAt ? `${lang === 'id' ? 'Estimasi' : 'ETA'}: ${formatDateTime(info.dueAt, lang)}` : '-'}
                          </div>
                          {!info.done && <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{Math.max(info.remainingDays || 0, 0)} {lang === 'id' ? 'hari tersisa' : 'days left'}</div>}
                        </>
                      )}
                    </Td>
                    {canEdit && (
                      <Td align="right">
                        {p && !info.startAt && (
                          <button onClick={() => setProductionConfirmId(p.id)} style={{background: '#a026a0', color: '#fff', border: 'none', padding: '5px 8px', fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, marginRight: '4px'}}>{lang === 'id' ? 'Mulai Produksi' : 'Start Production'}</button>
                        )}
                        {p && info.startAt && (
                          <>
                            <button onClick={() => openProductionEdit(p)} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '5px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-accent)', fontFamily: 'inherit', marginRight: '4px'}}>{lang === 'id' ? 'Edit' : 'Edit'}</button>
                            <button onClick={() => cancelProduction(p.id)} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '5px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}>{lang === 'id' ? 'Batalkan' : 'Cancel'}</button>
                          </>
                        )}
                        {!p && <span style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>-</span>}
                      </Td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {productionProjects.length === 0 && <div className="empty-state">{lang === 'id' ? 'Belum ada manifest pengiriman.' : 'No shipping manifests yet.'}</div>}
        </div>
      )}

      {tab === 'shipment' && (
        <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
          {poProjects.map(p => {
            const effectiveShipping = getEffectiveShipping(p);
            const linkedManifest = (p.manifestId && manifestById.get(p.manifestId)) || findManifestForProject(p);
            const isSynced = !!linkedManifest;
            const productionInfo = getFactoryProductionInfo(p);
            return (
            <div key={p.id} style={{padding: '18px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '10px'}}>
                <div>
                  <div style={{fontSize: '14px', fontWeight: 600}}>{p.customer}</div>
                  <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{p.subModality} · Qty {p.qty} · <span className="mono">{p.sphNo}</span></div>
                </div>
                <div className="mono" style={{fontSize: '14px', fontWeight: 500}}>{fmt(p.totalValue)}</div>
              </div>

              {linkedManifest && (
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--ims-text-2)'}}>
                  <span style={{padding: '2px 8px', fontSize: '9px', background: 'var(--ims-accent-2)20', color: 'var(--ims-accent-2)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', borderRadius: '3px'}}>🔗 {t.shipment_auto_synced}</span>
                  <span>{linkedManifest.manifestNo} · {linkedManifest.principal} · {importPipelineLabel(linkedManifest.status, lang)}</span>
                </div>
              )}

              <div style={{display: 'flex', gap: '0', marginBottom: '14px'}}>
                {shippingSteps.map((step, i) => {
                  const isActive = effectiveShipping === step.id;
                  const stepIdx = shippingSteps.findIndex(s => s.id === effectiveShipping);
                  const isPast = stepIdx > i;
                  const stamp = getImportStepTimestamp(p, linkedManifest, step.id);
                  return (
                    <button key={step.id} disabled title={isSynced ? t.shipment_auto_synced : ''} style={{flex: 1, minHeight: '54px', padding: '8px 6px', fontSize: '9px', fontWeight: 600, letterSpacing: '0.05em', background: isActive ? step.color : isPast ? step.color + '40' : 'transparent', color: isActive ? '#fff' : isPast ? step.color : 'var(--ims-text-2)', border: `1px solid ${isActive || isPast ? step.color : 'var(--ims-border)'}`, cursor: 'default', fontFamily: 'inherit', textTransform: 'uppercase', opacity: isSynced && !isActive && !isPast ? 0.6 : 1}}>
                      <span style={{display: 'block', lineHeight: 1.25}}>{step.label}</span>
                      <span className="mono" style={{display: 'block', marginTop: '5px', fontSize: '8px', letterSpacing: 0, textTransform: 'none', color: isActive ? 'rgba(255,255,255,0.82)' : isPast ? step.color : 'var(--ims-text-2)'}}>
                        {stamp ? formatDateTime(stamp, lang) : '-'}
                      </span>
                    </button>
                  );
                })}
              </div>
              {/* Status Note - especially important for "hold" */}
              {(p.customsStatus === 'hold' || p.customsStatusNote) && (
                <div style={{marginTop: '12px', padding: '10px 12px', background: p.customsStatus === 'hold' ? '#8b3a3a10' : 'var(--ims-text)', borderLeft: `3px solid ${p.customsStatus === 'hold' ? '#8b3a3a' : 'var(--ims-gold)'}`}}>
                  <div style={{fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: p.customsStatus === 'hold' ? '#8b3a3a' : 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>
                    {t.status_note_label} {p.customsStatus === 'hold' && <span style={{color: '#c03030'}}>* {t.status_note_hold_required}</span>}
                  </div>
                  {canEdit ? (
                    <CustomsNoteEditor value={p.customsStatusNote} isHold={p.customsStatus === 'hold'} onSave={note => saveStatusNote(p.id, note)} t={t} lang={lang} />
                  ) : (
                    <div style={{fontSize: '12px', color: 'var(--ims-text)', fontStyle: p.customsStatusNote ? 'normal' : 'italic'}}>{p.customsStatusNote || t.status_note_empty}</div>
                  )}
                </div>
              )}
            </div>
            );
          })}
          {poProjects.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: 'var(--ims-text-2)', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>{t.no_data}</div>}
        </div>
      )}

      {tab === 'manifest' && <ManifestList manifests={visibleManifests} setManifests={setManifests} data={data} setData={setData} t={t} lang={lang} canEdit={canEdit} fmt={fmt} />}
      {tab === 'customs' && <CustomsDocsList customsDocs={visibleCustomsDocs} setCustomsDocs={setCustomsDocs} manifests={visibleManifests} setManifests={setManifests} data={data} setData={setData} t={t} lang={lang} canEdit={canEdit} session={session} />}
      {tab === 'local' && (
        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
          {localProjects.map(p => {
            const defaults = getLocalDeliveryDefaults(p);
            const statusLabel = localDeliveryStatusLabel(p.localDeliveryStatus || defaults.localDeliveryStatus, lang);
            const statusColor = p.localDeliveryStatus === 'storing' ? '#1a4d8a' : (p.localDeliveryStatus === 'delivered_to_rs' || p.shippingStatus === 'client_received' ? 'var(--ims-accent)' : 'var(--ims-accent-2)');
            return (
            <div key={p.id} style={{padding: '16px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '12px'}}>
                <div>
                  <div style={{fontWeight: 700, fontSize: '14px'}}>{p.customer}</div>
                  <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{p.subModality} · <span className="mono">{p.sphNo}</span></div>
                </div>
                <span style={{padding: '4px 10px', fontSize: '10px', background: statusColor + '25', color: statusColor, fontWeight: 700}}>
                  {statusLabel.toUpperCase()}
                </span>
              </div>
              <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginBottom: '10px'}}>
                {lang === 'id' ? 'Update status' : 'Status update'}: <span className="mono">{formatDateTime(p.localDeliveryStartedAt || p.customsSppbAt || p.goodsSentClientAt || p.lastUpdate, lang)}</span>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, minmax(160px, 1fr))', gap: '10px'}}>
                <Field label={lang === 'id' ? 'Status Lokal' : 'Local Status'}>
                  <select disabled={!canEdit} value={p.localDeliveryStatus || 'on_delivery'} onChange={e => updateLocalDelivery(p.id, { localDeliveryStatus: e.target.value, sphWorkflowStatus: 'local_delivery', workflowEvent: 'local_delivery' })}>
                    <option value="on_delivery">{lang === 'id' ? 'Dalam pengiriman ke RS' : 'Delivering to hospital'}</option>
                    <option value="storing">Storing di gudang</option>
                    <option value="delivered_to_rs">Tiba di RS</option>
                  </select>
                </Field>
                <Field label={lang === 'id' ? 'Pengiriman ke RS' : 'Dispatch to Hospital'}><input disabled={!canEdit} type="date" value={p.localDeliveryDate || defaults.localDeliveryDate || ''} onChange={e => updateLocalDelivery(p.id, { localDeliveryDate: e.target.value })} /></Field>
                <Field label="ETA RS"><input disabled={!canEdit} type="date" value={p.localEta || defaults.localEta || ''} onChange={e => updateLocalDelivery(p.id, { localEta: e.target.value })} /></Field>
                <EditableLocalDeliveryField label={lang === 'id' ? 'Vendor Trucking' : 'Trucking Vendor'} value={p.localVendor || defaults.localVendor || ''} canEdit={canEdit} onSave={(value) => updateLocalDelivery(p.id, { localVendor: value })} />
                <EditableLocalDeliveryField label={lang === 'id' ? 'Link Lampiran' : 'Attachment Link'} value={p.localAttachmentUrl || ''} canEdit={canEdit} onSave={(value) => updateLocalDelivery(p.id, { localAttachmentUrl: value })} placeholder="https://drive.google.com/..." />
              </div>
              {p.localNotes && <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '8px'}}>{p.localNotes}</div>}
            </div>
          );})}
          {localProjects.length === 0 && <div className="empty-state">{lang === 'id' ? 'Belum ada barang SPPB / pengiriman lokal' : 'No SPPB / local delivery items yet'}</div>}
        </div>
      )}
      <ConfirmDialog
        open={!!productionConfirmId}
        title={lang === 'id' ? 'Mulai proses produksi?' : 'Start production process?'}
        message={lang === 'id' ? 'Tanggal dan jam saat ini akan dipakai sebagai awal hitung mundur durasi produksi. Lanjutkan?' : 'The current date and time will be used as the production countdown start. Continue?'}
        confirmText={lang === 'id' ? 'Ya, Mulai Produksi' : 'Yes, Start Production'}
        onConfirm={() => { startFactoryProduction(productionConfirmId); setProductionConfirmId(null); }}
        onCancel={() => setProductionConfirmId(null)}
        lang={lang}
      />
    </div>
  );
}

// ============== Manifest List ==============
function ManifestList({ manifests, setManifests, data, setData, t, lang, canEdit, fmt }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [sortBy, setSortBy] = useState('date_desc');
  const statusColors = {
    plan_order: '#94a3b8', factory_production: '#a026a0', ready_to_ship: '#7d9cc5',
    on_shipment: 'var(--ims-gold)', arrived_clearance: '#5b87b8',
    sent_client: '#2f8f6f', client_received: 'var(--ims-accent-2)',
  };

  const handleSave = (rec) => {
    const final = { ...rec, status: normalizeImportPipelineStatus(rec.status) };
    setManifests(prev => {
      const exists = prev.find(r => r.id === final.id);
      return exists ? prev.map(r => r.id === final.id ? final : r) : [...prev, final];
    });
    if (final.linkedProjectId || final.sphNo) {
      const normalized = normalizeImportPipelineStatus(final.status);
      const nowIso = new Date().toISOString();
      setData(prev => prev.map(s => (final.linkedProjectId && s.id === final.linkedProjectId) || (final.sphNo && s.sphNo === final.sphNo)
        ? {
          ...s,
          manifestId: final.id,
          shippingStatus: normalized,
          ...(normalized === 'on_shipment' ? { sphWorkflowStatus: 'import_clearance', importClearanceAt: s.importClearanceAt || nowIso } : {}),
          ...(normalized === 'sent_client' ? { sphWorkflowStatus: 'goods_sent_client', goodsSentClientAt: s.goodsSentClientAt || nowIso, localDeliveryStatus: s.localDeliveryStatus || 'on_delivery', localDeliveryStartedAt: s.localDeliveryStartedAt || nowIso } : {}),
          ...(normalized === 'client_received' ? { sphWorkflowStatus: 'goods_received_client', clientReceivedAt: s.clientReceivedAt || nowIso, localDeliveryStatus: 'delivered_to_rs' } : {}),
        }
        : s));
    }
    setModalOpen(false); setEditingRecord(null);
  };
  const [deleteId, setDeleteId] = useState(null);
  const handleDelete = (id) => {
    if (!canEdit) return;
    setDeleteId(id);
  };
  const confirmDelete = () => {
    setManifests(prev => prev.filter(r => r.id !== deleteId));
    setDeleteId(null);
  };

  const sortedManifests = useMemo(() => {
    const arr = [...manifests];
    if (sortBy === 'date_desc') return arr.sort((a, b) => (b.etd || '').localeCompare(a.etd || ''));
    if (sortBy === 'date_asc') return arr.sort((a, b) => (a.etd || '').localeCompare(b.etd || ''));
    if (sortBy === 'value_desc') return arr.sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0));
    if (sortBy === 'status') return arr.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    return arr;
  }, [manifests, sortBy]);

  return (
    <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
      <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
        <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.ops_tab_manifest}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <SortToggle value={sortBy} onChange={setSortBy} lang={lang} options={[{value: 'date_desc', label: lang === 'id' ? 'Terbaru' : 'Newest'}, {value: 'date_asc', label: lang === 'id' ? 'Terlama' : 'Oldest'}, {value: 'value_desc', label: lang === 'id' ? 'Nilai Tertinggi' : 'Highest Value'}, {value: 'status', label: lang === 'id' ? 'Status' : 'Status'}]} />
          {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
        </div>
      </div>
      <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '1100px'}}>
        <thead>
          <tr style={{background: 'var(--ims-bg-card-2)'}}>
            <Th>{t.ops_manifest_no}</Th>
            <Th>{t.ops_customer_name}</Th>
            <Th>{t.ops_sph_no}</Th>
            <Th>{t.ops_modality}</Th>
            <Th>{t.ops_type_brand}</Th>
            <Th>Principal</Th>
            <Th>{t.ops_vessel}</Th>
            <Th>ETD</Th>
            <Th>ETA</Th>
            <Th>{t.ops_manifest_status}</Th>
            {canEdit && <Th align="right">{t.crud_actions}</Th>}
          </tr>
        </thead>
        <tbody>
      {sortedManifests.map(m => {
        const normalizedStatus = normalizeImportPipelineStatus(m.status);
        const linked = (data || []).find(s => manifestMatchesProject(m, s));
        const statusColor = statusColors[normalizedStatus] || 'var(--ims-text-2)';
        const principalColor = m.principal === 'SG Healthcare' ? '#1a4d8a' : m.principal === 'ANKE' ? '#c03030' : m.principal === 'Hyde Medical' ? '#7b3fb5' : m.principal === 'SINO MDT' ? '#d4780a' : m.principal === 'Angell' ? '#0f7a5a' : '#b8860b';
        return (
          <tr key={m.id} style={{borderTop: '1px solid var(--ims-border)'}}>
            <Td>
              <span className="mono" style={{fontWeight: 800}}>{m.manifestNo}</span>
              {m.notes && <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '3px', fontStyle: 'italic'}}>{m.notes}</div>}
            </Td>
            <Td>{m.customerName || linked?.customer || '-'}</Td>
            <Td><span className="mono">{m.sphNo || linked?.sphNo || '-'}</span></Td>
            <Td>{m.modality || linked?.modality || linked?.productModality || '-'}</Td>
            <Td>{m.typeBrand || [linked?.subModality || linked?.productType || linked?.type, linked?.productBrand || linked?.brand].filter(Boolean).join(' / ') || '-'}</Td>
            <Td>
              <span style={{padding: '2px 8px', background: principalColor + '20', color: principalColor, fontSize: '10px', fontWeight: 700}}>{m.principal || '-'}</span>
              {m.principalOrigin && <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '3px'}}>{m.principalOrigin}</div>}
            </Td>
            <Td>{m.shippingMode === 'air' ? 'Udara' : m.shippingMode === 'sea' ? 'Laut' : '-'}</Td>
            <Td><span className="mono">{m.etd || '-'}</span></Td>
            <Td><span className="mono">{m.eta || '-'}</span></Td>
            <Td><span style={{padding: '3px 8px', fontSize: '10px', background: statusColor + '25', color: statusColor, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{importPipelineLabel(normalizedStatus, lang)}</span></Td>
            {canEdit && (
              <Td align="right">
                <div style={{display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap'}}>
                  <button onClick={() => { setEditingRecord(m); setModalOpen(true); }} className="btn-ghost" style={{fontSize: '10px'}} title={t.crud_edit || 'Edit'}><Edit2 size={12} />Edit</button>
                  <button onClick={() => handleDelete(m.id)} className="btn-ghost" style={{fontSize: '10px', color: '#c03030'}} title={t.crud_delete || 'Hapus'}><Trash2 size={12} />Hapus</button>
                </div>
              </Td>
            )}
          </tr>
        );
      })}
        </tbody>
      </table>
      {manifests.length === 0 && <div className="empty-state">{t.no_data}</div>}
      {modalOpen && <ManifestModal record={editingRecord} data={data} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} />}
      <ConfirmDialog open={!!deleteId} title={lang === 'id' ? 'Hapus Manifest?' : 'Delete Manifest?'} message={lang === 'id' ? 'Yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to delete this record? This action cannot be undone.'} onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} danger lang={lang} />
    </div>
  );
}

// ============== Customs Docs List ==============
function CustomsDocsList({ customsDocs, setCustomsDocs, manifests, setManifests, data, setData, t, lang, canEdit, session }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [sortBy, setSortBy] = useState('date_desc');
  const statusColors = { received: '#94a3b8', submitted: 'var(--ims-gold)', approved: 'var(--ims-accent-2)', rejected: '#c03030', redline: '#d97706', pib_payment: '#7b3fb5', sppb: 'var(--ims-accent-2)' };

  const handleSave = (rec) => {
    const nowIso = new Date().toISOString();
    const previous = customsDocs.find(r => r.id === rec.id);
    const final = {
      ...rec,
      updatedAt: nowIso,
      statusUpdatedAt: previous?.status === rec.status ? (rec.statusUpdatedAt || previous?.statusUpdatedAt || nowIso) : nowIso,
    };
    setCustomsDocs(prev => {
      const exists = prev.find(r => r.id === final.id);
      return exists ? prev.map(r => r.id === final.id ? final : r) : [...prev, final];
    });
    const manifest = manifests.find(m => m.manifestNo === final.manifestRef || m.id === final.manifestRef);
    const matchesCustomsProject = (s) => {
      if (final.linkedProjectId && s.id === final.linkedProjectId) return true;
      if (final.sphNo && s.sphNo === final.sphNo) return true;
      if (manifest && (s.manifestId === manifest.id || s.manifestId === manifest.manifestNo)) return true;
      if (manifest && manifestMatchesProject(manifest, s)) return true;
      const principal = normalizeProductLookupText((manifest?.principal || final.principal || ''));
      const projectText = normalizeProductLookupText([
        s.productBrand, s.brand, s.principal, s.modality, s.subModality, s.productType, s.customer, s.sphNo,
      ].filter(Boolean).join(' '));
      return !!(principal && projectText.includes(principal));
    };
    if (final.status === 'pib_payment') {
      setData(prev => prev.map(s => matchesCustomsProject(s) ? {
        ...s,
        pibAmount: Number(final.pibAmount) || Number(s.pibAmount) || 0,
        pibPaymentStatus: 'requested',
        pibPaymentRequestedAt: nowIso,
        workflowEvent: 'pib_payment_requested',
        nextAction: 'Finance melakukan pembayaran PIB',
      } : s));
      ['finance', 'gm', 'super_admin'].forEach(role => notify({ role }, {
        type: 'pib_payment_requested',
        message: `Pembayaran PIB ${final.poNo || final.docNo || ''} perlu diproses${final.pibAmount ? ` senilai ${Number(final.pibAmount).toLocaleString('id-ID')}` : ''}.`,
        link: { view: 'finance' },
      }, { username: session?.username || 'operations', role: session?.role || 'operations' }));
    }
    if (final.status === 'sppb') {
      const localDeliveryDate = addDateOnlyDays(nowIso, 1);
      const localEta = addDateOnlyDays(localDeliveryDate, 2);
      setManifests(prev => prev.map(m => (m.manifestNo === final.manifestRef || m.id === final.manifestRef || m.manifestNo === final.manifestNo || m.id === final.manifestId)
        ? { ...m, status: 'sent_client' }
        : m));
      setData(prev => prev.map(s => {
        if (!matchesCustomsProject(s)) return s;
        return {
          ...s,
          customsStatus: 'released',
          customsDocStatus: 'sppb',
          customsSppbAt: nowIso,
          localDeliveryStatus: s.localDeliveryStatus || 'on_delivery',
          localDeliveryStartedAt: s.localDeliveryStartedAt || nowIso,
          localDeliveryDate: s.localDeliveryDate || localDeliveryDate,
          localEta: s.localEta || localEta,
          shippingStatus: 'sent_client',
          goodsSentClientAt: s.goodsSentClientAt || nowIso,
          technicianNotifiedAt: s.technicianNotifiedAt || nowIso,
          sphWorkflowStatus: 'goods_sent_client',
          nextAction: 'Menunggu barang diterima klien sebelum jadwal instalasi',
          stageHistory: [...(s.stageHistory || []), { from: s.sphWorkflowStatus || s.stage, to: 'customs_sppb', by: session?.username || 'operations', at: nowIso }],
        };
      }));
      notify({ role: 'manager_ops' }, { type: 'customs_sppb', message: `SPPB ${final.poNo || final.docNo || ''} terbit. Pengiriman lokal ke RS otomatis berjalan.`, link: { view: 'operations' } }, { username: session?.username || 'operations', role: session?.role || 'operations' });
    }
    setModalOpen(false); setEditingRecord(null);
  };
  const [deleteId, setDeleteId] = useState(null);
  const handleDelete = (id) => {
    if (!canEdit) return;
    setDeleteId(id);
  };
  const confirmDelete = () => {
    setCustomsDocs(prev => prev.filter(r => r.id !== deleteId));
    setDeleteId(null);
  };

  const sortedDocs = useMemo(() => {
    const manifestRows = (manifests || []).map(m => {
      const docs = (customsDocs || []).filter(d => d.manifestRef === m.manifestNo || d.manifestRef === m.id || d.manifestNo === m.manifestNo);
      const latest = docs.sort((a, b) => (b.statusUpdatedAt || b.updatedAt || b.docDate || '').localeCompare(a.statusUpdatedAt || a.updatedAt || a.docDate || ''))[0];
      return { ...(latest || {}), ...m, id: latest?.id || `cdoc_${m.id}`, manifestId: m.id, manifestRef: m.manifestNo, status: latest?.status || 'submitted', docDate: latest?.docDate || m.eta || m.etd || '', docNo: latest?.docNo || m.manifestNo };
    });
    const orphanDocs = (customsDocs || []).filter(d => !(manifests || []).some(m => d.manifestRef === m.manifestNo || d.manifestRef === m.id || d.manifestNo === m.manifestNo));
    const arr = [...manifestRows, ...orphanDocs];
    if (sortBy === 'date_desc') return arr.sort((a, b) => (b.docDate || '').localeCompare(a.docDate || ''));
    if (sortBy === 'date_asc') return arr.sort((a, b) => (a.docDate || '').localeCompare(b.docDate || ''));
    if (sortBy === 'value_desc') return arr.sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0));
    if (sortBy === 'status') return arr.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    return arr;
  }, [customsDocs, manifests, sortBy]);

  return (
    <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
      <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
        <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.ops_tab_customs}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <SortToggle value={sortBy} onChange={setSortBy} lang={lang} options={[{value: 'date_desc', label: lang === 'id' ? 'Terbaru' : 'Newest'}, {value: 'date_asc', label: lang === 'id' ? 'Terlama' : 'Oldest'}, {value: 'status', label: lang === 'id' ? 'Status' : 'Status'}]} />
          {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
        </div>
      </div>
      <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '800px'}}>
        <thead>
          <tr style={{background: 'var(--ims-bg-card-2)'}}>
            <Th>{t.ops_manifest_no}</Th>
            <Th>{t.ops_customer_name}</Th>
            <Th>{t.ops_sph_no}</Th>
            <Th>{t.ops_modality}</Th>
            <Th>{t.ops_type_brand}</Th>
            <Th>Principal</Th>
            <Th>{t.ops_vessel}</Th>
            <Th>ETA</Th>
            <Th>{t.ops_doc_status}</Th>
            {canEdit && <Th align="right">{t.crud_actions}</Th>}
          </tr>
        </thead>
        <tbody>
          {sortedDocs.map(d => {
            const linked = (data || []).find(s => manifestMatchesProject(d, s));
            const statusColor = statusColors[d.status] || 'var(--ims-text-2)';
            return (
              <tr key={d.id} className="hover-row" style={{borderTop: '1px solid var(--ims-border)'}}>
                <Td>
                  <span className="mono" style={{fontSize: '11px', fontWeight: 600}}>{d.manifestNo || d.manifestRef || d.docNo}</span>
                  {d.fileUrl && <div style={{marginTop: '4px'}}><LinkAttachment url={d.fileUrl} lang={lang} /></div>}
                  {d.notes && <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px', fontStyle: 'italic'}}>{d.notes}</div>}
                </Td>
                <Td>{d.customerName || linked?.customer || '-'}</Td>
                <Td><span className="mono">{d.sphNo || linked?.sphNo || '-'}</span></Td>
                <Td>{d.modality || linked?.modality || linked?.productModality || '-'}</Td>
                <Td>{d.typeBrand || [linked?.subModality || linked?.productType || linked?.type, linked?.productBrand || linked?.brand].filter(Boolean).join(' / ') || '-'}</Td>
                <Td><span style={{fontSize: '11px'}}>{d.principal}</span></Td>
                <Td>{d.shippingMode === 'air' ? 'Udara' : d.shippingMode === 'sea' ? 'Laut' : '-'}</Td>
                <Td><span className="mono" style={{fontSize: '11px'}}>{d.eta || d.docDate || '-'}</span></Td>
                <Td>
                  <span style={{padding: '3px 8px', fontSize: '10px', background: statusColor + '25', color: statusColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`ops_doc_${d.status}`] || d.status || '-'}</span>
                  {d.pibAmount ? <div className="mono" style={{fontSize: '9px', color: '#7b3fb5', marginTop: '3px'}}>PIB: Rp {Number(d.pibAmount || 0).toLocaleString('id-ID')}</div> : null}
                </Td>
                {canEdit && (
                  <Td align="right">
                    <button onClick={() => { setEditingRecord(d); setModalOpen(true); }} className="btn-ghost" style={{fontSize: '10px', padding: '5px 10px'}}><Edit2 size={11} />Edit</button>
                    <button onClick={() => handleDelete(d.id)} className="btn-ghost" style={{fontSize: '10px', padding: '5px 10px', color: '#c03030'}}><Trash2 size={11} />Hapus</button>
                  </Td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {sortedDocs.length === 0 && <div className="empty-state">{t.no_data}</div>}
      {modalOpen && <CustomsDocModal record={editingRecord} manifests={manifests} data={data} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} />}
      <ConfirmDialog open={!!deleteId} title={lang === 'id' ? 'Hapus Dokumen?' : 'Delete Document?'} message={lang === 'id' ? 'Yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to delete this record? This action cannot be undone.'} onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} danger lang={lang} />
    </div>
  );
}

// ============== Manifest Modal ==============
function ManifestModal({ record, data = [], onSave, onClose, t, lang }) {
  const today = new Date().toISOString().split('T')[0];
  const dpProjects = useMemo(() => (data || []).filter(s => s.poStatus === 'issued' && projectHasDpReceived(s)), [data]);
  const [form, setForm] = useState(record ? {
    ...record,
    status: normalizeImportPipelineStatus(record.status),
    shippingMode: record.shippingMode || 'sea',
  } : {
    id: 'mfst_' + Date.now(),
    manifestNo: 'MFST-' + new Date().toISOString().substring(0, 7) + '-' + String(Date.now()).slice(-3),
    customerName: '', modality: '', typeBrand: '', sphNo: '', linkedProjectId: '',
    principal: '', principalOrigin: '', shippingMode: 'sea',
    etd: today, eta: '', portOfLoading: '', portOfDischarge: 'Tanjung Priok, Jakarta',
    itemsCount: 1, freightCost: 0,
    status: 'plan_order', notes: '',
  });
  const isEdit = !!record;
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const selectProject = (projectId) => {
    const p = dpProjects.find(s => s.id === projectId);
    if (!p) {
      update('linkedProjectId', '');
      return;
    }
    setForm(prev => ({
      ...prev,
      linkedProjectId: p.id,
      customerName: p.customer || '',
      modality: p.modality || p.productModality || '',
      typeBrand: [p.subModality || p.productType || p.type, p.productBrand || p.brand].filter(Boolean).join(' / '),
      sphNo: p.sphNo || '',
      principal: p.principal || p.productBrand || p.brand || prev.principal || '',
      itemsCount: Number(p.qty) || prev.itemsCount || 1,
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.ops_modal_edit_manifest : t.ops_modal_add_manifest}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <Field label={t.ops_manifest_no}><input value={form.manifestNo} onChange={e => update('manifestNo', e.target.value)} /></Field>
          <Field label={t.ops_manifest_status}>
            <select value={form.status} onChange={e => update('status', e.target.value)}>
              {IMPORT_PIPELINE_STEPS.map(step => (
                <option key={step.id} value={step.id}>{lang === 'id' ? step.labelId : step.labelEn}</option>
              ))}
            </select>
          </Field>
          <Field label={lang === 'id' ? 'Data RS DP Diterima' : 'DP Received Customer'}>
            <select value={form.linkedProjectId || ''} onChange={e => selectProject(e.target.value)}>
              <option value="">—</option>
              {dpProjects.map(p => <option key={p.id} value={p.id}>{p.customer} — {p.sphNo}</option>)}
            </select>
          </Field>
          <Field label={t.ops_customer_name}><input value={form.customerName || ''} onChange={e => update('customerName', e.target.value)} /></Field>
          <Field label={t.ops_modality}><input value={form.modality || ''} onChange={e => update('modality', e.target.value)} /></Field>
          <Field label={t.ops_type_brand}><input value={form.typeBrand || ''} onChange={e => update('typeBrand', e.target.value)} /></Field>
          <Field label={t.ops_sph_no}><input value={form.sphNo || ''} onChange={e => update('sphNo', e.target.value)} /></Field>
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
          <Field label={t.ops_vessel}>
            <select value={form.shippingMode || 'sea'} onChange={e => update('shippingMode', e.target.value)}>
              <option value="sea">Laut</option>
              <option value="air">Udara</option>
            </select>
          </Field>
          <Field label={t.ops_etd}><input type="date" value={form.etd} onChange={e => update('etd', e.target.value)} /></Field>
          <Field label={t.ops_eta}><input type="date" value={form.eta} onChange={e => update('eta', e.target.value)} /></Field>
          <Field label={t.ops_port_of_loading}><input value={form.portOfLoading} onChange={e => update('portOfLoading', e.target.value)} /></Field>
          <Field label={t.ops_port_of_discharge}><input value={form.portOfDischarge} onChange={e => update('portOfDischarge', e.target.value)} /></Field>
          <Field label={t.ops_items_count}><input type="number" min="1" value={form.itemsCount} onChange={e => update('itemsCount', parseInt(e.target.value) || 1)} /></Field>
          <Field label={t.ops_freight_cost + ' (Rp)'}><input type="number" value={form.freightCost} onChange={e => update('freightCost', parseFloat(e.target.value) || 0)} /></Field>
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
function CustomsDocModal({ record, manifests, data = [], onSave, onClose, t, lang }) {
  const today = new Date().toISOString().split('T')[0];
  const normalizedRecord = record ? {
    ...record,
    poNo: record.poNo || record.docType || '',
    status: ['submitted', 'rejected', 'redline', 'pib_payment', 'sppb'].includes(record.status) ? record.status : 'submitted',
    manifestRef: record.manifestRef || record.manifestNo || '',
  } : null;
  const [form, setForm] = useState(normalizedRecord || {
    id: 'doc_' + Date.now(), docNo: '', manifestRef: '',
    customerName: '', modality: '', typeBrand: '', sphNo: '',
    principal: '', shippingMode: 'sea', eta: '', docDate: today, status: 'submitted',
    pibAmount: 0, fileUrl: '', notes: '',
  });
  const isEdit = !!record;
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const selectManifest = (manifestNo) => {
    const m = manifests.find(x => x.manifestNo === manifestNo || x.id === manifestNo);
    if (!m) {
      update('manifestRef', manifestNo);
      return;
    }
    const linked = (data || []).find(s => manifestMatchesProject(m, s));
    setForm(prev => ({
      ...prev,
      manifestRef: m.manifestNo,
      manifestNo: m.manifestNo,
      manifestId: m.id,
      docNo: prev.docNo || m.manifestNo,
      customerName: m.customerName || linked?.customer || '',
      modality: m.modality || linked?.modality || linked?.productModality || '',
      typeBrand: m.typeBrand || [linked?.subModality || linked?.productType || linked?.type, linked?.productBrand || linked?.brand].filter(Boolean).join(' / '),
      sphNo: m.sphNo || linked?.sphNo || '',
      linkedProjectId: m.linkedProjectId || linked?.id || '',
      principal: m.principal || linked?.principal || linked?.productBrand || linked?.brand || '',
      shippingMode: m.shippingMode || 'sea',
      eta: m.eta || prev.eta || '',
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '640px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.ops_modal_edit_customs : t.ops_modal_add_customs}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <Field label={lang === 'id' ? 'Ref Manifest' : 'Manifest Ref'}>
            <select value={form.manifestRef} onChange={e => selectManifest(e.target.value)}>
              <option value="">—</option>
              {manifests.map(m => <option key={m.id} value={m.manifestNo}>{m.manifestNo} — {m.principal}</option>)}
            </select>
          </Field>
          <Field label={t.ops_manifest_no}><input value={form.manifestNo || form.manifestRef || form.docNo || ''} onChange={e => { update('manifestNo', e.target.value); update('manifestRef', e.target.value); }} /></Field>
          <Field label={t.ops_customer_name}><input value={form.customerName || ''} onChange={e => update('customerName', e.target.value)} /></Field>
          <Field label={t.ops_sph_no}><input value={form.sphNo || ''} onChange={e => update('sphNo', e.target.value)} /></Field>
          <Field label={t.ops_modality}><input value={form.modality || ''} onChange={e => update('modality', e.target.value)} /></Field>
          <Field label={t.ops_type_brand}><input value={form.typeBrand || ''} onChange={e => update('typeBrand', e.target.value)} /></Field>
          <Field label={t.imp_principal}><input value={form.principal || ''} onChange={e => update('principal', e.target.value)} /></Field>
          <Field label={t.ops_vessel}>
            <select value={form.shippingMode || 'sea'} onChange={e => update('shippingMode', e.target.value)}>
              <option value="sea">Laut</option>
              <option value="air">Udara</option>
            </select>
          </Field>
          <Field label="ETA"><input type="date" value={form.eta || ''} onChange={e => update('eta', e.target.value)} /></Field>
          <Field label={t.ops_doc_date}><input type="date" value={form.docDate} onChange={e => update('docDate', e.target.value)} /></Field>
          <Field label={t.ops_doc_status}>
            <select value={form.status} onChange={e => update('status', e.target.value)}>
              <option value="submitted">{t.ops_doc_submitted}</option>
              <option value="rejected">{t.ops_doc_rejected}</option>
              <option value="redline">{t.ops_doc_redline}</option>
              <option value="pib_payment">{t.ops_doc_pib_payment}</option>
              <option value="sppb">{t.ops_doc_sppb}</option>
            </select>
          </Field>
          {form.status === 'pib_payment' && (
            <Field label={lang === 'id' ? 'Nilai Pembayaran PIB (Rp)' : 'PIB Payment Amount (Rp)'}>
              <input type="number" min="0" value={form.pibAmount || ''} onChange={e => update('pibAmount', parseFloat(e.target.value) || 0)} placeholder="0" />
            </Field>
          )}
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

function InstallationModule({ data, setData, installRecords, setInstallRecords, bastRecords, setBastRecords, trainingRecords, setTrainingRecords, t, lang, canEdit, fmt, employees = {}, liveTechnicians = [], regRecords = [], products = [], documentTemplates = DEFAULT_DOCUMENT_TEMPLATES, onSaveDocument, session = {} }) {
  const [installEditor, setInstallEditor] = useState(null); // { record, docType, html, title }
  const openInstallEditor = (docType, record, label) => {
    const html = buildEditorTemplate(docType, record, employees, fmt, documentTemplates, record.salesOwner || record.requesterId);
    setInstallEditor({ record, docType, html, title: (label || DOC_TYPE_LABELS[docType] || 'Dokumen') + ' — ' + (record.customer || '') });
  };
  const [tab, setTab] = useState('records');
  // Default to current year (2026) — sync with SPH module behavior
  const [filterYear, setFilterYear] = useState('2026');
  const [search, setSearch] = useState('');
  const searchTerm = search.trim().toLowerCase();
  const matchesSearch = (...parts) => !searchTerm || parts.some(p => String(p || '').toLowerCase().includes(searchTerm));
  // Speed booster: paginate the progress card list so we never render 80+ heavy cards at once.
  const CARD_PAGE = 24;
  const [visibleCount, setVisibleCount] = useState(CARD_PAGE);
  useEffect(() => { setVisibleCount(CARD_PAGE); }, [filterYear, search, tab]);

  // Available years derived from data (PO issue years OR install-record years)
  const availableYears = useMemo(() => {
    const years = new Set();
    data.forEach(s => { if (s.issuedDate) years.add(s.issuedDate.substring(0, 4)); });
    installRecords.forEach(r => { if (r.installStart) years.add(r.installStart.substring(0, 4)); });
    bastRecords.forEach(r => { if (r.signedDate) years.add(r.signedDate.substring(0, 4)); });
    trainingRecords.forEach(r => { if (r.sessionDate) years.add(r.sessionDate.substring(0, 4)); });
    return Array.from(years).sort().reverse();
  }, [data, installRecords, bastRecords, trainingRecords]);

  // Year-filtered document sets so Riwayat / BAST / Training tabs stay consistent with the PO Year selector.
  const yearKey = (r, dateField) => r.poYear || (r[dateField] || '').substring(0, 4);
  const installRecordsY = useMemo(() => filterYear === 'all' ? installRecords : installRecords.filter(r => yearKey(r, 'installStart') === filterYear), [installRecords, filterYear]);
  const bastRecordsY = useMemo(() => filterYear === 'all' ? bastRecords : bastRecords.filter(r => yearKey(r, 'signedDate') === filterYear), [bastRecords, filterYear]);
  const trainingRecordsY = useMemo(() => filterYear === 'all' ? trainingRecords : trainingRecords.filter(r => yearKey(r, 'sessionDate') === filterYear), [trainingRecords, filterYear]);

  const installRecordsFiltered = useMemo(() => installRecordsY.filter(r => matchesSearch(r.recordNo, r.customer, r.modality, r.subModality, r.status, resolveEmpName(employees, r.leadTechnician))), [installRecordsY, searchTerm, employees]);
  const bastRecordsFiltered = useMemo(() => bastRecordsY.filter(r => matchesSearch(r.bastNo, r.customer, r.modality, r.subModality, r.status, r.hntiRep, r.customerRep, r.witness)), [bastRecordsY, searchTerm]);
  const trainingRecordsFiltered = useMemo(() => trainingRecordsY.filter(r => matchesSearch(r.certNo, r.customer, r.modality, r.subModality, r.status, r.instructor, r.topics)), [trainingRecordsY, searchTerm]);

  // Pipeline Instalasi hanya boleh berasal dari Data Instalasi yang dibuat teknisi.
  // SPH dipakai hanya sebagai metadata pendukung, bukan pemicu proyek masuk pipeline.
  const installProjects = useMemo(() => installRecordsFiltered.map(r => {
    const sph = data.find(s => s.customer === r.customer && (s.subModality || '') === (r.subModality || ''))
      || data.find(s => s.customer === r.customer && (s.modality || '') === (r.modality || ''))
      || data.find(s => s.customer === r.customer);
    return {
      ...(sph || {}),
      id: sph?.id || r.id,
      customer: r.customer,
      modality: r.modality || sph?.modality || '',
      subModality: r.subModality || sph?.subModality || '',
      product: sph?.product || r.subModality || r.modality || '',
      sphNo: sph?.sphNo || r.sphNo || r.recordNo,
      issuedDate: sph?.issuedDate || r.installStart || '',
      installationStatus: r.status === 'completed' ? 'record_completed' : 'record_in_progress',
      _installRecord: r,
    };
  }).sort((a, b) => {
    const aDone = a._installRecord?.status === 'completed' ? 1 : 0;
    const bDone = b._installRecord?.status === 'completed' ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    return (b._installRecord?.installStart || '').localeCompare(a._installRecord?.installStart || '');
  }), [installRecordsFiltered, data]);
  const installRecordUnits = useMemo(() => installRecordsFiltered.map(r => {
    const sph = data.find(s => s.customer === r.customer && (s.subModality || '') === (r.subModality || ''))
      || data.find(s => s.customer === r.customer && (s.modality || '') === (r.modality || ''))
      || data.find(s => s.customer === r.customer);
    return { id: r.id, customer: r.customer, modality: r.modality || sph?.modality || '', subModality: r.subModality || sph?.subModality || '', sphNo: sph?.sphNo || r.recordNo };
  }), [installRecordsFiltered, data]);
  const normalizeInstallPart = (value) => String(value || '').trim().toLowerCase();
  const unitKey = (r) => [r.customer, r.modality, r.subModality].map(normalizeInstallPart).join('|');
  const bastRecordsForView = useMemo(() => {
    const existing = new Set(bastRecordsFiltered.map(unitKey));
    const placeholders = installRecordsFiltered
      .filter(r => !existing.has(unitKey(r)))
      .map(r => ({
        id: `bast_pending_${r.id}`,
        bastNo: lang === 'id' ? 'BAST belum dibuat' : 'BAST not created',
        customer: r.customer,
        modality: r.modality,
        subModality: r.subModality,
        signedDate: '',
        hntiRep: resolveEmpName(employees, r.leadTechnician),
        customerRep: '',
        witness: '',
        status: 'draft',
        docUrl: '',
        notes: lang === 'id' ? 'Menunggu update BAST dari tim teknisi.' : 'Waiting for BAST update from technician team.',
        _placeholder: true,
      }));
    return [...bastRecordsFiltered, ...placeholders];
  }, [bastRecordsFiltered, installRecordsFiltered, employees, lang]);
  const trainingRecordsForView = useMemo(() => {
    const existing = new Set(trainingRecordsFiltered.map(unitKey));
    const placeholders = installRecordsFiltered
      .filter(r => !existing.has(unitKey(r)))
      .map(r => ({
        id: `train_pending_${r.id}`,
        certNo: lang === 'id' ? 'Training belum dibuat' : 'Training not created',
        customer: r.customer,
        modality: r.modality,
        subModality: r.subModality,
        sessionDate: '',
        participants: 0,
        instructor: resolveEmpName(employees, r.leadTechnician),
        duration: 0,
        topics: '',
        status: 'pending',
        certUrl: '',
        notes: lang === 'id' ? 'Menunggu update training produk.' : 'Waiting for product training update.',
        _placeholder: true,
      }));
    return [...trainingRecordsFiltered, ...placeholders];
  }, [trainingRecordsFiltered, installRecordsFiltered, employees, lang]);

  const toggleStep = (id, field) => {
    if (!canEdit) return;
    setData(prev => prev.map(s => {
      if (s.id !== id) return s;
      const nextVal = !s[field];
      const extra = {};
      if (nextVal && field === 'installation_done') {
        extra.sphWorkflowStatus = 'install_schedule_updated';
        extra.installScheduleUpdatedAt = s.installScheduleUpdatedAt || new Date().toISOString();
        extra.nextAction = 'Teknisi menyelesaikan instalasi dan update BAST';
        extra.functionTest = true;
      }
      if (nextVal && field === 'bastDone') {
        extra.bastDone = true;
        extra.installationStatus = 'installed';
        extra.sphWorkflowStatus = 'installed_bast';
        extra.bastDate = s.bastDate || new Date().toISOString().split('T')[0];
        extra.regulatoryNotifiedAt = s.regulatoryNotifiedAt || new Date().toISOString();
        extra.nextAction = 'Regulatory proses izin pemanfaatan';
      }
      return { ...s, [field]: nextVal, ...extra };
    }));
    if (field === 'bastDone') {
      notify({ role: 'regulatory' }, { type: 'system', message: 'Instalasi dan BAST telah selesai. Regulatory dapat memulai izin pemanfaatan.', link: { view: 'regulatory', id } });
    }
  };
  const toggleInstallPipelineStep = (project, field) => {
    if (!canEdit) return;
    if (['exposureTest', 'complianceTest'].includes(field) && project?._installRecord?.id) {
      setInstallRecords(prev => prev.map(r => r.id === project._installRecord.id ? { ...r, [field]: !r[field] } : r));
      return;
    }
    toggleStep(project.id, field);
  };
  const updateEvidence = (id, field, url) => { if (!canEdit) return; setData(prev => prev.map(s => s.id === id ? { ...s, [field]: url } : s)); };

  // CROSS-TAB SYNC: pipeline status must match the exact installed unit,
  // not only the customer name. One RS can have multiple projects/products.
  const recordsByUnit = useMemo(() => {
    const map = new Map();
    installRecords.forEach(r => map.set(unitKey(r), r));
    return map;
  }, [installRecords]);
  const bastByUnit = useMemo(() => {
    const map = new Map();
    bastRecords.forEach(b => map.set(unitKey(b), b));
    return map;
  }, [bastRecords]);
  const trainingByUnit = useMemo(() => {
    const map = new Map();
    trainingRecords.forEach(tr => map.set(unitKey(tr), tr));
    return map;
  }, [trainingRecords]);
  const isProductDelivered = (s) => (
    s.shippingStatus === 'delivered'
    || s.shippingStatus === 'client_received'
    || s.localDeliveryStatus === 'delivered_to_rs'
    || s.sphWorkflowStatus === 'goods_received_client'
    || !!s.clientReceivedAt
    || s.goodsDeliveryStatus === 'delivered'
    || s.deliveryStatus === 'delivered'
  );
  const isBastDoneForSph = (s) => {
    const bast = bastByUnit.get(unitKey(s));
    return !!s.bastDone || !!s.bastDate || s.installationStatus === 'installed' || bast?.status === 'signed';
  };

  // SPH untuk form Data Instalasi: hanya produk yang sudah terkirim ke RS, lalu hilang setelah BAST selesai.
  const deliveredUnits = useMemo(() => data
    .filter(s => s.poStatus === 'issued' && isProductDelivered(s) && !isBastDoneForSph(s))
    .map(s => ({ id: s.id, customer: s.customer, modality: s.modality, subModality: s.subModality || '', sphNo: s.sphNo }))
    .sort((a, b) => a.customer.localeCompare(b.customer)), [data, bastByUnit]);

  // BAPETEN Utilization Permit linkage (review #3): a unit's "Izin BAPETEN" step turns green
  // automatically once the matching Izin Pemanfaatan BAPETEN record (regulatory) reaches "issued".
  const bapetenIssuedByCustomer = useMemo(() => {
    const map = new Map();
    (regRecords || []).forEach(r => {
      const issued = r.stage === 'issued' || !!r.issuedDate;
      if (issued && r.customer) map.set(r.customer, r);
    });
    return map;
  }, [regRecords]);

  // Derive effective step status for a PO project (auto-synced from other tabs)
  const getStepStatus = (p) => {
    const rec = p._installRecord || recordsByUnit.get(unitKey(p));
    const exactKey = unitKey(rec || p);
    const bast = bastByUnit.get(exactKey);
    const training = trainingByUnit.get(exactKey);
    const bapetenRec = bapetenIssuedByCustomer.get(p.customer);
    const installationComplete = !!(rec && rec.status === 'completed');
    const functionComplete = installationComplete || !!(rec && rec.calibrationDone);
    return {
      installation_done: installationComplete,
      functionTest: functionComplete,
      exposureTest: !!(rec && rec.exposureTest),
      complianceTest: !!(rec && rec.complianceTest),
      trainingCert: !!(training && training.status === 'completed'),
      bapetenPermit: !!bapetenRec,
      bast: !!(bast && (bast.status === 'signed' || !!bast.signedDate)),
      _rec: rec, _bast: bast, _training: training, _bapeten: bapetenRec,
    };
  };

  // Tahap 11 Phase 1.5: dynamic installSteps per modality
  // - Hapus 'bapetenPermit' (catatan #4: bukan domain teknisi)
  // - Skip 'exposureTest' + 'complianceTest' untuk Flat Panel Detector, MRI, ESWL (catatan #5)
  const SKIP_RADIATION_TEST_PRODUCTS = ['Flat Panel Detector', 'MRI', 'ESWL'];
  const getInstallStepsForProduct = (productOrModality) => {
    const norm = String(productOrModality || '').toLowerCase();
    const skipRadiation = SKIP_RADIATION_TEST_PRODUCTS.some(p => norm.includes(p.toLowerCase()));
    const steps = [
      { id: 'installation_done', label: t.installation_done, icon: Wrench, syncSrc: 'record', manual: false },
      { id: 'functionTest', label: t.function_test, icon: CheckCircle2, syncSrc: 'record', manual: false },
    ];
    if (!skipRadiation) {
      steps.push({ id: 'exposureTest', label: t.exposure_test, icon: CheckCircle2, syncSrc: null, manual: true });
      steps.push({ id: 'complianceTest', label: t.compliance_test, icon: CheckCircle2, syncSrc: null, manual: true });
    }
    steps.push({ id: 'trainingCert', label: t.training_cert, icon: FileCheck, syncSrc: 'training', manual: false });
    steps.push({ id: 'bast', label: t.inst_step_bast, icon: FileCheck, syncSrc: 'bast', manual: false });
    // 'bapetenPermit' tidak dipakai di Progress Instalasi (per catatan #4 Pak Fajrin)
    return steps;
  };
  // Backward compat fallback (default tanpa product filter — pakai semua step kecuali bapetenPermit)
  const installSteps = useMemo(() => getInstallStepsForProduct(''), [t]);

  // PERFORMANCE: KPI calculations memoized — now scoped to the YEAR-FILTERED installProjects
  // so the dashboard numbers + record list stay consistent with the PO Year selector.
  const kpis = useMemo(() => {
    const inProg = installRecordsFiltered.filter(r => r.status !== 'completed').length;
    const comp = installRecordsFiltered.filter(r => r.status === 'completed').length;
    const bastS = bastRecordsFiltered.filter(r => r.status === 'signed' || !!r.signedDate).length;
    const trainD = trainingRecordsFiltered.filter(r => r.status === 'completed').length;
    return { totalRecords: installRecordsFiltered.length, inProgressCount: inProg, completedCount: comp, bastSignedCount: bastS, trainingDoneCount: trainD };
  }, [installRecordsFiltered, bastRecordsFiltered, trainingRecordsFiltered]);
  const { totalRecords, inProgressCount, completedCount, bastSignedCount, trainingDoneCount } = kpis;

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_installation}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.installation_title}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.installation_subtitle}</div>
      </div>
      {!canEdit && <ReadOnlyBanner t={t} />}

      {/* KPI Cards */}
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div className="lbl-tag">{t.inst_total_records}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '4px'}}>{totalRecords}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? `data instalasi${filterYear !== 'all' ? ` ${filterYear}` : ''}${searchTerm ? ' sesuai pencarian' : ''}` : `installation data${filterYear !== 'all' ? ` ${filterYear}` : ''}${searchTerm ? ' matching search' : ''}`}</div>
        </div>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div className="lbl-tag">{t.inst_in_progress}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent)'}}>{inProgressCount}</div>
        </div>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div className="lbl-tag">{t.inst_completed_count}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent-2)'}}>{completedCount}</div>
        </div>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div className="lbl-tag">{t.inst_bast_signed}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '4px', color: '#1a4d8a'}}>{bastSignedCount}</div>
        </div>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div className="lbl-tag">{t.inst_training_done}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '4px', color: '#7b3fb5'}}>{trainingDoneCount}</div>
        </div>
      </div>

      {/* Year filter + search bar */}
      <div style={{display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center', flexWrap: 'wrap'}}>
        <div style={{position: 'relative', flex: '1 1 260px', maxWidth: '380px'}}>
          <Search size={14} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ims-text-2)'}} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === 'id' ? 'Cari pelanggan, SPH, atau modalitas...' : 'Search customer, SPH, or modality...'} style={{paddingLeft: '36px'}} />
        </div>
        <span style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? 'Tahun PO' : 'PO Year'}:</span>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{width: 'auto', minWidth: '110px'}}>
          <option value="all">{lang === 'id' ? 'Semua Tahun' : 'All Years'}</option>
          {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span style={{fontSize: '11px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>
          {lang === 'id'
            ? `${totalRecords} data instalasi${filterYear !== 'all' ? ` di ${filterYear}` : ''} · ${inProgressCount} sedang berlangsung · ${installProjects.length} proyek di pipeline`
            : `${totalRecords} installation records${filterYear !== 'all' ? ` in ${filterYear}` : ''} · ${inProgressCount} in progress · ${installProjects.length} projects in pipeline`}
        </span>
      </div>

      {/* Tabs */}
      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {[
          { id: 'records', label: t.inst_tab_records, icon: ClipboardList },
          { id: 'training', label: t.inst_tab_training, icon: Users },
          { id: 'bast', label: t.inst_tab_bast, icon: FileCheck },
          { id: 'progress', label: t.inst_tab_progress, icon: Wrench },
        ].map(tb => {
          const Icon = tb.icon;
          const active = tab === tb.id;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: active ? 'var(--ims-accent)' : 'var(--ims-text-2)', borderBottom: active ? '2px solid var(--ims-border)' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px', letterSpacing: '0.03em'}}>
              <Icon size={14} strokeWidth={1.5} />{tb.label}
            </button>
          );
        })}
      </div>

      {tab === 'progress' && (
        <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
          <div style={{padding: '10px 14px', background: 'var(--ims-accent-2)10', borderLeft: '3px solid var(--ims-accent-2)', fontSize: '11px', color: '#1a4d2a'}}>
            🔗 {t.inst_prog_auto_synced}
          </div>
          {installProjects.slice(0, visibleCount).map(p => {
            const ss = getStepStatus(p);
            const rec = ss._rec;
            const recCompleted = rec?.status === 'completed';
            return (
            <div key={p.id} style={{padding: '18px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '10px'}}>
                <div>
                  <div style={{fontSize: '14px', fontWeight: 600}}>{p.customer}</div>
                  <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{p.subModality} · <span className="mono">{p.sphNo}</span></div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'}}>
                  <span style={{padding: '3px 9px', borderRadius: '10px', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: recCompleted ? 'var(--ims-accent-2)' : 'var(--ims-gold)', color: '#fff'}}>{recCompleted ? (lang === 'id' ? 'Instalasi Selesai' : 'Installation Done') : (lang === 'id' ? 'Sedang Proses' : 'In Progress')}</span>
                </div>
              </div>

              {/* Work dates from install record */}
              <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '12px', padding: '10px 12px', background: 'var(--ims-bg)', fontSize: '11px'}}>
                <div>
                  <span style={{color: 'var(--ims-text-2)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '9px', fontWeight: 600}}>{t.inst_prog_start}: </span>
                  <span className="mono" style={{color: 'var(--ims-text)', fontWeight: 600}}>{rec?.installStart || '—'}</span>
                </div>
                <div>
                  <span style={{color: 'var(--ims-text-2)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '9px', fontWeight: 600}}>{t.inst_prog_end}: </span>
                  <span className="mono" style={{color: 'var(--ims-text)', fontWeight: 600}}>{rec?.installEnd || (recCompleted ? (lang === 'id' ? 'Selesai' : 'Done') : (lang === 'id' ? 'Sedang berjalan' : 'In progress'))}</span>
                </div>
                {rec?.leadTechnician && <div><span style={{color: 'var(--ims-text-2)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '9px', fontWeight: 600}}>{lang === 'id' ? 'Teknisi' : 'Technician'}: </span><span style={{color: 'var(--ims-text)'}}>{resolveEmpName(employees, rec.leadTechnician)}</span></div>}
              </div>

              {/* Step buttons - auto-synced where applicable */}
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '8px', marginBottom: '12px'}}>
                {getInstallStepsForProduct(`${p.modality || ''} ${p.product || ''} ${p.subModality || ''}`).map(step => {
                  const Icon = step.icon;
                  const done = ss[step.id];
                  const manual = step.manual === true;
                  const isSynced = step.syncSrc && (
                    (step.syncSrc === 'record' && rec) ||
                    (step.syncSrc === 'bast' && ss._bast) ||
                    (step.syncSrc === 'training' && ss._training) ||
                    (step.syncSrc === 'bapeten' && ss._bapeten)
                  );
                  return (
                    <button key={step.id} onClick={() => { if (manual) toggleInstallPipelineStep(p, step.id); }} disabled={!canEdit || !manual} title={manual ? '' : t.inst_prog_auto_synced} style={{padding: '11px', fontSize: '10.5px', fontFamily: 'inherit', background: done ? 'var(--ims-accent-2)' : 'transparent', color: done ? '#fff' : 'var(--ims-text-2)', border: `1px solid ${done ? 'var(--ims-accent-2)' : 'var(--ims-border)'}`, cursor: canEdit && manual ? 'pointer' : 'default', opacity: !manual && !done ? 0.78 : 1, fontWeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', textAlign: 'center', position: 'relative'}}>
                      <Icon size={16} strokeWidth={1.5} />{step.label}
                      {done && <span style={{fontSize: '8px', letterSpacing: '0.1em'}}>✓ {isSynced || !manual ? 'AUTO' : 'DONE'}</span>}
                    </button>
                  );
                })}
              </div>

              {/* Evidence links (photo/video documentation) */}
              <div style={{padding: '10px 12px', background: 'var(--ims-bg)', border: '1px solid var(--ims-border)'}}>
                <div style={{fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '8px'}}>{t.inst_prog_evidence}</div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px'}}>
                  {[
                    { field: 'evidenceInstall', label: lang === 'id' ? 'Foto/Video Instalasi' : 'Installation Photo/Video' },
                    { field: 'evidenceTest', label: lang === 'id' ? 'Foto/Video Uji Fungsi' : 'Function Test Photo/Video' },
                  ].map(ev => (
                    <div key={ev.field}>
                      {canEdit ? (
                        <div>
                          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginBottom: '3px'}}>{ev.label}</div>
                          <input value={p[ev.field] || ''} onChange={e => updateEvidence(p.id, ev.field, e.target.value)} placeholder="https://drive.google.com/..." style={{fontSize: '11px', padding: '5px 8px'}} />
                        </div>
                      ) : (
                        <div>
                          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginBottom: '3px'}}>{ev.label}</div>
                          {p[ev.field] ? <LinkAttachment url={p[ev.field]} lang={lang} /> : <span style={{fontSize: '10px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>—</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            );
          })}
          {installProjects.length > visibleCount && (
            <button onClick={() => setVisibleCount(v => v + CARD_PAGE)} style={{width: '100%', padding: '12px', background: 'var(--ims-bg-card)', border: '1px dashed var(--ims-gold)', color: '#8a6a2a', fontFamily: 'inherit', fontSize: '12px', fontWeight: 600, cursor: 'pointer', borderRadius: '4px'}}>
              {lang === 'id' ? `Tampilkan ${Math.min(CARD_PAGE, installProjects.length - visibleCount)} lainnya (${visibleCount} dari ${installProjects.length})` : `Show ${Math.min(CARD_PAGE, installProjects.length - visibleCount)} more (${visibleCount} of ${installProjects.length})`}
            </button>
          )}
          {installProjects.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: 'var(--ims-text-2)', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>{t.no_data}</div>}
        </div>
      )}

      {tab === 'records' && <InstallRecordsList records={installRecordsFiltered} setRecords={setInstallRecords} t={t} lang={lang} canEdit={canEdit} employees={employees} units={deliveredUnits} products={products} fmt={fmt} documentTemplates={documentTemplates} onOpenEditor={openInstallEditor} />}
      {tab === 'bast' && <BASTList products={products} records={bastRecordsForView} setRecords={setBastRecords} t={t} lang={lang} canEdit={canEdit} units={installRecordUnits} installRecords={installRecords} employees={employees} documentTemplates={documentTemplates} fmt={fmt} onOpenEditor={openInstallEditor} />}
      {tab === 'training' && <TrainingCertList records={trainingRecordsForView} setRecords={setTrainingRecords} t={t} lang={lang} canEdit={canEdit} employees={employees} units={installRecordUnits} installRecords={installRecords} products={products} documentTemplates={documentTemplates} fmt={fmt} onOpenEditor={openInstallEditor} />}

      {installEditor && (
        <DocumentEditorModal
          open={!!installEditor}
          onClose={() => setInstallEditor(null)}
          title={installEditor.title}
          initialHtml={installEditor.html}
          docType={installEditor.docType}
          record={installEditor.record}
          saveLabel={lang === 'id' ? 'Simpan Dokumen' : 'Save Document'}
          lang={lang}
          onSave={(html, status) => {
            onSaveDocument && onSaveDocument({ docType: installEditor.docType, html, status, record: installEditor.record, requesterId: installEditor.record.salesOwner, notifyRequester: false });
            setInstallEditor(null);
          }}
        />
      )}
    </div>
  );
}

// ============== Install Records List ==============
function InstallRecordsList({ records, setRecords, t, lang, canEdit, employees = {}, units = [], products = [], fmt = (n) => n, documentTemplates = DEFAULT_DOCUMENT_TEMPLATES, onOpenEditor }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [sortBy, setSortBy] = useState('date_desc');
  const statusColors = { planning: '#94a3b8', progress: 'var(--ims-gold)', completed: 'var(--ims-accent-2)', delayed: '#c03030' };

  const handleSave = (rec) => {
    setRecords(prev => {
      const exists = prev.find(r => r.id === rec.id);
      if (rec.status === 'signed' && rec.signedDate && (!exists || exists.signedDate !== rec.signedDate || exists.status !== 'signed')) {
        const due = new Date(rec.signedDate);
        due.setDate(due.getDate() + 30);
        notify({ role: 'finance' }, {
          type: 'billing_due',
          message: `BAST ${rec.customer} sudah signed. Reminder penagihan pertama jatuh tempo ${due.toISOString().split('T')[0]} dan H-7 perlu follow-up.`,
          link: { view: 'finance' },
        });
      }
      return exists ? prev.map(r => r.id === rec.id ? rec : r) : [...prev, rec];
    });
    setModalOpen(false); setEditingRecord(null);
  };
  const [deleteId, setDeleteId] = useState(null);
  const handleDelete = (id) => {
    if (!canEdit) return;
    setDeleteId(id);
  };
  const confirmDelete = () => {
    setRecords(prev => prev.filter(r => r.id !== deleteId));
    setDeleteId(null);
  };

  const sortedRecords = useMemo(() => {
    const arr = [...records];
    if (sortBy === 'date_desc') return arr.sort((a, b) => (b.installStart || '').localeCompare(a.installStart || ''));
    if (sortBy === 'date_asc') return arr.sort((a, b) => (a.installStart || '').localeCompare(b.installStart || ''));
    if (sortBy === 'value_desc') return arr.sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0));
    if (sortBy === 'status') return arr.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    return arr;
  }, [records, sortBy]);

  return (
    <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
      <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
        <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.inst_tab_records}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <SortToggle value={sortBy} onChange={setSortBy} lang={lang} options={[{value: 'date_desc', label: lang === 'id' ? 'Terbaru' : 'Newest'}, {value: 'date_asc', label: lang === 'id' ? 'Terlama' : 'Oldest'}, {value: 'status', label: lang === 'id' ? 'Status' : 'Status'}]} />
          {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
        </div>
      </div>
      {sortedRecords.map(r => {
        const statusColor = statusColors[r.status];
        return (
          <div key={r.id} style={{padding: '16px 18px', borderTop: '1px solid var(--ims-border)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '10px'}}>
              <div style={{flex: '1 1 320px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap'}}>
                  <span className="mono" style={{fontSize: '12px', fontWeight: 700, color: 'var(--ims-text)'}}>{r.recordNo}</span>
                  <span style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>· {r.customer}</span>
                </div>
                <div style={{fontSize: '12px', fontWeight: 500, marginTop: '4px'}}>{r.modality} · {r.subModality}</div>
                <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px'}}>👷 {resolveEmpName(employees, r.leadTechnician)} (Team: {r.teamSize})</div>
              </div>
              <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px'}}>
                <span style={{padding: '4px 10px', fontSize: '10px', background: statusColor + '25', color: statusColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`inst_status_${r.status}`]}</span>
                <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                  {canEdit && onOpenEditor && <button onClick={() => onOpenEditor('batraining', r, 'BA Training')} className="btn-primary" style={{fontSize: '10px', padding: '4px 8px'}} title="Buat BA Training di editor"><Edit2 size={11} />Buat</button>}
                  <button onClick={() => printBATrainingPdf(r, fmt, documentTemplates, employees)} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}} title="PDF BA Training"><FileText size={11} />PDF</button>
                  <button onClick={() => downloadBATrainingDoc(r, fmt, documentTemplates, employees)} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}} title="Word BA Training"><Download size={11} />Word</button>
                  {canEdit && <button onClick={() => { setEditingRecord(r); setModalOpen(true); }} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}}><Edit2 size={11} />Edit</button>}
                  {canEdit && <button onClick={() => handleDelete(r.id)} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px', color: '#c03030'}}><Trash2 size={11} /></button>}
                </div>
              </div>
            </div>
            <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '10px', color: 'var(--ims-text-2)', marginBottom: '8px'}}>
              <span><strong>Mulai:</strong> <span className="mono">{r.installStart || '—'}</span></span>
              <span><strong>Selesai:</strong> <span className="mono">{r.installEnd || '—'}</span></span>
              {r.duration && <span><strong>Durasi:</strong> {r.duration} hari</span>}
            </div>
            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '10px', marginBottom: '8px'}}>
              <span style={{padding: '2px 7px', background: r.roomReady ? 'var(--ims-accent-2)25' : '#c0303025', color: r.roomReady ? 'var(--ims-accent-2)' : '#c03030', fontWeight: 600}}>{r.roomReady ? '✓' : '✗'} Ruangan</span>
              <span style={{padding: '2px 7px', background: r.electricalReady ? 'var(--ims-accent-2)25' : '#c0303025', color: r.electricalReady ? 'var(--ims-accent-2)' : '#c03030', fontWeight: 600}}>{r.electricalReady ? '✓' : '✗'} Listrik</span>
              <span style={{padding: '2px 7px', background: r.calibrationDone ? 'var(--ims-accent-2)25' : '#c0303025', color: r.calibrationDone ? 'var(--ims-accent-2)' : '#c03030', fontWeight: 600}}>{r.calibrationDone ? '✓' : '✗'} Kalibrasi</span>
            </div>
            {r.notes && <div style={{padding: '8px 10px', background: 'var(--ims-bg-card-2)', fontSize: '11px', fontStyle: 'italic', color: 'var(--ims-text)'}}>📝 {r.notes}</div>}
          </div>
        );
      })}
      {records.length === 0 && <div className="empty-state">{t.no_data}</div>}
      {modalOpen && <InstallRecordModal record={editingRecord} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} employees={employees} units={units} products={products} />}
      <ConfirmDialog open={!!deleteId} title={lang === 'id' ? 'Hapus Riwayat Instalasi?' : 'Delete Installation Record?'} message={lang === 'id' ? 'Yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to delete this record? This action cannot be undone.'} onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} danger lang={lang} />
    </div>
  );
}

// ============== BAST List ==============
function BASTList({ records, products = [], setRecords, t, lang, canEdit, units = [], installRecords = [], employees = {}, documentTemplates = DEFAULT_DOCUMENT_TEMPLATES, fmt = (n) => n, onOpenEditor }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [sortBy, setSortBy] = useState('date_desc');
  const statusColors = { draft: '#94a3b8', pending: 'var(--ims-gold)', signed: 'var(--ims-accent-2)' };

  const handleSave = (rec) => {
    const cleanRec = {
      ...rec,
      id: rec._placeholder ? 'bast_' + Date.now() : rec.id,
      bastNo: rec._placeholder || !rec.bastNo || rec.bastNo === 'BAST belum dibuat' || rec.bastNo === 'BAST not created'
        ? 'BAST-HNTI-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-3)
        : rec.bastNo,
    };
    delete cleanRec._placeholder;
    setRecords(prev => {
      const exists = prev.find(r => r.id === cleanRec.id);
      return exists ? prev.map(r => r.id === cleanRec.id ? cleanRec : r) : [...prev, cleanRec];
    });
    setModalOpen(false); setEditingRecord(null);
  };
  const [deleteId, setDeleteId] = useState(null);
  const handleDelete = (id) => {
    if (!canEdit) return;
    setDeleteId(id);
  };
  const confirmDelete = () => {
    setRecords(prev => prev.filter(r => r.id !== deleteId));
    setDeleteId(null);
  };

  const sortedRecords = useMemo(() => {
    const arr = [...records];
    if (sortBy === 'date_desc') return arr.sort((a, b) => (b.signedDate || '').localeCompare(a.signedDate || ''));
    if (sortBy === 'date_asc') return arr.sort((a, b) => (a.signedDate || '').localeCompare(b.signedDate || ''));
    if (sortBy === 'value_desc') return arr.sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0));
    if (sortBy === 'status') return arr.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    return arr;
  }, [records, sortBy]);

  return (
    <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
      <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
        <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.inst_tab_bast}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <SortToggle value={sortBy} onChange={setSortBy} lang={lang} options={[{value: 'date_desc', label: lang === 'id' ? 'Terbaru' : 'Newest'}, {value: 'date_asc', label: lang === 'id' ? 'Terlama' : 'Oldest'}, {value: 'status', label: lang === 'id' ? 'Status' : 'Status'}]} />
          {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
        </div>
      </div>
      {sortedRecords.map(r => {
        const statusColor = statusColors[r.status];
        const syncedTech = installLeadTechnicianName(installRecords, employees, r.customer, r.modality, r.subModality);
        const technicianNames = activeEmployeeNamesByRole(employees, 'technician');
        const displayHntiRep = r.hntiRep && technicianNames.includes(r.hntiRep) ? r.hntiRep : (syncedTech || r.hntiRep);
        return (
          <div key={r.id} style={{padding: '16px 18px', borderTop: '1px solid var(--ims-border)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '10px'}}>
              <div style={{flex: '1 1 320px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap'}}>
                  <span className="mono" style={{fontSize: '12px', fontWeight: 700, color: 'var(--ims-text)'}}>{r.bastNo}</span>
                </div>
                <div style={{fontSize: '12px', fontWeight: 600, marginTop: '4px'}}>{r.customer}</div>
                <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{r.modality} · {r.subModality}</div>
                {r.signedDate && <div style={{fontSize: '10px', color: 'var(--ims-accent-2)', marginTop: '4px', fontWeight: 600}} className="mono">✓ Tertanda: {r.signedDate}</div>}
              </div>
              <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px'}}>
                <span style={{padding: '4px 10px', fontSize: '10px', background: statusColor + '25', color: statusColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`bast_status_${r.status}`]}</span>
                {r.docUrl && <LinkAttachment url={r.docUrl} lang={lang} />}
                <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                  {canEdit && onOpenEditor && <button onClick={() => onOpenEditor('bast_barang', r, 'BAST Barang')} className="btn-primary" style={{fontSize: '10px', padding: '4px 8px'}} title="Buat BAST di editor (bisa diedit & disimpan)"><Edit2 size={11} />Buat BAST</button>}
                  {canEdit && onOpenEditor && <button onClick={() => onOpenEditor('bai', r, 'BA Instalasi')} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}} title="Buat BA Instalasi di editor"><Edit2 size={11} />Buat BAI</button>}
                  {canEdit && onOpenEditor && <button onClick={() => onOpenEditor('bauji_fungsi', r, 'BA Uji Fungsi')} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}} title="Buat BA Uji Fungsi di editor"><Edit2 size={11} />Buat Uji</button>}
                  <button onClick={() => printBASTBarangPdf(r, fmt, documentTemplates, employees)} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}} title="PDF BAST Barang"><FileText size={11} />PDF</button>
                  <button onClick={() => downloadBASTBarangDoc(r, fmt, documentTemplates, employees)} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}} title="Word BAST Barang"><Download size={11} />Word</button>
                  <button onClick={() => printBAIPdf(r, fmt, documentTemplates, employees)} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}} title="PDF BA Instalasi"><FileCheck size={11} />BAI</button>
                  <button onClick={() => printBAUjiFungsiPdf(r, fmt, documentTemplates, employees)} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}} title="PDF BA Uji Fungsi"><FileCheck size={11} />Uji</button>
                  {canEdit && <button onClick={() => { setEditingRecord(r); setModalOpen(true); }} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}}><Edit2 size={11} />Edit</button>}
                  {canEdit && !r._placeholder && <button onClick={() => handleDelete(r.id)} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px', color: '#c03030'}}><Trash2 size={11} /></button>}
                </div>
              </div>
            </div>
            <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '10px', color: 'var(--ims-text-2)', marginBottom: '8px'}}>
              <span><strong>HNTI:</strong> {displayHntiRep || '—'}</span>
              <span><strong>Customer:</strong> {r.customerRep || '—'}</span>
              {r.witness && <span><strong>Saksi:</strong> {r.witness}</span>}
            </div>
            {r.notes && <div style={{padding: '8px 10px', background: 'var(--ims-bg-card-2)', fontSize: '11px', fontStyle: 'italic', color: 'var(--ims-text)'}}>📝 {r.notes}</div>}
          </div>
        );
      })}
      {records.length === 0 && <div className="empty-state">{t.no_data}</div>}
      {modalOpen && <BASTModal record={editingRecord} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} units={units} installRecords={installRecords} employees={employees} products={products} />}
      <ConfirmDialog open={!!deleteId} title={lang === 'id' ? 'Hapus BAST?' : 'Delete BAST?'} message={lang === 'id' ? 'Yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to delete this record? This action cannot be undone.'} onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} danger lang={lang} />
    </div>
  );
}

// ============== Training Cert List ==============
function TrainingCertList({ records, setRecords, t, lang, canEdit, employees = {}, units = [], installRecords = [], products = [], documentTemplates = DEFAULT_DOCUMENT_TEMPLATES, fmt = (n) => n, onOpenEditor }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [sortBy, setSortBy] = useState('date_desc');
  const statusColors = { pending: 'var(--ims-gold)', completed: 'var(--ims-accent-2)' };

  const handleSave = (rec) => {
    const cleanRec = {
      ...rec,
      id: rec._placeholder ? 'train_' + Date.now() : rec.id,
      certNo: rec._placeholder || !rec.certNo || rec.certNo === 'Training belum dibuat' || rec.certNo === 'Training not created'
        ? 'CERT-HNTI-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-3)
        : rec.certNo,
    };
    delete cleanRec._placeholder;
    setRecords(prev => {
      const exists = prev.find(r => r.id === cleanRec.id);
      const prevDate = exists?.sessionDate;
      // Catatan #5 Phase 2a: notif Product Specialist saat training dijadwalkan/diubah
      if (cleanRec.sessionDate && cleanRec.sessionDate !== prevDate) {
        try {
          notify({ role: 'product_specialist' }, {
            type: 'training_scheduled',
            message: (typeof t === 'object' && t.lang === 'en')
              ? `Training ${cleanRec.modality} at ${cleanRec.customer} scheduled ${cleanRec.sessionDate}. Instructor: ${cleanRec.instructor || '-'}.`
              : `Training ${cleanRec.modality} di ${cleanRec.customer} dijadwalkan ${cleanRec.sessionDate}. Instruktur: ${cleanRec.instructor || '-'}.`,
            link: { view: 'installation' }
          });
        } catch {}
      }
      return exists ? prev.map(r => r.id === cleanRec.id ? cleanRec : r) : [...prev, cleanRec];
    });
    setModalOpen(false); setEditingRecord(null);
  };
  const [deleteId, setDeleteId] = useState(null);
  const handleDelete = (id) => {
    if (!canEdit) return;
    setDeleteId(id);
  };
  const confirmDelete = () => {
    setRecords(prev => prev.filter(r => r.id !== deleteId));
    setDeleteId(null);
  };

  const sortedRecords = useMemo(() => {
    const arr = [...records];
    if (sortBy === 'date_desc') return arr.sort((a, b) => (b.sessionDate || '').localeCompare(a.sessionDate || ''));
    if (sortBy === 'date_asc') return arr.sort((a, b) => (a.sessionDate || '').localeCompare(b.sessionDate || ''));
    if (sortBy === 'value_desc') return arr.sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0));
    if (sortBy === 'status') return arr.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    return arr;
  }, [records, sortBy]);

  return (
    <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
      <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
        <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.inst_tab_training}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <SortToggle value={sortBy} onChange={setSortBy} lang={lang} options={[{value: 'date_desc', label: lang === 'id' ? 'Terbaru' : 'Newest'}, {value: 'date_asc', label: lang === 'id' ? 'Terlama' : 'Oldest'}, {value: 'status', label: lang === 'id' ? 'Status' : 'Status'}]} />
          {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
        </div>
      </div>
      {sortedRecords.map(r => {
        const statusColor = statusColors[r.status];
        const syncedTech = installLeadTechnicianName(installRecords, employees, r.customer, r.modality, r.subModality);
        const technicianNames = activeEmployeeNamesByRole(employees, 'technician');
        const rawInstructorParts = String(r.instructor || '').split(',').map(x => x.trim()).filter(Boolean);
        const displayInstructor = syncedTech && !rawInstructorParts.includes(syncedTech)
          ? [syncedTech, ...rawInstructorParts.filter(name => !technicianNames.includes(name))].join(', ')
          : (r.instructor || syncedTech || '');
        return (
          <div key={r.id} style={{padding: '16px 18px', borderTop: '1px solid var(--ims-border)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '10px'}}>
              <div style={{flex: '1 1 320px'}}>
                {r.certNo && <div className="mono" style={{fontSize: '12px', fontWeight: 700, color: 'var(--ims-text)', marginBottom: '4px'}}>{r.certNo}</div>}
                <div style={{fontSize: '12px', fontWeight: 600}}>{r.customer}</div>
                <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{r.modality} · {r.subModality}</div>
                {displayInstructor && <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px'}}>🎓 {resolveNamesInText(employees, displayInstructor)}</div>}
              </div>
              <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px'}}>
                <span style={{padding: '4px 10px', fontSize: '10px', background: statusColor + '25', color: statusColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{r.status === 'completed' ? t.train_completed : t.train_pending}</span>
                {r.certUrl && <LinkAttachment url={r.certUrl} lang={lang} />}
                {canEdit && (
                  <div style={{display: 'flex', gap: '4px'}}>
                    <button onClick={() => { setEditingRecord(r); setModalOpen(true); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit'}}><Edit2 size={11} /></button>
                    {!r._placeholder && <button onClick={() => handleDelete(r.id)} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>}
                  </div>
                )}
              </div>
            </div>
            <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '10px', color: 'var(--ims-text-2)', marginBottom: '8px'}}>
              {r.sessionDate && <span><strong>Tgl:</strong> <span className="mono">{r.sessionDate}</span></span>}
              {r.participants > 0 && <span><strong>Peserta:</strong> {r.participants}</span>}
              {r.duration > 0 && <span><strong>Durasi:</strong> {r.duration} jam</span>}
            </div>
            {r.topics && <div style={{padding: '8px 10px', background: 'var(--ims-bg-card-2)', fontSize: '11px', color: 'var(--ims-text)', marginBottom: '8px'}}><strong>Topik:</strong> {r.topics}</div>}
            {r.notes && <div style={{padding: '8px 10px', background: 'var(--ims-bg-card-2)', fontSize: '11px', fontStyle: 'italic', color: 'var(--ims-text)'}}>📝 {r.notes}</div>}
          </div>
        );
      })}
      {records.length === 0 && <div className="empty-state">{t.no_data}</div>}
      {modalOpen && <TrainingCertModal record={editingRecord} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} units={units} installRecords={installRecords} employees={employees} products={products} />}
      <ConfirmDialog open={!!deleteId} title={lang === 'id' ? 'Hapus Sertifikat?' : 'Delete Certificate?'} message={lang === 'id' ? 'Yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to delete this record? This action cannot be undone.'} onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} danger lang={lang} />
    </div>
  );
}

// ============== Install Record Modal ==============
// ── Shared: pick a delivered/installed unit (RS) from SPH & auto-fill product fields ──
// Used by Installation Record / BAST / Training Certificate / BAPETEN Utilization Permit forms
// so the customer (RS) name + installed product (modality/sub-modality) are PULLED from SPH
// data rather than re-typed — eliminating RS↔product mismatch (review notes #1 & #2).
function UnitPickerField({ units = [], customer, modality, subModality, onPick, lang }) {
  const keyOf = (u) => `${u.customer}|${u.modality || ''}|${u.subModality || ''}`;
  const curKey = (customer || modality || subModality) ? `${customer || ''}|${modality || ''}|${subModality || ''}` : '';
  const hasMatch = units.some(u => keyOf(u) === curKey);
  return (
    <Field label={lang === 'id' ? 'Tarik dari SPH (produk terkirim)' : 'Pull from SPH (delivered product)'} full>
      <select value={curKey} onChange={e => {
        if (!e.target.value) { onPick({ customer: '', modality: '', subModality: '' }); return; }
        const u = units.find(x => keyOf(x) === e.target.value);
        if (u) onPick(u);
      }}>
        <option value="">{lang === 'id' ? '— Pilih RS / produk terkirim —' : '— Select delivered RS / product —'}</option>
        {!hasMatch && customer && <option value={curKey}>{customer}{modality ? ` — ${modality}` : ''}{subModality ? ` ${subModality}` : ''} {lang === 'id' ? '(input manual)' : '(manual entry)'}</option>}
        {units.map(u => <option key={u.id || keyOf(u)} value={keyOf(u)}>{u.customer} — {u.modality}{u.subModality ? ` ${u.subModality}` : ''}{u.sphNo ? ` · ${u.sphNo}` : ''}</option>)}
      </select>
    </Field>
  );
}

function findInstallRecordForUnit(installRecords = [], customer, modality, subModality) {
  if (!customer || !Array.isArray(installRecords)) return null;
  const candidates = installRecords.filter(ir => ir.customer === customer);
  let match = candidates.find(ir => ir.modality === modality && (ir.subModality || '') === (subModality || ''));
  if (!match) match = candidates.find(ir => ir.modality === modality);
  if (!match && candidates.length) match = candidates[0];
  return match || null;
}

function installLeadTechnicianName(installRecords = [], employees = {}, customer, modality, subModality) {
  const rec = findInstallRecordForUnit(installRecords, customer, modality, subModality);
  return rec ? resolveEmpName(employees, rec.leadTechnician || '') : '';
}

function activeEmployeeNamesByRole(employees = {}, role) {
  return Object.values(employees)
    .filter(emp => emp.role === role && emp.active !== false)
    .map(emp => emp.name)
    .sort((a, b) => a.localeCompare(b));
}

// ============== Installation Record Modal ==============
function InstallRecordModal({ record, onSave, onClose, t, lang, employees = {}, units = [], products = [] }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState(record || {
    id: 'inst_' + Date.now(),
    recordNo: 'BA-INST-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-3),
    customer: '', modality: 'CT Scan', subModality: '',
    installStart: today, installEnd: '', duration: null,
    leadTechnician: (Object.keys(employees).find(u => employees[u].role === 'technician' && employees[u].active) || ''), teamSize: 2,
    roomReady: false, electricalReady: false, calibrationDone: false,
    status: 'planning', notes: '',
  });
  const isEdit = !!record;
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const autoDuration = useMemo(() => {
    if (!form.installStart || !form.installEnd) return null;
    const start = new Date(form.installStart);
    const end = new Date(form.installEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return null;
    return Math.max(1, Math.round((end - start) / 86400000) + 1);
  }, [form.installStart, form.installEnd]);
  useEffect(() => {
    if (autoDuration == null) return;
    setForm(prev => prev.duration === autoDuration ? prev : { ...prev, duration: autoDuration });
  }, [autoDuration]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.inst_modal_edit_record : t.inst_modal_add_record}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
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
          <UnitPickerField units={units} customer={form.customer} modality={form.modality} subModality={form.subModality} lang={lang} onPick={u => setForm(prev => ({ ...prev, customer: u.customer, modality: u.modality || prev.modality, subModality: u.subModality || '' }))} />
          <Field label={t.customer} full><input value={form.customer} onChange={e => update('customer', e.target.value)} placeholder="RS / Klinik" /></Field>
          <Field label={t.modality}>
            <select value={form.modality} onChange={e => { update('modality', e.target.value); update('subModality', ''); }}>
              {[...new Set([...Object.keys(MODALITY_COLORS), ...(products||[]).map(p=>p.modality).filter(Boolean), form.modality].filter(Boolean))].sort().map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label={lang === 'id' ? 'Tipe' : 'Type'}>
            <select value={form.subModality} onChange={e => update('subModality', e.target.value)}>
              <option value="">{lang === 'id' ? '— Pilih Tipe —' : '— Select Type —'}</option>
              {(products||[]).filter(p => p.modality === form.modality && p.active !== false).map(p => <option key={p.id} value={p.type}>{p.type} ({p.brand})</option>)}
              {form.subModality && !(products||[]).some(p => p.modality === form.modality && p.type === form.subModality) && <option value={form.subModality}>{form.subModality}</option>}
            </select>
          </Field>
          <Field label={t.inst_install_start}><input type="date" value={form.installStart} onChange={e => update('installStart', e.target.value)} /></Field>
          <Field label={t.inst_install_end}><input type="date" value={form.installEnd || ''} onChange={e => update('installEnd', e.target.value)} /></Field>
          <Field label={t.inst_duration}><input type="number" value={form.duration || ''} readOnly={autoDuration != null} onChange={e => update('duration', parseInt(e.target.value) || null)} style={autoDuration != null ? {background: 'var(--ims-bg-card-2)', cursor: 'default'} : undefined} /></Field>
          <Field label={t.inst_lead_technician}><select value={employees[form.leadTechnician] ? form.leadTechnician : (Object.entries(employees).find(([u, inf]) => inf.role === 'technician' && inf.active && inf.name === resolveEmpName(employees, form.leadTechnician)) || [''])[0]} onChange={e => update('leadTechnician', e.target.value)} style={{width:'100%'}}><option value="">{lang === 'id' ? '— Pilih Teknisi —' : '— Select Technician —'}</option>{Object.entries(employees).filter(([u, inf]) => inf.role === 'technician' && inf.active).map(([u, inf]) => <option key={u} value={u}>{inf.name}</option>)}</select></Field>
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
          <button className="btn-primary" onClick={() => onSave({ ...form, duration: autoDuration ?? form.duration })}>{t.crud_save}</button>
        </div>
      </div>
    </div>
  );
}

// ============== BAST Modal ==============
function BASTModal({ record, onSave, onClose, t, lang, units = [], installRecords = [], employees = {}, products = [] }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState(record || {
    id: 'bast_' + Date.now(),
    bastNo: 'BAST-HNTI-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-3),
    customer: '', modality: 'CT Scan', subModality: '',
    signedDate: '', hntiRep: '',
    customerRep: '', witness: '',
    status: 'draft', docUrl: '', notes: '',
  });
  const isEdit = !!record;
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const syncedTech = installLeadTechnicianName(installRecords, employees, form.customer, form.modality, form.subModality);
  const technicianNames = activeEmployeeNamesByRole(employees, 'technician');
  const selectedHntiRep = form.hntiRep && technicianNames.includes(form.hntiRep) ? form.hntiRep : (syncedTech || form.hntiRep || '');
  const hntiRepOptions = [...new Set([syncedTech, ...technicianNames, form.hntiRep].filter(Boolean))];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.inst_modal_edit_bast : t.inst_modal_add_bast}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
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
          <UnitPickerField units={units} customer={form.customer} modality={form.modality} subModality={form.subModality} lang={lang} onPick={u => {
            const leadTech = installLeadTechnicianName(installRecords, employees, u.customer, u.modality, u.subModality);
            setForm(prev => ({ ...prev, customer: u.customer, modality: u.modality || prev.modality, subModality: u.subModality || '', hntiRep: leadTech || prev.hntiRep }));
          }} />
          <Field label={t.customer} full><input value={form.customer} onChange={e => update('customer', e.target.value)} /></Field>
          <Field label={t.modality}>
            <select value={form.modality} onChange={e => { update('modality', e.target.value); update('subModality', ''); }}>
              {[...new Set([...Object.keys(MODALITY_COLORS), ...(products||[]).map(p=>p.modality).filter(Boolean), form.modality].filter(Boolean))].sort().map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label={lang === 'id' ? 'Tipe' : 'Type'}>
            <select value={form.subModality} onChange={e => update('subModality', e.target.value)}>
              <option value="">{lang === 'id' ? '— Pilih Tipe —' : '— Select Type —'}</option>
              {(products||[]).filter(p => p.modality === form.modality && p.active !== false).map(p => <option key={p.id} value={p.type}>{p.type} ({p.brand})</option>)}
              {form.subModality && !(products||[]).some(p => p.modality === form.modality && p.type === form.subModality) && <option value={form.subModality}>{form.subModality}</option>}
            </select>
          </Field>
          <Field label={t.bast_signed_date}><input type="date" value={form.signedDate || ''} onChange={e => update('signedDate', e.target.value)} /></Field>
          <Field label={t.bast_hnti_rep}>
            <select value={selectedHntiRep} onChange={e => update('hntiRep', e.target.value)}>
              <option value="">{lang === 'id' ? '— Pilih teknisi —' : '— Select technician —'}</option>
              {hntiRepOptions.map(name => <option key={name} value={name}>{name}{name === syncedTech ? (lang === 'id' ? ' (teknisi instalasi)' : ' (install technician)') : ''}</option>)}
            </select>
          </Field>
          <Field label={t.bast_customer_rep}><input value={form.customerRep} onChange={e => update('customerRep', e.target.value)} placeholder="dr. Nama, Sp.Rad" /></Field>
          <Field label={t.bast_witness} full><input value={form.witness} onChange={e => update('witness', e.target.value)} placeholder="Notaris / Saksi" /></Field>
          <Field label={t.bast_doc_url} full><input type="url" value={form.docUrl} onChange={e => update('docUrl', e.target.value)} placeholder="https://drive.google.com/..." /></Field>
          <Field label={t.bast_notes} full><textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} /></Field>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
          <button className="btn-primary" onClick={() => onSave({ ...form, hntiRep: selectedHntiRep || syncedTech })}>{t.crud_save}</button>
        </div>
      </div>
    </div>
  );
}

// ============== Training Cert Modal ==============
function TrainingCertModal({ record, onSave, onClose, t, lang, units = [], installRecords = [], employees = {}, products = [] }) {
  const [form, setForm] = useState(record || {
    id: 'train_' + Date.now(),
    certNo: 'CERT-HNTI-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-3),
    customer: '', modality: 'CT Scan', subModality: '',
    sessionDate: '', participants: 0, instructor: '',
    productInstructor: '', otherInstructor: '',
    duration: 0, topics: '', status: 'pending', certUrl: '', notes: '',
  });
  const isEdit = !!record;
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const syncedTech = installLeadTechnicianName(installRecords, employees, form.customer, form.modality, form.subModality);
  const technicianNames = activeEmployeeNamesByRole(employees, 'technician');
  const productSpecialists = activeEmployeeNamesByRole(employees, 'product_specialist');
  const technicianInstructor = form.instructor && technicianNames.includes(form.instructor) ? form.instructor : (syncedTech || form.instructor || '');
  const selectedProductInstructor = form.productInstructor === '__other__' ? form.otherInstructor : form.productInstructor;
  const instructorValue = [technicianInstructor || syncedTech, selectedProductInstructor].filter(Boolean).join(', ');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.inst_modal_edit_training : t.inst_modal_add_training}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <Field label={t.train_cert_no}><input value={form.certNo} onChange={e => update('certNo', e.target.value)} /></Field>
          <Field label="Status">
            <select value={form.status} onChange={e => update('status', e.target.value)}>
              <option value="pending">{t.train_pending}</option>
              <option value="completed">{t.train_completed}</option>
            </select>
          </Field>
          <UnitPickerField units={units} customer={form.customer} modality={form.modality} subModality={form.subModality} lang={lang} onPick={u => {
            const leadTech = installLeadTechnicianName(installRecords, employees, u.customer, u.modality, u.subModality);
            setForm(prev => ({ ...prev, customer: u.customer, modality: u.modality || prev.modality, subModality: u.subModality || '', instructor: leadTech || prev.instructor }));
          }} />
          <Field label={t.customer} full><input value={form.customer} onChange={e => update('customer', e.target.value)} /></Field>
          <Field label={t.modality}>
            <select value={form.modality} onChange={e => { update('modality', e.target.value); update('subModality', ''); }}>
              {[...new Set([...Object.keys(MODALITY_COLORS), ...(products||[]).map(p=>p.modality).filter(Boolean), form.modality].filter(Boolean))].sort().map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label={lang === 'id' ? 'Tipe' : 'Type'}>
            <select value={form.subModality} onChange={e => update('subModality', e.target.value)}>
              <option value="">{lang === 'id' ? '— Pilih Tipe —' : '— Select Type —'}</option>
              {(products||[]).filter(p => p.modality === form.modality && p.active !== false).map(p => <option key={p.id} value={p.type}>{p.type} ({p.brand})</option>)}
              {form.subModality && !(products||[]).some(p => p.modality === form.modality && p.type === form.subModality) && <option value={form.subModality}>{form.subModality}</option>}
            </select>
          </Field>
          <Field label={t.train_session_date}><input type="date" value={form.sessionDate || ''} onChange={e => update('sessionDate', e.target.value)} /></Field>
          <Field label={t.train_participants}><input type="number" min="0" value={form.participants} onChange={e => update('participants', parseInt(e.target.value) || 0)} /></Field>
          <Field label={t.train_duration}><input type="number" min="0" value={form.duration} onChange={e => update('duration', parseInt(e.target.value) || 0)} /></Field>
          <Field label={lang === 'id' ? 'Instruktur Teknisi Instalasi' : 'Installation Technician Instructor'}>
            <select value={technicianInstructor || syncedTech || ''} onChange={e => update('instructor', e.target.value)}>
              <option value="">{lang === 'id' ? '— Pilih dari riwayat instalasi —' : '— Select from installation history —'}</option>
              {[...new Set([syncedTech, ...technicianNames, form.instructor].filter(Boolean))].map(name => <option key={name} value={name}>{name}{name === syncedTech ? (lang === 'id' ? ' (default instalasi)' : ' (installation default)') : ''}</option>)}
            </select>
          </Field>
          <Field label={lang === 'id' ? 'Instruktur Product Specialist (Opsional)' : 'Product Specialist Instructor (Optional)'}>
            <select value={form.productInstructor || ''} onChange={e => update('productInstructor', e.target.value)}>
              <option value="">{lang === 'id' ? '— Tidak ada tambahan —' : '— No additional instructor —'}</option>
              {productSpecialists.map(name => <option key={name} value={name}>{name}</option>)}
              <option value="__other__">{lang === 'id' ? 'Lainnya' : 'Other'}</option>
            </select>
          </Field>
          {form.productInstructor === '__other__' && <Field label={lang === 'id' ? 'Nama Lainnya' : 'Other Name'} full><input value={form.otherInstructor || ''} onChange={e => update('otherInstructor', e.target.value)} placeholder={lang === 'id' ? 'Isi nama instruktur tambahan' : 'Enter additional instructor'} /></Field>}
          <Field label={t.train_instructor} full><input readOnly value={instructorValue} placeholder={lang === 'id' ? 'Otomatis: teknisi instalasi + Product Specialist opsional' : 'Auto: install technician + optional Product Specialist'} /></Field>
          <Field label={t.train_topics} full><textarea rows={2} value={form.topics} onChange={e => update('topics', e.target.value)} placeholder="Operasional, safety, troubleshooting..." /></Field>
          <Field label={t.train_cert_url} full><input type="url" value={form.certUrl} onChange={e => update('certUrl', e.target.value)} placeholder="https://drive.google.com/..." /></Field>
          <Field label={t.notes} full><textarea rows={2} value={form.notes} onChange={e => update('notes', e.target.value)} /></Field>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
          <button className="btn-primary" onClick={() => onSave({ ...form, instructor: instructorValue })}>{t.crud_save}</button>
        </div>
      </div>
    </div>
  );
}

function Valuation({ data, t, lang, fmt }) {
  // ============== Valuation Methodology (Catatan #2) ==============
  // Conservative, defensible valuation for a PRIVATE Indonesian medical-device DISTRIBUTOR.
  // Synced with all modules: uses the same `data` (SPH) as Dashboard/Finance/Pipeline.
  //
  // STEP 1 — Realized revenue, properly annualized.
  //   revenueYTD = sum of won deals (status 'won' = PO issued), Jan–May 2026 (5 months).
  //   Annualized = revenueYTD × (12/5). (Previously ×3, which overstated.)
  // STEP 2 — EBITDA estimate.
  //   Distributors run thin margins. Conservative EBITDA margin 10% (medical-device
  //   distribution typically 8–12%).
  // STEP 3 — Two market-based methods, distributor-appropriate multiples:
  //   (a) EV/Revenue 0.6× — distributors trade far below manufacturers. Capital IQ
  //       comparables (Seale & Assoc. Q2-2025): Medtronic 4.0×, Baxter 2.7×, ICU Medical
  //       1.9×, JMS 0.4×. Pure distributors + Indonesian SME illiquidity/country discount → ~0.6×.
  //   (b) EV/EBITDA 8× — healthcare services median EV/EBITDA ~11.5× in 2025 (FOCUS IB),
  //       down from 14.5× in 2024; apply SME + emerging-market discount → ~8×.
  //   Blended valuation = average of (a) and (b). This is the conservative base.
  // STEP 4 — Forward upside (shown separately, NOT in base): weighted pipeline × 0.6× EV/Rev.
  const activeData = useMemo(() => data.filter(s => s.status === 'active'), [data]);
  const wonData = useMemo(() => data.filter(s => s.status === 'won'), [data]);
  const weightedPipeline = useMemo(() => activeData.reduce((s, p) => s + (Number(p.totalValue) || 0) * (Number(p.probability) || 0) / 100, 0), [activeData]);
  const revenueYTD = useMemo(() => wonData.reduce((s, p) => s + (Number(p.totalValue) || 0), 0), [wonData]);

  // Methodology constants (sourced — see panel below)
  const MONTHS_ELAPSED = 5; // Jan–May 2026
  const EBITDA_MARGIN = 0.10; // 10% conservative for distribution
  const EV_REVENUE_MULT = 0.6; // distributor + SME discount
  const EV_EBITDA_MULT = 8; // healthcare SME, post emerging-market discount

  const annualizedRevenue = revenueYTD * (12 / MONTHS_ELAPSED);
  const estimatedEBITDA = annualizedRevenue * EBITDA_MARGIN;
  const valByRevenue = annualizedRevenue * EV_REVENUE_MULT;
  const valByEBITDA = estimatedEBITDA * EV_EBITDA_MULT;
  const blendedValuation = (valByRevenue + valByEBITDA) / 2;
  // Forward upside from weighted pipeline (separate, optional)
  const pipelineUpside = weightedPipeline * EV_REVENUE_MULT;
  const currentValuation = blendedValuation;

  const ipoScore = Math.min(100, Math.round(
    (activeData.length >= 10 ? 25 : activeData.length * 2.5) +
    (revenueYTD > 0 ? 20 : 0) +
    (Math.min(weightedPipeline / 50e9, 1) * 25) +
    (wonData.length >= 1 ? 15 : 0) + 15
  ));

  const monthlyProjection = useMemo(() => Array.from({length: 12}, (_, i) => {
    const month = new Date(2026, 4 + i, 1).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'short' });
    // Modest 1.5%/month compounding (≈19.6%/yr) — consistent with the 5-Year Projection's realistic scenario
    return { month, valuation: currentValuation * Math.pow(1.015, i) };
  }), [currentValuation, lang]);

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_valuation}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.valuation_title}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.valuation_subtitle}</div>
      </div>

      <div style={{padding: '12px 16px', background: 'rgba(200,169,106,0.12)', borderLeft: '3px solid var(--ims-accent)', marginBottom: '24px', fontSize: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px'}}>
        <AlertCircle size={16} style={{flexShrink: 0, marginTop: '1px'}} />
        <span>{lang === 'id' ? 'Estimasi valuasi bersifat indikatif & konservatif. Untuk valuasi resmi diperlukan due diligence oleh penilai/financial advisor independen.' : 'Valuation estimate is indicative & conservative. Official valuation requires due diligence by an independent appraiser/financial advisor.'}</span>
      </div>

      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '24px', border: '1px solid var(--ims-border)'}}>
        <KPICard label={t.current_valuation} value={fmt(currentValuation)} sublabel={lang === 'id' ? 'Blended (Rev + EBITDA)' : 'Blended (Rev + EBITDA)'} trend={14.2} />
        <KPICard label={t.projected_revenue} value={fmt(annualizedRevenue)} sublabel={lang === 'id' ? 'Disetahunkan (×12/5)' : 'Annualized (×12/5)'} trend={18.5} />
        <KPICard label={lang === 'id' ? 'Estimasi EBITDA' : 'Estimated EBITDA'} value={fmt(estimatedEBITDA)} sublabel={lang === 'id' ? `Margin ${(EBITDA_MARGIN*100).toFixed(0)}%` : `${(EBITDA_MARGIN*100).toFixed(0)}% margin`} trend={2.1} />
        <KPICard label={t.ipo_readiness} value={`${ipoScore}%`} sublabel={ipoScore >= 70 ? (lang === 'id' ? 'Siap Pra-IPO' : 'Pre-IPO ready') : (lang === 'id' ? 'Membangun' : 'Building')} trend={ipoScore >= 70 ? 8.0 : 12.5} />
      </div>

      {/* Two-method breakdown */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '22px'}}>
        <div style={{padding: '16px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? 'Metode 1: EV/Pendapatan' : 'Method 1: EV/Revenue'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px', color: '#1a4d8a'}}>{fmt(valByRevenue)}</div>
          <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{fmt(annualizedRevenue)} × {EV_REVENUE_MULT}×</div>
        </div>
        <div style={{padding: '16px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? 'Metode 2: EV/EBITDA' : 'Method 2: EV/EBITDA'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent-2)'}}>{fmt(valByEBITDA)}</div>
          <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{fmt(estimatedEBITDA)} × {EV_EBITDA_MULT}×</div>
        </div>
        <div style={{padding: '16px', background: 'var(--ims-bg-alt)', color: '#fff'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-accent)', fontWeight: 600}}>{lang === 'id' ? 'Valuasi Blended (Rata-rata)' : 'Blended Valuation (Average)'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px'}}>{fmt(blendedValuation)}</div>
          <div style={{fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '4px'}}>{lang === 'id' ? `+ potensi pipeline ${fmt(pipelineUpside)}` : `+ pipeline upside ${fmt(pipelineUpside)}`}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">{lang === 'id' ? 'Proyeksi Valuasi 12 Bulan' : '12-Month Valuation Projection'}</div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={monthlyProjection} margin={{top: 10, right: 16, left: 0, bottom: 0}}>
            <defs><linearGradient id="vg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--ims-gold)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--ims-gold)" stopOpacity={0.05} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--ims-text-2)" style={{fontSize: 10}} />
            <YAxis stroke="var(--ims-text-2)" style={{fontSize: 10}} tickFormatter={(v) => v >= 1e9 ? `${(v/1e9).toFixed(0)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v} />
            <Tooltip content={<ChartTooltip fmt={fmt} />} />
            <Legend wrapperStyle={{fontSize: '11px'}} />
            <Area type="monotone" dataKey="valuation" name={t.current_valuation} stroke="var(--ims-accent)" strokeWidth={2.5} fill="url(#vg1)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Methodology + sources */}
      <div style={{padding: '18px 20px', background: 'rgba(123,63,181,0.05)', borderLeft: '3px solid #7b3fb5', fontSize: '12px', color: 'var(--ims-text)', lineHeight: 1.75, marginTop: '20px'}}>
        <div style={{fontWeight: 700, fontSize: '13px', marginBottom: '10px'}}>📐 {lang === 'id' ? 'Dasar Logika, Matematika & Sumber' : 'Methodology, Math & Sources'}</div>
        <div style={{marginBottom: '8px'}}>
          <strong>{lang === 'id' ? '1. Pendapatan disetahunkan:' : '1. Annualized revenue:'}</strong>{' '}
          <span style={{fontFamily: 'monospace', background: 'var(--ims-bg-card)', padding: '1px 6px', border: '1px solid var(--ims-border)'}}>{fmt(revenueYTD)} × (12/5) = {fmt(annualizedRevenue)}</span>{' '}
          {lang === 'id' ? '— dari deal menang (PO terbit) Jan–Mei, sinkron dengan Dashboard & Finance.' : '— from won deals (PO issued) Jan–May, synced with Dashboard & Finance.'}
        </div>
        <div style={{marginBottom: '8px'}}>
          <strong>{lang === 'id' ? '2. EBITDA:' : '2. EBITDA:'}</strong>{' '}<span style={{fontFamily: 'monospace', background: 'var(--ims-bg-card)', padding: '1px 6px', border: '1px solid var(--ims-border)'}}>{fmt(annualizedRevenue)} × 10% = {fmt(estimatedEBITDA)}</span>{' '}{lang === 'id' ? '— margin distributor alkes konservatif 8–12%.' : '— conservative medical-device distributor margin 8–12%.'}
        </div>
        <div style={{marginBottom: '8px'}}>
          <strong>{lang === 'id' ? '3. Dua metode pasar (multiple khusus distributor):' : '3. Two market methods (distributor-specific multiples):'}</strong>
          <ul style={{margin: '4px 0 0', paddingLeft: '18px', fontSize: '11.5px', color: '#5a4a6a'}}>
            <li>EV/Pendapatan <strong>0.6×</strong> — {lang === 'id' ? 'distributor diperdagangkan jauh di bawah produsen. Komparabel Capital IQ (Seale & Assoc. Q2-2025): Medtronic 4.0×, Baxter 2.7×, ICU Medical 1.9×, JMS 0.4×. Distributor murni + diskon SME/illikuiditas Indonesia → ~0.6×.' : 'distributors trade far below manufacturers. Capital IQ comparables (Seale & Assoc. Q2-2025): Medtronic 4.0×, Baxter 2.7×, ICU Medical 1.9×, JMS 0.4×. Pure distributor + Indonesian SME/illiquidity discount → ~0.6×.'}</li>
            <li>EV/EBITDA <strong>8×</strong> — {lang === 'id' ? 'median EV/EBITDA jasa kesehatan ~11.5× (2025, turun dari 14.5× di 2024 — FOCUS IB); diskon SME + emerging-market → ~8×.' : 'healthcare services median EV/EBITDA ~11.5× (2025, down from 14.5× in 2024 — FOCUS IB); SME + emerging-market discount → ~8×.'}</li>
          </ul>
        </div>
        <div style={{marginBottom: '8px'}}>
          <strong>{lang === 'id' ? '4. Valuasi blended:' : '4. Blended valuation:'}</strong>{' '}<span style={{fontFamily: 'monospace', background: 'var(--ims-bg-card)', padding: '1px 6px', border: '1px solid var(--ims-border)'}}>({fmt(valByRevenue)} + {fmt(valByEBITDA)}) / 2 = {fmt(blendedValuation)}</span>
        </div>
        <div style={{fontSize: '10.5px', color: 'var(--ims-text-2)', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--ims-border)'}}>
          <strong>{lang === 'id' ? 'Sumber:' : 'Sources:'}</strong> Seale & Associates "Healthcare Industry Valuation Update Q2 2025" (Capital IQ comparables) · FOCUS Investment Banking "Healthcare EBITDA Multiples 2025/2026" · First Page Sage "Healthcare EBITDA & Valuation Multiples 2025" · Damodaran/NYU Stern (EV/EBITDA health & pharma).{' '}
          {lang === 'id' ? 'Pendekatan ini sengaja konservatif — bila realisasi terkoreksi lebih rendah, angkanya tetap dapat dipertanggungjawabkan.' : 'This approach is intentionally conservative — if realized value corrects lower, the figures remain defensible.'}
        </div>
      </div>
    </div>
  );
}

function SPHModal({ sph, t, lang, onSave, onClose, fmtFull, existingData, products, employees = {} }) {
  const [form, setForm] = useState(sph || {
    sphNo: `SPH/2026/${String(Date.now()).slice(-3)}`,
    customer: '', customerType: 'hospital', projectType: 'private',
    modality: 'CT Scan', subModality: '', qty: 1, unitPrice: 0, totalValue: 0,
    issuedDate: '2026-05-16', salesOwner: 'lukman', region: 'Jateng',
    status: 'active', stage: 'sph_sent', probability: 20,
    notes: '', nextAction: '', lastUpdate: '2026-05-16',
    poStatus: null, dpPaid: false, finalPaid: false, shippingStatus: null, customsStatus: null,
    // Tahap 8 — Deal Model defaults (RS Swasta + Cicilan default)
    customerSector: 'swasta', dealModel: 'cicilan',
    paymentScheme: 'dp_installment', dpPercent: 30, installmentMonths: 12,
    ksoYears: 5, ksoInvestorPct: 70,
  });

  // Duplicate detection — detect SPH dengan customer+modality+subModality yang sama
  // Excludes self (kalau edit), excludes lost/cancelled, excludes status 'won' yang sudah closed
  const duplicates = useMemo(() => {
    if (!existingData || !form.customer || !form.modality || !form.subModality) return [];
    const ownId = sph?.id;
    return existingData.filter(s => {
      if (s.id === ownId) return false;
      if (s.status === 'lost' || s.status === 'cancelled') return false;
      // Match customer (case-insensitive) + modality + subModality
      return (
        s.customer?.toLowerCase().trim() === form.customer.toLowerCase().trim() &&
        s.modality?.toLowerCase() === form.modality.toLowerCase() &&
        s.subModality?.toLowerCase().trim() === form.subModality.toLowerCase().trim()
      );
    });
  }, [existingData, form.customer, form.modality, form.subModality, sph]);

  // Modal state for duplicate confirmation
  const [duplicatePrompt, setDuplicatePrompt] = useState(null); // null | { action: 'save_both' | 'replace' | 'cancel' }

  // Active products only — for autocomplete dropdown
  const activeProducts = useMemo(() => (products || []).filter(p => p.active !== false), [products]);
  const salesOwnerOptions = useMemo(() => Object.entries(employees || {})
    .filter(([id, emp]) => emp.role === 'sales' && emp.active !== false)
    .map(([id, emp]) => ({ id, name: emp.name }))
    .sort((a, b) => a.name.localeCompare(b.name)), [employees]);
  const modalityOptions = useMemo(() => {
    const set = new Set(activeProducts.map(p => p.modality).filter(Boolean));
    return Array.from(set).sort();
  }, [activeProducts]);
  // Filter sub-modalities by selected modality
  const subModalityOptions = useMemo(() => {
    return activeProducts.filter(p => p.modality === form.modality).map(p => ({
      id: p.id, type: p.type, brand: p.brand, name: p.name, principal: p.principal, origin: p.origin,
    }));
  }, [activeProducts, form.modality]);
  const enrichSphProductLink = (raw) => {
    const prod = resolveProductRecord({
      productId: raw.productId,
      modality: raw.modality,
      subModality: raw.subModality,
      brand: raw.productBrand || raw.brand || raw.partner,
    }, activeProducts);
    return prod ? {
      ...raw,
      productId: prod.id,
      productBrand: prod.brand,
      principal: prod.principal,
      origin: prod.origin,
      partner: raw.partner || prod.brand,
      items: [{ productId: prod.id, modality: prod.modality, brand: prod.brand, productBrand: prod.brand, subModality: prod.type, productName: prod.name, principal: prod.principal, origin: prod.origin, qty: raw.qty || 1, unitPrice: raw.unitPrice || 0, totalValue: raw.totalValue || ((raw.qty || 1) * (raw.unitPrice || 0)) }],
    } : raw;
  };

  const update = (k, v) => {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      if (k === 'qty' || k === 'unitPrice') next.totalValue = (next.qty || 0) * (next.unitPrice || 0);
      if (k === 'stage') {
        const stage = STAGES.find(s => s.id === v);
        if (stage) next.probability = stage.baseProbability;
        // Stage ⟺ status ⟺ poStatus coherence (review #1/#3): PO Terbit = Menang.
        if (v === 'po_issued') { next.poStatus = 'issued'; next.status = 'won'; next.probability = 100; }
        else if (v === 'lost') { next.status = 'lost'; next.poStatus = null; }
        else { if (next.status === 'won' || next.status === 'lost') next.status = 'active'; next.poStatus = null; }
      }
      if (k === 'status') {
        // Reverse coupling so the Status dropdown stays consistent with stage/PO.
        if (v === 'won') { next.stage = 'po_issued'; next.poStatus = 'issued'; next.probability = 100; }
        else if (v === 'lost') { next.stage = 'lost'; next.poStatus = null; }
        else { // active
          next.poStatus = null;
          if (next.stage === 'po_issued' || next.stage === 'lost') {
            next.stage = 'negotiation';
            const ns = STAGES.find(s => s.id === 'negotiation');
            if (ns) next.probability = ns.baseProbability;
          }
        }
      }
      // ===== Deal Model coherence (Tahap 8) =====
      // Sinkronkan dealModel ⇔ paymentScheme ⇔ projectType supaya semua modul hilir konsisten.
      if (k === 'dealModel') {
        const sec = resolveCustomerSector(next);
        if (v === 'cicilan') {
          next.paymentScheme = 'dp_installment';
          next.projectType = sec === 'pemerintah' ? 'bumn' : 'private';
          if (!next.dpPercent) next.dpPercent = 30;
          if (!next.installmentMonths || next.installmentMonths > 36) next.installmentMonths = 12;
        } else if (v === 'kso') {
          next.paymentScheme = 'kso';
          next.projectType = 'kso';
          if (!next.ksoYears) next.ksoYears = 5;
          if (!next.ksoInvestorPct) next.ksoInvestorPct = 70;
          next.installmentMonths = next.ksoYears * 12;
          next.dpPercent = 10; // konvensi lama
        } else if (v === 'ekatalog') {
          next.paymentScheme = 'after_bast';
          next.projectType = 'government';
          next.dpPercent = 0;
          next.installmentMonths = 0;
        } else if (v === 'tender') {
          next.paymentScheme = 'after_bast';
          next.projectType = 'tender';
          next.dpPercent = 0;
          next.installmentMonths = 0;
        }
      }
      // KSO: ubah ksoYears → otomatis update installmentMonths (years×12)
      if (k === 'ksoYears') {
        next.installmentMonths = (parseInt(v) || 5) * 12;
      }
      // If modality changed, reset subModality (since options change)
      if (k === 'modality') {
        next.subModality = '';
        next.productId = '';
        next.productBrand = '';
        next.principal = '';
        next.origin = '';
      }
      if (k === 'subModality') {
        const prod = resolveProductRecord({ modality: next.modality, subModality: v }, activeProducts);
        if (prod) {
          next.productId = prod.id;
          next.productBrand = prod.brand;
          next.principal = prod.principal;
          next.origin = prod.origin;
          next.partner = prod.brand;
        }
      }
      // If customer changes, also auto-detect sales owner (if not yet set or matches old territory)
      if (k === 'customer' && v && typeof detectSalesOwnerFromCustomer === 'function') {
        const suggested = detectSalesOwnerFromCustomer(v);
        if (suggested) next.salesOwner = suggested;
      }
      return next;
    });
  };

  // Handle final save — interception logic for duplicates
  const handleFinalSave = () => {
    if (duplicates.length > 0 && !sph) {
      // Only prompt for NEW SPH (not edits) when duplicates detected
      setDuplicatePrompt({ open: true });
      return;
    }
    onSave(enrichSphProductLink(form));
  };

  // User chose "save both" — proceed
  const confirmSaveBoth = () => {
    setDuplicatePrompt(null);
    onSave(enrichSphProductLink({ ...form, _duplicateNote: `Sengaja disimpan meski ada ${duplicates.length} SPH serupa untuk customer & produk yang sama. Kemungkinan: update harga / revisi pasca-negosiasi.` }));
  };

  // User chose "replace old" — mark old as cancelled and save new
  const confirmReplace = () => {
    const oldIds = duplicates.map(d => d.id);
    setDuplicatePrompt(null);
    onSave(enrichSphProductLink({ ...form, _replaceOldIds: oldIds, _duplicateNote: `Menggantikan ${duplicates.length} SPH lama (${duplicates.map(d => d.sphNo).join(', ')}) — kemungkinan revisi harga atau penawaran terbaru.` }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h2 className="serif" style={{fontSize: '24px', margin: 0, fontWeight: 500}}>{sph ? t.edit_sph : t.add_new_sph}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>

        {/* Duplicate warning banner — visible saat user mengetik */}
        {duplicates.length > 0 && !sph && (
          <div style={{padding: '12px 14px', background: '#25190c', border: '2px solid var(--ims-accent)', marginBottom: '14px', fontSize: '12px', color: '#5a4a1a', lineHeight: 1.6}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px'}}>
              <AlertTriangle size={16} color="var(--ims-accent)" />
              <strong style={{fontSize: '13px'}}>⚠ {lang === 'id' ? `${duplicates.length} SPH Serupa Terdeteksi` : `${duplicates.length} Similar SPH Detected`}</strong>
            </div>
            <div style={{fontSize: '11px', marginBottom: '6px'}}>
              {lang === 'id'
                ? `Customer "${form.customer}" dengan produk ${form.modality} (${form.subModality}) sudah pernah dapat SPH:`
                : `Customer "${form.customer}" with product ${form.modality} (${form.subModality}) has previous SPH:`}
            </div>
            <ul style={{margin: 0, paddingLeft: '20px', fontSize: '11px'}}>
              {duplicates.map(d => (
                <li key={d.id} style={{marginBottom: '3px'}}>
                  <span className="mono" style={{color: 'var(--ims-text)', fontWeight: 600}}>{d.sphNo}</span>
                  <span style={{color: 'var(--ims-text-2)'}}> · {d.issuedDate} · </span>
                  <span style={{fontWeight: 500}}>{fmtFull ? fmtFull(d.totalValue) : d.totalValue}</span>
                  <span style={{color: 'var(--ims-text-2)'}}> · stage: {d.stage}</span>
                </li>
              ))}
            </ul>
            <div style={{fontSize: '10.5px', color: 'var(--ims-text-2)', marginTop: '6px', fontStyle: 'italic'}}>
              {lang === 'id' ? 'Saat menekan Simpan, sistem akan menanyakan: lanjutkan keduanya atau gantikan yang lama.' : 'On Save, system will ask: keep both or replace old one.'}
            </div>
          </div>
        )}

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          {[
            ['sphNo', t.sph_number, 'text'],
            ['issuedDate', t.issued_date, 'date'],
            ['customer', t.customer, 'text', true],
          ].map(([k, l, ty, full]) => (
            <div key={k} style={{gridColumn: full ? '1 / -1' : 'auto'}}>
              <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{l}</label>
              <input type={ty} value={form[k]} onChange={e => update(k, e.target.value)} />
            </div>
          ))}
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.customer_type}</label>
            <select value={form.customerType} onChange={e => update('customerType', e.target.value)}>
              <option value="hospital">{t.type_hospital}</option><option value="clinic">{t.type_clinic}</option>
              <option value="subdistributor">{t.type_subdistributor}</option><option value="partner">{t.type_partner}</option>
            </select>
          </div>
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.project_type}</label>
            <select value={form.projectType} onChange={e => update('projectType', e.target.value)}>
              {PROJECT_TYPES.map(pt => <option key={pt.id} value={pt.id}>{t[`ptype_${pt.id}`]}</option>)}
            </select>
          </div>
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.sales_owner}</label>
            <select value={form.salesOwner} onChange={e => update('salesOwner', e.target.value)}>
              {salesOwnerOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.modality}</label>
            <select value={form.modality} onChange={e => update('modality', e.target.value)}>
              {(modalityOptions.length > 0 ? modalityOptions : Object.keys(MODALITY_COLORS)).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{lang === 'id' ? 'Dari Master Produk' : 'From Product Master'}</div>
          </div>
          <div style={{gridColumn: '1 / -1'}}>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{lang === 'id' ? 'Tipe' : 'Type'}</label>
            {subModalityOptions.length > 0 ? (
              <>
                <select value={form.subModality} onChange={e => update('subModality', e.target.value)}>
                  <option value="">— {lang === 'id' ? 'Pilih dari Master Produk' : 'Select from Product Master'} —</option>
                  {subModalityOptions.map((p, i) => (
                    <option key={i} value={p.type}>{p.type} ({p.brand} · {p.origin})</option>
                  ))}
                </select>
                <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{lang === 'id' ? `${subModalityOptions.length} produk tersedia untuk modalitas ${form.modality}` : `${subModalityOptions.length} products available for ${form.modality}`}</div>
              </>
            ) : (
              <input value={form.subModality} onChange={e => update('subModality', e.target.value)} placeholder="e.g. CT 128 Slice" />
            )}
          </div>
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.quantity}</label>
            <input type="number" value={form.qty} onChange={e => update('qty', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{lang === 'id' ? 'Harga Unit (Rp)' : 'Unit Price (Rp)'}</label>
            <input type="number" value={form.unitPrice} onChange={e => update('unitPrice', parseFloat(e.target.value) || 0)} />
          </div>
          <div style={{gridColumn: '1 / -1'}}>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.total_value}</label>
            <div style={{padding: '10px 14px', background: 'var(--ims-bg-card-2)', fontSize: '14px', fontWeight: 500}} className="mono">{fmtFull(form.totalValue)}</div>
          </div>
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{lang === 'id' ? 'Tahapan' : 'Stage'}</label>
            <select value={form.stage} onChange={e => update('stage', e.target.value)}>
              {STAGES.map(s => <option key={s.id} value={s.id}>{t[`stage_${s.id}`]}</option>)}
            </select>
          </div>
          <div>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.status}</label>
            <select value={form.status} onChange={e => update('status', e.target.value)}>
              <option value="active">{t.status_active}</option><option value="won">{t.status_won}</option><option value="lost">{t.status_lost}</option>
            </select>
          </div>
          {form.stage === 'tender' && (
            <div style={{gridColumn: '1 / -1'}}>
              <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{lang === 'id' ? 'Sub-Tahapan Tender' : 'Tender Sub-Stage'}</label>
              <select value={form.tenderSubStage || ''} onChange={e => update('tenderSubStage', e.target.value)}>
                <option value="">—</option>
                {TENDER_SUBSTAGES.map(s => <option key={s} value={s}>{t[`tender_${s}`]}</option>)}
              </select>
            </div>
          )}
          <div style={{gridColumn: '1 / -1'}}>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.probability} (%)</label>
            <input type="number" min="0" max="100" value={form.probability} onChange={e => update('probability', parseInt(e.target.value) || 0)} />
          </div>
          <div style={{gridColumn: '1 / -1'}}>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.next_action}</label>
            <input value={form.nextAction} onChange={e => update('nextAction', e.target.value)} />
          </div>

          {/* ============== Deal Model Section (Tahap 8) ============== */}
          <div style={{gridColumn: '1 / -1', marginTop: '8px', padding: '14px 16px', background: 'rgba(52,211,153,0.04)', border: '1px solid var(--ims-border)', borderLeft: '3px solid var(--ims-accent)'}}>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-accent)', fontWeight: 700, marginBottom: '12px'}}>
              {t.deal_model_section}
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
              <div>
                <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.customer_sector}</label>
                <select value={resolveCustomerSector(form)} onChange={e => {
                  const sec = e.target.value;
                  // Pilihan dealModel per sektor — reset dealModel kalau tidak valid utk sektor baru
                  const validForSwasta = ['cicilan', 'kso'];
                  const validForPemerintah = ['ekatalog', 'tender', 'kso'];
                  const current = resolveDealModel(form);
                  const valid = sec === 'swasta' ? validForSwasta : validForPemerintah;
                  const next = valid.includes(current) ? current : valid[0];
                  setForm(prev => ({ ...prev, customerSector: sec, dealModel: next }));
                }}>
                  <option value="swasta">{t.sector_swasta}</option>
                  <option value="pemerintah">{t.sector_pemerintah}</option>
                </select>
              </div>
              <div>
                <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.deal_model}</label>
                <select value={resolveDealModel(form)} onChange={e => update('dealModel', e.target.value)}>
                  {resolveCustomerSector(form) === 'swasta' ? (
                    <>
                      <option value="cicilan">{t.dm_cicilan}</option>
                      <option value="kso">{t.dm_kso}</option>
                    </>
                  ) : (
                    <>
                      <option value="ekatalog">{t.dm_ekatalog}</option>
                      <option value="tender">{t.dm_tender}</option>
                      <option value="kso">{t.dm_kso}</option>
                    </>
                  )}
                </select>
              </div>

              {/* Sub-field: CICILAN (DP% + termin) */}
              {resolveDealModel(form) === 'cicilan' && (
                <>
                  <div>
                    <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.dp_percent}</label>
                    <select value={form.dpPercent ?? 30} onChange={e => update('dpPercent', parseInt(e.target.value))}>
                      {CICILAN_DP_OPTIONS.map(p => <option key={p} value={p}>{p}%</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.term_months}</label>
                    <select value={form.installmentMonths ?? 12} onChange={e => update('installmentMonths', parseInt(e.target.value))}>
                      {CICILAN_TERM_OPTIONS.map(m => <option key={m} value={m}>{m} {lang === 'id' ? 'bulan' : 'months'}</option>)}
                    </select>
                  </div>
                </>
              )}

              {/* Sub-field: KSO (durasi + bagi hasil) */}
              {resolveDealModel(form) === 'kso' && (
                <>
                  <div>
                    <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.kso_years}</label>
                    <select value={form.ksoYears ?? 5} onChange={e => update('ksoYears', parseInt(e.target.value))}>
                      {KSO_YEAR_OPTIONS.map(y => <option key={y} value={y}>{y} {lang === 'id' ? 'tahun' : 'years'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.kso_investor_pct}</label>
                    <select value={form.ksoInvestorPct ?? 70} onChange={e => update('ksoInvestorPct', parseFloat(e.target.value))}>
                      {KSO_INVESTOR_PCT_OPTIONS.map(p => <option key={p} value={p}>{p.toFixed(1)}%</option>)}
                    </select>
                  </div>
                  <div style={{gridColumn: '1 / -1', padding: '8px 12px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', fontSize: '11px', color: 'var(--ims-text-2)'}}>
                    <strong style={{color: 'var(--ims-text)'}}>{t.kso_rs_pct}:</strong> {(100 - (form.ksoInvestorPct ?? 70)).toFixed(1)}%
                    <span style={{marginLeft: '12px', fontStyle: 'italic'}}>· {t.kso_billing_note}</span>
                  </div>
                </>
              )}

              {/* Sub-field: e-Katalog / Tender → tidak ada submenu, hanya info */}
              {(resolveDealModel(form) === 'ekatalog' || resolveDealModel(form) === 'tender') && (
                <div style={{gridColumn: '1 / -1', padding: '8px 12px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', fontSize: '11px', color: 'var(--ims-text-2)'}}>
                  <strong style={{color: 'var(--ims-text)'}}>{resolveDealModel(form) === 'ekatalog' ? t.dm_ekatalog : t.dm_tender}:</strong> {t.after_bast_full}
                </div>
              )}

              {/* Pratinjau Jadwal Pembayaran */}
              {(() => {
                const sch = computeInvoiceSchedule(form);
                if (!sch.invoices.length) return null;
                const firstAmt = sch.invoices[0]?.amount || 0;
                const lastDate = sch.invoices[sch.invoices.length - 1]?.date || '-';
                return (
                  <div style={{gridColumn: '1 / -1', padding: '10px 12px', background: 'var(--ims-bg-card)', border: '1px dashed var(--ims-border)', fontSize: '11.5px', color: 'var(--ims-text)'}}>
                    <div style={{fontWeight: 600, marginBottom: '6px', color: 'var(--ims-accent)', fontSize: '10.5px', letterSpacing: '0.1em', textTransform: 'uppercase'}}>📊 {t.payment_preview}</div>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '11px'}}>
                      <div><span style={{color: 'var(--ims-text-2)'}}>{t.preview_total_invoices}:</span> <strong>{sch.totalCount}</strong></div>
                      <div><span style={{color: 'var(--ims-text-2)'}}>{t.preview_first_billing}:</span> <strong className="mono">{fmtFull ? fmtFull(firstAmt) : firstAmt}</strong></div>
                      <div><span style={{color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Tagihan Terakhir' : 'Last Billing'}:</span> <strong className="mono">{lastDate}</strong></div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <div style={{gridColumn: '1 / -1'}}>
            <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.notes}</label>
            <textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} />
          </div>
        </div>

        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.cancel}</button>
          <button className="btn-primary" onClick={handleFinalSave}>{t.save}</button>
        </div>
      </div>

      {/* Duplicate Detection Modal — pops over the SPH modal when duplicate is found */}
      {duplicatePrompt && (
        <div className="modal-overlay" style={{zIndex: 10001, background: 'rgba(0,0,0,0.7)'}} onClick={() => setDuplicatePrompt(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '600px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
              <div style={{width: '40px', height: '40px', borderRadius: '50%', background: '#25190c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                <AlertTriangle size={22} color="var(--ims-accent)" />
              </div>
              <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500, color: 'var(--ims-text)'}}>
                {lang === 'id' ? `${duplicates.length} SPH Serupa Terdeteksi` : `${duplicates.length} Similar SPH Detected`}
              </h2>
            </div>

            <p style={{fontSize: '13px', color: 'var(--ims-text)', lineHeight: 1.6, margin: '0 0 14px'}}>
              {lang === 'id'
                ? <>Sistem mendeteksi SPH dengan <strong>customer + produk + tipe yang sama</strong>. Hal ini umum terjadi karena:</>
                : <>System detected SPH with <strong>same customer + product + type</strong>. This commonly happens because:</>}
            </p>
            <ul style={{fontSize: '12px', color: '#5a4a1a', lineHeight: 1.7, paddingLeft: '20px', margin: '0 0 14px', background: 'var(--ims-gold-bg)', padding: '12px 14px 12px 32px', border: '1px solid var(--ims-accent)'}}>
              <li>{lang === 'id' ? 'Proyek tahun lalu pending, customer minta penawaran terbaru dengan harga update' : 'Last year\'s pending project, customer requests updated quotation'}</li>
              <li>{lang === 'id' ? 'Hasil negosiasi — SPH baru dengan harga setelah diskusi' : 'Post-negotiation — new SPH reflecting agreed price'}</li>
              <li>{lang === 'id' ? 'Revisi konfigurasi atau bundling alat berbeda' : 'Configuration revision or different equipment bundling'}</li>
            </ul>

            <div style={{padding: '12px', background: 'var(--ims-bg-card-2)', marginBottom: '16px', maxHeight: '180px', overflowY: 'auto'}}>
              <div style={{fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '8px'}}>
                {lang === 'id' ? 'SPH Lama yang Sudah Ada' : 'Existing Previous SPH'}
              </div>
              {duplicates.map(d => (
                <div key={d.id} style={{padding: '8px 10px', background: 'var(--ims-bg-card)', marginBottom: '6px', border: '1px solid var(--ims-border)'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
                    <div>
                      <span className="mono" style={{color: 'var(--ims-text)', fontWeight: 600, fontSize: '12px'}}>{d.sphNo}</span>
                      <span style={{color: 'var(--ims-text-2)', fontSize: '11px'}}> · {d.issuedDate}</span>
                    </div>
                    <div style={{fontWeight: 600, color: 'var(--ims-text)', fontSize: '12px'}}>{fmtFull ? fmtFull(d.totalValue) : d.totalValue}</div>
                  </div>
                  <div style={{fontSize: '10.5px', color: 'var(--ims-text-2)', marginTop: '3px'}}>
                    {lang === 'id' ? 'Stage' : 'Stage'}: <strong style={{color: 'var(--ims-text)'}}>{d.stage}</strong>
                    {' · '}
                    {lang === 'id' ? 'Probabilitas' : 'Probability'}: <strong style={{color: 'var(--ims-text)'}}>{d.probability}%</strong>
                  </div>
                </div>
              ))}
            </div>

            <div style={{fontSize: '12px', color: 'var(--ims-text)', lineHeight: 1.6, margin: '0 0 12px', fontWeight: 600}}>
              {lang === 'id' ? 'Apa yang ingin Bapak lakukan?' : 'What would you like to do?'}
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              {/* Option 1: Save both */}
              <button onClick={confirmSaveBoth} style={{padding: '12px 14px', background: 'var(--ims-bg-card)', border: '1px solid #1a4d8a', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <Plus size={16} color="#1a4d8a" />
                  <div style={{flex: 1}}>
                    <div style={{fontSize: '12px', fontWeight: 600, color: '#1a4d8a'}}>{lang === 'id' ? 'Simpan Keduanya' : 'Save Both'}</div>
                    <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'SPH baru disimpan, SPH lama tetap aktif. Berguna untuk membandingkan revisi harga.' : 'New SPH saved, old SPH stays active. Useful for tracking price revisions.'}</div>
                  </div>
                </div>
              </button>

              {/* Option 2: Replace old */}
              <button onClick={confirmReplace} style={{padding: '12px 14px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-accent)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <RefreshCw size={16} color="var(--ims-accent)" />
                  <div style={{flex: 1}}>
                    <div style={{fontSize: '12px', fontWeight: 600, color: 'var(--ims-accent)'}}>{lang === 'id' ? `Gantikan SPH Lama (${duplicates.length})` : `Replace Old SPH (${duplicates.length})`}</div>
                    <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'SPH lama di-set "cancelled" + SPH baru disimpan. Cocok untuk revisi pasca-negosiasi.' : 'Old SPHs marked "cancelled" + new SPH saved. Best for post-negotiation revision.'}</div>
                  </div>
                </div>
              </button>

              {/* Option 3: Cancel */}
              <button onClick={() => setDuplicatePrompt(null)} style={{padding: '12px 14px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <X size={16} color="var(--ims-text-2)" />
                  <div style={{flex: 1}}>
                    <div style={{fontSize: '12px', fontWeight: 600, color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Batal — Tinjau Ulang Dulu' : 'Cancel — Review First'}</div>
                    <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'Kembali ke form untuk edit/perbaiki data.' : 'Back to form to edit/correct data.'}</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
function MaintenanceModule({ units, issues, setIssues, pmSchedule, setPmSchedule, t, lang, canEdit, session, liveTechnicians = [], unitTechMap = {}, setUnitTechMap, employees = {} }) {
  const [tab, setTab] = useState('schedule');
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [pmModalOpen, setPmModalOpen] = useState(false);
  const [editingPm, setEditingPm] = useState(null);
  // Year filter + search for unit monitoring (sinkron dengan SPH module style)
  const [filterYear, setFilterYear] = useState('all');
  const [search, setSearch] = useState('');

  const availableYears = useMemo(() => {
    const years = new Set();
    units.forEach(u => { if (u.installDate) years.add(u.installDate.substring(0, 4)); });
    return Array.from(years).sort().reverse();
  }, [units]);

  // PERFORMANCE: Categorize units + KPIs all in one useMemo block (now year-aware)
  const unitsAndStats = useMemo(() => {
    const today = new Date('2026-05-16');
    const monthAhead = new Date('2026-06-16');
    // Apply year + search filters to units
    const filteredUnits = units.filter(u => {
      if (filterYear !== 'all' && !u.installDate?.startsWith(filterYear)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!u.customer?.toLowerCase().includes(q) &&
            !u.serialNo?.toLowerCase().includes(q) &&
            !u.subModality?.toLowerCase().includes(q) &&
            !u.modality?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    const unitsByPmStatus = filteredUnits.map(u => {
      const nextPm = new Date(u.nextPmDate);
      let pmStatus;
      if (nextPm < today) pmStatus = 'overdue';
      else if (nextPm < monthAhead) pmStatus = 'upcoming';
      else pmStatus = 'scheduled';
      const warrantyEnd = new Date(u.warrantyEnd);
      const underWarranty = warrantyEnd >= today;
      return { ...u, pmStatus, underWarranty };
    });
    const totalUnits = filteredUnits.length;
    const totalAllYears = units.length;
    const underWarranty = unitsByPmStatus.filter(u => u.underWarranty).length;
    const pmThisMonth = unitsByPmStatus.filter(u => u.pmStatus === 'overdue' || u.pmStatus === 'upcoming').length;
    const openIssues = issues.filter(i => i.status !== 'resolved').length;
    const repairs = issues.filter(i => i.type === 'repair');
    const complaints = issues.filter(i => i.type === 'complaint');
    return { unitsByPmStatus, totalUnits, totalAllYears, underWarranty, pmThisMonth, openIssues, repairs, complaints };
  }, [units, issues, filterYear, search]);
  const { unitsByPmStatus, totalUnits, totalAllYears, underWarranty, pmThisMonth, openIssues, repairs, complaints } = unitsAndStats;

  // Sort by priority (critical→high→medium→low), then by date desc
  const [repairsSortBy, setRepairsSortBy] = useState('priority');
  const [complaintsSortBy, setComplaintsSortBy] = useState('priority');

  const sortByPriorityAndDate = (arr, sortBy) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const list = [...arr];
    if (sortBy === 'priority') {
      return list.sort((a, b) => {
        const pa = priorityOrder[a.priority] ?? 99;
        const pb = priorityOrder[b.priority] ?? 99;
        if (pa !== pb) return pa - pb;
        return (b.reportedDate || '').localeCompare(a.reportedDate || '');
      });
    }
    if (sortBy === 'date_desc') return list.sort((a, b) => (b.reportedDate || '').localeCompare(a.reportedDate || ''));
    if (sortBy === 'date_asc') return list.sort((a, b) => (a.reportedDate || '').localeCompare(b.reportedDate || ''));
    if (sortBy === 'status') return list.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    return list;
  };

  const sortedRepairs = useMemo(() => sortByPriorityAndDate(repairs, repairsSortBy), [repairs, repairsSortBy]);
  const sortedComplaints = useMemo(() => sortByPriorityAndDate(complaints, complaintsSortBy), [complaints, complaintsSortBy]);

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
  const [deleteIssueId, setDeleteIssueId] = useState(null);
  const handleDeleteIssue = (id) => {
    if (!canEdit) return;
    setDeleteIssueId(id);
  };
  const confirmDeleteIssue = () => {
    setIssues(prev => prev.filter(i => i.id !== deleteIssueId));
    setDeleteIssueId(null);
  };

  // CRUD handlers for PM
  const handleSavePm = (pm) => {
    setPmSchedule(prev => {
      const exists = prev.find(p => p.id === pm.id);
      return exists ? prev.map(p => p.id === pm.id ? pm : p) : [...prev, pm];
    });
    setPmModalOpen(false); setEditingPm(null);
  };
  const [deletePmId, setDeletePmId] = useState(null);
  const handleDeletePm = (id) => {
    if (!canEdit) return;
    setDeletePmId(id);
  };
  const confirmDeletePm = () => {
    setPmSchedule(prev => prev.filter(p => p.id !== deletePmId));
    setDeletePmId(null);
  };

  const markPmDone = (unit) => {
    if (!canEdit) return;
    const uid = typeof unit === 'string' ? unit : unit.id;
    const dueDate = typeof unit === 'string' ? null : unit.nextPmDate;
    const today = new Date().toISOString().split('T')[0];
    // next PM = 6 calendar months after the due date (or today if unknown)
    const base = dueDate ? new Date(dueDate + 'T00:00:00') : new Date();
    const nd = new Date(base); nd.setMonth(nd.getMonth() + 6);
    const newPm = {
      id: 'pm_' + Date.now(),
      unitId: uid,
      dueDate, // the cycle this completion satisfies — used to dismiss its notification
      lastPmDate: today,
      nextPmDate: nd.toISOString().split('T')[0],
      technician: session?.name || (TECHNICIAN_NAMES[0] || 'Teknisi'),
      status: 'done',
      notes: lang === 'id' ? 'PM rutin 6 bulan selesai' : 'Routine 6-month PM completed'
    };
    setPmSchedule(prev => [...prev, newPm]);
  };

  // PM Notifications (#7) — 4 grades, dismissed after "Tandai Selesai".
  // Visible only to: technician, admin, manager_ops, gm, super_admin (CEO).
  const canSeePmNotif = ['technician', 'admin', 'manager_ops', 'gm', 'super_admin'].includes(session?.role);
  const pmNotifications = useMemo(() => {
    if (!canSeePmNotif) return [];
    const today = new Date('2026-05-31T00:00:00');
    const MS = 24 * 60 * 60 * 1000;
    const doneCycles = new Set((pmSchedule || []).filter(p => p.status === 'done' && p.unitId && p.dueDate).map(p => p.unitId + '|' + p.dueDate));
    const notifs = [];
    units.forEach(u => {
      if (!u.nextPmDate) return;
      if (doneCycles.has(u.id + '|' + u.nextPmDate)) return; // completed → no notification
      const due = new Date(u.nextPmDate + 'T00:00:00');
      const daysUntil = Math.round((due - today) / MS);
      let grade = null;
      if (daysUntil < 0) grade = 'overdue';
      else if (daysUntil <= 7) grade = 'week';
      else if (daysUntil <= 14) grade = 'twoweeks';
      else if (daysUntil <= 30) grade = 'month';
      if (grade) notifs.push({ ...u, daysUntil, grade });
    });
    return notifs.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [units, pmSchedule, canSeePmNotif]);

  const PM_GRADE = {
    overdue:  { color: '#7b1f1f', bg: 'rgba(123,31,31,0.10)', label: lang === 'id' ? 'TERLEWAT' : 'OVERDUE' },
    week:     { color: '#c03030', bg: 'rgba(192,48,48,0.10)', label: lang === 'id' ? '≤ 1 MINGGU' : '≤ 1 WEEK' },
    twoweeks: { color: '#d4780a', bg: 'rgba(212,120,10,0.10)', label: lang === 'id' ? '≤ 2 MINGGU' : '≤ 2 WEEKS' },
    month:    { color: 'var(--ims-accent)', bg: 'rgba(200,169,106,0.12)', label: lang === 'id' ? '≤ 1 BULAN' : '≤ 1 MONTH' },
  };

  const priorityColors = { low: '#5b87b8', medium: 'var(--ims-gold)', high: '#c03030', critical: '#7b1f1f' };
  const statusColors = { open: '#c03030', progress: 'var(--ims-gold)', resolved: 'var(--ims-accent-2)' };

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_maintenance}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.mt_title}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.mt_subtitle}</div>
      </div>

      {!canEdit && <ReadOnlyBanner t={t} />}

      {/* PM Notifications (#7) — 4 grades, dismissed via "Tandai Selesai" */}
      {canSeePmNotif && pmNotifications.length > 0 && (
        <div style={{marginBottom: '22px', border: '1px solid var(--ims-border)', background: 'var(--ims-bg-card)'}}>
          <div style={{padding: '12px 16px', borderBottom: '1px solid var(--ims-border)', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(192,48,48,0.04)'}}>
            <AlertTriangle size={16} color="#c03030" strokeWidth={2} />
            <span style={{fontSize: '12px', fontWeight: 700, color: 'var(--ims-text)', letterSpacing: '0.02em'}}>{lang === 'id' ? `Notifikasi Jadwal PM (${pmNotifications.length})` : `PM Schedule Alerts (${pmNotifications.length})`}</span>
            <span style={{fontSize: '10.5px', color: 'var(--ims-text-2)', marginLeft: 'auto'}}>{lang === 'id' ? 'Hilang setelah "Tandai Selesai"' : 'Cleared after "Mark Done"'}</span>
          </div>
          <div style={{maxHeight: '260px', overflowY: 'auto'}}>
            {pmNotifications.map(n => {
              const g = PM_GRADE[n.grade];
              return (
                <div key={n.id} style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderBottom: '1px solid var(--ims-bg-card-2)', background: g.bg}}>
                  <span style={{flexShrink: 0, padding: '2px 8px', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', background: g.color, color: '#fff', minWidth: '78px', textAlign: 'center'}}>{g.label}</span>
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={{fontSize: '12px', fontWeight: 600, color: 'var(--ims-text)'}}>{n.customer}</div>
                    <div style={{fontSize: '10.5px', color: 'var(--ims-text-2)'}}>{n.modality} · {n.subModality} · {lang === 'id' ? 'Teknisi' : 'Tech'}: {n.technician}</div>
                  </div>
                  <div style={{textAlign: 'right', flexShrink: 0}}>
                    <div style={{fontSize: '11px', fontWeight: 600, color: g.color}}>{n.daysUntil < 0 ? (lang === 'id' ? `Lewat ${Math.abs(n.daysUntil)} hari` : `${Math.abs(n.daysUntil)}d overdue`) : (lang === 'id' ? `${n.daysUntil} hari lagi` : `in ${n.daysUntil}d`)}</div>
                    <div className="mono" style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{n.nextPmDate}</div>
                  </div>
                  {canEdit && <button onClick={() => markPmDone(n)} style={{flexShrink: 0, padding: '5px 10px', fontSize: '10px', background: 'var(--ims-accent-2)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600}}>{t.mt_mark_done}</button>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <div className="card-pad">
          <div className="lbl-tag">{t.mt_total_units}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalUnits}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? `${filterYear === 'all' ? `kumulatif (${totalAllYears} total)` : `terpasang di ${filterYear}`}` : `${filterYear === 'all' ? `cumulative (${totalAllYears} total)` : `installed in ${filterYear}`}`}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{t.mt_units_warranty}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent-2)'}}>{underWarranty}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{t.mt_pm_this_month}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent)'}}>{pmThisMonth}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{t.mt_open_issues}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#c03030'}}>{openIssues}</div>
        </div>
      </div>

      {/* Year filter + search */}
      <div style={{display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center', flexWrap: 'wrap'}}>
        <div style={{position: 'relative', flex: '1 1 260px', maxWidth: '380px'}}>
          <Search size={14} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ims-text-2)'}} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === 'id' ? 'Cari pelanggan, serial, modalitas...' : 'Search customer, serial, modality...'} style={{paddingLeft: '36px'}} />
        </div>
        <span style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? 'Tahun Instalasi' : 'Install Year'}:</span>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{width: 'auto', minWidth: '110px'}}>
          <option value="all">{lang === 'id' ? 'Semua Tahun' : 'All Years'}</option>
          {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {[
          { id: 'schedule', label: t.mt_tab_schedule, icon: CalendarDays },
          { id: 'repair', label: t.mt_tab_repair, icon: Wrench },
          { id: 'complaint', label: t.mt_tab_complaint, icon: AlertTriangle },
        ].map(tb => {
          const Icon = tb.icon;
          const active = tab === tb.id;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '10px 18px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: active ? 'var(--ims-accent)' : 'var(--ims-text-2)', borderBottom: active ? '2px solid var(--ims-border)' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px', letterSpacing: '0.03em'}}>
              <Icon size={14} strokeWidth={1.5} />{tb.label}
            </button>
          );
        })}
      </div>

      {tab === 'schedule' && (
        <div>
          {/* Manual PM Records (CRUD) */}
          <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', marginBottom: '14px'}}>
            <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
              <div>
                <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{lang === 'id' ? 'Jadwal PM Tercatat oleh Teknisi' : 'PM Schedule Records by Technician'}</div>
                <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'Catatan PM manual oleh teknisi (di luar jadwal otomatis 6 bulan)' : 'Manual PM records by technician (outside auto 6-month schedule)'}</div>
              </div>
              {canEdit && <button className="btn-primary" onClick={() => { setEditingPm(null); setPmModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
            </div>
            {pmSchedule.length > 0 ? (
              <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px'}}>
                <thead>
                  <tr style={{background: 'var(--ims-bg-card-2)'}}>
                    <Th>{t.mt_pm_unit}</Th><Th>{t.mt_pm_last_date}</Th><Th>{t.mt_pm_next_date}</Th>
                    <Th>{t.mt_pm_technician}</Th><Th>{t.mt_pm_status}</Th>
                    {canEdit && <Th align="right">{t.crud_actions}</Th>}
                  </tr>
                </thead>
                <tbody>
                  {pmSchedule.map(pm => {
                    const unit = units.find(u => u.id === pm.unitId);
                    const statusColor = pm.status === 'done' ? 'var(--ims-accent-2)' : pm.status === 'overdue' ? '#c03030' : 'var(--ims-gold)';
                    return (
                      <tr key={pm.id} className="hover-row" style={{borderTop: '1px solid var(--ims-border)'}}>
                        <Td>
                          <div style={{fontWeight: 500, fontSize: '11px'}}>{unit ? unit.customer : '—'}</div>
                          <div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{unit ? unit.subModality : ''}</div>
                        </Td>
                        <Td><span className="mono" style={{fontSize: '11px'}}>{pm.lastPmDate || '—'}</span></Td>
                        <Td><span className="mono" style={{fontSize: '11px', fontWeight: 600}}>{pm.nextPmDate || '—'}</span></Td>
                        <Td><span style={{fontSize: '11px'}}>{resolveEmpName(employees, pm.technician)}</span></Td>
                        <Td><span style={{padding: '3px 8px', fontSize: '10px', background: statusColor + '25', color: statusColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`mt_pm_status_${pm.status}`]}</span></Td>
                        {canEdit && (
                          <Td align="right">
                            <button onClick={() => { setEditingPm(pm); setPmModalOpen(true); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit', marginRight: '4px'}}><Edit2 size={11} /></button>
                            <button onClick={() => handleDeletePm(pm.id)} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>
                          </Td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{padding: '20px', textAlign: 'center', color: 'var(--ims-text-2)', fontSize: '11px', fontStyle: 'italic'}}>{lang === 'id' ? 'Belum ada catatan PM manual. Klik "Tambah Baru" untuk mencatat PM oleh teknisi.' : 'No manual PM records yet. Click "Add New" to record a PM session.'}</div>
            )}
          </div>

          {/* Auto-derived Units PM */}
          <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
            <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)'}}>
              <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{lang === 'id' ? 'Jadwal PM Otomatis (per Unit Terinstal)' : 'Auto PM Schedule (per Installed Unit)'}</div>
              <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'Berdasarkan tanggal instalasi + 6 bulan' : 'Based on install date + 6 months'}</div>
            </div>
            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '900px'}}>
            <thead>
              <tr style={{background: 'var(--ims-bg-card-2)'}}>
                <Th>{t.mt_customer}</Th><Th>{t.mt_modality}</Th><Th>{t.mt_install_date}</Th>
                <Th>{t.mt_warranty_end}</Th><Th>{t.mt_last_pm}</Th><Th>{t.mt_next_pm}</Th>
                <Th>{t.mt_status}</Th><Th>{t.mt_technician}</Th>
                {canEdit && <Th align="right">{t.mt_actions}</Th>}
              </tr>
            </thead>
            <tbody>
              {unitsByPmStatus.sort((a, b) => new Date(a.nextPmDate) - new Date(b.nextPmDate)).slice(0, 80).map(u => {
                const pmColor = u.pmStatus === 'overdue' ? '#c03030' : u.pmStatus === 'upcoming' ? 'var(--ims-gold)' : 'var(--ims-accent-2)';
                const pmLabel = u.pmStatus === 'overdue' ? t.mt_pm_overdue : u.pmStatus === 'upcoming' ? t.mt_pm_upcoming : t.mt_pm_done;
                return (
                  <tr key={u.id} className="hover-row" style={{borderTop: '1px solid var(--ims-border)'}}>
                    <Td>
                      <div style={{fontWeight: 500}}>{u.customer}</div>
                      <div style={{fontSize: '10px', color: 'var(--ims-text-2)'}} className="mono">{u.sphRef}</div>
                    </Td>
                    <Td>
                      <div>{u.modality}</div>
                      <div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{u.subModality}</div>
                    </Td>
                    <Td><span className="mono" style={{fontSize: '11px'}}>{u.installDate}</span></Td>
                    <Td>
                      <span className="mono" style={{fontSize: '11px', color: u.underWarranty ? 'var(--ims-accent-2)' : '#8b3a3a'}}>{u.warrantyEnd}</span>
                      <div style={{fontSize: '9px', color: u.underWarranty ? 'var(--ims-accent-2)' : '#8b3a3a', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600}}>{u.underWarranty ? t.mt_under_warranty : t.mt_out_warranty}</div>
                    </Td>
                    <Td><span className="mono" style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>{u.lastPmDate || '—'}</span></Td>
                    <Td><span className="mono" style={{fontSize: '11px', fontWeight: 500}}>{u.nextPmDate}</span></Td>
                    <Td><span style={{display: 'inline-block', padding: '3px 8px', fontSize: '10px', background: pmColor + '25', color: pmColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{pmLabel}</span></Td>
                    <Td>
                      {canEdit && liveTechnicians.length > 0 ? (
                        <select value={liveTechnicians.includes(u.technician) ? u.technician : ''} onChange={e => setUnitTechMap && setUnitTechMap(prev => ({ ...prev, [u.id]: e.target.value }))} style={{fontSize: '11px', padding: '3px 6px', border: '1px solid var(--ims-border)', background: 'var(--ims-bg-card)', fontFamily: 'inherit', maxWidth: '150px', cursor: 'pointer'}} title={lang === 'id' ? 'Ubah teknisi (tersinkron dengan Manajemen Karyawan)' : 'Change technician (synced with Employee Management)'}>
                          {!liveTechnicians.includes(u.technician) && <option value="">{u.technician}</option>}
                          {liveTechnicians.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                      ) : (
                        <span style={{fontSize: '11px'}}>{u.technician}</span>
                      )}
                    </Td>
                    {canEdit && (
                      <Td align="right">
                        <button onClick={() => markPmDone(u)} style={{padding: '4px 8px', fontSize: '10px', background: 'var(--ims-accent-2)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em'}}>{t.mt_mark_done}</button>
                      </Td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {units.length === 0 && <div className="empty-state">{t.no_data}</div>}
          {units.length > 80 && <div style={{padding: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--ims-text-2)', borderTop: '1px solid var(--ims-border)'}}>{lang === 'id' ? `Menampilkan 80 dari ${units.length} unit. Filter & pagination tersedia di versi production.` : `Showing 80 of ${units.length} units. Filter & pagination available in production version.`}</div>}
          </div>
        </div>
      )}

      {tab === 'repair' && (
        <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
          <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
            <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.mt_repair_title}</div>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'}}>
              <span style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>{repairs.length} {t.project_count}</span>
              <SortToggle value={repairsSortBy} onChange={setRepairsSortBy} lang={lang} options={[
                {value: 'priority', label: lang === 'id' ? 'Prioritas (Kritis→Rendah)' : 'Priority (Critical→Low)'},
                {value: 'date_desc', label: lang === 'id' ? 'Terbaru' : 'Newest'},
                {value: 'date_asc', label: lang === 'id' ? 'Terlama' : 'Oldest'},
                {value: 'status', label: 'Status'},
              ]} />
              {canEdit && <button className="btn-primary" onClick={() => { setEditingIssue({ type: 'repair' }); setIssueModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
            </div>
          </div>
          {sortedRepairs.map(r => (
            <div key={r.id} style={{padding: '16px 18px', borderTop: '1px solid var(--ims-border)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '8px'}}>
                <div style={{flex: '1 1 300px'}}>
                  <div style={{fontSize: '13px', fontWeight: 600}}>{r.customer}</div>
                  <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{r.modality} · {r.subModality}</div>
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
                      <button onClick={() => { setEditingIssue(r); setIssueModalOpen(true); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit'}}><Edit2 size={11} /></button>
                      <button onClick={() => handleDeleteIssue(r.id)} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>
                    </>
                  )}
                </div>
              </div>
              <div style={{fontSize: '13px', marginBottom: '6px', lineHeight: 1.5}}>{r.issue}</div>
              <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--ims-text-2)'}}>
                <span><strong>{t.mt_reported_date}:</strong> <span className="mono">{r.reportedDate}</span></span>
                <span><strong>{t.mt_technician}:</strong> {resolveEmpName(employees, r.technician)}</span>
              </div>
              {r.note && <div style={{marginTop: '8px', padding: '8px 10px', background: 'var(--ims-bg-card-2)', fontSize: '11px', fontStyle: 'italic', color: 'var(--ims-text)'}}>📝 {r.note}</div>}
            </div>
          ))}
          {repairs.length === 0 && <div className="empty-state">{t.no_data}</div>}
        </div>
      )}

      {tab === 'complaint' && (
        <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
          <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
            <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.mt_complaint_title}</div>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'}}>
              <span style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>{complaints.length} {t.project_count}</span>
              <SortToggle value={complaintsSortBy} onChange={setComplaintsSortBy} lang={lang} options={[
                {value: 'priority', label: lang === 'id' ? 'Prioritas (Kritis→Rendah)' : 'Priority (Critical→Low)'},
                {value: 'date_desc', label: lang === 'id' ? 'Terbaru' : 'Newest'},
                {value: 'date_asc', label: lang === 'id' ? 'Terlama' : 'Oldest'},
                {value: 'status', label: 'Status'},
              ]} />
              {canEdit && <button className="btn-primary" onClick={() => { setEditingIssue({ type: 'complaint' }); setIssueModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
            </div>
          </div>
          {sortedComplaints.map(c => (
            <div key={c.id} style={{padding: '16px 18px', borderTop: '1px solid var(--ims-border)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '8px'}}>
                <div style={{flex: '1 1 300px'}}>
                  <div style={{fontSize: '13px', fontWeight: 600}}>{c.customer}</div>
                  <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{c.modality} · {c.subModality}</div>
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
                      <button onClick={() => { setEditingIssue(c); setIssueModalOpen(true); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit'}}><Edit2 size={11} /></button>
                      <button onClick={() => handleDeleteIssue(c.id)} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>
                    </>
                  )}
                </div>
              </div>
              <div style={{fontSize: '13px', marginBottom: '6px', lineHeight: 1.5}}>{c.issue}</div>
              <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--ims-text-2)'}}>
                <span><strong>{t.mt_reported_date}:</strong> <span className="mono">{c.reportedDate}</span></span>
                <span><strong>{t.mt_technician}:</strong> {c.technician}</span>
              </div>
              {c.note && <div style={{marginTop: '8px', padding: '8px 10px', background: 'var(--ims-bg-card-2)', fontSize: '11px', fontStyle: 'italic', color: 'var(--ims-text)'}}>📝 {c.note}</div>}
            </div>
          ))}
          {complaints.length === 0 && <div className="empty-state">{t.no_data}</div>}
        </div>
      )}
      {issueModalOpen && <MaintenanceIssueModal record={editingIssue} onSave={handleSaveIssue} onClose={() => { setIssueModalOpen(false); setEditingIssue(null); }} t={t} lang={lang} units={units} session={session} liveTechnicians={liveTechnicians} />}
      {pmModalOpen && <PMScheduleModal record={editingPm} onSave={handleSavePm} onClose={() => { setPmModalOpen(false); setEditingPm(null); }} t={t} lang={lang} units={units} session={session} liveTechnicians={liveTechnicians} />}
      <ConfirmDialog open={!!deleteIssueId} title={lang === 'id' ? 'Hapus Catatan?' : 'Delete Record?'} message={lang === 'id' ? 'Yakin ingin menghapus catatan perbaikan/keluhan ini?' : 'Are you sure you want to delete this issue/complaint?'} onConfirm={confirmDeleteIssue} onCancel={() => setDeleteIssueId(null)} danger lang={lang} />
      <ConfirmDialog open={!!deletePmId} title={lang === 'id' ? 'Hapus Jadwal PM?' : 'Delete PM Schedule?'} message={lang === 'id' ? 'Yakin ingin menghapus jadwal preventive maintenance ini?' : 'Are you sure you want to delete this PM schedule?'} onConfirm={confirmDeletePm} onCancel={() => setDeletePmId(null)} danger lang={lang} />
    </div>
  );
}

// ============== Maintenance Issue Modal (Repair/Complaint CRUD) ==============
function MaintenanceIssueModal({ record, onSave, onClose, t, lang, units, session, liveTechnicians = [] }) {
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
    technician: session?.name || 'Robby Dwi Setiawan',
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
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
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
          <Field label={lang === 'id' ? 'Tipe' : 'Type'}><input value={form.subModality} onChange={e => update('subModality', e.target.value)} placeholder="CT 128 Slice, MRI 1.5T, dll" /></Field>
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
          <Field label={t.mt_assigned_to}><input list="tech-roster" value={form.technician} onChange={e => update('technician', e.target.value)} /><datalist id="tech-roster">{(liveTechnicians.length ? liveTechnicians : TECHNICIAN_NAMES).map(n => <option key={n} value={n} />)}</datalist></Field>
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
function PMScheduleModal({ record, onSave, onClose, t, lang, units, session, liveTechnicians = [] }) {
  const [form, setForm] = useState(record?.id ? record : {
    id: 'pm_' + Date.now(),
    unitId: '',
    lastPmDate: new Date().toISOString().split('T')[0],
    nextPmDate: '',
    technician: session?.name || 'Robby Dwi Setiawan',
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
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
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
          <Field label={t.mt_pm_technician}><input list="tech-roster-pm" value={form.technician} onChange={e => update('technician', e.target.value)} /><datalist id="tech-roster-pm">{(liveTechnicians.length ? liveTechnicians : TECHNICIAN_NAMES).map(n => <option key={n} value={n} />)}</datalist></Field>
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


function RegulatoryDashboardCharts({ recordGroups, filterSearch = '', filterYear = 'all', t, lang }) {
  const rows = Object.entries(recordGroups || {}).flatMap(([type, list]) => (Array.isArray(list) ? list : []).map(r => ({ ...migrateRegRecord(r, type), recordType: type }))).filter(Boolean);
  const q = String(filterSearch || '').trim().toLowerCase();
  const filtered = rows.filter(r => {
    const text = [r.customer, r.product, r.principal, r.modality, r.subModality, r.importPermitNo, r.permitNo, r.piNo, r.aklNo, r.stage, r.note].filter(Boolean).join(' ').toLowerCase();
    const matchSearch = !q || text.includes(q);
    const matchYear = filterYear === 'all' || ['registerDate', 'docsDate', 'submitDate', 'evalDate', 'pnbpDate', 'issuedDate', 'installDate', 'expiredDate'].some(k => String(r?.[k] || '').startsWith(filterYear));
    return matchSearch && matchYear;
  });
  const typeData = ['akl', 'import', 'pengalihan', 'pi', 'bapeten'].map(type => ({
    name: REG_TYPE_LABELS[type]?.[lang === 'en' ? 'en' : 'id'] || type,
    value: filtered.filter(r => r.recordType === type).length,
  })).filter(x => x.value > 0);
  const stageData = REG_STAGES_DEFAULT.map(stage => ({
    name: regStageLabel(stage, 'bapeten', t, lang),
    value: filtered.filter(r => r.stage === stage).length,
    fill: REG_STAGE_COLORS[stage],
  }));
  const issuedByMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map((m, idx) => {
    const year = filterYear === 'all' ? '2026' : filterYear;
    const key = `${year}-${String(idx + 1).padStart(2, '0')}`;
    return {
      month: m,
      [lang === 'id' ? 'Terbit' : 'Issued']: filtered.filter(r => r.stage === 'issued' && String(r.issuedDate || '').startsWith(key)).length,
      [lang === 'id' ? 'PNBP' : 'PNBP']: filtered.filter(r => String(r.pnbpDate || '').startsWith(key)).length,
    };
  });
  const avgByType = ['akl', 'import', 'pengalihan', 'pi', 'bapeten'].map(type => {
    const done = filtered.filter(r => r.recordType === type && r.stage === 'issued');
    const avg = done.length ? Math.round(done.reduce((sum, r) => sum + ((getStageMetrics(r).totalMs || 0) / 86400000), 0) / done.length) : 0;
    return { name: REG_TYPE_LABELS[type]?.[lang === 'en' ? 'en' : 'id'] || type, [lang === 'id' ? 'Rata-rata Hari' : 'Avg Days']: avg };
  }).filter(x => x[lang === 'id' ? 'Rata-rata Hari' : 'Avg Days'] > 0);
  return (
    <div style={{display: 'grid', gap: '16px'}}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px'}}>
        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Komposisi Jenis Izin' : 'Permit Type Mix'}</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={typeData.length ? typeData : [{ name: '-', value: 0 }]} dataKey="value" nameKey="name" outerRadius={92} label>
                {(typeData.length ? typeData : [{ name: '-', value: 0 }]).map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip fmt={(v) => v} />} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Status Pipeline Regulatory' : 'Regulatory Pipeline Status'}</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stageData} margin={{top: 8, right: 16, left: 0, bottom: 62}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--ims-text-2)" interval={0} angle={-26} textAnchor="end" height={68} style={{fontSize: 10}} />
              <YAxis stroke="var(--ims-text-2)" allowDecimals={false} style={{fontSize: 10}} />
              <Tooltip content={<ChartTooltip fmt={(v) => v} />} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {stageData.map((entry, index) => <Cell key={entry.name} fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px'}}>
        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Izin Terbit Bulanan' : 'Monthly Issued Permits'}</div>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={issuedByMonth} margin={{top: 8, right: 16, left: 0, bottom: 8}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--ims-text-2)" style={{fontSize: 10}} />
              <YAxis stroke="var(--ims-text-2)" allowDecimals={false} style={{fontSize: 10}} />
              <Tooltip content={<ChartTooltip fmt={(v) => v} />} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
              <Bar dataKey={lang === 'id' ? 'Terbit' : 'Issued'} fill="#2f8f6f" radius={[3, 3, 0, 0]} />
              <Area dataKey="PNBP" fill="#d4af3733" stroke="#d4af37" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Rata-rata Selesai per Izin' : 'Average Completion by Permit'}</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={avgByType} layout="vertical" margin={{top: 8, right: 16, left: 88, bottom: 8}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" horizontal={false} />
              <XAxis type="number" stroke="var(--ims-text-2)" allowDecimals={false} style={{fontSize: 10}} />
              <YAxis type="category" dataKey="name" stroke="var(--ims-text-2)" width={84} style={{fontSize: 10}} />
              <Tooltip content={<ChartTooltip fmt={(v) => `${v} ${lang === 'id' ? 'hari' : 'days'}`} />} />
              <Bar dataKey={lang === 'id' ? 'Rata-rata Hari' : 'Avg Days'} fill="#5b8def" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ============== Regulatory Module ==============
function RegulatoryModule({ records, setRegRecords, aklRecords, setAklRecords, importRecords, setImportRecords, pengalihanRecords, setPengalihanRecords, piRecords, setPiRecords, units, t, lang, fmt, canEdit, data = [], setData, products = [] }) {
  const [tab, setTab] = useState('dashboard');
  const [regSearch, setRegSearch] = useState('');
  const [regYear, setRegYear] = useState('all');
  const safeAklRecords = Array.isArray(aklRecords) ? aklRecords : [];
  const safeImportRecords = Array.isArray(importRecords) ? importRecords : [];
  const safePengalihanRecords = Array.isArray(pengalihanRecords) ? pengalihanRecords : [];
  const safePiRecords = Array.isArray(piRecords) ? piRecords : [];
  const safeBapetenRecords = Array.isArray(records) ? records : [];
  const regYears = useMemo(() => {
    const years = new Set();
    [...safeAklRecords, ...safeImportRecords, ...safePengalihanRecords, ...safePiRecords, ...safeBapetenRecords].forEach(r => {
      ['registerDate', 'docsDate', 'submitDate', 'evalDate', 'pnbpDate', 'issuedDate', 'installDate'].forEach(k => {
        if (r?.[k]) years.add(String(r[k]).slice(0, 4));
      });
    });
    data.forEach(s => { if (s.issuedDate) years.add(String(s.issuedDate).slice(0, 4)); });
    return [...years].filter(Boolean).sort().reverse();
  }, [safeAklRecords, safeImportRecords, safePengalihanRecords, safePiRecords, safeBapetenRecords, data]);
  const titleByTab = {
    import: t.imp_title, akl: t.akl_title, bapeten: t.reg_tab_bapeten,
    pengalihan: t.pgl_title, pi: t.pi_title, dashboard: lang === 'id' ? 'Dashboard Regulatory' : 'Regulatory Dashboard',
  };
  const subtitleByTab = {
    import: t.imp_subtitle, akl: t.akl_subtitle, bapeten: t.reg_subtitle,
    pengalihan: t.pgl_subtitle, pi: t.pi_subtitle, dashboard: lang === 'id' ? 'Grafik status, jenis izin, dan performa waktu regulatory' : 'Regulatory status, permit type, and timing charts',
  };
  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_regulatory}</div>
        <h1 className="serif hero-title" style={{fontSize: '34px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>
          {titleByTab[tab]}
        </h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>
          {subtitleByTab[tab]}
        </div>
      </div>

      {!canEdit && <ReadOnlyBanner t={t} />}

      {/* Tabs - 5 stages with flow */}
      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {[
          { id: 'dashboard', label: lang === 'id' ? 'Dashboard' : 'Dashboard', icon: Activity, count: safeAklRecords.length + safeImportRecords.length + safePengalihanRecords.length + safePiRecords.length + safeBapetenRecords.length },
          { id: 'akl', label: t.reg_tab_akl, icon: FileCheck, count: safeAklRecords.length },
          { id: 'import', label: t.reg_tab_import, icon: FileSearch, count: safeImportRecords.length },
          { id: 'pengalihan', label: t.reg_tab_pengalihan, icon: Shield, count: safePengalihanRecords.length },
          { id: 'pi', label: t.reg_tab_pi, icon: Truck, count: safePiRecords.length },
          { id: 'bapeten', label: t.reg_tab_bapeten, icon: ShieldCheck, count: safeBapetenRecords.length },
        ].map(tb => {
          const Icon = tb.icon;
          const active = tab === tb.id;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '9px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11.5px', fontWeight: 500, color: active ? 'var(--ims-accent)' : 'var(--ims-text-2)', borderBottom: active ? '2px solid var(--ims-border)' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.03em', whiteSpace: 'nowrap'}}>
              <Icon size={13} strokeWidth={1.5} />
              {tb.label}
              <span style={{padding: '2px 7px', background: active ? 'var(--ims-accent)' : 'var(--ims-border)', color: active ? 'var(--ims-text)' : 'var(--ims-text-2)', fontSize: '10px', fontWeight: 600, borderRadius: '10px'}}>{tb.count}</span>
            </button>
          );
        })}
      </div>

      {/* Flow indicator */}
      <div style={{padding: '10px 14px', background: 'rgba(26,41,66,0.04)', marginBottom: '20px', fontSize: '11px', color: 'var(--ims-text)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
        <span style={{fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '10px', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Alur Regulasi:' : 'Regulatory Flow:'}</span>
        <span>1. Izin Edar Kemenkes (AKL)</span>
        <span style={{color: 'var(--ims-text-2)'}}>→</span>
        <span>2. Izin Impor BAPETEN</span>
        <span style={{color: 'var(--ims-text-2)'}}>→</span>
        <span>3. Izin Pengalihan BAPETEN</span>
        <span style={{color: 'var(--ims-text-2)'}}>→</span>
        <span>4. Izin Persetujuan Impor</span>
        <span style={{color: 'var(--ims-text-2)'}}>→</span>
        <span>5. Izin Pemanfaatan BAPETEN</span>
      </div>

      <div style={{display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '18px'}}>
        <div style={{position: 'relative', flex: '1 1 280px', minWidth: '220px'}}>
          <Search size={14} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ims-text-2)'}} />
          <input value={regSearch} onChange={e => setRegSearch(e.target.value)} placeholder={lang === 'id' ? 'Cari customer, produk, principal, nomor izin...' : 'Search customer, product, principal, permit number...'} style={{paddingLeft: '36px'}} />
        </div>
        <select value={regYear} onChange={e => setRegYear(e.target.value)} style={{width: '150px'}}>
          <option value="all">{lang === 'id' ? 'Semua Tahun' : 'All Years'}</option>
          {regYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <ModuleErrorBoundary
        name={`regulatory-${tab}`}
        resetKey={tab}
        title={lang === 'id' ? 'Panel Regulatory tidak bisa dibaca' : 'Regulatory panel cannot be read'}
        message={lang === 'id' ? 'Data lama di panel ini sudah diamankan agar halaman tidak blank putih. Tab lain tetap bisa dibuka.' : 'Legacy data in this panel is isolated so the page does not go blank.'}
      >
        {tab === 'akl' && <UniformRegPipeline records={safeAklRecords} setRecords={setAklRecords} recordType="akl" t={t} lang={lang} fmt={fmt} canEdit={canEdit} products={products} filterSearch={regSearch} filterYear={regYear} />}
        {tab === 'import' && <UniformRegPipeline records={safeImportRecords} setRecords={setImportRecords} recordType="import" t={t} lang={lang} fmt={fmt} canEdit={canEdit} products={products} filterSearch={regSearch} filterYear={regYear} />}
        {tab === 'pengalihan' && <UniformRegPipeline records={safePengalihanRecords} setRecords={setPengalihanRecords} recordType="pengalihan" t={t} lang={lang} fmt={fmt} canEdit={canEdit} products={products} filterSearch={regSearch} filterYear={regYear} />}
        {tab === 'pi' && <UniformRegPipeline records={safePiRecords} setRecords={setPiRecords} recordType="pi" t={t} lang={lang} fmt={fmt} canEdit={canEdit} products={products} filterSearch={regSearch} filterYear={regYear} />}
        {tab === 'bapeten' && <UniformRegPipeline records={safeBapetenRecords} setRecords={setRegRecords} recordType="bapeten" t={t} lang={lang} fmt={fmt} canEdit={canEdit} data={data} setData={setData} products={products} filterSearch={regSearch} filterYear={regYear} />}
        {tab === 'dashboard' && <RegulatoryDashboardCharts recordGroups={{ akl: safeAklRecords, import: safeImportRecords, pengalihan: safePengalihanRecords, pi: safePiRecords, bapeten: safeBapetenRecords }} filterSearch={regSearch} filterYear={regYear} t={t} lang={lang} />}
      </ModuleErrorBoundary>
    </div>
  );
}

// ============== Uniform Regulatory Pipeline (Phase 2a — replaces 5 separate components) ==============
// Duration timeline per record (dashboard durasi per stage)
function regStageLabel(stage, recordType, t, lang) {
  if (recordType === 'akl') {
    const id = {
      docs: 'Pengumpulan Dokumen',
      submit: 'Submit Permohonan',
      pnbp: 'PNBP Terbit',
      eval: 'Proses Evaluasi',
      resubmit: 'Tambahan Data',
      issued: 'Izin Edar Terbit',
    };
    const en = {
      docs: 'Document Collection',
      submit: 'Submit Application',
      pnbp: 'PNBP Issued',
      eval: 'Evaluation Process',
      resubmit: 'Additional Data',
      issued: 'Distribution License Issued',
    };
    return (lang === 'en' ? en : id)[stage] || stage;
  }
  return t['reg_stage_' + stage] || stage;
}

function RegDurationTimeline({ record, recordType, lang, t }) {
  const metrics = getStageMetrics(record);
  if (!metrics || !metrics.perStage || Object.keys(metrics.perStage).length === 0) return null;
  const maxMs = Math.max(...Object.values(metrics.perStage).filter(v => Number.isFinite(v)), 1);
  const stages = getRegStages(recordType);
  return (
    <div style={{marginBottom: '10px'}}>
      <div style={{fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>
        {lang === 'id' ? 'Durasi per Stage' : 'Duration per Stage'} · {lang === 'id' ? 'Total' : 'Total'}: {formatDuration(metrics.totalMs, lang)}
      </div>
      <div style={{display: 'flex', gap: '2px', height: '22px'}}>
        {stages.map(st => {
          const ms = metrics.perStage[st] || 0;
          const pct = Math.max(ms / maxMs * 100, ms > 0 ? 8 : 0);
          const isCurrent = metrics.currentStage === st;
          const color = REG_STAGE_COLORS[st] || '#94a3b8';
          if (ms === 0 && !isCurrent) return <div key={st} style={{flex: '0 0 2px', background: 'var(--ims-bg-card-2)'}} />;
          return (
            <div key={st} style={{flex: `${Math.max(pct, 6)} 0 0`, background: color + (isCurrent ? '40' : '25'), borderTop: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'}} title={`${regStageLabel(st, recordType, t, lang)}: ${formatDuration(ms, lang)}`}>
              <span style={{fontSize: '8px', color, fontWeight: 600, whiteSpace: 'nowrap'}}>{formatDuration(ms, lang)}</span>
              {isCurrent && <span style={{position: 'absolute', top: '0', right: '2px', fontSize: '7px', color}}>●</span>}
            </div>
          );
        })}
      </div>
      <div style={{display: 'flex', gap: '2px', marginTop: '1px'}}>
        {stages.map(st => (
          <div key={st} style={{flex: 1, fontSize: '7px', textAlign: 'center', color: 'var(--ims-text-2)', letterSpacing: '0.05em', textTransform: 'uppercase'}}>{regStageLabel(st, recordType, t, lang).split(' ')[0].slice(0, 6)}</div>
        ))}
      </div>
    </div>
  );
}

function UniformRegPipeline({ records, setRecords, recordType, t, lang, fmt = (v) => v?.toLocaleString?.('id-ID') || v, canEdit, data = [], setData, products = [], units = [], employees = {}, filterSearch = '', filterYear = 'all' }) {
  const authority = REG_AUTHORITY[recordType] || 'BAPETEN';
  const typeLabel = REG_TYPE_LABELS[recordType]?.[lang === 'en' ? 'en' : 'id'] || recordType;
  const safeRecords = Array.isArray(records) ? records : [];
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [sortBy, setSortBy] = useState('date_desc');
  const stages = getRegStages(recordType);

  // Normalize records defensively (runtime migration)
  const normRecords = useMemo(() => safeRecords.map(r => migrateRegRecord(r, recordType)).filter(Boolean), [safeRecords, recordType]);

  // One-time persist if migration changed anything
  useEffect(() => {
    const baseRecords = Array.isArray(records) ? records : [];
    const migrated = baseRecords.map(r => migrateRegRecord(r, recordType)).filter(Boolean);
    if (JSON.stringify(migrated) !== JSON.stringify(baseRecords)) {
      setRecords(migrated);
    }
  }, []); // eslint-disable-line

  // For bapeten: pull units from SPH PO
  const deliveredUnits = useMemo(() => recordType === 'bapeten' ? data
    .filter(s => s.poStatus === 'issued')
    .map(s => ({ id: s.id, customer: s.customer, modality: s.modality, subModality: s.subModality || '', sphNo: s.sphNo }))
    .sort((a, b) => a.customer.localeCompare(b.customer)) : [], [data, recordType]);

  // PI expiry enrichment
  const piToday = new Date('2026-05-16');
  const enriched = useMemo(() => recordType === 'pi' ? normRecords.map(r => {
    if (r.stage !== 'issued' || !r.expiredDate) return { ...r, daysRemaining: null, computedStatus: r.stage === 'issued' ? (r.status || 'active') : null };
    const expDate = new Date(r.expiredDate);
    const daysRemaining = Math.ceil((expDate - piToday) / (1000 * 60 * 60 * 24));
    let computedStatus = r.status || 'active';
    if (computedStatus !== 'used' && daysRemaining < 0) computedStatus = 'expired';
    return { ...r, daysRemaining, computedStatus };
  }) : normRecords, [normRecords, recordType]);

  const filteredRecords = useMemo(() => {
    const q = String(filterSearch || '').trim().toLowerCase();
    const dateFields = ['registerDate', 'docsDate', 'submitDate', 'evalDate', 'resubmitDate', 'pnbpDate', 'issuedDate', 'installDate', 'expiredDate'];
    return enriched.filter(r => {
      const text = [
        r.id, r.customer, r.product, r.principal, r.principalCountry, r.modality, r.subModality,
        r.importPermitNo, r.permitNo, r.piNo, r.aklNo, r.stage, r.note, r.destination, r.shipment, r.items,
      ].filter(Boolean).join(' ').toLowerCase();
      const matchSearch = !q || text.includes(q);
      const matchYear = filterYear === 'all' || dateFields.some(k => String(r?.[k] || '').startsWith(filterYear));
      return matchSearch && matchYear;
    });
  }, [enriched, filterSearch, filterYear]);

  const sortedRecords = useMemo(() => {
    const arr = [...filteredRecords];
    const dateKey = recordType === 'akl' ? 'registerDate' : (recordType === 'pengalihan' ? 'submitDate' : 'docsDate');
    if (sortBy === 'date_desc') return arr.sort((a, b) => (b[dateKey] || b.issuedDate || '').localeCompare(a[dateKey] || a.issuedDate || ''));
    if (sortBy === 'date_asc') return arr.sort((a, b) => (a[dateKey] || a.issuedDate || '').localeCompare(b[dateKey] || b.issuedDate || ''));
    if (sortBy === 'stage') return arr.sort((a, b) => stages.indexOf(b.stage) - stages.indexOf(a.stage));
    if (sortBy === 'principal') return arr.sort((a, b) => (a.principal || a.customer || '').localeCompare(b.principal || b.customer || ''));
    return arr;
  }, [filteredRecords, sortBy, recordType]);

  const totals = useMemo(() => {
    const active = filteredRecords.filter(r => r.stage !== 'issued').length;
    const issued = filteredRecords.filter(r => r.stage === 'issued').length;
    const issuedRecs = filteredRecords.filter(r => r.stage === 'issued');
    const avgMs = issuedRecs.length > 0 ? issuedRecs.reduce((sum, r) => sum + (getStageMetrics(r).totalMs || 0), 0) / issuedRecs.length : 0;
    const avgDays = Math.round(avgMs / 86400000);
    return { active, issued, avgDays };
  }, [filteredRecords]);

  const byStage = useMemo(() => stages.map(stage => ({
    stage, label: regStageLabel(stage, recordType, t, lang), color: REG_STAGE_COLORS[stage],
    count: filteredRecords.filter(r => r.stage === stage).length,
  })), [filteredRecords, t, lang, recordType, stages]);

  const historyRows = useMemo(() => filteredRecords.flatMap(r => (Array.isArray(r.stageHistory) ? r.stageHistory : []).map(h => ({ ...h, record: r })))
    .sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')))
    .slice(0, 8), [filteredRecords]);

  const handleSave = (rec) => {
    setRecords(prev => {
      const basePrev = Array.isArray(prev) ? prev : [];
      const migrated = migrateRegRecord(rec, recordType);
      const exists = basePrev.find(r => r.id === migrated.id);
      const prevRec = exists ? migrateRegRecord(exists, recordType) : null;
      // Append stageHistory on stage change via modal
      let final = migrated;
      if (prevRec && prevRec.stage !== final.stage) {
        final = appendStageHistoryEntry(final, prevRec.stage, final.stage, 'user');
      }
      // Fire PNBP notif if transitioning TO pnbp (Phase 1.5 #11 uniform)
      if (final.stage === 'pnbp' && prevRec?.stage !== 'pnbp') {
        try {
          notify({ role: 'finance' }, {
            type: 'pnbp_due',
            message: `PNBP ${typeLabel} ${final.product || final.principal || final.customer || final.piNo || final.id} terbit Rp ${(final.pnbpAmount || REG_PNBP_DEFAULT[recordType] || 5000000).toLocaleString('id-ID')}. Segera lakukan pembayaran.`,
            link: { view: 'regulatory' }
          });
        } catch {}
      }
      if (recordType === 'bapeten' && final.stage === 'issued' && typeof setData === 'function') {
        const issuedMs = parseSafeDateMs(final.issuedDate);
        setData(prevData => prevData.map(s => s.customer === final.customer ? {
          ...s,
          sphWorkflowStatus: 'utilization_permit_done',
          utilizationPermitDoneAt: issuedMs !== null ? new Date(issuedMs).toISOString() : new Date().toISOString(),
          nextAction: 'Project selesai sampai izin pemanfaatan',
        } : s));
      }
      return exists ? basePrev.map(r => r.id === final.id ? final : r) : [...basePrev, final];
    });
    setModalOpen(false); setEditingRecord(null);
  };

  const [deleteId, setDeleteId] = useState(null);
  const handleDelete = (id) => { if (canEdit) setDeleteId(id); };
  const confirmDelete = () => { setRecords(prev => (Array.isArray(prev) ? prev : []).filter(r => r.id !== deleteId)); setDeleteId(null); };

  const advanceStage = (id) => {
    if (!canEdit) return;
    setRecords(prev => (Array.isArray(prev) ? prev : []).map(r => {
      if (r.id !== id) return r;
      const rec = migrateRegRecord(r, recordType);
      const currentIdx = stages.indexOf(rec.stage);
      if (currentIdx >= stages.length - 1) return rec;
      const nextStage = stages[currentIdx + 1];
      const today = new Date().toISOString().split('T')[0];
      const updates = { stage: nextStage, stageIdx: currentIdx + 1 };
      const dateField = REG_STAGE_DATE_FIELD[nextStage];
      if (dateField) updates[dateField] = today;
      if (nextStage === 'pnbp') {
        updates.pnbpAmount = updates.pnbpAmount || REG_PNBP_DEFAULT[recordType] || 5000000;
        try {
          notify({ role: 'finance' }, {
            type: 'pnbp_due',
            message: `PNBP ${typeLabel} ${rec.product || rec.principal || rec.customer || rec.piNo || rec.id} terbit Rp ${(updates.pnbpAmount).toLocaleString('id-ID')}. Segera lakukan pembayaran.`,
            link: { view: 'regulatory' }
          });
        } catch {}
      }
      if (nextStage === 'issued') {
        const prefix = REG_PERMIT_PREFIX[recordType] || 'REG';
        const yr = new Date().getFullYear();
        const rnd = Math.floor(Math.random() * 90000 + 10000);
        if (recordType === 'akl') updates.aklNo = updates.aklNo || `AKL ${Math.floor(Math.random() * 90000000000 + 10000000000)}`;
        else if (recordType === 'import') updates.importPermitNo = updates.importPermitNo || `${prefix}/${yr}/${rnd}`;
        else if (recordType === 'pengalihan') updates.permitNo = updates.permitNo || `${prefix}/${yr}/${rnd}`;
        else if (recordType === 'pi') {
          updates.piNo = updates.piNo || `${prefix}/${yr}/${rnd}`;
          if (!rec.expiredDate) {
            const exp = new Date(today);
            exp.setDate(exp.getDate() + 21);
            updates.expiredDate = exp.toISOString().split('T')[0];
          }
          updates.status = updates.status || 'active';
        }
        if (recordType === 'bapeten' && typeof setData === 'function') {
          setData(prev => prev.map(s => s.customer === rec.customer ? {
            ...s,
            sphWorkflowStatus: 'utilization_permit_done',
            utilizationPermitDoneAt: new Date().toISOString(),
            nextAction: 'Project selesai sampai izin pemanfaatan',
          } : s));
        }
      }
      const withUpdates = { ...rec, ...updates };
      return appendStageHistoryEntry(withUpdates, rec.stage, nextStage, 'user');
    }));
  };

  // PI: mark as used
  const markUsed = (id) => {
    if (!canEdit) return;
    setRecords(prev => (Array.isArray(prev) ? prev : []).map(r => r.id === id ? { ...r, status: 'used' } : r));
  };

  // Render record header based on type
  const renderHeader = (r) => {
    const principalColor = r.principal === 'Angell' ? '#0f7a5a' : r.principal === 'Innocare' ? '#b8860b' : r.principal === 'ANKE' ? '#c03030' : r.principal === 'SG Healthcare' ? '#1a4d8a' : '#7b3fb5';
    if (recordType === 'akl' || recordType === 'import') return (
      <div style={{flex: '1 1 320px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap'}}>
          <span style={{padding: '2px 8px', background: principalColor + '20', color: principalColor, fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em'}}>{r.principal}</span>
          <span style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>· {r.principalCountry}</span>
          {recordType === 'akl' && r.productClass && <span style={{padding: '2px 7px', fontSize: '9px', background: 'var(--ims-border)', color: 'var(--ims-text)', fontWeight: 600}}>{lang === 'id' ? 'Kelas' : 'Class'} {r.productClass}</span>}
        </div>
        <div style={{fontSize: '13px', fontWeight: 600}}>{r.product}</div>
        {recordType === 'akl' && r.registerDate && <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '4px'}} className="mono">{lang === 'id' ? 'Registrasi' : 'Registered'}: {r.registerDate}{r.targetDate ? ` · Target: ${r.targetDate}` : ''}</div>}
        {recordType === 'akl' && r.aklNo && <div style={{fontSize: '11px', color: 'var(--ims-accent-2)', marginTop: '4px', fontWeight: 600}} className="mono">✓ {r.aklNo}</div>}
        {recordType === 'import' && r.importPermitNo && <div style={{fontSize: '11px', color: 'var(--ims-accent-2)', marginTop: '4px', fontWeight: 600}} className="mono">✓ {r.importPermitNo}</div>}
      </div>
    );
    if (recordType === 'pengalihan') return (
      <div style={{flex: '1 1 320px'}}>
        <div style={{fontSize: '13px', fontWeight: 600}}>{r.customer}</div>
        <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{r.modality} · {r.subModality}</div>
        <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px'}}>📍 {lang === 'id' ? 'Tujuan' : 'Destination'}: {r.destination}</div>
        {r.permitNo && <div style={{fontSize: '11px', color: 'var(--ims-accent-2)', marginTop: '4px', fontWeight: 600}} className="mono">✓ {r.permitNo}</div>}
      </div>
    );
    if (recordType === 'bapeten') return (
      <div style={{flex: '1 1 280px'}}>
        <div style={{fontSize: '13px', fontWeight: 600}}>{r.customer}</div>
        <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{r.modality} · {r.subModality}</div>
        {r.installDate && <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px'}} className="mono">{lang === 'id' ? 'Instalasi' : 'Installed'}: {r.installDate}</div>}
      </div>
    );
    if (recordType === 'pi') return (
      <div style={{flex: '1 1 320px'}}>
        {r.piNo && <div className="mono" style={{fontSize: '13px', fontWeight: 600}}>{r.piNo}</div>}
        <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'Principal' : 'Principal'}: <strong>{r.principal}</strong> · {lang === 'id' ? 'Shipment' : 'Shipment'}: <span className="mono">{r.shipment}</span></div>
        {r.items && <div style={{fontSize: '11px', color: 'var(--ims-text)', marginTop: '4px'}}>📦 {r.items}</div>}
      </div>
    );
    return <div style={{flex: '1 1 320px'}}><div style={{fontSize: '13px', fontWeight: 600}}>{r.product || r.customer || r.id}</div></div>;
  };

  return (
    <div>
      {/* Info banner with authority */}
      <div style={{padding: '10px 14px', background: 'rgba(26,41,66,0.06)', borderLeft: '3px solid var(--ims-border)', marginBottom: '20px', fontSize: '12px', color: 'var(--ims-text)', display: 'flex', alignItems: 'center', gap: '10px'}}>
        <Shield size={14} strokeWidth={1.5} style={{flexShrink: 0}} />
        <span><strong>{typeLabel}</strong> — {lang === 'id' ? 'Instansi' : 'Authority'}: <strong>{authority}</strong>{recordType === 'akl' ? (lang === 'id' ? ' (Regalkes)' : ' (Regalkes)') : ''}{recordType === 'pi' ? (lang === 'id' ? ' · Berlaku 21 hari kerja' : ' · Valid 21 working days') : ''}</span>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <div className="card-pad">
          <div className="lbl-tag">{t.reg_total_pending}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent)'}}>{totals.active}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{t.reg_total_issued}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent-2)'}}>{totals.issued}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{t.reg_avg_days}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totals.avgDays} <span style={{fontSize: '12px', color: 'var(--ims-text-2)'}}>{t.days}</span></div>
        </div>
      </div>

      {/* Pipeline visualization - 6 uniform stages */}
      <div className="card" style={{marginBottom: '22px'}}>
        <div className="card-title">{lang === 'id' ? `Pipeline ${typeLabel}` : `${typeLabel} Pipeline`}</div>
        <div style={{display: 'grid', gridTemplateColumns: `repeat(${stages.length}, 1fr)`, gap: '2px'}}>
          {byStage.map((s, i) => (
            <div key={s.stage} style={{padding: '12px 8px', background: s.color + '15', borderTop: `3px solid ${s.color}`}}>
              <div style={{fontSize: '8px', letterSpacing: '0.12em', color: s.color, textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px', lineHeight: 1.3}}>{i + 1} · {s.label}</div>
              <div className="serif" style={{fontSize: '24px', fontWeight: 500, color: s.color, lineHeight: 1}}>{s.count}</div>
              <div style={{fontSize: '9px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{t.project_count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Records list */}
      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
          <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{lang === 'id' ? 'Daftar Permohonan' : 'Applications'}</div>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <SortToggle value={sortBy} onChange={setSortBy} lang={lang} options={[
              {value: 'date_desc', label: lang === 'id' ? 'Terbaru' : 'Newest'},
              {value: 'date_asc', label: lang === 'id' ? 'Terlama' : 'Oldest'},
              {value: 'stage', label: lang === 'id' ? 'Stage Terakhir' : 'Latest Stage'},
              ...(recordType === 'akl' || recordType === 'import' ? [{value: 'principal', label: 'Principal'}] : []),
            ]} />
            {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
          </div>
        </div>
        {sortedRecords.map(r => {
          const stageIdx = stages.indexOf(r.stage);
          const stageColor = REG_STAGE_COLORS[r.stage] || '#94a3b8';
          const isExpiring = recordType === 'pi' && r.computedStatus === 'active' && r.daysRemaining != null && r.daysRemaining <= 5;
          return (
            <div key={r.id} style={{padding: '16px 18px', borderTop: '1px solid var(--ims-border)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '12px'}}>
                {renderHeader(r)}
                <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px'}}>
                  <span style={{padding: '4px 10px', fontSize: '10px', background: stageColor + '25', color: stageColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{regStageLabel(r.stage, recordType, t, lang)}</span>
                  {r.pnbpAmount && <div style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>PNBP: <span className="mono">{typeof fmt === 'function' ? fmt(r.pnbpAmount) : r.pnbpAmount?.toLocaleString?.('id-ID')}</span></div>}
                  {recordType === 'akl' && r.stage !== 'issued' && r.workingDaysRemaining != null && (
                    <div style={{fontSize: '11px', color: r.workingDaysRemaining <= 0 ? '#c03030' : (r.workingDaysRemaining < 10 ? 'var(--ims-gold)' : 'var(--ims-accent-2)'), fontWeight: 600}}>
                      {r.workingDaysRemaining <= 0 ? `⚠ ${lang === 'id' ? 'Overdue' : 'Overdue'}` : `${r.workingDaysRemaining} ${t.days} ${lang === 'id' ? 'tersisa' : 'left'}`}
                    </div>
                  )}
                  {recordType === 'pi' && r.stage === 'issued' && r.computedStatus && (
                    <span style={{padding: '3px 8px', fontSize: '10px', background: (r.computedStatus === 'active' ? 'var(--ims-accent-2)' : r.computedStatus === 'used' ? '#5b87b8' : '#c03030') + '25', color: r.computedStatus === 'active' ? 'var(--ims-accent-2)' : r.computedStatus === 'used' ? '#5b87b8' : '#c03030', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t['pi_status_' + r.computedStatus] || r.computedStatus}</span>
                  )}
                  {recordType === 'pi' && r.computedStatus === 'active' && r.daysRemaining != null && (
                    <div style={{fontSize: '11px', color: isExpiring ? '#c03030' : 'var(--ims-text-2)', fontWeight: isExpiring ? 700 : 500}}>
                      {isExpiring && '⚠ '}{r.daysRemaining} {t.days} {lang === 'id' ? 'tersisa' : 'left'}
                    </div>
                  )}
                  {canEdit && (
                    <div style={{display: 'flex', gap: '4px'}}>
                      <button onClick={() => { setEditingRecord(r); setModalOpen(true); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit'}}><Edit2 size={11} /></button>
                      <button onClick={() => handleDelete(r.id)} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>
                    </div>
                  )}
                </div>
              </div>
              {/* Uniform 6-stage progress bar */}
              <div style={{display: 'flex', gap: '2px', marginBottom: '10px'}}>
                {stages.map((s, i) => (
                  <div key={s} style={{flex: 1, height: '6px', background: i <= stageIdx ? REG_STAGE_COLORS[s] : 'var(--ims-bg-card-2)', transition: 'background 0.3s'}} />
                ))}
              </div>
              {/* Duration timeline */}
              <RegDurationTimeline record={r} recordType={recordType} lang={lang} t={t} />
              {/* Date details */}
              <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '10px', color: 'var(--ims-text-2)', marginBottom: '8px'}}>
                {r.docsDate && <span>📋 Docs: <span className="mono">{r.docsDate}</span></span>}
                {r.submitDate && <span>📤 Submit: <span className="mono">{r.submitDate}</span></span>}
                {r.evalDate && <span>🔍 Eval: <span className="mono">{r.evalDate}</span></span>}
                {r.resubmitDate && <span>🔄 Resubmit: <span className="mono">{r.resubmitDate}</span></span>}
                {r.pnbpDate && <span>💰 PNBP: <span className="mono">{r.pnbpDate}</span></span>}
                {r.issuedDate && <span style={{color: 'var(--ims-accent-2)', fontWeight: 600}}>✅ Issued: <span className="mono">{r.issuedDate}</span></span>}
                {recordType === 'pi' && r.expiredDate && <span>⏰ Expired: <span className="mono">{r.expiredDate}</span></span>}
              </div>
              {r.note && <div style={{padding: '8px 10px', background: 'var(--ims-bg-card-2)', fontSize: '11px', fontStyle: 'italic', color: 'var(--ims-text)', marginBottom: '8px'}}>📝 {r.note}</div>}
              {r.attachmentUrl && <div style={{marginBottom: '8px'}}><LinkAttachment url={r.attachmentUrl} label={lang === 'id' ? '📎 Lampiran Izin' : '📎 Permit Attachment'} lang={lang} /></div>}
              <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                {canEdit && r.stage !== 'issued' && (
                  <button onClick={() => advanceStage(r.id)} style={{padding: '6px 14px', fontSize: '11px', background: 'var(--ims-bg-alt)', color: 'var(--ims-text)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em', fontWeight: 500}}>
                    {t.reg_advance || (lang === 'id' ? 'Tahap Berikutnya' : 'Next Stage')} →
                  </button>
                )}
                {canEdit && recordType === 'pi' && r.stage === 'issued' && r.computedStatus === 'active' && (
                  <button onClick={() => markUsed(r.id)} style={{padding: '6px 14px', fontSize: '11px', background: '#5b87b8', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em', fontWeight: 500}}>
                    {lang === 'id' ? 'Tandai Digunakan' : 'Mark as Used'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {safeRecords.length === 0 && <div className="empty-state">{t.no_data}</div>}
      </div>
      {modalOpen && <RegulatoryRecordModal record={editingRecord} recordType={recordType} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} units={recordType === 'bapeten' ? deliveredUnits : []} products={products} />}
      <ConfirmDialog open={!!deleteId} title={lang === 'id' ? `Hapus ${typeLabel}?` : `Delete ${typeLabel}?`} message={lang === 'id' ? 'Yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to delete this record? This action cannot be undone.'} onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} danger lang={lang} />
    </div>
  );
}

// ============== Reusable Regulatory CRUD Modal ==============
function RegulatoryRecordModal({ record, recordType, onSave, onClose, t, lang, units = [], products = [] }) {
  // recordType: 'import' | 'akl' | 'bapeten' | 'pengalihan' | 'pi'
  const [form, setForm] = useState(record || getDefaultRecord(recordType));
  const titleKey = record ? `reg_modal_edit_${recordType}` : `reg_modal_add_${recordType}`;
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const stageOptions = getRegStages(recordType);

  function getDefaultRecord(type) {
    const today = new Date().toISOString().split('T')[0];
    const baseId = type + '_' + Date.now();
    if (type === 'import') {
      return { id: baseId, principal: '', principalCountry: '', product: '', stage: 'docs', stageIdx: 0,
        registerDate: today, preregistDate: today, docsDate: null, submitDate: null, evalDate: null, issuedDate: null,
        importPermitNo: null, pic: 'Ananda Rifki Bayu Saputra', note: '', attachmentUrl: '' };
    }
    if (type === 'akl') {
      return { id: baseId, principal: '', principalCountry: '', product: '', productClass: 'B',
        stage: 'docs', stageIdx: 0, registerDate: today,
        targetDate: '', daysElapsed: 0, workingDaysRemaining: 30,
        preregistDate: today, docsDate: null, submitDate: null,
        pnbpDate: null, pnbpAmount: null, evalDate: null,
        fixDate: null, issuedDate: null, aklNo: null,
        pic: 'Ananda Rifki Bayu Saputra', note: '', attachmentUrl: '' };
    }
    if (type === 'bapeten') {
      return { id: baseId, customer: '', modality: 'CT Scan', subModality: '',
        installDate: today, stage: 'docs', stageIdx: 0,
        docsComplete: false, submitDate: null, evalDate: null,
        pnbpAmount: null, issuedDate: null, pic: 'Ananda Rifki Bayu Saputra', note: '', attachmentUrl: '' };
    }
    if (type === 'pengalihan') {
      return { id: baseId, customer: '', modality: 'CT Scan', subModality: '', destination: '',
        stage: 'docs', stageIdx: 0, docsDate: today, submitDate: null, evalDate: null, resubmitDate: null, pnbpDate: null, issuedDate: null,
        permitNo: null, pic: 'Ananda Rifki Bayu Saputra', note: '',
        stageHistory: [{ from: null, to: 'docs', by: 'user', at: new Date().toISOString() }], _regV41: true };
    }
    if (type === 'pi') {
      return { id: baseId, piNo: '', principal: '', shipment: '', items: '',
        stage: 'docs', stageIdx: 0,
        docsDate: today, submitDate: null, evalDate: null, resubmitDate: null, pnbpDate: null,
        issuedDate: null, expiredDate: null,
        status: 'active', note: '', attachmentUrl: '',
        stageHistory: [{ from: null, to: 'docs', by: 'user', at: new Date().toISOString() }], _regV41: true };
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
            {stageOptions.map(s => <option key={s} value={s}>{regStageLabel(s, recordType, t, lang)}</option>)}
          </select>
        </Field>
        <Field label={t.imp_product} full><input value={form.product} onChange={e => update('product', e.target.value)} /></Field>
        <Field label="Tgl. Pra-Registrasi"><input type="date" value={form.preregistDate || ''} onChange={e => update('preregistDate', e.target.value)} /></Field>
        <Field label="Tgl. Pengumpulan Dokumen"><input type="date" value={form.docsDate || ''} onChange={e => update('docsDate', e.target.value)} /></Field>
        <Field label="Tgl. Submit"><input type="date" value={form.submitDate || ''} onChange={e => update('submitDate', e.target.value)} /></Field>
        <Field label="Tgl. Evaluasi"><input type="date" value={form.evalDate || ''} onChange={e => update('evalDate', e.target.value)} /></Field>
        <Field label={lang === 'id' ? 'Tgl. Resubmit' : 'Resubmit Date'}><input type="date" value={form.resubmitDate || ''} onChange={e => update('resubmitDate', e.target.value)} /></Field>
        <Field label="Tgl. PNBP"><input type="date" value={form.pnbpDate || ''} onChange={e => update('pnbpDate', e.target.value)} /></Field>
        <Field label={lang === 'id' ? 'Jumlah PNBP (Rp)' : 'PNBP Amount (Rp)'}><input type="number" value={form.pnbpAmount || ''} onChange={e => update('pnbpAmount', parseFloat(e.target.value) || null)} /></Field>
        <Field label="Tgl. Izin Terbit"><input type="date" value={form.issuedDate || ''} onChange={e => update('issuedDate', e.target.value)} /></Field>
        <Field label={t.imp_no}><input value={form.importPermitNo || ''} onChange={e => update('importPermitNo', e.target.value)} placeholder="BAPETEN/IMP/2026/00xxx" /></Field>
        <Field label={t.crud_pic}><input value={form.pic} onChange={e => update('pic', e.target.value)} /></Field>
        <Field label={t.reg_attachment} full><input type="url" value={form.attachmentUrl || ''} onChange={e => update('attachmentUrl', e.target.value)} placeholder="https://drive.google.com/... (Surat Persetujuan Impor)" /></Field>
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
            {stageOptions.map(s => <option key={s} value={s}>{regStageLabel(s, recordType, t, lang)}</option>)}
          </select>
        </Field>
        <Field label={t.akl_register_date}><input type="date" value={form.registerDate || ''} onChange={e => update('registerDate', e.target.value)} /></Field>
        <Field label={t.akl_target_date}><input type="date" value={form.targetDate || ''} onChange={e => update('targetDate', e.target.value)} /></Field>
        <Field label="Tgl. Pra-Registrasi"><input type="date" value={form.preregistDate || ''} onChange={e => update('preregistDate', e.target.value)} /></Field>
        <Field label="Tgl. Pengumpulan Dokumen"><input type="date" value={form.docsDate || ''} onChange={e => update('docsDate', e.target.value)} /></Field>
        <Field label="Tgl. Submit"><input type="date" value={form.submitDate || ''} onChange={e => update('submitDate', e.target.value)} /></Field>
        <Field label="Tgl. PNBP"><input type="date" value={form.pnbpDate || ''} onChange={e => update('pnbpDate', e.target.value)} /></Field>
        <Field label={lang === 'id' ? 'Jumlah PNBP (Rp)' : 'PNBP Amount (Rp)'}><input type="number" value={form.pnbpAmount || ''} onChange={e => update('pnbpAmount', parseFloat(e.target.value) || null)} /></Field>
        <Field label="Tgl. Evaluasi"><input type="date" value={form.evalDate || ''} onChange={e => update('evalDate', e.target.value)} /></Field>
        <Field label="Tgl. Perbaikan / Resubmit"><input type="date" value={form.resubmitDate || form.fixDate || ''} onChange={e => { update('resubmitDate', e.target.value); update('fixDate', e.target.value); }} /></Field>
        <Field label="Tgl. AKL Terbit"><input type="date" value={form.issuedDate || ''} onChange={e => update('issuedDate', e.target.value)} /></Field>
        <Field label={t.akl_akl_no}><input value={form.aklNo || ''} onChange={e => update('aklNo', e.target.value)} placeholder="AKL 20xxxxxxxxx" /></Field>
        <Field label="Sisa Hari Kerja"><input type="number" value={form.workingDaysRemaining || 0} onChange={e => update('workingDaysRemaining', parseInt(e.target.value) || 0)} /></Field>
        <Field label={t.crud_pic}><input value={form.pic} onChange={e => update('pic', e.target.value)} /></Field>
        <Field label={t.reg_attachment} full><input type="url" value={form.attachmentUrl || ''} onChange={e => update('attachmentUrl', e.target.value)} placeholder="https://drive.google.com/... (AKL Kemenkes terbit)" /></Field>
        <Field label={t.akl_note} full><textarea rows={2} value={form.note || ''} onChange={e => update('note', e.target.value)} /></Field>
      </>
    );

    if (recordType === 'bapeten') return (
      <>
        <UnitPickerField units={units} customer={form.customer} modality={form.modality} subModality={form.subModality} lang={lang} onPick={u => setForm(prev => ({ ...prev, customer: u.customer, modality: u.modality || prev.modality, subModality: u.subModality || '' }))} />
        <Field label={t.customer} full><input value={form.customer} onChange={e => update('customer', e.target.value)} /></Field>
        <Field label={t.modality}>
          <select value={form.modality} onChange={e => update('modality', e.target.value)}>
            {[...new Set([...products.map(p => p.modality).filter(Boolean), ...Object.keys(MODALITY_COLORS), form.modality].filter(Boolean))].sort().map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <Field label={lang === 'id' ? 'Tipe' : 'Type'}><input value={form.subModality} onChange={e => update('subModality', e.target.value)} /></Field>
        <Field label="Tgl. Instalasi"><input type="date" value={form.installDate} onChange={e => update('installDate', e.target.value)} /></Field>
        <Field label="Stage">
          <select value={form.stage} onChange={e => update('stage', e.target.value)}>
            {stageOptions.map(s => <option key={s} value={s}>{regStageLabel(s, recordType, t, lang)}</option>)}
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
        <Field label={lang === 'id' ? 'Tgl. Resubmit' : 'Resubmit Date'}><input type="date" value={form.resubmitDate || ''} onChange={e => update('resubmitDate', e.target.value)} /></Field>
        <Field label={lang === 'id' ? 'Jumlah PNBP (Rp)' : 'PNBP Amount (Rp)'}><input type="number" value={form.pnbpAmount || ''} onChange={e => update('pnbpAmount', parseFloat(e.target.value) || null)} /></Field>
        <Field label="Tgl. Izin Terbit"><input type="date" value={form.issuedDate || ''} onChange={e => update('issuedDate', e.target.value)} /></Field>
        <Field label={t.crud_pic}><input value={form.pic || ''} onChange={e => update('pic', e.target.value)} /></Field>
        <Field label={t.reg_attachment} full><input type="url" value={form.attachmentUrl || ''} onChange={e => update('attachmentUrl', e.target.value)} placeholder="https://drive.google.com/... (Izin Pemanfaatan terbit)" /></Field>
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
        <Field label={lang === 'id' ? 'Tipe' : 'Type'}><input value={form.subModality} onChange={e => update('subModality', e.target.value)} /></Field>
        <Field label={t.pgl_destination}><input value={form.destination} onChange={e => update('destination', e.target.value)} /></Field>
        <Field label="Stage">
          <select value={form.stage} onChange={e => update('stage', e.target.value)}>
            {stageOptions.map(s => <option key={s} value={s}>{regStageLabel(s, recordType, t, lang)}</option>)}
          </select>
        </Field>
        <Field label="Tgl. Submit"><input type="date" value={form.submitDate || ''} onChange={e => update('submitDate', e.target.value)} /></Field>
        <Field label="Tgl. Evaluasi"><input type="date" value={form.evalDate || ''} onChange={e => update('evalDate', e.target.value)} /></Field>
        <Field label={lang === 'id' ? 'Tgl. Resubmit' : 'Resubmit Date'}><input type="date" value={form.resubmitDate || ''} onChange={e => update('resubmitDate', e.target.value)} /></Field>
        <Field label="Tgl. PNBP"><input type="date" value={form.pnbpDate || ''} onChange={e => update('pnbpDate', e.target.value)} /></Field>
        <Field label={lang === 'id' ? 'Jumlah PNBP (Rp)' : 'PNBP Amount (Rp)'}><input type="number" value={form.pnbpAmount || ''} onChange={e => update('pnbpAmount', parseFloat(e.target.value) || null)} /></Field>
        <Field label="Tgl. Izin Terbit"><input type="date" value={form.issuedDate || ''} onChange={e => update('issuedDate', e.target.value)} /></Field>
        <Field label={t.pgl_no}><input value={form.permitNo || ''} onChange={e => update('permitNo', e.target.value)} placeholder="BAPETEN/PGL/2026/0xxxx" /></Field>
        <Field label={t.crud_pic}><input value={form.pic || ''} onChange={e => update('pic', e.target.value)} /></Field>
        <Field label={t.akl_note} full><textarea rows={2} value={form.note || ''} onChange={e => update('note', e.target.value)} /></Field>
      </>
    );

    if (recordType === 'pi') return (
      <>
        <Field label={t.pi_no}><input value={form.piNo || ''} onChange={e => update('piNo', e.target.value)} placeholder="BAPETEN/PI/2026/00xxx" /></Field>
        <Field label={t.pi_principal}><input value={form.principal || ''} onChange={e => update('principal', e.target.value)} /></Field>
        <Field label="Stage">
          <select value={form.stage || 'docs'} onChange={e => update('stage', e.target.value)}>
            {stageOptions.map(s => <option key={s} value={s}>{regStageLabel(s, recordType, t, lang)}</option>)}
          </select>
        </Field>
        <Field label={t.pi_shipment} full><input value={form.shipment || ''} onChange={e => update('shipment', e.target.value)} placeholder="ANGEL-SHP-2026-xx-xx" /></Field>
        <Field label={t.pi_items} full><textarea rows={2} value={form.items || ''} onChange={e => update('items', e.target.value)} /></Field>
        <Field label="Tgl. Dokumen"><input type="date" value={form.docsDate || ''} onChange={e => update('docsDate', e.target.value)} /></Field>
        <Field label="Tgl. Submit"><input type="date" value={form.submitDate || ''} onChange={e => update('submitDate', e.target.value)} /></Field>
        <Field label="Tgl. Evaluasi"><input type="date" value={form.evalDate || ''} onChange={e => update('evalDate', e.target.value)} /></Field>
        <Field label={lang === 'id' ? 'Tgl. Resubmit' : 'Resubmit Date'}><input type="date" value={form.resubmitDate || ''} onChange={e => update('resubmitDate', e.target.value)} /></Field>
        <Field label="Tgl. PNBP"><input type="date" value={form.pnbpDate || ''} onChange={e => update('pnbpDate', e.target.value)} /></Field>
        <Field label={lang === 'id' ? 'Jumlah PNBP (Rp)' : 'PNBP Amount (Rp)'}><input type="number" value={form.pnbpAmount || ''} onChange={e => update('pnbpAmount', parseFloat(e.target.value) || null)} /></Field>
        <Field label={t.pi_issued_date}><input type="date" value={form.issuedDate || ''} onChange={e => update('issuedDate', e.target.value)} /></Field>
        <Field label={t.pi_expired_date}><input type="date" value={form.expiredDate || ''} onChange={e => update('expiredDate', e.target.value)} /></Field>
        <Field label="Status">
          <select value={form.status || 'active'} onChange={e => update('status', e.target.value)}>
            <option value="active">{t.pi_status_active || 'Aktif'}</option>
            <option value="used">{t.pi_status_used || 'Digunakan'}</option>
            <option value="expired">{t.pi_status_expired || 'Expired'}</option>
          </select>
        </Field>
        <Field label={t.reg_attachment} full><input type="url" value={form.attachmentUrl || ''} onChange={e => update('attachmentUrl', e.target.value)} placeholder="https://drive.google.com/... (Surat Persetujuan Impor / PI)" /></Field>
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
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
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
function IncentiveModule({ data, setData, t, lang, session, fmt, fmtFull, canEdit, employees = {} }) {
  const salesTeam = useMemo(() => getActiveSalesTeam(employees), [employees]);
  const isSales = session.role === 'sales';
  const isOfficeAccount = session.salesId === 'office';
  // Catatan #1: per-sales filter for CEO/Finance to drill into each sales' incentive detail
  const [incFilterSales, setIncFilterSales] = useState('all');
  // For sales role, filter to only own deals; for finance/CEO, show all (or filtered by chosen sales)
  const incentiveStats = useMemo(() => {
    let visibleData = isSales ? data.filter(s => s.salesOwner === session.salesId) : data;
    // Apply per-sales filter (only for non-sales roles)
    if (!isSales && incFilterSales !== 'all') {
      visibleData = visibleData.filter(s => s.salesOwner === incFilterSales);
    }
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
    // Leaderboard (for CEO/Finance only) — always full team regardless of filter
    const leaderboard = !isSales ? salesTeam.map(sales => {
      const salesDeals = data.filter(s => s.salesOwner === sales.id && s.poStatus === 'issued');
      const total = salesDeals.reduce((sum, s) => sum + calcIncentive(s).incentive, 0);
      return { ...sales, total, dealsCount: salesDeals.length };
    }).sort((a, b) => b.total - a.total) : [];
    return { visibleData, poDeals, dealsWithIncentive, totalEstimated, totalReady, totalPaid, totalKsoSplit, ytdTotal, leaderboard };
  }, [data, isSales, session.salesId, incFilterSales, salesTeam]);
  const { visibleData, poDeals, dealsWithIncentive, totalEstimated, totalReady, totalPaid, totalKsoSplit, ytdTotal, leaderboard } = incentiveStats;

  const [selectedDeal, setSelectedDeal] = useState(null);

  // Update operasional % per deal
  const updateOpsPercent = (id, opsPercent) => {
    if (!canEdit && !isSales) return;
    setData(prev => prev.map(s => s.id === id ? { ...s, opsPercent: Math.max(0, Math.min(0.5, opsPercent)) } : s));
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

      {/* Catatan #1: Per-sales filter (CEO/Finance only) to drill into each sales' incentive */}
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

      {/* KPI Cards */}
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

      {/* Status Legend */}
      <div style={{padding: '12px 16px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', marginBottom: '20px'}}>
        <div style={{fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '8px'}}>{t.inc_status_legend}</div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '11px', color: 'var(--ims-text)'}}>
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

      {/* Deal table */}
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
                    <div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{d.subModality}</div>
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

      {/* Detail Modal */}
      {selectedDeal && (
        <div className="modal-overlay" onClick={() => setSelectedDeal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '580px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px'}}>
              <div>
                <div className="lbl-tag">{t.inc_breakdown}</div>
                <h2 className="serif" style={{fontSize: '22px', margin: '4px 0 0', fontWeight: 500}}>{selectedDeal.customer}</h2>
                <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{selectedDeal.subModality}</div>
              </div>
              <button onClick={() => setSelectedDeal(null)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
            </div>

            <div style={{fontSize: '13px', lineHeight: 1.7}}>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '6px 0'}}>
                <span>{t.inc_gross_price}</span><span className="mono" style={{fontWeight: 500}}>{fmtFull(selectedDeal._calc.grossPrice)}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: 'var(--ims-text-2)'}}>
                <span>{t.inc_ppn}</span><span className="mono">− {fmtFull(selectedDeal._calc.ppn)}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--ims-border)', borderBottom: '1px solid var(--ims-border)'}}>
                <span style={{fontWeight: 600}}>{t.inc_dpp}</span><span className="mono" style={{fontWeight: 600}}>{fmtFull(selectedDeal._calc.dpp)}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: 'var(--ims-text-2)'}}>
                <span>{t.inc_pph23}</span><span className="mono">− {fmtFull(selectedDeal._calc.pph23)}</span>
              </div>
              <div style={{padding: '10px 12px', background: 'rgba(200,169,106,0.10)', border: '1px dashed var(--ims-gold)', marginTop: '4px', marginBottom: '4px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--ims-text-2)', alignItems: 'center'}}>
                  <span style={{fontWeight: 600, fontSize: '12px'}}>✏️ {t.inc_ops_cost} <span style={{fontSize: '10px', fontWeight: 400}}>{t.inc_ops_editable}</span></span>
                  <span className="mono" style={{fontSize: '13px', fontWeight: 600, color: 'var(--ims-text)'}}>− {fmtFull(selectedDeal._calc.opsCost)}</span>
                </div>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
                  <span style={{fontSize: '10px', color: 'var(--ims-text-2)', letterSpacing: '0.1em', textTransform: 'uppercase'}}>{lang === 'id' ? 'Edit %:' : 'Edit %:'}</span>
                  <input type="number" step="0.5" min="0" max="50" defaultValue={(selectedDeal._calc.opsPercent * 100).toFixed(1)} onChange={(e) => updateOpsPercent(selectedDeal.id, (parseFloat(e.target.value) || 0) / 100)} style={{width: '90px', padding: '6px 10px', fontSize: '13px', border: '1px solid var(--ims-accent)', fontWeight: 600}} />
                  <span style={{fontSize: '13px', color: 'var(--ims-text)', fontWeight: 600}}>%</span>
                  <span style={{fontSize: '10px', color: 'var(--ims-accent-2)', marginLeft: 'auto', fontStyle: 'italic'}}>✓ {lang === 'id' ? 'Otomatis tersimpan saat diubah' : 'Auto-saves on change'}</span>
                </div>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid var(--ims-border)', marginTop: '8px'}}>
                <span style={{fontWeight: 700, fontSize: '14px'}}>{t.inc_net_sales}</span>
                <span className="mono" style={{fontWeight: 700, fontSize: '14px'}}>{fmtFull(selectedDeal._calc.netSales)}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: 'var(--ims-text-2)'}}>
                <span>{t.inc_rate}</span><span className="mono">× 1.5%</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '14px 16px', marginTop: '8px', background: 'linear-gradient(90deg, var(--ims-bg-alt), #2a3f5f)', color: 'var(--ims-accent)'}}>
                <span style={{fontWeight: 700, fontSize: '15px'}}>{t.inc_amount}</span>
                <span className="mono" style={{fontWeight: 700, fontSize: '17px'}}>{fmtFull(selectedDeal._calc.incentive)}</span>
              </div>

              {selectedDeal._stat && (
                <div style={{marginTop: '14px', padding: '10px 14px', background: selectedDeal._stat.color + '15', borderLeft: `3px solid ${selectedDeal._stat.color}`}}>
                  <div style={{fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: selectedDeal._stat.color, fontWeight: 700, marginBottom: '3px'}}>Status</div>
                  <div style={{fontSize: '13px', fontWeight: 600, color: selectedDeal._stat.color}}>{t[selectedDeal._stat.label]}</div>
                  {selectedDeal._stat.progress !== undefined && (
                    <div style={{marginTop: '6px', height: '4px', background: 'var(--ims-bg-card-2)'}}>
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

// ============== Test exports (untuk audit harness; tidak dipakai oleh bundle browser) ==============
export { migrateRegRecord, resolveDealModel, resolveCustomerSector, computeInvoiceSchedule, generatePaymentSchedule, detectPaymentScheme, pushNotificationToList, isNotificationForUser, countUnreadNotifications, appendStageHistoryEntry, getStageMetrics, formatDuration };

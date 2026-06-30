// Extracted from App.jsx during modular refactor.
const DEFAULT_USD_IDR = 18000;
const SALES_TEAM = [
  { id: 'hatim', territory: 'Jateng Utara & Pantura', territoryEn: 'Central Java North & Pantura', accent: '#d4780a', basis: 'Semarang' },
  { id: 'astrika', territory: 'Jateng Selatan & DIY', territoryEn: 'Central Java South & Yogyakarta', accent: '#e08a2e', basis: 'Yogyakarta', startsAt: '2026-08-01' },
  { id: 'dwi', territory: 'Jabodetabek + Banten + Jabar', territoryEn: 'Jabodetabek + Banten + West Java', accent: '#c03030', basis: 'Jakarta' },
  { id: 'tri', territory: 'Jatim Selatan & Timur', territoryEn: 'East Java South & East', accent: '#12855a', basis: 'Sidoarjo' },
  { id: 'bagus', territory: 'Jatim Utara & Barat', territoryEn: 'East Java North & West', accent: '#7b3fb5', basis: 'Surabaya' },
  { id: 'icha', territory: 'Jabodetabek & Banten (under Dwi)', territoryEn: 'Jabodetabek & Banten (under Dwi)', accent: '#d4a8c8', supervisedBy: 'dwi' },
  { id: 'office', territory: 'Nasional', territoryEn: 'Nationwide', accent: 'var(--ims-accent)', isOffice: true },
];
const TERRITORY_MAP = {
  // === Hatim — Jateng Utara & Pantura (Brebes–Rembang, spur Salatiga) ===
  'semarang': 'hatim', 'kendal': 'hatim', 'demak': 'hatim', 'jepara': 'hatim', 'kudus': 'hatim',
  'pati': 'hatim', 'rembang': 'hatim', 'salatiga': 'hatim', 'ungaran': 'hatim', 'ambarawa': 'hatim',
  'batang': 'hatim', 'pekalongan': 'hatim', 'pemalang': 'hatim', 'tegal': 'hatim', 'brebes': 'hatim',
  'weleri': 'hatim', 'blora': 'hatim', 'grobogan': 'hatim',
  // === Astrika — Jateng Selatan & DIY (Boyolali ke selatan + Barlingmascakep) ===
  'yogyakarta': 'astrika', 'sleman': 'astrika', 'bantul': 'astrika', 'kulon progo': 'astrika', 'gunungkidul': 'astrika', 'gunung kidul': 'astrika',
  'klaten': 'astrika', 'boyolali': 'astrika', 'solo': 'astrika', 'surakarta': 'astrika', 'sukoharjo': 'astrika',
  'karanganyar': 'astrika', 'sragen': 'astrika', 'wonogiri': 'astrika',
  'magelang': 'astrika', 'purworejo': 'astrika', 'temanggung': 'astrika', 'wonosobo': 'astrika',
  'kebumen': 'astrika', 'banjarnegara': 'astrika', 'purbalingga': 'astrika', 'banyumas': 'astrika', 'purwokerto': 'astrika', 'cilacap': 'astrika',
  // === Dwi & Ika — Jabodetabek + Banten + Jabar (sampai tim Jabar Bandung aktif) ===
  'jakarta': 'dwi', 'bekasi': 'dwi', 'tangerang': 'dwi', 'depok': 'dwi', 'bogor': 'dwi',
  'serang': 'dwi', 'cilegon': 'dwi', 'pandeglang': 'dwi', 'lebak': 'dwi',
  'bandung': 'dwi', 'cimahi': 'dwi', 'sumedang': 'dwi', 'karawang': 'dwi', 'purwakarta': 'dwi',
  'subang': 'dwi', 'majalengka': 'dwi', 'cirebon': 'dwi', 'kuningan': 'dwi',
  'indramayu': 'dwi', 'sukabumi': 'dwi', 'cianjur': 'dwi', 'garut': 'dwi', 'tasikmalaya': 'dwi',
  'ciamis': 'dwi', 'banjar': 'dwi', 'pangandaran': 'dwi',
  // === Tri — Jatim Selatan & Timur (Malang–Banyuwangi, Tapal Kuda) ===
  'malang': 'tri', 'batu': 'tri', 'kediri': 'tri', 'tulungagung': 'tri', 'trenggalek': 'tri',
  'blitar': 'tri', 'nganjuk': 'tri', 'madiun': 'tri', 'magetan': 'tri', 'ngawi': 'tri',
  'ponorogo': 'tri', 'pacitan': 'tri', 'lumajang': 'tri', 'jember': 'tri',
  'bondowoso': 'tri', 'situbondo': 'tri', 'banyuwangi': 'tri', 'probolinggo': 'tri',
  // === Bagus — Jatim Utara & Barat (Surabaya, Madura, Pantura Jatim barat) ===
  'surabaya': 'bagus', 'gresik': 'bagus', 'sidoarjo': 'bagus', 'lamongan': 'bagus',
  'pasuruan': 'bagus', 'mojokerto': 'bagus', 'jombang': 'bagus', 'tuban': 'bagus', 'bojonegoro': 'bagus',
  'bangkalan': 'bagus', 'sampang': 'bagus', 'pamekasan': 'bagus', 'sumenep': 'bagus',
  // === Bali → Office (luar 5 area, di-handle kantor pusat) ===
  'bali': 'office', 'denpasar': 'office', 'badung': 'office',
  // === Luar Jawa → Office sementara ===
  'medan': 'office', 'palembang': 'office', 'makassar': 'office', 'manado': 'office', 'pontianak': 'office',
};
const SALES_IDS_WITH_OFFICE = ['hatim', 'dwi', 'tri', 'bagus', 'office'];
const POSITION_ALLOWANCE = {
  'Staff': 130000,
  'Product Specialist': 150000,
  'Supervisor': 150000,
  'Manager': 175000,
  'Manager Operasional': 175000,
  'General Manager': 175000,
  'Direksi': 500000,
  'Security': 100000,
  'Office Boy/Girl': 100000,
};
const USERS = {
  'ceo': { password: 'hnti2026', role: 'super_admin', name: 'Fajrin Abdillah', initial: 'FA', position: 'Direksi', allowancePerDay: 500000, active: true },
  'gm': { password: 'hnti2026', role: 'gm', name: 'Endah Purwitasari', initial: 'EP', position: 'General Manager', allowancePerDay: 175000, active: true },
  'manager_ops': { password: 'hnti2026', role: 'manager_ops', name: 'Novan Restu Aryanto', initial: 'NR', position: 'Manager Operasional', allowancePerDay: 175000, active: true },
  'admin': { password: 'hnti2026', role: 'admin', name: 'Fahmi Alifudin', initial: 'FA', position: 'Staff', allowancePerDay: 130000, active: true },
  'admin2': { password: 'hnti2026', role: 'admin', name: 'Tria Mailawati', initial: 'TM', position: 'Staff', allowancePerDay: 130000, active: true },
  'teknisi': { password: 'hnti2026', role: 'technician', name: 'Robby Dwi Setiawan', initial: 'RS', position: 'Supervisor', allowancePerDay: 150000, active: true },
  'teknisi2': { password: 'hnti2026', role: 'technician', name: 'Muhammad Yusuf', initial: 'MY', position: 'Teknisi', allowancePerDay: 130000, active: true },
  'teknisi3': { password: 'hnti2026', role: 'technician', name: 'Muh. Nur Ichsan', initial: 'MN', position: 'Teknisi', allowancePerDay: 130000, active: true },
  'teknisi4': { password: 'hnti2026', role: 'technician', name: 'Kim Myung Gi (Luke)', initial: 'KM', position: 'Teknisi', allowancePerDay: 130000, active: true },
  'finance': { password: 'hnti2026', role: 'finance', name: 'Riris Elia', initial: 'RE', position: 'Supervisor', allowancePerDay: 150000, active: true },
  'finance2': { password: 'hnti2026', role: 'finance', name: 'Fransiskus Marmora', initial: 'FM', position: 'Staff', allowancePerDay: 130000, active: true },
  'regulatory': { password: 'hnti2026', role: 'regulatory', name: 'Ananda Rifki Bayu Saputra', initial: 'AR', position: 'Staff', allowancePerDay: 130000, active: true },
  'product': { password: 'hnti2026', role: 'product_specialist', name: 'Rivan Riyadi', initial: 'RR', position: 'Staff', allowancePerDay: 130000, active: true },
  'product2': { password: 'hnti2026', role: 'product_specialist', name: 'Octavianus Hernandes', initial: 'OH', position: 'Staff', allowancePerDay: 130000, active: true },
  'hatim': { password: 'hnti2026', role: 'sales', name: 'Ahmad Hatim Ashshidiq', initial: 'AH', salesId: 'hatim', position: 'Staff', allowancePerDay: 130000, active: true },
  'dwi': { password: 'hnti2026', role: 'sales', name: 'Dwi Wahyudianto', initial: 'DW', salesId: 'dwi', position: 'Manager', allowancePerDay: 175000, active: true },
  'tri': { password: 'hnti2026', role: 'sales', name: 'Tri Sutjahjono', initial: 'TS', salesId: 'tri', position: 'Manager', allowancePerDay: 175000, active: true },
  'bagus': { password: 'hnti2026', role: 'sales', name: 'Bagus Iswahyudi', initial: 'BI', salesId: 'bagus', position: 'Manager', allowancePerDay: 175000, active: true },
  'icha': { password: 'hnti2026', role: 'sales', name: 'Ika Apriani', initial: 'IA', salesId: 'icha', position: 'Staff', allowancePerDay: 130000, active: true },
  'astrika': { password: 'hnti2026', role: 'sales', name: 'Astrika', initial: 'AS', salesId: 'astrika', position: 'Staff', allowancePerDay: 130000, active: false, joinDate: '2026-08-01' },
  'sule': { password: 'hnti2026', role: 'security', name: 'Sulaiman', initial: 'SU', position: 'Security', allowancePerDay: 100000, active: true },
  'ami': { password: 'hnti2026', role: 'office_support', name: 'Supatmi', initial: 'SU', position: 'Office Boy/Girl', allowancePerDay: 100000, active: true },
  'office': { password: 'hnti2026', role: 'sales', name: 'HNT Indonesia (Office)', initial: 'HO', salesId: 'office', isOffice: true, position: '-', allowancePerDay: 0, active: true },
};
const SEED_NAME_TO_USERNAME = {};
const OFFICE_SALES_ID = 'office';
const PERMISSIONS = {
  super_admin:  { dashboard: 'full', sph: 'full', pipeline: 'full', sales: 'full', sales_report: 'full', finance: 'full', operations: 'full', technical_support: 'full', install_base: 'full', regulatory: 'full', valuation: 'full', incentive: 'full', employees: 'full', business_trip: 'full', product_support: 'full', products: 'full', document_templates: 'full', kpi_scorecard: 'full' },
  gm:           { dashboard: 'read', sph: 'read', pipeline: 'read', sales: 'read', sales_report: 'read', finance: 'read', operations: 'read', technical_support: 'read', install_base: 'read', regulatory: 'read', valuation: 'read', incentive: 'read', employees: 'full', business_trip: 'full', product_support: 'read', products: 'read', document_templates: 'full', kpi_scorecard: 'read' },
  manager_ops:  { dashboard: 'read', sph: 'read', pipeline: 'read', sales: 'read', sales_report: 'read', finance: 'read', operations: 'full', technical_support: 'read', install_base: 'read', regulatory: 'read', valuation: 'none', incentive: 'none', employees: 'full', business_trip: 'full', product_support: 'read', products: 'read', document_templates: 'full', kpi_scorecard: 'read' },
  admin:        { dashboard: 'read', sph: 'full', pipeline: 'write', sales: 'read', sales_report: 'read', finance: 'read', operations: 'read', technical_support: 'write', install_base: 'read', regulatory: 'read', valuation: 'none', incentive: 'none', employees: 'none', business_trip: 'self', product_support: 'read', products: 'read', document_templates: 'full', kpi_scorecard: 'read' },
  technician:   { dashboard: 'read', sph: 'read', pipeline: 'read', sales: 'none', sales_report: 'none', finance: 'none', operations: 'read', technical_support: 'full', install_base: 'read', regulatory: 'read', valuation: 'none', incentive: 'none', employees: 'none', business_trip: 'self', product_support: 'read', kpi_scorecard: 'none' },
  operations:   { dashboard: 'read', sph: 'read', pipeline: 'read', sales: 'none', sales_report: 'none', finance: 'read', operations: 'full', technical_support: 'read', install_base: 'read', regulatory: 'none', valuation: 'none', incentive: 'none', employees: 'none', business_trip: 'self', product_support: 'read', kpi_scorecard: 'read' },
  finance:      { dashboard: 'read', sph: 'read', pipeline: 'read', sales: 'read', sales_report: 'read', finance: 'full', operations: 'read', technical_support: 'read', install_base: 'read', regulatory: 'none', valuation: 'none', incentive: 'full', employees: 'none', business_trip: 'full', product_support: 'read', document_templates: 'full', kpi_scorecard: 'read' },
  regulatory:   { dashboard: 'read', sph: 'read', pipeline: 'read', sales: 'none', sales_report: 'none', finance: 'none', operations: 'read', technical_support: 'read', install_base: 'read', regulatory: 'full', valuation: 'none', incentive: 'none', employees: 'none', business_trip: 'self', product_support: 'read', kpi_scorecard: 'read' },
  sales:        { dashboard: 'read', sph: 'write', pipeline: 'write', sales: 'read', sales_report: 'full', finance: 'none', operations: 'none', technical_support: 'none', install_base: 'read', regulatory: 'none', valuation: 'none', incentive: 'self', employees: 'none', business_trip: 'self', product_support: 'read', kpi_scorecard: 'self' },
  // Product Specialist (#8): dashboard, SPH, pipeline, field report, business trip, product master
  product_specialist: { dashboard: 'read', sph: 'read', pipeline: 'read', sales: 'none', sales_report: 'full', finance: 'none', operations: 'none', technical_support: 'none', regulatory: 'none', valuation: 'none', incentive: 'none', employees: 'none', business_trip: 'self', products: 'read', product_support: 'full', kpi_scorecard: 'read' },
  // Security (#8): only main dashboard + business trip
  security:     { dashboard: 'read', sph: 'none', pipeline: 'none', sales: 'none', sales_report: 'none', finance: 'none', operations: 'none', technical_support: 'none', regulatory: 'none', valuation: 'none', incentive: 'none', employees: 'none', business_trip: 'self' },
  // Office Support (#8): only main dashboard + business trip
  office_support: { dashboard: 'read', sph: 'none', pipeline: 'none', sales: 'none', sales_report: 'none', finance: 'none', operations: 'none', technical_support: 'none', regulatory: 'none', valuation: 'none', incentive: 'none', employees: 'none', business_trip: 'self' },
};
const NAV_BY_ROLE = {
  super_admin:  ['dashboard', 'install_base', 'sph', 'pipeline', 'product_support', 'sales', 'incentive', 'sales_report', 'business_trip', 'finance', 'operations', 'technical_support', 'regulatory', 'products', 'document_templates', 'kpi_scorecard', 'valuation', 'cashflow', 'exec_summary', 'employees', 'audit_log'],
  gm:           ['dashboard', 'install_base', 'sph', 'pipeline', 'product_support', 'sales', 'incentive', 'sales_report', 'business_trip', 'finance', 'operations', 'technical_support', 'regulatory', 'products', 'document_templates', 'kpi_scorecard', 'valuation', 'cashflow', 'exec_summary', 'employees', 'audit_log'],
  manager_ops:  ['dashboard', 'install_base', 'sph', 'pipeline', 'product_support', 'sales', 'sales_report', 'business_trip', 'finance', 'operations', 'technical_support', 'regulatory', 'products', 'document_templates', 'kpi_scorecard', 'employees'],
  admin:        ['dashboard', 'install_base', 'sph', 'pipeline', 'product_support', 'sales', 'sales_report', 'business_trip', 'technical_support', 'regulatory', 'products', 'document_templates', 'kpi_scorecard'],
  technician:   ['dashboard', 'install_base', 'pipeline', 'business_trip', 'technical_support', 'products'],
  operations:   ['dashboard', 'install_base', 'pipeline', 'business_trip', 'operations', 'technical_support', 'products'],
  finance:      ['dashboard', 'install_base', 'pipeline', 'sales_report', 'business_trip', 'incentive', 'finance', 'document_templates', 'product_support', 'cashflow', 'kpi_scorecard'],
  regulatory:   ['dashboard', 'install_base', 'pipeline', 'business_trip', 'technical_support', 'regulatory', 'products'],
  sales:        ['sales_report', 'sph', 'pipeline', 'install_base', 'product_support', 'business_trip', 'incentive', 'dashboard', 'products', 'kpi_scorecard'],
  product_specialist: ['dashboard', 'product_support', 'pipeline', 'sales_report', 'business_trip', 'products', 'kpi_scorecard'],
  security:     ['dashboard', 'business_trip'],
  office_support: ['dashboard', 'business_trip'],
};

export { DEFAULT_USD_IDR, SALES_TEAM, TERRITORY_MAP, SALES_IDS_WITH_OFFICE, POSITION_ALLOWANCE, USERS, SEED_NAME_TO_USERNAME, OFFICE_SALES_ID, PERMISSIONS, NAV_BY_ROLE };

// Extracted from App.jsx during modular refactor.
const DEFAULT_USD_IDR = 18000;
const SALES_TEAM = [
  { id: 'lukman', name: 'Lukman Effendi', initial: 'LE', territory: 'Jateng + DIY B', territoryEn: 'Central Java + DIY B', accent: '#1a6bb0' },
  { id: 'hatim', name: 'Ahmad Hatim Ashshidiq', initial: 'HT', territory: 'Jateng A', territoryEn: 'Central Java A', accent: '#d4780a' },
  { id: 'dwi', name: 'Dwi Wahyudianto', initial: 'DW', territory: 'Jabodetabek + Jabar', territoryEn: 'Jabodetabek + West Java', accent: '#c03030' },
  { id: 'tri', name: 'Tri Sutjahjono', initial: 'TS', territory: 'Jatim 1', territoryEn: 'East Java 1', accent: '#12855a' },
  { id: 'bagus', name: 'Bagus Iswahyudi', initial: 'BI', territory: 'Jatim 2', territoryEn: 'East Java 2', accent: '#7b3fb5' },
  { id: 'icha', name: 'Ika Apriani', initial: 'IA', territory: 'Jabodetabek + Jabar (bawah Dwi)', territoryEn: 'Jabodetabek + West Java (under Dwi)', accent: '#d4a8c8', supervisedBy: 'dwi' },
  { id: 'office', name: 'HNT Indonesia (Office)', initial: 'HO', territory: 'Nasional', territoryEn: 'Nationwide', accent: 'var(--ims-accent)', isOffice: true },
];
const TERRITORY_MAP = {
  // === Hatim — Jateng A (Semarang, sekitar, Pati, Tegal, Brebes, Cirebon coastal) ===
  'semarang': 'hatim', 'kendal': 'hatim', 'demak': 'hatim', 'jepara': 'hatim', 'kudus': 'hatim',
  'pati': 'hatim', 'rembang': 'hatim', 'blora': 'hatim', 'grobogan': 'hatim', 'bojonegoro': 'hatim',
  'tegal': 'hatim', 'brebes': 'hatim', 'pemalang': 'hatim', 'pekalongan': 'hatim',
  'tuban': 'hatim',
  // === Lukman — Jateng selatan + DIY B ===
  'solo': 'lukman', 'surakarta': 'lukman', 'sukoharjo': 'lukman', 'karanganyar': 'lukman',
  'sragen': 'lukman', 'wonogiri': 'lukman', 'klaten': 'lukman', 'boyolali': 'lukman',
  'magelang': 'lukman', 'salatiga': 'lukman', 'temanggung': 'lukman', 'wonosobo': 'lukman',
  'banjarnegara': 'lukman', 'purbalingga': 'lukman', 'banyumas': 'lukman', 'purwokerto': 'lukman',
  'cilacap': 'lukman', 'kebumen': 'lukman', 'purworejo': 'lukman',
  'yogyakarta': 'lukman', 'sleman': 'lukman', 'bantul': 'lukman', 'kulon progo': 'lukman', 'gunung kidul': 'lukman',
  // === Dwi — Jabodetabek + Jabar (mayoritas), Icha membantu di bawahnya ===
  'jakarta': 'dwi', 'bekasi': 'dwi', 'tangerang': 'dwi', 'depok': 'dwi', 'bogor': 'dwi',
  'bandung': 'dwi', 'cimahi': 'dwi', 'sumedang': 'dwi', 'karawang': 'dwi', 'purwakarta': 'dwi',
  'subang': 'dwi', 'majalengka': 'dwi', 'cirebon': 'dwi', 'kuningan': 'dwi',
  'indramayu': 'dwi', 'sukabumi': 'dwi', 'cianjur': 'dwi', 'garut': 'dwi', 'tasikmalaya': 'dwi',
  'ciamis': 'dwi', 'banjar': 'dwi',
  // === Tri — Jatim 1 (Sisi barat/selatan Jatim termasuk Malang, Kediri, dll) ===
  'malang': 'tri', 'batu': 'tri', 'kediri': 'tri', 'tulungagung': 'tri', 'trenggalek': 'tri',
  'blitar': 'tri', 'jombang': 'tri', 'nganjuk': 'tri', 'madiun': 'tri', 'magetan': 'tri',
  'ngawi': 'tri', 'ponorogo': 'tri', 'pacitan': 'tri', 'mojokerto': 'tri',
  // === Bagus — Jatim 2 (Surabaya & sekitar termasuk Madura, Banyuwangi, Pasuruan) ===
  'surabaya': 'bagus', 'gresik': 'bagus', 'lamongan': 'bagus', 'sidoarjo': 'bagus',
  'pasuruan': 'bagus', 'probolinggo': 'bagus', 'lumajang': 'bagus', 'jember': 'bagus',
  'bondowoso': 'bagus', 'situbondo': 'bagus', 'banyuwangi': 'bagus',
  'bangkalan': 'bagus', 'sampang': 'bagus', 'pamekasan': 'bagus', 'sumenep': 'bagus',
  // === Bali → Office (luar 5 area, di-handle kantor pusat) ===
  'bali': 'office', 'denpasar': 'office', 'badung': 'office',
  // === Luar Jawa → Office sementara ===
  'medan': 'office', 'palembang': 'office', 'makassar': 'office', 'manado': 'office', 'pontianak': 'office',
};
const SALES_IDS_WITH_OFFICE = ['lukman', 'hatim', 'dwi', 'tri', 'bagus', 'office'];
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
  'lukman': { password: 'hnti2026', role: 'sales', name: 'Lukman Effendi', initial: 'LE', salesId: 'lukman', position: 'Staff', allowancePerDay: 130000, active: true },
  'hatim': { password: 'hnti2026', role: 'sales', name: 'Ahmad Hatim Ashshidiq', initial: 'AH', salesId: 'hatim', position: 'Staff', allowancePerDay: 130000, active: true },
  'dwi': { password: 'hnti2026', role: 'sales', name: 'Dwi Wahyudianto', initial: 'DW', salesId: 'dwi', position: 'Manager', allowancePerDay: 175000, active: true },
  'tri': { password: 'hnti2026', role: 'sales', name: 'Tri Sutjahjono', initial: 'TS', salesId: 'tri', position: 'Manager', allowancePerDay: 175000, active: true },
  'bagus': { password: 'hnti2026', role: 'sales', name: 'Bagus Iswahyudi', initial: 'BI', salesId: 'bagus', position: 'Manager', allowancePerDay: 175000, active: true },
  'icha': { password: 'hnti2026', role: 'sales', name: 'Ika Apriani', initial: 'IA', salesId: 'icha', position: 'Staff', allowancePerDay: 130000, active: true },
  'sule': { password: 'hnti2026', role: 'security', name: 'Sulaiman', initial: 'SU', position: 'Security', allowancePerDay: 100000, active: true },
  'ami': { password: 'hnti2026', role: 'office_support', name: 'Supatmi', initial: 'SU', position: 'Office Boy/Girl', allowancePerDay: 100000, active: true },
  'office': { password: 'hnti2026', role: 'sales', name: 'HNT Indonesia (Office)', initial: 'HO', salesId: 'office', isOffice: true, position: '-', allowancePerDay: 0, active: true },
};
const SEED_NAME_TO_USERNAME = {};
const OFFICE_SALES_ID = 'office';
const PERMISSIONS = {
  super_admin:  { dashboard: 'full', sph: 'full', pipeline: 'full', sales: 'full', sales_report: 'full', finance: 'full', operations: 'full', technical_support: 'full', regulatory: 'full', valuation: 'full', incentive: 'full', employees: 'full', business_trip: 'full', product_support: 'full', products: 'full', document_templates: 'full', kpi_scorecard: 'full' },
  gm:           { dashboard: 'read', sph: 'read', pipeline: 'read', sales: 'read', sales_report: 'read', finance: 'read', operations: 'read', technical_support: 'read', regulatory: 'read', valuation: 'read', incentive: 'read', employees: 'full', business_trip: 'full', product_support: 'read', products: 'read', document_templates: 'full', kpi_scorecard: 'read' },
  manager_ops:  { dashboard: 'read', sph: 'read', pipeline: 'read', sales: 'read', sales_report: 'read', finance: 'read', operations: 'full', technical_support: 'read', regulatory: 'read', valuation: 'none', incentive: 'none', employees: 'full', business_trip: 'full', product_support: 'read', products: 'read', document_templates: 'full', kpi_scorecard: 'read' },
  admin:        { dashboard: 'read', sph: 'full', pipeline: 'write', sales: 'read', sales_report: 'read', finance: 'read', operations: 'read', technical_support: 'write', regulatory: 'read', valuation: 'none', incentive: 'none', employees: 'none', business_trip: 'self', product_support: 'read', products: 'read', document_templates: 'full', kpi_scorecard: 'read' },
  technician:   { dashboard: 'read', sph: 'read', pipeline: 'read', sales: 'none', sales_report: 'none', finance: 'none', operations: 'read', technical_support: 'full', regulatory: 'read', valuation: 'none', incentive: 'none', employees: 'none', business_trip: 'self', product_support: 'read', kpi_scorecard: 'none' },
  operations:   { dashboard: 'read', sph: 'read', pipeline: 'read', sales: 'none', sales_report: 'none', finance: 'read', operations: 'full', technical_support: 'read', regulatory: 'none', valuation: 'none', incentive: 'none', employees: 'none', business_trip: 'self', product_support: 'read', kpi_scorecard: 'read' },
  finance:      { dashboard: 'read', sph: 'read', pipeline: 'read', sales: 'read', sales_report: 'read', finance: 'full', operations: 'read', technical_support: 'read', regulatory: 'none', valuation: 'none', incentive: 'full', employees: 'none', business_trip: 'full', product_support: 'read', document_templates: 'full', kpi_scorecard: 'read' },
  regulatory:   { dashboard: 'read', sph: 'read', pipeline: 'read', sales: 'none', sales_report: 'none', finance: 'none', operations: 'read', technical_support: 'read', regulatory: 'full', valuation: 'none', incentive: 'none', employees: 'none', business_trip: 'self', product_support: 'read', kpi_scorecard: 'read' },
  sales:        { dashboard: 'read', sph: 'write', pipeline: 'write', sales: 'read', sales_report: 'full', finance: 'none', operations: 'none', technical_support: 'none', regulatory: 'none', valuation: 'none', incentive: 'self', employees: 'none', business_trip: 'self', product_support: 'read', kpi_scorecard: 'self' },
  // Product Specialist (#8): dashboard, SPH, pipeline, field report, business trip, product master
  product_specialist: { dashboard: 'read', sph: 'read', pipeline: 'read', sales: 'none', sales_report: 'full', finance: 'none', operations: 'none', technical_support: 'none', regulatory: 'none', valuation: 'none', incentive: 'none', employees: 'none', business_trip: 'self', products: 'read', product_support: 'full', kpi_scorecard: 'read' },
  // Security (#8): only main dashboard + business trip
  security:     { dashboard: 'read', sph: 'none', pipeline: 'none', sales: 'none', sales_report: 'none', finance: 'none', operations: 'none', technical_support: 'none', regulatory: 'none', valuation: 'none', incentive: 'none', employees: 'none', business_trip: 'self' },
  // Office Support (#8): only main dashboard + business trip
  office_support: { dashboard: 'read', sph: 'none', pipeline: 'none', sales: 'none', sales_report: 'none', finance: 'none', operations: 'none', technical_support: 'none', regulatory: 'none', valuation: 'none', incentive: 'none', employees: 'none', business_trip: 'self' },
};
const NAV_BY_ROLE = {
  super_admin:  ['dashboard', 'sph', 'pipeline', 'product_support', 'sales', 'incentive', 'sales_report', 'business_trip', 'finance', 'operations', 'technical_support', 'regulatory', 'products', 'document_templates', 'kpi_scorecard', 'valuation', 'cashflow', 'exec_summary', 'employees', 'audit_log'],
  gm:           ['dashboard', 'sph', 'pipeline', 'product_support', 'sales', 'incentive', 'sales_report', 'business_trip', 'finance', 'operations', 'technical_support', 'regulatory', 'products', 'document_templates', 'kpi_scorecard', 'valuation', 'cashflow', 'exec_summary', 'employees', 'audit_log'],
  manager_ops:  ['dashboard', 'sph', 'pipeline', 'product_support', 'sales', 'sales_report', 'business_trip', 'finance', 'operations', 'technical_support', 'regulatory', 'products', 'document_templates', 'kpi_scorecard', 'employees'],
  admin:        ['dashboard', 'sph', 'pipeline', 'product_support', 'sales', 'sales_report', 'business_trip', 'technical_support', 'regulatory', 'products', 'document_templates', 'kpi_scorecard'],
  technician:   ['dashboard', 'pipeline', 'business_trip', 'technical_support', 'products'],
  operations:   ['dashboard', 'pipeline', 'business_trip', 'operations', 'technical_support', 'products'],
  finance:      ['dashboard', 'pipeline', 'sales_report', 'business_trip', 'incentive', 'finance', 'document_templates', 'product_support', 'cashflow', 'kpi_scorecard'],
  regulatory:   ['dashboard', 'pipeline', 'business_trip', 'technical_support', 'regulatory', 'products'],
  sales:        ['sales_report', 'sph', 'pipeline', 'product_support', 'business_trip', 'incentive', 'dashboard', 'products', 'kpi_scorecard'],
  product_specialist: ['dashboard', 'product_support', 'pipeline', 'sales_report', 'business_trip', 'products', 'kpi_scorecard'],
  security:     ['dashboard', 'business_trip'],
  office_support: ['dashboard', 'business_trip'],
};

export { DEFAULT_USD_IDR, SALES_TEAM, TERRITORY_MAP, SALES_IDS_WITH_OFFICE, POSITION_ALLOWANCE, USERS, SEED_NAME_TO_USERNAME, OFFICE_SALES_ID, PERMISSIONS, NAV_BY_ROLE };

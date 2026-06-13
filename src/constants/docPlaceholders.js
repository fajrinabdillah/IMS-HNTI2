const DOC_PLACEHOLDER_COMMON = [
  { key: 'customer', labelId: 'Nama customer / RS', labelEn: 'Customer / hospital name', example: 'RS Sehat Mandiri' },
  { key: 'modality', labelId: 'Modalitas', labelEn: 'Modality', example: 'CT Scan' },
  { key: 'subModality', labelId: 'Tipe / sub-modalitas', labelEn: 'Type / sub-modality', example: 'CT 128 Slice' },
  { key: 'brand', labelId: 'Merek / principal', labelEn: 'Brand / principal', example: 'Precision' },
  { key: 'serialNo', labelId: 'Serial number unit', labelEn: 'Unit serial number', example: 'SN-CT-128-001' },
  { key: 'address', labelId: 'Alamat lokasi pemasangan', labelEn: 'Installation address', example: 'Jl. Contoh No. 1, Jakarta' },
  { key: 'location', labelId: 'Lokasi pemasangan (alias address)', labelEn: 'Installation location (alias)', example: 'Jl. Contoh No. 1, Jakarta' },
  { key: 'sphNo', labelId: 'Nomor SPH', labelEn: 'SPH number', example: 'SPH/HNTI/2026/001' },
  { key: 'date', labelId: 'Tanggal hari ini (format Indonesia)', labelEn: 'Today (Indonesian format)', example: '13 Juni 2026' },
  { key: 'companyName', labelId: 'Nama perusahaan (dari master template)', labelEn: 'Company name (from master)', example: 'PT Harmoni Nasional Teknologi Indonesia' },
  { key: 'companyAddress', labelId: 'Alamat perusahaan', labelEn: 'Company address', example: 'Ruko Rich Palace Blok D5 No.36-40, Jakarta Barat' },
  { key: 'companyPhone', labelId: 'Telepon perusahaan', labelEn: 'Company phone', example: '(021) 2256 3477' },
  { key: 'operationsName', labelId: 'Nama TTD Operasional', labelEn: 'Operations signer name', example: 'Novan Restu Aryanto' },
  { key: 'operationsTitle', labelId: 'Jabatan TTD Operasional', labelEn: 'Operations signer title', example: 'Operational Manager' },
  { key: 'operationsSignature', labelId: 'Gambar TTD Operasional (HTML img)', labelEn: 'Operations signature image', example: '<img ...>' },
  { key: 'stampImage', labelId: 'Gambar stempel perusahaan (HTML img)', labelEn: 'Company stamp image', example: '<img ...>' },
  { key: 'footerNote', labelId: 'Catatan footer master template', labelEn: 'Master footer note', example: 'Dokumen ini dibuat melalui IMS HNTI.' },
];

const DOC_PLACEHOLDER_BAUJI_PAPARAN = [
  { key: 'docNo', labelId: 'Nomor BA uji paparan', labelEn: 'Exposure test document number', example: 'BAUP/HNTI/2026/001' },
  { key: 'exposureTestNo', labelId: 'Nomor uji paparan (alias docNo)', labelEn: 'Exposure test number', example: 'BAUP/HNTI/2026/001' },
  { key: 'recordNo', labelId: 'Nomor data instalasi', labelEn: 'Installation record number', example: 'INST-HNTI-2026-001' },
  { key: 'exposureTestDate', labelId: 'Tanggal uji paparan', labelEn: 'Exposure test date', example: '2026-06-13' },
  { key: 'testDate', labelId: 'Tanggal uji (fallback otomatis)', labelEn: 'Test date (auto fallback)', example: '2026-06-13' },
  { key: 'installStart', labelId: 'Tanggal mulai instalasi', labelEn: 'Installation start date', example: '2026-06-01' },
  { key: 'installEnd', labelId: 'Tanggal selesai instalasi', labelEn: 'Installation end date', example: '2026-06-10' },
  { key: 'leadTechnician', labelId: 'Nama lead teknisi HNTI', labelEn: 'HNTI lead technician', example: 'Budi Santoso' },
  { key: 'technicianName', labelId: 'Nama teknisi (alias leadTechnician)', labelEn: 'Technician name', example: 'Budi Santoso' },
  { key: 'hntiRep', labelId: 'Perwakilan HNTI', labelEn: 'HNTI representative', example: 'Budi Santoso' },
  { key: 'customerRep', labelId: 'Penanggung jawab customer / RSO', labelEn: 'Customer representative / RSO', example: 'Dr. Andi Wijaya' },
  { key: 'notes', labelId: 'Catatan uji paparan', labelEn: 'Exposure test notes', example: 'Uji paparan dilakukan sesuai protokol keamanan radiasi.' },
];

const DOC_PLACEHOLDERS_BY_TYPE = {
  bauji_paparan: DOC_PLACEHOLDER_BAUJI_PAPARAN,
};

function getPlaceholdersForDocType(type) {
  const specific = DOC_PLACEHOLDERS_BY_TYPE[type] || [];
  return [...DOC_PLACEHOLDER_COMMON, ...specific];
}

function getSampleRecordForDocType(type, base = {}) {
  const today = new Date().toISOString().split('T')[0];
  if (type === 'bauji_paparan') {
    return {
      recordNo: 'INST-HNTI-2026-001',
      docNo: 'BAUP/HNTI-2026/001',
      exposureTestNo: 'BAUP/HNTI-2026/001',
      customer: 'RS Contoh Sehat',
      modality: 'CT Scan',
      subModality: 'CT 128 Slice',
      brand: 'Precision',
      serialNo: 'SN-CT-128-001',
      location: 'Jl. Contoh No. 1, Jakarta',
      address: 'Jl. Contoh No. 1, Jakarta',
      sphNo: 'SPH/HNTI/2026/001',
      leadTechnician: base.leadTechnician || 'office',
      hntiRep: 'Budi Santoso',
      customerRep: 'Dr. Andi Wijaya',
      exposureTestDate: today,
      testDate: today,
      installStart: '2026-06-01',
      installEnd: '2026-06-10',
      notes: 'Uji paparan dilakukan sesuai protokol keamanan radiasi.',
      ...base,
    };
  }
  return base;
}

export { DOC_PLACEHOLDER_COMMON, DOC_PLACEHOLDER_BAUJI_PAPARAN, DOC_PLACEHOLDERS_BY_TYPE, getPlaceholdersForDocType, getSampleRecordForDocType };

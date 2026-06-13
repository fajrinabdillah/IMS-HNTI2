// Extracted from App.jsx during modular refactor.
const DOC_TYPE_LABELS = {
  sph: 'Surat Penawaran Harga (SPH)',
  spp: 'Surat Permohonan Presentasi (SPP)',
  invoice: 'Invoice',
  kwitansi: 'Kwitansi',
  bai: 'Berita Acara Instalasi',
  bauji_fungsi: 'Berita Acara Uji Fungsi',
  batraining: 'Berita Acara Training',
  bast_barang: 'Berita Acara Serah Terima Barang',
  po_principal: 'PO Principal',
};
const OFFICIAL_DOC_TEMPLATE_TYPES = [
  { key: 'invoice', label: 'Invoice' },
  { key: 'kwitansi', label: 'Kwitansi' },
  { key: 'spp', label: 'Surat Permohonan Presentasi' },
  { key: 'bai', label: 'Berita Acara Instalasi' },
  { key: 'bauji_fungsi', label: 'Berita Acara Uji Fungsi' },
  { key: 'batraining', label: 'Berita Acara Training' },
  { key: 'bast_barang', label: 'Berita Acara Serah Terima Barang' },
  { key: 'sph', label: 'Surat Penawaran Harga' },
  { key: 'po_principal', label: 'PO Principal' },
];
const DEFAULT_DOCUMENT_TEMPLATES = {
  companyName: 'PT Harmoni Nasional Teknologi Indonesia',
  companyAddress: 'Ruko Rich Palace Blok D5 No.36-40, Jakarta Barat',
  companyPhone: '(021) 2256 3477',
  companyEmail: '',
  companyWebsite: 'hnti.co.id',
  bankName: '',
  bankAccountNo: '',
  bankAccountName: 'PT Harmoni Nasional Teknologi Indonesia',
  letterheadImage: '',
  letterheadMarginTop: 25,    // mm — area kosong atas utk header gambar kop
  letterheadMarginBottom: 35, // mm — area kosong bawah utk footer gambar kop
  logoImage: '',
  stampImage: '',
  documentFiles: OFFICIAL_DOC_TEMPLATE_TYPES.map((type) => ({ id: type.key, type: type.key, label: type.label, fileName: '', mimeType: '', dataUrl: '', uploadedAt: '' })),
  signatures: {
    sales: { name: '', title: 'Account Executive', image: '' },
    finance: { name: 'Finance HNTI', title: 'Finance', image: '' },
    operations: { name: 'Novan Restu Aryanto', title: 'Operational Manager', image: '' },
    director: { name: 'Fajrin Abdillah', title: 'Direktur', image: '' },
  },
  extraSignatures: [],
  terms: {
    sph: 'Harga sudah termasuk PPN.\nHarga franco lokasi pelanggan.\nHarga sudah termasuk instalasi, training, uji fungsi, uji kesesuaian, dan uji paparan sesuai kebutuhan produk.\nSurat penawaran berlaku 30 hari sejak tanggal diterbitkan.',
    spp: 'Surat ini digunakan untuk permohonan jadwal presentasi produk kepada calon klien.\nAgenda presentasi, peserta, dan materi mengikuti kebutuhan klien.\nPerubahan jadwal wajib dikonfirmasi tertulis oleh pihak terkait.',
    invoice: 'Pembayaran dianggap sah setelah dana efektif diterima di rekening perusahaan.\nInvoice dan kwitansi ini satu kesatuan dokumen penagihan.',
    po: 'Payment terms mengikuti kesepakatan principal dan dokumen SPH/PO.\nPacking menggunakan Standard Export Packing.\nWarranty mengikuti dokumen penawaran principal.',
  },
  footerNote: 'Dokumen ini dibuat melalui IMS HNTI.',
  updatedAt: '',
};

export { DOC_TYPE_LABELS, OFFICIAL_DOC_TEMPLATE_TYPES, DEFAULT_DOCUMENT_TEMPLATES };

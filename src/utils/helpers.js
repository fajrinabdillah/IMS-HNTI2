import { TERRITORY_MAP } from '../data/constants';
const detectSalesOwnerFromCustomer = (customerName) => {
  if (!customerName) return null;
  const lower = customerName.toLowerCase();
  // 1. Cek apakah Faskes Group yang pengadaan terpusat
  // RS Hermina → pengadaan dari pusat Jakarta → semua jadi Dwi/Icha
  if (/\b(rs|rumah sakit)\s+hermina\b/i.test(customerName)) {
    // Default Hermina = Dwi (pusat Jakarta), tapi bisa diedit manual
    return 'dwi';
  }
  // Klinik Pramita / Lab Pramita → pengadaan dari pusat Surabaya
  if (/\b(klinik|lab(oratorium)?)\s+pramita\b/i.test(customerName)) {
    return 'bagus';
  }
  // 2. Cek mapping kota
  const cityMatches = [];
  for (const [city, owner] of Object.entries(TERRITORY_MAP)) {
    if (lower.includes(city)) cityMatches.push({ city, owner, len: city.length });
  }
  // Sort by length desc — longest match wins (e.g. "yogyakarta" beats "kart" if both matched)
  cityMatches.sort((a, b) => b.len - a.len);
  if (cityMatches.length > 0) return cityMatches[0].owner;
  // 3. Default: office (akan di-flag sebagai "vacant area" di UI)
  return 'office';
};
function initialOf(name) {
  if (!name) return '?';
  const parts = String(name).trim().replace(/\(.*?\)/g, '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
function resolveEmpName(employees, val) {
  if (!val || !employees) return val || '';
  // value is a current live username — but only trust a real name (not empty, not the username itself)
  if (employees[val] && employees[val].name && employees[val].name !== val) return employees[val].name;
  const un = SEED_NAME_TO_USERNAME[val];
  if (un && employees[un] && employees[un].name && employees[un].name !== un) return employees[un].name; // seed name → username still present
  // Rename-alias lookup: find a live employee whose _prevUsernames recorded the old key.
  for (const e of Object.values(employees)) {
    if (e && Array.isArray(e._prevUsernames) && (e._prevUsernames.includes(val) || (un && e._prevUsernames.includes(un)))) return e.name;
  }
  // Technician positional fallback (sorted by username) — keeps display synced even after the
  // technician username was renamed (e.g. 'teknisi' → 'teknisi1') without alias tracking.
  const allTechs = Object.entries(employees).filter(([u, e]) => e && e.role === 'technician');
  const activeTechs = allTechs.filter(([u, e]) => e.active);
  const liveTechs = (activeTechs.length ? activeTechs : allTechs)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([u, e]) => e.name)
    .filter(nm => nm && !/^teknisi\d*$/i.test(nm)); // never fall back onto a raw username-like name
  if (liveTechs.length) {
    const staticSorted = [...STATIC_TECH_ORDER].sort((a, b) => a.un.localeCompare(b.un));
    const idx = staticSorted.findIndex(s => s.un === val || s.name === val);
    if (idx >= 0) return liveTechs[idx % liveTechs.length];
  }
  return val;                                                      // custom/manually-typed name
}
function resolveNamesInText(employees, text) {
  if (!text || !employees) return text || '';
  let out = String(text);
  for (const seed of STATIC_TECH_ORDER) {
    const live = resolveEmpName(employees, seed.name);
    if (live && live !== seed.name && out.includes(seed.name)) out = out.split(seed.name).join(live);
  }
  return out;
}
const detectPaymentScheme = (projectType, customerType) => {
  if (projectType === 'kso') return 'kso';
  if (projectType === 'government' || projectType === 'tender') return 'after_bast';
  return 'dp_installment';
};
const resolveCustomerSector = (sph) => {
  if (sph?.customerSector === 'swasta' || sph?.customerSector === 'pemerintah') return sph.customerSector;
  if (sph?.projectType === 'government' || sph?.projectType === 'tender' || sph?.projectType === 'bumn') return 'pemerintah';
  return 'swasta';
};
const resolveDealModel = (sph) => {
  if (sph?.dealModel) return sph.dealModel; // explicit (data baru)
  // Derive dari data lama:
  if (sph?.paymentScheme === 'kso' || sph?.projectType === 'kso') return 'kso';
  if (sph?.projectType === 'tender') return 'tender';
  if (sph?.projectType === 'government' || sph?.projectType === 'bumn') return 'ekatalog';
  return 'cicilan'; // default RS Swasta
};
const _addMonthsISO = (dateStr, addMonths) => {
  if (!dateStr) return dateStr;
  const d = new Date(dateStr + 'T00:00:00Z'); if (isNaN(d.getTime())) return dateStr;
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + addMonths);
  // Clamp day ke akhir bulan kalau bulan baru lebih pendek
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return d.toISOString().slice(0, 10);
};

// Hitung jadwal invoice/tagihan berdasarkan dealModel. Untuk Finance & Proyeksi 5-Tahun.
// Mengembalikan { invoices: [{seq, date, type, label, amount}], totalCount, scheme }
// `baseDate` = tanggal PO untuk cicilan/e-kat/tender, tanggal install+ujifungsi untuk KSO.
const computeInvoiceSchedule = (sph, baseDateOverride) => {
  if (!sph) return { invoices: [], totalCount: 0, scheme: 'unknown' };
  const dm = resolveDealModel(sph);
  const total = Number(sph.totalValue) || ((Number(sph.qty) || 0) * (Number(sph.unitPrice) || 0));
  const baseDate = baseDateOverride || sph.issuedDate || new Date().toISOString().slice(0, 10);
  if (dm === 'ekatalog' || dm === 'tender') {
    // 1 invoice 100% setelah BAST. BAST date harus disuplai sebagai baseDateOverride saat BAST sudah ada.
    return {
      scheme: dm, totalCount: 1,
      invoices: [{ seq: 1, date: baseDate, type: 'final', label: '100% setelah BAST', amount: total }]
    };
  }
  if (dm === 'cicilan') {
    const dpPct = Math.max(10, Math.min(100, Number(sph.dpPercent) || 30));
    const termCount = Math.max(1, Math.min(36, Number(sph.installmentMonths) || 12));
    const dpAmt = total * (dpPct / 100);
    const invoices = [{ seq: 1, date: baseDate, type: 'dp', label: `DP ${dpPct}%`, amount: dpAmt }];
    if (termCount > 1) {
      const remaining = total - dpAmt;
      const perInst = remaining / (termCount - 1);
      for (let i = 1; i < termCount; i++) {
        invoices.push({
          seq: i + 1,
          date: _addMonthsISO(baseDate, i),
          type: 'installment',
          label: `Cicilan ${i}/${termCount - 1}`,
          amount: perInst
        });
      }
    } else if (dpPct < 100) {
      // termCount=1 tapi DP<100% → invoice ke-2 pelunasan
      invoices.push({ seq: 2, date: _addMonthsISO(baseDate, 1), type: 'final', label: 'Pelunasan', amount: total - dpAmt });
    }
    return { scheme: 'cicilan', totalCount: invoices.length, invoices };
  }
  if (dm === 'kso') {
    const years = Math.max(5, Math.min(10, Number(sph.ksoYears) || 5));
    const investorPct = Math.max(60, Math.min(80, Number(sph.ksoInvestorPct) || 70));
    // Pembayaran bagi hasil dimulai 3 bulan setelah install+uji fungsi selesai.
    // baseDate untuk KSO seharusnya = install+ujifungsi date (di-supply dari caller).
    const firstBillingDate = _addMonthsISO(baseDate, 3);
    const monthsTotal = years * 12;
    // Estimasi pendapatan bulanan: totalValue / monthsTotal × investorPct/100
    // (default; per-invoice editable di Finance — angka ini hanya estimasi proyeksi)
    const estPerMonth = (total * (investorPct / 100)) / monthsTotal;
    const invoices = [];
    for (let i = 0; i < monthsTotal; i++) {
      invoices.push({
        seq: i + 1,
        date: _addMonthsISO(firstBillingDate, i),
        type: 'installment',
        label: `Bagi Hasil ${i + 1}/${monthsTotal}`,
        amount: estPerMonth
      });
    }
    return { scheme: 'kso', totalCount: monthsTotal, invoices, firstBillingDate, ksoYears: years, ksoInvestorPct: investorPct };
  }
  return { invoices: [], totalCount: 0, scheme: 'unknown' };
};
export {
  detectSalesOwnerFromCustomer,
  initialOf,
  resolveEmpName,
  resolveNamesInText,
  detectPaymentScheme,
  resolveCustomerSector,
  resolveDealModel,
  computeInvoiceSchedule
};

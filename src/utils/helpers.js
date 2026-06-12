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


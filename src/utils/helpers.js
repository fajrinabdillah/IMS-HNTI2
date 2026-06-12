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


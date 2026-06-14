// Extracted from App.jsx during modular refactor.
import { initialOf, parseSafeDateMs } from './format.js';
import { OFFICE_SALES_ID, SALES_TEAM, SEED_NAME_TO_USERNAME, TERRITORY_MAP, USERS } from '../constants/org.js';
import { PRODUCT_MASTER_SEED, SPH_PRODUCT_NORMALIZATION } from '../constants/sales.js';
import { IMPORT_PIPELINE_STEPS, LEGACY_IMPORT_STATUS_MAP, REG_STAGES_AKL, REG_STAGES_DEFAULT } from '../constants/regulatory.js';
import { INCENTIVE_RATE, NET_MARGIN_BY_MODALITY, NET_MARGIN_DEFAULT, OPS_COST_DEFAULT, PPH23_RATE, PPN_RATE } from '../constants/finance.js';
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
const TECHNICIAN_NAMES = Object.values(USERS).filter(u => u.role === 'technician' && u.active).map(u => u.name);
const STATIC_TECH_ORDER = Object.entries(USERS).filter(([u, i]) => i.role === 'technician').map(([u, i]) => ({ un: u, name: i.name }));
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
const SALES_META_BY_ID = Object.fromEntries(SALES_TEAM.map(s => [s.id, s]));
function employeeSalesId(username, emp = {}) {
  return emp.salesId || username;
}
function getActiveSalesTeam(employees = {}) {
  const seen = new Set();
  const rows = Object.entries(employees)
    .filter(([username, emp]) => emp && emp.role === 'sales' && emp.active !== false)
    .map(([username, emp], idx) => {
      const id = employeeSalesId(username, emp);
      if (seen.has(id)) return null;
      seen.add(id);
      const meta = SALES_META_BY_ID[id] || {};
      const name = emp.name || meta.name || id;
      return {
        ...meta,
        id,
        name,
        initial: initialOf(name),
        territory: meta.territory || (emp.isOffice || id === OFFICE_SALES_ID ? 'Nasional' : 'Sales Aktif'),
        territoryEn: meta.territoryEn || (emp.isOffice || id === OFFICE_SALES_ID ? 'Nationwide' : 'Active Sales'),
        accent: meta.accent || ['#1a6bb0', '#d4780a', '#c03030', '#12855a', '#7b3fb5', '#5b87b8'][idx % 6],
        isOffice: Boolean(emp.isOffice || meta.isOffice || id === OFFICE_SALES_ID),
      };
    })
    .filter(Boolean);
  const officeIdx = rows.findIndex(s => s.id === OFFICE_SALES_ID);
  if (officeIdx > 0) rows.push(...rows.splice(officeIdx, 1));
  return rows;
}
function activeSalesIdSet(employees = {}) {
  return new Set(getActiveSalesTeam(employees).map(s => s.id));
}
function normalizeSalesOwnedRows(rows = [], employees = {}, field = 'salesOwner') {
  const activeIds = activeSalesIdSet(employees);
  return rows.map(row => {
    const current = row?.[field];
    if (!row || current === OFFICE_SALES_ID || activeIds.has(current)) return row;
    return {
      ...row,
      [field]: OFFICE_SALES_ID,
      _reassignedToOffice: {
        from: current || '',
        at: new Date().toISOString(),
        reason: 'inactive_or_deleted_sales_employee',
      },
    };
  });
}
function isLiveEmployeeUsername(employees = {}, username) {
  if (!username) return false;
  if (username === OFFICE_SALES_ID) return Boolean(employees[OFFICE_SALES_ID]);
  return Boolean(employees[username] && employees[username].active !== false);
}
function normalizeEmployeeOwnedRows(rows = [], employees = {}, usernameField = 'travelerUsername', nameField = 'travelerName') {
  const officeName = resolveEmpName(employees, OFFICE_SALES_ID);
  return rows.map(row => {
    const username = row?.[usernameField];
    if (!row || isLiveEmployeeUsername(employees, username)) return row;
    return {
      ...row,
      [usernameField]: OFFICE_SALES_ID,
      ...(nameField ? { [nameField]: officeName } : {}),
      position: row.position === undefined ? row.position : '-',
      allowancePerDay: row.allowancePerDay === undefined ? row.allowancePerDay : 0,
      _reassignedToOffice: {
        from: username || row?.[nameField] || '',
        at: new Date().toISOString(),
        reason: 'inactive_or_deleted_employee',
      },
    };
  });
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
const resolveProductId = (sph, productList) => {
  if (sph.productId) return sph.productId;
  const match = (productList || PRODUCT_MASTER_SEED).find(p => p.modality === sph.modality && p.type === sph.subModality);
  return match ? match.id : null;
};
const normalizeProduct = (s) => {
  const key = `${s.modality}::${s.subModality}`;
  const norm = SPH_PRODUCT_NORMALIZATION[key];
  if (norm) return { ...s, modality: norm.modality, subModality: norm.subModality };
  return s;
};
const getRegStages = (recordType) => recordType === 'akl' ? REG_STAGES_AKL : REG_STAGES_DEFAULT;
function sanitizeRegStageHistory(history, stage, stages) {
  const rows = Array.isArray(history) ? history : [];
  const clean = rows
    .map((h) => {
      const to = stages.includes(h?.to) ? h.to : null;
      const from = !h?.from || stages.includes(h.from) ? (h?.from || null) : null;
      const ms = parseSafeDateMs(h?.at);
      if (!to || ms === null) return null;
      return { from, to, by: h?.by || 'migration', at: new Date(ms).toISOString() };
    })
    .filter(Boolean)
    .sort((a, b) => String(a.at || '').localeCompare(String(b.at || '')));
  if (clean.length === 0) return [{ from: null, to: stage, by: 'migration', at: new Date().toISOString() }];
  if (clean[clean.length - 1].to !== stage) {
    clean.push({ from: clean[clean.length - 1].to, to: stage, by: 'migration', at: new Date().toISOString() });
  }
  return clean;
}
function migrateRegRecord(rec, type) {
  if (!rec || typeof rec !== 'object') return rec;
  const stages = getRegStages(type);
  const next = { ...rec };
  const STAGE_REMAP = { preregist: 'docs', fix: 'resubmit' };
  let stage = next.stage;
  if (type === 'pi' && !stage) stage = 'issued';
  stage = STAGE_REMAP[stage] || stage || 'docs';
  if (!stages.includes(stage)) stage = 'docs';
  next.stage = stage;
  next.stageIdx = stages.indexOf(stage);
  if (rec._regV41 && Array.isArray(rec.stageHistory) && rec.stageHistory.length > 0) {
    next.stageHistory = sanitizeRegStageHistory(rec.stageHistory, stage, stages);
    next._regV41 = true;
    return next;
  }
  if (next.preregistDate && !next.docsDate) next.docsDate = next.preregistDate;
  if (next.fixDate && !next.resubmitDate) next.resubmitDate = next.fixDate;
  if (!Array.isArray(next.stageHistory) || next.stageHistory.length === 0) {
    const dateByStage = {
      docs: next.docsDate || next.preregistDate || next.registerDate,
      submit: next.submitDate, eval: next.evalDate,
      resubmit: next.resubmitDate || next.fixDate,
      pnbp: next.pnbpDate, issued: next.issuedDate,
    };
    const dated = [];
    for (const [st, d] of Object.entries(dateByStage)) {
      const t = parseSafeDateMs(d);
      if (t !== null) dated.push({ st, t, d });
    }
    dated.sort((a, b) => a.t - b.t);
    const hist = [];
    let prev = null;
    for (const item of dated) {
      if (stages.indexOf(item.st) > stages.indexOf(stage)) break;
      hist.push({ from: prev, to: item.st, by: 'migration', at: new Date(item.t).toISOString() });
      prev = item.st;
    }
    if (hist.length === 0) {
      hist.push({ from: null, to: stage, by: 'migration', at: new Date().toISOString() });
    } else if (hist[hist.length - 1].to !== stage) {
      hist.push({ from: hist[hist.length - 1].to, to: stage, by: 'migration', at: new Date().toISOString() });
    }
    next.stageHistory = hist;
  } else {
    next.stageHistory = sanitizeRegStageHistory(next.stageHistory, stage, stages);
  }
  next._regV41 = true;
  return next;
}
function normalizeImportPipelineStatus(status) {
  return LEGACY_IMPORT_STATUS_MAP[status] || status || 'plan_order';
}
function importPipelineLabel(status, lang = 'id') {
  const normalized = normalizeImportPipelineStatus(status);
  const step = IMPORT_PIPELINE_STEPS.find(s => s.id === normalized);
  if (!step) return status || '-';
  return lang === 'id' ? step.labelId : step.labelEn;
}
function projectHasDpReceived(s) {
  return !!(s?.dpPaid || s?.dpConfirmedAt || s?.dpDecisionAt || ['dp_confirmed', 'factory_po_sent', 'factory_dp_paid', 'factory_production', 'factory_production_done'].includes(s?.sphWorkflowStatus));
}
function manifestMatchesProject(manifest, project) {
  if (!manifest || !project) return false;
  if (manifest.linkedProjectId && manifest.linkedProjectId === project.id) return true;
  if (project.manifestId && [manifest.id, manifest.manifestNo].includes(project.manifestId)) return true;

  // sphNo saja ambigu untuk proyek multi-alat — wajib cocok peralatan (modality/typeBrand)
  if (manifest.sphNo && project.sphNo && manifest.sphNo === project.sphNo) {
    const typeHint = normalizeProductLookupText([manifest.typeBrand, manifest.modality].filter(Boolean).join(' '));
    if (!typeHint) return false;
    const lineText = normalizeProductLookupText([
      project.subModality, project.modality, project.productBrand, project.brand, project.productType,
    ].filter(Boolean).join(' '));
    const modOk = !manifest.modality || lineText.includes(normalizeProductLookupText(manifest.modality))
      || normalizeProductLookupText(manifest.modality).includes(normalizeProductLookupText(project.modality || ''));
    const typeOk = !manifest.typeBrand || lineText.includes(normalizeProductLookupText(manifest.typeBrand))
      || normalizeProductLookupText(manifest.typeBrand).includes(lineText);
    return modOk && (typeOk || lineText.includes(typeHint) || typeHint.includes(lineText));
  }

  if (!manifest.sphNo) {
    const customer = normalizeProductLookupText(project.customer);
    const manifestCustomer = normalizeProductLookupText(manifest.customerName);
    return !!(customer && manifestCustomer && (customer === manifestCustomer || customer.includes(manifestCustomer) || manifestCustomer.includes(customer)));
  }
  return false;
}
function appendStageHistoryEntry(sph, fromStage, toStage, byUser) {
  if (!sph || fromStage === toStage) return sph;
  const entry = {
    from: fromStage || null,
    to: toStage,
    by: byUser || 'system',
    at: new Date().toISOString(),
  };
  const prevHistory = Array.isArray(sph.stageHistory) ? sph.stageHistory : [];
  return { ...sph, stageHistory: [...prevHistory, entry] };
}
function getStageMetrics(sph) {
  if (!sph) return { perStage: {}, totalMs: 0, currentStage: null, currentStageMs: 0 };
  const history = Array.isArray(sph.stageHistory) ? sph.stageHistory : [];
  const perStage = {};
  if (history.length === 0) return { perStage, totalMs: 0, currentStage: sph.stage || null, currentStageMs: 0 };
  for (let i = 0; i < history.length; i++) {
    const entry = history[i];
    const stageName = entry?.to;
    if (!stageName) continue;
    const startMs = new Date(entry.at).getTime();
    if (!Number.isFinite(startMs)) continue;
    const rawEndMs = i < history.length - 1
      ? new Date(history[i + 1].at).getTime()
      : Date.now();
    const endMs = Number.isFinite(rawEndMs) ? rawEndMs : Date.now();
    const dur = Math.max(0, endMs - startMs);
    perStage[stageName] = (perStage[stageName] || 0) + dur;
  }
  const last = [...history].reverse().find(h => h && h.to && Number.isFinite(new Date(h.at).getTime()));
  const currentStage = last?.to || sph.stage || null;
  const currentStartMs = last ? new Date(last.at).getTime() : Date.now();
  const currentStageMs = Math.max(0, Date.now() - currentStartMs);
  const totalMs = Object.values(perStage).reduce((a, b) => a + b, 0);
  return { perStage, totalMs, currentStage, currentStageMs };
}
const SPH_STAGE_IDS = new Set(['sph_sent', 'presentation_scheduled', 'presentation_done', 'ecatalog', 'negotiation', 'tender', 'po_issued', 'lost']);
const SPH_STAGE_ALIASES = {
  sph_issued: 'sph_sent', sph_awal: 'sph_sent', sph_sent: 'sph_sent',
  follow_up: 'presentation_scheduled', followup: 'presentation_scheduled',
  presentation: 'presentation_scheduled', presentation_scheduled: 'presentation_scheduled',
  presentation_done: 'presentation_done', presentasi_selesai: 'presentation_done',
  ecatalog: 'ecatalog', e_catalog: 'ecatalog',
  negosiasi: 'negotiation', negotiation: 'negotiation',
  tender: 'tender', proses_tender: 'tender',
  po_issued: 'po_issued', po_terbit: 'po_issued',
  lost: 'lost', hilang: 'lost',
};
const SPH_STAGE_BASE_PROB = { sph_sent: 20, presentation_scheduled: 35, presentation_done: 50, ecatalog: 40, negotiation: 70, tender: 55, po_issued: 100, lost: 0 };

function normalizeSphStageId(raw) {
  const key = String(raw || '').trim().toLowerCase().replace(/\s+/g, '_');
  if (!key) return null;
  if (SPH_STAGE_IDS.has(key)) return key;
  return SPH_STAGE_ALIASES[key] || null;
}

function defaultSphStageForStatus(status) {
  if (status === 'won') return 'po_issued';
  if (status === 'lost') return 'lost';
  return 'sph_sent';
}

/** Satu record SPH — selaraskan tahap, status, PO, dan probabilitas. */
function applySphStageStatusCoherence(sph) {
  if (!sph || typeof sph !== 'object') return sph;
  const s = { ...sph };
  if (s.stage === 'po_issued') {
    s.status = 'won';
    s.poStatus = 'issued';
    s.probability = 100;
  } else if (s.stage === 'lost') {
    s.status = 'lost';
    s.poStatus = null;
    s.probability = 0;
  } else if (s.stage) {
    if (s.status === 'won') s.status = 'active';
    if (s.poStatus === 'issued') s.poStatus = null;
    if (SPH_STAGE_BASE_PROB[s.stage] !== undefined) s.probability = SPH_STAGE_BASE_PROB[s.stage];
  }
  return s;
}

/** Map legacy / import stage ids to canonical pipeline stages used in IMS. */
function normalizeSphStageRecords(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr.map(s => {
    if (!s || typeof s !== 'object') return s;
    const mapped = normalizeSphStageId(s.stage);
    if (mapped) return mapped === s.stage ? s : { ...s, stage: mapped };
    if (s.stage && SPH_STAGE_IDS.has(s.stage)) return s;
    const fallback = defaultSphStageForStatus(s.status);
    return { ...s, stage: fallback };
  });
}

function normalizePoWon(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr.map(s => {
    if (!s || typeof s !== 'object') return s;
    // Deal explicitly moved out of PO — jangan paksa kembali ke PO Terbit
    if (s.stage && s.stage !== 'po_issued' && s.stage !== 'lost') {
      if (s.status === 'won' || s.poStatus === 'issued') {
        return {
          ...s,
          status: 'active',
          poStatus: null,
          probability: SPH_STAGE_BASE_PROB[s.stage] ?? s.probability ?? 50,
        };
      }
      return s;
    }
    if (s.stage === 'lost' || s.status === 'lost') {
      return s.status === 'lost' ? s : { ...s, status: 'lost', poStatus: null, probability: 0, stage: 'lost' };
    }
    const poish = s.stage === 'po_issued' || s.poStatus === 'issued';
    if (poish && s.status !== 'lost' && s.status !== 'cancelled') {
      if (s.status !== 'won' || s.poStatus !== 'issued' || s.stage !== 'po_issued') {
        return { ...s, status: 'won', poStatus: 'issued', stage: 'po_issued', probability: 100 };
      }
    } else if (s.status === 'won' && s.stage === 'po_issued') {
      return { ...s, poStatus: 'issued', probability: 100 };
    }
    return s;
  });
}
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
function getIncentiveStatus(sph) {
  if (sph.poStatus !== 'issued') return null;
  const isGovOrTender = sph.projectType === 'government';
  const isKSO = sph.projectType === 'kso';
  const isKsoSelfInvest = isKSO && sph.ksoMode === 'hnti_self_invest';
  const isKsoThirdParty = isKSO && (sph.ksoMode === 'third_party_investor' || !sph.ksoMode);

  // KSO with HNTI self-invest: split incentive scheme
  if (isKsoSelfInvest) {
    const monthsPaid = sph.ksoMonthsPaid || 0;
    if (monthsPaid >= 12) return { status: 'paid', label: 'inc_status_paid', color: 'var(--ims-accent-2)' };
    if (monthsPaid > 0) return { status: 'kso_prorata', label: 'inc_status_kso_prorata', color: 'var(--ims-accent)', progress: monthsPaid / 12 };
    return { status: 'estimated', label: 'inc_status_estimated', color: '#94a3b8' };
  }

  // RSUD/Government: no DP, 100% post-BAST
  if (isGovOrTender) {
    if (sph.paymentReceivedPct >= 100) return { status: 'paid', label: 'inc_status_paid', color: 'var(--ims-accent-2)' };
    if (sph.bastDate) return { status: 'ready', label: 'inc_status_ready', color: 'var(--ims-accent)' };
    return { status: 'estimated', label: 'inc_status_estimated', color: '#94a3b8' };
  }

  // Swasta, Tender BUMN, KSO third-party: standard DP+installment
  const pct = sph.paymentReceivedPct || (sph.finalPaid ? 100 : sph.dpPaid ? 30 : 0);
  if (pct >= 100) return { status: 'paid', label: 'inc_status_paid', color: 'var(--ims-accent-2)' };
  if (pct >= 50) return { status: 'ready', label: 'inc_status_ready', color: 'var(--ims-accent)' };
  return { status: 'estimated', label: 'inc_status_estimated', color: '#94a3b8' };
}
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
const getProductFileUrl = (product, key) => product?.productFiles?.[key] || product?.[`${key}Url`] || '';
const normalizeProductLookupText = (value) => String(value || '')
  .replace(/\([^)]*\)/g, ' ')
  .replace(/[·•]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();
const getFactoryProductionDays = (source = {}) => {
  const text = normalizeProductLookupText([
    source.modality,
    source.product,
    source.productName,
    source.subModality,
    source.type,
    source.productType,
  ].filter(Boolean).join(' '));
  if (!text) return 30;
  if (text.includes('mri')) return 60;
  if (text.includes('eswl') || text.includes('ct scan') || text.includes('ct ') || text.includes('mammography') || text.includes('mammo')) return 45;
  if (text.includes('x-ray') || text.includes('xray') || text.includes('stationer') || text.includes('stationary') || text.includes('ceiling') || text.includes('mobile') || text.includes('portable') || text.includes('flat panel') || text.includes('fpd') || text.includes('c-arm') || text.includes('c arm')) return 30;
  return 30;
};
const addDaysIso = (iso, days) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + Number(days || 0));
  return d.toISOString();
};
const getFactoryProductionInfo = (sph = {}) => {
  const days = Number(sph.factoryProductionDays) || getFactoryProductionDays(sph);
  const startAt = sph.factoryProductionStartedAt || '';
  const dueAt = startAt ? (sph.factoryProductionDueAt || addDaysIso(startAt, days)) : '';
  const remainingDays = dueAt ? Math.ceil((new Date(dueAt).getTime() - Date.now()) / 86400000) : null;
  const done = !!sph.factoryProductionDoneAt || (!!dueAt && new Date(dueAt).getTime() <= Date.now());
  return { days, startAt, dueAt, remainingDays, done };
};
const resolveProductRecord = (source = {}, productList = []) => {
  const products = productList || [];
  if (source.productId) {
    const byId = products.find(p => p.id === source.productId);
    if (byId) return byId;
  }
  const modality = normalizeProductLookupText(source.modality || source.productModality);
  const type = normalizeProductLookupText(source.subModality || source.type || source.productType);
  const brand = normalizeProductLookupText(source.brand || source.productBrand || source.partner);
  if (!modality && !type && !brand) return null;
  const sameModality = (p) => !modality || normalizeProductLookupText(p.modality) === modality;
  const sameBrand = (p) => !brand || normalizeProductLookupText(p.brand) === brand;
  const sameType = (p) => !type || normalizeProductLookupText(p.type) === type;
  const exact = products.find(p => sameModality(p) && sameType(p) && sameBrand(p))
    || products.find(p => sameModality(p) && sameType(p));
  if (exact) return exact;
  if (type) {
    const partial = products
      .filter(p => sameModality(p))
      .filter(p => {
        const pt = normalizeProductLookupText(p.type);
        return pt && (pt.includes(type) || type.includes(pt));
      })
      .sort((a, b) => normalizeProductLookupText(b.type).length - normalizeProductLookupText(a.type).length)[0];
    if (partial) return partial;
  }
  return products.find(p => sameModality(p) && sameBrand(p)) || null;
};
const applyProductMasterFields = (row = {}, product) => {
  if (!row || !product) return row;
  const next = {
    ...row,
    productId: product.id || row.productId || '',
    modality: product.modality || row.modality || '',
    subModality: product.type || row.subModality || '',
    productType: product.type || row.productType || '',
    brand: product.brand || row.brand || '',
    productBrand: product.brand || row.productBrand || '',
    productName: product.name || row.productName || '',
    principal: product.principal || row.principal || '',
    origin: product.origin || row.origin || '',
  };
  return Object.keys(next).some(k => next[k] !== row[k]) ? next : row;
};
const syncSphItemToProductMaster = (item = {}, productList = []) => {
  const product = resolveProductRecord(item, productList);
  return applyProductMasterFields(item, product);
};
const syncSphRecordToProductMaster = (sph = {}, productList = []) => {
  if (!sph || typeof sph !== 'object') return sph;
  const product = resolveProductRecord(sph, productList);
  let next = applyProductMasterFields(sph, product);
  let changed = next !== sph;
  if (Array.isArray(sph.items)) {
    const items = sph.items.map(item => syncSphItemToProductMaster(item, productList));
    const itemsChanged = items.some((item, idx) => item !== sph.items[idx]);
    if (itemsChanged) {
      next = { ...next, items };
      changed = true;
    }
  }
  return changed ? next : sph;
};
const syncSphDataToProductMaster = (rows = [], productList = []) => {
  if (!Array.isArray(rows)) return rows;
  let changed = false;
  const next = rows.map(row => {
    const synced = syncSphRecordToProductMaster(row, productList);
    if (synced !== row) changed = true;
    return synced;
  });
  return changed ? next : rows;
};
const effectiveScheme = (p) => p.paymentScheme || (p.projectType === 'kso' ? 'kso' : (p.projectType === 'government' || p.projectType === 'tender' ? 'after_bast' : 'dp_installment'));
function generatePaymentSchedule(p) {
  if (!p.poStatus || p.poStatus !== 'issued') return [];
  const total = Number(p.totalValue) || 0;
  if (total <= 0) return [];
  // Tahap 8: pakai dealModel (baru) bila ada, jika tidak derive dari paymentScheme + projectType (data lama)
  const dm = (typeof resolveDealModel === 'function')
    ? resolveDealModel(p)
    : (p.paymentScheme === 'kso' || p.projectType === 'kso' ? 'kso'
       : p.projectType === 'tender' ? 'tender'
       : (p.projectType === 'government' || p.projectType === 'bumn') ? 'ekatalog'
       : 'cicilan');
  const issueDate = new Date(p.issuedDate || '2026-01-01');
  const schedule = [];

  if (dm === 'cicilan') {
    const dpPercent = (typeof p.dpPercent === 'number' ? p.dpPercent : 30);
    const termCount = (typeof p.installmentMonths === 'number' && p.installmentMonths > 0 ? p.installmentMonths : 12);
    const dpAmt = total * (dpPercent / 100);
    schedule.push({ seq: 0, label: `DP ${dpPercent}%`, dueDate: p.issuedDate || '', amount: dpAmt, type: 'dp' });
    if (termCount > 1) {
      const remaining = total - dpAmt;
      const monthly = remaining / (termCount - 1);
      for (let i = 1; i < termCount; i++) {
        const due = new Date(issueDate); due.setMonth(due.getMonth() + i);
        schedule.push({ seq: i, label: `Cicilan ${i}/${termCount - 1}`, dueDate: due.toISOString().split('T')[0], amount: monthly, type: 'installment' });
      }
    } else if (dpPercent < 100) {
      // 1 termin tapi DP <100% → 1 invoice pelunasan
      const due = new Date(issueDate); due.setMonth(due.getMonth() + 1);
      schedule.push({ seq: 1, label: 'Pelunasan', dueDate: due.toISOString().split('T')[0], amount: total - dpAmt, type: 'final' });
    }
  } else if (dm === 'ekatalog' || dm === 'tender') {
    schedule.push({ seq: 0, label: dm === 'tender' ? 'Pelunasan 100% (Tender — setelah BAST)' : 'Pelunasan 100% (e-Katalog — setelah BAST)', dueDate: p.issuedDate || '', amount: total, type: 'full_after_bast' });
  } else if (dm === 'kso') {
    // KSO baru: ksoYears (5-10) × 12 bulan. Bagi hasil HNTI dari ksoInvestorPct (60-80%).
    // First billing: ksoFirstBillingDate jika ada (di-set saat install+ujifungsi selesai), default issuedDate + 3 bulan.
    const years = (typeof p.ksoYears === 'number' && p.ksoYears >= 5 && p.ksoYears <= 10 ? p.ksoYears : (Number.isFinite(p.installmentMonths) ? Math.max(5, Math.round(p.installmentMonths / 12)) : 5));
    const months = years * 12;
    const investorPct = (typeof p.ksoInvestorPct === 'number' ? p.ksoInvestorPct : 70);
    let firstBillStart;
    if (p.ksoFirstBillingDate) {
      firstBillStart = new Date(p.ksoFirstBillingDate);
    } else {
      // default: issuedDate + 3 bulan (estimasi sampai install+uji fungsi selesai)
      firstBillStart = new Date(issueDate); firstBillStart.setMonth(firstBillStart.getMonth() + 3);
    }
    const monthly = (total * (investorPct / 100)) / months;
    for (let i = 0; i < months; i++) {
      const due = new Date(firstBillStart); due.setMonth(due.getMonth() + i);
      schedule.push({ seq: i + 1, label: `Bagi Hasil HNTI ${i + 1}/${months} (${investorPct.toFixed(1)}%)`, dueDate: due.toISOString().split('T')[0], amount: monthly, type: 'revenue_share' });
    }
  }
  return schedule;
}
function getPaymentSummary(p) {
  const schedule = generatePaymentSchedule(p);
  const totalDue = schedule.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const history = Array.isArray(p.paymentHistory) ? p.paymentHistory : [];
  const totalPaid = history.reduce((s, h) => s + (Number(h.amount) || 0), 0);
  const outstanding = Math.max(0, totalDue - totalPaid);
  const pctPaid = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;
  const installmentsPaid = history.filter(h => h.type === 'installment' || h.type === 'revenue_share').length;
  const installmentsExpected = schedule.filter(x => x.type === 'installment' || x.type === 'revenue_share').length;
  return { schedule, totalDue, totalPaid, outstanding, pctPaid, installmentsPaid, installmentsExpected };
}

export { detectSalesOwnerFromCustomer, TECHNICIAN_NAMES, STATIC_TECH_ORDER, resolveEmpName, resolveNamesInText, SALES_META_BY_ID, employeeSalesId, getActiveSalesTeam, activeSalesIdSet, normalizeSalesOwnedRows, isLiveEmployeeUsername, normalizeEmployeeOwnedRows, detectPaymentScheme, resolveCustomerSector, resolveDealModel, _addMonthsISO, computeInvoiceSchedule, resolveProductId, normalizeProduct, getRegStages, sanitizeRegStageHistory, migrateRegRecord, normalizeImportPipelineStatus, importPipelineLabel, projectHasDpReceived, manifestMatchesProject, appendStageHistoryEntry, getStageMetrics, normalizeSphStageId, defaultSphStageForStatus, applySphStageStatusCoherence, normalizeSphStageRecords, normalizePoWon, calcIncentive, getIncentiveStatus, getNetMargin, calcNetProfit, getProductFileUrl, normalizeProductLookupText, getFactoryProductionDays, addDaysIso, getFactoryProductionInfo, resolveProductRecord, syncSphItemToProductMaster, syncSphRecordToProductMaster, syncSphDataToProductMaster, effectiveScheme, generatePaymentSchedule, getPaymentSummary };

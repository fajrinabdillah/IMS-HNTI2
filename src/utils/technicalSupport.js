/** Shared helpers for Technical Support (Instalasi + Maintenance). */

function addMonthsIso(isoDate, months) {
  const base = isoDate ? new Date(isoDate + 'T00:00:00') : new Date();
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

function isValidTechnicianName(name, employees = {}, liveTechnicians = []) {
  if (!name) return false;
  if (liveTechnicians.includes(name)) return true;
  return Object.values(employees).some(e => e?.role === 'technician' && e.active !== false && e.name === name);
}

/** Return name if valid technician, else first live tech or empty string. */
function healTechnicianName(name, liveTechnicians = [], employees = {}) {
  if (isValidTechnicianName(name, employees, liveTechnicians)) return name;
  return liveTechnicians[0] || '';
}

function getTechnicianOptions(employees = {}, liveTechnicians = []) {
  if (liveTechnicians.length) return liveTechnicians;
  return Object.values(employees)
    .filter(e => e?.role === 'technician' && e.active !== false)
    .map(e => e.name);
}

function defaultTechnician(liveTechnicians = []) {
  return liveTechnicians[0] || '';
}

/**
 * Merge base installed units with pmSchedule state so PM dates react to mark-done / delete.
 * Uses the latest `done` PM record per unit (by lastPmDate).
 */
function mergeUnitsWithPmSchedule(baseUnits = [], pmSchedule = []) {
  const latestDoneByUnit = new Map();
  for (const pm of pmSchedule) {
    if (!pm?.unitId || pm.status !== 'done') continue;
    const prev = latestDoneByUnit.get(pm.unitId);
    const prevTs = prev?.lastPmDate ? new Date(prev.lastPmDate + 'T00:00:00').getTime() : 0;
    const curTs = pm.lastPmDate ? new Date(pm.lastPmDate + 'T00:00:00').getTime() : 0;
    if (!prev || curTs >= prevTs) latestDoneByUnit.set(pm.unitId, pm);
  }

  return baseUnits.map(u => {
    const pm = latestDoneByUnit.get(u.id);
    if (!pm) return u;
    const lastPmDate = pm.lastPmDate || u.lastPmDate;
    const nextPmDate = pm.nextPmDate || addMonthsIso(lastPmDate, 6);
    return { ...u, lastPmDate, nextPmDate, pmCompleted: true };
  });
}

/** Migrate legacy installation/maintenance module IDs in CEO access overrides. */
function migrateModuleAccess(access = {}) {
  const next = {};
  for (const [user, mods] of Object.entries(access)) {
    if (!Array.isArray(mods)) {
      next[user] = mods;
      continue;
    }
    const set = new Set(mods);
    if (set.has('installation') || set.has('maintenance')) {
      set.delete('installation');
      set.delete('maintenance');
      set.add('technical_support');
    }
    next[user] = [...set];
  }
  return next;
}

export {
  addMonthsIso,
  isValidTechnicianName,
  healTechnicianName,
  getTechnicianOptions,
  defaultTechnician,
  mergeUnitsWithPmSchedule,
  migrateModuleAccess,
};

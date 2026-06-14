/**
 * Verification script for Technical Support (Phase 3 multi-unit + PM).
 * Run: node scripts/verify-technical-support.mjs
 */
import { readFileSync } from 'fs';
import {
  mergeUnitsWithPmSchedule,
  pmDoneCycleKeys,
  addMonthsIso,
  technicalUnitKey,
  buildTechnicalUnitMap,
  getTechnicalUnitRecord,
  findBapetenRecordForUnit,
  findSphLineForUnit,
  groupRecordsBySphProject,
} from '../src/utils/technicalSupport.js';
import { generateInstalledUnits } from '../src/data/seed.js';

let passed = 0;
let failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; console.log('  ✓', msg); }
  else { failed++; console.error('  ✗', msg); }
}

console.log('\n=== PM merge logic ===');
const baseUnits = [
  { id: 'u1', customer: 'RS A', lastPmDate: '2025-01-01', nextPmDate: '2025-07-01', pmCompleted: false },
  { id: 'u2', customer: 'RS B', lastPmDate: '2025-03-01', nextPmDate: '2025-09-01' },
];

const pmSchedule = [{
  id: 'pm1', unitId: 'u1', dueDate: '2025-07-01', lastPmDate: '2025-06-13',
  nextPmDate: addMonthsIso('2025-06-13', 6), status: 'done',
}];
const merged = mergeUnitsWithPmSchedule(baseUnits, pmSchedule);
assert(merged[0].lastPmDate === '2025-06-13', 'mark done: lastPmDate updated');
assert(merged[0].nextPmDate === addMonthsIso('2025-06-13', 6), 'mark done: nextPmDate +6 months');
assert(merged[0].pmCompleted === true, 'mark done: pmCompleted flag set');
assert(merged[1].nextPmDate === '2025-09-01', 'other units unchanged');

const reverted = mergeUnitsWithPmSchedule(baseUnits, []);
assert(reverted[0].lastPmDate === '2025-01-01', 'delete PM: reverts lastPmDate');
assert(reverted[0].pmCompleted === undefined, 'delete PM: strips pmCompleted');

const keys = pmDoneCycleKeys(pmSchedule);
assert(keys.has('u1|2025-07-01'), 'notification: done cycle key stored');

console.log('\n=== technicalUnitKey (multi-alat) ===');
const k1 = technicalUnitKey({ customer: 'RS Nashrul', modality: 'C-Arm', subModality: '5kW', sphNo: 'SPH/001' });
const k2 = technicalUnitKey({ customer: 'RS Nashrul', modality: 'Mobile X-ray', subModality: '100mA', sphNo: 'SPH/001' });
assert(k1 !== k2, 'same SPH different modality → different unit keys');
assert(k1.includes('sph/001'), 'unit key includes sphNo');

const bastMap = buildTechnicalUnitMap([
  { customer: 'RS Nashrul', modality: 'C-Arm', subModality: '5kW', sphNo: 'SPH/001', status: 'signed' },
]);
const lookup = getTechnicalUnitRecord(bastMap, { customer: 'RS Nashrul', modality: 'C-Arm', subModality: '5kW', sphNo: 'SPH/001' });
assert(lookup?.status === 'signed', 'getTechnicalUnitRecord finds exact unit');

console.log('\n=== BAPETEN per unit (not per customer) ===');
const nashrulData = [
  { id: 's1', sphNo: 'SPH/001', customer: 'RS Nashrul Ummah', modality: 'C-Arm', subModality: '5kW', sphProjectKey: 'pk1', shippingStatus: 'client_received' },
  { id: 's2', sphNo: 'SPH/001', customer: 'RS Nashrul Ummah', modality: 'Mobile X-ray', subModality: '100mA', sphProjectKey: 'pk1', shippingStatus: 'client_received' },
  { id: 's3', sphNo: 'SPH/001', customer: 'RS Nashrul Ummah', modality: 'CT Scan', subModality: '128', sphProjectKey: 'pk1', shippingStatus: 'factory_production' },
];
const regRecords = [
  { customer: 'RS Nashrul Ummah', modality: 'C-Arm', subModality: '5kW', stage: 'issued', issuedDate: '2026-04-01' },
];
const carmBapeten = findBapetenRecordForUnit(regRecords, nashrulData[0]);
const xrayBapeten = findBapetenRecordForUnit(regRecords, nashrulData[1]);
assert(!!carmBapeten, 'C-Arm has BAPETEN issued');
assert(!xrayBapeten, 'Mobile X-ray has no BAPETEN (per-unit, not per RS)');

console.log('\n=== groupRecordsBySphProject ===');
const installRecs = [
  { id: 'ir1', customer: 'RS Nashrul Ummah', modality: 'C-Arm', subModality: '5kW', sphNo: 'SPH/001' },
  { id: 'ir2', customer: 'RS Nashrul Ummah', modality: 'Mobile X-ray', subModality: '100mA', sphNo: 'SPH/001' },
];
const groups = groupRecordsBySphProject(installRecs, r => ({
  customer: r.customer,
  sphNo: r.sphNo,
  sphProjectKey: findSphLineForUnit(nashrulData, r)?.sphProjectKey,
}));
assert(groups.length === 1 && groups[0].isMultiItem && groups[0].items.length === 2, 'multi-alat records grouped under one project');

console.log('\n=== generateInstalledUnits(sourceData, bastRecords) ===');
const mockData = [
  { id: 'sph1', status: 'won', sphNo: 'SPH/1', customer: 'RS Alpha', modality: 'CT Scan', subModality: '128', partner: 'P1', issuedDate: '2026-03-01', qty: 1 },
];
const mockBast = [
  { id: 'bast1', bastNo: 'BAST/1', customer: 'RS Alpha', modality: 'CT Scan', subModality: '128', sphNo: 'SPH/1', signedDate: '2026-01-01', status: 'signed' },
  { id: 'bast2', bastNo: 'BAST/2', customer: 'RS Beta', modality: 'MRI', subModality: '1.5T', signedDate: '2026-02-15', status: 'draft' },
];
const unitsFromBast = generateInstalledUnits(mockData, mockBast);
assert(unitsFromBast.length === 1 && unitsFromBast[0].customer === 'RS Alpha', 'only signed BAST creates PM units');
assert(unitsFromBast[0].nextPmDate === '2026-07-01', 'first PM is BAST signed date + 6 months');
assert(unitsFromBast[0].sphNo === 'SPH/1', 'PM unit carries sphNo from BAST/SPH');
assert(generateInstalledUnits(mockData, []).length === 0, 'no signed BAST returns empty array');

// Multi-alat: 2 signed BAST → 2 PM units
const multiBast = [
  { id: 'b1', customer: 'RS Nashrul Ummah', modality: 'C-Arm', subModality: '5kW', sphNo: 'SPH/001', signedDate: '2026-02-01', status: 'signed' },
  { id: 'b2', customer: 'RS Nashrul Ummah', modality: 'Mobile X-ray', subModality: '100mA', sphNo: 'SPH/001', signedDate: '2026-03-01', status: 'signed' },
];
const multiUnits = generateInstalledUnits(nashrulData, multiBast);
assert(multiUnits.length === 2, '2 signed BAST on multi-alat project → 2 PM units');
assert(multiUnits.every(u => u.sphNo === 'SPH/001'), 'each PM unit has sphNo');

console.log('\n=== App.jsx wiring ===');
const appSrc = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8');
assert(appSrc.includes('baseInstalledUnits={baseInstalledUnits}'), 'AuthApp receives baseInstalledUnits prop');
assert(appSrc.includes('generateInstalledUnits(data, bastRecords)'), 'baseInstalledUnits derives from BAST + data');

console.log('\n=== InstallationModule Phase 3 ===');
const instSrc = readFileSync(new URL('../src/modules/InstallationModule.jsx', import.meta.url), 'utf8');
assert(instSrc.includes('findBapetenRecordForUnit'), 'BAPETEN lookup is per-unit');
assert(!instSrc.includes('bapetenIssuedByCustomer'), 'removed customer-only BAPETEN map');
assert(instSrc.includes('buildTechnicalUnitMap'), 'uses buildTechnicalUnitMap for cross-tab sync');
assert(instSrc.includes('groupRecordsBySphProject'), 'list tabs use project grouping');
assert(instSrc.includes('installProjectGroups'), 'dashboard receives multi-alat groups');
assert(instSrc.includes("type: 'billing_due'"), 'BAST signed notifies Finance');
const installSaveBlock = instSrc.match(/function InstallRecordsList[\s\S]*?^function BASTList/m)?.[0] || '';
assert(!installSaveBlock.includes("type: 'billing_due'"), 'InstallRecordsList does not wrongly notify Finance on save');
assert(instSrc.includes('sphNo: u.sphNo'), 'modals propagate sphNo from UnitPicker');
assert(instSrc.includes('formatTechnicalUnitLabel'), 'UnitPicker uses formatTechnicalUnitLabel');

console.log('\n=== TechnicalSupportModule tabs ===');
const tsSrc = readFileSync(new URL('../src/modules/TechnicalSupportModule.jsx', import.meta.url), 'utf8');
for (const tab of ['dashboard', 'progress', 'records', 'bast', 'training', 'exposure', 'pm', 'issues']) {
  assert(tsSrc.includes(`id: '${tab}'`) || tsSrc.includes(`tab === '${tab}'`), `tab "${tab}" present`);
}

console.log('\n=== MaintenanceModule ===');
const mtSrc = readFileSync(new URL('../src/modules/MaintenanceModule.jsx', import.meta.url), 'utf8');
assert(mtSrc.includes('mergeUnitsWithPmSchedule'), 'MaintenanceModule merges PM schedule');

console.log(`\n=== RESULT: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);

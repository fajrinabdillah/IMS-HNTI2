/**
 * Verification script for Technical Support PM merge + module wiring.
 * Run: node scripts/verify-technical-support.mjs
 */
import { readFileSync } from 'fs';
import { mergeUnitsWithPmSchedule, pmDoneCycleKeys, addMonthsIso } from '../src/utils/technicalSupport.js';

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

// Mark done updates dates
const pmSchedule = [{
  id: 'pm1', unitId: 'u1', dueDate: '2025-07-01', lastPmDate: '2025-06-13',
  nextPmDate: addMonthsIso('2025-06-13', 6), status: 'done',
}];
const merged = mergeUnitsWithPmSchedule(baseUnits, pmSchedule);
assert(merged[0].lastPmDate === '2025-06-13', 'mark done: lastPmDate updated');
assert(merged[0].nextPmDate === addMonthsIso('2025-06-13', 6), 'mark done: nextPmDate +6 months');
assert(merged[0].pmCompleted === true, 'mark done: pmCompleted flag set');
assert(merged[1].nextPmDate === '2025-09-01', 'other units unchanged');

// Delete PM reverts unit
const reverted = mergeUnitsWithPmSchedule(baseUnits, []);
assert(reverted[0].lastPmDate === '2025-01-01', 'delete PM: reverts lastPmDate');
assert(reverted[0].pmCompleted === undefined, 'delete PM: strips pmCompleted');

// Notification cycle keys
const keys = pmDoneCycleKeys(pmSchedule);
assert(keys.has('u1|2025-07-01'), 'notification: done cycle key stored');

console.log('\n=== App.jsx wiring ===');
const appSrc = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8');
assert(appSrc.includes('baseInstalledUnits={baseInstalledUnits}'), 'AuthApp receives baseInstalledUnits prop');
assert(appSrc.includes('units={baseInstalledUnits}'), 'TechnicalSupportModule gets baseInstalledUnits');

// AuthApp must declare baseInstalledUnits in destructuring
const authMatch = appSrc.match(/function AuthApp\(\{([\s\S]*?)\}\)/);
assert(authMatch && authMatch[1].includes('baseInstalledUnits'), 'AuthApp destructures baseInstalledUnits');

console.log('\n=== TechnicalSupportModule tabs ===');
const tsSrc = readFileSync(new URL('../src/modules/TechnicalSupportModule.jsx', import.meta.url), 'utf8');
for (const tab of ['dashboard', 'progress', 'history_bast', 'training', 'pm', 'issues']) {
  assert(tsSrc.includes(`id: '${tab}'`) || tsSrc.includes(`tab === '${tab}'`), `tab "${tab}" present`);
}
assert(tsSrc.includes('forcedTab="dashboard"'), 'dashboard forcedTab wired');
assert(tsSrc.includes('forcedTab="training"'), 'training forcedTab wired');
assert(tsSrc.includes('forcedTab="progress"'), 'progress forcedTab wired');

console.log('\n=== MaintenanceModule ===');
const mtSrc = readFileSync(new URL('../src/modules/MaintenanceModule.jsx', import.meta.url), 'utf8');
assert(mtSrc.includes('mergeUnitsWithPmSchedule'), 'MaintenanceModule merges PM schedule');
assert(mtSrc.includes('undoPmForUnit'), 'undo PM handler exists');
assert(mtSrc.includes('units={effectiveUnits}'), 'modals use effectiveUnits');
assert(mtSrc.includes('pmDoneCycleKeys'), 'PM notifications use pmDoneCycleKeys');

console.log('\n=== InstallationModule ===');
const instSrc = readFileSync(new URL('../src/modules/InstallationModule.jsx', import.meta.url), 'utf8');
assert(instSrc.includes('getInstallStepsForProduct'), 'install steps function exists');
assert(instSrc.includes('functionTest') && instSrc.includes('exposureTest') && instSrc.includes('complianceTest'), 'test steps in progress');
assert(instSrc.includes("useState(contentOnly ? 'all' : '2026')"), 'embedded mode uses all years filter');

console.log(`\n=== RESULT: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);

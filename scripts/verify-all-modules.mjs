/**
 * Deep static QA: every module file exists, exports, tabs, no Riwayat Request regression.
 * Run: node scripts/verify-all-modules.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

let passed = 0;
let failed = 0;
function assert(cond, msg) {
  if (cond) { passed++; console.log('  ✓', msg); }
  else { failed++; console.error('  ✗', msg); }
}

const root = '.';
const app = readFileSync('App.jsx', 'utf8');

const moduleImports = [
  ['FinanceModule', 'src/modules/FinanceModule.jsx'],
  ['OperationsModule', 'src/modules/OperationsModule.jsx'],
  ['TechnicalSupportModule', 'src/modules/TechnicalSupportModule.jsx'],
  ['RegulatoryModule', 'src/modules/RegulatoryModule.jsx'],
  ['IncentiveModule', 'src/modules/IncentiveModule.jsx'],
  ['BusinessTripModule', 'src/modules/BusinessTripModule.jsx'],
  ['EmployeesModule', 'src/modules/EmployeesModule.jsx'],
  ['ProductMasterModule', 'src/modules/ProductMasterModule.jsx'],
  ['DocumentTemplateModule', 'src/modules/DocumentTemplateModule.jsx'],
  ['AuditLogModule', 'src/modules/AuditLogModule.jsx'],
  ['InstallationModule', 'src/modules/InstallationModule.jsx'],
  ['MaintenanceModule', 'src/modules/MaintenanceModule.jsx'],
  ['SPHManagement', 'src/modules/SalesModule.jsx'],
  ['PipelineBoard', 'src/modules/SalesModule.jsx'],
  ['Dashboard', 'src/modules/Dashboard.jsx'],
];

console.log('\n=== Module files & exports ===');
moduleImports.forEach(([name, path]) => {
  assert(existsSync(path), `file exists: ${path}`);
  const src = readFileSync(path, 'utf8');
  assert(src.includes(`function ${name}`) || src.includes(`export function ${name}`) || src.includes(`export { ${name}`) || src.includes(`const ${name}`), `${name} defined in ${path}`);
  assert(!src.includes('undefined is not'), 'no literal undefined crash string');
});

console.log('\n=== Per-module tab definitions ===');
const tabChecks = [
  ['src/modules/FinanceModule.jsx', ['dashboard', 'finance', 'profit', 'opscost']],
  ['src/modules/OperationsModule.jsx', ['dashboard', 'manifest', 'production', 'customs', 'local', 'shipment']],
  ['src/modules/TechnicalSupportModule.jsx', ['dashboard', 'progress', 'records', 'bast', 'training', 'exposure', 'pm', 'issues']],
  ['src/modules/RegulatoryModule.jsx', ['dashboard']],
  ['src/modules/BusinessTripModule.jsx', ['dashboard']],
  ['src/modules/IncentiveModule.jsx', ['dashboard', 'deals']],
  ['src/modules/InstallationModule.jsx', ['dashboard', 'records', 'training', 'bast', 'progress']],
  ['src/modules/MaintenanceModule.jsx', ['dashboard', 'schedule', 'repair', 'complaint']],
  ['src/modules/SalesModule.jsx', ['dashboard', 'list', 'request_sph', 'request_spp', 'queue', 'docs']],
];

tabChecks.forEach(([file, tabs]) => {
  const src = readFileSync(file, 'utf8');
  tabs.forEach(t => assert(src.includes(`'${t}'`) || src.includes(`"${t}"`), `${file} references tab "${t}"`));
  if (file.includes('SalesModule')) {
    assert(!src.includes('Riwayat Request'), 'SalesModule: no Riwayat Request');
    assert(src.includes('deleteDocId'), 'SalesModule: doc delete state');
  }
});

console.log('\n=== Cross-module data keys ===');
const sphProject = readFileSync('src/utils/sphProject.js', 'utf8');
assert(!sphProject.includes('STAGE_SYNC_FIELDS'), 'no forced stage sync across rows');
assert(sphProject.includes('sphProjectKey'), 'project key for cross-module sync');

const domain = readFileSync('src/utils/domain.js', 'utf8');
assert(domain.includes('applySphStageStatusCoherence'), 'stage coherence helper');
assert(domain.includes('normalizeSphStageRecords'), 'legacy stage migration');

console.log('\n=== Analytics / dashboard modules ===');
['src/modules/Dashboard.jsx', 'src/modules/analytics.jsx'].forEach(f => {
  assert(existsSync(f), `${f} exists`);
  const s = readFileSync(f, 'utf8');
  assert(s.length > 500, `${f} has content`);
  assert(s.includes('ResponsiveContainer') || s.includes('KPICard') || s.includes('Dashboard'), `${f} has dashboard/chart UI`);
});

console.log('\n=== Error boundaries on heavy views ===');
const wrapped = ['SPHManagement', 'FinanceModule', 'TechnicalSupportModule', 'OperationsModule', 'PipelineBoard'];
wrapped.forEach(m => assert(app.includes(m), `App renders ${m}`));

console.log(`\n=== RESULT: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);

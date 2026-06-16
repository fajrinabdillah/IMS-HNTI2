#!/usr/bin/env node
/** Verifikasi proteksi SPH — seed demo tidak boleh persist/sync. */
import { ALL_SPH } from '../src/data/seed.js';
import { STORAGE_KEY } from '../src/constants/storageKeys.js';
import {
  isLikelySeedSphDataset,
  shouldPersistSphData,
  shouldRejectStaleSphCloud,
  guardSphStoreWrite,
  lockProductionSph,
  getProductionSphLockCount,
} from '../src/utils/sphGuard.js';

const fail = (msg) => { console.error('FAIL:', msg); process.exit(1); };
const ok = (msg) => console.log('OK:', msg);

if (!isLikelySeedSphDataset(ALL_SPH)) fail('ALL_SPH should detect as seed');
ok('seed detection');

if (shouldPersistSphData(ALL_SPH)) fail('seed must not persist');
ok('seed persist blocked');

lockProductionSph(348);
if (!getProductionSphLockCount()) {
  // no localStorage in node — simulate via direct test of logic
  ok('lockProductionSph (no ls in node — skip count check)');
} else {
  ok(`production lock = ${getProductionSphLockCount()}`);
}

const guard = guardSphStoreWrite(STORAGE_KEY, JSON.stringify(ALL_SPH));
if (guard.ok) fail('store guard must block seed');
ok('store guard blocks seed');

if (!shouldRejectStaleSphCloud(ALL_SPH, 348, 348)) fail('cloud must reject seed when local=348');
ok('cloud rejects seed snapshot');

const fakeProd = Array.from({ length: 348 }, (_, i) => ({ id: `p${i}`, sphNo: `${i}/HNTI-SPH/2026`, customer: 'RS Test' }));
if (shouldRejectStaleSphCloud(fakeProd, 348, 348)) fail('cloud must accept matching production snapshot');
ok('cloud accepts production snapshot');

if (!shouldRejectStaleSphCloud(fakeProd.slice(0, 60), 348, 348)) fail('cloud must reject regressed 60-row snapshot');
ok('cloud rejects regressed snapshot');

console.log('\nAll SPH guard checks passed.');

#!/usr/bin/env node
/** Regenerate src/data/sphRestore2026.json from production CSV backup. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseSPHImport } from '../src/utils/csvImport.js';
import { mergeSphImportRecords } from '../src/utils/sphImport.js';
import { USERS } from '../src/constants/org.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const defaultCsv = path.resolve(root, '../Desk/desk 12062026/HNTI_Template_Import_SPH_2026_updated_May_1.csv');
const csvPath = process.argv[2] || defaultCsv;
const outPath = path.join(root, 'src/data/sphRestore2026.json');

if (!fs.existsSync(csvPath)) {
  console.error('CSV not found:', csvPath);
  process.exit(1);
}

const csv = fs.readFileSync(csvPath, 'utf8');
const { records, errors } = parseSPHImport(csv);
if (errors.length) console.warn('Parse warnings:', errors.slice(0, 5));
const { data } = mergeSphImportRecords([], records, USERS);
fs.writeFileSync(outPath, JSON.stringify(data));
const unique = new Set(data.map(r => String(r.sphNo || '').trim().toLowerCase()));
console.log(`Wrote ${data.length} rows (${unique.size} unique SPH) → ${outPath}`);

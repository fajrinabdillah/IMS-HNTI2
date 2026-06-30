#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseFieldReportImport } from '../src/utils/csvImport.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvPath = process.argv[2] || '/Users/fajrin2/Desktop/HNTI_Import_Sales_Reports_All.csv';
const outPath = path.join(__dirname, '../src/data/fieldReportsJunJul2026.js');

const salesTeam = [
  { id: 'hatim', name: 'Ahmad Hatim Ashshidiq' },
  { id: 'dwi', name: 'Dwi Wahyudianto' },
  { id: 'tri', name: 'Tri Sutjahjono' },
  { id: 'bagus', name: 'Bagus Iswahyudi' },
  { id: 'icha', name: 'Ika Apriani' },
  { id: 'astrika', name: 'Astrika' },
];

const text = fs.readFileSync(csvPath, 'utf8');
const { records, errors } = parseFieldReportImport(text, salesTeam);
if (errors.length) console.warn('Import warnings:', errors.slice(0, 5));

const body = JSON.stringify(records, null, 2)
  .replace(/"([^"]+)":/g, '$1:');

const file = `// Auto-generated from HNTI_Import_Sales_Reports_All.csv — Juni–Juli 2026
// Regenerate: node scripts/build-field-reports-seed.mjs [path/to/csv]
const FIELD_REPORTS_JUN_JUL_2026 = ${body};

export { FIELD_REPORTS_JUN_JUL_2026 };
`;

fs.writeFileSync(outPath, file, 'utf8');
console.log(`Wrote ${records.length} reports → ${outPath}`);

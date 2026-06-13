// Mechanically extract top-level declarations (by NAME) from App.jsx into a new module.
// Resolves each symbol's exact line span via AST (no manual line tracking).
// - Writes target = banner + sliced code (in source order) + trailing `export { names };`
// - Removes those spans from App.jsx (bottom-up)
// - Inserts `import { names } from '<rel>';` after the last existing import in App.jsx
//
// Usage: node tools/extract.cjs <targetRelPath> <Sym1> <Sym2> ...
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

const APP = 'App.jsx';
const target = process.argv[2];
const wanted = process.argv.slice(3);
if (!target || !wanted.length) { console.error('Usage: extract.cjs <target> <Sym...>'); process.exit(1); }
if (fs.existsSync(target)) { console.error('Target exists, refusing to overwrite:', target); process.exit(1); }

const src = fs.readFileSync(APP, 'utf8');
const lines = src.split('\n');
const ast = parser.parse(src, { sourceType: 'module', plugins: ['jsx'] });

// Map top-level name -> {start,end,namesInDecl}
const declByName = {};
for (const node of ast.program.body) {
  const span = { start: node.loc.start.line, end: node.loc.end.line, names: [] };
  if ((node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration') && node.id) {
    span.names.push(node.id.name);
    declByName[node.id.name] = span;
  } else if (node.type === 'VariableDeclaration') {
    for (const d of node.declarations) {
      if (d.id.type === 'Identifier') span.names.push(d.id.name);
    }
    for (const n of span.names) declByName[n] = span;
  }
}

// Resolve wanted -> unique spans (dedupe by start line)
const spanSet = new Map();
for (const w of wanted) {
  const s = declByName[w];
  if (!s) { console.error('Symbol not found at top level:', w); process.exit(1); }
  spanSet.set(s.start, s);
}
const spans = [...spanSet.values()].sort((a, b) => a.start - b.start);

// Collect all exported names (every declarator in each span)
const exportNames = [];
for (const s of spans) for (const n of s.names) exportNames.push(n);
const uniqNames = [...new Set(exportNames)];

// Build slice in source order
let sliceLines = [];
for (const s of spans) sliceLines = sliceLines.concat(lines.slice(s.start - 1, s.end));
const sliceCode = sliceLines.join('\n');

fs.mkdirSync(path.dirname(target), { recursive: true });
const banner = `// Extracted from App.jsx during modular refactor.\n`;
const exportStmt = uniqNames.length ? `\nexport { ${uniqNames.join(', ')} };\n` : '\n';
fs.writeFileSync(target, banner + sliceCode + '\n' + exportStmt);

// Remove spans bottom-up
let newLines = lines.slice();
for (let i = spans.length - 1; i >= 0; i--) {
  newLines.splice(spans[i].start - 1, spans[i].end - spans[i].start + 1);
}

let rel = './' + target.replace(/\\/g, '/');
let lastImport = -1;
for (let i = 0; i < Math.min(newLines.length, 60); i++) {
  if (/^import\s.+from\s+['"].+['"];?\s*$/.test(newLines[i]) || /^import\s+['"].+['"];?\s*$/.test(newLines[i])) lastImport = i;
}
const importLine = uniqNames.length ? `import { ${uniqNames.join(', ')} } from '${rel}';` : `import '${rel}';`;
newLines.splice(lastImport + 1, 0, importLine);
fs.writeFileSync(APP, newLines.join('\n'));

console.log(`Extracted ${spans.length} decl(s) -> ${target}`);
console.log(`Names (${uniqNames.length}): ${uniqNames.join(', ')}`);
console.log(`Import: ${importLine}`);

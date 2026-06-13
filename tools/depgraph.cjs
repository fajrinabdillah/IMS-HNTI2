// Build a dependency graph among top-level declarations of a file.
// For each top-level binding, list which OTHER top-level bindings it references.
// Usage: node tools/depgraph.cjs App.jsx [symbolName]
const fs = require('fs');
const parser = require('@babel/parser');
const traverseMod = require('@babel/traverse');
const traverse = traverseMod.default || traverseMod;

const file = process.argv[2] || 'App.jsx';
const focus = process.argv[3];
const code = fs.readFileSync(file, 'utf8');
const ast = parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });

let program;
const topNames = new Set();
const declPaths = {}; // name -> path
traverse(ast, {
  Program(p) {
    program = p;
    const b = p.scope.bindings;
    for (const name of Object.keys(b)) {
      topNames.add(name);
      declPaths[name] = b[name].path;
    }
  },
});

// For each top-level name, find referenced top-level names within its declaration subtree.
const deps = {}; // name -> Set
const startLine = {};
for (const name of topNames) {
  const path = declPaths[name];
  startLine[name] = path.node.loc ? path.node.loc.start.line : 0;
  const set = new Set();
  path.traverse({
    ReferencedIdentifier(rp) {
      const n = rp.node.name;
      if (n === name) return;
      if (!topNames.has(n)) return;
      // ensure it resolves to the top-level binding (not a local shadow)
      const binding = rp.scope.getBinding(n);
      if (!binding) { set.add(n); return; } // unresolved -> treat as top-level/global ref
      if (binding.scope === program.scope) set.add(n);
    },
  });
  set.delete(name);
  deps[name] = set;
}

if (focus) {
  console.log(`\n${focus} (line ${startLine[focus]}) depends on:`);
  console.log('  ' + [...(deps[focus]||[])].sort().join(', '));
  // who depends on focus
  const rev = [];
  for (const n of topNames) if (deps[n].has(focus)) rev.push(n);
  console.log(`\nDepended on by (${rev.length}):`);
  console.log('  ' + rev.sort().join(', '));
  process.exit(0);
}

// Print dependency count summary, sorted by line
const arr = [...topNames].sort((a,b)=>startLine[a]-startLine[b]);
for (const n of arr) {
  console.log(`${startLine[n]}\t${n}\t-> [${[...deps[n]].sort().join(', ')}]`);
}

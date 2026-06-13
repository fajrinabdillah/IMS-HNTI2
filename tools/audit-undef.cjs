// AST-based undefined-reference auditor.
// Usage: node tools/audit-undef.cjs <file1> [file2] ...
// Reports identifiers (incl. JSX component names) referenced but neither imported,
// declared locally, nor a known runtime global. Catches the runtime "X is not defined"
// class of bugs that `vite build` does NOT catch.
const fs = require('fs');
const parser = require('@babel/parser');
const traverseMod = require('@babel/traverse');
const traverse = traverseMod.default || traverseMod;

const KNOWN_GLOBALS = new Set([
  // JS built-ins
  'Object', 'Array', 'String', 'Number', 'Boolean', 'Symbol', 'BigInt', 'Math', 'JSON',
  'Date', 'RegExp', 'Error', 'TypeError', 'RangeError', 'Promise', 'Map', 'Set', 'WeakMap',
  'WeakSet', 'Proxy', 'Reflect', 'Intl', 'parseInt', 'parseFloat', 'isNaN', 'isFinite',
  'encodeURIComponent', 'decodeURIComponent', 'encodeURI', 'decodeURI', 'NaN', 'Infinity',
  'undefined', 'globalThis', 'structuredClone', 'queueMicrotask',
  // Browser
  'window', 'document', 'navigator', 'location', 'history', 'localStorage', 'sessionStorage',
  'console', 'fetch', 'Headers', 'Request', 'Response', 'FormData', 'Blob', 'File', 'FileReader',
  'URL', 'URLSearchParams', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
  'requestAnimationFrame', 'cancelAnimationFrame', 'alert', 'confirm', 'prompt', 'atob', 'btoa',
  'CustomEvent', 'Event', 'EventTarget', 'WebSocket', 'Notification', 'Audio', 'Image',
  'getComputedStyle', 'matchMedia', 'crypto', 'TextEncoder', 'TextDecoder', 'AbortController',
  'IntersectionObserver', 'ResizeObserver', 'MutationObserver', 'performance', 'Uint8Array',
  'Int8Array', 'Uint16Array', 'Uint32Array', 'Float32Array', 'Float64Array', 'ArrayBuffer',
  'DataView', 'process',
  // Vite
  'import',
]);

let totalProblems = 0;
const files = process.argv.slice(2);
for (const file of files) {
  let code;
  try { code = fs.readFileSync(file, 'utf8'); } catch (e) { console.error('CANNOT READ', file); totalProblems++; continue; }
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx'],
      errorRecovery: false,
    });
  } catch (e) {
    console.error(`PARSE ERROR ${file}: ${e.message}`);
    totalProblems++;
    continue;
  }
  const globalsFound = new Map(); // name -> [lines]
  traverse(ast, {
    Program(path) {
      const globalNames = new Set(Object.keys(path.scope.globals).filter(n => !KNOWN_GLOBALS.has(n)));
      if (!globalNames.size) return;
      for (const name of globalNames) globalsFound.set(name, []);
    },
    ReferencedIdentifier(p) {
      const name = p.node.name;
      if (globalsFound.has(name) && !p.scope.hasBinding(name)) {
        globalsFound.get(name).push(p.node.loc ? p.node.loc.start.line : '?');
      }
    },
  });
  if (globalsFound.size) {
    console.log(`\n[UNDEFINED in ${file}]`);
    for (const [g, lns] of [...globalsFound.entries()].sort((a,b)=>a[0].localeCompare(b[0]))) {
      console.log('  - ' + g + '  @ lines ' + (lns.length ? lns.join(', ') : '?'));
    }
    totalProblems += globalsFound.size;
  } else {
    console.log(`[OK] ${file}`);
  }
}
if (totalProblems > 0) {
  console.log(`\nAUDIT FAILED: ${totalProblems} undefined reference(s).`);
  process.exit(1);
} else {
  console.log('\nAUDIT PASSED: no undefined references.');
}

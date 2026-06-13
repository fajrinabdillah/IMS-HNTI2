// Report import needs for given files: groups unresolved identifiers by react/lucide/recharts/provider-file/unknown.
const fs=require('fs');
const parser=require('@babel/parser');
const traverse=(require('@babel/traverse').default)||require('@babel/traverse');
const KNOWN=new Set(['Object','Array','String','Number','Boolean','Symbol','BigInt','Math','JSON','Date','RegExp','Error','TypeError','RangeError','Promise','Map','Set','WeakMap','WeakSet','Proxy','Reflect','Intl','parseInt','parseFloat','isNaN','isFinite','encodeURIComponent','decodeURIComponent','encodeURI','decodeURI','NaN','Infinity','undefined','globalThis','structuredClone','queueMicrotask','window','document','navigator','location','history','localStorage','sessionStorage','console','fetch','Headers','Request','Response','FormData','Blob','File','FileReader','URL','URLSearchParams','setTimeout','clearTimeout','setInterval','clearInterval','requestAnimationFrame','cancelAnimationFrame','alert','confirm','prompt','atob','btoa','CustomEvent','Event','EventTarget','WebSocket','Notification','Audio','Image','getComputedStyle','matchMedia','crypto','TextEncoder','TextDecoder','AbortController','IntersectionObserver','ResizeObserver','MutationObserver','performance','Uint8Array','Int8Array','Uint16Array','Uint32Array','Float32Array','Float64Array','ArrayBuffer','DataView','process','import']);
const srcFiles=[];
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=d+'/'+e.name; if(e.isDirectory())walk(p); else if(/\.(js|jsx)$/.test(e.name))srcFiles.push(p);}}
walk('src');
const REACT_HOOKS=new Set(['useState','useEffect','useMemo','useRef','useCallback','React']);
const LUCIDE=new Set('TrendingUp FileText Briefcase Plus Search Edit2 Trash2 X ArrowUpRight ArrowDownRight Activity DollarSign Users Clock Globe LogOut Shield Wrench Truck Wallet Lock Eye EyeOff CheckCircle2 AlertCircle FileCheck Menu ChevronDown ChevronRight ChevronLeft ClipboardList Star Settings ShieldCheck CalendarDays AlertTriangle FileSearch UserPlus UserCheck UserX Plane Receipt Hotel RefreshCw History FolderOpen Upload Download Target Layers FileBarChart Bell Palette Check'.split(' '));
const RECHARTS=new Set('PieChart Pie Cell ResponsiveContainer BarChart Bar XAxis YAxis CartesianGrid Tooltip Legend Area ComposedChart'.split(' '));
const provider={};
for(const f of srcFiles){
  const code=fs.readFileSync(f,'utf8');
  let ast; try{ast=parser.parse(code,{sourceType:'module',plugins:['jsx']});}catch(e){continue;}
  for(const n of ast.program.body){
    if((n.type==='FunctionDeclaration'||n.type==='ClassDeclaration')&&n.id) provider[n.id.name]=f;
    else if(n.type==='VariableDeclaration') for(const d of n.declarations) if(d.id.type==='Identifier') provider[d.id.name]=f;
    else if(n.type==='ExportNamedDeclaration'&&n.specifiers) for(const s of n.specifiers) provider[s.exported.name]=f;
  }
}
const targets=process.argv.slice(2);
for(const file of targets){
  const code=fs.readFileSync(file,'utf8');
  let ast; try{ast=parser.parse(code,{sourceType:'module',plugins:['jsx']});}catch(e){console.log(file,'PARSE ERR',e.message);continue;}
  const undef=new Set();
  traverse(ast,{Program(p){for(const n of Object.keys(p.scope.globals)) if(!KNOWN.has(n)) undef.add(n);}});
  const byKind={react:[],lucide:[],recharts:[],provided:{},unknown:[]};
  for(const n of [...undef].sort()){
    if(REACT_HOOKS.has(n))byKind.react.push(n);
    else if(LUCIDE.has(n))byKind.lucide.push(n);
    else if(RECHARTS.has(n))byKind.recharts.push(n);
    else if(provider[n] && provider[n]!==file){(byKind.provided[provider[n]]=byKind.provided[provider[n]]||[]).push(n);}
    else byKind.unknown.push(n);
  }
  console.log('\n========',file);
  if(byKind.react.length){const hasR=byKind.react.includes('React');const hooks=byKind.react.filter(x=>x!=='React');console.log((hasR?"import React, { ":"import { ")+hooks.join(', ')+" } from 'react';");}
  if(byKind.lucide.length)console.log("import { "+byKind.lucide.join(', ')+" } from 'lucide-react';");
  if(byKind.recharts.length)console.log("import { "+byKind.recharts.join(', ')+" } from 'recharts';");
  for(const src in byKind.provided)console.log("FROM "+src+": "+byKind.provided[src].join(', '));
  if(byKind.unknown.length)console.log("!!! UNKNOWN: "+byKind.unknown.join(', '));
}

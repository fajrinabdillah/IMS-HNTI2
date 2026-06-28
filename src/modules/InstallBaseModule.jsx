import { useMemo, useState } from 'react';
import { Activity, MapPin, Pencil, Plus, Save, Search, Sparkles, Target, Trash2, X, Zap } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Th, Td } from '../components/ui.jsx';
import { buildInstallBase, installBaseStats, normalizeInstallBaseRecord } from '../utils/installBase.js';

const FAMILY_COLORS = {
  'CT Scan': '#4cc9f0',
  'X-Ray': '#d6b36a',
  'Mobile X-Ray': '#7dd3fc',
  'Portable X-Ray': '#a78bfa',
  'C-Arm': '#fb7185',
  'FPD': '#34d399',
  'ESWL': '#f59e0b',
  Other: '#94a3b8',
};

const EMPTY_MANUAL_RECORD = {
  hospitalName: '',
  address: '',
  province: '',
  city: '',
  product: '',
  type: '',
  quantity: 1,
  installationYear: new Date().getFullYear(),
  installationDate: '',
  lat: '',
  lng: '',
  sphNo: '',
};

const INDONESIA_ISLANDS = [
  { name: 'Sumatra', points: [[95.2, 5.8], [97.2, 4.9], [100.4, 1.9], [103.7, -1.4], [106.1, -5.8], [104.4, -6.1], [101.4, -3.3], [98.1, -0.1], [94.8, 3.0]] },
  { name: 'Jawa', points: [[105.0, -5.7], [108.0, -6.2], [111.8, -6.8], [114.8, -7.5], [113.7, -8.4], [109.8, -7.9], [106.1, -7.1]] },
  { name: 'Kalimantan', points: [[108.1, 3.8], [113.8, 4.1], [118.4, 1.3], [118.0, -2.7], [114.0, -4.4], [109.1, -2.1], [107.6, 1.0]] },
  { name: 'Sulawesi', points: [[119.0, 1.8], [124.6, 1.2], [123.0, -0.8], [125.4, -3.3], [123.0, -5.6], [120.6, -3.5], [118.2, -4.6], [119.8, -1.7], [117.8, -0.2]] },
  { name: 'Papua', points: [[130.5, -1.0], [136.0, -0.3], [141.0, -2.8], [140.2, -7.4], [134.2, -8.7], [130.0, -5.5]] },
  { name: 'Bali-Nusa Tenggara', points: [[115.0, -8.1], [117.2, -8.3], [120.5, -8.5], [123.7, -8.7], [126.8, -8.8], [125.5, -9.6], [121.4, -9.4], [117.5, -9.1]] },
  { name: 'Maluku', points: [[126.6, 1.7], [128.6, 0.6], [129.6, -2.4], [128.2, -4.8], [126.0, -3.2], [126.8, -0.7]] },
];

function projectPoint(lat, lng) {
  const x = ((Number(lng) - 94) / (141 - 94)) * 100;
  const y = ((6 - Number(lat)) / (6 - (-11))) * 100;
  return {
    x: Math.max(3, Math.min(97, x)),
    y: Math.max(6, Math.min(94, y)),
  };
}

function svgPoint(lat, lng) {
  const p = projectPoint(lat, lng);
  return `${(p.x * 10).toFixed(1)},${(p.y * 3.6).toFixed(1)}`;
}

function InstallBaseMap({ records = [], stats, selectedProvince = 'all', lang = 'id' }) {
  const points = useMemo(() => {
    const grouped = new Map();
    records.forEach(r => {
      if (selectedProvince !== 'all' && r.province !== selectedProvince) return;
      const key = `${r.hospitalName}|${r.lat?.toFixed?.(3)}|${r.lng?.toFixed?.(3)}`;
      if (!grouped.has(key)) grouped.set(key, { ...r, qty: 0, families: new Set() });
      const g = grouped.get(key);
      g.qty += Number(r.quantity) || 1;
      g.families.add(r.productFamily || 'Other');
    });
    return [...grouped.values()].map(p => ({
      ...p,
      ...projectPoint(p.lat, p.lng),
      color: FAMILY_COLORS[[...p.families][0]] || FAMILY_COLORS.Other,
    }));
  }, [records, selectedProvince]);

  return (
    <div className="installbase-map-panel">
      <style>{`
        .installbase-map-panel {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(214,179,106,0.35);
          background:
            radial-gradient(circle at 20% 20%, rgba(76,201,240,0.16), transparent 32%),
            radial-gradient(circle at 80% 30%, rgba(214,179,106,0.18), transparent 28%),
            linear-gradient(135deg, rgba(5,12,28,0.98), rgba(10,28,55,0.94));
          padding: 18px;
          min-height: 430px;
          box-shadow: inset 0 0 80px rgba(26,77,138,0.22), 0 24px 60px rgba(0,0,0,0.28);
        }
        .installbase-map-panel::before {
          content: "";
          position: absolute;
          inset: -40%;
          background: linear-gradient(115deg, transparent 42%, rgba(255,255,255,0.09) 50%, transparent 58%);
          transform: translateX(-35%);
          animation: ib-shimmer 8s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes ib-shimmer {
          0%, 25% { transform: translateX(-45%) rotate(0deg); opacity: 0; }
          45% { opacity: 1; }
          75%, 100% { transform: translateX(45%) rotate(0deg); opacity: 0; }
        }
        .ib-dot {
          position: absolute;
          transform: translate(-50%, -50%);
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.86);
          box-shadow: 0 0 0 4px rgba(255,255,255,0.08), 0 0 22px currentColor, 0 0 44px currentColor;
          animation: ib-pulse 2.8s ease-in-out infinite;
          cursor: pointer;
        }
        @keyframes ib-pulse {
          0%, 100% { filter: brightness(0.95); opacity: 0.74; }
          50% { filter: brightness(1.35); opacity: 1; }
        }
        .ib-dot:hover .ib-tip { opacity: 1; transform: translate(-50%, -118%) scale(1); }
        .ib-tip {
          position: absolute;
          left: 50%;
          top: -8px;
          width: 240px;
          transform: translate(-50%, -105%) scale(0.96);
          opacity: 0;
          transition: 160ms ease;
          pointer-events: none;
          background: rgba(3,10,24,0.95);
          border: 1px solid rgba(214,179,106,0.42);
          padding: 10px 12px;
          color: #fff;
          font-size: 11px;
          line-height: 1.45;
          z-index: 5;
          box-shadow: 0 18px 44px rgba(0,0,0,0.35);
        }
      `}</style>
      <div style={{position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start'}}>
        <div>
          <div style={{fontSize: '10px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--ims-gold)', fontWeight: 800}}>HNTI Installed Base Command Center</div>
          <div className="serif" style={{fontSize: '34px', marginTop: '6px', color: '#fff', fontWeight: 500}}>203+ Units Across Indonesia</div>
          <div style={{fontSize: '12px', color: 'rgba(255,255,255,0.66)', marginTop: '4px'}}>{lang === 'id' ? 'Baseline PDF + unit dari operasional yang sudah tiba di RS' : 'PDF baseline + operations units arrived at hospital'}</div>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(88px, 1fr))', gap: '8px', minWidth: '310px'}}>
          {[
            ['TOTAL UNIT', stats.totalUnits],
            ['PROVINSI', stats.provinceCount],
            ['RS/LOKASI', stats.hospitalCount],
          ].map(([label, value]) => (
            <div key={label} style={{padding: '10px 12px', background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.12)'}}>
              <div style={{fontSize: '9px', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.16em'}}>{label}</div>
              <div className="serif" style={{fontSize: '24px', color: '#fff', marginTop: '2px'}}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{position: 'relative', zIndex: 1, height: '330px', marginTop: '18px'}}>
        <svg viewBox="0 0 1000 360" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.96}}>
          <defs>
            <linearGradient id="ib-island" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(76,201,240,0.34)" />
              <stop offset="100%" stopColor="rgba(214,179,106,0.18)" />
            </linearGradient>
            <filter id="ib-map-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <g filter="url(#ib-map-glow)">
            {INDONESIA_ISLANDS.map(island => (
              <polygon
                key={island.name}
                points={island.points.map(([lng, lat]) => svgPoint(lat, lng)).join(' ')}
                fill="url(#ib-island)"
                stroke="rgba(255,255,255,0.34)"
                strokeWidth="1.2"
              />
            ))}
          </g>
          <g fill="rgba(214,179,106,0.28)" stroke="rgba(255,255,255,0.32)" strokeWidth="0.8">
            {[[115.2, -8.4], [116.4, -8.6], [118.4, -8.6], [120.0, -8.7], [122.0, -8.8], [127.4, 0.7], [128.2, -3.1], [129.8, -3.5]].map(([lng, lat], i) => {
              const p = projectPoint(lat, lng);
              return <circle key={i} cx={p.x * 10} cy={p.y * 3.6} r={i < 5 ? 4.5 : 5.5} />;
            })}
          </g>
          <path d="M0,305 C180,290 278,330 430,312 C600,292 740,330 1000,300" fill="none" stroke="rgba(214,179,106,0.16)" strokeDasharray="8 8" />
        </svg>
        {points.map((p, idx) => {
          const size = Math.min(22, 7 + Math.sqrt(p.qty || 1) * 3);
          return (
            <div key={`${p.hospitalName}-${idx}`} className="ib-dot" style={{left: `${p.x}%`, top: `${p.y}%`, width: size, height: size, color: p.color, background: p.color}}>
              <div className="ib-tip">
                <strong>{p.hospitalName}</strong><br />
                {p.province} · {p.qty} unit<br />
                {[...p.families].join(', ')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InstallBaseDashboardCard({ data = [], bastRecords = [], installRecords = [], manualRecords = [], lang = 'id' }) {
  const records = useMemo(() => buildInstallBase(data, bastRecords, installRecords, manualRecords), [data, bastRecords, installRecords, manualRecords]);
  const stats = useMemo(() => installBaseStats(records), [records]);
  return (
    <div style={{marginBottom: '22px'}}>
      <InstallBaseMap records={records} stats={stats} lang={lang} />
    </div>
  );
}

function InstallBaseModule({ data = [], bastRecords = [], installRecords = [], manualRecords = [], setManualRecords, t, lang, fmt, canEdit = false }) {
  const [province, setProvince] = useState('all');
  const [family, setFamily] = useState('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_MANUAL_RECORD);
  const records = useMemo(() => buildInstallBase(data, bastRecords, installRecords, manualRecords), [data, bastRecords, installRecords, manualRecords]);
  const stats = useMemo(() => installBaseStats(records), [records]);
  const provinces = useMemo(() => ['all', ...stats.byProvince.map(p => p.province)], [stats]);
  const families = useMemo(() => ['all', ...stats.byProductFamily.map(p => p.name)], [stats]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter(r => {
      const matchProvince = province === 'all' || r.province === province;
      const matchFamily = family === 'all' || r.productFamily === family;
      const hay = [r.hospitalName, r.address, r.province, r.product, r.type, r.sphNo].filter(Boolean).join(' ').toLowerCase();
      return matchProvince && matchFamily && (!q || hay.includes(q));
    });
  }, [records, province, family, search]);

  const startAdd = () => {
    setEditing({ mode: 'add' });
    setForm({ ...EMPTY_MANUAL_RECORD, installationYear: new Date().getFullYear() });
  };
  const startEdit = (record) => {
    const isManual = String(record.source || '').includes('manual');
    setEditing({ mode: isManual ? 'edit' : 'override', id: isManual ? record.id : null });
    setForm({
      id: isManual ? record.id : '',
      hospitalName: record.hospitalName || '',
      address: record.address || '',
      province: record.province || '',
      city: record.city || '',
      product: record.product || '',
      type: record.type || '',
      quantity: Number(record.quantity) || 1,
      installationYear: record.installationYear || new Date().getFullYear(),
      installationDate: record.installationDate || '',
      lat: Number.isFinite(Number(record.lat)) ? Number(record.lat).toFixed(6) : '',
      lng: Number.isFinite(Number(record.lng)) ? Number(record.lng).toFixed(6) : '',
      sphNo: record.sphNo || '',
    });
  };
  const cancelEdit = () => {
    setEditing(null);
    setForm(EMPTY_MANUAL_RECORD);
  };
  const saveManual = () => {
    if (!setManualRecords || !form.hospitalName.trim()) return;
    const id = form.id || `ib_manual_${Date.now()}`;
    const normalized = normalizeInstallBaseRecord({
      ...form,
      id,
      quantity: Number(form.quantity) || 1,
      installationYear: Number(form.installationYear) || null,
      lat: form.lat === '' ? undefined : Number(form.lat),
      lng: form.lng === '' ? undefined : Number(form.lng),
    }, 'manual');
    setManualRecords(prev => {
      const list = Array.isArray(prev) ? prev : [];
      const exists = list.some(r => r.id === id);
      return exists ? list.map(r => r.id === id ? normalized : r) : [normalized, ...list];
    });
    cancelEdit();
  };
  const deleteManual = (record) => {
    if (!setManualRecords || !String(record.source || '').includes('manual')) return;
    const ok = window.confirm(lang === 'id' ? `Hapus data manual ${record.hospitalName}?` : `Delete manual record ${record.hospitalName}?`);
    if (!ok) return;
    setManualRecords(prev => (prev || []).filter(r => r.id !== record.id));
  };

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>Install Base</div>
        <div style={{display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'flex-start', flexWrap: 'wrap'}}>
          <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>HNTI Install Base</h1>
          {canEdit && (
            <button className="btn-primary" onClick={startAdd} style={{padding: '10px 14px', fontSize: '11px'}}>
              <Plus size={14} /> Tambah Manual
            </button>
          )}
        </div>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>Peta populasi alat HNTI, baseline 203 unit dan sinkronisasi otomatis dari operasional/BAST.</div>
      </div>

      {editing && (
        <div className="card" style={{marginBottom: '18px', borderColor: 'rgba(214,179,106,0.45)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px'}}>
            <div>
              <div className="card-title" style={{margin: 0}}>{editing.mode === 'add' ? 'Tambah Data Install Base Manual' : editing.mode === 'override' ? 'Buat Override Manual' : 'Edit Data Manual'}</div>
              <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: 3}}>Isi koordinat latitude/longitude jika ingin titik RS lebih presisi.</div>
            </div>
            <button onClick={cancelEdit} style={{border: '1px solid var(--ims-border)', background: 'transparent', padding: '8px 10px', cursor: 'pointer'}}><X size={14} /></button>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px'}}>
            {[
              ['hospitalName', 'Nama RS/Lokasi *'],
              ['province', 'Provinsi'],
              ['city', 'Kota/Kabupaten'],
              ['product', 'Produk'],
              ['type', 'Tipe'],
              ['quantity', 'Jumlah Unit', 'number'],
              ['installationYear', 'Tahun Instalasi', 'number'],
              ['installationDate', 'Tanggal Instalasi', 'date'],
              ['lat', 'Latitude', 'number'],
              ['lng', 'Longitude', 'number'],
              ['sphNo', 'No. SPH'],
            ].map(([key, label, type = 'text']) => (
              <label key={key} style={{fontSize: '10px', letterSpacing: '0.12em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 700}}>
                {label}
                <input
                  type={type}
                  step={key === 'lat' || key === 'lng' ? '0.000001' : undefined}
                  value={form[key] ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  style={{marginTop: 6}}
                />
              </label>
            ))}
            <label style={{gridColumn: 'span 4', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 700}}>
              Alamat
              <input value={form.address || ''} onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))} style={{marginTop: 6}} />
            </label>
          </div>
          <div style={{display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px'}}>
            <button onClick={cancelEdit} style={{padding: '9px 12px', border: '1px solid var(--ims-border)', background: 'transparent', cursor: 'pointer'}}>Batal</button>
            <button className="btn-primary" onClick={saveManual} disabled={!form.hospitalName.trim()} style={{padding: '9px 12px', opacity: form.hospitalName.trim() ? 1 : 0.55}}>
              <Save size={14} /> Simpan Manual
            </button>
          </div>
        </div>
      )}

      <InstallBaseMap records={filtered} stats={stats} selectedProvince={province} lang={lang} />

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', border: '1px solid var(--ims-border)', margin: '20px 0'}}>
        {[
          [Target, 'Total Unit', stats.totalUnits, 'Baseline PDF + live sync'],
          [MapPin, 'Provinsi', stats.provinceCount, 'Coverage nasional'],
          [Activity, 'RS/Lokasi', stats.hospitalCount, 'Lokasi teridentifikasi'],
          [Zap, 'Live Sync', stats.liveExtra, 'Tiba di RS / BAST'],
        ].map(([Icon, label, value, sub]) => (
          <div key={label} style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', letterSpacing: '0.16em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}><Icon size={14} />{label}</div>
            <div className="serif" style={{fontSize: '28px', marginTop: '6px'}}>{value}</div>
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: '18px', marginBottom: '20px'}}>
        <div className="card">
          <div className="card-title">Top Provinsi Install Base</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.byProvince.slice(0, 10)} layout="vertical" margin={{left: 96}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" horizontal={false} />
              <XAxis type="number" stroke="var(--ims-text-2)" style={{fontSize: 10}} />
              <YAxis type="category" dataKey="province" width={96} stroke="var(--ims-text-2)" style={{fontSize: 10}} />
              <Tooltip contentStyle={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', fontSize: 11}} />
              <Bar dataKey="qty" fill="#1a4d8a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title">Product Family Mix</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={stats.byProductFamily} dataKey="qty" nameKey="name" cx="50%" cy="50%" outerRadius={88} label={({ name }) => name} style={{fontSize: 10}}>
                {stats.byProductFamily.map((entry, i) => <Cell key={entry.name} fill={FAMILY_COLORS[entry.name] || Object.values(FAMILY_COLORS)[i % 8]} />)}
              </Pie>
              <Tooltip contentStyle={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', fontSize: 11}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div style={{display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '14px'}}>
          <div className="card-title" style={{margin: 0}}>Detail Install Base</div>
          <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
            <select value={province} onChange={e => setProvince(e.target.value)} style={{width: 170}}>
              {provinces.map(p => <option key={p} value={p}>{p === 'all' ? 'Semua Provinsi' : p}</option>)}
            </select>
            <select value={family} onChange={e => setFamily(e.target.value)} style={{width: 170}}>
              {families.map(f => <option key={f} value={f}>{f === 'all' ? 'Semua Produk' : f}</option>)}
            </select>
            <div style={{position: 'relative'}}>
              <Search size={14} style={{position: 'absolute', left: 10, top: 9, color: 'var(--ims-text-2)'}} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari RS, produk, SPH..." style={{paddingLeft: 32, width: 230}} />
            </div>
          </div>
        </div>
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px'}}>
            <thead><tr><Th>RS/Lokasi</Th><Th>Provinsi</Th><Th>Produk</Th><Th align="right">Unit</Th><Th>Tahun</Th><Th>Sumber</Th><Th>Koordinat</Th><Th>Aksi</Th></tr></thead>
            <tbody>
              {filtered.slice(0, 240).map(r => (
                <tr key={r.id} style={{borderTop: '1px solid var(--ims-border)'}}>
                  <Td><strong>{r.hospitalName}</strong><div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: 2}}>{r.address || '-'}</div></Td>
                  <Td>{r.province || '-'}</Td>
                  <Td>{r.product}<div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: 2}}>{r.type || r.productFamily}</div></Td>
                  <Td align="right"><span className="mono">{r.quantity}</span></Td>
                  <Td>{r.installationYear || '-'}</Td>
                  <Td><span style={{fontSize: '10px', padding: '2px 6px', background: 'rgba(26,77,138,0.10)', color: '#1a4d8a', fontWeight: 700}}>{r.source}</span></Td>
                  <Td><span className="mono" style={{fontSize: '10px'}}>{Number(r.lat).toFixed(3)}, {Number(r.lng).toFixed(3)}</span></Td>
                  <Td>
                    {canEdit ? (
                      <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
                        <button onClick={() => startEdit(r)} title={String(r.source || '').includes('manual') ? 'Edit data manual' : 'Buat override manual'} style={{border: '1px solid var(--ims-border)', background: 'transparent', padding: '6px 8px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', gap: 4}}>
                          <Pencil size={12} /> Edit
                        </button>
                        {String(r.source || '').includes('manual') && (
                          <button onClick={() => deleteManual(r)} title="Hapus data manual" style={{border: '1px solid rgba(192,48,48,0.35)', color: '#c03030', background: 'transparent', padding: '6px 8px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', gap: 4}}>
                            <Trash2 size={12} /> Hapus
                          </button>
                        )}
                      </div>
                    ) : <span style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>Read-only</span>}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '10px'}}>
          <Sparkles size={12} style={{verticalAlign: 'middle', marginRight: 4}} /> Baseline PDF menampilkan total 203 unit. Detail live bertambah otomatis dari operasional dengan status tiba di RS dan BAST final.
        </div>
      </div>
    </div>
  );
}

export { InstallBaseModule, InstallBaseDashboardCard };

import { useMemo, useState } from 'react';
import { Activity, MapPin, Pencil, Plus, Save, Search, Sparkles, Target, Trash2, X, Zap } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Th, Td } from '../components/ui.jsx';
import { buildInstallBase, installBaseStats, mapLocationKey, normalizeInstallBaseRecord } from '../utils/installBase.js';
import indonesiaMapUrl from '../assets/indonesia-provinces-outline.svg';

const FAMILY_COLORS = {
  'CT Scan': '#4cc9f0',
  'Stationary X-Ray': '#d6b36a',
  'Mobile X-Ray': '#7dd3fc',
  'Portable X-Ray': '#a78bfa',
  'C-Arm': '#fb7185',
  'FPD': '#34d399',
  'Generator PXR': '#f59e0b',
  'ESWL': '#f59e0b',
  Other: '#94a3b8',
};

const RADIAN = Math.PI / 180;

// Visual lat/lng tuned to align with the Indonesia SVG map asset (not raw geodesic coords).
const MAP_POINT_OVERRIDES = {
  // Calibrated to Jawa Timur landmass on the SVG (~39.5%, 75%) — raw Lamongan coords land in the sea on this map.
  'rsi nashrul ummah lamongan': { lat: -7.82, lng: 113.46 },
  'rsud pratama adonara': { lat: -8.3242, lng: 123.1645 },
  'rsud otanaha': { lat: 0.18, lng: 123.02 },
  'rsud dr. irwan bokings': { lat: 0.10, lng: 122.58 },
  'rsud dr irwan bokings': { lat: 0.10, lng: 122.58 },
  'rsu bangli': { lat: -9.7327, lng: 116.0380 },
  'dr yanti health center - bali': { lat: -10.0732, lng: 116.1352 },
  'rs pratama kubu': { lat: -9.8689, lng: 116.7181 },
  'rs shanti graha': { lat: -9.4149, lng: 115.6494 },
  'rsu bunda jembrana': { lat: -9.5738, lng: 115.2607 },
};

const BALI_VISUAL_DEFAULT = { lat: -9.73, lng: 116.04 };

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

function L(lang, id, en) {
  return lang === 'id' ? id : en;
}

function renderPieLabel({ cx, cy, midAngle, outerRadius, name, percent }) {
  const radius = outerRadius + 18;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" style={{fontSize: 10, fontWeight: 600}}>
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function mapCoordsFor(record = {}) {
  const key = String(record.hospitalName || '').trim().toLowerCase();
  if (MAP_POINT_OVERRIDES[key]) return MAP_POINT_OVERRIDES[key];
  if (key.includes('nashrul')) return MAP_POINT_OVERRIDES['rsi nashrul ummah lamongan'];
  if (record.province === 'Bali') return BALI_VISUAL_DEFAULT;
  return { lat: record.lat, lng: record.lng };
}

function projectPoint(lat, lng) {
  const x = ((Number(lng) - 94.2744) / (142.8539 - 94.2744)) * 100;
  const y = ((9.1521 - Number(lat)) / (9.1521 - (-13.5460))) * 100;
  return {
    x: Math.max(3, Math.min(97, x)),
    y: Math.max(6, Math.min(94, y)),
  };
}

function InstallBaseMap({ records = [], stats, selectedProvince = 'all', lang = 'id' }) {
  const points = useMemo(() => {
    const grouped = new Map();
    records.forEach(r => {
      if (selectedProvince !== 'all' && r.province !== selectedProvince) return;
      const mapCoords = mapCoordsFor(r);
      const key = mapLocationKey(r);
      if (!grouped.has(key)) grouped.set(key, { ...r, qty: 0, families: new Set(), mapLat: mapCoords.lat, mapLng: mapCoords.lng });
      const g = grouped.get(key);
      g.qty += Number(r.quantity) || 1;
      g.families.add(r.productFamily || 'Other');
    });
    return [...grouped.values()]
      .sort((a, b) => (Number(a.qty) || 1) - (Number(b.qty) || 1))
      .map(p => ({
        ...p,
        ...projectPoint(p.mapLat, p.mapLng),
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
        .ib-map-stage {
          position: relative;
          z-index: 1;
          height: 330px;
          margin-top: 18px;
          overflow: visible;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .ib-map-canvas {
          position: relative;
          height: 100%;
          aspect-ratio: 1600 / 620;
          max-width: 100%;
        }
        .ib-map-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: fill;
          opacity: 0.62;
          filter: invert(1) sepia(1) saturate(2.2) hue-rotate(150deg) drop-shadow(0 0 16px rgba(76,201,240,0.45)) drop-shadow(0 0 30px rgba(214,179,106,0.20));
        }
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
          <div style={{fontSize: '10px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--ims-gold)', fontWeight: 800}}>
            {L(lang, 'Pusat Komando Install Base HNTI', 'HNTI Installed Base Command Center')}
          </div>
          <div className="serif" style={{fontSize: '34px', marginTop: '6px', color: '#fff', fontWeight: 500}}>
            {L(lang, '203 Unit di Seluruh Indonesia', '203 Units Across Indonesia')}
          </div>
          <div style={{fontSize: '12px', color: 'rgba(255,255,255,0.66)', marginTop: '4px'}}>
            {L(lang, 'Baseline PDF 203 unit; data operasional tampil sebagai live sync terpisah', '203-unit PDF baseline; operations data appears as separate live sync')}
          </div>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(88px, 1fr))', gap: '8px', minWidth: '310px'}}>
          {[
            [L(lang, 'TOTAL UNIT', 'TOTAL UNITS'), stats.totalUnits],
            [L(lang, 'PROVINSI', 'PROVINCES'), stats.provinceCount],
            [L(lang, 'RS/LOKASI', 'HOSPITALS'), stats.hospitalCount],
          ].map(([label, value]) => (
            <div key={label} style={{padding: '10px 12px', background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.12)'}}>
              <div style={{fontSize: '9px', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.16em'}}>{label}</div>
              <div className="serif" style={{fontSize: '24px', color: '#fff', marginTop: '2px'}}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ib-map-stage">
        <div className="ib-map-canvas">
          <img src={indonesiaMapUrl} alt={L(lang, 'Peta Indonesia', 'Indonesia Map')} className="ib-map-img" />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: '36px', borderTop: '1px dashed rgba(214,179,106,0.18)'}} />
          {points.map((p, idx) => {
            const size = Math.min(24, 8 + Math.sqrt(p.qty || 1) * 3.5);
            const isFeatured = (p.qty || 0) >= 3 || /nashrul/i.test(p.hospitalName || '');
            return (
              <div key={`${p.hospitalName}-${idx}`} className="ib-dot" style={{left: `${p.x}%`, top: `${p.y}%`, width: size, height: size, color: p.color, background: p.color, zIndex: 20 + idx, boxShadow: isFeatured ? '0 0 0 3px rgba(255,255,255,0.35), 0 0 22px currentColor, 0 0 44px currentColor' : undefined}}>
                <div className="ib-tip">
                  <strong>{p.hospitalName}</strong><br />
                  {p.province} · {p.qty} {L(lang, 'unit', 'units')}<br />
                  {[...p.families].join(', ')}
                  <div style={{fontSize: '10px', color: 'rgba(255,255,255,0.62)', marginTop: 4}}>
                    {Number(p.lat).toFixed(4)}, {Number(p.lng).toFixed(4)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
    const ok = window.confirm(L(lang, `Hapus data manual ${record.hospitalName}?`, `Delete manual record ${record.hospitalName}?`));
    if (!ok) return;
    setManualRecords(prev => (prev || []).filter(r => r.id !== record.id));
  };

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>
          {L(lang, 'Install Base', 'Install Base')}
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'flex-start', flexWrap: 'wrap'}}>
          <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>
            {L(lang, 'Install Base HNTI', 'HNTI Install Base')}
          </h1>
          {canEdit && (
            <button className="btn-primary" onClick={startAdd} style={{padding: '10px 14px', fontSize: '11px'}}>
              <Plus size={14} /> {L(lang, 'Tambah Manual', 'Add Manual')}
            </button>
          )}
        </div>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>
          {L(lang, 'Peta populasi alat HNTI, baseline 203 unit dan sinkronisasi otomatis dari operasional/BAST.', 'HNTI equipment footprint map with 203-unit PDF baseline and automatic sync from operations/BAST.')}
        </div>
      </div>

      {editing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.62)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) cancelEdit(); }}
        >
          <div id="installbase-manual-form" className="card" style={{width: 'min(980px, 96vw)', maxHeight: '88vh', overflowY: 'auto', borderColor: 'rgba(214,179,106,0.45)', boxShadow: '0 30px 90px rgba(0,0,0,0.55)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px'}}>
              <div>
                <div className="card-title" style={{margin: 0}}>
                  {editing.mode === 'add'
                    ? L(lang, 'Tambah Data Install Base Manual', 'Add Manual Install Base Record')
                    : editing.mode === 'override'
                      ? L(lang, 'Buat Override Manual', 'Create Manual Override')
                      : L(lang, 'Edit Data Manual', 'Edit Manual Record')}
                </div>
                <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: 3}}>
                  {L(lang, 'Isi koordinat latitude/longitude jika ingin titik RS lebih presisi.', 'Enter latitude/longitude for more precise map placement.')}
                </div>
              </div>
              <button onClick={cancelEdit} style={{border: '1px solid var(--ims-border)', background: 'transparent', padding: '8px 10px', cursor: 'pointer'}}><X size={14} /></button>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px'}}>
              {[
                ['hospitalName', L(lang, 'Nama RS/Lokasi *', 'Hospital/Site Name *')],
                ['province', L(lang, 'Provinsi', 'Province')],
                ['city', L(lang, 'Kota/Kabupaten', 'City/Regency')],
                ['product', L(lang, 'Produk', 'Product')],
                ['type', L(lang, 'Tipe', 'Type')],
                ['quantity', L(lang, 'Jumlah Unit', 'Quantity'), 'number'],
                ['installationYear', L(lang, 'Tahun Instalasi', 'Installation Year'), 'number'],
                ['installationDate', L(lang, 'Tanggal Instalasi', 'Installation Date'), 'date'],
                ['lat', L(lang, 'Latitude', 'Latitude'), 'number'],
                ['lng', L(lang, 'Longitude', 'Longitude'), 'number'],
                ['sphNo', L(lang, 'No. SPH', 'SPH No.')],
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
                {L(lang, 'Alamat', 'Address')}
                <input value={form.address || ''} onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))} style={{marginTop: 6}} />
              </label>
            </div>
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px'}}>
              <button onClick={cancelEdit} style={{padding: '9px 12px', border: '1px solid var(--ims-border)', background: 'transparent', cursor: 'pointer'}}>
                {L(lang, 'Batal', 'Cancel')}
              </button>
              <button className="btn-primary" onClick={saveManual} disabled={!form.hospitalName.trim()} style={{padding: '9px 12px', opacity: form.hospitalName.trim() ? 1 : 0.55}}>
                <Save size={14} /> {L(lang, 'Simpan Manual', 'Save Manual')}
              </button>
            </div>
          </div>
        </div>
      )}

      <InstallBaseMap records={filtered} stats={stats} selectedProvince={province} lang={lang} />

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', border: '1px solid var(--ims-border)', margin: '20px 0'}}>
        {[
          [Target, L(lang, 'Total Unit', 'Total Units'), stats.totalUnits, L(lang, 'Baseline PDF + live sync', 'PDF baseline + live sync')],
          [MapPin, L(lang, 'Provinsi', 'Provinces'), stats.provinceCount, L(lang, 'Coverage nasional', 'National coverage')],
          [Activity, L(lang, 'RS/Lokasi', 'Hospitals/Sites'), stats.hospitalCount, L(lang, 'Lokasi teridentifikasi', 'Identified locations')],
          [Zap, L(lang, 'Live Sync', 'Live Sync'), stats.liveExtra, L(lang, 'Tiba di RS / BAST', 'Arrived at hospital / BAST')],
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
          <div className="card-title">{L(lang, 'Top Provinsi Install Base', 'Top Install Base Provinces')}</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.byProvince.slice(0, 10)} layout="vertical" margin={{left: 96}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" horizontal={false} />
              <XAxis type="number" stroke="var(--ims-text-2)" style={{fontSize: 10}} />
              <YAxis type="category" dataKey="province" width={96} stroke="var(--ims-text-2)" style={{fontSize: 10}} />
              <Tooltip contentStyle={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', fontSize: 11, color: '#fff'}} itemStyle={{color: '#fff'}} labelStyle={{color: '#fff'}} />
              <Bar dataKey="qty" fill="#1a4d8a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title">{L(lang, 'Product Family Mix', 'Product Family Mix')}</div>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={stats.byProductFamily}
                dataKey="qty"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={78}
                label={renderPieLabel}
              >
                {stats.byProductFamily.map((entry, i) => <Cell key={entry.name} fill={FAMILY_COLORS[entry.name] || Object.values(FAMILY_COLORS)[i % 8]} />)}
              </Pie>
              <Tooltip contentStyle={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', fontSize: 11, color: '#fff'}} itemStyle={{color: '#fff'}} labelStyle={{color: '#fff'}} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '6px 10px', marginTop: '8px'}}>
            {stats.byProductFamily.map((entry, i) => {
              const color = FAMILY_COLORS[entry.name] || Object.values(FAMILY_COLORS)[i % 8];
              return (
                <div key={entry.name} style={{display: 'flex', alignItems: 'center', gap: 7, color: '#fff', fontSize: '10px'}}>
                  <span style={{width: 9, height: 9, borderRadius: 99, background: color, boxShadow: `0 0 10px ${color}`}} />
                  <span style={{flex: 1}}>{entry.name}</span>
                  <strong>{entry.qty}</strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '14px'}}>
          <div className="card-title" style={{margin: 0}}>{L(lang, 'Detail Install Base', 'Install Base Details')}</div>
          <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
            <select value={province} onChange={e => setProvince(e.target.value)} style={{width: 170}}>
              {provinces.map(p => <option key={p} value={p}>{p === 'all' ? L(lang, 'Semua Provinsi', 'All Provinces') : p}</option>)}
            </select>
            <select value={family} onChange={e => setFamily(e.target.value)} style={{width: 170}}>
              {families.map(f => <option key={f} value={f}>{f === 'all' ? L(lang, 'Semua Produk', 'All Products') : f}</option>)}
            </select>
            <div style={{position: 'relative'}}>
              <Search size={14} style={{position: 'absolute', left: 10, top: 9, color: 'var(--ims-text-2)'}} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={L(lang, 'Cari RS, produk, SPH...', 'Search hospital, product, SPH...')} style={{paddingLeft: 32, width: 230}} />
            </div>
          </div>
        </div>
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px'}}>
            <thead>
              <tr>
                <Th>{L(lang, 'RS/Lokasi', 'Hospital/Site')}</Th>
                <Th>{L(lang, 'Provinsi', 'Province')}</Th>
                <Th>{L(lang, 'Produk', 'Product')}</Th>
                <Th align="right">{L(lang, 'Unit', 'Units')}</Th>
                <Th>{L(lang, 'Tahun', 'Year')}</Th>
                <Th>{L(lang, 'Sumber', 'Source')}</Th>
                <Th>{L(lang, 'Koordinat', 'Coordinates')}</Th>
                <Th>{L(lang, 'Aksi', 'Actions')}</Th>
              </tr>
            </thead>
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
                        <button onClick={() => startEdit(r)} title={String(r.source || '').includes('manual') ? L(lang, 'Edit data manual', 'Edit manual record') : L(lang, 'Buat override manual', 'Create manual override')} style={{border: '1px solid rgba(255,255,255,0.35)', color: '#fff', background: 'rgba(255,255,255,0.06)', padding: '6px 8px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', gap: 4}}>
                          <Pencil size={12} /> {L(lang, 'Edit', 'Edit')}
                        </button>
                        {String(r.source || '').includes('manual') && (
                          <button onClick={() => deleteManual(r)} title={L(lang, 'Hapus data manual', 'Delete manual record')} style={{border: '1px solid rgba(255,140,140,0.45)', color: '#fff', background: 'rgba(192,48,48,0.18)', padding: '6px 8px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', gap: 4}}>
                            <Trash2 size={12} /> {L(lang, 'Hapus', 'Delete')}
                          </button>
                        )}
                      </div>
                    ) : <span style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{L(lang, 'Read-only', 'Read-only')}</span>}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '10px'}}>
          <Sparkles size={12} style={{verticalAlign: 'middle', marginRight: 4}} />
          {L(lang, 'Baseline PDF menampilkan total 203 unit. Detail live bertambah otomatis dari operasional dengan status tiba di RS dan BAST final.', 'PDF baseline shows 203 units total. Live records are added automatically from operations with arrived-at-hospital status and final BAST.')}
        </div>
      </div>
    </div>
  );
}

export { InstallBaseModule, InstallBaseDashboardCard };

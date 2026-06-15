// Extracted from App.jsx during modular refactor.
import { useMemo, useState } from 'react';
import { Download, Edit2, Plus, Search, Trash2, X } from 'lucide-react';
import { ConfirmDialog, Field, Td, Th } from '../components/ui.jsx';
import { downloadCSV } from '../utils/documents.js';
import { getProductFileUrl } from '../utils/domain.js';
const PRODUCT_FILE_TYPES = [
  { key: 'brosur', label: 'Brosur' },
  { key: 'spesifikasi', label: 'Spesifikasi' },
  { key: 'konfigurasi', label: 'Konfigurasi' },
  { key: 'dataKomparasi', label: 'Data Komparasi' },
  { key: 'filePresentasi', label: 'File Presentasi' },
];
function ProductMasterModule({ products, setProducts, t, lang, canEdit, logAction, data }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [filterModality, setFilterModality] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterOrigin, setFilterOrigin] = useState('all');
  const [filterActive, setFilterActive] = useState('all');
  const [deleteId, setDeleteId] = useState(null);

  // Derive filter options from data
  const modalities = useMemo(() => [...new Set(products.map(p => p.modality).filter(Boolean))].sort(), [products]);
  const brands = useMemo(() => [...new Set(products.map(p => p.brand).filter(Boolean))].sort(), [products]);
  const origins = useMemo(() => [...new Set(products.map(p => p.origin).filter(Boolean))].sort(), [products]);

  // Apply all filters
  const filtered = useMemo(() => products.filter(p => {
    if (filterModality !== 'all' && p.modality !== filterModality) return false;
    if (filterBrand !== 'all' && p.brand !== filterBrand) return false;
    if (filterOrigin !== 'all' && p.origin !== filterOrigin) return false;
    if (filterActive === 'active' && !p.active) return false;
    if (filterActive === 'inactive' && p.active) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.name?.toLowerCase().includes(q) &&
          !p.brand?.toLowerCase().includes(q) &&
          !p.type?.toLowerCase().includes(q) &&
          !p.principal?.toLowerCase().includes(q) &&
          !p.modality?.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [products, search, filterModality, filterBrand, filterOrigin, filterActive]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const activeProducts = products.filter(p => p.active).length;
    const byOrigin = {};
    products.forEach(p => { if (p.active) byOrigin[p.origin] = (byOrigin[p.origin] || 0) + 1; });
    // Catatan #2: Usage count by STABLE productId (fallback to modality::type for legacy SPH).
    // This keeps SPH counts intact even after product name/type/principal is edited.
    const usage = new Map();
    (data || []).forEach(s => {
      let pid = s.productId;
      if (!pid) {
        const m = products.find(p => p.modality === s.modality && p.type === s.subModality);
        pid = m ? m.id : null;
      }
      if (pid) usage.set(pid, (usage.get(pid) || 0) + 1);
    });
    return { total: products.length, active: activeProducts, inactive: products.length - activeProducts, byOrigin, usage };
  }, [products, data]);

  const handleSave = (prod) => {
    const isEdit = !!editingProduct;
    if (isEdit) {
      const before = editingProduct;
      setProducts(prev => prev.map(p => p.id === prod.id ? prod : p));
      if (logAction) logAction({ module: 'products', action: 'update', entityId: prod.id, entityLabel: prod.name, field: 'product', before: `${before.brand} ${before.type}`, after: `${prod.brand} ${prod.type}` });
    } else {
      const newProd = { ...prod, id: 'prod_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6) };
      setProducts(prev => [...prev, newProd]);
      if (logAction) logAction({ module: 'products', action: 'create', entityId: newProd.id, entityLabel: newProd.name, note: `Brand: ${newProd.brand}, Type: ${newProd.type}, Origin: ${newProd.origin}` });
    }
    setModalOpen(false); setEditingProduct(null);
  };

  const confirmDelete = () => {
    const prod = products.find(p => p.id === deleteId);
    setProducts(prev => prev.filter(p => p.id !== deleteId));
    if (prod && logAction) logAction({ module: 'products', action: 'delete', entityId: deleteId, entityLabel: prod.name, note: 'Permanently removed from master' });
    setDeleteId(null);
  };

  const toggleActive = (id) => {
    if (!canEdit) return;
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    if (logAction) logAction({ module: 'products', action: 'update', entityId: id, entityLabel: prod.name, field: 'active', before: prod.active, after: !prod.active });
  };

  const exportCSV = () => {
    const header = [lang === 'id' ? 'Nama Produk' : 'Product Name', lang === 'id' ? 'Modalitas' : 'Modality', lang === 'id' ? 'Merek' : 'Brand', lang === 'id' ? 'Tipe' : 'Type', lang === 'id' ? 'Asal' : 'Origin', 'Principal', 'TKDN %', 'AKL', ...PRODUCT_FILE_TYPES.map(f => f.label), lang === 'id' ? 'Status' : 'Status', lang === 'id' ? 'Catatan' : 'Notes'];
    const rows = [header, ...filtered.map(p => [p.name, p.modality, p.brand, p.type, p.origin, p.principal, p.tkdn, p.akl, ...PRODUCT_FILE_TYPES.map(f => getProductFileUrl(p, f.key)), p.active ? 'Aktif' : 'Nonaktif', p.notes || ''])];
    downloadCSV(`HNTI_Product_Master_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  const originFlag = (o) => ({ 'China': '🇨🇳', 'Korea': '🇰🇷', 'Taiwan': '🇹🇼', 'Japan': '🇯🇵', 'Germany': '🇩🇪', 'USA': '🇺🇸' })[o] || '🌐';

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '12px'}}>
        <div>
          <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{lang === 'id' ? 'Master Data' : 'Master Data'}</div>
          <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{lang === 'id' ? 'Master Produk' : 'Product Master'}</h1>
          <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{lang === 'id' ? 'Database produk terpusat — tersinkron ke semua modul' : 'Centralized product database — synced to all modules'}</div>
        </div>
        {canEdit && (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px'}}>
            <button onClick={() => { setEditingProduct(null); setModalOpen(true); }} style={{background: 'var(--ims-bg-alt)', color: '#fff', border: 'none', padding: '10px 18px', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '7px', letterSpacing: '0.03em'}}>
              <Plus size={14} strokeWidth={2} />{lang === 'id' ? 'Tambah Produk' : 'Add Product'}
            </button>
            <span style={{fontSize: '10px', color: 'var(--ims-text-2)', maxWidth: '280px', lineHeight: 1.45, textAlign: 'right'}}>
              {lang === 'id' ? 'Form tambah/edit: Modalitas, Merek & Asal Negara punya opsi ✚ Lainnya' : 'Add/edit form: Modality, Brand & Origin include ✚ Other option'}
            </span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Total Produk' : 'Total Products'}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{kpis.total}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{kpis.active} {lang === 'id' ? 'aktif' : 'active'} · {kpis.inactive} {lang === 'id' ? 'nonaktif' : 'inactive'}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Modalitas' : 'Modalities'}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#1a4d8a'}}>{modalities.length}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Merek' : 'Brands'}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#7b3fb5'}}>{brands.length}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Negara Asal' : 'Countries'}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent-2)'}}>{origins.length}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{origins.map(o => originFlag(o)).join(' ')}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center', flexWrap: 'wrap'}}>
        <div style={{position: 'relative', flex: '1 1 240px', maxWidth: '340px'}}>
          <Search size={14} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ims-text-2)'}} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === 'id' ? 'Cari nama, merek, tipe...' : 'Search name, brand, type...'} style={{paddingLeft: '36px'}} />
        </div>
        <select value={filterModality} onChange={e => setFilterModality(e.target.value)} style={{width: 'auto', minWidth: '120px'}}>
          <option value="all">{lang === 'id' ? 'Semua Modalitas' : 'All Modalities'}</option>
          {modalities.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} style={{width: 'auto', minWidth: '110px'}}>
          <option value="all">{lang === 'id' ? 'Semua Merek' : 'All Brands'}</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={filterOrigin} onChange={e => setFilterOrigin(e.target.value)} style={{width: 'auto', minWidth: '110px'}}>
          <option value="all">{lang === 'id' ? 'Semua Asal' : 'All Origins'}</option>
          {origins.map(o => <option key={o} value={o}>{originFlag(o)} {o}</option>)}
        </select>
        <select value={filterActive} onChange={e => setFilterActive(e.target.value)} style={{width: 'auto', minWidth: '110px'}}>
          <option value="all">{lang === 'id' ? 'Semua Status' : 'All Status'}</option>
          <option value="active">{lang === 'id' ? 'Aktif' : 'Active'}</option>
          <option value="inactive">{lang === 'id' ? 'Nonaktif' : 'Inactive'}</option>
        </select>
        <button onClick={exportCSV} style={{background: 'var(--ims-accent-2)', border: 'none', color: '#fff', padding: '6px 12px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto'}}>
          <Download size={12} />CSV ({filtered.length})
        </button>
      </div>

      {/* Product table */}
      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', minWidth: '1000px'}}>
          <thead>
            <tr style={{background: 'var(--ims-bg-card-2)'}}>
              <Th>{lang === 'id' ? 'Nama Produk' : 'Product Name'}</Th>
              <Th>{lang === 'id' ? 'Modalitas' : 'Modality'}</Th>
              <Th>{lang === 'id' ? 'Merek' : 'Brand'}</Th>
              <Th>{lang === 'id' ? 'Tipe' : 'Type'}</Th>
              <Th>{lang === 'id' ? 'Asal' : 'Origin'}</Th>
              <Th>Principal</Th>
              <Th align="right">TKDN</Th>
              <Th align="center">{lang === 'id' ? 'File' : 'Files'}</Th>
              <Th align="center">{lang === 'id' ? 'Dipakai' : 'Used'}</Th>
              <Th align="center">{lang === 'id' ? 'Status' : 'Status'}</Th>
              {canEdit && <Th align="center">{lang === 'id' ? 'Aksi' : 'Actions'}</Th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><Td colSpan={canEdit ? 11 : 10}><div className="empty-state">{lang === 'id' ? 'Tidak ada produk yang sesuai filter' : 'No products match filter'}</div></Td></tr>
            )}
            {filtered.map(p => {
              const used = kpis.usage.get(p.id) || 0;
              return (
                <tr key={p.id} className="hover-row" style={{borderTop: '1px solid var(--ims-border)', opacity: p.active ? 1 : 0.55}}>
                  <Td>
                    <div style={{fontWeight: 600, color: 'var(--ims-text)'}}>{p.name}</div>
                    {p.notes && <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px', fontStyle: 'italic', maxWidth: '280px'}}>{p.notes}</div>}
                  </Td>
                  <Td>{p.modality}</Td>
                  <Td><span style={{fontWeight: 500}}>{p.brand}</span></Td>
                  <Td>{p.type}</Td>
                  <Td><span style={{fontSize: '13px'}}>{originFlag(p.origin)}</span> {p.origin}</Td>
                  <Td><span style={{fontSize: '11px'}}>{p.principal}</span></Td>
                  <Td align="right"><span className="mono" style={{fontSize: '11px', color: (p.tkdn || 0) >= 20 ? 'var(--ims-accent-2)' : 'var(--ims-text-2)'}}>{p.tkdn || 0}%</span></Td>
                  <Td align="center">
                    <span style={{padding: '2px 8px', fontSize: '10px', background: 'rgba(91,135,184,0.16)', color: 'var(--ims-text-2)', fontWeight: 700, borderRadius: '3px'}}>
                      {PRODUCT_FILE_TYPES.filter(f => getProductFileUrl(p, f.key)).length}/5
                    </span>
                  </Td>
                  <Td align="center">
                    {used > 0 ? (
                      <span style={{padding: '2px 8px', fontSize: '10px', background: '#1a4d8a22', color: '#1a4d8a', fontWeight: 600, borderRadius: '3px'}}>{used}× SPH</span>
                    ) : (
                      <span style={{fontSize: '10px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>—</span>
                    )}
                  </Td>
                  <Td align="center">
                    <button onClick={() => toggleActive(p.id)} disabled={!canEdit} style={{padding: '3px 9px', fontSize: '10px', background: p.active ? 'var(--ims-accent-2)' : 'var(--ims-text-2)', color: '#fff', border: 'none', cursor: canEdit ? 'pointer' : 'default', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderRadius: '3px'}}>{p.active ? (lang === 'id' ? 'Aktif' : 'Active') : (lang === 'id' ? 'Nonaktif' : 'Inactive')}</button>
                  </Td>
                  {canEdit && (
                    <Td align="center">
                      <div style={{display: 'flex', gap: '4px', justifyContent: 'center'}}>
                        <button onClick={() => { setEditingProduct(p); setModalOpen(true); }} style={{background: 'transparent', border: '1px solid #1a4d8a', color: '#1a4d8a', padding: '4px 6px', cursor: 'pointer'}} title={lang === 'id' ? 'Edit' : 'Edit'}>
                          <Edit2 size={11} />
                        </button>
                        <button onClick={() => setDeleteId(p.id)} disabled={used > 0} style={{background: 'transparent', border: '1px solid ' + (used > 0 ? 'var(--ims-border)' : '#c03030'), color: used > 0 ? 'var(--ims-border)' : '#c03030', padding: '4px 6px', cursor: used > 0 ? 'not-allowed' : 'pointer'}} title={used > 0 ? (lang === 'id' ? `Tidak bisa dihapus, masih dipakai di ${used} SPH` : `Cannot delete, used in ${used} SPH`) : (lang === 'id' ? 'Hapus' : 'Delete')}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </Td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      {modalOpen && (
        <ProductModal product={editingProduct} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditingProduct(null); }} t={t} lang={lang} existing={products} />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title={lang === 'id' ? 'Hapus Produk?' : 'Delete Product?'}
        message={lang === 'id' ? `Hapus produk "${products.find(p => p.id === deleteId)?.name || ''}" dari master? Aksi ini tidak bisa dibatalkan.` : `Delete product "${products.find(p => p.id === deleteId)?.name || ''}" from master? This cannot be undone.`}
        onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} danger lang={lang}
      />
    </div>
  );
}
const PRODUCT_STANDARD_ORIGINS = ['China', 'Korea', 'Taiwan', 'Japan', 'Germany', 'USA', 'Netherlands', 'Italy'];
const productUniqueOptions = (rows, field) => Array.from(new Set(rows.map(p => p[field]).filter(Boolean))).sort();

function ProductModal({ product, onSave, onCancel, t, lang, existing = [] }) {
  const isEdit = !!product;
  const normalizedProduct = product ? {
    ...product,
    productFiles: PRODUCT_FILE_TYPES.reduce((acc, f) => ({ ...acc, [f.key]: getProductFileUrl(product, f.key) }), {}),
  } : null;
  const [form, setForm] = useState(normalizedProduct || {
    name: '', modality: '', brand: '', type: '', origin: '', principal: '', tkdn: 0, akl: '', active: true, notes: '', productFiles: {},
  });
  const [error, setError] = useState('');
  const [otherFields, setOtherFields] = useState(() => {
    if (!normalizedProduct) return {};
    const init = {};
    const check = (field, opts) => {
      const v = normalizedProduct[field];
      if (v && !opts.includes(v)) init[field] = true;
    };
    check('modality', productUniqueOptions(existing, 'modality'));
    check('brand', productUniqueOptions(existing, 'brand'));
    check('type', productUniqueOptions(existing, 'type'));
    check('principal', productUniqueOptions(existing, 'principal'));
    check('origin', [...new Set([...PRODUCT_STANDARD_ORIGINS, ...productUniqueOptions(existing, 'origin')])]);
    return init;
  });
  const otherOptionLabel = lang === 'id' ? 'Lainnya' : 'Other';

  const uniqueOptions = productUniqueOptions;
  const modalityOptions = useMemo(() => uniqueOptions(existing, 'modality'), [existing]);
  const brandOptions = useMemo(() => {
    const scoped = existing.filter(p => !form.modality || p.modality === form.modality);
    return uniqueOptions(scoped.length ? scoped : existing, 'brand');
  }, [existing, form.modality]);
  const originOptions = useMemo(() => [...new Set([...PRODUCT_STANDARD_ORIGINS, ...uniqueOptions(existing, 'origin')])].sort(), [existing]);
  const typeOptions = useMemo(() => {
    const scoped = existing.filter(p => (!form.modality || p.modality === form.modality) && (!form.brand || p.brand === form.brand));
    return uniqueOptions(scoped.length ? scoped : existing, 'type');
  }, [existing, form.modality, form.brand]);
  const principalOptions = useMemo(() => {
    const scoped = existing.filter(p => (!form.modality || p.modality === form.modality) && (!form.brand || p.brand === form.brand));
    return uniqueOptions(scoped.length ? scoped : existing, 'principal');
  }, [existing, form.modality, form.brand]);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const updateProductFile = (key, value) => setForm(f => ({ ...f, productFiles: { ...(f.productFiles || {}), [key]: value } }));
  const updateMasterSelect = (field, value) => {
    if (value === otherOptionLabel) {
      setOtherFields(prev => ({ ...prev, [field]: true }));
      update(field, '');
      return;
    }
    setOtherFields(prev => ({ ...prev, [field]: false }));
    update(field, value);
  };
  const renderMasterSelectWithOther = (field, label, options, placeholder) => (
    <Field label={label}>
      <select value={otherFields[field] ? otherOptionLabel : (form[field] || '')} onChange={e => updateMasterSelect(field, e.target.value)}>
        <option value="">{lang === 'id' ? '— Pilih —' : '— Select —'}</option>
        <option value={otherOptionLabel}>{lang === 'id' ? '✚ Lainnya (isi manual)' : '✚ Other (type manually)'}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      {otherFields[field] && (
        <input
          value={form[field] || ''}
          onChange={e => update(field, e.target.value)}
          placeholder={placeholder}
          style={{marginTop: '8px', borderColor: 'var(--ims-accent)'}}
          autoFocus
        />
      )}
    </Field>
  );

  const handleSubmit = () => {
    if (!form.name?.trim() || !form.brand?.trim() || !form.modality?.trim() || !form.type?.trim()) {
      setError(lang === 'id' ? 'Nama, Modalitas, Merek, dan Tipe wajib diisi.' : 'Name, Modality, Brand, and Type are required.');
      return;
    }
    // Check duplicate (same brand+type, exclude own)
    const dup = existing.find(p => p.id !== form.id && p.brand?.toLowerCase() === form.brand.toLowerCase().trim() && p.type?.toLowerCase() === form.type.toLowerCase().trim());
    if (dup) {
      setError(lang === 'id' ? `Produk dengan merek "${form.brand}" dan tipe "${form.type}" sudah ada.` : `Product with brand "${form.brand}" and type "${form.type}" already exists.`);
      return;
    }
    onSave({ ...form, name: form.name.trim(), brand: form.brand.trim(), type: form.type.trim(), productFiles: PRODUCT_FILE_TYPES.reduce((acc, f) => ({ ...acc, [f.key]: String(form.productFiles?.[f.key] || '').trim() }), {}) });
  };

  return (
    <div className="modal-overlay" onClick={onCancel} style={{zIndex: 9999}}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '640px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--ims-border)'}}>
          <h2 className="serif" style={{margin: 0, fontSize: '22px', fontWeight: 500}}>{isEdit ? (lang === 'id' ? 'Edit Produk' : 'Edit Product') : (lang === 'id' ? 'Tambah Produk Baru' : 'Add New Product')}</h2>
          <button onClick={onCancel} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>
        <div style={{padding: '20px 24px', maxHeight: '70vh', overflowY: 'auto'}}>
          {error && <div style={{padding: '10px 14px', background: '#2a1414', border: '1px solid #c03030', color: '#c03030', fontSize: '12px', marginBottom: '14px'}}>{error}</div>}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px'}}>
            <Field label={lang === 'id' ? 'Nama Produk (Display)' : 'Product Name (Display)'}>
              <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="contoh: MRI 1.5T Supermark" />
              <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{lang === 'id' ? 'Format: [Tipe] [Merek] — tampil di SPH' : 'Format: [Type] [Brand] — shown on SPH'}</div>
            </Field>
            {renderMasterSelectWithOther('modality', lang === 'id' ? 'Modalitas' : 'Modality', modalityOptions, lang === 'id' ? 'Tulis modalitas baru' : 'Enter new modality')}
            {renderMasterSelectWithOther('brand', lang === 'id' ? 'Merek' : 'Brand', brandOptions, lang === 'id' ? 'Tulis merek baru' : 'Enter new brand')}
            {renderMasterSelectWithOther('type', lang === 'id' ? 'Tipe / Model' : 'Type / Model', typeOptions, lang === 'id' ? 'Tulis tipe/model baru' : 'Enter new type/model')}
            {renderMasterSelectWithOther('origin', lang === 'id' ? 'Negara Asal' : 'Country of Origin', originOptions, lang === 'id' ? 'Tulis negara asal baru' : 'Enter new country of origin')}
            {renderMasterSelectWithOther('principal', lang === 'id' ? 'Principal (Pabrikan)' : 'Principal (Manufacturer)', principalOptions, lang === 'id' ? 'Tulis principal baru' : 'Enter new principal')}
            <Field label="TKDN %">
              <input type="number" min="0" max="100" value={form.tkdn} onChange={e => update('tkdn', Number(e.target.value) || 0)} placeholder="0-100" />
              <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{lang === 'id' ? '≥20% lolos lelang LKPP P3DN' : '≥20% qualifies for LKPP tender'}</div>
            </Field>
            <Field label="AKL (Izin Edar Kemenkes)">
              <input value={form.akl} onChange={e => update('akl', e.target.value)} placeholder="KEMENKES RI AKL ..." />
            </Field>
          </div>
          <Field label={lang === 'id' ? 'Catatan' : 'Notes'}>
            <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={2} placeholder={lang === 'id' ? 'Spesifikasi singkat, fitur unggulan, dll' : 'Brief spec, key features, etc'} />
          </Field>
          <div style={{marginTop: '14px', padding: '12px', background: 'var(--ims-bg-card-2)', border: '1px solid var(--ims-border)'}}>
            <div className="card-title" style={{marginBottom: '10px'}}>{lang === 'id' ? 'File Produk - Google Drive' : 'Product Files - Google Drive'}</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
              {PRODUCT_FILE_TYPES.map(ft => (
                <Field key={ft.key} label={ft.label}>
                  <input type="url" value={form.productFiles?.[ft.key] || ''} onChange={e => updateProductFile(ft.key, e.target.value)} placeholder="https://drive.google.com/..." />
                </Field>
              ))}
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', padding: '12px', background: 'var(--ims-gold-bg)', border: '1px solid var(--ims-accent)'}}>
            <input type="checkbox" id="prod-active" checked={!!form.active} onChange={e => update('active', e.target.checked)} style={{width: '16px', height: '16px', cursor: 'pointer'}} />
            <label htmlFor="prod-active" style={{fontSize: '12px', cursor: 'pointer', color: '#5a4a1a'}}>
              <strong>{lang === 'id' ? 'Produk Aktif' : 'Active Product'}</strong> · {lang === 'id' ? 'Tampil di dropdown SPH' : 'Shown in SPH dropdown'}
            </label>
          </div>
        </div>
        <div style={{padding: '16px 24px', borderTop: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
          <button onClick={onCancel} style={{background: 'transparent', border: '1px solid var(--ims-border)', color: 'var(--ims-text-2)', padding: '8px 18px', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer'}}>{lang === 'id' ? 'Batal' : 'Cancel'}</button>
          <button onClick={handleSubmit} style={{background: 'var(--ims-bg-alt)', color: '#fff', border: 'none', padding: '8px 18px', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer', fontWeight: 600}}>{lang === 'id' ? 'Simpan' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

export { PRODUCT_FILE_TYPES, ProductMasterModule, ProductModal };

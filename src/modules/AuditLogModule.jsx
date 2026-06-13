// Extracted from App.jsx during modular refactor.
import { useMemo, useState } from 'react';
import { Download, Search, Trash2 } from 'lucide-react';
import { Td, Th } from '../components/ui.jsx';
import { MAX_AUDIT_ENTRIES } from '../constants/storageKeys.js';
import { downloadCSV } from '../utils/documents.js';
import { resolveEmpName } from '../utils/domain.js';
function AuditLogModule({ auditLog, setAuditLog, employees, t, lang }) {
  const [filterUser, setFilterUser] = useState('all');
  const [filterModule, setFilterModule] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [search, setSearch] = useState('');
  // Cleanup state (Tahap 11 — Phase 1)
  const [cleanupDays, setCleanupDays] = useState('90');
  const [cleanupConfirm, setCleanupConfirm] = useState(false);
  const handleCleanup = () => {
    if (typeof setAuditLog !== 'function') return;
    if (cleanupDays === 'all') {
      setAuditLog([]);
    } else {
      const cutoffMs = Date.now() - parseInt(cleanupDays) * 86400 * 1000;
      setAuditLog(prev => prev.filter(e => {
        const t = new Date(e.timestamp).getTime();
        return !isFinite(t) || t >= cutoffMs;
      }));
    }
    setCleanupConfirm(false);
  };
  // Hitung size estimate dari JSON.stringify
  const sizeKB = useMemo(() => Math.round(JSON.stringify(auditLog).length / 1024), [auditLog]);

  const filteredLog = useMemo(() => {
    return auditLog.filter(entry => {
      if (filterUser !== 'all' && entry.user !== filterUser) return false;
      if (filterModule !== 'all' && entry.module !== filterModule) return false;
      if (filterAction !== 'all' && entry.action !== filterAction) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!entry.entityLabel?.toLowerCase().includes(q) &&
            !entry.userName?.toLowerCase().includes(q) &&
            !entry.field?.toLowerCase().includes(q) &&
            !entry.note?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [auditLog, filterUser, filterModule, filterAction, search]);

  const uniqueUsers = useMemo(() => [...new Set(auditLog.map(e => e.user).filter(Boolean))], [auditLog]);
  const uniqueModules = useMemo(() => [...new Set(auditLog.map(e => e.module).filter(Boolean))], [auditLog]);
  const uniqueActions = useMemo(() => [...new Set(auditLog.map(e => e.action).filter(Boolean))], [auditLog]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: auditLog.length,
      todayCount: auditLog.filter(e => e.timestamp?.startsWith(today)).length,
      uniqueUsers: uniqueUsers.length,
      creates: auditLog.filter(e => e.action === 'create').length,
      updates: auditLog.filter(e => e.action === 'update').length,
      deletes: auditLog.filter(e => e.action === 'delete').length,
    };
  }, [auditLog, uniqueUsers]);

  const exportCSV = () => {
    const header = ['Timestamp', lang === 'id' ? 'Pengguna' : 'User', 'Role', lang === 'id' ? 'Modul' : 'Module', lang === 'id' ? 'Aksi' : 'Action', lang === 'id' ? 'Entitas' : 'Entity', lang === 'id' ? 'Field' : 'Field', lang === 'id' ? 'Sebelum' : 'Before', lang === 'id' ? 'Sesudah' : 'After', lang === 'id' ? 'Catatan' : 'Note'];
    const rows = [header, ...filteredLog.map(e => [e.timestamp, e.userName || e.user, e.role || '', e.module, e.action, e.entityLabel || '', e.field || '', e.before == null ? '' : String(e.before), e.after == null ? '' : String(e.after), e.note || ''])];
    downloadCSV(`HNTI_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  const actionColor = (a) => ({
    create: 'var(--ims-accent-2)', update: '#1a4d8a', delete: '#c03030', login: '#7b3fb5', logout: 'var(--ims-text-2)', export: 'var(--ims-gold)', import: '#0f7a5a', refresh: '#5b87b8',
  })[a] || 'var(--ims-text-2)';
  const moduleLabel = (m) => ({
    sph: 'SPH', pipeline: 'Pipeline', finance: 'Finance', operations: lang === 'id' ? 'Operasional' : 'Operations',
    installation: lang === 'id' ? 'Instalasi' : 'Installation', maintenance: 'Maintenance', regulatory: 'Regulatory',
    business_trip: lang === 'id' ? 'Perjalanan Dinas' : 'Business Trip', employees: lang === 'id' ? 'Karyawan' : 'Employees',
    auth: lang === 'id' ? 'Autentikasi' : 'Authentication', sales_report: lang === 'id' ? 'Laporan Lapangan' : 'Field Report',
  })[m] || m;

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{lang === 'id' ? 'Jejak Audit' : 'Audit Trail'}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{lang === 'id' ? 'Log Perubahan Sistem' : 'System Change Log'}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{lang === 'id' ? 'Setiap aksi di sistem terekam — SOX compliance ready' : 'Every action is logged — SOX compliance ready'}</div>
      </div>

      {/* KPI cards */}
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Total Entri' : 'Total Entries'}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{stats.total}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'Sejak login pertama' : 'Since first login'}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Hari Ini' : 'Today'}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent)'}}>{stats.todayCount}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'Aksi tercatat' : 'Actions logged'}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Pengguna Aktif' : 'Active Users'}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#1a4d8a'}}>{stats.uniqueUsers}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Edit / Hapus' : 'Edits / Deletes'}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>
            <span style={{color: '#1a4d8a'}}>{stats.updates}</span>
            <span style={{color: 'var(--ims-text-2)', fontSize: '16px'}}> · </span>
            <span style={{color: '#c03030'}}>{stats.deletes}</span>
          </div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>+{stats.creates} {lang === 'id' ? 'buat' : 'creates'}</div>
        </div>
      </div>

      {/* Filters + Export */}
      <div style={{display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center', flexWrap: 'wrap'}}>
        <div style={{position: 'relative', flex: '1 1 220px', maxWidth: '320px'}}>
          <Search size={14} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ims-text-2)'}} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === 'id' ? 'Cari user, entitas, catatan...' : 'Search user, entity, note...'} style={{paddingLeft: '36px'}} />
        </div>
        <select value={filterUser} onChange={e => setFilterUser(e.target.value)} style={{width: 'auto', minWidth: '120px'}}>
          <option value="all">{lang === 'id' ? 'Semua Pengguna' : 'All Users'}</option>
          {uniqueUsers.map(u => <option key={u} value={u}>{resolveEmpName(employees, u)}</option>)}
        </select>
        <select value={filterModule} onChange={e => setFilterModule(e.target.value)} style={{width: 'auto', minWidth: '120px'}}>
          <option value="all">{lang === 'id' ? 'Semua Modul' : 'All Modules'}</option>
          {uniqueModules.map(m => <option key={m} value={m}>{moduleLabel(m)}</option>)}
        </select>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)} style={{width: 'auto', minWidth: '110px'}}>
          <option value="all">{lang === 'id' ? 'Semua Aksi' : 'All Actions'}</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <button onClick={exportCSV} style={{background: 'var(--ims-accent-2)', border: 'none', color: '#fff', padding: '6px 12px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto'}} title={lang === 'id' ? 'Export ke CSV' : 'Export to CSV'}>
          <Download size={12} />CSV ({filteredLog.length})
        </button>
      </div>

      {/* Storage Management — Cleanup UI (Tahap 11 — Phase 1) */}
      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', padding: '14px 18px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Trash2 size={14} strokeWidth={1.5} style={{color: 'var(--ims-text-2)'}} />
          <span style={{fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>
            {lang === 'id' ? 'Manajemen Penyimpanan' : 'Storage Management'}
          </span>
        </div>
        <div style={{fontSize: '11.5px', color: 'var(--ims-text-2)'}}>
          {lang === 'id' ? 'Total' : 'Total'}: <strong style={{color: 'var(--ims-text)'}}>{auditLog.length}</strong> {lang === 'id' ? 'entri' : 'entries'} ({sizeKB} KB)
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto'}}>
          <span style={{fontSize: '11.5px', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Hapus log lebih lama dari:' : 'Delete logs older than:'}</span>
          <select value={cleanupDays} onChange={e => setCleanupDays(e.target.value)} style={{width: 'auto', minWidth: '110px'}}>
            <option value="7">7 {lang === 'id' ? 'hari' : 'days'}</option>
            <option value="30">30 {lang === 'id' ? 'hari' : 'days'}</option>
            <option value="90">90 {lang === 'id' ? 'hari' : 'days'}</option>
            <option value="180">180 {lang === 'id' ? 'hari' : 'days'}</option>
            <option value="365">365 {lang === 'id' ? 'hari' : 'days'}</option>
            <option value="all">{lang === 'id' ? 'Semua (hapus total)' : 'All (delete all)'}</option>
          </select>
          <button onClick={() => setCleanupConfirm(true)} style={{background: 'transparent', border: '1px solid #c03030', color: '#c03030', padding: '6px 12px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600}}>
            {lang === 'id' ? 'Hapus' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Cleanup confirmation modal */}
      {cleanupConfirm && (
        <div className="modal-overlay" onClick={() => setCleanupConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '440px'}}>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c03030', fontWeight: 700, marginBottom: '12px'}}>
              {lang === 'id' ? 'Konfirmasi Penghapusan' : 'Confirm Deletion'}
            </div>
            <div style={{fontSize: '14px', color: 'var(--ims-text)', marginBottom: '8px', lineHeight: 1.5}}>
              {cleanupDays === 'all'
                ? (lang === 'id' ? `Hapus SEMUA ${auditLog.length} entri log? Tindakan ini tidak dapat dibatalkan.` : `Delete ALL ${auditLog.length} log entries? This cannot be undone.`)
                : (lang === 'id' ? `Hapus entri log yang lebih lama dari ${cleanupDays} hari? Tindakan ini tidak dapat dibatalkan.` : `Delete log entries older than ${cleanupDays} days? This cannot be undone.`)}
            </div>
            <div style={{fontSize: '12px', color: 'var(--ims-text-2)', marginBottom: '20px', lineHeight: 1.5}}>
              {lang === 'id' ? 'Data terhapus akan sync ke semua device dalam beberapa detik.' : 'Deleted data will sync across all devices within seconds.'}
            </div>
            <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
              <button onClick={() => setCleanupConfirm(false)} className="btn-ghost">
                {lang === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button onClick={handleCleanup} style={{background: '#c03030', border: 'none', color: '#fff', padding: '9px 18px', fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600}}>
                {lang === 'id' ? 'Hapus Sekarang' : 'Delete Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log table */}
      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', minWidth: '900px'}}>
          <thead>
            <tr style={{background: 'var(--ims-bg-card-2)'}}>
              <Th>{lang === 'id' ? 'Waktu' : 'Timestamp'}</Th>
              <Th>{lang === 'id' ? 'Pengguna' : 'User'}</Th>
              <Th>{lang === 'id' ? 'Modul' : 'Module'}</Th>
              <Th>{lang === 'id' ? 'Aksi' : 'Action'}</Th>
              <Th>{lang === 'id' ? 'Entitas' : 'Entity'}</Th>
              <Th>{lang === 'id' ? 'Perubahan' : 'Change'}</Th>
            </tr>
          </thead>
          <tbody>
            {filteredLog.length === 0 && (
              <tr><Td colSpan={6}><div className="empty-state">{lang === 'id' ? 'Belum ada aktivitas tercatat' : 'No activity logged yet'}</div></Td></tr>
            )}
            {filteredLog.map(entry => {
              const dt = entry.timestamp ? new Date(entry.timestamp) : null;
              return (
                <tr key={entry.id} className="hover-row" style={{borderTop: '1px solid var(--ims-border)'}}>
                  <Td>
                    <span className="mono" style={{fontSize: '10.5px', color: 'var(--ims-text)'}}>{dt ? dt.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', { dateStyle: 'short', timeStyle: 'medium' }) : '—'}</span>
                  </Td>
                  <Td>
                    <div style={{fontWeight: 500}}>{entry.userName || entry.user}</div>
                    <div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{entry.role || '—'}</div>
                  </Td>
                  <Td>{moduleLabel(entry.module)}</Td>
                  <Td><span style={{padding: '2px 8px', fontSize: '10px', background: actionColor(entry.action) + '22', color: actionColor(entry.action), fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderRadius: '3px'}}>{entry.action}</span></Td>
                  <Td><span style={{fontSize: '11px'}}>{entry.entityLabel || '—'}</span></Td>
                  <Td>
                    {entry.field ? (
                      <div style={{fontSize: '11px'}}>
                        <span style={{color: 'var(--ims-text-2)'}}>{entry.field}: </span>
                        {entry.before != null && <span style={{color: '#c03030', textDecoration: 'line-through'}}>{String(entry.before).substring(0, 30)}</span>}
                        {entry.before != null && entry.after != null && <span style={{color: 'var(--ims-text-2)'}}> → </span>}
                        {entry.after != null && <span style={{color: 'var(--ims-accent-2)', fontWeight: 500}}>{String(entry.after).substring(0, 30)}</span>}
                      </div>
                    ) : (
                      <span style={{fontSize: '11px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{entry.note || '—'}</span>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {auditLog.length >= MAX_AUDIT_ENTRIES && (
        <div style={{marginTop: '10px', padding: '8px 12px', background: 'var(--ims-gold-bg)', border: '1px solid var(--ims-accent)', fontSize: '11px', color: '#5a4a1a'}}>
          ⚠ {lang === 'id' ? `Log mencapai batas maksimum ${MAX_AUDIT_ENTRIES} entri. Entri terlama akan otomatis dihapus saat aksi baru ditambahkan.` : `Log reached maximum of ${MAX_AUDIT_ENTRIES} entries. Oldest entries will be auto-removed on new activity.`}
        </div>
      )}
    </div>
  );
}

export { AuditLogModule };

// Extracted from App.jsx during modular refactor.
import { useMemo, useState } from 'react';
import { Edit2, Lock, Trash2, Upload, UserCheck, UserPlus, UserX, Users, X } from 'lucide-react';
import { ConfirmDialog, Field, Td, Th } from '../components/ui.jsx';
import { NAV_BY_ROLE, OFFICE_SALES_ID, POSITION_ALLOWANCE } from '../constants/org.js';
import { employeeSalesId, resolveEmpName, todayISO } from '../utils/domain.js';
import { initialOf } from '../utils/format.js';
import { showToast } from '../utils/toast.js';
function ModuleAccessPanel({ employees, moduleAccess, setModuleAccess, t, lang, empView, setEmpView, logAction }) {
  const ALL_MODULES = NAV_BY_ROLE.super_admin; // canonical ordered list of 21 modules
  const emps = useMemo(() => Object.entries(employees)
    .filter(([u, e]) => e && e.role !== 'super_admin') // CEO always retains full access — not editable here
    .map(([username, e]) => ({ username, ...e }))
    .sort((a, b) => ((a.active === false) - (b.active === false)) || (a.name || '').localeCompare(b.name || '')), [employees]);
  const effSet = (username, role) => {
    const ov = moduleAccess[username];
    return new Set(Array.isArray(ov) ? ov : (NAV_BY_ROLE[role] || ['dashboard']));
  };
  const toggle = (username, role, mod) => {
    if (mod === 'dashboard') return; // dashboard always on (prevents empty nav / lockout)
    setModuleAccess(prev => {
      const cur = new Set(Array.isArray(prev[username]) ? prev[username] : (NAV_BY_ROLE[role] || ['dashboard']));
      if (cur.has(mod)) cur.delete(mod); else cur.add(mod);
      cur.add('dashboard');
      const ordered = ALL_MODULES.filter(id => cur.has(id));
      if (logAction) logAction({ module: 'employees', action: 'update', entityId: username, entityLabel: `${lang === 'id' ? 'Akses modul' : 'Module access'}: ${username}`, field: mod, note: cur.has(mod) ? 'grant' : 'revoke' });
      return { ...prev, [username]: ordered };
    });
  };
  const resetDefault = (username) => {
    setModuleAccess(prev => { const c = { ...prev }; delete c[username]; return c; });
    if (logAction) logAction({ module: 'employees', action: 'update', entityId: username, entityLabel: `${lang === 'id' ? 'Akses modul' : 'Module access'}: ${username}`, note: 'reset to role default' });
  };
  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_employees}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.emp_title}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{lang === 'id' ? 'Atur modul yang dapat diakses tiap karyawan. Default mengikuti perannya — Anda bisa menambah atau mengurangi. Dasbor selalu aktif.' : 'Configure which modules each employee can open. Defaults follow their role — you may add or remove. Dashboard is always on.'}</div>
      </div>
      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid var(--ims-border)'}}>
        <button onClick={() => setEmpView('list')} style={{background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: 'var(--ims-text-2)', borderBottom: '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px'}}><Users size={14} strokeWidth={1.5} />{lang === 'id' ? 'Daftar Karyawan' : 'Employee List'}</button>
        <button onClick={() => setEmpView('access')} style={{background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: 'var(--ims-text)', borderBottom: '2px solid var(--ims-border)', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px'}}><Lock size={14} strokeWidth={1.5} />{lang === 'id' ? 'Otorisasi Akses Modul' : 'Module Authorization'}</button>
      </div>
      <div style={{padding: '10px 14px', background: '#102018', borderLeft: '3px solid var(--ims-accent-2)', fontSize: '11px', color: '#1a4d2a', marginBottom: '16px'}}>
        🔒 {lang === 'id' ? 'Panel ini hanya dapat diakses oleh Anda (CEO). Perubahan langsung tersimpan dan berlaku saat karyawan login berikutnya.' : 'This panel is accessible only by you (CEO). Changes save instantly and apply on the employee next login.'}
      </div>
      {emps.map(emp => {
        const set = effSet(emp.username, emp.role);
        const hasOverride = Array.isArray(moduleAccess[emp.username]);
        const inactive = emp.active === false;
        return (
          <div key={emp.username} style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', padding: '16px 18px', marginBottom: '14px', opacity: inactive ? 0.6 : 1}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px'}}>
              <div>
                <div style={{fontSize: '14px', fontWeight: 600}}>{emp.name}{inactive && <span style={{fontSize: '10px', color: 'var(--ims-accent)', marginLeft: '8px'}}>({lang === 'id' ? 'nonaktif' : 'inactive'}{emp.joinDate && emp.active === false ? ` · ${lang === 'id' ? 'mulai' : 'from'} ${emp.joinDate}` : ''})</span>}</div>
                <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{emp.position || emp.role} · <span className="mono">@{emp.username}</span> · {set.size} {lang === 'id' ? 'modul' : 'modules'} · {hasOverride ? (lang === 'id' ? 'kustom' : 'custom') : (lang === 'id' ? 'default peran' : 'role default')}</div>
              </div>
              <button onClick={() => resetDefault(emp.username)} disabled={!hasOverride} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '6px 12px', fontSize: '11px', fontFamily: 'inherit', cursor: hasOverride ? 'pointer' : 'default', color: hasOverride ? 'var(--ims-accent)' : '#c4bca8', borderRadius: '4px'}}>{lang === 'id' ? 'Reset ke Default' : 'Reset to Default'}</button>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '6px'}}>
              {ALL_MODULES.map(mod => {
                const on = set.has(mod);
                const locked = mod === 'dashboard';
                return (
                  <button key={mod} onClick={() => toggle(emp.username, emp.role, mod)} disabled={locked} title={locked ? (lang === 'id' ? 'Dasbor selalu aktif' : 'Dashboard always on') : ''} style={{padding: '8px 10px', fontSize: '11px', fontFamily: 'inherit', textAlign: 'left', cursor: locked ? 'default' : 'pointer', background: on ? '#1a4d2a' : '#fff', color: on ? '#fff' : 'var(--ims-text-2)', border: `1px solid ${on ? '#1a4d2a' : 'var(--ims-border)'}`, display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '4px'}}>
                    <span style={{fontSize: '12px', fontWeight: 700}}>{on ? '✓' : '○'}</span>{t[`nav_${mod}`] || mod}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {emps.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: 'var(--ims-text-2)', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>{t.no_data}</div>}
    </div>
  );
}
function EmployeesModule({ employees, setEmployees, setData, setReports, setBusinessTrips, setRealizations, t, lang, session, fmt, moduleAccess = {}, setModuleAccess, logAction }) {
  const canManage = ['super_admin', 'gm', 'manager_ops'].includes(session.role);
  const isCEO = session.role === 'super_admin';
  const [empView, setEmpView] = useState('list');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [confirmDeactivateUser, setConfirmDeactivateUser] = useState(null);
  const [confirmActivateUser, setConfirmActivateUser] = useState(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const [resetPwUser, setResetPwUser] = useState(null);
  const [filter, setFilter] = useState('all');

  // PERFORMANCE: Memoize transformation + filter
  const employeeArr = useMemo(() => Object.entries(employees).map(([username, data]) => ({ username, ...data })), [employees]);

  const filtered = useMemo(() => filter === 'active' ? employeeArr.filter(e => e.active !== false)
    : filter === 'inactive' ? employeeArr.filter(e => e.active === false)
    : employeeArr, [employeeArr, filter]);

  const sortedEmps = useMemo(() => {
    // Sort: active first, then by position rank
    const posOrder = { 'Direksi': 0, 'General Manager': 1, 'Manager Operasional': 2, 'Manager': 3, 'Supervisor': 4, 'Product Specialist': 5, 'Staff': 6, 'Security': 7, 'Office Boy/Girl': 8, '-': 99 };
    return [...filtered].sort((a, b) => {
      if ((a.active !== false) !== (b.active !== false)) return (a.active !== false) ? -1 : 1;
      return (posOrder[a.position] ?? 99) - (posOrder[b.position] ?? 99);
    });
  }, [filtered]);

  const reassignSalesReferences = (fromIds, toId = OFFICE_SALES_ID) => {
    const ids = new Set((fromIds || []).filter(Boolean));
    if (!ids.size) return;
    const stamp = new Date().toISOString();
    setData(prev => prev.map(row => ids.has(row.salesOwner) ? {
      ...row,
      salesOwner: toId,
      _reassignedToOffice: toId === OFFICE_SALES_ID ? { from: row.salesOwner, at: stamp, reason: 'employee_management_action' } : row._reassignedToOffice,
    } : row));
    setReports(prev => prev.map(row => ids.has(row.salesId) ? {
      ...row,
      salesId: toId,
      _reassignedToOffice: toId === OFFICE_SALES_ID ? { from: row.salesId, at: stamp, reason: 'employee_management_action' } : row._reassignedToOffice,
    } : row));
  };

  const reassignEmployeeUsername = (fromUsername, toUsername, toName) => {
    if (!fromUsername || !toUsername || fromUsername === toUsername) return;
    const patch = (row) => row.travelerUsername === fromUsername ? { ...row, travelerUsername: toUsername, travelerName: toName || resolveEmpName(employees, toUsername) } : row;
    setBusinessTrips(prev => prev.map(patch));
    setRealizations(prev => prev.map(patch));
  };

  const transferEmployeeReferencesToOffice = (username) => {
    const emp = employees[username];
    if (!emp) return;
    const officeName = resolveEmpName(employees, OFFICE_SALES_ID);
    if (emp.role === 'sales') reassignSalesReferences([employeeSalesId(username, emp), username], OFFICE_SALES_ID);
    const stamp = new Date().toISOString();
    const patch = (row) => row.travelerUsername === username ? {
      ...row,
      travelerUsername: OFFICE_SALES_ID,
      travelerName: officeName,
      position: row.position === undefined ? row.position : '-',
      allowancePerDay: row.allowancePerDay === undefined ? row.allowancePerDay : 0,
      _reassignedToOffice: { from: username, at: stamp, reason: 'employee_management_action' },
    } : row;
    setBusinessTrips(prev => prev.map(patch));
    setRealizations(prev => prev.map(patch));
  };

  const handleSave = (emp) => {
    const originalUsername = emp._renameFrom || emp.username;
    const previous = employees[originalUsername];
    const previousSalesId = previous?.role === 'sales' ? employeeSalesId(originalUsername, previous) : null;
    const nextSalesId = emp.role === 'sales' ? employeeSalesId(emp.username, emp) : null;
    const normalizeEmp = (raw) => {
      const cleanEmp = { ...raw };
      delete cleanEmp._renameFrom;
      if (cleanEmp.joinDate && todayISO() < cleanEmp.joinDate) cleanEmp.active = false;
      return cleanEmp;
    };
    // If username was renamed, remove old key and add new
    if (emp._renameFrom && emp._renameFrom !== emp.username) {
      const renameFrom = emp._renameFrom;
      const cleanEmp = normalizeEmp(emp);
      setEmployees(prev => {
        const next = { ...prev };
        const prevAliases = (prev[renameFrom] && prev[renameFrom]._prevUsernames) || [];
        cleanEmp._prevUsernames = [...prevAliases, renameFrom]; // remember old key so references stay synced
        delete next[renameFrom];
        next[emp.username] = cleanEmp;
        return next;
      });
    } else {
      const cleanEmp = normalizeEmp(emp);
      setEmployees(prev => ({ ...prev, [emp.username]: cleanEmp }));
    }
    if (previousSalesId && previousSalesId !== nextSalesId) {
      reassignSalesReferences([previousSalesId, originalUsername], nextSalesId || OFFICE_SALES_ID);
    }
    if (emp._renameFrom && emp._renameFrom !== emp.username) {
      reassignEmployeeUsername(emp._renameFrom, emp.username, emp.name);
    }
    setModalOpen(false); setEditingEmp(null);
  };

  const handleDeactivate = (username) => {
    if (username === OFFICE_SALES_ID) {
      showToast(lang === 'id' ? 'Akun kantor tidak boleh dinonaktifkan.' : 'Office account cannot be deactivated.', 'warning');
      setConfirmDeactivateUser(null);
      return;
    }
    transferEmployeeReferencesToOffice(username);
    setEmployees(prev => ({ ...prev, [username]: { ...prev[username], active: false } }));
    setConfirmDeactivateUser(null);
    logAction && logAction({ module: 'employees', action: 'deactivate', entityId: username, entityLabel: employees[username]?.name || username, note: 'Employee deactivated; owned sales/travel records reassigned to office where applicable.' });
  };
  const handleActivate = (username) => {
    setEmployees(prev => ({ ...prev, [username]: { ...prev[username], active: true } }));
    setConfirmActivateUser(null);
  };
  const handleDelete = (username) => {
    if (username === OFFICE_SALES_ID) {
      showToast(lang === 'id' ? 'Akun kantor tidak boleh dihapus.' : 'Office account cannot be deleted.', 'warning');
      setConfirmDeleteUser(null);
      return;
    }
    transferEmployeeReferencesToOffice(username);
    setEmployees(prev => {
      const next = { ...prev };
      delete next[username];
      return next;
    });
    setModuleAccess(prev => {
      const next = { ...(prev || {}) };
      delete next[username];
      return next;
    });
    setConfirmDeleteUser(null);
    logAction && logAction({ module: 'employees', action: 'delete', entityId: username, entityLabel: employees[username]?.name || username, note: 'Employee deleted; owned sales/travel records reassigned to office where applicable.' });
  };
  const handleResetPassword = (username) => {
    setEmployees(prev => ({ ...prev, [username]: { ...prev[username], password: 'hnti2026', mustChangePassword: true } }));
    setResetPwUser(null);
  };

  // KPI stats
  const totalEmps = employeeArr.length;
  const activeEmps = employeeArr.filter(e => e.active !== false).length;
  const inactiveEmps = employeeArr.filter(e => e.active === false).length;
  const byPosition = {};
  employeeArr.forEach(e => {
    if (e.active === false) return;
    byPosition[e.position] = (byPosition[e.position] || 0) + 1;
  });

  if (!canManage) {
    return (
      <div>
        <div style={{marginBottom: '22px'}}>
          <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_employees}</div>
          <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.emp_title}</h1>
        </div>
        <div style={{padding: '24px', background: 'var(--ims-gold-bg)', border: '1px solid var(--ims-accent)', borderLeft: '3px solid var(--ims-accent)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <Lock size={20} color="#8a6a2a" />
            <div style={{fontSize: '13px', color: '#5a4a1a'}}>{t.emp_restricted}</div>
          </div>
        </div>
      </div>
    );
  }

  if (isCEO && empView === 'access') {
    return <ModuleAccessPanel employees={employees} moduleAccess={moduleAccess} setModuleAccess={setModuleAccess} t={t} lang={lang} empView={empView} setEmpView={setEmpView} logAction={logAction} />;
  }

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_employees}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.emp_title}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.emp_subtitle}</div>
      </div>

      {isCEO && (
        <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid var(--ims-border)'}}>
          <button onClick={() => setEmpView('list')} style={{background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: 'var(--ims-text)', borderBottom: '2px solid var(--ims-border)', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px'}}><Users size={14} strokeWidth={1.5} />{lang === 'id' ? 'Daftar Karyawan' : 'Employee List'}</button>
          <button onClick={() => setEmpView('access')} style={{background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: 'var(--ims-text-2)', borderBottom: '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px'}}><Lock size={14} strokeWidth={1.5} />{lang === 'id' ? 'Otorisasi Akses Modul' : 'Module Authorization'}</button>
        </div>
      )}

      {/* KPI Strip */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div className="lbl-tag">{t.emp_total}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '4px'}}>{totalEmps}</div>
        </div>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div className="lbl-tag">{t.emp_active}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent-2)'}}>{activeEmps}</div>
        </div>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div className="lbl-tag">{t.emp_inactive}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-text-2)'}}>{inactiveEmps}</div>
        </div>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-alt)', color: 'var(--ims-text)'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.2em', color: 'var(--ims-accent)', textTransform: 'uppercase'}}>{t.emp_by_position}</div>
          <div style={{fontSize: '11px', marginTop: '4px', lineHeight: 1.6}}>
            {Object.entries(byPosition).map(([pos, n]) => <div key={pos}><span style={{opacity: 0.7}}>{pos}:</span> <strong>{n}</strong></div>)}
          </div>
        </div>
      </div>

      {/* List + Add */}
      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{lang === 'id' ? 'Daftar Karyawan' : 'Employee List'}</div>
            <div style={{display: 'flex', gap: '4px'}}>
              {[
                { id: 'all', label: lang === 'id' ? 'Semua' : 'All' },
                { id: 'active', label: t.emp_active },
                { id: 'inactive', label: t.emp_inactive },
              ].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)} style={{padding: '4px 10px', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', background: filter === f.id ? 'var(--ims-accent)' : 'transparent', color: filter === f.id ? 'var(--ims-gold)' : 'var(--ims-text-2)', border: '1px solid ' + (filter === f.id ? 'var(--ims-accent)' : 'var(--ims-border)'), cursor: 'pointer', fontFamily: 'inherit'}}>{f.label}</button>
              ))}
            </div>
          </div>
          <button className="btn-primary" onClick={() => { setEditingEmp(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><UserPlus size={12} />{t.emp_add_btn}</button>
        </div>

        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px'}}>
          <thead>
            <tr style={{background: 'var(--ims-bg)'}}>
              <Th>{t.emp_username}</Th>
              <Th>{t.emp_name}</Th>
              <Th>{t.emp_position}</Th>
              <Th>{t.emp_role}</Th>
              <Th align="right">{t.emp_allowance}</Th>
              <Th align="center">Status</Th>
              <Th align="center">{t.actions}</Th>
            </tr>
          </thead>
          <tbody>
            {sortedEmps.map(emp => {
              const isInactive = emp.active === false;
              const isOfficeAccount = emp.username === OFFICE_SALES_ID || emp.isOffice;
              const posColors = { 'Direksi': '#7b3fb5', 'General Manager': '#1a4d8a', 'Manager Operasional': '#0f7a5a', 'Manager': 'var(--ims-gold)', 'Supervisor': '#5b87b8', 'Product Specialist': '#9b5a8a', 'Staff': '#94a3b8', 'Security': '#6b7280', 'Office Boy/Girl': '#a78971' };
              const posColor = posColors[emp.position] || 'var(--ims-text-2)';
              return (
                <tr key={emp.username} style={{borderTop: '1px solid var(--ims-border)', opacity: isInactive ? 0.55 : 1}}>
                  <Td><span className="mono" style={{fontWeight: 600, color: 'var(--ims-text)'}}>{emp.username}</span></Td>
                  <Td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <div style={{width: '26px', height: '26px', borderRadius: '50%', background: posColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, flexShrink: 0}}>{initialOf(emp.name)}</div>
                      <div>
                        <div style={{fontWeight: 500}}>{emp.name}</div>
                        {emp.salesId && <div style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>Sales ID: {emp.salesId}</div>}
                      </div>
                    </div>
                  </Td>
                  <Td><span style={{padding: '2px 8px', fontSize: '10px', background: posColor + '25', color: posColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{emp.position}</span></Td>
                  <Td><span style={{fontSize: '11px', color: 'var(--ims-text)'}}>{t[`role_${emp.role}`] || emp.role}</span></Td>
                  <Td align="right"><span className="mono" style={{fontSize: '11px', color: 'var(--ims-text)', fontWeight: 500}}>{emp.allowancePerDay > 0 ? fmt(emp.allowancePerDay) : '-'}</span></Td>
                  <Td align="center">
                    {isInactive
                      ? <span style={{padding: '2px 8px', fontSize: '10px', background: 'var(--ims-text-2)25', color: 'var(--ims-text-2)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t.emp_status_inactive}</span>
                      : <span style={{padding: '2px 8px', fontSize: '10px', background: 'var(--ims-accent-2)25', color: 'var(--ims-accent-2)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t.emp_status_active}</span>}
                  </Td>
                  <Td align="center">
                    <div style={{display: 'flex', gap: '4px', justifyContent: 'center'}}>
                      <button onClick={() => { setEditingEmp(emp); setModalOpen(true); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit'}} title={t.crud_edit}><Edit2 size={11} /></button>
                      <button onClick={() => setResetPwUser(emp.username)} style={{background: 'transparent', border: '1px solid #1a4d8a', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#1a4d8a', fontFamily: 'inherit'}} title={t.emp_reset_pw}><Lock size={11} /></button>
                      {isInactive
                        ? <>
                            <button onClick={() => setConfirmActivateUser(emp.username)} style={{background: 'transparent', border: '1px solid var(--ims-accent-2)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-accent-2)', fontFamily: 'inherit'}} title={t.emp_activate}><UserCheck size={11} /></button>
                            {!isOfficeAccount && <button onClick={() => setConfirmDeleteUser(emp.username)} style={{background: 'transparent', border: '1px solid #c03030', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}} title={t.emp_delete}><Trash2 size={11} /></button>}
                          </>
                        : (emp.username !== session.username && !isOfficeAccount && <button onClick={() => setConfirmDeactivateUser(emp.username)} style={{background: 'transparent', border: '1px solid var(--ims-accent)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-accent)', fontFamily: 'inherit'}} title={t.emp_deactivate}><UserX size={11} /></button>)}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sortedEmps.length === 0 && <div className="empty-state">{t.no_data}</div>}
      </div>

      {modalOpen && <EmployeeModal emp={editingEmp} employees={employees} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingEmp(null); }} t={t} lang={lang} />}
      <ConfirmDialog open={!!confirmDeactivateUser} title={lang === 'id' ? 'Non-aktifkan Karyawan?' : 'Deactivate Employee?'} message={t.emp_confirm_deactivate} confirmText={lang === 'id' ? 'Ya, Non-aktifkan' : 'Yes, Deactivate'} onConfirm={() => handleDeactivate(confirmDeactivateUser)} onCancel={() => setConfirmDeactivateUser(null)} danger lang={lang} />
      <ConfirmDialog open={!!confirmActivateUser} title={lang === 'id' ? 'Aktifkan Karyawan?' : 'Activate Employee?'} message={t.emp_confirm_activate} confirmText={lang === 'id' ? 'Ya, Aktifkan' : 'Yes, Activate'} onConfirm={() => handleActivate(confirmActivateUser)} onCancel={() => setConfirmActivateUser(null)} lang={lang} />
      <ConfirmDialog open={!!confirmDeleteUser} title={lang === 'id' ? 'Hapus Akun Permanen?' : 'Delete Account Permanently?'} message={lang === 'id' ? `Akun "${confirmDeleteUser}" akan dihapus permanen dan tidak bisa dikembalikan. Semua histori login akun ini akan hilang. Lanjutkan?` : `Account "${confirmDeleteUser}" will be permanently deleted and cannot be recovered. Continue?`} confirmText={lang === 'id' ? 'Ya, Hapus Permanen' : 'Yes, Delete Permanently'} onConfirm={() => handleDelete(confirmDeleteUser)} onCancel={() => setConfirmDeleteUser(null)} danger lang={lang} />
      <ConfirmDialog open={!!resetPwUser} title={lang === 'id' ? 'Atur Ulang Kata Sandi?' : 'Reset Password?'} message={lang === 'id' ? `Password akun "${resetPwUser}" akan direset ke default (hnti2026). Karyawan wajib menggantinya saat login berikutnya. Lanjutkan?` : `Password for "${resetPwUser}" will be reset to default (hnti2026). The employee must change it on next login. Continue?`} confirmText={lang === 'id' ? 'Ya, Reset' : 'Yes, Reset'} onConfirm={() => handleResetPassword(resetPwUser)} onCancel={() => setResetPwUser(null)} lang={lang} />
    </div>
  );
}
function EmployeeModal({ emp, employees, onSave, onClose, t, lang }) {
  const isEdit = !!emp;
  const [form, setForm] = useState(emp || {
    username: '', name: '', initial: '',
    position: 'Staff', role: 'sales', allowancePerDay: 130000,
    password: 'hnti2026', active: true, salesId: '', joinDate: '',
  });
  const [error, setError] = useState('');
  const update = (k, v) => { setError(''); setForm(prev => ({ ...prev, [k]: v })); };

  const updatePosition = (pos) => {
    setForm(prev => ({ ...prev, position: pos, allowancePerDay: POSITION_ALLOWANCE[pos] ?? prev.allowancePerDay }));
  };

  // Derive initial from name automatically
  const autoInitial = (name) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleSubmit = () => {
    if (!form.username || !form.name) {
      setError(lang === 'id' ? 'Username dan Nama wajib diisi.' : 'Username and Name are required.');
      return;
    }
    // Allow rename, but check duplicate (except if same as original)
    const originalUsername = isEdit ? emp.username : null;
    if (form.username !== originalUsername && employees[form.username]) {
      setError(t.emp_duplicate_username);
      return;
    }
    const finalForm = { ...form, initial: autoInitial(form.name) };
    // Pass original username for rename handling
    if (isEdit && originalUsername && originalUsername !== form.username) {
      finalForm._renameFrom = originalUsername;
    }
    onSave(finalForm);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.emp_modal_edit : t.emp_modal_add}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>
        {error && <div style={{padding: '10px 14px', background: '#c0303015', borderLeft: '3px solid #c03030', color: '#c03030', fontSize: '12px', marginBottom: '14px'}}>{error}</div>}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <Field label={t.emp_username}>
            <input value={form.username} onChange={e => update('username', e.target.value.toLowerCase().replace(/\s+/g, ''))} placeholder="contoh: budi" />
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>
              {isEdit
                ? (lang === 'id' ? '⚠ Mengubah username akan mempengaruhi login dan audit log. Pastikan tidak duplikat.' : '⚠ Changing username affects login and audit logs. Ensure uniqueness.')
                : t.emp_field_username_help}
            </div>
          </Field>
          <Field label={t.emp_name}>
            <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="contoh: Robby Dwi Setiawan" />
          </Field>
          <Field label={t.emp_position}>
            <select value={form.position} onChange={e => updatePosition(e.target.value)}>
              <option value="Staff">Staff (Rp 130.000)</option>
              <option value="Product Specialist">Product Specialist (Rp 150.000)</option>
              <option value="Supervisor">Supervisor (Rp 150.000)</option>
              <option value="Manager">Manager (Rp 175.000)</option>
              <option value="Manager Operasional">Manager Operasional (Rp 175.000)</option>
              <option value="General Manager">General Manager (Rp 175.000)</option>
              <option value="Direksi">Direksi (Rp 500.000)</option>
              <option value="Security">Security (Rp 100.000)</option>
              <option value="Office Boy/Girl">Office Boy/Girl (Rp 100.000)</option>
            </select>
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{t.emp_field_position_help}</div>
          </Field>
          <Field label={t.emp_role}>
            <select value={form.role} onChange={e => update('role', e.target.value)}>
              <option value="super_admin">Super Admin (CEO)</option>
              <option value="gm">General Manager</option>
              <option value="manager_ops">Manager Operasional</option>
              <option value="admin">Admin</option>
              <option value="finance">Finance</option>
              <option value="operations">Operations</option>
              <option value="technician">Technician</option>
              <option value="regulatory">Regulatory</option>
              <option value="sales">Sales</option>
              <option value="product_specialist">Product Specialist</option>
              <option value="security">Security</option>
              <option value="office_support">Office Support (OB)</option>
            </select>
          </Field>
          <Field label={t.emp_allowance}>
            <input type="number" value={form.allowancePerDay} onChange={e => update('allowancePerDay', parseInt(e.target.value) || 0)} />
          </Field>
          {form.role === 'sales' && (
            <Field label="Sales ID (untuk performance tracking)">
              <input value={form.salesId || ''} onChange={e => update('salesId', e.target.value.toLowerCase())} placeholder="otomatis = username" />
            </Field>
          )}
          <Field label={lang === 'id' ? 'Tanggal Mulai Aktif' : 'Activation Date'}>
            <input type="date" value={form.joinDate || ''} onChange={e => update('joinDate', e.target.value)} />
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>
              {lang === 'id' ? 'Opsional — nonaktifkan akun & isi tanggal ini untuk aktivasi otomatis (mis. rekrut baru).' : 'Optional — keep inactive until this date for auto-activation.'}
            </div>
          </Field>
          <Field label={lang === 'id' ? 'Tanda Tangan (PNG, untuk dokumen)' : 'Signature (PNG, for documents)'} full>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap'}}>
              {form.signatureUrl ? (
                <div style={{width: '120px', height: '64px', border: '1px solid var(--ims-border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
                  <img src={form.signatureUrl} alt="TTD" style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />
                </div>
              ) : (
                <div style={{width: '120px', height: '64px', border: '1px dashed var(--ims-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Belum ada TTD' : 'No signature'}</div>
              )}
              <label className="btn-ghost" style={{fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px'}}>
                <Upload size={12} />{lang === 'id' ? 'Unggah TTD' : 'Upload Signature'}
                <input type="file" accept="image/png,image/*,.png,.jpg,.jpeg,.webp" style={{display: 'none'}} onChange={async (e) => {
                  const file = e.target.files && e.target.files[0];
                  if (!file) return;
                  if (file.size > 4 * 1024 * 1024) { showToast(lang === 'id' ? 'Maks 4 MB' : 'Max 4 MB', 'error'); e.target.value = ''; return; }
                  try { const reader = new FileReader(); reader.onload = () => update('signatureUrl', reader.result); reader.readAsDataURL(file); } catch { showToast('Gagal baca file', 'error'); }
                  e.target.value = '';
                }} />
              </label>
              {form.signatureUrl && <button type="button" onClick={() => update('signatureUrl', '')} className="btn-ghost" style={{fontSize: '11px', color: '#c03030'}}><X size={12} />{lang === 'id' ? 'Hapus' : 'Remove'}</button>}
            </div>
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '6px', fontStyle: 'italic'}}>{lang === 'id' ? 'TTD ini otomatis tersisip di SPH/SPP yang dibuat untuk akun ini.' : 'Auto-inserted into documents created for this account.'}</div>
          </Field>
        </div>
        <div style={{marginTop: '14px', padding: '10px 14px', background: 'var(--ims-gold-bg)', borderLeft: '3px solid var(--ims-accent)', fontSize: '11px', color: '#5a4a1a'}}>{t.emp_password_note}</div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
          <button className="btn-primary" onClick={handleSubmit}>{t.crud_save}</button>
        </div>
      </div>
    </div>
  );
}

export { ModuleAccessPanel, EmployeesModule, EmployeeModal };

// Extracted from App.jsx during modular refactor.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Download, Edit2, FileCheck, Plus, Receipt, Search, Trash2, Upload, X } from 'lucide-react';
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ConfirmDialog, Field, LinkAttachment, Td, Th } from '../components/ui.jsx';
import { POSITION_ALLOWANCE } from '../constants/org.js';
import { downloadCSV } from '../utils/documents.js';
import { resolveEmpName } from '../utils/domain.js';
import { showToast } from '../utils/toast.js';

function tripCanDelete(trip, session) {
  const isOwner = trip.travelerUsername === session.username;
  const canManageAll = ['super_admin', 'gm', 'manager_ops', 'finance'].includes(session.role);
  return (isOwner && trip.status === 'draft') || canManageAll;
}

function BusinessTripModule({ businessTrips, setBusinessTrips, realizations, setRealizations, employees, t, lang, session, fmt }) {
  const [tab, setTab] = useState('cash_advance');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [detailTrip, setDetailTrip] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // {action, trip, note}
  const [deleteTripId, setDeleteTripId] = useState(null);
  const [selectedTripIds, setSelectedTripIds] = useState([]);
  const [bulkDeleteTripsOpen, setBulkDeleteTripsOpen] = useState(false);
  const selectAllTripsRef = useRef(null);
  const [filterView, setFilterView] = useState('all'); // all | my | pending
  const [btSearch, setBtSearch] = useState('');
  const [btYear, setBtYear] = useState('all');

  // Realization state
  const [realizationFormOpen, setRealizationFormOpen] = useState(false);
  const [editingRealization, setEditingRealization] = useState(null);
  const [selectedTripForRealization, setSelectedTripForRealization] = useState(null);
  const [detailRealization, setDetailRealization] = useState(null);
  const [confirmRealizationAction, setConfirmRealizationAction] = useState(null); // {action, realization, note}
  const [deleteRealizationId, setDeleteRealizationId] = useState(null);
  const [confirmSettleId, setConfirmSettleId] = useState(null);

  // ═══════════ Export / Import handlers ═══════════
  const handleExportTrips = () => {
    const rows = [
      ['No Pengajuan', 'Nama Pegawai', 'Username', 'Posisi', 'Tujuan', 'Kota', 'Tanggal Mulai', 'Tanggal Selesai', 'Durasi (Hari)', 'Tujuan Perjalanan', 'Uang Muka Total', 'Status', 'Status Pembayaran', 'Tanggal Dibuat', 'Tanggal Update'],
      ...businessTrips.map(t => [
        t.requestNo || '',
        t.travelerName || '',
        t.travelerUsername || '',
        t.position || '',
        t.destination || '',
        t.destinationCity || '',
        t.dateStart || '',
        t.dateEnd || '',
        t.duration || '',
        t.purpose || '',
        t.totalAdvance || 0,
        t.status || '',
        t.paymentStatus || '',
        t.submittedAt || '',
        t.updatedAt || '',
      ])
    ];
    downloadCSV(`perjalanan_dinas_${new Date().toISOString().slice(0,10)}.csv`, rows);
    showToast(lang === 'id' ? `${businessTrips.length} pengajuan diekspor` : `${businessTrips.length} trips exported`, 'success');
  };
  const handleImportTrips = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = String(ev.target.result || '');
        // Strip BOM if present
        const cleaned = text.replace(/^\uFEFF/, '');
        const lines = cleaned.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) {
          showToast(lang === 'id' ? 'CSV kosong atau tidak valid' : 'CSV empty or invalid', 'error');
          return;
        }
        // Parse CSV line — simple split (assumes no commas in fields)
        const parseCSVLine = (line) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
              if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
              else inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
              result.push(current); current = '';
            } else {
              current += ch;
            }
          }
          result.push(current);
          return result;
        };
        const dataRows = lines.slice(1).map(parseCSVLine);
        const imported = dataRows.map((cols, idx) => ({
          id: 'bt_imp_' + Date.now() + '_' + idx,
          requestNo: cols[0] || ('IMP/' + Date.now() + '/' + idx),
          travelerName: cols[1] || '',
          travelerUsername: cols[2] || '',
          position: cols[3] || '',
          destination: cols[4] || '',
          destinationCity: cols[5] || '',
          dateStart: cols[6] || '',
          dateEnd: cols[7] || '',
          duration: parseInt(cols[8]) || 0,
          purpose: cols[9] || '',
          totalAdvance: parseFloat(cols[10]) || 0,
          status: cols[11] || 'draft',
          paymentStatus: cols[12] || '',
          submittedAt: cols[13] || new Date().toISOString(),
          updatedAt: cols[14] || new Date().toISOString(),
          itemsDp: [],
          history: [{ action: 'imported', timestamp: new Date().toISOString(), by: session.username, note: 'Imported from CSV' }],
        }));
        setBusinessTrips(prev => [...imported, ...prev]);
        showToast(lang === 'id' ? `${imported.length} pengajuan berhasil di-import` : `${imported.length} trips imported`, 'success');
      } catch (err) {
        console.error('[importTrips] error:', err);
        showToast(lang === 'id' ? 'Gagal parse CSV: ' + err.message : 'CSV parse failed: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportRealizations = () => {
    const rows = [
      ['No Realisasi', 'Nama Pegawai', 'Username', 'Tujuan', 'Tanggal Selesai', 'Total Realisasi', 'Status', 'Settlement Status', 'Tanggal Submit'],
      ...realizations.map(r => [
        r.realizationNo || '',
        r.travelerName || '',
        r.travelerUsername || '',
        r.destination || '',
        r.actualEndDate || r.dateEnd || '',
        r.totalRealized || 0,
        r.status || '',
        r.settlementStatus || '',
        r.submittedAt || '',
      ])
    ];
    downloadCSV(`realisasi_${new Date().toISOString().slice(0,10)}.csv`, rows);
    showToast(lang === 'id' ? `${realizations.length} realisasi diekspor` : `${realizations.length} realizations exported`, 'success');
  };
  const handleImportRealizations = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const cleaned = String(ev.target.result || '').replace(/^\uFEFF/, '');
        const lines = cleaned.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) {
          showToast(lang === 'id' ? 'CSV kosong' : 'CSV empty', 'error');
          return;
        }
        const parseCSVLine = (line) => {
          const result = []; let current = ''; let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') { if (inQuotes && line[i+1] === '"') { current += '"'; i++; } else inQuotes = !inQuotes; }
            else if (ch === ',' && !inQuotes) { result.push(current); current = ''; }
            else current += ch;
          }
          result.push(current); return result;
        };
        const imported = lines.slice(1).map(parseCSVLine).map((cols, idx) => ({
          id: 'real_imp_' + Date.now() + '_' + idx,
          realizationNo: cols[0] || ('IMP/REAL/' + Date.now() + '/' + idx),
          travelerName: cols[1] || '',
          travelerUsername: cols[2] || '',
          destination: cols[3] || '',
          actualEndDate: cols[4] || '',
          totalRealized: parseFloat(cols[5]) || 0,
          status: cols[6] || 'draft',
          settlementStatus: cols[7] || '',
          submittedAt: cols[8] || new Date().toISOString(),
          history: [{ action: 'imported', timestamp: new Date().toISOString(), by: session.username, note: 'Imported from CSV' }],
        }));
        setRealizations(prev => [...imported, ...prev]);
        showToast(lang === 'id' ? `${imported.length} realisasi di-import` : `${imported.length} realizations imported`, 'success');
      } catch (err) {
        console.error('[importRealizations] error:', err);
        showToast(lang === 'id' ? 'Gagal parse CSV: ' + err.message : 'Parse failed: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Determine what user can see
  const canManageAll = ['super_admin', 'gm', 'manager_ops', 'finance'].includes(session.role);
  const isReviewer = ['finance', 'manager_ops', 'gm', 'super_admin'].includes(session.role);
  const btSearchTerm = btSearch.trim().toLowerCase();
  const btYears = useMemo(() => {
    const years = new Set();
    [...businessTrips, ...realizations].forEach(r => {
      ['dateStart', 'dateEnd', 'submittedAt', 'updatedAt', 'paidDate', 'settlementDate'].forEach(k => {
        if (r?.[k]) years.add(String(r[k]).slice(0, 4));
      });
    });
    return [...years].filter(Boolean).sort().reverse();
  }, [businessTrips, realizations]);
  const matchesBtFilters = (row) => {
    const text = [row.requestNo, row.realizationNo, row.travelerName, row.travelerUsername, row.destination, row.destinationCity, row.purpose, row.status, row.tripStatus, row.paymentStatus].filter(Boolean).join(' ').toLowerCase();
    const matchSearch = !btSearchTerm || text.includes(btSearchTerm);
    const matchYear = btYear === 'all' || ['dateStart', 'dateEnd', 'submittedAt', 'updatedAt', 'paidDate', 'settlementDate'].some(k => String(row?.[k] || '').startsWith(btYear));
    return matchSearch && matchYear;
  };

  // Filter trips based on user
  const visibleTrips = useMemo(() => {
    let arr = businessTrips.map(t => ({
      ...t,
      travelerName: resolveEmpName(employees, t.travelerUsername || t.travelerName),
      approvalHistory: Array.isArray(t.approvalHistory) ? t.approvalHistory.map(h => ({ ...h, byName: resolveEmpName(employees, h.by || h.byName) })) : t.approvalHistory,
    }));
    if (!canManageAll) {
      // Regular employees only see their own
      arr = arr.filter(t => t.travelerUsername === session.username);
    } else if (filterView === 'my') {
      arr = arr.filter(t => t.travelerUsername === session.username);
    } else if (filterView === 'pending') {
      // Pending review by current user's role
      if (session.role === 'finance') arr = arr.filter(t => t.status === 'pending_finance');
      else if (session.role === 'manager_ops') arr = arr.filter(t => t.status === 'pending_mops');
      else if (session.role === 'gm') arr = arr.filter(t => t.status === 'pending_gm');
      else arr = arr.filter(t => ['pending_finance', 'pending_mops', 'pending_gm'].includes(t.status));
    }
    arr = arr.filter(matchesBtFilters);
    // Sort: newest first
    return arr.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
  }, [businessTrips, session, filterView, canManageAll, employees, btSearchTerm, btYear]);

  // Stats
  const totalTrips = businessTrips.length;
  const myTrips = businessTrips.filter(t => t.travelerUsername === session.username).length;
  let pendingForMe = 0;
  if (session.role === 'finance') pendingForMe = businessTrips.filter(t => t.status === 'pending_finance').length;
  else if (session.role === 'manager_ops') pendingForMe = businessTrips.filter(t => t.status === 'pending_mops').length;
  else if (session.role === 'gm') pendingForMe = businessTrips.filter(t => t.status === 'pending_gm').length;

  const totalAdvance = businessTrips
    .filter(t => ['approved', 'paid', 'in_progress', 'completed'].includes(t.status))
    .reduce((sum, t) => sum + (t.totalAdvance || 0), 0);

  // ============== Handlers ==============
  const handleSubmit = (trip) => {
    // From draft → pending_finance
    const updated = {
      ...trip,
      status: 'pending_finance',
      submittedAt: trip.submittedAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      approvalHistory: [...(trip.approvalHistory || []), {
        level: 'submit', by: session.username, byName: session.name,
        date: new Date().toISOString().split('T')[0], action: 'submitted', note: ''
      }]
    };
    setBusinessTrips(prev => {
      const exists = prev.find(x => x.id === trip.id);
      return exists ? prev.map(x => x.id === trip.id ? updated : x) : [...prev, updated];
    });
    setModalOpen(false); setEditingTrip(null);
  };

  const handleSaveDraft = (trip) => {
    // Save as draft (no status change to pending)
    const updated = { ...trip, updatedAt: new Date().toISOString().split('T')[0] };
    setBusinessTrips(prev => {
      const exists = prev.find(x => x.id === trip.id);
      return exists ? prev.map(x => x.id === trip.id ? updated : x) : [...prev, updated];
    });
    setModalOpen(false); setEditingTrip(null);
  };

  const handleApprove = (trip, note) => {
    // Determine next status based on current
    let nextStatus = trip.status;
    let level = '';
    if (trip.status === 'pending_finance') { nextStatus = 'pending_mops'; level = 'finance'; }
    else if (trip.status === 'pending_mops') { nextStatus = 'pending_gm'; level = 'manager_ops'; }
    else if (trip.status === 'pending_gm') { nextStatus = 'approved'; level = 'gm'; }

    const updated = {
      ...trip, status: nextStatus,
      updatedAt: new Date().toISOString().split('T')[0],
      approvalHistory: [...(trip.approvalHistory || []), {
        level, by: session.username, byName: session.name,
        date: new Date().toISOString().split('T')[0], action: 'approved', note: note || ''
      }]
    };
    setBusinessTrips(prev => prev.map(x => x.id === trip.id ? updated : x));
    setConfirmAction(null); setDetailTrip(updated);
  };

  const handleReject = (trip, note) => {
    let level = '';
    if (trip.status === 'pending_finance') level = 'finance';
    else if (trip.status === 'pending_mops') level = 'manager_ops';
    else if (trip.status === 'pending_gm') level = 'gm';

    const updated = {
      ...trip, status: 'rejected', tripStatus: 'cancelled',
      updatedAt: new Date().toISOString().split('T')[0],
      approvalHistory: [...(trip.approvalHistory || []), {
        level, by: session.username, byName: session.name,
        date: new Date().toISOString().split('T')[0], action: 'rejected', note: note || ''
      }]
    };
    setBusinessTrips(prev => prev.map(x => x.id === trip.id ? updated : x));
    setConfirmAction(null); setDetailTrip(updated);
  };

  const handleClarify = (trip, note) => {
    let level = '';
    if (trip.status === 'pending_finance') level = 'finance';
    else if (trip.status === 'pending_mops') level = 'manager_ops';
    else if (trip.status === 'pending_gm') level = 'gm';

    const updated = {
      ...trip, status: 'clarification',
      updatedAt: new Date().toISOString().split('T')[0],
      approvalHistory: [...(trip.approvalHistory || []), {
        level, by: session.username, byName: session.name,
        date: new Date().toISOString().split('T')[0], action: 'clarification', note: note || ''
      }]
    };
    setBusinessTrips(prev => prev.map(x => x.id === trip.id ? updated : x));
    setConfirmAction(null); setDetailTrip(updated);
  };

  const handleMarkPaid = (trip, note) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = {
      ...trip, status: 'in_progress', tripStatus: 'planned', paymentStatus: 'paid',
      paidDate: today, paidAmount: trip.totalAdvance,
      updatedAt: today,
      approvalHistory: [...(trip.approvalHistory || []), {
        level: 'finance', by: session.username, byName: session.name,
        date: today, action: 'paid', note: note || `Transfer Rp ${trip.totalAdvance.toLocaleString('id-ID')}`
      }]
    };
    setBusinessTrips(prev => prev.map(x => x.id === trip.id ? updated : x));
    setConfirmAction(null); setDetailTrip(updated);
  };

  const handleDelete = () => {
    setBusinessTrips(prev => prev.filter(x => x.id !== deleteTripId));
    setDeleteTripId(null);
    showToast(lang === 'id' ? 'Pengajuan dihapus' : 'Request deleted', 'success');
  };

  const deletableVisibleTrips = useMemo(() => visibleTrips.filter(trip => tripCanDelete(trip, session)), [visibleTrips, session]);
  const deletableTripIds = useMemo(() => deletableVisibleTrips.map(t => t.id), [deletableVisibleTrips]);
  const allDeletableSelected = deletableTripIds.length > 0 && deletableTripIds.every(id => selectedTripIds.includes(id));

  useEffect(() => {
    if (selectAllTripsRef.current) selectAllTripsRef.current.indeterminate = selectedTripIds.length > 0 && !allDeletableSelected;
  }, [selectedTripIds.length, allDeletableSelected]);

  useEffect(() => { setSelectedTripIds([]); }, [tab, filterView, btSearch, btYear]);

  const toggleTripSelect = (id) => {
    setSelectedTripIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    setDetailTrip(null);
  };
  const toggleSelectAllTrips = () => {
    if (allDeletableSelected) setSelectedTripIds(prev => prev.filter(id => !deletableTripIds.includes(id)));
    else {
      setSelectedTripIds(prev => [...new Set([...prev, ...deletableTripIds])]);
      setDetailTrip(null);
    }
  };
  const confirmBulkDeleteTrips = () => {
    const idSet = new Set(selectedTripIds);
    const removed = businessTrips.filter(t => idSet.has(t.id));
    setBusinessTrips(prev => prev.filter(t => !idSet.has(t.id)));
    setSelectedTripIds([]);
    setBulkDeleteTripsOpen(false);
    setDetailTrip(null);
    showToast(lang === 'id' ? `${removed.length} pengajuan dihapus` : `${removed.length} request(s) deleted`, 'success');
  };

  // ============== REALIZATION HANDLERS ==============
  // Trip yang eligible untuk dilaporkan: status in_progress atau completed yang sudah paid, dan belum punya realisasi
  const eligibleTripsForRealization = useMemo(() => {
    return businessTrips.filter(t =>
      ['in_progress', 'completed'].includes(t.status) &&
      t.paymentStatus === 'paid' &&
      t.travelerUsername === session.username
    );
  }, [businessTrips, session.username]);

  // Visible realizations based on user role
  const visibleRealizations = useMemo(() => {
    let arr = realizations.map(r => ({
      ...r,
      travelerName: resolveEmpName(employees, r.travelerUsername || r.travelerName),
      approvalHistory: Array.isArray(r.approvalHistory) ? r.approvalHistory.map(h => ({ ...h, byName: resolveEmpName(employees, h.by || h.byName) })) : r.approvalHistory,
    }));
    if (!canManageAll) {
      arr = arr.filter(r => r.travelerUsername === session.username);
    } else if (filterView === 'my') {
      arr = arr.filter(r => r.travelerUsername === session.username);
    } else if (filterView === 'pending') {
      if (session.role === 'finance') arr = arr.filter(r => r.status === 'pending_finance');
      else if (session.role === 'manager_ops') arr = arr.filter(r => r.status === 'pending_mops');
      else if (session.role === 'gm') arr = arr.filter(r => r.status === 'pending_gm');
      else arr = arr.filter(r => ['pending_finance', 'pending_mops', 'pending_gm'].includes(r.status));
    }
    arr = arr.filter(matchesBtFilters);
    return arr.sort((a, b) => (b.submittedAt || b.updatedAt || '').localeCompare(a.submittedAt || a.updatedAt || ''));
  }, [realizations, session, filterView, canManageAll, employees, btSearchTerm, btYear]);

  // Stats for realization tab
  const pendingRealizationsForMe = useMemo(() => {
    if (session.role === 'finance') return realizations.filter(r => r.status === 'pending_finance').length;
    if (session.role === 'manager_ops') return realizations.filter(r => r.status === 'pending_mops').length;
    if (session.role === 'gm') return realizations.filter(r => r.status === 'pending_gm').length;
    return 0;
  }, [realizations, session.role]);

  const handleSubmitRealization = (realization) => {
    // From draft → pending_finance
    const updated = {
      ...realization,
      status: 'pending_finance',
      submittedAt: realization.submittedAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      approvalHistory: [...(realization.approvalHistory || []), {
        level: 'submit', by: session.username, byName: session.name,
        date: new Date().toISOString().split('T')[0], action: 'submitted', note: ''
      }]
    };
    setRealizations(prev => {
      const exists = prev.find(x => x.id === realization.id);
      return exists ? prev.map(x => x.id === realization.id ? updated : x) : [...prev, updated];
    });
    // Link realization to trip
    setBusinessTrips(prev => prev.map(t =>
      t.id === realization.businessTripId ? { ...t, realizationId: realization.id } : t
    ));
    setRealizationFormOpen(false);
    setEditingRealization(null);
    setSelectedTripForRealization(null);
  };

  const handleSaveRealizationDraft = (realization) => {
    const updated = { ...realization, updatedAt: new Date().toISOString().split('T')[0] };
    setRealizations(prev => {
      const exists = prev.find(x => x.id === realization.id);
      return exists ? prev.map(x => x.id === realization.id ? updated : x) : [...prev, updated];
    });
    setBusinessTrips(prev => prev.map(t =>
      t.id === realization.businessTripId ? { ...t, realizationId: realization.id } : t
    ));
    setRealizationFormOpen(false);
    setEditingRealization(null);
    setSelectedTripForRealization(null);
  };

  const handleApproveRealization = (realization, note) => {
    // Realization workflow sama dengan Cash Advance: pending_finance → pending_mops → pending_gm → approved
    let nextStatus = realization.status;
    let level = '';
    if (realization.status === 'pending_finance') { nextStatus = 'pending_mops'; level = 'finance'; }
    else if (realization.status === 'pending_mops') { nextStatus = 'pending_gm'; level = 'manager_ops'; }
    else if (realization.status === 'pending_gm') { nextStatus = 'approved'; level = 'gm'; }

    const updated = {
      ...realization, status: nextStatus,
      updatedAt: new Date().toISOString().split('T')[0],
      approvalHistory: [...(realization.approvalHistory || []), {
        level, by: session.username, byName: session.name,
        date: new Date().toISOString().split('T')[0], action: 'approved', note: note || ''
      }]
    };
    setRealizations(prev => prev.map(x => x.id === realization.id ? updated : x));
    setConfirmRealizationAction(null);
    setDetailRealization(updated);
  };

  const handleClarifyRealization = (realization, note) => {
    let level = '';
    if (realization.status === 'pending_finance') level = 'finance';
    else if (realization.status === 'pending_mops') level = 'manager_ops';
    else if (realization.status === 'pending_gm') level = 'gm';

    const updated = {
      ...realization, status: 'clarification',
      updatedAt: new Date().toISOString().split('T')[0],
      approvalHistory: [...(realization.approvalHistory || []), {
        level, by: session.username, byName: session.name,
        date: new Date().toISOString().split('T')[0], action: 'clarification', note: note || ''
      }]
    };
    setRealizations(prev => prev.map(x => x.id === realization.id ? updated : x));
    setConfirmRealizationAction(null);
    setDetailRealization(updated);
  };

  const handleSettle = (realizationId) => {
    const today = new Date().toISOString().split('T')[0];
    setRealizations(prev => prev.map(r => {
      if (r.id !== realizationId) return r;
      return {
        ...r,
        settlementStatus: 'settled',
        settlementDate: today,
        settlementAmount: Math.abs(r.difference),
        settlementNote: r.difference > 0
          ? `Karyawan kembalikan kelebihan Rp ${Math.abs(r.difference).toLocaleString('id-ID')}`
          : (r.difference < 0 ? `Kantor reimburse kekurangan Rp ${Math.abs(r.difference).toLocaleString('id-ID')}` : 'Tidak ada selisih'),
      };
    }));
    setConfirmSettleId(null);
  };

  const handleDeleteRealization = () => {
    setRealizations(prev => prev.filter(x => x.id !== deleteRealizationId));
    setDeleteRealizationId(null);
  };

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_business_trip}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.bt_title}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.bt_subtitle}</div>
      </div>

      {/* KPI Strip */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '14px 16px', background: 'var(--ims-bg-card)'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{canManageAll ? t.bt_all_trips : t.bt_my_trips}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '3px'}}>{canManageAll ? totalTrips : myTrips}</div>
        </div>
        {isReviewer && (
          <div style={{padding: '14px 16px', background: pendingForMe > 0 ? 'var(--ims-gold-bg)' : 'var(--ims-bg-card)', borderLeft: pendingForMe > 0 ? '3px solid var(--ims-accent)' : 'none'}}>
            <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.bt_pending_review}</div>
            <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '3px', color: pendingForMe > 0 ? 'var(--ims-gold)' : 'var(--ims-accent)'}}>{pendingForMe}</div>
            <div style={{fontSize: '9px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'butuh review Anda' : 'awaiting your review'}</div>
          </div>
        )}
        {canManageAll && (
          <div style={{padding: '14px 16px', background: 'var(--ims-bg-alt)', color: 'var(--ims-text)'}}>
            <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-accent)', textTransform: 'uppercase'}}>{t.bt_total_advance_label}</div>
            <div className="serif mono" style={{fontSize: '18px', fontWeight: 500, marginTop: '3px', color: '#fff'}}>{fmt(totalAdvance)}</div>
            <div style={{fontSize: '9px', color: 'rgba(255,255,255,0.6)', marginTop: '2px'}}>{lang === 'id' ? 'disetujui & dibayar' : 'approved & paid'}</div>
          </div>
        )}
      </div>

      <div style={{display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '18px'}}>
        <div style={{position: 'relative', flex: '1 1 280px', minWidth: '220px'}}>
          <Search size={14} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ims-text-2)'}} />
          <input value={btSearch} onChange={e => setBtSearch(e.target.value)} placeholder={lang === 'id' ? 'Cari traveler, tujuan, nomor perjalanan, status...' : 'Search traveler, destination, trip number, status...'} style={{paddingLeft: '36px'}} />
        </div>
        <select value={btYear} onChange={e => setBtYear(e.target.value)} style={{width: '150px'}}>
          <option value="all">{lang === 'id' ? 'Semua Tahun' : 'All Years'}</option>
          {btYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div style={{display: 'flex', gap: '2px', marginBottom: '20px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {[
          { id: 'cash_advance', label: t.bt_tab_cash_advance, icon: Receipt },
          { id: 'realization', label: t.bt_tab_realization, icon: FileCheck },
          { id: 'dashboard', label: t.bt_tab_dashboard, icon: Activity },
        ].map(tb => {
          const Icon = tb.icon;
          const active = tab === tb.id;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{background: 'transparent', border: 'none', padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: active ? 'var(--ims-accent)' : 'var(--ims-text-2)', borderBottom: active ? '2px solid var(--ims-border)' : '2px solid transparent', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '7px', letterSpacing: '0.03em'}}>
              <Icon size={14} strokeWidth={1.5} />{tb.label}
            </button>
          );
        })}
      </div>

      {/* CASH ADVANCE TAB */}
      {tab === 'cash_advance' && (
        <div>
          {/* Filter + Add buttons */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px'}}>
            {canManageAll && (
              <div style={{display: 'flex', gap: '4px'}}>
                {[
                  { id: 'all', label: t.bt_all_trips },
                  { id: 'my', label: t.bt_my_trips },
                  { id: 'pending', label: t.bt_pending_review },
                ].map(f => (
                  <button key={f.id} onClick={() => setFilterView(f.id)} style={{padding: '5px 11px', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', background: filterView === f.id ? 'var(--ims-accent)' : 'transparent', color: filterView === f.id ? 'var(--ims-gold)' : 'var(--ims-text-2)', border: '1px solid ' + (filterView === f.id ? 'var(--ims-accent)' : 'var(--ims-border)'), cursor: 'pointer', fontFamily: 'inherit'}}>{f.label}</button>
                ))}
              </div>
            )}
            <div style={{flex: canManageAll ? 'none' : 1}}></div>
            <button onClick={handleExportTrips} className="btn-ghost" style={{fontSize: '11px', padding: '6px 12px'}} title={lang === 'id' ? 'Export pengajuan ke CSV' : 'Export trips to CSV'}><Download size={12} />{lang === 'id' ? 'Export' : 'Export'}</button>
            {canManageAll && <label className="btn-ghost" style={{fontSize: '11px', padding: '6px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px'}} title={lang === 'id' ? 'Import pengajuan dari CSV' : 'Import trips from CSV'}><Upload size={12} />{lang === 'id' ? 'Import' : 'Import'}<input type="file" accept=".csv,text/csv" style={{display: 'none'}} onChange={handleImportTrips} /></label>}
            <button className="btn-primary" onClick={() => { setEditingTrip(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.bt_add_btn}</button>
          </div>

          {deletableTripIds.length > 0 && (
            <div style={{marginBottom: '12px', padding: '10px 14px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: 600}}>
                <input ref={selectAllTripsRef} type="checkbox" checked={allDeletableSelected} onChange={toggleSelectAllTrips} style={{width: '14px', height: '14px', cursor: 'pointer'}} />
                {lang === 'id' ? `Pilih semua (${deletableTripIds.length} dapat dihapus)` : `Select all (${deletableTripIds.length} deletable)`}
              </label>
              {selectedTripIds.length > 0 && (
                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                  <span style={{fontSize: '12px', color: 'var(--ims-text-2)'}}>{selectedTripIds.length} {lang === 'id' ? 'dipilih' : 'selected'}</span>
                  <button onClick={() => setSelectedTripIds([])} className="btn-ghost" style={{fontSize: '11px'}}>{lang === 'id' ? 'Batal' : 'Clear'}</button>
                  <button onClick={() => setBulkDeleteTripsOpen(true)} style={{background: '#c03030', border: 'none', color: '#fff', padding: '7px 12px', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'}}>
                    <Trash2 size={12} />{lang === 'id' ? `Hapus Terpilih (${selectedTripIds.length})` : `Delete Selected (${selectedTripIds.length})`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Trips list */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {visibleTrips.map(trip => (
              <BusinessTripCard
                key={trip.id}
                trip={trip}
                t={t}
                lang={lang}
                session={session}
                fmt={fmt}
                showCheckbox={deletableTripIds.length > 0 && tripCanDelete(trip, session)}
                isSelected={selectedTripIds.includes(trip.id)}
                onToggleSelect={() => toggleTripSelect(trip.id)}
                onDetail={() => setDetailTrip(trip)}
                onEdit={() => { setEditingTrip(trip); setModalOpen(true); }}
                onDelete={() => setDeleteTripId(trip.id)}
              />
            ))}
            {visibleTrips.length === 0 && <div style={{padding: '40px', textAlign: 'center', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', color: 'var(--ims-text-2)'}}>{t.bt_no_data}</div>}
          </div>
        </div>
      )}

      {/* REALIZATION TAB */}
      {tab === 'realization' && (
        <div>
          {/* Filter + Add */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px'}}>
            {canManageAll && (
              <div style={{display: 'flex', gap: '4px'}}>
                {[
                  { id: 'all', label: t.bt_all_trips },
                  { id: 'my', label: t.bt_my_trips },
                  { id: 'pending', label: t.bt_pending_review + (pendingRealizationsForMe > 0 ? ` (${pendingRealizationsForMe})` : '') },
                ].map(f => (
                  <button key={f.id} onClick={() => setFilterView(f.id)} style={{padding: '5px 11px', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', background: filterView === f.id ? 'var(--ims-accent)' : 'transparent', color: filterView === f.id ? 'var(--ims-gold)' : 'var(--ims-text-2)', border: '1px solid ' + (filterView === f.id ? 'var(--ims-accent)' : 'var(--ims-border)'), cursor: 'pointer', fontFamily: 'inherit'}}>{f.label}</button>
                ))}
              </div>
            )}
            <div style={{flex: canManageAll ? 'none' : 1}}></div>
            <button onClick={handleExportRealizations} className="btn-ghost" style={{fontSize: '11px', padding: '6px 12px'}} title="Export realisasi"><Download size={12} />Export</button>
            {canManageAll && <label className="btn-ghost" style={{fontSize: '11px', padding: '6px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px'}} title="Import realisasi dari CSV"><Upload size={12} />Import<input type="file" accept=".csv,text/csv" style={{display: 'none'}} onChange={handleImportRealizations} /></label>}
            {eligibleTripsForRealization.length > 0 && (
              <button className="btn-primary" onClick={() => { setEditingRealization(null); setSelectedTripForRealization(null); setRealizationFormOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.btr_add_btn}</button>
            )}
          </div>

          {/* Eligible trips banner (for current user only) */}
          {!canManageAll && eligibleTripsForRealization.length > 0 && (
            <div style={{padding: '12px 16px', background: 'var(--ims-gold-bg)', borderLeft: '3px solid var(--ims-accent)', marginBottom: '14px', fontSize: '12px'}}>
              <strong>{t.btr_eligible_trips}:</strong> {eligibleTripsForRealization.length} {lang === 'id' ? 'trip yang siap dilaporkan realisasinya' : 'trip(s) ready for realization'}.
            </div>
          )}
          {!canManageAll && eligibleTripsForRealization.length === 0 && visibleRealizations.length === 0 && (
            <div style={{padding: '40px', textAlign: 'center', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', color: 'var(--ims-text-2)', fontSize: '13px'}}>
              <FileCheck size={36} strokeWidth={1.2} style={{color: 'var(--ims-text-2)', marginBottom: '12px'}} />
              <div style={{fontStyle: 'italic'}}>{t.btr_no_eligible_trips}</div>
            </div>
          )}

          {/* Realizations list */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {visibleRealizations.map(r => <BusinessTripRealizationCard key={r.id} realization={r} t={t} lang={lang} session={session} fmt={fmt} onDetail={() => setDetailRealization(r)} onEdit={() => { setEditingRealization(r); setSelectedTripForRealization(businessTrips.find(bt => bt.id === r.businessTripId)); setRealizationFormOpen(true); }} onDelete={() => setDeleteRealizationId(r.id)} />)}
            {visibleRealizations.length === 0 && canManageAll && <div style={{padding: '40px', textAlign: 'center', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', color: 'var(--ims-text-2)'}}>{t.btr_no_realization}</div>}
          </div>
        </div>
      )}

      {/* DASHBOARD TAB - Analytics */}
      {tab === 'dashboard' && <BusinessTripDashboard businessTrips={visibleTrips} realizations={visibleRealizations} employees={employees} t={t} lang={lang} session={session} canManageAll={canManageAll} fmt={fmt} />}

      {/* Modals */}
      {modalOpen && <BusinessTripForm trip={editingTrip} employees={employees} session={session} fmt={fmt} onSubmit={handleSubmit} onSaveDraft={handleSaveDraft} onClose={() => { setModalOpen(false); setEditingTrip(null); }} t={t} lang={lang} />}
      {detailTrip && <BusinessTripDetail trip={detailTrip} session={session} t={t} lang={lang} fmt={fmt} onClose={() => setDetailTrip(null)} onAction={(action, note) => setConfirmAction({ action, trip: detailTrip, note })} />}

      {/* Confirm dialogs */}
      <ConfirmDialog open={!!confirmAction && confirmAction.action === 'approve'} title={lang === 'id' ? 'Setujui Pengajuan?' : 'Approve Request?'} message={t.bt_confirm_approve + (confirmAction?.note ? '\n\nCatatan: ' + confirmAction.note : '')} confirmText={t.bt_action_approve} onConfirm={() => handleApprove(confirmAction.trip, confirmAction.note)} onCancel={() => setConfirmAction(null)} lang={lang} />
      <ConfirmDialog open={!!confirmAction && confirmAction.action === 'reject'} title={lang === 'id' ? 'Tolak Pengajuan?' : 'Reject Request?'} message={t.bt_confirm_reject + (confirmAction?.note ? '\n\nAlasan: ' + confirmAction.note : '')} confirmText={t.bt_action_reject} onConfirm={() => handleReject(confirmAction.trip, confirmAction.note)} onCancel={() => setConfirmAction(null)} danger lang={lang} />
      <ConfirmDialog open={!!confirmAction && confirmAction.action === 'clarify'} title={lang === 'id' ? 'Minta Klarifikasi?' : 'Request Clarification?'} message={t.bt_confirm_clarify + (confirmAction?.note ? '\n\nCatatan: ' + confirmAction.note : '')} confirmText={t.bt_action_clarify} onConfirm={() => handleClarify(confirmAction.trip, confirmAction.note)} onCancel={() => setConfirmAction(null)} lang={lang} />
      <ConfirmDialog open={!!confirmAction && confirmAction.action === 'mark_paid'} title={lang === 'id' ? 'Konfirmasi Pencairan?' : 'Confirm Disbursement?'} message={t.bt_confirm_mark_paid} confirmText={t.bt_action_mark_paid} onConfirm={() => handleMarkPaid(confirmAction.trip, confirmAction.note)} onCancel={() => setConfirmAction(null)} lang={lang} />
      <ConfirmDialog open={!!deleteTripId} title={lang === 'id' ? 'Hapus Pengajuan?' : 'Delete Request?'} message={lang === 'id' ? 'Yakin ingin menghapus pengajuan ini? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to delete this request? This action cannot be undone.'} onConfirm={handleDelete} onCancel={() => setDeleteTripId(null)} danger lang={lang} />
      <ConfirmDialog
        open={bulkDeleteTripsOpen}
        title={lang === 'id' ? 'Hapus Pengajuan Terpilih?' : 'Delete Selected Requests?'}
        message={lang === 'id'
          ? `Apakah Anda yakin ingin menghapus ${selectedTripIds.length} pengajuan cash advance? Tindakan ini tidak dapat dibatalkan.`
          : `Are you sure you want to delete ${selectedTripIds.length} cash advance request(s)? This cannot be undone.`}
        onConfirm={confirmBulkDeleteTrips}
        onCancel={() => setBulkDeleteTripsOpen(false)}
        danger
        lang={lang}
      />

      {/* Realization Modals */}
      {realizationFormOpen && <BusinessTripRealizationForm fmt={fmt} realization={editingRealization} preSelectedTrip={selectedTripForRealization} eligibleTrips={eligibleTripsForRealization} existingRealizations={realizations} session={session} onSubmit={handleSubmitRealization} onSaveDraft={handleSaveRealizationDraft} onClose={() => { setRealizationFormOpen(false); setEditingRealization(null); setSelectedTripForRealization(null); }} t={t} lang={lang} />}
      {detailRealization && <BusinessTripRealizationDetail fmt={fmt} realization={detailRealization} businessTrip={businessTrips.find(t => t.id === detailRealization.businessTripId)} session={session} t={t} lang={lang} onClose={() => setDetailRealization(null)} onAction={(action, note) => setConfirmRealizationAction({ action, realization: detailRealization, note })} onSettle={() => setConfirmSettleId(detailRealization.id)} />}

      <ConfirmDialog open={!!confirmRealizationAction && confirmRealizationAction.action === 'approve'} title={lang === 'id' ? 'Setujui Realisasi?' : 'Approve Realization?'} message={t.btr_confirm_approve_realization || (lang === 'id' ? 'Yakin ingin menyetujui laporan realisasi ini? Akan diteruskan ke reviewer berikutnya.' : 'Approve this realization? It will be forwarded to next reviewer.')} confirmText={t.bt_action_approve} onConfirm={() => handleApproveRealization(confirmRealizationAction.realization, confirmRealizationAction.note)} onCancel={() => setConfirmRealizationAction(null)} lang={lang} />
      <ConfirmDialog open={!!confirmRealizationAction && confirmRealizationAction.action === 'clarify'} title={lang === 'id' ? 'Minta Klarifikasi?' : 'Request Clarification?'} message={t.btr_confirm_clarify_realization || (lang === 'id' ? 'Yakin ingin meminta klarifikasi? Realisasi dikembalikan ke karyawan untuk direvisi.' : 'Request clarification? Will be returned to employee.')} confirmText={t.bt_action_clarify} onConfirm={() => handleClarifyRealization(confirmRealizationAction.realization, confirmRealizationAction.note)} onCancel={() => setConfirmRealizationAction(null)} lang={lang} />
      <ConfirmDialog open={!!confirmSettleId} title={lang === 'id' ? 'Konfirmasi Settlement?' : 'Confirm Settlement?'} message={t.btr_confirm_settle} confirmText={t.btr_settle_now} onConfirm={() => handleSettle(confirmSettleId)} onCancel={() => setConfirmSettleId(null)} lang={lang} />
      <ConfirmDialog open={!!deleteRealizationId} title={lang === 'id' ? 'Hapus Realisasi?' : 'Delete Realization?'} message={lang === 'id' ? 'Yakin ingin menghapus laporan realisasi ini?' : 'Delete this realization report?'} onConfirm={handleDeleteRealization} onCancel={() => setDeleteRealizationId(null)} danger lang={lang} />
    </div>
  );
}
const BusinessTripCard = React.memo(function BusinessTripCard({ trip, t, lang, session, fmt, showCheckbox, isSelected, onToggleSelect, onDetail, onEdit, onDelete }) {
  const statusColors = {
    draft: '#94a3b8', pending_finance: 'var(--ims-gold)', pending_mops: 'var(--ims-gold)', pending_gm: 'var(--ims-gold)',
    approved: '#5b87b8', paid: 'var(--ims-accent-2)', in_progress: '#5b87b8', completed: 'var(--ims-accent-2)',
    rejected: '#8b3a3a', clarification: 'var(--ims-gold-dim)', postponed: '#94a3b8', cancelled: '#8b3a3a'
  };
  const statusColor = statusColors[trip.status] || 'var(--ims-text-2)';
  const isOwner = trip.travelerUsername === session.username;
  const canManageAll = ['super_admin', 'gm', 'manager_ops', 'finance'].includes(session.role);
  const canEdit = (isOwner && ['draft', 'clarification', 'rejected'].includes(trip.status)) || canManageAll;
  const canDelete = tripCanDelete(trip, session);

  return (
    <div style={{display: 'flex', gap: '10px', alignItems: 'stretch', background: isSelected ? 'rgba(192,48,48,0.04)' : 'transparent'}}>
      {showCheckbox && (
        <div style={{display: 'flex', alignItems: 'center', padding: '0 4px 0 8px'}} onClick={e => e.stopPropagation()}>
          <input type="checkbox" checked={!!isSelected} onChange={onToggleSelect} onClick={e => e.stopPropagation()} style={{width: '15px', height: '15px', cursor: 'pointer'}} title={lang === 'id' ? 'Pilih untuk hapus' : 'Select to delete'} />
        </div>
      )}
    <div style={{flex: 1, background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', borderLeft: `3px solid ${statusColor}`, padding: '14px 18px', cursor: 'pointer'}} onClick={onDetail}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '10px'}}>
        <div style={{flex: '1 1 320px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap'}}>
            <span className="mono" style={{fontSize: '12px', fontWeight: 700, color: 'var(--ims-text)'}}>{trip.requestNo}</span>
            <span style={{padding: '2px 8px', fontSize: '9px', background: statusColor + '25', color: statusColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t['bt_status_' + trip.status]}</span>
            {trip.paymentStatus === 'paid' && <span style={{padding: '2px 8px', fontSize: '9px', background: 'var(--ims-accent-2)25', color: 'var(--ims-accent-2)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>✓ {t.bt_payment_paid}</span>}
          </div>
          <div style={{fontSize: '13px', fontWeight: 600, marginTop: '2px'}}>{trip.travelerName} <span style={{fontSize: '10px', color: 'var(--ims-text-2)', fontWeight: 400}}>· {trip.position}</span></div>
          <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '4px'}}>🎯 <strong>{trip.destination}</strong> · <span className="mono">{trip.dateStart} → {trip.dateEnd}</span> ({trip.duration} {t.days})</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{trip.purpose}</div>
        </div>
        <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px'}}>
          <div className="mono" style={{fontSize: '15px', fontWeight: 600, color: 'var(--ims-text)'}}>{fmt(trip.totalAdvance)}</div>
          <div style={{fontSize: '9px', color: 'var(--ims-text-2)', letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t.bt_total_advance}</div>
          <div style={{display: 'flex', gap: '4px', marginTop: '4px'}}>
            {canEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit'}} title={t.crud_edit}><Edit2 size={11} /></button>}
            {canDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}} title={t.crud_delete}><Trash2 size={11} /></button>}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
});
function BusinessTripForm({ trip, employees, session, onSubmit, onSaveDraft, onClose, t, lang, fmt }) {
  const isEdit = !!trip;
  const todayStr = new Date().toISOString().split('T')[0];

  // Use current user as traveler (unless admin/manager editing for someone else - for now, self only)
  const traveler = employees[session.username] || { name: session.name, position: session.position, allowancePerDay: session.allowancePerDay };

  const [form, setForm] = useState(trip || {
    id: 'bt_' + Date.now(),
    requestNo: 'BT-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-5),
    travelerUsername: session.username, travelerName: session.name,
    position: traveler.position || 'Staff',
    allowancePerDay: traveler.allowancePerDay || POSITION_ALLOWANCE['Staff'],
    destination: '', destinationCity: '', purpose: '',
    dateStart: todayStr, dateEnd: todayStr, duration: 1,
    costs: { taxiHome: 0, taxiArrival: 0, taxiRs: 0, localTransport: 0, meals: 0, other: 0, otherNotes: '', allowanceTotal: traveler.allowancePerDay || 130000 },
    officeBooked: { ticketPP: 0, hotelTotal: 0, ticketNote: '', hotelNote: '' },
    bankAccount: { bankName: '', accountNo: '', holderName: traveler.name || session.name },
    status: 'draft', tripStatus: 'planned', paymentStatus: 'pending',
    paidDate: null, paidAmount: 0, paidProof: '',
    approvalHistory: [], submittedAt: '', updatedAt: '', realizationId: null,
  });

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const updateCost = (k, v) => setForm(prev => ({ ...prev, costs: { ...prev.costs, [k]: v } }));
  const updateOffice = (k, v) => setForm(prev => ({ ...prev, officeBooked: { ...prev.officeBooked, [k]: v } }));
  const updateBank = (k, v) => setForm(prev => ({ ...prev, bankAccount: { ...prev.bankAccount, [k]: v } }));

  // Auto-calc duration
  useEffect(() => {
    if (form.dateStart && form.dateEnd) {
      const d1 = new Date(form.dateStart);
      const d2 = new Date(form.dateEnd);
      const diff = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
      setForm(prev => {
        const allowanceTotal = diff * (prev.allowancePerDay || 130000);
        return { ...prev, duration: diff, costs: { ...prev.costs, allowanceTotal } };
      });
    }
  }, [form.dateStart, form.dateEnd, form.allowancePerDay]);

  // Calc total cash advance
  const totalCash = (form.costs.taxiHome || 0) + (form.costs.taxiArrival || 0) + (form.costs.taxiRs || 0) +
    (form.costs.localTransport || 0) + (form.costs.meals || 0) + (form.costs.other || 0) +
    (form.costs.allowanceTotal || 0);

  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const handleSubmitClick = () => {
    if (!form.destination || !form.purpose || !form.bankAccount.accountNo) {
      showToast(lang === 'id' ? 'Mohon lengkapi Tujuan, Keperluan, dan No. Rekening Bank.' : 'Please complete Destination, Purpose, and Bank Account Number.', 'warning');
      return;
    }
    setConfirmSubmit(true);
  };

  const handleConfirmSubmit = () => {
    const finalForm = { ...form, totalAdvance: totalCash };
    onSubmit(finalForm);
  };

  const handleDraftClick = () => {
    const finalForm = { ...form, totalAdvance: totalCash };
    onSaveDraft(finalForm);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '900px', maxHeight: '90vh', overflow: 'auto'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', position: 'sticky', top: 0, background: 'var(--ims-bg-card)', paddingBottom: '12px', borderBottom: '1px solid var(--ims-border)', zIndex: 1}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.bt_modal_edit : t.bt_modal_add}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>

        {/* Traveler info (read-only) */}
        <div style={{padding: '10px 14px', background: 'var(--ims-bg)', border: '1px solid var(--ims-border)', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '12px'}}>
          <div><strong>{t.bt_traveler}:</strong> {form.travelerName}</div>
          <div><strong>{t.bt_position}:</strong> {form.position}</div>
          <div><strong>{t.bt_allowance_daily}:</strong> <span className="mono">{fmt((form.allowancePerDay || 0))}</span></div>
        </div>

        {/* Section 1: Trip Detail */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>1. {lang === 'id' ? 'Detail Perjalanan' : 'Trip Detail'}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px'}}>
          <Field label={t.bt_destination}><input value={form.destination} onChange={e => update('destination', e.target.value)} placeholder="RS / Kota tujuan" /></Field>
          <Field label={t.bt_destination_city}><input value={form.destinationCity} onChange={e => update('destinationCity', e.target.value)} placeholder="Solo, Surabaya, dst" /></Field>
          <Field label={t.bt_purpose} full><textarea rows={2} value={form.purpose} onChange={e => update('purpose', e.target.value)} placeholder="Tujuan perjalanan secara detail" /></Field>
          <Field label={t.bt_date_start}><input type="date" value={form.dateStart} onChange={e => update('dateStart', e.target.value)} /></Field>
          <Field label={t.bt_date_end}><input type="date" value={form.dateEnd} onChange={e => update('dateEnd', e.target.value)} /></Field>
          <Field label={t.bt_duration}>
            <input type="number" value={form.duration} readOnly style={{background: 'var(--ims-bg-card-2)'}} />
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{lang === 'id' ? 'Otomatis dari tanggal mulai/akhir' : 'Auto from start/end date'}</div>
          </Field>
          <Field label={t.bt_allowance_total}>
            <input type="number" value={form.costs.allowanceTotal} readOnly style={{background: 'var(--ims-bg-card-2)'}} />
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{form.duration} × {fmt((form.allowancePerDay || 0))}</div>
          </Field>
        </div>

        {/* Section 2: Cost Components */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>2. {lang === 'id' ? 'Komponen Biaya (Cash Advance)' : 'Cost Components (Cash Advance)'}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px'}}>
          <Field label={t.bt_cost_taxi_home}><input type="number" value={form.costs.taxiHome} onChange={e => updateCost('taxiHome', parseInt(e.target.value) || 0)} /></Field>
          <Field label={t.bt_cost_taxi_arrival}><input type="number" value={form.costs.taxiArrival} onChange={e => updateCost('taxiArrival', parseInt(e.target.value) || 0)} /></Field>
          <Field label={t.bt_cost_taxi_rs}><input type="number" value={form.costs.taxiRs} onChange={e => updateCost('taxiRs', parseInt(e.target.value) || 0)} /></Field>
          <Field label={t.bt_cost_local_transport}><input type="number" value={form.costs.localTransport} onChange={e => updateCost('localTransport', parseInt(e.target.value) || 0)} /></Field>
          <Field label={t.bt_cost_meals}><input type="number" value={form.costs.meals} onChange={e => updateCost('meals', parseInt(e.target.value) || 0)} /></Field>
          <Field label={t.bt_cost_other}><input type="number" value={form.costs.other} onChange={e => updateCost('other', parseInt(e.target.value) || 0)} /></Field>
          <Field label={t.bt_cost_other_notes} full><input value={form.costs.otherNotes} onChange={e => updateCost('otherNotes', e.target.value)} placeholder="Detail item Lain-lain (parkir, retribusi, dll)" /></Field>
        </div>
        <div style={{padding: '12px 16px', background: 'var(--ims-bg-alt)', color: '#fff', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'}}>
          <div style={{fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ims-accent)'}}>{t.bt_total_advance}</div>
          <div className="mono" style={{fontSize: '22px', fontWeight: 600}}>{fmt(totalCash)}</div>
        </div>

        {/* Section 3: Office-booked (info only) */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>3. {t.bt_office_booked}</div>
        <div style={{padding: '10px 14px', background: 'var(--ims-gold-bg)', borderLeft: '3px solid var(--ims-accent)', fontSize: '11px', color: '#5a4a1a', marginBottom: '12px'}}>{lang === 'id' ? 'Tiket pesawat & hotel umumnya dipesankan oleh kantor. Nilai di bawah hanya untuk informasi, TIDAK ditransfer ke karyawan.' : 'Flight tickets & hotels are usually booked by office. Values below are FOR INFO ONLY, not transferred to employee.'}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px'}}>
          <Field label={t.bt_office_ticket + ' (Rp)'}><input type="number" value={form.officeBooked.ticketPP} onChange={e => updateOffice('ticketPP', parseInt(e.target.value) || 0)} /></Field>
          <Field label={t.bt_office_hotel + ' (Rp)'}><input type="number" value={form.officeBooked.hotelTotal} onChange={e => updateOffice('hotelTotal', parseInt(e.target.value) || 0)} /></Field>
          <Field label={lang === 'id' ? 'Detail Tiket' : 'Ticket Detail'}><input value={form.officeBooked.ticketNote} onChange={e => updateOffice('ticketNote', e.target.value)} placeholder="PNR / maskapai / rute" /></Field>
          <Field label={lang === 'id' ? 'Detail Hotel' : 'Hotel Detail'}><input value={form.officeBooked.hotelNote} onChange={e => updateOffice('hotelNote', e.target.value)} placeholder="Nama hotel / jumlah malam" /></Field>
        </div>

        {/* Section 4: Bank Account */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>4. {t.bt_bank_account}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px'}}>
          <Field label={t.bt_bank_name}><input value={form.bankAccount.bankName} onChange={e => updateBank('bankName', e.target.value)} placeholder="BCA / Mandiri / BNI / BRI" /></Field>
          <Field label={t.bt_bank_no}><input value={form.bankAccount.accountNo} onChange={e => updateBank('accountNo', e.target.value)} placeholder="No. rekening" /></Field>
          <Field label={t.bt_bank_holder}><input value={form.bankAccount.holderName} onChange={e => updateBank('holderName', e.target.value)} /></Field>
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid var(--ims-border)', paddingTop: '14px'}}>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{lang === 'id' ? '"Simpan Draft" untuk simpan tanpa kirim ke Finance. "Kirim ke Finance" untuk mulai workflow approval.' : '"Save Draft" stores without submitting. "Submit to Finance" starts approval workflow.'}</div>
          <div style={{display: 'flex', gap: '10px'}}>
            <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
            <button className="btn-ghost" onClick={handleDraftClick}>{lang === 'id' ? 'Simpan Draft' : 'Save Draft'}</button>
            <button className="btn-primary" onClick={handleSubmitClick}>{lang === 'id' ? 'Kirim ke Finance →' : 'Submit to Finance →'}</button>
          </div>
        </div>
      </div>
      <ConfirmDialog open={confirmSubmit} title={lang === 'id' ? 'Kirim ke Finance?' : 'Submit to Finance?'} message={t.bt_confirm_submit} confirmText={lang === 'id' ? 'Ya, Kirim' : 'Yes, Submit'} onConfirm={() => { setConfirmSubmit(false); handleConfirmSubmit(); }} onCancel={() => setConfirmSubmit(false)} lang={lang} />
    </div>
  );
}
function BusinessTripDetail({ trip, session, t, lang, fmt, onClose, onAction }) {
  const [reviewNote, setReviewNote] = useState('');

  // Determine what actions current user can take
  const canReviewFinance = session.role === 'finance' && trip.status === 'pending_finance';
  const canReviewMops = ['manager_ops', 'super_admin'].includes(session.role) && trip.status === 'pending_mops';
  const canReviewGm = ['gm', 'super_admin'].includes(session.role) && trip.status === 'pending_gm';
  const canMarkPaid = session.role === 'finance' && trip.status === 'approved';

  const canReview = canReviewFinance || canReviewMops || canReviewGm;

  const statusColors = {
    draft: '#94a3b8', pending_finance: 'var(--ims-gold)', pending_mops: 'var(--ims-gold)', pending_gm: 'var(--ims-gold)',
    approved: '#5b87b8', paid: 'var(--ims-accent-2)', in_progress: '#5b87b8', completed: 'var(--ims-accent-2)',
    rejected: '#8b3a3a', clarification: 'var(--ims-gold-dim)',
  };
  const statusColor = statusColors[trip.status] || 'var(--ims-text-2)';

  // PERFORMANCE: Memoize workflow data (only recompute when lang or history changes)
  const { workflowSteps, completedSteps } = useMemo(() => {
    const steps = [
      { id: 'submit', label: lang === 'id' ? 'Diajukan' : 'Submitted' },
      { id: 'finance', label: 'Finance' },
      { id: 'manager_ops', label: 'Manager Ops' },
      { id: 'gm', label: 'GM' },
      { id: 'paid', label: lang === 'id' ? 'Cair' : 'Disbursed' },
    ];
    const done = new Set();
    (trip.approvalHistory || []).forEach(h => {
      if (h.action === 'submitted') done.add('submit');
      else if (h.action === 'approved') done.add(h.level);
      else if (h.action === 'paid') done.add('paid');
    });
    return { workflowSteps: steps, completedSteps: done };
  }, [lang, trip.approvalHistory]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '900px', maxHeight: '90vh', overflow: 'auto'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', position: 'sticky', top: 0, background: 'var(--ims-bg-card)', paddingBottom: '12px', borderBottom: '1px solid var(--ims-border)', zIndex: 1}}>
          <div>
            <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{t.bt_modal_detail}</h2>
            <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '4px'}} className="mono">{trip.requestNo}</div>
          </div>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>

        {/* Status banner */}
        <div style={{padding: '14px 18px', background: statusColor + '15', borderLeft: '3px solid ' + statusColor, marginBottom: '16px'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '4px'}}>Status</div>
          <div style={{fontSize: '15px', fontWeight: 600, color: statusColor}}>{t['bt_status_' + trip.status]}</div>
        </div>

        {/* Workflow steps visualization */}
        <div style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '20px', overflowX: 'auto', padding: '8px 0'}}>
          {workflowSteps.map((step, i) => {
            const done = completedSteps.has(step.id);
            const isRejected = trip.status === 'rejected';
            return (
              <React.Fragment key={step.id}>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: '0 0 auto'}}>
                  <div style={{width: '32px', height: '32px', borderRadius: '50%', background: done && !isRejected ? 'var(--ims-accent-2)' : (isRejected ? '#c03030' : 'var(--ims-border)'), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600}}>{done ? '✓' : (i + 1)}</div>
                  <div style={{fontSize: '9px', letterSpacing: '0.05em', textTransform: 'uppercase', color: done ? 'var(--ims-accent)' : 'var(--ims-text-2)', fontWeight: done ? 600 : 400, whiteSpace: 'nowrap'}}>{step.label}</div>
                </div>
                {i < workflowSteps.length - 1 && <div style={{height: '2px', flex: 1, background: done ? 'var(--ims-accent-2)' : 'var(--ims-border)', minWidth: '20px'}} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Traveler info */}
        <div style={{padding: '12px 16px', background: 'var(--ims-bg)', border: '1px solid var(--ims-border)', marginBottom: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '12px'}}>
          <div><strong>{t.bt_traveler}:</strong> {trip.travelerName}</div>
          <div><strong>{t.bt_position}:</strong> {trip.position}</div>
          <div><strong>{t.bt_allowance_daily}:</strong> <span className="mono">{fmt(trip.allowancePerDay)}</span></div>
        </div>

        {/* Trip details */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{lang === 'id' ? 'Detail Perjalanan' : 'Trip Detail'}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px', fontSize: '12px', padding: '14px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
          <div><strong>{t.bt_destination}:</strong> {trip.destination}</div>
          <div><strong>{t.bt_destination_city}:</strong> {trip.destinationCity}</div>
          <div><strong>{t.bt_date_start}:</strong> <span className="mono">{trip.dateStart}</span></div>
          <div><strong>{t.bt_date_end}:</strong> <span className="mono">{trip.dateEnd}</span></div>
          <div><strong>{t.bt_duration}:</strong> {trip.duration} {t.days}</div>
          <div></div>
          <div style={{gridColumn: '1 / -1'}}><strong>{t.bt_purpose}:</strong> {trip.purpose}</div>
        </div>

        {/* Cost breakdown */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{lang === 'id' ? 'Breakdown Biaya' : 'Cost Breakdown'}</div>
        <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '12px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
          <tbody>
            <tr style={{borderBottom: '1px solid var(--ims-border)'}}><td style={{padding: '8px 14px'}}>{t.bt_cost_taxi_home}</td><td style={{padding: '8px 14px', textAlign: 'right'}} className="mono">{fmt(trip.costs.taxiHome)}</td></tr>
            <tr style={{borderBottom: '1px solid var(--ims-border)'}}><td style={{padding: '8px 14px'}}>{t.bt_cost_taxi_arrival}</td><td style={{padding: '8px 14px', textAlign: 'right'}} className="mono">{fmt(trip.costs.taxiArrival)}</td></tr>
            <tr style={{borderBottom: '1px solid var(--ims-border)'}}><td style={{padding: '8px 14px'}}>{t.bt_cost_taxi_rs}</td><td style={{padding: '8px 14px', textAlign: 'right'}} className="mono">{fmt(trip.costs.taxiRs)}</td></tr>
            <tr style={{borderBottom: '1px solid var(--ims-border)'}}><td style={{padding: '8px 14px'}}>{t.bt_cost_local_transport}</td><td style={{padding: '8px 14px', textAlign: 'right'}} className="mono">{fmt(trip.costs.localTransport)}</td></tr>
            <tr style={{borderBottom: '1px solid var(--ims-border)'}}><td style={{padding: '8px 14px'}}>{t.bt_cost_meals}</td><td style={{padding: '8px 14px', textAlign: 'right'}} className="mono">{fmt(trip.costs.meals)}</td></tr>
            <tr style={{borderBottom: '1px solid var(--ims-border)'}}><td style={{padding: '8px 14px'}}>{t.bt_cost_other} {trip.costs.otherNotes && <span style={{fontSize: '10px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>({trip.costs.otherNotes})</span>}</td><td style={{padding: '8px 14px', textAlign: 'right'}} className="mono">{fmt(trip.costs.other)}</td></tr>
            <tr style={{borderBottom: '1px solid var(--ims-border)', background: 'var(--ims-bg)'}}><td style={{padding: '8px 14px', fontWeight: 600}}>{t.bt_allowance_total} ({trip.duration} hari × {fmt(trip.allowancePerDay)})</td><td style={{padding: '8px 14px', textAlign: 'right', fontWeight: 600}} className="mono">{fmt(trip.costs.allowanceTotal)}</td></tr>
            <tr style={{background: 'var(--ims-bg-alt)', color: '#fff'}}><td style={{padding: '10px 14px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '11px'}}>{t.bt_total_advance}</td><td style={{padding: '10px 14px', textAlign: 'right', fontWeight: 700, fontSize: '14px'}} className="mono">{fmt(trip.totalAdvance)}</td></tr>
          </tbody>
        </table>

        {/* Office-booked */}
        {(trip.officeBooked.ticketPP > 0 || trip.officeBooked.hotelTotal > 0) && (
          <>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{t.bt_office_booked}</div>
            <div style={{padding: '10px 14px', background: 'var(--ims-gold-bg)', borderLeft: '3px solid var(--ims-accent)', marginBottom: '16px', fontSize: '12px'}}>
              {trip.officeBooked.ticketPP > 0 && <div><strong>✈ {t.bt_office_ticket}:</strong> <span className="mono">{fmt(trip.officeBooked.ticketPP)}</span> {trip.officeBooked.ticketNote && <span style={{color: 'var(--ims-text-2)', fontStyle: 'italic'}}>({trip.officeBooked.ticketNote})</span>}</div>}
              {trip.officeBooked.hotelTotal > 0 && <div style={{marginTop: '4px'}}><strong>🏨 {t.bt_office_hotel}:</strong> <span className="mono">{fmt(trip.officeBooked.hotelTotal)}</span> {trip.officeBooked.hotelNote && <span style={{color: 'var(--ims-text-2)', fontStyle: 'italic'}}>({trip.officeBooked.hotelNote})</span>}</div>}
            </div>
          </>
        )}

        {/* Bank account */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{t.bt_bank_account}</div>
        <div style={{padding: '12px 14px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', marginBottom: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '12px'}}>
          <div><strong>{t.bt_bank_name}:</strong> {trip.bankAccount.bankName || '-'}</div>
          <div><strong>{t.bt_bank_no}:</strong> <span className="mono">{trip.bankAccount.accountNo || '-'}</span></div>
          <div><strong>{t.bt_bank_holder}:</strong> {trip.bankAccount.holderName || '-'}</div>
        </div>

        {/* Payment info */}
        {trip.paymentStatus === 'paid' && (
          <>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{t.bt_payment_status}</div>
            <div style={{padding: '12px 14px', background: 'var(--ims-accent-2)15', borderLeft: '3px solid var(--ims-accent-2)', marginBottom: '16px', fontSize: '12px'}}>
              <div><strong>✓ {t.bt_payment_paid}</strong></div>
              <div style={{marginTop: '4px'}}><strong>{t.bt_paid_date}:</strong> <span className="mono">{trip.paidDate}</span> · <strong>{t.bt_paid_amount}:</strong> <span className="mono">{fmt(trip.paidAmount)}</span></div>
              {trip.paidProof && <div style={{marginTop: '6px'}}><LinkAttachment url={trip.paidProof} lang={lang} /></div>}
            </div>
          </>
        )}

        {/* Approval history */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{t.bt_approval_history}</div>
        <div style={{padding: '12px 14px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', marginBottom: '20px'}}>
          {(trip.approvalHistory || []).map((h, i) => {
            const actionColors = { submitted: '#5b87b8', approved: 'var(--ims-accent-2)', rejected: '#c03030', clarification: 'var(--ims-gold-dim)', paid: 'var(--ims-accent-2)' };
            const actionLabels = { 
              submitted: lang === 'id' ? 'Diajukan' : 'Submitted',
              approved: lang === 'id' ? 'Disetujui' : 'Approved',
              rejected: lang === 'id' ? 'Ditolak' : 'Rejected',
              clarification: lang === 'id' ? 'Minta Klarifikasi' : 'Requested Clarification',
              paid: lang === 'id' ? 'Dana Dicairkan' : 'Funds Disbursed',
            };
            const levelLabels = {
              submit: lang === 'id' ? 'Pengajuan' : 'Submission',
              finance: 'Finance',
              manager_ops: 'Manager Operasional',
              gm: 'General Manager',
            };
            return (
              <div key={i} style={{padding: '8px 0', borderBottom: i < trip.approvalHistory.length - 1 ? '1px dashed var(--ims-border)' : 'none', display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
                <div style={{width: '6px', height: '6px', borderRadius: '50%', background: actionColors[h.action] || 'var(--ims-text-2)', marginTop: '6px', flexShrink: 0}} />
                <div style={{flex: 1, fontSize: '12px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px'}}>
                    <span><strong style={{color: actionColors[h.action]}}>{actionLabels[h.action]}</strong> · {levelLabels[h.level]} oleh <strong>{h.byName}</strong></span>
                    <span className="mono" style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{h.date}</span>
                  </div>
                  {h.note && <div style={{fontSize: '11px', color: 'var(--ims-text)', marginTop: '4px', fontStyle: 'italic', padding: '6px 10px', background: 'var(--ims-bg-card-2)'}}>"{h.note}"</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Review actions */}
        {canReview && (
          <div style={{padding: '14px', background: 'var(--ims-gold-bg)', border: '1px solid var(--ims-accent)', borderLeft: '3px solid var(--ims-accent)', marginBottom: '12px'}}>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', color: '#5a4a1a', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{canReviewFinance ? t.bt_review_finance : canReviewMops ? t.bt_review_mops : t.bt_review_gm}</div>
            <Field label={t.bt_review_notes} full><textarea rows={2} value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder={lang === 'id' ? 'Catatan review (opsional untuk approve, wajib untuk reject/klarifikasi)' : 'Review notes (optional for approve, required for reject/clarification)'} /></Field>
            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px'}}>
              <button onClick={() => onAction('approve', reviewNote)} style={{background: 'var(--ims-accent-2)', color: '#fff', border: 'none', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, letterSpacing: '0.05em'}}>✓ {t.bt_action_approve}</button>
              <button onClick={() => { if (!reviewNote.trim()) { showToast(lang === 'id' ? 'Mohon isi catatan klarifikasi.' : 'Please provide clarification note.', 'warning'); return; } onAction('clarify', reviewNote); }} style={{background: 'var(--ims-gold-dim)', color: '#fff', border: 'none', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, letterSpacing: '0.05em'}}>⚠ {t.bt_action_clarify}</button>
              <button onClick={() => { if (!reviewNote.trim()) { showToast(lang === 'id' ? 'Mohon isi alasan penolakan.' : 'Please provide rejection reason.', 'warning'); return; } onAction('reject', reviewNote); }} style={{background: '#c03030', color: '#fff', border: 'none', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, letterSpacing: '0.05em'}}>✗ {t.bt_action_reject}</button>
            </div>
          </div>
        )}

        {/* Mark as paid action (Finance only, after approved) */}
        {canMarkPaid && (
          <div style={{padding: '14px', background: 'var(--ims-accent-2)15', border: '1px solid var(--ims-accent-2)', borderLeft: '3px solid var(--ims-accent-2)', marginBottom: '12px'}}>
            <div style={{fontSize: '12px', color: '#1a4d2a', marginBottom: '8px'}}>{lang === 'id' ? 'Pengajuan telah disetujui. Setelah dana ditransfer ke rekening karyawan, klik tombol di bawah.' : 'Request approved. After transferring funds to employee account, click button below.'}</div>
            <button onClick={() => onAction('mark_paid', '')} style={{background: 'var(--ims-accent-2)', color: '#fff', border: 'none', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, letterSpacing: '0.05em'}}>💸 {t.bt_action_mark_paid}</button>
          </div>
        )}

        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px', borderTop: '1px solid var(--ims-border)', paddingTop: '14px'}}>
          <button className="btn-ghost" onClick={onClose}>{lang === 'id' ? 'Tutup' : 'Close'}</button>
        </div>
      </div>
    </div>
  );
}
const BusinessTripRealizationCard = React.memo(function BusinessTripRealizationCard({ realization, t, lang, session, fmt, onDetail, onEdit, onDelete }) {
  const statusColors = {
    draft: '#94a3b8', pending_finance: 'var(--ims-gold)', pending_mops: 'var(--ims-gold)', pending_gm: 'var(--ims-gold)',
    approved: 'var(--ims-accent-2)', clarification: 'var(--ims-gold-dim)',
  };
  const statusColor = statusColors[realization.status] || 'var(--ims-text-2)';
  const isOwner = realization.travelerUsername === session.username;
  const canManageAll = ['super_admin', 'gm', 'manager_ops', 'finance'].includes(session.role);
  const canEdit = (isOwner && ['draft', 'clarification'].includes(realization.status)) || canManageAll;
  const canDelete = isOwner && realization.status === 'draft';

  // Difference color
  const diffColor = realization.difference > 0 ? 'var(--ims-gold-dim)' : (realization.difference < 0 ? '#5b87b8' : 'var(--ims-accent-2)');
  const diffLabel = realization.difference > 0 ? t.btr_difference_return : (realization.difference < 0 ? t.btr_difference_reimburse : t.btr_difference_zero);

  return (
    <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', borderLeft: `3px solid ${statusColor}`, padding: '14px 18px', cursor: 'pointer'}} onClick={onDetail}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '10px'}}>
        <div style={{flex: '1 1 320px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap'}}>
            <span className="mono" style={{fontSize: '12px', fontWeight: 700, color: 'var(--ims-text)'}}>{realization.realizationNo}</span>
            <span style={{padding: '2px 8px', fontSize: '9px', background: statusColor + '25', color: statusColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t['btr_status_' + realization.status] || realization.status}</span>
            {realization.status === 'approved' && realization.settlementStatus === 'pending' && realization.difference !== 0 && <span style={{padding: '2px 8px', fontSize: '9px', background: 'var(--ims-gold-dim)25', color: 'var(--ims-gold-dim)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>⏳ {t.btr_settlement_pending}</span>}
            {realization.settlementStatus === 'settled' && <span style={{padding: '2px 8px', fontSize: '9px', background: 'var(--ims-accent-2)25', color: 'var(--ims-accent-2)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>✓ {t.btr_settlement_done}</span>}
          </div>
          <div style={{fontSize: '13px', fontWeight: 600, marginTop: '2px'}}>{realization.travelerName} <span style={{fontSize: '10px', color: 'var(--ims-text-2)', fontWeight: 400}}>· {realization.position}</span></div>
          <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '4px'}}>🎯 <strong>{realization.destination}</strong> · <span className="mono">{realization.dateStart} → {realization.dateEnd}</span> · {realization.actualDays} {t.days} aktual</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{lang === 'id' ? 'Link ke' : 'Linked to'}: <span className="mono">{realization.businessTripNo}</span></div>
        </div>
        <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px'}}>
          <div style={{fontSize: '9px', color: 'var(--ims-text-2)', letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t.btr_total_actual}</div>
          <div className="mono" style={{fontSize: '14px', fontWeight: 600, color: 'var(--ims-text)'}}>{fmt(realization.totalActual)}</div>
          <div style={{fontSize: '9px', color: 'var(--ims-text-2)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '4px'}}>{t.btr_difference}</div>
          <div className="mono" style={{fontSize: '13px', fontWeight: 600, color: diffColor}}>{realization.difference > 0 ? '+' : ''}{fmt(realization.difference)}</div>
          <div style={{fontSize: '9px', color: diffColor, fontStyle: 'italic'}}>{diffLabel}</div>
          <div style={{display: 'flex', gap: '4px', marginTop: '6px'}}>
            {canEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit'}} title={t.crud_edit}><Edit2 size={11} /></button>}
            {canEdit && <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}} title={t.crud_delete || 'Hapus'}><Trash2 size={11} /></button>}
            {canDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}} title={t.crud_delete}><Trash2 size={11} /></button>}
          </div>
        </div>
      </div>
    </div>
  );
});
function BusinessTripRealizationForm({ realization, preSelectedTrip, eligibleTrips, existingRealizations, session, onSubmit, onSaveDraft, onClose, t, lang, fmt }) {
  const isEdit = !!realization;
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  // Trip selection: edit mode uses pre-selected, new mode requires picking from eligible
  // Filter out trips that already have a non-draft realization linked
  const availableTrips = useMemo(() => {
    if (isEdit) return eligibleTrips;
    const usedTripIds = new Set(existingRealizations.filter(r => r.status !== 'draft').map(r => r.businessTripId));
    return eligibleTrips.filter(t => !usedTripIds.has(t.id));
  }, [eligibleTrips, existingRealizations, isEdit]);

  const [selectedTripId, setSelectedTripId] = useState(realization?.businessTripId || preSelectedTrip?.id || (availableTrips[0]?.id || ''));
  const selectedTrip = useMemo(() => {
    if (realization) return eligibleTrips.find(t => t.id === realization.businessTripId) || preSelectedTrip;
    return availableTrips.find(t => t.id === selectedTripId) || availableTrips[0];
  }, [selectedTripId, availableTrips, realization, preSelectedTrip, eligibleTrips]);

  // Initialize form
  const initialForm = useMemo(() => {
    if (realization) return realization;
    if (!selectedTrip) return null;
    return {
      id: 'btr_' + Date.now(),
      realizationNo: 'BTR-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-5),
      businessTripId: selectedTrip.id,
      businessTripNo: selectedTrip.requestNo,
      travelerUsername: selectedTrip.travelerUsername,
      travelerName: selectedTrip.travelerName,
      position: selectedTrip.position,
      allowancePerDay: selectedTrip.allowancePerDay,
      destination: selectedTrip.destination,
      destinationCity: selectedTrip.destinationCity,
      dateStart: selectedTrip.dateStart,
      dateEnd: selectedTrip.dateEnd,
      plannedDays: selectedTrip.duration,
      actualDays: selectedTrip.duration,
      totalAdvanceReceived: selectedTrip.totalAdvance,
      // Pre-fill actual with planned amounts (user akan edit)
      actualCosts: {
        taxiHome: selectedTrip.costs.taxiHome,
        taxiArrival: selectedTrip.costs.taxiArrival,
        taxiRs: selectedTrip.costs.taxiRs,
        localTransport: selectedTrip.costs.localTransport,
        meals: selectedTrip.costs.meals,
        other: selectedTrip.costs.other,
        otherNotes: selectedTrip.costs.otherNotes,
      },
      actualAllowance: selectedTrip.duration * selectedTrip.allowancePerDay,
      totalActual: selectedTrip.totalAdvance,
      difference: 0,
      proofs: { taxiHome: '', taxiArrival: '', taxiRs: '', localTransport: '', meals: '', other: '' },
      notes: '',
      status: 'draft',
      approvalHistory: [],
      submittedAt: '', updatedAt: '',
      settlementStatus: 'pending', settlementDate: null, settlementAmount: 0, settlementNote: '',
    };
  }, [realization, selectedTrip]);

  const [form, setForm] = useState(initialForm);

  // Re-init when trip changes (for new realization)
  useEffect(() => {
    if (!isEdit && initialForm) setForm(initialForm);
  }, [selectedTripId]);

  if (!selectedTrip || !form) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <h3 className="serif" style={{margin: 0, marginBottom: '14px'}}>{t.btr_modal_add}</h3>
          <div style={{padding: '20px', background: 'var(--ims-gold-bg)', borderLeft: '3px solid var(--ims-accent)', color: '#5a4a1a', fontSize: '13px'}}>{t.btr_no_eligible_trips}</div>
          <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '14px'}}><button className="btn-ghost" onClick={onClose}>{lang === 'id' ? 'Tutup' : 'Close'}</button></div>
        </div>
      </div>
    );
  }

  const updateCost = (k, v) => setForm(prev => ({ ...prev, actualCosts: { ...prev.actualCosts, [k]: v } }));
  const updateProof = (k, v) => setForm(prev => ({ ...prev, proofs: { ...prev.proofs, [k]: v } }));

  // PERFORMANCE: Compute totals via useMemo instead of useEffect→setForm (no extra render cycle)
  const computedTotals = useMemo(() => {
    const actualAllowance = (form.actualDays || 0) * (form.allowancePerDay || 0);
    const ac = form.actualCosts || {};
    const totalActual = (ac.taxiHome || 0) + (ac.taxiArrival || 0) + (ac.taxiRs || 0) +
      (ac.localTransport || 0) + (ac.meals || 0) + (ac.other || 0) + actualAllowance;
    const difference = (form.totalAdvanceReceived || 0) - totalActual;
    return { actualAllowance, totalActual, difference };
  }, [form.actualDays, form.allowancePerDay, form.actualCosts, form.totalAdvanceReceived]);

  // Keep form in sync for submit (only writes when computed differs - prevents loop)
  useEffect(() => {
    if (form.actualAllowance !== computedTotals.actualAllowance ||
        form.totalActual !== computedTotals.totalActual ||
        form.difference !== computedTotals.difference) {
      setForm(prev => ({ ...prev, ...computedTotals }));
    }
  }, [computedTotals, form.actualAllowance, form.totalActual, form.difference]);

  // Use computed for immediate display (so UI feels instant)
  const displayAllowance = computedTotals.actualAllowance;
  const displayTotalActual = computedTotals.totalActual;
  const displayDifference = computedTotals.difference;

  const diffColor = displayDifference > 0 ? 'var(--ims-gold-dim)' : (displayDifference < 0 ? '#5b87b8' : 'var(--ims-accent-2)');
  const diffLabel = displayDifference > 0 ? t.btr_difference_return : (displayDifference < 0 ? t.btr_difference_reimburse : t.btr_difference_zero);

  const handleSubmitClick = () => { setConfirmSubmit(true); };
  const handleConfirmSubmit = () => onSubmit(form);
  const handleDraftClick = () => onSaveDraft(form);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '950px', maxHeight: '90vh', overflow: 'auto'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', position: 'sticky', top: 0, background: 'var(--ims-bg-card)', paddingBottom: '12px', borderBottom: '1px solid var(--ims-border)', zIndex: 1}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.btr_modal_edit : t.btr_modal_add}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>

        {/* Trip selector (new mode only) */}
        {!isEdit && (
          <div style={{marginBottom: '14px'}}>
            <Field label={t.btr_select_trip}>
              <select value={selectedTripId} onChange={e => setSelectedTripId(e.target.value)}>
                {availableTrips.map(trip => <option key={trip.id} value={trip.id}>{trip.requestNo} — {trip.destination} ({trip.dateStart} → {trip.dateEnd}) · {fmt(trip.totalAdvance)}</option>)}
              </select>
            </Field>
          </div>
        )}

        {/* Trip info banner */}
        <div style={{padding: '12px 16px', background: 'var(--ims-bg)', border: '1px solid var(--ims-border)', marginBottom: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px', fontSize: '12px'}}>
          <div><strong>{t.bt_traveler}:</strong> {form.travelerName}</div>
          <div><strong>{t.bt_position}:</strong> {form.position}</div>
          <div><strong>{t.bt_allowance_daily}:</strong> <span className="mono">{fmt(form.allowancePerDay)}</span></div>
          <div><strong>{t.bt_destination}:</strong> {form.destination}</div>
          <div><strong>{lang === 'id' ? 'Rencana' : 'Planned'}:</strong> {form.plannedDays} {t.days}</div>
          <div><strong>{t.btr_cash_advance_received}:</strong> <span className="mono">{fmt(form.totalAdvanceReceived)}</span></div>
        </div>

        {/* Section: Actual Days */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>1. {t.btr_actual_days}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px'}}>
          <Field label={t.btr_actual_days}>
            <input type="number" min="1" max={form.plannedDays * 2} value={form.actualDays} onChange={e => setForm(prev => ({ ...prev, actualDays: parseInt(e.target.value) || 1 }))} />
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{t.btr_actual_days_help}</div>
          </Field>
          <Field label={t.btr_actual_allowance}>
            <input type="number" value={displayAllowance} readOnly style={{background: 'var(--ims-bg-card-2)'}} />
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{form.actualDays} × {fmt(form.allowancePerDay)} · {t.btr_no_proof_allowance}</div>
          </Field>
        </div>

        {/* Section: Actual Costs + Proofs */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>2. {t.btr_actual_cost}</div>
        <div style={{padding: '10px 14px', background: 'var(--ims-gold-bg)', borderLeft: '3px solid var(--ims-accent)', fontSize: '11px', color: '#5a4a1a', marginBottom: '12px'}}>{lang === 'id' ? 'Upload bukti struk/bill ke Google Drive, lalu paste URL share-nya untuk setiap item NON-allowance.' : 'Upload receipts to Google Drive then paste share URL for each NON-allowance item.'}</div>
        {[
          { key: 'taxiHome', label: t.btr_actual_taxi_home, planned: selectedTrip.costs.taxiHome },
          { key: 'taxiArrival', label: t.btr_actual_taxi_arrival, planned: selectedTrip.costs.taxiArrival },
          { key: 'taxiRs', label: t.btr_actual_taxi_rs, planned: selectedTrip.costs.taxiRs },
          { key: 'localTransport', label: t.btr_actual_local_transport, planned: selectedTrip.costs.localTransport },
          { key: 'meals', label: t.btr_actual_meals, planned: selectedTrip.costs.meals },
          { key: 'other', label: t.btr_actual_other, planned: selectedTrip.costs.other },
        ].map(item => (
          <div key={item.key} style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px', padding: '10px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
            <Field label={item.label}>
              <input type="number" value={form.actualCosts[item.key] || 0} onChange={e => updateCost(item.key, parseInt(e.target.value) || 0)} />
              <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{t.btr_column_planned}: <span className="mono">{fmt(item.planned)}</span></div>
            </Field>
            <Field label={t.btr_proof}>
              <input value={form.proofs[item.key] || ''} onChange={e => updateProof(item.key, e.target.value)} placeholder="https://drive.google.com/..." />
              <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px', fontStyle: 'italic'}}>{t.btr_proof_help}</div>
            </Field>
          </div>
        ))}

        {/* Total + Difference */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '20px', border: '1px solid var(--ims-border)'}}>
          <div style={{padding: '14px 16px', background: 'var(--ims-bg-card)'}}>
            <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.btr_cash_advance_received}</div>
            <div className="mono serif" style={{fontSize: '18px', fontWeight: 500, marginTop: '4px'}}>{fmt(form.totalAdvanceReceived)}</div>
          </div>
          <div style={{padding: '14px 16px', background: 'var(--ims-bg-card)'}}>
            <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{t.btr_total_actual}</div>
            <div className="mono serif" style={{fontSize: '18px', fontWeight: 500, marginTop: '4px'}}>{fmt(displayTotalActual)}</div>
          </div>
          <div style={{padding: '14px 16px', background: diffColor + '15', borderLeft: '3px solid ' + diffColor}}>
            <div style={{fontSize: '9px', letterSpacing: '0.2em', color: diffColor, textTransform: 'uppercase', fontWeight: 600}}>{t.btr_difference}</div>
            <div className="mono serif" style={{fontSize: '18px', fontWeight: 500, marginTop: '4px', color: diffColor}}>{displayDifference > 0 ? '+' : ''}{fmt(displayDifference)}</div>
            <div style={{fontSize: '10px', color: diffColor, fontStyle: 'italic', marginTop: '2px'}}>{diffLabel}</div>
          </div>
        </div>

        {/* Notes */}
        <Field label={t.btr_realization_notes} full><textarea rows={3} value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} placeholder={lang === 'id' ? 'Catatan tambahan tentang perjalanan & realisasi biaya' : 'Additional notes about the trip & cost realization'} /></Field>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid var(--ims-border)', paddingTop: '14px', marginTop: '14px'}}>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{lang === 'id' ? '"Simpan Draft" untuk lanjut input. "Kirim" untuk diverifikasi Finance → Manager Ops → GM.' : '"Save Draft" to continue. "Submit" for Finance → Manager Ops → GM verification.'}</div>
          <div style={{display: 'flex', gap: '10px'}}>
            <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
            <button className="btn-ghost" onClick={handleDraftClick}>{lang === 'id' ? 'Simpan Draft' : 'Save Draft'}</button>
            <button className="btn-primary" onClick={handleSubmitClick}>{t.btr_action_submit} →</button>
          </div>
        </div>
      </div>
      <ConfirmDialog open={confirmSubmit} title={lang === 'id' ? 'Kirim Realisasi?' : 'Submit Realization?'} message={t.btr_confirm_submit} confirmText={lang === 'id' ? 'Ya, Kirim' : 'Yes, Submit'} onConfirm={() => { setConfirmSubmit(false); handleConfirmSubmit(); }} onCancel={() => setConfirmSubmit(false)} lang={lang} />
    </div>
  );
}
function BusinessTripRealizationDetail({ realization, businessTrip, session, t, lang, fmt, onClose, onAction, onSettle }) {
  const [reviewNote, setReviewNote] = useState('');

  const canReviewFinance = session.role === 'finance' && realization.status === 'pending_finance';
  const canReviewMops = ['manager_ops', 'super_admin'].includes(session.role) && realization.status === 'pending_mops';
  const canReviewGm = ['gm', 'super_admin'].includes(session.role) && realization.status === 'pending_gm';
  const canSettle = session.role === 'finance' && realization.status === 'approved' && realization.settlementStatus === 'pending' && realization.difference !== 0;
  const canReview = canReviewFinance || canReviewMops || canReviewGm;

  const statusColors = {
    draft: '#94a3b8', pending_finance: 'var(--ims-gold)', pending_mops: 'var(--ims-gold)', pending_gm: 'var(--ims-gold)',
    approved: 'var(--ims-accent-2)', clarification: 'var(--ims-gold-dim)',
  };
  const statusColor = statusColors[realization.status] || 'var(--ims-text-2)';
  const diffColor = realization.difference > 0 ? 'var(--ims-gold-dim)' : (realization.difference < 0 ? '#5b87b8' : 'var(--ims-accent-2)');

  // Comparison rows
  // PERFORMANCE: Memoize comparison row config
  const compRows = useMemo(() => [
    { key: 'taxiHome', label: t.bt_cost_taxi_home, plannedKey: 'taxiHome' },
    { key: 'taxiArrival', label: t.bt_cost_taxi_arrival, plannedKey: 'taxiArrival' },
    { key: 'taxiRs', label: t.bt_cost_taxi_rs, plannedKey: 'taxiRs' },
    { key: 'localTransport', label: t.bt_cost_local_transport, plannedKey: 'localTransport' },
    { key: 'meals', label: t.bt_cost_meals, plannedKey: 'meals' },
    { key: 'other', label: t.bt_cost_other, plannedKey: 'other' },
  ], [t]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '950px', maxHeight: '90vh', overflow: 'auto'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', position: 'sticky', top: 0, background: 'var(--ims-bg-card)', paddingBottom: '12px', borderBottom: '1px solid var(--ims-border)', zIndex: 1}}>
          <div>
            <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{t.btr_modal_detail}</h2>
            <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '4px'}} className="mono">{realization.realizationNo} · {lang === 'id' ? 'Link' : 'Linked to'} {realization.businessTripNo}</div>
          </div>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>

        {/* Status banner */}
        <div style={{padding: '14px 18px', background: statusColor + '15', borderLeft: '3px solid ' + statusColor, marginBottom: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px'}}>
          <div>
            <div style={{fontSize: '10px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '4px'}}>Status</div>
            <div style={{fontSize: '15px', fontWeight: 600, color: statusColor}}>{t['btr_status_' + realization.status] || realization.status}</div>
          </div>
          {realization.settlementStatus === 'settled' && (
            <div style={{textAlign: 'right'}}>
              <div style={{fontSize: '10px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '4px'}}>{t.btr_settlement_status}</div>
              <div style={{fontSize: '13px', fontWeight: 600, color: 'var(--ims-accent-2)'}}>✓ {t.btr_settlement_done}</div>
              {realization.settlementDate && <div className="mono" style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{realization.settlementDate}</div>}
            </div>
          )}
        </div>

        {/* Trip info */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{t.btr_trip_info}</div>
        <div style={{padding: '12px 16px', background: 'var(--ims-bg)', border: '1px solid var(--ims-border)', marginBottom: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px', fontSize: '12px'}}>
          <div><strong>{t.bt_traveler}:</strong> {realization.travelerName}</div>
          <div><strong>{t.bt_position}:</strong> {realization.position}</div>
          <div><strong>{t.bt_destination}:</strong> {realization.destination}</div>
          <div><strong>{lang === 'id' ? 'Rencana' : 'Planned'}:</strong> {realization.plannedDays} {t.days}</div>
          <div><strong>{t.btr_actual_days}:</strong> <span style={{color: realization.actualDays < realization.plannedDays ? '#5b87b8' : 'var(--ims-accent)', fontWeight: 600}}>{realization.actualDays} {t.days}</span></div>
          <div><strong>{t.bt_allowance_daily}:</strong> <span className="mono">{fmt(realization.allowancePerDay)}</span></div>
        </div>

        {/* Comparison table */}
        <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{t.btr_comparison}</div>
        <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '12px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
          <thead>
            <tr style={{background: 'var(--ims-bg)'}}>
              <Th>{lang === 'id' ? 'Komponen' : 'Component'}</Th>
              <Th align="right">{t.btr_column_planned}</Th>
              <Th align="right">{t.btr_column_actual}</Th>
              <Th align="right">{t.btr_column_diff}</Th>
              <Th align="center">{t.btr_proof}</Th>
            </tr>
          </thead>
          <tbody>
            {compRows.map(row => {
              const planned = businessTrip ? businessTrip.costs[row.plannedKey] : 0;
              const actual = realization.actualCosts[row.key] || 0;
              const diff = planned - actual;
              const dColor = diff > 0 ? 'var(--ims-gold-dim)' : (diff < 0 ? '#5b87b8' : 'var(--ims-text-2)');
              return (
                <tr key={row.key} style={{borderTop: '1px solid var(--ims-border)'}}>
                  <Td>{row.label}{realization.actualCosts.otherNotes && row.key === 'other' ? <span style={{fontSize: '10px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}> ({realization.actualCosts.otherNotes})</span> : ''}</Td>
                  <Td align="right"><span className="mono">{fmt(planned)}</span></Td>
                  <Td align="right"><span className="mono" style={{fontWeight: actual !== planned ? 600 : 400}}>{fmt(actual)}</span></Td>
                  <Td align="right"><span className="mono" style={{color: dColor, fontWeight: diff !== 0 ? 600 : 400}}>{diff > 0 ? '+' : ''}{fmt(diff)}</span></Td>
                  <Td align="center">{realization.proofs[row.key] ? <LinkAttachment url={realization.proofs[row.key]} lang={lang} /> : <span style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>-</span>}</Td>
                </tr>
              );
            })}
            <tr style={{borderTop: '1px solid var(--ims-border)', background: 'var(--ims-bg-card-2)'}}>
              <Td><strong>{t.btr_actual_allowance}</strong> <span style={{fontSize: '10px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>({realization.actualDays} × {fmt(realization.allowancePerDay)})</span></Td>
              <Td align="right"><span className="mono">{fmt((businessTrip ? businessTrip.costs.allowanceTotal : 0))}</span></Td>
              <Td align="right"><span className="mono" style={{fontWeight: 600}}>{fmt(realization.actualAllowance)}</span></Td>
              <Td align="right"><span className="mono" style={{fontWeight: 600}}>{fmt((businessTrip ? businessTrip.costs.allowanceTotal : 0) - realization.actualAllowance)}</span></Td>
              <Td align="center"><span style={{fontSize: '10px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{lang === 'id' ? 'hak karyawan' : 'employee right'}</span></Td>
            </tr>
            <tr style={{background: 'var(--ims-bg-alt)', color: '#fff'}}>
              <td style={{padding: '10px 14px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '11px'}}>TOTAL</td>
              <td style={{padding: '10px 14px', textAlign: 'right', fontWeight: 600}} className="mono">{fmt(realization.totalAdvanceReceived)}</td>
              <td style={{padding: '10px 14px', textAlign: 'right', fontWeight: 700}} className="mono">{fmt(realization.totalActual)}</td>
              <td style={{padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--ims-accent)'}} className="mono">{realization.difference > 0 ? '+' : ''}{fmt(realization.difference)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* Difference summary */}
        <div style={{padding: '14px 18px', background: diffColor + '15', borderLeft: '3px solid ' + diffColor, marginBottom: '16px'}}>
          <div style={{fontSize: '10px', letterSpacing: '0.15em', color: diffColor, textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px'}}>{t.btr_difference}</div>
          <div className="mono" style={{fontSize: '20px', fontWeight: 600, color: diffColor}}>{realization.difference > 0 ? '+' : ''}{fmt(realization.difference)}</div>
          <div style={{fontSize: '12px', color: diffColor, marginTop: '4px', fontStyle: 'italic'}}>
            {realization.difference > 0 ? `${t.btr_difference_return} — ${lang === 'id' ? 'karyawan kembalikan kelebihan' : 'employee returns'} ${fmt(Math.abs(realization.difference))}` :
             realization.difference < 0 ? `${t.btr_difference_reimburse} — ${lang === 'id' ? 'kantor reimburse kekurangan' : 'office reimburses'} ${fmt(Math.abs(realization.difference))}` :
             t.btr_difference_zero}
          </div>
        </div>

        {/* Settlement info if settled */}
        {realization.settlementStatus === 'settled' && realization.settlementNote && (
          <div style={{padding: '12px 14px', background: 'var(--ims-accent-2)15', borderLeft: '3px solid var(--ims-accent-2)', marginBottom: '16px', fontSize: '12px'}}>
            <strong>✓ Settlement Selesai:</strong> {realization.settlementNote}
            {realization.settlementDate && <span className="mono" style={{marginLeft: '8px', color: 'var(--ims-text-2)'}}>· {realization.settlementDate}</span>}
          </div>
        )}

        {/* Notes */}
        {realization.notes && (
          <>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{t.btr_realization_notes}</div>
            <div style={{padding: '12px 14px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', marginBottom: '16px', fontSize: '12px', fontStyle: 'italic'}}>{realization.notes}</div>
          </>
        )}

        {/* Approval history */}
        {realization.approvalHistory && realization.approvalHistory.length > 0 && (
          <>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{t.bt_approval_history}</div>
            <div style={{padding: '12px 14px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', marginBottom: '20px'}}>
              {realization.approvalHistory.map((h, i) => {
                const actionColors = { submitted: '#5b87b8', approved: 'var(--ims-accent-2)', clarification: 'var(--ims-gold-dim)' };
                const actionLabels = {
                  submitted: lang === 'id' ? 'Diajukan' : 'Submitted',
                  approved: lang === 'id' ? 'Disetujui' : 'Approved',
                  clarification: lang === 'id' ? 'Minta Klarifikasi' : 'Requested Clarification',
                };
                const levelLabels = { submit: lang === 'id' ? 'Pengajuan' : 'Submission', finance: 'Finance', manager_ops: 'Manager Operasional', gm: 'General Manager' };
                return (
                  <div key={i} style={{padding: '8px 0', borderBottom: i < realization.approvalHistory.length - 1 ? '1px dashed var(--ims-border)' : 'none', display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
                    <div style={{width: '6px', height: '6px', borderRadius: '50%', background: actionColors[h.action] || 'var(--ims-text-2)', marginTop: '6px', flexShrink: 0}} />
                    <div style={{flex: 1, fontSize: '12px'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px'}}>
                        <span><strong style={{color: actionColors[h.action]}}>{actionLabels[h.action]}</strong> · {levelLabels[h.level]} oleh <strong>{h.byName}</strong></span>
                        <span className="mono" style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>{h.date}</span>
                      </div>
                      {h.note && <div style={{fontSize: '11px', color: 'var(--ims-text)', marginTop: '4px', fontStyle: 'italic', padding: '6px 10px', background: 'var(--ims-bg-card-2)'}}>"{h.note}"</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Review actions (only Setujui & Klarifikasi - NO Tolak per Bapak instructions) */}
        {canReview && (
          <div style={{padding: '14px', background: 'var(--ims-gold-bg)', border: '1px solid var(--ims-accent)', borderLeft: '3px solid var(--ims-accent)', marginBottom: '12px'}}>
            <div style={{fontSize: '11px', letterSpacing: '0.15em', color: '#5a4a1a', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{canReviewFinance ? t.bt_review_finance : canReviewMops ? t.bt_review_mops : t.bt_review_gm}</div>
            <Field label={t.bt_review_notes} full><textarea rows={2} value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder={lang === 'id' ? 'Catatan review (opsional untuk approve, wajib untuk klarifikasi)' : 'Review notes (optional for approve, required for clarification)'} /></Field>
            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px'}}>
              <button onClick={() => onAction('approve', reviewNote)} style={{background: 'var(--ims-accent-2)', color: '#fff', border: 'none', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, letterSpacing: '0.05em'}}>✓ {t.bt_action_approve}</button>
              <button onClick={() => { if (!reviewNote.trim()) { showToast(lang === 'id' ? 'Mohon isi catatan klarifikasi.' : 'Please provide clarification note.', 'warning'); return; } onAction('clarify', reviewNote); }} style={{background: 'var(--ims-gold-dim)', color: '#fff', border: 'none', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, letterSpacing: '0.05em'}}>⚠ {t.bt_action_clarify}</button>
            </div>
          </div>
        )}

        {/* Settle action (Finance only, when approved & has difference) */}
        {canSettle && (
          <div style={{padding: '14px', background: 'var(--ims-accent-2)15', border: '1px solid var(--ims-accent-2)', borderLeft: '3px solid var(--ims-accent-2)', marginBottom: '12px'}}>
            <div style={{fontSize: '12px', color: '#1a4d2a', marginBottom: '8px'}}>{realization.difference > 0
              ? (lang === 'id' ? `Realisasi disetujui. Karyawan harus kembalikan kelebihan ${fmt(Math.abs(realization.difference))}.` : `Realization approved. Employee must return excess of ${fmt(Math.abs(realization.difference))}.`)
              : (lang === 'id' ? `Realisasi disetujui. Kantor reimburse kekurangan ${fmt(Math.abs(realization.difference))}.` : `Realization approved. Office to reimburse ${fmt(Math.abs(realization.difference))}.`)}</div>
            <button onClick={onSettle} style={{background: 'var(--ims-accent-2)', color: '#fff', border: 'none', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, letterSpacing: '0.05em'}}>💸 {t.btr_settle_now}</button>
          </div>
        )}

        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px', borderTop: '1px solid var(--ims-border)', paddingTop: '14px'}}>
          <button className="btn-ghost" onClick={onClose}>{lang === 'id' ? 'Tutup' : 'Close'}</button>
        </div>
      </div>
    </div>
  );
}
function BusinessTripDashboard({ businessTrips, realizations, employees, t, lang, session, canManageAll, fmt }) {
  const [yearFilter, setYearFilter] = useState('2026');
  const [travelerFilter, setTravelerFilter] = useState('all');

  // Filter trips by user permission
  const visibleTrips = useMemo(() => {
    let arr = businessTrips;
    if (!canManageAll) arr = arr.filter(t => t.travelerUsername === session.username);
    return arr;
  }, [businessTrips, canManageAll, session.username]);

  // Years available
  const years = useMemo(() => {
    const yrs = new Set();
    visibleTrips.forEach(t => { if (t.dateStart) yrs.add(t.dateStart.substring(0, 4)); });
    return ['all', ...Array.from(yrs).sort()];
  }, [visibleTrips]);

  // Travelers list
  const travelers = useMemo(() => {
    const arr = [...new Set(visibleTrips.map(t => t.travelerUsername))];
    return arr.map(un => ({ un, name: resolveEmpName(employees, un) }));
  }, [visibleTrips, employees]);

  // Apply filters
  const filtered = useMemo(() => {
    return visibleTrips.filter(t => {
      if (yearFilter !== 'all' && !t.dateStart.startsWith(yearFilter)) return false;
      if (travelerFilter !== 'all' && t.travelerUsername !== travelerFilter) return false;
      // Only count approved/paid/completed (no rejected, no draft)
      return ['approved', 'in_progress', 'completed', 'paid'].includes(t.status) ||
        (t.paymentStatus === 'paid');
    });
  }, [visibleTrips, yearFilter, travelerFilter]);

  // ============== KPIs ==============
  const stats = useMemo(() => {
    const total = filtered.reduce((s, t) => s + (t.totalAdvance || 0), 0);
    const totalOffice = filtered.reduce((s, t) => s + (t.officeBooked?.ticketPP || 0) + (t.officeBooked?.hotelTotal || 0), 0);
    const grandTotal = total + totalOffice;
    const tripCount = filtered.length;
    const avgPerTrip = tripCount > 0 ? grandTotal / tripCount : 0;
    return { total, totalOffice, grandTotal, tripCount, avgPerTrip };
  }, [filtered]);

  // ============== Monthly Trend (line chart) ==============
  const monthlyTrend = useMemo(() => {
    const monthMap = {};
    filtered.forEach(t => {
      const ym = t.dateStart.substring(0, 7);
      if (!monthMap[ym]) monthMap[ym] = { month: ym, cashAdvance: 0, officeBooked: 0, total: 0, count: 0 };
      const office = (t.officeBooked?.ticketPP || 0) + (t.officeBooked?.hotelTotal || 0);
      monthMap[ym].cashAdvance += t.totalAdvance || 0;
      monthMap[ym].officeBooked += office;
      monthMap[ym].total += (t.totalAdvance || 0) + office;
      monthMap[ym].count++;
    });
    return Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month)).map(m => ({
      ...m,
      label: m.month.substring(5) + '/' + m.month.substring(2, 4),
    }));
  }, [filtered]);

  // ============== YoY Comparison (2025 vs 2026) ==============
  const yoyData = useMemo(() => {
    if (yearFilter !== 'all') return null;
    const yearMap = {};
    filtered.forEach(t => {
      const y = t.dateStart.substring(0, 4);
      const m = parseInt(t.dateStart.substring(5, 7));
      if (!yearMap[y]) yearMap[y] = Array(12).fill(0);
      yearMap[y][m - 1] += (t.totalAdvance || 0) + (t.officeBooked?.ticketPP || 0) + (t.officeBooked?.hotelTotal || 0);
    });
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m, i) => ({
      month: m,
      '2025': yearMap['2025']?.[i] || 0,
      '2026': yearMap['2026']?.[i] || 0,
    }));
  }, [filtered, yearFilter]);

  // ============== By Traveler (bar chart) ==============
  const byTraveler = useMemo(() => {
    const map = {};
    filtered.forEach(t => {
      if (!map[t.travelerUsername]) {
        const liveName = resolveEmpName(employees, t.travelerUsername || t.travelerName);
        map[t.travelerUsername] = { name: liveName.split(' ')[0], full: liveName, position: t.position, count: 0, total: 0 };
      }
      map[t.travelerUsername].count++;
      map[t.travelerUsername].total += (t.totalAdvance || 0) + (t.officeBooked?.ticketPP || 0) + (t.officeBooked?.hotelTotal || 0);
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filtered]);

  // ============== By Cost Component (pie chart) ==============
  const byComponent = useMemo(() => {
    const totals = {
      taxiHome: 0, taxiArrival: 0, taxiRs: 0, localTransport: 0,
      meals: 0, other: 0, allowance: 0, ticket: 0, hotel: 0,
    };
    filtered.forEach(t => {
      totals.taxiHome += t.costs?.taxiHome || 0;
      totals.taxiArrival += t.costs?.taxiArrival || 0;
      totals.taxiRs += t.costs?.taxiRs || 0;
      totals.localTransport += t.costs?.localTransport || 0;
      totals.meals += t.costs?.meals || 0;
      totals.other += t.costs?.other || 0;
      totals.allowance += t.costs?.allowanceTotal || 0;
      totals.ticket += t.officeBooked?.ticketPP || 0;
      totals.hotel += t.officeBooked?.hotelTotal || 0;
    });
    const data = [
      { name: lang === 'id' ? 'Tunjangan' : 'Allowance', value: totals.allowance, color: '#1a4d8a' },
      { name: lang === 'id' ? 'Tiket Pesawat' : 'Flight Tickets', value: totals.ticket, color: '#5b87b8' },
      { name: lang === 'id' ? 'Hotel' : 'Hotel', value: totals.hotel, color: 'var(--ims-accent)' },
      { name: lang === 'id' ? 'Makan' : 'Meals', value: totals.meals, color: 'var(--ims-gold-dim)' },
      { name: lang === 'id' ? 'Transport Lokal' : 'Local Transport', value: totals.localTransport, color: '#5a8a5a' },
      { name: 'Taksi (RS/Hotel)', value: totals.taxiRs + totals.taxiArrival + totals.taxiHome, color: '#7d9cc5' },
      { name: lang === 'id' ? 'Lain-lain' : 'Other', value: totals.other, color: '#94a3b8' },
    ].filter(d => d.value > 0).sort((a, b) => b.value - a.value);
    return data;
  }, [filtered, lang]);

  // ============== By Destination (top 10) ==============
  const byDestination = useMemo(() => {
    const map = {};
    filtered.forEach(t => {
      const city = t.destinationCity || t.destination || 'Unknown';
      if (!map[city]) map[city] = { city, count: 0, total: 0 };
      map[city].count++;
      map[city].total += (t.totalAdvance || 0) + (t.officeBooked?.ticketPP || 0) + (t.officeBooked?.hotelTotal || 0);
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [filtered]);

  // ============== Settlement summary ==============
  const settlementStats = useMemo(() => {
    const visibleReals = canManageAll ? realizations : realizations.filter(r => r.travelerUsername === session.username);
    const filtered = visibleReals.filter(r => {
      if (yearFilter !== 'all' && !r.dateStart.startsWith(yearFilter)) return false;
      if (travelerFilter !== 'all' && r.travelerUsername !== travelerFilter) return false;
      return r.status === 'approved';
    });
    const overadvance = filtered.filter(r => r.difference > 0);
    const underadvance = filtered.filter(r => r.difference < 0);
    return {
      totalRealizations: filtered.length,
      totalOveradvance: overadvance.reduce((s, r) => s + Math.abs(r.difference), 0),
      totalUnderadvance: underadvance.reduce((s, r) => s + Math.abs(r.difference), 0),
      overadvanceCount: overadvance.length,
      underadvanceCount: underadvance.length,
    };
  }, [realizations, canManageAll, session.username, yearFilter, travelerFilter]);

  // PERFORMANCE & LANG: Use parent fmt() prop which auto-converts to USD when lang='en'
  const fmtRp = fmt;
  const fmtRpShort = fmt;

  return (
    <div>
      {/* Filters */}
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', padding: '14px 16px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <span style={{fontSize: '10px', letterSpacing: '0.1em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Tahun' : 'Year'}:</span>
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} style={{padding: '5px 8px', fontSize: '12px', fontFamily: 'inherit', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', color: 'var(--ims-text)', cursor: 'pointer'}}>
            {years.map(y => <option key={y} value={y}>{y === 'all' ? (lang === 'id' ? 'Semua Tahun' : 'All Years') : y}</option>)}
          </select>
        </div>
        {canManageAll && (
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{fontSize: '10px', letterSpacing: '0.1em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Karyawan' : 'Employee'}:</span>
            <select value={travelerFilter} onChange={e => setTravelerFilter(e.target.value)} style={{padding: '5px 8px', fontSize: '12px', fontFamily: 'inherit', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', color: 'var(--ims-text)', cursor: 'pointer'}}>
              <option value="all">{lang === 'id' ? 'Semua' : 'All'}</option>
              {travelers.map(tr => <option key={tr.un} value={tr.un}>{tr.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* KPI Strip */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-alt)', color: '#fff'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-accent)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Total Operasional' : 'Total Operational'}</div>
          <div className="serif mono" style={{fontSize: '20px', fontWeight: 500, marginTop: '4px', color: '#fff'}}>{fmtRpShort(stats.grandTotal)}</div>
          <div style={{fontSize: '9px', color: 'rgba(255,255,255,0.6)', marginTop: '2px'}}>{lang === 'id' ? 'Cash + Office' : 'Cash + Office'}</div>
        </div>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Uang Muka' : 'Cash Advance'}</div>
          <div className="serif mono" style={{fontSize: '20px', fontWeight: 500, marginTop: '4px'}}>{fmtRpShort(stats.total)}</div>
          <div style={{fontSize: '9px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'transfer ke karyawan' : 'transferred to employees'}</div>
        </div>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Tiket + Hotel' : 'Tickets + Hotels'}</div>
          <div className="serif mono" style={{fontSize: '20px', fontWeight: 500, marginTop: '4px'}}>{fmtRpShort(stats.totalOffice)}</div>
          <div style={{fontSize: '9px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'pemesanan kantor' : 'office-booked'}</div>
        </div>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div style={{fontSize: '9px', letterSpacing: '0.2em', color: 'var(--ims-text-2)', textTransform: 'uppercase'}}>{lang === 'id' ? 'Jumlah Trip' : 'Trip Count'}</div>
          <div className="serif" style={{fontSize: '22px', fontWeight: 500, marginTop: '4px'}}>{stats.tripCount}</div>
          <div style={{fontSize: '9px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'rata-rata' : 'avg'}: {fmtRpShort(stats.avgPerTrip)}</div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', padding: '18px 20px', marginBottom: '22px'}}>
        <div className="serif" style={{fontSize: '17px', fontWeight: 500, marginBottom: '4px'}}>{lang === 'id' ? 'Tren Bulanan Biaya Perjalanan Dinas' : 'Monthly Business Trip Cost Trend'}</div>
        <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginBottom: '14px'}}>{lang === 'id' ? 'Cash Advance + Tiket + Hotel per bulan' : 'Cash Advance + Tickets + Hotel per month'}</div>
        {monthlyTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" />
              <XAxis dataKey="label" stroke="var(--ims-text-2)" style={{fontSize: 10}} />
              <YAxis stroke="var(--ims-text-2)" style={{fontSize: 10}} tickFormatter={v => v >= 1e9 ? `${(v/1e9).toFixed(1)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v >= 1e3 ? `${(v/1e3).toFixed(0)}rb` : v} />
              <Tooltip formatter={(v, name) => [fmtRp(v), name]} labelStyle={{color: 'var(--ims-text)', fontSize: 11}} contentStyle={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', fontSize: 11}} />
              <Legend wrapperStyle={{fontSize: 11}} />
              <Bar dataKey="cashAdvance" name={lang === 'id' ? 'Uang Muka' : 'Cash Advance'} fill="#1a4d8a" stackId="a" />
              <Bar dataKey="officeBooked" name={lang === 'id' ? 'Tiket + Hotel' : 'Office-Booked'} fill="var(--ims-accent)" stackId="a" />
              <Area type="monotone" dataKey="total" name={lang === 'id' ? 'Total' : 'Total'} fill="transparent" stroke="#c03030" strokeWidth={2} dot={{ r: 3, fill: '#c03030' }} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div style={{padding: '40px', textAlign: 'center', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{lang === 'id' ? 'Tidak ada data untuk filter ini.' : 'No data for this filter.'}</div>
        )}
      </div>

      {/* YoY Comparison (only when "all years" selected) */}
      {yearFilter === 'all' && yoyData && (
        <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', padding: '18px 20px', marginBottom: '22px'}}>
          <div className="serif" style={{fontSize: '17px', fontWeight: 500, marginBottom: '4px'}}>{lang === 'id' ? 'Perbandingan Tahun-ke-Tahun (YoY)' : 'Year-over-Year Comparison'}</div>
          <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginBottom: '14px'}}>{lang === 'id' ? 'Total biaya per bulan: 2025 vs 2026' : 'Monthly total: 2025 vs 2026'}</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={yoyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" />
              <XAxis dataKey="month" stroke="var(--ims-text-2)" style={{fontSize: 10}} />
              <YAxis stroke="var(--ims-text-2)" style={{fontSize: 10}} tickFormatter={v => v >= 1e9 ? `${(v/1e9).toFixed(1)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v >= 1e3 ? `${(v/1e3).toFixed(0)}rb` : v} />
              <Tooltip formatter={(v, name) => [fmtRp(v), name]} labelStyle={{color: 'var(--ims-text)', fontSize: 11}} contentStyle={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', fontSize: 11}} />
              <Legend wrapperStyle={{fontSize: 11}} />
              <Bar dataKey="2025" fill="var(--ims-text-2)" />
              <Bar dataKey="2026" fill="#1a4d8a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px', marginBottom: '22px'}}>
        {/* By Cost Component */}
        <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', padding: '18px 20px'}}>
          <div className="serif" style={{fontSize: '17px', fontWeight: 500, marginBottom: '4px'}}>{lang === 'id' ? 'Breakdown per Komponen Biaya' : 'Cost Component Breakdown'}</div>
          <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginBottom: '14px'}}>{lang === 'id' ? 'Distribusi total biaya per kategori' : 'Total cost distribution by category'}</div>
          {byComponent.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={byComponent} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false} style={{fontSize: 10}}>
                  {byComponent.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, name) => [fmtRp(v), name]} contentStyle={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', fontSize: 11}} />
                <Legend wrapperStyle={{fontSize: 10}} layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{padding: '40px', textAlign: 'center', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>{lang === 'id' ? 'Tidak ada data.' : 'No data.'}</div>}
        </div>

        {/* By Traveler */}
        {canManageAll && (
          <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', padding: '18px 20px'}}>
            <div className="serif" style={{fontSize: '17px', fontWeight: 500, marginBottom: '4px'}}>{lang === 'id' ? 'Top Karyawan (per Total Biaya)' : 'Top Travelers (by Total Cost)'}</div>
            <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginBottom: '14px'}}>{lang === 'id' ? 'Karyawan dengan biaya operasional perjalanan tertinggi' : 'Highest business trip cost employees'}</div>
            <ResponsiveContainer width="100%" height={Math.max(200, byTraveler.length * 32)}>
              <BarChart data={byTraveler} layout="vertical" margin={{left: 60}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" />
                <XAxis type="number" stroke="var(--ims-text-2)" style={{fontSize: 10}} tickFormatter={v => v >= 1e9 ? `${(v/1e9).toFixed(1)}M` : v >= 1e6 ? `${(v/1e6).toFixed(0)}Jt` : v >= 1e3 ? `${(v/1e3).toFixed(0)}rb` : v} />
                <YAxis type="category" dataKey="name" stroke="var(--ims-text-2)" style={{fontSize: 10}} width={60} />
                <Tooltip formatter={(v, name, item) => [fmtRp(v) + ` (${item.payload.count} trips)`, item.payload.full]} contentStyle={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', fontSize: 11}} />
                <Bar dataKey="total" fill="#1a4d8a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* By Destination */}
      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', padding: '18px 20px', marginBottom: '22px'}}>
        <div className="serif" style={{fontSize: '17px', fontWeight: 500, marginBottom: '4px'}}>{lang === 'id' ? 'Top 10 Tujuan Perjalanan' : 'Top 10 Travel Destinations'}</div>
        <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginBottom: '14px'}}>{lang === 'id' ? 'Kota tujuan dengan total biaya tertinggi' : 'Destination cities by total cost'}</div>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px'}}>
          <thead>
            <tr style={{background: 'var(--ims-bg)'}}>
              <Th>#</Th>
              <Th>{lang === 'id' ? 'Kota' : 'City'}</Th>
              <Th align="right">{lang === 'id' ? 'Jumlah Trip' : 'Trip Count'}</Th>
              <Th align="right">{lang === 'id' ? 'Total Biaya' : 'Total Cost'}</Th>
              <Th align="right">{lang === 'id' ? 'Rata-rata' : 'Average'}</Th>
            </tr>
          </thead>
          <tbody>
            {byDestination.map((d, i) => (
              <tr key={d.city} style={{borderTop: '1px solid var(--ims-border)'}}>
                <Td><span style={{fontSize: '10px', color: 'var(--ims-text-2)', fontWeight: 600}}>{i + 1}</span></Td>
                <Td><strong>{d.city}</strong></Td>
                <Td align="right">{d.count}</Td>
                <Td align="right"><span className="mono">{fmtRp(d.total)}</span></Td>
                <Td align="right"><span className="mono" style={{color: 'var(--ims-text-2)'}}>{fmtRp(Math.round(d.total / d.count))}</span></Td>
              </tr>
            ))}
            {byDestination.length === 0 && <tr><td colSpan="5" style={{padding: '20px', textAlign: 'center', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Tidak ada data.' : 'No data.'}</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Settlement Summary */}
      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', padding: '18px 20px', marginBottom: '22px'}}>
        <div className="serif" style={{fontSize: '17px', fontWeight: 500, marginBottom: '4px'}}>{lang === 'id' ? 'Rekap Selisih Realisasi' : 'Realization Settlement Summary'}</div>
        <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginBottom: '14px'}}>{lang === 'id' ? 'Dari realisasi yang sudah disetujui' : 'From approved realizations'}</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px'}}>
          <div style={{padding: '14px', border: '1px solid var(--ims-border)', borderLeft: '3px solid #5b87b8'}}>
            <div style={{fontSize: '10px', letterSpacing: '0.15em', color: '#5b87b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px'}}>{lang === 'id' ? 'Total Realisasi Disetujui' : 'Approved Realizations'}</div>
            <div className="serif" style={{fontSize: '20px', fontWeight: 500}}>{settlementStats.totalRealizations}</div>
          </div>
          <div style={{padding: '14px', border: '1px solid var(--ims-border)', borderLeft: '3px solid var(--ims-gold-dim)'}}>
            <div style={{fontSize: '10px', letterSpacing: '0.15em', color: 'var(--ims-gold-dim)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px'}}>{lang === 'id' ? 'Kelebihan (dikembalikan karyawan)' : 'Excess (returned by employee)'}</div>
            <div className="serif mono" style={{fontSize: '18px', fontWeight: 500, color: 'var(--ims-gold-dim)'}}>{fmtRpShort(settlementStats.totalOveradvance)}</div>
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{settlementStats.overadvanceCount} {lang === 'id' ? 'realisasi' : 'realizations'}</div>
          </div>
          <div style={{padding: '14px', border: '1px solid var(--ims-border)', borderLeft: '3px solid #c03030'}}>
            <div style={{fontSize: '10px', letterSpacing: '0.15em', color: '#c03030', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px'}}>{lang === 'id' ? 'Kekurangan (kantor reimburse)' : 'Shortfall (office reimburse)'}</div>
            <div className="serif mono" style={{fontSize: '18px', fontWeight: 500, color: '#c03030'}}>{fmtRpShort(settlementStats.totalUnderadvance)}</div>
            <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{settlementStats.underadvanceCount} {lang === 'id' ? 'realisasi' : 'realizations'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { BusinessTripModule, BusinessTripCard, BusinessTripForm, BusinessTripDetail, BusinessTripRealizationCard, BusinessTripRealizationForm, BusinessTripRealizationDetail, BusinessTripDashboard };

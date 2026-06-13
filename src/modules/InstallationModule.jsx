// Extracted from App.jsx during modular refactor.
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, Download, Edit2, FileCheck, FileText, Plus, Search, Trash2, Users, Wrench, X } from 'lucide-react';
import { ConfirmDialog, Field, LinkAttachment, ReadOnlyBanner, SortToggle } from '../components/ui.jsx';
import { DocumentEditorModal } from '../components/DocumentEditorModal.jsx';
import { DEFAULT_DOCUMENT_TEMPLATES, DOC_TYPE_LABELS } from '../constants/docs.js';
import { MODALITY_COLORS } from '../constants/sales.js';
import { buildEditorTemplate, downloadBASTBarangDoc, downloadBATrainingDoc, printBAIPdf, printBASTBarangPdf, printBATrainingPdf, printBAUjiFungsiPdf } from '../utils/documents.js';
import { notify } from '../utils/notifications.js';
import { resolveEmpName, resolveNamesInText } from '../utils/domain.js';
function InstallationModule({ data, setData, installRecords, setInstallRecords, bastRecords, setBastRecords, trainingRecords, setTrainingRecords, t, lang, canEdit, fmt, employees = {}, liveTechnicians = [], regRecords = [], products = [], documentTemplates = DEFAULT_DOCUMENT_TEMPLATES, onSaveDocument, session = {} }) {
  const [installEditor, setInstallEditor] = useState(null); // { record, docType, html, title }
  const openInstallEditor = (docType, record, label) => {
    const html = buildEditorTemplate(docType, record, employees, fmt, documentTemplates, record.salesOwner || record.requesterId);
    setInstallEditor({ record, docType, html, title: (label || DOC_TYPE_LABELS[docType] || 'Dokumen') + ' — ' + (record.customer || '') });
  };
  const [tab, setTab] = useState('records');
  // Default to current year (2026) — sync with SPH module behavior
  const [filterYear, setFilterYear] = useState('2026');
  const [search, setSearch] = useState('');
  const searchTerm = search.trim().toLowerCase();
  const matchesSearch = (...parts) => !searchTerm || parts.some(p => String(p || '').toLowerCase().includes(searchTerm));
  // Speed booster: paginate the progress card list so we never render 80+ heavy cards at once.
  const CARD_PAGE = 24;
  const [visibleCount, setVisibleCount] = useState(CARD_PAGE);
  useEffect(() => { setVisibleCount(CARD_PAGE); }, [filterYear, search, tab]);

  // Available years derived from data (PO issue years OR install-record years)
  const availableYears = useMemo(() => {
    const years = new Set();
    data.forEach(s => { if (s.issuedDate) years.add(s.issuedDate.substring(0, 4)); });
    installRecords.forEach(r => { if (r.installStart) years.add(r.installStart.substring(0, 4)); });
    bastRecords.forEach(r => { if (r.signedDate) years.add(r.signedDate.substring(0, 4)); });
    trainingRecords.forEach(r => { if (r.sessionDate) years.add(r.sessionDate.substring(0, 4)); });
    return Array.from(years).sort().reverse();
  }, [data, installRecords, bastRecords, trainingRecords]);

  // Year-filtered document sets so Riwayat / BAST / Training tabs stay consistent with the PO Year selector.
  const yearKey = (r, dateField) => r.poYear || (r[dateField] || '').substring(0, 4);
  const installRecordsY = useMemo(() => filterYear === 'all' ? installRecords : installRecords.filter(r => yearKey(r, 'installStart') === filterYear), [installRecords, filterYear]);
  const bastRecordsY = useMemo(() => filterYear === 'all' ? bastRecords : bastRecords.filter(r => yearKey(r, 'signedDate') === filterYear), [bastRecords, filterYear]);
  const trainingRecordsY = useMemo(() => filterYear === 'all' ? trainingRecords : trainingRecords.filter(r => yearKey(r, 'sessionDate') === filterYear), [trainingRecords, filterYear]);

  const installRecordsFiltered = useMemo(() => installRecordsY.filter(r => matchesSearch(r.recordNo, r.customer, r.modality, r.subModality, r.status, resolveEmpName(employees, r.leadTechnician))), [installRecordsY, searchTerm, employees]);
  const bastRecordsFiltered = useMemo(() => bastRecordsY.filter(r => matchesSearch(r.bastNo, r.customer, r.modality, r.subModality, r.status, r.hntiRep, r.customerRep, r.witness)), [bastRecordsY, searchTerm]);
  const trainingRecordsFiltered = useMemo(() => trainingRecordsY.filter(r => matchesSearch(r.certNo, r.customer, r.modality, r.subModality, r.status, r.instructor, r.topics)), [trainingRecordsY, searchTerm]);

  // Pipeline Instalasi hanya boleh berasal dari Data Instalasi yang dibuat teknisi.
  // SPH dipakai hanya sebagai metadata pendukung, bukan pemicu proyek masuk pipeline.
  const installProjects = useMemo(() => installRecordsFiltered.map(r => {
    const sph = data.find(s => s.customer === r.customer && (s.subModality || '') === (r.subModality || ''))
      || data.find(s => s.customer === r.customer && (s.modality || '') === (r.modality || ''))
      || data.find(s => s.customer === r.customer);
    return {
      ...(sph || {}),
      id: sph?.id || r.id,
      customer: r.customer,
      modality: r.modality || sph?.modality || '',
      subModality: r.subModality || sph?.subModality || '',
      product: sph?.product || r.subModality || r.modality || '',
      sphNo: sph?.sphNo || r.sphNo || r.recordNo,
      issuedDate: sph?.issuedDate || r.installStart || '',
      installationStatus: r.status === 'completed' ? 'record_completed' : 'record_in_progress',
      _installRecord: r,
    };
  }).sort((a, b) => {
    const aDone = a._installRecord?.status === 'completed' ? 1 : 0;
    const bDone = b._installRecord?.status === 'completed' ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    return (b._installRecord?.installStart || '').localeCompare(a._installRecord?.installStart || '');
  }), [installRecordsFiltered, data]);
  const installRecordUnits = useMemo(() => installRecordsFiltered.map(r => {
    const sph = data.find(s => s.customer === r.customer && (s.subModality || '') === (r.subModality || ''))
      || data.find(s => s.customer === r.customer && (s.modality || '') === (r.modality || ''))
      || data.find(s => s.customer === r.customer);
    return { id: r.id, customer: r.customer, modality: r.modality || sph?.modality || '', subModality: r.subModality || sph?.subModality || '', sphNo: sph?.sphNo || r.recordNo };
  }), [installRecordsFiltered, data]);
  const normalizeInstallPart = (value) => String(value || '').trim().toLowerCase();
  const unitKey = (r) => [r.customer, r.modality, r.subModality].map(normalizeInstallPart).join('|');
  const bastRecordsForView = useMemo(() => {
    const existing = new Set(bastRecordsFiltered.map(unitKey));
    const placeholders = installRecordsFiltered
      .filter(r => !existing.has(unitKey(r)))
      .map(r => ({
        id: `bast_pending_${r.id}`,
        bastNo: lang === 'id' ? 'BAST belum dibuat' : 'BAST not created',
        customer: r.customer,
        modality: r.modality,
        subModality: r.subModality,
        signedDate: '',
        hntiRep: resolveEmpName(employees, r.leadTechnician),
        customerRep: '',
        witness: '',
        status: 'draft',
        docUrl: '',
        notes: lang === 'id' ? 'Menunggu update BAST dari tim teknisi.' : 'Waiting for BAST update from technician team.',
        _placeholder: true,
      }));
    return [...bastRecordsFiltered, ...placeholders];
  }, [bastRecordsFiltered, installRecordsFiltered, employees, lang]);
  const trainingRecordsForView = useMemo(() => {
    const existing = new Set(trainingRecordsFiltered.map(unitKey));
    const placeholders = installRecordsFiltered
      .filter(r => !existing.has(unitKey(r)))
      .map(r => ({
        id: `train_pending_${r.id}`,
        certNo: lang === 'id' ? 'Training belum dibuat' : 'Training not created',
        customer: r.customer,
        modality: r.modality,
        subModality: r.subModality,
        sessionDate: '',
        participants: 0,
        instructor: resolveEmpName(employees, r.leadTechnician),
        duration: 0,
        topics: '',
        status: 'pending',
        certUrl: '',
        notes: lang === 'id' ? 'Menunggu update training produk.' : 'Waiting for product training update.',
        _placeholder: true,
      }));
    return [...trainingRecordsFiltered, ...placeholders];
  }, [trainingRecordsFiltered, installRecordsFiltered, employees, lang]);

  const toggleStep = (id, field) => {
    if (!canEdit) return;
    setData(prev => prev.map(s => {
      if (s.id !== id) return s;
      const nextVal = !s[field];
      const extra = {};
      if (nextVal && field === 'installation_done') {
        extra.sphWorkflowStatus = 'install_schedule_updated';
        extra.installScheduleUpdatedAt = s.installScheduleUpdatedAt || new Date().toISOString();
        extra.nextAction = 'Teknisi menyelesaikan instalasi dan update BAST';
        extra.functionTest = true;
      }
      if (nextVal && field === 'bastDone') {
        extra.bastDone = true;
        extra.installationStatus = 'installed';
        extra.sphWorkflowStatus = 'installed_bast';
        extra.bastDate = s.bastDate || new Date().toISOString().split('T')[0];
        extra.regulatoryNotifiedAt = s.regulatoryNotifiedAt || new Date().toISOString();
        extra.nextAction = 'Regulatory proses izin pemanfaatan';
      }
      return { ...s, [field]: nextVal, ...extra };
    }));
    if (field === 'bastDone') {
      notify({ role: 'regulatory' }, { type: 'system', message: 'Instalasi dan BAST telah selesai. Regulatory dapat memulai izin pemanfaatan.', link: { view: 'regulatory', id } });
    }
  };
  const toggleInstallPipelineStep = (project, field) => {
    if (!canEdit) return;
    if (['exposureTest', 'complianceTest'].includes(field) && project?._installRecord?.id) {
      setInstallRecords(prev => prev.map(r => r.id === project._installRecord.id ? { ...r, [field]: !r[field] } : r));
      return;
    }
    toggleStep(project.id, field);
  };
  const updateEvidence = (id, field, url) => { if (!canEdit) return; setData(prev => prev.map(s => s.id === id ? { ...s, [field]: url } : s)); };

  // CROSS-TAB SYNC: pipeline status must match the exact installed unit,
  // not only the customer name. One RS can have multiple projects/products.
  const recordsByUnit = useMemo(() => {
    const map = new Map();
    installRecords.forEach(r => map.set(unitKey(r), r));
    return map;
  }, [installRecords]);
  const bastByUnit = useMemo(() => {
    const map = new Map();
    bastRecords.forEach(b => map.set(unitKey(b), b));
    return map;
  }, [bastRecords]);
  const trainingByUnit = useMemo(() => {
    const map = new Map();
    trainingRecords.forEach(tr => map.set(unitKey(tr), tr));
    return map;
  }, [trainingRecords]);
  const isProductDelivered = (s) => (
    s.shippingStatus === 'delivered'
    || s.shippingStatus === 'client_received'
    || s.localDeliveryStatus === 'delivered_to_rs'
    || s.sphWorkflowStatus === 'goods_received_client'
    || !!s.clientReceivedAt
    || s.goodsDeliveryStatus === 'delivered'
    || s.deliveryStatus === 'delivered'
  );
  const isBastDoneForSph = (s) => {
    const bast = bastByUnit.get(unitKey(s));
    return !!s.bastDone || !!s.bastDate || s.installationStatus === 'installed' || bast?.status === 'signed';
  };

  // SPH untuk form Data Instalasi: hanya produk yang sudah terkirim ke RS, lalu hilang setelah BAST selesai.
  const deliveredUnits = useMemo(() => data
    .filter(s => s.poStatus === 'issued' && isProductDelivered(s) && !isBastDoneForSph(s))
    .map(s => ({ id: s.id, customer: s.customer, modality: s.modality, subModality: s.subModality || '', sphNo: s.sphNo }))
    .sort((a, b) => a.customer.localeCompare(b.customer)), [data, bastByUnit]);

  // BAPETEN Utilization Permit linkage (review #3): a unit's "Izin BAPETEN" step turns green
  // automatically once the matching Izin Pemanfaatan BAPETEN record (regulatory) reaches "issued".
  const bapetenIssuedByCustomer = useMemo(() => {
    const map = new Map();
    (regRecords || []).forEach(r => {
      const issued = r.stage === 'issued' || !!r.issuedDate;
      if (issued && r.customer) map.set(r.customer, r);
    });
    return map;
  }, [regRecords]);

  // Derive effective step status for a PO project (auto-synced from other tabs)
  const getStepStatus = (p) => {
    const rec = p._installRecord || recordsByUnit.get(unitKey(p));
    const exactKey = unitKey(rec || p);
    const bast = bastByUnit.get(exactKey);
    const training = trainingByUnit.get(exactKey);
    const bapetenRec = bapetenIssuedByCustomer.get(p.customer);
    const installationComplete = !!(rec && rec.status === 'completed');
    const functionComplete = installationComplete || !!(rec && rec.calibrationDone);
    return {
      installation_done: installationComplete,
      functionTest: functionComplete,
      exposureTest: !!(rec && rec.exposureTest),
      complianceTest: !!(rec && rec.complianceTest),
      trainingCert: !!(training && training.status === 'completed'),
      bapetenPermit: !!bapetenRec,
      bast: !!(bast && (bast.status === 'signed' || !!bast.signedDate)),
      _rec: rec, _bast: bast, _training: training, _bapeten: bapetenRec,
    };
  };

  // Tahap 11 Phase 1.5: dynamic installSteps per modality
  // - Hapus 'bapetenPermit' (catatan #4: bukan domain teknisi)
  // - Skip 'exposureTest' + 'complianceTest' untuk Flat Panel Detector, MRI, ESWL (catatan #5)
  const SKIP_RADIATION_TEST_PRODUCTS = ['Flat Panel Detector', 'MRI', 'ESWL'];
  const getInstallStepsForProduct = (productOrModality) => {
    const norm = String(productOrModality || '').toLowerCase();
    const skipRadiation = SKIP_RADIATION_TEST_PRODUCTS.some(p => norm.includes(p.toLowerCase()));
    const steps = [
      { id: 'installation_done', label: t.installation_done, icon: Wrench, syncSrc: 'record', manual: false },
      { id: 'functionTest', label: t.function_test, icon: CheckCircle2, syncSrc: 'record', manual: false },
    ];
    if (!skipRadiation) {
      steps.push({ id: 'exposureTest', label: t.exposure_test, icon: CheckCircle2, syncSrc: null, manual: true });
      steps.push({ id: 'complianceTest', label: t.compliance_test, icon: CheckCircle2, syncSrc: null, manual: true });
    }
    steps.push({ id: 'trainingCert', label: t.training_cert, icon: FileCheck, syncSrc: 'training', manual: false });
    steps.push({ id: 'bast', label: t.inst_step_bast, icon: FileCheck, syncSrc: 'bast', manual: false });
    // 'bapetenPermit' tidak dipakai di Progress Instalasi (per catatan #4 Pak Fajrin)
    return steps;
  };
  // Backward compat fallback (default tanpa product filter — pakai semua step kecuali bapetenPermit)
  const installSteps = useMemo(() => getInstallStepsForProduct(''), [t]);

  // PERFORMANCE: KPI calculations memoized — now scoped to the YEAR-FILTERED installProjects
  // so the dashboard numbers + record list stay consistent with the PO Year selector.
  const kpis = useMemo(() => {
    const inProg = installRecordsFiltered.filter(r => r.status !== 'completed').length;
    const comp = installRecordsFiltered.filter(r => r.status === 'completed').length;
    const bastS = bastRecordsFiltered.filter(r => r.status === 'signed' || !!r.signedDate).length;
    const trainD = trainingRecordsFiltered.filter(r => r.status === 'completed').length;
    return { totalRecords: installRecordsFiltered.length, inProgressCount: inProg, completedCount: comp, bastSignedCount: bastS, trainingDoneCount: trainD };
  }, [installRecordsFiltered, bastRecordsFiltered, trainingRecordsFiltered]);
  const { totalRecords, inProgressCount, completedCount, bastSignedCount, trainingDoneCount } = kpis;

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_installation}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.installation_title}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.installation_subtitle}</div>
      </div>
      {!canEdit && <ReadOnlyBanner t={t} />}

      {/* KPI Cards */}
      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div className="lbl-tag">{t.inst_total_records}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '4px'}}>{totalRecords}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? `data instalasi${filterYear !== 'all' ? ` ${filterYear}` : ''}${searchTerm ? ' sesuai pencarian' : ''}` : `installation data${filterYear !== 'all' ? ` ${filterYear}` : ''}${searchTerm ? ' matching search' : ''}`}</div>
        </div>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div className="lbl-tag">{t.inst_in_progress}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent)'}}>{inProgressCount}</div>
        </div>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div className="lbl-tag">{t.inst_completed_count}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent-2)'}}>{completedCount}</div>
        </div>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div className="lbl-tag">{t.inst_bast_signed}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '4px', color: '#1a4d8a'}}>{bastSignedCount}</div>
        </div>
        <div style={{padding: '16px 18px', background: 'var(--ims-bg-card)'}}>
          <div className="lbl-tag">{t.inst_training_done}</div>
          <div className="serif" style={{fontSize: '24px', fontWeight: 500, marginTop: '4px', color: '#7b3fb5'}}>{trainingDoneCount}</div>
        </div>
      </div>

      {/* Year filter + search bar */}
      <div style={{display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center', flexWrap: 'wrap'}}>
        <div style={{position: 'relative', flex: '1 1 260px', maxWidth: '380px'}}>
          <Search size={14} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ims-text-2)'}} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === 'id' ? 'Cari pelanggan, SPH, atau modalitas...' : 'Search customer, SPH, or modality...'} style={{paddingLeft: '36px'}} />
        </div>
        <span style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{lang === 'id' ? 'Tahun PO' : 'PO Year'}:</span>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{width: 'auto', minWidth: '110px'}}>
          <option value="all">{lang === 'id' ? 'Semua Tahun' : 'All Years'}</option>
          {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span style={{fontSize: '11px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>
          {lang === 'id'
            ? `${totalRecords} data instalasi${filterYear !== 'all' ? ` di ${filterYear}` : ''} · ${inProgressCount} sedang berlangsung · ${installProjects.length} proyek di pipeline`
            : `${totalRecords} installation records${filterYear !== 'all' ? ` in ${filterYear}` : ''} · ${inProgressCount} in progress · ${installProjects.length} projects in pipeline`}
        </span>
      </div>

      {/* Tabs */}
      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {[
          { id: 'records', label: t.inst_tab_records, icon: ClipboardList },
          { id: 'training', label: t.inst_tab_training, icon: Users },
          { id: 'bast', label: t.inst_tab_bast, icon: FileCheck },
          { id: 'progress', label: t.inst_tab_progress, icon: Wrench },
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

      {tab === 'progress' && (
        <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
          <div style={{padding: '10px 14px', background: 'var(--ims-accent-2)10', borderLeft: '3px solid var(--ims-accent-2)', fontSize: '11px', color: '#1a4d2a'}}>
            🔗 {t.inst_prog_auto_synced}
          </div>
          {installProjects.slice(0, visibleCount).map(p => {
            const ss = getStepStatus(p);
            const rec = ss._rec;
            const recCompleted = rec?.status === 'completed';
            return (
            <div key={p.id} style={{padding: '18px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '10px'}}>
                <div>
                  <div style={{fontSize: '14px', fontWeight: 600}}>{p.customer}</div>
                  <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{p.subModality} · <span className="mono">{p.sphNo}</span></div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'}}>
                  <span style={{padding: '3px 9px', borderRadius: '10px', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: recCompleted ? 'var(--ims-accent-2)' : 'var(--ims-gold)', color: '#fff'}}>{recCompleted ? (lang === 'id' ? 'Instalasi Selesai' : 'Installation Done') : (lang === 'id' ? 'Sedang Proses' : 'In Progress')}</span>
                </div>
              </div>

              {/* Work dates from install record */}
              <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '12px', padding: '10px 12px', background: 'var(--ims-bg)', fontSize: '11px'}}>
                <div>
                  <span style={{color: 'var(--ims-text-2)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '9px', fontWeight: 600}}>{t.inst_prog_start}: </span>
                  <span className="mono" style={{color: 'var(--ims-text)', fontWeight: 600}}>{rec?.installStart || '—'}</span>
                </div>
                <div>
                  <span style={{color: 'var(--ims-text-2)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '9px', fontWeight: 600}}>{t.inst_prog_end}: </span>
                  <span className="mono" style={{color: 'var(--ims-text)', fontWeight: 600}}>{rec?.installEnd || (recCompleted ? (lang === 'id' ? 'Selesai' : 'Done') : (lang === 'id' ? 'Sedang berjalan' : 'In progress'))}</span>
                </div>
                {rec?.leadTechnician && <div><span style={{color: 'var(--ims-text-2)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '9px', fontWeight: 600}}>{lang === 'id' ? 'Teknisi' : 'Technician'}: </span><span style={{color: 'var(--ims-text)'}}>{resolveEmpName(employees, rec.leadTechnician)}</span></div>}
              </div>

              {/* Step buttons - auto-synced where applicable */}
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '8px', marginBottom: '12px'}}>
                {getInstallStepsForProduct(`${p.modality || ''} ${p.product || ''} ${p.subModality || ''}`).map(step => {
                  const Icon = step.icon;
                  const done = ss[step.id];
                  const manual = step.manual === true;
                  const isSynced = step.syncSrc && (
                    (step.syncSrc === 'record' && rec) ||
                    (step.syncSrc === 'bast' && ss._bast) ||
                    (step.syncSrc === 'training' && ss._training) ||
                    (step.syncSrc === 'bapeten' && ss._bapeten)
                  );
                  return (
                    <button key={step.id} onClick={() => { if (manual) toggleInstallPipelineStep(p, step.id); }} disabled={!canEdit || !manual} title={manual ? '' : t.inst_prog_auto_synced} style={{padding: '11px', fontSize: '10.5px', fontFamily: 'inherit', background: done ? 'var(--ims-accent-2)' : 'transparent', color: done ? '#fff' : 'var(--ims-text-2)', border: `1px solid ${done ? 'var(--ims-accent-2)' : 'var(--ims-border)'}`, cursor: canEdit && manual ? 'pointer' : 'default', opacity: !manual && !done ? 0.78 : 1, fontWeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', textAlign: 'center', position: 'relative'}}>
                      <Icon size={16} strokeWidth={1.5} />{step.label}
                      {done && <span style={{fontSize: '8px', letterSpacing: '0.1em'}}>✓ {isSynced || !manual ? 'AUTO' : 'DONE'}</span>}
                    </button>
                  );
                })}
              </div>

              {/* Evidence links (photo/video documentation) */}
              <div style={{padding: '10px 12px', background: 'var(--ims-bg)', border: '1px solid var(--ims-border)'}}>
                <div style={{fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '8px'}}>{t.inst_prog_evidence}</div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px'}}>
                  {[
                    { field: 'evidenceInstall', label: lang === 'id' ? 'Foto/Video Instalasi' : 'Installation Photo/Video' },
                    { field: 'evidenceTest', label: lang === 'id' ? 'Foto/Video Uji Fungsi' : 'Function Test Photo/Video' },
                  ].map(ev => (
                    <div key={ev.field}>
                      {canEdit ? (
                        <div>
                          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginBottom: '3px'}}>{ev.label}</div>
                          <input value={p[ev.field] || ''} onChange={e => updateEvidence(p.id, ev.field, e.target.value)} placeholder="https://drive.google.com/..." style={{fontSize: '11px', padding: '5px 8px'}} />
                        </div>
                      ) : (
                        <div>
                          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginBottom: '3px'}}>{ev.label}</div>
                          {p[ev.field] ? <LinkAttachment url={p[ev.field]} lang={lang} /> : <span style={{fontSize: '10px', color: 'var(--ims-text-2)', fontStyle: 'italic'}}>—</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            );
          })}
          {installProjects.length > visibleCount && (
            <button onClick={() => setVisibleCount(v => v + CARD_PAGE)} style={{width: '100%', padding: '12px', background: 'var(--ims-bg-card)', border: '1px dashed var(--ims-gold)', color: '#8a6a2a', fontFamily: 'inherit', fontSize: '12px', fontWeight: 600, cursor: 'pointer', borderRadius: '4px'}}>
              {lang === 'id' ? `Tampilkan ${Math.min(CARD_PAGE, installProjects.length - visibleCount)} lainnya (${visibleCount} dari ${installProjects.length})` : `Show ${Math.min(CARD_PAGE, installProjects.length - visibleCount)} more (${visibleCount} of ${installProjects.length})`}
            </button>
          )}
          {installProjects.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: 'var(--ims-text-2)', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>{t.no_data}</div>}
        </div>
      )}

      {tab === 'records' && <InstallRecordsList records={installRecordsFiltered} setRecords={setInstallRecords} t={t} lang={lang} canEdit={canEdit} employees={employees} units={deliveredUnits} products={products} fmt={fmt} documentTemplates={documentTemplates} onOpenEditor={openInstallEditor} />}
      {tab === 'bast' && <BASTList products={products} records={bastRecordsForView} setRecords={setBastRecords} t={t} lang={lang} canEdit={canEdit} units={installRecordUnits} installRecords={installRecords} employees={employees} documentTemplates={documentTemplates} fmt={fmt} onOpenEditor={openInstallEditor} />}
      {tab === 'training' && <TrainingCertList records={trainingRecordsForView} setRecords={setTrainingRecords} t={t} lang={lang} canEdit={canEdit} employees={employees} units={installRecordUnits} installRecords={installRecords} products={products} documentTemplates={documentTemplates} fmt={fmt} onOpenEditor={openInstallEditor} />}

      {installEditor && (
        <DocumentEditorModal
          open={!!installEditor}
          onClose={() => setInstallEditor(null)}
          title={installEditor.title}
          initialHtml={installEditor.html}
          docType={installEditor.docType}
          record={installEditor.record}
          saveLabel={lang === 'id' ? 'Simpan Dokumen' : 'Save Document'}
          lang={lang}
          onSave={(html, status) => {
            onSaveDocument && onSaveDocument({ docType: installEditor.docType, html, status, record: installEditor.record, requesterId: installEditor.record.salesOwner, notifyRequester: false });
            setInstallEditor(null);
          }}
        />
      )}
    </div>
  );
}
function InstallRecordsList({ records, setRecords, t, lang, canEdit, employees = {}, units = [], products = [], fmt = (n) => n, documentTemplates = DEFAULT_DOCUMENT_TEMPLATES, onOpenEditor }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [sortBy, setSortBy] = useState('date_desc');
  const statusColors = { planning: '#94a3b8', progress: 'var(--ims-gold)', completed: 'var(--ims-accent-2)', delayed: '#c03030' };

  const handleSave = (rec) => {
    setRecords(prev => {
      const exists = prev.find(r => r.id === rec.id);
      if (rec.status === 'signed' && rec.signedDate && (!exists || exists.signedDate !== rec.signedDate || exists.status !== 'signed')) {
        const due = new Date(rec.signedDate);
        due.setDate(due.getDate() + 30);
        notify({ role: 'finance' }, {
          type: 'billing_due',
          message: `BAST ${rec.customer} sudah signed. Reminder penagihan pertama jatuh tempo ${due.toISOString().split('T')[0]} dan H-7 perlu follow-up.`,
          link: { view: 'finance' },
        });
      }
      return exists ? prev.map(r => r.id === rec.id ? rec : r) : [...prev, rec];
    });
    setModalOpen(false); setEditingRecord(null);
  };
  const [deleteId, setDeleteId] = useState(null);
  const handleDelete = (id) => {
    if (!canEdit) return;
    setDeleteId(id);
  };
  const confirmDelete = () => {
    setRecords(prev => prev.filter(r => r.id !== deleteId));
    setDeleteId(null);
  };

  const sortedRecords = useMemo(() => {
    const arr = [...records];
    if (sortBy === 'date_desc') return arr.sort((a, b) => (b.installStart || '').localeCompare(a.installStart || ''));
    if (sortBy === 'date_asc') return arr.sort((a, b) => (a.installStart || '').localeCompare(b.installStart || ''));
    if (sortBy === 'value_desc') return arr.sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0));
    if (sortBy === 'status') return arr.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    return arr;
  }, [records, sortBy]);

  return (
    <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
      <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
        <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.inst_tab_records}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <SortToggle value={sortBy} onChange={setSortBy} lang={lang} options={[{value: 'date_desc', label: lang === 'id' ? 'Terbaru' : 'Newest'}, {value: 'date_asc', label: lang === 'id' ? 'Terlama' : 'Oldest'}, {value: 'status', label: lang === 'id' ? 'Status' : 'Status'}]} />
          {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
        </div>
      </div>
      {sortedRecords.map(r => {
        const statusColor = statusColors[r.status];
        return (
          <div key={r.id} style={{padding: '16px 18px', borderTop: '1px solid var(--ims-border)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '10px'}}>
              <div style={{flex: '1 1 320px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap'}}>
                  <span className="mono" style={{fontSize: '12px', fontWeight: 700, color: 'var(--ims-text)'}}>{r.recordNo}</span>
                  <span style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>· {r.customer}</span>
                </div>
                <div style={{fontSize: '12px', fontWeight: 500, marginTop: '4px'}}>{r.modality} · {r.subModality}</div>
                <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px'}}>👷 {resolveEmpName(employees, r.leadTechnician)} (Team: {r.teamSize})</div>
              </div>
              <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px'}}>
                <span style={{padding: '4px 10px', fontSize: '10px', background: statusColor + '25', color: statusColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`inst_status_${r.status}`]}</span>
                <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                  {canEdit && onOpenEditor && <button onClick={() => onOpenEditor('batraining', r, 'BA Training')} className="btn-primary" style={{fontSize: '10px', padding: '4px 8px'}} title="Buat BA Training di editor"><Edit2 size={11} />Buat</button>}
                  <button onClick={() => printBATrainingPdf(r, fmt, documentTemplates, employees)} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}} title="PDF BA Training"><FileText size={11} />PDF</button>
                  <button onClick={() => downloadBATrainingDoc(r, fmt, documentTemplates, employees)} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}} title="Word BA Training"><Download size={11} />Word</button>
                  {canEdit && <button onClick={() => { setEditingRecord(r); setModalOpen(true); }} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}}><Edit2 size={11} />Edit</button>}
                  {canEdit && <button onClick={() => handleDelete(r.id)} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px', color: '#c03030'}}><Trash2 size={11} /></button>}
                </div>
              </div>
            </div>
            <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '10px', color: 'var(--ims-text-2)', marginBottom: '8px'}}>
              <span><strong>Mulai:</strong> <span className="mono">{r.installStart || '—'}</span></span>
              <span><strong>Selesai:</strong> <span className="mono">{r.installEnd || '—'}</span></span>
              {r.duration && <span><strong>Durasi:</strong> {r.duration} hari</span>}
            </div>
            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '10px', marginBottom: '8px'}}>
              <span style={{padding: '2px 7px', background: r.roomReady ? 'var(--ims-accent-2)25' : '#c0303025', color: r.roomReady ? 'var(--ims-accent-2)' : '#c03030', fontWeight: 600}}>{r.roomReady ? '✓' : '✗'} Ruangan</span>
              <span style={{padding: '2px 7px', background: r.electricalReady ? 'var(--ims-accent-2)25' : '#c0303025', color: r.electricalReady ? 'var(--ims-accent-2)' : '#c03030', fontWeight: 600}}>{r.electricalReady ? '✓' : '✗'} Listrik</span>
              <span style={{padding: '2px 7px', background: r.calibrationDone ? 'var(--ims-accent-2)25' : '#c0303025', color: r.calibrationDone ? 'var(--ims-accent-2)' : '#c03030', fontWeight: 600}}>{r.calibrationDone ? '✓' : '✗'} Kalibrasi</span>
            </div>
            {r.notes && <div style={{padding: '8px 10px', background: 'var(--ims-bg-card-2)', fontSize: '11px', fontStyle: 'italic', color: 'var(--ims-text)'}}>📝 {r.notes}</div>}
          </div>
        );
      })}
      {records.length === 0 && <div className="empty-state">{t.no_data}</div>}
      {modalOpen && <InstallRecordModal record={editingRecord} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} employees={employees} units={units} products={products} />}
      <ConfirmDialog open={!!deleteId} title={lang === 'id' ? 'Hapus Riwayat Instalasi?' : 'Delete Installation Record?'} message={lang === 'id' ? 'Yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to delete this record? This action cannot be undone.'} onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} danger lang={lang} />
    </div>
  );
}
function BASTList({ records, products = [], setRecords, t, lang, canEdit, units = [], installRecords = [], employees = {}, documentTemplates = DEFAULT_DOCUMENT_TEMPLATES, fmt = (n) => n, onOpenEditor }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [sortBy, setSortBy] = useState('date_desc');
  const statusColors = { draft: '#94a3b8', pending: 'var(--ims-gold)', signed: 'var(--ims-accent-2)' };

  const handleSave = (rec) => {
    const cleanRec = {
      ...rec,
      id: rec._placeholder ? 'bast_' + Date.now() : rec.id,
      bastNo: rec._placeholder || !rec.bastNo || rec.bastNo === 'BAST belum dibuat' || rec.bastNo === 'BAST not created'
        ? 'BAST-HNTI-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-3)
        : rec.bastNo,
    };
    delete cleanRec._placeholder;
    setRecords(prev => {
      const exists = prev.find(r => r.id === cleanRec.id);
      return exists ? prev.map(r => r.id === cleanRec.id ? cleanRec : r) : [...prev, cleanRec];
    });
    setModalOpen(false); setEditingRecord(null);
  };
  const [deleteId, setDeleteId] = useState(null);
  const handleDelete = (id) => {
    if (!canEdit) return;
    setDeleteId(id);
  };
  const confirmDelete = () => {
    setRecords(prev => prev.filter(r => r.id !== deleteId));
    setDeleteId(null);
  };

  const sortedRecords = useMemo(() => {
    const arr = [...records];
    if (sortBy === 'date_desc') return arr.sort((a, b) => (b.signedDate || '').localeCompare(a.signedDate || ''));
    if (sortBy === 'date_asc') return arr.sort((a, b) => (a.signedDate || '').localeCompare(b.signedDate || ''));
    if (sortBy === 'value_desc') return arr.sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0));
    if (sortBy === 'status') return arr.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    return arr;
  }, [records, sortBy]);

  return (
    <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
      <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
        <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.inst_tab_bast}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <SortToggle value={sortBy} onChange={setSortBy} lang={lang} options={[{value: 'date_desc', label: lang === 'id' ? 'Terbaru' : 'Newest'}, {value: 'date_asc', label: lang === 'id' ? 'Terlama' : 'Oldest'}, {value: 'status', label: lang === 'id' ? 'Status' : 'Status'}]} />
          {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
        </div>
      </div>
      {sortedRecords.map(r => {
        const statusColor = statusColors[r.status];
        const syncedTech = installLeadTechnicianName(installRecords, employees, r.customer, r.modality, r.subModality);
        const technicianNames = activeEmployeeNamesByRole(employees, 'technician');
        const displayHntiRep = r.hntiRep && technicianNames.includes(r.hntiRep) ? r.hntiRep : (syncedTech || r.hntiRep);
        return (
          <div key={r.id} style={{padding: '16px 18px', borderTop: '1px solid var(--ims-border)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '10px'}}>
              <div style={{flex: '1 1 320px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap'}}>
                  <span className="mono" style={{fontSize: '12px', fontWeight: 700, color: 'var(--ims-text)'}}>{r.bastNo}</span>
                </div>
                <div style={{fontSize: '12px', fontWeight: 600, marginTop: '4px'}}>{r.customer}</div>
                <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{r.modality} · {r.subModality}</div>
                {r.signedDate && <div style={{fontSize: '10px', color: 'var(--ims-accent-2)', marginTop: '4px', fontWeight: 600}} className="mono">✓ Tertanda: {r.signedDate}</div>}
              </div>
              <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px'}}>
                <span style={{padding: '4px 10px', fontSize: '10px', background: statusColor + '25', color: statusColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`bast_status_${r.status}`]}</span>
                {r.docUrl && <LinkAttachment url={r.docUrl} lang={lang} />}
                <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                  {canEdit && onOpenEditor && <button onClick={() => onOpenEditor('bast_barang', r, 'BAST Barang')} className="btn-primary" style={{fontSize: '10px', padding: '4px 8px'}} title="Buat BAST di editor (bisa diedit & disimpan)"><Edit2 size={11} />Buat BAST</button>}
                  {canEdit && onOpenEditor && <button onClick={() => onOpenEditor('bai', r, 'BA Instalasi')} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}} title="Buat BA Instalasi di editor"><Edit2 size={11} />Buat BAI</button>}
                  {canEdit && onOpenEditor && <button onClick={() => onOpenEditor('bauji_fungsi', r, 'BA Uji Fungsi')} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}} title="Buat BA Uji Fungsi di editor"><Edit2 size={11} />Buat Uji</button>}
                  <button onClick={() => printBASTBarangPdf(r, fmt, documentTemplates, employees)} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}} title="PDF BAST Barang"><FileText size={11} />PDF</button>
                  <button onClick={() => downloadBASTBarangDoc(r, fmt, documentTemplates, employees)} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}} title="Word BAST Barang"><Download size={11} />Word</button>
                  <button onClick={() => printBAIPdf(r, fmt, documentTemplates, employees)} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}} title="PDF BA Instalasi"><FileCheck size={11} />BAI</button>
                  <button onClick={() => printBAUjiFungsiPdf(r, fmt, documentTemplates, employees)} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}} title="PDF BA Uji Fungsi"><FileCheck size={11} />Uji</button>
                  {canEdit && <button onClick={() => { setEditingRecord(r); setModalOpen(true); }} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}}><Edit2 size={11} />Edit</button>}
                  {canEdit && !r._placeholder && <button onClick={() => handleDelete(r.id)} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px', color: '#c03030'}}><Trash2 size={11} /></button>}
                </div>
              </div>
            </div>
            <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '10px', color: 'var(--ims-text-2)', marginBottom: '8px'}}>
              <span><strong>HNTI:</strong> {displayHntiRep || '—'}</span>
              <span><strong>Customer:</strong> {r.customerRep || '—'}</span>
              {r.witness && <span><strong>Saksi:</strong> {r.witness}</span>}
            </div>
            {r.notes && <div style={{padding: '8px 10px', background: 'var(--ims-bg-card-2)', fontSize: '11px', fontStyle: 'italic', color: 'var(--ims-text)'}}>📝 {r.notes}</div>}
          </div>
        );
      })}
      {records.length === 0 && <div className="empty-state">{t.no_data}</div>}
      {modalOpen && <BASTModal record={editingRecord} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} units={units} installRecords={installRecords} employees={employees} products={products} />}
      <ConfirmDialog open={!!deleteId} title={lang === 'id' ? 'Hapus BAST?' : 'Delete BAST?'} message={lang === 'id' ? 'Yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to delete this record? This action cannot be undone.'} onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} danger lang={lang} />
    </div>
  );
}
function TrainingCertList({ records, setRecords, t, lang, canEdit, employees = {}, units = [], installRecords = [], products = [], documentTemplates = DEFAULT_DOCUMENT_TEMPLATES, fmt = (n) => n, onOpenEditor }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [sortBy, setSortBy] = useState('date_desc');
  const statusColors = { pending: 'var(--ims-gold)', completed: 'var(--ims-accent-2)' };

  const handleSave = (rec) => {
    const cleanRec = {
      ...rec,
      id: rec._placeholder ? 'train_' + Date.now() : rec.id,
      certNo: rec._placeholder || !rec.certNo || rec.certNo === 'Training belum dibuat' || rec.certNo === 'Training not created'
        ? 'CERT-HNTI-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-3)
        : rec.certNo,
    };
    delete cleanRec._placeholder;
    setRecords(prev => {
      const exists = prev.find(r => r.id === cleanRec.id);
      const prevDate = exists?.sessionDate;
      // Catatan #5 Phase 2a: notif Product Specialist saat training dijadwalkan/diubah
      if (cleanRec.sessionDate && cleanRec.sessionDate !== prevDate) {
        try {
          notify({ role: 'product_specialist' }, {
            type: 'training_scheduled',
            message: (typeof t === 'object' && t.lang === 'en')
              ? `Training ${cleanRec.modality} at ${cleanRec.customer} scheduled ${cleanRec.sessionDate}. Instructor: ${cleanRec.instructor || '-'}.`
              : `Training ${cleanRec.modality} di ${cleanRec.customer} dijadwalkan ${cleanRec.sessionDate}. Instruktur: ${cleanRec.instructor || '-'}.`,
            link: { view: 'installation' }
          });
        } catch {}
      }
      return exists ? prev.map(r => r.id === cleanRec.id ? cleanRec : r) : [...prev, cleanRec];
    });
    setModalOpen(false); setEditingRecord(null);
  };
  const [deleteId, setDeleteId] = useState(null);
  const handleDelete = (id) => {
    if (!canEdit) return;
    setDeleteId(id);
  };
  const confirmDelete = () => {
    setRecords(prev => prev.filter(r => r.id !== deleteId));
    setDeleteId(null);
  };

  const sortedRecords = useMemo(() => {
    const arr = [...records];
    if (sortBy === 'date_desc') return arr.sort((a, b) => (b.sessionDate || '').localeCompare(a.sessionDate || ''));
    if (sortBy === 'date_asc') return arr.sort((a, b) => (a.sessionDate || '').localeCompare(b.sessionDate || ''));
    if (sortBy === 'value_desc') return arr.sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0));
    if (sortBy === 'status') return arr.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    return arr;
  }, [records, sortBy]);

  return (
    <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
      <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
        <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.inst_tab_training}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <SortToggle value={sortBy} onChange={setSortBy} lang={lang} options={[{value: 'date_desc', label: lang === 'id' ? 'Terbaru' : 'Newest'}, {value: 'date_asc', label: lang === 'id' ? 'Terlama' : 'Oldest'}, {value: 'status', label: lang === 'id' ? 'Status' : 'Status'}]} />
          {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
        </div>
      </div>
      {sortedRecords.map(r => {
        const statusColor = statusColors[r.status];
        const syncedTech = installLeadTechnicianName(installRecords, employees, r.customer, r.modality, r.subModality);
        const technicianNames = activeEmployeeNamesByRole(employees, 'technician');
        const rawInstructorParts = String(r.instructor || '').split(',').map(x => x.trim()).filter(Boolean);
        const displayInstructor = syncedTech && !rawInstructorParts.includes(syncedTech)
          ? [syncedTech, ...rawInstructorParts.filter(name => !technicianNames.includes(name))].join(', ')
          : (r.instructor || syncedTech || '');
        return (
          <div key={r.id} style={{padding: '16px 18px', borderTop: '1px solid var(--ims-border)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '10px'}}>
              <div style={{flex: '1 1 320px'}}>
                {r.certNo && <div className="mono" style={{fontSize: '12px', fontWeight: 700, color: 'var(--ims-text)', marginBottom: '4px'}}>{r.certNo}</div>}
                <div style={{fontSize: '12px', fontWeight: 600}}>{r.customer}</div>
                <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{r.modality} · {r.subModality}</div>
                {displayInstructor && <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '4px'}}>🎓 {resolveNamesInText(employees, displayInstructor)}</div>}
              </div>
              <div style={{textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px'}}>
                <span style={{padding: '4px 10px', fontSize: '10px', background: statusColor + '25', color: statusColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{r.status === 'completed' ? t.train_completed : t.train_pending}</span>
                {r.certUrl && <LinkAttachment url={r.certUrl} lang={lang} />}
                {canEdit && (
                  <div style={{display: 'flex', gap: '4px'}}>
                    <button onClick={() => { setEditingRecord(r); setModalOpen(true); }} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit'}}><Edit2 size={11} /></button>
                    {!r._placeholder && <button onClick={() => handleDelete(r.id)} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}><Trash2 size={11} /></button>}
                  </div>
                )}
              </div>
            </div>
            <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '10px', color: 'var(--ims-text-2)', marginBottom: '8px'}}>
              {r.sessionDate && <span><strong>Tgl:</strong> <span className="mono">{r.sessionDate}</span></span>}
              {r.participants > 0 && <span><strong>Peserta:</strong> {r.participants}</span>}
              {r.duration > 0 && <span><strong>Durasi:</strong> {r.duration} jam</span>}
            </div>
            {r.topics && <div style={{padding: '8px 10px', background: 'var(--ims-bg-card-2)', fontSize: '11px', color: 'var(--ims-text)', marginBottom: '8px'}}><strong>Topik:</strong> {r.topics}</div>}
            {r.notes && <div style={{padding: '8px 10px', background: 'var(--ims-bg-card-2)', fontSize: '11px', fontStyle: 'italic', color: 'var(--ims-text)'}}>📝 {r.notes}</div>}
          </div>
        );
      })}
      {records.length === 0 && <div className="empty-state">{t.no_data}</div>}
      {modalOpen && <TrainingCertModal record={editingRecord} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} units={units} installRecords={installRecords} employees={employees} products={products} />}
      <ConfirmDialog open={!!deleteId} title={lang === 'id' ? 'Hapus Sertifikat?' : 'Delete Certificate?'} message={lang === 'id' ? 'Yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to delete this record? This action cannot be undone.'} onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} danger lang={lang} />
    </div>
  );
}
function UnitPickerField({ units = [], customer, modality, subModality, onPick, lang }) {
  const keyOf = (u) => `${u.customer}|${u.modality || ''}|${u.subModality || ''}`;
  const curKey = (customer || modality || subModality) ? `${customer || ''}|${modality || ''}|${subModality || ''}` : '';
  const hasMatch = units.some(u => keyOf(u) === curKey);
  return (
    <Field label={lang === 'id' ? 'Tarik dari SPH (produk terkirim)' : 'Pull from SPH (delivered product)'} full>
      <select value={curKey} onChange={e => {
        if (!e.target.value) { onPick({ customer: '', modality: '', subModality: '' }); return; }
        const u = units.find(x => keyOf(x) === e.target.value);
        if (u) onPick(u);
      }}>
        <option value="">{lang === 'id' ? '— Pilih RS / produk terkirim —' : '— Select delivered RS / product —'}</option>
        {!hasMatch && customer && <option value={curKey}>{customer}{modality ? ` — ${modality}` : ''}{subModality ? ` ${subModality}` : ''} {lang === 'id' ? '(input manual)' : '(manual entry)'}</option>}
        {units.map(u => <option key={u.id || keyOf(u)} value={keyOf(u)}>{u.customer} — {u.modality}{u.subModality ? ` ${u.subModality}` : ''}{u.sphNo ? ` · ${u.sphNo}` : ''}</option>)}
      </select>
    </Field>
  );
}
function findInstallRecordForUnit(installRecords = [], customer, modality, subModality) {
  if (!customer || !Array.isArray(installRecords)) return null;
  const candidates = installRecords.filter(ir => ir.customer === customer);
  let match = candidates.find(ir => ir.modality === modality && (ir.subModality || '') === (subModality || ''));
  if (!match) match = candidates.find(ir => ir.modality === modality);
  if (!match && candidates.length) match = candidates[0];
  return match || null;
}
function installLeadTechnicianName(installRecords = [], employees = {}, customer, modality, subModality) {
  const rec = findInstallRecordForUnit(installRecords, customer, modality, subModality);
  return rec ? resolveEmpName(employees, rec.leadTechnician || '') : '';
}
function activeEmployeeNamesByRole(employees = {}, role) {
  return Object.values(employees)
    .filter(emp => emp.role === role && emp.active !== false)
    .map(emp => emp.name)
    .sort((a, b) => a.localeCompare(b));
}
function InstallRecordModal({ record, onSave, onClose, t, lang, employees = {}, units = [], products = [] }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState(record || {
    id: 'inst_' + Date.now(),
    recordNo: 'BA-INST-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-3),
    customer: '', modality: 'CT Scan', subModality: '',
    installStart: today, installEnd: '', duration: null,
    leadTechnician: (Object.keys(employees).find(u => employees[u].role === 'technician' && employees[u].active) || ''), teamSize: 2,
    roomReady: false, electricalReady: false, calibrationDone: false,
    status: 'planning', notes: '',
  });
  const isEdit = !!record;
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const autoDuration = useMemo(() => {
    if (!form.installStart || !form.installEnd) return null;
    const start = new Date(form.installStart);
    const end = new Date(form.installEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return null;
    return Math.max(1, Math.round((end - start) / 86400000) + 1);
  }, [form.installStart, form.installEnd]);
  useEffect(() => {
    if (autoDuration == null) return;
    setForm(prev => prev.duration === autoDuration ? prev : { ...prev, duration: autoDuration });
  }, [autoDuration]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.inst_modal_edit_record : t.inst_modal_add_record}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <Field label={t.inst_record_no}><input value={form.recordNo} onChange={e => update('recordNo', e.target.value)} /></Field>
          <Field label={t.inst_record_status}>
            <select value={form.status} onChange={e => update('status', e.target.value)}>
              <option value="planning">{t.inst_status_planning}</option>
              <option value="progress">{t.inst_status_progress}</option>
              <option value="completed">{t.inst_status_completed}</option>
              <option value="delayed">{t.inst_status_delayed}</option>
            </select>
          </Field>
          <UnitPickerField units={units} customer={form.customer} modality={form.modality} subModality={form.subModality} lang={lang} onPick={u => setForm(prev => ({ ...prev, customer: u.customer, modality: u.modality || prev.modality, subModality: u.subModality || '' }))} />
          <Field label={t.customer} full><input value={form.customer} onChange={e => update('customer', e.target.value)} placeholder="RS / Klinik" /></Field>
          <Field label={t.modality}>
            <select value={form.modality} onChange={e => { update('modality', e.target.value); update('subModality', ''); }}>
              {[...new Set([...Object.keys(MODALITY_COLORS), ...(products||[]).map(p=>p.modality).filter(Boolean), form.modality].filter(Boolean))].sort().map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label={lang === 'id' ? 'Tipe' : 'Type'}>
            <select value={form.subModality} onChange={e => update('subModality', e.target.value)}>
              <option value="">{lang === 'id' ? '— Pilih Tipe —' : '— Select Type —'}</option>
              {(products||[]).filter(p => p.modality === form.modality && p.active !== false).map(p => <option key={p.id} value={p.type}>{p.type} ({p.brand})</option>)}
              {form.subModality && !(products||[]).some(p => p.modality === form.modality && p.type === form.subModality) && <option value={form.subModality}>{form.subModality}</option>}
            </select>
          </Field>
          <Field label={t.inst_install_start}><input type="date" value={form.installStart} onChange={e => update('installStart', e.target.value)} /></Field>
          <Field label={t.inst_install_end}><input type="date" value={form.installEnd || ''} onChange={e => update('installEnd', e.target.value)} /></Field>
          <Field label={t.inst_duration}><input type="number" value={form.duration || ''} readOnly={autoDuration != null} onChange={e => update('duration', parseInt(e.target.value) || null)} style={autoDuration != null ? {background: 'var(--ims-bg-card-2)', cursor: 'default'} : undefined} /></Field>
          <Field label={t.inst_lead_technician}><select value={employees[form.leadTechnician] ? form.leadTechnician : (Object.entries(employees).find(([u, inf]) => inf.role === 'technician' && inf.active && inf.name === resolveEmpName(employees, form.leadTechnician)) || [''])[0]} onChange={e => update('leadTechnician', e.target.value)} style={{width:'100%'}}><option value="">{lang === 'id' ? '— Pilih Teknisi —' : '— Select Technician —'}</option>{Object.entries(employees).filter(([u, inf]) => inf.role === 'technician' && inf.active).map(([u, inf]) => <option key={u} value={u}>{inf.name}</option>)}</select></Field>
          <Field label={t.inst_team_size}><input type="number" min="1" value={form.teamSize} onChange={e => update('teamSize', parseInt(e.target.value) || 1)} /></Field>
          <Field label={t.inst_room_ready}>
            <select value={form.roomReady ? 'yes' : 'no'} onChange={e => update('roomReady', e.target.value === 'yes')}>
              <option value="no">{lang === 'id' ? 'Belum Siap' : 'Not Ready'}</option>
              <option value="yes">{lang === 'id' ? 'Siap' : 'Ready'}</option>
            </select>
          </Field>
          <Field label={t.inst_electrical_ready}>
            <select value={form.electricalReady ? 'yes' : 'no'} onChange={e => update('electricalReady', e.target.value === 'yes')}>
              <option value="no">{lang === 'id' ? 'Belum Siap' : 'Not Ready'}</option>
              <option value="yes">{lang === 'id' ? 'Siap' : 'Ready'}</option>
            </select>
          </Field>
          <Field label={t.inst_calibration_done}>
            <select value={form.calibrationDone ? 'yes' : 'no'} onChange={e => update('calibrationDone', e.target.value === 'yes')}>
              <option value="no">{lang === 'id' ? 'Belum' : 'Not Done'}</option>
              <option value="yes">{lang === 'id' ? 'Selesai' : 'Done'}</option>
            </select>
          </Field>
          <Field label={t.notes} full><textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} /></Field>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
          <button className="btn-primary" onClick={() => onSave({ ...form, duration: autoDuration ?? form.duration })}>{t.crud_save}</button>
        </div>
      </div>
    </div>
  );
}
function BASTModal({ record, onSave, onClose, t, lang, units = [], installRecords = [], employees = {}, products = [] }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState(record || {
    id: 'bast_' + Date.now(),
    bastNo: 'BAST-HNTI-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-3),
    customer: '', modality: 'CT Scan', subModality: '',
    signedDate: '', hntiRep: '',
    customerRep: '', witness: '',
    status: 'draft', docUrl: '', notes: '',
  });
  const isEdit = !!record;
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const syncedTech = installLeadTechnicianName(installRecords, employees, form.customer, form.modality, form.subModality);
  const technicianNames = activeEmployeeNamesByRole(employees, 'technician');
  const selectedHntiRep = form.hntiRep && technicianNames.includes(form.hntiRep) ? form.hntiRep : (syncedTech || form.hntiRep || '');
  const hntiRepOptions = [...new Set([syncedTech, ...technicianNames, form.hntiRep].filter(Boolean))];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.inst_modal_edit_bast : t.inst_modal_add_bast}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <Field label={t.bast_no}><input value={form.bastNo} onChange={e => update('bastNo', e.target.value)} /></Field>
          <Field label="Status">
            <select value={form.status} onChange={e => update('status', e.target.value)}>
              <option value="draft">{t.bast_status_draft}</option>
              <option value="pending">{t.bast_status_pending}</option>
              <option value="signed">{t.bast_status_signed}</option>
            </select>
          </Field>
          <UnitPickerField units={units} customer={form.customer} modality={form.modality} subModality={form.subModality} lang={lang} onPick={u => {
            const leadTech = installLeadTechnicianName(installRecords, employees, u.customer, u.modality, u.subModality);
            setForm(prev => ({ ...prev, customer: u.customer, modality: u.modality || prev.modality, subModality: u.subModality || '', hntiRep: leadTech || prev.hntiRep }));
          }} />
          <Field label={t.customer} full><input value={form.customer} onChange={e => update('customer', e.target.value)} /></Field>
          <Field label={t.modality}>
            <select value={form.modality} onChange={e => { update('modality', e.target.value); update('subModality', ''); }}>
              {[...new Set([...Object.keys(MODALITY_COLORS), ...(products||[]).map(p=>p.modality).filter(Boolean), form.modality].filter(Boolean))].sort().map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label={lang === 'id' ? 'Tipe' : 'Type'}>
            <select value={form.subModality} onChange={e => update('subModality', e.target.value)}>
              <option value="">{lang === 'id' ? '— Pilih Tipe —' : '— Select Type —'}</option>
              {(products||[]).filter(p => p.modality === form.modality && p.active !== false).map(p => <option key={p.id} value={p.type}>{p.type} ({p.brand})</option>)}
              {form.subModality && !(products||[]).some(p => p.modality === form.modality && p.type === form.subModality) && <option value={form.subModality}>{form.subModality}</option>}
            </select>
          </Field>
          <Field label={t.bast_signed_date}><input type="date" value={form.signedDate || ''} onChange={e => update('signedDate', e.target.value)} /></Field>
          <Field label={t.bast_hnti_rep}>
            <select value={selectedHntiRep} onChange={e => update('hntiRep', e.target.value)}>
              <option value="">{lang === 'id' ? '— Pilih teknisi —' : '— Select technician —'}</option>
              {hntiRepOptions.map(name => <option key={name} value={name}>{name}{name === syncedTech ? (lang === 'id' ? ' (teknisi instalasi)' : ' (install technician)') : ''}</option>)}
            </select>
          </Field>
          <Field label={t.bast_customer_rep}><input value={form.customerRep} onChange={e => update('customerRep', e.target.value)} placeholder="dr. Nama, Sp.Rad" /></Field>
          <Field label={t.bast_witness} full><input value={form.witness} onChange={e => update('witness', e.target.value)} placeholder="Notaris / Saksi" /></Field>
          <Field label={t.bast_doc_url} full><input type="url" value={form.docUrl} onChange={e => update('docUrl', e.target.value)} placeholder="https://drive.google.com/..." /></Field>
          <Field label={t.bast_notes} full><textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} /></Field>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
          <button className="btn-primary" onClick={() => onSave({ ...form, hntiRep: selectedHntiRep || syncedTech })}>{t.crud_save}</button>
        </div>
      </div>
    </div>
  );
}
function TrainingCertModal({ record, onSave, onClose, t, lang, units = [], installRecords = [], employees = {}, products = [] }) {
  const [form, setForm] = useState(record || {
    id: 'train_' + Date.now(),
    certNo: 'CERT-HNTI-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-3),
    customer: '', modality: 'CT Scan', subModality: '',
    sessionDate: '', participants: 0, instructor: '',
    productInstructor: '', otherInstructor: '',
    duration: 0, topics: '', status: 'pending', certUrl: '', notes: '',
  });
  const isEdit = !!record;
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const syncedTech = installLeadTechnicianName(installRecords, employees, form.customer, form.modality, form.subModality);
  const technicianNames = activeEmployeeNamesByRole(employees, 'technician');
  const productSpecialists = activeEmployeeNamesByRole(employees, 'product_specialist');
  const technicianInstructor = form.instructor && technicianNames.includes(form.instructor) ? form.instructor : (syncedTech || form.instructor || '');
  const selectedProductInstructor = form.productInstructor === '__other__' ? form.otherInstructor : form.productInstructor;
  const instructorValue = [technicianInstructor || syncedTech, selectedProductInstructor].filter(Boolean).join(', ');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.inst_modal_edit_training : t.inst_modal_add_training}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <Field label={t.train_cert_no}><input value={form.certNo} onChange={e => update('certNo', e.target.value)} /></Field>
          <Field label="Status">
            <select value={form.status} onChange={e => update('status', e.target.value)}>
              <option value="pending">{t.train_pending}</option>
              <option value="completed">{t.train_completed}</option>
            </select>
          </Field>
          <UnitPickerField units={units} customer={form.customer} modality={form.modality} subModality={form.subModality} lang={lang} onPick={u => {
            const leadTech = installLeadTechnicianName(installRecords, employees, u.customer, u.modality, u.subModality);
            setForm(prev => ({ ...prev, customer: u.customer, modality: u.modality || prev.modality, subModality: u.subModality || '', instructor: leadTech || prev.instructor }));
          }} />
          <Field label={t.customer} full><input value={form.customer} onChange={e => update('customer', e.target.value)} /></Field>
          <Field label={t.modality}>
            <select value={form.modality} onChange={e => { update('modality', e.target.value); update('subModality', ''); }}>
              {[...new Set([...Object.keys(MODALITY_COLORS), ...(products||[]).map(p=>p.modality).filter(Boolean), form.modality].filter(Boolean))].sort().map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label={lang === 'id' ? 'Tipe' : 'Type'}>
            <select value={form.subModality} onChange={e => update('subModality', e.target.value)}>
              <option value="">{lang === 'id' ? '— Pilih Tipe —' : '— Select Type —'}</option>
              {(products||[]).filter(p => p.modality === form.modality && p.active !== false).map(p => <option key={p.id} value={p.type}>{p.type} ({p.brand})</option>)}
              {form.subModality && !(products||[]).some(p => p.modality === form.modality && p.type === form.subModality) && <option value={form.subModality}>{form.subModality}</option>}
            </select>
          </Field>
          <Field label={t.train_session_date}><input type="date" value={form.sessionDate || ''} onChange={e => update('sessionDate', e.target.value)} /></Field>
          <Field label={t.train_participants}><input type="number" min="0" value={form.participants} onChange={e => update('participants', parseInt(e.target.value) || 0)} /></Field>
          <Field label={t.train_duration}><input type="number" min="0" value={form.duration} onChange={e => update('duration', parseInt(e.target.value) || 0)} /></Field>
          <Field label={lang === 'id' ? 'Instruktur Teknisi Instalasi' : 'Installation Technician Instructor'}>
            <select value={technicianInstructor || syncedTech || ''} onChange={e => update('instructor', e.target.value)}>
              <option value="">{lang === 'id' ? '— Pilih dari riwayat instalasi —' : '— Select from installation history —'}</option>
              {[...new Set([syncedTech, ...technicianNames, form.instructor].filter(Boolean))].map(name => <option key={name} value={name}>{name}{name === syncedTech ? (lang === 'id' ? ' (default instalasi)' : ' (installation default)') : ''}</option>)}
            </select>
          </Field>
          <Field label={lang === 'id' ? 'Instruktur Product Specialist (Opsional)' : 'Product Specialist Instructor (Optional)'}>
            <select value={form.productInstructor || ''} onChange={e => update('productInstructor', e.target.value)}>
              <option value="">{lang === 'id' ? '— Tidak ada tambahan —' : '— No additional instructor —'}</option>
              {productSpecialists.map(name => <option key={name} value={name}>{name}</option>)}
              <option value="__other__">{lang === 'id' ? 'Lainnya' : 'Other'}</option>
            </select>
          </Field>
          {form.productInstructor === '__other__' && <Field label={lang === 'id' ? 'Nama Lainnya' : 'Other Name'} full><input value={form.otherInstructor || ''} onChange={e => update('otherInstructor', e.target.value)} placeholder={lang === 'id' ? 'Isi nama instruktur tambahan' : 'Enter additional instructor'} /></Field>}
          <Field label={t.train_instructor} full><input readOnly value={instructorValue} placeholder={lang === 'id' ? 'Otomatis: teknisi instalasi + Product Specialist opsional' : 'Auto: install technician + optional Product Specialist'} /></Field>
          <Field label={t.train_topics} full><textarea rows={2} value={form.topics} onChange={e => update('topics', e.target.value)} placeholder="Operasional, safety, troubleshooting..." /></Field>
          <Field label={t.train_cert_url} full><input type="url" value={form.certUrl} onChange={e => update('certUrl', e.target.value)} placeholder="https://drive.google.com/..." /></Field>
          <Field label={t.notes} full><textarea rows={2} value={form.notes} onChange={e => update('notes', e.target.value)} /></Field>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
          <button className="btn-primary" onClick={() => onSave({ ...form, instructor: instructorValue })}>{t.crud_save}</button>
        </div>
      </div>
    </div>
  );
}

export { InstallationModule, InstallRecordsList, BASTList, TrainingCertList, UnitPickerField, findInstallRecordForUnit, installLeadTechnicianName, activeEmployeeNamesByRole, InstallRecordModal, BASTModal, TrainingCertModal };

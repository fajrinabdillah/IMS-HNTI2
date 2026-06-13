// Extracted from App.jsx during modular refactor.
import { useEffect, useMemo, useState } from 'react';
import { Activity, Briefcase, Edit2, FileText, Plus, Search, Trash2, Truck, Wrench, X } from 'lucide-react';
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip, ConfirmDialog, Field, LinkAttachment, ReadOnlyBanner, SortToggle, Td, Th } from '../components/ui.jsx';
import { CHART_COLORS } from '../constants/theme.js';
import { IMPORT_PIPELINE_STEPS } from '../constants/regulatory.js';
import { addDateOnlyDays, dateOnlyFromValue, formatDateTime, currentYear } from '../utils/format.js';
import { addDaysIso, getFactoryProductionDays, getFactoryProductionInfo, importPipelineLabel, manifestMatchesProject, normalizeImportPipelineStatus, normalizeProductLookupText, projectHasDpReceived } from '../utils/domain.js';
import { flushPersist } from '../utils/storage.js';
import { notify } from '../utils/notifications.js';
import { showToast } from '../utils/toast.js';
function CustomsNoteEditor({ value, isHold, onSave, t, lang }) {
  const [draft, setDraft] = useState(value || '');
  const [justSaved, setJustSaved] = useState(false);
  useEffect(() => { setDraft(value || ''); setJustSaved(false); }, [value]);
  const dirty = draft !== (value || '');
  return (
    <>
      <textarea
        value={draft}
        onChange={e => { setDraft(e.target.value); setJustSaved(false); }}
        placeholder={t.status_note_placeholder}
        rows={2}
        style={{width: '100%', fontSize: '12px', padding: '6px 8px', border: `1px solid ${isHold && !draft.trim() ? '#c03030' : 'var(--ims-border)'}`, background: 'var(--ims-bg-card)', fontFamily: 'inherit', resize: 'vertical'}}
      />
      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px'}}>
        <button onClick={() => { onSave(draft.trim()); setJustSaved(true); }} disabled={!dirty} style={{padding: '6px 14px', fontSize: '11px', fontFamily: 'inherit', fontWeight: 600, letterSpacing: '0.03em', background: dirty ? 'var(--ims-accent)' : 'var(--ims-border)', color: '#fff', border: 'none', cursor: dirty ? 'pointer' : 'default'}}>{t.status_note_save}</button>
        {justSaved && !dirty && <span style={{fontSize: '11px', color: 'var(--ims-accent-2)', fontWeight: 600}}>✓ {t.status_note_saved}</span>}
      </div>
    </>
  );
}
const localDeliveryStatusLabel = (status, lang = 'id') => {
  if (status === 'delivered_to_rs') return lang === 'id' ? 'Tiba di RS' : 'Arrived at Hospital';
  if (status === 'storing') return lang === 'id' ? 'Storing di Gudang' : 'Warehouse Storage';
  return lang === 'id' ? 'Dalam Pengiriman ke RS' : 'Delivering to Hospital';
};
const getLocalDeliveryDefaults = (project = {}) => {
  const status = project.localDeliveryStatus || (project.shippingStatus === 'client_received' ? 'delivered_to_rs' : 'on_delivery');
  const baseDate = dateOnlyFromValue(project.customsSppbAt || project.goodsSentClientAt || project.localDeliveryStartedAt || project.lastUpdate || new Date().toISOString());
  const dispatchDate = project.localDeliveryDate || addDateOnlyDays(baseDate, project.customsSppbAt ? 1 : 0);
  const eta = project.localEta || addDateOnlyDays(dispatchDate, status === 'delivered_to_rs' ? 1 : 2);
  const vendor = project.localVendor || (status === 'delivered_to_rs' ? 'HNTI Logistics' : '');
  return { localDeliveryStatus: status, localDeliveryDate: dispatchDate, localEta: eta, localVendor: vendor };
};
function EditableLocalDeliveryField({ label, value, onSave, canEdit, placeholder = '' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  useEffect(() => { setDraft(value || ''); }, [value]);
  return (
    <Field label={label}>
      <div style={{display: 'grid', gridTemplateColumns: editing ? '1fr auto auto' : '1fr auto', gap: '6px'}}>
        <input disabled={!canEdit || !editing} value={editing ? draft : (value || '')} onChange={e => setDraft(e.target.value)} placeholder={placeholder} />
        {canEdit && !editing && <button type="button" onClick={() => setEditing(true)} style={{padding: '6px 9px', border: '1px solid var(--ims-border)', background: 'transparent', color: 'var(--ims-accent)', fontSize: '10px', fontWeight: 800, cursor: 'pointer'}}>Edit</button>}
        {canEdit && editing && (
          <>
            <button type="button" onClick={() => { onSave(draft); setEditing(false); }} style={{padding: '6px 9px', border: 'none', background: 'var(--ims-accent-2)', color: '#fff', fontSize: '10px', fontWeight: 800, cursor: 'pointer'}}>Simpan</button>
            <button type="button" onClick={() => { setDraft(value || ''); setEditing(false); }} style={{padding: '6px 8px', border: '1px solid var(--ims-border)', background: 'transparent', color: 'var(--ims-text-2)', fontSize: '10px', fontWeight: 700, cursor: 'pointer'}}>Batal</button>
          </>
        )}
      </div>
    </Field>
  );
}
function OperationsDashboardCharts({ poProjects, visibleManifests, visibleCustomsDocs, localProjects, getEffectiveShipping, avgProductionDays, lang, fmt }) {
  const pipelineData = IMPORT_PIPELINE_STEPS.map(step => ({
    name: lang === 'id' ? step.labelId : step.labelEn,
    value: poProjects.filter(p => getEffectiveShipping(p) === step.id).length,
    fill: step.color,
  }));
  const customsData = ['submitted', 'pib_payment', 'sppb', 'redline', 'rejected'].map(status => ({
    name: status === 'pib_payment' ? 'PIB' : status.toUpperCase(),
    value: visibleCustomsDocs.filter(d => d.status === status).length,
  })).filter(x => x.value > 0);
  const localData = [
    { name: lang === 'id' ? 'Dalam Pengiriman' : 'Delivering', value: localProjects.filter(p => (p.localDeliveryStatus || 'on_delivery') !== 'delivered_to_rs').length },
    { name: lang === 'id' ? 'Tiba di RS' : 'Arrived', value: localProjects.filter(p => p.localDeliveryStatus === 'delivered_to_rs' || p.shippingStatus === 'client_received').length },
  ];
  const monthlyManifest = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map((m, idx) => {
    const key = `${currentYear()}-${String(idx + 1).padStart(2, '0')}`;
    return {
      month: m,
      Manifest: visibleManifests.filter(x => String(x.etd || x.eta || '').startsWith(key)).length,
      SPPB: visibleCustomsDocs.filter(x => x.status === 'sppb' && String(x.statusUpdatedAt || x.docDate || '').startsWith(key)).length,
    };
  });
  return (
    <div style={{display: 'grid', gap: '16px'}}>
      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px'}}>
        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Grafik Pipeline Impor' : 'Import Pipeline Chart'}</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pipelineData} margin={{top: 8, right: 16, left: 0, bottom: 70}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--ims-text-2)" interval={0} angle={-28} textAnchor="end" height={76} style={{fontSize: 10}} />
              <YAxis stroke="var(--ims-text-2)" allowDecimals={false} style={{fontSize: 10}} />
              <Tooltip content={<ChartTooltip fmt={(v) => v} />} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {pipelineData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Status Pengiriman Lokal' : 'Local Delivery Status'}</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={localData} dataKey="value" nameKey="name" outerRadius={92} label>
                {localData.map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[index]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip fmt={(v) => v} />} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Manifest & SPPB Bulanan' : 'Monthly Manifest & SPPB'}</div>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={monthlyManifest} margin={{top: 8, right: 16, left: 0, bottom: 8}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ims-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--ims-text-2)" style={{fontSize: 10}} />
              <YAxis stroke="var(--ims-text-2)" allowDecimals={false} style={{fontSize: 10}} />
              <Tooltip content={<ChartTooltip fmt={(v) => v} />} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
              <Bar dataKey="Manifest" fill="#5b8def" radius={[3, 3, 0, 0]} />
              <Area dataKey="SPPB" fill="#2f8f6f33" stroke="#2f8f6f" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title">{lang === 'id' ? 'Customs Clearance' : 'Customs Clearance'}</div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={customsData.length ? customsData : [{ name: '-', value: 0 }]} dataKey="value" nameKey="name" outerRadius={86} label>
                {(customsData.length ? customsData : [{ name: '-', value: 0 }]).map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[(index + 2) % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip fmt={(v) => v} />} />
              <Legend wrapperStyle={{fontSize: '11px'}} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '4px'}}>{lang === 'id' ? 'Rata-rata produksi' : 'Average production'}: <span className="mono" style={{fontWeight: 800}}>{avgProductionDays}</span> {lang === 'id' ? 'hari' : 'days'} · {fmt ? fmt(poProjects.reduce((sum, p) => sum + (Number(p.totalValue) || 0), 0)) : ''}</div>
        </div>
      </div>
    </div>
  );
}
function OperationsModule({ data, setData, manifests, setManifests, customsDocs, setCustomsDocs, t, lang, canEdit, fmt, session }) {
  const [tab, setTab] = useState('manifest');
  const [productionConfirmId, setProductionConfirmId] = useState(null);
  const [editingProductionId, setEditingProductionId] = useState(null);
  const [productionEditDraft, setProductionEditDraft] = useState({ startAt: '', days: 30 });
  const [opsSearch, setOpsSearch] = useState('');
  const [opsYear, setOpsYear] = useState('all');
  const opsSearchTerm = opsSearch.trim().toLowerCase();
  const opsYears = useMemo(() => {
    const years = new Set();
    data.forEach(s => {
      ['issuedDate', 'dpConfirmedAt', 'factoryProductionStartedAt', 'goodsSentClientAt', 'clientReceivedAt'].forEach(k => {
        if (s?.[k]) years.add(String(s[k]).slice(0, 4));
      });
    });
    manifests.forEach(m => ['etd', 'eta'].forEach(k => { if (m?.[k]) years.add(String(m[k]).slice(0, 4)); }));
    return [...years].filter(Boolean).sort().reverse();
  }, [data, manifests]);
  const matchesOpsProject = (s) => {
    const text = [s.sphNo, s.customer, s.modality, s.subModality, s.productBrand, s.brand, s.principal, s.shippingStatus, s.sphWorkflowStatus].filter(Boolean).join(' ').toLowerCase();
    const matchSearch = !opsSearchTerm || text.includes(opsSearchTerm);
    const matchYear = opsYear === 'all' || ['issuedDate', 'dpConfirmedAt', 'factoryProductionStartedAt', 'goodsSentClientAt', 'clientReceivedAt'].some(k => String(s?.[k] || '').startsWith(opsYear));
    return matchSearch && matchYear;
  };
  const filteredData = useMemo(() => data.filter(matchesOpsProject), [data, opsSearchTerm, opsYear]);
  const visibleManifests = useMemo(() => manifests.filter(m => {
    const linked = data.find(s => manifestMatchesProject(m, s));
    const text = [m.manifestNo, m.customerName, m.sphNo, m.modality, m.typeBrand, m.principal, linked?.customer, linked?.sphNo].filter(Boolean).join(' ').toLowerCase();
    const matchSearch = !opsSearchTerm || text.includes(opsSearchTerm);
    const matchYear = opsYear === 'all' || ['etd', 'eta'].some(k => String(m?.[k] || '').startsWith(opsYear)) || (linked && matchesOpsProject(linked));
    return matchSearch && matchYear;
  }), [manifests, data, opsSearchTerm, opsYear]);
  const visibleCustomsDocs = useMemo(() => customsDocs.filter(d => {
    const linkedManifest = manifests.find(m => m.manifestNo === d.manifestRef || m.id === d.manifestRef || m.manifestNo === d.manifestNo);
    const linked = linkedManifest ? data.find(s => manifestMatchesProject(linkedManifest, s)) : null;
    const text = [d.docNo, d.manifestNo, d.manifestRef, d.customerName, d.sphNo, d.modality, d.typeBrand, d.principal, linked?.customer, linked?.sphNo].filter(Boolean).join(' ').toLowerCase();
    const matchSearch = !opsSearchTerm || text.includes(opsSearchTerm);
    const matchYear = opsYear === 'all' || ['docDate', 'eta', 'statusUpdatedAt'].some(k => String(d?.[k] || '').startsWith(opsYear)) || (linked && matchesOpsProject(linked));
    return matchSearch && matchYear;
  }), [customsDocs, manifests, data, opsSearchTerm, opsYear]);
  // Operations reads every PO whose DP/deposit is received, including completed logistics history.
  const poProjects = useMemo(() => filteredData.filter(s =>
    s.poStatus === 'issued' &&
    projectHasDpReceived(s)
  ), [filteredData]);
  const findManifestForProject = (project) => manifests.find(m => manifestMatchesProject(m, project));
  const localProjects = useMemo(() => filteredData.filter(s =>
    s.poStatus === 'issued' &&
    (s.customsStatus === 'released' || s.customsDocStatus === 'sppb' || s.customsSppbAt || ['sent_client', 'client_received'].includes(s.shippingStatus) || s.localDeliveryStatus ||
      customsDocs.some(d => d.status === 'sppb' && manifestMatchesProject(manifests.find(m => m.manifestNo === d.manifestRef || m.id === d.manifestRef) || { principal: d.principal, manifestNo: d.manifestRef }, s)))
  ), [filteredData, customsDocs, manifests]);
  const totalPoIssued = useMemo(() => filteredData.filter(s => s.poStatus === 'issued').length, [filteredData]);

  // Manifest status → Shipment status mapping (cross-tab link)
  // Build manifest lookup by id for linked SPH
  const manifestById = useMemo(() => new Map(manifests.flatMap(m => [[m.id, m], [m.manifestNo, m]])), [manifests]);

  // For a PO project, determine effective shipping status (synced from manifest if linked)
  const getEffectiveShipping = (p) => {
    const mfst = (p.manifestId && manifestById.get(p.manifestId)) || findManifestForProject(p);
    if (p.localDeliveryStatus === 'delivered_to_rs' || p.clientReceivedAt) return 'client_received';
    if (p.customsDocStatus === 'sppb' || p.customsSppbAt || p.localDeliveryStatus || p.goodsSentClientAt) return 'sent_client';
    const projectStatus = normalizeImportPipelineStatus(p.shippingStatus);
    if (p.shippingStatus && projectStatus !== 'plan_order') return projectStatus;
    if (p.factoryProductionStartedAt && !['ready_to_ship', 'on_shipment', 'arrived_clearance', 'sent_client', 'client_received'].includes(p.shippingStatus)) return 'factory_production';
    if (mfst) return normalizeImportPipelineStatus(mfst.status);
    return projectStatus;
  };
  const getImportStepTimestamp = (p, manifest, stepId) => {
    if (!p) return null;
    const dateOnlyAsIso = (d) => d ? `${d}T09:00:00.000Z` : null;
    if (stepId === 'plan_order') return p.factoryDpPaidAt || p.supplierDpPaidAt || p.manufacturePoCreatedAt || p.dpConfirmedAt || p.dpDecisionAt || manifest?.createdAt || null;
    if (stepId === 'factory_production') return p.factoryProductionStartedAt || null;
    if (stepId === 'ready_to_ship') return p.factoryProductionDoneAt || p.readyToShipAt || null;
    if (stepId === 'on_shipment') return p.shipmentStartedAt || p.importClearanceAt || dateOnlyAsIso(manifest?.etd);
    if (stepId === 'arrived_clearance') return p.arrivedClearanceAt || p.importClearanceAt || dateOnlyAsIso(manifest?.eta);
    if (stepId === 'sent_client') return p.goodsSentClientAt || p.customsSppbAt || p.localDeliveryStartedAt || null;
    if (stepId === 'client_received') return p.clientReceivedAt || null;
    return null;
  };
  const productionProjects = useMemo(() => visibleManifests.map(m => {
    const project = data.find(s => manifestMatchesProject(m, s));
    return { manifest: m, project };
  }), [visibleManifests, data]);

  useEffect(() => {
    const dueProjects = data.filter(s => {
      const info = getFactoryProductionInfo(s);
      return s.factoryProductionStartedAt && info.done && !s.factoryProductionNotifiedAt;
    });
    if (!dueProjects.length) return;
    const nowIso = new Date().toISOString();
    setData(prev => prev.map(s => {
      if (!dueProjects.some(p => p.id === s.id)) return s;
      return {
        ...s,
        factoryProductionDoneAt: s.factoryProductionDoneAt || nowIso,
        factoryProductionNotifiedAt: nowIso,
        sphWorkflowStatus: 'factory_production_done',
        nextAction: 'Operasional lanjut import & clearance',
        stageHistory: [...(s.stageHistory || []), { from: s.sphWorkflowStatus || s.stage, to: 'factory_production_done', by: 'system', at: nowIso }],
      };
    }));
    dueProjects.forEach(p => {
      ['manager_ops', 'gm', 'super_admin', 'finance'].forEach(role => notify({ role }, {
        type: 'factory_production_done',
        message: `Produksi/disiapkan pabrik untuk ${p.customer} sudah mencapai target durasi ${getFactoryProductionInfo(p).days} hari.`,
        link: { view: 'operations', id: p.id },
      }, { username: 'system', role: 'system' }));
    });
  }, [data, setData]);

  useEffect(() => {
    const needsBackfill = data.some(s => {
      const eligible = s.localDeliveryStatus || s.customsSppbAt || s.customsDocStatus === 'sppb' || ['sent_client', 'client_received'].includes(s.shippingStatus);
      if (!eligible) return false;
      const defaults = getLocalDeliveryDefaults(s);
      return !s.localDeliveryDate || !s.localEta || ((s.localDeliveryStatus === 'delivered_to_rs' || s.shippingStatus === 'client_received') && !s.localVendor);
    });
    if (!needsBackfill) return;
    setData(prev => prev.map(s => {
      const eligible = s.localDeliveryStatus || s.customsSppbAt || s.customsDocStatus === 'sppb' || ['sent_client', 'client_received'].includes(s.shippingStatus);
      if (!eligible) return s;
      const defaults = getLocalDeliveryDefaults(s);
      return {
        ...s,
        localDeliveryDate: s.localDeliveryDate || defaults.localDeliveryDate,
        localEta: s.localEta || defaults.localEta,
        localVendor: s.localVendor || defaults.localVendor,
      };
    }));
  }, [data, setData]);

  const startFactoryProduction = (id) => {
    if (!canEdit) return;
    const nowIso = new Date().toISOString();
    let targetProject = null;
    setData(prev => prev.map(s => {
      if (s.id !== id) return s;
      const days = getFactoryProductionDays(s);
      const dueAt = addDaysIso(nowIso, days);
      targetProject = { ...s, factoryProductionDays: days, factoryProductionDueAt: dueAt };
      return {
        ...s,
        shippingStatus: 'factory_production',
        factoryProductionStartedAt: nowIso,
        factoryProductionDays: days,
        factoryProductionDueAt: dueAt,
        sphWorkflowStatus: 'factory_production',
        nextAction: 'Menunggu produksi/disiapkan pabrik selesai',
        stageHistory: [...(s.stageHistory || []), { from: s.sphWorkflowStatus || s.stage, to: 'factory_production', by: session?.username || 'manager_ops', at: nowIso }],
      };
    }));
    if (targetProject) {
      setManifests(prev => prev.map(m => manifestMatchesProject(m, targetProject)
        ? { ...m, status: 'factory_production', productionStartedAt: nowIso, updatedAt: nowIso }
        : m));
    }
    if (targetProject) {
      ['gm', 'super_admin', 'finance'].forEach(role => notify({ role }, {
        type: 'factory_production',
        message: `Produksi/disiapkan pabrik untuk ${targetProject.customer} dimulai. Estimasi ${targetProject.factoryProductionDays} hari.`,
        link: { view: 'operations', id },
      }, { username: session?.username || 'manager_ops', role: session?.role || 'manager_ops' }));
    }
  };
  const openProductionEdit = (p) => {
    const info = getFactoryProductionInfo(p);
    setEditingProductionId(p.id);
    setProductionEditDraft({
      startAt: (info.startAt || new Date().toISOString()).slice(0, 16),
      days: info.days || getFactoryProductionDays(p),
    });
  };
  const saveProductionEdit = (id) => {
    if (!canEdit) return;
    const startAt = productionEditDraft.startAt ? new Date(productionEditDraft.startAt).toISOString() : new Date().toISOString();
    const days = Math.max(1, Number(productionEditDraft.days) || 30);
    const dueAt = addDaysIso(startAt, days);
    let targetProject = null;
    setData(prev => prev.map(s => s.id === id ? {
      ...s,
      shippingStatus: 'factory_production',
      factoryProductionStartedAt: startAt,
      factoryProductionDays: days,
      factoryProductionDueAt: dueAt,
      factoryProductionDoneAt: '',
      factoryProductionNotifiedAt: '',
      sphWorkflowStatus: 'factory_production',
      workflowEvent: 'factory_production_edited',
      nextAction: 'Menunggu produksi/disiapkan pabrik selesai',
      stageHistory: [...(s.stageHistory || []), { from: s.sphWorkflowStatus || s.stage, to: 'factory_production_edited', by: session?.username || 'manager_ops', at: new Date().toISOString() }],
    } : s).map(s => {
      if (s.id === id) targetProject = s;
      return s;
    }));
    if (targetProject) {
      setManifests(prev => prev.map(m => manifestMatchesProject(m, targetProject)
        ? { ...m, status: 'factory_production', productionStartedAt: startAt, updatedAt: new Date().toISOString() }
        : m));
    }
    setEditingProductionId(null);
    showToast(lang === 'id' ? 'Estimasi produksi diperbarui' : 'Production estimate updated', 'success');
  };
  const cancelProduction = (id) => {
    if (!canEdit) return;
    let targetProject = null;
    setData(prev => prev.map(s => s.id === id ? {
      ...s,
      shippingStatus: 'plan_order',
      factoryProductionStartedAt: '',
      factoryProductionDays: getFactoryProductionDays(s),
      factoryProductionDueAt: '',
      factoryProductionDoneAt: '',
      factoryProductionNotifiedAt: '',
      sphWorkflowStatus: 'factory_dp_paid',
      workflowEvent: 'factory_production_cancelled',
      nextAction: 'Operasional klik pesanan dibuat dan mulai produksi/disiapkan pabrik',
      stageHistory: [...(s.stageHistory || []), { from: s.sphWorkflowStatus || s.stage, to: 'factory_production_cancelled', by: session?.username || 'manager_ops', at: new Date().toISOString() }],
    } : s).map(s => {
      if (s.id === id) targetProject = s;
      return s;
    }));
    if (targetProject) {
      setManifests(prev => prev.map(m => manifestMatchesProject(m, targetProject)
        ? { ...m, status: 'plan_order', productionStartedAt: '', updatedAt: new Date().toISOString() }
        : m));
    }
    showToast(lang === 'id' ? 'Proses produksi dibatalkan' : 'Production process cancelled', 'warning');
  };

  const updateShipping = (id, status) => {
    if (!canEdit) return;
    if (status === 'factory_production') {
      setProductionConfirmId(id);
      return;
    }
    const localDefaults = getLocalDeliveryDefaults({ ...data.find(s => s.id === id), localDeliveryStatus: status === 'client_received' ? 'delivered_to_rs' : 'on_delivery', goodsSentClientAt: new Date().toISOString() });
    const extra = status === 'on_shipment' ? { sphWorkflowStatus: 'import_clearance', importClearanceAt: new Date().toISOString(), nextAction: 'Operasional mengatur import/clearance' }
      : status === 'sent_client' ? { sphWorkflowStatus: 'goods_sent_client', goodsSentClientAt: new Date().toISOString(), technicianNotifiedAt: new Date().toISOString(), localDeliveryStatus: 'on_delivery', localDeliveryDate: localDefaults.localDeliveryDate, localEta: localDefaults.localEta, nextAction: 'Teknisi menunggu barang diterima klien' }
      : status === 'client_received' ? { sphWorkflowStatus: 'goods_received_client', clientReceivedAt: new Date().toISOString(), localDeliveryStatus: 'delivered_to_rs', localDeliveryDate: localDefaults.localDeliveryDate, localEta: localDefaults.localEta, localVendor: localDefaults.localVendor || 'HNTI Logistics', nextAction: 'Teknisi atur jadwal instalasi' }
      : {};
    setData(prev => prev.map(s => s.id === id ? { ...s, shippingStatus: status, ...extra } : s));
    if (status === 'sent_client' || status === 'client_received') {
      notify({ role: 'technician' }, { type: 'install_pending', message: 'Barang sudah dikirim ke klien. Teknisi perlu mengatur jadwal instalasi.', link: { view: 'installation', id } });
    }
  };
  const updateCustoms = (id, status) => {
    if (!canEdit) return;
    // If switching to hold, keep existing note; UI will prompt for note
    const extra = status === 'ongoing' ? { sphWorkflowStatus: 'import_clearance', importClearanceAt: new Date().toISOString() }
      : status === 'released' ? { importClearanceAt: new Date().toISOString(), nextAction: 'Operasional kirim barang ke klien' }
      : {};
    setData(prev => prev.map(s => s.id === id ? { ...s, customsStatus: status, ...extra } : s));
  };
  const updateStatusNote = (id, note) => {
    if (!canEdit) return;
    setData(prev => prev.map(s => s.id === id ? { ...s, customsStatusNote: note } : s));
  };
  const saveStatusNote = (id, note) => {
    if (!canEdit) return;
    setData(prev => prev.map(s => s.id === id ? { ...s, customsStatusNote: note } : s));
    flushPersist();
    showToast(lang === 'id' ? 'Alasan status bea cukai tersimpan' : 'Customs status reason saved', 'success');
  };
  const linkManifest = (id, manifestId) => {
    if (!canEdit) return;
    setData(prev => prev.map(s => s.id === id ? { ...s, manifestId: manifestId || null } : s));
  };
  const updateLocalDelivery = (id, patch) => {
    if (!canEdit) return;
    const nowIso = new Date().toISOString();
    const current = data.find(s => s.id === id) || {};
    const defaults = getLocalDeliveryDefaults({ ...current, ...patch });
    const received = patch.localDeliveryStatus === 'delivered_to_rs';
    const extra = patch.localDeliveryStatus || patch.localEta ? {
      sphWorkflowStatus: received ? 'goods_received_client' : 'goods_sent_client',
      goodsSentClientAt: current.goodsSentClientAt || nowIso,
      ...(received ? { clientReceivedAt: nowIso, shippingStatus: 'client_received' } : { shippingStatus: 'sent_client' }),
      ...(patch.localDeliveryStatus ? { localDeliveryStartedAt: current.localDeliveryStartedAt || nowIso, localDeliveryDate: patch.localDeliveryDate || current.localDeliveryDate || defaults.localDeliveryDate, localEta: patch.localEta || current.localEta || defaults.localEta, localVendor: patch.localVendor || current.localVendor || defaults.localVendor } : {}),
      technicianNotifiedAt: nowIso,
      nextAction: received ? 'Teknisi atur jadwal instalasi' : 'Menunggu barang diterima klien',
    } : {};
    setData(prev => prev.map(s => s.id === id ? { ...s, ...patch, ...extra } : s));
    if (patch.localEta) {
      const eta = new Date(patch.localEta);
      const days = Math.ceil((eta - new Date()) / 86400000);
      if (!isNaN(days) && days <= 2) {
        notify({ role: 'technician' }, {
          type: 'install_pending',
          message: `Barang proyek akan tiba di RS sekitar ${patch.localEta}. Tim teknisi perlu persiapan instalasi.`,
          link: { view: 'installation', id },
        });
      }
    }
  };

  const shippingSteps = useMemo(() => [
    ...IMPORT_PIPELINE_STEPS.map(s => ({ id: s.id, label: lang === 'id' ? s.labelId : s.labelEn, color: s.color })),
  ], [t, lang]);

  const opsStats = useMemo(() => {
    const productionActive = poProjects.filter(p => getEffectiveShipping(p) === 'factory_production').length;
    const factoryOrdered = poProjects.filter(p => getEffectiveShipping(p) === 'plan_order').length;
    const inTransitCount = visibleManifests.filter(m => normalizeImportPipelineStatus(m.status) === 'on_shipment').length;
    const arrivedJakarta = visibleManifests.filter(m => {
      const linkedDocs = customsDocs.filter(d => d.manifestRef === m.manifestNo || d.manifestRef === m.id);
      return normalizeImportPipelineStatus(m.status) === 'arrived_clearance' || linkedDocs.some(d => ['pib_payment', 'redline', 'rejected'].includes(d.status));
    }).length;
    const clientDelivery = localProjects.filter(p => getEffectiveShipping(p) === 'sent_client').length;
    const clientReceived = poProjects.filter(p => getEffectiveShipping(p) === 'client_received').length;
    return {
      factoryOrdered,
      productionActive,
      totalManifests: visibleManifests.length,
      inTransit: inTransitCount,
      arrivedJakarta,
      clientDelivery,
      clientReceived,
    };
  }, [poProjects, visibleManifests, customsDocs, localProjects]);
  const { factoryOrdered, productionActive, totalManifests, inTransit, arrivedJakarta, clientDelivery, clientReceived } = opsStats;
  const opsHistoryRows = useMemo(() => poProjects.flatMap(p => (Array.isArray(p.stageHistory) ? p.stageHistory : []).map(h => ({ ...h, project: p })))
    .sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')))
    .slice(0, 8), [poProjects]);
  const avgProductionDays = useMemo(() => {
    const rows = poProjects.filter(p => p.factoryProductionStartedAt);
    if (!rows.length) return 0;
    return Math.round(rows.reduce((sum, p) => sum + (Number(p.factoryProductionDays) || getFactoryProductionDays(p)), 0) / rows.length);
  }, [poProjects]);

  return (
    <div>
      <div style={{marginBottom: '22px'}}>
        <div style={{fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px'}}>{t.nav_operations}</div>
        <h1 className="serif hero-title" style={{fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1}}>{t.operations_title}</h1>
        <div style={{fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px'}}>{t.operations_subtitle}</div>
      </div>
      {!canEdit && <ReadOnlyBanner t={t} />}

      <div style={{display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '18px'}}>
        <div style={{position: 'relative', flex: '1 1 280px', minWidth: '220px'}}>
          <Search size={14} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ims-text-2)'}} />
          <input value={opsSearch} onChange={e => setOpsSearch(e.target.value)} placeholder={lang === 'id' ? 'Cari RS, SPH, modalitas, manifest...' : 'Search customer, SPH, modality, manifest...'} style={{paddingLeft: '36px'}} />
        </div>
        <select value={opsYear} onChange={e => setOpsYear(e.target.value)} style={{width: '150px'}}>
          <option value="all">{lang === 'id' ? 'Semua Tahun' : 'All Years'}</option>
          {opsYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="kpi-grid-4" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1px', background: 'var(--ims-border)', marginBottom: '22px', border: '1px solid var(--ims-border)'}}>
        <div className="card-pad">
          <div className="lbl-tag">{t.ops_po_in_shipping}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{factoryOrdered}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? `dari ${totalPoIssued} PO terbit` : `of ${totalPoIssued} issued PO`}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{t.ops_production_process}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#a026a0'}}>{productionActive}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'sedang diproduksi/disiapkan pabrik' : 'in factory production/preparation'}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{t.ops_total_manifests}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px'}}>{totalManifests}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'manifest pengapalan aktif' : 'active shipment manifests'}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{t.ops_in_transit}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent)'}}>{inTransit}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{t.ops_arrived_jakarta}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: '#5b87b8'}}>{arrivedJakarta}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'tiba di Jakarta / proses Bea Cukai' : 'arrived Jakarta / customs process'}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{t.ops_client_delivery}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent-2)'}}>{clientDelivery}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>SPPB / {lang === 'id' ? 'pengiriman lokal' : 'local delivery'}</div>
        </div>
        <div className="card-pad">
          <div className="lbl-tag">{lang === 'id' ? 'Diterima Klien' : 'Client Received'}</div>
          <div className="serif" style={{fontSize: '26px', fontWeight: 500, marginTop: '4px', color: 'var(--ims-accent)'}}>{clientReceived}</div>
          <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{lang === 'id' ? 'barang sudah diterima RS/klien' : 'items received by client'}</div>
        </div>
      </div>

      <div style={{display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap'}}>
        {[
          { id: 'dashboard', label: lang === 'id' ? 'Dashboard' : 'Dashboard', icon: Activity },
          { id: 'manifest', label: t.ops_tab_manifest, icon: Briefcase },
          { id: 'production', label: t.ops_tab_production, icon: Wrench },
          { id: 'customs', label: t.ops_tab_customs, icon: FileText },
          { id: 'local', label: t.ops_tab_local, icon: Truck },
          { id: 'shipment', label: t.ops_tab_shipment, icon: Truck },
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

      {tab === 'dashboard' && (
        <OperationsDashboardCharts
          poProjects={poProjects}
          visibleManifests={visibleManifests}
          visibleCustomsDocs={visibleCustomsDocs}
          localProjects={localProjects}
          getEffectiveShipping={getEffectiveShipping}
          avgProductionDays={avgProductionDays}
          lang={lang}
          fmt={fmt}
        />
      )}

      {tab === 'production' && (
        <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
          <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)'}}>
            <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.ops_tab_production}</div>
          </div>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '980px'}}>
            <thead>
              <tr style={{background: 'var(--ims-bg-card-2)'}}>
                <Th>{t.ops_manifest_no}</Th>
                <Th>{t.ops_customer_name}</Th>
                <Th>{t.ops_sph_no}</Th>
                <Th>{t.ops_modality}</Th>
                <Th>{t.ops_type_brand}</Th>
                <Th>Principal</Th>
                <Th>{t.ops_vessel}</Th>
                <Th>{lang === 'id' ? 'Estimasi Produksi' : 'Production Estimate'}</Th>
                {canEdit && <Th align="right">{t.crud_actions}</Th>}
              </tr>
            </thead>
            <tbody>
              {productionProjects.map(({ manifest, project }) => {
                const p = project;
                const info = p ? getFactoryProductionInfo(p) : {};
                const editing = p && editingProductionId === p.id;
                return (
                  <tr key={manifest.id} style={{borderTop: '1px solid var(--ims-border)'}}>
                    <Td><span className="mono" style={{fontWeight: 800}}>{manifest.manifestNo}</span></Td>
                    <Td>{manifest.customerName || p?.customer || '-'}</Td>
                    <Td><span className="mono">{manifest.sphNo || p?.sphNo || '-'}</span></Td>
                    <Td>{manifest.modality || p?.modality || p?.productModality || '-'}</Td>
                    <Td>{manifest.typeBrand || [p?.subModality || p?.productType || p?.type, p?.productBrand || p?.brand].filter(Boolean).join(' / ') || '-'}</Td>
                    <Td>{manifest.principal || p?.principal || p?.productBrand || p?.brand || '-'}</Td>
                    <Td>{manifest.shippingMode === 'air' ? 'Udara' : manifest.shippingMode === 'sea' ? 'Laut' : '-'}</Td>
                    <Td>
                      {!p ? (
                        <span style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>{lang === 'id' ? 'Belum terhubung ke SPH DP diterima' : 'Not linked to a DP-received SPH'}</span>
                      ) : editing ? (
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 84px', gap: '6px', minWidth: '260px'}}>
                          <input type="datetime-local" value={productionEditDraft.startAt} onChange={e => setProductionEditDraft(prev => ({ ...prev, startAt: e.target.value }))} />
                          <input type="number" min="1" value={productionEditDraft.days} onChange={e => setProductionEditDraft(prev => ({ ...prev, days: e.target.value }))} />
                          <button onClick={() => saveProductionEdit(p.id)} style={{background: 'var(--ims-accent-2)', color: '#fff', border: 'none', padding: '5px 8px', fontSize: '10px', cursor: 'pointer', fontWeight: 800}}>{t.crud_save}</button>
                          <button onClick={() => setEditingProductionId(null)} style={{background: 'transparent', color: 'var(--ims-text-2)', border: '1px solid var(--ims-border)', padding: '5px 8px', fontSize: '10px', cursor: 'pointer', fontWeight: 700}}>{t.crud_cancel}</button>
                        </div>
                      ) : (
                        <>
                          <div className="mono" style={{fontWeight: 800}}>{info.days} {lang === 'id' ? 'hari' : 'days'}</div>
                          <div style={{fontSize: '10px', color: info.done ? 'var(--ims-accent-2)' : '#a026a0', marginTop: '2px'}}>
                            {info.dueAt ? `${lang === 'id' ? 'Estimasi' : 'ETA'}: ${formatDateTime(info.dueAt, lang)}` : '-'}
                          </div>
                          {!info.done && <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{Math.max(info.remainingDays || 0, 0)} {lang === 'id' ? 'hari tersisa' : 'days left'}</div>}
                        </>
                      )}
                    </Td>
                    {canEdit && (
                      <Td align="right">
                        {p && !info.startAt && (
                          <button onClick={() => setProductionConfirmId(p.id)} style={{background: '#a026a0', color: '#fff', border: 'none', padding: '5px 8px', fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, marginRight: '4px'}}>{lang === 'id' ? 'Mulai Produksi' : 'Start Production'}</button>
                        )}
                        {p && info.startAt && (
                          <>
                            <button onClick={() => openProductionEdit(p)} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '5px 8px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-accent)', fontFamily: 'inherit', marginRight: '4px'}}>{lang === 'id' ? 'Edit' : 'Edit'}</button>
                            <button onClick={() => cancelProduction(p.id)} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '5px 8px', fontSize: '10px', cursor: 'pointer', color: '#c03030', fontFamily: 'inherit'}}>{lang === 'id' ? 'Batalkan' : 'Cancel'}</button>
                          </>
                        )}
                        {!p && <span style={{fontSize: '10px', color: 'var(--ims-text-2)'}}>-</span>}
                      </Td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {productionProjects.length === 0 && <div className="empty-state">{lang === 'id' ? 'Belum ada manifest pengiriman.' : 'No shipping manifests yet.'}</div>}
        </div>
      )}

      {tab === 'shipment' && (
        <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
          {poProjects.map(p => {
            const effectiveShipping = getEffectiveShipping(p);
            const linkedManifest = (p.manifestId && manifestById.get(p.manifestId)) || findManifestForProject(p);
            const isSynced = !!linkedManifest;
            const productionInfo = getFactoryProductionInfo(p);
            return (
            <div key={p.id} style={{padding: '18px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '10px'}}>
                <div>
                  <div style={{fontSize: '14px', fontWeight: 600}}>{p.customer}</div>
                  <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{p.subModality} · Qty {p.qty} · <span className="mono">{p.sphNo}</span></div>
                </div>
                <div className="mono" style={{fontSize: '14px', fontWeight: 500}}>{fmt(p.totalValue)}</div>
              </div>

              {linkedManifest && (
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--ims-text-2)'}}>
                  <span style={{padding: '2px 8px', fontSize: '9px', background: 'var(--ims-accent-2)20', color: 'var(--ims-accent-2)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', borderRadius: '3px'}}>🔗 {t.shipment_auto_synced}</span>
                  <span>{linkedManifest.manifestNo} · {linkedManifest.principal} · {importPipelineLabel(linkedManifest.status, lang)}</span>
                </div>
              )}

              <div style={{display: 'flex', gap: '0', marginBottom: '14px'}}>
                {shippingSteps.map((step, i) => {
                  const isActive = effectiveShipping === step.id;
                  const stepIdx = shippingSteps.findIndex(s => s.id === effectiveShipping);
                  const isPast = stepIdx > i;
                  const stamp = getImportStepTimestamp(p, linkedManifest, step.id);
                  return (
                    <button key={step.id} disabled title={isSynced ? t.shipment_auto_synced : ''} style={{flex: 1, minHeight: '54px', padding: '8px 6px', fontSize: '9px', fontWeight: 600, letterSpacing: '0.05em', background: isActive ? step.color : isPast ? step.color + '40' : 'transparent', color: isActive ? '#fff' : isPast ? step.color : 'var(--ims-text-2)', border: `1px solid ${isActive || isPast ? step.color : 'var(--ims-border)'}`, cursor: 'default', fontFamily: 'inherit', textTransform: 'uppercase', opacity: isSynced && !isActive && !isPast ? 0.6 : 1}}>
                      <span style={{display: 'block', lineHeight: 1.25}}>{step.label}</span>
                      <span className="mono" style={{display: 'block', marginTop: '5px', fontSize: '8px', letterSpacing: 0, textTransform: 'none', color: isActive ? 'rgba(255,255,255,0.82)' : isPast ? step.color : 'var(--ims-text-2)'}}>
                        {stamp ? formatDateTime(stamp, lang) : '-'}
                      </span>
                    </button>
                  );
                })}
              </div>
              {/* Status Note - especially important for "hold" */}
              {(p.customsStatus === 'hold' || p.customsStatusNote) && (
                <div style={{marginTop: '12px', padding: '10px 12px', background: p.customsStatus === 'hold' ? '#8b3a3a10' : 'var(--ims-text)', borderLeft: `3px solid ${p.customsStatus === 'hold' ? '#8b3a3a' : 'var(--ims-gold)'}`}}>
                  <div style={{fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: p.customsStatus === 'hold' ? '#8b3a3a' : 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>
                    {t.status_note_label} {p.customsStatus === 'hold' && <span style={{color: '#c03030'}}>* {t.status_note_hold_required}</span>}
                  </div>
                  {canEdit ? (
                    <CustomsNoteEditor value={p.customsStatusNote} isHold={p.customsStatus === 'hold'} onSave={note => saveStatusNote(p.id, note)} t={t} lang={lang} />
                  ) : (
                    <div style={{fontSize: '12px', color: 'var(--ims-text)', fontStyle: p.customsStatusNote ? 'normal' : 'italic'}}>{p.customsStatusNote || t.status_note_empty}</div>
                  )}
                </div>
              )}
            </div>
            );
          })}
          {poProjects.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: 'var(--ims-text-2)', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>{t.no_data}</div>}
        </div>
      )}

      {tab === 'manifest' && <ManifestList manifests={visibleManifests} setManifests={setManifests} data={data} setData={setData} t={t} lang={lang} canEdit={canEdit} fmt={fmt} />}
      {tab === 'customs' && <CustomsDocsList customsDocs={visibleCustomsDocs} setCustomsDocs={setCustomsDocs} manifests={visibleManifests} setManifests={setManifests} data={data} setData={setData} t={t} lang={lang} canEdit={canEdit} session={session} />}
      {tab === 'local' && (
        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
          {localProjects.map(p => {
            const defaults = getLocalDeliveryDefaults(p);
            const statusLabel = localDeliveryStatusLabel(p.localDeliveryStatus || defaults.localDeliveryStatus, lang);
            const statusColor = p.localDeliveryStatus === 'storing' ? '#1a4d8a' : (p.localDeliveryStatus === 'delivered_to_rs' || p.shippingStatus === 'client_received' ? 'var(--ims-accent)' : 'var(--ims-accent-2)');
            return (
            <div key={p.id} style={{padding: '16px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '12px'}}>
                <div>
                  <div style={{fontWeight: 700, fontSize: '14px'}}>{p.customer}</div>
                  <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{p.subModality} · <span className="mono">{p.sphNo}</span></div>
                </div>
                <span style={{padding: '4px 10px', fontSize: '10px', background: statusColor + '25', color: statusColor, fontWeight: 700}}>
                  {statusLabel.toUpperCase()}
                </span>
              </div>
              <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginBottom: '10px'}}>
                {lang === 'id' ? 'Update status' : 'Status update'}: <span className="mono">{formatDateTime(p.localDeliveryStartedAt || p.customsSppbAt || p.goodsSentClientAt || p.lastUpdate, lang)}</span>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, minmax(160px, 1fr))', gap: '10px'}}>
                <Field label={lang === 'id' ? 'Status Lokal' : 'Local Status'}>
                  <select disabled={!canEdit} value={p.localDeliveryStatus || 'on_delivery'} onChange={e => updateLocalDelivery(p.id, { localDeliveryStatus: e.target.value, sphWorkflowStatus: 'local_delivery', workflowEvent: 'local_delivery' })}>
                    <option value="on_delivery">{lang === 'id' ? 'Dalam pengiriman ke RS' : 'Delivering to hospital'}</option>
                    <option value="storing">Storing di gudang</option>
                    <option value="delivered_to_rs">Tiba di RS</option>
                  </select>
                </Field>
                <Field label={lang === 'id' ? 'Pengiriman ke RS' : 'Dispatch to Hospital'}><input disabled={!canEdit} type="date" value={p.localDeliveryDate || defaults.localDeliveryDate || ''} onChange={e => updateLocalDelivery(p.id, { localDeliveryDate: e.target.value })} /></Field>
                <Field label="ETA RS"><input disabled={!canEdit} type="date" value={p.localEta || defaults.localEta || ''} onChange={e => updateLocalDelivery(p.id, { localEta: e.target.value })} /></Field>
                <EditableLocalDeliveryField label={lang === 'id' ? 'Vendor Trucking' : 'Trucking Vendor'} value={p.localVendor || defaults.localVendor || ''} canEdit={canEdit} onSave={(value) => updateLocalDelivery(p.id, { localVendor: value })} />
                <EditableLocalDeliveryField label={lang === 'id' ? 'Link Lampiran' : 'Attachment Link'} value={p.localAttachmentUrl || ''} canEdit={canEdit} onSave={(value) => updateLocalDelivery(p.id, { localAttachmentUrl: value })} placeholder="https://drive.google.com/..." />
              </div>
              {p.localNotes && <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '8px'}}>{p.localNotes}</div>}
            </div>
          );})}
          {localProjects.length === 0 && <div className="empty-state">{lang === 'id' ? 'Belum ada barang SPPB / pengiriman lokal' : 'No SPPB / local delivery items yet'}</div>}
        </div>
      )}
      <ConfirmDialog
        open={!!productionConfirmId}
        title={lang === 'id' ? 'Mulai proses produksi?' : 'Start production process?'}
        message={lang === 'id' ? 'Tanggal dan jam saat ini akan dipakai sebagai awal hitung mundur durasi produksi. Lanjutkan?' : 'The current date and time will be used as the production countdown start. Continue?'}
        confirmText={lang === 'id' ? 'Ya, Mulai Produksi' : 'Yes, Start Production'}
        onConfirm={() => { startFactoryProduction(productionConfirmId); setProductionConfirmId(null); }}
        onCancel={() => setProductionConfirmId(null)}
        lang={lang}
      />
    </div>
  );
}
function ManifestList({ manifests, setManifests, data, setData, t, lang, canEdit, fmt }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [sortBy, setSortBy] = useState('date_desc');
  const statusColors = {
    plan_order: '#94a3b8', factory_production: '#a026a0', ready_to_ship: '#7d9cc5',
    on_shipment: 'var(--ims-gold)', arrived_clearance: '#5b87b8',
    sent_client: '#2f8f6f', client_received: 'var(--ims-accent-2)',
  };

  const handleSave = (rec) => {
    const final = { ...rec, status: normalizeImportPipelineStatus(rec.status) };
    setManifests(prev => {
      const exists = prev.find(r => r.id === final.id);
      return exists ? prev.map(r => r.id === final.id ? final : r) : [...prev, final];
    });
    if (final.linkedProjectId || final.sphNo) {
      const normalized = normalizeImportPipelineStatus(final.status);
      const nowIso = new Date().toISOString();
      setData(prev => prev.map(s => (final.linkedProjectId && s.id === final.linkedProjectId) || (final.sphNo && s.sphNo === final.sphNo)
        ? {
          ...s,
          manifestId: final.id,
          shippingStatus: normalized,
          ...(normalized === 'on_shipment' ? { sphWorkflowStatus: 'import_clearance', importClearanceAt: s.importClearanceAt || nowIso } : {}),
          ...(normalized === 'sent_client' ? { sphWorkflowStatus: 'goods_sent_client', goodsSentClientAt: s.goodsSentClientAt || nowIso, localDeliveryStatus: s.localDeliveryStatus || 'on_delivery', localDeliveryStartedAt: s.localDeliveryStartedAt || nowIso } : {}),
          ...(normalized === 'client_received' ? { sphWorkflowStatus: 'goods_received_client', clientReceivedAt: s.clientReceivedAt || nowIso, localDeliveryStatus: 'delivered_to_rs' } : {}),
        }
        : s));
    }
    setModalOpen(false); setEditingRecord(null);
  };
  const [deleteId, setDeleteId] = useState(null);
  const handleDelete = (id) => {
    if (!canEdit) return;
    setDeleteId(id);
  };
  const confirmDelete = () => {
    setManifests(prev => prev.filter(r => r.id !== deleteId));
    setDeleteId(null);
  };

  const sortedManifests = useMemo(() => {
    const arr = [...manifests];
    if (sortBy === 'date_desc') return arr.sort((a, b) => (b.etd || '').localeCompare(a.etd || ''));
    if (sortBy === 'date_asc') return arr.sort((a, b) => (a.etd || '').localeCompare(b.etd || ''));
    if (sortBy === 'value_desc') return arr.sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0));
    if (sortBy === 'status') return arr.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    return arr;
  }, [manifests, sortBy]);

  return (
    <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
      <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
        <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.ops_tab_manifest}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <SortToggle value={sortBy} onChange={setSortBy} lang={lang} options={[{value: 'date_desc', label: lang === 'id' ? 'Terbaru' : 'Newest'}, {value: 'date_asc', label: lang === 'id' ? 'Terlama' : 'Oldest'}, {value: 'value_desc', label: lang === 'id' ? 'Nilai Tertinggi' : 'Highest Value'}, {value: 'status', label: lang === 'id' ? 'Status' : 'Status'}]} />
          {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
        </div>
      </div>
      <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '1100px'}}>
        <thead>
          <tr style={{background: 'var(--ims-bg-card-2)'}}>
            <Th>{t.ops_manifest_no}</Th>
            <Th>{t.ops_customer_name}</Th>
            <Th>{t.ops_sph_no}</Th>
            <Th>{t.ops_modality}</Th>
            <Th>{t.ops_type_brand}</Th>
            <Th>Principal</Th>
            <Th>{t.ops_vessel}</Th>
            <Th>ETD</Th>
            <Th>ETA</Th>
            <Th>{t.ops_manifest_status}</Th>
            {canEdit && <Th align="right">{t.crud_actions}</Th>}
          </tr>
        </thead>
        <tbody>
      {sortedManifests.map(m => {
        const normalizedStatus = normalizeImportPipelineStatus(m.status);
        const linked = (data || []).find(s => manifestMatchesProject(m, s));
        const statusColor = statusColors[normalizedStatus] || 'var(--ims-text-2)';
        const principalColor = m.principal === 'SG Healthcare' ? '#1a4d8a' : m.principal === 'ANKE' ? '#c03030' : m.principal === 'Hyde Medical' ? '#7b3fb5' : m.principal === 'SINO MDT' ? '#d4780a' : m.principal === 'Angell' ? '#0f7a5a' : '#b8860b';
        return (
          <tr key={m.id} style={{borderTop: '1px solid var(--ims-border)'}}>
            <Td>
              <span className="mono" style={{fontWeight: 800}}>{m.manifestNo}</span>
              {m.notes && <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '3px', fontStyle: 'italic'}}>{m.notes}</div>}
            </Td>
            <Td>{m.customerName || linked?.customer || '-'}</Td>
            <Td><span className="mono">{m.sphNo || linked?.sphNo || '-'}</span></Td>
            <Td>{m.modality || linked?.modality || linked?.productModality || '-'}</Td>
            <Td>{m.typeBrand || [linked?.subModality || linked?.productType || linked?.type, linked?.productBrand || linked?.brand].filter(Boolean).join(' / ') || '-'}</Td>
            <Td>
              <span style={{padding: '2px 8px', background: principalColor + '20', color: principalColor, fontSize: '10px', fontWeight: 700}}>{m.principal || '-'}</span>
              {m.principalOrigin && <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '3px'}}>{m.principalOrigin}</div>}
            </Td>
            <Td>{m.shippingMode === 'air' ? 'Udara' : m.shippingMode === 'sea' ? 'Laut' : '-'}</Td>
            <Td><span className="mono">{m.etd || '-'}</span></Td>
            <Td><span className="mono">{m.eta || '-'}</span></Td>
            <Td><span style={{padding: '3px 8px', fontSize: '10px', background: statusColor + '25', color: statusColor, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{importPipelineLabel(normalizedStatus, lang)}</span></Td>
            {canEdit && (
              <Td align="right">
                <div style={{display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap'}}>
                  <button onClick={() => { setEditingRecord(m); setModalOpen(true); }} className="btn-ghost" style={{fontSize: '10px'}} title={t.crud_edit || 'Edit'}><Edit2 size={12} />Edit</button>
                  <button onClick={() => handleDelete(m.id)} className="btn-ghost" style={{fontSize: '10px', color: '#c03030'}} title={t.crud_delete || 'Hapus'}><Trash2 size={12} />Hapus</button>
                </div>
              </Td>
            )}
          </tr>
        );
      })}
        </tbody>
      </table>
      {manifests.length === 0 && <div className="empty-state">{t.no_data}</div>}
      {modalOpen && <ManifestModal record={editingRecord} data={data} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} />}
      <ConfirmDialog open={!!deleteId} title={lang === 'id' ? 'Hapus Manifest?' : 'Delete Manifest?'} message={lang === 'id' ? 'Yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to delete this record? This action cannot be undone.'} onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} danger lang={lang} />
    </div>
  );
}
function CustomsDocsList({ customsDocs, setCustomsDocs, manifests, setManifests, data, setData, t, lang, canEdit, session }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [sortBy, setSortBy] = useState('date_desc');
  const statusColors = { received: '#94a3b8', submitted: 'var(--ims-gold)', approved: 'var(--ims-accent-2)', rejected: '#c03030', redline: '#d97706', pib_payment: '#7b3fb5', sppb: 'var(--ims-accent-2)' };

  const handleSave = (rec) => {
    const nowIso = new Date().toISOString();
    const previous = customsDocs.find(r => r.id === rec.id);
    const final = {
      ...rec,
      updatedAt: nowIso,
      statusUpdatedAt: previous?.status === rec.status ? (rec.statusUpdatedAt || previous?.statusUpdatedAt || nowIso) : nowIso,
    };
    setCustomsDocs(prev => {
      const exists = prev.find(r => r.id === final.id);
      return exists ? prev.map(r => r.id === final.id ? final : r) : [...prev, final];
    });
    const manifest = manifests.find(m => m.manifestNo === final.manifestRef || m.id === final.manifestRef);
    const matchesCustomsProject = (s) => {
      if (final.linkedProjectId && s.id === final.linkedProjectId) return true;
      if (final.sphNo && s.sphNo === final.sphNo) return true;
      if (manifest && (s.manifestId === manifest.id || s.manifestId === manifest.manifestNo)) return true;
      if (manifest && manifestMatchesProject(manifest, s)) return true;
      const principal = normalizeProductLookupText((manifest?.principal || final.principal || ''));
      const projectText = normalizeProductLookupText([
        s.productBrand, s.brand, s.principal, s.modality, s.subModality, s.productType, s.customer, s.sphNo,
      ].filter(Boolean).join(' '));
      return !!(principal && projectText.includes(principal));
    };
    if (final.status === 'pib_payment') {
      setData(prev => prev.map(s => matchesCustomsProject(s) ? {
        ...s,
        pibAmount: Number(final.pibAmount) || Number(s.pibAmount) || 0,
        pibPaymentStatus: 'requested',
        pibPaymentRequestedAt: nowIso,
        workflowEvent: 'pib_payment_requested',
        nextAction: 'Finance melakukan pembayaran PIB',
      } : s));
      ['finance', 'gm', 'super_admin'].forEach(role => notify({ role }, {
        type: 'pib_payment_requested',
        message: `Pembayaran PIB ${final.poNo || final.docNo || ''} perlu diproses${final.pibAmount ? ` senilai ${Number(final.pibAmount).toLocaleString('id-ID')}` : ''}.`,
        link: { view: 'finance' },
      }, { username: session?.username || 'operations', role: session?.role || 'operations' }));
    }
    if (final.status === 'sppb') {
      const localDeliveryDate = addDateOnlyDays(nowIso, 1);
      const localEta = addDateOnlyDays(localDeliveryDate, 2);
      setManifests(prev => prev.map(m => (m.manifestNo === final.manifestRef || m.id === final.manifestRef || m.manifestNo === final.manifestNo || m.id === final.manifestId)
        ? { ...m, status: 'sent_client' }
        : m));
      setData(prev => prev.map(s => {
        if (!matchesCustomsProject(s)) return s;
        return {
          ...s,
          customsStatus: 'released',
          customsDocStatus: 'sppb',
          customsSppbAt: nowIso,
          localDeliveryStatus: s.localDeliveryStatus || 'on_delivery',
          localDeliveryStartedAt: s.localDeliveryStartedAt || nowIso,
          localDeliveryDate: s.localDeliveryDate || localDeliveryDate,
          localEta: s.localEta || localEta,
          shippingStatus: 'sent_client',
          goodsSentClientAt: s.goodsSentClientAt || nowIso,
          technicianNotifiedAt: s.technicianNotifiedAt || nowIso,
          sphWorkflowStatus: 'goods_sent_client',
          nextAction: 'Menunggu barang diterima klien sebelum jadwal instalasi',
          stageHistory: [...(s.stageHistory || []), { from: s.sphWorkflowStatus || s.stage, to: 'customs_sppb', by: session?.username || 'operations', at: nowIso }],
        };
      }));
      notify({ role: 'manager_ops' }, { type: 'customs_sppb', message: `SPPB ${final.poNo || final.docNo || ''} terbit. Pengiriman lokal ke RS otomatis berjalan.`, link: { view: 'operations' } }, { username: session?.username || 'operations', role: session?.role || 'operations' });
    }
    setModalOpen(false); setEditingRecord(null);
  };
  const [deleteId, setDeleteId] = useState(null);
  const handleDelete = (id) => {
    if (!canEdit) return;
    setDeleteId(id);
  };
  const confirmDelete = () => {
    setCustomsDocs(prev => prev.filter(r => r.id !== deleteId));
    setDeleteId(null);
  };

  const sortedDocs = useMemo(() => {
    const manifestRows = (manifests || []).map(m => {
      const docs = (customsDocs || []).filter(d => d.manifestRef === m.manifestNo || d.manifestRef === m.id || d.manifestNo === m.manifestNo);
      const latest = [...docs].sort((a, b) => (b.statusUpdatedAt || b.updatedAt || b.docDate || '').localeCompare(a.statusUpdatedAt || a.updatedAt || a.docDate || ''))[0];
      return { ...(latest || {}), ...m, id: latest?.id || `cdoc_${m.id}`, manifestId: m.id, manifestRef: m.manifestNo, status: latest?.status || 'submitted', docDate: latest?.docDate || m.eta || m.etd || '', docNo: latest?.docNo || m.manifestNo };
    });
    const orphanDocs = (customsDocs || []).filter(d => !(manifests || []).some(m => d.manifestRef === m.manifestNo || d.manifestRef === m.id || d.manifestNo === m.manifestNo));
    const arr = [...manifestRows, ...orphanDocs];
    if (sortBy === 'date_desc') return arr.sort((a, b) => (b.docDate || '').localeCompare(a.docDate || ''));
    if (sortBy === 'date_asc') return arr.sort((a, b) => (a.docDate || '').localeCompare(b.docDate || ''));
    if (sortBy === 'value_desc') return arr.sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0));
    if (sortBy === 'status') return arr.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    return arr;
  }, [customsDocs, manifests, sortBy]);

  return (
    <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', overflowX: 'auto'}}>
      <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
        <div className="serif" style={{fontSize: '17px', fontWeight: 500}}>{t.ops_tab_customs}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <SortToggle value={sortBy} onChange={setSortBy} lang={lang} options={[{value: 'date_desc', label: lang === 'id' ? 'Terbaru' : 'Newest'}, {value: 'date_asc', label: lang === 'id' ? 'Terlama' : 'Oldest'}, {value: 'status', label: lang === 'id' ? 'Status' : 'Status'}]} />
          {canEdit && <button className="btn-primary" onClick={() => { setEditingRecord(null); setModalOpen(true); }} style={{fontSize: '11px', padding: '6px 12px'}}><Plus size={12} />{t.crud_add}</button>}
        </div>
      </div>
      <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '800px'}}>
        <thead>
          <tr style={{background: 'var(--ims-bg-card-2)'}}>
            <Th>{t.ops_manifest_no}</Th>
            <Th>{t.ops_customer_name}</Th>
            <Th>{t.ops_sph_no}</Th>
            <Th>{t.ops_modality}</Th>
            <Th>{t.ops_type_brand}</Th>
            <Th>Principal</Th>
            <Th>{t.ops_vessel}</Th>
            <Th>ETA</Th>
            <Th>{t.ops_doc_status}</Th>
            {canEdit && <Th align="right">{t.crud_actions}</Th>}
          </tr>
        </thead>
        <tbody>
          {sortedDocs.map(d => {
            const linked = (data || []).find(s => manifestMatchesProject(d, s));
            const statusColor = statusColors[d.status] || 'var(--ims-text-2)';
            return (
              <tr key={d.id} className="hover-row" style={{borderTop: '1px solid var(--ims-border)'}}>
                <Td>
                  <span className="mono" style={{fontSize: '11px', fontWeight: 600}}>{d.manifestNo || d.manifestRef || d.docNo}</span>
                  {d.fileUrl && <div style={{marginTop: '4px'}}><LinkAttachment url={d.fileUrl} lang={lang} /></div>}
                  {d.notes && <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '2px', fontStyle: 'italic'}}>{d.notes}</div>}
                </Td>
                <Td>{d.customerName || linked?.customer || '-'}</Td>
                <Td><span className="mono">{d.sphNo || linked?.sphNo || '-'}</span></Td>
                <Td>{d.modality || linked?.modality || linked?.productModality || '-'}</Td>
                <Td>{d.typeBrand || [linked?.subModality || linked?.productType || linked?.type, linked?.productBrand || linked?.brand].filter(Boolean).join(' / ') || '-'}</Td>
                <Td><span style={{fontSize: '11px'}}>{d.principal}</span></Td>
                <Td>{d.shippingMode === 'air' ? 'Udara' : d.shippingMode === 'sea' ? 'Laut' : '-'}</Td>
                <Td><span className="mono" style={{fontSize: '11px'}}>{d.eta || d.docDate || '-'}</span></Td>
                <Td>
                  <span style={{padding: '3px 8px', fontSize: '10px', background: statusColor + '25', color: statusColor, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'}}>{t[`ops_doc_${d.status}`] || d.status || '-'}</span>
                  {d.pibAmount ? <div className="mono" style={{fontSize: '9px', color: '#7b3fb5', marginTop: '3px'}}>PIB: Rp {Number(d.pibAmount || 0).toLocaleString('id-ID')}</div> : null}
                </Td>
                {canEdit && (
                  <Td align="right">
                    <button onClick={() => { setEditingRecord(d); setModalOpen(true); }} className="btn-ghost" style={{fontSize: '10px', padding: '5px 10px'}}><Edit2 size={11} />Edit</button>
                    <button onClick={() => handleDelete(d.id)} className="btn-ghost" style={{fontSize: '10px', padding: '5px 10px', color: '#c03030'}}><Trash2 size={11} />Hapus</button>
                  </Td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {sortedDocs.length === 0 && <div className="empty-state">{t.no_data}</div>}
      {modalOpen && <CustomsDocModal record={editingRecord} manifests={manifests} data={data} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingRecord(null); }} t={t} lang={lang} />}
      <ConfirmDialog open={!!deleteId} title={lang === 'id' ? 'Hapus Dokumen?' : 'Delete Document?'} message={lang === 'id' ? 'Yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to delete this record? This action cannot be undone.'} onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} danger lang={lang} />
    </div>
  );
}
function ManifestModal({ record, data = [], onSave, onClose, t, lang }) {
  const today = new Date().toISOString().split('T')[0];
  const dpProjects = useMemo(() => (data || []).filter(s => s.poStatus === 'issued' && projectHasDpReceived(s)), [data]);
  const [form, setForm] = useState(record ? {
    ...record,
    status: normalizeImportPipelineStatus(record.status),
    shippingMode: record.shippingMode || 'sea',
  } : {
    id: 'mfst_' + Date.now(),
    manifestNo: 'MFST-' + new Date().toISOString().substring(0, 7) + '-' + String(Date.now()).slice(-3),
    customerName: '', modality: '', typeBrand: '', sphNo: '', linkedProjectId: '',
    principal: '', principalOrigin: '', shippingMode: 'sea',
    etd: today, eta: '', portOfLoading: '', portOfDischarge: 'Tanjung Priok, Jakarta',
    itemsCount: 1, freightCost: 0,
    status: 'plan_order', notes: '',
  });
  const isEdit = !!record;
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const selectProject = (projectId) => {
    const p = dpProjects.find(s => s.id === projectId);
    if (!p) {
      update('linkedProjectId', '');
      return;
    }
    setForm(prev => ({
      ...prev,
      linkedProjectId: p.id,
      customerName: p.customer || '',
      modality: p.modality || p.productModality || '',
      typeBrand: [p.subModality || p.productType || p.type, p.productBrand || p.brand].filter(Boolean).join(' / '),
      sphNo: p.sphNo || '',
      principal: p.principal || p.productBrand || p.brand || prev.principal || '',
      itemsCount: Number(p.qty) || prev.itemsCount || 1,
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.ops_modal_edit_manifest : t.ops_modal_add_manifest}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <Field label={t.ops_manifest_no}><input value={form.manifestNo} onChange={e => update('manifestNo', e.target.value)} /></Field>
          <Field label={t.ops_manifest_status}>
            <select value={form.status} onChange={e => update('status', e.target.value)}>
              {IMPORT_PIPELINE_STEPS.map(step => (
                <option key={step.id} value={step.id}>{lang === 'id' ? step.labelId : step.labelEn}</option>
              ))}
            </select>
          </Field>
          <Field label={lang === 'id' ? 'Data RS DP Diterima' : 'DP Received Customer'}>
            <select value={form.linkedProjectId || ''} onChange={e => selectProject(e.target.value)}>
              <option value="">—</option>
              {dpProjects.map(p => <option key={p.id} value={p.id}>{p.customer} — {p.sphNo}</option>)}
            </select>
          </Field>
          <Field label={t.ops_customer_name}><input value={form.customerName || ''} onChange={e => update('customerName', e.target.value)} /></Field>
          <Field label={t.ops_modality}><input value={form.modality || ''} onChange={e => update('modality', e.target.value)} /></Field>
          <Field label={t.ops_type_brand}><input value={form.typeBrand || ''} onChange={e => update('typeBrand', e.target.value)} /></Field>
          <Field label={t.ops_sph_no}><input value={form.sphNo || ''} onChange={e => update('sphNo', e.target.value)} /></Field>
          <Field label={t.imp_principal}>
            <select value={form.principal} onChange={e => update('principal', e.target.value)}>
              <option value="">—</option>
              <option value="SG Healthcare">SG Healthcare (Korea)</option>
              <option value="ANKE">ANKE (China)</option>
              <option value="SINO MDT">SINO MDT (China)</option>
              <option value="Hyde Medical">Hyde Medical (China)</option>
              <option value="Angell">Angell (China)</option>
              <option value="Innocare">Innocare (Taiwan)</option>
            </select>
          </Field>
          <Field label={lang === 'id' ? 'Asal Kota/Negara' : 'Origin'}><input value={form.principalOrigin} onChange={e => update('principalOrigin', e.target.value)} placeholder="Shanghai, China" /></Field>
          <Field label={t.ops_vessel}>
            <select value={form.shippingMode || 'sea'} onChange={e => update('shippingMode', e.target.value)}>
              <option value="sea">Laut</option>
              <option value="air">Udara</option>
            </select>
          </Field>
          <Field label={t.ops_etd}><input type="date" value={form.etd} onChange={e => update('etd', e.target.value)} /></Field>
          <Field label={t.ops_eta}><input type="date" value={form.eta} onChange={e => update('eta', e.target.value)} /></Field>
          <Field label={t.ops_port_of_loading}><input value={form.portOfLoading} onChange={e => update('portOfLoading', e.target.value)} /></Field>
          <Field label={t.ops_port_of_discharge}><input value={form.portOfDischarge} onChange={e => update('portOfDischarge', e.target.value)} /></Field>
          <Field label={t.ops_items_count}><input type="number" min="1" value={form.itemsCount} onChange={e => update('itemsCount', parseInt(e.target.value) || 1)} /></Field>
          <Field label={t.ops_freight_cost + ' (Rp)'}><input type="number" value={form.freightCost} onChange={e => update('freightCost', parseFloat(e.target.value) || 0)} /></Field>
          <Field label={t.ops_shipping_notes} full><textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} /></Field>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
          <button className="btn-primary" onClick={() => onSave(form)}>{t.crud_save}</button>
        </div>
      </div>
    </div>
  );
}
function CustomsDocModal({ record, manifests, data = [], onSave, onClose, t, lang }) {
  const today = new Date().toISOString().split('T')[0];
  const normalizedRecord = record ? {
    ...record,
    poNo: record.poNo || record.docType || '',
    status: ['submitted', 'rejected', 'redline', 'pib_payment', 'sppb'].includes(record.status) ? record.status : 'submitted',
    manifestRef: record.manifestRef || record.manifestNo || '',
  } : null;
  const [form, setForm] = useState(normalizedRecord || {
    id: 'doc_' + Date.now(), docNo: '', manifestRef: '',
    customerName: '', modality: '', typeBrand: '', sphNo: '',
    principal: '', shippingMode: 'sea', eta: '', docDate: today, status: 'submitted',
    pibAmount: 0, fileUrl: '', notes: '',
  });
  const isEdit = !!record;
  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const selectManifest = (manifestNo) => {
    const m = manifests.find(x => x.manifestNo === manifestNo || x.id === manifestNo);
    if (!m) {
      update('manifestRef', manifestNo);
      return;
    }
    const linked = (data || []).find(s => manifestMatchesProject(m, s));
    setForm(prev => ({
      ...prev,
      manifestRef: m.manifestNo,
      manifestNo: m.manifestNo,
      manifestId: m.id,
      docNo: prev.docNo || m.manifestNo,
      customerName: m.customerName || linked?.customer || '',
      modality: m.modality || linked?.modality || linked?.productModality || '',
      typeBrand: m.typeBrand || [linked?.subModality || linked?.productType || linked?.type, linked?.productBrand || linked?.brand].filter(Boolean).join(' / '),
      sphNo: m.sphNo || linked?.sphNo || '',
      linkedProjectId: m.linkedProjectId || linked?.id || '',
      principal: m.principal || linked?.principal || linked?.productBrand || linked?.brand || '',
      shippingMode: m.shippingMode || 'sea',
      eta: m.eta || prev.eta || '',
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '640px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px'}}>
          <h2 className="serif" style={{fontSize: '22px', margin: 0, fontWeight: 500}}>{isEdit ? t.ops_modal_edit_customs : t.ops_modal_add_customs}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
          <Field label={lang === 'id' ? 'Ref Manifest' : 'Manifest Ref'}>
            <select value={form.manifestRef} onChange={e => selectManifest(e.target.value)}>
              <option value="">—</option>
              {manifests.map(m => <option key={m.id} value={m.manifestNo}>{m.manifestNo} — {m.principal}</option>)}
            </select>
          </Field>
          <Field label={t.ops_manifest_no}><input value={form.manifestNo || form.manifestRef || form.docNo || ''} onChange={e => { update('manifestNo', e.target.value); update('manifestRef', e.target.value); }} /></Field>
          <Field label={t.ops_customer_name}><input value={form.customerName || ''} onChange={e => update('customerName', e.target.value)} /></Field>
          <Field label={t.ops_sph_no}><input value={form.sphNo || ''} onChange={e => update('sphNo', e.target.value)} /></Field>
          <Field label={t.ops_modality}><input value={form.modality || ''} onChange={e => update('modality', e.target.value)} /></Field>
          <Field label={t.ops_type_brand}><input value={form.typeBrand || ''} onChange={e => update('typeBrand', e.target.value)} /></Field>
          <Field label={t.imp_principal}><input value={form.principal || ''} onChange={e => update('principal', e.target.value)} /></Field>
          <Field label={t.ops_vessel}>
            <select value={form.shippingMode || 'sea'} onChange={e => update('shippingMode', e.target.value)}>
              <option value="sea">Laut</option>
              <option value="air">Udara</option>
            </select>
          </Field>
          <Field label="ETA"><input type="date" value={form.eta || ''} onChange={e => update('eta', e.target.value)} /></Field>
          <Field label={t.ops_doc_date}><input type="date" value={form.docDate} onChange={e => update('docDate', e.target.value)} /></Field>
          <Field label={t.ops_doc_status}>
            <select value={form.status} onChange={e => update('status', e.target.value)}>
              <option value="submitted">{t.ops_doc_submitted}</option>
              <option value="rejected">{t.ops_doc_rejected}</option>
              <option value="redline">{t.ops_doc_redline}</option>
              <option value="pib_payment">{t.ops_doc_pib_payment}</option>
              <option value="sppb">{t.ops_doc_sppb}</option>
            </select>
          </Field>
          {form.status === 'pib_payment' && (
            <Field label={lang === 'id' ? 'Nilai Pembayaran PIB (Rp)' : 'PIB Payment Amount (Rp)'}>
              <input type="number" min="0" value={form.pibAmount || ''} onChange={e => update('pibAmount', parseFloat(e.target.value) || 0)} placeholder="0" />
            </Field>
          )}
          <Field label={t.ops_doc_file_url} full><input type="url" value={form.fileUrl} onChange={e => update('fileUrl', e.target.value)} placeholder="https://drive.google.com/..." /></Field>
          <Field label={t.notes} full><textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} /></Field>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
          <button className="btn-ghost" onClick={onClose}>{t.crud_cancel}</button>
          <button className="btn-primary" onClick={() => onSave(form)}>{t.crud_save}</button>
        </div>
      </div>
    </div>
  );
}

export { CustomsNoteEditor, localDeliveryStatusLabel, getLocalDeliveryDefaults, EditableLocalDeliveryField, OperationsDashboardCharts, OperationsModule, ManifestList, CustomsDocsList, ManifestModal, CustomsDocModal };

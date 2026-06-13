import { useState } from 'react';
import { AlertTriangle, CalendarDays, ClipboardList, Wrench } from 'lucide-react';
import { ReadOnlyBanner } from '../components/ui.jsx';
import { InstallationModule } from './InstallationModule.jsx';
import { MaintenanceModule } from './MaintenanceModule.jsx';

function TechnicalSupportModule({
  data,
  setData,
  installRecords,
  setInstallRecords,
  bastRecords,
  setBastRecords,
  trainingRecords,
  setTrainingRecords,
  units,
  issues,
  setIssues,
  pmSchedule,
  setPmSchedule,
  t,
  lang,
  canEdit,
  fmt,
  employees = {},
  liveTechnicians = [],
  regRecords = [],
  products = [],
  documentTemplates,
  onSaveDocument,
  session = {},
  unitTechMap = {},
  setUnitTechMap,
}) {
  const [tab, setTab] = useState('progress');

  const tabs = [
    { id: 'progress', label: lang === 'id' ? 'Progress Instalasi' : 'Installation Progress', icon: Wrench },
    { id: 'history_bast', label: lang === 'id' ? 'Riwayat & BAST' : 'History & BAST', icon: ClipboardList },
    { id: 'pm', label: lang === 'id' ? 'Jadwal PM' : 'PM Schedule', icon: CalendarDays },
    { id: 'issues', label: lang === 'id' ? 'Perbaikan & Keluhan' : 'Repairs & Complaints', icon: AlertTriangle },
  ];

  const installProps = {
    data,
    setData,
    installRecords,
    setInstallRecords,
    bastRecords,
    setBastRecords,
    trainingRecords,
    setTrainingRecords,
    t,
    lang,
    canEdit,
    fmt,
    employees,
    liveTechnicians,
    regRecords,
    products,
    documentTemplates,
    onSaveDocument,
    session,
    contentOnly: true,
  };

  const maintProps = {
    units,
    issues,
    setIssues,
    pmSchedule,
    setPmSchedule,
    t,
    lang,
    canEdit,
    session,
    liveTechnicians,
    unitTechMap,
    setUnitTechMap,
    employees,
    contentOnly: true,
  };

  return (
    <div>
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.3em', color: 'var(--ims-text-2)', textTransform: 'uppercase', marginBottom: '6px' }}>
          {t.nav_technical_support}
        </div>
        <h1 className="serif hero-title" style={{ fontSize: '36px', fontWeight: 500, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1 }}>
          {t.ts_title}
        </h1>
        <div style={{ fontSize: '13px', color: 'var(--ims-text-2)', marginTop: '6px' }}>{t.ts_subtitle}</div>
      </div>

      {!canEdit && <ReadOnlyBanner t={t} />}

      <div style={{ display: 'flex', gap: '2px', marginBottom: '22px', borderBottom: '1px solid var(--ims-border)', flexWrap: 'wrap' }}>
        {tabs.map(tb => {
          const Icon = tb.icon;
          const active = tab === tb.id;
          return (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '10px 18px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '12px',
                fontWeight: 500,
                color: active ? 'var(--ims-accent)' : 'var(--ims-text-2)',
                borderBottom: active ? '2px solid var(--ims-border)' : '2px solid transparent',
                marginBottom: '-1px',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                letterSpacing: '0.03em',
              }}
            >
              <Icon size={14} strokeWidth={1.5} />
              {tb.label}
            </button>
          );
        })}
      </div>

      {tab === 'progress' && <InstallationModule {...installProps} forcedTab="progress" />}
      {tab === 'history_bast' && <InstallationModule {...installProps} forcedTab="history_bast" />}
      {tab === 'pm' && <MaintenanceModule {...maintProps} forcedTab="schedule" />}
      {tab === 'issues' && <MaintenanceModule {...maintProps} forcedTab="issues" />}
    </div>
  );
}

export { TechnicalSupportModule };

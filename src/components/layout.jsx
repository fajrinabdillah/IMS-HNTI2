// Extracted from App.jsx during modular refactor.
import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Bell, Briefcase, Check, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, DollarSign, FileBarChart, FileCheck, FileText, Globe, History, Layers, Lock, LogOut, Menu, Palette, Plane, Settings, ShieldCheck, Target, TrendingUp, Truck, UserPlus, Users, Wallet, Wrench } from 'lucide-react';
import { IMSLogo, WIBClock, SyncIndicator } from './ui.jsx';
import { NotificationBell } from './NotificationBell.jsx';
import { _stopProactiveRefresh, _stopRealtime, _supaSignOut, enablePushNotifications, getPushPermissionStatus } from '../utils/storage.js';
import { showToast } from '../utils/toast.js';
import { initialOf } from '../utils/format.js';
import { IMS_THEMES } from '../constants/theme.js';
import logoSidebar from '../../logo2.png';
function Header({ session, setSession, lang, setLang, theme = 've', setTheme, view, setView, allowedNav, t, mobileMenuOpen, setMobileMenuOpen, exchangeRate, setExchangeRate, businessTrips, realizations, reports, reportsSeen = {}, onChangePassword, syncStatus = 'offline', notifications = [], setNotifications }) {
  const navIcons = { dashboard: Activity, sph: FileText, pipeline: Briefcase, product_support: FileBarChart, kpi_scorecard: Target, sales: Users, sales_report: ClipboardList, incentive: DollarSign, finance: Wallet, operations: Truck, technical_support: Wrench, regulatory: ShieldCheck, valuation: TrendingUp, employees: UserPlus, business_trip: Plane, audit_log: History, products: Layers, document_templates: FileCheck, cashflow: TrendingUp, exec_summary: FileText };
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [rateMenuOpen, setRateMenuOpen] = useState(false);
  const [tempRate, setTempRate] = useState(exchangeRate);
  const [pushStatus, setPushStatus] = useState(getPushPermissionStatus());
  const [pushBusy, setPushBusy] = useState(false);

  // Notification counts for business_trip
  const btNotifCount = useMemo(() => {
    if (!businessTrips || !realizations) return 0;
    let count = 0;
    if (session.role === 'finance') {
      count = businessTrips.filter(t => t.status === 'pending_finance').length +
              realizations.filter(r => r.status === 'pending_finance').length +
              businessTrips.filter(t => t.status === 'approved' && t.paymentStatus !== 'paid').length +
              realizations.filter(r => r.status === 'approved' && r.settlementStatus === 'pending' && r.difference !== 0).length;
    } else if (session.role === 'manager_ops') {
      count = businessTrips.filter(t => t.status === 'pending_mops').length +
              realizations.filter(r => r.status === 'pending_mops').length;
    } else if (session.role === 'gm') {
      count = businessTrips.filter(t => t.status === 'pending_gm').length +
              realizations.filter(r => r.status === 'pending_gm').length;
    } else if (['sales', 'technician', 'operations', 'admin', 'regulatory'].includes(session.role)) {
      // Karyawan: notify saat status berubah (clarification or rejected)
      count = businessTrips.filter(t => t.travelerUsername === session.username && ['clarification', 'rejected'].includes(t.status)).length +
              realizations.filter(r => r.travelerUsername === session.username && r.status === 'clarification').length;
    }
    return count;
  }, [businessTrips, realizations, session.role, session.username]);

  const srNotifCount = useMemo(() => {
    if (!['super_admin', 'gm', 'manager_ops'].includes(session.role)) return 0;
    if (!reports || !reports.length) return 0;
    const dates = reports.map(r => r.date || '').filter(Boolean).sort();
    const latest = dates[dates.length - 1];
    if (!latest) return 0;
    const seen = reportsSeen[session.username];
    let cutStr;
    if (seen) cutStr = seen;
    else { const cut = new Date(latest); cut.setDate(cut.getDate() - 7); cutStr = cut.toISOString().split('T')[0]; }
    return reports.filter(r => (r.date || '') > cutStr).length;
  }, [reports, session.role, session.username, reportsSeen]);

  useEffect(() => {
    setPushStatus(getPushPermissionStatus());
  }, [session?.username]);

  const activatePush = async () => {
    if (pushBusy) return;
    setPushBusy(true);
    const result = await enablePushNotifications(session);
    setPushStatus(getPushPermissionStatus());
    setPushBusy(false);
    if (result.ok) showToast(lang === 'id' ? 'Push notification aktif di perangkat ini' : 'Push notifications enabled on this device', 'success');
    else {
      const msg = result.reason === 'missing_vapid_key'
        ? (lang === 'id' ? 'VAPID public key belum diset di Vercel/Supabase.' : 'VAPID public key is not configured.')
        : result.reason === 'permission_denied'
          ? (lang === 'id' ? 'Izin notifikasi ditolak di browser/perangkat.' : 'Notification permission was denied.')
          : result.reason === 'unsupported'
            ? (lang === 'id' ? 'Perangkat/browser ini belum mendukung push notification.' : 'This device/browser does not support push notification.')
          : result.reason === 'rls_policy_missing'
            ? (lang === 'id' ? 'Policy RLS belum diset di Supabase. Jalankan SQL fix di chat/panduan.' : 'RLS policy missing in Supabase. Run the SQL fix from the guide.')
            : (lang === 'id' ? `Push notification belum aktif: ${result.reason}` : `Push notification not enabled: ${result.reason}`);
      showToast(msg, 'error');
    }
  };

  return (
    <header style={{borderBottom: '1px solid var(--ims-border)', background: 'var(--ims-bg)', position: 'sticky', top: 0, zIndex: 50}}>
      <div className="header-content" style={{maxWidth: '1440px', margin: '0 auto', padding: '14px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px'}}><Menu size={22} strokeWidth={1.5} /></button>
          <IMSLogo size="sm" />
        </div>

        <div style={{flex: 1}} />

        <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
          <div title={syncStatus === 'live' ? 'Sinkron langsung antar device aktif' : syncStatus === 'connecting' ? 'Menyambungkan…' : syncStatus === 'error' ? 'Putus sambung — mencoba lagi' : 'Sync offline'} style={{display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 9px', border: '1px solid var(--ims-border)', borderRadius: '100px', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: syncStatus === 'live' ? 'var(--ims-accent)' : syncStatus === 'connecting' ? 'var(--ims-gold)' : 'var(--ims-text-2)', cursor: 'default'}}>
            <span style={{width: '7px', height: '7px', borderRadius: '50%', background: syncStatus === 'live' ? 'var(--ims-accent)' : syncStatus === 'connecting' ? 'var(--ims-gold)' : syncStatus === 'error' ? '#c03030' : 'var(--ims-text-2)', boxShadow: syncStatus === 'live' ? '0 0 10px var(--ims-accent-glow), 0 0 4px var(--ims-accent-glow)' : 'none', animation: syncStatus === 'connecting' ? 'pulse 1.4s ease-in-out infinite' : 'none'}}></span>
            <span className="hide-mobile">{syncStatus === 'live' ? 'Live' : syncStatus === 'connecting' ? 'Sync…' : syncStatus === 'error' ? 'Retry' : 'Offline'}</span>
          </div>
          <div className="hide-mobile" style={{paddingRight: '12px', borderRight: '1px solid var(--ims-border)'}}>
            <WIBClock lang={lang} />
          </div>
          {lang === 'en' && (
            <div style={{position: 'relative'}}>
              <button onClick={() => setRateMenuOpen(!rateMenuOpen)} className="mono" style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '6px 10px', fontSize: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px'}}>
                <DollarSign size={11} />1=Rp{exchangeRate.toLocaleString('id-ID')}
              </button>
              {rateMenuOpen && (
                <>
                  <div onClick={() => setRateMenuOpen(false)} style={{position: 'fixed', inset: 0, zIndex: 60}} />
                  <div style={{position: 'absolute', right: 0, top: '100%', marginTop: '6px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', padding: '14px', zIndex: 70, minWidth: '220px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)'}}>
                    <div style={{fontSize: '10px', letterSpacing: '0.18em', color: 'var(--ims-text-2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px'}}>{t.exchange_rate}</div>
                    <input type="number" value={tempRate} onChange={e => setTempRate(parseFloat(e.target.value) || 0)} style={{marginBottom: '8px'}} />
                    <button className="btn-primary" onClick={() => { setExchangeRate(tempRate); setRateMenuOpen(false); }} style={{width: '100%', padding: '8px', justifyContent: 'center', fontSize: '11px'}}>{t.update_rate}</button>
                  </div>
                </>
              )}
            </div>
          )}
          {/* === NOTIFICATION BELL (Tahap 11 — Phase 1) === */}
          <button
            onClick={activatePush}
            disabled={pushBusy || pushStatus === 'unsupported' || pushStatus === 'denied'}
            title={pushStatus === 'granted'
              ? (lang === 'id' ? 'Push notification aktif di perangkat ini' : 'Push notification active on this device')
              : pushStatus === 'denied'
                ? (lang === 'id' ? 'Izin notifikasi diblokir. Aktifkan dari setting browser/HP.' : 'Notification permission is blocked. Enable it in browser/device settings.')
                : (lang === 'id' ? 'Aktifkan push notification perangkat' : 'Enable device push notification')}
            style={{background: pushStatus === 'granted' ? 'rgba(66,217,139,0.12)' : 'transparent', border: '1px solid var(--ims-border)', padding: '6px 9px', fontFamily: 'inherit', fontSize: '10px', cursor: (pushBusy || pushStatus === 'unsupported' || pushStatus === 'denied') ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: pushStatus === 'granted' ? 'var(--ims-accent)' : 'var(--ims-text-2)', fontWeight: 700, opacity: pushStatus === 'unsupported' ? 0.45 : 1}}
          >
            <Bell size={12} strokeWidth={1.8} />
            <span className="hide-mobile">{pushBusy ? '...' : pushStatus === 'granted' ? 'Push' : 'Push Off'}</span>
          </button>
          <NotificationBell notifications={notifications} setNotifications={setNotifications} session={session} t={t} lang={lang} setView={setView} />
          <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '6px 10px', fontFamily: 'inherit', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', letterSpacing: '0.1em', color: 'var(--ims-text)', fontWeight: 500}}>
            <Globe size={12} strokeWidth={1.5} />{lang === 'id' ? 'EN' : 'ID'}
          </button>
          <div style={{position: 'relative'}}>
            <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '4px'}}>
              <div style={{width: '32px', height: '32px', borderRadius: '50%', background: 'var(--ims-bg-alt)', color: 'var(--ims-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600}}>{initialOf(session.name)}</div>
              <ChevronDown size={13} strokeWidth={1.5} />
            </button>
            {userMenuOpen && (
              <>
                <div onClick={() => setUserMenuOpen(false)} style={{position: 'fixed', inset: 0, zIndex: 60}} />
                <div style={{position: 'absolute', right: 0, top: '100%', marginTop: '8px', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', minWidth: '220px', zIndex: 70, boxShadow: '0 8px 24px rgba(0,0,0,0.08)'}}>
                  <div style={{padding: '14px', borderBottom: '1px solid var(--ims-border)'}}>
                    <div style={{fontSize: '13px', fontWeight: 600}}>{session.name}</div>
                    <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{t[`role_${session.role}`]}</div>
                  </div>
                  <button onClick={() => { onChangePassword(); setUserMenuOpen(false); }} style={{width: '100%', padding: '12px 14px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--ims-border)', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit', fontSize: '13px'}}>
                    <Lock size={14} strokeWidth={1.5} />{t.change_password}
                  </button>
                  {/* Theme selector — disimpan per-device di localStorage, tidak di-sync Realtime */}
                  <div style={{padding: '12px 14px', borderBottom: '1px solid var(--ims-border)'}}>
                    <div style={{fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <Palette size={12} strokeWidth={1.5} />{lang === 'id' ? 'Tema Tampilan' : 'Display Theme'}
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                      {Object.entries(IMS_THEMES).map(([key, def]) => (
                        <button key={key} onClick={() => setTheme && setTheme(key)} style={{
                          width: '100%', padding: '8px 10px',
                          background: theme === key ? 'var(--ims-accent-bg-strong)' : 'transparent',
                          border: '1px solid ' + (theme === key ? 'var(--ims-accent)' : 'var(--ims-border)'),
                          display: 'flex', alignItems: 'center', gap: '10px',
                          cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit', fontSize: '12px',
                          fontWeight: theme === key ? 600 : 400,
                          transition: 'all 0.15s'
                        }}>
                          <span style={{width: '14px', height: '14px', borderRadius: '50%', border: '0.5px solid rgba(255,255,255,0.2)', flexShrink: 0,
                            background: key === 've'
                              ? 'linear-gradient(135deg, #4ef0a8 0%, #fcd116 100%)'
                              : 'linear-gradient(135deg, #5e9bff 0%, #dde7f5 100%)'
                          }}></span>
                          <span style={{flex: 1, textAlign: 'left'}}>{def.name}</span>
                          {theme === key && <Check size={12} strokeWidth={2} style={{color: 'var(--ims-accent)'}} />}
                        </button>
                      ))}
                    </div>
                    <div style={{fontSize: '10px', color: 'var(--ims-text-2)', marginTop: '6px', fontStyle: 'italic', lineHeight: 1.4}}>
                      {lang === 'id' ? 'Tersimpan di perangkat ini.' : 'Saved on this device.'}
                    </div>
                  </div>
                  <button onClick={() => { _stopRealtime(); _stopProactiveRefresh(); _supaSignOut(); setSession(null); setUserMenuOpen(false); }} style={{width: '100%', padding: '12px 14px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit', fontSize: '13px'}}>
                    <LogOut size={14} strokeWidth={1.5} />{t.logout}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-nav-panel" style={{borderTop: '1px solid var(--ims-border)', background: 'var(--ims-bg-card)', padding: '12px 20px'}}>
          {allowedNav.map(item => {
            const Icon = navIcons[item];
            const active = view === item;
            const badge = item === 'business_trip' ? btNotifCount : (item === 'sales_report' ? srNotifCount : 0);
            return (
              <button key={item} onClick={() => { setView(item); setMobileMenuOpen(false); }} style={{width: '100%', background: active ? 'var(--ims-accent)' : 'transparent', color: active ? 'var(--ims-bg)' : 'var(--ims-accent)', border: 'none', padding: '12px 16px', fontFamily: 'inherit', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', textAlign: 'left'}}>
                <Icon size={15} strokeWidth={1.5} />
                <span style={{flex: 1}}>{t[`nav_${item}`]}</span>
                {badge > 0 && <span style={{background: '#c03030', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '10px', fontWeight: 700}}>{badge}</span>}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
function HoverSidebar({ allowedNav, view, setView, t, lang, btNotifCount, srNotifCount = 0 }) {
  const navIcons = { dashboard: Activity, sph: FileText, pipeline: Briefcase, product_support: FileBarChart, kpi_scorecard: Target, sales: Users, sales_report: ClipboardList, incentive: DollarSign, finance: Wallet, operations: Truck, technical_support: Wrench, regulatory: ShieldCheck, valuation: TrendingUp, employees: UserPlus, business_trip: Plane, audit_log: History, products: Layers, document_templates: FileCheck, cashflow: TrendingUp, exec_summary: FileText };
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hover trigger strip — far left edge, always present */}
      <div
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen(o => !o)}
        title={lang === 'id' ? 'Geser ke sini untuk menu' : 'Hover here for menu'}
        style={{position: 'fixed', left: 0, top: 0, bottom: 0, width: '14px', zIndex: 95, cursor: 'pointer', background: open ? 'transparent' : 'linear-gradient(90deg, rgba(26,41,66,0.10), transparent)', display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}
      >
        {!open && (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', paddingLeft: '2px'}}>
            <span style={{width: '3px', height: '26px', borderRadius: '2px', background: 'var(--ims-bg-alt)', opacity: 0.35}} />
            <ChevronRight size={12} strokeWidth={2} color="var(--ims-text)" style={{opacity: 0.5}} />
            <span style={{width: '3px', height: '26px', borderRadius: '2px', background: 'var(--ims-bg-alt)', opacity: 0.35}} />
          </div>
        )}
      </div>

      {/* Dim overlay when open */}
      {open && <div onMouseEnter={() => setOpen(false)} style={{position: 'fixed', inset: 0, zIndex: 96, background: 'rgba(26,41,66,0.18)', transition: 'opacity 0.2s'}} />}

      {/* Drawer */}
      <div
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        style={{position: 'fixed', left: 0, top: 0, bottom: 0, width: '236px', zIndex: 97, background: 'var(--ims-bg-alt)', color: 'var(--ims-text)', transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s ease', overflowY: 'auto', boxShadow: open ? '4px 0 24px rgba(0,0,0,0.18)' : 'none', display: 'flex', flexDirection: 'column'}}
      >
        {/* Drawer header */}
        <div style={{padding: '20px 18px 16px', borderBottom: '1px solid rgba(248,245,239,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <img src={logoSidebar} alt="IMS — Integrated Monitoring System" style={{width: '152px', height: 'auto', display: 'block'}} />
          <button onClick={() => setOpen(false)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(248,245,239,0.6)', padding: '4px'}} title={lang === 'id' ? 'Tutup' : 'Close'}>
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Nav items */}
        <nav style={{padding: '10px 0', flex: 1}}>
          {allowedNav.map(item => {
            const Icon = navIcons[item] || Activity;
            const active = view === item;
            const badge = item === 'business_trip' ? btNotifCount : (item === 'sales_report' ? srNotifCount : 0);
            return (
              <button key={item} onClick={() => { setView(item); setOpen(false); }} style={{width: '100%', background: active ? 'var(--ims-gold)' : 'transparent', color: active ? 'var(--ims-bg)' : 'var(--ims-text)', border: 'none', borderLeft: active ? '3px solid var(--ims-bg)' : '3px solid transparent', padding: '11px 18px', fontFamily: 'inherit', fontSize: '12.5px', fontWeight: active ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', transition: 'background 0.15s', letterSpacing: '0.02em'}}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(248,245,239,0.08)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                <Icon size={15} strokeWidth={1.5} />
                <span style={{flex: 1}}>{t[`nav_${item}`]}</span>
                {badge > 0 && <span style={{background: '#c03030', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '9px', fontWeight: 700, minWidth: '14px', textAlign: 'center'}}>{badge}</span>}
              </button>
            );
          })}
        </nav>

        {/* Drawer footer — logo pojok kiri bawah */}
        <div style={{padding: '14px 18px', borderTop: '1px solid rgba(248,245,239,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <img src={logoSidebar} alt="IMS — Integrated Monitoring System" style={{width: '108px', height: 'auto', opacity: 0.6}} />
          <span style={{fontSize: '9px', color: 'rgba(248,245,239,0.35)', letterSpacing: '0.05em'}}>
            {lang === 'id' ? 'Geser keluar untuk menutup' : 'Move out to close'}
          </span>
        </div>
      </div>
    </>
  );
}
const Footer = React.memo(function Footer({ t, lastSync, onRefresh, lang }) {
  return (
    <footer style={{borderTop: '1px solid var(--ims-border)', padding: '24px 48px', marginTop: '40px'}}>
      <div style={{maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
          <IMSLogo size="sm" />
          <span style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>· {t.company}</span>
        </div>
        {lastSync !== undefined && onRefresh && <SyncIndicator lastSync={lastSync} onRefresh={onRefresh} t={t} lang={lang} />}
        <div className="lbl-tag">Phase 38 · © 2026</div>
      </div>
    </footer>
  );
});

export { Header, HoverSidebar, Footer };

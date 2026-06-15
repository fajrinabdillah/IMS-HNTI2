// Extracted from App.jsx during modular refactor.
import { useState, useMemo } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { ConfirmDialog } from './ui.jsx';
import { formatNotifTime, isNotificationForUser, pruneNotifications } from '../utils/notifications.js';
function NotificationBell({ notifications, setNotifications, session, t, lang, setView }) {
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const filtered = useMemo(() => {
    if (!Array.isArray(notifications)) return [];
    return pruneNotifications(notifications).filter(n => isNotificationForUser(n, session));
  }, [notifications, session]);
  const unread = useMemo(() => filtered.filter(n => !n.readAt).length, [filtered]);
  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n));
  };
  const markAllRead = () => {
    const nowIso = new Date().toISOString();
    setNotifications(prev => prev.map(n => isNotificationForUser(n, session) && !n.readAt ? { ...n, readAt: nowIso } : n));
  };
  const confirmDelete = () => {
    setNotifications(prev => prev.filter(n => n.id !== deleteId));
    setDeleteId(null);
  };
  const handleClick = (n) => {
    if (!n.readAt) markRead(n.id);
    if (n.link?.view && setView) {
      try { setView(n.link.view); } catch {}
    }
    setOpen(false);
  };
  // Icon color for notification type — visual cue
  const typeColor = (type) => {
    switch (type) {
      case 'po_won': case 'dp_paid': return 'var(--ims-accent)';
      case 'sph_request': case 'spp_request': case 'sph_ready': case 'spp_ready': case 'invoice_ready': return 'var(--ims-gold)';
      case 'pnbp_due': case 'billing_due': case 'install_pending': return '#fbbf24';
      case 'shipping_arrived': case 'training_scheduled': return '#5b87b8';
      default: return 'var(--ims-text-2)';
    }
  };
  const labelEmpty = lang === 'id' ? 'Tidak ada notifikasi' : 'No notifications';
  const labelTitle = lang === 'id' ? 'Notifikasi' : 'Notifications';
  const labelMarkAll = lang === 'id' ? 'Tandai semua dibaca' : 'Mark all read';
  return (
    <div style={{position: 'relative'}}>
      <button onClick={() => setOpen(!open)} title={labelTitle} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', position: 'relative', color: 'var(--ims-text)', borderRadius: '0'}}>
        <Bell size={14} strokeWidth={1.5} />
        {unread > 0 && (
          <span style={{position: 'absolute', top: '-5px', right: '-5px', minWidth: '16px', height: '16px', padding: '0 4px', background: 'var(--ims-gold)', color: 'var(--ims-accent-ink)', borderRadius: '8px', fontSize: '9.5px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 6px var(--ims-gold-glow)', lineHeight: 1}}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{position: 'fixed', inset: 0, zIndex: 60}} />
          <div style={{position: 'absolute', top: '38px', right: 0, width: '360px', maxWidth: 'calc(100vw - 32px)', background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', maxHeight: '70vh', overflowY: 'auto', zIndex: 70, boxShadow: '0 12px 32px rgba(0,0,0,0.4)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--ims-border)', position: 'sticky', top: 0, background: 'var(--ims-bg-card)', zIndex: 1}}>
              <div style={{fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600}}>{labelTitle} {unread > 0 && <span style={{color: 'var(--ims-gold)', marginLeft: '6px'}}>({unread})</span>}</div>
              {unread > 0 && (
                <button onClick={markAllRead} style={{background: 'transparent', border: 'none', color: 'var(--ims-accent)', cursor: 'pointer', fontSize: '11px', padding: 0, fontFamily: 'inherit'}}>
                  {labelMarkAll}
                </button>
              )}
            </div>
            {filtered.length === 0 ? (
              <div style={{padding: '32px 20px', textAlign: 'center', color: 'var(--ims-text-2)', fontSize: '12px'}}>
                <Bell size={28} strokeWidth={1.2} style={{opacity: 0.4, marginBottom: '8px'}} />
                <div>{labelEmpty}</div>
              </div>
            ) : (
              filtered.slice(0, 50).map(n => (
                <div key={n.id} onClick={() => handleClick(n)} role="button" tabIndex={0} style={{width: '100%', textAlign: 'left', padding: '12px 14px', background: n.readAt ? 'transparent' : 'var(--ims-accent-bg)', borderBottom: '1px solid var(--ims-border-soft)', cursor: 'pointer', color: 'var(--ims-text)', fontFamily: 'inherit', display: 'flex', alignItems: 'flex-start', gap: '10px'}}>
                  <span style={{flexShrink: 0, width: '8px', height: '8px', borderRadius: '50%', background: typeColor(n.type), marginTop: '5px', boxShadow: !n.readAt ? '0 0 6px ' + typeColor(n.type) : 'none'}}></span>
                  <span style={{flex: 1, minWidth: 0}}>
                    <span style={{display: 'block', fontSize: '12.5px', lineHeight: 1.4, color: 'var(--ims-text)', fontWeight: n.readAt ? 400 : 500}}>{n.message}</span>
                    <span style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '10.5px', color: 'var(--ims-text-2)'}}>
                      <span>{n.fromUsername !== 'system' ? n.fromUsername : 'sistem'}</span>
                      <span>{formatNotifTime(n.createdAt, lang)}</span>
                    </span>
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteId(n.id); }} title={lang === 'id' ? 'Hapus notifikasi' : 'Delete notification'} style={{flexShrink: 0, background: 'transparent', border: '1px solid var(--ims-border)', color: '#c03030', cursor: 'pointer', padding: '4px 6px', lineHeight: 1, fontFamily: 'inherit'}}>
                    <Trash2 size={11} />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
      <ConfirmDialog
        open={!!deleteId}
        title={lang === 'id' ? 'Hapus Notifikasi?' : 'Delete Notification?'}
        message={lang === 'id' ? 'Notifikasi ini akan dihapus dari lonceng.' : 'This notification will be removed from the bell.'}
        confirmText={lang === 'id' ? 'Hapus' : 'Delete'}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        danger
        lang={lang}
      />
    </div>
  );
}

export { NotificationBell };

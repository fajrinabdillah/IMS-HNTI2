// Extracted from App.jsx during modular refactor.
import { useState, useEffect } from 'react';
import { TOAST_EVENT } from '../utils/toast.js';
function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const handler = (e) => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, message: e.detail.message, type: e.detail.type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4500);
    };
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener(TOAST_EVENT, handler);
      return () => { try { window.removeEventListener(TOAST_EVENT, handler); } catch (_) {} };
    }
    return undefined;
  }, []);
  if (!toasts.length) return null;
  const colors = {
    info: { bg: 'var(--ims-accent)', border: '#5b87b8', icon: 'ℹ' },
    success: { bg: '#1a4d2a', border: 'var(--ims-accent-2)', icon: '✓' },
    warning: { bg: '#8b6914', border: 'var(--ims-gold)', icon: '⚠' },
    error: { bg: '#8b1a1a', border: '#c03030', icon: '✗' },
  };
  return (
    <div style={{position: 'fixed', top: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10000, maxWidth: '380px'}}>
      {toasts.map(t => {
        const c = colors[t.type] || colors.info;
        return (
          <div key={t.id} onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} style={{padding: '12px 16px', background: c.bg, color: '#fff', borderLeft: `3px solid ${c.border}`, fontSize: '13px', fontFamily: 'Inter, sans-serif', boxShadow: '0 6px 24px rgba(0,0,0,0.25)', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '10px', lineHeight: 1.5}}>
            <span style={{fontSize: '15px', flexShrink: 0}}>{c.icon}</span>
            <span style={{flex: 1}}>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}

export { ToastContainer };

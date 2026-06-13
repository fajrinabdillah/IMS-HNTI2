// Extracted from App.jsx during modular refactor.
import { useState } from 'react';
import { Lock, X } from 'lucide-react';
function ChangePasswordModal({ session, employees, onSave, onClose, t, lang }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const currentPassword = employees[session.username]?.password || '';

  const handleSubmit = () => {
    setError('');
    if (current !== currentPassword) { setError(lang === 'id' ? 'Password saat ini salah.' : 'Current password is incorrect.'); return; }
    if (next.length < 6) { setError(lang === 'id' ? 'Password baru minimal 6 karakter.' : 'New password must be at least 6 characters.'); return; }
    if (next === currentPassword) { setError(lang === 'id' ? 'Password baru harus berbeda dari yang lama.' : 'New password must differ from the current one.'); return; }
    if (next !== confirm) { setError(lang === 'id' ? 'Konfirmasi password tidak cocok.' : 'Password confirmation does not match.'); return; }
    onSave(next);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{background: 'var(--ims-bg-card)', maxWidth: '440px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid var(--ims-border)'}}>
        <div style={{padding: '20px 24px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2 className="serif" style={{fontSize: '20px', margin: 0, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px'}}><Lock size={18} />{t.change_password}</h2>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ims-text-2)'}}><X size={20} /></button>
        </div>
        <div style={{padding: '22px 24px'}}>
          {employees[session.username]?.mustChangePassword && (
            <div style={{padding: '10px 12px', background: 'var(--ims-gold-bg)', border: '1px solid var(--ims-accent)', borderLeft: '3px solid var(--ims-accent)', marginBottom: '16px', fontSize: '12px', color: '#5a4a1a'}}>
              ⚠ {lang === 'id' ? 'Password Anda masih default. Demi keamanan, mohon ganti sekarang.' : 'Your password is still the default. For security, please change it now.'}
            </div>
          )}
          <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
            <div>
              <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.cp_current}</label>
              <input type={showPw ? 'text' : 'password'} value={current} onChange={e => setCurrent(e.target.value)} style={{width: '100%'}} />
            </div>
            <div>
              <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.cp_new}</label>
              <input type={showPw ? 'text' : 'password'} value={next} onChange={e => setNext(e.target.value)} style={{width: '100%'}} />
            </div>
            <div>
              <label style={{display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ims-text-2)', fontWeight: 600, marginBottom: '6px'}}>{t.cp_confirm}</label>
              <input type={showPw ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} style={{width: '100%'}} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
            <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--ims-text-2)', cursor: 'pointer'}}>
              <input type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)} style={{width: 'auto'}} />
              {lang === 'id' ? 'Tampilkan password' : 'Show password'}
            </label>
            {error && <div style={{padding: '8px 12px', background: '#c0303015', borderLeft: '3px solid #c03030', fontSize: '12px', color: '#c03030'}}>{error}</div>}
          </div>
        </div>
        <div style={{padding: '14px 24px', borderTop: '1px solid var(--ims-border)', background: 'var(--ims-bg)', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
          <button onClick={onClose} style={{background: 'transparent', border: '1px solid var(--ims-border)', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', color: 'var(--ims-text-2)', fontFamily: 'inherit'}}>{lang === 'id' ? 'Batal' : 'Cancel'}</button>
          <button onClick={handleSubmit} style={{background: 'var(--ims-bg-alt)', border: 'none', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', color: '#fff', fontFamily: 'inherit', fontWeight: 600}}>{t.cp_save}</button>
        </div>
      </div>
    </div>
  );
}

export { ChangePasswordModal };

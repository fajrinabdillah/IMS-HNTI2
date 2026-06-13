// Extracted from App.jsx during modular refactor.
const TOAST_EVENT = '__hnti_toast_event';
function showToast(message, type) {
  // type: 'info' | 'success' | 'warning' | 'error'
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof window.CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, type: type || 'info' } }));
    }
  } catch (_) {}
}

export { TOAST_EVENT, showToast };

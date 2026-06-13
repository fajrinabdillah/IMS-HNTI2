// Extracted from App.jsx during modular refactor.
import { IMS_THEMES } from '../constants/theme.js';
import { _THEME_KEY } from '../constants/storageKeys.js';
const getStoredTheme = () => {
  try {
    if (typeof window === 'undefined') return 've';
    const t = window.localStorage.getItem(_THEME_KEY);
    return IMS_THEMES[t] ? t : 've';
  } catch { return 've'; }
};
const setStoredTheme = (t) => {
  try {
    if (typeof window === 'undefined') return;
    if (IMS_THEMES[t]) window.localStorage.setItem(_THEME_KEY, t);
  } catch {}
};

export { getStoredTheme, setStoredTheme };

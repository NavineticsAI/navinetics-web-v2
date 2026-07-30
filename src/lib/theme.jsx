import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'nn-theme';

/**
 * Light is the default. The OS `prefers-color-scheme` setting is deliberately
 * NOT followed — a clinical site should open the same way for everyone, and a
 * dark first impression is not the one this brand wants to make. Dark is opt-in
 * via the toggle, and that choice is remembered.
 */
const DEFAULT_THEME = 'light';

const ThemeContext = createContext(null);

/**
 * Inline script for index.html. Runs before first paint so the page never
 * flashes the wrong theme. Kept in sync with the key and attribute used here.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{
var s=localStorage.getItem('${STORAGE_KEY}');
document.documentElement.setAttribute('data-theme', s==='dark'?'dark':'${DEFAULT_THEME}');
}catch(e){document.documentElement.setAttribute('data-theme','${DEFAULT_THEME}');}})();`;

function readTheme() {
  if (typeof document === 'undefined') return DEFAULT_THEME;
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* storage unavailable */
  }
  return DEFAULT_THEME;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readTheme);

  // Apply to the document, and keep the browser chrome colour in step. The
  // theme-color meta tag can't follow data-theme on its own.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.head.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#04141D' : '#F4F7F9');
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode — the choice just won't persist */
    }
  }, []);

  const toggle = useCallback(
    () => setTheme(readTheme() === 'dark' ? 'light' : 'dark'),
    [setTheme],
  );

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, setTheme, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

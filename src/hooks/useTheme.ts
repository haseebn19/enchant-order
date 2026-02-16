import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'enchant-order-theme';

export type ThemePreference = 'system' | 'light' | 'dark';

function getStoredTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  if (preference === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', preference);
  }
}

export function useTheme(): [ThemePreference, (_next: ThemePreference) => void] {
  const [theme, setThemeState] = useState<ThemePreference>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return [theme, setTheme];
}

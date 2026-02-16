import { useState, useEffect, useCallback } from 'react';
import type { LangStrings } from '../types/enchant';
import { LANGUAGES } from '../constants';

const LANG_STORAGE_KEY = 'enchant-order-lang';

export function useLanguage() {
  const [langId, setLangIdState] = useState<string>(() => {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    return stored && LANGUAGES[stored] ? stored : 'en';
  });
  const [strings, setStrings] = useState<LangStrings | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setLangId = useCallback((id: string) => {
    if (!LANGUAGES[id]) return;
    setLangIdState(id);
    localStorage.setItem(LANG_STORAGE_KEY, id);
  }, []);

  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    const url = `${base}languages/${langId}.json`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${url}`);
        return r.json();
      })
      .then((data) => {
        setError(null);
        setStrings(data);
      })
      .catch((e) => setError(e.message));
  }, [langId]);

  return { langId, setLangId, strings, error, languages: LANGUAGES };
}

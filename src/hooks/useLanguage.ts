import { useState, useEffect, useCallback } from 'react';
import type { LangStrings } from '../types/enchant';
import { LANGUAGES } from '../constants';
import { readSetting, saveSetting } from '../lib/storage';

const LANG_STORAGE_KEY = 'enchant-order-lang';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * A language's strings with English filling in any it is missing. Keys only the language has,
 * such as the Russian plural forms, are kept.
 */
export function mergeKeys(
  strings: Record<string, unknown>,
  fallback: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...strings };
  for (const [key, value] of Object.entries(fallback)) {
    if (isRecord(value)) {
      result[key] = mergeKeys(isRecord(strings[key]) ? strings[key] : {}, value);
    } else if (!Object.prototype.hasOwnProperty.call(strings, key)) {
      result[key] = value;
    }
  }
  return result;
}

export function useLanguage() {
  const [langId, setLangIdState] = useState<string>(() => {
    const stored = readSetting(LANG_STORAGE_KEY);
    return stored && LANGUAGES[stored] ? stored : 'en';
  });
  const [strings, setStrings] = useState<LangStrings | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setLangId = useCallback((id: string) => {
    if (!LANGUAGES[id]) return;
    setLangIdState(id);
    saveSetting(LANG_STORAGE_KEY, id);
  }, []);

  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    // A language picked while another is still loading replaces it, so ignore the older one
    let current = true;

    const loadJson = (lang: string) =>
      fetch(`${base}languages/${lang}.json`).then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${lang}.json`);
        return r.json();
      });

    const loaded =
      langId === 'en'
        ? loadJson('en')
        : Promise.all([loadJson(langId), loadJson('en')]).then(([langData, enData]) =>
            mergeKeys(langData, enData)
          );

    loaded
      .then((data) => {
        if (!current) return;
        setError(null);
        setStrings(data as LangStrings);
      })
      .catch((e: Error) => {
        if (current) setError(e.message);
      });

    return () => {
      current = false;
    };
  }, [langId]);

  return { langId, setLangId, strings, error, languages: LANGUAGES };
}

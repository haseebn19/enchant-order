/*
 * enchant-order - Minecraft enchantment optimization tool
 * Copyright (C) 2021 Cal Henderson
 * Copyright (C) 2025 haseebn19
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 */

import { useState, useMemo, useCallback } from 'react';
import { useLanguage } from './hooks/useLanguage';
import { useMatchMedia } from './hooks/useMatchMedia';
import { useTheme } from './hooks/useTheme';
import { enchantData } from './data/enchantData';
import { createCalculator } from './lib/anvilCalculator';
import { ItemPicker } from './components/ItemPicker';
import { LoadoutPicker } from './components/LoadoutPicker';
import { EnchantGrid } from './components/EnchantGrid';
import { SolutionPanel } from './components/SolutionPanel';
import { ENCHANTMENT_LIMIT } from './constants';
import type {
  EnchantSelection,
  CheapnessMode,
  ItemNamespace,
  EnchantNamespace,
  SolutionResult,
} from './types/enchant';
import './App.css';

export default function App() {
  const { langId, setLangId, strings: lang, error: langError, languages } = useLanguage();
  const [item, setItem] = useState<ItemNamespace | ''>('');
  const [selected, setSelected] = useState<EnchantSelection[]>([]);
  const [allowIncompatible, setAllowIncompatible] = useState(false);
  const [allowMany, setAllowMany] = useState(false);
  const [mode, setMode] = useState<CheapnessMode>('levels');
  const [result, setResult] = useState<SolutionResult | null>(null);
  const [resultMode, setResultMode] = useState<CheapnessMode>('levels');
  const [loading, setLoading] = useState(false);
  const [timeMs, setTimeMs] = useState<number | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const isWideViewport = useMatchMedia('(min-width: 800px)');
  const [theme, setTheme] = useTheme();

  const calculator = useMemo(() => createCalculator(enchantData.enchants), []);

  const handleItemChange = useCallback((newItem: ItemNamespace | '') => {
    setItem(newItem);
    setSelected([]);
    setResult(null);
  }, []);

  const applyLoadout = useCallback((enchants: EnchantSelection[]) => {
    setSelected(enchants);
    if (enchants.length > ENCHANTMENT_LIMIT) setAllowMany(true);
  }, []);

  const toggleEnchant = useCallback(
    (namespace: EnchantNamespace, level: number) => {
      setSelected((prev) => {
        const has = prev.some(([n, l]) => n === namespace && l === level);
        if (has) {
          return prev.filter(([n, l]) => !(n === namespace && l === level));
        }
        if (!allowMany && prev.length >= ENCHANTMENT_LIMIT) return prev;
        if (!allowIncompatible) {
          const incompatible = enchantData.enchants[namespace]?.incompatible ?? [];
          const withoutIncompatible = prev.filter(([n]) => !incompatible.includes(n));
          return [...withoutIncompatible, [namespace, level]];
        }
        return [...prev, [namespace, level]];
      });
    },
    [allowIncompatible, allowMany]
  );

  const calculate = useCallback(() => {
    if (selected.length === 0 || !item) return;
    setLoading(true);
    setResult(null);
    setTimeMs(null);
    const start = performance.now();
    requestAnimationFrame(() => {
      try {
        const solution = calculator.process(item, selected, mode);
        setResult(solution);
        setResultMode(mode);
        setTimeMs(performance.now() - start);
      } catch {
        setResult({
          item_obj: { x: 0 },
          instructions: [],
          extra: [0, 0],
          enchants: selected,
        });
        setResultMode(mode);
        setTimeMs(performance.now() - start);
      }
      setLoading(false);
    });
  }, [item, selected, mode, calculator]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <h1 className="logo">{lang?.logo_title ?? 'Enchant Order'}</h1>
          <div className="topbar-actions">
            <select
              aria-label="Theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'system' | 'light' | 'dark')}
              className="lang-pill"
            >
              <option value="system">{lang?.theme_system ?? 'System'}</option>
              <option value="light">{lang?.light_mode ?? 'Light'}</option>
              <option value="dark">{lang?.dark_mode ?? 'Dark'}</option>
            </select>
            <select
              aria-label="Language"
              value={langId}
              onChange={(e) => setLangId(e.target.value)}
              className="lang-pill"
            >
              {Object.entries(languages).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {langError && <p className="lang-error">{langError}</p>}
      </header>

      <main className="main">
        <section className="about-section">
          <button
            type="button"
            className="about-toggle"
            onClick={() => setAboutOpen((o) => !o)}
            aria-expanded={aboutOpen}
          >
            {lang?.about_toggle ?? 'What is this?'}
          </button>
          {aboutOpen && (
            <div className="about-content">
              <div
                className="about-html"
                dangerouslySetInnerHTML={{ __html: lang?.paragraph_1 ?? '' }}
              />
              <p>{lang?.paragraph_2}</p>
              <p>{lang?.paragraph_3}</p>
            </div>
          )}
        </section>

        <div className={`main-columns ${isWideViewport ? 'layout-wide' : ''}`}>
          <section className="workspace card">
            <h2 className="workspace-title">{lang?.workspace_title ?? 'Build your setup'}</h2>

            <div className="workspace-step">
              <span className="step-label">{lang?.step_1_item ?? '1. Item'}</span>
              <ItemPicker
                items={enchantData.items}
                value={item}
                onChange={handleItemChange}
                lang={lang}
              />
            </div>

            {item && (
              <>
                <div className="workspace-step">
                  <span className="step-label">
                    {lang?.step_2_enchantments ?? '2. Enchantments'}
                  </span>
                  <LoadoutPicker item={item} onApply={applyLoadout} lang={lang} />
                  <EnchantGrid
                    item={item}
                    data={enchantData}
                    selected={selected}
                    allowIncompatible={allowIncompatible}
                    allowMany={allowMany}
                    lang={lang}
                    onToggle={toggleEnchant}
                    onAllowIncompatibleChange={setAllowIncompatible}
                    onAllowManyChange={setAllowMany}
                  />
                </div>

                <div className="workspace-step">
                  <span className="step-label">
                    {lang?.step_3_optimize_for ?? '3. Optimize for'}
                  </span>
                  <div className="mode-toggle" role="group" aria-label="Optimization mode">
                    <button
                      type="button"
                      className={`mode-option ${mode === 'levels' ? 'active' : ''}`}
                      onClick={() => setMode('levels')}
                    >
                      {lang?.radio_label_optimize_xp ?? 'Least XP / levels'}
                    </button>
                    <button
                      type="button"
                      className={`mode-option ${mode === 'prior_work' ? 'active' : ''}`}
                      onClick={() => setMode('prior_work')}
                    >
                      {lang?.radio_label_optimize_pwp ?? 'Least prior work'}
                    </button>
                  </div>
                </div>

                <div className="workspace-cta">
                  <button
                    type="button"
                    className="cta-button"
                    onClick={calculate}
                    disabled={selected.length === 0 || loading}
                  >
                    {loading
                      ? (lang?.calculating_solution ?? 'Calculating…')
                      : (lang?.calculate ?? 'Find optimal order')}
                  </button>
                  {selected.length > 0 && (
                    <span className="cta-hint">
                      {(lang?.hint_enchantments_selected ?? '{count} enchantment(s) selected').replace(
                        '{count}',
                        String(selected.length)
                      )}
                    </span>
                  )}
                </div>
              </>
            )}
          </section>

          <aside className="result-column">
            {loading && (
              <div className="result-placeholder">
                <p className="progress">{lang?.calculating_solution ?? 'Calculating…'}</p>
              </div>
            )}
            {result && !loading && (
              <section className="result-section card result-card">
                <SolutionPanel
                  result={result}
                  timeMs={timeMs}
                  mode={resultMode}
                  lang={lang}
                  enchantsList={result.enchants}
                />
              </section>
            )}
          </aside>
        </div>
      </main>

      <footer className="footer">
        <p>
          <a href="https://github.com/haseebn19/enchant-order">
            {lang?.view_on_github ?? 'View on GitHub'}
          </a>
        </p>
      </footer>
    </div>
  );
}

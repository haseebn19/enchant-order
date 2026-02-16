import type { LangStrings } from '../types/enchant';

const fallbacks = {
  millisecond: ' ms',
  millisecond_s: ' ms',
  second: ' s',
  second_s: ' s',
  level: ' level',
  level_s: ' levels',
  xp: ' xp',
};

export function pluralize(
  num: number,
  keyRoot: 'millisecond' | 'second' | 'level',
  lang: LangStrings | null
): string {
  if (!lang)
    return (
      num + (num === 1 ? fallbacks[keyRoot] : fallbacks[(keyRoot + '_s') as keyof typeof fallbacks])
    );
  const L = lang as unknown as Record<string, string>;
  if (
    L.use_russian_plurals &&
    (keyRoot === 'level' || keyRoot === 'second' || keyRoot === 'millisecond')
  ) {
    const key = keyRoot === 'level' ? 'level' : keyRoot;
    if (num % 10 === 1 && (num < 10 || num > 15)) return String(num) + L[key];
    if ((num % 10 === 2 || num % 10 === 3 || num % 10 === 4) && (num < 10 || num > 15))
      return String(num) + L[key + '_low'];
    return String(num) + L[key + '_high'];
  }
  if (num === 1) return String(num) + (L[keyRoot] ?? fallbacks[keyRoot]);
  return String(num) + (L[keyRoot + '_s'] ?? fallbacks[(keyRoot + '_s') as keyof typeof fallbacks]);
}

export function formatTime(ms: number, lang: LangStrings | null): string {
  if (ms < 1) return Math.round(ms * 1000) + (lang?.microseconds ?? ' microseconds');
  if (ms < 1000) return pluralize(Math.round(ms), 'millisecond', lang);
  return pluralize(Math.round(ms / 1000), 'second', lang);
}

export function formatLevels(levels: number, lang: LangStrings | null): string {
  return pluralize(levels, 'level', lang);
}

export function formatXp(xp: number, lang: LangStrings | null, minXp = -1): string {
  let s = '';
  if (minXp >= 0) s += commaify(minXp) + '-';
  s += commaify(xp) + (lang?.xp ?? ' xp');
  return s;
}

export function commaify(n: number): string {
  const str = String(n);
  if (str.length <= 3) return str;
  let out = '';
  let rest = str;
  while (rest.length > 3) {
    out = ',' + rest.slice(-3) + out;
    rest = rest.slice(0, -3);
  }
  return rest + out;
}

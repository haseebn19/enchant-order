import type { LangStrings } from '../types/enchant';

type Unit = 'millisecond' | 'second' | 'level';

const fallbacks: Record<Unit | `${Unit}_s`, string> = {
  millisecond: ' ms',
  millisecond_s: ' ms',
  second: ' s',
  second_s: ' s',
  level: ' level',
  level_s: ' levels',
};

/** The number followed by the unit, in the form the language uses for that number. */
export function pluralize(num: number, unit: Unit, lang: LangStrings | null): string {
  if (lang?.use_russian_plurals) {
    // One form for 1, 21, 31, ...; another for 2 to 4, 22 to 24, ...; and a third for the
    // rest, which includes 11 to 14 in every hundred
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;
    if (lastDigit === 1 && lastTwoDigits !== 11) return `${num}${lang[unit]}`;
    const isFew = lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14);
    return `${num}${isFew ? lang[`${unit}_low` as const] : lang[`${unit}_high` as const]}`;
  }
  const key = num === 1 ? unit : (`${unit}_s` as const);
  return `${num}${lang?.[key] ?? fallbacks[key]}`;
}

export function formatTime(ms: number, lang: LangStrings | null): string {
  if (ms < 1) return Math.round(ms * 1000) + (lang?.microseconds ?? ' microseconds');
  if (ms < 1000) return pluralize(Math.round(ms), 'millisecond', lang);
  return pluralize(Math.round(ms / 1000), 'second', lang);
}

export function formatLevels(levels: number, lang: LangStrings | null): string {
  return pluralize(levels, 'level', lang);
}

/** The XP as text, or a range from `minXp` when the cost depends on how levels are earned. */
export function formatXp(xp: number, lang: LangStrings | null, minXp?: number): string {
  const range = minXp === undefined ? '' : commaify(minXp) + '-';
  return range + commaify(xp) + (lang?.xp ?? ' xp');
}

export function commaify(n: number): string {
  return n.toLocaleString('en-US');
}

import { describe, it, expect } from 'vitest';
import { commaify, pluralize, formatTime, formatLevels, formatXp } from './format';
import type { LangStrings } from '../types/enchant';

describe('commaify', () => {
  it('leaves numbers under 1,000 as they are', () => {
    expect(commaify(0)).toBe('0');
    expect(commaify(1)).toBe('1');
    expect(commaify(999)).toBe('999');
  });
  it('adds commas for thousands', () => {
    expect(commaify(1000)).toBe('1,000');
    expect(commaify(1234567)).toBe('1,234,567');
  });
});

describe('pluralize', () => {
  it('uses fallbacks when lang is null', () => {
    expect(pluralize(1, 'level', null)).toBe('1 level');
    expect(pluralize(2, 'level', null)).toBe('2 levels');
    expect(pluralize(1, 'second', null)).toBe('1 s');
    expect(pluralize(2, 'second', null)).toBe('2 s');
  });
  it('uses lang when provided', () => {
    const lang = {
      level: ' lvl',
      level_s: ' lvls',
      second: ' sec',
      second_s: ' secs',
      millisecond: ' ms',
      millisecond_s: ' ms',
    } as unknown as LangStrings;
    expect(pluralize(1, 'level', lang)).toBe('1 lvl');
    expect(pluralize(5, 'level', lang)).toBe('5 lvls');
  });
});

describe('pluralize with Russian plural forms', () => {
  const lang = {
    use_russian_plurals: true,
    level: ' one',
    level_low: ' few',
    level_high: ' many',
  } as unknown as LangStrings;

  it.each([
    [1, '1 one'],
    [2, '2 few'],
    [5, '5 many'],
    [11, '11 many'],
    [12, '12 many'],
    [21, '21 one'],
    [24, '24 few'],
    [111, '111 many'],
    [112, '112 many'],
    [121, '121 one'],
  ])('%i takes the right form', (num, expected) => {
    expect(pluralize(num, 'level', lang)).toBe(expected);
  });
});

describe('formatTime', () => {
  it('formats milliseconds', () => {
    expect(formatTime(500, null)).toBe('500 ms');
    expect(formatTime(1, null)).toBe('1 ms');
  });
  it('formats seconds when ms >= 1000', () => {
    expect(formatTime(1000, null)).toBe('1 s');
    expect(formatTime(5000, null)).toBe('5 s');
  });
  it('formats times under a millisecond in microseconds', () => {
    expect(formatTime(0.5, null)).toBe('500 microseconds');
  });
});

describe('formatLevels', () => {
  it('pluralizes levels with null lang', () => {
    expect(formatLevels(1, null)).toBe('1 level');
    expect(formatLevels(10, null)).toBe('10 levels');
  });
});

describe('formatXp', () => {
  it('formats xp without a range when there is no minimum', () => {
    expect(formatXp(100, null)).toBe('100 xp');
  });
  it('formats a range from the minimum xp', () => {
    expect(formatXp(100, null, 50)).toBe('50-100 xp');
  });
});

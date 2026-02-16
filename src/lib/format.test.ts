import { describe, it, expect } from 'vitest';
import { commaify, pluralize, formatTime, formatLevels, formatXp } from './format';
import type { LangStrings } from '../types/enchant';

describe('commaify', () => {
  it('returns string as-is when length <= 3', () => {
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

describe('formatTime', () => {
  it('formats milliseconds', () => {
    expect(formatTime(500, null)).toBe('500 ms');
    expect(formatTime(1, null)).toBe('1 ms');
  });
  it('formats seconds when ms >= 1000', () => {
    expect(formatTime(1000, null)).toBe('1 s');
    expect(formatTime(5000, null)).toBe('5 s');
  });
  it('uses lang microseconds when ms < 1', () => {
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
  it('formats xp without range when minXp < 0', () => {
    expect(formatXp(100, null)).toBe('100 xp');
  });
  it('formats xp range when minXp >= 0', () => {
    expect(formatXp(100, null, 50)).toBe('50-100 xp');
  });
});

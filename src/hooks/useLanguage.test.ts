import { describe, expect, it } from 'vitest';
import { mergeKeys } from './useLanguage';

describe('mergeKeys', () => {
  it('fills missing strings from the fallback and keeps strings only the language has', () => {
    const russian = { calculate: 'Вычислить', level_low: ' уровня', items: { sword: 'Меч' } };
    const english = {
      calculate: 'Calculate',
      cost: 'Cost: ',
      items: { sword: 'Sword', bow: 'Bow' },
    };

    expect(mergeKeys(russian, english)).toEqual({
      calculate: 'Вычислить',
      cost: 'Cost: ',
      level_low: ' уровня',
      items: { sword: 'Меч', bow: 'Bow' },
    });
  });
});

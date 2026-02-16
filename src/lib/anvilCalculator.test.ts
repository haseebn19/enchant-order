import { describe, it, expect } from 'vitest';
import { createCalculator } from './anvilCalculator';

const simpleEnchants: Record<string, { weight: number }> = {
  a: { weight: 1 },
  b: { weight: 1 },
  c: { weight: 1 },
};

describe('createCalculator', () => {
  it('returns a calculator with process function', () => {
    const calc = createCalculator(simpleEnchants);
    expect(calc).toHaveProperty('process');
    expect(typeof calc.process).toBe('function');
  });

  it('processes single enchant on item', () => {
    const calc = createCalculator(simpleEnchants);
    const result = calc.process('pickaxe', [['a', 1]], 'levels');
    expect(result.enchants).toEqual([['a', 1]]);
    expect(result.instructions).toBeDefined();
    expect(result.extra).toBeDefined();
    expect(result.extra.length).toBe(2);
  });

  it('processes multiple enchants and returns instructions', () => {
    const calc = createCalculator(simpleEnchants);
    const result = calc.process('pickaxe', [['a', 1], ['b', 1]], 'levels');
    expect(result.instructions.length).toBeGreaterThan(0);
    expect(result.enchants).toHaveLength(2);
  });

  it('supports prior_work mode', () => {
    const calc = createCalculator(simpleEnchants);
    const result = calc.process('pickaxe', [['a', 1], ['b', 1]], 'prior_work');
    expect(result.enchants).toHaveLength(2);
    expect(result.extra).toBeDefined();
  });

  it('processes book as item', () => {
    const calc = createCalculator(simpleEnchants);
    const result = calc.process('book', [['a', 1], ['b', 1]], 'levels');
    expect(result.item_obj).toBeDefined();
    expect(result.instructions).toBeDefined();
  });
});

import { describe, it, expect } from 'vitest';
import { enchantData } from '../data/enchantData';
import { createCalculator, noSolution } from './anvilCalculator';

const calculator = createCalculator(enchantData.enchants);

describe('createCalculator', () => {
  it('puts a single book straight onto the item', () => {
    const result = calculator.process('pickaxe', [['efficiency', 5]], 'levels');

    expect(result.steps).toHaveLength(1);
    const [step] = result.steps;
    expect(step.target.I).toBe('pickaxe');
    expect(step.sacrifice.I).toBe('efficiency');
    // Efficiency has weight 1, so level 5 costs 5 levels on a fresh item
    expect(step).toMatchObject({ levels: 5, xp: 55, priorWorkPenalty: 1 });
    expect(result).toMatchObject({ totalLevels: 5, totalXp: 55, minimumXp: 55 });
  });

  it('applies the most valuable book first and counts the prior work penalty', () => {
    const result = calculator.process(
      'sword',
      [
        ['unbreaking', 3],
        ['sharpness', 5],
      ],
      'levels'
    );

    expect(result.steps.map((step) => step.sacrifice.I)).toEqual(['sharpness', 'unbreaking']);
    // The second merge pays 1 level of prior work penalty for the first
    expect(result.steps.map((step) => step.levels)).toEqual([5, 4]);
    expect(result.totalLevels).toBe(9);
    expect(result.totalXp).toBe(135); // 9 levels saved up at once
    expect(result.minimumXp).toBe(95); // 55 + 40, earning the levels between merges
  });

  it('builds on the most valuable book when enchanting a book', () => {
    const result = calculator.process(
      'book',
      [
        ['unbreaking', 3],
        ['sharpness', 5],
      ],
      'levels'
    );

    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].target.I).toBe('sharpness');
    expect(result.steps[0].sacrifice.I).toBe('unbreaking');
  });

  it('has nothing to combine for a single book', () => {
    expect(calculator.process('book', [['mending', 1]], 'levels')).toEqual(
      noSolution([['mending', 1]])
    );
  });

  it('finds no solution when every order costs more than the anvil allows', () => {
    const heavy = createCalculator({ a: { weight: 8 }, b: { weight: 8 } });
    const result = heavy.process(
      'item',
      [
        ['a', 5],
        ['b', 5],
      ],
      'levels'
    );

    expect(result.steps).toEqual([]);
  });

  it('trades total levels for a lower prior work penalty in prior work mode', () => {
    const books: [string, number][] = [
      ['protection', 4],
      ['unbreaking', 3],
      ['mending', 1],
      ['thorns', 3],
      ['respiration', 3],
      ['aqua_affinity', 1],
    ];
    const byLevels = calculator.process('helmet', books, 'levels');
    const byPriorWork = calculator.process('helmet', books, 'prior_work');
    const finalPenalty = (steps: typeof byLevels.steps) =>
      Math.max(...steps.map((step) => step.priorWorkPenalty));

    expect(byPriorWork.totalLevels).toBeGreaterThanOrEqual(byLevels.totalLevels);
    expect(finalPenalty(byPriorWork.steps)).toBeLessThanOrEqual(finalPenalty(byLevels.steps));
  });
});

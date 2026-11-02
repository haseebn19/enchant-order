import { describe, expect, it } from 'vitest';
import { enchantData } from './enchantData';
import { ITEM_CATEGORIES } from './itemCategories';
import { loadoutsByItem } from './loadouts';

const { enchants, items } = enchantData;

describe('loadouts', () => {
  const loadouts = Object.entries(loadoutsByItem).flatMap(([item, list]) =>
    list.map((loadout) => ({ item, loadout }))
  );

  it.each(loadouts)('$loadout.id uses enchantments its item can take', ({ item, loadout }) => {
    expect(items).toContain(item);
    for (const [namespace, level] of loadout.enchants) {
      const enchant = enchants[namespace];
      expect(enchant, namespace).toBeDefined();
      expect(enchant.items, namespace).toContain(item);
      expect(level, namespace).toBeGreaterThanOrEqual(1);
      expect(level, namespace).toBeLessThanOrEqual(enchant.levelMax);
    }
  });

  it.each(loadouts)('$loadout.id has no incompatible enchantments', ({ loadout }) => {
    const chosen = loadout.enchants.map(([namespace]) => namespace);
    for (const namespace of chosen) {
      expect(chosen.filter((other) => enchants[namespace].incompatible.includes(other))).toEqual(
        []
      );
    }
  });
});

describe('enchantments', () => {
  it('incompatibilities go both ways', () => {
    for (const [namespace, enchant] of Object.entries(enchants)) {
      for (const other of enchant.incompatible) {
        expect(enchants[other]?.incompatible, `${other} should list ${namespace}`).toContain(
          namespace
        );
      }
    }
  });

  it('every enchantment applies to known items', () => {
    for (const [namespace, enchant] of Object.entries(enchants)) {
      expect(
        enchant.items.filter((item) => !items.includes(item)),
        namespace
      ).toEqual([]);
    }
  });
});

describe('items', () => {
  it('every item is in exactly one category', () => {
    const categorized = ITEM_CATEGORIES.flatMap((category) => category.items);
    expect([...categorized].sort()).toEqual([...items].sort());
  });

  const images = Object.keys(import.meta.glob('../../public/images/*.gif'));

  it.each(items)('%s has an image', (item) => {
    expect(images).toContain(`../../public/images/${item}.gif`);
  });
});

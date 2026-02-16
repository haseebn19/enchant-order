import type { ItemNamespace } from '../types/enchant';

export const ITEM_CATEGORIES: { key: string; items: ItemNamespace[] }[] = [
  {
    key: 'armor',
    items: ['helmet', 'chestplate', 'leggings', 'boots', 'turtle_shell', 'elytra', 'shield'],
  },
  {
    key: 'weapons',
    items: ['sword', 'axe', 'mace', 'spear', 'trident', 'bow', 'crossbow'],
  },
  {
    key: 'tools',
    items: ['pickaxe', 'shovel', 'hoe', 'brush', 'fishing_rod', 'shears'],
  },
  {
    key: 'other',
    items: ['flint_and_steel', 'carrot_on_a_stick', 'warped_fungus_on_a_stick', 'pumpkin', 'book'],
  },
];

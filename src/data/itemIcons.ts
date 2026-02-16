const MC_VERSION = '1.21.1';

const namespaceToTexture: Record<string, string> = {
  helmet: 'diamond_helmet',
  chestplate: 'diamond_chestplate',
  leggings: 'diamond_leggings',
  boots: 'diamond_boots',
  turtle_shell: 'turtle_helmet',
  elytra: 'elytra',
  sword: 'diamond_sword',
  axe: 'diamond_axe',
  mace: 'mace',
  spear: 'trident',
  trident: 'trident',
  bow: 'bow',
  crossbow: 'crossbow',
  pickaxe: 'diamond_pickaxe',
  shovel: 'diamond_shovel',
  hoe: 'diamond_hoe',
  shield: 'shield',
  brush: 'brush',
  fishing_rod: 'fishing_rod',
  shears: 'shears',
  flint_and_steel: 'flint_and_steel',
  carrot_on_a_stick: 'carrot_on_a_stick',
  warped_fungus_on_a_stick: 'warped_fungus_on_a_stick',
  pumpkin: 'carved_pumpkin',
  book: 'enchanted_book',
};

export function getItemIconUrl(namespace: string): string {
  return `/images/${namespace}.gif`;
}

export function getItemIconFallbackUrl(namespace: string): string | null {
  const texture = namespaceToTexture[namespace];
  if (!texture) return null;
  return `https://mcasset.cloud/${MC_VERSION}/assets/minecraft/textures/item/${texture}.png`;
}

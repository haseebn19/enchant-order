export type ItemNamespace = string;
export type EnchantNamespace = string;

export interface EnchantDef {
  levelMax: number;
  weight: number;
  incompatible: EnchantNamespace[];
  items: ItemNamespace[];
}

export interface EnchantData {
  enchants: Record<EnchantNamespace, EnchantDef>;
  items: ItemNamespace[];
}

export type CheapnessMode = 'levels' | 'prior_work';
export type EnchantSelection = [EnchantNamespace, number];
export type SolutionStep = [ItemNode, ItemNode, number, number, number];

export interface ItemNode {
  I: EnchantNamespace | ItemNamespace | number;
  L?: ItemNode;
  R?: ItemNode;
  l?: number;
  w?: number;
  v?: number;
}

export interface SolutionResult {
  item_obj: { x: number; [key: string]: unknown };
  instructions: SolutionStep[];
  extra: [number, number];
  enchants: EnchantSelection[];
}

export interface LangStrings {
  paragraph_1: string;
  paragraph_2: string;
  paragraph_3: string;
  choose_an_item_to_enchant: string;
  checkbox_label_incompatible: string;
  checkbox_label_max_number: string;
  calculate: string;
  radio_label_optimize_xp: string;
  radio_label_optimize_pwp: string;
  optimal_solution_cumulative_levels: string;
  optimal_solution_prior_work: string;
  total_cost: string;
  completed_in: string;
  microseconds: string;
  millisecond: string;
  millisecond_s: string;
  second: string;
  second_s: string;
  level: string;
  level_s: string;
  xp: string;
  steps: string;
  combine: string;
  with: string;
  cost: string;
  prior_work_penalty: string;
  no_solution_found: string;
  calculating_solution: string;
  note: string;
  items: Record<ItemNamespace, string>;
  enchants: Record<EnchantNamespace, string>;
  h1_title?: string;
  logo_title?: string;
  workspace_title?: string;
  about_toggle?: string;
  step_1_item?: string;
  step_2_enchantments?: string;
  step_3_optimize_for?: string;
  quick_loadout?: string;
  view_on_github?: string;
  theme_system?: string;
  category_armor?: string;
  category_weapons?: string;
  category_tools?: string;
  category_other?: string;
  loadouts?: Record<string, string>;
  optimize_for?: string;
  too_many_enchantments?: string;
  more_than?: string;
  enchantments_are_not_recommended?: string;
  please_select_enchantments?: string;
  light_mode?: string;
  dark_mode?: string;
  use_russian_plurals?: boolean;
  level_low?: string;
  level_high?: string;
  second_low?: string;
  second_high?: string;
  millisecond_low?: string;
  millisecond_high?: string;
  hint_enchantments_selected?: string;
}

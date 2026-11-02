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

/**
 * A node in the tree of merges behind a solution. A leaf has `I`: the enchantment of a book, or
 * the item being enchanted. A merge has the two things combined, `L` (the target) and `R` (the
 * sacrifice). The single-letter names come from the original tool.
 */
export interface ItemNode {
  I?: EnchantNamespace | ItemNamespace | number;
  L?: ItemNode;
  R?: ItemNode;
  /** For a merge, its level cost. For a leaf, the enchantment value (level times weight). */
  l?: number;
  /** Prior work: the number of anvil merges that went into it */
  w?: number;
  /** For a merge, the enchantment value of the result */
  v?: number;
}

/** One anvil merge in a solution: put the sacrifice onto the target. */
export interface SolutionStep {
  target: ItemNode;
  sacrifice: ItemNode;
  /** Level cost of this merge */
  levels: number;
  /** Experience points for that many levels, starting from level 0 */
  xp: number;
  /** Prior work penalty of the result, which adds to the cost of later merges */
  priorWorkPenalty: number;
}

export interface SolutionResult {
  /** The merges in order. Empty when no order keeps every merge within the anvil's limit. */
  steps: SolutionStep[];
  /** Levels across all merges */
  totalLevels: number;
  /** Experience for all those levels at once, starting from level 0 */
  totalXp: number;
  /** Experience if every merge starts from level 0, the least the solution can cost */
  minimumXp: number;
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

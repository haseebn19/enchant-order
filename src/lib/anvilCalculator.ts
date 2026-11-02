/**
 * Finds the cheapest order to combine enchanted books onto an item in an anvil.
 *
 * The approach comes from iamcal/enchant-order: every way of splitting the books into two
 * groups is tried recursively, and for each group the cheapest result is kept for every prior
 * work count, since a cheaper merge now can mean a larger penalty later. The search grows
 * exponentially with the number of books, which is fine for the handful an item can hold.
 */
import type {
  CheapnessMode,
  EnchantSelection,
  ItemNode,
  SolutionResult,
  SolutionStep,
} from '../types/enchant';

// Survival anvils refuse merges above 39 levels ("Too Expensive!")
const MAXIMUM_MERGE_LEVELS = 39;

class MergeTooExpensiveError extends Error {
  constructor() {
    super('Merge costs more levels than an anvil allows');
    this.name = 'MergeTooExpensiveError';
  }
}

/** Experience points needed to reach a level from level 0. */
function experience(level: number): number {
  if (level === 0) return 0;
  if (level <= 16) return level ** 2 + 6 * level;
  if (level <= 31) return 2.5 * level ** 2 - 40.5 * level + 360;
  return 4.5 * level ** 2 - 162.5 * level + 2220;
}

/** Levels an anvil adds for an item that has been through `priorWork` merges. */
function priorWorkPenalty(priorWork: number): number {
  return 2 ** priorWork - 1;
}

/**
 * What a partial result is built on: a book, the item, or when enchanting a book, the
 * enchantment ID of the book chosen as the base.
 */
type ItemKind = 'book' | 'item' | number;

/** A book or item partway through the process, with how it was made. */
interface AnvilItem {
  kind: ItemKind;
  enchantIds: number[];
  /** How it was made, as the tree the steps are read from */
  tree: ItemNode;
  /** Number of anvil merges that went into it */
  priorWork: number;
  /** Sum of level times weight of its enchantments, the base cost of using it as a sacrifice */
  value: number;
  /** Experience spent on its merges, each counted from level 0 */
  xp: number;
}

/** The cheapest item found for each prior work count. */
type ByPriorWork = Record<number, AnvilItem>;

/** Every k-element subset of the set, keeping the set's order. */
function combinations<T>(set: T[], k: number): T[][] {
  if (k > set.length || k <= 0) return [];
  if (k === set.length) return [set.slice()];
  if (k === 1) return set.map((x) => [x]);

  const result: T[][] = [];
  for (let i = 0; i < set.length - k + 1; i++) {
    for (const tail of combinations(set.slice(i + 1), k - 1)) {
      result.push([set[i], ...tail]);
    }
  }
  return result;
}

/** A key that is the same for groups of items that would give the same results. */
function groupKey(items: AnvilItem[]): string {
  return JSON.stringify(
    items.map((item) => [item.kind, [...item.enchantIds].sort((a, b) => a - b), item.priorWork])
  );
}

/** The result shown when no order keeps every merge within the anvil's limit. */
export function noSolution(enchants: EnchantSelection[]): SolutionResult {
  return { steps: [], totalLevels: 0, totalXp: 0, minimumXp: 0, enchants };
}

export function createCalculator(enchants: Record<string, { weight: number }>) {
  const namespaces = Object.keys(enchants);
  const enchantIds: Record<string, number> = Object.fromEntries(
    namespaces.map((namespace, id) => [namespace, id])
  );
  const weights = namespaces.map((namespace) => enchants[namespace].weight);

  // Results for each group of items, cleared for every new calculation
  let memo: Record<string, ByPriorWork> = {};

  function newItem(kind: ItemKind, value = 0, ids: number[] = []): AnvilItem {
    return { kind, enchantIds: ids, tree: {}, priorWork: 0, value, xp: 0 };
  }

  /** Put the sacrifice onto the target. Throws if the anvil would refuse it. */
  function merge(target: AnvilItem, sacrifice: AnvilItem): AnvilItem {
    const levels =
      sacrifice.value + priorWorkPenalty(target.priorWork) + priorWorkPenalty(sacrifice.priorWork);
    if (levels > MAXIMUM_MERGE_LEVELS) throw new MergeTooExpensiveError();

    const merged = newItem(target.kind, target.value + sacrifice.value);
    merged.enchantIds = [...target.enchantIds, ...sacrifice.enchantIds];
    merged.priorWork = Math.max(target.priorWork, sacrifice.priorWork) + 1;
    merged.xp = target.xp + sacrifice.xp + experience(levels);
    merged.tree = {
      L: target.tree,
      R: sacrifice.tree,
      l: levels,
      w: merged.priorWork,
      v: merged.value,
    };
    return merged;
  }

  function tryMerge(target: AnvilItem, sacrifice: AnvilItem): AnvilItem | null {
    try {
      return merge(target, sacrifice);
    } catch (error) {
      if (error instanceof MergeTooExpensiveError) return null;
      throw error;
    }
  }

  /** The cheaper of two items with the same prior work: lower value, then less experience. */
  function cheaper(a: AnvilItem, b: AnvilItem): AnvilItem {
    if (a.value !== b.value) return a.value < b.value ? a : b;
    return a.xp <= b.xp ? a : b;
  }

  /** Add the item to the map unless an item with the same prior work is already cheaper. */
  function keepCheapest(byWork: ByPriorWork, item: AnvilItem): void {
    const existing = byWork[item.priorWork];
    byWork[item.priorWork] = existing ? cheaper(existing, item) : item;
  }

  /** Drop items that have more prior work than another item without being cheaper. */
  function withoutDominated(byWork: ByPriorWork): ByPriorWork {
    const kept: ByPriorWork = {};
    let lowestValue = Infinity;
    // Numeric keys iterate in ascending order, so this goes from least to most prior work
    for (const item of Object.values(byWork)) {
      if (item.value < lowestValue) {
        kept[item.priorWork] = item;
        lowestValue = item.value;
      }
    }
    return kept;
  }

  /** Merge two items in whichever order is cheaper. The item itself is always the target. */
  function cheapestMergeOfTwo(a: AnvilItem, b: AnvilItem): AnvilItem {
    if (b.kind === 'item') return merge(b, a);
    if (a.kind === 'item') return merge(a, b);

    const forward = tryMerge(a, b);
    if (!forward) return merge(b, a);
    const reverse = tryMerge(b, a);
    return reverse ? cheaper(forward, reverse) : forward;
  }

  /** The cheapest ways to combine every item in the group into one, by prior work. */
  function cheapestByPriorWork(items: AnvilItem[]): ByPriorWork {
    const key = groupKey(items);
    if (memo[key]) return memo[key];

    let byWork: ByPriorWork;
    if (items.length === 1) {
      byWork = { [items[0].priorWork]: items[0] };
    } else if (items.length === 2) {
      const merged = cheapestMergeOfTwo(items[0], items[1]);
      byWork = { [merged.priorWork]: merged };
    } else {
      byWork = cheapestFromSplits(items);
    }

    memo[key] = byWork;
    return byWork;
  }

  /** Try every split of the group into two smaller groups, combining each side first. */
  function cheapestFromSplits(items: AnvilItem[]): ByPriorWork {
    const byWork: ByPriorWork = {};
    for (let size = 1; size <= Math.floor(items.length / 2); size++) {
      for (const left of combinations(items, size)) {
        const right = items.filter((item) => !left.includes(item));
        const merged = cheapestMergeOfGroups(cheapestByPriorWork(left), cheapestByPriorWork(right));
        for (const item of Object.values(merged)) keepCheapest(byWork, item);
      }
    }
    return byWork;
  }

  /** Merge each candidate from one group with each from the other, keeping the best. */
  function cheapestMergeOfGroups(left: ByPriorWork, right: ByPriorWork): ByPriorWork {
    const byWork: ByPriorWork = {};
    for (const leftItem of Object.values(left)) {
      for (const rightItem of Object.values(right)) {
        let merged: ByPriorWork;
        try {
          merged = cheapestByPriorWork([leftItem, rightItem]);
        } catch (error) {
          if (error instanceof MergeTooExpensiveError) continue;
          throw error;
        }
        for (const item of Object.values(merged)) keepCheapest(byWork, item);
      }
    }
    return withoutDominated(byWork);
  }

  /**
   * The sum of `l` across the tree: every merge's level cost, plus every book's value. The
   * book values add the same amount to every order, so they do not change which is cheapest.
   */
  function levelsInTree(node: ItemNode): number {
    let sum = node.l ?? 0;
    if (typeof node.L?.l === 'number') sum += levelsInTree(node.L);
    if (typeof node.R?.l === 'number') sum += levelsInTree(node.R);
    return sum;
  }

  /**
   * The merges in the tree, in the order to make them. Leaves are relabelled as they are
   * reached: enchantment IDs become their names, and the item becomes `itemName`.
   */
  function stepsFromTree(node: ItemNode, itemName: string): SolutionStep[] {
    const steps: SolutionStep[] = [];
    for (const child of [node.L, node.R]) {
      if (!child) continue;
      if (child.I === undefined) {
        steps.push(...stepsFromTree(child, itemName));
      } else if (typeof child.I === 'number') {
        child.I = namespaces[child.I];
      } else if (!(child.I in enchantIds)) {
        child.I = itemName;
      }
    }

    const target = node.L as ItemNode;
    const sacrifice = node.R as ItemNode;
    const sacrificeValue = typeof sacrifice.v === 'number' ? sacrifice.v : (sacrifice.l ?? 0);
    const levels =
      sacrificeValue + priorWorkPenalty(target.w ?? 0) + priorWorkPenalty(sacrifice.w ?? 0);
    const priorWork = Math.max(target.w ?? 0, sacrifice.w ?? 0) + 1;
    steps.push({
      target,
      sacrifice,
      levels,
      xp: experience(levels),
      priorWorkPenalty: priorWorkPenalty(priorWork),
    });
    return steps;
  }

  /** Index of the most valuable item, the first one if several tie. */
  function mostValuableIndex(items: AnvilItem[]): number {
    return items.reduce((best, item, i) => (item.value > items[best].value ? i : best), 0);
  }

  /**
   * Find the cheapest order to put the enchantments on the item, by total levels or by the
   * final prior work penalty.
   */
  function process(
    itemName: string,
    selection: EnchantSelection[],
    mode: CheapnessMode = 'levels'
  ): SolutionResult {
    memo = {};
    const books = selection.map(([namespace, level]) => {
      const id = enchantIds[namespace];
      const book = newItem('book', level * weights[id], [id]);
      book.tree = { I: id, l: book.value, w: book.priorWork };
      return book;
    });

    let base: AnvilItem;
    if (itemName === 'book') {
      // When enchanting a book, the most valuable book is the one the others go onto
      const [first] = books.splice(mostValuableIndex(books), 1);
      base = newItem(first.enchantIds[0], first.value, [first.enchantIds[0]]);
    } else {
      base = newItem('item');
    }

    if (books.length === 0) return noSolution(selection);

    let byWork: ByPriorWork;
    try {
      // The most valuable book always goes on first
      const [firstBook] = books.splice(mostValuableIndex(books), 1);
      const start = merge(base, firstBook);
      start.tree.L = { I: base.kind, l: 0, w: 0 };
      byWork = cheapestByPriorWork([...books, start]);
    } catch (error) {
      if (error instanceof MergeTooExpensiveError) return noSolution(selection);
      throw error;
    }

    let best: AnvilItem | undefined;
    let bestCost = Infinity;
    for (const item of Object.values(byWork)) {
      const cost = mode === 'levels' ? levelsInTree(item.tree) : item.priorWork;
      if (cost < bestCost) {
        bestCost = cost;
        best = item;
      }
    }
    if (!best) return noSolution(selection);

    const steps = stepsFromTree(best.tree, itemName);
    const totalLevels = steps.reduce((sum, step) => sum + step.levels, 0);
    return {
      steps,
      totalLevels,
      totalXp: experience(totalLevels),
      minimumXp: best.xp,
      enchants: selection,
    };
  }

  return { process };
}

import type {
  CheapnessMode,
  EnchantSelection,
  ItemNode,
  SolutionResult,
  SolutionStep,
} from '../types/enchant';

const MAXIMUM_MERGE_LEVELS = 39;

class MergeLevelsTooExpensiveError extends Error {
  constructor(message = 'merge levels is above maximum allowed') {
    super(message);
    this.name = 'MergeLevelsTooExpensiveError';
  }
}

function experience(level: number): number {
  if (level === 0) return 0;
  if (level <= 16) return level ** 2 + 6 * level;
  if (level <= 31) return 2.5 * level ** 2 - 40.5 * level + 360;
  return 4.5 * level ** 2 - 162.5 * level + 2220;
}

type ItemName = 'book' | 'item' | number;

interface InternalItem {
  i: ItemName;
  e: number[];
  c: Record<string, unknown>;
  w: number;
  l: number;
  x: number;
}

function combinations<T>(set: T[], k: number): T[][] {
  if (k > set.length || k <= 0) return [];
  if (k === set.length) return [set.slice()];
  if (k === 1) return set.map((x) => [x]);

  const combs: T[][] = [];
  for (let i = 0; i < set.length - k + 1; i++) {
    const head = set.slice(i, i + 1);
    const tailcombs = combinations(set.slice(i + 1), k - 1);
    for (let j = 0; j < tailcombs.length; j++) {
      combs.push(head.concat(tailcombs[j]));
    }
  }
  return combs;
}

function hashFromItem(item: InternalItem): [ItemName, number[], number] {
  const enchants = item.e.slice().sort((a, b) => a - b);
  const itemNamespace = item.i;
  const work = item.w;
  return [itemNamespace, enchants, work];
}

function memoKey(items: InternalItem[]): string {
  return JSON.stringify(items.map(hashFromItem));
}

export function createCalculator(enchants: Record<string, { weight: number }>) {
  const ID_LIST: Record<string, number> = {};
  const ENCHANTMENT2WEIGHT: number[] = [];
  let id = 0;
  for (const enchant in enchants) {
    const weight = enchants[enchant].weight;
    ID_LIST[enchant] = id;
    ENCHANTMENT2WEIGHT[id] = weight;
    id++;
  }

  const results: Record<string, Record<number, InternalItem>> = {};

  function ItemObj(name: ItemName, value = 0, enchantIds: number[] = []): InternalItem {
    return {
      i: name,
      e: enchantIds,
      c: {},
      w: 0,
      l: value,
      x: 0,
    };
  }

  function MergeEnchants(left: InternalItem, right: InternalItem): InternalItem {
    const mergeCost = right.l + 2 ** left.w - 1 + 2 ** right.w - 1;
    if (mergeCost > MAXIMUM_MERGE_LEVELS) throw new MergeLevelsTooExpensiveError();
    const newValue = left.l + right.l;
    const merged = ItemObj(left.i, newValue);
    merged.e = left.e.concat(right.e);
    merged.w = Math.max(left.w, right.w) + 1;
    merged.x = left.x + right.x + experience(mergeCost);
    merged.c = { L: left.c, R: right.c, l: mergeCost, w: merged.w, v: merged.l };
    return merged;
  }

  function cheapestItemFromItems2(left: InternalItem, right: InternalItem): InternalItem {
    if (right.i === 'item') return MergeEnchants(right, left);
    if (left.i === 'item') return MergeEnchants(left, right);

    let normal: InternalItem;
    try {
      normal = MergeEnchants(left, right);
    } catch {
      return MergeEnchants(right, left);
    }

    let reversed: InternalItem;
    try {
      reversed = MergeEnchants(right, left);
    } catch {
      return normal;
    }

    const compared = compareCheapest(normal, reversed);
    const works = Object.keys(compared).map(Number);
    return compared[works[0]];
  }

  function compareCheapest(item1: InternalItem, item2: InternalItem): Record<number, InternalItem> {
    const work2item: Record<number, InternalItem> = {};
    const work1 = item1.w;
    const work2 = item2.w;

    if (work1 === work2) {
      const value1 = item1.l;
      const value2 = item2.l;
      if (value1 === value2) {
        if (item1.x <= item2.x) work2item[work1] = item1;
        else work2item[work2] = item2;
      } else if (value1 < value2) {
        work2item[work1] = item1;
      } else {
        work2item[work2] = item2;
      }
    } else {
      work2item[work1] = item1;
      work2item[work2] = item2;
    }
    return work2item;
  }

  function removeExpensiveCandidatesFromDictionary(
    work2item: Record<number, InternalItem>
  ): Record<number, InternalItem> {
    const out: Record<number, InternalItem> = {};
    let cheapestValue: number | undefined;
    for (const work in work2item) {
      const item = work2item[work];
      const value = item.l;
      if (cheapestValue === undefined || value < cheapestValue) {
        out[work] = item;
        cheapestValue = value;
      }
    }
    return out;
  }

  function cheapestItemsFromList(items: InternalItem[]): Record<number, InternalItem> {
    const key = memoKey(items);
    if (results[key]) return results[key];

    const itemCount = items.length;
    let work2item: Record<number, InternalItem>;

    if (itemCount === 1) {
      const item = items[0];
      work2item = { [item.w]: item };
    } else if (itemCount === 2) {
      const cheapest = cheapestItemFromItems2(items[0], items[1]);
      work2item = { [cheapest.w]: cheapest };
    } else {
      work2item = cheapestItemsFromListN(items, Math.floor(itemCount / 2));
    }

    results[key] = work2item;
    return work2item;
  }

  function cheapestItemsFromListN(
    items: InternalItem[],
    maxSubcount: number
  ): Record<number, InternalItem> {
    const cheapestWork2item: Record<number, InternalItem> = {};
    const cheapestPriorWorks: number[] = [];

    for (let subcount = 1; subcount <= maxSubcount; subcount++) {
      combinations(items, subcount).forEach((leftItems) => {
        const rightItems = items.filter((obj) => !leftItems.includes(obj));
        const leftWork2item = cheapestItemsFromList(leftItems);
        const rightWork2item = cheapestItemsFromList(rightItems);
        const newWork2item = cheapestItemsFromDictionaries2(leftWork2item, rightWork2item);

        for (const workStr in newWork2item) {
          const work = Number(workStr);
          const newItem = newWork2item[work];
          if (cheapestPriorWorks.includes(work)) {
            const existing = cheapestWork2item[work];
            const compared = compareCheapest(existing, newItem);
            cheapestWork2item[work] = compared[work];
          } else {
            cheapestWork2item[work] = newItem;
            cheapestPriorWorks.push(work);
          }
        }
      });
    }
    return cheapestWork2item;
  }

  function cheapestItemsFromDictionaries2(
    left: Record<number, InternalItem>,
    right: Record<number, InternalItem>
  ): Record<number, InternalItem> {
    const cheapestWork2item: Record<number, InternalItem> = {};
    const cheapestPriorWorks: number[] = [];

    for (const lw in left) {
      const leftItem = left[lw];
      for (const rw in right) {
        const rightItem = right[rw];
        let newWork2item: Record<number, InternalItem>;
        try {
          newWork2item = cheapestItemsFromList([leftItem, rightItem]);
        } catch (err) {
          if (err instanceof MergeLevelsTooExpensiveError) continue;
          throw err;
        }
        for (const workStr in newWork2item) {
          const work = Number(workStr);
          const newItem = newWork2item[work];
          if (cheapestPriorWorks.includes(work)) {
            const existing = cheapestWork2item[work];
            const compared = compareCheapest(existing, newItem);
            cheapestWork2item[work] = compared[work];
          } else {
            cheapestWork2item[work] = newItem;
            cheapestPriorWorks.push(work);
          }
        }
      }
    }
    return removeExpensiveCandidatesFromDictionary(cheapestWork2item);
  }

  function sumLevelsFromComb(comb: Record<string, unknown>): number {
    const c = comb as { L?: Record<string, unknown>; R?: Record<string, unknown>; l?: number };
    let sum = c.l ?? 0;
    if (c.L && typeof (c.L as { l?: number }).l === 'number') sum += sumLevelsFromComb(c.L);
    if (c.R && typeof (c.R as { l?: number }).l === 'number') sum += sumLevelsFromComb(c.R);
    return sum;
  }

  function getInstructions(comb: Record<string, unknown>, itemName: string): SolutionStep[] {
    const instructions: SolutionStep[] = [];
    const c = comb as {
      L?: ItemNode & Record<string, unknown>;
      R?: ItemNode & Record<string, unknown>;
      l?: number;
      w?: number;
      v?: number;
    };

    const keys: ('L' | 'R')[] = ['L', 'R'];
    for (const key of keys) {
      const child = c[key];
      if (!child) continue;
      if (typeof (child as ItemNode).I === 'undefined') {
        const childInstructions = getInstructions(
          child as unknown as Record<string, unknown>,
          itemName
        );
        instructions.push(...childInstructions);
      }
      const childI = (child as ItemNode).I;
      if (typeof childI === 'number') {
        const namespace = Object.keys(ID_LIST).find((k) => ID_LIST[k] === childI);
        (child as ItemNode).I = (namespace ?? itemName) as string;
      } else if (typeof childI === 'string' && !(childI in ID_LIST)) {
        (child as ItemNode).I = itemName;
      }
    }

    const left = c.L as ItemNode;
    const right = c.R as ItemNode;
    let mergeCost: number;
    if (typeof (right as ItemNode & { v?: number }).v === 'number') {
      mergeCost =
        (right as ItemNode & { v: number }).v + 2 ** (left.w ?? 0) - 1 + 2 ** (right.w ?? 0) - 1;
    } else {
      mergeCost = (right.l ?? 0) + 2 ** (left.w ?? 0) - 1 + 2 ** (right.w ?? 0) - 1;
    }
    const work = Math.max(left.w ?? 0, right.w ?? 0) + 1;
    instructions.push([left, right, mergeCost, experience(mergeCost), 2 ** work - 1]);
    return instructions;
  }

  function process(
    itemName: string,
    enchants: EnchantSelection[],
    mode: CheapnessMode = 'levels'
  ): SolutionResult {
    for (const k of Object.keys(results)) delete results[k];
    const enchantObjs: InternalItem[] = enchants.map(([namespace, level]) => {
      const enchantId = ID_LIST[namespace];
      const weight = ENCHANTMENT2WEIGHT[enchantId];
      const value = level * weight;
      const obj = ItemObj('book', value, [enchantId]);
      obj.c = { I: enchantId, l: obj.l, w: obj.w };
      return obj;
    });

    let mostExpensiveIdx = enchantObjs.reduce(
      (maxIdx, item, idx, arr) => (item.l > arr[maxIdx].l ? idx : maxIdx),
      0
    );

    let baseItem: InternalItem;
    if (itemName === 'book') {
      const mostExpensive = enchantObjs[mostExpensiveIdx];
      const enchantId = mostExpensive.e[0];
      baseItem = ItemObj(enchantId, mostExpensive.l, [enchantId]);
      enchantObjs.splice(mostExpensiveIdx, 1);
      mostExpensiveIdx = enchantObjs.reduce(
        (maxIdx, item, idx, arr) => (item.l > arr[maxIdx].l ? idx : maxIdx),
        0
      );
    } else {
      baseItem = ItemObj('item');
    }

    const firstEnchant = enchantObjs[mostExpensiveIdx];
    const mergedItem = MergeEnchants(baseItem, firstEnchant);
    (mergedItem.c as { L?: Record<string, unknown> }).L = {
      I: baseItem.i,
      l: 0,
      w: 0,
    };
    enchantObjs.splice(mostExpensiveIdx, 1);

    const allObjs = enchantObjs.concat(mergedItem);
    const cheapestItems = cheapestItemsFromList(allObjs);

    let cheapestCost = Infinity;
    let cheapestKey: number = 0;
    for (const keyStr in cheapestItems) {
      const key = Number(keyStr);
      const item = cheapestItems[key];
      const cost =
        mode === 'levels' ? sumLevelsFromComb(item.c as Record<string, unknown>) : item.w;
      if (cost < cheapestCost) {
        cheapestCost = cost;
        cheapestKey = key;
      }
    }
    const cheapestItem = cheapestItems[cheapestKey];
    const instructions = getInstructions(cheapestItem.c as Record<string, unknown>, itemName);

    let maxLevels = 0;
    for (const step of instructions) maxLevels += step[2];
    const maxXp = experience(maxLevels);

    return {
      item_obj: { ...cheapestItem, x: cheapestItem.x },
      instructions,
      extra: [maxLevels, maxXp],
      enchants,
    };
  }

  return { process };
}

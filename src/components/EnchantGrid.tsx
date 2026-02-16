import type { EnchantNamespace } from '../types/enchant';
import type { EnchantSelection } from '../types/enchant';
import type { LangStrings } from '../types/enchant';
import type { EnchantData } from '../types/enchant';
import { ENCHANTMENT_LIMIT } from '../constants';

interface EnchantGridProps {
  item: string;
  data: EnchantData;
  selected: EnchantSelection[];
  allowIncompatible: boolean;
  allowMany: boolean;
  lang: LangStrings | null;
  onToggle: (_ns: EnchantNamespace, _lvl: number) => void;
  onAllowIncompatibleChange?: (_checked: boolean) => void;
  onAllowManyChange?: (_checked: boolean) => void;
}

function getIncompatibleGroup(
  namespace: EnchantNamespace,
  enchants: EnchantData['enchants']
): EnchantNamespace[] {
  const queue = [namespace];
  const result: EnchantNamespace[] = [];
  while (queue.length > 0) {
    const n = queue.shift()!;
    if (result.includes(n)) continue;
    result.push(n);
    const def = enchants[n];
    if (def)
      for (const inc of def.incompatible)
        if (!result.includes(inc) && !queue.includes(inc)) queue.push(inc);
  }
  return result.sort();
}

export function EnchantGrid({
  item,
  data,
  selected,
  allowIncompatible,
  allowMany,
  lang,
  onToggle,
  onAllowIncompatibleChange,
  onAllowManyChange,
}: EnchantGridProps) {
  const { enchants: enchantDefs } = data;
  const itemEnchants = data.items.includes(item)
    ? Object.entries(enchantDefs).filter(([, def]) =>
        item === 'book' ? true : def.items.includes(item)
      )
    : [];

  const groups: EnchantNamespace[][] = [];
  const seen = new Set<EnchantNamespace>();
  for (const [ns] of itemEnchants) {
    if (seen.has(ns)) continue;
    const group = getIncompatibleGroup(ns, enchantDefs).filter((n) =>
      itemEnchants.some(([en]) => en === n)
    );
    group.forEach((n) => seen.add(n));
    groups.push(group);
  }

  const selectedSet = new Set(selected.map(([n, l]) => `${n}:${l}`));
  const isSelected = (ns: EnchantNamespace, level: number) => selectedSet.has(`${ns}:${level}`);
  const wouldExceed = !allowMany && selected.length >= ENCHANTMENT_LIMIT;

  return (
    <div className="enchant-grid-wrap">
      <div className="enchant-list">
        {groups.map((group) =>
          group.map((namespace) => {
            const def = enchantDefs[namespace];
            const name = lang?.enchants?.[namespace] ?? namespace;
            return (
              <div key={namespace} className="enchant-row">
                <span className="enchant-name">{name}</span>
                <div className="level-pills">
                  {Array.from({ length: def.levelMax }, (_, i) => i + 1).map((level) => {
                    const on = isSelected(namespace, level);
                    const disabled = !on && wouldExceed;
                    return (
                      <button
                        key={level}
                        type="button"
                        className={`level-pill ${on ? 'selected' : ''}`}
                        onClick={() => onToggle(namespace, level)}
                        disabled={disabled}
                        title={`${name} ${level}`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="overrides">
        <label>
          <input
            type="checkbox"
            checked={allowIncompatible}
            onChange={(e) => onAllowIncompatibleChange?.(e.target.checked)}
          />
          <span>{lang?.checkbox_label_incompatible ?? 'Allow incompatible enchantments'}</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={allowMany}
            onChange={(e) => onAllowManyChange?.(e.target.checked)}
          />
          <span>{lang?.checkbox_label_max_number ?? 'Allow more than 10 enchantments'}</span>
        </label>
      </div>
    </div>
  );
}

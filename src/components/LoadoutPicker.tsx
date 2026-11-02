import type { EnchantSelection, ItemNamespace, LangStrings } from '../types/enchant';
import { loadoutsByItem } from '../data/loadouts';

interface LoadoutPickerProps {
  item: ItemNamespace;
  onApply: (enchants: EnchantSelection[]) => void;
  lang: LangStrings | null;
}

export function LoadoutPicker({ item, onApply, lang }: LoadoutPickerProps) {
  const loadouts = loadoutsByItem[item];
  if (!loadouts || loadouts.length === 0) return null;

  return (
    <div className="loadout-picker">
      <span className="loadout-label">{lang?.quick_loadout ?? 'Quick loadout'}</span>
      <div className="loadout-buttons">
        {loadouts.map((loadout) => (
          <button
            key={loadout.id}
            type="button"
            className="loadout-btn"
            onClick={() => onApply(loadout.enchants)}
          >
            {loadout.name}
          </button>
        ))}
      </div>
    </div>
  );
}

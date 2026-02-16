import type { ItemNamespace } from '../types/enchant';
import type { LangStrings } from '../types/enchant';
import { ITEM_CATEGORIES } from '../data/itemCategories';
import { ItemIcon } from './ItemIcon';

interface ItemPickerProps {
  items: ItemNamespace[];
  value: ItemNamespace | '';
  onChange: (_value: ItemNamespace | '') => void;
  lang: LangStrings | null;
  disabled?: boolean;
}

function getCategoryLabel(key: string, lang: ItemPickerProps['lang']): string {
  if (!lang)
    return key === 'armor'
      ? 'Armor'
      : key === 'weapons'
        ? 'Weapons'
        : key === 'tools'
          ? 'Tools'
          : 'Other';
  switch (key) {
    case 'armor':
      return lang.category_armor ?? 'Armor';
    case 'weapons':
      return lang.category_weapons ?? 'Weapons';
    case 'tools':
      return lang.category_tools ?? 'Tools';
    case 'other':
      return lang.category_other ?? 'Other';
    default:
      return 'Other';
  }
}

export function ItemPicker({ items, value, onChange, lang, disabled }: ItemPickerProps) {
  const itemSet = new Set(items);
  const categories = ITEM_CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter((ns) => itemSet.has(ns)),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="item-picker">
      <p className="item-picker-hint">
        {lang?.choose_an_item_to_enchant ?? 'Choose an item to enchant'}
      </p>
      <div className="item-picker-categories">
        {categories.map((cat) => (
          <div key={cat.key} className="item-category">
            <span className="item-category-label">{getCategoryLabel(cat.key, lang)}</span>
            <div className="item-chips">
              {cat.items.map((ns) => {
                const label = lang?.items?.[ns] ?? ns;
                const isSelected = value === ns;
                return (
                  <button
                    key={ns}
                    type="button"
                    className={`item-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => onChange(isSelected ? '' : ns)}
                    disabled={disabled}
                    title={label}
                  >
                    <ItemIcon
                      key={ns}
                      namespace={ns}
                      label={label}
                      size={20}
                      className="item-chip-icon"
                    />
                    <span className="item-chip-label">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

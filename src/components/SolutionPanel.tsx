import type {
  SolutionResult,
  SolutionStep,
  ItemNode,
  EnchantSelection,
  LangStrings,
  CheapnessMode,
} from '../types/enchant';
import { formatTime, formatLevels, formatXp, commaify } from '../lib/format';
import { ItemIcon } from './ItemIcon';

interface SolutionPanelProps {
  result: SolutionResult | null;
  timeMs: number | null;
  mode: CheapnessMode;
  lang: LangStrings | null;
  enchantsList: EnchantSelection[];
}

function getEnchantNamesFromNode(node: ItemNode, lang: LangStrings | null): string[] {
  const I = node.I;
  if (typeof I === 'string' && lang?.enchants?.[I]) return [lang.enchants[I]];
  if (typeof I === 'number') return [];
  if (node.L && node.R) {
    const left = getEnchantNamesFromNode(node.L, lang);
    const right = getEnchantNamesFromNode(node.R, lang);
    return [...left, ...right];
  }
  return [];
}

function getItemNamespace(node: ItemNode, lang: LangStrings | null): string {
  if (typeof node.I === 'string') {
    if (lang?.enchants?.[node.I]) return 'book';
    return node.I;
  }
  if (node.L) return getItemNamespace(node.L, lang);
  return 'item';
}

function formatItemNode(
  node: ItemNode,
  lang: LangStrings | null,
  enchantsList: EnchantSelection[]
): string {
  const ns = getItemNamespace(node, lang);
  const itemName = lang?.items?.[ns] ?? ns;
  const enchantIds = getEnchantNamesFromNode(node, lang);
  const levelPart =
    enchantIds.length === 1 && enchantsList.length >= 1
      ? ' ' + enchantsList.find(([e]) => lang?.enchants?.[e] === enchantIds[0])?.[1]
      : '';
  const enchantPart = enchantIds.length ? ` (${enchantIds.join(', ')}${levelPart})` : '';
  return itemName + enchantPart;
}

function StepRow({
  step,
  index,
  lang,
  enchantsList,
}: {
  step: SolutionStep;
  index: number;
  lang: LangStrings | null;
  enchantsList: EnchantSelection[];
}) {
  const [left, right, levelCost, xpCost, work] = step;
  const leftNs = getItemNamespace(left, lang);
  const rightNs = getItemNamespace(right, lang);
  const leftLabel = lang?.items?.[leftNs] ?? leftNs;
  const rightLabel = lang?.items?.[rightNs] ?? rightNs;
  const leftText = formatItemNode(left, lang, enchantsList);
  const rightText = formatItemNode(right, lang, enchantsList);
  const costText =
    (lang?.cost ?? 'Cost: ') +
    formatLevels(levelCost, lang) +
    ' (' +
    commaify(xpCost) +
    (lang?.xp ?? ' xp') +
    ')';
  const workText = (lang?.prior_work_penalty ?? 'Prior Work Penalty: ') + formatLevels(work, lang);

  return (
    <li className="step" key={index}>
      <span className="step-main">
        {lang?.combine ?? 'Combine'}{' '}
        <span className="step-item">
          <ItemIcon
            key={leftNs}
            namespace={leftNs}
            label={leftLabel}
            size={18}
            className="step-icon"
          />
          <em>{leftText}</em>
        </span>{' '}
        {lang?.with ?? 'with'}{' '}
        <span className="step-item">
          <ItemIcon
            key={rightNs}
            namespace={rightNs}
            label={rightLabel}
            size={18}
            className="step-icon"
          />
          <em>{rightText}</em>
        </span>
      </span>
      <small>
        {costText}, {workText}
      </small>
    </li>
  );
}

export function SolutionPanel({ result, timeMs, mode, lang, enchantsList }: SolutionPanelProps) {
  if (!result) return null;

  const { instructions, item_obj, extra } = result;
  const [maxLevels, maxXp] = extra;
  const minXp = 'x' in item_obj ? Number((item_obj as { x?: number }).x) : undefined;
  const showXpRange = minXp != null && maxXp !== minXp;
  const headerText =
    instructions.length === 0
      ? (lang?.no_solution_found ?? 'No solution found!')
      : mode === 'levels'
        ? (lang?.optimal_solution_cumulative_levels ??
          'Optimal solution found (by lowest cumulative levels)!')
        : (lang?.optimal_solution_prior_work ?? 'Optimal solution found (by lowest prior work)!');

  return (
    <section className="solution-panel">
      <h2>{headerText}</h2>
      {timeMs != null && (
        <p className="timing">
          {lang?.completed_in ?? 'Completed in '}
          {formatTime(timeMs, lang)}
        </p>
      )}
      {instructions.length > 0 && (
        <>
          <p className="total-cost">
            <strong>{lang?.total_cost ?? 'Total cost: '}</strong>
            {formatLevels(maxLevels, lang)} (
            {formatXp(maxXp, lang, minXp != null && minXp >= 0 ? minXp : -1)})
          </p>
          <h3>{lang?.steps ?? 'Steps'}</h3>
          <ol className="steps">
            {instructions.map((step, i) => (
              <StepRow key={i} step={step} index={i} lang={lang} enchantsList={enchantsList} />
            ))}
          </ol>
          {showXpRange && <p className="xp-note">{lang?.note ?? ''}</p>}
        </>
      )}
    </section>
  );
}

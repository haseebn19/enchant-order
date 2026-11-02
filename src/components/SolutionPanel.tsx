import type {
  SolutionResult,
  SolutionStep,
  ItemNode,
  EnchantSelection,
  LangStrings,
  CheapnessMode,
} from '../types/enchant';
import { enchantData } from '../data/enchantData';
import { formatTime, formatLevels, formatXp } from '../lib/format';
import { ItemIcon } from './ItemIcon';

interface SolutionPanelProps {
  result: SolutionResult;
  timeMs: number | null;
  mode: CheapnessMode;
  lang: LangStrings | null;
}

// A leaf of the merge tree names either an enchantment, meaning a book, or the item itself
const isEnchant = (id: string) => id in enchantData.enchants;

/** The enchantments in a node, in the order they were added. */
function enchantsIn(node: ItemNode): string[] {
  if (typeof node.I === 'string') return isEnchant(node.I) ? [node.I] : [];
  return [...(node.L ? enchantsIn(node.L) : []), ...(node.R ? enchantsIn(node.R) : [])];
}

/** What the node is built on: 'book', or the namespace of the item being enchanted. */
function baseOf(node: ItemNode): string {
  if (typeof node.I === 'string') return isEnchant(node.I) ? 'book' : node.I;
  return node.L ? baseOf(node.L) : 'item';
}

/** The node as text, such as "Book (Sharpness 5)" or "Sword (Sharpness, Looting)". */
function describe(node: ItemNode, lang: LangStrings | null, enchants: EnchantSelection[]): string {
  const base = baseOf(node);
  const itemName = lang?.items?.[base] ?? base;
  const ids = enchantsIn(node);
  if (ids.length === 0) return itemName;

  const names = ids.map((id) => lang?.enchants?.[id] ?? id).join(', ');
  // A single enchantment shows its level; a group would be too long to read
  const level = ids.length === 1 ? ` ${enchants.find(([id]) => id === ids[0])?.[1]}` : '';
  return `${itemName} (${names}${level})`;
}

function StepRow({
  step,
  lang,
  enchants,
}: {
  step: SolutionStep;
  lang: LangStrings | null;
  enchants: EnchantSelection[];
}) {
  const { target, sacrifice, levels, xp, priorWorkPenalty } = step;
  const costText = `${lang?.cost ?? 'Cost: '}${formatLevels(levels, lang)} (${formatXp(xp, lang)})`;
  const workText = `${lang?.prior_work_penalty ?? 'Prior Work Penalty: '}${formatLevels(priorWorkPenalty, lang)}`;

  return (
    <li className="step">
      <span className="step-main">
        {lang?.combine ?? 'Combine'}{' '}
        <span className="step-item">
          <ItemIcon namespace={baseOf(target)} size={18} />
          <em>{describe(target, lang, enchants)}</em>
        </span>{' '}
        {lang?.with ?? 'with'}{' '}
        <span className="step-item">
          <ItemIcon namespace={baseOf(sacrifice)} size={18} />
          <em>{describe(sacrifice, lang, enchants)}</em>
        </span>
      </span>
      <small>
        {costText}, {workText}
      </small>
    </li>
  );
}

export function SolutionPanel({ result, timeMs, mode, lang }: SolutionPanelProps) {
  const { steps, totalLevels, totalXp, minimumXp, enchants } = result;
  // The XP depends on whether levels are saved up or earned between merges
  const showXpRange = minimumXp !== totalXp;
  const headerText =
    steps.length === 0
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
      {steps.length > 0 && (
        <>
          <p className="total-cost">
            <strong>{lang?.total_cost ?? 'Total cost: '}</strong>
            {formatLevels(totalLevels, lang)} (
            {formatXp(totalXp, lang, showXpRange ? minimumXp : undefined)})
          </p>
          <h3>{lang?.steps ?? 'Steps'}</h3>
          <ol className="steps">
            {steps.map((step, i) => (
              <StepRow key={i} step={step} lang={lang} enchants={enchants} />
            ))}
          </ol>
          {showXpRange && <p className="xp-note">{lang?.note ?? ''}</p>}
        </>
      )}
    </section>
  );
}

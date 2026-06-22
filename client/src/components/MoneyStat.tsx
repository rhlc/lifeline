import type { Board } from '@lifeline/shared';
import { ProgressBar } from './ui/index.js';

/**
 * Owner-only money summary for the current month. private. three sections —
 * budget, savings, expenses. expenses draw down the budget, never the savings.
 */
export default function MoneyStat({ board }: { board: Board }) {
  const month = board.today.slice(0, 7);
  const m = board.months.find((x) => x.month === month);
  const budget = m?.budget ?? 0;
  const savings = m?.savings ?? 0;
  const expenses = m?.expenses ?? 0;
  const target = board.settings.monthly_savings_target;

  const left = budget - expenses; // expenses come out of budget
  const spentPct = budget > 0 ? Math.min(100, Math.round((expenses / budget) * 100)) : 0;
  const savePct = target > 0 ? Math.min(100, Math.round((savings / target) * 100)) : 0;
  const over = left < 0;
  const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-line pt-3">
      {/* budget — expenses deduct from here */}
      <div>
        <div className="flex items-center justify-between text-xs lowercase">
          <span className="text-muted">budget left</span>
          <span className={`font-semibold tabular-nums ${over ? 'text-warn' : 'text-ink'}`}>
            {inr(left)} <span className="text-muted">/ {inr(budget)}</span>
          </span>
        </div>
        <div className="mt-1">
          <ProgressBar value={spentPct} cells={16} tone={over ? 'warn' : 'good'} brackets showValue={false} />
        </div>
        {over && <div className="mt-0.5 text-[11px] lowercase text-warn">over budget by {inr(-left)}</div>}
      </div>

      {/* savings — untouched by expenses */}
      <div>
        <div className="flex items-center justify-between text-xs lowercase">
          <span className="text-muted">saved</span>
          <span className="font-semibold tabular-nums text-ink">
            {inr(savings)}
            {target > 0 && <span className="text-muted"> / {inr(target)}</span>}
          </span>
        </div>
        {target > 0 && (
          <div className="mt-1">
            <ProgressBar value={savePct} cells={16} tone="bonus" brackets showValue={false} />
          </div>
        )}
      </div>

      {/* expenses */}
      <div className="flex items-center justify-between text-xs lowercase">
        <span className="text-muted">expenses</span>
        <span className="font-semibold tabular-nums text-ink">{inr(expenses)}</span>
      </div>

      <div className="text-right text-[11px] lowercase text-muted">{month} · private</div>
    </div>
  );
}

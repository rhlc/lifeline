import type { Board } from '@lifeline/shared';

/**
 * Owner-only money summary for the current month (spec §4c). Private.
 * Three sections — Budget, Savings, Expenses. Expenses draw down the budget,
 * never the savings.
 */
export default function MoneyStat({ board }: { board: Board }) {
  const month = board.today.slice(0, 7);
  const m = board.months.find((x) => x.month === month);
  const budget = m?.budget ?? 0;
  const savings = m?.savings ?? 0;
  const expenses = m?.expenses ?? 0;
  const target = board.settings.monthly_savings_target;

  const left = budget - expenses; // expenses come out of budget
  const spentRatio = budget > 0 ? Math.min(1, expenses / budget) : 0;
  const saveRatio = target > 0 ? Math.min(1, savings / target) : 0;
  const over = left < 0;
  const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div className="mt-4 space-y-3 border-t border-edge pt-3">
      {/* 1. Budget — expenses deduct from here */}
      <div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">📊 Budget left</span>
          <span className={`font-semibold ${over ? 'text-band-warn' : ''}`}>
            {inr(left)} <span className="text-muted">/ {inr(budget)}</span>
          </span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-edge">
          <div
            className={`h-full rounded-full ${over ? 'bg-band-warn' : 'bg-gradient-to-r from-band-ontrack to-grid-4'}`}
            style={{ width: `${spentRatio * 100}%` }}
          />
        </div>
        {over && <div className="mt-0.5 text-[11px] text-band-warn">over budget by {inr(-left)}</div>}
      </div>

      {/* 2. Savings — untouched by expenses */}
      <div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">💰 Saved</span>
          <span className="font-semibold">
            {inr(savings)}
            {target > 0 && <span className="text-muted"> / {inr(target)}</span>}
          </span>
        </div>
        {target > 0 && (
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-edge">
            <div
              className="h-full rounded-full bg-gradient-to-r from-band-bonus to-grid-4"
              style={{ width: `${saveRatio * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* 3. Expenses */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted">🧾 Expenses</span>
        <span className="font-semibold">{inr(expenses)}</span>
      </div>

      <div className="text-right text-[11px] text-muted">🔒 {month} · private</div>
    </div>
  );
}

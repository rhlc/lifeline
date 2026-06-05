import type { Goal, GoalScope } from '@lifeline/shared';

const LABELS: Record<GoalScope, string> = { month: 'Mo', quarter: 'Qtr', year: 'Yr' };
const ORDER: GoalScope[] = ['month', 'quarter', 'year'];

/** Three tiny progress bars: month / quarter / year (spec §4d). */
export default function GoalsBars({ goals }: { goals: Goal[] }) {
  if (goals.length === 0) {
    return (
      <div className="flex h-full min-h-[120px] flex-col items-center justify-center text-center text-muted">
        <div className="mb-2 text-3xl opacity-70">🎯</div>
        <div className="text-sm">No goals yet.</div>
        <div className="text-xs">Set your Month / Quarter / Year targets.</div>
      </div>
    );
  }

  // Show the latest goal per scope.
  const byScope = new Map<GoalScope, Goal>();
  for (const g of goals) byScope.set(g.scope, g);

  return (
    <div className="space-y-3">
      {ORDER.map((scope) => {
        const g = byScope.get(scope);
        return (
          <div key={scope}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-ink/80">{LABELS[scope]}</span>
              <span className="text-muted">{g ? `${g.progress}%` : '—'}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-edge">
              <div
                className="h-full rounded-full bg-gradient-to-r from-band-bonus to-grid-4"
                style={{ width: `${g?.progress ?? 0}%` }}
              />
            </div>
            {g && <div className="mt-1 truncate text-[11px] text-muted">{g.text}</div>}
          </div>
        );
      })}
    </div>
  );
}

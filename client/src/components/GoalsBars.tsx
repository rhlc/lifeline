import type { Goal, GoalScope } from '@lifeline/shared';
import { ProgressBar } from './ui/index.js';

const LABELS: Record<GoalScope, string> = { month: 'mo', quarter: 'qtr', year: 'yr' };
const ORDER: GoalScope[] = ['month', 'quarter', 'year'];

/** Three ascii progress bars: month / quarter / year. */
export default function GoalsBars({ goals }: { goals: Goal[] }) {
  if (goals.length === 0) {
    return (
      <div className="flex h-full min-h-[120px] flex-col items-center justify-center text-center lowercase text-muted">
        <div className="mb-2 font-mono text-2xl text-faint">[ ]</div>
        <div className="text-sm">no goals yet.</div>
        <div className="text-xs">set your month / quarter / year targets.</div>
      </div>
    );
  }

  // show the latest goal per scope.
  const byScope = new Map<GoalScope, Goal>();
  for (const g of goals) byScope.set(g.scope, g);

  return (
    <div className="flex flex-col gap-4">
      {ORDER.map((scope) => {
        const g = byScope.get(scope);
        return (
          <div key={scope}>
            <ProgressBar
              value={g?.progress ?? 0}
              cells={18}
              tone="bonus"
              brackets
              label={LABELS[scope]}
              showValue
            />
            {g && <div className="mt-1 truncate text-[11px] lowercase text-muted">{g.text.toLowerCase()}</div>}
          </div>
        );
      })}
    </div>
  );
}

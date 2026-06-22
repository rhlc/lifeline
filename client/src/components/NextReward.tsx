import type { Reward } from '@lifeline/shared';
import { ProgressBar, Badge } from './ui/index.js';

/** Next reward to chase + progress, then a shelf of what's coming. */
export default function NextReward({ rewards, monthPct }: { rewards: Reward[]; monthPct: number }) {
  const locked = rewards.filter((r) => !r.unlocked);
  const next = locked.length ? locked.reduce((b, r) => (r.threshold < b.threshold ? r : b)) : null;

  if (!next) {
    return (
      <div className="text-sm lowercase text-muted">
        all rewards unlocked. define more in the rewards panel.
      </div>
    );
  }

  const ratio = Math.min(100, Math.round((monthPct / next.threshold) * 100));
  const upcoming = locked.filter((r) => r.id !== next.id).sort((a, b) => a.threshold - b.threshold);

  return (
    <div>
      <div className="flex items-center gap-2 text-base font-semibold lowercase text-ink">
        <span aria-hidden="true" className="text-clay">
          {next.threshold === 90 ? '★' : '◦'}
        </span>
        <span>{next.label.toLowerCase()}</span>
      </div>

      <div className="mt-3">
        <ProgressBar value={ratio} cells={18} tone="bonus" brackets showValue={false} />
      </div>
      <div className="mt-1.5 text-xs lowercase text-muted">
        {monthPct}% → unlock at {next.threshold}%
      </div>

      {upcoming.length > 0 && (
        <div className="mt-4 border-t border-line pt-3">
          <div className="mb-2 text-[11px] lowercase tracking-[0.06em] text-muted">coming up</div>
          <ul className="flex flex-col gap-2">
            {upcoming.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="lowercase text-ink-2">{r.label.toLowerCase()}</span>
                <Badge tone={r.threshold === 90 ? 'bonus' : 'neutral'}>{r.threshold}%</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

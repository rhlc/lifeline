import type { Reward } from '@lifeline/shared';

/** Next reward to chase + progress, then a shelf of what's coming (spec §5f). */
export default function NextReward({ rewards, monthPct }: { rewards: Reward[]; monthPct: number }) {
  const locked = rewards.filter((r) => !r.unlocked);
  const next = locked.length
    ? locked.reduce((b, r) => (r.threshold < b.threshold ? r : b))
    : null;

  if (!next) {
    return (
      <div className="text-sm text-muted">
        🎁 All rewards unlocked. Define more in the Rewards panel!
      </div>
    );
  }

  const ratio = Math.min(1, monthPct / next.threshold);
  const upcoming = locked.filter((r) => r.id !== next.id).sort((a, b) => a.threshold - b.threshold);

  return (
    <div>
      <div className="flex items-center gap-2 text-lg font-semibold">
        <span className="text-2xl">{next.emoji ?? '🎁'}</span>
        <span>{next.label}</span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-edge">
        <div
          className="h-full rounded-full bg-gradient-to-r from-band-ontrack to-grid-4 transition-[width] duration-500"
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>
      <div className="mt-1.5 text-xs text-muted">
        {monthPct}% → unlock at {next.threshold}%
      </div>

      {upcoming.length > 0 && (
        <div className="mt-4 border-t border-edge pt-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
            Coming up
          </div>
          <ul className="space-y-1.5">
            {upcoming.map((r) => (
              <li key={r.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span>{r.emoji ?? '🎁'}</span>
                  <span className="text-ink/85">{r.label}</span>
                </span>
                <span className={`text-xs ${r.threshold === 90 ? 'text-band-bonus' : 'text-muted'}`}>
                  {r.threshold}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import type { Day } from '@lifeline/shared';
import { pick } from '../lib/messages.js';

const MOOD_Y: Record<string, number> = { good: 4, ok: 14, low: 24 };

/** A small wavy morale trend from recent moods (spec §5g). */
export default function MoraleLine({ days }: { days: Day[] }) {
  const recent = days
    .filter((d) => d.mood)
    .slice(-14);

  if (recent.length < 2) {
    return <div className="mt-3 text-xs text-muted">morale ∿ — log your mood to see the trend</div>;
  }

  const w = 220;
  const h = 28;
  const step = w / (recent.length - 1);
  const points = recent
    .map((d, i) => `${(i * step).toFixed(1)},${MOOD_Y[d.mood!] ?? 14}`)
    .join(' ');

  // Low morale for the last 3 logged moods → caring message.
  const lastThree = recent.slice(-3);
  const dipping = lastThree.length === 3 && lastThree.every((d) => d.mood === 'low');

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted">morale</span>
        <svg width={w} height={h} className="overflow-visible">
          <polyline
            points={points}
            fill="none"
            stroke="#7be495"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {dipping && (
        <div className="mt-2 rounded-lg bg-card/70 px-3 py-2 text-xs text-band-warn ring-1 ring-edge">
          {pick('lowMorale')}
        </div>
      )}
    </div>
  );
}

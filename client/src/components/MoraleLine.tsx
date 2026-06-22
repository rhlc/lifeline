import type { Day } from '@lifeline/shared';
import { pick } from '../lib/messages.js';
import { Sparkline } from './ui/index.js';

// higher = better morale, so the sparkline rises for good days.
const MOOD_VALUE: Record<string, number> = { good: 3, ok: 2, low: 1 };

/** A small ascii morale trend (▁▂▃▄▅▆▇█) from recent moods. */
export default function MoraleLine({ days }: { days: Day[] }) {
  const recent = days.filter((d) => d.mood).slice(-14);

  if (recent.length < 2) {
    return <div className="mt-3 text-xs lowercase text-muted">morale ▁ — log your mood to see the trend</div>;
  }

  const series = recent.map((d) => MOOD_VALUE[d.mood!] ?? 2);

  // low morale for the last 3 logged moods → caring message.
  const lastThree = recent.slice(-3);
  const dipping = lastThree.length === 3 && lastThree.every((d) => d.mood === 'low');

  return (
    <div className="mt-3">
      <Sparkline data={series} tone={dipping ? 'warn' : 'good'} size="md" label="morale" />
      {dipping && (
        <div className="mt-2 rounded-md border border-warn/40 bg-warn-soft px-3 py-2 text-xs lowercase text-ink-2">
          {pick('lowMorale')}
        </div>
      )}
    </div>
  );
}

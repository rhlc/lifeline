import type { Engagement } from '@lifeline/shared';
import { AsciiFlame } from './ui/index.js';

/**
 * Contextual status for today. reads the day's engagement (auto-saved) and
 * tells the owner where they stand, in the supportive lowercase tone. ascii
 * glyphs replace the original emoji.
 */
export default function DayStatus({ engagement, streak }: { engagement: Engagement; streak: number }) {
  const map: Record<Engagement, { bg: string; bd: string; fg: string; glyph: string; text: string }> = {
    full: {
      bg: 'var(--good-soft)',
      bd: 'color-mix(in srgb, var(--good) 40%, transparent)',
      fg: 'var(--good)',
      glyph: '✓',
      text: 'today counts — locked in. shabaash, aise hi chalte raho.',
    },
    survival: {
      bg: 'var(--warn-soft)',
      bd: 'color-mix(in srgb, var(--warn) 42%, transparent)',
      fg: 'color-mix(in srgb, var(--warn) 80%, var(--ink))',
      glyph: '△',
      text: 'survival day — streak safe. zero nahi hai na. bas chalte raho.',
    },
    none: {
      bg: 'var(--card-2)',
      bd: 'var(--line)',
      fg: 'var(--muted)',
      glyph: '+',
      text: 'tap anything — even just your mood — to keep the streak alive.',
    },
  };
  const s = map[engagement];

  return (
    <div
      className="mt-3 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm"
      style={{ background: s.bg, border: `1px solid ${s.bd}`, color: s.fg }}
    >
      <span aria-hidden="true" className="text-base font-bold leading-none">
        {s.glyph}
      </span>
      <span className="flex-1 lowercase">{s.text}</span>
      {engagement !== 'none' && streak > 0 && (
        <AsciiFlame count={streak} size="sm" showCount />
      )}
    </div>
  );
}

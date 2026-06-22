import type { CSSProperties, HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLSpanElement> {
  /** 0..3 (p0 most urgent). */
  level?: number;
}

/**
 * PriorityTag — an engineer-style p0..p3 chip. warmth descends with urgency:
 * p0 deep clay (critical) → p1 amber → p2 olive → p3 muted. lowercase, mono.
 */
const LEVELS: Record<number, { bg: string; fg: string; bd: string }> = {
  0: { bg: 'var(--bonus-soft)', fg: 'var(--bonus)', bd: 'color-mix(in srgb, var(--bonus) 45%, transparent)' },
  1: {
    bg: 'var(--warn-soft)',
    fg: 'color-mix(in srgb, var(--warn) 82%, var(--ink))',
    bd: 'color-mix(in srgb, var(--warn) 48%, transparent)',
  },
  2: { bg: 'var(--good-soft)', fg: 'var(--good)', bd: 'color-mix(in srgb, var(--good) 45%, transparent)' },
  3: { bg: 'var(--card-2)', fg: 'var(--muted)', bd: 'var(--line-2)' },
};

export default function PriorityTag({ level = 3, style, ...rest }: Props) {
  const n = Math.max(0, Math.min(3, level));
  const t = LEVELS[n];
  return (
    <span
      {...rest}
      title={`priority ${n}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 7px',
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        borderRadius: 'var(--r-sm)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-xs)',
        fontWeight: 'var(--fw-bold)' as unknown as number,
        letterSpacing: 'var(--ls-tight)',
        lineHeight: 1.2,
        ...style,
      } as CSSProperties}
    >
      p{n}
    </span>
  );
}

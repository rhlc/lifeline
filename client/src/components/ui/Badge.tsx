import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'accent' | 'good' | 'warn' | 'bonus';

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** optional leading ascii glyph, e.g. "●", "✓", "△". */
  glyph?: ReactNode;
  children: ReactNode;
}

const TONES: Record<BadgeTone, { bg: string; fg: string; bd: string }> = {
  neutral: { bg: 'var(--card-2)', fg: 'var(--ink-2)', bd: 'var(--line-2)' },
  accent: {
    bg: 'var(--clay-tint)',
    fg: 'var(--clay-deep)',
    bd: 'color-mix(in srgb, var(--clay) 35%, transparent)',
  },
  good: {
    bg: 'var(--good-soft)',
    fg: 'var(--good)',
    bd: 'color-mix(in srgb, var(--good) 38%, transparent)',
  },
  warn: {
    bg: 'var(--warn-soft)',
    fg: 'color-mix(in srgb, var(--warn) 80%, var(--ink))',
    bd: 'color-mix(in srgb, var(--warn) 45%, transparent)',
  },
  bonus: {
    bg: 'var(--bonus-soft)',
    fg: 'var(--bonus)',
    bd: 'color-mix(in srgb, var(--bonus) 40%, transparent)',
  },
};

/**
 * Badge — a small lowercase status/label chip. tones map to the warm status
 * palette; an optional leading ascii glyph sits ahead of the label.
 */
export default function Badge({ tone = 'neutral', glyph, children, style, ...rest }: Props) {
  const t = TONES[tone];
  return (
    <span
      {...rest}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 9px',
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        borderRadius: 'var(--r-pill)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-xs)',
        fontWeight: 'var(--fw-medium)' as unknown as number,
        letterSpacing: 'var(--ls-tight)',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        ...style,
      } as CSSProperties}
    >
      {glyph && (
        <span aria-hidden="true" style={{ fontWeight: 700 }}>
          {glyph}
        </span>
      )}
      {children}
    </span>
  );
}

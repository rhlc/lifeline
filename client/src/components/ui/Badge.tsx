import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'accent' | 'good' | 'warn' | 'bonus';

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** optional leading ascii glyph, e.g. "●", "✓", "△". */
  glyph?: ReactNode;
  children: ReactNode;
}

// Borders use rgba (== color-mix with transparent) rather than color-mix() so
// the share card can be exported by html2canvas, which can't parse color-mix.
const TONES: Record<BadgeTone, { bg: string; fg: string; bd: string }> = {
  neutral: { bg: 'var(--card-2)', fg: 'var(--ink-2)', bd: 'var(--line-2)' },
  accent: { bg: 'var(--clay-tint)', fg: 'var(--clay-deep)', bd: 'rgba(192, 87, 46, 0.35)' },
  good: { bg: 'var(--good-soft)', fg: 'var(--good)', bd: 'rgba(111, 125, 58, 0.38)' },
  warn: { bg: 'var(--warn-soft)', fg: '#a2762b', bd: 'rgba(192, 138, 46, 0.45)' },
  bonus: { bg: 'var(--bonus-soft)', fg: 'var(--bonus)', bd: 'rgba(177, 85, 47, 0.4)' },
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

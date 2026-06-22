import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

interface Props extends HTMLAttributes<HTMLSpanElement> {
  data?: number[];
  tone?: 'good' | 'accent' | 'warn' | 'ink';
  size?: 'sm' | 'md' | 'lg';
  label?: ReactNode;
}

/**
 * Sparkline — an ascii block trend, ▁▂▃▄▅▆▇█, for morale and small series.
 * data is any numeric array; it's normalized to the 8 block heights.
 */
const BLOCKS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

export default function Sparkline({
  data = [],
  tone = 'good',
  size = 'md',
  label,
  style,
  ...rest
}: Props) {
  const color =
    { good: 'var(--good)', accent: 'var(--clay)', warn: 'var(--warn)', ink: 'var(--ink-2)' }[tone];
  const fs = { sm: 14, md: 20, lg: 28 }[size];

  let glyphs = '';
  if (data.length) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    glyphs = data
      .map((v) => BLOCKS[Math.round(((v - min) / span) * (BLOCKS.length - 1))])
      .join('');
  }

  return (
    <span
      {...rest}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'var(--font-mono)',
        ...style,
      } as CSSProperties}
    >
      {label && (
        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--muted)' }}>{label}</span>
      )}
      <span
        aria-hidden="true"
        style={{ fontSize: fs, lineHeight: 1, letterSpacing: '0px', color, whiteSpace: 'pre' }}
      >
        {glyphs || BLOCKS[0]}
      </span>
    </span>
  );
}

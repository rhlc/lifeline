import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type ProgressTone = 'accent' | 'good' | 'warn' | 'bonus' | 'ink';

interface Props extends HTMLAttributes<HTMLDivElement> {
  /** 0–100. */
  value?: number;
  cells?: number;
  tone?: ProgressTone;
  brackets?: boolean;
  label?: ReactNode;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const TONE_COLOR: Record<ProgressTone, string> = {
  accent: 'var(--clay)',
  good: 'var(--good)',
  warn: 'var(--warn)',
  bonus: 'var(--bonus)',
  ink: 'var(--ink)',
};

/**
 * ProgressBar — an ascii block meter, e.g. [██████░░░░] 60%. the lifeline way
 * to show xp, month %, reward progress, and goals. monospace blocks so it
 * reads like a terminal gauge.
 */
export default function ProgressBar({
  value = 0,
  cells = 20,
  tone = 'accent',
  brackets = true,
  label,
  showValue = true,
  size = 'md',
  style,
  ...rest
}: Props) {
  const pct = Math.max(0, Math.min(100, value));
  const filled = Math.round((pct / 100) * cells);
  const color = TONE_COLOR[tone];
  const fs = { sm: 'var(--fs-sm)', md: 'var(--fs-h3)', lg: 'var(--fs-h2)' }[size];

  return (
    <div
      {...rest}
      style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style } as CSSProperties}
    >
      {(label || showValue) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-xs)',
            letterSpacing: 'var(--ls-tight)',
            color: 'var(--muted)',
          }}
        >
          {label ? <span>{label}</span> : <span />}
          {showValue && (
            <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--ink-2)' }}>
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div
        aria-hidden="true"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: fs,
          lineHeight: 1,
          letterSpacing: '-0.5px',
          whiteSpace: 'pre',
          color: 'var(--grid-0)',
          userSelect: 'none',
        }}
      >
        {brackets && <span style={{ color: 'var(--faint)' }}>[</span>}
        <span style={{ color }}>{'█'.repeat(filled)}</span>
        <span style={{ color: 'var(--grid-0)' }}>{'░'.repeat(cells - filled)}</span>
        {brackets && <span style={{ color: 'var(--faint)' }}>]</span>}
      </div>
    </div>
  );
}

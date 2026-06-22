import type { CSSProperties, HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'lockup' | 'text' | 'mark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  pulseColor?: string;
}

/** the ascii heartbeat "pulse" mark — the literal life-line. ──╱╲▁╱╲── */
const PULSE = '──╱╲▁╱╲──';

/**
 * Wordmark — the lifeline logo. lowercase mono wordmark with an optional ascii
 * heartbeat pulse. variants: "lockup" (pulse + word), "text", "mark".
 */
export default function Wordmark({
  variant = 'lockup',
  size = 'md',
  pulseColor = 'var(--clay)',
  style,
  ...rest
}: Props) {
  const scale = { sm: 16, md: 22, lg: 34, xl: 48 }[size];

  const mark = (
    <span
      aria-hidden="true"
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: scale * 0.62,
        lineHeight: 1,
        color: pulseColor,
        fontWeight: 700,
        letterSpacing: '-1px',
        whiteSpace: 'pre',
      }}
    >
      {PULSE}
    </span>
  );

  const word = (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: scale,
        lineHeight: 1,
        fontWeight: 700,
        letterSpacing: 'var(--ls-display)',
        color: 'var(--ink)',
      }}
    >
      lifeline
    </span>
  );

  return (
    <span
      {...rest}
      role="img"
      aria-label="lifeline"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: scale * 0.4,
        ...style,
      } as CSSProperties}
    >
      {variant !== 'text' && mark}
      {variant !== 'mark' && word}
    </span>
  );
}

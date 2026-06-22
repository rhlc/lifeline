import { useEffect, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

type Variant = 'blocks' | 'bar' | 'dots' | 'pulse' | 'line';

interface Props extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  label?: ReactNode;
  speed?: number;
}

/**
 * AsciiSpinner — a tiny monospace loading/working indicator. several frame
 * sets for the terminal feel; pair with a lowercase label like "saving…".
 * (avoids braille — it tofus in the bundled font.)
 */
const SETS: Record<Variant, string[]> = {
  blocks: ['▖', '▘', '▝', '▗'],
  bar: ['[=   ]', '[==  ]', '[=== ]', '[ ===]', '[  ==]', '[   =]', '[    ]'],
  dots: ['.  ', '.. ', '...', ' ..', '  .', '   '],
  pulse: ['·', '∙', '●', '∙'],
  line: ['|', '/', '─', '\\'],
};

export default function AsciiSpinner({
  variant = 'blocks',
  label,
  speed = 90,
  style,
  ...rest
}: Props) {
  const frames = SETS[variant];
  const [i, setI] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % frames.length), speed);
    return () => clearInterval(id);
  }, [variant, speed, frames.length]);

  return (
    <span
      {...rest}
      role="status"
      aria-live="polite"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-sm)',
        color: 'var(--muted)',
        ...style,
      } as CSSProperties}
    >
      <span
        aria-hidden="true"
        style={{
          color: 'var(--clay)',
          fontWeight: 700,
          whiteSpace: 'pre',
          minWidth: variant === 'bar' ? '5ch' : '1ch',
        }}
      >
        {frames[i]}
      </span>
      {label && <span>{label}</span>}
    </span>
  );
}

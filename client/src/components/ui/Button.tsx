import { useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  type?: 'button' | 'submit' | 'reset';
  children: ReactNode;
}

const SIZES: Record<Size, CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: 'var(--fs-sm)', borderRadius: 'var(--r-sm)' },
  md: { padding: '9px 16px', fontSize: 'var(--fs-body)', borderRadius: 'var(--r-md)' },
  lg: { padding: '12px 22px', fontSize: 'var(--fs-h3)', borderRadius: 'var(--r-md)' },
};

function variantStyle(variant: Variant): CSSProperties {
  switch (variant) {
    case 'secondary':
      return { background: 'var(--card)', color: 'var(--ink)', border: '1px solid var(--line-2)' };
    case 'ghost':
      return { background: 'transparent', color: 'var(--ink-2)', border: '1px solid transparent' };
    case 'danger':
      return {
        background: 'var(--warn-soft)',
        color: 'var(--clay-deep)',
        border: '1px solid color-mix(in srgb, var(--warn) 45%, transparent)',
      };
    case 'primary':
    default:
      return { background: 'var(--clay)', color: 'var(--on-accent)', border: '1px solid var(--clay)' };
  }
}

/**
 * Button — the primary action primitive. clay-filled primary, outlined
 * secondary, quiet ghost, amber danger. lowercase labels by convention;
 * hover darkens one step, press shrinks (no bounce).
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  disabled = false,
  type = 'button',
  children,
  style,
  ...rest
}: Props) {
  const s = SIZES[size];
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const base = variantStyle(variant);

  const hoverStyle: CSSProperties | null =
    !disabled && hover
      ? variant === 'primary'
        ? { background: 'var(--clay-deep)', borderColor: 'var(--clay-deep)' }
        : variant === 'ghost'
          ? { background: 'var(--card-2)' }
          : variant === 'danger'
            ? { background: 'color-mix(in srgb, var(--warn-soft) 70%, var(--warn))' }
            : { background: 'var(--card-2)', borderColor: 'var(--muted)' }
      : null;

  return (
    <button
      {...rest}
      type={type}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setActive(false);
      }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      className="focus-clay"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: full ? '100%' : 'auto',
        fontFamily: 'var(--font-mono)',
        fontWeight: 'var(--fw-medium)' as unknown as number,
        letterSpacing: 'var(--ls-tight)',
        lineHeight: 1.1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transform: active && !disabled ? 'scale(0.97)' : 'scale(1)',
        transition:
          'background var(--dur-2) var(--ease), border-color var(--dur-2) var(--ease), transform var(--dur-1) var(--ease)',
        ...s,
        ...base,
        ...hoverStyle,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

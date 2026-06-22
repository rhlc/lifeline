import { useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** ascii/monospace glyph icon, e.g. "{}", "~", ">". */
  glyph: ReactNode;
  label: ReactNode;
  sub?: ReactNode;
  active?: boolean;
  danger?: boolean;
}

/**
 * Tile — the daily-ritual tap target. an ascii glyph, a lowercase label, and
 * an optional sub-line. three states: idle, active (olive "done"), danger
 * (amber "slip"). press shrinks.
 */
export default function Tile({
  glyph,
  label,
  sub,
  active = false,
  danger = false,
  disabled = false,
  onClick,
  style,
  ...rest
}: Props) {
  const [press, setPress] = useState(false);

  let bg = 'var(--card-2)';
  let bd = 'var(--line)';
  let fg = 'var(--ink)';
  let glyphColor = 'var(--ink-2)';
  if (active && danger) {
    bg = 'var(--warn-soft)';
    bd = 'color-mix(in srgb, var(--warn) 50%, transparent)';
    fg = 'color-mix(in srgb, var(--warn) 78%, var(--ink))';
    glyphColor = fg;
  } else if (active) {
    bg = 'var(--good-soft)';
    bd = 'color-mix(in srgb, var(--good) 48%, transparent)';
    fg = 'var(--good)';
    glyphColor = fg;
  }

  return (
    <button
      {...rest}
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={onClick}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      onMouseLeave={() => setPress(false)}
      className="focus-clay"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        padding: '14px 8px',
        width: '100%',
        background: bg,
        border: `1px solid ${bd}`,
        borderRadius: 'var(--r-md)',
        cursor: disabled ? 'default' : 'pointer',
        transform: press && !disabled ? 'scale(0.95)' : 'scale(1)',
        transition:
          'transform var(--dur-1) var(--ease), background var(--dur-2) var(--ease), border-color var(--dur-2) var(--ease)',
        fontFamily: 'var(--font-mono)',
        ...style,
      } as CSSProperties}
    >
      <span
        aria-hidden="true"
        style={{
          fontSize: 'var(--fs-h2)',
          fontWeight: 700,
          lineHeight: 1,
          color: glyphColor,
          letterSpacing: '-1px',
        }}
      >
        {glyph}
      </span>
      <span
        style={{
          fontSize: 'var(--fs-sm)',
          fontWeight: 'var(--fw-medium)' as unknown as number,
          color: fg,
        }}
      >
        {label}
      </span>
      {sub && <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--muted)' }}>{sub}</span>}
    </button>
  );
}

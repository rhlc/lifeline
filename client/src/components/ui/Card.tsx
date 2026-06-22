import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

interface Props extends HTMLAttributes<HTMLElement> {
  /** lowercase eyebrow label in the header. */
  label?: ReactNode;
  /** right-aligned action slot in the header. */
  action?: ReactNode;
  /** nested surface: deeper fill, no shadow. */
  inset?: boolean;
  padding?: string;
  children: ReactNode;
}

/**
 * Card — the warm paper surface. hairline border, barely-there shadow, small
 * radius, an optional lowercase eyebrow + right-aligned action slot. the
 * building block of every panel.
 */
export default function Card({
  label,
  action,
  inset = false,
  padding = 'var(--sp-5, 20px)',
  children,
  style,
  ...rest
}: Props) {
  return (
    <section
      {...rest}
      style={{
        background: inset ? 'var(--card-2)' : 'var(--card)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-lg)',
        boxShadow: inset ? 'none' : 'var(--shadow-sm)',
        padding,
        ...style,
      } as CSSProperties}
    >
      {(label || action) && (
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 16,
          }}
        >
          {label ? (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-xs)',
                fontWeight: 'var(--fw-semibold)' as unknown as number,
                letterSpacing: 'var(--ls-label)',
                color: 'var(--muted)',
              }}
            >
              {label}
            </span>
          ) : (
            <span />
          )}
          {action && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

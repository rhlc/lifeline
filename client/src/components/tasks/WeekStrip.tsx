import type { CSSProperties } from 'react';
import type { WeekDay } from '../../lib/tasks.js';

interface Props {
  days: WeekDay[];
  /** index of the selected day. */
  selected: number;
  onSelect: (index: number) => void;
}

/** ascii load indicator: dots scale with the active-task count. */
function load(count: number): string {
  if (!count) return '·';
  return '•'.repeat(Math.min(3, count)) + (count > 3 ? '+' : '');
}

/**
 * WeekStrip — a minimal week calendar. seven day cells (weekday · date · ascii
 * load dots), today gets a clay pulse bar, the selected day fills warm. tap to
 * select.
 */
export default function WeekStrip({ days, selected, onSelect }: Props) {
  return (
    <div className="flex gap-1">
      {days.map((d, i) => {
        const isSel = i === selected;
        return (
          <button
            key={d.date}
            type="button"
            onClick={() => onSelect(i)}
            aria-pressed={isSel}
            className="press focus-clay"
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 64,
              padding: '8px 2px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              cursor: 'pointer',
              background: isSel ? 'var(--clay-tint)' : 'var(--card-2)',
              border: `1px solid ${isSel ? 'color-mix(in srgb, var(--clay) 40%, transparent)' : 'var(--line)'}`,
              borderRadius: 'var(--r-md)',
              fontFamily: 'var(--font-mono)',
            } as CSSProperties}
          >
            <span style={{ fontSize: 'var(--fs-xs)', color: isSel ? 'var(--clay-deep)' : 'var(--muted)' }}>
              {d.label}
            </span>
            <span
              style={{
                fontSize: 'var(--fs-h3)',
                fontWeight: 700,
                lineHeight: 1,
                color: isSel ? 'var(--clay-deep)' : 'var(--ink)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {d.dom}
            </span>
            <span
              style={{
                fontSize: 'var(--fs-xs)',
                lineHeight: 1,
                letterSpacing: '0.5px',
                color: d.count ? (isSel ? 'var(--clay)' : 'var(--good)') : 'var(--faint)',
              }}
            >
              {load(d.count)}
            </span>
            <span
              aria-hidden="true"
              style={{ width: 16, height: 2, borderRadius: 2, marginTop: 1, background: d.today ? 'var(--clay)' : 'transparent' }}
            />
          </button>
        );
      })}
    </div>
  );
}

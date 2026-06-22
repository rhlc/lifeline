import { useState } from 'react';
import type { Day } from '@lifeline/shared';
import { buildGridMatrix, prettyDate, monthKey } from '../lib/dates.js';
import { gridCellClass } from '../lib/bands.js';

interface Props {
  days: Day[];
  today: string;
  weeks?: number;
  /**
   * When set, cells render at this fixed pixel size instead of flex-filling
   * the width. Use for the share card — html2canvas doesn't handle flexbox
   * sizing reliably, so fixed cells snapshot cleanly.
   */
  fixedCell?: number;
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const WEEKDAY_LABELS = ['', 'mon', '', 'wed', '', 'fri', '']; // rows Sun..Sat
const LABEL_H = 14;

/** GitHub-style contribution grid — the hero visual, on warm paper. */
export default function ContributionGrid({ days, today, weeks = 26, fixedCell }: Props) {
  const byDay = new Map(days.map((d) => [d.day, d]));
  const matrix = buildGridMatrix(today, weeks);
  const [hover, setHover] = useState<{ x: number; y: number; text: string } | null>(null);

  const rowH = fixedCell ?? 13;
  const colMonth = matrix.map((col) => {
    const firstDate = col.find((d): d is string => d !== null);
    return firstDate ? monthKey(firstDate) : null;
  });

  const cellStyle = fixedCell ? { width: fixedCell, height: rowH } : { height: rowH };

  return (
    <div className="relative">
      <div className="flex gap-2 pb-1">
        {/* weekday labels */}
        <div className="flex shrink-0 flex-col gap-[3px] text-[10px] lowercase text-muted">
          <div style={{ height: LABEL_H }} />
          {WEEKDAY_LABELS.map((lbl, i) => (
            <div key={i} className="flex items-center pr-1" style={{ height: rowH }}>
              {lbl}
            </div>
          ))}
        </div>

        {/* columns */}
        <div className={`flex gap-[3px] ${fixedCell ? '' : 'flex-1'}`}>
          {matrix.map((col, ci) => {
            const showMonth = ci !== 0 && colMonth[ci] && colMonth[ci] !== colMonth[ci - 1];
            const monthIdx = colMonth[ci] ? Number(colMonth[ci]!.slice(5, 7)) - 1 : 0;
            return (
              <div key={ci} className={`flex min-w-0 flex-col gap-[3px] ${fixedCell ? '' : 'flex-1'}`}>
                <div
                  className="overflow-visible whitespace-nowrap text-[10px] lowercase leading-4 text-muted"
                  style={{ height: LABEL_H }}
                >
                  {showMonth ? MONTHS[monthIdx] : ''}
                </div>
                {col.map((date, ri) => {
                  if (!date) return <div key={ri} style={cellStyle} className={fixedCell ? '' : 'w-full'} />;
                  const day = byDay.get(date);
                  const logged = !!day;
                  const isToday = date === today;
                  return (
                    <div
                      key={ri}
                      onMouseEnter={(e) =>
                        setHover({
                          x: e.clientX,
                          y: e.clientY,
                          text: `${prettyDate(date)} · ${logged ? `${day!.score_pct}%` : 'no log'}`,
                        })
                      }
                      onMouseLeave={() => setHover(null)}
                      style={{
                        ...cellStyle,
                        boxShadow: isToday ? 'inset 0 0 0 1.5px var(--ink)' : undefined,
                      }}
                      className={`rounded-xs ${fixedCell ? '' : 'w-full'} ${gridCellClass(
                        day?.score_pct ?? 0,
                        logged
                      )}`}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {!fixedCell && (
        <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px] lowercase text-muted">
          <span>less</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <div
              key={l}
              className={`h-[13px] w-[13px] rounded-xs ${gridCellClass(l === 0 ? 0 : l * 25, l !== 0)}`}
            />
          ))}
          <span>more</span>
        </div>
      )}

      {hover && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-md border border-line-2 bg-ink px-2 py-1 text-xs lowercase text-paper shadow-md"
          style={{ left: hover.x, top: hover.y - 6 }}
        >
          {hover.text}
        </div>
      )}
    </div>
  );
}

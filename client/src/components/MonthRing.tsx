import type { MonthBand } from '@lifeline/shared';
import { bandColor, bandLabel } from '../lib/bands.js';

const CAPTION: Record<MonthBand, string> = {
  warn: 'chhoti shuruaat karo.',
  ontrack: 'target zone. aise hi chalo.',
  bonus: 'bonus reward unlocked!',
};

/** Month-completion donut on warm paper, colored by band (spec dataviz/MonthRing). */
export default function MonthRing({ pct, band }: { pct: number; band: MonthBand }) {
  const size = 96;
  const thickness = 9;
  const value = Math.min(100, Math.max(0, pct));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value / 100);
  const color = bandColor(band);

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--grid-0)" strokeWidth={thickness} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset var(--dur-3) var(--ease-out)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
          <span className="text-2xl font-bold leading-none tabular-nums text-ink">{Math.round(value)}</span>
          <span className="text-[10px] lowercase text-muted">percent</span>
        </div>
      </div>
      <div>
        <div className="text-sm font-medium lowercase" style={{ color }}>
          {bandLabel(band)}
        </div>
        <div className="mt-1 text-xs lowercase text-muted">{CAPTION[band]}</div>
      </div>
    </div>
  );
}

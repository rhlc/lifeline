import type { MonthBand } from '@lifeline/shared';
import { bandColor, bandLabel } from '../lib/bands.js';

/** SVG progress ring for the month % with band coloring (spec §5e). */
export default function MonthRing({ pct, band }: { pct: number; band: MonthBand }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, pct)) / 100);
  const color = bandColor(band);

  return (
    <div className="flex items-center gap-4">
      <svg width="88" height="88" viewBox="0 0 88 88" className="shrink-0">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#272f3d" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text x="44" y="43" textAnchor="middle" className="fill-ink" fontSize="19" fontWeight="700">
          {pct}%
        </text>
        <text x="44" y="58" textAnchor="middle" fill="#8b96a7" fontSize="8">
          this month
        </text>
      </svg>
      <div>
        <div className="text-sm font-semibold" style={{ color }}>
          {bandLabel(band)}
        </div>
        <div className="mt-1 text-xs text-muted">
          {band === 'warn' && 'Chhoti shuruaat karo.'}
          {band === 'ontrack' && 'Target zone. Aise hi chalo.'}
          {band === 'bonus' && 'Bonus reward unlocked!'}
        </div>
      </div>
    </div>
  );
}

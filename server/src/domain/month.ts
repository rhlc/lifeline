// Monthly rollup (spec §5e). Average score over LOGGED days only — unlogged
// future/past days are not counted as zeros, so the ring isn't unfairly low
// early in the month.
import type { Day, MonthBand } from '@lifeline/shared';
import { classifyBand } from '@lifeline/shared';
import { monthOf } from '../lib/dates.js';

export function monthPct(days: Day[], month: string): number {
  const logged = days.filter((d) => monthOf(d.day) === month);
  if (logged.length === 0) return 0;
  const sum = logged.reduce((a, d) => a + d.score_pct, 0);
  return Math.round(sum / logged.length);
}

export function monthBand(pct: number): MonthBand {
  return classifyBand(pct);
}

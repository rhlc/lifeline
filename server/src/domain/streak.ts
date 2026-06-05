// Streak recomputation (spec §5b) — deterministic from full day history.
// Delegates to the shared walk so streak and XP stay perfectly in sync.
import type { Day } from '@lifeline/shared';
import { walkDays, qualifies } from './walk.js';

export { qualifies };

export interface StreakResult {
  current: number;
  longest: number;
  freezesLeft: number; // remaining for the current month
  freezeResetMonth: string; // 'YYYY-MM' the freezes belong to (current month)
}

export function recomputeStreak(days: Day[], today: string, prevLongest = 0): StreakResult {
  const w = walkDays(days, today);
  return {
    current: w.current,
    longest: Math.max(prevLongest, w.longest),
    freezesLeft: w.freezesLeft,
    freezeResetMonth: w.freezeResetMonth,
  };
}

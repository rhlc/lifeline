// XP & level recomputation (spec §5c) — derived purely from full day history,
// using the same forward walk as the streak so milestone bonuses line up with
// the actual streak progression. Idempotent: editing a past day and saving
// again reproduces the same totals (no double-counted bonuses).
import type { Day } from '@lifeline/shared';
import { XP_RULES, levelForXp, dayEngagement } from '@lifeline/shared';
import { walkDays } from './walk.js';

export interface XpResult {
  xp: number;
  level: number;
}

/** XP earned by a single logged day, from its engagement / score band. */
function dayBandXp(day: Day): number {
  if (dayEngagement(day) === 'survival') return XP_RULES.survival;
  const p = day.score_pct;
  if (p >= 90) return XP_RULES.great;
  if (p >= 70) return XP_RULES.good;
  if (p >= 40) return XP_RULES.okay;
  return 0; // logged but below the "okay" band — no gain, no loss
}

export function recomputeXp(days: Day[], today: string): XpResult {
  const w = walkDays(days, today);
  let xp = 0;

  for (const step of w.steps) {
    if (step.pending) continue; // today, not locked in yet

    if (step.day) {
      xp += dayBandXp(step.day);
    } else if (step.broke) {
      // a fully-skipped day with no freeze left
      xp += XP_RULES.skipped;
    }
    // freeze-absorbed missing days cost nothing.

    // Streak milestone bonuses fire on the upward crossing.
    if (step.counts) {
      if (step.streakAfter === 7) xp += XP_RULES.streak7Bonus;
      if (step.streakAfter === 30) xp += XP_RULES.streak30Bonus;
    }
  }

  xp = Math.max(0, xp); // morale > punishment — XP never shows negative
  return { xp, level: levelForXp(xp) };
}

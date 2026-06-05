// Shared forward walk over day history. Streak and XP both derive from this
// single pass so they can never disagree about freezes, breaks, or milestones.
import type { Day } from '@lifeline/shared';
import { FREEZES_PER_MONTH } from '@lifeline/shared';
import { dateRange, monthOf } from '../lib/dates.js';
import { dayEngagement } from '@lifeline/shared';

/**
 * A day counts toward the streak if it has any positive engagement (a 'full'
 * or 'survival' day). Derived from the taps — no explicit Survival button.
 */
export function qualifies(day: Day): boolean {
  return dayEngagement(day) !== 'none';
}

export interface DayStep {
  date: string;
  day: Day | undefined;
  counts: boolean; // qualified toward streak
  pending: boolean; // today, not yet locked in — no effect
  freezeUsed: boolean; // a missed day absorbed by a freeze
  broke: boolean; // streak reset to 0 on this day
  streakAfter: number;
}

export interface WalkResult {
  steps: DayStep[];
  current: number;
  longest: number;
  freezesLeft: number; // remaining for the current (today's) month
  freezeResetMonth: string;
}

export function walkDays(days: Day[], today: string): WalkResult {
  const curMonthKey = monthOf(today);

  if (days.length === 0) {
    return {
      steps: [],
      current: 0,
      longest: 0,
      freezesLeft: FREEZES_PER_MONTH,
      freezeResetMonth: curMonthKey,
    };
  }

  const byDay = new Map(days.map((d) => [d.day, d]));
  const earliest = days[0].day;
  const end = today >= earliest ? today : earliest;

  const steps: DayStep[] = [];
  let current = 0;
  let longest = 0;
  let walkMonth = '';
  let freezeBudget = FREEZES_PER_MONTH;

  for (const date of dateRange(earliest, end)) {
    const month = monthOf(date);
    if (month !== walkMonth) {
      walkMonth = month;
      freezeBudget = FREEZES_PER_MONTH;
    }

    const day = byDay.get(date);
    const counts = day ? qualifies(day) : false;
    let pending = false;
    let freezeUsed = false;
    let broke = false;

    if (counts) {
      current += 1;
    } else if (date === today) {
      pending = true; // pending — neither breaks nor increments
    } else if (current > 0) {
      // There's an active streak to protect.
      if (freezeBudget > 0) {
        freezeBudget -= 1;
        freezeUsed = true;
      } else {
        current = 0;
        broke = true; // the day the streak actually snaps (one XP penalty)
      }
    }
    // else: dormant (streak already 0) — a missing day costs nothing.

    if (current > longest) longest = current;

    steps.push({ date, day, counts, pending, freezeUsed, broke, streakAfter: current });
  }

  return {
    steps,
    current,
    longest,
    freezesLeft: freezeBudget,
    freezeResetMonth: curMonthKey,
  };
}

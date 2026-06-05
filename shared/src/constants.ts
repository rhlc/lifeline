// Single source of truth for scoring, XP, bands, levels, freezes.
// Both server (authoritative compute) and client (display helpers) import these.

import type { MonthBand } from './types.js';

/** Point values per the spec §5a. Work is the keystone (double weight). */
export const POINTS = {
  work: 30,
  wake: 15,
  move: 15,
  food: 10, // only when 'control'
  mood: 5, // logging at all earns it
  screen: 10, // screen time kept under 1 hour
  block: 10, // per work block hit
} as const;

/** Fixed (non-block) portion of a clean day's max. */
export const BASE_MAX =
  POINTS.work + POINTS.wake + POINTS.move + POINTS.food + POINTS.mood + POINTS.screen; // 85

/** XP awarded per day band, plus streak milestone bonuses (spec §5c). */
export const XP_RULES = {
  great: 25, // >= 90%
  good: 15, // 70..89%
  okay: 8, // 40..69%
  survival: 4, // survival-mode day
  skipped: -10, // fully skipped with no freeze left
  streak7Bonus: 20,
  streak30Bonus: 100,
} as const;

/** Monthly % thresholds (spec §5e). */
export const BANDS = {
  ontrack: 70,
  bonus: 90,
} as const;

export function classifyBand(pct: number): MonthBand {
  if (pct >= BANDS.bonus) return 'bonus';
  if (pct >= BANDS.ontrack) return 'ontrack';
  return 'warn';
}

/** Free streak freezes per month (spec §5b). */
export const FREEZES_PER_MONTH = 2;

/** Grid color band by day score % (spec §5d). 0 = empty/skipped. */
export type GridLevel = 0 | 1 | 2 | 3 | 4;
export function gridLevel(pct: number): GridLevel {
  if (pct <= 0) return 0;
  if (pct < 40) return 1;
  if (pct < 70) return 2;
  if (pct < 90) return 3;
  return 4;
}

/** Level definitions (spec §6). Index 0 = level 1. */
export interface LevelDef {
  level: number;
  emoji: string;
  name: string;
  /** Cumulative XP required to REACH this level. */
  xpFloor: number;
}

export const LEVELS: LevelDef[] = [
  { level: 1, emoji: '🛋️', name: 'Aalsi Aatma', xpFloor: 0 },
  { level: 2, emoji: '☕', name: 'Chai Intern', xpFloor: 100 },
  { level: 3, emoji: '⏰', name: 'Snooze Survivor', xpFloor: 250 },
  { level: 4, emoji: '🔧', name: 'Jugaad Junior', xpFloor: 450 },
  { level: 5, emoji: '📋', name: 'Routine Rookie', xpFloor: 700 },
  { level: 6, emoji: '🎯', name: 'Consistency Cadet', xpFloor: 1000 },
  { level: 7, emoji: '💪', name: 'Deadline Dabangg', xpFloor: 1400 },
  { level: 8, emoji: '🧘', name: 'Focus Pandit', xpFloor: 1900 },
  { level: 9, emoji: '🔥', name: 'Grind Guru', xpFloor: 2500 },
  { level: 10, emoji: '🦁', name: 'Anushasan Avatar', xpFloor: 3200 },
];

export function levelForXp(xp: number): number {
  let lvl = 1;
  for (const def of LEVELS) {
    if (xp >= def.xpFloor) lvl = def.level;
    else break;
  }
  return lvl;
}

export function levelDef(level: number): LevelDef {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

/** Progress within the current level: returns 0..1 and the floor/ceil XP. */
export function levelProgress(xp: number): {
  level: number;
  floor: number;
  ceil: number;
  ratio: number;
} {
  const level = levelForXp(xp);
  const idx = level - 1;
  const floor = LEVELS[idx].xpFloor;
  const ceil = idx + 1 < LEVELS.length ? LEVELS[idx + 1].xpFloor : floor; // max level
  const span = ceil - floor;
  const ratio = span <= 0 ? 1 : Math.min(1, Math.max(0, (xp - floor) / span));
  return { level, floor, ceil, ratio };
}

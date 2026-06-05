// Context-derived day status — replaces the explicit Lock-in / Survival buttons.
// With auto-save, the day classifies itself from what was actually logged.
import type { DayInput } from './types.js';

export type Engagement =
  | 'full' // showed up to work + at least one other tile — a real day
  | 'survival' // logged *something* positive, but below the full minimum
  | 'none'; // nothing positive logged — a skipped day

type Taps = Pick<DayInput, 'work' | 'wake' | 'move' | 'food' | 'mood' | 'screen_ok' | 'blocks'>;

/**
 * Classify a day from its taps. Streak survives on 'full' OR 'survival';
 * 'none' is a miss (a freeze may still absorb it). Even a single positive tap
 * (e.g. logging your mood) counts as 'survival' — the streak stays alive.
 */
export function dayEngagement(d: Taps): Engagement {
  const blockHit = d.blocks.some(Boolean);
  const other =
    d.wake || d.move || d.food === 'control' || d.mood !== null || d.screen_ok || blockHit;
  if (d.work && other) return 'full';
  if (d.work || other) return 'survival';
  return 'none';
}

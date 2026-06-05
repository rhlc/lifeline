// Pure daily scoring (spec §5a). No DB, no clock.
import type { Day, DayInput, Settings } from '@lifeline/shared';
import { POINTS, BASE_MAX } from '@lifeline/shared';

type ScorableDay = Pick<
  Day | DayInput,
  'work' | 'wake' | 'move' | 'food' | 'mood' | 'screen_ok' | 'blocks'
>;

/**
 * Compute a day's score as a percentage of that day's max.
 * Work is the keystone (2x weight). All tiles are positives; the day floors at 0.
 * Max uses the day's own block count if it logged any, else the configured
 * work_blocks, so historical days stay stable when settings change.
 */
export function computeDayScore(day: ScorableDay, settings: Pick<Settings, 'work_blocks'>): number {
  let raw = 0;
  if (day.work) raw += POINTS.work;
  if (day.wake) raw += POINTS.wake;
  if (day.move) raw += POINTS.move;
  if (day.food === 'control') raw += POINTS.food;
  if (day.mood) raw += POINTS.mood; // logging at all earns it
  if (day.screen_ok) raw += POINTS.screen; // screen time under 1 hour

  const blockHits = day.blocks.filter(Boolean).length;
  raw += blockHits * POINTS.block;

  raw = Math.max(0, raw);

  const blockCount = day.blocks.length > 0 ? day.blocks.length : settings.work_blocks;
  const max = BASE_MAX + blockCount * POINTS.block;

  const pct = Math.round((raw / max) * 100);
  return Math.min(100, Math.max(0, pct));
}

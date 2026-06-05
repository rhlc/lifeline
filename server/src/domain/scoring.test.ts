import { describe, it, expect } from 'vitest';
import { computeDayScore } from './scoring.js';
import type { DayInput } from '@lifeline/shared';

const base: DayInput = {
  work: false,
  wake: false,
  move: false,
  food: null,
  mood: null,
  screen_ok: false,
  blocks: [false, false, false, false],
  survival_mode: false,
};

// Clean-day max = work30+wake15+move15+food10+mood5+screen10 + 4 blocks*10 = 125.
describe('computeDayScore', () => {
  it('a clean day with 4 blocks normalizes to 100%', () => {
    const day: DayInput = {
      ...base,
      work: true,
      wake: true,
      move: true,
      food: 'control',
      mood: 'good',
      screen_ok: true,
      blocks: [true, true, true, true],
    };
    expect(computeDayScore(day, { work_blocks: 4 })).toBe(100);
  });

  it('an empty day is 0%', () => {
    expect(computeDayScore(base, { work_blocks: 4 })).toBe(0);
  });

  it('work alone is 30/125 = 24%', () => {
    expect(computeDayScore({ ...base, work: true }, { work_blocks: 4 })).toBe(24);
  });

  it('mood logged (any value) earns 5 points', () => {
    expect(computeDayScore({ ...base, mood: 'low' }, { work_blocks: 4 })).toBe(
      Math.round((5 / 125) * 100)
    );
  });

  it("food 'lost' earns nothing, 'control' earns 10", () => {
    expect(computeDayScore({ ...base, food: 'lost' }, { work_blocks: 4 })).toBe(0);
    expect(computeDayScore({ ...base, food: 'control' }, { work_blocks: 4 })).toBe(
      Math.round((10 / 125) * 100)
    );
  });

  it('screen time under 1 hour adds points', () => {
    expect(computeDayScore({ ...base, screen_ok: true }, { work_blocks: 4 })).toBe(
      Math.round((10 / 125) * 100)
    );
  });

  it("uses the day's own block count for max when blocks are present", () => {
    // 2 blocks both hit, plus work: max = 85 + 2*10 = 105; raw = 30 + 20 = 50
    const day: DayInput = { ...base, work: true, blocks: [true, true] };
    expect(computeDayScore(day, { work_blocks: 4 })).toBe(Math.round((50 / 105) * 100));
  });
});

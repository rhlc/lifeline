import { describe, it, expect } from 'vitest';
import { monthPct, monthBand } from './month.js';
import type { Day } from '@lifeline/shared';

function mkDay(day: string, score: number): Day {
  return {
    day,
    work: true,
    wake: false,
    move: false,
    food: null,
    mood: null,
    screen_ok: false,
    blocks: [],
    survival_mode: false,
    score_pct: score,
  };
}

describe('monthPct', () => {
  it('averages over logged days only (no zero-padding)', () => {
    const days = [mkDay('2026-06-01', 80), mkDay('2026-06-02', 60)];
    expect(monthPct(days, '2026-06')).toBe(70);
  });

  it('ignores other months', () => {
    const days = [mkDay('2026-05-30', 10), mkDay('2026-06-01', 90)];
    expect(monthPct(days, '2026-06')).toBe(90);
  });

  it('is 0 with no logged days', () => {
    expect(monthPct([], '2026-06')).toBe(0);
  });
});

describe('monthBand', () => {
  it('classifies the three bands', () => {
    expect(monthBand(69)).toBe('warn');
    expect(monthBand(70)).toBe('ontrack');
    expect(monthBand(89)).toBe('ontrack');
    expect(monthBand(90)).toBe('bonus');
  });
});

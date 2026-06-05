import { describe, it, expect } from 'vitest';
import { recomputeStreak, qualifies } from './streak.js';
import type { Day } from '@lifeline/shared';

function mkDay(day: string, over: Partial<Day> = {}): Day {
  return {
    day,
    work: true,
    wake: true,
    move: false,
    food: null,
    mood: null,
    screen_ok: false,
    blocks: [],
    survival_mode: false,
    score_pct: 50,
    ...over,
  };
}

describe('qualifies', () => {
  it('counts a full day (work + another tile)', () => {
    expect(qualifies(mkDay('2026-06-01', { work: true, wake: true }))).toBe(true);
  });
  it('counts a minimal survival day (any single positive tap, e.g. mood)', () => {
    expect(qualifies(mkDay('2026-06-01', { work: false, wake: false, move: false, food: null, mood: 'ok' }))).toBe(true);
  });
  it('does not count an empty day', () => {
    expect(qualifies(mkDay('2026-06-01', { work: false, wake: false, move: false, food: null, mood: null }))).toBe(false);
  });
});

describe('recomputeStreak', () => {
  it('counts consecutive qualifying days', () => {
    const days = ['2026-06-01', '2026-06-02', '2026-06-03'].map((d) => mkDay(d));
    const r = recomputeStreak(days, '2026-06-03');
    expect(r.current).toBe(3);
    expect(r.longest).toBe(3);
  });

  it('a single missed day is absorbed by a freeze (streak survives)', () => {
    // 01,02 qualify; 03 missing; 04 qualifies. today = 04.
    const days = ['2026-06-01', '2026-06-02', '2026-06-04'].map((d) => mkDay(d));
    const r = recomputeStreak(days, '2026-06-04');
    expect(r.current).toBe(3); // not reset
    expect(r.freezesLeft).toBe(1); // one freeze used this month
  });

  it('breaks after freezes are exhausted in a month', () => {
    // 01 qualifies; 02,03,04 missing (2 freezes used, then break); 05 qualifies.
    const days = ['2026-06-01', '2026-06-05'].map((d) => mkDay(d));
    const r = recomputeStreak(days, '2026-06-05');
    expect(r.current).toBe(1); // streak broke on 04, rebuilt to 1 on 05
    expect(r.freezesLeft).toBe(0);
  });

  it('refills freezes at month rollover', () => {
    // May: 01 qualifies, then a gap; June starts fresh with 2 freezes.
    const days = [mkDay('2026-05-01'), mkDay('2026-06-02')];
    const r = recomputeStreak(days, '2026-06-02');
    expect(r.freezeResetMonth).toBe('2026-06');
    expect(r.freezesLeft).toBe(2); // June freezes untouched (May absorbed its own gap)
  });

  it('today before lock-in is pending — does not break the streak', () => {
    // 01,02 qualify; today 03 has no row.
    const days = ['2026-06-01', '2026-06-02'].map((d) => mkDay(d));
    const r = recomputeStreak(days, '2026-06-03');
    expect(r.current).toBe(2); // still 2, today pending
    expect(r.freezesLeft).toBe(2); // today's pending state did not spend a freeze
  });

  it('a minimal survival day preserves the streak (no freeze spent)', () => {
    const days = [
      mkDay('2026-06-01'),
      mkDay('2026-06-02', { work: false, wake: false, move: false, food: null, mood: 'low' }),
      mkDay('2026-06-03'),
    ];
    const r = recomputeStreak(days, '2026-06-03');
    expect(r.current).toBe(3);
    expect(r.freezesLeft).toBe(2); // it qualified, so no freeze was needed
  });

  it('keeps longest monotonic via prevLongest', () => {
    const days = [mkDay('2026-06-05')];
    const r = recomputeStreak(days, '2026-06-05', 9);
    expect(r.longest).toBe(9);
  });
});

import { describe, it, expect } from 'vitest';
import { recomputeXp } from './xp.js';
import type { Day } from '@lifeline/shared';
import { XP_RULES } from '@lifeline/shared';

function mkDay(day: string, score: number, over: Partial<Day> = {}): Day {
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
    score_pct: score,
    ...over,
  };
}

describe('recomputeXp', () => {
  it('awards band XP per day', () => {
    const days = [mkDay('2026-06-01', 95), mkDay('2026-06-02', 75), mkDay('2026-06-03', 50)];
    const r = recomputeXp(days, '2026-06-03');
    expect(r.xp).toBe(XP_RULES.great + XP_RULES.good + XP_RULES.okay);
  });

  it('a survival day (minimal taps) earns the survival amount', () => {
    const days = [mkDay('2026-06-01', 5, { work: false, wake: false, mood: 'ok' })];
    expect(recomputeXp(days, '2026-06-01').xp).toBe(XP_RULES.survival);
  });

  it('awards the 7-day streak bonus exactly once', () => {
    const days = Array.from({ length: 7 }, (_, i) =>
      mkDay(`2026-06-0${i + 1}`, 95)
    );
    const r = recomputeXp(days, '2026-06-07');
    expect(r.xp).toBe(7 * XP_RULES.great + XP_RULES.streak7Bonus);
  });

  it('is idempotent / pure — same history yields same XP', () => {
    const days = [mkDay('2026-06-01', 95), mkDay('2026-06-02', 80)];
    expect(recomputeXp(days, '2026-06-02').xp).toBe(recomputeXp(days, '2026-06-02').xp);
  });

  it('never goes negative', () => {
    // one broke day, no positives
    const days = [mkDay('2026-06-01', 95), mkDay('2026-06-05', 95)]; // gap breaks after 2 freezes
    const r = recomputeXp(days, '2026-06-10');
    expect(r.xp).toBeGreaterThanOrEqual(0);
  });

  it('pending today does not add XP', () => {
    const days = [mkDay('2026-06-01', 95)];
    const withToday = recomputeXp(days, '2026-06-02'); // 02 has no row, pending
    expect(withToday.xp).toBe(XP_RULES.great);
  });
});

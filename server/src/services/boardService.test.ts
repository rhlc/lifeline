import { describe, it, expect } from 'vitest';
import { toPublicBoard } from './boardService.js';
import type { Board } from '@lifeline/shared';

const ownerBoard: Board = {
  isOwner: true,
  profile: {
    xp: 100,
    level: 2,
    current_streak: 3,
    longest_streak: 5,
    freezes_left_this_month: 2,
    freeze_reset_month: '2026-06',
  },
  settings: {
    wake_target: '06:30',
    steps_target: 8000,
    work_blocks: 4,
    block_length_hrs: 2,
    monthly_savings_target: 20000,
  },
  days: [],
  months: [{ month: '2026-06', budget: 40000, savings: 50000, expenses: 30000 }],
  goals: [],
  rewards: [],
  monthPct: 80,
  monthBand: 'ontrack',
  today: '2026-06-05',
};

describe('toPublicBoard (money never leaks)', () => {
  const pub = toPublicBoard(ownerBoard);
  const json = JSON.stringify(pub);

  it('omits the months table entirely', () => {
    expect('months' in (pub as unknown as Record<string, unknown>)).toBe(false);
    expect(json).not.toContain('50000');
    expect(json).not.toContain('expenses');
  });

  it('strips monthly_savings_target from settings', () => {
    expect('monthly_savings_target' in pub.settings).toBe(false);
    expect(json).not.toContain('20000');
  });

  it('keeps non-money public fields', () => {
    expect(pub.settings.wake_target).toBe('06:30');
    expect(pub.profile.current_streak).toBe(3);
    expect(pub.isOwner).toBe(false);
  });
});

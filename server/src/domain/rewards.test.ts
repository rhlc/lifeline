import { describe, it, expect } from 'vitest';
import { evaluateRewards, nextReward } from './rewards.js';
import type { Reward } from '@lifeline/shared';

const rewards: Reward[] = [
  { id: 1, emoji: '🍗', label: 'Biryani', threshold: 70, unlocked: false, unlocked_at: null },
  { id: 2, emoji: '🏍️', label: 'Ride', threshold: 90, unlocked: false, unlocked_at: null },
];

describe('evaluateRewards', () => {
  it('unlocks base rewards at 70% and keeps bonus locked', () => {
    expect(evaluateRewards(rewards, 75).newlyUnlockedIds).toEqual([1]);
  });
  it('unlocks both at 90%', () => {
    expect(evaluateRewards(rewards, 92).newlyUnlockedIds).toEqual([1, 2]);
  });
  it('does not re-unlock an already-unlocked reward (once forever)', () => {
    const partly = rewards.map((r) => (r.id === 1 ? { ...r, unlocked: true } : r));
    expect(evaluateRewards(partly, 95).newlyUnlockedIds).toEqual([2]);
  });
});

describe('nextReward', () => {
  it('is the lowest-threshold still-locked reward', () => {
    expect(nextReward(rewards)?.id).toBe(1);
  });
  it('is null when all unlocked', () => {
    expect(nextReward(rewards.map((r) => ({ ...r, unlocked: true })))).toBeNull();
  });
});

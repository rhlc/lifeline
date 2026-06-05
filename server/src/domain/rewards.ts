// Reward unlocking (spec §5f). Decision: rewards unlock ONCE, permanently.
// Any still-locked reward whose threshold is met by the current month %
// flips to unlocked and stays that way.
import type { Reward } from '@lifeline/shared';

export interface RewardEvaluation {
  /** Ids that transition from locked -> unlocked in this evaluation. */
  newlyUnlockedIds: number[];
}

export function evaluateRewards(rewards: Reward[], monthPct: number): RewardEvaluation {
  const newlyUnlockedIds: number[] = [];
  for (const r of rewards) {
    if (!r.unlocked && monthPct >= r.threshold) {
      newlyUnlockedIds.push(r.id);
    }
  }
  return { newlyUnlockedIds };
}

/** The next reward to chase: lowest-threshold still-locked reward. */
export function nextReward(rewards: Reward[]): Reward | null {
  const locked = rewards.filter((r) => !r.unlocked);
  if (locked.length === 0) return null;
  return locked.reduce((best, r) => (r.threshold < best.threshold ? r : best));
}

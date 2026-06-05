import type Database from 'better-sqlite3';
import type {
  Board,
  PublicBoard,
  DayInput,
  DaySaveResult,
  Reward,
} from '@lifeline/shared';
import {
  settingsRepo,
  profileRepo,
  daysRepo,
  monthsRepo,
  goalsRepo,
  rewardsRepo,
} from '../db/repositories.js';
import { computeDayScore } from '../domain/scoring.js';
import { recomputeStreak } from '../domain/streak.js';
import { recomputeXp } from '../domain/xp.js';
import { monthPct as calcMonthPct, monthBand } from '../domain/month.js';
import { evaluateRewards } from '../domain/rewards.js';
import { monthOf } from '../lib/dates.js';
import { dayEngagement } from '@lifeline/shared';

/** Assemble the full owner board for a given "today". */
export function buildBoard(db: Database.Database, today: string): Board {
  const profile = profileRepo.get(db);
  const settings = settingsRepo.get(db);
  const days = daysRepo.all(db);
  const months = monthsRepo.all(db);
  const goals = goalsRepo.all(db);
  const rewards = rewardsRepo.all(db);
  const pct = calcMonthPct(days, monthOf(today));

  return {
    isOwner: true,
    profile,
    settings,
    days,
    months,
    goals,
    rewards,
    monthPct: pct,
    monthBand: monthBand(pct),
    today,
  };
}

/** Strip everything private (money) for public viewers. Single chokepoint. */
export function toPublicBoard(board: Board): PublicBoard {
  const { monthly_savings_target, ...publicSettings } = board.settings;
  return {
    isOwner: false,
    profile: board.profile,
    settings: publicSettings,
    days: board.days,
    goals: board.goals,
    rewards: board.rewards,
    monthPct: board.monthPct,
    monthBand: board.monthBand,
    today: board.today,
  };
}

/**
 * Upsert a day's raw taps, then recompute everything server-side in one
 * transaction: score → streak (+ freezes) → XP/level → reward unlocks.
 */
export function saveDay(
  db: Database.Database,
  date: string,
  input: DayInput,
  today: string,
  nowIso: string
): DaySaveResult {
  const tx = db.transaction((): { newlyUnlocked: Reward[]; messageKey: string | null } => {
    const settings = settingsRepo.get(db);

    // 1. score the edited day and persist its raw taps + score.
    //    survival_mode is now derived from the taps (no explicit button).
    const stored = { ...input, survival_mode: dayEngagement(input) === 'survival' };
    const score = computeDayScore(stored, settings);
    daysRepo.upsert(db, date, stored, score, nowIso);

    // 2. reload full history and recompute streak + XP from scratch.
    const days = daysRepo.all(db);
    const prevProfile = profileRepo.get(db);
    const streak = recomputeStreak(days, today, prevProfile.longest_streak);
    const xp = recomputeXp(days, today);

    profileRepo.update(db, {
      xp: xp.xp,
      level: xp.level,
      current_streak: streak.current,
      longest_streak: streak.longest,
      freezes_left_this_month: streak.freezesLeft,
      freeze_reset_month: streak.freezeResetMonth,
    });

    // 3. evaluate reward unlocks for the edited day's month.
    const pct = calcMonthPct(days, monthOf(date));
    const rewards = rewardsRepo.all(db);
    const result = evaluateRewards(rewards, pct);
    for (const id of result.newlyUnlockedIds) rewardsRepo.setUnlocked(db, id, nowIso);

    const newlyUnlocked = rewardsRepo
      .all(db)
      .filter((r) => result.newlyUnlockedIds.includes(r.id));

    return { newlyUnlocked, messageKey: pickMessageKey(input, pct, newlyUnlocked) };
  });

  const { newlyUnlocked, messageKey } = tx();
  return { board: buildBoard(db, today), newlyUnlocked, messageKey };
}

/** Choose a single nudge key for the client to render (spec §6 tone). */
function pickMessageKey(input: DayInput, pct: number, newlyUnlocked: Reward[]): string | null {
  if (newlyUnlocked.length > 0 || pct >= 90) return 'month90';
  if (dayEngagement(input) === 'survival') return 'survivalUsed';
  if (input.food === 'lost') return 'foodLost';
  if (input.mood === 'low') return 'lowMorale';
  return null;
}

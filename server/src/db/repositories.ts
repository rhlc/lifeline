import type Database from 'better-sqlite3';
import type {
  Day,
  DayInput,
  Profile,
  Settings,
  Month,
  Goal,
  Reward,
} from '@lifeline/shared';

// ---- row <-> domain conversion at the boundary -----------------------------

const bool = (n: number | null | undefined): boolean => n === 1;
const intb = (b: boolean): number => (b ? 1 : 0);

interface DayRow {
  day: string;
  work: number;
  wake: number;
  move: number;
  food: string | null;
  mood: string | null;
  screen_ok: number;
  blocks: string;
  survival_mode: number;
  score_pct: number;
}

function rowToDay(r: DayRow): Day {
  return {
    day: r.day,
    work: bool(r.work),
    wake: bool(r.wake),
    move: bool(r.move),
    food: (r.food as Day['food']) ?? null,
    mood: (r.mood as Day['mood']) ?? null,
    screen_ok: bool(r.screen_ok),
    blocks: safeBlocks(r.blocks),
    survival_mode: bool(r.survival_mode),
    score_pct: r.score_pct,
  };
}

function safeBlocks(json: string): boolean[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(Boolean) : [];
  } catch {
    return [];
  }
}

// ---- settings --------------------------------------------------------------

export const settingsRepo = {
  get(db: Database.Database): Settings {
    return db
      .prepare(
        'SELECT wake_target, steps_target, work_blocks, block_length_hrs, monthly_savings_target FROM settings WHERE id = 1'
      )
      .get() as Settings;
  },
  update(db: Database.Database, s: Omit<Settings, never>): void {
    db.prepare(
      `UPDATE settings SET
        wake_target = @wake_target,
        steps_target = @steps_target,
        work_blocks = @work_blocks,
        block_length_hrs = @block_length_hrs,
        monthly_savings_target = @monthly_savings_target
       WHERE id = 1`
    ).run(s);
  },
};

// ---- profile ---------------------------------------------------------------

export const profileRepo = {
  get(db: Database.Database): Profile {
    return db.prepare('SELECT xp, level, current_streak, longest_streak, freezes_left_this_month, freeze_reset_month FROM profile WHERE id = 1').get() as Profile;
  },
  update(db: Database.Database, p: Profile): void {
    db.prepare(
      `UPDATE profile SET
        xp = @xp,
        level = @level,
        current_streak = @current_streak,
        longest_streak = @longest_streak,
        freezes_left_this_month = @freezes_left_this_month,
        freeze_reset_month = @freeze_reset_month
       WHERE id = 1`
    ).run(p);
  },
};

// ---- days ------------------------------------------------------------------

export const daysRepo = {
  all(db: Database.Database): Day[] {
    const rows = db.prepare('SELECT * FROM days ORDER BY day ASC').all() as DayRow[];
    return rows.map(rowToDay);
  },
  get(db: Database.Database, day: string): Day | null {
    const r = db.prepare('SELECT * FROM days WHERE day = ?').get(day) as DayRow | undefined;
    return r ? rowToDay(r) : null;
  },
  upsert(db: Database.Database, day: string, input: DayInput, scorePct: number, updatedAt: string): void {
    db.prepare(
      `INSERT INTO days (day, work, wake, move, food, mood, screen_ok, blocks, survival_mode, score_pct, updated_at)
       VALUES (@day, @work, @wake, @move, @food, @mood, @screen_ok, @blocks, @survival_mode, @score_pct, @updated_at)
       ON CONFLICT(day) DO UPDATE SET
        work = excluded.work,
        wake = excluded.wake,
        move = excluded.move,
        food = excluded.food,
        mood = excluded.mood,
        screen_ok = excluded.screen_ok,
        blocks = excluded.blocks,
        survival_mode = excluded.survival_mode,
        score_pct = excluded.score_pct,
        updated_at = excluded.updated_at`
    ).run({
      day,
      work: intb(input.work),
      wake: intb(input.wake),
      move: intb(input.move),
      food: input.food,
      mood: input.mood,
      screen_ok: intb(input.screen_ok),
      blocks: JSON.stringify(input.blocks),
      survival_mode: intb(input.survival_mode),
      score_pct: scorePct,
      updated_at: updatedAt,
    });
  },
  /** Persist only a recomputed score for an existing day. */
  setScore(db: Database.Database, day: string, scorePct: number): void {
    db.prepare('UPDATE days SET score_pct = ? WHERE day = ?').run(scorePct, day);
  },
};

// ---- months (PRIVATE) ------------------------------------------------------

export const monthsRepo = {
  all(db: Database.Database): Month[] {
    return db.prepare('SELECT * FROM months ORDER BY month ASC').all() as Month[];
  },
  upsert(db: Database.Database, month: string, budget: number, savings: number, expenses: number): void {
    db.prepare(
      `INSERT INTO months (month, budget, savings, expenses) VALUES (?, ?, ?, ?)
       ON CONFLICT(month) DO UPDATE SET
         budget = excluded.budget, savings = excluded.savings, expenses = excluded.expenses`
    ).run(month, budget, savings, expenses);
  },
};

// ---- goals -----------------------------------------------------------------

export const goalsRepo = {
  all(db: Database.Database): Goal[] {
    return db.prepare('SELECT * FROM goals ORDER BY id ASC').all() as Goal[];
  },
  create(db: Database.Database, g: Omit<Goal, 'id'>): Goal {
    const info = db
      .prepare('INSERT INTO goals (scope, period, text, progress) VALUES (?, ?, ?, ?)')
      .run(g.scope, g.period ?? null, g.text, g.progress);
    return { id: Number(info.lastInsertRowid), ...g };
  },
  update(db: Database.Database, id: number, g: Omit<Goal, 'id'>): boolean {
    const info = db
      .prepare('UPDATE goals SET scope = ?, period = ?, text = ?, progress = ? WHERE id = ?')
      .run(g.scope, g.period ?? null, g.text, g.progress, id);
    return info.changes > 0;
  },
  remove(db: Database.Database, id: number): boolean {
    return db.prepare('DELETE FROM goals WHERE id = ?').run(id).changes > 0;
  },
};

// ---- rewards ---------------------------------------------------------------

interface RewardRow {
  id: number;
  emoji: string | null;
  label: string;
  threshold: number;
  unlocked: number;
  unlocked_at: string | null;
}

function rowToReward(r: RewardRow): Reward {
  return {
    id: r.id,
    emoji: r.emoji,
    label: r.label,
    threshold: r.threshold as 70 | 90,
    unlocked: bool(r.unlocked),
    unlocked_at: r.unlocked_at,
  };
}

export const rewardsRepo = {
  all(db: Database.Database): Reward[] {
    return (db.prepare('SELECT * FROM rewards ORDER BY threshold ASC, id ASC').all() as RewardRow[]).map(
      rowToReward
    );
  },
  create(db: Database.Database, r: { emoji: string | null; label: string; threshold: 70 | 90 }): Reward {
    const info = db
      .prepare('INSERT INTO rewards (emoji, label, threshold) VALUES (?, ?, ?)')
      .run(r.emoji, r.label, r.threshold);
    return { id: Number(info.lastInsertRowid), emoji: r.emoji, label: r.label, threshold: r.threshold, unlocked: false, unlocked_at: null };
  },
  update(db: Database.Database, id: number, r: { emoji: string | null; label: string; threshold: 70 | 90 }): boolean {
    return (
      db
        .prepare('UPDATE rewards SET emoji = ?, label = ?, threshold = ? WHERE id = ?')
        .run(r.emoji, r.label, r.threshold, id).changes > 0
    );
  },
  setUnlocked(db: Database.Database, id: number, unlockedAt: string): void {
    db.prepare('UPDATE rewards SET unlocked = 1, unlocked_at = ? WHERE id = ?').run(unlockedAt, id);
  },
  remove(db: Database.Database, id: number): boolean {
    return db.prepare('DELETE FROM rewards WHERE id = ?').run(id).changes > 0;
  },
};

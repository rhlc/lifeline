// Core domain types shared by server and client.
// The server is authoritative for all computed fields (score_pct, xp, level, streaks).

export type Food = 'control' | 'lost';
export type Mood = 'good' | 'ok' | 'low';
export type MonthBand = 'warn' | 'ontrack' | 'bonus';
export type GoalScope = 'month' | 'quarter' | 'year';

/** A single day's raw taps plus the server-computed score. */
export interface Day {
  day: string; // 'YYYY-MM-DD'
  work: boolean;
  wake: boolean;
  move: boolean;
  food: Food | null;
  mood: Mood | null;
  screen_ok: boolean; // screen time kept under 1 hour (a positive)
  blocks: boolean[]; // hit/miss per work block
  survival_mode: boolean;
  score_pct: number; // 0..100, computed server-side
}

/** The raw taps a client may send for a day (no computed fields). */
export interface DayInput {
  work: boolean;
  wake: boolean;
  move: boolean;
  food: Food | null;
  mood: Mood | null;
  screen_ok: boolean;
  blocks: boolean[];
  survival_mode: boolean;
}

export interface Profile {
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  freezes_left_this_month: number;
  freeze_reset_month: string | null; // 'YYYY-MM'
}

/** Full settings (owner view). */
export interface Settings {
  wake_target: string; // 'HH:MM'
  steps_target: number;
  work_blocks: number;
  block_length_hrs: number;
  monthly_savings_target: number; // PRIVATE — money
}

/** Settings exposed publicly — money target stripped. */
export type PublicSettings = Omit<Settings, 'monthly_savings_target'>;

export interface Month {
  month: string; // 'YYYY-MM'
  budget: number; // monthly spending budget; expenses draw down from this
  savings: number; // set aside separately — NOT reduced by expenses
  expenses: number;
}

export interface Goal {
  id: number;
  scope: GoalScope;
  period: string | null;
  text: string;
  progress: number; // 0..100
}

export interface Reward {
  id: number;
  emoji: string | null;
  label: string;
  threshold: 70 | 90;
  unlocked: boolean;
  unlocked_at: string | null;
}

export type TaskStatus = 'todo' | 'doing' | 'done' | 'blocked';

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  priority: number | null; // 0..3 (p0 most urgent), null = none
  project: string | null; // null = inbox
  block: string | null; // e.g. 'wb2'
  estimate: string | null; // '15m' | '1h' | 'half-day'
  due_date: string | null; // 'YYYY-MM-DD'
  created_at: string;
}

/** Full board returned to the logged-in owner. */
export interface Board {
  isOwner: true;
  profile: Profile;
  settings: Settings;
  days: Day[];
  months: Month[]; // PRIVATE
  goals: Goal[];
  rewards: Reward[];
  tasks: Task[];
  monthPct: number;
  monthBand: MonthBand;
  today: string; // owner-tz 'YYYY-MM-DD'
}

/** Read-only board returned to public viewers — money never present. */
export interface PublicBoard {
  isOwner: false;
  profile: Profile;
  settings: PublicSettings;
  days: Day[];
  goals: Goal[];
  rewards: Reward[];
  tasks: Task[];
  monthPct: number;
  monthBand: MonthBand;
  today: string;
}

export type AnyBoard = Board | PublicBoard;

/** Response from PUT /api/day — the recomputed board plus celebration hints. */
export interface DaySaveResult {
  board: Board;
  newlyUnlocked: Reward[];
  messageKey: string | null;
}

/** Full JSON backup shape (GET /api/export, POST /api/import). */
export interface Backup {
  version: 1;
  settings: Settings;
  profile: Profile;
  days: Day[];
  months: Month[];
  goals: Goal[];
  rewards: Reward[];
  tasks: Task[];
}

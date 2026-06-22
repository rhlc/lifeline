import type Database from 'better-sqlite3';

// Idempotent schema. Runs on every boot. SQLite translation of spec §8a:
// booleans -> INTEGER 0/1, blocks -> TEXT JSON, dates/timestamps -> TEXT.
const SCHEMA = `
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  id                     INTEGER PRIMARY KEY CHECK (id = 1),
  wake_target            TEXT    NOT NULL DEFAULT '06:30',
  steps_target           INTEGER NOT NULL DEFAULT 8000,
  work_blocks            INTEGER NOT NULL DEFAULT 4,
  block_length_hrs       INTEGER NOT NULL DEFAULT 2,
  monthly_savings_target INTEGER NOT NULL DEFAULT 20000
);

CREATE TABLE IF NOT EXISTS profile (
  id                      INTEGER PRIMARY KEY CHECK (id = 1),
  xp                      INTEGER NOT NULL DEFAULT 0,
  level                   INTEGER NOT NULL DEFAULT 1,
  current_streak          INTEGER NOT NULL DEFAULT 0,
  longest_streak          INTEGER NOT NULL DEFAULT 0,
  freezes_left_this_month INTEGER NOT NULL DEFAULT 2,
  freeze_reset_month      TEXT
);

CREATE TABLE IF NOT EXISTS days (
  day           TEXT PRIMARY KEY,                 -- 'YYYY-MM-DD'
  work          INTEGER NOT NULL DEFAULT 0,
  wake          INTEGER NOT NULL DEFAULT 0,
  move          INTEGER NOT NULL DEFAULT 0,
  food          TEXT,                             -- 'control' | 'lost' | NULL
  mood          TEXT,                             -- 'good' | 'ok' | 'low' | NULL
  screen_ok     INTEGER NOT NULL DEFAULT 0,        -- screen time under 1 hour
  blocks        TEXT    NOT NULL DEFAULT '[]',    -- JSON array of booleans
  survival_mode INTEGER NOT NULL DEFAULT 0,
  score_pct     INTEGER NOT NULL DEFAULT 0,       -- computed server-side
  updated_at    TEXT
);

CREATE TABLE IF NOT EXISTS months (
  month    TEXT PRIMARY KEY,                      -- 'YYYY-MM'  (PRIVATE)
  budget   INTEGER NOT NULL DEFAULT 0,            -- monthly spending budget
  savings  INTEGER NOT NULL DEFAULT 0,
  expenses INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS goals (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  scope    TEXT    NOT NULL CHECK (scope IN ('month','quarter','year')),
  period   TEXT,
  text     TEXT    NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS rewards (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  emoji       TEXT,
  label       TEXT    NOT NULL,
  threshold   INTEGER NOT NULL CHECK (threshold IN (70, 90)),
  unlocked    INTEGER NOT NULL DEFAULT 0,
  unlocked_at TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT    NOT NULL,
  status     TEXT    NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','done','blocked')),
  priority   INTEGER CHECK (priority BETWEEN 0 AND 3),  -- 0..3, NULL = none
  project    TEXT,                                      -- NULL = inbox
  block      TEXT,                                      -- e.g. 'wb2'
  estimate   TEXT,                                      -- '15m' | '1h' | 'half-day'
  due_date   TEXT,                                      -- 'YYYY-MM-DD'
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
`;

export function migrate(db: Database.Database): void {
  db.exec(SCHEMA);

  // v2: the negative `scroll_slip` became the positive `screen_ok`. Rename the
  // column on pre-existing databases (idempotent).
  const cols = (db.prepare('PRAGMA table_info(days)').all() as { name: string }[]).map((c) => c.name);
  if (cols.includes('scroll_slip') && !cols.includes('screen_ok')) {
    db.exec('ALTER TABLE days RENAME COLUMN scroll_slip TO screen_ok');
  }

  // v3: months gained a `budget` column (expenses draw down from it).
  const mCols = (db.prepare('PRAGMA table_info(months)').all() as { name: string }[]).map((c) => c.name);
  if (!mCols.includes('budget')) {
    db.exec('ALTER TABLE months ADD COLUMN budget INTEGER NOT NULL DEFAULT 0');
  }

  const row = db.prepare('SELECT version FROM schema_version LIMIT 1').get() as
    | { version: number }
    | undefined;
  if (!row) {
    db.prepare('INSERT INTO schema_version (version) VALUES (1)').run();
  }
}

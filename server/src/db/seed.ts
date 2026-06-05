import type Database from 'better-sqlite3';
import { todayInOwnerTz } from '../lib/clock.js';
import { monthOf } from '../lib/dates.js';
import { FREEZES_PER_MONTH } from '@lifeline/shared';

// Indian seed rewards (spec §5f). Editable later via the owner panel.
const SEED_REWARDS: Array<{ emoji: string; label: string; threshold: 70 | 90 }> = [
  { emoji: '🍗', label: 'Biryani night', threshold: 70 },
  { emoji: '☕', label: 'Extra-malai chai', threshold: 70 },
  { emoji: '🎬', label: 'Movie night', threshold: 70 },
  { emoji: '🏍️', label: 'Weekend ride to the hills', threshold: 90 },
  { emoji: '🛒', label: 'New bike accessory', threshold: 90 },
  { emoji: '🎮', label: 'Guilt-free game day', threshold: 90 },
];

export function seed(db: Database.Database): void {
  const month = monthOf(todayInOwnerTz());

  db.prepare('INSERT OR IGNORE INTO settings (id) VALUES (1)').run();

  db.prepare(
    `INSERT OR IGNORE INTO profile (id, freezes_left_this_month, freeze_reset_month)
     VALUES (1, ?, ?)`
  ).run(FREEZES_PER_MONTH, month);

  const rewardCount = (
    db.prepare('SELECT COUNT(*) AS n FROM rewards').get() as { n: number }
  ).n;
  if (rewardCount === 0) {
    const insert = db.prepare(
      'INSERT INTO rewards (emoji, label, threshold) VALUES (?, ?, ?)'
    );
    const tx = db.transaction(() => {
      for (const r of SEED_REWARDS) insert.run(r.emoji, r.label, r.threshold);
    });
    tx();
  }
}

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { Backup } from '@lifeline/shared';
import { getDb } from '../db/connection.js';
import { todayInOwnerTz } from '../lib/clock.js';
import {
  settingsRepo,
  profileRepo,
  daysRepo,
  monthsRepo,
  goalsRepo,
  rewardsRepo,
} from '../db/repositories.js';
import { buildBoard } from '../services/boardService.js';
import { parseOr400 } from '../lib/validate.js';

const importSchema = z.object({
  version: z.literal(1),
  settings: z.object({
    wake_target: z.string(),
    steps_target: z.number(),
    work_blocks: z.number(),
    block_length_hrs: z.number(),
    monthly_savings_target: z.number(),
  }),
  profile: z.object({
    xp: z.number(),
    level: z.number(),
    current_streak: z.number(),
    longest_streak: z.number(),
    freezes_left_this_month: z.number(),
    freeze_reset_month: z.string().nullable(),
  }),
  days: z.array(z.any()),
  months: z.array(z.any()),
  goals: z.array(z.any()),
  rewards: z.array(z.any()),
});

export default async function backupRoutes(app: FastifyInstance) {
  app.get('/api/export', { preHandler: app.requireOwner }, async () => {
    const db = getDb();
    const backup: Backup = {
      version: 1,
      settings: settingsRepo.get(db),
      profile: profileRepo.get(db),
      days: daysRepo.all(db),
      months: monthsRepo.all(db),
      goals: goalsRepo.all(db),
      rewards: rewardsRepo.all(db),
    };
    return backup;
  });

  app.post('/api/import', { preHandler: app.requireOwner }, async (req, reply) => {
    // Body may be { json: <backup> } or the backup object directly.
    const raw = (req.body as { json?: unknown })?.json ?? req.body;
    const data = parseOr400(importSchema, raw, reply);
    if (!data) return;

    const db = getDb();
    const tx = db.transaction(() => {
      db.exec('DELETE FROM days; DELETE FROM months; DELETE FROM goals; DELETE FROM rewards;');
      settingsRepo.update(db, data.settings);
      profileRepo.update(db, data.profile);
      for (const d of data.days as Backup['days']) {
        daysRepo.upsert(
          db,
          d.day,
          {
            work: d.work,
            wake: d.wake,
            move: d.move,
            food: d.food,
            mood: d.mood,
            screen_ok: d.screen_ok ?? (d as { scroll_slip?: boolean }).scroll_slip ?? false,
            blocks: d.blocks,
            survival_mode: d.survival_mode,
          },
          d.score_pct,
          new Date().toISOString()
        );
      }
      for (const m of data.months as Backup['months'])
        monthsRepo.upsert(db, m.month, m.budget ?? 0, m.savings, m.expenses);
      for (const g of data.goals as Backup['goals'])
        goalsRepo.create(db, { scope: g.scope, period: g.period ?? null, text: g.text, progress: g.progress });
      for (const r of data.rewards as Backup['rewards']) {
        const created = rewardsRepo.create(db, { emoji: r.emoji ?? null, label: r.label, threshold: r.threshold });
        if (r.unlocked) rewardsRepo.setUnlocked(db, created.id, r.unlocked_at ?? new Date().toISOString());
      }
    });
    tx();

    return buildBoard(db, todayInOwnerTz());
  });
}

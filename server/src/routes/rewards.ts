import type { FastifyInstance } from 'fastify';
import { rewardInputSchema } from '@lifeline/shared';
import { getDb } from '../db/connection.js';
import { todayInOwnerTz } from '../lib/clock.js';
import { rewardsRepo } from '../db/repositories.js';
import { buildBoard } from '../services/boardService.js';
import { parseOr400 } from '../lib/validate.js';

export default async function rewardsRoutes(app: FastifyInstance) {
  app.post('/api/rewards', { preHandler: app.requireOwner }, async (req, reply) => {
    const body = parseOr400(rewardInputSchema, req.body, reply);
    if (!body) return;
    const db = getDb();
    rewardsRepo.create(db, { emoji: body.emoji ?? null, label: body.label, threshold: body.threshold });
    return buildBoard(db, todayInOwnerTz());
  });

  app.put<{ Params: { id: string } }>(
    '/api/rewards/:id',
    { preHandler: app.requireOwner },
    async (req, reply) => {
      const body = parseOr400(rewardInputSchema, req.body, reply);
      if (!body) return;
      const db = getDb();
      const ok = rewardsRepo.update(db, Number(req.params.id), {
        emoji: body.emoji ?? null,
        label: body.label,
        threshold: body.threshold,
      });
      if (!ok) return reply.code(404).send({ error: 'reward not found' });
      return buildBoard(db, todayInOwnerTz());
    }
  );

  app.delete<{ Params: { id: string } }>(
    '/api/rewards/:id',
    { preHandler: app.requireOwner },
    async (req, reply) => {
      const db = getDb();
      const ok = rewardsRepo.remove(db, Number(req.params.id));
      if (!ok) return reply.code(404).send({ error: 'reward not found' });
      return buildBoard(db, todayInOwnerTz());
    }
  );
}

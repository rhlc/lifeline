import type { FastifyInstance } from 'fastify';
import { goalInputSchema } from '@lifeline/shared';
import { getDb } from '../db/connection.js';
import { todayInOwnerTz } from '../lib/clock.js';
import { goalsRepo } from '../db/repositories.js';
import { buildBoard } from '../services/boardService.js';
import { parseOr400 } from '../lib/validate.js';

export default async function goalsRoutes(app: FastifyInstance) {
  app.post('/api/goals', { preHandler: app.requireOwner }, async (req, reply) => {
    const body = parseOr400(goalInputSchema, req.body, reply);
    if (!body) return;
    const db = getDb();
    goalsRepo.create(db, { ...body, period: body.period ?? null });
    return buildBoard(db, todayInOwnerTz());
  });

  app.put<{ Params: { id: string } }>(
    '/api/goals/:id',
    { preHandler: app.requireOwner },
    async (req, reply) => {
      const body = parseOr400(goalInputSchema, req.body, reply);
      if (!body) return;
      const db = getDb();
      const ok = goalsRepo.update(db, Number(req.params.id), { ...body, period: body.period ?? null });
      if (!ok) return reply.code(404).send({ error: 'goal not found' });
      return buildBoard(db, todayInOwnerTz());
    }
  );

  app.delete<{ Params: { id: string } }>(
    '/api/goals/:id',
    { preHandler: app.requireOwner },
    async (req, reply) => {
      const db = getDb();
      const ok = goalsRepo.remove(db, Number(req.params.id));
      if (!ok) return reply.code(404).send({ error: 'goal not found' });
      return buildBoard(db, todayInOwnerTz());
    }
  );
}

import type { FastifyInstance } from 'fastify';
import { taskInputSchema } from '@lifeline/shared';
import { getDb } from '../db/connection.js';
import { todayInOwnerTz } from '../lib/clock.js';
import { tasksRepo } from '../db/repositories.js';
import { buildBoard } from '../services/boardService.js';
import { parseOr400 } from '../lib/validate.js';

export default async function tasksRoutes(app: FastifyInstance) {
  app.post('/api/tasks', { preHandler: app.requireOwner }, async (req, reply) => {
    const body = parseOr400(taskInputSchema, req.body, reply);
    if (!body) return;
    const db = getDb();
    tasksRepo.create(db, body);
    return buildBoard(db, todayInOwnerTz());
  });

  app.put<{ Params: { id: string } }>(
    '/api/tasks/:id',
    { preHandler: app.requireOwner },
    async (req, reply) => {
      const body = parseOr400(taskInputSchema, req.body, reply);
      if (!body) return;
      const db = getDb();
      const ok = tasksRepo.update(db, Number(req.params.id), body);
      if (!ok) return reply.code(404).send({ error: 'task not found' });
      return buildBoard(db, todayInOwnerTz());
    }
  );

  app.delete<{ Params: { id: string } }>(
    '/api/tasks/:id',
    { preHandler: app.requireOwner },
    async (req, reply) => {
      const db = getDb();
      const ok = tasksRepo.remove(db, Number(req.params.id));
      if (!ok) return reply.code(404).send({ error: 'task not found' });
      return buildBoard(db, todayInOwnerTz());
    }
  );
}

import type { FastifyInstance } from 'fastify';
import { monthParam, monthInputSchema } from '@lifeline/shared';
import { getDb } from '../db/connection.js';
import { todayInOwnerTz } from '../lib/clock.js';
import { monthsRepo } from '../db/repositories.js';
import { buildBoard } from '../services/boardService.js';
import { parseOr400 } from '../lib/validate.js';

/** Owner-only, PRIVATE — monthly money check-in. */
export default async function monthRoutes(app: FastifyInstance) {
  app.put<{ Params: { month: string } }>(
    '/api/month/:month',
    { preHandler: app.requireOwner },
    async (req, reply) => {
      const month = parseOr400(monthParam, req.params.month, reply);
      if (!month) return;
      const body = parseOr400(monthInputSchema, req.body, reply);
      if (!body) return;
      const db = getDb();
      monthsRepo.upsert(db, month, body.budget, body.savings, body.expenses);
      return buildBoard(db, todayInOwnerTz());
    }
  );
}

import type { FastifyInstance } from 'fastify';
import { dateParam, dayInputSchema } from '@lifeline/shared';
import { getDb } from '../db/connection.js';
import { todayInOwnerTz } from '../lib/clock.js';
import { saveDay } from '../services/boardService.js';
import { parseOr400 } from '../lib/validate.js';

/** Owner-only — upsert a day's taps; server recomputes everything. */
export default async function dayRoutes(app: FastifyInstance) {
  app.put<{ Params: { date: string } }>(
    '/api/day/:date',
    { preHandler: app.requireOwner },
    async (req, reply) => {
      const date = parseOr400(dateParam, req.params.date, reply);
      if (!date) return;
      const input = parseOr400(dayInputSchema, req.body, reply);
      if (!input) return;

      const db = getDb();
      const result = saveDay(db, date, input, todayInOwnerTz(), new Date().toISOString());
      return result;
    }
  );
}

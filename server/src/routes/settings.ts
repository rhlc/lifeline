import type { FastifyInstance } from 'fastify';
import { settingsInputSchema } from '@lifeline/shared';
import { getDb } from '../db/connection.js';
import { todayInOwnerTz } from '../lib/clock.js';
import { settingsRepo } from '../db/repositories.js';
import { buildBoard } from '../services/boardService.js';
import { parseOr400 } from '../lib/validate.js';

export default async function settingsRoutes(app: FastifyInstance) {
  app.put('/api/settings', { preHandler: app.requireOwner }, async (req, reply) => {
    const body = parseOr400(settingsInputSchema, req.body, reply);
    if (!body) return;
    const db = getDb();
    settingsRepo.update(db, body);
    return buildBoard(db, todayInOwnerTz());
  });
}

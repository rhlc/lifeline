import type { FastifyInstance } from 'fastify';
import { getDb } from '../db/connection.js';
import { todayInOwnerTz } from '../lib/clock.js';
import { buildBoard } from '../services/boardService.js';

/** Owner-only — full board including private money. */
export default async function boardRoutes(app: FastifyInstance) {
  app.get('/api/board', { preHandler: app.requireOwner }, async () => {
    const db = getDb();
    return buildBoard(db, todayInOwnerTz());
  });
}

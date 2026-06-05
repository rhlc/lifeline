import type { FastifyInstance } from 'fastify';
import { getDb } from '../db/connection.js';
import { todayInOwnerTz } from '../lib/clock.js';
import { buildBoard, toPublicBoard } from '../services/boardService.js';

/** Public, no auth — read-only board with all money stripped. */
export default async function publicRoutes(app: FastifyInstance) {
  app.get('/api/public/board', async () => {
    const db = getDb();
    const board = buildBoard(db, todayInOwnerTz());
    return toPublicBoard(board);
  });
}

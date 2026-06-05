import Fastify, { type FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import authPlugin from './plugins/auth.js';
import staticPlugin from './plugins/static.js';
import publicRoutes from './routes/public.js';
import authRoutes from './routes/auth.js';
import boardRoutes from './routes/board.js';
import dayRoutes from './routes/day.js';
import settingsRoutes from './routes/settings.js';
import monthRoutes from './routes/month.js';
import goalsRoutes from './routes/goals.js';
import rewardsRoutes from './routes/rewards.js';
import backupRoutes from './routes/backup.js';
import { isProd } from './env.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: isProd ? true : { transport: { target: 'pino-pretty' } },
    bodyLimit: 5 * 1024 * 1024, // 5MB — generous for JSON import
  });

  // Rate limiting is opt-in per route (only /api/login uses it).
  await app.register(rateLimit, { global: false });

  await app.register(authPlugin);

  app.get('/api/health', async () => ({ ok: true }));

  await app.register(publicRoutes);
  await app.register(authRoutes);
  await app.register(boardRoutes);
  await app.register(dayRoutes);
  await app.register(settingsRoutes);
  await app.register(monthRoutes);
  await app.register(goalsRoutes);
  await app.register(rewardsRoutes);
  await app.register(backupRoutes);

  // Static SPA + SPA fallback (no-op in dev if client/dist is absent).
  await app.register(staticPlugin);

  return app;
}

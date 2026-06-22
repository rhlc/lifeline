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
import tasksRoutes from './routes/tasks.js';
import backupRoutes from './routes/backup.js';
import { env, isProd } from './env.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: isProd ? true : { transport: { target: 'pino-pretty' } },
    bodyLimit: 5 * 1024 * 1024, // 5MB — generous for JSON import
  });

  // Rate limiting is opt-in per route (only /api/login uses it).
  await app.register(rateLimit, { global: false });

  await app.register(authPlugin);

  // Everything (API + SPA) is mounted under BASE_PATH when the app is hosted on
  // a sub-path (e.g. rahulc.xyz/ll). Empty ⇒ root, so behavior is unchanged.
  const prefix = env.BASE_PATH;

  app.get(`${prefix}/api/health`, async () => ({ ok: true }));

  await app.register(publicRoutes, { prefix });
  await app.register(authRoutes, { prefix });
  await app.register(boardRoutes, { prefix });
  await app.register(dayRoutes, { prefix });
  await app.register(settingsRoutes, { prefix });
  await app.register(monthRoutes, { prefix });
  await app.register(goalsRoutes, { prefix });
  await app.register(rewardsRoutes, { prefix });
  await app.register(tasksRoutes, { prefix });
  await app.register(backupRoutes, { prefix });

  // Static SPA + SPA fallback (no-op in dev if client/dist is absent).
  await app.register(staticPlugin);

  return app;
}

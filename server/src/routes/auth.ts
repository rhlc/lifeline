import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { loginSchema } from '@lifeline/shared';
import { env } from '../env.js';
import { parseOr400 } from '../lib/validate.js';
import { setSessionCookie, clearSessionCookie } from '../plugins/auth.js';

export default async function authRoutes(app: FastifyInstance) {
  app.post(
    '/api/login',
    {
      config: {
        rateLimit: { max: 10, timeWindow: '1 minute' },
      },
    },
    async (req, reply) => {
      const body = parseOr400(loginSchema, req.body, reply);
      if (!body) return;

      if (!env.OWNER_PASSWORD_HASH) {
        return reply.code(503).send({ error: 'owner password not configured' });
      }

      const ok = await bcrypt.compare(body.password, env.OWNER_PASSWORD_HASH);
      if (!ok) {
        return reply.code(401).send({ error: 'wrong password' });
      }

      setSessionCookie(reply);
      return { ok: true };
    }
  );

  app.post('/api/logout', async (_req, reply) => {
    clearSessionCookie(reply);
    return { ok: true };
  });
}

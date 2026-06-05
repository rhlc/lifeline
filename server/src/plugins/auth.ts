import fp from 'fastify-plugin';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { env, isProd } from '../env.js';

export const COOKIE_NAME = 'lifeline_session';

declare module 'fastify' {
  interface FastifyInstance {
    /** preHandler that 401s anyone without a valid owner session. */
    requireOwner: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    /** True when a valid owner session cookie is present. */
    isOwner: boolean;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { owner: true };
    user: { owner: true };
  }
}

/** Auth wiring: cookie parsing, JWT verification, requireOwner guard. */
export default fp(async (app) => {
  await app.register(cookie);
  await app.register(jwt, {
    secret: env.SESSION_SECRET,
    cookie: { cookieName: COOKIE_NAME, signed: false },
  });

  // Decorate every request with isOwner (best-effort verify, never throws).
  app.decorateRequest('isOwner', false);
  app.addHook('onRequest', async (req) => {
    try {
      await req.jwtVerify();
      req.isOwner = true;
    } catch {
      req.isOwner = false;
    }
  });

  app.decorate('requireOwner', async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.isOwner) {
      await reply.code(401).send({ error: 'owner session required' });
    }
  });
});

/** Issue the signed session cookie after a successful password check. */
export function setSessionCookie(reply: FastifyReply): void {
  const token = reply.server.jwt.sign({ owner: true }, { expiresIn: '30d' });
  reply.setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd ? env.COOKIE_SECURE : false,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie(reply: FastifyReply): void {
  reply.clearCookie(COOKIE_NAME, { path: '/' });
}

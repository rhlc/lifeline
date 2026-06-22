import fp from 'fastify-plugin';
import fastifyStatic from '@fastify/static';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../env.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * In production, serve the built React SPA from client/dist and fall back to
 * index.html for any non-API route (client-side routing). Single origin, so
 * the session cookie works without CORS.
 */
export default fp(async (app) => {
  // server/dist/plugins -> repo root is ../../.. ; client build is client/dist
  const clientDist = join(__dirname, '..', '..', '..', 'client', 'dist');
  if (!existsSync(clientDist)) {
    app.log.warn(`client build not found at ${clientDist} — run "npm run build". Serving API only.`);
    return;
  }

  // When mounted under a sub-path, assets live at e.g. /ll/assets/... and the
  // SPA fallback only applies under that prefix.
  const prefix = env.BASE_PATH;
  await app.register(fastifyStatic, { root: clientDist, wildcard: false, prefix: `${prefix}/` });

  app.setNotFoundHandler((req, reply) => {
    const path = req.url.split('?')[0];
    const underBase = prefix === '' || path === prefix || path.startsWith(`${prefix}/`);
    if (!underBase || path.startsWith(`${prefix}/api/`)) {
      return reply.code(404).send({ error: 'not found' });
    }
    return reply.sendFile('index.html');
  });
});

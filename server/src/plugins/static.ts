import fp from 'fastify-plugin';
import fastifyStatic from '@fastify/static';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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

  await app.register(fastifyStatic, { root: clientDist, wildcard: false });

  app.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith('/api/')) {
      return reply.code(404).send({ error: 'not found' });
    }
    return reply.sendFile('index.html');
  });
});

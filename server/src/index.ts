import { getDb } from './db/connection.js';
import { migrate } from './db/migrate.js';
import { seed } from './db/seed.js';
import { buildApp } from './app.js';
import { env } from './env.js';

async function main() {
  const db = getDb();
  migrate(db);
  seed(db);

  const app = await buildApp();
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
}

main().catch((err) => {
  console.error('Failed to start LIFELINE server:', err);
  process.exit(1);
});

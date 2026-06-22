import { config as loadEnv } from 'dotenv';
import { dirname, join, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

// Repo root = two levels up from this file (server/src or server/dist).
// Anchor the .env and the SQLite path here so it works no matter what cwd the
// process is launched from (`npm run dev` runs with cwd=server/, `npm start`
// from the repo root).
export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
loadEnv({ path: join(repoRoot, '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().default(3000),
  DATABASE_PATH: z.string().default('./data/lifeline.db'),
  OWNER_PASSWORD_HASH: z.string().default(''),
  SESSION_SECRET: z.string().default('dev-insecure-secret-change-me'),
  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  OWNER_TZ: z.string().default('Asia/Kolkata'),
  // Sub-path the app is mounted under (e.g. "/ll" for rahulc.xyz/ll). Empty ⇒
  // served at the domain root. Normalized to "" or "/slug" (no trailing slash).
  BASE_PATH: z
    .string()
    .default('')
    .transform((v) => {
      const slug = v.replace(/^\/+|\/+$/g, '');
      return slug ? `/${slug}` : '';
    }),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

// Anchor a relative DB path to the repo root so dev (cwd=server/) and prod
// (cwd=root) share the same database file.
if (env.DATABASE_PATH !== ':memory:' && !isAbsolute(env.DATABASE_PATH)) {
  env.DATABASE_PATH = join(repoRoot, env.DATABASE_PATH);
}

export const isProd = env.NODE_ENV === 'production';

if (isProd && !env.OWNER_PASSWORD_HASH) {
  console.warn(
    '[lifeline] WARNING: OWNER_PASSWORD_HASH is empty — owner login will be impossible. Run `npm run hash -- <password>`.'
  );
}
if (isProd && env.SESSION_SECRET === 'dev-insecure-secret-change-me') {
  console.warn('[lifeline] WARNING: SESSION_SECRET is the insecure default. Set a real secret.');
}

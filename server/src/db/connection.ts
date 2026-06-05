import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { env } from '../env.js';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  // Ensure the directory for the db file exists.
  if (env.DATABASE_PATH !== ':memory:') {
    mkdirSync(dirname(env.DATABASE_PATH), { recursive: true });
  }

  db = new Database(env.DATABASE_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  return db;
}

/** Test helper: open an in-memory db. */
export function openMemoryDb(): Database.Database {
  const mem = new Database(':memory:');
  mem.pragma('foreign_keys = ON');
  return mem;
}

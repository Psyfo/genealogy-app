import { write } from './driver';

/**
 * Database constraints & indexes. Idempotent — safe to run on every boot/seed.
 * The graph is the single source of truth for relationships, so we only need a
 * uniqueness guarantee on person ids plus a couple of lookup indexes.
 */
const SCHEMA_STATEMENTS = [
  'CREATE CONSTRAINT person_id IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE',
  'CREATE INDEX person_family_name IF NOT EXISTS FOR (p:Person) ON (p.familyName)',
  'CREATE INDEX person_given_name IF NOT EXISTS FOR (p:Person) ON (p.givenName)',
] as const;

export async function ensureSchema(): Promise<void> {
  for (const statement of SCHEMA_STATEMENTS) {
    await write(statement);
  }
}

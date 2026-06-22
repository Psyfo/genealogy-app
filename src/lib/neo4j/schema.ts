import { write } from './driver';

/**
 * Database constraints & indexes. Idempotent — safe to run on every boot/seed.
 * The graph is the single source of truth for relationships, so we only need a
 * uniqueness guarantee on person ids plus a couple of lookup indexes.
 */
const SCHEMA_STATEMENTS = [
  'CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE',
  'CREATE CONSTRAINT user_email IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE',
  'CREATE CONSTRAINT person_id IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE',
  'CREATE INDEX person_owner IF NOT EXISTS FOR (p:Person) ON (p.ownerId)',
  'CREATE INDEX person_family_name IF NOT EXISTS FOR (p:Person) ON (p.familyName)',
  'CREATE INDEX person_given_name IF NOT EXISTS FOR (p:Person) ON (p.givenName)',
] as const;

export async function ensureSchema(): Promise<void> {
  for (const statement of SCHEMA_STATEMENTS) {
    await write(statement);
  }
}

import neo4j, { type Driver, type QueryResult } from 'neo4j-driver';

/**
 * Lazy, HMR-safe singleton Neo4j driver.
 *
 * The driver is created on first use (never at import time) so that the app can
 * build and type-check without a database, and so missing env only fails the
 * request that actually needs the DB — not the whole process. We stash it on
 * `globalThis` to survive Next.js dev hot-reloads, which would otherwise leak a
 * new pooled driver on every edit.
 */
type Neo4jGlobal = typeof globalThis & { __mahlanguDriver?: Driver };

const globalForNeo4j = globalThis as Neo4jGlobal;

function readEnv(): { uri: string; user: string; password: string } {
  const uri = process.env.NEO4J_URI;
  const user = process.env.NEO4J_USER;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !user || !password) {
    throw new Error(
      'Neo4j is not configured. Set NEO4J_URI, NEO4J_USER and NEO4J_PASSWORD (see .env.example).',
    );
  }

  return { uri, user, password };
}

export function getDriver(): Driver {
  if (!globalForNeo4j.__mahlanguDriver) {
    const { uri, user, password } = readEnv();
    globalForNeo4j.__mahlanguDriver = neo4j.driver(
      uri,
      neo4j.auth.basic(user, password),
      {
        // Birth years, counts, etc. are small — return plain JS numbers rather
        // than the lossless Integer wrapper so callers never have to unwrap.
        disableLosslessIntegers: true,
        connectionAcquisitionTimeout: 10_000,
      },
    );
  }
  return globalForNeo4j.__mahlanguDriver;
}

function database(): string {
  return process.env.NEO4J_DATABASE ?? 'neo4j';
}

/**
 * Recursively convert Neo4j result values into plain JSON-friendly shapes:
 * Nodes/Relationships collapse to their `.properties`, arrays and maps recurse.
 */
function plain(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return value.map(plain);
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if ('properties' in record && record.properties) {
      return plain(record.properties);
    }
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(record)) out[key] = plain(val);
    return out;
  }
  return value;
}

function rows<T>(result: QueryResult): T[] {
  return result.records.map((record) => {
    const obj: Record<string, unknown> = {};
    for (const key of record.keys) {
      if (typeof key === 'string') obj[key] = plain(record.get(key));
    }
    return obj as T;
  });
}

/** Run a read query in a managed read transaction. */
export async function read<T>(
  cypher: string,
  params: Record<string, unknown> = {},
): Promise<T[]> {
  const session = getDriver().session({
    database: database(),
    defaultAccessMode: neo4j.session.READ,
  });
  try {
    const result = await session.executeRead((tx) => tx.run(cypher, params));
    return rows<T>(result);
  } finally {
    await session.close();
  }
}

/** Run a write query in a managed write transaction. */
export async function write<T>(
  cypher: string,
  params: Record<string, unknown> = {},
): Promise<T[]> {
  const session = getDriver().session({
    database: database(),
    defaultAccessMode: neo4j.session.WRITE,
  });
  try {
    const result = await session.executeWrite((tx) => tx.run(cypher, params));
    return rows<T>(result);
  } finally {
    await session.close();
  }
}

/** Run several write statements in a single atomic transaction. */
export async function writeBatch(
  statements: ReadonlyArray<{ cypher: string; params?: Record<string, unknown> }>,
): Promise<void> {
  const session = getDriver().session({
    database: database(),
    defaultAccessMode: neo4j.session.WRITE,
  });
  try {
    await session.executeWrite(async (tx) => {
      for (const { cypher, params } of statements) {
        await tx.run(cypher, params ?? {});
      }
    });
  } finally {
    await session.close();
  }
}

export async function verifyConnection(): Promise<void> {
  await getDriver().verifyConnectivity({ database: database() });
}

export async function closeDriver(): Promise<void> {
  if (globalForNeo4j.__mahlanguDriver) {
    await globalForNeo4j.__mahlanguDriver.close();
    globalForNeo4j.__mahlanguDriver = undefined;
  }
}

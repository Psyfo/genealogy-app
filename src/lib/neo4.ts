import neo4j from 'neo4j-driver';

if (
  !process.env.NEO4J_URI ||
  !process.env.NEO4J_USER ||
  !process.env.NEO4J_PASSWORD
) {
  throw new Error('Missing Neo4j environment variables');
}

export const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// Confirm connection on startup
async function confirmConnection() {
  const session = driver.session();
  try {
    await session.run('RETURN 1');
    console.log('[Neo4j] Successfully connected to the database.');
  } catch (err) {
    console.error('[Neo4j] Connection failed:', err);
  } finally {
    await session.close();
  }
}

confirmConnection();

export async function runQuery<T>(
  query: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const session = driver.session();
  try {
    const result = await session.run(query, params);
    return result.records.map((record) => {
      const obj: Record<string, unknown> = {};
      record.keys.forEach((key) => {
        // Only use string keys
        if (typeof key === 'string') {
          const value = record.get(key);
          obj[key] = neo4j.isInt(value) ? value.toNumber() : value;
        }
      });
      return obj as T;
    });
  } finally {
    await session.close();
  }
}

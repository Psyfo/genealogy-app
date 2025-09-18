import dotenv from 'dotenv';
import neo4j, { Driver } from 'neo4j-driver';
import { v4 as uuidv4 } from 'uuid';
import { Person, LifeEvent } from '@/types/person';

dotenv.config({ path: '.env.local' }); // load .env.local explicitly

function env(candidates: string[]): string {
  for (const name of candidates) {
    const v = process.env[name];
    if (v) return v;
  }
  throw new Error(`Missing required env var (tried: ${candidates.join(', ')})`);
}

const uri = env(['NEO4J_URI']);
const user = env(['NEO4J_USERNAME', 'NEO4J_USER']); // support both names
const password = env(['NEO4J_PASSWORD']);

const driver: Driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
  // Uncomment if you need to disable encryption locally:
  // encrypted: 'ENCRYPTION_OFF',
});

async function seed() {
  const start = Date.now();
  console.log('[seed] Connecting to Neo4j:', uri);
  await driver.getServerInfo();
  console.log('[seed] Connected in %dms', Date.now() - start);

  const session = driver.session({ defaultAccessMode: neo4j.session.WRITE });

  try {
    console.log('[seed] Clearing existing graph...');
    await session.run('MATCH (n) DETACH DELETE n');

    const people = [
      { id: 'p1', name: 'John Smith', birthYear: 1945, gender: 'M' },
      { id: 'p2', name: 'Mary Smith', birthYear: 1947, gender: 'F' },
      { id: 'p3', name: 'Robert Smith', birthYear: 1970, gender: 'M' },
      { id: 'p4', name: 'Linda Johnson', birthYear: 1972, gender: 'F' },
      { id: 'p5', name: 'Michael Smith', birthYear: 1995, gender: 'M' },
      { id: 'p6', name: 'Emily Smith', birthYear: 1998, gender: 'F' },
      { id: 'p7', name: 'Sarah Johnson', birthYear: 2000, gender: 'F' },
      { id: 'p8', name: 'James Johnson', birthYear: 2003, gender: 'M' },
      { id: 'p9', name: 'Patricia Williams', birthYear: 1950, gender: 'F' },
      { id: 'p10', name: 'David Williams', birthYear: 1975, gender: 'M' },
      { id: 'p11', name: 'Olivia Williams', birthYear: 2005, gender: 'F' },
      { id: 'p12', name: 'Daniel Williams', birthYear: 2008, gender: 'M' },
      { id: 'p13', name: 'Sophia Miller', birthYear: 1980, gender: 'F' },
      { id: 'p14', name: 'William Miller', birthYear: 1982, gender: 'M' },
      { id: 'p15', name: 'Lucas Miller', birthYear: 2010, gender: 'M' },
      { id: 'p16', name: 'Mia Miller', birthYear: 2012, gender: 'F' },
    ] as const;

    console.log('[seed] Creating %d people...', people.length);
    await session.executeWrite(async (tx) => {
      for (const person of people) {
        await tx.run(
          `
          CREATE (:Person {
            id: $id,
            name: $name,
            birthYear: $birthYear,
            gender: $gender
          })
          `,
          person as Record<string, unknown>
        );
      }
    });

    type Rel = { from: string; to: string; type: 'MARRIED' | 'PARENT' };
    const relationships: Rel[] = [
      { from: 'John Smith', to: 'Mary Smith', type: 'MARRIED' },
      { from: 'John Smith', to: 'Robert Smith', type: 'PARENT' },
      { from: 'Mary Smith', to: 'Robert Smith', type: 'PARENT' },
      { from: 'Robert Smith', to: 'Linda Johnson', type: 'MARRIED' },
      { from: 'Robert Smith', to: 'Michael Smith', type: 'PARENT' },
      { from: 'Linda Johnson', to: 'Michael Smith', type: 'PARENT' },
      { from: 'Robert Smith', to: 'Emily Smith', type: 'PARENT' },
      { from: 'Linda Johnson', to: 'Emily Smith', type: 'PARENT' },
      { from: 'Patricia Williams', to: 'David Williams', type: 'PARENT' },
      { from: 'David Williams', to: 'Olivia Williams', type: 'PARENT' },
      { from: 'David Williams', to: 'Daniel Williams', type: 'PARENT' },
      { from: 'Sophia Miller', to: 'Lucas Miller', type: 'PARENT' },
      { from: 'William Miller', to: 'Lucas Miller', type: 'PARENT' },
      { from: 'Sophia Miller', to: 'Mia Miller', type: 'PARENT' },
      { from: 'William Miller', to: 'Mia Miller', type: 'PARENT' },
      { from: 'Michael Smith', to: 'Olivia Williams', type: 'MARRIED' },
    ];

    console.log('[seed] Creating %d relationships...', relationships.length);
    await session.executeWrite(async (tx) => {
      for (const rel of relationships) {
        const cypher =
          rel.type === 'MARRIED'
            ? `
              MATCH (a:Person {name: $from}), (b:Person {name: $to})
              MERGE (a)-[:MARRIED_TO]->(b)
              MERGE (b)-[:MARRIED_TO]->(a)
            `
            : `
              MATCH (a:Person {name: $from}), (b:Person {name: $to})
              MERGE (a)-[:PARENT_OF]->(b)
            `;
        const res = await tx.run(cypher, { from: rel.from, to: rel.to });
        if (res.summary.counters.updates().relationshipsCreated === 0) {
          console.warn('[seed] Relationship not created (names missing?)', rel);
        }
      }
    });

    console.log('✅ Seed data created successfully.');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await session.close();
    await driver.close();
    console.log('[seed] Closed session & driver.');
  }
}

seed().catch((e) => {
  console.error('[seed] Unhandled error:', e);
  process.exit(1);
});

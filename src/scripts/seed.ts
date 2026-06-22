import { config } from 'dotenv';

config({ path: '.env.local' });

import { write, closeDriver } from '../lib/neo4j/driver';
import { ensureSchema } from '../lib/neo4j/schema';
import { createUser } from '../lib/users';
import { hashPassword } from '../lib/auth/password';
import { createPerson } from '../lib/people';
import { addRelationship } from '../lib/relationships';
import type { PersonInput } from '../lib/validation';

/**
 * Seeds a demo account with an illustrative four-generation sample family so a
 * fresh install has something to explore. Sign in with the credentials printed
 * at the end. Everything is scoped to the demo user's id.
 */

const DEMO = {
  name: 'Demo',
  email: 'demo@kindred.app',
  password: 'demo12345',
};

type SeedPerson = PersonInput & {
  slug: string;
  father?: string;
  mother?: string;
  spouse?: string;
};

const FAMILY: SeedPerson[] = [
  // ── Generation I ────────────────────────────────────────────────────────────
  {
    slug: 'arthur',
    givenName: 'Arthur',
    familyName: 'Hart',
    gender: 'male',
    birthDate: '1912-03-09',
    birthPlace: 'London, England',
    deathDate: '1989-07-22',
    deathPlace: 'London, England',
    occupation: 'Clockmaker',
    motto: 'Hold fast.',
    bio: 'Kept a small clock shop near the river for fifty years and could mend anything with gears.',
    spouse: 'eleanor',
  },
  {
    slug: 'eleanor',
    givenName: 'Eleanor',
    familyName: 'Hart',
    maidenName: 'Brooke',
    gender: 'female',
    birthDate: '1915-11-30',
    birthPlace: 'Bristol, England',
    deathDate: '1998-02-14',
    deathPlace: 'London, England',
    occupation: 'Schoolteacher',
  },

  // ── Generation II ───────────────────────────────────────────────────────────
  {
    slug: 'george',
    givenName: 'George',
    familyName: 'Hart',
    gender: 'male',
    birthDate: '1938-05-18',
    birthPlace: 'London, England',
    deathDate: '2010-09-03',
    deathPlace: 'Toronto, Canada',
    occupation: 'Civil engineer',
    bio: 'Emigrated to Canada in 1962 and built bridges across three provinces.',
    father: 'arthur',
    mother: 'eleanor',
    spouse: 'dorothy',
  },
  {
    slug: 'dorothy',
    givenName: 'Dorothy',
    familyName: 'Hart',
    maidenName: 'Hayes',
    gender: 'female',
    birthDate: '1941-01-27',
    birthPlace: 'Manchester, England',
    occupation: 'Nurse',
  },
  {
    slug: 'margaret',
    givenName: 'Margaret',
    familyName: 'Bishop',
    maidenName: 'Hart',
    gender: 'female',
    birthDate: '1942-08-12',
    birthPlace: 'London, England',
    occupation: 'Librarian',
    father: 'arthur',
    mother: 'eleanor',
    spouse: 'henry',
  },
  {
    slug: 'henry',
    givenName: 'Henry',
    familyName: 'Bishop',
    gender: 'male',
    birthDate: '1939-04-02',
    birthPlace: 'Leeds, England',
    deathDate: '2008-12-19',
    deathPlace: 'Leeds, England',
    occupation: 'Architect',
  },

  // ── Generation III ──────────────────────────────────────────────────────────
  {
    slug: 'susan',
    givenName: 'Susan',
    familyName: 'Hart',
    gender: 'female',
    birthDate: '1966-06-04',
    birthPlace: 'Toronto, Canada',
    occupation: 'Physician',
    father: 'george',
    mother: 'dorothy',
    spouse: 'david',
  },
  {
    slug: 'david',
    givenName: 'David',
    familyName: 'Reyes',
    gender: 'male',
    birthDate: '1964-10-21',
    birthPlace: 'Lisbon, Portugal',
    occupation: 'Chef',
  },
  {
    slug: 'michael',
    givenName: 'Michael',
    familyName: 'Hart',
    gender: 'male',
    birthDate: '1969-02-15',
    birthPlace: 'Toronto, Canada',
    occupation: 'Software engineer',
    father: 'george',
    mother: 'dorothy',
    spouse: 'anna',
  },
  {
    slug: 'anna',
    givenName: 'Anna',
    familyName: 'Hart',
    maidenName: 'Kowalski',
    gender: 'female',
    birthDate: '1972-07-09',
    birthPlace: 'Kraków, Poland',
    occupation: 'Architect',
  },
  {
    slug: 'thomas',
    givenName: 'Thomas',
    familyName: 'Bishop',
    gender: 'male',
    birthDate: '1968-03-30',
    birthPlace: 'Leeds, England',
    occupation: 'Journalist',
    father: 'henry',
    mother: 'margaret',
  },

  // ── Generation IV ───────────────────────────────────────────────────────────
  {
    slug: 'olivia',
    givenName: 'Olivia',
    familyName: 'Hart',
    gender: 'female',
    birthDate: '1996-09-12',
    birthPlace: 'Sydney, Australia',
    occupation: 'Marine biologist',
    father: 'michael',
    mother: 'anna',
  },
  {
    slug: 'daniel',
    givenName: 'Daniel',
    familyName: 'Hart',
    gender: 'male',
    birthDate: '1999-12-01',
    birthPlace: 'Sydney, Australia',
    occupation: 'Student',
    father: 'michael',
    mother: 'anna',
  },
  {
    slug: 'sofia',
    givenName: 'Sofia',
    familyName: 'Reyes',
    gender: 'female',
    birthDate: '1998-04-25',
    birthPlace: 'Chicago, USA',
    occupation: 'Designer',
    father: 'david',
    mother: 'susan',
  },
];

async function main(): Promise<void> {
  console.log('[seed] applying schema…');
  await ensureSchema();

  console.log('[seed] clearing existing data…');
  await write('MATCH (n) DETACH DELETE n');

  console.log(`[seed] creating demo account ${DEMO.email}…`);
  const user = await createUser({
    name: DEMO.name,
    email: DEMO.email,
    passwordHash: await hashPassword(DEMO.password),
  });
  const ownerId = user.id;

  console.log(`[seed] creating ${FAMILY.length} people…`);
  const ids = new Map<string, string>();
  for (const { slug, father, mother, spouse, ...input } of FAMILY) {
    const person = await createPerson(ownerId, input);
    ids.set(slug, person.id);
  }

  const id = (slug: string): string => {
    const value = ids.get(slug);
    if (!value) throw new Error(`Unknown seed slug: ${slug}`);
    return value;
  };

  let parentEdges = 0;
  let marriageEdges = 0;
  for (const person of FAMILY) {
    if (person.father) {
      await addRelationship(ownerId, {
        kind: 'parent',
        parentId: id(person.father),
        childId: id(person.slug),
        role: 'father',
      });
      parentEdges += 1;
    }
    if (person.mother) {
      await addRelationship(ownerId, {
        kind: 'parent',
        parentId: id(person.mother),
        childId: id(person.slug),
        role: 'mother',
      });
      parentEdges += 1;
    }
    if (person.spouse) {
      await addRelationship(ownerId, {
        kind: 'marriage',
        aId: id(person.slug),
        bId: id(person.spouse),
        status: 'married',
      });
      marriageEdges += 1;
    }
  }

  console.log(
    `[seed] done — ${FAMILY.length} people, ${parentEdges} parent links, ${marriageEdges} marriages.`,
  );
  console.log(`[seed] sign in:  ${DEMO.email}  /  ${DEMO.password}`);
}

main()
  .catch((error) => {
    console.error('[seed] failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(closeDriver);

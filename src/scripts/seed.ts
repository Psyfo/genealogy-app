import { config } from 'dotenv';

config({ path: '.env.local' });

import { write, closeDriver } from '../lib/neo4j/driver';
import { ensureSchema } from '../lib/neo4j/schema';
import { createPerson } from '../lib/people';
import { addRelationship } from '../lib/relationships';
import type { PersonInput } from '../lib/validation';

/**
 * Illustrative sample family — four generations of a fictional Mahlangu lineage
 * rooted in KwaNdebele and Pretoria. Names, dates and stories are invented to
 * demonstrate the app; replace them with your own records. Each person is keyed
 * by a slug so relationships can reference them before ids exist.
 */

type SeedPerson = PersonInput & {
  slug: string;
  father?: string;
  mother?: string;
  /** Slug of a spouse; the marriage edge is created once, from the lower slug. */
  spouse?: string;
};

const FAMILY: SeedPerson[] = [
  // ── Generation I — the elders ──────────────────────────────────────────────
  {
    slug: 'ndlovu',
    givenName: 'Ndlovu',
    familyName: 'Mahlangu',
    gender: 'male',
    birthDate: '1908-04-02',
    birthPlace: 'Pretoria, Transvaal',
    deathDate: '1979-11-20',
    deathPlace: 'KwaNdebele',
    occupation: 'Farmer & community elder',
    clanPraise: 'Mahlangu, Mnguni, Ndzundza kaMabhoko, Mhlanga onte ngokuvuthwa!',
    bio: 'Patriarch of the line. Kept cattle on the highveld and presided over the family kraal through the hardest years of removals and resettlement.',
    spouse: 'nomvula',
  },
  {
    slug: 'nomvula',
    givenName: 'Nomvula',
    familyName: 'Mahlangu',
    maidenName: 'Skosana',
    gender: 'female',
    birthDate: '1912-07-15',
    birthPlace: 'Wallmansthal',
    deathDate: '1990-02-08',
    deathPlace: 'KwaNdebele',
    occupation: 'Beadwork & mural artist',
    bio: 'Matriarch and keeper of the painted homestead. Taught a generation of daughters the geometry of the wall and the bead.',
  },

  // ── Generation II — their children & spouses ────────────────────────────────
  {
    slug: 'mabhoko',
    givenName: 'Mabhoko',
    familyName: 'Mahlangu',
    gender: 'male',
    birthDate: '1934-09-12',
    birthPlace: 'KwaNdebele',
    deathDate: '2011-05-03',
    deathPlace: 'Pretoria',
    occupation: 'Schoolteacher',
    bio: 'Eldest son. Taught isiNdebele and history for four decades.',
    father: 'ndlovu',
    mother: 'nomvula',
    spouse: 'thandiwe',
  },
  {
    slug: 'thandiwe',
    givenName: 'Thandiwe',
    familyName: 'Mahlangu',
    maidenName: 'Mtsweni',
    gender: 'female',
    birthDate: '1939-03-21',
    birthPlace: 'Siyabuswa',
    deathDate: '2018-08-14',
    deathPlace: 'Pretoria',
    occupation: 'Seamstress',
  },
  {
    slug: 'lindiwe',
    givenName: 'Lindiwe',
    familyName: 'Mahlangu',
    gender: 'female',
    birthDate: '1938-12-01',
    birthPlace: 'KwaNdebele',
    occupation: 'Mural artist',
    bio: 'Carried her mother’s wall-painting tradition onto gallery walls abroad.',
    father: 'ndlovu',
    mother: 'nomvula',
    spouse: 'jabulani',
  },
  {
    slug: 'jabulani',
    givenName: 'Jabulani',
    familyName: 'Nkosi',
    gender: 'male',
    birthDate: '1936-06-18',
    birthPlace: 'Middelburg',
    deathDate: '2009-01-30',
    deathPlace: 'Middelburg',
    occupation: 'Mine foreman',
  },
  {
    slug: 'petros',
    givenName: 'Petros',
    familyName: 'Mahlangu',
    gender: 'male',
    birthDate: '1942-02-27',
    birthPlace: 'KwaNdebele',
    deathDate: '2004-10-11',
    deathPlace: 'Johannesburg',
    occupation: 'Railway worker',
    father: 'ndlovu',
    mother: 'nomvula',
    spouse: 'joyce',
  },
  {
    slug: 'joyce',
    givenName: 'Joyce',
    familyName: 'Mahlangu',
    maidenName: 'Masango',
    gender: 'female',
    birthDate: '1946-11-09',
    birthPlace: 'Pretoria',
    occupation: 'Nurse',
  },

  // ── Generation III — grandchildren & spouses ────────────────────────────────
  {
    slug: 'thembi',
    givenName: 'Thembi',
    familyName: 'Mahlangu',
    gender: 'female',
    birthDate: '1961-04-05',
    birthPlace: 'Pretoria',
    occupation: 'Matron',
    father: 'mabhoko',
    mother: 'thandiwe',
    spouse: 'mandla',
  },
  {
    slug: 'mandla',
    givenName: 'Mandla',
    familyName: 'Sithole',
    gender: 'male',
    birthDate: '1959-07-22',
    birthPlace: 'Soweto',
    occupation: 'Civil engineer',
  },
  {
    slug: 'bheki',
    givenName: 'Bheki',
    familyName: 'Mahlangu',
    gender: 'male',
    birthDate: '1964-10-30',
    birthPlace: 'Pretoria',
    occupation: 'Electrical engineer',
    father: 'mabhoko',
    mother: 'thandiwe',
    spouse: 'gugu',
  },
  {
    slug: 'gugu',
    givenName: 'Gugu',
    familyName: 'Mahlangu',
    maidenName: 'Dlamini',
    gender: 'female',
    birthDate: '1966-01-17',
    birthPlace: 'Durban',
    occupation: 'Pharmacist',
  },
  {
    slug: 'nomsa',
    givenName: 'Nomsa',
    familyName: 'Nkosi',
    gender: 'female',
    birthDate: '1966-05-14',
    birthPlace: 'Middelburg',
    occupation: 'Attorney',
    father: 'jabulani',
    mother: 'lindiwe',
  },
  {
    slug: 'vusi',
    givenName: 'Vusi',
    familyName: 'Mahlangu',
    gender: 'male',
    birthDate: '1969-08-08',
    birthPlace: 'Johannesburg',
    occupation: 'Accountant',
    father: 'petros',
    mother: 'joyce',
    spouse: 'lerato',
  },
  {
    slug: 'lerato',
    givenName: 'Lerato',
    familyName: 'Mahlangu',
    maidenName: 'Mokoena',
    gender: 'female',
    birthDate: '1974-03-19',
    birthPlace: 'Bloemfontein',
    occupation: 'General practitioner',
  },
  {
    slug: 'zanele',
    givenName: 'Zanele',
    familyName: 'Mahlangu',
    gender: 'female',
    birthDate: '1972-12-25',
    birthPlace: 'Johannesburg',
    occupation: 'Journalist',
    father: 'petros',
    mother: 'joyce',
  },

  // ── Generation IV — the present ─────────────────────────────────────────────
  {
    slug: 'sipho',
    givenName: 'Sipho',
    familyName: 'Mahlangu',
    gender: 'male',
    birthDate: '1990-06-11',
    birthPlace: 'Pretoria',
    occupation: 'Software developer',
    bio: 'Building this record so the family’s names outlive memory.',
    father: 'bheki',
    mother: 'gugu',
  },
  {
    slug: 'ayanda',
    givenName: 'Ayanda',
    familyName: 'Mahlangu',
    gender: 'female',
    birthDate: '1993-09-02',
    birthPlace: 'Pretoria',
    occupation: 'Architect',
    father: 'bheki',
    mother: 'gugu',
  },
  {
    slug: 'karabo',
    givenName: 'Karabo',
    familyName: 'Sithole',
    gender: 'female',
    birthDate: '1995-02-28',
    birthPlace: 'Pretoria',
    occupation: 'Data scientist',
    father: 'mandla',
    mother: 'thembi',
  },
  {
    slug: 'nkosinathi',
    givenName: 'Nkosinathi',
    familyName: 'Mahlangu',
    gender: 'male',
    birthDate: '1996-07-07',
    birthPlace: 'Johannesburg',
    occupation: 'Teacher',
    father: 'vusi',
    mother: 'lerato',
  },
  {
    slug: 'thandeka',
    givenName: 'Thandeka',
    familyName: 'Mahlangu',
    gender: 'female',
    birthDate: '1998-11-23',
    birthPlace: 'Johannesburg',
    occupation: 'University student',
    father: 'vusi',
    mother: 'lerato',
  },
];

async function main(): Promise<void> {
  console.log('[seed] applying schema…');
  await ensureSchema();

  console.log('[seed] clearing existing graph…');
  await write('MATCH (n) DETACH DELETE n');

  console.log(`[seed] creating ${FAMILY.length} people…`);
  const ids = new Map<string, string>();
  for (const { slug, father, mother, spouse, ...input } of FAMILY) {
    const person = await createPerson(input);
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
      await addRelationship({
        kind: 'parent',
        parentId: id(person.father),
        childId: id(person.slug),
        role: 'father',
      });
      parentEdges += 1;
    }
    if (person.mother) {
      await addRelationship({
        kind: 'parent',
        parentId: id(person.mother),
        childId: id(person.slug),
        role: 'mother',
      });
      parentEdges += 1;
    }
    // Create each marriage once, from the partner that declares `spouse`.
    if (person.spouse) {
      await addRelationship({
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
}

main()
  .catch((error) => {
    console.error('[seed] failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(closeDriver);

import { read, write } from './neo4j/driver';
import {
  personInputSchema,
  personUpdateSchema,
  personSchema,
  type Person,
  type PersonInput,
  type PersonUpdate,
} from './validation';

/** Map projection returning every stored property of a :Person node. */
const PROJECTION = 'p { .* } AS person';

type PersonRow = { person: Record<string, unknown> };

function toPerson(row: PersonRow): Person {
  // The DB is a trusted boundary, but parsing keeps the type honest and strips
  // any drift between the stored shape and the schema.
  return personSchema.parse(row.person);
}

/** Drop undefined values — Neo4j rejects undefined and we never store nulls. */
function defined(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  );
}

export async function listPeople(search?: string): Promise<Person[]> {
  const term = search?.trim().toLowerCase();
  const rows = await read<PersonRow>(
    `MATCH (p:Person)
     ${term ? `WHERE toLower(p.givenName) CONTAINS $term
                  OR toLower(p.familyName) CONTAINS $term
                  OR toLower(coalesce(p.otherNames, '')) CONTAINS $term
                  OR toLower(coalesce(p.maidenName, '')) CONTAINS $term` : ''}
     RETURN ${PROJECTION}
     ORDER BY p.familyName, p.givenName`,
    term ? { term } : {},
  );
  return rows.map(toPerson);
}

export async function getPerson(id: string): Promise<Person | null> {
  const rows = await read<PersonRow>(
    `MATCH (p:Person { id: $id }) RETURN ${PROJECTION}`,
    { id },
  );
  return rows.length ? toPerson(rows[0]) : null;
}

export async function createPerson(input: PersonInput): Promise<Person> {
  const data = personInputSchema.parse(input);
  const now = new Date().toISOString();
  const props = defined({
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  });

  const rows = await write<PersonRow>(
    `CREATE (p:Person) SET p = $props RETURN ${PROJECTION}`,
    { props },
  );
  return toPerson(rows[0]);
}

export async function updatePerson(
  id: string,
  patch: PersonUpdate,
): Promise<Person | null> {
  const data = personUpdateSchema.parse(patch);
  const props = defined({ ...data, updatedAt: new Date().toISOString() });

  const rows = await write<PersonRow>(
    `MATCH (p:Person { id: $id })
     SET p += $props
     RETURN ${PROJECTION}`,
    { id, props },
  );
  return rows.length ? toPerson(rows[0]) : null;
}

export async function deletePerson(id: string): Promise<boolean> {
  const rows = await write<{ deleted: number }>(
    `MATCH (p:Person { id: $id })
     WITH p, count(p) AS c
     DETACH DELETE p
     RETURN c AS deleted`,
    { id },
  );
  return (rows[0]?.deleted ?? 0) > 0;
}

export async function countPeople(): Promise<number> {
  const rows = await read<{ total: number }>(
    'MATCH (p:Person) RETURN count(p) AS total',
  );
  return rows[0]?.total ?? 0;
}

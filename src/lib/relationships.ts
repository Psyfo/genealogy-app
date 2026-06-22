import { read, write } from './neo4j/driver';
import { relationshipInputSchema, personSchema, type RelationshipInput } from './validation';
import type { Person } from './validation';
import type { MarriageStatus, Relatives, SpouseLink } from '@/types/person';

const PROJECTION = 'rel { .* }';

type PersonRow = { rel: Record<string, unknown> };
type SpouseRow = PersonRow & {
  status: MarriageStatus;
  since: string | null;
  until: string | null;
};

const toPerson = (row: { rel: Record<string, unknown> }): Person =>
  personSchema.parse(row.rel);

export class RelationshipError extends Error {}

/**
 * Create a relationship edge between two people the caller owns. Every node is
 * matched with `ownerId`, so cross-account links are impossible. PARENT_OF
 * points parent → child; marriage is a single edge, queried undirected.
 */
export async function addRelationship(
  ownerId: string,
  input: RelationshipInput,
): Promise<void> {
  const data = relationshipInputSchema.parse(input);

  if (data.kind === 'parent') {
    const cycle = await read<{ exists: boolean }>(
      `MATCH (parent:Person { id: $parentId, ownerId: $ownerId }),
             (child:Person { id: $childId, ownerId: $ownerId })
       RETURN EXISTS((parent)<-[:PARENT_OF*]-(child)) AS exists`,
      { parentId: data.parentId, childId: data.childId, ownerId },
    );
    if (cycle[0]?.exists) {
      throw new RelationshipError(
        'That would create a loop — the child is already an ancestor of the parent.',
      );
    }
    await write(
      `MATCH (parent:Person { id: $parentId, ownerId: $ownerId }),
             (child:Person { id: $childId, ownerId: $ownerId })
       MERGE (parent)-[r:PARENT_OF]->(child)
       SET r.role = $role`,
      { parentId: data.parentId, childId: data.childId, role: data.role, ownerId },
    );
    return;
  }

  await write(
    `MATCH (a:Person { id: $aId, ownerId: $ownerId }),
           (b:Person { id: $bId, ownerId: $ownerId })
     OPTIONAL MATCH (a)-[existing:MARRIED_TO]-(b)
     WITH a, b, existing
     WHERE existing IS NULL
     CREATE (a)-[m:MARRIED_TO]->(b)
     SET m.status = $status, m.since = $since, m.until = $until`,
    {
      aId: data.aId,
      bId: data.bId,
      status: data.status,
      since: data.since ?? null,
      until: data.until ?? null,
      ownerId,
    },
  );
}

export async function removeRelationship(
  ownerId: string,
  input: RelationshipInput,
): Promise<void> {
  const data = relationshipInputSchema.parse(input);
  if (data.kind === 'parent') {
    await write(
      `MATCH (:Person { id: $parentId, ownerId: $ownerId })
             -[r:PARENT_OF]->
             (:Person { id: $childId, ownerId: $ownerId })
       DELETE r`,
      { parentId: data.parentId, childId: data.childId, ownerId },
    );
    return;
  }
  await write(
    `MATCH (:Person { id: $aId, ownerId: $ownerId })
           -[m:MARRIED_TO]-
           (:Person { id: $bId, ownerId: $ownerId })
     DELETE m`,
    { aId: data.aId, bId: data.bId, ownerId },
  );
}

/** Everyone exactly one hop from a person: parents, children, siblings, spouses. */
export async function getRelatives(ownerId: string, id: string): Promise<Relatives> {
  const [parents, children, siblings, spouseRows] = await Promise.all([
    read<PersonRow>(
      `MATCH (:Person { id: $id, ownerId: $ownerId })<-[:PARENT_OF]-(rel:Person)
       RETURN ${PROJECTION} ORDER BY rel.birthDate`,
      { id, ownerId },
    ),
    read<PersonRow>(
      `MATCH (:Person { id: $id, ownerId: $ownerId })-[:PARENT_OF]->(rel:Person)
       RETURN ${PROJECTION} ORDER BY rel.birthDate`,
      { id, ownerId },
    ),
    read<PersonRow>(
      `MATCH (:Person { id: $id, ownerId: $ownerId })<-[:PARENT_OF]-(:Person)-[:PARENT_OF]->(rel:Person)
       WHERE rel.id <> $id
       RETURN DISTINCT ${PROJECTION} ORDER BY rel.birthDate`,
      { id, ownerId },
    ),
    read<SpouseRow>(
      `MATCH (:Person { id: $id, ownerId: $ownerId })-[m:MARRIED_TO]-(rel:Person)
       RETURN ${PROJECTION}, m.status AS status, m.since AS since, m.until AS until`,
      { id, ownerId },
    ),
  ]);

  const spouses: SpouseLink[] = spouseRows.map((row) => ({
    person: toPerson(row),
    status: row.status ?? 'married',
    since: row.since,
    until: row.until,
  }));

  return {
    parents: parents.map(toPerson),
    children: children.map(toPerson),
    siblings: siblings.map(toPerson),
    spouses,
  };
}

export async function getAncestors(
  ownerId: string,
  id: string,
  depth?: number,
): Promise<Person[]> {
  const range = depth && depth > 0 ? `*1..${Math.floor(depth)}` : '*';
  const rows = await read<PersonRow>(
    `MATCH (:Person { id: $id, ownerId: $ownerId })<-[:PARENT_OF${range}]-(rel:Person)
     RETURN DISTINCT ${PROJECTION} ORDER BY rel.birthDate`,
    { id, ownerId },
  );
  return rows.map(toPerson);
}

export async function getDescendants(
  ownerId: string,
  id: string,
  depth?: number,
): Promise<Person[]> {
  const range = depth && depth > 0 ? `*1..${Math.floor(depth)}` : '*';
  const rows = await read<PersonRow>(
    `MATCH (:Person { id: $id, ownerId: $ownerId })-[:PARENT_OF${range}]->(rel:Person)
     RETURN DISTINCT ${PROJECTION} ORDER BY rel.birthDate`,
    { id, ownerId },
  );
  return rows.map(toPerson);
}

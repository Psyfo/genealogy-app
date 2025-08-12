import { Person } from '@/types/person';
import { Relationship } from '@/types/relationship';

import { runQuery } from './neo4';

export async function createRelationship(rel: Relationship) {
  await runQuery(
    `
    MATCH (a:Person {id: $fromId}), (b:Person {id: $toId})
    CREATE (a)-[r:${rel.type}]->(b)
    `,
    { ...rel }
  );
}

/**
 * Get all ancestors of a given person.
 * @param id The person ID
 * @param depth Optional traversal depth (default: unlimited)
 */
export async function getAncestors(
  id: string,
  depth?: number
): Promise<Person[]> {
  const depthPattern = depth ? `*1..${depth}` : `*`;
  return runQuery<Person>(
    `
    MATCH (p:Person {id: $id})<-[:PARENT_OF${depthPattern}]-(ancestor)
    RETURN DISTINCT ancestor.id AS id,
           ancestor.name AS name,
           ancestor.birthYear AS birthYear,
           ancestor.deathYear AS deathYear
    `,
    { id }
  );
}

/**
 * Get all descendants of a given person.
 * @param id The person ID
 * @param depth Optional traversal depth (default: unlimited)
 */
export async function getDescendants(
  id: string,
  depth?: number
): Promise<Person[]> {
  const depthPattern = depth ? `*1..${depth}` : `*`;
  return runQuery<Person>(
    `
    MATCH (p:Person {id: $id})-[:PARENT_OF${depthPattern}]->(descendant)
    RETURN DISTINCT descendant.id AS id,
           descendant.name AS name,
           descendant.birthYear AS birthYear,
           descendant.deathYear AS deathYear
    `,
    { id }
  );
}

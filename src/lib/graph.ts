import { read } from './neo4j/driver';
import { isLiving, yearOf } from './format';
import type { Gender } from './validation';
import type { GraphData, GraphLink, GraphNode } from '@/types/graph';

type NodeRow = {
  id: string;
  givenName: string;
  familyName: string;
  gender: Gender;
  birthDate: string | null;
  deathDate: string | null;
};

type LinkRow = { source: string; target: string; type: GraphLink['type'] };

/**
 * Generation of each person. First by longest incoming PARENT_OF chain
 * (memoized, cycle-guarded), then aligned across marriages so a spouse who
 * married into the family sits in the same band as their partner rather than
 * floating up to generation 0 for lack of recorded parents.
 */
function computeGenerations(
  ids: string[],
  parentsOf: Map<string, string[]>,
  marriages: ReadonlyArray<[string, string]>,
): Map<string, number> {
  const memo = new Map<string, number>();

  const depth = (id: string, stack: Set<string>): number => {
    const cached = memo.get(id);
    if (cached !== undefined) return cached;
    if (stack.has(id)) return 0;

    const parents = parentsOf.get(id) ?? [];
    if (parents.length === 0) {
      memo.set(id, 0);
      return 0;
    }
    stack.add(id);
    const generation =
      1 + Math.max(...parents.map((parent) => depth(parent, stack)));
    stack.delete(id);
    memo.set(id, generation);
    return generation;
  };

  for (const id of ids) depth(id, new Set());

  // Spouses share a generation — settle to the deeper of the two, repeating
  // until stable (bounded by the number of people).
  for (let pass = 0; pass < ids.length; pass += 1) {
    let changed = false;
    for (const [a, b] of marriages) {
      const aligned = Math.max(memo.get(a) ?? 0, memo.get(b) ?? 0);
      if ((memo.get(a) ?? 0) !== aligned) {
        memo.set(a, aligned);
        changed = true;
      }
      if ((memo.get(b) ?? 0) !== aligned) {
        memo.set(b, aligned);
        changed = true;
      }
    }
    if (!changed) break;
  }

  return memo;
}

export async function getGraph(): Promise<GraphData> {
  const [nodeRows, linkRows] = await Promise.all([
    read<NodeRow>(
      `MATCH (p:Person)
       RETURN p.id AS id, p.givenName AS givenName, p.familyName AS familyName,
              p.gender AS gender, p.birthDate AS birthDate, p.deathDate AS deathDate`,
    ),
    read<LinkRow>(
      `MATCH (a:Person)-[:PARENT_OF]->(b:Person)
       RETURN a.id AS source, b.id AS target, 'PARENT_OF' AS type
       UNION
       MATCH (a:Person)-[:MARRIED_TO]-(b:Person)
       WHERE a.id < b.id
       RETURN a.id AS source, b.id AS target, 'MARRIED_TO' AS type`,
    ),
  ]);

  const parentsOf = new Map<string, string[]>();
  const marriages: Array<[string, string]> = [];
  for (const link of linkRows) {
    if (link.type === 'PARENT_OF') {
      const list = parentsOf.get(link.target) ?? [];
      list.push(link.source);
      parentsOf.set(link.target, list);
    } else if (link.type === 'MARRIED_TO') {
      marriages.push([link.source, link.target]);
    }
  }

  const generations = computeGenerations(
    nodeRows.map((row) => row.id),
    parentsOf,
    marriages,
  );

  const nodes: GraphNode[] = nodeRows.map((row) => ({
    id: row.id,
    name: `${row.givenName} ${row.familyName}`,
    familyName: row.familyName,
    gender: row.gender ?? 'unknown',
    birthYear: yearOf(row.birthDate),
    deathYear: yearOf(row.deathDate),
    living: isLiving({ deathDate: row.deathDate }),
    generation: generations.get(row.id) ?? 0,
  }));

  const links: GraphLink[] = linkRows.map((row) => ({
    source: row.source,
    target: row.target,
    type: row.type,
  }));

  return { nodes, links };
}

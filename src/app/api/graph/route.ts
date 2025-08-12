import { NextResponse } from 'next/server';

import { runQuery } from '@/lib/neo4';

export async function GET() {
  // Fetch nodes (people)
  const nodes = await runQuery<{ id: string; name: string }>(`
    MATCH (p:Person)
    RETURN id(p) AS id, p.name AS name
  `);

  // Fetch edges (relationships)
  const links = await runQuery<{
    source: string;
    target: string;
    type: string;
  }>(`
    MATCH (a:Person)-[r]->(b:Person)
    RETURN id(a) AS source, id(b) AS target, type(r) AS type
  `);

  return NextResponse.json({ nodes, links });
}

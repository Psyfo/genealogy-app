import { NextResponse } from 'next/server';

import { createRelationship } from '@/lib/relationships';

export async function POST(req: Request) {
  const data = await req.json();
  await createRelationship(data);
  return NextResponse.json({ status: 'ok' });
}

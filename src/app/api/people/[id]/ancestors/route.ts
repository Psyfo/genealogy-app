import { NextResponse } from 'next/server';

import { getAncestors } from '@/lib/relationships';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const depthParam = searchParams.get('depth');
  const depth = depthParam ? parseInt(depthParam, 10) : undefined;

  console.debug('[API ancestors] id=%s depth=%s', id, depth);

  const data = await getAncestors(id, depth);
  return NextResponse.json(data);
}

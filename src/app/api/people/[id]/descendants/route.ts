import { NextResponse } from 'next/server';

import { getDescendants } from '@/lib/relationships';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // await params per Next.js requirement
  const { searchParams } = new URL(req.url);
  const depthParam = searchParams.get('depth');
  const depth = depthParam ? parseInt(depthParam, 10) : undefined;

  console.debug('[API descendants] id=%s depth=%s', id, depth);

  const data = await getDescendants(id, depth);
  return NextResponse.json(data);
}

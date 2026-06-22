import { apiError, currentUserId, json, unauthorized } from '@/lib/api';
import { getAncestors } from '@/lib/relationships';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context): Promise<Response> {
  try {
    const ownerId = await currentUserId();
    if (!ownerId) return unauthorized();
    const { id } = await params;
    const depthParam = new URL(request.url).searchParams.get('depth');
    const depth = depthParam ? Number.parseInt(depthParam, 10) : undefined;
    return json(await getAncestors(ownerId, id, depth));
  } catch (error) {
    return apiError(error);
  }
}

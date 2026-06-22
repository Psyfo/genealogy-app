import { apiError, currentUserId, json, unauthorized } from '@/lib/api';
import { getGraph } from '@/lib/graph';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    const ownerId = await currentUserId();
    if (!ownerId) return unauthorized();
    return json(await getGraph(ownerId));
  } catch (error) {
    return apiError(error);
  }
}

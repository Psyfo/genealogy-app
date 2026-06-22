import { apiError, currentUserId, json, unauthorized } from '@/lib/api';
import { addRelationship, removeRelationship } from '@/lib/relationships';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  try {
    const ownerId = await currentUserId();
    if (!ownerId) return unauthorized();
    const body = await request.json();
    await addRelationship(ownerId, body);
    return json({ ok: true }, 201);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    const ownerId = await currentUserId();
    if (!ownerId) return unauthorized();
    const body = await request.json();
    await removeRelationship(ownerId, body);
    return json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}

import { apiError, json } from '@/lib/api';
import { addRelationship, removeRelationship } from '@/lib/relationships';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    await addRelationship(body);
    return json({ ok: true }, 201);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    await removeRelationship(body);
    return json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}

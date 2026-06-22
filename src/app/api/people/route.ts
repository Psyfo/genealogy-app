import { apiError, currentUserId, json, unauthorized } from '@/lib/api';
import { createPerson, listPeople } from '@/lib/people';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  try {
    const ownerId = await currentUserId();
    if (!ownerId) return unauthorized();
    const search = new URL(request.url).searchParams.get('search') ?? undefined;
    return json(await listPeople(ownerId, search));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const ownerId = await currentUserId();
    if (!ownerId) return unauthorized();
    const body = await request.json();
    return json(await createPerson(ownerId, body), 201);
  } catch (error) {
    return apiError(error);
  }
}

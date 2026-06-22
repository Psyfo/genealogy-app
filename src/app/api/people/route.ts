import { apiError, json } from '@/lib/api';
import { createPerson, listPeople } from '@/lib/people';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  try {
    const search = new URL(request.url).searchParams.get('search') ?? undefined;
    return json(await listPeople(search));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    return json(await createPerson(body), 201);
  } catch (error) {
    return apiError(error);
  }
}

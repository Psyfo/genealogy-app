import { apiError, currentUserId, json, unauthorized } from '@/lib/api';
import { deletePerson, getPerson, updatePerson } from '@/lib/people';
import { getRelatives } from '@/lib/relationships';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

const notFound = () =>
  Response.json({ error: { message: 'Person not found.' } }, { status: 404 });

export async function GET(_request: Request, { params }: Context): Promise<Response> {
  try {
    const ownerId = await currentUserId();
    if (!ownerId) return unauthorized();
    const { id } = await params;
    const person = await getPerson(ownerId, id);
    if (!person) return notFound();
    const relatives = await getRelatives(ownerId, id);
    return json({ person, relatives });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: Context): Promise<Response> {
  try {
    const ownerId = await currentUserId();
    if (!ownerId) return unauthorized();
    const { id } = await params;
    const body = await request.json();
    const person = await updatePerson(ownerId, id, body);
    if (!person) return notFound();
    return json(person);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Context): Promise<Response> {
  try {
    const ownerId = await currentUserId();
    if (!ownerId) return unauthorized();
    const { id } = await params;
    const deleted = await deletePerson(ownerId, id);
    if (!deleted) return notFound();
    return json({ id });
  } catch (error) {
    return apiError(error);
  }
}

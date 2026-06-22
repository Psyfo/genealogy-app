import { apiError, json } from '@/lib/api';
import { deletePerson, getPerson, updatePerson } from '@/lib/people';
import { getRelatives } from '@/lib/relationships';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context): Promise<Response> {
  try {
    const { id } = await params;
    const person = await getPerson(id);
    if (!person) {
      return Response.json({ error: { message: 'Person not found.' } }, { status: 404 });
    }
    const relatives = await getRelatives(id);
    return json({ person, relatives });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: Context): Promise<Response> {
  try {
    const { id } = await params;
    const body = await request.json();
    const person = await updatePerson(id, body);
    if (!person) {
      return Response.json({ error: { message: 'Person not found.' } }, { status: 404 });
    }
    return json(person);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Context): Promise<Response> {
  try {
    const { id } = await params;
    const deleted = await deletePerson(id);
    if (!deleted) {
      return Response.json({ error: { message: 'Person not found.' } }, { status: 404 });
    }
    return json({ id });
  } catch (error) {
    return apiError(error);
  }
}

import { apiError, json } from '@/lib/api';
import { getGraph } from '@/lib/graph';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    return json(await getGraph());
  } catch (error) {
    return apiError(error);
  }
}

import { json } from '@/lib/api';
import { destroySession } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(): Promise<Response> {
  await destroySession();
  return json({ ok: true });
}

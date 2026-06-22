import { apiError, json } from '@/lib/api';
import { loginSchema } from '@/lib/validation';
import { getUserByEmail } from '@/lib/users';
import { verifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  try {
    const { email, password } = loginSchema.parse(await request.json());
    const stored = await getUserByEmail(email);
    const ok = stored && (await verifyPassword(password, stored.passwordHash));

    if (!stored || !ok) {
      return Response.json(
        { error: { message: 'Wrong email or password.' } },
        { status: 401 },
      );
    }

    await createSession(stored.id);
    return json({
      user: {
        id: stored.id,
        email: stored.email,
        name: stored.name,
        createdAt: stored.createdAt,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}

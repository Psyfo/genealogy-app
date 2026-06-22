import { apiError, json } from '@/lib/api';
import { signupSchema } from '@/lib/validation';
import { createUser, getUserByEmail } from '@/lib/users';
import { hashPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  try {
    const { name, email, password } = signupSchema.parse(await request.json());

    if (await getUserByEmail(email)) {
      return Response.json(
        { error: { message: 'An account with that email already exists.' } },
        { status: 409 },
      );
    }

    const user = await createUser({
      name,
      email,
      passwordHash: await hashPassword(password),
    });
    await createSession(user.id);
    return json({ user }, 201);
  } catch (error) {
    return apiError(error);
  }
}

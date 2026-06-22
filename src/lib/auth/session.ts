import { cookies } from 'next/headers';

import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signToken,
  verifyToken,
  type SessionPayload,
} from './jwt';

/** Server-side session helpers backed by an httpOnly cookie. */

export async function createSession(userId: string): Promise<void> {
  const token = await signToken({ userId });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

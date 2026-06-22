import { SignJWT, jwtVerify } from 'jose';

/**
 * Pure JWT helpers with no Node-only or next/headers imports, so they are safe
 * to use from Edge middleware as well as server components and route handlers.
 */

export const SESSION_COOKIE = 'kindred_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const ALG = 'HS256';

export type SessionPayload = { userId: string };

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error('AUTH_SECRET is not set (see .env.example).');
  return new TextEncoder().encode(value);
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    const userId = payload.userId;
    return typeof userId === 'string' ? { userId } : null;
  } catch {
    return null;
  }
}

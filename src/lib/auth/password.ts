import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

/**
 * Password hashing with scrypt (built into Node, no native deps). Stored as
 * `salt:derivedKey`, both hex. Comparison is constant-time.
 */
const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  const keyBuffer = Buffer.from(key, 'hex');
  return (
    keyBuffer.length === derived.length && timingSafeEqual(keyBuffer, derived)
  );
}

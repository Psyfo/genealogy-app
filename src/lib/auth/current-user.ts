import { redirect } from 'next/navigation';

import { getSession } from './session';
import { getUserById, type User } from '../users';

/** The signed-in user, or null. */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;
  return getUserById(session.userId);
}

/** The signed-in user, or redirect to sign-in. Use to gate server components. */
export async function requireUser(next?: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(next ? `/login?next=${encodeURIComponent(next)}` : '/login');
  }
  return user;
}

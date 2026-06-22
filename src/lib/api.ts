import { ZodError } from 'zod';

import { RelationshipError } from './relationships';

/** Success envelope. */
export function json<T>(data: T, status = 200): Response {
  return Response.json({ data }, { status });
}

/** Normalise thrown errors into a consistent `{ error }` envelope. */
export function apiError(error: unknown): Response {
  if (error instanceof ZodError) {
    return Response.json(
      { error: { message: 'Validation failed.', issues: error.issues } },
      { status: 400 },
    );
  }
  if (error instanceof RelationshipError) {
    return Response.json({ error: { message: error.message } }, { status: 409 });
  }
  console.error('[api]', error);
  const message =
    error instanceof Error ? error.message : 'Something went wrong.';
  return Response.json({ error: { message } }, { status: 500 });
}

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { loginSchema, signupSchema } from '@/lib/validation';

type Mode = 'login' | 'signup';

export function AuthForm({ mode, next }: { mode: Mode; next?: string }) {
  const router = useRouter();
  const isSignup = mode === 'signup';
  const [state, setState] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof state) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => setState((prev) => ({ ...prev, [key]: event.target.value }));

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setServerError(null);

    const schema = isSignup ? signupSchema : loginSchema;
    const parsed = schema.safeParse(state);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? '');
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const body = await response.json();
      if (!response.ok) {
        setServerError(body?.error?.message ?? 'Something went wrong.');
        return;
      }
      router.push(next && next.startsWith('/') ? next : '/people');
      router.refresh();
    } catch {
      setServerError('Could not reach the server.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {isSignup && (
        <Field label="Your name" htmlFor="name" required error={errors.name}>
          <Input id="name" value={state.name} onChange={set('name')} autoFocus autoComplete="name" />
        </Field>
      )}
      <Field label="Email" htmlFor="email" required error={errors.email}>
        <Input
          id="email"
          type="email"
          value={state.email}
          onChange={set('email')}
          autoFocus={!isSignup}
          autoComplete="email"
        />
      </Field>
      <Field
        label="Password"
        htmlFor="password"
        required
        hint={isSignup ? 'At least 8 characters' : undefined}
        error={errors.password}
      >
        <Input
          id="password"
          type="password"
          value={state.password}
          onChange={set('password')}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
        />
      </Field>

      {serverError && (
        <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
          {serverError}
        </p>
      )}

      <Button type="submit" size="lg" disabled={submitting} className="mt-1 w-full">
        {submitting ? 'Just a moment…' : isSignup ? 'Create account' : 'Log in'}
      </Button>
    </form>
  );
}

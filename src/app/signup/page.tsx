import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthForm } from '@/components/auth/auth-form';
import { BrandMark } from '@/components/layout/brand-mark';
import { SITE } from '@/lib/site';

export const metadata: Metadata = { title: 'Sign up' };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:py-24">
      <div className="flex flex-col items-center gap-3 text-center">
        <BrandMark className="size-10" />
        <h1 className="font-display text-3xl font-semibold tracking-tight">Start your family tree</h1>
        <p className="text-sm text-muted-foreground">
          Create a {SITE.name} account — it’s yours and private.
        </p>
      </div>
      <div className="mt-8 rounded-lg border border-hairline bg-paper p-6 shadow-soft sm:p-8">
        <AuthForm mode="signup" next={next} />
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-evergreen hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

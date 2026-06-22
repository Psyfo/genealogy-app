import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { BrandMark } from '@/components/layout/brand-mark';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 px-6 py-28 text-center">
      <BrandMark className="size-12" />
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        Lost the thread
      </h1>
      <p className="text-muted-foreground text-pretty">
        That page isn’t here. Let’s get you back home.
      </p>
      <Link href="/" className={buttonVariants({ variant: 'primary' })}>
        Back home
      </Link>
    </div>
  );
}

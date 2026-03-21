import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-8 py-4 border-b">
        <span className="font-semibold text-lg">NextJS Starter</span>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 text-center px-4">
        <h1 className="text-5xl font-bold tracking-tight">Welcome to NextJS Starter</h1>
        <p className="text-muted-foreground text-lg max-w-md">
          A production-ready starter with auth, MongoDB, Zustand, and shadcn/ui.
        </p>
        <div className="flex gap-3">
          <Button asChild size="lg">
            <Link href="/sign-up">Get started</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

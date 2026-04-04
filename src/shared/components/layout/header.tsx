'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { useLogout } from '@/features/auth/hooks/use-logout';
import { ThemeToggle } from '@/shared/components/layout/theme-toggle';
import { Button } from '@/shared/components/ui/button';

type SessionUser = {
  name?: string | null;
  avatar?: string | null;
  role?: 'admin' | 'user';
};

export const Header = () => {
  const { data: session } = useSession();
  const { logout } = useLogout();
  const sessionUser = session?.user as SessionUser | undefined;
  const userName = sessionUser?.name ?? '';
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <header className="flex items-center justify-between px-6 py-5 sm:px-10 border-b border-border">
      <Link href="/" className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] bg-foreground text-background"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <polygon points="7,1 13,11 1,11" fill="currentColor" />
          </svg>
        </span>
        <span className="text-sm font-semibold tracking-tight text-foreground">
          NextJS Starter
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        {sessionUser ? (
          <>
            {sessionUser.role === 'admin' && (
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground hover:bg-accent">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            )}
            <div className="flex items-center gap-3">
              {sessionUser.avatar ? (
                <Image
                  src={sessionUser.avatar}
                  alt={userName}
                  width={32}
                  height={32}
                  className="size-8 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="size-8 rounded-full border border-border bg-muted flex items-center justify-center text-xs font-semibold text-foreground">
                  {initials || 'U'}
                </div>
              )}
              <span className="text-sm text-muted-foreground hidden sm:block">{userName}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground hover:bg-accent">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

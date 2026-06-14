'use client';
import { Menu, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { useLogout } from '@/features/auth/hooks/use-logout';
import { Logo } from '@/shared/components/layout/logo';
import { Button } from '@/shared/components/ui/button';
import { MARKET_CATEGORIES } from '@/shared/const/navigation.const';

type SessionUser = {
  name?: string | null;
  avatar?: string | null;
  role?: 'admin' | 'user';
};

export const Header = () => {
  const { data: session } = useSession();
  const { logout } = useLogout();
  const sessionUser = session?.user as SessionUser | undefined;
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const close = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Row 1 — utility bar (desktop only) */}
      <div className="hidden border-b border-white/10 bg-secondary sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-end px-6 py-1.5 sm:px-10">
          <div className="flex items-center gap-3 text-xs text-white/70">
            {sessionUser?.role === 'admin' && (
              <Link href="/dashboard" className="transition-colors hover:text-primary">
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Row 2 — logo + search + auth */}
      <div className="bg-secondary">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-10 sm:py-4">
          {/* Logo */}
          <div className="shrink-0">
            <Logo onClick={close} />
          </div>

          {/* Search */}
          <div className="relative flex flex-1 items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="მოძებნე პროდუქტი..."
              className="h-10 w-full rounded-lg border-0 bg-white pl-3 pr-12 text-sm text-foreground shadow-sm
                placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:h-11 sm:pl-4"
            />
            <button
              type="button"
              aria-label="ძიება"
              className="absolute right-0 flex h-10 w-11 items-center justify-center rounded-r-lg
                bg-primary text-primary-foreground transition-colors hover:bg-primary/90 sm:h-11 sm:w-12"
            >
              <Search className="size-4" />
            </button>
          </div>

          {/* Auth — desktop */}
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            {sessionUser ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-white/80 hover:bg-white/10 hover:text-white"
              >
                გასვლა
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <Link href="/sign-in">შესვლა</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-primary font-bold text-primary-foreground hover:bg-primary/90"
                >
                  <Link href="/sign-up">რეგისტრაცია</Link>
                </Button>
              </>
            )}
          </div>

          {/* Hamburger — mobile */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="მენიუ"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white sm:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Row 3 — category nav (desktop) */}
      <div className="hidden border-b border-border bg-card sm:block">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <nav className="scrollbar-hide flex overflow-x-auto">
            {MARKET_CATEGORIES.map((cat) => (
              <Link
                key={cat.key}
                href={cat.href}
                className="shrink-0 whitespace-nowrap border-b-2 border-transparent px-3 py-3
                  text-xs font-medium text-muted-foreground transition-all hover:border-primary hover:text-primary"
              >
                {cat.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-b border-border bg-card sm:hidden">
          {/* Auth buttons */}
          <div className="flex gap-2 border-b border-border p-3">
            {sessionUser ? (
              <>
                {sessionUser.role === 'admin' && (
                  <Button variant="outline" size="sm" asChild className="flex-1" onClick={close}>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="flex-1" onClick={logout}>
                  გასვლა
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild className="flex-1" onClick={close}>
                  <Link href="/sign-in">შესვლა</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="flex-1 bg-primary font-bold text-primary-foreground"
                  onClick={close}
                >
                  <Link href="/sign-up">რეგისტრაცია</Link>
                </Button>
              </>
            )}
          </div>

          {/* Categories list */}
          <nav className="max-h-72 overflow-y-auto py-2">
            {MARKET_CATEGORIES.map((cat) => (
              <Link
                key={cat.key}
                href={cat.href}
                onClick={close}
                className="block px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
              >
                {cat.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

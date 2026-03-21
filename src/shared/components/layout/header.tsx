'use client';
import { useSession } from 'next-auth/react';

import { useLogout } from '@/features/auth/hooks/use-logout';
import { Button } from '@/shared/components/ui/button';

export const Header = () => {
  const { logout } = useLogout();
  const { data: session } = useSession();

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold">NextJS Starter</span>
      </div>
      <div className="flex items-center gap-4">
        {session?.user?.name && (
          <span className="text-sm text-muted-foreground">{session.user.name}</span>
        )}
        <Button variant="outline" size="sm" onClick={logout}>
          Sign out
        </Button>
      </div>
    </header>
  );
};

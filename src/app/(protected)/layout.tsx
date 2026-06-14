import { redirect } from 'next/navigation';
import { type ReactNode } from 'react';

import { DashboardShell } from '@/shared/components/layout/dashboard-shell';
import { auth } from '@/shared/lib/auth';
import { SessionProvider } from '@/shared/providers/session-provider';
import { StoreProvider } from '@/shared/providers/store-provider';

type SessionUser = {
  role?: 'admin' | 'user';
};

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const sessionUser = session?.user as SessionUser | undefined;

  if (!session) redirect('/');
  if (sessionUser?.role !== 'admin') redirect('/');

  return (
    <SessionProvider>
      <StoreProvider>
        <DashboardShell>{children}</DashboardShell>
      </StoreProvider>
    </SessionProvider>
  );
}

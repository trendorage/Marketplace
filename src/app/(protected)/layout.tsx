import { redirect } from 'next/navigation';
import { type ReactNode } from 'react';

import { Header } from '@/shared/components/layout/header';
import { Sidebar } from '@/shared/components/layout/sidebar';
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
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </StoreProvider>
    </SessionProvider>
  );
}

'use client';
import { type ReactNode, useState } from 'react';
import { type StoreApi } from 'zustand';

import { AuthStoreContext } from '@/features/auth/hooks/useAuthStore';
import { createAuthStore } from '@/features/auth/store/auth-store';
import { AuthStore } from '@/features/auth/types/auth.types';
import { SessionsStoreContext } from '@/features/sessions/hooks/useSessionsStore';
import { createSessionsStore } from '@/features/sessions/store/sessions-store';
import { SessionsStore } from '@/features/sessions/types/sessions.types';

export type StoreProviderProps = { children: ReactNode };

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const [authStore] = useState<StoreApi<AuthStore>>(() => createAuthStore());
  const [sessionsStore] = useState<StoreApi<SessionsStore>>(() => createSessionsStore());

  return (
    <AuthStoreContext.Provider value={authStore}>
      <SessionsStoreContext.Provider value={sessionsStore}>
        {children}
      </SessionsStoreContext.Provider>
    </AuthStoreContext.Provider>
  );
};

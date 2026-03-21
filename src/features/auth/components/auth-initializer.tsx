'use client';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

import { useAuthStore } from '../hooks/useAuthStore';

export const AuthInitializer = () => {
  const { data: session } = useSession();
  const { setUser } = useAuthStore();

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id as string,
        name: session.user.name ?? '',
        email: session.user.email ?? '',
      });
    } else {
      setUser(null);
    }
  }, [session, setUser]);

  return null;
};

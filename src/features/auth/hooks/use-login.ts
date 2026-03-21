'use client';
import { signIn, getSession } from 'next-auth/react';

import { useAuthStore } from './useAuthStore';
import { LoginType } from '../validations/auth.validation';

export const useLogin = () => {
  const { setUser, setLoading, setError } = useAuthStore();

  const login = async (data: LoginType) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        const session = await getSession();
        if (session?.user) {
          setUser({
            id: session.user.id as string,
            name: session.user.name ?? '',
            email: session.user.email ?? '',
          });
        }
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return { login };
};

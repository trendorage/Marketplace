import { createStore } from 'zustand/vanilla';

import { AuthState, AuthStore } from '../types/auth.types';

export const createAuthStore = (initState: Partial<AuthState> = {}) => {
  const DEFAULT_STATE: AuthState = {
    user: null,
    csrfToken: null,
    loading: false,
    error: null,
  };

  return createStore<AuthStore>()((set) => ({
    ...DEFAULT_STATE,
    ...initState,
    setUser: (user) => set({ user }),
    setCsrfToken: (token) => set({ csrfToken: token }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
  }));
};

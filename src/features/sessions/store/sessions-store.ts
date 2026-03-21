import { createStore } from 'zustand/vanilla';

import { SessionsState, SessionsStore } from '../types/sessions.types';

export const createSessionsStore = (initState: Partial<SessionsState> = {}) => {
  const DEFAULT_STATE: SessionsState = {
    sessions: [],
    loading: false,
    error: null,
    page: 1,
    total: 0,
  };

  return createStore<SessionsStore>()((set) => ({
    ...DEFAULT_STATE,
    ...initState,
    setSessions: (sessions) => set({ sessions }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setPage: (page) => set({ page }),
    setTotal: (total) => set({ total }),
  }));
};

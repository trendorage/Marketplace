'use client';
import { createContext, useContext } from 'react';
import { useStore, StoreApi } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { SessionsStore, SessionsStoreType } from '@/features/sessions/types/sessions.types';

export const SessionsStoreContext = createContext<StoreApi<SessionsStore> | null>(null);

export const useSessionsStore = () => {
  const store = useContext(SessionsStoreContext);
  if (!store) throw new Error('useSessionsStore must be used within StoreProvider');
  return useStore(
    store,
    useShallow((state: SessionsStoreType) => ({
      sessions: state.sessions,
      loading: state.loading,
      error: state.error,
      page: state.page,
      total: state.total,
      setSessions: state.setSessions,
      setLoading: state.setLoading,
      setError: state.setError,
      setPage: state.setPage,
      setTotal: state.setTotal,
    }))
  );
};

'use client';
import { useCallback } from 'react';

import { http } from '@/shared/lib/http';

import { useSessionsStore } from './useSessionsStore';
import { Session } from '../types/sessions.types';

type SessionsResponse = {
  items: Session[];
  total: number;
  page: number;
  limit: number;
};

export const useSessions = () => {
  const { setSessions, setLoading, setError, setTotal, page } = useSessionsStore();

  const fetchSessions = useCallback(async (userId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page };
      if (userId) params.userId = userId;
      const data = await http.get<SessionsResponse>('/sessions', { params });
      setSessions(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  }, [page, setSessions, setLoading, setError, setTotal]);

  const deleteSession = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await http.delete(`/sessions/${id}`);
      setSessions([]);
      await fetchSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    } finally {
      setLoading(false);
    }
  }, [fetchSessions, setSessions, setLoading, setError]);

  return { fetchSessions, deleteSession };
};

'use client';
import { RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

import { SessionsTable } from './sessions-table';
import { useSessions } from '../hooks/use-sessions';
import { useSessionsStore } from '../hooks/useSessionsStore';

export const SessionsPage = () => {
  const { fetchSessions, deleteSession } = useSessions();
  const { sessions, loading, error } = useSessionsStore();

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sessions</h1>
          <p className="text-muted-foreground mt-1">
            Manage active user sessions.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchSessions()}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <SessionsTable
            sessions={sessions}
            onDelete={deleteSession}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

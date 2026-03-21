'use client';
import { Trash2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { formatDate } from '@/shared/utils/format';

import { Session } from '../types/sessions.types';


type SessionsTableProps = {
  sessions: Session[];
  onDelete: (id: string) => void;
  loading: boolean;
};

export const SessionsTable = ({ sessions, onDelete, loading }: SessionsTableProps) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No sessions found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Session ID</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">User ID</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Expires At</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created</th>
            <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id} className="border-b hover:bg-muted/50 transition-colors">
              <td className="py-3 px-4 font-mono text-xs">{session.id}</td>
              <td className="py-3 px-4 font-mono text-xs">{session.userId}</td>
              <td className="py-3 px-4">{formatDate(session.expiresAt)}</td>
              <td className="py-3 px-4">
                {session.createdAt ? formatDate(session.createdAt) : '-'}
              </td>
              <td className="py-3 px-4 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(session.id)}
                  disabled={loading}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

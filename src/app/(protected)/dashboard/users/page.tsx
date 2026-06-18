'use client';
import { Download, Loader2, MoreHorizontal, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { UserRole, UserStatus } from '@/features/dashboard/types/dashboard.types';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Input } from '@/shared/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { http } from '@/shared/lib/http';
import { cn } from '@/shared/lib/utils';

type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinDate: string;
  avatar?: string | null;
};

const STATUS_CONFIG: Record<UserStatus, { label: string; className: string }> = {
  active: { label: 'აქტიური', className: 'bg-green-100 text-green-800' },
  inactive: { label: 'არააქტიური', className: 'bg-gray-100 text-gray-700' },
  banned: { label: 'დაბლოკილი', className: 'bg-red-100 text-red-800' },
};

const ROLE_CONFIG: Record<UserRole, { label: string; className: string }> = {
  user: { label: 'მომხმარებელი', className: 'bg-blue-100 text-blue-800' },
  seller: { label: 'გამყიდველი', className: 'bg-purple-100 text-purple-800' },
  admin: { label: 'ადმინი', className: 'bg-orange-100 text-orange-800' },
};

const PAGE_SIZE = 8;

function exportCsv(users: ApiUser[]) {
  const headers = ['სახელი', 'Email', 'როლი', 'სტატუსი', 'რეგისტრაცია'];
  const rows = users.map((u) => [
    u.name, u.email, u.role, u.status,
    u.joinDate ? new Date(u.joinDate).toLocaleDateString('ka-GE') : '',
  ]);
  const csv = [headers, ...rows].map((r) => r.map(String).map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'users.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default function UsersPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page), limit: String(PAGE_SIZE),
      search, status: statusFilter === 'all' ? '' : statusFilter,
    });
    http.get<{ users: ApiUser[]; total: number }>(`/users?${params}`)
      .then((res) => { setUsers(res.users); setTotal(res.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const patchUser = async (userId: string, update: { role?: UserRole; status?: UserStatus }) => {
    setLoadingId(userId);
    try {
      await http.patch(`/users/${userId}`, update);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...update } : u)));
    } catch { /* ignore */ } finally {
      setLoadingId(null);
    }
  };

  const activeCount = users.filter((u) => u.status === 'active').length;
  const sellerCount = users.filter((u) => u.role === 'seller').length;
  const bannedCount = users.filter((u) => u.status === 'banned').length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">მომხმარებლების მართვა</h2>
          <p className="text-sm text-muted-foreground">სულ {total} მომხმარებელი</p>
        </div>
        <button
          onClick={() => exportCsv(users)}
          className={[
            'flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5',
            'text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
          ].join(' ')}
        >
          <Download className="size-3.5" />CSV
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'სულ', value: total, className: 'bg-blue-100 text-blue-800' },
          { label: 'აქტიური', value: activeCount, className: 'bg-green-100 text-green-800' },
          { label: 'გამყიდველი', value: sellerCount, className: 'bg-purple-100 text-purple-800' },
          { label: 'დაბლოკილი', value: bannedCount, className: 'bg-red-100 text-red-800' },
        ].map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="მოძებნე სახელი ან email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 text-sm"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'active', 'inactive', 'banned'] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                statusFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {s === 'all' ? 'ყველა' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="pl-6 text-xs">მომხმარებელი</TableHead>
                  <TableHead className="text-xs">როლი</TableHead>
                  <TableHead className="text-xs">სტატუსი</TableHead>
                  <TableHead className="pr-6 text-xs text-right">მოქმედება</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-sm text-muted-foreground">იტვირთება...</TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-sm text-muted-foreground">მომხმარებლები ვერ მოიძებნა</TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const status = STATUS_CONFIG[user.status] ?? STATUS_CONFIG.active;
                    const role = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.user;
                    const isLoading = loadingId === user.id;
                    return (
                      <TableRow key={user.id} className={cn('border-border', isLoading && 'opacity-60 pointer-events-none')}>
                        <TableCell className="pl-6">
                          <div>
                            <p className="text-xs font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', role.className)}>{role.label}</span>
                        </TableCell>
                        <TableCell>
                          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', status.className)}>{status.label}</span>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          {isLoading ? (
                            <Loader2 className="size-4 animate-spin ml-auto text-muted-foreground" />
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="rounded p-1 hover:bg-accent">
                                  <MoreHorizontal className="size-4 text-muted-foreground" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuLabel className="text-xs">როლი</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                  {(['user', 'seller', 'admin'] as UserRole[]).map((r) => (
                                    <DropdownMenuItem
                                      key={r}
                                      onClick={() => patchUser(user.id, { role: r })}
                                      className={cn('text-xs', user.role === r && 'font-semibold text-primary')}
                                    >
                                      {ROLE_CONFIG[r].label}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-xs">სტატუსი</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                  {(['active', 'inactive', 'banned'] as UserStatus[]).map((s) => (
                                    <DropdownMenuItem
                                      key={s}
                                      onClick={() => patchUser(user.id, { status: s })}
                                      className={cn('text-xs', user.status === s && 'font-semibold text-primary')}
                                    >
                                      {STATUS_CONFIG[s].label}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{total === 0 ? '0 მომხმარებელი' : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} / ${total}`}</span>
        <div className="flex gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-border px-3 py-1.5 transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
          >←</button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-border px-3 py-1.5 transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
          >→</button>
        </div>
      </div>
    </div>
  );
}

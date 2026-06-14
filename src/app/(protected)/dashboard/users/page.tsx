'use client';
import { Search } from 'lucide-react';
import { useState } from 'react';

import { USERS_LIST } from '@/features/dashboard/const/dashboard.const';
import type { UserRole, UserStatus } from '@/features/dashboard/types/dashboard.types';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { cn } from '@/shared/lib/utils';

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

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const filtered = USERS_LIST.filter((u) => {
    const matchesSearch =
      search === '' ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleStatusFilter = (value: UserStatus | 'all') => {
    setStatusFilter(value);
    setPage(1);
  };

  const activeCount = USERS_LIST.filter((u) => u.status === 'active').length;
  const sellerCount = USERS_LIST.filter((u) => u.role === 'seller').length;
  const bannedCount = USERS_LIST.filter((u) => u.status === 'banned').length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">მომხმარებლების მართვა</h2>
        <p className="text-sm text-muted-foreground">სულ {USERS_LIST.length} მომხმარებელი</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'სულ', value: USERS_LIST.length, className: 'bg-blue-100 text-blue-800' },
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

      {/* Filters */}
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
              onClick={() => handleStatusFilter(s)}
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

      {/* Table */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="pl-6 text-xs">მომხმარებელი</TableHead>
                  <TableHead className="text-xs">როლი</TableHead>
                  <TableHead className="text-xs">სტატუსი</TableHead>
                  <TableHead className="hidden text-xs sm:table-cell">შეკვეთები</TableHead>
                  <TableHead className="hidden text-xs md:table-cell">დახარჯული</TableHead>
                  <TableHead className="pr-6 text-xs">რეგისტრაცია</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                      მომხმარებლები ვერ მოიძებნა
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((user) => {
                    const status = STATUS_CONFIG[user.status];
                    const role = ROLE_CONFIG[user.role];
                    return (
                      <TableRow key={user.id} className="border-border">
                        <TableCell className="pl-6">
                          <div>
                            <p className="text-xs font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', role.className)}>
                            {role.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', status.className)}>
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell className="hidden text-xs text-foreground sm:table-cell">
                          {user.orders}
                        </TableCell>
                        <TableCell className="hidden text-xs font-medium text-foreground md:table-cell">
                          ₾{user.totalSpent.toLocaleString()}
                        </TableCell>
                        <TableCell className="pr-6 text-xs text-muted-foreground">
                          {user.joinDate}
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
        <span>
          {filtered.length === 0
            ? '0 მომხმარებელი'
            : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} / ${filtered.length}`}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-border px-3 py-1.5 transition-colors
              hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ←
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-border px-3 py-1.5 transition-colors
              hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

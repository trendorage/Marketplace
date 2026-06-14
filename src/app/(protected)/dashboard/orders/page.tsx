'use client';
import { Search } from 'lucide-react';
import { useState } from 'react';

import { ALL_ORDERS } from '@/features/dashboard/const/dashboard.const';
import type { OrderStatus } from '@/features/dashboard/types/dashboard.types';
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

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'მოლოდინში', className: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'დამუშავება', className: 'bg-blue-100 text-blue-800' },
  completed: { label: 'დასრულდა', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'გაუქმდა', className: 'bg-red-100 text-red-800' },
  refunded: { label: 'დაბრუნდა', className: 'bg-gray-100 text-gray-700' },
};

const STATUS_TABS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'ყველა' },
  { value: 'pending', label: 'მოლოდინში' },
  { value: 'processing', label: 'დამუშავება' },
  { value: 'completed', label: 'დასრულდა' },
  { value: 'cancelled', label: 'გაუქმდა' },
  { value: 'refunded', label: 'დაბრუნდა' },
];

const PAGE_SIZE = 8;

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const filtered = ALL_ORDERS.filter((o) => {
    const matchesSearch =
      search === '' ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleStatusFilter = (value: OrderStatus | 'all') => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">შეკვეთების მართვა</h2>
        <p className="text-sm text-muted-foreground">
          სულ {ALL_ORDERS.length} შეკვეთა
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {STATUS_TABS.filter((t) => t.value !== 'all').map((tab) => {
          const count = ALL_ORDERS.filter((o) => o.status === tab.value).length;
          const cfg = STATUS_CONFIG[tab.value as OrderStatus];
          return (
            <Card key={tab.value} className="border-border bg-card">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">{tab.label}</p>
                <p className="mt-1 text-xl font-bold text-foreground">{count}</p>
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', cfg.className)}>
                  {Math.round((count / ALL_ORDERS.length) * 100)}%
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="მოძებნე შეკვეთა, მომხმარებელი..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleStatusFilter(tab.value)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                statusFilter === tab.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {tab.label}
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
                  <TableHead className="pl-6 text-xs">შეკვეთა</TableHead>
                  <TableHead className="text-xs">მომხმარებელი</TableHead>
                  <TableHead className="hidden text-xs md:table-cell">პროდუქტი</TableHead>
                  <TableHead className="hidden text-xs sm:table-cell">კატეგორია</TableHead>
                  <TableHead className="text-xs">თანხა</TableHead>
                  <TableHead className="text-xs">სტატუსი</TableHead>
                  <TableHead className="pr-6 text-xs">თარიღი</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                      შეკვეთები ვერ მოიძებნა
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((order) => {
                    const status = STATUS_CONFIG[order.status];
                    return (
                      <TableRow key={order.id} className="border-border">
                        <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-xs font-medium text-foreground">{order.customer}</p>
                            <p className="text-xs text-muted-foreground">{order.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden max-w-40 md:table-cell">
                          <p className="truncate text-xs text-foreground">{order.product}</p>
                        </TableCell>
                        <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                          {order.category}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-foreground">
                          ₾{order.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', status.className)}>
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell className="pr-6 text-xs text-muted-foreground">
                          {order.date}
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

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {filtered.length === 0
            ? '0 შეკვეთა'
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

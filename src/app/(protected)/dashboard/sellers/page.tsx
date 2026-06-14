'use client';
import { Search, Star } from 'lucide-react';
import { useState } from 'react';

import { SELLERS_LIST } from '@/features/dashboard/const/dashboard.const';
import type { SellerStatus } from '@/features/dashboard/types/dashboard.types';
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

const STATUS_CONFIG: Record<SellerStatus, { label: string; className: string }> = {
  active: { label: 'აქტიური', className: 'bg-green-100 text-green-800' },
  pending: { label: 'მოლოდინში', className: 'bg-yellow-100 text-yellow-800' },
  suspended: { label: 'შეჩერებული', className: 'bg-red-100 text-red-800' },
};

export default function SellersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SellerStatus | 'all'>('all');

  const filtered = SELLERS_LIST.filter((s) => {
    const matchesSearch =
      search === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.storeName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = SELLERS_LIST.reduce((sum, s) => sum + s.revenue, 0);
  const activeCount = SELLERS_LIST.filter((s) => s.status === 'active').length;
  const pendingCount = SELLERS_LIST.filter((s) => s.status === 'pending').length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">გამყიდველების მართვა</h2>
        <p className="text-sm text-muted-foreground">სულ {SELLERS_LIST.length} გამყიდველი</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'სულ', value: SELLERS_LIST.length },
          { label: 'აქტიური', value: activeCount },
          { label: 'მოლოდინში', value: pendingCount },
          { label: 'სულ შემოსავალი', value: `₾${(totalRevenue / 1000).toFixed(0)}k` },
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
            placeholder="მოძებნე გამყიდველი, მაღაზია..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'active', 'pending', 'suspended'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
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
                  <TableHead className="pl-6 text-xs">გამყიდველი</TableHead>
                  <TableHead className="text-xs">მაღაზია</TableHead>
                  <TableHead className="hidden text-xs sm:table-cell">პროდუქტი</TableHead>
                  <TableHead className="hidden text-xs md:table-cell">რეიტინგი</TableHead>
                  <TableHead className="text-xs">შემოსავალი</TableHead>
                  <TableHead className="hidden text-xs md:table-cell">კომისია</TableHead>
                  <TableHead className="pr-6 text-xs">სტატუსი</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                      გამყიდველები ვერ მოიძებნა
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((seller) => {
                    const status = STATUS_CONFIG[seller.status];
                    return (
                      <TableRow key={seller.id} className="border-border">
                        <TableCell className="pl-6">
                          <div>
                            <p className="text-xs font-medium text-foreground">{seller.name}</p>
                            <p className="text-xs text-muted-foreground">{seller.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-foreground">
                          {seller.storeName}
                        </TableCell>
                        <TableCell className="hidden text-xs text-foreground sm:table-cell">
                          {seller.products}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <Star className="size-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-foreground">{seller.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-foreground">
                          ₾{seller.revenue.toLocaleString()}
                        </TableCell>
                        <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                          {seller.commissionRate}%
                        </TableCell>
                        <TableCell className="pr-6">
                          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', status.className)}>
                            {status.label}
                          </span>
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
    </div>
  );
}

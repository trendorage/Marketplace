'use client';
import { Search, Star } from 'lucide-react';
import { useState } from 'react';

import { TOP_PRODUCTS } from '@/features/dashboard/const/dashboard.const';
import type { ProductStatus } from '@/features/dashboard/types/dashboard.types';
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

const STATUS_CONFIG: Record<ProductStatus, { label: string; className: string }> = {
  active: { label: 'აქტიური', className: 'bg-green-100 text-green-800' },
  draft: { label: 'დრაფტი', className: 'bg-gray-100 text-gray-700' },
  out_of_stock: { label: 'ამოწურულია', className: 'bg-red-100 text-red-800' },
  pending: { label: 'მოლოდინში', className: 'bg-yellow-100 text-yellow-800' },
};

const PAGE_SIZE = 8;

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const filtered = TOP_PRODUCTS.filter((p) => {
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.seller.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCount = TOP_PRODUCTS.filter((p) => p.status === 'active').length;
  const outOfStockCount = TOP_PRODUCTS.filter((p) => p.status === 'out_of_stock').length;
  const pendingCount = TOP_PRODUCTS.filter((p) => p.status === 'pending').length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">პროდუქტების მართვა</h2>
        <p className="text-sm text-muted-foreground">სულ {TOP_PRODUCTS.length} პროდუქტი</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'სულ', value: TOP_PRODUCTS.length },
          { label: 'აქტიური', value: activeCount },
          { label: 'ამოწურულია', value: outOfStockCount },
          { label: 'მოლოდინში', value: pendingCount },
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
            placeholder="მოძებნე პროდუქტი, კატეგორია..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {(['all', 'active', 'pending', 'out_of_stock', 'draft'] as const).map((s) => (
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

      {/* Table */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="pl-6 text-xs">პროდუქტი</TableHead>
                  <TableHead className="hidden text-xs md:table-cell">კატეგორია</TableHead>
                  <TableHead className="text-xs">ფასი</TableHead>
                  <TableHead className="hidden text-xs sm:table-cell">მარაგი</TableHead>
                  <TableHead className="hidden text-xs sm:table-cell">გაყიდვა</TableHead>
                  <TableHead className="hidden text-xs md:table-cell">შემოსავალი</TableHead>
                  <TableHead className="pr-6 text-xs">სტატუსი</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                      პროდუქტები ვერ მოიძებნა
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((product) => {
                    const status = STATUS_CONFIG[product.status];
                    return (
                      <TableRow key={product.id} className="border-border">
                        <TableCell className="pl-6">
                          <div>
                            <p className="max-w-44 truncate text-xs font-medium text-foreground">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star className="size-2.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-muted-foreground">{product.rating}</span>
                              <span className="text-xs text-muted-foreground">· {product.seller}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                          {product.category}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-foreground">
                          ₾{product.price.toLocaleString()}
                        </TableCell>
                        <TableCell className={cn(
                          'hidden text-xs sm:table-cell',
                          product.stock === 0 ? 'text-red-500 font-medium' : 'text-foreground'
                        )}>
                          {product.stock}
                        </TableCell>
                        <TableCell className="hidden text-xs text-foreground sm:table-cell">
                          {product.sales}
                        </TableCell>
                        <TableCell className="hidden text-xs font-semibold text-foreground md:table-cell">
                          ₾{product.revenue.toLocaleString()}
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

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {filtered.length === 0
            ? '0 პროდუქტი'
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

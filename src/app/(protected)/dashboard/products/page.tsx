'use client';
import { Plus, Search, Star } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { AddProductDialog } from '@/features/products/components/add-product-dialog';
import type { Product, ProductStatus } from '@/features/products/types/product.types';
import { Button } from '@/shared/components/ui/button';
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
import { MARKET_CATEGORIES } from '@/shared/const/navigation.const';
import { http } from '@/shared/lib/http';
import { cn } from '@/shared/lib/utils';

const STATUS_CONFIG: Record<ProductStatus, { label: string; className: string }> = {
  active: { label: 'აქტიური', className: 'bg-green-100 text-green-800' },
  draft: { label: 'დრაფტი', className: 'bg-gray-100 text-gray-700' },
  out_of_stock: { label: 'ამოწურულია', className: 'bg-red-100 text-red-800' },
  pending: { label: 'მოლოდინში', className: 'bg-yellow-100 text-yellow-800' },
};

const CATEGORY_MAP = Object.fromEntries(MARKET_CATEGORIES.map((c) => [c.key, c.label]));

const PAGE_SIZE = 8;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await http.get<{ products: Product[]; total: number }>('/products');
      setProducts(res.products);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = products.filter((p) => {
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (CATEGORY_MAP[p.category] ?? p.category).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeCount = products.filter((p) => p.status === 'active').length;
  const outOfStockCount = products.filter((p) => p.status === 'out_of_stock').length;
  const pendingCount = products.filter((p) => p.status === 'pending').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">პროდუქტების მართვა</h2>
          <p className="text-sm text-muted-foreground">სულ {products.length} პროდუქტი</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1.5">
          <Plus className="size-4" />
          პროდუქტის დამატება
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'სულ', value: products.length },
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

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
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

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">იტვირთება...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="pl-6 text-xs">პროდუქტი</TableHead>
                    <TableHead className="hidden text-xs md:table-cell">კატეგორია</TableHead>
                    <TableHead className="text-xs">ფასი</TableHead>
                    <TableHead className="hidden text-xs sm:table-cell">მარაგი</TableHead>
                    <TableHead className="pr-6 text-xs">სტატუსი</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                        {products.length === 0 ? 'პროდუქტები არ მოიძებნა. დაამატეთ პირველი პროდუქტი.' : 'ფილტრი ცარიელია'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((product) => {
                      const status = STATUS_CONFIG[product.status];
                      return (
                        <TableRow key={product.id} className="border-border">
                          <TableCell className="pl-6">
                            <div>
                              <p className="max-w-48 truncate text-xs font-medium text-foreground">
                                {product.name}
                              </p>
                              {product.rating > 0 && (
                                <div className="mt-0.5 flex items-center gap-1">
                                  <Star className="size-2.5 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs text-muted-foreground">{product.rating}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                            {CATEGORY_MAP[product.category] ?? product.category}
                          </TableCell>
                          <TableCell className="text-xs font-medium text-foreground">
                            ₾{product.price.toLocaleString()}
                          </TableCell>
                          <TableCell className={cn(
                            'hidden text-xs sm:table-cell',
                            product.stock === 0 ? 'font-medium text-red-500' : 'text-foreground'
                          )}>
                            {product.stock}
                          </TableCell>
                          <TableCell className="pr-6">
                            <span className={cn(
                              'rounded-full px-2 py-0.5 text-xs font-medium',
                              status.className
                            )}>
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
          )}
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
            className="rounded-lg border border-border px-3 py-1.5 transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            ←
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-border px-3 py-1.5 transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            →
          </button>
        </div>
      </div>

      <AddProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchProducts}
      />
    </div>
  );
}

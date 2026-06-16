'use client';
import { PackageSearch, Search, ShoppingBag, ShoppingCart, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { Category } from '@/features/categories/types/category.types';
import type { Product } from '@/features/products/types/product.types';
import { Footer } from '@/shared/components/layout/footer';
import { Header } from '@/shared/components/layout/header';
import { cn } from '@/shared/lib/utils';

const PAGE_SIZE = 24;

const ProductCard = ({ product }: { product: Product }) => (
  <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card
    transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
    <div className="relative aspect-square w-full overflow-hidden bg-muted">
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <ShoppingBag className="absolute inset-0 m-auto size-10 text-muted-foreground/20
          transition-transform duration-300 group-hover:scale-110 sm:size-14" />
      )}
      {product.status === 'out_of_stock' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="rounded bg-black/70 px-2 py-1 text-xs font-bold text-white">
            ამოწურულია
          </span>
        </div>
      )}
    </div>

    <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:p-3">
      <p className="line-clamp-2 text-xs font-medium text-foreground sm:text-sm">
        {product.name}
      </p>

      {product.rating > 0 && (
        <div className="flex items-center gap-0.5">
          <Star className="size-2.5 fill-primary text-primary" />
          <span className="text-xs text-muted-foreground">{product.rating.toFixed(1)}</span>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <span className="text-sm font-bold text-foreground sm:text-base">
          ₾{product.price.toLocaleString('ka-GE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <button
          type="button"
          disabled={product.status === 'out_of_stock' || product.stock === 0}
          className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs
            font-medium text-primary-foreground transition-opacity
            hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingCart className="size-3" />
          <span className="hidden sm:inline">კალათაში</span>
        </button>
      </div>
    </div>
  </div>
);

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, cRes] = await Promise.all([
          fetch('/api/products?limit=200&status=active'),
          fetch('/api/categories'),
        ]);
        const pData = await pRes.json() as { products: Product[] };
        const cData = await cRes.json() as { categories: Category[] };
        setProducts(pData.products ?? []);
        setCategories(cData.categories ?? []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = search === '' || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === '' || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleCategory = (key: string) => { setActiveCategory(key); setPage(1); };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Page header */}
        <div className="border-b border-border bg-card px-4 py-5 sm:px-10">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">ყველა პროდუქტი</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {loading ? 'იტვირთება...' : `${filtered.length} პროდუქტი`}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-10">
          {/* Search + filters */}
          <div className="mb-5 flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="მოძებნე პროდუქტი..."
                className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4
                  text-sm text-foreground placeholder:text-muted-foreground
                  outline-none focus:border-primary"
              />
            </div>

            {categories.length > 0 && (
              <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => handleCategory('')}
                  className={cn(
                    'shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors',
                    activeCategory === ''
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  ყველა
                </button>
                {categories.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => handleCategory(c.key)}
                    className={cn(
                      'shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors',
                      activeCategory === c.key
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <PackageSearch className="size-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">პროდუქტი ვერ მოიძებნა</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {paginated.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="rounded-lg border border-border px-4 py-2 text-sm transition-colors
                  hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                ←
              </button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-border px-4 py-2 text-sm transition-colors
                  hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                →
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

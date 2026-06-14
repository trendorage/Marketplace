'use client';
import { Star } from 'lucide-react';
import Link from 'next/link';

import { TOP_PRODUCTS } from '@/features/dashboard/const/dashboard.const';
import type { ProductStatus } from '@/features/dashboard/types/dashboard.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
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

export const TopProductsTable = () => (
  <Card className="border-border bg-card">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-base font-semibold">ტოპ პროდუქტები</CardTitle>
        <Link
          href="/dashboard/products"
          className="text-xs font-medium text-primary hover:underline"
        >
          ყველა პროდუქტი →
        </Link>
      </div>
    </CardHeader>
    <CardContent className="p-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="pl-6 text-xs">პროდუქტი</TableHead>
              <TableHead className="hidden text-xs md:table-cell">კატეგორია</TableHead>
              <TableHead className="text-xs">ფასი</TableHead>
              <TableHead className="hidden text-xs sm:table-cell">გაყიდვა</TableHead>
              <TableHead className="text-xs">შემოსავალი</TableHead>
              <TableHead className="pr-6 text-xs">სტატუსი</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TOP_PRODUCTS.slice(0, 7).map((product) => {
              const status = STATUS_CONFIG[product.status];
              return (
                <TableRow key={product.id} className="border-border">
                  <TableCell className="pl-6">
                    <div>
                      <p className="max-w-40 truncate text-xs font-medium text-foreground">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <Star className="size-2.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">{product.rating}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                    {product.category}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground">
                    ₾{product.price.toLocaleString()}
                  </TableCell>
                  <TableCell className="hidden text-xs text-foreground sm:table-cell">
                    {product.sales}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-foreground">
                    ₾{product.revenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="pr-6">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        status.className
                      )}
                    >
                      {status.label}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
);

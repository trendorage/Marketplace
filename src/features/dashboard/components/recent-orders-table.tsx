'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import type { OrderStatus } from '@/features/dashboard/types/dashboard.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
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

type ApiOrder = {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  product: string;
  amount: number;
  status: OrderStatus;
  date: string;
};

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'მოლოდინში', className: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'დამუშავება', className: 'bg-blue-100 text-blue-800' },
  completed: { label: 'დასრულდა', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'გაუქმდა', className: 'bg-red-100 text-red-800' },
  refunded: { label: 'დაბრუნდა', className: 'bg-gray-100 text-gray-700' },
};

export const RecentOrdersTable = () => {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    http.get<{ orders: ApiOrder[] }>('/orders?limit=7&page=1')
      .then((res) => setOrders(res.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">ბოლო შეკვეთები</CardTitle>
          <Link href="/dashboard/orders" className="text-xs font-medium text-primary hover:underline">
            ყველა →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="pl-6 text-xs">შეკვეთა</TableHead>
                <TableHead className="text-xs">მომხმარებელი</TableHead>
                <TableHead className="hidden text-xs md:table-cell">პროდუქტი</TableHead>
                <TableHead className="text-xs">თანხა</TableHead>
                <TableHead className="text-xs">სტატუსი</TableHead>
                <TableHead className="hidden pr-6 text-xs sm:table-cell">თარიღი</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                    იტვირთება...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                    შეკვეთები ჯერ არ არის
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                  return (
                    <TableRow key={order.id} className="border-border">
                      <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-xs font-medium text-foreground">{order.customer}</p>
                          <p className="hidden text-xs text-muted-foreground sm:block">{order.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden max-w-40 md:table-cell">
                        <p className="truncate text-xs text-foreground">{order.product}</p>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-foreground">
                        ₾{order.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', status.className)}>
                          {status.label}
                        </span>
                      </TableCell>
                      <TableCell className="hidden pr-6 text-xs text-muted-foreground sm:table-cell">
                        {order.date ? new Date(order.date).toLocaleDateString('ka-GE') : '—'}
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
  );
};

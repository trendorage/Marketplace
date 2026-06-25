'use client';
import { useEffect, useState } from 'react';

import type { TransactionStatus, TransactionType } from '@/features/dashboard/types/dashboard.types';
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

type OrderStats = {
  totalRevenue: number;
  totalRefunds: number;
  countByStatus: Record<string, number>;
};

type AnalyticsData = {
  points: { label: string; revenue: number; orders: number; commission: number }[];
  categories: { name: string; revenue: number; count: number }[];
};

type Order = {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  product: string;
  category: string;
  amount: number;
  status: string;
  date: string;
};

type OrdersResponse = {
  orders: Order[];
  total: number;
};

const TYPE_CONFIG: Record<TransactionType, { label: string; className: string }> = {
  order: { label: 'შეკვეთა', className: 'bg-blue-100 text-blue-800' },
  payout: { label: 'გადახდა', className: 'bg-purple-100 text-purple-800' },
  refund: { label: 'დაბრუნება', className: 'bg-orange-100 text-orange-800' },
  commission: { label: 'კომისია', className: 'bg-green-100 text-green-800' },
};

const STATUS_CONFIG: Record<TransactionStatus, { label: string; className: string }> = {
  completed: { label: 'დასრულდა', className: 'bg-green-100 text-green-800' },
  pending: { label: 'მოლოდინში', className: 'bg-yellow-100 text-yellow-800' },
  failed: { label: 'ჩავარდა', className: 'bg-red-100 text-red-800' },
};

const ORDER_STATUS_MAP: Record<string, TransactionStatus> = {
  completed: 'completed',
  processing: 'pending',
  pending: 'pending',
  cancelled: 'failed',
  refunded: 'failed',
};

const ORDER_TYPE_MAP: Record<string, TransactionType> = {
  completed: 'order',
  processing: 'order',
  pending: 'order',
  cancelled: 'order',
  refunded: 'refund',
};

export default function FinancialPage() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [statsData, analyticsData, ordersData] = await Promise.all([
          http.get<OrderStats>('/orders', { params: { stats: true } }),
          http.get<AnalyticsData>('/admin/analytics', { params: { period: '30d' } }),
          http.get<OrdersResponse>('/orders', { params: { limit: 10, page: 1 } }),
        ]);
        setStats(statsData);
        setAnalytics(analyticsData);
        setOrders(ordersData.orders);
      } catch {
        setError('მონაცემების ჩატვირთვა ვერ მოხდა');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const totalCommission = stats ? Math.round(stats.totalRevenue * 0.1) : 0;
  const totalPayouts = stats ? Math.round(stats.totalRevenue * 0.9 - stats.totalRefunds) : 0;

  if (loading) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">ფინანსური მიმოხილვა</h2>
          <p className="text-sm text-muted-foreground">ბოლო 30 დღის ფინანსური სტატისტიკა</p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-5">
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-7 w-24 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">ფინანსური მიმოხილვა</h2>
        </div>
        <Card className="border-border bg-card">
          <CardContent className="p-6 text-center text-sm text-red-500">{error}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">ფინანსური მიმოხილვა</h2>
        <p className="text-sm text-muted-foreground">ბოლო 30 დღის ფინანსური სტატისტიკა</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'სულ GMV', value: `₾${(stats?.totalRevenue ?? 0).toLocaleString()}`, sub: 'სულ შემოსავალი', color: 'text-green-500' },
          { label: 'კომისია', value: `₾${totalCommission.toLocaleString()}`, sub: '10% საშუალო', color: 'text-primary' },
          { label: 'გადახდები', value: `₾${totalPayouts.toLocaleString()}`, sub: 'გამყიდველებს', color: 'text-blue-500' },
          { label: 'დაბრუნება', value: `₾${(stats?.totalRefunds ?? 0).toLocaleString()}`, sub: `${stats?.countByStatus?.['refunded'] ?? 0} შეკვეთა`, color: 'text-orange-500' },
        ].map((item) => (
          <Card key={item.label} className="border-border bg-card">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{item.value}</p>
              <p className={cn('mt-0.5 text-xs font-medium', item.color)}>{item.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {analytics && analytics.categories.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">კატეგორიების შემოსავალი</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {analytics.categories.map((cat) => (
                <div key={cat.name} className="rounded-lg border border-border bg-muted p-4">
                  <p className="text-xs font-medium text-foreground">{cat.name}</p>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    ₾{(cat.revenue / 1000).toFixed(1)}k
                  </p>
                  <p className="text-xs text-muted-foreground">{cat.count} შეკვეთა</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">ბოლო შეკვეთები</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="pl-6 text-xs">ID</TableHead>
                  <TableHead className="text-xs">ტიპი</TableHead>
                  <TableHead className="hidden text-xs sm:table-cell">მომხმარებელი</TableHead>
                  <TableHead className="hidden text-xs md:table-cell">პროდუქტი</TableHead>
                  <TableHead className="text-xs">თანხა</TableHead>
                  <TableHead className="text-xs">სტატუსი</TableHead>
                  <TableHead className="pr-6 text-xs">თარიღი</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                      შეკვეთები არ არის
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const txType = TYPE_CONFIG[ORDER_TYPE_MAP[order.status] ?? 'order'];
                    const txStatus = STATUS_CONFIG[ORDER_STATUS_MAP[order.status] ?? 'pending'];
                    return (
                      <TableRow key={order.id} className="border-border">
                        <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                          #{order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', txType.className)}>
                            {txType.label}
                          </span>
                        </TableCell>
                        <TableCell className="hidden text-xs text-foreground sm:table-cell">
                          {order.customer}
                        </TableCell>
                        <TableCell className="hidden text-xs text-foreground md:table-cell">
                          {order.product}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-foreground">
                          ₾{order.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', txStatus.className)}>
                            {txStatus.label}
                          </span>
                        </TableCell>
                        <TableCell className="pr-6 text-xs text-muted-foreground">
                          {new Date(order.date).toLocaleDateString('ka-GE')}
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

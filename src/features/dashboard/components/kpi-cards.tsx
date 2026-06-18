'use client';
import {
  DollarSign,
  type LucideIcon,
  Package,
  ShoppingCart,
  Store,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Card, CardContent } from '@/shared/components/ui/card';
import { http } from '@/shared/lib/http';
import { cn } from '@/shared/lib/utils';

type AdminStats = {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalSellers: number;
  pendingOrders: number;
};

type KpiItem = {
  id: string;
  title: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  iconClass: string;
  trend: 'up' | 'down' | 'neutral';
};

function buildKpis(s: AdminStats): KpiItem[] {
  return [
    {
      id: 'revenue',
      title: 'შემოსავალი',
      value: `₾${s.totalRevenue.toLocaleString()}`,
      sub: 'დასრულებული შეკვეთებიდან',
      icon: DollarSign,
      iconClass: 'text-green-500',
      trend: 'up',
    },
    {
      id: 'orders',
      title: 'შეკვეთები',
      value: s.totalOrders.toLocaleString(),
      sub: `${s.pendingOrders} მოლოდინში`,
      icon: ShoppingCart,
      iconClass: 'text-blue-500',
      trend: s.pendingOrders > 0 ? 'neutral' : 'up',
    },
    {
      id: 'users',
      title: 'მომხმარებლები',
      value: s.totalUsers.toLocaleString(),
      sub: 'სულ რეგისტრირებული',
      icon: Users,
      iconClass: 'text-purple-500',
      trend: 'up',
    },
    {
      id: 'products',
      title: 'პროდუქტები',
      value: s.totalProducts.toLocaleString(),
      sub: 'კატალოგში',
      icon: Package,
      iconClass: 'text-orange-500',
      trend: 'neutral',
    },
    {
      id: 'sellers',
      title: 'გამყიდველები',
      value: s.totalSellers.toLocaleString(),
      sub: 'დარეგისტრირებული',
      icon: Store,
      iconClass: 'text-pink-500',
      trend: 'neutral',
    },
  ];
}

const KpiCard = ({ kpi }: { kpi: KpiItem }) => {
  const Icon = kpi.icon;
  return (
    <Card className="border-border bg-card transition-shadow duration-200 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-muted-foreground">{kpi.title}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{kpi.value}</p>
            <div className="mt-1 flex items-center gap-1">
              {kpi.trend === 'up' && <TrendingUp className="size-3 text-green-500" />}
              {kpi.trend === 'down' && <TrendingDown className="size-3 text-red-500" />}
              <span className="text-xs text-muted-foreground">{kpi.sub}</span>
            </div>
          </div>
          <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted', kpi.iconClass)}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SkeletonCard = () => (
  <Card className="border-border bg-card">
    <CardContent className="p-5">
      <div className="h-3 w-24 rounded bg-muted animate-pulse mb-2" />
      <div className="h-7 w-20 rounded bg-muted animate-pulse mb-2" />
      <div className="h-3 w-32 rounded bg-muted animate-pulse" />
    </CardContent>
  </Card>
);

export const KpiCards = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    http.get<AdminStats>('/admin/stats').then(setStats).catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {buildKpis(stats).map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
    </div>
  );
};

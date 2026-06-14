'use client';
import {
  BarChart2,
  Bell,
  DollarSign,
  List,
  type LucideIcon,
  Package,
  ShoppingCart,
  Store,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';

import { DASHBOARD_KPI_METRICS } from '@/features/dashboard/const/dashboard.const';
import type { KpiMetric } from '@/features/dashboard/types/dashboard.types';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

const ICON_MAP: Record<string, LucideIcon> = {
  'dollar-sign': DollarSign,
  'shopping-cart': ShoppingCart,
  users: Users,
  package: Package,
  store: Store,
  'trending-up': TrendingUp,
  'bar-chart-2': BarChart2,
  list: List,
  bell: Bell,
};

type KpiCardProps = {
  metric: KpiMetric;
};

const KpiCard = ({ metric }: KpiCardProps) => {
  const Icon = ICON_MAP[metric.icon] ?? TrendingUp;
  const isUp = metric.changeType === 'up';
  const isDown = metric.changeType === 'down';

  return (
    <Card className="border-border bg-card transition-shadow duration-200 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-muted-foreground">{metric.title}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{metric.value}</p>
            <div className="mt-1 flex items-center gap-1">
              {isUp && <TrendingUp className="size-3 text-green-500" />}
              {isDown && <TrendingDown className="size-3 text-red-500" />}
              <span
                className={cn(
                  'text-xs font-medium',
                  isUp && 'text-green-500',
                  isDown && 'text-red-500',
                  !isUp && !isDown && 'text-muted-foreground'
                )}
              >
                {metric.change}
              </span>
              <span className="text-xs text-muted-foreground">გასული თვიდან</span>
            </div>
          </div>
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted',
              metric.color
            )}
          >
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const KpiCards = () => (
  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
    {DASHBOARD_KPI_METRICS.map((metric) => (
      <KpiCard key={metric.id} metric={metric} />
    ))}
  </div>
);

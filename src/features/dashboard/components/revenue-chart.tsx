'use client';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';

import {
  REVENUE_DATA_1Y,
  REVENUE_DATA_30D,
  REVENUE_DATA_7D,
} from '@/features/dashboard/const/dashboard.const';
import type { ChartPeriod } from '@/features/dashboard/types/dashboard.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/components/ui/chart';
import { cn } from '@/shared/lib/utils';

const PERIODS: { value: ChartPeriod; label: string }[] = [
  { value: '7d', label: '7 დღე' },
  { value: '30d', label: '30 დღე' },
  { value: '1y', label: '1 წელი' },
];

const DATA_MAP: Record<ChartPeriod, typeof REVENUE_DATA_7D> = {
  '7d': REVENUE_DATA_7D,
  '30d': REVENUE_DATA_30D,
  '1y': REVENUE_DATA_1Y,
};

const revenueChartConfig: ChartConfig = {
  revenue: {
    label: 'შემოსავალი',
    color: 'oklch(0.52 0.233 25)',
  },
};

const ordersChartConfig: ChartConfig = {
  orders: {
    label: 'შეკვეთები',
    color: '#3b82f6',
  },
};

const formatCurrency = (value: number) => `₾${(value / 1000).toFixed(0)}k`;

export const RevenueChart = () => {
  const [period, setPeriod] = useState<ChartPeriod>('30d');
  const data = DATA_MAP[period];

  return (
    <div className="space-y-6">
      {/* Area Chart — Revenue */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold">შემოსავლის დინამიკა</CardTitle>
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              {PERIODS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setPeriod(value)}
                  className={cn(
                    'rounded-md px-3 py-1 text-xs font-medium transition-all duration-150',
                    period === value
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <ChartContainer config={revenueChartConfig} className="h-[260px] w-full">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradientFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.52 0.233 25)" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="oklch(0.52 0.233 25)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      if (name === 'revenue') {
                        return (
                          <div className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-primary" />
                            <span className="text-muted-foreground">შემოსავალი</span>
                            <span className="font-mono font-semibold tabular-nums text-foreground ml-auto">
                              ₾{Number(value).toLocaleString()}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <span className="font-mono font-semibold">{value}</span>
                      );
                    }}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="oklch(0.52 0.233 25)"
                strokeWidth={2}
                fill="url(#revenueGradientFill)"
                dot={false}
                activeDot={{ r: 4, fill: 'oklch(0.52 0.233 25)', strokeWidth: 0 }}
              />
            </AreaChart>
          </ChartContainer>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">შემოსავალი (₾)</span>
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart — Orders */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">შეკვეთების რაოდენობა</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <ChartContainer config={ordersChartConfig} className="h-[220px] w-full">
            <BarChart data={REVENUE_DATA_30D} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <ChartTooltip
                cursor={{ fill: '#f3f4f6' }}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      if (name === 'orders') {
                        return (
                          <div className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-blue-500" />
                            <span className="text-muted-foreground">შეკვეთები</span>
                            <span className="font-mono font-semibold tabular-nums text-foreground ml-auto">
                              {Number(value).toLocaleString()}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <span className="font-mono font-semibold">{value}</span>
                      );
                    }}
                  />
                }
              />
              <Bar
                dataKey="orders"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ChartContainer>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-blue-500" />
            <span className="text-xs text-muted-foreground">შეკვეთები (ბოლო 30 დღე)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

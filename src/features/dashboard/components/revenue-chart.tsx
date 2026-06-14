'use client';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
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

const formatCurrency = (value: number) => `₾${(value / 1000).toFixed(0)}k`;

export const RevenueChart = () => {
  const [period, setPeriod] = useState<ChartPeriod>('30d');
  const data = DATA_MAP[period];

  return (
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
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dd3327" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#dd3327" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
              }}
              formatter={(v, name) => {
                const value = Number(v);
                if (name === 'revenue') return [`₾${value.toLocaleString()}`, 'შემოსავალი'];
                if (name === 'orders') return [value, 'შეკვეთები'];
                return [value, name];
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#dd3327"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#ordersGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">შემოსავალი</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-indigo-500" />
            <span className="text-xs text-muted-foreground">შეკვეთები</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

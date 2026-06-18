'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/ui/chart';
import { http } from '@/shared/lib/http';
import { cn } from '@/shared/lib/utils';

type Period = '7d' | '30d' | '1y';

type RevenuePoint = { label: string; revenue: number; orders: number; commission: number };
type CategoryPoint = { name: string; revenue: number; count: number };
type AnalyticsData = { points: RevenuePoint[]; categories: CategoryPoint[] };

const PIE_COLORS = [
  'oklch(0.52 0.233 25)',
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#a855f7',
  '#ec4899',
  '#14b8a6',
  '#f97316',
];

const revenueChartConfig: ChartConfig = {
  revenue: { label: 'შემოსავალი', color: 'oklch(0.52 0.233 25)' },
  commission: { label: 'საკომისიო', color: '#22c55e' },
};

const ordersChartConfig: ChartConfig = {
  orders: { label: 'შეკვეთები', color: '#3b82f6' },
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const [data, setData] = useState<AnalyticsData>({ points: [], categories: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback((p: Period) => {
    setLoading(true);
    http.get<AnalyticsData>(`/admin/analytics?period=${p}`)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(period); }, [period, fetchData]);

  const categoryChartConfig = Object.fromEntries(
    data.categories.map((cat, i) => [
      cat.name,
      { label: cat.name, color: PIE_COLORS[i % PIE_COLORS.length] },
    ])
  ) satisfies ChartConfig;

  const pieData = data.categories.map((cat) => ({ name: cat.name, value: cat.revenue }));
  const totalCatRevenue = pieData.reduce((s, c) => s + c.value, 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">ანალიტიკა</h2>
        <p className="text-sm text-muted-foreground">საბაზრო მონაცემების ვიზუალიზაცია</p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">შემოსავლის დინამიკა</CardTitle>
            <div className="flex gap-1">
              {(['7d', '30d', '1y'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    'rounded-lg px-3 py-1 text-xs font-medium transition-colors',
                    period === p
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  {p === '7d' ? '7 დღე' : p === '30d' ? '30 დღე' : '1 წელი'}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              იტვირთება...
            </div>
          ) : data.points.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              მონაცემები არ არის ამ პერიოდისთვის
            </div>
          ) : (
            <ChartContainer config={revenueChartConfig} className="h-64 w-full">
              <AreaChart data={data.points} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="fillCommission" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-commission)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-commission)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v: number) => `₾${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        `₾${Number(value).toLocaleString()}`,
                        revenueChartConfig[name as keyof typeof revenueChartConfig]?.label ?? name,
                      ]}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  fill="url(#fillRevenue)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="commission"
                  stroke="var(--color-commission)"
                  strokeWidth={2}
                  fill="url(#fillCommission)"
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">შეკვეთების რაოდენობა</CardTitle>
        </CardHeader>
        <CardContent>
          {loading || data.points.length === 0 ? (
            <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
              {loading ? 'იტვირთება...' : 'მონაცემები არ არის'}
            </div>
          ) : (
            <ChartContainer config={ordersChartConfig} className="h-56 w-full">
              <BarChart data={data.points} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        Number(value),
                        ordersChartConfig[name as keyof typeof ordersChartConfig]?.label ?? name,
                      ]}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">კატეგორიების ანალიზი</CardTitle>
        </CardHeader>
        <CardContent>
          {data.categories.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              {loading ? 'იტვირთება...' : 'შეკვეთების მონაცემები არ არის'}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
              <ChartContainer config={categoryChartConfig} className="h-64 w-full max-w-xs shrink-0">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [
                          `₾${Number(value).toLocaleString()}`,
                          name,
                        ]}
                      />
                    }
                  />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    strokeWidth={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs text-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ChartContainer>

              <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
                {data.categories.map((cat, index) => (
                  <div key={cat.name} className="rounded-xl border border-border bg-muted p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <p className="text-xs font-medium text-foreground">{cat.name}</p>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      ₾{(cat.revenue / 1000).toFixed(1)}k
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {cat.count} შეკვ. •{' '}
                      {totalCatRevenue > 0
                        ? `${Math.round((cat.revenue / totalCatRevenue) * 100)}%`
                        : '0%'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

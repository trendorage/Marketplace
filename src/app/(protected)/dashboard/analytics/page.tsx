'use client';

import { useState } from 'react';
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

import {
  CATEGORY_STATS,
  REVENUE_DATA_1Y,
  REVENUE_DATA_30D,
} from '@/features/dashboard/const/dashboard.const';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/ui/chart';
import { cn } from '@/shared/lib/utils';

type Period = '30d' | '1y';

const revenueChartConfig = {
  revenue: {
    label: 'შემოსავალი',
    color: 'var(--chart-1)',
  },
  commission: {
    label: 'საკომისიო',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

const ordersChartConfig = {
  orders: {
    label: 'შეკვეთები',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

const PIE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  '#a855f7',
];

const categoryChartConfig = Object.fromEntries(
  CATEGORY_STATS.map((cat, i) => [
    cat.name,
    { label: cat.name, color: PIE_COLORS[i % PIE_COLORS.length] },
  ])
) satisfies ChartConfig;

const pieData = CATEGORY_STATS.map((cat) => ({
  name: cat.name,
  value: cat.revenue,
}));

export default function AnalyticsPage() {
  const [revenuePeriod, setRevenuePeriod] = useState<Period>('30d');
  const revenueData = revenuePeriod === '30d' ? REVENUE_DATA_30D : REVENUE_DATA_1Y;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">ანალიტიკა</h2>
        <p className="text-sm text-muted-foreground">საბაზრო მონაცემების ვიზუალიზაცია</p>
      </div>

      {/* Section 1: Revenue + Commission AreaChart */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">შემოსავლის დინამიკა</CardTitle>
            <div className="flex gap-1">
              {(['30d', '1y'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setRevenuePeriod(p)}
                  className={cn(
                    'rounded-lg px-3 py-1 text-xs font-medium transition-colors',
                    revenuePeriod === p
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  {p === '30d' ? '30 დღე' : '1 წელი'}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueChartConfig} className="h-64 w-full">
            <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
        </CardContent>
      </Card>

      {/* Section 2: Orders BarChart */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">შეკვეთები (პერიოდი)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={ordersChartConfig} className="h-56 w-full">
            <BarChart
              data={revenueData}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
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
              <Bar
                dataKey="orders"
                fill="var(--color-orders)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Section 3: Category PieChart */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">კატეგორიების ანალიზი</CardTitle>
        </CardHeader>
        <CardContent>
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
              {CATEGORY_STATS.map((cat, index) => (
                <div
                  key={cat.name}
                  className="rounded-xl border border-border bg-muted p-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <p className="text-xs font-medium text-foreground">{cat.name}</p>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    ₾{(cat.revenue / 1000).toFixed(0)}k
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-green-500">{cat.growth}</p>
                  <p className="text-xs text-muted-foreground">{cat.products} პ.</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

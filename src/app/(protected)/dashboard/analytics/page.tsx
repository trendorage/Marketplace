'use client';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  CATEGORY_STATS,
  REVENUE_DATA_1Y,
  REVENUE_DATA_30D,
} from '@/features/dashboard/const/dashboard.const';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

const USER_GROWTH = [
  { label: 'იან', users: 820 },
  { label: 'თებ', users: 940 },
  { label: 'მარ', users: 1100 },
  { label: 'აპრ', users: 1350 },
  { label: 'მაი', users: 1200 },
  { label: 'ივნ', users: 1580 },
  { label: 'ივლ', users: 1920 },
  { label: 'აგვ', users: 1740 },
  { label: 'სექ', users: 2100 },
  { label: 'ოქტ', users: 2380 },
  { label: 'ნოე', users: 2650 },
  { label: 'დეკ', users: 2940 },
];

type Period = '30d' | '1y';

export default function AnalyticsPage() {
  const [revenuePeriod, setRevenuePeriod] = useState<Period>('30d');
  const revenueData = revenuePeriod === '30d' ? REVENUE_DATA_30D : REVENUE_DATA_1Y;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">ანალიტიკა</h2>
        <p className="text-sm text-muted-foreground">საბაზრო მონაცემების ვიზუალიზაცია</p>
      </div>

      {/* Revenue chart */}
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
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dd3327" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#dd3327" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={(v: number) => `₾${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                formatter={(v) => [`₾${Number(v).toLocaleString()}`, 'შემოსავალი']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#dd3327" strokeWidth={2} fill="url(#grad1)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Orders chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">შეკვეთები (წლიური)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={REVENUE_DATA_1Y} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                  formatter={(v) => [Number(v), 'შეკვეთები']}
                />
                <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User growth chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">მომხმარებლების ზრდა</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={USER_GROWTH} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                  formatter={(v) => [Number(v), 'მომხმარებლები']}
                />
                <Area type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} fill="url(#grad2)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category breakdown */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">კატეგორიების ანალიზი</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORY_STATS.map((cat) => (
              <div key={cat.name} className="rounded-xl border border-border bg-muted p-4 text-center">
                <p className="text-xs font-medium text-foreground">{cat.name}</p>
                <p className="mt-2 text-lg font-bold text-foreground">
                  ₾{(cat.revenue / 1000).toFixed(0)}k
                </p>
                <p className="mt-0.5 text-xs font-medium text-green-500">{cat.growth}</p>
                <p className="text-xs text-muted-foreground">{cat.products} პ.</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

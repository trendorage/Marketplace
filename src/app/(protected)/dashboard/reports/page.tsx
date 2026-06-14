'use client';
import { Download, FileText, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

import {
  CATEGORY_STATS,
  REVENUE_DATA_1Y,
  SELLERS_LIST,
  USERS_LIST,
} from '@/features/dashboard/const/dashboard.const';
import { Button } from '@/shared/components/ui/button';
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

type ReportType = 'sales' | 'users' | 'sellers' | 'categories';

const REPORT_TABS: { id: ReportType; label: string; icon: typeof FileText }[] = [
  { id: 'sales', label: 'გაყიდვები', icon: TrendingUp },
  { id: 'users', label: 'მომხმარებლები', icon: Users },
  { id: 'sellers', label: 'გამყიდველები', icon: FileText },
  { id: 'categories', label: 'კატეგორიები', icon: FileText },
];

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('sales');

  const totalRevenue = REVENUE_DATA_1Y.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = REVENUE_DATA_1Y.reduce((sum, d) => sum + d.orders, 0);
  const avgOrderValue = Math.round(totalRevenue / totalOrders);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">ანგარიშები</h2>
          <p className="text-sm text-muted-foreground">ბიზნეს მონაცემების ვრცელი ანგარიშები</p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-border text-sm"
        >
          <Download className="size-4" />
          CSV გადმოტვირთვა
        </Button>
      </div>

      {/* Report type tabs */}
      <div className="flex flex-wrap gap-1">
        {REPORT_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                activeReport === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="size-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sales report */}
      {activeReport === 'sales' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: 'წლიური შემოსავალი', value: `₾${(totalRevenue / 1000).toFixed(0)}k` },
              { label: 'სულ შეკვეთები', value: totalOrders },
              { label: 'საშ. შეკვეთის ღირ.', value: `₾${avgOrderValue}` },
            ].map((kpi) => (
              <Card key={kpi.label} className="border-border bg-card">
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">თვიური გაყიდვების ანგარიში</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="pl-6 text-xs">თვე</TableHead>
                      <TableHead className="text-xs">შემოსავალი</TableHead>
                      <TableHead className="text-xs">შეკვეთები</TableHead>
                      <TableHead className="pr-6 text-xs">საშ. ღირებულება</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {REVENUE_DATA_1Y.map((row) => (
                      <TableRow key={row.label} className="border-border">
                        <TableCell className="pl-6 text-sm font-medium text-foreground">{row.label}</TableCell>
                        <TableCell className="text-sm font-semibold text-foreground">
                          ₾{row.revenue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">{row.orders}</TableCell>
                        <TableCell className="pr-6 text-sm text-muted-foreground">
                          ₾{Math.round(row.revenue / row.orders)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users report */}
      {activeReport === 'users' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: 'სულ მომხმარებელი', value: USERS_LIST.length },
              { label: 'აქტიური', value: USERS_LIST.filter((u) => u.status === 'active').length },
              { label: 'ახალი (30 დღე)', value: 3 },
            ].map((kpi) => (
              <Card key={kpi.label} className="border-border bg-card">
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">მომხმარებლების ანგარიში</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="pl-6 text-xs">სახელი</TableHead>
                      <TableHead className="text-xs">Email</TableHead>
                      <TableHead className="hidden text-xs sm:table-cell">როლი</TableHead>
                      <TableHead className="hidden text-xs md:table-cell">შეკვეთები</TableHead>
                      <TableHead className="pr-6 text-xs">სტატუსი</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {USERS_LIST.map((user) => (
                      <TableRow key={user.id} className="border-border">
                        <TableCell className="pl-6 text-sm font-medium text-foreground">{user.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{user.email}</TableCell>
                        <TableCell className="hidden text-xs text-foreground sm:table-cell capitalize">{user.role}</TableCell>
                        <TableCell className="hidden text-sm text-foreground md:table-cell">{user.orders}</TableCell>
                        <TableCell className="pr-6">
                          <span className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          )}>
                            {user.status === 'active' ? 'აქტიური' : 'დაბლოკილი'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sellers report */}
      {activeReport === 'sellers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: 'სულ გამყიდველი', value: SELLERS_LIST.length },
              { label: 'სულ შემოსავალი', value: `₾${(SELLERS_LIST.reduce((s, x) => s + x.revenue, 0) / 1000).toFixed(0)}k` },
              { label: 'საშ. რეიტინგი', value: (SELLERS_LIST.reduce((s, x) => s + x.rating, 0) / SELLERS_LIST.length).toFixed(1) },
            ].map((kpi) => (
              <Card key={kpi.label} className="border-border bg-card">
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">გამყიდველების ანგარიში</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="pl-6 text-xs">სახელი</TableHead>
                      <TableHead className="text-xs">მაღაზია</TableHead>
                      <TableHead className="hidden text-xs sm:table-cell">პროდუქტები</TableHead>
                      <TableHead className="text-xs">შემოსავალი</TableHead>
                      <TableHead className="pr-6 text-xs">სტატუსი</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SELLERS_LIST.map((seller) => (
                      <TableRow key={seller.id} className="border-border">
                        <TableCell className="pl-6 text-sm font-medium text-foreground">{seller.name}</TableCell>
                        <TableCell className="text-sm text-foreground">{seller.storeName}</TableCell>
                        <TableCell className="hidden text-sm text-foreground sm:table-cell">{seller.products}</TableCell>
                        <TableCell className="text-sm font-semibold text-foreground">
                          ₾{seller.revenue.toLocaleString()}
                        </TableCell>
                        <TableCell className="pr-6">
                          <span className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            seller.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : seller.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          )}>
                            {seller.status === 'active' ? 'აქტიური' : seller.status === 'pending' ? 'მოლოდინში' : 'შეჩერებული'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Categories report */}
      {activeReport === 'categories' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: 'კატეგორიები', value: CATEGORY_STATS.length },
              { label: 'სულ პროდუქტი', value: CATEGORY_STATS.reduce((s, c) => s + c.products, 0) },
              { label: 'სულ შემოსავალი', value: `₾${(CATEGORY_STATS.reduce((s, c) => s + c.revenue, 0) / 1000).toFixed(0)}k` },
            ].map((kpi) => (
              <Card key={kpi.label} className="border-border bg-card">
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">კატეგორიების ანგარიში</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="pl-6 text-xs">კატეგორია</TableHead>
                      <TableHead className="text-xs">პროდუქტები</TableHead>
                      <TableHead className="text-xs">შემოსავალი</TableHead>
                      <TableHead className="pr-6 text-xs">ზრდა</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CATEGORY_STATS.map((cat) => (
                      <TableRow key={cat.name} className="border-border">
                        <TableCell className="pl-6 text-sm font-medium text-foreground">{cat.name}</TableCell>
                        <TableCell className="text-sm text-foreground">{cat.products}</TableCell>
                        <TableCell className="text-sm font-semibold text-foreground">
                          ₾{cat.revenue.toLocaleString()}
                        </TableCell>
                        <TableCell className="pr-6 text-sm font-medium text-green-600">{cat.growth}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

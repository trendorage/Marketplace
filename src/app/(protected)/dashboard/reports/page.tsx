'use client';
import { Download, FileText, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

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
import { http } from '@/shared/lib/http';
import { cn } from '@/shared/lib/utils';

type ReportType = 'sales' | 'users' | 'sellers' | 'categories';

type RevenuePoint = { label: string; revenue: number; orders: number; commission: number };
type CategoryPoint = { name: string; revenue: number; count: number };

type AnalyticsData = {
  points: RevenuePoint[];
  categories: CategoryPoint[];
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

type UsersResponse = { users: User[]; total: number };

type Seller = {
  id: string;
  name: string;
  email: string;
  storeName: string;
  products: number;
  revenue: number;
  rating: number;
  status: string;
};

type SellersResponse = { sellers: Seller[] };

const REPORT_TABS: { id: ReportType; label: string; icon: typeof FileText }[] = [
  { id: 'sales', label: 'გაყიდვები', icon: TrendingUp },
  { id: 'users', label: 'მომხმარებლები', icon: Users },
  { id: 'sellers', label: 'გამყიდველები', icon: FileText },
  { id: 'categories', label: 'კატეგორიები', icon: FileText },
];

function exportCSV(headers: string[], rows: string[][], filename: string) {
  const lines = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('sales');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [analyticsData, usersData, sellersData] = await Promise.all([
          http.get<AnalyticsData>('/admin/analytics', { params: { period: '1y' } }),
          http.get<UsersResponse>('/users', { params: { limit: 100, page: 1 } }),
          http.get<SellersResponse>('/sellers'),
        ]);
        setAnalytics(analyticsData);
        setUsers(usersData.users);
        setSellers(sellersData.sellers);
      } catch {
        setError('მონაცემების ჩატვირთვა ვერ მოხდა');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const totalRevenue = analytics?.points.reduce((s, d) => s + d.revenue, 0) ?? 0;
  const totalOrders = analytics?.points.reduce((s, d) => s + d.orders, 0) ?? 0;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  function handleCSV() {
    if (activeReport === 'sales' && analytics) {
      exportCSV(
        ['თვე', 'შემოსავალი', 'შეკვეთები', 'საშ. ღირებულება'],
        analytics.points.map((r) => [r.label, String(r.revenue), String(r.orders), String(Math.round(r.revenue / (r.orders || 1)))]),
        'sales-report.csv'
      );
    } else if (activeReport === 'users') {
      exportCSV(
        ['სახელი', 'Email', 'როლი', 'სტატუსი'],
        users.map((u) => [u.name, u.email, u.role, u.status]),
        'users-report.csv'
      );
    } else if (activeReport === 'sellers') {
      exportCSV(
        ['სახელი', 'მაღაზია', 'პროდუქტები', 'შემოსავალი', 'სტატუსი'],
        sellers.map((s) => [s.name, s.storeName, String(s.products), String(s.revenue), s.status]),
        'sellers-report.csv'
      );
    } else if (activeReport === 'categories' && analytics) {
      exportCSV(
        ['კატეგორია', 'შეკვეთები', 'შემოსავალი'],
        analytics.categories.map((c) => [c.name, String(c.count), String(c.revenue)]),
        'categories-report.csv'
      );
    }
  }

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
          onClick={handleCSV}
          disabled={loading}
        >
          <Download className="size-4" />
          CSV გადმოტვირთვა
        </Button>
      </div>

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

      {loading && (
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {error && !loading && (
        <Card className="border-border bg-card">
          <CardContent className="p-6 text-center text-sm text-red-500">{error}</CardContent>
        </Card>
      )}

      {!loading && !error && activeReport === 'sales' && (
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
              <CardTitle className="text-base">გაყიდვების ანგარიში</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="pl-6 text-xs">პერიოდი</TableHead>
                      <TableHead className="text-xs">შემოსავალი</TableHead>
                      <TableHead className="text-xs">შეკვეთები</TableHead>
                      <TableHead className="pr-6 text-xs">საშ. ღირებულება</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(analytics?.points ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                          მონაცემები არ არის
                        </TableCell>
                      </TableRow>
                    ) : (
                      (analytics?.points ?? []).map((row) => (
                        <TableRow key={row.label} className="border-border">
                          <TableCell className="pl-6 text-sm font-medium text-foreground">{row.label}</TableCell>
                          <TableCell className="text-sm font-semibold text-foreground">₾{row.revenue.toLocaleString()}</TableCell>
                          <TableCell className="text-sm text-foreground">{row.orders}</TableCell>
                          <TableCell className="pr-6 text-sm text-muted-foreground">
                            ₾{Math.round(row.revenue / (row.orders || 1))}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && !error && activeReport === 'users' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: 'სულ მომხმარებელი', value: users.length },
              { label: 'აქტიური', value: users.filter((u) => u.status === 'active').length },
              { label: 'ადმინი', value: users.filter((u) => u.role === 'admin').length },
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
                      <TableHead className="pr-6 text-xs">სტატუსი</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                          მომხმარებლები არ არის
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id} className="border-border">
                          <TableCell className="pl-6 text-sm font-medium text-foreground">{user.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{user.email}</TableCell>
                          <TableCell className="hidden text-xs capitalize text-foreground sm:table-cell">{user.role}</TableCell>
                          <TableCell className="pr-6">
                            <span className={cn(
                              'rounded-full px-2 py-0.5 text-xs font-medium',
                              user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            )}>
                              {user.status === 'active' ? 'აქტიური' : 'დაბლოკილი'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && !error && activeReport === 'sellers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: 'სულ გამყიდველი', value: sellers.length },
              { label: 'სულ შემოსავალი', value: `₾${(sellers.reduce((s, x) => s + x.revenue, 0) / 1000).toFixed(0)}k` },
              { label: 'საშ. რეიტინგი', value: sellers.length > 0 ? (sellers.reduce((s, x) => s + x.rating, 0) / sellers.length).toFixed(1) : '0' },
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
                    {sellers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                          გამყიდველები არ არის
                        </TableCell>
                      </TableRow>
                    ) : (
                      sellers.map((seller) => (
                        <TableRow key={seller.id} className="border-border">
                          <TableCell className="pl-6 text-sm font-medium text-foreground">{seller.name}</TableCell>
                          <TableCell className="text-sm text-foreground">{seller.storeName}</TableCell>
                          <TableCell className="hidden text-sm text-foreground sm:table-cell">{seller.products}</TableCell>
                          <TableCell className="text-sm font-semibold text-foreground">₾{seller.revenue.toLocaleString()}</TableCell>
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && !error && activeReport === 'categories' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: 'კატეგორიები', value: analytics?.categories.length ?? 0 },
              { label: 'სულ შეკვეთები', value: analytics?.categories.reduce((s, c) => s + c.count, 0) ?? 0 },
              { label: 'სულ შემოსავალი', value: `₾${((analytics?.categories.reduce((s, c) => s + c.revenue, 0) ?? 0) / 1000).toFixed(0)}k` },
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
                      <TableHead className="text-xs">შეკვეთები</TableHead>
                      <TableHead className="pr-6 text-xs">შემოსავალი</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(analytics?.categories ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                          მონაცემები არ არის
                        </TableCell>
                      </TableRow>
                    ) : (
                      (analytics?.categories ?? []).map((cat) => (
                        <TableRow key={cat.name} className="border-border">
                          <TableCell className="pl-6 text-sm font-medium text-foreground">{cat.name}</TableCell>
                          <TableCell className="text-sm text-foreground">{cat.count}</TableCell>
                          <TableCell className="pr-6 text-sm font-semibold text-foreground">
                            ₾{cat.revenue.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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

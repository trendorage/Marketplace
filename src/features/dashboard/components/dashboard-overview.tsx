'use client';
import { CategoryStats } from '@/features/dashboard/components/category-stats';
import { KpiCards } from '@/features/dashboard/components/kpi-cards';
import { RecentOrdersTable } from '@/features/dashboard/components/recent-orders-table';
import { RevenueChart } from '@/features/dashboard/components/revenue-chart';
import { TopProductsTable } from '@/features/dashboard/components/top-products-table';

type DashboardOverviewProps = {
  userName: string;
};

export const DashboardOverview = ({ userName }: DashboardOverviewProps) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold text-foreground">გამარჯობა, {userName} 👋</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">Trendora Marketplace — ადმინ პანელი</p>
    </div>

    <KpiCards />

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <RevenueChart />
      </div>
      <CategoryStats />
    </div>

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <RecentOrdersTable />
      <TopProductsTable />
    </div>
  </div>
);

'use client';
import { CATEGORY_STATS, TRANSACTIONS } from '@/features/dashboard/const/dashboard.const';
import type { TransactionStatus, TransactionType } from '@/features/dashboard/types/dashboard.types';
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

const TYPE_CONFIG: Record<TransactionType, { label: string; className: string }> = {
  order: { label: 'შეკვეთა', className: 'bg-blue-100 text-blue-800' },
  payout: { label: 'გადახდა', className: 'bg-purple-100 text-purple-800' },
  refund: { label: 'დაბრუნება', className: 'bg-orange-100 text-orange-800' },
  commission: { label: 'კომისია', className: 'bg-green-100 text-green-800' },
};

const STATUS_CONFIG: Record<TransactionStatus, { label: string; className: string }> = {
  completed: { label: 'დასრულდა', className: 'bg-green-100 text-green-800' },
  pending: { label: 'მოლოდინში', className: 'bg-yellow-100 text-yellow-800' },
  failed: { label: 'ჩავარდა', className: 'bg-red-100 text-red-800' },
};

const totalRevenue = 142850;
const totalCommission = 14285;
const totalPayouts = 14482;
const totalRefunds = 780;

export default function FinancialPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">ფინანსური მიმოხილვა</h2>
        <p className="text-sm text-muted-foreground">ბოლო 30 დღის ფინანსური სტატისტიკა</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'სულ GMV', value: `₾${totalRevenue.toLocaleString()}`, sub: '+18.2%', color: 'text-green-500' },
          { label: 'კომისია', value: `₾${totalCommission.toLocaleString()}`, sub: '10% საშუალო', color: 'text-primary' },
          { label: 'გადახდები', value: `₾${totalPayouts.toLocaleString()}`, sub: 'გამყიდველებს', color: 'text-blue-500' },
          { label: 'დაბრუნება', value: `₾${totalRefunds.toLocaleString()}`, sub: '2 შეკვეთა', color: 'text-orange-500' },
        ].map((item) => (
          <Card key={item.label} className="border-border bg-card">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{item.value}</p>
              <p className={cn('mt-0.5 text-xs font-medium', item.color)}>{item.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Revenue */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">კატეგორიების შემოსავალი</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {CATEGORY_STATS.map((cat) => (
              <div
                key={cat.name}
                className="rounded-lg border border-border bg-muted p-4"
              >
                <p className="text-xs font-medium text-foreground">{cat.name}</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  ₾{(cat.revenue / 1000).toFixed(0)}k
                </p>
                <p className="mt-0.5 text-xs font-medium text-green-500">{cat.growth}</p>
                <p className="text-xs text-muted-foreground">{cat.products} პროდუქტი</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">ბოლო ტრანზაქციები</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="pl-6 text-xs">ID</TableHead>
                  <TableHead className="text-xs">ტიპი</TableHead>
                  <TableHead className="hidden text-xs sm:table-cell">გამგზავნი</TableHead>
                  <TableHead className="hidden text-xs md:table-cell">მიმღები</TableHead>
                  <TableHead className="text-xs">თანხა</TableHead>
                  <TableHead className="text-xs">სტატუსი</TableHead>
                  <TableHead className="pr-6 text-xs">თარიღი</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TRANSACTIONS.map((tx) => {
                  const type = TYPE_CONFIG[tx.type];
                  const status = STATUS_CONFIG[tx.status];
                  return (
                    <TableRow key={tx.id} className="border-border">
                      <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                        #{tx.id}
                      </TableCell>
                      <TableCell>
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', type.className)}>
                          {type.label}
                        </span>
                      </TableCell>
                      <TableCell className="hidden text-xs text-foreground sm:table-cell">
                        {tx.from}
                      </TableCell>
                      <TableCell className="hidden text-xs text-foreground md:table-cell">
                        {tx.to}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-foreground">
                        ₾{tx.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', status.className)}>
                          {status.label}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6 text-xs text-muted-foreground">{tx.date}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

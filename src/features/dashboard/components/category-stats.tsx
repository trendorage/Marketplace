'use client';
import { TrendingUp } from 'lucide-react';

import { CATEGORY_STATS } from '@/features/dashboard/const/dashboard.const';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';

export const CategoryStats = () => (
  <Card className="border-border bg-card">
    <CardHeader className="pb-3">
      <CardTitle className="text-base font-semibold">ტოპ კატეგორიები</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {CATEGORY_STATS.map((cat, i) => {
        const maxRevenue = CATEGORY_STATS[0]?.revenue ?? 1;
        const pct = Math.round((cat.revenue / maxRevenue) * 100);
        return (
          <div key={cat.name}>
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center text-xs font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-foreground">{cat.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="size-3 text-green-500" />
                <span className="text-xs font-medium text-green-500">{cat.growth}</span>
                <span className="text-xs text-muted-foreground">
                  ₾{(cat.revenue / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
        );
      })}
    </CardContent>
  </Card>
);

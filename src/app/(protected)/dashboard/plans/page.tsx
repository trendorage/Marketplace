'use client';
import { Check, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { PlanFormDialog } from '@/features/plans/components/plan-form-dialog';
import type { Plan } from '@/features/plans/types/plan.types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { http } from '@/shared/lib/http';

const BILLING_CYCLE_LABELS: Record<string, string> = {
  monthly: 'თვე',
  yearly: 'წელი',
  'one-time': 'ერთჯერადი',
};

function formatLimit(value: number): string {
  return value === -1 ? '∞' : String(value);
}

function PlanCardSkeleton() {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-8" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await http.get<{ plans: Plan[] }>('/plans');
      setPlans(res.plans);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleOpenAdd = () => {
    setEditPlan(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setEditPlan(plan);
    setDialogOpen(true);
  };

  const handleDelete = async (plan: Plan) => {
    const confirmed = window.confirm(
      `პლანი "${plan.name}" წაიშლება. დარწმუნებული ხართ?`
    );
    if (!confirmed) return;

    setDeletingId(plan.id);
    try {
      await http.delete(`/plans/${plan.id}`);
      setPlans((prev) => prev.filter((p) => p.id !== plan.id));
    } catch {
      // deletion failed silently — list will stay unchanged
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    setTogglingId(plan.id);
    try {
      const updated = await http.put<Plan>(`/plans/${plan.id}`, {
        isActive: !plan.isActive,
      });
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? updated : p)));
    } catch {
      // toggle failed silently
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">ფასიანი პლანები</h2>
          <p className="text-sm text-muted-foreground">სულ {plans.length} პლანი</p>
        </div>
        <Button onClick={handleOpenAdd} size="sm" className="gap-1.5">
          <Plus className="size-4" />
          პლანის დამატება
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <PlanCardSkeleton key={i} />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-16">
            <div className="flex flex-col items-center gap-3 text-center">
              <Star className="size-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">პლანები არ მოიძებნა</p>
              <p className="text-xs text-muted-foreground">
                დაამატეთ პირველი ფასიანი პლანი
              </p>
              <Button onClick={handleOpenAdd} size="sm" className="mt-1 gap-1.5">
                <Plus className="size-4" />
                პლანის დამატება
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative border-border transition-opacity ${
                !plan.isActive ? 'opacity-60' : ''
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <Badge className="gap-1 bg-primary text-primary-foreground">
                    <Star className="size-3 fill-current" />
                    პოპულარული
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-3 pt-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-foreground">{plan.name}</p>
                  <Badge
                    variant={plan.isActive ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {plan.isActive ? 'აქტიური' : 'გამორთული'}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.currency}</span>
                  {plan.billingCycle !== 'one-time' && (
                    <span className="text-sm text-muted-foreground">
                      / {BILLING_CYCLE_LABELS[plan.billingCycle]}
                    </span>
                  )}
                </div>
                {plan.description && (
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {plan.features.length > 0 && (
                  <ul className="space-y-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-foreground">
                        <Check className="size-3 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>პროდუქტები:</span>
                    <span className="font-medium">{formatLimit(plan.limits.products)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>შეკვეთები:</span>
                    <span className="font-medium">{formatLimit(plan.limits.orders)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>მეხსიერება:</span>
                    <span className="font-medium">{plan.limits.storage} MB</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => handleToggleActive(plan)}
                    disabled={togglingId === plan.id}
                  >
                    {togglingId === plan.id
                      ? '...'
                      : plan.isActive
                        ? 'გამორთვა'
                        : 'ჩართვა'}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    onClick={() => handleOpenEdit(plan)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(plan)}
                    disabled={deletingId === plan.id}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PlanFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchPlans}
        editPlan={editPlan}
      />
    </div>
  );
}

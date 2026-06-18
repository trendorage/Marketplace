'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import type { Plan } from '@/features/plans/types/plan.types';
import {
  CreatePlanSchema,
  CreatePlanType,
} from '@/features/plans/validations/plan.validation';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { http } from '@/shared/lib/http';

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editPlan?: Plan | null;
};

type FormBodyProps = {
  editPlan?: Plan | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

type FormValues = CreatePlanType;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function buildDefaults(plan?: Plan | null): FormValues {
  if (plan) {
    return {
      name: plan.name,
      slug: plan.slug,
      price: plan.price,
      billingCycle: plan.billingCycle,
      currency: plan.currency,
      description: plan.description,
      features: plan.features,
      limits: plan.limits,
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      order: plan.order,
    };
  }
  return {
    name: '',
    slug: '',
    price: 0,
    billingCycle: 'monthly',
    currency: 'GEL',
    description: '',
    features: [],
    limits: { products: -1, orders: -1, storage: 1024 },
    isActive: true,
    isPopular: false,
    order: 0,
  };
}

const PlanFormBody = ({ editPlan, onOpenChange, onSuccess }: FormBodyProps) => {
  const isEdit = Boolean(editPlan);
  const [featuresText, setFeaturesText] = useState(
    () => editPlan?.features.join(', ') ?? ''
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(CreatePlanSchema),
    defaultValues: buildDefaults(editPlan),
  });

  const handleNameChange = (value: string, onChange: (v: string) => void) => {
    onChange(value);
    if (!isEdit) {
      form.setValue('slug', slugify(value), { shouldValidate: false });
    }
  };

  const handleFeaturesChange = (value: string) => {
    setFeaturesText(value);
    form.setValue(
      'features',
      value.split(',').map((f) => f.trim()).filter(Boolean)
    );
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEdit && editPlan) {
        await http.put(`/plans/${editPlan.id}`, data);
      } else {
        await http.post('/plans', data);
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      form.setError('slug', {
        message:
          msg === 'SLUG_TAKEN' ? 'ეს slug უკვე გამოყენებულია' : 'შეცდომა. სცადეთ თავიდან.',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>სახელი</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Basic Plan"
                    {...field}
                    onChange={(e) => handleNameChange(e.target.value, field.onChange)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Slug (URL)</FormLabel>
                <FormControl>
                  <Input placeholder="basic-plan" {...field} />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  მხოლოდ a-z, 0-9, -. ავტომატურად ივსება სახელიდან.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ფასი</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(+e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ვალუტა</FormLabel>
                <FormControl>
                  <Input placeholder="GEL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billingCycle"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>გადახდის ციკლი</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="აირჩიეთ" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="monthly">ყოველთვიური</SelectItem>
                    <SelectItem value="yearly">ყოველწლიური</SelectItem>
                    <SelectItem value="one-time">ერთჯერადი</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>აღწერა</FormLabel>
              <FormControl>
                <Input placeholder="პლანის მოკლე აღწერა..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>ფუნქციები (მძიმით გამოყოფილი)</FormLabel>
          <FormControl>
            <Input
              placeholder="10 პროდუქტი, ანალიტიკა, ტექნიკური მხარდაჭერა"
              value={featuresText}
              onChange={(e) => handleFeaturesChange(e.target.value)}
            />
          </FormControl>
          <p className="text-xs text-muted-foreground">
            თითოეული ფუნქცია გამოყავით მძიმით. მაგ: ანალიტიკა, API წვდომა
          </p>
        </FormItem>

        <div className="space-y-2">
          <p className="text-sm font-medium">ლიმიტები</p>
          <div className="grid grid-cols-3 gap-3">
            <FormField
              control={form.control}
              name="limits.products"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">პროდუქტები (-1 = ∞)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={-1}
                      {...field}
                      onChange={(e) => field.onChange(+e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="limits.orders"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">შეკვეთები (-1 = ∞)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={-1}
                      {...field}
                      onChange={(e) => field.onChange(+e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="limits.storage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">მეხსიერება (MB)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(+e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>თანმიმდევრობა</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(+e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-6">
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="cursor-pointer">აქტიური</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isPopular"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="cursor-pointer">პოპულარული</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            გაუქმება
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'ინახება...' : isEdit ? 'განახლება' : 'დამატება'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export const PlanFormDialog = ({ open, onOpenChange, onSuccess, editPlan }: DialogProps) => {
  const isEdit = Boolean(editPlan);
  const formKey = editPlan?.id ?? 'new';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'პლანის რედაქტირება' : 'ახალი პლანი'}</DialogTitle>
        </DialogHeader>
        <PlanFormBody
          key={formKey}
          editPlan={editPlan}
          onOpenChange={onOpenChange}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

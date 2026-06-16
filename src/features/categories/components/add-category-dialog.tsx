'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  CreateCategorySchema,
  CreateCategoryType,
} from '@/features/categories/validations/category.validation';
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
import { http } from '@/shared/lib/http';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export const AddCategoryDialog = ({ open, onOpenChange, onSuccess }: Props) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateCategoryType>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: { key: '', label: '', order: 0 },
  });

  const onSubmit = async (data: CreateCategoryType) => {
    setSubmitting(true);
    setError(null);
    try {
      await http.post('/categories', data);
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg === 'KEY_TAKEN' ? 'ეს key უკვე გამოყენებულია' : 'შეცდომა. სცადეთ თავიდან.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>კატეგორიის დამატება</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>სახელი (ქართული)</FormLabel>
                  <FormControl>
                    <Input placeholder="მობილურები და პლანშეტები" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key (URL სახელი)</FormLabel>
                  <FormControl>
                    <Input placeholder="mobile-phones" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    მხოლოდ ლათინური სიმბოლოები, ციფრები და -. მაგ: mobile-phones
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                გაუქმება
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'ინახება...' : 'დამატება'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

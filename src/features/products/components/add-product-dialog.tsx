'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { CreateProductSchema, CreateProductType } from '@/features/products/validations/product.validation';
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
import { MARKET_CATEGORIES } from '@/shared/const/navigation.const';
import { http } from '@/shared/lib/http';

const STATUS_OPTIONS = [
  { value: 'active', label: 'აქტიური' },
  { value: 'draft', label: 'დრაფტი' },
  { value: 'pending', label: 'მოლოდინში' },
  { value: 'out_of_stock', label: 'ამოწურულია' },
] as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export const AddProductDialog = ({ open, onOpenChange, onSuccess }: Props) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateProductType>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: { name: '', price: 0, stock: 0, category: '', status: 'draft', image: '' },
  });

  const onSubmit = async (data: CreateProductType) => {
    setSubmitting(true);
    setError(null);
    try {
      await http.post('/products', data);
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'შეცდომა. სცადეთ თავიდან.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>პროდუქტის დამატება</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>სახელი</FormLabel>
                  <FormControl>
                    <Input placeholder="პროდუქტის სახელი" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ფასი (₾)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
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
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>მარაგი</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        {...field}
                        onChange={(e) => field.onChange(+e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>კატეგორია</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="კატეგორია" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MARKET_CATEGORIES.map((c) => (
                        <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>სტატუსი</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>სურათი (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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

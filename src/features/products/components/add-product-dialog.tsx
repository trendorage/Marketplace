'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateProductType>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: { name: '', price: 0, stock: 0, category: '', status: 'draft', image: '' },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/products/upload', { method: 'POST', body: fd });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'upload failed');
      form.setValue('image', data.url ?? '', { shouldValidate: true });
    } catch {
      setUploadError('ატვირთვა ვერ მოხდა');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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

  const imageValue = form.watch('image');

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
                  <FormLabel>სურათი</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="https://... ან ატვირთე ფაილი" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        title="ატვირთე კომპიუტერიდან"
                      >
                        {uploading
                          ? <Loader2 className="size-4 animate-spin" />
                          : <Upload className="size-4" />}
                      </Button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    {uploadError && (
                      <p className="text-xs text-destructive">{uploadError}</p>
                    )}
                    {imageValue && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageValue}
                        alt="preview"
                        className="h-20 w-20 rounded-md border border-border object-cover"
                      />
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                გაუქმება
              </Button>
              <Button type="submit" disabled={submitting || uploading}>
                {submitting ? 'ინახება...' : 'დამატება'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

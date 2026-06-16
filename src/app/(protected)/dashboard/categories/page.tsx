'use client';
import { Download, Plus, Tag, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { AddCategoryDialog } from '@/features/categories/components/add-category-dialog';
import type { Category } from '@/features/categories/types/category.types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { http } from '@/shared/lib/http';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await http.get<{ categories: Category[] }>('/categories');
      setCategories(res.categories);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      await http.put('/categories', {});
      await fetchCategories();
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await http.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">კატეგორიების მართვა</h2>
          <p className="text-sm text-muted-foreground">სულ {categories.length} კატეგორია</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDefaults}
            disabled={seeding}
            className="gap-1.5"
          >
            <Download className="size-4" />
            {seeding ? 'იმპორტდება...' : 'ნაგულისხმევი 19'}
          </Button>
          <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1.5">
            <Plus className="size-4" />
            კატეგორიის დამატება
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">იტვირთება...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="pl-6 text-xs">სახელი</TableHead>
                    <TableHead className="text-xs">Key</TableHead>
                    <TableHead className="hidden text-xs md:table-cell">URL</TableHead>
                    <TableHead className="hidden text-xs sm:table-cell">თანმ.</TableHead>
                    <TableHead className="pr-6 text-xs" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Tag className="size-10 text-muted-foreground/30" />
                          <p className="text-sm text-muted-foreground">
                            კატეგორიები არ მოიძებნა
                          </p>
                          <p className="text-xs text-muted-foreground">
                            დაამატეთ ახალი ან იმპორტი გააკეთეთ ნაგულისხმევი 19
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((cat) => (
                      <TableRow key={cat.id} className="border-border">
                        <TableCell className="pl-6">
                          <p className="text-xs font-medium text-foreground">{cat.label}</p>
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                            {cat.key}
                          </code>
                        </TableCell>
                        <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                          {cat.href}
                        </TableCell>
                        <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                          {cat.order}
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(cat.id)}
                            disabled={deletingId === cat.id}
                            className="size-7 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchCategories}
      />
    </div>
  );
}

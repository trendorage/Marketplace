'use client';
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import type { Content, ContentType } from '@/features/content/types/content.types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { http } from '@/shared/lib/http';

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  text: 'ტექსტი',
  richtext: 'Rich Text',
  image: 'სურათი',
  json: 'JSON',
};

type FormState = {
  key: string;
  title: string;
  type: ContentType;
  value: string;
  isActive: boolean;
};

const defaultForm: FormState = {
  key: '',
  title: '',
  type: 'text',
  value: '',
  isActive: true,
};

type DialogMode = 'add' | 'edit' | null;

export default function ContentPage() {
  const [items, setItems] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await http.get<{ items: Content[] }>('/content');
      setItems(res.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openAdd = () => {
    setForm(defaultForm);
    setFormError(null);
    setDialogMode('add');
  };

  const openEdit = (item: Content) => {
    setForm({
      key: item.key,
      title: item.title,
      type: item.type,
      value: item.value,
      isActive: item.isActive,
    });
    setFormError(null);
    setDialogMode('edit');
  };

  const closeDialog = () => {
    setDialogMode(null);
    setForm(defaultForm);
    setFormError(null);
  };

  const handleSubmit = async () => {
    if (!form.key.trim()) {
      setFormError('Key სავალდებულოა');
      return;
    }
    if (!form.title.trim()) {
      setFormError('სათაური სავალდებულოა');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      if (dialogMode === 'add') {
        await http.post('/content', form);
      } else {
        await http.put(`/content/${encodeURIComponent(form.key)}`, {
          title: form.title,
          type: form.type,
          value: form.value,
          isActive: form.isActive,
        });
      }
      closeDialog();
      await fetchItems();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'NOT_FOUND') {
        setFormError('კონტენტი ვერ მოიძებნა');
      } else if (msg === 'VALIDATION_ERROR') {
        setFormError('შევსების შეცდომა. შეამოწმეთ ველები.');
      } else {
        setFormError('შეცდომა. სცადეთ თავიდან.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (key: string) => {
    setDeletingKey(key);
    try {
      await http.delete(`/content/${encodeURIComponent(key)}`);
      setItems((prev) => prev.filter((i) => i.key !== key));
    } finally {
      setDeletingKey(null);
      setConfirmDeleteKey(null);
    }
  };

  const isLargeValueType = form.type === 'richtext' || form.type === 'json';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">კონტენტის მართვა</h2>
          <p className="text-sm text-muted-foreground">სულ {items.length} ჩანაწერი</p>
        </div>
        <Button onClick={openAdd} size="sm" className="gap-1.5">
          <Plus className="size-4" />
          კონტენტის დამატება
        </Button>
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
                    <TableHead className="pl-6 text-xs">Key</TableHead>
                    <TableHead className="text-xs">სათაური</TableHead>
                    <TableHead className="hidden text-xs sm:table-cell">ტიპი</TableHead>
                    <TableHead className="hidden text-xs md:table-cell">მნიშვნელობა</TableHead>
                    <TableHead className="hidden text-xs lg:table-cell">სტატუსი</TableHead>
                    <TableHead className="pr-6 text-xs" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <FileText className="size-10 text-muted-foreground/30" />
                          <p className="text-sm text-muted-foreground">კონტენტი არ მოიძებნა</p>
                          <p className="text-xs text-muted-foreground">
                            დაამატეთ პირველი კონტენტი ღილაკის გამოყენებით
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id} className="border-border">
                        <TableCell className="pl-6">
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                            {item.key}
                          </code>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs font-medium text-foreground">{item.title}</p>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="text-xs">
                            {CONTENT_TYPE_LABELS[item.type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden max-w-xs md:table-cell">
                          <p className="truncate text-xs text-muted-foreground">
                            {item.value ? item.value.slice(0, 60) + (item.value.length > 60 ? '...' : '') : '—'}
                          </p>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge
                            variant={item.isActive ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {item.isActive ? 'აქტიური' : 'არააქტიური'}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(item)}
                              className="size-7 text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setConfirmDeleteKey(item.key)}
                              disabled={deletingKey === item.key}
                              className="size-7 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
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

      {/* Add / Edit Dialog */}
      <Dialog open={dialogMode !== null} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'add' ? 'კონტენტის დამატება' : 'კონტენტის რედაქტირება'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="content-key">
                Key <span className="text-xs text-muted-foreground">(e.g. home.hero.title)</span>
              </Label>
              <Input
                id="content-key"
                placeholder="home.hero.title"
                value={form.key}
                onChange={(e) => setForm((p) => ({ ...p, key: e.target.value }))}
                disabled={dialogMode === 'edit'}
              />
              {dialogMode === 'add' && (
                <p className="text-xs text-muted-foreground">
                  მხოლოდ a-z, 0-9, წერტილი (.), ტირე (-) და ქვედა ტირე (_)
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content-title">სათაური</Label>
              <Input
                id="content-title"
                placeholder="Hero სათაური მთავარ გვერდზე"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>ტიპი</Label>
              <Select
                value={form.type}
                onValueChange={(val) => setForm((p) => ({ ...p, type: val as ContentType }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">ტექსტი</SelectItem>
                  <SelectItem value="richtext">Rich Text</SelectItem>
                  <SelectItem value="image">სურათი (URL)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content-value">
                მნიშვნელობა
                {form.type === 'json' && (
                  <span className="ml-1 text-xs text-muted-foreground">(JSON ფორმატი)</span>
                )}
              </Label>
              <textarea
                id="content-value"
                placeholder={
                  form.type === 'json'
                    ? '{"key": "value"}'
                    : form.type === 'image'
                      ? 'https://example.com/image.jpg'
                      : 'კონტენტი...'
                }
                value={form.value}
                onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                rows={isLargeValueType ? 8 : 3}
                className={[
                  'w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs',
                  'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1',
                  'focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono',
                ].join(' ')}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="content-active"
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                className="size-4 rounded border-input accent-primary"
              />
              <Label htmlFor="content-active" className="cursor-pointer">
                აქტიური
              </Label>
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog} disabled={submitting}>
              გაუქმება
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'ინახება...' : dialogMode === 'add' ? 'დამატება' : 'შენახვა'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={confirmDeleteKey !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteKey(null); }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>კონტენტის წაშლა</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            დარწმუნებული ხართ, რომ გსურთ{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">{confirmDeleteKey}</code>-ის
            წაშლა? ეს მოქმედება შეუქცევადია.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDeleteKey(null)}
              disabled={deletingKey !== null}
            >
              გაუქმება
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmDeleteKey && handleDelete(confirmDeleteKey)}
              disabled={deletingKey !== null}
            >
              {deletingKey !== null ? 'იშლება...' : 'წაშლა'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

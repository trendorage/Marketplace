'use client';

import { Database, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { http } from '@/shared/lib/http';

type DocRecord = Record<string, unknown>;

type CollectionListResponse = {
  collections: string[];
};

type DocsResponse = {
  docs: DocRecord[];
  total: number;
  fields: string[];
};

const PAGE_SIZE = 10;

function cellValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

function truncate(str: string, max = 40): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

function JsonEditor({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error: string | null;
}) {
  return (
    <div className="space-y-1.5">
      <textarea
        className={
          'h-72 w-full rounded-md border border-border bg-muted/40 px-3 py-2' +
          ' font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary'
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function DatabasePage() {
  const [collections, setCollections] = useState<string[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);

  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [fields, setFields] = useState<string[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Edit / Create dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editDocId, setEditDocId] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState('{}');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete confirm dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCollections = useCallback(async () => {
    setCollectionsLoading(true);
    try {
      const res = await http.get<CollectionListResponse>('/admin/collections');
      setCollections(res.collections);
      if (res.collections.length > 0 && !selectedCollection) {
        setSelectedCollection(res.collections[0]);
      }
    } catch {
      setCollections([]);
    } finally {
      setCollectionsLoading(false);
    }
  }, [selectedCollection]);

  const loadDocs = useCallback(async () => {
    if (!selectedCollection) return;
    setDocsLoading(true);
    try {
      const res = await http.get<DocsResponse>(`/admin/collections/${selectedCollection}`, {
        params: { page, limit: PAGE_SIZE, search: search || undefined },
      });
      setDocs(res.docs);
      setTotal(res.total);
      setFields(res.fields);
    } catch {
      setDocs([]);
      setTotal(0);
      setFields([]);
    } finally {
      setDocsLoading(false);
    }
  }, [selectedCollection, page, search]);

  useEffect(() => {
    loadCollections();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPage(1);
    setSearch('');
    setSearchInput('');
  }, [selectedCollection]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  function openCreateDialog() {
    setDialogMode('create');
    setEditDocId(null);
    setJsonText('{}');
    setJsonError(null);
    setDialogOpen(true);
  }

  function openEditDialog(doc: DocRecord) {
    setDialogMode('edit');
    const id = String(doc._id ?? '');
    setEditDocId(id);
    setJsonText(JSON.stringify(doc, null, 2));
    setJsonError(null);
    setDialogOpen(true);
  }

  function validateJson(): DocRecord | null {
    try {
      const parsed = JSON.parse(jsonText) as DocRecord;
      if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
        setJsonError('JSON must be a plain object {}');
        return null;
      }
      setJsonError(null);
      return parsed;
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON');
      return null;
    }
  }

  async function handleSave() {
    const parsed = validateJson();
    if (!parsed || !selectedCollection) return;

    setSaving(true);
    try {
      if (dialogMode === 'create') {
        await http.post(`/admin/collections/${selectedCollection}`, parsed);
      } else if (editDocId) {
        await http.put(`/admin/collections/${selectedCollection}/${editDocId}`, parsed);
      }
      setDialogOpen(false);
      await loadDocs();
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function openDeleteDialog(id: string) {
    setDeleteDocId(id);
    setDeleteDialogOpen(true);
  }

  async function handleDelete() {
    if (!deleteDocId || !selectedCollection) return;
    setDeleting(true);
    try {
      await http.delete(`/admin/collections/${selectedCollection}/${deleteDocId}`);
      setDeleteDialogOpen(false);
      setDeleteDocId(null);
      await loadDocs();
    } catch {
      // stay open on error
    } finally {
      setDeleting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex h-full gap-5">
      {/* Left panel: collection list */}
      <aside className="w-52 shrink-0">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Database className="size-4" />
              Collections
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {collectionsLoading ? (
              <div className="space-y-1.5 px-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-full rounded-md" />
                ))}
              </div>
            ) : collections.length === 0 ? (
              <p className="px-3 py-4 text-xs text-muted-foreground">No collections found</p>
            ) : (
              <ul className="space-y-0.5">
                {collections.map((name) => (
                  <li key={name}>
                    <button
                      onClick={() => setSelectedCollection(name)}
                      className={`w-full rounded-md px-3 py-1.5 text-left text-xs font-medium transition-colors ${
                        selectedCollection === name
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </aside>

      {/* Right panel: documents */}
      <div className="min-w-0 flex-1 space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {selectedCollection ?? 'Select a collection'}
            </h2>
            {selectedCollection && (
              <p className="text-sm text-muted-foreground">
                {total} {total === 1 ? 'document' : 'documents'}
              </p>
            )}
          </div>
          {selectedCollection && (
            <Button onClick={openCreateDialog} size="sm" className="gap-1.5">
              <Plus className="size-4" />
              New Document
            </Button>
          )}
        </div>

        {/* Search */}
        {selectedCollection && (
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search string fields..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
            <Button type="submit" size="sm" variant="outline">
              Search
            </Button>
            {search && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
              >
                Clear
              </Button>
            )}
          </form>
        )}

        {/* Table */}
        {selectedCollection ? (
          <Card className="border-border bg-card">
            <CardContent className="p-0">
              {docsLoading ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-full rounded-md" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="w-52 pl-4 text-xs">_id</TableHead>
                        {fields.map((f) => (
                          <TableHead key={f} className="text-xs">
                            {f}
                          </TableHead>
                        ))}
                        <TableHead className="pr-4 text-right text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {docs.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={fields.length + 2}
                            className="py-12 text-center text-sm text-muted-foreground"
                          >
                            {search ? 'No documents match your search' : 'Collection is empty'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        docs.map((doc) => {
                          const id = String(doc._id ?? '');
                          return (
                            <TableRow
                              key={id}
                              className="cursor-pointer border-border hover:bg-muted/30"
                              onClick={() => openEditDialog(doc)}
                            >
                              <TableCell className="pl-4">
                                <Badge
                                  variant="outline"
                                  className="max-w-48 truncate font-mono text-xs"
                                >
                                  {id}
                                </Badge>
                              </TableCell>
                              {fields.map((f) => (
                                <TableCell key={f} className="text-xs text-muted-foreground">
                                  {truncate(cellValue(doc[f]))}
                                </TableCell>
                              ))}
                              <TableCell className="pr-4 text-right">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="size-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteDialog(id);
                                  }}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border bg-card">
            <CardContent className="flex items-center justify-center py-24">
              <p className="text-sm text-muted-foreground">Select a collection from the left panel</p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {selectedCollection && total > 0 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} / {total}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-border px-3 py-1.5 transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                ←
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-border px-3 py-1.5 transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit / Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? `New Document — ${selectedCollection}` : 'Edit Document'}
            </DialogTitle>
          </DialogHeader>

          {dialogMode === 'edit' && editDocId && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">ID:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {editDocId}
              </Badge>
            </div>
          )}

          <JsonEditor value={jsonText} onChange={setJsonText} error={jsonError} />

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-1.5">
              {saving && <Loader2 className="size-3.5 animate-spin" />}
              {dialogMode === 'create' ? 'Create' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this document? This action cannot be undone.
          </p>
          {deleteDocId && (
            <Badge variant="outline" className="w-fit font-mono text-xs">
              {deleteDocId}
            </Badge>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-1.5"
            >
              {deleting && <Loader2 className="size-3.5 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, Trash2Icon, BuildingIcon } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { PageGuard, PermissionGuard } from "@/components/guards";
import { entreprisesApi, type Entreprise, ApiError } from "@/lib/api";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@workspace/ui/components/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@workspace/ui/components/table";

const TOKEN_KEY = "auth_token";
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) ?? "" : "");

// ── Empty form state ──────────────────────────────────────────────────────────
const empty = { nomEntreprise: "", numeroContact: "" };

function CompaniesContent() {
  const [rows, setRows] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Entreprise | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Entreprise | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await entreprisesApi.getAll(getToken());
      setRows(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load companies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setFormError(null); setOpen(true); };
  const openEdit = (c: Entreprise) => { setEditing(c); setForm({ nomEntreprise: c.nomEntreprise, numeroContact: c.numeroContact }); setFormError(null); setOpen(true); };

  const handleSave = async () => {
    if (!form.nomEntreprise || !form.numeroContact) { setFormError("All fields are required."); return; }
    setSaving(true); setFormError(null);
    try {
      if (editing) {
        await entreprisesApi.update(editing.id, form, getToken());
      } else {
        await entreprisesApi.create(form, getToken());
      }
      setOpen(false);
      await load();
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await entreprisesApi.remove(deleteTarget.id, getToken());
      setDeleteTarget(null);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Delete failed.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <BuildingIcon className="size-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Companies</h1>
            <p className="text-sm text-muted-foreground">Manage registered companies</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="secondary">{rows.length} total</Badge>
            <PermissionGuard permission="entreprise:create">
              <Button size="sm" onClick={openCreate}>
                <PlusIcon /> New Company
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Companies</CardTitle>
            <CardDescription>Click a row to edit, or use the actions column.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No companies yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-muted-foreground text-xs">#{c.id}</TableCell>
                      <TableCell className="font-medium">{c.nomEntreprise}</TableCell>
                      <TableCell>{c.numeroContact}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <PermissionGuard permission="entreprise:update">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                              <PencilIcon className="size-4" />
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard permission="entreprise:delete">
                            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(c)}>
                              <Trash2Icon className="size-4 text-destructive" />
                            </Button>
                          </PermissionGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Create / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Company" : "New Company"}</DialogTitle>
            <DialogDescription>{editing ? `Editing #${editing.id}` : "Fill in the company details."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {formError && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>}
            <div className="space-y-1.5">
              <Label htmlFor="nomEntreprise">Company Name</Label>
              <Input id="nomEntreprise" value={form.nomEntreprise} onChange={(e) => setForm((f) => ({ ...f, nomEntreprise: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="numeroContact">Contact Number</Label>
              <Input id="numeroContact" value={form.numeroContact} onChange={(e) => setForm((f) => ({ ...f, numeroContact: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.nomEntreprise}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <PageGuard permission="entreprise:read">
      <CompaniesContent />
    </PageGuard>
  );
}


"use client";

import { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, Trash2Icon, TruckIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { PageGuard, PermissionGuard } from "@/components/guards";
import { livreursApi, entreprisesApi, type Livreur, type Entreprise, ApiError } from "@/lib/api";
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

const emptyForm = { nom: "", prenom: "", entrepriseId: "", charteEpiValide: false };

function DriversContent() {
  const [rows, setRows] = useState<Livreur[]>([]);
  const [companies, setCompanies] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Livreur | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Livreur | null>(null);
  const [deleting, setDeleting] = useState(false);

  const token = getToken();

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [drivers, comps] = await Promise.all([
        livreursApi.getAll(token),
        entreprisesApi.getAll(token),
      ]);
      setRows(drivers);
      setCompanies(comps);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const companyName = (id: number) => companies.find((c) => c.id === id)?.nomEntreprise ?? `#${id}`;

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormError(null); setOpen(true); };
  const openEdit = (d: Livreur) => {
    setEditing(d);
    setForm({ nom: d.nom, prenom: d.prenom, entrepriseId: String(d.entrepriseId), charteEpiValide: d.charteEpiValide });
    setFormError(null); setOpen(true);
  };

  const handleSave = async () => {
    if (!form.nom || !form.prenom || !form.entrepriseId) { setFormError("All fields are required."); return; }
    setSaving(true); setFormError(null);
    try {
      const payload = {
        nom: form.nom,
        prenom: form.prenom,
        entrepriseId: Number(form.entrepriseId),
        charteEpiValide: form.charteEpiValide,
        dateSignatureEpi: null,
      };
      if (editing) {
        await livreursApi.update(editing.id, payload, token);
      } else {
        await livreursApi.create(payload, token);
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
      await livreursApi.remove(deleteTarget.id, token);
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

        <div className="flex items-center gap-3">
          <TruckIcon className="size-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Drivers</h1>
            <p className="text-sm text-muted-foreground">Manage delivery drivers</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="secondary">{rows.length} total</Badge>
            <PermissionGuard permission="livreur:create">
              <Button size="sm" onClick={openCreate}><PlusIcon /> New Driver</Button>
            </PermissionGuard>
          </div>
        </div>

        {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <Card>
          <CardHeader>
            <CardTitle>All Drivers</CardTitle>
            <CardDescription>Drivers and their EPI charter status.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No drivers yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>EPI Charter</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="text-muted-foreground text-xs">#{d.id}</TableCell>
                      <TableCell className="font-medium">{d.prenom} {d.nom}</TableCell>
                      <TableCell>{companyName(d.entrepriseId)}</TableCell>
                      <TableCell>
                        {d.charteEpiValide ? (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                            <CheckCircle2Icon className="size-4" /> Signed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-muted-foreground text-sm">
                            <XCircleIcon className="size-4" /> Pending
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <PermissionGuard permission="livreur:update">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(d)}>
                              <PencilIcon className="size-4" />
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard permission="livreur:delete">
                            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(d)}>
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
            <DialogTitle>{editing ? "Edit Driver" : "New Driver"}</DialogTitle>
            <DialogDescription>{editing ? `Editing driver #${editing.id}` : "Fill in driver details."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {formError && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="prenom">First Name</Label>
                <Input id="prenom" value={form.prenom} onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nom">Last Name</Label>
                <Input id="nom" value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="entrepriseId">Company</Label>
              <select
                id="entrepriseId"
                value={form.entrepriseId}
                onChange={(e) => setForm((f) => ({ ...f, entrepriseId: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Select a company…</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.nomEntreprise}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="charteEpiValide"
                type="checkbox"
                checked={form.charteEpiValide}
                onChange={(e) => setForm((f) => ({ ...f, charteEpiValide: e.target.checked }))}
                className="size-4 rounded border-input"
              />
              <Label htmlFor="charteEpiValide">EPI Charter Signed</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Driver</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.prenom} {deleteTarget?.nom}</strong>? This cannot be undone.
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

export default function DriversPage() {
  return (
    <PageGuard permission="livreur:read">
      <DriversContent />
    </PageGuard>
  );
}


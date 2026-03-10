"use client";

import {
  ShieldCheckIcon,
  UsersIcon,
  BuildingIcon,
  TruckIcon,
  ScrollTextIcon,
  SettingsIcon,
  LockIcon,
} from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { AppHeader } from "@/components/app-header";
import { PageGuard, PermissionGuard, RoleGuard } from "@/components/guards";
import { useUser } from "@/hooks/useUser";
import { ROLE_PERMISSIONS, type Permission } from "@/lib/rbac";

// ── Permission badge ──────────────────────────────────────────────────────────

const PERMISSION_META: Record<string, { label: string; icon: React.ReactNode }> = {
  "entreprise:read":   { label: "Read",   icon: <BuildingIcon className="size-3" /> },
  "entreprise:create": { label: "Create", icon: <BuildingIcon className="size-3" /> },
  "entreprise:update": { label: "Update", icon: <BuildingIcon className="size-3" /> },
  "entreprise:delete": { label: "Delete", icon: <BuildingIcon className="size-3" /> },
  "livreur:read":      { label: "Read",   icon: <TruckIcon className="size-3" /> },
  "livreur:create":    { label: "Create", icon: <TruckIcon className="size-3" /> },
  "livreur:update":    { label: "Update", icon: <TruckIcon className="size-3" /> },
  "livreur:delete":    { label: "Delete", icon: <TruckIcon className="size-3" /> },
  "personnel:read":    { label: "Read",   icon: <UsersIcon className="size-3" /> },
  "personnel:create":  { label: "Create", icon: <UsersIcon className="size-3" /> },
  "personnel:delete":  { label: "Delete", icon: <UsersIcon className="size-3" /> },
  "log:read":          { label: "Read",   icon: <ScrollTextIcon className="size-3" /> },
  "settings:manage":   { label: "Manage", icon: <SettingsIcon className="size-3" /> },
};

function PermissionPill({ permission }: { permission: Permission }) {
  const meta = PERMISSION_META[permission];
  return (
    <Badge variant="outline" className="flex items-center gap-1 text-xs">
      {meta?.icon}
      {permission}
    </Badge>
  );
}

// ── Role matrix table ─────────────────────────────────────────────────────────

const ALL_PERMISSIONS = Object.keys(PERMISSION_META) as Permission[];

function RoleMatrix() {
  const roles = ["Admin", "Magasinier"] as const;
  return (
    <div className="container mx-auto overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 pr-4 text-left font-medium text-muted-foreground w-52">
              Permission
            </th>
            {roles.map((r) => (
              <th key={r} className="py-2 px-4 text-center font-medium">
                {r}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ALL_PERMISSIONS.map((perm) => (
            <tr key={perm} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
              <td className="py-2 pr-4">
                <PermissionPill permission={perm} />
              </td>
              {roles.map((role) => {
                const granted = ROLE_PERMISSIONS[role].includes(perm);
                return (
                  <td key={role} className="py-2 px-4 text-center">
                    {granted ? (
                      <span className="inline-flex items-center justify-center size-5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        ✓
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center size-5 rounded-full bg-muted text-muted-foreground">
                        ✕
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── My permissions panel ──────────────────────────────────────────────────────

function MyPermissions() {
  const user = useUser();
  if (!user) return null;
  const myPerms = ROLE_PERMISSIONS[user.role] ?? [];

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_PERMISSIONS.map((perm) => {
        const granted = myPerms.includes(perm);
        return (
          <Badge
            key={perm}
            variant={granted ? "default" : "outline"}
            className={`flex items-center gap-1 text-xs ${!granted ? "opacity-40" : ""}`}
          >
            {granted ? null : <LockIcon className="size-3" />}
            {PERMISSION_META[perm]?.icon}
            {perm}
          </Badge>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function AdminPageContent() {
  const user = useUser();
  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <AppHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8 space-y-6">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <ShieldCheckIcon className="size-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">RBAC Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Role-Based Access Control — permission overview
            </p>
          </div>
          <div className="ml-auto">
            <Badge variant={user.role === "Admin" ? "default" : "secondary"} className="text-sm px-3 py-1">
              <ShieldCheckIcon className="size-3.5 mr-1" />
              {user.role}
            </Badge>
          </div>
        </div>

        {/* ── My permissions ────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="size-4" />
              My Permissions
            </CardTitle>
            <CardDescription>
              Permissions granted to your role ({user.role}). Greyed out = not granted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MyPermissions />
          </CardContent>
        </Card>

        {/* ── Role matrix ───────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScrollTextIcon className="size-4" />
              Full Permission Matrix
            </CardTitle>
            <CardDescription>
              All roles and their granted permissions across the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RoleMatrix />
          </CardContent>
        </Card>

        {/* ── Guard demo ────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LockIcon className="size-4" />
              Guard Demo
            </CardTitle>
            <CardDescription>
              These sections use <code>&lt;PermissionGuard&gt;</code> and{" "}
              <code>&lt;RoleGuard&gt;</code> components live on this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                PermissionGuard — entreprise:delete
              </p>
              <PermissionGuard
                permission="entreprise:delete"
                fallback={
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LockIcon className="size-4" />
                    You cannot delete companies (requires Admin).
                  </div>
                }
              >
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                  <ShieldCheckIcon className="size-4" />
                  You can delete companies.
                </div>
              </PermissionGuard>
            </div>

            <Separator />

            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                RoleGuard — Admin only
              </p>
              <RoleGuard
                roles="Admin"
                fallback={
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LockIcon className="size-4" />
                    This block is only visible to Admins.
                  </div>
                }
              >
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                  <ShieldCheckIcon className="size-4" />
                  Welcome, Admin! You see the secret admin block.
                </div>
              </RoleGuard>
            </div>

            <Separator />

            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                PermissionGuard — settings:manage
              </p>
              <PermissionGuard
                permission="settings:manage"
                fallback={
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LockIcon className="size-4" />
                    Settings management requires Admin role.
                  </div>
                }
              >
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                  <SettingsIcon className="size-4" />
                  You can manage system settings.
                </div>
              </PermissionGuard>
            </div>

          </CardContent>
        </Card>

      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <PageGuard permission="log:read">
      <AdminPageContent />
    </PageGuard>
  );
}


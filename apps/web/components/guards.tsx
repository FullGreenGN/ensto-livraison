"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePermission, useRole, useUser } from "@/hooks/useUser";
import { type Permission, type Role } from "@/lib/rbac";

// ── PermissionGuard ───────────────────────────────────────────────────────────

interface PermissionGuardProps {
  permission: Permission;
  /** Rendered when the user lacks the permission. Defaults to null. */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Renders children only when the current user has the given permission.
 * Use for hiding UI sections (buttons, table actions, menu items).
 */
export function PermissionGuard({ permission, fallback = null, children }: PermissionGuardProps) {
  const allowed = usePermission(permission);
  return allowed ? <>{children}</> : <>{fallback}</>;
}

// ── RoleGuard ─────────────────────────────────────────────────────────────────

interface RoleGuardProps {
  roles: Role | Role[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Renders children only when the current user has (at least) one of the roles.
 */
export function RoleGuard({ roles, fallback = null, children }: RoleGuardProps) {
  const required = Array.isArray(roles) ? roles : [roles];
  const allowed = useRole(...required);
  return allowed ? <>{children}</> : <>{fallback}</>;
}

// ── PageGuard ─────────────────────────────────────────────────────────────────

interface PageGuardProps {
  /** Redirect to this path when not authenticated. Default: /login */
  redirectTo?: string;
  /** If provided, the user must also have this permission. */
  permission?: Permission;
  /** If provided, the user must also have one of these roles. */
  roles?: Role | Role[];
  children: React.ReactNode;
}

/**
 * Full-page guard. Redirects unauthenticated users; renders 403 for
 * authenticated users lacking the required role or permission.
 */
export function PageGuard({ redirectTo = "/login", permission, roles, children }: PageGuardProps) {
  const router = useRouter();
  const user = useUser();

  const requiredRoles = roles ? (Array.isArray(roles) ? roles : [roles]) : undefined;
  const roleOk = useRole(...(requiredRoles ?? ([] as Role[])));
  const permOk = usePermission(permission ?? ("entreprise:read" as Permission));

  useEffect(() => {
    if (user === null) router.replace(redirectTo);
  }, [user, router, redirectTo]);

  if (user === null) return null;
  if (requiredRoles && !roleOk) return <Forbidden />;
  if (permission && !permOk) return <Forbidden />;

  return <>{children}</>;
}

// ── Forbidden ─────────────────────────────────────────────────────────────────

function Forbidden() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <span className="text-5xl">🚫</span>
      <h1 className="text-2xl font-bold">Access Denied</h1>
      <p className="text-sm text-muted-foreground max-w-xs">
        You don&apos;t have the required permissions to view this page.
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { can, getStoredUser, type AuthUser, type Permission, type Role } from "@/lib/rbac";

export function useUser(): AuthUser | null {
  const [user] = useState<AuthUser | null>(getStoredUser);
  return user;
}

/** Returns true if the current user has the given permission. */
export function usePermission(permission: Permission): boolean {
  const user = useUser();
  if (!user) return false;
  return can(user.role, permission);
}

/** Returns true if the current user has (at least) one of the given roles. */
export function useRole(...roles: Role[]): boolean {
  const user = useUser();
  if (!user) return false;
  return roles.includes(user.role);
}


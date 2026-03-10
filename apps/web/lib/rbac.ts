/**
 * Client-side RBAC helpers.
 * Re-exports everything from @repo/types and adds React hooks.
 */
export {
  can,
  hasRole,
  ROLE_PERMISSIONS,
  type Role,
  type Permission,
  type AuthUser,
} from "@repo/types";

const USER_KEY = "auth_user";

/** Read the stored AuthUser synchronously (client-only). */
export function getStoredUser(): import("@repo/types").AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}


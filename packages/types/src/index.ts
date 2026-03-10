// ── Roles ─────────────────────────────────────────────────────────────────────

export type Role = "Admin" | "Magasinier";

// ── Permissions ───────────────────────────────────────────────────────────────

export type Permission =
  // Entreprises
  | "entreprise:read"
  | "entreprise:create"
  | "entreprise:update"
  | "entreprise:delete"
  // Livreurs
  | "livreur:read"
  | "livreur:create"
  | "livreur:update"
  | "livreur:delete"
  // Personnel / Users
  | "personnel:read"
  | "personnel:create"
  | "personnel:delete"
  // Logs
  | "log:read"
  // Settings
  | "settings:manage";

// ── Role → Permission map ─────────────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Admin: [
    "entreprise:read",
    "entreprise:create",
    "entreprise:update",
    "entreprise:delete",
    "livreur:read",
    "livreur:create",
    "livreur:update",
    "livreur:delete",
    "personnel:read",
    "personnel:create",
    "personnel:delete",
    "log:read",
    "settings:manage",
  ],
  Magasinier: [
    "entreprise:read",
    "livreur:read",
    "livreur:create",
    "livreur:update",
    "log:read",
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasRole(userRole: string, required: Role | Role[]): boolean {
  const roles = Array.isArray(required) ? required : [required];
  return roles.includes(userRole as Role);
}

// ── User shape shared across all apps ────────────────────────────────────────

export interface AuthUser {
  id: number;
  identifiant: string;
  role: Role;
}
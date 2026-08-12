import { PERMISSIONS, type Role } from "@constants/config";

export type PermissionKey = keyof typeof PERMISSIONS;

/** Central permission check — every screen/action that needs a role gate
 * should call this instead of comparing `role === "owner"` inline, so the
 * matrix in `constants/config.ts` stays the single source of truth. */
export function can(role: Role | null | undefined, permission: PermissionKey): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

export function isOwner(role: Role | null | undefined): boolean {
  return role === "owner";
}

export function isSupervisor(role: Role | null | undefined): boolean {
  return role === "supervisor";
}

export function isLabour(role: Role | null | undefined): boolean {
  return role === "labour";
}

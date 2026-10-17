import type { Role } from "@/lib/data";

export const roles: { name: Role; description: string }[] = [
  { name: "Owner", description: "Full access, including billing and deleting the workspace." },
  { name: "Admin", description: "Manage everything except billing ownership." },
  { name: "Manager", description: "Manage customers, orders and the team’s work." },
  { name: "Editor", description: "Create and edit content, products and tasks." },
  { name: "Viewer", description: "Read-only access to dashboards and records." },
];

export const resources = ["Dashboard", "Customers", "Products", "Orders", "Invoices", "Tasks", "Team", "Billing", "Settings", "API keys"] as const;
export const actions = ["view", "create", "edit", "delete"] as const;

export type Resource = (typeof resources)[number];
export type Action = (typeof actions)[number];
export type PermissionMatrix = Record<Role, Record<Resource, Record<Action, boolean>>>;

const grant = (fn: (r: Resource, a: Action) => boolean) =>
  Object.fromEntries(resources.map((r) => [r, Object.fromEntries(actions.map((a) => [a, fn(r, a)]))])) as Record<Resource, Record<Action, boolean>>;

const sensitive: Resource[] = ["Team", "Billing", "Settings", "API keys"];

/** Default permissions. Enforce these on the server as well (route handlers, server actions, proxy). */
export const defaultPermissions: PermissionMatrix = {
  Owner: grant(() => true),
  Admin: grant((r, a) => !(r === "Billing" && a === "delete")),
  Manager: grant((r, a) => (sensitive.includes(r) ? a === "view" && r === "Team" : a !== "delete" || r === "Tasks")),
  Editor: grant((r, a) => (sensitive.includes(r) ? false : r === "Invoices" || r === "Orders" ? a === "view" : a !== "delete")),
  Viewer: grant((r, a) => a === "view" && !sensitive.includes(r)),
};

export function can(matrix: PermissionMatrix, role: Role, resource: Resource, action: Action) {
  return matrix[role]?.[resource]?.[action] ?? false;
}

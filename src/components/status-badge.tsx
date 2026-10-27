import {
  AlertTriangle,
  CalendarClock,
  CircleSlash,
  PauseCircle,
  PenLine,
  Send,
  UserPlus,
  Ban,
  CheckCircle2,
  CircleDashed,
  Clock,
  FileEdit,
  Loader,
  PackageCheck,
  RotateCcw,
  Truck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/badge";

/** Status is never shown by color alone: every state ships with an icon + label. */
const map: Record<string, [BadgeVariant, LucideIcon, string?]> = {
  active: ["success", CheckCircle2],
  inactive: ["secondary", CircleDashed],
  pending: ["warning", Clock],
  blocked: ["destructive", Ban],
  invited: ["warning", Clock],
  suspended: ["destructive", Ban],
  draft: ["secondary", FileEdit],
  archived: ["secondary", CircleDashed],
  processing: ["default", Loader],
  shipped: ["default", Truck],
  delivered: ["success", PackageCheck],
  cancelled: ["destructive", XCircle],
  refunded: ["secondary", RotateCcw],
  paid: ["success", CheckCircle2],
  unpaid: ["warning", Clock],
  overdue: ["destructive", AlertTriangle],
  info: ["default", CheckCircle2],
  warning: ["warning", AlertTriangle],
  critical: ["destructive", AlertTriangle],
  approved: ["success", CheckCircle2],
  rejected: ["destructive", XCircle],
  submitted: ["warning", Clock],
  reimbursed: ["success", CheckCircle2],
  sent: ["default", Send],
  confirmed: ["success", CheckCircle2],
  received: ["success", PackageCheck],
  "label-created": ["secondary", FileEdit, "Label created"],
  "in-transit": ["default", Truck, "In transit"],
  "out-for-delivery": ["default", Truck, "Out for delivery"],
  exception: ["destructive", AlertTriangle],
  trialing: ["default", Clock],
  "past-due": ["destructive", AlertTriangle, "Past due"],
  succeeded: ["success", CheckCircle2],
  failed: ["destructive", XCircle],
  scheduled: ["default", CalendarClock],
  sending: ["default", Loader],
  published: ["success", CheckCircle2],
  hidden: ["secondary", CircleSlash],
  completed: ["success", CheckCircle2],
  "no-show": ["destructive", CircleSlash, "No-show"],
  signed: ["success", PenLine],
  expired: ["secondary", Clock],
  declined: ["destructive", XCircle],
  planning: ["secondary", PenLine],
  "on-hold": ["warning", PauseCircle, "On hold"],
  "at-risk": ["destructive", AlertTriangle, "At risk"],
  "on-track": ["success", CheckCircle2, "On track"],
  "off-track": ["destructive", XCircle, "Off track"],
  "on-leave": ["warning", Clock, "On leave"],
  onboarding: ["default", UserPlus],
  terminated: ["secondary", Ban],
  open: ["default", CircleDashed],
  resolved: ["success", CheckCircle2],
  closed: ["secondary", CheckCircle2],
  paused: ["warning", PauseCircle],
  lead: ["secondary", CircleDashed],
  qualified: ["default", CheckCircle2],
  proposal: ["default", FileEdit],
  negotiation: ["warning", PenLine],
  won: ["success", CheckCircle2],
  lost: ["destructive", XCircle],
  "in-stock": ["success", CheckCircle2, "In stock"],
  "low-stock": ["warning", AlertTriangle, "Low stock"],
  "out-of-stock": ["destructive", XCircle, "Out of stock"],
};

export function StatusBadge({ status }: { status: string }) {
  const [variant, Icon, label] = map[status] ?? ["secondary", CircleDashed];
  return (
    <Badge variant={variant}>
      <Icon />
      <span className="capitalize">{label ?? status.replace(/-/g, " ")}</span>
    </Badge>
  );
}

export function stockStatus(stock: number, reorderLevel: number) {
  return stock === 0 ? "out-of-stock" : stock <= reorderLevel ? "low-stock" : "in-stock";
}

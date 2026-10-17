import {
  AlertTriangle,
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

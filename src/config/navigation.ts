import {
  BarChart3,
  Bell,
  CalendarDays,
  FileText,
  KanbanSquare,
  LayoutDashboard,
  Mail,
  Package,
  ScrollText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  keywords?: string[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, keywords: ["home", "overview", "kpi"] },
      { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3, keywords: ["traffic", "reports", "funnel"] },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Customers", href: "/dashboard/customers", icon: Users, keywords: ["crm", "users", "clients"] },
      { title: "Products", href: "/dashboard/products", icon: Package, keywords: ["inventory", "catalog", "stock"] },
      { title: "Orders", href: "/dashboard/orders", icon: ShoppingCart, badge: "12", keywords: ["sales", "ecommerce"] },
      { title: "Invoices", href: "/dashboard/invoices", icon: FileText, keywords: ["billing", "payments"] },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Tasks", href: "/dashboard/tasks", icon: KanbanSquare, keywords: ["kanban", "board", "projects"] },
      { title: "Calendar", href: "/dashboard/calendar", icon: CalendarDays, keywords: ["events", "schedule"] },
      { title: "Inbox", href: "/dashboard/inbox", icon: Mail, badge: "4", keywords: ["mail", "messages", "email"] },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Roles & Permissions", href: "/dashboard/roles", icon: ShieldCheck, keywords: ["rbac", "access", "team"] },
      { title: "Audit Log", href: "/dashboard/audit-log", icon: ScrollText, keywords: ["activity", "security", "history"] },
      { title: "Notifications", href: "/dashboard/notifications", icon: Bell, keywords: ["alerts"] },
      { title: "Settings", href: "/dashboard/settings", icon: Settings, keywords: ["profile", "billing", "api keys", "appearance"] },
    ],
  },
];

export const flatNavigation = navigation.flatMap((g) => g.items);

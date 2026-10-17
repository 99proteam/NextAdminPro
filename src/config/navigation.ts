import {
  BarChart3,
  Blocks,
  FileBarChart,
  FolderOpen,
  LifeBuoy,
  MessagesSquare,
  TicketPercent,
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
      { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3, keywords: ["traffic", "funnel"] },
      { title: "Reports", href: "/dashboard/reports", icon: FileBarChart, keywords: ["export", "schedule", "pdf", "csv"] },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Customers", href: "/dashboard/customers", icon: Users, keywords: ["crm", "users", "clients"] },
      { title: "Products", href: "/dashboard/products", icon: Package, keywords: ["inventory", "catalog", "stock"] },
      { title: "Orders", href: "/dashboard/orders", icon: ShoppingCart, badge: "12", keywords: ["sales", "ecommerce"] },
      { title: "Invoices", href: "/dashboard/invoices", icon: FileText, keywords: ["billing", "payments"] },
      { title: "Coupons", href: "/dashboard/coupons", icon: TicketPercent, keywords: ["discounts", "promo codes", "marketing"] },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Tasks", href: "/dashboard/tasks", icon: KanbanSquare, keywords: ["kanban", "board", "projects"] },
      { title: "Calendar", href: "/dashboard/calendar", icon: CalendarDays, keywords: ["events", "schedule"] },
      { title: "Inbox", href: "/dashboard/inbox", icon: Mail, badge: "4", keywords: ["mail", "messages", "email"] },
      { title: "Chat", href: "/dashboard/chat", icon: MessagesSquare, badge: "6", keywords: ["team", "messages", "channels"] },
      { title: "Files", href: "/dashboard/files", icon: FolderOpen, keywords: ["file manager", "documents", "uploads", "storage"] },
      { title: "Support", href: "/dashboard/support", icon: LifeBuoy, keywords: ["helpdesk", "tickets", "customer service"] },
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
  {
    label: "Resources",
    items: [
      { title: "UI Components", href: "/dashboard/components", icon: Blocks, keywords: ["ui kit", "buttons", "forms", "design system"] },
    ],
  },
];

export const flatNavigation = navigation.flatMap((g) => g.items);

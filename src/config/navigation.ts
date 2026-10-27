import {
  BadgeDollarSign,
  BarChart3,
  Bell,
  Blocks,
  BookOpen,
  Boxes,
  Building2,
  CalendarClock,
  CalendarDays,
  CalendarOff,
  ClipboardList,
  FileBarChart,
  FileSignature,
  FileText,
  FolderKanban,
  FolderOpen,
  Handshake,
  KanbanSquare,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Megaphone,
  MessagesSquare,
  Newspaper,
  Package,
  Plug,
  Receipt,
  Repeat,
  ScrollText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Star,
  Target,
  TicketPercent,
  Timer,
  Truck,
  Users,
  UsersRound,
  Wallet,
  Webhook,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  isNew?: boolean;
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
      { title: "Reports", href: "/dashboard/reports", icon: FileBarChart, keywords: ["export", "schedule", "pdf", "csv", "p&l"] },
    ],
  },
  {
    label: "Sales & CRM",
    items: [
      { title: "Customers", href: "/dashboard/customers", icon: Users, keywords: ["crm", "users", "clients"] },
      { title: "Deals", href: "/dashboard/deals", icon: Handshake, isNew: true, keywords: ["pipeline", "opportunities", "leads", "crm"] },
      { title: "Subscriptions", href: "/dashboard/subscriptions", icon: Repeat, isNew: true, keywords: ["mrr", "saas", "recurring", "plans"] },
      { title: "Transactions", href: "/dashboard/transactions", icon: BadgeDollarSign, isNew: true, keywords: ["payments", "charges", "refunds", "payouts"] },
      { title: "Reviews", href: "/dashboard/reviews", icon: Star, isNew: true, keywords: ["ratings", "feedback", "moderation"] },
    ],
  },
  {
    label: "Commerce",
    items: [
      { title: "Products", href: "/dashboard/products", icon: Package, keywords: ["inventory", "catalog", "stock"] },
      { title: "Orders", href: "/dashboard/orders", icon: ShoppingCart, badge: "12", keywords: ["sales", "ecommerce"] },
      { title: "Invoices", href: "/dashboard/invoices", icon: FileText, keywords: ["billing", "payments"] },
      { title: "Coupons", href: "/dashboard/coupons", icon: TicketPercent, keywords: ["discounts", "promo codes"] },
      { title: "Shipments", href: "/dashboard/shipments", icon: Truck, isNew: true, keywords: ["tracking", "delivery", "logistics", "carriers"] },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Vendors", href: "/dashboard/vendors", icon: Building2, isNew: true, keywords: ["suppliers", "procurement"] },
      { title: "Purchase orders", href: "/dashboard/purchase-orders", icon: ClipboardList, isNew: true, keywords: ["po", "procurement", "buying"] },
      { title: "Warehouses", href: "/dashboard/warehouses", icon: Boxes, isNew: true, keywords: ["stock movements", "inventory", "locations"] },
      { title: "Expenses", href: "/dashboard/expenses", icon: Receipt, isNew: true, keywords: ["spend", "reimbursement", "receipts"] },
      { title: "Contracts", href: "/dashboard/contracts", icon: FileSignature, isNew: true, keywords: ["agreements", "e-signature", "nda"] },
    ],
  },
  {
    label: "Projects & Work",
    items: [
      { title: "Projects", href: "/dashboard/projects", icon: FolderKanban, isNew: true, keywords: ["budget", "progress", "clients"] },
      { title: "Goals & OKRs", href: "/dashboard/goals", icon: Target, isNew: true, keywords: ["okr", "objectives", "key results", "targets", "check-in"] },
      { title: "Tasks", href: "/dashboard/tasks", icon: KanbanSquare, keywords: ["kanban", "board"] },
      { title: "Timesheets", href: "/dashboard/timesheets", icon: Timer, isNew: true, keywords: ["time tracking", "hours", "billable"] },
      { title: "Calendar", href: "/dashboard/calendar", icon: CalendarDays, keywords: ["events", "schedule"] },
      { title: "Appointments", href: "/dashboard/appointments", icon: CalendarClock, isNew: true, keywords: ["bookings", "meetings", "demos"] },
    ],
  },
  {
    label: "People & HR",
    items: [
      { title: "Employees", href: "/dashboard/employees", icon: UsersRound, isNew: true, keywords: ["hr", "staff", "directory", "team"] },
      { title: "Time off", href: "/dashboard/time-off", icon: CalendarOff, isNew: true, keywords: ["leave", "vacation", "pto", "sick"] },
      { title: "Payroll", href: "/dashboard/payroll", icon: Wallet, isNew: true, keywords: ["salary", "payslips", "pay runs"] },
    ],
  },
  {
    label: "Marketing & Content",
    items: [
      { title: "Campaigns", href: "/dashboard/campaigns", icon: Megaphone, isNew: true, keywords: ["email marketing", "sms", "newsletter"] },
      { title: "Blog", href: "/dashboard/blog", icon: Newspaper, isNew: true, keywords: ["cms", "posts", "articles", "seo"] },
      { title: "Knowledge base", href: "/dashboard/knowledge-base", icon: BookOpen, isNew: true, keywords: ["help center", "docs", "faq"] },
    ],
  },
  {
    label: "Communication",
    items: [
      { title: "Inbox", href: "/dashboard/inbox", icon: Mail, badge: "4", keywords: ["mail", "messages", "email"] },
      { title: "Chat", href: "/dashboard/chat", icon: MessagesSquare, badge: "6", keywords: ["team", "messages", "channels"] },
      { title: "Support", href: "/dashboard/support", icon: LifeBuoy, keywords: ["helpdesk", "tickets"] },
      { title: "Files", href: "/dashboard/files", icon: FolderOpen, keywords: ["file manager", "documents", "uploads"] },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Roles & Permissions", href: "/dashboard/roles", icon: ShieldCheck, keywords: ["rbac", "access", "team"] },
      { title: "Integrations", href: "/dashboard/integrations", icon: Plug, isNew: true, keywords: ["apps", "stripe", "slack", "zapier"] },
      { title: "Webhooks", href: "/dashboard/webhooks", icon: Webhook, isNew: true, keywords: ["events", "endpoints", "developer", "signing secret", "deliveries"] },
      { title: "Audit Log", href: "/dashboard/audit-log", icon: ScrollText, keywords: ["activity", "security", "history"] },
      { title: "Notifications", href: "/dashboard/notifications", icon: Bell, keywords: ["alerts"] },
      { title: "Settings", href: "/dashboard/settings", icon: Settings, keywords: ["profile", "billing", "api keys", "appearance"] },
      { title: "UI Components", href: "/dashboard/components", icon: Blocks, keywords: ["ui kit", "buttons", "forms", "design system"] },
    ],
  },
];

export const flatNavigation = navigation.flatMap((g) => g.items);

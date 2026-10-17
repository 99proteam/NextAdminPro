export type CustomerStatus = "active" | "inactive" | "pending" | "blocked";
export type Role = "Owner" | "Admin" | "Manager" | "Editor" | "Viewer";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
export type PaymentMethod = "Card" | "PayPal" | "Bank transfer" | "Apple Pay";
export type InvoiceStatus = "paid" | "unpaid" | "overdue" | "draft";
export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskColumn = "backlog" | "todo" | "in-progress" | "review" | "done";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  city: string;
  status: CustomerStatus;
  plan: "Free" | "Starter" | "Pro" | "Enterprise";
  totalSpent: number;
  orders: number;
  joinedAt: string;
  lastSeenAt: string;
  tags: string[];
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  reorderLevel: number;
  sold: number;
  rating: number;
  status: "active" | "draft" | "archived";
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  payment: PaymentMethod;
  createdAt: string;
  shippingAddress: string;
}

export interface Invoice {
  id: string;
  number: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  company: string;
  amount: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
  items: OrderItem[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  column: TaskColumn;
  priority: Priority;
  assignee: string;
  dueAt: string;
  tags: string[];
  comments: number;
  attachments: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string;
  category: "meeting" | "deadline" | "event" | "personal";
  attendees: string[];
}

export interface Message {
  id: string;
  from: string;
  email: string;
  subject: string;
  preview: string;
  body: string;
  receivedAt: string;
  read: boolean;
  starred: boolean;
  folder: "inbox" | "sent" | "archive" | "spam";
  label?: "work" | "billing" | "support" | "personal";
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: "order" | "user" | "system" | "billing" | "security";
  createdAt: string;
  read: boolean;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  resource: string;
  ip: string;
  severity: "info" | "warning" | "critical";
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "invited" | "suspended";
  lastActiveAt: string;
  twoFactor: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: "percent" | "fixed" | "shipping";
  value: number;
  uses: number;
  limit: number | null;
  minOrder: number;
  status: "active" | "scheduled" | "expired" | "paused";
  startsAt: string;
  endsAt: string;
}

export interface Ticket {
  id: string;
  number: string;
  subject: string;
  customer: string;
  email: string;
  status: "open" | "pending" | "resolved" | "closed";
  priority: Priority;
  channel: "email" | "chat" | "phone" | "web";
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
  messages: { from: string; staff: boolean; body: string; at: string }[];
}

export interface FileItem {
  id: string;
  name: string;
  kind: "folder" | "image" | "pdf" | "doc" | "sheet" | "video" | "zip" | "code";
  size: number; // bytes (folders: total)
  items?: number;
  folder: string; // parent folder id, "root" for top level
  owner: string;
  modifiedAt: string;
  starred: boolean;
  shared: boolean;
}

export interface ChatChannel {
  id: string;
  name: string;
  kind: "channel" | "dm";
  topic?: string;
  unread: number;
  members: string[];
}

export interface ChatMessage {
  id: string;
  channelId: string;
  author: string;
  body: string;
  at: string;
  reactions?: { emoji: string; count: number }[];
}

export interface Report {
  id: string;
  name: string;
  description: string;
  category: "Sales" | "Customers" | "Inventory" | "Finance" | "Marketing";
  schedule: "none" | "daily" | "weekly" | "monthly";
  format: "CSV" | "PDF" | "XLSX";
  lastRunAt: string;
  recipients: number;
}

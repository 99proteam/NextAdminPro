import { createRng, daysAgo, NOW, DAY, firstNames, lastNames, companies, locations } from "./seed";
import type {
  AuditLog,
  CalendarEvent,
  Customer,
  Invoice,
  Message,
  Notification,
  Order,
  OrderItem,
  Product,
  Task,
  TeamMember,
} from "./types";

export * from "./types";

/* ------------------------------------------------------------------ */
/*  Customers                                                          */
/* ------------------------------------------------------------------ */

const rng = createRng(20261015);
const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");

export const customers: Customer[] = Array.from({ length: 64 }, (_, i) => {
  const first = rng.pick(firstNames);
  const last = rng.pick(lastNames);
  const company = rng.pick(companies);
  const [country, city] = rng.pick(locations);
  const joined = rng.int(3, 720);
  return {
    id: `cus_${1001 + i}`,
    name: `${first} ${last}`,
    email: `${slug(first)}.${slug(last)}@${slug(company)}.com`,
    phone: `+1 (${rng.int(200, 989)}) ${rng.int(200, 999)}-${rng.int(1000, 9999)}`,
    company,
    country,
    city,
    status: rng.weighted([["active", 7], ["inactive", 2], ["pending", 1.5], ["blocked", 0.5]] as const),
    plan: rng.weighted([["Free", 3], ["Starter", 3], ["Pro", 2.5], ["Enterprise", 1]] as const),
    totalSpent: 0,
    orders: 0,
    joinedAt: daysAgo(joined, rng),
    lastSeenAt: daysAgo(rng.int(0, Math.min(joined, 60)), rng),
    tags: rng.sample(["VIP", "Wholesale", "Newsletter", "Referral", "Beta", "Partner"], rng.int(0, 2)),
  };
});

/* ------------------------------------------------------------------ */
/*  Products                                                           */
/* ------------------------------------------------------------------ */

const productCatalog: [string, string, number][] = [
  ["Aurora Wireless Headphones", "Electronics", 189],
  ["Nimbus Smart Watch", "Electronics", 249],
  ["Pulse Bluetooth Speaker", "Electronics", 79],
  ["Vertex Mechanical Keyboard", "Electronics", 139],
  ["Glide Ergonomic Mouse", "Electronics", 59],
  ["Lumen 4K Webcam", "Electronics", 119],
  ["Orbit USB-C Hub", "Electronics", 49],
  ["Echo Noise-Cancel Earbuds", "Electronics", 159],
  ["Summit Hiking Backpack", "Outdoor", 129],
  ["Trail Insulated Bottle", "Outdoor", 34],
  ["Basecamp 2P Tent", "Outdoor", 299],
  ["Ridge Trekking Poles", "Outdoor", 69],
  ["Cove Linen Shirt", "Apparel", 58],
  ["Drift Merino Hoodie", "Apparel", 110],
  ["Atlas Everyday Sneakers", "Apparel", 95],
  ["Harbor Rain Jacket", "Apparel", 165],
  ["Loom Cotton Tee", "Apparel", 28],
  ["Sage Ceramic Mug Set", "Home", 42],
  ["Haven Weighted Blanket", "Home", 149],
  ["Ember Pour-Over Kettle", "Home", 89],
  ["Fern Indoor Planter", "Home", 36],
  ["Calm Aroma Diffuser", "Home", 54],
  ["Oak Desk Organizer", "Office", 39],
  ["Ledger Notebook 3-Pack", "Office", 24],
  ["Rise Standing Desk", "Office", 549],
  ["Arc Monitor Light Bar", "Office", 72],
  ["Flow Gel Pen Set", "Office", 14],
  ["Bloom Vitamin C Serum", "Beauty", 38],
  ["Dew Hydrating Cream", "Beauty", 32],
  ["Glow Silk Pillowcase", "Beauty", 45],
  ["Core Yoga Mat", "Fitness", 68],
  ["Flex Resistance Bands", "Fitness", 29],
  ["Iron Adjustable Dumbbells", "Fitness", 329],
  ["Sprint Running Belt", "Fitness", 22],
  ["Zen Meditation Cushion", "Fitness", 49],
  ["Pixel Kids Tablet", "Electronics", 129],
  ["Nova Smart Bulb 4-Pack", "Home", 59],
  ["Quill Leather Journal", "Office", 48],
];

const prng = createRng(77);
export const products: Product[] = productCatalog.map(([name, category, price], i) => {
  const stock = prng.weighted([[0, 1], [prng.int(1, 12), 2], [prng.int(13, 400), 8]] as const);
  return {
    id: `prd_${(i + 1).toString().padStart(3, "0")}`,
    sku: `${category.slice(0, 3).toUpperCase()}-${(1000 + i * 37).toString()}`,
    name,
    category,
    price,
    cost: Math.round(price * prng.float(0.32, 0.6)),
    stock,
    reorderLevel: prng.pick([10, 15, 20, 25]),
    sold: prng.int(40, 2400),
    rating: prng.float(3.6, 5, 1),
    status: prng.weighted([["active", 9], ["draft", 1], ["archived", 0.5]] as const),
    createdAt: daysAgo(prng.int(20, 600), prng),
  };
});

/* ------------------------------------------------------------------ */
/*  Orders                                                             */
/* ------------------------------------------------------------------ */

const orng = createRng(4242);
export const orders: Order[] = Array.from({ length: 140 }, (_, i) => {
  const customer = orng.pick(customers);
  const items: OrderItem[] = orng.sample(products, orng.int(1, 4)).map((p) => ({
    productId: p.id,
    name: p.name,
    quantity: orng.int(1, 3),
    price: p.price,
  }));
  const subtotal = items.reduce((a, it) => a + it.price * it.quantity, 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const shipping = subtotal > 150 ? 0 : 9.99;
  const age = Math.floor(i * 1.3 + orng.int(0, 2));
  const status =
    age < 2
      ? orng.weighted([["pending", 3], ["processing", 2]] as const)
      : age < 6
        ? orng.weighted([["processing", 2], ["shipped", 3], ["cancelled", 0.3]] as const)
        : orng.weighted([["delivered", 10], ["cancelled", 0.8], ["refunded", 0.6], ["shipped", 0.6]] as const);
  customer.orders += 1;
  if (status !== "cancelled" && status !== "refunded") customer.totalSpent += subtotal + tax + shipping;
  return {
    id: `ord_${(5000 + 140 - i).toString()}`,
    number: `#${(5000 + 140 - i).toString()}`,
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    items,
    subtotal,
    tax,
    shipping,
    total: Math.round((subtotal + tax + shipping) * 100) / 100,
    status,
    payment: orng.weighted([["Card", 6], ["PayPal", 2], ["Apple Pay", 1.5], ["Bank transfer", 1]] as const),
    createdAt: daysAgo(age, orng),
    shippingAddress: `${orng.int(10, 999)} ${orng.pick(["Market St", "Oak Ave", "King Rd", "Elm Way", "Harbor Blvd"])}, ${customer.city}, ${customer.country}`,
  };
});
customers.forEach((c) => (c.totalSpent = Math.round(c.totalSpent * 100) / 100));

/* ------------------------------------------------------------------ */
/*  Invoices                                                           */
/* ------------------------------------------------------------------ */

export const invoices: Invoice[] = orders.slice(0, 48).map((o, i) => {
  const customer = customers.find((c) => c.id === o.customerId)!;
  const issued = new Date(o.createdAt).getTime();
  const due = issued + 14 * DAY;
  const status: Invoice["status"] =
    o.status === "cancelled"
      ? "draft"
      : i % 7 === 3
        ? due < NOW
          ? "overdue"
          : "unpaid"
        : i < 3
          ? "unpaid"
          : "paid";
  return {
    id: `inv_${(2400 + 48 - i).toString()}`,
    number: `INV-2026-${(2400 + 48 - i).toString()}`,
    orderId: o.id,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    company: customer.company,
    amount: o.total,
    status,
    issuedAt: o.createdAt,
    dueAt: new Date(due).toISOString(),
    items: o.items,
  };
});

/* ------------------------------------------------------------------ */
/*  Team, tasks, calendar, inbox, notifications, audit log             */
/* ------------------------------------------------------------------ */

export const team: TeamMember[] = [
  { id: "usr_1", name: "Alex Morgan", email: "alex@nextadminpro.dev", role: "Owner", status: "active", lastActiveAt: daysAgo(0), twoFactor: true },
  { id: "usr_2", name: "Priya Mehta", email: "priya@nextadminpro.dev", role: "Admin", status: "active", lastActiveAt: daysAgo(0), twoFactor: true },
  { id: "usr_3", name: "Jonas Hansen", email: "jonas@nextadminpro.dev", role: "Manager", status: "active", lastActiveAt: daysAgo(1), twoFactor: false },
  { id: "usr_4", name: "Yuki Tanaka", email: "yuki@nextadminpro.dev", role: "Editor", status: "active", lastActiveAt: daysAgo(2), twoFactor: true },
  { id: "usr_5", name: "Diego Reyes", email: "diego@nextadminpro.dev", role: "Editor", status: "active", lastActiveAt: daysAgo(4), twoFactor: false },
  { id: "usr_6", name: "Fatima Khan", email: "fatima@nextadminpro.dev", role: "Viewer", status: "invited", lastActiveAt: daysAgo(9), twoFactor: false },
  { id: "usr_7", name: "Leo Dubois", email: "leo@nextadminpro.dev", role: "Manager", status: "suspended", lastActiveAt: daysAgo(30), twoFactor: false },
];

export const currentUser = team[0];

const trng = createRng(9);
const taskTitles = [
  "Redesign checkout flow", "Migrate auth to OAuth 2.1", "Write Q4 product roadmap", "Fix invoice PDF rounding", "Add Stripe webhooks",
  "Onboarding email sequence", "Audit role permissions", "Customer interview synthesis", "Optimize dashboard queries", "Set up error monitoring",
  "Translate UI to Spanish", "Mobile sidebar polish", "Bulk product import (CSV)", "Weekly KPI report", "Refund policy update",
  "Dark mode contrast pass", "Inventory low-stock alerts", "Landing page A/B test", "GDPR data export", "Release v2.0 notes",
];
const columns = ["backlog", "todo", "in-progress", "review", "done"] as const;
export const tasks: Task[] = taskTitles.map((title, i) => ({
  id: `tsk_${i + 1}`,
  title,
  description: "Scope the work, align with stakeholders and ship behind a feature flag.",
  column: columns[i % 5],
  priority: trng.weighted([["low", 2], ["medium", 4], ["high", 2], ["urgent", 1]] as const),
  assignee: trng.pick(team.slice(0, 5)).name,
  dueAt: new Date(NOW + trng.int(-3, 21) * DAY).toISOString(),
  tags: trng.sample(["Design", "Frontend", "Backend", "Marketing", "Bug", "Docs"], trng.int(1, 2)),
  comments: trng.int(0, 12),
  attachments: trng.int(0, 4),
}));

const ymd = (offset: number) => new Date(NOW + offset * DAY).toISOString().slice(0, 10);
export const events: CalendarEvent[] = [
  { id: "evt_1", title: "Weekly team sync", date: ymd(-14), start: "10:00", end: "10:45", category: "meeting", attendees: ["Alex Morgan", "Priya Mehta", "Jonas Hansen"] },
  { id: "evt_2", title: "Q3 revenue review", date: ymd(-9), start: "14:00", end: "15:00", category: "meeting", attendees: ["Alex Morgan", "Priya Mehta"] },
  { id: "evt_3", title: "Weekly team sync", date: ymd(-7), start: "10:00", end: "10:45", category: "meeting", attendees: ["Alex Morgan", "Priya Mehta", "Jonas Hansen"] },
  { id: "evt_4", title: "Black Friday campaign brief due", date: ymd(-3), start: "17:00", end: "17:30", category: "deadline", attendees: ["Diego Reyes"] },
  { id: "evt_5", title: "Customer webinar", date: ymd(-1), start: "16:00", end: "17:00", category: "event", attendees: ["Yuki Tanaka", "Alex Morgan"] },
  { id: "evt_6", title: "Weekly team sync", date: ymd(0), start: "10:00", end: "10:45", category: "meeting", attendees: ["Alex Morgan", "Priya Mehta", "Jonas Hansen"] },
  { id: "evt_7", title: "Investor update call", date: ymd(0), start: "15:30", end: "16:15", category: "meeting", attendees: ["Alex Morgan"] },
  { id: "evt_8", title: "v2.0 release", date: ymd(3), start: "09:00", end: "12:00", category: "deadline", attendees: ["Priya Mehta", "Yuki Tanaka", "Diego Reyes"] },
  { id: "evt_9", title: "Dentist", date: ymd(4), start: "08:30", end: "09:15", category: "personal", attendees: ["Alex Morgan"] },
  { id: "evt_10", title: "Weekly team sync", date: ymd(7), start: "10:00", end: "10:45", category: "meeting", attendees: ["Alex Morgan", "Priya Mehta", "Jonas Hansen"] },
  { id: "evt_11", title: "Partner summit", date: ymd(10), start: "09:00", end: "18:00", category: "event", attendees: ["Alex Morgan", "Jonas Hansen"] },
  { id: "evt_12", title: "Invoice batch due", date: ymd(12), start: "12:00", end: "12:30", category: "deadline", attendees: ["Priya Mehta"] },
  { id: "evt_13", title: "Weekly team sync", date: ymd(14), start: "10:00", end: "10:45", category: "meeting", attendees: ["Alex Morgan", "Priya Mehta", "Jonas Hansen"] },
];

const mrng = createRng(31);
const subjects: [string, string, Message["label"]][] = [
  ["Question about my last invoice", "Hi team, I noticed a duplicate charge on INV-2026-2447. Could you take a look?", "billing"],
  ["Partnership opportunity", "We'd love to explore an integration between our platforms. Do you have 20 minutes next week?", "work"],
  ["Can't reset my password", "The reset link I received says it has expired. Can you send a new one?", "support"],
  ["Bulk order for our office", "We are looking to order 40 standing desks. Is there a volume discount available?", "work"],
  ["Feature request: export to PDF", "Our finance team would love to export reports straight to PDF.", "support"],
  ["Re: Onboarding call", "Thanks for the walkthrough yesterday, it was super helpful. Sharing notes below.", "work"],
  ["Refund for order #5131", "The item arrived damaged. Photos attached. Could I get a refund or replacement?", "support"],
  ["Lunch on Friday?", "Want to grab lunch after the sprint demo?", "personal"],
  ["Your subscription renews soon", "Your Enterprise plan renews in 7 days. No action is needed.", "billing"],
  ["API rate limit increase", "We're hitting the 1,000 req/min limit during peak hours. Can we raise it?", "support"],
  ["Design review feedback", "Left comments on the new dashboard mockups. Overall looks great!", "work"],
  ["Welcome aboard!", "Excited to have you on the team. Here's everything you need for week one.", "personal"],
];
export const messages: Message[] = subjects.map(([subject, preview, label], i) => {
  const c = customers[i * 3];
  return {
    id: `msg_${i + 1}`,
    from: c.name,
    email: c.email,
    subject,
    preview,
    body: `${preview}\n\nLet me know if you need anything else from my side.\n\nBest regards,\n${c.name}\n${c.company}`,
    receivedAt: new Date(NOW - i * 0.31 * DAY - mrng.int(0, 3600_000)).toISOString(),
    read: i > 3,
    starred: i % 4 === 1,
    folder: i === 10 ? "archive" : "inbox",
    label,
  };
});

export const notifications: Notification[] = [
  { id: "ntf_1", title: "New order received", description: `Order ${orders[0].number} from ${orders[0].customerName} for $${orders[0].total}`, type: "order", createdAt: daysAgo(0.02), read: false },
  { id: "ntf_2", title: "Low stock alert", description: `${products.find((p) => p.stock > 0 && p.stock <= p.reorderLevel)?.name ?? "A product"} is running low`, type: "system", createdAt: daysAgo(0.1), read: false },
  { id: "ntf_3", title: "New customer signed up", description: `${customers[5].name} joined on the ${customers[5].plan} plan`, type: "user", createdAt: daysAgo(0.4), read: false },
  { id: "ntf_4", title: "Payment failed", description: "Card ending 4242 was declined for INV-2026-2445", type: "billing", createdAt: daysAgo(0.9), read: true },
  { id: "ntf_5", title: "New sign-in from Chrome on macOS", description: "Berlin, Germany · 81.2.69.142", type: "security", createdAt: daysAgo(1.3), read: true },
  { id: "ntf_6", title: "Monthly report is ready", description: "Your September performance report is available to download", type: "system", createdAt: daysAgo(2.2), read: true },
  { id: "ntf_7", title: "Refund processed", description: "Refund of $129.00 issued for order #5102", type: "billing", createdAt: daysAgo(3), read: true },
];

const arng = createRng(5);
const actions: [string, string, AuditLog["severity"]][] = [
  ["signed in", "Session", "info"],
  ["updated", "Product · Rise Standing Desk", "info"],
  ["created", "Coupon · FALL25", "info"],
  ["exported", "Customers CSV", "warning"],
  ["changed role", "User · Diego Reyes → Editor", "warning"],
  ["refunded", "Order #5102", "warning"],
  ["deleted", "Product · Old Gift Card", "critical"],
  ["rotated", "API key · production", "critical"],
  ["failed sign-in", "Session", "critical"],
  ["updated", "Settings · Billing", "info"],
  ["invited", "User · Fatima Khan", "info"],
  ["enabled 2FA", "Account", "info"],
];
export const auditLogs: AuditLog[] = Array.from({ length: 40 }, (_, i) => {
  const [action, resource, severity] = arng.pick(actions);
  return {
    id: `log_${i + 1}`,
    actor: arng.pick(team).name,
    action,
    resource,
    ip: `${arng.int(10, 220)}.${arng.int(0, 255)}.${arng.int(0, 255)}.${arng.int(1, 254)}`,
    severity,
    createdAt: new Date(NOW - i * 0.27 * DAY - arng.int(0, 7200_000)).toISOString(),
  };
});

/* ------------------------------------------------------------------ */
/*  Aggregates for charts                                              */
/* ------------------------------------------------------------------ */

const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const crng = createRng(12);
export const revenueByMonth = months.map((month, i) => {
  const base = 42000 + i * 3600;
  const revenue = Math.round(base * crng.float(0.9, 1.12));
  return {
    month,
    revenue,
    expenses: Math.round(revenue * crng.float(0.52, 0.66)),
    lastYear: Math.round(base * 0.78 * crng.float(0.9, 1.08)),
  };
});

export const dailyTraffic = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(NOW - (29 - i) * DAY);
  const weekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
  const visitors = Math.round((weekend ? 3100 : 4300) * crng.float(0.85, 1.15) + i * 30);
  return {
    date: d.toISOString().slice(0, 10),
    label: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
    visitors,
    pageViews: Math.round(visitors * crng.float(2.6, 3.4)),
    signups: Math.round(visitors * crng.float(0.018, 0.03)),
  };
});

export const trafficSources = [
  { source: "Organic search", visitors: 48210 },
  { source: "Direct", visitors: 27940 },
  { source: "Social", visitors: 16380 },
  { source: "Referral", visitors: 9120 },
  { source: "Email", visitors: 6450 },
];

export const deviceSplit = [
  { device: "Desktop", share: 54 },
  { device: "Mobile", share: 39 },
  { device: "Tablet", share: 7 },
];

export const funnel = [
  { stage: "Visited site", value: 108100 },
  { stage: "Viewed product", value: 46300 },
  { stage: "Added to cart", value: 12900 },
  { stage: "Started checkout", value: 6840 },
  { stage: "Purchased", value: 3920 },
];

export const topCountries = [
  { country: "United States", code: "US", visitors: 38200, revenue: 182400 },
  { country: "India", code: "IN", visitors: 21400, revenue: 61200 },
  { country: "United Kingdom", code: "GB", visitors: 12900, revenue: 74300 },
  { country: "Germany", code: "DE", visitors: 9800, revenue: 58100 },
  { country: "Canada", code: "CA", visitors: 7400, revenue: 39800 },
  { country: "Brazil", code: "BR", visitors: 6100, revenue: 21900 },
];

export const salesByCategory = Object.entries(
  products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + p.sold * p.price;
    return acc;
  }, {}),
)
  .map(([category, revenue]) => ({ category, revenue }))
  .sort((a, b) => b.revenue - a.revenue);

/* ------------------------------------------------------------------ */
/*  Lookups                                                            */
/* ------------------------------------------------------------------ */

export const getCustomer = (id: string) => customers.find((c) => c.id === id);
export const getOrder = (id: string) => orders.find((o) => o.id === id);
export const getInvoice = (id: string) => invoices.find((i) => i.id === id);
export const getProduct = (id: string) => products.find((p) => p.id === id);
export const ordersForCustomer = (id: string) => orders.filter((o) => o.customerId === id);

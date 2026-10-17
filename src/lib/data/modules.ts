/**
 * Sample data for the extended business modules (CRM, HR, operations,
 * marketing…). Generated from fixed seeds so renders are deterministic.
 */
import { createRng, DAY, NOW, firstNames, lastNames, companies, locations } from "./seed";
import { customers, products, team } from "./index";

const iso = (offsetDays: number) => new Date(NOW + offsetDays * DAY).toISOString();
const person = (r: ReturnType<typeof createRng>) => `${r.pick(firstNames)} ${r.pick(lastNames)}`;
const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");
const staff = team.slice(0, 5).map((m) => m.name);

/* ------------------------------ Deals ------------------------------ */

export type DealStage = "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
export interface Deal {
  id: string;
  title: string;
  company: string;
  contact: string;
  value: number;
  stage: DealStage;
  probability: number;
  owner: string;
  closeDate: string;
  source: "Website" | "Referral" | "Outbound" | "Event" | "Partner";
}
const dr = createRng(101);
const dealNames = ["Annual license", "Platform upgrade", "Pilot program", "Enterprise rollout", "Support renewal", "Data migration", "Team expansion", "API add-on", "Multi-year contract", "Onboarding package"];
const stageProb: Record<DealStage, number> = { lead: 10, qualified: 25, proposal: 50, negotiation: 75, won: 100, lost: 0 };
export const deals: Deal[] = Array.from({ length: 28 }, (_, i) => {
  const stage = dr.weighted([["lead", 5], ["qualified", 5], ["proposal", 4], ["negotiation", 3], ["won", 3], ["lost", 2]] as const);
  const company = dr.pick(companies);
  return {
    id: `deal_${i + 1}`,
    title: `${company} – ${dr.pick(dealNames)}`,
    company,
    contact: person(dr),
    value: dr.int(4, 120) * 1000,
    stage,
    probability: stageProb[stage],
    owner: dr.pick(staff),
    closeDate: iso(dr.int(-20, 75)),
    source: dr.pick(["Website", "Referral", "Outbound", "Event", "Partner"] as const),
  };
});

/* ---------------------------- Employees ---------------------------- */

export interface Employee {
  id: string;
  name: string;
  email: string;
  title: string;
  department: "Engineering" | "Sales" | "Marketing" | "Support" | "Finance" | "Operations" | "People";
  location: string;
  type: "Full-time" | "Part-time" | "Contractor";
  status: "active" | "on-leave" | "onboarding" | "terminated";
  salary: number;
  startDate: string;
  manager: string;
}
const er = createRng(202);
const titles: Record<Employee["department"], string[]> = {
  Engineering: ["Frontend Engineer", "Backend Engineer", "Staff Engineer", "QA Engineer", "DevOps Engineer"],
  Sales: ["Account Executive", "Sales Development Rep", "Sales Manager"],
  Marketing: ["Content Marketer", "Growth Lead", "Designer"],
  Support: ["Support Specialist", "Support Lead"],
  Finance: ["Accountant", "Financial Analyst"],
  Operations: ["Operations Manager", "Logistics Coordinator"],
  People: ["HR Generalist", "Recruiter"],
};
export const employees: Employee[] = Array.from({ length: 42 }, (_, i) => {
  const name = person(er);
  const department = er.weighted([["Engineering", 5], ["Sales", 3], ["Marketing", 2], ["Support", 2], ["Finance", 1], ["Operations", 1.5], ["People", 1]] as const);
  const [country, city] = er.pick(locations);
  return {
    id: `emp_${100 + i}`,
    name,
    email: `${slug(name.split(" ")[0])}.${slug(name.split(" ")[1])}@nextadminpro.dev`,
    title: er.pick(titles[department]),
    department,
    location: `${city}, ${country}`,
    type: er.weighted([["Full-time", 8], ["Part-time", 1], ["Contractor", 1.5]] as const),
    status: er.weighted([["active", 12], ["on-leave", 1], ["onboarding", 1.2], ["terminated", 0.5]] as const),
    salary: er.int(45, 190) * 1000,
    startDate: iso(-er.int(10, 1800)),
    manager: er.pick(staff),
  };
});

/* ----------------------------- Time off ---------------------------- */

export interface LeaveRequest {
  id: string;
  employee: string;
  department: Employee["department"];
  type: "Vacation" | "Sick" | "Personal" | "Parental" | "Unpaid";
  from: string;
  to: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
}
const lr = createRng(303);
export const leaveRequests: LeaveRequest[] = Array.from({ length: 22 }, (_, i) => {
  const e = employees[(i * 2) % employees.length];
  const start = lr.int(-25, 40);
  const days = lr.int(1, 10);
  return {
    id: `lv_${i + 1}`,
    employee: e.name,
    department: e.department,
    type: lr.weighted([["Vacation", 6], ["Sick", 3], ["Personal", 2], ["Parental", 0.5], ["Unpaid", 0.5]] as const),
    from: iso(start),
    to: iso(start + days - 1),
    days,
    reason: lr.pick(["Family trip", "Doctor’s appointment", "Moving house", "Wedding", "Rest & recharge", "Conference travel"]),
    status: start > 3 ? lr.weighted([["pending", 3], ["approved", 2]] as const) : lr.weighted([["approved", 5], ["rejected", 1]] as const),
  };
});

/* ------------------------------ Payroll ---------------------------- */

export interface PayrollRun {
  id: string;
  period: string;
  payDate: string;
  employees: number;
  gross: number;
  taxes: number;
  benefits: number;
  net: number;
  status: "draft" | "scheduled" | "processing" | "paid";
}
const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
const pr = createRng(404);
export const payrollRuns: PayrollRun[] = months.map((m, i) => {
  const gross = Math.round(employees.filter((e) => e.status !== "terminated").reduce((a, e) => a + e.salary, 0) / 12 * pr.float(0.97, 1.03));
  const taxes = Math.round(gross * 0.22);
  const benefits = Math.round(gross * 0.08);
  return {
    id: `pay_${i + 1}`,
    period: `${m} 2026`,
    payDate: new Date(Date.UTC(2026, 4 + i, 28)).toISOString(),
    employees: 38 + Math.min(i, 3),
    gross,
    taxes,
    benefits,
    net: gross - taxes - benefits,
    status: i < 5 ? "paid" : i === 5 ? "processing" : "draft",
  };
});

/* ----------------------------- Projects ---------------------------- */

export interface Project {
  id: string;
  name: string;
  client: string;
  lead: string;
  status: "planning" | "active" | "on-hold" | "completed" | "at-risk";
  progress: number;
  budget: number;
  spent: number;
  start: string;
  due: string;
  team: string[];
}
const pj = createRng(505);
const projectNames = ["Website redesign", "Mobile app v2", "Data warehouse", "Brand refresh", "CRM integration", "Checkout optimisation", "Analytics platform", "Customer portal", "SEO overhaul", "Support automation", "Payments migration", "Partner API"];
export const projects: Project[] = projectNames.map((name, i) => {
  const status = pj.weighted([["planning", 1.5], ["active", 5], ["on-hold", 1], ["completed", 2], ["at-risk", 1.2]] as const);
  const budget = pj.int(15, 240) * 1000;
  const progress = status === "completed" ? 100 : status === "planning" ? pj.int(0, 15) : pj.int(20, 92);
  return {
    id: `prj_${i + 1}`,
    name,
    client: pj.pick(companies),
    lead: pj.pick(staff),
    status,
    progress,
    budget,
    spent: Math.round(budget * (progress / 100) * pj.float(0.8, 1.35)),
    start: iso(-pj.int(20, 200)),
    due: iso(status === "completed" ? -pj.int(1, 30) : pj.int(-5, 120)),
    team: pj.sample(staff, pj.int(2, 4)),
  };
});

/* ---------------------------- Timesheets --------------------------- */

export interface TimeEntry {
  id: string;
  date: string;
  member: string;
  project: string;
  task: string;
  hours: number;
  billable: boolean;
}
const tr = createRng(606);
export const timeEntries: TimeEntry[] = Array.from({ length: 60 }, (_, i) => ({
  id: `te_${i + 1}`,
  date: iso(-Math.floor(i / 6)).slice(0, 10),
  member: tr.pick(staff),
  project: tr.pick(projects).name,
  task: tr.pick(["Design review", "Implementation", "Client call", "Code review", "Planning", "QA testing", "Documentation", "Bug fixing"]),
  hours: tr.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 6]),
  billable: tr.next() > 0.25,
}));

/* ----------------------------- Expenses ---------------------------- */

export interface Expense {
  id: string;
  date: string;
  employee: string;
  category: "Travel" | "Meals" | "Software" | "Hardware" | "Office" | "Marketing";
  merchant: string;
  amount: number;
  status: "submitted" | "approved" | "rejected" | "reimbursed";
  receipt: boolean;
}
const xr = createRng(707);
const merchants: Record<Expense["category"], string[]> = {
  Travel: ["Delta Air Lines", "Uber", "Marriott", "Lufthansa"],
  Meals: ["Sweetgreen", "Blue Bottle", "Local Bistro"],
  Software: ["Figma", "GitHub", "Notion", "Slack"],
  Hardware: ["Apple Store", "Dell", "Logitech"],
  Office: ["Staples", "IKEA", "Amazon"],
  Marketing: ["Google Ads", "LinkedIn Ads", "Meta Ads"],
};
export const expenses: Expense[] = Array.from({ length: 36 }, (_, i) => {
  const category = xr.pick(Object.keys(merchants) as Expense["category"][]);
  return {
    id: `exp_${i + 1}`,
    date: iso(-xr.int(0, 60)),
    employee: xr.pick(staff),
    category,
    merchant: xr.pick(merchants[category]),
    amount: xr.float(8, category === "Hardware" || category === "Travel" ? 2400 : 400),
    status: xr.weighted([["submitted", 3], ["approved", 3], ["rejected", 0.6], ["reimbursed", 4]] as const),
    receipt: xr.next() > 0.12,
  };
});

/* ------------------------- Vendors & purchase orders ------------------------- */

export interface Vendor {
  id: string;
  name: string;
  contact: string;
  email: string;
  category: "Manufacturing" | "Logistics" | "Packaging" | "Software" | "Services";
  country: string;
  rating: number;
  terms: "Net 15" | "Net 30" | "Net 60" | "Prepaid";
  spend: number;
  status: "active" | "pending" | "inactive";
}
const vr = createRng(808);
const vendorNames = ["Apex Manufacturing", "BlueLine Logistics", "Crest Packaging", "Delta Components", "Evergreen Supply", "Forge Metals", "Global Freight Co.", "Horizon Textiles", "Ionic Electronics", "Jade Printing", "Keystone Services", "Lumen Software"];
export const vendors: Vendor[] = vendorNames.map((name, i) => {
  const contact = person(vr);
  return {
    id: `ven_${i + 1}`,
    name,
    contact,
    email: `${slug(contact.split(" ")[0])}@${slug(name)}.com`,
    category: vr.pick(["Manufacturing", "Logistics", "Packaging", "Software", "Services"] as const),
    country: vr.pick(locations)[0],
    rating: vr.float(3.2, 5, 1),
    terms: vr.pick(["Net 15", "Net 30", "Net 60", "Prepaid"] as const),
    spend: vr.int(8, 420) * 1000,
    status: vr.weighted([["active", 8], ["pending", 1.5], ["inactive", 1]] as const),
  };
});

export interface PurchaseOrder {
  id: string;
  number: string;
  vendor: string;
  items: number;
  total: number;
  ordered: string;
  expected: string;
  status: "draft" | "sent" | "confirmed" | "received" | "cancelled";
}
const po = createRng(909);
export const purchaseOrders: PurchaseOrder[] = Array.from({ length: 24 }, (_, i) => {
  const ordered = -po.int(0, 70);
  return {
    id: `po_${i + 1}`,
    number: `PO-2026-${(300 + 24 - i).toString()}`,
    vendor: po.pick(vendors).name,
    items: po.int(1, 18),
    total: po.int(4, 160) * 100,
    ordered: iso(ordered),
    expected: iso(ordered + po.int(5, 30)),
    status: ordered > -5 ? po.weighted([["draft", 1], ["sent", 2]] as const) : po.weighted([["confirmed", 2], ["received", 5], ["cancelled", 0.5]] as const),
  };
});

/* ---------------------------- Warehouses --------------------------- */

export interface StockMovement {
  id: string;
  date: string;
  product: string;
  sku: string;
  type: "inbound" | "outbound" | "transfer" | "adjustment";
  quantity: number;
  warehouse: string;
  reference: string;
  user: string;
}
export const warehouses = [
  { id: "wh_1", name: "Austin DC", city: "Austin, US", capacity: 12000, used: 8740 },
  { id: "wh_2", name: "Rotterdam Hub", city: "Rotterdam, NL", capacity: 9000, used: 7920 },
  { id: "wh_3", name: "Bengaluru FC", city: "Bengaluru, IN", capacity: 6000, used: 2810 },
  { id: "wh_4", name: "Sydney Depot", city: "Sydney, AU", capacity: 3500, used: 1340 },
];
const sm = createRng(1010);
export const stockMovements: StockMovement[] = Array.from({ length: 40 }, (_, i) => {
  const p = sm.pick(products);
  const type = sm.weighted([["inbound", 3], ["outbound", 5], ["transfer", 1.5], ["adjustment", 0.7]] as const);
  return {
    id: `mv_${i + 1}`,
    date: new Date(NOW - i * 0.4 * DAY).toISOString(),
    product: p.name,
    sku: p.sku,
    type,
    quantity: type === "outbound" ? -sm.int(1, 40) : type === "adjustment" ? sm.int(-6, 6) || 1 : sm.int(10, 300),
    warehouse: sm.pick(warehouses).name,
    reference: type === "inbound" ? `PO-2026-${sm.int(280, 323)}` : type === "outbound" ? `#${sm.int(5000, 5140)}` : `TR-${sm.int(100, 199)}`,
    user: sm.pick(staff),
  };
});

/* ----------------------------- Shipments --------------------------- */

export interface Shipment {
  id: string;
  tracking: string;
  order: string;
  customer: string;
  carrier: "UPS" | "FedEx" | "DHL" | "USPS";
  origin: string;
  destination: string;
  status: "label-created" | "in-transit" | "out-for-delivery" | "delivered" | "exception";
  shippedAt: string;
  eta: string;
  weight: number;
}
const sh = createRng(1111);
export const shipments: Shipment[] = Array.from({ length: 30 }, (_, i) => {
  const c = customers[i * 2];
  const carrier = sh.pick(["UPS", "FedEx", "DHL", "USPS"] as const);
  const shipped = -sh.int(0, 12);
  return {
    id: `shp_${i + 1}`,
    tracking: `${carrier === "UPS" ? "1Z" : carrier === "DHL" ? "JD" : ""}${sh.int(100000000, 999999999)}${sh.int(100, 999)}`,
    order: `#${5140 - i}`,
    customer: c.name,
    carrier,
    origin: sh.pick(warehouses).city,
    destination: `${c.city}, ${c.country}`,
    status: shipped > -1 ? "label-created" : shipped > -3 ? sh.weighted([["in-transit", 3], ["out-for-delivery", 1]] as const) : sh.weighted([["delivered", 8], ["exception", 0.8], ["in-transit", 1]] as const),
    shippedAt: iso(shipped),
    eta: iso(shipped + sh.int(2, 6)),
    weight: sh.float(0.2, 18, 1),
  };
});

/* --------------------------- Subscriptions ------------------------- */

export interface Subscription {
  id: string;
  customer: string;
  email: string;
  plan: "Starter" | "Pro" | "Business" | "Enterprise";
  interval: "monthly" | "yearly";
  mrr: number;
  seats: number;
  status: "active" | "trialing" | "past-due" | "cancelled";
  started: string;
  renews: string;
}
const su = createRng(1212);
const planPrice = { Starter: 19, Pro: 49, Business: 99, Enterprise: 399 } as const;
export const subscriptions: Subscription[] = Array.from({ length: 36 }, (_, i) => {
  const c = customers[i];
  const plan = su.weighted([["Starter", 4], ["Pro", 4], ["Business", 2], ["Enterprise", 0.8]] as const);
  const seats = plan === "Enterprise" ? su.int(20, 200) : su.int(1, 15);
  const interval = su.weighted([["monthly", 3], ["yearly", 2]] as const);
  return {
    id: `sub_${i + 1}`,
    customer: c.company === "—" ? c.name : `${c.company}`,
    email: c.email,
    plan,
    interval,
    mrr: Math.round(planPrice[plan] * seats * (interval === "yearly" ? 0.8 : 1)),
    seats,
    status: su.weighted([["active", 10], ["trialing", 2], ["past-due", 1], ["cancelled", 1.2]] as const),
    started: iso(-su.int(5, 700)),
    renews: iso(su.int(1, 360)),
  };
});

export const mrrHistory = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((month, i) => ({
  month,
  mrr: Math.round(31000 + i * 2900 + Math.sin(i) * 900),
}));

/* ---------------------------- Transactions ------------------------- */

export interface Transaction {
  id: string;
  date: string;
  description: string;
  customer: string;
  method: "Visa" | "Mastercard" | "Amex" | "PayPal" | "Bank transfer" | "Apple Pay";
  type: "charge" | "refund" | "payout" | "fee";
  amount: number;
  status: "succeeded" | "pending" | "failed";
}
const tx = createRng(1313);
export const transactions: Transaction[] = Array.from({ length: 50 }, (_, i) => {
  const type = tx.weighted([["charge", 10], ["refund", 1], ["payout", 1], ["fee", 1.2]] as const);
  const amount = type === "fee" ? -tx.float(0.3, 25) : type === "refund" ? -tx.float(20, 300) : type === "payout" ? -tx.float(4000, 26000) : tx.float(15, 900);
  return {
    id: `txn_${(9000 + 50 - i).toString(36)}${tx.int(100, 999)}`,
    date: new Date(NOW - i * 0.35 * DAY).toISOString(),
    description: type === "charge" ? `Order #${5140 - i}` : type === "refund" ? `Refund for #${5100 - i}` : type === "payout" ? "Payout to bank ••4410" : "Processing fee",
    customer: type === "payout" || type === "fee" ? "—" : customers[i % customers.length].name,
    method: type === "payout" ? "Bank transfer" : tx.pick(["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay"] as const),
    type,
    amount: Math.round(amount * 100) / 100,
    status: tx.weighted([["succeeded", 12], ["pending", 1.2], ["failed", 0.8]] as const),
  };
});

/* ----------------------------- Campaigns --------------------------- */

export interface Campaign {
  id: string;
  name: string;
  channel: "Email" | "SMS" | "Push" | "Social";
  audience: string;
  recipients: number;
  openRate: number;
  clickRate: number;
  revenue: number;
  status: "draft" | "scheduled" | "sending" | "sent" | "paused";
  sendAt: string;
}
const cp = createRng(1414);
const campaignNames = ["Fall collection launch", "Black Friday early access", "Cart abandonment reminder", "Welcome series #1", "Win-back: 90 days inactive", "Product update – October", "VIP exclusive offer", "Webinar invitation", "Customer survey", "Holiday gift guide"];
export const campaigns: Campaign[] = campaignNames.map((name, i) => {
  const status = i < 2 ? "scheduled" : i === 2 ? "sending" : i === 9 ? "draft" : cp.weighted([["sent", 8], ["paused", 1]] as const);
  const recipients = cp.int(800, 42000);
  return {
    id: `cmp_${i + 1}`,
    name,
    channel: cp.weighted([["Email", 6], ["SMS", 1.5], ["Push", 1], ["Social", 1]] as const),
    audience: cp.pick(["All subscribers", "VIP customers", "New sign-ups", "Inactive 90d", "Cart abandoners", "Enterprise accounts"]),
    recipients,
    openRate: status === "sent" || status === "sending" ? cp.float(18, 58, 1) : 0,
    clickRate: status === "sent" || status === "sending" ? cp.float(1.5, 12, 1) : 0,
    revenue: status === "sent" ? cp.int(0, 380) * 100 : 0,
    status,
    sendAt: iso(status === "scheduled" ? cp.int(1, 30) : status === "draft" ? 14 : -cp.int(1, 90)),
  };
});

/* ------------------------------ Reviews ---------------------------- */

export interface Review {
  id: string;
  product: string;
  customer: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  status: "pending" | "published" | "hidden";
  verified: boolean;
  replied: boolean;
}
const rv = createRng(1515);
const reviewText: [number, string, string][] = [
  [5, "Absolutely love it", "Exceeded my expectations. Build quality is fantastic and shipping was fast."],
  [4, "Great value", "Really good for the price. Minor issue with packaging but the product is solid."],
  [5, "Best purchase this year", "I use it every day. Would buy again without hesitation."],
  [3, "It’s okay", "Does the job, but I expected a bit more for the price."],
  [2, "Disappointed", "Stopped working properly after two weeks. Support was helpful though."],
  [5, "Highly recommend", "Beautiful design and works perfectly. My whole team ordered one."],
  [4, "Solid product", "Comfortable and well made. Took a few days to get used to it."],
  [1, "Arrived damaged", "The box was crushed and the item was scratched. Waiting on a replacement."],
];
export const reviews: Review[] = Array.from({ length: 26 }, (_, i) => {
  const [rating, title, body] = rv.pick(reviewText);
  return {
    id: `rev_${i + 1}`,
    product: rv.pick(products).name,
    customer: customers[(i * 5) % customers.length].name,
    rating,
    title,
    body,
    date: iso(-rv.int(0, 90)),
    status: i < 5 ? "pending" : rv.weighted([["published", 9], ["hidden", 1]] as const),
    verified: rv.next() > 0.2,
    replied: rv.next() > 0.6,
  };
});

/* ------------------------- Blog & knowledge base ------------------------- */

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  status: "draft" | "scheduled" | "published";
  views: number;
  date: string;
}
const bp = createRng(1616);
const postTitles = ["10 dashboard design tips for SaaS founders", "How we cut checkout time by 40%", "Announcing NextAdminPro 1.1", "A guide to role-based access control", "Choosing KPIs that actually matter", "Inventory forecasting for small shops", "Building accessible data tables", "Dark mode done right", "Customer support metrics that drive retention", "Scaling your team’s workflow with kanban"];
export const posts: Post[] = postTitles.map((title, i) => ({
  id: `post_${i + 1}`,
  title,
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  excerpt: "A practical look at what works, what doesn’t, and how to apply it to your own product.",
  author: bp.pick(staff),
  category: bp.pick(["Product", "Engineering", "Design", "Growth", "Company"]),
  tags: bp.sample(["dashboard", "saas", "ux", "nextjs", "analytics", "ecommerce"], 2),
  status: i === 0 ? "draft" : i === 1 ? "scheduled" : "published",
  views: i < 2 ? 0 : bp.int(300, 24000),
  date: iso(i === 1 ? 4 : -i * 6 - bp.int(0, 4)),
}));

export interface Article {
  id: string;
  title: string;
  collection: "Getting started" | "Account & billing" | "Orders & shipping" | "Integrations" | "Troubleshooting";
  status: "published" | "draft";
  views: number;
  helpful: number;
  updated: string;
  author: string;
}
const kb = createRng(1717);
const articleTitles: [string, Article["collection"]][] = [
  ["Creating your account", "Getting started"], ["Inviting your team", "Getting started"], ["Importing products from CSV", "Getting started"],
  ["Updating your payment method", "Account & billing"], ["Downloading invoices", "Account & billing"], ["Changing your plan", "Account & billing"],
  ["Tracking a shipment", "Orders & shipping"], ["Processing a refund", "Orders & shipping"], ["Setting shipping rates", "Orders & shipping"],
  ["Connecting Stripe", "Integrations"], ["Slack notifications", "Integrations"], ["Using the REST API", "Integrations"],
  ["I can’t log in", "Troubleshooting"], ["Emails aren’t arriving", "Troubleshooting"], ["Fixing a 429 rate-limit error", "Troubleshooting"],
];
export const articles: Article[] = articleTitles.map(([title, collection], i) => ({
  id: `kb_${i + 1}`,
  title,
  collection,
  status: i % 7 === 6 ? "draft" : "published",
  views: kb.int(120, 18000),
  helpful: kb.int(62, 98),
  updated: iso(-kb.int(1, 120)),
  author: kb.pick(staff),
}));

/* ---------------------------- Appointments -------------------------- */

export interface Appointment {
  id: string;
  client: string;
  email: string;
  service: "Product demo" | "Onboarding call" | "Consultation" | "Quarterly review" | "Support session";
  staff: string;
  date: string;
  time: string;
  duration: number;
  location: "Zoom" | "Google Meet" | "Phone" | "In person";
  status: "confirmed" | "pending" | "completed" | "cancelled" | "no-show";
}
const ap = createRng(1818);
export const appointments: Appointment[] = Array.from({ length: 28 }, (_, i) => {
  const c = customers[(i * 3 + 2) % customers.length];
  const offset = ap.int(-10, 18);
  return {
    id: `apt_${i + 1}`,
    client: c.name,
    email: c.email,
    service: ap.pick(["Product demo", "Onboarding call", "Consultation", "Quarterly review", "Support session"] as const),
    staff: ap.pick(staff),
    date: iso(offset).slice(0, 10),
    time: `${ap.int(8, 17).toString().padStart(2, "0")}:${ap.pick(["00", "30"])}`,
    duration: ap.pick([15, 30, 45, 60]),
    location: ap.pick(["Zoom", "Google Meet", "Phone", "In person"] as const),
    status: offset < 0 ? ap.weighted([["completed", 6], ["cancelled", 1], ["no-show", 0.6]] as const) : ap.weighted([["confirmed", 4], ["pending", 1.5], ["cancelled", 0.4]] as const),
  };
});

/* ----------------------------- Contracts --------------------------- */

export interface Contract {
  id: string;
  title: string;
  party: string;
  type: "Customer" | "Vendor" | "NDA" | "Employment" | "Partnership";
  value: number;
  owner: string;
  status: "draft" | "sent" | "signed" | "expired" | "declined";
  start: string;
  end: string;
  autoRenew: boolean;
}
const ct = createRng(1919);
export const contracts: Contract[] = Array.from({ length: 22 }, (_, i) => {
  const type = ct.pick(["Customer", "Vendor", "NDA", "Employment", "Partnership"] as const);
  const party = type === "Vendor" ? ct.pick(vendors).name : type === "Employment" ? ct.pick(employees).name : ct.pick(companies);
  const start = -ct.int(0, 500);
  const end = start + ct.pick([180, 365, 730]);
  return {
    id: `ctr_${i + 1}`,
    title: `${type === "NDA" ? "Mutual NDA" : type === "Employment" ? "Employment agreement" : `${type} agreement`} – ${party}`,
    party,
    type,
    value: type === "NDA" ? 0 : ct.int(5, 300) * 1000,
    owner: ct.pick(staff),
    status: end < 0 ? "expired" : start > -7 ? ct.weighted([["draft", 1], ["sent", 2]] as const) : ct.weighted([["signed", 8], ["declined", 0.5]] as const),
    start: iso(start),
    end: iso(end),
    autoRenew: ct.next() > 0.5,
  };
});

/* ---------------------------- Integrations -------------------------- */

export interface Integration {
  id: string;
  name: string;
  category: "Payments" | "Communication" | "Analytics" | "Storage" | "Marketing" | "Developer" | "Accounting";
  description: string;
  connected: boolean;
  popular?: boolean;
  color: string;
}
export const integrations: Integration[] = [
  { id: "stripe", name: "Stripe", category: "Payments", description: "Accept cards, wallets and subscriptions.", connected: true, popular: true, color: "#635bff" },
  { id: "paypal", name: "PayPal", category: "Payments", description: "Let customers pay with PayPal and Venmo.", connected: false, color: "#003087" },
  { id: "slack", name: "Slack", category: "Communication", description: "Send orders, tickets and alerts to channels.", connected: true, popular: true, color: "#4a154b" },
  { id: "teams", name: "Microsoft Teams", category: "Communication", description: "Notifications and approvals in Teams.", connected: false, color: "#5059c9" },
  { id: "twilio", name: "Twilio", category: "Communication", description: "SMS and WhatsApp notifications.", connected: false, color: "#f22f46" },
  { id: "ga", name: "Google Analytics", category: "Analytics", description: "Sync traffic and conversion data.", connected: true, color: "#e37400" },
  { id: "mixpanel", name: "Mixpanel", category: "Analytics", description: "Product analytics and funnels.", connected: false, color: "#7856ff" },
  { id: "s3", name: "Amazon S3", category: "Storage", description: "Store uploads and exports in your bucket.", connected: false, popular: true, color: "#e25444" },
  { id: "gdrive", name: "Google Drive", category: "Storage", description: "Attach and share Drive files.", connected: false, color: "#1fa463" },
  { id: "mailchimp", name: "Mailchimp", category: "Marketing", description: "Sync customers to audiences.", connected: true, color: "#ffe01b" },
  { id: "hubspot", name: "HubSpot", category: "Marketing", description: "Two-way CRM contact and deal sync.", connected: false, popular: true, color: "#ff7a59" },
  { id: "github", name: "GitHub", category: "Developer", description: "Link issues and deployments.", connected: false, color: "#24292f" },
  { id: "zapier", name: "Zapier", category: "Developer", description: "Automate workflows with 6,000+ apps.", connected: false, popular: true, color: "#ff4f00" },
  { id: "webhooks", name: "Webhooks", category: "Developer", description: "Real-time events to your own endpoint.", connected: true, color: "#2a78d6" },
  { id: "quickbooks", name: "QuickBooks", category: "Accounting", description: "Sync invoices, payments and expenses.", connected: false, color: "#2ca01c" },
  { id: "xero", name: "Xero", category: "Accounting", description: "Automatic bookkeeping and reconciliation.", connected: false, color: "#13b5ea" },
];

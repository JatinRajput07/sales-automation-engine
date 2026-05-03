import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ModuleId =
  | "sales" | "hrms" | "pms" | "finance" | "wayofwork"
  | "mastersheet" | "frd" | "portfolio" | "staffing" | "canteen";

export const ALL_MODULES: { id: ModuleId; name: string; defaultPrice: number }[] = [
  { id: "sales", name: "Sales", defaultPrice: 2999 },
  { id: "hrms", name: "HRMS", defaultPrice: 1999 },
  { id: "pms", name: "PMS", defaultPrice: 1999 },
  { id: "finance", name: "Finance", defaultPrice: 1499 },
  { id: "wayofwork", name: "WayOfWork", defaultPrice: 999 },
  { id: "mastersheet", name: "Master Sheet", defaultPrice: 999 },
  { id: "frd", name: "FRD", defaultPrice: 499 },
  { id: "portfolio", name: "Portfolio", defaultPrice: 999 },
  { id: "staffing", name: "Staffing", defaultPrice: 1499 },
  { id: "canteen", name: "Canteen", defaultPrice: 499 },
];

export type PlanCode = "trial" | "starter" | "growth" | "pro" | "enterprise" | "custom";
export type TenantStatus = "active" | "trial" | "suspended" | "cancelled" | "payment_failed";

export interface Plan {
  id: string;
  code: PlanCode;
  name: string;
  price: number;
  cycle: "monthly" | "annual";
  maxUsers: number | null;
  maxModules: number | null;
  storageGb: number;
  apiPerMonth: number;
  modules: ModuleId[];
  support: string;
  features: string[];
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  industry?: string;
  country: string;
  website?: string;
  plan: PlanCode;
  modules: ModuleId[];
  users: number;
  mrr: number;
  status: TenantStatus;
  signupAt: string;
  expiresAt: string;
  lastLoginAt?: string;
  billingCycle: "monthly" | "annual";
  customDealId?: string;
  notes?: string;
  adminName?: string;
  adminEmail?: string;
}

export interface Invoice {
  id: string;
  tenantId: string;
  number: string;
  period: string;
  amount: number;
  tax: number;
  total: number;
  status: "paid" | "pending" | "overdue" | "failed" | "refunded";
  dueDate: string;
  paidDate?: string;
}

export interface DemoRequest {
  id: string;
  number: string;
  company: string;
  contact: string;
  email: string;
  phone?: string;
  modules: ModuleId[];
  source: "Website" | "LinkedIn" | "Referral" | "Cold" | "Event";
  message?: string;
  requestedAt: string;
  status: "new" | "contacted" | "scheduled" | "done" | "converted" | "rejected" | "no_response";
  assignedTo?: string;
  scheduledAt?: string;
  meetingLink?: string;
  notes: { at: string; text: string }[];
}

export interface CustomDeal {
  id: string;
  number: string;
  name: string;
  tenantId: string;
  owner: string;
  modules: { id: ModuleId; price: number }[];
  standardPrice: number;
  customPrice: number;
  discountPct: number;
  cycle: "monthly" | "annual";
  duration: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentTerms: string;
  status: "active" | "negotiating" | "expired" | "cancelled";
  notes?: string;
}

export interface SupportTicket {
  id: string;
  number: string;
  tenantId: string;
  contact: string;
  subject: string;
  category: string;
  priority: "P1" | "P2" | "P3" | "P4";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedTo?: string;
  createdAt: string;
  lastReplyAt: string;
  thread: { from: "agent" | "tenant"; at: string; text: string }[];
  internalNotes: { at: string; text: string }[];
}

export interface Announcement {
  id: string;
  title: string;
  type: "Feature Update" | "Maintenance" | "Billing" | "Important" | "New Module";
  content: string;
  audience: "all" | "plans" | "modules" | "tenants";
  audienceList: string[];
  channels: ("inapp" | "email")[];
  scheduledAt?: string;
  sentAt?: string;
  status: "draft" | "scheduled" | "sent";
}

export interface ModuleConfig {
  id: ModuleId;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  status: "active" | "beta" | "maintenance" | "deprecated";
  maintenanceMsg?: string;
  changelog: string;
  schemaName: string;
}

export interface ActivityLog {
  id: string;
  at: string;
  tenantId?: string;
  type: string;
  text: string;
}

const now = Date.now();
const days = (n: number) => new Date(now + n * 86400000).toISOString();
const ago = (n: number) => new Date(now - n * 86400000).toISOString();

const seedPlans: Plan[] = [
  { id: "p_starter", code: "starter", name: "Starter", price: 999, cycle: "monthly", maxUsers: 10, maxModules: 3, storageGb: 5, apiPerMonth: 10000, modules: ["sales", "hrms", "pms"], support: "Email", features: ["10 users", "3 modules", "Basic support"] },
  { id: "p_growth", code: "growth", name: "Growth", price: 2999, cycle: "monthly", maxUsers: 50, maxModules: 6, storageGb: 25, apiPerMonth: 100000, modules: ["sales", "hrms", "pms", "finance", "wayofwork", "mastersheet"], support: "Priority Email", features: ["50 users", "6 modules", "Priority support"] },
  { id: "p_pro", code: "pro", name: "Pro", price: 5999, cycle: "monthly", maxUsers: 200, maxModules: null, storageGb: 100, apiPerMonth: 500000, modules: ["sales", "hrms", "pms", "finance", "wayofwork", "mastersheet", "frd", "portfolio", "staffing", "canteen"], support: "Dedicated CSM", features: ["200 users", "All modules", "Dedicated CSM"] },
  { id: "p_ent", code: "enterprise", name: "Enterprise", price: 0, cycle: "monthly", maxUsers: null, maxModules: null, storageGb: 1000, apiPerMonth: 5000000, modules: ["sales", "hrms", "pms", "finance", "wayofwork", "mastersheet", "frd", "portfolio", "staffing", "canteen"], support: "SLA + CSM", features: ["Unlimited", "All modules", "SLA + CSM"] },
];

const seedTenants: Tenant[] = [
  { id: "t1", name: "TechCorp India", slug: "techcorp-india", email: "billing@techcorp.in", country: "India", industry: "Software", plan: "growth", modules: ["sales","hrms","pms","finance","wayofwork","mastersheet"], users: 34, mrr: 14999, status: "active", signupAt: ago(450), expiresAt: days(45), lastLoginAt: ago(0), billingCycle: "monthly", adminName: "Arjun Mehta", adminEmail: "arjun@techcorp.in" },
  { id: "t2", name: "Infosys", slug: "infosys", email: "ap@infosys.com", country: "India", industry: "IT Services", plan: "enterprise", modules: ["sales","hrms","pms","finance","wayofwork","mastersheet","frd","portfolio","staffing","canteen"], users: 250, mrr: 45000, status: "active", signupAt: ago(720), expiresAt: days(180), lastLoginAt: ago(0), billingCycle: "annual" },
  { id: "t3", name: "Wipro", slug: "wipro", email: "ap@wipro.com", country: "India", industry: "IT Services", plan: "custom", modules: ["pms","hrms","wayofwork"], users: 180, mrr: 8999, status: "active", signupAt: ago(300), expiresAt: days(3), lastLoginAt: ago(1), billingCycle: "annual", customDealId: "cd1" },
  { id: "t4", name: "Zomato", slug: "zomato", email: "ops@zomato.com", country: "India", industry: "Food Tech", plan: "pro", modules: ALL_MODULES.map(m=>m.id), users: 120, mrr: 9999, status: "active", signupAt: ago(200), expiresAt: days(60), lastLoginAt: ago(0), billingCycle: "monthly" },
  { id: "t5", name: "Razorpay", slug: "razorpay", email: "team@razorpay.com", country: "India", industry: "Fintech", plan: "trial", modules: ALL_MODULES.map(m=>m.id), users: 8, mrr: 0, status: "trial", signupAt: ago(12), expiresAt: days(2), lastLoginAt: ago(0), billingCycle: "monthly" },
  { id: "t6", name: "Nykaa", slug: "nykaa", email: "tech@nykaa.com", country: "India", industry: "E-commerce", plan: "growth", modules: ["sales","hrms","pms","finance","wayofwork","mastersheet"], users: 42, mrr: 14999, status: "active", signupAt: ago(380), expiresAt: days(5), lastLoginAt: ago(0), billingCycle: "monthly" },
  { id: "t7", name: "StartupXYZ", slug: "startupxyz", email: "founder@startupxyz.com", country: "India", industry: "SaaS", plan: "starter", modules: ["sales","hrms","pms"], users: 6, mrr: 999, status: "active", signupAt: ago(90), expiresAt: days(8), lastLoginAt: ago(15), billingCycle: "monthly" },
  { id: "t8", name: "DesignHub", slug: "designhub", email: "hi@designhub.io", country: "India", industry: "Design Agency", plan: "starter", modules: ["sales","hrms","pms"], users: 5, mrr: 999, status: "payment_failed", signupAt: ago(140), expiresAt: days(10), lastLoginAt: ago(3), billingCycle: "monthly" },
  { id: "t9", name: "InnovateLtd", slug: "innovate", email: "info@innovate.com", country: "India", industry: "Consulting", plan: "growth", modules: ["sales","hrms","pms","finance","wayofwork","mastersheet"], users: 24, mrr: 14999, status: "suspended", signupAt: ago(210), expiresAt: days(20), lastLoginAt: ago(35), billingCycle: "monthly" },
  { id: "t10", name: "UrbanPro", slug: "urbanpro", email: "ops@urbanpro.com", country: "India", industry: "EdTech", plan: "pro", modules: ALL_MODULES.map(m=>m.id), users: 80, mrr: 9999, status: "active", signupAt: ago(260), expiresAt: days(95), lastLoginAt: ago(1), billingCycle: "monthly" },
  { id: "t11", name: "MedTech India", slug: "medtech", email: "info@medtech.in", country: "India", industry: "Healthcare", plan: "custom", modules: ["hrms","pms","finance","wayofwork"], users: 60, mrr: 12000, status: "active", signupAt: ago(150), expiresAt: days(120), lastLoginAt: ago(0), billingCycle: "annual", customDealId: "cd3" },
  { id: "t12", name: "TechGiant", slug: "techgiant", email: "talks@techgiant.com", country: "India", industry: "Enterprise", plan: "custom", modules: ["sales","finance"], users: 0, mrr: 0, status: "trial", signupAt: ago(7), expiresAt: days(21), billingCycle: "annual", customDealId: "cd4" },
];

const seedInvoices: Invoice[] = seedTenants.flatMap((t, idx) => t.mrr > 0 ? [
  { id: `inv${idx}a`, tenantId: t.id, number: `INV-2025-${1000+idx}`, period: "Apr 2025", amount: t.mrr, tax: Math.round(t.mrr * 0.18), total: Math.round(t.mrr * 1.18), status: t.status === "payment_failed" ? "failed" : "paid" as const, dueDate: ago(5), paidDate: t.status === "payment_failed" ? undefined : ago(3) },
  { id: `inv${idx}b`, tenantId: t.id, number: `INV-2025-${2000+idx}`, period: "May 2025", amount: t.mrr, tax: Math.round(t.mrr * 0.18), total: Math.round(t.mrr * 1.18), status: "pending" as const, dueDate: days(5) },
] : []);

const seedDemoRequests: DemoRequest[] = [
  { id: "dr1", number: "DR-0042", company: "BuilderSpace", contact: "Vikram Singh", email: "vikram@builderspace.io", phone: "+91 98765 43210", modules: ["sales","pms"], source: "Website", message: "Need PMS for construction projects", requestedAt: ago(1), status: "new", notes: [] },
  { id: "dr2", number: "DR-0041", company: "HealthFirst", contact: "Dr. Kavita", email: "kavita@healthfirst.in", modules: ["hrms","pms"], source: "LinkedIn", requestedAt: ago(3), status: "scheduled", scheduledAt: days(2), meetingLink: "https://meet.google.com/abc-def", assignedTo: "Rahul S", notes: [{ at: ago(2), text: "First call done. Interested." }] },
  { id: "dr3", number: "DR-0040", company: "LogiCo", contact: "Ramesh", email: "ramesh@logico.com", modules: ["sales","finance"], source: "Referral", requestedAt: ago(5), status: "done", assignedTo: "Priya N", notes: [] },
  { id: "dr4", number: "DR-0039", company: "RetailPro", contact: "Sneha", email: "sneha@retailpro.in", modules: ["sales","hrms","pms"], source: "Cold", requestedAt: ago(10), status: "converted", notes: [] },
  { id: "dr5", number: "DR-0038", company: "FinanceApp", contact: "Manish", email: "manish@financeapp.io", modules: ["finance"], source: "Event", requestedAt: ago(14), status: "rejected", notes: [{ at: ago(12), text: "Budget too low" }] },
];

const seedDeals: CustomDeal[] = [
  { id: "cd1", number: "CD-0001", name: "Wipro PMS+HRMS+WoW Bundle", tenantId: "t3", owner: "Rahul S", modules: [{ id: "pms", price: 1999 }, { id: "hrms", price: 1999 }, { id: "wayofwork", price: 999 }], standardPrice: 4997, customPrice: 8999, discountPct: 0, cycle: "monthly", duration: "1 year", startDate: ago(300), endDate: days(65), autoRenew: true, paymentTerms: "Net 30", status: "active", notes: "Strategic account" },
  { id: "cd2", number: "CD-0002", name: "InnovateLtd Sales+Finance", tenantId: "t9", owner: "Priya N", modules: [{ id: "sales", price: 2999 }, { id: "finance", price: 1499 }], standardPrice: 4498, customPrice: 3499, discountPct: 22, cycle: "monthly", duration: "6 months", startDate: ago(210), endDate: days(0), autoRenew: false, paymentTerms: "Advance", status: "expired" },
  { id: "cd3", number: "CD-0003", name: "MedTech Healthcare Bundle", tenantId: "t11", owner: "Rahul S", modules: [{ id: "hrms", price: 1999 }, { id: "pms", price: 1999 }, { id: "finance", price: 1499 }, { id: "wayofwork", price: 999 }], standardPrice: 6496, customPrice: 12000, discountPct: 0, cycle: "annual", duration: "2 years", startDate: ago(150), endDate: days(580), autoRenew: true, paymentTerms: "Net 15", status: "active" },
  { id: "cd4", number: "CD-0004", name: "TechGiant Enterprise Talks", tenantId: "t12", owner: "Anil K", modules: [{ id: "sales", price: 2999 }, { id: "finance", price: 1499 }], standardPrice: 4498, customPrice: 3999, discountPct: 11, cycle: "annual", duration: "1 year", startDate: days(0), endDate: days(365), autoRenew: false, paymentTerms: "Advance", status: "negotiating" },
];

const seedTickets: SupportTicket[] = [
  { id: "tk1", number: "SUP-0042", tenantId: "t1", contact: "Arjun Mehta", subject: "Sales module leads not loading", category: "Bug", priority: "P2", status: "open", assignedTo: "Rahul S", createdAt: ago(0), lastReplyAt: ago(0), thread: [{ from: "tenant", at: ago(0), text: "Leads page is blank since morning." }], internalNotes: [{ at: ago(0), text: "Possibly tenant cache issue" }] },
  { id: "tk2", number: "SUP-0041", tenantId: "t6", contact: "Anita", subject: "Add user limit", category: "Account", priority: "P3", status: "in_progress", assignedTo: "Priya N", createdAt: ago(1), lastReplyAt: ago(0), thread: [{ from: "tenant", at: ago(1), text: "Need to add 5 more users" }, { from: "agent", at: ago(0), text: "Upgrading limits now." }], internalNotes: [] },
  { id: "tk3", number: "SUP-0040", tenantId: "t8", contact: "Rohit", subject: "Payment failed", category: "Billing", priority: "P1", status: "open", assignedTo: "Anil K", createdAt: ago(2), lastReplyAt: ago(1), thread: [{ from: "tenant", at: ago(2), text: "Auto-charge failed thrice" }], internalNotes: [] },
];

const seedAnnouncements: Announcement[] = [
  { id: "an1", title: "New Portfolio module released", type: "New Module", content: "Portfolio module is now available. Enable from settings.", audience: "all", audienceList: [], channels: ["inapp", "email"], sentAt: ago(7), status: "sent" },
  { id: "an2", title: "Scheduled maintenance Apr 28", type: "Maintenance", content: "Sales module maintenance from 2-4 AM IST.", audience: "modules", audienceList: ["sales"], channels: ["inapp"], scheduledAt: days(2), status: "scheduled" },
];

const seedModuleConfig: ModuleConfig[] = ALL_MODULES.map(m => ({
  id: m.id, name: m.name, description: `${m.name} module`, monthlyPrice: m.defaultPrice, annualPrice: m.defaultPrice * 10, status: "active", changelog: "Initial release", schemaName: `${m.id}_db`,
}));

const seedActivity: ActivityLog[] = [
  { id: "a1", at: ago(0), tenantId: "t1", type: "upgrade", text: "TechCorp upgraded Starter → Growth" },
  { id: "a2", at: ago(0), tenantId: "t12", type: "trial", text: "New trial signup: TechGiant" },
  { id: "a3", at: ago(1), tenantId: "t3", type: "module", text: "Wipro added HRMS module" },
  { id: "a4", at: ago(1), tenantId: "t8", type: "payment", text: "DesignHub payment failed" },
  { id: "a5", at: ago(2), type: "demo", text: "Demo request: BuilderSpace" },
];

interface State {
  authed: boolean;
  setAuthed: (v: boolean) => void;
  impersonating: string | null;
  setImpersonating: (id: string | null) => void;

  plans: Plan[];
  tenants: Tenant[];
  invoices: Invoice[];
  demoRequests: DemoRequest[];
  customDeals: CustomDeal[];
  tickets: SupportTicket[];
  announcements: Announcement[];
  moduleConfigs: ModuleConfig[];
  activity: ActivityLog[];

  addTenant: (t: Tenant) => void;
  updateTenant: (id: string, patch: Partial<Tenant>) => void;
  toggleTenantModule: (id: string, mod: ModuleId) => void;
  suspendTenant: (id: string) => void;

  addPlan: (p: Plan) => void;
  updatePlan: (id: string, patch: Partial<Plan>) => void;

  addInvoice: (i: Invoice) => void;
  markInvoicePaid: (id: string) => void;

  addDemoRequest: (d: DemoRequest) => void;
  updateDemoRequest: (id: string, patch: Partial<DemoRequest>) => void;
  addDemoNote: (id: string, text: string) => void;

  addCustomDeal: (d: CustomDeal) => void;
  updateCustomDeal: (id: string, patch: Partial<CustomDeal>) => void;

  addTicket: (t: SupportTicket) => void;
  updateTicket: (id: string, patch: Partial<SupportTicket>) => void;
  replyTicket: (id: string, text: string, from: "agent" | "tenant") => void;
  addInternalNote: (id: string, text: string) => void;

  addAnnouncement: (a: Announcement) => void;
  updateModuleConfig: (id: ModuleId, patch: Partial<ModuleConfig>) => void;

  logActivity: (text: string, type: string, tenantId?: string) => void;
}

export const useSuperAdminStore = create<State>()(persist((set, get) => ({
  authed: false,
  setAuthed: (v) => set({ authed: v }),
  impersonating: null,
  setImpersonating: (id) => set({ impersonating: id }),

  plans: seedPlans,
  tenants: seedTenants,
  invoices: seedInvoices,
  demoRequests: seedDemoRequests,
  customDeals: seedDeals,
  tickets: seedTickets,
  announcements: seedAnnouncements,
  moduleConfigs: seedModuleConfig,
  activity: seedActivity,

  addTenant: (t) => set(s => ({ tenants: [t, ...s.tenants], activity: [{ id: crypto.randomUUID(), at: new Date().toISOString(), tenantId: t.id, type: "create", text: `New tenant created: ${t.name}` }, ...s.activity] })),
  updateTenant: (id, patch) => set(s => ({ tenants: s.tenants.map(t => t.id === id ? { ...t, ...patch } : t) })),
  toggleTenantModule: (id, mod) => set(s => ({
    tenants: s.tenants.map(t => t.id === id ? { ...t, modules: t.modules.includes(mod) ? t.modules.filter(m => m !== mod) : [...t.modules, mod] } : t),
  })),
  suspendTenant: (id) => set(s => ({ tenants: s.tenants.map(t => t.id === id ? { ...t, status: "suspended" } : t) })),

  addPlan: (p) => set(s => ({ plans: [...s.plans, p] })),
  updatePlan: (id, patch) => set(s => ({ plans: s.plans.map(p => p.id === id ? { ...p, ...patch } : p) })),

  addInvoice: (i) => set(s => ({ invoices: [i, ...s.invoices] })),
  markInvoicePaid: (id) => set(s => ({ invoices: s.invoices.map(i => i.id === id ? { ...i, status: "paid", paidDate: new Date().toISOString() } : i) })),

  addDemoRequest: (d) => set(s => ({ demoRequests: [d, ...s.demoRequests] })),
  updateDemoRequest: (id, patch) => set(s => ({ demoRequests: s.demoRequests.map(d => d.id === id ? { ...d, ...patch } : d) })),
  addDemoNote: (id, text) => set(s => ({ demoRequests: s.demoRequests.map(d => d.id === id ? { ...d, notes: [...d.notes, { at: new Date().toISOString(), text }] } : d) })),

  addCustomDeal: (d) => set(s => ({ customDeals: [d, ...s.customDeals] })),
  updateCustomDeal: (id, patch) => set(s => ({ customDeals: s.customDeals.map(d => d.id === id ? { ...d, ...patch } : d) })),

  addTicket: (t) => set(s => ({ tickets: [t, ...s.tickets] })),
  updateTicket: (id, patch) => set(s => ({ tickets: s.tickets.map(t => t.id === id ? { ...t, ...patch } : t) })),
  replyTicket: (id, text, from) => set(s => ({ tickets: s.tickets.map(t => t.id === id ? { ...t, lastReplyAt: new Date().toISOString(), thread: [...t.thread, { from, at: new Date().toISOString(), text }] } : t) })),
  addInternalNote: (id, text) => set(s => ({ tickets: s.tickets.map(t => t.id === id ? { ...t, internalNotes: [...t.internalNotes, { at: new Date().toISOString(), text }] } : t) })),

  addAnnouncement: (a) => set(s => ({ announcements: [a, ...s.announcements] })),
  updateModuleConfig: (id, patch) => set(s => ({ moduleConfigs: s.moduleConfigs.map(m => m.id === id ? { ...m, ...patch } : m) })),

  logActivity: (text, type, tenantId) => set(s => ({ activity: [{ id: crypto.randomUUID(), at: new Date().toISOString(), tenantId, type, text }, ...s.activity] })),
}), { name: "super-admin-state-v1" }));

// Helpers
export const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;
export const computeMRR = (tenants: Tenant[]) => tenants.filter(t => t.status === "active").reduce((s, t) => s + t.mrr, 0);
export const computeARR = (tenants: Tenant[]) => computeMRR(tenants) * 12;

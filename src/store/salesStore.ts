import { create } from "zustand";
import { persist } from "zustand/middleware";
import { COMPANIES, daysFromNow, pick } from "@/lib/mockData";

// ─── Types ──────────────────────────────────────────────────────────
export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal Sent" | "Negotiation" | "Won" | "Lost" | "On Hold";
export type LeadPriority = "Critical" | "High" | "Medium" | "Low";
export type LeadType = "Bid Won" | "Direct Invite" | "Direct Lead" | "Referral" | "Inbound" | "Outbound";
export type SourcePlatform =
  | "Upwork" | "LinkedIn" | "Fiverr" | "Toptal" | "Freelancer"
  | "Email" | "Referral" | "Website" | "Direct Call" | "WhatsApp"
  | "Event" | "Twitter/X" | "Facebook" | "Instagram" | "Google Ads" | "Other";
export type ProjectType = "Web App" | "Mobile App" | "API" | "Design" | "AI/ML" | "Consulting" | "Other";
export type Currency = "INR" | "USD";
export type BudgetType = "Fixed" | "Hourly" | "TBD";

export interface SourceAccount {
  id: string;
  platform: SourcePlatform;
  url: string;
  username: string;
  displayName: string;
  ownerId: string;
  secondaryOwnerId?: string;
  rateType: "Hourly" | "Monthly Subscription" | "Per Lead" | "Free";
  rateAmount?: number;
  currency: Currency;
  status: "Active" | "Paused" | "Suspended" | "Archived";
  jss?: number;
  rating?: number;
  notes?: string;
  tags: string[];
  createdAt: string;
}

export interface Attachment {
  id: string;
  kind: "file" | "link";
  name: string;
  url: string;
  size?: number;
  uploadedAt: string;
  uploadedById: string;
}

export interface Note {
  id: string;
  text: string;
  byId: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  sourcePlatform: SourcePlatform;
  sourceAccountId?: string;
  leadType: LeadType;
  jobUrl?: string;
  jobTitle?: string;
  bidAmount?: number;
  contractType?: "Hourly" | "Fixed";
  company: string;
  companyWebsite?: string;
  industry: string;
  companySize?: string;
  country: string;
  city?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  designation?: string;
  linkedin?: string;
  whatsapp?: string;
  timezone: string;
  preferredContact: "Email" | "WhatsApp" | "Phone" | "LinkedIn";
  title: string;
  description: string;
  projectType: ProjectType;
  techStack: string[];
  budget?: number;
  budgetCurrency: Currency;
  budgetType: BudgetType;
  timeline?: string;
  complexity: "Low" | "Medium" | "High" | "Enterprise";
  priority: LeadPriority;
  estimatedValue?: number;
  assigneeId: string;            // responsible person
  followUpPersonId?: string;     // follow-up owner
  team?: string;
  followUpDate?: string;
  tags: string[];
  internalNotes?: string;
  attachments?: Attachment[];
  notes?: Note[];
  status: LeadStatus;
  aiScore: number;
  createdAt: string;
  createdById: string;
  lastActivityAt: string;
}

export interface Activity {
  id: string;
  leadId?: string;
  dealId?: string;
  type: "Call" | "Email" | "Meeting" | "Demo" | "Proposal" | "Follow-up" | "Note" | "Status Change" | "Created" | "Assigned" | "AI Action" | "Other";
  subject: string;
  description?: string;
  outcome?: "Positive" | "Neutral" | "Negative" | "No Response";
  nextStep?: string;
  nextFollowUp?: string;
  date: string;
  duration?: number;
  byId: string;
}

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry: string;
  size?: string;
  country: string;
  city?: string;
  annualRevenue?: string;
  foundedYear?: number;
  description?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  gst?: string;
  pan?: string;
  paymentTerms?: "Net 15" | "Net 30" | "Net 45" | "Advance" | "Custom";
  currency: Currency;
  clientType: "Prospect" | "Lead" | "Active Client" | "Past Client" | "Partner";
  accountTier?: "Enterprise" | "Mid-Market" | "SMB" | "Startup";
  tags: string[];
  accountManagerId?: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  designation?: string;
  department?: string;
  linkedin?: string;
  twitter?: string;
  companyId?: string;
  isPrimary?: boolean;
  preferredContact: "Email" | "WhatsApp" | "Phone" | "LinkedIn";
  bestTime?: "Morning" | "Afternoon" | "Evening";
  timezone: string;
  language?: string;
  notes?: string;
  tags: string[];
  createdAt: string;
}

export interface SalesTask {
  id: string;
  leadId?: string;
  dealId?: string;
  title: string;
  type: "Research" | "MVP Build" | "Proposal" | "Follow-up" | "Call" | "Meeting" | "Other";
  assigneeId: string;
  dueDate: string;
  priority: LeadPriority;
  status: "Open" | "In Progress" | "Done";
}

export type DealStage = "Discovery" | "Qualification" | "Proposal" | "Negotiation" | "Closed Won" | "Closed Lost";
export const ALL_DEAL_STAGES: DealStage[] = ["Discovery", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

export interface Deal {
  id: string;
  title: string;
  leadId?: string;
  companyId?: string;
  contactId?: string;
  stage: DealStage;
  value: number;
  currency: Currency;
  probability: number; // 0-100
  expectedCloseDate: string;
  ownerId: string;
  followUpPersonId?: string;
  source: SourcePlatform;
  tags: string[];
  notes?: string;
  attachments?: Attachment[];
  noteList?: Note[];
  createdAt: string;
  lastActivityAt: string;
}

export interface SalesGoal {
  id: string;
  scope: "company" | "person";
  ownerId?: string; // person id when scope === "person"
  period: "monthly" | "quarterly";
  periodLabel: string; // e.g. "2025-04" or "2025-Q2"
  target: number;
  currency: Currency;
  achieved?: number;
}

export interface PipelineStageDef {
  id: string;
  name: string;
  probability: number;
  color: string;
}

export const dealStageVariant = (s: DealStage): "info" | "purple" | "warning" | "success" | "danger" | "neutral" => {
  switch (s) {
    case "Discovery": return "info";
    case "Qualification": return "purple";
    case "Proposal": return "warning";
    case "Negotiation": return "warning";
    case "Closed Won": return "success";
    case "Closed Lost": return "danger";
  }
};

// ─── Seed ───────────────────────────────────────────────────────────
const seedSources: SourceAccount[] = [
  { id: "s1", platform: "Upwork", url: "https://www.upwork.com/freelancers/bhavya_dev", username: "bhavya_dev", displayName: "Bhavya_Dev ($23/hr)", ownerId: "p5", rateType: "Hourly", rateAmount: 23, currency: "USD", status: "Active", jss: 92, rating: 4.9, tags: ["high-performing", "dev-focused"], createdAt: daysFromNow(-180) },
  { id: "s2", platform: "Upwork", url: "https://www.upwork.com/freelancers/techstudio_in", username: "techstudio_in", displayName: "TechStudio_IN ($18/hr)", ownerId: "p1", rateType: "Hourly", rateAmount: 18, currency: "USD", status: "Active", jss: 85, rating: 4.7, tags: ["enterprise"], createdAt: daysFromNow(-220) },
  { id: "s3", platform: "LinkedIn", url: "https://www.linkedin.com/in/priyamehta", username: "priyamehta", displayName: "Priya Mehta (Premium)", ownerId: "p2", rateType: "Monthly Subscription", rateAmount: 80, currency: "USD", status: "Active", tags: ["high-performing"], createdAt: daysFromNow(-365) },
  { id: "s4", platform: "Fiverr", url: "https://www.fiverr.com/devstudio99", username: "devstudio99", displayName: "devstudio99 ($15/hr)", ownerId: "p7", rateType: "Hourly", rateAmount: 15, currency: "USD", status: "Paused", rating: 4.5, tags: [], createdAt: daysFromNow(-150) },
  { id: "s5", platform: "Toptal", url: "https://www.toptal.com/resume/meera-nair", username: "meera-nair", displayName: "Meera Nair ($45/hr)", ownerId: "p8", rateType: "Hourly", rateAmount: 45, currency: "USD", status: "Active", rating: 5.0, tags: ["enterprise", "high-performing"], createdAt: daysFromNow(-90) },
  { id: "s6", platform: "Website", url: "https://company.com/contact", username: "website-form", displayName: "Website Contact Form", ownerId: "p2", rateType: "Free", currency: "INR", status: "Active", tags: [], createdAt: daysFromNow(-300) },
];

const STATUSES: LeadStatus[] = ["New", "Contacted", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost", "On Hold"];
const PRIORITIES: LeadPriority[] = ["Critical", "High", "Medium", "Low"];
const PROJECT_TYPES: ProjectType[] = ["Web App", "Mobile App", "API", "Design", "AI/ML", "Consulting"];
const TITLES = [
  "E-commerce Web App Development","Mobile App for Food Delivery","B2B SaaS Dashboard Redesign",
  "REST API for Inventory System","AI Chatbot for Customer Support","Marketplace Platform MVP",
  "Healthcare Patient Portal","Fintech Lending Application","Real Estate Listings Portal",
  "Logistics Tracking System","EdTech LMS Platform","HR Management System",
  "Subscription Billing Integration","Cross-platform React Native App","Data Analytics Dashboard",
];
const FIRST = ["Arjun","Riya","Sanjay","Pooja","Karan","Tanya","Rohit","Ananya","Aditya","Isha","Nikhil","Kavya","Manish","Divya","Varun"];
const LAST = ["Mehta","Iyer","Khanna","Verma","Reddy","Kapoor","Bhatt","Rao","Malhotra","Joshi","Nair","Shetty","Pillai","Saxena","Bose"];
const COUNTRIES = ["India","USA","UK","Germany","Australia","UAE","Singapore"];
const INDUSTRIES = ["Technology","E-commerce","Healthcare","Finance","Education","Manufacturing","Retail"];
const STACKS = [["React","Node.js"],["React Native","Firebase"],["Next.js","PostgreSQL"],["Python","FastAPI"],["Vue.js","Laravel"],["Flutter","Supabase"]];

const seedLeads: Lead[] = Array.from({ length: 16 }).map((_, i) => {
  const src = pick(seedSources, i);
  const status = STATUSES[i % STATUSES.length];
  const fn = pick(FIRST, i);
  const ln = pick(LAST, i + 3);
  const company = pick(COMPANIES, i);
  const value = [80000, 120000, 250000, 420000, 680000, 1200000, 1800000, 350000][i % 8];
  const days = -(i * 2 + 1);
  return {
    id: `l${i + 1}`,
    sourcePlatform: src.platform,
    sourceAccountId: src.id,
    leadType: (["Bid Won","Direct Invite","Direct Lead","Referral","Inbound"] as LeadType[])[i % 5],
    jobUrl: src.platform === "Upwork" ? `https://www.upwork.com/jobs/~01abc${i}` : undefined,
    jobTitle: src.platform === "Upwork" ? TITLES[i % TITLES.length] : undefined,
    bidAmount: src.platform === "Upwork" ? 50 + i * 10 : undefined,
    contractType: src.platform === "Upwork" ? (i % 2 === 0 ? "Fixed" : "Hourly") : undefined,
    company,
    companyWebsite: `https://${company.toLowerCase().replace(/[^a-z]/g, "")}.com`,
    industry: pick(INDUSTRIES, i),
    companySize: ["11-50","51-200","201-1000"][i % 3],
    country: pick(COUNTRIES, i),
    city: ["Bengaluru","Mumbai","Delhi","Pune","Hyderabad"][i % 5],
    firstName: fn,
    lastName: ln,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${company.toLowerCase().replace(/[^a-z]/g, "")}.com`,
    phone: `+91 9${(800000000 + i * 1234567).toString().slice(0, 9)}`,
    designation: ["CTO","Product Manager","Founder","VP Engineering","Head of Product"][i % 5],
    linkedin: `https://linkedin.com/in/${fn.toLowerCase()}${ln.toLowerCase()}`,
    timezone: "IST",
    preferredContact: "Email",
    title: pick(TITLES, i),
    description: `${company} is looking to build ${pick(TITLES, i).toLowerCase()}. They need a modern, scalable solution with focus on user experience and performance. Initial scope includes design, development, testing, and deployment.`,
    projectType: pick(PROJECT_TYPES, i),
    techStack: pick(STACKS, i),
    budget: value,
    budgetCurrency: i % 4 === 0 ? "USD" : "INR",
    budgetType: (["Fixed","Hourly","TBD"] as BudgetType[])[i % 3],
    timeline: ["1-3 months","3-6 months","< 1 month","6-12 months"][i % 4],
    complexity: (["Low","Medium","High","Enterprise"] as const)[i % 4],
    priority: pick(PRIORITIES, i),
    estimatedValue: value,
    assigneeId: pick(["p2","p10","p5","p1"], i),
    team: "Sales East",
    followUpDate: daysFromNow(i % 5 === 0 ? -2 : (i % 7) + 1),
    tags: i % 3 === 0 ? ["urgent","enterprise"] : i % 3 === 1 ? ["repeat-client"] : ["inbound"],
    internalNotes: "",
    status,
    aiScore: Number((4 + ((i * 1.7) % 6)).toFixed(1)),
    createdAt: daysFromNow(days),
    createdById: "p1",
    lastActivityAt: daysFromNow(days + 1),
  } as Lead;
});

const seedActivities: Activity[] = [
  { id: "a1", leadId: "l1", type: "Call", subject: "Discovery call with client", description: "Discussed scope, budget, and timeline. Client is keen.", outcome: "Positive", date: daysFromNow(-1), duration: 35, byId: "p2" },
  { id: "a2", leadId: "l1", type: "Email", subject: "Sent introductory deck", outcome: "Neutral", date: daysFromNow(-2), byId: "p2" },
  { id: "a3", leadId: "l2", type: "Meeting", subject: "Product demo", description: "Walked through MVP build and timeline.", outcome: "Positive", date: daysFromNow(-3), duration: 60, byId: "p10" },
  { id: "a4", leadId: "l3", type: "Note", subject: "Client requested case studies", description: "Need to send 2 e-commerce case studies.", date: daysFromNow(-4), byId: "p5" },
  { id: "a5", leadId: "l4", type: "Follow-up", subject: "Pinged on WhatsApp", outcome: "No Response", date: daysFromNow(-5), byId: "p2" },
  { id: "a6", leadId: "l5", type: "Email", subject: "Proposal sent", outcome: "Positive", date: daysFromNow(-1), byId: "p10" },
  { id: "a7", leadId: "l1", type: "Created", subject: "Lead created from Upwork (Bhavya_Dev)", date: daysFromNow(-6), byId: "p1" },
];

const seedTasks: SalesTask[] = [
  { id: "st1", leadId: "l1", title: "Research client's existing platform", type: "Research", assigneeId: "p4", dueDate: daysFromNow(2), priority: "High", status: "In Progress" },
  { id: "st2", leadId: "l1", title: "Schedule technical deep-dive call", type: "Call", assigneeId: "p2", dueDate: daysFromNow(1), priority: "Critical", status: "Open" },
  { id: "st3", leadId: "l2", title: "Draft initial proposal", type: "Proposal", assigneeId: "p10", dueDate: daysFromNow(3), priority: "High", status: "Open" },
];

const CLIENT_TYPES: Company["clientType"][] = ["Prospect", "Lead", "Active Client", "Past Client", "Partner"];
const TIERS: NonNullable<Company["accountTier"]>[] = ["Enterprise", "Mid-Market", "SMB", "Startup"];
const seedCompanies: Company[] = COMPANIES.map((name, i) => ({
  id: `co${i + 1}`,
  name,
  website: `https://${name.toLowerCase().replace(/[^a-z]/g, "")}.com`,
  industry: pick(INDUSTRIES, i),
  size: ["11-50", "51-200", "201-1000", "1000+"][i % 4],
  country: pick(COUNTRIES, i),
  city: ["Bengaluru", "Mumbai", "Delhi", "Pune", "Hyderabad"][i % 5],
  annualRevenue: ["< ₹1 Cr", "₹1-10 Cr", "₹10-100 Cr", "> ₹100 Cr"][i % 4],
  foundedYear: 2005 + (i % 18),
  description: `${name} is a leading ${pick(INDUSTRIES, i).toLowerCase()} firm focused on innovation and customer outcomes.`,
  linkedin: `https://linkedin.com/company/${name.toLowerCase().replace(/[^a-z]/g, "")}`,
  gst: `27ABCDE${1000 + i}F1Z${i % 10}`,
  pan: `ABCDE${1000 + i}F`,
  paymentTerms: (["Net 15", "Net 30", "Net 45", "Advance"] as const)[i % 4],
  currency: i % 5 === 0 ? "USD" : "INR",
  clientType: CLIENT_TYPES[i % CLIENT_TYPES.length],
  accountTier: TIERS[i % TIERS.length],
  tags: i % 2 === 0 ? ["enterprise"] : ["growth"],
  accountManagerId: pick(["p2", "p10"], i),
  createdAt: daysFromNow(-(i * 10 + 30)),
}));

const TZS = ["IST", "PST", "EST", "GMT", "CET", "AEST"];
const seedContacts: Contact[] = Array.from({ length: 18 }).map((_, i) => {
  const fn = pick(FIRST, i);
  const ln = pick(LAST, i + 5);
  const co = seedCompanies[i % seedCompanies.length];
  return {
    id: `ct${i + 1}`,
    firstName: fn,
    lastName: ln,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${co.name.toLowerCase().replace(/[^a-z]/g, "")}.com`,
    phone: `+91 9${(800000000 + i * 7654321).toString().slice(0, 9)}`,
    designation: ["CTO", "Product Manager", "Founder", "VP Engineering", "Head of Product", "CEO", "Engineering Manager"][i % 7],
    department: ["Engineering", "Product", "Operations", "Marketing"][i % 4],
    linkedin: `https://linkedin.com/in/${fn.toLowerCase()}${ln.toLowerCase()}`,
    companyId: co.id,
    isPrimary: i % 3 === 0,
    preferredContact: (["Email", "WhatsApp", "Phone", "LinkedIn"] as const)[i % 4],
    bestTime: (["Morning", "Afternoon", "Evening"] as const)[i % 3],
    timezone: TZS[i % TZS.length],
    language: i % 4 === 0 ? "Hindi" : "English",
    notes: "",
    tags: i % 2 === 0 ? ["decision-maker"] : ["technical"],
    createdAt: daysFromNow(-(i * 5 + 10)),
  };
});

const seedDeals: Deal[] = Array.from({ length: 10 }).map((_, i) => {
  const stage = ALL_DEAL_STAGES[i % ALL_DEAL_STAGES.length];
  const co = seedCompanies[i % seedCompanies.length];
  const value = [180000, 320000, 540000, 750000, 1100000, 1900000, 280000, 450000, 620000, 980000][i];
  const closed = stage === "Closed Won" || stage === "Closed Lost";
  return {
    id: `d${i + 1}`,
    title: `${TITLES[i % TITLES.length]} – ${co.name}`,
    leadId: i < 6 ? `l${i + 1}` : undefined,
    companyId: co.id,
    contactId: seedContacts[i % seedContacts.length].id,
    stage,
    value,
    currency: i % 4 === 0 ? "USD" : "INR",
    probability: stage === "Closed Won" ? 100 : stage === "Closed Lost" ? 0 : [20, 40, 60, 80][i % 4],
    expectedCloseDate: daysFromNow(closed ? -(i * 3) : (i + 1) * 7),
    ownerId: pick(["p2", "p10", "p5"], i),
    source: pick(["Upwork", "LinkedIn", "Referral", "Website"] as const, i),
    tags: i % 2 === 0 ? ["enterprise"] : ["growth"],
    notes: "",
    createdAt: daysFromNow(-(i * 4 + 5)),
    lastActivityAt: daysFromNow(-(i % 5)),
  };
});

// ─── Proposals ──────────────────────────────────────
export type ProposalStatus = "Draft" | "Sent" | "Viewed" | "Accepted" | "Rejected" | "Expired";
export const ALL_PROPOSAL_STATUSES: ProposalStatus[] = ["Draft", "Sent", "Viewed", "Accepted", "Rejected", "Expired"];
export const proposalStatusVariant = (s: ProposalStatus): "info" | "purple" | "warning" | "success" | "danger" | "neutral" => {
  switch (s) {
    case "Draft": return "neutral";
    case "Sent": return "info";
    case "Viewed": return "purple";
    case "Accepted": return "success";
    case "Rejected": return "danger";
    case "Expired": return "warning";
  }
};

export interface ProposalLineItem {
  id: string;
  item: string;
  description: string;
  qty: number;
  unit: string;
  rate: number;
}

export interface Proposal {
  id: string;
  number: string;
  title: string;
  leadId?: string;
  dealId?: string;
  companyId?: string;
  preparedById: string;
  proposalDate: string;
  validUntil: string;
  currency: Currency;
  status: ProposalStatus;
  executiveSummary: string;
  approach: string;
  scopeOfWork: string;
  timeline: string;
  terms: string;
  lineItems: ProposalLineItem[];
  taxPercent: number;
  discount: number;
  sentDate?: string;
  viewedDate?: string;
  createdAt: string;
}

const seedProposals: Proposal[] = [
  {
    id: "pr1", number: "PROP-2025-001", title: "E-commerce Web App Proposal",
    leadId: "l1", dealId: "d1", companyId: seedCompanies[0].id,
    preparedById: "p2", proposalDate: daysFromNow(-5), validUntil: daysFromNow(25),
    currency: "INR", status: "Sent", sentDate: daysFromNow(-4),
    executiveSummary: "We propose a modern, scalable e-commerce platform tailored to your business needs.",
    approach: "Agile delivery in 4 sprints with weekly demos and continuous client feedback.",
    scopeOfWork: "UI/UX design, frontend (React), backend API (Node.js), payment integration, deployment.",
    timeline: "12 weeks: Discovery (1w), Design (3w), Dev (6w), Testing (1w), Launch (1w).",
    terms: "50% advance, 25% mid-project, 25% on launch. 30 days post-launch support included.",
    lineItems: [
      { id: "li1", item: "UI/UX Design", description: "Figma screens for all pages", qty: 1, unit: "Project", rate: 80000 },
      { id: "li2", item: "Frontend Development", description: "React.js development", qty: 1, unit: "Project", rate: 150000 },
      { id: "li3", item: "Backend Development", description: "Node.js API & integrations", qty: 1, unit: "Project", rate: 120000 },
    ],
    taxPercent: 18, discount: 0, createdAt: daysFromNow(-5),
  },
  {
    id: "pr2", number: "PROP-2025-002", title: "Mobile App Development",
    leadId: "l2", companyId: seedCompanies[1].id,
    preparedById: "p10", proposalDate: daysFromNow(-2), validUntil: daysFromNow(28),
    currency: "INR", status: "Draft",
    executiveSummary: "Cross-platform mobile app to extend your reach to mobile-first users.",
    approach: "React Native for shared codebase across iOS and Android.",
    scopeOfWork: "Design, development, testing, app store submission.",
    timeline: "10 weeks total.",
    terms: "Milestone-based payments.",
    lineItems: [
      { id: "li1", item: "App Design", description: "iOS + Android screens", qty: 1, unit: "Project", rate: 100000 },
      { id: "li2", item: "Development", description: "React Native build", qty: 1, unit: "Project", rate: 250000 },
    ],
    taxPercent: 18, discount: 0, createdAt: daysFromNow(-2),
  },
  {
    id: "pr3", number: "PROP-2025-003", title: "SaaS Dashboard Redesign",
    leadId: "l3", companyId: seedCompanies[2].id,
    preparedById: "p2", proposalDate: daysFromNow(-12), validUntil: daysFromNow(18),
    currency: "USD", status: "Accepted", sentDate: daysFromNow(-11), viewedDate: daysFromNow(-10),
    executiveSummary: "Modernize your B2B dashboard with intuitive UX and improved performance.",
    approach: "Design-led process with data-driven UX decisions.",
    scopeOfWork: "Audit, redesign, frontend rebuild.",
    timeline: "8 weeks.",
    terms: "Net 30 invoicing.",
    lineItems: [
      { id: "li1", item: "UX Audit & Design", description: "Full audit and Figma redesign", qty: 1, unit: "Project", rate: 8000 },
      { id: "li2", item: "Frontend Rebuild", description: "React + Tailwind", qty: 1, unit: "Project", rate: 12000 },
    ],
    taxPercent: 0, discount: 0, createdAt: daysFromNow(-12),
  },
];

// ─── Automations ────────────────────────────────────
export interface Automation {
  id: string;
  name: string;
  category: "Assignment" | "Follow-up" | "Status Change" | "Notification";
  trigger: string;
  condition?: string;
  action: string;
  enabled: boolean;
  lastTriggered?: string;
  runs: number;
}

const seedAutomations: Automation[] = [
  { id: "au1", name: "Round-robin lead assignment", category: "Assignment", trigger: "New lead created", action: "Assign to next available rep in Sales team", enabled: true, lastTriggered: daysFromNow(-1), runs: 142 },
  { id: "au2", name: "Source-based assignment (Upwork → Bhavya)", category: "Assignment", trigger: "New lead from Upwork", action: "Assign to Bhavya Sharma", enabled: true, lastTriggered: daysFromNow(0), runs: 48 },
  { id: "au3", name: "High-value lead → Senior Sales", category: "Assignment", trigger: "Lead value > ₹5L", action: "Assign to Department Head", enabled: true, lastTriggered: daysFromNow(-3), runs: 12 },
  { id: "au4", name: "First-contact reminder (4h)", category: "Follow-up", trigger: "Lead assigned", condition: "After 4 hours", action: "Notify assignee: 'New lead waiting'", enabled: true, lastTriggered: daysFromNow(0), runs: 89 },
  { id: "au5", name: "Cold lead alert (5 days inactive)", category: "Follow-up", trigger: "No activity for 5 days", action: "Notify assignee + manager, raise priority", enabled: true, lastTriggered: daysFromNow(-1), runs: 34 },
  { id: "au6", name: "Proposal follow-up (3 days)", category: "Follow-up", trigger: "Proposal sent + 3 days no response", action: "Notify assignee, AI-draft follow-up email", enabled: true, runs: 21 },
  { id: "au7", name: "Lead Qualified → PMS research task", category: "Status Change", trigger: "Lead status = Qualified", action: "Create PMS task: 'Research & RnD'", enabled: true, lastTriggered: daysFromNow(-2), runs: 56 },
  { id: "au8", name: "Deal Won → Project in Master Sheet", category: "Status Change", trigger: "Deal status = Won", action: "Create project, notify Finance, create FRD", enabled: true, lastTriggered: daysFromNow(-7), runs: 18 },
  { id: "au9", name: "Deal Lost → Log reason & notify", category: "Status Change", trigger: "Deal status = Lost", action: "Require loss reason, notify manager", enabled: true, runs: 9 },
  { id: "au10", name: "High-value lead alert (>₹10L)", category: "Notification", trigger: "Lead value > ₹10L", action: "Notify Sales Manager + Dept Head immediately", enabled: true, lastTriggered: daysFromNow(-4), runs: 7 },
  { id: "au11", name: "AI score drop alert", category: "Notification", trigger: "AI score drops > 2 points in 24h", action: "Notify assignee", enabled: false, runs: 0 },
  { id: "au12", name: "Daily sales digest (9 AM)", category: "Notification", trigger: "Every day at 9:00 AM", action: "Send digest to each salesperson", enabled: true, lastTriggered: daysFromNow(0), runs: 90 },
];

const seedPipelineStages: PipelineStageDef[] = [
  { id: "ps1", name: "Discovery", probability: 10, color: "info" },
  { id: "ps2", name: "Qualification", probability: 30, color: "purple" },
  { id: "ps3", name: "Proposal", probability: 55, color: "warning" },
  { id: "ps4", name: "Negotiation", probability: 75, color: "warning" },
  { id: "ps5", name: "Closed Won", probability: 100, color: "success" },
  { id: "ps6", name: "Closed Lost", probability: 0, color: "danger" },
];

const currentMonth = new Date().toISOString().slice(0, 7);
const currentQuarter = `${new Date().getFullYear()}-Q${Math.floor(new Date().getMonth() / 3) + 1}`;
const seedGoals: SalesGoal[] = [
  { id: "g1", scope: "company", period: "monthly", periodLabel: currentMonth, target: 5000000, currency: "INR", achieved: 3200000 },
  { id: "g2", scope: "company", period: "quarterly", periodLabel: currentQuarter, target: 15000000, currency: "INR", achieved: 9800000 },
  { id: "g3", scope: "person", ownerId: "p2", period: "monthly", periodLabel: currentMonth, target: 1500000, currency: "INR", achieved: 1180000 },
  { id: "g4", scope: "person", ownerId: "p10", period: "monthly", periodLabel: currentMonth, target: 1200000, currency: "INR", achieved: 980000 },
  { id: "g5", scope: "person", ownerId: "p2", period: "quarterly", periodLabel: currentQuarter, target: 4500000, currency: "INR", achieved: 3100000 },
];

export interface ProposalSettings {
  brandName: string;
  brandTagline: string;
  brandLogo?: string; // data URL
  primaryColor: string; // hex
  accentColor: string; // hex
  fontFamily: "Inter" | "Helvetica" | "Georgia" | "Times";
  footerText: string;
  defaultTone: "Persuasive" | "Professional" | "Consultative" | "Bold";
  includeSections: {
    executiveSummary: boolean;
    problemStatement: boolean;
    ourSolution: boolean;
    timeline: boolean;
    pricing: boolean;
    terms: boolean;
  };
  defaultTerms: string;
  defaultValidityDays: number;
}

const seedProposalSettings: ProposalSettings = {
  brandName: "Your Agency",
  brandTagline: "Premium Digital Solutions",
  brandLogo: undefined,
  primaryColor: "#0F172A",
  accentColor: "#2563EB",
  fontFamily: "Inter",
  footerText: "Confidential · Prepared exclusively for the recipient",
  defaultTone: "Professional",
  includeSections: {
    executiveSummary: true,
    problemStatement: true,
    ourSolution: true,
    timeline: true,
    pricing: true,
    terms: true,
  },
  defaultTerms: "Payment: 50% advance, 25% mid-project, 25% on launch. 30 days post-launch support included. IP transfers on final payment.",
  defaultValidityDays: 30,
};

interface SalesState {
  sources: SourceAccount[];
  leads: Lead[];
  activities: Activity[];
  tasks: SalesTask[];
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
  goals: SalesGoal[];
  pipelineStages: PipelineStageDef[];
  addSource: (s: Omit<SourceAccount, "id" | "createdAt">) => string;
  updateSource: (id: string, patch: Partial<SourceAccount>) => void;
  addLead: (l: Omit<Lead, "id" | "createdAt" | "lastActivityAt" | "aiScore">) => string;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  setLeadStatus: (id: string, status: LeadStatus, byId?: string) => void;
  addLeadNote: (leadId: string, text: string, byId?: string) => void;
  addLeadAttachment: (leadId: string, att: Omit<Attachment, "id" | "uploadedAt">) => void;
  removeLeadAttachment: (leadId: string, attId: string) => void;
  addDealNote: (dealId: string, text: string, byId?: string) => void;
  addDealAttachment: (dealId: string, att: Omit<Attachment, "id" | "uploadedAt">) => void;
  removeDealAttachment: (dealId: string, attId: string) => void;
  logActivity: (a: Omit<Activity, "id">) => string;
  addTask: (t: Omit<SalesTask, "id">) => string;
  setTaskStatus: (id: string, status: SalesTask["status"]) => void;
  addCompany: (c: Omit<Company, "id" | "createdAt">) => string;
  updateCompany: (id: string, patch: Partial<Company>) => void;
  addContact: (c: Omit<Contact, "id" | "createdAt">) => string;
  updateContact: (id: string, patch: Partial<Contact>) => void;
  addDeal: (d: Omit<Deal, "id" | "createdAt" | "lastActivityAt">) => string;
  updateDeal: (id: string, patch: Partial<Deal>) => void;
  setDealStage: (id: string, stage: DealStage) => void;
  convertLeadToDeal: (leadId: string) => string;
  proposals: Proposal[];
  automations: Automation[];
  addProposal: (p: Omit<Proposal, "id" | "createdAt" | "number">) => string;
  updateProposal: (id: string, patch: Partial<Proposal>) => void;
  setProposalStatus: (id: string, status: ProposalStatus) => void;
  toggleAutomation: (id: string) => void;
  addAutomation: (a: Omit<Automation, "id" | "runs">) => string;
  removeAutomation: (id: string) => void;
  addGoal: (g: Omit<SalesGoal, "id">) => string;
  updateGoal: (id: string, patch: Partial<SalesGoal>) => void;
  removeGoal: (id: string) => void;
  setPipelineStages: (stages: PipelineStageDef[]) => void;
  proposalSettings: ProposalSettings;
  updateProposalSettings: (patch: Partial<ProposalSettings>) => void;
}

export function computeAiScore(l: Pick<Lead, "leadType" | "budget" | "budgetCurrency" | "description" | "complexity" | "priority">): number {
  let s = 4;
  if (l.leadType === "Direct Invite" || l.leadType === "Referral") s += 1.8;
  if (l.leadType === "Inbound") s += 1.0;
  const inrBudget = l.budgetCurrency === "USD" ? (l.budget ?? 0) * 83 : (l.budget ?? 0);
  if (inrBudget > 1000000) s += 2;
  else if (inrBudget > 300000) s += 1.2;
  else if (inrBudget > 100000) s += 0.6;
  if ((l.description?.length ?? 0) > 100) s += 0.6;
  if (l.complexity === "Enterprise") s += 0.8;
  if (l.priority === "Critical") s += 0.6;
  if (l.priority === "High") s += 0.3;
  return Math.min(10, Math.max(0, Number(s.toFixed(1))));
}

export const useSalesStore = create<SalesState>()(
  persist(
    (set) => ({
      sources: seedSources,
      leads: seedLeads,
      activities: seedActivities,
      tasks: seedTasks,
      companies: seedCompanies,
      contacts: seedContacts,
      deals: seedDeals,
      proposals: seedProposals,
      automations: seedAutomations,
      goals: seedGoals,
      pipelineStages: seedPipelineStages,
      addSource: (s) => {
        const id = `s${Date.now()}`;
        set((st) => ({ sources: [{ ...s, id, createdAt: new Date().toISOString().slice(0, 10) }, ...st.sources] }));
        return id;
      },
      updateSource: (id, patch) => set((st) => ({ sources: st.sources.map(s => s.id === id ? { ...s, ...patch } : s) })),
      addLead: (l) => {
        const id = `l${Date.now()}`;
        const now = new Date().toISOString().slice(0, 10);
        const aiScore = computeAiScore(l);
        set((st) => ({
          leads: [{ ...l, id, aiScore, createdAt: now, lastActivityAt: now }, ...st.leads],
          activities: [
            { id: `a${Date.now()}`, leadId: id, type: "Created", subject: `Lead created from ${l.sourcePlatform}`, date: now, byId: l.createdById },
            ...st.activities,
          ],
        }));
        return id;
      },
      updateLead: (id, patch) => set((st) => ({ leads: st.leads.map(l => l.id === id ? { ...l, ...patch, lastActivityAt: new Date().toISOString().slice(0, 10) } : l) })),
      setLeadStatus: (id, status, byId = "p1") => set((st) => ({
        leads: st.leads.map(l => l.id === id ? { ...l, status, lastActivityAt: new Date().toISOString().slice(0, 10) } : l),
        activities: [
          { id: `a${Date.now()}`, leadId: id, type: "Status Change", subject: `Status changed to ${status}`, date: new Date().toISOString().slice(0, 10), byId },
          ...st.activities,
        ],
      })),
      logActivity: (a) => {
        const id = `a${Date.now()}`;
        set((st) => ({
          activities: [{ ...a, id }, ...st.activities],
          leads: a.leadId ? st.leads.map(l => l.id === a.leadId ? { ...l, lastActivityAt: a.date } : l) : st.leads,
        }));
        return id;
      },
      addTask: (t) => {
        const id = `st${Date.now()}`;
        set((st) => ({ tasks: [{ ...t, id }, ...st.tasks] }));
        return id;
      },
      setTaskStatus: (id, status) => set((st) => ({ tasks: st.tasks.map(t => t.id === id ? { ...t, status } : t) })),
      addCompany: (c) => {
        const id = `co${Date.now()}`;
        set((st) => ({ companies: [{ ...c, id, createdAt: new Date().toISOString().slice(0, 10) }, ...st.companies] }));
        return id;
      },
      updateCompany: (id, patch) => set((st) => ({ companies: st.companies.map(c => c.id === id ? { ...c, ...patch } : c) })),
      addContact: (c) => {
        const id = `ct${Date.now()}`;
        set((st) => ({ contacts: [{ ...c, id, createdAt: new Date().toISOString().slice(0, 10) }, ...st.contacts] }));
        return id;
      },
      updateContact: (id, patch) => set((st) => ({ contacts: st.contacts.map(c => c.id === id ? { ...c, ...patch } : c) })),
      addDeal: (d) => {
        const id = `d${Date.now()}`;
        const now = new Date().toISOString().slice(0, 10);
        set((st) => ({ deals: [{ ...d, id, createdAt: now, lastActivityAt: now }, ...st.deals] }));
        return id;
      },
      updateDeal: (id, patch) => set((st) => ({
        deals: st.deals.map(d => d.id === id ? { ...d, ...patch, lastActivityAt: new Date().toISOString().slice(0, 10) } : d),
      })),
      setDealStage: (id, stage) => set((st) => ({
        deals: st.deals.map(d => d.id === id ? {
          ...d,
          stage,
          probability: stage === "Closed Won" ? 100 : stage === "Closed Lost" ? 0 : d.probability,
          lastActivityAt: new Date().toISOString().slice(0, 10),
        } : d),
      })),
      convertLeadToDeal: (leadId) => {
        const id = `d${Date.now()}`;
        const now = new Date().toISOString().slice(0, 10);
        let createdId = id;
        set((st) => {
          const l = st.leads.find(x => x.id === leadId);
          if (!l) return {};
          const newDeal: Deal = {
            id,
            title: l.title,
            leadId: l.id,
            companyId: st.companies.find(c => c.name === l.company)?.id,
            stage: "Qualification",
            value: l.estimatedValue ?? l.budget ?? 0,
            currency: l.budgetCurrency,
            probability: 40,
            expectedCloseDate: l.followUpDate ?? now,
            ownerId: l.assigneeId,
            source: l.sourcePlatform,
            tags: l.tags,
            notes: "",
            createdAt: now,
            lastActivityAt: now,
          };
          return {
            deals: [newDeal, ...st.deals],
            leads: st.leads.map(x => x.id === leadId ? { ...x, status: "Qualified" as LeadStatus } : x),
            activities: [
              { id: `a${Date.now()}`, leadId, dealId: id, type: "Status Change", subject: `Converted to deal: ${l.title}`, date: now, byId: l.assigneeId },
              ...st.activities,
            ],
          };
        });
        return createdId;
      },
      addProposal: (p) => {
        const id = `pr${Date.now()}`;
        const now = new Date().toISOString().slice(0, 10);
        let createdId = id;
        set((st) => {
          const number = `PROP-${new Date().getFullYear()}-${String(st.proposals.length + 1).padStart(3, "0")}`;
          return { proposals: [{ ...p, id, number, createdAt: now }, ...st.proposals] };
        });
        return createdId;
      },
      updateProposal: (id, patch) => set((st) => ({
        proposals: st.proposals.map(p => p.id === id ? { ...p, ...patch } : p),
      })),
      setProposalStatus: (id, status) => set((st) => ({
        proposals: st.proposals.map(p => p.id === id ? {
          ...p,
          status,
          sentDate: status === "Sent" && !p.sentDate ? new Date().toISOString().slice(0, 10) : p.sentDate,
          viewedDate: status === "Viewed" && !p.viewedDate ? new Date().toISOString().slice(0, 10) : p.viewedDate,
        } : p),
      })),
      toggleAutomation: (id) => set((st) => ({
        automations: st.automations.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a),
      })),
      addAutomation: (a) => {
        const id = `au${Date.now()}`;
        set((st) => ({ automations: [{ ...a, id, runs: 0 }, ...st.automations] }));
        return id;
      },
      removeAutomation: (id) => set((st) => ({ automations: st.automations.filter(a => a.id !== id) })),
      addLeadNote: (leadId, text, byId = "p1") => set((st) => ({
        leads: st.leads.map(l => l.id === leadId ? {
          ...l,
          notes: [...(l.notes ?? []), { id: `n${Date.now()}`, text, byId, createdAt: new Date().toISOString() }],
          lastActivityAt: new Date().toISOString().slice(0, 10),
        } : l),
      })),
      addLeadAttachment: (leadId, att) => set((st) => ({
        leads: st.leads.map(l => l.id === leadId ? {
          ...l,
          attachments: [...(l.attachments ?? []), { ...att, id: `at${Date.now()}`, uploadedAt: new Date().toISOString() }],
          lastActivityAt: new Date().toISOString().slice(0, 10),
        } : l),
      })),
      removeLeadAttachment: (leadId, attId) => set((st) => ({
        leads: st.leads.map(l => l.id === leadId ? { ...l, attachments: (l.attachments ?? []).filter(a => a.id !== attId) } : l),
      })),
      addDealNote: (dealId, text, byId = "p1") => set((st) => ({
        deals: st.deals.map(d => d.id === dealId ? {
          ...d,
          noteList: [...(d.noteList ?? []), { id: `n${Date.now()}`, text, byId, createdAt: new Date().toISOString() }],
          lastActivityAt: new Date().toISOString().slice(0, 10),
        } : d),
      })),
      addDealAttachment: (dealId, att) => set((st) => ({
        deals: st.deals.map(d => d.id === dealId ? {
          ...d,
          attachments: [...(d.attachments ?? []), { ...att, id: `at${Date.now()}`, uploadedAt: new Date().toISOString() }],
          lastActivityAt: new Date().toISOString().slice(0, 10),
        } : d),
      })),
      removeDealAttachment: (dealId, attId) => set((st) => ({
        deals: st.deals.map(d => d.id === dealId ? { ...d, attachments: (d.attachments ?? []).filter(a => a.id !== attId) } : d),
      })),
      addGoal: (g) => {
        const id = `g${Date.now()}`;
        set((st) => ({ goals: [...st.goals, { ...g, id }] }));
        return id;
      },
      updateGoal: (id, patch) => set((st) => ({ goals: st.goals.map(g => g.id === id ? { ...g, ...patch } : g) })),
      removeGoal: (id) => set((st) => ({ goals: st.goals.filter(g => g.id !== id) })),
      setPipelineStages: (stages) => set(() => ({ pipelineStages: stages })),
    }),
    { name: "crm-sales-state-v2" }
  )
);

export const leadStatusVariant = (s: LeadStatus): "info" | "purple" | "success" | "warning" | "danger" | "neutral" => {
  switch (s) {
    case "New": return "info";
    case "Contacted": return "purple";
    case "Qualified": return "info";
    case "Proposal Sent": return "warning";
    case "Negotiation": return "warning";
    case "Won": return "success";
    case "Lost": return "danger";
    case "On Hold": return "neutral";
  }
};
export const priorityColor = (p: LeadPriority) => p === "Critical" ? "text-destructive" : p === "High" ? "text-warning" : p === "Medium" ? "text-primary" : "text-muted-foreground";
export const priorityDot = (p: LeadPriority) => p === "Critical" ? "🔴" : p === "High" ? "🟠" : p === "Medium" ? "🟡" : "⚪";

export const ALL_LEAD_STATUSES: LeadStatus[] = ["New", "Contacted", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost", "On Hold"];

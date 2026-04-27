import { create } from "zustand";
import { persist } from "zustand/middleware";
import { daysFromNow, PEOPLE, pick } from "@/lib/mockData";

// ───────────── Types ─────────────
export type PortfolioStatus = "Draft" | "Active" | "Completed" | "Archived";
export const ALL_PORTFOLIO_STATUSES: PortfolioStatus[] = ["Draft", "Active", "Completed", "Archived"];

export const portfolioStatusVariant = (s: PortfolioStatus): "info" | "success" | "warning" | "neutral" => {
  switch (s) {
    case "Draft": return "neutral";
    case "Active": return "info";
    case "Completed": return "success";
    case "Archived": return "warning";
  }
};

export type ArchitectureType = "Monolith" | "Microservices" | "Serverless" | "Hybrid";
export type DatabaseType = "PostgreSQL" | "MongoDB" | "MySQL" | "Firebase" | "Supabase" | "DynamoDB" | "Redis" | "Other";
export type HostingProvider = "AWS" | "GCP" | "Azure" | "Vercel" | "Netlify" | "Hetzner" | "DigitalOcean" | "VPS" | "On-Prem" | "Other";
export type DomainArea = "Fintech" | "Edtech" | "Healthcare" | "E-commerce" | "SaaS" | "Logistics" | "Travel" | "RealEstate" | "Marketing" | "AI/ML" | "Other";

export interface PortfolioFeature {
  id: string;
  title: string;
  description: string;
  icon?: string;        // emoji or short label
  image?: string;       // data URL or external
}

export interface PortfolioMedia {
  id: string;
  kind: "image" | "video" | "doc" | "link";
  url: string;
  caption?: string;
  uploadedAt: string;
}

export interface PortfolioMetrics {
  performanceScore?: number;       // 0-100
  users?: number;                  // total users
  monthlyTraffic?: number;
  conversionRate?: number;         // %
  satisfactionScore?: number;      // 0-5
  uptimePercent?: number;          // %
}

export interface PortfolioVersion {
  id: string;
  version: number;
  savedAt: string;
  byId: string;
  note?: string;
  snapshot: Omit<PortfolioProject, "versions" | "activityLogs">;
}

export interface PortfolioActivityLog {
  id: string;
  at: string;
  byId: string;
  action: string;
  field?: string;
  before?: string;
  after?: string;
}

export interface PortfolioProject {
  // Basic Info
  id: string;
  title: string;
  slug: string;
  domain: DomainArea;
  category: string;
  subcategory?: string;
  tags: string[];

  // Technical
  techStack: string[];
  architecture: ArchitectureType;
  database: DatabaseType;
  apis: string[];                  // list of API names / endpoints
  integrations: string[];          // payment gateways, AI tools, etc.

  // Team
  projectManagerId?: string;
  developerIds: string[];
  designerIds: string[];
  qaIds: string[];

  // Client
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientCountry?: string;
  ndaSigned: boolean;
  isPublic: boolean;               // gate public-share page

  // Description
  shortDescription: string;
  detailedDescription: string;     // rich text (HTML/markdown-lite)
  problemStatement: string;
  solutionProvided: string;

  // Features
  features: PortfolioFeature[];

  // Media
  thumbnailUrl?: string;
  gallery: PortfolioMedia[];
  videos: string[];                // YouTube/Vimeo links
  documents: PortfolioMedia[];     // PDFs / case studies

  // Links & Deployment
  productionUrl?: string;
  stagingUrl?: string;
  repoUrl?: string;
  internalRepoPath?: string;
  apiBaseUrl?: string;
  adminPanelUrl?: string;

  // Infra
  databaseLocation?: "Cloud" | "Local" | "Hybrid";
  hostingProvider?: HostingProvider;
  serverDetails?: string;          // sensitive
  cicdInfo?: string;

  // Files / Resources
  files: PortfolioMedia[];         // ZIPs, docs, assets
  externalResources: string[];

  // Status & Dates
  status: PortfolioStatus;
  startDate: string;
  endDate?: string;
  budget?: number;
  revenue?: number;

  // Metrics
  metrics: PortfolioMetrics;

  // Enterprise
  createdAt: string;
  updatedAt: string;
  createdById: string;
  versions: PortfolioVersion[];
  activityLogs: PortfolioActivityLog[];
}

// ───── Cover Letters ─────
export interface CoverLetterTemplate {
  id: string;
  name: string;
  description: string;
  body: string;        // tokens like {{client_name}}, {{project_title}}, {{value_prop}}
  tone: "Formal" | "Friendly" | "Bold" | "Consultative";
}

export interface CoverLetterVersion {
  id: string;
  at: string;
  byId: string;
  body: string;
}

export interface CoverLetter {
  id: string;
  title: string;
  templateId?: string;
  portfolioProjectId?: string;
  proposalId?: string;
  recipientName: string;
  recipientCompany?: string;
  recipientEmail?: string;
  body: string;
  status: "Draft" | "Sent" | "Archived";
  createdAt: string;
  updatedAt: string;
  versions: CoverLetterVersion[];
}

// ───────────── Seed ─────────────
const TECH_OPTIONS = ["React", "Next.js", "TypeScript", "Node.js", "Express", "NestJS", "Python", "Django", "FastAPI", "Java", "Spring Boot", "Go", "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "GCP", "Stripe", "OpenAI"];
const TAG_OPTIONS = ["enterprise", "mvp", "saas", "ai", "high-traffic", "case-study", "featured", "open-source"];

const seedProjects: PortfolioProject[] = [
  {
    id: "pp1",
    title: "ZenPay — UPI Reconciliation Platform",
    slug: "zenpay-upi-reconciliation-platform",
    domain: "Fintech",
    category: "Web Application",
    subcategory: "Payments / Reconciliation",
    tags: ["enterprise", "featured", "high-traffic"],
    techStack: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Redis"],
    architecture: "Microservices",
    database: "PostgreSQL",
    apis: ["NPCI UPI", "Razorpay", "Internal Ledger API"],
    integrations: ["Razorpay", "Stripe", "Twilio", "OpenAI"],
    projectManagerId: "p2",
    developerIds: ["p1", "p4", "p7"],
    designerIds: ["p5"],
    qaIds: ["p9"],
    clientName: "Aarav Kapoor",
    clientCompany: "ZenPay Technologies",
    clientEmail: "aarav@zenpay.io",
    clientPhone: "+91 98200 11122",
    clientCountry: "India",
    ndaSigned: true,
    isPublic: true,
    shortDescription: "Enterprise-grade UPI reconciliation that closes books in minutes, not days.",
    detailedDescription: "ZenPay processes over 14M UPI transactions daily and required a real-time reconciliation engine with sub-second match latency. We architected a microservices system with event-driven pipelines, built dashboards for finance teams, and delivered a 99.99% uptime SLA.",
    problemStatement: "Finance teams spent 3+ days reconciling UPI settlements with bank statements, leading to revenue leakage and delayed reporting.",
    solutionProvided: "Designed a streaming reconciliation engine with ML-assisted match suggestions, settlement dashboards, and automated dispute workflows.",
    features: [
      { id: "f1", title: "Real-time matching", description: "Sub-second transaction matching across UPI rails.", icon: "⚡" },
      { id: "f2", title: "Smart dispute flow", description: "AI-suggested resolutions with audit trail.", icon: "🤖" },
      { id: "f3", title: "Custom dashboards", description: "Finance-grade analytics with export to ERP.", icon: "📊" },
    ],
    thumbnailUrl: "",
    gallery: [],
    videos: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
    documents: [],
    productionUrl: "https://app.zenpay.io",
    stagingUrl: "https://staging.zenpay.io",
    repoUrl: "https://github.com/agency/zenpay",
    internalRepoPath: "/repos/clients/zenpay",
    apiBaseUrl: "https://api.zenpay.io/v2",
    adminPanelUrl: "https://admin.zenpay.io",
    databaseLocation: "Cloud",
    hostingProvider: "AWS",
    serverDetails: "EKS cluster (eu-west-1) · 12 nodes · RDS Aurora",
    cicdInfo: "GitHub Actions → ArgoCD → EKS",
    files: [],
    externalResources: ["https://npci.org.in/upi-spec"],
    status: "Active",
    startDate: daysFromNow(-180),
    endDate: undefined,
    budget: 8500000,
    revenue: 12400000,
    metrics: { performanceScore: 96, users: 240000, monthlyTraffic: 3200000, conversionRate: 4.2, satisfactionScore: 4.8, uptimePercent: 99.99 },
    createdAt: daysFromNow(-200),
    updatedAt: daysFromNow(-2),
    createdById: "p2",
    versions: [],
    activityLogs: [
      { id: "log1", at: daysFromNow(-200), byId: "p2", action: "Project created" },
      { id: "log2", at: daysFromNow(-2), byId: "p1", action: "Updated metrics", field: "users", before: "210000", after: "240000" },
    ],
  },
  {
    id: "pp2",
    title: "BrightLearn — Adaptive K-12 LMS",
    slug: "brightlearn-adaptive-k12-lms",
    domain: "Edtech",
    category: "SaaS Platform",
    subcategory: "Learning Management",
    tags: ["mvp", "saas", "featured"],
    techStack: ["Next.js", "TypeScript", "Python", "FastAPI", "PostgreSQL", "OpenAI"],
    architecture: "Monolith",
    database: "PostgreSQL",
    apis: ["OpenAI", "Khan Academy", "Internal Curriculum API"],
    integrations: ["Stripe", "OpenAI", "Sendgrid"],
    projectManagerId: "p10",
    developerIds: ["p4", "p7"],
    designerIds: ["p5", "p8"],
    qaIds: ["p9"],
    clientName: "Riya Mehta",
    clientCompany: "BrightLearn Edu",
    clientEmail: "riya@brightlearn.com",
    clientCountry: "USA",
    ndaSigned: false,
    isPublic: true,
    shortDescription: "AI-personalised lesson paths for grades 1–12, adopted by 800+ schools.",
    detailedDescription: "BrightLearn blends a content CMS, adaptive learning engine, and parent dashboards. We delivered an MVP in 14 weeks and continue to ship monthly releases driven by classroom analytics.",
    problemStatement: "Teachers lacked real-time visibility into per-student concept mastery.",
    solutionProvided: "An adaptive engine that re-paths lessons based on quiz results, with parent and teacher portals.",
    features: [
      { id: "f1", title: "Adaptive lesson engine", description: "Re-paths content based on mastery.", icon: "🧠" },
      { id: "f2", title: "Teacher dashboard", description: "Real-time class analytics.", icon: "📈" },
      { id: "f3", title: "Parent app", description: "Weekly progress digests.", icon: "👨‍👩‍👧" },
    ],
    thumbnailUrl: "",
    gallery: [],
    videos: [],
    documents: [],
    productionUrl: "https://brightlearn.com",
    repoUrl: "https://github.com/agency/brightlearn",
    apiBaseUrl: "https://api.brightlearn.com",
    databaseLocation: "Cloud",
    hostingProvider: "Vercel",
    serverDetails: "Vercel + Supabase Pro",
    cicdInfo: "Vercel auto-deploy from main",
    files: [],
    externalResources: [],
    status: "Completed",
    startDate: daysFromNow(-365),
    endDate: daysFromNow(-30),
    budget: 4200000,
    revenue: 6800000,
    metrics: { performanceScore: 92, users: 58000, monthlyTraffic: 740000, conversionRate: 3.1, satisfactionScore: 4.6, uptimePercent: 99.9 },
    createdAt: daysFromNow(-380),
    updatedAt: daysFromNow(-25),
    createdById: "p10",
    versions: [],
    activityLogs: [{ id: "l1", at: daysFromNow(-380), byId: "p10", action: "Project created" }],
  },
  {
    id: "pp3",
    title: "MediTrack — Hospital Operations Suite",
    slug: "meditrack-hospital-ops-suite",
    domain: "Healthcare",
    category: "Enterprise Software",
    subcategory: "Hospital Information System",
    tags: ["enterprise", "case-study"],
    techStack: ["React", "Java", "Spring Boot", "PostgreSQL", "AWS", "Docker"],
    architecture: "Microservices",
    database: "PostgreSQL",
    apis: ["FHIR", "ABDM", "Internal Billing"],
    integrations: ["Twilio", "Razorpay", "ABDM"],
    projectManagerId: "p2",
    developerIds: ["p1", "p4"],
    designerIds: ["p5"],
    qaIds: ["p9"],
    clientName: "Dr. Sanjay Verma",
    clientCompany: "Apollo Subsidiary",
    clientCountry: "India",
    ndaSigned: true,
    isPublic: false,
    shortDescription: "End-to-end hospital ops: OPD, IPD, billing, pharmacy, lab — one system.",
    detailedDescription: "MediTrack replaced 6 legacy systems across a 400-bed hospital chain. We led discovery, design, build and migration over 9 months.",
    problemStatement: "Disconnected systems caused billing leakage and discharge delays averaging 4 hours.",
    solutionProvided: "Single source of truth across departments with real-time bed management and FHIR-compliant records.",
    features: [
      { id: "f1", title: "Bed management", description: "Live ward occupancy.", icon: "🛏️" },
      { id: "f2", title: "Billing engine", description: "Insurance & TPA integrated.", icon: "💳" },
    ],
    thumbnailUrl: "",
    gallery: [],
    videos: [],
    documents: [],
    productionUrl: "https://meditrack-internal.example.com",
    databaseLocation: "Hybrid",
    hostingProvider: "AWS",
    files: [],
    externalResources: [],
    status: "Active",
    startDate: daysFromNow(-270),
    budget: 14500000,
    revenue: 0,
    metrics: { performanceScore: 88, users: 1800, satisfactionScore: 4.4, uptimePercent: 99.95 },
    createdAt: daysFromNow(-280),
    updatedAt: daysFromNow(-7),
    createdById: "p2",
    versions: [],
    activityLogs: [{ id: "l1", at: daysFromNow(-280), byId: "p2", action: "Project created" }],
  },
];

const seedTemplates: CoverLetterTemplate[] = [
  {
    id: "ct1",
    name: "Formal Pitch",
    tone: "Formal",
    description: "Classic formal cover letter for enterprise clients.",
    body: "Dear {{recipient_name}},\n\nThank you for considering {{agency_name}} for {{project_title}}. We have reviewed your requirements and are confident we can deliver outstanding results based on our experience with {{related_project}}.\n\nWe look forward to discussing this opportunity further.\n\nWarm regards,\n{{sender_name}}",
  },
  {
    id: "ct2",
    name: "Consultative Intro",
    tone: "Consultative",
    description: "Problem-first framing for advisory engagements.",
    body: "Hi {{recipient_name}},\n\nFrom our initial conversations, the core challenge you described — {{problem}} — is one we've solved repeatedly, most recently for {{related_project}}. Our recommendation includes a discovery sprint, a measurable MVP, and a clear scaling path.\n\nHappy to walk you through similar case studies this week.\n\nBest,\n{{sender_name}}",
  },
  {
    id: "ct3",
    name: "Bold Outreach",
    tone: "Bold",
    description: "High-energy outbound pitch.",
    body: "{{recipient_name}},\n\nFive minutes. That's all I need to show you how we helped {{related_project}} grow {{metric}} in 90 days — and exactly how we'd replicate that for {{recipient_company}}.\n\nLet's pick a slot: {{calendar_link}}\n\n— {{sender_name}}",
  },
];

const seedCoverLetters: CoverLetter[] = [
  {
    id: "cl1",
    title: "ZenPay — Phase 2 Cover Letter",
    templateId: "ct1",
    portfolioProjectId: "pp1",
    recipientName: "Aarav Kapoor",
    recipientCompany: "ZenPay Technologies",
    recipientEmail: "aarav@zenpay.io",
    body: "Dear Aarav,\n\nThank you for considering us for ZenPay Phase 2. Building on the success of our reconciliation platform, we're excited to propose enhancements to dispute resolution and analytics.\n\nWarm regards,\nPriya Mehta",
    status: "Sent",
    createdAt: daysFromNow(-14),
    updatedAt: daysFromNow(-10),
    versions: [],
  },
];

// ───────────── Store ─────────────
interface PortfolioState {
  projects: PortfolioProject[];
  templates: CoverLetterTemplate[];
  coverLetters: CoverLetter[];
  techOptions: string[];
  tagOptions: string[];

  addProject: (p: Omit<PortfolioProject, "id" | "createdAt" | "updatedAt" | "versions" | "activityLogs">) => string;
  updateProject: (id: string, patch: Partial<PortfolioProject>, byId?: string) => void;
  setProjectStatus: (id: string, status: PortfolioStatus) => void;
  removeProject: (id: string) => void;
  saveProjectVersion: (id: string, byId: string, note?: string) => void;
  rollbackProjectVersion: (id: string, versionId: string) => void;

  addCoverLetter: (c: Omit<CoverLetter, "id" | "createdAt" | "updatedAt" | "versions">) => string;
  updateCoverLetter: (id: string, patch: Partial<CoverLetter>, byId?: string) => void;
  removeCoverLetter: (id: string) => void;
  rollbackCoverLetter: (id: string, versionId: string) => void;

  addTemplate: (t: Omit<CoverLetterTemplate, "id">) => string;
  updateTemplate: (id: string, patch: Partial<CoverLetterTemplate>) => void;
  removeTemplate: (id: string) => void;
}

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

const now = () => new Date().toISOString();

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      projects: seedProjects,
      templates: seedTemplates,
      coverLetters: seedCoverLetters,
      techOptions: TECH_OPTIONS,
      tagOptions: TAG_OPTIONS,

      addProject: (p) => {
        const id = `pp${Date.now()}`;
        const project: PortfolioProject = {
          ...p,
          id,
          slug: p.slug || slugify(p.title),
          createdAt: now(),
          updatedAt: now(),
          versions: [],
          activityLogs: [{ id: `log${Date.now()}`, at: now(), byId: p.createdById, action: "Project created" }],
        };
        set((st) => ({ projects: [project, ...st.projects] }));
        return id;
      },
      updateProject: (id, patch, byId = "p1") => set((st) => ({
        projects: st.projects.map((proj) => {
          if (proj.id !== id) return proj;
          const log: PortfolioActivityLog = {
            id: `log${Date.now()}`,
            at: now(),
            byId,
            action: "Updated project",
            field: Object.keys(patch).join(", "),
          };
          return { ...proj, ...patch, updatedAt: now(), activityLogs: [log, ...proj.activityLogs].slice(0, 80) };
        }),
      })),
      setProjectStatus: (id, status) => set((st) => ({
        projects: st.projects.map((p) =>
          p.id === id
            ? {
                ...p,
                status,
                updatedAt: now(),
                activityLogs: [
                  { id: `log${Date.now()}`, at: now(), byId: "p1", action: `Status → ${status}` },
                  ...p.activityLogs,
                ].slice(0, 80),
              }
            : p,
        ),
      })),
      removeProject: (id) => set((st) => ({ projects: st.projects.filter((p) => p.id !== id) })),
      saveProjectVersion: (id, byId, note) => set((st) => ({
        projects: st.projects.map((p) => {
          if (p.id !== id) return p;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { versions: _v, activityLogs: _a, ...snap } = p;
          const version: PortfolioVersion = {
            id: `v${Date.now()}`,
            version: (p.versions[0]?.version ?? 0) + 1,
            savedAt: now(),
            byId,
            note,
            snapshot: snap,
          };
          return {
            ...p,
            versions: [version, ...p.versions].slice(0, 30),
            activityLogs: [
              { id: `log${Date.now()}`, at: now(), byId, action: `Saved version v${version.version}` },
              ...p.activityLogs,
            ].slice(0, 80),
          };
        }),
      })),
      rollbackProjectVersion: (id, versionId) => set((st) => ({
        projects: st.projects.map((p) => {
          if (p.id !== id) return p;
          const v = p.versions.find((x) => x.id === versionId);
          if (!v) return p;
          return {
            ...v.snapshot,
            id: p.id,
            createdAt: p.createdAt,
            updatedAt: now(),
            versions: p.versions,
            activityLogs: [
              { id: `log${Date.now()}`, at: now(), byId: "p1", action: `Rolled back to v${v.version}` },
              ...p.activityLogs,
            ].slice(0, 80),
          };
        }),
      })),

      addCoverLetter: (c) => {
        const id = `cl${Date.now()}`;
        set((st) => ({
          coverLetters: [
            { ...c, id, createdAt: now(), updatedAt: now(), versions: [] },
            ...st.coverLetters,
          ],
        }));
        return id;
      },
      updateCoverLetter: (id, patch, byId = "p1") => set((st) => ({
        coverLetters: st.coverLetters.map((c) => {
          if (c.id !== id) return c;
          const newVersion: CoverLetterVersion | null = patch.body && patch.body !== c.body
            ? { id: `clv${Date.now()}`, at: now(), byId, body: c.body }
            : null;
          return {
            ...c,
            ...patch,
            updatedAt: now(),
            versions: newVersion ? [newVersion, ...c.versions].slice(0, 30) : c.versions,
          };
        }),
      })),
      removeCoverLetter: (id) => set((st) => ({ coverLetters: st.coverLetters.filter((c) => c.id !== id) })),
      rollbackCoverLetter: (id, versionId) => set((st) => ({
        coverLetters: st.coverLetters.map((c) => {
          if (c.id !== id) return c;
          const v = c.versions.find((x) => x.id === versionId);
          return v ? { ...c, body: v.body, updatedAt: now() } : c;
        }),
      })),

      addTemplate: (t) => {
        const id = `ct${Date.now()}`;
        set((st) => ({ templates: [{ ...t, id }, ...st.templates] }));
        return id;
      },
      updateTemplate: (id, patch) => set((st) => ({
        templates: st.templates.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      })),
      removeTemplate: (id) => set((st) => ({ templates: st.templates.filter((t) => t.id !== id) })),
    }),
    { name: "crm-portfolio-state-v1" },
  ),
);

// ───────────── AI helpers (mock) ─────────────
export function generateAIDescription(input: { title: string; domain: string; techStack: string[] }): {
  shortDescription: string;
  detailedDescription: string;
  problemStatement: string;
  solutionProvided: string;
  suggestedTags: string[];
} {
  const stack = input.techStack.length ? input.techStack.slice(0, 4).join(", ") : "modern web technologies";
  const domain = input.domain || "digital";
  return {
    shortDescription: `${input.title} is a ${domain.toLowerCase()} solution built with ${stack}, designed for measurable business impact.`,
    detailedDescription: `${input.title} addresses critical operational challenges in the ${domain.toLowerCase()} space. Built on ${stack}, the platform combines intuitive UX, scalable architecture, and reliable integrations. Our team delivered the project on a tight timeline while maintaining a strong focus on code quality, security, and observability.`,
    problemStatement: `Stakeholders in ${domain.toLowerCase()} faced fragmented workflows, slow turnaround, and limited visibility into key metrics — limiting their ability to scale.`,
    solutionProvided: `We delivered a unified platform with an event-driven core, role-based dashboards, and a clean API layer. Continuous deployment and observability ensure long-term operability.`,
    suggestedTags: [domain.toLowerCase(), "case-study", input.techStack[0]?.toLowerCase() || "web"].filter(Boolean),
  };
}

export const ALL_DOMAINS: DomainArea[] = ["Fintech", "Edtech", "Healthcare", "E-commerce", "SaaS", "Logistics", "Travel", "RealEstate", "Marketing", "AI/ML", "Other"];
export const ALL_ARCHITECTURES: ArchitectureType[] = ["Monolith", "Microservices", "Serverless", "Hybrid"];
export const ALL_DATABASES: DatabaseType[] = ["PostgreSQL", "MongoDB", "MySQL", "Firebase", "Supabase", "DynamoDB", "Redis", "Other"];
export const ALL_HOSTS: HostingProvider[] = ["AWS", "GCP", "Azure", "Vercel", "Netlify", "Hetzner", "DigitalOcean", "VPS", "On-Prem", "Other"];

export function peopleById(id?: string) {
  return PEOPLE.find((p) => p.id === id);
}

export function durationDays(start?: string, end?: string): number | null {
  if (!start) return null;
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  return Math.max(0, Math.round((e - s) / 86_400_000));
}

// silence unused-import warning during certain build configs
void pick;

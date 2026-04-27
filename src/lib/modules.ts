import {
  Workflow, Wallet, ShieldCheck, FolderKanban, Database,
  TrendingUp, FileText, Briefcase, Users2, UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export type ModuleKey =
  | "wayofwork" | "finance" | "sysadmin" | "pms" | "mastersheet"
  | "sales" | "frd" | "portfolio" | "staffing" | "canteen" | "hrms";

export interface ModuleDef {
  key: ModuleKey;
  name: string;
  short: string;
  icon: LucideIcon;
  path: string;
  colorVar: string;
  submenu: { label: string; path: string }[];
}

export const MODULES: ModuleDef[] = [
  {
    key: "wayofwork", name: "WayOfWork", short: "WOW", icon: Workflow,
    path: "/wayofwork", colorVar: "--mod-wayofwork",
    submenu: [
      { label: "Dashboard", path: "/wayofwork" },
      { label: "My WoWs", path: "/wayofwork/my-wows" },
      { label: "Create WoW", path: "/wayofwork/create" },
      { label: "Review Queue", path: "/wayofwork/review" },
      { label: "Assign Training", path: "/wayofwork/assign-training" },
      { label: "My Training", path: "/wayofwork/training" },
      { label: "WoW Library", path: "/wayofwork/library" },
      { label: "Automations", path: "/wayofwork/automations" },
    ],
  },
  {
    key: "finance", name: "Finance", short: "FIN", icon: Wallet,
    path: "/finance", colorVar: "--mod-finance",
    submenu: [
      { label: "Dashboard", path: "/finance" },
      { label: "Invoices", path: "/finance/invoices" },
      { label: "Expenses", path: "/finance/expenses" },
      { label: "Budget", path: "/finance/budget" },
      { label: "P&L", path: "/finance/pl" },
      { label: "Reports", path: "/finance/reports" },
      { label: "Approvals", path: "/finance/approvals" },
      { label: "Automations", path: "/finance/automations" },
    ],
  },
  {
    key: "sysadmin", name: "System Admin", short: "SYS", icon: ShieldCheck,
    path: "/system-admin", colorVar: "--mod-sysadmin",
    submenu: [
      { label: "Dashboard", path: "/system-admin" },
      { label: "Users", path: "/system-admin/users" },
      { label: "Teams", path: "/system-admin/teams" },
      { label: "Departments", path: "/system-admin/departments" },
      { label: "RBAC Matrix", path: "/system-admin/rbac" },
      { label: "Audit Logs", path: "/system-admin/audit" },
    ],
  },
  {
    key: "pms", name: "PMS", short: "PMS", icon: FolderKanban,
    path: "/pms", colorVar: "--mod-pms",
    submenu: [
      { label: "Dashboard", path: "/pms" },
      { label: "Projects", path: "/pms/projects" },
      { label: "My Tasks", path: "/pms/tasks" },
      { label: "Timesheets", path: "/pms/timesheets" },
      { label: "Resources", path: "/pms/resources" },
      { label: "Reports", path: "/pms/reports" },
      { label: "Automations", path: "/pms/automations" },
    ],
  },
  {
    key: "mastersheet", name: "Master Sheet", short: "MST", icon: Database,
    path: "/master-sheet", colorVar: "--mod-mastersheet",
    submenu: [
      { label: "Dashboard", path: "/master-sheet" },
      { label: "Projects", path: "/master-sheet/projects" },
      { label: "Change Requests", path: "/master-sheet/changes" },
      { label: "Analytics", path: "/master-sheet/analytics" },
    ],
  },
  {
    key: "sales", name: "Sales", short: "SLS", icon: TrendingUp,
    path: "/sales", colorVar: "--mod-sales",
    submenu: [
      { label: "Dashboard", path: "/sales" },
      { label: "Leads", path: "/sales/leads" },
      // { label: "Pipeline", path: "/sales/pipeline" }, // merged into Deals
      { label: "Deals", path: "/sales/deals" },
      { label: "Contacts", path: "/sales/contacts" },
      { label: "Companies", path: "/sales/companies" },
      { label: "Activities", path: "/sales/activities" },
      { label: "Sources", path: "/sales/sources" },
      { label: "Forecasts", path: "/sales/forecasts" },
      { label: "Proposals", path: "/sales/proposals" },
      { label: "Automations", path: "/sales/automations" },
      { label: "Reports", path: "/sales/reports" },
      { label: "Settings", path: "/sales/settings" },
    ],
  },
  {
    key: "frd", name: "FRD", short: "FRD", icon: FileText,
    path: "/frd", colorVar: "--mod-frd",
    submenu: [
      { label: "Dashboard", path: "/frd" },
      { label: "All FRDs", path: "/frd/documents" },
      { label: "Create FRD", path: "/frd/create" },
      { label: "Review Queue", path: "/frd/review" },
      { label: "Archived", path: "/frd/archived" },
      { label: "Automations", path: "/frd/automations" },
    ],
  },
  {
    key: "portfolio", name: "Portfolio", short: "PRT", icon: Briefcase,
    path: "/portfolio", colorVar: "--mod-portfolio",
    submenu: [
      { label: "Dashboard", path: "/portfolio" },
      { label: "Projects", path: "/portfolio/projects" },
      { label: "Cover Letters", path: "/portfolio/cover-letters" },
      { label: "Templates", path: "/portfolio/cover-letters/templates" },
      { label: "Clients", path: "/portfolio/clients" },
      { label: "Health", path: "/portfolio/health" },
      { label: "Automations", path: "/portfolio/automations" },
    ],
  },
  {
    key: "staffing", name: "Staffing Solutions", short: "STF", icon: Users2,
    path: "/staffing", colorVar: "--mod-staffing",
    submenu: [
      { label: "Dashboard", path: "/staffing" },
      { label: "Employees", path: "/staffing/employees" },
      { label: "Jobs", path: "/staffing/jobs" },
      { label: "Candidates", path: "/staffing/candidates" },
      { label: "Interviews", path: "/staffing/interviews" },
      { label: "Headcount", path: "/staffing/headcount" },
      { label: "Allocations", path: "/staffing/allocations" },
      { label: "Automations", path: "/staffing/automations" },
    ],
  },
  {
    key: "canteen", name: "Canteen", short: "CTN", icon: UtensilsCrossed,
    path: "/canteen", colorVar: "--mod-canteen",
    submenu: [
      { label: "Dashboard", path: "/canteen" },
      { label: "Menu", path: "/canteen/menu" },
      { label: "Orders", path: "/canteen/orders" },
      { label: "Inventory", path: "/canteen/inventory" },
      { label: "Feedback", path: "/canteen/feedback" },
      { label: "Reports", path: "/canteen/reports" },
      { label: "Automations", path: "/canteen/automations" },
    ],
  },
  {
    key: "hrms", name: "HRMS", short: "HR", icon: Users2,
    path: "/hrms", colorVar: "--mod-hrms",
    submenu: [
      { label: "Dashboard", path: "/hrms" },
      { label: "Directory", path: "/hrms/directory" },
      { label: "Module Access", path: "/hrms/module-access" },
    ],
  },
];

export const getModuleByPath = (pathname: string): ModuleDef => {
  const sorted = [...MODULES].sort((a, b) => b.path.length - a.path.length);
  const match = sorted.find(m => pathname.startsWith(m.path));
  return match ?? MODULES.find(m => m.key === "sales")!;
};

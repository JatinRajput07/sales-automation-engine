import { create } from "zustand";
import { persist } from "zustand/middleware";

// ───────────── Types ─────────────
export type EmpStatus = "Active" | "Probation" | "On Leave" | "Notice Period" | "Resigned" | "Inactive";
export const ALL_EMP_STATUSES: EmpStatus[] = ["Active", "Probation", "On Leave", "Notice Period", "Resigned", "Inactive"];

export const empStatusVariant = (s: EmpStatus): "success" | "warning" | "info" | "danger" | "neutral" => {
  switch (s) {
    case "Active": return "success";
    case "Probation": return "warning";
    case "On Leave": return "info";
    case "Notice Period": return "warning";
    case "Resigned": return "danger";
    case "Inactive": return "neutral";
  }
};

export type DeptTeamStatus = "Active" | "Inactive";
export type EmpDeptRole = "Head" | "Member";
export type EmpTeamRole = "Lead" | "Member";

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  color: string;
  status: DeptTeamStatus;
  headEmployeeId?: string;
  annualBudget: number;
  budgetPeriod: "Apr-Mar" | "Jan-Dec";
  budgetSalary: number;
  budgetBenefits: number;
  budgetTraining: number;
  budgetRecruitment: number;
  budgetOther: number;
  // Actual usage trackers (mock — pre-seeded so dashboard has interesting numbers)
  spentSalary: number;
  spentBenefits: number;
  spentTraining: number;
  spentRecruitment: number;
  spentOther: number;
  alertAtPercent: number;
  workHoursPerDay: number;
  workDays: string[];
  workLocation: "Office" | "Remote" | "Hybrid";
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  description?: string;
  status: DeptTeamStatus;
  leadEmployeeId?: string;
  leadCanApproveLeaves: boolean;
  leadCanApproveAttendance: boolean;
  budget: number;
  budgetSalary: number;
  budgetOther: number;
  spentSalary: number;
  spentOther: number;
  alertAtPercent: number;
  createdAt: string;
}

export interface EmployeeDeptAssignment {
  departmentId: string;
  role: EmpDeptRole;
}
export interface EmployeeTeamAssignment {
  teamId: string;
  role: EmpTeamRole;
}

export interface Employee {
  id: string;
  empCode: string;
  // Personal
  firstName: string;
  lastName: string;
  dob?: string;
  gender?: "Male" | "Female" | "Non-binary" | "Prefer not to say";
  personalEmail: string;
  workEmail: string;
  personalPhone: string;
  emergencyName?: string;
  emergencyPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  pin?: string;
  avatarInitials: string;
  // Employment
  designation: string;
  employmentType: "Full-Time" | "Part-Time" | "Contract" | "Intern";
  workLocation: "Office" | "Remote" | "Hybrid";
  joiningDate: string;
  probation: "None" | "1M" | "2M" | "3M" | "6M";
  noticePeriod: "15 Days" | "30 Days" | "45 Days" | "60Days" | "60 Days" | "90 Days";
  contractEndDate?: string;
  status: EmpStatus;
  // Multi-assignment
  departments: EmployeeDeptAssignment[];
  teams: EmployeeTeamAssignment[];
  reportingManagerId?: string;
  secondaryManagerId?: string;
  // Skills
  skills: string[];
  experienceLevel?: "Fresher" | "Junior" | "Mid" | "Senior" | "Lead" | "Principal";
  experienceYears?: number;
  // Salary
  currency: "INR" | "USD";
  annualCtc: number;
  salaryEffectiveDate: string;
  bankName?: string;
  bankAccount?: string;
  bankIfsc?: string;
  // Leave balances
  leaveBalances: { CL: number; SL: number; EL: number };
  createdAt: string;
}

export type LeaveType = "CL" | "SL" | "EL" | "LOP";
export type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";
export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  fromDate: string;
  toDate: string;
  days: number;
  halfDay: boolean;
  reason: string;
  contact?: string;
  status: LeaveStatus;
  approverId?: string;
  rejectReason?: string;
  appliedAt: string;
}

export type AttendanceStatus = "Present" | "Absent" | "Late" | "Leave" | "WFH" | "Holiday" | "Half Day";
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  mode?: "Biometric" | "Mobile" | "Manual";
  note?: string;
}

export type TicketStatus = "Open" | "In Progress" | "Pending Info" | "Resolved" | "Closed";
export type TicketPriority = "High" | "Medium" | "Low";
export type TicketCategory = "Payroll Issue" | "Leave Query" | "Policy Clarification" | "IT Support" | "Attendance Correction" | "Other";

export interface HelpTicket {
  id: string;
  number: string;
  employeeId: string;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedToId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetRevisionRequest {
  id: string;
  number: string;
  departmentId: string;
  amount: number;
  reason: "New Hiring" | "Salary Revision" | "Unexpected Expense" | "Other";
  justification: string;
  status: "Pending" | "Approved" | "Rejected";
  requestedById?: string;
  requestedAt: string;
}

export interface HrmsSettings {
  companyName: string;
  fiscalStart: "April" | "January";
  currency: "INR" | "USD";
  workHoursPerDay: number;
  workDays: string[];
  empIdPrefix: string;
  defaultProbation: "None" | "1M" | "2M" | "3M" | "6M";
  budgetAlertDefault: number;
  workStartTime: string;
  lateGraceMinutes: number;
  fullDayMinHours: number;
}

// ───────────── Seed data ─────────────
const today = new Date().toISOString().slice(0, 10);
const yearsAgo = (n: number) => { const d = new Date(); d.setFullYear(d.getFullYear() - n); return d.toISOString().slice(0, 10); };

const SEED_DEPTS: Department[] = [
  { id: "dept_eng", name: "Engineering", code: "DEPT-001", color: "#3B82F6", status: "Active", description: "Product engineering & infra", annualBudget: 18000000, budgetPeriod: "Apr-Mar", budgetSalary: 14000000, budgetBenefits: 1800000, budgetTraining: 1200000, budgetRecruitment: 1000000, budgetOther: 0, spentSalary: 12000000, spentBenefits: 1000000, spentTraining: 800000, spentRecruitment: 200000, spentOther: 0, alertAtPercent: 80, workHoursPerDay: 9, workDays: ["Mon","Tue","Wed","Thu","Fri"], workLocation: "Hybrid", createdAt: today, headEmployeeId: "emp_0001" },
  { id: "dept_sales", name: "Sales", code: "DEPT-002", color: "#10B981", status: "Active", description: "Revenue & growth", annualBudget: 8500000, budgetPeriod: "Apr-Mar", budgetSalary: 7200000, budgetBenefits: 800000, budgetTraining: 300000, budgetRecruitment: 200000, budgetOther: 0, spentSalary: 7200000, spentBenefits: 500000, spentTraining: 200000, spentRecruitment: 100000, spentOther: 0, alertAtPercent: 80, workHoursPerDay: 9, workDays: ["Mon","Tue","Wed","Thu","Fri"], workLocation: "Office", createdAt: today, headEmployeeId: "emp_0002" },
  { id: "dept_finance", name: "Finance", code: "DEPT-003", color: "#F59E0B", status: "Active", description: "Accounts & reporting", annualBudget: 2400000, budgetPeriod: "Apr-Mar", budgetSalary: 1800000, budgetBenefits: 300000, budgetTraining: 200000, budgetRecruitment: 100000, budgetOther: 0, spentSalary: 1800000, spentBenefits: 200000, spentTraining: 100000, spentRecruitment: 0, spentOther: 0, alertAtPercent: 80, workHoursPerDay: 9, workDays: ["Mon","Tue","Wed","Thu","Fri"], workLocation: "Office", createdAt: today, headEmployeeId: "emp_0007" },
  { id: "dept_hr", name: "HR", code: "DEPT-004", color: "#8B5CF6", status: "Active", description: "People operations", annualBudget: 2400000, budgetPeriod: "Apr-Mar", budgetSalary: 1800000, budgetBenefits: 300000, budgetTraining: 200000, budgetRecruitment: 100000, budgetOther: 0, spentSalary: 900000, spentBenefits: 150000, spentTraining: 100000, spentRecruitment: 0, spentOther: 0, alertAtPercent: 80, workHoursPerDay: 9, workDays: ["Mon","Tue","Wed","Thu","Fri"], workLocation: "Office", createdAt: today, headEmployeeId: "emp_0008" },
  { id: "dept_design", name: "Design", code: "DEPT-005", color: "#EC4899", status: "Active", description: "Product & brand design", annualBudget: 2800000, budgetPeriod: "Apr-Mar", budgetSalary: 1800000, budgetBenefits: 200000, budgetTraining: 600000, budgetRecruitment: 200000, budgetOther: 0, spentSalary: 1500000, spentBenefits: 200000, spentTraining: 300000, spentRecruitment: 0, spentOther: 0, alertAtPercent: 80, workHoursPerDay: 9, workDays: ["Mon","Tue","Wed","Thu","Fri"], workLocation: "Hybrid", createdAt: today, headEmployeeId: "emp_0009" },
  { id: "dept_marketing", name: "Marketing", code: "DEPT-006", color: "#F97316", status: "Active", description: "Demand generation", annualBudget: 3200000, budgetPeriod: "Apr-Mar", budgetSalary: 2200000, budgetBenefits: 400000, budgetTraining: 400000, budgetRecruitment: 200000, budgetOther: 0, spentSalary: 2000000, spentBenefits: 300000, spentTraining: 300000, spentRecruitment: 0, spentOther: 0, alertAtPercent: 80, workHoursPerDay: 9, workDays: ["Mon","Tue","Wed","Thu","Fri"], workLocation: "Hybrid", createdAt: today, headEmployeeId: "emp_0010" },
];

const SEED_TEAMS: Team[] = [
  { id: "team_backend", name: "Backend Team", code: "TEAM-001", departmentId: "dept_eng", status: "Active", leadEmployeeId: "emp_0003", leadCanApproveLeaves: true, leadCanApproveAttendance: true, budget: 4500000, budgetSalary: 4000000, budgetOther: 500000, spentSalary: 3200000, spentOther: 300000, alertAtPercent: 80, createdAt: today },
  { id: "team_frontend", name: "Frontend Team", code: "TEAM-002", departmentId: "dept_eng", status: "Active", leadEmployeeId: "emp_0004", leadCanApproveLeaves: true, leadCanApproveAttendance: true, budget: 3800000, budgetSalary: 3300000, budgetOther: 500000, spentSalary: 2800000, spentOther: 200000, alertAtPercent: 80, createdAt: today },
  { id: "team_devops", name: "DevOps Team", code: "TEAM-003", departmentId: "dept_eng", status: "Active", leadEmployeeId: "emp_0006", leadCanApproveLeaves: true, leadCanApproveAttendance: true, budget: 2200000, budgetSalary: 1900000, budgetOther: 300000, spentSalary: 1400000, spentOther: 200000, alertAtPercent: 80, createdAt: today },
  { id: "team_qa", name: "QA Team", code: "TEAM-004", departmentId: "dept_eng", status: "Active", leadEmployeeId: "emp_0005", leadCanApproveLeaves: true, leadCanApproveAttendance: true, budget: 1800000, budgetSalary: 1500000, budgetOther: 300000, spentSalary: 1100000, spentOther: 200000, alertAtPercent: 80, createdAt: today },
  { id: "team_enterprise", name: "Enterprise Sales", code: "TEAM-005", departmentId: "dept_sales", status: "Active", leadEmployeeId: "emp_0002", leadCanApproveLeaves: true, leadCanApproveAttendance: true, budget: 5000000, budgetSalary: 4400000, budgetOther: 600000, spentSalary: 4400000, spentOther: 400000, alertAtPercent: 80, createdAt: today },
  { id: "team_smb", name: "SMB Sales", code: "TEAM-006", departmentId: "dept_sales", status: "Active", leadCanApproveLeaves: true, leadCanApproveAttendance: true, budget: 2500000, budgetSalary: 2200000, budgetOther: 300000, spentSalary: 2200000, spentOther: 100000, alertAtPercent: 80, createdAt: today },
  { id: "team_presales", name: "Pre-Sales", code: "TEAM-007", departmentId: "dept_sales", status: "Active", leadCanApproveLeaves: true, leadCanApproveAttendance: true, budget: 1000000, budgetSalary: 800000, budgetOther: 200000, spentSalary: 600000, spentOther: 0, alertAtPercent: 80, createdAt: today },
  { id: "team_accounts", name: "Accounts", code: "TEAM-008", departmentId: "dept_finance", status: "Active", leadEmployeeId: "emp_0007", leadCanApproveLeaves: true, leadCanApproveAttendance: true, budget: 1200000, budgetSalary: 1000000, budgetOther: 200000, spentSalary: 900000, spentOther: 100000, alertAtPercent: 80, createdAt: today },
  { id: "team_payroll", name: "Payroll", code: "TEAM-009", departmentId: "dept_finance", status: "Active", leadCanApproveLeaves: true, leadCanApproveAttendance: true, budget: 600000, budgetSalary: 500000, budgetOther: 100000, spentSalary: 450000, spentOther: 50000, alertAtPercent: 80, createdAt: today },
  { id: "team_hrcore", name: "HR Core", code: "TEAM-010", departmentId: "dept_hr", status: "Active", leadEmployeeId: "emp_0008", leadCanApproveLeaves: true, leadCanApproveAttendance: true, budget: 1500000, budgetSalary: 1200000, budgetOther: 300000, spentSalary: 800000, spentOther: 100000, alertAtPercent: 80, createdAt: today },
  { id: "team_productdesign", name: "Product Design", code: "TEAM-011", departmentId: "dept_design", status: "Active", leadEmployeeId: "emp_0009", leadCanApproveLeaves: true, leadCanApproveAttendance: true, budget: 1500000, budgetSalary: 1200000, budgetOther: 300000, spentSalary: 1000000, spentOther: 200000, alertAtPercent: 80, createdAt: today },
  { id: "team_growth", name: "Growth", code: "TEAM-012", departmentId: "dept_marketing", status: "Active", leadEmployeeId: "emp_0010", leadCanApproveLeaves: true, leadCanApproveAttendance: true, budget: 1800000, budgetSalary: 1300000, budgetOther: 500000, spentSalary: 1100000, spentOther: 300000, alertAtPercent: 80, createdAt: today },
];

function mkEmp(p: Partial<Employee> & { id: string; empCode: string; firstName: string; lastName: string; designation: string; departments: EmployeeDeptAssignment[]; teams: EmployeeTeamAssignment[]; annualCtc: number; }): Employee {
  const initials = (p.firstName[0] + p.lastName[0]).toUpperCase();
  const fullName = `${p.firstName} ${p.lastName}`;
  const slug = fullName.toLowerCase().replace(/\s+/g, ".");
  return {
    dob: yearsAgo(28),
    gender: "Prefer not to say",
    personalEmail: `${slug}@gmail.com`,
    workEmail: `${slug}@company.com`,
    personalPhone: "+91 98765 43210",
    avatarInitials: initials,
    employmentType: "Full-Time",
    workLocation: "Hybrid",
    joiningDate: yearsAgo(2),
    probation: "None",
    noticePeriod: "60 Days",
    status: "Active",
    reportingManagerId: undefined,
    skills: [],
    experienceLevel: "Mid",
    experienceYears: 4,
    currency: "INR",
    salaryEffectiveDate: yearsAgo(1),
    leaveBalances: { CL: 8, SL: 12, EL: 9 },
    createdAt: today,
    ...p,
  } as Employee;
}

const SEED_EMPLOYEES: Employee[] = [
  mkEmp({ id: "emp_0001", empCode: "EMP-0001", firstName: "Arjun", lastName: "Mehta", designation: "Engineering Head", departments: [{ departmentId: "dept_eng", role: "Head" }], teams: [{ teamId: "team_backend", role: "Member" }, { teamId: "team_devops", role: "Member" }], annualCtc: 3500000 }),
  mkEmp({ id: "emp_0002", empCode: "EMP-0002", firstName: "Priya", lastName: "Mehta", designation: "Sales Manager", departments: [{ departmentId: "dept_sales", role: "Head" }], teams: [{ teamId: "team_enterprise", role: "Lead" }], annualCtc: 2800000 }),
  mkEmp({ id: "emp_0003", empCode: "EMP-0003", firstName: "Rahul", lastName: "Sharma", designation: "Sr. Engineer", departments: [{ departmentId: "dept_eng", role: "Member" }], teams: [{ teamId: "team_backend", role: "Lead" }, { teamId: "team_devops", role: "Member" }], annualCtc: 1800000, reportingManagerId: "emp_0001", skills: ["Node.js", "PostgreSQL", "TypeScript"] }),
  mkEmp({ id: "emp_0004", empCode: "EMP-0004", firstName: "Aarav", lastName: "Patel", designation: "Frontend Lead", departments: [{ departmentId: "dept_eng", role: "Member" }], teams: [{ teamId: "team_frontend", role: "Lead" }], annualCtc: 1700000, reportingManagerId: "emp_0001", skills: ["React", "TypeScript", "Tailwind"] }),
  mkEmp({ id: "emp_0005", empCode: "EMP-0005", firstName: "Meera", lastName: "Nair", designation: "QA Lead", departments: [{ departmentId: "dept_eng", role: "Member" }], teams: [{ teamId: "team_qa", role: "Lead" }, { teamId: "team_devops", role: "Member" }], annualCtc: 1500000, reportingManagerId: "emp_0001" }),
  mkEmp({ id: "emp_0006", empCode: "EMP-0006", firstName: "Vikram", lastName: "Singh", designation: "DevOps Engineer", departments: [{ departmentId: "dept_eng", role: "Member" }], teams: [{ teamId: "team_devops", role: "Lead" }], annualCtc: 1600000, reportingManagerId: "emp_0001" }),
  mkEmp({ id: "emp_0007", empCode: "EMP-0007", firstName: "Pooja", lastName: "Singh", designation: "Finance Head", departments: [{ departmentId: "dept_finance", role: "Head" }], teams: [{ teamId: "team_accounts", role: "Lead" }], annualCtc: 2400000 }),
  mkEmp({ id: "emp_0008", empCode: "EMP-0008", firstName: "Dev", lastName: "Tiwari", designation: "HR Manager", departments: [{ departmentId: "dept_hr", role: "Head" }], teams: [{ teamId: "team_hrcore", role: "Lead" }], annualCtc: 1800000 }),
  mkEmp({ id: "emp_0009", empCode: "EMP-0009", firstName: "Sara", lastName: "Joshi", designation: "Design Head", departments: [{ departmentId: "dept_design", role: "Head" }], teams: [{ teamId: "team_productdesign", role: "Lead" }], annualCtc: 2200000 }),
  mkEmp({ id: "emp_0010", empCode: "EMP-0010", firstName: "Kiran", lastName: "Bose", designation: "Marketing Lead", departments: [{ departmentId: "dept_marketing", role: "Head" }, { departmentId: "dept_sales", role: "Member" }], teams: [{ teamId: "team_growth", role: "Lead" }, { teamId: "team_enterprise", role: "Member" }], annualCtc: 2000000 }),
  mkEmp({ id: "emp_0011", empCode: "EMP-0011", firstName: "Anita", lastName: "Kapoor", designation: "Finance Analyst", departments: [{ departmentId: "dept_finance", role: "Member" }], teams: [{ teamId: "team_accounts", role: "Member" }, { teamId: "team_payroll", role: "Member" }], annualCtc: 900000, reportingManagerId: "emp_0007" }),
  mkEmp({ id: "emp_0012", empCode: "EMP-0012", firstName: "Neha", lastName: "Gupta", designation: "Account Executive", departments: [{ departmentId: "dept_sales", role: "Member" }], teams: [{ teamId: "team_smb", role: "Member" }], annualCtc: 1100000, reportingManagerId: "emp_0002" }),
  mkEmp({ id: "emp_0013", empCode: "EMP-0013", firstName: "Karan", lastName: "Verma", designation: "Backend Engineer", departments: [{ departmentId: "dept_eng", role: "Member" }], teams: [{ teamId: "team_backend", role: "Member" }], annualCtc: 1400000, reportingManagerId: "emp_0003", status: "Probation", probation: "3M" }),
  mkEmp({ id: "emp_0014", empCode: "EMP-0014", firstName: "Riya", lastName: "Shah", designation: "Frontend Developer", departments: [{ departmentId: "dept_eng", role: "Member" }], teams: [{ teamId: "team_frontend", role: "Member" }], annualCtc: 1300000, reportingManagerId: "emp_0004" }),
  mkEmp({ id: "emp_0015", empCode: "EMP-0015", firstName: "Sanjay", lastName: "Rao", designation: "Marketing Exec", departments: [{ departmentId: "dept_marketing", role: "Member" }], teams: [{ teamId: "team_growth", role: "Member" }], annualCtc: 800000, reportingManagerId: "emp_0010", status: "Notice Period" }),
];

const SEED_LEAVES: LeaveRequest[] = [
  { id: "lv_001", employeeId: "emp_0003", type: "CL", fromDate: today, toDate: today, days: 1, halfDay: false, reason: "Personal work", status: "Pending", appliedAt: today },
  { id: "lv_002", employeeId: "emp_0004", type: "SL", fromDate: today, toDate: today, days: 1, halfDay: false, reason: "Fever", status: "Pending", appliedAt: today },
  { id: "lv_003", employeeId: "emp_0012", type: "EL", fromDate: today, toDate: today, days: 2, halfDay: false, reason: "Family event", status: "Pending", appliedAt: today },
  { id: "lv_004", employeeId: "emp_0005", type: "CL", fromDate: yearsAgo(0), toDate: yearsAgo(0), days: 3, halfDay: false, reason: "Travel", status: "Approved", approverId: "emp_0001", appliedAt: today },
];

const SEED_ATTENDANCE: AttendanceRecord[] = SEED_EMPLOYEES.slice(0, 8).map((e, i) => ({
  id: `att_${e.id}`, employeeId: e.id, date: today,
  status: i < 6 ? "Present" : i === 6 ? "WFH" : "Late",
  checkIn: "09:30", checkOut: "18:35", mode: "Mobile",
}));

const SEED_TICKETS: HelpTicket[] = [
  { id: "tk_001", number: "HD-001", employeeId: "emp_0013", category: "Payroll Issue", subject: "Salary credit delay", description: "April salary not yet credited.", priority: "High", status: "Open", createdAt: today, updatedAt: today },
  { id: "tk_002", number: "HD-002", employeeId: "emp_0014", category: "IT Support", subject: "Laptop replacement", description: "Battery not holding charge.", priority: "Medium", status: "In Progress", assignedToId: "emp_0008", createdAt: today, updatedAt: today },
  { id: "tk_003", number: "HD-003", employeeId: "emp_0011", category: "Leave Query", subject: "Carry forward question", description: "How many EL can I carry forward?", priority: "Low", status: "Open", createdAt: today, updatedAt: today },
];

const SEED_REVISIONS: BudgetRevisionRequest[] = [
  { id: "rev_001", number: "REV-001", departmentId: "dept_sales", amount: 5000000, reason: "New Hiring", justification: "Need to onboard 3 enterprise reps for Q3 push.", status: "Pending", requestedById: "emp_0002", requestedAt: today },
  { id: "rev_002", number: "REV-002", departmentId: "dept_eng", amount: 2000000, reason: "Salary Revision", justification: "Annual hike cycle for engineering.", status: "Approved", requestedById: "emp_0001", requestedAt: today },
];

const DEFAULT_SETTINGS: HrmsSettings = {
  companyName: "Acme Corp",
  fiscalStart: "April",
  currency: "INR",
  workHoursPerDay: 9,
  workDays: ["Mon","Tue","Wed","Thu","Fri"],
  empIdPrefix: "EMP",
  defaultProbation: "3M",
  budgetAlertDefault: 80,
  workStartTime: "09:00",
  lateGraceMinutes: 15,
  fullDayMinHours: 7,
};

// ───────────── Store ─────────────
interface State {
  departments: Department[];
  teams: Team[];
  employees: Employee[];
  leaves: LeaveRequest[];
  attendance: AttendanceRecord[];
  tickets: HelpTicket[];
  revisions: BudgetRevisionRequest[];
  settings: HrmsSettings;
  ariaDigestDismissed: boolean;

  // Departments
  addDepartment: (d: Omit<Department, "id" | "createdAt">) => string;
  updateDepartment: (id: string, p: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  // Teams
  addTeam: (t: Omit<Team, "id" | "createdAt">) => string;
  updateTeam: (id: string, p: Partial<Team>) => void;
  deleteTeam: (id: string) => void;

  // Employees
  addEmployee: (e: Omit<Employee, "id" | "createdAt" | "avatarInitials">) => string;
  updateEmployee: (id: string, p: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addEmployeeToDept: (empId: string, departmentId: string, role: EmpDeptRole) => void;
  removeEmployeeFromDept: (empId: string, departmentId: string) => void;
  addEmployeeToTeam: (empId: string, teamId: string, role: EmpTeamRole) => void;
  removeEmployeeFromTeam: (empId: string, teamId: string) => void;

  // Leaves
  addLeave: (l: Omit<LeaveRequest, "id" | "appliedAt" | "status">) => string;
  setLeaveStatus: (id: string, status: LeaveStatus, approverId?: string, rejectReason?: string) => void;

  // Attendance
  upsertAttendance: (a: Omit<AttendanceRecord, "id"> & { id?: string }) => void;

  // Tickets
  addTicket: (t: Omit<HelpTicket, "id" | "number" | "createdAt" | "updatedAt" | "status">) => string;
  updateTicket: (id: string, p: Partial<HelpTicket>) => void;

  // Revisions
  addRevision: (r: Omit<BudgetRevisionRequest, "id" | "number" | "requestedAt" | "status">) => string;
  updateRevisionStatus: (id: string, status: BudgetRevisionRequest["status"]) => void;

  // Settings
  updateSettings: (p: Partial<HrmsSettings>) => void;

  dismissAriaDigest: () => void;
}

export const useHrmsStore = create<State>()(
  persist(
    (set, get) => ({
      departments: SEED_DEPTS,
      teams: SEED_TEAMS,
      employees: SEED_EMPLOYEES,
      leaves: SEED_LEAVES,
      attendance: SEED_ATTENDANCE,
      tickets: SEED_TICKETS,
      revisions: SEED_REVISIONS,
      settings: DEFAULT_SETTINGS,
      ariaDigestDismissed: false,

      addDepartment: (d) => {
        const id = `dept_${Date.now()}`;
        set((s) => ({ departments: [...s.departments, { ...d, id, createdAt: new Date().toISOString().slice(0, 10) }] }));
        return id;
      },
      updateDepartment: (id, p) => set((s) => ({ departments: s.departments.map((d) => d.id === id ? { ...d, ...p } : d) })),
      deleteDepartment: (id) => set((s) => ({ departments: s.departments.filter((d) => d.id !== id) })),

      addTeam: (t) => {
        const id = `team_${Date.now()}`;
        set((s) => ({ teams: [...s.teams, { ...t, id, createdAt: new Date().toISOString().slice(0, 10) }] }));
        return id;
      },
      updateTeam: (id, p) => set((s) => ({ teams: s.teams.map((t) => t.id === id ? { ...t, ...p } : t) })),
      deleteTeam: (id) => set((s) => ({ teams: s.teams.filter((t) => t.id !== id) })),

      addEmployee: (e) => {
        const id = `emp_${Date.now()}`;
        const initials = (e.firstName[0] + e.lastName[0]).toUpperCase();
        set((s) => ({ employees: [...s.employees, { ...e, id, avatarInitials: initials, createdAt: new Date().toISOString().slice(0, 10) }] }));
        return id;
      },
      updateEmployee: (id, p) => set((s) => ({ employees: s.employees.map((e) => e.id === id ? { ...e, ...p } : e) })),
      deleteEmployee: (id) => set((s) => ({ employees: s.employees.filter((e) => e.id !== id) })),
      addEmployeeToDept: (empId, departmentId, role) => set((s) => ({
        employees: s.employees.map((e) => e.id === empId
          ? { ...e, departments: e.departments.some(d => d.departmentId === departmentId) ? e.departments : [...e.departments, { departmentId, role }] }
          : e),
      })),
      removeEmployeeFromDept: (empId, departmentId) => set((s) => ({
        employees: s.employees.map((e) => e.id === empId ? { ...e, departments: e.departments.filter(d => d.departmentId !== departmentId) } : e),
      })),
      addEmployeeToTeam: (empId, teamId, role) => set((s) => ({
        employees: s.employees.map((e) => e.id === empId
          ? { ...e, teams: e.teams.some(t => t.teamId === teamId) ? e.teams : [...e.teams, { teamId, role }] }
          : e),
      })),
      removeEmployeeFromTeam: (empId, teamId) => set((s) => ({
        employees: s.employees.map((e) => e.id === empId ? { ...e, teams: e.teams.filter(t => t.teamId !== teamId) } : e),
      })),

      addLeave: (l) => {
        const id = `lv_${Date.now()}`;
        set((s) => ({ leaves: [...s.leaves, { ...l, id, status: "Pending", appliedAt: new Date().toISOString().slice(0, 10) }] }));
        return id;
      },
      setLeaveStatus: (id, status, approverId, rejectReason) => set((s) => ({
        leaves: s.leaves.map((l) => l.id === id ? { ...l, status, approverId, rejectReason } : l),
      })),

      upsertAttendance: (a) => set((s) => {
        const existing = s.attendance.find((x) => x.employeeId === a.employeeId && x.date === a.date);
        if (existing) return { attendance: s.attendance.map((x) => x.id === existing.id ? { ...x, ...a, id: existing.id } : x) };
        return { attendance: [...s.attendance, { ...a, id: a.id ?? `att_${Date.now()}` }] };
      }),

      addTicket: (t) => {
        const id = `tk_${Date.now()}`;
        const num = `HD-${String(get().tickets.length + 1).padStart(3, "0")}`;
        const now = new Date().toISOString();
        set((s) => ({ tickets: [...s.tickets, { ...t, id, number: num, status: "Open", createdAt: now, updatedAt: now }] }));
        return id;
      },
      updateTicket: (id, p) => set((s) => ({ tickets: s.tickets.map((t) => t.id === id ? { ...t, ...p, updatedAt: new Date().toISOString() } : t) })),

      addRevision: (r) => {
        const id = `rev_${Date.now()}`;
        const num = `REV-${String(get().revisions.length + 1).padStart(3, "0")}`;
        set((s) => ({ revisions: [...s.revisions, { ...r, id, number: num, status: "Pending", requestedAt: new Date().toISOString().slice(0, 10) }] }));
        return id;
      },
      updateRevisionStatus: (id, status) => set((s) => ({ revisions: s.revisions.map((r) => r.id === id ? { ...r, status } : r) })),

      updateSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
      dismissAriaDigest: () => set({ ariaDigestDismissed: true }),
    }),
    { name: "crm-hrms-state-v1" }
  )
);

// ───────────── Helpers ─────────────
export function deptUsed(d: Department): number {
  return d.spentSalary + d.spentBenefits + d.spentTraining + d.spentRecruitment + d.spentOther;
}
export function deptRemaining(d: Department): number { return d.annualBudget - deptUsed(d); }
export function deptUsedPercent(d: Department): number { return d.annualBudget > 0 ? Math.round((deptUsed(d) / d.annualBudget) * 100) : 0; }

export function teamUsed(t: Team): number { return t.spentSalary + t.spentOther; }
export function teamRemaining(t: Team): number { return t.budget - teamUsed(t); }
export function teamUsedPercent(t: Team): number { return t.budget > 0 ? Math.round((teamUsed(t) / t.budget) * 100) : 0; }

export function pctVariant(p: number): "success" | "warning" | "danger" {
  if (p < 70) return "success";
  if (p <= 90) return "warning";
  return "danger";
}

export function fullName(e: Employee | undefined): string {
  if (!e) return "—";
  return `${e.firstName} ${e.lastName}`;
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CrmShell } from "@/components/shell/CrmShell";
import SalesDashboard from "@/pages/sales/SalesDashboard";
import SystemAdminDashboard from "@/pages/sysadmin/SystemAdminDashboard";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "./pages/NotFound.tsx";
import { MODULES } from "@/lib/modules";
import AuditLogs from "@/pages/sysadmin/AuditLogs";

// WayOfWork
import WowDashboard from "@/pages/wayofwork/WowDashboard";
import MyWows from "@/pages/wayofwork/MyWows";
import CreateWow from "@/pages/wayofwork/CreateWow";
import ReviewQueue from "@/pages/wayofwork/ReviewQueue";
import AssignTraining from "@/pages/wayofwork/AssignTraining";
import MyTraining from "@/pages/wayofwork/MyTraining";
import WowLibrary from "@/pages/wayofwork/WowLibrary";
import WowAutomations from "@/pages/wayofwork/WowAutomations";

// Finance
import FinanceDashboard from "@/pages/finance/FinanceDashboard";
import Invoices from "@/pages/finance/Invoices";
import Expenses from "@/pages/finance/Expenses";
import Budget from "@/pages/finance/Budget";
import PnL from "@/pages/finance/PnL";
import FinanceReports from "@/pages/finance/Reports";
import Approvals from "@/pages/finance/Approvals";
import FinanceAutomations from "@/pages/finance/FinanceAutomations";

// Sales
import Leads from "@/pages/sales/Leads";
import LeadNew from "@/pages/sales/LeadNew";
import LeadDetail from "@/pages/sales/LeadDetail";
import Sources from "@/pages/sales/Sources";
import SourceNew from "@/pages/sales/SourceNew";
import SourceDetail from "@/pages/sales/SourceDetail";
import Companies from "@/pages/sales/Companies";
import CompanyNew from "@/pages/sales/CompanyNew";
import CompanyDetail from "@/pages/sales/CompanyDetail";
import Contacts from "@/pages/sales/Contacts";
import ContactNew from "@/pages/sales/ContactNew";
import ContactDetail from "@/pages/sales/ContactDetail";
// import Pipeline from "@/pages/sales/Pipeline"; // merged into Deals
import Deals from "@/pages/sales/Deals";
import DealNew from "@/pages/sales/DealNew";
import DealDetail from "@/pages/sales/DealDetail";
import Activities from "@/pages/sales/Activities";
import ActivityNew from "@/pages/sales/ActivityNew";
import Forecasts from "@/pages/sales/Forecasts";
import Proposals from "@/pages/sales/Proposals";
import ProposalNew from "@/pages/sales/ProposalNew";
import ProposalDetail from "@/pages/sales/ProposalDetail";
import SalesAutomations from "@/pages/sales/Automations";
import SalesReports from "@/pages/sales/Reports";
import SalesSettings from "@/pages/sales/Settings";

// HRMS
import HrmsDashboard from "@/pages/hrms/HrmsDashboard";
import Departments from "@/pages/hrms/Departments";
import DepartmentNew from "@/pages/hrms/DepartmentNew";
import DepartmentDetail from "@/pages/hrms/DepartmentDetail";
import Teams from "@/pages/hrms/Teams";
import TeamNew from "@/pages/hrms/TeamNew";
import TeamDetail from "@/pages/hrms/TeamDetail";
import Employees from "@/pages/hrms/Employees";
import EmployeeNew from "@/pages/hrms/EmployeeNew";
import EmployeeDetail from "@/pages/hrms/EmployeeDetail";
import HrmsBudget from "@/pages/hrms/Budget";
import BudgetRevisionRequest from "@/pages/hrms/BudgetRevisionRequest";
import Leaves from "@/pages/hrms/Leaves";
import LeaveApply from "@/pages/hrms/LeaveApply";
import Attendance from "@/pages/hrms/Attendance";
import HelpDesk from "@/pages/hrms/HelpDesk";
import TicketNew from "@/pages/hrms/TicketNew";
import ModuleAccess from "@/pages/hrms/ModuleAccess";
import HrmsSettings from "@/pages/hrms/HrmsSettings";

// Portfolio
import PortfolioDashboard from "@/pages/portfolio/PortfolioDashboard";
import PortfolioProjects from "@/pages/portfolio/Projects";
import PortfolioProjectNew from "@/pages/portfolio/ProjectNew";
import PortfolioProjectDetail from "@/pages/portfolio/ProjectDetail";
import PortfolioPublicProject from "@/pages/portfolio/PublicProject";
import CoverLetters from "@/pages/portfolio/CoverLetters";
import CoverLetterNew from "@/pages/portfolio/CoverLetterNew";
import CoverLetterDetail from "@/pages/portfolio/CoverLetterDetail";
import CoverLetterTemplates from "@/pages/portfolio/CoverLetterTemplates";

const queryClient = new QueryClient();

// Custom routes that override the auto-PlaceholderPage
const CUSTOM_ROUTES: Record<string, React.ComponentType> = {
  "/sales": SalesDashboard,
  "/system-admin": SystemAdminDashboard,
  "/system-admin/audit": AuditLogs,
  "/wayofwork": WowDashboard,
  "/wayofwork/my-wows": MyWows,
  "/wayofwork/create": CreateWow,
  "/wayofwork/review": ReviewQueue,
  "/wayofwork/assign-training": AssignTraining,
  "/wayofwork/training": MyTraining,
  "/wayofwork/library": WowLibrary,
  "/wayofwork/automations": WowAutomations,
  "/finance": FinanceDashboard,
  "/finance/invoices": Invoices,
  "/finance/expenses": Expenses,
  "/finance/budget": Budget,
  "/finance/pl": PnL,
  "/finance/reports": FinanceReports,
  "/finance/approvals": Approvals,
  "/finance/automations": FinanceAutomations,
  "/sales/leads": Leads,
  "/sales/sources": Sources,
  "/sales/companies": Companies,
  "/sales/contacts": Contacts,
  // "/sales/pipeline": Pipeline, // merged into Deals
  "/sales/deals": Deals,
  "/sales/activities": Activities,
  "/sales/forecasts": Forecasts,
  "/sales/proposals": Proposals,
  "/sales/automations": SalesAutomations,
  "/sales/reports": SalesReports,
  "/sales/settings": SalesSettings,
  "/hrms": HrmsDashboard,
  "/hrms/departments": Departments,
  "/hrms/teams": Teams,
  "/hrms/employees": Employees,
  "/hrms/budget": HrmsBudget,
  "/hrms/leaves": Leaves,
  "/hrms/attendance": Attendance,
  "/hrms/helpdesk": HelpDesk,
  "/hrms/module-access": ModuleAccess,
  "/hrms/settings": HrmsSettings,
  "/portfolio": PortfolioDashboard,
  "/portfolio/projects": PortfolioProjects,
  "/portfolio/cover-letters": CoverLetters,
  "/portfolio/cover-letters/templates": CoverLetterTemplates,
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}>
          <Routes>
            <Route element={<CrmShell />}>
              <Route path="/" element={<Navigate to="/sales" replace />} />

              {MODULES.flatMap(m => {
                const all = [{ label: m.name, path: m.path }, ...m.submenu.filter(s => s.path !== m.path)];
                return all.map(s => {
                  const Comp = CUSTOM_ROUTES[s.path] ?? PlaceholderPage;
                  return <Route key={s.path} path={s.path} element={<Comp />} />;
                });
              })}

              {/* Sales detail/new routes (not in submenu) */}
              <Route path="/sales/leads/new" element={<LeadNew />} />
              <Route path="/sales/leads/:id" element={<LeadDetail />} />
              <Route path="/sales/sources/new" element={<SourceNew />} />
              <Route path="/sales/sources/:id" element={<SourceDetail />} />
              <Route path="/sales/companies/new" element={<CompanyNew />} />
              <Route path="/sales/companies/:id" element={<CompanyDetail />} />
              <Route path="/sales/contacts/new" element={<ContactNew />} />
              <Route path="/sales/contacts/:id" element={<ContactDetail />} />
              <Route path="/sales/deals/new" element={<DealNew />} />
              <Route path="/sales/deals/:id" element={<DealDetail />} />
              <Route path="/sales/activities/new" element={<ActivityNew />} />
              <Route path="/sales/proposals/new" element={<ProposalNew />} />
              <Route path="/sales/proposals/:id" element={<ProposalDetail />} />

              {/* HRMS detail/new routes */}
              <Route path="/hrms/departments/new" element={<DepartmentNew />} />
              <Route path="/hrms/departments/:id" element={<DepartmentDetail />} />
              <Route path="/hrms/teams/new" element={<TeamNew />} />
              <Route path="/hrms/teams/:id" element={<TeamDetail />} />
              <Route path="/hrms/employees/new" element={<EmployeeNew />} />
              <Route path="/hrms/employees/:id" element={<EmployeeDetail />} />
              <Route path="/hrms/budget/revision" element={<BudgetRevisionRequest />} />
              <Route path="/hrms/leaves/apply" element={<LeaveApply />} />
              <Route path="/hrms/helpdesk/new" element={<TicketNew />} />

              {/* Portfolio detail/new routes */}
              <Route path="/portfolio/projects/new" element={<PortfolioProjectNew />} />
              <Route path="/portfolio/projects/:id" element={<PortfolioProjectDetail />} />
              <Route path="/portfolio/cover-letters/new" element={<CoverLetterNew />} />
              <Route path="/portfolio/cover-letters/:id" element={<CoverLetterDetail />} />
            </Route>
            {/* Public portfolio (outside CrmShell) */}
            <Route path="/portfolio/p/:slug" element={<PortfolioPublicProject />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

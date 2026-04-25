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
import Pipeline from "@/pages/sales/Pipeline";
import Deals from "@/pages/sales/Deals";
import DealNew from "@/pages/sales/DealNew";
import DealDetail from "@/pages/sales/DealDetail";
import Activities from "@/pages/sales/Activities";
import Forecasts from "@/pages/sales/Forecasts";
import SalesReports from "@/pages/sales/Reports";
import SalesSettings from "@/pages/sales/Settings";

const queryClient = new QueryClient();

// Custom routes that override the auto-PlaceholderPage
const CUSTOM_ROUTES: Record<string, React.ComponentType> = {
  "/sales": SalesDashboard,
  "/system-admin": SystemAdminDashboard,
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
  "/sales/pipeline": Pipeline,
  "/sales/deals": Deals,
  "/sales/activities": Activities,
  "/sales/forecasts": Forecasts,
  "/sales/reports": SalesReports,
  "/sales/settings": SalesSettings,
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
              <Route path="/sales/deals/new" element={<DealNew />} />
              <Route path="/sales/deals/:id" element={<DealDetail />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

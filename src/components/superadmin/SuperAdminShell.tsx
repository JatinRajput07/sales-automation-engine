import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, Layers, Receipt, MessageSquare,
  Sparkles, Boxes, Megaphone, LifeBuoy, BarChart3, Settings, Bell, LogOut, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSuperAdminStore } from "@/store/superAdminStore";

const NAV = [
  { to: "/super-admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/super-admin/tenants", icon: Building2, label: "Tenants" },
  { to: "/super-admin/plans", icon: Layers, label: "Plans" },
  { to: "/super-admin/billing", icon: Receipt, label: "Billing" },
  { to: "/super-admin/demo-requests", icon: MessageSquare, label: "Demo Requests" },
  { to: "/super-admin/custom-deals", icon: Sparkles, label: "Custom Deals" },
  { to: "/super-admin/modules", icon: Boxes, label: "Modules" },
  { to: "/super-admin/announcements", icon: Megaphone, label: "Announcements" },
  { to: "/super-admin/support", icon: LifeBuoy, label: "Support" },
  { to: "/super-admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/super-admin/settings", icon: Settings, label: "Settings" },
];

export function SuperAdminShell() {
  const navigate = useNavigate();
  const setAuthed = useSuperAdminStore(s => s.setAuthed);
  return (
    <div className="h-screen w-screen flex flex-col bg-[hsl(220,20%,97%)] text-foreground overflow-hidden" style={{ ["--sa-accent" as any]: "239 84% 67%" }}>
      {/* Header */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-border bg-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md flex items-center justify-center text-white" style={{ background: "hsl(var(--sa-accent))" }}>
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-none">Super Admin</div>
            <div className="text-2xs text-muted-foreground mt-0.5">Product Owner Console</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full text-[9px] text-white flex items-center justify-center" style={{ background: "hsl(var(--sa-accent))" }}>3</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-2xs font-semibold flex items-center justify-center">RS</div>
            <div className="text-xs">
              <div className="font-medium leading-none">Rahul S</div>
              <div className="text-2xs text-muted-foreground mt-0.5">Super Admin</div>
            </div>
            <button
              onClick={() => { setAuthed(false); navigate("/super-admin/login"); }}
              className="ml-2 w-7 h-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* L1 sidebar (icon only, 60px) */}
        <nav className="w-[60px] bg-white border-r border-border flex flex-col items-center py-2 gap-1 shrink-0">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              title={n.label}
              className={({ isActive }) => cn(
                "w-11 h-11 rounded-lg flex items-center justify-center transition-colors relative group",
                isActive ? "text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              style={({ isActive }: any) => isActive ? { background: "hsl(var(--sa-accent))" } : undefined}
            >
              <n.icon className="w-[18px] h-[18px]" />
              <span className="absolute left-full ml-2 px-2 py-1 rounded bg-foreground text-background text-2xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
                {n.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 min-w-0 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function SAPageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="px-6 pt-5 pb-4 flex items-end justify-between border-b border-border bg-white">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}

export function SAGuard({ children }: { children: React.ReactNode }) {
  const authed = useSuperAdminStore(s => s.authed);
  if (!authed) {
    if (typeof window !== "undefined" && window.location.pathname !== "/super-admin/login") {
      window.location.href = "/super-admin/login";
    }
    return null;
  }
  return <>{children}</>;
}

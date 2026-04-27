import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { getModuleByPath } from "@/lib/modules";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import { StatusPill } from "@/components/ui/StatusPill";
import { cn } from "@/lib/utils";

export function L2Sidebar() {
  const location = useLocation();
  const { l1Open } = useAppStore();
  const { user } = useAuthStore();
  const mod = getModuleByPath(location.pathname);

  if (!l1Open || !user) return null;

  const activeTeam = user.activeTeam;
  const isSuperAdmin = user.globalRole === 'SUPER_ADMIN';
  const moduleAccess = user.accessibleModules.find(m => m.moduleId === mod.key);
  const allowedPages = isSuperAdmin 
    ? mod.submenu.map(s => s.path.split('/').pop() || s.label.toLowerCase())
    : (moduleAccess?.allowedL2Pages || []);

  return (
    <aside className="w-[220px] bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 animate-fade-in">
      {/* Module header */}
      <div className="h-10 px-3 flex items-center gap-2 border-b border-sidebar-border">
        <span
          className="w-2 h-2 rounded-sm"
          style={{ background: `hsl(var(${mod.colorVar}))` }}
        />
        <span className="text-xs font-semibold uppercase tracking-wider">{mod.name}</span>
        <span className="ml-auto text-3xs font-mono text-muted-foreground">{mod.short}</span>
      </div>

      {/* Team context */}
      <div className="px-3 py-2 border-b border-sidebar-border">
        <div className="text-3xs uppercase tracking-wider text-muted-foreground mb-1">Active Team</div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium truncate">{activeTeam?.teamName}</span>
          {activeTeam?.isPrimary ? <StatusPill variant="info">primary</StatusPill> : <StatusPill variant="warning">guest</StatusPill>}
        </div>
      </div>

      {/* Submenu */}
      <nav className="flex-1 overflow-y-auto py-1">
        <div className="px-3 py-1 text-3xs uppercase tracking-wider text-muted-foreground">Navigation</div>
        {mod.submenu
          .filter(item => {
            // Match submenu label/path to allowed pages list
            // Fallback strategy since mod.submenu uses paths like `/sales/deals`
            const slug = item.path.split('/').pop() || item.label.toLowerCase();
            return allowedPages.includes(slug);
          })
          .map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className="block h-7 px-3 flex items-center text-xs text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
            activeClassName={cn(
              "!text-foreground bg-surface-hover font-medium relative",
              "before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[2px]"
            )}
          >
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer info */}
      <div className="px-3 py-2 border-t border-sidebar-border text-3xs text-muted-foreground font-mono">
        v2.4.1 · {isSuperAdmin ? 'SUPER_ADMIN' : (moduleAccess?.moduleRole || 'NO_ACCESS')}
      </div>
    </aside>
  );
}

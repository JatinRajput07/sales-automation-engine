import { useLocation, useNavigate } from "react-router-dom";
import { ChevronsLeft, ChevronsRight, Lock } from "lucide-react";
import { MODULES } from "@/lib/modules";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function L1Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { l1Open, toggleL1 } = useAppStore();
  const { user, setActiveModule } = useAuthStore();

  const activeModule = MODULES.find(m => location.pathname.startsWith(m.path)) ?? MODULES[5];

  if (!user) return null;

  return (
    <TooltipProvider delayDuration={150}>
      <aside className="w-14 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
        <nav className="flex-1 flex flex-col py-2 gap-0.5 overflow-y-auto">
          {MODULES.map((m) => {
            const isSuperAdmin = user.globalRole === 'SUPER_ADMIN';
            const moduleAccess = user.accessibleModules.find(acc => acc.moduleId === m.key);

            if (!isSuperAdmin && !moduleAccess) return null; // Hidden, not disabled

            const isModuleAdmin = isSuperAdmin || moduleAccess?.isModuleAdmin;
            const isActive = activeModule.key === m.key;
            const Icon = m.icon;
            return (
              <Tooltip key={m.key}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      setActiveModule(m.key);
                      navigate(m.path);
                    }}
                    className={cn(
                      "relative h-10 mx-1 rounded-sm flex items-center justify-center transition-colors group",
                      isActive
                        ? "bg-surface-hover text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                    )}
                  >
                    {isActive && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-sm"
                        style={{ background: `hsl(var(${m.colorVar}))` }}
                      />
                    )}
                    <Icon className="w-[18px] h-[18px]" />
                    {/* {isModuleAdmin && (
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-warning rounded-full border-[1.5px] border-sidebar flex items-center justify-center shadow-sm">
                        <span className="text-[8px] leading-none" role="img" aria-label="admin">👑</span>
                      </div>
                    )} */}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  <span className="font-medium">{m.name} {isModuleAdmin ? "(Admin)" : ""}</span>
                  <span className="text-muted-foreground ml-2 font-mono text-2xs">{m.short}</span>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Locked indicator (info only) */}
          {MODULES.some(m => user.globalRole !== 'SUPER_ADMIN' && !user.accessibleModules.find(acc => acc.moduleId === m.key)) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-10 mx-1 flex items-center justify-center text-muted-foreground/40">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs max-w-[180px]">
                Some modules hidden by your role
              </TooltipContent>
            </Tooltip>
          )}
        </nav>

        <button
          onClick={toggleL1}
          className="h-9 mx-1 mb-1 flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-surface-hover"
          title={l1Open ? "Collapse submenu" : "Expand submenu"}
        >
          {l1Open ? <ChevronsLeft className="w-4 h-4" /> : <ChevronsRight className="w-4 h-4" />}
        </button>
      </aside>
    </TooltipProvider>
  );
}

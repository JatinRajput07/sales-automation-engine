import { ModuleHeader, FilterBar } from "@/components/ui/ModuleHeader";
import { Panel } from "@/components/ui/DashboardLayout";
import { DataTable } from "@/components/ui/DataTable";
import { useFinanceStore } from "@/store/financeStore";
import { inr } from "@/lib/mockData";
import { StatusPill } from "@/components/ui/StatusPill";

export default function Budget() {
  const { budgets } = useFinanceStore();
  const byDept = Array.from(new Set(budgets.map(b => b.department)));

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title="Budget" subtitle="Q1 2025 · ₹ allocations" accentVar="--mod-finance" />
      <FilterBar />
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {byDept.map((dept: string) => {
          const items = budgets.filter(b => b.department === dept);
          const allocated = items.reduce((a, b) => a + b.allocated, 0);
          const spent = items.reduce((a, b) => a + b.spent, 0);
          const pct = Math.round((spent / allocated) * 100);
          const over = pct > 100;
          return (
            <div key={dept} className="bg-surface border border-border rounded-lg p-3">
              <div className="text-xs uppercase text-muted-foreground tracking-wider mb-2">{dept}</div>
              <div className="text-lg font-mono font-bold mb-0.5">{inr(spent)}</div>
              <div className="text-2xs text-muted-foreground mb-2">of {inr(allocated)}</div>
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
                <div className="h-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: over ? "hsl(var(--destructive))" : "hsl(var(--mod-finance))" }} />
              </div>
              <div className="flex justify-between text-2xs">
                <span className={over ? "text-destructive font-medium" : "text-muted-foreground"}>{pct}% used</span>
                <span className="font-mono text-muted-foreground">{inr(allocated - spent)} left</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 flex-1">
        <Panel title="All Budget Lines">
          <DataTable
            rowKey={(r) => r.id} rows={budgets}
            columns={[
              { key: "department", label: "Department", render: (r) => <span className="font-medium">{r.department}</span> },
              { key: "category", label: "Category" },
              { key: "allocated", label: "Allocated", align: "right", render: (r) => <span className="font-mono tabular-nums">{inr(r.allocated)}</span> },
              { key: "spent", label: "Spent", align: "right", render: (r) => <span className="font-mono tabular-nums">{inr(r.spent)}</span> },
              { key: "remaining", label: "Remaining", align: "right", render: (r) => <span className="font-mono tabular-nums">{inr(r.allocated - r.spent)}</span> },
              { key: "status", label: "Status", render: (r) => {
                const pct = (r.spent / r.allocated) * 100;
                return <StatusPill variant={pct > 100 ? "danger" : pct > 90 ? "warning" : "success"}>{Math.round(pct)}%</StatusPill>;
              }},
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}

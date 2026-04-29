import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Download, LayoutGrid, List, Search, Settings as SettingsIcon } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/StatusPill";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { useHrmsStore, deptUsed, deptUsedPercent, deptRemaining, pctVariant, fullName, type Department } from "@/store/hrmsStore";
import { inr } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

export default function Departments() {
  const departments = useHrmsStore((s) => s.departments);
  const teams = useHrmsStore((s) => s.teams);
  const employees = useHrmsStore((s) => s.employees);
  const { toast } = useToast();

  const [view, setView] = useState<"cards" | "table">("cards");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let out = departments;
    if (search) {
      const s = search.toLowerCase();
      out = out.filter((d) => d.name.toLowerCase().includes(s) || d.code.toLowerCase().includes(s));
    }
    return out;
  }, [departments, search]);

  const totalBudget = departments.reduce((a, d) => a + d.annualBudget, 0);
  const totalEmps = employees.length;

  const columns: Column<Department>[] = [
    { key: "name", label: "Name", render: (d) => <span className="font-medium">{d.name}</span> },
    { key: "code", label: "Code", render: (d) => <span className="font-mono text-2xs">{d.code}</span> },
    { key: "head", label: "Head", render: (d) => fullName(employees.find((e) => e.id === d.headEmployeeId)) },
    { key: "teams", label: "Teams", align: "right", render: (d) => teams.filter((t) => t.departmentId === d.id).length },
    { key: "emps", label: "Employees", align: "right", render: (d) => employees.filter((e) => e.departments.some((x) => x.departmentId === d.id)).length },
    { key: "alloc", label: "Allocated", align: "right", render: (d) => <span className="font-mono">{inr(d.annualBudget)}</span> },
    { key: "used", label: "Used", align: "right", render: (d) => <span className="font-mono">{inr(deptUsed(d))}</span> },
    { key: "rem", label: "Remaining", align: "right", render: (d) => <span className="font-mono">{inr(deptRemaining(d))}</span> },
    { key: "pct", label: "%", align: "right", render: (d) => {
      const p = deptUsedPercent(d);
      const v = pctVariant(p);
      return <span className={`font-mono font-semibold ${v === "danger" ? "text-destructive" : v === "warning" ? "text-warning" : "text-success"}`}>{p}%</span>;
    } },
    { key: "status", label: "Status", render: (d) => <StatusPill variant={d.status === "Active" ? "success" : "neutral"}>{d.status}</StatusPill> },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <ModuleHeader
        title="Departments"
        subtitle={`Total: ${departments.length} · Budget: ${inr(totalBudget)} · Employees: ${totalEmps}`}
        accentVar="--mod-hrms"
        actions={
          <>
            <Button size="sm" variant="outline" className="h-7 gap-1.5" onClick={() => toast({ title: "Exported (mock)" })}><Download className="w-3.5 h-3.5" />Export</Button>
            <Link to="/hrms/departments/new"><Button size="sm" className="h-7 gap-1.5"><Plus className="w-3.5 h-3.5" />New Department</Button></Link>
          </>
        }
      />

      <div className="px-3 py-2 border-b border-border flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search departments…" className="h-7 pl-7 text-xs" />
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Button size="sm" variant={view === "cards" ? "default" : "ghost"} className="h-7 px-2" onClick={() => setView("cards")}><LayoutGrid className="w-3.5 h-3.5" /></Button>
          <Button size="sm" variant={view === "table" ? "default" : "ghost"} className="h-7 px-2" onClick={() => setView("table")}><List className="w-3.5 h-3.5" /></Button>
        </div>
      </div>

      {view === "cards" ? (
        <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((d) => {
            const pct = deptUsedPercent(d);
            const v = pctVariant(pct);
            const barColor = v === "success" ? "bg-success" : v === "warning" ? "bg-warning" : "bg-destructive";
            const teamCount = teams.filter((t) => t.departmentId === d.id).length;
            const empCount = employees.filter((e) => e.departments.some((x) => x.departmentId === d.id)).length;
            return (
              <div key={d.id} className="border border-border rounded-md bg-surface p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ background: d.color }} />
                    <div>
                      <div className="text-sm font-semibold">{d.name}</div>
                      <div className="text-2xs text-muted-foreground font-mono">{d.code}</div>
                    </div>
                  </div>
                  <StatusPill variant={d.status === "Active" ? "success" : "neutral"}>{d.status}</StatusPill>
                </div>
                <div className="text-xs text-muted-foreground">Head: <span className="text-foreground">{fullName(employees.find((e) => e.id === d.headEmployeeId)) || "—"}</span></div>
                <div className="border-t border-border pt-2 grid grid-cols-2 gap-1 text-2xs">
                  <span className="text-muted-foreground">Teams:</span><span className="font-mono text-right">{teamCount}</span>
                  <span className="text-muted-foreground">Employees:</span><span className="font-mono text-right">{empCount}</span>
                </div>
                <div className="border-t border-border pt-2 space-y-1 text-xs">
                  <div className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold">Budget</div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Allocated:</span><span className="font-mono">{inr(d.annualBudget)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Used:</span><span className="font-mono">{inr(deptUsed(d))} ({pct}%)</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Remaining:</span><span className="font-mono">{inr(deptRemaining(d))}</span></div>
                  <div className="h-1.5 bg-muted rounded-sm overflow-hidden mt-1">
                    <div className={`h-full ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
                <div className="flex gap-1.5 pt-1">
                  <Link to={`/hrms/departments/${d.id}`} className="flex-1"><Button size="sm" variant="outline" className="h-6 text-2xs w-full">View</Button></Link>
                  <Link to={`/hrms/departments/${d.id}?edit=1`} className="flex-1"><Button size="sm" variant="outline" className="h-6 text-2xs w-full">Edit</Button></Link>
                  <Link to={`/hrms/teams?dept=${d.id}`} className="flex-1"><Button size="sm" variant="outline" className="h-6 text-2xs w-full">Teams</Button></Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-3">
          <DataTable rows={filtered} columns={columns} rowKey={(d) => d.id} onRowClick={(d) => window.location.assign(`/hrms/departments/${d.id}`)} />
        </div>
      )}
    </div>
  );
}

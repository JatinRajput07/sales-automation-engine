import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Download, Search } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/StatusPill";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHrmsStore, teamUsed, teamUsedPercent, teamRemaining, pctVariant, fullName, type Team } from "@/store/hrmsStore";
import { inr } from "@/lib/mockData";

export default function Teams() {
  const teams = useHrmsStore((s) => s.teams);
  const departments = useHrmsStore((s) => s.departments);
  const employees = useHrmsStore((s) => s.employees);
  const [params] = useSearchParams();
  const initDept = params.get("dept") || "all";

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>(initDept);

  const filtered = useMemo(() => {
    let out = teams;
    if (deptFilter !== "all") out = out.filter((t) => t.departmentId === deptFilter);
    if (search) {
      const s = search.toLowerCase();
      out = out.filter((t) => t.name.toLowerCase().includes(s));
    }
    return out;
  }, [teams, search, deptFilter]);

  const columns: Column<Team>[] = [
    { key: "name", label: "Team", render: (t) => <Link to={`/hrms/teams/${t.id}`} className="font-medium text-primary hover:underline">{t.name}</Link> },
    { key: "dept", label: "Department", render: (t) => departments.find((d) => d.id === t.departmentId)?.name || "—" },
    { key: "lead", label: "Lead", render: (t) => fullName(employees.find((e) => e.id === t.leadEmployeeId)) },
    { key: "mem", label: "Members", align: "right", render: (t) => employees.filter((e) => e.teams.some((x) => x.teamId === t.id)).length },
    { key: "alloc", label: "Allocated", align: "right", render: (t) => <span className="font-mono">{inr(t.budget)}</span> },
    { key: "used", label: "Used", align: "right", render: (t) => <span className="font-mono">{inr(teamUsed(t))}</span> },
    { key: "rem", label: "Remaining", align: "right", render: (t) => <span className="font-mono">{inr(teamRemaining(t))}</span> },
    { key: "pct", label: "%", align: "right", render: (t) => {
      const p = teamUsedPercent(t); const v = pctVariant(p);
      return <span className={`font-mono font-semibold ${v === "danger" ? "text-destructive" : v === "warning" ? "text-warning" : "text-success"}`}>{p}%</span>;
    } },
    { key: "status", label: "Status", render: (t) => <StatusPill variant={t.status === "Active" ? "success" : "neutral"}>{t.status}</StatusPill> },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <ModuleHeader
        title="Teams"
        subtitle={`${teams.length} teams · ${employees.length} employees`}
        accentVar="--mod-hrms"
        actions={
          <>
            <Button size="sm" variant="outline" className="h-7 gap-1.5"><Download className="w-3.5 h-3.5" />Export</Button>
            <Link to="/hrms/teams/new"><Button size="sm" className="h-7 gap-1.5"><Plus className="w-3.5 h-3.5" />New Team</Button></Link>
          </>
        }
      />
      <div className="px-3 py-2 border-b border-border flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search teams…" className="h-7 pl-7 text-xs" />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="h-7 w-44 text-xs"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="p-3">
        <DataTable rows={filtered} columns={columns} rowKey={(t) => t.id} onRowClick={(t) => window.location.assign(`/hrms/teams/${t.id}`)} />
      </div>
    </div>
  );
}

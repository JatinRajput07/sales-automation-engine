import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Download, Upload, Search, LayoutGrid, List, Network } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/StatusPill";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { useHrmsStore, ALL_EMP_STATUSES, empStatusVariant, fullName, type Employee, type EmpStatus } from "@/store/hrmsStore";
import { inr } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

export default function Employees() {
  const employees = useHrmsStore((s) => s.employees);
  const departments = useHrmsStore((s) => s.departments);
  const teams = useHrmsStore((s) => s.teams);
  const { toast } = useToast();

  const [view, setView] = useState<"table" | "cards" | "org">("table");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<EmpStatus | "all">("all");

  const filtered = useMemo(() => {
    let out = employees;
    if (search) {
      const s = search.toLowerCase();
      out = out.filter((e) => fullName(e).toLowerCase().includes(s) || e.empCode.toLowerCase().includes(s) || e.designation.toLowerCase().includes(s) || e.workEmail.toLowerCase().includes(s));
    }
    if (deptFilter !== "all") out = out.filter((e) => e.departments.some((d) => d.departmentId === deptFilter));
    if (teamFilter !== "all") out = out.filter((e) => e.teams.some((t) => t.teamId === teamFilter));
    if (statusFilter !== "all") out = out.filter((e) => e.status === statusFilter);
    return out;
  }, [employees, search, deptFilter, teamFilter, statusFilter]);

  const columns: Column<Employee>[] = [
    { key: "code", label: "Emp ID", render: (e) => <span className="font-mono text-2xs">{e.empCode}</span> },
    { key: "name", label: "Name", render: (e) => (
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-module-hrms/15 text-module-hrms text-2xs font-semibold flex items-center justify-center">{e.avatarInitials}</span>
        <Link to={`/hrms/employees/${e.id}`} className="font-medium hover:text-primary">{fullName(e)}</Link>
      </div>
    ) },
    { key: "des", label: "Designation", render: (e) => e.designation },
    { key: "depts", label: "Departments", render: (e) => (
      <div className="flex flex-wrap gap-1">
        {e.departments.map((d) => {
          const dep = departments.find((x) => x.id === d.departmentId);
          return dep ? <StatusPill key={d.departmentId} variant="info">{dep.name}</StatusPill> : null;
        })}
      </div>
    ) },
    { key: "teams", label: "Teams", render: (e) => (
      <div className="flex flex-wrap gap-1">
        {e.teams.map((t) => {
          const tm = teams.find((x) => x.id === t.teamId);
          return tm ? <StatusPill key={t.teamId} variant="purple">{tm.name}</StatusPill> : null;
        })}
      </div>
    ) },
    { key: "mgr", label: "Manager", render: (e) => fullName(employees.find((x) => x.id === e.reportingManagerId)) },
    { key: "ctc", label: "Salary (₹/yr)", align: "right", render: (e) => <span className="font-mono">{inr(e.annualCtc)}</span> },
    { key: "join", label: "Joined", render: (e) => <span className="text-2xs font-mono text-muted-foreground">{e.joiningDate}</span> },
    { key: "status", label: "Status", render: (e) => <StatusPill variant={empStatusVariant(e.status)}>{e.status}</StatusPill> },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <ModuleHeader
        title="Employees"
        subtitle={`Active: ${employees.filter((e) => e.status === "Active").length} · On Leave: ${employees.filter((e) => e.status === "On Leave").length} · Notice: ${employees.filter((e) => e.status === "Notice Period").length} · Total: ${employees.length}`}
        accentVar="--mod-hrms"
        actions={
          <>
            <Button size="sm" variant="outline" className="h-7 gap-1.5" onClick={() => toast({ title: "Import (mock)" })}><Upload className="w-3.5 h-3.5" />Import</Button>
            <Button size="sm" variant="outline" className="h-7 gap-1.5" onClick={() => toast({ title: "Exported (mock)" })}><Download className="w-3.5 h-3.5" />Export</Button>
            <Link to="/hrms/employees/new"><Button size="sm" className="h-7 gap-1.5"><Plus className="w-3.5 h-3.5" />Add Employee</Button></Link>
          </>
        }
      />
      <div className="px-3 py-2 border-b border-border flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-xs min-w-[180px]">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="h-7 pl-7 text-xs" />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="h-7 w-36 text-xs"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All depts</SelectItem>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={teamFilter} onValueChange={setTeamFilter}>
          <SelectTrigger className="h-7 w-36 text-xs"><SelectValue placeholder="Team" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All teams</SelectItem>{teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="h-7 w-32 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All status</SelectItem>{ALL_EMP_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <div className="flex items-center gap-1 ml-auto">
          <Button size="sm" variant={view === "table" ? "default" : "ghost"} className="h-7 px-2" onClick={() => setView("table")}><List className="w-3.5 h-3.5" /></Button>
          <Button size="sm" variant={view === "cards" ? "default" : "ghost"} className="h-7 px-2" onClick={() => setView("cards")}><LayoutGrid className="w-3.5 h-3.5" /></Button>
          <Button size="sm" variant={view === "org" ? "default" : "ghost"} className="h-7 px-2" onClick={() => setView("org")}><Network className="w-3.5 h-3.5" /></Button>
        </div>
      </div>

      {view === "table" && <div className="p-3"><DataTable rows={filtered} columns={columns} rowKey={(e) => e.id} onRowClick={(e) => window.location.assign(`/hrms/employees/${e.id}`)} /></div>}

      {view === "cards" && (
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((e) => (
            <Link to={`/hrms/employees/${e.id}`} key={e.id} className="border border-border rounded-md bg-surface p-3 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-10 h-10 rounded-full bg-module-hrms/15 text-module-hrms font-semibold text-sm flex items-center justify-center">{e.avatarInitials}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{fullName(e)}</div>
                  <div className="text-2xs text-muted-foreground truncate">{e.designation}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {e.departments.map((d) => {
                  const dep = departments.find((x) => x.id === d.departmentId);
                  return dep ? <StatusPill key={d.departmentId} variant="info">{dep.name}</StatusPill> : null;
                })}
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {e.teams.map((t) => {
                  const tm = teams.find((x) => x.id === t.teamId);
                  return tm ? <StatusPill key={t.teamId} variant="purple">{tm.name}</StatusPill> : null;
                })}
              </div>
              <div className="flex items-center justify-between text-2xs">
                <span className="font-mono">{inr(e.annualCtc)}/yr</span>
                <StatusPill variant={empStatusVariant(e.status)}>{e.status}</StatusPill>
              </div>
            </Link>
          ))}
        </div>
      )}

      {view === "org" && (
        <div className="p-3 space-y-3">
          {departments.map((d) => {
            const head = employees.find((e) => e.id === d.headEmployeeId);
            const deptEmps = filtered.filter((e) => e.departments.some((x) => x.departmentId === d.id));
            const deptTeams = teams.filter((t) => t.departmentId === d.id);
            return (
              <div key={d.id} className="border border-border rounded-md bg-surface p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-sm" style={{ background: d.color }} />
                  <h3 className="text-sm font-semibold">{d.name}</h3>
                  <span className="text-2xs text-muted-foreground">— Head: {fullName(head)}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 ml-5">
                  {deptTeams.map((t) => {
                    const lead = employees.find((e) => e.id === t.leadEmployeeId);
                    const teamMembers = deptEmps.filter((e) => e.teams.some((x) => x.teamId === t.id));
                    return (
                      <div key={t.id} className="border border-border rounded-sm bg-muted/20 p-2">
                        <div className="text-xs font-semibold mb-1">{t.name}</div>
                        <div className="text-2xs text-muted-foreground mb-1">Lead: {fullName(lead)}</div>
                        <div className="space-y-0.5">
                          {teamMembers.map((m) => (
                            <Link key={m.id} to={`/hrms/employees/${m.id}`} className="flex items-center gap-1.5 text-2xs hover:text-primary">
                              <span className="w-5 h-5 rounded-full bg-module-hrms/15 text-module-hrms font-semibold flex items-center justify-center text-3xs">{m.avatarInitials}</span>
                              <span className="truncate">{fullName(m)}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

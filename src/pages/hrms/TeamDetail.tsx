import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/StatusPill";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { useHrmsStore, teamUsed, teamUsedPercent, teamRemaining, pctVariant, fullName, type Employee } from "@/store/hrmsStore";
import { inr } from "@/lib/mockData";

export default function TeamDetail() {
  const { id } = useParams();
  const team = useHrmsStore((s) => s.teams.find((t) => t.id === id));
  const department = useHrmsStore((s) => s.departments.find((d) => d.id === team?.departmentId));
  const allEmps = useHrmsStore((s) => s.employees);
  const leaves = useHrmsStore((s) => s.leaves);

  if (!team) return <div className="p-6 text-sm">Team not found.</div>;

  const members = allEmps.filter((e) => e.teams.some((x) => x.teamId === team.id));
  const lead = allEmps.find((e) => e.id === team.leadEmployeeId);
  const pct = teamUsedPercent(team);
  const v = pctVariant(pct);

  const cols: Column<Employee>[] = [
    { key: "name", label: "Name", render: (e) => <Link to={`/hrms/employees/${e.id}`} className="font-medium hover:text-primary">{fullName(e)}</Link> },
    { key: "des", label: "Designation", render: (e) => e.designation },
    { key: "role", label: "Role", render: (e) => {
      const r = e.teams.find((x) => x.teamId === team.id)?.role || "Member";
      return <StatusPill variant={r === "Lead" ? "info" : "neutral"}>{r}</StatusPill>;
    } },
    { key: "salary", label: "Salary (₹/yr)", align: "right", render: (e) => <span className="font-mono">{inr(e.annualCtc)}</span> },
    { key: "other", label: "Other Teams", render: (e) => e.teams.filter((t) => t.teamId !== team.id).length },
    { key: "join", label: "Joined", render: (e) => <span className="text-2xs font-mono text-muted-foreground">{e.joiningDate}</span> },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <ModuleHeader
        title={team.name}
        subtitle={`${department?.name || "—"} · Lead: ${fullName(lead)} · ${members.length} Members · Budget: ${inr(team.budget)}`}
        accentVar="--mod-hrms"
        actions={<Link to="/hrms/teams"><Button size="sm" variant="ghost" className="h-7 gap-1.5"><ArrowLeft className="w-3.5 h-3.5" />Back</Button></Link>}
      />
      <div className="p-3">
        <Tabs defaultValue="overview">
          <TabsList className="h-8">
            <TabsTrigger value="overview" className="text-xs h-6">Overview</TabsTrigger>
            <TabsTrigger value="members" className="text-xs h-6">Members</TabsTrigger>
            <TabsTrigger value="budget" className="text-xs h-6">Budget</TabsTrigger>
            <TabsTrigger value="leaves" className="text-xs h-6">Leaves</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs h-6">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
            <div className="border border-border rounded-md bg-surface p-3 space-y-1.5 text-xs">
              <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground">Team Details</h3>
              <Row k="Name" v={team.name} />
              <Row k="Code" v={team.code} />
              <Row k="Department" v={department?.name || "—"} />
              <Row k="Status" v={team.status} />
              <Row k="Description" v={team.description || "—"} />
            </div>
            <div className="border border-border rounded-md bg-surface p-3 space-y-1.5 text-xs">
              <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground">Quick Stats</h3>
              <Row k="Members" v={String(members.length)} />
              <Row k="Budget Used" v={`${inr(teamUsed(team))} (${pct}%)`} />
              <Row k="Remaining" v={inr(teamRemaining(team))} />
              <Row k="Leaves this month" v={String(leaves.filter((l) => members.some((m) => m.id === l.employeeId)).length)} />
            </div>
          </TabsContent>

          <TabsContent value="members" className="mt-3">
            <DataTable rows={members} columns={cols} rowKey={(e) => e.id} />
          </TabsContent>

          <TabsContent value="budget" className="mt-3 space-y-3">
            <div className="border border-border rounded-md bg-surface p-3 space-y-1.5 text-xs">
              <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground">Team Budget</h3>
              <Row k="Allocated" v={inr(team.budget)} bold />
              <Row k="Salary" v={inr(team.spentSalary)} />
              <Row k="Other" v={inr(team.spentOther)} />
              <Row k="Total Used" v={`${inr(teamUsed(team))} (${pct}%)`} />
              <Row k="Remaining" v={inr(teamRemaining(team))} bold />
              <div className="h-2 bg-muted rounded-sm overflow-hidden mt-1">
                <div className={`h-full ${v === "success" ? "bg-success" : v === "warning" ? "bg-warning" : "bg-destructive"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
            </div>
            <div className="border border-border rounded-md bg-surface p-3">
              <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Salary Breakdown</h3>
              <table className="w-full text-xs">
                <thead><tr className="text-2xs uppercase text-muted-foreground"><th className="text-left h-7">Name</th><th className="text-left">Designation</th><th className="text-right">Monthly</th><th className="text-right">Annual</th><th className="text-right">% of Budget</th></tr></thead>
                <tbody>
                  {members.map((e) => (
                    <tr key={e.id} className="border-t border-border">
                      <td className="h-7">{fullName(e)}</td>
                      <td>{e.designation}</td>
                      <td className="text-right font-mono">{inr(Math.round(e.annualCtc / 12))}</td>
                      <td className="text-right font-mono">{inr(e.annualCtc)}</td>
                      <td className="text-right font-mono">{team.budget ? Math.round((e.annualCtc / team.budget) * 100) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="leaves" className="mt-3">
            <div className="border border-border rounded-md bg-surface p-3">
              <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Pending in this team</h3>
              <table className="w-full text-xs">
                <thead><tr className="text-2xs uppercase text-muted-foreground"><th className="text-left h-7">Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th></tr></thead>
                <tbody>
                  {leaves.filter((l) => members.some((m) => m.id === l.employeeId)).map((l) => (
                    <tr key={l.id} className="border-t border-border">
                      <td className="h-7">{fullName(allEmps.find((e) => e.id === l.employeeId))}</td>
                      <td>{l.type}</td><td>{l.fromDate}</td><td>{l.toDate}</td><td>{l.days}</td>
                      <td><StatusPill variant={l.status === "Approved" ? "success" : l.status === "Rejected" ? "danger" : "warning"}>{l.status}</StatusPill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-3">
            <div className="border border-border rounded-md bg-surface p-3 text-xs">
              <div className="py-1 flex justify-between"><span>Team created</span><span className="text-2xs text-muted-foreground font-mono">{team.createdAt}</span></div>
              {lead && <div className="py-1 flex justify-between border-t border-border"><span>{fullName(lead)} assigned as Lead</span><span className="text-2xs text-muted-foreground font-mono">{team.createdAt}</span></div>}
              <div className="py-1 flex justify-between border-t border-border"><span>Budget set to {inr(team.budget)}</span><span className="text-2xs text-muted-foreground font-mono">{team.createdAt}</span></div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className={`font-mono ${bold ? "font-semibold" : ""}`}>{v}</span></div>;
}

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/StatusPill";
import { useHrmsStore, deptUsed, deptUsedPercent, deptRemaining, pctVariant, teamUsed, teamUsedPercent, teamRemaining, fullName } from "@/store/hrmsStore";
import { inr } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

export default function Budget() {
  const departments = useHrmsStore((s) => s.departments);
  const teams = useHrmsStore((s) => s.teams);
  const employees = useHrmsStore((s) => s.employees);
  const revisions = useHrmsStore((s) => s.revisions);
  const { toast } = useToast();
  const [expanded, setExpanded] = useState<string[]>([]);

  const totals = useMemo(() => ({
    allocated: departments.reduce((a, d) => a + d.annualBudget, 0),
    salary: departments.reduce((a, d) => a + d.spentSalary, 0),
    other: departments.reduce((a, d) => a + d.spentBenefits + d.spentTraining + d.spentRecruitment + d.spentOther, 0),
    used: departments.reduce((a, d) => a + deptUsed(d), 0),
  }), [departments]);

  const toggle = (id: string) => setExpanded((x) => x.includes(id) ? x.filter((i) => i !== id) : [...x, id]);

  return (
    <div className="flex-1 overflow-auto">
      <ModuleHeader
        title="HR Budget"
        subtitle={`FY 2025-26 · Allocated by Finance: ${inr(totals.allocated)}`}
        accentVar="--mod-hrms"
        actions={
          <>
            <Link to="/hrms/budget/revision-request"><Button size="sm" variant="outline" className="h-7">Request Revision</Button></Link>
            <Button size="sm" variant="outline" className="h-7 gap-1.5" onClick={() => toast({ title: "Exported (mock)" })}><Download className="w-3.5 h-3.5" />Export</Button>
          </>
        }
      />

      <div className="p-3 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Card label="Total Budget" value={inr(totals.allocated)} sub="from Finance" />
          <Card label="Budget Used" value={inr(totals.used)} sub={`${Math.round((totals.used / totals.allocated) * 100)}%`} />
          <Card label="Remaining" value={inr(totals.allocated - totals.used)} sub="available" />
          <Card label="% Used" value={`${Math.round((totals.used / totals.allocated) * 100)}%`} sub="of total" />
        </div>

        {/* Dept table with expandable team rows */}
        <div className="border border-border rounded-md bg-surface overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40">
              <tr className="text-2xs uppercase text-muted-foreground tracking-wider">
                <th className="text-left px-3 h-8 w-6"></th>
                <th className="text-left px-3 h-8">Department</th>
                <th className="text-left px-3 h-8">Head</th>
                <th className="text-right px-3 h-8">Emps</th>
                <th className="text-right px-3 h-8">Allocated</th>
                <th className="text-right px-3 h-8">Salary</th>
                <th className="text-right px-3 h-8">Other</th>
                <th className="text-right px-3 h-8">Used</th>
                <th className="text-right px-3 h-8">Remaining</th>
                <th className="text-right px-3 h-8">% Used</th>
                <th className="text-center px-3 h-8">Status</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => {
                const pct = deptUsedPercent(d);
                const v = pctVariant(pct);
                const isExp = expanded.includes(d.id);
                const dteams = teams.filter((t) => t.departmentId === d.id);
                const head = employees.find((e) => e.id === d.headEmployeeId);
                const empCount = employees.filter((e) => e.departments.some((x) => x.departmentId === d.id)).length;
                return (
                  <>
                    <tr key={d.id} className="border-t border-border hover:bg-surface-hover cursor-pointer" onClick={() => toggle(d.id)}>
                      <td className="px-3 h-9">{isExp ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}</td>
                      <td className="px-3 h-9 font-medium"><Link to={`/hrms/departments/${d.id}`} className="hover:text-primary">{d.name}</Link></td>
                      <td className="px-3 h-9">{fullName(head)}</td>
                      <td className="px-3 h-9 text-right font-mono">{empCount}</td>
                      <td className="px-3 h-9 text-right font-mono">{inr(d.annualBudget)}</td>
                      <td className="px-3 h-9 text-right font-mono">{inr(d.spentSalary)}</td>
                      <td className="px-3 h-9 text-right font-mono">{inr(d.spentBenefits + d.spentTraining + d.spentRecruitment + d.spentOther)}</td>
                      <td className="px-3 h-9 text-right font-mono font-semibold">{inr(deptUsed(d))}</td>
                      <td className="px-3 h-9 text-right font-mono">{inr(deptRemaining(d))}</td>
                      <td className={`px-3 h-9 text-right font-mono font-semibold ${v === "danger" ? "text-destructive" : v === "warning" ? "text-warning" : "text-success"}`}>{pct}%</td>
                      <td className="px-3 h-9 text-center">{v === "success" ? "🟢" : v === "warning" ? "🟡" : "🔴"}</td>
                    </tr>
                    {isExp && dteams.map((t) => {
                      const tp = teamUsedPercent(t);
                      return (
                        <tr key={t.id} className="border-t border-border bg-muted/20">
                          <td></td>
                          <td className="px-3 h-8 pl-8 text-2xs"><Link to={`/hrms/teams/${t.id}`} className="text-primary hover:underline">{t.name}</Link></td>
                          <td className="px-3 h-8 text-2xs">{fullName(employees.find((e) => e.id === t.leadEmployeeId))}</td>
                          <td className="px-3 h-8 text-right font-mono text-2xs">{employees.filter((e) => e.teams.some((x) => x.teamId === t.id)).length}</td>
                          <td className="px-3 h-8 text-right font-mono text-2xs">{inr(t.budget)}</td>
                          <td className="px-3 h-8 text-right font-mono text-2xs">{inr(t.spentSalary)}</td>
                          <td className="px-3 h-8 text-right font-mono text-2xs">{inr(t.spentOther)}</td>
                          <td className="px-3 h-8 text-right font-mono text-2xs">{inr(teamUsed(t))}</td>
                          <td className="px-3 h-8 text-right font-mono text-2xs">{inr(teamRemaining(t))}</td>
                          <td className="px-3 h-8 text-right font-mono text-2xs">{tp}%</td>
                          <td></td>
                        </tr>
                      );
                    })}
                  </>
                );
              })}
              <tr className="border-t-2 border-border bg-muted/30 font-semibold">
                <td></td>
                <td className="px-3 h-9">TOTAL</td>
                <td></td>
                <td className="px-3 h-9 text-right font-mono">{employees.length}</td>
                <td className="px-3 h-9 text-right font-mono">{inr(totals.allocated)}</td>
                <td className="px-3 h-9 text-right font-mono">{inr(totals.salary)}</td>
                <td className="px-3 h-9 text-right font-mono">{inr(totals.other)}</td>
                <td className="px-3 h-9 text-right font-mono">{inr(totals.used)}</td>
                <td className="px-3 h-9 text-right font-mono">{inr(totals.allocated - totals.used)}</td>
                <td className="px-3 h-9 text-right font-mono">{Math.round((totals.used / totals.allocated) * 100)}%</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {departments.map((d) => {
            const pct = deptUsedPercent(d);
            const v = pctVariant(pct);
            const dot = v === "success" ? "✅" : v === "warning" ? "🟡" : "🔴";
            const status = v === "success" ? "HEALTHY" : v === "warning" ? "WARNING" : "CRITICAL";
            return (
              <div key={d.id} className={`border rounded-md p-3 text-xs space-y-1 ${v === "danger" ? "border-destructive/40 bg-destructive/5" : v === "warning" ? "border-warning/40 bg-warning/5" : "border-success/40 bg-success/5"}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{dot} {d.name} — {status}</span>
                </div>
                <div className="font-mono">{pct}% used · {inr(deptRemaining(d))} remaining</div>
                <Link to={`/hrms/budget/revision-request?dept=${d.id}`} className="text-primary text-2xs hover:underline">Request Revision →</Link>
              </div>
            );
          })}
        </div>

        {/* Revision requests */}
        <div className="border border-border rounded-md bg-surface p-3">
          <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Revision Requests</h3>
          <table className="w-full text-xs">
            <thead><tr className="text-2xs uppercase text-muted-foreground"><th className="text-left h-7">Request</th><th>Dept</th><th className="text-right">Amount</th><th>Reason</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {revisions.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="h-7 font-mono">{r.number}</td>
                  <td>{departments.find((d) => d.id === r.departmentId)?.name}</td>
                  <td className="text-right font-mono">+{inr(r.amount)}</td>
                  <td>{r.reason}</td>
                  <td><StatusPill variant={r.status === "Approved" ? "success" : r.status === "Rejected" ? "danger" : "warning"}>{r.status}</StatusPill></td>
                  <td>{r.requestedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-border rounded-md bg-surface p-3">
      <div className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className="text-lg font-mono font-bold mt-1">{value}</div>
      <div className="text-2xs text-muted-foreground">{sub}</div>
    </div>
  );
}

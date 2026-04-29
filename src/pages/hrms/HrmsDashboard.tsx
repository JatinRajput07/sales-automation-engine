import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Users2, Building2, FolderTree, Wallet, TrendingUp, AlertTriangle, X } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/StatusPill";
import { useHrmsStore, deptUsed, deptUsedPercent, deptRemaining, pctVariant, fullName, teamUsedPercent } from "@/store/hrmsStore";
import { inr } from "@/lib/mockData";

export default function HrmsDashboard() {
  const departments = useHrmsStore((s) => s.departments);
  const teams = useHrmsStore((s) => s.teams);
  const employees = useHrmsStore((s) => s.employees);
  const leaves = useHrmsStore((s) => s.leaves);
  const tickets = useHrmsStore((s) => s.tickets);
  const revisions = useHrmsStore((s) => s.revisions);
  const aria = useHrmsStore((s) => s.ariaDigestDismissed);
  const dismissAria = useHrmsStore((s) => s.dismissAriaDigest);

  const totals = useMemo(() => {
    const totalBudget = departments.reduce((a, d) => a + d.annualBudget, 0);
    const totalUsed = departments.reduce((a, d) => a + deptUsed(d), 0);
    const remaining = totalBudget - totalUsed;
    const pendingLeaves = leaves.filter((l) => l.status === "Pending").length;
    const onLeaveToday = employees.filter((e) => e.status === "On Leave").length + pendingLeaves;
    return {
      totalBudget, totalUsed, remaining,
      pctUsed: totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0,
      activeEmps: employees.filter((e) => e.status === "Active").length,
      pendingLeaves, onLeaveToday,
      openTickets: tickets.filter((t) => t.status === "Open" || t.status === "In Progress").length,
      pendingRevisions: revisions.filter((r) => r.status === "Pending").length,
    };
  }, [departments, employees, leaves, tickets, revisions]);

  const recentHires = useMemo(() => [...employees].sort((a, b) => b.joiningDate.localeCompare(a.joiningDate)).slice(0, 5), [employees]);

  return (
    <div className="flex-1 overflow-auto">
      <ModuleHeader
        title="HRMS Dashboard"
        subtitle={`${employees.length} employees · ${departments.length} departments · ${teams.length} teams`}
        accentVar="--mod-hrms"
        actions={
          <Link to="/hrms/employees/new">
            <Button size="sm" className="h-7 gap-1.5"><Plus className="w-3.5 h-3.5" />Add Employee</Button>
          </Link>
        }
      />

      <div className="p-3 space-y-3">
        {/* ARIA Digest */}
        {!aria && (
          <div className="border border-module-hrms/30 bg-module-hrms/5 rounded-md p-3 flex items-start justify-between gap-3">
            <div className="text-xs space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-module-hrms">✦ ARIA</span> — HR Digest
              </div>
              <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                {departments.filter(d => deptUsedPercent(d) >= d.alertAtPercent).slice(0, 2).map((d) => (
                  <li key={d.id}>{d.name} budget {deptUsedPercent(d)}% used ({inr(deptUsed(d))} of {inr(d.annualBudget)})</li>
                ))}
                {totals.pendingLeaves > 0 && <li>{totals.pendingLeaves} leave requests pending approval</li>}
                {employees.filter(e => e.status === "Notice Period").length > 0 && (
                  <li>{employees.filter(e => e.status === "Notice Period").length} employees on notice period</li>
                )}
              </ul>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link to="/hrms/budget"><Button size="sm" variant="outline" className="h-7 text-xs">Review →</Button></Link>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={dismissAria}><X className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          <KpiCard label="Total Employees" value={String(employees.length)} sub={`Active: ${totals.activeEmps}`} accent="hsl(var(--mod-hrms))" />
          <KpiCard label="Departments" value={String(departments.length)} sub="Active" accent="hsl(var(--primary))" />
          <KpiCard label="Teams" value={String(teams.length)} sub="Across all depts" accent="hsl(var(--mod-pms))" />
          <KpiCard label="Total HR Budget" value={inr(totals.totalBudget)} sub="FY 2025-26" accent="hsl(var(--mod-finance))" />
          <KpiCard label="Budget Used" value={inr(totals.totalUsed)} sub={`${totals.pctUsed}%`} accent="hsl(var(--warning))" />
          <KpiCard label="Budget Remaining" value={inr(totals.remaining)} sub={`${100 - totals.pctUsed}%`} accent="hsl(var(--success))" />
          <KpiCard label="On Leave Today" value={String(totals.onLeaveToday)} sub="Approved" accent="hsl(var(--info))" />
          <KpiCard label="Open Tickets" value={String(totals.openTickets)} sub="Help desk" accent="hsl(var(--destructive))" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-3">
          {/* Dept Budget Utilization */}
          <div className="lg:col-span-4 border border-border rounded-md bg-surface p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Department Budget Utilization</h3>
              <Link to="/hrms/budget" className="text-2xs text-primary hover:underline">View all →</Link>
            </div>
            <div className="space-y-2">
              {departments.map((d) => {
                const pct = deptUsedPercent(d);
                const v = pctVariant(pct);
                const barColor = v === "success" ? "bg-success" : v === "warning" ? "bg-warning" : "bg-destructive";
                return (
                  <div key={d.id} className="text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium truncate">{d.name}</span>
                      <span className="font-mono text-muted-foreground shrink-0 ml-2">{inr(deptUsed(d))} / {inr(d.annualBudget)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-sm overflow-hidden">
                        <div className={`h-full ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <span className={`text-2xs font-mono font-semibold w-10 text-right ${v === "danger" ? "text-destructive" : v === "warning" ? "text-warning" : "text-success"}`}>{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Headcount donut (CSS) */}
          <div className="lg:col-span-3 border border-border rounded-md bg-surface p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Headcount by Department</h3>
            <div className="space-y-1.5">
              {departments.map((d) => {
                const count = employees.filter((e) => e.departments.some((x) => x.departmentId === d.id)).length;
                const pct = employees.length > 0 ? Math.round((count / employees.length) * 100) : 0;
                return (
                  <div key={d.id} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: d.color }} />
                    <span className="flex-1 truncate">{d.name}</span>
                    <span className="font-mono text-muted-foreground">{count}</span>
                    <span className="text-2xs text-muted-foreground w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Budget Overview */}
          <div className="lg:col-span-3 border border-border rounded-md bg-surface p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Budget Overview</h3>
            <div className="space-y-1.5 text-xs">
              <Row label="Total Budget" value={inr(totals.totalBudget)} bold />
              <Row label="Salary Cost" value={inr(departments.reduce((a, d) => a + d.spentSalary, 0))} sub="80%" />
              <Row label="Benefits" value={inr(departments.reduce((a, d) => a + d.spentBenefits, 0))} sub="10%" />
              <Row label="Training" value={inr(departments.reduce((a, d) => a + d.spentTraining, 0))} sub="5%" />
              <Row label="Other" value={inr(departments.reduce((a, d) => a + d.spentOther + d.spentRecruitment, 0))} sub="5%" />
              <div className="border-t border-border my-1" />
              <Row label="Remaining" value={inr(totals.remaining)} bold accent />
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Budget Alerts */}
          <div className="border border-border rounded-md bg-surface p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Budget Alerts
            </h3>
            <div className="space-y-2">
              {departments.map((d) => {
                const pct = deptUsedPercent(d);
                const v = pctVariant(pct);
                const dot = v === "success" ? "🟢" : v === "warning" ? "🟡" : "🔴";
                const label = v === "success" ? "Healthy" : v === "warning" ? "Approaching" : "Critical";
                return (
                  <Link key={d.id} to={`/hrms/departments/${d.id}`} className="block text-xs border border-border rounded-sm px-2 py-1.5 hover:bg-surface-hover">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{dot} {d.name}</span>
                      <StatusPill variant={v === "success" ? "success" : v === "warning" ? "warning" : "danger"}>{label}</StatusPill>
                    </div>
                    <div className="text-2xs text-muted-foreground font-mono mt-0.5">{pct}% used · {inr(deptRemaining(d))} remaining</div>
                  </Link>
                );
              }).slice(0, 5)}
            </div>
          </div>

          {/* Recent hires */}
          <div className="border border-border rounded-md bg-surface p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recent Hires</h3>
            <div className="space-y-2">
              {recentHires.map((e) => (
                <Link key={e.id} to={`/hrms/employees/${e.id}`} className="flex items-center gap-2 text-xs hover:bg-surface-hover rounded-sm px-1 py-1">
                  <span className="w-7 h-7 rounded-full bg-module-hrms/15 text-module-hrms font-semibold text-2xs flex items-center justify-center shrink-0">{e.avatarInitials}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{fullName(e)}</div>
                    <div className="text-2xs text-muted-foreground truncate">{e.designation}</div>
                  </div>
                  <span className="text-2xs text-muted-foreground font-mono shrink-0">{e.joiningDate}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Pending actions */}
          <div className="border border-border rounded-md bg-surface p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Pending Actions</h3>
            <div className="space-y-2 text-xs">
              <PendingRow icon={<Users2 className="w-3.5 h-3.5" />} label="Leave approvals" count={totals.pendingLeaves} to="/hrms/leaves" />
              <PendingRow icon={<FolderTree className="w-3.5 h-3.5" />} label="Help desk tickets" count={totals.openTickets} to="/hrms/helpdesk" />
              <PendingRow icon={<Wallet className="w-3.5 h-3.5" />} label="Budget revision requests" count={totals.pendingRevisions} to="/hrms/budget" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, sub, bold, accent }: { label: string; value: string; sub?: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-muted-foreground ${bold ? "font-semibold text-foreground" : ""}`}>{label}</span>
      <span className={`font-mono ${bold ? "font-semibold" : ""} ${accent ? "text-success" : ""}`}>{value}{sub && <span className="text-2xs text-muted-foreground ml-1">({sub})</span>}</span>
    </div>
  );
}

function PendingRow({ icon, label, count, to }: { icon: React.ReactNode; label: string; count: number; to: string }) {
  return (
    <Link to={to} className="flex items-center justify-between border border-border rounded-sm px-2 py-1.5 hover:bg-surface-hover">
      <span className="flex items-center gap-2"><span className="text-muted-foreground">{icon}</span>{label}</span>
      <span className="flex items-center gap-2">
        <span className="px-1.5 h-[18px] rounded-sm bg-module-hrms/15 text-module-hrms text-2xs font-semibold inline-flex items-center">{count}</span>
        <Button size="sm" variant="ghost" className="h-6 text-2xs">Review</Button>
      </span>
    </Link>
  );
}

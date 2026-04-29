import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2 } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/StatusPill";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { useHrmsStore, deptUsed, deptUsedPercent, deptRemaining, pctVariant, fullName, teamUsed, teamUsedPercent, teamRemaining, type Team, type Employee } from "@/store/hrmsStore";
import { inr } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

export default function DepartmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const dept = useHrmsStore((s) => s.departments.find((d) => d.id === id));
  const teams = useHrmsStore((s) => s.teams.filter((t) => t.departmentId === id));
  const employees = useHrmsStore((s) => s.employees.filter((e) => e.departments.some((x) => x.departmentId === id)));
  const allEmps = useHrmsStore((s) => s.employees);

  if (!dept) {
    return <div className="p-6 text-sm">Department not found. <Link to="/hrms/departments" className="text-primary underline">Back</Link></div>;
  }

  const head = allEmps.find((e) => e.id === dept.headEmployeeId);
  const pct = deptUsedPercent(dept);
  const v = pctVariant(pct);
  const used = deptUsed(dept);

  const teamColumns: Column<Team>[] = [
    { key: "name", label: "Team", render: (t) => <Link to={`/hrms/teams/${t.id}`} className="text-primary hover:underline">{t.name}</Link> },
    { key: "lead", label: "Lead", render: (t) => fullName(allEmps.find((e) => e.id === t.leadEmployeeId)) },
    { key: "mem", label: "Members", align: "right", render: (t) => allEmps.filter((e) => e.teams.some((x) => x.teamId === t.id)).length },
    { key: "alloc", label: "Allocated", align: "right", render: (t) => <span className="font-mono">{inr(t.budget)}</span> },
    { key: "used", label: "Used", align: "right", render: (t) => <span className="font-mono">{inr(teamUsed(t))}</span> },
    { key: "rem", label: "Remaining", align: "right", render: (t) => <span className="font-mono">{inr(teamRemaining(t))}</span> },
    { key: "pct", label: "%", align: "right", render: (t) => {
      const p = teamUsedPercent(t); const tv = pctVariant(p);
      return <span className={`font-mono font-semibold ${tv === "danger" ? "text-destructive" : tv === "warning" ? "text-warning" : "text-success"}`}>{p}%</span>;
    } },
  ];

  const empColumns: Column<Employee>[] = [
    { key: "name", label: "Name", render: (e) => <Link to={`/hrms/employees/${e.id}`} className="font-medium hover:text-primary">{fullName(e)}</Link> },
    { key: "des", label: "Designation", render: (e) => e.designation },
    { key: "role", label: "Role", render: (e) => {
      const r = e.departments.find((x) => x.departmentId === dept.id)?.role || "Member";
      return <StatusPill variant={r === "Head" ? "info" : "neutral"}>{r}</StatusPill>;
    } },
    { key: "salary", label: "Salary (₹/yr)", align: "right", render: (e) => <span className="font-mono">{inr(e.annualCtc)}</span> },
    { key: "join", label: "Joined", render: (e) => <span className="text-2xs font-mono text-muted-foreground">{e.joiningDate}</span> },
    { key: "status", label: "Status", render: (e) => <StatusPill variant={e.status === "Active" ? "success" : "warning"}>{e.status}</StatusPill> },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <ModuleHeader
        title={dept.name}
        subtitle={`${dept.code} · Head: ${fullName(head)} · ${employees.length} Employees · ${teams.length} Teams · Budget: ${inr(dept.annualBudget)}`}
        accentVar="--mod-hrms"
        actions={
          <>
            <Link to="/hrms/departments"><Button size="sm" variant="ghost" className="h-7 gap-1.5"><ArrowLeft className="w-3.5 h-3.5" />Back</Button></Link>
            <Button size="sm" variant="outline" className="h-7 gap-1.5" onClick={() => toast({ title: "Edit (mock)" })}><Edit2 className="w-3.5 h-3.5" />Edit</Button>
          </>
        }
      />

      <div className="p-3">
        <Tabs defaultValue="overview">
          <TabsList className="h-8">
            <TabsTrigger value="overview" className="text-xs h-6">Overview</TabsTrigger>
            <TabsTrigger value="teams" className="text-xs h-6">Teams</TabsTrigger>
            <TabsTrigger value="employees" className="text-xs h-6">Employees</TabsTrigger>
            <TabsTrigger value="budget" className="text-xs h-6">Budget</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs h-6">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
            <div className="border border-border rounded-md bg-surface p-3 space-y-2 text-xs">
              <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground">Department Details</h3>
              <Row k="Name" v={dept.name} />
              <Row k="Code" v={dept.code} />
              <Row k="Status" v={dept.status} />
              <Row k="Description" v={dept.description || "—"} />
              <Row k="Period" v={dept.budgetPeriod === "Apr-Mar" ? "April – March" : "January – December"} />
              <Row k="Work Location" v={dept.workLocation} />
              <Row k="Work Hours/Day" v={String(dept.workHoursPerDay)} />
              <div className="border-t border-border pt-2">
                <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Head</h3>
                {head ? (
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-full bg-module-hrms/15 text-module-hrms font-semibold text-xs flex items-center justify-center">{head.avatarInitials}</span>
                    <div className="flex-1">
                      <div className="font-medium">{fullName(head)}</div>
                      <div className="text-2xs text-muted-foreground">{head.designation} · {head.workEmail}</div>
                    </div>
                    <Link to={`/hrms/employees/${head.id}`}><Button size="sm" variant="outline" className="h-6 text-2xs">View</Button></Link>
                  </div>
                ) : <span className="text-muted-foreground">No head assigned</span>}
              </div>
            </div>

            <div className="space-y-3">
              <div className="border border-border rounded-md bg-surface p-3 space-y-1.5 text-xs">
                <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground">Budget — FY 2025-26</h3>
                <Row k="Annual Budget" v={inr(dept.annualBudget)} bold />
                <div className="border-t border-border my-1" />
                <Row k="Salary Spend" v={inr(dept.spentSalary)} />
                <Row k="Benefits" v={inr(dept.spentBenefits)} />
                <Row k="Training" v={inr(dept.spentTraining)} />
                <Row k="Recruitment" v={inr(dept.spentRecruitment)} />
                <Row k="Other" v={inr(dept.spentOther)} />
                <div className="border-t border-border my-1" />
                <Row k="Total Used" v={`${inr(used)} (${pct}%)`} />
                <Row k="Remaining" v={inr(deptRemaining(dept))} bold />
                <div className="h-2 bg-muted rounded-sm overflow-hidden mt-1">
                  <div className={`h-full ${v === "success" ? "bg-success" : v === "warning" ? "bg-warning" : "bg-destructive"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="text-2xs text-muted-foreground">⚠ Alert threshold at {dept.alertAtPercent}%</div>
              </div>

              <div className="border border-border rounded-md bg-surface p-3 space-y-1 text-xs">
                <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground">Headcount</h3>
                <Row k="Total" v={`${employees.length} employees`} />
                <Row k="Active" v={String(employees.filter((e) => e.status === "Active").length)} />
                <Row k="On Leave" v={String(employees.filter((e) => e.status === "On Leave").length)} />
                <Row k="Notice Period" v={String(employees.filter((e) => e.status === "Notice Period").length)} />
                <div className="border-t border-border my-1" />
                <Row k="Avg Salary" v={inr(employees.length ? Math.round(employees.reduce((a, e) => a + e.annualCtc, 0) / employees.length) : 0)} />
                <Row k="Total Salary Spend" v={inr(employees.reduce((a, e) => a + e.annualCtc, 0))} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="teams" className="mt-3 space-y-3">
            <div className="flex justify-end">
              <Link to={`/hrms/teams/new?dept=${dept.id}`}><Button size="sm" className="h-7">+ Create Team in this Dept</Button></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {teams.map((t) => {
                const p = teamUsedPercent(t);
                const tv = pctVariant(p);
                const bar = tv === "success" ? "bg-success" : tv === "warning" ? "bg-warning" : "bg-destructive";
                const memberCount = allEmps.filter((e) => e.teams.some((x) => x.teamId === t.id)).length;
                return (
                  <div key={t.id} className="border border-border rounded-md bg-surface p-3 space-y-2 text-xs">
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-2xs text-muted-foreground">Lead: {fullName(allEmps.find((e) => e.id === t.leadEmployeeId)) || "—"}</div>
                    <div className="text-2xs">Members: {memberCount} · Budget: {inr(t.budget)}</div>
                    <div className="text-2xs">Used: {inr(teamUsed(t))} ({p}%)</div>
                    <div className="h-1.5 bg-muted rounded-sm overflow-hidden"><div className={`h-full ${bar}`} style={{ width: `${Math.min(p, 100)}%` }} /></div>
                    <div className="flex gap-1.5">
                      <Link to={`/hrms/teams/${t.id}`} className="flex-1"><Button size="sm" variant="outline" className="h-6 text-2xs w-full">View</Button></Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="employees" className="mt-3">
            <DataTable rows={employees} columns={empColumns} rowKey={(e) => e.id} />
          </TabsContent>

          <TabsContent value="budget" className="mt-3 space-y-3">
            <div className="border border-border rounded-md bg-surface p-3">
              <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Category Breakdown</h3>
              <table className="w-full text-xs">
                <thead><tr className="text-2xs uppercase text-muted-foreground"><th className="text-left h-7">Category</th><th className="text-right">Budgeted</th><th className="text-right">Spent</th><th className="text-right">Remaining</th><th className="text-right">%</th></tr></thead>
                <tbody>
                  {[
                    { l: "Salaries", b: dept.budgetSalary, s: dept.spentSalary },
                    { l: "Benefits", b: dept.budgetBenefits, s: dept.spentBenefits },
                    { l: "Training", b: dept.budgetTraining, s: dept.spentTraining },
                    { l: "Recruitment", b: dept.budgetRecruitment, s: dept.spentRecruitment },
                    { l: "Other", b: dept.budgetOther, s: dept.spentOther },
                  ].map((r) => {
                    const pp = r.b ? Math.round((r.s / r.b) * 100) : 0;
                    return <tr key={r.l} className="border-t border-border"><td className="h-7">{r.l}</td><td className="text-right font-mono">{inr(r.b)}</td><td className="text-right font-mono">{inr(r.s)}</td><td className="text-right font-mono">{inr(r.b - r.s)}</td><td className="text-right font-mono">{pp}%</td></tr>;
                  })}
                </tbody>
              </table>
            </div>
            <div className="border border-border rounded-md bg-surface p-3">
              <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Team-wise Budget Split</h3>
              <DataTable rows={teams} columns={teamColumns} rowKey={(t) => t.id} />
            </div>
            <Link to={`/hrms/budget/revision-request?dept=${dept.id}`}><Button size="sm" className="h-7">Request Budget Revision</Button></Link>
          </TabsContent>

          <TabsContent value="activity" className="mt-3">
            <div className="border border-border rounded-md bg-surface p-3 text-xs space-y-1">
              <ActivityRow when={dept.createdAt} text={`Department "${dept.name}" created`} />
              {head && <ActivityRow when={dept.createdAt} text={`${fullName(head)} assigned as Head`} />}
              <ActivityRow when={dept.createdAt} text={`Annual budget of ${inr(dept.annualBudget)} allocated`} />
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
function ActivityRow({ when, text }: { when: string; text: string }) {
  return <div className="flex justify-between border-b border-border last:border-0 py-1"><span>{text}</span><span className="text-2xs text-muted-foreground font-mono">{when}</span></div>;
}

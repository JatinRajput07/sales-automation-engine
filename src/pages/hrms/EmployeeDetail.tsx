import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Edit2 } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/StatusPill";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useHrmsStore, empStatusVariant, fullName } from "@/store/hrmsStore";
import { inr } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

export default function EmployeeDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const emp = useHrmsStore((s) => s.employees.find((e) => e.id === id));
  const departments = useHrmsStore((s) => s.departments);
  const teams = useHrmsStore((s) => s.teams);
  const allEmps = useHrmsStore((s) => s.employees);
  const leaves = useHrmsStore((s) => s.leaves.filter((l) => l.employeeId === id));
  const attendance = useHrmsStore((s) => s.attendance.filter((a) => a.employeeId === id));

  if (!emp) return <div className="p-6 text-sm">Employee not found.</div>;

  const manager = allEmps.find((x) => x.id === emp.reportingManagerId);
  const empDepts = emp.departments.map((d) => ({ ...d, dept: departments.find((x) => x.id === d.departmentId)! })).filter((x) => x.dept);
  const empTeams = emp.teams.map((t) => ({ ...t, team: teams.find((x) => x.id === t.teamId)! })).filter((x) => x.team);

  return (
    <div className="flex-1 overflow-auto">
      <ModuleHeader
        title={fullName(emp)}
        subtitle={`${emp.designation} · ${emp.empCode} · Joined ${emp.joiningDate}`}
        accentVar="--mod-hrms"
        actions={
          <>
            <Link to="/hrms/employees"><Button size="sm" variant="ghost" className="h-7 gap-1.5"><ArrowLeft className="w-3.5 h-3.5" />Back</Button></Link>
            <Button size="sm" variant="outline" className="h-7 gap-1.5" onClick={() => toast({ title: "Edit (mock)" })}><Edit2 className="w-3.5 h-3.5" />Edit</Button>
          </>
        }
      />

      <div className="p-3 space-y-3">
        {/* Hero card */}
        <div className="border border-border rounded-md bg-surface p-3 flex items-start gap-3">
          <span className="w-16 h-16 rounded-full bg-module-hrms/15 text-module-hrms font-semibold text-xl flex items-center justify-center shrink-0">{emp.avatarInitials}</span>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold">{fullName(emp)}</h2>
              <StatusPill variant={empStatusVariant(emp.status)}>{emp.status}</StatusPill>
            </div>
            <div className="text-xs text-muted-foreground">{emp.designation} · {emp.empCode}</div>
            <div className="flex items-center gap-3 text-2xs text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{emp.workEmail}</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{emp.personalPhone}</span>
            </div>
            <div className="text-2xs text-muted-foreground">Reporting to: {fullName(manager)}</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {empDepts.map((d) => <StatusPill key={d.departmentId} variant="info">{d.dept.name} · {d.role}</StatusPill>)}
              {empTeams.map((t) => <StatusPill key={t.teamId} variant="purple">{t.team.name} · {t.role}</StatusPill>)}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            <Link to="/hrms/leaves/apply"><Button size="sm" variant="outline" className="h-7 text-2xs">Apply Leave</Button></Link>
            <Button size="sm" variant="outline" className="h-7 text-2xs" onClick={() => toast({ title: "Email sent (mock)" })}>Send Email</Button>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="h-8 flex-wrap">
            <TabsTrigger value="overview" className="text-xs h-6">Overview</TabsTrigger>
            <TabsTrigger value="employment" className="text-xs h-6">Employment</TabsTrigger>
            <TabsTrigger value="salary" className="text-xs h-6">Salary & Budget</TabsTrigger>
            <TabsTrigger value="leaves" className="text-xs h-6">Leaves</TabsTrigger>
            <TabsTrigger value="attendance" className="text-xs h-6">Attendance</TabsTrigger>
            <TabsTrigger value="documents" className="text-xs h-6">Documents</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs h-6">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
            <div className="border border-border rounded-md bg-surface p-3 space-y-1.5 text-xs">
              <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground">Personal</h3>
              <Row k="DOB" v={emp.dob || "—"} />
              <Row k="Gender" v={emp.gender || "—"} />
              <Row k="Personal Email" v={emp.personalEmail} />
              <Row k="Phone" v={emp.personalPhone} />
              <Row k="Address" v={emp.address || "—"} />
              <Row k="City" v={emp.city || "—"} />
              <div className="border-t border-border pt-2 mt-2">
                <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Skills</h3>
                <div className="flex flex-wrap gap-1">{emp.skills.length ? emp.skills.map((s) => <span key={s} className="px-1.5 h-5 inline-flex items-center text-2xs rounded-sm bg-muted">{s}</span>) : <span className="text-muted-foreground">—</span>}</div>
              </div>
              <div className="border-t border-border pt-2 mt-2">
                <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Emergency Contact</h3>
                <div className="text-xs">{emp.emergencyName || "—"} · {emp.emergencyPhone || "—"}</div>
              </div>
            </div>

            <div className="border border-border rounded-md bg-surface p-3 space-y-2 text-xs">
              <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground">Departments</h3>
              {empDepts.map((d) => (
                <div key={d.departmentId} className="border border-border rounded-sm p-2 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{d.dept.name}</div>
                    <div className="text-2xs text-muted-foreground">Role: {d.role} · Head: {fullName(allEmps.find((e) => e.id === d.dept.headEmployeeId))}</div>
                  </div>
                  <Link to={`/hrms/departments/${d.departmentId}`}><Button size="sm" variant="outline" className="h-6 text-2xs">View</Button></Link>
                </div>
              ))}
              <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground pt-2 border-t border-border">Teams</h3>
              {empTeams.map((t) => (
                <div key={t.teamId} className="border border-border rounded-sm p-2 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t.team.name}</div>
                    <div className="text-2xs text-muted-foreground">Role: {t.role} · Lead: {fullName(allEmps.find((e) => e.id === t.team.leadEmployeeId))}</div>
                  </div>
                  <Link to={`/hrms/teams/${t.teamId}`}><Button size="sm" variant="outline" className="h-6 text-2xs">View</Button></Link>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="employment" className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
            <div className="border border-border rounded-md bg-surface p-3 space-y-1.5 text-xs">
              <Row k="Designation" v={emp.designation} />
              <Row k="Type" v={emp.employmentType} />
              <Row k="Location" v={emp.workLocation} />
              <Row k="Joining Date" v={emp.joiningDate} />
              <Row k="Probation" v={emp.probation} />
              <Row k="Notice Period" v={emp.noticePeriod} />
              <Row k="Experience" v={`${emp.experienceLevel} · ${emp.experienceYears} yrs`} />
            </div>
            <div className="border border-border rounded-md bg-surface p-3 text-xs">
              <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Employment History</h3>
              <table className="w-full">
                <thead><tr className="text-2xs uppercase text-muted-foreground"><th className="text-left h-6">Date</th><th className="text-left">Change</th><th className="text-left">Changed By</th></tr></thead>
                <tbody>
                  <tr className="border-t border-border"><td className="h-6">{emp.joiningDate}</td><td>Joined as {emp.designation}</td><td>HR Admin</td></tr>
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="salary" className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
            <div className="border border-border rounded-md bg-surface p-3 space-y-1.5 text-xs">
              <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground">Salary Details</h3>
              <Row k="Annual CTC" v={inr(emp.annualCtc)} bold />
              <Row k="Monthly" v={inr(Math.round(emp.annualCtc / 12))} />
              <Row k="Currency" v={emp.currency} />
              <Row k="Effective" v={emp.salaryEffectiveDate} />
              <div className="border-t border-border pt-2">
                <Row k="Bank" v={emp.bankName || "—"} />
                <Row k="Account" v={emp.bankAccount ? `***${emp.bankAccount.slice(-4)}` : "—"} />
                <Row k="IFSC" v={emp.bankIfsc || "—"} />
              </div>
            </div>
            <div className="border border-border rounded-md bg-surface p-3 space-y-1.5 text-xs">
              <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground">Budget Allocation</h3>
              {empDepts.map((d) => {
                const pct = d.dept.budgetSalary > 0 ? Math.round((emp.annualCtc / d.dept.budgetSalary) * 100) : 0;
                return <div key={d.departmentId}>{d.dept.name} salary contribution: <span className="font-mono">{inr(emp.annualCtc)}/year ({pct}% of dept salary budget)</span></div>;
              })}
              {empTeams.map((t) => {
                const pct = t.team.budget > 0 ? Math.round((emp.annualCtc / t.team.budget) * 100) : 0;
                return <div key={t.teamId}>{t.team.name} contribution: <span className="font-mono">{inr(emp.annualCtc)}/year ({pct}% of team budget)</span></div>;
              })}
            </div>
          </TabsContent>

          <TabsContent value="leaves" className="mt-3 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {(["CL","SL","EL"] as const).map((t) => (
                <div key={t} className="border border-border rounded-md bg-surface p-3 text-xs">
                  <div className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground">{t === "CL" ? "Casual" : t === "SL" ? "Sick" : "Earned"} Leave</div>
                  <div className="text-lg font-mono font-bold mt-1">{emp.leaveBalances[t]} <span className="text-2xs text-muted-foreground">remaining</span></div>
                </div>
              ))}
            </div>
            <div className="border border-border rounded-md bg-surface p-3">
              <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Leave History</h3>
              <table className="w-full text-xs">
                <thead><tr className="text-2xs uppercase text-muted-foreground"><th className="text-left h-6">Type</th><th className="text-left">From</th><th className="text-left">To</th><th>Days</th><th>Status</th></tr></thead>
                <tbody>
                  {leaves.map((l) => (
                    <tr key={l.id} className="border-t border-border">
                      <td className="h-6">{l.type}</td><td>{l.fromDate}</td><td>{l.toDate}</td><td className="text-center">{l.days}</td>
                      <td><StatusPill variant={l.status === "Approved" ? "success" : l.status === "Rejected" ? "danger" : "warning"}>{l.status}</StatusPill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="mt-3">
            <div className="border border-border rounded-md bg-surface p-3 text-xs">
              <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Recent Attendance</h3>
              <table className="w-full">
                <thead><tr className="text-2xs uppercase text-muted-foreground"><th className="text-left h-6">Date</th><th>Status</th><th>Check-in</th><th>Check-out</th><th>Mode</th></tr></thead>
                <tbody>
                  {attendance.map((a) => (
                    <tr key={a.id} className="border-t border-border">
                      <td className="h-6">{a.date}</td>
                      <td><StatusPill variant={a.status === "Present" ? "success" : a.status === "Absent" ? "danger" : "info"}>{a.status}</StatusPill></td>
                      <td>{a.checkIn || "—"}</td><td>{a.checkOut || "—"}</td><td>{a.mode || "—"}</td>
                    </tr>
                  ))}
                  {attendance.length === 0 && <tr><td colSpan={5} className="text-center py-3 text-muted-foreground">No attendance records.</td></tr>}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-3">
            <div className="border border-border rounded-md bg-surface p-3 text-xs">
              <h3 className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Documents</h3>
              <table className="w-full">
                <thead><tr className="text-2xs uppercase text-muted-foreground"><th className="text-left h-6">Document</th><th>Status</th><th>Uploaded</th></tr></thead>
                <tbody>
                  {["Offer Letter","Aadhaar","PAN Card","Joining Form"].map((d) => (
                    <tr key={d} className="border-t border-border"><td className="h-6">{d}</td><td><StatusPill variant="success">✓</StatusPill></td><td>{emp.joiningDate}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-3">
            <div className="border border-border rounded-md bg-surface p-3 text-xs">
              <div className="py-1 flex justify-between"><span>Profile created</span><span className="text-2xs text-muted-foreground font-mono">{emp.createdAt}</span></div>
              <div className="py-1 flex justify-between border-t border-border"><span>Joined as {emp.designation}</span><span className="text-2xs text-muted-foreground font-mono">{emp.joiningDate}</span></div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return <div className="flex justify-between gap-2"><span className="text-muted-foreground shrink-0">{k}</span><span className={`font-mono text-right ${bold ? "font-semibold" : ""}`}>{v}</span></div>;
}

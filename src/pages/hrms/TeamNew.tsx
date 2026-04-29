import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useHrmsStore, deptRemaining, fullName } from "@/store/hrmsStore";
import { useToast } from "@/hooks/use-toast";
import { inr } from "@/lib/mockData";

export default function TeamNew() {
  const nav = useNavigate();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const departments = useHrmsStore((s) => s.departments);
  const teams = useHrmsStore((s) => s.teams);
  const employees = useHrmsStore((s) => s.employees);
  const addTeam = useHrmsStore((s) => s.addTeam);
  const addEmpToTeam = useHrmsStore((s) => s.addEmployeeToTeam);

  const nextCode = `TEAM-${String(teams.length + 1).padStart(3, "0")}`;

  const [name, setName] = useState("");
  const [code, setCode] = useState(nextCode);
  const [departmentId, setDepartmentId] = useState<string>(params.get("dept") || "");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [leadEmployeeId, setLeadEmployeeId] = useState("");
  const [leadCanApproveLeaves, setLcal] = useState(true);
  const [leadCanApproveAttendance, setLcaa] = useState(true);
  const [budget, setBudget] = useState<number>(0);
  const [budgetSalary, setBs] = useState<number>(0);
  const [budgetOther, setBo] = useState<number>(0);
  const [alertAtPercent, setAlert] = useState<number>(80);
  const [members, setMembers] = useState<string[]>([]);

  const dept = departments.find((d) => d.id === departmentId);
  const deptTeamsBudget = teams.filter((t) => t.departmentId === departmentId).reduce((a, t) => a + t.budget, 0);
  const deptAvailable = dept ? deptRemaining(dept) - deptTeamsBudget : 0;

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!name || name.length < 2) e.push("Name required");
    if (!departmentId) e.push("Department required");
    if (budget > deptAvailable) e.push("Budget exceeds department availability");
    return e;
  }, [name, departmentId, budget, deptAvailable]);

  function toggleMember(id: string) {
    setMembers((m) => m.includes(id) ? m.filter((x) => x !== id) : [...m, id]);
  }

  function submit() {
    if (errors.length) { toast({ title: errors[0], variant: "destructive" }); return; }
    const id = addTeam({
      name, code, departmentId, description, status,
      leadEmployeeId: leadEmployeeId || undefined,
      leadCanApproveLeaves, leadCanApproveAttendance,
      budget, budgetSalary, budgetOther,
      spentSalary: 0, spentOther: 0, alertAtPercent,
    });
    members.forEach((mid) => addEmpToTeam(mid, id, mid === leadEmployeeId ? "Lead" : "Member"));
    if (leadEmployeeId && !members.includes(leadEmployeeId)) addEmpToTeam(leadEmployeeId, id, "Lead");
    toast({ title: `✅ ${name} created` });
    nav(`/hrms/teams/${id}`);
  }

  return (
    <div className="flex-1 overflow-auto">
      <ModuleHeader
        title="Create Team"
        accentVar="--mod-hrms"
        actions={
          <>
            <Link to="/hrms/teams"><Button size="sm" variant="ghost" className="h-7 gap-1.5"><ArrowLeft className="w-3.5 h-3.5" />Back</Button></Link>
            <Button size="sm" className="h-7" onClick={submit}>Create</Button>
          </>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3">
        <div className="lg:col-span-8 space-y-3">
          <Section title="Team Info">
            <Field label="Team Name *"><Input value={name} onChange={(e) => setName(e.target.value)} className="h-8" /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Code *"><Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="h-8 font-mono" /></Field>
              <Field label="Department *">
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Description"><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
            <Field label="Status">
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </Field>
          </Section>

          <Section title="Leadership">
            <Field label="Team Lead">
              <Select value={leadEmployeeId || "none"} onValueChange={(v) => setLeadEmployeeId(v === "none" ? "" : v)}>
                <SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {employees.map((e) => <SelectItem key={e.id} value={e.id}>{fullName(e)} — {e.designation}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <div className="flex items-center justify-between text-xs"><span>Lead can approve leaves</span><Switch checked={leadCanApproveLeaves} onCheckedChange={setLcal} /></div>
            <div className="flex items-center justify-between text-xs"><span>Lead can approve attendance</span><Switch checked={leadCanApproveAttendance} onCheckedChange={setLcaa} /></div>
          </Section>

          <Section title="Budget">
            <Field label="Team Budget (₹)"><Input type="number" value={budget || ""} onChange={(e) => setBudget(Number(e.target.value) || 0)} className="h-8 font-mono" /></Field>
            {dept && (
              <div className="text-2xs font-mono text-muted-foreground bg-muted/40 p-2 rounded-sm">
                Dept budget remaining: {inr(deptRemaining(dept))} · Already allocated to other teams: {inr(deptTeamsBudget)} · Available for this team: <span className={budget > deptAvailable ? "text-destructive" : "text-success"}>{inr(deptAvailable)}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Field label="Salary Budget"><Input type="number" value={budgetSalary || ""} onChange={(e) => setBs(Number(e.target.value) || 0)} className="h-8 font-mono" /></Field>
              <Field label="Other Budget"><Input type="number" value={budgetOther || ""} onChange={(e) => setBo(Number(e.target.value) || 0)} className="h-8 font-mono" /></Field>
            </div>
            <Field label={`Alert at ${alertAtPercent}%`}>
              <input type="range" min={70} max={95} value={alertAtPercent} onChange={(e) => setAlert(Number(e.target.value))} className="w-full" />
            </Field>
          </Section>

          <Section title="Members">
            <div className="max-h-64 overflow-auto border border-border rounded-sm">
              {employees.map((e) => {
                const otherTeams = e.teams.map((t) => teams.find((x) => x.id === t.teamId)?.name).filter(Boolean).join(", ");
                return (
                  <label key={e.id} className="flex items-center gap-2 px-2 py-1.5 border-b border-border last:border-0 hover:bg-surface-hover text-xs cursor-pointer">
                    <input type="checkbox" checked={members.includes(e.id)} onChange={() => toggleMember(e.id)} />
                    <span className="w-6 h-6 rounded-full bg-module-hrms/15 text-module-hrms text-2xs font-semibold flex items-center justify-center">{e.avatarInitials}</span>
                    <div className="flex-1">
                      <div className="font-medium">{fullName(e)}</div>
                      <div className="text-2xs text-muted-foreground">{e.designation}{otherTeams && ` · Also in: ${otherTeams}`}</div>
                    </div>
                    {e.id === leadEmployeeId && <span className="text-2xs text-primary">Lead</span>}
                  </label>
                );
              })}
            </div>
          </Section>
        </div>

        <div className="lg:col-span-4">
          <div className="border border-border rounded-md bg-surface p-3 sticky top-3 space-y-2 text-xs">
            <div className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold">📋 Team Summary</div>
            <Row k="Name" v={name || "—"} />
            <Row k="Dept" v={dept?.name || "—"} />
            <Row k="Lead" v={fullName(employees.find((e) => e.id === leadEmployeeId))} />
            <Row k="Members" v={String(members.length + (leadEmployeeId && !members.includes(leadEmployeeId) ? 1 : 0))} />
            <Row k="Budget" v={inr(budget)} />
            {dept && (
              <div className="border-t border-border pt-2 space-y-1">
                <div className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold">Dept Budget</div>
                <Row k="Total Available" v={inr(deptAvailable)} />
                <Row k="Allocating" v={inr(budget)} />
                <div className={`text-2xs ${budget > deptAvailable ? "text-destructive" : "text-success"}`}>{budget > deptAvailable ? "✗ Exceeds available" : "✓ Within available"}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="border border-border rounded-md bg-surface p-3 space-y-2"><h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-2xs">{label}</Label>{children}</div>;
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-mono">{v}</span></div>;
}

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHrmsStore } from "@/store/hrmsStore";
import { useToast } from "@/hooks/use-toast";
import { inr } from "@/lib/mockData";

export default function DepartmentNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const addDepartment = useHrmsStore((s) => s.addDepartment);
  const departments = useHrmsStore((s) => s.departments);
  const employees = useHrmsStore((s) => s.employees);

  const nextCode = `DEPT-${String(departments.length + 1).padStart(3, "0")}`;

  const [name, setName] = useState("");
  const [code, setCode] = useState(nextCode);
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#10B981");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [headEmployeeId, setHeadEmployeeId] = useState<string>("");
  const [annualBudget, setAnnualBudget] = useState<number>(0);
  const [budgetPeriod, setBudgetPeriod] = useState<"Apr-Mar" | "Jan-Dec">("Apr-Mar");
  const [budgetSalary, setBudgetSalary] = useState<number>(0);
  const [budgetBenefits, setBudgetBenefits] = useState<number>(0);
  const [budgetTraining, setBudgetTraining] = useState<number>(0);
  const [budgetRecruitment, setBudgetRecruitment] = useState<number>(0);
  const [budgetOther, setBudgetOther] = useState<number>(0);
  const [alertAtPercent, setAlertAtPercent] = useState<number>(80);
  const [workHoursPerDay, setWorkHoursPerDay] = useState<number>(9);
  const [workLocation, setWorkLocation] = useState<"Office" | "Remote" | "Hybrid">("Hybrid");

  const allocated = budgetSalary + budgetBenefits + budgetTraining + budgetRecruitment + budgetOther;
  const remainingToAllocate = annualBudget - allocated;
  const duplicateName = departments.some((d) => d.name.toLowerCase() === name.toLowerCase());

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!name || name.length < 2) e.push("Name required (min 2 chars)");
    if (!code) e.push("Code required");
    if (departments.some((d) => d.code === code)) e.push("Code must be unique");
    if (annualBudget <= 0) e.push("Annual budget must be > 0");
    if (budgetSalary > annualBudget) e.push("Salary budget cannot exceed annual budget");
    return e;
  }, [name, code, annualBudget, budgetSalary, departments]);

  function submit() {
    if (errors.length) {
      toast({ title: "Fix errors", description: errors[0], variant: "destructive" });
      return;
    }
    addDepartment({
      name, code, description, color, status,
      headEmployeeId: headEmployeeId || undefined,
      annualBudget, budgetPeriod,
      budgetSalary, budgetBenefits, budgetTraining, budgetRecruitment, budgetOther,
      spentSalary: 0, spentBenefits: 0, spentTraining: 0, spentRecruitment: 0, spentOther: 0,
      alertAtPercent, workHoursPerDay,
      workDays: ["Mon","Tue","Wed","Thu","Fri"],
      workLocation,
    });
    toast({ title: `✅ ${name} department created` });
    navigate("/hrms/departments");
  }

  return (
    <div className="flex-1 overflow-auto">
      <ModuleHeader
        title="Create Department"
        accentVar="--mod-hrms"
        actions={
          <>
            <Link to="/hrms/departments"><Button size="sm" variant="ghost" className="h-7 gap-1.5"><ArrowLeft className="w-3.5 h-3.5" />Back</Button></Link>
            <Button size="sm" variant="outline" className="h-7" onClick={() => toast({ title: "Draft saved (mock)" })}>Save Draft</Button>
            <Button size="sm" className="h-7" onClick={submit}>Create</Button>
          </>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3">
        <div className="lg:col-span-8 space-y-3">
          {/* Basic Info */}
          <Section title="Basic Info">
            <Field label="Department Name *"><Input value={name} onChange={(e) => setName(e.target.value)} className="h-8" /></Field>
            {duplicateName && <p className="text-2xs text-warning">⚠ A department with this name already exists.</p>}
            <Field label="Department Code *"><Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ""))} className="h-8 font-mono" /></Field>
            <Field label="Description"><Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[60px]" /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Color *"><Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-full p-1" /></Field>
              <Field label="Status *">
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
                </Select>
              </Field>
            </div>
          </Section>

          {/* Leadership */}
          <Section title="Leadership">
            <Field label="Department Head">
              <Select value={headEmployeeId || "none"} onValueChange={(v) => setHeadEmployeeId(v === "none" ? "" : v)}>
                <SelectTrigger className="h-8"><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Assign later</SelectItem>
                  {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName} — {e.designation}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            {headEmployeeId && <p className="text-2xs text-muted-foreground">Will get Dept Head role in this department.</p>}
          </Section>

          {/* Budget */}
          <Section title="Budget (allocated by Finance)">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Annual Budget * (₹)"><Input type="number" value={annualBudget || ""} onChange={(e) => setAnnualBudget(Number(e.target.value) || 0)} className="h-8 font-mono" /></Field>
              <Field label="Budget Period">
                <Select value={budgetPeriod} onValueChange={(v) => setBudgetPeriod(v as any)}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apr-Mar">April – March</SelectItem>
                    <SelectItem value="Jan-Dec">January – December</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Salary Budget"><Input type="number" value={budgetSalary || ""} onChange={(e) => setBudgetSalary(Number(e.target.value) || 0)} className="h-8 font-mono" /></Field>
              <Field label="Benefits Budget"><Input type="number" value={budgetBenefits || ""} onChange={(e) => setBudgetBenefits(Number(e.target.value) || 0)} className="h-8 font-mono" /></Field>
              <Field label="Training Budget"><Input type="number" value={budgetTraining || ""} onChange={(e) => setBudgetTraining(Number(e.target.value) || 0)} className="h-8 font-mono" /></Field>
              <Field label="Recruitment Budget"><Input type="number" value={budgetRecruitment || ""} onChange={(e) => setBudgetRecruitment(Number(e.target.value) || 0)} className="h-8 font-mono" /></Field>
              <Field label="Other Budget"><Input type="number" value={budgetOther || ""} onChange={(e) => setBudgetOther(Number(e.target.value) || 0)} className="h-8 font-mono" /></Field>
            </div>
            <div className="text-2xs font-mono text-muted-foreground bg-muted/40 p-2 rounded-sm">
              Allocated: {inr(allocated)} · Remaining to allocate: <span className={remainingToAllocate < 0 ? "text-destructive" : "text-success"}>{inr(remainingToAllocate)}</span>
            </div>
            <Field label={`Budget Alert at ${alertAtPercent}%`}>
              <input type="range" min={70} max={95} value={alertAtPercent} onChange={(e) => setAlertAtPercent(Number(e.target.value))} className="w-full" />
            </Field>
          </Section>

          {/* Work settings */}
          <Section title="Work Settings">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Work Hours / Day"><Input type="number" value={workHoursPerDay} onChange={(e) => setWorkHoursPerDay(Number(e.target.value) || 9)} className="h-8" /></Field>
              <Field label="Work Location">
                <Select value={workLocation} onValueChange={(v) => setWorkLocation(v as any)}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Office">Office</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Section>
        </div>

        {/* Summary */}
        <div className="lg:col-span-4">
          <div className="border border-border rounded-md bg-surface p-3 sticky top-3 space-y-2 text-xs">
            <div className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold">📋 Department Summary</div>
            <Row k="Name" v={name || "—"} />
            <Row k="Code" v={code} />
            <Row k="Head" v={fullNameOf(employees, headEmployeeId)} />
            <Row k="Budget" v={inr(annualBudget)} />
            <div className="border-t border-border pt-2 space-y-1">
              <div className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold">Budget Split</div>
              <Row k="Salary" v={inr(budgetSalary)} />
              <Row k="Benefits" v={inr(budgetBenefits)} />
              <Row k="Training" v={inr(budgetTraining)} />
              <Row k="Recruitment" v={inr(budgetRecruitment)} />
              <Row k="Other" v={inr(budgetOther)} />
            </div>
            <div className="border-t border-border pt-2 space-y-0.5">
              <div className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold">⚠ Validation</div>
              <ValidRow ok={!!name && name.length >= 2} text="Name filled" />
              <ValidRow ok={!!code && !departments.some(d => d.code === code)} text="Code unique" />
              <ValidRow ok={annualBudget > 0} text="Budget set" />
              <ValidRow ok={!!headEmployeeId} text="Head assigned" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-md bg-surface p-3 space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-2xs">{label}</Label>{children}</div>;
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-mono">{v}</span></div>;
}
function ValidRow({ ok, text }: { ok: boolean; text: string }) {
  return <div className={`text-2xs ${ok ? "text-success" : "text-destructive"}`}>{ok ? "✓" : "✗"} {text}</div>;
}
function fullNameOf(emps: any[], id: string) {
  const e = emps.find((x) => x.id === id); return e ? `${e.firstName} ${e.lastName}` : "—";
}

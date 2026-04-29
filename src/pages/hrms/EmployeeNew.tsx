import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useHrmsStore, deptRemaining, fullName, type EmployeeDeptAssignment, type EmployeeTeamAssignment } from "@/store/hrmsStore";
import { useToast } from "@/hooks/use-toast";
import { inr } from "@/lib/mockData";

export default function EmployeeNew() {
  const nav = useNavigate();
  const { toast } = useToast();
  const departments = useHrmsStore((s) => s.departments);
  const teams = useHrmsStore((s) => s.teams);
  const employees = useHrmsStore((s) => s.employees);
  const addEmployee = useHrmsStore((s) => s.addEmployee);

  const nextCode = `EMP-${String(employees.length + 1).padStart(4, "0")}`;

  // Personal
  const [firstName, setFn] = useState("");
  const [lastName, setLn] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Non-binary" | "Prefer not to say">("Prefer not to say");
  const [personalEmail, setPe] = useState("");
  const [workEmail, setWe] = useState("");
  const [personalPhone, setPp] = useState("");
  const [emergencyName, setEn] = useState("");
  const [emergencyPhone, setEp] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pin, setPin] = useState("");

  // Employment
  const [empCode, setEmpCode] = useState(nextCode);
  const [designation, setDesignation] = useState("");
  const [employmentType, setEt] = useState<"Full-Time" | "Part-Time" | "Contract" | "Intern">("Full-Time");
  const [workLocation, setWl] = useState<"Office" | "Remote" | "Hybrid">("Hybrid");
  const [joiningDate, setJd] = useState(new Date().toISOString().slice(0, 10));
  const [probation, setProbation] = useState<"None" | "1M" | "2M" | "3M" | "6M">("3M");
  const [noticePeriod, setNp] = useState<"15 Days" | "30 Days" | "45 Days" | "60 Days" | "90 Days">("60 Days");

  // Multi assignments
  const [deptAssigns, setDeptAssigns] = useState<EmployeeDeptAssignment[]>([{ departmentId: "", role: "Member" }]);
  const [teamAssigns, setTeamAssigns] = useState<EmployeeTeamAssignment[]>([{ teamId: "", role: "Member" }]);
  const [reportingManagerId, setRm] = useState("");

  // Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSi] = useState("");
  const [experienceLevel, setEl] = useState<"Fresher" | "Junior" | "Mid" | "Senior" | "Lead" | "Principal">("Mid");
  const [experienceYears, setEy] = useState<number>(2);

  // Salary
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [annualCtc, setCtc] = useState<number>(0);
  const [bankName, setBn] = useState("");
  const [bankAccount, setBa] = useState("");
  const [bankIfsc, setIfsc] = useState("");

  // Password
  const [password, setPwd] = useState("");
  const [confirm, setCf] = useState("");

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!firstName) e.push("First name required");
    if (!lastName) e.push("Last name required");
    if (!personalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail)) e.push("Valid personal email required");
    if (!workEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail)) e.push("Valid work email required");
    if (!personalPhone || personalPhone.replace(/\D/g, "").length < 10) e.push("Valid phone required");
    if (!designation) e.push("Designation required");
    if (!joiningDate) e.push("Joining date required");
    if (deptAssigns.filter((d) => d.departmentId).length === 0) e.push("At least 1 department");
    if (teamAssigns.filter((t) => t.teamId).length === 0) e.push("At least 1 team");
    if (!reportingManagerId) e.push("Reporting manager required");
    if (annualCtc <= 0) e.push("Annual CTC required");
    if (password.length < 8) e.push("Password min 8 chars");
    if (password !== confirm) e.push("Passwords don't match");
    return e;
  }, [firstName, lastName, personalEmail, workEmail, personalPhone, designation, joiningDate, deptAssigns, teamAssigns, reportingManagerId, annualCtc, password, confirm]);

  const primaryDept = departments.find((d) => d.id === deptAssigns[0]?.departmentId);
  const remainingAfter = primaryDept ? deptRemaining(primaryDept) - annualCtc : 0;

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) { setSkills([...skills, s]); setSi(""); }
  }

  function submit() {
    if (errors.length) { toast({ title: errors[0], variant: "destructive" }); return; }
    const id = addEmployee({
      empCode,
      firstName, lastName, dob, gender,
      personalEmail, workEmail, personalPhone,
      emergencyName, emergencyPhone, address, city, state, pin,
      designation, employmentType, workLocation, joiningDate,
      probation, noticePeriod,
      status: probation === "None" ? "Active" : "Probation",
      departments: deptAssigns.filter((d) => d.departmentId),
      teams: teamAssigns.filter((t) => t.teamId),
      reportingManagerId,
      skills, experienceLevel, experienceYears,
      currency, annualCtc,
      salaryEffectiveDate: joiningDate,
      bankName, bankAccount, bankIfsc,
      leaveBalances: { CL: 12, SL: 12, EL: 15 },
    });
    toast({ title: `✅ ${firstName} ${lastName} added` });
    nav(`/hrms/employees/${id}`);
  }

  return (
    <div className="flex-1 overflow-auto">
      <ModuleHeader
        title="Add New Employee"
        accentVar="--mod-hrms"
        actions={
          <>
            <Link to="/hrms/employees"><Button size="sm" variant="ghost" className="h-7 gap-1.5"><ArrowLeft className="w-3.5 h-3.5" />Back</Button></Link>
            <Button size="sm" variant="outline" className="h-7" onClick={() => toast({ title: "Draft saved (mock)" })}>Save Draft</Button>
            <Button size="sm" className="h-7" onClick={submit}>Create Employee</Button>
          </>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3">
        <div className="lg:col-span-8 space-y-3">
          <Section title="Personal Info">
            <div className="grid grid-cols-2 gap-2">
              <Field label="First Name *"><Input value={firstName} onChange={(e) => setFn(e.target.value)} className="h-8" /></Field>
              <Field label="Last Name *"><Input value={lastName} onChange={(e) => setLn(e.target.value)} className="h-8" /></Field>
              <Field label="Date of Birth"><Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="h-8" /></Field>
              <Field label="Gender">
                <Select value={gender} onValueChange={(v) => setGender(v as any)}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Male","Female","Non-binary","Prefer not to say"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Personal Email *"><Input type="email" value={personalEmail} onChange={(e) => setPe(e.target.value)} className="h-8" /></Field>
              <Field label="Work Email *"><Input type="email" value={workEmail} onChange={(e) => setWe(e.target.value)} className="h-8" /></Field>
              <Field label="Phone *"><Input value={personalPhone} onChange={(e) => setPp(e.target.value)} className="h-8" /></Field>
              <Field label="Emergency Phone"><Input value={emergencyPhone} onChange={(e) => setEp(e.target.value)} className="h-8" /></Field>
            </div>
            <Field label="Emergency Contact Name"><Input value={emergencyName} onChange={(e) => setEn(e.target.value)} className="h-8" /></Field>
            <Field label="Address"><Textarea value={address} onChange={(e) => setAddress(e.target.value)} /></Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="City"><Input value={city} onChange={(e) => setCity(e.target.value)} className="h-8" /></Field>
              <Field label="State"><Input value={state} onChange={(e) => setState(e.target.value)} className="h-8" /></Field>
              <Field label="PIN"><Input value={pin} onChange={(e) => setPin(e.target.value)} className="h-8" /></Field>
            </div>
          </Section>

          <Section title="Employment Details">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Employee ID *"><Input value={empCode} onChange={(e) => setEmpCode(e.target.value.toUpperCase())} className="h-8 font-mono" /></Field>
              <Field label="Designation *"><Input value={designation} onChange={(e) => setDesignation(e.target.value)} className="h-8" /></Field>
              <Field label="Employment Type *">
                <Select value={employmentType} onValueChange={(v) => setEt(v as any)}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Full-Time","Part-Time","Contract","Intern"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Work Location *">
                <Select value={workLocation} onValueChange={(v) => setWl(v as any)}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Office","Remote","Hybrid"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Joining Date *"><Input type="date" value={joiningDate} onChange={(e) => setJd(e.target.value)} className="h-8" /></Field>
              <Field label="Probation">
                <Select value={probation} onValueChange={(v) => setProbation(v as any)}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{["None","1M","2M","3M","6M"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Notice Period *">
                <Select value={noticePeriod} onValueChange={(v) => setNp(v as any)}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{["15 Days","30 Days","45 Days","60 Days","90 Days"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
          </Section>

          <Section title="Departments & Teams">
            <p className="text-2xs text-muted-foreground">Employee can be in multiple departments and teams simultaneously.</p>
            <div className="space-y-2">
              <Label className="text-2xs uppercase tracking-wider font-semibold">Department Assignments</Label>
              {deptAssigns.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Select value={d.departmentId} onValueChange={(v) => { const u = [...deptAssigns]; u[i] = { ...u[i], departmentId: v }; setDeptAssigns(u); }}>
                    <SelectTrigger className="h-8 flex-1 text-xs"><SelectValue placeholder="Select dept" /></SelectTrigger>
                    <SelectContent>{departments.map((x) => <SelectItem key={x.id} value={x.id}>{x.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={d.role} onValueChange={(v) => { const u = [...deptAssigns]; u[i] = { ...u[i], role: v as any }; setDeptAssigns(u); }}>
                    <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Member">Member</SelectItem><SelectItem value="Head">Head</SelectItem></SelectContent>
                  </Select>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setDeptAssigns(deptAssigns.filter((_, j) => j !== i))}><X className="w-3.5 h-3.5" /></Button>
                </div>
              ))}
              <Button size="sm" variant="outline" className="h-7 gap-1.5" onClick={() => setDeptAssigns([...deptAssigns, { departmentId: "", role: "Member" }])}><Plus className="w-3.5 h-3.5" />Add Department</Button>
            </div>
            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="text-2xs uppercase tracking-wider font-semibold">Team Assignments</Label>
              {teamAssigns.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Select value={t.teamId} onValueChange={(v) => { const u = [...teamAssigns]; u[i] = { ...u[i], teamId: v }; setTeamAssigns(u); }}>
                    <SelectTrigger className="h-8 flex-1 text-xs"><SelectValue placeholder="Select team" /></SelectTrigger>
                    <SelectContent>{teams.map((x) => <SelectItem key={x.id} value={x.id}>{x.name} — {departments.find((d) => d.id === x.departmentId)?.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={t.role} onValueChange={(v) => { const u = [...teamAssigns]; u[i] = { ...u[i], role: v as any }; setTeamAssigns(u); }}>
                    <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Member">Member</SelectItem><SelectItem value="Lead">Lead</SelectItem></SelectContent>
                  </Select>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setTeamAssigns(teamAssigns.filter((_, j) => j !== i))}><X className="w-3.5 h-3.5" /></Button>
                </div>
              ))}
              <Button size="sm" variant="outline" className="h-7 gap-1.5" onClick={() => setTeamAssigns([...teamAssigns, { teamId: "", role: "Member" }])}><Plus className="w-3.5 h-3.5" />Add Team</Button>
            </div>
            <div className="pt-2 border-t border-border">
              <Field label="Reporting Manager *">
                <Select value={reportingManagerId} onValueChange={setRm}>
                  <SelectTrigger className="h-8"><SelectValue placeholder="Select manager" /></SelectTrigger>
                  <SelectContent>{employees.map((x) => <SelectItem key={x.id} value={x.id}>{fullName(x)} — {x.designation}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
          </Section>

          <Section title="Skills">
            <div className="flex items-center gap-2">
              <Input value={skillInput} onChange={(e) => setSi(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} placeholder="Type & Enter" className="h-8" />
              <Button size="sm" variant="outline" className="h-8" onClick={addSkill}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s} className="px-1.5 h-5 inline-flex items-center text-2xs rounded-sm bg-muted gap-1">
                  {s}<button onClick={() => setSkills(skills.filter((x) => x !== s))}><X className="w-2.5 h-2.5" /></button>
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Experience Level">
                <Select value={experienceLevel} onValueChange={(v) => setEl(v as any)}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Fresher","Junior","Mid","Senior","Lead","Principal"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Total Experience (years)"><Input type="number" value={experienceYears} onChange={(e) => setEy(Number(e.target.value) || 0)} className="h-8" /></Field>
            </div>
          </Section>

          <Section title="Salary">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Currency">
                <Select value={currency} onValueChange={(v) => setCurrency(v as any)}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="INR">INR</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent>
                </Select>
              </Field>
              <Field label="Annual CTC *"><Input type="number" value={annualCtc || ""} onChange={(e) => setCtc(Number(e.target.value) || 0)} className="h-8 font-mono" /></Field>
            </div>
            {primaryDept && annualCtc > 0 && (
              <div className={`text-2xs p-2 rounded-sm border ${remainingAfter < 0 ? "bg-destructive/10 border-destructive/30 text-destructive" : "bg-success/10 border-success/30 text-success"}`}>
                ⚠ Budget Check — {primaryDept.name}: {inr(deptRemaining(primaryDept))} remaining → After hiring: {inr(remainingAfter)}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              <Field label="Bank Name"><Input value={bankName} onChange={(e) => setBn(e.target.value)} className="h-8" /></Field>
              <Field label="Account Number"><Input value={bankAccount} onChange={(e) => setBa(e.target.value)} className="h-8 font-mono" /></Field>
              <Field label="IFSC"><Input value={bankIfsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} className="h-8 font-mono" /></Field>
            </div>
          </Section>

          <Section title="Password & Access">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Password *"><Input type="password" value={password} onChange={(e) => setPwd(e.target.value)} className="h-8" /></Field>
              <Field label="Confirm Password *"><Input type="password" value={confirm} onChange={(e) => setCf(e.target.value)} className="h-8" /></Field>
            </div>
            <div className="text-2xs text-muted-foreground">Strength: {password.length === 0 ? "—" : password.length < 8 ? "Weak" : /[A-Z]/.test(password) && /[0-9]/.test(password) ? "Strong" : "Fair"}</div>
          </Section>
        </div>

        <div className="lg:col-span-4">
          <div className="border border-border rounded-md bg-surface p-3 sticky top-3 space-y-2 text-xs">
            <div className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold">👤 Summary</div>
            <Row k="Name" v={`${firstName} ${lastName}`.trim() || "—"} />
            <Row k="ID" v={empCode} />
            <Row k="Designation" v={designation || "—"} />
            <Row k="Joining" v={joiningDate} />
            <div className="border-t border-border pt-2 space-y-1">
              <Row k="Departments" v={deptAssigns.filter((d) => d.departmentId).map((d) => departments.find((x) => x.id === d.departmentId)?.name).join(", ") || "—"} />
              <Row k="Teams" v={teamAssigns.filter((t) => t.teamId).map((t) => teams.find((x) => x.id === t.teamId)?.name).join(", ") || "—"} />
              <Row k="Manager" v={fullName(employees.find((x) => x.id === reportingManagerId))} />
            </div>
            <div className="border-t border-border pt-2 space-y-1">
              <Row k="Annual CTC" v={inr(annualCtc)} />
              <Row k="Monthly" v={inr(Math.round(annualCtc / 12))} />
            </div>
            <div className="border-t border-border pt-2 space-y-0.5">
              <div className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold">⚠ Validation</div>
              <ValidRow ok={!!firstName && !!lastName} text="Name filled" />
              <ValidRow ok={!!personalEmail && !!workEmail} text="Emails filled" />
              <ValidRow ok={deptAssigns.some((d) => d.departmentId)} text="Dept assigned" />
              <ValidRow ok={teamAssigns.some((t) => t.teamId)} text="Team assigned" />
              <ValidRow ok={annualCtc > 0} text="Salary set" />
              <ValidRow ok={password.length >= 8 && password === confirm} text="Password valid" />
            </div>
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
  return <div className="flex justify-between gap-2"><span className="text-muted-foreground shrink-0">{k}</span><span className="font-mono text-right truncate">{v}</span></div>;
}
function ValidRow({ ok, text }: { ok: boolean; text: string }) {
  return <div className={`text-2xs ${ok ? "text-success" : "text-destructive"}`}>{ok ? "✓" : "✗"} {text}</div>;
}

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Sparkles, Plus, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSalesStore, computeAiScore, type Lead, type SourcePlatform, type LeadType, type ProjectType, type LeadPriority } from "@/store/salesStore";
import { PEOPLE } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

const SOURCES: { p: SourcePlatform; icon: string }[] = [
  { p: "Upwork", icon: "🌐" }, { p: "LinkedIn", icon: "💼" }, { p: "Email", icon: "📧" },
  { p: "Referral", icon: "🤝" }, { p: "Website", icon: "🌍" }, { p: "Direct Call", icon: "📞" },
  { p: "WhatsApp", icon: "📱" }, { p: "Event", icon: "🎪" }, { p: "Other", icon: "✨" },
];
const LEAD_TYPES: LeadType[] = ["Bid Won", "Direct Invite", "Direct Lead", "Referral", "Inbound", "Outbound"];
const PROJECT_TYPES: ProjectType[] = ["Web App", "Mobile App", "API", "Design", "AI/ML", "Consulting", "Other"];
const PRIORITIES: LeadPriority[] = ["Critical", "High", "Medium", "Low"];
const INDUSTRIES = ["Technology", "E-commerce", "Healthcare", "Finance", "Education", "Manufacturing", "Retail", "Other"];
const COUNTRIES = ["India", "USA", "UK", "Germany", "Australia", "UAE", "Singapore", "Other"];

export default function LeadNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const sources = useSalesStore((s) => s.sources);
  const addLead = useSalesStore((s) => s.addLead);

  const [form, setForm] = useState<Partial<Lead>>({
    sourcePlatform: "Upwork",
    leadType: "Direct Invite",
    industry: "Technology",
    country: "India",
    timezone: "IST",
    preferredContact: "Email",
    projectType: "Web App",
    techStack: [],
    budgetCurrency: "INR",
    budgetType: "Fixed",
    complexity: "Medium",
    priority: "Medium",
    tags: [],
    status: "New",
    createdById: "p1",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [techInput, setTechInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const filteredSources = sources.filter(s => s.platform === form.sourcePlatform || form.sourcePlatform === "Other");

  const aiSuggestions = useMemo(() => {
    if (!form.title || !form.description || form.description.length < 20) return null;
    const score = computeAiScore({
      leadType: form.leadType as LeadType,
      budget: form.budget,
      budgetCurrency: form.budgetCurrency as "INR" | "USD",
      description: form.description,
      complexity: form.complexity as Lead["complexity"],
      priority: form.priority as LeadPriority,
    });
    const complexityFromDesc = form.description.length > 200 ? "High" : form.description.length > 100 ? "Medium" : "Low";
    const priority = score >= 7 ? "High" : score >= 5 ? "Medium" : "Low";
    const estValue = form.budget ?? (score >= 7 ? 500000 : score >= 5 ? 250000 : 100000);
    const lowestLoad = PEOPLE.find(p => p.dept === "Sales");
    return { score, complexity: complexityFromDesc, priority, estValue, assignee: lowestLoad };
  }, [form.title, form.description, form.leadType, form.budget, form.budgetCurrency, form.complexity, form.priority]);

  function applyAi() {
    if (!aiSuggestions) return;
    setForm(f => ({
      ...f,
      complexity: aiSuggestions.complexity as Lead["complexity"],
      priority: aiSuggestions.priority as LeadPriority,
      estimatedValue: aiSuggestions.estValue,
      assigneeId: f.assigneeId ?? aiSuggestions.assignee?.id,
    }));
    toast({ title: "AI suggestions applied" });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.sourcePlatform) e.sourcePlatform = "Required";
    if (!form.leadType) e.leadType = "Required";
    if (!form.company || form.company.length < 2) e.company = "Min 2 characters";
    if (!form.firstName) e.firstName = "Required";
    if (!form.lastName) e.lastName = "Required";
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Valid email required";
    if (!form.title || form.title.length < 5) e.title = "Min 5 characters";
    if (!form.description || form.description.length < 20) e.description = "Min 20 characters";
    if (form.budgetType !== "TBD" && (!form.budget || form.budget <= 0)) e.budget = "Required (or set to TBD)";
    if (!form.assigneeId) e.assigneeId = "Required";
    if (form.sourcePlatform === "Upwork" && form.jobUrl && !/^https:\/\/(www\.)?upwork\.com/.test(form.jobUrl)) e.jobUrl = "Must be an upwork.com URL";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit() {
    if (!validate()) {
      toast({ title: "Please fix the errors below", variant: "destructive" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const id = addLead(form as Omit<Lead, "id" | "createdAt" | "lastActivityAt" | "aiScore">);
    toast({ title: "Lead created", description: form.title });
    navigate(`/sales/leads/${id}`);
  }

  const validations = [
    { ok: !!form.sourcePlatform && !!form.sourceAccountId, label: "Source filled" },
    { ok: !!form.firstName && !!form.lastName && !!form.email, label: "Contact filled" },
    { ok: (form.description?.length ?? 0) >= 20, label: "Description ≥ 20 chars" },
    { ok: form.budgetType === "TBD" || ((form.budget ?? 0) > 0), label: "Budget set" },
    { ok: !!form.assigneeId, label: "Assignee selected" },
  ];

  function addTech() {
    const t = techInput.trim();
    if (t && !form.techStack?.includes(t)) {
      setForm({ ...form, techStack: [...(form.techStack ?? []), t] });
      setTechInput("");
    }
  }
  function addTag() {
    const t = tagInput.trim();
    if (t && !form.tags?.includes(t)) {
      setForm({ ...form, tags: [...(form.tags ?? []), t] });
      setTagInput("");
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader
        title="Create New Lead"
        subtitle="Sales › Leads › New Lead"
        accentVar="--mod-sales"
        actions={
          <>
            <Link to="/sales/leads"><Button variant="outline" size="sm" className="h-7 text-xs gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Cancel</Button></Link>
            <Button variant="outline" size="sm" className="h-7 text-xs">Save Draft</Button>
            <Button size="sm" className="h-7 text-xs gap-1" onClick={submit}><Save className="w-3.5 h-3.5" /> Submit Lead</Button>
          </>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-3 p-3">
        {/* LEFT: form */}
        <div className="space-y-3 min-w-0">
          {/* Section 1: Source */}
          <Section title="1. Lead Source" badge="Most important">
            <div>
              <Label className="text-2xs uppercase tracking-wider text-muted-foreground">Source Type *</Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mt-1.5">
                {SOURCES.map(({ p, icon }) => (
                  <button key={p} type="button" onClick={() => setForm({ ...form, sourcePlatform: p, sourceAccountId: undefined })}
                    className={`h-12 rounded-sm border flex flex-col items-center justify-center text-2xs font-medium gap-0.5 ${form.sourcePlatform === p ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-surface-hover"}`}
                  ><span className="text-base">{icon}</span><span>{p}</span></button>
                ))}
              </div>
            </div>

            <Field label="Source Account *">
              <div className="flex gap-2">
                <Select value={form.sourceAccountId} onValueChange={(v) => setForm({ ...form, sourceAccountId: v })}>
                  <SelectTrigger className="h-9 flex-1"><SelectValue placeholder={`Select ${form.sourcePlatform} account…`} /></SelectTrigger>
                  <SelectContent>
                    {filteredSources.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.displayName} {s.ownerId && `· ${PEOPLE.find(p => p.id === s.ownerId)?.name}`}</SelectItem>
                    ))}
                    {filteredSources.length === 0 && <div className="px-3 py-2 text-2xs text-muted-foreground">No accounts. Add one →</div>}
                  </SelectContent>
                </Select>
                <Link to="/sales/sources/new" target="_blank"><Button variant="outline" size="sm" className="h-9 text-xs gap-1"><Plus className="w-3.5 h-3.5" /> New</Button></Link>
              </div>
            </Field>

            <div>
              <Label className="text-2xs uppercase tracking-wider text-muted-foreground">Lead Type *</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {LEAD_TYPES.map(t => (
                  <button key={t} type="button" onClick={() => setForm({ ...form, leadType: t })}
                    className={`h-7 px-3 rounded-sm border text-xs font-medium ${form.leadType === t ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-surface-hover"}`}
                  >{t}</button>
                ))}
              </div>
            </div>

            {/* Conditional platform fields */}
            {form.sourcePlatform === "Upwork" && (
              <div className="bg-primary/5 border border-primary/20 rounded-sm p-3 space-y-3">
                <div className="text-2xs uppercase tracking-wider text-primary font-semibold">Upwork details</div>
                <Field label="Job Post URL" error={errors.jobUrl}>
                  <Input value={form.jobUrl ?? ""} onChange={(e) => setForm({ ...form, jobUrl: e.target.value })} placeholder="https://www.upwork.com/jobs/~01..." />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Job Title on Platform"><Input value={form.jobTitle ?? ""} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} /></Field>
                  <Field label="Bid Amount"><Input type="number" value={form.bidAmount ?? ""} onChange={(e) => setForm({ ...form, bidAmount: Number(e.target.value) })} /></Field>
                </div>
                <Field label="Contract Type">
                  <Select value={form.contractType} onValueChange={(v: any) => setForm({ ...form, contractType: v })}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Hourly">Hourly</SelectItem><SelectItem value="Fixed">Fixed</SelectItem></SelectContent>
                  </Select>
                </Field>
              </div>
            )}
            {form.sourcePlatform === "LinkedIn" && (
              <div className="bg-primary/5 border border-primary/20 rounded-sm p-3 space-y-2">
                <div className="text-2xs uppercase tracking-wider text-primary font-semibold">LinkedIn details</div>
                <Field label="LinkedIn Profile URL"><Input value={form.linkedin ?? ""} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." /></Field>
              </div>
            )}
            {form.sourcePlatform === "Website" && (
              <div className="bg-primary/5 border border-primary/20 rounded-sm p-3 space-y-2">
                <div className="text-2xs uppercase tracking-wider text-primary font-semibold">Website details</div>
                <Field label="Landing Page URL"><Input placeholder="https://yoursite.com/landing" /></Field>
              </div>
            )}
          </Section>

          {/* Section 2: Company */}
          <Section title="2. Client / Company Info">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Company Name *" error={errors.company}><Input value={form.company ?? ""} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="TechCorp India" /></Field>
              <Field label="Company Website"><Input value={form.companyWebsite ?? ""} onChange={(e) => setForm({ ...form, companyWebsite: e.target.value })} placeholder="https://" /></Field>
              <Field label="Industry *">
                <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Company Size">
                <Select value={form.companySize} onValueChange={(v) => setForm({ ...form, companySize: v })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{["1-10","11-50","51-200","201-1000","1000+"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Country *">
                <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="City"><Input value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
            </div>
          </Section>

          {/* Section 3: Contact */}
          <Section title="3. Primary Contact">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First Name *" error={errors.firstName}><Input value={form.firstName ?? ""} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></Field>
              <Field label="Last Name *" error={errors.lastName}><Input value={form.lastName ?? ""} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></Field>
              <Field label="Email *" error={errors.email}><Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
              <Field label="Phone"><Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 9XXXXXXXXX" /></Field>
              <Field label="Designation"><Input value={form.designation ?? ""} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="CTO, Founder, etc." /></Field>
              <Field label="LinkedIn URL"><Input value={form.linkedin ?? ""} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} /></Field>
              <Field label="Preferred Contact Method">
                <Select value={form.preferredContact} onValueChange={(v: any) => setForm({ ...form, preferredContact: v })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem><SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Phone">Phone</SelectItem><SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Timezone"><Input value={form.timezone ?? ""} onChange={(e) => setForm({ ...form, timezone: e.target.value })} /></Field>
            </div>
          </Section>

          {/* Section 4: Lead details */}
          <Section title="4. Lead Details">
            <Field label="Lead Title *" error={errors.title}><Input value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="E-commerce Web App Development" /></Field>
            <Field label="Description *" error={errors.description}>
              <Textarea rows={4} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does the client need? Min 20 characters." />
              <div className="text-3xs text-muted-foreground mt-0.5 text-right font-mono">{form.description?.length ?? 0} chars</div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Project Type *">
                <Select value={form.projectType} onValueChange={(v: any) => setForm({ ...form, projectType: v })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{PROJECT_TYPES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Timeline">
                <Select value={form.timeline} onValueChange={(v) => setForm({ ...form, timeline: v })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{["< 1 month","1-3 months","3-6 months","6-12 months","> 1 year"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Tech Stack Required">
              <div className="flex gap-2">
                <Input value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())} placeholder="Add tag and press Enter" />
                <Button type="button" variant="outline" size="sm" onClick={addTech} className="h-9">Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {form.techStack?.map(t => (
                  <span key={t} className="px-1.5 h-5 rounded-sm bg-primary/10 text-primary text-2xs font-medium border border-primary/20 flex items-center gap-1">
                    {t}<button onClick={() => setForm({ ...form, techStack: form.techStack?.filter(x => x !== t) })} className="hover:text-foreground">×</button>
                  </span>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Budget Type">
                <Select value={form.budgetType} onValueChange={(v: any) => setForm({ ...form, budgetType: v })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Fixed">Fixed</SelectItem><SelectItem value="Hourly">Hourly</SelectItem><SelectItem value="TBD">TBD</SelectItem></SelectContent>
                </Select>
              </Field>
              <Field label="Currency">
                <Select value={form.budgetCurrency} onValueChange={(v: any) => setForm({ ...form, budgetCurrency: v })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="INR">INR (₹)</SelectItem><SelectItem value="USD">USD ($)</SelectItem></SelectContent>
                </Select>
              </Field>
              <Field label="Budget" error={errors.budget}>
                <Input type="number" disabled={form.budgetType === "TBD"} value={form.budget ?? ""} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Complexity">
                <Select value={form.complexity} onValueChange={(v: any) => setForm({ ...form, complexity: v })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Low","Medium","High","Enterprise"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Priority *">
                <Select value={form.priority} onValueChange={(v: any) => setForm({ ...form, priority: v })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
          </Section>

          {/* Section 5: Assignment */}
          <Section title="5. Assignment & Follow-up">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Lead Responsible Person *" error={errors.assigneeId}>
                <Select value={form.assigneeId} onValueChange={(v) => setForm({ ...form, assigneeId: v })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Owner of this lead" /></SelectTrigger>
                  <SelectContent>{PEOPLE.filter(p => p.dept === "Sales" || p.dept === "Engineering").map(p => <SelectItem key={p.id} value={p.id}>{p.name} · {p.dept}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Follow-up Person">
                <Select value={form.followUpPersonId} onValueChange={(v) => setForm({ ...form, followUpPersonId: v })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Who handles follow-ups" /></SelectTrigger>
                  <SelectContent>{PEOPLE.map(p => <SelectItem key={p.id} value={p.id}>{p.name} · {p.dept}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Initial Contact Due"><Input type="date" value={form.followUpDate ?? ""} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} /></Field>
              <Field label="Team"><Input value={form.team ?? ""} onChange={(e) => setForm({ ...form, team: e.target.value })} placeholder="Sales East" /></Field>
            </div>
          </Section>

          {/* Section 6: Attachments */}
          <Section title="6. Attachments (links or files)">
            <AttachmentField
              attachments={form.attachments ?? []}
              onChange={(atts) => setForm({ ...form, attachments: atts })}
            />
          </Section>

          {/* Section 6: Tags */}
          {/* Section 7: Tags */}
          <Section title="7. Tags & Classification">
            <Field label="Tags">
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Add tag and press Enter" />
                <Button type="button" variant="outline" size="sm" onClick={addTag} className="h-9">Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {form.tags?.map(t => (
                  <span key={t} className="px-1.5 h-5 rounded-sm bg-surface-hover text-2xs flex items-center gap-1">
                    {t}<button onClick={() => setForm({ ...form, tags: form.tags?.filter(x => x !== t) })} className="hover:text-foreground">×</button>
                  </span>
                ))}
              </div>
            </Field>
            <Field label="Internal Notes (not visible to client)"><Textarea rows={3} value={form.internalNotes ?? ""} onChange={(e) => setForm({ ...form, internalNotes: e.target.value })} /></Field>
          </Section>

          <div className="flex justify-end gap-2 pb-6">
            <Link to="/sales/leads"><Button variant="outline" size="sm">Cancel</Button></Link>
            <Button size="sm" onClick={submit}>Submit Lead</Button>
          </div>
        </div>

        {/* RIGHT: AI + Summary */}
        <aside className="space-y-3">
          <div className="bg-gradient-to-br from-primary/10 to-mod-pms/10 border border-primary/30 rounded-sm p-3 sticky top-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">AI Assist</h3>
            </div>
            {!aiSuggestions ? (
              <p className="text-2xs text-muted-foreground">Fill the lead title and description (20+ chars) to get AI suggestions.</p>
            ) : (
              <div className="space-y-1.5 text-xs">
                <SuggestionRow label="Lead Score" value={`${aiSuggestions.score}/10`} />
                <SuggestionRow label="Priority" value={aiSuggestions.priority} />
                <SuggestionRow label="Complexity" value={aiSuggestions.complexity} />
                <SuggestionRow label="Est. Value" value={`₹${aiSuggestions.estValue.toLocaleString("en-IN")}`} />
                <SuggestionRow label="Best Assignee" value={aiSuggestions.assignee?.name ?? "—"} />
                <Button size="sm" className="h-7 w-full text-2xs mt-2" onClick={applyAi}>Accept All</Button>
              </div>
            )}
          </div>

          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2">📋 Summary</h3>
            <div className="space-y-1.5 text-xs">
              <SumRow label="Company" value={form.company || "—"} />
              <SumRow label="Contact" value={[form.firstName, form.lastName].filter(Boolean).join(" ") || "—"} />
              <SumRow label="Source" value={`${form.sourcePlatform}${form.sourceAccountId ? ` · ${sources.find(s => s.id === form.sourceAccountId)?.displayName}` : ""}`} />
              <SumRow label="Type" value={form.leadType ?? "—"} />
              <SumRow label="Value" value={form.budget ? `${form.budgetCurrency === "USD" ? "$" : "₹"}${form.budget.toLocaleString("en-IN")}` : "TBD"} />
              <SumRow label="Priority" value={form.priority ?? "—"} />
              <SumRow label="Assigned" value={PEOPLE.find(p => p.id === form.assigneeId)?.name ?? "—"} />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2">⚠ Validation Status</h3>
            <div className="space-y-1 text-xs">
              {validations.map(v => (
                <div key={v.label} className={`flex items-center gap-1.5 ${v.ok ? "text-success" : "text-muted-foreground"}`}>
                  {v.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span>{v.label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface border border-border rounded-sm p-4 space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
        {badge && <span className="px-1.5 h-4 rounded-sm bg-primary/10 text-primary text-3xs font-medium">{badge}</span>}
      </div>
      {children}
    </section>
  );
}
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-2xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
      {error && <p className="text-2xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}
function SuggestionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
      <span className="text-2xs text-muted-foreground">{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  );
}
function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-16 shrink-0 text-2xs text-muted-foreground uppercase">{label}</span>
      <span className="flex-1 truncate font-medium">{value}</span>
    </div>
  );
}

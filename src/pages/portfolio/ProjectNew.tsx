import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Plus, X } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  usePortfolioStore,
  slugify,
  ALL_DOMAINS,
  ALL_ARCHITECTURES,
  ALL_DATABASES,
  ALL_HOSTS,
  ALL_PORTFOLIO_STATUSES,
  generateAIDescription,
  type PortfolioProject,
  type PortfolioFeature,
} from "@/store/portfolioStore";
import { PEOPLE } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

type FormState = Omit<PortfolioProject, "id" | "createdAt" | "updatedAt" | "versions" | "activityLogs">;

const blank: FormState = {
  title: "",
  slug: "",
  domain: "SaaS",
  category: "Web Application",
  subcategory: "",
  tags: [],
  techStack: [],
  architecture: "Monolith",
  database: "PostgreSQL",
  apis: [],
  integrations: [],
  projectManagerId: "p2",
  developerIds: [],
  designerIds: [],
  qaIds: [],
  clientName: "",
  clientCompany: "",
  clientEmail: "",
  clientPhone: "",
  clientCountry: "India",
  ndaSigned: false,
  isPublic: false,
  shortDescription: "",
  detailedDescription: "",
  problemStatement: "",
  solutionProvided: "",
  features: [],
  thumbnailUrl: "",
  gallery: [],
  videos: [],
  documents: [],
  productionUrl: "",
  stagingUrl: "",
  repoUrl: "",
  internalRepoPath: "",
  apiBaseUrl: "",
  adminPanelUrl: "",
  databaseLocation: "Cloud",
  hostingProvider: "AWS",
  serverDetails: "",
  cicdInfo: "",
  files: [],
  externalResources: [],
  status: "Draft",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: undefined,
  budget: undefined,
  revenue: undefined,
  metrics: {},
  createdById: "p1",
};

export default function PortfolioProjectNew() {
  const nav = useNavigate();
  const { toast } = useToast();
  const addProject = usePortfolioStore((s) => s.addProject);
  const techOptions = usePortfolioStore((s) => s.techOptions);

  const [f, setF] = useState<FormState>(blank);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));

  const slugAuto = useMemo(() => f.slug || slugify(f.title), [f.slug, f.title]);

  function aiFill() {
    const ai = generateAIDescription({ title: f.title || "Untitled Project", domain: f.domain, techStack: f.techStack });
    setF((p) => ({
      ...p,
      shortDescription: ai.shortDescription,
      detailedDescription: ai.detailedDescription,
      problemStatement: ai.problemStatement,
      solutionProvided: ai.solutionProvided,
      tags: Array.from(new Set([...p.tags, ...ai.suggestedTags])),
    }));
    toast({ title: "AI draft inserted", description: "Review and tweak as needed." });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.title.trim()) return toast({ title: "Title is required", variant: "destructive" });
    if (!f.clientName.trim()) return toast({ title: "Client name is required", variant: "destructive" });
    const id = addProject({ ...f, slug: slugAuto });
    toast({ title: "Project created" });
    nav(`/portfolio/projects/${id}`);
  }

  const selStr = "h-8 w-full px-2 rounded-sm bg-background border border-border text-xs";

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader
        title="New Portfolio Project"
        subtitle="Capture every detail — tech, team, client, metrics"
        accentVar="--mod-portfolio"
        actions={
          <>
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={aiFill}>
              <Sparkles className="w-3.5 h-3.5" /> AI Auto-fill
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => nav(-1)}>Cancel</Button>
          </>
        }
      />

      <form onSubmit={submit} className="p-3 flex-1">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-7 w-full max-w-3xl text-xs">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="tech">Technical</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="client">Client</TabsTrigger>
            <TabsTrigger value="story">Story</TabsTrigger>
            <TabsTrigger value="links">Links & Infra</TabsTrigger>
            <TabsTrigger value="status">Status & Metrics</TabsTrigger>
          </TabsList>

          {/* BASIC */}
          <TabsContent value="basic" className="mt-4 space-y-3 max-w-3xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-2xs">Title *</Label>
                <Input className="h-8 text-xs" value={f.title} onChange={(e) => set("title", e.target.value)} />
              </div>
              <div>
                <Label className="text-2xs">Slug (auto)</Label>
                <Input className="h-8 text-xs font-mono" value={slugAuto} onChange={(e) => set("slug", e.target.value)} />
              </div>
              <div>
                <Label className="text-2xs">Domain</Label>
                <select className={selStr} value={f.domain} onChange={(e) => set("domain", e.target.value as FormState["domain"])}>
                  {ALL_DOMAINS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-2xs">Category</Label>
                <Input className="h-8 text-xs" value={f.category} onChange={(e) => set("category", e.target.value)} />
              </div>
              <div>
                <Label className="text-2xs">Subcategory</Label>
                <Input className="h-8 text-xs" value={f.subcategory ?? ""} onChange={(e) => set("subcategory", e.target.value)} />
              </div>
              <div>
                <Label className="text-2xs">Thumbnail URL</Label>
                <Input className="h-8 text-xs" value={f.thumbnailUrl ?? ""} onChange={(e) => set("thumbnailUrl", e.target.value)} placeholder="https://…" />
              </div>
            </div>
            <ChipsField label="Tags" values={f.tags} onChange={(v) => set("tags", v)} />
          </TabsContent>

          {/* TECHNICAL */}
          <TabsContent value="tech" className="mt-4 space-y-3 max-w-3xl">
            <ChipsField label="Tech Stack" values={f.techStack} onChange={(v) => set("techStack", v)} suggestions={techOptions} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-2xs">Architecture</Label>
                <select className={selStr} value={f.architecture} onChange={(e) => set("architecture", e.target.value as FormState["architecture"])}>
                  {ALL_ARCHITECTURES.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-2xs">Primary Database</Label>
                <select className={selStr} value={f.database} onChange={(e) => set("database", e.target.value as FormState["database"])}>
                  {ALL_DATABASES.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <ChipsField label="APIs (internal/external)" values={f.apis} onChange={(v) => set("apis", v)} />
            <ChipsField label="Integrations (Stripe, OpenAI, …)" values={f.integrations} onChange={(v) => set("integrations", v)} />
          </TabsContent>

          {/* TEAM */}
          <TabsContent value="team" className="mt-4 space-y-3 max-w-3xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-2xs">Project Manager</Label>
                <select className={selStr} value={f.projectManagerId ?? ""} onChange={(e) => set("projectManagerId", e.target.value)}>
                  <option value="">— Select —</option>
                  {PEOPLE.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <PeopleMulti label="Developers" value={f.developerIds} onChange={(v) => set("developerIds", v)} />
            <PeopleMulti label="Designers" value={f.designerIds} onChange={(v) => set("designerIds", v)} />
            <PeopleMulti label="QA / Testers" value={f.qaIds} onChange={(v) => set("qaIds", v)} />
          </TabsContent>

          {/* CLIENT */}
          <TabsContent value="client" className="mt-4 space-y-3 max-w-3xl">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-2xs">Client Name *</Label><Input className="h-8 text-xs" value={f.clientName} onChange={(e) => set("clientName", e.target.value)} /></div>
              <div><Label className="text-2xs">Company</Label><Input className="h-8 text-xs" value={f.clientCompany ?? ""} onChange={(e) => set("clientCompany", e.target.value)} /></div>
              <div><Label className="text-2xs">Email</Label><Input className="h-8 text-xs" type="email" value={f.clientEmail ?? ""} onChange={(e) => set("clientEmail", e.target.value)} /></div>
              <div><Label className="text-2xs">Phone</Label><Input className="h-8 text-xs" value={f.clientPhone ?? ""} onChange={(e) => set("clientPhone", e.target.value)} /></div>
              <div><Label className="text-2xs">Country</Label><Input className="h-8 text-xs" value={f.clientCountry ?? ""} onChange={(e) => set("clientCountry", e.target.value)} /></div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={f.ndaSigned} onChange={(e) => set("ndaSigned", e.target.checked)} /> NDA signed
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={f.isPublic} onChange={(e) => set("isPublic", e.target.checked)} /> Public portfolio page
                </label>
              </div>
            </div>
          </TabsContent>

          {/* STORY */}
          <TabsContent value="story" className="mt-4 space-y-3 max-w-3xl">
            <div><Label className="text-2xs">Short Description</Label><Textarea className="text-xs min-h-[60px]" value={f.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} /></div>
            <div><Label className="text-2xs">Detailed Description</Label><Textarea className="text-xs min-h-[140px]" value={f.detailedDescription} onChange={(e) => set("detailedDescription", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-2xs">Problem Statement</Label><Textarea className="text-xs min-h-[100px]" value={f.problemStatement} onChange={(e) => set("problemStatement", e.target.value)} /></div>
              <div><Label className="text-2xs">Solution Provided</Label><Textarea className="text-xs min-h-[100px]" value={f.solutionProvided} onChange={(e) => set("solutionProvided", e.target.value)} /></div>
            </div>

            <FeaturesEditor value={f.features} onChange={(v) => set("features", v)} />
            <ChipsField label="Videos (YouTube/Vimeo URLs)" values={f.videos} onChange={(v) => set("videos", v)} placeholder="Paste URL and press Enter" />
          </TabsContent>

          {/* LINKS & INFRA */}
          <TabsContent value="links" className="mt-4 space-y-3 max-w-3xl">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-2xs">Production URL</Label><Input className="h-8 text-xs" value={f.productionUrl ?? ""} onChange={(e) => set("productionUrl", e.target.value)} /></div>
              <div><Label className="text-2xs">Staging URL</Label><Input className="h-8 text-xs" value={f.stagingUrl ?? ""} onChange={(e) => set("stagingUrl", e.target.value)} /></div>
              <div><Label className="text-2xs">Repo (GitHub/GitLab)</Label><Input className="h-8 text-xs" value={f.repoUrl ?? ""} onChange={(e) => set("repoUrl", e.target.value)} /></div>
              <div><Label className="text-2xs">Internal Repo Path</Label><Input className="h-8 text-xs font-mono" value={f.internalRepoPath ?? ""} onChange={(e) => set("internalRepoPath", e.target.value)} /></div>
              <div><Label className="text-2xs">API Base URL</Label><Input className="h-8 text-xs" value={f.apiBaseUrl ?? ""} onChange={(e) => set("apiBaseUrl", e.target.value)} /></div>
              <div><Label className="text-2xs">Admin Panel URL</Label><Input className="h-8 text-xs" value={f.adminPanelUrl ?? ""} onChange={(e) => set("adminPanelUrl", e.target.value)} /></div>
              <div>
                <Label className="text-2xs">Database Location</Label>
                <select className={selStr} value={f.databaseLocation ?? "Cloud"} onChange={(e) => set("databaseLocation", e.target.value as FormState["databaseLocation"])}>
                  {["Cloud", "Local", "Hybrid"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-2xs">Hosting Provider</Label>
                <select className={selStr} value={f.hostingProvider ?? "AWS"} onChange={(e) => set("hostingProvider", e.target.value as FormState["hostingProvider"])}>
                  {ALL_HOSTS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div><Label className="text-2xs">Server Details (sensitive)</Label><Textarea className="text-xs min-h-[60px] font-mono" value={f.serverDetails ?? ""} onChange={(e) => set("serverDetails", e.target.value)} /></div>
            <div><Label className="text-2xs">CI/CD Pipeline Info</Label><Textarea className="text-xs min-h-[60px]" value={f.cicdInfo ?? ""} onChange={(e) => set("cicdInfo", e.target.value)} /></div>
            <ChipsField label="External Resources (URLs)" values={f.externalResources} onChange={(v) => set("externalResources", v)} />
          </TabsContent>

          {/* STATUS / METRICS */}
          <TabsContent value="status" className="mt-4 space-y-3 max-w-3xl">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-2xs">Status</Label>
                <select className={selStr} value={f.status} onChange={(e) => set("status", e.target.value as FormState["status"])}>
                  {ALL_PORTFOLIO_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div><Label className="text-2xs">Start Date</Label><Input type="date" className="h-8 text-xs" value={f.startDate} onChange={(e) => set("startDate", e.target.value)} /></div>
              <div><Label className="text-2xs">End Date</Label><Input type="date" className="h-8 text-xs" value={f.endDate ?? ""} onChange={(e) => set("endDate", e.target.value || undefined)} /></div>
              <div><Label className="text-2xs">Budget (₹)</Label><Input type="number" className="h-8 text-xs font-mono" value={f.budget ?? ""} onChange={(e) => set("budget", e.target.value ? Number(e.target.value) : undefined)} /></div>
              <div><Label className="text-2xs">Revenue (₹)</Label><Input type="number" className="h-8 text-xs font-mono" value={f.revenue ?? ""} onChange={(e) => set("revenue", e.target.value ? Number(e.target.value) : undefined)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
              <MetricInput label="Performance (0-100)" value={f.metrics.performanceScore} onChange={(v) => set("metrics", { ...f.metrics, performanceScore: v })} />
              <MetricInput label="Users" value={f.metrics.users} onChange={(v) => set("metrics", { ...f.metrics, users: v })} />
              <MetricInput label="Monthly Traffic" value={f.metrics.monthlyTraffic} onChange={(v) => set("metrics", { ...f.metrics, monthlyTraffic: v })} />
              <MetricInput label="Conversion Rate %" value={f.metrics.conversionRate} onChange={(v) => set("metrics", { ...f.metrics, conversionRate: v })} step={0.1} />
              <MetricInput label="Satisfaction (0-5)" value={f.metrics.satisfactionScore} onChange={(v) => set("metrics", { ...f.metrics, satisfactionScore: v })} step={0.1} />
              <MetricInput label="Uptime %" value={f.metrics.uptimePercent} onChange={(v) => set("metrics", { ...f.metrics, uptimePercent: v })} step={0.01} />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-6 max-w-3xl">
          <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => nav(-1)}>Cancel</Button>
          <Button type="submit" size="sm" className="h-8 text-xs">Create Project</Button>
        </div>
      </form>
    </div>
  );
}

// ───── Reusable subcomponents ─────
function ChipsField({ label, values, onChange, suggestions, placeholder }: {
  label: string; values: string[]; onChange: (v: string[]) => void; suggestions?: string[]; placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const add = (v: string) => {
    const t = v.trim();
    if (!t || values.includes(t)) return;
    onChange([...values, t]);
    setDraft("");
  };
  return (
    <div>
      <Label className="text-2xs">{label}</Label>
      <div className="flex flex-wrap gap-1 p-1.5 border border-border rounded-sm bg-background min-h-[36px]">
        {values.map((v) => (
          <span key={v} className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-1.5 h-6 rounded-sm border border-primary/20">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))}><X className="w-3 h-3" /></button>
          </span>
        ))}
        <input
          className="flex-1 min-w-[120px] bg-transparent text-xs outline-none px-1"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(draft); }
            if (e.key === "Backspace" && !draft && values.length) onChange(values.slice(0, -1));
          }}
          placeholder={placeholder ?? "Type and press Enter"}
        />
      </div>
      {suggestions && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {suggestions.filter((s) => !values.includes(s)).slice(0, 12).map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="text-2xs px-1.5 py-0.5 rounded-sm bg-muted hover:bg-muted/80 text-muted-foreground">+ {s}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function PeopleMulti({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <Label className="text-2xs">{label}</Label>
      <div className="flex flex-wrap gap-1 p-1.5 border border-border rounded-sm bg-background">
        {PEOPLE.map((p) => {
          const sel = value.includes(p.id);
          return (
            <button
              type="button"
              key={p.id}
              onClick={() => onChange(sel ? value.filter((x) => x !== p.id) : [...value, p.id])}
              className={`text-xs h-6 px-2 rounded-sm border ${sel ? "bg-primary/15 border-primary/40 text-primary" : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"}`}
            >
              {p.initials} · {p.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FeaturesEditor({ value, onChange }: { value: PortfolioFeature[]; onChange: (v: PortfolioFeature[]) => void }) {
  const add = () => onChange([...value, { id: `f${Date.now()}`, title: "", description: "", icon: "✨" }]);
  const upd = (id: string, patch: Partial<PortfolioFeature>) => onChange(value.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const rm = (id: string) => onChange(value.filter((f) => f.id !== id));
  return (
    <div className="border border-border rounded-sm p-2.5">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-2xs">Features</Label>
        <Button type="button" size="sm" variant="outline" className="h-6 text-xs gap-1" onClick={add}><Plus className="w-3 h-3" /> Add</Button>
      </div>
      <div className="space-y-2">
        {value.map((f) => (
          <div key={f.id} className="grid grid-cols-[40px,1fr,2fr,auto] gap-2 items-start">
            <Input className="h-8 text-xs text-center" value={f.icon ?? ""} onChange={(e) => upd(f.id, { icon: e.target.value })} maxLength={3} />
            <Input className="h-8 text-xs" placeholder="Title" value={f.title} onChange={(e) => upd(f.id, { title: e.target.value })} />
            <Textarea className="text-xs min-h-[32px]" placeholder="Description" value={f.description} onChange={(e) => upd(f.id, { description: e.target.value })} />
            <button type="button" onClick={() => rm(f.id)} className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
          </div>
        ))}
        {value.length === 0 && <p className="text-2xs text-muted-foreground">No features yet — click Add.</p>}
      </div>
    </div>
  );
}

function MetricInput({ label, value, onChange, step = 1 }: { label: string; value?: number; onChange: (v?: number) => void; step?: number }) {
  return (
    <div>
      <Label className="text-2xs">{label}</Label>
      <Input type="number" step={step} className="h-8 text-xs font-mono" value={value ?? ""} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)} />
    </div>
  );
}

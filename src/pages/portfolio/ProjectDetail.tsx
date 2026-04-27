import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Globe, Github, Database, Server, ExternalLink, Sparkles, Download,
  History, Trash2, Save, Copy, FileText, Mail, Briefcase,
} from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  usePortfolioStore,
  portfolioStatusVariant,
  ALL_PORTFOLIO_STATUSES,
  peopleById,
  durationDays,
  type PortfolioStatus,
} from "@/store/portfolioStore";
import { useSalesStore } from "@/store/salesStore";
import { inr, PEOPLE } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

export default function PortfolioProjectDetail() {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const { toast } = useToast();

  const projects = usePortfolioStore((s) => s.projects);
  const updateProject = usePortfolioStore((s) => s.updateProject);
  const setStatus = usePortfolioStore((s) => s.setProjectStatus);
  const removeProject = usePortfolioStore((s) => s.removeProject);
  const saveVersion = usePortfolioStore((s) => s.saveProjectVersion);
  const rollback = usePortfolioStore((s) => s.rollbackProjectVersion);

  const proposalsAll = useSalesStore((s) => s.proposals);
  const coverLetters = usePortfolioStore((s) => s.coverLetters);

  const project = useMemo(() => projects.find((p) => p.id === id), [projects, id]);
  const linkedProposals = useMemo(() => proposalsAll.filter((p) => p.portfolioProjectId === id), [proposalsAll, id]);
  const linkedCoverLetters = useMemo(() => coverLetters.filter((c) => c.portfolioProjectId === id), [coverLetters, id]);

  const [versionNote, setVersionNote] = useState("");

  if (!project) {
    return (
      <div className="flex flex-col min-h-full">
        <ModuleHeader title="Project not found" accentVar="--mod-portfolio" actions={
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => nav("/portfolio/projects")}>
            <ArrowLeft className="w-3 h-3 mr-1" /> Back
          </Button>
        } />
        <div className="p-6 text-sm text-muted-foreground">This portfolio project does not exist or was removed.</div>
      </div>
    );
  }

  const dur = durationDays(project.startDate, project.endDate);
  const pm = peopleById(project.projectManagerId);
  const publicUrl = `${window.location.origin}/portfolio/p/${project.slug}`;

  function exportPdf() {
    // Build a clean print view in a new window
    const w = window.open("", "_blank", "width=900,height=1100");
    if (!w) return toast({ title: "Popup blocked", variant: "destructive" });
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>${project.title}</title>
      <style>
        body{font-family:Inter,system-ui,sans-serif;color:#0f172a;max-width:780px;margin:40px auto;padding:0 24px;line-height:1.55;}
        h1{font-size:28px;margin:0 0 4px;letter-spacing:-0.5px}
        h2{font-size:14px;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;margin-top:28px;border-bottom:1px solid #e2e8f0;padding-bottom:6px}
        .pill{display:inline-block;padding:2px 8px;border-radius:4px;background:#e2e8f0;font-size:11px;margin-right:4px}
        .meta{color:#64748b;font-size:13px;margin-bottom:24px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;font-size:13px}
        .grid div b{color:#475569;font-weight:600}
        ul{padding-left:18px}
        .feat{border-left:3px solid #2563eb;padding:4px 12px;margin:6px 0;background:#f8fafc}
      </style></head><body>
      <h1>${esc(project.title)}</h1>
      <div class="meta">${esc(project.domain)} · ${esc(project.category)} · ${esc(project.status)}</div>
      <div>${project.tags.map((t) => `<span class="pill">${esc(t)}</span>`).join("")}</div>

      <h2>Executive Summary</h2><p>${esc(project.shortDescription)}</p>
      <h2>Detailed Description</h2><p>${esc(project.detailedDescription)}</p>
      <h2>Problem</h2><p>${esc(project.problemStatement)}</p>
      <h2>Solution</h2><p>${esc(project.solutionProvided)}</p>

      <h2>Key Features</h2>
      ${project.features.map((f) => `<div class="feat"><b>${esc(f.icon ?? "")} ${esc(f.title)}</b><br/>${esc(f.description)}</div>`).join("")}

      <h2>Technical Stack</h2>
      <div class="grid">
        <div><b>Architecture:</b> ${esc(project.architecture)}</div>
        <div><b>Database:</b> ${esc(project.database)}</div>
        <div><b>Hosting:</b> ${esc(project.hostingProvider ?? "—")}</div>
        <div><b>DB Location:</b> ${esc(project.databaseLocation ?? "—")}</div>
      </div>
      <p><b>Tech:</b> ${project.techStack.join(", ")}</p>
      <p><b>Integrations:</b> ${project.integrations.join(", ") || "—"}</p>

      <h2>Client</h2>
      <div class="grid">
        <div><b>Name:</b> ${esc(project.clientName)}</div>
        <div><b>Company:</b> ${esc(project.clientCompany ?? "—")}</div>
        <div><b>Country:</b> ${esc(project.clientCountry ?? "—")}</div>
        <div><b>NDA:</b> ${project.ndaSigned ? "Signed" : "—"}</div>
      </div>

      <h2>Status & Metrics</h2>
      <div class="grid">
        <div><b>Start:</b> ${esc(project.startDate)}</div>
        <div><b>End:</b> ${esc(project.endDate ?? "—")}</div>
        <div><b>Duration:</b> ${dur ?? "—"} days</div>
        <div><b>Budget:</b> ${project.budget ? inr(project.budget) : "—"}</div>
        <div><b>Revenue:</b> ${project.revenue ? inr(project.revenue) : "—"}</div>
        <div><b>Performance:</b> ${project.metrics.performanceScore ?? "—"}</div>
        <div><b>Users:</b> ${project.metrics.users?.toLocaleString() ?? "—"}</div>
        <div><b>Satisfaction:</b> ${project.metrics.satisfactionScore ?? "—"} / 5</div>
      </div>
      <script>setTimeout(()=>window.print(),300)</script>
    </body></html>`);
    w.document.close();
  }

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader
        title={project.title}
        subtitle={`${project.domain} · ${project.category} · updated ${project.updatedAt.slice(0, 10)}`}
        accentVar="--mod-portfolio"
        actions={
          <>
            <StatusPill variant={portfolioStatusVariant(project.status)}>{project.status}</StatusPill>
            <select
              value={project.status}
              onChange={(e) => setStatus(project.id, e.target.value as PortfolioStatus)}
              className="h-7 px-2 rounded-sm bg-background border border-border text-xs"
            >
              {ALL_PORTFOLIO_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={exportPdf}>
              <Download className="w-3 h-3" /> Export PDF
            </Button>
            {project.isPublic && (
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => {
                navigator.clipboard.writeText(publicUrl);
                toast({ title: "Public link copied" });
              }}>
                <Copy className="w-3 h-3" /> Share Link
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => nav(-1)}>
              <ArrowLeft className="w-3 h-3 mr-1" /> Back
            </Button>
          </>
        }
      />

      <div className="p-3 flex-1">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-7 max-w-4xl text-xs">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tech">Tech</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="proposals">Proposals ({linkedProposals.length})</TabsTrigger>
            <TabsTrigger value="letters">Cover Letters ({linkedCoverLetters.length})</TabsTrigger>
            <TabsTrigger value="audit">Activity / Versions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <Card title="Short Description"><p className="text-sm leading-relaxed">{project.shortDescription}</p></Card>
                <Card title="Detailed Description"><p className="text-sm leading-relaxed whitespace-pre-wrap">{project.detailedDescription}</p></Card>
                <div className="grid grid-cols-2 gap-4">
                  <Card title="Problem"><p className="text-sm whitespace-pre-wrap">{project.problemStatement}</p></Card>
                  <Card title="Solution"><p className="text-sm whitespace-pre-wrap">{project.solutionProvided}</p></Card>
                </div>
                <Card title="Key Features">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {project.features.map((f) => (
                      <div key={f.id} className="border border-border rounded-sm p-2.5 bg-surface">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{f.icon}</span>
                          <span className="text-sm font-semibold">{f.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{f.description}</p>
                      </div>
                    ))}
                    {project.features.length === 0 && <p className="text-xs text-muted-foreground">No features captured.</p>}
                  </div>
                </Card>
              </div>

              <div className="space-y-4">
                <Card title="Client">
                  <KV k="Name" v={project.clientName} />
                  <KV k="Company" v={project.clientCompany} />
                  <KV k="Country" v={project.clientCountry} />
                  <KV k="Email" v={project.clientEmail} />
                  <KV k="NDA" v={project.ndaSigned ? "Signed" : "—"} />
                  <KV k="Public" v={project.isPublic ? "Yes" : "No"} />
                </Card>
                <Card title="Links">
                  <Lnk icon={<Globe className="w-3 h-3" />} label="Production" href={project.productionUrl} />
                  <Lnk icon={<Globe className="w-3 h-3" />} label="Staging" href={project.stagingUrl} />
                  <Lnk icon={<Github className="w-3 h-3" />} label="Repo" href={project.repoUrl} />
                  <Lnk icon={<Database className="w-3 h-3" />} label="API" href={project.apiBaseUrl} />
                  <Lnk icon={<Server className="w-3 h-3" />} label="Admin" href={project.adminPanelUrl} />
                </Card>
                <Card title="Tags">
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((t) => <span key={t} className="text-xs px-1.5 py-0.5 bg-muted rounded-sm">#{t}</span>)}
                    {project.tags.length === 0 && <span className="text-xs text-muted-foreground">None</span>}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tech" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
              <Card title="Stack & Architecture">
                <KV k="Architecture" v={project.architecture} />
                <KV k="Database" v={project.database} />
                <KV k="Hosting" v={project.hostingProvider} />
                <KV k="DB Location" v={project.databaseLocation} />
                <div className="mt-3">
                  <div className="text-2xs uppercase text-muted-foreground mb-1">Tech Stack</div>
                  <div className="flex flex-wrap gap-1">{project.techStack.map((t) => <span key={t} className="text-xs px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary border border-primary/20">{t}</span>)}</div>
                </div>
              </Card>
              <Card title="APIs & Integrations">
                <div className="text-2xs uppercase text-muted-foreground mb-1">APIs</div>
                <ul className="text-sm space-y-1 list-disc pl-4 mb-3">{project.apis.map((a) => <li key={a}>{a}</li>)}{project.apis.length === 0 && <li className="text-muted-foreground list-none">—</li>}</ul>
                <div className="text-2xs uppercase text-muted-foreground mb-1">Integrations</div>
                <ul className="text-sm space-y-1 list-disc pl-4">{project.integrations.map((a) => <li key={a}>{a}</li>)}{project.integrations.length === 0 && <li className="text-muted-foreground list-none">—</li>}</ul>
              </Card>
              <Card title="Server / Infra">
                <KV k="Internal Repo" v={project.internalRepoPath} mono />
                <KV k="Server" v={project.serverDetails} mono />
                <KV k="CI/CD" v={project.cicdInfo} />
              </Card>
              <Card title="External Resources">
                <ul className="text-sm space-y-1">{project.externalResources.map((r) => <li key={r}><a href={r} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">{r} <ExternalLink className="w-3 h-3" /></a></li>)}{project.externalResources.length === 0 && <li className="text-muted-foreground">—</li>}</ul>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
              <Card title="Project Manager">{pm ? <PersonRow id={pm.id} /> : <p className="text-xs text-muted-foreground">Not assigned</p>}</Card>
              <Card title="Developers"><PeopleList ids={project.developerIds} /></Card>
              <Card title="Designers"><PeopleList ids={project.designerIds} /></Card>
              <Card title="QA / Testers"><PeopleList ids={project.qaIds} /></Card>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl">
              <Metric label="Performance" value={project.metrics.performanceScore} suffix="" />
              <Metric label="Users" value={project.metrics.users} format="num" />
              <Metric label="Monthly Traffic" value={project.metrics.monthlyTraffic} format="num" />
              <Metric label="Conv. Rate" value={project.metrics.conversionRate} suffix="%" />
              <Metric label="CSAT" value={project.metrics.satisfactionScore} suffix="/5" />
              <Metric label="Uptime" value={project.metrics.uptimePercent} suffix="%" />
              <Metric label="Budget" value={project.budget} format="inr" />
              <Metric label="Revenue" value={project.revenue} format="inr" />
            </div>
            <div className="mt-4 max-w-4xl">
              <Card title="Timeline">
                <KV k="Start" v={project.startDate} />
                <KV k="End" v={project.endDate ?? "Ongoing"} />
                <KV k="Duration" v={dur != null ? `${dur} days` : "—"} />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="proposals" className="mt-4">
            <Card title="Proposals from Sales module" right={<Link to="/sales/proposals/new" className="text-2xs text-primary hover:underline">Create in Sales →</Link>}>
              {linkedProposals.length === 0 ? (
                <p className="text-xs text-muted-foreground">No proposals linked. From the Sales module, edit a proposal and set its <b>Linked Portfolio Project</b> to this one.</p>
              ) : (
                <div className="divide-y divide-border">
                  {linkedProposals.map((p) => (
                    <Link key={p.id} to={`/sales/proposals/${p.id}`} className="flex items-center justify-between py-2 hover:bg-surface-hover px-1 rounded-sm">
                      <div>
                        <div className="text-sm font-medium flex items-center gap-2"><FileText className="w-3 h-3 text-muted-foreground" /> {p.title}</div>
                        <div className="text-2xs text-muted-foreground font-mono">{p.number} · {p.proposalDate}</div>
                      </div>
                      <div className="text-right">
                        <StatusPill variant="info">{p.status}</StatusPill>
                        <div className="font-mono text-xs mt-1">{inr(p.lineItems.reduce((s, li) => s + li.qty * li.rate, 0))}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="letters" className="mt-4">
            <Card title="Linked Cover Letters" right={
              <Link to={`/portfolio/cover-letters/new?projectId=${project.id}`} className="text-2xs text-primary hover:underline">+ New cover letter</Link>
            }>
              {linkedCoverLetters.length === 0 ? (
                <p className="text-xs text-muted-foreground">No cover letters linked yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {linkedCoverLetters.map((c) => (
                    <Link key={c.id} to={`/portfolio/cover-letters/${c.id}`} className="flex items-center justify-between py-2 hover:bg-surface-hover px-1 rounded-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">{c.title}</div>
                          <div className="text-2xs text-muted-foreground">To: {c.recipientName}{c.recipientCompany ? ` · ${c.recipientCompany}` : ""}</div>
                        </div>
                      </div>
                      <StatusPill variant={c.status === "Sent" ? "success" : c.status === "Draft" ? "neutral" : "warning"}>{c.status}</StatusPill>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
              <Card title="Activity Log">
                <ul className="space-y-1.5 max-h-[420px] overflow-auto">
                  {project.activityLogs.map((l) => {
                    const who = peopleById(l.byId);
                    return (
                      <li key={l.id} className="text-xs border-l-2 border-primary/40 pl-2 py-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{l.action}</span>
                          <span className="text-2xs text-muted-foreground font-mono">{new Date(l.at).toLocaleString()}</span>
                        </div>
                        <div className="text-2xs text-muted-foreground">by {who?.name ?? l.byId}{l.field ? ` · field: ${l.field}` : ""}</div>
                      </li>
                    );
                  })}
                </ul>
              </Card>
              <Card title="Version History" right={
                <div className="flex gap-1">
                  <Input className="h-7 text-xs w-40" placeholder="Note (optional)" value={versionNote} onChange={(e) => setVersionNote(e.target.value)} />
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { saveVersion(project.id, "p1", versionNote); setVersionNote(""); toast({ title: "Version saved" }); }}>
                    <Save className="w-3 h-3" /> Save
                  </Button>
                </div>
              }>
                <ul className="space-y-1.5 max-h-[420px] overflow-auto">
                  {project.versions.map((v) => (
                    <li key={v.id} className="flex items-center justify-between border border-border rounded-sm px-2 py-1.5 text-xs">
                      <div>
                        <div className="font-medium">v{v.version} {v.note ? <span className="text-muted-foreground font-normal">— {v.note}</span> : null}</div>
                        <div className="text-2xs text-muted-foreground font-mono">{new Date(v.savedAt).toLocaleString()}</div>
                      </div>
                      <Button size="sm" variant="outline" className="h-6 text-2xs gap-1" onClick={() => { rollback(project.id, v.id); toast({ title: `Rolled back to v${v.version}` }); }}>
                        <History className="w-3 h-3" /> Rollback
                      </Button>
                    </li>
                  ))}
                  {project.versions.length === 0 && <p className="text-xs text-muted-foreground">No saved versions yet.</p>}
                </ul>
              </Card>

              <Card title="Quick Inline Edit" className="md:col-span-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-2xs text-muted-foreground">Short description</label>
                    <Textarea className="text-xs min-h-[60px]" defaultValue={project.shortDescription} onBlur={(e) => updateProject(project.id, { shortDescription: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-2xs text-muted-foreground">Production URL</label>
                    <Input className="h-8 text-xs" defaultValue={project.productionUrl ?? ""} onBlur={(e) => updateProject(project.id, { productionUrl: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end pt-3">
                  <Button variant="outline" size="sm" className="h-7 text-xs text-destructive gap-1" onClick={() => {
                    if (confirm("Delete this project? This cannot be undone.")) {
                      removeProject(project.id);
                      toast({ title: "Project deleted" });
                      nav("/portfolio/projects");
                    }
                  }}>
                    <Trash2 className="w-3 h-3" /> Delete project
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ───── helpers ─────
function esc(s: string | undefined | null) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
function Card({ title, right, children, className = "" }: { title: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-surface border border-border rounded-sm p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}
function KV({ k, v, mono = false }: { k: string; v?: string | number | null; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1 border-b border-border/40 last:border-0 text-xs">
      <span className="text-muted-foreground">{k}</span>
      <span className={`text-right ${mono ? "font-mono text-2xs" : ""}`}>{v ?? "—"}</span>
    </div>
  );
}
function Lnk({ icon, label, href }: { icon: React.ReactNode; label: string; href?: string }) {
  if (!href) return <KV k={label} v="—" />;
  return (
    <div className="flex items-center justify-between gap-3 py-1 border-b border-border/40 last:border-0 text-xs">
      <span className="text-muted-foreground flex items-center gap-1.5">{icon}{label}</span>
      <a href={href} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate max-w-[200px] inline-flex items-center gap-1">{href} <ExternalLink className="w-3 h-3" /></a>
    </div>
  );
}
function PersonRow({ id }: { id: string }) {
  const p = PEOPLE.find((x) => x.id === id);
  if (!p) return null;
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="w-7 h-7 rounded-full bg-primary/15 text-primary text-2xs font-semibold flex items-center justify-center">{p.initials}</div>
      <div>
        <div className="text-sm font-medium">{p.name}</div>
        <div className="text-2xs text-muted-foreground">{p.dept}</div>
      </div>
    </div>
  );
}
function PeopleList({ ids }: { ids: string[] }) {
  if (ids.length === 0) return <p className="text-xs text-muted-foreground">No one assigned.</p>;
  return <div className="space-y-1">{ids.map((id) => <PersonRow key={id} id={id} />)}</div>;
}
function Metric({ label, value, suffix = "", format }: { label: string; value?: number; suffix?: string; format?: "num" | "inr" }) {
  const display = value == null ? "—"
    : format === "inr" ? inr(value)
    : format === "num" ? value.toLocaleString("en-IN")
    : `${value}${suffix}`;
  return (
    <div className="bg-surface border border-border rounded-sm p-3">
      <div className="text-2xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold mt-1 font-mono">{display}{format ? "" : ""}</div>
    </div>
  );
}

// Avoid unused warnings
void Briefcase; void Sparkles;

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePortfolioStore } from "@/store/portfolioStore";
import { useToast } from "@/hooks/use-toast";

export default function CoverLetterNew() {
  const nav = useNavigate();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const initialProjectId = params.get("projectId") ?? "";

  const templates = usePortfolioStore((s) => s.templates);
  const projects = usePortfolioStore((s) => s.projects);
  const addCoverLetter = usePortfolioStore((s) => s.addCoverLetter);

  const [templateId, setTemplateId] = useState<string>(templates[0]?.id ?? "");
  const [projectId, setProjectId] = useState<string>(initialProjectId);
  const [title, setTitle] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientCompany, setRecipientCompany] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [body, setBody] = useState("");

  const project = useMemo(() => projects.find((p) => p.id === projectId), [projects, projectId]);
  const template = useMemo(() => templates.find((t) => t.id === templateId), [templates, templateId]);

  // Auto-fill body from template + project tokens
  useEffect(() => {
    if (!template) return;
    const r = (s: string, k: string, v: string) => s.split(k).join(v);
    let out = template.body;
    out = r(out, "{{recipient_name}}", recipientName || "[Recipient]");
    out = r(out, "{{recipient_company}}", recipientCompany || project?.clientCompany || "[Company]");
    out = r(out, "{{project_title}}", project?.title ?? "[Project]");
    out = r(out, "{{related_project}}", project?.title ?? "[Related Project]");
    out = r(out, "{{problem}}", project?.problemStatement ?? "[Problem]");
    out = r(out, "{{value_prop}}", project?.shortDescription ?? "[Value]");
    out = r(out, "{{agency_name}}", "Your Agency");
    out = r(out, "{{sender_name}}", "Project Manager");
    out = r(out, "{{metric}}", "3x");
    out = r(out, "{{calendar_link}}", "https://cal.com/your-agency");
    setBody(out);
    if (!title && project) setTitle(`${project.title} — Cover Letter`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, projectId]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !recipientName.trim()) return toast({ title: "Title & recipient required", variant: "destructive" });
    const id = addCoverLetter({
      title, body, templateId, portfolioProjectId: projectId || undefined,
      recipientName, recipientCompany, recipientEmail, status: "Draft",
    });
    toast({ title: "Cover letter created" });
    nav(`/portfolio/cover-letters/${id}`);
  }

  const sel = "h-8 w-full px-2 rounded-sm bg-background border border-border text-xs";

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title="New Cover Letter" subtitle="Pick a template, link a project, customise" accentVar="--mod-portfolio"
        actions={<Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => nav(-1)}>Cancel</Button>} />

      <form onSubmit={submit} className="p-3 grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-4 max-w-6xl">
        <aside className="space-y-3">
          <div>
            <Label className="text-2xs">Template</Label>
            <select className={sel} value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.tone}</option>)}
            </select>
            {template && <p className="text-2xs text-muted-foreground mt-1">{template.description}</p>}
          </div>
          <div>
            <Label className="text-2xs">Linked Project</Label>
            <select className={sel} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">— None —</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div><Label className="text-2xs">Title</Label><Input className="h-8 text-xs" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label className="text-2xs">Recipient Name</Label><Input className="h-8 text-xs" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} /></div>
          <div><Label className="text-2xs">Recipient Company</Label><Input className="h-8 text-xs" value={recipientCompany} onChange={(e) => setRecipientCompany(e.target.value)} /></div>
          <div><Label className="text-2xs">Recipient Email</Label><Input className="h-8 text-xs" type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} /></div>
          <Button type="submit" size="sm" className="w-full h-8 text-xs">Create Letter</Button>
        </aside>

        <div>
          <Label className="text-2xs">Letter Body</Label>
          <Textarea className="text-sm min-h-[520px] font-serif leading-relaxed" value={body} onChange={(e) => setBody(e.target.value)} />
          <p className="text-2xs text-muted-foreground mt-1">Tokens auto-filled from template + linked project. Edit freely.</p>
        </div>
      </form>
    </div>
  );
}

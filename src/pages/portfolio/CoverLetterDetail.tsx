import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Send, History, Trash2, Save } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusPill } from "@/components/ui/StatusPill";
import { usePortfolioStore } from "@/store/portfolioStore";
import { useToast } from "@/hooks/use-toast";

export default function CoverLetterDetail() {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const { toast } = useToast();

  const letters = usePortfolioStore((s) => s.coverLetters);
  const projects = usePortfolioStore((s) => s.projects);
  const update = usePortfolioStore((s) => s.updateCoverLetter);
  const remove = usePortfolioStore((s) => s.removeCoverLetter);
  const rollback = usePortfolioStore((s) => s.rollbackCoverLetter);

  const letter = useMemo(() => letters.find((c) => c.id === id), [letters, id]);
  const [body, setBody] = useState(letter?.body ?? "");
  const [title, setTitle] = useState(letter?.title ?? "");

  if (!letter) {
    return (
      <div className="flex flex-col min-h-full">
        <ModuleHeader title="Cover letter not found" accentVar="--mod-portfolio"
          actions={<Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => nav("/portfolio/cover-letters")}><ArrowLeft className="w-3 h-3 mr-1" /> Back</Button>} />
      </div>
    );
  }

  const project = projects.find((p) => p.id === letter.portfolioProjectId);

  function save() {
    update(letter!.id, { body, title }, "p1");
    toast({ title: "Saved" });
  }

  function exportTxt() {
    const blob = new Blob([body], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title || "cover-letter"}.txt`;
    a.click();
  }

  function exportDoc() {
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset="utf-8"></head><body><pre style="font-family:Georgia,serif;white-space:pre-wrap;font-size:13px">${body.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!))}</pre></body></html>`;
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title || "cover-letter"}.doc`;
    a.click();
  }

  function exportPdf() {
    const w = window.open("", "_blank", "width=900,height=1100");
    if (!w) return toast({ title: "Popup blocked", variant: "destructive" });
    w.document.write(`<!doctype html><html><head><title>${title}</title><style>body{font-family:Georgia,serif;max-width:720px;margin:60px auto;padding:0 40px;line-height:1.7;color:#0f172a;white-space:pre-wrap;font-size:14px}</style></head><body>${body.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!))}<script>setTimeout(()=>window.print(),200)</script></body></html>`);
    w.document.close();
  }

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader
        title={letter.title}
        subtitle={`To ${letter.recipientName}${letter.recipientCompany ? ` · ${letter.recipientCompany}` : ""}`}
        accentVar="--mod-portfolio"
        actions={
          <>
            <StatusPill variant={letter.status === "Sent" ? "success" : letter.status === "Draft" ? "neutral" : "warning"}>{letter.status}</StatusPill>
            <select value={letter.status} onChange={(e) => update(letter.id, { status: e.target.value as typeof letter.status })} className="h-7 px-2 rounded-sm bg-background border border-border text-xs">
              <option>Draft</option><option>Sent</option><option>Archived</option>
            </select>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={save}><Save className="w-3 h-3" /> Save</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={exportPdf}><Download className="w-3 h-3" /> PDF</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={exportDoc}>.DOC</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={exportTxt}>.TXT</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => nav(-1)}><ArrowLeft className="w-3 h-3 mr-1" /> Back</Button>
          </>
        }
      />

      <div className="p-3 grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-4 max-w-6xl">
        <div className="space-y-3">
          <div>
            <Label className="text-2xs">Title</Label>
            <Input className="h-8 text-sm font-medium" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label className="text-2xs">Body</Label>
            <Textarea className="text-sm min-h-[560px] font-serif leading-relaxed" value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          {project && (
            <div className="text-2xs text-muted-foreground">
              Linked to project: <Link to={`/portfolio/projects/${project.id}`} className="text-primary hover:underline">{project.title}</Link>
            </div>
          )}
        </div>

        <aside className="space-y-3">
          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1.5"><Send className="w-3 h-3" /> Recipient</h3>
            <div className="space-y-2">
              <Input className="h-8 text-xs" defaultValue={letter.recipientName} onBlur={(e) => update(letter.id, { recipientName: e.target.value })} />
              <Input className="h-8 text-xs" placeholder="Company" defaultValue={letter.recipientCompany ?? ""} onBlur={(e) => update(letter.id, { recipientCompany: e.target.value })} />
              <Input className="h-8 text-xs" type="email" placeholder="Email" defaultValue={letter.recipientEmail ?? ""} onBlur={(e) => update(letter.id, { recipientEmail: e.target.value })} />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1.5"><History className="w-3 h-3" /> Version History</h3>
            <ul className="space-y-1.5 max-h-[320px] overflow-auto">
              {letter.versions.map((v) => (
                <li key={v.id} className="text-xs border border-border rounded-sm px-2 py-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xs text-muted-foreground">{new Date(v.at).toLocaleString()}</span>
                    <button className="text-2xs text-primary hover:underline" onClick={() => { rollback(letter.id, v.id); setBody(v.body); toast({ title: "Restored" }); }}>Restore</button>
                  </div>
                  <p className="text-2xs text-muted-foreground line-clamp-2 mt-1">{v.body}</p>
                </li>
              ))}
              {letter.versions.length === 0 && <p className="text-xs text-muted-foreground">No previous versions yet.</p>}
            </ul>
          </div>

          <Button variant="outline" size="sm" className="w-full h-8 text-xs text-destructive gap-1" onClick={() => {
            if (confirm("Delete this cover letter?")) { remove(letter.id); nav("/portfolio/cover-letters"); }
          }}><Trash2 className="w-3 h-3" /> Delete</Button>
        </aside>
      </div>
    </div>
  );
}

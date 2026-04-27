import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Mail } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/StatusPill";
import { usePortfolioStore } from "@/store/portfolioStore";

export default function CoverLetters() {
  const letters = usePortfolioStore((s) => s.coverLetters);
  const projects = usePortfolioStore((s) => s.projects);
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    let out = letters;
    if (q) {
      const s = q.toLowerCase();
      out = out.filter((c) => c.title.toLowerCase().includes(s) || c.recipientName.toLowerCase().includes(s));
    }
    return [...out].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [letters, q]);

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader
        title="Cover Letters"
        subtitle={`${letters.length} letters · template-driven, version-controlled`}
        accentVar="--mod-portfolio"
        actions={
          <Link to="/portfolio/cover-letters/new"><Button size="sm" className="h-7 text-xs gap-1"><Plus className="w-3 h-3" /> New Letter</Button></Link>
        }
      />
      <div className="h-10 px-3 flex items-center gap-2 border-b border-border bg-surface/50 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-7 pl-7 w-56 text-xs" />
        </div>
        <Link to="/portfolio/cover-letters/templates" className="ml-auto text-2xs text-primary hover:underline">Manage Templates →</Link>
      </div>
      <div className="p-3 flex-1">
        <div className="bg-surface border border-border rounded-sm overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40">
              <tr className="text-2xs uppercase text-muted-foreground tracking-wider">
                <th className="text-left px-3 h-8 font-medium">Title</th>
                <th className="text-left px-3 h-8 font-medium">Recipient</th>
                <th className="text-left px-3 h-8 font-medium">Linked Project</th>
                <th className="text-left px-3 h-8 font-medium">Status</th>
                <th className="text-left px-3 h-8 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const project = projects.find((p) => p.id === c.portfolioProjectId);
                return (
                  <tr key={c.id} className="border-t border-border hover:bg-surface-hover">
                    <td className="px-3 h-10">
                      <Link to={`/portfolio/cover-letters/${c.id}`} className="font-medium hover:text-primary inline-flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-muted-foreground" />{c.title}
                      </Link>
                    </td>
                    <td className="px-3 h-10">{c.recipientName}{c.recipientCompany ? ` · ${c.recipientCompany}` : ""}</td>
                    <td className="px-3 h-10 text-muted-foreground">{project ? <Link to={`/portfolio/projects/${project.id}`} className="hover:text-primary">{project.title}</Link> : "—"}</td>
                    <td className="px-3 h-10"><StatusPill variant={c.status === "Sent" ? "success" : c.status === "Draft" ? "neutral" : "warning"}>{c.status}</StatusPill></td>
                    <td className="px-3 h-10 font-mono text-2xs text-muted-foreground">{c.updatedAt.slice(0, 10)}</td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No cover letters yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, LayoutGrid, List as ListIcon, Sparkles, Briefcase } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  usePortfolioStore,
  ALL_PORTFOLIO_STATUSES,
  ALL_DOMAINS,
  portfolioStatusVariant,
  peopleById,
  type PortfolioStatus,
  type DomainArea,
} from "@/store/portfolioStore";
import { inr } from "@/lib/mockData";

export default function PortfolioProjects() {
  const projects = usePortfolioStore((s) => s.projects);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<PortfolioStatus | "all">("all");
  const [domain, setDomain] = useState<DomainArea | "all">("all");

  const rows = useMemo(() => {
    let out = projects;
    if (q) {
      const s = q.toLowerCase();
      out = out.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          p.clientName.toLowerCase().includes(s) ||
          p.tags.some((t) => t.toLowerCase().includes(s)),
      );
    }
    if (status !== "all") out = out.filter((p) => p.status === status);
    if (domain !== "all") out = out.filter((p) => p.domain === domain);
    return [...out].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [projects, q, status, domain]);

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader
        title="Portfolio · Projects"
        subtitle={`${projects.length} projects · agency case-study library`}
        accentVar="--mod-portfolio"
        actions={
          <Link to="/portfolio/projects/new">
            <Button size="sm" className="h-7 text-xs gap-1">
              <Plus className="w-3.5 h-3.5" /> New Project
            </Button>
          </Link>
        }
      />

      <div className="h-10 px-3 flex items-center gap-2 border-b border-border bg-surface/50 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, client, tag…" className="h-7 pl-7 w-64 text-xs" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as PortfolioStatus | "all")} className="h-7 px-2 rounded-sm bg-background border border-border text-xs">
          <option value="all">All Status</option>
          {ALL_PORTFOLIO_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={domain} onChange={(e) => setDomain(e.target.value as DomainArea | "all")} className="h-7 px-2 rounded-sm bg-background border border-border text-xs">
          <option value="all">All Domains</option>
          {ALL_DOMAINS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <div className="flex-1" />
        <div className="flex items-center gap-1 border border-border rounded-sm p-0.5">
          <button onClick={() => setView("grid")} className={`h-6 px-2 rounded-sm flex items-center gap-1 ${view === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
            <LayoutGrid className="w-3 h-3" /> Grid
          </button>
          <button onClick={() => setView("table")} className={`h-6 px-2 rounded-sm flex items-center gap-1 ${view === "table" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
            <ListIcon className="w-3 h-3" /> Table
          </button>
        </div>
      </div>

      <div className="p-3 flex-1">
        {view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rows.map((p) => {
              const pm = peopleById(p.projectManagerId);
              return (
                <Link key={p.id} to={`/portfolio/projects/${p.id}`} className="group bg-surface border border-border rounded-md overflow-hidden hover:border-primary/50 hover:shadow-sm transition-all flex flex-col">
                  <div className="aspect-[16/9] bg-gradient-to-br from-module-portfolio/15 via-primary/5 to-accent/10 flex items-center justify-center relative">
                    {p.thumbnailUrl ? (
                      <img src={p.thumbnailUrl} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <Briefcase className="w-10 h-10 text-module-portfolio/40" />
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <StatusPill variant={portfolioStatusVariant(p.status)}>{p.status}</StatusPill>
                    </div>
                    {p.isPublic && (
                      <div className="absolute bottom-2 left-2">
                        <span className="text-[9px] uppercase tracking-wider bg-success/20 text-success px-1.5 py-0.5 rounded-sm border border-success/30">Public</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold leading-tight group-hover:text-primary truncate">{p.title}</h3>
                    </div>
                    <p className="text-2xs text-muted-foreground mt-0.5">{p.domain} · {p.category}</p>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{p.shortDescription}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.techStack.slice(0, 4).map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 bg-muted rounded-sm">{t}</span>
                      ))}
                      {p.techStack.length > 4 && <span className="text-[10px] text-muted-foreground">+{p.techStack.length - 4}</span>}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border text-2xs text-muted-foreground">
                      <span>{p.clientCompany ?? p.clientName}</span>
                      <span className="font-mono">{p.budget ? inr(p.budget) : "—"}</span>
                    </div>
                    {pm && <div className="text-[10px] text-muted-foreground mt-1">PM: {pm.name}</div>}
                  </div>
                </Link>
              );
            })}
            {rows.length === 0 && (
              <div className="col-span-full text-center py-16 text-muted-foreground text-sm">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No projects match your filters.
              </div>
            )}
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-sm overflow-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40">
                <tr className="text-2xs uppercase text-muted-foreground tracking-wider">
                  <th className="text-left px-3 h-8 font-medium">Title</th>
                  <th className="text-left px-3 h-8 font-medium">Domain</th>
                  <th className="text-left px-3 h-8 font-medium">Client</th>
                  <th className="text-left px-3 h-8 font-medium">Stack</th>
                  <th className="text-left px-3 h-8 font-medium">Status</th>
                  <th className="text-right px-3 h-8 font-medium">Budget</th>
                  <th className="text-right px-3 h-8 font-medium">Revenue</th>
                  <th className="text-left px-3 h-8 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-surface-hover">
                    <td className="px-3 h-10">
                      <Link to={`/portfolio/projects/${p.id}`} className="font-medium hover:text-primary">{p.title}</Link>
                    </td>
                    <td className="px-3 h-10">{p.domain}</td>
                    <td className="px-3 h-10">{p.clientCompany ?? p.clientName}</td>
                    <td className="px-3 h-10 text-muted-foreground truncate max-w-[180px]">{p.techStack.slice(0, 3).join(", ")}</td>
                    <td className="px-3 h-10"><StatusPill variant={portfolioStatusVariant(p.status)}>{p.status}</StatusPill></td>
                    <td className="px-3 h-10 text-right font-mono">{p.budget ? inr(p.budget) : "—"}</td>
                    <td className="px-3 h-10 text-right font-mono">{p.revenue ? inr(p.revenue) : "—"}</td>
                    <td className="px-3 h-10 font-mono text-2xs text-muted-foreground">{p.updatedAt.slice(0, 10)}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No projects match</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

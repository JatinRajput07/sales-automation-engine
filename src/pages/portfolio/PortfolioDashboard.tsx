import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Briefcase, TrendingUp, Users, FileText, Sparkles } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/StatusPill";
import { usePortfolioStore, portfolioStatusVariant } from "@/store/portfolioStore";
import { useSalesStore } from "@/store/salesStore";
import { inr } from "@/lib/mockData";

export default function PortfolioDashboard() {
  const projects = usePortfolioStore((s) => s.projects);
  const coverLetters = usePortfolioStore((s) => s.coverLetters);
  const proposals = useSalesStore((s) => s.proposals);

  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status === "Active").length;
    const completed = projects.filter((p) => p.status === "Completed").length;
    const totalRevenue = projects.reduce((s, p) => s + (p.revenue ?? 0), 0);
    const totalUsers = projects.reduce((s, p) => s + (p.metrics.users ?? 0), 0);
    const linkedProposals = proposals.filter((p) => p.portfolioProjectId).length;
    return { active, completed, totalRevenue, totalUsers, linkedProposals };
  }, [projects, proposals]);

  const recent = [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader
        title="Portfolio Dashboard"
        subtitle="Agency case-study library, client projects & cover letters"
        accentVar="--mod-portfolio"
        actions={<Link to="/portfolio/projects/new"><Button size="sm" className="h-7 text-xs gap-1"><Sparkles className="w-3 h-3" /> New Project</Button></Link>}
      />
      <div className="p-3 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Stat icon={<Briefcase className="w-4 h-4" />} label="Total Projects" value={projects.length.toString()} />
          <Stat icon={<TrendingUp className="w-4 h-4 text-success" />} label="Active" value={stats.active.toString()} />
          <Stat icon={<TrendingUp className="w-4 h-4" />} label="Completed" value={stats.completed.toString()} />
          <Stat icon={<Users className="w-4 h-4" />} label="Total Users Reached" value={stats.totalUsers.toLocaleString("en-IN")} />
          <Stat icon={<FileText className="w-4 h-4 text-primary" />} label="Linked Proposals" value={stats.linkedProposals.toString()} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 bg-surface border border-border rounded-sm">
            <div className="px-3 h-9 flex items-center justify-between border-b border-border">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Projects</h2>
              <Link to="/portfolio/projects" className="text-2xs text-primary hover:underline">View all →</Link>
            </div>
            <div className="divide-y divide-border">
              {recent.map((p) => (
                <Link key={p.id} to={`/portfolio/projects/${p.id}`} className="flex items-center justify-between px-3 py-2 hover:bg-surface-hover">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{p.title}</div>
                    <div className="text-2xs text-muted-foreground truncate">{p.domain} · {p.clientCompany ?? p.clientName}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusPill variant={portfolioStatusVariant(p.status)}>{p.status}</StatusPill>
                    <span className="font-mono text-xs text-muted-foreground">{p.revenue ? inr(p.revenue) : "—"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-sm">
            <div className="px-3 h-9 flex items-center justify-between border-b border-border">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cover Letters</h2>
              <Link to="/portfolio/cover-letters" className="text-2xs text-primary hover:underline">Manage →</Link>
            </div>
            <div className="divide-y divide-border">
              {coverLetters.slice(0, 6).map((c) => (
                <Link key={c.id} to={`/portfolio/cover-letters/${c.id}`} className="flex items-center justify-between px-3 py-2 hover:bg-surface-hover">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{c.title}</div>
                    <div className="text-2xs text-muted-foreground truncate">To: {c.recipientName}</div>
                  </div>
                  <StatusPill variant={c.status === "Sent" ? "success" : "neutral"}>{c.status}</StatusPill>
                </Link>
              ))}
              {coverLetters.length === 0 && <p className="px-3 py-4 text-xs text-muted-foreground">No cover letters yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-surface border border-border rounded-sm p-3">
      <div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-2xs uppercase tracking-wider">{label}</span></div>
      <div className="text-2xl font-semibold mt-1 font-mono tracking-tight">{value}</div>
    </div>
  );
}

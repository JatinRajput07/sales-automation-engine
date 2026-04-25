import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/StatusPill";
import { KpiCard } from "@/components/ui/KpiCard";
import { useSalesStore } from "@/store/salesStore";
import { PEOPLE, inr } from "@/lib/mockData";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

export default function SourceDetail() {
  const { id } = useParams();
  const sources = useSalesStore((s) => s.sources);
  const allLeads = useSalesStore((s) => s.leads);
  const source = useMemo(() => sources.find(x => x.id === id), [sources, id]);
  const leads = useMemo(() => allLeads.filter(l => l.sourceAccountId === id), [allLeads, id]);
  const [tab, setTab] = useState<"overview" | "leads" | "performance">("overview");

  if (!source) {
    return (
      <div className="p-6">
        <p className="text-sm">Source account not found.</p>
        <Link to="/sales/sources" className="text-primary text-xs hover:underline">Back to sources</Link>
      </div>
    );
  }
  const owner = PEOPLE.find(p => p.id === source.ownerId);
  const won = leads.filter(l => l.status === "Won").length;
  const winRate = leads.length ? Math.round((won / leads.length) * 100) : 0;
  const totalRevenue = leads.filter(l => l.status === "Won").reduce((s, l) => s + (l.estimatedValue ?? 0), 0);

  // performance by month (mocked from createdAt)
  const monthly = leads.reduce<Record<string, number>>((acc, l) => {
    const m = l.createdAt.slice(0, 7);
    acc[m] = (acc[m] ?? 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(monthly).map(([month, count]) => ({ month: month.slice(5), count })).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader
        title={source.displayName}
        subtitle={`${source.platform} · @${source.username}`}
        accentVar="--mod-sales"
        actions={
          <>
            <Link to="/sales/sources"><Button variant="outline" size="sm" className="h-7 text-xs gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Back</Button></Link>
            <a href={source.url} target="_blank" rel="noreferrer"><Button variant="outline" size="sm" className="h-7 text-xs gap-1"><ExternalLink className="w-3.5 h-3.5" /> Open</Button></a>
          </>
        }
      />
      <div className="h-9 px-3 flex items-center gap-1 border-b border-border bg-surface/50 text-xs">
        {(["overview", "leads", "performance"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`h-7 px-3 rounded-sm capitalize ${tab === t ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-surface-hover"}`}
          >{t}</button>
        ))}
      </div>

      <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <KpiCard label="Leads Generated" value={String(leads.length)} accent="hsl(var(--mod-sales))" />
        <KpiCard label="Won" value={String(won)} accent="hsl(var(--success))" />
        <KpiCard label="Win Rate" value={`${winRate}%`} accent="hsl(var(--mod-finance))" />
        <KpiCard label="Revenue" value={inr(totalRevenue)} accent="hsl(var(--mod-portfolio))" />
      </div>

      <div className="px-3 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-3">
        {tab === "overview" && (
          <>
            <div className="lg:col-span-2 bg-surface border border-border rounded-sm p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider">Account Details</h3>
              <DetailRow label="Platform" value={source.platform} />
              <DetailRow label="URL" value={<a href={source.url} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">{source.url}</a>} />
              <DetailRow label="Owner" value={owner?.name ?? "—"} />
              <DetailRow label="Rate" value={source.rateAmount ? `${source.currency === "USD" ? "$" : "₹"}${source.rateAmount} (${source.rateType})` : source.rateType} />
              <DetailRow label="Status" value={<StatusPill variant={source.status === "Active" ? "success" : "neutral"}>{source.status}</StatusPill>} />
              {source.jss !== undefined && <DetailRow label="JSS" value={`${source.jss}%`} />}
              {source.rating !== undefined && <DetailRow label="Rating" value={`★ ${source.rating}`} />}
              <DetailRow label="Tags" value={<div className="flex gap-1 flex-wrap">{source.tags.map(t => <span key={t} className="px-1.5 h-4 rounded-sm bg-surface-hover text-2xs">{t}</span>)}</div>} />
              <DetailRow label="Created" value={source.createdAt} />
              {source.notes && <DetailRow label="Notes" value={source.notes} />}
            </div>
            <div className="bg-surface border border-border rounded-sm p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-2">Quick Stats</h3>
              <div className="space-y-2 text-xs">
                <Stat label="Total leads" value={leads.length} />
                <Stat label="Active leads" value={leads.filter(l => !["Won","Lost"].includes(l.status)).length} />
                <Stat label="Won deals" value={won} />
                <Stat label="Lost" value={leads.filter(l => l.status === "Lost").length} />
                <Stat label="Cost / lead" value={source.rateAmount && leads.length ? `${source.currency === "USD" ? "$" : "₹"}${(source.rateAmount * 30 / Math.max(leads.length, 1)).toFixed(1)}` : "—"} />
              </div>
            </div>
          </>
        )}
        {tab === "leads" && (
          <div className="lg:col-span-3 bg-surface border border-border rounded-sm">
            <div className="h-9 px-3 flex items-center border-b border-border">
              <h3 className="text-xs font-semibold uppercase tracking-wider">Leads from this source ({leads.length})</h3>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-muted/40">
                <tr className="text-2xs uppercase text-muted-foreground">
                  <th className="text-left px-3 h-8">Lead</th>
                  <th className="text-left px-3 h-8">Company</th>
                  <th className="text-left px-3 h-8">Status</th>
                  <th className="text-right px-3 h-8">Value</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(l => (
                  <tr key={l.id} className="border-t border-border hover:bg-surface-hover">
                    <td className="px-3 h-9"><Link to={`/sales/leads/${l.id}`} className="hover:text-primary">{l.title}</Link></td>
                    <td className="px-3 h-9">{l.company}</td>
                    <td className="px-3 h-9"><StatusPill variant="info">{l.status}</StatusPill></td>
                    <td className="px-3 h-9 text-right font-mono">{inr(l.estimatedValue ?? 0)}</td>
                  </tr>
                ))}
                {leads.length === 0 && <tr><td colSpan={4} className="text-center py-6 text-muted-foreground text-xs">No leads from this source yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {tab === "performance" && (
          <div className="lg:col-span-3 bg-surface border border-border rounded-sm p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2">Leads per month</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", fontSize: 11 }} />
                <Bar dataKey="count" fill="hsl(var(--mod-sales))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-xs py-1.5 border-b border-border/50 last:border-0">
      <div className="w-28 shrink-0 text-2xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex-1 min-w-0">{value}</div>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  );
}

import { useMemo } from "react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { useSalesStore } from "@/store/salesStore";
import { inr } from "@/lib/mockData";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Reports() {
  const leads = useSalesStore(s => s.leads);
  const deals = useSalesStore(s => s.deals);
  const sources = useSalesStore(s => s.sources);

  const leadsBySource = useMemo(() => {
    const m = new Map<string, number>();
    leads.forEach(l => m.set(l.sourcePlatform, (m.get(l.sourcePlatform) ?? 0) + 1));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [leads]);

  const conversionFunnel = useMemo(() => {
    const total = leads.length;
    const contacted = leads.filter(l => l.status !== "New").length;
    const qualified = leads.filter(l => ["Qualified", "Proposal Sent", "Negotiation", "Won"].includes(l.status)).length;
    const proposed = leads.filter(l => ["Proposal Sent", "Negotiation", "Won"].includes(l.status)).length;
    const won = leads.filter(l => l.status === "Won").length;
    return [
      { stage: "Total Leads", count: total, pct: 100 },
      { stage: "Contacted", count: contacted, pct: total ? Math.round((contacted / total) * 100) : 0 },
      { stage: "Qualified", count: qualified, pct: total ? Math.round((qualified / total) * 100) : 0 },
      { stage: "Proposal Sent", count: proposed, pct: total ? Math.round((proposed / total) * 100) : 0 },
      { stage: "Won", count: won, pct: total ? Math.round((won / total) * 100) : 0 },
    ];
  }, [leads]);

  const sourceROI = useMemo(() => {
    return sources.map(src => {
      const srcLeads = leads.filter(l => l.sourceAccountId === src.id);
      const srcWon = srcLeads.filter(l => l.status === "Won");
      const revenue = srcWon.reduce((s, l) => s + (l.estimatedValue ?? 0), 0);
      const cost = (src.rateAmount ?? 0) * (src.rateType === "Monthly Subscription" ? 12 : 1);
      return { src, leads: srcLeads.length, won: srcWon.length, revenue, cost, roi: cost ? Math.round((revenue / cost) * 100) : 0 };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [sources, leads]);

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title="Sales Reports" accentVar="--mod-sales"
        actions={<Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Download className="w-3.5 h-3.5" /> Export PDF</Button>} />

      <div className="p-3 flex-1 space-y-3">
        <div className="bg-surface border border-border rounded-sm p-3">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3">Conversion Funnel</h3>
          <div className="space-y-2">
            {conversionFunnel.map((f, i) => (
              <div key={f.stage}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{f.stage}</span>
                  <span className="font-mono text-muted-foreground">{f.count} · {f.pct}%</span>
                </div>
                <div className="h-3 bg-surface-hover rounded-sm overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-mod-sales" style={{ width: `${f.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3">Leads by Source</h3>
            <div className="space-y-1.5">
              {leadsBySource.map(([src, count]) => (
                <div key={src} className="flex items-center justify-between text-xs">
                  <span>{src}</span>
                  <div className="flex items-center gap-2 w-32">
                    <div className="flex-1 h-2 bg-surface-hover rounded-sm overflow-hidden">
                      <div className="h-full bg-mod-sales" style={{ width: `${(count / leadsBySource[0][1]) * 100}%` }} />
                    </div>
                    <span className="font-mono text-2xs w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3">Source ROI</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-2xs uppercase text-muted-foreground tracking-wider">
                  <th className="text-left h-7 font-medium">Source</th>
                  <th className="text-center h-7 font-medium">Leads</th>
                  <th className="text-center h-7 font-medium">Won</th>
                  <th className="text-right h-7 font-medium">Revenue</th>
                  <th className="text-right h-7 font-medium">ROI</th>
                </tr>
              </thead>
              <tbody>
                {sourceROI.map(r => (
                  <tr key={r.src.id} className="border-t border-border">
                    <td className="h-8 truncate max-w-[120px]">{r.src.displayName}</td>
                    <td className="text-center font-mono">{r.leads}</td>
                    <td className="text-center font-mono text-success">{r.won}</td>
                    <td className="text-right font-mono">{inr(r.revenue)}</td>
                    <td className="text-right font-mono text-mod-sales">{r.roi}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

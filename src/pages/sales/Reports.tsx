import { useMemo } from "react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { useSalesStore } from "@/store/salesStore";
import { inr, PEOPLE } from "@/lib/mockData";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";

const PIE_COLORS = [
  "hsl(var(--mod-sales))", "hsl(var(--mod-finance))", "hsl(var(--mod-pms))",
  "hsl(var(--mod-portfolio))", "hsl(var(--success))", "hsl(var(--warning))",
  "hsl(var(--destructive))", "hsl(var(--mod-staffing))",
];

export default function Reports() {
  const leads = useSalesStore(s => s.leads);
  const deals = useSalesStore(s => s.deals);
  const sources = useSalesStore(s => s.sources);

  const leadsBySource = useMemo(() => {
    const m = new Map<string, number>();
    leads.forEach(l => m.set(l.sourcePlatform, (m.get(l.sourcePlatform) ?? 0) + 1));
    return Array.from(m.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [leads]);

  const conversionFunnel = useMemo(() => {
    const total = leads.length;
    const contacted = leads.filter(l => l.status !== "New").length;
    const qualified = leads.filter(l => ["Qualified", "Proposal Sent", "Negotiation", "Won"].includes(l.status)).length;
    const proposed = leads.filter(l => ["Proposal Sent", "Negotiation", "Won"].includes(l.status)).length;
    const won = leads.filter(l => l.status === "Won").length;
    return [
      { stage: "Total", count: total, pct: 100 },
      { stage: "Contacted", count: contacted, pct: total ? Math.round((contacted / total) * 100) : 0 },
      { stage: "Qualified", count: qualified, pct: total ? Math.round((qualified / total) * 100) : 0 },
      { stage: "Proposal", count: proposed, pct: total ? Math.round((proposed / total) * 100) : 0 },
      { stage: "Won", count: won, pct: total ? Math.round((won / total) * 100) : 0 },
    ];
  }, [leads]);

  // Revenue trend by month from won deals
  const revenueTrend = useMemo(() => {
    const m = new Map<string, number>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      m.set(d.toISOString().slice(0, 7), 0);
    }
    deals.filter(d => d.stage === "Closed Won").forEach(d => {
      const k = d.expectedCloseDate.slice(0, 7);
      if (m.has(k)) m.set(k, (m.get(k) ?? 0) + d.value);
    });
    return Array.from(m.entries()).map(([k, v]) => ({
      month: new Date(k + "-01").toLocaleDateString("en-IN", { month: "short" }),
      revenue: v,
    }));
  }, [deals]);

  // Win/Loss reasons (mocked from priority/leadType)
  const winLoss = useMemo(() => {
    const won = deals.filter(d => d.stage === "Closed Won").length;
    const lost = deals.filter(d => d.stage === "Closed Lost").length;
    return [
      { name: "Won", value: won, fill: "hsl(var(--success))" },
      { name: "Lost", value: lost, fill: "hsl(var(--destructive))" },
    ];
  }, [deals]);

  const sourceROI = useMemo(() => {
    return sources.map(src => {
      const srcLeads = leads.filter(l => l.sourceAccountId === src.id);
      const srcWon = srcLeads.filter(l => l.status === "Won");
      const revenue = srcWon.reduce((s, l) => s + (l.estimatedValue ?? 0), 0);
      const cost = (src.rateAmount ?? 0) * (src.rateType === "Monthly Subscription" ? 12 : 1);
      return { src, leads: srcLeads.length, won: srcWon.length, revenue, cost, roi: cost ? Math.round((revenue / cost) * 100) : 0 };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [sources, leads]);

  const repPerformance = useMemo(() => {
    const m = new Map<string, { leads: number; deals: number; revenue: number }>();
    leads.forEach(l => {
      const c = m.get(l.assigneeId) ?? { leads: 0, deals: 0, revenue: 0 };
      c.leads += 1;
      m.set(l.assigneeId, c);
    });
    deals.forEach(d => {
      const c = m.get(d.ownerId) ?? { leads: 0, deals: 0, revenue: 0 };
      c.deals += 1;
      if (d.stage === "Closed Won") c.revenue += d.value;
      m.set(d.ownerId, c);
    });
    return Array.from(m.entries()).map(([id, v]) => ({
      name: PEOPLE.find(p => p.id === id)?.initials ?? id,
      fullName: PEOPLE.find(p => p.id === id)?.name ?? id,
      ...v,
    })).sort((a, b) => b.revenue - a.revenue);
  }, [leads, deals]);

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title="Sales Reports" subtitle="Funnel · revenue trends · ROI · rep performance" accentVar="--mod-sales"
        actions={<Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Download className="w-3.5 h-3.5" /> Export PDF</Button>} />

      <div className="p-3 flex-1 space-y-3">
        {/* Top row — funnel + win/loss + revenue trend */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3">Conversion Funnel</h3>
            <div className="space-y-2">
              {conversionFunnel.map((f) => (
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

          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3">Win / Loss</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={winLoss} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} label={(e: any) => `${e.name}: ${e.value}`}>
                  {winLoss.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3">Revenue Trend (6 mo)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueTrend} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--border))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--border))" tickFormatter={(v) => `${(v/100000).toFixed(0)}L`} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", fontSize: 11 }} formatter={(v: number) => inr(v)} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--mod-sales))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source distribution + ROI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3">Leads by Source</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={leadsBySource} dataKey="value" nameKey="name" outerRadius={85} label={(e: any) => `${e.name}: ${e.value}`}>
                  {leadsBySource.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
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

        {/* Rep performance bar */}
        <div className="bg-surface border border-border rounded-sm p-3">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3">Rep Performance — Revenue vs Activity</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={repPerformance} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--border))" />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="hsl(var(--border))" tickFormatter={(v) => `${(v/100000).toFixed(0)}L`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="hsl(var(--border))" />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", fontSize: 11 }}
                formatter={(v: number, name) => name === "revenue" ? inr(v) : v} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="hsl(var(--mod-sales))" />
              <Bar yAxisId="right" dataKey="leads" name="Leads" fill="hsl(var(--mod-finance))" />
              <Bar yAxisId="right" dataKey="deals" name="Deals" fill="hsl(var(--mod-pms))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

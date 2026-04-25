import { useMemo } from "react";
import { Target, TrendingUp, CalendarRange, Trophy } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { useSalesStore } from "@/store/salesStore";
import { PEOPLE, inr } from "@/lib/mockData";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend,
} from "recharts";

/**
 * Forecasts focuses on FORWARD-LOOKING projections + GOAL ATTAINMENT (per-rep & company).
 * Dashboard already shows pipeline KPIs and stage funnel — we don't repeat those here.
 */
export default function Forecasts() {
  const deals = useSalesStore(s => s.deals);
  const goals = useSalesStore(s => s.goals);

  // Weighted forecast bucketed by expected close month (next 6 months)
  const monthlyForecast = useMemo(() => {
    const buckets = new Map<string, { committed: number; bestCase: number; worstCase: number }>();
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const k = d.toISOString().slice(0, 7);
      buckets.set(k, { committed: 0, bestCase: 0, worstCase: 0 });
    }
    deals.filter(d => !["Closed Won","Closed Lost"].includes(d.stage)).forEach(d => {
      const k = d.expectedCloseDate.slice(0, 7);
      const b = buckets.get(k);
      if (!b) return;
      const w = d.value * (d.probability / 100);
      b.committed += w;
      b.bestCase += d.value;
      b.worstCase += d.probability >= 75 ? d.value : w * 0.5;
    });
    return Array.from(buckets.entries()).map(([k, v]) => ({
      month: new Date(k + "-01").toLocaleDateString("en-IN", { month: "short" }),
      ...v,
    }));
  }, [deals]);

  const companyGoals = goals.filter(g => g.scope === "company");
  const personGoals = goals.filter(g => g.scope === "person");

  const repAttainment = useMemo(() => {
    return personGoals.map(g => {
      const owner = PEOPLE.find(p => p.id === g.ownerId);
      const pct = g.target ? Math.min(150, Math.round(((g.achieved ?? 0) / g.target) * 100)) : 0;
      return { ...g, owner, pct };
    }).sort((a, b) => b.pct - a.pct);
  }, [personGoals]);

  const quotaAchievement = repAttainment.filter(g => g.period === "monthly").map(g => ({
    name: g.owner?.initials ?? "?",
    achieved: g.achieved ?? 0,
    target: g.target,
  }));

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title="Forecasts & Goals" subtitle="Forward projection · monthly/quarterly attainment" accentVar="--mod-sales" />

      <div className="p-3 flex-1 space-y-3">
        {/* Company-wide goal attainment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {companyGoals.map(g => {
            const pct = g.target ? Math.round(((g.achieved ?? 0) / g.target) * 100) : 0;
            return (
              <div key={g.id} className="bg-surface border border-border rounded-sm p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-mod-sales" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider">Company {g.period} · {g.periodLabel}</h3>
                  <span className={`ml-auto text-2xs font-mono font-bold ${pct >= 100 ? "text-success" : pct >= 70 ? "text-warning" : "text-destructive"}`}>{pct}%</span>
                </div>
                <div className="text-lg font-mono font-bold">{inr(g.achieved ?? 0)} <span className="text-2xs text-muted-foreground font-normal">of {inr(g.target)}</span></div>
                <div className="h-2 bg-surface-hover rounded-sm overflow-hidden mt-2">
                  <div className={`h-full ${pct >= 100 ? "bg-success" : "bg-mod-sales"}`} style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* 6-month forecast chart */}
        <div className="bg-surface border border-border rounded-sm p-3">
          <div className="flex items-center gap-2 mb-2">
            <CalendarRange className="w-4 h-4 text-mod-sales" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">6-Month Weighted Forecast</h3>
            <span className="text-2xs text-muted-foreground ml-auto">Best case / committed (weighted) / worst case</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyForecast} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="fcBest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--mod-sales))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--mod-sales))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fcCommit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--border))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--border))" tickFormatter={(v) => `${(v/100000).toFixed(0)}L`} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", fontSize: 11 }} formatter={(v: number) => inr(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="bestCase" name="Best case" stroke="hsl(var(--mod-sales))" strokeWidth={1.5} strokeDasharray="3 3" fill="url(#fcBest)" />
              <Area type="monotone" dataKey="committed" name="Committed (weighted)" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#fcCommit)" />
              <Area type="monotone" dataKey="worstCase" name="Worst case" stroke="hsl(var(--warning))" strokeWidth={1} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Per-rep quota attainment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-surface border border-border rounded-sm p-3">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-mod-sales" />
              <h3 className="text-xs font-semibold uppercase tracking-wider">Monthly Quota Attainment</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={quotaAchievement} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--border))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--border))" tickFormatter={(v) => `${(v/100000).toFixed(0)}L`} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", fontSize: 11 }} formatter={(v: number) => inr(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="target" name="Target" fill="hsl(var(--muted))" />
                <Bar dataKey="achieved" name="Achieved">
                  {quotaAchievement.map((d, i) => (
                    <Cell key={i} fill={d.achieved >= d.target ? "hsl(var(--success))" : "hsl(var(--mod-sales))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-surface border border-border rounded-sm">
            <div className="h-9 px-3 flex items-center gap-2 border-b border-border">
              <TrendingUp className="w-4 h-4 text-mod-sales" />
              <h3 className="text-xs font-semibold uppercase tracking-wider">Rep Goal Attainment</h3>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-muted/40">
                <tr className="text-2xs uppercase text-muted-foreground">
                  <th className="text-left px-3 h-7">Rep</th>
                  <th className="text-left px-3 h-7">Period</th>
                  <th className="text-right px-3 h-7">Achieved</th>
                  <th className="text-right px-3 h-7">Target</th>
                  <th className="text-right px-3 h-7">%</th>
                </tr>
              </thead>
              <tbody>
                {repAttainment.map(g => (
                  <tr key={g.id} className="border-t border-border hover:bg-surface-hover">
                    <td className="px-3 h-9">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-sm bg-primary/15 text-primary flex items-center justify-center font-mono text-3xs font-bold">{g.owner?.initials}</div>
                        <span>{g.owner?.name}</span>
                      </div>
                    </td>
                    <td className="px-3 h-9 text-2xs text-muted-foreground">{g.period} · {g.periodLabel}</td>
                    <td className="px-3 h-9 text-right font-mono">{inr(g.achieved ?? 0)}</td>
                    <td className="px-3 h-9 text-right font-mono text-muted-foreground">{inr(g.target)}</td>
                    <td className="px-3 h-9 text-right">
                      <span className={`font-mono font-bold ${g.pct >= 100 ? "text-success" : g.pct >= 70 ? "text-warning" : "text-destructive"}`}>{g.pct}%</span>
                    </td>
                  </tr>
                ))}
                {repAttainment.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-muted-foreground text-xs">No rep goals configured</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

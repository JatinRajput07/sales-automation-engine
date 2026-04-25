import { useMemo } from "react";
import { TrendingUp, Target, DollarSign, Award } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { useSalesStore, ALL_DEAL_STAGES } from "@/store/salesStore";
import { PEOPLE, inr } from "@/lib/mockData";

export default function Forecasts() {
  const deals = useSalesStore(s => s.deals);

  const totals = useMemo(() => {
    const open = deals.filter(d => !["Closed Won","Closed Lost"].includes(d.stage));
    const won = deals.filter(d => d.stage === "Closed Won");
    const lost = deals.filter(d => d.stage === "Closed Lost");
    return {
      pipelineValue: open.reduce((s, d) => s + d.value, 0),
      weightedValue: open.reduce((s, d) => s + d.value * (d.probability / 100), 0),
      won: won.reduce((s, d) => s + d.value, 0),
      wonCount: won.length,
      lost: lost.reduce((s, d) => s + d.value, 0),
      winRate: (won.length + lost.length) ? Math.round((won.length / (won.length + lost.length)) * 100) : 0,
    };
  }, [deals]);

  const byStage = useMemo(() => ALL_DEAL_STAGES.map(stage => {
    const ds = deals.filter(d => d.stage === stage);
    return { stage, count: ds.length, value: ds.reduce((s, d) => s + d.value, 0) };
  }), [deals]);

  const byOwner = useMemo(() => {
    const m = new Map<string, { value: number; weighted: number; count: number }>();
    deals.forEach(d => {
      const cur = m.get(d.ownerId) ?? { value: 0, weighted: 0, count: 0 };
      cur.value += d.value;
      cur.weighted += d.value * (d.probability / 100);
      cur.count += 1;
      m.set(d.ownerId, cur);
    });
    return Array.from(m.entries())
      .map(([id, v]) => ({ owner: PEOPLE.find(p => p.id === id), ...v }))
      .filter(x => x.owner)
      .sort((a, b) => b.weighted - a.weighted);
  }, [deals]);

  const maxStageValue = Math.max(...byStage.map(s => s.value), 1);

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title="Forecasts" subtitle="Pipeline outlook & rep performance" accentVar="--mod-sales" />

      <div className="p-3 flex-1 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {[
            { label: "Pipeline Value", value: inr(totals.pipelineValue), icon: DollarSign, color: "text-primary" },
            { label: "Weighted Forecast", value: inr(totals.weightedValue), icon: TrendingUp, color: "text-mod-sales" },
            { label: "Won (YTD)", value: `${inr(totals.won)} · ${totals.wonCount}`, icon: Award, color: "text-success" },
            { label: "Win Rate", value: `${totals.winRate}%`, icon: Target, color: "text-warning" },
          ].map(k => (
            <div key={k.label} className="bg-surface border border-border rounded-sm p-3">
              <div className="flex items-center gap-1.5 text-2xs text-muted-foreground uppercase tracking-wider mb-1.5"><k.icon className={`w-3.5 h-3.5 ${k.color}`} />{k.label}</div>
              <div className="text-lg font-semibold font-mono">{k.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3">Pipeline by Stage</h3>
            <div className="space-y-2">
              {byStage.map(s => (
                <div key={s.stage}>
                  <div className="flex items-center justify-between text-2xs mb-1">
                    <span className="font-medium">{s.stage}</span>
                    <span className="font-mono text-muted-foreground">{s.count} · {inr(s.value)}</span>
                  </div>
                  <div className="h-2 bg-surface-hover rounded-sm overflow-hidden">
                    <div className="h-full bg-mod-sales" style={{ width: `${(s.value / maxStageValue) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3">Forecast by Owner</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-2xs uppercase text-muted-foreground tracking-wider">
                  <th className="text-left h-7 font-medium">Rep</th>
                  <th className="text-center h-7 font-medium">Deals</th>
                  <th className="text-right h-7 font-medium">Pipeline</th>
                  <th className="text-right h-7 font-medium">Weighted</th>
                </tr>
              </thead>
              <tbody>
                {byOwner.map(o => (
                  <tr key={o.owner!.id} className="border-t border-border">
                    <td className="h-9">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-sm bg-primary/15 text-primary flex items-center justify-center font-mono text-3xs font-bold">{o.owner!.initials}</div>
                        <span>{o.owner!.name}</span>
                      </div>
                    </td>
                    <td className="text-center font-mono text-2xs">{o.count}</td>
                    <td className="text-right font-mono">{inr(o.value)}</td>
                    <td className="text-right font-mono text-mod-sales">{inr(o.weighted)}</td>
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

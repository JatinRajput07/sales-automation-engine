import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, TrendingUp } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { useSalesStore, ALL_DEAL_STAGES, dealStageVariant, type DealStage } from "@/store/salesStore";
import { PEOPLE, inr } from "@/lib/mockData";

export default function Pipeline() {
  const deals = useSalesStore(s => s.deals);
  const setDealStage = useSalesStore(s => s.setDealStage);

  const grouped = useMemo(() => {
    const g: Record<DealStage, typeof deals> = { Discovery: [], Qualification: [], Proposal: [], Negotiation: [], "Closed Won": [], "Closed Lost": [] };
    deals.forEach(d => g[d.stage].push(d));
    return g;
  }, [deals]);

  const totals = useMemo(() => {
    return ALL_DEAL_STAGES.map(stage => ({
      stage,
      count: grouped[stage].length,
      value: grouped[stage].reduce((s, d) => s + d.value, 0),
      weighted: grouped[stage].reduce((s, d) => s + d.value * (d.probability / 100), 0),
    }));
  }, [grouped]);

  function onDrop(e: React.DragEvent, stage: DealStage) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) setDealStage(id, stage);
  }

  const totalValue = deals.reduce((s, d) => s + d.value, 0);
  const weightedValue = deals.reduce((s, d) => s + d.value * (d.probability / 100), 0);

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader
        title="Pipeline"
        subtitle={`${deals.length} deals · ${inr(totalValue)} total · ${inr(weightedValue)} weighted`}
        accentVar="--mod-sales"
        actions={<Link to="/sales/deals/new"><Button size="sm" className="h-7 text-xs gap-1"><Plus className="w-3.5 h-3.5" /> New Deal</Button></Link>}
      />

      {/* Stage summary bar */}
      <div className="grid grid-cols-6 gap-px bg-border border-b border-border text-xs">
        {totals.map(t => (
          <div key={t.stage} className="bg-surface px-3 py-2">
            <div className="text-3xs uppercase text-muted-foreground tracking-wider truncate">{t.stage}</div>
            <div className="text-sm font-semibold font-mono mt-0.5">{inr(t.value)}</div>
            <div className="text-2xs text-muted-foreground">{t.count} deals</div>
          </div>
        ))}
      </div>

      <div className="p-3 flex-1 overflow-x-auto">
        <div className="flex gap-2 min-w-max h-full">
          {ALL_DEAL_STAGES.map(stage => (
            <div
              key={stage}
              onDragOver={e => e.preventDefault()}
              onDrop={e => onDrop(e, stage)}
              className="w-72 shrink-0 bg-surface border border-border rounded-sm flex flex-col"
            >
              <div className="h-9 px-3 border-b border-border flex items-center justify-between">
                <h4 className="text-xs font-semibold">{stage}</h4>
                <span className="text-2xs font-mono text-muted-foreground">{grouped[stage].length}</span>
              </div>
              <div className="p-1.5 flex-1 overflow-auto space-y-1.5 min-h-[200px]">
                {grouped[stage].map(d => {
                  const owner = PEOPLE.find(p => p.id === d.ownerId);
                  return (
                    <Link
                      key={d.id}
                      to={`/sales/deals/${d.id}`}
                      draggable
                      onDragStart={e => e.dataTransfer.setData("text/plain", d.id)}
                      className="block bg-background border border-border rounded-sm p-2 hover:border-primary hover:shadow-sm cursor-move"
                    >
                      <div className="text-xs font-medium line-clamp-2 mb-1">{d.title}</div>
                      <div className="flex items-center justify-between text-2xs">
                        <span className="font-mono font-bold">{inr(d.value)}</span>
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5 text-muted-foreground"><TrendingUp className="w-2.5 h-2.5" />{d.probability}%</div>
                          <div className="w-4 h-4 rounded-sm bg-primary/15 text-primary flex items-center justify-center font-mono text-3xs font-bold">{owner?.initials}</div>
                        </div>
                      </div>
                      <div className="text-3xs text-muted-foreground mt-1">Close: {d.expectedCloseDate}</div>
                    </Link>
                  );
                })}
                {grouped[stage].length === 0 && <div className="text-center py-6 text-3xs text-muted-foreground">Drop deals here</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

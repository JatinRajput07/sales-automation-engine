import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, LayoutGrid, List, TrendingUp } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/StatusPill";
import { SalesFilterBar } from "@/components/sales/SalesFilterBar";
import { useSalesStore, ALL_DEAL_STAGES, dealStageVariant, type DealStage } from "@/store/salesStore";
import { PEOPLE, inr } from "@/lib/mockData";

export default function Deals() {
  const deals = useSalesStore(s => s.deals);
  const companies = useSalesStore(s => s.companies);
  const setDealStage = useSalesStore(s => s.setDealStage);
  const [view, setView] = useState<"table" | "kanban">("table");
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<DealStage | "all">("all");
  const [sortKey, setSortKey] = useState<"value" | "createdAt" | "closeDate">("value");

  const rows = useMemo(() => {
    let out = deals;
    if (q) {
      const s = q.toLowerCase();
      out = out.filter(d => d.title.toLowerCase().includes(s));
    }
    if (stage !== "all") out = out.filter(d => d.stage === stage);
    out = [...out].sort((a, b) => {
      if (sortKey === "value") return b.value - a.value;
      if (sortKey === "closeDate") return a.expectedCloseDate.localeCompare(b.expectedCloseDate);
      return b.createdAt.localeCompare(a.createdAt);
    });
    return out;
  }, [deals, q, stage, sortKey]);

  const totalValue = rows.reduce((s, d) => s + d.value, 0);

  const grouped = useMemo(() => {
    const g: Record<DealStage, typeof rows> = { Discovery: [], Qualification: [], Proposal: [], Negotiation: [], "Closed Won": [], "Closed Lost": [] };
    rows.forEach(d => g[d.stage].push(d));
    return g;
  }, [rows]);

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader
        title="Deals"
        subtitle={`${rows.length} deals · ${inr(totalValue)}`}
        accentVar="--mod-sales"
        actions={<Link to="/sales/deals/new"><Button size="sm" className="h-7 text-xs gap-1"><Plus className="w-3.5 h-3.5" /> New Deal</Button></Link>}
      />

      <SalesFilterBar
        search={q}
        onSearch={setQ}
        searchPlaceholder="Search deals…"
        chips={stage !== "all" ? [{ key: "stage", label: "Stage", value: stage, onClear: () => setStage("all") }] : []}
        onClearAll={() => { setQ(""); setStage("all"); }}
        onExport={() => {}}
        onSave={() => {}}
        extra={
          <>
            <select value={stage} onChange={e => setStage(e.target.value as DealStage | "all")} className="h-7 px-2 rounded-sm bg-background border border-border text-xs">
              <option value="all">All Stages</option>
              {ALL_DEAL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={sortKey} onChange={e => setSortKey(e.target.value as "value" | "createdAt" | "closeDate")} className="h-7 px-2 rounded-sm bg-background border border-border text-xs">
              <option value="value">Sort: Value</option>
              <option value="createdAt">Sort: Newest</option>
              <option value="closeDate">Sort: Close Date</option>
            </select>
          </>
        }
        right={
          <div className="flex items-center bg-surface-hover rounded-sm p-0.5 ml-1">
            <button onClick={() => setView("table")} className={`h-6 px-2 rounded-sm flex items-center gap-1 text-2xs ${view === "table" ? "bg-surface text-foreground" : "text-muted-foreground"}`}><List className="w-3 h-3" /> Table</button>
            <button onClick={() => setView("kanban")} className={`h-6 px-2 rounded-sm flex items-center gap-1 text-2xs ${view === "kanban" ? "bg-surface text-foreground" : "text-muted-foreground"}`}><LayoutGrid className="w-3 h-3" /> Kanban</button>
          </div>
        }
      />

      {view === "table" ? (
        <div className="p-3 flex-1">
          <div className="bg-surface border border-border rounded-sm overflow-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40">
                <tr className="text-2xs uppercase text-muted-foreground tracking-wider">
                  <th className="text-left px-3 h-8 font-medium">Deal</th>
                  <th className="text-left px-3 h-8 font-medium">Company</th>
                  <th className="text-left px-3 h-8 font-medium">Stage</th>
                  <th className="text-right px-3 h-8 font-medium">Value</th>
                  <th className="text-center px-3 h-8 font-medium">Probability</th>
                  <th className="text-right px-3 h-8 font-medium">Weighted</th>
                  <th className="text-left px-3 h-8 font-medium">Close Date</th>
                  <th className="text-left px-3 h-8 font-medium">Owner</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(d => {
                  const owner = PEOPLE.find(p => p.id === d.ownerId);
                  const co = companies.find(c => c.id === d.companyId);
                  return (
                    <tr key={d.id} className="border-t border-border hover:bg-surface-hover">
                      <td className="px-3 h-10"><Link to={`/sales/deals/${d.id}`} className="font-medium hover:text-primary">{d.title}</Link></td>
                      <td className="px-3 h-10">{co?.name ?? "—"}</td>
                      <td className="px-3 h-10"><StatusPill variant={dealStageVariant(d.stage)}>{d.stage}</StatusPill></td>
                      <td className="px-3 h-10 text-right font-mono">{inr(d.value)}</td>
                      <td className="px-3 h-10 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-12 h-1.5 bg-surface-hover rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${d.probability}%` }} />
                          </div>
                          <span className="font-mono text-2xs w-7">{d.probability}%</span>
                        </div>
                      </td>
                      <td className="px-3 h-10 text-right font-mono text-muted-foreground">{inr(d.value * d.probability / 100)}</td>
                      <td className="px-3 h-10 font-mono text-2xs">{d.expectedCloseDate}</td>
                      <td className="px-3 h-10">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-sm bg-primary/15 text-primary flex items-center justify-center font-mono text-3xs font-bold">{owner?.initials}</div>
                          <span className="truncate max-w-[100px]">{owner?.name}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No deals match</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-3 flex-1 overflow-x-auto">
          <div className="flex gap-2 min-w-max h-full">
            {ALL_DEAL_STAGES.map(s => (
              <div key={s}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); if (id) setDealStage(id, s); }}
                className="w-72 shrink-0 bg-surface border border-border rounded-sm flex flex-col">
                <div className="h-9 px-3 border-b border-border flex items-center justify-between">
                  <h4 className="text-xs font-semibold">{s}</h4>
                  <span className="text-2xs font-mono text-muted-foreground">{grouped[s].length}</span>
                </div>
                <div className="p-1.5 flex-1 overflow-auto space-y-1.5 min-h-[200px]">
                  {grouped[s].map(d => {
                    const owner = PEOPLE.find(p => p.id === d.ownerId);
                    return (
                      <Link key={d.id} to={`/sales/deals/${d.id}`} draggable
                        onDragStart={e => e.dataTransfer.setData("text/plain", d.id)}
                        className="block bg-background border border-border rounded-sm p-2 hover:border-primary hover:shadow-sm cursor-move">
                        <div className="text-xs font-medium line-clamp-2 mb-1">{d.title}</div>
                        <div className="flex items-center justify-between text-2xs">
                          <span className="font-mono font-bold">{inr(d.value)}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="flex items-center gap-0.5 text-muted-foreground"><TrendingUp className="w-2.5 h-2.5" />{d.probability}%</span>
                            <div className="w-4 h-4 rounded-sm bg-primary/15 text-primary flex items-center justify-center font-mono text-3xs font-bold">{owner?.initials}</div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  {grouped[s].length === 0 && <div className="text-center py-6 text-3xs text-muted-foreground">Drop deals here</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

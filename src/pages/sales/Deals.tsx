import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/StatusPill";
import { useSalesStore, ALL_DEAL_STAGES, dealStageVariant, type DealStage } from "@/store/salesStore";
import { PEOPLE, inr } from "@/lib/mockData";

export default function Deals() {
  const deals = useSalesStore(s => s.deals);
  const companies = useSalesStore(s => s.companies);
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

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader
        title="Deals"
        subtitle={`${rows.length} deals · ${inr(totalValue)}`}
        accentVar="--mod-sales"
        actions={<Link to="/sales/deals/new"><Button size="sm" className="h-7 text-xs gap-1"><Plus className="w-3.5 h-3.5" /> New Deal</Button></Link>}
      />

      <div className="h-10 px-3 flex items-center gap-2 border-b border-border bg-surface/50 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search deals…" className="h-7 pl-7 w-56 text-xs" />
        </div>
        <select value={stage} onChange={e => setStage(e.target.value as any)} className="h-7 px-2 rounded-sm bg-background border border-border text-xs">
          <option value="all">All Stages</option>
          {ALL_DEAL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sortKey} onChange={e => setSortKey(e.target.value as any)} className="h-7 px-2 rounded-sm bg-background border border-border text-xs">
          <option value="value">Sort: Value</option>
          <option value="createdAt">Sort: Newest</option>
          <option value="closeDate">Sort: Close Date</option>
        </select>
      </div>

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
                    <td className="px-3 h-10">
                      <Link to={`/sales/deals/${d.id}`} className="font-medium hover:text-primary">{d.title}</Link>
                    </td>
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
    </div>
  );
}

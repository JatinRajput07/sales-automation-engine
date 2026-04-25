import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, FileText } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/StatusPill";
import { useSalesStore, ALL_PROPOSAL_STATUSES, proposalStatusVariant, type ProposalStatus } from "@/store/salesStore";
import { PEOPLE, inr } from "@/lib/mockData";

export default function Proposals() {
  const proposals = useSalesStore(s => s.proposals);
  const companies = useSalesStore(s => s.companies);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ProposalStatus | "all">("all");

  const rows = useMemo(() => {
    let out = proposals;
    if (q) {
      const s = q.toLowerCase();
      out = out.filter(p => p.title.toLowerCase().includes(s) || p.number.toLowerCase().includes(s));
    }
    if (status !== "all") out = out.filter(p => p.status === status);
    return [...out].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [proposals, q, status]);

  const total = (p: typeof proposals[0]) => {
    const sub = p.lineItems.reduce((s, li) => s + li.qty * li.rate, 0);
    return Math.round((sub - p.discount) * (1 + p.taxPercent / 100));
  };

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader
        title="Proposals"
        subtitle={`${proposals.length} proposals · AI-powered builder`}
        accentVar="--mod-sales"
        actions={<Link to="/sales/proposals/new"><Button size="sm" className="h-7 text-xs gap-1"><Plus className="w-3.5 h-3.5" /> New Proposal</Button></Link>}
      />

      <div className="h-10 px-3 flex items-center gap-2 border-b border-border bg-surface/50 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search proposals…" className="h-7 pl-7 w-56 text-xs" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value as any)} className="h-7 px-2 rounded-sm bg-background border border-border text-xs">
          <option value="all">All Status</option>
          {ALL_PROPOSAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="p-3 flex-1">
        <div className="bg-surface border border-border rounded-sm overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40">
              <tr className="text-2xs uppercase text-muted-foreground tracking-wider">
                <th className="text-left px-3 h-8 font-medium">Number</th>
                <th className="text-left px-3 h-8 font-medium">Title</th>
                <th className="text-left px-3 h-8 font-medium">Client</th>
                <th className="text-right px-3 h-8 font-medium">Value</th>
                <th className="text-left px-3 h-8 font-medium">Prepared By</th>
                <th className="text-left px-3 h-8 font-medium">Status</th>
                <th className="text-left px-3 h-8 font-medium">Sent</th>
                <th className="text-left px-3 h-8 font-medium">Valid Until</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(p => {
                const co = companies.find(c => c.id === p.companyId);
                const by = PEOPLE.find(x => x.id === p.preparedById);
                return (
                  <tr key={p.id} className="border-t border-border hover:bg-surface-hover">
                    <td className="px-3 h-10 font-mono text-2xs">{p.number}</td>
                    <td className="px-3 h-10">
                      <Link to={`/sales/proposals/${p.id}`} className="font-medium hover:text-primary flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-muted-foreground" />{p.title}
                      </Link>
                    </td>
                    <td className="px-3 h-10">{co?.name ?? "—"}</td>
                    <td className="px-3 h-10 text-right font-mono">{inr(total(p))}</td>
                    <td className="px-3 h-10">{by?.name}</td>
                    <td className="px-3 h-10"><StatusPill variant={proposalStatusVariant(p.status)}>{p.status}</StatusPill></td>
                    <td className="px-3 h-10 font-mono text-2xs text-muted-foreground">{p.sentDate ?? "—"}</td>
                    <td className="px-3 h-10 font-mono text-2xs text-muted-foreground">{p.validUntil}</td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No proposals match</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

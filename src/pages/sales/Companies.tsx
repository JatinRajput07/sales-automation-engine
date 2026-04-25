import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Building2, Globe, MapPin } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/StatusPill";
import { useSalesStore } from "@/store/salesStore";
import { PEOPLE } from "@/lib/mockData";

export default function Companies() {
  const companies = useSalesStore((s) => s.companies);
  const contacts = useSalesStore((s) => s.contacts);
  const deals = useSalesStore((s) => s.deals);
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<string>("all");
  const [type, setType] = useState<string>("all");

  const rows = useMemo(() => {
    let out = companies;
    if (q) {
      const s = q.toLowerCase();
      out = out.filter(c => c.name.toLowerCase().includes(s) || c.industry.toLowerCase().includes(s));
    }
    if (tier !== "all") out = out.filter(c => c.accountTier === tier);
    if (type !== "all") out = out.filter(c => c.clientType === type);
    return out;
  }, [companies, q, tier, type]);

  const variantFor = (t: string) =>
    t === "Active Client" ? "success" : t === "Lead" ? "info" : t === "Prospect" ? "purple" : t === "Past Client" ? "neutral" : "warning";

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader
        title="Companies"
        subtitle={`${companies.length} accounts`}
        accentVar="--mod-sales"
        actions={<Link to="/sales/companies/new"><Button size="sm" className="h-7 text-xs gap-1"><Plus className="w-3.5 h-3.5" /> New Company</Button></Link>}
      />

      <div className="h-10 px-3 flex items-center gap-2 border-b border-border bg-surface/50 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies…" className="h-7 pl-7 w-56 text-xs" />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className="h-7 px-2 rounded-sm bg-background border border-border text-xs">
          <option value="all">All Types</option>
          {["Prospect","Lead","Active Client","Past Client","Partner"].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={tier} onChange={(e) => setTier(e.target.value)} className="h-7 px-2 rounded-sm bg-background border border-border text-xs">
          <option value="all">All Tiers</option>
          {["Enterprise","Mid-Market","SMB","Startup"].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="p-3 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {rows.map(c => {
            const am = PEOPLE.find(p => p.id === c.accountManagerId);
            const cContacts = contacts.filter(x => x.companyId === c.id).length;
            const cDeals = deals.filter(d => d.companyId === c.id).length;
            return (
              <Link key={c.id} to={`/sales/companies/${c.id}`} className="bg-surface border border-border rounded-sm p-3 hover:border-primary hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-sm bg-mod-sales/15 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-mod-sales" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold truncate">{c.name}</h3>
                      <p className="text-2xs text-muted-foreground truncate">{c.industry} · {c.size}</p>
                    </div>
                  </div>
                  <StatusPill variant={variantFor(c.clientType) as any}>{c.clientType}</StatusPill>
                </div>
                <div className="flex items-center gap-3 text-2xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.city}, {c.country}</span>
                  {c.website && <span className="flex items-center gap-1 truncate"><Globe className="w-3 h-3" /> {c.website.replace(/^https?:\/\//, "")}</span>}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border text-2xs">
                  <span className="text-muted-foreground">{cContacts} contacts · {cDeals} deals</span>
                  {am && (
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-sm bg-primary/15 text-primary flex items-center justify-center font-mono text-3xs font-bold">{am.initials}</div>
                      <span className="truncate max-w-[80px]">{am.name}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        {rows.length === 0 && <div className="text-center py-12 text-xs text-muted-foreground">No companies match filters</div>}
      </div>
    </div>
  );
}

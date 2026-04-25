import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Globe, MapPin, Mail, Phone } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/StatusPill";
import { useSalesStore, dealStageVariant } from "@/store/salesStore";
import { PEOPLE, inr } from "@/lib/mockData";

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const company = useSalesStore(s => s.companies.find(c => c.id === id));
  const contacts = useSalesStore(s => s.contacts.filter(c => c.companyId === id));
  const deals = useSalesStore(s => s.deals.filter(d => d.companyId === id));
  const leads = useSalesStore(s => s.leads.filter(l => l.company === company?.name));

  if (!company) return <div className="p-6 text-sm">Company not found. <Link to="/sales/companies" className="text-primary">Back</Link></div>;
  const am = PEOPLE.find(p => p.id === company.accountManagerId);
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title={company.name} subtitle={`${company.industry} · ${company.city}, ${company.country}`} accentVar="--mod-sales"
        actions={<Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate("/sales/companies")}><ArrowLeft className="w-3.5 h-3.5" /> Back</Button>} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-3 flex-1">
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Overview</h3>
            <p className="text-xs leading-relaxed mb-3">{company.description}</p>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <div><span className="text-muted-foreground">Tier:</span> <StatusPill variant="info">{company.accountTier}</StatusPill></div>
              <div><span className="text-muted-foreground">Type:</span> <StatusPill variant="success">{company.clientType}</StatusPill></div>
              <div><span className="text-muted-foreground">Size:</span> {company.size}</div>
              <div><span className="text-muted-foreground">Founded:</span> {company.foundedYear}</div>
              <div><span className="text-muted-foreground">Revenue:</span> {company.annualRevenue}</div>
              <div><span className="text-muted-foreground">Payment Terms:</span> {company.paymentTerms}</div>
              {company.gst && <div><span className="text-muted-foreground">GST:</span> <span className="font-mono">{company.gst}</span></div>}
              {company.pan && <div><span className="text-muted-foreground">PAN:</span> <span className="font-mono">{company.pan}</span></div>}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deals ({deals.length})</h3>
              <span className="text-2xs font-mono">{inr(totalValue)}</span>
            </div>
            <div className="space-y-1.5">
              {deals.map(d => (
                <Link key={d.id} to={`/sales/deals/${d.id}`} className="flex items-center justify-between p-2 bg-background rounded-sm border border-border hover:border-primary text-xs">
                  <div className="truncate">{d.title}</div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusPill variant={dealStageVariant(d.stage)}>{d.stage}</StatusPill>
                    <span className="font-mono">{inr(d.value)}</span>
                  </div>
                </Link>
              ))}
              {deals.length === 0 && <div className="text-2xs text-muted-foreground py-3 text-center">No deals yet</div>}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Leads ({leads.length})</h3>
            <div className="space-y-1.5">
              {leads.map(l => (
                <Link key={l.id} to={`/sales/leads/${l.id}`} className="flex items-center justify-between p-2 bg-background rounded-sm border border-border hover:border-primary text-xs">
                  <div className="truncate">{l.title}</div>
                  <span className="text-2xs text-muted-foreground">{l.status}</span>
                </Link>
              ))}
              {leads.length === 0 && <div className="text-2xs text-muted-foreground py-3 text-center">No leads</div>}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Account Manager</h3>
            {am ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-primary/15 text-primary flex items-center justify-center font-mono text-xs font-bold">{am.initials}</div>
                <div><div className="text-xs font-medium">{am.name}</div><div className="text-2xs text-muted-foreground">{am.dept}</div></div>
              </div>
            ) : <div className="text-2xs text-muted-foreground">Unassigned</div>}
          </div>

          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contacts ({contacts.length})</h3>
            <div className="space-y-2">
              {contacts.map(c => (
                <div key={c.id} className="flex items-start gap-2 text-xs">
                  <div className="w-6 h-6 rounded-sm bg-mod-sales/15 text-mod-sales flex items-center justify-center font-mono text-2xs font-bold">{c.firstName[0]}{c.lastName[0]}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{c.firstName} {c.lastName} {c.isPrimary && <span className="text-2xs text-warning">★</span>}</div>
                    <div className="text-2xs text-muted-foreground truncate">{c.designation}</div>
                    <div className="flex items-center gap-2 text-2xs text-muted-foreground mt-0.5">
                      <Mail className="w-2.5 h-2.5" /><span className="truncate">{c.email}</span>
                    </div>
                  </div>
                </div>
              ))}
              {contacts.length === 0 && <div className="text-2xs text-muted-foreground">No contacts</div>}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-sm p-3 space-y-2 text-xs">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Links</h3>
            {company.website && <div className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-muted-foreground" /><a href={company.website} target="_blank" className="text-primary truncate">{company.website}</a></div>}
            {company.linkedin && <div className="flex items-center gap-1.5"><Building2 className="w-3 h-3 text-muted-foreground" /><a href={company.linkedin} target="_blank" className="text-primary truncate">LinkedIn</a></div>}
            <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-muted-foreground" />{company.city}, {company.country}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

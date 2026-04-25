import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Linkedin, Building2 } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/StatusPill";
import { useSalesStore } from "@/store/salesStore";

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const contact = useSalesStore(s => s.contacts.find(c => c.id === id));
  const company = useSalesStore(s => s.companies.find(c => c.id === contact?.companyId));
  const leads = useSalesStore(s => s.leads.filter(l => l.email === contact?.email));

  if (!contact) return <div className="p-6 text-sm">Contact not found. <Link to="/sales/contacts" className="text-primary">Back</Link></div>;

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title={`${contact.firstName} ${contact.lastName}`} subtitle={`${contact.designation ?? ""} ${company ? "· " + company.name : ""}`} accentVar="--mod-sales"
        actions={<Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate("/sales/contacts")}><ArrowLeft className="w-3.5 h-3.5" /> Back</Button>} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-3 flex-1">
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Personal Info</h3>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <div><span className="text-muted-foreground">Designation:</span> {contact.designation ?? "—"}</div>
              <div><span className="text-muted-foreground">Department:</span> {contact.department ?? "—"}</div>
              <div><span className="text-muted-foreground">Timezone:</span> {contact.timezone}</div>
              <div><span className="text-muted-foreground">Language:</span> {contact.language ?? "English"}</div>
              <div><span className="text-muted-foreground">Best time:</span> {contact.bestTime ?? "—"}</div>
              <div><span className="text-muted-foreground">Preferred:</span> <StatusPill variant="info">{contact.preferredContact}</StatusPill></div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Linked Leads ({leads.length})</h3>
            <div className="space-y-1.5">
              {leads.map(l => (
                <Link key={l.id} to={`/sales/leads/${l.id}`} className="flex items-center justify-between p-2 bg-background rounded-sm border border-border hover:border-primary text-xs">
                  <div className="truncate">{l.title}</div>
                  <span className="text-2xs text-muted-foreground">{l.status}</span>
                </Link>
              ))}
              {leads.length === 0 && <div className="text-2xs text-muted-foreground py-3 text-center">No linked leads</div>}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-surface border border-border rounded-sm p-3 space-y-2 text-xs">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Contact</h3>
            <div className="flex items-center gap-2"><Mail className="w-3 h-3 text-muted-foreground" /><a href={`mailto:${contact.email}`} className="text-primary truncate">{contact.email}</a></div>
            {contact.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3 text-muted-foreground" /><span className="font-mono">{contact.phone}</span></div>}
            {contact.linkedin && <div className="flex items-center gap-2"><Linkedin className="w-3 h-3 text-muted-foreground" /><a href={contact.linkedin} target="_blank" className="text-primary truncate">LinkedIn</a></div>}
          </div>
          {company && (
            <div className="bg-surface border border-border rounded-sm p-3 text-xs">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Company</h3>
              <Link to={`/sales/companies/${company.id}`} className="flex items-center gap-2 hover:text-primary">
                <Building2 className="w-4 h-4 text-mod-sales" />
                <div>
                  <div className="font-medium">{company.name}</div>
                  <div className="text-2xs text-muted-foreground">{company.industry}</div>
                </div>
              </Link>
            </div>
          )}
          {contact.tags.length > 0 && (
            <div className="bg-surface border border-border rounded-sm p-3 text-xs">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1">{contact.tags.map(t => <span key={t} className="text-2xs bg-muted px-1.5 rounded-sm">{t}</span>)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

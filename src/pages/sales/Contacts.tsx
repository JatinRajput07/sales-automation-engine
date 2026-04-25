import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Mail, Phone, Linkedin } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/StatusPill";
import { useSalesStore } from "@/store/salesStore";

export default function Contacts() {
  const contacts = useSalesStore(s => s.contacts);
  const companies = useSalesStore(s => s.companies);
  const [q, setQ] = useState("");
  const [companyId, setCompanyId] = useState("all");

  const rows = useMemo(() => {
    let out = contacts;
    if (q) {
      const s = q.toLowerCase();
      out = out.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(s) || c.email.toLowerCase().includes(s) || (c.designation ?? "").toLowerCase().includes(s));
    }
    if (companyId !== "all") out = out.filter(c => c.companyId === companyId);
    return out;
  }, [contacts, q, companyId]);

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader
        title="Contacts"
        subtitle={`${contacts.length} people`}
        accentVar="--mod-sales"
        actions={<Link to="/sales/contacts/new"><Button size="sm" className="h-7 text-xs gap-1"><Plus className="w-3.5 h-3.5" /> New Contact</Button></Link>}
      />

      <div className="h-10 px-3 flex items-center gap-2 border-b border-border bg-surface/50 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search contacts…" className="h-7 pl-7 w-56 text-xs" />
        </div>
        <select value={companyId} onChange={e => setCompanyId(e.target.value)} className="h-7 px-2 rounded-sm bg-background border border-border text-xs">
          <option value="all">All Companies</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="p-3 flex-1">
        <div className="bg-surface border border-border rounded-sm overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40">
              <tr className="text-2xs uppercase text-muted-foreground tracking-wider">
                <th className="text-left px-3 h-8 font-medium">Name</th>
                <th className="text-left px-3 h-8 font-medium">Designation</th>
                <th className="text-left px-3 h-8 font-medium">Company</th>
                <th className="text-left px-3 h-8 font-medium">Email</th>
                <th className="text-left px-3 h-8 font-medium">Phone</th>
                <th className="text-left px-3 h-8 font-medium">Preferred</th>
                <th className="text-left px-3 h-8 font-medium">Tags</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(c => {
                const co = companies.find(x => x.id === c.companyId);
                return (
                  <tr key={c.id} className="border-t border-border hover:bg-surface-hover">
                    <td className="px-3 h-10">
                      <Link to={`/sales/contacts/${c.id}`} className="flex items-center gap-2 hover:text-primary">
                        <div className="w-6 h-6 rounded-sm bg-mod-sales/15 text-mod-sales flex items-center justify-center font-mono text-2xs font-bold">{c.firstName[0]}{c.lastName[0]}</div>
                        <div>
                          <div className="font-medium">{c.firstName} {c.lastName} {c.isPrimary && <span className="text-warning text-2xs">★</span>}</div>
                          <div className="text-3xs text-muted-foreground">{c.department}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 h-10">{c.designation}</td>
                    <td className="px-3 h-10">
                      {co ? <Link to={`/sales/companies/${co.id}`} className="hover:text-primary">{co.name}</Link> : "—"}
                    </td>
                    <td className="px-3 h-10"><a href={`mailto:${c.email}`} className="flex items-center gap-1 text-primary"><Mail className="w-3 h-3" />{c.email}</a></td>
                    <td className="px-3 h-10 font-mono text-2xs">{c.phone}</td>
                    <td className="px-3 h-10"><StatusPill variant="info">{c.preferredContact}</StatusPill></td>
                    <td className="px-3 h-10">
                      <div className="flex gap-1">{c.tags.map(t => <span key={t} className="text-2xs bg-muted px-1.5 rounded-sm">{t}</span>)}</div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No contacts match</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSalesStore } from "@/store/salesStore";
import { useToast } from "@/hooks/use-toast";

export default function ContactNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const addContact = useSalesStore(s => s.addContact);
  const companies = useSalesStore(s => s.companies);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", designation: "", department: "",
    companyId: companies[0]?.id ?? "", preferredContact: "Email" as const, timezone: "IST",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.email.trim()) return toast({ title: "Name & email required", variant: "destructive" });
    addContact({ ...form, tags: [], isPrimary: false });
    toast({ title: "Contact created" });
    navigate("/sales/contacts");
  }

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title="New Contact" accentVar="--mod-sales"
        actions={<Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => navigate(-1)}>Cancel</Button>} />
      <form onSubmit={submit} className="p-3 max-w-2xl space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-2xs">First Name *</Label><Input value={form.firstName} onChange={e => set("firstName", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-2xs">Last Name</Label><Input value={form.lastName} onChange={e => set("lastName", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-2xs">Email *</Label><Input type="email" value={form.email} onChange={e => set("email", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-2xs">Phone</Label><Input value={form.phone} onChange={e => set("phone", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-2xs">Designation</Label><Input value={form.designation} onChange={e => set("designation", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-2xs">Department</Label><Input value={form.department} onChange={e => set("department", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-2xs">Company</Label>
            <select value={form.companyId} onChange={e => set("companyId", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><Label className="text-2xs">Preferred Contact</Label>
            <select value={form.preferredContact} onChange={e => set("preferredContact", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
              {["Email","WhatsApp","Phone","LinkedIn"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" size="sm" className="h-8 text-xs">Create Contact</Button>
        </div>
      </form>
    </div>
  );
}

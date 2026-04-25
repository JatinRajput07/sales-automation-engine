import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSalesStore } from "@/store/salesStore";
import { useToast } from "@/hooks/use-toast";

export default function CompanyNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const addCompany = useSalesStore(s => s.addCompany);
  const [form, setForm] = useState({
    name: "", website: "", industry: "Technology", size: "11-50", country: "India", city: "",
    clientType: "Prospect" as const, accountTier: "SMB" as const, currency: "INR" as const,
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast({ title: "Name is required", variant: "destructive" });
    const id = addCompany({ ...form, tags: [] });
    toast({ title: "Company created" });
    navigate(`/sales/companies/${id}`);
  }

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title="New Company" subtitle="Create a new account" accentVar="--mod-sales"
        actions={<Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => navigate(-1)}>Cancel</Button>} />
      <form onSubmit={submit} className="p-3 max-w-2xl space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-2xs">Company Name *</Label><Input value={form.name} onChange={e => set("name", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-2xs">Website</Label><Input value={form.website} onChange={e => set("website", e.target.value)} className="h-8 text-xs" placeholder="https://" /></div>
          <div><Label className="text-2xs">Industry</Label>
            <select value={form.industry} onChange={e => set("industry", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
              {["Technology","E-commerce","Healthcare","Finance","Education","Manufacturing","Retail"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div><Label className="text-2xs">Size</Label>
            <select value={form.size} onChange={e => set("size", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
              {["1-10","11-50","51-200","201-1000","1000+"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div><Label className="text-2xs">Country</Label><Input value={form.country} onChange={e => set("country", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-2xs">City</Label><Input value={form.city} onChange={e => set("city", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-2xs">Client Type</Label>
            <select value={form.clientType} onChange={e => set("clientType", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
              {["Prospect","Lead","Active Client","Past Client","Partner"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div><Label className="text-2xs">Account Tier</Label>
            <select value={form.accountTier} onChange={e => set("accountTier", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
              {["Enterprise","Mid-Market","SMB","Startup"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" size="sm" className="h-8 text-xs">Create Company</Button>
        </div>
      </form>
    </div>
  );
}

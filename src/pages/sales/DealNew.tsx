import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSalesStore, ALL_DEAL_STAGES } from "@/store/salesStore";
import { PEOPLE, daysFromNow } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

export default function DealNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const addDeal = useSalesStore(s => s.addDeal);
  const companies = useSalesStore(s => s.companies);
  const [form, setForm] = useState({
    title: "", companyId: companies[0]?.id ?? "", stage: "Discovery" as const,
    value: 100000, currency: "INR" as const, probability: 30,
    expectedCloseDate: daysFromNow(30), ownerId: PEOPLE[0]?.id ?? "p1", source: "Website" as const,
  });
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return toast({ title: "Title required", variant: "destructive" });
    const id = addDeal({ ...form, tags: [], notes: "" });
    toast({ title: "Deal created" });
    navigate(`/sales/deals/${id}`);
  }

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title="New Deal" accentVar="--mod-sales"
        actions={<Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => navigate(-1)}>Cancel</Button>} />
      <form onSubmit={submit} className="p-3 max-w-2xl space-y-3">
        <div><Label className="text-2xs">Deal Title *</Label><Input value={form.title} onChange={e => set("title", e.target.value)} className="h-8 text-xs" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-2xs">Company</Label>
            <select value={form.companyId} onChange={e => set("companyId", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><Label className="text-2xs">Stage</Label>
            <select value={form.stage} onChange={e => set("stage", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
              {ALL_DEAL_STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div><Label className="text-2xs">Value</Label><Input type="number" value={form.value} onChange={e => set("value", Number(e.target.value))} className="h-8 text-xs" /></div>
          <div><Label className="text-2xs">Currency</Label>
            <select value={form.currency} onChange={e => set("currency", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
              <option>INR</option><option>USD</option>
            </select>
          </div>
          <div><Label className="text-2xs">Probability (%)</Label><Input type="number" min={0} max={100} value={form.probability} onChange={e => set("probability", Number(e.target.value))} className="h-8 text-xs" /></div>
          <div><Label className="text-2xs">Expected Close Date</Label><Input type="date" value={form.expectedCloseDate} onChange={e => set("expectedCloseDate", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-2xs">Owner</Label>
            <select value={form.ownerId} onChange={e => set("ownerId", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
              {PEOPLE.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div><Label className="text-2xs">Source</Label>
            <select value={form.source} onChange={e => set("source", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
              {["Upwork","LinkedIn","Referral","Website","Email","Direct Call","Event"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" size="sm" className="h-8 text-xs">Create Deal</Button>
        </div>
      </form>
    </div>
  );
}

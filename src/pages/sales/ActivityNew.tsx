import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Phone, Mail, Calendar, Monitor, FileText, Bell, StickyNote } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSalesStore, type Activity } from "@/store/salesStore";
import { PEOPLE } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

const TYPES: { type: Activity["type"]; icon: any }[] = [
  { type: "Call", icon: Phone },
  { type: "Email", icon: Mail },
  { type: "Meeting", icon: Calendar },
  { type: "Demo", icon: Monitor },
  { type: "Proposal", icon: FileText },
  { type: "Follow-up", icon: Bell },
  { type: "Note", icon: StickyNote },
];

export default function ActivityNew() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { toast } = useToast();
  const logActivity = useSalesStore(s => s.logActivity);
  const leads = useSalesStore(s => s.leads);
  const deals = useSalesStore(s => s.deals);

  const [form, setForm] = useState({
    type: "Call" as Activity["type"],
    leadId: params.get("leadId") ?? "",
    dealId: params.get("dealId") ?? "",
    subject: "",
    description: "",
    outcome: "Positive" as Activity["outcome"],
    nextStep: "",
    nextFollowUp: "",
    date: new Date().toISOString().slice(0, 10),
    duration: 30,
    byId: PEOPLE[0]?.id ?? "p1",
  });
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject.trim() || form.subject.length < 5) return toast({ title: "Subject must be at least 5 characters", variant: "destructive" });
    if (!form.leadId && !form.dealId) return toast({ title: "Link to a lead or deal", variant: "destructive" });
    logActivity({
      type: form.type,
      leadId: form.leadId || undefined,
      dealId: form.dealId || undefined,
      subject: form.subject,
      description: form.description || undefined,
      outcome: form.outcome,
      nextStep: form.nextStep || undefined,
      nextFollowUp: form.nextFollowUp || undefined,
      date: form.date,
      duration: ["Call", "Meeting", "Demo"].includes(form.type) ? form.duration : undefined,
      byId: form.byId,
    });
    toast({ title: "Activity logged" });
    if (form.leadId) navigate(`/sales/leads/${form.leadId}`);
    else navigate("/sales/activities");
  }

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title="Log Activity" accentVar="--mod-sales"
        actions={<Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => navigate(-1)}>Cancel</Button>} />

      <form onSubmit={submit} className="p-3 max-w-2xl space-y-3">
        <div className="bg-surface border border-border rounded-sm p-3">
          <Label className="text-2xs">Activity Type *</Label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 mt-1.5">
            {TYPES.map(t => {
              const Icon = t.icon;
              const active = form.type === t.type;
              return (
                <button type="button" key={t.type} onClick={() => set("type", t.type)}
                  className={`h-14 rounded-sm border flex flex-col items-center justify-center gap-1 text-2xs transition-colors ${active ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-surface-hover"}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {t.type}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-surface border border-border rounded-sm p-3">
          <div><Label className="text-2xs">Linked Lead</Label>
            <select value={form.leadId} onChange={e => set("leadId", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
              <option value="">— None —</option>
              {leads.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>
          </div>
          <div><Label className="text-2xs">Linked Deal</Label>
            <select value={form.dealId} onChange={e => set("dealId", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
              <option value="">— None —</option>
              {deals.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>
          <div><Label className="text-2xs">Date *</Label><Input type="date" value={form.date} onChange={e => set("date", e.target.value)} className="h-8 text-xs" /></div>
          {["Call", "Meeting", "Demo"].includes(form.type) && (
            <div><Label className="text-2xs">Duration (min)</Label><Input type="number" value={form.duration} onChange={e => set("duration", Number(e.target.value))} className="h-8 text-xs" /></div>
          )}
          <div><Label className="text-2xs">Logged By</Label>
            <select value={form.byId} onChange={e => set("byId", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
              {PEOPLE.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div><Label className="text-2xs">Outcome *</Label>
            <select value={form.outcome} onChange={e => set("outcome", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
              {["Positive","Neutral","Negative","No Response"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-sm p-3 space-y-3">
          <div><Label className="text-2xs">Subject *</Label><Input value={form.subject} onChange={e => set("subject", e.target.value)} className="h-8 text-xs" placeholder="e.g. Discovery call with Arjun" /></div>
          <div><Label className="text-2xs">Description / Notes</Label><Textarea rows={4} value={form.description} onChange={e => set("description", e.target.value)} className="text-xs" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-2xs">Next Step</Label><Input value={form.nextStep} onChange={e => set("nextStep", e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-2xs">Next Follow-up</Label><Input type="date" value={form.nextFollowUp} onChange={e => set("nextFollowUp", e.target.value)} className="h-8 text-xs" /></div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" size="sm" className="h-8 text-xs">Log Activity</Button>
        </div>
      </form>
    </div>
  );
}

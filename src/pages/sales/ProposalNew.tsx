import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSalesStore, type ProposalLineItem } from "@/store/salesStore";
import { PEOPLE, daysFromNow, inr } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

export default function ProposalNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const addProposal = useSalesStore(s => s.addProposal);
  const companies = useSalesStore(s => s.companies);
  const leads = useSalesStore(s => s.leads);
  const deals = useSalesStore(s => s.deals);

  const [form, setForm] = useState({
    title: "", companyId: companies[0]?.id ?? "", leadId: "", dealId: "",
    preparedById: PEOPLE[0]?.id ?? "p1", proposalDate: daysFromNow(0), validUntil: daysFromNow(30),
    currency: "INR" as const,
    executiveSummary: "", approach: "", scopeOfWork: "", timeline: "", terms: "",
    taxPercent: 18, discount: 0,
  });
  const [items, setItems] = useState<ProposalLineItem[]>([
    { id: "n1", item: "UI/UX Design", description: "Figma screens", qty: 1, unit: "Project", rate: 80000 },
  ]);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  function generateAI() {
    const co = companies.find(c => c.id === form.companyId);
    setForm(f => ({
      ...f,
      title: f.title || `Proposal for ${co?.name ?? "Client"}`,
      executiveSummary: `We propose a tailored solution for ${co?.name ?? "your team"}, leveraging our expertise to deliver measurable business outcomes within budget and timeline.`,
      approach: "Agile, sprint-based delivery with weekly demos and continuous client feedback. Dedicated team with clear ownership of design, frontend, backend, and QA.",
      scopeOfWork: "1. Discovery & requirements gathering\n2. UX/UI design with Figma\n3. Frontend development (React)\n4. Backend & API development\n5. QA, testing & deployment\n6. Post-launch support (30 days)",
      timeline: "Week 1: Discovery\nWeeks 2-4: Design\nWeeks 5-10: Development\nWeek 11: QA\nWeek 12: Launch",
      terms: "Payment: 50% advance, 25% mid-project, 25% on launch. 30 days post-launch support included. IP transfers on final payment.",
    }));
    toast({ title: "AI draft generated", description: "Review and edit each section." });
  }

  function addRow() {
    setItems(it => [...it, { id: `n${Date.now()}`, item: "", description: "", qty: 1, unit: "Project", rate: 0 }]);
  }
  function updateRow(id: string, patch: Partial<ProposalLineItem>) {
    setItems(it => it.map(x => x.id === id ? { ...x, ...patch } : x));
  }
  function removeRow(id: string) {
    setItems(it => it.filter(x => x.id !== id));
  }

  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const tax = Math.round((subtotal - form.discount) * (form.taxPercent / 100));
  const total = subtotal - form.discount + tax;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return toast({ title: "Title required", variant: "destructive" });
    if (items.length === 0) return toast({ title: "Add at least one line item", variant: "destructive" });
    const id = addProposal({
      ...form,
      leadId: form.leadId || undefined,
      dealId: form.dealId || undefined,
      status: "Draft",
      lineItems: items,
    });
    toast({ title: "Proposal created" });
    navigate(`/sales/proposals/${id}`);
  }

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title="New Proposal" subtitle="AI-powered proposal builder" accentVar="--mod-sales"
        actions={
          <>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={generateAI}><Sparkles className="w-3.5 h-3.5" /> Generate with AI</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => navigate(-1)}>Cancel</Button>
          </>
        } />

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-3 flex-1">
        <div className="lg:col-span-2 space-y-3">
          <Section title="Proposal Info">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label className="text-2xs">Title *</Label><Input value={form.title} onChange={e => set("title", e.target.value)} className="h-8 text-xs" /></div>
              <div><Label className="text-2xs">Company</Label>
                <select value={form.companyId} onChange={e => set("companyId", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
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
              <div><Label className="text-2xs">Prepared By</Label>
                <select value={form.preparedById} onChange={e => set("preparedById", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
                  {PEOPLE.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div><Label className="text-2xs">Proposal Date</Label><Input type="date" value={form.proposalDate} onChange={e => set("proposalDate", e.target.value)} className="h-8 text-xs" /></div>
              <div><Label className="text-2xs">Valid Until</Label><Input type="date" value={form.validUntil} onChange={e => set("validUntil", e.target.value)} className="h-8 text-xs" /></div>
              <div><Label className="text-2xs">Currency</Label>
                <select value={form.currency} onChange={e => set("currency", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
                  <option>INR</option><option>USD</option>
                </select>
              </div>
            </div>
          </Section>

          <Section title="Executive Summary"><Textarea rows={3} value={form.executiveSummary} onChange={e => set("executiveSummary", e.target.value)} className="text-xs" /></Section>
          <Section title="Our Approach"><Textarea rows={3} value={form.approach} onChange={e => set("approach", e.target.value)} className="text-xs" /></Section>
          <Section title="Scope of Work"><Textarea rows={5} value={form.scopeOfWork} onChange={e => set("scopeOfWork", e.target.value)} className="text-xs" /></Section>
          <Section title="Timeline"><Textarea rows={4} value={form.timeline} onChange={e => set("timeline", e.target.value)} className="text-xs" /></Section>

          <Section title="Pricing">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-2xs uppercase text-muted-foreground tracking-wider">
                    <th className="text-left h-7 font-medium">Item</th>
                    <th className="text-left h-7 font-medium">Description</th>
                    <th className="text-center h-7 font-medium w-12">Qty</th>
                    <th className="text-left h-7 font-medium w-20">Unit</th>
                    <th className="text-right h-7 font-medium w-28">Rate</th>
                    <th className="text-right h-7 font-medium w-28">Amount</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(it => (
                    <tr key={it.id} className="border-t border-border">
                      <td className="py-1 pr-1"><Input value={it.item} onChange={e => updateRow(it.id, { item: e.target.value })} className="h-7 text-xs" /></td>
                      <td className="py-1 pr-1"><Input value={it.description} onChange={e => updateRow(it.id, { description: e.target.value })} className="h-7 text-xs" /></td>
                      <td className="py-1 pr-1"><Input type="number" value={it.qty} onChange={e => updateRow(it.id, { qty: Number(e.target.value) })} className="h-7 text-xs text-center" /></td>
                      <td className="py-1 pr-1"><Input value={it.unit} onChange={e => updateRow(it.id, { unit: e.target.value })} className="h-7 text-xs" /></td>
                      <td className="py-1 pr-1"><Input type="number" value={it.rate} onChange={e => updateRow(it.id, { rate: Number(e.target.value) })} className="h-7 text-xs text-right" /></td>
                      <td className="py-1 pr-1 text-right font-mono">{inr(it.qty * it.rate)}</td>
                      <td><button type="button" onClick={() => removeRow(it.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1 mt-2" onClick={addRow}><Plus className="w-3 h-3" /> Add Row</Button>
            <div className="mt-3 pt-3 border-t border-border space-y-1 text-xs max-w-xs ml-auto">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">{inr(subtotal)}</span></div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-muted-foreground">Discount</span>
                <Input type="number" value={form.discount} onChange={e => set("discount", Number(e.target.value))} className="h-7 text-xs w-24 text-right" />
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-muted-foreground">Tax %</span>
                <Input type="number" value={form.taxPercent} onChange={e => set("taxPercent", Number(e.target.value))} className="h-7 text-xs w-16 text-right" />
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="font-mono">{inr(tax)}</span></div>
              <div className="flex justify-between pt-1 border-t border-border"><span className="font-semibold">Total</span><span className="font-mono font-bold">{inr(total)}</span></div>
            </div>
          </Section>

          <Section title="Terms & Conditions"><Textarea rows={4} value={form.terms} onChange={e => set("terms", e.target.value)} className="text-xs" /></Section>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" size="sm" className="h-8 text-xs">Save Draft</Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-surface border border-border rounded-sm p-3 sticky top-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold mb-2"><Sparkles className="w-3.5 h-3.5 text-mod-sales" /> AI Assist</div>
            <p className="text-2xs text-muted-foreground mb-2">Click "Generate with AI" in the header to draft all sections from scratch based on the selected company and lead.</p>
            <div className="text-2xs text-muted-foreground border-t border-border pt-2 mt-2">
              <div>Sections: 5 / 5</div>
              <div>Line items: {items.length}</div>
              <div className="font-mono mt-1">Total: {inr(total)}</div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-sm p-3">
      <h3 className="text-2xs uppercase font-semibold text-muted-foreground tracking-wider mb-2">{title}</h3>
      {children}
    </div>
  );
}

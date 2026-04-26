import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Plus, Trash2, Download, FileText, FileType, FileCode, Upload, Palette, Eye, Edit3, FilePlus2, X, Layers } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSalesStore, type ProposalLineItem } from "@/store/salesStore";
import { PEOPLE, daysFromNow, inr } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { exportProposalPDF, exportProposalDOCX, exportProposalTXT, generateAIProposal, type ProposalExportData } from "@/lib/proposalExport";
import { buildMergedProposalPDF, getPdfPageCount, parsePageRange, downloadBytes, bytesToBlobUrl } from "@/lib/proposalMerge";

type Mode = "edit" | "preview";

export default function ProposalNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const addProposal = useSalesStore(s => s.addProposal);
  const companies = useSalesStore(s => s.companies);
  const leads = useSalesStore(s => s.leads);
  const deals = useSalesStore(s => s.deals);
  const settings = useSalesStore(s => s.proposalSettings);
  const updateSettings = useSalesStore(s => s.updateProposalSettings);

  const [mode, setMode] = useState<Mode>("edit");
  const [tone, setTone] = useState<"Persuasive" | "Professional" | "Consultative" | "Bold">(settings.defaultTone);
  const [aiBrief, setAiBrief] = useState("");
  const [generating, setGenerating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const templateFileRef = useRef<HTMLInputElement>(null);

  // Company-template merge state
  const [templateBytes, setTemplateBytes] = useState<Uint8Array | null>(null);
  const [templateName, setTemplateName] = useState<string>("");
  const [templatePages, setTemplatePages] = useState<number>(0);
  const [preRange, setPreRange] = useState<string>("1-4");
  const [postRange, setPostRange] = useState<string>("");
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [merging, setMerging] = useState(false);

  const [form, setForm] = useState({
    title: "", companyId: companies[0]?.id ?? "", leadId: "", dealId: "",
    preparedById: PEOPLE[0]?.id ?? "p1", proposalDate: daysFromNow(0), validUntil: daysFromNow(settings.defaultValidityDays),
    currency: "INR" as const,
    executiveSummary: "", problemStatement: "", ourSolution: "", timeline: "", terms: settings.defaultTerms,
    taxPercent: 18, discount: 0,
  });
  const [items, setItems] = useState<ProposalLineItem[]>([]);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const company = useMemo(() => companies.find(c => c.id === form.companyId), [companies, form.companyId]);
  const preparedBy = useMemo(() => PEOPLE.find(p => p.id === form.preparedById), [form.preparedById]);

  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const tax = Math.round((subtotal - form.discount) * (form.taxPercent / 100));
  const total = subtotal - form.discount + tax;

  function generateAI() {
    setGenerating(true);
    setTimeout(() => {
      const ai = generateAIProposal({
        clientName: company?.name ?? "the Client",
        industry: company?.industry,
        projectType: "Digital Solution",
        brief: aiBrief,
        tone,
        brandName: settings.brandName,
      });
      setForm(f => ({
        ...f,
        title: f.title || ai.title,
        executiveSummary: ai.sections.executiveSummary,
        problemStatement: ai.sections.problemStatement,
        ourSolution: ai.sections.ourSolution,
        timeline: ai.sections.timeline,
      }));
      if (items.length === 0) {
        setItems(ai.suggestedItems.map((it, i) => ({ ...it, id: `ai${Date.now()}_${i}` })));
      }
      setGenerating(false);
      setMode("preview");
      toast({ title: "AI proposal generated", description: `${tone} tone applied across all sections.` });
    }, 600);
  }

  function buildExportData(): ProposalExportData {
    const sections = [
      settings.includeSections.executiveSummary && { title: "Executive Summary", body: form.executiveSummary },
      settings.includeSections.problemStatement && { title: "Problem Statement", body: form.problemStatement },
      settings.includeSections.ourSolution && { title: "Our Solution", body: form.ourSolution },
      settings.includeSections.timeline && { title: "Timeline", body: form.timeline },
    ].filter(Boolean) as { title: string; body: string }[];
    return {
      title: form.title || `Proposal for ${company?.name ?? "Client"}`,
      clientName: company?.name ?? "Client",
      preparedBy: preparedBy?.name ?? "—",
      proposalDate: form.proposalDate,
      validUntil: form.validUntil,
      sections,
      lineItems: settings.includeSections.pricing ? items : [],
      subtotal, discount: form.discount, taxPercent: form.taxPercent, tax, total,
      currency: form.currency,
      terms: settings.includeSections.terms ? form.terms : undefined,
    };
  }

  function handleExport(kind: "pdf" | "docx" | "txt") {
    const data = buildExportData();
    if (kind === "pdf") exportProposalPDF(data, settings);
    if (kind === "docx") exportProposalDOCX(data, settings);
    if (kind === "txt") exportProposalTXT(data, settings);
    toast({ title: `Exported as ${kind.toUpperCase()}` });
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateSettings({ brandLogo: reader.result as string });
      toast({ title: "Logo uploaded" });
    };
    reader.readAsDataURL(file);
  }

  async function handleTemplateUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast({ title: "Only PDF files supported", variant: "destructive" });
      return;
    }
    try {
      const buf = new Uint8Array(await file.arrayBuffer());
      const pages = await getPdfPageCount(buf);
      setTemplateBytes(buf);
      setTemplateName(file.name);
      setTemplatePages(pages);
      // Smart defaults: first 4 + last page
      setPreRange(pages >= 4 ? "1-4" : `1-${pages}`);
      setPostRange(pages > 4 ? `${pages}` : "");
      toast({ title: "Template loaded", description: `${file.name} · ${pages} pages` });
    } catch {
      toast({ title: "Failed to read PDF", variant: "destructive" });
    } finally {
      if (templateFileRef.current) templateFileRef.current.value = "";
    }
  }

  function clearTemplate() {
    setTemplateBytes(null);
    setTemplateName("");
    setTemplatePages(0);
    setPreRange("");
    setPostRange("");
  }

  async function handleMergedPreview() {
    setMerging(true);
    try {
      const data = buildExportData();
      const bytes = await buildMergedProposalPDF({
        templateBytes,
        prePages: parsePageRange(preRange, templatePages),
        postPages: parsePageRange(postRange, templatePages),
        data,
        settings,
      });
      if (mergedUrl) URL.revokeObjectURL(mergedUrl);
      const url = bytesToBlobUrl(bytes);
      setMergedUrl(url);
      setMergeOpen(true);
    } catch (err) {
      toast({ title: "Merge failed", description: String(err), variant: "destructive" });
    } finally {
      setMerging(false);
    }
  }

  async function handleMergedDownload() {
    setMerging(true);
    try {
      const data = buildExportData();
      const bytes = await buildMergedProposalPDF({
        templateBytes,
        prePages: parsePageRange(preRange, templatePages),
        postPages: parsePageRange(postRange, templatePages),
        data,
        settings,
      });
      downloadBytes(bytes, `${(data.title || "proposal").replace(/[^a-z0-9]+/gi, "_")}_merged.pdf`);
      toast({ title: "Merged PDF downloaded" });
    } catch (err) {
      toast({ title: "Merge failed", description: String(err), variant: "destructive" });
    } finally {
      setMerging(false);
    }
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

  function saveDraft() {
    if (!form.title.trim()) return toast({ title: "Title required", variant: "destructive" });
    const id = addProposal({
      ...form,
      leadId: form.leadId || undefined,
      dealId: form.dealId || undefined,
      status: "Draft",
      lineItems: items,
      approach: form.ourSolution,
      scopeOfWork: form.problemStatement,
    } as any);
    toast({ title: "Proposal saved" });
    navigate(`/sales/proposals/${id}`);
  }

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader
        title="AI Proposal Studio"
        subtitle="Premium agency-grade proposals · Document preview · Multi-format export"
        accentVar="--mod-sales"
        actions={
          <>
            <div className="flex items-center bg-surface border border-border rounded-sm h-7">
              <button onClick={() => setMode("edit")} className={`h-7 px-2.5 text-xs flex items-center gap-1 rounded-sm ${mode === "edit" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"}`}><Edit3 className="w-3 h-3" /> Edit</button>
              <button onClick={() => setMode("preview")} className={`h-7 px-2.5 text-xs flex items-center gap-1 rounded-sm ${mode === "preview" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"}`}><Eye className="w-3 h-3" /> Preview</button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Download className="w-3.5 h-3.5" /> Export</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-2xs">Download as</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport("pdf")} className="text-xs gap-2"><FileType className="w-3.5 h-3.5 text-destructive" /> PDF Document<span className="ml-auto text-2xs text-muted-foreground">.pdf</span></DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("docx")} className="text-xs gap-2"><FileText className="w-3.5 h-3.5 text-primary" /> Word Document<span className="ml-auto text-2xs text-muted-foreground">.doc</span></DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("txt")} className="text-xs gap-2"><FileCode className="w-3.5 h-3.5 text-muted-foreground" /> Plain Text<span className="ml-auto text-2xs text-muted-foreground">.txt</span></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" className="h-7 text-xs" onClick={saveDraft}>Save Draft</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => navigate(-1)}>Cancel</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-3 p-3 flex-1">
        {/* Left rail: AI + Branding */}
        <div className="space-y-3">
          <div className="bg-surface border border-border rounded-sm p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold mb-2"><Sparkles className="w-3.5 h-3.5 text-mod-sales" /> AI Generator</div>
            <div className="space-y-2">
              <div>
                <Label className="text-2xs text-muted-foreground">Client</Label>
                <select value={form.companyId} onChange={e => set("companyId", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-2xs text-muted-foreground">Tone</Label>
                <select value={tone} onChange={e => setTone(e.target.value as any)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
                  <option>Persuasive</option><option>Professional</option><option>Consultative</option><option>Bold</option>
                </select>
              </div>
              <div>
                <Label className="text-2xs text-muted-foreground">Brief (optional)</Label>
                <Textarea rows={3} value={aiBrief} onChange={e => setAiBrief(e.target.value)} placeholder="Project context, goals, constraints…" className="text-xs" />
              </div>
              <Button size="sm" className="h-8 text-xs w-full gap-1.5" onClick={generateAI} disabled={generating}>
                <Sparkles className="w-3.5 h-3.5" /> {generating ? "Generating…" : "Generate Proposal"}
              </Button>
              <p className="text-2xs text-muted-foreground leading-relaxed">Generates Executive Summary, Problem Statement, Our Solution, Timeline & suggested pricing in Fortune-500 tone.</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-sm p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold mb-2"><Palette className="w-3.5 h-3.5 text-mod-sales" /> Branding</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-sm border border-border bg-background flex items-center justify-center overflow-hidden">
                  {settings.brandLogo ? <img src={settings.brandLogo} className="max-w-full max-h-full object-contain" /> : <span className="text-3xs text-muted-foreground">No logo</span>}
                </div>
                <div className="flex-1 space-y-1">
                  <Button type="button" variant="outline" size="sm" className="h-7 text-xs w-full gap-1" onClick={() => fileRef.current?.click()}><Upload className="w-3 h-3" /> Upload Logo</Button>
                  {settings.brandLogo && <button onClick={() => updateSettings({ brandLogo: undefined })} className="text-3xs text-destructive hover:underline">Remove</button>}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>
              </div>
              <div>
                <Label className="text-2xs text-muted-foreground">Brand Name</Label>
                <Input value={settings.brandName} onChange={e => updateSettings({ brandName: e.target.value })} className="h-7 text-xs" />
              </div>
              <div>
                <Label className="text-2xs text-muted-foreground">Tagline</Label>
                <Input value={settings.brandTagline} onChange={e => updateSettings({ brandTagline: e.target.value })} className="h-7 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-2xs text-muted-foreground">Primary</Label>
                  <input type="color" value={settings.primaryColor} onChange={e => updateSettings({ primaryColor: e.target.value })} className="h-7 w-full rounded-sm border border-border bg-background" />
                </div>
                <div>
                  <Label className="text-2xs text-muted-foreground">Accent</Label>
                  <input type="color" value={settings.accentColor} onChange={e => updateSettings({ accentColor: e.target.value })} className="h-7 w-full rounded-sm border border-border bg-background" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-sm p-3 text-2xs text-muted-foreground">
            <div className="flex justify-between"><span>Sections</span><span>{[form.executiveSummary, form.problemStatement, form.ourSolution, form.timeline].filter(s => s.trim()).length} / 4</span></div>
            <div className="flex justify-between"><span>Line items</span><span>{items.length}</span></div>
            <div className="flex justify-between font-mono mt-1 pt-1 border-t border-border"><span>Total</span><span className="text-foreground font-semibold">{inr(total)}</span></div>
          </div>
        </div>

        {/* Right: Edit form OR Document preview */}
        <div className="min-w-0">
          {mode === "edit" ? (
            <EditForm
              form={form} set={set} items={items} addRow={addRow} updateRow={updateRow} removeRow={removeRow}
              companies={companies} leads={leads} deals={deals}
              subtotal={subtotal} tax={tax} total={total}
            />
          ) : (
            <DocumentPreview
              data={buildExportData()}
              settings={settings}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function EditForm({ form, set, items, addRow, updateRow, removeRow, companies, leads, deals, subtotal, tax, total }: any) {
  return (
    <div className="space-y-3">
      <Section title="Proposal Info">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label className="text-2xs">Title *</Label><Input value={form.title} onChange={e => set("title", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-2xs">Linked Lead</Label>
            <select value={form.leadId} onChange={e => set("leadId", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
              <option value="">— None —</option>
              {leads.map((l: any) => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>
          </div>
          <div><Label className="text-2xs">Linked Deal</Label>
            <select value={form.dealId} onChange={e => set("dealId", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
              <option value="">— None —</option>
              {deals.map((d: any) => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>
          <div><Label className="text-2xs">Prepared By</Label>
            <select value={form.preparedById} onChange={e => set("preparedById", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
              {PEOPLE.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div><Label className="text-2xs">Currency</Label>
            <select value={form.currency} onChange={e => set("currency", e.target.value)} className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
              <option>INR</option><option>USD</option>
            </select>
          </div>
          <div><Label className="text-2xs">Date</Label><Input type="date" value={form.proposalDate} onChange={e => set("proposalDate", e.target.value)} className="h-8 text-xs" /></div>
          <div><Label className="text-2xs">Valid Until</Label><Input type="date" value={form.validUntil} onChange={e => set("validUntil", e.target.value)} className="h-8 text-xs" /></div>
        </div>
      </Section>

      <Section title="Executive Summary"><Textarea rows={5} value={form.executiveSummary} onChange={e => set("executiveSummary", e.target.value)} className="text-xs leading-relaxed" /></Section>
      <Section title="Problem Statement"><Textarea rows={5} value={form.problemStatement} onChange={e => set("problemStatement", e.target.value)} className="text-xs leading-relaxed" /></Section>
      <Section title="Our Solution"><Textarea rows={6} value={form.ourSolution} onChange={e => set("ourSolution", e.target.value)} className="text-xs leading-relaxed" /></Section>
      <Section title="Timeline"><Textarea rows={5} value={form.timeline} onChange={e => set("timeline", e.target.value)} className="text-xs leading-relaxed" /></Section>

      <Section title="Investment / Pricing">
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
              {items.map((it: ProposalLineItem) => (
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
              {items.length === 0 && (
                <tr><td colSpan={7} className="text-center py-6 text-muted-foreground text-xs">No line items yet. Use AI generator or add manually.</td></tr>
              )}
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
    </div>
  );
}

function DocumentPreview({ data, settings }: { data: ProposalExportData; settings: ReturnType<typeof useSalesStore.getState>["proposalSettings"] }) {
  const fmt = (n: number) => {
    const s = new Intl.NumberFormat(data.currency === "INR" ? "en-IN" : "en-US", { maximumFractionDigits: 0 }).format(n);
    return data.currency === "INR" ? `₹${s}` : `$${s}`;
  };

  const renderBody = (body: string) => {
    const lines = body.split(/\n+/).filter(Boolean);
    const allBullets = lines.length > 1 && lines.every(l => /^\s*[-•\d+\.]/.test(l));
    if (allBullets) {
      return (
        <ul className="space-y-2 my-3">
          {lines.map((l, i) => (
            <li key={i} className="flex gap-3 leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: settings.accentColor }} />
              <span>{l.replace(/^[-•]\s*/, "").replace(/^\d+\.\s*/, "")}</span>
            </li>
          ))}
        </ul>
      );
    }
    return lines.map((l, i) => <p key={i} className="leading-relaxed mb-3">{l}</p>);
  };

  const fontStack = settings.fontFamily === "Inter"
    ? "'Inter', system-ui, -apple-system, sans-serif"
    : settings.fontFamily === "Helvetica"
    ? "'Helvetica Neue', Helvetica, Arial, sans-serif"
    : settings.fontFamily === "Georgia"
    ? "Georgia, 'Times New Roman', serif"
    : "'Times New Roman', Times, serif";

  return (
    <div className="bg-muted/40 rounded-sm p-4 lg:p-6 overflow-auto">
      {/* A4-ish document */}
      <div
        className="mx-auto bg-white shadow-2xl text-[#1a1a1a]"
        style={{
          maxWidth: "820px",
          minHeight: "1100px",
          padding: "60px 70px",
          fontFamily: fontStack,
          fontSize: "11pt",
          lineHeight: 1.65,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-5" style={{ borderBottom: `3px solid ${settings.accentColor}` }}>
          <div className="w-20 h-20 flex items-center justify-center">
            {settings.brandLogo ? (
              <img src={settings.brandLogo} className="max-w-full max-h-full object-contain" alt="logo" />
            ) : (
              <div className="w-16 h-16 rounded flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: settings.primaryColor }}>
                {settings.brandName.charAt(0)}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="font-bold text-base" style={{ color: settings.primaryColor }}>{settings.brandName}</div>
            <div className="text-xs" style={{ color: "#888" }}>{settings.brandTagline}</div>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-bold mt-10 mb-3 leading-tight" style={{ color: settings.primaryColor, fontSize: "30pt", letterSpacing: "-0.02em" }}>
          {data.title}
        </h1>
        <div className="text-xs mb-2" style={{ color: "#666" }}>
          Prepared for <span className="font-semibold" style={{ color: settings.primaryColor }}>{data.clientName}</span> · By {data.preparedBy}
        </div>
        <div className="text-xs mb-10" style={{ color: "#888" }}>
          Date: {data.proposalDate} · Valid until: {data.validUntil}
        </div>

        {/* Sections */}
        {data.sections.map((sec, i) => (
          sec.body?.trim() ? (
            <section key={i} className="mb-8">
              <h2 className="font-bold uppercase tracking-wider text-sm mb-1" style={{ color: settings.accentColor }}>{sec.title}</h2>
              <div className="w-10 h-0.5 mb-4" style={{ backgroundColor: settings.accentColor }} />
              <div className="text-[#333]">{renderBody(sec.body)}</div>
            </section>
          ) : null
        ))}

        {/* Pricing */}
        {data.lineItems.length > 0 && (
          <section className="mb-8">
            <h2 className="font-bold uppercase tracking-wider text-sm mb-1" style={{ color: settings.accentColor }}>Investment</h2>
            <div className="w-10 h-0.5 mb-4" style={{ backgroundColor: settings.accentColor }} />
            <table className="w-full text-xs">
              <thead>
                <tr style={{ backgroundColor: settings.primaryColor, color: "white" }}>
                  <th className="text-left p-2.5 font-semibold uppercase tracking-wider text-[10px]">Item</th>
                  <th className="text-center p-2.5 font-semibold uppercase tracking-wider text-[10px] w-20">Qty</th>
                  <th className="text-right p-2.5 font-semibold uppercase tracking-wider text-[10px] w-28">Rate</th>
                  <th className="text-right p-2.5 font-semibold uppercase tracking-wider text-[10px] w-32">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.lineItems.map((it, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #e5e5e5" }}>
                    <td className="p-2.5 align-top">
                      <div className="font-semibold">{it.item}</div>
                      {it.description && <div className="text-[10px] mt-0.5" style={{ color: "#888" }}>{it.description}</div>}
                    </td>
                    <td className="p-2.5 align-top text-center">{it.qty} {it.unit}</td>
                    <td className="p-2.5 align-top text-right font-mono">{fmt(it.rate)}</td>
                    <td className="p-2.5 align-top text-right font-mono font-semibold">{fmt(it.qty * it.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="ml-auto mt-4" style={{ width: "280px" }}>
              <div className="flex justify-between py-1 text-xs" style={{ color: "#666" }}><span>Subtotal</span><span className="font-mono">{fmt(data.subtotal)}</span></div>
              {data.discount > 0 && <div className="flex justify-between py-1 text-xs" style={{ color: "#666" }}><span>Discount</span><span className="font-mono">-{fmt(data.discount)}</span></div>}
              {data.taxPercent > 0 && <div className="flex justify-between py-1 text-xs" style={{ color: "#666" }}><span>Tax ({data.taxPercent}%)</span><span className="font-mono">{fmt(data.tax)}</span></div>}
              <div className="flex justify-between py-2 mt-1 text-base font-bold" style={{ color: settings.primaryColor, borderTop: `2px solid ${settings.primaryColor}` }}>
                <span>TOTAL</span><span className="font-mono">{fmt(data.total)}</span>
              </div>
            </div>
          </section>
        )}

        {/* Terms */}
        {data.terms?.trim() && (
          <section className="mb-8">
            <h2 className="font-bold uppercase tracking-wider text-sm mb-1" style={{ color: settings.accentColor }}>Terms & Conditions</h2>
            <div className="w-10 h-0.5 mb-4" style={{ backgroundColor: settings.accentColor }} />
            <p className="text-xs leading-relaxed" style={{ color: "#555" }}>{data.terms}</p>
          </section>
        )}

        {/* Footer */}
        <div className="mt-16 pt-4 text-center text-[10px]" style={{ color: "#999", borderTop: "1px solid #e5e5e5" }}>
          {settings.footerText}
        </div>
      </div>
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

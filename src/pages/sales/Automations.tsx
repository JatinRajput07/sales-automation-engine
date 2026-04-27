import { useMemo, useState } from "react";
import { Plus, Workflow, Zap, Bell, RefreshCw, Trash2, Play, Pause, Clock, Hash, ChevronDown, Search, Filter, AlertCircle } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusPill } from "@/components/ui/StatusPill";
import { Switch } from "@/components/ui/switch";
import { useSalesStore, type Automation } from "@/store/salesStore";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORY_META: Record<Automation["category"], { icon: typeof Workflow; color: string; bg: string }> = {
  Assignment:      { icon: Workflow,  color: "text-blue-400",    bg: "bg-blue-500/10" },
  "Follow-up":     { icon: RefreshCw, color: "text-amber-400",   bg: "bg-amber-500/10" },
  "Status Change": { icon: Zap,       color: "text-purple-400",  bg: "bg-purple-500/10" },
  Notification:    { icon: Bell,      color: "text-emerald-400", bg: "bg-emerald-500/10" },
};

export default function Automations() {
  const automations = useSalesStore(s => s.automations);
  const toggle = useSalesStore(s => s.toggleAutomation);
  const addAutomation = useSalesStore(s => s.addAutomation);
  const removeAutomation = useSalesStore(s => s.removeAutomation);
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<Automation["category"] | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [draft, setDraft] = useState<Omit<Automation, "id" | "runs">>({
    name: "", category: "Assignment", trigger: "", condition: "", action: "", enabled: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    let out = automations;
    if (search) {
      const q = search.toLowerCase();
      out = out.filter(a => a.name.toLowerCase().includes(q) || a.trigger.toLowerCase().includes(q) || a.action.toLowerCase().includes(q));
    }
    if (catFilter !== "all") out = out.filter(a => a.category === catFilter);
    if (statusFilter === "active") out = out.filter(a => a.enabled);
    if (statusFilter === "inactive") out = out.filter(a => !a.enabled);
    return out;
  }, [automations, search, catFilter, statusFilter]);

  const enabledCount = automations.filter(a => a.enabled).length;
  const totalRuns = automations.reduce((s, a) => s + a.runs, 0);

  const grouped = useMemo(() => {
    const g: Record<Automation["category"], Automation[]> = { Assignment: [], "Follow-up": [], "Status Change": [], Notification: [] };
    filtered.forEach(a => g[a.category].push(a));
    return g;
  }, [filtered]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!draft.name.trim()) errs.name = "Automation name is required";
    if (draft.name.trim().length > 0 && draft.name.trim().length < 5) errs.name = "Name must be at least 5 characters";
    if (!draft.trigger.trim()) errs.trigger = "Trigger condition is required";
    if (!draft.action.trim()) errs.action = "Action is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const create = () => {
    if (!validate()) return;
    addAutomation(draft);
    toast({ title: `Automation "${draft.name}" created` });
    setDraft({ name: "", category: "Assignment", trigger: "", condition: "", action: "", enabled: true });
    setErrors({});
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    const a = automations.find(x => x.id === id);
    removeAutomation(id);
    toast({ title: `"${a?.name}" deleted` });
    setDeleteConfirm(null);
  };

  const handleTestRun = (a: Automation) => {
    toast({
      title: `Test run: ${a.name}`,
      description: `Trigger: ${a.trigger} → Action: ${a.action}`,
    });
  };

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader
        title="Sales Automations"
        subtitle={`${enabledCount} of ${automations.length} active · ${totalRuns.toLocaleString()} total executions`}
        accentVar="--mod-sales"
        actions={<Button size="sm" className="h-7 text-xs gap-1" onClick={() => setOpen(true)}><Plus className="w-3.5 h-3.5" /> New Automation</Button>}
      />

      {/* ─── KPI Row ─── */}
      <div className="grid grid-cols-4 gap-px bg-border border-b border-border">
        {[
          { label: "Total Rules", value: automations.length.toString(), icon: Hash, color: "text-blue-400" },
          { label: "Active", value: enabledCount.toString(), icon: Play, color: "text-emerald-400" },
          { label: "Inactive", value: (automations.length - enabledCount).toString(), icon: Pause, color: "text-amber-400" },
          { label: "Total Executions", value: totalRuns.toLocaleString(), icon: Clock, color: "text-purple-400" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-surface px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center">
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div>
              <div className="text-3xs uppercase text-muted-foreground tracking-wider">{kpi.label}</div>
              <div className="text-sm font-semibold font-mono mt-0.5">{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Filter Bar ─── */}
      <div className="px-3 py-2 border-b border-border flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search automations..."
            className="h-7 text-xs pl-8"
          />
        </div>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value as Automation["category"] | "all")}
          className="h-7 px-2 rounded-sm bg-background border border-border text-xs"
        >
          <option value="all">All Categories</option>
          <option value="Assignment">Assignment</option>
          <option value="Follow-up">Follow-up</option>
          <option value="Status Change">Status Change</option>
          <option value="Notification">Notification</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
          className="h-7 px-2 rounded-sm bg-background border border-border text-xs"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
        <span className="text-2xs text-muted-foreground ml-auto">{filtered.length} of {automations.length} shown</span>
      </div>

      {/* ─── Automation Groups ─── */}
      <div className="p-3 flex-1 space-y-3">
        {(Object.keys(grouped) as Automation["category"][]).map(cat => {
          if (grouped[cat].length === 0) return null;
          const meta = CATEGORY_META[cat];
          const Icon = meta.icon;
          return (
            <div key={cat} className="bg-surface border border-border rounded-sm overflow-hidden">
              <div className="flex items-center gap-2 px-3 h-9 border-b border-border">
                <div className={`w-6 h-6 rounded-md ${meta.bg} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-wider">{cat}</h3>
                <span className="text-2xs text-muted-foreground ml-auto font-mono">
                  {grouped[cat].filter(a => a.enabled).length}/{grouped[cat].length} active
                </span>
              </div>
              <div className="divide-y divide-border">
                {grouped[cat].map(a => (
                  <div key={a.id} className="flex items-start gap-3 px-3 py-3 hover:bg-surface-hover transition-colors group">
                    <Switch
                      checked={a.enabled}
                      onCheckedChange={() => { toggle(a.id); toast({ title: `${a.name} ${!a.enabled ? "enabled" : "disabled"}` }); }}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className={`text-xs font-medium ${a.enabled ? "" : "text-muted-foreground"}`}>{a.name}</h4>
                        {a.enabled
                          ? <StatusPill variant="success">Active</StatusPill>
                          : <StatusPill variant="neutral">Off</StatusPill>
                        }
                      </div>
                      <div className="text-2xs text-muted-foreground space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-foreground/60">When:</span>
                          <span>{a.trigger}</span>
                        </div>
                        {a.condition && (
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-foreground/60">If:</span>
                            <span>{a.condition}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-foreground/60">Do:</span>
                          <span>{a.action}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <div className="text-2xs font-mono text-muted-foreground">
                        <span className="font-semibold">{a.runs}</span> runs
                      </div>
                      {a.lastTriggered && (
                        <div className="text-3xs text-muted-foreground">last: {a.lastTriggered}</div>
                      )}
                      <div className="flex items-center gap-2 justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleTestRun(a)}
                          className="text-2xs text-primary hover:underline"
                        >
                          Test Run
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(a.id)}
                          className="text-destructive hover:text-destructive/80 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Workflow className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No automations match your filters</p>
          </div>
        )}
      </div>

      {/* ─── Create Automation Modal ─── */}
      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setErrors({}); setDraft({ name: "", category: "Assignment", trigger: "", condition: "", action: "", enabled: true }); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Workflow className="w-4 h-4 text-primary" /> New Automation</DialogTitle>
            <DialogDescription className="text-2xs">Define a trigger, optional condition, and action for your automation rule.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <div>
              <Label className="text-2xs">Name *</Label>
              <Input
                value={draft.name}
                onChange={e => { setDraft({ ...draft, name: e.target.value }); if (errors.name) setErrors(prev => { const n = { ...prev }; delete n.name; return n; }); }}
                placeholder="e.g. Auto-assign Upwork leads to Bhavya"
                className={`h-8 text-xs ${errors.name ? "border-destructive" : ""}`}
              />
              {errors.name && <p className="text-3xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
            </div>
            <div>
              <Label className="text-2xs">Category</Label>
              <Select value={draft.category} onValueChange={(v: Automation["category"]) => setDraft({ ...draft, category: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Assignment">Assignment</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Status Change">Status Change</SelectItem>
                  <SelectItem value="Notification">Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-2xs">Trigger (When…) *</Label>
              <Input
                value={draft.trigger}
                onChange={e => { setDraft({ ...draft, trigger: e.target.value }); if (errors.trigger) setErrors(prev => { const n = { ...prev }; delete n.trigger; return n; }); }}
                placeholder="e.g. New lead from LinkedIn"
                className={`h-8 text-xs ${errors.trigger ? "border-destructive" : ""}`}
              />
              {errors.trigger && <p className="text-3xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.trigger}</p>}
            </div>
            <div>
              <Label className="text-2xs">Condition (optional)</Label>
              <Input
                value={draft.condition ?? ""}
                onChange={e => setDraft({ ...draft, condition: e.target.value })}
                placeholder="e.g. value > ₹5L"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-2xs">Action (Do this) *</Label>
              <Textarea
                value={draft.action}
                onChange={e => { setDraft({ ...draft, action: e.target.value }); if (errors.action) setErrors(prev => { const n = { ...prev }; delete n.action; return n; }); }}
                placeholder="e.g. Assign to Department Head + notify on Slack"
                className={`text-xs min-h-[60px] ${errors.action ? "border-destructive" : ""}`}
              />
              {errors.action && <p className="text-3xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.action}</p>}
            </div>
            <label className="flex items-center gap-2 text-xs">
              <Switch checked={draft.enabled} onCheckedChange={v => setDraft({ ...draft, enabled: v })} />
              Enable immediately
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" className="h-7 text-xs" onClick={create}>Create Automation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ─── */}
      <Dialog open={!!deleteConfirm} onOpenChange={v => { if (!v) setDeleteConfirm(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Automation</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete this automation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

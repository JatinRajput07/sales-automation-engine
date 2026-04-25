import { useMemo, useState } from "react";
import { Plus, Workflow, Zap, Bell, RefreshCw, Trash2 } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusPill } from "@/components/ui/StatusPill";
import { useSalesStore, type Automation } from "@/store/salesStore";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categoryIcon = (c: Automation["category"]) => {
  switch (c) {
    case "Assignment": return Workflow;
    case "Follow-up": return RefreshCw;
    case "Status Change": return Zap;
    case "Notification": return Bell;
  }
};

export default function Automations() {
  const automations = useSalesStore(s => s.automations);
  const toggle = useSalesStore(s => s.toggleAutomation);
  const addAutomation = useSalesStore(s => s.addAutomation);
  const removeAutomation = useSalesStore(s => s.removeAutomation);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Omit<Automation, "id" | "runs">>({
    name: "", category: "Assignment", trigger: "", condition: "", action: "", enabled: true,
  });

  const grouped = useMemo(() => {
    const g: Record<Automation["category"], Automation[]> = { Assignment: [], "Follow-up": [], "Status Change": [], Notification: [] };
    automations.forEach(a => g[a.category].push(a));
    return g;
  }, [automations]);

  const enabledCount = automations.filter(a => a.enabled).length;
  const totalRuns = automations.reduce((s, a) => s + a.runs, 0);

  const create = () => {
    if (!draft.name.trim() || !draft.trigger.trim() || !draft.action.trim()) {
      toast({ title: "Name, trigger and action are required", variant: "destructive" });
      return;
    }
    addAutomation(draft);
    toast({ title: `Automation "${draft.name}" created` });
    setDraft({ name: "", category: "Assignment", trigger: "", condition: "", action: "", enabled: true });
    setOpen(false);
  };

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader
        title="Sales Automations"
        subtitle={`${enabledCount} of ${automations.length} active · ${totalRuns} total runs`}
        accentVar="--mod-sales"
        actions={<Button size="sm" className="h-7 text-xs gap-1" onClick={() => setOpen(true)}><Plus className="w-3.5 h-3.5" /> New Automation</Button>}
      />

      <div className="p-3 flex-1 space-y-3">
        {(Object.keys(grouped) as Automation["category"][]).map(cat => {
          const Icon = categoryIcon(cat);
          return (
            <div key={cat} className="bg-surface border border-border rounded-sm">
              <div className="flex items-center gap-2 px-3 h-9 border-b border-border">
                <Icon className="w-4 h-4 text-mod-sales" />
                <h3 className="text-xs font-semibold uppercase tracking-wider">{cat}</h3>
                <span className="text-2xs text-muted-foreground ml-auto">{grouped[cat].filter(a => a.enabled).length} / {grouped[cat].length} active</span>
              </div>
              <div className="divide-y divide-border">
                {grouped[cat].map(a => (
                  <div key={a.id} className="flex items-start gap-3 px-3 py-2.5 hover:bg-surface-hover">
                    <label className="relative inline-flex items-center cursor-pointer mt-0.5">
                      <input type="checkbox" checked={a.enabled} onChange={() => { toggle(a.id); toast({ title: `${a.name} ${!a.enabled ? "enabled" : "disabled"}` }); }} className="sr-only peer" />
                      <div className="w-9 h-5 bg-muted peer-checked:bg-mod-sales rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-medium">{a.name}</h4>
                        {a.enabled ? <StatusPill variant="success">Active</StatusPill> : <StatusPill variant="neutral">Off</StatusPill>}
                      </div>
                      <div className="text-2xs text-muted-foreground mt-1 space-y-0.5">
                        <div><span className="font-medium">Trigger:</span> {a.trigger}</div>
                        {a.condition && <div><span className="font-medium">Condition:</span> {a.condition}</div>}
                        <div><span className="font-medium">Action:</span> {a.action}</div>
                      </div>
                    </div>
                    <div className="text-right text-2xs text-muted-foreground shrink-0 font-mono">
                      <div>{a.runs} runs</div>
                      {a.lastTriggered && <div>last: {a.lastTriggered}</div>}
                      <div className="flex items-center gap-2 mt-1 justify-end">
                        <button onClick={() => toast({ title: `Test run: ${a.name}` })} className="text-primary hover:underline">Test</button>
                        <button onClick={() => { removeAutomation(a.id); toast({ title: "Removed" }); }} className="text-destructive hover:underline"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {grouped[cat].length === 0 && <div className="px-3 py-4 text-center text-2xs text-muted-foreground">No {cat.toLowerCase()} automations yet</div>}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Automation</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-2xs">Name</Label>
              <Input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Auto-assign Upwork leads to Bhavya" className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-2xs">Category</Label>
              <Select value={draft.category} onValueChange={(v: any) => setDraft({ ...draft, category: v })}>
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
              <Label className="text-2xs">Trigger (when…)</Label>
              <Input value={draft.trigger} onChange={e => setDraft({ ...draft, trigger: e.target.value })} placeholder="e.g. New lead from LinkedIn" className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-2xs">Condition (optional)</Label>
              <Input value={draft.condition ?? ""} onChange={e => setDraft({ ...draft, condition: e.target.value })} placeholder="e.g. value > ₹5L" className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-2xs">Action (do this)</Label>
              <Textarea value={draft.action} onChange={e => setDraft({ ...draft, action: e.target.value })} placeholder="e.g. Assign to Department Head + notify on Slack" className="text-xs min-h-[60px]" />
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={draft.enabled} onChange={e => setDraft({ ...draft, enabled: e.target.checked })} className="h-4 w-4 accent-primary" />
              Enable immediately
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" className="h-7 text-xs" onClick={create}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

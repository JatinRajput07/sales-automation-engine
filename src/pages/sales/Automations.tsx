import { useMemo } from "react";
import { Plus, Workflow, Zap, Bell, RefreshCw } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/StatusPill";
import { useSalesStore, type Automation } from "@/store/salesStore";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const grouped = useMemo(() => {
    const g: Record<Automation["category"], Automation[]> = { Assignment: [], "Follow-up": [], "Status Change": [], Notification: [] };
    automations.forEach(a => g[a.category].push(a));
    return g;
  }, [automations]);

  const enabledCount = automations.filter(a => a.enabled).length;
  const totalRuns = automations.reduce((s, a) => s + a.runs, 0);

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader
        title="Sales Automations"
        subtitle={`${enabledCount} of ${automations.length} active · ${totalRuns} total runs`}
        accentVar="--mod-sales"
        actions={<Button size="sm" className="h-7 text-xs gap-1" onClick={() => toast({ title: "Custom builder coming soon" })}><Plus className="w-3.5 h-3.5" /> New Automation</Button>}
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
                      <button onClick={() => toast({ title: `Test run: ${a.name}` })} className="text-primary hover:underline mt-1">Test</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

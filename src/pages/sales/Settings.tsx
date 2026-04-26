import { useState, useRef } from "react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Workflow, Bell, Users, Layers, Target, Plus, Trash2, GripVertical, FileText, Upload } from "lucide-react";
import { useSalesStore, type PipelineStageDef, type SalesGoal, type ProposalSettings } from "@/store/salesStore";
import { PEOPLE, inr } from "@/lib/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Settings() {
  const { toast } = useToast();
  const stages = useSalesStore(s => s.pipelineStages);
  const setStages = useSalesStore(s => s.setPipelineStages);
  const goals = useSalesStore(s => s.goals);
  const addGoal = useSalesStore(s => s.addGoal);
  const updateGoal = useSalesStore(s => s.updateGoal);
  const removeGoal = useSalesStore(s => s.removeGoal);
  const proposalSettings = useSalesStore(s => s.proposalSettings);
  const updateProposalSettings = useSalesStore(s => s.updateProposalSettings);

  const [tab, setTab] = useState<"pipeline" | "goals" | "team" | "proposal" | "ai" | "automations" | "notifications">("pipeline");

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title="Sales Settings" subtitle="Pipeline stages · sales goals · team access · AI" accentVar="--mod-sales" />

      <div className="h-9 px-3 flex items-center gap-1 border-b border-border bg-surface/50 text-xs overflow-x-auto">
        {([
          { k: "pipeline", l: "Pipeline & Stages", icon: Layers },
          { k: "goals", l: "Sales Goals", icon: Target },
          { k: "team", l: "Team & Access", icon: Users },
          { k: "proposal", l: "Proposal Branding", icon: FileText },
          { k: "ai", l: "AI Assistant", icon: Sparkles },
          { k: "automations", l: "Automations", icon: Workflow },
          { k: "notifications", l: "Notifications", icon: Bell },
        ] as const).map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`h-7 px-3 rounded-sm flex items-center gap-1.5 ${tab === t.k ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-surface-hover"}`}>
            <t.icon className="w-3.5 h-3.5" /> {t.l}
          </button>
        ))}
      </div>

      <div className="p-3 flex-1">
        {tab === "pipeline" && <PipelineEditor stages={stages} onChange={setStages} />}
        {tab === "goals" && <GoalsEditor goals={goals} onAdd={addGoal} onUpdate={updateGoal} onRemove={removeGoal} />}
        {tab === "team" && <TeamAccess />}
        {tab === "proposal" && <ProposalBrandingEditor settings={proposalSettings} onChange={updateProposalSettings} />}
        {tab === "ai" && (
          <SettingsCard>
            <Toggle label="Auto-score new leads" defaultChecked />
            <Toggle label="Suggest next best action" defaultChecked />
            <Toggle label="Auto-draft proposals from deals" />
            <Toggle label="Predict deal close date" defaultChecked />
          </SettingsCard>
        )}
        {tab === "automations" && (
          <SettingsCard>
            <Toggle label="Auto-assign leads round-robin" defaultChecked />
            <Toggle label="Move stale deals (14d) to On Hold" defaultChecked />
            <Toggle label="Auto-convert qualified leads to deals" />
            <Toggle label="Notify on stage change" defaultChecked />
          </SettingsCard>
        )}
        {tab === "notifications" && (
          <SettingsCard>
            <Toggle label="Email alerts for new leads" defaultChecked />
            <Toggle label="Daily forecast digest" defaultChecked />
            <Toggle label="Slack integration" />
            <Toggle label="Mobile push" />
          </SettingsCard>
        )}
      </div>
    </div>
  );

  function SettingsCard({ children }: { children: React.ReactNode }) {
    return (
      <div className="bg-surface border border-border rounded-sm p-4 max-w-xl space-y-2">
        {children}
        <div className="pt-2 flex justify-end"><Button size="sm" className="h-7 text-xs" onClick={() => toast({ title: "Settings saved" })}>Save</Button></div>
      </div>
    );
  }
}

function PipelineEditor({ stages, onChange }: { stages: PipelineStageDef[]; onChange: (s: PipelineStageDef[]) => void }) {
  const { toast } = useToast();
  const [draft, setDraft] = useState(stages);
  const update = (i: number, patch: Partial<PipelineStageDef>) => setDraft(d => d.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  const add = () => setDraft(d => [...d, { id: `ps${Date.now()}`, name: "New Stage", probability: 50, color: "info" }]);
  const remove = (id: string) => setDraft(d => d.filter(s => s.id !== id));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= draft.length) return;
    const next = [...draft]; [next[i], next[j]] = [next[j], next[i]]; setDraft(next);
  };
  const save = () => { onChange(draft); toast({ title: "Pipeline updated" }); };

  return (
    <div className="bg-surface border border-border rounded-sm">
      <div className="h-9 px-3 flex items-center gap-2 border-b border-border">
        <h3 className="text-xs font-semibold uppercase tracking-wider">Pipeline Stages</h3>
        <span className="text-2xs text-muted-foreground">Drag-style reorder · per-stage probability</span>
        <div className="ml-auto flex gap-1">
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={add}><Plus className="w-3.5 h-3.5" /> Stage</Button>
          <Button size="sm" className="h-7 text-xs" onClick={save}>Save</Button>
        </div>
      </div>
      <div className="divide-y divide-border">
        {draft.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 px-3 py-2">
            <div className="flex flex-col">
              <button onClick={() => move(i, -1)} className="text-muted-foreground hover:text-foreground text-2xs">▲</button>
              <button onClick={() => move(i, 1)} className="text-muted-foreground hover:text-foreground text-2xs">▼</button>
            </div>
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
            <Input value={s.name} onChange={e => update(i, { name: e.target.value })} className="h-7 text-xs w-48" />
            <div className="flex items-center gap-1">
              <Label className="text-2xs text-muted-foreground">Prob</Label>
              <Input type="number" min={0} max={100} value={s.probability} onChange={e => update(i, { probability: Number(e.target.value) })} className="h-7 text-xs w-16" />
              <span className="text-2xs text-muted-foreground">%</span>
            </div>
            <Select value={s.color} onValueChange={(v) => update(i, { color: v })}>
              <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["info", "purple", "warning", "success", "danger", "neutral"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="h-7 ml-auto text-destructive" onClick={() => remove(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GoalsEditor({ goals, onAdd, onUpdate, onRemove }: {
  goals: SalesGoal[];
  onAdd: (g: Omit<SalesGoal, "id">) => string;
  onUpdate: (id: string, patch: Partial<SalesGoal>) => void;
  onRemove: (id: string) => void;
}) {
  const { toast } = useToast();
  const [scope, setScope] = useState<"company" | "person">("company");
  const [period, setPeriod] = useState<"monthly" | "quarterly">("monthly");
  const [periodLabel, setPeriodLabel] = useState(new Date().toISOString().slice(0, 7));
  const [target, setTarget] = useState(1000000);
  const [ownerId, setOwnerId] = useState("p2");

  const create = () => {
    onAdd({ scope, period, periodLabel, target, currency: "INR", achieved: 0, ownerId: scope === "person" ? ownerId : undefined });
    toast({ title: "Goal added" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <div className="bg-surface border border-border rounded-sm p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider">Add New Goal</h3>
        <div className="space-y-2">
          <Label className="text-2xs">Scope</Label>
          <Select value={scope} onValueChange={(v: any) => setScope(v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="company">Company-wide</SelectItem>
              <SelectItem value="person">Specific salesperson</SelectItem>
            </SelectContent>
          </Select>
          {scope === "person" && (
            <>
              <Label className="text-2xs">Salesperson</Label>
              <Select value={ownerId} onValueChange={setOwnerId}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{PEOPLE.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </>
          )}
          <Label className="text-2xs">Period</Label>
          <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
          <Label className="text-2xs">Period label (e.g. 2025-04 or 2025-Q2)</Label>
          <Input value={periodLabel} onChange={e => setPeriodLabel(e.target.value)} className="h-8 text-xs" />
          <Label className="text-2xs">Target (INR)</Label>
          <Input type="number" value={target} onChange={e => setTarget(Number(e.target.value))} className="h-8 text-xs" />
          <Button size="sm" className="h-7 text-xs w-full" onClick={create}><Plus className="w-3.5 h-3.5 mr-1" /> Add Goal</Button>
        </div>
      </div>

      <div className="lg:col-span-2 bg-surface border border-border rounded-sm">
        <div className="h-9 px-3 flex items-center border-b border-border">
          <h3 className="text-xs font-semibold uppercase tracking-wider">Existing Goals ({goals.length})</h3>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-muted/40">
            <tr className="text-2xs uppercase text-muted-foreground">
              <th className="text-left px-3 h-7">Scope</th>
              <th className="text-left px-3 h-7">Period</th>
              <th className="text-right px-3 h-7">Target</th>
              <th className="text-right px-3 h-7">Achieved</th>
              <th className="text-right px-3 h-7">%</th>
              <th className="px-3 h-7"></th>
            </tr>
          </thead>
          <tbody>
            {goals.map(g => {
              const pct = g.target ? Math.round(((g.achieved ?? 0) / g.target) * 100) : 0;
              const owner = PEOPLE.find(p => p.id === g.ownerId);
              return (
                <tr key={g.id} className="border-t border-border hover:bg-surface-hover">
                  <td className="px-3 h-9">{g.scope === "company" ? "🏢 Company" : `👤 ${owner?.name ?? g.ownerId}`}</td>
                  <td className="px-3 h-9 text-2xs">{g.period} · {g.periodLabel}</td>
                  <td className="px-3 h-9 text-right font-mono">{inr(g.target)}</td>
                  <td className="px-3 h-9 text-right">
                    <Input type="number" defaultValue={g.achieved ?? 0} onBlur={e => onUpdate(g.id, { achieved: Number(e.target.value) })} className="h-6 text-2xs w-24 text-right ml-auto" />
                  </td>
                  <td className="px-3 h-9 text-right">
                    <span className={`font-mono font-bold ${pct >= 100 ? "text-success" : pct >= 70 ? "text-warning" : "text-destructive"}`}>{pct}%</span>
                  </td>
                  <td className="px-3 h-9 text-right">
                    <button onClick={() => onRemove(g.id)} className="text-destructive hover:bg-destructive/10 p-1 rounded-sm"><Trash2 className="w-3 h-3" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeamAccess() {
  const { toast } = useToast();
  const salesPeople = PEOPLE.filter(p => p.dept === "Sales");
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="bg-surface border border-border rounded-sm p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider">Lead Assignment</h3>
        <Label className="text-2xs">Default assignment strategy</Label>
        <Select defaultValue="round-robin">
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="round-robin">Round Robin</SelectItem>
            <SelectItem value="region">Region-based</SelectItem>
            <SelectItem value="skill">Skill-based (AI)</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
        <Label className="text-2xs">SLA (hours to first response)</Label>
        <Input type="number" defaultValue={4} className="h-8 text-xs" />
        <Button size="sm" className="h-7 text-xs" onClick={() => toast({ title: "Saved" })}>Save</Button>
      </div>

      <div className="bg-surface border border-border rounded-sm">
        <div className="h-9 px-3 flex items-center border-b border-border">
          <h3 className="text-xs font-semibold uppercase tracking-wider">Sales Team Members & Access</h3>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-muted/40">
            <tr className="text-2xs uppercase text-muted-foreground">
              <th className="text-left px-3 h-7">Member</th>
              <th className="text-left px-3 h-7">Role</th>
              <th className="text-center px-3 h-7">Leads</th>
              <th className="text-center px-3 h-7">Deals</th>
              <th className="text-center px-3 h-7">Reports</th>
              <th className="text-center px-3 h-7">Admin</th>
            </tr>
          </thead>
          <tbody>
            {salesPeople.map((p, i) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-3 h-9">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-sm bg-primary/15 text-primary flex items-center justify-center font-mono text-3xs font-bold">{p.initials}</div>
                    <span>{p.name}</span>
                  </div>
                </td>
                <td className="px-3 h-9 text-2xs">{i === 0 ? "Sales Manager" : "Sales Rep"}</td>
                <td className="px-3 h-9 text-center"><input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-primary" /></td>
                <td className="px-3 h-9 text-center"><input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-primary" /></td>
                <td className="px-3 h-9 text-center"><input type="checkbox" defaultChecked={i === 0} className="h-3.5 w-3.5 accent-primary" /></td>
                <td className="px-3 h-9 text-center"><input type="checkbox" defaultChecked={i === 0} className="h-3.5 w-3.5 accent-primary" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between text-xs cursor-pointer py-1.5 border-b border-border last:border-0">
      <span>{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="h-4 w-4 accent-primary" />
    </label>
  );
}

import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Workflow, Bell, Users } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const save = () => toast({ title: "Settings saved" });

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title="Sales Settings" subtitle="Configure pipeline, automations, AI" accentVar="--mod-sales"
        actions={<Button size="sm" className="h-7 text-xs" onClick={save}>Save Changes</Button>} />

      <div className="p-3 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card title="AI Assistant" icon={Sparkles}>
          <Toggle label="Auto-score new leads" defaultChecked />
          <Toggle label="Suggest next best action" defaultChecked />
          <Toggle label="Auto-draft proposals from deals" />
          <Toggle label="Predict deal close date" defaultChecked />
        </Card>

        <Card title="Automations" icon={Workflow}>
          <Toggle label="Auto-assign leads round-robin" defaultChecked />
          <Toggle label="Move stale deals (14d) to On Hold" defaultChecked />
          <Toggle label="Auto-convert qualified leads to deals" />
          <Toggle label="Notify on stage change" defaultChecked />
        </Card>

        <Card title="Notifications" icon={Bell}>
          <Toggle label="Email alerts for new leads" defaultChecked />
          <Toggle label="Daily forecast digest" defaultChecked />
          <Toggle label="Slack integration" />
          <Toggle label="Mobile push" />
        </Card>

        <Card title="Team & Roles" icon={Users}>
          <div className="text-xs text-muted-foreground mb-2">Default lead assignment</div>
          <select className="h-8 w-full px-2 rounded-sm bg-background border border-border text-xs">
            <option>Round Robin</option>
            <option>Region-based</option>
            <option>Skill-based (AI)</option>
            <option>Manual</option>
          </select>
          <div className="mt-3"><Label className="text-2xs">SLA (hours to first response)</Label><Input type="number" defaultValue={4} className="h-8 text-xs mt-1" /></div>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-sm p-3">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-mod-sales" />
        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">{title}</h3>
      </div>
      <div className="space-y-2">{children}</div>
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

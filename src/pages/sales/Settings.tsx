import { useState, useRef, useCallback } from "react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Workflow, Bell, Users, Layers, Target, Plus, Trash2, GripVertical, FileText, Upload, Plug, Slack, Mail, Calendar, MessageSquare, Video, Linkedin, Briefcase, CreditCard, Database, Zap, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, X, Shield, type LucideIcon } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useSalesStore, type PipelineStageDef, type LeadStageDef, type SalesGoal, type ProposalSettings } from "@/store/salesStore";
import { PEOPLE, inr } from "@/lib/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ModulePermissions } from "@/components/rbac/ModulePermissions";

/* ─── Integration field config per-app ─── */
interface IntegrationFieldDef {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "password" | "url";
  required: boolean;
  helpText?: string;
}

interface IntegrationDef {
  name: string;
  desc: string;
  icon: LucideIcon;
  fields: IntegrationFieldDef[];
  docsUrl: string;
}

const INTEGRATIONS: IntegrationDef[] = [
  {
    name: "Slack",
    desc: "Get deal alerts in channels",
    icon: Slack,
    docsUrl: "https://api.slack.com/apps",
    fields: [
      { key: "webhookUrl", label: "Webhook URL *", placeholder: "https://hooks.slack.com/services/T00.../B00.../xxxx", type: "url", required: true, helpText: "Create an Incoming Webhook in your Slack App settings" },
      { key: "channel", label: "Default Channel *", placeholder: "#sales-alerts", type: "text", required: true, helpText: "Channel where deal alerts will be posted" },
      { key: "botToken", label: "Bot Token", placeholder: "xoxb-...", type: "password", required: false, helpText: "Optional: For richer interactions & slash commands" },
    ],
  },
  {
    name: "Gmail",
    desc: "Sync email threads to leads",
    icon: Mail,
    docsUrl: "https://console.cloud.google.com/apis",
    fields: [
      { key: "clientId", label: "Client ID *", placeholder: "123456789.apps.googleusercontent.com", type: "text", required: true, helpText: "From Google Cloud Console → Credentials" },
      { key: "clientSecret", label: "Client Secret *", placeholder: "GOCSPX-...", type: "password", required: true },
      { key: "redirectUri", label: "Redirect URI *", placeholder: "https://yourapp.com/auth/google/callback", type: "url", required: true },
    ],
  },
  {
    name: "Google Calendar",
    desc: "Auto-log meetings as activities",
    icon: Calendar,
    docsUrl: "https://console.cloud.google.com/apis",
    fields: [
      { key: "clientId", label: "Client ID *", placeholder: "123456789.apps.googleusercontent.com", type: "text", required: true, helpText: "Same as Gmail if using the same Google Cloud project" },
      { key: "clientSecret", label: "Client Secret *", placeholder: "GOCSPX-...", type: "password", required: true },
      { key: "calendarId", label: "Calendar ID", placeholder: "primary", type: "text", required: false, helpText: "Leave empty for primary calendar" },
    ],
  },
  {
    name: "Twilio SMS/WhatsApp",
    desc: "Send WhatsApp from CRM",
    icon: MessageSquare,
    docsUrl: "https://console.twilio.com",
    fields: [
      { key: "accountSid", label: "Account SID *", placeholder: "AC...", type: "text", required: true, helpText: "Found on Twilio Console Dashboard" },
      { key: "authToken", label: "Auth Token *", placeholder: "Your Twilio auth token", type: "password", required: true },
      { key: "phoneNumber", label: "Twilio Phone Number *", placeholder: "+1234567890", type: "text", required: true, helpText: "Your Twilio phone number with WhatsApp enabled" },
    ],
  },
  {
    name: "Zoom",
    desc: "Auto-create meeting links",
    icon: Video,
    docsUrl: "https://marketplace.zoom.us/develop/create",
    fields: [
      { key: "clientId", label: "Client ID *", placeholder: "Your Zoom OAuth Client ID", type: "text", required: true, helpText: "From Zoom Marketplace → Develop → Build App" },
      { key: "clientSecret", label: "Client Secret *", placeholder: "Your Zoom OAuth Client Secret", type: "password", required: true },
      { key: "accountId", label: "Account ID *", placeholder: "Your Zoom Account ID", type: "text", required: true },
    ],
  },
  {
    name: "LinkedIn Sales Nav",
    desc: "Sync contacts and conversations",
    icon: Linkedin,
    docsUrl: "https://developer.linkedin.com",
    fields: [
      { key: "clientId", label: "Client ID *", placeholder: "LinkedIn App Client ID", type: "text", required: true, helpText: "From LinkedIn Developer Portal" },
      { key: "clientSecret", label: "Client Secret *", placeholder: "LinkedIn App Client Secret", type: "password", required: true },
      { key: "accessToken", label: "Access Token *", placeholder: "AQV...", type: "password", required: true, helpText: "Generate via OAuth 2.0 flow" },
    ],
  },
  {
    name: "Upwork",
    desc: "Auto-import job leads",
    icon: Briefcase,
    docsUrl: "https://www.upwork.com/developer/keys/apply",
    fields: [
      { key: "apiKey", label: "API Key *", placeholder: "Your Upwork API Key", type: "password", required: true, helpText: "Apply for API access at Upwork Developer" },
      { key: "apiSecret", label: "API Secret *", placeholder: "Your Upwork API Secret", type: "password", required: true },
      { key: "feedUrl", label: "RSS Feed URL", placeholder: "https://www.upwork.com/ab/feed/...", type: "url", required: false, helpText: "Optional: Direct RSS feed for job alerts" },
    ],
  },
  {
    name: "Stripe",
    desc: "Sync payments with closed deals",
    icon: CreditCard,
    docsUrl: "https://dashboard.stripe.com/apikeys",
    fields: [
      { key: "publishableKey", label: "Publishable Key *", placeholder: "pk_live_...", type: "text", required: true, helpText: "From Stripe Dashboard → Developers → API Keys" },
      { key: "secretKey", label: "Secret Key *", placeholder: "sk_live_...", type: "password", required: true, helpText: "Keep this secret! Never expose in frontend code" },
      { key: "webhookSecret", label: "Webhook Signing Secret *", placeholder: "whsec_...", type: "password", required: true, helpText: "For verifying webhook event signatures" },
    ],
  },
  {
    name: "HubSpot",
    desc: "Two-way contact sync",
    icon: Database,
    docsUrl: "https://developers.hubspot.com",
    fields: [
      { key: "accessToken", label: "Private App Access Token *", placeholder: "pat-na1-...", type: "password", required: true, helpText: "From HubSpot → Settings → Integrations → Private Apps" },
      { key: "portalId", label: "Portal ID *", placeholder: "12345678", type: "text", required: true, helpText: "Your HubSpot account portal ID" },
    ],
  },
  {
    name: "Zapier",
    desc: "Connect 5000+ apps",
    icon: Zap,
    docsUrl: "https://zapier.com/app/developer",
    fields: [
      { key: "webhookUrl", label: "Zapier Webhook URL *", placeholder: "https://hooks.zapier.com/hooks/catch/...", type: "url", required: true, helpText: "From your Zapier Zap → Trigger → Webhooks by Zapier" },
      { key: "apiKey", label: "API Key", placeholder: "Your Zapier NLA API Key", type: "password", required: false, helpText: "Optional: For Zapier Natural Language Actions" },
    ],
  },
];

export default function Settings() {
  const { toast } = useToast();
  const stages = useSalesStore(s => s.pipelineStages);
  const setStages = useSalesStore(s => s.setPipelineStages);
  const leadStages = useSalesStore(s => s.leadStages);
  const setLeadStages = useSalesStore(s => s.setLeadStages);
  const goals = useSalesStore(s => s.goals);
  const addGoal = useSalesStore(s => s.addGoal);
  const updateGoal = useSalesStore(s => s.updateGoal);
  const removeGoal = useSalesStore(s => s.removeGoal);
  const proposalSettings = useSalesStore(s => s.proposalSettings);
  const updateProposalSettings = useSalesStore(s => s.updateProposalSettings);

  const { user } = useAuthStore();
  const salesAccess = user.accessibleModules.find(m => m.moduleId === 'sales');
  const isModuleAdmin = salesAccess?.isModuleAdmin || user.globalRole === 'SUPER_ADMIN';

  const [tab, setTab] = useState<"integrations" | "pipeline" | "goals" | "team" | "proposal" | "ai" | "notifications" | "permissions">("integrations");
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationDef | null>(null);
  const [connectedApps, setConnectedApps] = useState<Record<string, boolean>>({});

  if (!user) return null;

  const handleOpenConnect = useCallback((integration: IntegrationDef) => {
    setSelectedIntegration(integration);
    setConnectModalOpen(true);
  }, []);

  const handleConnectSuccess = useCallback((appName: string) => {
    setConnectedApps(prev => ({ ...prev, [appName]: true }));
    setConnectModalOpen(false);
    toast({ title: `${appName} connected successfully!`, description: "Integration is now active and syncing." });
  }, [toast]);

  const handleDisconnect = useCallback((appName: string) => {
    setConnectedApps(prev => ({ ...prev, [appName]: false }));
    toast({ title: `${appName} disconnected`, description: "Integration has been removed." });
  }, [toast]);

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title="Sales Settings" subtitle="Pipeline stages · sales goals · team access · AI" accentVar="--mod-sales" />

      <div className="h-9 px-3 flex items-center gap-1 border-b border-border bg-surface/50 text-xs overflow-x-auto">
        {([
          { k: "integrations", l: "Integrations", icon: Plug },
          { k: "pipeline", l: "Lead & Deal Stages", icon: Layers },
          { k: "goals", l: "Sales Goals", icon: Target },
          { k: "team", l: "Team & Access", icon: Users },
          { k: "proposal", l: "Proposal Branding", icon: FileText },
          { k: "ai", l: "AI Assistant", icon: Sparkles },
          { k: "notifications", l: "Notifications", icon: Bell },
          ...(isModuleAdmin ? [{ k: "permissions", l: "Permissions", icon: Shield }] : [])
        ] as const).map(t => (
          <button key={t.k} onClick={() => setTab(t.k as any)}
            className={`h-7 px-3 rounded-sm flex items-center gap-1.5 ${tab === t.k ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-surface-hover"}`}>
            <t.icon className="w-3.5 h-3.5" /> {t.l}
          </button>
        ))}
      </div>

      <div className="p-3 flex-1 overflow-auto">
        {tab === "integrations" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INTEGRATIONS.map((app) => {
                const isConnected = connectedApps[app.name] ?? false;
                return (
                  <div key={app.name} className={`bg-[#0f172a] border rounded-xl p-5 relative group transition-all duration-300 shadow-xl ${isConnected ? "border-emerald-500/30" : "border-white/5 hover:border-primary/50"
                    }`}>
                    {isConnected && (
                      <div className="absolute top-3 right-3">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Connected
                        </span>
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 ${isConnected ? "bg-emerald-500/10" : "bg-white/5"
                        }`}>
                        <app.icon className={`w-6 h-6 ${isConnected ? "text-emerald-400" : "text-primary"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-bold text-white truncate pr-2">{app.name}</h4>
                          {!isConnected && (
                            <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Not Connected</span>
                          )}
                        </div>
                        <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2 mb-6">{app.desc}</p>

                        <div className="flex justify-end gap-2">
                          {isConnected ? (
                            <Button variant="outline" size="sm" onClick={() => handleDisconnect(app.name)}
                              className="h-8 px-4 text-xs font-bold border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all">
                              Disconnect
                            </Button>
                          ) : (
                            <Button variant="default" size="sm" onClick={() => handleOpenConnect(app)}
                              className="h-8 px-6 text-xs font-bold bg-[#1e40af] hover:bg-blue-600 text-white rounded-lg transition-all shadow-lg shadow-blue-900/20">
                              Connect
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedIntegration && (
              <IntegrationConnectModal
                open={connectModalOpen}
                onOpenChange={setConnectModalOpen}
                integration={selectedIntegration}
                onSuccess={handleConnectSuccess}
              />
            )}
          </>
        )}
        {tab === "pipeline" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <LeadStageEditor stages={leadStages} onChange={setLeadStages} />
            <PipelineEditor stages={stages} onChange={setStages} />
          </div>
        )}
        {tab === "goals" && <GoalsEditor goals={goals} onAdd={addGoal} onUpdate={updateGoal} onRemove={removeGoal} />}
        {tab === "team" && <TeamAccess />}
        {tab === "proposal" && <ProposalBrandingEditor settings={proposalSettings} onChange={updateProposalSettings} />}
        {tab === "ai" && (
          <SettingsCard>
            <Toggle label="Auto-score new leads" description="AI will automatically assign a hot/cold score to incoming leads" defaultChecked />
            <Toggle label="Suggest next best action" description="Receive AI-driven recommendations for the next step in a deal" defaultChecked />
            <Toggle label="Auto-draft proposals" description="Generates a baseline proposal document based on deal details" />
            <Toggle label="Predict deal close date" description="Uses historical data to forecast when a deal is likely to close" defaultChecked />
          </SettingsCard>
        )}

        {tab === "notifications" && (
          <SettingsCard>
            <Toggle label="Email alerts for new leads" description="Get notified immediately when a new lead enters the system" defaultChecked />
            <Toggle label="Daily forecast digest" description="Summary of pipeline health sent every morning" defaultChecked />
            <Toggle label="Slack integration" description="Send real-time alerts to your team channels" />
            <Toggle label="Mobile push" description="Notifications on the CRM mobile app" />
          </SettingsCard>
        )}

        {tab === "permissions" && (
          <div className="max-w-5xl">
            <ModulePermissions moduleId="sales" />
          </div>
        )}
      </div>
    </div>
  );

  function SettingsCard({ children }: { children: React.ReactNode }) {
    return (
      <div className="bg-[#0c1222] border border-white/10 rounded-xl p-6 max-w-2xl space-y-2 shadow-2xl shadow-black/50">
        <div className="divide-y divide-white/5">
          {children}
        </div>
        <div className="pt-6 flex justify-end">
          <Button size="sm" className="h-9 px-6 bg-[#1e40af] hover:bg-blue-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-900/30" onClick={() => toast({ title: "Settings saved" })}>
            Save Changes
          </Button>
        </div>
      </div>
    );
  }
}

function LeadStageEditor({ stages, onChange }: { stages: LeadStageDef[]; onChange: (s: LeadStageDef[]) => void }) {
  const { toast } = useToast();
  const [draft, setDraft] = useState(stages);
  const update = (i: number, patch: Partial<LeadStageDef>) => setDraft(d => d.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  const add = () => setDraft(d => [...d, { id: `ls${Date.now()}`, name: "New Status", color: "info" }]);
  const remove = (id: string) => setDraft(d => d.filter(s => s.id !== id));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= draft.length) return;
    const next = [...draft];[next[i], next[j]] = [next[j], next[i]]; setDraft(next);
  };
  const save = () => { onChange(draft); toast({ title: "Lead statuses updated" }); };

  return (
    <div className="bg-surface border border-border rounded-sm">
      <div className="h-9 px-3 flex items-center gap-2 border-b border-border">
        <h3 className="text-xs font-semibold uppercase tracking-wider">Lead Statuses</h3>
        <span className="text-2xs text-muted-foreground ml-2">Drag-style reorder</span>
        <div className="ml-auto flex gap-1">
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={add}><Plus className="w-3.5 h-3.5" /> Status</Button>
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
            <Input value={s.name} onChange={e => update(i, { name: e.target.value })} className="h-7 text-xs flex-1" />
            <Select value={s.color} onValueChange={(v) => update(i, { color: v })}>
              <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["info", "purple", "warning", "success", "danger", "neutral"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="h-7 ml-1 text-destructive" onClick={() => remove(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
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
    const next = [...draft];[next[i], next[j]] = [next[j], next[i]]; setDraft(next);
  };
  const save = () => { onChange(draft); toast({ title: "Pipeline updated" }); };

  return (
    <div className="bg-surface border border-border rounded-sm">
      <div className="h-9 px-3 flex items-center gap-2 border-b border-border">
        <h3 className="text-xs font-semibold uppercase tracking-wider">Deal Pipeline Stages</h3>
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

function Toggle({ label, description, defaultChecked }: { label: string; description?: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between py-4 px-1 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors rounded-lg group">
      <div className="space-y-0.5">
        <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{label}</h4>
        {description && <p className="text-[11px] text-white/40 leading-relaxed">{description}</p>}
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function ProposalBrandingEditor({ settings, onChange }: { settings: ProposalSettings; onChange: (patch: Partial<ProposalSettings>) => void }) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { onChange({ brandLogo: reader.result as string }); toast({ title: "Logo uploaded" }); };
    reader.readAsDataURL(file);
  };

  const sectionToggles: Array<{ key: keyof ProposalSettings["includeSections"]; label: string }> = [
    { key: "executiveSummary", label: "Executive Summary" },
    { key: "problemStatement", label: "Problem Statement" },
    { key: "ourSolution", label: "Our Solution" },
    { key: "timeline", label: "Timeline" },
    { key: "pricing", label: "Investment / Pricing" },
    { key: "terms", label: "Terms & Conditions" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="bg-surface border border-border rounded-sm p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider">Brand Identity</h3>
        <div className="flex items-start gap-3">
          <div className="w-20 h-20 rounded-sm border border-border bg-background flex items-center justify-center overflow-hidden">
            {settings.brandLogo ? <img src={settings.brandLogo} className="max-w-full max-h-full object-contain" alt="logo" /> : <span className="text-2xs text-muted-foreground text-center px-2">No logo</span>}
          </div>
          <div className="flex-1 space-y-1.5">
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => fileRef.current?.click()}><Upload className="w-3 h-3" /> Upload Logo</Button>
            {settings.brandLogo && <Button type="button" variant="ghost" size="sm" className="h-6 text-2xs text-destructive" onClick={() => onChange({ brandLogo: undefined })}>Remove logo</Button>}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            <p className="text-2xs text-muted-foreground">PNG/JPG/SVG up to ~1MB. Appears at the top of every generated proposal.</p>
          </div>
        </div>
        <div>
          <Label className="text-2xs">Brand Name</Label>
          <Input value={settings.brandName} onChange={e => onChange({ brandName: e.target.value })} className="h-8 text-xs" />
        </div>
        <div>
          <Label className="text-2xs">Tagline</Label>
          <Input value={settings.brandTagline} onChange={e => onChange({ brandTagline: e.target.value })} className="h-8 text-xs" />
        </div>
        <div>
          <Label className="text-2xs">Footer Text</Label>
          <Input value={settings.footerText} onChange={e => onChange({ footerText: e.target.value })} className="h-8 text-xs" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-2xs">Primary Color</Label>
            <div className="flex gap-1">
              <input type="color" value={settings.primaryColor} onChange={e => onChange({ primaryColor: e.target.value })} className="h-8 w-10 rounded-sm border border-border bg-background cursor-pointer" />
              <Input value={settings.primaryColor} onChange={e => onChange({ primaryColor: e.target.value })} className="h-8 text-xs font-mono" />
            </div>
          </div>
          <div>
            <Label className="text-2xs">Accent Color</Label>
            <div className="flex gap-1">
              <input type="color" value={settings.accentColor} onChange={e => onChange({ accentColor: e.target.value })} className="h-8 w-10 rounded-sm border border-border bg-background cursor-pointer" />
              <Input value={settings.accentColor} onChange={e => onChange({ accentColor: e.target.value })} className="h-8 text-xs font-mono" />
            </div>
          </div>
        </div>
        <div>
          <Label className="text-2xs">Font Family</Label>
          <Select value={settings.fontFamily} onValueChange={(v: any) => onChange({ fontFamily: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Inter">Inter (Modern Sans)</SelectItem>
              <SelectItem value="Helvetica">Helvetica (Classic Sans)</SelectItem>
              <SelectItem value="Georgia">Georgia (Editorial Serif)</SelectItem>
              <SelectItem value="Times">Times (Traditional Serif)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-surface border border-border rounded-sm p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider">AI Defaults</h3>
          <div>
            <Label className="text-2xs">Default Tone</Label>
            <Select value={settings.defaultTone} onValueChange={(v: any) => onChange({ defaultTone: v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Persuasive">Persuasive</SelectItem>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Consultative">Consultative</SelectItem>
                <SelectItem value="Bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-2xs">Default Validity (days)</Label>
            <Input type="number" value={settings.defaultValidityDays} onChange={e => onChange({ defaultValidityDays: Number(e.target.value) })} className="h-8 text-xs" />
          </div>
          <div>
            <Label className="text-2xs">Default Terms</Label>
            <Textarea rows={3} value={settings.defaultTerms} onChange={e => onChange({ defaultTerms: e.target.value })} className="text-xs" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-sm p-4 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-1">Sections to Include</h3>
          <p className="text-2xs text-muted-foreground mb-2">Toggle which sections appear in generated proposals & exports.</p>
          {sectionToggles.map(t => (
            <label key={t.key} className="flex items-center justify-between text-xs cursor-pointer py-1.5 border-b border-border last:border-0">
              <span>{t.label}</span>
              <input
                type="checkbox"
                checked={settings.includeSections[t.key]}
                onChange={e => onChange({ includeSections: { ...settings.includeSections, [t.key]: e.target.checked } })}
                className="h-4 w-4 accent-primary"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Create Automation Modal ─── */
const TRIGGER_OPTIONS = [
  "Lead Created", "Lead Updated", "Deal Created", "Stage Changed",
  "No Activity", "Forecast Updated", "Task Completed", "Email Opened",
  "Meeting Scheduled", "Contract Signed",
] as const;

const ACTION_OPTIONS = [
  "Send email sequence", "Round-robin assign", "Notify team", "Notify PMS team",
  "Set status to Lost", "Alert manager", "Create task", "Move to stage",
  "Recalculate AI score", "Send Slack message", "Update CRM field",
] as const;

interface CreateAutomationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (rule: { label: string; description: string; enabled: boolean; trigger: string; condition: string; action: string }) => void;
}

function CreateAutomationModal({ open, onOpenChange, onSave }: CreateAutomationModalProps) {
  const [form, setForm] = useState({ label: "", description: "", trigger: "", condition: "", action: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const update = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.label.trim()) errs.label = "Automation name is required";
    if (form.label.trim().length > 0 && form.label.trim().length < 5) errs.label = "Name must be at least 5 characters";
    if (!form.trigger) errs.trigger = "Select a trigger event";
    if (!form.condition.trim()) errs.condition = "Condition is required";
    if (!form.action) errs.action = "Select an action";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    onSave({ ...form, enabled: true });
    setForm({ label: "", description: "", trigger: "", condition: "", action: "" });
    setErrors({});
    setIsSaving(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isSaving) {
      onOpenChange(isOpen);
      if (!isOpen) {
        setForm({ label: "", description: "", trigger: "", condition: "", action: "" });
        setErrors({});
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0c1222] border border-white/10 text-white sm:max-w-[560px] p-0 gap-0 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/5">
          <DialogHeader className="gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Workflow className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white">Create New Automation</DialogTitle>
                <DialogDescription className="text-[11px] text-white/40 mt-0.5">
                  Define a trigger, condition, and action to automate your sales workflow.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-5 max-h-[480px] overflow-y-auto">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Automation Name *</Label>
            <Input
              placeholder="e.g. Auto-escalate high-value deals"
              value={form.label}
              onChange={e => update("label", e.target.value)}
              disabled={isSaving}
              className={`h-9 text-xs bg-white/5 border rounded-lg text-white placeholder:text-white/20 ${errors.label ? "border-red-500/50" : "border-white/10 focus:border-primary/50"
                }`}
            />
            {errors.label && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.label}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Description</Label>
            <Textarea
              placeholder="Brief description of what this automation does..."
              value={form.description}
              onChange={e => update("description", e.target.value)}
              disabled={isSaving}
              rows={2}
              className="text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/20 focus:border-primary/50 resize-none"
            />
          </div>

          {/* Trigger */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">When this happens (Trigger) *</Label>
            <Select value={form.trigger} onValueChange={v => update("trigger", v)}>
              <SelectTrigger className={`h-9 text-xs bg-white/5 border rounded-lg text-white ${errors.trigger ? "border-red-500/50" : "border-white/10"
                }`}>
                <SelectValue placeholder="Select trigger event..." />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_OPTIONS.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.trigger && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.trigger}</p>}
          </div>

          {/* Condition */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">If this condition is met *</Label>
            <Input
              placeholder="e.g. Deal value > ₹5,00,000"
              value={form.condition}
              onChange={e => update("condition", e.target.value)}
              disabled={isSaving}
              className={`h-9 text-xs bg-white/5 border rounded-lg text-white placeholder:text-white/20 ${errors.condition ? "border-red-500/50" : "border-white/10 focus:border-primary/50"
                }`}
            />
            {errors.condition && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.condition}</p>}
            <p className="text-[10px] text-white/25">Use natural language or a simple expression.</p>
          </div>

          {/* Action */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Then do this (Action) *</Label>
            <Select value={form.action} onValueChange={v => update("action", v)}>
              <SelectTrigger className={`h-9 text-xs bg-white/5 border rounded-lg text-white ${errors.action ? "border-red-500/50" : "border-white/10"
                }`}>
                <SelectValue placeholder="Select action..." />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map(a => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.action && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.action}</p>}
          </div>

          {/* Preview */}
          {form.trigger && form.action && (
            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Rule Preview</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400">{form.trigger}</span>
                <span className="text-[10px] text-white/20">→</span>
                {form.condition && <span className="text-[10px] font-medium text-amber-400/70 italic">if {form.condition}</span>}
                {form.condition && <span className="text-[10px] text-white/20">→</span>}
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">{form.action}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleClose(false)}
              disabled={isSaving}
              className="h-8 px-4 text-xs text-white/50 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 px-6 text-xs font-bold bg-[#1e40af] hover:bg-blue-600 text-white rounded-lg transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Create Automation
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Integration Connect Modal ─── */
interface IntegrationConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: IntegrationDef;
  onSuccess: (appName: string) => void;
}

function IntegrationConnectModal({ open, onOpenChange, integration, onSuccess }: IntegrationConnectModalProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleFieldChange = (key: string, value: string) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
    // Clear error on change
    if (fieldErrors[key]) {
      setFieldErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
    }
    if (connectionError) setConnectionError(null);
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    for (const field of integration.fields) {
      const value = (formValues[field.key] ?? "").trim();

      if (field.required && !value) {
        errors[field.key] = `${field.label.replace(" *", "")} is required`;
        isValid = false;
        continue;
      }

      if (value && field.type === "url") {
        try {
          new URL(value);
        } catch {
          errors[field.key] = "Please enter a valid URL";
          isValid = false;
        }
      }

      // Integration-specific format validations
      if (value) {
        if (field.key === "webhookUrl" && integration.name === "Slack" && !value.startsWith("https://hooks.slack.com/")) {
          errors[field.key] = "Slack webhook URLs must start with https://hooks.slack.com/";
          isValid = false;
        }
        if (field.key === "accountSid" && !value.startsWith("AC")) {
          errors[field.key] = "Account SID must start with 'AC'";
          isValid = false;
        }
        if (field.key === "publishableKey" && !value.startsWith("pk_")) {
          errors[field.key] = "Publishable key must start with 'pk_'";
          isValid = false;
        }
        if (field.key === "secretKey" && integration.name === "Stripe" && !value.startsWith("sk_")) {
          errors[field.key] = "Secret key must start with 'sk_'";
          isValid = false;
        }
        if (field.key === "webhookSecret" && !value.startsWith("whsec_")) {
          errors[field.key] = "Webhook secret must start with 'whsec_'";
          isValid = false;
        }
        if (field.key === "accessToken" && integration.name === "HubSpot" && !value.startsWith("pat-")) {
          errors[field.key] = "Access token must start with 'pat-'";
          isValid = false;
        }
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    setIsConnecting(true);
    setConnectionError(null);

    // Simulate API connection attempt
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Simulate random success/failure (80% success rate)
    const isSuccess = Math.random() > 0.2;

    if (isSuccess) {
      setIsConnecting(false);
      onSuccess(integration.name);
      // Reset form
      setFormValues({});
      setFieldErrors({});
      setShowPasswords({});
    } else {
      setIsConnecting(false);
      const errorMessages = [
        "Authentication failed: Invalid credentials provided. Please verify your API key/token and try again.",
        "Connection timed out: Unable to reach the service endpoint. Check your network and credentials.",
        "Permission denied: The provided credentials do not have sufficient access. Verify scopes and permissions.",
        "Rate limit exceeded: Too many connection attempts. Please wait a moment and try again.",
      ];
      setConnectionError(errorMessages[Math.floor(Math.random() * errorMessages.length)]);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isConnecting) {
      onOpenChange(isOpen);
      if (!isOpen) {
        setFormValues({});
        setFieldErrors({});
        setShowPasswords({});
        setConnectionError(null);
      }
    }
  };

  const Icon = integration.icon;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0c1222] border border-white/10 text-white sm:max-w-[520px] p-0 gap-0 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/5">
          <DialogHeader className="gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white">Connect {integration.name}</DialogTitle>
                <DialogDescription className="text-[11px] text-white/40 mt-0.5">
                  {integration.desc}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Connection Error Alert */}
        {connectionError && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-red-400 mb-0.5">Connection Failed</p>
              <p className="text-[11px] text-red-300/70 leading-relaxed">{connectionError}</p>
            </div>
            <button onClick={() => setConnectionError(null)} className="text-red-400/50 hover:text-red-400 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Form Fields */}
        <div className="px-6 py-5 space-y-4 max-h-[400px] overflow-y-auto">
          {integration.fields.map(field => {
            const error = fieldErrors[field.key];
            const isPassword = field.type === "password";
            const showPw = showPasswords[field.key] ?? false;

            return (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                  {field.label}
                </Label>
                <div className="relative">
                  <Input
                    type={isPassword && !showPw ? "password" : "text"}
                    placeholder={field.placeholder}
                    value={formValues[field.key] ?? ""}
                    onChange={e => handleFieldChange(field.key, e.target.value)}
                    disabled={isConnecting}
                    className={`h-9 text-xs bg-white/5 border rounded-lg text-white placeholder:text-white/20 pr-10 font-mono ${error
                        ? "border-red-500/50 focus:border-red-500 focus-visible:ring-red-500/20"
                        : "border-white/10 focus:border-primary/50 focus-visible:ring-primary/20"
                      }`}
                  />
                  {isPassword && (
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(field.key)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      tabIndex={-1}
                    >
                      {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
                {error && (
                  <p className="text-[10px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {error}
                  </p>
                )}
                {field.helpText && !error && (
                  <p className="text-[10px] text-white/30 leading-relaxed">{field.helpText}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <a
              href={integration.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-primary/70 hover:text-primary underline underline-offset-2 transition-colors"
            >
              View {integration.name} API docs →
            </a>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleClose(false)}
                disabled={isConnecting}
                className="h-8 px-4 text-xs text-white/50 hover:text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isConnecting}
                className="h-8 px-6 text-xs font-bold bg-[#1e40af] hover:bg-blue-600 text-white rounded-lg transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Plug className="w-3.5 h-3.5 mr-1.5" />
                    Connect
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

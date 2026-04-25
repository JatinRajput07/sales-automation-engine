import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Edit2, Archive, MoreHorizontal, Phone, Mail, Calendar, Plus, ListChecks, Sparkles, FileText, Paperclip, ExternalLink, Send, CheckCircle2 } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/StatusPill";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSalesStore, ALL_LEAD_STATUSES, leadStatusVariant, priorityDot, type LeadStatus, type LeadPriority } from "@/store/salesStore";
import { PEOPLE, inr } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { AttachmentsBlock, NotesBlock } from "@/components/sales/AttachmentsBlock";

const peopleById = (id: string) => PEOPLE.find(p => p.id === id);
const TABS = ["Overview", "Activity", "Tasks", "Notes", "Files", "Proposals", "AI Insights"] as const;
type Tab = typeof TABS[number];

export default function LeadDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const allLeads = useSalesStore((s) => s.leads);
  const sources = useSalesStore((s) => s.sources);
  const allActivities = useSalesStore((s) => s.activities);
  const allTasks = useSalesStore((s) => s.tasks);
  const updateLead = useSalesStore((s) => s.updateLead);
  const setLeadStatus = useSalesStore((s) => s.setLeadStatus);
  const logActivity = useSalesStore((s) => s.logActivity);
  const addTask = useSalesStore((s) => s.addTask);
  const setTaskStatus = useSalesStore((s) => s.setTaskStatus);
  const addLeadNote = useSalesStore((s) => s.addLeadNote);
  const addLeadAttachment = useSalesStore((s) => s.addLeadAttachment);
  const removeLeadAttachment = useSalesStore((s) => s.removeLeadAttachment);

  const [tab, setTab] = useState<Tab>("Overview");
  const lead = useMemo(() => allLeads.find(l => l.id === id), [allLeads, id]);
  const activities = useMemo(() => allActivities.filter(a => a.leadId === id), [allActivities, id]);
  const tasks = useMemo(() => allTasks.filter(t => t.leadId === id), [allTasks, id]);

  if (!lead) {
    return (
      <div className="p-6">
        <p className="text-sm">Lead not found.</p>
        <Link to="/sales/leads" className="text-primary text-xs hover:underline">Back to leads</Link>
      </div>
    );
  }

  const owner = peopleById(lead.assigneeId);
  const src = sources.find(s => s.id === lead.sourceAccountId);
  const fmtVal = lead.estimatedValue ? `${lead.budgetCurrency === "USD" ? "$" : "₹"}${lead.estimatedValue.toLocaleString("en-IN")}` : "—";

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader
        title={lead.title}
        subtitle={`Sales › Leads › ${lead.id}`}
        accentVar="--mod-sales"
        actions={
          <>
            <Link to="/sales/leads"><Button variant="outline" size="sm" className="h-7 text-xs gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Back</Button></Link>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Edit2 className="w-3.5 h-3.5" /> Edit</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => toast({ title: "Convert to Deal", description: "Deal flow stub — coming soon" })}>
              Convert to Deal
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs"><Archive className="w-3.5 h-3.5" /></Button>
            <Button variant="outline" size="sm" className="h-7 text-xs"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
          </>
        }
      />

      {/* Lead header strip */}
      <div className="px-3 py-2.5 bg-surface border-b border-border flex flex-wrap items-center gap-3 text-xs">
        <HeaderStat label="Status">
          <Select value={lead.status} onValueChange={(v) => { setLeadStatus(lead.id, v as LeadStatus); toast({ title: `Status updated to ${v}` }); }}>
            <SelectTrigger className="h-6 text-2xs px-2 w-32"><SelectValue /></SelectTrigger>
            <SelectContent>{ALL_LEAD_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </HeaderStat>
        <HeaderStat label="Priority">
          <Select value={lead.priority} onValueChange={(v) => { updateLead(lead.id, { priority: v as LeadPriority }); }}>
            <SelectTrigger className="h-6 text-2xs px-2 w-24"><SelectValue /></SelectTrigger>
            <SelectContent>{(["Critical","High","Medium","Low"] as LeadPriority[]).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </HeaderStat>
        <HeaderStat label="Assigned">
          <Select value={lead.assigneeId} onValueChange={(v) => updateLead(lead.id, { assigneeId: v })}>
            <SelectTrigger className="h-6 text-2xs px-2 w-36"><SelectValue /></SelectTrigger>
            <SelectContent>{PEOPLE.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </HeaderStat>
        <HeaderStat label="Follow-up By">
          <Select value={lead.followUpPersonId ?? ""} onValueChange={(v) => updateLead(lead.id, { followUpPersonId: v })}>
            <SelectTrigger className="h-6 text-2xs px-2 w-36"><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>{PEOPLE.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </HeaderStat>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-2xs text-muted-foreground uppercase tracking-wider">AI Score</span>
          <div className="w-16 h-1.5 bg-surface-hover rounded-full overflow-hidden">
            <div className={`h-full ${lead.aiScore >= 7 ? "bg-success" : lead.aiScore >= 4 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${lead.aiScore * 10}%` }} />
          </div>
          <span className="font-mono font-bold">{lead.aiScore}/10</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="h-9 px-3 flex items-center gap-0.5 border-b border-border bg-surface/50 text-xs overflow-x-auto">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`h-7 px-3 rounded-sm whitespace-nowrap ${tab === t ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-surface-hover"}`}
          >{t}</button>
        ))}
      </div>

      <div className="p-3 flex-1">
        {tab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 space-y-3">
              <Card title="Lead Details">
                <DetailRow label="Title" value={lead.title} />
                <DetailRow label="Description" value={<p className="text-xs leading-relaxed">{lead.description}</p>} />
                <DetailRow label="Project Type" value={lead.projectType} />
                <DetailRow label="Tech Stack" value={<div className="flex flex-wrap gap-1">{lead.techStack.map(t => <span key={t} className="px-1.5 h-4 rounded-sm bg-primary/10 text-primary text-2xs">{t}</span>)}</div>} />
                <DetailRow label="Budget" value={`${fmtVal} (${lead.budgetType})`} />
                <DetailRow label="Timeline" value={lead.timeline ?? "—"} />
                <DetailRow label="Complexity" value={lead.complexity} />
                <DetailRow label="Tags" value={<div className="flex flex-wrap gap-1">{lead.tags.map(t => <span key={t} className="px-1.5 h-4 rounded-sm bg-surface-hover text-2xs">{t}</span>)}</div>} />
                {lead.internalNotes && <DetailRow label="Internal Notes" value={<p className="text-2xs text-muted-foreground">{lead.internalNotes}</p>} />}
              </Card>
              <Card title="Source">
                <DetailRow label="Platform" value={lead.sourcePlatform} />
                <DetailRow label="Account" value={src ? <Link to={`/sales/sources/${src.id}`} className="text-primary hover:underline">{src.displayName}</Link> : "—"} />
                <DetailRow label="Lead Type" value={lead.leadType} />
                {lead.jobUrl && <DetailRow label="Job URL" value={<a href={lead.jobUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">{lead.jobUrl} <ExternalLink className="w-3 h-3" /></a>} />}
                {lead.bidAmount && <DetailRow label="Bid Amount" value={`$${lead.bidAmount}`} />}
                {lead.contractType && <DetailRow label="Contract Type" value={lead.contractType} />}
              </Card>
              <Card title="Contact">
                <DetailRow label="Name" value={`${lead.firstName} ${lead.lastName}`} />
                <DetailRow label="Email" value={lead.email} />
                <DetailRow label="Phone" value={lead.phone ?? "—"} />
                <DetailRow label="Designation" value={lead.designation ?? "—"} />
                <DetailRow label="Preferred" value={lead.preferredContact} />
                <DetailRow label="Timezone" value={lead.timezone} />
                <DetailRow label="Company" value={`${lead.company} · ${lead.industry} · ${lead.country}${lead.city ? " · " + lead.city : ""}`} />
                {lead.companyWebsite && <DetailRow label="Website" value={<a href={lead.companyWebsite} target="_blank" rel="noreferrer" className="text-primary hover:underline">{lead.companyWebsite}</a>} />}
                {lead.linkedin && <DetailRow label="LinkedIn" value={<a href={lead.linkedin} target="_blank" rel="noreferrer" className="text-primary hover:underline">{lead.linkedin}</a>} />}
              </Card>
              <Card title="Assignment">
                <DetailRow label="Responsible" value={peopleById(lead.assigneeId)?.name ?? "—"} />
                <DetailRow label="Follow-up Person" value={lead.followUpPersonId ? peopleById(lead.followUpPersonId)?.name : "—"} />
                <DetailRow label="Follow-up Date" value={lead.followUpDate ?? "—"} />
                <DetailRow label="Team" value={lead.team ?? "—"} />
              </Card>
            </div>
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-primary/10 to-mod-pms/10 border border-primary/30 rounded-sm p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">AI Lead Score: {lead.aiScore}/10</h3>
                </div>
                <ul className="text-2xs space-y-1">
                  <li className="text-success">✓ {lead.leadType === "Direct Invite" || lead.leadType === "Referral" ? "High-value source" : "Inbound source"} +1.8</li>
                  {(lead.estimatedValue ?? 0) > 300000 && <li className="text-success">✓ Budget &gt; ₹3L +1.2</li>}
                  {(lead.description?.length ?? 0) > 100 && <li className="text-success">✓ Detailed description +0.6</li>}
                  {lead.status === "New" && <li className="text-destructive">✗ No activity yet -0.8</li>}
                </ul>
              </div>
              <Card title="Quick Actions">
                <div className="grid grid-cols-2 gap-1.5">
                  <ActionBtn icon={Phone} label="Log Call" onClick={() => quickActivity("Call")} />
                  <ActionBtn icon={Mail} label="Send Email" onClick={() => quickActivity("Email")} />
                  <ActionBtn icon={Calendar} label="Meeting" onClick={() => quickActivity("Meeting")} />
                  <ActionBtn icon={Plus} label="Task" onClick={() => setTab("Tasks")} />
                </div>
              </Card>
              <NotesBlock notes={lead.notes ?? []} onAdd={(t) => addLeadNote(lead.id, t)} />
            </div>
          </div>
        )}

        {tab === "Activity" && <ActivityTab leadId={lead.id} activities={activities} onLog={(a) => logActivity({ ...a, leadId: lead.id })} />}
        {tab === "Tasks" && <TasksTab leadId={lead.id} tasks={tasks} onAdd={addTask} onStatus={setTaskStatus} />}
        {tab === "Notes" && <NotesBlock notes={lead.notes ?? []} onAdd={(t) => addLeadNote(lead.id, t)} />}
        {tab === "Files" && (
          <AttachmentsBlock
            attachments={lead.attachments ?? []}
            onAdd={(att) => addLeadAttachment(lead.id, att)}
            onRemove={(attId) => removeLeadAttachment(lead.id, attId)}
          />
        )}
        {tab === "Proposals" && <EmptyTab icon={FileText} title="Proposals" message="No proposals yet. Create one from /sales/proposals." />}
        {tab === "AI Insights" && <AIInsightsTab lead={lead} />}
      </div>
    </div>
  );

  function quickActivity(type: "Call" | "Email" | "Meeting") {
    logActivity({
      leadId: lead!.id, type, subject: `Quick ${type} logged`,
      date: new Date().toISOString().slice(0, 10), byId: "p1",
    });
    toast({ title: `${type} logged` });
  }
}

function ActivityTab({ leadId, activities, onLog }: { leadId: string; activities: any[]; onLog: (a: any) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ type: "Call", subject: "", description: "", outcome: "Positive", date: new Date().toISOString().slice(0, 10) });
  const { toast } = useToast();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <div className="lg:col-span-2 bg-surface border border-border rounded-sm">
        <div className="h-9 px-3 flex items-center justify-between border-b border-border">
          <h3 className="text-xs font-semibold uppercase tracking-wider">Activity Timeline ({activities.length})</h3>
          <Button size="sm" className="h-6 text-2xs gap-1" onClick={() => setOpen(!open)}><Plus className="w-3 h-3" /> Log Activity</Button>
        </div>
        {open && (
          <div className="p-3 border-b border-border bg-surface-elevated/50 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{["Call","Email","Meeting","Demo","Note","Follow-up"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Input className="h-8 text-xs col-span-2" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject *" />
            </div>
            <Textarea rows={3} className="text-xs" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description / notes…" />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" className="h-7 text-2xs" onClick={() => setOpen(false)}>Cancel</Button>
              <Button size="sm" className="h-7 text-2xs" onClick={() => {
                if (!form.subject || form.subject.length < 5) { toast({ title: "Subject required (min 5 chars)", variant: "destructive" }); return; }
                onLog({ ...form, byId: "p1" });
                toast({ title: "Activity logged" });
                setOpen(false);
                setForm({ type: "Call", subject: "", description: "", outcome: "Positive", date: new Date().toISOString().slice(0, 10) });
              }}>Save</Button>
            </div>
          </div>
        )}
        <div className="p-3 space-y-2">
          {activities.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No activity yet.</p>}
          {activities.map(a => {
            const p = peopleById(a.byId);
            return (
              <div key={a.id} className="flex gap-3 p-2 border border-border rounded-sm hover:bg-surface-hover">
                <div className="w-7 h-7 rounded-sm bg-primary/15 text-primary flex items-center justify-center font-mono text-2xs font-bold shrink-0">{p?.initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs">
                      <span className="font-medium">{p?.name}</span>
                      <StatusPill variant="info" className="ml-1.5">{a.type}</StatusPill>
                    </div>
                    <span className="text-3xs text-muted-foreground font-mono">{a.date}</span>
                  </div>
                  <div className="text-xs font-medium mt-0.5">{a.subject}</div>
                  {a.description && <p className="text-2xs text-muted-foreground mt-1">{a.description}</p>}
                  {a.outcome && <span className="text-3xs text-muted-foreground mt-1 block">Outcome: <span className={a.outcome === "Positive" ? "text-success" : a.outcome === "Negative" ? "text-destructive" : ""}>{a.outcome}</span></span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-surface border border-border rounded-sm p-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2">Filter by type</h3>
        <div className="space-y-1 text-xs">
          {["Call","Email","Meeting","Note","Status Change","Created"].map(t => (
            <div key={t} className="flex items-center justify-between py-1 px-2 rounded-sm hover:bg-surface-hover">
              <span>{t}</span>
              <span className="font-mono text-2xs text-muted-foreground">{activities.filter(a => a.type === t).length}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TasksTab({ leadId, tasks, onAdd, onStatus }: { leadId: string; tasks: any[]; onAdd: (t: any) => void; onStatus: (id: string, s: any) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ title: "", type: "Research", assigneeId: "p1", dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10), priority: "Medium" });
  const { toast } = useToast();

  return (
    <div className="bg-surface border border-border rounded-sm">
      <div className="h-9 px-3 flex items-center justify-between border-b border-border">
        <h3 className="text-xs font-semibold uppercase tracking-wider">Tasks ({tasks.length})</h3>
        <Button size="sm" className="h-6 text-2xs gap-1" onClick={() => setOpen(!open)}><Plus className="w-3 h-3" /> Create Task</Button>
      </div>
      {open && (
        <div className="p-3 border-b border-border bg-surface-elevated/50 grid grid-cols-2 lg:grid-cols-5 gap-2">
          <Input className="h-8 text-xs col-span-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task title *" />
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{["Research","MVP Build","Proposal","Follow-up","Call","Meeting","Other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.assigneeId} onValueChange={(v) => setForm({ ...form, assigneeId: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{PEOPLE.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="date" className="h-8 text-xs" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <div className="col-span-2 lg:col-span-5 flex justify-end gap-2">
            <Button variant="outline" size="sm" className="h-7 text-2xs" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" className="h-7 text-2xs" onClick={() => {
              if (!form.title) { toast({ title: "Title required", variant: "destructive" }); return; }
              onAdd({ ...form, leadId, status: "Open" });
              toast({ title: "Task created" });
              setOpen(false);
              setForm({ ...form, title: "" });
            }}>Add Task</Button>
          </div>
        </div>
      )}
      <table className="w-full text-xs">
        <thead className="bg-muted/40">
          <tr className="text-2xs uppercase text-muted-foreground">
            <th className="text-left px-3 h-8">Task</th>
            <th className="text-left px-3 h-8">Type</th>
            <th className="text-left px-3 h-8">Assignee</th>
            <th className="text-left px-3 h-8">Due</th>
            <th className="text-left px-3 h-8">Priority</th>
            <th className="text-left px-3 h-8">Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => {
            const a = peopleById(t.assigneeId);
            return (
              <tr key={t.id} className="border-t border-border hover:bg-surface-hover">
                <td className="px-3 h-9">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onStatus(t.id, t.status === "Done" ? "Open" : "Done")} className="text-muted-foreground hover:text-success">
                      {t.status === "Done" ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <ListChecks className="w-3.5 h-3.5" />}
                    </button>
                    <span className={t.status === "Done" ? "line-through text-muted-foreground" : ""}>{t.title}</span>
                  </div>
                </td>
                <td className="px-3 h-9"><StatusPill variant="info">{t.type}</StatusPill></td>
                <td className="px-3 h-9">{a?.name}</td>
                <td className="px-3 h-9 font-mono text-2xs">{t.dueDate}</td>
                <td className="px-3 h-9">{priorityDot(t.priority)} {t.priority}</td>
                <td className="px-3 h-9">
                  <Select value={t.status} onValueChange={(v) => onStatus(t.id, v as any)}>
                    <SelectTrigger className="h-6 text-2xs px-2 w-28"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Open">Open</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Done">Done</SelectItem></SelectContent>
                  </Select>
                </td>
              </tr>
            );
          })}
          {tasks.length === 0 && <tr><td colSpan={6} className="text-center py-6 text-muted-foreground text-xs">No tasks yet</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function AIInsightsTab({ lead }: { lead: any }) {
  const winProb = Math.min(95, Math.max(5, Math.round(lead.aiScore * 9 + (lead.status === "Negotiation" ? 15 : 0) + (lead.status === "Proposal Sent" ? 10 : 0))));
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <div className="lg:col-span-2 bg-gradient-to-br from-primary/10 to-mod-pms/10 border border-primary/30 rounded-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">ARIA Lead Intelligence</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-surface/80 rounded-sm p-3">
            <div className="text-2xs uppercase text-muted-foreground tracking-wider">Win Probability</div>
            <div className="text-2xl font-mono font-bold text-success mt-1">{winProb}%</div>
            <div className="text-2xs text-muted-foreground mt-0.5">↑ from {Math.max(5, winProb - 13)}% last week</div>
          </div>
          <div className="bg-surface/80 rounded-sm p-3">
            <div className="text-2xs uppercase text-muted-foreground tracking-wider">Predicted Close</div>
            <div className="text-2xl font-mono font-bold mt-1">{new Date(Date.now() + 86400000 * 35).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
            <div className="text-2xs text-muted-foreground mt-0.5">~5 weeks</div>
          </div>
        </div>
        <div className="space-y-2 text-xs">
          <div>
            <h4 className="text-2xs uppercase tracking-wider text-success font-semibold mb-1">Positive Signals</h4>
            <ul className="space-y-0.5 text-2xs pl-4 list-disc">
              <li>{lead.leadType === "Direct Invite" ? "Direct invite (vs bid) — 2.3x higher close rate" : "Inbound interest"}</li>
              <li>Budget {(lead.estimatedValue ?? 0) > 300000 ? "above" : "in line with"} estimate</li>
              <li>Detailed initial brief shows commitment</li>
            </ul>
          </div>
          <div>
            <h4 className="text-2xs uppercase tracking-wider text-destructive font-semibold mb-1">Risk Factors</h4>
            <ul className="space-y-0.5 text-2xs pl-4 list-disc">
              {lead.status === "New" && <li>No call scheduled yet — avg deal at this stage has 2 calls</li>}
              <li>Decision maker not yet confirmed</li>
            </ul>
          </div>
          <div>
            <h4 className="text-2xs uppercase tracking-wider text-primary font-semibold mb-1">ARIA Suggestions</h4>
            <ol className="space-y-0.5 text-2xs pl-4 list-decimal">
              <li>Schedule a discovery call this week</li>
              <li>Identify decision maker (ask {lead.firstName})</li>
              <li>Send case study: {lead.projectType} projects</li>
            </ol>
          </div>
        </div>
        <div className="flex gap-2 mt-3 pt-3 border-t border-primary/20">
          <Button size="sm" className="h-7 text-2xs gap-1"><Send className="w-3 h-3" /> Draft follow-up</Button>
          <Button size="sm" variant="outline" className="h-7 text-2xs gap-1"><Calendar className="w-3 h-3" /> Schedule call</Button>
          <Button size="sm" variant="outline" className="h-7 text-2xs gap-1"><Plus className="w-3 h-3" /> Create task</Button>
        </div>
      </div>
      <div className="bg-surface border border-border rounded-sm p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2">Stage Probability</h3>
        <div className="space-y-2 text-xs">
          {ALL_LEAD_STATUSES.filter(s => !["Won","Lost","On Hold"].includes(s)).map((s, i) => {
            const probs = [12, 24, 42, 58, 72];
            return (
              <div key={s}>
                <div className="flex items-center justify-between mb-0.5">
                  <span>{s}</span><span className="font-mono">{probs[i]}%</span>
                </div>
                <div className="h-1 bg-surface-hover rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${probs[i]}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EmptyTab({ icon: Icon, title, message }: { icon: any; title: string; message: string }) {
  return (
    <div className="bg-surface border border-border rounded-sm p-12 flex flex-col items-center justify-center text-center">
      <Icon className="w-8 h-8 text-muted-foreground mb-2" />
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm">{message}</p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-sm">
      <div className="h-9 px-3 border-b border-border flex items-center"><h3 className="text-xs font-semibold uppercase tracking-wider">{title}</h3></div>
      <div className="p-3 space-y-1.5">{children}</div>
    </div>
  );
}
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-xs py-1">
      <div className="w-28 shrink-0 text-2xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex-1 min-w-0">{value}</div>
    </div>
  );
}
function HeaderStat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="text-2xs text-muted-foreground uppercase tracking-wider">{label}:</div>
      {children}
    </div>
  );
}
function ActionBtn({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="h-9 rounded-sm border border-border hover:border-primary hover:bg-primary/5 hover:text-primary flex items-center gap-1.5 px-2 text-xs font-medium">
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
}

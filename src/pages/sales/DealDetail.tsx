import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Archive, MoreHorizontal, Phone, Mail, Calendar, Plus, ListChecks, Sparkles, FileText, Paperclip, ExternalLink, Send, CheckCircle2 } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/StatusPill";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useSalesStore, ALL_DEAL_STAGES, dealStageVariant, priorityDot, type DealStage } from "@/store/salesStore";
import { PEOPLE, inr } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { AttachmentsBlock, NotesBlock } from "@/components/sales/AttachmentsBlock";

const peopleById = (id: string) => PEOPLE.find(p => p.id === id);
const TABS = ["Overview", "Activity", "Tasks", "Notes", "Files", "Proposals"] as const;
type Tab = typeof TABS[number];

export default function DealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const allDeals = useSalesStore(s => s.deals);
  const companies = useSalesStore(s => s.companies);
  const contacts = useSalesStore(s => s.contacts);
  const leads = useSalesStore(s => s.leads);
  const allActivities = useSalesStore(s => s.activities);
  const allTasks = useSalesStore(s => s.tasks);
  const proposals = useSalesStore(s => s.proposals);
  
  const setStage = useSalesStore(s => s.setDealStage);
  const updateDeal = useSalesStore(s => s.updateDeal);
  const logActivity = useSalesStore(s => s.logActivity);
  const addTask = useSalesStore(s => s.addTask);
  const setTaskStatus = useSalesStore(s => s.setTaskStatus);
  const addDealNote = useSalesStore(s => s.addDealNote);
  const addDealAttachment = useSalesStore(s => s.addDealAttachment);
  const removeDealAttachment = useSalesStore(s => s.removeDealAttachment);

  const [tab, setTab] = useState<Tab>("Overview");
  const [actionModal, setActionModal] = useState<"Call" | "Email" | "Meeting" | "Task" | null>(null);
  const [actionForm, setActionForm] = useState<any>({});
  
  const deal = useMemo(() => allDeals.find(d => d.id === id), [allDeals, id]);
  const activities = useMemo(() => allActivities.filter(a => a.dealId === id), [allActivities, id]);
  const tasks = useMemo(() => allTasks.filter(t => t.dealId === id), [allTasks, id]);
  const dealProposals = useMemo(() => proposals.filter(p => p.dealId === id), [proposals, id]);

  if (!deal) {
    return (
      <div className="p-6">
        <p className="text-sm">Deal not found.</p>
        <Link to="/sales/deals" className="text-primary text-xs hover:underline">Back to deals</Link>
      </div>
    );
  }

  const owner = peopleById(deal.ownerId);
  const company = companies.find(c => c.id === deal.companyId);
  const contact = contacts.find(c => c.id === deal.contactId);
  const lead = leads.find(l => l.id === deal.leadId);

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader
        title={deal.title}
        subtitle={company?.name || `Sales › Deals › ${deal.id}`}
        accentVar="--mod-sales"
        actions={
          <>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate("/sales/deals")}><ArrowLeft className="w-3.5 h-3.5" /> Back</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Edit2 className="w-3.5 h-3.5" /> Edit</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate(`/sales/proposals/new?dealId=${deal.id}`)}>
              <FileText className="w-3.5 h-3.5" /> Create Proposal
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs"><Archive className="w-3.5 h-3.5" /></Button>
            <Button variant="outline" size="sm" className="h-7 text-xs"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
          </>
        }
      />

      {/* Deal header strip */}
      <div className="px-3 py-2.5 bg-surface border-b border-border flex flex-wrap items-center gap-3 text-xs">
        <HeaderStat label="Stage">
          <Select value={deal.stage} onValueChange={(v) => { setStage(deal.id, v as DealStage); toast({ title: `Moved to ${v}` }); }}>
            <SelectTrigger className="h-6 text-2xs px-2 w-32"><SelectValue /></SelectTrigger>
            <SelectContent>{ALL_DEAL_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </HeaderStat>
        <HeaderStat label="Probability">
          <div className="flex items-center gap-2">
            <Input type="number" min={0} max={100} value={deal.probability} onChange={(e) => updateDeal(deal.id, { probability: Number(e.target.value) })} className="h-6 w-16 text-2xs px-2" />
            <span className="text-2xs text-muted-foreground">%</span>
          </div>
        </HeaderStat>
        <HeaderStat label="Assigned">
          <Select value={deal.ownerId} onValueChange={(v) => updateDeal(deal.id, { ownerId: v })}>
            <SelectTrigger className="h-6 text-2xs px-2 w-36"><SelectValue /></SelectTrigger>
            <SelectContent>{PEOPLE.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </HeaderStat>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-2xs text-muted-foreground uppercase tracking-wider">Value</span>
          <span className="font-mono font-bold text-success text-sm">{inr(deal.value)}</span>
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
              
              {/* Stage Progression Visualizer */}
              <div className="bg-surface border border-border rounded-sm p-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Stage Progression</h3>
                <div className="flex gap-1">
                  {ALL_DEAL_STAGES.map(s => {
                    const idx = ALL_DEAL_STAGES.indexOf(deal.stage);
                    const cur = ALL_DEAL_STAGES.indexOf(s);
                    const active = cur <= idx && deal.stage !== "Closed Lost";
                    const lost = deal.stage === "Closed Lost" && s === "Closed Lost";
                    return (
                      <button
                        key={s}
                        onClick={() => { setStage(deal.id, s); toast({ title: `Moved to ${s}` }); }}
                        className={`flex-1 h-8 text-2xs font-medium rounded-sm transition-colors ${active ? "bg-primary/15 text-primary border border-primary/30" : lost ? "bg-destructive/15 text-destructive border border-destructive/30" : "bg-surface-hover text-muted-foreground hover:text-foreground border border-border"}`}
                      >{s}</button>
                    );
                  })}
                </div>
              </div>

              <Card title="Deal Details">
                <DetailRow label="Title" value={deal.title} />
                <DetailRow label="Value" value={<span className="font-mono">{inr(deal.value)} ({deal.currency})</span>} />
                <DetailRow label="Weighted Value" value={<span className="font-mono">{inr(deal.value * deal.probability / 100)}</span>} />
                <DetailRow label="Expected Close" value={<span className="font-mono text-mod-sales">{deal.expectedCloseDate}</span>} />
                <DetailRow label="Source" value={deal.source} />
                <DetailRow label="Tags" value={<div className="flex flex-wrap gap-1">{deal.tags.map(t => <span key={t} className="px-1.5 h-4 rounded-sm bg-surface-hover text-2xs">{t}</span>)}</div>} />
                <DetailRow label="Created On" value={<span className="font-mono text-muted-foreground">{deal.createdAt}</span>} />
              </Card>

              <div className="grid grid-cols-2 gap-3">
                {company && (
                  <Card title="Company">
                    <DetailRow label="Name" value={<Link to={`/sales/companies/${company.id}`} className="text-primary hover:underline">{company.name}</Link>} />
                    <DetailRow label="Industry" value={company.industry} />
                    <DetailRow label="Size" value={company.size} />
                    <DetailRow label="Website" value={<a href={company.website} target="_blank" className="text-primary hover:underline truncate inline-block max-w-[150px]">{company.website}</a>} />
                  </Card>
                )}
                {contact && (
                  <Card title="Primary Contact">
                    <DetailRow label="Name" value={`${contact.firstName} ${contact.lastName}`} />
                    <DetailRow label="Email" value={<a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a>} />
                    <DetailRow label="Phone" value={contact.phone} />
                    <DetailRow label="Role" value={contact.designation} />
                  </Card>
                )}
              </div>
              
              {lead && (
                <Card title="Source Lead">
                  <DetailRow label="Lead Title" value={<Link to={`/sales/leads/${lead.id}`} className="text-primary hover:underline">{lead.title}</Link>} />
                  <DetailRow label="Platform" value={lead.sourcePlatform} />
                  <DetailRow label="Lead Type" value={lead.leadType} />
                </Card>
              )}
            </div>

            <div className="space-y-3">
              <Card title="Quick Actions">
                <div className="grid grid-cols-2 gap-1.5">
                  <ActionBtn icon={Phone} label="Log Call" onClick={() => openAction("Call")} />
                  <ActionBtn icon={Mail} label="Send Email" onClick={() => openAction("Email")} />
                  <ActionBtn icon={Calendar} label="Meeting" onClick={() => openAction("Meeting")} />
                  <ActionBtn icon={Plus} label="Task" onClick={() => openAction("Task")} />
                </div>
              </Card>
              <NotesBlock notes={deal.noteList ?? []} onAdd={(t) => addDealNote(deal.id, t)} />
            </div>
          </div>
        )}

        {tab === "Activity" && <ActivityTab dealId={deal.id} activities={activities} onLog={(a) => logActivity({ ...a, dealId: deal.id })} />}
        {tab === "Tasks" && <TasksTab dealId={deal.id} tasks={tasks} onAdd={addTask} onStatus={setTaskStatus} />}
        {tab === "Notes" && <NotesBlock notes={deal.noteList ?? []} onAdd={(t) => addDealNote(deal.id, t)} />}
        {tab === "Files" && (
          <AttachmentsBlock
            attachments={deal.attachments ?? []}
            onAdd={(att) => addDealAttachment(deal.id, att)}
            onRemove={(attId) => removeDealAttachment(deal.id, attId)}
          />
        )}
        {tab === "Proposals" && (
          <div className="bg-surface border border-border rounded-sm p-3">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-xs font-semibold uppercase tracking-wider">Proposals ({dealProposals.length})</h3>
               <Button size="sm" className="h-7 text-xs gap-1" onClick={() => navigate(`/sales/proposals/new?dealId=${deal.id}`)}><Plus className="w-3.5 h-3.5" /> New Proposal</Button>
             </div>
             {dealProposals.length === 0 ? (
               <div className="text-center py-8 text-muted-foreground">
                 <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                 <p className="text-sm">No proposals created for this deal yet.</p>
               </div>
             ) : (
               <div className="space-y-2">
                 {dealProposals.map(p => (
                   <Link key={p.id} to={`/sales/proposals/${p.id}`} className="flex items-center justify-between p-3 border border-border rounded-sm hover:bg-surface-hover transition-colors">
                     <div>
                       <div className="text-sm font-medium">{p.title}</div>
                       <div className="text-xs text-muted-foreground mt-0.5">Created: {p.createdAt} · Valid until: {p.validUntil}</div>
                     </div>
                     <div className="text-right">
                       <StatusPill variant={p.status === "Accepted" ? "success" : p.status === "Sent" ? "warning" : "neutral"}>{p.status}</StatusPill>
                       <div className="font-mono text-xs font-semibold mt-1">{inr(p.lineItems.reduce((acc, it) => acc + (it.qty * it.rate), 0))}</div>
                     </div>
                   </Link>
                 ))}
               </div>
             )}
          </div>
        )}
      </div>
      <Dialog open={!!actionModal} onOpenChange={(o) => !o && setActionModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{actionModal === "Task" ? "Create Task" : `Log ${actionModal}`}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {actionModal === "Task" ? (
              <>
                <div><Label className="text-2xs">Title *</Label><Input className="h-8 text-xs" value={actionForm.title} onChange={e => setActionForm({...actionForm, title: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-2xs">Assignee</Label><Select value={actionForm.assigneeId} onValueChange={v => setActionForm({...actionForm, assigneeId: v})}><SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger><SelectContent>{PEOPLE.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label className="text-2xs">Due Date</Label><Input type="date" className="h-8 text-xs" value={actionForm.dueDate} onChange={e => setActionForm({...actionForm, dueDate: e.target.value})} /></div>
                </div>
              </>
            ) : (
              <>
                <div><Label className="text-2xs">Subject *</Label><Input className="h-8 text-xs" value={actionForm.subject} onChange={e => setActionForm({...actionForm, subject: e.target.value})} /></div>
                <div><Label className="text-2xs">Description</Label><Textarea rows={3} className="text-xs" value={actionForm.description} onChange={e => setActionForm({...actionForm, description: e.target.value})} /></div>
              </>
            )}
          </div>
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setActionModal(null)}>Cancel</Button><Button size="sm" onClick={submitAction}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function openAction(type: "Call" | "Email" | "Meeting" | "Task") {
    setActionModal(type);
    if (type === "Task") {
      setActionForm({ title: "", type: "Follow-up", assigneeId: deal!.ownerId, dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10), priority: "Medium" });
    } else {
      setActionForm({ type, subject: "", description: "", outcome: "Positive", date: new Date().toISOString().slice(0, 10) });
    }
  }

  function submitAction() {
    if (actionModal === "Task") {
      if (!actionForm.title) return toast({ title: "Title required", variant: "destructive" });
      addTask({ ...actionForm, dealId: deal!.id, status: "Open" });
      toast({ title: "Task created" });
      setTab("Tasks");
    } else {
      if (!actionForm.subject) return toast({ title: "Subject required", variant: "destructive" });
      logActivity({ ...actionForm, dealId: deal!.id, byId: "p1" });
      toast({ title: `${actionModal} logged` });
      setTab("Activity");
    }
    setActionModal(null);
  }
}

function ActivityTab({ dealId, activities, onLog }: { dealId: string; activities: any[]; onLog: (a: any) => void }) {
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

function TasksTab({ dealId, tasks, onAdd, onStatus }: { dealId: string; tasks: any[]; onAdd: (t: any) => void; onStatus: (id: string, s: any) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ title: "", type: "Follow-up", assigneeId: "p1", dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10), priority: "Medium" });
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
              onAdd({ ...form, dealId, status: "Open" });
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

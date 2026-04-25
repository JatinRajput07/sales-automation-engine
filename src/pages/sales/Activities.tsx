import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, Calendar, FileText, MessageSquare, Sparkles, StickyNote, Activity as ActivityIcon } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Input } from "@/components/ui/input";
import { useSalesStore, type Activity } from "@/store/salesStore";
import { PEOPLE } from "@/lib/mockData";

const iconFor = (t: Activity["type"]) => {
  switch (t) {
    case "Call": return Phone;
    case "Email": return Mail;
    case "Meeting": case "Demo": return Calendar;
    case "Proposal": return FileText;
    case "Follow-up": return MessageSquare;
    case "Note": return StickyNote;
    case "AI Action": return Sparkles;
    default: return ActivityIcon;
  }
};

const outcomeColor = (o?: Activity["outcome"]) =>
  o === "Positive" ? "text-success" : o === "Negative" ? "text-destructive" : o === "No Response" ? "text-warning" : "text-muted-foreground";

export default function Activities() {
  const activities = useSalesStore(s => s.activities);
  const leads = useSalesStore(s => s.leads);
  const [type, setType] = useState<string>("all");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    let out = [...activities].sort((a, b) => b.date.localeCompare(a.date));
    if (type !== "all") out = out.filter(a => a.type === type);
    if (q) {
      const s = q.toLowerCase();
      out = out.filter(a => a.subject.toLowerCase().includes(s));
    }
    return out;
  }, [activities, type, q]);

  // group by date
  const grouped = useMemo(() => {
    const g: Record<string, typeof rows> = {};
    rows.forEach(a => { (g[a.date] ??= []).push(a); });
    return Object.entries(g).sort((a, b) => b[0].localeCompare(a[0]));
  }, [rows]);

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title="Activities" subtitle={`${activities.length} logged interactions`} accentVar="--mod-sales" />

      <div className="h-10 px-3 flex items-center gap-2 border-b border-border bg-surface/50 text-xs">
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search activities…" className="h-7 w-56 text-xs" />
        <select value={type} onChange={e => setType(e.target.value)} className="h-7 px-2 rounded-sm bg-background border border-border text-xs">
          <option value="all">All Types</option>
          {["Call","Email","Meeting","Demo","Proposal","Follow-up","Note","Status Change","AI Action"].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="p-3 flex-1 space-y-4">
        {grouped.map(([date, items]) => (
          <div key={date}>
            <h4 className="text-2xs uppercase font-semibold text-muted-foreground tracking-wider mb-2 sticky top-0 bg-background py-1">{date}</h4>
            <div className="space-y-1.5">
              {items.map(a => {
                const Icon = iconFor(a.type);
                const by = PEOPLE.find(p => p.id === a.byId);
                const lead = leads.find(l => l.id === a.leadId);
                return (
                  <div key={a.id} className="flex items-start gap-3 bg-surface border border-border rounded-sm p-3">
                    <div className="w-7 h-7 rounded-sm bg-primary/15 text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-medium">{a.subject}</div>
                          {a.description && <div className="text-2xs text-muted-foreground mt-0.5">{a.description}</div>}
                        </div>
                        <span className={`text-2xs font-medium shrink-0 ${outcomeColor(a.outcome)}`}>{a.outcome ?? a.type}</span>
                      </div>
                      <div className="flex items-center gap-3 text-2xs text-muted-foreground mt-1.5">
                        <span>{by?.name}</span>
                        {a.duration && <span>{a.duration} min</span>}
                        {lead && <Link to={`/sales/leads/${lead.id}`} className="text-primary hover:underline truncate max-w-[200px]">{lead.title}</Link>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {grouped.length === 0 && <div className="text-center py-12 text-xs text-muted-foreground">No activities</div>}
      </div>
    </div>
  );
}

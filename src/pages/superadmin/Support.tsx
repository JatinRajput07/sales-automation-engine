import { useState } from "react";
import { SAPageHeader } from "@/components/superadmin/SuperAdminShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSuperAdminStore } from "@/store/superAdminStore";
import { toast } from "sonner";

const priorityColor: Record<string, string> = { P1: "bg-red-100 text-red-700", P2: "bg-orange-100 text-orange-700", P3: "bg-amber-100 text-amber-800", P4: "bg-gray-100 text-gray-600" };
const slaHours: Record<string, number> = { P1: 4, P2: 8, P3: 24, P4: 48 };

export default function Support() {
  const { tickets, tenants, replyTicket, addInternalNote, updateTicket } = useSuperAdminStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [note, setNote] = useState("");
  const t = tickets.find(x => x.id === selected);

  const slaRemaining = (createdAt: string, p: string) => {
    const elapsed = (Date.now() - new Date(createdAt).getTime()) / 3600000;
    const left = slaHours[p] - elapsed;
    if (left < 0) return <span className="text-red-600">⚠ Breached</span>;
    return <span>{left.toFixed(1)}h left</span>;
  };

  return (
    <div className="pb-8">
      <SAPageHeader title="Support Tickets"
        subtitle={`Open: ${tickets.filter(t => t.status === "open").length} • In Progress: ${tickets.filter(t => t.status === "in_progress").length} • Resolved: ${tickets.filter(t => t.status === "resolved").length}`}
      />
      <div className="px-6 pt-4">
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-2xs uppercase text-muted-foreground"><tr>
              <th className="text-left px-3 h-9">#</th><th className="text-left px-3">Tenant</th><th className="text-left px-3">Subject</th>
              <th className="text-left px-3">Priority</th><th className="text-left px-3">Status</th><th className="text-left px-3">SLA</th>
              <th className="text-left px-3">Assigned</th>
            </tr></thead>
            <tbody>
              {tickets.map(t => {
                const tn = tenants.find(x => x.id === t.tenantId);
                return (
                  <tr key={t.id} className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => setSelected(t.id)}>
                    <td className="px-3 py-2 font-mono">{t.number}</td>
                    <td className="px-3 font-medium">{tn?.name}</td>
                    <td className="px-3">{t.subject}</td>
                    <td className="px-3"><span className={`px-1.5 py-0.5 rounded text-2xs font-medium ${priorityColor[t.priority]}`}>{t.priority}</span></td>
                    <td className="px-3 capitalize text-2xs">{t.status.replace("_", " ")}</td>
                    <td className="px-3 text-2xs">{slaRemaining(t.createdAt, t.priority)}</td>
                    <td className="px-3 text-2xs">{t.assignedTo || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {t && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative ml-auto w-full max-w-3xl bg-white border-l border-border h-full overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">#{t.number} — {t.subject}</h3>
                <p className="text-2xs text-muted-foreground mt-0.5">{tenants.find(x => x.id === t.tenantId)?.name} • {t.contact} • {new Date(t.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => { updateTicket(t.id, { status: "in_progress" }); toast.success("Marked in progress"); }}>Start</Button>
                <Button size="sm" variant="outline" onClick={() => { updateTicket(t.id, { status: "resolved" }); toast.success("Resolved"); setSelected(null); }}>Resolve</Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-0">
              <div className="col-span-2 p-5 border-r border-border space-y-3">
                {t.thread.map((m, i) => (
                  <div key={i} className={`p-3 rounded-lg max-w-[85%] ${m.from === "tenant" ? "bg-muted/40" : "bg-indigo-50 ml-auto"}`}>
                    <div className="text-2xs text-muted-foreground mb-1">{m.from} • {new Date(m.at).toLocaleString()}</div>
                    <div className="text-xs">{m.text}</div>
                  </div>
                ))}
                <div className="pt-3 border-t border-border">
                  <Textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Reply..." rows={3} />
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 mt-2" onClick={() => { if (reply) { replyTicket(t.id, reply, "agent"); setReply(""); toast.success("Reply sent"); } }}>Send Reply</Button>
                </div>
              </div>
              <div className="p-4 space-y-3 text-xs">
                <div className="bg-muted/40 rounded p-3">
                  <div className="text-2xs text-muted-foreground mb-1">Tenant</div>
                  <div className="font-medium">{tenants.find(x => x.id === t.tenantId)?.name}</div>
                  <div className="text-2xs mt-1 capitalize">{tenants.find(x => x.id === t.tenantId)?.plan} plan</div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold mb-2">Internal Notes</h4>
                  {t.internalNotes.map((n, i) => (
                    <div key={i} className="text-2xs p-2 bg-amber-50 border border-amber-200 rounded mb-1">
                      <div className="text-muted-foreground">{new Date(n.at).toLocaleString()}</div>
                      <div>{n.text}</div>
                    </div>
                  ))}
                  <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Internal note..." rows={2} className="mt-2" />
                  <Button size="sm" variant="outline" className="w-full mt-1" onClick={() => { if (note) { addInternalNote(t.id, note); setNote(""); toast.success("Note added"); } }}>Add Note</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

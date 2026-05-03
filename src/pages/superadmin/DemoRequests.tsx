import { useState } from "react";
import { Plus } from "lucide-react";
import { SAPageHeader } from "@/components/superadmin/SuperAdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSuperAdminStore, ALL_MODULES, type ModuleId } from "@/store/superAdminStore";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700", contacted: "bg-purple-100 text-purple-700", scheduled: "bg-amber-100 text-amber-800",
  done: "bg-teal-100 text-teal-700", converted: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700", no_response: "bg-gray-100 text-gray-600",
};

export default function DemoRequests() {
  const { demoRequests, updateDemoRequest, addTenant } = useSuperAdminStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState({ at: "", mode: "Video Call", link: "", assigned: "Rahul S", notes: "" });
  const [showSchedule, setShowSchedule] = useState(false);

  const counts = {
    new: demoRequests.filter(d => d.status === "new").length,
    scheduled: demoRequests.filter(d => d.status === "scheduled").length,
    done: demoRequests.filter(d => d.status === "done").length,
    converted: demoRequests.filter(d => d.status === "converted").length,
    rejected: demoRequests.filter(d => d.status === "rejected").length,
  };

  const dr = demoRequests.find(d => d.id === selected);

  const convertToTrial = (id: string) => {
    const d = demoRequests.find(x => x.id === id)!;
    addTenant({
      id: crypto.randomUUID(), name: d.company, slug: d.company.toLowerCase().replace(/\s+/g, "-"), email: d.email, country: "India",
      plan: "trial", modules: d.modules, users: 1, mrr: 0, status: "trial",
      signupAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
      billingCycle: "monthly", adminName: d.contact, adminEmail: d.email,
    });
    updateDemoRequest(id, { status: "converted" });
    toast.success(`✅ Trial created for ${d.company}`);
    setSelected(null);
  };

  return (
    <div className="pb-8">
      <SAPageHeader title="Demo & Trial Requests"
        subtitle={`New: ${counts.new} • Scheduled: ${counts.scheduled} • Done: ${counts.done} • Converted: ${counts.converted} • Rejected: ${counts.rejected}`}
        actions={<Button size="sm" className="bg-indigo-600 hover:bg-indigo-700"><Plus className="w-3.5 h-3.5 mr-1.5" />Manual Entry</Button>}
      />

      <div className="px-6 pt-4">
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-2xs uppercase text-muted-foreground"><tr>
              <th className="text-left px-3 h-9">Company</th><th className="text-left px-3">Contact</th><th className="text-left px-3">Email</th>
              <th className="text-left px-3">Interest</th><th className="text-left px-3">Source</th><th className="text-left px-3">Requested</th>
              <th className="text-left px-3">Status</th><th className="text-right px-3">Actions</th>
            </tr></thead>
            <tbody>
              {demoRequests.map(d => (
                <tr key={d.id} className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => setSelected(d.id)}>
                  <td className="px-3 py-2 font-medium">{d.company}<div className="text-2xs text-muted-foreground font-mono">{d.number}</div></td>
                  <td className="px-3">{d.contact}</td>
                  <td className="px-3">{d.email}</td>
                  <td className="px-3"><div className="flex flex-wrap gap-1">{d.modules.map(m => <span key={m} className="text-2xs px-1.5 rounded bg-indigo-50 text-indigo-700">{ALL_MODULES.find(x => x.id === m)?.name}</span>)}</div></td>
                  <td className="px-3 text-2xs">{d.source}</td>
                  <td className="px-3 text-2xs">{new Date(d.requestedAt).toLocaleDateString()}</td>
                  <td className="px-3"><span className={`px-1.5 py-0.5 rounded text-2xs ${statusColors[d.status]}`}>{d.status.replace("_", " ")}</span></td>
                  <td className="px-3 text-right">
                    <button onClick={e => { e.stopPropagation(); setSelected(d.id); setShowSchedule(true); }} className="text-indigo-600 hover:underline mr-2">Schedule</button>
                    <button onClick={e => { e.stopPropagation(); convertToTrial(d.id); }} className="text-indigo-600 hover:underline">Convert</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {dr && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => { setSelected(null); setShowSchedule(false); }}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full max-w-lg bg-white border-l border-border h-full overflow-auto p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold">{dr.company} <span className="text-xs text-muted-foreground font-mono">— {dr.number}</span></h3>
            <p className="text-2xs text-muted-foreground mt-1">{new Date(dr.requestedAt).toLocaleString()} • {dr.source}</p>
            <div className="mt-4 space-y-2 text-sm">
              <Row label="Contact" v={dr.contact} />
              <Row label="Email" v={dr.email} />
              <Row label="Phone" v={dr.phone || "—"} />
              <Row label="Modules" v={dr.modules.map(m => ALL_MODULES.find(x => x.id === m)?.name).join(", ")} />
              {dr.message && <div><div className="text-xs text-muted-foreground">Message</div><div className="text-xs mt-1 p-2 bg-muted/40 rounded">{dr.message}</div></div>}
            </div>

            {showSchedule && (
              <div className="mt-5 pt-4 border-t border-border space-y-3">
                <h4 className="text-sm font-semibold">Schedule Demo</h4>
                <Input type="datetime-local" value={scheduleForm.at} onChange={e => setScheduleForm(s => ({ ...s, at: e.target.value }))} />
                <select value={scheduleForm.mode} onChange={e => setScheduleForm(s => ({ ...s, mode: e.target.value }))} className="w-full h-9 px-2 text-sm border border-border rounded-md">
                  <option>Video Call</option><option>In-person</option><option>Phone</option>
                </select>
                <Input value={scheduleForm.link} onChange={e => setScheduleForm(s => ({ ...s, link: e.target.value }))} placeholder="Meeting link (Zoom/Meet URL)" />
                <Input value={scheduleForm.assigned} onChange={e => setScheduleForm(s => ({ ...s, assigned: e.target.value }))} placeholder="Assigned to" />
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 w-full" onClick={() => {
                  updateDemoRequest(dr.id, { status: "scheduled", scheduledAt: scheduleForm.at, meetingLink: scheduleForm.link, assignedTo: scheduleForm.assigned });
                  toast.success("Demo scheduled & confirmation sent");
                  setShowSchedule(false); setSelected(null);
                }}>Schedule + Send Confirmation</Button>
              </div>
            )}

            <div className="mt-5 flex gap-2">
              {!showSchedule && <Button size="sm" variant="outline" onClick={() => setShowSchedule(true)}>Schedule Demo</Button>}
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => convertToTrial(dr.id)}>Convert to Trial</Button>
              <Button size="sm" variant="outline" className="text-red-600" onClick={() => { updateDemoRequest(dr.id, { status: "rejected" }); setSelected(null); toast.success("Rejected"); }}>Reject</Button>
            </div>

            {dr.notes.length > 0 && (
              <div className="mt-5 pt-4 border-t border-border">
                <h4 className="text-xs font-semibold mb-2">Internal Notes</h4>
                {dr.notes.map((n, i) => (
                  <div key={i} className="text-2xs p-2 bg-muted/40 rounded mb-1">
                    <div className="text-muted-foreground">{new Date(n.at).toLocaleString()}</div>
                    <div>{n.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
function Row({ label, v }: { label: string; v: React.ReactNode }) {
  return <div className="flex justify-between text-xs py-1"><span className="text-muted-foreground">{label}</span><span className="font-medium">{v}</span></div>;
}

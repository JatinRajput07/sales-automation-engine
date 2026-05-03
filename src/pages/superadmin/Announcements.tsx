import { useState } from "react";
import { Plus, Megaphone } from "lucide-react";
import { SAPageHeader } from "@/components/superadmin/SuperAdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSuperAdminStore, ALL_MODULES, type ModuleId } from "@/store/superAdminStore";
import { toast } from "sonner";

export default function Announcements() {
  const { announcements, addAnnouncement, tenants } = useSuperAdminStore();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    title: "", type: "Feature Update", content: "", audience: "all" as "all"|"plans"|"modules"|"tenants",
    audienceList: [] as string[], channels: ["inapp"] as ("inapp"|"email")[], scheduledAt: "",
  });

  const submit = () => {
    if (!form.title || !form.content) return toast.error("Title and content required");
    addAnnouncement({
      id: crypto.randomUUID(), title: form.title, type: form.type as any, content: form.content,
      audience: form.audience, audienceList: form.audienceList, channels: form.channels,
      scheduledAt: form.scheduledAt || undefined, sentAt: form.scheduledAt ? undefined : new Date().toISOString(),
      status: form.scheduledAt ? "scheduled" : "sent",
    });
    toast.success(form.scheduledAt ? "Scheduled" : "Sent to tenants");
    setShowNew(false);
    setForm({ title: "", type: "Feature Update", content: "", audience: "all", audienceList: [], channels: ["inapp"], scheduledAt: "" });
  };

  return (
    <div className="pb-8">
      <SAPageHeader title="Announcements" subtitle={`${announcements.length} total`}
        actions={<Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowNew(true)}><Plus className="w-3.5 h-3.5 mr-1.5" />New Announcement</Button>}
      />
      <div className="px-6 pt-4">
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-2xs uppercase text-muted-foreground"><tr>
              <th className="text-left px-3 h-9">Title</th><th className="text-left px-3">Type</th><th className="text-left px-3">Audience</th>
              <th className="text-left px-3">Channels</th><th className="text-left px-3">Status</th><th className="text-left px-3">Date</th>
            </tr></thead>
            <tbody>
              {announcements.map(a => (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">{a.title}</td>
                  <td className="px-3"><span className="text-2xs px-1.5 rounded bg-indigo-50 text-indigo-700">{a.type}</span></td>
                  <td className="px-3 text-2xs capitalize">{a.audience}</td>
                  <td className="px-3 text-2xs">{a.channels.join(", ")}</td>
                  <td className="px-3"><span className={`text-2xs px-1.5 rounded ${a.status === "sent" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"}`}>{a.status}</span></td>
                  <td className="px-3 text-2xs">{new Date(a.sentAt || a.scheduledAt!).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowNew(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-semibold flex items-center gap-2"><Megaphone className="w-4 h-4" />New Announcement</h3>
            </div>
            <div className="p-5 space-y-3">
              <div><label className="text-xs">Title *</label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div><label className="text-xs">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="h-9 w-full px-2 text-sm border border-border rounded-md">
                  {["Feature Update","Maintenance","Billing","Important","New Module"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="text-xs">Content *</label><Textarea rows={5} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></div>
              <div><label className="text-xs">Target Audience</label>
                <div className="flex gap-3 text-xs mt-1">
                  {["all","plans","modules","tenants"].map(a => (
                    <label key={a} className="flex items-center gap-1"><input type="radio" checked={form.audience === a} onChange={() => setForm(f => ({ ...f, audience: a as any }))} />{a}</label>
                  ))}
                </div>
              </div>
              <div><label className="text-xs">Channels</label>
                <div className="flex gap-3 text-xs mt-1">
                  <label className="flex items-center gap-1"><input type="checkbox" checked={form.channels.includes("inapp")} onChange={e => setForm(f => ({ ...f, channels: e.target.checked ? [...f.channels, "inapp"] : f.channels.filter(c => c !== "inapp") }))} />In-App</label>
                  <label className="flex items-center gap-1"><input type="checkbox" checked={form.channels.includes("email")} onChange={e => setForm(f => ({ ...f, channels: e.target.checked ? [...f.channels, "email"] : f.channels.filter(c => c !== "email") }))} />Email</label>
                </div>
              </div>
              <div><label className="text-xs">Schedule (leave empty = send now)</label><Input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} /></div>
            </div>
            <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={submit}>{form.scheduledAt ? "Schedule" : "Send Now"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, AlertOctagon, Eye } from "lucide-react";
import { SAPageHeader } from "@/components/superadmin/SuperAdminShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSuperAdminStore, formatINR, ALL_MODULES, type ModuleId } from "@/store/superAdminStore";
import { toast } from "sonner";

export default function TenantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenants, invoices, tickets, activity, suspendTenant, toggleTenantModule, setImpersonating } = useSuperAdminStore();
  const t = tenants.find(x => x.id === id);
  const [enabling, setEnabling] = useState<ModuleId | null>(null);
  const [disabling, setDisabling] = useState<ModuleId | null>(null);
  const [reason, setReason] = useState("");

  if (!t) return <div className="p-8">Tenant not found. <Link to="/super-admin/tenants" className="text-indigo-600">Back</Link></div>;

  const tInvoices = invoices.filter(i => i.tenantId === t.id);
  const tTickets = tickets.filter(i => i.tenantId === t.id);
  const tActivity = activity.filter(a => a.tenantId === t.id);
  const arr = t.mrr * 12;
  const lastPaid = tInvoices.find(i => i.status === "paid");
  const nextDue = tInvoices.find(i => i.status === "pending");

  const impersonate = () => { setImpersonating(t.id); toast.success(`Impersonating ${t.name}`); window.open("/?impersonate=" + t.id, "_blank"); };

  return (
    <div className="pb-8">
      <SAPageHeader
        title={t.name}
        subtitle={`${t.slug} • ${t.plan} plan • ${t.status} • MRR: ${formatINR(t.mrr)} • Users: ${t.users} • Expires: ${new Date(t.expiresAt).toLocaleDateString()}`}
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Back</Button>
            <Button variant="outline" size="sm"><Edit className="w-3.5 h-3.5 mr-1.5" />Edit</Button>
            <Button variant="outline" size="sm" onClick={impersonate}><Eye className="w-3.5 h-3.5 mr-1.5" />Impersonate</Button>
            <Button variant="outline" size="sm" className="text-red-600" onClick={() => { suspendTenant(t.id); toast.success("Suspended"); }}>
              <AlertOctagon className="w-3.5 h-3.5 mr-1.5" />Suspend
            </Button>
          </>
        }
      />
      <div className="px-6 pt-4">
        <Tabs defaultValue="overview">
          <TabsList className="bg-transparent p-0 h-auto border-b border-border w-full justify-start rounded-none">
            {["overview","users","modules","billing","activity","support"].map(tab => (
              <TabsTrigger key={tab} value={tab} className="capitalize data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card title="Organization Details">
                <Row label="Industry" v={t.industry || "—"} />
                <Row label="Country" v={t.country} />
                <Row label="Website" v={t.website || "—"} />
                <Row label="Email" v={t.email} />
                <Row label="Phone" v={t.phone || "—"} />
                <Row label="Admin" v={`${t.adminName || "—"} (${t.adminEmail || "—"})`} />
                <Row label="Signup" v={new Date(t.signupAt).toLocaleDateString()} />
              </Card>

              <Card title="Account Health">
                <div className="text-center py-4">
                  <div className="text-3xl font-semibold text-green-600">82</div>
                  <div className="text-2xs text-muted-foreground mt-1">Healthy</div>
                </div>
                <Row label="Login frequency" v="✅ Good" />
                <Row label="Feature adoption" v="✅ Good" />
                <Row label="Payment status" v={t.status === "payment_failed" ? "🔴 Failed" : "✅ Current"} />
                <Row label="Open tickets" v={`${tTickets.filter(x => x.status !== "closed" && x.status !== "resolved").length} open`} />
              </Card>

              <Card title="Revenue Summary">
                <Row label="Plan" v={`${t.plan} (${formatINR(t.mrr)}/mo)`} />
                <Row label="Total MRR" v={formatINR(t.mrr)} />
                <Row label="ARR" v={formatINR(arr)} />
                <Row label="Last payment" v={lastPaid ? `${new Date(lastPaid.paidDate!).toLocaleDateString()} ✅` : "—"} />
                <Row label="Next payment" v={nextDue ? new Date(nextDue.dueDate).toLocaleDateString() : "—"} />
              </Card>

              <Card title="Usage This Month">
                <Row label="Active users" v={`${t.users} active`} />
                <Row label="Modules" v={`${t.modules.length} / ${ALL_MODULES.length}`} />
                <Row label="API calls" v="12,840" />
                <Row label="Storage" v="2.4 GB" />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <Card title={`Users (${t.users})`}>
              <p className="text-xs text-muted-foreground py-4">User list mock — integrate with tenant DB.</p>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="mt-4">
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/40">
                  <tr className="text-2xs uppercase text-muted-foreground">
                    <th className="text-left px-4 h-9 font-medium">Module</th>
                    <th className="text-left px-4 font-medium">Status</th>
                    <th className="text-left px-4 font-medium">Schema</th>
                    <th className="text-right px-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_MODULES.map(m => {
                    const on = t.modules.includes(m.id);
                    return (
                      <tr key={m.id} className="border-t border-border">
                        <td className="px-4 py-2.5 font-medium">{m.name}</td>
                        <td className="px-4">{on ? <span className="text-green-600">✅ Active</span> : <span className="text-muted-foreground">❌ Off</span>}</td>
                        <td className="px-4 font-mono text-2xs text-muted-foreground">{on ? `${t.slug.slice(0,2)}_${m.id}` : "—"}</td>
                        <td className="px-4 text-right">
                          {on
                            ? <button className="text-red-600 hover:underline" onClick={() => setDisabling(m.id)}>Disable</button>
                            : <button className="text-indigo-600 hover:underline" onClick={() => setEnabling(m.id)}>Enable</button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="mt-4">
            <Card title="Payment History">
              <table className="w-full text-xs">
                <thead className="text-2xs uppercase text-muted-foreground">
                  <tr><th className="text-left py-2">Invoice</th><th className="text-left">Period</th><th className="text-right">Amount</th><th className="text-left">Status</th><th className="text-left">Date</th></tr>
                </thead>
                <tbody>
                  {tInvoices.map(i => (
                    <tr key={i.id} className="border-t border-border">
                      <td className="py-2 font-mono">{i.number}</td>
                      <td>{i.period}</td>
                      <td className="text-right font-mono">{formatINR(i.total)}</td>
                      <td><StatusChip s={i.status} /></td>
                      <td>{new Date(i.dueDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {tInvoices.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-muted-foreground">No invoices</td></tr>}
                </tbody>
              </table>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline">Generate Invoice</Button>
                <Button size="sm" variant="outline">Add Credit</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card title="Activity Log">
              <div className="space-y-2 text-xs">
                {tActivity.length === 0 && <p className="text-muted-foreground py-3">No activity yet</p>}
                {tActivity.map(a => (
                  <div key={a.id} className="flex items-start gap-2 py-2 border-b border-border last:border-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
                    <div className="flex-1"><div>{a.text}</div><div className="text-2xs text-muted-foreground">{new Date(a.at).toLocaleString()}</div></div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="mt-4">
            <Card title={`Support Tickets (${tTickets.length})`}>
              {tTickets.length === 0 ? <p className="text-xs text-muted-foreground py-4">No tickets</p> : (
                <table className="w-full text-xs">
                  <thead className="text-2xs uppercase text-muted-foreground">
                    <tr><th className="text-left py-2">#</th><th className="text-left">Subject</th><th className="text-left">Priority</th><th className="text-left">Status</th><th className="text-left">Created</th></tr>
                  </thead>
                  <tbody>
                    {tTickets.map(tk => (
                      <tr key={tk.id} className="border-t border-border">
                        <td className="py-2 font-mono">{tk.number}</td>
                        <td>{tk.subject}</td>
                        <td>{tk.priority}</td>
                        <td className="capitalize">{tk.status}</td>
                        <td>{new Date(tk.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {enabling && (
        <Modal onClose={() => setEnabling(null)} title="Enable module">
          <p className="text-sm">Enable <b>{ALL_MODULES.find(m => m.id === enabling)?.name}</b> for {t.name}?</p>
          <p className="text-2xs text-muted-foreground mt-2">+₹{ALL_MODULES.find(m => m.id === enabling)?.defaultPrice}/month added. Schema will be created: {t.slug.slice(0,2)}_{enabling}</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button size="sm" variant="outline" onClick={() => setEnabling(null)}>Cancel</Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => { toggleTenantModule(t.id, enabling); setEnabling(null); toast.success("Module enabled"); }}>Confirm Enable</Button>
          </div>
        </Modal>
      )}
      {disabling && (
        <Modal onClose={() => setDisabling(null)} title="Disable module">
          <p className="text-sm text-amber-700">⚠ This will disconnect the schema. Data preserved but inaccessible.</p>
          <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason (required)" className="mt-3 w-full text-xs border border-border rounded-md p-2" rows={3} />
          <div className="flex justify-end gap-2 mt-4">
            <Button size="sm" variant="outline" onClick={() => setDisabling(null)}>Cancel</Button>
            <Button size="sm" variant="destructive" disabled={!reason} onClick={() => { toggleTenantModule(t.id, disabling); setDisabling(null); setReason(""); toast.success("Module disabled"); }}>Confirm Disable</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-white border border-border rounded-lg p-4"><h3 className="text-sm font-semibold mb-3">{title}</h3>{children}</div>;
}
function Row({ label, v }: { label: string; v: React.ReactNode }) {
  return <div className="flex justify-between py-1.5 text-xs border-b border-border last:border-0"><span className="text-muted-foreground">{label}</span><span className="font-medium">{v}</span></div>;
}
function StatusChip({ s }: { s: string }) {
  const map: Record<string, string> = { paid: "bg-green-100 text-green-700", pending: "bg-amber-100 text-amber-800", failed: "bg-red-100 text-red-700", overdue: "bg-red-100 text-red-700", refunded: "bg-gray-100 text-gray-600" };
  return <span className={`px-1.5 py-0.5 rounded text-2xs ${map[s] || "bg-muted"}`}>{s}</span>;
}
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
        <h3 className="text-sm font-semibold mb-3">{title}</h3>
        {children}
      </div>
    </div>
  );
}

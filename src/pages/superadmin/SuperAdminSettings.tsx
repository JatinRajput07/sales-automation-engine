import { useState } from "react";
import { SAPageHeader } from "@/components/superadmin/SuperAdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function SuperAdminSettings() {
  const [team] = useState([
    { name: "Rahul S", email: "rahul@product.com", role: "Super Admin", lastLogin: "Just now", twoFA: true, status: "Active" },
    { name: "Priya N", email: "priya@product.com", role: "Admin", lastLogin: "2h ago", twoFA: true, status: "Active" },
    { name: "Anil K", email: "anil@product.com", role: "Billing", lastLogin: "Yesterday", twoFA: false, status: "Active" },
  ]);

  return (
    <div className="pb-8">
      <SAPageHeader title="Super Admin Settings" subtitle="Configure platform, team, security and integrations" />
      <div className="px-6 pt-4">
        <Tabs defaultValue="general">
          <TabsList className="bg-transparent p-0 h-auto border-b border-border w-full justify-start rounded-none">
            {["general","plans","integrations","team","security","notifications"].map(t => (
              <TabsTrigger key={t} value={t} className="capitalize data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none">{t}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="general" className="mt-4">
            <Card title="General">
              <Field label="Product Name"><Input defaultValue="Lovable CRM" /></Field>
              <Field label="Support Email"><Input defaultValue="support@yourdomain.com" /></Field>
              <Field label="Default Trial Duration (days)"><Input type="number" defaultValue={14} /></Field>
              <Field label="Default Plan on Signup">
                <select className="h-9 w-full px-2 text-sm border border-border rounded-md"><option>Trial</option><option>Starter</option></select>
              </Field>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" /> Enable maintenance mode (entire product)</label>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 mt-2" onClick={() => toast.success("Saved")}>Save</Button>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="mt-4">
            <Card title="Plans & Pricing"><p className="text-xs text-muted-foreground">Manage from /super-admin/plans</p></Card>
          </TabsContent>

          <TabsContent value="integrations" className="mt-4">
            <Card title="Integrations">
              {[
                { name: "Razorpay", desc: "Payment gateway", on: true },
                { name: "SendGrid", desc: "Email provider", on: true },
                { name: "PostHog", desc: "Analytics", on: false },
                { name: "Slack", desc: "Internal alerts", on: true },
                { name: "Intercom", desc: "Support widget", on: false },
              ].map(i => (
                <div key={i.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div><div className="text-sm font-medium">{i.name}</div><div className="text-2xs text-muted-foreground">{i.desc}</div></div>
                  <Button size="sm" variant={i.on ? "outline" : "default"} className={!i.on ? "bg-indigo-600 hover:bg-indigo-700" : ""}>{i.on ? "Disconnect" : "Connect"}</Button>
                </div>
              ))}
            </Card>
          </TabsContent>

          <TabsContent value="team" className="mt-4">
            <Card title="Team" actions={<Button size="sm" className="bg-indigo-600 hover:bg-indigo-700"><Plus className="w-3.5 h-3.5 mr-1.5" />Invite</Button>}>
              <table className="w-full text-xs">
                <thead className="text-2xs uppercase text-muted-foreground"><tr><th className="text-left py-2">Name</th><th className="text-left">Email</th><th className="text-left">Role</th><th className="text-left">Last Login</th><th className="text-left">2FA</th><th className="text-left">Status</th></tr></thead>
                <tbody>
                  {team.map(m => (
                    <tr key={m.email} className="border-t border-border">
                      <td className="py-2">{m.name}</td><td>{m.email}</td><td>{m.role}</td><td>{m.lastLogin}</td>
                      <td>{m.twoFA ? "✅" : "—"}</td><td><span className="text-2xs px-1.5 rounded bg-green-100 text-green-700">{m.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-4">
            <Card title="Security">
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" defaultChecked /> Require 2FA for all admins</label>
              <Field label="Session timeout (minutes)"><Input type="number" defaultValue={30} /></Field>
              <Field label="IP whitelist (comma separated)"><Input placeholder="0.0.0.0/0" /></Field>
              <Field label="Login attempt limit"><Input type="number" defaultValue={5} /></Field>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-4">
            <Card title="Notifications">
              <p className="text-xs text-muted-foreground">Configure where alerts and notifications are sent.</p>
              <Field label="Slack channel"><Input placeholder="#product-alerts" /></Field>
              <Field label="Alert email"><Input defaultValue="alerts@product.com" /></Field>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
function Card({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return <div className="bg-white border border-border rounded-lg p-4">
    <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold">{title}</h3>{actions}</div>
    <div className="space-y-3">{children}</div>
  </div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs font-medium">{label}</label><div className="mt-1">{children}</div></div>;
}

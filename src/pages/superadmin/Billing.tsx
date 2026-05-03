import { useState } from "react";
import { SAPageHeader } from "@/components/superadmin/SuperAdminShell";
import { Button } from "@/components/ui/button";
import { useSuperAdminStore, formatINR, computeMRR } from "@/store/superAdminStore";
import { Receipt, Send } from "lucide-react";
import { toast } from "sonner";

export default function Billing() {
  const { invoices, tenants, markInvoicePaid } = useSuperAdminStore();
  const [filter, setFilter] = useState("");
  const mrr = computeMRR(tenants);
  const arr = mrr * 12;
  const collected = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const outstanding = invoices.filter(i => ["pending","overdue","failed"].includes(i.status)).reduce((s, i) => s + i.total, 0);
  const refunded = invoices.filter(i => i.status === "refunded").reduce((s, i) => s + i.total, 0);

  const months = ["May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr"];
  const stack = months.map((m, i) => ({ month: m, newM: 30000 + i * 5000, expansion: 5000 + i * 1000, contraction: -2000, churn: -3000 }));

  const planRevenue = ["enterprise","pro","growth","starter","custom"].map(code => ({
    code, total: tenants.filter(t => t.plan === code).reduce((s,t) => s + t.mrr, 0),
  })).filter(p => p.total > 0);
  const maxRev = Math.max(...planRevenue.map(p => p.total));
  const planColors: Record<string,string> = { enterprise:"#6366F1", pro:"#8B5CF6", growth:"#14B8A6", starter:"#3B82F6", custom:"#F59E0B" };

  const filtered = invoices.filter(i => !filter || i.status === filter);

  return (
    <div className="pb-8">
      <SAPageHeader title="Billing & Revenue" subtitle="Invoices, MRR, ARR and revenue breakdown"
        actions={<Button size="sm" className="bg-indigo-600 hover:bg-indigo-700"><Receipt className="w-3.5 h-3.5 mr-1.5" />Generate Invoice</Button>}
      />

      <div className="px-6 pt-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KPI label="MRR" value={formatINR(mrr)} sub="↑ 8.2%" />
          <KPI label="ARR" value={formatINR(arr)} sub="↑ 8.2%" />
          <KPI label="Collected (MTD)" value={formatINR(collected)} />
          <KPI label="Outstanding" value={formatINR(outstanding)} sub={`${invoices.filter(i => i.status !== "paid" && i.status !== "refunded").length} invoices`} />
          <KPI label="Refunded" value={formatINR(refunded)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">MRR Breakdown</h3>
            <svg viewBox="0 0 480 180" className="w-full h-44">
              {stack.map((s, i) => {
                const x = i * 38 + 10;
                const baseY = 140;
                const newH = s.newM / 1000;
                const expH = s.expansion / 1000;
                return (
                  <g key={i}>
                    <rect x={x} y={baseY - newH} width="24" height={newH} fill="#22C55E" />
                    <rect x={x} y={baseY - newH - expH} width="24" height={expH} fill="#14B8A6" />
                    <rect x={x} y={baseY} width="24" height={Math.abs(s.contraction)/1000} fill="#F59E0B" />
                    <rect x={x} y={baseY + Math.abs(s.contraction)/1000} width="24" height={Math.abs(s.churn)/1000} fill="#EF4444" />
                    <text x={x+12} y="170" textAnchor="middle" fontSize="8" fill="#64748B">{s.month}</text>
                  </g>
                );
              })}
            </svg>
            <div className="flex gap-3 text-2xs mt-2">
              <Legend color="#22C55E" label="New" /><Legend color="#14B8A6" label="Expansion" /><Legend color="#F59E0B" label="Contraction" /><Legend color="#EF4444" label="Churned" />
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">Revenue by Plan</h3>
            <div className="space-y-3">
              {planRevenue.map(p => (
                <div key={p.code}>
                  <div className="flex justify-between text-xs mb-1"><span className="capitalize">{p.code}</span><span className="font-mono">{formatINR(p.total)}</span></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full" style={{ width: `${(p.total/maxRev)*100}%`, background: planColors[p.code] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-border flex items-center gap-2">
            <h3 className="text-sm font-semibold mr-auto">All Invoices</h3>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="h-7 px-2 text-xs border border-border rounded-md bg-white">
              <option value="">All statuses</option>{["paid","pending","overdue","failed","refunded"].map(s => <option key={s}>{s}</option>)}
            </select>
            <Button size="sm" variant="outline"><Send className="w-3 h-3 mr-1" />Send Reminders</Button>
          </div>
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-2xs uppercase text-muted-foreground"><tr>
              <th className="text-left px-3 h-8">Invoice</th><th className="text-left px-3">Tenant</th><th className="text-left px-3">Period</th>
              <th className="text-right px-3">Amount</th><th className="text-right px-3">Tax</th><th className="text-right px-3">Total</th>
              <th className="text-left px-3">Status</th><th className="text-left px-3">Due</th><th className="text-right px-3">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(i => {
                const t = tenants.find(x => x.id === i.tenantId);
                return (
                  <tr key={i.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono">{i.number}</td>
                    <td className="px-3">{t?.name}</td>
                    <td className="px-3">{i.period}</td>
                    <td className="px-3 text-right font-mono">{formatINR(i.amount)}</td>
                    <td className="px-3 text-right font-mono">{formatINR(i.tax)}</td>
                    <td className="px-3 text-right font-mono font-semibold">{formatINR(i.total)}</td>
                    <td className="px-3"><Chip s={i.status} /></td>
                    <td className="px-3">{new Date(i.dueDate).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-right">
                      {i.status !== "paid" && <button onClick={() => { markInvoicePaid(i.id); toast.success("Marked paid"); }} className="text-indigo-600 hover:underline mr-2">Mark Paid</button>}
                      <button className="text-indigo-600 hover:underline">PDF</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, sub }: any) {
  return <div className="bg-white border border-border rounded-lg p-4">
    <div className="text-2xs uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="text-xl font-semibold mt-1">{value}</div>
    {sub && <div className="text-2xs text-muted-foreground mt-0.5">{sub}</div>}
  </div>;
}
function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: color }} />{label}</span>;
}
function Chip({ s }: { s: string }) {
  const map: Record<string,string> = { paid:"bg-green-100 text-green-700", pending:"bg-amber-100 text-amber-800", overdue:"bg-red-100 text-red-700", failed:"bg-red-100 text-red-700", refunded:"bg-gray-100 text-gray-600" };
  return <span className={`px-1.5 py-0.5 rounded text-2xs ${map[s]}`}>{s}</span>;
}

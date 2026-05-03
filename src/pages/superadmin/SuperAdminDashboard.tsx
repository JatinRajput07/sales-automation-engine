import { Link } from "react-router-dom";
import { AlertTriangle, AlertCircle, Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { SAPageHeader } from "@/components/superadmin/SuperAdminShell";
import { useSuperAdminStore, formatINR, computeMRR, computeARR } from "@/store/superAdminStore";
import { ALL_MODULES } from "@/store/superAdminStore";

function KPI({ label, value, sub, delta, accent = "indigo" }: { label: string; value: string; sub?: string; delta?: number; accent?: string }) {
  const dir = delta === undefined ? 0 : delta > 0 ? 1 : delta < 0 ? -1 : 0;
  return (
    <div className="bg-white border border-border rounded-lg p-4">
      <div className="flex items-start justify-between">
        <span className="text-2xs uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
        {delta !== undefined && (
          <span className={`flex items-center gap-0.5 text-2xs font-medium ${dir > 0 ? "text-green-600" : dir < 0 ? "text-red-600" : "text-muted-foreground"}`}>
            {dir > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="text-2xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

export default function SuperAdminDashboard() {
  const { tenants, demoRequests, customDeals, invoices, activity } = useSuperAdminStore();
  const active = tenants.filter(t => t.status === "active");
  const trial = tenants.filter(t => t.status === "trial");
  const failedPayments = invoices.filter(i => i.status === "failed");
  const mrr = computeMRR(tenants);
  const arr = computeARR(tenants);
  const outstanding = invoices.filter(i => i.status === "pending" || i.status === "overdue" || i.status === "failed").reduce((s, i) => s + i.total, 0);

  // mock 12-month MRR
  const months = ["May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr"];
  const mrrSeries = [220000, 245000, 268000, 290000, 315000, 340000, 365000, 395000, 420000, 442000, 465000, mrr];

  // Plan distribution
  const planCounts = ["trial","starter","growth","pro","enterprise","custom"].map(code => ({
    code, count: tenants.filter(t => t.plan === code).length,
  }));
  const planColors: Record<string,string> = { trial:"#94A3B8", starter:"#3B82F6", growth:"#14B8A6", pro:"#8B5CF6", enterprise:"#6366F1", custom:"#F59E0B" };

  // Module adoption
  const modAdoption = ALL_MODULES.map(m => ({
    ...m,
    count: tenants.filter(t => t.modules.includes(m.id)).length,
    pct: Math.round(tenants.filter(t => t.modules.includes(m.id)).length / tenants.length * 100),
  })).sort((a,b) => b.count - a.count);

  // Top tenants
  const top = [...active].sort((a,b) => b.mrr - a.mrr).slice(0,5);

  // Expiring within 30 days
  const expiring = tenants.filter(t => {
    const d = (new Date(t.expiresAt).getTime() - Date.now()) / 86400000;
    return d >= 0 && d <= 30;
  });

  const maxMrr = Math.max(...mrrSeries);
  const minMrr = Math.min(...mrrSeries);

  return (
    <div className="pb-8">
      <SAPageHeader title="Command Center" subtitle="Realtime view of tenants, revenue and product health" />

      <div className="px-6 pt-4 space-y-4">
        {/* Alert banners */}
        {failedPayments.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span><b>{failedPayments.length}</b> tenants with failed payments — action required</span>
            </div>
            <Link to="/super-admin/billing" className="text-xs font-medium text-red-700 hover:underline">Review →</Link>
          </div>
        )}
        {expiring.some(t => (new Date(t.expiresAt).getTime() - Date.now()) / 86400000 <= 7) && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4" />
              <span>Plans expiring within 7 days — no renewal yet</span>
            </div>
            <Link to="/super-admin/tenants" className="text-xs font-medium text-amber-700 hover:underline">Contact →</Link>
          </div>
        )}

        {/* KPI Row 1 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPI label="Total Tenants" value={String(tenants.length)} sub="↑ 3 this month" delta={6.5} />
          <KPI label="Active Tenants" value={String(active.length)} sub={`${((active.length/tenants.length)*100).toFixed(1)}% active`} />
          <KPI label="MRR" value={formatINR(mrr)} sub="Monthly recurring" delta={8.2} />
          <KPI label="ARR" value={formatINR(arr)} sub="Annual run rate" delta={8.2} />
          <KPI label="Pending Payments" value={formatINR(outstanding)} sub={`${failedPayments.length} failed`} />
          <KPI label="Demo Requests" value={String(demoRequests.filter(d => d.status === "new").length)} sub="↑ 2 new today" />
        </div>

        {/* KPI Row 2 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KPI label="Free Trials" value={String(trial.length)} />
          <KPI label="Plans Expiring (30d)" value={String(expiring.length)} />
          <KPI label="Custom Deals" value={String(customDeals.filter(d => d.status === "active").length)} />
          <KPI label="Avg Revenue / Tenant" value={formatINR(Math.round(mrr / Math.max(1,active.length)))} />
          <KPI label="Churn (MTD)" value="1" sub="tenant" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
          {/* MRR Trend */}
          <div className="lg:col-span-4 bg-white border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">MRR Trend</h3>
              <span className="text-2xs text-muted-foreground">Last 12 months</span>
            </div>
            <svg viewBox="0 0 400 150" className="w-full h-40">
              <polyline
                fill="none"
                stroke="hsl(var(--sa-accent))"
                strokeWidth="2"
                points={mrrSeries.map((v, i) => {
                  const x = (i / 11) * 380 + 10;
                  const y = 140 - ((v - minMrr) / (maxMrr - minMrr || 1)) * 120;
                  return `${x},${y}`;
                }).join(" ")}
              />
              {mrrSeries.map((v, i) => {
                const x = (i / 11) * 380 + 10;
                const y = 140 - ((v - minMrr) / (maxMrr - minMrr || 1)) * 120;
                return <circle key={i} cx={x} cy={y} r="2.5" fill="hsl(var(--sa-accent))" />;
              })}
            </svg>
            <div className="flex justify-between text-2xs text-muted-foreground mt-1">
              {months.map(m => <span key={m}>{m}</span>)}
            </div>
          </div>

          {/* Plan donut */}
          <div className="lg:col-span-3 bg-white border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">Tenants by Plan</h3>
            <div className="flex items-center gap-4">
              <Donut data={planCounts.filter(p => p.count > 0).map(p => ({ value: p.count, color: planColors[p.code] }))} centerText={`${tenants.length}`} centerSub="tenants" />
              <div className="space-y-1.5 text-xs flex-1">
                {planCounts.filter(p => p.count > 0).map(p => (
                  <div key={p.code} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: planColors[p.code] }} />
                      <span className="capitalize">{p.code}</span>
                    </div>
                    <span className="font-mono text-muted-foreground">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Module adoption */}
          <div className="lg:col-span-3 bg-white border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">Module Adoption</h3>
            <div className="space-y-2">
              {modAdoption.map(m => (
                <div key={m.id}>
                  <div className="flex items-center justify-between text-2xs mb-1">
                    <span>{m.name}</span>
                    <span className="text-muted-foreground">{m.count} ({m.pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Action Required */}
          <div className="bg-white border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">Action Required</h3>
            <div className="space-y-3 text-xs">
              {failedPayments.slice(0,2).map(i => {
                const t = tenants.find(x => x.id === i.tenantId);
                return (
                  <div key={i.id} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">{t?.name} — Payment failed ({formatINR(i.total)})</div>
                      <div className="flex gap-2 mt-1">
                        <button className="text-2xs text-indigo-600 hover:underline">Contact</button>
                        <button className="text-2xs text-indigo-600 hover:underline">Retry</button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {expiring.slice(0,3).map(t => (
                <div key={t.id} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">{t.name} — Plan expires {new Date(t.expiresAt).toLocaleDateString()}</div>
                    <Link to={`/super-admin/tenants/${t.id}`} className="text-2xs text-indigo-600 hover:underline">Send reminder</Link>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">{demoRequests.filter(d => d.status === "new").length} new demo requests</div>
                  <Link to="/super-admin/demo-requests" className="text-2xs text-indigo-600 hover:underline">View all →</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-2.5 text-xs">
              {activity.slice(0,6).map(a => (
                <div key={a.id} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div>{a.text}</div>
                    <div className="text-2xs text-muted-foreground mt-0.5">{new Date(a.at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top tenants */}
          <div className="bg-white border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">Top Tenants by Revenue</h3>
            <div className="space-y-2 text-xs">
              {top.map((t, i) => (
                <Link to={`/super-admin/tenants/${t.id}`} key={t.id} className="flex items-center justify-between p-2 -mx-2 rounded-md hover:bg-muted">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded text-2xs bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center">{i+1}</span>
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-2xs text-muted-foreground capitalize">{t.plan}</div>
                    </div>
                  </div>
                  <div className="font-mono text-xs">{formatINR(t.mrr)}</div>
                </Link>
              ))}
            </div>
            <Link to="/super-admin/tenants" className="block text-2xs text-indigo-600 hover:underline mt-3">View All Tenants →</Link>
          </div>
        </div>

        {/* Expiring plans table */}
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold">Plans Expiring in Next 30 Days</h3>
            <button className="text-xs text-indigo-600 hover:underline">Send All Reminders</button>
          </div>
          <table className="w-full text-xs">
            <thead className="bg-muted/40">
              <tr className="text-2xs uppercase text-muted-foreground">
                <th className="text-left px-4 h-8 font-medium">Tenant</th>
                <th className="text-left px-4 h-8 font-medium">Plan</th>
                <th className="text-left px-4 h-8 font-medium">Expires</th>
                <th className="text-right px-4 h-8 font-medium">MRR</th>
                <th className="text-left px-4 h-8 font-medium">Status</th>
                <th className="text-right px-4 h-8 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {expiring.map(t => (
                <tr key={t.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{t.name}</td>
                  <td className="px-4 py-2.5 capitalize">{t.plan}</td>
                  <td className="px-4 py-2.5">{new Date(t.expiresAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatINR(t.mrr)}</td>
                  <td className="px-4 py-2.5"><span className="text-2xs text-muted-foreground">Reminder not sent</span></td>
                  <td className="px-4 py-2.5 text-right">
                    <Link to={`/super-admin/tenants/${t.id}`} className="text-indigo-600 hover:underline mr-2">Contact</Link>
                    <button className="text-indigo-600 hover:underline">Extend</button>
                  </td>
                </tr>
              ))}
              {expiring.length === 0 && <tr><td colSpan={6} className="text-center py-6 text-muted-foreground">No plans expiring</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Donut({ data, centerText, centerSub }: { data: { value: number; color: string }[]; centerText: string; centerSub: string }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = 38, cx = 50, cy = 50, stroke = 16;
  const circ = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <svg viewBox="0 0 100 100" className="w-28 h-28">
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
      {data.map((d, i) => {
        const len = (d.value / total) * circ;
        const dasharray = `${len} ${circ - len}`;
        const dashoffset = -offset;
        offset += len;
        return <circle key={i} cx={cx} cy={cy} r={radius} fill="none" stroke={d.color} strokeWidth={stroke} strokeDasharray={dasharray} strokeDashoffset={dashoffset} transform={`rotate(-90 ${cx} ${cy})`} />;
      })}
      <text x={cx} y={cy - 1} textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 600 }}>{centerText}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 6 }}>{centerSub}</text>
    </svg>
  );
}

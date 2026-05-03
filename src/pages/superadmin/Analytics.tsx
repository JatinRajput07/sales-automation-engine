import { SAPageHeader } from "@/components/superadmin/SuperAdminShell";
import { useSuperAdminStore, ALL_MODULES } from "@/store/superAdminStore";

export default function Analytics() {
  const { tenants } = useSuperAdminStore();

  // Mock month data
  const months = ["May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr"];
  const newT = [3,4,3,5,4,6,5,4,5,6,4,3];
  const churn = [1,0,1,1,0,1,2,0,1,1,0,1];

  const features = [
    { name: "Lead Management", uses: 3420 },
    { name: "Invoice Generation", uses: 2810 },
    { name: "Employee Profile", uses: 2645 },
    { name: "Task Tracking", uses: 2401 },
    { name: "Proposal Builder", uses: 1980 },
    { name: "Budget Tracking", uses: 1742 },
    { name: "Cover Letters", uses: 1320 },
    { name: "Custom Reports", uses: 1180 },
    { name: "Activity Logs", uses: 980 },
    { name: "Bulk Import", uses: 765 },
  ];
  const maxUse = Math.max(...features.map(f => f.uses));

  return (
    <div className="pb-8">
      <SAPageHeader title="Product Analytics" subtitle="Usage, growth, churn and adoption insights" />
      <div className="px-6 pt-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { l: "MAU", v: "1,242" }, { l: "DAU", v: "318" }, { l: "Adoption %", v: "76%" }, { l: "Avg Session", v: "14m" },
            { l: "Top Module", v: "Sales" }, { l: "Top Feature", v: "Leads" }, { l: "Ticket Rate", v: "2.3%" }, { l: "NPS", v: "42" },
          ].map(k => (
            <div key={k.l} className="bg-white border border-border rounded-lg p-3">
              <div className="text-2xs uppercase tracking-wider text-muted-foreground">{k.l}</div>
              <div className="text-lg font-semibold mt-1">{k.v}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">Tenant Growth</h3>
            <svg viewBox="0 0 480 160" className="w-full h-40">
              {months.map((m, i) => {
                const x = i * 38 + 15;
                return <g key={i}>
                  <rect x={x} y={140 - newT[i] * 12} width="14" height={newT[i] * 12} fill="#22C55E" />
                  <rect x={x + 16} y={140 - churn[i] * 12} width="14" height={churn[i] * 12} fill="#EF4444" />
                  <text x={x + 15} y="155" textAnchor="middle" fontSize="8" fill="#64748B">{m}</text>
                </g>;
              })}
            </svg>
            <div className="flex gap-3 text-2xs"><span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500" />New</span><span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500" />Churned</span></div>
          </div>

          <div className="bg-white border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">Module Adoption Heatmap</h3>
            <div className="space-y-1">
              {ALL_MODULES.slice(0, 8).map(m => (
                <div key={m.id} className="flex items-center gap-2 text-2xs">
                  <span className="w-20 truncate">{m.name}</span>
                  <div className="flex gap-0.5 flex-1">
                    {months.map((mo, i) => {
                      const intensity = Math.random() * 0.8 + 0.2;
                      return <div key={i} className="flex-1 h-5 rounded-sm" style={{ background: `hsla(239, 84%, 67%, ${intensity})` }} title={`${mo}: ${Math.round(intensity*100)}%`} />;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Top Features (Usage)</h3>
          <div className="space-y-2">
            {features.map(f => (
              <div key={f.name}>
                <div className="flex justify-between text-xs mb-1"><span>{f.name}</span><span className="font-mono text-muted-foreground">{f.uses.toLocaleString()}</span></div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-indigo-500" style={{ width: `${f.uses/maxUse*100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">Churn Rate (last 12 months)</h3>
            <div className="text-3xl font-semibold text-red-500">2.4%</div>
            <p className="text-2xs text-muted-foreground mt-1">12-month average</p>
          </div>
          <div className="bg-white border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">Revenue Cohort</h3>
            <table className="w-full text-2xs">
              <thead><tr className="text-muted-foreground"><th className="text-left">Signup</th><th>M1</th><th>M3</th><th>M6</th><th>M12</th></tr></thead>
              <tbody>
                {["Jan","Feb","Mar","Apr"].map(m => (
                  <tr key={m} className="border-t border-border"><td className="py-1.5">{m}</td><td className="text-center">100%</td><td className="text-center">92%</td><td className="text-center">85%</td><td className="text-center">78%</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

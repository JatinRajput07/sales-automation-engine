import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHrmsStore } from "@/store/hrmsStore";
import { useToast } from "@/hooks/use-toast";

export default function HrmsSettings() {
  const settings = useHrmsStore((s) => s.settings);
  const update = useHrmsStore((s) => s.updateSettings);
  const { toast } = useToast();

  return (
    <div className="flex-1 overflow-auto">
      <ModuleHeader title="HRMS Settings" accentVar="--mod-hrms" actions={<Button size="sm" className="h-7" onClick={() => toast({ title: "✅ Settings saved" })}>Save</Button>} />
      <div className="p-3 max-w-3xl">
        <Tabs defaultValue="general">
          <TabsList className="h-8">
            <TabsTrigger value="general" className="text-xs h-6">General</TabsTrigger>
            <TabsTrigger value="leave" className="text-xs h-6">Leave</TabsTrigger>
            <TabsTrigger value="att" className="text-xs h-6">Attendance</TabsTrigger>
            <TabsTrigger value="budget" className="text-xs h-6">Budget</TabsTrigger>
            <TabsTrigger value="notif" className="text-xs h-6">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-3 border border-border rounded-md bg-surface p-3 space-y-2">
            <div className="space-y-1"><Label className="text-2xs">Company Name</Label><Input value={settings.companyName} onChange={(e) => update({ companyName: e.target.value })} className="h-8" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-2xs">Fiscal Year Start</Label>
                <Select value={settings.fiscalStart} onValueChange={(v) => update({ fiscalStart: v as any })}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="April">April</SelectItem><SelectItem value="January">January</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-2xs">Currency</Label>
                <Select value={settings.currency} onValueChange={(v) => update({ currency: v as any })}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="INR">INR</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-2xs">Work Hours/Day</Label><Input type="number" value={settings.workHoursPerDay} onChange={(e) => update({ workHoursPerDay: Number(e.target.value) || 9 })} className="h-8" /></div>
              <div className="space-y-1"><Label className="text-2xs">Employee ID Prefix</Label><Input value={settings.empIdPrefix} onChange={(e) => update({ empIdPrefix: e.target.value.toUpperCase() })} className="h-8" /></div>
            </div>
          </TabsContent>

          <TabsContent value="leave" className="mt-3 border border-border rounded-md bg-surface p-3 space-y-2 text-xs">
            <p className="text-muted-foreground">Leave configuration. Default annual quotas: CL 12 · SL 12 · EL 15.</p>
          </TabsContent>

          <TabsContent value="att" className="mt-3 border border-border rounded-md bg-surface p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-2xs">Work Start Time</Label><Input type="time" value={settings.workStartTime} onChange={(e) => update({ workStartTime: e.target.value })} className="h-8" /></div>
              <div className="space-y-1"><Label className="text-2xs">Late Grace (min)</Label><Input type="number" value={settings.lateGraceMinutes} onChange={(e) => update({ lateGraceMinutes: Number(e.target.value) || 15 })} className="h-8" /></div>
              <div className="space-y-1"><Label className="text-2xs">Min Hours for Full Day</Label><Input type="number" value={settings.fullDayMinHours} onChange={(e) => update({ fullDayMinHours: Number(e.target.value) || 7 })} className="h-8" /></div>
            </div>
          </TabsContent>

          <TabsContent value="budget" className="mt-3 border border-border rounded-md bg-surface p-3 space-y-2">
            <div className="space-y-1"><Label className="text-2xs">Budget Alert Default ({settings.budgetAlertDefault}%)</Label>
              <input type="range" min={70} max={95} value={settings.budgetAlertDefault} onChange={(e) => update({ budgetAlertDefault: Number(e.target.value) })} className="w-full" />
            </div>
          </TabsContent>

          <TabsContent value="notif" className="mt-3 border border-border rounded-md bg-surface p-3 text-xs">
            <p className="text-muted-foreground">Notification matrix — manage who gets pinged on each HR event.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

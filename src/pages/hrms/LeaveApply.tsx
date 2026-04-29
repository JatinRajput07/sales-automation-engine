import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHrmsStore, fullName, type LeaveType } from "@/store/hrmsStore";
import { useToast } from "@/hooks/use-toast";

export default function LeaveApply() {
  const nav = useNavigate();
  const { toast } = useToast();
  const employees = useHrmsStore((s) => s.employees);
  const addLeave = useHrmsStore((s) => s.addLeave);

  const [employeeId, setEmployeeId] = useState(employees[0]?.id || "");
  const [type, setType] = useState<LeaveType>("CL");
  const [fromDate, setFrom] = useState(new Date().toISOString().slice(0, 10));
  const [toDate, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [halfDay, setHalfDay] = useState(false);
  const [reason, setReason] = useState("");
  const [contact, setContact] = useState("");

  const emp = employees.find((e) => e.id === employeeId);
  const days = useMemo(() => {
    if (halfDay) return 0.5;
    const a = new Date(fromDate); const b = new Date(toDate);
    let d = 0;
    for (let dt = new Date(a); dt <= b; dt.setDate(dt.getDate() + 1)) {
      const day = dt.getDay();
      if (day !== 0 && day !== 6) d++;
    }
    return d;
  }, [fromDate, toDate, halfDay]);

  function submit() {
    if (!employeeId || !reason || reason.length < 10) {
      toast({ title: "Reason min 10 chars", variant: "destructive" });
      return;
    }
    addLeave({ employeeId, type, fromDate, toDate, days, halfDay, reason, contact });
    toast({ title: "✅ Leave application submitted" });
    nav("/hrms/leaves");
  }

  return (
    <div className="flex-1 overflow-auto">
      <ModuleHeader
        title="Apply Leave"
        accentVar="--mod-hrms"
        actions={
          <>
            <Link to="/hrms/leaves"><Button size="sm" variant="ghost" className="h-7 gap-1.5"><ArrowLeft className="w-3.5 h-3.5" />Back</Button></Link>
            <Button size="sm" className="h-7" onClick={submit}>Submit</Button>
          </>
        }
      />
      <div className="p-3 max-w-2xl space-y-3">
        <div className="border border-border rounded-md bg-surface p-3 space-y-2">
          <div className="space-y-1">
            <Label className="text-2xs">Employee *</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{fullName(e)} — {e.designation}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-2xs">Leave Type *</Label>
            <Select value={type} onValueChange={(v) => setType(v as LeaveType)}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CL">Casual ({emp?.leaveBalances.CL ?? 0} remaining)</SelectItem>
                <SelectItem value="SL">Sick ({emp?.leaveBalances.SL ?? 0} remaining)</SelectItem>
                <SelectItem value="EL">Earned ({emp?.leaveBalances.EL ?? 0} remaining)</SelectItem>
                <SelectItem value="LOP">Loss of Pay (no limit)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1"><Label className="text-2xs">From *</Label><Input type="date" value={fromDate} onChange={(e) => setFrom(e.target.value)} className="h-8" /></div>
            <div className="space-y-1"><Label className="text-2xs">To *</Label><Input type="date" value={toDate} onChange={(e) => setTo(e.target.value)} className="h-8" /></div>
          </div>
          <div className="flex items-center justify-between text-xs"><span>Half day?</span><Switch checked={halfDay} onCheckedChange={setHalfDay} /></div>
          <div className="space-y-1"><Label className="text-2xs">Reason *</Label><Textarea value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[80px]" /></div>
          <div className="space-y-1"><Label className="text-2xs">Contact during leave</Label><Input value={contact} onChange={(e) => setContact(e.target.value)} className="h-8" /></div>
        </div>
        <div className="border border-border rounded-md bg-surface p-3 text-xs space-y-1">
          <div className="text-2xs uppercase tracking-wider font-semibold text-muted-foreground">Preview</div>
          <div>Type: {type} · Period: {fromDate} → {toDate}</div>
          <div>Working days: <span className="font-mono">{days}</span></div>
          {emp && type !== "LOP" && (
            <div>Balance before: {emp.leaveBalances[type]} · After: <span className="font-mono">{emp.leaveBalances[type] - days}</span></div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHrmsStore } from "@/store/hrmsStore";
import { useToast } from "@/hooks/use-toast";
import { inr } from "@/lib/mockData";

export default function BudgetRevisionRequest() {
  const nav = useNavigate();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const departments = useHrmsStore((s) => s.departments);
  const addRevision = useHrmsStore((s) => s.addRevision);

  const [departmentId, setDepartmentId] = useState(params.get("dept") || "");
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState<"New Hiring" | "Salary Revision" | "Unexpected Expense" | "Other">("New Hiring");
  const [justification, setJ] = useState("");

  const dept = departments.find((d) => d.id === departmentId);

  function submit() {
    if (!departmentId || amount <= 0 || justification.length < 50) {
      toast({ title: "Fill all fields, justification min 50 chars", variant: "destructive" });
      return;
    }
    addRevision({ departmentId, amount, reason, justification });
    toast({ title: "✅ Revision request submitted to Finance" });
    nav("/hrms/budget");
  }

  return (
    <div className="flex-1 overflow-auto">
      <ModuleHeader
        title="Request Budget Revision"
        accentVar="--mod-hrms"
        actions={
          <>
            <Link to="/hrms/budget"><Button size="sm" variant="ghost" className="h-7 gap-1.5"><ArrowLeft className="w-3.5 h-3.5" />Back</Button></Link>
            <Button size="sm" className="h-7" onClick={submit}>Submit to Finance</Button>
          </>
        }
      />
      <div className="p-3 max-w-2xl space-y-3">
        <div className="border border-border rounded-md bg-surface p-3 space-y-2">
          <div className="space-y-1">
            <Label className="text-2xs">Department *</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger className="h-8"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {dept && <div className="text-2xs text-muted-foreground">Current Budget: <span className="font-mono">{inr(dept.annualBudget)}</span></div>}
          <div className="space-y-1">
            <Label className="text-2xs">Amount Requested (₹) *</Label>
            <Input type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value) || 0)} className="h-8 font-mono" />
          </div>
          {dept && amount > 0 && <div className="text-2xs text-muted-foreground">New Total: <span className="font-mono">{inr(dept.annualBudget + amount)}</span></div>}
          <div className="space-y-1">
            <Label className="text-2xs">Reason *</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as any)}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>{["New Hiring","Salary Revision","Unexpected Expense","Other"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-2xs">Justification * (min 50 chars)</Label>
            <Textarea value={justification} onChange={(e) => setJ(e.target.value)} className="min-h-[100px]" />
            <div className="text-2xs text-muted-foreground">{justification.length} chars</div>
          </div>
        </div>
      </div>
    </div>
  );
}

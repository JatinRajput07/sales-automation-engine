import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSuperAdminStore } from "@/store/superAdminStore";
import { toast } from "sonner";

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const setAuthed = useSuperAdminStore(s => s.setAuthed);
  const [step, setStep] = useState<"creds" | "otp">("creds");
  const [email, setEmail] = useState("admin@yourdomain.com");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const submitCreds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Invalid email format");
    if (password.length < 4) return setError("Invalid credentials");
    setError("");
    setStep("otp");
  };

  const submitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return setError("Invalid 2FA code");
    setError("");
    setAuthed(true);
    toast.success("Welcome back, Rahul");
    navigate("/super-admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-border rounded-xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-semibold">Super Admin</h1>
            <p className="text-2xs text-muted-foreground mt-1">Product Owner Console</p>
          </div>

          {step === "creds" ? (
            <form onSubmit={submitCreds} className="space-y-4">
              <div>
                <Label className="text-xs">Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Password</Label>
                <div className="relative mt-1">
                  <Input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Sign In</Button>
            </form>
          ) : (
            <form onSubmit={submitOtp} className="space-y-4">
              <div>
                <Label className="text-xs">2FA Code</Label>
                <Input maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="6-digit code" className="mt-1 font-mono tracking-widest text-center text-lg" />
                <p className="text-2xs text-muted-foreground mt-1">Enter the 6-digit code from your authenticator app. (use any 6 digits)</p>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Verify & Continue</Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-border flex items-start gap-2 text-2xs text-muted-foreground">
            <Lock className="w-3 h-3 mt-0.5 shrink-0" />
            <span>This area is restricted to authorized personnel only. All access is logged.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

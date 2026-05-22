"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";
import api from "@/services/api";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    position: "",
    company: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", { ...form, role });
      setAuth(
        { id: data.id, email: form.email, role: data.role, name: data.name },
        "cookie-token"
      );
      toast.success("Account created!");
      router.push(data.role === "recruiter" ? "/recruiter" : "/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">HireMe</span>
          </Link>

          <h1 className="text-[24px] font-semibold tracking-tight mb-1">Create your account</h1>
          <p className="text-[14px] text-muted-foreground mb-6">
            Get started with HireMe in seconds.
          </p>

          {/* Role selector */}
          <div className="flex rounded-lg border border-border p-0.5 mb-6 bg-muted/30">
            {(["candidate", "recruiter"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-[13px] font-medium rounded-md transition-all ${
                  role === r
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "candidate" ? "Candidate" : "Recruiter"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[13px]">Full name</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[13px]">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="h-10"
              />
            </div>

            {role === "candidate" && (
              <div className="space-y-2">
                <Label htmlFor="position" className="text-[13px]">
                  Target role <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="position"
                  placeholder="e.g. Software Engineer"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="h-10"
                />
              </div>
            )}

            {role === "recruiter" && (
              <div className="space-y-2">
                <Label htmlFor="company" className="text-[13px]">Company</Label>
                <Input
                  id="company"
                  placeholder="Your company name"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="h-10"
                />
              </div>
            )}

            <Button type="submit" className="w-full h-10 text-[13px]" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel — branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-muted/40 border-l border-border">
        <div className="max-w-sm text-center px-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-[20px] font-semibold tracking-tight mb-3">
            {role === "candidate"
              ? "Practice makes perfect"
              : "Find your next hire"}
          </h2>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            {role === "candidate"
              ? "Prepare for interviews with AI-powered practice sessions and get detailed feedback on your performance."
              : "Evaluate candidates with structured AI interviews, coding challenges, and comprehensive reports."}
          </p>
        </div>
      </div>
    </div>
  );
}

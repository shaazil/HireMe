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

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      setAuth(
        { id: data.user_id, email: form.email, role: data.role, name: data.name },
        data.access_token
      );
      toast.success("Welcome back!");
      router.push(data.role === "recruiter" ? "/recruiter" : "/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Invalid email or password";
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

          <h1 className="text-[24px] font-semibold tracking-tight mb-1">Welcome back</h1>
          <p className="text-[14px] text-muted-foreground mb-8">
            Sign in to your account to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[13px]">Password</Label>
                <a href="#" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="h-10"
              />
            </div>

            <Button type="submit" className="w-full h-10 text-[13px]" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-foreground font-medium hover:underline">
              Sign up
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
            Hire smarter, not harder
          </h2>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            AI-powered interviews and evaluations that help you find the right candidate — every time.
          </p>
        </div>
      </div>
    </div>
  );
}

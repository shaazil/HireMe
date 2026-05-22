"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Brain,
  LayoutDashboard,
  MessageSquare,
  Code2,
  FileText,
  Settings,
  LogOut,
  User,
  Briefcase,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Job Board", icon: LayoutDashboard },
  { href: "/dashboard/interviews", label: "My Interviews", icon: MessageSquare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    // Redirect to login if not authenticated (after hydration attempt)
    const token = localStorage.getItem("hireme_token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Role guard
    if (user && user.role !== "candidate") {
      router.push("/recruiter");
    }
  }, [router, user]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-[var(--background)]">
      {/* ─── Sidebar ─── */}
      <aside className="hidden md:flex flex-col w-56 border-r border-border bg-card shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-[14px] font-semibold tracking-tight">HireMe</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-primary/5 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-3 border-t border-border">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium truncate">{user?.name || "User"}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email || ""}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-[12px] text-muted-foreground hover:text-foreground mt-1 h-8"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* ─── Main content ─── */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-[14px] font-semibold">HireMe</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 md:p-8 max-w-5xl">{children}</div>
      </main>
    </div>
  );
}

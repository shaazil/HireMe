"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, BarChart3, Settings, LogOut, Briefcase, PlusCircle, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/recruiter", label: "Overview", icon: BarChart3 },
  { href: "/recruiter/vacancies", label: "Vacancies", icon: LayoutList },
  { href: "/recruiter/candidates", label: "Candidates", icon: Users },
  { href: "/recruiter/settings", label: "Settings", icon: Settings },
];

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, hasHydrated } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.push("/login");
    } else if (user && user.role !== "recruiter") {
      router.push("/dashboard");
    } else {
      setIsReady(true);
    }
  }, [hasHydrated, isAuthenticated, router, user]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!isReady) {
    return <div className="h-screen w-full flex items-center justify-center text-[13px] text-muted-foreground bg-[var(--background)]">Loading dashboard...</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border mb-6 shrink-0">
          <Briefcase className="w-5 h-5 text-primary mr-2" />
          <span className="font-semibold text-lg tracking-tight">HireMe <span className="text-muted-foreground font-normal text-sm ml-1">Recruiter</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-3" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-background flex items-center justify-between px-8 shrink-0">
          <h1 className="text-[16px] font-medium">{user?.company || "Recruiter Dashboard"}</h1>
          <div className="flex items-center gap-4 text-[13px] font-medium text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase">
              {user?.name?.[0] || 'R'}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-muted/20">
          {children}
        </div>
      </main>
    </div>
  );
}

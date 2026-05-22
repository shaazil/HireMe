"use client";

import Link from "next/link";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#analytics", label: "Analytics" },
  { href: "#why-hireme", label: "Why HireMe" },
];

export function LandingNavbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-stone-200/80 bg-[#f8f7f4]/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 flex items-center justify-between h-14 sm:h-16">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center shadow-sm">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="text-[18px] font-semibold tracking-tight text-zinc-900">
            HireMe
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-[13px] text-zinc-500">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hover:text-zinc-900 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-[13px] text-zinc-600 hover:text-zinc-900"
            >
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button
              size="sm"
              className="text-[13px] bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm"
            >
              Get started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

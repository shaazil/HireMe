import Link from "next/link";
import { Brain, Globe, Mail } from "lucide-react";

const productLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#analytics", label: "Analytics" },
  { href: "/register", label: "Get started" },
];

const legalLinks = [
  { href: "#", label: "Privacy" },
  { href: "#", label: "Terms" },
  { href: "mailto:hello@hireme.io", label: "Contact" },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-stone-200/80 bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[14px] font-semibold text-zinc-900">HireMe</span>
            </Link>
            <p className="text-[13px] text-zinc-500 leading-relaxed max-w-xs">
              AI-powered hiring intelligence for teams that want structured,
              scalable interviews.
            </p>
          </div>

          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Product
            </p>
            <ul className="space-y-3">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-[13px] text-zinc-500 hover:text-zinc-900 transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Legal
            </p>
            <ul className="space-y-3">
              {legalLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-[13px] text-zinc-500 hover:text-zinc-900 transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Connect
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg border border-stone-200 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:border-stone-300 transition-colors"
                aria-label="GitHub"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg border border-stone-200 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:border-stone-300 transition-colors"
                aria-label="LinkedIn"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-zinc-400">
          <p>© {new Date().getFullYear()} HireMe. All rights reserved.</p>
          <p>Built for modern recruiting teams.</p>
        </div>
      </div>
    </footer>
  );
}

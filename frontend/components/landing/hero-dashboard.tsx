"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  CheckCircle2,
  Code2,
  TrendingUp,
  Users,
} from "lucide-react";

const candidates = [
  { name: "Priya Patel", role: "Frontend Engineer", score: 4.6, rec: "Strong hire" },
  { name: "Marcus Chen", role: "Backend Engineer", score: 4.1, rec: "Hire" },
  { name: "Alex Rivera", role: "Full Stack", score: 3.4, rec: "Maybe" },
];

const pipeline = [
  { stage: "Applied", count: 48, pct: 100 },
  { stage: "Interviewed", count: 32, pct: 67 },
  { stage: "Coding", count: 24, pct: 50 },
  { stage: "Reviewed", count: 18, pct: 38 },
];

export function HeroDashboard() {
  return (
    <div className="relative w-full max-w-[580px] mx-auto lg:mx-0 lg:ml-auto">
      {/* Ambient glow */}
      <div className="absolute -inset-8 bg-gradient-to-br from-stone-200/40 via-transparent to-zinc-200/30 rounded-3xl blur-2xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative rounded-xl border border-stone-200/90 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden"
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-100 bg-stone-50/80">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
          </div>
          <span className="text-[10px] text-zinc-400 font-medium ml-1">
            app.hireme.io/recruiter
          </span>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                Recruiter dashboard
              </p>
              <p className="text-[15px] font-semibold text-zinc-900 mt-0.5">
                Frontend Engineer · Meta
              </p>
            </div>
            <span className="text-[10px] font-medium px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
              12 active
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Interviews", value: "32", icon: Users },
              { label: "Avg score", value: "3.9", icon: TrendingUp },
              { label: "Pass rate", value: "58%", icon: BarChart3 },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-stone-100 bg-stone-50/50 p-2.5"
              >
                <s.icon className="w-3.5 h-3.5 text-zinc-400 mb-1" />
                <p className="text-[10px] text-zinc-500">{s.label}</p>
                <p className="text-[15px] font-semibold text-zinc-900">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Pipeline mini */}
          <div className="rounded-lg border border-stone-100 p-3">
            <p className="text-[11px] font-medium text-zinc-700 mb-2">Hiring pipeline</p>
            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-stone-100">
              {pipeline.map((p, i) => (
                <div
                  key={p.stage}
                  className="h-full bg-zinc-800/80 first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${p.pct}%`, opacity: 1 - i * 0.15 }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[9px] text-zinc-400">
              {pipeline.map((p) => (
                <span key={p.stage}>{p.stage}</span>
              ))}
            </div>
          </div>

          {/* Candidate table */}
          <div className="rounded-lg border border-stone-100 overflow-hidden">
            <div className="px-3 py-2 bg-stone-50/80 border-b border-stone-100 flex justify-between">
              <span className="text-[11px] font-medium text-zinc-700">
                Candidate rankings
              </span>
              <span className="text-[10px] text-zinc-400">This week</span>
            </div>
            {candidates.map((c, i) => (
              <div
                key={c.name}
                className="flex items-center justify-between px-3 py-2 border-b border-stone-50 last:border-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono text-zinc-400 w-4">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-zinc-900 truncate">
                      {c.name}
                    </p>
                    <p className="text-[10px] text-zinc-400 truncate">{c.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                      c.rec === "Strong hire"
                        ? "bg-emerald-50 text-emerald-700"
                        : c.rec === "Hire"
                          ? "bg-zinc-100 text-zinc-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {c.rec}
                  </span>
                  <span className="text-[12px] font-semibold tabular-nums text-zinc-900">
                    {c.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>


    </div>
  );
}

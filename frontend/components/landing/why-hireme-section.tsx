"use client";

import { motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";

const comparisons = [
  {
    traditional: "Manual resume screening across inboxes",
    hireme: "Structured applications tied to each vacancy",
  },
  {
    traditional: "Scattered tools for interviews, notes, and code tests",
    hireme: "One platform from apply → interview → report",
  },
  {
    traditional: "Slow, inconsistent evaluation cycles",
    hireme: "Instant AI reports with scored breakdowns",
  },
  {
    traditional: "Interview quality varies by interviewer",
    hireme: "Consistent, resume-aware structured assessments",
  },
  {
    traditional: "Little visibility into pipeline health",
    hireme: "Funnel analytics and candidate rankings",
  },
];

export function WhyHiremeSection() {
  return (
    <section id="why-hireme" className="py-24 sm:py-32 bg-[#f8f7f4] border-t border-stone-200/80">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-[12px] font-medium text-zinc-400 uppercase tracking-widest mb-3">
            Why HireMe
          </p>
          <h2 className="text-[30px] sm:text-[36px] font-semibold tracking-tight text-zinc-900">
            Traditional hiring vs. a unified workflow
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm"
        >
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200">
            <div className="p-6 sm:p-8 bg-stone-50/50">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400 mb-6">
                Traditional hiring
              </p>
              <ul className="space-y-5">
                {comparisons.map((c) => (
                  <li key={c.traditional} className="flex items-start gap-3 text-[14px] text-zinc-500">
                    <X className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
                    {c.traditional}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-zinc-900 mb-6">
                With HireMe
              </p>
              <ul className="space-y-5">
                {comparisons.map((c) => (
                  <li
                    key={c.hireme}
                    className="flex items-start gap-3 text-[14px] text-zinc-700"
                  >
                    <ArrowRight className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                    {c.hireme}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

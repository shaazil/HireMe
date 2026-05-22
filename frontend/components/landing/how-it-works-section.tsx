"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  UserPlus,
  MessageSquare,
  Code2,
  FileText,
  BarChart3,
  UserCheck,
} from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Recruiter creates a vacancy",
    desc: "Post a role with company details, requirements, slots, and deadlines. Your pipeline starts in one place.",
    icon: Briefcase,
    visual: (
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <p className="text-[11px] text-zinc-400 mb-2">New vacancy</p>
        <p className="text-[14px] font-semibold text-zinc-900">Senior Frontend Engineer</p>
        <p className="text-[12px] text-zinc-500 mt-1">Meta · Remote · 3 slots</p>
        <div className="mt-3 h-8 rounded-md bg-zinc-900 text-white text-[11px] font-medium flex items-center justify-center">
          Publish role
        </div>
      </div>
    ),
  },
  {
    step: "02",
    title: "Candidate applies",
    desc: "Applicants discover roles on your job board, upload a resume, and enter the interview flow for that position.",
    icon: UserPlus,
    visual: (
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm space-y-2">
        {["Resume uploaded", "Role selected", "Session ready"].map((t, i) => (
          <div key={t} className="flex items-center gap-2 text-[12px] text-zinc-600">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i < 2 ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
              {i < 2 ? "✓" : "3"}
            </span>
            {t}
          </div>
        ))}
      </div>
    ),
  },
  {
    step: "03",
    title: "AI interview begins",
    desc: "A conversational interviewer asks personalized questions based on the resume and role — one question at a time.",
    icon: MessageSquare,
    visual: (
      <div className="rounded-lg border border-stone-200 bg-white p-3 shadow-sm space-y-2">
        <div className="rounded-lg bg-stone-50 border border-stone-100 px-3 py-2 text-[11px] text-zinc-600">
          I noticed you led the API migration at your last role. What trade-offs did you consider?
        </div>
        <div className="rounded-lg bg-zinc-900 text-white px-3 py-2 text-[11px] ml-6">
          We prioritized backward compatibility while moving to REST...
        </div>
      </div>
    ),
  },
  {
    step: "04",
    title: "Coding round follows naturally",
    desc: "After the verbal interview, candidates complete a practical challenge aligned with their role and experience level.",
    icon: Code2,
    visual: (
      <div className="rounded-lg border border-stone-200 bg-zinc-950 p-3 shadow-sm font-mono text-[10px] text-zinc-400 leading-relaxed">
        <span className="text-violet-400">def</span> merge_intervals(intervals):
        <br />
        {"  "}# candidate solution
        <br />
        <span className="text-emerald-400 mt-2 block">→ 4/5 tests passed</span>
      </div>
    ),
  },
  {
    step: "05",
    title: "AI generates the report",
    desc: "Scores, strengths, improvement areas, and a hiring recommendation are produced from the full session.",
    icon: FileText,
    visual: (
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[12px] font-semibold">Overall</span>
          <span className="text-[18px] font-bold text-zinc-900">4.2</span>
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Strong technical depth on distributed systems. Recommend hire for backend role.
        </p>
      </div>
    ),
  },
  {
    step: "06",
    title: "Recruiter reviews analytics",
    desc: "Compare candidates, track funnel progress, and drill into interview and coding performance from your dashboard.",
    icon: BarChart3,
    visual: (
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex gap-1 h-16 items-end">
          {[40, 65, 55, 80, 70, 90].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-zinc-200 rounded-t-sm"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <p className="text-[10px] text-zinc-400 mt-2 text-center">Weekly avg. scores</p>
      </div>
    ),
  },
  {
    step: "07",
    title: "Hire or reject with confidence",
    desc: "Update application status in one click. Close vacancies when slots fill — your team stays aligned.",
    icon: UserCheck,
    visual: (
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm flex gap-2">
        <button type="button" className="flex-1 py-2 rounded-md border border-stone-200 text-[11px] font-medium text-zinc-600">
          Reject
        </button>
        <button type="button" className="flex-1 py-2 rounded-md bg-emerald-600 text-[11px] font-medium text-white">
          Hire
        </button>
      </div>
    ),
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 border-t border-stone-200/80 bg-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="max-w-2xl mb-16 sm:mb-20">
          <p className="text-[12px] font-medium text-zinc-400 uppercase tracking-widest mb-3">
            How HireMe works
          </p>
          <h2 className="text-[30px] sm:text-[36px] font-semibold tracking-tight text-zinc-900">
            From vacancy to hire decision in one flow
          </h2>
          <p className="mt-4 text-[15px] text-zinc-500 leading-relaxed">
            Every step connects — no handoffs between tools, no manual score aggregation.
          </p>
        </div>

        <div className="space-y-20 sm:space-y-28">
          {steps.map((item, i) => {
            const reversed = i % 2 === 1;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5 }}
                className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${reversed ? "md:[direction:rtl] md:*:[direction:ltr]" : ""}`}
              >
                <div className={reversed ? "md:pl-4" : "md:pr-4"}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-zinc-600" />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-zinc-400">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-[20px] sm:text-[22px] font-semibold text-zinc-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[14px] text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
                <div className="max-w-md mx-auto md:mx-0 w-full">{item.visual}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

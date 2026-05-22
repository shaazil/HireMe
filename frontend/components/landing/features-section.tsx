"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Code2,
  FileText,
  BarChart3,
  LayoutList,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: LayoutList,
    title: "Vacancy & pipeline management",
    desc: "Create roles, set slots and deadlines, and track every applicant through applied → interviewed → hired in one dashboard.",
    tag: "Workflow",
  },
  {
    icon: Brain,
    title: "Contextual AI interviews",
    desc: "Questions adapt to each candidate's resume and the role. Follow-ups probe deeper — not generic textbook prompts.",
    tag: "Interviews",
  },
  {
    icon: Code2,
    title: "Role-aligned coding rounds",
    desc: "Practical challenges with starter code, sample cases, and automated evaluation. Difficulty scales with experience.",
    tag: "Assessment",
  },
  {
    icon: FileText,
    title: "Resume-aware evaluation",
    desc: "Parsed skills and project history feed both interview questions and recruiter review panels on every report.",
    tag: "Context",
  },
  {
    icon: BarChart3,
    title: "Recruiter analytics",
    desc: "Funnel metrics, score distributions, pass/fail rates, and candidate rankings — built for hiring decisions.",
    tag: "Analytics",
  },
  {
    icon: Shield,
    title: "Consistent, structured assessments",
    desc: "Every candidate gets the same interview structure and scoring rubric. Reduce variance across interviewers.",
    tag: "Fairness",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-[#f8f7f4] border-t border-stone-200/80">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <p className="text-[12px] font-medium text-zinc-400 uppercase tracking-widest mb-3">
            Platform capabilities
          </p>
          <h2 className="text-[30px] sm:text-[36px] font-semibold tracking-tight text-zinc-900">
            Built for how recruiting teams actually work
          </h2>
          <p className="mt-4 text-[15px] text-zinc-500">
            Practical tools for high-volume screening — not demo widgets.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              whileHover={{ y: -2 }}
              className="group rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-[0_1px_3px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgb(0,0,0,0.06)] transition-shadow duration-300"
            >
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                {f.tag}
              </span>
              <div className="w-10 h-10 rounded-xl border border-stone-100 bg-stone-50 flex items-center justify-center mt-4 mb-5 group-hover:border-stone-200 transition-colors">
                <f.icon className="w-5 h-5 text-zinc-600" />
              </div>
              <h3 className="text-[15px] font-semibold text-zinc-900 mb-2">{f.title}</h3>
              <p className="text-[13px] text-zinc-500 leading-relaxed">{f.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

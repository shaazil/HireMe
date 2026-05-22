"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroDashboard } from "./hero-dashboard";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const benefits = [
  "Structured AI interviews",
  "Unified recruiter dashboard",
  "Instant evaluation reports",
];

export function HeroSection() {
  return (
    <section className="relative pt-16 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,113,108,0.08),transparent)] pointer-events-none" />

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
          <div className="max-w-xl">

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
              className="mt-5 text-[36px] sm:text-[44px] lg:text-[48px] font-semibold leading-[1.08] tracking-tight text-zinc-900"
            >
              Run structured interviews at scale
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
              className="mt-5 text-[16px] sm:text-[17px] leading-relaxed text-zinc-500"
            >
              HireMe gives recruiters one workflow for vacancies, AI-led interviews,
              coding assessments, and evidence-based hiring decisions — without
              juggling spreadsheets and scattered tools.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-11 px-6 text-[14px] bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm"
                >
                  Start hiring smarter
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 px-6 text-[14px] border-stone-200 bg-white/80 text-zinc-700 hover:bg-white"
                >
                  See the workflow
                </Button>
              </Link>
            </motion.div>

            <motion.ul
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={4}
              className="mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6"
            >
              {benefits.map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-2 text-[13px] text-zinc-500"
                >
                  <CheckCircle2 className="w-4 h-4 text-zinc-400 shrink-0" />
                  {b}
                </li>
              ))}
            </motion.ul>
          </div>

          <HeroDashboard />
        </div>
      </div>
    </section>
  );
}

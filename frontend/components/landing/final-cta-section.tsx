"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section className="py-24 sm:py-32 border-t border-stone-200/80">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl border border-stone-200 bg-zinc-900 overflow-hidden px-6 py-16 sm:px-12 sm:py-20 text-center"
        >
          {/* Subtle backdrop */}
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-white blur-3xl" />
          </div>
          <div
            className="absolute inset-0 opacity-20 pointer-events-none bg-[length:24px_24px]"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            }}
          />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-[28px] sm:text-[36px] font-semibold tracking-tight text-white leading-tight">
              Build a better hiring pipeline
            </h2>
            <p className="mt-4 text-[15px] sm:text-[16px] text-zinc-400 leading-relaxed">
              Modernize your interview workflow. Make faster, smarter hiring decisions
              with structured assessments and recruiter-ready analytics.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-12 px-8 text-[14px] bg-white text-zinc-900 hover:bg-zinc-100"
                >
                  Get started free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 text-[14px] border-zinc-600 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  Log in to your account
                </Button>
              </Link>
            </div>
            <p className="mt-8 text-[12px] text-zinc-500">
              No credit card required · Set up in minutes
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

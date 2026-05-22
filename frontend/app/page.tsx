"use client";

import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { AnalyticsShowcase } from "@/components/landing/analytics-showcase";
import { WhyHiremeSection } from "@/components/landing/why-hireme-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f7f4] text-zinc-900 antialiased">
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <AnalyticsShowcase />
        <WhyHiremeSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}

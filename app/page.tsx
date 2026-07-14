import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { Experience } from "@/components/sections/Experience";
import { AIEngine } from "@/components/sections/AIEngine";
import { MovementAge } from "@/components/sections/MovementAge";
import { WeeklyCheckpoints } from "@/components/sections/WeeklyCheckpoints";
import { CompoundEffect } from "@/components/sections/CompoundEffect";
import { Adherence } from "@/components/sections/Adherence";
import { AICoaches } from "@/components/sections/AICoaches";
import { ComputerVision } from "@/components/sections/ComputerVision";
import { Longevity } from "@/components/sections/Longevity";
import { RealWorldEvidence } from "@/components/sections/RealWorldEvidence";
import { Dashboard } from "@/components/sections/Dashboard";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Experience />
        <Problem />
        <AIEngine />
        <MovementAge />
        <WeeklyCheckpoints />
        <CompoundEffect />
        <Adherence />
        <AICoaches />
        <ComputerVision />
        <Longevity />
        <RealWorldEvidence />
        <Dashboard />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}

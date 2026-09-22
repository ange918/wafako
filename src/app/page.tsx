import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { ModulesGrid } from "@/components/landing/ModulesGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { CtaBand } from "@/components/landing/CtaBand";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ModulesGrid />
        <HowItWorks />
        <Pricing />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}

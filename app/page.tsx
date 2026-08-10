import { AboutSection } from "@/components/landing/about-section";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { InteractiveAnalytics } from "@/components/landing/interactive-analytics";
import { MouseGlow } from "@/components/landing/mouse-glow";
import { Navbar } from "@/components/landing/navbar";
import { SecuritySection } from "@/components/landing/security-section";

export default function Home() {
  return (
    <>
      <MouseGlow />
      <Navbar />
      <main>
        <Hero />
        <DashboardPreview />
        <FeatureGrid />
        <HowItWorks />
        <InteractiveAnalytics />
        <SecuritySection />
        <AboutSection />
      </main>
      <Footer />
    </>
  );
}

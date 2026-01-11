import { auth } from "@clerk/nextjs/server";
import BgGradient from "@/components/common/bg-gradient";
import HeroSection from "@/components/home/hero-section";
import DemoSection from "@/components/home/demo-section";
import HowItWorksSection from "@/components/home/how-it-works-section";
import PricingSection from "@/components/home/pricing-section";
import CTASection from "@/components/home/cta-section";

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <div className="relative w-full">
      <BgGradient>
        <div className="flex flex-col">
          <HeroSection isSignedIn={isSignedIn} />
          <DemoSection />
          <HowItWorksSection />
          <PricingSection />
          <CTASection />
        </div>
      </BgGradient>
    </div>
  );
}

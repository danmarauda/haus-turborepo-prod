import { BuyerActivity } from "@/components/buyer-activity";
import { ComparableSales } from "@/components/comparable-sales";
import { HeroSection } from "@/components/hero-section";
import { MarketInsights } from "@/components/market-insights";
import { MarketingPlan } from "@/components/marketing-plan";
import { Navigation } from "@/components/navigation";
import { PropertyNarrative } from "@/components/property-narrative";
import { PropertySpecs } from "@/components/property-specs";
import { RentalAppraisal } from "@/components/rental-appraisal";
import { ReportGeneration } from "@/components/report-generation";
import { Sidebar } from "@/components/sidebar";

export default function HausAppraisalPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-20 pb-12 px-4 sm:px-6 max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 relative items-start">
          <Sidebar />

          <main className="flex-1 min-w-0 space-y-6">
            <HeroSection />
            <PropertyNarrative />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <PropertySpecs />
              <ComparableSales />
              <MarketInsights />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RentalAppraisal />
              <BuyerActivity />
            </div>

            <MarketingPlan />
            <ReportGeneration />
          </main>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { ExploreContent } from "@/components/haus/explore-content";
import { ScrollAwareNavigation } from "@/components/scroll-aware-navigation";

// Force dynamic rendering to avoid Convex hooks during static generation
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore Properties | HAUS Voice Search",
  description:
    "Discover curated property collections, trending neighborhoods, and premium listings across Australia and New Zealand. Browse by lifestyle, architecture, or investment potential.",
  keywords: [
    "explore properties",
    "real estate discovery",
    "neighborhood guide",
    "property collections",
    "luxury homes",
    "trans-tasman",
    "new zealand",
  ],
};

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="-z-10 fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <ScrollAwareNavigation>
        <ExploreContent />
      </ScrollAwareNavigation>
    </div>
  );
}

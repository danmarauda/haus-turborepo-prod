import type { Metadata } from "next";
import { CompassContent } from "@/components/compass/compass-content";

// Force dynamic rendering to avoid Convex hooks during static generation
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Compass | HAUS - Interactive Property Map",
  description:
    "Explore Australian properties on an interactive map. Search rentals and for-sale properties with real-time MapLibre maps, advanced filters, and property listings.",
  keywords: [
    "property map",
    "Australian real estate map",
    "interactive property search",
    "rentals Sydney",
    "houses for sale Melbourne",
    "property compass",
    "maplibre",
  ],
  openGraph: {
    title: "Compass | HAUS - Interactive Property Map",
    description:
      "Explore Australian properties on an interactive map with advanced location-based search tools.",
    type: "website",
  },
};

export default function CompassPage() {
  return <CompassContent />;
}

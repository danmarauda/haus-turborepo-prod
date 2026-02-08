"use client";

import { useEffect, useState } from "react";
import {
  type CompassListing,
  compassListings as mockListings,
} from "@/lib/compass-mock-data";
import { useCompassStore } from "@/store/compass-store";
import { CompassFilters } from "./CompassFilters";
import { CompassListingsPanel } from "./CompassListingsPanel";
import { CompassMap } from "./CompassMap";

// Convex data fetcher component
function ConvexDataLoader() {
  const setListings = useCompassStore((state) => state.setListings);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined" || hasLoaded) {
      return;
    }

    async function loadFromConvex() {
      try {
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
        if (!convexUrl) {
          setListings(mockListings);
          return;
        }

        // Fetch directly from Convex HTTP API
        const response = await fetch(`${convexUrl}/api/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: "compassListings:list",
            args: {},
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.value && result.value.length > 0) {
            const listings: CompassListing[] = result.value.map((l: any) => ({
              ...l,
              id: l._id,
            }));
            setListings(listings);
            setHasLoaded(true);
            return;
          }
        }
      } catch (error) {
        console.log("Convex fetch failed, using mock data:", error);
      }

      // Fallback to mock data
      setListings(mockListings);
      setHasLoaded(true);
    }

    loadFromConvex();
  }, [setListings, hasLoaded]);

  return null;
}

export function CompassContent() {
  return (
    <>
      <ConvexDataLoader />
      <div className="relative h-screen w-full overflow-hidden bg-background">
        {/* Filters Bar - Top */}
        <div className="absolute top-0 right-0 left-0 z-40 px-4 pt-4">
          <CompassFilters />
        </div>

        {/* Main Content - Map and Listings Side by Side */}
        <div className="flex h-full flex-col md:flex-row">
          {/* Map - Full width on mobile, right side on desktop */}
          <div className="relative h-[60vh] flex-1 md:h-full md:w-2/3">
            <CompassMap />
          </div>

          {/* Listings Panel - Bottom on mobile, left side on desktop */}
          <div className="h-[40vh] w-full border-t bg-background md:h-full md:w-[400px] md:border-t-0 md:border-l lg:w-[450px]">
            <CompassListingsPanel />
          </div>
        </div>
      </div>
    </>
  );
}

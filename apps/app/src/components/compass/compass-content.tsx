"use client";

import { useEffect, useState } from "react";
import {
  type CompassListing,
  compassListings as mockListings,
} from "@/lib/compass-mock-data";
import { useCompassStore } from "@/store/compass-store";
import { CompassFloatingNavbar } from "./compass-floating-navbar";
import { CompassListingsSidebar } from "./compass-listings-sidebar";
import { CompassMapView } from "./compass-map-view";

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
      <div className="relative h-screen w-full overflow-hidden">
        {/* Map (full screen background) */}
        <CompassMapView />

        {/* Listings Sidebar (LHS only) */}
        <CompassListingsSidebar />

        {/* Floating Navbar (bottom center) */}
        <CompassFloatingNavbar />
      </div>
    </>
  );
}

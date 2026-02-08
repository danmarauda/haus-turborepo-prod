/**
 * Property Sync Hook
 *
 * Hook for triggering property sync from external sources
 * (Domain.com.au, Realestate.com.au)
 *
 * @module hooks/use-property-sync
 */

import { useCallback, useState } from "react";
import { fetchAction } from "convex/nextjs";

interface PropertySyncOptions {
  suburb?: string;
  state?: string;
  query?: string;
  maxPages?: number;
  listingType?: "buy" | "rent" | "sold";
}

interface PropertySyncResult {
  success: boolean;
  source: string;
  created: number;
  updated: number;
  failed: number;
  duration: number;
  error?: string;
  details?: PropertySyncResult[];
}

/**
 * Hook to trigger property sync from external sources
 *
 * @example
 * ```tsx
 * const { syncProperties, isSyncing, result } = usePropertySync();
 *
 * await syncProperties({ suburb: "Bondi Beach", state: "NSW", maxPages: 2 });
 * ```
 */
export function usePropertySync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [result, setResult] = useState<PropertySyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncProperties = useCallback(async (options: PropertySyncOptions = {}) => {
    setIsSyncing(true);
    setError(null);
    setResult(null);

    try {
      // Call the Convex HTTP endpoint
      const response = await fetch("/api/properties/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as PropertySyncResult;
      setResult(data);

      if (!data.success) {
        setError(data.error || "Sync failed");
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const getSyncStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/properties/sync/status");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error("Failed to get sync status:", err);
      return null;
    }
  }, []);

  return {
    syncProperties,
    getSyncStatus,
    isSyncing,
    result,
    error,
  };
}

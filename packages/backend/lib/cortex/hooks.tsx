/**
 * HAUS Voice Memory Hooks
 *
 * React hooks that integrate Cortex memory with the HAUS voice agent:
 * - useVoiceMemory: Remember voice searches and recall context
 * - usePropertyMemory: Track property interactions
 * - useSuburbPreferences: Learn and recall suburb preferences
 *
 * These hooks automatically:
 * 1. Store voice conversations in Cortex
 * 2. Extract facts about user preferences
 * 3. Generate embeddings for semantic search
 * 4. Sync to Neo4j knowledge graph
 */

"use client";

import { useCallback, useEffect, useState } from "react";

// Types
export interface VoiceMemory {
  content: string;
  relevance: number;
  timestamp?: number;
}

export interface VoiceFact {
  fact: string;
  confidence: number;
  category?: string;
}

export interface SuburbPreference {
  suburbName: string;
  state: string;
  preferenceScore: number; // -100 (avoid) to +100 (love)
  reason?: string;
}

export interface PropertyInteraction {
  propertyId: string;
  propertyName?: string;
  propertyAddress?: string;
  propertyPrice?: number;
  propertySuburb?: string;
  propertyState?: string;
  interactionType: "searched" | "viewed" | "saved" | "inquired" | "voice_query";
  queryText?: string;
  sentiment?: "positive" | "neutral" | "negative";
  notes?: string;
}

// -----------------------------------------------------------------------------
// useVoiceMemory Hook
// -----------------------------------------------------------------------------

export interface UseVoiceMemoryOptions {
  userId: string;
  memorySpaceId: string;
  convexUrl: string;
  enabled?: boolean;
}

export interface UseVoiceMemoryReturn {
  // Remember a voice search interaction
  rememberVoiceSearch: (options: {
    userQuery: string;
    agentResponse: string;
    propertyId?: string;
    propertyContext?: Record<string, unknown>;
  }) => Promise<void>;

  // Recall relevant context for a query
  recallForQuery: (query: string, limit?: number) => Promise<{
    memories: VoiceMemory[];
    facts: VoiceFact[];
    graphEntities?: Array<{
      name: string;
      type: string;
      relationships?: string[];
    }>;
  }>;

  // Loading and error states
  isLoading: boolean;
  error: Error | null;
}

export function useVoiceMemory(
  options: UseVoiceMemoryOptions
): UseVoiceMemoryReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Remember a voice search interaction
  const rememberVoiceSearch = useCallback(
    async (params: {
      userQuery: string;
      agentResponse: string;
      propertyId?: string;
      propertyContext?: Record<string, unknown>;
    }) => {
      if (!options.enabled) return;

      setIsLoading(true);
      setError(null);

      try {
        // Call the HAUS Cortex API endpoint
        const response = await fetch("/api/cortex/remember", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: options.userId,
            memorySpaceId: options.memorySpaceId,
            userQuery: params.userQuery,
            agentResponse: params.agentResponse,
            propertyId: params.propertyId,
            propertyContext: params.propertyContext,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to remember: ${response.statusText}`);
        }

        await response.json();
      } catch (err) {
        const error = err as Error;
        setError(error);
        console.error("[useVoiceMemory] Failed to remember:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [options.userId, options.memorySpaceId, options.enabled]
  );

  // Recall relevant context for a query
  const recallForQuery = useCallback(
    async (
      query: string,
      limit: number = 20
    ): Promise<{
      memories: VoiceMemory[];
      facts: VoiceFact[];
      graphEntities?: Array<{
        name: string;
        type: string;
        relationships?: string[];
      }>;
    }> => {
      if (!options.enabled) {
        return { memories: [], facts: [] };
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/cortex/recall", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: options.userId,
            memorySpaceId: options.memorySpaceId,
            query,
            limit,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to recall: ${response.statusText}`);
        }

        return await response.json();
      } catch (err) {
        const error = err as Error;
        setError(error);
        console.error("[useVoiceMemory] Failed to recall:", error);
        return { memories: [], facts: [] };
      } finally {
        setIsLoading(false);
      }
    },
    [options.userId, options.memorySpaceId, options.enabled]
  );

  return {
    rememberVoiceSearch,
    recallForQuery,
    isLoading,
    error,
  };
}

// -----------------------------------------------------------------------------
// usePropertyMemory Hook
// -----------------------------------------------------------------------------

export interface UsePropertyMemoryReturn {
  // Track a property interaction
  trackInteraction: (interaction: PropertyInteraction) => Promise<void>;

  // Get user's interaction history for a property
  getPropertyHistory: (propertyId: string) => Promise<PropertyInteraction[]>;

  // Get user's recently viewed properties
  getRecentProperties: (limit?: number) => Promise<PropertyInteraction[]>;

  isLoading: boolean;
  error: Error | null;
}

export function usePropertyMemory(
  options: UseVoiceMemoryOptions
): UsePropertyMemoryReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const trackInteraction = useCallback(
    async (interaction: PropertyInteraction) => {
      if (!options.enabled) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/cortex/property/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: options.userId,
            memorySpaceId: options.memorySpaceId,
            interaction,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to track: ${response.statusText}`);
        }

        await response.json();
      } catch (err) {
        const error = err as Error;
        setError(error);
        console.error("[usePropertyMemory] Failed to track:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [options.userId, options.memorySpaceId, options.enabled]
  );

  const getPropertyHistory = useCallback(
    async (propertyId: string): Promise<PropertyInteraction[]> => {
      if (!options.enabled) return [];

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/cortex/property/history?userId=${options.userId}&propertyId=${propertyId}`
        );

        if (!response.ok) return [];

        return await response.json();
      } finally {
        setIsLoading(false);
      }
    },
    [options.userId, options.enabled]
  );

  const getRecentProperties = useCallback(
    async (limit: number = 10): Promise<PropertyInteraction[]> => {
      if (!options.enabled) return [];

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/cortex/property/recent?userId=${options.userId}&limit=${limit}`
        );

        if (!response.ok) return [];

        return await response.json();
      } finally {
        setIsLoading(false);
      }
    },
    [options.userId, options.enabled]
  );

  return {
    trackInteraction,
    getPropertyHistory,
    getRecentProperties,
    isLoading,
    error,
  };
}

// -----------------------------------------------------------------------------
// useSuburbPreferences Hook
// -----------------------------------------------------------------------------

export interface UseSuburbPreferencesReturn {
  // Update suburb preference based on sentiment
  updatePreference: (preference: SuburbPreference) => Promise<void>;

  // Get user's ranked suburb preferences
  getPreferences: () => Promise<SuburbPreference[]>;

  // Get preferred suburbs (positive score)
  preferredSuburbs: SuburbPreference[];

  // Get avoided suburbs (negative score)
  avoidedSuburbs: SuburbPreference[];

  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSuburbPreferences(
  options: UseVoiceMemoryOptions
): UseSuburbPreferencesReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [preferences, setPreferences] = useState<SuburbPreference[]>([]);

  const updatePreference = useCallback(
    async (preference: SuburbPreference) => {
      if (!options.enabled) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/cortex/suburb/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: options.userId,
            memorySpaceId: options.memorySpaceId,
            preference,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update: ${response.statusText}`);
        }

        await response.json();

        // Refetch preferences
        await refetch();
      } catch (err) {
        const error = err as Error;
        setError(error);
        console.error("[useSuburbPreferences] Failed to update:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [options.userId, options.memorySpaceId, options.enabled]
  );

  const getPreferences = useCallback(async (): Promise<SuburbPreference[]> => {
    if (!options.enabled) return [];

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/cortex/suburb/list?userId=${options.userId}&memorySpaceId=${options.memorySpaceId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to get preferences: ${response.statusText}`);
      }

      const data = await response.json();
      setPreferences(data);
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error("[useSuburbPreferences] Failed to get:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [options.userId, options.memorySpaceId, options.enabled]);

  const refetch = useCallback(async () => {
    await getPreferences();
  }, [getPreferences]);

  // Load preferences on mount
  useEffect(() => {
    if (options.enabled) {
      getPreferences();
    }
  }, [options.enabled, getPreferences]);

  const preferredSuburbs = preferences.filter((p) => p.preferenceScore > 0);
  const avoidedSuburbs = preferences.filter((p) => p.preferenceScore < 0);

  return {
    updatePreference,
    getPreferences,
    preferredSuburbs,
    avoidedSuburbs,
    isLoading,
    error,
    refetch,
  };
}

// -----------------------------------------------------------------------------
// Voice Memory Provider (for app-wide context)
// -----------------------------------------------------------------------------

import { createContext, useContext as useContextReact } from "react";

interface VoiceMemoryContextValue {
  memorySpaceId: string | null;
  ensureMemorySpace: () => Promise<string>;
}

const VoiceMemoryContext = createContext<VoiceMemoryContextValue | null>(null);

export function VoiceMemoryProvider({
  children,
  userId,
  convexUrl,
}: {
  children: React.ReactNode;
  userId: string;
  convexUrl: string;
}) {
  const [memorySpaceId, setMemorySpaceId] = useState<string | null>(null);

  const ensureMemorySpace = useCallback(async () => {
    if (memorySpaceId) return memorySpaceId;

    try {
      const response = await fetch("/api/cortex/memory-space/ensure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ensure memory space: ${response.statusText}`);
      }

      const { memorySpaceId: id } = await response.json();
      setMemorySpaceId(id);
      return id;
    } catch (error) {
      console.error("[VoiceMemoryProvider] Failed to ensure memory space:", error);
      throw error;
    }
  }, [userId, memorySpaceId]);

  return (
    <VoiceMemoryContext.Provider value={{ memorySpaceId, ensureMemorySpace }}>
      {children}
    </VoiceMemoryContext.Provider>
  );
}

export function useVoiceMemoryContext() {
  const context = useContextReact(VoiceMemoryContext);
  if (!context) {
    throw new Error("useVoiceMemoryContext must be used within VoiceMemoryProvider");
  }
  return context;
}

/**
 * HAUS + Cortex Memory Hook (Web)
 *
 * Web hook that integrates Cortex memory with the HAUS voice agent:
 * - Remember voice searches and recall context
 * - Track property interactions
 * - Learn and recall suburb preferences
 *
 * These hooks call Convex functions directly (following Cortex SDK pattern):
 * - No wrapper API routes needed
 * - SDK connects directly to Convex backend
 *
 * @see apps/mobile/hooks/useCortexMemory.ts for React Native version
 */

import { useState, useCallback, useEffect } from "react"
import { useConvex } from "convex/react"
import { api } from "@v1/backend/convex/_generated/api"

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface VoiceMemory {
  content: string
  relevance: number
  timestamp?: number
}

export interface VoiceFact {
  fact: string
  confidence: number
  category?: string
  subject?: string
  object?: string
}

export interface SuburbPreference {
  suburbName: string
  state: string
  preferenceScore: number // -100 (avoid) to +100 (love)
  reasons?: string[]
}

export interface PropertyInteraction {
  propertyId: string
  propertyContext?: Record<string, unknown>
  interactionType: string
  queryText?: string
  timestamp: number
}

export interface RecallResult {
  memories: VoiceMemory[]
  facts: VoiceFact[]
  propertyInteractions: PropertyInteraction[]
  suburbPreferences: SuburbPreference[]
}

// -----------------------------------------------------------------------------
// useCortexMemory Hook
// -----------------------------------------------------------------------------

export interface UseCortexMemoryOptions {
  userId: string
  enabled?: boolean
}

export interface UseCortexMemoryReturn {
  // Ensure user has a memory space
  ensureMemorySpace: () => Promise<string | null>

  // Remember a voice search interaction
  rememberVoiceSearch: (params: {
    userQuery: string
    agentResponse: string
    propertyId?: string
    propertyContext?: Record<string, unknown>
  }) => Promise<{ success: boolean; conversationId?: string; error?: string }>

  // Recall relevant context for a query
  recallForQuery: (query: string, limit?: number) => Promise<RecallResult>

  // Store a user preference
  storePreference: (params: {
    category: string
    preference: string
    confidence: number
    metadata?: Record<string, unknown>
  }) => Promise<{ success: boolean; factId?: string; error?: string }>

  // Get user's preferences
  getPreferences: (category?: string) => Promise<{
    facts: VoiceFact[]
    suburbPreferences: SuburbPreference[]
  }>

  // Get property interaction history
  getPropertyHistory: (propertyId?: string) => Promise<PropertyInteraction[]>

  // Loading and error states
  isLoading: boolean
  error: Error | null
  memorySpaceId: string | null
}

export function useCortexMemory(
  options: UseCortexMemoryOptions
): UseCortexMemoryReturn {
  const { userId, enabled = true } = options
  const convex = useConvex()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [memorySpaceId, setMemorySpaceId] = useState<string | null>(null)

  // Ensure user has a memory space
  const ensureMemorySpace = useCallback(async (): Promise<string | null> => {
    if (!enabled) return null

    setIsLoading(true)
    setError(null)

    try {
      const result = await convex.mutation(api.cortex.ensureMemorySpace, {
        userId,
      })

      const spaceId = result?.memorySpaceId ?? null
      setMemorySpaceId(spaceId)
      return spaceId
    } catch (err) {
      const error = err as Error
      setError(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [convex, userId, enabled])

  // Remember a voice search interaction
  const rememberVoiceSearch = useCallback(
    async (params: {
      userQuery: string
      agentResponse: string
      propertyId?: string
      propertyContext?: Record<string, unknown>
    }): Promise<{ success: boolean; conversationId?: string; error?: string }> => {
      if (!enabled) {
        return { success: false, error: "Cortex memory disabled" }
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await convex.mutation(api.cortex.rememberVoiceSearch, {
          userId,
          userQuery: params.userQuery,
          agentResponse: params.agentResponse,
          propertyId: params.propertyId,
          propertyContext: params.propertyContext,
        })

        return {
          success: true,
          conversationId: result?.conversationId,
        }
      } catch (err) {
        const error = err as Error
        setError(error)
        return { success: false, error: error.message }
      } finally {
        setIsLoading(false)
      }
    },
    [convex, userId, enabled]
  )

  // Recall relevant context for a query
  const recallForQuery = useCallback(
    async (query: string, limit = 20): Promise<RecallResult> => {
      if (!enabled) {
        return {
          memories: [],
          facts: [],
          propertyInteractions: [],
          suburbPreferences: [],
        }
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await convex.query(api.cortex.recallForQuery, {
          userId,
          query,
          limit,
        })

        return {
          memories: result?.memories ?? [],
          facts: result?.facts ?? [],
          propertyInteractions: result?.propertyInteractions ?? [],
          suburbPreferences: result?.suburbPreferences ?? [],
        }
      } catch (err) {
        const error = err as Error
        setError(error)
        return {
          memories: [],
          facts: [],
          propertyInteractions: [],
          suburbPreferences: [],
        }
      } finally {
        setIsLoading(false)
      }
    },
    [convex, userId, enabled]
  )

  // Store a user preference
  const storePreference = useCallback(
    async (params: {
      category: string
      preference: string
      confidence: number
      metadata?: Record<string, unknown>
    }): Promise<{ success: boolean; factId?: string; error?: string }> => {
      if (!enabled) {
        return { success: false, error: "Cortex memory disabled" }
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await convex.mutation(api.cortex.storePreference, {
          userId,
          category: params.category,
          preference: params.preference,
          confidence: params.confidence,
          metadata: params.metadata,
        })

        return {
          success: true,
          factId: result?.factId,
        }
      } catch (err) {
        const error = err as Error
        setError(error)
        return { success: false, error: error.message }
      } finally {
        setIsLoading(false)
      }
    },
    [convex, userId, enabled]
  )

  // Get user's preferences
  const getPreferences = useCallback(
    async (category?: string): Promise<{
      facts: VoiceFact[]
      suburbPreferences: SuburbPreference[]
    }> => {
      if (!enabled) {
        return { facts: [], suburbPreferences: [] }
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await convex.query(api.cortex.getPreferences, {
          userId,
          category,
        })

        return {
          facts: result?.facts ?? [],
          suburbPreferences: result?.suburbPreferences ?? [],
        }
      } catch (err) {
        const error = err as Error
        setError(error)
        return { facts: [], suburbPreferences: [] }
      } finally {
        setIsLoading(false)
      }
    },
    [convex, userId, enabled]
  )

  // Get property interaction history
  const getPropertyHistory = useCallback(
    async (propertyId?: string): Promise<PropertyInteraction[]> => {
      if (!enabled) return []

      setIsLoading(true)
      setError(null)

      try {
        const result = await convex.query(api.cortex.getPropertyHistory, {
          userId,
          propertyId,
        })

        return result?.interactions ?? []
      } catch (err) {
        const error = err as Error
        setError(error)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [convex, userId, enabled]
  )

  // Ensure memory space on mount
  useEffect(() => {
    let mounted = true

    if (enabled && !memorySpaceId) {
      ensureMemorySpace().then(() => {
        // Only update state if component is still mounted
        if (!mounted) return
      })
    }

    return () => {
      mounted = false
    }
  }, [enabled, memorySpaceId, ensureMemorySpace])

  return {
    ensureMemorySpace,
    rememberVoiceSearch,
    recallForQuery,
    storePreference,
    getPreferences,
    getPropertyHistory,
    isLoading,
    error,
    memorySpaceId,
  }
}

// -----------------------------------------------------------------------------
// useConversationMemory Hook
// -----------------------------------------------------------------------------

/**
 * Hook that automatically remembers completed conversation turns
 *
 * Watches transcripts and when a user query + agent response pair is complete,
 * automatically stores them in Cortex memory.
 */
export interface UseConversationMemoryOptions extends UseCortexMemoryOptions {
  onConversationStored?: (conversationId: string) => void
}

export interface ConversationTurn {
  userQuery: string
  agentResponse: string
  propertyId?: string
  propertyContext?: Record<string, unknown>
}

export function useConversationMemory(
  options: UseConversationMemoryOptions
): {
  storeConversation: (turn: ConversationTurn) => Promise<void>
  isStoring: boolean
} {
  const { userId, enabled = true, onConversationStored } = options
  const [isStoring, setIsStoring] = useState(false)
  const cortex = useCortexMemory({ userId, enabled })

  const storeConversation = useCallback(
    async (turn: ConversationTurn) => {
      if (!enabled || !turn.userQuery || !turn.agentResponse) return

      setIsStoring(true)
      try {
        const result = await cortex.rememberVoiceSearch({
          userQuery: turn.userQuery,
          agentResponse: turn.agentResponse,
          propertyId: turn.propertyId,
          propertyContext: turn.propertyContext,
        })

        if (result.success && result.conversationId) {
          onConversationStored?.(result.conversationId)
        }
      } catch (error) {
        // Error is already captured by rememberVoiceSearch
        if (onConversationStored) {
          onConversationStored("")
        }
      } finally {
        setIsStoring(false)
      }
    },
    [cortex, enabled, onConversationStored]
  )

  return {
    storeConversation,
    isStoring,
  }
}

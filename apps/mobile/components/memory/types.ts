/**
 * Memory Types for React Native
 *
 * Shared types for Cortex memory UI components
 */

export interface VoiceMemory {
  content: string;
  relevance: number;
  timestamp?: number;
}

export interface VoiceFact {
  fact: string;
  confidence: number;
  category?: string;
  subject?: string;
  object?: string;
}

export interface SuburbPreference {
  suburbName: string;
  state: string;
  preferenceScore: number; // -100 (avoid) to +100 (love)
  reasons?: string[];
}

export interface PropertyInteraction {
  propertyId: string;
  propertyContext?: Record<string, unknown>;
  interactionType: string;
  queryText?: string;
  timestamp: number;
}

export interface RecallResult {
  memories: VoiceMemory[];
  facts: VoiceFact[];
  propertyInteractions: PropertyInteraction[];
  suburbPreferences: SuburbPreference[];
}

export interface MemoryContextPanelProps {
  suburbPreferences: SuburbPreference[];
  facts: VoiceFact[];
  propertyInteractions: PropertyInteraction[];
  memories: VoiceMemory[];
  isLoading?: boolean;
}

export interface MemoryQuickSummaryProps {
  suburbPreferences: SuburbPreference[];
  facts: VoiceFact[];
  onShowFullContext?: () => void;
}

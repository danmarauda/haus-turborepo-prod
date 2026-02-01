/**
 * Custom React Hooks
 * 
 * Shared hooks for the HAUS Mobile app
 */

// Network & Connectivity
export { useNetworkStatus } from './useNetworkStatus';

// Data & API
export { useFavorites } from './useFavorites';
export { useProperties } from './useProperties';

// AI & Memory
export { useCortexMemory } from './useCortexMemory';
export { useAIChat } from './useAIChat';

// Voice & Audio
export { useLivekitAudioVisualizer } from './useLivekitAudioVisualizer';

// Theme
export { useThemeColor } from './useThemeColor';

// Document Vault
export { useUpload, type UploadProgress, type UploadOptions, type UploadResult } from './useUpload';
export { 
  useImageAnalysis, 
  type PropertyAnalysis, 
  type PropertySummary,
  type AnalysisState,
  type UseImageAnalysisReturn 
} from './useImageAnalysis';

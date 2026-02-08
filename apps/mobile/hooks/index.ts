/**
 * Mobile Hooks
 * 
 * Custom React hooks for the HAUS mobile app
 */

// Voice & AI
export { useVoiceChat } from './useVoiceChat';
export { 
  useCortexMemory, 
  useConversationMemory,
  type UseCortexMemoryOptions,
  type UseCortexMemoryReturn,
  type RecallResult,
  type VoiceMemory,
  type VoiceFact,
  type SuburbPreference,
  type PropertyInteraction,
} from './useCortexMemory';
export { useVoiceTranscription } from './useVoiceTranscription';
export { useLivekitAudioVisualizer } from './useLivekitAudioVisualizer';
export { useAIChat } from './useAIChat';
export { useImageAnalysis } from './useImageAnalysis';

// Property
export { 
  useProperties, 
  useAllProperties,
  useOffMarketProperties,
  useProperty,
  usePropertySearch,
  usePropertiesBySuburb,
  usePropertiesByState,
  usePropertiesByType,
  useFilteredProperties,
  useFavoriteProperties,
  useFavoriteCount,
  useHasFavorites,
  propertyKeys,
  type PropertyFilters,
} from './useProperties';

// Real Property Data (Convex)
export {
  useRealProperties,
  useRealProperty,
  useRealPropertyById,
  useRecentProperties,
  usePropertiesBySuburbReal,
  realPropertyKeys,
  type RealPropertyFilters,
  type UseRealPropertiesOptions,
  type UseRealPropertiesReturn,
  type UseRealPropertyReturn,
  type ConvexPropertyType,
  type ConvexStatus,
} from './useRealProperties';

// Favorites
export { 
  useFavorites, 
  useFavoriteProperties as useFavoritesList,
  useFavoriteCount as useFavoritesCount,
  useHasFavorites as useHasAnyFavorites,
  usePropertyComparison,
  type UseFavoritesOptions,
  type UseFavoritesReturn,
} from './useFavorites';

// Search
export {
  usePropertySearch,
  type SearchFilters,
  type SavedSearch,
  type SearchHistoryItem,
  type UsePropertySearchOptions,
  type UsePropertySearchReturn,
} from './usePropertySearch';

// Compass/Map
export {
  useCompassListings,
  type Viewport,
  type Coordinate,
  type PropertyCluster,
  type UseCompassListingsOptions,
  type UseCompassListingsReturn,
} from './useCompassListings';

// UI
export { useThemeColor } from './useThemeColor';
export { useNetworkStatus } from './useNetworkStatus';

// Upload
export { useUpload } from './useUpload';

// Microphone
export { useMicrophoneControl } from './useMicControl';

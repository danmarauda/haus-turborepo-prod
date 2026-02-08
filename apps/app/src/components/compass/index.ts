// Compass Map Search Components
// Main container component with map and listings side panel
export { CompassContent } from "./CompassContent";

// Map component using MapLibre (wrapper around existing compass-map-view)
export { CompassMap, type CompassMapProps } from "./CompassMap";

// Side panel with property listings
export {
  CompassListingsPanel,
  type CompassListingsPanelProps,
} from "./CompassListingsPanel";

// Filter bar with property type, price, beds/baths
export { CompassFilters, type CompassFiltersProps } from "./CompassFilters";

// Legacy exports - re-export from existing components for backwards compatibility
export { CompassMapView } from "./compass-map-view";
export { CompassListingsSidebar } from "./compass-listings-sidebar";
export { CompassFloatingNavbar } from "./compass-floating-navbar";
export { CompassContent as LegacyCompassContent } from "./compass-content";

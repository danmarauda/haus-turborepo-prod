import { create } from "zustand";
import {
  type CompassListing,
  compassListings,
  type ListingMode,
  type PropertyType,
} from "@/lib/compass-mock-data";

// Re-export types from mock data for consumers
export type { CompassListing, PropertyType, ListingMode };

type SortBy =
  | "price-low"
  | "price-high"
  | "rating"
  | "newest"
  | "reviews"
  | "nearest";

type MapStyle = "default" | "streets" | "outdoors" | "satellite";

type CompassState = {
  // Listing mode
  listingMode: ListingMode;
  setListingMode: (mode: ListingMode) => void;

  // Listings data
  listings: CompassListing[];
  setListings: (listings: CompassListing[]) => void;

  // Search & filters
  searchQuery: string;
  selectedPropertyTypes: PropertyType[];
  priceRange: [number, number];
  bedrooms: number | null;
  bathrooms: number | null;
  parkingSpaces: number | null;

  // Sort
  sortBy: SortBy;

  // Selection
  selectedListingId: string | null;
  hoveredListingId: string | null;

  // Compare
  compareIds: string[];
  toggleCompare: (listingId: string) => void;
  clearCompare: () => void;
  getCompareListings: () => CompassListing[];

  // Map state
  mapCenter: { lat: number; lng: number };
  mapZoom: number;
  mapStyle: MapStyle;
  userLocation: { lat: number; lng: number } | null;

  // Actions
  setSearchQuery: (query: string) => void;
  togglePropertyType: (type: PropertyType) => void;
  setPriceRange: (range: [number, number]) => void;
  setBedrooms: (count: number | null) => void;
  setBathrooms: (count: number | null) => void;
  setParkingSpaces: (count: number | null) => void;
  setSortBy: (sort: SortBy) => void;
  toggleFavorite: (listingId: string) => void;
  selectListing: (listingId: string | null) => void;
  setHoveredListing: (listingId: string | null) => void;
  setMapCenter: (center: { lat: number; lng: number }) => void;
  setMapZoom: (zoom: number) => void;
  setMapStyle: (style: MapStyle) => void;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  getFilteredListings: () => CompassListing[];
  getFavoriteListings: () => CompassListing[];
  resetFilters: () => void;
};

// Default price ranges for different modes
const defaultPriceRanges: Record<ListingMode, [number, number]> = {
  rent: [200, 2000], // per week
  sale: [300_000, 5_000_000],
};

// Sydney CBD as default center
const defaultMapCenter = { lat: -33.8688, lng: 151.2093 };

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const useCompassStore = create<CompassState>((set, get) => ({
  // Initial state
  listingMode: "sale",
  listings: compassListings, // Initialize with mock data
  setListings: (listings) => set({ listings }),
  searchQuery: "",
  selectedPropertyTypes: [],
  priceRange: defaultPriceRanges.sale,
  bedrooms: null,
  bathrooms: null,
  parkingSpaces: null,
  sortBy: "price-low",
  selectedListingId: null,
  hoveredListingId: null,
  compareIds: [],
  mapCenter: defaultMapCenter,
  mapZoom: 12,
  mapStyle: "default",
  userLocation: null,

  // Actions
  setListingMode: (mode) =>
    set({
      listingMode: mode,
      priceRange: defaultPriceRanges[mode],
      selectedPropertyTypes: [],
      bedrooms: null,
      bathrooms: null,
      parkingSpaces: null,
      selectedListingId: null,
    }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  togglePropertyType: (type) =>
    set((state) => ({
      selectedPropertyTypes: state.selectedPropertyTypes.includes(type)
        ? state.selectedPropertyTypes.filter((t) => t !== type)
        : [...state.selectedPropertyTypes, type],
    })),

  setPriceRange: (range) => set({ priceRange: range }),

  setBedrooms: (count) => set({ bedrooms: count }),

  setBathrooms: (count) => set({ bathrooms: count }),

  setParkingSpaces: (count) => set({ parkingSpaces: count }),

  setSortBy: (sort) => set({ sortBy: sort }),

  toggleFavorite: (listingId) =>
    set((state) => ({
      listings: state.listings.map((listing) =>
        listing.id === listingId
          ? { ...listing, isFavorite: !listing.isFavorite }
          : listing
      ),
    })),

  selectListing: (listingId) => set({ selectedListingId: listingId }),

  setHoveredListing: (listingId) => set({ hoveredListingId: listingId }),

  toggleCompare: (listingId) =>
    set((state) => {
      if (state.compareIds.includes(listingId)) {
        return {
          compareIds: state.compareIds.filter((id) => id !== listingId),
        };
      }
      if (state.compareIds.length >= 4) {
        return state; // Max 4 properties to compare
      }
      return { compareIds: [...state.compareIds, listingId] };
    }),

  clearCompare: () => set({ compareIds: [] }),

  getCompareListings: () => {
    const state = get();
    return state.listings.filter((l) => state.compareIds.includes(l.id));
  },

  setMapCenter: (center) => set({ mapCenter: center }),

  setMapZoom: (zoom) => set({ mapZoom: zoom }),

  setMapStyle: (style) => set({ mapStyle: style }),

  setUserLocation: (location) => set({ userLocation: location }),

  resetFilters: () => {
    const state = get();
    set({
      searchQuery: "",
      selectedPropertyTypes: [],
      priceRange: defaultPriceRanges[state.listingMode],
      bedrooms: null,
      bathrooms: null,
      parkingSpaces: null,
      sortBy: "price-low",
    });
  },

  getFilteredListings: () => {
    const state = get();
    let filtered = state.listings.filter(
      (l) => l.listingMode === state.listingMode
    );

    // Search query
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(query) ||
          listing.suburb.toLowerCase().includes(query) ||
          listing.address.toLowerCase().includes(query) ||
          listing.postcode.includes(query)
      );
    }

    // Property types
    if (state.selectedPropertyTypes.length > 0) {
      filtered = filtered.filter((listing) =>
        state.selectedPropertyTypes.includes(listing.propertyType)
      );
    }

    // Price range
    filtered = filtered.filter(
      (listing) =>
        listing.price >= state.priceRange[0] &&
        listing.price <= state.priceRange[1]
    );

    // Bedrooms
    if (state.bedrooms !== null) {
      filtered = filtered.filter(
        (listing) => listing.bedrooms >= state.bedrooms!
      );
    }

    // Bathrooms
    if (state.bathrooms !== null) {
      filtered = filtered.filter(
        (listing) => listing.bathrooms >= state.bathrooms!
      );
    }

    // Parking
    if (state.parkingSpaces !== null) {
      filtered = filtered.filter(
        (listing) => (listing.parkingSpaces ?? 0) >= (state.parkingSpaces ?? 0)
      );
    }

    // Sorting
    switch (state.sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "reviews":
        filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      case "nearest":
        if (state.userLocation) {
          filtered.sort((a, b) => {
            const distA = calculateDistance(
              state.userLocation?.lat ?? 0,
              state.userLocation?.lng ?? 0,
              a.coordinates.lat,
              a.coordinates.lng
            );
            const distB = calculateDistance(
              state.userLocation?.lat ?? 0,
              state.userLocation?.lng ?? 0,
              b.coordinates.lat,
              b.coordinates.lng
            );
            return distA - distB;
          });
        }
        break;
    }

    // Move selected listing to top
    if (state.selectedListingId) {
      const selectedIndex = filtered.findIndex(
        (listing) => listing.id === state.selectedListingId
      );
      if (selectedIndex > 0) {
        const selected = filtered.splice(selectedIndex, 1)[0];
        filtered.unshift(selected);
      }
    }

    return filtered;
  },

  getFavoriteListings: () => {
    const state = get();
    return state.listings.filter(
      (listing) =>
        listing.isFavorite && listing.listingMode === state.listingMode
    );
  },
}));

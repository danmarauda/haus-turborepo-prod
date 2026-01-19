/**
 * HAUS Route Types and Definitions
 * Comprehensive type definitions for all application routes
 */

// =============================================================================
// ROUTE PATH DEFINITIONS
// =============================================================================

export const ROUTES = {
  // Core Pages
  HOME: '/',
  SEARCH: '/search',
  EXPLORE: '/explore',
  SAVED: '/saved',
  PROFILE: '/profile',
  LIST: '/list',

  // Product Lines
  DEEPHAUS: '/deephaus',
  WAREHAUS: '/warehaus',
  AGENCY: '/agency',
  COMPASS: '/compass',

  // Trust (DUD)
  TRUST: '/trust',

  // User Management
  DOCUMENTS: '/documents',
  MESSAGES: '/messages',
  PROPERTIES: '/properties',

  // Dynamic Routes
  PROPERTY: (id: string) => `/property/${id}` as const,
  SUBURB: (slug: string) => `/suburb/${slug}` as const,

  // Market Routes
  MARKET: '/market',
  MARKET_CATEGORY: (category: MarketCategory) => `/market/${category}` as const,
  MARKET_PROVIDER: (slug: string) => `/market/provider/${slug}` as const,
  MARKET_JOIN: '/market/join',
  MARKET_DASHBOARD: '/market/dashboard',
  MARKET_QUOTE: '/market/quote',
} as const;

// =============================================================================
// API ROUTE DEFINITIONS
// =============================================================================

export const API_ROUTES = {
  // Search
  SEARCH: '/api/search',
  VOICE_SEARCH: '/api/voice-search',
  PICA_VOICE_SEARCH: '/api/pica-voice-search',
  CEDAR_VOICE: '/api/cedar-voice',

  // Voice Processing
  TRANSCRIBE: '/api/transcribe',
  TTS: '/api/tts',

  // Data
  PROPERTY: (id: string) => `/api/property/${id}` as const,
  SUBURB: (slug: string) => `/api/suburb/${slug}` as const,
  MARKET_PROVIDERS: '/api/market/providers',

  // AI
  LISTING_AI: '/api/listing-ai',
  STYLE_RECOGNITION: '/api/style-recognition',
} as const;

// =============================================================================
// MARKET CATEGORIES
// =============================================================================

export const MARKET_CATEGORIES = [
  'conveyancing',
  'legal',
  'buyers-agent',
  'mortgage-broker',
  'building-inspection',
  'pest-inspection',
  'valuations',
  'surveying',
  'removalists',
  'cleaning',
  'landscaping',
  'renovation',
  'insurance',
] as const;

export type MarketCategory = (typeof MARKET_CATEGORIES)[number];

export const MARKET_CATEGORY_LABELS: Record<MarketCategory, string> = {
  'conveyancing': 'Conveyancing',
  'legal': 'Legal Services',
  'buyers-agent': 'Buyer\'s Agents',
  'mortgage-broker': 'Mortgage Brokers',
  'building-inspection': 'Building Inspection',
  'pest-inspection': 'Pest Inspection',
  'valuations': 'Property Valuations',
  'surveying': 'Surveying',
  'removalists': 'Removalists',
  'cleaning': 'Cleaning Services',
  'landscaping': 'Landscaping',
  'renovation': 'Renovation',
  'insurance': 'Insurance',
};

// =============================================================================
// ROUTE PARAMETER TYPES
// =============================================================================

export interface PropertyParams {
  id: string; // UUID format
}

export interface SuburbParams {
  slug: string; // Format: suburb-name-state (e.g., bondi-beach-nsw)
}

export interface MarketCategoryParams {
  category: MarketCategory;
}

export interface MarketProviderParams {
  slug: string; // Provider business slug
}

// =============================================================================
// SEARCH QUERY PARAMETERS
// =============================================================================

export interface SearchQueryParams {
  q?: string;
  location?: string;
  priceMin?: string;
  priceMax?: string;
  beds?: string;
  baths?: string;
  propertyType?: string;
  features?: string;
  sort?: 'price-asc' | 'price-desc' | 'newest' | 'relevance';
  page?: string;
  limit?: string;
}

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

// Search API
export interface SearchAPIRequest {
  query?: string;
  location?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  bedrooms?: number;
  bathrooms?: number;
  propertyTypes?: string[];
  features?: string[];
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'relevance';
  page?: number;
  limit?: number;
}

export interface SearchAPIResponse {
  success: boolean;
  data: {
    properties: PropertySearchResult[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
  meta?: {
    processingTime: number;
    cacheHit: boolean;
  };
}

export interface PropertySearchResult {
  id: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  price: number;
  priceDisplay: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  propertyType: string;
  images: string[];
  listingDate: string;
  agent?: {
    name: string;
    agency: string;
    phone: string;
  };
}

// Transcribe API
export interface TranscribeAPIRequest {
  audio: Blob | File;
  language?: string;
}

export interface TranscribeAPIResponse {
  success: boolean;
  data?: {
    text: string;
    confidence: number;
    language: string;
    duration: number;
  };
  error?: string;
}

// TTS API
export interface TTSAPIRequest {
  text: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number;
}

export interface TTSAPIResponse {
  success: boolean;
  data?: {
    audioUrl: string;
    duration: number;
  };
  error?: string;
}

// Property API
export interface PropertyAPIResponse {
  success: boolean;
  data?: {
    property: PropertyDetail;
    similarProperties: PropertySearchResult[];
    suburbStats: SuburbStats;
  };
  error?: string;
}

export interface PropertyDetail {
  id: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  price: number;
  priceDisplay: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  landSize?: number;
  buildingSize?: number;
  propertyType: string;
  description: string;
  features: string[];
  images: string[];
  floorplan?: string;
  virtualTour?: string;
  listingDate: string;
  lastUpdated: string;
  agent: {
    id: string;
    name: string;
    phone: string;
    email: string;
    photo: string;
    agency: {
      name: string;
      logo: string;
    };
  };
  location: {
    lat: number;
    lng: number;
  };
  inspectionTimes?: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface SuburbStats {
  medianPrice: number;
  medianRent: number;
  priceGrowth: number;
  daysOnMarket: number;
  totalListings: number;
}

// Suburb API
export interface SuburbAPIResponse {
  success: boolean;
  data?: {
    suburb: SuburbDetail;
    properties: PropertySearchResult[];
    demographics: Demographics;
  };
  error?: string;
}

export interface SuburbDetail {
  name: string;
  state: string;
  postcode: string;
  region: string;
  description: string;
  stats: SuburbStats;
  priceHistory: {
    year: number;
    medianPrice: number;
  }[];
  amenities: {
    schools: number;
    shops: number;
    restaurants: number;
    parks: number;
    hospitals: number;
  };
  transport: {
    trainStations: string[];
    busRoutes: string[];
    ferryTerminals: string[];
  };
}

export interface Demographics {
  population: number;
  medianAge: number;
  medianIncome: number;
  ownerOccupied: number;
  rented: number;
  familyHouseholds: number;
}

// Market Providers API
export interface MarketProvidersAPIRequest {
  category?: MarketCategory;
  location?: string;
  rating?: number;
  verified?: boolean;
  page?: number;
  limit?: number;
}

export interface MarketProvidersAPIResponse {
  success: boolean;
  data?: {
    providers: MarketProvider[];
    total: number;
    page: number;
    totalPages: number;
  };
  error?: string;
}

export interface MarketProvider {
  id: string;
  slug: string;
  name: string;
  category: MarketCategory;
  description: string;
  logo: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  featured: boolean;
  location: {
    suburb: string;
    state: string;
  };
  services: string[];
  pricing?: {
    type: 'fixed' | 'hourly' | 'quote';
    startingFrom?: number;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
}

// =============================================================================
// ROUTE METADATA
// =============================================================================

export interface RouteMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
}

export const ROUTE_METADATA: Record<string, RouteMetadata> = {
  '/': {
    title: 'HAUS | Find Your Perfect Home',
    description: 'Discover premium properties across Australia with AI-powered voice search, virtual tours, and expert support.',
    keywords: ['real estate', 'property', 'homes', 'australia', 'buy', 'rent'],
  },
  '/search': {
    title: 'Search Properties | HAUS',
    description: 'Search thousands of properties with advanced filters, voice search, and AI-powered recommendations.',
  },
  '/explore': {
    title: 'Explore Suburbs | HAUS',
    description: 'Discover neighborhoods and suburbs across Australia. View demographics, amenities, and property trends.',
  },
  '/trust': {
    title: 'DUD - Property Trust Score | HAUS',
    description: 'Verify property listings with our comprehensive trust scoring system. Check seller verification, document authenticity, and listing history.',
  },
  '/documents': {
    title: 'My Documents | HAUS',
    description: 'Manage your property documents, contracts, and important files securely in one place.',
  },
  '/messages': {
    title: 'Messages | HAUS',
    description: 'Communicate with agents, sellers, and service providers directly through HAUS.',
  },
  '/properties': {
    title: 'My Properties | HAUS',
    description: 'Track and manage your property portfolio, saved searches, and interested properties.',
  },
  '/market': {
    title: 'MARKET - Professional Services | HAUS',
    description: 'Find trusted conveyancers, mortgage brokers, building inspectors, and other property professionals.',
  },
  '/deephaus': {
    title: 'DEEPHAUS - Luxury Properties | HAUS',
    description: 'Explore premium and luxury properties across Australia\'s most prestigious locations.',
  },
  '/warehaus': {
    title: 'WAREHAUS - Commercial & Industrial | HAUS',
    description: 'Find warehouses, industrial facilities, and commercial properties for lease or purchase.',
  },
};

// =============================================================================
// NAVIGATION STRUCTURE
// =============================================================================

export interface NavItem {
  href: string;
  label: string;
  icon?: string;
  badge?: string;
  children?: NavItem[];
}

export const MAIN_NAVIGATION: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/search', label: 'Search' },
  { href: '/saved', label: 'Saved' },
  { href: '/deephaus', label: 'DEEPHAUS' },
  { href: '/warehaus', label: 'WAREHAUS' },
  { href: '/agency', label: 'HAUS.AGENCY' },
  { href: '/market', label: 'MARKET' },
  { href: '/trust', label: 'DUD', badge: 'NEW' },
  { href: '/compass', label: 'Compass' },
];

export const USER_NAVIGATION: NavItem[] = [
  { href: '/profile', label: 'Profile' },
  { href: '/documents', label: 'Documents' },
  { href: '/messages', label: 'Messages' },
  { href: '/properties', label: 'My Properties' },
  { href: '/saved', label: 'Saved Properties' },
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function isValidMarketCategory(category: string): category is MarketCategory {
  return MARKET_CATEGORIES.includes(category as MarketCategory);
}

export function isValidPropertyId(id: string): boolean {
  // UUID v4 format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function isValidSuburbSlug(slug: string): boolean {
  // Format: suburb-name-state (e.g., bondi-beach-nsw)
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*-(?:nsw|vic|qld|wa|sa|tas|nt|act)$/i;
  return slugRegex.test(slug);
}

export function parseSuburbSlug(slug: string): { suburb: string; state: string } | null {
  if (!isValidSuburbSlug(slug)) return null;
  
  const parts = slug.split('-');
  const state = parts.pop()!.toUpperCase();
  const suburb = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  
  return { suburb, state };
}

export function createSuburbSlug(suburb: string, state: string): string {
  return `${suburb.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`;
}


export enum PropertyStatus {
  ForSale = "FOR SALE",
  Auction = "AUCTION",
  Sold = "SOLD",
  PrivateTreaty = "PRIVATE TREATY",
  PreMarket = "PRE-MARKET"
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface InvestmentMetrics {
  yield: number;
  growthPotential: 'High' | 'Medium' | 'Steady';
  rentalEstimate: string;
}

export interface Property {
  id: string;
  // Address fields
  address: string;
  title?: string; // Optional display title
  suburb: string;
  state: 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'NT' | 'ACT';
  postcode: string;
  // Property details
  price: string;
  beds: number;
  baths: number;
  cars: number;
  sqm: number;
  description: string;
  status: PropertyStatus;
  // Images
  thumbnail: string;
  imageUrl?: string; // Alias for thumbnail for component compatibility
  images: string[];
  // Location
  coordinates: Coordinates;
  lat?: number; // Shorthand for coordinates.lat (for component compatibility)
  lng?: number; // Shorthand for coordinates.lng (for component compatibility)
  // Features
  amenities: string[];
  metrics: InvestmentMetrics;
}

export interface AgentState {
  isLive: boolean;
  isThinking: boolean;
  activeThought?: string;
  mode: 'idle' | 'conversation' | 'deep-search' | 'vision';
}

export interface MapViewState {
  center: Coordinates;
  zoom: number;
}

export interface MapLayerConfig {
  style: 'roadmap' | 'satellite' | 'terrain';
  showTraffic: boolean;
}

export interface InvestmentAnalysis {
  valuation: string;
  growth_forecast_5y: string;
  pros: string[];
  cons: string[];
  verdict: string;
}

// Voice Search Types
export interface SearchParams {
  location?: string;
  propertyType?: string;
  listingType?: 'For Sale' | 'For Rent';
  priceMin?: number;
  priceMax?: number;
  bedroomsMin?: number;
  bathroomsMin?: number;
  squareFootageMin?: number;
  squareFootageMax?: number;
  amenities?: string[];
}

export type VoiceSearchStatus = "idle" | "listening" | "processing" | "done";

export interface VoiceSessionState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  volume: number;
  status: VoiceSearchStatus;
}

export interface VoiceCopilotProps {
  onResults: (results: any[], params: SearchParams) => void;
  onClose: () => void;
}

// Gemini Live API Types
export interface GeminiLiveConfig {
  model: string;
  apiKey: string;
  systemInstruction?: string;
  tools?: any[];
}

export interface AudioVisualizerConfig {
  size?: number;
  accentColor?: string;
  mode?: 'orb' | 'wave' | 'bars';
  volumeLevel?: number;
  frequencyData?: Uint8Array;
}

export interface SearchParams {
  query?: string;
  suburb?: string;
  state?: string;
  priceMin?: number;
  priceMax?: number;
  bedsMin?: number;
  bathsMin?: number;
  carsMin?: number;
  propertyType?: string;
  status?: PropertyStatus;
}

export interface VoiceSearchResult {
  query: string;
  params: SearchParams;
  confidence: number;
}

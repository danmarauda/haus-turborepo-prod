export interface SearchParameters {
  location?: string
  propertyType?: "house" | "apartment" | "condo" | "townhouse" | "loft" | "studio" | "penthouse" | "duplex"
  listingType?: "for-sale" | "for-rent" | "sold" | "off-market"
  priceRange?: {
    min?: number
    max?: number
  }
  bedrooms?: number
  bathrooms?: number
  squareFootage?: {
    min?: number
    max?: number
  }
  lotSize?: {
    min?: number
    max?: number
  }
  yearBuilt?: {
    min?: number
    max?: number
  }
  amenities?: AmenityType[]
  features?: PropertyFeature[]
  schoolDistrict?: string
  walkScore?: number
  transitScore?: number
  hoaFees?: {
    min?: number
    max?: number
  }
  propertyTax?: {
    min?: number
    max?: number
  }
  condition?: PropertyCondition
  occupancyStatus?: "owner-occupied" | "tenant-occupied" | "vacant"
  virtualTourAvailable?: boolean
  openHouseScheduled?: boolean
  newListing?: boolean // Listed within last 7 days
  priceReduced?: boolean
}

export type AmenityType =
  | "pool"
  | "spa"
  | "gym"
  | "tennis-court"
  | "basketball-court"
  | "garage"
  | "carport"
  | "covered-parking"
  | "guest-parking"
  | "garden"
  | "backyard"
  | "front-yard"
  | "balcony"
  | "terrace"
  | "deck"
  | "fireplace"
  | "air-conditioning"
  | "heating"
  | "dishwasher"
  | "laundry"
  | "walk-in-closet"
  | "built-in-wardrobes"
  | "study"
  | "office"
  | "security-system"
  | "intercom"
  | "elevator"
  | "concierge"
  | "pet-friendly"
  | "furnished"
  | "unfurnished"
  | "solar-panels"
  | "energy-efficient"
  | "smart-home"

export type PropertyFeature =
  | "corner-lot"
  | "cul-de-sac"
  | "waterfront"
  | "mountain-view"
  | "city-view"
  | "gated-community"
  | "new-construction"
  | "recently-renovated"
  | "historic"
  | "architectural-significance"
  | "eco-friendly"
  | "wheelchair-accessible"
  | "single-story"
  | "multi-story"
  | "basement"
  | "attic"
  | "wine-cellar"
  | "home-theater"

export type PropertyCondition = "excellent" | "good" | "fair" | "needs-work" | "fixer-upper"

export interface Property {
  id: string
  title: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  squareFootage: number
  propertyType: string
  listingType: "for-sale" | "for-rent" | "sold" | "off-market"
  imageUrl: string
  amenities: AmenityType[]
  description: string
  yearBuilt?: number
  lotSize?: number
  features?: PropertyFeature[]
  condition?: PropertyCondition
  hoaFees?: number
  propertyTax?: number
  schoolDistrict?: string
  walkScore?: number
  transitScore?: number
  occupancyStatus?: "owner-occupied" | "tenant-occupied" | "vacant"
  virtualTourUrl?: string
  openHouseDate?: string
  listingDate?: string
  lastPriceChange?: {
    date: string
    previousPrice: number
    currentPrice: number
  }
  coordinates?: {
    lat: number
    lng: number
  }
  agent?: {
    name: string
    phone: string
    email: string
    agency: string
  }
}

export interface VoiceSearchResult {
  parameters: SearchParameters
  sourceText: string
  confidence: number
  parameterSources?: {
    [key: string]: string // Maps parameter to source text fragment
  }
}

export interface SearchResultMetadata {
  totalResults: number
  searchTime: number
  appliedFilters: string[]
  suggestedRefinements?: string[]
  averagePrice?: number
  priceRange?: {
    min: number
    max: number
  }
}

export interface PropertySearchResponse {
  properties: Property[]
  metadata: SearchResultMetadata
  voiceSearchResult?: VoiceSearchResult
}

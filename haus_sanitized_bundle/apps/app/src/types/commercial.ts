export type CommercialPropertyType =
  | "office"
  | "retail"
  | "industrial"
  | "warehouse"
  | "mixed-use"
  | "medical"
  | "hospitality"
  | "land"

export type ZoningType =
  | "commercial"
  | "industrial"
  | "mixed-use"
  | "retail"
  | "light-industrial"
  | "heavy-industrial"
  | "office"
  | "special-purpose"

export type LeaseType = "gross" | "net" | "triple-net" | "modified-gross" | "percentage"

export interface CommercialProperty {
  id: string
  title: string
  address: string
  suburb: string
  state: string
  postcode: string
  propertyType: CommercialPropertyType
  listingType: "for-sale" | "for-lease" | "sold" | "leased"
  price?: number
  pricePerSqm?: number
  leasePrice?: number
  leaseType?: LeaseType
  leaseTerm?: string
  outgoings?: number

  // Commercial-specific metrics
  totalArea: number // sqm
  floorArea?: number
  landArea?: number
  ceilingHeight?: number // meters
  loadingDocks?: number
  containerAccess?: boolean
  craneCapacity?: number // tonnes
  powerSupply?: string
  floors?: number
  parkingSpaces?: number

  // Building features
  airConditioning?: boolean
  sprinklerSystem?: boolean
  securitySystem?: boolean
  receptionArea?: boolean
  kitchenette?: boolean
  showers?: boolean
  disabledAccess?: boolean

  // Zoning & permits
  zoning: ZoningType
  councilApproved?: boolean
  permitReady?: boolean

  // Images and media
  imageUrl: string
  images?: string[]
  floorPlan?: string
  virtualTour?: string

  // Listing details
  description: string
  highlights?: string[]
  availableFrom?: string
  lastUpdated: string

  // Agent
  agent: {
    name: string
    company: string
    phone: string
    email: string
    image?: string
  }

  // Location
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface CommercialSearchFilters {
  propertyType?: CommercialPropertyType[]
  listingType?: ("for-sale" | "for-lease")[]
  priceRange?: { min?: number; max?: number }
  areaRange?: { min?: number; max?: number }
  zoning?: ZoningType[]
  location?: string
  features?: {
    loadingDocks?: boolean
    containerAccess?: boolean
    airConditioning?: boolean
    parkingSpaces?: number
    ceilingHeight?: number
  }
}

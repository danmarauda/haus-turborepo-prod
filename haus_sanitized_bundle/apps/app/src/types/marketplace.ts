// Service Provider Types for HAUS Marketplace

export type ServiceCategory =
  | "conveyancing"
  | "buyers-agent"
  | "mortgage-broker"
  | "property-lawyer"
  | "building-inspection"
  | "pest-inspection"
  | "strata-inspection"
  | "removalist"
  | "cleaning"
  | "styling"
  | "photography"
  | "valuation"
  | "surveyor"
  | "insurance"
  | "property-management"
  | "renovation"

export type VerificationLevel = "verified" | "premium" | "elite"

export type BadgeType =
  | "haus-verified"
  | "top-rated"
  | "fast-response"
  | "highly-recommended"
  | "price-match"
  | "satisfaction-guarantee"

export interface ServiceProvider {
  id: string
  businessName: string
  slug: string
  category: ServiceCategory
  subcategories?: string[]
  description: string
  shortDescription: string
  logoUrl: string
  coverImageUrl?: string
  verificationLevel: VerificationLevel
  badges: BadgeType[]
  rating: number
  reviewCount: number
  completedJobs: number
  responseTime: string // e.g., "< 2 hours"
  yearsInBusiness: number
  location: {
    city: string
    state: string
    suburbs: string[]
    serviceRadius?: number // km
  }
  pricing: {
    type: "fixed" | "quote" | "hourly" | "percentage"
    startingFrom?: number
    currency: string
    description?: string
  }
  contact: {
    phone: string
    email: string
    website?: string
  }
  operatingHours: {
    weekdays: string
    weekends: string
  }
  languages: string[]
  licenses: {
    name: string
    number: string
    verifiedAt: string
  }[]
  insurance: {
    type: string
    coverage: number
    verifiedAt: string
  }[]
  teamSize?: number
  featured?: boolean
  availableForUrgent?: boolean
  createdAt: string
  lastActiveAt: string
}

export interface ServiceCategoryInfo {
  id: ServiceCategory
  name: string
  description: string
  icon: string
  providerCount: number
  averageRating: number
  priceRange: string
  popularServices: string[]
}

export interface Review {
  id: string
  providerId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  content: string
  propertyType?: string
  serviceDate: string
  createdAt: string
  verified: boolean
  helpful: number
  response?: {
    content: string
    respondedAt: string
  }
}

export interface QuoteRequest {
  id: string
  userId: string
  category: ServiceCategory
  propertyAddress: string
  propertyType: string
  description: string
  preferredDate?: string
  urgency: "flexible" | "within-week" | "urgent"
  budget?: {
    min: number
    max: number
  }
  attachments?: string[]
  selectedProviders?: string[]
  status: "pending" | "quoted" | "accepted" | "completed" | "cancelled"
  createdAt: string
}

export interface Quote {
  id: string
  requestId: string
  providerId: string
  provider: ServiceProvider
  price: number
  breakdown?: {
    item: string
    amount: number
  }[]
  validUntil: string
  estimatedCompletion: string
  notes?: string
  status: "pending" | "accepted" | "declined" | "expired"
  createdAt: string
}

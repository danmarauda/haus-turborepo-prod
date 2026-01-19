export interface Agent {
  id: string
  name: string
  title: string
  agency: Agency
  image: string
  bio: string
  specializations: string[]
  languages: string[]
  serviceAreas: string[]

  // Contact
  phone: string
  email: string

  // Performance metrics
  totalSales: number
  propertiesSold: number
  avgDaysOnMarket: number
  listToSaleRatio: number

  // Ratings
  rating: number
  reviewCount: number

  // Social
  linkedIn?: string
  instagram?: string

  // Verification
  licenseNumber: string
  licenseVerified: boolean
  hausVerified: boolean

  // Activity
  activeListings: number
  recentSales: number
  joinedDate: string
}

export interface Agency {
  id: string
  name: string
  logo: string
  description: string
  website?: string
  phone: string
  email: string
  address: string

  // Stats
  totalAgents: number
  totalSales: number
  activeListings: number
  avgRating: number
  reviewCount: number

  // Coverage
  serviceAreas: string[]
  specializations: string[]

  // Verification
  licenseNumber: string
  verified: boolean

  // Founded
  foundedYear: number
}

export interface AgentReview {
  id: string
  agentId: string
  authorName: string
  authorImage?: string
  rating: number
  title: string
  content: string
  date: string
  transactionType: "buyer" | "seller" | "landlord" | "tenant"
  propertyType: string
  verified: boolean
}

export interface AppraisalRequest {
  propertyAddress: string
  propertyType: string
  bedrooms?: number
  bathrooms?: number
  ownerName: string
  email: string
  phone: string
  preferredTime?: string
  additionalNotes?: string
}

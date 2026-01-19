// HAUS Voice Search Types
export interface Property {
  id: number
  title: string
  location: string
  price: string
  bedrooms: number
  bathrooms: number
  area: string
  image: string
  description: string
  amenities: string[]
  propertyType: string
}

export interface SearchParams {
  location: {
    value: string
    sourceText: string[]
  }
  propertyType: {
    value: string
    sourceText: string[]
  }
  priceRange: {
    value: string
    sourceText: string[]
  }
  bedrooms: {
    value: string
    sourceText: string[]
  }
  bathrooms: {
    value: string
    sourceText: string[]
  }
  amenities: {
    value: string[]
    sourceText: string[]
  }
}

export type SearchStatus = "demo" | "listening" | "processing" | "done"

export interface VoiceCopilotProps {
  onResults: (results: Property[], params: SearchParams) => void
}

export interface HeroProps {
  onPropertyClick: (property: Property) => void
  savedProperties: Set<number>
  onToggleSave: (propertyId: number) => void
}

export interface PropertyCardProps {
  property: Property
  onClick: (property: Property) => void
  isSaved: boolean
  onToggleSave: (propertyId: number) => void
}

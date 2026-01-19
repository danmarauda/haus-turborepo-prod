import type { Property, SearchParameters, AmenityType, PropertyFeature, PropertyCondition } from "@/types/property"

const PROPERTY_TYPES = ["house", "apartment", "condo", "townhouse", "loft", "studio", "penthouse", "duplex"]
const LOCATIONS = [
  "Sydney CBD",
  "Melbourne CBD",
  "Brisbane CBD",
  "Perth CBD",
  "Bondi Beach",
  "St Kilda",
  "Surfers Paradise",
  "Fremantle",
  "Paddington",
  "Fitzroy",
  "New Farm",
  "Cottesloe",
  "Surry Hills",
  "South Yarra",
  "Toorak",
  "Double Bay",
  "Manly",
  "Cronulla",
  "Parramatta",
  "Chatswood",
]

const AMENITIES: AmenityType[] = [
  "pool",
  "spa",
  "gym",
  "tennis-court",
  "garage",
  "carport",
  "covered-parking",
  "garden",
  "backyard",
  "balcony",
  "terrace",
  "fireplace",
  "air-conditioning",
  "heating",
  "dishwasher",
  "laundry",
  "walk-in-closet",
  "built-in-wardrobes",
  "study",
  "security-system",
  "intercom",
  "elevator",
  "pet-friendly",
  "furnished",
  "solar-panels",
  "smart-home",
]

const PROPERTY_FEATURES: PropertyFeature[] = [
  "corner-lot",
  "waterfront",
  "mountain-view",
  "city-view",
  "gated-community",
  "new-construction",
  "recently-renovated",
  "wheelchair-accessible",
  "single-story",
  "basement",
  "wine-cellar",
]

const CONDITIONS: PropertyCondition[] = ["excellent", "good", "fair", "needs-work"]

const SCHOOL_DISTRICTS = [
  "Sydney Grammar School Zone",
  "Melbourne High School Zone",
  "Brisbane State High Zone",
  "Perth Modern School Zone",
  "North Sydney Boys Zone",
  "Mac.Robertson Girls Zone",
]

const AGENTS = [
  { name: "Sarah Mitchell", phone: "+61 2 9876 5432", email: "sarah@realestate.com.au", agency: "Premium Properties" },
  { name: "David Chen", phone: "+61 3 8765 4321", email: "david@luxuryrealty.com.au", agency: "Luxury Realty Group" },
  {
    name: "Emma Thompson",
    phone: "+61 7 7654 3210",
    email: "emma@coastalproperties.com.au",
    agency: "Coastal Properties",
  },
  {
    name: "Michael Rodriguez",
    phone: "+61 8 6543 2109",
    email: "michael@westcoastrealty.com.au",
    agency: "West Coast Realty",
  },
  { name: "Lisa Wang", phone: "+61 2 5432 1098", email: "lisa@harbourview.com.au", agency: "Harbour View Real Estate" },
]

export function generateMockProperties(params: SearchParameters, count = 12): Property[] {
  const properties: Property[] = []

  for (let i = 0; i < count; i++) {
    const propertyType = params.propertyType || PROPERTY_TYPES[Math.floor(Math.random() * PROPERTY_TYPES.length)] || "house"
    const location = params.location || LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)] || "Sydney CBD"
    const bedrooms = params.bedrooms || Math.floor(Math.random() * 4) + 1
    const bathrooms = params.bathrooms || Math.floor(Math.random() * 3) + 1
    const squareFootage = params.squareFootage?.min || Math.floor(Math.random() * 200) + 50
    const yearBuilt = params.yearBuilt?.min || 2024 - Math.floor(Math.random() * 30)
    const condition = params.condition || CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)] || "good"

    // Generate realistic price based on location and size
    const basePrice =
      location.includes("CBD") || location.includes("Toorak") || location.includes("Double Bay")
        ? 1200000
        : location.includes("Bondi") || location.includes("Manly")
          ? 1000000
          : 700000
    const price = basePrice + squareFootage * 1200 + bedrooms * 80000 + (2024 - yearBuilt) * -5000

    const selectedAmenities = AMENITIES.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 8) + 3)
    const selectedFeatures = PROPERTY_FEATURES.sort(() => 0.5 - Math.random()).slice(
      0,
      Math.floor(Math.random() * 4) + 1,
    )
    const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)] ?? AGENTS[0]!

    // Generate realistic dates
    const listingDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    const openHouseDate =
      Math.random() > 0.7 ? new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString() : undefined

    // Generate price change data for some properties
    const hasPriceChange = Math.random() > 0.8
    const lastPriceChange = hasPriceChange
      ? {
          date: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
          previousPrice: price + Math.floor(Math.random() * 100000) + 50000,
          currentPrice: price,
        }
      : undefined

    const property: Property = {
      id: `prop-${i + 1}`,
      title: `${bedrooms} Bed ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} in ${location}`,
      price: params.listingType === "for-rent" ? Math.floor(price / 200) : price,
      location,
      bedrooms,
      bathrooms,
      squareFootage,
      propertyType,
      listingType: params.listingType || (Math.random() > 0.8 ? "for-rent" : "for-sale"),
      imageUrl: `https://picsum.photos/600/400?random=${i + 1}`,
      amenities: selectedAmenities,
      description: `Beautiful ${propertyType} featuring modern finishes, premium location, and exceptional lifestyle amenities. This property offers the perfect blend of comfort and convenience in one of ${location}'s most sought-after areas.`,
      yearBuilt,
      lotSize: Math.floor(Math.random() * 800) + 300,
      features: selectedFeatures,
      condition,
      hoaFees: Math.random() > 0.6 ? Math.floor(Math.random() * 800) + 200 : undefined,
      propertyTax: Math.floor(price * 0.01) + Math.floor(Math.random() * 5000),
      schoolDistrict: SCHOOL_DISTRICTS[Math.floor(Math.random() * SCHOOL_DISTRICTS.length)] ?? "Sydney Grammar School Zone",
      walkScore: Math.floor(Math.random() * 40) + 60,
      transitScore: Math.floor(Math.random() * 50) + 40,
      occupancyStatus: Math.random() > 0.7 ? "vacant" : Math.random() > 0.5 ? "owner-occupied" : "tenant-occupied",
      virtualTourUrl: Math.random() > 0.6 ? `https://virtualtour.example.com/property-${i + 1}` : undefined,
      openHouseDate,
      listingDate,
      lastPriceChange,
      coordinates: {
        lat: -33.8688 + (Math.random() - 0.5) * 0.5,
        lng: 151.2093 + (Math.random() - 0.5) * 0.5,
      },
      agent,
    }

    properties.push(property)
  }

  return properties.sort((a, b) => {
    if (a.lastPriceChange && !b.lastPriceChange) return -1
    if (!a.lastPriceChange && b.lastPriceChange) return 1

    const aIsNew = a.listingDate && new Date(a.listingDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const bIsNew = b.listingDate && new Date(b.listingDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    if (aIsNew && !bIsNew) return -1
    if (!aIsNew && bIsNew) return 1

    return 0
  })
}

export function filterProperties(properties: Property[], params: SearchParameters): Property[] {
  return properties.filter((property) => {
    // Basic filters
    if (params.location && !property.location.toLowerCase().includes(params.location.toLowerCase())) return false
    if (params.propertyType && property.propertyType !== params.propertyType) return false
    if (params.listingType && property.listingType !== params.listingType) return false
    if (params.bedrooms && property.bedrooms < params.bedrooms) return false
    if (params.bathrooms && property.bathrooms < params.bathrooms) return false

    // Price range
    if (params.priceRange) {
      if (params.priceRange.min && property.price < params.priceRange.min) return false
      if (params.priceRange.max && property.price > params.priceRange.max) return false
    }

    // Square footage
    if (params.squareFootage) {
      if (params.squareFootage.min && property.squareFootage < params.squareFootage.min) return false
      if (params.squareFootage.max && property.squareFootage > params.squareFootage.max) return false
    }

    // Year built
    if (params.yearBuilt) {
      if (params.yearBuilt.min && property.yearBuilt && property.yearBuilt < params.yearBuilt.min) return false
      if (params.yearBuilt.max && property.yearBuilt && property.yearBuilt > params.yearBuilt.max) return false
    }

    // Amenities - property must have all requested amenities
    if (params.amenities && params.amenities.length > 0) {
      const hasAllAmenities = params.amenities.every((amenity) => property.amenities.includes(amenity))
      if (!hasAllAmenities) return false
    }

    // Features - property must have all requested features
    if (params.features && params.features.length > 0) {
      const hasAllFeatures = params.features.every((feature) => property.features?.includes(feature))
      if (!hasAllFeatures) return false
    }

    // Condition
    if (params.condition && property.condition !== params.condition) return false

    // HOA fees
    if (params.hoaFees) {
      if (params.hoaFees.max && property.hoaFees && property.hoaFees > params.hoaFees.max) return false
    }

    // Property tax
    if (params.propertyTax) {
      if (params.propertyTax.max && property.propertyTax && property.propertyTax > params.propertyTax.max) return false
    }

    // Virtual tour availability
    if (params.virtualTourAvailable && !property.virtualTourUrl) return false

    // Open house scheduled
    if (params.openHouseScheduled && !property.openHouseDate) return false

    // New listing (within last 7 days)
    if (params.newListing) {
      const isNew =
        property.listingDate && new Date(property.listingDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      if (!isNew) return false
    }

    // Price reduced
    if (params.priceReduced && !property.lastPriceChange) return false

    return true
  })
}

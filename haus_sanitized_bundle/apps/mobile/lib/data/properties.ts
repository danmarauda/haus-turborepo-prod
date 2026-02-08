/**
 * Property Data - Mock property listings for development and testing
 * 
 * This file contains mock property data that can be used during development
 * and for testing. In production, properties would be fetched from Convex backend.
 */

import type { Property } from '../../types/property';

export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Modern Waterfront Apartment",
    description: "Stunning waterfront apartment with panoramic views of Sydney Harbour. This luxurious 3-bedroom apartment features high-end finishes, floor-to-ceiling windows, and a spacious balcony perfect for entertaining.",
    type: "apartment",
    listingType: "sale",
    location: {
      address: "42 Circular Quay West",
      suburb: "Sydney",
      state: "NSW",
      postcode: "2000",
      latitude: -33.8568,
      longitude: 151.2153,
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      parkingSpaces: 2,
      buildingSize: 180,
      hasBalcony: true,
      hasAirConditioning: true,
    },
    media: [
      {
        id: "1-1",
        type: "image",
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        description: "Exterior view",
      },
      {
        id: "1-2",
        type: "image",
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        description: "Living room",
      },
      {
        id: "1-3",
        type: "image",
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        description: "Kitchen",
      },
    ],
    price: {
      amount: 2500000,
      currency: "AUD",
      type: "fixed",
    },
    agent: {
      id: "a1",
      name: "Sarah Johnson",
      phone: "0412 345 678",
      email: "sarah.j@hausrealty.com.au",
      agency: "HAUS Realty",
      profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=688&q=80",
    },
    isNew: true,
    isPremium: true,
    createdAt: "2025-07-10T08:00:00Z",
    updatedAt: "2025-07-10T08:00:00Z",
  },
  {
    id: "2",
    title: "Family Home in Bayside Melbourne",
    description: "Beautiful family home in Brighton with 4 bedrooms, modern kitchen, and landscaped garden. Close to schools, parks, and the beach.",
    type: "house",
    listingType: "sale",
    location: {
      address: "15 Bay Street",
      suburb: "Brighton",
      state: "VIC",
      postcode: "3186",
      latitude: -37.9083,
      longitude: 145.0028,
    },
    features: {
      bedrooms: 4,
      bathrooms: 2.5,
      parkingSpaces: 2,
      landSize: 650,
      buildingSize: 240,
      yearBuilt: 2018,
      hasPool: true,
      hasAirConditioning: true,
      hasGarden: true,
    },
    media: [
      {
        id: "2-1",
        type: "image",
        url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        description: "Front view",
      },
      {
        id: "2-2",
        type: "image",
        url: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        description: "Backyard with pool",
      },
    ],
    price: {
      amount: 1850000,
      currency: "AUD",
      type: "fixed",
    },
    agent: {
      id: "a2",
      name: "Michael Chen",
      phone: "0433 987 654",
      email: "michael.c@hausrealty.com.au",
      agency: "HAUS Realty",
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    },
    createdAt: "2025-07-08T10:30:00Z",
    updatedAt: "2025-07-08T10:30:00Z",
  },
  {
    id: "3",
    title: "Luxury Penthouse in Brisbane CBD",
    description: "Exclusive penthouse with breathtaking city views, private rooftop terrace, and premium finishes throughout. The epitome of luxury living in Brisbane's vibrant CBD.",
    type: "apartment",
    listingType: "sale",
    location: {
      address: "120 Eagle Street",
      suburb: "Brisbane",
      state: "QLD",
      postcode: "4000",
      latitude: -27.4698,
      longitude: 153.0251,
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      parkingSpaces: 3,
      buildingSize: 320,
      hasBalcony: true,
      hasAirConditioning: true,
    },
    media: [
      {
        id: "3-1",
        type: "image",
        url: "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1171&q=80",
        description: "Living area with city views",
      },
      {
        id: "3-2",
        type: "image",
        url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        description: "Master bedroom",
      },
    ],
    price: {
      amount: 3200000,
      currency: "AUD",
      type: "fixed",
    },
    agent: {
      id: "a3",
      name: "Emma Wilson",
      phone: "0455 123 456",
      email: "emma.w@hausrealty.com.au",
      agency: "HAUS Realty",
      profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=761&q=80",
    },
    isPremium: true,
    createdAt: "2025-07-05T14:15:00Z",
    updatedAt: "2025-07-05T14:15:00Z",
  },
  {
    id: "4",
    title: "Beachfront Townhouse in Perth",
    description: "Stunning beachfront townhouse with direct beach access. Enjoy breathtaking ocean views from multiple balconies in this modern 3-level home.",
    type: "townhouse",
    listingType: "sale",
    location: {
      address: "8 Oceanside Drive",
      suburb: "Cottesloe",
      state: "WA",
      postcode: "6011",
      latitude: -31.9929,
      longitude: 115.7553,
    },
    features: {
      bedrooms: 3,
      bathrooms: 2.5,
      parkingSpaces: 2,
      buildingSize: 210,
      hasBalcony: true,
      hasAirConditioning: true,
    },
    media: [
      {
        id: "4-1",
        type: "image",
        url: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=880&q=80",
        description: "Beachfront view",
      },
      {
        id: "4-2",
        type: "image",
        url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=1174&q=80",
        description: "Kitchen and dining",
      },
    ],
    price: {
      amount: 1950000,
      currency: "AUD",
      type: "fixed",
    },
    agent: {
      id: "a4",
      name: "James Taylor",
      phone: "0477 888 999",
      email: "james.t@hausrealty.com.au",
      agency: "HAUS Realty",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    },
    isNew: true,
    createdAt: "2025-07-12T09:45:00Z",
    updatedAt: "2025-07-12T09:45:00Z",
  },
  {
    id: "5",
    title: "Exclusive Off-Market Estate",
    description: "Rare opportunity to acquire this prestigious estate in Toorak. Features include tennis court, indoor pool, wine cellar, and home theater. Contact for private viewing.",
    type: "house",
    listingType: "offmarket",
    location: {
      address: "Private Address",
      suburb: "Toorak",
      state: "VIC",
      postcode: "3142",
    },
    features: {
      bedrooms: 6,
      bathrooms: 5,
      parkingSpaces: 6,
      landSize: 2000,
      buildingSize: 750,
      hasPool: true,
      hasAirConditioning: true,
      hasGarden: true,
    },
    media: [
      {
        id: "5-1",
        type: "image",
        url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        description: "Aerial view (blurred)",
      },
    ],
    price: {
      amount: 0,
      currency: "AUD",
      type: "contact",
    },
    agent: {
      id: "a5",
      name: "Alexandra Davis",
      phone: "0499 111 222",
      email: "alexandra.d@hausrealty.com.au",
      agency: "HAUS Realty Premium",
      profileImage: "https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=686&q=80",
    },
    isExclusive: true,
    isPremium: true,
    createdAt: "2025-07-01T11:00:00Z",
    updatedAt: "2025-07-01T11:00:00Z",
  },
  {
    id: "6",
    title: "Off-Market Waterfront Opportunity",
    description: "Exclusive off-market opportunity to purchase a waterfront property in prestigious Point Piper. This is a rare chance to acquire a property in one of Sydney's most sought-after locations.",
    type: "house",
    listingType: "offmarket",
    location: {
      address: "Confidential",
      suburb: "Point Piper",
      state: "NSW",
      postcode: "2027",
    },
    features: {
      bedrooms: 5,
      bathrooms: 4,
      parkingSpaces: 4,
      landSize: 1200,
      buildingSize: 550,
      hasPool: true,
      hasAirConditioning: true,
      hasGarden: true,
    },
    media: [
      {
        id: "6-1",
        type: "image",
        url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1153&q=80",
        description: "Property preview (blurred)",
      },
    ],
    price: {
      amount: 0,
      currency: "AUD",
      type: "contact",
    },
    agent: {
      id: "a1",
      name: "Sarah Johnson",
      phone: "0412 345 678",
      email: "sarah.j@hausrealty.com.au",
      agency: "HAUS Realty Premium",
      profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=688&q=80",
    },
    isExclusive: true,
    isPremium: true,
    createdAt: "2025-06-28T15:30:00Z",
    updatedAt: "2025-06-28T15:30:00Z",
  },
  {
    id: "7",
    title: "Modern Apartment for Rent",
    description: "Stylish 2-bedroom apartment in the heart of Melbourne. Featuring modern appliances, open-plan living, and a balcony with city views.",
    type: "apartment",
    listingType: "rent",
    location: {
      address: "505/67 Spencer Street",
      suburb: "Melbourne",
      state: "VIC",
      postcode: "3000",
      latitude: -37.8136,
      longitude: 144.9631,
    },
    features: {
      bedrooms: 2,
      bathrooms: 1,
      parkingSpaces: 1,
      buildingSize: 85,
      hasBalcony: true,
      hasAirConditioning: true,
    },
    media: [
      {
        id: "7-1",
        type: "image",
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80",
        description: "Living room",
      },
      {
        id: "7-2",
        type: "image",
        url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        description: "City view from balcony",
      },
    ],
    price: {
      amount: 650,
      currency: "AUD",
      type: "fixed",
      rentalPeriod: "weekly",
    },
    agent: {
      id: "a2",
      name: "Michael Chen",
      phone: "0433 987 654",
      email: "michael.c@hausrealty.com.au",
      agency: "HAUS Realty",
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    },
    isNew: true,
    createdAt: "2025-07-14T08:20:00Z",
    updatedAt: "2025-07-14T08:20:00Z",
  },
  {
    id: "8",
    title: "Upcoming Auction: Family Home",
    description: "Beautiful family home going to auction. Features 4 bedrooms, renovated kitchen, large backyard, and double garage. Close to schools and parks.",
    type: "house",
    listingType: "auction",
    location: {
      address: "28 Wattle Street",
      suburb: "Hawthorn",
      state: "VIC",
      postcode: "3122",
      latitude: -37.8226,
      longitude: 145.0345,
    },
    features: {
      bedrooms: 4,
      bathrooms: 2,
      parkingSpaces: 2,
      landSize: 550,
      buildingSize: 220,
      yearBuilt: 1995,
      hasAirConditioning: true,
      hasGarden: true,
    },
    media: [
      {
        id: "8-1",
        type: "image",
        url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        description: "Front view",
      },
      {
        id: "8-2",
        type: "image",
        url: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        description: "Backyard",
      },
    ],
    price: {
      amount: 1500000,
      currency: "AUD",
      type: "range",
      minAmount: 1400000,
      maxAmount: 1600000,
    },
    agent: {
      id: "a3",
      name: "Emma Wilson",
      phone: "0455 123 456",
      email: "emma.w@hausrealty.com.au",
      agency: "HAUS Realty",
      profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=761&q=80",
    },
    createdAt: "2025-07-07T13:10:00Z",
    updatedAt: "2025-07-07T13:10:00Z",
  },
  {
    id: "9",
    title: "Rural Retreat in Adelaide Hills",
    description: "Stunning 5-bedroom rural property on 10 acres with modern amenities, beautiful gardens, and panoramic views of the Adelaide Hills.",
    type: "rural",
    listingType: "sale",
    location: {
      address: "150 Hills Road",
      suburb: "Stirling",
      state: "SA",
      postcode: "5152",
      latitude: -35.0044,
      longitude: 138.7207,
    },
    features: {
      bedrooms: 5,
      bathrooms: 3,
      parkingSpaces: 4,
      landSize: 40468,
      buildingSize: 350,
      yearBuilt: 2015,
      hasPool: true,
      hasAirConditioning: true,
      hasGarden: true,
    },
    media: [
      {
        id: "9-1",
        type: "image",
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        description: "Main house",
      },
    ],
    price: {
      amount: 2850000,
      currency: "AUD",
      type: "fixed",
    },
    agent: {
      id: "a4",
      name: "James Taylor",
      phone: "0477 888 999",
      email: "james.t@hausrealty.com.au",
      agency: "HAUS Realty",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    },
    isNew: true,
    createdAt: "2025-07-15T10:00:00Z",
    updatedAt: "2025-07-15T10:00:00Z",
  },
  {
    id: "10",
    title: "Commercial Office Space",
    description: "Prime commercial office space in the heart of Sydney CBD. Suitable for professional services, tech companies, or financial services.",
    type: "commercial",
    listingType: "rent",
    location: {
      address: "Level 15, 100 Market Street",
      suburb: "Sydney",
      state: "NSW",
      postcode: "2000",
      latitude: -33.8688,
      longitude: 151.2093,
    },
    features: {
      bedrooms: 0,
      bathrooms: 2,
      parkingSpaces: 6,
      buildingSize: 450,
      hasAirConditioning: true,
    },
    media: [
      {
        id: "10-1",
        type: "image",
        url: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80",
        description: "Office interior",
      },
    ],
    price: {
      amount: 8500,
      currency: "AUD",
      type: "fixed",
      rentalPeriod: "monthly",
    },
    agent: {
      id: "a5",
      name: "Alexandra Davis",
      phone: "0499 111 222",
      email: "alexandra.d@hausrealty.com.au",
      agency: "HAUS Realty Commercial",
      profileImage: "https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=686&q=80",
    },
    createdAt: "2025-07-11T09:00:00Z",
    updatedAt: "2025-07-11T09:00:00Z",
  },
];

export const mockOffMarketProperties: Property[] = [
  {
    id: "om1",
    title: "Exclusive Waterfront Mansion",
    description: "Ultra-exclusive waterfront mansion with private beach access, helipad, and panoramic harbor views. This property is not publicly listed and is available only to premium clients.",
    type: "house",
    listingType: "offmarket",
    location: {
      address: "Confidential Location",
      suburb: "Vaucluse",
      state: "NSW",
      postcode: "2030",
    },
    features: {
      bedrooms: 7,
      bathrooms: 8,
      parkingSpaces: 8,
      landSize: 3500,
      buildingSize: 1200,
      hasPool: true,
      hasAirConditioning: true,
      hasGarden: true,
    },
    media: [
      {
        id: "om1-1",
        type: "image",
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1175&q=80",
        description: "Property preview (blurred)",
      },
    ],
    price: {
      amount: 0,
      currency: "AUD",
      type: "contact",
    },
    agent: {
      id: "a5",
      name: "Alexandra Davis",
      phone: "0499 111 222",
      email: "alexandra.d@hausrealty.com.au",
      agency: "HAUS Realty Premium",
      profileImage: "https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=686&q=80",
    },
    isExclusive: true,
    isPremium: true,
    createdAt: "2025-06-15T10:00:00Z",
    updatedAt: "2025-06-15T10:00:00Z",
  },
  {
    id: "om2",
    title: "Historic Estate in Toorak",
    description: "Rare opportunity to acquire a historic estate in Toorak. This property features heritage architecture, extensive gardens, and has been held within the same family for generations.",
    type: "house",
    listingType: "offmarket",
    location: {
      address: "Private Address",
      suburb: "Toorak",
      state: "VIC",
      postcode: "3142",
    },
    features: {
      bedrooms: 6,
      bathrooms: 5,
      parkingSpaces: 4,
      landSize: 2200,
      buildingSize: 650,
      hasPool: true,
      hasGarden: true,
    },
    media: [
      {
        id: "om2-1",
        type: "image",
        url: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        description: "Property preview (blurred)",
      },
    ],
    price: {
      amount: 0,
      currency: "AUD",
      type: "contact",
    },
    agent: {
      id: "a1",
      name: "Sarah Johnson",
      phone: "0412 345 678",
      email: "sarah.j@hausrealty.com.au",
      agency: "HAUS Realty Premium",
      profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=688&q=80",
    },
    isExclusive: true,
    isPremium: true,
    createdAt: "2025-06-20T14:30:00Z",
    updatedAt: "2025-06-20T14:30:00Z",
  },
  {
    id: "om3",
    title: "Beachfront Development Opportunity",
    description: "Rare beachfront development opportunity in Gold Coast. This large parcel of land has approval for luxury apartments or hotel development with direct beach access.",
    type: "land",
    listingType: "offmarket",
    location: {
      address: "Confidential",
      suburb: "Main Beach",
      state: "QLD",
      postcode: "4217",
    },
    features: {
      bedrooms: 0,
      bathrooms: 0,
      parkingSpaces: 0,
      landSize: 5000,
    },
    media: [
      {
        id: "om3-1",
        type: "image",
        url: "https://images.unsplash.com/photo-1545566239-0d774a5a5e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        description: "Property preview (blurred)",
      },
    ],
    price: {
      amount: 0,
      currency: "AUD",
      type: "contact",
    },
    agent: {
      id: "a4",
      name: "James Taylor",
      phone: "0477 888 999",
      email: "james.t@hausrealty.com.au",
      agency: "HAUS Realty Premium",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
    },
    isExclusive: true,
    isPremium: true,
    createdAt: "2025-07-02T09:15:00Z",
    updatedAt: "2025-07-02T09:15:00Z",
  },
];

// Combined all properties
export const allMockProperties: Property[] = [...mockProperties, ...mockOffMarketProperties];

// Helper function to get property by ID
export function getPropertyById(id: string): Property | undefined {
  return allMockProperties.find(p => p.id === id);
}

// Helper function to get properties by suburb
export function getPropertiesBySuburb(suburb: string): Property[] {
  return allMockProperties.filter(p => 
    p.location.suburb.toLowerCase().includes(suburb.toLowerCase())
  );
}

// Helper function to get properties by state
export function getPropertiesByState(state: string): Property[] {
  return allMockProperties.filter(p => p.location.state === state);
}

// Helper function to get properties by type
export function getPropertiesByType(type: string): Property[] {
  return allMockProperties.filter(p => p.type === type);
}

// Helper function to get favorite properties
export function getPropertiesByIds(ids: string[]): Property[] {
  return allMockProperties.filter(p => ids.includes(p.id));
}

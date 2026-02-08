export type PropertyType =
  | "house"
  | "apartment"
  | "townhouse"
  | "villa"
  | "unit"
  | "land";

export type ListingMode = "rent" | "sale";

export type CompassListing = {
  id: string;
  title: string;
  address: string;
  suburb: string;
  postcode: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  price: number;
  priceLabel: string;
  listingMode: ListingMode;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  landSize?: number;
  images: string[];
  features: string[];
  agent: {
    name: string;
    agency: string;
    avatar: string;
    phone: string;
  };
  isFavorite: boolean;
  isNew: boolean;
  isPremium: boolean;
  rating?: number;
  reviewCount?: number;
  inspectionTimes?: string[];
  auctionDate?: string;
  daysOnMarket: number;
};

// Sydney suburbs with coordinates
const sydneySuburbs = [
  { name: "Bondi", postcode: "2026", lat: -33.8914, lng: 151.2744 },
  { name: "Surry Hills", postcode: "2010", lat: -33.8833, lng: 151.2114 },
  { name: "Paddington", postcode: "2021", lat: -33.8847, lng: 151.2263 },
  { name: "Newtown", postcode: "2042", lat: -33.8967, lng: 151.1789 },
  { name: "Manly", postcode: "2095", lat: -33.7969, lng: 151.2878 },
  { name: "Mosman", postcode: "2088", lat: -33.8289, lng: 151.2417 },
  { name: "Balmain", postcode: "2041", lat: -33.8572, lng: 151.1789 },
  { name: "Coogee", postcode: "2034", lat: -33.9214, lng: 151.2558 },
  { name: "Darlinghurst", postcode: "2010", lat: -33.8778, lng: 151.2178 },
  { name: "Glebe", postcode: "2037", lat: -33.8792, lng: 151.1833 },
  { name: "Randwick", postcode: "2031", lat: -33.9144, lng: 151.2417 },
  { name: "Marrickville", postcode: "2204", lat: -33.9117, lng: 151.1553 },
  { name: "Redfern", postcode: "2016", lat: -33.8931, lng: 151.2028 },
  { name: "Alexandria", postcode: "2015", lat: -33.9067, lng: 151.1958 },
  { name: "Pyrmont", postcode: "2009", lat: -33.8686, lng: 151.1944 },
  { name: "Neutral Bay", postcode: "2089", lat: -33.8333, lng: 151.2167 },
  { name: "Cremorne", postcode: "2090", lat: -33.8275, lng: 151.2275 },
  { name: "Double Bay", postcode: "2028", lat: -33.8778, lng: 151.2439 },
  { name: "Rose Bay", postcode: "2029", lat: -33.8711, lng: 151.2683 },
  { name: "Vaucluse", postcode: "2030", lat: -33.8556, lng: 151.2778 },
];

// Melbourne suburbs
const melbourneSuburbs = [
  { name: "South Yarra", postcode: "3141", lat: -37.8394, lng: 144.9917 },
  { name: "Fitzroy", postcode: "3065", lat: -37.7983, lng: 144.9783 },
  { name: "Richmond", postcode: "3121", lat: -37.8181, lng: 144.9989 },
  { name: "St Kilda", postcode: "3182", lat: -37.8678, lng: 144.9808 },
  { name: "Carlton", postcode: "3053", lat: -37.7983, lng: 144.9672 },
  { name: "Brunswick", postcode: "3056", lat: -37.7678, lng: 144.9608 },
  { name: "Prahran", postcode: "3181", lat: -37.85, lng: 144.9917 },
  { name: "Collingwood", postcode: "3066", lat: -37.8028, lng: 144.9867 },
  { name: "Toorak", postcode: "3142", lat: -37.8417, lng: 145.0167 },
  { name: "Brighton", postcode: "3186", lat: -37.9067, lng: 145.0019 },
];

// Brisbane suburbs
const brisbaneSuburbs = [
  { name: "New Farm", postcode: "4005", lat: -27.4689, lng: 153.0492 },
  { name: "Paddington", postcode: "4064", lat: -27.4597, lng: 152.9936 },
  { name: "West End", postcode: "4101", lat: -27.4833, lng: 153.0083 },
  { name: "Bulimba", postcode: "4171", lat: -27.4533, lng: 153.0583 },
  { name: "Ascot", postcode: "4007", lat: -27.4333, lng: 153.0583 },
  { name: "Hamilton", postcode: "4007", lat: -27.44, lng: 153.065 },
  { name: "Teneriffe", postcode: "4005", lat: -27.4583, lng: 153.0417 },
  { name: "Fortitude Valley", postcode: "4006", lat: -27.4572, lng: 153.0333 },
];

const allSuburbs = [...sydneySuburbs, ...melbourneSuburbs, ...brisbaneSuburbs];

const propertyTypes: PropertyType[] = [
  "house",
  "apartment",
  "townhouse",
  "villa",
  "unit",
  "land",
];

const featuresList = [
  "Air Conditioning",
  "Balcony",
  "Built-in Wardrobes",
  "Courtyard",
  "Dishwasher",
  "Ensuite",
  "Floorboards",
  "Garden",
  "Gas",
  "Gym",
  "Intercom",
  "Internal Laundry",
  "Outdoor Entertaining",
  "Pet Friendly",
  "Pool",
  "Secure Parking",
  "Study",
  "Water Views",
];

const agencyNames = [
  "Ray White",
  "LJ Hooker",
  "McGrath",
  "Belle Property",
  "Raine & Horne",
  "Century 21",
  "Harcourts",
  "Professionals",
  "Richardson & Wrench",
  "The Agency",
];

const propertyImages = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop",
];

// Seeded random number generator for deterministic data (prevents hydration mismatch)
function createSeededRandom(seed: number) {
  return () => {
    seed = (seed * 1_103_515_245 + 12_345) & 0x7f_ff_ff_ff;
    return seed / 0x7f_ff_ff_ff;
  };
}

// Global seeded random - same seed produces same sequence on server & client
let seededRandom = createSeededRandom(42);

function getRandomElement<T>(array: T[], index?: number): T {
  // Use index-based selection for determinism when available
  if (index !== undefined) {
    return array[index % array.length];
  }
  return array[Math.floor(seededRandom() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - seededRandom());
  return shuffled.slice(0, count);
}

function generateSalePrice(
  propertyType: PropertyType,
  suburb: (typeof sydneySuburbs)[0]
): number {
  // Base prices vary by suburb (simplified premium calculation)
  const isPremium = [
    "Vaucluse",
    "Double Bay",
    "Mosman",
    "Toorak",
    "Rose Bay",
  ].includes(suburb.name);
  const baseMultiplier = isPremium ? 2 : 1;

  const basePrices: Record<PropertyType, [number, number]> = {
    house: [1_200_000 * baseMultiplier, 3_500_000 * baseMultiplier],
    apartment: [500_000 * baseMultiplier, 1_500_000 * baseMultiplier],
    townhouse: [800_000 * baseMultiplier, 2_000_000 * baseMultiplier],
    villa: [700_000 * baseMultiplier, 1_800_000 * baseMultiplier],
    unit: [400_000 * baseMultiplier, 900_000 * baseMultiplier],
    land: [600_000 * baseMultiplier, 2_500_000 * baseMultiplier],
  };

  const [min, max] = basePrices[propertyType];
  return Math.floor(seededRandom() * (max - min) + min);
}

function generateRentPrice(
  propertyType: PropertyType,
  bedrooms: number
): number {
  const baseRent: Record<PropertyType, number> = {
    house: 650,
    apartment: 500,
    townhouse: 600,
    villa: 580,
    unit: 450,
    land: 0,
  };

  const base = baseRent[propertyType];
  const bedroomBonus = bedrooms * 100;
  const variance = Math.floor(seededRandom() * 200) - 100;

  return Math.max(250, base + bedroomBonus + variance);
}

function formatSalePrice(price: number): string {
  if (price >= 1_000_000) {
    return `$${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  return `$${(price / 1000).toFixed(0)}K`;
}

function formatRentPrice(price: number): string {
  return `$${price} pw`;
}

function createListing(
  id: string,
  mode: ListingMode,
  suburbIndex: number
): CompassListing {
  const suburb = allSuburbs[suburbIndex % allSuburbs.length];
  const propertyType = getRandomElement(propertyTypes, suburbIndex);
  const bedrooms =
    propertyType === "land" ? 0 : Math.floor(seededRandom() * 5) + 1;
  const bathrooms = Math.max(1, bedrooms - Math.floor(seededRandom() * 2));
  const parkingSpaces = Math.floor(seededRandom() * 3);

  const price =
    mode === "sale"
      ? generateSalePrice(propertyType, suburb)
      : generateRentPrice(propertyType, bedrooms);

  const priceLabel =
    mode === "sale" ? formatSalePrice(price) : formatRentPrice(price);

  const latOffset = (seededRandom() - 0.5) * 0.02;
  const lngOffset = (seededRandom() - 0.5) * 0.02;

  const streetNumber = Math.floor(seededRandom() * 200) + 1;
  const streetNames = [
    "Victoria",
    "George",
    "Elizabeth",
    "King",
    "Queen",
    "William",
    "Edward",
    "Albert",
  ];
  const streetTypes = ["Street", "Road", "Avenue", "Lane", "Place", "Drive"];

  const agencyName = getRandomElement(agencyNames, suburbIndex);
  const agentFirstNames = [
    "James",
    "Sarah",
    "Michael",
    "Emma",
    "David",
    "Sophie",
    "Tom",
    "Jessica",
  ];
  const agentLastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Taylor",
    "Wilson",
    "Davis",
  ];
  const agentName = `${getRandomElement(agentFirstNames, suburbIndex)} ${getRandomElement(agentLastNames, suburbIndex + 1)}`;

  const state = suburb.postcode.startsWith("2")
    ? "NSW"
    : suburb.postcode.startsWith("3")
      ? "VIC"
      : "QLD";

  return {
    id,
    title: `${bedrooms > 0 ? `${bedrooms} Bedroom ` : ""}${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} in ${suburb.name}`,
    address: `${streetNumber} ${getRandomElement(streetNames, suburbIndex)} ${getRandomElement(streetTypes, suburbIndex)}`,
    suburb: suburb.name,
    postcode: suburb.postcode,
    state,
    coordinates: {
      lat: suburb.lat + latOffset,
      lng: suburb.lng + lngOffset,
    },
    price,
    priceLabel,
    listingMode: mode,
    propertyType,
    bedrooms,
    bathrooms,
    parkingSpaces,
    landSize:
      propertyType === "house" || propertyType === "land"
        ? Math.floor(seededRandom() * 800) + 200
        : undefined,
    images: getRandomElements(propertyImages, 5),
    features: getRandomElements(
      featuresList,
      Math.floor(seededRandom() * 8) + 4
    ),
    agent: {
      name: agentName,
      agency: agencyName,
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${agentName.replace(" ", "")}`,
      phone: `0${Math.floor(seededRandom() * 4) + 4}${Math.floor(seededRandom() * 90_000_000) + 10_000_000}`,
    },
    isFavorite: seededRandom() > 0.85,
    isNew: seededRandom() > 0.8,
    isPremium: seededRandom() > 0.9,
    rating: seededRandom() > 0.3 ? 4 + seededRandom() : undefined,
    reviewCount:
      seededRandom() > 0.3 ? Math.floor(seededRandom() * 50) + 5 : undefined,
    daysOnMarket: Math.floor(seededRandom() * 60) + 1,
    inspectionTimes:
      seededRandom() > 0.5
        ? ["Sat 10:00am - 10:30am", "Wed 5:00pm - 5:30pm"]
        : undefined,
    auctionDate:
      seededRandom() > 0.7 ? "Saturday 15 Feb at 10:00am" : undefined,
  };
}

// Reset the seed before generating listings to ensure consistency
seededRandom = createSeededRandom(42);

// Generate 100 sale listings and 80 rental listings
export const compassListings: CompassListing[] = [
  ...Array.from({ length: 100 }, (_, i) =>
    createListing(`sale-${i + 1}`, "sale", i)
  ),
  ...Array.from({ length: 80 }, (_, i) =>
    createListing(`rent-${i + 1}`, "rent", i)
  ),
];

export const propertyTypeLabels: Record<PropertyType, string> = {
  house: "House",
  apartment: "Apartment",
  townhouse: "Townhouse",
  villa: "Villa",
  unit: "Unit",
  land: "Land",
};

// City centers for map navigation
export const australianCities = {
  sydney: { lat: -33.8688, lng: 151.2093, zoom: 12, label: "Sydney" },
  melbourne: { lat: -37.8136, lng: 144.9631, zoom: 12, label: "Melbourne" },
  brisbane: { lat: -27.4698, lng: 153.0251, zoom: 12, label: "Brisbane" },
  perth: { lat: -31.9505, lng: 115.8605, zoom: 12, label: "Perth" },
  adelaide: { lat: -34.9285, lng: 138.6007, zoom: 12, label: "Adelaide" },
  goldcoast: { lat: -28.0167, lng: 153.4, zoom: 12, label: "Gold Coast" },
  canberra: { lat: -35.2809, lng: 149.13, zoom: 12, label: "Canberra" },
  hobart: { lat: -42.8821, lng: 147.3272, zoom: 12, label: "Hobart" },
};

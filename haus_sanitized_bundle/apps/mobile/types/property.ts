/**
 * Property Types for React Native
 * 
 * Shared types for property-related components
 */

export type PropertyType = 
  | "house" 
  | "apartment" 
  | "townhouse" 
  | "land" 
  | "rural" 
  | "commercial";

export type ListingType = "sale" | "rent" | "auction" | "offmarket";

export interface Location {
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyFeatures {
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  landSize?: number;
  buildingSize?: number;
  yearBuilt?: number;
  hasPool?: boolean;
  hasAirConditioning?: boolean;
  hasGarden?: boolean;
  hasBalcony?: boolean;
  energyRating?: number;
}

export interface PropertyMedia {
  id: string;
  type: "image" | "video" | "3d";
  url: string;
  thumbnail?: string;
  description?: string;
}

export interface PropertyPrice {
  amount: number;
  currency: string;
  type: "fixed" | "range" | "auction" | "contact";
  minAmount?: number;
  maxAmount?: number;
  rentalPeriod?: "weekly" | "monthly";
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string;
  agency: string;
  profileImage?: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  listingType: ListingType;
  location: Location;
  features: PropertyFeatures;
  media: PropertyMedia[];
  price: PropertyPrice;
  agent: Agent;
  isNew?: boolean;
  isExclusive?: boolean;
  isPremium?: boolean;
  createdAt: string;
  updatedAt: string;
}

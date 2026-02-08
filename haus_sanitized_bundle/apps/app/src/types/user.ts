// User Types for HAUS Platform

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName?: string
  avatar?: string
  phone?: string
  dateOfBirth?: string
  location?: {
    suburb: string
    state: string
    postcode: string
    country: string
  }
  bio?: string
  preferences: UserPreferences
  notifications: NotificationSettings
  privacy: PrivacySettings
  activityHistory: ActivityItem[]
  savedSearches: SavedSearch[]
  memberSince: string
  lastActive: string
  verified: boolean
  role: "user" | "agent" | "provider" | "admin"
}

export interface UserPreferences {
  currency: "AUD" | "USD" | "GBP" | "EUR"
  distanceUnit: "km" | "miles"
  language: string
  timezone: string
  propertyAlerts: boolean
  priceDropAlerts: boolean
  newListingAlerts: boolean
  savedSearchAlerts: boolean
  marketReportFrequency: "daily" | "weekly" | "monthly" | "never"
  preferredPropertyTypes: string[]
  preferredLocations: string[]
  budgetRange?: {
    min: number
    max: number
  }
}

export interface NotificationSettings {
  email: {
    marketing: boolean
    propertyAlerts: boolean
    priceChanges: boolean
    savedSearches: boolean
    accountUpdates: boolean
    newsletters: boolean
  }
  push: {
    enabled: boolean
    propertyAlerts: boolean
    messages: boolean
    reminders: boolean
  }
  sms: {
    enabled: boolean
    urgentAlerts: boolean
    appointmentReminders: boolean
  }
}

export interface PrivacySettings {
  profileVisibility: "public" | "private" | "contacts"
  showActivityStatus: boolean
  showSavedProperties: boolean
  allowDataCollection: boolean
  allowPersonalization: boolean
  twoFactorEnabled: boolean
  loginAlerts: boolean
  connectedAccounts: {
    google?: boolean
    apple?: boolean
    facebook?: boolean
  }
}

export interface ActivityItem {
  id: string
  type: "view" | "save" | "inquiry" | "search" | "quote_request" | "review" | "booking"
  title: string
  description: string
  timestamp: string
  metadata?: Record<string, any>
  propertyId?: string
  propertyImage?: string
}

export interface SavedSearch {
  id: string
  name: string
  query: {
    location: string
    propertyType?: string
    priceRange?: { min: number; max: number }
    bedrooms?: number
    bathrooms?: number
  }
  alertsEnabled: boolean
  matchCount: number
  createdAt: string
  lastMatched?: string
}

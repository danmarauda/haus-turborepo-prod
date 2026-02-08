/**
 * RevenueCat Integration Library
 *
 * Provides type definitions, validation, and utilities for integrating
 * RevenueCat subscriptions with HAUS platform.
 *
 * Features:
 * - TypeScript types for RevenueCat webhooks and responses
 * - Zod validation schemas for runtime validation
 * - Webhook signature verification
 * - Entitlement syncing utilities
 * - User mapping helpers
 *
 * @see https://docs.revenuecat.com/reference/webhooks
 * @see https://www.revenuecat.com/docs/customer-info
 */

import { z } from "zod";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RevenueCat Webhook Event Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * All RevenueCat webhook event types
 */
export type RevenueCatEventType =
  | "initial_purchase"
  | "test"
  | "non_subscription_purchase"
  | "subscription_purchased"
  | "subscription_renewed"
  | "subscription_paused"
  | "subscription_cancelled"
  | "subscription_expired"
  | "uncancellation"
  | "product_change"
  | "transfer"
  | "price_change"
  | "refund"
  | "grace_period_renewal"
  | "refund_extended"
  | "expiration_extension"
  | "billing_issue"
  | "subscriber_alias";

/**
 * Base RevenueCat webhook payload
 */
export interface RevenueCatWebhookPayload {
  /** Event type */
  event_type: RevenueCatEventType;
  /** RevenueCat API version */
  api_version: string;
  /** Unix timestamp when the event occurred */
  event_timestamp_ms: number;
  /** Unique ID for this event */
  id: string;
  /** App user ID from RevenueCat */
  app_user_id: string;
  /** Product ID from the app store */
  product_id: string;
  /** Transaction ID from the app store */
  transaction_id?: string;
  /** Original transaction ID for restored purchases */
  original_transaction_id?: string;
  /** Original app user ID for transfers */
  original_app_user_id?: string;
  /** Currency code (e.g., "AUD") */
  currency?: string;
  /** Price in minor units (cents) */
  price?: number;
  /** Localization price (e.g., "$14.99") */
  price_in_purchased_currency?: string;
  /** Country code */
  country_code?: string;
  /** Store: "app_store", "play_store", "stripe", etc. */
  store?: string;
  /** Environment: "production" or "sandbox" */
  environment?: string;
  /** Period type for subscriptions */
  period_type?: "normal" | "trial" | "intro";
  /** Entitlement ID associated with this purchase */
  entitlement_id?: string;
  /** New entitlement ID for product changes */
  new_entitlement_id?: string;
  /** Old entitlement ID for product changes */
  old_entitlement_id?: string;
  /** New product ID for product changes */
  new_product_id?: string;
  /** Whether this is a family sharing purchase */
  family_share?: boolean;
  /** Reason for cancellation */
  cancellation_reason?: "user_initiated" | "system" | "billing_error" | "other";
  /** Name of the subscriber alias */
  subscriber_alias_name?: string;
}

/**
 * Full RevenueCat webhook request
 */
export interface RevenueCatWebhookRequest {
  /** Event payload */
  event: RevenueCatWebhookPayload;
  /** Signature for verification */
  signature?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Customer Info Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Entitlement information from RevenueCat
 */
export interface RevenueCatEntitlement {
  /** Whether the entitlement is active */
  isActive: boolean;
  /** Whether the entitlement will renew */
  willRenew: boolean;
  /** Period type */
  periodType: "normal" | "trial" | "intro";
  /** Latest expiration date */
  latestExpirationDate?: string;
  /** Original purchase date */
  originalPurchaseDate?: string;
  /** Product identifier */
  productIdentifier: string;
  /** Store */
  store: "app_store" | "play_store" | "stripe" | "amazon" | "promotional";
}

/**
 * All entitlements for a user
 */
export type RevenueCatEntitlements = Record<string, RevenueCatEntitlement>;

/**
 * Subscription information
 */
export interface RevenueCatSubscription {
  /** Product identifier */
  productIdentifier: string;
  /** Whether subscription is active */
  isActive: boolean;
  /** Whether will renew */
  willRenew: boolean;
  /** Period type */
  periodType: "normal" | "trial" | "intro";
  /** Latest expiration date ISO string */
  latestExpirationDate?: string;
  /** Original purchase date ISO string */
  originalPurchaseDate?: string;
  /** Store */
  store: "app_store" | "play_store" | "stripe" | "amazon" | "promotional";
  /** Store transaction ID */
  storeTransactionId?: string;
}

/**
 * Non-subscription purchase
 */
export interface RevenueCatNonSubscription {
  /** Product identifier */
  productIdentifier: string;
  /** Purchase date ISO string */
  purchaseDate?: string;
  /** Store transaction ID */
  storeTransactionId?: string;
  /** Store */
  store: "app_store" | "play_store" | "stripe" | "amazon" | "promotional";
}

/**
 * Request date details
 */
export interface RequestDate {
  /** ISO date string */
  milliseconds: number;
  [key: string]: unknown;
}

/**
 * Full Customer Info from RevenueCat
 */
export interface RevenueCatCustomerInfo {
  /** Entitlements access */
  entitlements: {
    verifications: Record<string, unknown>;
    all: Record<string, RevenueCatEntitlement>;
    active: Record<string, RevenueCatEntitlement>;
  };
  /** Active subscriptions */
  activeSubscriptions: string[];
  /** All subscriptions */
  allSubscriptionIds: string[];
  /** All purchased product IDs */
  allPurchasedProductIds: string[];
  /** Latest expiration date */
  latestExpirationDate?: string;
  /** First purchase date */
  firstPurchaseDate?: string;
  /** Original purchase date */
  originalPurchaseDate?: string;
  /** OriginalAppUserId */
  originalAppUserId: string;
  /** Request date */
  requestDate: RequestDate;
  /** Subscriptions */
  subscriptions: Record<string, RevenueCatSubscription>;
  /** Non-subscription purchases */
  nonSubscriptions: Record<string, RevenueCatNonSubscription[]>;
  /** Management URL */
  managementURL?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Internal Sync Types (matching Convex schema)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Premium status for syncing to Convex
 * Matches the schema in convex/schema.ts and convex/users.ts
 */
export interface PremiumSyncPayload {
  /** RevenueCat originalAppUserId */
  revenueCatId: string;
  /** Premium subscription status */
  isPremium: boolean;
  /** Latest expiration ISO date string */
  latestExpiration?: string | null;
  /** Active entitlements */
  entitlements?: Record<string, unknown>;
  /** Subscription details */
  subscriptions?: Record<string, unknown>;
  /** All purchased product IDs */
  allPurchasedProducts?: string[];
}

/**
 * Result of premium sync operation
 */
export interface PremiumSyncResult {
  success: boolean;
  userId?: string;
  error?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Premium Tier Definitions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * HAUS Premium Tiers
 */
export type PremiumTier = "free" | "premium" | "agency";

/**
 * Entitlement to tier mapping
 */
export const ENTITLEMENT_TO_TIER: Record<string, PremiumTier> = {
  "haus.premium": "premium",
  "haus.agency": "agency",
  "haus.pro": "agency",
};

/**
 * Check if customer info indicates premium status
 */
export function isPremiumCustomer(
  customerInfo: RevenueCatCustomerInfo,
  entitlementId: string = "haus.premium"
): boolean {
  const entitlement = customerInfo.entitlements.all[entitlementId];
  return entitlement?.isActive === true;
}

/**
 * Get the highest tier from customer info
 */
export function getPremiumTier(
  customerInfo: RevenueCatCustomerInfo
): PremiumTier {
  const active = customerInfo.entitlements.active;

  for (const [entitlementId, entitlement] of Object.entries(active)) {
    if (entitlement.isActive) {
      return ENTITLEMENT_TO_TIER[entitlementId] || "premium";
    }
  }

  return "free";
}

/**
 * Get latest expiration date from customer info
 */
export function getLatestExpiration(
  customerInfo: RevenueCatCustomerInfo
): string | undefined {
  return customerInfo.latestExpirationDate ?? undefined;
}

/**
 * Convert RevenueCat CustomerInfo to PremiumSyncPayload
 */
export function toPremiumSyncPayload(
  appUserId: string,
  customerInfo: RevenueCatCustomerInfo,
  entitlementId?: string
): PremiumSyncPayload {
  const activeEntitlements = customerInfo.entitlements.active;
  const isPremium = entitlementId
    ? activeEntitlements[entitlementId]?.isActive === true
    : Object.keys(activeEntitlements).length > 0;

  return {
    revenueCatId: appUserId,
    isPremium,
    latestExpiration: getLatestExpiration(customerInfo),
    entitlements: customerInfo.entitlements.all,
    subscriptions: customerInfo.subscriptions,
    allPurchasedProducts: customerInfo.allPurchasedProductIds,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Webhook Event Handlers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Determines if a webhook event should grant premium access
 */
export function eventGrantsPremium(event: RevenueCatWebhookPayload): boolean {
  const premiumEvents: RevenueCatEventType[] = [
    "initial_purchase",
    "subscription_purchased",
    "subscription_renewed",
    "uncancellation",
    "product_change",
    "grace_period_renewal",
    "expiration_extension",
    "refund_extended",
  ];

  return premiumEvents.includes(event.event_type);
}

/**
 * Determines if a webhook event should revoke premium access
 */
export function eventRevokesPremium(event: RevenueCatWebhookPayload): boolean {
  const revokeEvents: RevenueCatEventType[] = [
    "subscription_cancelled",
    "subscription_expired",
  ];

  return revokeEvents.includes(event.event_type);
}

/**
 * Get a human-readable event description
 */
export function getEventDescription(event: RevenueCatWebhookPayload): string {
  const descriptions: Record<RevenueCatEventType, string> = {
    initial_purchase: "First purchase by a new subscriber",
    test: "Test webhook event",
    non_subscription_purchase: "Non-subscription product purchased",
    subscription_purchased: "New subscription activated",
    subscription_renewed: "Subscription successfully renewed",
    subscription_paused: "Subscription paused",
    subscription_cancelled: "Subscription cancelled by user",
    subscription_expired: "Subscription expired",
    uncancellation: "Cancelled subscription was reactivated",
    product_change: "User changed subscription product",
    transfer: "Subscription transferred to another account",
    price_change: "Subscription price changed",
    refund: "Purchase was refunded",
    grace_period_renewal: "Subscription renewed during grace period",
    refund_extended: "Refund period extended",
    expiration_extension: "Subscription expiration extended",
    billing_issue: "Billing issue with subscription",
    subscriber_alias: "Subscriber alias event",
  };

  return descriptions[event.event_type] || "Unknown event";
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Validation & Security
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Validate RevenueCat webhook signature
 *
 * NOTE: RevenueCat webhooks can be signed with your API key.
 * In production, verify the signature using standardwebhooks package.
 *
 * @param payload - The webhook payload
 * @param signature - The signature from the header
 * @param secret - Your RevenueCat API key
 * @returns true if signature is valid
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest("hex");
    return signature === expectedSignature;
  } catch (error) {
    console.error("[RevenueCat] Signature verification failed:", error);
    return false;
  }
}

/**
 * Basic validation of webhook payload structure
 */
export function isValidWebhookPayload(
  payload: unknown
): payload is RevenueCatWebhookRequest {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const event = (payload as RevenueCatWebhookRequest).event;
  if (!event || typeof event !== "object") {
    return false;
  }

  return (
    typeof event.event_type === "string" &&
    typeof event.app_user_id === "string" &&
    typeof event.id === "string"
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Constants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * HAUS RevenueCat Configuration
 */
export const REVENUECAT_CONFIG = {
  /** Entitlement ID for premium access */
  PREMIUM_ENTITLEMENT: "haus.premium",
  /** Entitlement ID for agency tier */
  AGENCY_ENTITLEMENT: "haus.agency",
  /** Premium monthly product */
  PREMIUM_MONTHLY: "haus_premium_monthly",
  /** Premium yearly product */
  PREMIUM_YEARLY: "haus_premium_yearly",
  /** Agency monthly product */
  AGENCY_MONTHLY: "haus_agency_monthly",
  /** Agency yearly product */
  AGENCY_YEARLY: "haus_agency_yearly",
} as const;

/**
 * Premium tier benefits (for UI display)
 */
export const PREMIUM_BENEFITS = {
  premium: [
    "Hidden luxury properties",
    "Early access to new listings",
    "Direct contact with premium agents",
    "Personalized property alerts",
    "Unlimited voice searches",
    "Advanced market analytics",
  ],
  agency: [
    "All Premium benefits",
    "Client management tools",
    "Lead generation",
    "Bulk property analysis",
    "Custom branding",
    "API access",
    "Team collaboration",
  ],
} as const;

/**
 * Free tier limitations
 */
export const FREE_LIMITS = {
  dailyVoiceSearches: 10,
  propertyComparisons: 3,
  savedSearches: 5,
  favoriteProperties: 20,
  marketReports: 2,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Zod Validation Schemas
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Zod schema for RevenueCat webhook event type
 */
export const RevenueCatEventTypeSchema = z.enum([
  "initial_purchase",
  "test",
  "non_subscription_purchase",
  "subscription_purchased",
  "subscription_renewed",
  "subscription_paused",
  "subscription_cancelled",
  "subscription_expired",
  "uncancellation",
  "product_change",
  "transfer",
  "price_change",
  "refund",
  "grace_period_renewal",
  "refund_extended",
  "expiration_extension",
  "billing_issue",
  "subscriber_alias",
]);

/**
 * Zod schema for RevenueCat webhook payload
 */
export const RevenueCatWebhookPayloadSchema = z.object({
  event_type: RevenueCatEventTypeSchema,
  api_version: z.string(),
  event_timestamp_ms: z.number(),
  id: z.string(),
  app_user_id: z.string(),
  product_id: z.string(),
  transaction_id: z.string().optional(),
  original_transaction_id: z.string().optional(),
  original_app_user_id: z.string().optional(),
  currency: z.string().optional(),
  price: z.number().optional(),
  price_in_purchased_currency: z.string().optional(),
  country_code: z.string().optional(),
  store: z.string().optional(),
  environment: z.enum(["production", "sandbox"]).optional(),
  period_type: z.enum(["normal", "trial", "intro"]).optional(),
  entitlement_id: z.string().optional(),
  new_entitlement_id: z.string().optional(),
  old_entitlement_id: z.string().optional(),
  new_product_id: z.string().optional(),
  family_share: z.boolean().optional(),
  cancellation_reason: z.enum(["user_initiated", "system", "billing_error", "other"]).optional(),
  subscriber_alias_name: z.string().optional(),
});

/**
 * Zod schema for RevenueCat webhook request
 */
export const RevenueCatWebhookRequestSchema = z.object({
  event: RevenueCatWebhookPayloadSchema,
  signature: z.string().optional(),
});

/**
 * Zod schema for RevenueCat entitlement
 */
export const RevenueCatEntitlementSchema = z.object({
  isActive: z.boolean(),
  willRenew: z.boolean(),
  periodType: z.enum(["normal", "trial", "intro"]),
  latestExpirationDate: z.string().optional(),
  originalPurchaseDate: z.string().optional(),
  productIdentifier: z.string(),
  store: z.enum(["app_store", "play_store", "stripe", "amazon", "promotional"]),
});

/**
 * Zod schema for RevenueCat subscription
 */
export const RevenueCatSubscriptionSchema = z.object({
  productIdentifier: z.string(),
  isActive: z.boolean(),
  willRenew: z.boolean(),
  periodType: z.enum(["normal", "trial", "intro"]),
  latestExpirationDate: z.string().optional(),
  originalPurchaseDate: z.string().optional(),
  store: z.enum(["app_store", "play_store", "stripe", "amazon", "promotional"]),
  storeTransactionId: z.string().optional(),
});

/**
 * Zod schema for RevenueCat CustomerInfo
 */
export const RevenueCatCustomerInfoSchema = z.object({
  entitlements: z.object({
    verifications: z.record(z.unknown()),
    all: z.record(RevenueCatEntitlementSchema),
    active: z.record(RevenueCatEntitlementSchema),
  }),
  activeSubscriptions: z.array(z.string()),
  allSubscriptionIds: z.array(z.string()),
  allPurchasedProductIds: z.array(z.string()),
  latestExpirationDate: z.string().optional(),
  firstPurchaseDate: z.string().optional(),
  originalPurchaseDate: z.string().optional(),
  originalAppUserId: z.string(),
  requestDate: z.object({
    milliseconds: z.number(),
  }),
  subscriptions: z.record(RevenueCatSubscriptionSchema),
  nonSubscriptions: z.record(z.array(z.object({
    productIdentifier: z.string(),
    purchaseDate: z.string().optional(),
    storeTransactionId: z.string().optional(),
    store: z.enum(["app_store", "play_store", "stripe", "amazon", "promotional"]),
  }))),
  managementURL: z.string().optional(),
});

/**
 * Zod schema for PremiumSyncPayload (matching Convex mutation args)
 */
export const PremiumSyncPayloadSchema = z.object({
  revenueCatId: z.string(),
  isPremium: z.boolean(),
  latestExpiration: z.string().nullable().optional(),
  entitlements: z.record(z.unknown()).optional(),
  subscriptions: z.record(z.unknown()).optional(),
  allPurchasedProducts: z.array(z.string()).optional(),
});

/**
 * Validate webhook payload using Zod
 */
export function validateWebhookPayload(
  payload: unknown
): { success: true; data: RevenueCatWebhookRequest } | { success: false; error: z.ZodError } {
  const result = RevenueCatWebhookRequestSchema.safeParse(payload);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Validate CustomerInfo using Zod
 */
export function validateCustomerInfo(
  info: unknown
): { success: true; data: RevenueCatCustomerInfo } | { success: false; error: z.ZodError } {
  const result = RevenueCatCustomerInfoSchema.safeParse(info);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

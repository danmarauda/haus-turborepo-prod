import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';
import type { Id } from '@repo/backend';
import { ConvexHttpClient } from 'convex/browser';

// Types for RevenueCat data
export interface RevenueCatEntitlement {
  identifier: string;
  isActive: boolean;
  willRenew: boolean;
  periodType: string;
  latestPurchaseDate: string;
  originalPurchaseDate: string;
  expirationDate: string | null;
  store: string;
  productIdentifier: string;
  isSandbox: boolean;
  unsubscribeDetectedAt: string | null;
  billingIssuesDetectedAt: string | null;
}

export interface RevenueCatSubscription {
  billingIssuesDetectedAt: string | null;
  expiresDate: string;
  gracePeriodExpiresDate: string | null;
  isActive: boolean;
  isSandbox: boolean;
  originalPurchaseDate: string;
  ownershipType: string;
  periodType: string;
  price: Record<string, any>;
  productIdentifier: string;
  purchaseDate: string;
  refundedAt: string | null;
  store: string;
  storeTransactionId: string;
  unsubscribeDetectedAt: string | null;
  willRenew: boolean;
}

export interface RevenueCatCustomerInfo {
  activeSubscriptions: string[];
  allExpirationDates: Record<string, string>;
  allExpirationDatesMillis: Record<string, number>;
  allPurchaseDates: Record<string, string>;
  allPurchaseDatesMillis: Record<string, number>;
  allPurchasedProductIdentifiers: string[];
  entitlements: {
    active: Record<string, RevenueCatEntitlement>;
    all: Record<string, RevenueCatEntitlement>;
    verification: string;
  };
  firstSeen: string;
  firstSeenMillis: number;
  latestExpirationDate: string | null;
  latestExpirationDateMillis: number | null;
  managementURL: string | null;
  nonSubscriptionTransactions: any[];
  originalAppUserId: string;
  originalApplicationVersion: string | null;
  originalPurchaseDate: string | null;
  originalPurchaseDateMillis: number | null;
  requestDate: string;
  requestDateMillis: number;
  subscriptionsByProductIdentifier: Record<string, RevenueCatSubscription>;
}

export interface RevenueCatContextType {
  isPro: boolean;
  isReady: boolean;
  customerInfo: RevenueCatCustomerInfo | null;
  purchasePremium: (packageToBuy: PurchasesPackage) => Promise<void>;
  restorePurchases: () => Promise<void>;
  refetchCustomerInfo: () => Promise<void>;
}

const APIKeys = {
  ios: process.env.EXPO_PUBLIC_RC_IOS,
  android: process.env.EXPO_PUBLIC_RC_ANDROID,
};

const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL;

export const RevenueCatContext = createContext<Partial<RevenueCatContextType>>({});

export const RevenueCatProvider = ({ children }: { children: ReactNode }) => {
  const [isPro, setIsPro] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<RevenueCatCustomerInfo | null>(null);
  const [convex] = useState<ConvexHttpClient | null>(
    CONVEX_URL ? new ConvexHttpClient(CONVEX_URL) : null
  );

  // Check if API keys are configured
  const checkAPIKeys = () => {
    const iosKey = APIKeys.ios;
    const androidKey = APIKeys.android;

    if (!iosKey || !androidKey || iosKey === 'undefined' || androidKey === 'undefined') {
      console.error('RevenueCat API keys are not configured!');
      console.error('Please set the following environment variables:');
      console.error('- EXPO_PUBLIC_RC_IOS=your_ios_api_key');
      console.error('- EXPO_PUBLIC_RC_ANDROID=your_android_api_key');
      console.error('Or remove the RevenueCatProvider from app/_layout.tsx if you don\'t need subscriptions');

      // Set ready to true to allow app to continue without RevenueCat
      setIsReady(true);
      return false;
    }
    return true;
  };

  const init = async () => {
    console.log('RevenueCat initialization for:', Platform.OS);

    // Check if API keys are configured
    if (!checkAPIKeys()) {
      return;
    }

    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: APIKeys.ios! });
    } else {
      Purchases.configure({ apiKey: APIKeys.android! });
    }
    setIsReady(true);

    Purchases.setLogLevel(Purchases.LOG_LEVEL.ERROR);

    // First data fetch
    await refetchCustomerInfo();

    // Listen to changes
    Purchases.addCustomerInfoUpdateListener(async (info) => {
      console.log('CustomerInfo updated:', info.originalAppUserId);
      await updateCustomerInfo(info as unknown as RevenueCatCustomerInfo);
    });
  };

  const updateCustomerInfo = async (info: RevenueCatCustomerInfo) => {
    try {
      setCustomerInfo(info);

      const subscriptionName = process.env.EXPO_PUBLIC_RC_SUBSCRIPTION_NAME || 'pro';
      const hasPro = !!info.entitlements.active[subscriptionName];
      setIsPro(hasPro);

      // Synchronize with Convex
      await syncWithConvex(info);

      console.log('CustomerInfo updated:', {
        isPro: hasPro,
        originalAppUserId: info.originalAppUserId,
        activeEntitlements: Object.keys(info.entitlements.active),
      });
    } catch (error) {
      console.error('Error updating customerInfo:', error);
    }
  };

  const refetchCustomerInfo = async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      await updateCustomerInfo(info as unknown as RevenueCatCustomerInfo);
    } catch (error) {
      console.error('Error refetching customerInfo:', error);
    }
  };

  const syncWithConvex = async (info: RevenueCatCustomerInfo) => {
    if (!convex) {
      console.log('Convex client not initialized, skipping synchronization');
      return;
    }

    try {
      const subscriptionName = process.env.EXPO_PUBLIC_RC_SUBSCRIPTION_NAME || 'pro';
      const hasPro = !!info.entitlements.active[subscriptionName];

      // Update user premium status in Convex
      // Note: You'll need to create this mutation in your Convex backend
      await convex.mutation('users.syncPremiumStatus', {
        revenueCatId: info.originalAppUserId,
        isPremium: hasPro,
        latestExpiration: info.latestExpirationDate,
        entitlements: info.entitlements.active,
        subscriptions: info.subscriptionsByProductIdentifier,
        allPurchasedProducts: info.allPurchasedProductIdentifiers,
      });

      console.log('Data synchronized with Convex');
    } catch (err) {
      console.error('Error synchronizing with Convex:', err);
    }
  };

  const purchasePremium = async (packageToBuy: PurchasesPackage) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage({
        aPackage: packageToBuy,
      });

      await updateCustomerInfo(customerInfo as unknown as RevenueCatCustomerInfo);
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('Purchase cancelled by user');
      } else {
        console.error('Purchase failed:', error);
        throw error;
      }
    }
  };

  const restorePurchases = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      await updateCustomerInfo(customerInfo as unknown as RevenueCatCustomerInfo);
      console.log('Purchases restored successfully');
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    }
  };

  useEffect(() => {
    init();
  }, []);

  // Always render children to prevent splash screen from hanging
  return (
    <RevenueCatContext.Provider
      value={{
        isPro,
        isReady,
        customerInfo,
        purchasePremium,
        restorePurchases,
        refetchCustomerInfo,
      }}>
      {children}
    </RevenueCatContext.Provider>
  );
};

export const useRevenueCat = () => {
  return useContext(RevenueCatContext);
};

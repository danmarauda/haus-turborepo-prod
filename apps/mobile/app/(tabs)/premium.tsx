import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Crown,
  Sparkles,
  Home,
  Map,
  Zap,
  Shield,
  Star,
  Check,
  X,
  RefreshCw,
  ChevronRight,
} from 'lucide-react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';

import { useRevenueCat } from '@/context/RevenueCatContext';
import { useAuth } from '@/services/auth';
import { useTheme } from '@/context/ThemeContext';

// Feature interface
interface Feature {
  icon: React.ReactElement;
  title: string;
  description: string;
  included: boolean;
}

// Pricing card interface
interface PricingCard {
  id: string;
  name: string;
  price: string;
  period: string;
  originalPrice?: string;
  savings?: string;
  features: string[];
  popular?: boolean;
  packageId?: string;
}

// HAUS Premium Features
const premiumFeatures: Feature[] = [
  {
    icon: <Home size={20} color="#FF6B35" />,
    title: 'Unlimited Property Searches',
    description: 'Search as many properties as you want with no daily limits',
    included: true,
  },
  {
    icon: <Map size={20} color="#FF6B35" />,
    title: 'Advanced Map Filters',
    description: 'Filter by school zones, transport, amenities and more',
    included: true,
  },
  {
    icon: <Sparkles size={20} color="#FF6B35" />,
    title: 'AI-Powered Insights',
    description: 'Get personalized property recommendations and market analysis',
    included: true,
  },
  {
    icon: <Zap size={20} color="#FF6B35" />,
    title: 'Real-Time Alerts',
    description: 'Instant notifications when matching properties hit the market',
    included: true,
  },
  {
    icon: <Shield size={20} color="#FF6B35" />,
    title: 'Price History & Analytics',
    description: 'Track property values and market trends over time',
    included: true,
  },
  {
    icon: <Star size={20} color="#FF6B35" />,
    title: 'Exclusive Early Access',
    description: 'See off-market listings before anyone else',
    included: true,
  },
];

// Pricing tiers
const pricingTiers: PricingCard[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$9.99',
    period: 'month',
    features: ['All Premium features', 'Cancel anytime', 'No commitment'],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '$79.99',
    period: 'year',
    originalPrice: '$119.88',
    savings: 'Save 33%',
    features: ['All Premium features', 'Best value', 'Cancel anytime'],
    popular: true,
  },
];

// Feature Item Component
function FeatureItem({ icon, title, description, included }: Feature) {
  const { isDark } = useTheme();

  return (
    <View className="flex-row items-start gap-3 py-3">
      <View
        className={`w-10 h-10 rounded-lg items-center justify-center ${
          included ? 'bg-orange-500/10' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text
          className={`font-medium ${
            included ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {title}
        </Text>
        <Text
          className={`text-sm mt-0.5 ${
            included ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'
          }`}
        >
          {description}
        </Text>
      </View>
      <View
        className={`w-6 h-6 rounded-full items-center justify-center ${
          included ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-700'
        }`}
      >
        {included ? <Check size={14} color="#ffffff" /> : <X size={14} color="#9CA3AF" />}
      </View>
    </View>
  );
}

// Pricing Card Component
function PricingCard({
  name,
  price,
  period,
  originalPrice,
  savings,
  features,
  popular,
  onSubscribe,
  isLoading,
}: PricingCard & {
  onSubscribe: () => void;
  isLoading: boolean;
}) {
  const { isDark } = useTheme();

  return (
    <Pressable
      onPress={onSubscribe}
      disabled={isLoading}
      className={`flex-1 rounded-2xl p-5 ${
        popular
          ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30'
          : isDark
          ? 'bg-gray-800/80 border border-gray-700'
          : 'bg-gray-50 border border-gray-200'
      }`}
    >
      {savings && (
        <View className="self-start bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-3">
          <Text className="text-white text-xs font-semibold">{savings}</Text>
        </View>
      )}

      <Text
        className={`text-xl font-bold ${
          popular ? 'text-white' : 'text-gray-900 dark:text-white'
        }`}
      >
        {name}
      </Text>

      <View className="flex-row items-baseline mt-2">
        <Text
          className={`text-3xl font-bold ${popular ? 'text-white' : 'text-gray-900 dark:text-white'}`}
        >
          {price}
        </Text>
        <Text
          className={`ml-1 ${popular ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}
        >
          /{period}
        </Text>
      </View>

      {originalPrice && (
        <Text className="text-white/60 text-sm line-through mt-1">{originalPrice}/year</Text>
      )}

      <View className="mt-4 mb-5">
        {features.map((feature, index) => (
          <View key={index} className="flex-row items-center gap-2 mb-2">
            <Check
              size={16}
              color={popular ? '#ffffff' : isDark ? '#9CA3AF' : '#6B7280'}
            />
            <Text
              className={`text-sm ${popular ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}
            >
              {feature}
            </Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={onSubscribe}
        disabled={isLoading}
        className={`items-center justify-center py-3 rounded-xl ${
          popular
            ? 'bg-white shadow-lg'
            : isDark
            ? 'bg-orange-500'
            : 'bg-orange-500'
        } ${isLoading ? 'opacity-50' : ''}`}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={popular ? '#FF6B35' : '#ffffff'}
          />
        ) : (
          <Text
            className={`font-semibold ${popular ? 'text-orange-500' : 'text-white'}`}
          >
            Subscribe
          </Text>
        )}
      </Pressable>
    </Pressable>
  );
}

export default function PremiumScreen() {
  const router = useRouter();
  const { isDark, themeVars } = useTheme();
  const { isAuthenticated } = useAuth();
  const { isPro, isReady, customerInfo, purchasePremium, restorePurchases, refetchCustomerInfo } =
    useRevenueCat();

  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [offerings, setOfferings] = useState<Purchases.Offerings | null>(null);

  // Load available offerings
  useEffect(() => {
    const loadOfferings = async () => {
      if (!isReady) return;

      try {
        const offerings = await Purchases.getOfferings();
        setOfferings(offerings);
      } catch (error) {
        console.error('Failed to load offerings:', error);
      }
    };

    loadOfferings();
  }, [isReady]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to access Premium features',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        ]
      );
    }
  }, [isAuthenticated, router]);

  const handleSubscribe = async (tierId: string) => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to subscribe to Premium',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }

    if (!offerings || isPurchasing) return;

    try {
      setIsPurchasing(true);

      // Find the default or first available offering
      const offering =
        offerings.current ||
        offerings.all[Object.keys(offerings.all)[0]];

      if (!offering) {
        Alert.alert('Error', 'No subscription options available. Please try again later.');
        return;
      }

      // Find the package based on tier (monthly/yearly)
      let targetPackage: PurchasesPackage | undefined;

      if (tierId === 'yearly') {
        // Try to find annual package
        targetPackage = offering.availablePackages.find(
          (pkg) =>
            pkg.packageType === Purchases.PackageType.ANNUAL ||
            pkg.identifier.toLowerCase().includes('annual') ||
            pkg.identifier.toLowerCase().includes('year')
        );
      }

      // Fallback to monthly if yearly not found
      if (!targetPackage) {
        targetPackage = offering.availablePackages.find(
          (pkg) =>
            pkg.packageType === Purchases.PackageType.MONTHLY ||
            pkg.identifier.toLowerCase().includes('month')
        );
      }

      // Last resort: use first available package
      if (!targetPackage && offering.availablePackages.length > 0) {
        targetPackage = offering.availablePackages[0];
      }

      if (!targetPackage) {
        Alert.alert('Error', 'Subscription package not available.');
        return;
      }

      await purchasePremium(targetPackage);
      await refetchCustomerInfo();
    } catch (error) {
      console.error('Purchase failed:', error);
      Alert.alert(
        'Purchase Failed',
        'Unable to complete the purchase. Please try again or contact support.'
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to restore purchases',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
        ]
      );
      return;
    }

    try {
      await restorePurchases();
      Alert.alert(
        'Restore Complete',
        'Your purchases have been restored successfully.'
      );
    } catch (error) {
      Alert.alert(
        'Restore Failed',
        'Unable to restore purchases. Please check your connection and try again.'
      );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Lifetime';
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Loading state
  if (!isReady) {
    return (
      <SafeAreaView
        className={`flex-1 ${isDark ? 'bg-gray-950' : 'bg-white'}`}
      >
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading Premium...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className={`px-6 pt-4 pb-6 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 items-center justify-center">
              <Crown size={24} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                HAUS Premium
              </Text>
              <Text className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Unlock the full property search experience
              </Text>
            </View>
          </View>
        </View>

        {/* Subscription Status Card */}
        {isPro && customerInfo && (
          <View className="mx-4 mt-4 mb-6">
            <View
              className={`rounded-2xl p-4 border ${
                isDark
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-green-50 border-green-200'
              }`}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center">
                  <Check size={20} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 dark:text-white">
                    Premium Active
                  </Text>
                  <Text
                    className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {customerInfo.latestExpirationDate
                      ? `Renews on ${formatDate(customerInfo.latestExpirationDate)}`
                      : 'Lifetime access'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Features Section */}
        <View className="px-4 mb-6">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4 px-2">
            Premium Features
          </Text>
          <View
            className={`rounded-2xl p-4 ${
              isDark
                ? 'bg-gray-900/50 backdrop-blur-md border border-gray-800'
                : 'bg-white border border-gray-200'
            }`}
          >
            {premiumFeatures.map((feature, index) => (
              <View key={index}>
                <FeatureItem {...feature} />
                {index < premiumFeatures.length - 1 && (
                  <View
                    className={`h-px ${
                      isDark ? 'bg-gray-800' : 'bg-gray-200'
                    } my-1`}
                  />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Pricing Section - Only show if not subscribed */}
        {!isPro && (
          <View className="px-4 mb-6">
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4 px-2">
              Choose Your Plan
            </Text>
            <View className="flex-row gap-3">
              {pricingTiers.map((tier) => (
                <PricingCard
                  key={tier.id}
                  {...tier}
                  onSubscribe={() => handleSubscribe(tier.id)}
                  isLoading={isPurchasing}
                />
              ))}
            </View>
          </View>
        )}

        {/* Restore Purchases Button */}
        <View className="px-4 mb-6">
          <Pressable
            onPress={handleRestore}
            className={`flex-row items-center justify-center gap-2 py-3 rounded-xl ${
              isDark
                ? 'bg-gray-900/50 border border-gray-800'
                : 'bg-white border border-gray-200'
            }`}
          >
            <RefreshCw size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text
              className={`font-medium ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Restore Purchases
            </Text>
          </Pressable>
        </View>

        {/* Manage Subscription Link */}
        {isPro && customerInfo?.managementURL && (
          <View className="px-4 mb-6">
            <Text
              className={`text-center text-sm ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}
            >
              Need to cancel or change your subscription?{' '}
              <Text
                className="text-orange-500 font-medium"
                onPress={() => {
                  // Open management URL in browser
                  if (customerInfo.managementURL) {
                    router.push({
                      pathname: '/webview',
                      params: { url: customerInfo.managementURL },
                    });
                  }
                }}
              >
                Manage Subscription
              </Text>
            </Text>
          </View>
        )}

        {/* Terms */}
        <View className="px-4 mb-8">
          <Text
            className={`text-center text-xs ${
              isDark ? 'text-gray-600' : 'text-gray-400'
            }`}
          >
            Subscriptions auto-renew unless cancelled at least 24 hours before
            the end of the current period. By subscribing, you agree to our Terms
            of Service and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

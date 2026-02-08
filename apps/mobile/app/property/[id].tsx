/**
 * Property Detail Screen
 * 
 * Displays detailed information about a property including:
 * - Image gallery with carousel
 * - Price and title
 * - Location details
 * - Property features (beds, baths, parking)
 * - Description
 * - Property details (type, size, year built, amenities)
 * - Agent information
 * - Contact buttons
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  Bed,
  Bath,
  Car,
  Heart,
  MapPin,
  Phone,
  Mail,
  Share2,
  Calendar,
  Home,
  Maximize,
  Leaf,
  Wind,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useProperty } from '../../hooks/useProperties';
import { useFavorites } from '../../hooks/useFavorites';
import { cn } from '../../lib/utils';
import PropertyErrorBoundary from '../../components/error-boundaries/PropertyErrorBoundary';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Detail item component for property details grid
interface DetailItemProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

function DetailItem({ label, value, icon }: DetailItemProps) {
  return (
    <View className="mb-4 w-1/2 pr-2">
      <View className="flex-row items-center gap-1.5">
        {icon}
        <Text className="text-sm text-muted-foreground">{label}</Text>
      </View>
      <Text className="mt-0.5 text-base font-medium text-foreground">
        {value}
      </Text>
    </View>
  );
}

// Feature badge component
interface FeatureBadgeProps {
  label: string;
  active: boolean;
}

function FeatureBadge({ label, active }: FeatureBadgeProps) {
  return (
    <View
      className={cn(
        'rounded-full px-3 py-1.5',
        active ? 'bg-primary/10' : 'bg-muted'
      )}
    >
      <Text
        className={cn(
          'text-sm font-medium',
          active ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {active ? '✓ ' : '✗ '}{label}
      </Text>
    </View>
  );
}

function PropertyDetailScreenContent() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: property, isLoading } = useProperty(id || null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Handle favorite toggle
  const handleFavoritePress = useCallback(async () => {
    if (!property) return;

    if (Platform.OS !== 'web') {
      await Haptics.selectionAsync();
    }
    toggleFavorite(property.id);
  }, [property, toggleFavorite]);

  // Handle share
  const handleShare = useCallback(() => {
    // TODO: Implement share functionality
    console.log('Share property:', id);
  }, [id]);

  // Handle contact agent
  const handleContactAgent = useCallback((method: 'call' | 'email') => {
    if (!property) return;
    console.log(`Contact agent via ${method}:`, property.agent.phone);
  }, [property]);

  // Format price for display
  const formatPrice = useCallback(() => {
    if (!property) return '';

    if (property.price.type === 'contact') {
      return 'Price on Application';
    } else if (property.price.type === 'range') {
      return `$${(property.price.minAmount || 0).toLocaleString()} - $${(
        property.price.maxAmount || 0
      ).toLocaleString()}`;
    } else if (
      property.listingType === 'rent' &&
      property.price.rentalPeriod
    ) {
      return `$${property.price.amount.toLocaleString()}/${
        property.price.rentalPeriod === 'weekly' ? 'week' : 'month'
      }`;
    } else {
      return `$${property.price.amount.toLocaleString()}`;
    }
  }, [property]);

  // Format listing type label
  const getListingTypeLabel = useCallback(() => {
    if (!property) return '';
    switch (property.listingType) {
      case 'sale':
        return 'For Sale';
      case 'rent':
        return 'For Rent';
      case 'auction':
        return 'Auction';
      case 'offmarket':
        return 'Off Market';
      default:
        return '';
    }
  }, [property]);

  // Get listing type badge color
  const getListingTypeColor = useCallback(() => {
    if (!property) return 'bg-gray-500';
    switch (property.listingType) {
      case 'sale':
        return 'bg-sky-500';
      case 'rent':
        return 'bg-emerald-500';
      case 'auction':
        return 'bg-amber-500';
      case 'offmarket':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  }, [property]);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-base text-muted-foreground">
          Loading property details...
        </Text>
      </SafeAreaView>
    );
  }

  // Not found state
  if (!property) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="mb-4 text-lg font-semibold text-foreground">
          Property not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-lg bg-primary px-4 py-2"
        >
          <Text className="font-medium text-primary-foreground">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const favorited = isFavorite(property.id);
  const isOffMarket = property.listingType === 'offmarket';
  const isExclusive = property.isExclusive;

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View className="relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.floor(
                event.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              setCurrentImageIndex(index);
            }}
          >
            {property.media.map((media) => (
              <Image
                key={media.id}
                source={{ uri: media.url }}
                style={{ width: SCREEN_WIDTH, height: 300 }}
                contentFit="cover"
                transition={200}
              />
            ))}
          </ScrollView>

          {/* Image Indicators */}
          {property.media.length > 1 && (
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
              {property.media.map((_, index) => (
                <View
                  key={index}
                  className={cn(
                    'h-2 w-2 rounded-full',
                    index === currentImageIndex
                      ? 'bg-white'
                      : 'bg-white/50'
                  )}
                />
              ))}
            </View>
          )}

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute left-4 top-12 h-10 w-10 items-center justify-center rounded-full bg-black/50"
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>

          {/* Action Buttons */}
          <View className="absolute right-4 top-12 flex-row gap-2">
            <TouchableOpacity
              onPress={handleShare}
              className="h-10 w-10 items-center justify-center rounded-full bg-black/50"
            >
              <Share2 size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleFavoritePress}
              className="h-10 w-10 items-center justify-center rounded-full bg-black/50"
            >
              <Heart
                size={20}
                color="#fff"
                fill={favorited ? '#f43f5e' : 'transparent'}
              />
            </TouchableOpacity>
          </View>

          {/* Badges */}
          <View className="absolute left-4 top-56 flex-row gap-2">
            {property.isNew && (
              <View className="rounded-md bg-sky-500 px-2 py-1">
                <Text className="text-xs font-bold text-white">NEW</Text>
              </View>
            )}
            <View className={cn('rounded-md px-2 py-1', getListingTypeColor())}>
              <Text className="text-xs font-bold text-white">
                {getListingTypeLabel()}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="p-4">
          {/* Price & Title */}
          <View className="mb-4">
            <Text className="mb-1 text-2xl font-bold text-foreground">
              {formatPrice()}
            </Text>
            <Text className="text-lg font-medium text-foreground">
              {property.title}
            </Text>
            <View className="mt-2 flex-row items-center gap-1">
              <MapPin size={16} color="#0ea5e9" />
              <Text className="flex-1 text-sm text-muted-foreground">
                {property.location.address}, {property.location.suburb},{' '}
                {property.location.state} {property.location.postcode}
              </Text>
            </View>
          </View>

          {/* Features */}
          <View className="mb-6 flex-row justify-around rounded-xl bg-muted p-4">
            <View className="items-center">
              <Bed size={24} color="#0ea5e9" />
              <Text className="mt-1 text-lg font-bold text-foreground">
                {property.features.bedrooms}
              </Text>
              <Text className="text-xs text-muted-foreground">Bedrooms</Text>
            </View>
            <View className="items-center">
              <Bath size={24} color="#0ea5e9" />
              <Text className="mt-1 text-lg font-bold text-foreground">
                {property.features.bathrooms}
              </Text>
              <Text className="text-xs text-muted-foreground">Bathrooms</Text>
            </View>
            <View className="items-center">
              <Car size={24} color="#0ea5e9" />
              <Text className="mt-1 text-lg font-bold text-foreground">
                {property.features.parkingSpaces}
              </Text>
              <Text className="text-xs text-muted-foreground">Parking</Text>
            </View>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="mb-2 text-lg font-semibold text-foreground">
              Description
            </Text>
            <Text
              className="text-base leading-6 text-foreground/80"
              numberOfLines={showFullDescription ? undefined : 4}
            >
              {property.description}
            </Text>
            {property.description.length > 150 && (
              <TouchableOpacity
                onPress={() => setShowFullDescription(!showFullDescription)}
                className="mt-2"
              >
                <Text className="font-medium text-primary">
                  {showFullDescription ? 'Show Less' : 'Read More'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Property Details */}
          <View className="mb-6">
            <Text className="mb-3 text-lg font-semibold text-foreground">
              Property Details
            </Text>
            <View className="flex-row flex-wrap">
              <DetailItem
                label="Property Type"
                value={
                  property.type.charAt(0).toUpperCase() + property.type.slice(1)
                }
                icon={<Home size={14} color="#666" />}
              />
              {property.features.landSize && (
                <DetailItem
                  label="Land Size"
                  value={`${property.features.landSize} m²`}
                  icon={<Maximize size={14} color="#666" />}
                />
              )}
              {property.features.buildingSize && (
                <DetailItem
                  label="Building Size"
                  value={`${property.features.buildingSize} m²`}
                  icon={<Maximize size={14} color="#666" />}
                />
              )}
              {property.features.yearBuilt && (
                <DetailItem
                  label="Year Built"
                  value={property.features.yearBuilt.toString()}
                  icon={<Calendar size={14} color="#666" />}
                />
              )}
            </View>
          </View>

          {/* Features & Amenities */}
          <View className="mb-6">
            <Text className="mb-3 text-lg font-semibold text-foreground">
              Features & Amenities
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <FeatureBadge
                label="Air Conditioning"
                active={!!property.features.hasAirConditioning}
              />
              <FeatureBadge
                label="Swimming Pool"
                active={!!property.features.hasPool}
              />
              <FeatureBadge
                label="Garden"
                active={!!property.features.hasGarden}
              />
              <FeatureBadge
                label="Balcony"
                active={!!property.features.hasBalcony}
              />
            </View>
          </View>

          {/* Agent */}
          <View className="mb-6">
            <Text className="mb-3 text-lg font-semibold text-foreground">
              Agent
            </Text>
            <View className="flex-row items-center rounded-xl bg-muted p-4">
              <Image
                source={{ uri: property.agent.profileImage }}
                className="h-16 w-16 rounded-full"
                contentFit="cover"
              />
              <View className="ml-4 flex-1">
                <Text className="text-base font-semibold text-foreground">
                  {property.agent.name}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {property.agent.agency}
                </Text>
                <View className="mt-2 flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleContactAgent('call')}
                    className="flex-row items-center gap-1 rounded-lg bg-primary px-3 py-1.5"
                  >
                    <Phone size={14} color="#fff" />
                    <Text className="text-sm font-medium text-white">
                      Call
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleContactAgent('email')}
                    className="flex-row items-center gap-1 rounded-lg bg-secondary px-3 py-1.5"
                  >
                    <Mail size={14} color="#fff" />
                    <Text className="text-sm font-medium text-white">
                      Email
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Exclusive/Premium Badge */}
          {(isExclusive || property.isPremium) && (
            <View className="mb-20 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-4">
              <View className="flex-row items-center gap-2">
                <Leaf size={20} color="#fff" />
                <Text className="text-base font-bold text-white">
                  {isExclusive ? 'Exclusive Listing' : 'Premium Property'}
                </Text>
              </View>
              <Text className="mt-1 text-sm text-white/90">
                This is a {isExclusive ? 'exclusive off-market' : 'premium'}{' '}
                property. Contact the agent for more information.
              </Text>
            </View>
          )}

          {/* Bottom Spacer */}
          <View className="h-20" />
        </View>
      </ScrollView>

      {/* Footer Contact Button */}
      {!isOffMarket && (
        <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-4 py-3">
          <TouchableOpacity
            onPress={() => handleContactAgent('call')}
            className="rounded-xl bg-primary py-3"
          >
            <Text className="text-center text-base font-semibold text-primary-foreground">
              Contact Agent
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

/**
 * PropertyCard - Main property display card
 * 
 * Glassmorphic design with NativeWind styling
 * Converted from StyleSheet to NativeWind className
 */

import { Image } from "expo-image";
import { Heart, MapPin, Bed, Bath, Car } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import type { Property, ListingType } from "../../types/property";
import { cn } from "../../lib/utils";

export interface PropertyCardProps {
  property: Property;
  onPress: (property: Property) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (propertyId: string) => void;
}

export function PropertyCard({ 
  property, 
  onPress, 
  isFavorite = false,
  onToggleFavorite 
}: PropertyCardProps) {
  const handleFavoritePress = async () => {
    if (Platform.OS !== "web") {
      await Haptics.selectionAsync();
    }
    onToggleFavorite?.(property.id);
  };

  const formatPrice = (property: Property): string => {
    if (property.price.type === "contact") {
      return "Price on Application";
    } else if (property.price.type === "range") {
      return `$${(property.price.minAmount || 0).toLocaleString()} - $${(property.price.maxAmount || 0).toLocaleString()}`;
    } else if (property.listingType === "rent" && property.price.rentalPeriod) {
      return `$${property.price.amount.toLocaleString()}/${property.price.rentalPeriod === "weekly" ? "week" : "month"}`;
    } else {
      return `$${property.price.amount.toLocaleString()}`;
    }
  };

  const getListingTypeLabel = (property: Property): string => {
    switch (property.listingType) {
      case "sale":
        return "For Sale";
      case "rent":
        return "For Rent";
      case "auction":
        return "Auction";
      case "offmarket":
        return "Off Market";
      default:
        return "";
    }
  };

  const getListingTypeColor = (listingType: ListingType): string => {
    switch (listingType) {
      case "sale":
        return "bg-sky-500";
      case "rent":
        return "bg-emerald-500";
      case "auction":
        return "bg-amber-500";
      case "offmarket":
        return "bg-blue-500";
      default:
        return "bg-neutral-500";
    }
  };

  const isBlurred = property.isExclusive && property.listingType === "offmarket";

  return (
    <TouchableOpacity
      className="overflow-hidden rounded-xl border border-border bg-card"
      onPress={() => onPress(property)}
      activeOpacity={0.9}
      testID={`property-card-${property.id}`}
    >
      {/* Image Container */}
      <View className="relative h-44">
        <Image
          source={{ uri: property.media[0]?.url }}
          className={cn("h-full w-full", isBlurred && "opacity-70")}
          contentFit="cover"
          transition={200}
        />
        
        {/* Favorite Button */}
        <TouchableOpacity
          className="absolute top-3 right-3 h-9 w-9 items-center justify-center rounded-full bg-black/40"
          onPress={handleFavoritePress}
        >
          <Heart
            size={18}
            color={isFavorite ? "#f43f5e" : "#ffffff"}
            fill={isFavorite ? "#f43f5e" : "transparent"}
          />
        </TouchableOpacity>

        {/* Badges */}
        <View className="absolute top-3 left-3 flex-row gap-1.5">
          {property.isNew && (
            <View className="rounded-md bg-sky-500 px-2 py-1">
              <Text className="text-xs font-semibold text-white">NEW</Text>
            </View>
          )}
          <View className={cn("rounded-md px-2 py-1", getListingTypeColor(property.listingType))}>
            <Text className="text-xs font-semibold text-white">
              {getListingTypeLabel(property)}
            </Text>
          </View>
        </View>
      </View>

      {/* Content Container */}
      <View className="p-3">
        {/* Price */}
        <Text className="mb-1 text-lg font-bold text-foreground">
          {formatPrice(property)}
        </Text>
        
        {/* Title */}
        <Text className="mb-2 text-base font-medium text-foreground/90" numberOfLines={1}>
          {property.title}
        </Text>

        {/* Location */}
        <View className="mb-3 flex-row items-center gap-1">
          <MapPin size={14} color="#0ea5e9" />
          <Text className="flex-1 text-sm text-muted-foreground" numberOfLines={1}>
            {property.location.suburb}, {property.location.state} {property.location.postcode}
          </Text>
        </View>

        {/* Features */}
        <View className="flex-row gap-4">
          <View className="flex-row items-center gap-1">
            <Bed size={15} color="#9ca3af" />
            <Text className="text-sm text-muted-foreground">
              {property.features.bedrooms}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Bath size={15} color="#9ca3af" />
            <Text className="text-sm text-muted-foreground">
              {property.features.bathrooms}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Car size={15} color="#9ca3af" />
            <Text className="text-sm text-muted-foreground">
              {property.features.parkingSpaces}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default PropertyCard;

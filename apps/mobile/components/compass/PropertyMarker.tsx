/**
 * PropertyMarker - Map marker component for properties
 * 
 * Displays property price/info on the map with:
 * - Price badge with color coding for listing type
 * - Selection state
 * - Press handling
 * 
 * @example
 * ```tsx
 * <PropertyMarker 
 *   property={property} 
 *   isSelected={selectedId === property.id}
 *   onPress={handlePress}
 * />
 * ```
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { Property, ListingType } from '../../types/property';

// ------------------------------------------------------------------------------
// Types
// ------------------------------------------------------------------------------

export interface PropertyMarkerProps {
  property: Property;
  isSelected?: boolean;
  onPress?: (property: Property) => void;
  showDetails?: boolean;
}

// ------------------------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------------------------

function formatPrice(property: Property): string {
  if (property.price.type === 'contact') {
    return 'POA';
  } else if (property.price.type === 'range') {
    const min = property.price.minAmount || 0;
    const max = property.price.maxAmount || 0;
    if (min >= 1000000) {
      return `$${(min / 1000000).toFixed(1)}M-${(max / 1000000).toFixed(1)}M`;
    }
    return `$${(min / 1000).toFixed(0)}K-${(max / 1000).toFixed(0)}K`;
  } else {
    const amount = property.price.amount;
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  }
}

function getListingTypeColor(listingType: ListingType): string {
  switch (listingType) {
    case 'sale':
      return '#0ea5e9'; // Sky blue
    case 'rent':
      return '#10b981'; // Emerald
    case 'auction':
      return '#f59e0b'; // Amber
    case 'offmarket':
      return '#8b5cf6'; // Violet
    default:
      return '#6b7280';
  }
}

// ------------------------------------------------------------------------------
// Component
// ------------------------------------------------------------------------------

export function PropertyMarker({
  property,
  isSelected = false,
  onPress,
  showDetails = false,
}: PropertyMarkerProps) {
  const scale = useSharedValue(1);
  const elevation = useSharedValue(2);
  
  // Animate on selection change
  React.useEffect(() => {
    if (isSelected) {
      scale.value = withSequence(
        withTiming(1.2, { duration: 150 }),
        withSpring(1.1, { damping: 12, stiffness: 200 })
      );
      elevation.value = withTiming(8, { duration: 200 });
    } else {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      elevation.value = withTiming(2, { duration: 200 });
    }
  }, [isSelected, scale, elevation]);
  
  const handlePress = useCallback(() => {
    // Bounce animation
    scale.value = withSequence(
      withTiming(0.9, { duration: 50 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );
    onPress?.(property);
  }, [property, onPress, scale]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: elevation.value / 10,
    shadowRadius: elevation.value,
    elevation: elevation.value,
  }));
  
  const priceColor = getListingTypeColor(property.listingType);
  
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.marker,
          animatedStyle,
          isSelected && styles.markerSelected,
          { borderColor: priceColor },
        ]}
      >
        <View style={[styles.priceBadge, { backgroundColor: priceColor }]}>
          <Text style={styles.priceText} numberOfLines={1}>
            {formatPrice(property)}
          </Text>
        </View>
        
        {/* Pin triangle */}
        <View style={[styles.triangle, { borderTopColor: priceColor }]} />
      </Animated.View>
      
      {/* Selected indicator ring */}
      {isSelected && (
        <View style={[styles.selectedRing, { borderColor: priceColor }]} />
      )}
    </TouchableOpacity>
  );
}

// ------------------------------------------------------------------------------
// Styles
// ------------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
  },
  markerSelected: {
    backgroundColor: '#ffffff',
  },
  priceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  priceText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  selectedRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    opacity: 0.3,
  },
});

export default PropertyMarker;

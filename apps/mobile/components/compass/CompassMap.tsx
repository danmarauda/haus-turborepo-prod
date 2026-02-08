/**
 * CompassMap - Map view component for property discovery
 * 
 * Displays properties on an interactive map with:
 * - Property markers with price badges
 * - User location
 * - Map controls (zoom, recenter)
 * - Property selection handling
 * 
 * Note: This component is designed to work with react-native-maps
 * but includes a fallback view for development/testing.
 * 
 * @example
 * ```tsx
 * <CompassMap 
 *   properties={properties}
 *   selectedPropertyId={selectedId}
 *   onPropertySelect={handleSelect}
 *   userLocation={{ latitude: -33.8688, longitude: 151.2093 }}
 * />
 * ```
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  Navigation,
  Plus,
  Minus,
  Layers,
  Target,
  List,
} from 'lucide-react-native';
import { PropertyMarker } from './PropertyMarker';
import type { Property } from '../../types/property';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ------------------------------------------------------------------------------
// Types
// ------------------------------------------------------------------------------

export interface CompassMapProps {
  properties: Property[];
  selectedPropertyId?: string | null;
  onPropertySelect?: (property: Property) => void;
  onMapPress?: () => void;
  onSidebarToggle?: () => void;
  initialRegion?: MapRegion;
  showsUserLocation?: boolean;
  isLoading?: boolean;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

// ------------------------------------------------------------------------------
// Mock Map Component (for development without react-native-maps)
// ------------------------------------------------------------------------------

function MockMapView({
  children,
  region,
  onRegionChange,
}: {
  children?: React.ReactNode;
  region: MapRegion;
  onRegionChange?: (region: MapRegion) => void;
}) {
  return (
    <View style={styles.mockMap}>
      <View style={styles.mockMapContent}>
        <Text style={styles.mockMapText}>Map View</Text>
        <Text style={styles.mockMapSubtext}>
          {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
        </Text>
        <Text style={styles.mockMapHint}>
          Install react-native-maps for full functionality
        </Text>
      </View>
      
      {/* Property markers positioned absolutely */}
      <View style={StyleSheet.absoluteFill}>
        {children}
      </View>
    </View>
  );
}

// ------------------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------------------

// Default region (Sydney, Australia)
const DEFAULT_REGION: MapRegion = {
  latitude: -33.8688,
  longitude: 151.2093,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export function CompassMap({
  properties,
  selectedPropertyId,
  onPropertySelect,
  onMapPress,
  onSidebarToggle,
  initialRegion = DEFAULT_REGION,
  showsUserLocation = true,
  isLoading = false,
}: CompassMapProps) {
  const insets = useSafeAreaInsets();
  const [region, setRegion] = useState<MapRegion>(initialRegion);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  
  // Animation values
  const controlsScale = useSharedValue(1);
  
  // Get user location on mount
  useEffect(() => {
    if (!showsUserLocation) return;
    
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        } catch (error) {
          console.warn('Failed to get location:', error);
        }
      }
    })();
  }, [showsUserLocation]);
  
  // Handlers
  const handlePropertyPress = useCallback((property: Property) => {
    onPropertySelect?.(property);
    
    // Center map on selected property
    if (property.location.latitude && property.location.longitude) {
      setRegion(prev => ({
        ...prev,
        latitude: property.location.latitude!,
        longitude: property.location.longitude!,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }));
    }
  }, [onPropertySelect]);
  
  const handleZoomIn = useCallback(() => {
    setRegion(prev => ({
      ...prev,
      latitudeDelta: prev.latitudeDelta / 2,
      longitudeDelta: prev.longitudeDelta / 2,
    }));
  }, []);
  
  const handleZoomOut = useCallback(() => {
    setRegion(prev => ({
      ...prev,
      latitudeDelta: prev.latitudeDelta * 2,
      longitudeDelta: prev.longitudeDelta * 2,
    }));
  }, []);
  
  const handleRecenter = useCallback(() => {
    if (userLocation) {
      setRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [userLocation]);
  
  const handleCycleMapType = useCallback(() => {
    const types: Array<'standard' | 'satellite' | 'hybrid'> = ['standard', 'satellite', 'hybrid'];
    const currentIndex = types.indexOf(mapType);
    setMapType(types[(currentIndex + 1) % types.length]);
  }, [mapType]);
  
  // Animated styles
  const controlsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: controlsScale.value }],
  }));
  
  // Calculate marker positions (mock positioning for development)
  const getMarkerPosition = (property: Property, index: number) => {
    // In a real implementation, this would use the actual lat/lng
    // For now, we'll distribute markers around the center
    const angle = (index / Math.max(properties.length, 1)) * Math.PI * 2;
    const radius = 100; // pixels from center
    
    const lat = property.location.latitude || region.latitude + (Math.sin(angle) * region.latitudeDelta * 0.3);
    const lng = property.location.longitude || region.longitude + (Math.cos(angle) * region.longitudeDelta * 0.3);
    
    return { latitude: lat, longitude: lng };
  };
  
  // Check if we have real map support
  const hasMapSupport = false; // Will be true when react-native-maps is installed
  
  const MapComponent = hasMapSupport ? View : MockMapView; // Replace View with actual MapView when available
  
  return (
    <View style={styles.container}>
      {/* Map */}
      <MapComponent
        region={region}
        onRegionChange={setRegion}
      >
        {/* User location marker */}
        {userLocation && (
          <View
            style={[
              styles.userLocationMarker,
              {
                left: SCREEN_WIDTH / 2 - 12,
                top: SCREEN_HEIGHT / 2 - 12,
              },
            ]}
          >
            <View style={styles.userLocationDot} />
            <View style={styles.userLocationRing} />
          </View>
        )}
        
        {/* Property markers */}
        {properties.map((property, index) => {
          const position = getMarkerPosition(property, index);
          const isSelected = selectedPropertyId === property.id;
          
          // Calculate screen position (simplified for mock)
          const screenX = SCREEN_WIDTH / 2 + (index % 3 - 1) * 100;
          const screenY = SCREEN_HEIGHT / 2 + (Math.floor(index / 3) - 1) * 80;
          
          return (
            <View
              key={property.id}
              style={[
                styles.markerContainer,
                { left: screenX, top: screenY },
              ]}
            >
              <PropertyMarker
                property={property}
                isSelected={isSelected}
                onPress={handlePropertyPress}
              />
            </View>
          );
        })}
      </MapComponent>
      
      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      )}
      
      {/* Top Controls */}
      <View style={[styles.topControls, { top: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onSidebarToggle}
        >
          <List size={22} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleCycleMapType}
        >
          <Layers size={22} color="#333" />
        </TouchableOpacity>
      </View>
      
      {/* Right Side Controls */}
      <Animated.View style={[styles.rightControls, controlsStyle]}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleZoomIn}
        >
          <Plus size={22} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleZoomOut}
        >
          <Minus size={22} color="#333" />
        </TouchableOpacity>
        
        {userLocation && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleRecenter}
          >
            <Target size={22} color="#333" />
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {/* Map Type Indicator */}
      <View style={[styles.mapTypeIndicator, { bottom: insets.bottom + 100 }]}>
        <Text style={styles.mapTypeText}>
          {mapType.charAt(0).toUpperCase() + mapType.slice(1)}
        </Text>
      </View>
      
      {/* Property Count */}
      <View style={[styles.propertyCount, { bottom: insets.bottom + 20 }]}>
        <Text style={styles.propertyCountText}>
          {properties.length} properties
        </Text>
      </View>
    </View>
  );
}

// ------------------------------------------------------------------------------
// Styles
// ------------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  mockMap: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockMapContent: {
    alignItems: 'center',
  },
  mockMapText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6b7280',
  },
  mockMapSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  mockMapHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 16,
    fontStyle: 'italic',
  },
  markerContainer: {
    position: 'absolute',
  },
  userLocationMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0ea5e9',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userLocationRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0ea5e930',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 12,
    fontSize: 16,
  },
  topControls: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightControls: {
    position: 'absolute',
    right: 16,
    top: SCREEN_HEIGHT / 2 - 80,
    gap: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  mapTypeIndicator: {
    position: 'absolute',
    left: 16,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  mapTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  propertyCount: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  propertyCountText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CompassMap;

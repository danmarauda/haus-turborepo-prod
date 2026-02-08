/**
 * Compass Screen - Map-based Property Discovery
 * 
 * A full-screen map interface for exploring properties with:
 * - Interactive map with property markers
 * - Slide-out sidebar with property listings
 * - Property selection and navigation
 * - User location and map controls
 * 
 * Features:
 * - Property markers with price badges
 * - Clustering for dense areas
 * - Property detail cards
 * - Search and filter integration
 * - Voice navigation support
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CompassMap } from '../../components/compass/CompassMap';
import { CompassSidebar } from '../../components/compass/CompassSidebar';
import { PropertyCard } from '../../components/property/PropertyCard';
import { useAllProperties } from '../../hooks/useProperties';
import { useFavorites } from '../../hooks/useFavorites';
import type { Property } from '../../types/property';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ------------------------------------------------------------------------------
// Selected Property Card (Bottom Sheet Style)
// ------------------------------------------------------------------------------

interface SelectedPropertyCardProps {
  property: Property | null;
  onClose: () => void;
  onViewDetails: (property: Property) => void;
}

function SelectedPropertyCard({ 
  property, 
  onClose, 
  onViewDetails 
}: SelectedPropertyCardProps) {
  if (!property) return null;
  
  return (
    <View style={styles.selectedCardContainer}>
      <View style={styles.selectedCard}>
        <PropertyCard
          property={property}
          onPress={onViewDetails}
          isFavorite={false}
          onToggleFavorite={() => {}}
        />
      </View>
    </View>
  );
}

// ------------------------------------------------------------------------------
// Main Screen
// ------------------------------------------------------------------------------

export default function CompassScreen() {
  const insets = useSafeAreaInsets();
  const { data: properties, isLoading } = useAllProperties();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Get selected property
  const selectedProperty = useMemo(() => {
    if (!selectedPropertyId) return null;
    return properties.find(p => p.id === selectedPropertyId) || null;
  }, [selectedPropertyId, properties]);
  
  // Handlers
  const handlePropertySelect = useCallback((property: Property) => {
    setSelectedPropertyId(property.id);
    setSidebarOpen(false);
  }, []);
  
  const handlePropertyDeselect = useCallback(() => {
    setSelectedPropertyId(null);
  }, []);
  
  const handleViewDetails = useCallback((property: Property) => {
    router.push(`/property/${property.id}`);
  }, []);
  
  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(prev => !prev);
    // Deselect when opening sidebar
    if (!sidebarOpen) {
      setSelectedPropertyId(null);
    }
  }, [sidebarOpen]);
  
  const handleMapPress = useCallback(() => {
    // Close sidebar on map tap
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [sidebarOpen]);
  
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Map */}
      <CompassMap
        properties={properties}
        selectedPropertyId={selectedPropertyId}
        onPropertySelect={handlePropertySelect}
        onMapPress={handleMapPress}
        onSidebarToggle={handleSidebarToggle}
        isLoading={isLoading}
      />
      
      {/* Sidebar */}
      <CompassSidebar
        properties={properties}
        selectedPropertyId={selectedPropertyId}
        onPropertySelect={handlePropertySelect}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onFilterPress={() => setShowFilters(true)}
        isLoading={isLoading}
      />
      
      {/* Selected Property Card */}
      <SelectedPropertyCard
        property={selectedProperty}
        onClose={handlePropertyDeselect}
        onViewDetails={handleViewDetails}
      />
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
  selectedCardContainer: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
  },
  selectedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});

/**
 * CompassSidebar - Property list sidebar for Compass map
 * 
 * A slide-out sidebar showing property listings with:
 * - Filter/sort controls
 * - Property cards list
 * - Selection handling
 * - Search integration
 * 
 * @example
 * ```tsx
 * <CompassSidebar 
 *   properties={properties}
 *   selectedPropertyId={selectedId}
 *   onPropertySelect={handleSelect}
 *   isOpen={sidebarOpen}
 *   onClose={() => setSidebarOpen(false)}
 * />
 * ```
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {
  X,
  Search,
  SlidersHorizontal,
  MapPin,
  ChevronDown,
  List,
  Grid3X3,
  ArrowUpDown,
} from 'lucide-react-native';
import { PropertyCard } from '../property/PropertyCard';
import type { Property } from '../../types/property';
import { cn } from '../../lib/utils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.85;

// ------------------------------------------------------------------------------
// Types
// ------------------------------------------------------------------------------

export interface CompassSidebarProps {
  properties: Property[];
  selectedPropertyId?: string | null;
  onPropertySelect?: (property: Property) => void;
  isOpen: boolean;
  onClose: () => void;
  onFilterPress?: () => void;
  isLoading?: boolean;
}

type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'bedrooms';

interface SortConfig {
  value: SortOption;
  label: string;
}

// ------------------------------------------------------------------------------
// Configuration
// ------------------------------------------------------------------------------

const SORT_OPTIONS: SortConfig[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'bedrooms', label: 'Most Bedrooms' },
];

// ------------------------------------------------------------------------------
// Component
// ------------------------------------------------------------------------------

export function CompassSidebar({
  properties,
  selectedPropertyId,
  onPropertySelect,
  isOpen,
  onClose,
  onFilterPress,
  isLoading = false,
}: CompassSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Animation value for slide
  const slideProgress = useSharedValue(0);
  
  // Update animation when open state changes
  React.useEffect(() => {
    slideProgress.value = withSpring(isOpen ? 1 : 0, {
      damping: 20,
      stiffness: 200,
    });
  }, [isOpen, slideProgress]);
  
  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    let result = [...properties];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.location.suburb.toLowerCase().includes(query) ||
        p.location.address.toLowerCase().includes(query)
      );
    }
    
    // Sort
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => {
          const priceA = a.price.type === 'fixed' ? a.price.amount : (a.price.minAmount || 0);
          const priceB = b.price.type === 'fixed' ? b.price.amount : (b.price.minAmount || 0);
          return priceA - priceB;
        });
        break;
      case 'price_desc':
        result.sort((a, b) => {
          const priceA = a.price.type === 'fixed' ? a.price.amount : (a.price.maxAmount || 0);
          const priceB = b.price.type === 'fixed' ? b.price.amount : (b.price.maxAmount || 0);
          return priceB - priceA;
        });
        break;
      case 'bedrooms':
        result.sort((a, b) => b.features.bedrooms - a.features.bedrooms);
        break;
      case 'newest':
      default:
        // Keep original order (assumed to be by date)
        break;
    }
    
    return result;
  }, [properties, searchQuery, sortBy]);
  
  // Animated styles
  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          slideProgress.value,
          [0, 1],
          [-SIDEBAR_WIDTH, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));
  
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      slideProgress.value,
      [0, 1],
      [0, 0.5],
      Extrapolation.CLAMP
    ),
    pointerEvents: slideProgress.value > 0.5 ? 'auto' : 'none',
  }));
  
  // Handlers
  const handlePropertyPress = useCallback((property: Property) => {
    onPropertySelect?.(property);
  }, [onPropertySelect]);
  
  const handleSortSelect = useCallback((option: SortOption) => {
    setSortBy(option);
    setShowSortDropdown(false);
  }, []);
  
  const selectedSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sort';
  
  return (
    <>
      {/* Overlay */}
      <Animated.View
        style={[styles.overlay, overlayStyle]}
        onTouchStart={onClose}
      />
      
      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, sidebarStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Properties</Text>
              <Text style={styles.subtitle}>
                {filteredProperties.length} listings
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInput}>
              <Search size={16} color="#666" />
              <TextInput
                style={styles.searchText}
                placeholder="Search in results..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={16} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={onFilterPress}
            >
              <SlidersHorizontal size={18} color="#666" />
            </TouchableOpacity>
          </View>
          
          {/* Controls */}
          <View style={styles.controls}>
            {/* Sort Dropdown */}
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setShowSortDropdown(!showSortDropdown)}
            >
              <ArrowUpDown size={14} color="#666" />
              <Text style={styles.sortText}>{selectedSortLabel}</Text>
              <ChevronDown 
                size={14} 
                color="#666" 
                style={{ transform: [{ rotate: showSortDropdown ? '180deg' : '0deg' }] }}
              />
            </TouchableOpacity>
            
            {/* View Mode Toggle */}
            <View style={styles.viewModeContainer}>
              <TouchableOpacity
                style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeActive]}
                onPress={() => setViewMode('list')}
              >
                <List size={16} color={viewMode === 'list' ? '#0ea5e9' : '#666'} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeActive]}
                onPress={() => setViewMode('grid')}
              >
                <Grid3X3 size={16} color={viewMode === 'grid' ? '#0ea5e9' : '#666'} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Sort Dropdown Menu */}
          {showSortDropdown && (
            <View style={styles.sortDropdown}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortOption,
                    sortBy === option.value && styles.sortOptionActive,
                  ]}
                  onPress={() => handleSortSelect(option.value)}
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      sortBy === option.value && styles.sortOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        {/* Property List */}
        <ScrollView
          style={styles.propertyList}
          contentContainerStyle={styles.propertyListContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Loading properties...</Text>
            </View>
          ) : filteredProperties.length === 0 ? (
            <View style={styles.emptyState}>
              <MapPin size={48} color="#333" />
              <Text style={styles.emptyTitle}>No properties found</Text>
              <Text style={styles.emptyText}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            <View style={viewMode === 'grid' ? styles.grid : styles.list}>
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onPress={handlePropertyPress}
                  isFavorite={false}
                  onToggleFavorite={() => {}}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </>
  );
}

// ------------------------------------------------------------------------------
// Styles
// ------------------------------------------------------------------------------

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 100,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#0a0a0a',
    zIndex: 101,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  sortText: {
    color: '#ffffff',
    fontSize: 13,
  },
  viewModeContainer: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 4,
  },
  viewModeButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewModeActive: {
    backgroundColor: '#0ea5e920',
  },
  sortDropdown: {
    position: 'absolute',
    top: 140,
    left: 16,
    right: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 8,
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sortOptionActive: {
    backgroundColor: '#0ea5e920',
  },
  sortOptionText: {
    color: '#999',
    fontSize: 14,
  },
  sortOptionTextActive: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  propertyList: {
    flex: 1,
  },
  propertyListContent: {
    padding: 16,
  },
  list: {
    gap: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default CompassSidebar;

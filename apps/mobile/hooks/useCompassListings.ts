/**
 * useCompassListings - Compass map listings hook
 * 
 * Specialized hook for map-based property discovery with:
 * - Geospatial clustering
 * - Viewport-based filtering
 * - Property density analysis
 * - Map interaction state
 * 
 * @example
 * ```tsx
 * const { 
 *   visibleProperties, 
 *   clusters, 
 *   updateViewport,
 *   selectedCluster 
 * } = useCompassListings({
 *   properties,
 *   clusterRadius: 50
 * });
 * ```
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import type { Property } from '../types/property';

// ------------------------------------------------------------------------------
// Types
// ------------------------------------------------------------------------------

export interface Viewport {
  north: number;
  south: number;
  east: number;
  west: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface PropertyCluster {
  id: string;
  coordinate: Coordinate;
  properties: Property[];
  count: number;
  priceRange: {
    min: number;
    max: number;
  };
}

export interface UseCompassListingsOptions {
  properties: Property[];
  clusterRadius?: number; // pixels
  maxZoomForClustering?: number;
  minClusterSize?: number;
}

export interface UseCompassListingsReturn {
  // Properties
  visibleProperties: Property[];
  allProperties: Property[];
  
  // Clusters
  clusters: PropertyCluster[];
  selectedCluster: PropertyCluster | null;
  selectCluster: (cluster: PropertyCluster | null) => void;
  expandCluster: (cluster: PropertyCluster) => void;
  
  // Viewport
  viewport: Viewport | null;
  updateViewport: (viewport: Viewport) => void;
  isInViewport: (coordinate: Coordinate) => boolean;
  
  // Selected property
  selectedPropertyId: string | null;
  selectProperty: (propertyId: string | null) => void;
  selectedProperty: Property | null;
  
  // Density
  propertyDensity: 'low' | 'medium' | 'high';
  visibleCount: number;
  totalCount: number;
  
  // Bounds
  fitToProperties: (propertyIds: string[]) => Coordinate[];
  centerOnProperty: (propertyId: string) => Coordinate | null;
}

// ------------------------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------------------------

function coordinateInViewport(coordinate: Coordinate, viewport: Viewport): boolean {
  return (
    coordinate.latitude <= viewport.north &&
    coordinate.latitude >= viewport.south &&
    coordinate.longitude <= viewport.east &&
    coordinate.longitude >= viewport.west
  );
}

function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
  // Simple Euclidean distance (good enough for small distances)
  const latDiff = coord1.latitude - coord2.latitude;
  const lngDiff = coord1.longitude - coord2.longitude;
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
}

function getPropertyCoordinate(property: Property): Coordinate | null {
  if (property.location.latitude && property.location.longitude) {
    return {
      latitude: property.location.latitude,
      longitude: property.location.longitude
    };
  }
  return null;
}

function formatPriceValue(property: Property): number {
  if (property.price.type === 'fixed') {
    return property.price.amount;
  } else if (property.price.type === 'range') {
    return property.price.minAmount || property.price.maxAmount || 0;
  }
  return 0;
}

// ------------------------------------------------------------------------------
// Hook
// ------------------------------------------------------------------------------

export function useCompassListings(
  options: UseCompassListingsOptions
): UseCompassListingsReturn {
  const {
    properties,
    clusterRadius = 60,
    maxZoomForClustering = 15,
    minClusterSize = 2
  } = options;
  
  // State
  const [viewport, setViewport] = useState<Viewport | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<PropertyCluster | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  
  // --------------------------------------------------------------------------
  // Viewport Management
  // --------------------------------------------------------------------------
  
  const updateViewport = useCallback((newViewport: Viewport) => {
    setViewport(newViewport);
    // Clear selection when viewport changes significantly
    if (selectedCluster) {
      const stillVisible = selectedCluster.properties.some(p => {
        const coord = getPropertyCoordinate(p);
        return coord && coordinateInViewport(coord, newViewport);
      });
      if (!stillVisible) {
        setSelectedCluster(null);
      }
    }
  }, [selectedCluster]);
  
  const isInViewport = useCallback((coordinate: Coordinate): boolean => {
    if (!viewport) return true;
    return coordinateInViewport(coordinate, viewport);
  }, [viewport]);
  
  // --------------------------------------------------------------------------
  // Property Filtering
  // --------------------------------------------------------------------------
  
  const propertiesWithCoordinates = useMemo(() => {
    return properties.filter(p => 
      p.location.latitude !== undefined && 
      p.location.longitude !== undefined
    );
  }, [properties]);
  
  const visibleProperties = useMemo(() => {
    if (!viewport) return propertiesWithCoordinates;
    
    return propertiesWithCoordinates.filter(property => {
      const coord = getPropertyCoordinate(property);
      return coord && coordinateInViewport(coord, viewport);
    });
  }, [propertiesWithCoordinates, viewport]);
  
  // --------------------------------------------------------------------------
  // Clustering
  // --------------------------------------------------------------------------
  
  const clusters = useMemo(() => {
    // Skip clustering if zoomed in too far
    if (viewport && viewport.latitudeDelta < 0.01) {
      return [];
    }
    
    const clusters: PropertyCluster[] = [];
    const processed = new Set<string>();
    
    // Simple clustering algorithm
    for (const property of visibleProperties) {
      if (processed.has(property.id)) continue;
      
      const propertyCoord = getPropertyCoordinate(property);
      if (!propertyCoord) continue;
      
      const clusterProperties: Property[] = [property];
      processed.add(property.id);
      
      // Find nearby properties
      for (const other of visibleProperties) {
        if (processed.has(other.id)) continue;
        
        const otherCoord = getPropertyCoordinate(other);
        if (!otherCoord) continue;
        
        const distance = calculateDistance(propertyCoord, otherCoord);
        
        // Convert clusterRadius from pixels to approximate coordinate delta
        // This is a rough approximation
        const threshold = (viewport?.latitudeDelta || 0.1) * (clusterRadius / 500);
        
        if (distance < threshold) {
          clusterProperties.push(other);
          processed.add(other.id);
        }
      }
      
      // Create cluster if multiple properties
      if (clusterProperties.length >= minClusterSize) {
        const prices = clusterProperties.map(formatPriceValue).filter(p => p > 0);
        const avgLat = clusterProperties.reduce((sum, p) => sum + (p.location.latitude || 0), 0) / clusterProperties.length;
        const avgLng = clusterProperties.reduce((sum, p) => sum + (p.location.longitude || 0), 0) / clusterProperties.length;
        
        clusters.push({
          id: `cluster_${property.id}`,
          coordinate: { latitude: avgLat, longitude: avgLng },
          properties: clusterProperties,
          count: clusterProperties.length,
          priceRange: {
            min: Math.min(...prices),
            max: Math.max(...prices)
          }
        });
      }
    }
    
    return clusters;
  }, [visibleProperties, viewport, clusterRadius, minClusterSize]);
  
  // --------------------------------------------------------------------------
  // Selection
  // --------------------------------------------------------------------------
  
  const selectCluster = useCallback((cluster: PropertyCluster | null) => {
    setSelectedCluster(cluster);
    if (cluster) {
      setSelectedPropertyId(null);
    }
  }, []);
  
  const expandCluster = useCallback((cluster: PropertyCluster) => {
    // Zoom in to show individual properties in cluster
    if (viewport) {
      const newViewport: Viewport = {
        ...viewport,
        latitudeDelta: viewport.latitudeDelta / 3,
        longitudeDelta: viewport.longitudeDelta / 3,
        north: cluster.coordinate.latitude + viewport.latitudeDelta / 6,
        south: cluster.coordinate.latitude - viewport.latitudeDelta / 6,
        east: cluster.coordinate.longitude + viewport.longitudeDelta / 6,
        west: cluster.coordinate.longitude - viewport.longitudeDelta / 6
      };
      setViewport(newViewport);
    }
    setSelectedCluster(null);
  }, [viewport]);
  
  const selectProperty = useCallback((propertyId: string | null) => {
    setSelectedPropertyId(propertyId);
    if (propertyId) {
      setSelectedCluster(null);
    }
  }, []);
  
  const selectedProperty = useMemo(() => {
    if (!selectedPropertyId) return null;
    return properties.find(p => p.id === selectedPropertyId) || null;
  }, [selectedPropertyId, properties]);
  
  // --------------------------------------------------------------------------
  // Density & Counts
  // --------------------------------------------------------------------------
  
  const propertyDensity = useMemo(() => {
    const count = visibleProperties.length;
    if (count < 10) return 'low';
    if (count < 50) return 'medium';
    return 'high';
  }, [visibleProperties]);
  
  // --------------------------------------------------------------------------
  // Bounds
  // --------------------------------------------------------------------------
  
  const fitToProperties = useCallback((propertyIds: string[]): Coordinate[] => {
    const selected = properties.filter(p => propertyIds.includes(p.id));
    return selected
      .map(getPropertyCoordinate)
      .filter((coord): coord is Coordinate => coord !== null);
  }, [properties]);
  
  const centerOnProperty = useCallback((propertyId: string): Coordinate | null => {
    const property = properties.find(p => p.id === propertyId);
    return property ? getPropertyCoordinate(property) : null;
  }, [properties]);
  
  return {
    visibleProperties,
    allProperties: properties,
    clusters,
    selectedCluster,
    selectCluster,
    expandCluster,
    viewport,
    updateViewport,
    isInViewport,
    selectedPropertyId,
    selectProperty,
    selectedProperty,
    propertyDensity,
    visibleCount: visibleProperties.length,
    totalCount: properties.length,
    fitToProperties,
    centerOnProperty
  };
}

export default useCompassListings;

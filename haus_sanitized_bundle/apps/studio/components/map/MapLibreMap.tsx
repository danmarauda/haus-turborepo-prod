
import React, { useEffect, useRef, useState } from 'react';
import { Map as MapLibreMap, Marker } from 'maplibre-gl';
import { type Property } from '../../types';

interface MapProps {
  viewState: {
    lat: number;
    lng: number;
    zoom: number;
  };
  properties?: Property[];
  onPropertyClick?: (property: Property) => void;
  radiusKm?: number;
}

const Map: React.FC<MapProps> = ({ viewState, properties = [], onPropertyClick, radiusKm }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new MapLibreMap({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors',
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [viewState.lng, viewState.lat],
      zoom: viewState.zoom,
      attributionControl: false
    });

    map.current.on('load', () => {
        setIsMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update View State (FlyTo)
  useEffect(() => {
    if (!map.current) return;
    map.current.flyTo({
      center: [viewState.lng, viewState.lat],
      zoom: viewState.zoom,
      essential: true,
      speed: 1.2,
      curve: 1.42, 
    });
  }, [viewState]);

  // Update Markers
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    properties.forEach(property => {
      const el = document.createElement('div');
      el.className = 'w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center cursor-pointer transform transition-transform hover:scale-110';
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
      
      el.addEventListener('click', (e) => {
          e.stopPropagation();
          if (onPropertyClick) onPropertyClick(property);
      });

      const marker = new Marker({ element: el })
        .setLngLat([property.lng, property.lat])
        .addTo(map.current!);
      
      markersRef.current.push(marker);
    });
  }, [properties, isMapLoaded, onPropertyClick]);

  // Update Radius Circle
  useEffect(() => {
      if (!map.current || !isMapLoaded) return;

      const sourceId = 'radius-source';
      const layerId = 'radius-layer';
      const lineLayerId = 'radius-line-layer';

      if (map.current.getSource(sourceId)) {
          map.current.removeLayer(layerId);
          map.current.removeLayer(lineLayerId);
          map.current.removeSource(sourceId);
      }

      if (radiusKm && radiusKm > 0) {
          const center = [viewState.lng, viewState.lat];
          
          // Generate GeoJSON circle manually
          const createGeoJSONCircle = (center: number[], radiusInKm: number, points: number = 64) => {
            const coords = { latitude: center[1], longitude: center[0] };
            const km = radiusInKm;
            const ret = [];
            const distanceX = km / (111.320 * Math.cos(coords.latitude * Math.PI / 180));
            const distanceY = km / 110.574;

            let theta, x, y;
            for(let i=0; i<points; i++) {
                theta = (i / points) * (2 * Math.PI);
                x = distanceX * Math.cos(theta);
                y = distanceY * Math.sin(theta);
                ret.push([coords.longitude+x, coords.latitude+y]);
            }
            ret.push(ret[0]);
            return {
                type: "Feature",
                geometry: {
                    type: "Polygon",
                    coordinates: [ret]
                }
            };
        };

        const circleGeoJSON = createGeoJSONCircle(center, radiusKm);

        map.current.addSource(sourceId, {
            type: 'geojson',
            data: circleGeoJSON as any
        });

        map.current.addLayer({
            id: layerId,
            type: 'fill',
            source: sourceId,
            layout: {},
            paint: {
                'fill-color': '#3B82F6',
                'fill-opacity': 0.15
            }
        });
        
        map.current.addLayer({
            id: lineLayerId,
            type: 'line',
            source: sourceId,
            layout: {},
            paint: {
                'line-color': '#3B82F6',
                'line-width': 2,
                'line-dasharray': [2, 2]
            }
        });
      }

  }, [radiusKm, viewState, isMapLoaded]);

  return (
    <div className="relative w-full h-full bg-neutral-900 overflow-hidden rounded-3xl">
      <div 
        ref={mapContainer} 
        className="w-full h-full filter brightness-[0.7] contrast-[1.2] saturate-[0.8]" 
        style={{ borderRadius: 'inherit' }}
      />
      
      {/* Decorative Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-transparent to-neutral-950/90 pointer-events-none rounded-3xl" />
    </div>
  );
};

export default Map;

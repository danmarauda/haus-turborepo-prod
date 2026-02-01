
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Property, MapViewState, MapLayerConfig } from '../types';

interface MapViewProps {
  properties: Property[];
  selectedId: string | null;
  mapState: MapViewState;
  layerConfig: MapLayerConfig;
  onMarkerClick: (id: string) => void;
  onMapUpdate: (lat: number, lng: number, zoom: number) => void;
}

const MapView = ({ properties, selectedId, mapState, layerConfig, onMarkerClick, onMapUpdate }: MapViewProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  // Determine CSS filters based on layer style
  const mapFilters = useMemo(() => {
    switch (layerConfig.style) {
        case 'satellite':
            return 'grayscale-[0.5] invert-[0.8] contrast-125 brightness-75 sepia-[0.2] hue-rotate-180';
        case 'terrain':
            return 'grayscale-[0.2] invert-[0.1] sepia-[0.4] contrast-100 brightness-90';
        case 'roadmap':
        default:
            return 'grayscale invert opacity-30 contrast-125 scale-110';
    }
  }, [layerConfig.style]);

  // Handle Dragging Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragOffset({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Commit the pan to the map state
    // Calculation: at Zoom Z, 360 deg = 256 * 2^Z pixels
    const worldSize = 256 * Math.pow(2, mapState.zoom);
    const latDelta = (dragOffset.y / worldSize) * 180; // Approximate
    const lngDelta = -(dragOffset.x / worldSize) * 360; 

    // We scale the delta because the iframe view is smaller than the full world width
    // A heuristic multiplier improves the "feel" of the drag to match cursor
    const SENSITIVITY = 1.0; 

    onMapUpdate(
      mapState.center.lat + (latDelta * SENSITIVITY),
      mapState.center.lng + (lngDelta * SENSITIVITY),
      mapState.zoom
    );
    
    setDragOffset({ x: 0, y: 0 });
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
    }
  };

  return (
    <main 
      className={`absolute inset-0 w-full h-full bg-[#0a0a0a] overflow-hidden cursor-${isDragging ? 'grabbing' : 'grab'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      ref={mapRef}
    >
      {/* Transform Container for Smooth Panning/Zooming */}
      <div 
        className="w-full h-full relative transition-transform duration-75 ease-linear will-change-transform"
        style={{ 
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
        }}
      >
          {/* Background Map Frame */}
          <iframe 
            src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1000000!2d${mapState.center.lng}!3d${mapState.center.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sau!4v1703877600000!5m2!1sen!2sau`}
            width="100%" 
            height="100%" 
            className={`absolute inset-0 transition-all duration-1000 ease-in-out pointer-events-none ${mapFilters}`}
            allowFullScreen={true} 
            loading="lazy" 
          />

          {/* Traffic Layer Simulation */}
          {layerConfig.showTraffic && (
            <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-screen animate-pulse">
                <svg className="w-full h-full">
                    <path d="M0,300 Q400,250 800,300 T1600,300" stroke="#ef4444" strokeWidth="2" fill="none" />
                    <path d="M0,350 Q300,400 600,350 T1200,400" stroke="#10b981" strokeWidth="2" fill="none" />
                    <path d="M200,0 Q250,400 200,800" stroke="#f59e0b" strokeWidth="2" fill="none" />
                    <path d="M800,0 Q750,400 800,800" stroke="#ef4444" strokeWidth="2" fill="none" />
                </svg>
            </div>
          )}

          {/* Interactive Overlay Layer */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <svg className="w-full h-full">
              {/* Markers Grounded to Geography */}
              {properties.map((prop) => {
                const isSelected = selectedId === prop.id;
                
                // Simple Mercator Projection for Marker Positioning
                // Calculates screen position relative to the center of the map
                const pixelsPerDegree = (256 * Math.pow(2, mapState.zoom)) / 360;
                const dx = (prop.coordinates.lng - mapState.center.lng) * pixelsPerDegree;
                const dy = (prop.coordinates.lat - mapState.center.lat) * pixelsPerDegree; // Inverted Y for Lat
                
                // Center + Delta (Assuming standard window size reference or %, using % for responsiveness)
                // We use a fixed scale factor to map pixel difference to CSS % relative to viewport
                // This is an approximation for the demo visual
                const xPct = 50 + (dx / window.innerWidth * 100);
                const yPct = 50 - (dy / window.innerHeight * 100);

                // Only render if within reasonable bounds to prevent DOM overload
                if (xPct < -20 || xPct > 120 || yPct < -20 || yPct > 120) return null;

                return (
                  <g 
                    key={prop.id} 
                    className="cursor-pointer pointer-events-auto transition-transform duration-300"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent drag start
                        onMarkerClick(prop.id);
                    }}
                  >
                    {isSelected && (
                      <circle 
                        cx={`${xPct}%`} cy={`${yPct}%`} r="30" 
                        className="fill-emerald-500/10 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" 
                      />
                    )}
                    {/* Marker Outer Ring */}
                    <circle 
                      cx={`${xPct}%`} cy={`${yPct}%`} r={isSelected ? "10" : "6"} 
                      className={`transition-all duration-300 ${isSelected ? 'stroke-emerald-400 stroke-[3]' : 'stroke-zinc-600 stroke-2'}`}
                      fill="#000"
                    />
                    {/* Marker Center */}
                    <circle 
                      cx={`${xPct}%`} cy={`${yPct}%`} r={isSelected ? "4" : "2"} 
                      className={`transition-all duration-300 ${isSelected ? 'fill-emerald-500' : 'fill-zinc-400'}`}
                    />
                    
                    {/* Label (Only visible on hover or select) */}
                    {(isSelected || mapState.zoom > 14) && (
                        <foreignObject x={`${xPct}%`} y={`${yPct}%`} width="150" height="50" className="overflow-visible pointer-events-none transform translate-x-4 -translate-y-6">
                            <div className="bg-black/80 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-lg flex flex-col animate-slide-up shadow-xl">
                                <span className="text-[10px] font-bold text-white whitespace-nowrap">{prop.price}</span>
                                <span className="text-[8px] text-zinc-400 whitespace-nowrap uppercase tracking-wider">{prop.suburb}</span>
                            </div>
                        </foreignObject>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
      </div>
    </main>
  );
};

export default MapView;

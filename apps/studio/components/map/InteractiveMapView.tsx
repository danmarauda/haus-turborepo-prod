import React, { useState } from 'react';
import { type Property } from '../../types';
import { MapPinIcon, EyeIcon } from './IconComponents';

interface MapViewProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
}

const MapView: React.FC<MapViewProps> = ({ properties, onPropertyClick }) => {
    const [activeProperty, setActiveProperty] = useState<Property | null>(null);

    // Bounding box for Australia/NZ to normalize coordinates
    const bounds = {
        minLng: 113.338953, // West
        maxLng: 178.418732, // East
        minLat: -47.159842, // South
        maxLat: -10.063889, // North
    };

    const normalizeCoords = (lat: number, lng: number) => {
        const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
        const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
        return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
    };

    const handlePinClick = (e: React.MouseEvent, property: Property) => {
        e.stopPropagation();
        setActiveProperty(property);
    };

    return (
        <div className="relative w-full aspect-[16/9] bg-neutral-800 rounded-xl overflow-hidden border border-white/10" onClick={() => setActiveProperty(null)}>
            <img src="https://i.imgur.com/2A2nEjQ.png" alt="Map of Australia and New Zealand" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/50 to-transparent"></div>

            {properties.map(property => {
                const { x, y } = normalizeCoords(property.lat, property.lng);
                const isActive = activeProperty?.id === property.id;
                return (
                    <button
                        key={property.id}
                        onClick={(e) => handlePinClick(e, property)}
                        className="absolute -translate-x-1/2 -translate-y-full transition-transform duration-200 hover:scale-125 z-10"
                        style={{ left: `${x}%`, top: `${y}%` }}
                        aria-label={`View property: ${property.title}`}
                    >
                        <MapPinIcon className={`w-6 h-6 stroke-[1.5] drop-shadow-lg transition-colors ${isActive ? 'text-blue-400 fill-blue-400/30' : 'text-neutral-100 fill-neutral-900/50'}`} />
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400 animate-ping ${isActive ? 'block' : 'hidden'}`}></div>
                    </button>
                );
            })}

            {activeProperty && (() => {
                const { x, y } = normalizeCoords(activeProperty.lat, activeProperty.lng);

                const finalPosition = {
                    top: `calc(${y}% + 0.5rem)`,
                    left: x > 50 ? `auto` : `calc(${x}% + 0.5rem)`,
                    right: x > 50 ? `calc(${100 - x}% + 0.5rem)` : `auto`,
                    transform: y > 50 ? 'translateY(-100%)' : '',
                };
                
                return (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute w-64 bg-neutral-900/80 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl z-20 animate-scale-up"
                        style={{ ...finalPosition }}
                    >
                        <img src={activeProperty.imageUrl} alt={activeProperty.title} className="w-full h-24 object-cover rounded-t-xl" />
                        <div className="p-3">
                            <h4 className="font-semibold text-sm text-white font-geist line-clamp-1">{activeProperty.title}</h4>
                            <p className="text-sm font-bold text-white font-geist mt-1">{activeProperty.price}</p>
                            <button onClick={() => onPropertyClick(activeProperty)} className="mt-2 w-full inline-flex items-center justify-center gap-2 text-xs font-medium tracking-tight text-white bg-white/10 hover:bg-white/20 rounded-lg py-1.5 border border-white/20 backdrop-blur-md font-geist transition-colors duration-200">
                                <EyeIcon className="w-3.5 h-3.5" />
                                View Details
                            </button>
                        </div>
                    </div>
                )
            })()}
        </div>
    );
};

export default MapView;

import React, { useState, useEffect, useCallback } from 'react';
import PropertySidebar from './components/PropertySidebar';
import MapView from './components/MapView';
import AIAgent from './components/AIAgent';
import ComparisonView from './components/ComparisonView';
import SuburbanIntelligence from './components/SuburbanIntelligence';
import MapLibreMap from './components/map/MapLibreMap';
import VoiceSearch from './components/VoiceSearch';
import Header from './components/Header';
import { Property, MapViewState, MapLayerConfig } from './types';
import { PREMIUM_PROPERTIES } from './constants';
import { useFavorites } from './contexts/FavoritesContext';

type ViewMode = 'premium' | 'map' | 'voice';

const App = () => {
  const [properties] = useState<Property[]>(PREMIUM_PROPERTIES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('premium');

  // Comparison State
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const [mapState, setMapState] = useState<MapViewState>({
    center: { lat: -33.8688, lng: 151.2093 },
    zoom: 10
  });
  const [layerConfig, setLayerConfig] = useState<MapLayerConfig>({
    style: 'roadmap',
    showTraffic: false
  });

  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();

  // Derive the selected property object
  const selectedProperty = properties.find(p => p.id === selectedId) || null;

  // Derive comparison properties
  const comparisonProperties = properties.filter(p => compareIds.includes(p.id));

  const handleSelectProperty = useCallback((id: string | null) => {
    setSelectedId(id);
    const prop = properties.find(p => p.id === id);
    if (prop) {
      setMapState({
        center: prop.coordinates,
        zoom: 16
      });
    }
  }, [properties]);

  const handleMapControl = useCallback((lat: number, lng: number, zoom: number) => {
    setMapState({ center: { lat, lng }, zoom });
  }, []);

  const handleAICmd = (cmd: string) => {
    const c = cmd.toLowerCase();
    const found = properties.find(p =>
      c.includes(p.suburb.toLowerCase()) ||
      c.includes(p.address.toLowerCase())
    );
    if (found) handleSelectProperty(found.id);
  };

  const handleVoiceSearch = (query: string) => {
    handleAICmd(query);
  };

  // Comparison Handlers
  const handleToggleCompare = useCallback((id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(pid => pid !== id);
      if (prev.length >= 4) return prev; // Max 4
      return [...prev, id];
    });
  }, []);

  const handleRemoveCompare = useCallback((id: string) => {
    setCompareIds(prev => prev.filter(pid => pid !== id));
    if (compareIds.length <= 1) setIsComparing(false); // Auto close if empty
  }, [compareIds]);

  useEffect(() => {
    const win = window as any;
    if (win.lucide) {
      win.lucide.createIcons();
    }
  }, [selectedId, properties, mapState, activeFilter, layerConfig, compareIds, isComparing]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans select-none text-zinc-400">

      {/* Header with auth and view switcher */}
      <Header />

      {/* View Mode Switcher */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-zinc-900/90 backdrop-blur-sm p-1.5 rounded-full border border-zinc-800">
        <button
          onClick={() => setViewMode('premium')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            viewMode === 'premium'
              ? 'bg-emerald-500 text-black'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Premium
        </button>
        <button
          onClick={() => setViewMode('map')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            viewMode === 'map'
              ? 'bg-blue-500 text-black'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Map
        </button>
        <button
          onClick={() => setViewMode('voice')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            viewMode === 'voice'
              ? 'bg-purple-500 text-black'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Voice
        </button>
      </div>

      {/* Main Content based on view mode */}
      {viewMode === 'premium' && (
        <>
          {/* The Map Nexus (Background Layer) */}
          <MapView
            properties={properties}
            selectedId={selectedId}
            mapState={mapState}
            layerConfig={layerConfig}
            onMarkerClick={handleSelectProperty}
            onMapUpdate={handleMapControl}
          />

          {/* The Property Vault (Floating Left Panel) */}
          <PropertySidebar
            properties={properties}
            selectedId={selectedId}
            activeFilter={activeFilter}
            onSelect={handleSelectProperty}
            compareIds={compareIds}
            onToggleCompare={handleToggleCompare}
          />

          {/* Suburban Intelligence (Floating Right Panel) - Context Aware */}
          {selectedProperty && (
            <SuburbanIntelligence property={selectedProperty} />
          )}

          {/* The Unified Command Deck (Floating Bottom Center) */}
          <AIAgent
            onCommand={handleAICmd}
            mapState={mapState}
            onMapControl={handleMapControl}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            layerConfig={layerConfig}
            onLayerConfigChange={setLayerConfig}
            selectedProperty={selectedProperty}
            properties={properties}
            compareCount={compareIds.length}
            onViewComparison={() => setIsComparing(true)}
            onSelectProperty={(id) => handleSelectProperty(id)}
          />
        </>
      )}

      {viewMode === 'map' && (
        <div className="relative w-full h-full p-6 pt-24">
          <div className="w-full h-full rounded-3xl overflow-hidden border border-zinc-800">
            <MapLibreMap
              viewState={{
                lat: mapState.center.lat,
                lng: mapState.center.lng,
                zoom: mapState.zoom
              }}
              properties={properties.map(p => ({
                ...p,
                lat: p.coordinates.lat,
                lng: p.coordinates.lng
              }))}
              onPropertyClick={(prop) => handleSelectProperty(prop.id)}
            />
          </div>

          {/* Favorites count overlay */}
          {favorites.length > 0 && (
            <div className="absolute top-28 right-8 bg-zinc-900/90 backdrop-blur-sm px-4 py-2 rounded-full border border-zinc-800">
              <span className="text-xs font-medium text-zinc-400">
                {favorites.length} {favorites.length === 1 ? 'favorite' : 'favorites'}
              </span>
            </div>
          )}
        </div>
      )}

      {viewMode === 'voice' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Voice Search</h2>
              <p className="text-zinc-400">Search properties using your voice</p>
            </div>

            <div className="flex justify-center mb-8">
              <VoiceSearch onSearchResult={handleVoiceSearch} />
            </div>

            {selectedProperty && (
              <div className="mt-12 bg-zinc-900/90 backdrop-blur-sm p-8 rounded-3xl border border-zinc-800 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-white mb-4">
                  {selectedProperty.address}
                </h3>
                <p className="text-zinc-400 mb-2">{selectedProperty.suburb}</p>
                <p className="text-2xl font-bold text-emerald-400 mb-4">
                  {selectedProperty.price}
                </p>
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  <span>{selectedProperty.beds} beds</span>
                  <span>{selectedProperty.baths} baths</span>
                  <span>{selectedProperty.cars} cars</span>
                </div>

                <button
                  onClick={() => {
                    if (isFavorite(selectedProperty.id)) {
                      removeFavorite(selectedProperty.id);
                    } else {
                      addFavorite(selectedProperty.id);
                    }
                  }}
                  className={`mt-6 w-full py-3 rounded-full font-bold uppercase tracking-wider transition-all ${
                    isFavorite(selectedProperty.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-emerald-500 text-black'
                  }`}
                >
                  {isFavorite(selectedProperty.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comparison Modal Overlay */}
      {isComparing && (
        <ComparisonView
          properties={comparisonProperties}
          onClose={() => setIsComparing(false)}
          onRemove={handleRemoveCompare}
        />
      )}
    </div>
  );
};

export default App;

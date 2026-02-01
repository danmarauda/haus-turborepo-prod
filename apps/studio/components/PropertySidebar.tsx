
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Property } from '../types';
import Icon from './Icon';

interface PropertySidebarProps {
  properties: Property[];
  selectedId: string | null;
  activeFilter: string;
  onSelect: (id: string | null) => void;
  compareIds: string[];
  onToggleCompare: (id: string) => void;
  onViewComparison?: () => void;
}

const RECENT_LIMIT = 5;
const STORAGE_KEY = 'haus_recently_viewed';

const PropertySidebar = ({ properties, selectedId, activeFilter, onSelect, compareIds, onToggleCompare }: PropertySidebarProps) => {
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);

  // Load recently viewed from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentlyViewedIds(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse recently viewed", e);
      }
    }
  }, []);

  // Update recently viewed when selectedId changes
  useEffect(() => {
    if (selectedId) {
      setRecentlyViewedIds(prev => {
        const filtered = prev.filter(id => id !== selectedId);
        const next = [selectedId, ...filtered].slice(0, RECENT_LIMIT);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, [selectedId]);

  // Memoize filtering and selection
  const { featured, others, recentlyViewed } = useMemo(() => {
    let filtered = properties;
    
    if (activeFilter !== 'All') {
        if (activeFilter === 'Houses') filtered = properties.filter(p => p.description.toLowerCase().includes('house') || p.sqm > 500);
        else if (activeFilter === 'Apts') filtered = properties.filter(p => p.description.toLowerCase().includes('apartment') || p.sqm < 500);
        else if (activeFilter === 'Under $5M') filtered = properties.filter(p => parseInt(p.price.replace(/\D/g, '')) < 5000000);
        else if (activeFilter === 'Beachfront') filtered = properties.filter(p => p.description.toLowerCase().includes('beach') || p.description.toLowerCase().includes('ocean'));
    }

    const feat = filtered.find(p => p.id === selectedId);
    const rest = filtered.filter(p => p.id !== selectedId);

    // Map IDs back to property objects for recently viewed section
    const recent = recentlyViewedIds
      .map(id => properties.find(p => p.id === id))
      .filter((p): p is Property => !!p && p.id !== selectedId);

    return { featured: feat, others: rest, recentlyViewed: recent };
  }, [properties, selectedId, activeFilter, recentlyViewedIds]);

  // Featured Carousel State
  const [featuredImgIndex, setFeaturedImgIndex] = useState(0);

  // Reset carousel when featured property changes
  useEffect(() => {
    setFeaturedImgIndex(0);
  }, [featured?.id]);

  const featuredImages = featured?.images?.length ? featured.images : (featured ? [featured.thumbnail] : []);

  const nextFeatured = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFeaturedImgIndex(prev => (prev + 1) % featuredImages.length);
  };

  const prevFeatured = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFeaturedImgIndex(prev => (prev - 1 + featuredImages.length) % featuredImages.length);
  };

  return (
    <section className="absolute top-4 left-4 bottom-36 w-[400px] bg-[#050505]/95 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col z-20 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-500 overflow-hidden">
      
      {/* Minimal Brand Header */}
      <header className="px-6 py-6 border-b border-white/5 shrink-0 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-between">
          <div className="flex flex-col">
              <h2 className="text-sm font-black text-white tracking-[0.3em] uppercase leading-tight">HAUS</h2>
              <span className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase">Premium Listings</span>
          </div>
          
          <div className="flex items-center gap-2">
            {!compareIds.length ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-zinc-300 uppercase tracking-tight">Live Market</span>
                </div>
            ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                     <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tight">Selecting ({compareIds.length})</span>
                </div>
            )}
          </div>
      </header>

      {/* Property List Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar relative">
        
        {/* HERO SECTION (Selected Property) */}
        {featured && (
            <div className="mb-8 animate-slide-up">
                <div className="flex items-center gap-2 mb-3 px-1">
                    <Icon name="sparkles" className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Active Selection</span>
                </div>
                
                <article className="group relative overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/10 ring-1 ring-white/5 shadow-2xl">
                    <div className="aspect-[16/10] overflow-hidden relative">
                        <img 
                            src={featuredImages[featuredImgIndex]} 
                            alt={featured.address} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                        
                        {/* Carousel Controls (Featured) */}
                        <div className="absolute inset-0 flex items-center justify-between px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                            <button 
                                onClick={prevFeatured}
                                className="p-2 rounded-full bg-black/40 hover:bg-white text-white hover:text-black backdrop-blur-md transition-all transform hover:scale-110"
                            >
                                <Icon name="chevron-left" className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={nextFeatured}
                                className="p-2 rounded-full bg-black/40 hover:bg-white text-white hover:text-black backdrop-blur-md transition-all transform hover:scale-110"
                            >
                                <Icon name="chevron-right" className="w-5 h-5" />
                            </button>
                        </div>
                         
                         {/* Image Counter Badge */}
                         <div className="absolute top-3 right-12 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur text-[9px] font-bold text-white border border-white/10">
                            {featuredImgIndex + 1} / {featuredImages.length}
                        </div>

                        <button 
                            onClick={(e) => { e.stopPropagation(); onSelect(null); }}
                            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 hover:bg-white text-white hover:text-black transition-all backdrop-blur-md z-20 opacity-0 group-hover:opacity-100"
                        >
                            <Icon name="x" className="w-3 h-3" />
                        </button>
                        
                        {/* Compare Button on Featured */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleCompare(featured.id); }}
                            className={`absolute top-3 left-3 px-3 py-1.5 rounded-full flex items-center gap-2 transition-all backdrop-blur-md z-20 ${
                                compareIds.includes(featured.id) 
                                ? 'bg-emerald-500 text-black ring-2 ring-emerald-500/50' 
                                : 'bg-black/50 text-white hover:bg-white hover:text-black'
                            }`}
                        >
                            <div className={`w-3 h-3 rounded-[3px] border flex items-center justify-center transition-colors ${compareIds.includes(featured.id) ? 'border-black' : 'border-white'}`}>
                                {compareIds.includes(featured.id) && <Icon name="check" className="w-2.5 h-2.5" />}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{compareIds.includes(featured.id) ? 'Comparing' : 'Compare'}</span>
                        </button>

                        <div className="absolute bottom-5 left-5 right-5 z-10">
                             <div className="flex gap-2 mb-2">
                                <span className="bg-emerald-500 text-black text-[10px] font-black px-2.5 py-1 rounded-full tracking-widest uppercase shadow-lg">
                                    {featured.status}
                                </span>
                             </div>
                             <h3 className="text-2xl font-bold text-white tracking-tight mb-1 drop-shadow-lg">{featured.address}</h3>
                             <p className="text-zinc-300 text-xs font-bold uppercase tracking-widest drop-shadow-md opacity-80">{featured.suburb}, {featured.state} {featured.postcode}</p>
                        </div>
                    </div>
                    
                    <div className="p-5 bg-gradient-to-b from-[#0a0a0a] to-black">
                        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                             <div className="text-emerald-400 font-mono text-xl font-bold tracking-tighter">{featured.price}</div>
                             <div className="flex gap-1">
                                {featured.amenities.slice(0, 2).map((am, i) => (
                                    <span key={i} className="text-[9px] bg-white/5 border border-white/5 px-2 py-1 rounded text-zinc-400">{am}</span>
                                ))}
                             </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 mb-5">
                            <StatBox icon="bed" value={featured.beds} label="Beds" />
                            <StatBox icon="bath" value={featured.baths} label="Baths" />
                            <StatBox icon="car" value={featured.cars} label="Cars" />
                            <StatBox icon="maximize" value={featured.sqm} label="m²" />
                        </div>

                         <div className="space-y-4">
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Growth Forecast</span>
                                    <span className="text-[10px] text-emerald-400 font-bold">{featured.metrics.growthPotential}</span>
                                </div>
                                <div className="w-full bg-black rounded-full h-1.5 border border-white/5 overflow-hidden">
                                    <div 
                                        className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                                        style={{width: featured.metrics.growthPotential === 'High' ? '90%' : '60%'}} 
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed font-medium line-clamp-3">
                                {featured.description}
                            </p>
                            <button className="w-full py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-colors shadow-lg">
                                Schedule Private Viewing
                            </button>
                        </div>
                    </div>
                </article>
            </div>
        )}

        {/* RECENTLY VIEWED SECTION */}
        {!featured && recentlyViewed.length > 0 && (
          <div className="mb-10 animate-slide-up">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <Icon name="history" className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Recently Viewed</span>
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEY);
                  setRecentlyViewedIds([]);
                }}
                className="text-[8px] font-black uppercase tracking-widest text-zinc-700 hover:text-red-400 transition-colors"
              >
                Clear History
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar scrollbar-none snap-x">
              {recentlyViewed.map((prop) => (
                <motion.div 
                  key={prop.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(prop.id)}
                  className="shrink-0 w-32 snap-start group cursor-pointer"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/5 mb-2 shadow-lg">
                    <img src={prop.thumbnail} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" alt={prop.address} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-1.5 left-2 right-2">
                      <p className="text-[9px] font-black text-white truncate drop-shadow-md">{prop.suburb}</p>
                    </div>
                  </div>
                  <div className="px-1">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest truncate">{prop.address}</p>
                    <p className="text-[10px] font-bold text-emerald-400 font-mono mt-0.5">{prop.price}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* LIST SECTION HEADER */}
        {!featured && (
          <div className="flex items-center gap-2 mb-4 px-1">
            <Icon name="layout-list" className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Available Portfolio</span>
          </div>
        )}

        {/* COMPACT LIST */}
        <div className="space-y-3 pb-8">
            {others.map((prop) => (
                <PropertyCard 
                    key={prop.id} 
                    property={prop} 
                    onSelect={onSelect}
                    isCompared={compareIds.includes(prop.id)}
                    onToggleCompare={() => onToggleCompare(prop.id)}
                />
            ))}
            {others.length === 0 && !featured && (
                <div className="text-center py-10 opacity-50">
                    <Icon name="search-x" className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">No Assets Found</p>
                </div>
            )}
        </div>

      </div>
    </section>
  );
};

interface PropertyCardProps {
    property: Property;
    onSelect: (id: string) => void;
    isCompared: boolean;
    onToggleCompare: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect, isCompared, onToggleCompare }) => {
    const [imgIndex, setImgIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const images = property.images && property.images.length > 0 ? property.images : [property.thumbnail];

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setImgIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setImgIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const isExpanded = isCompared || isHovered;

    return (
        <motion.article 
            layout
            onClick={() => onSelect(property.id)}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            initial={{ height: 96 }} 
            animate={{ 
                height: isExpanded ? 256 : 96,
                borderColor: isCompared ? 'rgba(16, 185, 129, 1)' : isHovered ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                backgroundColor: isHovered ? '#0f0f0f' : '#0a0a0a'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`group relative flex flex-col justify-end p-2.5 rounded-2xl border cursor-pointer overflow-hidden shadow-lg ${
                isCompared ? 'shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'hover:shadow-emerald-900/10'
            }`}
        >
            {/* Image Layer */}
            <motion.div 
                layout 
                className="absolute inset-0 w-full h-full z-0"
            >
                <motion.div 
                    layout
                    className="absolute overflow-hidden shadow-inner"
                    initial={{ left: 8, top: 8, width: 80, height: 80, borderRadius: 12 }}
                    animate={{ 
                        left: isExpanded ? 0 : 8, 
                        top: isExpanded ? 0 : 8, 
                        width: isExpanded ? "100%" : 80, 
                        height: isExpanded ? "100%" : 80, 
                        borderRadius: isExpanded ? 16 : 12 
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <img 
                        src={images[imgIndex]} 
                        alt={property.address} 
                        className="w-full h-full object-cover transition-transform duration-700 scale-100 group-hover:scale-110"
                    />
                    
                    {/* Hover Overlays */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent transition-opacity duration-500 ${
                        isExpanded ? 'opacity-90' : 'opacity-0'
                    }`} />

                    {/* Image Counter Indicator */}
                    <AnimatePresence>
                        {isHovered && images.length > 1 && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[8px] font-black text-white border border-white/10 z-20"
                            >
                                {imgIndex + 1} / {images.length}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Carousel Controls */}
                    <div className={`absolute inset-0 flex items-center justify-between px-2 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <button onClick={prevImage} className="p-1.5 rounded-full bg-black/40 hover:bg-white text-white hover:text-black backdrop-blur-md transition-all transform hover:scale-110 z-30">
                            <Icon name="chevron-left" className="w-4 h-4" />
                        </button>
                        <button onClick={nextImage} className="p-1.5 rounded-full bg-black/40 hover:bg-white text-white hover:text-black backdrop-blur-md transition-all transform hover:scale-110 z-30">
                            <Icon name="chevron-right" className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            </motion.div>

            {/* COLLAPSED CONTENT: Prominent Address and Suburb */}
            <AnimatePresence>
                {!isExpanded && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-10 ml-24 h-20 flex flex-col justify-center pr-2 pointer-events-none"
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-black text-[13px] tracking-tight truncate pr-1 leading-tight text-white group-hover:text-emerald-400 transition-colors">
                                {property.address}
                            </h4>
                            <span className={`shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded border border-white/10 ${property.status.includes('SOLD') ? 'text-red-400 bg-red-950/30' : 'text-emerald-400 bg-emerald-950/30'}`}>
                                {property.status === 'FOR SALE' ? 'SALE' : property.status === 'AUCTION' ? 'AUCN' : 'SOLD'}
                            </span>
                        </div>
                        
                        <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2 leading-none">
                            {property.suburb}
                        </p>
                        
                        <div className="flex items-center justify-between">
                             <span className="text-[11px] font-bold font-mono text-zinc-500">{property.price}</span>
                             <div className="flex gap-2 text-[9px] font-black text-zinc-600 uppercase">
                                <span className="flex items-center gap-1"><Icon name="bed" className="w-2.5 h-2.5" />{property.beds}</span>
                                <span className="flex items-center gap-1"><Icon name="bath" className="w-2.5 h-2.5" />{property.baths}</span>
                             </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* EXPANDED CONTENT */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                        className="relative z-10 w-full px-4 pb-4 pointer-events-none"
                    >
                        <div className="flex justify-between items-end">
                            <div>
                                <h4 className="text-white font-black text-2xl tracking-tighter leading-tight drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">{property.address}</h4>
                                <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em] drop-shadow-md">{property.suburb}</p>
                            </div>
                            <div className="text-right">
                                 <div className="text-white font-mono text-xl font-black drop-shadow-lg">{property.price}</div>
                                 <div className="flex gap-2 text-[9px] font-black text-zinc-400 justify-end uppercase tracking-widest">
                                    <span>{property.beds} BEDS</span>
                                    <span>{property.baths} BATHS</span>
                                 </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Selection/Compare Indicator */}
            <button
                onClick={(e) => { e.stopPropagation(); onToggleCompare(); }}
                className={`absolute top-3 left-3 px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md transition-all duration-500 z-20 pointer-events-none group-hover:pointer-events-auto ${
                    isCompared 
                    ? 'bg-emerald-500 text-black opacity-100 ring-2 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-100' 
                    : 'bg-black/60 text-white hover:bg-white hover:text-black opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                }`}
            >
                <div className={`w-3 h-3 rounded-[3px] border flex items-center justify-center transition-colors ${isCompared ? 'border-black' : 'border-current'}`}>
                    {isCompared && <Icon name="check" className="w-2.5 h-2.5" />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{isCompared ? 'Compared' : 'Compare'}</span>
            </button>
        </motion.article>
    );
};

const StatBox = ({ icon, value, label }: { icon: string, value: string | number, label: string }) => (
    <div className="bg-white/5 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 border border-white/5 hover:border-emerald-500/30 transition-colors group/stat">
        <Icon name={icon} className="w-3.5 h-3.5 text-zinc-500 group-hover/stat:text-emerald-400 transition-colors" />
        <span className="text-sm font-bold text-white font-mono">{value}</span>
        <span className="text-[8px] text-zinc-600 uppercase font-bold tracking-wider">{label}</span>
    </div>
);

export default PropertySidebar;

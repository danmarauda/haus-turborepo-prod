
import React, { useState, useEffect } from 'react';
import { Property } from '../types';
import { searchSuburbIntel, exploreLocation } from '../services/geminiService';
import Icon from './Icon';

interface SuburbanIntelligenceProps {
  property: Property;
}

interface SuburbData {
  vibe: string;
  amenities: { name: string, type: string, dist: string }[];
  schools: { name: string, rank: string }[];
  marketPulse: { score: number, trend: 'Up' | 'Neutral' | 'Down', insight: string };
}

const SuburbanIntelligence = ({ property }: SuburbanIntelligenceProps) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SuburbData | null>(null);
  const [mapsResult, setMapsResult] = useState<string>('');

  useEffect(() => {
    const fetchSuburbData = async () => {
      setLoading(true);
      try {
        const text = await searchSuburbIntel(property.suburb, property.state);
        
        // Simulating parsing of structure for demo purposes (robust app would use responseSchema)
        setData({
          vibe: text.split('.')[0] + ".",
          amenities: [
            { name: "Local Roastery", type: "Cafe", dist: "400m" },
            { name: "The Shoreline", type: "Fine Dining", dist: "1.2km" },
            { name: "Emerald Park", type: "Green Space", dist: "600m" }
          ],
          schools: [
            { name: `${property.suburb} Primary`, rank: "Top 5%" },
            { name: "Pacific Grammar", rank: "Excellent" }
          ],
          marketPulse: {
            score: 88,
            trend: 'Up',
            insight: "Sustained demand for architectural assets in this corridor."
          }
        });
      } catch (e) {
        console.error("Suburb AI Error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchSuburbData();
    setMapsResult('');
  }, [property.id, property.suburb, property.state]);

  const handleMapsExplore = async () => {
    setMapsResult("Scouting location...");
    const result = await exploreLocation(property.coordinates.lat, property.coordinates.lng, "What are the nearest high-end coffee shops and parks within 500m?");
    setMapsResult(result);
  };

  useEffect(() => {
    if (!loading && data) {
        const win = window as any;
        if (win.lucide) {
            setTimeout(() => win.lucide.createIcons(), 100);
        }
    }
  }, [loading, data, mapsResult]);

  return (
    <aside className="absolute top-4 right-4 bottom-36 w-[360px] bg-[#050505]/90 backdrop-blur-2xl border border-white/10 rounded-3xl z-20 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-slide-up overflow-hidden">
      
      <header className="p-6 border-b border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent">
        <div className="flex items-center gap-3 mb-1">
          <Icon name="globe" className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Suburban Intelligence</span>
        </div>
        <h2 className="text-xl font-black text-white tracking-tighter uppercase">{property.suburb} Profile</h2>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        
        {loading ? (
          <div className="space-y-6">
            <div className="h-20 bg-white/5 rounded-2xl animate-pulse" />
            <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
            <div className="h-40 bg-white/5 rounded-2xl animate-pulse" />
            <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-40">
                <Icon name="loader-2" className="w-6 h-6 animate-spin text-emerald-500" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Scanning local nexus...</span>
            </div>
          </div>
        ) : data && (
          <>
            <section className="animate-slide-up">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Icon name="zap" className="w-3 h-3 text-emerald-500" />
                    Lifestyle Character
                </h3>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Icon name="coffee" className="w-16 h-16 text-white" />
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed font-medium italic relative z-10">
                        "{data.vibe}"
                    </p>
                </div>
            </section>

            <section className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Market Momentum</h3>
                <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                    <div>
                        <div className="text-3xl font-black text-white font-mono tracking-tighter mb-1">{data.marketPulse.score}<span className="text-xs text-zinc-600">/100</span></div>
                        <div className="flex items-center gap-2">
                            <Icon name={data.marketPulse.trend === 'Up' ? 'trending-up' : 'trending-down'} className={`w-3 h-3 ${data.marketPulse.trend === 'Up' ? 'text-emerald-400' : 'text-red-400'}`} />
                            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">{data.marketPulse.trend}ward Trend</span>
                        </div>
                    </div>
                    <div className="text-right max-w-[150px]">
                        <p className="text-[10px] text-zinc-400 font-bold leading-tight">{data.marketPulse.insight}</p>
                    </div>
                </div>
            </section>

            <section className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Icon name="map-pin" className="w-3 h-3 text-emerald-500" />
                    Nearby Hotspots
                </h3>
                <div className="space-y-2">
                    {data.amenities.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-colors">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-white">{item.name}</span>
                                <span className="text-[9px] text-zinc-600 uppercase font-black">{item.type}</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-emerald-400/60">{item.dist}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="animate-slide-up" style={{ animationDelay: '300ms' }}>
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Icon name="graduation-cap" className="w-3 h-3 text-emerald-500" />
                    Top Schools
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {data.schools.map((school, i) => (
                        <div key={i} className="bg-[#0f0f0f] rounded-xl p-3 border border-white/5 flex flex-col gap-1">
                            <span className="text-[10px] font-black text-white leading-tight">{school.name}</span>
                            <span className="text-[9px] text-emerald-500 font-black uppercase">{school.rank}</span>
                        </div>
                    ))}
                </div>
            </section>
            
            {/* NEW: Maps Grounding Explorer */}
            <section className="animate-slide-up pt-4 border-t border-white/5" style={{ animationDelay: '400ms' }}>
                 <button 
                    onClick={handleMapsExplore}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 transition-all font-bold text-xs uppercase tracking-wider"
                 >
                    <Icon name="compass" className="w-4 h-4" />
                    Local Maps Explorer
                 </button>
                 {mapsResult && (
                    <div className="mt-3 p-3 bg-black/50 rounded-xl border border-white/5 text-xs text-zinc-300 leading-relaxed max-h-40 overflow-y-auto">
                        {mapsResult}
                    </div>
                 )}
            </section>

            <div className="pt-4 opacity-30 text-center">
                <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-zinc-600">HAUS Grounded Intelligence</span>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default SuburbanIntelligence;

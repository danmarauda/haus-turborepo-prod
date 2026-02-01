
import React, { useState } from 'react';
import { Property } from '../types';
import Icon from './Icon';

interface ComparisonViewProps {
  properties: Property[];
  onClose: () => void;
  onRemove: (id: string) => void;
}

const ComparisonView = ({ properties, onClose, onRemove }: ComparisonViewProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'financials'>('overview');

  if (properties.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 md:p-8 animate-slide-up">
      <div className="relative w-full max-w-7xl h-full max-h-[95vh] bg-[#050505] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.9)] flex flex-col">
        
        {/* Elite Navigation Header */}
        <div className="px-10 py-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-zinc-900/50 to-transparent gap-6 shrink-0">
            <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <Icon name="scale" className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Market Comparison</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Institutional Grade Analysis</span>
                        <div className="w-1 h-1 rounded-full bg-zinc-700" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{properties.length} Assets in Vault</span>
                    </div>
                </div>
            </div>

            {/* Tab Control */}
            <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 ring-1 ring-white/5">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                >
                    Asset Overview
                </button>
                <button 
                    onClick={() => setActiveTab('financials')}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'financials' ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                >
                    Financial Deep-Dive
                </button>
            </div>

            <button 
                onClick={onClose} 
                className="group flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
            >
                <span className="text-[10px] font-black uppercase tracking-widest">Exit Nexus</span>
                <Icon name="x" className="w-4 h-4 transition-transform group-hover:rotate-90" />
            </button>
        </div>

        {/* Dynamic Comparison Grid */}
        <div className="flex-1 overflow-x-auto custom-scrollbar p-10 bg-[#050505]">
            <div className="flex gap-10 min-w-max h-full">
                {properties.map((prop, idx) => {
                    // Calculated Logic for S-Tier Metrics
                    const yieldVal = prop.metrics.yield;
                    const growthPotentialPct = prop.metrics.growthPotential === 'High' ? 8.4 : prop.metrics.growthPotential === 'Medium' ? 5.2 : 3.1;
                    const roi10y = ((Math.pow(1 + growthPotentialPct/100, 10) - 1) * 100).toFixed(1);
                    const capitalGrowth5y = ((Math.pow(1 + growthPotentialPct/100, 5) - 1) * 100).toFixed(1);
                    const estValue5y = (parseInt(prop.price.replace(/\D/g, '')) * (1 + parseFloat(capitalGrowth5y)/100) / 1000000).toFixed(2);
                    
                    return (
                        <div key={prop.id} className="flex flex-col gap-8 w-[380px] animate-slide-up h-full" style={{ animationDelay: `${idx * 150}ms` }}>
                            
                            {/* Visual Header */}
                            <div className="relative aspect-[16/11] rounded-[2.5rem] overflow-hidden group border border-white/10 shadow-2xl">
                                <img src={prop.thumbnail} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={prop.address} />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/10 to-transparent" />
                                
                                <button 
                                    onClick={() => onRemove(prop.id)}
                                    className="absolute top-5 right-5 p-3 bg-black/60 text-white rounded-full hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-xl border border-white/10 scale-90 group-hover:scale-100 shadow-xl"
                                >
                                    <Icon name="trash-2" className="w-5 h-5" />
                                </button>
                                
                                <div className="absolute bottom-6 left-6 right-6">
                                     <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[9px] font-black px-3 py-1 rounded-full bg-emerald-500 text-black uppercase tracking-widest shadow-lg">
                                            {prop.status}
                                        </span>
                                        <span className="text-[9px] font-black px-3 py-1 rounded-full bg-white/10 text-zinc-300 uppercase tracking-widest border border-white/5 backdrop-blur-md">
                                            {prop.sqm} m²
                                        </span>
                                     </div>
                                     <h3 className="text-white font-black text-2xl tracking-tighter leading-tight mb-1 drop-shadow-lg">{prop.address}</h3>
                                     <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{prop.suburb}, {prop.state}</p>
                                </div>
                            </div>

                            {activeTab === 'overview' ? (
                                <div className="space-y-6 flex-1 flex flex-col">
                                    {/* Pricing */}
                                    <div className="bg-gradient-to-br from-zinc-900/50 to-transparent rounded-3xl p-6 border border-white/5">
                                        <span className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black block mb-2">Market Listing</span>
                                        <div className="text-white font-mono text-4xl font-black tracking-tighter leading-none">{prop.price}</div>
                                    </div>

                                    {/* Core Stats */}
                                    <div className="grid grid-cols-4 gap-3">
                                         <StatBadge icon="bed" val={prop.beds} label="Beds" />
                                         <StatBadge icon="bath" val={prop.baths} label="Baths" />
                                         <StatBadge icon="car" val={prop.cars} label="Cars" />
                                         <StatBadge icon="layers" val={prop.sqm} label="Area" />
                                    </div>

                                    {/* Verdict */}
                                    <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 relative overflow-hidden flex-1">
                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                            <Icon name="sparkles" className="w-12 h-12 text-emerald-400" />
                                        </div>
                                        <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-3">Expert Sentiment</h5>
                                        <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                                            {prop.description.split('.')[0]}. {prop.metrics.growthPotential === 'High' 
                                                ? "Exceptional scarcity in this postcode suggests significant capital appreciation." 
                                                : "A stable luxury yield-play with blue-chip tenant demand."}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 flex-1 flex flex-col">
                                    {/* ROI Spotlight */}
                                    <div className="bg-emerald-500/10 rounded-3xl p-6 border border-emerald-500/20 shadow-[0_10px_30px_rgba(16,185,129,0.1)]">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-emerald-500/60 text-[10px] font-black uppercase tracking-[0.3em] block mb-1">Estimated 10Y ROI</span>
                                                <div className="text-4xl font-mono font-black text-white tracking-tighter leading-none">+{roi10y}%</div>
                                            </div>
                                            <Icon name="trending-up" className="w-8 h-8 text-emerald-500 opacity-40" />
                                        </div>
                                        <div className="flex items-center gap-3 mt-4">
                                            <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(parseFloat(roi10y)/2, 100)}%` }} />
                                            </div>
                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Market Benchmark: 62%</span>
                                        </div>
                                    </div>

                                    {/* Financial Matrix */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <FinancialMetric 
                                            label="Capital Growth (5Y)" 
                                            value={`+${capitalGrowth5y}%`} 
                                            sub={`${growthPotentialPct}% p.a.`}
                                            icon="mountain"
                                        />
                                        <FinancialMetric 
                                            label="Projected Value" 
                                            value={`$${estValue5y}M`} 
                                            sub="In 2030"
                                            icon="calendar"
                                        />
                                        <FinancialMetric 
                                            label="Gross Yield" 
                                            value={`${yieldVal}%`} 
                                            sub={prop.metrics.rentalEstimate}
                                            icon="repeat"
                                        />
                                        <FinancialMetric 
                                            label="Scarcity Index" 
                                            value={prop.metrics.growthPotential === 'High' ? '9.4' : '7.2'} 
                                            sub="Out of 10"
                                            icon="award"
                                        />
                                    </div>

                                    {/* Analysis */}
                                    <div className="bg-zinc-900/40 rounded-3xl p-6 border border-white/5 flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Icon name="zap" className="w-4 h-4 text-emerald-400" />
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Yield Projection Note</span>
                                        </div>
                                        <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                            Current yield profiles reflect {prop.metrics.rentalEstimate} performance. Anticipated luxury rental tightning in {prop.suburb} may drive yields to { (yieldVal * 1.1).toFixed(1) }% by Q4.
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            <button className="w-full py-5 bg-white text-black text-xs font-black uppercase tracking-[0.3em] rounded-3xl hover:bg-emerald-400 transition-all shadow-2xl active:scale-95 group/btn flex items-center justify-center gap-3 mt-auto shrink-0 ring-4 ring-black">
                                <Icon name="download" className="w-4 h-4 group-hover/btn:-translate-y-1 transition-transform" />
                                Export Prospectus
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

const StatBadge = ({ icon, val, label }: { icon: string, val: number | string, label: string }) => (
    <div className="flex flex-col items-center justify-center p-4 bg-zinc-900/40 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all hover:-translate-y-1">
        <Icon name={icon} className="w-4 h-4 text-zinc-600 mb-2" />
        <span className="text-white font-black text-sm font-mono">{val}</span>
        <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-black mt-1">{label}</span>
    </div>
);

const FinancialMetric = ({ label, value, sub, icon }: { label: string, value: string, sub: string, icon: string }) => (
    <div className="bg-zinc-900/20 p-5 rounded-3xl border border-white/5 hover:bg-zinc-900/40 transition-all group/f">
        <div className="flex items-center gap-2 mb-2">
            <Icon name={icon} className="w-3 h-3 text-zinc-700 group-hover/f:text-emerald-500 transition-colors" />
            <span className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">{label}</span>
        </div>
        <div className="text-xl font-mono font-black text-white tracking-tighter mb-0.5">{value}</div>
        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">{sub}</div>
    </div>
);

export default ComparisonView;

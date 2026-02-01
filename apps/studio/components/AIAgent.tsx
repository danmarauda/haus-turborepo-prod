
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Type, FunctionDeclaration } from "@google/genai";
import { MapViewState, MapLayerConfig, Property } from '../types';
import Icon from './Icon';
import { analyzeInvestment, quickGeminiResponse } from '../services/geminiService';

interface AIAgentProps {
  onCommand: (cmd: string) => void;
  mapState?: MapViewState;
  onMapControl?: (lat: number, lng: number, zoom: number) => void;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  layerConfig?: MapLayerConfig;
  onLayerConfigChange?: (config: MapLayerConfig) => void;
  selectedProperty?: Property | null;
  properties?: Property[];
  compareCount?: number;
  onViewComparison?: () => void;
  onSelectProperty?: (id: string) => void;
}

// --- Audio Utilities ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const AIAgent = ({ 
    onCommand, 
    mapState, 
    onMapControl, 
    activeFilter = 'All', 
    onFilterChange, 
    layerConfig, 
    onLayerConfigChange, 
    selectedProperty,
    properties = [],
    compareCount = 0,
    onViewComparison,
    onSelectProperty
}: AIAgentProps) => {
  const [isLive, setIsLive] = useState(false);
  const [activeMode, setActiveMode] = useState<'idle' | 'chat' | 'tour'>('idle');
  const [query, setQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [lastResponse, setLastResponse] = useState('');
  const [thinkingProcess, setThinkingProcess] = useState('');
  const [showLayersMenu, setShowLayersMenu] = useState(false);
  
  // Text Mode Toggle: Fast (Flash Lite) vs Deep (Pro Thinking)
  const [isDeepMode, setIsDeepMode] = useState(false);

  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // --- Handlers ---
  const handleZoom = (delta: number) => {
    if (mapState && onMapControl) {
        onMapControl(mapState.center.lat, mapState.center.lng, Math.max(2, Math.min(20, mapState.zoom + delta)));
    }
  };

  const handleTextQuery = async () => {
    if (!query) return;
    setIsThinking(true);
    
    try {
        let responseText = "";
        
        if (isDeepMode) {
            // Deep Thinking Mode (Gemini 3 Pro)
            setThinkingProcess('Analyzing market data with Deep Thought...');
            const analysis = await analyzeInvestment(query);
            responseText = `**Valuation:** ${analysis.valuation}\n\n**Verdict:** ${analysis.verdict}\n\n**Growth (5Y):** ${analysis.growth_forecast_5y}`;
        } else {
            // Fast Mode (Gemini 2.5 Flash Lite)
            setThinkingProcess('Quick retrieval...');
            responseText = await quickGeminiResponse(query);
        }

        setLastResponse(responseText);
        onCommand(query); // Still trigger generic app command handling
    } catch (e) {
      console.error("Search error:", e);
      setLastResponse("I encountered an error accessing the vault. Please try again.");
    } finally {
      setIsThinking(false);
      setThinkingProcess('');
      setQuery('');
    }
  };

  const startLiveSession = useCallback(async (mode: 'chat' | 'tour') => {
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key is missing from context.");
      
      const ai = new GoogleGenAI({ apiKey });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const propertyContext = properties.map(p => 
        `ID: ${p.id} | Name: ${p.address} | Suburb: ${p.suburb} | Price: ${p.price} | Beds: ${p.beds}`
      ).join('\n');

      let systemInstruction = `You are HAUS, an elite AI real estate concierge.
      DATABASE: ${propertyContext}
      Use 'selectProperty' if asked to show a specific property.
      `;

      let tools: any[] = [];
      let toolConfig: any = undefined;

      const selectPropertyTool: FunctionDeclaration = {
        name: 'selectProperty',
        description: 'Navigate to property.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            propertyId: { type: Type.STRING }
          },
          required: ['propertyId']
        }
      };

      if (mode === 'chat') {
         tools = [{ functionDeclarations: [selectPropertyTool] }];
      }

      if (mode === 'tour' && selectedProperty) {
         systemInstruction = `Touring ${selectedProperty.address}. Be descriptive. Use googleMaps to discuss nearby lifestyle.`;
         tools = [{ googleMaps: {} }];
         toolConfig = {
            retrievalConfig: {
                latLng: {
                    latitude: selectedProperty.coordinates.lat,
                    longitude: selectedProperty.coordinates.lng
                }
            }
         };
      }

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            if (!inputCtx) return;
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => {
                if (session) session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.toolCall) {
                for (const fc of message.toolCall.functionCalls) {
                    if (fc.name === 'selectProperty') {
                        const pid = (fc.args as any).propertyId;
                        if (onSelectProperty) onSelectProperty(pid);
                        sessionPromise.then(session => {
                            session.sendToolResponse({
                                functionResponses: {
                                    id: fc.id,
                                    name: fc.name,
                                    response: { result: `Shown.` }
                                }
                            });
                        });
                    }
                }
            }
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const outCtx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error("Live Error:", e),
          onclose: () => { setIsLive(false); setActiveMode('idle'); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: systemInstruction,
          tools: tools,
          // toolConfig removed - not supported by LiveConnectConfig
        }
      });
      sessionRef.current = await sessionPromise;
      setIsLive(true);
      setActiveMode(mode);
    } catch (err) {
      console.error("Failed to start Live API:", err);
      setIsLive(false);
      setActiveMode('idle');
    }
  }, [selectedProperty, properties, onSelectProperty]);

  const stopLiveConversation = useCallback(() => {
    if (sessionRef.current) { try { sessionRef.current.close(); } catch(e) {} sessionRef.current = null; }
    if (audioContextRef.current) { try { audioContextRef.current.close(); } catch(e) {} audioContextRef.current = null; }
    if (outputAudioContextRef.current) { try { outputAudioContextRef.current.close(); } catch(e) {} outputAudioContextRef.current = null; }
    setIsLive(false); setActiveMode('idle'); sourcesRef.current.clear(); nextStartTimeRef.current = 0;
  }, []);

  const toggleLiveChat = () => { if (isLive) stopLiveConversation(); else startLiveSession('chat'); };
  const toggleTour = () => { if (isLive && activeMode === 'tour') stopLiveConversation(); else { if (isLive) stopLiveConversation(); setTimeout(() => startLiveSession('tour'), 200); } };
  const toggleLayerStyle = (style: MapLayerConfig['style']) => { if (onLayerConfigChange && layerConfig) onLayerConfigChange({ ...layerConfig, style }); };
  const toggleTraffic = () => { if (onLayerConfigChange && layerConfig) onLayerConfigChange({ ...layerConfig, showTraffic: !layerConfig.showTraffic }); };

  const FILTERS = ['All', 'Houses', 'Apts', 'Acreage', 'Beachfront', 'Under $5M'];

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-5xl px-6 pointer-events-none flex flex-col gap-4 items-center">
      
      {(lastResponse || thinkingProcess) && (
        <div className="w-full max-w-2xl bg-black/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-2xl animate-slide-up ring-1 ring-white/5 pointer-events-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isThinking ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500 text-black'}`}>
                <Icon name={isThinking ? "loader-2" : "sparkles"} className={`w-4 h-4 ${isThinking ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 block leading-none">Concierge Intelligence</span>
                <span className="text-white text-xs font-bold">{isThinking ? 'Thinking Mode Active' : 'Synthesis Complete'}</span>
              </div>
            </div>
            {!isThinking && (
              <button onClick={() => setLastResponse('')} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all">
                <Icon name="x" className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="relative overflow-hidden">
            {isThinking ? (
              <p className="text-zinc-400 text-sm font-medium animate-pulse">{thinkingProcess}</p>
            ) : (
              <div className="max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">{lastResponse}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Dock */}
      <div className="flex gap-2 p-1.5 bg-black/40 backdrop-blur-xl border border-white/5 rounded-full pointer-events-auto">
        {FILTERS.map(f => (
            <button key={f} onClick={() => onFilterChange && onFilterChange(f)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase transition-all border ${activeFilter === f ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-transparent text-zinc-400 border-transparent hover:bg-white/5 hover:text-white'}`}>{f}</button>
        ))}
      </div>

      {showLayersMenu && layerConfig && (
        <div className="absolute bottom-24 left-10 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3 w-48 shadow-2xl animate-slide-up pointer-events-auto flex flex-col gap-1 z-50">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2 px-2">Map Layers</span>
            <button onClick={() => toggleLayerStyle('roadmap')} className={`flex items-center gap-3 p-2 rounded-lg text-xs font-bold transition-all ${layerConfig.style === 'roadmap' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5'}`}><Icon name="map" className="w-4 h-4" />Blueprint</button>
            <button onClick={() => toggleLayerStyle('satellite')} className={`flex items-center gap-3 p-2 rounded-lg text-xs font-bold transition-all ${layerConfig.style === 'satellite' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5'}`}><Icon name="globe" className="w-4 h-4" />Satellite</button>
            <button onClick={() => toggleLayerStyle('terrain')} className={`flex items-center gap-3 p-2 rounded-lg text-xs font-bold transition-all ${layerConfig.style === 'terrain' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5'}`}><Icon name="mountain" className="w-4 h-4" />Terrain</button>
            <div className="h-px bg-white/5 my-1" />
            <button onClick={toggleTraffic} className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-all ${layerConfig.showTraffic ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-400 hover:bg-white/5'}`}><div className="flex items-center gap-3"><Icon name="car" className="w-4 h-4" />Traffic</div><div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${layerConfig.showTraffic ? 'bg-emerald-500' : 'bg-zinc-700'}`}><div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${layerConfig.showTraffic ? 'translate-x-4' : 'translate-x-0'}`} /></div></button>
        </div>
      )}

      {/* COMMAND DECK */}
      <div className={`w-full h-20 transition-all duration-500 flex items-center p-2 gap-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] rounded-full border border-white/10 pointer-events-auto ${isLive ? 'bg-emerald-500/10 backdrop-blur-3xl ring-2 ring-emerald-500/30' : 'bg-[#0a0a0a]/90 backdrop-blur-2xl'}`}>
        
        <div className="flex items-center gap-1 pl-2 border-r border-white/10 pr-4">
            <button onClick={() => handleZoom(1)} className="p-3 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"><Icon name="plus" className="w-5 h-5" /></button>
            <button onClick={() => handleZoom(-1)} className="p-3 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"><Icon name="minus" className="w-5 h-5" /></button>
            <button onClick={() => setShowLayersMenu(!showLayersMenu)} className={`p-3 rounded-xl transition-colors ${showLayersMenu ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-zinc-400 hover:text-white'}`}><Icon name="layers" className="w-5 h-5" /></button>
        </div>

        <button onClick={toggleLiveChat} className={`shrink-0 relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-700 shadow-lg ${isLive && activeMode === 'chat' ? 'bg-emerald-500 text-black scale-105' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}>
          {isLive && activeMode === 'chat' ? (
             <div className="flex items-end gap-1 h-5"><div className="w-1 bg-black animate-[pulse_1s_infinite]" style={{height: '60%'}} /><div className="w-1 bg-black animate-[pulse_0.7s_infinite]" style={{height: '100%'}} /><div className="w-1 bg-black animate-[pulse_1.2s_infinite]" style={{height: '40%'}} /></div>
          ) : (<Icon name="mic" className="w-6 h-6" />)}
          {isLive && activeMode === 'chat' && <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20" />}
        </button>

        <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
                 <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTextQuery()}
                    disabled={isLive}
                    placeholder={isLive ? "Voice Agent Active - Listening..." : isDeepMode ? "Ask Deep Thought Agent..." : "Ask Fast Agent..."}
                    className="w-full bg-transparent border-none text-white placeholder-zinc-600 text-base font-medium focus:ring-0"
                />
            </div>
            {/* Toggle Switch for Fast/Deep Mode */}
             <button 
                onClick={() => setIsDeepMode(!isDeepMode)}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${isDeepMode ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:bg-zinc-700'}`}
                title={isDeepMode ? "Using Gemini 3 Pro (Deep Thinking)" : "Using Gemini 2.5 Flash Lite (Fast)"}
            >
                {isDeepMode ? "Thinking Mode" : "Fast Mode"}
            </button>
        </div>

        <div className="flex items-center gap-2 border-l border-white/10 pl-4 pr-2">
            <button onClick={onViewComparison} disabled={compareCount === 0} className={`p-3 rounded-xl transition-all duration-500 relative group ${compareCount > 0 ? 'text-white hover:bg-white/10' : 'text-zinc-700 cursor-not-allowed'}`} title="View Comparison">
                <Icon name="scale" className="w-5 h-5" />
                {compareCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-black border border-black animate-slide-up shadow-lg">{compareCount}</span>}
            </button>

            <button onClick={toggleTour} disabled={!selectedProperty} className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-500 relative group ${activeMode === 'tour' ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] ring-2 ring-emerald-500/50' : !selectedProperty ? 'text-zinc-700 bg-white/5 cursor-not-allowed border border-transparent' : 'text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20'}`} title="Start AI Voice Tour">
                <div className="relative"><Icon name="headphones" className={`w-5 h-5 ${activeMode === 'tour' ? 'animate-pulse' : ''}`} />{activeMode === 'tour' && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-black rounded-full border-2 border-emerald-500 animate-ping" />}</div>
                <div className="flex flex-col text-left hidden sm:flex"><span className={`text-[8px] font-black uppercase tracking-[0.2em] leading-none mb-0.5 ${activeMode === 'tour' ? 'text-black/60' : 'text-zinc-500'}`}>{activeMode === 'tour' ? 'Live Session' : 'Voice Agent'}</span><span className="text-[10px] font-black uppercase tracking-widest leading-none">{activeMode === 'tour' ? 'End Tour' : 'Start Tour'}</span></div>
            </button>

            <button onClick={handleTextQuery} disabled={!query || isThinking || isLive} className={`flex items-center gap-2 px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!query || isThinking || isLive ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed' : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_5px_15px_rgba(16,185,129,0.3)]'}`}>{isThinking ? 'Processing' : <><Icon name="zap" className="w-3 h-3" /> Search</>}</button>
        </div>
      </div>
      
    </div>
  );
};

export default AIAgent;

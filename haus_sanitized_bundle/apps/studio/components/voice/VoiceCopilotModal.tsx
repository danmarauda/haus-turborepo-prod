
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { SearchParams } from '../../types';
import AIVoice from './AIVoice';
import {
    XIcon, MapPinIcon, Building2Icon, BedIcon, DollarSignIcon,
    SparklesIcon, SearchIcon, BathIcon,
    RulerIcon, KeyIcon
} from '../IconComponents';

interface VoiceCopilotModalProps {
  onResults: (results: any[], params: SearchParams) => void;
  onClose: () => void;
}

type SearchStatus = "idle" | "listening" | "processing" | "done";

// Use new GoogleGenAI({ apiKey: process.env.API_KEY }) to initialize the client.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const initialSearchParams: SearchParams = {
    location: undefined,
    propertyType: undefined,
    listingType: undefined,
    priceMin: undefined,
    priceMax: undefined,
    bedroomsMin: undefined,
    bathroomsMin: undefined,
    squareFootageMin: undefined,
    squareFootageMax: undefined,
    amenities: [],
};

const POPULAR_AMENITIES = [
    "Pool", "Gym", "Parking", "Fireplace", "Balcony", "Garden",
    "Air Conditioning", "Elevator", "Security", "Home Office",
    "View", "Pet Friendly", "Furnished", "Waterfront", "Doorman"
];

const formatValue = (key: keyof SearchParams, value: any): string => {
    if (value === undefined || value === null) return '';
    switch (key) {
        case 'priceMin': return `$${(Number(value) / 1000).toFixed(0)}k+`;
        case 'priceMax': return `Up to $${(Number(value) / 1000).toFixed(0)}k`;
        case 'bedroomsMin': return `${value}+ beds`;
        case 'bathroomsMin': return `${value}+ baths`;
        case 'squareFootageMin': return `${value.toLocaleString()}+ sqft`;
        case 'squareFootageMax': return `Up to ${value.toLocaleString()} sqft`;
        case 'amenities':
            const list = value as string[];
            if (list.length === 0) return '';
            if (list.length <= 2) return list.join(', ');
            return `${list.length} selected`;
        default: return String(value);
    }
}

const PARAMETER_CONFIG = [
    { key: 'location', label: 'Location', icon: <MapPinIcon className="w-5 h-5" />, colSpan: 'sm:col-span-2' },
    { key: 'listingType', label: 'Type', icon: <KeyIcon className="w-5 h-5" /> },
    { key: 'propertyType', label: 'Property', icon: <Building2Icon className="w-5 h-5" /> },
    { key: 'priceMin', label: 'Min Price', icon: <DollarSignIcon className="w-5 h-5" /> },
    { key: 'priceMax', label: 'Max Price', icon: <DollarSignIcon className="w-5 h-5" /> },
    { key: 'bedroomsMin', label: 'Bedrooms', icon: <BedIcon className="w-5 h-5" /> },
    { key: 'bathroomsMin', label: 'Bathrooms', icon: <BathIcon className="w-5 h-5" /> },
    { key: 'squareFootageMin', label: 'Min Size', icon: <RulerIcon className="w-5 h-5" /> },
    { key: 'squareFootageMax', label: 'Max Size', icon: <RulerIcon className="w-5 h-5" /> },
    { key: 'amenities', label: 'Amenities', icon: <SparklesIcon className="w-5 h-5" />, colSpan: 'sm:col-span-2' },
];

const propertyTypeOptions = [
    { value: 'House', label: 'House' }, { value: 'Apartment', label: 'Apartment' }, { value: 'Condo', label: 'Condo' },
    { value: 'Townhouse', label: 'Townhouse' }, { value: 'Loft', label: 'Loft' },
];

const bedroomOptions = [
    { value: '1', label: '1+' }, { value: '2', label: '2+' }, { value: '3', label: '3+' },
    { value: '4', label: '4+' }, { value: '5', label: '5+' },
];

const bathroomOptions = [
    { value: '1', label: '1+' }, { value: '2', label: '2+' }, { value: '3', label: '3+' },
    { value: '4', label: '4+' },
];

const listingTypeOptions = [
    { value: 'For Sale', label: 'For Sale' }, { value: 'For Rent', label: 'For Rent' },
];

const highlightTranscript = (transcript: string, highlights: string[]) => {
    if (!highlights.length || !transcript) {
        return <>{transcript}</>;
    }
    // Sort highlights by length descending to match longest phrases first
    const sortedHighlights = [...highlights].sort((a, b) => b.length - a.length);
    const escapedHighlights = sortedHighlights.map(h => h.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));

    if (escapedHighlights.length === 0) return <>{transcript}</>;

    const regex = new RegExp(`(${escapedHighlights.join('|')})`, 'gi');
    const parts = transcript.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                sortedHighlights.some(h => h.toLowerCase() === part.toLowerCase()) ? (
                    <span key={i} className="text-blue-400 font-bold drop-shadow-[0_0_8px_rgba(96,165,250,0.5)] transition-all duration-500">{part}</span>
                ) : (
                    part
                )
            )}
        </>
    );
};


export default function VoiceCopilotModal({ onResults, onClose }: VoiceCopilotModalProps) {
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [searchParams, setSearchParams] = useState<SearchParams>(initialSearchParams);
  const [glowingParams, setGlowingParams] = useState<string[]>([]);
  const [editingParam, setEditingParam] = useState<string | null>(null);
  const [highlightedText, setHighlightedText] = useState<string[]>([]);

  const recognitionRef = useRef<any>(null);
  const glowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastProcessedTranscript = useRef<string>('');

  const handleParamChange = (key: keyof SearchParams, value: any) => {
      let finalValue: any = value;
      if (value === '' || value === 'any') {
          finalValue = undefined;
      } else if (['priceMin', 'priceMax', 'bedroomsMin', 'bathroomsMin', 'squareFootageMin', 'squareFootageMax'].includes(key)) {
          const num = parseInt(String(value).replace(/[^0-9]/g, ''), 10);
          finalValue = isNaN(num) ? undefined : num;
      }
      setSearchParams(prev => ({ ...prev, [key]: finalValue }));
  };

  const handleStartListening = () => {
    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported.");
      return;
    }
     if (recognitionRef.current) {
        return;
    }
    setTranscript('');
    lastProcessedTranscript.current = '';
    setHighlightedText([]);
    setStatus('listening');

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let final_transcript = '';
      let interim_transcript = '';

      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }

      const fullTranscript = final_transcript + interim_transcript;
      setTranscript(fullTranscript);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      if (status === "listening") {
        setStatus('idle');
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleStopListening = () => {
      if (recognitionRef.current) {
          recognitionRef.current.stop();
      }
  };

  const handleToggleListening = () => {
      if (status === 'listening' || status === 'processing') {
          handleStopListening();
      } else if (status === 'idle') {
          handleStartListening();
      }
  };

  // Debounced Processing Logic
  useEffect(() => {
      if (!transcript || transcript.length < 2) return;

      // Avoid reprocessing exact same text
      if (transcript === lastProcessedTranscript.current) return;

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      debounceTimerRef.current = setTimeout(() => {
          processTranscript(transcript);
          lastProcessedTranscript.current = transcript;
      }, 800); // 800ms debounce

      return () => {
          if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      };
  }, [transcript]);


  const processTranscript = async (text: string) => {
    if (text.trim().toLowerCase().match(/^(search|let's go|lets go|find)$/)) {
        handleSearch();
        return;
    }

    setStatus('processing');

    try {
        const amenitiesList = POPULAR_AMENITIES.map(a => `'${a}'`).join(', ');
        const paramSchema = (type: Type, description: string) => ({
            type: Type.OBJECT,
            properties: {
                value: { type, description },
                sourceText: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The exact words from the text that identified this parameter." }
            }
        });
        const arrayParamSchema = (description: string) => ({
            type: Type.OBJECT,
            properties: {
                value: { type: Type.ARRAY, items: { type: Type.STRING }, description },
                sourceText: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The exact words from the text that identified this parameter." }
            }
        });

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                location: paramSchema(Type.STRING, "City, state, or neighborhood. e.g., 'Austin, TX'"),
                propertyType: paramSchema(Type.STRING, "e.g., 'house', 'apartment', 'penthouse'"),
                listingType: paramSchema(Type.STRING, "Whether the property is for sale or for rent. Must be 'For Sale' or 'For Rent'."),
                priceMin: paramSchema(Type.NUMBER, "Minimum price in USD."),
                priceMax: paramSchema(Type.NUMBER, "Maximum price in USD."),
                bedroomsMin: paramSchema(Type.NUMBER, "Minimum number of bedrooms."),
                bathroomsMin: paramSchema(Type.NUMBER, "Minimum number of bathrooms."),
                squareFootageMin: paramSchema(Type.NUMBER, "Minimum square footage."),
                squareFootageMax: paramSchema(Type.NUMBER, "Maximum square footage."),
                amenities: arrayParamSchema(`List of amenities. Possible values: ${amenitiesList}.`)
            },
        };

        const currentParamsPrompt = `
            You are an intelligent real estate assistant filling out a search form.

            Full Speech Transcript: "${text}".

            Task:
            1. Analyze the FULL transcript to extract all real estate search criteria.
            2. Infer intention even from partial phrases if clear.
            3. Ignore conversational fillers (e.g. "um", "maybe", "I want").
            4. For each identified parameter, extract the *exact substring* from the text as 'sourceText' for highlighting.

            Return a JSON object containing ALL identified parameters.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: currentParamsPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const responseData = JSON.parse(response.text);

        const updatedParamsPartial: Partial<SearchParams> = {};
        const newGlowing: string[] = [];
        const newlyHighlighted: string[] = [];

        // Diffing logic to see what actually changed/is new
        for (const key in responseData) {
            if (Object.prototype.hasOwnProperty.call(responseData, key) && key in initialSearchParams) {
                const param = responseData[key];
                if (param && param.value !== undefined && param.value !== null) {

                    const currentValue = (searchParams as any)[key];
                    const newValue = param.value;

                    // Simple equality check
                    const isDifferent = Array.isArray(newValue)
                        ? (JSON.stringify(newValue.sort()) !== JSON.stringify((currentValue || []).sort()))
                        : newValue !== currentValue;

                    if (isDifferent || !currentValue) {
                        newGlowing.push(key);
                    }

                    (updatedParamsPartial as any)[key] = newValue;

                    if (param.sourceText && Array.isArray(param.sourceText)) {
                        newlyHighlighted.push(...param.sourceText.filter(s => s && s.trim().length > 0));
                    }
                }
            }
        }

        if (Object.keys(updatedParamsPartial).length > 0) {
            // Merge with existing params, but allow overwrites from the "Full Transcript" analysis
            setSearchParams(prev => ({ ...prev, ...updatedParamsPartial }));

            if (newGlowing.length > 0) {
                setGlowingParams(newGlowing);
                if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current);
                glowTimeoutRef.current = setTimeout(() => setGlowingParams([]), 2500);
            }

            if (newlyHighlighted.length > 0) {
                 setHighlightedText(prev => [...Array.from(new Set([...prev, ...newlyHighlighted]))]);
            }
        }

    } catch(error) {
        console.error("Error processing transcript with AI:", error);
    } finally {
        if(recognitionRef.current) {
            setStatus('listening');
        } else {
            setStatus('idle');
        }
    }
  };

  const handleSearch = () => {
    setStatus('done');
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
    // Generate mock results based on extracted params
    const mockResults = generateMockProperties(searchParams);
    setTimeout(() => onResults(mockResults, searchParams), 800);
  }

  useEffect(() => {
    handleStartListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (glowTimeoutRef.current) {
        clearTimeout(glowTimeoutRef.current);
      }
      if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusMessages: Record<SearchStatus, string> = {
    idle: "Click to speak",
    listening: "Listening...",
    processing: "Thinking...",
    done: "Finding properties...",
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center bg-neutral-950 overflow-hidden font-geist p-4 sm:p-8">
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>
      <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-neutral-400 hover:text-white z-20" aria-label="Close voice search">
        <XIcon className="w-6 h-6" />
      </button>

      <div className="w-full max-w-4xl text-center flex flex-col h-full">
        <div className="flex-shrink-0">
          <AIVoice
            submitted={status === 'listening' || status === 'processing'}
            onClick={handleToggleListening}
            statusText={statusMessages[status]}
          />
          <p className="mt-1 min-h-[56px] text-base text-neutral-400 leading-relaxed transition-opacity duration-300 p-2" aria-live="polite">
            {transcript ? highlightTranscript(transcript, highlightedText) : (status === 'idle' && `Try "Find modern apartments in San Francisco with a pool."`)}
          </p>
        </div>

        <div className="flex-grow my-6 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pb-4">
                {PARAMETER_CONFIG.map(param => {
                    const key = param.key as keyof SearchParams;
                    const value = searchParams[key];
                    const hasValue = value !== undefined && value !== null && (Array.isArray(value) ? value.length > 0 : true);
                    const isGlowing = glowingParams.includes(key);

                    return (
                        <div key={param.key} className={`
                            ${param.colSpan || 'sm:col-span-1'}
                            p-4 rounded-2xl border transition-all duration-500 relative
                            ${isGlowing
                                ? 'bg-blue-500/20 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.5)] scale-[1.03] z-10 ring-1 ring-blue-400'
                                : hasValue
                                    ? 'bg-white/5 border-white/10'
                                    : 'bg-white/5 border-transparent opacity-80 hover:opacity-100'}
                        `}>
                            {isGlowing && (
                                <div className="absolute inset-0 bg-blue-400/10 animate-pulse rounded-2xl pointer-events-none"></div>
                            )}
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl transition-colors duration-500 ${isGlowing ? 'bg-blue-500 text-white' : hasValue ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-neutral-500'}`}>
                                    {param.icon}
                                </div>
                                <div className="flex-grow self-center overflow-hidden">
                                    <h3 className={`text-[10px] font-bold uppercase tracking-widest text-left mb-0.5 transition-colors ${isGlowing ? 'text-blue-300' : 'text-neutral-500'}`}>{param.label}</h3>
                                    { editingParam === param.key ? (
                                        (() => {
                                            const commonInputProps = {
                                                onBlur: () => setEditingParam(null),
                                                onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter') (e.target as HTMLElement).blur(); },
                                                autoFocus: true,
                                                className: "w-full bg-transparent text-sm font-semibold text-neutral-100 focus:outline-none p-0 border-0"
                                            };
                                            const textInputProps = {
                                                ...commonInputProps,
                                                type: "text",
                                                placeholder: "-",
                                                value: searchParams[param.key as keyof SearchParams] as string || '',
                                                onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleParamChange(param.key as keyof SearchParams, e.target.value)
                                            };

                                            switch(param.key) {
                                                case 'location':
                                                case 'squareFootageMin':
                                                case 'squareFootageMax':
                                                case 'priceMin':
                                                case 'priceMax':
                                                    return <input {...textInputProps} />;
                                                case 'amenities':
                                                    return (
                                                        <div className="mt-3 w-full animate-fade-in">
                                                            <div className="grid grid-cols-2 gap-2 mb-3 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                                                                {POPULAR_AMENITIES.map(amenity => {
                                                                    const isSelected = (searchParams.amenities || []).includes(amenity);
                                                                    return (
                                                                        <button
                                                                            key={amenity}
                                                                            onMouseDown={(e) => {
                                                                                // Use onMouseDown to prevent losing focus too early
                                                                                e.preventDefault();
                                                                                const current = searchParams.amenities || [];
                                                                                const updated = isSelected
                                                                                    ? current.filter(a => a !== amenity)
                                                                                    : [...current, amenity];
                                                                                handleParamChange('amenities', updated);
                                                                            }}
                                                                            className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight transition-all border text-center ${
                                                                                isSelected
                                                                                ? 'bg-blue-600 text-white border-blue-500 shadow-[0_4px_12px_rgba(37,99,235,0.4)] scale-[0.98]'
                                                                                : 'bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10 hover:text-neutral-200'
                                                                            }`}
                                                                        >
                                                                            {amenity}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                            <button
                                                                onClick={() => setEditingParam(null)}
                                                                className="w-full py-2 bg-blue-600/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-blue-600/30 transition-colors"
                                                            >
                                                                Done
                                                            </button>
                                                        </div>
                                                    );
                                                case 'listingType':
                                                case 'propertyType':
                                                case 'bedroomsMin':
                                                case 'bathroomsMin':
                                                    const options = { listingType: listingTypeOptions, propertyType: propertyTypeOptions, bedroomsMin: bedroomOptions, bathroomsMin: bathroomOptions }[param.key];
                                                    return (
                                                        <select
                                                            value={searchParams[param.key as keyof SearchParams] as string || ''}
                                                            onChange={(e) => {
                                                                handleParamChange(param.key as keyof SearchParams, e.target.value);
                                                                setEditingParam(null);
                                                            }}
                                                            {...commonInputProps}
                                                            className={`${commonInputProps.className} bg-neutral-900 cursor-pointer appearance-none`}
                                                        >
                                                            <option value="">-</option>
                                                            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                        </select>
                                                    );
                                                default: return null;
                                            }
                                        })()
                                    ) : (
                                        <p
                                            onClick={() => setEditingParam(param.key)}
                                            className={`text-sm font-semibold text-left min-h-[20px] cursor-pointer truncate transition-colors ${isGlowing ? 'text-white drop-shadow-md' : 'text-neutral-100 hover:text-blue-400'}`}
                                        >
                                            {hasValue ? formatValue(key, value) : '-'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="flex-shrink-0 mt-auto pt-6 border-t border-white/5">
          <button
            onClick={handleSearch}
            disabled={status === 'done'}
            className="w-full max-w-xs mx-auto inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-4 text-sm font-bold tracking-tight text-white bg-blue-600 hover:bg-blue-700 border border-transparent transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50"
          >
              <SearchIcon className="w-5 h-5 stroke-[2]" />
              <span className="font-geist">Search HAUS</span>
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

// Helper function to generate mock properties
function generateMockProperties(params: SearchParams): any[] {
    const results: any[] = [];
    const count = 6;

    const defaultLocations = ['Bondi Beach, NSW', 'Melbourne CBD, VIC', 'Ponsonby, Auckland', 'Queenstown, NZ', 'Noosa Heads, QLD', 'Toorak, VIC'];
    const defaultTypes = ['Apartment', 'House', 'Terrace', 'Villa', 'Penthouse'];

    const seed = (params.location || 'default').length + (params.propertyType || '').length;

    for (let i = 0; i < count; i++) {
        const id = `prop-${seed}-${i}`;
        const location = params.location || defaultLocations[i % defaultLocations.length];
        const propertyType = params.propertyType || defaultTypes[i % defaultTypes.length];
        const bedrooms = params.bedroomsMin || (2 + (i % 4));
        const bathrooms = params.bathroomsMin || (bedrooms > 1 ? bedrooms - 1 : 1);

        const sqft = 1200 + bedrooms * 400;
        const priceBase = 1500000 + (i * 500000);
        const priceDisplay = `$${(priceBase / 1_000_000).toFixed(2)}M`;

        results.push({
            id: id,
            title: `Luxury ${propertyType} in ${location.split(',')[0]}`,
            location: location,
            price: priceDisplay,
            details: `${bedrooms} bd • ${bathrooms} ba • ${Math.round(sqft * 0.0929).toLocaleString()}m²`,
            imageUrl: `https://picsum.photos/1200/800?random=${100 + i + seed}`,
            description: `A masterclass in modern living, this property offers an unparalleled lifestyle.`,
            type: propertyType,
            tourAvailable: true,
            button: { text: 'Virtual tour', icon: 'eye' }
        });
    }
    return results;
}

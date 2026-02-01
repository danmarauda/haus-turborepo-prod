
import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from "@google/genai";
import { AudioStreamer, AudioRecorder } from '../utils/voice';

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000; // Gemini 2.5 Flash Native Audio output rate

interface UseLiveSessionProps {
  onToolCall: (functionCalls: any[]) => Promise<any>;
  onTranscription?: (text: string, isInterim: boolean) => void;
}

// Define the tool we want Gemini to use
const searchPropertiesTool: FunctionDeclaration = {
  name: 'searchProperties',
  description: 'Search for real estate properties based on user criteria. Use this tool whenever the user asks to find, search, or look for homes, apartments, or properties.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: { type: Type.STRING, description: "Suburb, City, or State e.g. 'Bondi', 'Auckland', 'Toorak'" },
      priceMin: { type: Type.NUMBER, description: "Minimum price in dollars" },
      priceMax: { type: Type.NUMBER, description: "Maximum price in dollars" },
      bedroomsMin: { type: Type.NUMBER, description: "Minimum number of bedrooms" },
      propertyType: { type: Type.STRING, description: "Type of property: 'House', 'Unit', 'Apartment', 'Terrace', 'Villa'" },
      amenities: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of desired amenities e.g. 'pool', 'garage', 'balcony', 'air con'"
      }
    },
  },
};

export const useLiveSession = ({ onToolCall, onTranscription }: UseLiveSessionProps) => {
  const [status, setStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0); // For visualizer

  const aiRef = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY }));
  const sessionRef = useRef<any>(null); // Holds the active session

  // Refs for cleanup
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);

  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const connect = useCallback(async () => {
    try {
      setStatus('connected');

      // Initialize Output Audio Context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: OUTPUT_SAMPLE_RATE,
      });

      // Output Node (Speakers)
      outputNodeRef.current = audioContextRef.current.createGain();
      outputNodeRef.current.connect(audioContextRef.current.destination);

      // Start Microphone Stream
      const stream = await AudioRecorder.createMicrophoneStream();

      // Initialize Gemini Session
      const sessionPromise = aiRef.current.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } },
          },
          systemInstruction: "You are HAUS, a sophisticated, high-end real estate AI concierge specializing in the Australian and New Zealand luxury market. You are helpful, professional, and concise. Your goal is to help users find their dream home by asking clarifying questions and then using the `searchProperties` tool. Be aware of local terminology (e.g., 'Unit' instead of 'Condo', 'Terrace' house). You can also see what the user shows you through their camera to provide better recommendations. Keep your spoken responses relatively short and conversational.",
          tools: [{ functionDeclarations: [searchPropertiesTool] }],
        },
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Session Opened");
            // Start Input Stream Processing
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);

              // Calculate volume for visualizer
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) {
                sum += inputData[i] * inputData[i];
              }
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(1, rms * 5)); // Boost sensitivity

              // Send to Gemini
              const pcmInt16 = AudioStreamer.float32ToInt16(inputData);
              const pcmData = AudioStreamer.arrayBufferToBase64(pcmInt16.buffer as ArrayBuffer);

              sessionPromise.then((session) => {
                 session.sendRealtimeInput({
                    media: {
                        mimeType: 'audio/pcm;rate=16000',
                        data: pcmData
                    }
                 });
              });
            };

            source.connect(processor);
            processor.connect(inputAudioContextRef.current.destination);

            inputSourceRef.current = source;
            processorRef.current = processor;
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Transcription
            if (msg.serverContent?.inputTranscription && onTranscription) {
                onTranscription(msg.serverContent.inputTranscription.text, !msg.serverContent.turnComplete);
            }

            // Handle Function Calls
            if (msg.toolCall) {
                console.log("Tool Call Received:", msg.toolCall);
                const toolResponse = await onToolCall(msg.toolCall.functionCalls);

                // Send response back to Gemini
                sessionPromise.then((session) => {
                    session.sendToolResponse({
                        functionResponses: toolResponse
                    });
                });
            }

            // Handle Audio Output
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && audioContextRef.current && outputNodeRef.current) {
               setIsSpeaking(true);
               // Manual PCM decoding required for Gemini Live API
               const pcmData = await AudioStreamer.decode(audioData);
               const audioBuffer = await AudioStreamer.decodeAudioData(
                   pcmData,
                   audioContextRef.current,
                   OUTPUT_SAMPLE_RATE,
                   1
               );

               const source = audioContextRef.current.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputNodeRef.current);

               // Schedule playback
               const currentTime = audioContextRef.current.currentTime;
               const startTime = Math.max(nextStartTimeRef.current, currentTime);
               source.start(startTime);
               nextStartTimeRef.current = startTime + audioBuffer.duration;

               activeSourcesRef.current.add(source);

               source.onended = () => {
                 activeSourcesRef.current.delete(source);
                 if (activeSourcesRef.current.size === 0) {
                    setIsSpeaking(false);
                 }
               };
            }

            // Handle Interruption
            if (msg.serverContent?.interrupted) {
                console.log("Interrupted");
                activeSourcesRef.current.forEach(source => source.stop());
                activeSourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                setIsSpeaking(false);
            }
          },
          onclose: () => {
            setStatus('idle');
            console.log("Session Closed");
            if (inputAudioContextRef.current) {
              inputAudioContextRef.current.close();
              inputAudioContextRef.current = null;
            }
          },
          onerror: (err) => {
            console.error("Session Error", err);
            setStatus('error');
          }
        }
      });

      sessionRef.current = sessionPromise;

    } catch (e) {
      console.error("Failed to connect", e);
      setStatus('error');
    }
  }, [onToolCall, onTranscription]);

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
        sessionRef.current.then((session: any) => session.close());
    }
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (inputSourceRef.current) {
        inputSourceRef.current.disconnect();
        inputSourceRef.current = null;
    }
    if (inputAudioContextRef.current) {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    setStatus('idle');
    setIsSpeaking(false);
    setVolume(0);
  }, []);

  const sendImageFrame = useCallback((base64Data: string) => {
    if (sessionRef.current) {
        sessionRef.current.then((session: any) => {
            session.sendRealtimeInput({
                media: {
                    mimeType: 'image/jpeg',
                    data: base64Data
                }
            });
        });
    }
  }, []);

  return {
    connect,
    disconnect,
    sendImageFrame,
    status,
    isSpeaking,
    volume
  };
};

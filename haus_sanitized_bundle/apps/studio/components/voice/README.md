# Voice Components

This directory contains voice-enabled components for the HAUS application, providing speech recognition and AI-powered property search capabilities.

## Components

### AIVoice.tsx

A visual microphone component with animated waveform and timer display.

**Props:**
- `submitted`: boolean - Whether voice input is active
- `statusText`: string - Current status message to display
- `onClick`: () => void - Click handler for toggle

**Features:**
- Animated waveform visualization (48 bars)
- Real-time timer display (MM:SS format)
- Smooth transitions and animations
- Responsive design

**Example Usage:**
```tsx
import AIVoice from './components/voice/AIVoice';

function MyComponent() {
  const [isListening, setIsListening] = useState(false);

  return (
    <AIVoice
      submitted={isListening}
      statusText={isListening ? "Listening..." : "Click to speak"}
      onClick={() => setIsListening(!isListening)}
    />
  );
}
```

---

### VoiceCopilotModal.tsx

Full-featured voice search modal with AI-powered parameter extraction and real-time transcript highlighting.

**Props:**
- `onResults`: (results: any[], params: SearchParams) => void - Callback when search is completed
- `onClose`: () => void - Callback to close the modal

**Features:**
- Real-time speech recognition with interim results
- AI-powered extraction of search parameters (location, price, bedrooms, etc.)
- Live transcript highlighting with visual feedback
- Editable parameter cards with glow effects
- Support for 15+ amenities selection
- Debounced processing (800ms) for efficient API usage
- Mock property generation based on extracted parameters

**Search Parameters Supported:**
- `location`: City, state, or neighborhood
- `propertyType`: House, Apartment, Condo, Townhouse, Loft
- `listingType`: For Sale, For Rent
- `priceMin` / `priceMax`: Price range
- `bedroomsMin` / `bathroomsMin`: Room counts
- `squareFootageMin` / `squareFootageMax`: Size range
- `amenities`: Array of desired amenities

**Example Usage:**
```tsx
import VoiceCopilotModal from './components/voice/VoiceCopilotModal';
import { SearchParams } from './types';

function MyComponent() {
  const [showVoice, setShowVoice] = useState(false);

  const handleVoiceResults = (results: any[], params: SearchParams) => {
    console.log('Found properties:', results);
    console.log('Search params:', params);
    // Update your app state with results
  };

  return (
    <>
      <button onClick={() => setShowVoice(true)}>
        Search with Voice
      </button>

      {showVoice && (
        <VoiceCopilotModal
          onResults={handleVoiceResults}
          onClose={() => setShowVoice(false)}
        />
      )}
    </>
  );
}
```

---

## Hooks

### useLiveSession.ts

Custom hook for integrating with Google Gemini Live API for real-time voice conversations.

**Features:**
- Bi-directional audio streaming (microphone input, AI response output)
- Real-time transcription
- Function calling support (e.g., property search)
- Volume monitoring for visualizers
- Automatic interruption handling

**Parameters:**
- `onToolCall`: (functionCalls: any[]) => Promise<any> - Handle AI function calls
- `onTranscription`: (text: string, isInterim: boolean) => void - Receive transcribed text

**Returns:**
```typescript
{
  connect: () => Promise<void>,
  disconnect: () => void,
  sendImageFrame: (base64Data: string) => void,
  status: 'idle' | 'connected' | 'error',
  isSpeaking: boolean,
  volume: number
}
```

**Example Usage:**
```tsx
import { useLiveSession } from './hooks/useLiveSession';

function VoiceAgent() {
  const { connect, disconnect, status, isSpeaking, volume } = useLiveSession({
    onToolCall: async (functionCalls) => {
      // Handle function calls from Gemini
      const responses = [];
      for (const call of functionCalls) {
        if (call.name === 'searchProperties') {
          const results = await searchProperties(call.args);
          responses.push({
            id: call.id,
            name: call.name,
            response: { result: `Found ${results.length} properties` }
          });
        }
      }
      return responses;
    },
    onTranscription: (text, isInterim) => {
      console.log('Transcript:', text);
    }
  });

  return (
    <div>
      <button onClick={connect}>Start Voice Session</button>
      <button onClick={disconnect}>End Session</button>
      <p>Status: {status}</p>
      <p>AI Speaking: {isSpeaking ? 'Yes' : 'No'}</p>
      <p>Volume: {volume.toFixed(2)}</p>
    </div>
  );
}
```

---

## Utilities

### voice.ts

Comprehensive voice utilities including speech recognition, audio streaming, and recording.

**Exports:**

#### Functions
- `startSpeechRecognition()` - Start browser speech recognition
- `synthesizeSpeech()` - Text-to-speech output

#### Classes/Objects
- `AudioRecorder` - Microphone stream management
- `AudioStreamer` - PCM audio conversion utilities
- `SpeechRecognitionHandler` - Wrapper for Speech Recognition API

**AudioStreamer Methods:**
```typescript
AudioStreamer.float32ToInt16(float32: Float32Array): Int16Array
AudioStreamer.int16ToFloat32(int16: Int16Array): Float32Array
AudioStreamer.arrayBufferToBase64(buffer: ArrayBuffer): string
AudioStreamer.base64ToArrayBuffer(base64: string): ArrayBuffer
AudioStreamer.decode(base64: string): Uint8Array
AudioStreamer.decodeAudioData(data, ctx, sampleRate, channels): Promise<AudioBuffer>
AudioStreamer.calculateVolume(channelData: Float32Array): number
```

**SpeechRecognitionHandler Usage:**
```tsx
import { SpeechRecognitionHandler } from './utils/voice';

const handler = new SpeechRecognitionHandler();

handler.onResult((transcript, isFinal) => {
  console.log(isFinal ? 'Final:' : 'Interim:', transcript);
});

handler.onError((error) => {
  console.error('Recognition error:', error);
});

handler.start(); // Start listening
// ... later
handler.stop();  // Stop listening
handler.destroy(); // Clean up
```

---

## Types

All voice-related types are exported from `./types.ts`:

```typescript
// Search parameters
interface SearchParams {
  location?: string;
  propertyType?: string;
  listingType?: 'For Sale' | 'For Rent';
  priceMin?: number;
  priceMax?: number;
  bedroomsMin?: number;
  bathroomsMin?: number;
  squareFootageMin?: number;
  squareFootageMax?: number;
  amenities?: string[];
}

// Voice search status
type VoiceSearchStatus = "idle" | "listening" | "processing" | "done";

// Voice session state
interface VoiceSessionState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  volume: number;
  status: VoiceSearchStatus;
}

// Voice copilot props
interface VoiceCopilotProps {
  onResults: (results: any[], params: SearchParams) => void;
  onClose: () => void;
}

// Gemini Live config
interface GeminiLiveConfig {
  model: string;
  apiKey: string;
  systemInstruction?: string;
  tools?: any[];
}

// Audio visualizer config
interface AudioVisualizerConfig {
  size?: number;
  accentColor?: string;
  mode?: 'orb' | 'wave' | 'bars';
  volumeLevel?: number;
  frequencyData?: Uint8Array;
}
```

---

## Browser Support

### Speech Recognition
- Chrome/Edge: ✅ Full support (webkitSpeechRecognition)
- Safari: ✅ Full support (webkitSpeechRecognition)
- Firefox: ❌ No support

### Audio Recording
- All modern browsers: ✅ Full support (MediaRecorder API)

### Gemini Live API
- Requires HTTPS connection
- Requires user interaction to start audio context

---

## Dependencies

- `@google/genai` - Google Generative AI SDK
- React 19+

---

## Environment Variables

Required for voice features:

```bash
# .env.local
VITE_GOOGLE_API_KEY=your_api_key_here
```

---

## Example Integration

Complete example showing voice search with results:

```tsx
import { useState } from 'react';
import VoiceCopilotModal from './components/voice/VoiceCopilotModal';
import { SearchParams } from './types';

export default function PropertySearchApp() {
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [properties, setProperties] = useState([]);
  const [lastSearchParams, setLastSearchParams] = useState<SearchParams>({});

  const handleVoiceSearch = (results: any[], params: SearchParams) => {
    setProperties(results);
    setLastSearchParams(params);
    setShowVoiceModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">HAUS Real Estate</h1>
        <button
          onClick={() => setShowVoiceModal(true)}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          🎤 Voice Search
        </button>
      </header>

      <main className="p-4">
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {properties.map(property => (
              <div key={property.id} className="bg-gray-800 rounded-lg p-4">
                <img src={property.imageUrl} alt={property.title} className="w-full h-48 object-cover rounded" />
                <h3 className="mt-2 font-bold">{property.title}</h3>
                <p className="text-blue-400">{property.price}</p>
                <p className="text-gray-400">{property.location}</p>
                <p className="text-sm">{property.details}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-20">
            <p>Click "Voice Search" to find properties</p>
            <p className="text-sm mt-2">Try saying "Find 3 bedroom houses in Bondi under $2M"</p>
          </div>
        )}
      </main>

      {showVoiceModal && (
        <div className="fixed inset-0 z-50">
          <VoiceCopilotModal
            onResults={handleVoiceSearch}
            onClose={() => setShowVoiceModal(false)}
          />
        </div>
      )}
    </div>
  );
}
```

---

## Troubleshooting

### Speech Recognition Not Working
- Ensure you're using Chrome, Edge, or Safari
- Check browser permissions for microphone access
- Verify the site is served over HTTPS (required for microphone)

### Audio Issues
- Check that no other app is using the microphone
- Verify system audio output is working
- Try refreshing the page and re-granting permissions

### Gemini Live API Issues
- Verify your API key is valid
- Check browser console for error messages
- Ensure the model name is correct: `gemini-2.5-flash-native-audio-preview-12-2025`

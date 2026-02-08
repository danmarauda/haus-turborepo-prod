// Voice utility functions

export interface VoiceRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

export const DEFAULT_VOICE_CONFIG: VoiceRecognitionConfig = {
  language: 'en-AU',
  continuous: false,
  interimResults: true,
  maxAlternatives: 1,
};

// Type definition for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export type SpeechRecognition = any;

export function startSpeechRecognition(
  onResult: (transcript: string, isFinal: boolean) => void,
  onError?: (error: string) => void
): SpeechRecognition | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const SpeechRecognitionAPI = 
    window.SpeechRecognition || 
    window.webkitSpeechRecognition;

  if (!SpeechRecognitionAPI) {
    onError?.('Speech recognition not supported in this browser');
    return null;
  }

  const recognition = new SpeechRecognitionAPI();
  recognition.lang = DEFAULT_VOICE_CONFIG.language;
  recognition.continuous = DEFAULT_VOICE_CONFIG.continuous;
  recognition.interimResults = DEFAULT_VOICE_CONFIG.interimResults;
  recognition.maxAlternatives = DEFAULT_VOICE_CONFIG.maxAlternatives;

  recognition.onresult = (event: any) => {
    const last = event.results.length - 1;
    const transcript = event.results[last][0].transcript;
    const isFinal = event.results[last].isFinal;
    onResult(transcript, isFinal);
  };

  recognition.onerror = (event: any) => {
    onError?.(event.error);
  };

  recognition.start();
  return recognition;
}

export function synthesizeSpeech(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-AU';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

// AudioStreamer class for streaming audio
export class AudioStreamer {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;

  async start(): Promise<void> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
    } catch (error) {
      console.error('Error starting audio stream:', error);
      throw error;
    }
  }

  stop(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  getStream(): MediaStream | null {
    return this.mediaStream;
  }

  // Static utility methods
  static float32ToInt16(float32Array: Float32Array): Int16Array {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16Array;
  }

  static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  static async decode(base64Audio: string): Promise<ArrayBuffer> {
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  static async decodeAudioData(
    audioData: ArrayBuffer,
    audioContext: AudioContext,
    sampleRate: number,
    channels: number
  ): Promise<AudioBuffer> {
    // Decode the audio data
    const audioBuffer = await audioContext.decodeAudioData(audioData);
    
    // Resample if necessary
    if (audioBuffer.sampleRate !== sampleRate) {
      const offlineContext = new OfflineAudioContext(
        channels,
        audioBuffer.duration * sampleRate,
        sampleRate
      );
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      return await offlineContext.startRendering();
    }
    
    return audioBuffer;
  }
}

// AudioRecorder class for recording audio
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  async start(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting audio recorder:', error);
      throw error;
    }
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not initialized'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  }

  // Static utility method
  static async createMicrophoneStream(): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({ audio: true });
  }
}

import React, { useState, useEffect } from 'react';

interface VoiceSearchProps {
  onSearchResult: (query: string) => void;
}

const VoiceSearch: React.FC<VoiceSearchProps> = ({ onSearchResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-AU';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        onSearchResult(finalTranscript);
        setIsListening(false);
      } else {
        setTranscript(interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    (window as any).recognition = recognition;

    return () => {
      if ((window as any).recognition) {
        (window as any).recognition.abort();
      }
    };
  }, [onSearchResult]);

  const startListening = () => {
    const recognition = (window as any).recognition;
    if (recognition) {
      recognition.start();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={startListening}
        disabled={isListening}
        className={`p-3 rounded-full transition-all ${
          isListening
            ? 'bg-red-500 animate-pulse'
            : 'bg-zinc-800 hover:bg-zinc-700'
        }`}
        title="Voice Search"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isListening ? 'text-white' : 'text-zinc-400'}
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>
      {transcript && (
        <span className="text-sm text-zinc-400 max-w-xs truncate">
          {transcript}
        </span>
      )}
    </div>
  );
};

export default VoiceSearch;

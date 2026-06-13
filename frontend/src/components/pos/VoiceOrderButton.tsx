'use client';

import { useState, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

export function VoiceOrderButton({ onParsedItems }: { onParsedItems: (items: any[]) => void }) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setIsListening(false);
      setIsProcessing(true);
      try {
        const items = await apiClient.post('/orders/voice-parse', { text });
        if (items && items.length > 0) {
          onParsedItems(items);
        } else {
          alert('Could not match any products from: "' + text + '"');
        }
      } catch (error) {
        console.error('Voice parsing failed', error);
      } finally {
        setIsProcessing(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  if (isProcessing) {
    return (
      <button disabled className="flex items-center gap-2 px-4 py-2 rounded-full bg-cafe-primary/20 text-cafe-primary font-bold">
        <Loader2 size={18} className="animate-spin" /> Processing...
      </button>
    );
  }

  if (isListening) {
    return (
      <button onClick={stopListening} className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-500 border border-red-200 font-bold shadow-sm animate-pulse">
        <MicOff size={18} /> Stop
      </button>
    );
  }

  return (
    <button onClick={startListening} className="flex items-center gap-2 px-4 py-2 rounded-full bg-cafe-primary text-white font-bold shadow-sm hover:bg-cafe-primary-hover transition-colors">
      <Mic size={18} /> Voice Order
    </button>
  );
}

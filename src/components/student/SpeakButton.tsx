'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

interface SpeakButtonProps {
  isSpeaking: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export default function SpeakButton({ isSpeaking, onStart, onStop, disabled }: SpeakButtonProps) {
  const handleMouseDown = useCallback(() => {
    if (!disabled) onStart();
  }, [onStart, disabled]);

  const handleMouseUp = useCallback(() => {
    if (isSpeaking) onStop();
  }, [onStop, isSpeaking]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (!disabled) onStart();
    },
    [onStart, disabled]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (isSpeaking) onStop();
    },
    [onStop, isSpeaking]
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        disabled={disabled}
        animate={
          isSpeaking
            ? { scale: [1, 1.05, 1], boxShadow: ['0 0 0 0 rgba(34,197,94,0.4)', '0 0 0 20px rgba(34,197,94,0)', '0 0 0 0 rgba(34,197,94,0)'] }
            : { scale: 1 }
        }
        transition={isSpeaking ? { duration: 1, repeat: Infinity } : {}}
        className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 font-bold text-white shadow-lg select-none transition-colors ${
          isSpeaking
            ? 'bg-green-500 hover:bg-green-600'
            : disabled
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
        }`}
        style={{ touchAction: 'none', userSelect: 'none' }}
      >
        {isSpeaking ? (
          <Mic className="w-8 h-8" />
        ) : (
          <MicOff className="w-8 h-8 opacity-70" />
        )}
        <span className="text-xs">{isSpeaking ? 'Release' : 'Hold'}</span>
      </motion.button>
      <p className="text-sm text-gray-500 font-medium">
        {isSpeaking ? '🎙️ Speaking...' : 'Hold to speak'}
      </p>
    </div>
  );
}

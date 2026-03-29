'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface AvatarProps {
  name: string;
  isSpeaking: boolean;
  totalSpeakingTime: number; // seconds
  isCurrentUser?: boolean;
  personality?: 'E' | 'I' | null;
}

export default function AvatarArea({
  name,
  isSpeaking,
  totalSpeakingTime,
  isCurrentUser = false,
  personality,
}: AvatarProps) {
  // Speed increases with total speaking time (capped at 5x)
  const speedMultiplier = Math.min(1 + totalSpeakingTime / 60, 5);
  const animationDuration = isSpeaking ? 0.5 / speedMultiplier : 1;

  const avatarEmoji = personality === 'E' ? '🌟' : personality === 'I' ? '🌙' : '👤';

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        animate={
          isSpeaking
            ? {
                y: [0, -8, 0, -5, 0],
                x: [0, 3, -3, 2, 0],
                rotate: [0, 5, -5, 3, 0],
              }
            : { y: 0, x: 0, rotate: 0 }
        }
        transition={
          isSpeaking
            ? {
                duration: animationDuration,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : { duration: 0.3 }
        }
        className="relative"
      >
        {/* Avatar circle */}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-md ${
            isCurrentUser
              ? 'ring-4 ring-blue-400 ring-offset-2'
              : ''
          } ${
            isSpeaking
              ? 'bg-gradient-to-br from-yellow-300 to-orange-400 shadow-yellow-200'
              : 'bg-gradient-to-br from-blue-200 to-purple-300'
          }`}
        >
          {avatarEmoji}
        </div>

        {/* Speaking indicator */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="w-2 h-2 bg-white rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Name label */}
      <div className="text-center">
        <p className="text-xs font-semibold text-gray-700 truncate max-w-[80px]">
          {name}
          {isCurrentUser && ' (You)'}
        </p>
        <p className="text-xs text-gray-400">{totalSpeakingTime}s</p>
      </div>
    </div>
  );
}

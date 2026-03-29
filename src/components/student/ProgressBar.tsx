'use client';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface ProgressBarProps {
  timeRemaining: number; // seconds
  totalTime: number; // seconds
}

export default function ProgressBar({ timeRemaining, totalTime }: ProgressBarProps) {
  const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isWarning = progress >= 80;
  const isUrgent = progress >= 90;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-blue-500'}`} />
          <span className="text-sm font-semibold text-gray-600">Time Remaining</span>
        </div>
        <span className={`font-bold tabular-nums ${isUrgent ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-gray-800'}`}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>

      {/* Track */}
      <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
        {/* Track lines */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex-1 border-r border-gray-200 last:border-0" />
          ))}
        </div>

        {/* Progress fill */}
        <motion.div
          className={`absolute left-0 top-0 h-full rounded-full ${
            isUrgent ? 'bg-red-400' : isWarning ? 'bg-yellow-400' : 'bg-blue-400'
          }`}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Runner emoji */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 text-sm"
          animate={{ left: `${Math.min(progress, 95)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          🏃
        </motion.div>
      </div>

      {isWarning && !isUrgent && (
        <p className="text-xs text-yellow-600 mt-1 font-medium">
          ⚠️ Time to wrap up!
        </p>
      )}
      {isUrgent && (
        <p className="text-xs text-red-600 mt-1 font-medium animate-pulse">
          🔴 Almost done! Start summarizing.
        </p>
      )}
    </div>
  );
}

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X } from 'lucide-react';

interface AIGuidanceBubbleProps {
  message: string | null;
  loading?: boolean;
  onDismiss?: () => void;
}

export default function AIGuidanceBubble({
  message,
  loading = false,
  onDismiss,
}: AIGuidanceBubbleProps) {
  return (
    <AnimatePresence>
      {(message || loading) && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full px-4"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-4 relative">
            {/* Robot icon */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-purple-600" />
              </div>

              <div className="flex-1">
                <p className="text-xs font-semibold text-purple-600 mb-1">AI Guide</p>
                {loading ? (
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                        className="w-2 h-2 bg-purple-400 rounded-full"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
                )}
              </div>

              {onDismiss && message && (
                <button
                  onClick={onDismiss}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Tail */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-b border-r border-purple-100" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

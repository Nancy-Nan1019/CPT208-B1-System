'use client';

import { motion, AnimatePresence, Reorder } from 'framer-motion';
import type { Score } from '@/types';
import { Trophy } from 'lucide-react';

interface ScoreboardRankingProps {
  scores: Score[];
  currentUserId?: string;
}

export default function ScoreboardRanking({ scores, currentUserId }: ScoreboardRankingProps) {
  const rankColors = ['text-yellow-500', 'text-gray-400', 'text-orange-500'];
  const rankEmojis = ['🥇', '🥈', '🥉'];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="font-bold text-gray-800">Score Board</h3>
      </div>

      <Reorder.Group axis="y" values={scores} onReorder={() => {}}>
        <AnimatePresence>
          {scores.map((score, index) => (
            <Reorder.Item key={score.user_id} value={score} drag={false}>
              <motion.div
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg mb-2 ${
                  score.user_id === currentUserId
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-lg ${rankColors[index] ?? 'text-gray-400'}`}>
                    {rankEmojis[index] ?? `${index + 1}`}
                  </span>
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[80px]">
                    {score.user?.name ?? 'Unknown'}
                    {score.user_id === currentUserId && (
                      <span className="ml-1 text-xs text-blue-500">(You)</span>
                    )}
                  </span>
                </div>
                <motion.span
                  key={score.total_score}
                  initial={{ scale: 1.3, color: '#22c55e' }}
                  animate={{ scale: 1, color: '#374151' }}
                  transition={{ duration: 0.3 }}
                  className="font-bold text-sm tabular-nums"
                >
                  {score.total_score.toLocaleString()}
                </motion.span>
              </motion.div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {scores.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-4">No scores yet</p>
      )}
    </div>
  );
}

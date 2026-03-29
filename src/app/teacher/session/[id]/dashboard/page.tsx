'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Mic, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { subscribeToSessionUpdates, unsubscribe } from '@/lib/realtime';
import type { Session, Score } from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface GroupStat {
  id: string;
  name: string;
  totalSpeaking: number;
  memberCount: number;
  lastActivity: number;
  members: { name: string; score: number }[];
}

export default function DashboardPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [session, setSession] = useState<Session | null>(null);
  const [groupStats, setGroupStats] = useState<GroupStat[]>([]);
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    let scoreChannel: RealtimeChannel | null = null;

    async function init() {
      // Fetch session
      const { data: sessionData } = await supabase.from('sessions').select('*').eq('id', sessionId).single();
      if (sessionData) setSession(sessionData as Session);

      // Fetch scores
      await refreshScores();

      // Subscribe to score changes
      scoreChannel = subscribeToSessionUpdates(sessionId, () => refreshScores());
    }

    async function refreshScores() {
      const { data: scoresData } = await supabase
        .from('scores')
        .select('*, user:users(id, name)')
        .eq('session_id', sessionId);

      if (scoresData) {
        setScores(scoresData as Score[]);
      }
    }

    init();

    return () => {
      if (scoreChannel) unsubscribe(scoreChannel);
    };
  }, [sessionId]);

  // Build chart data
  const barChartData = scores.map((s) => ({
    name: s.user?.name ?? 'Unknown',
    score: s.total_score,
  }));

  const silentGroups = groupStats.filter(
    (g) => Date.now() - g.lastActivity > 30000
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Live Dashboard</h1>
          {session && (
            <p className="text-gray-500">{session.topic}</p>
          )}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live
        </div>
      </div>

      {/* Silence alerts */}
      {silentGroups.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-yellow-700 text-sm font-medium">
            ⚠️ Groups silent for 30s: {silentGroups.map((g) => g.name).join(', ')}
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Speaking duration chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mic className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-800">Participation Scores</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Score table */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Leaderboard</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...scores]
              .sort((a, b) => b.total_score - a.total_score)
              .map((score, i) => (
                <div key={score.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{['🥇', '🥈', '🥉'][i] ?? `${i + 1}`}</span>
                    <span className="text-sm font-medium text-gray-700">{score.user?.name}</span>
                  </div>
                  <span className="font-bold text-blue-600">{score.total_score.toLocaleString()}</span>
                </div>
              ))}
            {scores.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">No scores yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

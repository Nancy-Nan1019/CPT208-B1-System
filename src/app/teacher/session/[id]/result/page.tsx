'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Session, Score } from '@/types';

export default function ResultPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [session, setSession] = useState<Session | null>(null);
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    async function init() {
      const [{ data: sessionData }, { data: scoresData }] = await Promise.all([
        supabase.from('sessions').select('*').eq('id', sessionId).single(),
        supabase.from('scores').select('*, user:users(id, name)').eq('session_id', sessionId).order('total_score', { ascending: false }),
      ]);

      if (sessionData) setSession(sessionData as Session);
      if (scoresData) setScores(scoresData as Score[]);
    }
    init();
  }, [sessionId]);

  function exportCSV() {
    const header = 'Rank,Name,Score\n';
    const rows = scores.map((s, i) => `${i + 1},${s.user?.name ?? 'Unknown'},${s.total_score}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${sessionId}-results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const chartData = scores.map((s) => ({
    name: s.user?.name ?? 'Unknown',
    score: s.total_score,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Session Results</h1>
          {session && <p className="text-gray-500">{session.topic}</p>}
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-800 transition"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top 3 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-800">Top Participants</h3>
          </div>
          <div className="space-y-3">
            {scores.slice(0, 5).map((score, i) => (
              <div key={score.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{['🥇', '🥈', '🥉'][i] ?? `${i + 1}`}</span>
                  <span className="font-medium text-gray-700">{score.user?.name}</span>
                </div>
                <span className="font-bold text-blue-600 text-lg">{score.total_score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Score Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* All results table */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Full Results ({scores.length} participants)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-100">
                  <th className="text-left py-2 px-3">Rank</th>
                  <th className="text-left py-2 px-3">Name</th>
                  <th className="text-right py-2 px-3">Score</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, i) => (
                  <tr key={score.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-500">{i + 1}</td>
                    <td className="py-2 px-3 font-medium text-gray-800">{score.user?.name}</td>
                    <td className="py-2 px-3 text-right font-bold text-blue-600">{score.total_score.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, Users } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { DEFAULT_GROUP_SIZE, MIN_GROUP_SIZE, MAX_GROUP_SIZE } from '@/lib/constants';

export default function NewSessionPage() {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(20);
  const [groupSize, setGroupSize] = useState(DEFAULT_GROUP_SIZE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) { setError('Topic is required'); return; }
    setLoading(true);
    setError('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: dbError } = await supabase
        .from('sessions')
        .insert({
          topic: topic.trim(),
          duration,
          group_size: groupSize,
          status: 'waiting',
          teacher_id: user.id,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      router.push(`/teacher/session/${data.id}/groups`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/teacher"
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Create New Session</h1>
            <p className="text-sm text-gray-500">Set up a discussion for your class</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <BookOpen className="w-4 h-4" />
              Discussion Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The impact of social media on mental health"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
            <p className="text-xs text-gray-400 mt-1">This topic will be used by AI to generate discussion guidance</p>
          </div>

          {/* Duration */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Clock className="w-4 h-4" />
              Duration: <span className="text-blue-600">{duration} minutes</span>
            </label>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5 min</span>
              <span>60 min</span>
            </div>
          </div>

          {/* Group Size */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Users className="w-4 h-4" />
              Group Size: <span className="text-blue-600">{groupSize} students</span>
            </label>
            <input
              type="range"
              min={MIN_GROUP_SIZE}
              max={MAX_GROUP_SIZE}
              step={1}
              value={groupSize}
              onChange={(e) => setGroupSize(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{MIN_GROUP_SIZE} (min)</span>
              <span>{MAX_GROUP_SIZE} (max)</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/teacher"
              className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl font-semibold text-center hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Session →'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

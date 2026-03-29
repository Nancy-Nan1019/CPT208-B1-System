'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Play, BarChart2, Users, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@/types';

export default function TeacherHomePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchSessions() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) setSessions(data as Session[]);
      setLoading(false);
    }

    fetchSessions();
  }, [router]);

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-700';
      case 'in_progress': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: Session['status']) => {
    switch (status) {
      case 'waiting': return <Users className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your discussion sessions</p>
        </div>
        <Link
          href="/teacher/session/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm"
        >
          <Plus className="w-5 h-5" />
          New Session
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Sessions Yet</h3>
          <p className="text-gray-400 mb-6">Create your first discussion session</p>
          <Link
            href="/teacher/session/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Create Session
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-800">{session.topic}</h3>
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                    {getStatusIcon(session.status)}
                    {session.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  {session.duration} minutes · Created {new Date(session.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {session.status === 'waiting' && (
                  <Link
                    href={`/teacher/session/${session.id}/groups`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition"
                  >
                    <Users className="w-4 h-4" />
                    Manage
                  </Link>
                )}
                {session.status === 'in_progress' && (
                  <Link
                    href={`/teacher/session/${session.id}/dashboard`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition"
                  >
                    <BarChart2 className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                {session.status === 'completed' && (
                  <Link
                    href={`/teacher/session/${session.id}/result`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition"
                  >
                    <BarChart2 className="w-4 h-4" />
                    Results
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shuffle, Play, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useGrouping } from '@/hooks/useGrouping';
import type { Session } from '@/types';

export default function GroupsPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [starting, setStarting] = useState(false);
  const { waitingStudents, groups, loading, autoGroup, fetchGroups } = useGrouping(sessionId);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.from('sessions').select('*').eq('id', sessionId).single();
      if (data) setSession(data as Session);
      await fetchGroups();
    }
    init();
  }, [sessionId, fetchGroups]);

  async function handleAutoGroup() {
    if (!session) return;
    await autoGroup(session.groupSize ?? 4);
  }

  async function handleStartDiscussion() {
    if (groups.length === 0) return;
    setStarting(true);

    try {
      // Update session status to in_progress and set started_at
      await supabase.from('sessions').update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
      }).eq('id', sessionId);

      router.push(`/teacher/session/${sessionId}/dashboard`);
    } catch (err) {
      console.error(err);
      setStarting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/teacher" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-xl font-bold text-gray-800">Group Management</h1>
        <div />
      </div>

      {session && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h2 className="font-semibold text-blue-800">{session.topic}</h2>
          <p className="text-sm text-blue-600">Duration: {session.duration} min · Target group size: {session.groupSize ?? 4}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waiting students */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">
              Waiting Room ({waitingStudents.length})
            </h3>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {waitingStudents.map((student) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm"
                >
                  <span className="font-medium text-gray-700">{student.name}</span>
                  {student.personality && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      student.personality === 'E' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {student.personality === 'E' ? '🌟 E' : '🌙 I'}
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {waitingStudents.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No students yet</p>
            )}
          </div>

          <button
            onClick={handleAutoGroup}
            disabled={waitingStudents.length === 0 || loading}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50"
          >
            <Shuffle className="w-4 h-4" />
            Auto Group (E/I Balance)
          </button>
        </div>

        {/* Groups */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Groups ({groups.length})</h3>
            {groups.length > 0 && (
              <button
                onClick={handleStartDiscussion}
                disabled={starting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition text-sm disabled:opacity-50"
              >
                {starting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Start Discussion
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">👥</div>
              <p>Click &quot;Auto Group&quot; to create balanced groups</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {groups.map((group) => (
                <div key={group.id} className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">{group.name}</h4>
                  <div className="space-y-1.5">
                    {group.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{member.user?.name ?? 'Unknown'}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                          member.user?.personality === 'E' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {member.user?.personality ?? '?'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

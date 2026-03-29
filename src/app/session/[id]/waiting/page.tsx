'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { subscribeToSession, subscribeToGroupMembers, unsubscribe } from '@/lib/realtime';
import Header from '@/components/common/Header';
import type { Session } from '@/types';

interface WaitingStudent {
  id: string;
  name: string;
  personality: 'E' | 'I' | null;
}

export default function WaitingRoomPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [students, setStudents] = useState<WaitingStudent[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let sessionChannel: ReturnType<typeof subscribeToSession> | null = null;
    let membersChannel: ReturnType<typeof subscribeToGroupMembers> | null = null;

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setCurrentUserId(user.id);

      // Fetch session
      const { data: sessionData } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      if (sessionData) setSession(sessionData as Session);

      // Fetch students who joined this session's waiting room
      await fetchStudents(sessionId);
      setLoading(false);

      // Join waiting room (register as group_member with null group for this session)
      // Actually we just track all users who are logged in and know about this session
      
      // Subscribe to session status changes → redirect when started
      sessionChannel = subscribeToSession(sessionId, (payload) => {
        const updated = (payload as { new: Session }).new;
        if (updated?.status === 'in_progress') {
          checkGroupAndRedirect(user.id, sessionId);
        }
      });

      // Subscribe to group member changes for student count
      membersChannel = subscribeToGroupMembers(sessionId, () => {
        fetchStudents(sessionId);
      });
    }

    init();

    return () => {
      if (sessionChannel) unsubscribe(sessionChannel);
      if (membersChannel) unsubscribe(membersChannel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, router]);

  async function fetchStudents(sid: string) {
    const { data } = await supabase
      .from('group_members')
      .select('user:users(id, name, personality), group:groups(session_id)')
      .eq('group.session_id', sid);

    if (data) {
      const unique = new Map<string, WaitingStudent>();
      data.forEach((item: unknown) => {
        const d = item as { user: WaitingStudent };
        if (d.user) unique.set(d.user.id, d.user);
      });
      setStudents(Array.from(unique.values()));
    }
  }

  async function checkGroupAndRedirect(userId: string, sid: string) {
    const { data } = await supabase
      .from('group_members')
      .select('group_id, group:groups(session_id)')
      .eq('user_id', userId)
      .single();

    if (data) {
      router.push(`/session/${sid}/discussion`);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🏫</div>
            <h1 className="text-2xl font-bold text-gray-800">Waiting Room</h1>
            {session && (
              <p className="text-gray-500 mt-2">
                Topic: <span className="font-semibold text-gray-700">{session.topic}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-blue-600">
              <Users className="w-5 h-5" />
              <span className="font-semibold">{students.length} joined</span>
            </div>
            {session && (
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-5 h-5" />
                <span>{session.duration} min discussion</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mb-6 text-amber-600 bg-amber-50 rounded-lg p-3">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xl"
            >
              ⏳
            </motion.div>
            <p className="text-sm font-medium">Waiting for teacher to start grouping...</p>
          </div>

          {/* Student list */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Students in Session
            </h3>
            <AnimatePresence>
              {students.map((student) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg ${
                    student.id === currentUserId
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {student.name[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-700">
                      {student.name}
                      {student.id === currentUserId && (
                        <span className="ml-2 text-xs text-blue-500">(You)</span>
                      )}
                    </span>
                  </div>
                  {student.personality && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        student.personality === 'E'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {student.personality === 'E' ? '🌟 E' : '🌙 I'}
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

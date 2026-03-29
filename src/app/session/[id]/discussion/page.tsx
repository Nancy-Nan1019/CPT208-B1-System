'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { subscribeSpeakingState, unsubscribe } from '@/lib/realtime';
import { useScores } from '@/hooks/useScores';
import { useSpeakingState } from '@/hooks/useSpeakingState';
import { INDIVIDUAL_SILENCE_THRESHOLD, GROUP_SILENCE_THRESHOLD, TIME_WARNING_THRESHOLD } from '@/lib/constants';
import { aiApi } from '@/lib/api';
import AvatarArea from '@/components/student/AvatarArea';
import SpeakButton from '@/components/student/SpeakButton';
import ScoreboardRanking from '@/components/student/ScoreboardRanking';
import ProgressBar from '@/components/student/ProgressBar';
import AIGuidanceBubble from '@/components/student/AIGuidanceBubble';
import Header from '@/components/common/Header';
import type { Session } from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface GroupMemberInfo {
  userId: string;
  name: string;
  personality: 'E' | 'I' | null;
  lastSpeakAt: number;
  totalSpeakingTime: number;
}

export default function DiscussionRoomPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [members, setMembers] = useState<GroupMemberInfo[]>([]);
  const [speakingUserId, setSpeakingUserId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [aiGuidance, setAiGuidance] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const aiTriggeredRef = useRef(false);
  const speakingChannelRef = useRef<RealtimeChannel | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { scores } = useScores(groupId, sessionId);
  const { isSpeaking, startSpeaking, stopSpeaking } = useSpeakingState(groupId, currentUserId);

  useEffect(() => {
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
      if (!sessionData) { router.push('/session'); return; }
      setSession(sessionData as Session);

      // Calculate time remaining
      const startedAt = sessionData.started_at ? new Date(sessionData.started_at).getTime() : Date.now();
      const totalMs = sessionData.duration * 60 * 1000;
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, Math.floor((totalMs - elapsed) / 1000));
      setTimeRemaining(remaining);

      // Find user's group
      const { data: gmData } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)
        .single();

      if (!gmData) { router.push(`/session/${sessionId}/waiting`); return; }
      setGroupId(gmData.group_id);

      // Fetch group members
      const { data: groupMembersData } = await supabase
        .from('group_members')
        .select('user:users(id, name, personality)')
        .eq('group_id', gmData.group_id);

      if (groupMembersData) {
        setMembers(
          groupMembersData.map((gm: unknown) => {
            const d = gm as { user: { id: string; name: string; personality: 'E' | 'I' | null } };
            return {
              userId: d.user.id,
              name: d.user.name,
              personality: d.user.personality,
              lastSpeakAt: Date.now(),
              totalSpeakingTime: 0,
            };
          })
        );
      }
    }

    init();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
      if (speakingChannelRef.current) unsubscribe(speakingChannelRef.current);
    };
  }, [sessionId, router]);

  // Set up speaking subscription
  useEffect(() => {
    if (!groupId) return;

    speakingChannelRef.current = subscribeSpeakingState(groupId, (payload) => {
      const log = (payload as { new: { user_id: string; end_time?: string | null; duration?: number } }).new;
      if (!log) return;

      if (!log.end_time) {
        // Someone started speaking
        setSpeakingUserId(log.user_id);
        setMembers((prev) =>
          prev.map((m) =>
            m.userId === log.user_id ? { ...m, lastSpeakAt: Date.now() } : m
          )
        );
      } else {
        // Speaking ended
        setSpeakingUserId(null);
        const duration = log.duration ?? 0;
        setMembers((prev) =>
          prev.map((m) =>
            m.userId === log.user_id
              ? { ...m, totalSpeakingTime: m.totalSpeakingTime + duration }
              : m
          )
        );
      }
    });

    return () => {
      if (speakingChannelRef.current) unsubscribe(speakingChannelRef.current);
    };
  }, [groupId]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0 || !session) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setSessionEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session, timeRemaining]);

  // AI guidance trigger
  const triggerAI = useCallback(
    async (triggerType: 'individual_silence' | 'group_silence' | 'time_warning', silentUsers?: string[]) => {
      if (aiTriggeredRef.current || !session || !groupId) return;
      aiTriggeredRef.current = true;
      setAiLoading(true);

      try {
        const { data } = await aiApi.getGuidance({
          topic: session.topic,
          triggerType,
          silentUsers,
          sessionId,
          groupId,
        });
        setAiGuidance(data.message);
      } catch (err) {
        console.error('AI guidance error:', err);
      } finally {
        setAiLoading(false);
        // Allow re-triggering after 30s
        setTimeout(() => {
          aiTriggeredRef.current = false;
        }, 30000);
      }
    },
    [session, groupId, sessionId]
  );

  // Silence monitoring
  useEffect(() => {
    if (!session || !groupId) return;
    const totalTime = session.duration * 60;

    silenceTimerRef.current = setInterval(() => {
      const now = Date.now();

      // Check time warning (80% elapsed)
      if (timeRemaining > 0 && timeRemaining <= totalTime * (1 - TIME_WARNING_THRESHOLD)) {
        triggerAI('time_warning');
      }

      // Check individual silence
      const silentMembers = members.filter(
        (m) => (now - m.lastSpeakAt) / 1000 > INDIVIDUAL_SILENCE_THRESHOLD
      );
      if (silentMembers.length > 0) {
        triggerAI('individual_silence', silentMembers.map((m) => m.name));
        return;
      }

      // Check group silence
      const allSilent = members.every(
        (m) => (now - m.lastSpeakAt) / 1000 > GROUP_SILENCE_THRESHOLD
      );
      if (allSilent && members.length > 0) {
        triggerAI('group_silence');
      }
    }, 10000); // Check every 10 seconds

    return () => {
      if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
    };
  }, [session, groupId, members, timeRemaining, triggerAI]);

  if (sessionEnded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Discussion Complete!</h1>
          <p className="text-gray-500 mb-6">Great participation! Here are the final scores.</p>
          <div className="space-y-2 mb-6">
            {scores.slice(0, 5).map((score, i) => (
              <div key={score.user_id} className="flex justify-between px-4 py-2 bg-gray-50 rounded-lg">
                <span className="font-medium">{['🥇', '🥈', '🥉'][i] ?? `${i + 1}.`} {score.user?.name}</span>
                <span className="font-bold text-blue-600">{score.total_score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 py-4 gap-4">
        {/* Progress bar */}
        {session && (
          <ProgressBar
            timeRemaining={timeRemaining}
            totalTime={session.duration * 60}
          />
        )}

        <div className="flex-1 flex gap-4">
          {/* Main area: avatars */}
          <div className="flex-1 bg-white rounded-2xl shadow-md p-6 flex flex-col">
            <div className="text-center mb-4">
              <h2 className="font-bold text-gray-700">
                {session?.topic ?? 'Discussion Room'}
              </h2>
              <p className="text-sm text-gray-400">
                {speakingUserId
                  ? `${members.find((m) => m.userId === speakingUserId)?.name ?? 'Someone'} is speaking...`
                  : 'No one is speaking'}
              </p>
            </div>

            {/* Avatar grid */}
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-wrap gap-8 justify-center">
                {members.map((member) => (
                  <AvatarArea
                    key={member.userId}
                    name={member.name}
                    isSpeaking={
                      member.userId === currentUserId ? isSpeaking : speakingUserId === member.userId
                    }
                    totalSpeakingTime={member.totalSpeakingTime}
                    isCurrentUser={member.userId === currentUserId}
                    personality={member.personality}
                  />
                ))}
              </div>
            </div>

            {/* Speak button */}
            <div className="flex justify-center mt-6">
              <SpeakButton
                isSpeaking={isSpeaking}
                onStart={startSpeaking}
                onStop={stopSpeaking}
                disabled={sessionEnded}
              />
            </div>
          </div>

          {/* Scoreboard */}
          <div className="w-48">
            <ScoreboardRanking scores={scores} currentUserId={currentUserId ?? undefined} />
          </div>
        </div>
      </div>

      {/* AI Guidance Bubble */}
      <AIGuidanceBubble
        message={aiGuidance}
        loading={aiLoading}
        onDismiss={() => setAiGuidance(null)}
      />
    </div>
  );
}

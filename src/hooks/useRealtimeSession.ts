'use client';

import { useEffect, useRef } from 'react';
import { subscribeToSession, subscribeToSessionUpdates, unsubscribe } from '@/lib/realtime';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Session, Score } from '@/types';

export function useRealtimeSession(sessionId: string | null) {
  const { setCurrentSession, setScores } = useStore();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const scoresChannelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    // Fetch initial data
    async function fetchInitialData() {
      const [{ data: session }, { data: scores }] = await Promise.all([
        supabase.from('sessions').select('*').eq('id', sessionId).single(),
        supabase
          .from('scores')
          .select('*, user:users(id, name)')
          .eq('session_id', sessionId),
      ]);

      if (session) setCurrentSession(session as Session);
      if (scores) setScores(scores as Score[]);
    }

    fetchInitialData();

    // Subscribe to session status changes
    channelRef.current = subscribeToSession(sessionId, (payload) => {
      const updated = (payload as { new: Session }).new;
      if (updated) setCurrentSession(updated);
    });

    // Subscribe to score updates
    scoresChannelRef.current = subscribeToSessionUpdates(sessionId, async () => {
      const { data: scores } = await supabase
        .from('scores')
        .select('*, user:users(id, name)')
        .eq('session_id', sessionId);
      if (scores) setScores(scores as Score[]);
    });

    return () => {
      if (channelRef.current) unsubscribe(channelRef.current);
      if (scoresChannelRef.current) unsubscribe(scoresChannelRef.current);
    };
  }, [sessionId, setCurrentSession, setScores]);
}

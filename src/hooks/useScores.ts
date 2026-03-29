'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { subscribeSpeakingState, unsubscribe } from '@/lib/realtime';
import { useStore } from '@/store/useStore';
import type { Score } from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useScores(groupId: string | null, sessionId: string | null) {
  const { scores, setScores } = useStore();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId || !sessionId) return;

    // Fetch initial scores
    async function fetchScores() {
      setLoading(true);
      const { data } = await supabase
        .from('scores')
        .select('*, user:users(id, name)')
        .eq('group_id', groupId)
        .eq('session_id', sessionId)
        .order('total_score', { ascending: false });
      if (data) setScores(data as Score[]);
      setLoading(false);
    }

    fetchScores();

    // Subscribe to speaking logs to update scores in real-time
    channelRef.current = subscribeSpeakingState(groupId, async () => {
      const { data } = await supabase
        .from('scores')
        .select('*, user:users(id, name)')
        .eq('group_id', groupId)
        .eq('session_id', sessionId)
        .order('total_score', { ascending: false });
      if (data) setScores(data as Score[]);
    });

    return () => {
      if (channelRef.current) unsubscribe(channelRef.current);
    };
  }, [groupId, sessionId, setScores]);

  const sortedScores = [...scores].sort((a, b) => b.total_score - a.total_score);

  return { scores: sortedScores, loading };
}

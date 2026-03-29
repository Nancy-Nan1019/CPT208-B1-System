'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { speakingApi } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { SPEAKING_HEARTBEAT_INTERVAL, SCORE_PER_SECOND } from '@/lib/constants';

export function useSpeakingState(groupId: string | null, userId: string | null) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingDuration, setSpeakingDuration] = useState(0);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const { setSpeakingUserId } = useStore();

  const startSpeaking = useCallback(() => {
    if (!groupId || !userId || isSpeaking) return;

    setIsSpeaking(true);
    setSpeakingUserId(userId);
    startTimeRef.current = Date.now();

    // Send heartbeats at SPEAKING_HEARTBEAT_INTERVAL ms
    heartbeatRef.current = setInterval(() => {
      speakingApi.heartbeat({ groupId, userId }).catch(console.error);
    }, SPEAKING_HEARTBEAT_INTERVAL);
  }, [groupId, userId, isSpeaking, setSpeakingUserId]);

  const stopSpeaking = useCallback(() => {
    if (!isSpeaking) return;

    setIsSpeaking(false);
    setSpeakingUserId(null);

    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }

    if (startTimeRef.current) {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setSpeakingDuration((prev) => prev + duration);
      startTimeRef.current = null;
    }
  }, [isSpeaking, setSpeakingUserId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, []);

  const estimatedScore = Math.floor(speakingDuration * SCORE_PER_SECOND);

  return { isSpeaking, speakingDuration, estimatedScore, startSpeaking, stopSpeaking };
}

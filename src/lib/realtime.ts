import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Subscribe to score changes within a session.
 */
export function subscribeToSessionUpdates(
  sessionId: string,
  callback: (payload: unknown) => void
): RealtimeChannel {
  return supabase
    .channel(`session:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'scores',
        filter: `session_id=eq.${sessionId}`,
      },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to speaking log inserts within a group.
 */
export function subscribeSpeakingState(
  groupId: string,
  callback: (payload: unknown) => void
): RealtimeChannel {
  return supabase
    .channel(`speaking:${groupId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'speaking_logs',
        filter: `group_id=eq.${groupId}`,
      },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to group member changes within a session.
 */
export function subscribeToGroupMembers(
  sessionId: string,
  callback: (payload: unknown) => void
): RealtimeChannel {
  return supabase
    .channel(`group_members:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'group_members',
      },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to session status changes (e.g., waiting → in_progress).
 */
export function subscribeToSession(
  sessionId: string,
  callback: (payload: unknown) => void
): RealtimeChannel {
  return supabase
    .channel(`session_status:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${sessionId}`,
      },
      callback
    )
    .subscribe();
}

/**
 * Unsubscribe and remove a channel.
 */
export async function unsubscribe(channel: RealtimeChannel): Promise<void> {
  await supabase.removeChannel(channel);
}

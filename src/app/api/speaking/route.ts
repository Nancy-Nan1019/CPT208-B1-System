import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SCORE_PER_SECOND, SPEAKING_HEARTBEAT_INTERVAL } from '@/lib/constants';

/**
 * POST /api/speaking
 * Body: { groupId, userId }
 * 
 * This endpoint receives heartbeat pings while a user is speaking.
 * Each ping represents SPEAKING_HEARTBEAT_INTERVAL ms of speaking time.
 * It upserts a speaking_log and updates the user's score.
 */
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { groupId, userId } = await request.json();

    if (!groupId || !userId) {
      return NextResponse.json({ error: 'groupId and userId required' }, { status: 400 });
    }

    if (userId !== user.id) {
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }

    // Each heartbeat represents SPEAKING_HEARTBEAT_INTERVAL ms = 0.2 seconds
    const durationSeconds = SPEAKING_HEARTBEAT_INTERVAL / 1000;
    const scoreIncrement = Math.round(durationSeconds * SCORE_PER_SECOND);

    // Insert speaking heartbeat log
    await supabase.from('speaking_logs').insert({
      user_id: userId,
      group_id: groupId,
      start_time: new Date().toISOString(),
      duration: durationSeconds,
    });

    // Upsert score increment
    // First get current score
    const { data: existingScore } = await supabase
      .from('scores')
      .select('id, total_score')
      .eq('user_id', userId)
      .eq('group_id', groupId)
      .single();

    if (existingScore) {
      await supabase
        .from('scores')
        .update({
          total_score: existingScore.total_score + scoreIncrement,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingScore.id);
    }

    return NextResponse.json({ success: true, scoreIncrement });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

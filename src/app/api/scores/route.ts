import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const groupId = searchParams.get('groupId');

    let query = supabase.from('scores').select('*, user:users(id, name)');

    if (sessionId) query = query.eq('session_id', sessionId);
    if (groupId) query = query.eq('group_id', groupId);

    const { data, error } = await query.order('total_score', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ scores: data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

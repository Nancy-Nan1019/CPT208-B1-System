import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { balanceGrouping } from '@/lib/grouping';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase
      .from('groups')
      .select('*, members:group_members(*, user:users(id, name, personality))')
      .eq('session_id', params.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ groups: data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { groupSize } = await request.json();

    // Fetch students in the session (those who registered)
    const { data: students } = await supabase
      .from('users')
      .select('id, name, personality')
      .eq('role', 'student');

    if (!students || students.length === 0) {
      return NextResponse.json({ error: 'No students available' }, { status: 400 });
    }

    const studentsForGrouping = students.map((s) => ({
      id: s.id,
      name: s.name,
      personality: (s.personality ?? 'E') as 'E' | 'I',
    }));

    const grouped = balanceGrouping(studentsForGrouping, groupSize ?? 4);
    const createdGroups = [];

    for (let i = 0; i < grouped.length; i++) {
      const { data: group } = await supabase
        .from('groups')
        .insert({ session_id: params.id, name: `Group ${i + 1}` })
        .select()
        .single();

      if (group) {
        const memberInserts = grouped[i].map((student) => ({
          group_id: group.id,
          user_id: student.id,
        }));
        await supabase.from('group_members').insert(memberInserts);

        // Create initial score entries for group members
        const scoreInserts = grouped[i].map((student) => ({
          user_id: student.id,
          group_id: group.id,
          session_id: params.id,
          total_score: 0,
        }));
        await supabase.from('scores').insert(scoreInserts);

        createdGroups.push({ ...group, members: grouped[i] });
      }
    }

    return NextResponse.json({ groups: createdGroups }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

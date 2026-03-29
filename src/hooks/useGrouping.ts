'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { balanceGrouping } from '@/lib/grouping';
import type { GroupWithMembers } from '@/types';

export function useGrouping(sessionId: string | null) {
  const [waitingStudents, setWaitingStudents] = useState<
    { id: string; name: string; personality: 'E' | 'I' | null }[]
  >([]);
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    // Subscribe to waiting room (group_members with null group)
    const fetchWaiting = async () => {
      const { data } = await supabase
        .from('users')
        .select('id, name, personality')
        .eq('role', 'student');
      if (data) setWaitingStudents(data);
    };

    fetchWaiting();
  }, [sessionId]);

  const autoGroup = useCallback(
    async (groupSize: number) => {
      const studentsWithPersonality = waitingStudents.map((s) => ({
        ...s,
        personality: (s.personality ?? 'E') as 'E' | 'I',
      }));

      const grouped = balanceGrouping(studentsWithPersonality, groupSize);

      // Create groups in Supabase
      const createdGroups: GroupWithMembers[] = [];
      for (let i = 0; i < grouped.length; i++) {
        const { data: group } = await supabase
          .from('groups')
          .insert({ session_id: sessionId, name: `Group ${i + 1}` })
          .select()
          .single();

        if (group) {
          // Add members
          const memberInserts = grouped[i].map((student) => ({
            group_id: group.id,
            user_id: student.id,
          }));
          await supabase.from('group_members').insert(memberInserts);

          createdGroups.push({
            ...group,
            members: grouped[i].map((s) => ({
              id: crypto.randomUUID(),
              group_id: group.id,
              user_id: s.id,
              joined_at: new Date().toISOString(),
              user: { id: s.id, name: s.name, personality: s.personality },
            })),
          });
        }
      }

      setGroups(createdGroups);
      return createdGroups;
    },
    [sessionId, waitingStudents]
  );

  const fetchGroups = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    const { data } = await supabase
      .from('groups')
      .select('*, members:group_members(*, user:users(id, name, personality))')
      .eq('session_id', sessionId);
    if (data) setGroups(data as GroupWithMembers[]);
    setLoading(false);
  }, [sessionId]);

  return { waitingStudents, groups, loading, autoGroup, fetchGroups, setGroups };
}

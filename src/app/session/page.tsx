'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Loading from '@/components/common/Loading';

export default function SessionIndexPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    async function findActiveSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Find the most recent active session
      const { data: session } = await supabase
        .from('sessions')
        .select('id, status')
        .in('status', ['waiting', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (session) {
        // Check if student is in a group
        const { data: groupMember } = await supabase
          .from('group_members')
          .select('group_id, group:groups(session_id)')
          .eq('user_id', user.id)
          .single();

        if (groupMember && session.status === 'in_progress') {
          router.push(`/session/${session.id}/discussion`);
        } else {
          router.push(`/session/${session.id}/waiting`);
        }
      } else {
        setError('No active session found. Please wait for your teacher to start one.');
      }
    }

    findActiveSession();
  }, [router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-xl p-8 shadow-md text-center max-w-md">
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Active Session</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return <Loading message="Finding your session..." />;
}

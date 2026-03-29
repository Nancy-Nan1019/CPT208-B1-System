'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function OnboardingPage() {
  const [personality, setPersonality] = useState<'E' | 'I' | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSelect() {
    if (!personality) return;

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await supabase.from('users').update({ personality }).eq('id', user?.id);

      router.push('/session');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Choose Your Personality</h1>
        <p className="text-gray-500 mb-10 text-lg">
          This helps us create balanced discussion groups
        </p>

        <div className="flex gap-6 mb-10 justify-center flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPersonality('E')}
            className={`px-10 py-8 rounded-2xl text-xl font-bold shadow-md transition ${
              personality === 'E'
                ? 'bg-yellow-400 text-white shadow-yellow-200'
                : 'bg-white text-gray-700 hover:shadow-lg'
            }`}
          >
            <div className="text-5xl mb-3">🌟</div>
            <div>Extrovert (E)</div>
            <p className="text-sm font-normal mt-2 opacity-75">
              I enjoy talking and sharing ideas
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPersonality('I')}
            className={`px-10 py-8 rounded-2xl text-xl font-bold shadow-md transition ${
              personality === 'I'
                ? 'bg-blue-500 text-white shadow-blue-200'
                : 'bg-white text-gray-700 hover:shadow-lg'
            }`}
          >
            <div className="text-5xl mb-3">🌙</div>
            <div>Introvert (I)</div>
            <p className="text-sm font-normal mt-2 opacity-75">
              I prefer to think before speaking
            </p>
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: personality ? 1.03 : 1 }}
          whileTap={{ scale: personality ? 0.97 : 1 }}
          onClick={handleSelect}
          disabled={!personality || loading}
          className="px-12 py-4 bg-green-600 text-white font-bold text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition shadow-lg"
        >
          {loading ? 'Saving...' : 'Confirm & Continue →'}
        </motion.button>
      </motion.div>
    </div>
  );
}

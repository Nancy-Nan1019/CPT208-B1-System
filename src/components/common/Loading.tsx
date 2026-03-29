'use client';

import { motion } from 'framer-motion';

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
      />
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import { useStore } from '@/store/useStore';
import { LogOut, BookOpen } from 'lucide-react';

export default function Header() {
  const { user, setUser } = useStore();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    setUser(null);
    router.push('/login');
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href={user?.role === 'teacher' ? '/teacher' : '/session'} className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-gray-800 text-lg">XJTLU Discussion</span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              <span className="font-medium">{user.name}</span>
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs capitalize">
                {user.role}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

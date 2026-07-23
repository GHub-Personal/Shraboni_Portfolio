"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../src/lib/supabase';
import { LayoutDashboard, User, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !session) {
      router.push('/admin/login');
    }
  }, [loading, session, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-700 border-t-zinc-300 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via the useEffect
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-xl font-bold tracking-tight">Admin Portal</h2>
        </div>
        
        <nav className="space-y-2 flex-1">
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              pathname === '/admin/dashboard'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Designs</span>
          </Link>
          <Link
            href="/admin/dashboard/profile"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              pathname === '/admin/dashboard/profile'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Profile</span>
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

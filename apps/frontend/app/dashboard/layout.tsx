'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Activity, LayoutDashboard, Settings, Bell, Search, Sparkles, Menu, X, LogOut, User as UserIcon } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/signin');
    } else {
      setLoading(false);
      fetch('http://localhost:8080/user/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => data && setUser(data))
      .catch(() => {});
    }
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    router.push('/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#6B8E7B]/20 border-t-[#6B8E7B] rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Incidents', href: '/dashboard/incidents', icon: Bell, isPlaceholder: false },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, isPlaceholder: false },
  ];

  return (
    <div className="h-screen w-full bg-[#09090b] text-white font-sans flex overflow-hidden">

      {}
      <aside className="hidden md:flex flex-col justify-between w-20 py-8 px-4 my-6 ml-6 bg-[#121214] rounded-[32px] shadow-2xl shadow-black/50 h-[calc(100vh-48px)] z-20 shrink-0">
        <div className="flex flex-col items-center gap-4
        ">
          {}
          <Link href="/" className="w-12 h-12 rounded-full bg-[#18181b] flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform">
            <Activity className="w-6 h-6" />
          </Link>

          {}
          <nav className="flex flex-col items-center gap-2 w-full">
            {navItems.map((item) => {
              const isActive = pathname === item.href && !item.isPlaceholder;
              const Icon = item.icon;

              if (item.isPlaceholder) {
                return (
                  <button key={item.name} className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#27272a] transition-colors">
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </button>
                );
              }

              return (
                <Link key={item.name} href={item.href} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-[#18181b] text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-[#27272a]'}`}>
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </Link>
              );
            })}
          </nav>
        </div>

        {}
        <div className="flex flex-col items-center gap-5 mb-2">
          {user && (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-400 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20 text-sm ring-2 ring-[#121214] transition-transform hover:scale-105 cursor-default">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="w-8 h-px bg-white/10 rounded-full" />
          <button onClick={handleSignOut} className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300" title="Sign Out">
            <LogOut className="w-5 h-5 ml-1" />
          </button>
        </div>
      </aside>

      {}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {}
        {}
        <div className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-hide">
          {children}
        </div>
      </main>
    </div>
  );
}

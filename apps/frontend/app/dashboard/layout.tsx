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
    { name: 'Incidents', href: '#incidents', icon: Bell, isPlaceholder: true },
    { name: 'Settings', href: '#settings', icon: Settings, isPlaceholder: true },
  ];

  return (
    <div className="h-screen w-full bg-[#09090b] text-white font-sans flex overflow-hidden">
      
      {/* Floating Pill Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col justify-between w-20 py-8 px-4 my-6 ml-6 bg-[#121214] rounded-[32px] shadow-2xl shadow-black/50 h-[calc(100vh-48px)] z-20 shrink-0">
        <div className="flex flex-col items-center gap-10">
          {/* Logo */}
          <Link href="/" className="w-12 h-12 rounded-full bg-[#18181b] flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform">
            <Activity className="w-6 h-6" />
          </Link>
          
          {/* Nav Icons */}
          <nav className="flex flex-col items-center gap-6 w-full">
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

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-4">
          <button onClick={handleSignOut} className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
          {user && (
            <div className="w-12 h-12 rounded-full bg-[#10b981] text-white flex items-center justify-center font-bold shadow-md">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Topbar */}
        <header className="flex-shrink-0 h-24 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-white">
              Hello, {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'Admin'}!
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">Explore information and activity about your property</p>
          </div>

          <div className="flex items-center gap-4 hidden md:flex">
            {/* Search Bar */}
            <div className="flex items-center bg-[#121214] rounded-full pl-5 pr-2 py-2 shadow-sm border border-white/5">
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm w-48 text-white placeholder:text-zinc-400"
              />
              <button className="w-8 h-8 rounded-full bg-[#18181b] text-white flex items-center justify-center">
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Notification Icons */}
            <button className="w-12 h-12 rounded-full bg-[#121214] shadow-sm border border-white/5 flex items-center justify-center text-white hover:bg-[#18181b] transition-colors relative">
              <Sparkles className="w-5 h-5" />
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-rose-500 border border-white" />
            </button>
            <button className="w-12 h-12 rounded-full bg-[#121214] shadow-sm border border-white/5 flex items-center justify-center text-white hover:bg-[#18181b] transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-hide">
          {children}
        </div>
      </main>
    </div>
  );
}

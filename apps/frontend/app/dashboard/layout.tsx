'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Activity, LayoutDashboard, Settings, Bell, Globe, Sparkles, Menu, X, LogOut, User as UserIcon } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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

  // Close mobile navigation on route transition
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const triggerToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    router.push('/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Incidents', href: '#incidents', icon: Bell, isPlaceholder: true },
    { name: 'Settings', href: '#settings', icon: Settings, isPlaceholder: true },
  ];

  return (
    <div className="h-screen overflow-hidden bg-black text-white flex flex-col relative">
      {/* Background Noise & Effects */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black pointer-events-none" />

      {/* Top Header/Navbar */}
      <header className="relative z-30 h-16 flex-shrink-0 border-b border-white/10 bg-black/50 backdrop-blur-xl flex items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="h-8 w-8 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight text-lg">UPTIQ</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href && !item.isPlaceholder;
              const Icon = item.icon;
              
              if (item.isPlaceholder) {
                return (
                  <button
                    key={item.name}
                    onClick={() => triggerToast(`${item.name} center features are loading in the next alpha build.`)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-300 text-sm font-medium cursor-pointer animate-none"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 text-sm font-medium
                    ${isActive 
                      ? 'bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-violet-400' : ''}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* User profile (Desktop) */}
          {user && (
            <div className="hidden md:flex items-center gap-2 text-sm text-zinc-400 border-r border-white/10 pr-4 h-8">
              <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                <UserIcon className="w-3 h-3 text-violet-300" />
              </div>
              <span className="font-medium text-zinc-300">{user.username}</span>
            </div>
          )}

          {/* Sign Out (Desktop) */}
          <button
            onClick={handleSignOut}
            className="hidden md:flex items-center gap-2 text-zinc-400 hover:text-rose-400 transition-colors text-sm font-medium cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-lg border border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white md:hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Dropdown */}
      {isMobileOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 z-20 border-b border-white/10 bg-zinc-950/95 backdrop-blur-2xl flex flex-col p-4 space-y-3 animate-[slideDown_0.2s_ease-out]">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href && !item.isPlaceholder;
              const Icon = item.icon;
              
              if (item.isPlaceholder) {
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setIsMobileOpen(false);
                      triggerToast(`${item.name} center features are loading in the next alpha build.`);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-300 text-left text-sm font-medium w-full"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium
                    ${isActive 
                      ? 'bg-white/10 text-white' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : ''}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {user && (
            <div className="border-t border-white/10 pt-3 flex items-center justify-between px-3">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                  <UserIcon className="w-3 h-3 text-violet-300" />
                </div>
                <span className="font-medium text-zinc-300">{user.username}</span>
              </div>

              <button
                onClick={() => {
                  setIsMobileOpen(false);
                  handleSignOut();
                }}
                className="flex items-center gap-2 text-rose-400 hover:text-rose-300 transition-colors text-sm font-medium cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto min-w-0 flex flex-col">
        <div className="flex-1 p-6 md:p-8">
          {children}
        </div>
      </main>

      {/* Interactive Micro-interaction Toast Notice */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-950/85 border border-white/10 text-white shadow-2xl backdrop-blur-xl animate-[slideUp_0.3s_ease-out]">
          <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-zinc-200">{toast}</span>
        </div>
      )}
    </div>
  );
}

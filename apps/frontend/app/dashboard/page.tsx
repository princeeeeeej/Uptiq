'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, LayoutGrid, AlertCircle, Bell } from 'lucide-react';
import Link from 'next/link';
import WebsiteCard, { WebsiteData } from '@/components/dashboard/WebsiteCard';
import AddWebsiteModal from '@/components/dashboard/AddWebsiteModal';

export default function DashboardPage() {
  const [websites, setWebsites] = useState<WebsiteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:8080/user/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => data && setUser(data))
      .catch(() => {});
    }
  }, []);

  const fetchWebsites = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/websites', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to fetch websites');

      const data = await res.json();
      setWebsites(data.websites);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebsites();

    const interval = setInterval(fetchWebsites, 30000);
    return () => clearInterval(interval);
  }, [fetchWebsites]);

  return (
    <div className="w-full flex flex-col h-full">
      <div className="max-w-6xl w-full mx-auto animate-in fade-in duration-500 pb-8 flex flex-col h-full">
        <header className="flex-shrink-0 h-24 mb-6 mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Hello, {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'Admin'}!
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Explore information and activity about your property</p>
          </div>

          <div className="flex items-center gap-4 hidden md:flex">
            <Link href="/dashboard/incidents" className="w-12 h-12 rounded-full bg-[#121214] shadow-sm border border-white/5 flex items-center justify-center text-white hover:bg-[#18181b] hover:border-white/10 transition-colors">
              <Bell className="w-5 h-5 text-zinc-300" />
            </Link>
          </div>
        </header>
      
        <div className="space-y-8">
          {/* Top Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#121214] rounded-[24px] p-6 shadow-lg shadow-black/20 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-zinc-400 text-sm mb-1">Active Monitors</p>
            <h2 className="text-3xl font-bold text-white">{websites.length}</h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#18181b] flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-zinc-400" />
          </div>
        </div>

        <div className="bg-[#121214] rounded-[24px] p-6 shadow-lg shadow-black/20 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-zinc-400 text-sm mb-1">Global Regions</p>
            <h2 className="text-3xl font-bold text-white">2</h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#18181b] flex items-center justify-center">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-[#10b981] rounded-[24px] p-6 shadow-[0_8px_30px_-4px_rgba(107,142,123,0.3)] flex flex-col justify-between text-white">
          <p className="text-white/80 text-sm">System Status</p>
          <div className="flex items-center justify-between mt-1">
            <h2 className="text-3xl font-bold">100%</h2>
            <div className="px-3 py-1 bg-[#121214]/20 rounded-full text-xs font-medium">
              Operational
            </div>
          </div>
        </div>
      </div>

      {}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
          <button onClick={fetchWebsites} className="ml-auto underline text-sm hover:text-rose-400">Retry</button>
        </div>
      )}

      {}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-[#121214] rounded-[24px] border border-white/5 shadow-sm animate-pulse" />
          ))}
        </div>
      ) : websites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-4 border border-white/10 border-dashed rounded-[32px] bg-[#121214]/50">
          <div className="w-16 h-16 rounded-2xl bg-[#18181b] border border-white/5 flex items-center justify-center mb-6 shadow-sm">
            <LayoutGrid className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No monitors configured</h3>
          <p className="text-zinc-400 text-center max-w-md mb-8">
            You aren't monitoring any websites yet. Add your first monitor to start tracking uptime and performance.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 rounded-full bg-zinc-100 hover:bg-white text-zinc-950 font-semibold transition-colors shadow-md"
          >
            Add your first monitor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map(website => (
            <WebsiteCard key={website.id} website={website} />
          ))}

          {}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="group flex flex-col items-center justify-center h-full min-h-[220px] bg-[#121214] border border-white/10 border-dashed rounded-[24px] hover:border-[#6B8E7B] hover:bg-[#10b981]/5 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-[#18181b] border border-white/5 flex items-center justify-center mb-4 group-hover:bg-zinc-100 group-hover:text-zinc-950 group-hover:text-white transition-colors text-zinc-400">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-medium text-white group-hover:text-white transition-colors">Add New Monitor</span>
          </button>
        </div>
      )}

      {}
      <AddWebsiteModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => {
          setLoading(true);
          fetchWebsites();
        }} 
      />
      </div>
      </div>
    </div>
  );
}

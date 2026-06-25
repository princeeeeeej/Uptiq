'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, LayoutGrid, AlertCircle } from 'lucide-react';
import WebsiteCard, { WebsiteData } from '@/components/dashboard/WebsiteCard';
import AddWebsiteModal from '@/components/dashboard/AddWebsiteModal';

export default function DashboardPage() {
  const [websites, setWebsites] = useState<WebsiteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
    
    // Optional: Poll every 30 seconds for live updates
    const interval = setInterval(fetchWebsites, 30000);
    return () => clearInterval(interval);
  }, [fetchWebsites]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Monitors Overview</h1>
          <p className="text-zinc-400">Manage and track your infrastructure in real-time.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="group/btn relative flex items-center gap-2 px-5 py-2.5 bg-white text-black font-medium rounded-xl hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <span className="relative z-10">Add Monitor</span>
          <Plus className="w-4 h-4 relative z-10 group-hover/btn:rotate-90 transition-transform" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-200 to-sky-200 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
          <button onClick={fetchWebsites} className="ml-auto underline text-sm hover:text-rose-300">Retry</button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-zinc-900/50 rounded-[24px] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : websites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-4 border border-white/10 border-dashed rounded-[32px] bg-zinc-900/20">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center mb-6">
            <LayoutGrid className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No monitors configured</h3>
          <p className="text-zinc-400 text-center max-w-md mb-8">
            You aren't monitoring any websites yet. Add your first monitor to start tracking uptime and performance.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors"
          >
            Add your first monitor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map(website => (
            <WebsiteCard key={website.id} website={website} />
          ))}
        </div>
      )}

      {/* Modal */}
      <AddWebsiteModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => {
          setLoading(true);
          fetchWebsites();
        }} 
      />
    </div>
  );
}

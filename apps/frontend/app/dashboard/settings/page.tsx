'use client';

import { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, ShieldAlert } from 'lucide-react';

interface AlertChannel {
  id: string;
  type: string;
  config: {
    to?: string;
  };
  isActive: boolean;
  createdAt: string;
}

export default function SettingsPage() {
  const [channels, setChannels] = useState<AlertChannel[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const fetchChannels = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:8080/alert-channels', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChannels(data.channels);
      }
    } catch (err) {
      console.error('Failed to fetch channels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setAdding(true);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:8080/alert-channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email: email.trim() })
      });

      if (res.ok) {
        setEmail('');
        await fetchChannels();
      }
    } catch (err) {
      console.error('Failed to add channel:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`http://localhost:8080/alert-channels/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setChannels(channels.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete channel:', err);
    }
  };

  return (
    <div className="max-w-6xl w-full mx-auto animate-in fade-in duration-500 pb-8 flex flex-col h-full">
      <header className="flex-shrink-0 h-24 mb-6 mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Settings</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage your account preferences and alert destinations.</p>
        </div>
      </header>

      <div className="max-w-4xl w-full mx-auto">
        <div className="bg-[#121214] border border-white/5 rounded-[24px] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Alert Channels</h3>
            <p className="text-sm text-zinc-400">Where should we notify you when an incident occurs?</p>
          </div>
        </div>

        <form onSubmit={handleAddEmail} className="flex items-center gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-zinc-500" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="team@example.com"
              className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl leading-5 bg-[#18181b] text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 sm:text-sm transition-all"
              required
            />
          </div>
          <button
            type="submit"
            disabled={adding || !email}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            {adding ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Email
          </button>
        </form>

        <div className="space-y-3">
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-16 bg-[#18181b] rounded-2xl w-full border border-white/5" />
              ))}
            </div>
          ) : channels.length === 0 ? (
            <div className="text-center py-8 bg-[#18181b] border border-white/5 rounded-2xl">
              <p className="text-sm text-zinc-400">No alert channels configured.</p>
            </div>
          ) : (
            channels.map((channel) => (
              <div 
                key={channel.id}
                className="flex items-center justify-between p-4 bg-[#18181b] border border-white/5 rounded-2xl hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center">
                    {channel.type === 'EMAIL' && <Mail className="w-4 h-4 text-zinc-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {channel.config.to}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Added {new Date(channel.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(channel.id)}
                  className="p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Remove channel"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

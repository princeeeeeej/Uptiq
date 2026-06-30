'use client';

import { useState } from 'react';
import { X, Globe, Link as LinkIcon, Type } from 'lucide-react';

interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddWebsiteModal({ isOpen, onClose, onSuccess }: AddWebsiteModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, url, slug }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to add website');
      }

      onSuccess();
      onClose();

      setName('');
      setUrl('');
      setSlug('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#09090b] " onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#121214] border border-white/5 rounded-3xl p-8 shadow-2xl overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#10b981]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-1">Add Monitor</h2>
            <p className="text-sm text-zinc-400">Track uptime and performance</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#27272a] text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Website Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Type className="h-4 w-4 text-zinc-400" />
              </div>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Production API" 
                required
                className="w-full bg-[#18181b] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#6B8E7B] focus:ring-1 focus:ring-[#6B8E7B] transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">URL</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Globe className="h-4 w-4 text-zinc-400" />
              </div>
              <input 
                type="url" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com" 
                required
                className="w-full bg-[#18181b] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#6B8E7B] focus:ring-1 focus:ring-[#6B8E7B] transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Unique Slug</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LinkIcon className="h-4 w-4 text-zinc-400" />
              </div>
              <input 
                type="text" 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="prod-api" 
                required
                className="w-full bg-[#18181b] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#6B8E7B] focus:ring-1 focus:ring-[#6B8E7B] transition-all text-sm font-mono"
              />
            </div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-1">Used for unique identification</p>
          </div>

          {/* Global Coverage Info */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#10b981]/10 border border-[#6B8E7B]/20">
            <div className="p-1.5 rounded-lg bg-[#10b981]/20 text-[#10b981] mt-0.5">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#10b981]">Global Coverage Enabled</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                This monitor will automatically be checked simultaneously from our <span className="font-semibold text-white">USA (N. Virginia)</span> and <span className="font-semibold text-white">India (Mumbai)</span> datacenters to prevent false alarms.
              </p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-[#27272a] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-zinc-100 text-zinc-950 hover:bg-white transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Monitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

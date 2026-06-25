'use client';

import { Activity, ArrowUpRight, Clock, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export interface WebsiteData {
  id: string;
  name: string;
  url: string;
  slug: string;
  isActive: boolean;
  status: {
    currentStatus: 'UP' | 'DOWN' | 'UNKNOWN' | 'REGIONAL_ANOMALY';
    lastResponseTimeMs: number | null;
    lastCheckedAt: string | null;
  } | null;
}

export default function WebsiteCard({ website }: { website: WebsiteData }) {
  const currentStatus = website.status?.currentStatus || 'UNKNOWN';
  
  const statusColor = {
    UP: 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    DOWN: 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]',
    UNKNOWN: 'bg-zinc-500 shadow-[0_0_15px_rgba(113,113,122,0.5)]',
    REGIONAL_ANOMALY: 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
  }[currentStatus];

  const statusText = {
    UP: 'Operational',
    DOWN: 'Outage Detected',
    UNKNOWN: 'Pending Check',
    REGIONAL_ANOMALY: 'Degraded',
  }[currentStatus];

  const statusTextColor = {
    UP: 'text-emerald-400',
    DOWN: 'text-rose-400',
    UNKNOWN: 'text-zinc-400',
    REGIONAL_ANOMALY: 'text-amber-400',
  }[currentStatus];

  return (
    <Link href={`/dashboard/monitor/${website.id}`} className="group block relative">
      <div className="absolute -inset-0.5 bg-gradient-to-br from-white/5 to-white/0 rounded-[24px] blur opacity-0 group-hover:opacity-100 transition duration-500" />
      <div className="relative h-full p-6 bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[24px] flex flex-col justify-between hover:bg-zinc-900/60 transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h3 className="text-lg font-medium text-white mb-1 group-hover:text-violet-300 transition-colors">
              {website.name}
            </h3>
            <p className="text-sm text-zinc-500 flex items-center gap-1">
              {website.url}
              <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
            </p>
          </div>
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
            <div className={`w-2 h-2 rounded-full ${statusColor}`} />
            <span className={`text-xs font-semibold tracking-wider uppercase ${statusTextColor}`}>
              {statusText}
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Response</span>
            </div>
            <div className="text-xl font-medium text-white">
              {website.status?.lastResponseTimeMs ? `${website.status.lastResponseTimeMs}ms` : '--'}
            </div>
          </div>
          
          <div className="bg-black/30 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Checked</span>
            </div>
            <div className="text-sm font-medium text-zinc-300">
              {website.status?.lastCheckedAt 
                ? new Date(website.status.lastCheckedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Never'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

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
    UP: 'bg-[#10b981]',
    DOWN: 'bg-rose-500',
    UNKNOWN: 'bg-zinc-300',
    REGIONAL_ANOMALY: 'bg-amber-500',
  }[currentStatus];

  const statusText = {
    UP: 'Operational',
    DOWN: 'Outage Detected',
    UNKNOWN: 'Pending Check',
    REGIONAL_ANOMALY: 'Degraded',
  }[currentStatus];

  const statusTextColor = {
    UP: 'text-[#10b981]',
    DOWN: 'text-rose-500',
    UNKNOWN: 'text-zinc-400',
    REGIONAL_ANOMALY: 'text-amber-500',
  }[currentStatus];

  return (
    <Link href={`/dashboard/monitor/${website.id}`} className="group block h-full">
      <div className="h-full p-6 bg-[#121214] border border-white/5 rounded-[24px] flex flex-col justify-between hover:shadow-xl shadow-black/40 transition-all duration-300">

        {}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-white transition-colors">
              {website.name}
            </h3>
            <p className="text-sm text-zinc-400 flex items-center gap-1">
              {website.url}
              <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#18181b] px-3 py-1.5 rounded-full border border-white/5">
            <div className={`w-2 h-2 rounded-full ${statusColor}`} />
            <span className={`text-xs font-semibold tracking-wider uppercase ${statusTextColor}`}>
              {statusText}
            </span>
          </div>
        </div>

        {}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#18181b] rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Response</span>
            </div>
            <div className="text-xl font-bold text-white">
              {website.status?.lastResponseTimeMs ? `${website.status.lastResponseTimeMs}ms` : '--'}
            </div>
          </div>

          <div className="bg-[#18181b] rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Checked</span>
            </div>
            <div className="text-sm font-bold text-white">
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

'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Globe } from 'lucide-react';
import Link from 'next/link';

interface Incident {
  id: string;
  websiteId: string;
  startedAt: string;
  resolvedAt: string | null;
  reason: string | null;
  durationSeconds: number | null;
  website: {
    name: string;
    url: string;
  };
}

function formatDuration(seconds: number | null, startedAt: string, resolvedAt: string | null) {
  if (seconds !== null) {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }
  if (!resolvedAt) {
    const diff = Math.floor((new Date().getTime() - new Date(startedAt).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    return `${Math.floor(diff / 60)}m ${diff % 60}s`;
  }
  return 'Unknown';
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncidents = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:8080/incidents', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setIncidents(data.incidents);
        }
      } catch (err) {
        console.error('Failed to fetch incidents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
    // Poll every 30 seconds
    const interval = setInterval(fetchIncidents, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl w-full mx-auto animate-in fade-in duration-500 pb-8 flex flex-col h-full">
      <header className="flex-shrink-0 h-24 mb-6 mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Incidents</h1>
          <p className="text-sm text-zinc-400 mt-1">Review the downtime history across all your properties.</p>
        </div>
      </header>

      <div className="bg-[#121214] border border-white/5 rounded-[24px] p-6 shadow-sm overflow-hidden">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-[#18181b] rounded-2xl w-full border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[#18181b] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">All Systems Operational</h3>
            <p className="text-sm text-zinc-400">No incidents have been recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map((incident) => {
              const isResolved = !!incident.resolvedAt;
              return (
                <div 
                  key={incident.id} 
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#18181b] border border-white/5 rounded-2xl hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-0.5 w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner ${
                      isResolved 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {isResolved ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isResolved 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-rose-500/10 text-rose-400 animate-pulse'
                        }`}>
                          {isResolved ? 'RESOLVED' : 'ONGOING'}
                        </span>
                        <h3 className="text-base font-medium text-white">{incident.website.name}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[200px]">{incident.website.url}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {new Date(incident.startedAt).toLocaleString(undefined, { 
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 pl-14 md:pl-0">
                    <div className="text-left md:text-right">
                      <p className="text-xs text-zinc-500 mb-0.5">Downtime</p>
                      <p className="text-sm font-medium text-zinc-300">
                        {formatDuration(incident.durationSeconds, incident.startedAt, incident.resolvedAt)}
                      </p>
                    </div>
                    <Link 
                      href={`/dashboard/monitor/${incident.websiteId}`}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors border border-white/5"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { use, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Activity, 
  Clock, 
  ShieldCheck, 
  ShieldAlert,
  Trash2, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import gsap from 'gsap';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface WebsiteDetails {
  id: string;
  name: string;
  url: string;
  slug: string;
  currentStatus: 'UP' | 'DOWN' | 'UNKNOWN' | 'REGIONAL_ANOMALY';
  responseTime: number | null;
  consecutiveFails: number;
  lastCheckedAt: string | null;
  ssl: {
    issuer: string | null;
    validFrom: string | null;
    validUntil: string | null;
    daysRemaining: number | null;
  } | null;
}

interface Tick {
  id: string;
  websiteId: string;
  regionId: string;
  status: 'UP' | 'DOWN';
  responseTimeMs: number | null;
  statusCode: number | null;
  errorMessage: string | null;
  checkedAt: string;
}

interface Incident {
  id: string;
  websiteId: string;
  startedAt: string;
  resolvedAt: string | null;
  reason: string | null;
  durationSeconds: number | null;
}

export default function WebsiteMonitorPage({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = use(params);
  const router = useRouter();

  // State
  const [details, setDetails] = useState<WebsiteDetails | null>(null);
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Recharts Mounted State (prevents hydration warnings on server rendering)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Container refs for animations
  const pageContainerRef = useRef<HTMLDivElement>(null);

  const fetchAllData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/signin');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // 1. Details
      const resDetails = await fetch(`http://localhost:8080/website/${websiteId}`, { headers });
      if (!resDetails.ok) {
        if (resDetails.status === 404) throw new Error('Monitor not found');
        throw new Error('Failed to fetch monitor details');
      }
      const dataDetails = await resDetails.json();
      setDetails(dataDetails);

      // 2. Ticks
      const resTicks = await fetch(`http://localhost:8080/website/${websiteId}/ticks`, { headers });
      if (resTicks.ok) {
        const dataTicks = await resTicks.json();
        setTicks(dataTicks.ticks || []);
      }

      // 3. Incidents
      const resIncidents = await fetch(`http://localhost:8080/website/${websiteId}/incidents`, { headers });
      if (resIncidents.ok) {
        const dataIncidents = await resIncidents.json();
        setIncidents(dataIncidents.incidents || []);
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred while loading dashboard metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [websiteId, router]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => fetchAllData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Entrance Animations
  useEffect(() => {
    if (!loading && details) {
      gsap.fromTo(
        '.animate-panel',
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          stagger: 0.08, 
          ease: 'power2.out',
          clearProps: 'transform'
        }
      );
    }
  }, [loading, details]);

  // Delete Action
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/website/${websiteId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete monitor');
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Could not delete monitor');
      setIsDeleting(false);
    }
  };

  // Uptime Calculation
  const getUptimeStats = () => {
    if (ticks.length === 0) return { percent: 100, label: 'No check ticks' };
    const upTicks = ticks.filter(t => t.status === 'UP').length;
    const percent = (upTicks / ticks.length) * 100;
    return {
      percent: parseFloat(percent.toFixed(2)),
      label: `${upTicks}/${ticks.length} checks operational`
    };
  };

  // Response Time Averages
  const getResponseTimeStats = () => {
    const validTicks = ticks.filter(t => t.responseTimeMs !== null) as { responseTimeMs: number }[];
    if (validTicks.length === 0) return { avg: 0, min: 0, max: 0 };
    const sum = validTicks.reduce((acc, t) => acc + t.responseTimeMs, 0);
    const avg = Math.round(sum / validTicks.length);
    const times = validTicks.map(t => t.responseTimeMs);
    const min = Math.min(...times);
    const max = Math.max(...times);
    return { avg, min, max };
  };

  const uptime = getUptimeStats();
  const latencyStats = getResponseTimeStats();

  // Prepare chart data format for Recharts
  const chartData = ticks.map(t => ({
    name: new Date(t.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    time: t.checkedAt,
    latency: t.responseTimeMs ?? 0,
    status: t.status
  }));

  // Uptime Grid (Last 30 ticks)
  const last30Ticks = ticks.slice(-30);
  const emptyBlockCount = Math.max(0, 30 - last30Ticks.length);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse py-10">
        <div className="h-10 bg-zinc-900/50 w-48 rounded-xl border border-white/5" />
        <div className="h-28 bg-zinc-900/50 w-full rounded-3xl border border-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-zinc-900/50 rounded-2xl border border-white/5" />
          ))}
        </div>
        <div className="h-64 bg-zinc-900/50 w-full rounded-3xl border border-white/5" />
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Failed to load monitor details</h3>
        <p className="text-zinc-400 mb-8">{error || 'Monitor could not be loaded.'}</p>
        <Link 
          href="/dashboard" 
          className="px-5 py-2.5 bg-white text-black font-semibold rounded-xl hover:scale-[1.02] transition-transform inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const statusColorMap = {
    UP: 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]',
    DOWN: 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)]',
    UNKNOWN: 'bg-zinc-500 shadow-[0_0_20px_rgba(113,113,122,0.6)]',
    REGIONAL_ANOMALY: 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.6)]',
  }[details.currentStatus];

  const statusTextMap = {
    UP: 'Operational',
    DOWN: 'Outage Detected',
    UNKNOWN: 'Pending Health Check',
    REGIONAL_ANOMALY: 'Degraded Performance',
  }[details.currentStatus];

  const statusTextColorMap = {
    UP: 'text-emerald-400',
    DOWN: 'text-rose-400',
    UNKNOWN: 'text-zinc-400',
    REGIONAL_ANOMALY: 'text-amber-400',
  }[details.currentStatus];

  return (
    <div ref={pageContainerRef} className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-panel">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="group flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900/40 backdrop-blur-md border border-white/5 text-zinc-400 hover:text-white hover:border-white/20 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-white">{details.name}</h1>
              <a 
                href={details.url} 
                target="_blank" 
                rel="noreferrer"
                className="text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1 text-sm font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-zinc-500 text-sm tracking-wide mt-0.5">{details.url}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAllData(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-zinc-900/40 backdrop-blur-md border border-white/5 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium rounded-xl hover:bg-rose-500/20 hover:border-rose-500/30 transition-all duration-300"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Monitor</span>
          </button>
        </div>
      </div>

      {/* Main Status Hero Banner */}
      <div className="relative overflow-hidden bg-zinc-900/35 border border-white/10 rounded-[28px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-xl animate-panel">
        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent pointer-events-none" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="h-16 w-16 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center shadow-inner">
            <div className={`w-4 h-4 rounded-full ${statusColorMap} animate-pulse`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-semibold uppercase tracking-wider ${statusTextColorMap}`}>
                {statusTextMap}
              </span>
            </div>
            <p className="text-zinc-400 text-sm mt-1">
              {details.lastCheckedAt 
                ? `Last check completed: ${new Date(details.lastCheckedAt).toLocaleTimeString()} (${new Date(details.lastCheckedAt).toLocaleDateString()})`
                : 'Initial health check is pending.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 relative z-10">
          {details.ssl ? (
            <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-black/30 border border-white/5`}>
              {details.ssl.daysRemaining && details.ssl.daysRemaining > 15 ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              )}
              <div>
                <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">SSL Security</div>
                <div className="text-sm font-semibold text-white">
                  {details.ssl.daysRemaining ? `${details.ssl.daysRemaining} Days Left` : 'Active'}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-black/30 border border-white/5 text-zinc-400">
              <ShieldAlert className="w-5 h-5 text-zinc-500" />
              <div>
                <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">SSL Status</div>
                <div className="text-sm font-semibold">Not SSL Monitored</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-black/30 border border-white/5">
            <Clock className="w-5 h-5 text-violet-400" />
            <div>
              <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Monitoring Period</div>
              <div className="text-sm font-semibold text-white">Every 3 minutes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stat: Uptime */}
        <div className="p-6 bg-zinc-900/35 border border-white/10 rounded-2xl flex flex-col justify-between backdrop-blur-xl animate-panel">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider">Uptime (Recent)</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-3xl font-semibold text-white mb-1">
              {uptime.percent}%
            </div>
            <p className="text-xs text-zinc-500 truncate">{uptime.label}</p>
          </div>
        </div>

        {/* Stat: Avg Latency */}
        <div className="p-6 bg-zinc-900/35 border border-white/10 rounded-2xl flex flex-col justify-between backdrop-blur-xl animate-panel">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Latency</span>
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <div className="text-3xl font-semibold text-white mb-1">
              {latencyStats.avg ? `${latencyStats.avg}ms` : '--'}
            </div>
            <p className="text-xs text-zinc-500">
              Min: {latencyStats.min}ms / Max: {latencyStats.max}ms
            </p>
          </div>
        </div>

        {/* Stat: SSL Cert Issuer */}
        <div className="p-6 bg-zinc-900/35 border border-white/10 rounded-2xl flex flex-col justify-between backdrop-blur-xl animate-panel">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider">SSL Certificate</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="text-xl font-semibold text-white mb-1 truncate">
              {details.ssl?.issuer || 'No Certificate'}
            </div>
            <p className="text-xs text-zinc-500 truncate">
              {details.ssl?.validUntil 
                ? `Expires ${new Date(details.ssl.validUntil).toLocaleDateString()}` 
                : 'Check secure protocols.'}
            </p>
          </div>
        </div>

        {/* Stat: Outages / Incident Count */}
        <div className="p-6 bg-zinc-900/35 border border-white/10 rounded-2xl flex flex-col justify-between backdrop-blur-xl animate-panel">
          <div className="flex items-center justify-between text-zinc-400 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Incidents</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="text-3xl font-semibold text-white mb-1">
              {incidents.length}
            </div>
            <p className="text-xs text-zinc-500">
              {incidents.filter(i => !i.resolvedAt).length > 0 
                ? 'Active outages currently detected' 
                : 'All past incidents resolved'}
            </p>
          </div>
        </div>

      </div>

      {/* SVG Response Time Chart */}
      <div className="p-6 bg-zinc-900/35 border border-white/10 rounded-3xl backdrop-blur-xl animate-panel space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-white mb-0.5">Response Time History</h2>
            <p className="text-zinc-500 text-xs">Performance patterns and latency checks over the last 50 queries.</p>
          </div>
          
          {ticks.length > 0 && (
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                <span>Latency</span>
              </div>
            </div>
          )}
        </div>

        {ticks.length === 0 ? (
          <div className="h-48 border border-white/5 border-dashed rounded-2xl bg-black/10 flex items-center justify-center text-zinc-500 text-sm">
            Insufficient telemetry data to display graph.
          </div>
        ) : (
          <div className="h-[180px] w-full relative">
            {!isMounted ? (
              <div className="h-full w-full bg-zinc-900/10 border border-white/5 border-dashed rounded-2xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="chartGradientRecharts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.25)" 
                    fontSize={9} 
                    fontFamily="monospace"
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.25)" 
                    fontSize={9} 
                    fontFamily="monospace"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}ms`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-3.5 rounded-2xl bg-zinc-950/95 border border-white/10 text-white shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col gap-1 text-[11px] min-w-[125px]">
                            <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-1 mb-1 font-mono">
                              <span className="text-zinc-400">Response</span>
                              <span className="font-semibold text-violet-400">{data.latency}ms</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-zinc-500 font-mono text-[10px]">
                              <span>Status</span>
                              <span className={`font-semibold uppercase tracking-wider ${data.status === 'UP' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {data.status}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5 whitespace-nowrap">
                              {new Date(data.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ stroke: 'rgba(139, 92, 246, 0.4)', strokeWidth: 1.5 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="latency"
                    stroke="rgb(139, 92, 246)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#chartGradientRecharts)"
                    activeDot={{ 
                      r: 5, 
                      fill: '#ffffff', 
                      stroke: 'rgb(139, 92, 246)', 
                      strokeWidth: 2,
                      className: "shadow-2xl" 
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {/* Uptime Bar & Incident Log Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Uptime Bar Panel */}
        <div className="lg:col-span-2 p-6 bg-zinc-900/35 border border-white/10 rounded-3xl backdrop-blur-xl animate-panel flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-0.5">Uptime Status Grid</h2>
            <p className="text-zinc-500 text-xs">Chronological timeline mapping the operational stability of your service.</p>
          </div>

          <div className="flex flex-col gap-3">
            {/* The actual horizontal bars */}
            <div className="flex items-center gap-[4px] w-full justify-between p-4 bg-black/35 rounded-2xl border border-white/5 min-h-[64px]">
              {/* Padding for early periods */}
              {Array.from({ length: emptyBlockCount }).map((_, i) => (
                <div 
                  key={`empty-${i}`} 
                  className="flex-1 h-8 bg-zinc-800/10 rounded-full border border-white/[0.02]"
                  title="No telemetry recorded"
                />
              ))}

              {/* Actual Ticks */}
              {last30Ticks.map((tick, index) => {
                const color = tick.status === 'UP' 
                  ? 'bg-emerald-500/80 hover:bg-emerald-400' 
                  : 'bg-rose-500/80 hover:bg-rose-400';
                const statusLabel = tick.status === 'UP' ? 'Operational' : 'Outage Detected';
                
                return (
                  <div
                    key={tick.id}
                    className={`flex-1 h-8 ${color} rounded-full transition-all duration-200 cursor-help relative group/bar`}
                  >
                    {/* Tooltip on bar hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/bar:flex flex-col items-center bg-zinc-950 border border-white/10 p-2 rounded-lg text-[10px] text-white whitespace-nowrap shadow-xl z-20">
                      <span className="font-semibold text-zinc-300">{statusLabel}</span>
                      <span className="text-zinc-500">
                        {tick.responseTimeMs ? `${tick.responseTimeMs}ms` : 'No response'}
                      </span>
                      <span className="text-[8px] text-zinc-600">
                        {new Date(tick.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
              <span>30 checks ago</span>
              <span>100% operational target</span>
              <span>Latest check</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex flex-wrap gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>UP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>DOWN</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-white/5" />
              <span>UNKNOWN</span>
            </div>
          </div>
        </div>

        {/* Right: Incidents Log */}
        <div className="p-6 bg-zinc-900/35 border border-white/10 rounded-3xl backdrop-blur-xl animate-panel flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-0.5">Incident Logs</h2>
            <p className="text-zinc-500 text-xs">Recent service outages and resolution timelines.</p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[160px] space-y-3 custom-scrollbar pr-1">
            {incidents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mb-2" />
                <span className="text-xs text-zinc-400 font-medium">All Systems Operational</span>
                <span className="text-[10px] text-zinc-500 mt-0.5">No outages detected recently.</span>
              </div>
            ) : (
              incidents.map((incident) => {
                const isActive = !incident.resolvedAt;
                return (
                  <div 
                    key={incident.id}
                    className={`p-3 rounded-xl border flex gap-3 ${
                      isActive 
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                        : 'bg-black/25 border-white/5 text-zinc-300'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isActive ? (
                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-zinc-600" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 text-xs space-y-1">
                      <div className="flex items-center justify-between gap-2 font-medium">
                        <span className="truncate">{isActive ? 'Ongoing Outage' : 'Outage Resolved'}</span>
                        <span className="text-[10px] text-zinc-500 font-normal">
                          {isActive 
                            ? 'Started' 
                            : incident.durationSeconds 
                              ? `${Math.ceil(incident.durationSeconds / 60)}m duration`
                              : 'Resolved'}
                        </span>
                      </div>
                      
                      <p className={`text-[11px] truncate ${isActive ? 'text-rose-300' : 'text-zinc-500'}`}>
                        {incident.reason || 'Service became unresponsive.'}
                      </p>
                      
                      <div className="text-[9px] text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>{new Date(incident.startedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Glassmorphic Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md p-6 bg-zinc-950/80 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Monitor</h3>
                <p className="text-zinc-400 text-sm mt-1">
                  Are you sure you want to delete <span className="font-semibold text-zinc-200">{details.name}</span>? This will permanently erase all monitoring histories, ticks, and incident logs.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-white/5 hover:border-white/10 text-zinc-300 text-sm font-medium transition-colors disabled:opacity-55"
              >
                Cancel
              </button>
              
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-55"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

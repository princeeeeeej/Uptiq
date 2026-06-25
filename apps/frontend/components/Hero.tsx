'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight, Check, ChevronRight, Activity, Server, Network, Terminal, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import MeshGradient from '../ui/MeshGradient';
import FloatCard from '../ui/FloatCard';
import Magnetic from '@/ui/Magnetic';
import TextRevealer from '@/ui/TextRevealer';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Entry transitions
      gsap.fromTo(
        el.querySelector('.hero-badge'),
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );

      gsap.fromTo(
        el.querySelector('.hero-sub'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power2.out' }
      );

      gsap.fromTo(
        el.querySelector('.hero-ctas'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power2.out' }
      );

      gsap.fromTo(
        el.querySelector('.hero-mockup-container'),
        { opacity: 0, y: 40, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 1, delay: 0.4, ease: 'power3.out' }
      );

      // Scrub parallax scroll interactions
      const mockup = el.querySelector('.hero-mockup');
      const mockContainer = el.querySelector('.hero-mockup-container');
      if (mockup && mockContainer) {
        gsap.to(mockup, {
          y: 150,
          scale: 0.85,
          opacity: 0.2,
          rotateX: 10,
          scrollTrigger: {
            trigger: mockContainer,
            start: 'top 40%',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      const heroBg = el.querySelector('.hero-bg');
      if (heroBg) {
        gsap.to(heroBg, {
          y: 300,
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="
      relative
      min-h-screen
      flex
      items-center
      justify-center
      overflow-hidden
      px-6
      pt-24
      pb-20
      "
    >
      {/* Sci-Fi Performance Gradient Background */}
      <div className="hero-bg absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#09090b]" />

        {/* Huge Ambient Performance Glow */}
        <div
          className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 w-[2400px] h-[600px] rounded-[100%] blur-[160px] opacity-50 mix-blend-screen"
          style={{
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.5) 0%, rgba(56,189,248,0.2) 50%, transparent 70%)',
          }}
        />
        
        {/* Bright Electric Inner Glow */}
        <div
          className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 w-[1600px] h-[300px] rounded-[100%] blur-[100px] opacity-80 mix-blend-screen"
          style={{
            background: 'radial-gradient(ellipse, rgba(168,85,247,0.7) 0%, rgba(99,102,241,0.5) 40%, transparent 80%)',
          }}
        />

        {/* Ultra-Wide High-Speed Energy Streak */}
        <div
          className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 w-[2000px] h-[40px] rounded-[100%] blur-[20px] opacity-100 mix-blend-screen"
          style={{
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.9) 0%, rgba(139,92,246,0.8) 30%, rgba(56,189,248,0.4) 60%, transparent 80%)',
          }}
        />
        
        {/* Core Intensity Laser Line */}
        <div
          className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[10px] rounded-[100%] blur-[4px] opacity-100 mix-blend-screen"
          style={{
            background: 'radial-gradient(ellipse, #ffffff 0%, #a78bfa 40%, transparent 80%)',
          }}
        />

        {/* Pure Brilliant Core */}
        <div
          className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[120px] rounded-[100%] blur-[40px] opacity-100 mix-blend-screen"
          style={{
            background: 'radial-gradient(ellipse, rgba(255,255,255,1) 0%, rgba(216,180,254,1) 20%, rgba(139,92,246,0.8) 50%, transparent 80%)',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[1280px] mx-auto">
        {/* Badge */}
        <div
          className="
          hero-badge
          mx-auto
          mb-8
          w-fit
          flex
          items-center
          gap-2
          rounded-full
          border
          border-white/10
          bg-white/[0.03]
          px-4
          py-2
          text-xs
          uppercase
          tracking-[0.2em]
          "
        >
          <span className="h-2 w-2 rounded-full bg-zinc-300" />
          Operational Excellence
          <ChevronRight className="w-3 h-3 opacity-50" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-[900px] h-[900px]">
            {[3, 4].map((i) => (
              <div
                key={i}
                className="absolute rounded-full border border-white/5"
                style={{
                  inset: `${i * 60}px`,
                  borderStyle: i % 2 === 0 ? 'dashed' : 'solid',
                  animation: `spin ${i * 45}s linear infinite${i % 2 === 0 ? '' : ' reverse'}`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Heading */}
        <h1
          className="
          hero-h1
          text-center
          font-semibold
          tracking-[-0.08em]
          leading-none
          "
        >
          <span className="line block text-[4rem] md:text-[7rem] h-[1.1em] overflow-hidden">
            <TextRevealer text="Precision Monitoring" type="words" triggerOnScroll={false} delay={0.15} />
          </span>

          <span
            className="
            line
            block
            text-[4rem]
            md:text-[7rem]
            text-zinc-500
            h-[1.1em]
            overflow-hidden
            "
          >
            <TextRevealer text="For Production Systems" type="words" triggerOnScroll={false} delay={0.35} />
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="
          hero-sub
          max-w-2xl
          mx-auto
          text-center
          mt-8
          text-lg
          text-zinc-500
          "
        >
          Know before your users do. Multi-region uptime monitoring engineered
          for modern infrastructure teams.
        </p>

        {/* Buttons */}
        <div
          className="
          hero-ctas
          flex
          justify-center
          gap-4
          mt-10
          "
        >
          <Magnetic range={50} strength={0.25}>
            <Link
              href="/signup"
              className="
              flex
              items-center
              gap-2
              px-5
              py-3
              sm:px-8
              sm:py-4
              rounded-xl
              sm:rounded-2xl
              bg-white
              text-black
              font-medium
              cursor-pointer
              text-sm
              sm:text-base
              "
            >
              Start Monitoring
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Magnetic>

          <Magnetic range={50} strength={0.3}>
            <button
              className="
              px-5
              py-3
              sm:px-8
              sm:py-4
              rounded-xl
              sm:rounded-2xl
              border
              border-white/10
              bg-white/[0.03]
              cursor-pointer
              text-sm
              sm:text-base
              "
            >
              View Architecture
            </button>
          </Magnetic>
        </div>

        {/* Dashboard Mockup Container */}
        <div className="hero-mockup-container mt-20 max-w-5xl mx-auto perspective-[2000px]">
          <div
            className="
            hero-mockup
            rounded-[24px]
            overflow-hidden
            border
            border-white/10
            bg-zinc-950/60
            backdrop-blur-2xl
            shadow-[0_0_80px_rgba(139,92,246,0.15)]
            flex
            flex-col
            "
          >
            {/* Mockup Header/Top Navbar */}
            <div className="h-14 border-b border-white/5 bg-white/[0.01] px-4 md:px-6 flex items-center justify-between select-none">
              <div className="flex items-center gap-6">
                {/* Logo */}
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center">
                    <Activity className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-semibold tracking-tight text-sm text-white">UPTIQ</span>
                </div>
                {/* Navigation */}
                <div className="flex items-center gap-1">
                  {[
                    { name: 'Overview', active: true },
                    { name: 'Incidents', active: false },
                    { name: 'Settings', active: false },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        item.active
                          ? 'bg-white/10 text-white'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>
              {/* User Actions */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-violet-300">DU</span>
                  </div>
                  <span className="hidden sm:inline">demo_user</span>
                </div>
                <div className="text-zinc-500 hover:text-rose-400 text-xs font-medium transition-colors">Sign Out</div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 md:p-8 flex flex-col gap-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">Global Traffic</h3>
                  <div className="text-sm text-zinc-400 mt-1">Real-time request latency and throughput</div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium tracking-wide uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,1)]" />
                  Healthy
                </div>
              </div>

              {/* Chart Area */}
              <div className="h-48 rounded-2xl border border-white/5 bg-white/[0.02] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-violet-500/10 to-transparent" />
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path
                    d="M0,80 Q10,70 20,85 T40,60 T60,75 T80,30 T100,50 L100,100 L0,100 Z"
                    fill="url(#chart-gradient)"
                    opacity="0.2"
                  />
                  <path
                    d="M0,80 Q10,70 20,85 T40,60 T60,75 T80,30 T100,50"
                    fill="none"
                    stroke="url(#line-gradient)"
                    strokeWidth="2"
                    className="drop-shadow-[0_0_8px_rgba(167,139,250,0.8)]"
                    vectorEffect="non-scaling-stroke"
                  />
                  <defs>
                    <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="50%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Simulated Data Points */}
                <div className="absolute right-[20%] top-[30%] -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,1),0_0_30px_#c084fc] animate-pulse" />
              </div>

              {/* Bottom Metrics */}
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: 'Uptime (30d)', value: '99.99%', sub: '+0.02%', positive: true },
                  { label: 'Avg Latency', value: '42ms', sub: '-12ms', positive: true },
                  { label: 'Active Regions', value: '14 / 14', sub: 'All operational', positive: true },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors cursor-default">
                    <div className="text-xs text-zinc-500 font-mono tracking-wide uppercase">{stat.label}</div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-2xl font-semibold tracking-tight text-white">{stat.value}</span>
                      <span className={`text-xs ${stat.positive ? 'text-emerald-400' : 'text-rose-400'}`}>{stat.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

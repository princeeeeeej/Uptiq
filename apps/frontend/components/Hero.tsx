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
          <div className="hero-mockup relative rounded-[24px] border border-white/10 shadow-[0_0_80px_rgba(16,185,129,0.15)] overflow-hidden aspect-[4/3] md:aspect-[16/9] bg-[#09090b]">
            
            {/* Dashboard Mockup */}
            <div className="absolute inset-0 flex p-3 gap-4">
              {/* Floating Pill Sidebar */}
              <div className="hidden md:flex flex-col justify-between w-16 py-6 bg-[#121214] rounded-[24px] border border-white/5 shrink-0 h-full shadow-xl">
                <div className="flex flex-col items-center gap-8">
                  {/* Logo */}
                  <div className="w-10 h-10 rounded-full bg-[#18181b] flex items-center justify-center border border-white/5 shadow-md">
                    <Activity className="w-5 h-5 text-emerald-400" />
                  </div>
                  
                  {/* Navigation Icons */}
                  <div className="flex flex-col gap-4 w-full items-center">
                    <div className="w-10 h-10 rounded-full bg-[#18181b] flex items-center justify-center text-white shadow-md">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-[#27272a] transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-[#27272a] transition-colors">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:text-rose-500 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    D
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 px-4 py-6 md:p-6 flex flex-col gap-5 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-medium text-white">Hello, demo_user!</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-white/5 bg-[#121214] flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-white/5 bg-[#121214] flex items-center justify-center relative cursor-pointer hover:bg-white/5 transition-colors">
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                    </div>
                  </div>
                </div>

                {/* Top Metrics Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#121214] rounded-2xl p-4 border border-white/5 flex items-center justify-between group hover:-translate-y-1 hover:border-white/10 transition-all duration-300 shadow-lg">
                    <div>
                      <p className="text-zinc-500 text-xs mb-1">Active Monitors</p>
                      <h2 className="text-2xl font-bold text-white">4</h2>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-[#18181b] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500/50 group-hover:text-emerald-400 transition-colors"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                    </div>
                  </div>
                  
                  <div className="bg-[#121214] rounded-2xl p-4 border border-white/5 flex items-center justify-between group hover:-translate-y-1 hover:border-white/10 transition-all duration-300 shadow-lg">
                    <div>
                      <p className="text-zinc-500 text-xs mb-1">Global Regions</p>
                      <h2 className="text-2xl font-bold text-white">2</h2>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-[#18181b] flex items-center justify-center relative overflow-hidden group-hover:border-emerald-500/20 transition-colors">
                      <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex gap-1 relative z-10 group-hover:animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#10b981] rounded-2xl p-4 border border-[#10b981] flex items-center justify-between relative overflow-hidden group hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.15)] cursor-pointer">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <p className="text-emerald-950/80 text-xs font-medium mb-1 group-hover:text-emerald-950 transition-colors">System Status</p>
                      <h2 className="text-2xl font-bold text-white">100%</h2>
                    </div>
                    <div className="relative z-10 px-2 py-1 rounded-full bg-emerald-900/30 text-white text-[10px] font-medium backdrop-blur-sm border border-white/20 flex items-center gap-1.5 shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      Operational
                    </div>
                  </div>
                </div>

                {/* Monitors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Portfolio', url: 'https://portfolio.vercel.app', res: '93ms' },
                    { name: 'Github', url: 'https://github.com', res: '114ms' },
                    { name: 'Facebook', url: 'https://facebook.com', res: '843ms' },
                    { name: 'Google', url: 'https://google.com', res: '321ms' }
                  ].map((monitor) => (
                    <div key={monitor.name} className="bg-[#121214] border border-white/5 rounded-2xl p-4 hover:border-emerald-500/30 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:-translate-y-1 duration-300 group cursor-pointer relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                          <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">{monitor.name}</h3>
                          <p className="text-xs text-zinc-500 truncate max-w-[120px]">{monitor.url}</p>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-zinc-900/50 border border-white/5 text-[9px] font-medium text-emerald-400 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/5 transition-all">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_#10b981]" />
                          OPERATIONAL
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4 relative z-10">
                        <div className="bg-[#18181b] rounded-xl p-2 border border-white/5 group-hover:border-white/10 transition-colors">
                          <p className="text-[9px] text-zinc-500 mb-0.5 flex items-center gap-1"><Activity className="w-2.5 h-2.5 text-emerald-500/50 group-hover:text-emerald-400 transition-colors"/> RESPONSE</p>
                          <p className="text-sm font-semibold text-white">{monitor.res}</p>
                        </div>
                        <div className="bg-[#18181b] rounded-xl p-2 border border-white/5 group-hover:border-white/10 transition-colors">
                          <p className="text-[9px] text-zinc-500 mb-0.5 flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sky-500/50 group-hover:text-sky-400 transition-colors"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> CHECKED</p>
                          <p className="text-sm font-semibold text-white">Just now</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add New Card */}
                  <div className="flex flex-col items-center justify-center h-full min-h-[140px] bg-[#121214] border border-white/10 border-dashed rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer group">
                    <div className="w-8 h-8 rounded-full bg-[#18181b] border border-white/5 flex items-center justify-center mb-2 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 text-zinc-400 group-hover:scale-110 shadow-[0_0_15px_rgba(16,185,129,0)] group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    </div>
                    <span className="font-medium text-xs text-white group-hover:text-emerald-400 transition-colors">Add New Monitor</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

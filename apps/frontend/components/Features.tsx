'use client';

import { useEffect, useRef } from 'react';
import { Globe2, Shield, Activity, Bell, Server, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TextRevealer from '@/ui/TextRevealer';

gsap.registerPlugin(ScrollTrigger);

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {

      gsap.fromTo(
        el.querySelectorAll('.feat-card'),
        {
          opacity: 0,
          y: 60,
          rotateX: -15,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 75%',
          },
        }
      );

      const topline = el.querySelector('.features-top-line');
      if (topline) {
        gsap.to(topline, {
          scaleX: 1,
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'top 70%',
            scrub: true,
          },
        });
      }

      const counterEl = counterRef.current;
      if (counterEl) {
        ScrollTrigger.create({
          trigger: counterEl,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(
              { val: 0 },
              {
                val: 99.97,
                duration: 2,
                ease: 'power2.out',
                onUpdate() {
                  if (counterRef.current) {
                    counterRef.current.textContent = (this.targets()[0] as any).val.toFixed(2);
                  }
                },
              }
            );
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xc = rect.width / 2;
    const yc = rect.height / 2;

    const rotateX = -(y - yc) / 20;
    const rotateY = (x - xc) / 20;

    gsap.to(el, {
      rotateX: rotateX,
      rotateY: rotateY,
      scale: 1.015,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto',
    });

    const glow = el.querySelector('.glow-spotlight') as HTMLElement;
    if (glow) {
      gsap.to(glow, {
        left: x,
        top: y,
        opacity: 1,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    gsap.to(el, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.6,
      ease: 'power3.out',
      overwrite: 'auto',
    });

    const glow = el.querySelector('.glow-spotlight') as HTMLElement;
    if (glow) {
      gsap.to(glow, {
        opacity: 0,
        duration: 0.4,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    }
  };

  return (
    <section ref={sectionRef} className="py-32 px-6 relative overflow-hidden" id="features">
      {}
      <div className="w-full h-px bg-white/10 origin-left scale-x-0 absolute top-0 left-0 features-top-line z-10" />

      <div className="max-w-[1280px] mx-auto">
        <div className="feat-eyebrow text-xs uppercase tracking-[0.25em] text-zinc-500 mb-4">
          Features
        </div>

        <h2
          className="
          feat-title-h2
          text-5xl
          md:text-7xl
          font-semibold
          tracking-[-0.06em]
          max-w-4xl
          mb-20
          "
        >
          <TextRevealer text="Built for teams that can't afford downtime." type="words" triggerOnScroll={true} />
        </h2>

        <div className="grid md:grid-cols-3 gap-5 perspective-[2000px]">
          {}
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="
              feat-card
              md:col-span-3
              group
              relative
              overflow-hidden
              rounded-[40px]
              border
              border-white/10
              bg-zinc-950/80
              p-8
              md:p-12
              transition-all
              flex
              flex-col
              md:flex-row
              justify-between
              items-center
              min-h-[400px]
              cursor-default
            "
            style={{ transformStyle: 'preserve-3d' }}
          >
            {}
            <div className="glow-spotlight absolute pointer-events-none w-80 h-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.1),transparent_60%)] -translate-x-1/2 -translate-y-1/2 opacity-0 z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.06),transparent_70%)] pointer-events-none" />

            <div className="relative z-10 md:w-1/2 mb-10 md:mb-0 pointer-events-none">
              <div className="w-16 h-16 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(52,211,153,0.2)]">
                <Activity className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight">Real-time Everywhere.</h3>
              <p className="text-zinc-400 text-lg max-w-md">Millisecond-perfect precision across all global regions. We detect anomalies before your customers even notice.</p>
            </div>

            <div className="relative z-10 md:w-1/2 flex justify-center md:justify-end w-full" style={{ transform: 'translateZ(40px)', transformStyle: 'preserve-3d' }}>
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-xl group-hover:scale-105 group-hover:-rotate-2 transition-transform duration-700 shadow-2xl w-full max-w-sm">
                <div className="text-sm uppercase tracking-[0.2em] text-zinc-500 mb-4 font-mono group-hover:text-emerald-500 transition-colors duration-500">30 Day Uptime</div>
                <div className="text-7xl font-semibold tracking-tighter text-white group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all duration-500">
                  <span ref={counterRef} className="uptime-counter">0.00</span>%
                </div>
                <div className="mt-8 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 w-fit px-4 py-2 rounded-full group-hover:bg-emerald-500/20 transition-colors duration-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
                  <span className="text-sm font-medium text-emerald-400 tracking-wide uppercase">All systems operational</span>
                </div>
              </div>
            </div>
          </div>

          {}
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="
              feat-card
              md:col-span-3
              group
              relative
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-zinc-950/50
              p-8
              transition-all
              flex
              flex-col
              justify-between
              cursor-default
            "
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="glow-spotlight absolute pointer-events-none w-80 h-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_60%)] -translate-x-1/2 -translate-y-1/2 opacity-0 z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.03),transparent_70%)] pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="md:w-1/2 pointer-events-none">
                <h3 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
                  <span className="text-white">Global.</span> <span className="text-zinc-300">Distributed.</span> <span className="text-zinc-600">Fault-Tolerant.</span>
                </h3>
              </div>

              <div className="md:w-1/2 grid grid-cols-2 gap-4 w-full" style={{ transform: 'translateZ(30px)' }}>
                {[
                  { label: 'Latency', value: '12ms' },
                  { label: 'Regions', value: '3 Active' },
                  { label: 'Queue', value: 'Redis Streams' },
                  { label: 'Database', value: 'PostgreSQL' },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                    <div className="text-xs text-zinc-500 font-mono tracking-wider uppercase mb-1">{stat.label}</div>
                    <div className="text-lg font-medium text-white">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {}
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="
              feat-card
              md:col-span-2
              group
              relative
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-zinc-950/50
              p-8
              transition-all
              flex
              flex-col
              justify-between
              min-h-[360px]
              cursor-default
            "
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="glow-spotlight absolute pointer-events-none w-80 h-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1),transparent_60%)] -translate-x-1/2 -translate-y-1/2 opacity-0 z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.06),transparent_50%)] pointer-events-none" />

            {}
            <div 
              className="absolute top-8 right-8 w-64 h-40 border border-white/5 bg-white/[0.02] rounded-2xl p-4 flex flex-col gap-3 group-hover:scale-[1.08] group-hover:-translate-y-2 group-hover:-rotate-2 transition-transform duration-700 shadow-xl group-hover:shadow-[0_0_40px_rgba(139,92,246,0.2)]"
              style={{ transform: 'translateZ(35px)' }}
            >
              <div className="flex items-center gap-3 transform group-hover:translate-x-2 transition-transform duration-500 delay-75">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-[pulse_1s_infinite]" />
                <span className="text-xs text-zinc-400">us-east-1 verified</span>
              </div>
              <div className="flex items-center gap-3 transform group-hover:translate-x-2 transition-transform duration-500 delay-150">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-[pulse_1.5s_infinite]" />
                <span className="text-xs text-zinc-400">eu-central-1 verified</span>
              </div>
              <div className="flex items-center gap-3 transform group-hover:translate-x-2 transition-transform duration-500 delay-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-[pulse_2s_infinite]" />
                <span className="text-xs text-zinc-400">ap-south-1 verified</span>
              </div>
              <div className="mt-auto h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 w-full transform origin-left group-hover:scale-x-105 transition-transform duration-1000" />
              </div>
            </div>

            <div className="relative z-10 mt-auto pointer-events-none">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                <Globe2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Multi-region consensus</h3>
              <p className="text-zinc-400 max-w-sm">We verify downtime from multiple global regions before sending an alert, eliminating false positives.</p>
            </div>
          </div>

          {}
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="
              feat-card
              md:col-span-1
              group
              relative
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-zinc-950/50
              p-8
              transition-all
              flex
              flex-col
              justify-between
              min-h-[360px]
              cursor-default
            "
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="glow-spotlight absolute pointer-events-none w-80 h-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.1),transparent_60%)] -translate-x-1/2 -translate-y-1/2 opacity-0 z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.06),transparent_50%)] pointer-events-none" />

            <div className="relative z-10 w-full mb-10 flex justify-end" style={{ transform: 'translateZ(30px)' }}>
              <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 flex gap-3 items-start w-48 group-hover:scale-105 group-hover:-translate-x-2 transition-transform duration-500 shadow-lg">
                <div className="w-6 h-6 rounded bg-rose-500/20 flex items-center justify-center shrink-0">
                  <Bell className="w-3 h-3 text-rose-400" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-white mb-1">ALERT FIRED</div>
                  <div className="text-[10px] text-zinc-400">api.domain.com is down</div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pointer-events-none">
              <h3 className="text-xl font-semibold mb-3">Instant Webhooks</h3>
              <p className="text-zinc-400 text-sm">Get notified immediately via Slack, Discord, SMS, or custom webhooks.</p>
            </div>
          </div>

          {}
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="
              feat-card
              md:col-span-1
              group
              relative
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-zinc-950/50
              p-8
              transition-all
              flex
              flex-col
              justify-between
              min-h-[360px]
              cursor-default
            "
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="glow-spotlight absolute pointer-events-none w-80 h-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.1),transparent_60%)] -translate-x-1/2 -translate-y-1/2 opacity-0 z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.06),transparent_60%)] pointer-events-none" />

            <div className="relative z-10 w-full mb-10" style={{ transform: 'translateZ(35px)' }}>
              <div className="w-24 h-24 mx-auto rounded-full border-4 border-amber-500/30 border-t-amber-400 flex items-center justify-center relative group-hover:rotate-[360deg] transition-transform duration-[2000ms] ease-out shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <div className="absolute inset-0 rounded-full border border-white/5 m-2" />
                <span className="text-amber-400 font-mono text-sm group-hover:-rotate-[360deg] transition-transform duration-[2000ms] ease-out">14d</span>
              </div>
            </div>

            <div className="relative z-10 pointer-events-none">
              <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.05] flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">SSL Expiry Watcher</h3>
              <p className="text-zinc-400 text-sm">Track certificate expiration before it becomes a problem.</p>
            </div>
          </div>

          {}
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="
              feat-card
              md:col-span-2
              group
              relative
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-zinc-950/50
              p-8
              transition-all
              flex
              flex-col
              justify-between
              min-h-[360px]
              cursor-default
            "
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="glow-spotlight absolute pointer-events-none w-80 h-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.1),transparent_60%)] -translate-x-1/2 -translate-y-1/2 opacity-0 z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(52,211,153,0.06),transparent_50%)] pointer-events-none" />

            <div 
              className="absolute top-8 right-8 w-64 border border-white/5 bg-white/[0.02] rounded-2xl p-5 group-hover:scale-105 group-hover:-translate-x-2 group-hover:rotate-2 transition-transform duration-700 shadow-xl group-hover:shadow-[0_0_30px_rgba(52,211,153,0.15)]"
              style={{ transform: 'translateZ(30px)' }}
            >
              <div className="relative pl-4 border-l border-white/10 space-y-4">
                <div className="relative transform group-hover:translate-x-2 transition-transform duration-500 delay-100">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                  <div className="text-xs text-white">Outage Detected</div>
                  <div className="text-[10px] text-zinc-500">10:42 AM</div>
                </div>
                <div className="relative transform group-hover:translate-x-2 transition-transform duration-500 delay-200">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  <div className="text-xs text-white">Resolved</div>
                  <div className="text-[10px] text-zinc-500">11:05 AM</div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-auto pointer-events-none">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Incident Timeline</h3>
              <p className="text-zinc-400 max-w-sm">Full outage history with duration, resolution tracking, and root cause analysis tools.</p>
            </div>
          </div>

          {}
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="
              feat-card
              md:col-span-2
              group
              relative
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-zinc-950/50
              p-8
              transition-all
              flex
              flex-col
              justify-between
              min-h-[360px]
              cursor-default
            "
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="glow-spotlight absolute pointer-events-none w-80 h-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.1),transparent_60%)] -translate-x-1/2 -translate-y-1/2 opacity-0 z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(56,189,248,0.06),transparent_50%)] pointer-events-none" />

            <div className="absolute right-8 top-8 w-64 flex flex-col gap-2 group-hover:scale-105 group-hover:translate-x-2 transition-transform duration-500" style={{ transform: 'translateZ(30px)' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-3 ${i === 1 ? 'opacity-100' : i === 2 ? 'opacity-60' : 'opacity-30'}`}>
                  <Server className="w-4 h-4 text-sky-400" />
                  <div className="h-1.5 w-24 bg-white/20 rounded-full" />
                  <div className="ml-auto w-4 h-4 rounded-full border-2 border-sky-400/50 border-t-sky-400 animate-spin" />
                </div>
              ))}
            </div>

            <div className="relative z-10 mt-auto pointer-events-none">
              <div className="w-12 h-12 rounded-2xl border border-white/10 bg-white/[0.05] flex items-center justify-center mb-6">
                <Server className="w-6 h-6 text-sky-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Fault Tolerant Queues</h3>
              <p className="text-zinc-400 max-w-sm">Powered by Redis Streams, ensuring no monitoring jobs are ever lost even during worker crashes.</p>
            </div>
          </div>

          {}
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="
              feat-card
              md:col-span-1
              group
              relative
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-zinc-950/50
              p-8
              transition-all
              flex
              flex-col
              justify-between
              min-h-[360px]
              cursor-default
            "
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="glow-spotlight absolute pointer-events-none w-80 h-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_60%)] -translate-x-1/2 -translate-y-1/2 opacity-0 z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_60%)] pointer-events-none" />

            <div className="relative z-10 w-full mb-10 flex justify-center mt-4" style={{ transform: 'translateZ(35px)' }}>
              <div className="w-40 bg-zinc-900 border border-white/10 rounded-t-xl overflow-hidden shadow-2xl group-hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-shadow">
                <div className="h-4 bg-zinc-800 flex items-center px-2 gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <div className="p-3">
                  <div className="h-2 w-16 bg-white/20 rounded-full mb-3 group-hover:bg-white/40 transition-colors duration-500" />
                  <div className="flex gap-2 items-end h-8">
                    <div className="w-1 h-6 bg-emerald-500 rounded-sm group-hover:h-8 transition-all duration-300 delay-75" />
                    <div className="w-1 h-5 bg-emerald-500 rounded-sm group-hover:h-7 transition-all duration-300 delay-100" />
                    <div className="w-1 h-7 bg-emerald-500 rounded-sm group-hover:h-8 transition-all duration-300 delay-150" />
                    <div className="w-1 h-8 bg-emerald-500 rounded-sm" />
                    <div className="w-1 h-4 bg-amber-500 rounded-sm group-hover:h-5 transition-all duration-300 delay-200" />
                    <div className="w-1 h-6 bg-emerald-500 rounded-sm group-hover:h-8 transition-all duration-300 delay-300" />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pointer-events-none">
              <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.05] flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Public Status Page</h3>
              <p className="text-zinc-400 text-sm">Share uptime transparency with customers instantly.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

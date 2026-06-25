'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Magnetic from '@/ui/Magnetic';
import TextRevealer from '@/ui/TextRevealer';

export default function CTA() {
  return (
    <section className="relative py-32 px-6 mt-10">
      <div className="max-w-5xl mx-auto relative group">
        
        {/* Glow behind the glass */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/0 via-violet-500/10 to-sky-500/0 rounded-[40px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        {/* Glass Edge Container */}
        <div className="relative rounded-[40px] border border-white/5 bg-zinc-950/40 backdrop-blur-3xl overflow-hidden p-16 md:p-24 text-center">
          
          {/* Subtle Top Edge Highlight */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* Very faint background mesh/radial */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03),transparent_50%)]" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-zinc-400 text-xs font-mono tracking-widest uppercase mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Start Building
            </div>

            <h2
              className="
              text-5xl
              md:text-7xl
              font-semibold
              tracking-tight
              mb-6
              text-white
              "
            >
              <span className="block h-[1.15em] overflow-hidden">
                <TextRevealer text="Never miss" type="words" />
              </span>
              <span className="block h-[1.15em] overflow-hidden text-zinc-500">
                <TextRevealer text="another outage." type="words" delay={0.2} />
              </span>
            </h2>

            <p className="text-zinc-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Join thousands of engineering teams who sleep better at night. Start monitoring your infrastructure in less than 2 minutes.
            </p>

            <Magnetic range={60} strength={0.2}>
              <Link
                href="/signup"
                className="
                group/btn
                relative
                inline-flex
                items-center
                gap-3
                px-6
                py-3.5
                sm:px-10
                sm:py-5
                rounded-full
                bg-white
                text-black
                font-medium
                text-sm
                sm:text-base
                transition-all
                duration-500
                hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]
                cursor-pointer
                "
              >
                <span className="relative z-10">Start Monitoring Now</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </Magnetic>
            
            <div className="mt-8 text-xs font-mono tracking-wider text-zinc-600 uppercase">
              No credit card required · 14-day free trial
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

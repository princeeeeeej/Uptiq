'use client';

import { ArrowRight, Check, ChevronRight } from 'lucide-react';

import MeshGradient from '../ui/MeshGradient';
import FloatCard from '../ui/FloatCard';

export default function Hero() {
  return (
    <section
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
      {/* Reflect Style Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#09090b]" />

        <div
          className="
      absolute
      left-1/2
      top-[45%]
      -translate-x-1/2
      -translate-y-1/2
      w-[1200px]
      h-[1200px]
      rounded-full
      blur-3xl
      opacity-70
    "
          style={{
            background:
              'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(161,161,170,0.10) 25%, rgba(63,63,70,0.06) 50%, transparent 75%)',
          }}
        />

        <div
          className="
      absolute
      left-1/2
      top-[55%]
      -translate-x-1/2
      -translate-y-1/2
      w-[400px]
      h-[400px]
      rounded-full
      blur-[120px]
    "
          style={{
            background:
              'radial-gradient(circle, rgba(255,255,255,0.30), transparent 70%)',
          }}
        />

        <div
          className="
      absolute
      left-1/2
      bottom-[25%]
      -translate-x-1/2
      w-[1000px]
      h-[180px]
      blur-[90px]
    "
          style={{
            background:
              'radial-gradient(ellipse, rgba(255,255,255,0.18), transparent 70%)',
          }}
        />
      </div>

      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage:
            'radial-gradient(circle at center,black 30%,transparent 80%)',
        }}
      />

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
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute rounded-full border border-white/5"
                style={{
                  inset: `${i * 60}px`,
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
          <span className="line block text-[4rem] md:text-[7rem]">
            Precision Monitoring
          </span>

          <span
            className="
            line
            block
            text-[4rem]
            md:text-[7rem]
            text-zinc-500
            "
          >
            For Production Systems
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
          <button
            className="
            flex
            items-center
            gap-2
            px-8
            py-4
            rounded-2xl
            bg-white
            text-black
            font-medium
            "
          >
            Start Monitoring
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            className="
            px-8
            py-4
            rounded-2xl
            border
            border-white/10
            bg-white/[0.03]
            "
          >
            View Architecture
          </button>
        </div>

        {/* Dashboard Mockup */}
        <div
          className="
          hero-mockup
          mt-20
          max-w-5xl
          mx-auto
          rounded-[32px]
          overflow-hidden
          border
          border-white/10
          bg-zinc-950/80
          backdrop-blur-xl
          "
        >
          {/* Browser */}
          <div className="border-b border-white/5 px-5 py-4 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 p-6">
            {[
              {
                label: 'Websites',
                value: '24',
              },
              {
                label: 'Uptime',
                value: '99.97%',
              },
              {
                label: 'Latency',
                value: '91ms',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="
                rounded-2xl
                border
                border-white/10
                bg-white/[0.03]
                p-5
                "
              >
                <div className="text-xs text-zinc-500">{stat.label}</div>

                <div className="mt-2 text-3xl font-semibold">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Regions */}
          <div className="px-6 pb-6 space-y-3">
            {['India · Mumbai', 'USA · Virginia', 'EU · Frankfurt'].map(
              (region) => (
                <div
                  key={region}
                  className="
                flex
                justify-between
                items-center
                rounded-2xl
                border
                border-white/10
                bg-white/[0.02]
                px-5
                py-4
                "
                >
                  <div>
                    <div className="font-medium">api.yourdomain.dev</div>

                    <div className="text-xs text-zinc-500">{region}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400">91ms</span>

                    <span className="w-2 h-2 rounded-full bg-zinc-200 animate-pulse" />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

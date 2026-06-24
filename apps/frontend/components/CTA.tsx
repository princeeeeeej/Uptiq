'use client';

import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div
          className="
          rounded-[40px]
          border
          border-white/10
          bg-white/[0.03]
          backdrop-blur-xl
          p-16
          text-center
          relative
          overflow-hidden
          "
        >
          <div
            className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_70%)]
            "
          />

          <div className="relative z-10">
            <h2
              className="
              text-5xl
              md:text-6xl
              font-semibold
              tracking-[-0.06em]
              mb-6
              "
            >
              Never miss
              <br />
              another outage.
            </h2>

            <p className="text-zinc-500 text-lg mb-10">
              Start monitoring in minutes. No credit card required.
            </p>

            <button
              className="
              inline-flex
              items-center
              gap-2
              px-8
              py-4
              rounded-2xl
              bg-white
              text-black
              font-medium
              hover:bg-zinc-200
              transition
              "
            >
              Start Monitoring
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

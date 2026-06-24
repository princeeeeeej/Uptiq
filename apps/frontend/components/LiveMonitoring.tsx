'use client';

import RegionCard from '../ui/RegionCard';

interface Props {
  statusRef: React.RefObject<HTMLDivElement | null>;
  counterRef: React.RefObject<HTMLSpanElement | null>;
}

export default function LiveMonitoring({ statusRef, counterRef }: Props) {
  return (
    <section ref={statusRef} className="py-32 px-6">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16">
          <div>
            <div
              className="
              status-head
              text-xs
              uppercase
              tracking-[0.25em]
              text-zinc-500
              mb-4
              "
            >
              Live Monitoring
            </div>

            <h2
              className="
              status-head
              text-5xl
              md:text-7xl
              font-semibold
              tracking-[-0.06em]
              "
            >
              Real-time
              <br />
              Everywhere.
            </h2>
          </div>

          <div
            className="
            status-head
            rounded-3xl
            border
            border-white/10
            bg-white/[0.03]
            backdrop-blur-xl
            px-6
            py-5
            "
          >
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">
              30 Day Uptime
            </div>

            <div className="text-5xl font-semibold tracking-tight">
              <span ref={counterRef}>0.00</span>%
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-300 animate-pulse" />

              <span className="text-sm text-zinc-400">
                All systems operational
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <RegionCard flag="🇮🇳" name="Mumbai" code="ap-south-1" ms={94} />

          <RegionCard flag="🇺🇸" name="Virginia" code="us-east-1" ms={211} />

          <RegionCard flag="🇩🇪" name="Frankfurt" code="eu-central-1" ms={178} />
        </div>
      </div>
    </section>
  );
}

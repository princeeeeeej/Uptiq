"use client";

import { useEffect, useState } from "react";

interface Props {
  flag: string;
  name: string;
  code: string;
  ms: number;
}

export default function RegionCard({
  flag,
  name,
  code,
  ms,
}: Props) {
  const [latency, setLatency] = useState(ms);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(ms + Math.round(Math.random() * 12 - 6));
    }, 2500);

    return () => clearInterval(interval);
  }, [ms]);

  return (
    <div
      className="
      region-card
      rounded-3xl
      p-6
      border
      border-white/10
      bg-white/[0.03]
      backdrop-blur-xl
      "
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xl">
            {flag}
          </span>

          <div>
            <p className="font-medium">
              {name}
            </p>

            <p className="text-xs text-zinc-500 uppercase tracking-widest">
              {code}
            </p>
          </div>
        </div>

        <div
          className="
          flex
          items-center
          gap-2
          px-3
          py-1
          rounded-full
          border
          border-white/10
          bg-white/[0.03]
          "
        >
          <span className="h-2 w-2 rounded-full bg-zinc-300 animate-pulse" />
          <span className="text-xs">
            Operational
          </span>
        </div>
      </div>

      <div>
        <div className="text-4xl font-semibold tracking-tight">
          {latency}
          <span className="ml-1 text-sm text-zinc-500">
            ms
          </span>
        </div>

        <div className="mt-2 text-xs text-zinc-500">
          Average response time
        </div>
      </div>
    </div>
  );
}

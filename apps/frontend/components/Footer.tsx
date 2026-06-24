'use client';

import { Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      className="
      border-t
      border-white/5
      py-10
      "
    >
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex items-center gap-3 justify-center mb-3">
          <div
            className="
            w-8
            h-8
            rounded-xl
            border
            border-white/10
            bg-white/[0.04]
            flex
            items-center
            justify-center
            "
          >
            <Activity className="w-4 h-4" />
          </div>

          <span className="font-semibold">UPTIQ</span>
        </div>

        <p className="text-center text-zinc-500 text-sm">
          Distributed uptime monitoring platform.
        </p>
      </div>
    </footer>
  );
}

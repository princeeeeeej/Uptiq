'use client';

import { Activity } from 'lucide-react';

interface NavbarProps {
  scrolled: boolean;
}

export default function Navbar({ scrolled }: NavbarProps) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(9,9,11,0.75)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      }}
    >
      <div className="max-w-[1280px] mx-auto w-full px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="
            h-8 w-8
            rounded-xl
            border
            border-white/10
            bg-white/[0.04]
            flex
            items-center
            justify-center
            "
          >
            <Activity className="w-4 h-4 text-zinc-100" />
          </div>

          <span
            className="
            text-lg
            font-semibold
            tracking-tight
            "
          >
            UPTIQ
          </span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-10">
          {['Features', 'Architecture', 'Pricing', 'Changelog'].map((item) => (
            <a
              key={item}
              href="#"
              className="
              text-sm
              text-zinc-500
              hover:text-white
              transition-colors
              "
            >
              {item}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            className="
            hidden
            md:block
            text-sm
            text-zinc-500
            hover:text-white
            "
          >
            Sign In
          </button>

          <button
            className="
            px-5
            py-2.5
            rounded-xl
            bg-white
            text-black
            text-sm
            font-medium
            hover:bg-zinc-200
            transition
            "
          >
            Start Free
          </button>
        </div>
      </div>
    </nav>
  );
}

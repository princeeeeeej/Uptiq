'use client';

import { Activity, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Magnetic from '@/ui/Magnetic';

interface NavbarProps {
  scrolled: boolean;
}

export default function Navbar({ scrolled }: NavbarProps) {
  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:8080/user/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then(data => setUser(data))
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      });
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.reload();
  };

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
        <Magnetic range={40} strength={0.25}>
          <Link href="/" className="flex items-center gap-3">
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
          </Link>
        </Magnetic>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Architecture', 'Pricing', 'Changelog'].map((item) => (
            <Magnetic key={item} range={30} strength={0.35}>
              <a
                href={`#${item.toLowerCase()}`}
                className="
                text-sm
                text-zinc-500
                hover:text-white
                transition-colors
                py-2
                px-1
                "
              >
                {item}
              </a>
            </Magnetic>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-zinc-400">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <UserIcon className="w-3 h-3 text-emerald-300" />
                </div>
                {user.username}
              </div>
              <Magnetic range={25} strength={0.3}>
                <button
                  onClick={handleSignOut}
                  className="text-zinc-500 hover:text-rose-400 transition-colors p-2 cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </Magnetic>
              <Magnetic range={40} strength={0.2}>
                <Link
                  href="/dashboard"
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
                  Dashboard
                </Link>
              </Magnetic>
            </div>
          ) : (
            <>
              <Magnetic range={30} strength={0.3}>
                <Link
                  href="/signin"
                  className="
                  hidden
                  md:block
                  text-sm
                  text-zinc-500
                  hover:text-white
                  px-3
                  py-2
                  "
                >
                  Sign In
                </Link>
              </Magnetic>

              <Magnetic range={40} strength={0.2}>
                <Link
                  href="/signup"
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
                </Link>
              </Magnetic>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

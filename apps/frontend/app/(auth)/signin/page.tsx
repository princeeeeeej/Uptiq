'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, User } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8080/user/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Save token (e.g. to localStorage)
      localStorage.setItem('token', data.jwt);

      // Redirect to dashboard or home
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative group">
      {/* Background Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 to-sky-500/20 rounded-[32px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Glass Container */}
      <div className="relative bg-zinc-950/40 backdrop-blur-3xl border border-white/10 rounded-[32px] p-10 overflow-hidden shadow-2xl">
        {/* Subtle Top Highlight */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Welcome back</h1>
          <p className="text-zinc-400 text-sm">Enter your details to sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-zinc-500" />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe" 
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Password</label>
                <Link href="#" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all font-mono"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="group/btn relative w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-4 rounded-2xl hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:hover:scale-100"
          >
            <span className="relative z-10">{loading ? 'Signing in...' : 'Sign In'}</span>
            {!loading && <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-200 to-sky-200 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-zinc-500">
            Don't have an account?{' '}
            <Link href="/signup" className="text-white hover:text-violet-300 transition-colors font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

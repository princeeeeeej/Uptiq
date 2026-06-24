import Noise from '@/ui/Noice';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col relative overflow-hidden">
      <Noise />
      
      {/* Background Sci-Fi Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] rounded-[100%] blur-[120px] opacity-30 mix-blend-screen"
          style={{
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.5) 0%, rgba(56,189,248,0.2) 40%, transparent 70%)',
          }}
        />
      </div>

      <div className="absolute top-8 left-8 z-50">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors px-4 py-2 rounded-full border border-transparent hover:border-white/10 hover:bg-white/[0.02]">
          <ChevronLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
      
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-6 py-20">
        {children}
      </main>
    </div>
  );
}

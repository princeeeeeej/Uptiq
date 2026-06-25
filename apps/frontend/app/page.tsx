'use client';

import { useEffect, useState } from 'react';
import Noise from '@/ui/Noice';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function UptiqLandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);

    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 overflow-x-hidden relative">
      <Noise />

      <Navbar scrolled={scrolled} />

      <Hero />

      <Features />

      <CTA />

      <Footer />
    </div>
  );
}


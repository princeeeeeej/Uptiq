'use client';

import { useEffect, useRef, useState } from 'react';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Noise from '@/ui/Noice';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import LiveMonitoring from '@/components/LiveMonitoring';
import Architecture from '@/components/Architecture';
import Features from '@/components/Features';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function UptiqLandingPage() {
  const [scrolled, setScrolled] = useState(false);

  const archRef = useRef<HTMLDivElement>(null);
  const featRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);

    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-badge',
        {
          opacity: 0,
          y: -20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
        },
      );

      gsap.fromTo(
        '.hero-h1 .line',
        {
          opacity: 0,
          y: 60,
        },
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          duration: 1,
        },
      );

      gsap.fromTo(
        '.hero-sub',
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
        },
      );

      gsap.fromTo(
        '.hero-ctas',
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
        },
      );

      gsap.fromTo(
        '.hero-mockup',
        {
          opacity: 0,
          y: 40,
          scale: 0.97,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
        },
      );

      gsap.fromTo(
        '.fcard',
        {
          opacity: 0,
          scale: 0.8,
        },
        {
          opacity: 1,
          scale: 1,
          stagger: 0.15,
        },
      );

      gsap.fromTo(
        '.feat-card',
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          scrollTrigger: {
            trigger: featRef.current,
            start: 'top 80%',
          },
        },
      );

      gsap.fromTo(
        '.region-card',
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          scrollTrigger: {
            trigger: statusRef.current,
            start: 'top 80%',
          },
        },
      );

      ScrollTrigger.create({
        trigger: statusRef.current,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(
            { val: 0 },
            {
              val: 99.97,
              duration: 2,
              onUpdate() {
                if (counterRef.current) {
                  counterRef.current.textContent = (
                    this.targets()[0] as any
                  ).val.toFixed(2);
                }
              },
            },
          );
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      className="
      min-h-screen
      bg-[#09090b]
      text-zinc-100
      overflow-x-hidden
      "
    >
      <Noise />

      <Navbar scrolled={scrolled} />

      <Hero />

      <LiveMonitoring statusRef={statusRef} counterRef={counterRef} />

      <Architecture archRef={archRef} />

      <Features featRef={featRef} />

      <CTA />

      <Footer />
    </div>
  );
}

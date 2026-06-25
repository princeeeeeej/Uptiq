'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface TextRevealerProps {
  text: string;
  type?: 'words' | 'chars';
  triggerOnScroll?: boolean;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
}

export default function TextRevealer({
  text,
  type = 'words',
  triggerOnScroll = true,
  className = '',
  delay = 0,
  duration = 0.8,
  stagger = 0.04,
}: TextRevealerProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const items = el.querySelectorAll('.reveal-item');
    if (!items.length) return;

    const animConfig = {
      y: '105%',
      opacity: 0,
    };

    const targetConfig = {
      y: '0%',
      opacity: 1,
      duration: duration,
      delay: delay,
      stagger: stagger,
      ease: 'power3.out',
    };

    gsap.set(items, animConfig);

    if (triggerOnScroll) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(items, targetConfig);
        },
        once: true,
      });
    } else {
      gsap.to(items, targetConfig);
    }
  }, [delay, duration, stagger, triggerOnScroll]);

  // Split logic
  const renderContent = () => {
    if (type === 'words') {
      return text.split(' ').map((word, idx) => (
        <span key={idx} className="inline-block overflow-hidden mr-[0.25em] pb-[0.05em] last:mr-0">
          <span className="reveal-item inline-block transform origin-bottom-left select-none">
            {word}
          </span>
        </span>
      ));
    } else {
      return text.split('').map((char, idx) => {
        if (char === ' ') {
          return <span key={idx} className="inline-block">&nbsp;</span>;
        }
        return (
          <span key={idx} className="inline-block overflow-hidden pb-[0.05em]">
            <span className="reveal-item inline-block transform origin-bottom-left select-none">
              {char}
            </span>
          </span>
        );
      });
    }
  };

  return (
    <span ref={containerRef} className={`inline-block ${className}`}>
      {renderContent()}
    </span>
  );
}

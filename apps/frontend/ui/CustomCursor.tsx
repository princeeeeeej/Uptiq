'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [cursorText, setCursorText] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Disable custom cursor on touch/mobile devices
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    setIsVisible(true);

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Set initial offscreen positions
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Instantly position the center dot
      gsap.set(dot, { x: mouse.x, y: mouse.y });
    };

    // Smoothly animate the trailing ring
    gsap.ticker.add(() => {
      const dt = 1.0 - Math.pow(1.0 - 0.15, gsap.ticker.deltaRatio());
      pos.x += (mouse.x - pos.x) * dt;
      pos.y += (mouse.y - pos.y) * dt;
      gsap.set(ring, { x: pos.x, y: pos.y });
    });

    // Event delegation for hovering interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest('a, button, [role="button"], .feat-card, [data-cursor]');
      
      if (interactiveEl) {
        const cursorType = interactiveEl.getAttribute('data-cursor');
        
        if (cursorType === 'view') {
          setCursorText('VIEW');
          gsap.to(ring, {
            width: 70,
            height: 70,
            backgroundColor: 'rgba(139, 92, 246, 0.25)',
            borderColor: 'rgba(139, 92, 246, 0.8)',
            duration: 0.3,
            ease: 'power2.out',
          });
          gsap.to(dot, { scale: 0, duration: 0.2 });
        } else if (cursorType === 'plus') {
          setCursorText('+');
          gsap.to(ring, {
            width: 60,
            height: 60,
            backgroundColor: 'rgba(52, 211, 153, 0.25)',
            borderColor: 'rgba(52, 211, 153, 0.8)',
            duration: 0.3,
            ease: 'power2.out',
          });
          gsap.to(dot, { scale: 0, duration: 0.2 });
        } else if (interactiveEl.classList.contains('feat-card')) {
          // Bento Grid Card hover state (magnetic glow/scale)
          gsap.to(ring, {
            width: 54,
            height: 54,
            borderColor: 'rgba(255, 255, 255, 0.6)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            duration: 0.3,
            ease: 'power2.out',
          });
          gsap.to(dot, { scale: 1.5, backgroundColor: '#a78bfa', duration: 0.2 });
        } else {
          // Standard interactive elements (links, buttons)
          setCursorText('');
          gsap.to(ring, {
            width: 48,
            height: 48,
            borderColor: 'rgba(255, 255, 255, 0.8)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            duration: 0.3,
            ease: 'power2.out',
          });
          gsap.to(dot, { scale: 0.5, duration: 0.2 });
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest('a, button, [role="button"], .feat-card, [data-cursor]');
      
      if (interactiveEl) {
        setCursorText('');
        gsap.to(ring, {
          width: 32,
          height: 32,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          backgroundColor: 'transparent',
          duration: 0.3,
          ease: 'power2.out',
        });
        gsap.to(dot, { scale: 1, backgroundColor: '#ffffff', duration: 0.2 });
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    // Inject style to disable standard cursor
    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `
      .cursor-none-all,
      .cursor-none-all * {
        cursor: none !important;
      }
    `;
    document.head.appendChild(styleSheet);
    document.documentElement.classList.add('cursor-none-all');

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.documentElement.classList.remove('cursor-none-all');
      document.head.removeChild(styleSheet);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      
      {/* Central Targeting Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
      />

      {/* Trailing Outer Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 border border-white/30 rounded-full pointer-events-none z-[9999] flex items-center justify-center text-[10px] font-mono font-bold tracking-wider text-white mix-blend-screen transition-colors duration-200"
      >
        {cursorText}
      </div>
    </>
  );
}

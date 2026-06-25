'use client';

import { useEffect, useRef } from 'react';

export default function InteractiveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Particle/Dot class
    const gap = 50; // Grid cell size
    const hoverRadius = 150; // Influence circle size

    const drawGrid = () => {
      ctx.clearRect(0, 0, width, height);

      // We align the grid offsets relative to the window scroll to prevent layout sliding
      const scrollY = window.scrollY;
      const startX = 0;
      const startY = -(scrollY % gap);

      // Draw subtle dot grid
      for (let x = startX; x < width + gap; x += gap) {
        for (let y = startY; y < height + gap; y += gap) {
          // Calculate grid node coordinates in screen space
          const px = x;
          const py = y;

          let dx = mouseRef.current.x - px;
          let dy = mouseRef.current.y - py;
          let dist = Math.hypot(dx, dy);

          let ox = 0;
          let oy = 0;
          let dotColor = 'rgba(255, 255, 255, 0.08)';
          let dotRadius = 1.0;

          if (mouseRef.current.active && dist < hoverRadius) {
            const force = (hoverRadius - dist) / hoverRadius;
            
            // Push dots away slightly from the mouse (displacement)
            ox = -(dx / dist) * force * 12;
            oy = -(dy / dist) * force * 12;

            // Glow color mixing sky-blue / violet based on coordinate
            const glowRatio = force;
            dotColor = `rgba(167, 139, 250, ${0.08 + glowRatio * 0.4})`; // glowing purple
            dotRadius = 1.0 + force * 2.0;

            // Draw a subtle connecting glow line to mouse
            if (dist < 80) {
              ctx.beginPath();
              ctx.moveTo(px + ox, py + oy);
              ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
              ctx.strokeStyle = `rgba(56, 189, 248, ${0.03 * (1 - dist / 80)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }

          // Render coordinate dot
          ctx.beginPath();
          ctx.arc(px + ox, py + oy, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = dotColor;
          ctx.fill();

          // Render subtle sci-fi coordinate crosshairs in corners at larger intervals
          if ((x % (gap * 4) === 0) && (y % (gap * 4) === 0)) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.lineWidth = 0.5;
            
            // Draw tiny cross
            ctx.beginPath();
            ctx.moveTo(px + ox - 4, py + oy);
            ctx.lineTo(px + ox + 4, py + oy);
            ctx.moveTo(px + ox, py + oy - 4);
            ctx.lineTo(px + ox, py + oy + 4);
            ctx.stroke();
          }
        }
      }
    };

    const loop = () => {
      drawGrid();
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[2] opacity-80"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

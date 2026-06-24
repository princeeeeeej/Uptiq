'use client';

import { useEffect, useRef } from 'react';

export default function MeshGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    let frame = 0;
    let raf: number;

    const blobs = [
      {
        x: 0.2,
        y: 0.35,
        r: 0.5,
        color: '#fafafa',
        sx: 0.0002,
        sy: 0.0003,
      },
      {
        x: 0.8,
        y: 0.4,
        r: 0.4,
        color: '#71717a',
        sx: -0.0003,
        sy: 0.0002,
      },
      {
        x: 0.55,
        y: 0.8,
        r: 0.45,
        color: '#18181b',
        sx: 0.0004,
        sy: -0.0002,
      },
    ];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      blobs.forEach((b) => {
        const x = (b.x + Math.sin(frame * b.sx * 1000) * 0.15) * w;
        const y = (b.y + Math.cos(frame * b.sy * 1000) * 0.15) * h;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, b.r * w);

        grad.addColorStop(0, `${b.color}18`);
        grad.addColorStop(0.4, `${b.color}08`);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      });

      frame++;
      raf = requestAnimationFrame(draw);
    };

    draw();

    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

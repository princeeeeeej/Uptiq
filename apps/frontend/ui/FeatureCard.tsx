'use client';

import { useRef } from 'react';
import gsap from 'gsap';

interface Props {
  icon: React.ElementType;
  title: string;
  desc: string;
}

export default function FeatureCard({ icon: Icon, title, desc }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const enter = () => {
    gsap.to(ref.current, {
      scale: 1.03,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const leave = () => {
    gsap.to(ref.current, {
      scale: 1,
      duration: 0.25,
      ease: 'power2.inOut',
    });
  };

  return (
    <div
      ref={ref}
      onMouseEnter={enter}
      onMouseLeave={leave}
      className="
      feat-card
      relative
      overflow-hidden
      rounded-3xl
      p-8
      border
      border-white/10
      bg-zinc-950
      hover:bg-zinc-900/60
      transition-colors
      "
    >
      <div
        className="
        absolute
        inset-0
        opacity-0
        hover:opacity-100
        transition-opacity
        bg-gradient-to-br
        from-white/[0.03]
        via-transparent
        to-transparent
        "
      />

      <div
        className="
        mb-6
        h-11
        w-11
        rounded-2xl
        border
        border-white/10
        bg-white/[0.04]
        flex
        items-center
        justify-center
        "
      >
        <Icon className="w-5 h-5 text-zinc-300" />
      </div>

      <h3 className="text-lg font-medium mb-3">{title}</h3>

      <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
    </div>
  );
}

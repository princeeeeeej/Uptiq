'use client';

import { Globe2, Shield, Activity, Bell, Server, Zap } from 'lucide-react';

import FeatureCard from '../ui/FeatureCard';

export default function Features({
  featRef,
}: {
  featRef: React.RefObject<HTMLDivElement | null>;
}) {
  const features = [
    {
      icon: Globe2,
      title: 'Multi-region consensus',
      desc: 'Multiple monitoring regions eliminate false positives.',
    },
    {
      icon: Shield,
      title: 'SSL expiry watcher',
      desc: 'Track certificate expiration before it becomes a problem.',
    },
    {
      icon: Activity,
      title: 'Incident timeline',
      desc: 'Full outage history with duration and resolution tracking.',
    },
    {
      icon: Bell,
      title: 'Webhook alerts',
      desc: 'Slack, Discord and custom webhook notifications.',
    },
    {
      icon: Server,
      title: 'Fault tolerant queues',
      desc: 'Redis Streams powered job recovery architecture.',
    },
    {
      icon: Zap,
      title: 'Public status page',
      desc: 'Share uptime transparency with customers.',
    },
  ];

  return (
    <section ref={featRef} className="py-32 px-6">
      <div className="max-w-[1280px] mx-auto">
        <div className="feat-eyebrow text-xs uppercase tracking-[0.25em] text-zinc-500 mb-4">
          Features
        </div>

        <h2
          className="
          feat-title-h2
          text-5xl
          md:text-7xl
          font-semibold
          tracking-[-0.06em]
          max-w-4xl
          mb-20
          "
        >
          Built for teams that can't afford downtime.
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

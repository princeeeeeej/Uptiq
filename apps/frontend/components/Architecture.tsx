'use client';

import { Globe2, Activity, Server } from 'lucide-react';

export default function Architecture({
  archRef,
}: {
  archRef: React.RefObject<HTMLDivElement | null>;
}) {
  const cards = [
    {
      icon: Globe2,
      title: 'Multi Region Consensus',
      desc: 'Websites are marked down only after multiple regions confirm failure. Regional outages never create false positives.',
    },
    {
      icon: Activity,
      title: 'Redis Streams',
      desc: 'Distributed workers consume jobs through Redis Streams with automatic queue recovery.',
    },
    {
      icon: Server,
      title: 'Batched Writes',
      desc: 'Workers aggregate monitoring data and write in batches for maximum throughput.',
    },
  ];

  return (
    <section
      ref={archRef}
      className="
      py-32
      px-6
      border-t
      border-white/5
      "
    >
      <div className="max-w-[1280px] mx-auto">
        <div
          className="
          arch-divider
          h-px
          bg-gradient-to-r
          from-transparent
          via-white/20
          to-transparent
          mb-20
          "
        />

        <div
          className="
          arch-eyebrow
          text-xs
          uppercase
          tracking-[0.25em]
          text-zinc-500
          mb-4
          "
        >
          Architecture
        </div>

        <div className="flex flex-col lg:flex-row justify-between gap-10 mb-20">
          <div>
            <h2
              className="
              arch-title
              text-5xl
              md:text-7xl
              font-semibold
              tracking-[-0.06em]
              leading-none
              "
            >
              <span className="word inline-block mr-3">Global.</span>

              <span className="word inline-block mr-3">Distributed.</span>

              <br />

              <span className="word inline-block text-zinc-500">
                Fault-Tolerant.
              </span>
            </h2>
          </div>

          <div
            className="
            font-mono
            text-xs
            text-zinc-500
            space-y-3
            "
          >
            <div>LATENCY — 12ms</div>

            <div>REGIONS — 3</div>

            <div>QUEUE — Redis Streams</div>

            <div>DATABASE — PostgreSQL</div>
          </div>
        </div>

        <div
          className="
          axiom-grid
          grid
          md:grid-cols-3
          gap-5
          "
        >
          {cards.map((card) => (
            <div
              key={card.title}
              className="
              axiom-card
              rounded-3xl
              border
              border-white/10
              bg-white/[0.03]
              backdrop-blur-xl
              p-8
              "
            >
              <div
                className="
                w-12
                h-12
                rounded-2xl
                border
                border-white/10
                bg-white/[0.03]
                flex
                items-center
                justify-center
                mb-6
                "
              >
                <card.icon className="w-5 h-5 text-zinc-300" />
              </div>

              <h3 className="text-xl font-medium mb-4">{card.title}</h3>

              <p className="text-zinc-500 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

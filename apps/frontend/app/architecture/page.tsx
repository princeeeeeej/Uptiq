"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Globe2,
  Server,
  Database,
  Activity,
  Zap,
  Layout,
  ArrowDown,
  Settings,
  Clock,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Noise from "@/ui/Noice";
import TextRevealer from "@/ui/TextRevealer";

gsap.registerPlugin(ScrollTrigger);

export default function ArchitecturePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate phases on scroll
      gsap.utils.toArray(".arch-phase").forEach((phase: any, i) => {
        gsap.fromTo(
          phase,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: phase,
              start: "top 85%",
            },
          },
        );
      });

      // Animate flowing lines
      gsap.utils.toArray(".flow-line").forEach((line: any) => {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            duration: 1.5,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: line,
              start: "top 75%",
              end: "bottom 50%",
              scrub: 1,
            },
          },
        );
      });

      // Animate dots inside flow lines
      gsap.utils.toArray(".flow-dot").forEach((dot: any) => {
        gsap.to(dot, {
          y: "100%",
          duration: 1.5,
          repeat: -1,
          ease: "linear",
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const Phase = ({
    step,
    icon: Icon,
    title,
    subtitle,
    desc,
    color,
    codeSnippet,
    isLast = false,
  }: any) => {
    const colorMap: Record<string, string> = {
      indigo:
        "bg-indigo-500 text-indigo-400 border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.15)]",
      blue: "bg-blue-500 text-blue-400 border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]",
      emerald:
        "bg-emerald-500 text-emerald-400 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]",
      sky: "bg-sky-500 text-sky-400 border-sky-500/20 shadow-[0_0_30px_rgba(14,165,233,0.15)]",
      rose: "bg-rose-500 text-rose-400 border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.15)]",
      amber:
        "bg-amber-500 text-amber-400 border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    };

    const theme = colorMap[color];
    const bgClass = theme.split(" ")[0] + "/10";
    const textClass = theme.split(" ")[1];
    const borderClass = theme.split(" ")[2];
    const shadowClass = theme.split(" ")[3];

    return (
      <div
        className="
          relative
          arch-phase
          flex
          flex-col
          md:flex-row
          items-center
          md:items-start
          gap-8
          md:gap-16
          w-full
          group
        "
      >
        {}
        <div className="hidden md:flex flex-col items-center mt-2 relative">
          <div
            className="
              w-12
              h-12
              rounded-full
              bg-zinc-900
              border
              border-white/10
              flex
              items-center
              justify-center
              font-mono
              text-xl
              font-bold
              text-white
              z-10
              shadow-lg
            "
          >
            {step}
          </div>
          {!isLast && (
            <div
              className="
                absolute
                top-12
                bottom-[-8rem]
                w-[2px]
                bg-white/5
                flow-line
                origin-top
                flex
                justify-center
                overflow-hidden
              "
            >
              <div
                className={`w-[2px] h-8 ${theme.split(" ")[0]} blur-[1px] opacity-70 flow-dot`}
              />
            </div>
          )}
        </div>

        {}
        <div
          className={`flex-1 rounded-[32px] border border-white/5 bg-zinc-950/80 backdrop-blur-md p-8 md:p-10 w-full relative overflow-hidden transition-all duration-500 hover:border-white/10 ${shadowClass}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.02),transparent_50%)]" />

          <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-12 justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl ${bgClass} ${borderClass} flex items-center justify-center`}
                >
                  <Icon className={`w-7 h-7 ${textClass}`} />
                </div>
                <div>
                  <div
                    className={`text-xs font-mono uppercase tracking-widest ${textClass} mb-1`}
                  >
                    {subtitle}
                  </div>
                  <h3 className="text-2xl font-semibold text-white">{title}</h3>
                </div>
              </div>
              <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                {desc}
              </p>
            </div>

            {codeSnippet && (
              <div className="lg:w-[400px] shrink-0 bg-black/40 rounded-2xl border border-white/5 p-5 font-mono text-xs overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 mb-3 opacity-50">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="text-zinc-300 leading-relaxed overflow-x-auto custom-scrollbar flex-1 whitespace-pre">
                  {codeSnippet}
                </div>
              </div>
            )}
          </div>
        </div>

        {}
        {!isLast && (
          <div className="md:hidden flex justify-center w-full my-4">
            <div className="w-0.5 h-12 bg-gradient-to-b from-white/20 to-transparent relative overflow-hidden">
              <div
                className={`absolute top-0 w-full h-4 ${theme.split(" ")[0]} blur-[1px] opacity-70 flow-dot`}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const ArchitectureDiagram = () => {
    return (
      <div className="w-full bg-zinc-950/50 border border-white/5 rounded-[40px] p-12 mb-32 relative overflow-hidden flex flex-col items-center shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03),transparent_70%)]" />

        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <h2 className="text-2xl font-bold tracking-tight text-white mb-16 relative z-10">
          System Flow Diagram
        </h2>

        <div className="relative z-10 flex flex-col items-center w-full max-w-4xl">
          {/* Level 1: Client & API */}
          <div className="flex items-center gap-16 w-full justify-center mb-8">
            <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 p-4 rounded-2xl flex flex-col items-center w-40 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
              <Layout className="w-6 h-6 mb-2" />
              <div className="text-xs font-semibold">Web Dashboard</div>
            </div>

            {/* Horizontal Line with animated dot */}
            <div className="flex-1 max-w-[100px] h-[2px] bg-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-8 bg-indigo-500 blur-[2px] opacity-70 animate-[slideRight_2s_linear_infinite]" />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-2xl flex flex-col items-center w-40 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <Server className="w-6 h-6 mb-2" />
              <div className="text-xs font-semibold">REST API</div>
            </div>
          </div>

          <div className="w-[2px] h-12 bg-white/10 relative overflow-hidden mb-8">
            <div className="absolute top-0 left-0 w-full h-8 bg-white blur-[2px] opacity-50 animate-[slideDown_2s_linear_infinite]" />
          </div>

          {/* Level 2: Pusher */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl flex flex-col items-center w-56 shadow-[0_0_20px_rgba(16,185,129,0.1)] mb-8">
            <Clock className="w-6 h-6 mb-2" />
            <div className="text-xs font-semibold">Pusher Engine (Cron)</div>
            <div className="text-[10px] text-zinc-500 mt-1">
              Schedules jobs every 10s
            </div>
          </div>

          <div className="w-[2px] h-12 bg-white/10 relative overflow-hidden mb-8">
            <div className="absolute top-0 left-0 w-full h-8 bg-emerald-500 blur-[2px] opacity-70 animate-[slideDown_1.5s_linear_infinite]" />
          </div>

          {/* Level 3: Redis 1 */}
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl flex flex-col items-center w-56 shadow-[0_0_20px_rgba(244,63,94,0.1)] mb-8">
            <Zap className="w-6 h-6 mb-2" />
            <div className="text-xs font-semibold">Redis: check_stream</div>
            <div className="text-[10px] text-zinc-500 mt-1">
              Pending health checks
            </div>
          </div>

          {/* Split to multiple workers */}
          <div className="relative w-full max-w-2xl h-16 mb-8 flex justify-center">
            {/* SVG lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
            >
              <path
                d="M 50% 0 L 50% 10 L 20% 10 L 20% 100%"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
              />
              <path
                d="M 50% 0 L 50% 10 L 50% 100%"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
              />
              <path
                d="M 50% 0 L 50% 10 L 80% 10 L 80% 100%"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
              />

              {/* Glowing animated path overlay (Left) */}
              <path
                d="M 50% 0 L 50% 10 L 20% 10 L 20% 100%"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="3"
                className="animate-[dash_2s_linear_infinite]"
                strokeDasharray="20 1000"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 4px #0ea5e9)" }}
              />
              {/* Glowing animated path overlay (Center) */}
              <path
                d="M 50% 0 L 50% 10 L 50% 100%"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="3"
                className="animate-[dash_2s_linear_infinite]"
                strokeDasharray="20 1000"
                strokeLinecap="round"
                style={{
                  filter: "drop-shadow(0 0 4px #0ea5e9)",
                  animationDelay: "0.3s",
                }}
              />
              {/* Glowing animated path overlay (Right) */}
              <path
                d="M 50% 0 L 50% 10 L 80% 10 L 80% 100%"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="3"
                className="animate-[dash_2s_linear_infinite]"
                strokeDasharray="20 1000"
                strokeLinecap="round"
                style={{
                  filter: "drop-shadow(0 0 4px #0ea5e9)",
                  animationDelay: "0.6s",
                }}
              />
            </svg>
          </div>

          {/* Level 4: Workers */}
          <div className="flex items-center justify-between w-full max-w-2xl px-4 mb-8">
            <div className="bg-sky-500/10 border border-sky-500/20 text-sky-400 p-4 rounded-2xl flex flex-col items-center w-36 shadow-[0_0_20px_rgba(14,165,233,0.1)] relative group">
              <Globe2 className="w-6 h-6 mb-2" />
              <div className="text-xs font-semibold">US Worker</div>
              <div className="absolute inset-0 bg-sky-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="bg-sky-500/10 border border-sky-500/20 text-sky-400 p-4 rounded-2xl flex flex-col items-center w-36 shadow-[0_0_20px_rgba(14,165,233,0.1)] relative group">
              <Globe2 className="w-6 h-6 mb-2" />
              <div className="text-xs font-semibold">EU Worker</div>
              <div className="absolute inset-0 bg-sky-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="bg-sky-500/10 border border-sky-500/20 text-sky-400 p-4 rounded-2xl flex flex-col items-center w-36 shadow-[0_0_20px_rgba(14,165,233,0.1)] relative group">
              <Globe2 className="w-6 h-6 mb-2" />
              <div className="text-xs font-semibold">AP Worker</div>
              <div className="absolute inset-0 bg-sky-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Merge back */}
          <div className="relative w-full max-w-2xl h-16 mb-8 flex justify-center">
            {/* SVG lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
            >
              <path
                d="M 20% 0 L 20% 90 L 50% 90 L 50% 100%"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
              />
              <path
                d="M 50% 0 L 50% 100%"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
              />
              <path
                d="M 80% 0 L 80% 90 L 50% 90 L 50% 100%"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
              />

              <path
                d="M 20% 0 L 20% 90 L 50% 90 L 50% 100%"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="3"
                className="animate-[dash_2s_linear_infinite]"
                strokeDasharray="20 1000"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 4px #f43f5e)" }}
              />
              <path
                d="M 50% 0 L 50% 100%"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="3"
                className="animate-[dash_2s_linear_infinite]"
                strokeDasharray="20 1000"
                strokeLinecap="round"
                style={{
                  filter: "drop-shadow(0 0 4px #f43f5e)",
                  animationDelay: "0.4s",
                }}
              />
              <path
                d="M 80% 0 L 80% 90 L 50% 90 L 50% 100%"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="3"
                className="animate-[dash_2s_linear_infinite]"
                strokeDasharray="20 1000"
                strokeLinecap="round"
                style={{
                  filter: "drop-shadow(0 0 4px #f43f5e)",
                  animationDelay: "0.8s",
                }}
              />
            </svg>
          </div>

          {/* Level 5: Redis 2 */}
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl flex flex-col items-center w-56 shadow-[0_0_20px_rgba(244,63,94,0.1)] mb-8">
            <Zap className="w-6 h-6 mb-2" />
            <div className="text-xs font-semibold">Redis: db_write_stream</div>
            <div className="text-[10px] text-zinc-500 mt-1">
              Pending DB saves
            </div>
          </div>

          <div className="w-[2px] h-12 bg-white/10 relative overflow-hidden mb-8">
            <div className="absolute top-0 left-0 w-full h-8 bg-amber-500 blur-[2px] opacity-70 animate-[slideDown_1.5s_linear_infinite]" />
          </div>

          {/* Level 6: DB Writer */}
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-2xl flex flex-col items-center w-56 shadow-[0_0_20px_rgba(245,158,11,0.1)] mb-8">
            <RefreshCw className="w-6 h-6 mb-2" />
            <div className="text-xs font-semibold">DB Writer Service</div>
            <div className="text-[10px] text-zinc-500 mt-1">
              Consumes batches
            </div>
          </div>

          {/* Split from DB Writer to Postgres and Alerts */}
          <div className="relative w-full max-w-sm h-12 mb-8 flex justify-center">
            {/* SVG lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
            >
              <path
                d="M 50% 0 L 50% 100%"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
              />
              <path
                d="M 50% 10 L 85% 10 L 85% 100%"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
              />

              <path
                d="M 50% 0 L 50% 100%"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                className="animate-[dash_2s_linear_infinite]"
                strokeDasharray="20 1000"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 4px #f59e0b)" }}
              />
              <path
                d="M 50% 10 L 85% 10 L 85% 100%"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                className="animate-[dash_2s_linear_infinite]"
                strokeDasharray="20 1000"
                strokeLinecap="round"
                style={{
                  filter: "drop-shadow(0 0 4px #f59e0b)",
                  animationDelay: "0.3s",
                }}
              />
            </svg>
          </div>

          {/* Level 7: PostgreSQL & Alerts */}
          <div className="flex justify-between w-full max-w-sm px-4">
            <div className="bg-zinc-800/80 border border-zinc-700 text-white p-4 rounded-2xl flex flex-col items-center w-40 shadow-2xl relative left-4">
              <Database className="w-6 h-6 mb-2 text-white" />
              <div className="text-xs font-semibold">PostgreSQL</div>
              <div className="text-[10px] text-zinc-400 mt-1 text-center">
                Ticks & Incidents
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex flex-col items-center w-40 shadow-[0_0_20px_rgba(239,68,68,0.1)] relative">
              <AlertTriangle className="w-6 h-6 mb-2" />
              <div className="text-xs font-semibold">Alerting Engine</div>
              <div className="text-[10px] text-zinc-500 mt-1 text-center">
                Emails & Webhooks
              </div>
            </div>
          </div>
        </div>

        {/* CSS for custom animations used in SVG lines and dots */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes dash {
            0% { stroke-dashoffset: 1000; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes slideDown {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(150%); }
          }
          @keyframes slideRight {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(150%); }
          }
        `,
          }}
        />
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-[#09090b] text-zinc-100 overflow-x-hidden relative"
      ref={containerRef}
    >
      <Noise />
      <Navbar scrolled={true} />

      <main className="pt-32 pb-32 px-6 max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-zinc-400 text-xs font-mono tracking-widest uppercase mb-6">
            <Layout className="w-3.5 h-3.5" />
            System Design
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-[-0.04em] mb-6">
            <TextRevealer text="Data Flow & Architecture" type="words" />
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
            Follow the journey of a single health check—from the initial
            scheduling heartbeat down to global edge execution and persistence.
          </p>
        </div>

        <ArchitectureDiagram />

        <div className="flex flex-col gap-12 md:gap-24 relative">
          <Phase
            step="1"
            icon={Clock}
            subtitle="The Heartbeat"
            title="Pusher Engine"
            desc="The lifecycle begins in the central Pusher Engine. Every 10 seconds, this lightweight Node service wakes up, fetches all active website configurations from PostgreSQL, and pushes health-check jobs onto a Redis Stream queue."
            color="indigo"
            codeSnippet={`// Pusher Engine Schedule
setInterval(async () => {
  const activeMonitors = await db.website.findMany({
    where: { status: 'ACTIVE' }
  });

  const streamJobs = activeMonitors.map(m => ({
    id: m.id,
    url: m.url
  }));

  // Push to Redis Stream
  await xAddBulk('check_stream', streamJobs);
}, 10_000);`}
          />

          <Phase
            step="2"
            icon={Zap}
            subtitle="Message Broker"
            title="Redis Streams"
            desc="Instead of using standard pub/sub, we use Redis Streams. This guarantees at-least-once delivery. If a worker crashes while processing a ping, the job remains in the PEL (Pending Entries List) and is automatically reclaimed by another worker."
            color="rose"
            codeSnippet={`// Redis Stream Architecture
Stream Name: "check_stream"
Consumer Groups:
  - cg:us-east-1
  - cg:eu-central-1
  - cg:ap-south-1

Reliability:
- Auto-reclaim stuck messages
- Acknowledgment (XACK) required
- Zero dropped payloads`}
          />

          <Phase
            step="3"
            icon={Globe2}
            subtitle="Distributed Execution"
            title="Global Edge Workers"
            desc="Workers located in datacenters worldwide (e.g., US, Europe, Asia) consume the Redis Stream simultaneously. They execute exact HTTP latency tests from their respective geographic locations, ensuring multi-region consensus on downtime."
            color="sky"
            codeSnippet={`// Worker Execution (us-east-1)
const start = performance.now();
try {
  const res = await fetch(url);
  const latency = performance.now() - start;
  
  await publishResult({
    status: res.ok ? 'UP' : 'DOWN',
    latency,
    region: 'us-east-1'
  });
} catch (error) {
  // Region-specific downtime
  publishResult({ status: 'DOWN' });
}`}
          />

          <Phase
            step="4"
            icon={Database}
            subtitle="Persistence & Alerting"
            title="DB Writer & Incident Trigger"
            desc="The workers push their results to a second stream (db_write_stream). A central DB Writer consumes these results in batches, writes them to PostgreSQL, and evaluates incident thresholds. If a site is verified down, it triggers instant email and webhook alerts."
            color="emerald"
            codeSnippet={`// DB Writer Evaluation
const results = await consumeStream();

await db.$transaction([
  db.websiteTick.createMany({ data: results }),
  db.website.update({ ... })
]);

if (siteIsDown && !activeIncident) {
  await createIncident();
  await sendAlertEmails();
}`}
            isLast={true}
          />
        </div>
      </main>

      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_70%)] pointer-events-none" />
    </div>
  );
}

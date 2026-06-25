# Uptiq — Multi-Region Uptime Monitoring Platform

A production-grade, distributed uptime monitoring system built with a microservices architecture. Uptiq verifies endpoint availability from multiple geographic regions, eliminates false positives through multi-region consensus, and delivers real-time incident tracking with sub-minute alert latency.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [System Design](#system-design)
  - [Data Flow](#data-flow)
  - [Queue Semantics](#queue-semantics)
  - [Database Schema](#database-schema)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running Services](#running-services)
- [API Reference](#api-reference)
- [Frontend](#frontend)
- [Contributing](#contributing)
- [License](#license)

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                         Uptiq Architecture                        │
│                                                                    │
│  ┌──────────┐     ┌──────────────┐     ┌─────────────────────┐    │
│  │  Next.js  │────▶│   Express    │────▶│    PostgreSQL        │    │
│  │ Frontend  │◀────│   REST API   │◀────│  (Prisma ORM)        │    │
│  └──────────┘     └──────────────┘     └─────────────────────┘    │
│       :3000             :8080                                      │
│                                              ▲                     │
│                                              │ write ticks         │
│  ┌──────────┐     ┌──────────────┐     ┌─────┴───────────────┐    │
│  │  Pusher   │────▶│    Redis     │────▶│   Worker (×N)        │    │
│  │ (Cron)    │     │   Streams    │     │   per region         │    │
│  └──────────┘     └──────────────┘     └─────────────────────┘    │
│   every 3 min      uptiq:checks         fetch + record ticks      │
└────────────────────────────────────────────────────────────────────┘
```

The system is decomposed into four independently deployable services connected through Redis Streams as the central message bus and PostgreSQL as the single source of truth.

## System Design

### Data Flow

1. **Scheduling** — The `pusher` service runs on a 3-minute cron interval. It queries all active websites from PostgreSQL and publishes a check event per website onto the `uptiq:checks` Redis Stream.

2. **Consumption** — Worker processes are deployed per-region (e.g. `us-east-1`, `eu-central-1`, `ap-south-1`). Each region runs as a Redis consumer group, meaning every check event is delivered to exactly one worker within each region. This guarantees multi-region coverage without duplication.

3. **Health Checking** — Each worker performs an HTTP fetch against the target URL, measures response time in milliseconds, and writes a `WebsiteTick` record to PostgreSQL. Failed requests are caught and recorded with error messages and DOWN status.

4. **Aggregation** — The `WebsiteStatusCurrent` table maintains a materialized view of the latest status per website, including consecutive failure counts and consensus region data. This enables the API to serve dashboard data without expensive tick aggregation queries.

5. **Presentation** — The Express API serves authenticated endpoints for the Next.js frontend dashboard, which polls every 30 seconds for live status updates.

### Queue Semantics

The Redis Streams layer (`packages/redisstream`) implements reliable message delivery with the following guarantees:

| Feature | Implementation |
|---------|---------------|
| **At-least-once delivery** | Consumer groups with explicit `XACK` after processing |
| **Dead letter recovery** | `reclaimStuck()` uses `XPENDING` + `XCLAIM` to reassign messages idle for >60s |
| **Backpressure** | Workers read in batches of 5 with 5s blocking reads (`XREADGROUP BLOCK 5000`) |
| **Fault tolerance** | Failed stream operations write to `uptiq:failed` DLQ stream via `xAddToDLQ()` |
| **Idempotent group creation** | `XGROUP CREATE` with `MKSTREAM` flag, `BUSYGROUP` errors are silently caught |

### Database Schema

```
┌──────────────┐    ┌──────────────────────┐    ┌─────────────────┐
│    users      │    │      websites         │    │    regions       │
├──────────────┤    ├──────────────────────┤    ├─────────────────┤
│ id (uuid)     │◀──│ userId (fk)           │    │ id (uuid)        │
│ username      │    │ id (uuid)             │    │ code             │
│ password      │    │ name, url, slug       │    │ name             │
│ createdAt     │    │ isActive              │    └────────┬────────┘
└──────┬───────┘    └──────────┬───────────┘              │
       │                       │                           │
       │              ┌────────┴────────┐                  │
       │              ▼                 ▼                  │
       │  ┌─────────────────┐  ┌──────────────────┐       │
       │  │ website_status   │  │ website_ssl      │       │
       │  │ _current         │  │ _status          │       │
       │  ├─────────────────┤  ├──────────────────┤       │
       │  │ currentStatus    │  │ issuer           │       │
       │  │ consecutiveFails │  │ validFrom/Until  │       │
       │  │ lastCheckedAt    │  │ daysRemaining    │       │
       │  │ lastResponseTime │  └──────────────────┘       │
       │  └─────────────────┘                              │
       │              │                                    │
       │              ▼                                    │
       │  ┌──────────────────────────┐                     │
       │  │     website_ticks         │◀────────────────────┘
       │  ├──────────────────────────┤
       │  │ websiteId, regionId (fk)  │
       │  │ status (UP/DOWN/UNKNOWN)  │
       │  │ responseTimeMs            │
       │  │ statusCode, errorMessage  │
       │  │ checkedAt                 │
       │  └──────────────────────────┘
       │
       ▼
┌──────────────────┐    ┌──────────────────┐
│ alert_channels    │    │   incidents       │
├──────────────────┤    ├──────────────────┤
│ type (enum)       │    │ websiteId (fk)    │
│ config (json)     │    │ startedAt         │
│ isActive          │    │ resolvedAt        │
└──────────────────┘    │ durationSeconds   │
                        └──────────────────┘
```

Key design decisions:
- **Composite indexes** on `(websiteId, checkedAt)` and `(regionId, checkedAt)` for efficient time-series queries on ticks.
- **`WebsiteStatusCurrent`** as a 1:1 materialized status record avoids N+1 aggregation queries on the dashboard.
- **Cascading deletes** — removing a user cascades through websites, ticks, incidents, and alerts.
- **Alert channels** store provider config as flexible JSON, supporting Email, Webhook, Discord, and Slack.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Monorepo** | Turborepo + Bun workspaces |
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, GSAP, Lenis |
| **API** | Express.js, JWT (jsonwebtoken), bcrypt, Zod |
| **Database** | PostgreSQL + Prisma ORM |
| **Queue** | Redis Streams (consumer groups) |
| **Language** | TypeScript 5.9 (strict mode) |
| **Runtime** | Bun |

## Monorepo Structure

```
uptiq/
├── apps/
│   ├── api/              # Express REST API server (:8080)
│   │   ├── index.ts      # Route definitions & handlers
│   │   ├── middleware.ts  # JWT auth middleware
│   │   └── types.ts      # Zod input schemas
│   │
│   ├── frontend/         # Next.js 16 application (:3000)
│   │   ├── app/          # App Router pages & layouts
│   │   ├── components/   # Feature components (Hero, Features, CTA, Navbar, dashboard/)
│   │   └── ui/           # Shared UI primitives (Magnetic, CustomCursor, TextRevealer, etc.)
│   │
│   ├── pusher/           # Cron job — schedules check events every 3 minutes
│   │   └── index.ts
│   │
│   └── worker/           # Region-scoped consumer — executes HTTP health checks
│       └── index.ts
│
├── packages/
│   ├── store/            # Prisma schema, client, and migrations
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── index.ts      # Re-exports PrismaClient
│   │
│   ├── redisstream/      # Redis Streams abstraction layer
│   │   └── index.ts      # xAdd, xReadGroup, xAck, reclaimStuck, DLQ
│   │
│   ├── eslint-config/    # Shared ESLint configuration
│   ├── typescript-config/ # Shared tsconfig presets
│   └── ui/               # Shared UI component library
│
├── turbo.json            # Turborepo pipeline configuration
├── package.json          # Root workspace config
└── bun.lock
```

## Getting Started

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [Bun](https://bun.sh) | ≥ 1.3 | Package manager & runtime |
| [Node.js](https://nodejs.org) | ≥ 18 | Fallback runtime |
| [PostgreSQL](https://www.postgresql.org) | ≥ 15 | Primary database |
| [Redis](https://redis.io) | ≥ 7.0 | Message queue (Streams support required) |

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/uptiq.git
cd uptiq

# Install all dependencies across the monorepo
bun install

# Generate the Prisma client
cd packages/store
bunx prisma generate
```

### Environment Variables

Each service requires its own `.env` file. Create them from the examples below:

**`packages/store/.env`**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/uptiq?schema=public"
```

**`apps/api/.env`**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/uptiq?schema=public"
JWT_SECRET="your-secret-key-min-32-chars"
```

**`apps/worker/.env`**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/uptiq?schema=public"
REDIS_URL="redis://localhost:6379"
REGION_ID="us-east-1"
WORKER_ID="worker-1"
```

**`apps/pusher/.env`**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/uptiq?schema=public"
REDIS_URL="redis://localhost:6379"
```

### Database Setup

```bash
# Navigate to the store package
cd packages/store

# Run migrations to create all tables
bunx prisma migrate dev

# (Optional) Seed the regions table
bunx prisma db seed
```

### Running Services

You can start all services simultaneously using Turborepo, or run them individually:

```bash
# Start everything (from the root)
bun run dev

# Or run individual services:

# Terminal 1 — API server
cd apps/api && bun run dev

# Terminal 2 — Frontend
cd apps/frontend && bun run dev

# Terminal 3 — Pusher (scheduler)
cd apps/pusher && bun run index.ts

# Terminal 4 — Worker
cd apps/worker && bun run index.ts
```

| Service | Port | Description |
|---------|------|-------------|
| Frontend | `3000` | Next.js dashboard & landing page |
| API | `8080` | Express REST API |
| Pusher | — | Cron job (no HTTP server) |
| Worker | — | Stream consumer (no HTTP server) |

## API Reference

All endpoints except auth routes require a `Bearer` token in the `Authorization` header.

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/user/signup` | Create account | ✗ |
| `POST` | `/user/signin` | Get JWT token | ✗ |
| `GET` | `/user/me` | Get current user | ✓ |

### Websites

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/website` | Add a monitor | ✓ |
| `GET` | `/websites` | List all monitors | ✓ |
| `GET` | `/website/:id` | Get monitor details + SSL status | ✓ |
| `DELETE` | `/website/:id` | Remove a monitor | ✓ |

**Example — Create a monitor:**
```bash
curl -X POST http://localhost:8080/website \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Google", "url": "https://google.com", "slug": "google"}'
```

## Frontend

The frontend is a Next.js 16 application with a premium dark-mode UI built for operational teams.

**Key features:**
- Lenis-powered smooth scrolling with GSAP ScrollTrigger animations
- Custom dual-element cursor with reactive hover states
- Magnetic UI interactions on navigation and CTA elements
- 3D perspective tilt on feature cards with cursor-tracking spotlights
- Scroll-triggered text reveal animations
- Interactive canvas particle grid background
- Protected dashboard with JWT auth and live monitor polling
- Glassmorphic design system with depth layering

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to the branch (`git push origin feat/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

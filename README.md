<div align="center">

# ⚡ Uptiq

### Distributed uptime monitoring platform with multi-region health checks

Uptiq is a production-grade uptime monitoring system that decouples health checks from database writes using Redis Streams as a message broker, enabling horizontally scalable worker deployments across any geographic region.

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)](https://turbo.build/repo)
[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)

</div>

---

# About

Most uptime monitoring tools are monolithic. The same process that pings external websites also writes to the database, manages alerts, and serves the dashboard. This architecture breaks down at scale — database bottlenecks, single points of failure, and no regional awareness.

Uptiq was designed from the ground up as a distributed system.

Every concern is isolated into its own service:
- A **Pusher** queries the database for active monitors and enqueues check jobs into Redis.
- **Workers** consume those jobs, perform HTTP health checks, and push results back into a separate Redis stream — without ever touching the database.
- A **DB Writer** batch-consumes results from Redis, writes them to PostgreSQL in transactions, manages incident state machines, and dispatches email alerts.

This separation means you can deploy 50 workers across 10 global regions and the database still only receives writes from a single batched writer. The system scales horizontally without bottlenecking.

---

# Architecture

```mermaid
flowchart TD
    subgraph Client
        UI["Next.js Dashboard<br/>(Port 3000)"]
    end

    subgraph API
        REST["Express REST API<br/>(Port 8080)"]
    end

    subgraph Scheduler
        PUSH["Pusher Service<br/>(Every 3 min)"]
    end

    subgraph Message Broker
        CS{{"Redis Stream<br/>uptiq:checks"}}
        DBS{{"Redis Stream<br/>uptiq:db-write"}}
    end

    subgraph Workers
        W1["Worker — us-east"]
        W2["Worker — eu-west"]
        W3["Worker — ap-south"]
    end

    subgraph Persistence
        DBWR["DB Writer Service"]
        PG[("PostgreSQL")]
    end

    subgraph Alerting
        SMTP["SMTP Email"]
    end

    UI <-->|"JWT Auth"| REST
    REST <-->|"Prisma ORM"| PG

    PUSH -->|"Read active websites"| PG
    PUSH -->|"xAdd jobs"| CS

    CS -->|"xReadGroup"| W1
    CS -->|"xReadGroup"| W2
    CS -->|"xReadGroup"| W3

    W1 -.->|"HTTP GET"| EXT1((Target Site))
    W2 -.->|"HTTP GET"| EXT2((Target Site))
    W3 -.->|"HTTP GET"| EXT3((Target Site))

    W1 -->|"xAdd results"| DBS
    W2 -->|"xAdd results"| DBS
    W3 -->|"xAdd results"| DBS

    DBS -->|"xReadGroup batch"| DBWR
    DBWR -->|"$transaction"| PG
    DBWR -.->|"Incident alerts"| SMTP
```

---

# How It Works

## Step-by-step data flow

1. **Pusher** wakes up every 3 minutes, queries PostgreSQL for all active websites, and enqueues each one as a job into the `uptiq:checks` Redis Stream.

2. **Workers** are organized into Consumer Groups by region (`us-east`, `eu-west`, etc.). Each worker calls `xReadGroup` to claim jobs, performs an HTTP GET against the target URL, records the response time and status code, and pushes the result into the `uptiq:db-write` Redis Stream.

3. **DB Writer** reads from `uptiq:db-write` in batches of 50, then executes a single Prisma `$transaction` that:
   - Inserts all `WebsiteTick` records (the raw health check data)
   - Upserts each website's `WebsiteStatusCurrent` (current status, consecutive fails, last response time)
   - Opens new `Incident` records when a site transitions from UP → DOWN
   - Resolves existing incidents when a site transitions from DOWN → UP
   - Checks SSL certificates via TLS socket inspection and stores expiration data

4. **Alerting** — After each batch, the DB Writer fires email alerts through SMTP for any state transitions (DOWN, RECOVERED, SSL_EXPIRING). Alerts include built-in deduplication and a 24-hour cooldown for SSL warnings.

### Why Redis Streams?

Redis Streams with Consumer Groups provide exactly-once delivery semantics, automatic load balancing across workers, and built-in stuck-job reclamation (`XCLAIM`). If a worker crashes mid-check, another worker in the same region automatically picks up the abandoned job after 60 seconds.

---

# Features

## 🌐 Multi-Region Distributed Health Checks

Workers can be deployed to any region in the world. Each worker identifies itself with a `REGION_ID` and `WORKER_ID`, and the DB Writer automatically registers new regions in the database on startup via upsert.

- Horizontally scalable via Redis Consumer Groups
- Automatic stuck-job reclamation every 30 seconds
- Millisecond-precision response time telemetry
- Status tracking: `UP`, `DOWN`, `UNKNOWN`, `REGIONAL_ANOMALY`

---

## 🔒 Automated SSL Certificate Monitoring

The DB Writer inspects SSL certificates in real-time using native Node.js `tls` sockets during each batch cycle.

- Extracts certificate issuer, valid-from, valid-until dates
- Calculates days remaining until expiration
- Triggers `SSL_EXPIRING` alerts when certificates drop below 14 days
- Works automatically for any `https://` monitored URL

---

## 🚨 Incident Detection & State Machine

Uptiq implements a deterministic state machine for incident lifecycle management.

- Automatically opens incidents when status transitions from `UP` → `DOWN`
- Records the failure reason and timestamp
- Automatically resolves incidents when status transitions from `DOWN` → `UP`
- Calculates incident duration in seconds
- Tracks consecutive failure count per website

---

## 📧 Smart Email Alerting

Alert channels are configurable per-user and support deduplication logic to prevent alert fatigue.

- Email alerts for `DOWN`, `RECOVERED`, and `SSL_EXPIRING` events
- Duplicate suppression: won't send repeated DOWN alerts for the same ongoing outage
- 24-hour cooldown for SSL expiration warnings
- Configurable SMTP transport (Gmail, SendGrid, AWS SES, Resend)

---

## 🎨 Premium Dashboard UI

The frontend is a dark-mode Next.js application with GSAP animations and Recharts telemetry graphs.

- Dark mode-first design (`#09090b`)
- Glassmorphic sidebar navigation
- Real-time response time area charts
- Uptime status grid with per-region breakdown
- Incident timeline with live/resolved indicators
- GSAP staggered panel animations
- Auto-refresh every 30 seconds

---

# Project Structure

```
betteruptime/
├── apps/
│   ├── api/            # Express REST API (auth, CRUD, JWT)
│   ├── frontend/       # Next.js dashboard (Tailwind, GSAP, Recharts)
│   ├── pusher/         # Cron scheduler — enqueues check jobs
│   ├── worker/         # Health check executor — pings websites
│   └── dbwriter/       # Batch writer — persists results, fires alerts
├── packages/
│   ├── store/          # Prisma schema, client, generated types
│   ├── redisstream/    # Redis Streams wrapper (xAdd, xReadGroup, xClaim)
│   ├── ui/             # Shared UI components
│   └── typescript-config/
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.frontend
│   ├── Dockerfile.pusher
│   ├── Dockerfile.worker
│   └── Dockerfile.dbwriter
└── docker-compose.yml  # Full stack orchestration
```

---

# Getting Started

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Bun](https://bun.sh/) (for local development)

## Run with Docker

```bash
git clone https://github.com/princeeeeeej/Uptiq.git
cd Uptiq
```

Create a `.env` file in the root:

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/uptiq
REDIS_URL=redis://redis:6379
JWT_SECRET=your-secret-key
REGION_ID=global
WORKER_ID=worker-1
```

Create a `.env` file in `packages/store/`:

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/uptiq
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=uptiq
```

Start everything:

```bash
docker compose up --build
```

The dashboard will be available at `http://localhost:3000` and the API at `http://localhost:8080`.

## Run Locally (Development)

```bash
bun install
bun run dev
```

---

# Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Bun |
| **Language** | TypeScript |
| **Frontend** | Next.js, Tailwind CSS, GSAP, Recharts |
| **API** | Express.js, JWT, bcrypt |
| **Database** | PostgreSQL, Prisma ORM |
| **Message Broker** | Redis Streams |
| **Alerting** | Nodemailer (SMTP) |
| **Monorepo** | Turborepo |
| **Containerization** | Docker, Docker Compose |

---

# API Endpoints

## Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/user/signup` | Create a new account |
| `POST` | `/user/signin` | Sign in and receive a JWT |
| `GET` | `/user/me` | Get current user info |

## Monitors

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/website` | Add a new monitor |
| `GET` | `/websites` | List all monitors for the user |
| `GET` | `/website/:id` | Get monitor details (status, SSL, response time) |
| `GET` | `/website/:id/ticks` | Get last 50 health check ticks |
| `GET` | `/website/:id/incidents` | Get incidents for a monitor |
| `DELETE` | `/website/:id` | Delete a monitor and all its data |

## Incidents & Alerts

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/incidents` | List all incidents across monitors |
| `GET` | `/alert-channels` | List configured alert channels |
| `POST` | `/alert-channels` | Add an email alert channel |
| `DELETE` | `/alert-channels/:id` | Remove an alert channel |

All endpoints except signup/signin require a `Bearer` token in the `Authorization` header.

---

# Environment Variables

| Variable | Where | Description |
|---|---|---|
| `DATABASE_URL` | Root `.env` & `packages/store/.env` | PostgreSQL connection string |
| `REDIS_URL` | Root `.env` | Redis connection string |
| `JWT_SECRET` | Root `.env` | Secret key for JWT token signing |
| `REGION_ID` | Root `.env` | Region identifier for workers (e.g. `global`, `us-east`) |
| `WORKER_ID` | Root `.env` | Unique worker instance ID |
| `POSTGRES_USER` | `packages/store/.env` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `packages/store/.env` | PostgreSQL password |
| `POSTGRES_DB` | `packages/store/.env` | PostgreSQL database name |
| `SMTP_HOST` | Root `.env` (optional) | Email server hostname |
| `SMTP_PORT` | Root `.env` (optional) | Email server port (default: 587) |
| `SMTP_USER` | Root `.env` (optional) | Email server username |
| `SMTP_PASS` | Root `.env` (optional) | Email server password |
| `SMTP_FROM` | Root `.env` (optional) | From address for alert emails |

---

# Database Schema

```mermaid
erDiagram
    User ||--o{ Website : owns
    User ||--o{ AlertChannel : configures
    Website ||--o{ WebsiteTick : "has checks"
    Website ||--o| WebsiteStatusCurrent : "has status"
    Website ||--o| WebsiteSSLStatus : "has SSL"
    Website ||--o{ Incident : "has incidents"
    Website ||--o{ AlertEvent : triggers
    AlertChannel ||--o{ AlertEvent : receives
    Region ||--o{ WebsiteTick : tracks

    User {
        string id PK
        string username UK
        string password
        datetime createdAt
    }

    Website {
        string id PK
        string userId FK
        string name
        string url
        string slug UK
        boolean isActive
    }

    Region {
        string id PK
        string code UK
        string name
    }

    WebsiteTick {
        string id PK
        string websiteId FK
        string regionId FK
        enum status
        int responseTimeMs
        int statusCode
        string errorMessage
        datetime checkedAt
    }

    WebsiteStatusCurrent {
        string websiteId PK
        enum currentStatus
        int consecutiveFails
        datetime lastCheckedAt
        int lastResponseTimeMs
    }

    WebsiteSSLStatus {
        string websiteId PK
        string issuer
        datetime validFrom
        datetime validUntil
        int daysRemaining
    }

    Incident {
        string id PK
        string websiteId FK
        datetime startedAt
        datetime resolvedAt
        string reason
        int durationSeconds
    }

    AlertChannel {
        string id PK
        string userId FK
        enum type
        json config
        boolean isActive
    }

    AlertEvent {
        string id PK
        string websiteId FK
        string alertChannelId FK
        enum eventType
        datetime createdAt
    }
```

---

# 🧠 Key Engineering Decisions

## Why Redis Streams over a simple queue?

Redis Streams provide Consumer Groups with built-in load balancing, message acknowledgment, and pending entry tracking. If a worker crashes mid-check, another worker in the same Consumer Group automatically reclaims the abandoned message after 60 seconds via `XCLAIM`. This gives us at-least-once delivery guarantees without the complexity of RabbitMQ or Kafka.

## Why separate DB Writer from Workers?

Workers are deployed at the edge — they need to be fast, stateless, and close to the target websites. They should never wait on database round-trips. By routing results through a Redis Stream and having a dedicated DB Writer batch-insert them, we:
- Eliminate database connection pooling issues at scale
- Enable atomic `$transaction` writes (ticks + status + incidents in one commit)
- Keep workers truly stateless and horizontally scalable

## Why Prisma `$transaction` for batch writes?

Each batch from the DB Writer produces multiple interdependent writes: tick records, status upserts, incident creation/resolution, and SSL status updates. Wrapping them in a single `$transaction` ensures atomicity — either all writes succeed or none do, preventing inconsistent state.

---

<div align="center">

Built by [Prince Jaiswal](https://github.com/princeeeeeej)

</div>


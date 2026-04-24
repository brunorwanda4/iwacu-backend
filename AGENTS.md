# AGENTS.md — Iwacu Backend

Iwacu is a Rwandan civic platform connecting citizens to their government leaders,
local announcements, and community features. Login is by Rwanda National ID only.
This is an MVP — built to demo to the Ministry of ICT and Innovation.

---

## Runtime

**Bun** — not Node, not npm. Always use `bun` for every command.

```bash
bun install
bun run start:dev
bun prisma:migrate
bun prisma:seed
```

---

## Stack

NestJS 10 · Prisma 5 · PostgreSQL 15 · JWT auth · Bun runtime

---

## How the App Works

Rwanda has a 5-level admin hierarchy: **Province → District → Sector → Cell → Village**.
Every citizen, leader, and announcement is linked to a location in this tree.

Every citizen has two locations:
- **Home** — their registered village (from National ID)
- **Current** — detected by GPS on the phone

The app shows leaders and announcements for **both locations at once**.
That dual-location feature is the most important thing to demo to the Ministry.

---

## MVP Decisions — Read Before Changing Anything

These are intentional simplifications. Do not "fix" them.

| What | MVP decision | Real version (post-approval) |
|---|---|---|
| Login | Lookup nationalId in local DB | Connect to real NIDA government API |
| NIDA auth | Simulated with seed data | Biometric + official API |
| Notifications | Not built | Push via FCM |
| Neighbour chat | Not built | WebSocket module |
| All 30 districts | Only Gasabo + Muhanga seeded | Full Rwanda dataset |
| Visitor registration | Basic fields only | Linked to Police API |
| Umuganda | Announcement with `category="umuganda"` | No separate table needed |

---

## Security

**Auth flow:** National ID → JWT access token (15 min) + refresh token (7 days in DB).

Rules to follow:
- Never expose `refreshToken` or `sessionId` in GET responses
- Never return the full `citizen` row — always use a DTO that excludes sensitive fields
- `JwtAuthGuard` is applied per controller, not globally — `/auth/*` must stay public
- Validate `expiresAt` on the Session row before issuing a new access token
- On logout, delete the Session row — do not just let it expire
- Never log `nationalId` or tokens anywhere in console output

---

## Performance

The two queries that run on every app load must stay fast:

**1. Leaders walk-up** — traverses the location tree from village to province in a loop.
Maximum 5 Prisma queries (one per level). Do not do more than that.

**2. Announcements ancestor query** — fetches announcements for a citizen's village
AND all ancestor locations in one Prisma `findMany` with `locationId IN [...]`.
Never do one query per level. Collect all ancestor IDs first, then one query.

General rules:
- Always paginate announcement queries (`skip` / `take`) — default limit 20
- Never use `findMany` without a `where` clause on a large table
- Use `select` to return only the fields the mobile app needs — not full rows
- The `Location` tree is static seed data — it never changes in MVP, so it is safe to cache in memory if needed

---

## Folder Rules

Each feature is a NestJS module. When adding code, stay inside the right module.
Do not put business logic in controllers — controllers only handle HTTP, services handle logic.

```
src/auth/          → login, refresh, logout, JWT strategy, guard
src/citizens/      → GET /citizens/me (current user profile)
src/leaders/       → GET /leaders?locationId= (walk-up directory)
src/locations/     → GET /locations/nearest?lat=&lng= (GPS detection)
src/announcements/ → GET /announcements?locationId= (ancestor query)
src/services/      → government department contacts + citizen requests
src/prisma/        → PrismaService only — do not add logic here
```

---

## Prisma Rules

- `schema.prisma` is the single source of truth — never edit the DB directly
- Run `bun prisma:migrate` after every model change
- Inject `PrismaService` — never import `PrismaClient` directly in feature files
- `seed.ts` covers Gasabo and Muhanga with realistic Rwandan names and real GPS coordinates — do not replace seed data with fake placeholder values
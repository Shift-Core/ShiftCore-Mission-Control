# Topology and Ownership

## Runtime Topology

```
Browser
  |
  v
Nginx Gateway          (infra/nginx) — only public entry point
  |
  |-- /                  -> apps/web
  |-- /api/identity/v1/* -> services/identity  -----> identity schema
  |-- /api/core/v1/*     -> services/core      -----> core schema
  |-- /api/ai/v1/*       -> services/ai
  |-- /health/*          -> Service readiness
  |
  +-- services/ai -------> services/core   (internal HTTP, Docker network)
```

PostgreSQL: single database `shiftcore`
- Schema `identity` (Identity API / EF Core)
- Schema `core`     (Core API / Prisma)
- No `ai` schema in this release

## Ownership Matrix

| Runtime Part | Path | Implementation Owner | Migration / Seed Owner | Internal Health | Public Gateway Health |
|---|---|---|---|---|---|
| PostgreSQL | `infra/postgres` | [Mohamed Sameh](https://github.com/mo7med20) | Mohamed Sameh (bootstrap) | `pg_isready` | N/A |
| Identity API | `services/identity` | [Mohamed Tawfik](https://github.com/tawfik0x00) | Mohamed Tawfik (EF Core) | `/health` | `/health/identity` |
| Core API | `services/core` | [Mohamed Mostafa](https://github.com/Cyb3R0xSASA) | Mohamed Mostafa (Prisma) | `/health` | `/health/core` |
| AI/Data API | `services/ai` | [Peter Adel](https://github.com/0PeterAdel) | N/A (non-persisted) | `/health` | `/health/ai` |
| React Web | `apps/web` | [Augesta Antar](https://github.com/augesta-antar) | N/A | `/health` | `/health/frontend` |
| Nginx Gateway | `infra/nginx` | [Mohamed Sameh](https://github.com/mo7med20) | N/A | N/A | Routes `/health/*` |

UI/UX design for the login and Mission Control screens was created by
[Salsabil Waleed](https://github.com/silawaleed02-sudo).

## Internal Ports

| Service   | Internal Port | Public Exposure        |
|-----------|---------------|------------------------|
| postgres  | 5432          | Local tooling only     |
| identity  | 5001          | Never (via Nginx)      |
| core      | 4000          | Never (via Nginx)      |
| ai        | 8000          | Never (via Nginx)      |
| web       | 3000          | Never (via Nginx)      |
| nginx     | 80            | Yes – sole entry point |

## Network

- Single internal bridge network: `shiftcore-net`
- Services communicate by Docker service name
- Browser must never use direct backend ports during acceptance

## Seeded Users (local-dev)

| Email                      | Role     | Purpose                    |
|----------------------------|----------|----------------------------|
| `lead@shiftcore.local`     | Lead     | Default MVP demo account   |
| `super@shiftcore.local`    | Super    | Platform-level access      |
| `core@shiftcore.local`     | Core     | Core API / workflow owner  |
| `identity@shiftcore.local` | Identity | Identity API / auth owner  |

The local password is configured through `SEED_DEFAULT_PASSWORD` in the ignored
root `.env` file. See the [Setup Guide](../setup.md).

# Topology & Ownership Matrix (R24-04 Bootstrap)

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

| Runtime Part     | Path                        | Dockerfile Owner   | Migration / Seed Owner     | Health Endpoint              |
|------------------|-----------------------------|--------------------|----------------------------|------------------------------|
| PostgreSQL       | `infra/postgres`            | Mohamed Sameh      | Mohamed Sameh (bootstrap)  | `pg_isready`                 |
| Identity API     | `services/identity`         | Mohamed Tawfik     | Mohamed Tawfik (EF Core)   | `/health/identity`           |
| Core API         | `services/core`             | Abo El Ala         | Abo El Ala (Prisma)        | `/health/core`               |
| AI/Data API      | `services/ai`               | Peter              | N/A (non-persisted)        | `/health/ai`                 |
| React Web        | `apps/web`                  | Web owner (TBD)    | N/A                        | `/health/frontend`           |
| Nginx Gateway    | `infra/nginx`               | Mohamed Sameh      | N/A                        | Nginx + `/health/*` proxy    |

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
| `super@shiftcore.local`    | Super    | Platform-level access      |
| `core@shiftcore.local`     | Core     | Core API / workflow owner  |
| `identity@shiftcore.local` | Identity | Identity API / auth owner  |

Password for all: `Password123!`

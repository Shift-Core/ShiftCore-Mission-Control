# ShiftCore Mission Control

Multi-service monorepo for the August 24 release architecture slice.

**Status:** R24-04 bootstrap baseline (contract only)  
**Architecture:** System Architecture v0.6 (August 6, 2026)  
**Database:** single PostgreSQL `shiftcore` with schemas `identity` + `core`  
**Public entry point:** Nginx only

## Runtime Parts

| Service        | Path                    | Stack            | Owner            |
|----------------|-------------------------|------------------|------------------|
| Web            | `apps/web`              | React            | Web owner        |
| Identity API   | `services/identity`     | ASP.NET Core     | Mohamed Tawfik   |
| Core API       | `services/core`         | Express.js       | Abo El Ala       |
| AI/Data API    | `services/ai`           | FastAPI          | Peter            |
| Nginx Gateway  | `infra/nginx`           | Nginx            | Mohamed Sameh    |
| PostgreSQL     | `infra/postgres`        | PostgreSQL 16    | Mohamed Sameh    |

## Quick Start

```bash
# 1. Initialize local environment (no secrets required)
./scripts/init-local-env.sh

# 2. Validate Compose contract only
docker compose config
```

Application Dockerfiles, migrations, and business logic are owned by the respective service owners and are out of scope for this bootstrap.

## Architecture Rules (enforced)

- Browser traffic enters **only** through Nginx.
- Backend ports remain internal.
- AI/Data receives `projectId` + `sprintId` and obtains authoritative data from Core over the internal network.
- No cross-schema foreign keys.
- AI preview is non-persisted (no `ai` schema in this release).
- Identity signs RS256 JWTs; Core and AI only verify.

## Seeded Users (local-dev)

| Email                     | Password       | Role     |
|---------------------------|----------------|----------|
| `super@shiftcore.local`   | `Password123!` | Super    |
| `core@shiftcore.local`    | `Password123!` | Core     |
| `identity@shiftcore.local`| `Password123!` | Identity |

## Ownership

See `docs/topology-and-ownership.md`.

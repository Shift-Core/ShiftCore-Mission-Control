# ShiftCore Mission Control: Local Setup Guide

Welcome to the ShiftCore Mission Control repository. This guide provides complete instructions for running the full stack locally.

---

## 1. Prerequisites

| Tool | Required Version | Notes |
|---|---|---|
| Docker | 24.x+ | With Compose v2 (`docker compose`) |
| .NET SDK | 8.0+ | Only needed for native IDE debugging |
| Git | Any | For cloning the repo |

---

## 2. Environment Variables (`.env`)

Before starting any services, configure your local environment file.

### Quick start
```bash
# Option A — automatic (recommended)
./scripts/init-local-env.sh

# Option B — manual
cp .env.example .env
```

### Full variable reference

| Variable | Default | Owner | Purpose |
|---|---|---|---|
| `POSTGRES_USER` | `shiftcore` | Sameh | Postgres superuser |
| `POSTGRES_PASSWORD` | `shiftcore_local_dev_only` | Sameh | Postgres superuser password |
| `POSTGRES_DB` | `shiftcore` | Sameh | Database name |
| `POSTGRES_PORT` | `5432` | Sameh | Host-mapped Postgres port |
| `IDENTITY_DB_USER` | `identity_app` | Sameh | App role for identity schema |
| `IDENTITY_DB_PASSWORD` | `identity_local_dev_only` | Sameh | App role password |
| `CORE_DB_USER` | `core_app` | Sameh | App role for core schema |
| `CORE_DB_PASSWORD` | `core_local_dev_only` | Sameh | App role password |
| `IDENTITY_PORT` | `5001` | Tawfik | Host-mapped Identity API port |
| `CORE_PORT` | `4000` | Abo El Ala | Host-mapped Core API port |
| `AI_PORT` | `8000` | Peter | Host-mapped AI API port |
| `NGINX_HTTP_PORT` | `80` | Sameh | Public Nginx port |
| `JWT_ISSUER` | `shiftcore-identity` | Tawfik | JWT `iss` claim value |
| `JWT_AUDIENCE` | `shiftcore-api` | Tawfik | JWT `aud` claim value |
| `JWT_PRIVATE_KEY_PATH` | `/run/secrets/jwt_private.pem` | Tawfik | Private key path inside container |
| `JWT_PUBLIC_KEY_PATH` | `/run/secrets/jwt_public.pem` | Tawfik | Public key path inside container |
| `SC_TOKEN_COOKIE_NAME` | `sc_token` | Tawfik | HttpOnly cookie name |
| `ASPNETCORE_ENVIRONMENT` | `Development` | Tawfik | .NET environment |
| `NODE_ENV` | `development` | Abo El Ala | Node environment |
| `PYTHON_ENV` | `development` | Peter | Python environment |
| `AI_PROVIDER` | `deterministic` | Peter | No real API key required |

> **Never commit real credentials.** The defaults above are local-dev only.

---

## 3. Generate JWT Keys

The Identity API signs JWT tokens with an RSA-256 private key. Generate local keys before starting:

```bash
./scripts/generate-jwt-keys.sh
```

This creates a `.secrets/` directory (gitignored) containing:
- `.secrets/jwt_private.pem` — used by the Identity API container only
- `.secrets/jwt_public.pem` — mounted into Core and AI containers for local verification

---

## 4. Run the Full Stack

```bash
docker compose up --build -d
```

| Container | Port | Role |
|---|---|---|
| `shiftcore-postgres` | `5432` | PostgreSQL database |
| `shiftcore-identity` | `5001` | Identity API (auth, JWT) |
| `shiftcore-core` | `4000` | Core API (tasks, projects) |
| `shiftcore-ai` | `8000` | AI/Data API (deterministic preview) |
| `shiftcore-web` | `3000` | React frontend |
| `shiftcore-nginx` | `80` | Public gateway — sole browser entry point |

**Useful commands:**
```bash
docker compose logs -f identity       # tail identity logs
docker compose ps                     # container status
docker compose down                   # stop all containers
docker compose down -v                # stop AND delete database volume (clean slate)
```

---

## 5. Smoke Test: Identity API

After `docker compose up` is healthy, verify the auth flow end to end:

```bash
# 1. Health check
curl -s http://localhost:5001/health/identity

# 2. Login (saves sc_token cookie)
curl -c cookies.txt -s -X POST http://localhost:5001/api/identity/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "super@shiftcore.local", "password": "Password123!"}'

# 3. Get current user profile (uses cookie)
curl -b cookies.txt -s http://localhost:5001/api/identity/v1/auth/me

# 4. Logout (clears cookie)
curl -b cookies.txt -c cookies.txt -s -X POST http://localhost:5001/api/identity/v1/auth/logout

# 5. Verify session is gone (should return AUTH_REQUIRED 401)
curl -b cookies.txt -s http://localhost:5001/api/identity/v1/auth/me
```

**Expected results:**

| Step | Status | Key Response Field |
|---|---|---|
| Health | `200` | `"status": "ok"` |
| Login | `200` | `"success": true` + `Set-Cookie: sc_token` |
| /me | `200` | `"success": true`, user profile in `data.user` |
| Logout | `200` | `"success": true`, `"data": {}` |
| /me (post logout) | `401` | `"errorCode": "AUTH_REQUIRED"` |

---

## 6. Local .NET Debugging (without Docker)

If you want to run the Identity API natively (e.g., in Visual Studio or Rider):

1. Start only the database:
   ```bash
   docker compose up -d postgres
   ```

2. Run the API:
   ```bash
   cd services/identity
   dotnet run
   ```

The `appsettings.Development.json` is pre-configured to connect to the local Postgres instance:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=shiftcore;Username=identity_app;Password=identity_local_dev_only;Search Path=identity"
  }
}
```

> If you change the password in `.env`, update `appsettings.Development.json` too.

---

## 7. Default Seeded Users (Local Development)

On first start, the Identity API automatically creates these users via EF Core migration.  
**Password for all accounts: `Password123!`**

| Email | Role | Purpose |
|---|---|---|
| `super@shiftcore.local` | Super | Platform-level access |
| `core@shiftcore.local` | Core | Core API / workflow owner |
| `identity@shiftcore.local` | Identity | Identity API / auth owner |

---

## 8. Architecture Overview

```
Browser
  |
  v
Nginx (port 80)          ← sole public entry point
  |
  |-- /                      → apps/web         (React)
  |-- /api/identity/v1/*     → services/identity (.NET 8)  → identity schema (PostgreSQL)
  |-- /api/core/v1/*         → services/core    (Node.js)  → core schema    (PostgreSQL)
  |-- /api/ai/v1/*           → services/ai      (Python)   → deterministic only
  |-- /health/*              → service health endpoints
```

**Single PostgreSQL database `shiftcore`:**
- Schema `identity` — owned by `identity_app`, managed by EF Core migrations
- Schema `core` — owned by `core_app`, managed by Prisma migrations

See `docs/topology-and-ownership.md` for the complete ownership matrix.

---

## 9. Secrets Management

| What | Where | Status |
|---|---|---|
| JWT private key | `.secrets/jwt_private.pem` | Gitignored — generate with `./scripts/generate-jwt-keys.sh` |
| JWT public key | `.secrets/jwt_public.pem` | Gitignored — auto-generated |
| DB passwords | `.env` | Gitignored — copy from `.env.example` |
| BCrypt hashes | `infra/postgres/bootstrap/001-schemas-and-roles.sql` | OK — hashes only, no plain text |

> **Rule:** No plain-text passwords, private keys, or real provider credentials ever enter Git.

# ShiftCore Mission Control Setup Guide

This is the canonical guide for configuring, building, running, verifying, and
stopping the complete ShiftCore Mission Control stack.

## Prerequisites

Install the following before continuing:

- Git
- Docker Desktop on Windows/macOS, or Docker Engine with the Compose plugin on
  Linux
- At least 4 GB of memory available to Docker
- `curl` for the optional command-line verification examples
- OpenSSL for local JWT-key generation

Make sure ports `80` and `5432` are available. You can change their host-side
values in `.env` when necessary.

All commands in this guide are run from the repository root unless stated
otherwise.

## 1. Create the Local Environment File

The committed `.env.example` contains local-development defaults only. Never
commit the generated `.env` file or real credentials.

### Linux and macOS

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Review `.env` before starting the stack. If you change
`SEED_DEFAULT_PASSWORD`, use the new value when signing in.

To enable the protected AI Swagger page, set a non-empty local value for
`AI_DOCS_ACCESS_KEY`. Do not share URLs or screenshots containing that value.

## 2. Generate the RS256 Keys

JWT key files are local secrets and are ignored by Git. Do not commit or share
them.

### Linux and macOS

```bash
./scripts/generate-jwt-keys.sh
```

If the script is not executable:

```bash
chmod +x ./scripts/generate-jwt-keys.sh
./scripts/generate-jwt-keys.sh
```

### Windows PowerShell

OpenSSL must be available in `PATH`, then run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\generate-jwt-keys.ps1
```

Both scripts preserve existing keys. Pass `--force` on Linux/macOS or `-Force`
on Windows only when you intentionally want to replace them. Replacing keys
invalidates existing sessions and requires restarting the affected containers.

## 3. Build and Start the Stack

```bash
docker compose up -d --build
```

Wait until the runtime services report healthy and the one-shot Identity
migration and seed containers have completed:

```bash
docker compose ps
```

## 4. Seed the Core Demo Data

Identity is migrated and seeded automatically during startup. Core demo data is
seeded explicitly and the command is safe to run repeatedly:

```bash
docker compose exec core yarn db:seed
```

## 5. Open and Verify the Application

Open the application through Nginx:

```text
http://localhost
```

If you changed `NGINX_HTTP_PORT`, include that port in the URL.

Sign in with the seeded Lead account:

```text
Email:    lead@shiftcore.local
Password: value of SEED_DEFAULT_PASSWORD in .env
```

Check the public service health endpoints:

```bash
curl -f http://localhost/health/frontend
curl -f http://localhost/health/identity
curl -f http://localhost/health/core
curl -f http://localhost/health/ai
```

On Linux/macOS, the repository smoke test validates the Compose contract and
checks live health endpoints when the stack is running:

```bash
./scripts/smoke-test.sh
```

On Windows PowerShell:

```powershell
Invoke-WebRequest http://localhost/health/frontend -UseBasicParsing
Invoke-WebRequest http://localhost/health/identity -UseBasicParsing
Invoke-WebRequest http://localhost/health/core -UseBasicParsing
Invoke-WebRequest http://localhost/health/ai -UseBasicParsing
```

## 6. View Logs

Follow all service logs:

```bash
docker compose logs -f
```

Follow one service only:

```bash
docker compose logs -f core
docker compose logs -f identity
docker compose logs -f ai
docker compose logs -f web
docker compose logs -f nginx
```

Press `Ctrl+C` to stop following logs; the containers keep running.

## 7. Rebuild After Changes

Rebuild the complete stack:

```bash
docker compose up -d --build
```

Rebuild one service:

```bash
docker compose up -d --build core
```

Replace `core` with `identity`, `ai`, or `web` as needed.

## 8. Stop the Stack

Stop and remove containers while preserving PostgreSQL data:

```bash
docker compose down
```

## Reset Local Data

The following command permanently deletes the local PostgreSQL volume and all
local application data:

```bash
docker compose down -v
```

After a reset, build and start the stack again, then rerun the Core seed.

## Common Problems

### JWT key files are missing

Generate the keys using the command for your operating system in step 2, then
restart the stack:

```bash
docker compose down
docker compose up -d --build
```

### Port 80 or 5432 is already in use

Change `NGINX_HTTP_PORT` or `POSTGRES_PORT` in `.env`, then restart the stack.
For example, with `NGINX_HTTP_PORT=8080`, open `http://localhost:8080`.

### A service is unhealthy

Inspect its status and logs:

```bash
docker compose ps
docker compose logs <service-name>
```

### Login fails after changing the seed password

Existing users keep their stored password hash. To recreate local seed data
with the new password, reset the local volume using `docker compose down -v`,
then start and seed the stack again.

### Core data is empty

Run the explicit Core seed:

```bash
docker compose exec core yarn db:seed
```

## Optional AI API Documentation

When `AI_DOCS_ACCESS_KEY` is configured, open:

```text
http://localhost/api/docs?key=<your-local-docs-access-key>
```

The documentation key grants access only to API documentation. It does not
authenticate application API requests.

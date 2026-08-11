# Identity API Service

ASP.NET Core 8 Identity service for ShiftCore Mission Control.
Handles authentication, session management, and the release User schema.

**Owner:** Mohamed Tawfik | **Schema:** `identity` (PostgreSQL)

---

## Local Development

### Prerequisites

- .NET 8 SDK
- PostgreSQL running (or `docker compose up postgres`)
- `dotnet-ef` tool: `dotnet tool install --global dotnet-ef`

### Step 1 — Restore & Build

```bash
cd services/identity
dotnet restore
dotnet build
```

### Step 2 — Apply Migrations

Migrations are **never** applied automatically on startup. Run explicitly:

```bash
dotnet ef database update
```

This creates the `identity.users` table with all constraints:
- `id` UUID PK
- `full_name`, `email`, `password_hash`, `role`, `team_id`, `is_active`
- `uq_user_email_ci` — case-insensitive unique index on `email` (DM-C01)
- UTC timestamps (`created_at`, `updated_at`)

### Step 3 — Seed (Release Lead Account)

Set the seed password as an environment variable first. **Never commit the password.**

```bash
export SEED_LEAD_PASSWORD=<your-secure-password>
dotnet run --project services/identity -- --seed
```

The seed command:
- Creates one active Lead user (`lead@shiftcore.local`, role `Lead`)
- Uses `team_id = 3b5f3ec5-cc27-4d68-8f4d-d80545d6b9c1` (matches Core release seed)
- Is idempotent — safe to re-run, no duplicate users created
- Stores a real BCrypt hash (cost 11) — no plaintext is ever stored

### Step 4 — Run

```bash
dotnet run
```

Or via Docker Compose from repo root:

```bash
docker compose up --build identity
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | Yes | PostgreSQL connection string |
| `SEED_LEAD_PASSWORD` | Seed only | Password for the release Lead account — set at seed time, never commit |

See `.env.example` at the repo root for safe local defaults.

---

## API Reference

All endpoints return the standard envelope:

```json
{ "success": true, "message": "...", "data": { ... } }
{ "success": false, "message": "...", "errorCode": "...", "traceId": "..." }
```

### Health

| Method | Path | Auth |
|---|---|---|
| `GET` | `/health` | No |

```bash
curl -fsS http://localhost:5001/health
```

### Login

| Method | Path | Auth |
|---|---|---|
| `POST` | `/api/identity/v1/auth/login` | No |

```bash
# Replace <password> with your SEED_LEAD_PASSWORD value (never commit this)
curl -c cookies.txt -s -X POST http://localhost:5001/api/identity/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "lead@shiftcore.local", "password": "<password>"}'
```

**Success response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "expiresAt": "2026-08-11T12:00:00.000Z",
    "user": {
      "id": "aaaaaaaa-0000-4000-8000-000000000001",
      "name": "Demo Lead",
      "email": "lead@shiftcore.local",
      "role": "Lead",
      "teamId": "3b5f3ec5-cc27-4d68-8f4d-d80545d6b9c1"
    }
  }
}
```

**Error (401):**

```json
{
  "success": false,
  "message": "Sign-in failed. Check your details or contact the workspace administrator.",
  "errorCode": "AUTH_INVALID",
  "traceId": "0HN123ABCD"
}
```

### Get Profile (`/me`)

| Method | Path | Auth |
|---|---|---|
| `GET` | `/api/identity/v1/auth/me` | Cookie required |

```bash
curl -b cookies.txt -s http://localhost:5001/api/identity/v1/auth/me
```

### Logout

| Method | Path | Auth |
|---|---|---|
| `POST` | `/api/identity/v1/auth/logout` | Cookie required |

```bash
curl -b cookies.txt -s -X POST http://localhost:5001/api/identity/v1/auth/logout
```

---

## Database Schema

Managed by EF Core migrations. Table: `identity.users`.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, `DEFAULT gen_random_uuid()` |
| `team_id` | `uuid` | NOT NULL |
| `full_name` | `varchar(255)` | NOT NULL |
| `email` | `varchar(255)` | NOT NULL |
| `password_hash` | `text` | NOT NULL (BCrypt cost 11) |
| `role` | `varchar(50)` | NOT NULL |
| `is_active` | `boolean` | NOT NULL, DEFAULT true |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `timezone('utc', now())` |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `timezone('utc', now())` |

**Constraint `uq_user_email_ci`:** `CREATE UNIQUE INDEX ON identity.users (LOWER(email))` (DM-C01)

---

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for sequence diagrams and layer responsibilities.

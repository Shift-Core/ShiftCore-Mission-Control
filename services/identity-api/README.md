# Identity API Service

This is the ASP.NET Core Identity API for ShiftCore Mission Control. It owns identity, access, roles, permissions, and account status (MVP R24).

## Configuration

**Environment Variables:**
- `ConnectionStrings__DefaultConnection`: PostgreSQL connection string.
- `ASPNETCORE_ENVIRONMENT`: E.g., `Development` or `Production`.

## Local Development (Docker)
The easiest way to run this is from the root using Docker Compose:
```bash
docker compose up --build
```
This automatically handles database migration and seeds an active `Lead` account:
- **Email**: `lead@shiftcore.local`
- **Password**: `dummy_hash_pass`

## Commands
Run these commands from the `services/identity-api` folder:

- **Restore dependencies**: `dotnet restore`
- **Build**: `dotnet build`
- **Start Locally**: `dotnet run` (Requires postgres running locally on port 5432)

## Health
Check health at: `GET /health/identity`

# Identity Service: Local Setup & Development Guide

This guide is for developers who are specifically modifying or debugging the **Identity API** natively. If you just want to run the whole ShiftCore project, use the [root SETUP.md](../../SETUP.md) instead.

---

## 1. Prerequisites for Native Development

To run the Identity API locally without Docker, you need:
- **.NET 8 SDK**
- **Docker Compose** (to run the PostgreSQL database locally)
- An IDE like **Visual Studio**, **JetBrains Rider**, or **VS Code** with the C# Dev Kit.

---

## 2. Setting Up the Database

The Identity API requires a PostgreSQL database. The easiest way to get this is to run the project's infrastructure via Docker from the repository root:

```bash
# Go to the repository root
cd ../../

# Start just the database
docker compose up -d postgres
```

> **Note:** The database container is automatically provisioned with the `shiftcore` database and the `identity_app` role necessary for this service.

---

## 3. JWT Keys Setup

The Identity API uses RSA-256 keys to sign JWTs. You must generate them locally.

```bash
# Go to the repository root
cd ../../

# Run the key generator script
./scripts/generate-jwt-keys.sh
```

This creates a `.secrets` folder in the repo root containing `jwt_private.pem` and `jwt_public.pem`.

---

## 4. Application Configuration

The Identity API uses `appsettings.Development.json` for local native development.

By default, the connection string in `appsettings.Development.json` is configured to connect to your local Docker Postgres container using the default seeded credentials:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=shiftcore;Username=identity_app;Password=identity_local_dev_only;Search Path=identity"
  }
}
```

If you changed the `IDENTITY_DB_PASSWORD` in your root `.env` file, **you must also update it here**.

---

## 5. Running the Application

Navigate to the `services/identity` directory:

```bash
cd services/identity
```

Run the application using the .NET CLI:

```bash
dotnet restore
dotnet build
dotnet run
```

The application will start on **`http://localhost:5001`** (as configured in `Properties/launchSettings.json`).

*When the application starts, EF Core will automatically run migrations and seed the default users into the database.*

---

## 6. Managing EF Core Migrations

The database schema for the Identity service is managed by Entity Framework (EF) Core Code-First migrations.

If you modify the `Models/User.cs` or `Data/ApplicationDbContext.cs`, you must generate a new migration.

### Installing EF Core Tools
If you haven't already, install the EF Core CLI tools globally:
```bash
dotnet tool install --global dotnet-ef
```

### Adding a new Migration
To add a new migration after changing the model:
```bash
dotnet ef migrations add <MigrationName>
```

### Applying Migrations
Migrations are applied automatically when the application starts (in `Program.cs`), but you can apply them manually if needed:
```bash
dotnet ef database update
```

### Resetting the Database
If your local database gets into a bad state, you can tear it down completely from the repo root:
```bash
cd ../../
docker compose down -v  # WARNING: Deletes all data in Postgres
docker compose up -d postgres
```
Then restart the Identity API to recreate the tables and re-seed the users.

---

## 7. IDE Configuration Notes

- **Visual Studio:** Open the `IdentityApi.csproj` (or solution if one exists). Select the "http" launch profile.
- **VS Code:** A `launch.json` is not provided by default. You can let OmniSharp or the C# Dev Kit generate one for you, or just use `dotnet run` in the integrated terminal.

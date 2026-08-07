# ShiftCore Mission Control: Local Setup Guide

Welcome to the ShiftCore Mission Control repository! This guide provides clear instructions on how to set up your local development environment.

## 1. Environment Variables Setup (`.env`)

Before starting any services, you need to configure your local environment variables. We use an `.env` file to keep secrets out of source control.

1. At the root of the repository, you will find a file named `.env.example`.
2. **Copy this file** and rename the copy to `.env`. 
   - **Linux/macOS command:**
     ```bash
     cp .env.example .env
     ```
   - **Windows (PowerShell) command:**
     ```powershell
     Copy-Item .env.example .env
     ```
3. Open the newly created `.env` file and ensure the database credentials match your local setup. The defaults are already configured to work perfectly out-of-the-box for local development.

---

## 2. Running Services with Docker Compose

We use `docker compose` to ensure everyone has a consistent local infrastructure (like PostgreSQL databases) without installing them directly on their machines. 

### To start everything using Docker:
Run the following command in the **root of the repository**:
```bash
docker compose up --build -d
```
- The `--build` flag ensures your local code changes are built into the container.
- The `-d` flag runs the containers in the background ("detached" mode).

**What happens?**
- **Gateway (`nginx`)** will start on port `80`. It routes traffic to the web app and APIs.
- **Web App (`web`)** serves the Vite React application.
- **Identity API (`identity`)** waits for the database, auto-creates tables, and seeds the `Lead` account.
- **Core API (`core`)** provides task/project data.
- **AI/Data API (`ai`)** runs in deterministic mode.
- **PostgreSQL (`postgres`)** will start and expose port `5432`.

**To view logs:**
```bash
docker compose logs -f identity
```

**To stop services:**
```bash
docker compose down
```

---

## 3. Local .NET Development (`appsettings.Development.json`)

If you prefer to debug the Identity API natively on your machine (e.g., using Visual Studio, Rider, or VS Code) instead of running it inside Docker, you must configure the `.NET` configuration files.

1. Ensure your PostgreSQL database is running via Docker: `docker compose up -d postgres`.
2. Navigate to `services/identity/appsettings.Development.json` (or equivalent configuration in src).
3. You will see a `ConnectionStrings` block like this:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=shiftcore_identity;Username=shiftcore;Password=shiftcore_pass"
     }
   }
   ```
4. **How it works:** When you run `dotnet run` (or hit F5 in your IDE) inside the `identity` folder, ASP.NET automatically loads settings from `appsettings.Development.json`. It will use this `DefaultConnection` to connect to the Postgres database exposed on your `localhost`.
5. If you change your database password in the `.env` file, **you must also update it here** in `appsettings.Development.json` for local debugging to work!

**Run the API locally:**
```bash
cd services/identity
dotnet run
```

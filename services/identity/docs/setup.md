# Local Environment Setup

This document covers how to initialize and run the Identity Service locally. 

## 1. Initializing Local Variables
The service expects variables provided by the root `.env` file. To initialize:
1. Copy the example file at the root:
   ```bash
   cp .env.example .env
   ```
2. By default, it contains a pre-configured seeding password for initial users: `SEED_DEFAULT_PASSWORD=local_dev_only_change_me`.

## 2. Generating JWT Keys (Docker Secrets)
The Identity Service signs tokens using an RSA4096 private key. To maintain security, these keys are **not** stored in Git. You must generate them locally:

```bash
# Run from the root of the repository
./scripts/generate-jwt-keys.sh
```
*This will create `jwt_private.pem` and `jwt_public.pem` in a `/secrets` folder at the root. Docker Compose will automatically mount these to the containers as Docker Secrets at `/run/secrets/jwt_private`.*

## 3. Booting the Infrastructure
We use Docker Compose to handle the database, migrations, and the seeder automatically.

```bash
# Build and run the entire stack in the background
docker compose up --build -d
```

### What happens during boot?
1. **postgres**: The database spins up and runs the `infra/postgres/bootstrap/` SQL scripts to create roles.
2. **identity-migrations**: A one-shot container boots up, applies all EF Core migrations, and then safely exits.
3. **identity-seed**: A one-shot container boots up, reads the `SEED_DEFAULT_PASSWORD`, seeds the base users, records the action in the `identity.seed_history` table, and safely exits.
4. **identity**: The actual API spins up and begins listening for requests on port 5001.

## 4. Local Verification
Once the stack is running, you can test authentication through the Nginx gateway using the default seeded `lead` user:

```bash
# Request a login token
curl -s -c cookies.txt -X POST http://localhost/api/identity/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"lead@shiftcore.local","password":"local_dev_only_change_me"}'

# Test authentication
curl -s -b cookies.txt http://localhost/api/identity/v1/auth/me
```

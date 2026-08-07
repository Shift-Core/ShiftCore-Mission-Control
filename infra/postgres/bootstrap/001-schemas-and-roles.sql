-- =============================================================================
-- ShiftCore release bootstrap (R24-04)
-- Infrastructure owner: Mohamed Sameh
-- Runs only on first PostgreSQL volume initialization.
-- Real EF Core / Prisma migrations remain owned by service owners.
-- =============================================================================

-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Application roles (local-dev passwords only)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'identity_app') THEN
    CREATE ROLE identity_app LOGIN PASSWORD 'identity_local_dev_only';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'core_app') THEN
    CREATE ROLE core_app LOGIN PASSWORD 'core_local_dev_only';
  END IF;
END
$$;

-- Schemas
CREATE SCHEMA IF NOT EXISTS identity AUTHORIZATION identity_app;
CREATE SCHEMA IF NOT EXISTS core AUTHORIZATION core_app;

GRANT CONNECT ON DATABASE shiftcore TO identity_app;
GRANT CONNECT ON DATABASE shiftcore TO core_app;

-- Grant each service full ownership of their own schema
-- EF Core (identity_app) and Prisma (core_app) create their own tables via migrations
GRANT USAGE, CREATE ON SCHEMA identity TO identity_app;
GRANT USAGE, CREATE ON SCHEMA core TO core_app;

-- Note:
-- - Cross-schema foreign keys are forbidden.
-- - Core schema tables stay empty here (owned by Prisma / Abo El Ala).
-- - AI has no schema in this release.


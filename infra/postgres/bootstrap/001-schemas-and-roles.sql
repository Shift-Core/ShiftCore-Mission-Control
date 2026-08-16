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

-- =============================================================================
-- Minimal identity tables for seeded login (local / release slice only)
-- Full model + EF Core migrations are owned by Mohamed Tawfik
-- =============================================================================



-- =============================================================================
-- Three seeded users (local-dev only)
-- Password for all three: "Password123!"
-- 1. Super     → platform-level access
-- 2. Core      → Core API / product workflow owner
-- 3. Identity  → Identity API / auth owner
-- =============================================================================

SET search_path TO public;

-- Note:
-- - Cross-schema foreign keys are forbidden.
-- - Core schema tables stay empty here (owned by Prisma / Abo El Ala).
-- - AI has no schema in this release.

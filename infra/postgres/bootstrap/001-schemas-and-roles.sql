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

SET search_path TO identity;

CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name          TEXT NOT NULL,
    role          TEXT NOT NULL,          -- maps to JWT "role" claim
    team_id       UUID NOT NULL,          -- maps to JWT "teamId" claim
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now() AT TIME ZONE 'UTC',
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now() AT TIME ZONE 'UTC'
);

ALTER TABLE users OWNER TO identity_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO identity_app;

-- =============================================================================
-- Three seeded users (local-dev only)
-- Password for all three: "Password123!"
-- 1. Super     → platform-level access
-- 2. Core      → Core API / product workflow owner
-- 3. Identity  → Identity API / auth owner
-- =============================================================================

INSERT INTO users (id, email, password_hash, name, role, team_id)
VALUES
  (
    '11111111-1111-4111-8111-111111111111',
    'super@shiftcore.local',
    '$2b$11$PFulOXkr4Td3YXLxoB.mLORGV6P44cWHch865DS2bBjwrkZezfawy',  -- Password123!
    'Super Admin',
    'Super',
    '00000000-0000-4000-8000-000000000001'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'core@shiftcore.local',
    '$2b$11$PFulOXkr4Td3YXLxoB.mLORGV6P44cWHch865DS2bBjwrkZezfawy',  -- Password123!
    'Core Owner',
    'Core',
    '00000000-0000-4000-8000-000000000001'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'identity@shiftcore.local',
    '$2b$11$PFulOXkr4Td3YXLxoB.mLORGV6P44cWHch865DS2bBjwrkZezfawy',  -- Password123!
    'Identity Owner',
    'Identity',
    '00000000-0000-4000-8000-000000000001'
  )
ON CONFLICT (email) DO NOTHING;

SET search_path TO public;

-- Note:
-- - Cross-schema foreign keys are forbidden.
-- - Core schema tables stay empty here (owned by Prisma / Abo El Ala).
-- - AI has no schema in this release.

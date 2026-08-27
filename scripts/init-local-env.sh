#!/usr/bin/env bash
# =============================================================================
# ShiftCore Mission Control - Local Environment Initializer
# Creates the local environment file and validates the completed Compose stack.
# =============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> ShiftCore local environment initializer"
echo "    Root: $ROOT_DIR"

# 1. Ensure .env exists from the contract example
if [[ -f .env ]]; then
  echo "    .env already exists — leaving it untouched"
else
  if [[ ! -f .env.example ]]; then
    echo "ERROR: .env.example is missing. Aborting." >&2
    exit 1
  fi
  cp .env.example .env
  echo "    Created .env from .env.example"
fi

# 2. Sanity checks (no real provider key required for the deterministic release)
if grep -qE '^[[:space:]]*AI_API_KEY=[^[:space:]#]+' .env 2>/dev/null; then
  echo "WARNING: AI_API_KEY appears to be set. The committed release path does not require a real provider key."
fi

# 3. Confirm the completed monorepo structure is present
REQUIRED_DIRS=(
  apps/web
  services/identity
  services/core
  services/ai
  infra/nginx
  infra/postgres/bootstrap
  contracts
  scripts
  docs
)

for d in "${REQUIRED_DIRS[@]}"; do
  if [[ ! -d "$d" ]]; then
    echo "ERROR: Required directory missing: $d" >&2
    exit 1
  fi
done
echo "    Required monorepo directories present"

# 4. Validate the Compose configuration without starting containers
if command -v docker >/dev/null 2>&1; then
  echo "    Validating docker compose configuration..."
  if docker compose config --quiet; then
    echo "    docker compose config: OK"
  else
    echo "ERROR: docker compose config failed" >&2
    exit 1
  fi
else
  echo "    docker not found — skipping compose validation (install Docker to enable)"
fi

echo ""
echo "==> Local environment is ready."
echo "    Next steps:"
echo "      ./scripts/generate-jwt-keys.sh"
echo "      docker compose up -d --build"
echo "      docker compose exec core yarn db:seed"
echo "      ./scripts/smoke-test.sh"
echo ""

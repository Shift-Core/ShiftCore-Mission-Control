#!/usr/bin/env bash
# =============================================================================
# ShiftCore Mission Control - Safe Local Environment Initializer (R24-04)
# AC-2: Runs from a clean clone without a real provider key or committed secret.
# This is configuration validation only — not an application build or runtime claim.
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

# 2. Sanity checks (no secrets, no real provider key required)
if grep -qE '^[[:space:]]*AI_API_KEY=[^[:space:]#]+' .env 2>/dev/null; then
  echo "WARNING: AI_API_KEY appears to be set. The committed release path does not require a real provider key."
fi

# 3. Confirm required directories exist (contract only)
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

# 4. Validate Compose configuration (no build, no start)
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
echo "==> Local environment contract is ready."
echo "    Next steps (owned by service owners, out of scope for R24-04):"
echo "      - Implement real Dockerfiles and application code"
echo "      - Add migrations / seeds under identity and core schemas"
echo "      - Finalize Nginx routing"
echo ""
echo "    Safe commands for this bootstrap:"
echo "      docker compose config          # validate only"
echo "      cat .env                       # inspect (contains only local-dev placeholders)"
echo ""
